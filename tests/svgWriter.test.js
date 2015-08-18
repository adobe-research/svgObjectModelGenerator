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

/*global require: true, describe: true, beforeEach: true, afterEach: true, it: true, repairMedia: true */

var expect = require("chai").expect,
    OMG = require("../svgOMGenerator.js"),
    svgWriter = require("../svgWriter.js"),
    sinon = require("sinon"),
    database = require("./test-database.js"),
    fs = require("fs");


describe("svgWriter", function () {

    //report the differences in an easy-to-review format

    var sandbox = sinon.sandbox.create(),
        _isLastTest = false,
        _compareLogDoc = [],
        _compareLogSubtree = [],
        itmId = 0;

    beforeEach(function () {
    });

    function writeComparison(out, comparison, level) {
        var svgA,
            svgB;

        out.push('<li id="itm' + itmId + '" class="' + level);
        var sep = " ";
        if (comparison.passed) {
            out.push(sep + "passed");
            sep = " ";
        }
        if (comparison.repaired) {
            out.push(sep + "repaired");
            sep = " ";
            svgA = comparison.filename;
            svgB = comparison.compareFilename;
        } else if (!comparison.passed) {
            svgA = comparison.compareFilename;
            svgB = comparison.filename;
        } else {
            svgA = comparison.filename;
            svgB = "";
        }

        out.push('" onclick="compareSVG(\'#itm' + itmId++ + "', '" + svgA + "', '" + svgB + '\')"><div class="passfail"></div><span>');

        out.push(comparison.name + "</span></li>");
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
                templ = fs.readFileSync("./tests/report/reportTemplate.html").toString();
                pos = templ.indexOf(insertStr);
                header = templ.substring(0, pos);
                footer = templ.substring(pos + insertStr.length);

                out.push(header);

                _compareLogDoc.forEach(function (comparison) {
                    writeComparison(out, comparison, "doc");
                });

                _compareLogSubtree.forEach(function (comparison) {
                    writeComparison(out, comparison, "subtree");
                });

                out.push(footer);
                fs.writeFileSync("./test-summary.html", out.join(""), "utf8");
            } catch (err) {
                console.warn("error making summary " + err);
            }
        }
    });
    function handleResults(compareLog, testName, expectedOut, svgOut, pathData, pathCompare) {

        if (svgOut != expectedOut) {
            if (repairMedia) {
                fs.writeFileSync(pathCompare, expectedOut, "utf8");
                fs.writeFileSync(pathData, svgOut, "utf8");
            } else {
                fs.writeFileSync(pathCompare, svgOut, "utf8");
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

    function compareResultsWidthOM(svgOM, testName, testPath, options) {
        var svgOut,
            expectedOut,
            path = "data/" + (testPath ? testPath + "/" : "") + testName;

        svgOut = svgWriter.printSVG(svgOM, options || {});

        try {
            expectedOut = fs.readFileSync("./tests/" + path + ".svg", "utf8");
        } catch (e) {
            fs.writeFileSync("./tests/" + path + ".svg", svgOut, "utf8");
            console.log("No reference SVG document found. New one created as " + path + ".svg");
            return;
        }

        handleResults(_compareLogDoc, testName, expectedOut, svgOut, "./tests/" + path + ".svg", "./tests/data-compare/" + testName + ".svg");

        expect(svgOut).to.equal(expectedOut);
    }

    function compareResults(testName, testPath, options) {
        var path = "data/" + (testPath ? testPath + "/" : "") + testName,
            svgOM = JSON.parse(fs.readFileSync("./tests/" + path + "-om.json"));

        compareResultsWidthOM(svgOM, testName, testPath, options);
    }

    /**
     * Test streaming of SVG output
     **/
    describe("Test streaming of SVG output", function () {
        var svgOM = JSON.parse(fs.readFileSync("./tests/data/group-opacity-om.json")),
            stream = fs.createWriteStream("./tests/data/stream/ouput.svg"),
            result,
            load;

        svgWriter.streamSVG(svgOM, stream);
        stream.end();
        stream.on("finish", function () {
            // FIXME: Newer versions of Chai support asynch testing and promises.
            it.skip("Test that streaming succeeded", function () {
                result = fs.readFileSync("./tests/data/stream/result.svg");
                load = fs.readFileSync("./tests/data/stream/ouput.svg");
                expect(result).to.equal(load);
            });
        });
    });

    /**
     * Test extraction of masks to SVG
     **/
    describe("Test extraction of masks to SVG", function () {
        var database = ["mask-1", "mask-2", "mask-3", "mask-4", "mask-5", "mask-6", "mask-7", "mask-8", "mask-9", "mask-10", "mask-11", "mask-12", "mask-13", "mask-14"];

        database.forEach(function (item) {
            it("test " + item, function () {
                compareResults(item, "mask");
            });
        });
    });

    /**
     * Test extraction of clipping paths to SVG
     **/
    describe("Test extraction of clipPath to SVG", function () {
        var database = ["clipPath-1", "clipPath-2", "clipPath-3", "clipPath-4", "clipPath-5", "clipPath-6", "clipPath-7"];

        database.forEach(function (item) {
            it("test " + item, function () {
                compareResults(item, "clipPath");
            });
        });
    });

    /**
     * Test extraction of patterns to SVG
     **/
    describe("Test extraction of patterns to SVG", function () {
        var database = ["pattern-1", "pattern-2", "pattern-3", "pattern-4", "pattern-5", "pattern-6"];

        database.forEach(function (item) {
            it("test " + item, function () {
                compareResults(item, "pattern");
            });
        });
    });

    /**
     * Test extraction of all layers to SVG
     **/
    describe("Test extraction of all layers to SVG", function () {
        function runJSONLayerToOMExtractionTest(layer, testName, skipTest) {
            var options = {
                    trimToArtBounds: true,
                    preserveAspectRatio: "xMidYMid",
                    scale: 1,
                    constrainToDocBounds: true,
                    preparedPath: true
                };

            if (skipTest) {
                it.skip("Extract " + layer.id + " from " + testName, function () {
                    compareResults(testName + "-" + layer.id, testName, options);
                });
            } else {
                it("Extract layer " + layer.id + " from " + testName, function () {
                    compareResults(testName + "-" + layer.id, testName, options);
                });
            }

            if (!layer.layers) {
                return;
            }

            for (var i = 0, end = layer.layers.length; i < end; ++i) {
                runJSONLayerToOMExtractionTest(layer.layers[i], testName, skipTest);
            }
        }

        function setupTesting(testName, desc, skipTest) {
            var testData = require("./data/" + testName + "-data.js");
            if (!testData.layers) {
                console.log("Warning: PSD does not have any layers.");
            }

            if (!fs.existsSync("./tests/data/" + testName)) {
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
    describe("Test individual OM object extraction", function () {
        function compareResultsExport(testName, aTestData) {
            var testData,
                svgOM,
                i,
                options = {
                    trimToArtBounds: true,
                    preserveAspectRatio: "xMidYMid",
                    scale: 1,
                    constrainToDocBounds: true,
                    preparedPath: true
                };

            for (i = 0; i + 2 < aTestData.length; i = i + 3) {
                testData = require("./data/" + testName + "/" + aTestData[i + 1] + "-data.js");

                options.scale = aTestData[i + 2];
                svgOM = OMG.extractSVGOM(testData, { layerSpec: aTestData[i] });

                compareResultsWidthOM(svgOM, aTestData[i + 1], testName, options);
            }
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
    describe("Test text alignment of individual layers", function () {
        function compareResultsExport(testName, layerID) {
            var testData,
                svgOM,
                options = {
                    constrainToDocBounds: true,
                    preserveAspectRatio: "xMidYMid",
                    scale: 1,
                    trimToArtBounds: true
                };

            testData = require("./data/" + testName + "-data.json");
            svgOM = OMG.extractSVGOM(testData, { layerSpec: layerID });

            compareResultsWidthOM(svgOM, testName + "-" + layerID, "", options);
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
            compareResults("polygon-line");
        });
    });

    /**
     * Test radial gradient with focal point
     **/
    describe("Test radial gradient with focal point", function () {
        it("Test variation of focal points", function () {
            compareResults("radial-gradient-focal");
        });
    });

    /**
     * Test presentation attribute export.
     **/
    describe("Test export to presentation attribute", function () {
        it("should export without style blocks", function () {
            var svgOM = JSON.parse(fs.readFileSync("./tests/data/stroke-fx-2-om.json"));

            compareResultsWidthOM(svgOM, "stroke-fx-pres-attr", "", { styling: "attribute" });
        });

        it("Test that mix-blend-mode is not written as attribute", function () {
            var svgOM = JSON.parse(fs.readFileSync("./tests/data/group-om.json"));

            compareResultsWidthOM(svgOM, "group-attr", "", { styling: "attribute" });
        });

        it("Test that text-orientation is not written as attribute", function () {
            var svgOM = JSON.parse(fs.readFileSync("./tests/data/positioned-text3-om.json"));

            compareResultsWidthOM(svgOM, "positioned-text3-attr", "", { styling: "attribute" });
        });
    });

    /**
     * Test style attribute export.
     **/
    describe("Test export to style attribute", function () {
        it("should export without style blocks", function () {
            var svgOM = JSON.parse(fs.readFileSync("./tests/data/stroke-fx-2-om.json"));

            compareResultsWidthOM(svgOM, "stroke-fx-2-style", "", { styling: "style" });
        });
    });

    /**
     * Test that groups with styles are preserved.
     **/
    describe("Test that groups with styles are preserved", function () {
        it("group has opacity", function () {
            compareResults("group-opacity");
        });
    });

    /**
     * Test termination of rendering on visible: false.
     **/
    describe("Test termination of rendering on visible: false", function () {
        var options = {
                trimToArtBounds: true,
                preserveAspectRatio: "xMidYMid"
            };

        it("should not render circle", function () {
            compareResults("invisible-circle", "", options);
        });

        it("should not render invisible shape with mask", function () {
            compareResults("invisible-with-mask", "", options);
        });
    });

    /**
     * Test scale factors.
     **/
    describe("Test polygon and line shapes", function () {
        var options1 = {
                trimToArtBounds: true,
                preserveAspectRatio: "xMidYMid",
                scale: 2,
                constrainToDocBounds: true
            },
            options2 = {
                trimToArtBounds: true,
                preserveAspectRatio: "xMidYMid",
                scale: 2,
                constrainToDocBounds: true,
                cropRect: {
                    width: 600,
                    height: 300
                }
            };

        it("polygons and lines should be transformed to SVG 1", function () {
            compareResults("scale-1", "", options1);
        });

        it("polygons and lines should be transformed to SVG 2", function () {
            compareResults("scale-2", "", options2);
        });
    });

    /**
     * Test minification of SVG output
     **/
    describe("Test minification of SVG output", function () {
        function compareMinifyResults(testName) {
            var svgOM = JSON.parse(fs.readFileSync("./tests/data/" + testName + "-om.json"));

            compareResultsWidthOM(svgOM, testName + "-minify", "", { minify: true });
        }
        function compareCarriageResults(testName) {
            var svgOM = JSON.parse(fs.readFileSync("./tests/data/" + testName + "-om.json"));

            compareResultsWidthOM(svgOM, testName + "-carriage", "", { carriageReturn: true });
        }

        it("Test minification of SVG output with gradient", function () {
            compareMinifyResults("gradient-scale-2");
        });

        it("Test minification of SVG output with filters", function () {
            compareMinifyResults("multi-layer-fx-5");
        });

        it("Test minification of SVG output with clip-path", function () {
            compareMinifyResults("clipPath-1");
        });

        it("Test minification of SVG output with clip-path", function () {
            compareMinifyResults("group-opacity");
        });

        it("Test carriage return on radial-gradient-focal", function () {
            compareCarriageResults("radial-gradient-focal");
        });
    });

    /**
     * Test gradient transform
     **/
    describe("Test gradient transform", function () {
        it("Test transform on gradient", function () {
            compareResults("gradient-transform");
        });
    });

    /**
     * Test image processing
     **/
    describe("Test image processing", function () {
        it("Objects of type 'image' are recognized", function () {
            compareResults("image");
        });
    });

    /**
     * Test that focal point on/outside gradient radius gets moved.
     **/
    describe("Test that focal point on/outside gradient radius gets moved", function () {
        it("Focal point on radius gets moved", function () {
            compareResults("focal-point-on-radius");
        });
    });

    /**
     * Test empty groups.
     **/
    describe("Test empty groups", function () {
        it("printSVG should not throw on empty groups", function () {
            var svgOM = JSON.parse(fs.readFileSync("./tests/data/custom/empty-group-om.json"));

            expect(svgWriter.printSVG(svgOM)).to.not.equal("");
        });
    });

    /**
     * Test fill: none.
     **/
    describe("Test fill: none", function () {
        it("If fill was set to 'none', it should not fallback to black.", function () {
            compareResults("fill-none");
        });
    });

    /**
     * Test precision parameter
     **/
    describe("Test precision parameter", function () {
        function comparePrecisionResults(precision) {
            var svgOM = JSON.parse(fs.readFileSync("./tests/data/precision-om.json"));

            compareResultsWidthOM(svgOM, "precision-" + precision, "", { precision: precision });
        }

        it("Test with precision 3", function () {
            comparePrecisionResults(3);
        });
        it("Test with precision 0", function () {
            comparePrecisionResults(0);
        });
        it("Test with precision 5", function () {
            comparePrecisionResults(5);
        });
        it("Test with precision 1", function () {
            comparePrecisionResults(1);
        });
        it("Test with undefined precision", function () {
            comparePrecisionResults();
        });
    });

    /**
     * Test options for idGenerator
     **/
    describe("Test options for idGenerator", function () {
        it.skip("Test unique ID generation", function () {
            compareResults("unique-id", "idGenerator", { idType: "unique" });
        });
    });

    /**
     * Test transform on groups
     **/
    describe("Test transform on groups", function () {
        it("Test transform attribute on group", function () {
            compareResults("group-transform");
        });
    });

    /**
     * Test symbols
     **/
    describe("Test symbols", function () {
        it("Test references with symbol", function () {
            compareResults("symbol");
        });

        it("Test trimToArtBounds with symbol", function () {
            compareResults("symbol2", "custom", { trimToArtBounds: true });
        });
    });

    /**
     * Test cropping
     **/
    describe("Test cropping", function () {
        var options1 = {
                cropRect: {
                    width: 300,
                    height: 300
                },
                trimToArtBounds: true,
                constrainToDocBounds: true
            },
            options2 = {
                cropRect: {
                    width: 200,
                    height: 200
                },
                scale: 0.5
            };

        it("Test cropping on ellipse exceeding document bounds 1", function () {
            compareResults("ellipse-past-doc-1", "cropping", options1);
        });

        it("Test cropping on ellipse exceeding document bounds 2", function () {
            compareResults("ellipse-past-doc-2", "cropping", options1);
        });

        it("Test cropping on ellipse exceeding document bounds 3", function () {
            compareResults("ellipse-past-doc-3", "cropping", options2);
        });
    });

    /**
     * Test artboard cropping
     **/
    describe("Test artboard cropping", function () {
        var options = {
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
                clipToArtboardBounds: true
            };

        it("Test extracting ellipse-1 from artboard", function () {
            compareResults("ellipse-1", "artboard-cropping", options);
        });
        it("Test extracting ellipse-2 from artboard", function () {
            compareResults("ellipse-2", "artboard-cropping", options);
        });
        it("Test extracting ellipse-3 from artboard", function () {
            compareResults("ellipse-3", "artboard-cropping", options);
        });
        it("Test extracting ellipse-4 from artboard", function () {
            compareResults("ellipse-4", "artboard-cropping", options);
        });
        it("Test extracting artboard", function () {
            options.isArtboard = true;
            compareResults("artboard", "artboard-cropping", options);
        });
    });

    /**
     * Test isResponsive
     **/
    describe("Test isResponsive", function () {
        var options = {
                trimToArtBounds: true,
                isResponsive: true
            };

        it("Test isResponsive on trimmed-to-artbounds art.", function () {
            compareResults("responsive", "responsive", options);
        });
    });

    /**
     * Test that name is not part of a style
     **/
    describe("Test that name is not part of a style", function () {
        it("Test that name is not part of a style sheet.", function () {
            compareResults("style-name", "custom");
        });
    });

    /**
     * Test validity of characters
     **/
    describe("Test validity of characters", function () {
        it("Test that invalid chars in text nodes get removed", function () {
            compareResults("invalid-XML-char", "custom");
        });
    });

    /**
     * Test that name is not part of a style
     **/
    describe("Test M, L, C, Z restricted path data", function () {
        it("Test restricted path data with `preparedPath` option.", function () {
            compareResults("prepared-path", "custom", { preparedPath: true });
        });
    });

    /**
     * Test shifting of groups with transform applied
     **/
    describe("Test shifting of groups with transform applied", function () {
        var options = {
                trimToArtBounds: true
            };

        it("Test that group is translated instead of leaves if it has transform.", function () {
            compareResults("group-transform", "custom", options);
        });
        it("Test that two elements sharing pattern wouldn’t cause style issues.", function () {
            compareResults("double-pattern", "custom", options);
        });
        it("Test that masks get shifted correctly.", function () {
            compareResults("mask", "custom", options);
        });
        it("Test that images get shifted.", function () {
            compareResults("image", "custom", options);
        });
    });

    /**
     * Generic gradient tests
     **/
    describe("Test correct behavior of gradients", function () {
        it("Test object bounding box on gradients", function () {
            var options = {
                cropRect: {
                    width: 300,
                    height: 300
                },
                trimToArtBounds: true,
                constrainToDocBounds: true
            };
            compareResults("gradient-obb", "gradient", options);
        });

        it("Test that multiple reference of gradients with stop opacity work.", function () {
            compareResults("gradient-with-stop-opacity", "gradient");
        });

        it("Test that focal points get overridden", function () {
            compareResults("focal-point-override", "gradient");
        });
    });

    /**
     * Test that attributes of referencing gradient get overridden
     **/
    describe("Test that attributes of referencing gradient get overridden", function () {
        it("Test that gradientTransform overrides transform on referencing gradient", function () {
            compareResults("pattern-gradient", "custom", { trimToArtBounds: true });
        });

        it("Test that x1-y1 overridde x1-y1 on referencing gradient", function () {
            compareResults("gradient-1", "custom");
        });

        it("Test that cx,cy,r overridde cx,cy,r on referencing gradient", function () {
            compareResults("gradient-2", "custom");
        });

        it("Test global styles functionality", function () {
            compareResults("global-styles", "custom");
        });
    });

    describe("Test text support", function () {
        it("Test positioned text", function () {
            compareResults("positioned-text");
        });
        it("Test empty paragraph", function () {
            compareResults("positioned-text2");
        });
        it("Test vertical text", function () {
            compareResults("positioned-text3");
        });
        it("Test trimToArtBounds", function () {
            compareResults("positioned-text4", "", {trimToArtBounds: true});
        });
        it("Test trimToArtBounds positioned text", function () {
            compareResults("positioned-text5", "", {trimToArtBounds: true});
        });
        it("Test vertical text", function () {
            compareResults("positioned-text6");
        });
        it("Test letter-spacing", function () {
            compareResults("positioned-text7");
        });
    });
});
