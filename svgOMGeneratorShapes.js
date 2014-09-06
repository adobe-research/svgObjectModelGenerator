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
    
    var omgStyles = require("./svgOMGeneratorStyles.js");
    
	function SVGOMGeneratorShapes() {
        
        this.pathComponentOrigin = function (layer, fn) {
            if (layer.path && layer.path.pathComponents && layer.path.pathComponents.length === 1 && layer.path.pathComponents[0].origin) {
                return fn(layer.path, layer.path.pathComponents[0], layer.path.pathComponents[0].origin);
            }
            return false;
        };
        
        this.addEllipse = function (svgNode, layer) {
            return this.pathComponentOrigin(layer, function (path, component, origin) {
                if (origin.type === "ellipse") {
                    svgNode.shape = "ellipse";
                    svgNode.shapeBounds = origin.bounds;
                    
                    omgStyles.addStylingData(svgNode, layer);
                    
                    return true;
                }
                return false;
            });
        };
        
        this.addCircle = function (svgNode, layer) {
            return this.pathComponentOrigin(layer, function (path, component, origin) {
                if (origin.type === "ellipse") {
                    
                    var w = parseInt(origin.bounds.right) - parseInt(origin.bounds.left),
                        h = parseInt(origin.bounds.bottom) - parseInt(origin.bounds.top);
                    
                    if (w == h) {
                        svgNode.shape = "circle";
                        svgNode.shapeBounds = origin.bounds;
                        
                        omgStyles.addStylingData(svgNode, layer);
                        
                        return true;
                    }
                }
                return false;
            });
        };

        this.addRect = function (svgNode, layer) {
            return this.pathComponentOrigin(layer, function (path, component, origin) {
                if (origin.type === "rect" || origin.type === "roundedRect") {
                    if (origin.radii &&
                        (origin.radii[0] != origin.radii[1] ||
                         origin.radii[0] != origin.radii[2] ||
                         origin.radii[0] != origin.radii[3])) {
                        return false;
                    }

                    svgNode.shape = "rect";
                    svgNode.shapeBounds = origin.bounds;
                    svgNode.shapeRadii = origin.radii;
                        
                    omgStyles.addStylingData(svgNode, layer);

                    return true;
                }
                return false;
            });
        };
        
        this.addPath = function (svgNode, layer) {
            var path = layer.path,
                pathData = layer.path.rawPathData;
            
            if (path && pathData) {
                svgNode.shape = "path";
                
                svgNode.shapeBounds = path.bounds;
                svgNode.pathData = pathData;
                
                omgStyles.addStylingData(svgNode, layer);
                
                return true;
            }
            return false;
        };
        
        this.addShapeData = function(svgNode, layer) {
            if (this.addCircle(svgNode, layer) || 
                this.addEllipse(svgNode, layer) ||
                this.addRect(svgNode, layer) ||
                this.addPath(svgNode, layer)) {
                return true;
            }
            console.log("Error: No shape data added for " + JSON.stringify(layer));
            return false;
        };
	}

	module.exports = new SVGOMGeneratorShapes();
    
}());
     
    