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
    Matrix = require("../matrix.js"),
    sinon = require('sinon');

describe('Matrix', function (){
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });
    
    it("knows if a matrix only has translate", function () {
        expect(Matrix.containsOnlyTranslate([[1, 0, 0, 0],
                                             [0, 1, 0, 0],
                                             [0, 0, 1, 0],
                                             [3, 3, 0, 1]
                                            ])).to.equal(true);
        expect(Matrix.containsOnlyTranslate([[1, 2.2, 0, 0],
                                             [0, 1, 0, 0],
                                             [0, 0, 1, 0],
                                             [3, 3, 0, 1]
                                            ])).to.equal(false);
    });
    
    it("knows how to decompose a transform", function (){
        var matrix4x4 = Matrix.createMatrix([[0.707107, -0.707107, 0, 0],
                                             [0.707107, 0.707107, 0, 0],
                                             [0, 0, 1, 0],
                                             [0, 0, 0, 1]
                                            ]),
            decomposed = Matrix.decomposeTransform(matrix4x4),
            rad2Deg = 180.0 / Math.PI;
        
        expect(decomposed.rotation[2] * rad2Deg).to.equal(-45.0);
        expect(Matrix.writeDecomposedTransform(decomposed)).to.equal("rotate(-45)");
    });
    
    it("knows how to decompose and write a transform", function (){
        var matrix4x4 = Matrix.createMatrix([[1.210279, -1.686825, 0, 0],
                                             [2.229008, 0.345909, 0, 0],
                                             [0, 0, 1, 0],
                                             [5, 10, 0, 1]
                                            ]),
            decomposed = Matrix.decomposeTransform(matrix4x4),
            rad2Deg = 180.0 / Math.PI;
        
        expect(Matrix.writeDecomposedTransform(decomposed)).to.equal("translate(5 10) rotate(-54.34) skewX(28.99) scale(2.08 2.01)");
    });
    
    it("knows how to transform points", function (){
        var matrix4x4 = Matrix.createMatrix([[0.707107, -0.707107, 0, 0],
                                             [0.707107, 0.707107, 0, 0],
                                             [0, 0, 1, 0],
                                             [0, 0, 0, 1]
                                            ]),
            pts = matrix4x4.transformPoints([[0,0], [10, 15]]);
        
        expect(pts[0][0]).to.equal(0);
        expect(pts[0][1]).to.equal(0);
        
        expect(pts[1][0]).to.equal(17.677675);
        expect(pts[1][1]).to.equal(3.5355349999999994);
    });
    
    it("knows how to invert", function (){
        var matrix4x4 = Matrix.createMatrix([[0.707107, -0.707107, 0, 0],
                                             [0.707107, 0.707107, 0, 0],
                                             [0, 0, 1, 0],
                                             [0, 0, 0, 1]
                                            ]),
            pt = matrix4x4.transformPoint([10, 15]);
        
        expect(pt[0]).to.equal(17.677675);
        expect(pt[1]).to.equal(3.5355349999999994);
        
        matrix4x4 = matrix4x4.inverse();
        
        pt = matrix4x4.transformPoint(pt);
        
        expect(pt[0]).to.equal(10);
        expect(pt[1]).to.equal(15);
    });
    
    it("knows how to rotate", function (){
        var matrix4x4 = Matrix.createMatrix([[0.707107, -0.707107, 0, 0],
                                             [0.707107, 0.707107, 0, 0],
                                             [0, 0, 1, 0],
                                             [0, 0, 0, 1]
                                            ]),
            decomposed;
        
        matrix4x4 = matrix4x4.rotateZ(-45);
        
        decomposed = Matrix.decomposeTransform(matrix4x4);
        
        expect(Matrix.writeDecomposedTransform(decomposed)).to.equal("rotate(-90)");
    });
    
    it("has skew API", function () {
        var matrix4x4 = Matrix.createMatrix(),
            decomposed;
        
        matrix4x4 = matrix4x4.skew(10, 45, false);
        
        decomposed = Matrix.decomposeTransform(matrix4x4);
        
        expect(Matrix.writeDecomposedTransform(decomposed)).to.equal("rotate(40.37) skewX(69.18) scale(1.54 0.65)");
    });
    
    it("knows how to scale", function () {
        var matrix4x4 = Matrix.createMatrix(),
            decomposed;
        
        matrix4x4 = matrix4x4.scale(2, 3);
        
        decomposed = Matrix.decomposeTransform(matrix4x4);
        
        expect(Matrix.writeDecomposedTransform(decomposed)).to.equal("scale(2 3)");
    });
    
    it("knows how to translate", function () {
        var matrix4x4 = Matrix.createMatrix().identity(),
            decomposed;
        
        matrix4x4 = matrix4x4.translate3d(5, 10, 0);
        
        decomposed = Matrix.decomposeTransform(matrix4x4);
        
        expect(Matrix.writeDecomposedTransform(decomposed)).to.equal("translate(5 10)");
    });
    
    
});
