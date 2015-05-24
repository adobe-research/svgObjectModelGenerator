// Copyright (c) 2014, 2015 Adobe Systems Incorporated. All rights reserved.
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
    ID = require("../idGenerator.js"),
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
                    bounds: {
                        left: 0,
                        right: 50,
                        top: 0,
                        bottom: 100
                    }
                },
                children:[
                    {
                        type: "shape",
                        visible: true,
                        visualBounds: {
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
                                width: 3
                            }
                        }
                    },
                    {
                        type: "text",
                        visible: true,
                        visualBounds: {
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
                                visible: true,
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
            svgOM2 = {
                global: {
                    bounds: {
                        left: 0,
                        right: 50,
                        top: 0,
                        bottom: 100
                    }
                },
                children:[
                    {
                        type: "shape",
                        visible: true,
                        visualBounds: {
                            left: 79.29,
                            right: 220.71,
                            top: 79.29,
                            bottom: 220.71
                        },
                        shape: {
                            type: "rect",
                            x: 100,
                            y: 100,
                            width: 100,
                            height: 100
                        },
                        transform: {
                            "0": [
                                0.7071067811865476,
                                0.7071067811865475,
                                0,
                                0
                            ],
                            "1": [
                                -0.7071067811865475,
                                0.7071067811865476,
                                0,
                                0
                            ],
                            "2": [
                                0,
                                0,
                                1,
                                0
                            ],
                            "3": [
                                150,
                                -62.132034355964265,
                                0,
                                1
                            ],
                            "size": 4
                        }
                    }
                ]
            },
            svgOM3 = {
                global: {
                    bounds: {
                        left: 0,
                        right: 400,
                        top: 0,
                        bottom: 400
                    }
                },
                children:[
                    {
                        type: "shape",
                        visible: true,
                        visualBounds: {
                            left: 100,
                            right: 200,
                            top: 100,
                            bottom: 200
                        },
                        shape: {
                            type: "rect",
                            x: 100,
                            y: 100,
                            width: 100,
                            height: 100
                        }
                    }
                ]
            },
            ctx = {
                svgOM: svgOM,
                ID: new ID(),
                currentOMNode: svgOM,
                contentBounds: {},
                config: {
                    trimToArtBounds: true
                }
            },
            ctx2 = {
                svgOM: svgOM2,
                ID: new ID(),
                currentOMNode: svgOM2,
                contentBounds: {},
                config: {
                    trimToArtBounds: true
                }
            },
            ctx3 = {
                svgOM: svgOM3,
                ID: new ID(),
                currentOMNode: svgOM3,
                contentBounds: {},
                config: {
                    cropRect: {
                        width: 200,
                        height: 200
                    },
                    trimToArtBounds: true
                }
            };
        
        svgWriterPreprocessor.processSVGOM(ctx);
        
        expect(ctx._viewBox[0]).to.equal(0);
        expect(ctx._viewBox[1]).to.equal(0);
        expect(ctx._viewBox[2]).to.equal(33);
        expect(ctx._viewBox[3]).to.equal(93);
        
        expect(svgOM.children[0].visualBounds.top).to.equal(1.5);
        expect(svgOM.children[0].visualBounds.left).to.equal(1.5);
        expect(svgOM.children[0].visualBounds.right).to.equal(31.5);
        expect(svgOM.children[0].visualBounds.bottom).to.equal(91.5);

        svgWriterPreprocessor.processSVGOM(ctx2);

        expect(ctx2._viewBox[0]).to.equal(0);
        expect(ctx2._viewBox[1]).to.equal(0);
        expect(ctx2._viewBox[2]).to.equal(141.42000000000002);
        expect(ctx2._viewBox[3]).to.equal(141.42000000000002);

        svgWriterPreprocessor.processSVGOM(ctx3);

        expect(ctx3._viewBox[0]).to.equal(0);
        expect(ctx3._viewBox[1]).to.equal(0);
        expect(ctx3._viewBox[2]).to.equal(200);
        expect(ctx3._viewBox[3]).to.equal(200);
        expect(ctx3.svgOM.children[0].shape.x).to.equal(50);
        expect(ctx3.svgOM.children[0].shape.y).to.equal(50);
    });
    
});
