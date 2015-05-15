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

var expect = require("chai").expect,
    utils = require("../utils.js"),
    data = require("./paths/data.json"),
    optimisePath = utils.optimisePath,
    parsePath = utils.parsePath,
    sinon = require("sinon");

describe("Path Optimisation ★", function () {

    describe("Optimizer", function () {

        // it("knows how to parse path strings", function () {
        //     for (var i = 0, ii = data.originals.length; i < ii; i++) {
        //         expect(JSON.stringify(parsePath(data.originals[i]))).to.equal(data.parsed[i]);
        //     }
        // });

        // it("knows how to optimise path strings", function () {
        //     for (var i = 0, ii = data.originals.length; i < ii; i++) {
        //         expect(optimisePath(data.originals[i])).to.equal(data.optimised[i]);
        //     }
        // });

    });

});
