const fs = require('fs');
const path = require('path');
const program = require('commander');
const { transpileDir } = require('se-builder-transpiler');
const defaultFormat = require(path.join(__dirname, '..', 'config')).format;
const formatsRoot = path.join(__dirname, '..', 'formats');
const availableFormats = fs.readdirSync(formatsRoot);
const spaces = '            ';
const formatOptions = '\n' + spaces + availableFormats
  .map(r => r.slice(0, -3))
  .join('\n' + spaces);

program
  .version('0.0.1')
  .option(
    '-f --format <format>',
    `Output format. By default, will derive from format key in config/index. Available options: ${formatOptions}`,
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

console.log("Transpiling to " + program.format);
return transpileDir(
  path.join(__dirname, '..', 'formats', program.format + '.js'),
  path.join(__dirname, '..', 'tests', 'lib'),
  path.join(__dirname, '..', 'tests', 'build'),
  (err) => {
    if (err) throw err;
    console.log("Transpile completed successfully!");
    process.exit(0);
  }
);
