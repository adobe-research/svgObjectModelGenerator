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
                var s = type;
                if (typeof name == "string") {
                    // FIXME: We may want to preserve case sensitivity. That requires another map
                    // with the lower case version as value and the case sensitive version as key.
                    // FIXME: Avoid cases where we get "_-".
                    s = name.replace(/^[^a-zA-Z]+/, "").replace(/[^a-zA-Z0-9\-\_\:\.]+/g, "_").toLowerCase();
                    s = s.length ? s : type;
                }
                docIDs[s] = docIDs[s] || 1;
                return s + "-" + docIDs[s]++;
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
