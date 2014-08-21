/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

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

        expect(svgOMExpected).to.eql(svgOM);
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
