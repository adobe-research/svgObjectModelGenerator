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
/*global define: true, require: true */

/* Help construct the svgOM from generator data */

(function () {
"use strict";
    
    var SVGStylesheet = require("./svgStylesheet.js"),
        svgWriterStroke = require("./svgWriterStroke.js"),
        svgWriterFill = require("./svgWriterFill.js"),
        svgWriterFx = require("./svgWriterFx.js"),
        svgWriterUtils = require("./svgWriterUtils.js"),
        px = svgWriterUtils.px;
         
    
	function SVGWriterPreprocessor() {
        
        this.externalizeStyles = true;
        
        
        this.externalizeStyles = function (ctx) {
            var omIn = ctx.currentOMNode,
                property,
                styleBlock;

            ctx.stylesCurrentBlock = null;
            
            svgWriterFill.externalizeStyles(ctx);
            svgWriterStroke.externalizeStyles(ctx);
            svgWriterFx.externalizeStyles(ctx);

            styleBlock = ctx.omStylesheet.getStyleBlock(omIn);

            for (property in omIn.style) {
                if (omIn.style[property] === undefined) {
                    continue;
                }
                // fill, stroke and fx are handled above.
                if (property === "fill" || property === "stroke" | property ==="fx") {
                    continue;
                }
                if (property === "font-size") {
                    styleBlock.addRule(property, px(ctx, omIn.style[property]) + "px");
                    continue;
                }
                styleBlock.addRule(property, omIn.style[property]);
            }
            
        };
        
        this.processSVGNode = function (ctx) {

            var omIn = ctx.currentOMNode,
                children = omIn.children,
                i,
                childNode;
            
            if (this.externalizeStyles) {
                this.externalizeStyles(ctx);
            }

            if (omIn.type == "textPath") {
                svgWriterUtils.writeTextPath(ctx, omIn.pathData);
            }
            
            //TBD: more pre-processing
            // - groupify coordinates
            // - add groups for combining effects
            // - 
            
            for (i = 0; i < children.length; i++) {
                childNode = children[i];
                ctx.currentOMNode = childNode;
                this.processSVGNode(ctx);
            }
        };
        
        this.processSVGOM = function (ctx) {
            var omSave = ctx.currentOMNode;
            ctx.omStylesheet = new SVGStylesheet();
            this.processSVGNode(ctx, ctx.currentOMNode);
            ctx.currentOMNode = omSave;
        };
        
	}

	module.exports = new SVGWriterPreprocessor();
    
}());
     
    