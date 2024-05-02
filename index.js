// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


let responseObject = {};
app.get("/api/:date", (req, res) => {
  let dateString = req.params.date;
  const date = new Date(dateString);
  const utcDateString = date.toUTCString();
  
  if(dateString.includes("-")) {
    responseObject.unix = date.getTime();
    responseObject.utc = utcDateString; 
  } else {
    dateString = parseInt(dateString);
    responseObject.unix = new Date(dateString).getTime();
    responseObject.utc = new Date(dateString).toUTCString(); 
  }
  if(!responseObject["unix"] || !responseObject['utc']) {
    res.json({error: "Invalid date"});
  }

  res.json(responseObject);
});

app.get("/api", (req, res) => {
  const currentTime = new Date();
  // const unixTime = Math.floor(currentTime / 1000).getTime();
  res.json({'unix': currentTime.getTime(), 'utc': currentTime.toLocaleTimeString()});
});






// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
