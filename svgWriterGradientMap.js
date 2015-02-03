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
/*global define: true, require: true */

/* Help write the SVG */

(function () {
"use strict";

    var svgWriterUtils = require("./svgWriterUtils.js");

    var write = svgWriterUtils.write,
        writeln = svgWriterUtils.writeln,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent;

    // This is borrowed from gradientmaps.js
    // https://github.com/awgreenblatt/gradientmaps/blob/master/gradientmaps.js
    function SVGWriterGradientMap() {

        var findMatchingDistributedNSegs = function (stops) {
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
        
                if (matched) {
                    return nSegs;
                }
            }       
        
            return nSegs; 
        };

        var calcDistributedColors = function (stops, nSegs) {
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
                        colors[i] = { 'r': r, 'g': g, 'b': b, 'a': a };
                        i++;
                    }
                }
                i++;
            }
            return colors;
        };

        this.createGradientMap = function (ctx, stops) {
            var nSegs = findMatchingDistributedNSegs(stops),
                colors = calcDistributedColors(stops, nSegs),
                redTableValues = '',
                greenTableValues = '',
                blueTableValues = '',
                alphaTableValues = '';
        
            colors.forEach(function(color, index, colors) {
                redTableValues += (svgWriterUtils.round10k(color.r / 255) + ' ');
                greenTableValues += (svgWriterUtils.round10k(color.g / 255) + ' ');
                blueTableValues += (svgWriterUtils.round10k(color.b / 255) + ' ');
                alphaTableValues += (color.a + ' ');
            });

            if (!String.prototype.trim) {  
                String.prototype.trim = function () {  
                    return this.replace(/^\s+|\s+$/g,'');  
                };  
            }

            writeln(ctx, ctx.currentIndent + '<feComponentTransfer color-interpolation-filters="sRGB">');
            indent(ctx);
            writeln(ctx, ctx.currentIndent + '<feFuncR type="table" tableValues="' + redTableValues.trim() + '"/>');
            writeln(ctx, ctx.currentIndent + '<feFuncG type="table" tableValues="' + greenTableValues.trim() + '"/>');
            writeln(ctx, ctx.currentIndent + '<feFuncB type="table" tableValues="' + blueTableValues.trim() + '"/>');
            undent(ctx);
            writeln(ctx, ctx.currentIndent + '</feComponentTransfer>');        
        };
    }

    module.exports = SVGWriterGradientMap;
}());
