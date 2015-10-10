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

/* Help write the clipping paths  */

(function () {
    "use strict";

    var Tag = require("./svgWriterTag.js");

    module.exports = {
        externalizeStyles: function (ctx) {
            var omIn = ctx.currentOMNode,
                clipPath,
                clipPathID,
                clipPathTag,
                offsetX = omIn.shifted ? (ctx._shiftContentX || 0) + (ctx._shiftCropRectX || 0) : 0,
                offsetY = omIn.shifted ? (ctx._shiftContentY || 0) + (ctx._shiftCropRectY || 0) : 0,
                name;

            if (!omIn.style || !omIn.style.clipPath || !omIn.style.clipPath.ref) {
                return;
            }
            clipPath = omIn.style.clipPath.ref;
            if (ctx.svgOM.resources && ctx.svgOM.resources.clipPaths[clipPath]) {
                ctx.currentOMNode = ctx.svgOM.resources.clipPaths[clipPath];
                ctx.currentOMNode.transformTX = offsetX;
                ctx.currentOMNode.transformTY = offsetY;
                name = ctx.currentOMNode.name;
                clipPathID = ctx.ID.getUnique("clip-path", name);
                clipPathTag = Tag.make(ctx);
                ctx.currentOMNode = omIn;
                clipPathTag.setAttribute("id", clipPathID);
                if (!ctx.minify && name && clipPathID != name) {
                    clipPathTag.setAttribute("data-name", name);
                }
                ctx.omStylesheet.def(clipPathTag, function (def) {
                    ctx.omStylesheet.getStyleBlock(omIn).addRule("clip-path", "url(#" + ctx.prefix + def.getAttribute("id") + ")");
                });
            }
        },

        // Create a clipping area for the root document.
        writeClipPath: function (ctx, bounds, offsetX, offsetY) {
            var clipPathTag,
                clipPathID = ctx.ID.getUnique("clip-path"),
                rects = [];

            if (!bounds || !bounds.length) {
                return;
            }
            clipPathTag = new Tag("clipPath", {
                id: clipPathID
            });
            for (var i = 0; i < bounds.length; ++i) {
                rects.push(new Tag("rect", {
                    x: bounds[i].left + (ctx._shiftContentX || 0) + offsetX,
                    y: bounds[i].top + (ctx._shiftContentY || 0) + offsetY,
                    width: bounds[i].right - bounds[i].left,
                    height: bounds[i].bottom - bounds[i].top
                }));
            }
            clipPathTag.children = rects;

            ctx.omStylesheet.def(clipPathTag);

            ctx._contentClipPathID = clipPathID;
        }
    };
}());
