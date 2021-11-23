/**
 * This is a fake AirConsole for debugging
 * @constructor
 */
function AirConsole() {
  this.data = undefined;
}

AirConsole.SCREEN = 0;

AirConsole.prototype.message = function(device_id, data) {
  this.log("Message to Device " + device_id, data);
};

AirConsole.prototype.setCustomDeviceState = function(data) {
  this.data = data;
  this.log("Setting Custom Device State", data);
}

AirConsole.prototype.getCustomDeviceState = function() {
  return this.data;
}

AirConsole.prototype.log = function(call, data) {
  console.log(JSON.stringify([call, data], null, 2));
}
