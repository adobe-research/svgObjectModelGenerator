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
                        type: "gradient"
                    }
                }
            }
        };
        
        expect(svgWriterFill.hasGradientFill(goodCTX)).to.equal(true);
        
        goodCTX.currentOMNode.style.fill.type = "somethingelse";
        expect(svgWriterFill.hasGradientFill(goodCTX)).to.equal(false);
    });
    
    it("can add a shape's solid fill attribute", function (){
        
        var goodCTX = {
            currentOMNode: {
                id: 3,
                style: {
                    fill: {
                        type: "solid",
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
                        type: "gradient",
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
                        type: "gradient",
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
                        type: "frankenstein"
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
