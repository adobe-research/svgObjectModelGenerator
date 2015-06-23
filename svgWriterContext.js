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

    function SVGWriterContext(svgOM, config, errors) {
        this.minify = false;

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
        }
        if (!isFinite(this.precision)) {
            this.precision = 3;
        }

        this.indent = this.minify ? "" : "  ";
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

        // svgStylesheed creates new svgWriterContexts without a global object.
        if (svgOM.global) {
            this.docBounds = svgOM.global.bounds;
            this.pxToInchRatio = svgOM.global.pxToInchRatio;
        }


        this.encoding = "utf-8";
        this.out = [];
        this.sOut = "";
        this.contentBounds = {};

        // Document sizing parameters.
        this._x = 0;
        this._y = 0;
        this._width = 0;
        this._height = 0;
        this._viewBox = [];

        //an array for reporting errors
        this.errors = errors || [];

        this.ID = new ID(this.idType);

        // FIXME: Do we even need unique IDs for node.ids that
        // are unique already?
        this._hasWritten = {};
        this.didWrite = function (node, prop) {
            this._hasWritten[this.ID.getUnique(node.id) + prop] = true;
        };
        this.hasWritten = function (node, prop) {
            return this._hasWritten[this.ID.getUnique(node.id) + prop];
        };
    }
    module.exports = SVGWriterContext;
}());
