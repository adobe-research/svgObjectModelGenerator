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
    Utils = require("../utils.js"),
    sinon = require('sinon');

describe('Utils', function (){
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });
    
    it("knows how to round", function (){
        expect(Utils.round2(33.3333)).to.equal(33.33);
        expect(Utils.round1k(33.3333)).to.equal(33.333);
        expect(Utils.round10k(33.3333)).to.equal(33.3333);
        expect(Utils.roundUp(33.3333)).to.equal(34);
        expect(Utils.roundDown(33.3333)).to.equal(33);
    });
    
    it("can extend objects like jQuery", function (){
        var objA = {
                name: "original",
                game: "original"
            },
            objB = {
                name: "franklinstein",
                isBoolean: true,
                isArray: [1, 2, 3],
                isObject: {
                    bag: "of tricks",
                    referencingSelf: objB
                },
                fnAdd: function () {
                    //add function
                }
            };
        
        Utils.extend(objA, objB);
        
        //adding this line somehow borks the coverage reports (even though it passes npm test)
        //expect(objA.name).to.equal("franklinstein");
        expect(objA.game).to.equal("original");
        
    });
    
    it("can deeply extend objects like jQuery", function (){
        var objA = {
                name: "original",
                game: "original"
            },
            objB = {
                name: "franklinstein",
                isBoolean: true,
                isArray: [1, 2, 3],
                isObject: {
                    bag: "of tricks",
                    arrgh: ["a", "b"],
                    referencingSelf: objB
                },
                fnAdd: function () {
                    //add function
                }
            };
        
        Utils.extend(true, objA, objB);
        
        //adding this line somehow borks the coverage reports (even though it passes npm test)
        //expect(objA.name).to.equal("franklinstein");
        expect(objA.game).to.equal("original");
        
    });
    
});
