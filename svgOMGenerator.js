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
/*global define: true, require: true */

/*
 * Generate an abstract svgOM from the Generator JSON
 * Loosely based on the CSSON work for generator-css
*/

(function () {
    "use strict";

    var util = require("util"),
        omgUtils = require("./svgOMGeneratorUtils.js"),
        SVGOMWriter = require("./svgOMWriter.js"),
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
        
        return layerTypeMap[layer.type];
    }
    
    function getSVGID(layer) {
        var l = "layer" + layer.index; // Default is 'layerN'
        var wsSequence = false;

        function _toClass(c) {
            var ret = c;
            var skip = ".<>[]`~!@#$%^&*(){}|?/\\:;\"',";

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
        if (layerSpec) {
            if (typeof layerSpec === "number") {
                // Then it is a layerId.
                return true;
            }
        }
        return false;
    }
    
    function layerSpecMatches(layer, layerSpec) {
        
        if (layerSpec) {
            if (typeof layerSpec === "number") {
                // Then it is a layerId.
                if (layer.id === layerSpec) {
                    return true;
                }
            } else {
                // Then it is a layer spec object.
                //console.log("layer spec full object = " + JSON.stringify(layerSpec));
            }
        }
        return false;
    }
    
    function extractSVGOM (psd, opts) {
        
        var layers = psd.layers,
            writer = new SVGOMWriter(),
            iL,
            lyr,
            layerSpec = opts.layerSpec,
            layerSpecFound = !layerSpecActive(layerSpec);

        function extractLayerSVG(layer) {
            
            var layerType,
                svgNode,
                property,
                i,
                childLyr,
                justTraverse = false,
                specFound = layerSpecFound;
            
            if (!layerSpecFound && layerSpecActive(layerSpec)) {
                if (layerSpecMatches(layer, layerSpec)) {
                    layerSpecFound = true;
                } else {
                    justTraverse = true;
                }
            }
            
            layerType = getSVGLayerType(layer);
            if (!justTraverse) {
                svgNode = writer.addSVGNode(getSVGID(layer), layerType);
            }

            switch (layerType) {
                case "shape":
                    if (!justTraverse) {
                        omgShapes.addShapeData(svgNode, layer);
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
                        omgImage.addImageData(svgNode, layer);
                    }
                    break;
                case "group":
                    if (!justTraverse) {
                        omgStyles.addStylingData(svgNode, layer);
                        writer.pushCurrent(svgNode);
                    }
                    for (i = layer.layers.length - 1; i >= 0; i--) {
                        childLyr = layer.layers[i];
                        extractLayerSVG(childLyr);
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
        
        // Assume the PSD is at 0,0.
        writer.setDocOffset(0, 0);
        writer.setDocViewBox(psd.bounds);
        writer.setDocPxToInchRatio(psd.resolution);
        writer.setDocGlobalLight(psd.globalLight);
        
        for (iL = layers.length - 1; iL >= 0; iL--) {
            lyr = layers[iL];
            extractLayerSVG(lyr);
        }
        
        return writer.toSVGOM();
    }


    module.exports.extractSVGOM = extractSVGOM;
    module.exports._getSVGLayerType = getSVGLayerType;
    module.exports._layerSpecActive = layerSpecActive;
    module.exports._layerSpecMatches = layerSpecMatches;
    module.exports._getSVGID = getSVGID;

} ());
