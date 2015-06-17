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
        utils = require("./utils.js"),
        ID = require("./idGenerator.js"),
        globalStyles = {};

    function SVGWriterPreprocessor() {

        /**
         * Externalize styles identifies styles that can be detached from artwork.
         **/
        this.externalizeStyles = function (ctx) {
            var omIn = ctx.currentOMNode,
                global = ctx.svgOM.global,
                fingerprint,
                ref,
                styleBlock,
                style,
                fakeNode;

            if (omIn.style && omIn.style.ref && global.styles && global.styles[omIn.style.ref]) {
                omIn.style = utils.merge(omIn.style, global.styles[omIn.style.ref]);
            }
            if (omIn.style) {
                delete omIn.style.ref;
            }

            fingerprint = JSON.stringify(omIn.style);

            if (globalStyles[fingerprint]) {
                ref = globalStyles[fingerprint];
                style = global.styles[ref];
                if (style) {
                    omIn.className = ref;
                    fakeNode = {
                        style: style,
                        type: omIn.type,
                        shape: omIn.shape,
                        className: ref
                    };
                    ctx.omStylesheet.getStyleBlock(fakeNode, ctx.ID.getUnique);
                    fakeNode.styleBlock.element = null;
                    omIn.styleBlock = fakeNode.styleBlock;
                }
            }

            delete ctx.stylesCurrentBlock;

            if (fakeNode) {
                omIn = ctx.currentOMNode = fakeNode;
            }
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
                    if (property == "fill" || property == "stroke" ||
                        property == "filter" || property == "meta" ||
                        property == "mask" || property == "clip-path" ||
                        property == "name") {
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
                    bndsIn = ctx.svgOM.artboards[omIn.ref].bounds;
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
            shiftShapeOrGroupPosition = function (ctx, omIn) {
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
                // FIXME: We probably should rather check if the transformation
                // is a translation and propagate the translation to leaves.
                if (omIn.transform && !matrix.createMatrix(omIn.transform).isIdentity()) {
                    omIn.transformTX = ctx._shiftContentX;
                    omIn.transformTY = ctx._shiftContentY;
                    // Do not apply further translation to children.
                    ctx._transformOnNode = true;
                    return;
                }
                if (!shape) {
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
                    omIn.transformTX = offsetX;
                    omIn.transformTY = offsetY;
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
            shiftImageOrReferenceBounds = function (ctx, omIn) {
                var offsetX = ctx._shiftContentX + (ctx._shiftCropRectX || 0),
                    offsetY = ctx._shiftContentY + (ctx._shiftCropRectY || 0);

                if (omIn.bounds) {
                    omIn.bounds.left += offsetX;
                    omIn.bounds.top += offsetY;
                    omIn.bounds.right += offsetX;
                    omIn.bounds.bottom += offsetY;
                }
            },
            // Shift the bounds recorded in recordBounds.
            shiftBounds = function (ctx, omIn, nested, sibling) {
                if (ctx._transformOnNode) {
                    return;
                }
                // FIXME: OMG defines text as a shape. Change svgOMG
                // to follow the spec.
                if (omIn.type == "text") {
                    shiftTextBounds(ctx, omIn, nested);
                } else if (omIn.type == "tspan") {
                    shiftTspanBounds(ctx, omIn, nested, sibling);
                } else if (omIn.type == "shape" || omIn.type == "group") {
                    shiftShapeOrGroupPosition(ctx, omIn);
                } else if (omIn.type == "image" || omIn.type == "reference") {
                    shiftImageOrReferenceBounds(ctx, omIn);
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
                var actualBounds = ctx.contentBounds,
                    docBounds = ctx.docBounds,
                    w,
                    h,
                    cropRect = ctx.config.cropRect,
                    artboardBounds = ctx.config.artboardBounds,
                    artboardShiftX = 0,
                    artboardShiftY = 0;

                // Determine if the actual art fits into the artboard.
                ctx._needsClipping = ctx.config.clipToArtboardBounds && artboardBounds ?
                    !utils.containsRect(artboardBounds, actualBounds) : false;

                // FIXME: This resets the visual bounds with the artboard bounds
                // if we export an artboard. Artboard clipping for all other layers is
                // done based on the visual bounds. This is a hack mostly around PSs
                // behavior to shift paths and us not detecting when we need to something
                // different. We should probably teach PS not to shift paths around
                // on single layer export.
                if (ctx.config.isArtboard && artboardBounds) {
                    actualBounds = {
                        left: artboardBounds.left,
                        right: artboardBounds.right,
                        bottom: artboardBounds.bottom,
                        top: artboardBounds.top
                    };
                }

                if (ctx.config.constrainToDocBounds) {
                    ctx._needsClipping = ctx._needsClipping || !utils.containsRect(docBounds, actualBounds);
                    actualBounds.left = Math.max(0, actualBounds.left || 0);
                    actualBounds.right = Math.min(docBounds.right, actualBounds.right || 0);
                    actualBounds.top = Math.max(0, actualBounds.top || 0);
                    actualBounds.bottom = Math.min(docBounds.bottom, actualBounds.bottom || 0);
                } else {
                    ctx._needsClipping = ctx._needsClipping || actualBounds.left < 0 || actualBounds.top < 0;
                    actualBounds.left = actualBounds.left || 0;
                    actualBounds.right = actualBounds.right || 0;
                    actualBounds.top = actualBounds.top || 0;
                    actualBounds.bottom = actualBounds.bottom || 0;
                }

                // We need clipping if we have a cropRect. Otherwise the content exceeds the
                // SVG boundaries.
                ctx._needsClipping = ctx._needsClipping && !!cropRect;

                ctx._shiftContentX = -actualBounds.left;
                ctx._shiftContentY = -actualBounds.top;

                // FIXME: If we export a layer, svgOMG does not preserve the artboard
                // the layer is bound to. We rely on the artboard size provided by
                // generator-assets. We need to find a better way, probably by adding
                // the artboard to OMG directly.
                if (ctx.config.clipToArtboardBounds && artboardBounds) {
                    artboardShiftX = Math.min(actualBounds.left - artboardBounds.left, 0);
                    artboardShiftY = Math.min(actualBounds.top - artboardBounds.top, 0);
                    actualBounds.left = Math.max(actualBounds.left, artboardBounds.left);
                    actualBounds.right = Math.min(actualBounds.right, artboardBounds.right);
                    actualBounds.top = Math.max(actualBounds.top, artboardBounds.top);
                    actualBounds.bottom = Math.min(actualBounds.bottom, artboardBounds.bottom);
                }

                ctx._shiftContentX += artboardShiftX;
                ctx._shiftContentY += artboardShiftY;

                // Art might be off the document.
                w = Math.abs(actualBounds.right - actualBounds.left);
                h = Math.abs(actualBounds.bottom - actualBounds.top);

                ctx._x = 0;
                ctx._y = 0;
                ctx._width = w;
                ctx._height = h;

                // Clip to crop boundaries.
                // FIXME: Do we want to allow cropping without trimToArtBounds set?
                if (!cropRect) {
                    return;
                }
                cropRect.width /= ctx.config.scale || 1;
                cropRect.height /= ctx.config.scale || 1;

                if (cropRect.width == w &&
                    cropRect.height == h) {
                    ctx._needsClipping = false;
                    return;
                }

                ctx._width = cropRect.width;
                ctx._height = cropRect.height;

                ctx._shiftCropRectX = (cropRect.width - w) / 2;
                ctx._shiftCropRectY = (cropRect.height - h) / 2;

                if (ctx._needsClipping) {
                    svgWriterClipPath.writeClipPath(ctx, [utils.intersectRects(docBounds, artboardBounds)], ctx._shiftCropRectX, ctx._shiftCropRectY);
                }
            };

        this.processSVGNode = function (ctx, nested, sibling) {
            var omIn = ctx.currentOMNode,
                children = omIn.children,
                state = ctx._transformOnNode;

            // Give every element a unique id for processing.
            omIn.id = new ID("unique").getUnique();

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
            if (state != ctx._transformOnNode) {
                ctx._transformOnNode = false;
            }
        };

        this.processSVGOM = function (ctx) {
            var omSave = ctx.currentOMNode,
                self = this,
                global = ctx.svgOM.global,
                cropRect = ctx.config.cropRect,
                w,
                h,
                scale = ctx.config.scale || 1;

            if (global.styles) {
                for (var name in global.styles) {
                    globalStyles[JSON.stringify(global.styles[name])] = name;
                }
            }

            ctx.omStylesheet = new SVGStylesheet;

            if (ctx.config.trimToArtBounds) {
                preprocessSVGNode(ctx, ctx.currentOMNode);
                finalizePreprocessing(ctx);
                ctx.currentOMNode = omSave;
            } else {
                ctx._x = ctx.docBounds.left;
                ctx._y = ctx.docBounds.top;
                ctx._width = ctx.docBounds.right - ctx.docBounds.left;
                ctx._height = ctx.docBounds.bottom - ctx.docBounds.top;

                if (cropRect) {
                    w = ctx._width;
                    h = ctx._height;

                    cropRect.width /= scale;
                    cropRect.height /= scale;

                    ctx._width = cropRect.width;
                    ctx._height = cropRect.height;
                    ctx._x -= (cropRect.width - w) / 2;
                    ctx._y -= (cropRect.height - h) / 2;

                    if (cropRect.width > w || cropRect.height > h) {
                        ctx._needsClipping = true;
                        svgWriterClipPath.writeClipPath(ctx, [ctx.docBounds], 0, 0);
                    }
                }
            }

            ctx._viewBox = [
                ctx._x,
                ctx._y,
                ctx._width,
                ctx._height
            ];
            ctx._width *= scale;
            ctx._height *= scale;

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
