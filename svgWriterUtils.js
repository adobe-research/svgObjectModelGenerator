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
        self.shiftBoundsX = function (bounds, delta) {
            bounds.left += delta;
            bounds.right += delta;
        };
        
        self.shiftBoundsY = function (bounds, delta) {
            bounds.top += delta;
            bounds.bottom += delta;
        };

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
            sOut = sOut == null ? "" : sOut;
            self.write(ctx, sOut + ctx.terminator);
        };

        self.indent = function (ctx) {
            ctx.currentIndent += ctx.indent;
        };

        self.undent = function (ctx) {
            ctx.currentIndent = ctx.currentIndent.substr(0, ctx.currentIndent.length - ctx.indent.length);
        };

        self.componentToHex = function (c) {
            var rnd = Math.round(c),
                hex = rnd.toString(16);
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

        self.getTransform = function (val, tX, tY) {
            if (!val) {
                return "";
            }
            return Matrix.writeTransform(Matrix.createMatrix(val), tX, tY);
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

        self.encodedText = function (txt) {
            return txt.replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;')
                      .replace(/"/g, '&quot;')
                      .replace(/'/g, '&apos;');
        }

        self.extend = Utils.extend;
        self.toBase64 = Utils.toBase64;

        self.PSFx = function (omIn) {
            return omIn && omIn.style && omIn.style.meta && omIn.style.meta.PS && omIn.style.meta.PS.fx;
        }

        self.hasFx = function (ctx) {
            // FIXME: Inner and outer glow are missing.
            return self.PSFx(ctx.currentOMNode) && ((self.hasEffect(ctx, 'dropShadow') ||
                    self.hasEffect(ctx, 'gradientFill', self.hasColorNoise) ||
                    self.hasEffect(ctx, 'solidFill') ||
                    self.hasEffect(ctx, 'chromeFX') ||
                    self.hasEffect(ctx, 'innerShadow')));
        };
        self.hasColorNoise = function (ele) {
            return ele.gradient.gradientForm !== 'colorNoise';
        };
        self.hasEffect = function (ctx, effect, custom) {
            var omIn = ctx.currentOMNode;
            effect += 'Multi';
            if (omIn.style.meta.PS.fx[effect]) {
                return omIn.style.meta.PS.fx[effect].some(function(ele) {
                    if (custom) {
                        return ele.enabled && custom(ele);
                    }
                    return ele.enabled;
                });
            }
            return false;
        };

    }

    module.exports = new SVGWriterUtils();
    
}());
