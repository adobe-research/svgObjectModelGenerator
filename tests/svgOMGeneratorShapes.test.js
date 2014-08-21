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
        expect(svgOMGS.addShapeData({}, { path: {} })).to.equal(false);
        expect(console.log.calledOnce).to.equal(true);
        
    });

});
