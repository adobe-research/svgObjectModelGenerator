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
    svgWriterUtils = require("../svgWriterUtils.js"),
    sinon = require('sinon');

describe('SVGWriterUtils', function (){
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });
    
    it("knows how to write length", function (){
        expect(svgWriterUtils.writeLength(44.3)).to.equal("44px");
        expect(svgWriterUtils.writeLength(0.3)).to.equal("0");
        expect(svgWriterUtils.writeLength(33.6)).to.equal("34px");
        expect(svgWriterUtils.writeLength(33.0)).to.equal("33px");
        expect(svgWriterUtils.writeLength(33)).to.equal("33px");
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
