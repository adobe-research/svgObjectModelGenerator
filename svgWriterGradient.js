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
        utils = require("./utils.js"),
        Tag = require("./svgWriterTag.js"),
        round10k = svgWriterUtils.round10k,
        gradientStops = {},
        getTransform = svgWriterUtils.getTransform,
        offsetX = 0,
        offsetY = 0;

    function removeDups(ctx, lines) {
        var out = [lines[0]];
        for (var i = 1; i < lines.length; i++) {
            if (lines[i - 1].toString() != lines[i].toString()) {
                out.push(lines[i]);
            } else {
                ctx.tagCounter--;
            }
        }
        return out;
    }
    var self = {
        gradientStopsReset: function () {
            gradientStops = {};
        },
        getLinearGradientInternal: function (ctx, gradient, gradientRef, tag, link, lines, gradientID) {
            var t = getTransform(gradientRef.transform, offsetX, offsetY, ctx.precision),
                x1 = gradientRef.x1 + (t ? 0 : offsetX),
                x2 = gradientRef.x2 + (t ? 0 : offsetX),
                y1 = gradientRef.y1 + (t ? 0 : offsetY),
                y2 = gradientRef.y2 + (t ? 0 : offsetY),
                gradientSpace = gradientRef.units || "userSpaceOnUse",
                attr = {
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2,
                    gradientTransform: t
                };
            if (link) {
                attr["xlink:href"] = "#" + link.id;
                // Override transforms of referenced gradients.
                if (link.gradientTransform && !attr.gradientTransform) {
                    attr.gradientTransform = "matrix(1, 0, 0, 1, 0, 0)";
                }
                tag.setAttributes(attr);
            } else {
                gradientStops[lines] = {
                    id: gradientID,
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2,
                    gradientTransform: t
                };
                attr.gradientUnits = gradientSpace;
                tag.setAttributes(attr);
                tag.children = removeDups(ctx, lines);
            }
        },
        getRadialGradientInternal: function (ctx, gradient, gradientRef, tag, link, lines, gradientID) {
            var t = getTransform(gradientRef.transform, offsetX, offsetY, ctx.precision),
                cx = gradientRef.cx + (t ? 0 : offsetX),
                cy = gradientRef.cy + (t ? 0 : offsetY),
                fx = gradientRef.fx ? gradientRef.fx + (t ? 0 : offsetX) : cx,
                fy = gradientRef.fy ? gradientRef.fy + (t ? 0 : offsetY) : cy,
                r = gradientRef.r,
                gradientSpace = gradientRef.units || "userSpaceOnUse",
                attr = {
                    cx: cx,
                    cy: cy,
                    r: r,
                    gradientTransform: t
                },
                deltaX,
                deltaY,
                angle,
                rMax = 0.99 * r;
            if (isFinite(fx) && !ctx.eq(fx, cx)) {
                attr.fx = fx;
            }
            if (isFinite(fy) && !ctx.eq(fy, cy)) {
                attr.fy = fy;
            }

            // Spec of SVG 1.1: If (fx, fy) lies outside the circle defined by (cx, cy) and r, set
            // (fx, fy) to the point of intersection of the line through (fx, fy) and the circle.
            // A value of 0.99 matches the behavior of Firefox and Illustrator.
            deltaX = attr.fx - attr.cx;
            deltaY = attr.fy - attr.fy;
            if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) > rMax) {
                angle = Math.atan(deltaY, deltaX);
                deltaX = Math.cos(angle) * rMax;
                deltaY = Math.sin(angle) * rMax;
                attr.fx = deltaX + attr.cx;
                attr.fy = deltaY + attr.cy;
            }

            if (link) {
                // fx/fy are special because if not set, they fallback to cx/cy. Since
                // we always just have one link reference (not more than one jump) we
                // just need to check if we have cx or cy set.
                if (isFinite(link.fx) && !isFinite(attr.fx) && isFinite(attr.cx)) {
                    attr.fx = attr.cx;
                }
                if (isFinite(link.fy) && !isFinite(attr.fy) && isFinite(attr.cy)) {
                    attr.fy = attr.cy;
                }
                // Override transforms of referenced gradients.
                if (link.gradientTransform && !attr.gradientTransform) {
                    attr.gradientTransform = "matrix(1, 0, 0, 1, 0, 0)";
                }
                attr["xlink:href"] = "#" + link.id;
                tag.setAttributes(attr);
            } else {
                gradientStops[lines] = {
                    id: gradientID,
                    cx: cx,
                    cy: cy,
                    fx: attr.fx,
                    fy: attr.fy,
                    r: r,
                    gradientTransform: t
                };
                attr.gradientUnits = gradientSpace;
                tag.setAttributes(attr);
                tag.children = removeDups(ctx, lines);
            }
        },
        writeGradient: function (ctx, styleBlock, gradientRef, flavor) {
            var omIn = ctx.currentOMNode,
                gradient = ctx.svgOM.resources.gradients[gradientRef.ref],
                name = gradient.name && gradient.name.substr(0, 7) != "Unnamed" ? gradient.name : undefined, // FIXME: Hack until we know how to identify unnamed gradients in Ai.
                gradientID = ctx.ID.getUnique(gradient.type + "-gradient", name),
                stops = gradient.stops,
                color,
                gradientSpace = gradientRef.units || "userSpaceOnUse",
                fingerprint = "",
                stp,
                lines = [],
                link,
                alpha = 0;
            ctx.currentOMNode = gradient;
            var tag = new Tag(gradient.type + "Gradient", {
                    id: gradientID
                }, ctx);
            ctx.currentOMNode = omIn;

            if (!ctx.minify && name && gradientID != name) {
                tag.setAttribute("data-name", name);
            }

            // FIXME: This check is because we do not shift points of paths
            // but translate the whole path including paint servers.
            // In the future we may shift the points and remove this special
            // case.
            offsetX = 0;
            offsetY = 0;
            if (omIn.shifted && gradientSpace == "userSpaceOnUse") {
                offsetX = (ctx._shiftContentX || 0) + (ctx._shiftCropRectX || 0);
                offsetY = (ctx._shiftContentY || 0) + (ctx._shiftCropRectY || 0);
            }


            if (!stops) {
                console.warn("encountered gradient with no stops");
                return;
            }

            for (var i = 0, ii = stops.length; i < ii; ++i) {
                stp = stops[i];
                color = utils.clone(stp.color);
                delete color.alpha;
                alpha = isFinite(stp.color.alpha) ? stp.color.alpha : 1;
                lines.push(new Tag("stop", {
                    offset: stp.offset,
                    "stop-color": svgWriterUtils.writeColor(color, ctx),
                    "stop-opacity": alpha
                }));
            }

            link = gradientStops[lines];
            if (link) {
                ctx.tagCounter -= lines.length;
            }
            if (gradient.type == "linear") {
                self.getLinearGradientInternal(ctx, gradient, gradientRef, tag, link, lines, gradientID);
            } else {
                self.getRadialGradientInternal(ctx, gradient, gradientRef, tag, link, lines, gradientID);
            }

            fingerprint = JSON.stringify({
                cx: round10k(gradientRef.cx),
                cy: round10k(gradientRef.cy),
                x1: round10k(gradientRef.x1),
                y1: round10k(gradientRef.y1),
                x2: round10k(gradientRef.x2),
                y2: round10k(gradientRef.y2),
                fx: round10k(gradientRef.fx),
                fy: round10k(gradientRef.fy),
                r: round10k(gradientRef.r),
                transform: gradientRef.transform,
                stops: stops,
                gradientSpace: gradientSpace
            });

            ctx.omStylesheet.def(tag, function (def) {
                ctx.omStylesheet.getStyleBlock(omIn).addRule(flavor, "url(#" + ctx.prefix + def.getAttribute("id") + ")");
            }, fingerprint);
        }
    };

    module.exports = self;

}());
