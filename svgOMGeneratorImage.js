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

        this.addImage = function (svgNode, layer, writer) {
            return this.pathComponentOrigin(layer, function (pixel) {
                svgNode.href = pixel;
                svgNode.bounds = layer.bounds;

                if (layer.boundsWithFX) {
                    svgNode.bounds = layer.boundsWithFX;
                }

                svgNode.visualBounds = svgNode.bounds;

                omgStyles.addStylingData(svgNode, layer, svgNode.bounds, writer);

                return true;
            });
        };

        this.addImageData = function (svgNode, layer, writer) {
            if (this.addImage(svgNode, layer, writer)) {
                return true;
            }
            console.log("ERROR: No image data added for " + JSON.stringify(layer));
            return false;
        };
    }

    module.exports = new SVGOMGeneratorImage();

}());
