/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, bitwise: true */
/*global define: true, module: true, require: true */

/* Part of the write context, built up during preprocessing */

(function () {
    "use strict";
    
    var svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterIDs = require("./svgWriterIDs.js");
    
    var write = svgWriterUtils.write,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent,
        writeColor = svgWriterUtils.writeColor,
        indentify = svgWriterUtils.indentify;
    
    var ONLY_EXTERNALIZE_CONSOLIDATED = false;
    
    function CSSStyleRule(prop, val) {
        this.propertyName = prop;
        this.value = val;
        
        this.write = function (ctx) {
            write(ctx, ctx.currentIndent + this.propertyName + ": " + this.value + ";" + ctx.terminator);
        };
    }
    
    function CSSStyleBlock(cls) {
        this.class = cls;
        this.rules = [];
        
        this.addRule = function (prop, val) {
            this.rules.push(new CSSStyleRule(prop, val));
        };
        
        this.hasRules = function () {
            return (this.rules.length > 0);
        };
        
        this.write = function (ctx) {
            var i;
            
            write(ctx, ctx.currentIndent + "." + this.class + " {" + ctx.terminator);
            indent(ctx);
            
            for (i = 0; i < this.rules.length; i++) {
                this.rules[i].write(ctx);
            }
            
            undent(ctx);
            write(ctx, ctx.currentIndent + "}" + ctx.terminator);
        };
        
        this.hasProperty = function (prop) {
            var i;
            for (i = 0; i < this.rules.length; i++) {
                if (this.rules[i].propertyName === prop) {
                    return true;
                }
            }
            return false;
        };

        this.getPropertyValue = function (prop) {
            var i;
            for (i = 0; i < this.rules.length; i++) {
                if (this.rules[i].propertyName === prop) {
                    return this.rules[i].value;
                }
            }
            return;
        }
    }
    
	function SVGStylesheet() {
        
        this.defines = {};
        this.eleDefines = {};
        this.blocks = {};
        
        this.hasDefines = function () {
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
        
        this.getDefines = function (elId) {
            return this.eleDefines[elId];
        };
        
        this.getDefine = function (elId, type) {
            var aEl = this.getDefines(elId),
                i;
            
            for (i = 0; aEl && i < aEl.length; i++) {
                if (aEl[i].type === type) {
                    return aEl[i];
                }
            }
            return null;
        };
        
        this.define = function (type, elId, defnId, defnOut, defnFingerprint) {
            
            this.defines[defnId] = {
                type: type,
                defnId: defnId,
                fingerprint: defnFingerprint,
                out: defnOut,
                elements: [elId],
                written: false
            };
            
            this.addElementDefn(elId, this.defines[defnId]);
        };
        
        this.addElementDefn = function (elId, defn) {
            this.eleDefines[elId] = this.eleDefines[elId] || [];
            this.eleDefines[elId].push(defn);

            // Always consolidate all defines to remove
            // duplicates right away.
            this.consolidateDefines();
        };
        
        this.removeElementDefn = function (elId, defnId) {
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
        
        this.consolidateDefines = function () {
            
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
                            this.addElementDefn(dupElId, aDups[0]);
                            aDups[0].elements.push(dupElId);
                            aDups[0].consolidated = true;
                        }
                    }
                }
            }
        };
        
        this.hasRules = function () {
            var hasRules = false,
                cls;
            for (cls in this.blocks) {
                if (this.blocks.hasOwnProperty(cls)) {
                    if (this.blocks[cls].hasRules()) {
                        hasRules = true;
                        break;
                    }
                }
            }
            return hasRules;
        };
        
        this.hasStyleBlock = function (omNode) {
            return !!(omNode.styleBlock && omNode.styleBlock.hasRules());
        };
        
        this.getStyleBlock = function (omNode) {
            
            omNode.className = omNode.className || svgWriterIDs.getUnique("cls");
            
            //TBD: factor in IDs
            
            omNode.styleBlock = omNode.styleBlock || new CSSStyleBlock(omNode.className);
            
            this.blocks[omNode.className] = omNode.styleBlock;
            
            return omNode.styleBlock;
        };
        
        this.writeSheet = function (ctx) {
            
            var blockClass;
            
            write(ctx, ctx.currentIndent + "<style type=\"text/css\">" + ctx.terminator);
            indent(ctx);
            
            for (blockClass in this.blocks) {
                if (this.blocks.hasOwnProperty(blockClass)) {
                    if (this.blocks[blockClass].hasRules()) {
                        write(ctx, ctx.terminator);//new line before blocks
                        this.blocks[blockClass].write(ctx);
                    }
                }
            }
            
            undent(ctx);
            write(ctx, ctx.currentIndent + "</style>" + ctx.terminator);
            
        };
        
        this.writePredefines = function (ctx) {
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
        
        this.writeDefines = function (ctx) {
            
            var defnId,
                defn;
            
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
        
	}

	module.exports = SVGStylesheet;
    
}());
     
    