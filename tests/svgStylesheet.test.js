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

var expect = require('chai').expect,
    svgStylesheet = require("../svgStylesheet.js"),
    sinon = require('sinon');

describe('svgStylesheet', function () {
    
    describe('our SVG stylesheet', function () {
        
        it("knows whether it has rules to write", function () {
            
            var sheet = new svgStylesheet(),
                styleBlock;
            
            expect(sheet.hasRules()).to.equal(false);
            
            styleBlock = sheet.getStyleBlock({className: "clsTest" });
            styleBlock.addRule("fill", "#ed3ecc");
            
            expect(sheet.hasRules()).to.equal(true);
        });
        
        
        it("knows whether it has defines to write", function () {
            var sheet = new svgStylesheet(),
                defn;
            
            expect(sheet.hasDefines()).to.equal(false);
            
            sheet.define("defineable-type", "ele-id", "defineable-type-1", "<filter id=\"defineable-type-1\"></filter>", "{className: \"clsTest\" }");
            
            expect(sheet.hasDefines()).to.equal(true);
            
            defn = sheet.getDefine("ele-id", "defineable-type");
            expect(defn === null).to.equal(false);
            defn.written = true;
            expect(sheet.hasDefines()).to.equal(false);
        });
        
        it("combines like defines", function () {
            var sheet = new svgStylesheet(),
                defn;
            
            expect(sheet.hasDefines()).to.equal(false);
            
            sheet.define("defineable-type", "ele-id", "defineable-type-1", "<filter id=\"defineable-type-1\"></filter>", "fingerprint");
            sheet.define("defineable-type", "ele-id2", "defineable-type-2", "<filter id=\"defineable-type-2\"></filter>", "fingerprint");
            
            sheet.consolidateDefines();
            
            expect(sheet.hasDefines()).to.equal(true);
            
            expect(sheet.getDefine("ele-id", "defineable-type").out).to.equal(sheet.getDefine("ele-id2", "defineable-type").out);
            
        });
        
        
        
    });
});
