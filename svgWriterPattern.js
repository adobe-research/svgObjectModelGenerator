// Copyright (c) 2015 Adobe Systems Incorporated. All rights reserved.
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

/* Help write patterns  */

(function () {
    "use strict";

    var Tag = require("./svgWriterTag.js");

    module.exports = {
        writePattern: function (ctx, patternRef, flavor) {
            var omIn = ctx.currentOMNode,
                patternID,
                patternTag,
                offsetX = omIn.shifted ? (ctx._shiftContentX || 0) + (ctx._shiftCropRectX || 0) : 0,
                offsetY = omIn.shifted ? (ctx._shiftContentY || 0) + (ctx._shiftCropRectY || 0) : 0,
                name,
                width,
                height;

            if (patternRef.ref && ctx.svgOM.resources && ctx.svgOM.resources.patterns[patternRef.ref]) {
                ctx.currentOMNode = ctx.svgOM.resources.patterns[patternRef.ref];
                ctx.currentOMNode.transform = patternRef.transform;
                ctx.currentOMNode.transformTX = offsetX;
                ctx.currentOMNode.transformTY = offsetY;
                name = ctx.currentOMNode.name;
                patternID = ctx.ID.getUnique("pattern", name);
                patternTag = Tag.make(ctx);
                ctx.currentOMNode = omIn;
                patternTag.setAttribute("id", patternID);
                if (!ctx.minify && name && patternID != name) {
                    patternTag.setAttribute("data-name", name);
                }
                ctx.omStylesheet.def(patternTag, function (def) {
                    ctx.omStylesheet.getStyleBlock(omIn).addRule(flavor, "url(#" + ctx.prefix + def.getAttribute("id") + ")");
                });
            }

            if (typeof patternRef.href == "string") {
                patternID = ctx.ID.getUnique("pattern");
                width = parseFloat(patternRef.width);
                height = parseFloat(patternRef.height);
                patternTag = new Tag("pattern", {
                    id: patternID,
                    width: "100%",
                    height: "100%",
                    patternContentUnits: "userSpaceOnUse",
                    preserveAspectRatio: "xMidYMid slice",
                    viewBox: [0, 0, width, height]
                });
                patternTag.appendChild(new Tag("image", {
                    "xlink:href": patternRef.href,
                    width: width,
                    height: height
                }));
                ctx.omStylesheet.def(patternTag, function (def) {
                    ctx.omStylesheet.getStyleBlock(omIn).addRule(flavor, "url(#" + ctx.prefix + def.getAttribute("id") + ")");
                });
            }
        }
    };
}());
