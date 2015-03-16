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
/*global define: true, require: true */

/* Help write the SVG */

(function () {
    "use strict";
    
    var svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterGradient = require("./svgWriterGradient.js");
    
    var writeGradient = svgWriterGradient.writeGradient,
        writeColor = svgWriterUtils.writeColor,
        px = svgWriterUtils.px;
    
    function SVGWriterStroke() {
        
        var hasStroke = function (ctx) {
            var omIn = ctx.currentOMNode;
            return omIn.style && omIn.style.stroke && omIn.style.stroke.type != "none";
        };
        
        this.scanForUnsupportedFeatures = function (ctx) {
        };
        
        this.externalizeStyles = function (ctx) {
            var omIn = ctx.currentOMNode,
                gradientID,
                styleBlock,
                stroke;
            
            if (!hasStroke(ctx)) {
                return;
            }

            stroke = omIn.style.stroke;
            // Make a style for this stroke and reference it.
            styleBlock = ctx.omStylesheet.getStyleBlock(omIn, ctx.ID.getUnique);
            if (stroke.type == "gradient") {
                gradientID = writeGradient(ctx, ctx.svgOM.global.gradients[stroke.gradient], "-stroke");
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
                    if (element && element.hasOwnProperty("value")) {
                        element = px(element);
                    }
                    // This is a work around for a bug in Chrome on [0,2] dash arrays.
                    if (!index && !element)
                        return 0.001;
                    return width * element;
                }).join();
                styleBlock.addRule("stroke-dasharray", dashArray);
            }
        };
	}

	module.exports = new SVGWriterStroke();
    
}());
