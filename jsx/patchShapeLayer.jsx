// (c) Copyright 2014 Adobe Systems, Inc. All rights reserved.

/*global app, charIDToTypeID, stringIDToTypeID, params */

var currentLayer,
    out = "",
    sep = "";

// The built-in "app.path" is broken on the Mac, so we roll our own.
function getPSAppPath() {
    const kexecutablePathStr = stringIDToTypeID("executablePath");

    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putProperty(charIDToTypeID('Prpr'), kexecutablePathStr);
    ref.putEnumerated(charIDToTypeID('capp'), charIDToTypeID('Ordn'),
                      charIDToTypeID('Trgt'));
    desc.putReference(charIDToTypeID('null'), ref);
    var result = executeAction(charIDToTypeID('getd'), desc, DialogModes.NO);
    return File.decode(result.getPath(kexecutablePathStr));
}

const klayerIDStr = app.stringIDToTypeID("layerID");
const ksendLayerThumbnailToNetworkClientStr = app.stringIDToTypeID("sendLayerThumbnailToNetworkClient");
const krawPixmapFilePathStr = app.stringIDToTypeID("rawPixmapFilePath");
const kformatStr = app.stringIDToTypeID("format");
// const kselectedLayerStr = app.stringIDToTypeID("selectedLayer");
const kwidthStr = app.stringIDToTypeID("width");
const kheightStr = app.stringIDToTypeID("height");
const kboundsStr = app.stringIDToTypeID("bounds");

// Call internal PS code to write the current layer's pixels and convert it to PNG.
// Note this takes care of encoding it into base64 format (ES is too slow at this).
function writeLayerPNGfile(path, layerID)
{
    var desc = new ActionDescriptor();

    //    desc.putBoolean( kselectedLayerStr, true );
    desc.putInteger(klayerIDStr, layerID);
    desc.putString(krawPixmapFilePathStr, path);
    desc.putBoolean(kboundsStr, true);
    desc.putInteger(kwidthStr, 10000);
    desc.putInteger(kheightStr, 10000);
    desc.putInteger(kformatStr, 2); // Want raw pixels, not unsupported JPEG
    executeAction(ksendLayerThumbnailToNetworkClientStr, desc, DialogModes.NO);
};

try {
    
    // This uses many routines from CopyCSS, so load the script but tell it not to execute first.
    if (typeof cssToClip === "undefined") {
        var runCopyCSSFromScript = true,
            appFolder = { Windows: "/", Macintosh: "/../" };
        $.evalFile(getPSAppPath() + appFolder[File.fs] + "Required/CopyCSSToClipboard.jsx");
    }
    
    currentLayer = new PSLayerInfo(params.layerIndex);

    // FIXME: Access with SmartObject ID in the future?
    if (currentLayer.layerKind == kSmartObjectSheet ||
        currentLayer.layerKind == kPixelSheet) {
        var pngPath = new File(Folder.temp + "/png4svg" + currentLayer.layerID).fsName;
        
        this.writeLayerPNGfile(pngPath, currentLayer.layerID);
        out = sep + '"pixelDataPtr":"' + pngPath + '.base64"';
        sep = ',';
    }
    
    if (params.pathData) {
        var shapeAttr = currentLayer.getLayerAttr("layerVectorPointData");
        out = sep + '"pathData":"' + shapeAttr + '"';
        sep = ',';
    }
}
catch(ex) {
    out += sep + '"exception": "' + ex + '"';
}

"{ " + out + " }"