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
    OMG = require("../svgOMGenerator.js"),
    svgWriter = require("../svgWriter.js"),
    sinon = require('sinon'),
    database = require('./test-database.js'),
    fs = require('fs');


describe('svgWriter', function (){

    //report the differences in an easy-to-review format

    var sandbox = sinon.sandbox.create(),
        _isLastTest = false,
        _compareLogDoc = [],
        _compareLogSubtree = [],
        itmId = 0;

    beforeEach(function () {
    });

    function writeComparison (out, comparison, level) {
        var svgA,
            svgB;

        out.push('<li id="itm' + itmId + '" class="' + level);
        sep = ' ';
        if (comparison.passed) {
            out.push(sep + 'passed');
            sep = ' ';
        }
        if (comparison.repaired) {
            out.push(sep + 'repaired');
            sep = ' ';
            svgA = comparison.filename;
            svgB = comparison.compareFilename;
        } else if (!comparison.passed) {
            svgA = comparison.compareFilename;
            svgB = comparison.filename;
        } else {
            svgA = comparison.filename;
            svgB = '';
        }

        out.push('" onclick="compareSVG(\'#itm' + itmId++ + '\', \'' + svgA + '\', \'' + svgB + '\')"><div class="passfail"></div><span>');

        out.push(comparison.name + '</span></li>');
    }

    afterEach(function () {
        var out = [],
            templ,
            insertStr = "<!--INSERT-->",
            pos,
            header,
            footer;

        sandbox.restore();

        if (_isLastTest) {
            try {
                templ = fs.readFileSync('./tests/report/reportTemplate.html').toString();
                pos = templ.indexOf(insertStr);
                header = templ.substring(0, pos);
                footer = templ.substring(pos + insertStr.length);

                out.push(header);

                _compareLogDoc.forEach(function (comparison) {
                    writeComparison(out, comparison, 'doc');
                });

                _compareLogSubtree.forEach(function (comparison) {
                    writeComparison(out, comparison, 'subtree');
                });

                out.push(footer);
                fs.writeFileSync('./test-summary.html', out.join(""), 'utf8');
            } catch (err) {
                console.warn("error making summary " + err);
            }
        }
    });
    function handleResults(compareLog, testName, expectedOut, svgOut, pathData, pathCompare) {

        if (svgOut != expectedOut) {
            if (repairMedia) {
                fs.writeFileSync(pathCompare, expectedOut, 'utf8');
                fs.writeFileSync(pathData, svgOut, 'utf8');
            } else {
                fs.writeFileSync(pathCompare, svgOut, 'utf8');
            }
            compareLog.push({
                name: testName,
                passed: false,
                repaired: repairMedia,
                compareFilename: pathCompare,
                filename: pathData
            });
        } else {
            compareLog.push({
                name: testName,
                passed: true,
                filename: pathData
            });
        }
    }


    /**
     * Test extraction of masks to SVG
     **/
    describe('Test extraction of masks to SVG', function () {

        function compareResults (testName) {
            var svgOM,
                svgOut,
                expectedOut,
                svgWriterErrors = [],
                path = 'data/mask/' + testName;

            svgOM = JSON.parse(fs.readFileSync('./tests/' + path + '-om.json'));
            svgOut = svgWriter.printSVG(svgOM);

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName + '.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        var database = ["mask-1", "mask-2", "mask-3", "mask-4", "mask-5", "mask-6", "mask-7", "mask-8", "mask-9", "mask-10", "mask-11", "mask-12"];

        for (var i = 0, end = database.length; i < end; i++) {
            compareResults(database[i]);
        }
    });

    /**
     * Test extraction of masks to SVG
     **/
    describe('Test extraction of clipPath to SVG', function () {

        function compareResults (testName) {
            var svgOM,
                svgOut,
                expectedOut,
                svgWriterErrors = [],
                path = 'data/clipPath/' + testName;

            svgOM = JSON.parse(fs.readFileSync('./tests/' + path + '-om.js'));
            svgOut = svgWriter.printSVG(svgOM);

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName + '.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        var database = ["clipPath-1", "clipPath-2", "clipPath-3", "clipPath-4", "clipPath-5", "clipPath-6", "clipPath-7"];

        for (var i = 0, end = database.length; i < end; i++) {
            compareResults(database[i]);
        }
    });

    /**
     * Test extraction of patterns to SVG
     **/
    describe('Test extraction of patterns to SVG', function () {

        function compareResults (testName) {
            var svgOM,
                svgOut,
                expectedOut,
                svgWriterErrors = [],
                path = 'data/pattern/' + testName;

            svgOM = JSON.parse(fs.readFileSync('./tests/' + path + '-om.js'));
            svgOut = svgWriter.printSVG(svgOM);

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName + '.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        var database = ["pattern-1", "pattern-2", "pattern-3", "pattern-4"];

        for (var i = 0, end = database.length; i < end; i++) {
            compareResults(database[i]);
        }
    });

    /**
     * Test extraction of all layers to SVG
     **/
    describe('Test extraction of all layers to SVG', function () {

        function compareResults (layerId, testName) {
            var svgOM,
                svgOut,
                expectedOut,
                svgWriterErrors = [],
                path = 'data/' + testName + '/' + testName + '-' + layerId;

            svgOM = require('./' + path + '-om.js');
            svgOut = svgWriter.printSVG(svgOM, {
                        trimToArtBounds: true,
                        preserveAspectRatio: "xMidYMid",
                        scale: 1,
                        constrainToDocBounds: true
                    }, svgWriterErrors);

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '-' + layerId + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName + '-' + layerId + '.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        function runJSONLayerToOMExtractionTest (layer, testName, skipTest) {

            if (skipTest) {
                it.skip('Extract ' + layer.id + ' from ' + testName, function () {
                    compareResults(layer.id, testName);
                });
            } else {
                it('Extract layer ' + layer.id + ' from ' + testName, function () {
                    compareResults(layer.id, testName);
                });
            }

            if (!layer.layers) {
                return;
            }

            for (var i = 0, end = layer.layers.length; i < end; ++i) {
                runJSONLayerToOMExtractionTest(layer.layers[i], testName, skipTest);
            }
        }

        function setupTesting (testName, desc, skipTest) {
            var testData = require('./data/' + testName + '-data.js');
            if (!testData.layers) {
                console.log('Warning: PSD does not have any layers.')
            }

            if (!fs.existsSync('./tests/data/' + testName)) {
                console.log("Error: Expected layer OM data for " + testName);
                return;
            }

            for (var j = 0, end = testData.layers.length; j < end; ++j) {
                runJSONLayerToOMExtractionTest(testData.layers[j],
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
     * Test individual OM object extraction
     **/
    describe('Test individual OM object extraction', function (){


        function compareResultsExport (testName, aTestData) {
            var testData,
                svgOM,
                svgOut,
                expectedOut,
                svgFilename,
                omOpt,
                scale,
                svgWriterErrors,
                i;

            for (i = 0; i + 2 < aTestData.length; i = i + 3) {

                omOpt = { layerSpec: aTestData[i] };
                testData = require("./data/" + testName + "/" + aTestData[i + 1] + "-data.js");
                svgFilename = "./tests/data/" + testName + "/" + aTestData[i + 1] + ".svg";

                scale = aTestData[i + 2];
                svgWriterErrors = [];

                svgOM = OMG.extractSVGOM(testData, omOpt);

                svgOut = svgWriter.printSVG(svgOM, {
                    trimToArtBounds: true,
                    preserveAspectRatio: "xMidYMid",
                    scale: scale,
                    constrainToDocBounds: true
                }, svgWriterErrors);

                try {
                   expectedOut = fs.readFileSync(svgFilename, 'utf8');
                } catch(er) {
                    fs.writeFileSync(svgFilename, svgOut, 'utf8');
                    console.log('No reference SVG document found. New one created as ' + aTestData[i + 1] + '.svg');
                    continue;
                }

                handleResults(_compareLogSubtree, testName + "/" + aTestData[i + 1], expectedOut, svgOut, './tests/data/' + testName + '/' + aTestData[i + 1] + '.svg', './tests/data-compare/' + testName + "-" + aTestData[i + 1] + '.svg');

                expect(svgOut).to.equal(expectedOut);
            }
            return svgOut;
        }

        it("should align text properly inside a paragraph", function () {
            compareResultsExport("paragraphTextAlign", [
                26, "Group 1", 1.0,
                20, "Group 2", 1.0,
                24, "Group 3", 1.0
            ]);
        });

        it.skip("should resolve bounds and fxBounds to properly clip layers with effects", function () {
            compareResultsExport("shapes-with-external-fx", [
                4, "outer-glow", 1.0,
                3, "drop-shadow", 1.0,
                2, "stroke", 1.0
            ]);
        });

        it.skip("should transform text", function () {
            compareResultsExport("text-with-transform", [
                17, "flip-vertical", 1.0,
                16, "flip-horizontal", 1.0,
                34, "hard-block-left", 1.0,
                34, "hard-block-centered", 1.0,
                14, "skew-right-bottom", 1.0
            ]);
        });

        it.skip("should transform simple shapes", function () {
            compareResultsExport("shapes-with-transform", [
                144, "rect-infer-transform", 1.0,
                150, "ellipse-infer-transform", 1.0,
                151, "ellipse-preserve-shape", 1.0
            ]);
        });
    });

    /**
     * Test text alignment
     **/
    describe("Test text alignment of individual layers", function (){


        function compareResultsExport (testName, layerID) {
            var testData,
                svgOM,
                svgOut,
                expectedOut,
                svgFilename;

            testData = require("./data/" + testName + "-data.json");
            svgFilename = "./tests/data/" + testName + "-" + layerID + ".svg";

            svgOM = OMG.extractSVGOM(testData, { layerSpec: layerID });

            svgOut = svgWriter.printSVG(svgOM, {
                constrainToDocBounds: true,
                preserveAspectRatio: "xMidYMid",
                scale: 1,
                trimToArtBounds: true
            });

            try {
               expectedOut = fs.readFileSync(svgFilename, "utf8");
            } catch(er) {
                fs.writeFileSync(svgFilename, svgOut, "utf8");
                console.log('No reference SVG document found. New one created as ' + testName + "-" + layerID + '.svg');
                return svgOut;
            }

            handleResults(_compareLogSubtree, testName + "-" + layerID, expectedOut, svgOut, './tests/data/' + testName + "-" + layerID + '.svg', './tests/data-compare/' + testName + "-" + layerID + '.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it("should position left aligned text correctly", function () {
            compareResultsExport("layerTextAlign", 2);
        });

        it("should position center aligned text correctly", function () {
            compareResultsExport("layerTextAlign", 3);
        });

        it("should position right aligned text correctly", function () {
            compareResultsExport("layerTextAlign", 4);
        });
    });


    /**
     * Test complete OM to SVG extraction
     **/
    describe("Test complete OM to SVG extraction", function () {
        function compareResults (testName) {
            var svgOM,
                expectedOut;

            svgOM = require("./data/" + testName + "-om.js");
            svgOut = svgWriter.printSVG(svgOM);

            try {
                expectedOut = fs.readFileSync('./tests/data/' + testName + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/data/' + testName + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/data/' + testName + '.svg', './tests/data-compare/' + testName + '.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        function runCompleteOMToSVGExtractionTest(name, desc, skipTest, isLastTest) {
            if (skipTest) {
                it.skip("Entire OM ⇒ SVG for " + name, function () {
                    compareResults(name);
                    if (isLastTest) {
                        _isLastTest = true;
                    }
                });
            } else {
                it("Entire OM ⇒ SVG for " + name, function () {
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

    /**
     * Test polygon and line shapes.
     **/
    describe("Test polygon, polyline and line shapes", function () {
        it("polygons, polylines and lines should be transformed to SVG", function () {
            var svgOM = {
                global: {
                    bounds: {
                        left: 0,
                        right: 400,
                        top: 0,
                        bottom: 500
                    }
                },
                children:[
                    {
                        type: "shape",
                        visible: true,
                        visualBounds: {
                            left: 100,
                            right: 200,
                            top: 100,
                            bottom: 200
                        },
                        shape: {
                            type: "polygon",
                            points: [
                                {
                                    x: 100,
                                    y: 200
                                },
                                {
                                    x: 150,
                                    y: 100
                                },
                                {
                                    x: 200,
                                    y: 100
                                },
                                {
                                    x: 200,
                                    y: 200
                                },
                                {
                                    x: 100,
                                    y: 200
                                }
                            ]
                        },
                        style: {
                            fill: {
                                type: "solid",
                                color: {
                                    r: 0,
                                    g: 0,
                                    b: 0,
                                    a: 1
                                }
                            }
                        }
                    },
                    {
                        type: "shape",
                        visible: true,
                        visualBounds: {
                            left: 100,
                            right: 200,
                            top: 100,
                            bottom: 200
                        },
                        shape: {
                            type: "polyline",
                            points: [
                                {
                                    x: 100,
                                    y: 150
                                },
                                {
                                    x: 150,
                                    y: 100
                                },
                                {
                                    x: 200,
                                    y: 100
                                },
                                {
                                    x: 200,
                                    y: 200
                                },
                                {
                                    x: 100,
                                    y: 200
                                }
                            ]
                        },
                        style: {
                            fill: {
                                type: "solid",
                                color: {
                                    r: 0,
                                    g: 0,
                                    b: 0,
                                    a: 1
                                }
                            }
                        }
                    },
                    {
                        type: "shape",
                        visible: true,
                        visualBounds: {
                            left: 100,
                            right: 200,
                            top: 300,
                            bottom: 400
                        },
                        shape: {
                            type: "line",
                            x1: 100,
                            y1: 400,
                            x2: 200,
                            y2: 300
                        },
                        style: {
                            fill: {
                                type: "solid",
                                color: {
                                    r: 0,
                                    g: 0,
                                    b: 0,
                                    a: 1
                                }
                            }
                        }
                    },
                ]
            },
            expectedOut,
            svgOut = svgWriter.printSVG(svgOM);

            try {
                expectedOut = fs.readFileSync('./tests/data/polygon-line.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/data/polygon-line.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as polygon-line.svg');
                return;
            }

            expect(svgOut).to.equal(expectedOut);
            return;
        });
    });

    /**
     * Test radial gradient with focal point
     **/
    describe('Test radial gradient with focal point', function () {

        function compareResults (testName) {
            var svgOM,
                expectedOut,
                path = 'data/' + testName;

            svgOM = require('./' + path + '-om.js');
            svgOut = svgWriter.printSVG(svgOM);

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName +'.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it('Test variation of focal points', function () {
            compareResults('radial-gradient-focal');
        });
    });

    /**
     * Test presentation attribute export.
     **/
    describe("Test export to presentation attribute", function () {
        it("should export without style blocks", function () {
            var svgOM = require('./data/stroke-fx-2-om.js'),
                expectedOut,
                svgOut = svgWriter.printSVG(svgOM, {usePresentationAttribute: true});

            try {
                expectedOut = fs.readFileSync('./tests/data/stroke-fx-pres-attr.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/data/stroke-fx-pres-attr.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as stroke-fx-pres-attr.svg');
                return;
            }

            expect(svgOut).to.equal(expectedOut);
            return;
        });
    });

    /**
     * Test that groups with styles are preserved.
     **/
    describe("Test that groups with styles are preserved", function () {
        it("group has opacity", function () {
            var svgOM = require('./data/group-opacity-om.js'),
                expectedOut,
                svgOut = svgWriter.printSVG(svgOM);

            try {
                expectedOut = fs.readFileSync('./tests/data/group-opacity.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/data/group-opacity.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as group-opacity.svg');
                return;
            }

            expect(svgOut).to.equal(expectedOut);
            return;
        });
    });

    /**
     * Test termination of rendering on visible: false.
     **/
    describe("Test termination of rendering on visible: false", function () {
        it("should not render circle", function () {
            var svgOM1 = {
                global: {
                    viewBox: {
                        left: 0,
                        right: 400,
                        top: 0,
                        bottom: 500
                    }
                },
                children:[
                    {
                        type: "shape",
                        visible: false,
                        visualBounds: {
                            left: 50,
                            right: 150,
                            top: 50,
                            bottom: 150
                        },
                        shape: {
                            type: "circle",
                            cx: 100,
                            cy: 100,
                            r: 50
                        },
                        style: {
                            stroke: {
                                type: "solid",
                                color: {r:255,g:0,b:0,a:1},
                                width: 10,
                                "stroke-opacity": 1
                            }
                        }
                    },
                    {
                        type: "shape",
                        visible: true,
                        visualBounds: {
                            left: 100,
                            right: 300,
                            top: 100,
                            bottom: 300
                        },
                        shape: {
                            type: "rect",
                            x: 100,
                            y: 100,
                            width: 200,
                            height: 200
                        },
                        style: {
                            fill: {
                                type: "solid",
                                color: {
                                    r: 0,
                                    g: 0,
                                    b: 0,
                                    a: 1
                                }
                            },
                            stroke: {
                                type: "solid",
                                color: {r:0,g:0,b:0,a:1},
                                width: 10,
                                dash: [0,4],
                                "dash-offset": 10
                            }
                        }
                    },
                ]
            },
            svgOM2 = {
                global: {
                    viewBox: {
                        left: 0,
                        right: 400,
                        top: 0,
                        bottom: 500
                    },
                    masks: {
                        "mask1": {
                            "children": [{
                                "id": "shape-3",
                                "type": "shape",
                                "style": {
                                    "fill": {
                                        "type": "solid",
                                        "color": {
                                            "r": 0,
                                            "g": 113.686632,
                                            "b": 187.776986,
                                            "a": 1
                                        }
                                    }
                                },
                                "children": [],
                                "title": "Rectangle 1",
                                "visualBounds": {
                                    "top": 67,
                                    "left": 130,
                                    "bottom": 245,
                                    "right": 309
                                },
                                "shape": {
                                    "type": "rect",
                                    "x": 130,
                                    "y": 67,
                                    "width": 179,
                                    "height": 179
                                }
                            }],
                            "type": "mask",
                            "kind": "opacity"
                        },
                        "mask2": {
                            "children": [{
                                "id": "shape-4",
                                "type": "shape",
                                "visible": false,
                                "style": {
                                    "fill": {
                                        "type": "solid",
                                        "color": {
                                            "r": 0,
                                            "g": 113.686632,
                                            "b": 187.776986,
                                            "a": 1
                                        }
                                    }
                                },
                                "children": [],
                                "title": "Rectangle 1",
                                "visualBounds": {
                                    "top": 67,
                                    "left": 130,
                                    "bottom": 245,
                                    "right": 309
                                },
                                "shape": {
                                    "type": "rect",
                                    "x": 130,
                                    "y": 67,
                                    "width": 179,
                                    "height": 179
                                }
                            }],
                            "type": "mask",
                            "kind": "opacity"
                        }
                    }
                },
                children:[
                    {
                        type: "shape",
                        visible: false,
                        visualBounds: {
                            left: 50,
                            right: 150,
                            top: 50,
                            bottom: 150
                        },
                        shape: {
                            type: "circle",
                            cx: 100,
                            cy: 100,
                            r: 50
                        },
                        style: {
                            stroke: {
                                type: "solid",
                                color: {r:255,g:0,b:0,a:1},
                                width: 10,
                                "stroke-opacity": 1,
                            },
                            mask: "mask1"
                        }
                    },
                    {
                        type: "shape",
                        visualBounds: {
                            left: 100,
                            right: 300,
                            top: 100,
                            bottom: 300
                        },
                        shape: {
                            type: "rect",
                            x: 100,
                            y: 100,
                            width: 200,
                            height: 200
                        },
                        style: {
                            mask: "mask2",
                            fill: {
                                type: "solid",
                                color: {
                                    r: 0,
                                    g: 0,
                                    b: 0,
                                    a: 1
                                }
                            }
                        }
                    },
                ]
            },
            expectedOut1,
            expectedOut2,
            svgOut1 = svgWriter.printSVG(svgOM1, {
                trimToArtBounds: true,
                preserveAspectRatio: "xMidYMid"
            }),
            svgOut2 = svgWriter.printSVG(svgOM2, {
                trimToArtBounds: true,
                preserveAspectRatio: "xMidYMid"
            });

            try {
                expectedOut1 = fs.readFileSync('./tests/data/invisible-circle.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/data/invisible-circle.svg', svgOut1, 'utf8');
                console.log('No reference SVG document found. New one created as invisible-circle.svg');
                return;
            }

            expect(svgOut1).to.equal(expectedOut1);

            try {
                expectedOut2 = fs.readFileSync('./tests/data/invisible-with-mask.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/data/invisible-with-mask.svg', svgOut2, 'utf8');
                console.log('No reference SVG document found. New one created as invisible-with-mask.svg');
                return;
            }

            expect(svgOut2).to.equal(expectedOut2);
            return;
        });
    });

    /**
     * Test scale factors.
     **/
    describe("Test polygon and line shapes", function () {
        it("polygons and lines should be transformed to SVG", function () {
            var svgOM = {
                global: {
                    viewBox: {
                        left: 0,
                        right: 600,
                        top: 0,
                        bottom: 600
                    },
                    bounds: {
                        left: 0,
                        right: 600,
                        top: 0,
                        bottom: 600
                    }
                },
                children:[
                    {
                        type: "shape",
                        visualBounds: {
                            left: 100,
                            right: 300,
                            top: 100,
                            bottom: 200
                        },
                        shape: {
                            type: "rect",
                            x: 100,
                            y: 100,
                            width: 200,
                            height: 100
                        },
                        style: {
                            fill: {
                                type: "solid",
                                color: {
                                    r: 0,
                                    g: 0,
                                    b: 0,
                                    a: 1
                                }
                            }
                        }
                    }
                ]
            },
            expectedOut1,
            svgOut1 = svgWriter.printSVG(JSON.parse(JSON.stringify(svgOM)), {
                trimToArtBounds: true,
                preserveAspectRatio: "xMidYMid",
                scale: 2,
                constrainToDocBounds: true
            }),
            expectedOut2,
            svgOut2 = svgWriter.printSVG(JSON.parse(JSON.stringify(svgOM)), {
                trimToArtBounds: true,
                preserveAspectRatio: "xMidYMid",
                scale: 2,
                constrainToDocBounds: true,
                cropRect: {
                    width: 600,
                    height: 300
                }
            });

            try {
                expectedOut1 = fs.readFileSync('./tests/data/scale-1.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/data/scale-1.svg', svgOut1, 'utf8');
                console.log('No reference SVG document found. New one created as scale-1.svg');
                return;
            }
            expect(svgOut1).to.equal(expectedOut1);

            try {
                expectedOut2 = fs.readFileSync('./tests/data/scale-2.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/data/scale-2.svg', svgOut2, 'utf8');
                console.log('No reference SVG document found. New one created as scale-2.svg');
                return;
            }
            expect(svgOut2).to.equal(expectedOut2);
            return;
        });
    });

    /**
     * Test minification of SVG output
     **/
    describe('Test minification of SVG output', function () {

        function compareResults (testName) {
            var svgOM,
                expectedOut,
                path = 'data/' + testName;

            svgOM = require('./' + path + '-om.js');
            svgOut = svgWriter.printSVG(svgOM, {minify: true});

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '-minify.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '-minify.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '-minify.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName + '-minify', expectedOut, svgOut, './tests/' + path + '-minify.svg', './tests/data-compare/' + testName +'-minify.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it('Test minification of SVG output with gradient', function () {
            compareResults('gradient-scale-2');
        });

        it('Test minification of SVG output with filters', function () {
            compareResults('multi-layer-fx-5');
        });

        it('Test minification of SVG output with clip-path', function () {
            compareResults('clipPath-1');
        });
    });

    /**
     * Test gradient transform
     **/
    describe('Test gradient transform', function () {

        function compareResults (testName) {
            var svgOM,
                expectedOut,
                path = 'data/' + testName;

            svgOM = require('./' + path + '-om.js');
            svgOut = svgWriter.printSVG(svgOM);

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName +'.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it('Test transform on gradient', function () {
            compareResults('gradient-transform');
        });
    });

    /**
     * Test image processing
     **/
    describe('Test image processing', function () {

        function compareResults (testName) {
            var svgOM,
                expectedOut,
                path = 'data/' + testName;

            svgOM = require('./' + path + '-om.js');
            svgOut = svgWriter.printSVG(svgOM);

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName +'.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it('Objects of type "image" are recognized', function () {
            compareResults('image');
        });
    });

    /**
     * Test that focal point on/outside gradient radius gets moved.
     **/
    describe('Test that focal point on/outside gradient radius gets moved', function () {

        function compareResults (testName) {
            var svgOM,
                expectedOut,
                path = 'data/' + testName;

            svgOM = require('./' + path + '-om.js');
            svgOut = svgWriter.printSVG(svgOM);

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName +'.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it('Focal point on radius gets moved', function () {
            compareResults('focal-point-on-radius');
        });
    });

	/**
     * Test empty groups.
     **/
    describe("Test empty groups", function () {
        it("printSVG should not throw on empty groups", function () {
            var svgOM = {"children": [
                    {
                        "children": [],
                        "id": "just-circles",
                        "title": "",
                        "type": "group",
                        "visible": true
                    },
                    {
                        "id": "red-rect",
                        "shape": {
                            "height": 58.2535,
                            "r": [
                                0,
                                0,
                                0,
                                0
                            ],
                            "type": "rect",
                            "width": 233.099,
                            "x": 18.6056,
                            "y": 29.4085
                        },
                        "shapeBounds": {
                            "bottom": 200,
                            "left": 100,
                            "right": 200,
                            "top": 100
                        },
                        "title": "",
                        "type": "shape",
                        "visible": true
                    }
                ],
                "global": {
                    "bounds": {
                        "bottom": 653.761,
                        "left": 3.9507,
                        "right": 576.93,
                        "top": -23.9085
                    },
                    "viewBox": {
                        "bottom": 653.761,
                        "left": 3.9507,
                        "right": 576.93,
                        "top": -23.9085
                    }
                },
                "title": "layers",
                "version": "0.1.0"
            };
            expect(svgWriter.printSVG(svgOM)).to.not.equal('');
        });
    });

    /**
     * Test fill: none.
     **/
    describe("Test fill: none", function () {
        it("If fill was set to 'none', it should not fallback to black.", function () {
            var svgOM = {
                "title": "generatedAsset",
                "version": "0.1.0",
                "global": {
                    "bounds": {
                        "top": 9.00,
                        "left": 177.00,
                        "bottom": 127.00,
                        "right": 297.00
                    },
                    "viewBox": {
                        "top": 9.00,
                        "left": 177.00,
                        "bottom": 127.00,
                        "right": 297.00
                    }
                },
                "children": [
                    {
                        "type": "shape",
                        "shape": {
                            "type": "ellipse",
                            "cx": 237.00,
                            "cy": 68.00,
                            "ry": 56.00,
                            "rx": 57.00
                        },
                        "style": {
                            "fill": {
                                "type": "none"
                            },
                            "stroke": {
                                "width": 14.47,
                                "type": "solid",
                                "color": {
                                    "r": 255.00,
                                    "g": 0.00,
                                    "b": 0.00
                                }
                            }
                        }
                    }
                ]
            },
            expectedOut,
            svgOut = svgWriter.printSVG(svgOM);

            try {
                expectedOut = fs.readFileSync('./tests/data/fill-none.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/data/fill-none.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as fill-none.svg');
                return;
            }
            expect(svgOut).to.equal(expectedOut);
        });
    });

    /**
     * Test precision parameter
     **/
    describe("Test precision parameter", function () {

        function test(precision) {
            var svgOM,
                svgOut,
                expectedOut;

            svgOM = require("./data/precision-om.json");
            svgOut = svgWriter.printSVG(svgOM, {precision: precision});

            try {
                expectedOut = fs.readFileSync("./tests/data/precision-" + precision + ".svg", "utf8");
            } catch (e) {
                fs.writeFileSync("./tests/data/precision-" + precision + ".svg", svgOut, "utf8");
                console.log("No reference SVG document found. New one created as precision-" + precision + ".svg");
                return svgOut;
            }

            handleResults(_compareLogDoc, "precision-" + precision, expectedOut, svgOut, "./tests/data/precision-" + precision + ".svg", "./tests/data-compare/precision-" + precision + ".svg");

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it("Test with precision 3", function () {
            test(3);
        });
        it("Test with precision 0", function () {
            test(0);
        });
        it("Test with precision 5", function () {
            test(5);
        });
        it("Test with precision 1", function () {
            test(1);
        });
        it("Test with undefined precision", function () {
            test();
        });
    });

    /**
     * Test options for idGenerator
     **/
    describe('Test options for idGenerator', function () {

        function compareResults (testName) {
            var svgOM,
                svgOut,
                expectedOut,
                path = 'data/idGenerator/' + testName;

            svgOM = require('./' + path + '-om.js');
            svgOut = svgWriter.printSVG(svgOM, {idType: "unique"});

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName +'.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it.skip('Test unique ID generation', function () {
            compareResults('unique-id');
        });
    });

    /**
     * Test transform on groups
     **/
    describe('Test transform on groups', function () {

        function compareResults (testName) {
            var svgOM,
                svgOut,
                expectedOut,
                path = 'data/' + testName;

            svgOM = require('./' + path + '-om.js');
            svgOut = svgWriter.printSVG(svgOM);

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName +'.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it('Test transform attribute on group', function () {
            compareResults('group-transform');
        });
    });

    /**
     * Test symbols
     **/
    describe('Test symbols', function () {

        function compareResults (testName) {
            var svgOM,
                svgOut,
                expectedOut,
                path = 'data/' + testName;

            svgOM = require('./' + path + '-om.js');
            svgOut = svgWriter.printSVG(svgOM);

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName +'.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it('Test references with symbol', function () {
            compareResults('symbol');
        });
    });

    /**
     * Test gradient objectBoundingBox
     **/
    describe('Test gradient objectBoundingBox', function () {

        function compareResults (testName, isArtboard) {
            var svgOM,
                svgOut,
                expectedOut,
                path = 'data/gradient/' + testName;

            svgOM = require('./' + path + '-om.js');
            svgOut = svgWriter.printSVG(
                svgOM,
                {
                    cropRect: {
                        width: 300,
                        height: 300
                    },
                    trimToArtBounds: true,
                    constrainToDocBounds: true
                }
            );

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName +'.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it('Test cropping on ellipse exceeding document bounds 1', function () {
            compareResults("gradient-obb");
        });
    });

    /**
     * Test cropping
     **/
    describe('Test cropping', function () {

        function compareResults (testName, config) {
            var svgOM,
                svgOut,
                expectedOut,
                path = 'data/cropping/' + testName;

            svgOM = require('./' + path + '-om.js');
            svgOut = svgWriter.printSVG(svgOM, config);

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName +'.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        var config1 = {
                cropRect: {
                    width: 300,
                    height: 300
                },
                trimToArtBounds: true,
                constrainToDocBounds: true
            },
            config2 = {
                cropRect: {
                    width: 200,
                    height: 200
                },
                scale: 0.5
            };

        it('Test cropping on ellipse exceeding document bounds 1', function () {
            compareResults("ellipse-past-doc-1", config1);
        });

        it('Test cropping on ellipse exceeding document bounds 2', function () {
            compareResults("ellipse-past-doc-2", config1);
        });

        it('Test cropping on ellipse exceeding document bounds 3', function () {
            compareResults("ellipse-past-doc-3", config2);
        });
    });

    /**
     * Test artboard cropping
     **/
    describe('Test artboard cropping', function () {

        function compareResults (testName, isArtboard) {
            var svgOM,
                svgOut,
                expectedOut,
                path = 'data/artboard-cropping/' + testName;

            svgOM = require('./' + path + '-om.js');
            svgOut = svgWriter.printSVG(
                svgOM,
                {
                    artboardBounds: {
                        "top": 900,
                        "left": 900,
                        "bottom": 1300,
                        "right": 1300
                    },
                    cropRect: {
                        width: 300,
                        height: 300
                    },
                    trimToArtBounds: true,
                    preserveAspectRatio: "xMidYMid",
                    scale: 1,
                    constrainToDocBounds: true,
                    clipToArtboardBounds: true,
                    isArtboard: isArtboard
                }
            );

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName +'.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it('Test extracting ellipse-1 from artboard', function () {
            compareResults("ellipse-1");
        });
        it('Test extracting ellipse-2 from artboard', function () {
            compareResults("ellipse-2");
        });
        it('Test extracting ellipse-3 from artboard', function () {
            compareResults("ellipse-3");
        });
        it('Test extracting ellipse-4 from artboard', function () {
            compareResults("ellipse-4");
        });
        it('Test extracting artboard', function () {
            compareResults("artboard", true);
        });
    });

    /**
     * Test isResponsive
     **/
    describe('Test isResponsive', function () {

        function compareResults (testName, isArtboard) {
            var svgOut,
                expectedOut,
                path = 'data/responsive/' + testName,
                svgOM = {
                    "title": "generatedAsset",
                    "version": "0.1.0",
                    "global": {
                        "bounds": {
                            "top": 0,
                            "left": 0,
                            "bottom": 400,
                            "right": 400
                        }
                    },
                    "children": [
                        {
                            "type": "shape",
                            "shape": {
                                "type": "ellipse",
                                "cx": 105,
                                "cy": 155,
                                "ry": 150,
                                "rx": 100
                            },
                            "style": {
                                "stroke": {
                                    "width": 10,
                                    "type": "solid",
                                    "color": {
                                        "r": 0,
                                        "g": 127,
                                        "b": 0
                                    }
                                }
                            },
                            "visualBounds": {
                                "left": 5,
                                "right": 305,
                                "top": 5,
                                "bottom": 205
                            }
                        }
                    ]
                };
            svgOut = svgWriter.printSVG(
                svgOM,
                {
                    trimToArtBounds: true,
                    isResponsive: true
                }
            );

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName +'.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it('Test isResponsive on trimmed-to-artbounds art.', function () {
            compareResults("responsive");
        });
    });

    /**
     * Test that name is not part of a style
     **/
    describe('Test that name is not part of a style', function () {

        function compareResults (testName) {
            var svgOut,
                expectedOut,
                path = 'data/custom/' + testName,
                svgOM = {
                    "version": "0.1.0",
                    "global": {
                        "bounds": {
                            "top": 0,
                            "left": 0,
                            "bottom": 200,
                            "right": 200
                        }
                    },
                    "children": [
                        {
                            "type": "shape",
                            "shape": {
                                "type": "circle",
                                "cx": 100,
                                "cy": 100,
                                "r": 100
                            },
                            "style": {
                                "name": "Shouldn't show up",
                                "stroke": {
                                    "width": 10,
                                    "type": "solid",
                                    "color": {
                                        "r": 0,
                                        "g": 127,
                                        "b": 0
                                    }
                                }
                            },
                        }
                    ]
                };
            svgOut = svgWriter.printSVG(svgOM, {});

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName +'.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it('Test that name is not part of a style sheet.', function () {
            compareResults("style-name");
        });
    });

    /**
     * Test shifting of groups with transform applied
     **/
    describe('Test shifting of groups with transform applied', function () {

        function compareResults (testName) {
            var svgOut,
                expectedOut,
                path = 'data/custom/' + testName,
                svgOM = require('./' + path + '-om.js');
            svgOut = svgWriter.printSVG(svgOM, {
                trimToArtBounds: true
            });

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName +'.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it("Test that group is translated instead of leaves if it has transform.", function () {
            compareResults("group-transform");
        });
        it("Test that two elements sharing pattern wouldn’t cause style issues.", function () {
            compareResults("double-pattern");
        });
        it("Test that images get shifted.", function () {
            compareResults("image");
        });
    });

    /**
     * Test that attributes of referencing gradient get overridden
     **/
    describe('Test that attributes of referencing gradient get overridden', function () {

        function compareResults (testName) {
            var svgOut,
                expectedOut,
                path = 'data/custom/' + testName,
                svgOM = require('./' + path + '-om.js');
            svgOut = svgWriter.printSVG(svgOM, {});

            try {
                expectedOut = fs.readFileSync('./tests/' + path + '.svg', 'utf8');
            } catch (e) {
                fs.writeFileSync('./tests/' + path + '.svg', svgOut, 'utf8');
                console.log('No reference SVG document found. New one created as ' + testName + '.svg');
                return svgOut;
            }

            handleResults(_compareLogDoc, testName, expectedOut, svgOut, './tests/' + path + '.svg', './tests/data-compare/' + testName +'.svg');

            expect(svgOut).to.equal(expectedOut);
            return svgOut;
        }

        it('Test that gradientTransform overrides trasnform on referencing gradient', function () {
            compareResults("pattern-gradient");
        });

        it('Test that x1-y1 overridde x1-y1 on referencing gradient', function () {
            compareResults("gradient-1");
        });

        it('Test that cx,cy,r overridde cx,cy,r on referencing gradient', function () {
            compareResults("gradient-2");
        });
    });
});
