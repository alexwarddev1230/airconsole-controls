/**
 * An object containing a configuration for the AirConsoleShakeDetector constructor.
 * @typedef {object} Config
     deadzone: 2,
     sensitivity: 3,
     invertX: false,
     invertY: false,
     horizontalOnly: false,
     verticalOnly: false,
 * @property {Function} tiltMove - The callback that gets called when tilting screen
 */

/**
 * @param {Config} opts - Constructor config.
 * @constructor
 */
var options = {};
var ball = null;
var backgroundElement = null

function AirConsoleMotionDetector(opts, elementId) {
  options = opts || {};
  ball = null;

  backgroundElement = document.getElementById(elementId)
  if(!backgroundElement){
    console.error("ERROR! Motion pad element not found!", elementId);
  }

  for (var i = 0; i < backgroundElement.childNodes.length; i++) {
    if (backgroundElement.childNodes[i].className == "motion-pad-ball") {
      ball = backgroundElement.childNodes[i];
      break;
    }
  }

  if(!ball){
    console.error("ERROR! Motion pad ball not found!", elementId);
  } else {
    console.error("Motion pad ball found!", ball);
  }

  setOrientationListener()
}

function setOrientationListener(){
  if ( typeof( DeviceMotionEvent ) !== "undefined" && typeof( DeviceMotionEvent.requestPermission ) === "function" ) {
    // (optional) Do something before API request prompt.
    DeviceMotionEvent.requestPermission()
        .then( response => {
          console.log(response)
          if ( response == "granted" ) {
            window.addEventListener( "deviceorientation", deviceOrientationFunction, true)
          }
        })
        .catch((error) => {
          console.error(error)

          if (error.message.includes("requires a user gesture")) {
            promptUser()
          }
        })
  } else {
    window.addEventListener( "deviceorientation", deviceOrientationFunction, true)
  }
}

function promptUser(){
  const modalText = document.getElementById('permission-modal-text')
  if (modalText) {
    modalText.innerText = "Grant motion detection permission for tilt controlls?"
    $('#permission_modal_button_click').click( function() {
      setOrientationListener()
    });

    const popupModal = $('#popupModalPermission')
    popupModal.modal('show')
  }
}
function deviceOrientationFunction() {
  // init params
  let deadzone = options.deadzone || 2;
  let sensitivity = options.sensitivity || 3;
  let invertX = options.invertX || false;
  let invertY = options.invertY || false;
  let horizontalOnly = options.horizontalOnly || false;
  let verticalOnly = options.verticalOnly || false;
  let tiltMove = options.tiltMove || function(data) { console.log ("Moving ...", data) };

  // run math
  var absolute = event.absolute;
  var alpha    = event.alpha;
  var beta     = event.beta;
  var gamma    = event.gamma;

  var x = event.beta;  // In degree in the range [-180,180)
  var y = event.gamma; // In degree in the range [-90,90)

  const ballPercentX = (ball.clientWidth / backgroundElement.clientWidth * 100) ;
  const ballPercentY = (ball.clientHeight / backgroundElement.clientHeight * 100);

  const eventData = {};
  y = normalizeInput(y, ballPercentY, deadzone, sensitivity, invertY);
  x = normalizeInput(x, ballPercentX, deadzone, sensitivity, invertX);

  eventData['x'] = ((x / (100 - ballPercentX)) - .5) * 2;
  eventData['y'] = ((y / (100 - ballPercentY)) - .5) * 2;

  ball.style.top = y + '%';
  ball.style.left = x + '%';

  if(verticalOnly){
    ball.style.left = (50 - (ballPercentX/2)) + '%'
    delete eventData['x'];
  }

  if(horizontalOnly){
    ball.style.top = (50 - (ballPercentY/2)) + '%'
    delete eventData['y'];
  }

  // Do stuff with the new orientation data
  tiltMove(eventData)
}

function normalizeInput(input, ballPercent, deadzone, sensitivity, invert){
  // add sensativity
  input = input * sensitivity;

  // remove deadzoned
  if (Math.abs(input) < deadzone){
    input = 0;
  }

  // handle inverting controlls
  if(invert){
    input *= - 1;
  }

  // convert to percentage for location
  input = input + 50 - (ballPercent / 2);

  // dont allow ball to go off screen
  if (input < 0){
    input = 0;
  } else if (input > (100 - ballPercent)){
    input = 100 - ballPercent;
  }
  return input;
}