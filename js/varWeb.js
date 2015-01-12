var eleCompass = document.getElementById("compass"),
  eleLatitude = document.getElementById("latitude"),
  eleLongitude = document.getElementById("longitude"),
  compassDir;

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
  console.log(d);
  var lat = d.coords.latitude,
    lon = d.coords.longitude;

  eleLatitude.innerHTML = lat;
  eleLongitude.innerHTML = lon;

  console.log(lat, lon);
}

function posError (e) {
  console.log(e);
}

var options = {};
var id = navigator.geolocation.watchPosition(posSuccess, posError, options);
