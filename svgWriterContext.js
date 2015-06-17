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
/*global define: true, require: true */

/* Track context while writing SVG */

(function () {
"use strict";
    
    var omguid = require("./svgWriterUtils.js").omguid;
    
    // FIXME: svgWriterFx calls this code but svgOMG
    // is mostly empty. After filter refactoring,
    // globalLight should not be required anymore.
    function SVGWriterContext(svgOM, config, errors) {
        // FIXME: In the future, determine that svgOM is a root element.
        this.config = config;
        this.svgOM = svgOM;
        this.currentOMNode = svgOM;
        this.indent = '  ';
        this.currentIndent = '';
        this.terminator = '\n';
        if (svgOM.global) {
            this.docBounds = svgOM.global.bounds;
            this.viewBox = svgOM.global.viewBox;
            this.pxToInchRatio = svgOM.global.pxToInchRatio;
        }
        if (svgOM.meta) {
            this.globalLight = svgOM.meta.PS.globalLight;
        }
        this.encoding =  'utf-8';
        this.out = [];
        this.sOut = "";
        this.contentBounds = {};
        
        //an array for reporting errors
        this.errors = errors;
        
        this._hasWritten = {};
        this.didWrite = function (node, prop) {
            this._hasWritten[omguid(node) + prop] = true;
        };
        this.hasWritten = function (node, prop) {
            return this._hasWritten[omguid(node) + prop];
        };
	}
	module.exports = SVGWriterContext;
}());
