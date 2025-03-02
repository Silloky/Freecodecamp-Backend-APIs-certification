// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

app.use(express.static('public'));

app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/:date?", (req,res) => {
  var timestamp = req.params.date
  let date
  if (timestamp == undefined) {
    date = new Date()
  } else {
    if (!timestamp.match(/^\d{5,}$/)){
      timestamp = Date.parse(timestamp)
      if (!isNaN(timestamp)){
        date = new Date(timestamp)
      } else {
        res.json({
          error: "Invalid Date"
        })
        return;
      }
    } else {
      date = new Date(parseInt(timestamp))
    }
  }
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});





var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
