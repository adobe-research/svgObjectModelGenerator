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

    var util = require("./utils.js"),
        Tag = require("./svgWriterTag.js");

    module.exports = {
        writeTextPath: function (ctx, pathData) {
            var omIn = ctx.currentOMNode,
                textPathID = ctx.ID.getUnique("text-path"),
                textPath = new Tag("path", {
                    id: textPathID,
                    d: util.optimisePath(pathData, ctx.precision)
                });

            ctx.omStylesheet.define("text-path", omIn.id, textPathID, textPath, pathData);
        }
    };
}());
