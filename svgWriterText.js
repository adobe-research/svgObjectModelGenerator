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

    var svgWriterUtils = require("./svgWriterUtils.js"),
        round1k = svgWriterUtils.round1k,
        matchAfterDash = /-.*$/,
        matchAllSpaces = /\s/g;

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
        var eq = 0;
        for (var name in st1.rules) {
            if (name in st2.rules) {
                eq += iseq(name, st1.rules[name], st2.rules[name]);
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
            for (var name in style.rules) {
                if (css[name] == style.rules[name]) {
                    delete style.rules[name];
                } else {
                    css[name] = style.rules[name];
                }
            }
            style.fingerprint = JSON.stringify(style.rules);
            if (c[i].children && c[i].children.length) {
                run(c[i].children, css);
            }
        }
    }
    function makeTSpan(Tag, ctx, sibling, node) {
        var tag = new Tag("tspan", {}, ctx, node);
        if (ctx._nextTspanAdjustSuper) {
            tag.setAttribute("dy", "0.6em");
        }

        if (node.position) {
            var lineEM = 1.2,
                fontSize,
                leading = node.style._leading,
                dy;
            if (leading) {
                fontSize = node.style["font-size"];
                if (fontSize && leading.units === fontSize.units) {
                    if (fontSize.units) {
                        lineEM = round1k(leading.value / fontSize.value);
                    } else {
                        lineEM = round1k(leading / fontSize);
                    }
                }
            }

            if (!ctx._nextTspanAdjustSuper) {
                fontSize = fontSize || node.style["font-size"];
                if (fontSize.units) {
                    fontSize = fontSize.value;
                }
                if (node.position.unitY === "em") {
                    dy = node.position.y * lineEM * fontSize;
                } else {
                    dy = (sibling ? lineEM : 0) * fontSize;
                }
                tag.setAttribute("dy", dy);
            }

            if (!node.style ||
                node.style["text-anchor"] !== "middle" &&
                node.style["text-anchor"] !== "end" &&
                isFinite(node.position.x)) {

                if (sibling) {
                    tag.setAttribute("x", node.position.x);
                }
            } else if (node.style["text-anchor"] === "middle" || node.style["text-anchor"] === "end") {
                tag.setAttribute("x", node.position.x);
                if (isFinite(node.position.deltaX)) {
                    tag.setAttribute("dx", node.position.deltaX);
                }
            }
        }

        ctx._nextTspanAdjustSuper = false;

        return tag;
    }

    function mergeTSpans2Tag(root, ctx, sibling, tspans) {
        var top = root,
            Tag = root.constructor,
            opened = [],
            openedTags = [root],
            styles = [],
            tag,
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
                        full: match == Object.keys(tspans[i].styleBlock.rules).length,
                        style: opened[j],
                        j: j
                    };
                }
            }
            if (~compres.match) {
                var todel = opened.splice(compres.j + 1);
                openedTags.splice(compres.j + 2);
                for (var k = 0; k < todel.length; k++) {
                    curstyle = curstyle.parent;
                }
                top = openedTags[openedTags.length - 1];
                if (compres.full) {
                    if (tspans[i].text) {
                        top.children.push(new Tag("#text", tspans[i].text));
                    }
                    continue;
                }
            } else {
                top = root;
                opened.length = 0;
                openedTags = [root];
            }
            var chldrn = [];
            curstyle.push({
                style: tspans[i].styleBlock,
                children: chldrn,
                parent: curstyle
            });
            chldrn.parent = curstyle;
            curstyle = chldrn;
            tag = makeTSpan(Tag, ctx, sibling, tspans[i]);
            if (tspans[i].text) {
                tag.children.push(new Tag("#text", tspans[i].text));
            }
            opened.push(tspans[i].styleBlock);
            openedTags.push(tag);
            top.children.push(tag);
            top = openedTags[openedTags.length - 1];
        }
        run(styles, {});
        return root;
    }

    module.exports = {
        makeTSpan: makeTSpan,
        mergeTSpans2Tag: mergeTSpans2Tag
    };

}());
