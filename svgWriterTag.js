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

/* Keep track of SVG data */

(function () {
    "use strict";
    var svgWriterUtils = require("./svgWriterUtils.js"),
        util = require("./utils.js"),
        Matrix = require("./matrix.js"),
        svgWriterText = require("./svgWriterText.js"),
        attrsDefs = require("./attrdefs-database.js"),
        SVGWriterContext = require("./svgWriterContext.js"),
        write = svgWriterUtils.write,
        writeln = svgWriterUtils.writeln,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent,
        getTransform = svgWriterUtils.getTransform,
        getMatrix = svgWriterUtils.getMatrix,
        encodedText = svgWriterUtils.encodedText,
        hasFx = svgWriterUtils.hasFx,
        toDocumentUnits = svgWriterUtils.toDocumentUnits,
        mergeTSpans2Tag = svgWriterText.mergeTSpans2Tag,
        makeTSpan = svgWriterText.makeTSpan,
        root,
        tagid = 0;

    function Tag(name, attr, ctx, node) {
        // There are three types of tags:
        // 1. Normal tag. name == "circle", "rect", etc
        // 2. Text tag. name == "#text" or "#comment"
        // 3. Tag List. name == ""
        this.name = name || "";
        if (name == "#text" || name == "#comment") {
            this.text = attr;
        } else {
            this.attrs = {};
            this.setAttributes(attr);
            this.children = [];
        }
        this.id = tagid++;
        if (root) {
            root.all[this.id] = this;
        }
        if (ctx) {
            this.ctx = ctx;
            node = node || ctx.currentOMNode;
            if (node.visualBounds) {
                this.bbox = {
                    x: node.visualBounds.x,
                    y: node.visualBounds.y,
                    width: node.visualBounds.width,
                    height: node.visualBounds.height
                };
            }
            this.setStyleBlock(ctx, node);
        }
        if (root.ctx.tick && this.name) {
            root.ctx.tagCounter++;
        }
    }
    function hasStroke(ctx) {
        var omIn = ctx.currentOMNode;
        return omIn.style && omIn.style.stroke && omIn.style.stroke.type != "none";
    }
    Tag.resetRoot = function (ctx) {
        var bounds = ctx.svgOM.viewSource || {};
        root = {
            ctx: ctx,
            all: {},
            ids: {},
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            images: {}
        };
    };
    Tag.getById = function (id) {
        if (!root) {
            return null;
        }
        return root.all[id] || null;
    };
    Tag.getByDOMId = function (id) {
        id = id + "";
        if (id.charAt(0) == "#") {
            id = id.substring(1);
        }
        if (!root) {
            return null;
        }
        return root.ids[id] || null;
    };
    Tag.prototype.setAttributes = function (attr) {
        if (!attr) {
            return;
        }
        for (var name in attr) {
            this.setAttribute(name, attr[name]);
        }
    };
    Tag.prototype.appendChild = function () {
        var args = [].slice.call(arguments);
        for (var i = 0, ii = args.length; i < ii; i++) {
            var child = args[i];
            if (typeof child == "string") {
                child = new Tag("#text", child);
            }
            if (child.name) {
                this.children.push(child);
            } else {
                this.children = this.children.concat(child.children);
            }
        }
    };
    Tag.prototype.collapseChild = function (child) {
        for (var i = 0, ii = this.children.length; i < ii; i++) {
            if (this.children[i] == child) {
                Array.prototype.splice.apply(this.children, [i, 1].concat(child.children));
                return;
            }
        }
    };
    function parseNumber(value, isAttr, precision) {
        function round(x) {
            return +(+x).toFixed(precision);
        }
        var digival = parseFloat(value),
            units = (value + "").match(/[a-z%\-]+$/i);
        if (value == +value) {
            value = round(value);
        } else if (digival === 0) {
            value = 0;
        } else if (isFinite(digival)) {
            value = round(digival);
            if (units && (units[0].toLowerCase() != "px" || !isAttr)) {
                value += units[0];
            }
        }
        return value;
    }
    Tag.prototype.getAttribute = function (name) {
        return this.styleBlock && this.styleBlock.getPropertyValue(name) || this.attrs[name] || "";
    };
    function getDesc(tagname, attrname) {
        if (attrsDefs[tagname] && attrsDefs[tagname][attrname]) {
            return attrsDefs[tagname][attrname];
        }
        return attrsDefs["*"][attrname] || attrsDefs.default;
    }
    Tag.getDefault = function (tagname, attrname) {
        return getDesc(tagname, attrname)[0];
    };
    Tag.getValue = function (tagname, attrname, value, ctx) {
        var desc = getDesc(tagname, attrname),
            prec = util.precision(ctx && ctx.precision, desc[2]);
        switch (desc[1]) {
            case "number":
                value = parseNumber(value, tagname != "*", prec);
                break;
            case "number-sequence":
                if (!Array.isArray(value)) {
                    value = (value + "").trim().split(/[,\s]+/);
                }
                for (var i = 0, ii = value.length; i < ii; i++) {
                    value[i] = parseNumber(value[i], tagname != "*", prec);
                }
                value = value.join(" ");
                break;
        }
        return value;
    };
    Tag.prototype.setAttribute = function (name, value) {
        if (value === "" || value == null) {
            if (name == "id" && root) {
                delete root.ids[this.attrs.id];
            }
            delete this.attrs[name];
            return;
        }
        if (name == "id" && root) {
            root.ids[value] = this;
        }
        if (name == "#text") {
            this.text = value;
        } else {
            this.attrs[name] = value;
        }
    };
    var linkableNames = {
            linearGradient: 1,
            radialGradient: 1,
            filter: 1,
            pattern: 1
        },
        prefixedAttrs = {
            id: 1,
            class: 1
        }
    Tag.prototype.writeAttribute = function (ctx, name, value) {
        if (typeof ctx == "string") {
            value = name;
            name = ctx;
            ctx = null;
        }
        value = value == null ? this.attrs[name] : value;
        value = value == null ? value : Tag.getValue(this.name, name, value, ctx);
        var tag = this,
            deft = Tag.getDefault(tag.name, name),
            link,
            toWrite = value != null && value + "" != deft + "",
            out;
        // Special case of linked tags
        if (tag.name in linkableNames && tag.attrs["xlink:href"]) {
            link = tag;
            while (link.attrs["xlink:href"]) {
                link = Tag.getByDOMId(link.attrs["xlink:href"]);
                if (link && link.name == tag.name) {
                    if (name in link.attrs) {
                        toWrite = link.attrs[name] != value;
                        break;
                    }
                } else {
                    toWrite = true;
                    break;
                }
            }
        }
        if (toWrite) {
            if (name == "data-name") {
                value = encodedText(value);
            }
            if (ctx && ctx.prefix && name in prefixedAttrs) {
                value = ctx.prefix + value;
            }
            out = " " + name + '="' + value + '"';
            if (ctx) {
                write(ctx, out);
            } else {
                return out;
            }
        }
        return "";
    };
    var attrWeight = {
        id: -21,
        "data-name": -20,
        class: -19,
        xmlns: -18,
        "xmlns:xlink": -17,
        preserveAspectRatio: -16,
        x: -15,
        y: -14,
        x1: -13,
        y1: -12,
        x2: -11,
        y2: -10,
        width: -9,
        height: -8,
        cx: -7,
        cy: -6,
        fx: -5,
        fy: -4,
        r: -3,
        rx: -2,
        ry: -1,
        viewBox: 10,
        "xlink:href": 99,
        style: 100
    };
    function sortAttr(attr1, attr2) {
        var weight1 = attrWeight[attr1] || 0,
            weight2 = attrWeight[attr2] || 0;
        return weight1 - weight2;
    }
    Tag.prototype.write = Tag.prototype.toString = function (ctx) {
        var tag = this,
            noctx,
            numChildren = tag.children && tag.children.length;
        if (ctx) {
            ctx.tick && ctx.tick("write");
            tag.setClass(ctx);
        } else {
            ctx = new SVGWriterContext({});
            noctx = true;
        }
        if (tag.name) {
            if (tag.name == "#text") {
                write(ctx, encodedText(tag.text));
                return ctx.sOut;
            }
            if (tag.name == "#comment") {
                writeln(ctx, ctx.currentIndent + "<!-- " + encodedText(tag.text) + " -->");
                return ctx.sOut;
            }
            var ind = ctx.currentIndent;
            if (tag.name == "tspan" || tag.name == "textPath") {
                ind = "";
            }
            write(ctx, ind + "<" + tag.name);
            var attrs = Object.keys(tag.attrs);
            attrs.sort(sortAttr);
            for (var i = 0; i < attrs.length; i++) {
                if (!noctx || attrs[i] != "id" && attrs[i] != "data-name") {
                    tag.writeAttribute(ctx, attrs[i]);
                }
            }
            if (noctx) {
                var omStyleBlock = tag.styleBlock;
                if (omStyleBlock) {
                    for (var name in omStyleBlock.rules) {
                        tag.writeAttribute(ctx, name, omStyleBlock.rules[name]);
                    }
                }
            }
            if (!numChildren && tag.name != "script") {
                write(ctx, "/");
            }
            if (tag.name == "text" || tag.name == "tspan" || tag.name == "textPath" ||
                tag.name == "desc" || tag.name == "title") {
                write(ctx, ">");
            } else {
                writeln(ctx, ">");
                if (numChildren) {
                    indent(ctx);
                }
            }
        }
        for (var i = 0; i < numChildren; i++) {
            if (noctx) {
                write(ctx, tag.children[i].toString());
            } else {
                tag.children[i].write(ctx);
            }
        }
        if (!numChildren && tag.name != "script" || !tag.name) {
            return ctx.sOut;
        }
        if (tag.name == "text" || tag.name == "desc" || tag.name == "title") {
            writeln(ctx, "</" + tag.name + ">");
        } else if (tag.name == "tspan" || tag.name == "textPath") {
            write(ctx, "</" + tag.name + ">");
        } else {
            undent(ctx);
            writeln(ctx, ctx.currentIndent + "</" + tag.name + ">");
        }
        return ctx.sOut;
    };
    Tag.prototype.setStyleBlock = function (ctx, node) {
        node = node || ctx.currentOMNode;
        var omStyleBlock = ctx.omStylesheet.getStyleBlock(node);
        if (!omStyleBlock) {
            return;
        }
        this.styleBlock = omStyleBlock;
        omStyleBlock.tags = omStyleBlock.tags ? omStyleBlock.tags.concat(this.id) : [this.id];
    };
    Tag.prototype.setClass = function (ctx) {
        var omStyleBlock = this.styleBlock,
            style = "",
            key;
        if (!omStyleBlock || !omStyleBlock.hasRules()) {
            return;
        }
        // Use class attribute
        if (!ctx.styling) {
            for (var i = 0, ii = omStyleBlock.class.length; i < ii; i++) {
                style += " " + omStyleBlock.class[i].replace(/\s+/g, "-");
            }
            this.setAttribute("class", svgWriterUtils.encodedText(style.substr(1)));
            return;
        }
        // Use style attribute
        if (ctx.styling == 1) {
            for (key in omStyleBlock.rules) {
                style += key + ":" + ctx.space + omStyleBlock.rules[key] + ";";
            }
            this.setAttribute("style", style.substring(0, style.length - 1));
            return;
        }
        // Use presentation attributes
        if (ctx.styling == 2) {
            for (key in omStyleBlock.rules) {
                // List or CSS properties without presentation attribute equivalent.
                if (key == "isolation" ||
                    key == "mix-blend-mode" ||
                    key == "text-orientation" ||
                    key == "white-space") {
                    style += key + ":" + ctx.space + omStyleBlock.rules[key] + ";";
                    continue;
                }
                this.setAttribute(key, omStyleBlock.rules[key]);
            }
            if (style.length) {
                this.setAttribute("style", style.substring(0, style.length - 1));
            }
            return;
        }
    };
    Tag.prototype.useTrick = function (ctx) {
        this.trick = ctx.config && ctx.config.fillFilter && hasFx(ctx) && hasStroke(ctx);
        return this;
    };
    function roundRectPath(x, y, width, height, r) {
        var top, bottom, left, right, ok,
            small = {len: Infinity};
        function check(total, i, j) {
            var len = total - r[i] - r[j];
            if (small.len > len) {
                small.len = len;
                small.fraq = total / (r[i] + r[j]);
            }
            return len;
        }
        while (!ok) {
            top = check(width, 0, 1);
            right = check(height, 1, 2);
            bottom = check(width, 2, 3);
            left = check(height, 0, 3);
            if (small.len + .01 < 0) {
                r = r.map(function (item) {
                    return item * small.fraq;
                });
                small = {len: 0};
            } else {
                ok = true;
            }
        }
        var path = "M" + [x + r[0], y] + "h" + top + "a" + [r[1], r[1], 0, 0, 1, r[1], r[1]] +
            "v" + right + "a" + [r[2], r[2], 0, 0, 1, -r[2], r[2]] +
            "h" + -bottom + "a" + [r[3], r[3], 0, 0, 1, -r[3], -r[3]] +
            "v" + -left + "a" + [r[0], r[0], 0, 0, 1, r[0], -r[0]] + "z";
        return path;
    }
    var maskFilters = {
        "opacity-invert": function (filter) {
            // This one is has antialiasing issues
            filter.appendChild(new Tag("feColorMatrix", {
                values: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -8, 1],
                result: "only0"
            }));
            filter.appendChild(new Tag("feComposite", {
                in: "SourceGraphic",
                in2: "only0",
                operator: "over"
            }));
            filter.appendChild(new Tag("feColorMatrix", {
                values: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, -1, 1]
            }));
        },
        "opacity-noclip": function (filter) {
            filter.appendChild(new Tag("feFlood", {
                "flood-color": "#fff",
                result: "bg"
            }));
            filter.appendChild(new Tag("feBlend", {
                in: "SourceAlpha",
                in2: "bg"
            }));
        },
        "opacity-invert-noclip": function (filter) {
            filter.appendChild(new Tag("feFlood", {
                "flood-color": "#fff",
                result: "bg"
            }));
            filter.appendChild(new Tag("feComposite", {
                in: "SourceAlpha",
                in2: "bg",
                operator: "atop"
            }));
        },
        "luminosity-invert": function (filter) {
            filter.appendChild(new Tag("feColorMatrix", {
                values: [-1, 0, 0, 0, 1, 0, -1, 0, 0, 1, 0, 0, -1, 0, 1, 0, 0, 0, 1, 0]
            }));
        },
        "luminosity-noclip": function (filter) {
            filter.appendChild(new Tag("feFlood", {
                "flood-color": "#fff",
                result: "bg"
            }));
            filter.appendChild(new Tag("feBlend", {
                in: "SourceGraphic",
                in2: "bg"
            }));
        },
        "luminosity-invert-noclip": function (filter) {
            filter.appendChild(new Tag("feColorMatrix", {
                values: [-1, 0, 0, 0, 1, 0, -1, 0, 0, 1, 0, 0, -1, 0, 1, 0, 0, 0, 1, 0],
                result: "invert"
            }));
            filter.appendChild(new Tag("feFlood", {
                "flood-color": "#fff",
                result: "bg"
            }));
            filter.appendChild(new Tag("feBlend", {
                in: "invert",
                in2: "bg"
            }));
        }
    };

    function getFilter4Mask(ctx, node, opacity, invert, noclip) {
        if (!invert && !noclip) {
            return null;
        }
        var name = (opacity ? "opacity" : "luminosity") + (invert ? "-invert" : "") + (noclip ? "-noclip" : "");
        if (!noclip && root[name]) {
            return root[name].attrs.id;
        }

        var filter,
            filterID = ctx.ID.getUnique("filter", name),
            attr = {
                id: filterID,
                filterUnits: "userSpaceOnUse",
                "color-interpolation-filters": "sRGB"
            };
        if (noclip) {
            attr.x = node.x;
            attr.y = node.y;
            attr.width = node.width;
            attr.height = node.height;
        }
        root[name] = filter = new Tag("filter", attr);
        maskFilters[name](filter);
        ctx.omStylesheet.def(filter);
        return filterID;
    }
    var factory = {
        circle: function (ctx, node) {
            var tag = new Tag("circle", {
                cx: node.shape.cx,
                cy: node.shape.cy,
                r: node.shape.r,
                transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision)
            }, ctx);
            return tag.useTrick(ctx);
        },
        ellipse: function (ctx, node) {
            var tag = new Tag("ellipse", {
                cx: node.shape.cx,
                cy: node.shape.cy,
                rx: node.shape.rx,
                ry: node.shape.ry,
                transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision)
            }, ctx);
            return tag.useTrick(ctx);
        },
        line: function (ctx, node) {
            var tag = new Tag("line", {
                x1: node.shape.x1,
                y1: node.shape.y1,
                x2: node.shape.x2,
                y2: node.shape.y2,
                transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision)
            }, ctx);
            return tag.useTrick(ctx);

        },
        path: function (ctx, node) {
            var tag = new Tag("path", {
                d: ctx.config.turnOffPathOptimisation ? node.shape.path : util.optimisePath(node.shape.path, ctx.precision, node.shape.preparedPath !== false),
                transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision, true)
            }, ctx);
            return tag.useTrick(ctx);
        },
        polygon: function (ctx, node) {
            var tag = new Tag("polygon", {
                points: util.pointsToString(node.shape.points),
                transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision)
            }, ctx);
            return tag.useTrick(ctx);
        },
        polyline: function (ctx, node) {
            var tag = new Tag("polyline", {
                points: util.pointsToString(node.shape.points),
                transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision)
            }, ctx);
            return tag.useTrick(ctx);
        },
        mask: function (ctx, node) {
            // FIXME: We might need special casing for objectBoundingBox.
            var attr = {};
            if (isFinite(node.x)) {
                attr.x = node.x + (node.translateTX || 0);
            }
            if (isFinite(node.y)) {
                attr.y = node.y + (node.translateTY || 0);
            }
            attr.width = node.width;
            attr.height = node.height;
            attr.maskUnits = node.units || "userSpaceOnUse";
            if (!attr.width && !attr.height && !node.units) {
                delete attr.maskUnits;
            }
            attr.maskContentUnits = node.contentUnits;
            var mask = new Tag("mask", attr, ctx);
            if (node.kind == "opacity") {
                mask.setAttribute("style", "mask-type:alpha");
                mask.opacity = true;
            }
            mask.noclip = "clip" in node && !node.clip;
            mask.filter = getFilter4Mask(ctx, node, node.kind == "opacity", node.invert, mask.noclip);
            if (node.invert) {
                mask.setStyleBlock(ctx, {});
            }
            return mask;
        },
        clipPath: function (ctx, node) {
            return new Tag("clipPath", {
                clipPathUnits: node.clipPathUnits,
                transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision, true)
            }, ctx);
        },
        pattern: function (ctx, node) {
            // FIXME: We might need special casing for objectBoundingBox.
            var attr = {};
            attr.x = node.x + (node.transform ? 0 : node.transformTX || 0);
            attr.y = node.y + (node.transform ? 0 : node.transformTY || 0);
            attr.width = node.width;
            attr.height = node.height;
            if (node.viewBox) {
                attr.viewBox = [node.viewBox.x, node.viewBox.y, node.viewBox.width, node.viewBox.height];
            }
            attr.patternTransform = getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision);
            attr.patternUnits = node.units || "userSpaceOnUse";
            if (!attr.width && !attr.height && !node.units) {
                delete attr.patternUnits;
            }
            attr.patternContentUnits = node.contentUnits;
            return new Tag("pattern", attr, ctx);
        },
        rect: function (ctx, node) {
            var r = node.shape.r,
                tag;
            if (r) {
                r = r.map(function (item) {
                    return Math.abs(parseFloat(item));
                });
                if (!ctx.eq(r[0], r[1]) || !ctx.eq(r[1], r[2]) || !ctx.eq(r[2], r[3])) {
                    tag = new Tag("path", {
                        d: ctx.config.turnOffPathOptimisation ? roundRectPath(node.shape.x, node.shape.y, node.shape.width, node.shape.height, r) : util.optimisePath(roundRectPath(node.shape.x, node.shape.y, node.shape.width, node.shape.height, r), ctx.precision),
                        transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision)
                    }, ctx);
                    return tag.useTrick(ctx);
                } else {
                    r = r[0];
                }
            }
            tag = new Tag("rect", {
                x: node.shape.x,
                y: node.shape.y,
                width: node.shape.width,
                height: node.shape.height,
                transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision)
            }, ctx);
            r && tag.setAttributes({
                rx: r,
                ry: r
            });
            return tag.useTrick(ctx);
        },
        text: function (ctx, node) {
            if (!node.text) {
                return factory.textOld(ctx, node);
            }
            function setGlyphStyling(tag, isVertical, preserveSpaces) {
                var style = tag.styleBlock;
                if (preserveSpaces) {
                    style.addRule("white-space", "pre");
                }
                // ATE does not support "sideways" on horizontal text. Skip support
                // for it here as well for now.
                if (!isVertical) {
                    style.removeRule("text-orientation");
                    return;
                }
                if (style.getPropertyValue("text-orientation") != "sideways-right") {
                    style.addRule("text-orientation", "upright");
                    style.addRule("glyph-orientation-vertical", "0deg");
                } else {
                    style.addRule("glyph-orientation-vertical", "90deg");
                }
            }
            var text = node.text,
                frame = text.frame,
                tag = new Tag("text", {
                    x: frame.x,
                    y: frame.y,
                    transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision)
                }, ctx),
                paraLen = text.paragraphs && text.paragraphs.length,
                isVertical = false;
            if (text.orientation && text.orientation.substring(0, 8) == "vertical") {
                tag.styleBlock.addRule("writing-mode", "tb");
                isVertical = true;
            }
            setGlyphStyling(tag, isVertical);
            for (var i = 0; i < paraLen; i++) {
                var para = text.paragraphs[i],
                    p = new Tag("tspan", {}, ctx, para);
                setGlyphStyling(p, isVertical);
                for (var j = 0; j < para.lines.length; j++) {
                    var lineNode = para.lines[j];
                    for (var k = 0; k < lineNode.length; k++) {
                        var glyph = lineNode[k],
                            glyphText = text.rawText.substring(glyph.from, glyph.to),
                            glyphRun = new Tag("tspan", {
                                x: glyph.x,
                                y: glyph.y,
                                rotate: glyph.rotate
                            }, ctx, glyph),
                            whiteSpace = false;
                        // Do not preserve spaces if we just have one trailing white space on a glyph run
                        // unless it is the last glyph run with text decoration.
                        // Add xml:space to individual tspan's to work around Safari issues.
                        if (glyphText.search(/(^[ \t\v].|[ \t\v][ \t\v])/) >= 0 ||
                            j == para.lines.length - 1 && k == lineNode.length - 1 && glyphText.search(/.[ \t\v]$/) >= 0 &&
                            glyph.style && glyph.style.textAttributes && glyph.style.textAttributes.decoration &&
                            glyph.style.textAttributes.decoration.length) {
                            whiteSpace = true;
                        }
                        glyphRun.appendChild(new Tag("#text", glyphText));
                        setGlyphStyling(glyphRun, isVertical, whiteSpace);
                        p.appendChild(glyphRun);
                    }
                }
                if (p.children.length) {
                    tag.appendChild(p);
                }
            }
            return tag.useTrick(ctx);
        },
        textOld: function (ctx, node) {
            var tag = new Tag("text", {
                x: node.position.x + (node.position.unitX || ""),
                y: node.position.y + (node.position.unitY || ""),
                transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision)
            }, ctx);
            return tag.useTrick(ctx);
        },
        textPath: function (ctx, node) {
            var offset = 0,
                tag = new Tag("textPath", {"xlink:href": ""}, ctx);

            if (node.pathData) {
                var textPath = new Tag("path", {
                        id: ctx.ID.getUnique("text-path"),
                        d: ctx.config.turnOffPathOptimisation ? node.pathData : util.optimisePath(node.pathData, ctx.precision)
                    });
                ctx.omStylesheet.def(textPath, function (def) {
                    tag.setAttribute("xlink:href", "#" + def.getAttribute("id"));
                });
            } else {
                console.warn("text-path with no def found");
            }
            offset = {middle: 50, end: 100}[tag.getAttribute("text-anchor")] || 0;
            tag.setAttribute("startOffset", offset + "%");
            return tag.useTrick(ctx);
        },
        image: function (ctx, node) {
            if (!node.image) {
                return;
            }
            var img = root.images[node.image.href],
                x = node.image.x || 0,
                y = node.image.y || 0,
                w = parseFloat(node.image.width),
                h = parseFloat(node.image.height),
                tag;
            ctx.xlinkRequired = true;
            if (img) {
                if (!img.inDefs) {
                    var id = ctx.ID.getUnique("image"),
                        defimg = new Tag("image", {
                            width: img.getAttribute("width"),
                            height: img.getAttribute("height"),
                            "xlink:href": img.getAttribute("xlink:href"),
                            id: id
                        });
                    img.name = "use";
                    img.setAttributes({
                        width: "",
                        height: "",
                        "xlink:href": "#" + id
                    });
                    root.images[node.image.href] = defimg;
                    defimg.inDefs = true;
                    ctx.omStylesheet.def(defimg);
                    img = defimg;
                } else {
                    id = img.getAttribute("id");
                }
                var width = img.getAttribute("width"),
                    height = img.getAttribute("height"),
                    sx = w / width,
                    sy = h / height,
                    matrix = Matrix.createMatrix(node.transform);
                matrix.scale(sx, sy, 1);
                tag = new Tag("use", {
                    x: x / sx,
                    y: y / sy,
                    transform: getTransform(matrix, 0, 0, ctx.precision),
                    "xlink:href": "#" + id
                }, ctx);
            } else {
                tag = new Tag("image", {
                    x: x,
                    y: y,
                    width: w,
                    height: h,
                    transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision),
                    "xlink:href": node.image.href
                }, ctx);
                root.images[node.image.href] = tag;
            }
            return tag.useTrick(ctx);
        },
        group: function (ctx, node) {
            var tag = new Tag("g", {
                transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision)
            }, ctx);
            return tag.useTrick(ctx);
        },
        artboard: function (ctx, node) {
            var id = ctx.ID.getUnique("artboard", node.name),
                artboard = new Tag("g", {id: id}, ctx).useTrick(ctx);
            if (!ctx.minify && node.name && node.name != id) {
                artboard.setAttribute("data-name", node.name);
            }
            artboard.isArtboard = true;
            return artboard;
        },
        tspan: function (ctx, node, sibling) {
            var tag = makeTSpan(Tag, ctx, sibling, node);

            if (node.children && node.children.length) {
                mergeTSpans2Tag(tag, ctx, sibling, node.children);
            }

            if (node.text) {
                tag.appendChild(new Tag("#text", node.text));
            }

            if (node.style && node.style["_baseline-script"] === "super") {
                ctx._nextTspanAdjustSuper = true;
            }
            return tag.useTrick(ctx);
        },
        reference: function (ctx, node) {
            var symbol = ctx.svgOM.resources.symbols[node.reference.ref],
                use = new Tag("use", {}, ctx);
            ctx.xlinkRequired = true;
            if (symbol) {
                var name = symbol.name,
                    symbolID = ctx.ID.getUnique("symbol", name),
                    symbolTag = Tag.make(ctx, symbol);
                symbolTag.setAttribute("id", symbolID);
                if (!ctx.minify && name && symbolID != name) {
                    symbolTag.setAttribute("data-name", name);
                }
                ctx.omStylesheet.def(symbolTag, function (def) {
                    use.setAttribute("xlink:href", "#" + def.getAttribute("id"));
                });
            }
            var attr = {
                "xlink:href": "",
                transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision)
            };
            attr.x = node.reference.x || 0;
            attr.y = node.reference.y || 0;
            if (isFinite(node.reference.width)) {
                attr.width = node.reference.width;
            }
            if (isFinite(node.reference.height)) {
                attr.height = node.reference.height;
            }
            use.setAttributes(attr);
            return use;
        },
        symbol: function (ctx, node) {
            var attr = {};
            if (node.viewBox) {
                attr.viewBox = [node.viewBox.x || 0, node.viewBox.y || 0, node.viewBox.width, node.viewBox.height];
            }
            return new Tag("symbol", attr, ctx);
        },
        svg: function (ctx) {
            var attr = {
                xmlns: "http://www.w3.org/2000/svg",
                "xmlns:xlink": "http://www.w3.org/1999/xlink",
                preserveAspectRatio: ctx.config.preserveAspectRatio || "none"
            };

            if (!ctx.config.isResponsive) {
                if (isFinite(ctx._width)) {
                    attr.width = toDocumentUnits(ctx, ctx._width);
                }
                if (isFinite(ctx._height)) {
                    attr.height = toDocumentUnits(ctx, ctx._height);
                }
            }
            if (ctx._viewBox.reduce(function (prev, cur) {
                    return prev && isFinite(cur);
                }, true)) {
                attr.viewBox = ctx._viewBox;
            }

            return new Tag("svg", attr);
        }
    };

    Tag.make = function (ctx, node, sibling) {
        node = node || ctx.currentOMNode;
        var tag,
            title,
            desc,
            rootArtboardClipPath,
            f,
            id,
            children;
        ctx.tick && ctx.tick("tag");
        if (node == ctx.svgOM) {
            ctx.tick && ctx.tick("pre");
            tag = factory.svg(ctx, node);
            tag.iamroot = true;
            if (ctx.svgOM.name && ctx.svgOM.name.length) {
                title = new Tag("title");
                title.appendChild(new Tag("#text", encodedText(ctx.svgOM.name)));
                tag.appendChild(title);
            }
            if (ctx.svgOM.desc && ctx.svgOM.desc.length) {
                desc = new Tag("desc");
                desc.appendChild(new Tag("#text", encodedText(ctx.svgOM.desc)));
                tag.appendChild(desc);
            }
            if (ctx._needsClipping) {
                rootArtboardClipPath = tag;
                tag = new Tag("g");
                rootArtboardClipPath.appendChild(tag);
                tag.setAttribute("clip-path", "url(#" + ctx.prefix + ctx._contentClipPathID + ")");
            }
        } else {
            if (node.hasOwnProperty("visible") && !node.visible) {
                return;
            }
            if (node.type == "shape") {
                f = factory[node.shape.type];
                if (!f) {
                    console.warn("NOT HANDLED DEFAULT " + node.shape.type);
                } else {
                    tag = f(ctx, node, sibling);
                }
            } else {
                f = factory[node.type];
                if (!f) {
                    console.error("ERROR: Unknown omIn.type = " + node.type);
                } else {
                    tag = f(ctx, node, sibling);
                }
            }
            if (ctx.idType != "minimal" && typeof node.name == "string" && node.name.length && tag && !tag.getAttribute("id")) {
                id = ctx.ID.getUnique("", node.name);
                tag.setAttribute("id", id);
                if (node.name != id) {
                    tag.setAttribute("data-name", node.name);
                }
            }
        }
        children = (node.artboard || node.group || node).children;
        if (tag && tag.name != "tspan" && children && children.length) {
            var subtag;
            for (var i = 0, ii = children.length; i < ii; i++) {
                ctx.currentOMNode = children[i];
                subtag = Tag.make(ctx, children[i], i);
                if (subtag) {
                    tag.appendChild(subtag);
                }
            }
        }
        return rootArtboardClipPath || tag;
    };

    module.exports = Tag;

}());
