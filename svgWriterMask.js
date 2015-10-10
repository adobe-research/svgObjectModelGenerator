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

/* Help write the masks  */

(function () {
    "use strict";

    var Tag = require("./svgWriterTag.js"),
        getTransform = require("./svgWriterUtils").getTransform;

    module.exports = {
        externalizeStyles: function (ctx) {
            var omIn = ctx.currentOMNode,
                mask,
                maskID,
                maskTag,
                maskPrint,
                name,
                offsetX = omIn.shifted ? (ctx._shiftContentX || 0) + (ctx._shiftCropRectX || 0) : 0,
                offsetY = omIn.shifted ? (ctx._shiftContentY || 0) + (ctx._shiftCropRectY || 0) : 0;

            if (!omIn.style || !omIn.style.mask || !omIn.style.mask.ref) {
                return;
            }
            ctx.masks = ctx.masks || {};
            mask = omIn.style.mask.ref;
            maskPrint = [mask, offsetX, offsetY];
            maskTag = ctx.masks[maskPrint];
            if (!maskTag && ctx.svgOM.resources && ctx.svgOM.resources.masks[mask]) {
                ctx.currentOMNode = ctx.svgOM.resources.masks[mask];
                name = ctx.currentOMNode.name;
                maskID = ctx.ID.getUnique("mask", name);
                ctx.currentOMNode.translateTX = offsetX;
                ctx.currentOMNode.translateTY = offsetY;
                maskTag = Tag.make(ctx);
                if (omIn.shifted && (offsetX || offsetY)) {
                    var g = new Tag("g", {transform: getTransform(null, offsetX, offsetY, ctx.precision, true)});
                    g.children = maskTag.children;
                    maskTag.children = [g];
                }
                ctx.masks[maskPrint] = maskTag;
                ctx.currentOMNode = omIn;
                maskTag.setAttribute("id", maskID);
                if (!ctx.minify && name && maskID != name) {
                    maskTag.setAttribute("data-name", name);
                }
            }
            if (maskTag) {
                ctx.omStylesheet.def(maskTag, function (def) {
                    ctx.omStylesheet.getStyleBlock(omIn).addRule("mask", "url(#" + ctx.prefix + def.getAttribute("id") + ")");
                });
            }
        }
    };
}());
