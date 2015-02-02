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
        writeln = svgWriterUtils.writeln,
        writeAttrIfNecessary = svgWriterUtils.writeAttrIfNecessary,
        writeFeFlood = svgWriterUtils.writeFeFlood,
        writeFeBlend = svgWriterUtils.writeFeBlend,
        writeFeComposite = svgWriterUtils.writeFeComposite,
        writeFeGauss = svgWriterUtils.writeFeGauss,
        writeFeInvert = svgWriterUtils.writeFeInvert,
        writeFeLuminance = svgWriterUtils.writeFeLuminance,
        writeFeOffset = svgWriterUtils.writeFeOffset,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent,
        writeColor = svgWriterUtils.writeColor,
        round1k = svgWriterUtils.round1k,
        ctxCapture = svgWriterUtils.ctxCapture;
    
    function SVGWriterFx() {
        
        this.hasFx = function (ctx) {
            return (this.hasEffect(ctx, 'dropShadow') ||
                    this.hasEffect(ctx, 'gradientFill', this.hasColorNoise) || 
                    this.hasEffect(ctx, 'solidFill') ||
                    this.hasEffect(ctx, 'chromeFX') ||
                    this.hasEffect(ctx, 'innerShadow'));
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
                if (this.hasEffect(ctx, 'dropShadow')) {
                    iFx++;
                    filterFlavor = "drop-shadow";
                }
                if (this.hasOuterGlow(ctx)) {
                    iFx++;
                    filterFlavor = "outer-glow";
                }
                if (this.hasEffect(ctx, 'gradientFill', this.hasColorNoise)) {
                    iFx++;
                    filterFlavor = "gradient-overlay";
                }
                if (this.hasEffect(ctx, 'solidFill')) {
                    iFx++;
                    filterFlavor = "color-overlay";
                }
                if (this.hasEffect(ctx, 'chromeFX')) {
                    iFx++;
                    filterFlavor = "satin";
                }
                if (this.hasInnerGlow(ctx)) {
                    iFx++;
                    filterFlavor = "inner-glow";
                }
                if (this.hasEffect(ctx, 'innerShadow')) {
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
                        writeln(ctx, ctx.currentIndent + "<filter id=\"" + filterID + "\" filterUnits=\"userSpaceOnUse\">");
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
                        writeln(ctx, ctx.currentIndent + "</filter>");
                    }.bind(this), function (out) {
                        
                        ctx.omStylesheet.define(filterFlavor, omIn.id, filterID, out, fingerprint);
                    }.bind(this));

                    filterID = ctx.omStylesheet.getDefine(omIn.id, filterFlavor).defnId;

                    styleBlock.addRule("filter", "url(#" + filterID + ")");
                }
            }
        };

        this.hasColorNoise = function (ele) {
            return ele.gradient.gradientForm !== 'colorNoise';
        }

        this.hasEffect = function (ctx, effect, custom) {
            var omIn = ctx.currentOMNode;

            effect += 'Multi';
            if (omIn && omIn.style && omIn.style.fx && omIn.style.fx[effect]) {
                return omIn.style.fx[effect].some(function(ele) {
                    if (custom) {
                        return ele.enabled && custom(ele);
                    }
                    return ele.enabled;
                });
            }
            return false;
        }
        
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

        this.externalizeDropShadow = function (ctx, param) {
            if (!this.hasEffect(ctx, 'dropShadow')) {
                return;
            }

            var omIn = ctx.currentOMNode,
                dropShadowMulti = omIn.style.fx.dropShadowMulti,
                specifies = [];

            function writeDropShadow(ctx, dropShadow, ind) {
                var color = dropShadow.color,
                    opacity = round1k(dropShadow.opacity),
                    distance = dropShadow.distance,
                    angle = (dropShadow.useGlobalAngle ? ctx.globalLight.angle : dropShadow.localLightingAngle.value) * Math.PI / 180,
                    blur = round1k(Math.sqrt(dropShadow.blur)),
                    offset = {
                        x: -Math.cos(angle) * distance,
                        y: Math.sin(angle) * distance
                    };

                writeFeOffset(ctx, offset, {in1: 'SourceAlpha'});
                writeFeGauss(ctx, blur, {result: 'dropBlur' + ind});
                writeFeFlood(ctx, color, opacity);
                writeFeComposite(ctx, 'in', {in2: 'dropBlur' + ind, result: 'dropShadowComp' + ind});

                return { c: color, o: opacity, off: offset, b: blur, i: ind, m: dropShadow.mode};
            }
            
            dropShadowMulti.forEach(function (ele) {
                if (!ele.enabled) {
                    return;
                }
                var num = specifies.length,
                    ind = num ? '-' + num : '',
                    input = param.pass;

                specifies.push(writeDropShadow(ctx, ele, ind));
                param.pass = num > 0 ? 'dropShadowBlend' + ind : 'dropShadowComp';

                if (num) {
                    writeFeBlend(ctx, ele.mode, {in2: input, result: param.pass});
                }
            });
            
            return JSON.stringify(specifies);
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
                if (param.pass.substr(0, 10) == 'dropShadow') {
                    writeFeComposite(ctx, 'over', {in1: 'SourceGraphic', result: 'dropShadow'});
                    param.pass = 'dropShadow';
                }
                return;
            }

            // There is no particular reason. It just looks correct with the 3 compositing operations
            // and setting "Contur" to "Half-round".
            var blur = round1k(outerGlow.blur / 3),
                opacity = round1k(outerGlow.opacity);

            writeFeGauss(ctx, blur, {in1: 'SourceAlpha'});
            writeFeComposite(ctx);
            writeFeComposite(ctx);
            writeFeComposite(ctx, 'over', {result: 'outerGlowBlur'});
            if (outerGlow.gradient) {
                var nSegs = this.findMatchingDistributedNSegs(outerGlow.gradient.stops);
                var colors = this.calcDistributedColors(outerGlow.gradient.stops, nSegs);
                // Inverse colors.
                writeFeInvert(ctx);
                // Set RGB channels to A.
                writeFeLuminance(ctx);
                writeFeInvert(ctx);
                // Gradient map.
                this.createGradientMap(ctx, colors);
            } else {
                writeFeFlood(ctx, outerGlow.color, opacity);
                writeFeComposite(ctx, 'in', {in2: 'outerGlowBlur'});
            }
            if (param.pass.substr(0, 10) == "dropShadow") {
                writeFeBlend(ctx, omIn.style.fx.outerGlow.mode, {in2: param.pass});
            }
            writeFeComposite(ctx, 'over', {in1: 'SourceGraphic', result: 'outerGlow'});
            param.pass = "outerGlow";

            return JSON.stringify({ c: outerGlow.color, g: outerGlow.gradient, o: opacity, b: blur });
        };

        this.externalizeGradientOverlay = function (ctx, param) {
            if (!this.hasEffect(ctx, 'gradientFill', this.hasColorNoise)) {
                return false;
            }

            var omIn = ctx.currentOMNode,
                gradientFillMulti = omIn.style.fx.gradientFillMulti,
                self = this,
                specifies = [];

            function writeGradientFill (ctx, gradientFill) {
                var omIn = ctx.currentOMNode,
                    bounds = omIn.shapeBounds,
                    pseudoCtx = new SVGWriterContext(omIn),
                    opacity = round1k(gradientFill.opacity);

                svgWriterUtils.writeGradientOverlay(pseudoCtx, gradientFill.gradient, ctx.svgOM.viewBox, 'grad');

                var string = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"' +
                    ' width="' + (bounds.right - bounds.left) + '" height="' + (bounds.bottom - bounds.top) + '">' +
                    pseudoCtx.sOut + '<rect width="100%" height="100%"',
                    base64;

                if (opacity != 1) {
                    string += ' opacity="' + opacity + '"';
                }
                string += ' fill="url(#grad)"/></svg>';
                base64 = svgWriterUtils.toBase64(string);

                write(ctx, ctx.currentIndent + '<feImage');
                writeAttrIfNecessary(ctx, 'x', bounds.left);
                writeAttrIfNecessary(ctx, 'y', bounds.top);
                writeAttrIfNecessary(ctx, 'width', bounds.right - bounds.left);
                writeAttrIfNecessary(ctx, 'height', bounds.bottom - bounds.top);
                writeAttrIfNecessary(ctx, 'preserveAspectRatio', 'none');               
                writeAttrIfNecessary(ctx, 'xlink:href', 'data:image/svg+xml;base64,' + base64);
                writeln(ctx, '/>');
                writeFeComposite(ctx, 'in', {in2: 'SourceGraphic'});
                
                return { l: bounds.left, r: bounds.right, t: bounds.top, b: bounds.bottom, mo: gradientFill.mode, base: base64 };
            }

            gradientFillMulti.forEach(function (ele) {
                if (!ele.enabled || !self.hasColorNoise(ele)) {
                    return;
                }
                var num = specifies.length,
                    ind = num ? '-' + num : '',
                    input = param.pass;

                specifies.push(writeGradientFill(ctx, ele));
                param.pass = 'gradientFill' + ind;
                writeFeBlend(ctx, ele.mode, {in2: input, result: param.pass});
            });

            return JSON.stringify(specifies);
        };

        this.externalizeColorOverlay = function (ctx, param) {
            if (!this.hasEffect(ctx, 'solidFill')) {
                return;
            }

            var omIn = ctx.currentOMNode,
                solidFillMulti = omIn.style.fx.solidFillMulti,
                specifies = [];

            function writeColorOverlay(ctx, solidFill) {
                var color = solidFill.color,
                    opacity = round1k(solidFill.opacity);

                writeFeFlood(ctx, color, opacity);
                writeFeComposite(ctx, 'in', {in2: 'SourceGraphic'});
                return { c: color, o: opacity, m: solidFill.mode};
            }

            solidFillMulti.forEach(function (ele) {
                if (!ele.enabled) {
                    return;
                }
                var num = specifies.length,
                    ind = num ? '-' + num : '',
                    input = param.pass;

                param.pass = 'colorOverlay' + ind;
                specifies.push(writeColorOverlay(ctx, ele));
                writeFeBlend(ctx, ele.mode, {in2: input, result: param.pass});
            });

            return JSON.stringify(specifies);
        };

        this.externalizeSatin = function (ctx, param) {
            if (!this.hasEffect(ctx, 'chromeFX')) {
                return;
            }

            var omIn = ctx.currentOMNode,
                chromeFXMulti = omIn.style.fx.chromeFXMulti,
                specifies = [];

            function writeChromeFX (ctx, satin, ind) {
                var color = satin.color,
                    opacity = round1k(satin.opacity),
                    offset = {
                        x: round1k(satin.distance * Math.cos(-satin.localLightingAngle.value)),
                        y: round1k(satin.distance * Math.sin(-satin.localLightingAngle.value))
                    },
                    blur = round1k(Math.sqrt(satin.blur));

                writeFeFlood(ctx, color);
                writeFeComposite(ctx, 'in', {in2: 'SourceAlpha', result: 'snSilhouette' + ind});
                writeFeOffset(ctx, offset, {in1: 'snSilhouette' + ind, result: 'snShifted1' + ind});
                writeFeOffset(ctx, { x: -offset.x, y: -offset.y }, {in1: 'snSilhouette' + ind, result: 'snShifted2' + ind});
                writeFeComposite(ctx, 'xor', {in1: 'snShifted1' + ind, in2: 'snShifted2' + ind});
                if (satin.invert) {
                    writeFeComposite(ctx, 'xor', {in2: 'snSilhouette' + ind});
                }
                writeFeComposite(ctx, 'in', {in2: 'SourceAlpha'});
                writeFeGauss(ctx, blur);
                writeln(ctx, ctx.currentIndent + '<feComponentTransfer>');
                indent(ctx);
                writeln(ctx, ctx.currentIndent + '<feFuncA type="linear" slope="' + opacity + '"/>');
                undent(ctx);
                writeln(ctx, ctx.currentIndent + '</feComponentTransfer>');
                writeFeComposite(ctx, 'in', {in2: 'SourceAlpha'});

                return {m: satin.mode, c: color, o: opacity, b: blur, offset: offset};
            }

            chromeFXMulti.forEach(function (ele) {
                if (!ele.enabled) {
                    return;
                }
                var num = specifies.length,
                    ind = num ? '-' + num : '',
                    input = param.pass;

                param.pass = 'satin' + ind;
                specifies.push(writeChromeFX(ctx, ele, ind));
                writeFeBlend(ctx, ele.mode, {in2: input, result: param.pass});
            });

            return JSON.stringify(specifies);
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

            writeFeGauss(ctx, blur, {in1: 'SourceAlpha', result: 'innerGlowBlur'});
            if (innerGlow.gradient) {
                var gradient = innerGlow.gradient,
                    nSegs,
                    colors;

                // Reverse gradient. The luminance for inner shadows is inverse to outer shadows.
                gradient.stops.reverse().forEach(function(ele) {
                    ele.position = Math.abs(ele.position - 100);
                });

                nSegs = this.findMatchingDistributedNSegs(gradient.stops);
                colors = this.calcDistributedColors(gradient.stops, nSegs);
                // Inverse colors.
                writeFeInvert(ctx);
                // Set RGB channels to A.
                writeFeLuminance(ctx);
                writeFeInvert(ctx);
                // Gradient map.
                this.createGradientMap(ctx, colors);
            } else {
                var color = innerGlow.color;
                writeFeFlood(ctx, color, opacity);
                writeFeComposite(ctx, 'out', {in2: 'innerGlowBlur'});
            }
            writeFeComposite(ctx, 'in', {in2: 'SourceAlpha'});
            writeFeBlend(ctx, innerGlow.mode, {in2: param.pass, result: 'innerGlow'});
            param.pass = "innerGlow";

            return JSON.stringify({ c: innerGlow.color, g: innerGlow.gradient, o: opacity, b: blur });
        };

        this.externalizeInnerShadow = function (ctx, param) {
            if (!this.hasEffect(ctx, 'innerShadow')) {
                return false;
            }
            var omIn = ctx.currentOMNode,
                innerShadowMulti = omIn.style.fx.innerShadowMulti,
                specifies = [];

            function writeInnerShadow (ctx, innerShadow, ind) {
                var color = innerShadow.color,
                    opacity = round1k(innerShadow.opacity),
                    distance = innerShadow.distance,
                    angle = (innerShadow.useGlobalAngle ? ctx.globalLight.angle : innerShadow.localLightingAngle.value) * Math.PI / 180,
                    blur = round1k(Math.sqrt(innerShadow.blur)),
                    offset = {
                        x: -Math.cos(angle) * distance,
                        y: Math.sin(angle) * distance
                    };

                writeFeOffset(ctx, offset, {in1: 'SourceAlpha'});
                writeFeGauss(ctx, blur, {result: 'innerShadowBlur' + ind});
                writeFeFlood(ctx, color, opacity);
                writeFeComposite(ctx, 'out', {in2: 'innerShadowBlur' + ind});
                writeFeComposite(ctx, 'in', {in2: 'SourceAlpha'});

                return {m: innerShadow.mode, c: color, o: opacity, b: blur, off: offset};
            }

            innerShadowMulti.forEach(function (ele) {
                if (!ele.enabled) {
                    return;
                }
                var num = specifies.length,
                    ind = num ? '-' + num : '',
                    input = param.pass;

                specifies.push(writeInnerShadow(ctx, ele, ind));
                param.pass = 'innerShadow' + ind;
                writeFeBlend(ctx, ele.mode, {in2: input, result: param.pass});
            });

            return JSON.stringify(specifies);
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
                redTableValues += (svgWriterUtils.round10k(color.r / 255) + " ");
                greenTableValues += (svgWriterUtils.round10k(color.g / 255) + " ");
                blueTableValues += (svgWriterUtils.round10k(color.b / 255) + " ");
                alphaTableValues += (color.a + " ");
            });

            if (!String.prototype.trim) {  
                String.prototype.trim = function () {  
                    return this.replace(/^\s+|\s+$/g,'');  
                };  
            }

            writeln(ctx, ctx.currentIndent + "<feComponentTransfer color-interpolation-filters=\"sRGB\">");
            indent(ctx);
            writeln(ctx, ctx.currentIndent + "<feFuncR type=\"table\" tableValues=\"" + redTableValues.trim() + "\"/>");
            writeln(ctx, ctx.currentIndent + "<feFuncG type=\"table\" tableValues=\"" + greenTableValues.trim() + "\"/>");
            writeln(ctx, ctx.currentIndent + "<feFuncB type=\"table\" tableValues=\"" + blueTableValues.trim() + "\"/>");
            undent(ctx);
            writeln(ctx, ctx.currentIndent + "</feComponentTransfer>");        
        };
	}

	module.exports = new SVGWriterFx();
    
}());


