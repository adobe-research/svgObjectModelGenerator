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
    svgWriterStroke = require("../svgWriterStroke.js"),
    sinon = require('sinon');

describe('SVGWriterStroke', function (){
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });
    
    it("knows how to add a shape's stroke attribute", function (){
        
        var goodCTX = {
            currentOMNode: {
                style: {
                    stroke: {
                        strokeEnabled: true,
                        color: "rgb(1, 2, 3)",
                        lineWidth: 3
                    }
                }
            },
            omStylesheet: {
                hasStyleBlock: sinon.spy()
            },
            sOut: ""
        };
        
        svgWriterStroke.addShapeStrokeAttr(goodCTX);
        expect(goodCTX.sOut).to.equal(' stroke="rgb(1, 2, 3)" stroke-width="3"');
    });
    
    it("knows how to externalize fringe styles", function (){
        var styleBlock = {
                addRule: sinon.spy()
            },
            goodCTX = {
                currentOMNode: {
                    style: {
                        stroke: {
                            strokeEnabled: true,
                            color: "rgb(1, 2, 3)",
                            miterLimit: 300,
                            dashOffset: 4
                        }
                    }
                },
                omStylesheet: {
                    hasStyleBlock: sinon.spy(),
                    getStyleBlock: function () { return styleBlock; }
                },
                sOut: ""
            };
        
        svgWriterStroke.externalizeStyles(goodCTX);
        expect(styleBlock.addRule.callCount).to.equal(5);
    });
    
   
   
    
});
