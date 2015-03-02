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


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, bitwise: true */
/*global define: true, require: true, describe: true, beforeEach: true, afterEach: true, it: true */

var expect = require('chai').expect,
    svgWriterUtils = require("../svgWriterUtils.js"),
    sinon = require('sinon');

describe('SVGWriterUtils', function (){
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });

    it("knows how to write px", function (){
        
        var testCTX = {
                pxToInchRatio: 72
            },
            testLength1 = {
                value: 33,
                units: "millimetersUnit"
            },
            testLength2 = {
                value: 33,
                units: "rulerCm"
            },
            testLength3 = {
                value: 33,
                units: "rulerInches"
            },
            testLength4 = {
                value: 33,
                units: "rulerPicas"
            },
            testLengthUnknown = {
                value: 33,
                units: "kepitars"
            };
        
        //string conversion is not supported
        expect(svgWriterUtils.px(testCTX, "33")).to.equal(0);
        
        expect(svgWriterUtils.px(testCTX, 33)).to.equal(33);
        
        expect(svgWriterUtils.px(testCTX, testLength1)).to.equal(93.543);
        expect(svgWriterUtils.px(testCTX, testLength2)).to.equal(935.433);
        expect(svgWriterUtils.px(testCTX, testLength3)).to.equal(2376);
        expect(svgWriterUtils.px(testCTX, testLength4)).to.equal(396);
        expect(svgWriterUtils.px(testCTX, testLengthUnknown)).to.equal(0);
        
    });
    
});
