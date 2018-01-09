if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNTSID, process.env.TWILIO_AUTHTOKEN);
const ClientCapability = require('twilio').jwt.ClientCapability;
const bodyParser = require('body-parser');

var Deal = require('./models/deal');

const app = express();

app.use(bodyParser());


app.get('/token', (req, res) => {

  const capability = new ClientCapability({
    accountSid: process.env.TWILIO_ACCOUNTSID,
    authToken: process.env.TWILIO_AUTHTOKEN,
  });
  capability.addScope(
    new ClientCapability.OutgoingClientScope({ applicationSid: process.env.TWILIO_APPSID })
  );
  capability.addScope(new ClientCapability.IncomingClientScope('joey'));
  const token = capability.toJwt();

  res.set('Content-Type', 'application/jwt');
  res.send(token);
});

app.post('/sms', (req, res) => {
  console.log(req)
  var dealRequest = req.body.Body.trim();
  Deal.findDeal(dealRequest).then((result) => {
  		
  		const twiml = new MessagingResponse();
	    var newDeal = result;

      if (newDeal ==null) {
        if(req.body.Body=="STORE"){
          twiml.message('Avaiable Stores: SHEIN,Charlotte Russe, Forever 21, Sephora, Macys, Target. Text the name of the store to get the current deal!')
        }else {
          twiml.message('Want to get deals from your favorite stores? Text STORE to check all the stores in our service');
        }  
      } else {
        //write a function to remove unwanted string 

        var msg = convertCharacters(newDeal.deal);
        twiml.message(msg);

      }     	  	
      res.set('Content-Type', 'text/xml');
      res.status(200).send(twiml.toString());

	  }).catch((err) => {
	  		throw err;
		    
	  })
  
});

var PORT = process.env.PORT || 1337;
http.createServer(app).listen(PORT, () => {
  console.log('Express server listening on port',PORT);
});

var entities = {
  '&amp;': 'and',
  '&apos;': '\'',
  '&#x27;': '\'',
  '&#x2F;': '/',
  '&#39;': '\'',
  '&#47;': '/',
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
  '&quot;': '"'
}

// string replace function 
function convertCharacters(text){
	var newText;
	for (var key in entities){
		if (text.includes(key)){
			var newText = text.replace(new RegExp(key, 'g'),entities[key]);
		}
	}
	return newText;
}
