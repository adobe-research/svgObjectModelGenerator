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

    var round1k = svgWriterUtils.round1k,
        round10k = svgWriterUtils.round10k,
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
        // FIXME: Move this function to svgOMGeneratorUtils once overlay gradients
        // were transformed as well.
        computeLinearGradientCoordinates: function (gradient, bounds, angle) {
            var w2 = (bounds.right - bounds.left) / 2,
                h2 = (bounds.bottom - bounds.top) / 2,
                coords;

            // SVG wants the angle in cartesian, not polar, coordinates.
            var rad = (angle % 360) * Math.PI / 180;
            var x1, x2, y1, y2, xa, ya,
                cx = bounds.left + w2,
                cy = bounds.top + h2;

            if (Math.abs(w2 / Math.cos(rad) * Math.sin(rad)) < h2) {
                if (h2 > w2) {
                    xa = w2 / Math.cos(rad) * Math.sin(rad);
                    ya = w2;
                } else {
                    xa = w2;
                    ya = w2 / Math.cos(rad) * Math.sin(rad);
                }
            } else {
                xa = h2 / Math.sin(rad) * Math.cos(rad);
                ya = h2;
            }

            // FIXME: self is a hack to deal with a mistake above that still needs
            // to be fixed.
            if (rad < 0 || angle == 180 ) {
                ya = -ya;
            } else {
                xa = -xa;
            }

            // FIXME: We should be able to optimize the cases of angle mod 90 to use %
            // and possibly switch to objectBoundingBox.
            // FIXME : We could optimize cases where x1 == x2 or y1 == y2 to reduce
            // generated content.

            return { xa: xa, ya: ya, cx: cx, cy: cy };
        },
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
        writeGradientOverlay: function (ctx, gradient, rootBounds, gradientID) {
            var omIn = ctx.currentOMNode,
                layerBounds = omIn.shapeBounds,
                bounds,
                coords,
                stops = gradient.stops,
                w2,
                h2,
                cx,
                cy,
                angle,
                hl,
                hw,
                r;

            if (gradient.gradientSpace === "objectBoundingBox") {
                bounds = {
                    bottom: layerBounds.bottom - layerBounds.top,
                    right: layerBounds.right - layerBounds.left,
                    top: 0,
                    left: 0
                };
            } else {
                bounds = {
                    bottom: rootBounds.bottom - layerBounds.top,
                    right: rootBounds.right - layerBounds.left,
                    top: rootBounds.top - layerBounds.top,
                    left: rootBounds.left - layerBounds.left
                };
            }
            if (gradient.type === "radial") {
                w2 = (bounds.right - bounds.left) / 2;
                h2 = (bounds.bottom - bounds.top) / 2;
                cx = round1k(bounds.left + w2);
                cy = round1k(bounds.top + h2);
                angle = Math.abs(gradient.angle - 90 % 180) * Math.PI / 180;
                hl = Math.abs(h2 / Math.cos(angle));
                hw = Math.abs(w2 / Math.sin(angle));
                r = round1k(hw < hl ? hw : hl);
                self.getRadialGradientInternal(cx, cy, r, gradientID, stops).write(ctx);
            } else {
                coords = self.computeLinearGradientCoordinates(gradient, bounds, gradient.angle);
                var x1 = round1k(coords.xa + coords.cx),
                    y1 = round1k(coords.ya + coords.cy),
                    x2 = round1k(coords.cx - coords.xa),
                    y2 = round1k(coords.cy - coords.ya);
                self.getLinearGradientInternal(ctx, stops, gradientID, x1, y1, x2, y2).write(ctx);
            }
            return gradientID;
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
