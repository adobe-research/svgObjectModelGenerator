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

    module.exports = {
        externalizeStyles: function (ctx) {
            var omIn = ctx.currentOMNode,
                fill,
                styleBlock = ctx.omStylesheet.getStyleBlock(omIn);

            if (!omIn.style || !omIn.style.fill) {
                if (omIn.type == "shape" || "from" in omIn && "to" in omIn) {
                    styleBlock.addRule("fill", "none");
                }
                return;
            }
            fill = omIn.style.fill;

            if (fill.type === "gradient") {
                writeGradient(ctx, styleBlock, fill.gradient, "fill");
            } else if (fill.type == "pattern") {
                writePattern(ctx, fill.pattern, "fill");
            } else if (fill.type == "none") {
                styleBlock.addRule("fill", "none");
            } else {
                styleBlock.addRule("fill", svgWriterUtils.writeColor(fill.color, ctx));
            }

            if (isFinite(omIn.style.fill.opacity)) {
                styleBlock.addRule("fill-opacity", omIn.style.fill.opacity);
            }
        }
    };
}());
