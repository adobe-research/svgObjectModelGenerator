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


/*global require: true, describe: true, beforeEach: true, afterEach: true, it: true */

var expect = require("chai").expect,
    OMG = require("../svgOMGenerator.js"),
    sinon = require("sinon"),
    database = require("./test-database.js"),
    fs = require("fs");

describe("svgOMGenerator", function () {

    var sandbox = sinon.sandbox.create();

    beforeEach(function () {
    });

    afterEach(function () {
        sandbox.restore();
    });

    /**
     * Test complete Generator JSON to OM extraction
     **/
    describe("Test complete Generator JSON to OM extraction", function () {

        function compareResults(testName) {
            var expectedModule,
                testData = require("./data/" + testName + "-data.js"),
                svgOMGText = JSON.stringify(OMG.extractSVGOM(testData, {}), null, "\t");
            try {
                expectedModule = JSON.parse(fs.readFileSync("./tests/data/" + testName + "-om.json"));
            } catch (e) {
                fs.writeFileSync("./tests/data/" + testName + "-om.json", svgOMGText, "utf8");
                console.log("No reference OM document found. New one created as " + testName + "-om.json");
                return svgOMGText;
            }
            var svgOMExpected = JSON.parse(JSON.stringify(expectedModule)),
                svgOM = JSON.parse(svgOMGText);

            return expect(svgOM).to.eql(svgOMExpected);
        }

        function runCompleteJSONToOMExtractionTest(name, desc, skipTest) {
            if (skipTest) {
                it.skip("Entire Generator JSON ⇒ OM for " + name, function () {
                    compareResults(name);
                });
            } else {
                it("Entire Generator JSON ⇒ OM for " + name, function () {
                    compareResults(name);
                });
            }
        }

        // Call all individual tests from test-database.js
        for (var i = 0, end = database.length; i < end; i++) {
            runCompleteJSONToOMExtractionTest(database[i].test,
                database[i].desc,
                !!database[i].skip,
                i == end - 1);
        }
    });


    /**
     * Test individual Generator JSON layers to OM extraction
     **/
    describe("Test individual layer extraction to OM", function () {

        function compareResults(testData, layerId, testName) {
            var expectedModule,
                svgOM,
                svgOMGText,
                svgOMExpected,
                path = "data/" + testName + "/" + testName + "-" + layerId + "-om.json",
                omOpt = { layerSpec: layerId };

            svgOM = OMG.extractSVGOM(testData, omOpt);

            svgOMGText = JSON.stringify(svgOM, null, "\t");

            try {
                expectedModule = JSON.parse(fs.readFileSync("./tests/" + path));
            } catch (e) {
                fs.writeFileSync("./tests/" + path, svgOMGText, "utf8");
                console.log("No reference OM document found. New one created as " + testName + "-" + layerId + "-om.json");
                return svgOMGText;
            }

            svgOMExpected = JSON.parse(JSON.stringify(expectedModule));
            svgOM = JSON.parse(svgOMGText);

            return expect(svgOM).to.eql(svgOMExpected);
        }

        function runJSONLayerToOMExtractionTest(testData, layer, testName, skipTest) {

            if (skipTest) {
                it.skip("Extract layer " + layer.id + " from " + testName, function () {
                    compareResults(testData, layer.id, testName);
                });
            } else {
                it("Extract layer " + layer.id + " from " + testName, function () {
                    compareResults(testData, layer.id, testName);
                });
            }

            if (!layer.layers) {
                return;
            }

            for (var i = 0, end = layer.layers.length; i < end; ++i) {
                runJSONLayerToOMExtractionTest(testData, layer.layers[i], testName, skipTest);
            }
        }

        function setupTesting(testName, desc, skipTest) {
            var testData = require("./data/" + testName + "-data.js");
            if (!testData.layers) {
                console.log("Warning: PSD does not have any layers.");
            }

            // Does the directory with the test results exist? If not create it.
            if (!fs.existsSync("./tests/data/" + testName)) {
                fs.mkdirSync("./tests/data/" + testName);
            }

            for (var j = 0, end = testData.layers.length; j < end; ++j) {
                runJSONLayerToOMExtractionTest(testData,
                                               testData.layers[j],
                                               testName,
                                               skipTest);
            }
        }

        // Call all individual tests from test-database.js
        for (var i = 0, end = database.length; i < end; i++) {
            if (!database[i].layerTest) {
                continue;
            }
            setupTesting(database[i].test,
                database[i].desc,
                !!database[i].skip);
        }
    });

    /**
     * Test extraction of individual layers
     **/
    describe("Test svgOMGenerator stability", function () {

        it.skip("should be able to OM a text with a layer spec", function () {

            // var testData = require("./data/svgText-data.js"),
            //     svgOM = OMG.extractSVGOM(testData, { layerSpec: 4 });
            // FIXME: The test doesn't compare anything.
            //expect(svgOMExpected).to.eql(svgOM);
        });

        it("should survive unknown layer type", function () {
            sandbox.stub(console, "log");
            OMG._getSVGLayerType("nannan");
            expect(console.log.calledOnce).to.equal(true);
        });

        it("should recognize a layer spec when it sees one", function () {
            expect(OMG._layerSpecActive()).to.equal(false);
            expect(OMG._layerSpecActive(3)).to.equal(true);
            //expect(OMG._layerSpecActive({ TBD })).to.equal(true);
        });

        it("should be able to match a layer spec with a layer", function () {

            var layer = {
                    id: 3
                },
                layerSpec = 3;

            expect(OMG._layerSpecMatches(layer, undefined)).to.equal(false);
            expect(OMG._layerSpecMatches(layer, layerSpec)).to.equal(true);
        });
    });
});
