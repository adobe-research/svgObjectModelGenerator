var fs = require("fs");

if (process.argv.length < 4) {
	console.log("Usage: node convertOMtoSVG.js <inputOMFile> <outputSVGFile> [<width> <height>]");
	process.exit();
}

var inFile = process.argv[2];
var outFile = process.argv[3];

var targetWidth = 612;
var targetHeight = 792;

if (process.argv.length > 4 && parseInt(process.argv[4]) > 0)
	targetWidth = parseInt(process.argv[4]);
if (process.argv.length > 5 && parseInt(process.argv[5]) > 0)
	targetHeight = parseInt(process.argv[5]);

var svgWriter = require("./svgWriter.js");

var svgOMString = fs.readFileSync(inFile, {"encoding": "utf8", "flag": "r"});
var svgOM = JSON.parse(svgOMString);
var svgWriterErrors = [];
var svgOut = svgWriter.printSVG(svgOM, {
                                    trimToArtBounds: false,
                                    preserveAspectRatio: "xMidYMid",
                                    scale: 1,
                                    targetWidth: targetWidth,
                                    targetHeight: targetHeight,
                                    constrainToDocBounds: false,
                                }, svgWriterErrors);

for (var i = 0; i < svgWriterErrors.length; i++)
	console.error(svgWriterErrors[i]);

fs.writeFileSync(outFile, svgOut);
console.log("Done (w/h: " + targetWidth + " x " + targetHeight + ").");
console.log("Check out the result: " + outFile);
