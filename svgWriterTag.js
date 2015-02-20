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
        svgWriterIDs = require("./svgWriterIDs.js"),
        svgWriterStroke = require("./svgWriterStroke.js"),
        svgWriterFx = require("./svgWriterFx.js"),
        svgWriterText = require("./svgWriterText.js"),
        SVGWriterContext = require("./svgWriterContext.js"),
        attrsDefs = require('./attrdefs-database.js');

    var write = svgWriterUtils.write,
        writeln = svgWriterUtils.writeln,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent,
        writeColor = svgWriterUtils.writeColor,
        round1k = svgWriterUtils.round1k,
        getTransform = svgWriterUtils.getTranform,
        encodedText = svgWriterUtils.encodedText,
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
	Tag.getById = function (id) {
		if (!root) {
			return null;
		}
		return root.all[id] || null;
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
        } else if (digival == 0) {
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
            deft = desc[0],
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
        if (value + "" == deft + "") {
            delete this.attrs[name];
            return;
        }
        this.attrs[name] = value;
    };
    function writeDefs(ctx) {
        var hasRules = !ctx.usePresentationAttribute && ctx.omStylesheet.hasRules(),
            hasDefines = ctx.omStylesheet.hasDefines();

        if (hasRules || hasDefines) {
            svgWriterUtils.gradientStopsReset();
            writeln(ctx, ctx.currentIndent + "<defs>");
            indent(ctx);

            !ctx.usePresentationAttribute && ctx.omStylesheet.writeSheet(ctx);

            if (hasRules && hasDefines) {
                write(ctx, ctx.terminator);
            }
            ctx.omStylesheet.writeDefines(ctx);

            undent(ctx);
            writeln(ctx, ctx.currentIndent + "</defs>");
        }
    }
    Tag.prototype.write = function (ctx) {
        var tag = this,
            numChildren = tag.children && tag.children.length;
        this.setClass(ctx);
        if (tag.name) {
            if (tag.name == "#text") {
                write(ctx, encodedText(tag.text));
                return;
            }
            if (tag.name == "#comment") {
                writeln(ctx, ctx.currentIndent + "<!-- " + encodedText(tag.text) + " -->");
                return;
            }
            var ind = ctx.currentIndent;
            if (tag.name == "tspan" || tag.name == "textPath") {
                ind = "";
            }
            write(ctx, ind + "<" + tag.name);
            for (var name in tag.attrs) {
                write(ctx, " " + name + '="' + tag.attrs[name] + '"');
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
            return;
        }
        if (tag.name == "text") {
            writeln(ctx, "</" + tag.name + ">");
        } else if (tag.name == "tspan" || tag.name == "textPath") {
            write(ctx, "</" + tag.name + ">");
        } else {
            undent(ctx);
            writeln(ctx, ind + "</" + tag.name + ">");
        }
    };
    Tag.prototype.setStyleBlock = function (ctx, node) {
        node = node || ctx.currentOMNode;
        if (!ctx.omStylesheet.hasStyleBlock(node)) {
            return;
        }
        var omStyleBlock = ctx.omStylesheet.getStyleBlock(node);
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
        if (this.tricked || !svgWriterFx.hasFx(ctx) || !svgWriterStroke.hasStroke(ctx)) {
            return this;
        }
        var stroke = this.getAttribute("stroke"),
            fill = this.getAttribute("fill"),
            filter = this.getAttribute("filter"),
            id = svgWriterIDs.getUnique(this.name),
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
    function measure(node) {
        var bnds = node.originBounds || node.shapeBounds,
            top = parseFloat(bnds.top),
            right = parseFloat(bnds.right),
            bottom = parseFloat(bnds.bottom),
            left = parseFloat(bnds.left),
            w = right - left,
            h = bottom - top;
        return {
            x: left,
            y: top,
            width: w,
            height: h,
            cx: left + w / 2,
            cy: top + h / 2,
            r: h / 2,
            rx: w / 2,
            ry: h / 2,
            transform: getTransform(node.transform, node.transformTX, node.transformTY)
        };
    }

    var factory = {
        circle: function (ctx, node) {
            var box = measure(node),
                tag = new Tag("circle", {
                    cx: box.cx,
                    cy: box.cy,
                    r: box.r,
                    transform: box.transform
                }, ctx);
            return tag.useTrick(ctx);
        },
        ellipse: function (ctx, node) {
            var box = measure(node),
                tag = new Tag("ellipse", {
                    cx: box.cx,
                    cy: box.cy,
                    rx: box.rx,
                    ry: box.ry,
                    transform: box.transform
                }, ctx);
            return tag.useTrick(ctx);
        },
        rect: function (ctx, node) {
            var box = measure(node),
                tag = new Tag("rect", {
                    x: box.x,
                    y: box.y,
                    width: box.width,
                    height: box.height,
                    transform: box.transform
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
        path: function (ctx, node) {
            var tag = new Tag("path", {
                    d: util.optimisePath(node.pathData),
                    transform: getTransform(node.transform, node.transformTX, node.transformTY)
                }, ctx);
            return tag.useTrick(ctx);
        },
        text: function (ctx, node) {
            var children = node.children,
                rightAligned,
                centered;

            if (children && children.length > 0 &&
                children[0].style && children[0].style["text-anchor"] === "end") {
                rightAligned = true;
            } else if (children && children.length > 0 &&
                children[0].style && children[0].style["text-anchor"] === "middle") {
                centered = true;
            }
            var tag = new Tag("text", {}, ctx);
            if (rightAligned) {
                tag.setAttribute("x", "100%");
                node.position.x = 0;
            } else {
                tag.setAttribute("x", node.position.x + (node.position.unitX || ""));
            }
            tag.setAttributes({
                y: node.position.y + (node.position.unitY || ""),
                transform: getTransform(node.transform, node.transformTX, node.transformTY)
            });
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
            var top = parseFloat(node.shapeBounds.top),
                right = parseFloat(node.shapeBounds.right),
                bottom = parseFloat(node.shapeBounds.bottom),
                left = parseFloat(node.shapeBounds.left),
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
            return new Tag("g", {}, ctx).useTrick(ctx);
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
                left = round1k(node.viewBox.left),
                top = round1k(node.viewBox.top),

                width = Math.abs(node.viewBox.right - node.viewBox.left),
                height = Math.abs(node.viewBox.bottom - node.viewBox.top),
                scaledW = isFinite(ctx.config.targetWidth) ? round1k(scale * ctx.config.targetWidth) : round1k(scale * width),
                scaledH = isFinite(ctx.config.targetHeight) ? round1k(scale * ctx.config.targetHeight) : round1k(scale * height);

            width = round1k(width);
            height = round1k(height);

            return new Tag("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                "xmlns:xlink": "http://www.w3.org/1999/xlink",
                preserveAspectRatio: preserveAspectRatio,
                x: node.offsetX,
                y: node.offsetY,
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
            tag.all = {};
            root = tag;
        } else {
            if (node.type == "shape") {
                if (!node.shapeBounds) {
                    console.warn("Shape has no boundaries.");
                    return;
                }
                f = factory[node.shape];
                if (!f) {
                    console.warn("NOT HANDLED DEFAULT " + node.shape);
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
