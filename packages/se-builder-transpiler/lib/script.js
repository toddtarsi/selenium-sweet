/**
 * Defines a Script object that encapsulates a single test script.
*/

const Script = function(seleniumVersion) {
  this.steps = [];
  this.seleniumVersion = seleniumVersion;
  this.path = null;
  this.saveRequired = false;
  this.data = {'configs':{}, 'source': 'none'};
  this.inputs = [];
  this.timeoutSeconds = 60;
};

module.exports = Script;
