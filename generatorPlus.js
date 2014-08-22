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

/* jshint bitwise: false, strict: false, quotmark: false, forin: false,
   multistr: true, laxbreak: true, maxlen: 255, esnext: true */
/* global $, app, File, ActionDescriptor, ActionReference, executeAction, PSLayerInfo,
   UnitValue, DialogModes, cssToClip, stripUnits, round1k, GradientStop, stringIDToTypeID,
   Folder, kAdjustmentSheet, kLayerGroupSheet, kHiddenSectionBounder, kVectorSheet,
   kTextSheet, kPixelSheet, kSmartObjectSheet, Units, params, runGetLayerSVGfromScript,
   typeNULL, eventSelect, charIDToTypeID, classDocument, classLayer */
/* exported runCopyCSSFromScript */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, bitwise: true */
/*global define: true, require: true, __dirname: true, module: true */

/* Patch generator with extra data we need to make SVG */

(function () {
    "use strict";
    
    var Q = require("q"),
        svgWriterUtils = require("./svgWriterUtils"),
        fs = require("fs");
    
    function GeneratorPlus() {
        
        this.findLayerComp = function(psd, compId) {
            var cmp;
            if (compId) {
                psd.comps.forEach(function (comp) {
                    if (comp.id == compId) {
                        cmp = comp;
                    }
                });
            } else {
                cmp = {
                };
            }
            return cmp;
        };
        
        this.findCompLayerEffects = function (layerId, layerComp) {
            var ret;
            if (layerComp && layerComp.layerSettings) {
                layerComp.layerSettings.forEach(function (layerSetting) {
                    if (layerSetting.id === layerId) {
                        ret = layerSetting.layerEffects;
                    }
                });
            }
            return ret;
        };
        
        this.patchGenerator = function (psd, _G, compId) {
            var layers = psd.layers,
                iL,
                lyr,
                patchDeferred = Q.defer(),
                promises = [],
                layerComp = this.findLayerComp(compId),
                patchLayerSVG;

            //console.log("PATCHING: " + JSON.stringify(psd));
            try {
            
            patchLayerSVG = function (layer) {

                var layerId = layer.id,
                    layerIndex = layer.index,
                    i,
                    layerType = layer.type,
                    childLyr,
                    jsxDeferred,
                    patchSettings;
                
                if (layerType === "shapeLayer" || layerType === "textLayer" || layerType === "layer") {
                    
                    svgWriterUtils.extend(true, layer, { layerEffects: this.findCompLayerEffects(layer.id, layerComp) });
                    
                    jsxDeferred = Q.defer();
                    promises.push(jsxDeferred.promise);
                    
                    //pull in extra info... JSX!
                    
                    patchSettings = {
                        layerIndex: layerIndex,
                        pathData: layerType === "shapeLayer",
                        fxSolidFill: true
                    };
                    
                    //TBD: opportunity to cache .base64-ized layers and speed this up when they don't all change
                    
                    _G.evaluateJSXFile(__dirname + '/jsx/patchShapeLayer.jsx', patchSettings).then(function (oPatch) {
                        
                        var imgFilePath;
                        
                        if (typeof oPatch  === 'string') {
                            oPatch = JSON.parse(oPatch);
                        }
                        
                        if (oPatch.pathData) {
                            layer.path.rawPathData = oPatch.pathData;
                        }

                        if(oPatch.pixelDataPtr) {
                            
                            imgFilePath = oPatch.pixelDataPtr;
                            
                            fs.readFile(imgFilePath, 'utf8', function (err, rawPx) {
                                //then clean up the file
                                if (err) {
                                    console.warn('Error from reading base64 image ' + err);
                                    return;
                                }
                                
                                layer.rawPixel = 'data:img/png;base64,' + rawPx;
                                
                                fs.unlink(imgFilePath, function (er2) {
                                    if (er2) {
                                        console.warn('Error cleaning up temp file: ' + er2);
                                    }
                                });
                                
                                jsxDeferred.resolve();
                            }.bind(this));
                        } else {
                            if (oPatch.pixelData) {
                                layer.rawPixel = oPatch.pixelData;
                            }
                            jsxDeferred.resolve();
                        }
                        
                    }, function (err) {
                        console.log("ERROR " + err);
                    });
                } else if (layerType === "layerSection") {
                    for (i = 0; i < layer.layers.length; i++) {
                        childLyr = layer.layers[i];
                        patchLayerSVG(childLyr);
                    }
                }
            }.bind(this);
        
            for (iL = 0; iL < layers.length; iL++) {
                lyr = layers[iL];
                patchLayerSVG(lyr);
            }
            
            Q.all(promises).then(function () {
                patchDeferred.resolve();
            });
                
            } catch (excep) {
                console.log("EXCEP " + excep.stack);
            }
            
            return patchDeferred.promise;
        };
	}

	module.exports = new GeneratorPlus();
}());
