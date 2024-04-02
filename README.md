# Receiptify: Split the Bill

Receiptify: Split the Bill is inspired by the original Receiptify, a web application that generates receipts that lists out a user's top tracks in the past, month, 6 months, and all time. Our version of receiptify generates receipts based on a group of users in a session. Our application generates a combined music receipt that displays a compiled list of all users' top tracks in the past, month, 6 months, and all time.

Web application inspired by https://www.instagram.com/albumreceipts/. Generates receipts that list out a user's top tracks in the past month, 6 months, and all time.

The application inspired by https://receiptify.herokuapp.com/. Generates receipts on a website for a single user's spotify data.

## Running the App Locally

This app runs on Node.js. On [its website](http://www.nodejs.org/download/) you can find instructions on how to install it. You can also follow [this gist](https://gist.github.com/isaacs/579814) for a quick and easy way to install Node.js and npm.

Once installed, clone the repository and install its dependencies running:

    $ npm install

### Using your own credentials

You will need to register your app and get your own credentials from the Spotify for Developers Dashboard.

To do so, go to [your Spotify for Developers Dashboard](https://beta.developer.spotify.com/dashboard) and create your application. In my own development process, I registered these Redirect URIs:

- http://localhost:3000 (needed for the implicit grant flow)
- http://localhost:3000/callback

Once you have created your app, load the `client_id`, `redirect_uri` and `client_secret` into a `config.js` file.

In order to run the app, open the folder, and run its `app.js` file:

    $ cd authorization_code
    $ node app.js

Then, open `http://localhost:3000` in a browser.

#### Hosting the App Locally

To allow users to access your app, you need to add them into user managment from the Spotify for Developers Dashboard.

When hosting, set the Redirect URI as:
- http://[serverIP]:3000 (needed for implicit grant flow)
- http://[serverIP]:3000/callback

Setting Redirect URI as http://localhost:3000/callback when trying to host the application for local clients to connect to will fail because the redirect URI points to the client's IP address (localhost).


