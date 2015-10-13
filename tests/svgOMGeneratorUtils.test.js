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
    svgOMGUtils = require("../svgOMGeneratorUtils.js"),
    sinon = require("sinon");

describe("SVGOMGeneratorUtils", function () {

    var sandbox = sinon.sandbox.create();

    beforeEach(function () {
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("pct2px", function () {
        expect(svgOMGUtils.pct2px(300, 100)).to.equal(300);
    });

    it("pt2px", function () {
        expect(svgOMGUtils.pt2px(720, 100)).to.equal(1000);
    });

    it("in2px", function () {
        expect(svgOMGUtils.in2px(100, 100)).to.equal(10000);
    });

    it("mm2in", function () {
        expect(svgOMGUtils.mm2in(100)).to.equal(3.93700787);
    });

    it("mm2px", function () {
        expect(svgOMGUtils.mm2px(100, 300)).to.equal(1181.102361);
    });

    it("boundInPx", function () {
        var boundsNum = {
                units: "number",
                value: 720
            },
            boundsPt = {
                units: "pointsUnit",
                value: 720
            },
            boundsMm = {
                units: "millimetersUnit",
                value: 100
            },
            boundsUnkown = {
                units: "unknown",
                value: 100
            },
            boundsString = "100.5";
        expect(svgOMGUtils.boundInPx(boundsNum, 72)).to.equal(720);
        expect(svgOMGUtils.boundInPx(boundsPt, 100)).to.equal(1000);
        expect(svgOMGUtils.boundInPx(boundsMm, 72)).to.equal(283.46456664);
        expect(svgOMGUtils.boundInPx(boundsUnkown, 72)).to.equal(100);
        expect(svgOMGUtils.boundInPx(boundsString, 72)).to.equal(100);
    });
});
