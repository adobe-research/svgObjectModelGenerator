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


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, bitwise: true */
/*global define: true, require: true */

/* Help write the SVG */

(function () {
    "use strict";
    
    var svgWriterUtils = require("./svgWriterUtils.js"),
        Tag = require("./svgWriterTag.js");

    var ctxCapture = svgWriterUtils.ctxCapture;

    function SVGWriterFx() {

        var writeFilter = function (ctx, ele, previousEffect) {
            var name = ele.name,
                input = ele.input || [],
                children = ele.children || [],
                cur,
                i,
                ii;
            delete ele.name;
            delete ele.input;
            delete ele.children;

            if (typeof ele.x === "number") {
                ele.x += ctx._shiftContentX || 0;
            }
            if (typeof ele.y === "number") {
                ele.y += ctx._shiftContentY || 0;
            }

            for (i = 0, ii = input.length; i < ii; ++i) {
                if (input[i] != previousEffect) {
                    ele["in" + (i ? "2" : "")] = input[i];
                }
            }
            cur = new Tag(name, ele);

            for (i = 0, ii = children.length; i < ii; ++i) {
                cur.appendChild(writeFilter(ctx, children[i], i ? children[i - 1].result : ''));
            }
            return cur;
        };

        var hasPSEffect = function (fx, effect) {
            if (!fx[effect]) {
                return false;
            }
            return fx[effect].some(function(ele) {
                return ele.enabled;
            });
        };

        this.scanForUnsupportedFeatures = function (ctx) {
            var omIn = ctx.currentOMNode;

            // This scans for unsupported PS filter effects.
            if (omIn.style && omIn.style.meta && omIn.style.meta.PS) {
                if (hasPSEffect(omIn.style.meta.PS, 'bevelEmbossMulti')) {
                    ctx.errors.push('Bevel and Emboss filter effects are not supported by SVG export.');
                }
                
                if (hasPSEffect(omIn.style.meta.PS, 'patternOverlayMulti')) {
                    ctx.errors.push('Pattern Overlay effects are not supported by SVG export.');
                }
            }
        };

        this.externalizeStyles = function (ctx) {
            var omIn = ctx.currentOMNode,
                styleBlock,
                fingerprint = "",
                filterID,
                filter,
                filterTag;

            if (!omIn.style || !omIn.style.filter) {
                return;
            }

            ctxCapture(ctx, function () {
                filterID = ctx.ID.getUnique("filter");

                filter = ctx.svgOM.global.filters[omIn.style.filter];
                fingerprint = JSON.stringify(filter.children);

                filter.id = filterID;
                filter.name = "filter";
                filterTag = writeFilter(ctx, filter);

                filterTag.write(ctx);
            }.bind(this), function (out) {
                ctx.omStylesheet.define("filter", omIn.id, filterID, out, fingerprint);
            }.bind(this));

            styleBlock = ctx.omStylesheet.getStyleBlock(omIn, ctx.ID.getUnique);
            filterID = ctx.omStylesheet.getDefine(omIn.id, "filter").defnId;
            styleBlock.addRule("filter", "url(#" + filterID + ")");
        };
	}

	module.exports = new SVGWriterFx();
    
}());
