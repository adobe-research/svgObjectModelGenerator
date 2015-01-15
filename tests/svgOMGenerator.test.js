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
    sinon = require('sinon'),
    fs = require("fs");

describe('SVGOMGenerator', function (){
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });
    
    it("should be able to OM a gradient fill", function (){

        var testData = require("./data/svgFill-data.js"),
            svgOMExpected = JSON.stringify(require("./data/svgFill-om.js")),
            svgOM = JSON.stringify(OMG.extractSVGOM(testData, { }));
        
        if (repairMedia && svgOMExpected !== svgOM) {
            fs.writeFileSync("./tests/data/svgFill-om.js", "module.exports = " + svgOM + ";\n", "utf8");
        }
        
        expect(svgOMExpected).to.equal(svgOM);
    });

    function compareResults (testName) {
        var expectedModule,
            testData = require('./data/' + testName + '-data.js'),
            svgOMGText = JSON.stringify(OMG.extractSVGOM(testData, { }), null, '\t');
        try {
            expectedModule = require('./data/' + testName + '-om.js');
        } catch (e) {
            fs.writeFileSync('./tests/data/' + testName + '-om.js', 'module.exports = ' + svgOMGText, 'utf8');
            console.log('No reference OM document found. New one created as ' + testName + '-om.js');
            return svgOMGText;
        }
        var svgOMExpected = JSON.parse(JSON.stringify(expectedModule)),
            svgOM = JSON.parse(svgOMGText);

        return expect(svgOM).to.eql(svgOMExpected);
    }

    /**
     * Test complete Generator JSON to OM extraction
     **/
    it("should OM svgFill", function () {
        compareResults('svgFill');
    });

    it("should OM gradient-duplicate", function () {
        compareResults('gradient-duplicate');
    });

    it("should OM AdobeLogo", function () {
        compareResults('AdobeLogo');
    });

    it("should OM svgRect.", function () {
        compareResults('svgRect');
    });

    it("should OM svgText", function () {
        compareResults('svgText');
    });

    it("should OM svgText-align", function () {
        compareResults('svgText-align');
    });

    it("should OM svgText-writing-mode", function () {
        compareResults('svgText-writing-mode');
    });

    it("should OM svgFx-shadow", function () {
        compareResults('svgFx-shadow');
    });

    it("should OM svgFx-shadow-overlay", function () {
        compareResults('svgFx-shadow-overlay');
    });

    it("should OM svgOverlay", function () {
        compareResults('svgOverlay');
    });

    it("should OM svgGradientOverlay", function () {
        compareResults('svgGradientOverlay');
    });

    it("should OM svgGradientOverlay-opacity", function () {
        compareResults('svgGradientOverlay-opacity');
    });

    it("should OM svgGradient", function () {
        compareResults('svgGradient');
    });

    it("should OM svgTextGradient", function () {
        compareResults('svgTextGradient');
    });

    it("should OM svgTextFx", function () {
        compareResults('svgTextFx');
    });

    it("should OM svgFx-satin", function () {
        compareResults('svgFx-satin');
    });

    it("should OM filter-duplicate", function () {
        compareResults('filter-duplicate');
    });

    // FIXME: PSD file missing. Needs to be recreated.
    // it("should OM svgFx-all", function () {
    //     compareResults('svgFx-all');
    // });

    it("should OM pixelImage", function () {
        compareResults('pixelImage');
    });

    it("should OM pixelImage-linked", function () {
        compareResults('pixelImage-linked');
    });

    it("should OM pixelImage-fx", function () {
        compareResults('pixelImage-fx');
    });

    it("should OM outer-glow", function () {
        compareResults('outer-glow');
    });

    it("should OM svgFx-inner-glow", function () {
        compareResults('svgFx-inner-glow');
    });

    it("should OM svgGradient-radial", function () {
        compareResults('svgGradient-radial');
    });

    it("should OM gradient-scale", function () {
        compareResults('gradient-scale');
    });

    it("should OM svgGradient-reflected", function () {
        compareResults('svgGradient-reflected');
    });

    it("should OM gradient-scale-reflected", function () {
        compareResults('gradient-scale-reflected');
    });

    it("should OM gradient-reverse", function () {
        compareResults('gradient-reverse');
    });

    it("should OM stroke-style", function () {
        compareResults('stroke-style');
    });

    it("should OM group", function () {
        compareResults('group');
    });

    it("should OM radial-gradient-angle-layer", function () {
        compareResults('radial-gradient-angle-layer');
    });

    it("should OM radial-gradient-angle-global", function () {
        compareResults('radial-gradient-angle-global');
    });

    it("should OM linear-gradient-angle-layer", function () {
        compareResults('linear-gradient-angle-layer');
    });

    it("should OM linear-gradient-angle-layer-2", function () {
        compareResults('linear-gradient-angle-layer-2');
    });

    it("should OM linear-gradient-angle-global", function () {
        compareResults('linear-gradient-angle-global');
    });

    it("should OM linear-gradient-angle-global-2", function () {
        compareResults('linear-gradient-angle-global-2');
    });

    it("should OM text-styling", function () {
        compareResults('text-styling');
    });

    it("should OM text-on-path", function () {
        compareResults('text-on-path');
    });

    it("should OM text-on-path-2", function () {
        compareResults('text-on-path-2');
    });

    it("should OM text-transform", function () {
        compareResults('text-transform');
    });

    it("should OM light-global-local", function () {
        compareResults('light-global-local');
    });

    it("should OM stroke-fx", function () {
        compareResults('stroke-fx');
    });

    it("should OM gradient-color-overlay", function () {
        compareResults('gradient-color-overlay');
    });

    /**
     * Test extraction of individual layers
     **/
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
