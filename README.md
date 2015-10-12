# SVG Object Model Generator  [![Build Status](https://travis-ci.org/adobe-research/svgObjectModelGenerator.png?branch=master)](https://travis-ci.org/adobe-research/svgObjectModelGenerator)


An OMG generator and SVG writer. OMG is a JSON based vector graphics format used as intermediate format for transformation to different output formats.

## Overview

svgObjectModelGenerator consists of two parts

1. **svgOM to generate OMG from Generator JSON**

	This part of the library is Photoshop specific and requires the [Generator](https://github.com/adobe-photoshop/generator-core) module to be active and running in Photoshop. svgOM itself is a Node.js module that takes Generator JSONs as input and transforms it to OMG.

	svgOM can just be used with Generator JSON.

2. **svgWriter to generate SVG from OMG**

	svgWriter is another Node.js based module that takes OMG as input and transforms it to highly optimized yet easy to read and script SVG.

	svgWriter is application-independent and can be used in other environments than Photoshop as well.

## License
All code is offered under the [Apache License Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).


## Development and Contributions

We :clap: pull requests! If you submit one, please also sign our [Contributor License Agreement](https://adobe.echosign.com/public/esignWidget?wid=9SNA9H6XX64Q5C).

Every pull request must be reviewed by at least one contributor. A patch gets merged on a positive review, typically LGTM comment on the PR.

The project follows the code conventions provided in `package.json` (for ESLint) and in `jscs.json` for JSCS. Dependent on the used code editor there may be extensions for automatic checking:

* **Sublime Text 2/3** Use [SublimeLinter](https://github.com/roadhump/SublimeLinter-eslint) in a combination with a [ESLint](https://github.com/roadhump/SublimeLinter-eslint).
* **Brackets** Use the extension [brackets-eslint](https://github.com/peol/brackets-eslint).

You are encouraged to setup the pre commit hook to ensure that all the code is matching our coding style:

```
ln -s ../../pre-commit.sh .git/hooks/pre-commit
```

### Build

svgObjectModelGenerator uses [Grunt](http://gruntjs.com/) to build.

* Install its command line interface (CLI) globally:
```
npm install -g grunt-cli
```
_*You might need to use `sudo npm`, depending on your configuration._

* Install dependencies with npm:
```
npm install
```
_*svgObjectModelGenerator uses Grunt 0.4.0. You might want to [read](http://gruntjs.com/getting-started) more on their website if you haven’t upgraded since a lot has changed._

* Type `grunt` in the command line to test JavaScript coding style the files.
* Type `grunt test` to run tests. The same as `npm test`.
* Type `grunt pixel` to generate and run visual comparison tests. To update screenshots, simply go to `./tests/visual/screenshots` and delete files that are wrong.
* Type `grunt all` to run coding style, generic and visual tests. Good idea to do it before the final commit for pull request.

## Getting SVG out of Generator JSON file

We created an utility script, convertOMtoSVG that can be used for this purpose:
```
node convertOMtoSVG.js <generator_json_file> [optional_parameters_file] <svg_output_file>
```

## Getting SVG out of OMG JSON file

Use the utility script, convertOMtoSVG for this purpose:
```
node convertOMtoSVG.js <omg_json_file> <svg_output_file>
```

## Running svgWriter

To run *svgWriter* as a Node.js module separately from svgOM do the following.

In `package.json` replace the line

```javascript
"main": "main.js",
```

with

```javascript
"main": "svgWriter.js",
```

**svgWriter** takes multiple arguments to pass over OMG as well as parametrization for svgWriter.

First include svgWriter

```javascript
svgWriter = require("./svgWriter.js");
```

then call svgWriter

```javascript
svgWriter.printSVG(OMG, config, errors)
```

* **OMG** The parsed JSON object.
* **config** The configuration of *svgWriter*.
* **errors** An array with string items. Each item a error report.

The configuration object has the following arguments:

* **trimToArtBounds** *boolean* The SVG will cover the art bounds independent of the dimension of the OMG document.
* **useViewBox** *boolean* If `trimToArtBounds` and `useViewBox` are set to `true`, the content of the document won't be shifted. Instead the viewBox value of the root SVG element is modified to slice and zoom the content to fit the needs.
* **constrainToDocBounds** *boolean* Clip the visible content to the document bounds.
* **preserveAspectRatio** *string* Aspect ratio as defined by the [SVG specification](http://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute). Setting *preserveAspectRatio* overrides the computed value of svgWriter. Therefore, it is recommended to not set this value. Note: For `meet` or `xMidYMid meet` use the equivilant string `xMidYMid` for reduced file size.
* **styling** *enumeration* This property is optional and defaults to `class`.
    * *class* Use the global `<style>` element and reference the style block with the `class` attribute.
    * *style* Use the `style` attribute to apply styling properties to elements.
    * *attribute* Use presentation attributes to apply styling properties to elements.
* **prefix** *string* A prefix that will be added to every ID and class name. This allows unique naming schemes per SVG document. Multiple SVG documents can be inlined into one HTML document without ID or class name clashes as long as the provided prefixes are unique.
* **cropRect** *object* A rectangle with the properties `x`, `y`, `width` and `height`. `x` and `y` are optional. Defines a rectangle the SVG document gets cropped to. It may create a padding if the dimension is smaller than the crop rectangle.
* **minify** Avoids indentations, newlines and whitespaces in the SVG output. Uses minimal IDs.
* **idType** *string*
    * **regular** The default way to create IDs. Preferable based on layer/object names in the application.
    * **minimal** Creates shortest possible IDs independent of user defined layer/object names in the application.
    * **unique** Create UUIDs based on rfc4122 in the format `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.
* **precision** *number* The number of digits after floating point. Number must be in the range of 0 .. 10 and is trimmed otherwise. Default is `3`.
* **isResponsive** *boolean* If set to `true` makes the SVG document fill the viewport/image area. (No `width` and `height` attribtues set on SVG root.)
* **carriageReturn** *boolean* By default, svgWriter uses the line ending `LF`. With *carriageReturn* set to `true` line endings use `CRLF`.
* **indentation** *string* Use a custom string as indentation. E.g use tab indentation. The default is 2 spaces.
* **fillFilter** *boolean* Filters just apply to the fill of an element. The stroke is unaffected and gets drawn on top of the filtered content. **WARNING**: This is a temporary flag and may be removed without further notice in the future.
* **documentUnits** `mm` | `cm` | `pc` | `in` Specified document units will be used on the `width` and `height` attribute of the root `<svg>` element. **WARNING**: Document units may be added to AGC directly in which case this flag gets deprecated.
* **callback** *function* Function that will be called during the operation with single number argument (0..100) representing percentage of the progress of the operation. If function return some “truish” value it will be a signal to cancel the operation. In this case empty string will be returned.

## Setup Generator

The generator plugin adds Copy Generator DOM to make it easy to get test data for the svgOMGenerator

    cd generator/plugins/
    ln -s /path/to/svgObjectModelGenerator svgObjectModelGenerator

## Running the tests

The tests rely on mocha and chai, so make sure you have run `npm install` in your repository. Then, to run the tests, all you have to do is run `grunt test`.

## Debugging the tests

The tests can be debugged using `npm run-script test-debug`

## Code Coverage

Generate the code coverage report "svgomg-code-coverage.html" by running `npm run-script cover`

## Getting more test data

The test data comes from processing PSDs using the generator plugin defined in main.js.  With the plugin running and your PSD open in Photoshop use File > Generate > Copy Generator DOM.  This copies the generator JSON to your clipboard.

Now, create a file with the PSD’s name adding "-data.js" to the end, so "file.psd" becomes "file-data.js"  Inside the file define the data so it can be loaded using require

    module.exports = DATA;

Please don’t check binary PSD files into this repo.

## Reporting bugs

Found bugs should be reported as issues in this project, specifying the release branch if needed. We highly encourage contributors to provide the json files that reproduce the issue using only this library and we created the utility file convertOMtoSVG.js especially for this purpose. Reported issues that have such json files associated will be looked upon first.
