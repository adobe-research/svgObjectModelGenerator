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
    svgWriterFill = require("../svgWriterFill.js"),
    sinon = require('sinon');

describe('SVGWriterFill', function (){
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });
    
    it("knows how to check for a gradient fill", function (){
        
        var goodCTX = {
            currentOMNode: {
                style: {
                    fill: {
                        style: "gradient"
                    }
                }
            }
        };
        
        expect(svgWriterFill.hasGradientFill(goodCTX)).to.equal(true);
        
        goodCTX.currentOMNode.style.fill.style = "somethingelse";
        expect(svgWriterFill.hasGradientFill(goodCTX)).to.equal(false);
    });
    
    it("can add a shape's solid fill attribute", function (){
        
        var goodCTX = {
            currentOMNode: {
                id: 3,
                style: {
                    fill: {
                        style: "solid",
                        color: "rgb(100, 50, 0)"
                    }
                }
            },
            omStylesheet: {
                hasStyleBlock: sinon.spy()
            },
            sOut: ""
        };
        svgWriterFill.addShapeFillAttr(goodCTX);
        
        expect(goodCTX.sOut).to.equal(' fill="rgb(100, 50, 0)"');
        expect(goodCTX.omStylesheet.hasStyleBlock.calledOnce).to.equal(true);
        
    });
    
    
    it("can add a shape's linear gradient fill attribute", function (){
        
        var testCTX = {
            currentOMNode: {
                id: 3,
                style: {
                    fill: {
                        style: "gradient",
                        gradient: {
                            type: "linear"
                        }
                    }
                }
            },
            omStylesheet: {
                hasStyleBlock: sinon.spy(),
                getDefine: sinon.spy()
            },
            didWrite: sinon.spy(),
            hasWritten: sinon.spy(),
            sOut: ""
        };
        sandbox.stub(console, "log");
        
        svgWriterFill.addShapeFillAttr(testCTX);
        expect(console.log.calledOnce).to.equal(true);
    });
    
    it("can add a shape's radial gradient fill attribute", function (){
        
        var testCTX = {
            currentOMNode: {
                id: 3,
                style: {
                    fill: {
                        style: "gradient",
                        gradient: {
                            type: "radial"
                        }
                    }
                }
            },
            omStylesheet: {
                hasStyleBlock: sinon.spy(),
                getDefine: sinon.spy()
            },
            didWrite: sinon.spy(),
            hasWritten: sinon.spy(),
            sOut: ""
        };
        sandbox.stub(console, "log");
        
        svgWriterFill.addShapeFillAttr(testCTX);
        expect(console.log.calledOnce).to.equal(true);
    });

    it("can add survive an unknown fill type", function (){
        
        var testCTX = {
            currentOMNode: {
                id: 3,
                style: {
                    fill: {
                        style: "frankenstein"
                    }
                }
            },
            sOut: ""
        };
        sandbox.stub(console, "log");
        
        svgWriterFill.addShapeFillAttr(testCTX);
        expect(console.log.calledOnce).to.equal(true);
    });
    
});
