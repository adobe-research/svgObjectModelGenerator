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
/*global define: true, require: true, module: true */

/* Help write the SVG */

(function () {
"use strict";

    var Buffer = require('buffer').Buffer,
        guidID = 1,
        svgWriterIDs = require("./svgWriterIDs.js");

	function Utils() {
        
        var self = this;
        
        self.px = function (ctx, length) {
            if (typeof length === "number")
                return length;
            // Consider adding string conversion when needed.
            if (typeof length !== "object" || !length.units)
                return 0;
            switch (length.units) {
                case "pointsUnit":
                    return self.round1k(length.value * ctx.pxToInchRatio / 72);
                case "millimetersUnit":
                    return self.round1k(length.value * ctx.pxToInchRatio / 25.4);
                case "rulerCm":
                    return self.round1k(length.value * ctx.pxToInchRatio / 2.54);
                case "rulerInches":
                    return self.round1k(length.value * ctx.pxToInchRatio);
                case "rulerPicas":
                    return self.round1k(length.value * ctx.pxToInchRatio / 6);
            }
            return 0;
        };
        
        self.round2 = function (x) {
            return +(+x).toFixed(2);
        };
        self.round1k = function (x) {
            return +(+x).toFixed(3);
        };
        self.round10k = function (x) {
            return +(+x).toFixed(4);
        };
        self.roundUp = function (x) {
            return Math.ceil(x);
        };
        self.roundDown = function (x) {
            return Math.round(x);
        };
        
        /** jQuery-style extend
         *  https://github.com/jquery/jquery/blob/master/src/core.js
         */
        var class2type = {
              "[object Boolean]": "boolean",
              "[object Number]": "number",
              "[object String]": "string",
              "[object Function]": "function",
              "[object Array]": "array",
              "[object Date]": "date",
              "[object RegExp]": "regexp",
              "[object Object]": "object"
            },
            jQueryLike = {
                isFunction: function (obj) {
                    return jQueryLike.type(obj) === "function";
                },
                isArray: Array.isArray,
                type: function (obj) {
                    return obj == null ? String(obj) : class2type[String(obj)] || "object";
                },
                isPlainObject: function (obj) {
                    if (!obj || jQueryLike.type(obj) !== "object" || obj.nodeType) {
                        return false;
                    }
                    try {
                        if (obj.constructor && !obj.hasOwnProperty("constructor") && !obj.constructor.prototype.hasOwnProperty("isPrototypeOf")) {
                            return false;
                        }
                    } catch (e) {
                        return false;
                    }
                var key;
                for (key in obj) {}
                    return key === undefined || obj.hasOwnProperty(key);
                }
            };
        
        self.extend = function (deep, target, source) {
            var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false,
                toString = Object.prototype.toString,
                hasOwn = Object.prototype.hasOwnProperty,
                push = Array.prototype.push,
                slice = Array.prototype.slice,
                trim = String.prototype.trim,
                indexOf = Array.prototype.indexOf;
            
            if (typeof target === "boolean") {
                deep = target;
                target = arguments[1] || {};
                i = 2;
            }
            if (typeof target !== "object" && !jQueryLike.isFunction(target)) {
                target = {};
            }
            
            for (i; i < length; i++) {
                if ((options = arguments[i]) != null) {
                    for (name in options) {
                        src = target[name];
                        copy = options[name];
                        if (target === copy) {
                            continue;
                        }
                        
                        if (deep && copy && (jQueryLike.isPlainObject(copy) || (copyIsArray = jQueryLike.isArray(copy)))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && jQueryLike.isArray(src) ? src : [];
                            } else {
                                clone = src && jQueryLike.isPlainObject(src) ? src : {};
                            }
                            target[name] = self.extend(deep, clone, copy);
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }
            return target;
        };
        
        self.toBase64 = function (string) {
            var buf = new Buffer(string);
            return buf.toString("base64");
        };
        function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
            var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
                ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
                denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

            if (!denominator) {
                return;
            }
            var px = nx / denominator,
                py = ny / denominator;
            return {x: px, y: py};
        }
        function calc_bisect_perp(x1, y1, x2, y2) {
            var dx = x2 - x1,
                dy = y2 - y1;
            if (dy == 0) {
                return [x1 + dx / 2, 0, x1 + dx / 2, 1];
            } else if (dx == 0) {
                return [0, y1 + dy / 2, 1, y1 + dy / 2];
            } else {
                var m, b, x3, y3;
                m = -dx / dy;
                x3 = x1 + dx / 2;
                y3 = y1 + dy / 2;
                b = y3 - m * x3;
                return [0, b, 1, m + b];
            }
        }
        function len(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }
        function angle(x1, y1, x2, y2) {
            if (x1 == x2) {
                if (y2 < y1) {
                    return 270;
                } else {
                    return 90;
                }
            } else if (y1 == y2) {
                if (x2 < x1) {
                    return 180;
                } else {
                    return 0;
                }
            } else {
                var	angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                if (angle < 0) {
                    angle += 360;
                }
                return angle;
            }
        }
        function arc3(x1, y1, x2, y2, x3, y3) {
            var out = {};
            if (x1 == x2 && y1 == y2 || x3 == x2 && y3 == y2) {
                out.path = "L" + [x3, y3];
                return out;
            }
            if (x1 == x3 && y1 == y3) {
                r = len(x1, y1, x2, y2) / 2;
                out.path = "A" + [r, r, 0, 0, 0, x2, y2] + "A" + [r, r, 0, 0, 0, x1, y1];
                return out;
            }
            var bp1 = calc_bisect_perp(x1, y1, x2, y2),
                bp2 = calc_bisect_perp(x2, y2, x3, y3),
                inter = intersect(bp1[0], bp1[1], bp1[2], bp1[3], bp2[0], bp2[1], bp2[2], bp2[3]),
                ang_start = inter && angle(inter.x, inter.y, x1, y1),
                ang_int = inter && angle(inter.x, inter.y, x2, y2),
                ang_end = inter && angle(inter.x, inter.y, x3, y3),
                angl = ang_end - ang_start;
            if (ang_int < ang_start) {
                if (ang_start < ang_end) {
                    angl -= 360;
                } else if (ang_int < ang_end) {
                    angl += 360;
                }
            } else {
                if (ang_end < ang_start) {
                    angl += 360;
                } else if (ang_end < ang_int) {
                    angl -= 360;
                }
            }
            if (inter) {
                var r = len(x1, y1, inter.x, inter.y);
                out.cx = inter.x;
                out.cy = inter.y;
                out.a1 = ang_start;
                out.a2 = ang_end;
                out.r = r;
                out.a = angl;
                out.f1 = +(Math.abs(angl) > 180);
                out.f2 = +(angl > 0);
                out.path = "A" + [safeRound(r), safeRound(r), 0, out.f1, out.f2, x3, y3];
            } else {
                out.path = "L" + [x3, y3];
            }
            return out;
        }
        function safeRound(n) {
            var match = (+n).toFixed(10).match(safeRound.rg);
            return match ? +match[0] : n;
        }
        safeRound.rg = /^\d*\.[^0]*(?=0|$)/;
        function findDotAtBezierSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t,
                pow = Math.pow;
            return {
                x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
            };
        }
        function asArc(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var m = findDotAtBezierSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, .5),
                arc = arc3(p1x, p1y, m.x, m.y, p2x, p2y);
            for (var i = 1; i < 10; i++) {
                if (i != 5) {
                    var dot = findDotAtBezierSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, i / 10);
                    if (Math.abs(len(arc.cx, arc.cy, dot.x, dot.y) - arc.r) > .5) {
                        return null;
                    }
                }
            }
            return arc;
        }

        self.optimisePath = function (path, precision) {
            precision = isFinite(precision) ? precision : 3;
            function isSmall(num) {
                return Math.abs(num.toFixed(precision)) <= sigma;
            }
            function goodEnough(num) {
                return Math.abs(num.toFixed(precision - 1)) <= gamma;
            }
            function c2l(seg) {
                if (seg.cmd == "C") {
                    if (seg.command == "C" && isSmall(seg.rest[0] - seg.x) && isSmall(seg.rest[1] - seg.y) && isSmall(seg.rest[2] - seg.rest[4]) && isSmall(seg.rest[3] - seg.rest[5])) {
                        seg.command = seg.cmd = "L";
                        seg.rest = [seg.rest[4], seg.rest[5]];
                    }
                    if (seg.command == "c" && seg.rest[0] == 0 && seg.rest[1] == 0 && isSmall(seg.rest[2] - seg.rest[4]) && isSmall(seg.rest[3] - seg.rest[5])) {
                        seg.command = "l";
                        seg.cmd = "L";
                        seg.rest = [seg.rest[4], seg.rest[5]];
                    }
                }
            }
            function l2h(seg) {
                if (seg.command == "L" && isSmall(+seg.rest[1] - seg.y)) {
                    seg.command = seg.cmd = "H";
                    seg.rest.pop();
                }
                if (seg.command == "l" && isSmall(+seg.rest[1])) {
                    seg.command = "h";
                    seg.cmd = "H";
                    seg.rest.pop();
                }
            }
            function l2v(seg) {
                if (seg.command == "L" && isSmall(+seg.rest[0] - seg.x)) {
                    seg.command = seg.cmd = "V";
                    seg.rest.shift();
                }
                if (seg.command == "l" && isSmall(+seg.rest[0])) {
                    seg.command = "v";
                    seg.cmd = "V";
                    seg.rest.shift();
                }
            }
            function c2a(segp, seg) {
                if (seg.cmd == "C") {
                    var rest = seg.rest,
                        x = seg.x,
                        y = seg.y,
                        X = seg.type == "abs" ? rest[4] : rest[4] + x,
                        Y = seg.type == "abs" ? rest[5] : rest[5] + y,
                        arc = seg.type == "abs" ? asArc(x, y, rest[0], rest[1], rest[2], rest[3], X, Y) : asArc(x, y, rest[0] + x, rest[1] + y, rest[2] + x, rest[3] + y, X, Y);
                    // This number 1e5 should be dependant on the dimensions
                    if (arc && arc.r && arc.r < 1e5) {
                        if (segp.r && Math.abs(segp.r - arc.r) < .5 && Math.abs(segp.cx - arc.cx) < .5 && Math.abs(segp.cy - arc.cy) < .5) {
                            segp.command = "A";
                            segp.a += arc.a;
                            if (Math.abs(segp.a) >= 360) {
                                segp.rest[5] = segp.cx * 2 - segp.x;
                                segp.rest[6] = segp.cy * 2 - segp.y;
                                seg.command = seg.cmd = "A";
                                seg.rest = [segp.r, segp.r, 0, 0, arc.f2, X, Y];
                                return;
                            }
                            // Need to calculate it again for better precision
                            arc = arc3(segp.x, segp.y, seg.x, seg.y, X, Y);
                            segp.a = arc.a;
                            segp.rest[0] = arc.r;
                            segp.rest[1] = arc.r;
                            segp.rest[3] = +(Math.abs(arc.a) > 180);
                            segp.rest[4] = +(arc.a > 0);
                            segp.rest[5] = X;
                            segp.rest[6] = Y;
                            return "unite";
                        }
                        seg.command = seg.cmd = "A";
                        seg.rest = [safeRound(arc.r), safeRound(arc.r), 0, arc.f1, arc.f2, rest[4], rest[5]];
                        seg.r = arc.r;
                        seg.cx = arc.cx;
                        seg.cy = arc.cy;
                        seg.a = arc.a;
                    }
                }
            }
            function c2s(segp, seg) {
                if (segp && seg.cmd == "C" && (segp.cmd == "C" || segp.cmd == "S")) {
                    var prevAnchor = {
                            x: segp.rest[segp.rest.length - 4] + (segp.type == "rel" ? segp.x : 0),
                            y: segp.rest[segp.rest.length - 3] + (segp.type == "rel" ? segp.y : 0)
                        },
                        anchor = {
                            x: 2 * seg.x - prevAnchor.x,
                            y: 2 * seg.y - prevAnchor.y
                        };
                    if (goodEnough(seg.rest[0] - anchor.x) && goodEnough(seg.rest[1] - anchor.y)) {
                        seg.rest.splice(0, 2);
                        seg.cmd = "S";
                        seg.command = seg.command == "C" ? "S" : "s";
                    }
                }
            }
            function h2hv2v(segp, seg) {
                var pcmd = segp && segp.cmd.toLowerCase();
                if (segp && pcmd == seg.cmd.toLowerCase() && (pcmd == "h" || pcmd == "v")) {
                    if (seg.type == "rel") {
                        segp.rest[0] += seg.rest[0];
                    } else if (segp.type == "rel") {
                        segp.rest[0] += seg.rest[0] - (pcmd == "h" ? seg.x : seg.y);
                    } else {
                        segp.rest[0] = seg.rest[0];
                    }
                    return "unite";
                }
            }
            var res = "",
                args = {
                    abs: "",
                    rel: ""
                },
                type,
                sigma = Math.pow(10, -precision),
                gamma = Math.pow(10, 1 - precision),
                x = 0,
                y = 0,
                mx,
                my,
                num,
                prev,
                nextAnchor,
                segs = [];
            path.replace(/([a-df-z])\s*([^a-df-z]+)?/ig, function (all, command, rest) {
                if (rest) {
                    rest = rest.split(/(?:\s*,\s*|(?=-)|\s+\b)/).map(function (x) { return +x; });
                    type = command.toLowerCase() == command ? "rel" : "abs";
                    if (command.toUpperCase() == "M") {
                        mx = rest[0];
                        my = rest[1];
                    }
                    segs.push({
                        command: command,
                        cmd: command.toUpperCase(),
                        rest: rest,
                        type: type,
                        x: x,
                        y: y
                    });
                    switch (command.toUpperCase()) {
                        case "M":
                        case "C":
                        case "Q":
                        case "T":
                        case "S":
                        case "A":
                        case "L":
                            x = (x * type == "rel") + rest[rest.length - 2];
                            y = (y * type == "rel") + rest[rest.length - 1];
                            break;
                        case "H":
                            x = (x * type == "rel") + rest[0];
                            break;
                        case "V":
                            y = (y * type == "rel") + rest[0];
                            break;
                    }
                } else {
                    segs.push({
                        command: command,
                        cmd: command.toUpperCase()
                    });
                    x = mx;
                    y = my;
                }
            });
            for (var i = 0; i < segs.length; i++) {

                // Special case for "C" instead of "L"
                c2l(segs[i]);
                // Special case if "L" instead of "H"
                l2h(segs[i]);
                // Special case if "L" instead of "V"
                l2v(segs[i]);
                // Special case if "C" instead of "A"
                if (c2a(segs[i - 1], segs[i]) == "unite") {
                    segs.splice(i, 1);
                    i--;
                }
                // Special case if "C" instead of "S"
                c2s(segs[i - 1], segs[i], goodEnough);
                // Special case if "C" instead of "A"
                if (h2hv2v(segs[i - 1], segs[i]) == "unite") {
                    segs.splice(i, 1);
                    i--;
                }
            }

            for (i = 0; i < segs.length; i++) {
                var command = segs[i].command,
                    rest = segs[i].rest,
                    type = segs[i].type,
                    x = segs[i].x,
                    y = segs[i].y,
                    mul = type == "abs" ? -1 : 1;

                args.abs = args.rel = "";
                if (rest) {
                    for (var j = 0, jj = rest.length; j < jj; j++) if (isFinite(rest[j])) {
                        num = +rest[j].toFixed(precision);
                        if (Math.abs(num - ~~num) < sigma) {
                            num = ~~num;
                        }
                        args[type] += num < 0 || !j ? num : "," + num;
                        switch (command.toUpperCase()) {
                            case "M":
                            case "L":
                            case "C":
                            case "S":
                            case "Q":
                            case "T":
                            case "H":
                                num += (j % 2 ? y : x) * mul;
                                break;
                            case "V":
                                num += y * mul;
                                break;
                            case "A":
                                if (j == 5) {
                                    num += x * mul;
                                }
                                if (j == 6) {
                                    num += y * mul;
                                }
                                break;
                        }
                        num = +num.toFixed(precision);
                        args[type == "abs" ? "rel" : "abs"] += num < 0 || !j ? num : "," + num;
                    }

                    if (args.abs.length <= args.rel.length) {
                        command = command.toUpperCase();
                    } else {
                        command = command.toLowerCase();
                    }
                    if (prev != command && (prev != "M" || command != "L")) {
                        res += command;
                    } else {
                        res += +rest[0].toFixed(precision) < 0 ? "" : ",";
                    }
                    prev = command;
                    if (args.abs.length <= args.rel.length) {
                        res += args.abs;
                    } else {
                        res += args.rel;
                    }
                } else {
                    res += "Z";
                    prev = "Z";
                }
            }
            return res;
        };
        self.safeRound = safeRound;
    }

	module.exports = new Utils();

}());
