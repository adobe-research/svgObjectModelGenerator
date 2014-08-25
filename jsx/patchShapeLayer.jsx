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


function setLayerSVGOffset(x,y, layerId) {
    
    const klayerSVGcoordinateOffset = app.stringIDToTypeID("layerSVGcoordinateOffset");
    const keyX = app.charIDToTypeID('X   ');
    const keyY = app.charIDToTypeID('Y   ');

    // The layer referenced doesn't actually matter; it just needs to 
    // reference *a* layer so it vectors into ULayerElement.
    var ref1 = new ActionReference();
    ref1.putIdentifier(classLayer, layerId);

    var cdesc = new ActionDescriptor();
    cdesc.putDouble(keyX, x);
    cdesc.putDouble(keyY, y);

    cdesc.putReference(typeNULL, ref1);

    executeAction(klayerSVGcoordinateOffset, cdesc, DialogModes.NO);
}


try {
    
    // This uses many routines from CopyCSS, so load the script but tell it not to execute first.
    if (typeof cssToClip === "undefined") {
        var runCopyCSSFromScript = true,
            appFolder = { Windows: "/", Macintosh: "/../" };
        $.evalFile(getPSAppPath() + appFolder[File.fs] + "Required/CopyCSSToClipboard.jsx");
    }
    
    setLayerSVGOffset(params.xOffset, params.yOffset, params.layerId);
    
    // FIXME: Access with SmartObject ID in the future?
    
    currentLayer = new PSLayerInfo(params.layerIndex);
    
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