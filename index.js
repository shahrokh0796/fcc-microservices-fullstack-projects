require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const urlDatabase = {};
app.post('/api/shorturl', (req, res) => {
  let originalUrl = req.body.url;
    if(!originalUrl) {
      return res.status(400).json({error: "Missing URL in request body"})
    }

    const shortUrl = `http://localhost:${port}/${shortid.generate()}`;
    urlDatabase[shortUrl] = originalUrl;
    res.json({originalUrl, shortUrl});
  });

  app.get('/:shortUrl', (req, res) => {
    const { shortUrl } = req.params;
    const originalUrl = urlDatabase[`http://localhost${port}/${shortUrl}`];
    if(!originalUrl) {
      return res.status(404).json({error: 'Short URL not found'});
    }

    res.redirect(originalUrl);
  });

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
