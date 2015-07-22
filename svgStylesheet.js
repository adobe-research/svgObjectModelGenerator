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
        undent = svgWriterUtils.undent,
        ONLY_EXTERNALIZE_CONSOLIDATED = false;

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

        proto.clone = function () {
            var clone = new CSSStyleBlock;
            clone.class = this.class.slice(0);
            for (var name in this.rules) {
                clone.addRule(name, this.rules[name]);
            }
            clone.tags = this.tags ? this.tags.slice(0) : [];
            clone.fingerprint = this.fingerprint;
            return clone;
        };

        proto.add = function (block) {
            this.class = this.class.concat(block.class);
            var uniq = {};
            for (var i = 0; i < this.class.length; i++) {
                if (uniq[this.class[i]]) {
                    this.class.splice(i, 1);
                    i--;
                } else {
                    uniq[this.class[i]] = 1;
                }
            }
            for (var name in block.rules) {
                this.addRule(name, block.rules[name]);
            }
        };

        proto.hasRules = function () {
            return Object.keys(this.rules).length > 0;
        };

        proto.write = proto.toString = function (ctx) {
            ctx = ctx || new SVGWriterContext({});
            var i;
            writeln(ctx, ctx.currentIndent + "." + this.class.map(svgWriterUtils.escapeCSS).join("," + ctx.space + ".") + ctx.space + "{");
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
            var isIt,
                keys1 = Object.keys(this.rules),
                keys2 = Object.keys(block.rules),
                a2 = [],
                i;
            if (keys1.length != keys2.length) {
                return false;
            }
            keys1.sort();
            keys2.sort();
            for (i = 0; i < keys1.length; i++) {
                if (keys1[i] != keys2[i] || this.rules[keys1[i]] != block.rules[keys1[i]]) {
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
            var hasDefines = false,
                defn;

            for (defn in this.defines) {
                if (this.defines.hasOwnProperty(defn)) {
                    if (this.defines[defn] && !this.defines[defn].written) {
                        hasDefines = true;
                        break;
                    }
                }
            }

            return hasDefines;
        };

        proto.getDefines = function (elId) {
            return this.eleDefines[elId];
        };

        proto.getDefine = function (elId, type) {
            var aEl = this.getDefines(elId),
                i;

            for (i = 0; aEl && i < aEl.length; i++) {
                if (aEl[i].type === type) {
                    return aEl[i];
                }
            }
            return null;
        };

        proto.define = function (type, elId, defnId, defnOut, defnFingerprint) {

            this.defines[defnId] = {
                type: type,
                defnId: defnId,
                fingerprint: defnFingerprint,
                out: defnOut,
                elements: [elId],
                written: false
            };

            this.addElementDefn(this.eleDefines, elId, this.defines[defnId]);
        };

        proto.addElementDefn = function (eleList, elId, defn) {
            eleList[elId] = eleList[elId] || [];
            eleList[elId].push(defn);

            // Always consolidate all defines to remove
            // duplicates right away.
            this.consolidateDefines();
        };

        proto.getDefsTag = function () {

            var defnId,
                defn,
                sheet = this,
                defs = new Tag("defs");

            defs.children.push(this.getStyleTag());
            svgWriterGradient.gradientStopsReset();
            for (defnId in this.defines) {
                if (this.defines.hasOwnProperty(defnId)) {
                    defn = this.defines[defnId];

                    if (!ONLY_EXTERNALIZE_CONSOLIDATED || ONLY_EXTERNALIZE_CONSOLIDATED && defn.consolidated) {
                        defs.children.push(defn.out);
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

        proto.removeElementDefn = function (elId, defnId) {
            var aDef = this.eleDefines[elId],
                i;

            for (i = 0; aDef && i < aDef.length; i++) {
                if (aDef[i].defnId === defnId) {
                    aDef.splice(i, 1);
                    this.eleDefines[elId] = aDef;
                    break;
                }
            }

            delete this.defines[defnId];
        };

        proto.removeElementBlocks = function (elId, className) {
            var aDef = this.eleBlocks[elId],
                i;

            for (i = 0; aDef && i < aDef.length; i++) {
                if (aDef[i].className === className) {
                    aDef.splice(i, 1);
                    this.eleBlocks[elId] = aDef;
                    break;
                }
            }

            for (i = 0; i < className.length; i++) {
                delete this.blocks[className[i]];
            }
        };

        proto.consolidateDefines = function () {

            //find dupes and make em shared...
            var dupTable = {},
                defnId,
                defn,
                i,
                aDups,
                dup,
                dupElId,
                fingerprint;

            for (defnId in this.defines) {
                if (this.defines.hasOwnProperty(defnId)) {
                    defn = this.defines[defnId];

                    dupTable[defn.fingerprint] = dupTable[defn.fingerprint] || [];
                    dupTable[defn.fingerprint].push(defn);
                }
            }

            //migrate any eleDefines to re-point
            for (fingerprint in dupTable) {
                if (dupTable.hasOwnProperty(fingerprint)) {
                    aDups = dupTable[fingerprint];
                    if (aDups && aDups.length > 1) {
                        for (i = 1; i < aDups.length; i++) {
                            dup = aDups[i];
                            dupElId = dup.elements[0];

                            this.removeElementDefn(dupElId, dup.defnId);
                            this.addElementDefn(this.eleDefines, dupElId, aDups[0]);
                            aDups[0].elements.push(dupElId);
                            aDups[0].consolidated = true;
                        }
                    }
                }
            }
        };

        proto.hasRules = function () {
            for (var cls in this.blocks) {
                if (this.blocks[cls] && this.blocks[cls].hasRules()) {
                    return true;
                }
            }
            return false;
        };

        proto.hasStyleBlock = function (omNode) {
            return omNode.styleBlock && omNode.styleBlock.hasRules();
        };

        proto.getStyleBlock = function (omNode, getUnique) {

            omNode.className = omNode.className || getUnique("cls");

            //TBD: factor in IDs

            omNode.styleBlock = omNode.styleBlock || new CSSStyleBlock(omNode.className);

            this.blocks[omNode.className] = omNode.styleBlock;
            // We create an styleBlock for each element initially.
            // Store the element for later reference.
            omNode.styleBlock.element = omNode.id;

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
                dupElId,
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
                    if (aDups && aDups.length >= 1) {
                        for (i = 1; i < aDups.length; i++) {
                            dup = aDups[i];
                            tags = dup.tags;
                            for (var j = 0; tags && j < tags.length; j++) {
                                tag = Tag.getById(tags[j]);
                                if (tag) {
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
            this.hasDefines() && writeln(ctx);
        };

        proto.extract = function (blocks) {
            var byRule = {},
                byClass = {},
                block,
                cls,
                rule,
                name,
                i,
                j;
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
