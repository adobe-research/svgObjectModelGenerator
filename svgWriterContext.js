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

/* Track context while writing SVG */

(function () {
    "use strict";

    var ID = require("./idGenerator.js");

    function round(value) {
        if (!isFinite(value)) {
            return value;
        }
        var ten = Math.pow(10, this.precision);
        return Math.round(value * ten) / ten;
    }
    function eq(v1, v2) {
        return this.round(v1) == this.round(v2);
    }
    function SVGWriterContext(svgOM, stream, config, errors) {
        this.minify = false;
        this.round = round;
        this.eq = eq;

        // FIXME: In the future, determine that svgOM is a root element.
        this.config = config;
        this.svgOM = svgOM;
        this.currentOMNode = svgOM;
        if (this.config) {
            this.minify = !!this.config.minify;
            var stylingMap = {
                "class": 0,
                "style": 1,
                "attribute": 2
            };
            this.styling = stylingMap[config.styling];
            this.precision = Math.round(this.config.precision);
            if (this.config.callback) {
                this.tagCounter = 0;
                this.nodeCounter = 0;
                var tagMade = 0,
                    tagWritten = 0,
                    tagProcessed = 0,
                    percent = 0,
                    percentSent = 0,
                    per = [0, 0, 0, 0];
                this.tick = function tick(type) {
                    switch (type) {
                        case "pre":
                            per[0] = 7;
                            break;
                        case "tag":
                            tagMade++;
                            per[1] = Math.min(tagMade * 31 / this.nodeCounter, 31);
                            break;
                        case "post":
                            tagProcessed++;
                            per[2] = Math.min(tagProcessed * 31 / this.tagCounter, 31);
                            break;
                        case "write":
                            tagWritten++;
                            per[3] = Math.min(tagWritten * 31 / this.tagCounter, 31);
                            break;
                        case "end":
                            this.config.callback(100);
                            return;
                        case "start":
                            this.config.callback(0);
                            return;
                    }
                    percent = Math.round(per[0] + per[1] + per[2] + per[3]);
                    if (percent > percentSent) {
                        if (this.config.callback(percentSent = percent)) {
                            throw "Operation was canceled by user";
                        }
                    }
                }
            }
        }
        if (!isFinite(this.precision)) {
            this.precision = 3;
        }

        this.prefix = this.config && this.config.prefix || "";
        this.indent = this.minify ? "" : this.config && typeof this.config.indentation == "string" ? this.config.indentation : "  ";
        this.space = this.minify ? "" : " ";
        this.currentIndent = "";
        this.terminator = this.minify ? "" : this.config && this.config.carriageReturn ? "\r\n" : "\n";
        this.idType = this.minify ? "minimal" : "regular";

        if (this.config && this.config.idType) {
            switch (this.config.idType) {
            case "regular":
            case "minimal":
            case "unique":
                this.idType = this.config.idType;
            }
        }

        this.docBounds = {
            left: undefined,
            top: undefined,
            right: undefined,
            bottom: undefined
        };

        // FIXME: Change svgWriter internal code to x, y, width, height pattern.
        if (svgOM.viewSource) {
            this.docBounds.left = svgOM.viewSource.x;
            this.docBounds.top = svgOM.viewSource.y;
            this.docBounds.right = svgOM.viewSource.x + svgOM.viewSource.width;
            this.docBounds.bottom = svgOM.viewSource.y + svgOM.viewSource.height;
        }

        // svgStylesheed creates new svgWriterContexts without a global object.
        this.pxToInchRatio = svgOM.rasterResolution;

        this.encoding = "utf-8";
        this.out = [];
        this.sOut = "";
        this.contentBounds = {};

        this.stream = stream;

        // Document sizing parameters.
        this._x = 0;
        this._y = 0;
        this._width = 0;
        this._height = 0;
        this._viewBox = [];

        //an array for reporting errors
        this.errors = errors || [];

        this.ID = new ID(this.idType);
    }
    module.exports = SVGWriterContext;
}());
