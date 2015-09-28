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
        svgWriterUtils = require("./svgWriterUtils.js"),
        matrix = require("./matrix.js"),
        utils = require("./utils.js"),
        ID = require("./idGenerator.js"),
        fontMaps = require("./fontMaps.json"),
        rectToBounds = require("./svgWriterUtils.js").rectToBounds,
        globalStyles = {};

    function SVGWriterPreprocessor() {

        /**
         * Externalize styles identifies styles that can be detached from artwork.
         **/
        this.externalizeStyles = function (ctx) {
            var omIn = ctx.currentOMNode,
                resources = ctx.svgOM.resources,
                fingerprint,
                ref,
                styleBlock,
                style,
                fakeNode,
                weightMap = fontMaps.weights,
                italicMap = fontMaps.italics;

            if (omIn.style && omIn.style.ref && resources.styles && resources.styles[omIn.style.ref]) {
                utils.merge(omIn.style, resources.styles[omIn.style.ref]);
            }
            if (omIn.style) {
                delete omIn.style.ref;
            }

            fingerprint = JSON.stringify(omIn.style);

            if (globalStyles[fingerprint]) {
                ref = globalStyles[fingerprint];
                style = resources.styles[ref];
                if (style) {
                    omIn.className = ref;
                    fakeNode = {
                        style: style,
                        type: omIn.type,
                        shape: omIn.shape,
                        className: ref
                    };
                    ctx.omStylesheet.getStyleBlock(fakeNode);
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

            styleBlock = ctx.omStylesheet.getStyleBlock(omIn);

            if (omIn.shape && omIn.shape.winding) {
                styleBlock.addRule("fill-rule", omIn.shape.winding);
            }

            if (!omIn.style) {
                return;
            }

            if (omIn.style.font && typeof omIn.style.font == "object") {
                var font = omIn.style.font;
                if (isFinite(font.size)) {
                    styleBlock.addRule("font-size", font.size + "px");
                }
                if (font.family) {
                    styleBlock.addRule("font-family", font.family);
                }
                if (font.variant == "small-caps") {
                    styleBlock.addRule("font-variant", font.variant);
                }
                if (font.style) {
                    var styles = font.style.split(" ");
                    styles.forEach(function (style) {
                        if (weightMap[style]) {
                            if (weightMap[style] != 400) { // default
                                styleBlock.addRule("font-weight", weightMap[style]);
                            }
                        } else if (italicMap[style]) {
                            styleBlock.addRule("font-style", "italic");
                        }
                    });
                }
            }

            if (omIn.style.textAttributes) {
                if (omIn.style.textAttributes.decoration) {
                    styleBlock.addRule("text-decoration", omIn.style.textAttributes.decoration.join(" "));
                }
                if (omIn.style.textAttributes.letterSpacing) {
                    styleBlock.addRule("letter-spacing", omIn.style.textAttributes.letterSpacing + "px");
                }
                if (omIn.style.textAttributes.glyphOrientation == "sideways-right") {
                    styleBlock.addRule("text-orientation", "sideways-right");
                }
            }

            Object.keys(omIn.style).forEach(function (property) {
                if (omIn.style[property] === undefined) {
                    return;
                }
                // fill, stroke, mask and fx are handled above.
                if (property == "fill" || property == "stroke" ||
                    property == "filters" || property == "meta" ||
                    property == "mask" || property == "clipPath" ||
                    property == "name" ||
                    property == "font" && typeof omIn.style[property] == "object" ||
                    property == "textAttributes") {
                    return;
                }
                if (property == "font-size") {
                    styleBlock.addRule(property, omIn.style[property] + "px");
                    return;
                }
                if (property == "blendMode") {
                    styleBlock.addRule("mix-blend-mode", omIn.style[property]);
                    return;
                }

                if (property.indexOf("_") !== 0) {
                    styleBlock.addRule(property, omIn.style[property]);
                }
            });
        };

        var recordBounds = function (ctx, omIn) {
                var bnds = ctx.contentBounds,
                    bndsIn,
                    width = omIn.style && omIn.style.stroke && omIn.style.stroke.type != "none" &&
                                omIn.style.stroke.width || 0,
                    strokeAlign = width ? omIn.style.stroke.align : "center",
                    expand = 0;

                // FIXME: We do not have a way to compute the inside/outside of a path yet. This
                // is the most simple way to adjust the boundaries to center aligned paths.
                if (strokeAlign == "inside") {
                    expand = width / 2;
                } else if (strokeAlign == "outside") {
                    expand = -width / 2;
                }

                if (omIn.visualBounds) {
                    bndsIn = rectToBounds(omIn.visualBounds);
                }

                // Objects of type "artboard" have the special behavior
                // that we take the bounds of the artboard and not the children.
                if (omIn.type == "artboard") {
                    var artboard = ctx.svgOM.artboards[(omIn.artboard || omIn).ref];
                    bndsIn = rectToBounds(artboard);
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
                                omIn.position.x -= omIn.visualBounds.x;
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
                var text = omIn.text,
                    offsetX = ctx._shiftContentX + (ctx._shiftCropRectX || 0),
                    offsetY = ctx._shiftContentY + (ctx._shiftCropRectY || 0);

                if (omIn.transform || text && text.frame && text.frame.type == "path") {
                    omIn.transform = omIn.transform || matrix.createMatrix();
                    omIn.transformTX = (omIn.transformTX || 0) + ctx._shiftContentX;
                    omIn.transformTY = (omIn.transformTY || 0) + ctx._shiftContentY;

                    if (omIn.children) {
                        omIn.children.forEach(function (chld) {
                            chld._hasParentTXFM = true;
                        });
                    }
                    return;
                }

                if (!offsetX && !offsetY) {
                    return;
                }

                if (text) {
                    var frame = text.frame,
                        rawText = text.rawText;
                    if (frame) {
                        frame.x = (frame.x || 0) + offsetX;
                        frame.y = (frame.y || 0) + offsetY;
                    }
                    if (text.paragraphs && text.paragraphs.length) {
                        for (var i = 0; i < text.paragraphs.length; i++) {
                            var paragraph = text.paragraphs[i];
                            if (!paragraph.lines || !paragraph.lines.length) {
                                continue;
                            }
                            for (var j = 0; j < paragraph.lines.length; j++) {
                                var line = paragraph.lines[j];
                                if (!line || !line.length) {
                                    continue;
                                }
                                for (var k = 0; k < line.length; k++) {
                                    var glyphRun = line[k];
                                    if (isFinite(glyphRun.x)) {
                                        glyphRun.x += offsetX;
                                    }
                                    if (isFinite(glyphRun.y)) {
                                        glyphRun.y += offsetY;
                                    }
                                }
                            }
                        }
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

                            if (ctx.eq(Math.abs(omIn.position.y), 1)) {
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
                omIn.shifted = true;
            },
            shiftShapeOrGroupPosition = function (ctx, omIn) {
                var shape = omIn.shape,
                    bnds,
                    offsetX = ctx._shiftContentX + (ctx._shiftCropRectX || 0),
                    offsetY = ctx._shiftContentY + (ctx._shiftCropRectY || 0);

                if (omIn.visualBounds) {
                    bnds = rectToBounds(omIn.visualBounds);
                }

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
                    omIn.shifted = true;
                    return;
                }

                switch (shape.type) {
                case "circle":
                case "ellipse":
                    shape.cx += offsetX;
                    shape.cy += offsetY;
                    omIn.shifted = true;
                    break;
                case "line":
                    shape.x1 += offsetX;
                    shape.y1 += offsetY;
                    shape.x2 += offsetX;
                    shape.y2 += offsetY;
                    omIn.shifted = true;
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
                    omIn.shifted = true;
                    break;
                case "rect":
                    shape.x += offsetX;
                    shape.y += offsetY;
                    omIn.shifted = true;
                    break;
                }
            },
            shiftImageOrReferenceBounds = function (ctx, omIn) {
                var offsetX = ctx._shiftContentX + (ctx._shiftCropRectX || 0),
                    offsetY = ctx._shiftContentY + (ctx._shiftCropRectY || 0);

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
                var typeObject = omIn.reference || omIn.image || omIn;
                typeObject.x = (typeObject.x || 0) + offsetX;
                typeObject.y = (typeObject.y || 0) + offsetY;
                omIn.shifted = true;
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
                    children = (omIn.artboard || omIn.group || omIn).children;

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

                if (ctx.eq(cropRect.width, w) &&
                    ctx.eq(cropRect.height, h)) {
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

        this.processSVGNode = function (genID, ctx, noShifting, nested, sibling) {
            var omIn = ctx.currentOMNode,
                children = (omIn.artboard || omIn.group || omIn).children,
                state = ctx._transformOnNode;

            // Give every element a unique id for processing.
            omIn.id = genID.getUnique("");

            // Do not process style of element if it is not visible.
            if (!isVisible(ctx, omIn)) {
                return;
            }

            if (omIn.processed) {
                return;
            }

            if (ctx.tick && !omIn.lines && !omIn.to) {
                ctx.nodeCounter++;
            }
            // If these bounds shifted is not 0 then shift children to be relative to this text block...
            if (omIn.type === "text" && omIn.children) {
                omIn.children.forEach(function (chld) {
                    chld._parentBounds = omIn.textBounds;
                    chld._parentIsRoot = !nested;
                });
            }

            if (ctx.config.trimToArtBounds && !ctx.config.useViewBox && omIn !== ctx.svgOM && !noShifting) {
                shiftBounds(ctx, omIn, nested, sibling);
            }

            omIn.processed = true;

            // We should process mask before masked element
            if (omIn.style && omIn.style.mask && omIn.style.mask.ref && ctx.svgOM.resources.masks) {
                ctx.currentOMNode = ctx.svgOM.resources.masks[omIn.style.mask.ref];
                this.processSVGNode(genID, ctx, noShifting, nested, sibling);
                ctx.currentOMNode = omIn;
            }

            this.externalizeStyles(ctx);

            if (children) {
                children.forEach(function (childNode, ind) {
                    ctx.currentOMNode = childNode;
                    this.processSVGNode(genID, ctx, noShifting, omIn !== ctx.svgOM, ind);
                }, this);
            }
            if (omIn.text && omIn.text.paragraphs) {
                var style = omIn.style;
                omIn.text.paragraphs.forEach(function (paragraph, pInd) {
                    ctx.currentOMNode = paragraph;
                    utils.merge(paragraph.style, style);
                    this.processSVGNode(genID, ctx, noShifting, true, pInd);
                    if (paragraph.lines) {
                        paragraph.lines.forEach(function (line) {
                            line.forEach(function (glyphrun, lInd) {
                                utils.merge(glyphrun.style, paragraph.style);
                                ctx.currentOMNode = glyphrun;
                                this.processSVGNode(genID, ctx, noShifting, true, lInd);
                            }, this);
                        }, this);
                    }
                }, this);
            }
            if (state != ctx._transformOnNode) {
                ctx._transformOnNode = false;
            }
        };

        this.processSVGOM = function (ctx) {
            var omSave = ctx.currentOMNode,
                self = this,
                resources = ctx.svgOM.resources || {},
                cropRect = ctx.config.cropRect,
                w,
                h,
                scale = ctx.config.scale || 1,
                genID = new ID();

            if (resources.styles) {
                for (var name in resources.styles) {
                    globalStyles[JSON.stringify(resources.styles[name])] = name;
                }
            }

            ctx.omStylesheet = new SVGStylesheet;

            if (ctx.config.trimToArtBounds) {
                preprocessSVGNode(ctx, ctx.currentOMNode);
                if (ctx.config.useViewBox) {
                    ctx._x = ctx.contentBounds.left;
                    ctx._y = ctx.contentBounds.top;
                    ctx._width = ctx.contentBounds.right - ctx.contentBounds.left;
                    ctx._height = ctx.contentBounds.bottom - ctx.contentBounds.top;
                } else {
                    finalizePreprocessing(ctx);
                }
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
            Object.keys(resources.masks || {}).forEach(function (key) {
                ctx.currentOMNode = resources.masks[key];
                self.processSVGNode(genID, ctx, true);
            });
            Object.keys(resources.clipPaths || {}).forEach(function (key) {
                ctx.currentOMNode = resources.clipPaths[key];
                self.processSVGNode(genID, ctx, true);
            });
            Object.keys(resources.patterns || {}).forEach(function (key) {
                ctx.currentOMNode = resources.patterns[key];
                self.processSVGNode(genID, ctx, true);
            });
            Object.keys(resources.symbols || {}).forEach(function (key) {
                ctx.currentOMNode = resources.symbols[key];
                self.processSVGNode(genID, ctx, true);
            });
            ctx.currentOMNode = omSave;
            this.processSVGNode(genID, ctx);
            ctx.currentOMNode = omSave;
        };
    }

    module.exports = new SVGWriterPreprocessor();

}());
