const fs = require('fs');
const path = require('path');
const asnyc = require('async');
const parser = require('./parser');

const transpileTest = (test, name, formatter, args) => formatter.format(test, name, args || {});
const curriedFileTranspiler = formatter => (inputPath, outputPath, name) => cb => fs.readFile(
  path.join(inputPath, name + '.json'),
  (err, file) => err ? cb(err) : fs.writeFile(
    path.join(outputPath, name + formatter.extension),
    transpileTest(
      parser.parseScript(file),
      testName,
      formatter,
      {}
    ),
    cb
  )
);
const transpileFile = (formatPath, inputDirPath, outputDirPath, name, cb) => (
  curriedFileTranspiler(require(formatPath))(inputDirPath, outputDirPath, name)(cb)
);
const transpileDir = (formatPath, inputDirPath, outputDirPath, cb) => {
  const transpiler = curriedFileTranspiler(require(formatPath));
  const availableTests = fs.readdir(inputDirPath, (err, _availableTests) => {
    if (err) return cb(err);

    const availableTests = _availableTests
      .filter((testName) => testName.slice(-5) === '.json')
      .map(t => t.slice(0, -5));

    return async.series(
      availableTests.map(test => transpiler(
        inputDirPath,
        outputDirPath,
        test
      ))
    );
  });
};

module.exports = {
  createLangFormatter: parser.createLangFormatter,
  createDerivedLangFormatter: parser.createDerivedLangFormatter,
  transpileFile,
  transpileDir
};