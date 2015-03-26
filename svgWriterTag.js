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

/* Keep track of SVG data */

(function () {
    "use strict";
    var svgWriterUtils = require("./svgWriterUtils.js"),
        util = require("./utils.js"),
        svgWriterText = require("./svgWriterText.js"),
        attrsDefs = require('./attrdefs-database.js'),
        SVGWriterContext = require("./svgWriterContext.js");

    var write = svgWriterUtils.write,
        writeln = svgWriterUtils.writeln,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent,
        writeColor = svgWriterUtils.writeColor,
        round1k = svgWriterUtils.round1k,
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
            this.setStyleBlock(ctx, node);
        }
    }
    function hasStroke(ctx) {
        var omIn = ctx.currentOMNode;
        return omIn.style && omIn.style.stroke && omIn.style.stroke.type != "none";
    }
    Tag.resetRoot = function () {
        root = {
            all: {},
            artboards: 1,
            ids: {}
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
            if (child.name) {
                this.children.push(child);
            } else {
                this.children = this.children.concat(child.children);
            }
        }
    };
    function parseNumber(value) {
        var digival = parseFloat(value),
            units = (value + "").match(/[a-z%\-]+$/i);
        if (value == +value) {
            value = round1k(value);
        } else if (digival === 0) {
            value = 0;
        } else if (isFinite(digival)) {
            value = round1k(digival);
            if (units && units[0].toLowerCase() != "px") {
                value += units[0];
            }
        }
        return value;
    }
    Tag.prototype.getAttribute = function (name) {
        return (this.styleBlock && this.styleBlock.getPropertyValue(name)) || this.attrs[name] || "";
    };
    Tag.prototype.setAttribute = function (name, value) {
        var desc = attrsDefs[this.name + "/" + name] || attrsDefs["*/" + name] || attrsDefs.default,
            type = desc[1],
            digival = parseFloat(value);
        switch (type) {
        case "number":
            value = parseNumber(value);
            break;
        case "number-sequence":
            if (!Array.isArray(value)) {
                value = (value + "").split(/[,\s]+/);
            }
            for (var i = 0, ii = value.length; i < ii; i++) {
                value[i] = parseNumber(value[i]);
            }
            value = value.join(" ");
            break;
        case "color":
            if (value != "none") {
                value = writeColor(value);
            }
            break;
        }
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
        this.attrs[name] = value;
    };
    function writeDefs(ctx) {
        var hasRules = !ctx.usePresentationAttribute && ctx.omStylesheet.hasRules(),
            hasDefines = ctx.omStylesheet.hasDefines();

        if (hasRules || hasDefines) {
            writeln(ctx, ctx.currentIndent + "<defs>");
            indent(ctx);

            !ctx.usePresentationAttribute && ctx.omStylesheet.writeSheet(ctx);

            if (hasRules && hasDefines) {
                writeln(ctx);
            }
            ctx.omStylesheet.writeDefines(ctx);

            undent(ctx);
            writeln(ctx, ctx.currentIndent + "</defs>");
        }
    }
    var linkableNames = {
            linearGradient: 1,
            radialGradient: 1,
            filter: 1,
            pattern: 1
        };
    Tag.prototype.writeAttribute = function (ctx, name) {
        var tag = this,
            desc = attrsDefs[tag.name + "/" + name] || attrsDefs["*/" + name] || attrsDefs.default,
            deft = desc[0],
            link,
            toWrite = tag.attrs[name] + "" != deft + "";
        // Special case of linked tags
        if (tag.name in linkableNames && tag.attrs["xlink:href"]) {
            link = tag;
            while (link.attrs["xlink:href"]) {
                link = Tag.getByDOMId(link.attrs["xlink:href"]);
                if (link && link.name == tag.name) {
                    if (name in link.attrs) {
                        toWrite = link.attrs[name] != tag.attrs[name];
                        break;
                    }
                } else {
                    toWrite = true;
                    break;
                }
            }
        }
        if (toWrite) {
            write(ctx, " " + name + '="' + tag.attrs[name] + '"');
        }
    };
    Tag.prototype.write = Tag.prototype.toString = function (ctx) {
        ctx = ctx || new SVGWriterContext({});
        var tag = this,
            numChildren = tag.children && tag.children.length;
        tag.setClass(ctx);
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
            for (var name in tag.attrs) {
                tag.writeAttribute(ctx, name);
            }
            if (!numChildren && tag.name != "script") {
                write(ctx, "/");
            }
            if (tag.name == "text" || tag.name == "tspan" || tag.name == "textPath") {
                write(ctx, ">");
            } else {
                writeln(ctx, ">");
                if (numChildren) {
                    indent(ctx);
                }
            }
            if (tag.iamroot) {
                writeDefs(ctx);
            }
        }
        for (var i = 0; i < numChildren; i++) {
            tag.children[i].write(ctx);
        }
        if (!numChildren || !tag.name) {
            return ctx.sOut;
        }
        if (tag.name == "text") {
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
        if (!ctx.omStylesheet.hasStyleBlock(node)) {
            return;
        }
        var omStyleBlock = ctx.omStylesheet.getStyleBlock(node, ctx.ID.getUnique);
        if (!omStyleBlock) {
            return;
        }
        this.styleBlock = omStyleBlock;
        omStyleBlock.tags = [this.id];
    };
    Tag.prototype.setClass = function (ctx) {
        var omStyleBlock = this.styleBlock;
        if (!omStyleBlock) {
            return;
        }
        if (!ctx.usePresentationAttribute) {
            this.setAttribute("class", omStyleBlock.class);
            return;
        }
        for (var i = 0, ii = omStyleBlock.rules.length; i < ii; i++) {
            var rule = omStyleBlock.rules[i];
            this.setAttribute(rule.propertyName, rule.value);
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
        if (ctx.usePresentationAttribute) {
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

    var factory = {
        circle: function (ctx, node) {
            var tag = new Tag("circle", {
                    cx: node.shape.cx,
                    cy: node.shape.cy,
                    r: node.shape.r,
                    transform: getTransform(node.transform, node.transformTX, node.transformTY)
                }, ctx);
            return tag.useTrick(ctx);
        },
        ellipse: function (ctx, node) {
            var tag = new Tag("ellipse", {
                    cx: node.shape.cx,
                    cy: node.shape.cy,
                    rx: node.shape.rx,
                    ry: node.shape.ry,
                    transform: getTransform(node.transform, node.transformTX, node.transformTY)
                }, ctx);
            return tag.useTrick(ctx);
        },
        line: function (ctx, node) {
            var tag = new Tag("line", {
                    x1: node.shape.x1,
                    y1: node.shape.y1,
                    x2: node.shape.x2,
                    y2: node.shape.y2,
                    transform: getTransform(node.transform, node.transformTX, node.transformTY)
                }, ctx);
            return tag.useTrick(ctx);

        },
        path: function (ctx, node) {
            var tag = new Tag("path", {
                    d: util.optimisePath(node.shape.path),
                    transform: getTransform(node.transform, node.transformTX, node.transformTY)
                }, ctx);
            return tag.useTrick(ctx);
        },
        polygon: function (ctx, node) {
            var tag = new Tag("polygon", {
                    points: util.pointsToString(node.shape.points),
                    transform: getTransform(node.transform, node.transformTX, node.transformTY)
                }, ctx);
            return tag.useTrick(ctx);
        },
        mask: function (ctx, node) {
            var attr = {};
            if (node.bounds) {
                attr.x = node.bounds.left;
                attr.y = node.bounds.top;
                attr.width = node.bounds.right - node.bounds.left;
                attr.height = node.bounds.bottom - node.bounds.top;
            }
            attr.maskUnits = node.maskUnits || "userSpaceOnUse";
            if (!node.bounds && !node.maskUnits) {
                delete attr.maskUnits;
            }
            attr.maskContentUnits = node.maskContentUnits;
            if (node.kind != "luminocity") {
                attr.style = "mask-type:alpha";
            }
            return new Tag("mask", attr, ctx);
        },
        rect: function (ctx, node) {
            var tag = new Tag("rect", {
                    x: node.shape.x,
                    y: node.shape.y,
                    width: node.shape.width,
                    height: node.shape.height,
                    transform: getTransform(node.transform, node.transformTX, node.transformTY)
                }, ctx);
            if (node.shapeRadii) {
                var r = parseFloat(node.shapeRadii[0]);
                tag.setAttributes({
                    rx: r,
                    ry: r
                });
            }
            return tag.useTrick(ctx);
        },
        text: function (ctx, node) {
            var tag = new Tag("text", {
                x: node.position.x + (node.position.unitX || ""),
                y: node.position.y + (node.position.unitY || ""),
                transform: getTransform(node.transform, node.transformTX, node.transformTY)
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
        generic: function (ctx, node) {
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
                    "xlink:href": node.pixel,
                    x: left,
                    y: top,
                    width: w,
                    height: h,
                    transform: getTransform(node.transform, node.transformTX, node.transformTY)
                }, ctx);
            return tag.useTrick(ctx);
        },
        group: function (ctx, node) {
            return new Tag("g", {}, ctx).useTrick(ctx);
        },
        artboard: function (ctx, node) {
            var artboard = new Tag("g", {id: "artboard-" + root.artboards++}, ctx).useTrick(ctx);
            artboard.isArtboard = true;
            return artboard;
        },
        tspan: function (ctx, node, sibling) {
            var tag = makeTSpan(Tag, ctx, sibling, node);

            if (node.children.length) {
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
        svg: function (ctx, node) {
            var preserveAspectRatio = ctx.config.preserveAspectRatio || "none",
                scale = ctx.config.scale || 1,
                left = round1k(ctx.viewBox.left),
                top = round1k(ctx.viewBox.top),

                width = Math.abs(ctx.viewBox.right - ctx.viewBox.left),
                height = Math.abs(ctx.viewBox.bottom - ctx.viewBox.top),
                scaledW = isFinite(ctx.config.targetWidth) ? round1k(scale * ctx.config.targetWidth) : round1k(scale * width),
                scaledH = isFinite(ctx.config.targetHeight) ? round1k(scale * ctx.config.targetHeight) : round1k(scale * height);

            width = round1k(width);
            height = round1k(height);

            return new Tag("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                "xmlns:xlink": "http://www.w3.org/1999/xlink",
                preserveAspectRatio: preserveAspectRatio,
                width: scaledW,
                height: scaledH,
                viewBox: [left, top, width, height]
            });
        },
    };

    Tag.make = function (ctx, node, sibling) {
        node = node || ctx.currentOMNode;
        var tag,
            f;
        if (node.type == "background") {
            return;
        }
        if (node == ctx.svgOM) {
            tag = factory.svg(ctx, node);
            tag.iamroot = true;
        } else {
            if (node.hasOwnProperty("visible") && !node.visible) {
                return;
            }
            if (node.type == "shape") {
                if (!node.shapeBounds) {
                    console.warn("Shape has no boundaries.");
                    return;
                }
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
        return tag;
    };

	module.exports = Tag;

}());
