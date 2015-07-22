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
        svgWriterText = require("./svgWriterText.js"),
        attrsDefs = require("./attrdefs-database.js"),
        SVGWriterContext = require("./svgWriterContext.js"),
        write = svgWriterUtils.write,
        writeln = svgWriterUtils.writeln,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent,
        getTransform = svgWriterUtils.getTransform,
        encodedText = svgWriterUtils.encodedText,
        hasFx = svgWriterUtils.hasFx,
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
            node = node || ctx.currentOMNode;
            if (node.visualBounds) {
                this.bbox = {
                    x: node.visualBounds.left,
                    y: node.visualBounds.top,
                    width: node.visualBounds.right - node.visualBounds.left,
                    height: node.visualBounds.bottom - node.visualBounds.top
                };
            }
            this.setStyleBlock(ctx, node);
        }
    }
    function hasStroke(ctx) {
        var omIn = ctx.currentOMNode;
        return omIn.style && omIn.style.stroke && omIn.style.stroke.type != "none";
    }
    Tag.resetRoot = function (svgOM) {
        var bounds = svgOM.global.bounds || {};
        root = {
            all: {},
            ids: {},
            x: bounds.left,
            y: bounds.top,
            width: bounds.right - bounds.left,
            height: bounds.bottom - bounds.top
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
    Tag.prototype.getRootBounds = function () {
        return {
            x: root.x,
            y: root.y,
            width: root.width,
            height: root.height
        };
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
        precision = util.precision(precision);
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
        if (name == "#text") {
            return this.text || "";
        }
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
            prec = util.precision(ctx && ctx.precision);
        switch (desc[1]) {
            case "number":
                value = parseNumber(value, tagname != "*", prec);
                break;
            case "number-sequence":
                if (!Array.isArray(value)) {
                    value = (value + "").split(/[,\s]+/);
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
    };
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
            out = " " + name + '="' + value + '"';
            if (ctx) {
                write(ctx, out);
            } else {
                return out;
            }
        }
        return "";
    };
    Tag.prototype.write = Tag.prototype.toString = function (ctx) {
        var tag = this,
            noctx,
            numChildren = tag.children && tag.children.length;
        if (ctx) {
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
            if ("id" in tag.attrs && !noctx) {
                tag.writeAttribute(ctx, "id");
            }
            if ("data-name" in tag.attrs && !noctx) {
                tag.writeAttribute(ctx, "data-name", encodedText(tag.attrs["data-name"]));
            }
            if ("class" in tag.attrs) {
                tag.writeAttribute(ctx, "class");
            }
            for (var name in tag.attrs) {
                if (name != "class" && name != "id" && name != "data-name" && name != "style") {
                    tag.writeAttribute(ctx, name);
                }
            }
            if ("style" in tag.attrs) {
                tag.writeAttribute(ctx, "style");
            }
            if (noctx) {
                var omStyleBlock = tag.styleBlock;
                if (omStyleBlock) {
                    for (var i = 0; i < omStyleBlock.rules.length; i++) {
                        var rule = omStyleBlock.rules[i];
                        tag.writeAttribute(ctx, rule.propertyName, rule.value);
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
        for (i = 0; i < numChildren; i++) {
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
        var omStyleBlock = ctx.omStylesheet.getStyleBlock(node, ctx.ID.getUnique);
        if (!omStyleBlock) {
            return;
        }
        this.styleBlock = omStyleBlock;
        omStyleBlock.tags = omStyleBlock.tags ? omStyleBlock.tags.concat(this.id) : [this.id];
    };
    Tag.prototype.setClass = function (ctx) {
        var omStyleBlock = this.styleBlock;
        if (!omStyleBlock || !omStyleBlock.hasRules()) {
            return;
        }
        // Use class attribute
        if (!ctx.styling) {
            var style = "";
            for (var i = 0, ii = omStyleBlock.class.length; i < ii; i++) {
                style += " " + omStyleBlock.class[i].replace(/\s+/g, "-");
            }
            this.setAttribute("class", svgWriterUtils.encodedText(style.substr(1)));
            return;
        }
        // Use style attribute
        if (ctx.styling == 1) {
            style = "";
            for (i = 0, ii = omStyleBlock.rules.length; i < ii; i++) {
                style += omStyleBlock.rules[i].toString(ctx);
            }
            style = style.substring(0, style.length - 1);
            this.setAttribute("style", style);
            return;
        }
        // Use presentation attributes
        if (ctx.styling == 2) {
            for (i = 0, ii = omStyleBlock.rules.length; i < ii; i++) {
                var rule = omStyleBlock.rules[i];
                this.setAttribute(rule.propertyName, rule.value);
            }
            return;
        }
    };
    Tag.prototype.useTrick = function (ctx) {
        if (this.tricked || !hasFx(ctx) || !hasStroke(ctx)) {
            return this;
        }
        var stroke = this.getAttribute("stroke"),
            fill = this.getAttribute("fill"),
            filter = this.getAttribute("filter"),
            id = ctx.ID.getUnique(this.name),
            list = new Tag(),
            g = new Tag("g"),
            use = new Tag("use", {"xlink:href": "#" + id});
        this.setAttribute("id", id);
        list.appendChild(g, use);
        g.appendChild(this);
        if (ctx.styling) {
            g.setAttributes({
                fill: fill,
                filter: filter
            });
            this.setAttributes({
                stroke: "inherit",
                filter: "none",
                fill: "inherit"
            });
            use.setAttributes({
                stroke: stroke,
                fill: "none",
                filter: "none"
            });
        } else {
            g.setAttribute("style", "fill: " + fill + "; filter: " + filter);
            this.setAttribute("style", "stroke: inherit; filter: none; fill: inherit");
            use.setAttribute("style", "stroke: " + stroke + "; filter: none; fill: none");
        }
        this.tricked = true;
        return list;
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

    function getFilter4Mask(ctx, opacity, invert, clip) {
        if (!invert && !clip) {
            return null;
        }
        var name = (opacity ? "opacity" : "luminosity") + (invert ? "-invert" : "") + (clip ? "-noclip" : "");
        if (root[name]) {
            return root[name].attrs.id;
        }

        var filter,
            filterID = ctx.ID.getUnique("filter", name);
        root[name] = filter = new Tag("filter", {
            id: filterID,
            x: 0,
            y: 0,
            width: "100%",
            height: "100%",
            filterUnits: "userSpaceOnUse",
            "color-interpolation-filters": "sRGB"
        });
        maskFilters[name](filter);
        ctx.omStylesheet.define("filter", null, filterID, filter, filter.toString());
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
                d: util.optimisePath(node.shape.path, ctx.precision, ctx.preparedPath),
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
            var attr = {},
                offsetX = (ctx._shiftContentX || 0) + (ctx._shiftCropRectX || 0),
                offsetY = (ctx._shiftContentY || 0) + (ctx._shiftCropRectY || 0);
            if (node.bounds) {
                attr.x = node.bounds.left + offsetX;
                attr.y = node.bounds.top + offsetY;
                attr.width = node.bounds.right - node.bounds.left;
                attr.height = node.bounds.bottom - node.bounds.top;
            }
            attr.maskUnits = node.maskUnits || "userSpaceOnUse";
            if (!node.bounds && !node.maskUnits) {
                delete attr.maskUnits;
            }
            attr.maskContentUnits = node.maskContentUnits;
            var mask = new Tag("mask", attr, ctx);
            if (node.kind == "opacity") {
                mask.setAttribute("style", "mask-type:alpha");
                mask.opacity = true;
            }
            mask.noclip = "clip" in node && !node.clip;
            mask.filter = getFilter4Mask(ctx, node.kind == "opacity", node.invert, mask.noclip);
            if (node.invert) {
                mask.setStyleBlock(ctx, {});
            }
            return mask;
        },
        clipPath: function (ctx, node) {
            return new Tag("clipPath", {
                clipPathUnits: node.clipPathUnits
            }, ctx);
        },
        pattern: function (ctx, node) {
            // FIXME: We might need special casing for objectBoundingBox.
            var attr = {},
                offsetX = (ctx._shiftContentX || 0) + (ctx._shiftCropRectX || 0),
                offsetY = (ctx._shiftContentY || 0) + (ctx._shiftCropRectY || 0),
                t = getTransform(node.transform, offsetX, offsetY, ctx.precision);
            if (node.bounds) {
                attr.x = node.bounds.left + (t ? 0 : offsetX);
                attr.y = node.bounds.top + (t ? 0 : offsetY);
                attr.width = node.bounds.right - node.bounds.left;
                attr.height = node.bounds.bottom - node.bounds.top;
            }
            if (node.viewBox) {
                attr.viewBox = [node.viewBox.left + (t ? 0 : offsetX), node.viewBox.top + (t ? 0 : offsetY), node.viewBox.right, node.viewBox.bottom];
            }
            attr.patternTransform = t;
            attr.patternUnits = node.patternUnits || "userSpaceOnUse";
            if (!node.bounds && !node.patternUnits) {
                delete attr.patternUnits;
            }
            attr.patternContentUnits = node.patternContentUnits;
            return new Tag("pattern", attr, ctx);
        },
        rect: function (ctx, node) {
            var r = node.shape.r,
                tag;
            if (r) {
                r = r.map(function (item) {
                    return Math.abs(parseFloat(item));
                });
                if (r[0] != r[1] || r[1] != r[2] || r[2] != r[3]) {
                    tag = new Tag("path", {
                        d: util.optimisePath(roundRectPath(node.shape.x, node.shape.y, node.shape.width, node.shape.height, r), ctx.precision),
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
            if (node.kind == "positioned") {
                var tag = new Tag("text", {
                        x: node["text-frame"].x,
                        y: node["text-frame"].y,
                        transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision)
                    }, ctx),
                    paraLen = node.paragraphs && node.paragraphs.length;
                for (var i = 0; i < paraLen; i++) {
                    var para = node.paragraphs[i],
                        p = new Tag("tspan", {}, ctx, para);
                    for (var j = 0; j < para.lines.length; j++) {
                        var lineNode = para.lines[j];
                        for (var k = 0; k < lineNode.length; k++) {
                            var glyph = lineNode[k],
                                glyphText = node["raw-text"].substring(glyph.from, glyph.to),
                                glyphRun = new Tag("tspan", {
                                    x: glyph.x,
                                    y: glyph.y,
                                    rotate: glyph.rotate
                                }, ctx, glyph);
                            glyphRun.appendChild(new Tag("#text", glyphText));
                            p.appendChild(glyphRun);
                        }
                    }
                    if (p.children.length) {
                        tag.appendChild(p);
                    }
                }
            } else {
                return factory.textOld(ctx, node);
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
                tag = new Tag("textPath", {}, ctx);

            if (!ctx.hasWritten(node, "text-path-attr")) {
                ctx.didWrite(node, "text-path-attr");
                var textPathDefn = ctx.omStylesheet.getDefine(node.id, "text-path");
                if (textPathDefn) {
                    tag.setAttribute("xlink:href", "#" + textPathDefn.defnId);
                } else {
                    console.warn("text-path with no def found");
                }
            }
            offset = {middle: 50, end: 100}[tag.getAttribute("text-anchor")] || 0;
            tag.setAttribute("startOffset", offset + "%");
            return tag.useTrick(ctx);
        },
        image: function (ctx, node) {
            if (!node.bounds) {
                return;
            }
            var top = parseFloat(node.bounds.top),
                right = parseFloat(node.bounds.right),
                bottom = parseFloat(node.bounds.bottom),
                left = parseFloat(node.bounds.left),
                w = right - left,
                h = bottom - top,
                tag = new Tag("image", {
                    "xlink:href": node.href,
                    x: left,
                    y: top,
                    width: w,
                    height: h,
                    transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision)
                }, ctx);
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
            var attr = {
                "xlink:href": "#" + ctx.omStylesheet.getDefine(node.ref, "symbol").defnId,
                transform: getTransform(node.transform, node.transformTX, node.transformTY, ctx.precision)
            };
            if (node.bounds) {
                attr.x = node.bounds.left || 0;
                attr.y = node.bounds.top || 0;
                // If right and bottom were not specified, don't write width or height.
                if (isFinite(node.bounds.right)) {
                    attr.width = node.bounds.right - node.bounds.left;
                }
                if (isFinite(node.bounds.bottom)) {
                    attr.height = node.bounds.bottom - node.bounds.top;
                }
            }
            return new Tag("use", attr, ctx);
        },
        symbol: function (ctx, node) {
            var attr = {},
                offsetX = (ctx._shiftContentX || 0) + (ctx._shiftCropRectX || 0),
                offsetY = (ctx._shiftContentY || 0) + (ctx._shiftCropRectY || 0);
            if (node.viewBox) {
                attr.viewBox = [node.viewBox.left + offsetX, node.viewBox.top + offsetY, node.viewBox.right, node.viewBox.bottom];
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
                attr.width = ctx._width;
                attr.height = ctx._height;
            }
            attr.viewBox = ctx._viewBox;

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
            id;
        if (node == ctx.svgOM) {
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
                tag.setAttribute("clip-path", "url(#" + ctx._contentClipPathID + ")");
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
            if (ctx.idType != "minimal" && typeof node.name == "string" && node.name.length && !tag.getAttribute("id")) {
                id = ctx.ID.getUnique("", node.name);
                tag.setAttribute("id", id);
                if (node.name != id) {
                    tag.setAttribute("data-name", node.name);
                }
            }
        }
        if (tag && tag.name != "tspan" && node.children && node.children.length) {
            var subtag;
            for (var i = 0, ii = node.children.length; i < ii; i++) {
                ctx.currentOMNode = node.children[i];
                subtag = Tag.make(ctx, node.children[i], i);
                if (subtag) {
                    tag.appendChild(subtag);
                }
            }
        }
        return rootArtboardClipPath || tag;
    };

    module.exports = Tag;

}());
