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

/* given an svgOM, generate SVG */

(function () {
    "use strict";

    var fs = require("fs"),
        Validator = require("jsonschema").Validator,
        v = new Validator,
        schema = JSON.parse(fs.readFileSync("./tests/schema/schema.json"));

    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/bounds.json")), "/bounds");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/artboard.json")), "/artboard");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/circle.json")), "/circle");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/color.json")), "/color");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/colorRef.json")), "/colorRef");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/ellipse.json")), "/ellipse");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/svgFilter.json")), "/svgFilter");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/group.json")), "/group");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/image.json")), "/image");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/line.json")), "/line");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/path.json")), "/path");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/polygon.json")), "/polygon");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/polyline.json")), "/polyline");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/position.json")), "/position");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/rect.json")), "/rect");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/reference.json")), "/reference");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/resources.json")), "/resources");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/style.json")), "/style");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/text.json")), "/text");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/transform2d.json")), "/transform2d");
    v.addSchema(JSON.parse(fs.readFileSync("./tests/schema/transform3d.json")), "/transform3d");

    function validateAGC(AGC) {
        return v.validate(AGC, schema);
    }

    module.exports.validateAGC = validateAGC;
}());
