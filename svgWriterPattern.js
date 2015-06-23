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
                fingerprint = "",
                patternID,
                styleBlock,
                patternTag;

            if (ctx.svgOM.global && ctx.svgOM.global.patterns[patternRef.ref]) {
                ctx.currentOMNode = ctx.svgOM.global.patterns[patternRef.ref];
                ctx.currentOMNode.transform = patternRef.transform;
                patternID = ctx.ID.getUnique("pattern", ctx.currentOMNode.name);
                patternTag = Tag.make(ctx);
                fingerprint = patternTag.toString();
                ctx.currentOMNode = omIn;
                patternTag.setAttribute("id", patternID);
                ctx.omStylesheet.define("pattern-" + flavor, omIn.id, patternID, patternTag, fingerprint);
            }

            styleBlock = ctx.omStylesheet.getStyleBlock(omIn, ctx.ID.getUnique);
            patternID = ctx.omStylesheet.getDefine(omIn.id, "pattern-" + flavor).defnId;
            styleBlock.addRule(flavor, "url(#" + patternID + ")");
        }
    };
}());
