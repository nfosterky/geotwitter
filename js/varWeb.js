Zepto (function($) {

  var btnGetTweets  = document.getElementById("btnGetTweets"),
    eleCompass      = document.getElementById("compass"),
    eleLatitude     = document.getElementById("latitude"),
    eleLongitude    = document.getElementById("longitude"),
    lat, lon,
    compassDir;

  var options = {}, id;

  if (window.DeviceOrientationEvent) {

    // Listen for the deviceorientation event and handle the raw data
    window.addEventListener('deviceorientation', function(eventData) {
      var newCompassDir;

      if (event.webkitCompassHeading) {

        // Apple works only with this, alpha doesn't work
        newCompassDir = event.webkitCompassHeading;

      } else {
        newCompassDir = event.alpha;
      }

      newCompassDir = newCompassDir.toFixed(0);

      if (compassDir !== newCompassDir) {
        compassDir = newCompassDir;
        eleCompass.innerHTML = compassDir;
      }
    });
  }

  function posSuccess (d) {
    lat = d.coords.latitude;
    lon = d.coords.longitude;

    eleLatitude.innerHTML = lat;
    eleLongitude.innerHTML = lon;

    console.log(lat, lon);
  }

  function posError (e) {
    console.log(e);
  }

  // id can be used for something? maybe to stop watching position?
  id = navigator.geolocation.watchPosition(posSuccess, posError, options);

  btnGetTweets.onclick = function () {
    var radius = ".15km",  // use either mi or km
      geocode = lat + "," + lon + "," + radius;

    window.location.href = "/test/" + geocode;
  };

});
