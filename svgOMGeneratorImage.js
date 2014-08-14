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

    var omgStyles = require("./svgOMGeneratorStyles.js");

	function SVGOMGeneratorImage() {

        this.pathComponentOrigin = function (layer, fn) {
            if (layer.rawPixel) {
                return fn(layer.rawPixel);
            }
            return false;
        };

        this.addImage = function (svgNode, layer) {
            return this.pathComponentOrigin(layer, function (pixel) {
                svgNode.pixel = pixel;
                svgNode.shapeBounds = layer.bounds;

                omgStyles.addStylingData(svgNode, layer);
                
                return true;
            });
        };

        this.addImageData = function(svgNode, layer) {
            if (this.addImage(svgNode, layer)) {
                return true;
            }
            console.log("ERROR: No image data added for " + JSON.stringify(layer));
            return false;
        };
	}

	module.exports = new SVGOMGeneratorImage();

}());
