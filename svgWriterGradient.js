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
        Tag = require("./svgWriterTag.js"),
        round10k = svgWriterUtils.round10k,
        gradientStops = {},
        getTransform = svgWriterUtils.getTransform,
        offsetX = 0,
        offsetY = 0;

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
        getLinearGradientInternal: function (ctx, gradient, gradientRef, tag, link, lines, gradientID) {
            var x1 = gradientRef.x1 + offsetX,
                x2 = gradientRef.x2 + offsetX,
                y1 = gradientRef.y1 + offsetY,
                y2 = gradientRef.y2 + offsetY,
                attr = {
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2,
                    gradientTransform: getTransform(gradientRef.transform)
                };
            if (link) {
                attr["xlink:href"] = "#" + link.id;
                tag.setAttributes(attr);
            } else {
                gradientStops[lines] = {
                    id: gradientID,
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2,
                    gradientTransform: getTransform(gradientRef.transform)
                };
                attr.gradientUnits = "userSpaceOnUse";
                tag.setAttributes(attr);
                tag.children = removeDups(lines);
            }
        },
        getRadialGradientInternal: function (ctx, gradient, gradientRef, tag, link, lines, gradientID) {
            var cx = gradientRef.cx + offsetX,
                cy = gradientRef.cy + offsetY,
                fx = gradientRef.fx ? gradientRef.fx + offsetX : cx,
                fy = gradientRef.fy ? gradientRef.fy + offsetY : cy,
                r = gradientRef.r,
                attr = {
                    cx: cx,
                    cy: cy,
                    r: r,
                    gradientTransform: getTransform(gradientRef.transform)
                },
                deltaX,
                deltaY,
                angle,
                rMax = 0.99 * r;
            if (isFinite(fx) && fx != cx) {
                attr.fx = fx;
            }
            if (isFinite(fy) && fy != cy) {
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
                    gradientTransform: getTransform(gradientRef.transform)
                };
                attr.gradientUnits = "userSpaceOnUse";
                tag.setAttributes(attr);
                tag.children = removeDups(lines);
            }
        },
        writeGradient: function (ctx, styleBlock, gradientRef, flavor) {
            var omIn = ctx.currentOMNode,
                gradient = ctx.svgOM.global.gradients[gradientRef.id],
                gradientID = ctx.ID.getUnique(gradient.type + "-gradient"),
                stops = gradient.stops,
                gradientSpace = gradientRef.gradientSpace,
                fingerprint = "",
                stp,
                lines = [],
                link,
                tag = new Tag(gradient.type + "Gradient", {
                    id: gradientID
                });

            // FIXME: This check is because we do not shift points of paths
            // but translate the whole path including paint servers.
            // In the future we may shift the points and remove this special
            // case.
            if (omIn.type == "shape" && omIn.shape.type != "path") {
                offsetX = (ctx._shiftContentX || 0) + (ctx._shiftCropRectX || 0);
                offsetY = (ctx._shiftContentY || 0) + (ctx._shiftCropRectY || 0);
            }

            if (!stops) {
                console.warn("encountered gradient with no stops");
                return;
            }

            for (var i = 0, ii = stops.length; i < ii; ++i) {
                stp = stops[i];
                lines.push(new Tag("stop", {
                    offset: stp.offset,
                    "stop-color": stp.color,
                    "stop-opacity": isFinite(stp.color.a) ? stp.color.a : 1
                }));
            }

            link = gradientStops[lines];
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

            ctx.omStylesheet.define(gradient.type + "-gradient-" + flavor, omIn.id, gradientID, tag, fingerprint);
            styleBlock = ctx.omStylesheet.getStyleBlock(omIn, ctx.ID.getUnique);
            gradientID = ctx.omStylesheet.getDefine(omIn.id, gradient.type + "-gradient-" + flavor).defnId;
            styleBlock.addRule(flavor, "url(#" + gradientID + ")");
        }
    };

    module.exports = self;

}());
