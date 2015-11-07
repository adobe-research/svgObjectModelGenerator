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

        var writeFilter = function (ctx, shifted, ele, previousEffect) {
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

            if (shifted) {
                if (typeof attr.x == "number") {
                    attr.x += (ctx._shiftContentX || 0) + (ctx._shiftCropRectX || 0)
                }
                if (typeof attr.y == "number") {
                    attr.y += (ctx._shiftContentY || 0) + (ctx._shiftCropRectY || 0);
                }
            }

            for (i = 0, ii = input.length; i < ii; ++i) {
                if (input[i] != previousEffect) {
                    attr["in" + (i ? "2" : "")] = input[i];
                }
            }
            cur = new Tag(ele.kind, attr);

            for (i = 0, ii = children.length; i < ii; ++i) {
                cur.appendChild(writeFilter(ctx, shifted, children[i], i ? children[i - 1].id : ""));
            }
            return cur;
        };

        this.externalizeStyles = function (ctx) {
            var omIn = ctx.currentOMNode,
                filter,
                filterID,
                filterTag;

            if (!omIn.style || !omIn.style.filters || !omIn.style.filters.length) {
                return;
            }
            for (var i = 0; i < omIn.style.filters.length; i++) {
                filter = omIn.style.filters[i];
                if (filter.ref) {
                    if (!ctx.svgOM.resources || !ctx.svgOM.resources.filters[filter.ref]) {
                        continue;
                    }
                    filter = ctx.svgOM.resources.filters[filter.ref];
                }
                if (filter.type != "svgFilter") {
                    continue;
                }
                if (!filter.params) {
                    continue;
                }
                ctx.currentOMNode = filter.params;
                filterID = ctx.ID.getUnique("filter", ctx.currentOMNode.name);
                ctx.currentOMNode.kind = "filter";
                filterTag = writeFilter(ctx, omIn.shifted, ctx.currentOMNode);
                ctx.currentOMNode = omIn;
                filterTag.setAttribute("id", filterID);
                ctx.omStylesheet.def(filterTag, function (def) {
                    ctx.omStylesheet.getStyleBlock(omIn).addRule("filter", "url(#" + ctx.prefix + def.getAttribute("id") + ")");
                });
                break;
            }
        };
    }

    module.exports = new SVGWriterFx;

}());
