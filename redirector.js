// A simple server that redirects all traffic to our Expo app
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Redirect all requests to our Expo app
app.use((req, res) => {
  // Force to http since we're in a dev environment
  res.redirect(302, 'http://localhost:5000');
});

app.listen(port, () => {
  console.log(`Redirector running on port ${port}`);
});