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
        writeAttrIfNecessary = svgWriterUtils.writeAttrIfNecessary,
        writeClassIfNeccessary = svgWriterUtils.writeClassIfNeccessary,
        writePositionIfNecessary = svgWriterUtils.writePositionIfNecessary,
        encodedText = svgWriterUtils.encodedText,
        ctxCapture = svgWriterUtils.ctxCapture;

    var matchAfterDash = /-.*$/,
        matchAllSpaces = /\s/g

        
    function scanForUnsupportedFeatures(ctx) {
        var omIn = ctx.currentOMNode;

        if (omIn.type === "text") {
            if (!ctx._issuedTextWarning && ctx.errors) {
                ctx._issuedTextWarning = true;
                ctx.errors.push("Fonts may render inconsistently and text wrapping is unsupported which can result in clipped text. Convert text to a shape to maintain fidelity.");
            }
        }
    }

    function iseq(name, val1, val2) {
        if (name == "font-family") {
            val1 = val1.replace(matchAfterDash, "").replace(matchAllSpaces, "").toLowerCase();
            val2 = val2.replace(matchAfterDash, "").replace(matchAllSpaces, "").toLowerCase();
        }
        return val1 == val2;
    }
    function compareStyles(st1, st2) {
        if (!st1) {
            return;
        }
        var eq = 0,
            s2 = {};
        for (i = 0, ii = st2.rules.length; i < ii; i++) {
            s2[st2.rules[i].propertyName] = st2.rules[i].value;
        }
        for (var i = 0, ii = st1.rules.length; i < ii; i++) {
            var prop = st1.rules[i].propertyName;
            if (prop in s2) {
               eq += iseq(prop, st1.rules[i].value, s2[prop]);
            } else {
                return;
            }
        }
        return eq;
    }
    function simpleClone(o) {
        var c = {};
        for (var prop in o) {
            c[prop] = o[prop];
        }
        return c;
    }
    function run(c, css) {
        css = simpleClone(css);
        for (var i = 0, len = c.length; i < len; i++) {
            var style = c[i].style;
            for (var j = 0; j < style.rules.length; j++) {
                if (css[style.rules[j].propertyName] == style.rules[j].value) {
                    style.rules.splice(j, 1);
                    j--;
                } else {
                    css[style.rules[j].propertyName] = style.rules[j].value;
                }
            }
            style.fingerprint = JSON.stringify(style.rules);
            if (c[i].children && c[i].children.length) {
                run(c[i].children, css);
            }
        }
    }
    function writeTSpan(ctx, sibling, omIn) {
        write(ctx, "<tspan");
        // Set paragraph styles.

        if (ctx._nextTspanAdjustSuper) {
            writeAttrIfNecessary(ctx, "dy", "0.6em", "0em", "");
        }

        if (omIn.position) {
            var lineEM = 1.2,
                fontSize,
                leading = omIn.style["_leading"];
            if (leading) {
                fontSize = omIn.style["font-size"];
                if (fontSize && leading.units === fontSize.units) {
                    if (fontSize.units) {
                        lineEM = round1k(leading.value / fontSize.value);
                    } else {
                        lineEM = round1k(leading / fontSize);
                    }
                }
            }

            if (!ctx._nextTspanAdjustSuper) {
                if (omIn.position.unitY === "em") {
                    writeAttrIfNecessary(ctx, "dy", (omIn.position.y * lineEM) + "em", "0em", "");
                } else {
                    writeAttrIfNecessary(ctx, "dy", (sibling ? lineEM : 0) + "em", "0em", "");
                }
            }

            if (!omIn.style ||
                (omIn.style["text-anchor"] !== "middle" &&
                 omIn.style["text-anchor"] !== "end") &&
                isFinite(omIn.position.x)) {

                if (sibling) {
                    writePositionIfNecessary(ctx, {
                        x: omIn.position.x,
                        unitX: omIn.position.unitX
                    }, "");
                }
            } else if (omIn.style["text-anchor"] === "middle") {
                writePositionIfNecessary(ctx, {
                    x: omIn.position.x,
                    unitX: omIn.position.unitX
                });
                if (isFinite(omIn.position.deltaX)) {
                    writeAttrIfNecessary(ctx, "dx", omIn.position.deltaX, "0", "px");
                }
            } else if (omIn.style["text-anchor"] === "end") {
                writeAttrIfNecessary(ctx, "x", "100%", "0%", "");
                if (isFinite(omIn.position.deltaX)) {
                    writeAttrIfNecessary(ctx, "dx", omIn.position.deltaX, "0", "px");
                }
            }
        }

        ctx._nextTspanAdjustSuper = false;

        writeClassIfNeccessary(ctx, omIn);
        write(ctx, ">");
    }

    function mergeTSpans(ctx, sibling, tspans) {
        var str = "",
            opened = [],
            styles = [],
            curstyle = styles;
        for (var i = 0, len = tspans.length; i < len; i++) {
            var j = opened.length,
                compres = {match: -1},
                match;
            while (j--) {
                match = compareStyles(opened[j], tspans[i].styleBlock);
                if (match > compres.match) {
                    compres = {
                        match: match,
                        full: match == tspans[i].styleBlock.rules.length,
                        style: opened[j],
                        j: j
                    };
                }
            }
            if (compres) {
                var todel = opened.splice(compres.j + 1);
                for (var k = 0; k < todel.length; k++) {
                    curstyle = curstyle.parent;
                }
                write(ctx, new Array(todel.length + 1).join("</tspan>"));
                if (compres.full) {
                    if (tspans[i].text) {
                        write(ctx, encodedText(tspans[i].text));
                    }
                    continue;
                }
            } else {
                write(ctx, new Array(opened.length + 1).join("</tspan>"));
                opened.length = 0;
            }
            var chldrn = [];
            curstyle.push({
                style: tspans[i].styleBlock,
                children: chldrn,
                parent: curstyle
            });
            chldrn.parent = curstyle;
            curstyle = chldrn;
            writeTSpan(ctx, sibling, tspans[i]);
            if (tspans[i].text) {
                write(ctx, encodedText(tspans[i].text));
            }
            opened.push(tspans[i].styleBlock);
        }
        write(ctx, new Array(opened.length + 1).join("</tspan>"));
        run(styles, {});
        return str;
    };

	module.exports = {
        scanForUnsupportedFeatures: scanForUnsupportedFeatures,
        mergeTSpans: mergeTSpans,
        writeTSpan: writeTSpan
    };

}());
