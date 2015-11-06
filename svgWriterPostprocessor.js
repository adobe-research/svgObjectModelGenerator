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
        tagCounter,
        insertArrayAt = function (array, index, arrayToInsert) {
            Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
        },
        removeChains = function (ctx, children) {
            var pass,
                name,
                i;
            for (i = 0; i < children.length - 1; i++) {
                pass = false;
                while (children[i + 1] && children[i].styleBlock && children[i + 1].styleBlock &&
                       children[i].styleBlock.isEqual(children[i + 1].styleBlock)) {
                    for (name in children[i].attrs) {
                        if (children[i].writeAttribute(name)) {
                            pass = true;
                            break;
                        }
                    }
                    if (pass) {
                        break;
                    }
                    for (name in children[i + 1].attrs) {
                        if (children[i + 1].writeAttribute(name)) {
                            pass = true;
                            break;
                        }
                    }
                    if (pass) {
                        break;
                    }
                    children[i].children = children[i].children.concat(children[i + 1].children);
                    removeChains(ctx, children[i].children);
                    children.splice(i + 1, 1);
                    tagCounter--;
                }
            }
        },
        hasRelevantGroupStyle = function (ctx, tag) {
            var style = tag.styleBlock;
            if (!style) {
                return false;
            }
            return style.hasProperty("mix-blend-mode") && style.getPropertyValue("mix-blend-mode") != "normal" ||
                style.hasProperty("isolation") ||
                style.hasProperty("clip-path") && style.getPropertyValue("clip-path") != "none" ||
                style.hasProperty("filter") && style.getPropertyValue("filter") != "none" ||
                style.hasProperty("mask") && style.getPropertyValue("mask") != "none" ||
                style.hasProperty("opacity") && !ctx.eq(style.getPropertyValue("opacity"), 1);
        },
        processFunctions = [
            function superfluousGroups(tag, ctx, parents, num) {
                var mom = parents[parents.length - 1],
                    isResourceGroup,
                    isSVGRootGroup = false;

                // Nothing to process if there is no parent or the current
                // element is no group. Exlcude artboards from processing.
                if (!mom || tag.name != "g" || tag.isArtboard) {
                    return;
                }

                // Remove all empty groups without further checking.
                if (!tag.children.length) {
                    mom.children.splice(num, 1);
                    return;
                }

                // Resources may add a superflous group as first and only direct child.
                // Those need to be removed if and only if they have no information at all.
                isResourceGroup = mom.children.length == 1 &&
                        (mom.name == "pattern" || mom.name == "symbol" || mom.name == "mask");

                // Root SVG elements may be in a single layer but group the whole content.
                // Remove those groups if the only information is the layer name and put the
                // name on the SVG root element itself.
                if (mom.name == "svg") {
                    // SVG root elements may also have the elements:
                    // <defs>, <title>, <desc> or comments. Skip those.
                    for (var i = 0; i < mom.children.length; i++) {
                        // Skip current element.
                        if (i == num) {
                            continue;
                        }
                        if (mom.children[i].name &&
                            mom.children[i].name != "defs" &&
                            mom.children[i].name != "title" &&
                            mom.children[i].name != "desc") {
                            break;
                        }
                    }
                    isSVGRootGroup = true;
                }

                // If the group has styles, transforms or clip-paths keep them.
                if (hasRelevantGroupStyle(ctx, tag) ||
                    tag.getAttribute("transform") != "" ||
                    tag.getAttribute("clip-path") != "" || // Clip areas caused by artboards set the attribute directly.
                    tag.getAttribute("id") != "" && !isSVGRootGroup) {
                    return;
                }

                // Groups may have more than one child. Just remove those groups when we know
                // for sure that they are superfluous:
                // 1) group is the only direct child of resources,
                // 2) group is the only direct child of SVG roots,
                // 3) or when we minify.
                if (tag.children.length > 1 && !ctx.minify && !isResourceGroup && !isSVGRootGroup) {
                    return;
                }

                // Preserve single layer information on SVG root element.
                if (isSVGRootGroup) {
                    mom.setAttribute("id", tag.getAttribute("id"));
                    mom.setAttribute("data-name", tag.getAttribute("data-name"));
                }

                // Replace the current group with its children.
                mom.children.splice(num, 1);
                insertArrayAt(mom.children, num, tag.children);

                tagCounter--;
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
                    tag.setAttribute("style", "");
                    // If the child has a transform, the filter coordinate space is not equal to the
                    // global space and would produce wrong results.
                    if (tag.children.length == 1 && tag.children[0].getAttribute("transform") == "") {
                        if (!tag.children[0].styleBlock) {
                            tag.children[0].setStyleBlock(ctx, {});
                        }
                        tag.children[0].styleBlock.addRule("filter", "url(#" + ctx.prefix + tag.filter + ")");
                    } else {
                        var g = new Tag("g");
                        g.setStyleBlock(ctx, {});
                        g.styleBlock.addRule("filter", "url(#" + ctx.prefix + tag.filter + ")");
                        g.children = tag.children;
                        tag.children = [g];
                    }
                }
            },
            function collapseTspanClasses(tag, ctx) {
                if (tag.name != "tspan" && tag.name != "text") {
                    return;
                }
                var tagStyle = tag.styleBlock,
                    common = {},
                    name;
                for (var i = 0; i < tag.children.length; i++) {
                    var style = tag.children[i].styleBlock;
                    if (!style) {
                        return;
                    }
                    if (i) {
                        for (name in common) {
                            if (style.getPropertyValue(name) == null) {
                                delete common[name];
                            }
                        }
                    } else {
                        for (name in style.rules) {
                            common[name] = style.rules[name];
                        }
                    }
                }
                var toCollapse = [];
                for (i = 0; i < tag.children.length; i++) {
                    var child = tag.children[i];
                    style = child.styleBlock;
                    if (style) {
                        for (name in style.rules) {
                            if (common[name] == style.rules[name]) {
                                delete style.rules[name];
                            }
                        }
                        var toBe = child.styleBlock.hasRules();
                        if (!toBe) {
                            for (name in child.attrs) {
                                if (child.writeAttribute(name)) {
                                    toBe = true;
                                    break;
                                }
                            }
                        }
                        if (!toBe) {
                            toCollapse.push(child);
                        }
                    }
                }
                tagCounter -= toCollapse.length;
                for (i = 0; i < toCollapse.length; i++) {
                    tag.collapseChild(toCollapse[i]);
                }
                removeChains(ctx, tag.children);
                for (name in common) {
                    tagStyle.addRule(name, common[name]);
                }
            },
            function useTrick(tag, ctx, parents) {
                if (!tag.trick) {
                    return;
                }
                var mom = parents[parents.length - 1],
                    stroke = tag.getAttribute("stroke"),
                    fill = tag.getAttribute("fill"),
                    filter = tag.getAttribute("filter"),
                    transform = tag.getAttribute("transform"),
                    id = tag.getAttribute("id") || ctx.ID.getUnique(tag.name),
                    list = new Tag(),
                    g = new Tag("g", {transform: transform}),
                    use = new Tag("use", {"xlink:href": "#" + id, transform: transform});
                ctx.xlinkRequired = true;
                tag.setAttribute("id", id);
                list.appendChild(g, use);
                g.appendChild(tag);
                tag.setAttribute("transform", null);
                if (ctx.styling) {
                    g.setAttributes({
                        fill: fill,
                        filter: filter
                    });
                    tag.setAttributes({
                        stroke: "inherit",
                        filter: "none",
                        fill: "inherit"
                    });
                    use.setAttributes({
                        stroke: stroke,
                        fill: "none",
                        filter: "none"
                    });
                } else {
                    g.setAttribute("style", "fill: " + fill + "; filter: " + filter);
                    tag.setAttribute("style", "stroke: inherit; filter: none; fill: inherit");
                    use.setAttribute("style", "stroke: " + stroke + "; filter: none; fill: none");
                }
                tag.tricked = true;
                for (var i = 0; i < mom.children.length; i++) {
                    if (mom.children[i] == tag) {
                        mom.children.splice(i, 1, list);
                    }
                }
            }
        ];

    function process(tag, ctx, parents, num) {
        ctx.tick && ctx.tick("post");
        processFunctions.forEach(function (item) {
            item(tag, ctx, parents, num);
        });
    }

    function processStyle(ctx, blocks) {
        var id = new ID(ctx.idType);
        for (var i in blocks) {
            if (blocks[i].tags && blocks[i].tags.length && blocks[i].hasRules() && (!ctx.svgOM.resources.styles || !ctx.svgOM.resources.styles[blocks[i].class[0]])) {
                blocks[i].class[0] = id.getUnique("cls");
            }
        }
    }

    function postProcess(tag, ctx, parents, num) {
        var root = !parents;
        if (root) {
            tagCounter = 0;
        }
        parents = parents || [];
        parents.push(tag);
        if (tag.children) {
            for (var i = tag.children.length - 1; i >= 0; i--) {
                postProcess(tag.children[i], ctx, parents.slice(0), i);
            }
        }
        parents.pop();
        process(tag, ctx, parents.slice(0), num);
        if (root) {
            ctx.omStylesheet.consolidateStyleBlocks();
            processStyle(ctx, ctx.omStylesheet.blocks);
            if (ctx.tick) {
                ctx.tagCounter += tagCounter;
            }
        }
    }

    module.exports.postProcess = postProcess;
}());
