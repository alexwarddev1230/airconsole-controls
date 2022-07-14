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
function AirConsoleMotionDetector(opts, elementId) {
  opts = opts || {};
  this.deadzone = opts.deadzone || 2;
  this.sensitivity = opts.sensitivity || 3;
  this.invertX = opts.invertX || false;
  this.invertY = opts.invertY || false;
  this.horizontalOnly = opts.horizontalOnly || false;
  this.verticalOnly = opts.verticalOnly || false;

  this.tiltMove = opts.tiltMove || function(data) { console.log ("Moving ...", data) };

  const backgroundElement = document.getElementById(elementId)

  if(!backgroundElement){
    console.error("ERROR! Motion pad element not found!", elementId);
  }

  var ball = null;
  for (var i = 0; i < backgroundElement.childNodes.length; i++) {
    if (backgroundElement.childNodes[i].className == "motion-pad-ball") {
      ball = backgroundElement.childNodes[i];
      break;
    }
  }

  if(!ball){
    console.error("ERROR! Motion pad ball not found!", elementId);
  }

  window.addEventListener("deviceorientation", () => {
    var absolute = event.absolute;
    var alpha    = event.alpha;
    var beta     = event.beta;
    var gamma    = event.gamma;

    var x = event.beta;  // In degree in the range [-180,180)
    var y = event.gamma; // In degree in the range [-90,90)

    const ballPercentX = (ball.clientWidth / backgroundElement.clientWidth * 100) ;
    const ballPercentY = (ball.clientHeight / backgroundElement.clientHeight * 100);

    const eventData = {};
    y = normalizeInput(y, ballPercentY, this.deadzone, this.sensitivity, this.invertY);
    x = normalizeInput(x, ballPercentX, this.deadzone, this.sensitivity, this.invertX);

    eventData['x'] = ((x / (100 - ballPercentX)) - .5) * 2;
    eventData['y'] = ((y / (100 - ballPercentY)) - .5) * 2;

    ball.style.top = y + '%';
    ball.style.left = x + '%';

    if(this.verticalOnly){
      ball.style.left = (50 - (ballPercentX/2)) + '%'
      delete eventData['x'];
    }

    if(this.horizontalOnly){
      ball.style.top = (50 - (ballPercentY/2)) + '%'
      delete eventData['y'];
    }

    // Do stuff with the new orientation data
    this.tiltMove(eventData)

  }, true);
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