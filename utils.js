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
        self.roundP = function (x, precision) {
            return +(+x).toFixed(precision);
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

        self.intersectRects = function (rect1, rect2) {
            if (!rect1) {
                return {};
            }
            if (!rect2) {
                return rect1;
            }
            return {
                left: Math.max(rect1.left, rect2.left),
                top: Math.max(rect1.top, rect2.top),
                right: Math.min(rect1.right, rect2.right),
                bottom: Math.min(rect1.bottom, rect2.bottom)
            };
        };

        // Does rect1 contain rect 2?
        self.containsRect = function (rect1, rect2) {
            if (!isFinite(rect2.left) || !isFinite(rect2.top) || !isFinite(rect2.right) || !isFinite(rect2.bottom)) {
                return true;
            }
            return rect1.top <= rect2.top && rect1.left <= rect2.left &&
                rect1.bottom >= rect2.bottom && rect1.right >= rect2.right;
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
            //+ Jonas Raoni Soares Silva
            //@ http://jsfromhell.com/math/line-length [rev. #1]
            return Math.sqrt((x1 -= x2) * x1 + (y1 -= y2) * y1);
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
        function arc3(x1, y1, x2, y2, x3, y3) {
            var out = {};
            if (x1 == x2 && y1 == y2 || x3 == x2 && y3 == y2) {
                return out;
            }
            if (x1 == x3 && y1 == y3) {
                out.a1 = 0;
                out.a2 = 360;
                out.r = len(x1, y1, x2, y2) / 2;
                out.a = 360;
                out.f1 = 0;
                out.f2 = 0;
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
                out.cx = inter.x;
                out.cy = inter.y;
                out.a1 = ang_start;
                out.a2 = ang_end;
                out.r = len(x1, y1, inter.x, inter.y);
                out.a = angl;
                out.f1 = +(Math.abs(angl) > 180);
                out.f2 = +(angl > 0);
            }
            return out;
        }
        // LUT for the operations:
        // t1 = 1 - t/10
        // x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
        // y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
        var dotAtBezierSegment = [
                [1, 0, 0, 0],
                [0.729, 0.243, 0.027, 0.001],
                [0.512, 0.384, 0.096, 0.008],
                [0.343, 0.441, 0.189, 0.027],
                [0.216, 0.432, 0.288, 0.064],
                [0.125, 0.375, 0.375, 0.125],
                [0.064, 0.288, 0.432, 0.216],
                [0.027, 0.189, 0.441, 0.343],
                [0.008, 0.096, 0.384, 0.512],
                [0.001, 0.027, 0.243, 0.729]
            ];
        function findDotAtBezierSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var a = dotAtBezierSegment[t];
            return {
                x: a[0] * p1x + a[1] * c1x + a[2] * c2x + a[3] * p2x,
                y: a[0] * p1y + a[1] * c1y + a[2] * c2y + a[3] * p2y
            };
        }
        function asArc(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var m = findDotAtBezierSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, 5),
                arc = arc3(p1x, p1y, m.x, m.y, p2x, p2y);
            if (arc && arc.r) {
                var sigma = Math.min(.05, arc.r / 100 * 5); // 5% of radius or 0.05
                for (var i = 1; i < 10; i++) {
                    if (i != 5) {
                        var dot = findDotAtBezierSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, i);
                        if (Math.abs(len(arc.cx, arc.cy, dot.x, dot.y) - arc.r) > sigma) {
                            return null;
                        }
                    }
                }
                return arc;
            }
        }
        function cleanNumbers(str) {
            return str.replace(/([^\d.]\d+\.\d+),(-?)0\./, "$1$2.").replace(/([^\d.]\d+,-?|\d+-)0\./, "$1.");
        }
        self.precision = function (arg, noLimitation) {
            if (isFinite(arg) && arg >= 0) {
                if (noLimitation) {
                    return arg;
                }
                // Allow no precisions to be smaller than 2.
                return arg < 2 ? 2 : arg;
            }
            return 3;
        };

        self.pointsToString = function (points, precision) {
            precision = self.precision(precision, true);
            return points.map(function (item) {
                return +item.x.toFixed(precision) + " " + +item.y.toFixed(precision);
            }).join();
        };

        self.parsePreparedPath = function (pathString) {
            var array = pathString.replace(/([MmLlCcZz])/g, " $1 ").split(/\s*,\s*|\s+/),
                data = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0;

            while (array.length) {
                var cur = array.shift();
                if (cur == "") {
                    continue;
                }

                var abs = [],
                    rel = [],
                    seg = {
                        cmd: cur.toLowerCase(),
                        abs: abs,
                        rel: rel,
                        x: x,
                        y: y,
                        isabs: 1
                    };
                switch (cur) {
                case "M":
                    mx = +array.shift();
                    my = +array.shift();
                    abs.push(mx);
                    abs.push(my);
                    rel.push(mx - x);
                    rel.push(my - y);
                    x = abs[abs.length - 2];
                    y = abs[abs.length - 1];
                    break;
                case "m":
                    mx = +array.shift();
                    my = +array.shift();
                    abs.push(mx + x);
                    abs.push(my + y);
                    rel.push(mx);
                    rel.push(my);
                    seg.isabs = 0;
                    x = abs[abs.length - 2];
                    y = abs[abs.length - 1];
                    break;
                case "L":
                    abs.push(+array.shift());
                    abs.push(+array.shift());
                    rel.push(abs[abs.length - 2] - x);
                    rel.push(abs[abs.length - 1] - y);
                    x = abs[abs.length - 2];
                    y = abs[abs.length - 1];
                    break;
                case "l":
                    rel.push(+array.shift());
                    rel.push(+array.shift());
                    abs.push(rel[rel.length - 2] + x);
                    abs.push(rel[rel.length - 1] + y);
                    seg.isabs = 0;
                    x = abs[abs.length - 2];
                    y = abs[abs.length - 1];
                    break;
                case "C":
                    abs.push(+array.shift());
                    abs.push(+array.shift());
                    abs.push(+array.shift());
                    abs.push(+array.shift());
                    abs.push(+array.shift());
                    abs.push(+array.shift());
                    rel.push(abs[abs.length - 6] - x);
                    rel.push(abs[abs.length - 5] - y);
                    rel.push(abs[abs.length - 4] - x);
                    rel.push(abs[abs.length - 3] - y);
                    rel.push(abs[abs.length - 2] - x);
                    rel.push(abs[abs.length - 1] - y);
                    x = abs[abs.length - 2];
                    y = abs[abs.length - 1];
                    break;
                case "c":
                    rel.push(+array.shift());
                    rel.push(+array.shift());
                    rel.push(+array.shift());
                    rel.push(+array.shift());
                    rel.push(+array.shift());
                    rel.push(+array.shift());
                    abs.push(rel[rel.length - 6] + x);
                    abs.push(rel[rel.length - 5] + y);
                    abs.push(rel[rel.length - 4] + x);
                    abs.push(rel[rel.length - 3] + y);
                    abs.push(rel[rel.length - 2] + x);
                    abs.push(rel[rel.length - 1] + y);
                    seg.isabs = 0;
                    x = abs[abs.length - 2];
                    y = abs[abs.length - 1];
                    break;
                case "Z":
                case "z":
                    x = mx;
                    y = my;
                    break;
                }

                data.push(seg);
            }
            return data;
        };

        var pathCommand = /([a-z])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\s]*,?[\s]*)+)/ig,
            pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\s]*,?[\s]*/ig,
            paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0};
        self.parsePath = function (pathString) {
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
                                sx = x = mx;
                                sy = y = my;
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
                                sx = x = mx;
                                sy = y = my;
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

        self.optimisePath = function (path, precision, preparedPath) {
            precision = self.precision(precision, true);
            var res = "",
                args = {
                    abs: "",
                    rel: ""
                },
                sigma = Math.pow(10, -precision),
                gamma = Math.pow(10, 1 - precision),
                prec = Math.pow(10, precision),
                prec1 = Math.pow(10, Math.max(precision - 1, 0)),
                prec2 = Math.pow(10, Math.max(precision - 2, 0)),
                prev,
                segs = [];
            function number(num) {
                var rnd = Math.round(num * prec) / prec;
                if (prec1 != prec2) {
                    var rnd1 = Math.round(num * prec1) / prec1,
                        rnd2 = Math.round(num * prec2) / prec2;
                    if (rnd2 == rnd1) {
                        return rnd1;
                    }
                }
                return rnd;
            }
            function isSmall(num) {
                return Math.abs(Math.round(num * prec) / prec) <= sigma;
            }
            function goodEnough(num) {
                return Math.abs(Math.round(num * prec1) / prec1) <= gamma;
            }
            function isCL(seg) {
                var i = seg.abs.length - 1,
                    xn,
                    yn,
                    a;
                // Find first point that is not equal to the last point.
                while (i >= 0) {
                    yn = seg.abs[i];
                    xn = seg.abs[--i];
                    --i;
                    if (seg.x != xn || seg.y != yn) {
                        break;
                    }
                }
                // All points are identical.
                if (i < 0) {
                    return true;
                }
                // Special case vertical line.
                if (seg.x == xn) {
                    while (i >= 0) {
                        if (seg.x != seg.abs[--i]) {
                            return false;
                        }
                        --i;
                    }
                    return true;
                }
                a = (yn - seg.y) / (xn - seg.x);
                while (i >= 0) {
                    if (Math.abs(a * (seg.abs[i - 1] - seg.x) + seg.y - seg.abs[i]) > sigma) {
                        return false;
                    }
                    i -= 2;
                }
                return true;
            }
            function c2l(seg) {
                if (seg.cmd == "c" && isCL(seg)) {
                    seg.cmd = "l";
                    seg.rel.shift();
                    seg.rel.shift();
                    seg.rel.shift();
                    seg.rel.shift();
                    seg.abs.shift();
                    seg.abs.shift();
                    seg.abs.shift();
                    seg.abs.shift();
                }
            }
            function c2q(seg) {
                if (seg.cmd == "c") {
                    var _32 = 3 / 2,
                        x1 = seg.x,
                        y1 = seg.y,
                        x2 = seg.abs[0],
                        y2 = seg.abs[1],
                        x3 = seg.abs[2],
                        y3 = seg.abs[3],
                        x4 = seg.abs[4],
                        y4 = seg.abs[5],
                        abs = Math.abs,
                        cx1 = (x2 - x1) * _32 + x1,
                        cy1 = (y2 - y1) * _32 + y1,
                        cx2 = (x3 - x4) * _32 + x4,
                        cy2 = (y3 - y4) * _32 + y4,
                        sigma = (abs(x2 - x1) + abs(y2 - y1) + abs(x3 - x4) + abs(y3 - y4)) / 400 / 2;
                    if (abs(cx2 - cx1) <= sigma && abs(cy2 - cy1) <= sigma) {
                        seg.cmd = "q";
                        seg.abs = [cx1, cy1, x4, y4];
                        seg.rel = [cx1 - x1, cy1 - y1, x4 - x1, y4 - y1];
                    }
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
            Math.sign = Math.sign || function (val) {
                val = +val;
                return val ? val / Math.abs(val) : val;
            };
            function c2a(segp, seg) {
                if (seg.cmd == "c") {
                    var rest = seg.abs,
                        x = seg.x,
                        y = seg.y,
                        X = rest[4],
                        Y = rest[5],
                        arc = asArc(x, y, rest[0], rest[1], rest[2], rest[3], X, Y);
                    if (arc && arc.r && arc.r < len(x, y, X, Y) * 10) {
                        if (segp.a && Math.sign(segp.a) == Math.sign(arc.a) && areCloseEnough(segp.r, arc.r) && areCloseEnough(segp.cx, arc.cx) && areCloseEnough(segp.cy, arc.cy)) {
                            segp.a += arc.a;
                            if (!number(Math.abs(X - segp.x)) && !number(Math.abs(Y - segp.y))) {
                                seg.cmd = "a";
                                seg.abs[0] = segp.r;
                                seg.abs[1] = segp.r;
                                seg.abs[2] = 0;
                                seg.abs[3] = arc.f1;
                                seg.abs[4] = arc.f2;
                                seg.abs[5] = segp.x;
                                seg.abs.push(segp.y);
                                seg.rel[0] = seg.abs[0];
                                seg.rel[1] = seg.abs[1];
                                seg.rel[2] = seg.abs[2];
                                seg.rel[3] = seg.abs[3];
                                seg.rel[4] = seg.abs[4];
                                seg.rel[5] = seg.abs[5] - x;
                                seg.rel[6] = seg.abs[6] - y;
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
                                segp.rel[0] = segp.abs[0];
                                segp.rel[1] = segp.abs[1];
                                segp.rel[2] = segp.abs[2];
                                segp.rel[3] = segp.abs[3];
                                segp.rel[4] = segp.abs[4];
                                segp.rel[5] = segp.abs[5] - segp.x;
                                segp.rel[6] = segp.abs[6] - segp.y;
                                return "unite";
                            }
                        }
                        var n = number(arc.r);
                        seg.cmd = "a";
                        seg.abs[0] = n;
                        seg.abs[1] = n;
                        seg.abs[2] = 0;
                        seg.abs[3] = arc.f1;
                        seg.abs.push(rest[5]);
                        seg.abs[5] = rest[4];
                        seg.abs[4] = arc.f2;
                        seg.rel[0] = seg.abs[0];
                        seg.rel[1] = seg.abs[1];
                        seg.rel[2] = seg.abs[2];
                        seg.rel[3] = seg.abs[3];
                        seg.rel[4] = seg.abs[4];
                        seg.rel[5] = seg.abs[5] - x;
                        seg.rel.push(seg.abs[6] - y);
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
                if (!segp || segp.cmd != "c" && segp.cmd != "s") {
                    if (!number(seg.rel[0]) && !number(seg.rel[1])) {
                        seg.abs.shift();
                        seg.abs.shift();
                        seg.rel.shift();
                        seg.rel.shift();
                        seg.cmd = "s";
                    }
                } else {
                    var prevAnchorX = segp.abs[segp.abs.length - 4],
                        prevAnchorY = segp.abs[segp.abs.length - 3],
                        anchorX = 2 * seg.x - prevAnchorX,
                        anchorY = 2 * seg.y - prevAnchorY;
                    if (goodEnough(seg.abs[0] - anchorX) && goodEnough(seg.abs[1] - anchorY)) {
                        seg.abs.shift();
                        seg.abs.shift();
                        seg.rel.shift();
                        seg.rel.shift();
                        seg.cmd = "s";
                    }
                }
            }
            function q2t(segp, seg) {
                if (seg.cmd != "q") {
                    return;
                }
                if (!segp || segp.cmd != "q" && segp.cmd != "t") {
                    if (!number(seg.rel[0]) && !number(seg.rel[1])) {
                        seg.abs.shift();
                        seg.abs.shift();
                        seg.rel.shift();
                        seg.rel.shift();
                        seg.cmd = "t";
                    }
                } else {
                    var prevAnchorX = "qx" in seg ? seg.qx : segp.abs[0],
                        prevAnchorY = "qy" in seg ? seg.qy : segp.abs[1],
                        anchorX = 2 * seg.x - prevAnchorX,
                        anchorY = 2 * seg.y - prevAnchorY;
                    if (goodEnough(seg.abs[0] - anchorX) && goodEnough(seg.abs[1] - anchorY)) {
                        seg.qx = anchorX;
                        seg.qy = anchorY;
                        seg.abs.shift();
                        seg.abs.shift();
                        seg.rel.shift();
                        seg.rel.shift();
                        seg.cmd = "t";
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
            if (preparedPath) {
                segs = self.parsePreparedPath(path);
            } else {
                segs = self.parsePath(path);
            }

            // Convert all S to C and T to Q prior to processing
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
                if (seg.cmd == "t") {
                    if (pseg.cmd == "q") {
                        dx = seg.x - pseg.abs[0];
                        dy = seg.y - pseg.abs[1];
                        seg.abs.unshift(seg.x + dx, seg.y + dy);
                        seg.rel.unshift(dx, dy);
                    } else {
                        seg.abs.unshift(seg.x, seg.y);
                        seg.rel.unshift(0, 0);
                    }
                    seg.cmd = "q";
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
                // Special case if "C" instead of "Q"
                c2q(segs[i]);
                // Special case if "Q" instead of "T"
                q2t(segs[i - 1], segs[i], goodEnough);
                // Special case when H followed by H or V followed by V
                if (h2hv2v(segs[i - 1], segs[i]) == "unite") {
                    segs.splice(i, 1);
                    i--;
                }
            }

            for (i = 0; i < segs.length; i++) {
                var seg = segs[i],
                    command = seg.cmd,
                    abs = seg.abs,
                    rel = seg.rel,
                    next = segs[i + 1],
                    loop = next && next.cmd == "z" && abs[abs.length - 2] == next.x && abs[abs.length - 1] == next.y;

                args.abs = args.rel = "";
                if (abs) {
                    for (var j = 0, jj = abs.length; j < jj; j++) {
                        var a = number(abs[j]),
                            r = number(rel[j]);
                        args.abs += (a < 0 || !j ? "" : ",") + a;
                        args.rel += (r < 0 || !j ? "" : ",") + r;
                    }
                    args.abs = cleanNumbers(args.abs);
                    args.rel = cleanNumbers(args.rel);

                    var arg;
                    if (args.abs.length <= args.rel.length || loop) {
                        command = command.toUpperCase();
                        arg = args.abs;
                    } else {
                        arg = args.rel;
                    }
                    if (command == "L" && loop) {
                        continue;
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
        self.clone = function (o) {
            if (Object(o) !== o) {
                return o;
            }
            var out = {};
            for (var key in o) {
                if (Object(o[key]) === o[key]) {
                    out[key] = self.clone(o[key]);
                } else {
                    out[key] = o[key];
                }
            }
            return out;
        };
        self.merge = function (o1, o2) {
            for (var key in o2) {
                if (!(key in o1)) {
                    o1[key] = o2[key];
                } else {
                    if (Object(o1[key]) === o1[key] && Object(o2[key]) === o2[key]) {
                        self.merge(o1[key], o2[key]);
                    }
                }
            }
        };
    }
    module.exports = new Utils();

}());
