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
        self.optimisePath = function (path, precision) {
            precision = precision == null ? 3 : precision;
            function isSmall(num) {
                return Math.abs(num.toFixed(precision)) <= sigma;
            }
            function goodEnough(num) {
                return Math.abs(num.toFixed(precision - 1)) <= gamma;
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
                num,
                prev,
                nextAnchor;
            path.replace(/([a-z])\s*([^a-df-z]+)?/ig, function (all, command, rest) {
                if (rest) {
                    rest = rest.split(/(?:\s*,\s*|(?=-)|\s+\b)/);

                    type = command.toLowerCase() == command ? "rel" : "abs";

                    // Special case for "C" instead of "L"
                    if (command == "C" && isSmall(rest[0] - x) && isSmall(rest[1] - y) && isSmall(rest[2] - rest[4]) && isSmall(rest[3] - rest[5])) {
                        command = "L";
                        rest.splice(0, 4);
                    }
                    // Special case if "L" instead of "H"
                    if (command == "L" && isSmall(+rest[1] - y)) {
                        command = "H";
                        rest.pop();
                    }
                    // Special case if "L" instead of "V"
                    if (command == "L" && isSmall(+rest[0] - x)) {
                        command = "V";
                        rest.splice(0, 1);
                    }
                    // Special case if "C" instead of "S"
                    if (command.toUpperCase() == "C") {
                        var X, Y;
                        if (type == "abs") {
                            X = +rest[4];
                            Y = +rest[5];
                            if (nextAnchor && goodEnough(nextAnchor.x - rest[0]) && goodEnough(nextAnchor.y - rest[1])) {
                                command = "S";
                                rest.splice(0, 2);
                                nextAnchor = {
                                    x: X - rest[0] + X,
                                    y: Y - rest[1] + Y
                                };
                            } else {
                                nextAnchor = {
                                    x: X - rest[2] + X,
                                    y: Y - rest[3] + Y
                                };
                            }
                        } else {
                            X += +rest[4];
                            Y += +rest[5];
                            if (nextAnchor && goodEnough(nextAnchor.x - rest[0] + x) && goodEnough(nextAnchor.y - rest[1] + y)) {
                                command = "s";
                                rest.splice(0, 2);
                                nextAnchor = {
                                    x: X + rest[4] - rest[0],
                                    y: Y + rest[5] - rest[1]
                                };
                            } else {
                                nextAnchor = {
                                    x: X + rest[4] - rest[2],
                                    y: Y + rest[5] - rest[3]
                                };
                            }
                        }
                    } else if (command.toUpperCase() == "S") {
                        if (type == "abs") {
                            nextAnchor = {
                                x: rest[0],
                                y: rest[1]
                            };
                        } else {
                            nextAnchor = {
                                x: +rest[0] + x,
                                y: +rest[1] + y
                            };
                        }
                    } else {
                        nextAnchor = null;
                    }

                    args.abs = args.rel = "";
                    for (var i = 0, ii = rest.length; i < ii; i++) if (rest[i]) {
                        num = +(+rest[i]).toFixed(precision);
                        if (Math.abs(num - ~~num) < sigma) {
                            num = ~~num;
                        }
                        args[type] += num < 0 || !i ? num : "," + num;
                        switch (command.toUpperCase()) {
                            case "M":
                            case "L":
                            case "C":
                            case "S":
                            case "Q":
                            case "T":
                            case "H":
                                num += (i % 2 ? y : x) * (type == "abs" ? -1 : 1);
                                break;
                            case "V":
                                num += y * (type == "abs" ? -1 : 1);
                                break;
                        }
                        num = +num.toFixed(precision);
                        args[type == "abs" ? "rel" : "abs"] += num < 0 || !i ? num : "," + num;
                    }
                    switch (command.toUpperCase()) {
                        case "M":
                        case "C":
                        case "Q":
                        case "T":
                        case "S":
                        case "A":
                        case "L":
                            x = (x * type == "rel") + +rest[rest.length - 2];
                            y = (y * type == "rel") + +rest[rest.length - 1];
                            break;
                        case "H":
                            x = (x * type == "rel") + +rest[0];
                            break;
                        case "V":
                            y = (y * type == "rel") + +rest[0];
                            break;
                    }

                    if (args.abs.length <= args.rel.length) {
                        command = command.toUpperCase();
                    } else {
                        command = command.toLowerCase();
                    }
                    if (prev != command && (prev != "M" || command != "L")) {
                        res += command;
                    } else {
                        res += +(+rest[0]).toFixed(precision) < 0 ? "" : ",";
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
            });
            return res;
        };
    }

	module.exports = new Utils();
    
}());
