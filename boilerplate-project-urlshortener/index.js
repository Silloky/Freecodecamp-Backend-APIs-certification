require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const valid_url = require('valid-url')

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const AutoIncrement = require('mongoose-sequence')(mongoose)

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


const shortUrlSchema = mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
})
shortUrlSchema.plugin(AutoIncrement, {inc_field: 'short_url'})

const shortUrlModel = mongoose.model('shorturls', shortUrlSchema)


app.post('/api/shorturl', async (req, res) => {
  const originalUrl = req.body.url
  console.log(originalUrl)
  if (valid_url.isWebUri(originalUrl)) {
    try {
      let document = await shortUrlModel.findOne({ original_url: originalUrl });
      if (document) {
        res.json({ original_url: originalUrl, short_url: document.short_url });
      } else {
        document = new shortUrlModel({ original_url: originalUrl });
        await document.save();
        res.json({ original_url: originalUrl, short_url: document.short_url });
      }
    } catch (err) {
      res.json({ error: "could not create short url" });
    }
  } else {
    res.json({ error: "invalid url" });
  }
})

app.get('/api/shorturl/:short_url', async (req, res) => {
  const shortUrl = req.params.short_url
  try {
    const document = await shortUrlModel.findOne({ short_url: shortUrl });
    if (document) {
      res.redirect(document.original_url);
    } else {
      res.send("could not find short url");
    }
  } catch (err) {
    res.json({ error: "could not find short url" });
  }
})



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
