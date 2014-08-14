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

/* Track context while writing SVG */

(function () {
"use strict";
    
    var omguid = require("./svgWriterUtils.js").omguid;
    
    function SVGWriterContext(svgOM) {
        this.svgOM = svgOM;
        this.currentOMNode = svgOM;
        this.indent = '  ';
        this.currentIndent = '';
        this.terminator = '\n';
        this.pxToInchRatio = svgOM.pxToInchRatio;
        this.globalLight = svgOM.globalLight;
        this.encoding =  'utf-8';
        this.out = [];
        this.sOut = "";
        
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


