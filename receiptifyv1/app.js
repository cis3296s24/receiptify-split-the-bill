const os = require('os');


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


const client_id = '035844db2ccb4d0698ab8e14bb12f27a';
const client_secret = '8bfd5a9fa7a44aedbf8bf8f513236b4f';
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
  const sessionID = req.query.sessionID;
  console.log(`Incoming Connection: ${ipAddress}`);
  next();
})

app.get('/login', function (req, res) {
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


app.get('/session', function (req, res){
  const sessionID = req.query.sessionID;
  console.log("Connection Attempting to Join Session: " + sessionID)
  res.sendFile(__dirname + '/public/session.html', {sessionID: sessionID});
});

//app.get('/login', function (req, res) {
 // console.log("it be working");
//});

// how do i find all users currently in the session right now
// instead of making it live, add as we go, but show status of the user.
// when a logging in track spotify user id (user authentication) 

app.get('/join', function (req, res){
  res.sendFile(__dirname + '/public/join.html')
});

app.get('/submit', function (req, res){
  console.log(`/submit SessionID: ${req.query.sessionID}`);
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
});




app.get('/applemusic', function (req, res) {
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
});

app.get('/lastfm', function (req, res) {
  // res.redirect(
  //   "/#" +
  //     querystring.stringify({
  //       lastfmKey: lastfmKey,
  //       service: "lastfm"
  //     })
  // );
  res.sendFile(__dirname + '/public/lastfm.html');
});

app.get('/callback', function (req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter
sessionID = generateSessionID();
sessionIDString = 'sessionID'
if (req.cookies[sessionIDString] != null){
  sessionID = req.cookies[sessionIDString];
}
console.log(`/callback sessionID: ` + sessionID);
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

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        var access_token = body.access_token,
          refresh_token = body.refresh_token;

        res.redirect(
          '/#' +
            querystring.stringify({
              client: 'spotify',
              access_token: access_token,
              refresh_token: refresh_token,
              sessionID: sessionID // add the session ID
            })
        );
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
