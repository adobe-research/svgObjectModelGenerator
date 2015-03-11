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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, bitwise: true */
/*global define: true, module: true, require: true */

/* Part of the write context, built up during preprocessing */

(function () {
    "use strict";

    var svgWriterUtils = require("./svgWriterUtils.js"),
        Tag = require("./svgWriterTag.js"),
        svgWriterGradient = require("./svgWriterGradient.js"),
        ID = require("./idGenerator.js"),
        svgWriterContext = require("./svgWriterContext.js");

    var write = svgWriterUtils.write,
        writeln = svgWriterUtils.writeln,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent,
        writeColor = svgWriterUtils.writeColor,
        indentify = svgWriterUtils.indentify;

    var ONLY_EXTERNALIZE_CONSOLIDATED = false;

    function CSSStyleRule(prop, val) {
        this.propertyName = prop;
        this.value = val;
    }

    (function (proto) {
        proto.write = function (ctx) {
            writeln(ctx, ctx.currentIndent + this);
        };

        proto.toString = function () {
            return this.propertyName + ": " + this.value + ";";
        };
    }(CSSStyleRule.prototype));

    function CSSStyleBlock(cls) {
        if (cls && cls.splice) {
            this.class = cls;
        } else {
            this.class = [].slice.call(arguments, 0);
        }
        this.rules = [];
        this.elements = [];
    }

    (function (proto) {

        proto.addRule = function (prop, val) {
            this.rules.push(new CSSStyleRule(prop, val));
        };

        proto.removeRule = function (prop, val) {
            for (var i = 0, len = this.rules.length; i < len; i++) {
                if (this.rules[i].propertyName == prop && this.rules[i].value == val) {
                    this.rules.splice(i, 1);
                    break;
                }
            }
        };

        proto.clone = function () {
            var clone = new CSSStyleBlock();
            clone.class = this.class.slice(0);
            for (var i = 0, len = this.rules.length; i < len; i++) {
                clone.addRule(this.rules[i].propertyName, this.rules[i].value);
            }
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
            for (var i = 0, len = block.rules.length; i < len; i++) {
                if (!this.hasProperty(block.rules[i].propertyName)) {
                    this.addRule(block.rules[i].propertyName, block.rules[i].value);
                }
            }
        };

        proto.hasRules = function () {
            return (this.rules.length > 0);
        };

        proto.write = proto.toString = function (ctx) {
            ctx = ctx || new svgWriterContext({});
            var i;

            writeln(ctx, ctx.currentIndent + "." + this.class.join(", .") + " {");
            indent(ctx);

            for (i = 0; i < this.rules.length; i++) {
                this.rules[i].write(ctx);
            }

            undent(ctx);
            writeln(ctx, ctx.currentIndent + "}");
            return ctx.sOut;
        };

        proto.hasProperty = function (prop) {
            var i;
            for (i = 0; i < this.rules.length; i++) {
                if (this.rules[i].propertyName === prop) {
                    return true;
                }
            }
            return false;
        };

        proto.getPropertyValue = function (prop) {
            var i;
            for (i = 0; i < this.rules.length; i++) {
                if (this.rules[i].propertyName === prop) {
                    return this.rules[i].value;
                }
            }
            return;
        }

    }(CSSStyleBlock.prototype));

	function SVGStylesheet() {

        this.defines = {};
        this.eleDefines = {};
        this.blocks = {};
        this.eleBlocks = {};
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
            return !!(omNode.styleBlock && omNode.styleBlock.hasRules());
        };

        proto.getStyleBlock = function (omNode) {

            if (omNode.styleBlock) {
                return omNode.styleBlock;
            }

            omNode.className = omNode.className || ID.getUnique("cls");

            //TBD: factor in IDs

            omNode.styleBlock = omNode.styleBlock || new CSSStyleBlock(omNode.className);

            this.blocks[omNode.className] = omNode.styleBlock;
            // We create an styleBlock for each element initially.
            // Store the element for later reference.
            omNode.styleBlock.element = omNode.id;

            return omNode.styleBlock;
        };

        proto.getStyleBlockForElement = function (omNode) {

            if (this.eleBlocks[omNode.id]) {
                return this.eleBlocks[omNode.id][0];
            }
            return null;
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
                        this.addElementDefn(this.eleBlocks, aDups[0].element, aDups[0]);

                        for (i = 1; i < aDups.length; i++) {
                            dup = aDups[i];
                            dupElId = dup.element;
                            tags = dup.tags;
                            for (var j = 0; tags && j < tags.length; j++) {
                                tag = Tag.getById(tags[j]);
                                if (tag) {
                                    tag.styleBlock = aDups[0];
                                    aDups[0].tags.push(tags[j]);
                                }
                            }

                            this.removeElementBlocks(dupElId, dup.class);
                            this.addElementDefn(this.eleBlocks, dupElId, aDups[0]);
                            aDups[0].elements.push(dupElId);
                            aDups[0].consolidated = true;
                        }
                    }
                }
            }
        }

        proto.writeSheet = function (ctx) {

            var blockClass,
                blocks = [];

            writeln(ctx, ctx.currentIndent + "<style>");
            indent(ctx);

            for (blockClass in this.blocks) {
                if (this.blocks.hasOwnProperty(blockClass)) {
                    if (this.blocks[blockClass].hasRules()) {
                        blocks.push(this.blocks[blockClass]);
                    }
                }
            }

            // extract all common rules into comma
            blocks = this.extract(blocks);

            for (var i = 0, len = blocks.length; i < len; i++) {
                i && writeln(ctx, ""); // new line before blocks
                blocks[i].write(ctx);
            }

            undent(ctx);
            writeln(ctx, ctx.currentIndent + "</style>");

        };

        proto.writePredefines = function (ctx) {
            var omIn = ctx.currentOMNode,
                eleDefines = this.getDefines(omIn.id),
                defn,
                i;
            if (eleDefines && eleDefines.length > 0) {
                for (i = 0; i < eleDefines.length; i++) {
                    defn = eleDefines[i];
                    if (!defn.written) {
                        write(ctx, indentify(ctx.currentIndent, defn.out));
                        defn.written = true;
                    }
                }
            }
        };

        proto.writeDefines = function (ctx) {

            var defnId,
                defn;

            svgWriterGradient.gradientStopsReset();
            for (defnId in this.defines) {
                if (this.defines.hasOwnProperty(defnId)) {
                    defn = this.defines[defnId];

                    if (!defn.written && (!ONLY_EXTERNALIZE_CONSOLIDATED || (ONLY_EXTERNALIZE_CONSOLIDATED && defn.consolidated))) {
                        write(ctx, indentify(ctx.currentIndent, defn.out));
                        defn.written = true;
                    }
                }
            }
        };

        var extract = proto.extract = function (blocks) {
            var out,
                oldout = [];
            out = extract.finder(blocks);
            while (out.join() != oldout.join()) {
                out = extract.finder(out);
                oldout = out = extract.consolidate(out);
            }
            if (blocks.join().length > out.join().length) {
                return out;
            }
            return blocks;
        }

        extract.union = function (a, b, ba, bb) {
            var bab = new CSSStyleBlock([].concat(a.class, b.class)),
                rules = {},
                name,
                val;

            for (var i = 0, len = a.rules.length; i < len; i++) {
                rules[a.rules[i].propertyName] = a.rules[i].value;
            }
            for (i = 0, len = b.rules.length; i < len; i++) {
                name = b.rules[i].propertyName;
                val = b.rules[i].value;
                if (rules[name] == val) {
                    bab.addRule(name, val);
                    ba.removeRule(name, val);
                    bb.removeRule(name, val);
                }
            }
            return bab;
        };
        extract.finder = function (blocks) {
            var blocksnew = [],
                blocksadd = [];
            for (var i = 0, len = blocks.length; i < len; i++) {
                !i && (blocksnew[i] = blocks[i].clone());
                for (var j = i + 1; j < len; j++) {
                    !i && (blocksnew[j] = blocks[j].clone());
                    var u = extract.union(blocks[i], blocks[j], blocksnew[i], blocksnew[j]);
                    if (u) {
                        blocksadd.push(u);
                    }
                }
            }
            return blocksadd.concat(blocksnew);
        };
        extract.consolidate = function (blocks) {
            var dup = {},
                out = [],
                fprint;
            for (var i = 0, len = blocks.length; i < len; i++) {
                fprint = blocks[i].rules;
                if (fprint.length) {
                    dup[fprint] = dup[fprint] || [];
                    dup[fprint].push(blocks[i]);
                }
            }
            for (var key in dup) {
                if (dup.hasOwnProperty(key)) {
                    var first = dup[key][0];
                    for (i = 1, len = dup[key].length; i < len; i++) {
                        first.add(dup[key][i]);
                    }
                    out.push(first);
                }
            }
            return out;
        }
    }(SVGStylesheet.prototype));

	module.exports = SVGStylesheet;

}());
