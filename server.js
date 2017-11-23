const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser());

app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();

  if (req.body.Body == 'F21') {
    twiml.message('The current deal is 50% off marked item');
  } else if(req.body.Body == 'Sephora') {
    twiml.message('Gobble up today’s new online-only deals.Check out https://www.sephora.com/');
  } else {
    twiml.message('Get ready for Black Friday! Check out the deals from F21 and Sephora');
  }

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});