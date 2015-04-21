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

    var Buffer = require("buffer").Buffer;

    function Utils() {

        var self = this;

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

        self.unionRect = function (rect1, rect2, expand) {
            if (!rect2) {
                return;
            }
            if (!isFinite(rect1.left) || rect2.left - expand < rect1.left) {
                rect1.left = rect2.left - expand;
            }
            if (!isFinite(rect1.right) || rect2.right + expand > rect1.right) {
                rect1.right = rect2.right + expand;
            }
            if (!isFinite(rect1.top) || rect2.top - expand < rect1.top) {
                rect1.top = rect2.top - expand;
            }
            if (!isFinite(rect1.bottom) || rect2.bottom + expand > rect1.bottom) {
                rect1.bottom = rect2.bottom + expand;
            }
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
                    for (var key in obj) {
                        if (!obj.hasOwnProperty(key)) {
                            return false;
                        }
                    }
                    return key === undefined || obj.hasOwnProperty(key);
                }
            };

        self.extend = function (deep) {
            var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
                i = 1,
                length = arguments.length;

            deep = false;
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
                var	ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                if (ang < 0) {
                    ang += 360;
                }
                return ang;
            }
        }
        function areCloseEnough(num1, num2) {
            return Math.abs(num1 - num2) < (num1 + num2) / 2 / 100;
        }
        function safeRound(n) {
            var match = (+n).toFixed(10).match(safeRound.rg);
            return match ? +match[0] : n;
        }
        safeRound.rg = /^\d*\.[^0]*(?=0|$)/;
        function arc3(x1, y1, x2, y2, x3, y3) {
            var out = {};
            if (x1 == x2 && y1 == y2 || x3 == x2 && y3 == y2) {
                out.path = "L" + [x3, y3];
                return out;
            }
            if (x1 == x3 && y1 == y3) {
                var r = len(x1, y1, x2, y2) / 2;
                out.path = "A" + [r, r, 0, 0, 0, x2, y2] + "A" + [r, r, 0, 0, 0, x1, y1];
                out.a1 = 0;
                out.a2 = 360;
                out.r = r;
                out.a = 360;
                out.f1 = 0;
                out.f2 = 0;
                out.r = r;
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
                r = len(x1, y1, inter.x, inter.y);
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
                    if (Math.abs(len(arc.cx, arc.cy, dot.x, dot.y) - arc.r) > .1) {
                        return null;
                    }
                }
            }
            return arc;
        }
        self.precision = function (arg) {
            return isFinite(arg) && arg >= 0 ? arg : 3;
        };

        self.pointsToString = function (points, precision) {
            precision = self.precision(precision);
            return points.map(function (item) {
                return +item.x.toFixed(precision) + " " + +item.y.toFixed(precision);
            }).join();
        };

        var pathCommand = /([a-z])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\s]*,?[\s]*)+)/ig,
            tCommand = /([rstm])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\s]*,?[\s]*)+)/ig,
            pathValues = /(-?\d*\.?\d*(?:e[\-+]?\\d+)?)[\s]*,?[\s]*/ig,
            paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0};
        self.parsePath = function(pathString) {
            var data = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0;
            String(pathString).replace(pathCommand, function (a, b, c) {
                var params = [],
                    rel = [],
                    abs = [],
                    args,
                    sx = x,
                    sy = y,
                    name = b.toLowerCase(),
                    isAbs = name != b;
                c.replace(pathValues, function (a, b) {
                    b && params.push(+b);
                });
                if (name == "m") {
                    if (isAbs) {
                        mx = params[0];
                        my = params[1];
                    } else {
                        mx = params[0] + x;
                        my = params[1] + y;
                    }
                }
                if (name == "m" && params.length > 2) {
                    if (isAbs) {
                        rel = [params[0] - x, params[1] - y];
                        x = params[0];
                        y = params[1];
                        abs = params.splice(0, 2);
                    } else {
                        abs = [params[0] + x, params[1] + y];
                        x += params[0];
                        y += params[1];
                        rel = params.splice(0, 2);
                    }
                    data.push({
                        cmd: name,
                        rel: rel,
                        abs: abs,
                        x: sx,
                        y: sy,
                        isabs: +isAbs
                    });
                    name = "l";
                    b = isAbs ? "L" : "l";
                }
                while (params.length >= paramCounts[name]) {
                    sx = x;
                    sy = y;
                    args = params.splice(0, paramCounts[name]);
                    if (isAbs) {
                        switch (name) {
                            case "a":
                            case "m":
                            case "l":
                                rel = args.slice(0);
                                rel[rel.length - 2] -= x;
                                rel[rel.length - 1] -= y;
                                abs = args.slice(0);
                                x = abs[abs.length - 2];
                                y = abs[abs.length - 1];
                                break;
                            case "c":
                            case "s":
                            case "t":
                            case "q":
                                rel = args.slice(0);
                                rel = rel.map(function (a, i) {
                                    return a - (i % 2 ? y : x);
                                });
                                abs = args.slice(0);
                                x = abs[abs.length - 2];
                                y = abs[abs.length - 1];
                                break;
                            case "h":
                                rel = [args[0] - x];
                                abs = args.slice(0);
                                x = abs[0];
                                break;
                            case "v":
                                rel = [args[0] - y];
                                abs = args.slice(0);
                                y = abs[0];
                                break;
                            case "z":
                                x = mx;
                                y = my;
                                break;
                        }
                    } else {
                        switch (name) {
                            case "a":
                            case "m":
                            case "l":
                                abs = args.slice(0);
                                x = abs[abs.length - 2] += x;
                                y = abs[abs.length - 1] += y;
                                rel = args.slice(0);
                                break;
                            case "c":
                            case "s":
                            case "t":
                            case "q":
                                abs = args.slice(0);
                                abs = abs.map(function (a, i) {
                                    return a + (i % 2 ? y : x);
                                });
                                rel = args.slice(0);
                                x = abs[abs.length - 2];
                                y = abs[abs.length - 1];
                                break;
                            case "h":
                                abs = [args[0] + x];
                                rel = args.slice(0);
                                x = abs[0];
                                break;
                            case "v":
                                abs = [args[0] + y];
                                rel = args.slice(0);
                                y = abs[0];
                                break;
                            case "z":
                                x = mx;
                                y = my;
                                break;
                        }
                    }
                    data.push({
                        cmd: name,
                        abs: abs,
                        rel: rel,
                        x: sx,
                        y: sy,
                        isabs: +isAbs
                    });
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
            return data;
        };

        self.optimisePath = function (path, precision) {
            precision = self.precision(precision);
            var res = "",
                args = {
                    abs: "",
                    rel: ""
                },
                type,
                sigma = Math.pow(10, -precision),
                gamma = Math.pow(10, 1 - precision),
                num,
                prev,
                segs = [];
            function number(num) {
                var rough1 = String(+num.toFixed(precision - 1)),
                    rough2 = String(+num.toFixed(precision - 2)),
                    rough0 = String(+num.toFixed(precision)),
                    res;
                if (rough0.length - rough2.length >= 3) {
                    res = rough2;
                } else if (rough0.length - rough1.length >= 2) {
                    res = rough1;
                } else {
                    res = rough0;
                }
                return res.replace(/^(-?)0\./, "$1.");
            }
            function isSmall(num) {
                return Math.abs(num.toFixed(precision)) <= sigma;
            }
            function goodEnough(num) {
                return Math.abs(num.toFixed(precision - 1)) <= gamma;
            }
            function isCL(seg) {
                var xs = [seg.x],
                    ys = [seg.y];
                seg.abs.forEach(function (a, i) {
                    if (i % 2) {
                        ys.push(a);
                    } else {
                        xs.push(a);
                    }
                });
                var i = xs.length - 1,
                    a = ys[i] - ys[0],
                    b = xs[i] - xs[0],
                    c = xs[i] * ys[0] - xs[0] * ys[i],
                    d = Math.sqrt(a * a + b * b);
                if (!isFinite(d)) {
                    return false;
                }
                while (--i) {
                    if (Math.abs(a * xs[i] - b * ys[i] + c) / d > sigma) {
                        return false;
                    }
                }
                return true;
            }
            function c2l(seg) {
                if (seg.cmd == "c" && isCL(seg)) {
                    seg.cmd = "l";
                    seg.rel = [seg.abs[4] - seg.x, seg.abs[5] - seg.y];
                    seg.abs = [seg.abs[4], seg.abs[5]];
                }
            }
            function l2h(seg) {
                if (seg.cmd == "l" && isSmall(seg.rel[1])) {
                    seg.cmd = "h";
                    seg.abs.pop();
                    seg.rel.pop();
                }
            }
            function l2v(seg) {
                if (seg.cmd == "l" && isSmall(seg.rel[0])) {
                    seg.cmd = "v";
                    seg.abs.shift();
                    seg.rel.shift();
                }
            }
            function c2a(segp, seg) {
                if (seg.cmd == "c") {
                    var rest = seg.abs,
                        x = seg.x,
                        y = seg.y,
                        X = rest[4],
                        Y = rest[5],
                        arc = asArc(x, y, rest[0], rest[1], rest[2], rest[3], X, Y);
                    if (arc && arc.r && arc.r < len(x, y, X, Y) * 10) {
                        if (segp.r && areCloseEnough(segp.r, arc.r) && areCloseEnough(segp.cx, arc.cx) && areCloseEnough(segp.cy, arc.cy)) {
                            segp.a += arc.a;
                            if (number(Math.abs(X - segp.x)) == "0" && number(Math.abs(Y - segp.y)) == "0") {
                                seg.cmd = "a";
                                seg.abs = [segp.r, segp.r, 0, arc.f1, arc.f2, segp.x, segp.y];
                                seg.rel = seg.abs.slice(0);
                                seg.rel[5] -= x;
                                seg.rel[6] -= y;
                                return;
                            }
                            // Need to calculate it again for better precision
                            var newarc = arc3(segp.x, segp.y, seg.x, seg.y, X, Y);
                            if (newarc.r && newarc.a) {
                                segp.a = newarc.a;
                                segp.abs[0] = newarc.r;
                                segp.abs[1] = newarc.r;
                                segp.abs[3] = +(Math.abs(newarc.a) > 180);
                                segp.abs[4] = +(newarc.a > 0);
                                segp.abs[5] = X;
                                segp.abs[6] = Y;
                                segp.rel = segp.abs.slice(0);
                                segp.rel[5] -= segp.x;
                                segp.rel[6] -= segp.y;
                                return "unite";
                            }
                        }
                        seg.cmd = "a";
                        seg.abs = [safeRound(arc.r), safeRound(arc.r), 0, arc.f1, arc.f2, rest[4], rest[5]];
                        seg.rel = seg.abs.slice(0);
                        seg.rel[5] -= x;
                        seg.rel[6] -= y;
                        seg.r = arc.r;
                        seg.cx = arc.cx;
                        seg.cy = arc.cy;
                        seg.a = arc.a;
                    }
                }
            }
            function c2s(segp, seg) {
                if (seg.cmd != "c") {
                    return;
                }
                if ((!segp || segp.cmd != "c" && segp.cmd != "s")) {
                    if (!+number(seg.rel[0]) && !+number(seg.rel[1])) {
                        seg.abs.splice(0, 2);
                        seg.rel.splice(0, 2);
                        seg.cmd = "s";
                    }
                } else {
                    var prevAnchor = {
                            x: segp.abs[segp.abs.length - 4],
                            y: segp.abs[segp.abs.length - 3]
                        },
                        anchor = {
                            x: 2 * seg.x - prevAnchor.x,
                            y: 2 * seg.y - prevAnchor.y
                        };
                    if (goodEnough(seg.abs[0] - anchor.x) && goodEnough(seg.abs[1] - anchor.y)) {
                        seg.abs.splice(0, 2);
                        seg.rel.splice(0, 2);
                        seg.cmd = "s";
                    }
                }
            }
            function h2hv2v(segp, seg) {
                var pcmd = segp && segp.cmd;
                if (segp && pcmd == seg.cmd && (pcmd == "h" || pcmd == "v")) {
                    segp.abs[0] = seg.abs[0];
                    segp.rel[0] += seg.rel[0];
                    return "unite";
                }
            }
            function splitArray(arr, len) {
                var out = [];
                while (arr.length) {
                    out.push(arr.splice(0, len));
                }
                return out;
            }
            segs = self.parsePath(path);

            for (var i = 1; i < segs.length; i++) {
                var seg = segs[i],
                    pseg = segs[i - 1],
                    dx, dy;
                if (seg.cmd == "s") {
                    if (pseg.cmd == "c") {
                        dx = seg.x - pseg.abs[2];
                        dy = seg.y - pseg.abs[3];
                        seg.abs.unshift(seg.x + dx, seg.y + dy);
                        seg.rel.unshift(dx, dy);
                    } else {
                        seg.abs.unshift(seg.x, seg.y);
                        seg.rel.unshift(0, 0);
                    }
                    seg.cmd = "c";
                }
            }
            for (i = 0; i < segs.length; i++) {

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
                var command = segs[i].cmd,
                    abs = segs[i].abs,
                    rel = segs[i].rel;

                args.abs = args.rel = "";
                if (abs) {
                    var prevAbsNum, prevRelNum;
                    for (var j = 0, jj = abs.length; j < jj; j++) {
                        if (isFinite(abs[j])) {
                            num = number(abs[j]);
                            args.abs += num.charAt() == "." && !prevAbsNum || num.charAt() == "-" || !j ? num : "," + num;
                            prevAbsNum = num == ~~num;
                            num = number(rel[j]);
                            args.rel += num.charAt() == "." && !prevRelNum || num.charAt() == "-" || !j ? num : "," + num;
                            prevRelNum = num == ~~num;
                        }
                    }

                    var arg;
                    if (args.abs.length <= args.rel.length) {
                        command = command.toUpperCase();
                        arg = args.abs;
                    } else {
                        arg = args.rel;
                    }
                    if (prev != command && (prev != "m" || command != "l")) {
                        // M>l?
                        res += command;
                    } else {
                        res += arg.charAt() == "-" ? "" : ",";
                    }
                    prev = command;
                    res += arg;
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
