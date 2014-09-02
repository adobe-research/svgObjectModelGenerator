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
/*global define: true, require: true, module: true */

/* Help write the SVG */

(function () {
"use strict";

    var Buffer = require('buffer').Buffer,
        guidID = 1,
        svgWriterIDs = require("./svgWriterIDs.js");

	function SVGWriterUtils() {
        
        var self = this;
        
        this.omguid = function (om) {
            if (!om._guid) {
                om._guid = "guid" + guidID++;
            }
            return om._guid;
        };
        
        this.write = function (ctx, sOut) {
            ctx.sOut += sOut;
        };
    
        this.indent = function (ctx) {
            ctx.currentIndent += ctx.indent;
        };
    
        this.undent = function (ctx) {
            ctx.currentIndent = ctx.currentIndent.substr(0, ctx.currentIndent.length - ctx.indent.length);
        };
    
        this.writeLength = function (val) {
            var length = Math.round(val);
            return (length)?(length+"px"):"0";
        };

        this.componentToHex = function (c) {
            var rnd = Math.round(c, 0),
                hex = Number(rnd).toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        };

        this.rgbToHex = function (r, g, b) {
            return "#" + self.componentToHex(r) + self.componentToHex(g) + self.componentToHex(b);
        };

        this.px = function (ctx, length) {
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
    
        this.writeColor = function (val) {
            var color;
            val = val || "transparent";
            if (typeof val === "string") {
                color = val;
            } else {
                color = self.rgbToHex(val.r, val.g, val.b);
            }

            return color;
        };

        this.writeAttrIfNecessary = function (ctx, attr, val, def, unit) {
            unit = unit || "";
            if (String(val) !== String(def)) {
                self.write(ctx, " " + attr + "=\"" + val + unit + "\"");
            }
        };

        this.writeTransformIfNecessary = function (ctx, attr, val) {
            if (val) {
                self.write(ctx, " " + attr + "=\"matrix(" +
                           val.a + ", " + val.b + ", " + val.c + ", " +
                           val.d + ", " + val.e + ", " + val.f + ")\"");
            }
        };

        this.writeLinearGradientInternal = function (ctx, stops, gradientID, scale, coords) {
            var iStop,
                stp,
                stpOpacity,
                position;
            
            self.write(ctx, ctx.currentIndent + "<linearGradient id=\"" + gradientID + "\"");
            self.write(ctx, " gradientUnits=\"userSpaceOnUse\"");
            self.write(ctx, " x1=\"" + self.round1k(coords.xa + coords.cx) + "\" y1=\"" + self.round1k(coords.ya + coords.cy) + "\"");
            self.write(ctx, " x2=\"" + self.round1k(-coords.xa + coords.cx) + "\" y2=\"" + self.round1k(-coords.ya + coords.cy) + "\"");
            self.write(ctx, ">" + ctx.terminator);
            self.indent(ctx);
            for (iStop = 0; iStop < stops.length; iStop++) {
                stp = stops[iStop];
                stpOpacity = '';
                position = self.round1k((Math.round(stp.position, 2)/100.0 - 0.5) * scale + 0.5);
                
                if (isFinite(stp.color.a) && stp.color.a !== 1.0) {
                    stpOpacity = ' stop-opacity="' + (Math.round(stp.color.a * 100.0, 2)/100.0) + '"';
                }
                self.write(ctx, ctx.currentIndent + '<stop offset="' + position + '" stop-color="' + self.writeColor(stp.color) + '"' + stpOpacity + '/>' + ctx.terminator);
            }
            self.undent(ctx);
            self.write(ctx, ctx.currentIndent + "</linearGradient>" + ctx.terminator);
        };

        var computeLinearGradientCoordinates = function (gradient, bounds) {
            //TBD: generate a real ID
            var w2 = (bounds.right - bounds.left) / 2,
                h2 = (bounds.bottom - bounds.top) / 2,
                scale = gradient.scale,
                coords;

            // SVG wants the angle in cartesian, not polar, coordinates. 
            var angle = (gradient.angle % 360) * Math.PI / 180.0,
                x1, x2, y1, y2,xa,ya,
                cx = self.round1k(bounds.left + w2),
                cy = self.round1k(bounds.top + h2);

            if (Math.abs(w2 / Math.cos(angle) * Math.sin(angle)) < h2) {
                xa = w2;
                ya = w2 / Math.cos(angle) * Math.sin(angle);
            } else {
                xa = h2 / Math.sin(angle) * Math.cos(angle);
                ya = h2;
            }

            // FIXME: This is a hack to deal with a mistake above that still needs
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

        this.writeGradientOverlay = function (ctx, gradient, rootBounds, gradientID) {

            var omIn = ctx.currentOMNode,
                layerBounds = omIn.shapeBounds,
                bounds,
                coords,
                scale = gradient.scale,
                stops = gradient.stops;

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
            coords = computeLinearGradientCoordinates(gradient, bounds);

            self.writeLinearGradientInternal(ctx, stops, gradientID, scale, coords);
            return gradientID;
        };

        this.writeLinearGradient = function (ctx, gradient, flavor) {
            
            //TBD: generate a real ID
            
            var omIn = ctx.currentOMNode,
                gradientID = svgWriterIDs.getUnique("linear-gradient"),
                bounds = gradient.gradientSpace === "objectBoundingBox" ? omIn.shapeBounds : ctx.svgOM.viewBox,
                coords = computeLinearGradientCoordinates(gradient, bounds),
                scale = gradient.scale,
                stops = gradient.stops;

            self.ctxCapture(ctx, function () {
                self.writeLinearGradientInternal(ctx, stops, gradientID, scale, coords);
            },
            function (out) {
                ctx.omStylesheet.define("linear-gradient" + flavor, omIn.id, gradientID, out, JSON.stringify({ coords: coords, stops: stops, scale: scale }));
            });
            gradientID = ctx.omStylesheet.getDefine(omIn.id, "linear-gradient" + flavor).defnId;
            return gradientID;
        };

        this.writeRadialGradient = function (ctx, gradient, flavor) {
            //TBD: generate a real ID
            var omIn = ctx.currentOMNode,
                gradientID = svgWriterIDs.getUnique("radial-gradient"),
                scale = gradient.scale,
                stops = gradient.stops,
                gradientSpace = gradient.gradientSpace,
                bounds = gradientSpace === "objectBoundingBox" ? omIn.shapeBounds : ctx.svgOM.viewBox,
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
                var iStop,
                    stp,
                    stpOpacity;
                
                self.write(ctx, ctx.currentIndent + "<radialGradient id=\"" + gradientID + "\"");
                self.write(ctx, " gradientUnits=\"userSpaceOnUse\"");
                self.writeAttrIfNecessary(ctx, "cx", cx, "", "");
                self.writeAttrIfNecessary(ctx, "cy", cy, "", "");
                self.writeAttrIfNecessary(ctx, "r", r, "", "");
                self.write(ctx, ">" + ctx.terminator);

                self.indent(ctx);
                
                for (iStop = 0; iStop < stops.length; iStop++) {
                    stp = stops[iStop];
                    stpOpacity = '';
                    
                    if (isFinite(stp.color.a) && stp.color.a !== 1.0) {
                        stpOpacity = ' stop-opacity="' + Math.round(stp.color.a, 2) + '"';
                    }
                    
                    self.write(ctx, ctx.currentIndent + '<stop offset="' + self.round1k(Math.round(stp.position, 2)/100.0 * scale) + '" stop-color="' + self.writeColor(stp.color) + '"' + stpOpacity + '/>' + ctx.terminator);
                }
                self.undent(ctx);
                self.write(ctx, ctx.currentIndent + "</radialGradient>" + ctx.terminator);
            },
            function (out) {
                ctx.omStylesheet.define("radial-gradient" + flavor, omIn.id, gradientID, out, JSON.stringify({ cx: cx, cy: cy, r: r, stops: stops, scale: scale, gradientSpace: gradientSpace }));
            });
            gradientID = ctx.omStylesheet.getDefine(omIn.id, "radial-gradient" + flavor).defnId;
            return gradientID;
        };

        this.writeTextPath = function (ctx, pathData) {
            
            //TBD: generate a real ID
            var omIn = ctx.currentOMNode,
                textPathID = svgWriterIDs.getUnique("text-path");
            
            self.ctxCapture(ctx, function () {
                var iStop,
                    stp;
                
                self.write(ctx, ctx.currentIndent + "<path id=\"" + textPathID + "\" ");
                self.write(ctx, "d=\"" + pathData + "\"/>" + ctx.terminator);
            },
            function (out) {
                ctx.omStylesheet.define("text-path", omIn.id, textPathID, out, JSON.stringify({ pathData: pathData }));
            });
            return textPathID;
        };
        
        this.round1k = function (x) {
            return Math.round( x * 1000 ) / 1000;
        };
        
        this.ifStylesheetDoesNotHaveStyle = function (ctx, node, property, fn) {
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
        
        this.ctxCapture = function (ctx, fnCapture, fnResult) {
            var origBuffer = ctx.sOut,
                resultBuffer;
            ctx.sOut = "";
            fnCapture();
            resultBuffer = ctx.sOut;
            ctx.sOut = origBuffer;
            fnResult(resultBuffer);
        };
        
        this.indentify = function (indent, buf) {
            var out = indent + buf.replace(/(\n)/g, "\n" + indent);
            return out.substr(0, out.length - indent.length);
        };
        
        this.toString = function (ctx) {
            return ctx.sOut;
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
                isArray: Array.isArray || function (obj) {
                    return jQueryLike.type(obj) === "array";
                },
                isWindow: function (obj) {
                    return obj !== null && obj === obj.window;
                },
                isNumeric: function (obj) {
                    return !isNaN(parseFloat(obj)) && isFinite(obj);
                },
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
        
        this.extend = function (deep, target, source) {
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
            if (length === i) {
                target = this;
                --i;
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
                            target[name] = this.extend(deep, clone, copy);
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }
            return target;
        };
        
        this.toBase64 = function (string) {
            var buf = new Buffer(string);
            return buf.toString("base64");
        };
	}

	module.exports = new SVGWriterUtils();
    
}());
     
    