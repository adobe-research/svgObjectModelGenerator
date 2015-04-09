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
                fingerprint = "",
                clipPath,
                clipPathID,
                styleBlock,
                clipPathTag;

            if (!omIn.style || !omIn.style["clip-path"]) {
                return;
            }
            clipPath = omIn.style["clip-path"];
            if (ctx.svgOM.global && ctx.svgOM.global.clipPaths[clipPath]) {
                clipPathID = ctx.ID.getUnique("clip-path");
                ctx.currentOMNode = ctx.svgOM.global.clipPaths[clipPath];
                clipPathTag = Tag.make(ctx);
                fingerprint = clipPathTag.toString();
                ctx.currentOMNode = omIn;
                clipPathTag.setAttribute("id", clipPathID);
                ctx.omStylesheet.define("clip-path", omIn.id, clipPathID, clipPathTag, fingerprint);
            }

            styleBlock = ctx.omStylesheet.getStyleBlock(omIn, ctx.ID.getUnique);
            clipPathID = ctx.omStylesheet.getDefine(omIn.id, "clip-path").defnId;
            styleBlock.addRule("clip-path", "url(#" + clipPathID + ")");
        }
    };
}());
