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
/*global define: true, require: true, module: true */

/* Help construct the svgOM from generator data */

(function () {
    "use strict";

    var SVGStylesheet = require("./svgStylesheet.js"),
        svgWriterStroke = require("./svgWriterStroke.js"),
        svgWriterFill = require("./svgWriterFill.js"),
        svgWriterFx = require("./svgWriterFx.js"),
        svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterText = require("./svgWriterText.js");

    var px = svgWriterUtils.px;

    function SVGWriterPreprocessor() {

        this.scanForUnsupportedFeatures = function (ctx) {
            svgWriterFill.scanForUnsupportedFeatures(ctx);
            svgWriterStroke.scanForUnsupportedFeatures(ctx);
            svgWriterFx.scanForUnsupportedFeatures(ctx);
            svgWriterText.scanForUnsupportedFeatures(ctx);
        };

        this.provideBackupDefaults = function (omIn, styleBlock) {
            if (omIn.style && styleBlock.hasRules() &&
                    omIn.type === "shape" && !omIn.style.fill) {
                omIn.style.fill = "none";
                styleBlock.addRule("fill", "none");
            }
        };

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

            styleBlock = ctx.omStylesheet.getStyleBlock(omIn);

            this.provideBackupDefaults(omIn, styleBlock);

            if (omIn.style) {
                Object.keys(omIn.style).forEach(function (property) {
                    if (omIn.style[property] === undefined) {
                        return;
                    }
                    // fill, stroke and fx are handled above.
                    if (property === "fill" || property === "stroke" || property === "meta") {
                        return;
                    }
                    if (property === "font-size") {
                        styleBlock.addRule(property, px(ctx, omIn.style[property]) + "px");
                        return;
                    }
                    if (property.indexOf("_") !== 0) {
                        styleBlock.addRule(property, omIn.style[property]);
                    }
                });
            }
        };

        var isSizedGraphic = function (omIn) {
            return omIn.type === "shape" || omIn.type === "group" ||
                omIn.type === "artboard" || (omIn.type === "generic" && omIn.shapeBounds);
        };

        var recordBounds = function (ctx, omIn) {
            var bnds = ctx.contentBounds,
                bndsIn = omIn.bounds,
                boundPadLeft = 0,
                boundPadRight = 0,
                boundPadTop = 0,
                boundPadBottom = 0;

            if (omIn.boundsWithFX) {
                bndsIn = omIn.boundsWithFX;
            } else {
                if (isSizedGraphic(omIn)) {
                    bndsIn = omIn.shapeBounds;
                } else if (omIn.type === "text") {
                    if (omIn.textBounds) {
                        bndsIn = JSON.parse(JSON.stringify(omIn.textBounds));
                    } else if (omIn.shapeBounds) {
                        bndsIn = omIn.shapeBounds;
                    }
                }
            }

            var lineWidth = omIn.style && omIn.style.stroke && omIn.style.stroke.type !== "none" &&
                            omIn.style.stroke.lineWidth;
            if (lineWidth) {
                // If the shape has a border then we need to bump the bounds up?
                boundPadLeft = lineWidth / 2;
                boundPadRight = lineWidth / 2;
                boundPadTop = lineWidth / 2;
                boundPadBottom = lineWidth / 2;
            }

            if (omIn.type === "shape" && omIn.shape && (omIn.shape.type === "circle" || omIn.shape.type === "ellipse")) {
                if ((bndsIn.right - bndsIn.left) % 2 !== 0) {
                    boundPadRight += 1;
                }
                if ((bndsIn.bottom - bndsIn.top) % 2 !== 0) {
                    boundPadBottom += 1;
                }
            }

            if (bndsIn) {
                if (!isFinite(bnds.left) || (bndsIn.left - boundPadLeft) < bnds.left) {
                    bnds.left = (bndsIn.left - boundPadLeft);
                }
                if (!isFinite(bnds.right) || (bndsIn.right + boundPadRight) > bnds.right) {
                    bnds.right = bndsIn.right + boundPadRight;
                }
                if (!isFinite(bnds.top) || (bndsIn.top - boundPadTop) < bnds.top) {
                    bnds.top = bndsIn.top - boundPadTop;
                }
                if (!isFinite(bnds.bottom) || (bndsIn.bottom + boundPadBottom) > bnds.bottom) {
                    bnds.bottom = bndsIn.bottom + boundPadBottom;
                }
            }
        };

        var shiftTextBounds = function (ctx, omIn, nested, sibling) {
            var bnds = omIn.bounds,
                pR,
                pL,
                newMid,
                deltaX;

            if (omIn.type === "text") {
                bnds = omIn.textBounds;

                if (omIn.shapeBounds) {
                    svgWriterUtils.shiftBoundsX(omIn.shapeBounds, ctx._shiftContentX);
                    svgWriterUtils.shiftBoundsY(omIn.shapeBounds, ctx._shiftContentY);
                }

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
                            omIn.children[0].position = omIn.children[0].position || {x: 0, y: 0};
                            omIn.children[0].position.x = 0;
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
            } else if (omIn.type === "tspan") {
                if (omIn.style) {
                    if (omIn.position && isFinite(omIn.position.x)) {
                        if (omIn.style["text-anchor"] === "middle") {
                            if (omIn._parentBounds) {
                                pR = omIn._parentBounds.right;
                                pL = omIn._parentBounds.left;
                                newMid = omIn._parentBounds.left + (pR - pL) / 2;
                                if (omIn._parentIsRoot) {
                                    omIn.position.x = 50;
                                    omIn.position.unitX = "%";
                                } else {
                                    omIn.position.x = newMid;
                                    omIn.position.unitX = "px";
                                }
                            } else {
                                omIn.position.x = 50;
                                omIn.position.unitX = "%";
                            }
                        } else if (omIn.style["text-anchor"] === "end") {
                            if (omIn._parentBounds) {
                                pR = omIn._parentBounds.right;
                                pL = omIn._parentBounds.left;
                                newMid = omIn._parentBounds.left + (pR - pL) / 2;

                                if (omIn._parentIsRoot || !omIn.textBounds) {
                                    omIn.position.x = 100;
                                } else {
                                    deltaX = (ctx.contentBounds.right - omIn.textBounds.right);
                                    omIn.position.deltaX = -deltaX;
                                }
                            } else {
                                omIn.position.x = 100;
                                omIn.position.unitX = "%";
                            }
                        } else {
                            if (sibling && !omIn._hasParentTXFM) {
                                omIn.position.x += ctx._shiftContentX;
                            } else {
                                if (omIn._parentIsRoot) {
                                    omIn.position.x = 0;
                                } else {
                                    omIn.position.x = undefined;
                                }
                            }
                        }
                    }

                    if (omIn.style["_baseline-script"] === "sub" ||
                            omIn.style["_baseline-script"] === "super") {
                        if (typeof omIn.style["font-size"] === "number") {
                            omIn.style["font-size"] = Math.round(omIn.style["font-size"] / 2.0);
                        } else {
                            omIn.style["font-size"].value = Math.round(omIn.style["font-size"].value / 2.0);
                        }
                    }

                    if (omIn.style["_baseline-script"] === "super") {
                        omIn.position = omIn.position || {};
                        omIn.position.y = -0.5;
                        omIn.position.unitY = "em";
                    }
                }
            }
            if (bnds) {
                svgWriterUtils.shiftBoundsX(bnds, ctx._shiftContentX);
                svgWriterUtils.shiftBoundsY(bnds, ctx._shiftContentY);
            }
            if (omIn.originBounds) {
                svgWriterUtils.shiftBoundsX(omIn.originBounds, ctx._shiftContentX);
                svgWriterUtils.shiftBoundsY(omIn.originBounds, ctx._shiftContentY);
            }
        };

        // Shift the bounds recorded in recordBounds.
        var shiftBounds = function (ctx, omIn, nested, sibling) {
            var bnds = omIn.bounds;

            if (omIn.type === "text" || omIn.type === "tspan") {
                shiftTextBounds(ctx, omIn, nested, sibling);
                return;
            }

            if (isSizedGraphic(omIn)) {
                bnds = omIn.shapeBounds;
                if (omIn.type === "shape") {
                    if (omIn.shape.type === "circle" ||
                            omIn.shape.type === "ellipse") {
                        if ((bnds.right - bnds.left) % 2 !== 0) {
                            bnds.right += 1;
                        }
                        if ((bnds.bottom - bnds.top) % 2 !== 0) {
                            bnds.bottom += 1;
                        }
                    }
                }
            }
            if (bnds) {
                svgWriterUtils.shiftBoundsX(bnds, ctx._shiftContentX);
                svgWriterUtils.shiftBoundsY(bnds, ctx._shiftContentY);
            }
            if (omIn.originBounds) {
                svgWriterUtils.shiftBoundsX(omIn.originBounds, ctx._shiftContentX);
                svgWriterUtils.shiftBoundsY(omIn.originBounds, ctx._shiftContentY);
            }
        };

        var preprocessSVGNode = function (ctx) {
            var omIn = ctx.currentOMNode,
                children = omIn.children;

            if (ctx.config.trimToArtBounds) {
                recordBounds(ctx, omIn);
            }

            if (children) {
                children.forEach(function (childNode) {
                    ctx.currentOMNode = childNode;
                    preprocessSVGNode(ctx);
                }.bind(this));
            }
        };

        var finalizePreprocessing = function (ctx) {
            var bnds = ctx.contentBounds,
                docBounds = ctx.docBounds;
            if (ctx.config.trimToArtBounds) {
                if (bnds) {
                    if (ctx.config.constrainToDocBounds) {
                        bnds.left = Math.max(0, svgWriterUtils.roundDown(bnds.left || 0));
                        bnds.right = Math.min(docBounds.right, svgWriterUtils.roundUp(bnds.right || 0));
                        bnds.top = Math.max(0, svgWriterUtils.roundDown(bnds.top || 0));
                        bnds.bottom = Math.min(docBounds.bottom, svgWriterUtils.roundUp(bnds.bottom || 0));
                    } else {
                        bnds.left = svgWriterUtils.roundDown(bnds.left || 0);
                        bnds.right = svgWriterUtils.roundUp(bnds.right || 0);
                        bnds.top = svgWriterUtils.roundDown(bnds.top || 0);
                        bnds.bottom = svgWriterUtils.roundUp(bnds.bottom || 0);
                    }

                    ctx._shiftContentX = -bnds.left;
                    ctx._shiftContentY = -bnds.top;

                    if (ctx.svgOM && ctx.viewBox) {
                        ctx.viewBox.left = 0;
                        ctx.viewBox.top = 0;
                        ctx.viewBox.right = bnds.right - bnds.left;
                        ctx.viewBox.bottom = bnds.bottom - bnds.top;
                    } else {
                        console.log("no viewBox");
                    }
                }
            }
        };

        this.processSVGNode = function (ctx, nested, sibling) {
            var omIn = ctx.currentOMNode,
                children = omIn.children;

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

            this.scanForUnsupportedFeatures(ctx);
            this.externalizeStyles(ctx);

            if (omIn.type === "textPath") {
                svgWriterUtils.writeTextPath(ctx, omIn.pathData);
            }

            if (children) {
                children.forEach(function (childNode, ind) {
                    ctx.currentOMNode = childNode;
                    this.processSVGNode(ctx, (omIn !== ctx.svgOM), (ind !== 0));
                }.bind(this));
            }
        };

        this.processSVGOM = function (ctx) {
            var omSave = ctx.currentOMNode;
            ctx.omStylesheet = new SVGStylesheet();

            if (ctx.config.trimToArtBounds) {
                preprocessSVGNode(ctx, ctx.currentOMNode);
                finalizePreprocessing(ctx);
                ctx.currentOMNode = omSave;
            }
            this.processSVGNode(ctx, false, false);
            ctx.currentOMNode = omSave;
        };
    }

    module.exports = new SVGWriterPreprocessor();

}());
