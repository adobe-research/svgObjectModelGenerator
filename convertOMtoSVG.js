var fs = require("fs");

if (process.argv.length < 4) {
    console.log("Usage: node convertOMtoSVG.js <inputOMFile> [<optionsFile>] <outputSVGFile>");
    throw new Error();
}

var inFile = process.argv[2],
    outFile = process.argv[3],
    optFile = process.argv[4];
if (optFile) {
    outFile = process.argv[4];
    optFile = process.argv[3];
}
var svgOMString = fs.readFileSync(inFile, {encoding: "utf8", flag: "r"}),
    options = optFile ? JSON.parse(fs.readFileSync(optFile, {encoding: "utf8", flag: "r"})) : {
        trimToArtBounds: false,
        preserveAspectRatio: "xMidYMid",
        scale: 1,
        constrainToDocBounds: false
    }
    svgOM = JSON.parse(svgOMString);
if ("version" in svgOM) {
    var opt = [],
        i = 0,
        ii = svgOM.layers.length,
        OMG = require("./svgOMGenerator.js");
    for (; i < ii; i++) {
        opt.push(svgOM.layers[i].id, svgOM.layers[i].name, 1);
    }
    svgOM = OMG.extractSVGOM(svgOM, opt);
}

var svgWriter = require("./svgWriter.js"),
    svgWriterErrors = [],
    svgOut = svgWriter.printSVG(svgOM, options, svgWriterErrors);

for (var i = 0; i < svgWriterErrors.length; i++) {
    console.error(svgWriterErrors[i]);
}

fs.writeFileSync(outFile, svgOut);
console.log("<···Done···>");
console.log("Check out the result: " + outFile);
