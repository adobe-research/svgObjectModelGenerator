(function () {
    "use strict";
    // { test: name of the test, desc: what is tested,
    //  skip: boolean to skip test, layerTest: boolean extract all layers individually as well? }
    var database = [
        {
            test: "svgFill",
            desc: "should be able to SVG a gradient fill OM",
            layerTest: true
        },
        {
            test: "gradient-duplicate",
            desc: "should avoid douplicated gradients"
        },
        {
            test: "AdobeLogo",
            desc: "should Adobe Logo"
        },
        {
            test: "svgRect",
            desc: "should create rectangles with different properties"
        },
        {
            test: "svgText",
            desc: "should create text"
        },
        {
            test: "svgText-align",
            desc: "should align text"
        },
        {
            test: "svgText-writing-mode",
            desc: "should support vertical text"
        },
        {
            test: "svgFx-shadow",
            desc: "should support drop shadow and inner shadow"
        },
        {
            test: "svgFx-shadow-overlay",
            desc: "should support drop shadow, inner shadow and overlay"
        },
        {
            test: "svgOverlay",
            desc: "should support overlay"
        },
        {
            test: "svgGradientOverlay",
            desc: "should support gradientOverlay",
            layerTest: true
        },
        {
            test: "svgGradientOverlay-opacity",
            desc: "should support gradientOverlay with opacity"
        },
        {
            test: "svgGradient",
            desc: "should support linear gradients"
        },
        {
            test: "svgTextGradient",
            desc: "should support gradients on text"
        },
        {
            test: "svgTextFx",
            desc: "should support shadows and overlays on text"
        },
        {
            test: "svgFx-satin",
            desc: "should support satin fx effect"
        },
        {
            test: "filter-duplicate",
            desc: "should avoid duplicated filter defintions"
        },
        {
            // The PSD is missing. We can not update the JSON.
            test: "svgFx-all",
            desc: "test all shape filter effects",
            skip: true
        },
        {
            test: "pixelImage",
            desc: "should show embedded data",
            layerTest: true
        },
        {
            test: "pixelImage-linked",
            desc: "should show linked data"
        },
        {
            test: "pixelImage-fx",
            desc: "should show embedded data with fx effects"
        },
        {
            test: "outer-glow",
            desc: "should show outer glow fx effects"
        },
        {
            test: "svgFx-inner-glow",
            desc: "should show inner glow fx effects"
        },
        {
            test: "svgGradient-radial",
            desc: "should show radial gradients"
        },
        {
            test: "gradient-scale",
            desc: "should show scaled gradients"
        },
        {
            test: "svgGradient-reflected",
            desc: "should show reflected gradients"
        },
        {
            test: "gradient-scale-reflected",
            desc: "should show scaled, reflected gradients"
        },
        {
            test: "gradient-reverse",
            desc: "should show reversed gradients"
        },
        {
            test: "stroke-style",
            desc: "should show stroke style"
        },
        {
            test: "group",
            desc: "should show fx effects on grouping layers"
        },
        {
            test: "radial-gradient-angle-layer",
            desc: "should support different radii for radial gradients in layer space"
        },
        {
            test: "radial-gradient-angle-global",
            desc: "should support different radii for radial gradients in global space",
            layerTest: true
        },
        {
            test: "linear-gradient-angle-layer",
            desc: "should support different radii for linear gradients in layer space"
        },
        {
            test: "linear-gradient-angle-layer-2",
            desc: "should support different radii for linear gradients in layer space part 2"
        },
        {
            test: "linear-gradient-angle-layer-3",
            desc: "should support different radii for linear gradients in layer space part 3"
        },
        {
            test: "linear-gradient-angle-global",
            desc: "should support different radii for linear gradients in global space"
        },
        {
            test: "linear-gradient-angle-global-2",
            desc: "should support different radii for linear gradients in layer space part 2"
        },
        {
            test: "text-styling",
            desc: "should support text styling"
        },
        {
            test: "text-styling2",
            desc: "should support font-weight"
        },
        {
            test: "text-on-path",
            desc: "should support text on path"
        },
        {
            test: "text-on-path-2",
            desc: "should support text on path",
            layerTest: true
        },
        {
            test: "text-transform",
            desc: "should support text transformation"
        },
        {
            test: "light-global-local",
            desc: "should differ between local and gloval lighting"
        },
        {
            test: "stroke-fx",
            desc: "should support fx stroke"
        },
        {
            test: "gradient-color-overlay",
            desc: "should support gradient overlay in combination with color overlay"
        },
        {
            test: "multi-layer-fx-1",
            desc: "Test multiple drop shadows per layer."
        },
        {
            test: "multi-layer-fx-2",
            desc: "Test multiple color overlays per layer."
        },
        {
            test: "multi-layer-fx-3",
            desc: "Test multiple gradient overlays per layer."
        },
        {
            test: "multi-layer-fx-4",
            desc: "Test multiple inline shadows per layer."
        },
        {
            test: "artboards-1",
            desc: "Test of artboards 1.",
            layerTest: true
        },
        {
            test: "artboards-2",
            desc: "Test of artboards 2.",
            layerTest: true
        },
        {
            test: "artboards-3",
            desc: "Test of artboards 3.",
            layerTest: true
        },
        {
            test: "group-path",
            desc: "Test of artboards 3.",
            layerTest: true
        },
        {
            test: "stroke-alignment",
            desc: "Circle with different stroke alignment.",
            layerTest: true
        },
        {
            test: "unknown-layer",
            desc: "Don't add unknown layers."
        }
    ];

    module.exports = database;
}());
