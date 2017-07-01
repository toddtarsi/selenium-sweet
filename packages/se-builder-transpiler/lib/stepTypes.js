const StepType = require('./stepType');
const stepData = require('../../config/stepData');

const stepTypes = {};
for (var n in stepData) {
  stepTypes[n] = new StepType(n);
}

module.exports = stepTypes;
