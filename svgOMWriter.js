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

/* Help construct the AGC */

(function () {
    "use strict";
    var ID = require("./idGenerator.js");

    function SVGOMWriter(errors) {

        var _root = {
                children: [],
                resources: {
                    clipPaths: {},
                    filters: {},
                    gradients: {},
                    masks: {},
                    patterns: {}
                },
                artboards: {},
                meta: {
                    PS: {}
                },
                version: "1.5.0"
            },
            _currentNodeStack = [],
            _docBounds,
            _oldText = {
                "text": true,
                "tspan": true,
                "textPath": true
            };

        this._root = _root;

        this.errors = errors || [];

        this.ID = new ID();

        this._dpi = function () {
            return _root && _root.rasterResolution ? _root.rasterResolution : 72;
        };

        this.peekCurrent = function () {
            if (_currentNodeStack.length > 0) {
                return _currentNodeStack[_currentNodeStack.length - 1];
            }
            return null;
        };
        this.pushCurrent = function (oNode) {
            _currentNodeStack.push(oNode);
        };
        this.popCurrent = function () {
            _currentNodeStack.pop();
        };
        this.pushCurrent(_root);

        this.resources = function () {
            return _root.resources;
        };

        this.docBounds = function () {
            return _docBounds;
        };

        this.setDocBounds = function (bounds) {
            _docBounds = bounds;
            _root.viewSource = {
                x: bounds.left,
                y: bounds.top,
                width: bounds.right - bounds.left,
                height: bounds.bottom - bounds.top
            };
        };

        this.setDocTitle = function (name) {
            _root.name = name;
        };

        this.setDocPxToInchRatio = function (pxToInchRatio) {
            _root.rasterResolution = pxToInchRatio;
        };

        this.setArtboard = function (id, name, bounds) {
            _root.artboards[id] = {
                name: name,
                x: bounds.left,
                y: bounds.top,
                width: bounds.right - bounds.left,
                height: bounds.bottom - bounds.top
            };
        };

        this.setDocGlobalLight = function (globalLight) {
            _root.meta.PS.globalLight = globalLight;
        };

        this.addChild = function (agcNode) {
            var parent = this.peekCurrent(),
                children;
            if (parent.type && !_oldText[parent.type]) {
                parent[parent.type].children = parent[parent.type].children || [];
                children = parent[parent.type].children;
            } else {
                parent.children = parent.children || [];
                children = parent.children;
            }
            children.push(agcNode);
        };

        this.addAGCNode = function (nodeType, nodeVisible) {
            var agcNode = {
                    type: nodeType,
                    visible: nodeVisible,
                    style: {}
                };
            // FIXME: We do that as long as text doesn't follow AGC.
            if (!_oldText[nodeType]) {
                agcNode[nodeType] = {};
            }
            this.addChild(agcNode);
            return agcNode;
        };

        this.toAGC = function () {
            return _root;
        };
    }

    module.exports = SVGOMWriter;

}());
