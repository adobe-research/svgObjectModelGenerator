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
/*global define: true, require: true */

/* Help write the SVG */

(function () {
"use strict";
    
    var svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterIDs = require("./svgWriterIDs.js"),
        SVGWriterContext = require("./svgWriterContext.js");

    var write = svgWriterUtils.write,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent,
        writeColor = svgWriterUtils.writeColor,
        round1k = svgWriterUtils.round1k,
        ctxCapture = svgWriterUtils.ctxCapture;
    
    function SVGWriterFx() {
        
        this.hasFx = function (ctx) {
            return (this.hasDropShadow(ctx) || 
                    this.hasGradientOverlay(ctx) || 
                    this.hasColorOverlay(ctx) ||
                    this.hasSatin(ctx) ||
                    this.hasInnerShadow(ctx));
        };
        
        this.scanForUnsupportedFeatures = function (ctx) {
            var omIn = ctx.currentOMNode;
            
            if (omIn.style && omIn.style.fx) {
                if (this.hasEmboss(ctx)) {
                    ctx.errors.push("Bevel and Emboss filter effects are not supported by SVG export.");
                }
                
                if (this.hasPatternOverlay(ctx)) {
                    ctx.errors.push("Pattern Overlay effects are not supported by SVG export.");
                }
            }
            
        };
        
        this.externalizeStyles = function (ctx) {
            
            var omIn = ctx.currentOMNode,
                stroke,
                styleBlock,
                iFx = 0,
                filterFlavor;
            
            if (omIn.style && omIn.style.fx) {

                styleBlock = ctx.omStylesheet.getStyleBlock(omIn);
                
                // Check to see if any of the components actually need to write.
                if (this.hasDropShadow(ctx)) {
                    iFx++;
                    filterFlavor = "drop-shadow";
                }
                if (this.hasOuterGlow(ctx)) {
                    iFx++;
                    filterFlavor = "outer-glow";
                }
                if (this.hasGradientOverlay(ctx)) {
                    iFx++;
                    filterFlavor = "gradient-overlay";
                }
                if (this.hasColorOverlay(ctx)) {
                    iFx++;
                    filterFlavor = "color-overlay";
                }
                if (this.hasSatin(ctx)) {
                    iFx++;
                    filterFlavor = "satin";
                }
                if (this.hasInnerGlow(ctx)) {
                    iFx++;
                    filterFlavor = "inner-glow";
                }
                if (this.hasInnerShadow(ctx)) {
                    iFx++;
                    filterFlavor = "inner-shadow";
                }
                
                // More than one componet is a filter-chain.
                if (iFx > 1) {
                    filterFlavor = "filter-chain";
                }
                
                if (iFx > 0) {
                    omIn._filterflavor = filterFlavor;
                    
                    var filterID = svgWriterIDs.getUnique(filterFlavor),
                        fingerprint = "";

                    ctxCapture(ctx, function () {
                        write(ctx, ctx.currentIndent + "<filter id=\"" + filterID + "\" filterUnits=\"userSpaceOnUse\">" + ctx.terminator);
                        indent(ctx);

                        var param = { pass: "SourceGraphic" };
                        fingerprint += this.externalizeDropShadow(ctx, param);
                        fingerprint += this.externalizeOuterGlow(ctx, param);
                        fingerprint += this.externalizeGradientOverlay(ctx, param);
                        fingerprint += this.externalizeColorOverlay(ctx, param);
                        fingerprint += this.externalizeSatin(ctx, param);
                        fingerprint += this.externalizeInnerGlow(ctx, param);
                        fingerprint += this.externalizeInnerShadow(ctx, param);

                        undent(ctx);
                        write(ctx, ctx.currentIndent + "</filter>" + ctx.terminator);
                    }.bind(this), function (out) {
                        
                        ctx.omStylesheet.define(filterFlavor, omIn.id, filterID, out, fingerprint);
                    }.bind(this));

                    filterID = ctx.omStylesheet.getDefine(omIn.id, filterFlavor).defnId;

                    styleBlock.addRule("filter", "url(#" + filterID + ")");
                }
            }
        };
        
        this.hasPatternOverlay = function (ctx) {
            var omIn = ctx.currentOMNode;
            if (omIn && omIn.style && omIn.style.fx && omIn.style.fx.patternOverlay && omIn.style.fx.patternOverlay.enabled) {
                return true;
            }
            return false;
        };
        
        this.hasEmboss = function (ctx) {
            var omIn = ctx.currentOMNode;
            if (omIn && omIn.style && omIn.style.fx && omIn.style.fx.bevelEmboss && omIn.style.fx.bevelEmboss.enabled) {
                return true;
            }
            return false;
        };
        
        this.hasDropShadow = function (ctx) {
            var omIn = ctx.currentOMNode,
                dropShadow;
            if (omIn && omIn.style && omIn.style.fx) {
                dropShadow = omIn.style.fx.dropShadow;
            
                if (dropShadow && dropShadow.enabled) {
                    return true;
                }
            }
            return false;
        };
        this.externalizeDropShadow = function (ctx, param) {
            var omIn = ctx.currentOMNode,
                dropShadow = omIn.style.fx.dropShadow;
            
            if (!dropShadow || !dropShadow.enabled) {
                return;
            }
            
            var color = dropShadow.color,
                opacity = round1k(dropShadow.opacity),
                distance = dropShadow.distance,
                angle = (dropShadow.useGlobalAngle ? ctx.globalLight.angle : dropShadow.localLightingAngle.value) * Math.PI / 180,
                blur = round1k(Math.sqrt(dropShadow.blur)),
                offset = {
                    x: -Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance
                };
            
            write(ctx, ctx.currentIndent + "<feOffset in=\"SourceAlpha\" dx=\"" + round1k(offset.x) + "\" dy=\"" + round1k(offset.y) + "\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feGaussianBlur result=\"dropShadow\" stdDeviation=\"" + blur + "\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feFlood flood-color=\"" + svgWriterUtils.writeColor(color) + "\" flood-opacity=\"" + opacity + "\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feComposite operator=\"in\" in2=\"dropShadow\"/>" + ctx.terminator);
            param.pass = "dropShadow";
            
            return JSON.stringify({ c: color, o: opacity, off: offset, b: blur });
        };

        this.hasOuterGlow = function (ctx) {
            var omIn = ctx.currentOMNode,
                outerGlow;
            if (omIn && omIn.style && omIn.style.fx) {
                outerGlow = omIn.style.fx.outerGlow;
            
                if (outerGlow && outerGlow.enabled) {
                    return true;
                }
            }
            return false;
        };
        this.externalizeOuterGlow = function (ctx, param) {
            var omIn = ctx.currentOMNode,
                outerGlow = omIn.style.fx.outerGlow;
            if (!outerGlow || !outerGlow.enabled) {
                if (param.pass == "dropShadow") {
                    write(ctx, ctx.currentIndent + "<feComposite in=\"SourceGraphic\" result=\"dropShadow\"/>" + ctx.terminator);
                }
                return;
            }

            // There is no particular reason. It just looks correct with the 3 compositing operations
            // and setting "Contur" to "Half-round".
            var blur = round1k(outerGlow.blur / 3),
                opacity = round1k(outerGlow.opacity);

            write(ctx, ctx.currentIndent + "<feGaussianBlur stdDeviation=\"" + blur + "\" in=\"SourceAlpha\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feComposite/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feComposite/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feComposite result=\"outerGlowBlur\"/>" + ctx.terminator);
            if (outerGlow.gradient) {
                var nSegs = this.findMatchingDistributedNSegs(outerGlow.gradient.stops);
                var colors = this.calcDistributedColors(outerGlow.gradient.stops, nSegs);
                // Inverse colors.
                write(ctx, ctx.currentIndent + "<feColorMatrix type=\"matrix\" values=\"-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0\"/>" + ctx.terminator);
                // Set RGB channels to A.
                write(ctx, ctx.currentIndent + "<feColorMatrix type=\"matrix\" values=\"0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 0\"/>" + ctx.terminator);
                write(ctx, ctx.currentIndent + "<feColorMatrix type=\"matrix\" values=\"-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0\"/>" + ctx.terminator);
                // Gradient map.
                this.createGradientMap(ctx, colors);
            } else {
                var color = outerGlow.color;
                write(ctx, ctx.currentIndent + "<feFlood flood-color=\"" + svgWriterUtils.writeColor(color) + "\" flood-opacity=\"" + opacity + "\"/>" + ctx.terminator);
                write(ctx, ctx.currentIndent + "<feComposite operator=\"in\" in2=\"outerGlowBlur\"/>" + ctx.terminator);
            }
            if (param.pass == "dropShadow") {
                if (omIn.style.fx.dropShadow) {
                    write(ctx, ctx.currentIndent + "<feBlend mode=\"" + omIn.style.fx.dropShadow.mode + "\" in2=\"" + param.pass + "\"/>" + ctx.terminator);
                }
            }
            write(ctx, ctx.currentIndent + "<feComposite in=\"SourceGraphic\" result=\"outerGlow\"/>" + ctx.terminator);
            param.pass = "outerGlow";

            return JSON.stringify({ c: outerGlow.color, g: outerGlow.gradient, o: opacity, b: blur });
        };

        this.hasGradientOverlay = function (ctx) {
            var omIn = ctx.currentOMNode,
                gradientFill;
            
            if (omIn && omIn.style && omIn.style.fx) {
                gradientFill = omIn.style.fx.gradientFill;
                if (gradientFill && gradientFill.enabled) {
                    return true;
                }
            }
            return false;
        };
        this.externalizeGradientOverlay = function (ctx, param) {
            var omIn = ctx.currentOMNode,
                gradientFill = omIn.style.fx.gradientFill,
                bounds = omIn.shapeBounds,
                pseudoCtx = new SVGWriterContext(omIn),
                opacity;

            if (!gradientFill || !gradientFill.enabled) {
                return;
            }
            opacity = round1k(gradientFill.opacity.value / 100);

            svgWriterUtils.writeGradientOverlay(pseudoCtx, gradientFill.gradient, ctx.svgOM.viewBox, 'grad');

            var string = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"' +
                ' width="' + (bounds.right - bounds.left) + '" height="' + (bounds.bottom - bounds.top) + '">' +
                pseudoCtx.sOut + '<rect width="100%" height="100%"';
            if (opacity != 1) {
                string += ' opacity="' + opacity + '"';
            }
            string += ' fill="url(#grad)"/></svg>';
            var base64 = svgWriterUtils.toBase64(string);

            write(ctx, ctx.currentIndent + "<feImage x=\"" + bounds.left + "\" y=\"" + bounds.top + "\"" +
                ' preserveAspectRatio="none"' +
                ' width="' + (bounds.right - bounds.left) + '" height="' + (bounds.bottom - bounds.top) + '"' +
                ' xlink:href="data:image/svg+xml;base64,' + base64 + '"/>' + ctx.terminator);
            write(ctx, ctx.currentIndent + '<feComposite operator="in" in2="SourceGraphic"/>' + ctx.terminator);
            write(ctx, ctx.currentIndent + '<feBlend mode="' + gradientFill.mode + '" in2="' + param.pass + '" result="gradientFill"/>' + ctx.terminator);
            param.pass = 'gradientFill';
            
            return JSON.stringify({ l: bounds.left, r: bounds.right, t: bounds.top, b: bounds.bottom, mo: gradientFill.mode, base: base64 });
        };

        this.hasColorOverlay = function (ctx) {
            var omIn = ctx.currentOMNode,
                solidFill;
            if (omIn && omIn.style && omIn.style.fx) {
                solidFill = omIn.style.fx.solidFill
                if (solidFill && solidFill.enabled) {
                    return true;
                }
            }
            return false;
        };
        this.externalizeColorOverlay = function (ctx, param) {
            var omIn = ctx.currentOMNode,
                solidFill = omIn.style.fx.solidFill;
            if (!solidFill || !solidFill.enabled) {
                return;
            }

            var color = solidFill.color,
                opacity = round1k(solidFill.opacity.value / 100);

            write(ctx, ctx.currentIndent + "<feFlood flood-color=\"" + svgWriterUtils.writeColor(color) + "\" flood-opacity=\"" + opacity + "\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feComposite operator=\"in\" in2=\"SourceGraphic\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feBlend mode=\"" + solidFill.mode + "\" in2=\"" + param.pass + "\" result=\"colorOverlay\"/>" + ctx.terminator);
            param.pass = "colorOverlay";

            return JSON.stringify({ c: color, m: solidFill.mode, o: opacity});
        };

        this.hasSatin = function (ctx) {
            var omIn = ctx.currentOMNode,
                satin;
            if (omIn && omIn.style && omIn.style.fx) {
                satin = omIn.style.fx.chromeFX
                if (satin && satin.enabled) {
                    return true;
                }
            }
            return false;
        };

        this.externalizeSatin = function (ctx, param) {
            var omIn = ctx.currentOMNode,
                satin = omIn.style.fx.chromeFX;
            if (!satin || !satin.enabled) {
                return;
            }
            var color = satin.color,
                opacity = round1k(satin.opacity.value / 100),
                dx = round1k(satin.distance * Math.cos(satin.localLightingAngle.value)),
                dy = round1k(satin.distance * Math.sin(satin.localLightingAngle.value)),
                blur = round1k(Math.sqrt(satin.blur));

            write(ctx, ctx.currentIndent + "<feFlood flood-color=\"" + svgWriterUtils.writeColor(color) + "\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feComposite operator=\"in\" in2=\"SourceAlpha\" result=\"snSilhouette\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feOffset in=\"snSilhouette\" dx=\"" + dx + "\" dy=\"" + dy + "\" result=\"snShifted1\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feOffset in=\"snSilhouette\" dx=\"" + -dx + "\" dy=\"" + -dy + "\" result=\"snShifted2\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feComposite operator=\"xor\" in=\"snShifted1\" in2=\"snShifted2\"/>" + ctx.terminator);
            if (satin.invert) {
                write(ctx, ctx.currentIndent + "<feComposite operator=\"xor\" in2=\"snSilhouette\"/>" + ctx.terminator);                
            }
            write(ctx, ctx.currentIndent + "<feComposite operator=\"in\" in2=\"SourceAlpha\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feGaussianBlur stdDeviation=\"" + blur + "\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feComponentTransfer>" + ctx.terminator);
            indent(ctx);
            write(ctx, ctx.currentIndent + "<feFuncA type=\"linear\" slope=\"" + opacity + "\"/>" + ctx.terminator);
            undent(ctx);
            write(ctx, ctx.currentIndent + "</feComponentTransfer>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feComposite operator=\"in\" in2=\"SourceAlpha\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feBlend mode=\"" + satin.mode + "\" in2=\"" + param.pass + "\" result=\"satin\"/>" + ctx.terminator);
            param.pass = "satin";

            return JSON.stringify({m: satin.mode, c: color, o: opacity, b: blur, dx: dx, dy: dy});
        };


        this.hasInnerGlow = function (ctx) {
            var omIn = ctx.currentOMNode,
                innerGlow;
            if (omIn && omIn.style && omIn.style.fx) {
                innerGlow = omIn.style.fx.innerGlow;
                if (innerGlow && innerGlow.enabled) {
                    return true;
                }
            }
            return false;
        };
        this.externalizeInnerGlow = function (ctx, param) {
            var omIn = ctx.currentOMNode,
                innerGlow = omIn.style.fx.innerGlow;
            if (!innerGlow || !innerGlow.enabled) {
                return;
            }

            // There is no particular reason. It just looks correct with the 3 compositing operations
            // and setting "Contur" to "Half-round".
            var blur = round1k(innerGlow.blur / 3),
                opacity = round1k(innerGlow.opacity);

            write(ctx, ctx.currentIndent + "<feGaussianBlur stdDeviation=\"" + blur + "\" in=\"SourceAlpha\" result=\"innerGlowBlur\"/>" + ctx.terminator);
            if (innerGlow.gradient) {
                var nSegs = this.findMatchingDistributedNSegs(innerGlow.gradient.stops);
                var colors = this.calcDistributedColors(innerGlow.gradient.stops, nSegs);
                // Inverse colors.
                write(ctx, ctx.currentIndent + "<feColorMatrix type=\"matrix\" values=\"-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0\"/>" + ctx.terminator);
                // Set RGB channels to A.
                write(ctx, ctx.currentIndent + "<feColorMatrix type=\"matrix\" values=\"0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 1 0\"/>" + ctx.terminator);
                write(ctx, ctx.currentIndent + "<feColorMatrix type=\"matrix\" values=\"-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0\"/>" + ctx.terminator);
                // Gradient map.
                this.createGradientMap(ctx, colors);
            } else {
                var color = innerGlow.color;
                write(ctx, ctx.currentIndent + "<feFlood flood-color=\"" + svgWriterUtils.writeColor(color) + "\" flood-opacity=\"" + opacity + "\"/>" + ctx.terminator);
                write(ctx, ctx.currentIndent + "<feComposite operator=\"out\" in2=\"innerGlowBlur\"/>" + ctx.terminator);
            }
            write(ctx, ctx.currentIndent + "<feComposite operator=\"in\" in2=\"SourceAlpha\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feBlend mode=\"" + innerGlow.mode + "\" in2=\"" + param.pass + "\" result=\"innerGlow\"/>" + ctx.terminator);
            param.pass = "innerGlow";

            return JSON.stringify({ c: innerGlow.color, g: innerGlow.gradient, o: opacity, b: blur });
        };

        this.hasInnerShadow = function (ctx) {
            var omIn = ctx.currentOMNode,
                innerShadow;
            if (omIn && omIn.style && omIn.style.fx) {
                innerShadow = omIn.style.fx.innerShadow;
                if (innerShadow && innerShadow.enabled) {
                    return true;
                }
            }
            return false;
        };
        this.externalizeInnerShadow = function (ctx, param) {
            var omIn = ctx.currentOMNode,
                innerShadow = omIn.style.fx.innerShadow;
            if (!innerShadow || !innerShadow.enabled) {
                return;
            }
            var color = innerShadow.color,
                opacity = round1k(innerShadow.opacity),
                distance = innerShadow.distance,
                angle = (innerShadow.useGlobalAngle ? ctx.globalLight.angle : innerShadow.localLightingAngle.value) * Math.PI / 180,
                blur = round1k(Math.sqrt(innerShadow.blur)),
                offset = {
                    x: -Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance
                };

            write(ctx, ctx.currentIndent + '<feOffset in="SourceAlpha" dx="' + round1k(offset.x) + '" dy="' + round1k(offset.y) + '"/>' + ctx.terminator);
            write(ctx, ctx.currentIndent + '<feGaussianBlur result="innerShadowBlur" stdDeviation="' + blur + '"/>' + ctx.terminator);
            write(ctx, ctx.currentIndent + '<feFlood flood-color="' + svgWriterUtils.writeColor(color) + '" flood-opacity="' + opacity + '"/>' + ctx.terminator);
            write(ctx, ctx.currentIndent + '<feComposite operator="out" in2="innerShadowBlur"/>' + ctx.terminator);
            write(ctx, ctx.currentIndent + '<feComposite operator="in" in2="SourceAlpha"/>' + ctx.terminator);
            write(ctx, ctx.currentIndent + '<feBlend mode="' + innerShadow.mode + '" in2="' + param.pass + '" result="innerShadow"/>' + ctx.terminator);
            param.pass = "innerShadow";

            return JSON.stringify({m: innerShadow.mode, c: color, o: opacity, b: blur, off: offset});
        };
        
        this.addFxAttr = function (ctx) {
            var node = ctx.currentOMNode;
            //see what we have...
            if (node._filterflavor && !ctx.hasWritten(node, node._filterflavor + "-attr")) {
                ctx.didWrite(node, node._filterflavor + "-attr");
                var overlayDefn = ctx.omStylesheet.getDefine(node.id, node._filterflavor);
                if (overlayDefn) {
                    write(ctx, " filter=\"url(#" + overlayDefn.defnId + ")\"");
                }
            }
        };

        // This is borrowed from gradientmaps.js
        // https://github.com/awgreenblatt/gradientmaps/blob/master/gradientmaps.js
        this.findMatchingDistributedNSegs = function (stops) {
            var maxNumSegs = 100;
            var matched = false;
            for (var nSegs = 1; !matched && nSegs <= maxNumSegs; nSegs++) {
                var segSize = maxNumSegs / nSegs;
                matched = true;
                for (var i = 1; i < stops.length-1; i++) {
                    var pos = stops[i].position;
                    if (pos < segSize) {
                        matched = false;
                        break;
                    }
                    var rem = pos % segSize;
                    var maxDiff = 1.0;
                    if (!(rem < maxDiff || (segSize - rem) < maxDiff)) {
                        matched = false;
                        break;
                    }
                }
        
                if (matched)
                    return nSegs;
            }       
        
            return nSegs; 
        };

        this.calcDistributedColors = function (stops, nSegs) {
            var colors = new Array(nSegs);
            colors[0] = stops[0].color;
        
            var segSize = 100 / nSegs;
            for (var i = 1; i < stops.length-1; i++) {
                var stop = stops[i];
                var n = Math.round(stop.position / segSize);
                colors[n] = stop.color;
            }
            colors[nSegs] = stops[stops.length-1].color;

            var i = 1;
            while (i < colors.length) {
                if (!colors[i]) {
                    for (var j = i+1; j < colors.length; j++) {
                        if (colors[j])
                            break;
                    }
        
                    // Need to evenly distribute colors stops from svgStop[i-1] to svgStop[j]
                    var startColor = colors[i-1];
                    var r = startColor.r;
                    var g = startColor.g;
                    var b = startColor.b;
                    var a = startColor.a;
        
                    var endColor = colors[j];
        
                    var nSegs = j - i + 1;
                    var dr = (endColor.r - r) / nSegs;
                    var dg = (endColor.g - g) / nSegs;
                    var db = (endColor.b - b) / nSegs;
                    var da = (endColor.a - a) / nSegs;
                    while (i < j) {
                        r += dr;
                        g += dg;
                        b += db;
                        a += da;
                        colors[i] = { "r": r, "g": g, "b": b, "a": a };
                        i++;
                    }
                }
                i++;
            }
            return colors;
        };

        this.createGradientMap = function (ctx, colors) {        
            var redTableValues = "";
            var greenTableValues = "";
            var blueTableValues = "";
            var alphaTableValues = "";
        
            colors.forEach(function(color, index, colors) {
                redTableValues += (color.r / 255.0 + " ");
                greenTableValues += (color.g / 255.0 + " ");
                blueTableValues += (color.b / 255.0 + " ");
                alphaTableValues += (color.a + " ");
            });

            if (!String.prototype.trim) {  
                String.prototype.trim = function () {  
                    return this.replace(/^\s+|\s+$/g,'');  
                };  
            }

            write(ctx, ctx.currentIndent + "<feComponentTransfer color-interpolation-filters=\"sRGB\">" + ctx.terminator);
            indent(ctx);
            write(ctx, ctx.currentIndent + "<feFuncR type=\"table\" tableValues=\"" + redTableValues.trim() + "\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feFuncG type=\"table\" tableValues=\"" + greenTableValues.trim() + "\"/>" + ctx.terminator);
            write(ctx, ctx.currentIndent + "<feFuncB type=\"table\" tableValues=\"" + blueTableValues.trim() + "\"/>" + ctx.terminator);
            undent(ctx);
            write(ctx, ctx.currentIndent + "</feComponentTransfer>" + ctx.terminator);        
        };
	}

	module.exports = new SVGWriterFx();
    
}());


