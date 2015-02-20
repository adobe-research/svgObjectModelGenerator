// Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
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
/*global define: true, require: true, module: true */

/* Help write the SVG */

(function () {
"use strict";

    var Buffer = require('buffer').Buffer,
        guidID = 1,
        svgWriterIDs = require("./svgWriterIDs.js"),
        Utils = require("./utils.js"),
        Matrix = require("./matrix.js");

	function SVGWriterUtils() {
        
        var self = this;
        
        self.omguid = function (om) {
            if (!om._guid) {
                om._guid = "guid" + guidID++;
            }
            return om._guid;
        };
        
        self.write = function (ctx, sOut) {
            ctx.sOut += sOut;
        };
        
        self.writeln = function (ctx, sOut) {
            self.write(ctx, sOut + ctx.terminator);
        };
    
        self.indent = function (ctx) {
            ctx.currentIndent += ctx.indent;
        };
    
        self.undent = function (ctx) {
            ctx.currentIndent = ctx.currentIndent.substr(0, ctx.currentIndent.length - ctx.indent.length);
        };
    
        self.writeLength = function (val) {
            var length = Math.round(val);
            return length ? length + "px" : "0";
        };

        self.componentToHex = function (c) {
            var rnd = Math.round(c),
                hex = Number(rnd).toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        };

        self.rgbToHex = function (r, g, b) {
            return "#" + self.componentToHex(r) + self.componentToHex(g) + self.componentToHex(b);
        };

        self.px = Utils.px;
    
        var colorNames = {
            "#fa8072": "salmon",
            "#ff0000": "red",
            "#ffc0cb": "pink",
            "#ff7f50": "coral",
            "#ff6347": "tomato",
            "#ffa500": "orange",
            "#ffd700": "gold",
            "#f0e68c": "khaki",
            "#dda0dd": "plum",
            "#ee82ee": "violet",
            "#da70d6": "orchid",
            "#800080": "purple",
            "#4b0082": "indigo",
            "#00ff00": "lime",
            "#008000": "green",
            "#808000": "olive",
            "#008080": "teal",
            "#00ffff": "aqua",
            "#0000ff": "blue",
            "#000080": "navy",
            "#ffe4c4": "bisque",
            "#f5deb3": "wheat",
            "#d2b48c": "tan",
            "#cd853f": "peru",
            "#a0522d": "sienna",
            "#a52a2a": "brown",
            "#800000": "maroon",
            "#fffafa": "snow",
            "#f0ffff": "azure",
            "#f5f5dc": "beige",
            "#fffff0": "ivory",
            "#faf0e6": "linen",
            "#c0c0c0": "silver",
            "#808080": "gray"
        };
        self.writeColor = function (val) {
            var color;
            val = val || "transparent";
            if (typeof val == "string") {
                color = val;
            } else {
                color = self.rgbToHex(val.r, val.g, val.b);
            }
            if (colorNames[color]) {
                color = colorNames[color];
            } else {
                color = color.replace(/^#(.)\1(.)\2(.)\3$/, "#$1$2$3");
            }

            return color;
        };

        self.writeAttrIfNecessary = function (ctx, attr, val, def, unit) {
            unit = unit || "";
            if (String(val) !== String(def)) {
                self.write(ctx, " " + attr + '="' + val + unit + '"');
            }
        };

        self.writeTransformIfNecessary = function (ctx, attr, val, tX, tY) {
            if (val) {
                var matrix4x4 = Matrix.createMatrix(val);
                self.write(ctx, ' ' + attr + '="' + Matrix.writeTransform(matrix4x4, tX, tY) + '"');
            }
        };

        self.getTranform = function (val, tX, tY) {
            if (!val) {
                return "";
            }
            var matrix4x4 = Matrix.createMatrix(val);
            return Matrix.writeTransform(matrix4x4, tX, tY);
        };

        var gradientStops = {};
        self.gradientStopsReset = function () {
            gradientStops = {};
        };
        self.writeLinearGradientInternal = function (ctx, stops, gradientID, scale, coords) {
            var iStop,
                stp,
                stpOpacity,
                position,
                link;
            if (stops) {
                var x1 = self.round1k(coords.xa + coords.cx),
                    y1 = self.round1k(coords.ya + coords.cy),
                    x2 = self.round1k(coords.cx - coords.xa),
                    y2 = self.round1k(coords.cy - coords.ya),
                    lines = [];
                self.write(ctx, ctx.currentIndent + '<linearGradient id="' + gradientID + '"');
                for (iStop = 0; iStop < stops.length; iStop++) {
                    stp = stops[iStop];
                    stpOpacity = '';
                    position = self.round1k((Math.round(stp.position) / 100 - 0.5) * scale + 0.5);

                    if (isFinite(stp.color.a) && stp.color.a != 1) {
                        stpOpacity = ' stop-opacity="' + self.round2(stp.color.a) + '"';
                    }
                    lines.push('<stop offset="' + position + '" stop-color="' + self.writeColor(stp.color) + '"' + stpOpacity + '/>');
                }
                link = gradientStops[lines];
                if (link) {
                    (x1 != link.x1) && self.write(ctx, ' x1="' + x1 + '"');
                    (y1 != link.y1) && self.write(ctx, ' y1="' + y1 + '"');
                    (x2 != link.x2) && self.write(ctx, ' x2="' + x2 + '"');
                    (y2 != link.y2) && self.write(ctx, ' y2="' + y2 + '"');
                    self.writeln(ctx, ' xlink:href="#' + link.id + '"/>');
                } else {
                    gradientStops[lines] = {
                        id: gradientID,
                        x1: x1,
                        y1: y1,
                        x2: x2,
                        y2: y2
                    };
                    self.write(ctx, ' gradientUnits="userSpaceOnUse"');
                    self.write(ctx, ' x1="' + x1 + '" y1="' + y1 + '"');
                    self.writeln(ctx, ' x2="' + x2 + '" y2="' + y2 + '">');
                    self.indent(ctx);
                    for (iStop = 0; iStop < lines.length; iStop++) {
                        if (!iStop || lines[iStop] != lines[iStop - 1]) {
                            self.writeln(ctx, ctx.currentIndent + lines[iStop]);
                        }
                    }
                    self.undent(ctx);
                    self.writeln(ctx, ctx.currentIndent + "</linearGradient>");
                }
            } else {
                console.warn("encountered gradient with no stops");
            }
        };

        var computeLinearGradientCoordinates = function (gradient, bounds) {
            //TBD: generate a real ID
            var w2 = (bounds.right - bounds.left) / 2,
                h2 = (bounds.bottom - bounds.top) / 2,
                scale = gradient.scale,
                coords;

            // SVG wants the angle in cartesian, not polar, coordinates. 
            var angle = (gradient.angle % 360) * Math.PI / 180.0,
                x1, x2, y1, y2, xa, ya,
                cx = self.round1k(bounds.left + w2),
                cy = self.round1k(bounds.top + h2);

            if (Math.abs(w2 / Math.cos(angle) * Math.sin(angle)) < h2) {
                
                if (h2 > w2) {
                    xa = w2 / Math.cos(angle) * Math.sin(angle);
                    ya = w2;
                } else {
                    xa = w2;
                    ya = w2 / Math.cos(angle) * Math.sin(angle);
                }
            } else {
                xa = h2 / Math.sin(angle) * Math.cos(angle);
                ya = h2;
            }

            // FIXME: self is a hack to deal with a mistake above that still needs
            // to be fixed.
            if (angle < 0 || gradient.angle == 180 ) {
                ya = -ya;
            } else {
                xa = -xa;
            }

            // FIXME: We should be able to optimize the cases of angle mod 90 to use %
            // and possibly switch to objectBoundingBox.
            // FIXME : We could optimize cases where x1 == x2 or y1 == y2 to reduce
            // generated content.

            return { xa: xa, ya: ya, cx: cx, cy: cy };
        };

        self.writeGradientOverlay = function (ctx, gradient, rootBounds, gradientID) {

            var omIn = ctx.currentOMNode,
                layerBounds = omIn.shapeBounds,
                bounds,
                coords,
                scale = gradient.scale,
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
                cx = self.round1k(bounds.left + w2);
                cy = self.round1k(bounds.top + h2);
                angle = Math.abs(gradient.angle - 90 % 180) * Math.PI / 180;
                hl = Math.abs(h2 / Math.cos(angle));
                hw = Math.abs(w2 / Math.sin(angle));
                r = self.round1k(hw < hl ? hw : hl);
                
                self.writeRadialGradientInternal(ctx, cx, cy, r, gradientID, stops, gradient.scale);
            } else {
                coords = computeLinearGradientCoordinates(gradient, bounds);
                self.writeLinearGradientInternal(ctx, stops, gradientID, scale, coords);
            }
            return gradientID;
        };

        self.writeLinearGradient = function (ctx, gradient, flavor) {
            
            //TBD: generate a real ID
            
            var omIn = ctx.currentOMNode,
                gradientID = svgWriterIDs.getUnique("linear-gradient"),
                bounds = gradient.gradientSpace === "objectBoundingBox" ? omIn.shapeBounds : ctx.viewBox,
                coords = computeLinearGradientCoordinates(gradient, bounds),
                scale = gradient.scale,
                stops = gradient.stops;

            self.ctxCapture(ctx, function () {
                self.writeLinearGradientInternal(ctx, stops, gradientID, scale, coords);
            }.bind(self),
            function (out) {
                ctx.omStylesheet.define("linear-gradient" + flavor, omIn.id, gradientID, out, JSON.stringify({ coords: coords, stops: stops, scale: scale }));
            });
            gradientID = ctx.omStylesheet.getDefine(omIn.id, "linear-gradient" + flavor).defnId;
            return gradientID;
        };

        self.writeRadialGradientInternal = function (ctx, cx, cy, r, gradientID, stops, scale) {
            var iStop,
                stp,
                stpOpacity,
                lines = [],
                link;

            self.write(ctx, ctx.currentIndent + '<radialGradient id="' + gradientID + '"');

            for (iStop = 0; iStop < stops.length; iStop++) {
                stp = stops[iStop];
                stpOpacity = '';

                if (isFinite(stp.color.a) && stp.color.a != 1) {
                    stpOpacity = ' stop-opacity="' + Math.round(stp.color.a) + '"';
                }

                lines.push('<stop offset="' + self.round1k(Math.round(stp.position) / 100 * scale) + '" stop-color="' + self.writeColor(stp.color) + '"' + stpOpacity + '/>');
            }
            link = gradientStops[lines];
            if (link) {
                (link.cx != cx) && self.writeAttrIfNecessary(ctx, "cx", cx, "", "");
                (link.cy != cy) && self.writeAttrIfNecessary(ctx, "cy", cy, "", "");
                (link.r != r) && self.writeAttrIfNecessary(ctx, "r", r, "", "");
                self.writeln(ctx, ' xlink:href="#' + link.id + '"/>');
            } else {
                gradientStops[lines] = {
                    id: gradientID,
                    cx: cx,
                    cy: cy,
                    r: r
                };
                self.write(ctx, ' gradientUnits="userSpaceOnUse"');
                self.writeAttrIfNecessary(ctx, "cx", cx, "", "");
                self.writeAttrIfNecessary(ctx, "cy", cy, "", "");
                self.writeAttrIfNecessary(ctx, "r", r, "", "");
                self.writeln(ctx, ">");
                self.indent(ctx);
                for (iStop = 0; iStop < lines.length; iStop++) {
                    if (!iStop || lines[iStop] != lines[iStop - 1]) {
                        self.writeln(ctx, ctx.currentIndent + lines[iStop]);
                    }
                }
                self.undent(ctx);
                self.writeln(ctx, ctx.currentIndent + "</radialGradient>");
            }
        };
        
        self.writeRadialGradient = function (ctx, gradient, flavor) {
            //TBD: generate a real ID
            var omIn = ctx.currentOMNode,
                gradientID = svgWriterIDs.getUnique("radial-gradient"),
                scale = gradient.scale,
                stops = gradient.stops,
                gradientSpace = gradient.gradientSpace,
                bounds = gradientSpace === "objectBoundingBox" ? omIn.shapeBounds : ctx.viewBox,
                w2 = (bounds.right - bounds.left) / 2,
                h2 = (bounds.bottom - bounds.top) / 2,
                cx = self.round1k(bounds.left + w2),
                cy = self.round1k(bounds.top + h2),
                angle = Math.abs(gradient.angle - 90 % 180) * Math.PI / 180,
                hl,
                hw,
                r;

            // PS has a weird behavior for values exceeding (-180,180) up to (-360,360).
            // It seems to scale the gradient between these values. After that it does
            // modulo again. A bug?
            hl = Math.abs(h2 / Math.cos(angle));
            hw = Math.abs(w2 / Math.sin(angle));
            r = self.round1k(hw < hl ? hw : hl);

            self.ctxCapture(ctx, function () {
                self.writeRadialGradientInternal(ctx, cx, cy, r, gradientID, stops, scale);
            }.bind(self),
            function (out) {
                ctx.omStylesheet.define("radial-gradient" + flavor, omIn.id, gradientID, out, JSON.stringify({ cx: cx, cy: cy, r: r, stops: stops, scale: scale, gradientSpace: gradientSpace }));
            });
            gradientID = ctx.omStylesheet.getDefine(omIn.id, "radial-gradient" + flavor).defnId;
            return gradientID;
        };

        self.writeTextPath = function (ctx, pathData) {
            
            //TBD: generate a real ID
            var omIn = ctx.currentOMNode,
                textPathID = svgWriterIDs.getUnique("text-path");
            
            self.ctxCapture(ctx, function () {
                var iStop,
                    stp;
                
                self.write(ctx, ctx.currentIndent + "<path id=\"" + textPathID + "\" ");
                self.writeln(ctx, "d=\"" + Utils.optimisePath(pathData) + "\"/>");
            },
            function (out) {
                ctx.omStylesheet.define("text-path", omIn.id, textPathID, out, JSON.stringify({ pathData: pathData }));
            });
            return textPathID;
        };

        // Filter Effects
        self.writeFilterConnection = function (ctx, connection) {
            if (!connection) {
                return;
            }
            if (connection.in1) {
                self.write(ctx, ' in="' + connection.in1 + '"');
            }
            if (connection.in2) {
                self.write(ctx, ' in2="' + connection.in2 + '"');
            }
            if (connection.result) {
                self.write(ctx, ' result="' + connection.result + '"');
            }
        }

        self.writeFeFlood = function (ctx, color, opacity, connection) {
            self.write(ctx, ctx.currentIndent + '<feFlood');
            self.writeAttrIfNecessary(ctx, 'flood-color', self.writeColor(color), '#000', '');
            if (opacity !== undefined && opacity !== null) {
                self.writeAttrIfNecessary(ctx, 'flood-opacity', opacity, 1, '');
            }
            self.writeFilterConnection(ctx, connection);
            self.writeln(ctx, '/>');
        }

        self.writeFeBlend = function (ctx, mode, connection) {
            self.write(ctx, ctx.currentIndent + '<feBlend');
            if (mode) {
                self.writeAttrIfNecessary(ctx, 'mode', mode, 'normal', '');
            }
            self.writeFilterConnection(ctx, connection);
            self.writeln(ctx, '/>');
        }

        self.writeFeComposite = function (ctx, operator, connection) {
            self.write(ctx, ctx.currentIndent + '<feComposite');
            if (operator) {
                self.writeAttrIfNecessary(ctx, 'operator', operator, 'over', '');
            }
            self.writeFilterConnection(ctx, connection);
            self.writeln(ctx, '/>');
        }

        self.writeFeGauss = function (ctx, blur, connection) {
            self.write(ctx, ctx.currentIndent + '<feGaussianBlur');
            self.writeAttrIfNecessary(ctx, 'stdDeviation', self.round1k(blur), 0, '');
            self.writeFilterConnection(ctx, connection);
            self.writeln(ctx, '/>');
        }

        self.writeFeOffset = function (ctx, offset, connection) {
            self.write(ctx, ctx.currentIndent + '<feOffset');
            self.writeAttrIfNecessary(ctx, 'dx', self.round1k(offset.x), 0, '');
            self.writeAttrIfNecessary(ctx, 'dy', self.round1k(offset.y), 0, '');
            self.writeFilterConnection(ctx, connection);
            self.writeln(ctx, '/>');
        }

        // For convenience.
        self.writeFeInvert = function (ctx) {
            self.writeln(ctx, ctx.currentIndent + '<feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"/>');
        }

        self.writeFeLuminance = function (ctx) {
            self.writeln(ctx, ctx.currentIndent + '<feColorMatrix type="matrix" values="0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 0"/>');
        }
        
        self.round2 = Utils.round2;
        self.round1k = Utils.round1k;
        self.round10k = Utils.round10k;
        self.roundUp = Utils.roundUp;
        self.roundDown = Utils.roundDown;
        
        self.ifStylesheetDoesNotHaveStyle = function (ctx, node, property, fn) {
            var hasStyle = false,
                styleBlock;
            if (ctx.omStylesheet.hasStyleBlock(node)) {
                styleBlock = ctx.omStylesheet.getStyleBlock(node);
                if (styleBlock.hasProperty(property)) {
                    hasStyle = true;
                }
            }
            if (!hasStyle) {
                fn();
            }
        };
        
        self.ctxCapture = function (ctx, fnCapture, fnResult) {
            var origBuffer = ctx.sOut,
                resultBuffer;
            ctx.sOut = "";
            fnCapture();
            resultBuffer = ctx.sOut;
            ctx.sOut = origBuffer;
            fnResult(resultBuffer);
        };
        
        self.indentify = function (indent, buf) {
            var out = indent + buf.replace(/(\n)/g, "\n" + indent);
            return out.substr(0, out.length - indent.length);
        };
        
        self.toString = function (ctx) {
            return ctx.sOut;
        };

        var defaults = {
            fill: "#000",
            stroke: "none",
            "stroke-width": 1,
            "stroke-linecap": "butt",
            "stroke-linejoin": "miter",
            "stroke-miterlimit": 4,
            "stroke-dasharray": "none",
            "stroke-dashoffset": 0,
            "stroke-opacity": 1,
            opacity: 1,
            "fill-rule": "nonzero",
            "fill-opacity": 1,
            display: "inline",
            visibility: "visible"
        };

        self.writeClassIfNeccessary = function (ctx, node) {
            node = node || ctx.currentOMNode;
            if (ctx.omStylesheet.hasStyleBlock(node)) {
                var omStyleBlock = ctx.omStylesheet.getStyleBlockForElement(node);
                if (omStyleBlock) {
                    if (ctx.usePresentationAttribute) {
                        for (var i = 0, len = omStyleBlock.rules.length; i < len; i++) {
                            var rule = omStyleBlock.rules[i];
                            self.writeAttrIfNecessary(ctx, rule.propertyName, String(rule.value).replace(/"/g, "'"), defaults[rule.propertyName] || "");
                        }
                    } else {
                        self.write(ctx, " class=\"" + omStyleBlock.class + "\"");
                    }
                }
            }
        }

        self.writePositionIfNecessary = function (ctx, position, overrideExpect) {
            var yUnit,
                xUnit,
                x,
                y;

            if (position) {
                overrideExpect = (overrideExpect !== undefined) ? overrideExpect : 0;
                if (isFinite(position.x)) {
                    if (position.unitX === "px") {
                        x = Math.round(position.x);
                    } else if (position.unitX === "em") {
                        x = self.round1k(position.x);
                    } else {
                        position.unitX = "%";
                        x = Math.round(position.x);
                    }
                    self.writeAttrIfNecessary(ctx, "x", x, overrideExpect, position.unitX);
                }

                if (isFinite(position.y)) {
                    if (position.unitY === "px") {
                        y = Math.round(position.y);
                    } else if (position.unitY === "em") {
                        y = self.round1k(position.y);
                    } else {
                        position.unitY = "%";
                        y = Math.round(position.y);
                    }
                    self.writeAttrIfNecessary(ctx, "y", y, overrideExpect, position.unitY);
                }
            }
        }

        self.encodedText = function (txt) {
            return txt.replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;')
                      .replace(/'/g, '&apos;');
        }

        self.extend = Utils.extend;
        self.toBase64 = Utils.toBase64;
	}

	module.exports = new SVGWriterUtils();
    
}());

