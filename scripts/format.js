const fs = require('fs');
const path = require('path');
const { createLangFormatter, parseScript } = require('../lib/internals/transpiler');

const program = require('commander');

const testRoot = path.join('lib', 'tests');
const formatsRoot = path.join('lib', 'formatters');
const availableTests = fs.readdirSync(testRoot);
const availableFormats = fs.readdirSync(formatsRoot);
const formatOptions = availableFormats
  .map(r => r.slice(0, -3))
  .join('|');

program
  .version('0.0.1')
  .option(
    '-f --format <format>',
    'Output format',
    new RegExp(`/^(${formatOptions})$/`, 'i'),
    availableFormats[0].slice(0, -3)
  )
  .parse(process.argv);

const chosenFormat = require(path.join('..', formatsRoot, program.format + '.js'));
const languageFormatter = createLangFormatter(chosenFormat);

availableTests.forEach(testName => {
  if (testName.slice(-5) !== '.json') return;
  const script = parseScript(fs.readFileSync(path.join(testRoot, testName)));
  fs.writeFile(
    path.join('build', 'tests', testName.slice(0, -5) + languageFormatter.extension),
    languageFormatter.format(script, testName, {}),
    err => {
      if (err) throw err;
    }
  );
});