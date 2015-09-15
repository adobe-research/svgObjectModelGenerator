// Copyright (c) 2015 Adobe Systems Incorporated. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
