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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, bitwise: true */
/*global define: true, require: true, module: true */

/* given an svgOM, generate SVG */

(function () {
    "use strict";

    var buffer = require("buffer"),
        util = require("./utils.js"),
        svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterPreprocessor = require("./svgWriterPreprocessor.js"),
        svgWriterIDs = require("./svgWriterIDs.js"),
        Tag = require("./svgWriterTag.js"),
        SVGWriterContext = require("./svgWriterContext.js");

    function getFormatContext(svgOM, cfg, errors) {
        return new SVGWriterContext(svgOM, cfg, errors);
    }

    var toString = svgWriterUtils.toString;

    function process(tag, ctx, parents) {
        // fill it with processing actions and remove this comment :)
    }

    function preProcess(tag, ctx, parents) {
        parents = parents || [];
        process(tag, ctx, parents);
        parents.push(tag);
        if (!tag.children) {
            return;
        }
        for (var i = 0, ii = tag.children.length; i < ii; i++) {
            preProcess(tag.children[i], ctx, parents);
        }
    }

    function processStyle(blocks) {
        var j = 1;
        for (var i in blocks) {
            if (blocks[i].tags) {
                blocks[i].class[0] = "cls-" + j++;
            }
        }
    }

    function print(svgOM, opt, errors) {
        var ctx = getFormatContext(svgOM, opt || {}, errors);
        svgWriterIDs.reset();
        try {
            svgWriterPreprocessor.processSVGOM(ctx);
            var svg = Tag.make(ctx, svgOM);
            ctx.omStylesheet.consolidateStyleBlocks();
            processStyle(ctx.omStylesheet.blocks);
            preProcess(svg, ctx);
            svg.write(ctx);
        } catch (ex) {
            console.error("Ex: " + ex);
            console.log(ex.stack);
        }
        return toString(ctx);
    }

    module.exports.printSVG = print;
}());
