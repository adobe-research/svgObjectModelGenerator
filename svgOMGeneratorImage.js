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
        boundsToRect = require("./svgOMGeneratorUtils.js").boundsToRect;

    function SVGOMGeneratorImage() {

        this.pathComponentOrigin = function (layer, fn) {
            if (layer.rawPixel) {
                return fn(layer.rawPixel);
            }
            return false;
        };

        this.addImage = function (agcNode, layer, writer) {
            return this.pathComponentOrigin(layer, function (pixel) {
                var bounds = layer.bounds;

                if (layer.boundsWithFX) {
                    bounds = layer.boundsWithFX;
                }
                agcNode.image = {
                    href: pixel,
                    x: bounds.left,
                    y: bounds.top,
                    width: bounds.right - bounds.left,
                    height: bounds.bottom - bounds.top
                };

                agcNode.visualBounds = boundsToRect(bounds);

                omgStyles.addStylingData(agcNode, layer, bounds, writer);

                return true;
            });
        };

        this.addImageData = function (agcNode, layer, writer) {
            if (this.addImage(agcNode, layer, writer)) {
                return true;
            }
            console.log("ERROR: No image data added for " + JSON.stringify(layer));
            return false;
        };
    }

    module.exports = new SVGOMGeneratorImage();

}());
