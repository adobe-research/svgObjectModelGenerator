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

/* given an svgOM, generate SVG */

(function () {
    "use strict";

    var svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterPreprocessor = require("./svgWriterPreprocessor.js"),
        postProcess = require("./svgWriterPostprocessor.js").postProcess,
        Tag = require("./svgWriterTag.js"),
        SVGWriterContext = require("./svgWriterContext.js"),
        toString = svgWriterUtils.toString;

    function getFormatContext(svgOM, cfg, errors) {
        return new SVGWriterContext(svgOM, cfg, errors);
    }

    function print(svgOM, opt, errors) {
        var ctx = getFormatContext(svgOM, opt || {}, errors);
        try {
            Tag.resetRoot(svgOM);
            svgWriterPreprocessor.processSVGOM(ctx);
            var svg = Tag.make(ctx, svgOM),
                hasRules = !ctx.styling && ctx.omStylesheet.hasRules(),
                hasDefines = ctx.omStylesheet.hasDefines();
            if (hasRules || hasDefines) {
                svg.children.unshift(ctx.omStylesheet.getDefsTag());
            }
            postProcess(svg, ctx);
            svg.write(ctx);
        } catch (ex) {
            console.error("Ex: " + ex);
            console.log(ex.stack);
        }
        return toString(ctx);
    }

    module.exports.printSVG = print;
}());
