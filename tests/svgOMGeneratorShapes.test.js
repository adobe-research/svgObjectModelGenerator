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
    svgOMGS = require("../svgOMGeneratorShapes.js"),
    sinon = require('sinon');

describe('svgOMGeneratorShapes', function () {
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });
    
    
    it("can survive sparse data", function () {
        var svgOMGenStyles = require("../svgOMGeneratorStyles.js");
        
        sandbox.stub(svgOMGenStyles, "addStylingData");
        
        expect(svgOMGS.addRect({}, { path: { pathComponents: [{ origin: { type: "ronnie" } }] } })).to.equal(false);
        expect(svgOMGS.addRect({}, { path: { pathComponents: [{ origin: { type: "rect", radii: [1, 2, 3, 4] } }] } })).to.equal(false);
        
        expect(svgOMGS.addPath({}, { path: {} })).to.equal(false);
        
        sandbox.stub(console, "log");
        expect(svgOMGS.addShapeData({}, { path: {} }, 72)).to.equal(false);
        expect(console.log.calledOnce).to.equal(true);
        
    });

});
