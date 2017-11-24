const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const currentDeals= require('./current-deals.json')

const app = express();

app.use(bodyParser());

app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();

  if (currentDeals.hasOwnProperty(req.body.Body)) {
    twiml.message(currentDeals[req.body.Body]);
  }	else {
    twiml.message('Get ready for Black Friday! Check out the deals from Forever21, SHEIN, Sephora and Charlotte Russe by texting name of the brand');
  }

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});