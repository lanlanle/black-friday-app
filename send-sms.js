const accountSid = "AC8b868a7206f2a8688c71780eec8b3109"
const authToken = "6a26497ffe64539d8c96d238070c2ea6"

const client = require('twilio')(accountSid,authToken);
client.messages.create({
	to:'+17402818277',
	from:'+12169105265',
	body:'This is the test message'
})
.then((message)=>console.log(message.body));