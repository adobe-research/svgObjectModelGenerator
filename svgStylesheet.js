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

/* Part of the write context, built up during preprocessing */

(function () {
    "use strict";

    var svgWriterUtils = require("./svgWriterUtils.js"),
        Tag = require("./svgWriterTag.js"),
        svgWriterGradient = require("./svgWriterGradient.js"),
        SVGWriterContext = require("./svgWriterContext.js"),
        writeln = svgWriterUtils.writeln,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent;

    function CSSStyleBlock(cls) {
        if (cls && cls.splice) {
            this.class = cls;
        } else {
            this.class = [].slice.call(arguments, 0);
        }
        this.rules = {};
        this.tags = [];
    }

    (function (proto) {

        proto.addRule = function (prop, value) {
            var def = Tag.getDefault("*", prop),
                val = Tag.getValue("*", prop, value, {precision: 3});
            if (val + "" == def + "") {
                delete this.rules[prop];
            } else {
                this.rules[prop] = value;
            }
        };

        proto.removeRule = function (prop, val) {
            if (val == null || this.rules[prop] == val) {
                delete this.rules[prop];
            }
        };

        proto.hasRules = function () {
            return Object.keys(this.rules).length > 0;
        };

        function mapper(ctx) {
            return function (className) {
                return ctx.prefix + svgWriterUtils.escapeCSS(className);
            };
        }

        proto.write = proto.toString = function (ctx) {
            ctx = ctx || new SVGWriterContext({});
            writeln(ctx, ctx.currentIndent + "." + this.class.map(mapper(ctx)).join("," + ctx.space + ".") + ctx.space + "{");
            indent(ctx);

            for (var name in this.rules) {
                var value = Tag.getValue("*", name, this.rules[name], ctx);
                writeln(ctx, ctx.currentIndent + name + ":" + ctx.space + value + ";");
            }

            undent(ctx);
            writeln(ctx, ctx.currentIndent + "}");
            return ctx.sOut;
        };

        proto.hasProperty = function (prop) {
            return prop in this.rules;
        };

        proto.getPropertyValue = function (prop) {
            return this.rules[prop];
        };

        proto.isEqual = function (block) {
            if (!block) {
                return false;
            }
            for (var key in this.rules) {
                if (block.rules[key] != this.rules[key]) {
                    return false;
                }
            }
            for (key in block.rules) {
                if (block.rules[key] != this.rules[key]) {
                    return false;
                }
            }
            return true;
        };

    }(CSSStyleBlock.prototype));

    function SVGStylesheet() {

        this.defines = {};
        this.eleDefines = {};
        this.blocks = {};
    }

    (function (proto) {
        proto.hasDefines = function () {
            if (this.defs) {
                return !!Object.keys(this.defs).length;
            }
            return false;
        };

        function countTags(tag) {
            var count = 1;
            if (!tag.chidren || !tag.children.length) {
                return count;
            }

            for (var i = 0; i < tag.children.length; i++) {
                count += countTags(tag.children[i]);
            }
            return count;
        }

        proto.def = function (tag, appliedAs, fingerprint) {
            this.defs = this.defs || {};
            if (fingerprint == null) {
                var id = tag.getAttribute("id"),
                    name = tag.getAttribute("data-name");
                tag.setAttributes({
                    id: "",
                    "data-name": ""
                });
                fingerprint = tag.toString();
                tag.setAttributes({
                    id: id,
                    "data-name": name
                });
            }
            if (this.defs[fingerprint]) {
                appliedAs && this.defs[fingerprint].as.push(appliedAs);
                if (tag.ctx) {
                    tag.ctx.tagCounter -= countTags(tag);
                }
            } else {
                this.defs[fingerprint] = {
                    tag: tag,
                    as: appliedAs ? [appliedAs] : []
                };
            }
        };

        proto.getDefsTag = function () {

            var defnId,
                defn,
                sheet = this,
                defs = new Tag("defs");

            defs.children.push(this.getStyleTag());
            svgWriterGradient.gradientStopsReset();

            if (this.defs) {
                for (defnId in this.defs) {
                    defn = this.defs[defnId];
                    defs.children.push(defn.tag);
                    for (var i = 0; i < defn.as.length; i++) {
                        defn.as[i](defn.tag);
                    }
                }
            }


            var write = defs.write;
            defs.write = defs.toString = function (ctx) {
                var hasRules = !ctx.styling && sheet.hasRules(),
                    hasDefines = sheet.hasDefines();
                if (hasRules || hasDefines) {
                    return write.call(this, ctx);
                }
                return "";
            };
            return defs;
        };

        proto.hasRules = function () {
            for (var cls in this.blocks) {
                if (this.blocks[cls] && this.blocks[cls].hasRules()) {
                    return true;
                }
            }
            return false;
        };

        var classID = 1;
        proto.getStyleBlock = function (omNode) {
            omNode.className = omNode.className || "cls-" + classID++;
            omNode.styleBlock = omNode.styleBlock || new CSSStyleBlock(omNode.className);
            this.blocks[omNode.className] = omNode.styleBlock;
            return omNode.styleBlock;
        };

        proto.consolidateStyleBlocks = function () {

            //find dupes and make em shared...
            var dupTable = {},
                className,
                defn,
                i,
                aDups,
                dup,
                fingerprint,
                tag,
                tags;

            for (className in this.blocks) {
                if (this.blocks.hasOwnProperty(className)) {
                    defn = this.blocks[className];
                    if (!defn.hasRules()) {
                        delete this.blocks[className];
                        continue;
                    }
                    fingerprint = JSON.stringify(defn.rules);
                    defn.fingerprint = fingerprint;

                    dupTable[fingerprint] = dupTable[fingerprint] || [];
                    dupTable[fingerprint].push(defn);
                }
            }

            //migrate any eleDefines to re-point
            for (fingerprint in dupTable) {
                if (dupTable.hasOwnProperty(fingerprint)) {
                    aDups = dupTable[fingerprint];
                    if (aDups && aDups.length) {
                        for (i = 1; i < aDups.length; i++) {
                            dup = aDups[i];
                            tags = dup.tags;
                            for (var j = 0; tags && j < tags.length; j++) {
                                tag = Tag.getById(tags[j]);
                                if (tag) {
                                    delete this.blocks[tag.styleBlock.class];
                                    tag.styleBlock = aDups[0];
                                    aDups[0].tags.push(tags[j]);
                                }
                            }
                            aDups[0].consolidated = true;
                        }
                    }
                }
            }
        };

        proto.getStyleTag = function () {
            var style = new Tag("style");
            style.write = style.toString = this.writeSheet.bind(this);
            return style;
        };

        proto.writeSheet = function (ctx) {
            if (ctx.styling) {
                return "";
            }
            var blockClass,
                blocks = [];

            for (blockClass in this.blocks) {
                if (this.blocks.hasOwnProperty(blockClass) && this.blocks[blockClass].hasRules() && this.blocks[blockClass].tags && this.blocks[blockClass].tags.length) {
                    blocks.push(this.blocks[blockClass]);
                }
            }

            var i = 0,
                len = blocks.length;

            if (!len) {
                return "";
            }

            writeln(ctx, ctx.currentIndent + "<style>");
            indent(ctx);

            // extract all common rules into comma
            blocks = this.extract(blocks);

            len = blocks.length;
            for (; i < len; i++) {
                i && writeln(ctx); // new line before blocks
                blocks[i].write(ctx);
            }

            undent(ctx);
            writeln(ctx, ctx.currentIndent + "</style>");
            ctx.tick && ctx.tick("write");
        };

        proto.extract = function (blocks) {
            var byRule = {},
                byClass = {},
                block,
                cls,
                rule,
                name,
                i;
            for (i = 0; i < blocks.length; i++) {
                cls = blocks[i].class;
                for (var key in blocks[i].rules) {
                    var value = blocks[i].rules[key];
                    name = key + ":" + value;
                    byRule[name] = byRule[name] || {
                        name: key,
                        value: value,
                        classes: []
                    };
                    byRule[name].classes = byRule[name].classes.concat(cls);
                }
            }
            blocks = [];
            for (name in byRule) {
                rule = byRule[name];
                var classes = rule.classes.sort();
                if (byClass[classes]) {
                    byClass[classes].addRule(rule.name, rule.value);
                } else {
                    block = new CSSStyleBlock(classes);
                    block.addRule(rule.name, rule.value);
                    blocks.push(block);
                    byClass[classes] = block;
                }
            }
            return blocks;
        };

    }(SVGStylesheet.prototype));

    module.exports = SVGStylesheet;

}());
