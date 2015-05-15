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

/* Help construct the svgOM from generator data */

(function () {
    "use strict";

    var SVGStylesheet = require("./svgStylesheet.js"),
        svgWriterStroke = require("./svgWriterStroke.js"),
        svgWriterFill = require("./svgWriterFill.js"),
        svgWriterFx = require("./svgWriterFx.js"),
        svgWriterMask = require("./svgWriterMask.js"),
        svgWriterClipPath = require("./svgWriterClipPath.js"),
        svgWriterSymbol = require("./svgWriterSymbol.js"),
        svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterTextPath = require("./svgWriterTextPath.js"),
        matrix = require("./matrix.js"),
        utils = require("./utils.js");

    function SVGWriterPreprocessor() {

        /**
         * Externalize styles identifies styles that can be detached from artwork.
         **/
        this.externalizeStyles = function (ctx) {
            var omIn = ctx.currentOMNode,
                styleBlock;

            delete ctx.stylesCurrentBlock;

            svgWriterFill.externalizeStyles(ctx);
            svgWriterStroke.externalizeStyles(ctx);
            svgWriterFx.externalizeStyles(ctx);
            svgWriterMask.externalizeStyles(ctx);
            svgWriterClipPath.externalizeStyles(ctx);

            styleBlock = ctx.omStylesheet.getStyleBlock(omIn, ctx.ID.getUnique);

            if (omIn.shape && omIn.shape.winding) {
                styleBlock.addRule("fill-rule", omIn.shape.winding);
            }

            if (omIn.style) {
                Object.keys(omIn.style).forEach(function (property) {
                    if (omIn.style[property] === undefined) {
                        return;
                    }
                    // fill, stroke, mask and fx are handled above.
                    if (property == "fill" || property == "stroke" || property == "filter" || property == "meta" || property == "mask" || property == "clip-path") {
                        return;
                    }
                    if (property == "font-size") {
                        styleBlock.addRule(property, omIn.style[property] + "px");
                        return;
                    }
                    if (property == "blend-mode") {
                        styleBlock.addRule("mix-blend-mode", omIn.style[property]);
                        return;
                    }

                    if (property.indexOf("_") !== 0) {
                        styleBlock.addRule(property, omIn.style[property]);
                    }
                });
            }
        };

        var recordBounds = function (ctx, omIn) {
                var bnds = ctx.contentBounds,
                    bndsIn = omIn.visualBounds,
                    width = omIn.style && omIn.style.stroke && omIn.style.stroke.type != "none" &&
                                omIn.style.stroke.width || 0,
                    expand = width / 2;

                // Objects of type "artboard" have the special behavior
                // that we take the bounds of the artboard and not the children.
                if (omIn.type == "artboard") {
                    bndsIn = ctx.svgOM.artboards[omIn.id].bounds;
                }

                utils.unionRect(bnds, bndsIn, expand);
            },
            shiftTspanBounds = function (ctx, omIn, nested, sibling) {
                if (!omIn.style) {
                    return;
                }

                if (omIn.position && isFinite(omIn.position.x)) {
                    if (sibling && !omIn._hasParentTXFM) {
                        omIn.position.x += ctx._shiftContentX;
                    } else {
                        if (omIn._parentIsRoot) {
                            if ((omIn.style["text-anchor"] == "middle" || omIn.style["text-anchor"] == "end") && !omIn._hasParentTXFM) {
                                omIn.position.x -= omIn.visualBounds.left;
                            } else {
                                omIn.position.x = 0;
                            }
                        } else {
                            omIn.position.x = undefined;
                        }
                    }
                }

                if (omIn.style["_baseline-script"] === "sub" ||
                        omIn.style["_baseline-script"] === "super") {
                    if (typeof omIn.style["font-size"] === "number") {
                        omIn.style["font-size"] = Math.round(omIn.style["font-size"] / 2);
                    } else {
                        omIn.style["font-size"].value = Math.round(omIn.style["font-size"].value / 2);
                    }
                }

                if (omIn.style["_baseline-script"] === "super") {
                    omIn.position = omIn.position || {};
                    omIn.position.y = -0.5;
                    omIn.position.unitY = "em";
                }
            },
            shiftTextBounds = function (ctx, omIn, nested) {
                if (omIn.transform) {
                    omIn.transformTX += ctx._shiftContentX;
                    omIn.transformTY += ctx._shiftContentY;

                    if (omIn.children) {
                        omIn.children.forEach(function (chld) {
                            chld._hasParentTXFM = true;
                        });
                    }
                } else if (omIn.position) {
                    if (!nested) {
                        if (omIn.children && omIn.children.length === 1) {
                            if (ctx.config.constrainToDocBounds && omIn.position.unitX === "px") {
                                omIn.position.x += ctx._shiftContentX;
                            } else {
                                omIn.position.x = 0;
                            }
                            if (omIn.position.unitY === "px") {
                                omIn.position.y += ctx._shiftContentY;
                            }
                        } else {
                            if (ctx.config.constrainToDocBounds) {
                                omIn.position.x += ctx._shiftContentX;
                            } else {
                                omIn.position.x = 0;
                            }
                            omIn.position.y += ctx._shiftContentY;

                            if (Math.abs(omIn.position.y) === 1) {
                                omIn.position.y = 1;
                                omIn.position.unitY = "em";
                            }
                        }
                    } else {
                        if (omIn.position.unitX === "px") {
                            omIn.position.x += ctx._shiftContentX;
                        }
                        if (omIn.position.unitY === "px") {
                            omIn.position.y += ctx._shiftContentY;
                        }
                    }
                }
            },
            shiftShapePosition = function (ctx, omIn) {
                var shape = omIn.shape,
                    bnds = omIn.visualBounds,
                    offsetX = ctx._shiftContentX + (ctx._shiftCropRectX || 0),
                    offsetY = ctx._shiftContentY + (ctx._shiftCropRectY || 0);

                // The bounds shift here is still necessary for gradient overlays.
                // FIXME: Is there a way to get rid of the bounds shifting?
                if (bnds) {
                    svgWriterUtils.shiftBoundsX(bnds, offsetX);
                    svgWriterUtils.shiftBoundsY(bnds, offsetY);
                }

                // PS and Ai propagate all transforms to the leaves.
                if (omIn.transform) {
                    omIn.transformTX += ctx._shiftContentX;
                    omIn.transformTY += ctx._shiftContentY;
                    return;
                }
                switch (shape.type) {
                case "circle":
                case "ellipse":
                    shape.cx += offsetX;
                    shape.cy += offsetY;
                    break;
                case "line":
                    shape.x1 += offsetX;
                    shape.y1 += offsetY;
                    shape.x2 += offsetX;
                    shape.y2 += offsetY;
                    break;
                case "path":
                    if (ctx._shiftCropRectX || ctx._shiftCropRectY) {
                        omIn.transform = matrix.createMatrix();
                        omIn.transformTX = ctx._shiftCropRectX || 0;
                        omIn.transformTY = ctx._shiftCropRectY || 0;
                    }
                    break;
                case "polygon":
                    // Fall through
                case "polyline":
                    shape.points.forEach(function (item) {
                        item.x += offsetX;
                        item.y += offsetY;
                    });
                    break;
                case "rect":
                    shape.x += offsetX;
                    shape.y += offsetY;
                    break;
                }
            },
            // Shift the bounds recorded in recordBounds.
            shiftBounds = function (ctx, omIn, nested, sibling) {
                if (omIn.type == "text") {
                    shiftTextBounds(ctx, omIn, nested);
                } else if (omIn.type == "tspan") {
                    shiftTspanBounds(ctx, omIn, nested, sibling);
                } else if (omIn.type == "shape") {
                    shiftShapePosition(ctx, omIn);
                }
            },
            isVisible = function (ctx, omIn) {
                return omIn == ctx.svgOM || !omIn.hasOwnProperty("visible") || omIn.visible;
            },
            preprocessSVGNode = function (ctx) {
                var omIn = ctx.currentOMNode,
                    children = omIn.children;

                // Do not process style of element if it is not visible.
                if (!isVisible(ctx, omIn)) {
                    return;
                }

                if (ctx.config.trimToArtBounds) {
                    recordBounds(ctx, omIn);
                }

                if (omIn.type == "artboard") {
                    return;
                }

                if (children) {
                    children.forEach(function (childNode) {
                        ctx.currentOMNode = childNode;
                        preprocessSVGNode(ctx);
                    });
                }
            },
            finalizePreprocessing = function (ctx) {
                var bnds = ctx.contentBounds,
                    docBounds = ctx.docBounds,
                    w,
                    h,
                    cropRect = ctx.config.cropRect,
                    artboardRect = ctx.config.artboardBounds,
                    artboardShiftX = 0,
                    artboardShiftY = 0;

                if (!ctx.config.trimToArtBounds || !bnds) {
                    return;
                }

                // FIXME: This resets the visual bounds with the artboard bounds
                // if we export an artboard. Artboard clipping for all other layers is
                // done based on the visual bounds. This is a hack mostly around PSs
                // behavior to shift paths and us not detecting when we need to something
                // different. We should probably teach PS not to shift paths around
                // on single layer export.
                if (ctx.config.isArtboard && artboardRect) {
                    bnds = {
                        left: artboardRect.left,
                        right: artboardRect.right,
                        bottom: artboardRect.bottom,
                        top: artboardRect.top
                    };
                }

                // FIXME: We rounded the document size before. However, this causes visual problems
                // with small viewports or viewBoxes. Move back to more precise dimensions for now.
                if (ctx.config.constrainToDocBounds) {
                    bnds.left = Math.max(0, bnds.left || 0);
                    bnds.right = Math.min(docBounds.right, bnds.right || 0);
                    bnds.top = Math.max(0, bnds.top || 0);
                    bnds.bottom = Math.min(docBounds.bottom, bnds.bottom || 0);
                } else {
                    bnds.left = bnds.left || 0;
                    bnds.right = bnds.right || 0;
                    bnds.top = bnds.top || 0;
                    bnds.bottom = bnds.bottom || 0;
                }

                ctx._shiftContentX = -bnds.left;
                ctx._shiftContentY = -bnds.top;

                // FIXME: If we export a layer, svgOMG does not preserve the artboard
                // the layer is bound to. We rely on the artboard size provided by
                // generator-assets. We need to find a better way, probably by adding
                // the artboard to OMG directly.
                if (ctx.config.clipToArtboardBounds && artboardRect) {
                    artboardShiftX = Math.min(bnds.left - artboardRect.left, 0);
                    artboardShiftY = Math.min(bnds.top - artboardRect.top, 0);
                    bnds.left = Math.max(bnds.left, artboardRect.left);
                    bnds.right = Math.min(bnds.right, artboardRect.right);
                    bnds.top = Math.max(bnds.top, artboardRect.top);
                    bnds.bottom = Math.min(bnds.bottom, artboardRect.bottom);
                }

                if (!ctx.viewBox) {
                    console.log("no viewBox");
                    return;
                }

                ctx.viewBox.left = Math.abs(artboardShiftX);
                ctx.viewBox.top = Math.abs(artboardShiftY);
                ctx.viewBox.right = bnds.right - bnds.left;
                ctx.viewBox.bottom = bnds.bottom - bnds.top;

                w = ctx.viewBox.right;
                h = ctx.viewBox.bottom;

                // Clip to crop boundaries.
                // FIXME: Do we want to allow cropping without trimToArtBounds set?
                if (!cropRect) {
                    return;
                }
                cropRect.width /= ctx.config.scale || 1;
                cropRect.height /= ctx.config.scale || 1;

                if (cropRect.width == w &&
                    cropRect.height == h) {
                    return;
                }

                ctx.viewBox.right = cropRect.width;
                ctx.viewBox.bottom = cropRect.height;

                ctx._shiftCropRectX = (cropRect.width - w) / 2;
                ctx._shiftCropRectY = (cropRect.height - h) / 2;

                if (ctx.config.clipToArtboardBounds && artboardRect) {
                    svgWriterClipPath.writeClipPath(ctx, [artboardRect], ctx._shiftCropRectX, ctx._shiftCropRectX);
                }
            };

        this.processSVGNode = function (ctx, nested, sibling) {
            var omIn = ctx.currentOMNode,
                children = omIn.children;

            // Do not process style of element if it is not visible.
            if (!isVisible(ctx, omIn)) {
                return;
            }

            if (omIn.processed) {
                return;
            }

            if (omIn.type == "reference") {
                svgWriterSymbol.writeSymbol(ctx, omIn.ref);
            }

            // If these bounds shifted is not 0 then shift children to be relative to this text block...
            if (omIn.type === "text" && omIn.children) {
                omIn.children.forEach(function (chld) {
                    chld._parentBounds = omIn.textBounds;
                    chld._parentIsRoot = !nested;
                });
            }

            if (ctx.config.trimToArtBounds && omIn !== ctx.svgOM) {
                shiftBounds(ctx, omIn, nested, sibling);
            }

            omIn.processed = true;

            // We should process mask before masked element
            if (omIn.style && omIn.style.mask && ctx.svgOM.global.masks) {
                ctx.currentOMNode = ctx.svgOM.global.masks[omIn.style.mask];
                this.processSVGNode(ctx);
                ctx.currentOMNode = omIn;
            }

            this.externalizeStyles(ctx);

            if (omIn.type === "textPath") {
                svgWriterTextPath.writeTextPath(ctx, omIn.pathData);
            }

            if (children) {
                children.forEach(function (childNode, ind) {
                    ctx.currentOMNode = childNode;
                    this.processSVGNode(ctx, omIn !== ctx.svgOM, ind);
                }, this);
            }
        };

        this.processSVGOM = function (ctx) {
            var omSave = ctx.currentOMNode,
                self = this,
                global = ctx.svgOM.global;
            ctx.omStylesheet = new SVGStylesheet;

            if (ctx.config.trimToArtBounds) {
                preprocessSVGNode(ctx, ctx.currentOMNode);
                finalizePreprocessing(ctx);
                ctx.currentOMNode = omSave;
            }
            // Preprocess the content of the resources,
            // since they are not a part of the tree
            Object.keys(global.masks || {}).forEach(function (key) {
                ctx.currentOMNode = global.masks[key];
                self.processSVGNode(ctx);
            });
            Object.keys(global.clipPaths || {}).forEach(function (key) {
                ctx.currentOMNode = global.clipPaths[key];
                self.processSVGNode(ctx);
            });
            Object.keys(global.patterns || {}).forEach(function (key) {
                ctx.currentOMNode = global.patterns[key];
                self.processSVGNode(ctx);
            });
            Object.keys(global.symbols || {}).forEach(function (key) {
                ctx.currentOMNode = global.symbols[key];
                self.processSVGNode(ctx);
            });
            ctx.currentOMNode = omSave;
            this.processSVGNode(ctx);
            ctx.currentOMNode = omSave;
        };
    }

    module.exports = new SVGWriterPreprocessor();

}());
