// (c) Copyright 2014 Adobe Systems, Inc. All rights reserved.

/*global stringIDToTypeID, ActionDescriptor, executeAction, DialogModes, params */

var switchToRGB = true;
var currentColorMode;
const classDocument = app.charIDToTypeID('Dcmn');
const classProperty = app.charIDToTypeID('Prpr');
const typeOrdinal = app.charIDToTypeID('Ordn');
const enumTarget = app.charIDToTypeID('Trgt');
const idNS = stringIDToTypeID("sendDocumentInfoToNetworkClient");

function changeColorMode(mode) {
    // Add the "Mode" suffix if it's missing
    if (!mode.match(/Mode$/)) {
        mode += "Mode";
    }
    var color = new ActionDescriptor();
    color.putClass(stringIDToTypeID("to"), stringIDToTypeID(mode));
    color.putBoolean(stringIDToTypeID("merge"), false);
    color.putBoolean(stringIDToTypeID("rasterize"), false);
    executeAction(stringIDToTypeID("convertMode"), color, DialogModes.NO);
}

function getCurrentColorMode() {
    var ref = new ActionReference();
    ref.putProperty(classProperty, stringIDToTypeID("mode"));
    ref.putEnumerated(classDocument, typeOrdinal, enumTarget);
    var resultDesc = executeActionGet(ref);
    // Reports "colorSpace:CMYKColorEnum", "colorSpace:RGBColor", "colorSpace:labColor"
    var colorMode = typeIDToStringID(resultDesc.getEnumerationValue(stringIDToTypeID("mode")));
    return colorMode.replace(/^colorSpace:/, "").replace(/Enum$/, ""); // Strip off excess.
}

var colorMode = getCurrentColorMode();
var previous = params.colorMode;
if (previous) {
    if (previous !== colorMode) {
        changeColorMode(previous);
    }
} else if (colorMode !== "RGBColor") {
    changeColorMode("RGBColor");
}

var string = '"colorMode": "' + colorMode + '", "prev": "' + previous + '"';

"{"+string+"}"