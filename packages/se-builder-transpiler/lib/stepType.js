const StepType = function(parsedJSON) {
  this.params = [];
  this.name = parsedJSON.type;
  for(var name in parsedJSON) {
    if (
      name !== 'type' &&
      name !== 'negated' &&
      name !== 'type'
    ) {
      this.params.push(name);
    }
  }
};

StepType.prototype = {
  /** @return The type's name. */
  getName: function() {
    return this.name;
  },
  /** @return Array of type parameter names. */
  getParamNames: function() {
    return this.params;
  },
  /** @return Whether the given parameter is a "locator" or "string". */
  getParamType: function(paramName) {
    return paramName.toLowerCase().indexOf("locator") != -1 ? "locator" : "string";
  },
};

module.exports = StepType;
