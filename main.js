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

/*jslint node: true, nomen: true, vars:true, white:true */

(function () {
    "use strict";

    // node app -f plugins/my-plugin
    // where app is the path to app in generator-core, and plugins/my-plugin is the path to your plugin's folder

    var _G,// Generator 
        Q = require("q"); 
    
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
        
        _G.evaluateJSXFile(__dirname+'/jsx/copy.jsx', { clipboard: psd });
    }
    
    function error(err) {
        console.error('[svgOMG] Error: ', err);
    }
    
    var MENU_GENERATOR_DOM = 'GENERATOR-DOM',
        generatorPlus = require("./generatorPlus.js"),
        docInfoFlags = {
            compInfo:           true,
            imageInfo:          true,
            layerInfo:          true,
            expandSmartObjects: false,
            getTextStyles:      true,
            getFullTextStyles:    true,
            getCompLayerSettings: true,
            selectedLayers:       false,
            getDefaultLayerFX:    true
        };
    
    function onGeneratorDOMMenuClick(event) {
        _G.evaluateJSXFile(__dirname+"/jsx/changeColorMode.jsx", {}).then(function (origMode) {
            if (typeof(origMode) === "String") {
                origMode = JSON.parse(origMode);
            }
            _G.getDocumentInfo(null, docInfoFlags).then(
                function (document) {
                    var doc = JSON.parse(JSON.stringify(document));
                    generatorPlus.patchGenerator(doc, _G).then(function () {
                        printDebug(doc);
                    });
                }, 
                error);
            _G.evaluateJSXFile(__dirname+"/jsx/changeColorMode.jsx", { colorMode: origMode.colorMode });
        });
    }
    
    function init(generator) {
        _G = generator;
        
        _G.addMenuItem(MENU_GENERATOR_DOM, "Copy svgOM", true, false);
        _G.onPhotoshopEvent("generatorMenuChanged", onGeneratorDOMMenuClick);
    }

    function getGeneratorSVG(generator, params) {
        var deferedResult = Q.defer(),
            OMG = require("./svgOMGenerator.js"),
            svgWriter = require("./svgWriter.js"),
            layerSpec,
            layerScale,
            docId;
        
        layerSpec = params.layerSpec;
        layerScale = params.layerScale;
        docId = params.documentId;
        
        generator.getDocumentInfo(null, docInfoFlags).then(
            function (document) {
                var doc = JSON.parse(JSON.stringify(document));
                generatorPlus.patchGenerator(doc, generator).then(function () {
                    
                    if (typeof layerSpec === "number") {
            
                    }
                    
                    var svgOM = OMG.extractSVGOM(doc, { layerSpec: layerSpec }),
                        svgOut = svgWriter.printSVG(svgOM);
                    
                    deferedResult.resolve({svgText: svgOut});
                });
            }, 
            function (err) {
                console.warn("error with SVGOMG: " + err);
                deferedResult.reject(err);
            });
        
        return deferedResult.promise;
    }
    
    module.exports.init = init;
    module.exports.getGeneratorSVG = getGeneratorSVG;
    
}());
