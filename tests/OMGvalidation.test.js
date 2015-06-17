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
/*global define: true, require: true, describe: true, beforeEach: true, afterEach: true, it: true */

var expect = require('chai').expect,
    fs = require('fs'),
    Validator = require('jsonschema').Validator,
    database = require('./test-database.js'),
    sinon = require('sinon');


describe('OMG validation', function (){
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });

    var v = new Validator(),
        schema = JSON.parse(fs.readFileSync('./tests/schema/schema.json'));

    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/bounds.json')), '/bounds');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/artboard.json')), '/artboard');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/circle.json')), '/circle');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/color.json')), '/color');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/ellipse.json')), '/ellipse');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/filter.json')), '/filter');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/global.json')), '/global');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/group.json')), '/group');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/image.json')), '/image');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/line.json')), '/line');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/path.json')), '/path');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/polygon.json')), '/polygon');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/polyline.json')), '/polyline');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/position.json')), '/position');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/rect.json')), '/rect');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/reference.json')), '/reference');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/style.json')), '/style');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/text.json')), '/text');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/transform2d.json')), '/transform2d');
    v.addSchema(JSON.parse(fs.readFileSync('./tests/schema/transform3d.json')), '/transform3d');

    it("Valid most simple OMG", function () {
        var OMG = {
                "version": "0.1.0",
                "children": [],
                "global": {}
            },
            result = v.validate(OMG, schema);

        expect(result.errors.length).to.equal(0);
    });


    it("Invalid simple OMG", function () {
        var OMG = {
                "children": [],
            },
            result = v.validate(OMG, schema);
        
        expect(result.errors.length).to.equal(2);
        expect(result.errors[0].message).to.equal("requires property \"global\"");
        expect(result.errors[1].message).to.equal("requires property \"version\"");
    });

    it("Group opacity OMG test", function () {
        var OMG  = JSON.parse(fs.readFileSync("./tests/data/group-opacity-om.json")),
            result = v.validate(OMG, schema);
        
        for (var i = 0; i < result.errors.length; ++i)
            console.log(JSON.stringify(result.errors[i], null, " "));
        expect(result.errors.length).to.equal(0);
    });

    describe("OMG validation of PS ⇒ OMG input", function () {
        function compareResults (testName) {
            var OMG = JSON.parse(fs.readFileSync("./tests/data/" +testName+ "-om.json")),
                result = v.validate(OMG, schema);

            for (var i = 0; i < result.errors.length; ++i) {
                console.log(result.errors[i].property + ": " + result.errors[i].message);
            }
            expect(result.valid).to.equal(true);
        }

        function runCompleteOMToSVGExtractionTest(name, desc, skipTest, isLastTest) {
            if (skipTest) {
                it.skip("Entire PS ⇒ OMG validation for " + name, function () {
                    compareResults(name);
                    if (isLastTest) {
                        _isLastTest = true;
                    }
                });
            } else {
                it("Entire PS ⇒ OMG validation for " + name, function () {
                    compareResults(name);
                    if (isLastTest) {
                        _isLastTest = true;
                    }
                });
            }
        }

        // Call all individual tests from test-database.js
        for (var i = 0, end = database.length; i < end; i++) {
            runCompleteOMToSVGExtractionTest(database[i].test,
                database[i].desc,
                !!database[i].skip,
                i == end - 1);
        }
    });
});
