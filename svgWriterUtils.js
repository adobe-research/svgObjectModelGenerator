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

/* Help write the SVG */

(function () {
    "use strict";

    var Utils = require("./utils.js"),
        Matrix = require("./matrix.js"),
        inch = 1 / 72,
        mm = inch * 25.4,
        cm = inch * 2.54,
        pica = inch * 6;

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

        self.rectToBounds = function (rect) {
            if (rect.left) {
                return rect;
            }
            return {
                left: rect.x,
                top: rect.y,
                right: rect.x + rect.width,
                bottom: rect.y + rect.height
            };
        };

        self.write = function (ctx, sOut) {
            if (!ctx.stream) {
                ctx.sOut += sOut;
                return;
            }
            ctx.stream.write(sOut);
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
        self.writeColor = function (val, ctx) {
            var color;
            val = val || "transparent";
            if (typeof val == "string") {
                color = val;
            }
            if (typeof val == "object") {
                if (val.ref && ctx && ctx.svgOM.resources && ctx.svgOM.resources.colors && ctx.svgOM.resources.colors[val.ref]) {
                    val = ctx.svgOM.resources.colors[val.ref];
                }
                if (!ctx) {
                    ctx = {
                        eq: function (v1, v2) {
                            return v1 == v2;
                        }
                    };
                }
                var rgb = val.value ? val.value : val;
                if (isFinite(val.alpha) && !ctx.eq(val.alpha, 1)) {
                    return "rgba(" + Utils.roundUp(rgb.r) + "," + Utils.roundUp(rgb.g) + "," + Utils.roundUp(rgb.b) + "," + Utils.round2(val.alpha) + ")";
                } else if (isFinite(val.a) && !ctx.eq(val.a, 1)) {
                    return "rgba(" + Utils.roundUp(rgb.r) + "," + Utils.roundUp(rgb.g) + "," + Utils.roundUp(rgb.b) + "," + Utils.round2(val.a) + ")";
                } else {
                    color = self.rgbToHex(rgb.r, rgb.g, rgb.b);
                }
            }
            if (colorNames[color.toLowerCase()]) {
                color = colorNames[color.toLowerCase()];
            } else {
                color = color.replace(/^#(.)\1(.)\2(.)\3$/, "#$1$2$3");
            }

            return color;
        };
        self.escapeCSS = function (className) {
            className += "";
            className = className.replace(/\s+/g, "-");
            var len = className.length,
                i = 0,
                isDash = className.charAt() == "-",
                out = "";
            for (; i < len; i++) {
                var code = className.charCodeAt(i),
                    char = className.charAt(i),
                    isNum = char == +char;
                if (code >= 1 && code <= 31 || code == 127 || !i && isNum || i == 1 && isDash && isNum) {
                    out += "\\" + code.toString(16) + " ";
                } else {
                    if (code > 127 || char == "-" || char == "_" || isNum || /[a-z]/i.test(char)) {
                        out += char;
                    } else {
                        out += "\\" + char;
                    }
                }
            }
            return self.encodedText(out);
        };

        self.getTransform = function (val, tX, tY, precision, keepTranslation) {
            if (!val) {
                // So far paths, masks and clipPaths are the only consumers of getTransform with keepTranslation.
                // Elsewhere we are able to bake in tX and tY otherwise.
                if (keepTranslation && (tX || tY)) {
                    return !tY ? "translate(" + Utils.roundP(tX, precision) + ")" :
                        "translate(" + Utils.roundP(tX || 0, precision) + " " + Utils.roundP(tY || 0, precision) + ")";
                }
                return "";
            }
            return Matrix.writeTransform(
                val,
                isFinite(tX) ? tX : 0,
                isFinite(tY) ? tY : 0,
                precision);
        };

        self.round2 = Utils.round2;
        self.round1k = Utils.round1k;
        self.round10k = Utils.round10k;
        self.roundUp = Utils.roundUp;
        self.roundDown = Utils.roundDown;

        self.toDocumentUnits = function (ctx, length) {
            if (!ctx.config || !ctx.config.documentUnits) {
                return length;
            }
            switch (ctx.config.documentUnits) {
                case "mm":
                    length *= mm;
                    break;
                case "cm":
                    length *= cm;
                    break;
                case "in":
                    length *= inch;
                    break;
                case "pc":
                    length *= pica;
                    break;
                default:
                    return length;
            }
            return length + ctx.config.documentUnits;
        };

        self.toString = function (ctx) {
            return ctx.sOut;
        };

        self.encodedText = function (txt) {
            return txt.replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&apos;")
                      // XML char: #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
                      .replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g, "");
        };

        self.extend = Utils.extend;

        self.hasFx = function (ctx) {
            return ctx.currentOMNode.style && ctx.currentOMNode.style.filters;
        };
    }

    module.exports = new SVGWriterUtils();

}());
