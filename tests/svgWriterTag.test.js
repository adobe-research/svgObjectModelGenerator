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


/*global require: true, describe: true, it: true */

var expect = require("chai").expect,
    Tag = require("../svgWriterTag.js");

describe("svgWriterTag", function () {

    describe("our SVG tag", function () {

        it("knows how to create itself", function () {
            var tag = new Tag("circle");
            expect(String(tag)).to.equal("<circle/>\n");
        });

        it("knows how to apply attribute after creation", function () {
            var tag = new Tag("circle");
            tag.setAttribute("r", 10);
            expect(String(tag)).to.equal('<circle r="10"/>\n');
        });

        it("knows how to apply attributes after creation", function () {
            var tag = new Tag("circle");
            tag.setAttributes({
                cx: 10,
                cy: 20,
                r: 30
            });
            expect(String(tag)).to.equal('<circle cx="10" cy="20" r="30"/>\n');
        });

        it("trims leading and trailing white-spaces from number-lists", function () {
            var tag = new Tag("feFuncR");
            tag.setAttributes({
                tableValues: "  10  0  "
            });
            expect(String(tag)).to.equal('<feFuncR tableValues="10 0"/>\n');
        });

        it("knows how to apply attributes on creation", function () {
            var tag = new Tag("circle", {
                cx: 10,
                cy: 20,
                r: 30
            });
            expect(String(tag)).to.equal('<circle cx="10" cy="20" r="30"/>\n');
        });

        it("knows how to overwrite attributes", function () {
            var tag = new Tag("circle", {
                cx: 10,
                cy: 20,
                r: 30
            });
            tag.setAttribute("r", 15);
            expect(String(tag)).to.equal('<circle cx="10" cy="20" r="15"/>\n');
        });

        it("knows how to deal with units", function () {
            var tag = new Tag("circle", {
                cx: "10em",
                cy: "20%",
                r: "30px"
            });
            expect(String(tag)).to.equal('<circle cx="10em" cy="20%" r="30"/>\n');
        });

        it("knows how to round", function () {
            var tag = new Tag("circle", {
                r: 10.555555
            });
            expect(String(tag)).to.equal('<circle r="10.556"/>\n');
        });

        it("knows how to round value with units", function () {
            var tag = new Tag("circle", {
                r: "10.555555em"
            });
            expect(String(tag)).to.equal('<circle r="10.556em"/>\n');
        });

        it("knows how to round sequence values", function () {
            var tag = new Tag("circle", {
                "stroke-dasharray": "1.555555em 2.55555555px 3.5555555%"
            });
            expect(String(tag)).to.equal('<circle stroke-dasharray="1.556em 2.556 3.556%"/>\n');
        });

        it("knows how to write attributes", function () {
            var tag = new Tag("circle", {
                fill: "#F0E68C",
                cx: 10,
                cy: "0px"
            });
            expect(tag.writeAttribute("fill")).to.equal(' fill="#F0E68C"');
            expect(tag.writeAttribute("cx")).to.equal(' cx="10"');
            expect(tag.writeAttribute("cy")).to.equal("");
        });

        it("knows how to write attributes that are not there", function () {
            var tag = new Tag("circle");
            expect(tag.writeAttribute("fill", "#F0E68C")).to.equal(' fill="#F0E68C"');
        });

        it("knows how to be a text", function () {
            var tag = new Tag("#text", "hello world");
            expect(String(tag)).to.equal("hello world");
        });

        it("knows how to change value as a text", function () {
            var tag = new Tag("#text", "hello world");
            tag.setAttribute("#text", "good buy, world");
            expect(String(tag)).to.equal("good buy, world");
        });

        it("knows how to be a comment", function () {
            var tag = new Tag("#comment", "hello world");
            expect(String(tag)).to.equal("<!-- hello world -->\n");
        });

        it("knows how to have children", function () {
            var tag = new Tag("g");
            tag.appendChild(new Tag("circle"), new Tag("rect"));
            expect(String(tag)).to.equal("<g>\n<circle/>\n<rect/>\n</g>\n");
        });

        it("knows how to have children as a text tag", function () {
            var tag = new Tag("text");
            tag.appendChild(new Tag("#text", "testing..."));
            expect(String(tag)).to.equal("<text>testing...</text>\n");
        });

        it("knows how to have text children as a text tag", function () {
            var tag = new Tag("text");
            tag.appendChild("testing...");
            expect(String(tag)).to.equal("<text>testing...</text>\n");
        });

        it("knows how to be a tag list", function () {
            var tag = new Tag("");
            tag.appendChild(new Tag("circle"), new Tag("rect"));
            expect(String(tag)).to.equal("<circle/>\n<rect/>\n");
        });

    });
});
