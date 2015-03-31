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

    var svgWriterUtils = require("./svgWriterUtils.js"),
        Tag = require("./svgWriterTag.js");

    module.exports = {
        externalizeStyles: function (ctx) {
            var omIn = ctx.currentOMNode,
                fingerprint = "",
                mask,
                maskID,
                styleBlock,
                maskTag;

            if (!omIn.style || !omIn.style.mask) {
                return;
            }
            mask = omIn.style.mask;
            if (ctx.svgOM.global && ctx.svgOM.global.masks[mask]) {
                maskID = ctx.ID.getUnique("mask");
                ctx.currentOMNode = ctx.svgOM.global.masks[mask];
                var copy = JSON.parse(JSON.stringify(ctx.svgOM.global.masks[mask]));
                maskTag = Tag.make(ctx);
                fingerprint = maskTag.toString();
                ctx.currentOMNode = copy;
                maskTag = Tag.make(ctx);
                ctx.currentOMNode = omIn;
                maskTag.setAttribute("id", maskID);
                ctx.omStylesheet.define("mask", omIn.id, maskID, maskTag, fingerprint);
            }

            styleBlock = ctx.omStylesheet.getStyleBlock(omIn, ctx.ID.getUnique);
            maskID = ctx.omStylesheet.getDefine(omIn.id, "mask").defnId;
            styleBlock.addRule("mask", "url(#" + maskID + ")");
        }
    };
}());
