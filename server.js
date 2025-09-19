const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');

// Generate VAPID keys once and keep them safe
const vapidKeys = webpush.generateVAPIDKeys();
webpush.setVapidDetails(
  'mailto:your@email.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const app = express();
let savedSubscription = null;

app.use(bodyParser.json());
app.use(express.static('public'));

// Serve VAPID public key to frontend
app.get('/vapidPublicKey', (req, res) => {
  res.send(vapidKeys.publicKey);
});

// Save the subscription object from browser
app.post('/subscribe', (req, res) => {
  savedSubscription = req.body;
  res.sendStatus(201);
});

// Send push notification with custom content
app.post('/sendNotification', async (req, res) => {
  if (!savedSubscription) return res.status(400).send('No subscription');
  const { title, body } = req.body;
  try {
    await webpush.sendNotification(savedSubscription, JSON.stringify({ title, body }));
    res.sendStatus(201);
  } catch (err) {
    res.status(500).send('Error sending notification');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server started on http://localhost:' + PORT);
});
