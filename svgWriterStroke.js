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

/* Help write the SVG */

(function () {
"use strict";
    
    var svgWriterUtils = require("./svgWriterUtils.js");
    
    var write = svgWriterUtils.write,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent,
        writeRadialGradient = svgWriterUtils.writeRadialGradient,
        writeLinearGradient = svgWriterUtils.writeLinearGradient,
        writeColor = svgWriterUtils.writeColor,
        px = svgWriterUtils.px,
        ifStylesheetDoesNotHaveStyle = svgWriterUtils.ifStylesheetDoesNotHaveStyle;
    
    function SVGWriterStroke() {
        
        this.hasStroke = function (ctx) {
            var omIn = ctx.currentOMNode;
            if (omIn.style && omIn.style.stroke && omIn.style.stroke.strokeEnabled && omIn.style.stroke.color) {  
                return true;
            }
            return false;
        };
        
        this.externalizeStyles = function (ctx) {
            var omIn = ctx.currentOMNode,
                styleBlock;
            
            if (this.hasStroke(ctx)) {
                var stroke = omIn.style.stroke;
                // Make a style for this stroke and reference it.
                styleBlock = ctx.omStylesheet.getStyleBlock(omIn);
                if (stroke.gradient) {
                    var gradientID;
                    if (stroke.gradient.type === "linear") {
                        gradientID = writeLinearGradient(ctx, stroke.gradient, "-stroke");
                    } else if (stroke.gradient.type === "radial") {
                        gradientID = writeRadialGradient(ctx, stroke.gradient, "-stroke");
                    }                
                    if (gradientID) {
                        styleBlock.addRule("stroke", "url(#" + gradientID + ")");
                    }
                } else {
                    styleBlock.addRule("stroke", svgWriterUtils.writeColor(omIn.style.stroke.color));
                }
                if (omIn.style.stroke.lineCap !== "butt") {
                    styleBlock.addRule("stroke-linecap", omIn.style.stroke.lineCap);
                }
                if (omIn.style.stroke.lineJoin !== "miter") {
                    styleBlock.addRule("stroke-linejoin", omIn.style.stroke.lineJoin);
                }
                if (px(ctx, omIn.style.stroke.miterLimit) !== 100) {
                    styleBlock.addRule("stroke-miterlimit", px(ctx, omIn.style.stroke.miterLimit) + "px");
                }
                if (omIn.style.stroke.dashOffset) {
                    styleBlock.addRule("stroke-dashoffset", px(ctx, omIn.style.stroke.dashOffset) + "px");
                }
                if (omIn.style.stroke.opacity !== 1) {
                    styleBlock.addRule("stroke-opacity", omIn.style.stroke.opacity);
                }
                if (omIn.style.stroke.lineWidth) {
                    ctx._lastStrokeWidth = px(ctx, omIn.style.stroke.lineWidth);
                    styleBlock.addRule("stroke-width", ctx._lastStrokeWidth + "px");
                }
                if (omIn.style.stroke.dashArray && omIn.style.stroke.dashArray.length) {
                    var width = px(ctx, omIn.style.stroke.lineWidth) ? px(ctx, omIn.style.stroke.lineWidth) : 0;
                    var dashArray = omIn.style.stroke.dashArray.map(function(element, index) {
                        // This is a work around for a bug in Chrome on [0,2] dash arrays.
                        if (!index && !element)
                            return 0.001;
                        return width * element;
                    }).join();
                    styleBlock.addRule("stroke-dasharray", dashArray);
                }
            }
        };
        
        
        this.addShapeStrokeAttr = function (ctx) {
            var node = ctx.currentOMNode,
                stroke = node.style.stroke,
                lineW;
            
            if (stroke.strokeEnabled) {
                if (stroke.color) {
                    ifStylesheetDoesNotHaveStyle(ctx, node, "stroke", function () {
                        write(ctx, " stroke=\"" + svgWriterUtils.writeColor(stroke.color) + "\"");
                    });
                }
                
                if (stroke.lineWidth) {
                    ifStylesheetDoesNotHaveStyle(ctx, node, "stroke-width", function () {
                        lineW = parseInt(px(ctx, stroke.lineWidth), 10);
                        if (lineW !== 1) {
                            write(ctx, " stroke-width=\"" + lineW + "\"");
                        }
                    });
                }
            }
        };
	}

	module.exports = new SVGWriterStroke();
    
}());
     
    