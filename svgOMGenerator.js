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
        omgStyles = require("./svgOMGeneratorStyles.js"),
        layerTypeMap = {
            backgroundLayer: "background",
            shapeLayer: "shape",
            textLayer: "text",
            layerSection: "group",
            layer: "image"
        };

    function getSVGLayerType(layer) {
        if (!layerTypeMap[layer.type]) {
            console.log("[svgOMGenerator] skip '" + layer.type + "' - consider adding");
        }

        return layer.artboard ? "artboard" : layerTypeMap[layer.type];
    }

    function layerSpecActive(layerSpec) {
        return !!(layerSpec && typeof layerSpec === "number");
    }

    function layerSpecMatches(layer, layerSpec) {
        return layerSpecActive(layerSpec) && layer.id === layerSpec;
    }

    function layerShouldBeRasterized(layer, aErrors) {
        var layerType = getSVGLayerType(layer),
            imageType = layerType === "image" && layer.bounds.right - layer.bounds.left > 0 && layer.bounds.bottom - layer.bounds.top > 0;

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

    function extractSVGOM(psd, opts) {
        var layers = psd.layers,
            writer = new SVGOMWriter(opts.errors),
            iL,
            lyr,
            layerSpec = opts.layerSpec,
            layerSpecFound = !layerSpecActive(layerSpec);

        function extractLayerSVG(layer) {
            var layerType,
                svgNode,
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
            if (!justTraverse && layerType != "background") {
                svgNode = writer.addSVGNode(layerType, layerVisible);
                svgNode.name = layer.name;
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
                case "image":
                    if (!justTraverse) {
                        // FIXME: Could also be an empty layer or a gradient layer.
                        // Treat all of them as image for now.
                        omgImage.addImageData(svgNode, layer, writer);
                    }
                    break;
                case "artboard":
                    if (!justTraverse) {
                        svgNode.id = writer.ID.getUnique("artboard");
                        writer.setArtboard(svgNode.id, svgNode.name, layer.artboard.artboardRect);
                    }
                    // Either all layers are descendants of artboards or there are
                    // no artboards. Use this for path shapes.
                    // If there are artboards, elements seem to be relative to the first artboard.
                    if (!writer.currentArtboardRect) {
                        writer.currentArtboardRect = layer.artboard.artboardRect;
                    }
                    // falls through
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
}());
