// proxy.js
const express = require('express');
const app = express();

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL manquante');

  try {
    const response = await fetch(targetUrl);
    let html = await response.text();

    // On réécrit les liens relatifs en absolus pour que CSS/JS/images se chargent
    const base = new URL(targetUrl);
    html = html.replace(
      /(href|src)="\/(?!\/)/g,
      `$1="${base.origin}/`
    );

    res.set('Content-Type', 'text/html');
    // On ne renvoie PAS les en-têtes CSP/X-Frame-Options d'origine
    res.send(html);
  } catch (err) {
    res.status(500).send('Impossible de charger la ressource');
  }
});

app.listen(3000);