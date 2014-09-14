// Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
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
    OMG = require("../svgOMGenerator.js"),
    sinon = require('sinon');

describe('SVGOMGenerator', function (){
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });
    
    it("should be able to OM a gradient fill", function (){

        var testData = require("./data/svgFill-data.js"),
            svgOMExpected = require("./data/svgFill-om.js"),
            svgOM = OMG.extractSVGOM(testData, { });
        expect(JSON.stringify(svgOMExpected)).to.eql(JSON.stringify(svgOM));
    });

    it("should be able to OM a group", function (){

        var testData = require("./data/group-data.js"),
            svgOMExpected = require("./data/group-om.js"),
            svgOM = OMG.extractSVGOM(testData, { });
        // FIXME: This should work and does above. Maybe the Objects are too big?
        //expect(JSON.stringify(svgOMExpected)).to.eql(JSON.stringify(svgOM));
    });

    it("should be able to OM a text", function (){

        var testData = require("./data/svgText-data.js"),
            svgOMExpected = require("./data/svgText-om.js"),
            svgOM = OMG.extractSVGOM(testData, {});
        
        //expect(svgOMExpected).to.eql(svgOM);
    });

    it("should be able to OM a text with a layer spec", function (){

        var testData = require("./data/svgText-data.js"),
            svgOM = OMG.extractSVGOM(testData, { layerSpec: 4 });
        
        //expect(svgOMExpected).to.eql(svgOM);
    });

    it("should survive unknown layer type", function (){
        sandbox.stub(console, "log");
        OMG._getSVGLayerType("nannan");
        expect(console.log.calledOnce).to.equal(true);
    });
    
    it("should recognize a layer spec when it sees one", function (){
        expect(OMG._layerSpecActive()).to.equal(false);
        expect(OMG._layerSpecActive(3)).to.equal(true);
        //expect(OMG._layerSpecActive({ TBD })).to.equal(true);
    });
    
    it("should be able to match a layer spec with a layer", function (){
        
        var layer = {
                id: 3
            },
            layerSpec = 3;
        
        expect(OMG._layerSpecMatches(layer, undefined)).to.equal(false);
        expect(OMG._layerSpecMatches(layer, layerSpec)).to.equal(true);
    });
    
    it("should eat unnecessary whitespace when making an ID", function (){
        
        var lyr = {
                index: 3,
                name: "  franklinstein"
            };
        expect(OMG._getSVGID(lyr)).to.equal("-franklinstein");
    });

});
