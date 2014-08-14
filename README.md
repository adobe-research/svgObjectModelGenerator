# SVG Object Model Generator

An abstract object model generator and SVG writer.

## Overview

This engine is designed to meet the needs of modern SVG and to be sharable by any client apps that can generate the standard JSON.

The engine currently works, in an experimental manner, with Photoshop Generator.

## License
All code is offered under the [Apache License Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

## Setup Generator

The generator plugin adds Copy Generator DOM to make it easy to get test data for the svgOMGenerator

    cd generator/plugins/  
    ln -s /path/to/svgObjectModelGenerator svgObjectModelGenerator

## Running the tests

The tests rely on mocha and chai, so make sure you have run `npm install` in your repository. Then, to run the tests, all you have to do is run `npm test`.

## Debugging the tests

The tests can be debugged using `npm run-script test-debug`

## Code Coverage 

Generate the code coverage report "svgomg-code-coverage.html" by running `npm run-script cover`

## Getting more test data

The test data comes from processing PSDs using the generator plugin defined in main.js.  With the plugin running and your PSD open in Photoshop use File > Generate > Copy Generator DOM.  This copies the generator JSON to your clipboard.

Now, create a file with the PSD's name adding "-data.js" to the end, so "file.psd" becomes "file-data.js"  Inside the file define the data so it can be loaded using require

    module.exports = DATA;
    
Please don't check binary PSD files into this repo.
