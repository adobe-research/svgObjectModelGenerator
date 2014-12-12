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

/* given an svgOM, generate SVG */

(function () {
	"use strict";

    var buffer = require("buffer"),
        util = require("./utils.js"),
        svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterStroke = require("./svgWriterStroke.js"),
        svgWriterFill = require("./svgWriterFill.js"),
        svgWriterFx = require("./svgWriterFx.js"),
        svgWriterText = require("./svgWriterText.js"),
        svgWriterPreprocessor = require("./svgWriterPreprocessor.js"),
        svgWriterIDs = require("./svgWriterIDs.js"),
        SVGWriterContext = require("./svgWriterContext.js");
    
    function getFormatContext(svgOM, cfg, errors) {
        return new SVGWriterContext(svgOM, cfg, errors);
    }
    
    var toString = svgWriterUtils.toString,
        write = svgWriterUtils.write,
        writeAttrIfNecessary = svgWriterUtils.writeAttrIfNecessary,
        writeTransformIfNecessary = svgWriterUtils.writeTransformIfNecessary,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent,
        writeLength = svgWriterUtils.writeLength,
        componentToHex = svgWriterUtils.componentToHex,
        rgbToHex = svgWriterUtils.rgbToHex,
        writeColor = svgWriterUtils.writeColor,
        round1k = svgWriterUtils.round1k,
        writeTextPath = svgWriterUtils.writeTextPath,
        // This should be coming as argument
        isCSS = true;

    function gWrap(ctx, id, fn) {
        var useTrick = false;
        
        if (!svgWriterFx.hasFx(ctx) || !svgWriterStroke.hasStroke(ctx)) {
            ctx._assignNextId = true;
            ctx.omStylesheet.writePredefines(ctx);
            fn(useTrick);
            return;
        }
        write(ctx, ctx.currentIndent + "<g id=\"" + id + "\"");
        
        //if we have a filter chain and a stroke we may need to pull out another trick
        //the filter goes on the <g> and then the shape is replicated with use
        useTrick = true;
        
        //signal the shape to make an ID...
        ctx._assignNextId = true;
        
        // Any fill operation needs to move up here.
        write(ctx, " style=\"fill: "
            + ctx.omStylesheet.getStyleBlock(ctx.currentOMNode).getPropertyValue('fill') + ";"
            + " filter: " + ctx.omStylesheet.getStyleBlock(ctx.currentOMNode).getPropertyValue('filter') + ";\"");

        //do we need to wrap the use and other G in a G so they can be treated as one thing?        
        write(ctx, ">" + ctx.terminator);
        indent(ctx);
        ctx.omStylesheet.writePredefines(ctx);
        fn(useTrick);
        undent(ctx);
        write(ctx, ctx.currentIndent + "</g>" + ctx.terminator);
        if (useTrick) {
            write(ctx, ctx.currentIndent + "<use xlink:href=\"#" + ctx._lastID + "\" style=\"stroke: " + ctx.omStylesheet.getStyleBlock(ctx.currentOMNode).getPropertyValue('stroke') + "; fill: none; filter: none;\"/>" + ctx.terminator);
        }
    }

    function rnd(val, prec) {
        return Math.round(val, prec || 0);
    }

    function writeIDIfNecessary(ctx, baseName) {
        var id;
        if (ctx._assignNextId) {
            id = svgWriterIDs.getUnique(baseName);
            write(ctx, " id=\"" + id + "\"");
            ctx._lastID = id;
            ctx._assignNextId = false;
        }
    }

    function writeClassIfNeccessary(ctx) {
        if (ctx.omStylesheet.hasStyleBlock(ctx.currentOMNode)) {
            var omStyleBlock = ctx.omStylesheet.getStyleBlockForElement(ctx.currentOMNode);
            if (omStyleBlock) {
                write(ctx, " class=\"" + omStyleBlock.class + "\"");
            }
        }
    }
    var defaults = {
        fill: "#000000",
        stroke: "none",
        "stroke-width": 1,
        "stroke-linecap": "butt",
        "stroke-linejoin": "miter",
        "stroke-miterlimit": 4,
        "stroke-dasharray": "none",
        "stroke-dashoffset": 0,
        "stroke-opacity": 1,
        opacity: 1,
        "fill-rule": "nonzero",
        "fill-opacity": 1,
        display: "inline",
        visibility: "visible"
    };
    function writeStylesAsAttrs(ctx) {
        if (ctx.omStylesheet.hasStyleBlock(ctx.currentOMNode)) {
            var omStyleBlock = ctx.omStylesheet.getStyleBlockForElement(ctx.currentOMNode);
            if (omStyleBlock) {
                for (var i = 0, len = omStyleBlock.rules.length; i < len; i++) {
                    var rule = omStyleBlock.rules[i];
                    writeAttrIfNecessary(ctx, rule.propertyName, String(rule.value).replace(/"/g, "'"), defaults[rule.propertyName] || "");
                }
            }
        }
    }
    
    function writePositionIfNecessary(ctx, position, overrideExpect) {
        var yUnit,
            xUnit,
            x,
            y;
        
        if (position) {
            overrideExpect = (overrideExpect !== undefined) ? overrideExpect : 0;
            if (isFinite(position.x)) {
                if (position.unitX === "px") {
                    x = rnd(position.x);
                } else if (position.unitX === "em") {
                    x = round1k(position.x);
                } else {
                    position.unitX = "%";
                    x = rnd(position.x);
                }
                writeAttrIfNecessary(ctx, "x", x, overrideExpect, position.unitX);
            }

            if (isFinite(position.y)) {
                if (position.unitY === "px") {
                    y = rnd(position.y);
                } else if (position.unitY === "em") {
                    y = round1k(position.y);
                } else {
                    position.unitY = "%";
                    y = rnd(position.y);
                }
                writeAttrIfNecessary(ctx, "y", y, overrideExpect, position.unitY);
            }
        }
    }
    
    function encodedText(txt) {
        return txt.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&apos;');
    }

    function writeLayerNode(ctx, sibling, siblingsLength) {
        var omIn = ctx.currentOMNode;
        
        //TBD: in some cases people might want to export their hidden layers so they can turn them on interactively
        if (!omIn.visible) { // && !ctx.config.writeInvisibleLayers) {
            return;
        }
        
        // Decide what type of layer it is and write that type...
        switch (omIn.type) {
            case "background":

                // FIXME: What to do with this?
                
                break;
            case "shape":

                if (!omIn.shapeBounds) {
                    console.warn("Shape has no boundaries.");
                    return;
                }
                gWrap(ctx, omIn.id, function (useTrick) {

                    var bnds = omIn.originBounds || omIn.shapeBounds,
                        top = parseInt(bnds.top, 10),
                        right = parseInt(bnds.right, 10),
                        bottom = parseInt(bnds.bottom, 10),
                        left = parseInt(bnds.left, 10),
                        w = right - left,
                        h = bottom - top,
                        oReturn = {};

                    switch(omIn.shape) {
                        case "circle":
                            write(ctx, ctx.currentIndent + "<circle");
                            
                            writeIDIfNecessary(ctx, "circle");
                            if (isCSS) {
                                writeClassIfNeccessary(ctx);
                            }
                            
                            writeAttrIfNecessary(ctx, "cx", rnd(left + w/2.0), "0", "");
                            writeAttrIfNecessary(ctx, "cy", rnd(top + h/2.0), "0", "");
                            writeAttrIfNecessary(ctx, "r", rnd(h/2.0), "0", "");

                            if (!isCSS) {
                                writeStylesAsAttrs(ctx);
                            }

                            if (useTrick) {
                                write(ctx, " style=\"stroke: inherit; filter: none; fill: inherit;\"");
                            }
                            
                            write(ctx, "/>" + ctx.terminator);
                            break;
                            
                         case "ellipse":
                            write(ctx, ctx.currentIndent + "<ellipse");
                            
                            writeIDIfNecessary(ctx, "ellipse");
                            if (isCSS) {
                                writeClassIfNeccessary(ctx);
                            }
                            
                            writeAttrIfNecessary(ctx, "cx", rnd(left + w/2.0), "0", "");
                            writeAttrIfNecessary(ctx, "cy", rnd(top + h/2.0), "0", "");
                            writeAttrIfNecessary(ctx, "rx", rnd(w/2.0), "0", "");
                            writeAttrIfNecessary(ctx, "ry", rnd(h/2.0), "0", "");

                            if (!isCSS) {
                                writeStylesAsAttrs(ctx);
                            }

                            if (useTrick) {
                                write(ctx, " style=\"stroke: inherit; filter: none; fill: inherit;\"");
                            }

                            writeTransformIfNecessary(ctx, "transform", omIn.transform, omIn.transformTX, omIn.transformTY);
                            
                            write(ctx, "/>" + ctx.terminator);
                            break;
                            
                         case "path":
                            write(ctx, ctx.currentIndent + '<path d="' + omIn.pathData + '"');
                            
                            writeIDIfNecessary(ctx, 'path');
                            if (isCSS) {
                                writeClassIfNeccessary(ctx);
                            } else {
                                writeStylesAsAttrs(ctx);
                            }

                            if (useTrick) {
                                write(ctx, ' style="stroke: inherit; filter: none; fill: inherit;"');
                            }
                            
                            write(ctx, ' fill-rule="evenodd"/>' + ctx.terminator);
                            break;
                            
                         case "rect":
                            write(ctx, ctx.currentIndent + "<rect");
                            
                            writeIDIfNecessary(ctx, "rect");
                            if (isCSS) {
                                writeClassIfNeccessary(ctx);
                            }
                            
                            writeAttrIfNecessary(ctx, "x", rnd(left), "0", "");
                            writeAttrIfNecessary(ctx, "y", rnd(top), "0", "");
                            writeAttrIfNecessary(ctx, "width", rnd(w), "0", "");
                            writeAttrIfNecessary(ctx, "height", rnd(h), "0", "");
                            if (omIn.shapeRadii) {
                                var r = parseInt(omIn.shapeRadii[0], 10);
                                writeAttrIfNecessary(ctx, "rx", rnd(r), "0", "");
                                writeAttrIfNecessary(ctx, "ry", rnd(r), "0", "");
                            }

                            if (!isCSS) {
                                writeStylesAsAttrs(ctx);
                            }

                            if (useTrick) {
                                write(ctx, " style=\"stroke: inherit; filter: none; fill: inherit;\"");
                            }

                            writeTransformIfNecessary(ctx, "transform", omIn.transform, omIn.transformTX, omIn.transformTY);
                            
                            write(ctx, "/>" + ctx.terminator);
                            break;
                            
                         default:
                            console.log("NOT HANDLED DEFAULT " + omIn.shape);
                            break;
                    }
                });

                break;
            case "tspan": {
                write(ctx, "<tspan");
                // Set paragraph styles.
                
                if (ctx._nextTspanAdjustSuper) {
                    writeAttrIfNecessary(ctx, "dy", "0.6em", "0em", "");
                }
                
                if (omIn.position) {
                    var lineEM = 1.2,
                        fontSize,
                        leading = omIn.style["_leading"];
                    if (leading) {
                        fontSize = omIn.style["font-size"];
                        if (fontSize && leading.units === fontSize.units) {
                            lineEM = util.round1k(leading.value / fontSize.value);
                        }
                    }
                    
                    if (!ctx._nextTspanAdjustSuper) {
                        if (omIn.position.unitY === "em") {
                            writeAttrIfNecessary(ctx, "dy", (omIn.position.y * lineEM) + "em", "0em", "");
                        } else {
                            writeAttrIfNecessary(ctx, "dy", (sibling ? lineEM : 0) + "em", "0em", "");
                        }
                    }
                    
                    if (!omIn.style ||
                        (omIn.style["text-anchor"] !== "middle" &&
                         omIn.style["text-anchor"] !== "end") &&
                        isFinite(omIn.position.x)) {
                        
                        if (sibling) {
                            writePositionIfNecessary(ctx, {
                                x: omIn.position.x,
                                unitX: omIn.position.unitX
                            }, "");
                        }
                    } else if (omIn.style["text-anchor"] === "middle") {
                        writePositionIfNecessary(ctx, {
                            x: omIn.position.x,
                            unitX: omIn.position.unitX
                        });
                        if (isFinite(omIn.position.deltaX)) {
                            writeAttrIfNecessary(ctx, "dx", omIn.position.deltaX, "0", "px");
                        }
                    } else if (omIn.style["text-anchor"] === "end") {
                        writeAttrIfNecessary(ctx, "x", "100%", "0%", "");
                        writeAttrIfNecessary(ctx, "startOffset", "100%", "0%", "");
                        if (isFinite(omIn.position.deltaX)) {
                            writeAttrIfNecessary(ctx, "dx", omIn.position.deltaX, "0", "px");
                        }
                    }
                }
                
                ctx._nextTspanAdjustSuper = false;
                
                if (isCSS) {
                    writeClassIfNeccessary(ctx);
                } else {
                    writeStylesAsAttrs(ctx);
                }
                write(ctx, ">");

                if (omIn.children.length) {
                    for (var i = 0; i < omIn.children.length; i++) {
                        var childNode = omIn.children[i];
                        ctx.currentOMNode = childNode;
                        writeSVGNode(ctx, i, omIn.children.length);
                    }
                }
                if (omIn.text) {
                    write(ctx, encodedText(omIn.text));
                }
                write(ctx, "</tspan>");
                
                if (omIn.style && omIn.style["_baseline-script"] === "super") {
                    ctx._nextTspanAdjustSuper = true;
                }
                
                break;
            }
            case "text":
                gWrap(ctx, omIn.id, function () {
                    
                    var children = ctx.currentOMNode.children,
                        rightAligned = false,
                        centered = false,
                        i,
                        bndsFx,
                        bndsNat,
                        bndsAlt,
                        bndsDy,
                        bndsDyAlt,
                        pxWidth = omIn.textBounds.right - omIn.textBounds.left,
                        pxHeight = omIn.textBounds.bottom - omIn.textBounds.top;
                    
                    if (children && children.length > 0 &&
                        children[0].style && children[0].style["text-anchor"] === "end") {
                        rightAligned = true;
                    } else if (children && children.length > 0 &&
                        children[0].style && children[0].style["text-anchor"] === "middle") {
                        centered = true;
                    }
                    
                    write(ctx, ctx.currentIndent + "<text");

                    if (isCSS) {
                        writeClassIfNeccessary(ctx);
                    }
                    
                    if (rightAligned) {
                        writeAttrIfNecessary(ctx, "x", "100%", 0, "%");
                        omIn.position.x = 0;
                        writePositionIfNecessary(ctx, omIn.position);
                    } else {
                        writePositionIfNecessary(ctx, omIn.position);
                    }
                    
                    if (centered && omIn.transform) {
                        omIn.transformTX += pxWidth;
                        omIn.transformTY += pxHeight;
                    }
                    
                    if (!isCSS) {
                        writeStylesAsAttrs(ctx);
                    }


                    writeTransformIfNecessary(ctx, "transform", omIn.transform, omIn.transformTX, omIn.transformTY);
                    write(ctx, ">");

                    ctx._nextTspanAdjustSuper = false;
                    ctx.omStylesheet.writePredefines(ctx);
                    
                    for (i = 0; i < children.length; i++) {
                        ctx.currentOMNode = children[i];
                        writeSVGNode(ctx, i, children.length);
                    }
                    write(ctx, "</text>" + ctx.terminator);
                });

                break;
            case "textPath": {
                var offset = 0,
                    styleBlock = ctx.omStylesheet.getStyleBlock(ctx.currentOMNode);

                write(ctx, "<textPath");

                if (!ctx.hasWritten(omIn, "text-path-attr")) {
                    ctx.didWrite(omIn, "text-path-attr");
                    var textPathDefn = ctx.omStylesheet.getDefine(omIn.id, "text-path");
                    if (textPathDefn) {
                        write(ctx, " xlink:href=\"#" + textPathDefn.defnId + "\"");
                    } else {
                        console.log("text-path with no def found");
                    }
                }
                if (styleBlock.hasProperty("text-anchor")) {
                    switch (styleBlock.getPropertyValue("text-anchor")) {
                        case "middle":
                            offset = 50;
                            break;
                        case "end":
                            offset = 100;
                            break;
                        case "start":
                            break;
                        default:
                            break;
                    }
                }
                writeAttrIfNecessary(ctx, "startOffset", offset, 0, "%");
                write(ctx, ">" + ctx.terminator);
                
                indent(ctx);
                ctx.omStylesheet.writePredefines(ctx);
                var children = ctx.currentOMNode.children;
                for (var iTextChild = 0; iTextChild < children.length; iTextChild++) {
                    write(ctx, ctx.currentIndent);
                    var childNodeText = children[iTextChild];
                    ctx.currentOMNode = childNodeText;
                    writeSVGNode(ctx, iTextChild, children.length);
                    write(ctx, ctx.terminator);
                }
                undent(ctx);
                write(ctx, ctx.currentIndent + "</textPath>");
                break;
            }
            case "generic":
                if (!omIn.shapeBounds) {
                    console.warn("Shape has no boundaries.");
                    return;
                }
                gWrap(ctx, omIn.id, function () {
                    var top = parseInt(omIn.shapeBounds.top, 10),
                        right = parseInt(omIn.shapeBounds.right, 10),
                        bottom = parseInt(omIn.shapeBounds.bottom, 10),
                        left = parseInt(omIn.shapeBounds.left, 10),
                        w = right - left,
                        h = bottom - top;

                    write(ctx, ctx.currentIndent + "<image xlink:href=\"" + omIn.pixel + "\"");

                    // FIXME: The PS imported image already has all fx effects applied.
                    // writeClassIfNeccessary(ctx);

                    writeAttrIfNecessary(ctx, "x", left, "0", "");
                    writeAttrIfNecessary(ctx, "y", top, "0", "");
                    writeAttrIfNecessary(ctx, "width", w, "0", "");
                    writeAttrIfNecessary(ctx, "height", h, "0", "");

                    write(ctx, "/>" + ctx.terminator);
                });

                break;
            case "group":

                write(ctx, ctx.currentIndent + "<g id=\"" + omIn.id + "\"");
                if (isCSS) {
                    writeClassIfNeccessary(ctx);
                } else {
                    writeStylesAsAttrs(ctx);
                }
                write(ctx, ">" + ctx.terminator);
                indent(ctx);
                ctx.omStylesheet.writePredefines(ctx);
                var childrenGroup = ctx.currentOMNode.children;
                for (var iGroupChild = 0; iGroupChild < childrenGroup.length; iGroupChild++) {
                    var groupChildNode = childrenGroup[iGroupChild];
                    ctx.currentOMNode = groupChildNode;
                    writeSVGNode(ctx, iGroupChild, childrenGroup.length);
                }
                undent(ctx);
                write(ctx, ctx.currentIndent + "</g>" + ctx.terminator);

                break;
            default:
                console.log("ERROR: Unknown omIn.type = " + omIn.type);
                break;
        }
    }
    
    function writeSVGNode(ctx, sibling, siblingsLength) {

        var omIn = ctx.currentOMNode;
        
        if (omIn === ctx.svgOM) {
            
            var i,
                children = ctx.currentOMNode.children,
                childNode,
                hasRules,
                hasDefines,
                round1k = svgWriterUtils.round1k,
                preserveAspectRatio = ctx.config.preserveAspectRatio || "none",
                scale = ctx.config.scale || 1.0,
                left = round1k(omIn.viewBox.left),
                top = round1k(omIn.viewBox.top),
                
                width = Math.abs(omIn.viewBox.right - omIn.viewBox.left),
                height = Math.abs(omIn.viewBox.bottom - omIn.viewBox.top),
                scaledW = isFinite(ctx.config.targetWidth) ? round1k(scale * ctx.config.targetWidth) : round1k(scale * width),
                scaledH = isFinite(ctx.config.targetHeight) ? round1k(scale * ctx.config.targetHeight) : round1k(scale * height);
            
            width = round1k(width);
            height = round1k(height);
            
            write(ctx, '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"');
            write(ctx, ' preserveAspectRatio="' + preserveAspectRatio + '"');
            writeAttrIfNecessary(ctx, "x", omIn.offsetX, "0", "px");
            writeAttrIfNecessary(ctx, "y", omIn.offsetY, "0", "px");
            write(ctx, ' width="' + scaledW + '" height="' + scaledH + '"');
            
            write(ctx, ' viewBox="' + left + ' ' + top + ' ');
            write(ctx, width + ' ');
            write(ctx, height + '"');
            
            write(ctx, '>' + ctx.terminator);
            indent(ctx);
            
            // Write the style sheet.
            hasRules = isCSS && ctx.omStylesheet.hasRules();
            hasDefines = ctx.omStylesheet.hasDefines();

            if (hasRules || hasDefines) {
                write(ctx, ctx.currentIndent + "<defs>" + ctx.terminator);
                indent(ctx);
                
                isCSS && ctx.omStylesheet.writeSheet(ctx);
                
                if (hasRules && hasDefines) {
                    write(ctx, ctx.terminator);
                }
                ctx.omStylesheet.writeDefines(ctx);

                undent(ctx);
                write(ctx, ctx.currentIndent + "</defs>" + ctx.terminator);
            }
            
            for (i = 0; i < children.length; i++) {
                childNode = children[i];
                ctx.currentOMNode = childNode;
                writeSVGNode(ctx, i, children.length, children.length);
            }
            
            undent(ctx);
            ctx.currentOMNode = omIn;
            write(ctx, "</svg>" + ctx.terminator);
        } else {
            writeLayerNode(ctx, sibling, siblingsLength);
        }
    }
    
    
	function print(svgOM, opt, errors) {
        
        var ctx = getFormatContext(svgOM, opt || {}, errors);
        svgWriterIDs.reset();
        try {
            svgWriterPreprocessor.processSVGOM(ctx);
            ctx.omStylesheet.consolidateStyleBlocks();
            writeSVGNode(ctx);
        } catch (ex) {
            console.error("Ex: " + ex);
            console.log(ex.stack);
        }
		return toString(ctx);
	}


	module.exports.printSVG = print;
}());
