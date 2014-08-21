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
    OMG = require("../svgOMGeneratorStyles.js"),
    sinon = require('sinon');

describe('SVGOMGeneratorStyles', function (){
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });

    it("should ignore default blend modes", function (){
        
        expect(OMG.fetchBlendMode({ blendOptions: { mode: "screen" }})).to.equal("screen");
        expect(OMG.fetchBlendMode({ blendOptions: { mode: "pass-Through" }})).to.equal(undefined);
        expect(OMG.fetchBlendMode({ blendOptions: { mode: "normal" }})).to.equal(undefined);
    });
    
});
