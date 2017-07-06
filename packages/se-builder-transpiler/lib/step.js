const locator = require('./locator');
const StepType = require('./stepType');

const Step = function(parsedJSON, selenium_version) {
  this.type = new StepType(parsedJSON);
  this.negated = parsedJSON.negated || false;
  this.step_name = parsedJSON.step_name || null;
  var pNames = this.type.getParamNames();
  for (var i = 0; i < pNames.length; i++) {
    var name = pNames[i];
    var value = parsedJSON[name];
    if (name) {
      if (step.type.getParamType(name) == "locator") {
        this[name] = locator.jsonToLoc(value, selenium_version);
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
  return new Step(parsedJSON, selenium_version);
};

module.exports = { Step, stepFromJSON };
