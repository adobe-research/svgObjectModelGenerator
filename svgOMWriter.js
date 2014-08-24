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

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, bitwise: true */
/*global define: true, require: true, module: true */

/* Help construct the svgOM */

(function () {
"use strict";

	function SVGOMWriter() {
        
		var _root = {
                children: []
		    },
            _currentNodeStack = [];
        
        this.peekCurrent = function () {
            if (_currentNodeStack.length > 0) {
                return _currentNodeStack[_currentNodeStack.length - 1];
            }
            return null;
        };
        this.pushCurrent = function(oNode) {
            _currentNodeStack.push(oNode);
        };
        this.popCurrent = function () {
            _currentNodeStack.pop();
        };
        this.pushCurrent(_root);
        
        this.setDocOffset = function (offX, offY) {
            _root.offsetX = offX;
            _root.offsetY = offY;
        };
        
        this.setDocViewBox = function (bounds) {
            _root.viewBox = bounds;
        };

        this.setDocPxToInchRatio = function (pxToInchRatio) {
            _root.pxToInchRatio = pxToInchRatio;
        };

        this.setDocGlobalLight = function (globalLight) {
            _root.globalLight = globalLight;
        };

		this.addSVGNode = function (nodeID, nodeType, nodeVisible) {
			var n = {
				id: nodeID,
                type: nodeType,
                visible: nodeVisible,
				style: {},
                children: []
			};
            this.peekCurrent().children.push(n);
			return n;
		};

		this.addFontRule = function() {
			var r = {
				"rule-type": "font",
				"style": {}
			};
            
            //Undefined... comment out until this is wired in
            //_appendRule(r);

			return r.style;
		};
        
		
		this.toSVGOM = function() {
			return _root;
		};
	}

	module.exports = SVGOMWriter;
    
}());