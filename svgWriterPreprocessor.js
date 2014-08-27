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
/*global define: true, require: true, module: true */

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
        
        this.shiftBoundsX = function (bounds, delta) {
            bounds.left += delta;
            bounds.right += delta;
        };
        
        this.shiftBoundsY = function (bounds, delta) {
            bounds.top += delta;
            bounds.bottom += delta;
        };
        
        this.recordBounds = function (ctx, omIn) {
            var bnds = ctx.contentBounds,
                bndsIn = omIn.bounds,
                boundPadLeft = 0,
                boundPadRight = 0,
                boundPadTop = 0,
                boundPadBottom = 0;
            
            if (omIn.boundsWithFX) {
                bndsIn = omIn.boundsWithFX;
                
            } else {
                if (omIn.type === "shape" || omIn.type === "text" || (omIn.type === "generic" && omIn.shapeBounds)) {
                    bndsIn = omIn.shapeBounds;
                }
            }
            
            if (omIn.style && omIn.style.stroke && omIn.style.stroke.strokeEnabled && omIn.style.stroke.lineWidth) {
                //the shape has a border then we need to bump the bounds up?
                boundPadLeft = omIn.style.stroke.lineWidth/2.0;
                boundPadRight = omIn.style.stroke.lineWidth/2.0;
                boundPadTop = omIn.style.stroke.lineWidth/2.0;
                boundPadBottom = omIn.style.stroke.lineWidth/2.0;
            }
            
            if (bndsIn) {
                if (!isFinite(bnds.left) || bndsIn.left < bnds.left) {
                    bnds.left = bndsIn.left;
                    ctx._boundsPadLeft = boundPadLeft;
                }
                if (!isFinite(bnds.right) || bndsIn.right > bnds.right) {
                    bnds.right = bndsIn.right;
                    ctx._boundsPadRight = boundPadRight;
                }
                if (!isFinite(bnds.top) || bndsIn.top < bnds.top) {
                    bnds.top = bndsIn.top;
                    ctx._boundsPadTop = boundPadTop;
                }
                if (!isFinite(bnds.bottom) || bndsIn.bottom > bnds.bottom) {
                    bnds.bottom = bndsIn.bottom;
                    ctx._boundsPadBottom = boundPadBottom;
                }
            }
        };
        
        //shift the bounds recorded in recordBounds
        this.shiftBounds = function (ctx, omIn) {
            var bnds = omIn.bounds;
            if (omIn.type === "shape" || omIn.type === "text" || (omIn.type === "generic" && omIn.shapeBounds)) {
                bnds = omIn.shapeBounds;
                if (omIn.type === "text") {
                    //get rid of position?
                    if (omIn.position) {
                        omIn.position.x = 0.0;
                        omIn.position.y = 100.0;
                    }
                }
            } else if (omIn.type === "tspan") {
                //is this postion global or something? seems to offset the text, removing
                if (omIn.position) {
                    omIn.position.x = 0.0;
                    omIn.position.y = 100.0;
                }
            }
            if (bnds) {
                this.shiftBoundsX(bnds, ctx._shiftContentX);
                this.shiftBoundsY(bnds, ctx._shiftContentY);
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
            var bnds = ctx.contentBounds,
                adjustBounds = 1;
            if (ctx.config.trimToArtBounds) {
                
                if (bnds) {
                    bnds.left = bnds.left || 0;
                    bnds.right = bnds.right || 0;
                    bnds.top = bnds.top || 0;
                    bnds.bottom = bnds.bottom || 0;

                    ctx._shiftContentX = (bnds.left * -1.0) + ctx._boundsPadLeft;
                    ctx._shiftContentY = (bnds.top * -1.0) + ctx._boundsPadTop;
                    
                    if (ctx.svgOM && ctx.svgOM.viewBox) {
                        /*
                        ctx.svgOM.viewBox.left = bnds.left - ctx._boundsPadLeft;
                        ctx.svgOM.viewBox.top = bnds.top - ctx._boundsPadTop;
                        ctx.svgOM.viewBox.right = bnds.right + ctx._boundsPadRight;
                        ctx.svgOM.viewBox.bottom = bnds.bottom + ctx._boundsPadBottom;
                        */
                        ctx.svgOM.viewBox.left = 0;
                        ctx.svgOM.viewBox.top = 0;
                        ctx.svgOM.viewBox.right = (bnds.right + ctx._boundsPadRight) - (bnds.left - ctx._boundsPadLeft);
                        ctx.svgOM.viewBox.bottom = (bnds.bottom + ctx._boundsPadBottom) - (bnds.top - ctx._boundsPadTop);
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
     
    