const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const scopes = ['identify'];

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/auth/discord/callback',
      scope: scopes,
    },
    (accessToken, refreshToken, profile, done) => {
      // For now just pass the profile along
      process.nextTick(() => done(null, profile));
    }
  )
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main index.html from the project root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/unauthorized.html');
}

app.get('/auth/discord', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'auth', 'discord.html'));
});

app.get('/auth/discord/redirect', passport.authenticate('discord'));

app.get(
  '/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/member');
  }
);

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.get('/member', checkAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'protected', 'member.html'));
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
