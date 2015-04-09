var fs = require("fs");

if (process.argv.length < 4) {
    console.log("Usage: node convertOMtoSVG.js <inputOMFile> <outputSVGFile> [<width> <height>]");
    throw new Error();
}

var inFile = process.argv[2],
    outFile = process.argv[3],
    svgOMString = fs.readFileSync(inFile, {"encoding": "utf8", "flag": "r"}),
    svgOM = JSON.parse(svgOMString),
    viewBox = svgOM.global ? svgOM.global.viewBox : null,
    targetWidth = viewBox ? viewBox.right - viewBox.left : 612,
    targetHeight = viewBox ? viewBox.bottom - viewBox.top : 792;

if (process.argv.length > 4 && parseFloat(process.argv[4]) > 0) {
    targetWidth = parseInt(process.argv[4], 10);
}
if (process.argv.length > 5 && parseFloat(process.argv[5]) > 0) {
    targetHeight = parseInt(process.argv[5], 10);
}

var svgWriter = require("./svgWriter.js"),
    svgWriterErrors = [],
    svgOut = svgWriter.printSVG(svgOM, {
                                    trimToArtBounds: false,
                                    preserveAspectRatio: "xMidYMid",
                                    scale: 1,
                                    targetWidth: targetWidth,
                                    targetHeight: targetHeight,
                                    constrainToDocBounds: false
                                }, svgWriterErrors);

for (var i = 0; i < svgWriterErrors.length; i++) {
    console.error(svgWriterErrors[i]);
}

fs.writeFileSync(outFile, svgOut);
console.log("Done (w/h: " + targetWidth + " x " + targetHeight + ").");
console.log("Check out the result: " + outFile);
