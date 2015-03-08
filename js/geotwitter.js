// ;(function(data){
  var data = tweetList;
  var camera, scene, renderer, deviceControls;

  var clock = new THREE.Clock();

  var move = {
    forward: false,
    back: false,
    left: false,
    right: false
  };

  function init () {
    var ELEM_WIDTH = 200,
      ELEM_HEIGHT = 100;

    var isFullscreen = false;

    var tweetElement,
      tweetObject, tweet;

    if (typeof data !== undefined) {
      camera = new THREE.PerspectiveCamera(
        40, window.innerWidth / window.innerHeight, 1, 10000 );

      deviceControls = new THREE.DeviceOrientationControls( camera );

      scene = new THREE.Scene();

      for (var i = 0; i < data.length; i++) {
        tweet = data[i];

        tweetElement = document.createElement( 'div' );
        tweetElement.className = 'tweet';
        tweetElement.style.width = ELEM_WIDTH + 'px';
        tweetElement.style.height = ELEM_HEIGHT + 'px';
        tweetElement.innerHTML = tweet.text;

        tweetObject = new THREE.CSS3DObject( tweetElement );
        tweetObject.position.x = tweet.lat * 100000 * 50;

        // y could be determined by age of tweet
        tweetObject.position.y = Math.random() * 1000;
        tweetObject.position.z = tweet.lon * 100000 * 50;

        tweetObject.lookAt( camera.position );

        scene.add( tweetObject );
      }

      renderer = new THREE.CSS3DStereoRenderer();
      renderer.setSize( window.innerWidth, window.innerHeight );
      renderer.domElement.style.position = 'absolute';
      document.getElementById( 'container' )
        .appendChild( renderer.domElement );

      window.addEventListener( 'resize', onWindowResize, false );

      window.addEventListener( 'touchend', function () {

        if ( isFullscreen === false ) {

          document.body.webkitRequestFullscreen();

          isFullscreen = true;

        } else {

          document.webkitExitFullscreen();

          isFullscreen = false;

        }

      });

      // addMovementControls();

      animate();
    }
  }

  function animate () {
    requestAnimationFrame( animate );

    updateMovement();

    deviceControls.update();

    render();
  }

  function render () {
    renderer.render( scene, camera );
  }

  function onWindowResize () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

  }

  function updateMovement () {
    var delta = clock.getDelta(); // seconds.
  	var moveDistance = 200 * delta; // 200 pixels / second

    if (move.forward) {
      camera.translateZ( -moveDistance );
    }

    if (move.back) {
      camera.translateZ( moveDistance );
    }

    if (move.left) {
      camera.translateX( -moveDistance );
    }

    if (move.right) {
      camera.translateX( moveDistance );
    }

    if (move.up) {
      camera.translateY( moveDistance );
    }

    if (move.down) {
      camera.translateY( -moveDistance );
    }
  }

  window.onload = function() {
    init();
  }

// })(tweetList);
