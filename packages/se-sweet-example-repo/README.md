## Example Repo

An example implementation of some of the Selenium Sweet tools. 

### How to use this repo

Fork it. Then, use the se-builder github-integration to create JSON tests in the tests/lib directory.
To transpile your tests to the final format, call `node scripts/transpile`.
To view all transpiling options, call `node scripts/transpile --help`.
This script uses commander under the surface and basically just calls the transpiler module a bunch, so nothing here is too fancy.

### Prerequisites

To transpile your tests, you'll need NodeJS. 
