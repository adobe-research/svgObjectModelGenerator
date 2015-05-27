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

/* Patch generator with extra data we need to make SVG */

(function () {
    "use strict";

    var Q = require("q"),
        Utils = require("./utils"),
        svgOMGenerator = require("./svgOMGenerator"),
        fs = require("fs"),
        resolve = require("path").resolve,
        tmp = require("tmp"),
        omgUtils = require("./svgOMGeneratorUtils");

    function GeneratorPlus() {

        this.findLayerComp = function (psd, compId) {
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

        this.rasterBase64 = function (_G, docId, layerId, resolution, pixmapSettings) {
            var rasterDeferred = Q.defer();
            try {

                //unless we can tell when to use png-8 there is no point in turning on pngQuant
                //if (this._usePngquant !== undefined) {
                //    pixmapSettings.usePngquant = this._usePngquant;
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
                                            console.warn("Error cleaning up temp file: " + er2);
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

        this.patchGenerator = function (psd, _G, compId, cropToSingleLayer, constrainToDocBounds, rootLayerId, layerScale, aErrors) {
            var layers = psd.layers,
                docId = psd.id,
                docResolution = psd.resolution || 72.2,
                clipRootBoundsTo = constrainToDocBounds ? psd.bounds : undefined,
                iL,
                lyr,
                patchDeferred = Q.defer(),
                promises = [],
                layerComp = this.findLayerComp(psd, compId),
                patchLayerSVG,
                _hasBackgroundLayer = false,
                layersToPatch = {},
                jsxBatchInit = fs.readFileSync(resolve(__dirname, __dirname + "/jsx/patchShapeLayers-init.jsx"), {encoding: "utf8"}),
                jsxBatchFin = fs.readFileSync(resolve(__dirname, __dirname + "/jsx/patchShapeLayers-fin.jsx"), {encoding: "utf8"}),
                jsxPatch = [jsxBatchInit],
                jsxDeferred;

            try {
                patchLayerSVG = function (layer, offsetSettings, bUnderRoot) {

                    var layerId = layer.id,
                        layerIndex = layer.index,
                        i,
                        layerType = layer.type,
                        childLyr,
                        rasterDeferred,
                        patchSettings,
                        deltaX,
                        deltaX2,
                        deltaY,
                        deltaY2,
                        lineWidth = 0;
                    if (layerType === "backgroundLayer") {
                        _hasBackgroundLayer = true;
                    }

                    if (cropToSingleLayer && rootLayerId === layerId) {
                        bUnderRoot = true;
                        if (clipRootBoundsTo) {
                            offsetSettings = {
                                xOffset: -Math.max(clipRootBoundsTo.left, layer.bounds.left),
                                yOffset: -Math.max(clipRootBoundsTo.top, layer.bounds.top)
                            };
                        } else {
                            offsetSettings = {
                                xOffset: -layer.bounds.left,
                                yOffset: -layer.bounds.top
                            };
                        }
                    }

                    //bUnderRoot is to only crop to the sub-tree being generatored...
                    if ((!cropToSingleLayer || bUnderRoot) && (layerType === "shapeLayer" || layerType === "textLayer" || layerType === "layer")) {

                        Utils.extend(true, layer, { layerEffects: this.findCompLayerEffects(layer.id, layerComp) });

                        if (svgOMGenerator.layerShouldBeRasterized(layer, aErrors)) {

                            //force it to image now since we are going to treat it as image
                            layer.type = "layer";

                            rasterDeferred = Q.defer();
                            promises.push(rasterDeferred.promise);

                            //figure out the target size...
                            var layerBndsFx = layer.boundsWithFX ? layer.boundsWithFX : layer.bounds,
                                pixmapSettings = _G.getPixmapParams({
                                    width: layerScale * (layerBndsFx.right - layerBndsFx.left),
                                    height: layerScale * (layerBndsFx.bottom - layerBndsFx.top),
                                    scaleX: layerScale,
                                    scaleY: layerScale,
                                    scale: layerScale
                                }, layerBndsFx, layerBndsFx);
                            this.rasterBase64(_G, docId, layer.id, docResolution, pixmapSettings).then(function (result) {
                                //TBD: is image better?
                                //layer.rawPixel = 'data:image/png;base64,' + result;
                                layer.rawPixel = "data:img/png;base64," + result;
                                rasterDeferred.resolve();
                            },
                            function (err) {
                                console.warn("Error " + err + " stack " + err.stack);
                                rasterDeferred.reject(err);
                            });
                        }

                        if (!_hasBackgroundLayer) {
                            layerIndex += 1;
                        }

                        patchSettings = {
                            layerIndex: layerIndex,
                            layerId: layerId,
                            pathData: layerType === "shapeLayer",
                            fxSolidFill: true
                        };
                        if (cropToSingleLayer && offsetSettings) {
                            if (layer.boundsWithFX) {
                                deltaX = layer.boundsWithFX.right - layer.bounds.right;
                                deltaX2 = layer.bounds.left - layer.boundsWithFX.left;
                                deltaY = -layer.boundsWithFX.top + layer.bounds.top;
                                deltaY2 = layer.boundsWithFX.bottom - layer.bounds.bottom;
                            } else {
                                deltaX = 0;
                                deltaY = 0;
                                deltaX2 = 0;
                                deltaY2 = 0;
                            }

                            if (layer.strokeStyle && layer.strokeStyle.strokeEnabled && layer.strokeStyle.strokeStyleLineWidth) {
                                lineWidth = omgUtils.boundInPx(layer.strokeStyle.strokeStyleLineWidth, docResolution);
                            } else if (layer.layerEffects && layer.layerEffects.frameFX && layer.layerEffects.frameFX.enabled && layer.layerEffects.frameFX.size) {
                                lineWidth = layer.layerEffects.frameFX.size;
                            }

                            deltaX = (lineWidth + deltaX + deltaX2) / 2.0;
                            deltaY = (lineWidth + deltaY + deltaY2) / 2.0;

                            patchSettings.xOffset = offsetSettings.xOffset + deltaX;
                            patchSettings.yOffset = offsetSettings.yOffset + deltaY;
                        } else {
                            patchSettings.xOffset = 0;
                            patchSettings.yOffset = 0;
                        }

                        //TBD: opportunity to cache .base64-ized layers and speed this up when they don't all change

                        if (layerType === "shapeLayer") {
                            layersToPatch[patchSettings.layerId] = {
                                settings: patchSettings,
                                layer: layer
                            };
                        }

                    } else if (layerType === "layerSection" && layer.layers) {
                        for (i = 0; layer.layers && i < layer.layers.length; i++) {
                            childLyr = layer.layers[i];
                            patchLayerSVG(childLyr, offsetSettings, bUnderRoot);
                        }
                    }
                }.bind(this);

                //if there is a backgroundLayer we want to hit it first so we can adjust index values after
                //so we go through the list backwards
                if (layers) {
                    for (iL = layers.length - 1; iL >= 0; iL--) {
                        lyr = layers[iL];
                        patchLayerSVG(lyr);
                    }
                }
                //now do the consolidated JSX patch
                jsxDeferred = Q.defer();
                promises.push(jsxDeferred.promise);

                Object.keys(layersToPatch).forEach(function (patchLayerId) {
                    var patchSettings = layersToPatch[patchLayerId].settings;

                    jsxPatch.push("currentLayer = new PSLayerInfo(" + patchSettings.layerIndex + "); ");
                    jsxPatch.push("out = out + sep + \"\\\"" + patchLayerId + "\\\": { \\\"path\\\": \\\"\" + patchLayerPath(currentLayer, " + JSON.stringify(patchSettings) + ") + \"\\\", \\\"hasPatternOverlay\\\": \\\"\" + patchLayerPatternOverlay(currentLayer) + \"\\\" }\"; ");
                    jsxPatch.push("sep = \", \"; ");

                });
                jsxPatch.push(jsxBatchFin);

                _G.evaluateJSXString(jsxPatch.join("")).then(function (oPatch) {
                    try {
                        if (typeof oPatch === "string") {
                            oPatch = JSON.parse(oPatch);
                        }
                        if (oPatch.exception) {
                            jsxDeferred.reject(new Error("patchShapeLayers.jsx: " + oPatch.exception));
                        }
                        Object.keys(oPatch).forEach(function (patchedLayerId) {
                            lyr = layersToPatch[patchedLayerId].layer;
                            if (String(oPatch[patchedLayerId].hasPatternOverlay) === "true") {
                                lyr.layerEffects = lyr.layerEffects || {};
                                lyr.layerEffects.patternOverlay = { enabled: true };
                            }
                            lyr.path.rawPathData = oPatch[patchedLayerId].path;
                        });
                        jsxDeferred.resolve();
                    } catch (erPatch) {
                        console.warn("error patching " + erPatch + " " + erPatch.stack);
                        jsxDeferred.reject(erPatch);
                    }

                }, function (err) {
                    jsxDeferred.reject(err);
                });

                //all done...
                Q.all(promises).then(function () {
                    patchDeferred.resolve();
                });

            } catch (exStop) {
                console.warn("patchGenerator error: " + exStop + " with " + exStop.stack);
                patchDeferred.reject(exStop);
            }

            return patchDeferred.promise;
        };
    }

    module.exports = new GeneratorPlus();
}());
