module.exports = {

  getData: function (spec) {
    var Twitter = require("twitter");

    var client = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });

    var lat   = spec.lat,     // '40.7207919',
      lon     = spec.lon,     // '-74.0007582',
      r       = spec.radius,  // '0.5km',
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

        console.log(tweetList);
      }
      // console.log(JSON.stringify(response));  // Raw response object.
    });
  }
};
