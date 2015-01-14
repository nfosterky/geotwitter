#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
// var d       = require('./twitterData.js');
var d = {
  getData: function (req, res, spec) {
    var Twitter = require("twitter");

    var client = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    var lat   = spec.lat ? spec.lat : '40.7207919',
    lon     = spec.lon ? spec.lon : '-74.0007582',
    r       = spec.radius ? spec.radius : '0.5km',
    geocode = [lat, lon, r].join(',');

    console.log(spec);
    console.log("geocode: " + geocode);

    var options = {
      geocode: geocode,
      count: 100,
      result_type: 'recent'
    };

    client.get('search/tweets', options, function(error, params, response){
      var rawTweet, newTweet,
      tweetList = [],
      results;

      if (error) {
        console.log("error");
        console.log(JSON.stringify(error));
        throw error;
      }

      if (params && params.hasOwnProperty("statuses")) {
        results = params.statuses;

        console.log(results.length);
        for (var i = 0, l = results.length; i < l; i++) {
          twt = results[i];

          newTweet = {
            id          : twt.id_str,
            lat         : twt.geo.coordinates[0],
            lon         : twt.geo.coordinates[1],
            text        : twt.text,
            datetime    : twt.created_at,
            screen_name : twt.user.screen_name
          };

          tweetList[i] = newTweet;
        }

        res.setHeader('Content-Type', 'text/html');
        res.send("test");
        // console.log(tweetList);

      } else {
        res.setHeader('Content-Type', 'text/html');
        res.send("fail");
      }
      // console.log(JSON.stringify(response));  // Raw response object.
    });
  }
};

/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

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
            self.ipaddress = "127.0.0.1";
        }
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
            self.zcache = { 'varWeb.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
        self.zcache['varWeb.html'] = fs.readFileSync('./varWeb.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
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


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };

        self.routes['/varWeb'] = function(req, res) {
          console.log(req);
          res.setHeader('Content-Type', 'text/html');
          res.send(self.cache_get('varWeb.html') );
        };

        self.routes['/test'] = function(req, res) {
          // d.getTest(req, res);
          res.setHeader('Content-Type', 'text/html');
          res.send(tweetList);

        };

    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
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
