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
/*global define: true, require: true, module: true */

/*
 * Generate an abstract svgOM from the Generator JSON
 * Loosely based on the CSSON work for generator-css
*/

(function () {
    "use strict";

    var SVGOMWriter = require("./svgOMWriter.js"),
        omgShapes = require("./svgOMGeneratorShapes.js"),
        omgText = require("./svgOMGeneratorText.js"),
        omgImage = require("./svgOMGeneratorImage.js"),
        omgStyles = require("./svgOMGeneratorStyles.js");

    var layerTypeMap = {
        "backgroundLayer": "background",
        "shapeLayer": "shape",
        "textLayer": "text",
        "layerSection": "group",
        "layer": "generic"
    };

    function getSVGLayerType(layer) {
        if (!layerTypeMap[layer.type]) {
            console.log("[svgOMGenerator] skip '" + layer.type + "' - consider adding");
        }

        return layer.artboard ? "artboard" : layerTypeMap[layer.type];
    }

    function getSVGID(layer) {
        var l = "layer" + layer.index, // Default is 'layerN'
            wsSequence = false;

        function _toClass(c) {
            var ret = c,
                skip = ".<>[]`~!@#$%^&*(){}|?/\\:;\"',";

            if (c.trim().length === 0) { // Whitespace?
                if (wsSequence === false) {
                    ret = "-"; // Convert first WS in a sequence to a dash.
                    wsSequence = true;
                } else {
                    ret = "";
                }
            } else {
                wsSequence = false;
            }

            if (skip.indexOf(c) >= 0) {
                ret = "";
            }

            return ret;
        }

        if (layer.name && layer.type !== "textLayer") {
            // Otherwise, lowercase everthing. Collapse 1+ whitespace to dash.
            l = layer.name.toLowerCase();
            var buffer = l.split("");
            buffer = buffer.map(_toClass);
            l = buffer.join("");
        }

        return l;
    }

    function layerSpecActive(layerSpec) {
        return !!(layerSpec && typeof layerSpec === "number");
    }

    function layerSpecMatches(layer, layerSpec) {
        return layerSpecActive(layerSpec) && layer.id === layerSpec;
    }

    function layerShouldBeRasterized(layer, aErrors) {
        var layerType = getSVGLayerType(layer),
            imageType = (layerType === "generic" && layer.bounds.right - layer.bounds.left > 0 && layer.bounds.bottom - layer.bounds.top > 0);
        
        if (!imageType) {
            //see if there are special cases to consider...
            if (layer.strokeStyle && layer.strokeStyle.enabled && layer.strokeStyle.strokeStyleContent && layer.strokeStyle.strokeStyleContent.pattern) {
                imageType = true;
                aErrors.push("Stroke patterns are rasterized while extracting SVG.");
            } else if (layer.fill && layer.fill.pattern) {
                imageType = true;
                aErrors.push("Fill patterns are rasterized while extracting SVG.");
            }
        }
        return imageType;
    }

    function extractSVGOM (psd, opts) {
        var layers = psd.layers,
            writer = new SVGOMWriter(),
            iL,
            lyr,
            layerSpec = opts.layerSpec,
            layerSpecFound = !layerSpecActive(layerSpec),
            dpi = (psd.resolution) ? psd.resolution : 72.0;

        function extractLayerSVG(layer) {
            var layerType,
                svgNode,
                property,
                i,
                childLyr,
                justTraverse = false,
                specFound = layerSpecFound,
                layerVisible = true;
            
            if (!layerSpecFound && layerSpecActive(layerSpec)) {
                if (layerSpecMatches(layer, layerSpec)) {
                    //pretend like it is... we want to render it!
                    layer.visible = true;
                    
                    layerSpecFound = true;
                } else {
                    justTraverse = true;
                }
            }

            if (layer.visible === false) {
                layerVisible = false;
            }

            layerType = getSVGLayerType(layer);
            if (!justTraverse) {
                svgNode = writer.addSVGNode(getSVGID(layer), layerType, layerVisible);
                svgNode.title = layer.name;
                if (layer.boundsWithFX) {
                    svgNode.boundsWithFX = layer.boundsWithFX;                    
                }
            }

            switch (layerType) {
                case "shape":
                    if (!justTraverse) {
                        omgShapes.addShapeData(svgNode, layer, writer);
                    }
                    break;
                case "text":
                    if (!justTraverse) {
                        omgText.addTextData(svgNode, layer, writer);
                    }
                    break;
                case "generic":
                    if (!justTraverse) {
                        // FIXME: Could also be an empty layer or a gradient layer.
                        // Treat all of them as image for now.
                        omgImage.addImageData(svgNode, layer, writer);
                    }
                    break;
                case "artboard":
                    if (!justTraverse) {
                        writer.setArtboard(svgNode.id, svgNode.title, layer.artboard.artboardRect);
                    }
                case "group":
                    if (!justTraverse) {
                        
                        omgStyles.addGroupStylingData(svgNode, layer, writer);
                        writer.pushCurrent(svgNode);
                    }
                    if (layer.layers) {
                        for (i = layer.layers.length - 1; i >= 0; i--) {
                            childLyr = layer.layers[i];
                            extractLayerSVG(childLyr);
                        }
                    }
                    if (!justTraverse) {
                        writer.popCurrent();
                    }
                    break;
                default:
                    break;
            }
            layerSpecFound = specFound;
        }

        writer.setDocTitle(psd.file);
        writer.setDocViewBox(psd.bounds);
        writer.setDocBounds(psd.bounds);
        writer.setDocPxToInchRatio(psd.resolution);
        writer.setDocGlobalLight(psd.globalLight);

        if (layers) {
            for (iL = layers.length - 1; iL >= 0; iL--) {
                lyr = layers[iL];
                extractLayerSVG(lyr);
            }
        }

        return writer.toSVGOM();
    }

    module.exports.extractSVGOM = extractSVGOM;
    module.exports.layerShouldBeRasterized = layerShouldBeRasterized;
    module.exports._getSVGLayerType = getSVGLayerType;
    module.exports._layerSpecActive = layerSpecActive;
    module.exports._layerSpecMatches = layerSpecMatches;
    module.exports._getSVGID = getSVGID;
} ());
