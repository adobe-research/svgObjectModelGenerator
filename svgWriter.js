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
        writeln = svgWriterUtils.writeln,
        writeAttrIfNecessary = svgWriterUtils.writeAttrIfNecessary,
        writeTransformIfNecessary = svgWriterUtils.writeTransformIfNecessary,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent,
        writeLength = svgWriterUtils.writeLength,
        componentToHex = svgWriterUtils.componentToHex,
        rgbToHex = svgWriterUtils.rgbToHex,
        writeColor = svgWriterUtils.writeColor,
        round1k = svgWriterUtils.round1k,
        writeTextPath = svgWriterUtils.writeTextPath;

    function gWrap(ctx, id, fn) {
        var useTrick = false;
        
        if (!svgWriterFx.hasFx(ctx) || !svgWriterStroke.hasStroke(ctx)) {
            if (useTrick) {
                ctx._assignNextId = true;
            }
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
        writeln(ctx, ">");
        indent(ctx);
        ctx.omStylesheet.writePredefines(ctx);
        fn(useTrick);
        undent(ctx);
        writeln(ctx, ctx.currentIndent + "</g>");
        if (useTrick) {
            writeln(ctx, ctx.currentIndent + "<use xlink:href=\"#" + ctx._lastID + "\" style=\"stroke: " + ctx.omStylesheet.getStyleBlock(ctx.currentOMNode).getPropertyValue('stroke') + "; fill: none; filter: none;\"/>");
        }
    }

    var rnd = Math.round;

    function writeIDIfNecessary(ctx, baseName) {
        var id;
        if (ctx._assignNextId) {
            id = svgWriterIDs.getUnique(baseName);
            write(ctx, " id=\"" + id + "\"");
            ctx._lastID = id;
            ctx._assignNextId = false;
        }
    }

    var defaults = {
        fill: "#000",
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

    function writeClassIfNeccessary(ctx, node) {
        node = node || ctx.currentOMNode;
        if (ctx.omStylesheet.hasStyleBlock(node)) {
            var omStyleBlock = ctx.omStylesheet.getStyleBlockForElement(node);
            if (omStyleBlock) {
                if (ctx.usePresentationAttribute) {
                    for (var i = 0, len = omStyleBlock.rules.length; i < len; i++) {
                        var rule = omStyleBlock.rules[i];
                        writeAttrIfNecessary(ctx, rule.propertyName, String(rule.value).replace(/"/g, "'"), defaults[rule.propertyName] || "");
                    }
                } else {
                    write(ctx, " class=\"" + omStyleBlock.class + "\"");
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
                        top = parseFloat(bnds.top),
                        right = parseFloat(bnds.right),
                        bottom = parseFloat(bnds.bottom),
                        left = parseFloat(bnds.left),
                        w = right - left,
                        h = bottom - top,
                        oReturn = {};

                    switch(omIn.shape) {
                        case "circle":
                            write(ctx, ctx.currentIndent + "<circle");
                            
                            writeIDIfNecessary(ctx, "circle");
                            
                            writeAttrIfNecessary(ctx, "cx", rnd(left + w / 2), "0", "");
                            writeAttrIfNecessary(ctx, "cy", rnd(top + h / 2), "0", "");
                            writeAttrIfNecessary(ctx, "r", rnd(h / 2), "0", "");

                            writeClassIfNeccessary(ctx);

                            if (useTrick) {
                                write(ctx, " style=\"stroke: inherit; filter: none; fill: inherit;\"");
                            }
                            
                            writeln(ctx, "/>");
                            break;
                            
                         case "ellipse":
                            write(ctx, ctx.currentIndent + "<ellipse");
                            
                            writeIDIfNecessary(ctx, "ellipse");
                            
                            writeAttrIfNecessary(ctx, "cx", rnd(left + w / 2), "0", "");
                            writeAttrIfNecessary(ctx, "cy", rnd(top + h / 2), "0", "");
                            writeAttrIfNecessary(ctx, "rx", rnd(w / 2), "0", "");
                            writeAttrIfNecessary(ctx, "ry", rnd(h / 2), "0", "");

                            writeClassIfNeccessary(ctx);

                            if (useTrick) {
                                write(ctx, " style=\"stroke: inherit; filter: none; fill: inherit;\"");
                            }

                            writeTransformIfNecessary(ctx, "transform", omIn.transform, omIn.transformTX, omIn.transformTY);
                            
                            writeln(ctx, "/>");
                            break;
                            
                         case "path":
                            write(ctx, ctx.currentIndent + '<path d="' + util.optimisePath(omIn.pathData) + '"');
                            
                            writeIDIfNecessary(ctx, 'path');
                            writeClassIfNeccessary(ctx);

                            if (useTrick) {
                                write(ctx, ' style="stroke: inherit; filter: none; fill: inherit;"');
                            }
                            
                            writeln(ctx, '/>');
                            break;
                            
                         case "rect":
                            write(ctx, ctx.currentIndent + "<rect");
                            
                            writeIDIfNecessary(ctx, "rect");
                            
                            writeAttrIfNecessary(ctx, "x", rnd(left), "0", "");
                            writeAttrIfNecessary(ctx, "y", rnd(top), "0", "");
                            writeAttrIfNecessary(ctx, "width", rnd(w), "0", "");
                            writeAttrIfNecessary(ctx, "height", rnd(h), "0", "");
                            if (omIn.shapeRadii) {
                                var r = parseInt(omIn.shapeRadii[0], 10);
                                writeAttrIfNecessary(ctx, "rx", rnd(r), "0", "");
                                writeAttrIfNecessary(ctx, "ry", rnd(r), "0", "");
                            }

                            writeClassIfNeccessary(ctx);

                            if (useTrick) {
                                write(ctx, " style=\"stroke: inherit; filter: none; fill: inherit;\"");
                            }

                            writeTransformIfNecessary(ctx, "transform", omIn.transform, omIn.transformTX, omIn.transformTY);
                            
                            writeln(ctx, "/>");
                            break;
                            
                         default:
                            console.log("NOT HANDLED DEFAULT " + omIn.shape);
                            break;
                    }
                });

                break;
            case "tspan": {
                dealWithTSpan(ctx, sibling, omIn);

                if (omIn.children.length) {
                    mergeTSpans(ctx, sibling, omIn.children);
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

                    
                    if (rightAligned) {
                        writeAttrIfNecessary(ctx, "x", "100", 0, "%");
                        omIn.position.x = 0;
                        writePositionIfNecessary(ctx, omIn.position);
                    } else {
                        writePositionIfNecessary(ctx, omIn.position);
                    }
                    
                    if (centered && omIn.transform) {
                        omIn.transformTX += pxWidth;
                        omIn.transformTY += pxHeight;
                    }
                    
                    writeClassIfNeccessary(ctx);

                    writeTransformIfNecessary(ctx, "transform", omIn.transform, omIn.transformTX, omIn.transformTY);
                    write(ctx, ">");

                    ctx._nextTspanAdjustSuper = false;
                    ctx.omStylesheet.writePredefines(ctx);
                    
                    for (i = 0; i < children.length; i++) {
                        ctx.currentOMNode = children[i];
                        writeSVGNode(ctx, i, children.length);
                    }
                    writeln(ctx, "</text>");
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
                    offset = {middle: 50, end: 100}[styleBlock.getPropertyValue("text-anchor")] || 0;
                }
                writeAttrIfNecessary(ctx, "startOffset", offset, 0, "%");
                writeln(ctx, ">");
                
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

                    writeln(ctx, "/>");
                });

                break;
            case "group":

                write(ctx, ctx.currentIndent + "<g id=\"" + omIn.id + "\"");
                writeClassIfNeccessary(ctx);
                writeln(ctx, ">");
                indent(ctx);
                ctx.omStylesheet.writePredefines(ctx);
                var childrenGroup = ctx.currentOMNode.children;
                for (var iGroupChild = 0; iGroupChild < childrenGroup.length; iGroupChild++) {
                    var groupChildNode = childrenGroup[iGroupChild];
                    ctx.currentOMNode = groupChildNode;
                    writeSVGNode(ctx, iGroupChild, childrenGroup.length);
                }
                undent(ctx);
                writeln(ctx, ctx.currentIndent + "</g>");

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
                preserveAspectRatio = ctx.config.preserveAspectRatio || "none",
                scale = ctx.config.scale || 1,
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
            
            writeln(ctx, '>');
            indent(ctx);
            
            // Write the style sheet.
            hasRules = !ctx.usePresentationAttribute && ctx.omStylesheet.hasRules();
            hasDefines = ctx.omStylesheet.hasDefines();

            if (hasRules || hasDefines) {
                svgWriterUtils.gradientStopsReset();
                writeln(ctx, ctx.currentIndent + "<defs>");
                indent(ctx);
                
                !ctx.usePresentationAttribute && ctx.omStylesheet.writeSheet(ctx);
                
                if (hasRules && hasDefines) {
                    write(ctx, ctx.terminator);
                }
                ctx.omStylesheet.writeDefines(ctx);

                undent(ctx);
                writeln(ctx, ctx.currentIndent + "</defs>");
            }
            
            for (i = 0; i < children.length; i++) {
                childNode = children[i];
                ctx.currentOMNode = childNode;
                writeSVGNode(ctx, i, children.length, children.length);
            }
            
            undent(ctx);
            ctx.currentOMNode = omIn;
            writeln(ctx, "</svg>");
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

    function dealWithTSpan(ctx, sibling, omIn) {
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
                    if (fontSize.units) {
                        lineEM = util.round1k(leading.value / fontSize.value);
                    } else {
                        lineEM = util.round1k(leading / fontSize);
                    }
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
                if (isFinite(omIn.position.deltaX)) {
                    writeAttrIfNecessary(ctx, "dx", omIn.position.deltaX, "0", "px");
                }
            }
        }

        ctx._nextTspanAdjustSuper = false;

        writeClassIfNeccessary(ctx, omIn);
        write(ctx, ">");
    }

    var mergeTSpans = (function () {
        var matchAfterDash = /-.*$/,
            matchAllSpaces = /\s/g
        function iseq(name, val1, val2) {
            if (name == "font-family") {
                val1 = val1.replace(matchAfterDash, "").replace(matchAllSpaces, "").toLowerCase();
                val2 = val2.replace(matchAfterDash, "").replace(matchAllSpaces, "").toLowerCase();
            }
            return val1 == val2;
        }
        function compareStyles(st1, st2) {
            if (!st1) {
                return;
            }
            var eq = 0,
                s2 = {};
            for (i = 0, ii = st2.rules.length; i < ii; i++) {
                s2[st2.rules[i].propertyName] = st2.rules[i].value;
            }
            for (var i = 0, ii = st1.rules.length; i < ii; i++) {
                var prop = st1.rules[i].propertyName;
                if (prop in s2) {
                   eq += iseq(prop, st1.rules[i].value, s2[prop]);
                } else {
                    return;
                }
            }
            return eq;
        }
        function simpleClone(o) {
            var c = {};
            for (var prop in o) {
                c[prop] = o[prop];
            }
            return c;
        }
        function run(c, css) {
            css = simpleClone(css);
            for (var i = 0, len = c.length; i < len; i++) {
                var style = c[i].style;
                for (var j = 0; j < style.rules.length; j++) {
                    if (css[style.rules[j].propertyName] == style.rules[j].value) {
                        style.rules.splice(j, 1);
                        j--;
                    } else {
                        css[style.rules[j].propertyName] = style.rules[j].value;
                    }
                }
                style.fingerprint = JSON.stringify(style.rules);
                if (c[i].children && c[i].children.length) {
                    run(c[i].children, css);
                }
            }
        }
        return function mergeTSpans(ctx, sibling, tspans) {
            var str = "",
                opened = [],
                styles = [],
                curstyle = styles;
            for (var i = 0, len = tspans.length; i < len; i++) {
                var j = opened.length,
                    compres = {match: -1},
                    match;
                while (j--) {
                    match = compareStyles(opened[j], tspans[i].styleBlock);
                    if (match > compres.match) {
                        compres = {
                            match: match,
                            full: match == tspans[i].styleBlock.rules.length,
                            style: opened[j],
                            j: j
                        };
                    }
                }
                if (compres) {
                    var todel = opened.splice(compres.j + 1);
                    for (var k = 0; k < todel.length; k++) {
                        curstyle = curstyle.parent;
                    }
                    write(ctx, new Array(todel.length + 1).join("</tspan>"));
                    if (compres.full) {
                        if (tspans[i].text) {
                            write(ctx, encodedText(tspans[i].text));
                        }
                        continue;
                    }
                } else {
                    write(ctx, new Array(opened.length + 1).join("</tspan>"));
                    opened.length = 0;
                }
                var chldrn = [];
                curstyle.push({
                    style: tspans[i].styleBlock,
                    children: chldrn,
                    parent: curstyle
                });
                chldrn.parent = curstyle;
                curstyle = chldrn;
                dealWithTSpan(ctx, sibling, tspans[i]);
                if (tspans[i].text) {
                    write(ctx, encodedText(tspans[i].text));
                }
                opened.push(tspans[i].styleBlock);
            }
            write(ctx, new Array(opened.length + 1).join("</tspan>"));
            run(styles, {});
            return str;
        };
    }());

	module.exports.printSVG = print;
}());
