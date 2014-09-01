// Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
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

/* Help construct the svgOM */

(function () {
"use strict";
    
    var omgStyles = require("./svgOMGeneratorStyles.js"),
        round1k = function (x) {
            return Math.round( x * 1000 ) / 1000;
        };

	function SVGOMGeneratorText() {
        
        this.textComponentOrigin = function (layer, fn) {
            if (layer.text &&
                layer.text.textStyleRange && layer.text.textStyleRange[0] &&
                layer.text.paragraphStyleRange && layer.text.paragraphStyleRange[0] &&
                layer.text.textShape && layer.text.textShape[0].char) {
                return fn(layer.text);
            }
            return false;
        };

        this.addTextOnPath = function (svgNode, layer, writer) {
            var self = this;
            return this.textComponentOrigin(layer, function (text) {
                if (layer.text.textShape[0].char !== "onACurve" ||
                    !layer.text.textShape[0].path) {
                    return false;
                }

                var svgTextPathNode;

                var computeTextPath = function (points) {
                    if (!points) {
                        return "";
                    }
                    var i = 0,
                        pathData = "";

                    for (; i < points.length; ++i) {
                        if (!i) {
                            pathData += "M " + round1k(points[i].anchor.horizontal) + " " + round1k(points[i].anchor.vertical);
                            continue;
                        }
                        var lastPoint = points[i-1].forward ? points[i-1].forward : points[i-1].anchor;
                        pathData += " C " + round1k(lastPoint.horizontal) + " " + round1k(lastPoint.vertical) + " ";
                        var controlPoint = points[i].backward ? points[i].backward : points[i].anchor;
                        pathData += round1k(controlPoint.horizontal) + " " + round1k(controlPoint.vertical) + " ";
                        pathData += round1k(points[i].anchor.horizontal) + " " + round1k(points[i].anchor.vertical);
                    }
                    return pathData;
                };

                svgNode.type = "text";
                svgNode.shapeBounds = layer.bounds;
                svgNode.position = {
                    x: 0,
                    y: 0
                };

                writer.pushCurrent(svgNode);
                svgTextPathNode = writer.addSVGNode(svgNode.id + "-path", "textPath", true);
                svgTextPathNode.pathData = computeTextPath(layer.text.textShape[0].path.pathComponents[0].subpathListKey[0].points);

                // FIXME: Text on path always has just one paragraph. Avoid creatnig an extra element for it.
                if (!self.addTextChunks(svgTextPathNode, layer, text, writer, svgNode.position, svgNode.shapeBounds)) {
                    return false;
                }

                omgStyles.addParagraphStyle(svgTextPathNode, text.paragraphStyleRange[0].paragraphStyle);

                writer.popCurrent();

                omgStyles.addTextStyle(svgNode, layer);

                omgStyles.addStylingData(svgNode, layer);
                return true;
            });
        };

        
        this.addSimpleText = function (svgNode, layer, writer) {
            var self = this;
            
            return this.textComponentOrigin(layer, function (text) {
                
                // FIXME: We need to differ between "paint", "path", "box" and "warp".
                // The latter two won't be supported sufficiently enough initially.
                svgNode.type = "text";

                // It seems that textClickPoint is a quite reliable global position for
                // the initial <text> element. Values in percentage.
                svgNode.shapeBounds = layer.bounds;

                svgNode.position = {
                    x: text.textClickPoint.horizontal.value,
                    y: text.textClickPoint.vertical.value
                };
                self.addTextTransform(svgNode, text, layer);
                
                return self.addTextChunks(svgNode, layer, text, writer, svgNode.position, svgNode.shapeBounds);
            });
        };
        
        this.addTextChunks = function (svgNode, layer, text, writer, position, bounds) {
            var textString = text.textKey,
                svgParagraphNode,
                svgTextChunkNode;
            
            writer.pushCurrent(svgNode);
            
            // A paragraph is a newline added by the user. Each paragraph can
            // have a different text alignment.
            text.paragraphStyleRange.forEach(function (paragraph, iP) {
                var from,
                    to,
                    i,
                    indexTextStyleFrom,
                    indexTextStyleTo,
                    textSR = text.textStyleRange,
                    paragraphId = svgNode.id + "-" + iP,
                    spanId,
                    yPosGuess = (iP / text.paragraphStyleRange.length),
                    pctYPosGuess = Math.round(100.0 * yPosGuess),
                    svgParagraphNode,
                    currentFrom = paragraph.from,
                    xPosGuess;
                
                // Text can consist of multiple textStyles. A textStyle
                // may span over multiple paragraphs and describes the text color
                // and font styling of each text span.
                textSR.forEach(function (textStyle, index) {
                    if (textStyle.from <= paragraph.from &&
                        (!isFinite(indexTextStyleFrom) || textSR[indexTextStyleFrom].from < textStyle.from)) {
                        indexTextStyleFrom = index;
                    }
                    if (textStyle.to >= paragraph.to &&
                        (!isFinite(indexTextStyleTo) || textSR[indexTextStyleTo].to > textStyle.to)) {
                        indexTextStyleTo = index;
                    }
                });
                
                if(!isFinite(indexTextStyleFrom) || !isFinite(indexTextStyleTo)) {
                    console.log('ERROR: Text style range no found for paragraph.');
                    return false;
                }
                
                if (indexTextStyleFrom !== indexTextStyleTo) {
                    
                    //then nest a paragraphNode...
                    svgParagraphNode = writer.addSVGNode(svgNode.id + "-" + i, "tspan", true);
                    svgParagraphNode.position = {
                        x: position.x,
                        //y: position.y + pctYPosGuess
                        y: position.y
                    };
                    writer.pushCurrent(svgParagraphNode);
                    pctYPosGuess = 0;
                }
                
                //process each text style, start at paragraph.from and end at paragraph.to
                //fill in any necessary text style in-between
                for (i = indexTextStyleFrom; i <= indexTextStyleTo; i++) {
                    from = (i === indexTextStyleFrom) ? paragraph.from : textSR[i].from;
                    to = (i === indexTextStyleTo) ? paragraph.to : textSR[i].to;
                    
                    spanId = (indexTextStyleTo === indexTextStyleFrom) ? paragraphId : paragraphId + "-" + (i - indexTextStyleFrom);
                    svgTextChunkNode = writer.addSVGNode(spanId, "tspan", true);
                    svgTextChunkNode.text = textString.substring(from, to).replace("\r","");
                    
                    //TBD: guess X based on the position assuming characters are same width (bad assumption, but it is what we have to work with)
                    xPosGuess = currentFrom / (paragraph.to - paragraph.from);
                    
                    if (indexTextStyleFrom === indexTextStyleTo) {
                        svgTextChunkNode.position = {
                            x: 0,
                            y: position.y
                        };
                        omgStyles.addParagraphStyle(svgTextChunkNode, paragraph.paragraphStyle);
                    }
                    
                    omgStyles.addTextChunkStyle(svgTextChunkNode, textSR[i]);
                }
                
                if (indexTextStyleFrom !== indexTextStyleTo) {
                    omgStyles.addParagraphStyle(svgParagraphNode, paragraph.paragraphStyle);
                    writer.popCurrent();
                }
            });
            writer.popCurrent();
            
            omgStyles.addTextStyle(svgNode, layer);
            omgStyles.addStylingData(svgNode, layer);
            return true;
        };

        this.addTextTransform = function (svgNode, text, layer) {
            if (!text.transform) {
                return;
            }
            var t = new Transform(),
                // The trnasformation matrix is relative to this boundaries.
                boundsOrig = layer.bounds,
                // This covers the actual bounds of the text in pt units and needs
                // to be transformed to pixel.
                // FIXME: Transform from pt to px first.
                boundsTransform = {
                    "left": text.bounds.left.value,
                    "right": text.bounds.right.value,
                    "top": text.bounds.top.value,
                    "bottom": text.bounds.bottom.value
                },
                obx, oby, tbx, tby;
            obx = (boundsOrig.right - boundsOrig.left) / 2;
            oby = (boundsOrig.bottom - boundsOrig.top) / 2;
            tbx = (boundsTransform.right - boundsTransform.left) / 2;
            tby = -(boundsTransform.top - boundsTransform.bottom) / 2;

            t.translate(boundsOrig.left, boundsOrig.top);
            t.translate(obx, oby);
            t.multiply(text.transform.xx, text.transform.xy, text.transform.yx, text.transform.yy,
                text.transform.tx, text.transform.ty);
            t.translate(-obx, -oby);
            // FIXME: Use the biggest font-size for the first line. Transform pt to px.
            t.translate(obx - tbx, oby - tby + text.textStyleRange[0].textStyle.size.value);

            svgNode.position = {
                x: 0,
                y: 0
            };
            svgNode.transform = t;
        };

        var Transform = function () {
            this.a = 1,
            this.b = 0,
            this.c = 0,
            this.d = 1,
            this.e = 0,
            this.f = 0;

            this.translate = function (tx, ty) {
                this.e += tx * this.a + ty * this.c;
                this.f += tx * this.b + ty * this.d;
            };

            this.multiply = function (a, b, c, d, e, f) {
                var t_a = this.a;
                var t_b = this.b;
                var t_c = this.c;
                var t_d = this.d;
                var t_e = this.e;
                var t_f = this.f;
                this.a = a * t_a + b * t_c;
                this.b = a * t_b + b * t_d;
                this.c = c * t_a + d * t_c;
                this.d = c * t_b + d * t_d;
                this.e = e * t_a + f * t_c + t_e;
                this.f = e * t_b + f * t_d + t_f;
            };
        };

        this.addTextData = function(svgNode, layer, writer) {
            if (this.addTextOnPath(svgNode, layer, writer) ||
                this.addSimpleText(svgNode, layer, writer)) {
                return true;
            }
            console.log("Error: No text data added for " + JSON.stringify(layer));
            return false;
        };
	}

	module.exports = new SVGOMGeneratorText();
    
}());
     
    