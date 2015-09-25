// Copyright (c) 2015 Adobe Systems Incorporated. All rights reserved.
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

module.exports = {
    "default": ["", "string"],
    "feFuncA": {
        "amplitude": [1, "number"],
        "exponent": [1, "number"],
        "intercept": [0, "number"],
        "offset": [0, "number"],
        "slope": [1, "number"]
    },
    "feFuncB": {
        "amplitude": [1, "number"],
        "exponent": [1, "number"],
        "intercept": [0, "number"],
        "offset": [0, "number"],
        "slope": [1, "number"]
    },
    "feFuncG": {
        "amplitude": [1, "number"],
        "exponent": [1, "number"],
        "intercept": [0, "number"],
        "offset": [0, "number"],
        "slope": [1, "number"]
    },
    "feFuncR": {
        "amplitude": [1, "number"],
        "exponent": [1, "number"],
        "intercept": [0, "number"],
        "offset": [0, "number"],
        "slope": [1, "number"]
    },
    "feDistantLight": {
        "azimuth": [0, "number"],
        "elevation": [0, "number"]
    },
    "feTurbulence": {
        "baseFrequency": [0, "number-sequence"],
        "seed": [0, "number"],
        "stitchTiles": ["noStitch", "string"],
        "type": ["turbulence", "string"]
    },
    "feConvolveMatrix": {
        "bias": [0, "number"],
        "divisor": [1, "number"],
        "edgeMode": ["duplicate", "string"],
        "order": [3, "number-sequence"],
        "preserveAlpha": ["false", "string"]
    },
    "clipPath": {
        "clipPathUnits": ["userSpaceOnUse", "string"]
    },
    "circle": {
        "cx": [0, "number", true],
        "cy": [0, "number", true],
        "r": [0, "number", true]
    },
    "ellipse": {
        "cx": [0, "number", true],
        "cy": [0, "number", true],
        "rx": [0, "number", true],
        "ry": [0, "number", true]
    },
    "feImage": {
        "x": ["0%", "string"],
        "y": ["0%", "string"]
    },
    "radialGradient": {
        "cx": ["50%", "number"],
        "cy": ["50%", "number"],
        "fx": ["50%", "string"],
        "fy": ["50%", "string"],
        "r": ["50%", "number"]
    },
    "feDiffuseLighting": {
        "diffuseConstant": [1, "number"]
    },
    "feOffset": {
        "dx": [0, "number"],
        "dy": [0, "number"]
    },
    "text": {
        "dx": [0, "number-sequence", true],
        "dy": [0, "number-sequence", true],
        "lengthAdjust": ["spacing", "string"],
        "rotate": [0, "number-sequence", true]
    },
    "tspan": {
        "dx": [0, "number-sequence", true],
        "dy": [0, "number-sequence", true],
        "lengthAdjust": ["spacing", "string"],
        "rotate": [0, "number-sequence", true],
        "x": ["", "number", true],
        "y": ["", "number", true]
    },
    "filter": {
        "filterRes": [null, "number-sequence"],
        "filterUnits": ["objectBoundingBox", "string"],
        "primitiveUnits": ["userSpaceOnUse", "string"],
        "x": ["-10%", "number"],
        "y": ["-10%", "number"],
        "width": ["120%", "number"],
        "height": ["120%", "number"]
    },
    "svg": {
        "height": ["100%", "number", true],
        "width": ["100%", "number", true]
    },
    "feComposite": {
        "k1": [0, "number"],
        "k2": [0, "number"],
        "k3": [0, "number"],
        "k4": [0, "number"],
        "operator": ["over", "string"]
    },
    "textPath": {
        "lengthAdjust": ["spacing", "string"],
        "method": ["align", "string"],
        "spacing": ["exact", "string"],
        "startOffset": [0, "number", true]
    },
    "marker": {
        "markerHeight": [3, "number"],
        "markerUnits": ["strokeWidth", "string"],
        "markerWidth": [3, "number"],
        "orient": [0, "number"],
        "refX": [0, "number"],
        "refY": [0, "number"]
    },
    "mask": {
        "maskContentUnits": ["userSpaceOnUse", "string"],
        "maskUnits": ["objectBoundingBox", "string"],
        "x": ["-10%", "number"],
        "y": ["-10%", "number"],
        "width": ["120%", "number"],
        "height": ["120%", "number"]
    },
    "feBlend": {
        "mode": ["normal", "string"]
    },
    "feMorphology": {
        "operator": ["erode", "string"],
        "radius": [0, "number-sequence"]
    },
    "pattern": {
        "patternContentUnits": ["userSpaceOnUse", "string"],
        "patternUnits": ["objectBoundingBox", "string"]
    },
    "feSpotLight": {
        "pointsAtX": [0, "number"],
        "pointsAtY": [0, "number"],
        "pointsAtZ": [0, "number"],
        "specularExponent": [1, "number"],
        "z": [0, "number"]
    },
    "rect": {
        "rx": [0, "number", true],
        "ry": [0, "number", true]
    },
    "feDisplacementMap": {
        "scale": [0, "number"],
        "xChannelSelector": ["A", "string"],
        "yChannelSelector": ["A", "string"]
    },
    "feSpecularLighting": {
        "specularConstant": [1, "number"],
        "specularExponent": [1, "number"]
    },
    "feGaussianBlur": {
        "stdDeviation": [0, "number-sequence"]
    },
    "a": {
        "target": ["_self", "string"]
    },
    "feColorMatrix": {
        "type": ["matrix", "string"],
        "values": ["", "number-sequence"]
    },
    "line": {
        "x1": [0, "number", true],
        "x2": [0, "number", true],
        "y1": [0, "number", true],
        "y2": [0, "number", true]
    },
    "linearGradient": {
        "x1": [0, "number"],
        "x2": ["100%", "number"],
        "y1": [0, "number"],
        "y2": [0, "number"]
    },
    "fePointLight": {
        "z": [0, "number"]
    },
    "*": {
        "height": [0, "number"],
        "points": ["", "number-sequence", true],
        "preserveAspectRatio": ["xMidYMid", "string"],
        "spreadMethod": ["pad", "string"],
        "surfaceScale": [1, "number"],
        "tableValues": ["", "number-sequence"],
        "viewBox": ["", "number-sequence", true],
        "width": [0, "number", true],
        "x": [0, "number", true],
        "y": [0, "number", true],
        // presentation attributes.
        "alignment-baseline": ["auto", "string"],
        "baseline-shift": ["baseline", "string"],
        "clip-path": ["none", "string"],
        "clip-rule": ["nonzero", "string"],
        "clip": ["auto", "string"],
        "color-interpolation-filters": ["linearRGB", "string"],
        "color-interpolation": ["sRGB", "string"],
        "color-profile": ["auto", "string"],
        "color-rendering": ["auto", "string"],
        "cursor": ["auto", "string"],
        "direction": ["ltr", "string"],
        "display": ["inline", "string"],
        "dominant-baseline": ["auto", "string"],
        "enable-background": ["accumulate", "string"],
        "fill-opacity": [1, "number"],
        "fill": ["#000", "color"],
        "filter": ["none", "string"],
        "flood-color": ["#000", "color"],
        "flood-opacity": [1, "number"],
        "font-size": [0, "number"], // font-size could be string in CSS but OMG doesn't accept strings.
        "font-style": ["normal", "string"],
        "font-variant": ["normal", "string"],
        "font-weight": ["400", "string"],
        "glyph-orientation-horizontal": ["auto", "string"],
        "glyph-orientation-vertical": ["auto", "string"],
        "image-rendering": ["auto", "string"],
        "kerning": ["auto", "string"],
        "letter-spacing": [0, "number"], // letter-spacing could be string in CSS but OMG doesn't accept strings.
        "lighting-color": ["#fff", "color"],
        "marker-end": ["none", "string"],
        "marker-mid": ["none", "string"],
        "marker-start": ["none", "string"],
        "mask": ["none", "string"],
        "opacity": [1, "number"],
        "pointer-events": ["visiblePainted", "string"],
        "shape-rendering": ["auto", "string"],
        "stop-color": ["#000", "color"],
        "stop-opacity": [1, "number"],
        "offset": ["", "number"],
        "stroke-dasharray": ["none", "number-sequence"],
        "stroke-dashoffset": [0, "number-sequence"],
        "stroke-linecap": ["butt", "string"],
        "stroke-linejoin": ["miter", "string"],
        "stroke-miterlimit": [4, "number"],
        "stroke-opacity": [1, "number"],
        "stroke-width": [1, "number"],
        "stroke": ["none", "color"],
        "text-anchor": ["start", "string"],
        "text-decoration": ["none", "string"],
        "text-orientation": ["mixed", "string"],
        "text-rendering": ["auto", "string"],
        "unicode-bidi": ["normal", "string"],
        "visibility": ["visible", "string"],
        "word-spacing": ["normal", "string"],
        "writing-mode": ["lr-tb", "string"]
    }
};
