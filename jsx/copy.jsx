// (c) Copyright 2014 Adobe Systems, Inc. All rights reserved.

/*global app, charIDToTypeID, stringIDToTypeID, params */

const ktextToClipboardStr = app.stringIDToTypeID( "textToClipboard" );
const keyTextData = app.charIDToTypeID('TxtD');

var testStrDesc = new ActionDescriptor();
testStrDesc.putString( keyTextData, params.clipboard);
executeAction( ktextToClipboardStr, testStrDesc, DialogModes.NO);