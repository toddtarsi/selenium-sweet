const fs = require('fs');
const path = require('path');
const defaultFormat = require(
  path.join(__dirname, '..', 'lib', 'config')
).format;
const { createLangFormtter, parseScript } = require(
  path.join(__dirname, '..', 'lib', 'server', 'transpiler')
);

const program = require('commander');
const formatsRoot = path.join('lib', 'formats');
const availableFormats = fs.readdirSync(formatsRoot);

const formatOptions = availableFormats
  .map(r => r.slice(0, -3))
  .join('|');

program
  .version('0.0.1')
  .option(
    '-f --format <format>',
    `Output format - options: ${formatOptions}`,
    new RegExp(`^(${formatOptions})$`, 'i'),
    defaultFormat
  )
  .parse(process.argv);

if(!program.format) {
  console.warn("No output format selected.");
  console.warn("Please specify an output format with -f [format]");
  console.warn("Available formats:");
  console.warn("  " + formatOptions.replace(/\|/g, '\n  '));
  return process.exit(1);
}

const formatter = require(path.join('..', formatsRoot, program.format + '.js'));

const testRoot = path.join('lib', 'tests');
const availableTests = fs.readdirSync(testRoot);
availableTests.forEach(testName => {
  if (testName.slice(-5) !== '.json') return;
  const script = parseScript(fs.readFileSync(path.join(testRoot, testName)));
  fs.writeFile(
    path.join('build', 'tests', testName.slice(0, -5) + formatter.extension),
    formatter.format(script, testName, {}),
    err => {
      if (err) throw err;
    }
  );
});
