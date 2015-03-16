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

/* Help write the gradients */

(function () {
    "use strict";

    var svgWriterUtils = require("./svgWriterUtils.js"),
        Tag = require("./svgWriterTag.js");

    var round10k = svgWriterUtils.round10k,
        gradientStops = {};

    function removeDups(lines) {
        var out = [lines[0]];
        for (var i = 1; i < lines.length; i++) {
            if (lines[i - 1].toString() != lines[i].toString()) {
                out.push(lines[i]);
            }
        }
        return out;
    }
    var self = {
        gradientStopsReset: function () {
            gradientStops = {};
        },
        getLinearGradientInternal: function (ctx, stops, gradientID, x1, y1, x2, y2) {
            var iStop,
                stp,
                stpOpacity,
                offset,
                link;
            x1 += ctx._shiftContentX || 0;
            x2 += ctx._shiftContentX || 0;
            y1 += ctx._shiftContentY || 0;
            y2 += ctx._shiftContentY || 0;

            if (stops) {
                var lines = [],
                    tag = new Tag("linearGradient", {
                        id: gradientID
                    });
                for (iStop = 0; iStop < stops.length; iStop++) {
                    stp = stops[iStop];
                    stpOpacity = '';
                    var stop = new Tag("stop", {
                        offset: stp.offset,
                        "stop-color": stp.color,
                        "stop-opacity": isFinite(stp.color.a) ? stp.color.a : 1
                    });
                    lines.push(stop);
                }
                link = gradientStops[lines];
                if (link) {
                    tag.setAttributes({
                        x1: x1,
                        y1: y1,
                        x2: x2,
                        y2: y2,
                        "xlink:href": "#" + link.id
                    });
                } else {
                    gradientStops[lines] = {
                        id: gradientID,
                        x1: x1,
                        y1: y1,
                        x2: x2,
                        y2: y2
                    };
                    tag.setAttributes({
                        gradientUnits: "userSpaceOnUse",
                        x1: x1,
                        y1: y1,
                        x2: x2,
                        y2: y2
                    });
                    tag.children = removeDups(lines);
                }
                return tag;
            } else {
                console.warn("encountered gradient with no stops");
            }
        },
        writeLinearGradient: function (ctx, gradient, flavor) {
            var omIn = ctx.currentOMNode,
                gradientID = ctx.ID.getUnique("linear-gradient"),
                stops = gradient.stops,
                tag = self.getLinearGradientInternal(ctx, stops, gradientID, gradient.x1, gradient.y1, gradient.x2, gradient.y2);

            ctx.omStylesheet.define("linear-gradient" + flavor, omIn.id, gradientID, tag.toString(), JSON.stringify({ x1: gradient.x1, y1: gradient.y1, x2: gradient.x2, y2: gradient.y2, stops: stops }));
            gradientID = ctx.omStylesheet.getDefine(omIn.id, "linear-gradient" + flavor).defnId;
            return gradientID;
        },
        getRadialGradientInternal: function (cx, cy, r, gradientID, stops) {
            var iStop,
                stp,
                stpOpacity,
                lines = [],
                link,
                tag = new Tag("radialGradient", {
                    id: gradientID
                });

            for (iStop = 0; iStop < stops.length; iStop++) {
                stp = stops[iStop];
                stpOpacity = '';
                lines.push(new Tag("stop", {
                    offset: stp.offset,
                    "stop-color": stp.color,
                    "stop-opacity": isFinite(stp.color.a) ? stp.color.a : 1
                }));
            }
            link = gradientStops[lines];
            if (link) {
                tag.setAttributes({
                    cx: cx,
                    cy: cy,
                    r: r,
                    "xlink:href": "#" + link.id
                });
            } else {
                gradientStops[lines] = {
                    id: gradientID,
                    cx: cx,
                    cy: cy,
                    r: r
                };
                tag.setAttributes({
                    gradientUnits: "userSpaceOnUse",
                    cx: cx,
                    cy: cy,
                    r: r
                });
                tag.children = removeDups(lines);
            }
            return tag;
        },
        writeRadialGradient: function (ctx, gradient, flavor) {
            var omIn = ctx.currentOMNode,
                gradientID = ctx.ID.getUnique("radial-gradient"),
                stops = gradient.stops,
                gradientSpace = gradient.gradientSpace,
                tag;

            tag = self.getRadialGradientInternal(gradient.cx, gradient.cy, gradient.r, gradientID, stops);
            ctx.omStylesheet.define("radial-gradient" + flavor, omIn.id, gradientID, tag.toString(), JSON.stringify({
                cx: round10k(gradient.cx),
                cy: round10k(gradient.cy),
                r: round10k(gradient.r),
                stops: stops,
                gradientSpace: gradientSpace
            }));
            gradientID = ctx.omStylesheet.getDefine(omIn.id, "radial-gradient" + flavor).defnId;
            return gradientID;
        }
    };

    module.exports = self;

}());
