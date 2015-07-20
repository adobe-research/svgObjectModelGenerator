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

/* Keep track of SVG data */

(function () {
    "use strict";

    // Types can be "minimal", "unique", "regular"
    function ID(type) {
        var docIDs = type == "minimal" ? {min: "`"} : {},
            _type = type,
            // NameStartChar ::= ":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] |
            //     [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] |
            //     [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
            // NameChar ::= NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
            reg1 = /^[_:a-zA-Z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u10000-\uEFFFF][\._\-:a-zA-Z0-9\u00B7\u0300-\u036F\u203F-\u2040\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u10000-\uEFFFF]*&/,
            reg2 = /^[^_:a-zA-Z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u10000-\uEFFFF]+/,
            reg3 = /[^\._\-:a-zA-Z0-9\u00B7\u0300-\u036F\u203F-\u2040\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u10000-\uEFFFF]+/g,

            // Will create minimal Ids in the format
            // a, b, c, ..., z, aa, ab, ..., az, ba, ...
            minimalId = function () {
                var s = docIDs.min,
                    pos = s.length - 1,
                    n,
                    replaceAtPos = function (S, i, c) {
                        return S.substr(0, i) + c + S.substr(i + c.length);
                    };
                do {
                    n = s.charCodeAt(pos);
                    if (n < 122) {
                        s = replaceAtPos(s, pos, String.fromCharCode(++n));
                        docIDs.min = s;
                        return s;
                    } else {
                        s = replaceAtPos(s, pos, "a");
                    }
                    --pos;
                } while (pos >= 0);
                docIDs.min = "a" + s;
                return docIDs.min;
            },
            uniqueId = function () {
                return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
                        var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
                        return v.toString(16);
                    });
            },
            namedId = function (type, name) {
                var s = type || "",
                    e,
                    i;
                if (typeof name == "string") {
                    // FIXME: Avoid cases where we get "_-".
                    if (name.search(reg1) == -1) {
                        s = name.replace(reg2, "").replace(reg3, "_");
                    }
                    s = s.length ? s : type;
                }
                e = s.toLowerCase();
                docIDs[e] = docIDs[e] || 1;
                i = docIDs[e]++;
                return s + (type == "cls" || i > 1 ? "-" + i : "");
            };

        this.reset = function () {
            docIDs = {};
            if (_type == "minimal") {
                docIDs.min = "`";
            }
        };

        this.getUnique = function (kind, name) {
            switch (type) {
            case "unique":
                return uniqueId();
            case "minimal":
                return minimalId();
            case "regular":
                // falls through
            default:
                return namedId(kind, name);
            }
        };
    }

    module.exports = ID;

}());
