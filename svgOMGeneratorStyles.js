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

    var omgUtils = require("./svgOMGeneratorUtils.js"),
        omgSVGFilter = require("./svgOMGeneratorSVGFilter.js"),
        CONST_COLOR_BLACK = { red: 0, green: 0, blue: 0 };

    function SVGOMGeneratorStyles() {
        var decamelcase = function (string) {
                return string.replace(/([A-Z])/g, "-$1");
            },
            fetchOpacity = function (layer) {
                if (layer.blendOptions &&
                    layer.blendOptions.opacity) {
                    return layer.blendOptions.opacity.value / 100;
                }
                return undefined;
            },

            isPathNode = function (svgNode) {
                return svgNode.type == "shape" && svgNode.shape.type == "path";
            };

        this.fetchBlendMode = function (layer) {
            var blendMode;
            if (layer.blendOptions &&
                layer.blendOptions.mode) {
                blendMode = layer.blendOptions.mode;
                blendMode = decamelcase(blendMode);
            }

            switch (blendMode) {
            case "pass-Through":
            case "normal":
                return undefined;
            case "multiply":
            case "screen":
            case "overlay":
            case "darken":
            case "lighten":
            case "color-dodge":
            case "color-burn":
            case "hard-light":
            case "soft-light":
            case "difference":
            case "exclusion":
            case "hue":
            case "saturation":
            case "color":
            case "luminosity":
                return blendMode;
            default:
                return undefined;
            }
        };

        this.addGlobalStyle = function (svgNode, layer) {
            var propertyFetchers = { // Properties we fetch for all layers
                    "opacity": fetchOpacity,
                    "mix-blend-mode": this.fetchBlendMode
                },
                property;

            for (property in propertyFetchers) {
                var value = propertyFetchers[property](layer);
                if (value !== undefined) {
                    svgNode.style[property] = value;
                }
            }
        };

        this.addStroke = function (svgNode, layer, layerBounds, writer) {
            var dpi = writer._dpi(),
                stroke = svgNode.style.stroke || {},
                strokeStyle = layer.strokeStyle,
                gradientPair,
                toStrokeLinecap = {
                    "strokeStyleRoundCap": "round",
                    "strokeStyleButtCap": "butt",
                    "strokeStyleSquareCap": "square"
                },
                toStrokeLinejoin = {
                    "strokeStyleBevelJoin": "bevel",
                    "strokeStyleRoundJoin": "round",
                    "strokeStyleMiterJoin": "miter"
                };

            svgNode.style.stroke = stroke;

            if (strokeStyle) {
                stroke.type = !strokeStyle.strokeEnabled ? "none" : "solid";
                stroke.cap = strokeStyle.strokeStyleLineCapType ? toStrokeLinecap[strokeStyle.strokeStyleLineCapType] : "butt";
                stroke.join = strokeStyle.strokeStyleLineJoinType ? toStrokeLinejoin[strokeStyle.strokeStyleLineJoinType] : "miter";
                stroke.width = strokeStyle.strokeStyleLineWidth ? omgUtils.boundInPx(strokeStyle.strokeStyleLineWidth, dpi) : 1;
                stroke["miter-limit"] = strokeStyle.strokeStyleMiterLimit ? strokeStyle.strokeStyleMiterLimit : 100;
                stroke.dash = strokeStyle.strokeStyleLineDashSet ?
                    strokeStyle.strokeStyleLineDashSet.map(function (ele) {
                    return omgUtils.boundInPx(ele, dpi) * (stroke.width || 0);
                }) : [];
                stroke["dash-offset"] = strokeStyle.strokeStyleLineDashOffset ? omgUtils.boundInPx(strokeStyle.strokeStyleLineDashOffset, dpi) : 0;
                stroke.color = strokeStyle.strokeStyleContent && strokeStyle.strokeStyleContent.color ? omgUtils.toColor(strokeStyle.strokeStyleContent.color) : CONST_COLOR_BLACK;
                stroke.opacity = strokeStyle.strokeStyleOpacity ? strokeStyle.strokeStyleOpacity.value / 100 : 1;
                stroke.pattern = strokeStyle.strokeStyleContent && strokeStyle.strokeStyleContent.pattern ? "PATTERN-PLACEHOLDER" : undefined;
                if (strokeStyle.strokeStyleContent && strokeStyle.strokeStyleContent.gradient &&
                    omgUtils.scanForUnsupportedGradientFeatures(strokeStyle.strokeStyleContent, writer)) {
                    stroke.type = "gradient";
                    gradientPair = omgUtils.toGradient(strokeStyle.strokeStyleContent, layerBounds, writer._root.global.bounds);
                    stroke.gradient = gradientPair.reference;
                    stroke.gradient.id = writer.ID.getUnique(gradientPair.gradient.type + "-gradient");
                    writer.global().gradients[stroke.gradient.id] = gradientPair.gradient;
                }
            } else {
                stroke.type = "none";
            }
        };

        this.addFillRule = function (svgNode) {
            if (!isPathNode(svgNode)) {
                return;
            }
            // evenodd is the default and only fill rule supported in PS.
            svgNode.shape.winding = "evenodd";
        };

        this.addFill = function (svgNode, layer, layerBounds, writer) {
            var fill = svgNode.style.fill || {},
                fillStyle = layer.fill,
                gradientPair,
                strokeStyle = layer.strokeStyle;
            if (!fillStyle || strokeStyle && strokeStyle.fillEnabled === false) {
                return;
            }

            var fillClass = fillStyle.class;

            svgNode.style.fill = fill;

            if (fillClass === "solidColorLayer") {
                fill.type = "solid";
                fill.color = omgUtils.toColor(fillStyle.color);
            } else if (fillClass == "gradientLayer") {
                if (fillStyle.gradient &&
                    omgUtils.scanForUnsupportedGradientFeatures(fillStyle, writer)) {
                    fill.type = "gradient";
                    gradientPair = omgUtils.toGradient(fillStyle, layerBounds, writer._root.global.bounds);
                    fill.gradient = gradientPair.reference;
                    fill.gradient.id = writer.ID.getUnique(gradientPair.gradient.type + "-gradient");
                    writer.global().gradients[fill.gradient.id] = gradientPair.gradient;
                }
            } else if (fillClass === "patternLayer") {
                fill.type = "pattern";
                fill.pattern = "PATTERN-PLACEHOLDER";
            } else {
                fill.type = "none";
                //unhandled fill
                console.log("WARNING: Unhandled fill " + fillClass);
            }

            if (layer.blendOptions && layer.blendOptions.fillOpacity) {
                fill.opacity = layer.blendOptions.fillOpacity.value / 100;
            }
        };

        var applyStrokeFilter = function (svgNode, strokeStyle, layer, layerBounds, writer) {
            var stroke = {},
                gradientPair;

            if (!strokeStyle) {
                return;
            }

            svgNode.style.stroke = stroke;

            if (strokeStyle) {
                stroke.type = !strokeStyle.enabled ? "none" : "solid";
                stroke.width = strokeStyle.size ? strokeStyle.size : 1;
                stroke.color = strokeStyle.color ? omgUtils.toColor(strokeStyle.color) : CONST_COLOR_BLACK;
                stroke.opacity = strokeStyle.opacity ? strokeStyle.opacity.value / 100 : 1;
                stroke.cap = "butt";
                stroke.join = "round";
                stroke["miter-limit"] = 100;
                stroke.sourceStyle = strokeStyle.style;
                if (strokeStyle.gradient) {
                    stroke.type = "gradient";
                    gradientPair = omgUtils.toGradient(strokeStyle, layerBounds, writer._root.global.bounds);
                    stroke.gradient = gradientPair.reference;
                    stroke.gradient.id = writer.ID.getUnique(gradientPair.gradient.type + "-gradient");
                    writer.global().gradients[stroke.gradient.id] = gradientPair.gradient;
                }
            } else {
                stroke.type = "none";
            }
        };

        this.addFx = function (svgNode, layer, layerBounds, writer) {
            if (!layer.layerEffects || layer.layerEffects.masterFXSwitch === false) {
                return;
            }
            svgNode.style.meta = svgNode.style.meta || {};
            svgNode.style.meta.PS = svgNode.style.meta.PS || {};
            svgNode.style.meta.PS.fx = JSON.parse(JSON.stringify(layer.layerEffects));

            var fx = svgNode.style.meta.PS.fx,
                filter;

            function prepareEffect(effect, prepareFunction) {
                var list = effect + "Multi";

                if (fx[effect]) {
                    // Transform single effects to lists.
                    fx[list] = [
                        fx[effect]
                    ];
                    delete fx[effect];
                }
                if (fx[list]) {
                    // PS exports filters in the opposite order, revert.
                    fx[list].reverse();
                    if (typeof prepareFunction == "function") {
                        fx[list].forEach(prepareFunction);
                    }
                }
            }

            function prepareColor(ele) {
                ele.color = omgUtils.toColor(ele.color);
                ele.opacity = ele.opacity ? ele.opacity.value / 100 : 1;
            }

            function prepareGlow(ele) {
                if (ele.gradient) {
                    ele.gradient = omgUtils.toColorStops(ele);
                    ele.opacity = ele.opacity ? ele.opacity.value / 100 : 1;
                } else {
                    prepareColor(ele);
                }
            }

            prepareEffect("dropShadow", prepareColor);
            prepareEffect("outerGlow", prepareGlow);
            prepareEffect("gradientFill");
            prepareEffect("solidFill", prepareColor);
            prepareEffect("chromeFX", prepareColor);
            prepareEffect("innerGlow", prepareGlow);
            prepareEffect("innerShadow", prepareColor);
            prepareEffect("bevelEmboss");
            prepareEffect("patternOverlay");

            omgSVGFilter.scanForUnsupportedFilterFeatures(fx, writer);

            filter = omgSVGFilter.createSVGFilters(svgNode, writer, fx, JSON.parse(JSON.stringify(layerBounds)), JSON.parse(JSON.stringify(writer._root.global.bounds)));
            if (filter) {
                svgNode.style.filter = writer.ID.getUnique("filter");
                writer.global().filters[svgNode.style.filter] = filter;
            }

            applyStrokeFilter(svgNode, svgNode.style.meta.PS.fx.frameFX, layer, layerBounds, writer);
        };

        this.addGroupStylingData = function (svgNode, layer, writer) {
            this.addStylingData(svgNode, layer, layer.bounds, writer);
        };

        this.addStylingData = function (svgNode, layer, layerBounds, writer) {

            this.addGlobalStyle(svgNode, layer);

            if (svgNode.type == "generic") {
                return;
            }

            this.addStroke(svgNode, layer, layerBounds, writer);
            this.addFill(svgNode, layer, layerBounds, writer);
            this.addFillRule(svgNode, layer);
            this.addFx(svgNode, layer, layerBounds, writer);
        };

        var weightMap = {
                hairline: 100,
                "ultra-light": 100,
                ultralight: 100,
                "ultra-thin": 100,
                ultrathin: 100,
                "extra-light": 200,
                extralight: 200,
                thin: 200,
                light: 300,
                demi: 300,
                normal: 400,
                regular: 400,
                book: 400,
                roman: 400,
                plain: 400,
                medium: 500,
                semibold: 600,
                demibold: 600,
                "demi-bold": 600,
                bold: 700,
                black: 800,
                heavy: 800,
                "extra-bold": 800,
                extrabold: 800,
                "extra-black": 900,
                extrablack: 900,
                fat: 900,
                poster: 900,
                "ultra-black": 900,
                ultrablack: 900
            },
            italicMap = {
                italic: 1,
                oblique: 1,
                slanted: 1
            };
        this.addTextChunkStyle = function (span, textStyle, dpi) {
            var fontFamily,
                PSName;

            if (textStyle.textStyle.color) {
                span.style.fill = {
                    type: "solid",
                    color: omgUtils.toColor(textStyle.textStyle.color)
                };
            }

            if (textStyle.textStyle.fontName) {
                fontFamily = textStyle.textStyle.fontName;
                PSName = textStyle.textStyle.fontPostScriptName;
                if (~fontFamily.indexOf(" ")) {
                    fontFamily = '"' + fontFamily + '"';
                }
                span.style["font-family"] = fontFamily;
            }

            if (textStyle.textStyle.size) {
                span.style["font-size"] = omgUtils.boundInPx(textStyle.textStyle.size, dpi);
            }
            if (textStyle.textStyle.leading) {
                span.style._leading = textStyle.textStyle.leading;
            }

            if (textStyle.textStyle.fontStyleName) {
                var styles = textStyle.textStyle.fontStyleName.toLowerCase().split(" ");
                styles.forEach(function (style) {
                    if (weightMap[style]) {
                        if (weightMap[style] != 400) { // default
                            span.style["font-weight"] = weightMap[style];
                        }
                    } else if (italicMap[style]) {
                        span.style["font-style"] = "italic";
                    } else {
                        if (PSName) {
                            if (~PSName.indexOf(" ")) {
                                PSName = '"' + PSName + '"';
                            }
                            fontFamily = PSName + ", " + fontFamily;
                        }
                        span.style["font-family"] = fontFamily;
                    }
                });
            }

            if (textStyle.textStyle.strikethrough && textStyle.textStyle.strikethrough.indexOf("StrikethroughOn") >= 0) {
                span.style["text-decoration"] = "line-through";
            }

            if (textStyle.textStyle.underline && textStyle.textStyle.underline.indexOf("underlineOn") >= 0) {
                if (span.style["text-decoration"]) {
                    span.style["text-decoration"] += " underline";
                } else {
                    span.style["text-decoration"] = "underline";
                }
            }

            if (textStyle.textStyle.fontCaps) {
                if (textStyle.textStyle.fontCaps === "smallCaps") {
                    span.style["font-variant"] = "small-caps";
                } else if (textStyle.textStyle.fontCaps === "allCaps") {
                    span.style["text-transform"] = "uppercase";
                }
            }

            if (textStyle.textStyle.baseline) {
                if (textStyle.textStyle.baseline === "smallCaps") {
                    span.style["baseline-shift"] = "super";
                } else if (textStyle.textStyle.baseline === "allCaps") {
                    span.style["baseline-shift"] = "sub";
                } else if (textStyle.textStyle.baseline === "subScript") {
                    //cut size in half and stick to bottom
                    span.style["_baseline-script"] = "sub";
                } else if (textStyle.textStyle.baseline === "superScript") {
                    //cut size in half and stick to top
                    span.style["_baseline-script"] = "super";
                }
            }
        };

        function _computeMaxFontSize(paragraphNode) {
            var maxSize,
                fontSize,
                i;

            // For correct paragraph offset, we need to know the max font size.
            if (paragraphNode.children && paragraphNode.children.length) {

                for (i = 0; i < paragraphNode.children.length; ++i) {
                    if (!paragraphNode.children[i].style || !paragraphNode.children[i].style["font-size"]) {
                        continue;
                    }
                    fontSize = paragraphNode.children[i].style["font-size"];

                    if (typeof fontSize === "number") {
                        if (!isFinite(maxSize) || fontSize > maxSize) {
                            maxSize = fontSize;
                        }
                    } else {
                        if (!maxSize || fontSize.value > maxSize.value) {
                            maxSize = maxSize || { units: fontSize.units };
                            maxSize.value = fontSize.value;
                        }
                    }
                }
            }

            return maxSize;
        }

        this.addParagraphStyle = function (paragraphNode, paragraphStyle) {
            function fetchTextAlign(paragraphStyle) {
                var alignment = {
                        "left": undefined,
                        "center": "middle",
                        "right": "end"
                    };

                if (paragraphStyle.align) {
                    return alignment[paragraphStyle.align];
                }
                return undefined;
            }

            paragraphNode.style = {
                "text-anchor": fetchTextAlign(paragraphStyle),
                "font-size": _computeMaxFontSize(paragraphNode)
            };
        };

        var addComputedTextStyle = function (svgNode) {
            svgNode.style["font-size"] = _computeMaxFontSize(svgNode);
        };

        this.addTextStyle = function (svgNode, layer) {
            if (layer.text.textShape[0].orientation &&
                layer.text.textShape[0].orientation == "vertical") {
                svgNode.style["writing-mode"] = "tb";
                svgNode.style["glyph-orientation-vertical"] = "0";
            }

            addComputedTextStyle(svgNode, layer);
        };
    }

    module.exports = new SVGOMGeneratorStyles();

}());
