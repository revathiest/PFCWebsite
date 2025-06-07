const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_CALLBACK_URL,
} = process.env;

router.get('/discord/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_CALLBACK_URL,
        scope: 'identify guilds'
      })
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });

    const user = await userResponse.json();

    // TODO: Save user to session or generate your JWT
    // For now just print it and redirect
    console.log("Discord user info:", user);
    // res.redirect('/dashboard'); // or wherever
    res.json({ user }); // temporary

  } catch (err) {
    console.error('Error handling Discord callback:', err);
    res.status(500).send('OAuth2 callback error');
  }
});

module.exports = router;
