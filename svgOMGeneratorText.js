/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, bitwise: true */
/*global define: true, require: true */

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
                }

                svgNode.type = "text";
                svgNode.shapeBounds = layer.bounds;
                svgNode.position = {
                    x: 0,
                    y: 0
                }

                writer.pushCurrent(svgNode);
                svgTextPathNode = writer.addSVGNode(svgNode.id + "-path", "textPath", true);
                svgTextPathNode.pathData = computeTextPath(layer.text.textShape[0].path.pathComponents[0].subpathListKey[0].points)

                // FIXME: Text on path always has just one paragraph. Avoid creatnig an extra element for it.
                if (!self.addTextChunks(svgTextPathNode, layer, text, writer, svgNode.position)) {
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
                }
                self.addTextTransform(svgNode, text, layer);
                
                return self.addTextChunks(svgNode, layer, text, writer, svgNode.position);
            });
        };
        
        this.addTextChunks = function (svgNode, layer, text, writer, position) {
            var textString = text.textKey,
                paragraph,
                textStyle,
                from,
                to,
                indexTextStyle = 0,
                svgParagraphNode,
                svgTextChunkNode;

            writer.pushCurrent(svgNode);

            // A paragraph is a newline added by the user. Each paragraph can
            // have a different text alignment.
            for (var i = 0; i < text.paragraphStyleRange.length; ++i) {
                paragraph = text.paragraphStyleRange[i];
                if (!text.textStyleRange[indexTextStyle])
                    break;
                if (text.textStyleRange[indexTextStyle].from >= paragraph.to) {
                    console.log('ERROR: Text exceeded expected range for paragraph.')
                    return false;
                }

                svgParagraphNode = writer.addSVGNode(svgNode.id + "-" + i, "tspan", true);
                svgParagraphNode.position = {
                    x: position.x,
                    y: position.y
                }
                writer.pushCurrent(svgParagraphNode);

                // Text can consist of multiple textStyles. A textStyle
                // may span over multiple paragraphs and describes the text color
                // and font styling of each text span.
                while (indexTextStyle < text.textStyleRange.length) {
                    // Process current text span represented by a textStyle.
                    textStyle = text.textStyleRange[indexTextStyle];
                    from = Math.max(textStyle.from, paragraph.from); // Should always be textStyle.
                    to = Math.min(textStyle.to, paragraph.to);

                    svgTextChunkNode = writer.addSVGNode(svgParagraphNode.id + "-" + indexTextStyle, "tspan", true);
                    svgTextChunkNode.text = textString.substring(from, to).replace("\r","");
                    omgStyles.addTextChunkStyle(svgTextChunkNode, textStyle);
                    if (textStyle.to >= paragraph.to) {
                        break;
                    }
                    ++indexTextStyle;
                };
                omgStyles.addParagraphStyle(svgParagraphNode, paragraph.paragraphStyle);
                writer.popCurrent();
            }
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
            }
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
            }

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
            }
        }

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
     
    