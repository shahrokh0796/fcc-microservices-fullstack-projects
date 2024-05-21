require('dotenv').config();
const validUrl = require('valid-url');
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
  let original_url = req.body.url;
    if(!original_url || !validUrl.isWebUri(original_url)) {
      return res.json({error: "invalid url"})
    }

    const short_url = `${shortid.generate()}`;
    urlDatabase[short_url] = original_url;
    res.json({original_url, short_url});
  });

  app.get('/:short_url', (req, res) => {
    const { short_url } = req.params;
    const original_url = urlDatabase[`/${short_url}`];
    if(!original_url) {
      return res.json({error: 'invalid url'});
    }

    res.redirect(original_url);
  });

  app.get('/api/shorturl/:short_url', (req, res) => {
    const { short_url } = req.params;
    const original_url = urlDatabase[short_url];
    if (!original_url) {
      return res.json({ error: 'invalid url' });
    }
  
    res.redirect(original_url);
  });

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
