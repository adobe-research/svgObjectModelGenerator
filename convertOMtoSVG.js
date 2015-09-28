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

function progress(total, len) {
    total = total || 100;
    len = len || 10;
    var oct = " \u258f\u258e\u258d\u258c\u258b\u258a\u2589\u2588",
        steps = oct.length - 1;

    function write(val) {
        var x = ~~(val * len * steps / total),
            full = ~~(x / steps),
            rest = x % steps,
            str = new Array(full + 1).join(oct[steps]);
        if (rest) {
            str += oct[rest];
        }
        str += new Array(len - str.length + 1).join(oct[0]);
        process.stdout.write(new Array(total + 1).join("\u0008") + "[\033[32m" + str + "\033[0m] " + val + "%");
    }
    return function (val) {
        write(val);
    };
}

var prog = progress(100, 20),
    svgOMString = fs.readFileSync(inFile, {encoding: "utf8", flag: "r"}),
    options = optFile ? JSON.parse(fs.readFileSync(optFile, {encoding: "utf8", flag: "r"})) : {
        trimToArtBounds: true,
        useViewBox: true,
        isResponsive: true,
        preserveAspectRatio: "xMidYMid",
        scale: 1,
        constrainToDocBounds: false,
        preparedPath: true
    },
    svgOM = JSON.parse(svgOMString);
if ("layers" in svgOM) {
    var opt = [],
        i = 0,
        ii = svgOM.layers.length,
        OMG = require("./svgOMGenerator.js");
    for (; i < ii; i++) {
        opt.push(svgOM.layers[i].id, svgOM.layers[i].name, 1);
    }
    svgOM = OMG.extractSVGOM(svgOM, opt);
}

prog(0);
options.callback = function (percent) {
    prog(percent);
};

var svgWriter = require("./svgWriter.js"),
    svgWriterErrors = [],
    svgOut = svgWriter.printSVG(svgOM, options, svgWriterErrors);

for (i = 0; i < svgWriterErrors.length; i++) {
    console.error(svgWriterErrors[i]);
}

fs.writeFileSync(outFile, svgOut);
console.log(new Array(100).join("\u0008") + "<···Done···>               ");
console.log("Check out the result: " + outFile);
