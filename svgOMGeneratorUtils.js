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

/* Help construct the svgOM from generator data */

(function () {
"use strict";
    
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
                red = Math.abs(Math.round(255.0 * c.redFloat));
                green = Math.abs(Math.round(255.0 * c.greenFloat));
                blue = Math.abs(Math.round(255.0 * c.blueFloat));
            }
            return { "r": red || 0, "g": green || 0, "b": blue || 0, "a": a };
        };
        
        this.pct2px = function(dim, containerPx) {
            return Math.round(containerPx * dim / 100.0);
        };
        
        this.pt2px = function(dim, dpi) {
            return Math.round(dpi * (dim / 72.0));
        };
        
        this.in2px = function(dim, dpi) {
            return dim * dpi;
        };
      
        this.mm2in = function(dim) {
            return dim * 0.0393700787;
        };
        
        this.mm2px = function(dim, dpi) {
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
        
        function _addOrEditStop(stops, def, colorDefined) {
            var foundStop;
            stops.forEach(function (stp) {
                if (stp.position === def.position) {
                    foundStop = stp;
                }
            });
            
            if (foundStop) {
                
                if (colorDefined) {
                    foundStop.color.r = def.color.r;
                    foundStop.color.g = def.color.g;
                    foundStop.color.b = def.color.b;
                } else {
                    foundStop.color.a = def.color.a;
                }
            } else {
                stops.push(def);
            }
        }
        
        this.toGradient = function (gradientRaw) {
            var gradient,
                self = this;
            if (!gradientRaw || !gradientRaw.gradient ||
                gradientRaw.gradient.gradientForm === 'colorNoise' ||
                (gradientRaw.type !== 'linear' &&
                 gradientRaw.type !== 'radial' &&
                 gradientRaw.type !== 'reflected')) {
                return (gradientRaw) ? gradientRaw.gradient : null;
            }
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
                
                return undefined;
            }

            function interpolateValue(fraction, beginValue, endValue) {
                return fraction * (endValue - beginValue) + beginValue;
            }

            function interpolateStop(prevColorStop, nextColorStop, prevOpacityStop, nextOpacityStop, value, firstLoc, lastLoc) {
                
                var color = value.color ? value.color : { red: 0, green: 0, blue: 0 },
                    opacity = value.opacity ? value.opacity : { value: 100, units: 'percentUnit' },
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
                    prevDefaultOpacity = (nextOpacityStop) ? nextOpacityStop.opacity : { value: 100, units: 'percentUnit' } ;
                    nextDefaultOpacity = (prevOpacityStop) ? prevOpacityStop.opacity : { value: 100, units: 'percentUnit' };
                    
                    prevOpacityStop = prevOpacityStop || { opacity: prevDefaultOpacity, location: firstLoc };
                    nextOpacityStop = nextOpacityStop || { opacity: nextDefaultOpacity, location: lastLoc };
                    
                    if (prevOpacityStop.loction === nextOpacityStop.location) {
                        opacity = prevOpacityStop.opacity;
                    } else {
                        fraction = (value.location - prevOpacityStop.location) / (nextOpacityStop.location - prevOpacityStop.location);
                        opacity = { value: interpolateValue(fraction, prevOpacityStop.value, nextOpacityStop.value), units: 'percentUnit' };
                    }
                    
                } else if (value.opacity) {
                    //setting opacity and interpolating color
                    prevDefaultColor = (nextColorStop) ? nextColorStop.color : { red: 0, green: 255, blue: 0 };
                    nextDefaultColor = (prevColorStop) ? prevColorStop.color : { red: 0, green: 255, blue: 0 };
                    
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
                    
                return self.toColor(color, (opacity.value / 100.0));
            }

            var prevStopColor,
                nextStopColor,
                prevStopOpacity,
                nextStopOpacity,
                i,
                color,
                opacity,
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

                distance = (stops[i].location * 100 / length);
                
                prevStopColor = getNextStop("color", -1, stops[i].location);
                nextStopColor = getNextStop("color", 1, stops[i].location);
                
                prevStopOpacity = getNextStop("opacity", -1, stops[i].location);
                nextStopOpacity = getNextStop("opacity", 1, stops[i].location);
                
                if (stops[i].color) {
                    color = {
                        r: stops[i].color.red,
                        g: stops[i].color.green,
                        b: stops[i].color.blue
                    };
                } else {
                    color = interpolateStop(prevStopColor, nextStopColor, prevStopOpacity, nextStopOpacity, stops[i], firstLoc, lastLoc);
                }
                
                _addOrEditStop(gradient.stops, { position: distance, color: color }, !!stops[i].color);
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
            for (i = stops.length - 1; i >= 0; i--) {
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
     
