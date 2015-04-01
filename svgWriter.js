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

/* given an svgOM, generate SVG */

(function () {
    "use strict";

    var svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterPreprocessor = require("./svgWriterPreprocessor.js"),
        Tag = require("./svgWriterTag.js"),
        SVGWriterContext = require("./svgWriterContext.js"),
        ID = require("./idGenerator.js");

    var toString = svgWriterUtils.toString;

    function getFormatContext(svgOM, cfg, errors) {
        return new SVGWriterContext(svgOM, cfg, errors);
    }

    function superfluousGroups(tag, ctx, parents, num) {
        var mum = parents.pop();
        if (tag.name == "g" && tag.children.length < 2 &&
            !tag.isArtboard &&
            (!tag.styleBlock || tag.styleBlock && !tag.styleBlock.hasRules()) &&
            tag.getAttribute("transform") == "") {
            for (var attr in tag.attrs) {
                return;
            }
            if (tag.children.length) {
                mum.children[num] = tag.children[0];
            } else {
                mum.children.splice(num, 1);
            }
            return true;
        }
    }

    function process(tag, ctx, parents, num) {
        superfluousGroups(tag, ctx, parents, num);
    }

    function preProcess(tag, ctx, parents, num) {
        parents = parents || [];
        parents.push(tag);
        if (!tag.children) {
            return;
        }
        for (var i = 0; i < tag.children.length; i++) {
            preProcess(tag.children[i], ctx, parents.slice(0), i);
        }
        parents.pop();
        process(tag, ctx, parents.slice(0), num);
    }

    function processStyle(ctx, blocks) {
        var id = new ID(ctx.idType);
        for (var i in blocks) {
            if (blocks[i].tags) {
                blocks[i].class[0] = id.getUnique("cls");
            }
        }
    }

    function print(svgOM, opt, errors) {
        var ctx = getFormatContext(svgOM, opt || {}, errors);
        try {
            Tag.resetRoot();
            svgWriterPreprocessor.processSVGOM(ctx);
            var svg = Tag.make(ctx, svgOM);
            ctx.omStylesheet.consolidateStyleBlocks();
            processStyle(ctx, ctx.omStylesheet.blocks);
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
