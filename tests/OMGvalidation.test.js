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

/*global require: true, describe: true, beforeEach: true, afterEach: true, it: true */

var expect = require("chai").expect,
    fs = require("fs"),
    agcValidator = require("../agcValidator.js"),
    database = require("./test-database.js"),
    sinon = require("sinon");


describe("AGC validation", function () {

    var sandbox = sinon.sandbox.create();

    beforeEach(function () {
    });

    afterEach(function () {
        sandbox.restore();
    });

    it("Valid most simple AGC", function () {
        var AGC = {
                "version": "0.1.0",
                "children": []
            },
            result = agcValidator.validateAGC(AGC);

        expect(result.errors.length).to.equal(0);
    });


    it("Invalid simple AGC", function () {
        var AGC = {
                children: []
            },
            result = agcValidator.validateAGC(AGC);

        expect(result.errors.length).to.equal(1);
        expect(result.errors[0].message).to.equal("requires property \"version\"");
    });

    it("Group opacity AGC test", function () {
        var AGC = JSON.parse(fs.readFileSync("./tests/data/group-opacity-om.json")),
            result = agcValidator.validateAGC(AGC);

        for (var i = 0; i < result.errors.length; ++i) {
            console.log(JSON.stringify(result.errors[i], null, " "));
        }
        expect(result.errors.length).to.equal(0);
    });
});
