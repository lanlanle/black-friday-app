const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');

var Deal = require('./models/deal');

const app = express();

app.use(bodyParser());

app.post('/sms', (req, res) => {
 

  var dealRequest = req.body.Body
  Deal.findDeal(dealRequest).then((result) => {
  		
  		const twiml = new MessagingResponse();
	    var newDeal = result;

	    if (newDeal ==null) {
  			if(req.body.Body=="STORE"){
	  			twiml.message('Avaiable Store: SHEIN,Charlotte Russe, Forever 21, Sephora, Macys, Target. Text the name of the store to get the current deal!')
	  		}else {
	    		twiml.message('Want to get deals from your favorite store? Text STORE to check all the stores in our service');
	  		}  
  		} else {
  			twiml.message(newDeal.deal);
  		}	  	

	  	res.writeHead(200, {'Content-Type': 'text/xml'});
  		res.end(twiml.toString()); 

	  }).catch((err) => {
	  		throw err;
		    
	  })
  
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});