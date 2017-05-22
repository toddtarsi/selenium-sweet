const locator = require('./locator');
const { stepTypes } = require('./stepTypes');

const Step = function(type) {
  this.type = type;
  this.negated = false;
  this.step_name = null; // Can be null for default numbering.
  var pNames = this.type.getParamNames();
  if (pNames) {
    for (var i = 0; i < pNames.length; i++) {
      if (i + 1 < arguments.length) {
        this[pNames[i]] = arguments[i + 1];
      } else {
        this[pNames[i]] = this.type.getParamType(pNames[i]) == "locator" ? locator.empty() : "";
      }
    }
  }
  this.changeType(this.type);
};

Step.prototype = {
  getParamNames: function() {
    return this.type.getParamNames();
  },
  changeType: function(newType) {
    this.type = newType;
    var pNames = this.type.getParamNames();
    for (var i = 0; i < pNames.length; i++) {
      if (!this[pNames[i]]) {
        this[pNames[i]] = this.type.getParamType(pNames[i]) == "locator" ? locator.empty() : "";
      }
    }
  },
  toJSON: function() {
    var cleanStep = { type: this.type.name };
    if (this.negated) {
      cleanStep.negated = true;
    }
    if (this.step_name) {
      cleanStep.step_name = this.step_name;
    }
    var pNames = this.getParamNames();
    for (var j = 0; j < pNames.length; j++) {
      if (this.type.getParamType(pNames[j]) == "locator") {
        cleanStep[pNames[j]] = locator.locToJSON(this[pNames[j]]);
      } else {
        cleanStep[pNames[j]] = this[pNames[j]];
      }
    }
    
    return cleanStep;
  }
};

const stepFromJSON = function(parsedJSON, seleniumVersion) {
  var step = new Step(stepTypes[parsedJSON.type]);
  step.negated = parsedJSON.negated || false;
  step.step_name = parsedJSON.step_name || null;
  var pNames = step.getParamNames();
  for (var j = 0; j < pNames.length; j++) {
    if (parsedJSON[pNames[j]]) {
      if (step.type.getParamType(pNames[j]) == "locator") {
        step[pNames[j]] = locator.jsonToLoc(parsedJSON[pNames[j]]);
      } else {
        step[pNames[j]] = "" + parsedJSON[pNames[j]];
      }
    }
  }
  
  return step;
};

module.exports = { Step, stepFromJSON };
