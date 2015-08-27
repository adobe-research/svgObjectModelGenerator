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

(function () {
    "use strict";

    // node app -f plugins/my-plugin
    // where app is the path to app in generator-core, and plugins/my-plugin is the path to your plugin's folder

    var Q = require("q"),
        generatorPlus = require("./generatorPlus.js"),
        _G; // Generator

    function stringify(object) {
        try {
            return JSON.stringify(object, null, "    ");
        } catch (e) {
            console.error(e);
        }
        return String(object);
    }

    function printDebug(doc) {
        var psd = stringify(doc);

        _G.evaluateJSXFile(__dirname + "/jsx/copy.jsx", { clipboard: psd });
    }

    function error(err) {
        console.error("[svgOMG] Error: ", err);
    }

    var MENU_GENERATOR_DOM = "GENERATOR-DOM",
        MENU_GENERATOR_SUBDOM = "GENERATOR-SUBDOM",
        docInfoFlags = {
            compInfo: true,
            imageInfo: true,
            layerInfo: true,
            expandSmartObjects: false,
            getTextStyles: true,
            getFullTextStyles: true,
            getCompLayerSettings: true,
            selectedLayers: false,
            getDefaultLayerFX: true,
            getPathData: true
        },
        _docInfoCache = {},
        isListeningToGenerator = false;

    function findLayerIdForIndex(layers, index) {
        var i,
            ret;
        for (i = 0; i < layers.length; i++) {
            if (layers[i].index === index) {
                return layers[i].id;
            }
            if (layers[i].layers && layers[i].layers.length > 0) {
                ret = findLayerIdForIndex(layers[i].layers, index);
                if (isFinite(ret)) {
                    return ret;
                }
            }
        }
    }


    function onGeneratorDOMMenuClick(event) {
        if (event.generatorMenuChanged.name === MENU_GENERATOR_DOM ||
            event.generatorMenuChanged.name === MENU_GENERATOR_SUBDOM) {

            _G.evaluateJSXFile(__dirname + "/jsx/changeColorMode.jsx", {}).then(function (origMode) {
                if (typeof origMode === "string") {
                    origMode = JSON.parse(origMode);
                }
                _G.getDocumentInfo(null, docInfoFlags).then(
                    function (gDoc) {
                        var doc = JSON.parse(JSON.stringify(gDoc)),
                            subTree = false,
                            layerId;

                        if (event.generatorMenuChanged.name === MENU_GENERATOR_SUBDOM && doc.selection.length > 0) {
                            //get the selected layer's id and use it to get the sub-tree
                            subTree = true;
                            layerId = findLayerIdForIndex(doc.layers, doc.selection[0]);

                            console.log("***** LayerId: " + layerId + " from " + doc.selection[0]);
                        }

                        generatorPlus.patchGenerator(doc, _G, undefined, undefined, subTree, layerId, 1.0).then(function () {
                            printDebug(doc);
                        });
                    },
                    error);
                _G.evaluateJSXFile(__dirname + "/jsx/changeColorMode.jsx", { colorMode: origMode.colorMode });
            });
        }
    }

    function init(generator) {
        _G = generator;

        //TBD: only do this when debug is enabled in config

        _G.addMenuItem(MENU_GENERATOR_DOM, "Copy svgOM", true, false);
        _G.addMenuItem(MENU_GENERATOR_SUBDOM, "Copy svgOM for layer", true, false);
        _G.onPhotoshopEvent("generatorMenuChanged", onGeneratorDOMMenuClick);
    }

    function invalidateDocInfoCache() {
        _docInfoCache = {};
    }

    function getCachedDocInfo(generator, docId) {
        if (!isListeningToGenerator) {
            isListeningToGenerator = true;
            generator.onPhotoshopEvent("imageChanged", invalidateDocInfoCache);
            generator.onPhotoshopEvent("generatorMenuChanged", invalidateDocInfoCache);
        }

        _docInfoCache[docId] = _docInfoCache[docId] || {};

        var cacheInfo = _docInfoCache[docId],
            docInfoDeferred = Q.defer();

        if (cacheInfo._lastDocInfo) {
            return Q.resolve(cacheInfo._lastDocInfo);
        } else {
            if (cacheInfo._lastDocInfoPromise) {
                return cacheInfo._lastDocInfoPromise;
            } else {
                cacheInfo._lastDocInfoPromise = docInfoDeferred.promise;

                generator.evaluateJSXFile(__dirname + "/jsx/normalizeDoc.jsx", {}).then(function (origMode) {
                    if (typeof origMode === "string") {
                        origMode = JSON.parse(origMode);
                    }
                    generator.getDocumentInfo(docId, docInfoFlags).then(function (doc) {
                        cacheInfo._lastDocInfoPromise = undefined;
                        cacheInfo._lastDocInfo = doc;
                        docInfoDeferred.resolve(doc);
                    }, function (err) {
                        docInfoDeferred.reject(err);
                    }).finally(function () {
                        generator.evaluateJSXFile(__dirname + "/jsx/normalizeDoc.jsx", { historyPos: origMode.historyPos, colorMode: origMode.colorMode });
                    });
                });
                return cacheInfo._lastDocInfoPromise;
            }
        }
    }

    function getGeneratorSVG(generator, params, logger) {
        var OMG = require("./svgOMGenerator.js"),
            svgWriter = require("./svgWriter.js"),
            deferedResult = Q.defer(),
            layerSpec,
            layerScale,
            targetWidth,
            targetHeight,
            docId,
            compId,
            constrainToDocBounds,
            cropRect,
            clipToArtboardBounds,
            isResponsive,
            artboardBounds,
            isArtboard;

        compId = params.compId;
        layerSpec = params.layerSpec;
        layerScale = params.layerScale;
        targetWidth = params.targetWidth;
        targetHeight = params.targetHeight;
        constrainToDocBounds = params.constrainToDocBounds;
        cropRect = params.cropRect;
        docId = params.documentId;
        clipToArtboardBounds = params.clipToArtboardBounds;
        isResponsive = params.isResponsive;
        artboardBounds = params.artboardBounds;

        isArtboard = params.isArtboard;

        generator.evaluateJSXString("app.activeDocument.id").then(function (activeDocId) {
            if (docId !== activeDocId) {
                deferedResult.reject("svgOMG only works on the active document");
            } else {
                getCachedDocInfo(generator, docId).then(
                    function (document) {
                        var doc = JSON.parse(JSON.stringify(document)),
                            cropToSingleLayer = typeof layerSpec == "number",
                            svgWriterErrors = [];
                        generatorPlus.patchGenerator(doc, generator, compId, cropToSingleLayer, constrainToDocBounds,
                                                    layerSpec, layerScale, svgWriterErrors).then(function () {
                            if (layerSpec === "all") {
                                layerSpec = null;
                            }
                            logger && logger.info("SVGOMG Document: " + JSON.stringify(doc));
                            logger && logger.info("SVGOMG Params: " + JSON.stringify(params));
                            var svgOM = OMG.extractSVGOM(doc, { layerSpec: layerSpec, errors: svgWriterErrors }),
                                svgOut = svgWriter.printSVG(svgOM, {
                                    trimToArtBounds: cropToSingleLayer,
                                    preserveAspectRatio: "xMidYMid",
                                    scale: layerScale,
                                    targetWidth: targetWidth,
                                    targetHeight: targetHeight,
                                    constrainToDocBounds: constrainToDocBounds,
                                    cropRect: cropRect,
                                    clipToArtboardBounds: clipToArtboardBounds,
                                    isResponsive: isResponsive,
                                    fillFilter: true,
                                    artboardBounds: artboardBounds,
                                    isArtboard: isArtboard
                                }, svgWriterErrors);
                            logger && logger.info("SVGOMG Out: " + svgOut);
                            deferedResult.resolve({
                                svgText: svgOut,
                                errors: svgWriterErrors
                            });
                        });
                    },
                    function (err) {
                        console.warn("error with SVGOMG: " + err);
                        deferedResult.reject(err);
                    });
            }
        });
        return deferedResult.promise;
    }

    module.exports.init = init;
    module.exports.getGeneratorSVG = getGeneratorSVG;

}());
