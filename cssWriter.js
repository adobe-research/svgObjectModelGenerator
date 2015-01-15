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
/*global define: true, require: true, module: true */

/* given an svgOM, generate CSS */

(function () {
	"use strict";

    var buffer = require("buffer"),
        util = require("./utils.js"),
        svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterStroke = require("./svgWriterStroke.js"),
        svgWriterPreprocessor = require("./svgWriterPreprocessor.js"),
        svgWriterIDs = require("./svgWriterIDs.js"),
        SVGStylesheet = require("./svgStylesheet.js"),
        SVGWriterContext = require("./svgWriterContext.js");
    
    function getFormatContext(svgOM, cfg, errors) {
        return new SVGWriterContext(svgOM, cfg, errors);
    }
    
    var toString = svgWriterUtils.toString,
        write = svgWriterUtils.write,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent,
        writeLength = svgWriterUtils.writeLength,
        componentToHex = svgWriterUtils.componentToHex,
        rgbToHex = svgWriterUtils.rgbToHex,
        writeColor = svgWriterUtils.writeColor,
        px = svgWriterUtils.px,
        round1k = svgWriterUtils.round1k;

    function writeID(ctx, baseName) {
        var id;
            id = svgWriterIDs.getUnique(baseName);
            write(ctx, "#i" + id + " {");
            ctx._lastID = id;
            ctx._assignNextId = false;
    }

    function borderStyle(ctx) {
        var omIn = ctx.currentOMNode,
            styleBlock;
        
        if (svgWriterStroke.hasStroke(ctx)) {
            var stroke = omIn.style.stroke,
                strokeOpacity = omIn.style.stroke.opacity,
                borderValue = "";

            // Make a style for this stroke and reference it.
            styleBlock = ctx.omStylesheet.getStyleBlock(omIn);
            if (omIn.style.stroke.lineWidth) {
                ctx._lastStrokeWidth = px(ctx, omIn.style.stroke.lineWidth);
                borderValue += ctx._lastStrokeWidth + "px ";
            } else {
                borderValue = "1px ";
            }
            if (omIn.style.stroke.dashOffset) {
                borderValue += "dashed ";
            } else {
                borderValue += "solid ";
            }
            if (stroke.type == "solid") {
                stroke.color['a'] *= omIn.style.stroke.opacity;
                borderValue += writeColor(stroke.color);
            } else {
                borderValue += writeColor({'r': 0, 'g': 0, 'b': 0, 'a': omIn.style.stroke.opacity})
            }

            if (borderValue.length) {
                styleBlock.addRule("border", borderValue);
            }

        }

        if (omIn.type == "shape" && omIn.shape && omIn.shape == "rect" && omIn.shapeRadii) {
            styleBlock = ctx.omStylesheet.getStyleBlock(omIn);
            styleBlock.addRule("border-radius",
                                writeLength(omIn.shapeRadii[0]) + " " +
                                writeLength(omIn.shapeRadii[1]) + " " +
                                writeLength(omIn.shapeRadii[2]) + " " +
                                writeLength(omIn.shapeRadii[3]));                
        }
    };

    function backgroundStyle(ctx) {
        var omIn = ctx.currentOMNode,
            styleBlock;
        
        if (omIn.style && omIn.style.fill && omIn.style.fill.type != "none") {
            var fill = omIn.style.fill,
                backgroundValue = "";

            // Make a style for this stroke and reference it.
            styleBlock = ctx.omStylesheet.getStyleBlock(omIn);
            if (fill.type == "solid") {
                fill.color['a'] *= omIn.style["fill-opacity"];
                backgroundValue += writeColor(fill.color);
            } else {
                backgroundValue += writeColor({'r': 0, 'g': 0, 'b': 0, 'a': omIn.style.stroke.opacity})
            }

            if (backgroundValue.length) {
                if (omIn.type == "text" || omIn.type == "tspan" || omIn.type == "textPath") {
                    styleBlock.addRule("color", backgroundValue);
                } else {
                    styleBlock.addRule("background", backgroundValue);
                }
            }
        }
    };

    function createStyleBlock(ctx) {
        var omIn = ctx.currentOMNode;

        borderStyle(ctx);
        backgroundStyle(ctx);

        if (omIn.style) {
            var styleBlock = ctx.omStylesheet.getStyleBlock(omIn);
            Object.keys(omIn.style).forEach(function (property) {
                if (omIn.style[property] === undefined) {
                    return;
                }
                // fill, stroke and fx are handled above.
                if (property === "fill" || property === "stroke" | property === "fx" |
                    property == "fill-opacity") {
                    return;
                }
                if (property === "font-size") {
                    styleBlock.addRule(property, px(ctx, omIn.style[property]) + "px");
                    return;
                }
                if (property.indexOf("_") !== 0) {
                    styleBlock.addRule(property, omIn.style[property]);
                }
            });
        }
    }

    function processSVGNode(ctx) {
        var omIn = ctx.currentOMNode,
            styleBlock,
            children = omIn.children;

        svgWriterPreprocessor.scanForUnsupportedFeatures(ctx);
        
        createStyleBlock(ctx);

        if (children) {
            children.forEach(function (childNode, ind) {
                ctx.currentOMNode = childNode;
                processSVGNode(ctx);
            }.bind(this));
        }
    }

    function print(svgOM, opt, errors) {
        
        var ctx = getFormatContext(svgOM, opt || {}, errors);
        svgWriterIDs.reset();
        // Write style information
        try {
            var omSave = ctx.currentOMNode;
            ctx.omStylesheet = new SVGStylesheet();
            processSVGNode(ctx);
            ctx.currentOMNode = omSave;
            ctx.omStylesheet.consolidateStyleBlocks();
            ctx.omStylesheet.writeBlocks(ctx);
        } catch (ex) {
            console.error("Ex: " + ex);
            console.log(ex.stack);
        }
        return toString(ctx);
	}


	module.exports.printCSS = print;
}());
