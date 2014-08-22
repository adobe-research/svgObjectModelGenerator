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
/*global define: true, require: true, __dirname: true, module: true, Buffer: true */

/* Patch generator with extra data we need to make SVG */

(function () {
    "use strict";
    
    var Q = require("q"),
        svgWriterUtils = require("./svgWriterUtils"),
        svgOMGenerator = require("./svgOMGenerator"),
        fs = require("fs"),
        tmp = require("tmp");
    
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
                    if (layerSetting.enabled && layerSetting.layerID === layerId) {
                        ret = layerSetting.layerEffects;
                    }
                });
            }
            return ret;
        };
        
        
        this.rasterBase64 = function (_G, docId, layerId, resolution) {
            var pixmapSettings = {},
                rasterDeferred = Q.defer();
            try {
            
                //unless we can tell when to use png-8 there is no point in turning on pngQuant
                //if (this._usePngquant !== undefined) {
                    //pixmapSettings.usePngquant = this._usePngquant;
                //}

                if (this._useSmartScaling !== undefined) {
                    pixmapSettings.useSmartScaling = this._useSmartScaling;
                }

                if (this._includeAncestorMasks !== undefined) {
                    pixmapSettings.includeAncestorMasks = this._includeAncestorMasks;
                }

                if (this._convertColorSpace !== undefined) {
                    pixmapSettings.convertToWorkingRGBProfile = this._convertColorSpace;
                }

                if (this._allowDither !== undefined) {
                    pixmapSettings.allowDither = this._allowDither;
                    if (this._allowDither) {
                        // force dithering, even if it is off in the user's color settings,
                        // since they explicitly enabled it in Generator
                        pixmapSettings.useColorSettingsDither = false;
                    }
                }

                if (this._interpolationType !== undefined) {
                    pixmapSettings.interpolationType = this._interpolationType;
                }

                _G.getPixmap(docId, layerId, pixmapSettings).then(function (pixmap) {
                    var padding = pixmapSettings.hasOwnProperty("getPadding") ?
                            pixmapSettings.getPadding(pixmap.width, pixmap.height) : undefined,
                        format = "png",
                        ppi = resolution,
                        oSettings = {
                            format: format,
                            ppi: ppi,
                            padding: padding
                        };
                    
                    Q.ninvoke(tmp, "tmpName").then(function (tmpPath) {
                        _G.savePixmap(pixmap, tmpPath, oSettings).then(function (savedFilePath) {
                            fs.readFile(savedFilePath, function (err, rawPx) {
                                if (!err) {
                                    fs.unlink(savedFilePath, function (er2) {
                                        if (er2) {
                                            console.warn('Error cleaning up temp file: ' + er2);
                                        }
                                        var buf = new Buffer(rawPx);
                                        rasterDeferred.resolve(buf.toString("base64"));
                                    });
                                } else {
                                    rasterDeferred.reject(err);
                                }
                            });
                        });
                    },
                    function (erPath) {
                        console.warn("Error getting temp file location " + erPath);
                        throw new Error(erPath);
                    });
                });
                
                return rasterDeferred.promise;
            } catch (exRaster) {
                console.warn("raster error " + exRaster + " with " + exRaster.stack);
                var ret = Q.defer();
                ret.reject(exRaster);
                return ret;
            }
        };
        
        
        this.patchGenerator = function (psd, _G, compId) {
            var layers = psd.layers,
                docId = psd.id,
                docResolution = psd.resolution || 72.2,
                iL,
                lyr,
                patchDeferred = Q.defer(),
                promises = [],
                layerComp = this.findLayerComp(psd, compId),
                patchLayerSVG;
            
            try{
                patchLayerSVG = function (layer) {

                    var layerId = layer.id,
                        layerIndex = layer.index,
                        i,
                        layerType = layer.type,
                        childLyr,
                        jsxDeferred,
                        rasterDeferred,
                        patchSettings;

                    if (layerType === "shapeLayer" || layerType === "textLayer" || layerType === "layer") {
                        
                        svgWriterUtils.extend(true, layer, { layerEffects: this.findCompLayerEffects(layer.id, layerComp) });
    
                        jsxDeferred = Q.defer();
                        promises.push(jsxDeferred.promise);

                        if(svgOMGenerator.layerShouldBeRasterized(layer)) {
                            rasterDeferred = Q.defer();
                            promises.push(rasterDeferred.promise);

                                this.rasterBase64(_G, docId, layer.id, docResolution).then(function (result) {
                                    layer.rawPixel = 'data:img/png;base64,' + result;
                                    rasterDeferred.resolve();
                                }.bind(this),
                                function (err) {
                                    console.warn("Error " + err + " stack " + err.stack);
                                    rasterDeferred.reject(err);
                                });
                        }

                        patchSettings = {
                            layerIndex: layerIndex,
                            pathData: layerType === "shapeLayer",
                            fxSolidFill: true
                        };

                        //TBD: opportunity to cache .base64-ized layers and speed this up when they don't all change

                        _G.evaluateJSXFile(__dirname + '/jsx/patchShapeLayer.jsx', patchSettings).then(function (oPatch) {

                            if (typeof oPatch  === 'string') {
                                oPatch = JSON.parse(oPatch);
                            }

                            if (oPatch.pathData) {
                                layer.path.rawPathData = oPatch.pathData;
                            }

                            jsxDeferred.resolve();

                        }, function (err) {
                            console.log("ERROR " + err);
                            jsxDeferred.reject(err);
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

            } catch(exStop) {
                console.warn("patchGenerator error: " + exStop + " with " + exStop.stack);
                patchDeferred.reject(exStop);
            }
    
            return patchDeferred.promise;
        };
	}

	module.exports = new GeneratorPlus();
}());
