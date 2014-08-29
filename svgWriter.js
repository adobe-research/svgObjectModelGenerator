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
/*global define: true, require: true, module: true */

/* given an svgOM, generate SVG */

(function () {
	"use strict";

    var buffer = require("buffer"),
        util = require("util"),
        svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterStroke = require("./svgWriterStroke.js"),
        svgWriterFill = require("./svgWriterFill.js"),
        svgWriterFx = require("./svgWriterFx.js"),
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
        writeTextPath = svgWriterUtils.writeTextPath;

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
        svgWriterFill.addShapeFillAttr(ctx);
        svgWriterFx.addFxAttr(ctx);

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
    
    function addAttributeStyles(ctx, omIn) {
        // FIXME: Deprecated and must be removed.
        svgWriterFill.addShapeFillAttr(ctx);
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

    function writeLayerNode(ctx, sibling) {
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

                    var top = parseInt(omIn.shapeBounds.top, 10),
                        right = parseInt(omIn.shapeBounds.right, 10),
                        bottom = parseInt(omIn.shapeBounds.bottom, 10),
                        left = parseInt(omIn.shapeBounds.left, 10),
                        w = right - left,
                        h = bottom - top,
                        oReturn = {};

                    switch(omIn.shape) {
                        case "circle":
                            write(ctx, ctx.currentIndent + "<circle");
                            
                            writeIDIfNecessary(ctx, "circle");
                            writeClassIfNeccessary(ctx);
                            
                            writeAttrIfNecessary(ctx, "cx", rnd(left + w/2.0), "0", "");
                            writeAttrIfNecessary(ctx, "cy", rnd(top + h/2.0), "0", "");
                            writeAttrIfNecessary(ctx, "r", rnd(h/2.0), "0", "");
                            
                            addAttributeStyles(ctx, omIn);

                            if (useTrick) {
                                write(ctx, " style=\"stroke: inherit; fill: inherit; filter: none;\"");
                            }
                            
                            write(ctx, "/>" + ctx.terminator);
                            break;
                            
                         case "ellipse":
                            write(ctx, ctx.currentIndent + "<ellipse");
                            
                            writeIDIfNecessary(ctx, "ellipse");
                            writeClassIfNeccessary(ctx);
                            
                            writeAttrIfNecessary(ctx, "cx", rnd(left + w/2.0), "0", "");
                            writeAttrIfNecessary(ctx, "cy", rnd(top + h/2.0), "0", "");
                            writeAttrIfNecessary(ctx, "rx", rnd(w/2.0), "0", "");
                            writeAttrIfNecessary(ctx, "ry", rnd(h/2.0), "0", "");
                            
                            addAttributeStyles(ctx, omIn);

                            if (useTrick) {
                                write(ctx, " style=\"stroke: inherit; fill: inherit; filter: none;\"");
                            }

                            write(ctx, "/>" + ctx.terminator);
                            break;
                            
                         case "path":
                            write(ctx, ctx.currentIndent + "<path d=\"" + omIn.pathData + "\"");
                            
                            writeIDIfNecessary(ctx, "path");
                            writeClassIfNeccessary(ctx);
                            
                            addAttributeStyles(ctx, omIn);

                            if (useTrick) {
                                write(ctx, " style=\"stroke: inherit; fill: inherit; filter: none;\"");
                            }

                            write(ctx, " fill-rule=\"evenodd\"/>" + ctx.terminator);
                            break;
                            
                         case "rect":
                            write(ctx, ctx.currentIndent + "<rect");
                            
                            writeIDIfNecessary(ctx, "rect");
                            writeClassIfNeccessary(ctx);
                            
                            writeAttrIfNecessary(ctx, "x", rnd(left), "0", "");
                            writeAttrIfNecessary(ctx, "y", rnd(top), "0", "");
                            writeAttrIfNecessary(ctx, "width", rnd(w), "0", "");
                            writeAttrIfNecessary(ctx, "height", rnd(h), "0", "");
                            if (omIn.shapeRadii) {
                                var r = parseInt(omIn.shapeRadii[0], 10);
                                writeAttrIfNecessary(ctx, "rx", rnd(r), "0", "");
                                writeAttrIfNecessary(ctx, "ry", rnd(r), "0", "");
                            }

                            addAttributeStyles(ctx, omIn);

                            if (useTrick) {
                                write(ctx, " style=\"stroke: inherit; fill: inherit; filter: none;\"");
                            }

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
                if (omIn.position) {
                    writeAttrIfNecessary(ctx, "dy", (sibling ? 1.2 : 0) + "em", "0em", "");
                    writeAttrIfNecessary(ctx, "x", rnd(omIn.position.x), (sibling ? "" : "0"), "%");
                }
                writeClassIfNeccessary(ctx);
                write(ctx, ">");

                if (omIn.children.length) {
                    for (var i = 0; i < omIn.children.length; i++) {
                        var childNode = omIn.children[i];
                        ctx.currentOMNode = childNode;
                        writeSVGNode(ctx, i);
                    }
                }
                if (omIn.text) {
                    write(ctx, omIn.text);
                }
                write(ctx, "</tspan>");
                break;
            }
            case "text":
                gWrap(ctx, omIn.id, function () {
                    // FIXME: We need the dimension of the current viewport here.
                    // A global unit handler could do the job for us. Use 1024
                    // as the fixed dimension. The default for my PSD files.
                    var x = rnd(omIn.position.x);
                    var y = rnd(omIn.position.y);
                    write(ctx, ctx.currentIndent + "<text");

                    writeClassIfNeccessary(ctx);

                    // FIXME: We should use absolute positions.
                    writeAttrIfNecessary(ctx, "x", x, 0, "%");
                    writeAttrIfNecessary(ctx, "y", y, 0, "%");
                    writeTransformIfNecessary(ctx, "transform", omIn.transform);
                    write(ctx, ">" + ctx.terminator);

                    // FIXME: Avoid extra tspan for one paragraph.
                    indent(ctx);
                    ctx.omStylesheet.writePredefines(ctx);
                    var children = ctx.currentOMNode.children;
                    for (var i = 0; i < children.length; i++) {
                        write(ctx, ctx.currentIndent);
                        var childNode = children[i];
                        ctx.currentOMNode = childNode;
                        writeSVGNode(ctx, i);
                        write(ctx, ctx.terminator);
                    }
                    undent(ctx);
                    write(ctx, ctx.currentIndent + "</text>" + ctx.terminator);
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
                        case "start": break;
                        default:
                            break;
                    }
                }
                writeAttrIfNecessary(ctx, "startOffset", offset, 0, "%");
                write(ctx, ">" + ctx.terminator);

                // FIXME: Avoid extra tspan for one paragraph.
                indent(ctx);
                ctx.omStylesheet.writePredefines(ctx);
                var children = ctx.currentOMNode.children;
                for (var iTextChild = 0; iTextChild < children.length; iTextChild++) {
                    write(ctx, ctx.currentIndent);
                    var childNodeText = children[iTextChild];
                    ctx.currentOMNode = childNodeText;
                    writeSVGNode(ctx, iTextChild);
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
                writeClassIfNeccessary(ctx);
                write(ctx, ">" + ctx.terminator);
                indent(ctx);
                ctx.omStylesheet.writePredefines(ctx);
                var childrenGroup = ctx.currentOMNode.children;
                for (var iGroupChild = 0; iGroupChild < childrenGroup.length; iGroupChild++) {
                    var groupChildNode = childrenGroup[iGroupChild];
                    ctx.currentOMNode = groupChildNode;
                    writeSVGNode(ctx, iGroupChild);
                }
                undent(ctx);
                write(ctx, ctx.currentIndent + "</g>" + ctx.terminator);

                break;
            default:
                console.log("ERROR: Unknown omIn.type = " + omIn.type);
                break;
        }
    }
    
    function writeSVGNode(ctx, sibling) {

        var omIn = ctx.currentOMNode;
        
        if (omIn === ctx.svgOM) {
            
            var i,
                children = ctx.currentOMNode.children,
                childNode,
                hasRules,
                hasDefines,
                preserveAspectRatio = ctx.config.preserveAspectRatio || "none";
            
            write(ctx, '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"');
            write(ctx, ' preserveAspectRatio="' + preserveAspectRatio + '"');
            writeAttrIfNecessary(ctx, "x", omIn.offsetX, "0", "px");
            writeAttrIfNecessary(ctx, "y", omIn.offsetY, "0", "px");
            write(ctx, ' width="' + Math.abs(omIn.viewBox.right - omIn.viewBox.left) + '" height="' + Math.abs(omIn.viewBox.bottom - omIn.viewBox.top) + '"');
            
            //if (omIn.viewBox.left !== 0 || omIn.viewBox.top !== 0) {
                write(ctx, ' viewBox="' + omIn.viewBox.left + ' ' + omIn.viewBox.top + ' ');
                write(ctx, Math.abs(omIn.viewBox.right - omIn.viewBox.left) + ' ');
                write(ctx, Math.abs(omIn.viewBox.bottom - omIn.viewBox.top) + '"');
            //}
            
            write(ctx, '>' + ctx.terminator);
            indent(ctx);
            
            // Write the style sheet.
            hasRules = ctx.omStylesheet.hasRules();
            hasDefines = ctx.omStylesheet.hasDefines();

            if (hasRules || hasDefines) {
                write(ctx, ctx.currentIndent + "<defs>" + ctx.terminator);
                indent(ctx);
                
                ctx.omStylesheet.writeSheet(ctx);
                
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
                writeSVGNode(ctx, i);
            }
            
            undent(ctx);
            ctx.currentOMNode = omIn;
            write(ctx, "</svg>" + ctx.terminator);
        } else {
            writeLayerNode(ctx, sibling);
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