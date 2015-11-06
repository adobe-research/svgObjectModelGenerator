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

/* Help construct the svgOM from generator data */

(function () {
    "use strict";

    var Buffer = require("buffer").Buffer;

    function SVGOMGeneratorUtils() {

        var self = this;

        this.toColor = function (c, a) {
            var red,
                green,
                blue;

            if (!isFinite(a)) {
                a = 1.0;
            }
            if (c && (isFinite(c.red) || isFinite(c.green) || isFinite(c.blue))) {
                red = c.red;
                green = c.green;
                blue = c.blue;
            } else if (c && (isFinite(c.redFloat) || isFinite(c.greenFloat) || isFinite(c.blueFloat))) {
                red = Math.max(0, Math.min(255, c.redFloat * 255));
                green = Math.max(0, Math.min(255, c.greenFloat * 255));
                blue = Math.max(0, Math.min(255, c.blueFloat * 255));
            }
            return {
                "mode": "RGB",
                "value": { "r": red || 0, "g": green || 0, "b": blue || 0 },
                "alpha": a
            };
        };

        this.pct2px = function (dim, containerPx) {
            return containerPx * dim / 100;
        };

        this.pt2px = function (dim, dpi) {
            return dpi * (dim / 72);
        };

        this.in2px = function (dim, dpi) {
            return dim * dpi;
        };

        this.mm2in = function (dim) {
            return dim * 0.0393700787;
        };

        this.mm2px = function (dim, dpi) {
            return this.in2px(this.mm2in(dim), dpi);
        };

        this.boundInPx = function (bnd, dpi) {

            if (typeof bnd === "number") {
                return bnd;
            }
            if (bnd.units === "pointsUnit") {
                return self.pt2px(bnd.value, dpi);
            } else if (bnd.units === "millimetersUnit") {
                return self.mm2px(bnd.value, dpi);
            } else if (isFinite(bnd.value)) {
                console.log("unfamiliar bounds unit for text = " + JSON.stringify(bnd));
                return bnd.value;
            }
            return parseInt(bnd, 10);
        };

        this.boundsToRect = function (bounds) {
            return {
                x: bounds.left,
                y: bounds.top,
                width: bounds.right - bounds.left,
                height: bounds.bottom - bounds.top
            };
        };

        function _addOrEditStop(stops, def, colorDefined) {
            var foundStop;
            stops.forEach(function (stp) {
                if (stp.offset === def.offset) {
                    foundStop = stp;
                }
            });

            if (foundStop) {
                if (colorDefined) {
                    foundStop.color.value = {
                        r: def.color.r,
                        g: def.color.g,
                        b: def.color.b
                    };
                } else {
                    foundStop.color.alpha = def.color.alpha;
                }
            } else {
                stops.push(def);
            }
        }

        function computeLinearGradientCoordinates(gradient, bounds, angle) {
            var w2 = (bounds.right - bounds.left) / 2,
                h2 = (bounds.bottom - bounds.top) / 2,
                // SVG wants the angle in cartesian, not polar, coordinates.
                rad = angle % 360 * Math.PI / 180,
                xa, ya,
                cx = bounds.left + w2,
                cy = bounds.top + h2;

            if (Math.abs(w2 / Math.cos(rad) * Math.sin(rad)) < h2) {
                xa = w2;
                ya = w2 / Math.cos(rad) * Math.sin(rad);
            } else {
                xa = h2 / Math.sin(rad) * Math.cos(rad);
                ya = h2;
            }

            // FIXME: self is a hack to deal with a mistake above that still needs
            // to be fixed.
            if (rad < 0 || angle == 180) {
                ya = -ya;
            } else {
                xa = -xa;
            }


            // FIXME: We should be able to optimize the cases of angle mod 90 to use %
            // and possibly switch to objectBoundingBox.
            // FIXME : We could optimize cases where x1 == x2 or y1 == y2 to reduce
            // generated content.

            return { xa: xa, ya: ya, cx: cx, cy: cy };
        }

        this.scanForUnsupportedGradientFeatures = function (gradientRaw, writer) {
            if (gradientRaw.gradient.gradientForm === "colorNoise") {
                writer.errors.push("Gradients with noise are not supported by SVG export.");
                return false;
            }
            if (gradientRaw.type && (gradientRaw.type !== "linear" &&
                gradientRaw.type !== "radial" &&
                gradientRaw.type !== "reflected")) {
                writer.errors.push("Only linear, radial or reflected gradients supported.");
                return false;
            }
            return true;
        };

        this.toBase64 = function (string) {
            var buf = new Buffer(string);
            return buf.toString("base64");
        };

        this.toGradient = function (gradientRaw, layerBounds, docBounds) {
            var gradient = {},
                gradientRef = {},
                gradientType = gradientRaw.type === "radial" ? "radial" : "linear",
                scale = gradientRaw.scale ? gradientRaw.scale.value / 100 : 1,

                // CSS uses clock orientation, PSDs use trig orientation
                // both point an arrow in direction gradient extends.
                angle = 0;
            if (gradientRaw.angle) {
                angle += gradientRaw.angle.value;
            }

            var bounds = gradientRaw.align === undefined || gradientRaw.align ? layerBounds : docBounds;

            gradient = this.toColorStops(gradientRaw);
            gradient.type = gradientType;
            gradient.stops.forEach(function (ele) {
                if (gradientType == "radial") {
                    ele.offset *= scale;
                } else if (gradientType == "linear") {
                    ele.offset = (ele.offset - 0.5) * scale + 0.5;
                }
            });
            gradientRef.units = "userSpaceOnUse";

            if (gradient.type == "radial") {
                angle = Math.abs(angle - 90 % 180) * Math.PI / 180;

                var w2 = (bounds.right - bounds.left) / 2,
                    h2 = (bounds.bottom - bounds.top) / 2,
                    hl = Math.abs(h2 / Math.cos(angle)),
                    hw = Math.abs(w2 / Math.sin(angle));
                gradientRef.r = hw < hl ? hw : hl;
                gradientRef.cx = bounds.left + w2;
                gradientRef.cy = bounds.top + h2;
            } else {
                var coords = computeLinearGradientCoordinates(gradient, bounds, angle);
                gradientRef.x1 = coords.xa + coords.cx;
                gradientRef.y1 = coords.ya + coords.cy;
                gradientRef.x2 = coords.cx - coords.xa;
                gradientRef.y2 = coords.cy - coords.ya;
            }

            return {gradient: gradient, reference: gradientRef};
        };

        this.toColorStops = function (gradientRaw) {
            var gradient = { stops: [] },
                stops = [].concat(gradientRaw.gradient.colors, gradientRaw.gradient.transparency),
                length = gradientRaw.gradient.interfaceIconFrameDimmed,
                reflected = gradientRaw.type && gradientRaw.type === "reflected",
                reverse = gradientRaw.reverse,
                self = this;

            stops.sort(function (a, b) {
                return a.location - b.location;
            });

            function getNextStop(stopType, direction, startLoc, bRecurse) {
                var indexStart,
                    stopRet;
                stops.forEach(function (stop, index) {
                    if (stop.location === startLoc) {
                        if (stop[stopType]) {
                            stopRet = stop;
                        } else {
                            indexStart = index;
                        }
                    }
                });

                if (stopRet) {
                    return stopRet;
                }

                for (; indexStart >= 0 && indexStart < stops.length; indexStart += direction) {
                    if (stops[indexStart][stopType]) {
                        return stops[indexStart];
                    }
                }

                if (!bRecurse) {
                    return getNextStop(stopType, direction * -1, startLoc, true);
                }
            }

            function interpolateValue(fraction, beginValue, endValue) {
                return fraction * (endValue - beginValue) + beginValue;
            }

            function interpolateStop(prevColorStop, nextColorStop, prevOpacityStop, nextOpacityStop, value, firstLoc, lastLoc) {

                var color = value.color ? value.color : { red: 0, green: 0, blue: 0 },
                    opacity = value.opacity ? value.opacity : { value: 100, units: "percentUnit" },
                    prevDefaultColor,
                    nextDefaultColor,
                    prevDefaultOpacity,
                    nextDefaultOpacity,
                    fraction;

                if (!(prevColorStop || prevOpacityStop || nextColorStop || nextOpacityStop)) {
                    return self.toColor(color.red, color.green, color.blue, opacity.value / 100);
                }

                if (value.color) {
                    //setting color and interpolating opacity
                    prevDefaultOpacity = nextOpacityStop ? nextOpacityStop.opacity : { value: 100, units: "percentUnit" };
                    nextDefaultOpacity = prevOpacityStop ? prevOpacityStop.opacity : { value: 100, units: "percentUnit" };

                    prevOpacityStop = prevOpacityStop || { opacity: prevDefaultOpacity, location: firstLoc };
                    nextOpacityStop = nextOpacityStop || { opacity: nextDefaultOpacity, location: lastLoc };

                    if (prevOpacityStop.loction === nextOpacityStop.location) {
                        opacity = prevOpacityStop.opacity;
                    } else {
                        fraction = (value.location - prevOpacityStop.location) / (nextOpacityStop.location - prevOpacityStop.location);
                        opacity = {
                            value: interpolateValue(fraction, prevOpacityStop.value, nextOpacityStop.value),
                            units: "percentUnit"
                        };
                    }

                } else if (value.opacity) {
                    //setting opacity and interpolating color
                    prevDefaultColor = nextColorStop ? nextColorStop.color : { red: 0, green: 255, blue: 0 };
                    nextDefaultColor = prevColorStop ? prevColorStop.color : { red: 0, green: 255, blue: 0 };

                    prevColorStop = prevColorStop || { color: prevDefaultColor, location: firstLoc };
                    nextColorStop = nextColorStop || { color: nextDefaultColor, location: lastLoc };

                    if (prevColorStop.location === nextColorStop.location) {
                        color = {
                            red: prevColorStop.color.red,
                            green: prevColorStop.color.green,
                            blue: prevColorStop.color.blue
                        };
                    } else {
                        fraction = (value.location - prevColorStop.location) / (nextColorStop.location - prevColorStop.location);
                        color = {
                            red: interpolateValue(fraction, prevColorStop.color.red, nextColorStop.color.red),
                            green: interpolateValue(fraction, prevColorStop.color.green, nextColorStop.color.green),
                            blue: interpolateValue(fraction, prevColorStop.color.blue, nextColorStop.color.blue)
                        };
                    }
                } else {
                    console.warn("Unknown value: " + JSON.stringify(value));
                }

                return self.toColor(color, opacity.value / 100);
            }

            var prevStopColor,
                nextStopColor,
                prevStopOpacity,
                nextStopOpacity,
                i,
                color,
                distance,
                firstLoc,
                lastLoc;

            stops.forEach(function (stp) {
                if (!isFinite(firstLoc) || stp.location < firstLoc) {
                    firstLoc = stp.location;
                }
                if (!isFinite(lastLoc) || stp.location > lastLoc) {
                    lastLoc = stp.location;
                }
            });

            for (i = 0; i < stops.length; i++) {

                distance = stops[i].location * 100 / length;

                prevStopColor = getNextStop("color", -1, stops[i].location);
                nextStopColor = getNextStop("color", 1, stops[i].location);

                prevStopOpacity = getNextStop("opacity", -1, stops[i].location);
                nextStopOpacity = getNextStop("opacity", 1, stops[i].location);

                if (stops[i].color) {
                    color = {
                        mode: "RGB",
                        value: {
                            r: stops[i].color.red,
                            g: stops[i].color.green,
                            b: stops[i].color.blue
                        }
                    };
                } else {
                    color = interpolateStop(prevStopColor, nextStopColor, prevStopOpacity, nextStopOpacity, stops[i], firstLoc, lastLoc);
                }

                _addOrEditStop(gradient.stops, { offset: distance, color: color }, !!stops[i].color);
            }
            gradient.stops.forEach(function (ele) {
                ele.offset /= 100;
            });
            stops = gradient.stops;
            if (reverse) {
                for (i = stops.length - 1; i >= 0; i--) {
                    stops[i].offset = Math.abs(stops[i].offset - 1);
                }
                stops.sort(function (a, b) {
                    return a.offset - b.offset;
                });
            }

            if (!reflected) {
                return gradient;
            }

            stops = gradient.stops;
            for (i = stops.length - 1; i >= 0; i--) {
                stops[i].offset = Math.abs(stops[i].offset - 1) * 0.5;
                gradient.stops.push({ offset: 1 - stops[i].offset, color: stops[i].color });
            }

            stops.sort(function (a, b) {
                return a.offset - b.offset;
            });
            return gradient;
        };
    }


    module.exports = new SVGOMGeneratorUtils();

}());

