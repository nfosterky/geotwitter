#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
// var d       = require('./twitterData.js');
//
var envVars = "";

if (!process.env.TWITTER_CONSUMER_KEY) {
  envVars = require("./envVars.js");
  envVars.add();
}

var d = {
  html: [],
  rawTweets: [],
  getData: function (req, res, spec) {
    var Twitter = require("twitter");

    var client = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    var geocode = spec ? spec : '40.7207919,-74.0007582,0.5km';
    var geoElems = geocode.split(","),
      lat = geoElems[0]
      lon = geoElems[1],
      rad = geoElems[2];

    var now = new Date(),
      year = now.getFullYear(),
      month = now.getMonth() + 1, // js months are zero based
      day = now.getDate() - 2,    // only show day old tweets
      twoDaysAgo = year + "-" + month + "-" + day;

    /*
     *  geocode: lat,lon,radius
     *  count: defaults to 15, max is 100
     *  result_type: recent, popular, mixed
     *  until: 2012-09-01 // tweets before date
     */
    var options = {
      geocode: geocode,
      count: 100,
      until: twoDaysAgo
    };

    client.get('search/tweets', options, function(error, params,
        response){

      var tweetList = [],
        tweetHtml = "",
        rawTweet,
        newTweet,
        results;

      if (error) {
        console.log("error: " + JSON.stringify(error));
        throw error;
      }

      if (params && params.hasOwnProperty("statuses")) {
        results = params.statuses;

        d.rawTweets = results;

        for (var i = 0, l = results.length; i < l; i++) {
          rawTweet = results[i];

          newTweet = {
            id          : rawTweet.id_str,
            lat         : rawTweet.geo.coordinates[0] - lat,
            lon         : rawTweet.geo.coordinates[1] - lon,
            text        : rawTweet.text,
            datetime    : rawTweet.created_at,
            screen_name : rawTweet.user.screen_name
          };

          tweetHtml += "<div class='tweet'>" +
              "<div>latitude: " + newTweet.lat + "</div>" +
              "<div>longitude: "+ newTweet.lon + "</div>" +
              "<div>text: "+ newTweet.text + "</div>" +
              "<div>date: "+ newTweet.datetime + "</div>" +
              "<div>screen_name: "+ newTweet.screen_name + "</div>" +
              "</div>";

          tweetList[i] = newTweet;
        }


        // res.setHeader('Content-Type', 'text/html');
        // res.send(tweetHtml);
        try {
          res.render("index", { tweets: tweetList });
        } catch (error) {
          console.warn(error);
          res.setHeader('Content-Type', 'text/html');
          res.send("error");
          throw(error);
        }


      } else {
        res.setHeader('Content-Type', 'text/html');
        res.send("fail");
      }

    });
  },
  getTweetWidget: function (req, res, tweetId) {
    var Twitter = require("twitter");

    var client = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    client.get('statuses/oembed', {id: tweetId}, function(error, params,
      response){

        if (error) {
          console.log(error);
        }

        if (params) {
          d.html.push(params.html);

          if (d.html.length === d.rawTweets.length) {
            console.log("show me some html");
            res.setHeader('Content-Type', 'text/html');
            res.send(d.html.join(""));
          }
        }

        if (response) {
          // console.log("response");
          // console.log(response);
        }

    });
  }
};

/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ==============================================================  */
    /*  Helper functions.                                               */
    /*  ==============================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
      //  Set the environment variables we need.
      self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
      self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

      if (typeof self.ipaddress === "undefined") {
        //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
        //  allows us to run/test the app locally.
        console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');

        // use 0.0.0.0 when using vagrant vm, set in envVars.js
        self.ipaddress = "127.0.0.1";
      }
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
      if (typeof self.zcache === "undefined") {
        self.zcache = { 'varWeb.html': '' };
      }

      //  Local cache for static content.
      self.zcache['index.html'] = fs.readFileSync('./index.html');
      self.zcache['varWeb.html'] = fs.readFileSync('./varWeb.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from
     *  cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ==============================================================  */
    /*  App server functions (main app logic here).                     */
    /*  ==============================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = {};

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };

        self.routes['/varWeb'] = function(req, res) {
          res.setHeader('Content-Type', 'text/html');
          res.send(self.cache_get('varWeb.html') );
        };

        self.routes['/test/:geocode'] = function(req, res) {
          d.getData(req, res, req.params.geocode);
        };

    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        self.app.set("view engine", "jade");
        console.warn("resolve jade");
        console.warn(require.resolve("jade"))

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
          self.app.get(r, self.routes[r]);
        }

        // add subfolders -- needed to load js and css
        self.app.use("/css", express.static(__dirname + '/css'));
        self.app.use("/js", express.static(__dirname + '/js'));
        self.app.use("/views", express.static(__dirname + '/views'));
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
          console.log('%s: Node server started on %s:%d ...',
              Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();
