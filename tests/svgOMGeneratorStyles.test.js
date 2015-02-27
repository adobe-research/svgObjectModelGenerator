// Copyright (c) 2015 Adobe Systems Incorporated. All rights reserved.
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
    OMG = require("../svgOMGeneratorStyles.js"),
    sinon = require('sinon');

describe('SVGOMGeneratorStyles', function (){
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });

    it("should ignore default blend modes", function (){
        
        expect(OMG.fetchBlendMode({ blendOptions: { mode: "screen" }})).to.equal("screen");
        expect(OMG.fetchBlendMode({ blendOptions: { mode: "pass-Through" }})).to.equal(undefined);
        expect(OMG.fetchBlendMode({ blendOptions: { mode: "normal" }})).to.equal(undefined);
    });
    
});
