// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const contentRoutes = require('./routes/content');

const app = express();

// Session config
app.use(session({
  secret: 'super-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Passport config
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify']
  }, (accessToken, refreshToken, profile, done) => {
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);
    console.log("Profile:", profile);
    process.nextTick(() => done(null, profile));
  }));
  
  

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/content', contentRoutes);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', (req, res, next) => {
    passport.authenticate('discord', (err, user, info) => {
      if (err) {
        console.error("OAuth2 Error:", err);
        console.error("OAuth2 Error:", info);
        return res.status(500).send("OAuth2 Error: " + err.message);
      }
      if (!user) return res.redirect('/');
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login Error:", err);
          return res.status(500).send("Login Error");
        }
        return res.redirect('/member');
      });
    })(req, res, next);
  });
  

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

app.get('/member', ensureAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'member.html'));
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));