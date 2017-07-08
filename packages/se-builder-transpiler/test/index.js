const fs = require('fs');
const path = require('path');
const program = require('commander');
const { transpileDir } = require(path.join(__dirname, '..', 'lib'));

return transpileDir(
  path.join(__dirname, 'format.js'),
  path.join(__dirname, 'tests', 'lib'),
  path.join(__dirname, 'tests', 'build'),
  (err) => {
    if (err) throw err;
    console.log("Transpile completed successfully!");
    process.exit(0);
  }
);
