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
/*global define: true, require: true */

/* Help construct the svgOM */

(function () {
"use strict";
    
    var omgStyles = require("./svgOMGeneratorStyles.js"),
        Utils = require("./utils.js"),
        Matrix = require("./matrix.js"),
        omgUtils = require("./svgOMGeneratorUtils.js"),
        round2 = Utils.round2,
        round1k = Utils.round1k;
    
	function SVGOMGeneratorShapes() {
        
        this.pathComponentOrigin = function (layer, fn) {
            if (layer.path && layer.path.pathComponents && layer.path.pathComponents.length === 1 && layer.path.pathComponents[0].origin) {
                return fn(layer.path, layer.path.pathComponents[0], layer.path.pathComponents[0].origin);
            }
            return false;
        };
        
        
        function _comparePts (ptA, ptB) {
            if (round2(ptA[0]) === round2(ptB[0]) &&
                round2(ptA[1]) === round2(ptB[1])) {
                return true;
            } else {
                return false;
            }
        }
        
        function _ellipsePt(bnds, i) {
            return [bnds[i][0] + (bnds[(i + 1) % 4][0] - bnds[i][0])/2.0,
                    bnds[i][1] + (bnds[(i + 1) % 4][1] - bnds[i][1])/2.0];
        }
        
        this.inferTransformForShape = function (svgNode, layer, points, ellipse) {
            
            var rectBounds = [[0, 0],
                              [layer.bounds.right - layer.bounds.left, 0],
                              [layer.bounds.right - layer.bounds.left, layer.bounds.bottom - layer.bounds.top],
                              [0, layer.bounds.bottom - layer.bounds.top]],
                unshiftedRectBounds = [[layer.bounds.left, layer.bounds.top],
                                       [layer.bounds.right, layer.bounds.top],
                                       [layer.bounds.right, layer.bounds.bottom],
                                       [layer.bounds.left, layer.bounds.bottom]],
                txfmBounds = [],
                mtrxResult,
                mtrx,
                decomposed,
                samePts = true,
                newBounds = {},
                txOffset;
            
            // Rounded rectangle case
            if (points.length == 8 && !ellipse) {
                if (round2(points[0].anchor.y) == round2(layer.bounds.top) &&
                    round2(points[1].anchor.y) == round2(layer.bounds.top) &&
                    round2(points[2].anchor.x) == round2(layer.bounds.right) &&
                    round2(points[3].anchor.x) == round2(layer.bounds.right) &&
                    round2(points[4].anchor.y) == round2(layer.bounds.bottom) &&
                    round2(points[5].anchor.y) == round2(layer.bounds.bottom) &&
                    round2(points[6].anchor.x) == round2(layer.bounds.left) &&
                    round2(points[7].anchor.x) == round2(layer.bounds.left) &&
                    round2(points[0].anchor.x) == round2(points[5].anchor.x) &&
                    round2(points[1].anchor.x) == round2(points[4].anchor.x) &&
                    round2(points[7].anchor.y) == round2(points[2].anchor.y) &&
                    round2(points[6].anchor.y) == round2(points[3].anchor.y)
                   ) {
                    return true;
                }
            }

            if (points.length === 4) {
                points.forEach(function (pt, i) {
                    txfmBounds.push([pt.anchor.x, pt.anchor.y]);
                    
                    if (!ellipse) {
                        if (!_comparePts(txfmBounds[i], unshiftedRectBounds[i])) {
                            samePts = false;
                        }
                    } else {
                        if (!_comparePts(txfmBounds[i], _ellipsePt(unshiftedRectBounds, i))) {
                            samePts = false;
                        }
                    }
                });
                
                if (!samePts) {
                    
                    //Work in progress.  Working for rectangles, but not for ellipse.  Even for rectangles it does not position the shape properly.
                    
                    /*
                    //console.log("unshifted rect bounds = " + JSON.stringify(unshiftedRectBounds, null, "  "));
                    
                    mtrxResult = Matrix.matrixFromPoints(unshiftedRectBounds, txfmBounds);
                    if (mtrxResult.matrix) {
                        mtrx = mtrxResult.matrix;
                        
                        //console.log("bounds out == " + JSON.stringify(mtrxResult.bounds, null, "  "));
                        
                        samePts = true;
                        txOffset = (txfmBounds[1][0] - txfmBounds[0][0])/2.0;
                        
                        //find the center-point and shift the points by it
                        var ctrX = (points[0].anchor.x + points[1].anchor.x + points[2].anchor.x + points[3].anchor.x) / 4.0,
                            ctrY = (points[0].anchor.y + points[1].anchor.y + points[2].anchor.y + points[3].anchor.y) / 4.0,
                            boundCtrX = (mtrxResult.bounds[0][0] + mtrxResult.bounds[1][0]) / 2.0,
                            boundCtrY = (mtrxResult.bounds[0][1] + mtrxResult.bounds[3][1]) / 2.0;
                        
                        //console.log("CENTER == " + ctrX + ", " + ctrY);

                        points.forEach(function (pt, i) {
                            
                            var ptBound,
                                txfmPoint;
                            
                            if (!ellipse) {
                                ptBound = [mtrxResult.bounds[i][0] - boundCtrX, mtrxResult.bounds[i][1] - boundCtrY];
                            } else {
                                ptBound = _ellipsePt(mtrxResult.bounds, i);
                                ptBound[0] -= boundCtrX;
                                ptBound[1] -= boundCtrY;
                            }
                            
                            txfmPoint = mtrx.transformPoint(ptBound);
                            txfmPoint[0] += ctrX;
                            txfmPoint[1] += ctrY;
                            
                            //console.log("Synthetic PT: " + JSON.stringify(txfmPoint));
                            //console.log("Data PT: " + JSON.stringify(pt.anchor));
                            
                            if (!_comparePts([pt.anchor.x, pt.anchor.y], txfmPoint)) {
                                samePts = false;
                            }
                        });
                        if (samePts) {
                            console.log("INFERRED = " + JSON.stringify(Matrix.writeDecomposedTransform(Matrix.decomposeTransform(mtrx))));
                            
                            svgNode.transformTX = txOffset;
                            svgNode.transformTY = 0;
                            svgNode.transform = mtrxResult.matrix;
                            
                            //apply the bounds revision
                            newBounds.top = mtrxResult.bounds[0][1];
                            newBounds.right = mtrxResult.bounds[1][0];
                            newBounds.bottom = mtrxResult.bounds[3][1];
                            newBounds.left = mtrxResult.bounds[0][0];
                            
                            return newBounds;
                        } else {
                            console.log("BAD GUESS => " + JSON.stringify(Matrix.writeDecomposedTransform(Matrix.decomposeTransform(mtrx))));
                        }   
                    }
                    */
                    
                    //fallback to the raw path data
                    return false;
                } else {
                    //natural shape, untransformed
                    return true;
                }
            }
            return false;
        };
        
        
        this.addEllipse = function (svgNode, layer, dpi) {
            return this.pathComponentOrigin(layer, function (path, component, origin) {
                var newBounds;
                if (origin.type === "ellipse") {
                    
                    if (component.subpathListKey && component.subpathListKey[0] &&  component.subpathListKey[0].points) {
                        newBounds = this.inferTransformForShape(svgNode, layer, component.subpathListKey[0].points, true);
                        if (!newBounds) {
                            //be a path if we can't be an ellipse
                            return false;
                        }
                    }

                    if (typeof newBounds === "object") {
                        svgNode.originBounds = newBounds;
                    }
                    svgNode.shapeBounds = origin.bounds;
                    
                    svgNode.shape = {
                        type: "ellipse",
                        cx: origin.bounds.left + (origin.bounds.right - origin.bounds.left) / 2,
                        cy: origin.bounds.top + (origin.bounds.bottom - origin.bounds.top) / 2,
                        rx: (origin.bounds.right - origin.bounds.left) / 2,
                        ry: (origin.bounds.bottom - origin.bounds.top) / 2
                    }

                    omgStyles.addStylingData(svgNode, layer, dpi);
                    
                    return true;
                }
                return false;
            }.bind(this));
        };
        
        this.addCircle = function (svgNode, layer, dpi) {
            return this.pathComponentOrigin(layer, function (path, component, origin) {
                if (origin.type === "ellipse") {
                    
                    var w = parseInt(origin.bounds.right) - parseInt(origin.bounds.left),
                        h = parseInt(origin.bounds.bottom) - parseInt(origin.bounds.top);
                    
                    if (w == h) {
                        svgNode.shapeBounds = origin.bounds;

                        svgNode.shape = {
                            type: "circle",
                            cx: origin.bounds.left + (origin.bounds.right - origin.bounds.left) / 2,
                            cy: origin.bounds.top + (origin.bounds.bottom - origin.bounds.top) / 2,
                            r: (origin.bounds.right - origin.bounds.left) / 2
                        }
                        omgStyles.addStylingData(svgNode, layer, dpi);
                        return true;
                    }
                }
                return false;
            });
        };

        this.addRect = function (svgNode, layer, dpi) {
            return this.pathComponentOrigin(layer, function (path, component, origin) {
                
                var newBounds;
                
                if (origin.type === "rect" || origin.type === "roundedRect") {
                    if (origin.radii &&
                        (origin.radii[0] != origin.radii[1] ||
                         origin.radii[0] != origin.radii[2] ||
                         origin.radii[0] != origin.radii[3])) {
                        return false;
                    }

                    if (component.subpathListKey && component.subpathListKey[0] &&  component.subpathListKey[0].points) {
                        newBounds = this.inferTransformForShape(svgNode, layer, component.subpathListKey[0].points, false);
                        if (!newBounds) {
                            //be a path if we can't be a rect
                            return false;
                        }
                    }
                    
                    //may have acquired shapeBounds while inferring the transform
                    if (typeof newBounds === "object") {
                        svgNode.originBounds = newBounds;
                    }
                    svgNode.shapeBounds = origin.bounds;
                    svgNode.shapeRadii = origin.radii;

                    svgNode.shape = {
                        type: "rect",
                        x: origin.bounds.left,
                        y: origin.bounds.top,
                        width: origin.bounds.right - origin.bounds.left,
                        height: origin.bounds.bottom - origin.bounds.top,
                        r: origin.radii
                    }

                    omgStyles.addStylingData(svgNode, layer, dpi);

                    return true;
                }
                return false;
            }.bind(this));
        };
        
        this.addPath = function (svgNode, layer, dpi) {
            var path = layer.path,
                pathData = layer.path.rawPathData;
            
            if (path && pathData) {
                
                svgNode.shapeBounds = path.bounds;

                svgNode.shape = {
                    type: "path",
                    path: pathData
                }

                omgStyles.addStylingData(svgNode, layer, dpi);
                
                return true;
            }
            return false;
        };
        
        this.addShapeData = function(svgNode, layer, dpi) {
            if (this.addCircle(svgNode, layer, dpi) || 
                this.addEllipse(svgNode, layer, dpi) ||
                this.addRect(svgNode, layer, dpi) ||
                this.addPath(svgNode, layer, dpi)) {
                return true;
            }
            console.log("Error: No shape data added for " + JSON.stringify(layer));
            return false;
        };
	}

	module.exports = new SVGOMGeneratorShapes();
    
}());
     
