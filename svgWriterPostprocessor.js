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

    var Tag = require("./svgWriterTag.js"),
        ID = require("./idGenerator.js"),

        processFunctions = [
            function superfluousGroups(tag, ctx, parents, num) {
                var mum = parents[parents.length - 1];
                if (tag.name == "g" && tag.children.length < 2 &&
                    !tag.isArtboard &&
                    (!tag.styleBlock || tag.styleBlock && !tag.styleBlock.hasRules()) &&
                    tag.getAttribute("transform") == "") {
                    if (Object.keys(tag.attrs).length) {
                        return;
                    }
                    if (tag.children.length) {
                        mum.children[num] = tag.children[0];
                    } else {
                        mum.children.splice(num, 1);
                    }
                    return true;
                }
            },
            function clipRule(tag, ctx, parents) {
                var fillRule = tag.styleBlock && tag.styleBlock.getPropertyValue("fill-rule");
                if (!fillRule) {
                    return;
                }
                var isClipPathParent;
                for (var i = 0, len = parents.length; i < len; i++) {
                    if (parents[i].name == "clipPath") {
                        isClipPathParent = true;
                        break;
                    }
                }
                if (!isClipPathParent) {
                    return;
                }
                tag.styleBlock.addRule("clip-rule", fillRule);
                tag.styleBlock.removeRule("fill-rule");
            },
            function filter4mask(tag, ctx) {
                if (tag.name == "mask" && tag.filter) {
                    // This is to fix Safari bug with filters
                    if (tag.clip) {
                        tag.children.unshift(new Tag("rect", {
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                        }));
                    }
                    if (tag.children.length == 1) {
                        tag.children[0].styleBlock.addRule("filter", "url(#" + tag.filter + ")");
                    } else {
                        var g = new Tag("g");
                        g.setStyleBlock(ctx, {});
                        g.styleBlock.addRule("filter", "url(#" + tag.filter + ")");
                        g.children = tag.children;
                        tag.children = [g];
                    }
                }
            }
        ];

    function process(tag, ctx, parents, num) {
        processFunctions.forEach(function (item) {
            item(tag, ctx, parents, num);
        });
    }

    function processStyle(ctx, blocks) {
        var id = new ID(ctx.idType);
        for (var i in blocks) {
            if (blocks[i].tags && blocks[i].rules.length && !ctx.svgOM.global.styles[blocks[i].class[0]]) {
                blocks[i].class[0] = id.getUnique("cls");
            }
        }
    }

    function postProcess(tag, ctx, parents, num) {
        var root = !parents;
        parents = parents || [];
        parents.push(tag);
        if (tag.children) {
            for (var i = 0; i < tag.children.length; i++) {
                postProcess(tag.children[i], ctx, parents.slice(0), i);
            }
        }
        parents.pop();
        process(tag, ctx, parents.slice(0), num);
        if (root) {
            ctx.omStylesheet.consolidateStyleBlocks();
            processStyle(ctx, ctx.omStylesheet.blocks);
        }
    }

    module.exports.postProcess = postProcess;
}());
