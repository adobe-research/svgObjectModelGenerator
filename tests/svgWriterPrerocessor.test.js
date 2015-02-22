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
    svgWriterPreprocessor = require("../svgWriterPreprocessor.js"),
    sinon = require('sinon');

describe('SVGWriterPreprocessor', function (){
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });
    
    it("knows how to trim to artwork", function () {
        
        var svgOM = {
                global: {
                    viewBox: {
                        left: 0,
                        right: 50,
                        top: 0,
                        bottom: 100
                    }
                },
                children:[
                    {
                        type: "shape",
                        shapeBounds: {
                            left: 20,
                            right: 50,
                            top: 10,
                            bottom: 100
                        },
                        shape: {
                            type: "rect",
                            x: 20,
                            y: 10,
                            width: 30,
                            height: 90
                        },
                        style: {
                            stroke: {
                                strokeEnabled: true,
                                lineWidth: 3
                            }
                        }
                    },
                    {
                        type: "text",
                        shapeBounds: {
                            left: 20,
                            right: 50,
                            top: 10,
                            bottom: 100
                        },
                        position: {
                            x: 22.0,
                            y: 33.0
                        },
                        children: [
                            {
                                type: "tspan",
                                text: "spanny t",
                                position: {
                                    x: 10.0,
                                    y: 20.9
                                }
                            }
                        ]
                    }
                ]
            },
            ctx = {
                svgOM: svgOM,
                currentOMNode: svgOM,
                contentBounds: {},
                viewBox: {
                    left: 0,
                    right: 50,
                    top: 0,
                    bottom: 100
                },
                config: {
                    trimToArtBounds: true
                }
            };
        
        svgWriterPreprocessor.processSVGOM(ctx);
        
        expect(ctx.viewBox.top).to.equal(0);
        expect(ctx.viewBox.left).to.equal(0);
        expect(ctx.viewBox.right).to.equal(33);
        expect(ctx.viewBox.bottom).to.equal(93);
        
        expect(svgOM.children[0].shapeBounds.top).to.equal(1);
        expect(svgOM.children[0].shapeBounds.left).to.equal(1);
        expect(svgOM.children[0].shapeBounds.right).to.equal(31);
        expect(svgOM.children[0].shapeBounds.bottom).to.equal(91);
        
        /*
        //if we don't shift bounds...
        
        expect(svgOM.viewBox.top).to.equal(8.5);
        expect(svgOM.viewBox.left).to.equal(18.5);
        expect(svgOM.viewBox.right).to.equal(51.5);
        expect(svgOM.viewBox.bottom).to.equal(101.5);
        
        expect(svgOM.children[0].shapeBounds.top).to.equal(10);
        expect(svgOM.children[0].shapeBounds.left).to.equal(20);
        expect(svgOM.children[0].shapeBounds.right).to.equal(50);
        expect(svgOM.children[0].shapeBounds.bottom).to.equal(100);
        */
    });
    
});
