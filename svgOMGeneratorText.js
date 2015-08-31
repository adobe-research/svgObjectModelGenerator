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

/* Help construct the AGC */

(function () {
    "use strict";

    var omgStyles = require("./svgOMGeneratorStyles.js"),
        omgUtils = require("./svgOMGeneratorUtils.js"),
        svgWriterUtils = require("./svgWriterUtils.js"),
        Matrix = require("./matrix.js"),
        round1k = svgWriterUtils.round1k,
        boundsToRect = omgUtils.boundsToRect,
        _boundInPx = omgUtils.boundInPx;

    function SVGOMGeneratorText() {

        var scanForUnsupportedTextFeatures = function (writer) {
            if (!writer._issuedTextWarning && writer.errors) {
                writer._issuedTextWarning = true;
                writer.errors.push("Fonts may render inconsistently and text wrapping is unsupported which can result in clipped text. Convert text to a shape to maintain fidelity.");
            }
        };

        this.textComponentOrigin = function (layer, fn) {
            if (layer.text &&
                layer.text.textStyleRange && layer.text.textStyleRange[0] &&
                layer.text.paragraphStyleRange && layer.text.paragraphStyleRange[0] &&
                layer.text.textShape && layer.text.textShape[0].char) {
                return fn(layer.text);
            }
            return false;
        };

        this._computeTextPath = function (listKey, isBoxMode, boxOrientation) {

            var points,
                closedSubpath = !!listKey.closedSubpath,
                i = 0,
                pathData = "",
                controlPoint,
                lastPoint;


            // TODO: Generator 1.2.0 added units to path data. Figure out why.
            if (isBoxMode) {
                if (boxOrientation === "horizontal") {
                    points = [listKey.points[3], listKey.points[1]];
                } else {
                    points = [listKey.points[2], listKey.points[0]];
                }
                pathData = "M " + round1k(points[0].anchor.horizontal.value) + " " + round1k(points[0].anchor.vertical.value);
                pathData += "L " + round1k(points[1].anchor.horizontal.value) + " " + round1k(points[1].anchor.vertical.value);
            } else {
                points = listKey.points;

                for (; points && i < points.length; ++i) {
                    if (!i) {
                        pathData = "M " + round1k(points[i].anchor.horizontal.value) + " " + round1k(points[i].anchor.vertical.value);
                    } else {
                        lastPoint = points[i - 1].forward ? points[i - 1].forward : points[i - 1].anchor;
                        pathData += " C " + round1k(lastPoint.horizontal.value) + " " + round1k(lastPoint.vertical.value) + " ";
                        controlPoint = points[i].backward ? points[i].backward : points[i].anchor;
                        pathData += round1k(controlPoint.horizontal.value) + " " + round1k(controlPoint.vertical.value) + " ";
                        pathData += round1k(points[i].anchor.horizontal.value) + " " + round1k(points[i].anchor.vertical.value);
                    }
                }
                if (closedSubpath) {
                    pathData += " Z";
                }
            }

            return pathData;
        };

        this.addTextOnPath = function (agcNode, layer, writer) {
            var self = this;
            return this.textComponentOrigin(layer, function (text) {
                if (layer.text.textShape[0].char !== "onACurve" &&
                     layer.text.textShape[0].char !== "box" ||
                    !layer.text.textShape[0].path) {
                    return false;
                }

                var agcTextPathNode,
                    isBoxMode = layer.text.textShape[0].char === "box",
                    boxOrientation = layer.text.textShape[0].orientation,
                    dpi = writer._dpi(),
                    maxTextSize = _boundInPx(text.textStyleRange[0].textStyle.size, dpi);
                try {

                    agcNode.type = "text";

                    var textBounds = {
                        top: _boundInPx(text.boundingBox.top, dpi),
                        bottom: _boundInPx(text.boundingBox.bottom, dpi),
                        left: _boundInPx(text.boundingBox.left, dpi),
                        right: _boundInPx(text.boundingBox.right, dpi)
                    };
                    agcNode.visualBounds = boundsToRect(layer.boundsWithFX || textBounds || layer.bounds);
                    agcNode.position = {
                        x: 0,
                        y: 0
                    };
                    writer.pushCurrent(agcNode);
                    agcTextPathNode = writer.addAGCNode("textPath", true);
                    agcTextPathNode.pathData = self._computeTextPath(layer.text.textShape[0].path.pathComponents[0].subpathListKey[0], isBoxMode, boxOrientation, textBounds, maxTextSize);

                    self.addTextTransform(writer, agcNode, text, layer);

                    if (!self.addTextChunks(agcTextPathNode, layer, text, writer, agcNode.position, layer.bounds)) {
                        return false;
                    }

                    omgStyles.addParagraphStyle(agcTextPathNode, text.paragraphStyleRange[0].paragraphStyle);

                    writer.popCurrent();

                    omgStyles.addTextStyle(agcNode, layer);

                    omgStyles.addStylingData(agcNode, layer, layer.bounds, writer);

                } catch (exter) {
                    console.warn(exter.stack);
                    return false;
                }
                return true;
            });
        };

        this.addSimpleText = function (agcNode, layer, writer) {
            var self = this;

            return this.textComponentOrigin(layer, function (text) {
                // FIXME: We need to differ between "paint", "path", "box" and "warp".
                // The latter two won’t be supported sufficiently enough initially.
                agcNode.type = "text";
                agcNode.name = layer.name;

                agcNode.visualBounds = boundsToRect(layer.boundsWithFX || layer.bounds);

                // It seems that textClickPoint is a quite reliable global position for
                // the initial <text> element.
                // Values in percentage, moving to pixels so it is easier to work with te position
                agcNode.position = {
                    x: omgUtils.pct2px(text.textClickPoint.horizontal.value, writer.docBounds().right - writer.docBounds().left),
                    y: omgUtils.pct2px(text.textClickPoint.vertical.value, writer.docBounds().bottom - writer.docBounds().top),
                    unitX: "px",
                    unitY: "px"
                };

                self.addTextTransform(writer, agcNode, text, layer);

                return self.addTextChunks(agcNode, layer, text, writer, agcNode.position, layer.bounds);
            });
        };

        this.addTextChunks = function (agcNode, layer, text, writer, position, bounds) {
            var textString = text.textKey,
                agcTextChunkNode,
                yEMs = 0,
                dpi = writer._dpi();

            writer.pushCurrent(agcNode);

            // A paragraph is a newline added by the user. Each paragraph can
            // have a different text alignment.
            text.paragraphStyleRange.forEach(function (paragraph) {
                var from,
                    to,
                    i,
                    indexTextStyleFrom,
                    indexTextStyleTo,
                    textSR = text.textStyleRange,
                    agcParagraphNode,
                    textContent;

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

                if (!isFinite(indexTextStyleFrom) || !isFinite(indexTextStyleTo)) {
                    console.log("ERROR: Text style range no found for paragraph.");
                    return false;
                }

                if (indexTextStyleFrom !== indexTextStyleTo) {

                    //then nest a paragraphNode...
                    agcParagraphNode = writer.addAGCNode("tspan", true);
                    agcParagraphNode.position = {
                        x: position.x,
                        y: position.y,
                        unitX: position.unitX,
                        unitY: position.unitY
                    };
                    writer.pushCurrent(agcParagraphNode);
                }

                //process each text style, start at paragraph.from and end at paragraph.to
                //fill in any necessary text style in-between
                for (i = indexTextStyleFrom; i <= indexTextStyleTo; i++) {
                    from = i === indexTextStyleFrom ? paragraph.from : textSR[i].from;
                    to = i === indexTextStyleTo ? paragraph.to : textSR[i].to;

                    textContent = textString.substring(from, to).replace("\r", "");
                    if (!textContent) {
                        //represents a blank line, needs to translate to y-positioning
                        yEMs++;
                        continue;
                    }
                    agcTextChunkNode = writer.addAGCNode("tspan", true);
                    agcTextChunkNode.text = textContent;

                    agcTextChunkNode.visualBounds = boundsToRect(bounds);

                    //TBD: guess X based on the position assuming characters are same width (bad assumption, but it is what we have to work with)

                    if (indexTextStyleFrom === indexTextStyleTo) {
                        agcTextChunkNode.position = {
                            x: _boundInPx(position.x, dpi),
                            y: yEMs,
                            unitX: "px",
                            unitY: "em"
                        };
                        omgStyles.addParagraphStyle(agcTextChunkNode, paragraph.paragraphStyle);
                    }
                    yEMs = 1;
                    omgStyles.addTextChunkStyle(agcTextChunkNode, textSR[i], dpi);
                }

                if (indexTextStyleFrom !== indexTextStyleTo) {
                    omgStyles.addParagraphStyle(agcParagraphNode, paragraph.paragraphStyle);
                    writer.popCurrent();
                }
            });

            omgStyles.addTextStyle(agcNode, layer);
            omgStyles.addStylingData(agcNode, layer, layer.bounds, writer);

            writer.popCurrent();
            return true;
        };

        this.addTextTransform = function (writer, agcNode, text) {
            if (!text.transform && (!text.textShape || text.textShape.length === 0 || !text.textShape[0].transform)) {
                return;
            }
            var transform = text.transform || text.textShape[0].transform,
                dpi = writer._dpi(),
                inMatrix,
                matrix4x4;

            agcNode.maxTextSize = _boundInPx(text.textStyleRange[0].textStyle.size, dpi);

            if (transform) {
                inMatrix = {a: transform.xx, b: transform.xy, c: transform.yx, d: transform.yy, tx: transform.tx, ty: transform.ty};
                matrix4x4 = Matrix.createMatrix(inMatrix);

                if (!Matrix.containsOnlyTranslate(matrix4x4)) {
                    agcNode.transform = inMatrix;
                    agcNode.transformTX = agcNode.position.x;
                    agcNode.transformTY = agcNode.position.y;

                    agcNode.position = {
                        x: 0,
                        y: 0,
                        unitY: "px",
                        unitX: "px"
                    };
                }
            }
        };

        this.addTextData = function (agcNode, layer, writer) {
            if (this.addTextOnPath(agcNode, layer, writer) ||
                this.addSimpleText(agcNode, layer, writer)) {
                scanForUnsupportedTextFeatures(writer);
                return true;
            }
            console.log("Error: No text data added for " + JSON.stringify(layer));
            return false;
        };
    }

    module.exports = new SVGOMGeneratorText();

}());

