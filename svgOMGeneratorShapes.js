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

/* Help construct the AGC */

(function () {
    "use strict";

    var omgStyles = require("./svgOMGeneratorStyles.js"),
        boundsToRect = require("./svgOMGeneratorUtils.js").boundsToRect,
        Utils = require("./utils.js"),
        round2 = Utils.round2;

    function SVGOMGeneratorShapes() {

        this.pathComponentOrigin = function (layer, fn) {
            if (layer.path && layer.path.pathComponents && layer.path.pathComponents.length === 1 && layer.path.pathComponents[0].origin) {
                return fn(layer.path, layer.path.pathComponents[0], layer.path.pathComponents[0].origin);
            }
            return false;
        };


        function _comparePts(ptA, ptB) {
            return round2(ptA[0]) == round2(ptB[0]) && round2(ptA[1]) == round2(ptB[1]);
        }

        function _ellipsePt(bnds, i) {
            return [bnds[i][0] + (bnds[(i + 1) % 4][0] - bnds[i][0]) / 2,
                    bnds[i][1] + (bnds[(i + 1) % 4][1] - bnds[i][1]) / 2];
        }

        function writeCurveToPath(previousPoint, currentPoint) {
            var controlPoint,
                lastPoint,
                pathData = "";

            lastPoint = previousPoint.forward ? previousPoint.forward : previousPoint.anchor;
            pathData += " C" + lastPoint.x + " " + lastPoint.y + " ";
            controlPoint = currentPoint.backward ? currentPoint.backward : currentPoint.anchor;
            pathData += controlPoint.x + " " + controlPoint.y + " ";
            pathData += currentPoint.anchor.x + " " + currentPoint.anchor.y;
            return pathData;
        }

        function generateSVGSubPathStream(subComponent) {
            var points = subComponent.points,
                closedSubpath = !!subComponent.closedSubpath,
                pathData = "",
                i = 0;

            for (; points && i < points.length; ++i) {
                if (!i) {
                    pathData = "M" + points[i].anchor.x + " " + points[i].anchor.y;
                } else {
                    pathData += writeCurveToPath(points[i - 1], points[i]);
                }
            }
            if (closedSubpath && points.length) {
                pathData += writeCurveToPath(points[points.length - 1], points[0]);
                pathData += "Z";
            }
            return pathData;
        }

        function generateSVGPathStream(path) {
            var pathData = "";

            for (var i = 0; i < path.pathComponents.length; ++i) {
                if (!path.pathComponents[i].subpathListKey) {
                    // FIXME: Generator versions before 1.3.0 do not provide path data. Some
                    // tests were not transformed to the new format. Either fix those
                    // JSON files or replace them. Return the rawPathData stream for now.
                    return path.rawPathData;
                }
                for (var j = 0; j < path.pathComponents[i].subpathListKey.length; ++j) {
                    pathData += generateSVGSubPathStream(path.pathComponents[i].subpathListKey[j]);
                }
            }

            return pathData;
        }

        this.inferTransformForShape = function (agcNode, layer, points, type) {

            var unshiftedRectBounds = [[layer.bounds.left, layer.bounds.top],
                                       [layer.bounds.right, layer.bounds.top],
                                       [layer.bounds.right, layer.bounds.bottom],
                                       [layer.bounds.left, layer.bounds.bottom]],
                txfmBounds = [],
                samePts = true;

            // Rounded rectangle case
            if (type == "roundedRect") {
                var top = round2(layer.bounds.top),
                    bottom = round2(layer.bounds.bottom),
                    left = round2(layer.bounds.left),
                    right = round2(layer.bounds.right),
                    allAligned = true;
                for (var i = 0, ii = points.length; i < ii; i++) {
                    var x = round2(points[i].anchor.x),
                        y = round2(points[i].anchor.y);
                    allAligned = allAligned && (x == left || x == right || y == top || y == bottom);
                    if (!allAligned) {
                        break;
                    }
                }
                if (allAligned) {
                    return true;
                }
            }

            if (points.length == 4) {
                points.forEach(function (pt, i) {
                    txfmBounds.push([pt.anchor.x, pt.anchor.y]);

                    if (type != "ellipse") {
                        if (!_comparePts(txfmBounds[i], unshiftedRectBounds[i])) {
                            samePts = false;
                        }
                    } else {
                        if (!_comparePts(txfmBounds[i], _ellipsePt(unshiftedRectBounds, i))) {
                            samePts = false;
                        }
                    }
                });

                return samePts;
            }
            return false;
        };


        this.addEllipse = function (agcNode, layer, writer) {
            return this.pathComponentOrigin(layer, function (path, component, origin) {
                var newBounds;
                if (origin.type === "ellipse") {

                    if (component.subpathListKey && component.subpathListKey[0] && component.subpathListKey[0].points) {
                        newBounds = this.inferTransformForShape(agcNode, layer, component.subpathListKey[0].points, origin.type);
                        if (!newBounds) {
                            //be a path if we can't be an ellipse
                            return false;
                        }
                    }

                    agcNode.visualBounds = boundsToRect(layer.boundsWithFX || layer.bounds);

                    agcNode.shape = {
                        type: "ellipse",
                        cx: origin.bounds.left + (origin.bounds.right - origin.bounds.left) / 2,
                        cy: origin.bounds.top + (origin.bounds.bottom - origin.bounds.top) / 2,
                        rx: (origin.bounds.right - origin.bounds.left) / 2,
                        ry: (origin.bounds.bottom - origin.bounds.top) / 2
                    };

                    omgStyles.addStylingData(agcNode, layer, origin.bounds, writer);

                    return true;
                }
                return false;
            }.bind(this));
        };

        this.addCircle = function (agcNode, layer, writer) {
            return this.pathComponentOrigin(layer, function (path, component, origin) {
                if (origin.type === "ellipse") {

                    var w = parseInt(origin.bounds.right, 10) - parseInt(origin.bounds.left, 10),
                        h = parseInt(origin.bounds.bottom, 10) - parseInt(origin.bounds.top, 10);

                    if (w == h) {
                        agcNode.visualBounds = boundsToRect(layer.boundsWithFX || layer.bounds);

                        agcNode.shape = {
                            type: "circle",
                            cx: origin.bounds.left + (origin.bounds.right - origin.bounds.left) / 2,
                            cy: origin.bounds.top + (origin.bounds.bottom - origin.bounds.top) / 2,
                            r: (origin.bounds.right - origin.bounds.left) / 2
                        };
                        omgStyles.addStylingData(agcNode, layer, origin.bounds, writer);
                        return true;
                    }
                }
                return false;
            });
        };

        this.addRect = function (agcNode, layer, writer) {
            return this.pathComponentOrigin(layer, function (path, component, origin) {

                var newBounds,
                    shapeRadii;

                if (origin.type === "rect" || origin.type === "roundedRect") {

                    if (component.subpathListKey && component.subpathListKey[0] && component.subpathListKey[0].points) {
                        newBounds = this.inferTransformForShape(agcNode, layer, component.subpathListKey[0].points, origin.type);
                        if (!newBounds) {
                            //be a path if we can't be a rect
                            return false;
                        }
                    }

                    agcNode.visualBounds = boundsToRect(layer.boundsWithFX || layer.bounds);
                    shapeRadii = origin.radii;
                    if (shapeRadii) {
                        shapeRadii = shapeRadii.slice();
                        shapeRadii.unshift(shapeRadii.pop());
                    }

                    agcNode.shape = {
                        type: "rect",
                        x: origin.bounds.left,
                        y: origin.bounds.top,
                        width: origin.bounds.right - origin.bounds.left,
                        height: origin.bounds.bottom - origin.bounds.top,
                        r: shapeRadii
                    };

                    omgStyles.addStylingData(agcNode, layer, origin.bounds, writer);

                    return true;
                }
                return false;
            }.bind(this));
        };

        this.addPath = function (agcNode, layer, writer) {
            var path = layer.path;

            if (path && path.pathComponents) {

                agcNode.visualBounds = boundsToRect(layer.boundsWithFX || layer.bounds);

                agcNode.shape = {
                    type: "path",
                    path: generateSVGPathStream(path)
                };

                omgStyles.addStylingData(agcNode, layer, path.bounds, writer);

                return true;
            }
            return false;
        };

        this.addShapeData = function (agcNode, layer, writer) {
            if (this.addCircle(agcNode, layer, writer) ||
                this.addEllipse(agcNode, layer, writer) ||
                this.addRect(agcNode, layer, writer) ||
                this.addPath(agcNode, layer, writer)) {
                return true;
            }
            console.log("Error: No shape data added for " + JSON.stringify(layer));
            return false;
        };
    }

    module.exports = new SVGOMGeneratorShapes();

}());

