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

    var Tag = require("./svgWriterTag.js"),
        svgWriterUtils = require("./svgWriterUtils.js");

    function SVGWriterFx() {

        var writeFilter = function (ctx, ele, previousEffect) {
            var attr = {},
                input = ele.input || [],
                children = ele.children || [],
                cur,
                i,
                ii;

            attr.result = ele.id;
            if (ele.kind == "filter") {
                attr.id = ele.id;
            }
            for (var prop in ele) {
                if (prop == "input" || prop == "children" ||
                    prop == "kind" || prop == "input" || prop == "id") {
                    continue;
                }
                if (prop == "flood-color") {
                    attr[prop] = svgWriterUtils.writeColor(ele[prop], ctx);
                } else {
                    attr[prop] = ele[prop];
                }
            }

            if (typeof attr.x === "number") {
                attr.x += ctx._shiftContentX || 0;
            }
            if (typeof attr.y === "number") {
                attr.y += ctx._shiftContentY || 0;
            }

            for (i = 0, ii = input.length; i < ii; ++i) {
                if (input[i] != previousEffect) {
                    attr["in" + (i ? "2" : "")] = input[i];
                }
            }
            cur = new Tag(ele.kind, attr);

            for (i = 0, ii = children.length; i < ii; ++i) {
                cur.appendChild(writeFilter(ctx, children[i], i ? children[i - 1].id : ""));
            }
            return cur;
        };

        this.externalizeStyles = function (ctx) {
            var omIn = ctx.currentOMNode,
                fingerprint = "",
                filter,
                filterID,
                styleBlock,
                filterTag;

            if (!omIn.style || !omIn.style.filter) {
                return;
            }
            filter = omIn.style.filter;
            if (ctx.svgOM.global && ctx.svgOM.global.filters[filter]) {
                ctx.currentOMNode = ctx.svgOM.global.filters[filter];
                filterID = ctx.ID.getUnique("filter", ctx.currentOMNode.name);
                fingerprint = JSON.stringify(ctx.currentOMNode.children);
                ctx.currentOMNode.kind = "filter";
                filterTag = writeFilter(ctx, ctx.currentOMNode);
                ctx.currentOMNode = omIn;
                filterTag.setAttribute("id", filterID);
                ctx.omStylesheet.define("filter", omIn.id, filterID, filterTag, fingerprint);
            }

            styleBlock = ctx.omStylesheet.getStyleBlock(omIn);
            filterID = ctx.omStylesheet.getDefine(omIn.id, "filter").defnId;
            styleBlock.addRule("filter", "url(#" + filterID + ")");
        };
    }

    module.exports = new SVGWriterFx;

}());
