// index.js
// where your node app starts
const os = require('os');

// init project
require('dotenv').config();
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
const accepts = require('accepts');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// Get the netwrok interfaces
const networkInterfaces = os.networkInterfaces();
// Find the IPV4 address
const address = Object.values(networkInterfaces)
.flat().filter((interface) => interface.family  === "IPv4" && !interface.internal)
.map((interface) => interface.address)[0];

app.get('/api/whoami', (req, res) => {
  // const accepts = accepts(req);
  const language = req.headers['accept-language'] || 'en';
  const software = req.headers['user-agent'];
  res.json({
    ipaddress: address, 
    language: language,
    software: software,
  });
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
