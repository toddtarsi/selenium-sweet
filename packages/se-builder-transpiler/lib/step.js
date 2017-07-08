const locator = require('./locator');
const StepType = require('./stepType');

const Step = function(parsedJSON, seleniumVersion) {
  this.type = new StepType(parsedJSON);
  this.negated = parsedJSON.negated || false;
  this.step_name = parsedJSON.step_name || null;
  var pNames = this.type.getParamNames();
  for (var i = 0; i < pNames.length; i++) {
    var name = pNames[i];
    var value = parsedJSON[name];
    if (name) {
      if (this.type.getParamType(name) == "locator") {
        this[name] = locator.jsonToLoc(value, seleniumVersion);
      } else {
        this[name] = "" + parsedJSON[name];
      }
    }
  }
};

Step.prototype = {
  getParamNames: function() {
    return this.type.getParamNames();
  }
};

const stepFromJSON = function(parsedJSON, seleniumVersion) {
  return new Step(parsedJSON, seleniumVersion);
};

module.exports = { Step, stepFromJSON };
