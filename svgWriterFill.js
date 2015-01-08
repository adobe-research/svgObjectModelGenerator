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

/* Help write the SVG */

(function () {
"use strict";
    
    var svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterIDs = require("./svgWriterIDs.js");
    
    var write = svgWriterUtils.write,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent,
        writeRadialGradient = svgWriterUtils.writeRadialGradient,
        writeLinearGradient = svgWriterUtils.writeLinearGradient,
        writeColor = svgWriterUtils.writeColor,
        ifStylesheetDoesNotHaveStyle = svgWriterUtils.ifStylesheetDoesNotHaveStyle;
    
    function SVGWriterFill() {
        
        this.scanForUnsupportedFeatures = function (ctx) {
            var omIn = ctx.currentOMNode;
            if(omIn.style &&
               ((omIn.style.fill &&
                 omIn.style.fill.gradient &&
                 omIn.style.fill.gradient.gradientForm === 'colorNoise') ||
               (omIn.style.fx &&
                omIn.style.fx.gradientFill &&
                omIn.style.fx.gradientFill.gradient &&
                omIn.style.fx.gradientFill.gradient.gradientForm === 'colorNoise'))) {
                ctx.errors.push("Gradients with noise are not supported by SVG export.");
            }
        };
        
        this.externalizeStyles = function (ctx) {
            var omIn = ctx.currentOMNode,
                fill,
                gradientID,
                styleBlock = ctx.omStylesheet.getStyleBlock(omIn);
            
            if (!omIn.style || !omIn.style.fill) {
                return;
            }
            fill = omIn.style.fill;

            if (fill.type === "gradient") {
                var gradientID;
                if (fill.gradient.type === "linear") {
                    gradientID = writeLinearGradient(ctx, fill.gradient, "-fill");
                } else if (fill.gradient.type === "radial") {
                    gradientID = writeRadialGradient(ctx, fill.gradient, "-fill");
                }                
                if (gradientID) {
                    styleBlock.addRule("fill", "url(#" + gradientID + ")");
                }
            } else {
                styleBlock.addRule("fill", svgWriterUtils.writeColor(fill.color));
            }
        };
        
        this.hasGradientFill = function (ctx) {
            var node = ctx.currentOMNode,
                fill = node.style.fill;
            
            if (node && node.style && node.style.fill && node.style.fill.type === "gradient") {
                return true;
            }
            return false;
        };
        
        this.addShapeFillAttr = function (ctx) {
            
            var node = ctx.currentOMNode,
                fill = node.style.fill,
                gradientDefn;
            if (!fill) {                
                write(ctx, " fill=\"none\"");
                return;
            }

            if (fill.type === "solid") {
                ifStylesheetDoesNotHaveStyle(ctx, node, "fill", function () {
                    write(ctx, " fill=\"" + svgWriterUtils.writeColor(fill.color) + "\"");
                });
            } else if (fill.type === "gradient" && fill.gradient.type === "linear") {
                
                if (!ctx.hasWritten(node, "linear-gradient-attr")) {
                    ctx.didWrite(node, "linear-gradient-attr");
                    gradientDefn = ctx.omStylesheet.getDefine(node.id, "linear-gradient-fill");
                    //gradientDefn = ctx.omStylesheet.getDefine(node.id, "linear-gradient");
                    if (gradientDefn) {
                        write(ctx, " fill=\"url(#" + gradientDefn.defnId + ")\"");
                    } else {
                        console.log("WARNING: Gradient without definition found for " + node.id);
                    }
                }
            } else if (fill.type === "gradient" && fill.gradient.type === "radial") {
                
                if (!ctx.hasWritten(node, "radial-gradient-attr")) {
                    ctx.didWrite(node, "radial-gradient-attr");
                    gradientDefn = ctx.omStylesheet.getDefine(node.id, "radial-gradient-fill");
                    if (gradientDefn) {
                        write(ctx, " fill=\"url(#" + gradientDefn.defnId + ")\"");
                    } else {
                        console.log("WARNING: Gradient without definition found for " + node.id);
                    }
                }
            } else {
                console.log("ERROR: Unknown origin of fill style." + fill.type);
            }
        };
	}

	module.exports = new SVGWriterFill();
    
}());
