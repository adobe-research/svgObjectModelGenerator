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

/* Help write the SVG */

(function () {
    "use strict";

    var svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterGradient = require("./svgWriterGradient.js"),
        svgWriterPattern = require("./svgWriterPattern.js"),
        writeGradient = svgWriterGradient.writeGradient,
        writePattern = svgWriterPattern.writePattern;

    function SVGWriterStroke() {

        var hasStroke = function (ctx) {
            var omIn = ctx.currentOMNode;
            return omIn.style && omIn.style.stroke && omIn.style.stroke.type != "none";
        };

        this.externalizeStyles = function (ctx) {
            var omIn = ctx.currentOMNode,
                styleBlock = ctx.omStylesheet.getStyleBlock(omIn),
                stroke;

            if (!hasStroke(ctx)) {
                return;
            }

            stroke = omIn.style.stroke;
            // Make a style for this stroke and reference it.
            if (stroke.type == "gradient") {
                writeGradient(ctx, styleBlock, stroke.gradient, "stroke");
            } else if (stroke.type == "pattern") {
                writePattern(ctx, stroke.pattern, "stroke");
            } else {
                styleBlock.addRule("stroke", svgWriterUtils.writeColor(omIn.style.stroke.color, ctx));
            }
            if (omIn.style.stroke.cap) {
                styleBlock.addRule("stroke-linecap", omIn.style.stroke.cap);
            }
            if (omIn.style.stroke.join) {
                styleBlock.addRule("stroke-linejoin", omIn.style.stroke.join);
            }
            if (!ctx.eq(omIn.style.stroke.miterLimit, 100)) {
                styleBlock.addRule("stroke-miterlimit", omIn.style.stroke.miterLimit || 4);
            }
            if (omIn.style.stroke.dashOffset) {
                styleBlock.addRule("stroke-dashoffset", omIn.style.stroke.dashOffset + "px");
            }
            if (isFinite(omIn.style.stroke.opacity)) {
                styleBlock.addRule("stroke-opacity", omIn.style.stroke.opacity);
            }
            if (isFinite(omIn.style.stroke.width)) {
                ctx._lastStrokeWidth = omIn.style.stroke.width;
                styleBlock.addRule("stroke-width", ctx._lastStrokeWidth + "px");
            }
            if (omIn.style.stroke.dash && omIn.style.stroke.dash.length) {
                var dash = omIn.style.stroke.dash.map(function (element, index) {
                        // This is a work around for a bug in Chrome on [0,2] dash arrays.
                        if (!index && !element) {
                            return 0.001;
                        }
                        return element;
                    }).join();
                styleBlock.addRule("stroke-dasharray", dash);
            }
        };
    }

    module.exports = new SVGWriterStroke;

}());
