var fs = require("fs"),
    agcValidator = require("./agcValidator.js");

if (process.argv.length < 2) {
    console.log("Usage: node validateAGC.js <inputOMFile>");
    throw new Error();
}

var inFile = process.argv[2],
    validationResult = agcValidator.validateAGC(JSON.parse(fs.readFileSync(inFile, {encoding: "utf8", flag: "r"})));


for (var i = 0; i < validationResult.errors.length; ++i) {
    console.log(validationResult.errors[i].property + ": " + validationResult.errors[i].message);
}
if (!validationResult.valid) {
    console.log("INVALID AGC document!!!");
} else {
    console.log("Valid AGC document.");
}

console.log("End of validation");
