# Selenium Suite:

The purpose of this repo is twofold.

1. Help other Selenium developers, by making test maintenance a bit easier.
2. Showcase the immense amount of technology inside of Selenium builder / IDE, as this is largely the gutted transpiler internals of SE.

# How to use this repo:

Clone or fork this repo, and start storing your tests in lib/tests.
By maintaining all of these tests as JSON, we're able to separate any test issues from implementation issues, and can truly own the process of composing our output script.

You can set the output format by filename in lib/config/index.js, and transpile with npm build;

If you'd like to use the transpiler with a one off format, you can run the transpiler directly from the command line with `node scripts/transpile -f [format]`. If format isn't provided, your format from config will be used.