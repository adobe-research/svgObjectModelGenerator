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

/* Help write the symbols  */

(function () {
    "use strict";

    var Tag = require("./svgWriterTag.js");

    module.exports = {
        writeSymbol: function (ctx, symbol) {
            var omIn = ctx.currentOMNode,
                fingerprint = "",
                symbolID,
                symbolTag;

            if (ctx.svgOM.global && ctx.svgOM.global.symbols[symbol]) {
                symbolID = ctx.ID.getUnique("symbol");
                ctx.currentOMNode = ctx.svgOM.global.symbols[symbol];
                symbolTag = Tag.make(ctx);
                fingerprint = symbolTag.toString();
                ctx.currentOMNode = omIn;
                symbolTag.setAttribute("id", symbolID);
                ctx.omStylesheet.define("symbol", symbol, symbolID, symbolTag, fingerprint);
            }
        }
    };
}());
