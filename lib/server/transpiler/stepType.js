const stepData = require('../../config/stepData');

const StepType = function(name) {
  this.name = name;
};

StepType.prototype = {
  /** @return The type's name. */
  getName: function() {
    return this.name;
  },
  /** @return List of parameter names. */
  getParamNames: function() {
    return stepData[this.name];
  },
  /** @return Whether the given parameter is a "locator" or "string". */
  getParamType: function(paramName) {
    return paramName.toLowerCase().indexOf("locator") != -1 ? "locator" : "string";
  },
  /** @return Whether setting negated to true on a step of this type is valid. */
  getNegatable: function() {
    return (
      this.name.startsWith("waitFor") ||
      this.name.startsWith("assert") ||
      this.name.startsWith("verify")
    );
  },
};

module.exports = StepType;
