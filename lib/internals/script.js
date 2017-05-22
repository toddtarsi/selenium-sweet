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

Script.prototype = {
  getStepIndexForID: function(id) {
    for (var i = 0; i < this.steps.length; i++) {
      if (this.steps[i].id == id) { return i; }
    }
    return -1;
  },
  getStepWithID: function(id) {
    var index = this.getStepIndexForID(id);
    return index == -1 ? null : this.steps[index];
  },
  getLastStep: function() {
    return this.steps.length == 0 ? null : this.steps[this.steps.length - 1];
  },
  getStepBefore: function(step) {
    var index = this.getStepIndexForID(step.id);
    if (index > 0) {
      return this.steps[index - 1];
    } else {
      return null;
    }
  },
  getStepAfter: function(step) {
    var index = this.getStepIndexForID(step.id);
    if (index < this.steps.length - 1) {
      return this.steps[index + 1];
    } else {
      return null;
    }
  },
  removeStepWithID: function(id) {
    var index = this.getStepIndexForID(id);
    if (index !== -1) {
      var step = this.steps[index];
      this.steps.splice(index, 1);
      return step;
    }
    return null;
  },
  addStep: function(step, afterID) {
    if (afterID) {
      var index = this.getStepIndexForID(afterID);
      if (index !== -1) {
        this.steps.splice(index, 0, step);
      }
    }
    this.steps.push(step);
  },
  insertStep: function(step, beforeIndex) {
    if (beforeIndex < this.steps.length) {
      this.steps.splice(beforeIndex, 0, step);
    } else {
      this.steps.push(step);
    }
  },
  moveStepToBefore: function(stepID, beforeStepID) {
    var step = this.removeStepWithID(stepID);
    this.steps.splice(this.getStepIndexForID(beforeStepID), 0, step);
  },
  moveStepToAfter: function(stepID, afterStepID) {
    var step = this.removeStepWithID(stepID);
    if (this.getLastStep().id == afterStepID) {
      this.steps.push(step);
    } else {
      this.steps.splice(this.getStepIndexForID(afterStepID) + 1, 0, step);
    }
  },
  reorderSteps: function(reorderedIDs) {
    var newSteps = [];
    for (var i = 0; i < reorderedIDs.length; i++) {
      newSteps.push(this.getStepWithID(reorderedIDs[i]));
    }
    this.steps = newSteps;
  },
  clearTempBreakpoints: function() {
    for (var i = 0; i < this.steps.length; i++) {
      this.steps[i].tempBreakpoint = false;
    }
  }
};

module.exports = Script;
