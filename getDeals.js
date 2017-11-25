var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

/***
  GMAIL API setup from Google Quickstart
*/
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  /**
  Call the API here 
  */
  authorize(JSON.parse(content), listMessages);
  // listMessages("Orchid.MagnoliaLe@gmail.com","from:forever21@news.forever21.com")
});


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


/* Example Function */

// function listLabels(auth) {
//   var gmail = google.gmail('v1');
//   gmail.users.labels.list({
//     auth: auth,
//     userId: 'me',
//   }, function(err, response) {
//     if (err) {
//       console.log('The API returned an error: ' + err);
//       return;
//     }
//     var labels = response.labels;
//     if (labels.length == 0) {
//       console.log('No labels found.');
//     } else {
//       console.log('Labels:');
//       for (var i = 0; i < labels.length; i++) {
//         var label = labels[i];
//         console.log('- %s', label.name);
//       }
//     }
//   });
// }


/*START HERE*/

function listMessages(auth) {
  var gmail = google.gmail('v1');
  gmail.users.messages.list({
     auth: auth,
     userId:'me',
    'q': 'from:forever21@news.forever21.com',
    'maxResults':1
  },function(err,response){
      if (err){
        console.log('The API returned an error: ' + err);
        return;
      }else{
        var emailID = response.messages[0].id;
        gmail.users.messages.get({
          auth: auth,
          userId:'me',
          'id':emailID
        },function(err,response){
          if (err){
            console.log('The API returned an error: ' + err);
            return;
          }else{
            console.log(response.snippet);
          }
        })
      }
  });
  
}

