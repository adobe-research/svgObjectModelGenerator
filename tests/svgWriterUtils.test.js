// Copyright (c) 2014, 2015 Adobe Systems Incorporated. All rights reserved.
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

/*global require: true, describe: true, beforeEach: true, afterEach: true, it: true */

var expect = require("chai").expect,
    svgWriterUtils = require("../svgWriterUtils.js"),
    sinon = require("sinon");

describe("SVGWriterUtils", function () {

    var sandbox = sinon.sandbox.create();

    beforeEach(function () {
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("test transformation matrix without translation values", function () {
        var val = {
                "0": [
                    0.707107,
                    -0.707107,
                    0,
                    0
                ],
                "1": [
                    0.707107,
                    0.707107,
                    0,
                    0
                ],
                "2": [
                    0,
                    0,
                    1,
                    0
                ],
                "3": [
                    0,
                    0,
                    0,
                    1
                ]
            };

        expect(svgWriterUtils.getTransform(val, undefined, undefined)).to.equal("rotate(-45)");
    });

    it("test color values with alpha channel not 1", function () {
        var c = {
            r: 0,
            g: 127,
            b: 0,
            a: 0.5
        };

        expect(svgWriterUtils.writeColor(c)).to.equal("rgba(0,127,0,0.5)");
    });

});
