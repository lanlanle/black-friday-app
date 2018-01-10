var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
const subscription= require('./deals.json');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var moment = require('moment');
var db = mongoose.connection;

var Deal = require('./models/deal');


/***
  GMAIL API setup from Google Quickstart
*/
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';
function intervalFunc() {
  console.log('Script starts');
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    /**
    Call the API here 
    */
    authorize(JSON.parse(content),listMessages);
  });

} 

function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}


/*START HERE*/

function listMessages(auth) {
  var dealObj = []
  subscription.deals.forEach(function(brand){
      var gmail = google.gmail('v1');
      gmail.users.messages.list({
         auth: auth,
         userId:'me',
         q: 'from:'+ brand.mail,
         maxResults:1
      },function(err,response){
          if (err){
            console.log('The API returned an error: ' + err);
            return;
          }else{
            var emailID = response.messages[0].id;
            gmail.users.messages.get({
              auth: auth,
              userId:'me',
              id:emailID
            },function(err,response){
              if (err){
                console.log('The API returned an error: ' + err);
                return;

              }else{  
                Deal.updateDeal(brand.name,response.snippet,response.internalDate).then((result)=> {
                  //find and update
                  if (result == null){
                    // write deal to database
                    var newDeal = new Deal({
                      name:brand.name,
                      deal:response.snippet,
                      time:response.internalDate
                    })

                    Deal.createDeal(newDeal,function(err,deal){
                      if (err) throw err;
                      console.log(deal);
                    })
                  }else {
                    console.log("Updated result :", result)
                  }

                })
                

              }
                
            })

          }
      });
  })
  
}



setInterval(intervalFunc, 86400000);
