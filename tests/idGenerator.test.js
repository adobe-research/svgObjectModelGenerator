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
    ID = require("../idGenerator.js"),
    sinon = require('sinon');

describe('idGenerator', function (){

    var sandbox = sinon.sandbox.create();

    beforeEach(function () {
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("test regular ID generation", function () {
        var idGen = new ID();

        expect(idGen.getUnique("gradient")).to.equal("gradient-1");
        expect(idGen.getUnique("pattern")).to.equal("pattern-1");
        expect(idGen.getUnique("gradient")).to.equal("gradient-2");
    });

    it("test GUID generation", function () {
        var idGen = new ID("unique"),
            id1 = idGen.getUnique(),
            id2 = idGen.getUnique();

        expect(id1.length).to.equal(36);
        expect(id2.length).to.equal(36);
        expect(id1).to.not.equal(id2);
    });

    it("test minimal ID generation", function () {
        var idGen = new ID("minimal");

        expect(idGen.getUnique()).to.equal("a");
        expect(idGen.getUnique()).to.equal("b");

        for (var i = 0; i < 100; ++i) {
            idGen.getUnique();
        }

        expect(idGen.getUnique()).to.equal("cy");


        for (var i = 0; i < 537373; ++i) {
            idGen.getUnique();
        }

        expect(idGen.getUnique()).to.equal("adobe");

        idGen.reset();

        expect(idGen.getUnique()).to.equal("a");
    });
});
