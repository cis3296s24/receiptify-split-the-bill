const os = require('os');
const readline = require('readline');

/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
const express = require('express'); // Express web server framework
const request = require('request');

const axios = require('axios');
// const axios = require("axios"); // "Request" library
// const bodyParser = require("body-parser");
// const cors = require("cors");
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const jwt = require('jsonwebtoken');
// const https = require("https");
// const exphbs = require("express-handlebars");
const cors = require('cors');
// const { config } = require("./config");
require('dotenv').config();


const client_id = '82641df2811b48b493da744446b6b90f';
const client_secret = 'e48944809f164d768c38ca1e9d850021';
//const privateKey = fs.readFileSync('AuthKey_A8FKGGUQP3.p8').toString();
const teamId = process.env.teamId;
const keyId = process.env.keyId;


const networkInterfaces = os.networkInterfaces();

let serverIP;

for (const name of Object.keys(networkInterfaces)) {
  for (const address of networkInterfaces[name]) {
    if (address.family === 'IPv4' && !address.internal) { // Filter IPv4 and non-internal interfaces
      serverIP = address.address;
      break;
    }
  }
}

// // Open file for writing (creates a new file if it doesn't exist)
// fs.writeFile('filename.txt', 'New content to be written', (err) => {
//   if (err) throw err;
//   console.log('File has been written!');
// });

/**
 * redirect_uri must equal what is in the developer dashboard. If we move to server and have a static IP, then we can change to a set IP address.
 */
var redirect_uri = process.env.redirect_uri || `http://${serverIP}:3000/callback`; 
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated stringh
 */
var generateRandomString = function (length) {
  var text = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
var generateSessionID = function () {
  var text = '';
  var possible =
    '0123456789';

  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();
// app.engine("handlebars", exphbs({ defaultLayout: null }));
// app.set("view engine", "handlebars");
// app.set("views", __dirname + "/views");
app
  .use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

app.use((req, res, next) => {
  const ipAddress = req.socket.remoteAddress;
  console.log(`Incoming Connection: ${ipAddress}`);
  next();
})

app.get('/login', function (req, res) {
  console.log('/login');
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  // your application requests authorization
  // user-read-private & user-read-email used to get current user info
  // user-top-read used to get top track info
  var scope =
    'user-read-private user-read-email user-top-read playlist-modify-public';
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );

});

app.get('/join', function (req, res){
  console.log('/join');
  res.sendFile(__dirname + '/public/join.html')
});

app.get('/submit', function (req, res){
  console.log('/submit');
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  sessionIDString = 'sessionID'
  res.cookie(sessionIDString, req.query.sessionID);
  // your application requests authorization
  // user-read-private & user-read-email used to get current user info
  // user-top-read used to get top track info
  var scope =
    'user-read-private user-read-email user-top-read playlist-modify-public';
  res.set('sessionID', req.query.sessionID);
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
      })
  );

})
/*app.get('/applemusic', function (req, res) {
  const token = jwt.sign({}, privateKey, {
    algorithm: 'ES256',
    expiresIn: '180d',
    issuer: teamId,
    header: {
      alg: 'ES256',
      kid: keyId,
    },
  });

  res.redirect(
    '/#' +
      querystring.stringify({
        client: 'applemusic',
        dev_token: token,
      })
  );
  // res.redirect(
  //   'https://idmsa.apple.com/IDMSWebAuth/auth?' + querystring.stringify({})
  // );
  // let music = MusicKit.getInstance();
  // music.authorize().then(console.log('hello'));
  // res.sendFile(__dirname + '/public/applemusic.html');
});*/

/*app.get('/lastfm', function (req, res) {
  // res.redirect(
  //   "/#" +
  //     querystring.stringify({
  //       lastfmKey: lastfmKey,
  //       service: "lastfm"
  //     })
  // );
  res.sendFile(__dirname + '/public/lastfm.html');
});*/

async function fetchProfile(token) {
  const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}

app.get('/getUsers', async (req, res) =>{
  const sessionID = req.query.sessionID;
  users = await processFile('users.csv', sessionID);
  res.json(users);
});

async function processFile(filePath, sessionID) {
  try {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });
    const users = [];
    for await (const line of rl) {
      const row = line.split(',');
      if (row[2] == sessionID) {
        users.push(row[0]);
      }
    }
    await rl.close();

    return users;
  } catch (error) {
    console.error('Error Processing File: ', error);
    throw error;
  }
}

app.get('/callback', function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter
  sessionID = generateSessionID();
  sessionIDString = 'sessionID'
  if (req.cookies[sessionIDString] != null){
    sessionID = req.cookies[sessionIDString];
  }

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;


  if (state === null || state !== storedState) {
    res.redirect(
      '/#' +
        querystring.stringify({
          error: 'state_mismatch',
        })
    );
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization:
          //'Basic ' +
          //new Buffer(client_id + ':' + client_secret).toString('base64'),
          'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      },
      json: true,
    };

    request.post(authOptions, async function (error, response, body) {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        var access_token = body.access_token,
          refresh_token = body.refresh_token;
        const profile = await fetchProfile(access_token);
        res.redirect(
          '/#' +
            querystring.stringify({
              client: 'spotify',
              access_token: access_token,
              refresh_token: refresh_token,
              sessionID: sessionID
            })
        );
        
        // Gets time (year-month-day hour:min:sec)
        var currentDate = new Date();
        var access_time = currentDate.getFullYear() + '-' + (currentDate.getMonth()+1) + '-' + currentDate.getDate() + ' ' + 
          currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();
        console.log("Token Access Time: ", access_time);
        
        // Writing to users.csv (Database)
        fs.appendFile('users.csv', ('\n'+ profile.display_name + ',' + access_token +',' + sessionID + ','  + access_time + ','), (err) => {
          if (err) 
          {
            console.error('Error: Could not write to database.');
            return;
          } 
        });


        
        // res.redirect("/spotify");
        // console.log(retrieveTracksSpotify(access_token, "short_term", 1, "LAST MONTH"));
        // res.render("spotify", {
        //   shortTerm: retrieveTracksSpotify(access_token, "short_term", 1, "LAST MONTH"),
        //   mediumTerm: retrieveTracksSpotify(access_token, "medium_term", 2, "LAST 6 MONTHS"),
        //   longTerm: retrieveTracksSpotify(access_token, "long_term", 3, "ALL TIME")
        // });
      } else {
        res.send('There was an error during authentication.');
      }

    });
  }
});

app.get('/refresh_token', function (req, res) {
  // requesting access token from refresh token
  console.log("/refresh_token");
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        new Buffer(client_id + ':' + client_secret).toString('base64'),
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        access_token: access_token,
      });
    }
  });
});

app.use((req, res, next) =>{
  res.on('finish', () =>{
    const ipAddress = req.socket.remoteAddress;
    console.log(`Connection from ${ipAddress} has been closed.`);
  });
  next();
});

app.listen(process.env.PORT || 3000, function () {
  console.log(`Server is running on ${serverIP}:3000`);

});

