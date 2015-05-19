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
        SVGOMWriter = require("./svgOMWriter.js"),
        ID = require("./idGenerator.js"),
        GradientMap = require("./svgOMGeneratorGradientMap.js"),
        svgWriter = require("./svgWriter.js"),
        svgWriterUtils = require("./svgWriterUtils.js"),
        Utils = require("./utils.js"),
        getId,
        round1k = Utils.round1k;

    function SVGOMGeneratorSVGFilter() {

        var hasPSEffect = function (fx, effect) {
            if (!fx[effect]) {
                return false;
            }
            return fx[effect].some(function (ele) {
                return ele.enabled;
            });
        };

        this.scanForUnsupportedFilterFeatures = function (fx, writer) {
            // This scans for unsupported PS filter effects.
            if (hasPSEffect(fx, "bevelEmbossMulti")) {
                writer.errors.push("Bevel and Emboss filter effects are not supported by SVG export.");
            }

            if (hasPSEffect(fx, "patternOverlayMulti")) {
                writer.errors.push("Pattern Overlay effects are not supported by SVG export.");
            }
        };

        var glowHelperFunction = function (glow, effects, glowType) {
            var gradientMap = new GradientMap(),
                color,
                opacity = round1k(glow.opacity),
                op = glowType == "innerGlow" ? "out" : "in",
                previousEffect = effects[effects.length - 1].result,
                feColorMatrix,
                feColorMatrix2,
                feColorMatrix3,
                feFlood;

            if (glow.gradient) {
                feColorMatrix = getId("color");
                feColorMatrix2 = getId("color");
                feColorMatrix3 = getId("color");
                effects.push(
                    // Inverse colors.
                    {
                        name: "feColorMatrix",
                        result: feColorMatrix,
                        input: [previousEffect],
                        type: "matrix",
                        values: [-1, 0, 0, 0, 1,
                                 0, -1, 0, 0, 1,
                                 0, 0, -1, 0, 1,
                                 0, 0, 0, 1, 0]
                    },
                    // Set RGB channels to A.
                    {
                        name: "feColorMatrix",
                        result: feColorMatrix2,
                        input: [feColorMatrix],
                        type: "matrix",
                        values: [0, 0, 0, 1, 0,
                                 0, 0, 0, 1, 0,
                                 0, 0, 0, 1, 0,
                                 0, 0, 0, 1, 0]
                    },
                    {
                        name: "feColorMatrix",
                        result: feColorMatrix3,
                        input: [feColorMatrix2],
                        type: "matrix",
                        values: [-1, 0, 0, 0, 1,
                                  0, -1, 0, 0, 1,
                                  0, 0, -1, 0, 1,
                                  0, 0, 0, 1, 0]
                    }
                );
                // Gradient map.
                gradientMap.createGradientMap(glow.gradient.stops, effects, getId);
            } else {
                color = glow.color;
                feFlood = getId("flood");
                effects.push(
                    {
                        name: "feFlood",
                        result: feFlood,
                        input: [],
                        "flood-color": color,
                        "flood-opacity": opacity
                    },
                    {
                        name: "feComposite",
                        result: getId("composite"),
                        input: [feFlood, previousEffect],
                        operator: op
                    }
                );
            }
        },
            createDropShadow = function (dropShadow, effects, globalLight) {
                var color = dropShadow.color,
                    opacity = round1k(dropShadow.opacity),
                    distance = dropShadow.distance,
                    angle = (dropShadow.useGlobalAngle ? globalLight.angle : dropShadow.localLightingAngle.value) * Math.PI / 180,
                    blur = round1k(Math.sqrt(dropShadow.blur)),
                    offset = {
                        x: round1k(-Math.cos(angle) * distance),
                        y: round1k(Math.sin(angle) * distance)
                    },
                    feOffset = getId("offset"),
                    feBlur = getId("blur"),
                    feFlood = getId("flood"),
                    feComposite = getId("composite"),
                    previousEffect = effects.length ? effects[effects.length - 1].result : "SourceGraphic";

                effects.push(
                    {
                        name: "feGaussianBlur",
                        result: feBlur,
                        input: ["SourceAlpha"],
                        stdDeviation: blur
                    },
                    {
                        name: "feFlood",
                        result: feFlood,
                        input: [],
                        "flood-color": color,
                        "flood-opacity": opacity
                    },
                    {
                        name: "feComposite",
                        result: feComposite,
                        input: [feFlood, feBlur],
                        operator: "in"
                    },
                    {
                        name: "feOffset",
                        result: feOffset,
                        input: [feComposite],
                        dx: offset.x,
                        dy: offset.y
                    }
                );

                if (previousEffect == "SourceGraphic") {
                    return;
                }
                // If we have multiple shadows, then we need to blend them.
                effects.push(
                    {
                        name: "feBlend",
                        result: getId("blend"),
                        input: [feOffset, previousEffect],
                        mode: dropShadow.mode
                    }
                );
            },
            createOuterGlow = function (glow, effects) {
                // There is no particular reason. It just looks correct with the 3 compositing operations
                // and setting "Contur" to "Half-round".
                var blur = round1k(glow.blur / 3),
                    previousEffect = effects.length ? effects[effects.length - 1].result : "SourceGraphic",
                    feBlur = getId("blur"),
                    feComposite = getId("composite"),
                    feComposite2 = getId("composite"),
                    feComposite3 = getId("composite");

                effects.push(
                    {
                        name: "feGaussianBlur",
                        result: feBlur,
                        input: ["SourceAlpha"],
                        stdDeviation: blur
                    },
                    {
                        name: "feComposite",
                        result: feComposite,
                        input: [feBlur, feBlur]
                    },
                    {
                        name: "feComposite",
                        result: feComposite2,
                        input: [feComposite, feComposite]
                    },
                    {
                        name: "feComposite",
                        result: feComposite3,
                        input: [feComposite2, feComposite2],
                        operator: "over"
                    }
                );

                glowHelperFunction(glow, effects, "outerGlow");

                effects.push(
                    {
                        name: "feBlend",
                        result: getId("blend"),
                        input: [effects[effects.length - 1].result, previousEffect],
                        mode: glow.mode
                    }
                );
            },
            createSourceGraphic = function (effects) {
                var previousEffect = effects.length ? effects[effects.length - 1].result : "SourceGraphic";
                if (previousEffect == "SourceGraphic") {
                    return;
                }
                effects.push(
                    {
                        name: "feBlend",
                        result: getId("blend"),
                        input: ["SourceGraphic", previousEffect]
                    }
                );
            },
            createGradientFill = function (gradientFill, effects, globalLight, dpi, layerBounds, docBounds) {
                // 1. Create a SVG document of the size of our document.
                // 2. Draw a rectangle into this document of the size of our layer.
                // 3. Fill the rectangle with the gradientFill.
                // 4. Trim SVG document to layer size.
                // 5. Create string from SVG document. Encode it to base64 and embed it in feImage.
                var gradientPair = omgUtils.toGradient(gradientFill, layerBounds, docBounds),
                    x = layerBounds.left,
                    y = layerBounds.top,
                    w = layerBounds.right - layerBounds.left,
                    h = layerBounds.bottom - layerBounds.top,
                    omWriter = new SVGOMWriter(),
                    rect = {
                        id: "shape-1",
                        type: "shape",
                        visible: true,
                        shape: {
                            type: "rect",
                            x: x,
                            y: y,
                            width: w,
                            height: h
                        },
                        visualBounds: layerBounds,
                        style: {
                            fill: {
                                type: "gradient",
                                gradient: gradientPair.reference
                            },
                            opacity: gradientFill.opacity ? gradientFill.opacity.value / 100 : 1
                        },
                        children: []
                    },
                    base64,
                    previousEffect = effects.length ? effects[effects.length - 1].result : "SourceGraphic",
                    feImage = getId("image"),
                    feComposite = getId("composite");

                rect.style.fill.gradient.id = "gradient-1";
                omWriter.peekCurrent().children.push(rect);
                omWriter.setDocViewBox(docBounds);
                omWriter.setDocBounds(docBounds);
                omWriter.setDocPxToInchRatio(dpi);
                omWriter.setDocGlobalLight(globalLight);
                omWriter._root.global.gradients["gradient-1"] = gradientPair.gradient;

                base64 = svgWriterUtils.toBase64(svgWriter.printSVG(omWriter._root, {
                    trimToArtBounds: true,
                    preserveAspectRatio: "xMidYMid",
                    scale: 1
                }));

                effects.push(
                    {
                        name: "feImage",
                        result: feImage,
                        input: [],
                        x: x,
                        y: y,
                        width: w,
                        height: h,
                        preserveAspectRatio: "none",
                        "xlink:href": "data:image/svg+xml;base64," + base64
                    },
                    {
                        name: "feComposite",
                        result: feComposite,
                        input: [feImage, "SourceGraphic"],
                        operator: "in"
                    },
                    {
                        name: "feBlend",
                        result: getId("blend"),
                        input: [feComposite, previousEffect],
                        mode: gradientFill.mode
                    }
                );
            },
            createColorOverlay = function (solidFill, effects) {
                var color = solidFill.color,
                    opacity = round1k(solidFill.opacity),
                    previousEffect = effects.length ? effects[effects.length - 1].result : "SourceGraphic",
                    feFlood = getId("flood"),
                    feComposite = getId("composite");

                effects.push(
                    {
                        name: "feFlood",
                        result: feFlood,
                        input: [],
                        "flood-color": color,
                        "flood-opacity": opacity
                    },
                    {
                        name: "feComposite",
                        result: feComposite,
                        input: [feFlood, "SourceGraphic"],
                        operator: "in"
                    },
                    {
                        name: "feBlend",
                        result: getId("blend"),
                        input: [feComposite, previousEffect],
                        mode: solidFill.mode
                    }
                );
            },
            createSatin = function (satin, effects) {
                var color = satin.color,
                    opacity = round1k(satin.opacity),
                    offset = {
                        x: round1k(satin.distance * Math.cos(-satin.localLightingAngle.value)),
                        y: round1k(satin.distance * Math.sin(-satin.localLightingAngle.value))
                    },
                    blur = round1k(Math.sqrt(satin.blur)),
                    previousEffect = effects.length ? effects[effects.length - 1].result : "SourceGraphic",
                    feFlood = getId("flood"),
                    feComposite = getId("composite"),
                    feComposite2 = getId("composite"),
                    feComposite3 = getId("composite"),
                    feComposite4 = getId("composite"),
                    feComposite5,
                    feComp = getId("comp"),
                    feOffset = getId("offset"),
                    feOffset2 = getId("offset"),
                    feBlur = getId("blur");

                effects.push(
                    {
                        name: "feFlood",
                        result: feFlood,
                        input: [],
                        "flood-color": color
                    },
                    {
                        name: "feComposite",
                        result: feComposite,
                        input: [feFlood, "SourceAlpha"],
                        operator: "in"
                    },
                    {
                        name: "feOffset",
                        result: feOffset,
                        input: [feComposite],
                        dx: offset.x,
                        dy: offset.y
                    },
                    {
                        name: "feOffset",
                        result: feOffset2,
                        input: [feComposite],
                        dx: -offset.x,
                        dy: -offset.y
                    },
                    {
                        name: "feComposite",
                        result: feComposite2,
                        input: [feOffset, feOffset2],
                        operator: "xor"
                    }
                );
                if (satin.invert) {
                    feComposite5 = getId("composite");
                    effects.push(
                        {
                            name: "feComposite",
                            result: feComposite5,
                            input: [feComposite2, feComposite],
                            operator: "xor"
                        }
                    );
                }
                effects.push(
                    {
                        name: "feComposite",
                        result: feComposite3,
                        input: [feComposite5 ? feComposite5 : feComposite2, "SourceAlpha"],
                        operator: "in"
                    },
                    {
                        name: "feGaussianBlur",
                        result: feBlur,
                        input: [feComposite3],
                        stdDeviation: blur
                    },
                    {
                        name: "feComponentTransfer",
                        result: feComp,
                        input: [feBlur],
                        children: [
                            {
                                name: "feFuncA",
                                type: "linear",
                                slope: opacity
                            }
                        ]
                    },
                    {
                        name: "feComposite",
                        result: feComposite4,
                        input: [feComp, "SourceAlpha"],
                        operator: "in"
                    },
                    {
                        name: "feBlend",
                        result: getId("blend"),
                        input: [feComposite4, previousEffect],
                        mode: satin.mode
                    }
                );
            },
            createInnerGlow = function (glow, effects) {
                var blur = round1k(glow.blur / 3),
                    feBlur = getId("blur"),
                    feComposite = getId("composite"),
                    previousEffect = effects.length ? effects[effects.length - 1].result : "SourceGraphic";

                effects.push(
                    {
                        name: "feGaussianBlur",
                        result: feBlur,
                        input: ["SourceAlpha"],
                        stdDeviation: blur
                    }
                );

                if (glow.gradient) {
                    // Reverse gradient. The luminance for inner shadows is inverse to outer shadows.
                    glow.gradient.stops.reverse().forEach(function (ele) {
                        ele.offset = Math.abs(ele.offset - 1);
                    });
                }

                glowHelperFunction(glow, effects, "innerGlow");

                effects.push(
                    {
                        name: "feComposite",
                        result: feComposite,
                        input: [effects[effects.length - 1].result, "SourceAlpha"],
                        operator: "in"
                    },
                    {
                        name: "feBlend",
                        result: getId("blend"),
                        input: [feComposite, previousEffect],
                        mode: glow.mode
                    }
                );
            },
            createInnerShadow = function (innerShadow, effects, globalLight) {
                var color = innerShadow.color,
                    opacity = round1k(innerShadow.opacity),
                    distance = innerShadow.distance,
                    angle = (innerShadow.useGlobalAngle ? globalLight.angle : innerShadow.localLightingAngle.value) * Math.PI / 180,
                    blur = round1k(Math.sqrt(innerShadow.blur)),
                    offset = {
                        x: round1k(-Math.cos(angle) * distance),
                        y: round1k(Math.sin(angle) * distance)
                    },
                    feOffset = getId("offset"),
                    feBlur = getId("blur"),
                    feFlood = getId("flood"),
                    feComposite = getId("composite"),
                    feComposite2 = getId("composite"),
                    previousEffect = effects.length ? effects[effects.length - 1].result : "SourceGraphic";

                effects.push(
                    {
                        name: "feGaussianBlur",
                        result: feBlur,
                        input: ["SourceAlpha"],
                        stdDeviation: blur
                    },
                    {
                        name: "feFlood",
                        result: feFlood,
                        input: [],
                        "flood-color": color,
                        "flood-opacity": opacity
                    },
                    {
                        name: "feComposite",
                        result: feComposite,
                        input: [feFlood, feBlur],
                        operator: "out"
                    },
                    {
                        name: "feOffset",
                        result: feOffset,
                        input: [feComposite],
                        dx: offset.x,
                        dy: offset.y
                    },
                    {
                        name: "feComposite",
                        result: feComposite2,
                        input: [feOffset, "SourceAlpha"],
                        operator: "in"
                    },
                    {
                        name: "feBlend",
                        result: getId("blend"),
                        input: [feComposite2, previousEffect],
                        mode: innerShadow.mode
                    }
                );
            };

        this.createSVGFilters = function (svgNode, writer, fx, layerBounds, docBounds) {
            var effects = [],
                globalLight = writer._root.meta.PS.globalLight,
                filterList = [
                    {effect: "dropShadowMulti", fn: createDropShadow},
                    {effect: "outerGlowMulti", fn: createOuterGlow},
                    {effect: "source", fn: createSourceGraphic},
                    {effect: "gradientFillMulti", fn: createGradientFill},
                    {effect: "solidFillMulti", fn: createColorOverlay},
                    {effect: "chromeFXMulti", fn: createSatin},
                    {effect: "innerGlowMulti", fn: createInnerGlow},
                    {effect: "innerShadowMulti", fn: createInnerShadow}
                ],
                idGen = new ID();

            getId = idGen.getUnique;

            for (var i = 0, ii = filterList.length; i < ii; ++i) {
                if (filterList[i].effect == "source") {
                    filterList[i].fn(effects, globalLight);
                    continue;
                }
                var list = fx[filterList[i].effect];
                if (!list) {
                    continue;
                }
                list.forEach(function (item) {
                    if (!item.enabled) {
                        return;
                    }
                    filterList[i].fn(item, effects, globalLight, writer._dpi(), layerBounds, docBounds);
                });
            }

            if (!effects.length) {
                return;
            }
            return {
                filterUnits: "userSpaceOnUse",
                children: effects
            };
        };
    }

    module.exports = new SVGOMGeneratorSVGFilter();

}());
