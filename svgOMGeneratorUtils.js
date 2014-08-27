/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, bitwise: true */
/*global define: true, require: true */

/* Help construct the svgOM from generator data */

(function () {
"use strict";
    
    function SVGOMGeneratorUtils() {
        
        this.toColor = function (c, a) {
            if (c && isFinite(c.red) && isFinite(c.green) && isFinite(c.blue)) {
                return { "r": c.red, "g": c.green, "b": c.blue, "a": (a) ? a : 1 };
            } else if (c && isFinite(c.redFloat) && isFinite(c.greenFloat) && isFinite(c.blueFloat)) {
                return { "r": Math.abs(Math.round(255.0 * c.redFloat)), "g": Math.abs(Math.round(255.0 * c.greenFloat)), "b": Math.abs(Math.round(255.0 * c.blueFloat)), "a": (a) ? a : 1 };
            } else {
                return { r: 0, g: 0, b: 0, a: 0};
            }   
        };
        
        this.toGradient = function (gradientRaw) {
            var gradient,
                self = this;
            if (!gradientRaw || !gradientRaw.gradient ||
                (gradientRaw.type !== 'linear' &&
                 gradientRaw.type !== 'radial' &&
                 gradientRaw.type !== 'reflected'))
                return gradient;

            // CSS uses clock orientation, PSDs use trig orientation
            // both point an arrow in direction gradient extends.
            var angle = 0;
            if (gradientRaw.angle) {
                angle += gradientRaw.angle.value;
            }
            var gradientSpace = (gradientRaw.align === undefined || gradientRaw.align) ?
                "objectBoundingBox" : "userSpaceOnUse";

            gradient = this.toColorStops(gradientRaw);
            gradient.type = gradientRaw.type === "radial" ? "radial" : "linear";
            gradient.angle = angle;
            gradient.gradientSpace = gradientSpace;

            return gradient;
        };

        this.toColorStops = function (gradientRaw) {
            var gradient = { stops: [], scale: 1 };

            var stops = [].concat(gradientRaw.gradient.colors, gradientRaw.gradient.transparency),
                length = gradientRaw.gradient.interfaceIconFrameDimmed,
                reflected = gradientRaw.type && gradientRaw.type === "reflected",
                reverse = gradientRaw.reverse,
                self = this;

            gradient.scale = gradientRaw.scale ? (gradientRaw.scale.value / 100) : 1;

            stops.sort(function (a, b) {
                return a.location - b.location;
            });

            function getNextStop(stopType, direction, start) {
                for (; start > 0 && start < stops.length; start += direction) {
                    if (stops[start][stopType])
                        return stops[start];
                }
                return undefined;
            }

            function interpolateValue(fraction, beginValue, endValue) {
                return fraction * (endValue - beginValue) + beginValue;
            }

            function interpolateStop(previous, next, value) {
                var color = value.color ? value.color : { red: 0, green: 0, blue: 0 };
                var opacity = value.opacity ? value.opacity : { value: 100, units: 'percentUnit' };
                var fraction;

                if (!(previous || next))
                    return self.toColor(color.red, color.green, color.blue, opacity.value / 100);

                if (!next) {
                    color = value.color ? color : stops[previous].color;
                    opacity = value.opacity ? opacity : stops[previous.opacity];
                } else if (!previous) {
                    color = value.color ? color : stops[next].color;
                    
                    opacity = (value && value.opacity) ? opacity : (stops[next]) ? stops[next].opacity : 1.0;
                } else {
                    fraction = (value.location - previous.location) / (next.location - previous.location);
                    if (value.color) {
                        // Interpolate opacity.
                        opacity = { value: interpolateValue(fraction, previous.value, next.value), units: 'percentUnit' };
                    } else {
                        // Interpolate color.
                        color = {
                            red: interpolateValue(fraction, previous.red, next.red),
                            green: interpolateValue(fraction, previous.green, next.green),
                            blue: interpolateValue(fraction, previous.blue, next.blue)
                        };
                    }
                }

                return self.toColor(color, (opacity.value / 100));
            }

            var prevStop,
                nextStop,
                i,
                color,
                opacity,
                distance;

            for (var i = 0; i < stops.length; i++) {

                distance = (stops[i].location * 100 / length);

                if (i + 1 < stops.length && stops[i + 1].type != stops[i].type) {

                    if (stops[i].color) {
                        color = stops[i].color;
                        opacity = stops[i + 1].opacity;
                    } else {
                        color = stops[i + 1].color;
                        distance = (stops[i + 1].location * 100 / length);
                        opacity = stops[i].opacity;
                    }
                    
                    gradient.stops.push({ position: distance, color: this.toColor(color, (opacity.value / 100))});
                    i++;
                } else {

                    prevStop = getNextStop(stops[i].color ? "opacity" : "color", -1, i);
                    nextStop = getNextStop(stops[i].color ? "opacity" : "color", 1, i);

                    gradient.stops.push({ position: distance, color: interpolateStop(prevStop, nextStop, stops[i]) });
                }
            }
            var stops = gradient.stops;
            if (reverse) {
                for (var i = stops.length - 1; i >= 0; i--) {
                    stops[i].position = Math.abs(stops[i].position - 100);
                }
                stops.sort(function (a, b) {
                    return a.position - b.position;
                });
            }

            if (!reflected) {
                return gradient;
            }

            var stops = gradient.stops;
            for (var i = stops.length - 1; i >= 0; i--) {
                stops[i].position = Math.abs(stops[i].position - 100) * 0.5;
                gradient.stops.push({ position: 100 - stops[i].position, color: stops[i].color });
            }

            stops.sort(function (a, b) {
                return a.position - b.position;
            });
            return gradient;
        };
    }


    module.exports = new SVGOMGeneratorUtils();
    
}());
     
    