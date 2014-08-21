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
        
        this.growBoundsUniform = function (bounds, delta) {
            bounds.left -= delta;
            bounds.right += delta;
            bounds.top -= delta;
            bounds.bottom += delta;
        };
        
        this.recordBounds = function (ctx, omIn) {
            var bnds = ctx.contentBounds,
                bndsIn = omIn.bounds;
            
            if (omIn.type === "shape") {
                bndsIn = omIn.shapeBounds;
                
                //if the shape has a border then we need to bump the bounds up?
                //if (omIn.style.stroke && omIn.style.stroke.strokeEnabled && omIn.style.stroke.lineWidth) {
                    //this.growBoundsUniform(bndsIn, omIn.style.stroke.lineWidth);
                //}
            }
            
            if (bndsIn) {
                if (!isFinite(bnds.left) || bndsIn.left < bnds.left) {
                    bnds.left = bndsIn.left;
                }
                if (!isFinite(bnds.right) || bndsIn.right > bnds.right) {
                    bnds.right = bndsIn.right;
                }
                if (!isFinite(bnds.top) || bndsIn.top < bnds.top) {
                    bnds.top = bndsIn.top;
                }
                if (!isFinite(bnds.bottom) || bndsIn.bottom > bnds.bottom) {
                    bnds.bottom = bndsIn.bottom;
                }
            }
        };
        
        //shift the bounds recorded in recordBounds
        this.shiftBounds = function (ctx, omIn) {
            var bnds = omIn.bounds;
            if (omIn.type === "shape") {
                bnds = omIn.shapeBounds;
            }
            if (bnds) {
                bnds.left += ctx._shiftContentX;
                bnds.right += ctx._shiftContentX;
                bnds.top += ctx._shiftContentY;
                bnds.bottom += ctx._shiftContentY;
            }
        };
        
        this.preprocessSVGNode = function (ctx) {
            var omIn = ctx.currentOMNode,
                children = omIn.children;
            
            if (ctx.config.trimToArtBounds) {
                this.recordBounds(ctx, omIn);
            }
            
            if (children) {
                children.forEach(function (childNode) {
                    ctx.currentOMNode = childNode;
                    this.preprocessSVGNode(ctx);
                }.bind(this));
            }
        };
        
        this.finalizePreprocessing = function (ctx) {
            var bnds = ctx.contentBounds;
            if (ctx.config.trimToArtBounds) {
                
                if (bnds) {
                    bnds.left = bnds.left || 0;
                    bnds.right = bnds.right || 0;
                    bnds.top = bnds.top || 0;
                    bnds.bottom = bnds.bottom || 0;

                    ctx._shiftContentX = bnds.left * -1.0;
                    ctx._shiftContentY = bnds.top * -1.0;
                    
                    if (ctx.svgOM && ctx.svgOM.viewBox) {
                        ctx.svgOM.viewBox.left = 0;
                        ctx.svgOM.viewBox.top = 0;
                        ctx.svgOM.viewBox.right = Math.abs(bnds.right - bnds.left);
                        ctx.svgOM.viewBox.bottom = Math.abs(bnds.bottom - bnds.top);
                    }
                }
            }
        };
        
        this.processSVGNode = function (ctx) {

            var omIn = ctx.currentOMNode,
                children = omIn.children;
            
            if (ctx.config.trimToArtBounds && omIn !== ctx.svgOM) {
                this.shiftBounds(ctx, omIn);
            }
            
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
            
            if (children) {
                children.forEach(function (childNode) {
                    ctx.currentOMNode = childNode;
                    this.processSVGNode(ctx);
                }.bind(this));
            }
        };
        
        this.preprocessingNecessary = function (ctx) {
            //more reasons to be added as necessary
            if (ctx.config.trimToArtBounds) {
                return true;
            }
            return false;
        };
        
        this.processSVGOM = function (ctx) {
            var omSave = ctx.currentOMNode;
            ctx.omStylesheet = new SVGStylesheet();
            
            if (this.preprocessingNecessary(ctx)) {
                this.preprocessSVGNode(ctx, ctx.currentOMNode);
                this.finalizePreprocessing(ctx);
                ctx.currentOMNode = omSave;
            }

            this.processSVGNode(ctx, ctx.currentOMNode);
            
            ctx.currentOMNode = omSave;
        };
        
	}

	module.exports = new SVGWriterPreprocessor();
    
}());
     
    