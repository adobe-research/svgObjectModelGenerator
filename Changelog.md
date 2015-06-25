## 0.5

* Internal separation of OMG creation and SVG creation.
	- Separated functionality between svgOMGenerationUtils, utils and svgWriterUtils
	- OMG conform filter generation gets part of svgOMGeneratorSVGFilter
	- Any-unit to pixel conversion moves to svgOMGeneratorUtils
* Deprecating superfluous properties from svgOMG
	- `targetWidth`
	- `targetHeight`
* Add new configuration to svgOMG
	- `isResponsive` to emulate current behavior of Illustrator. (Removes width and height attribute from root SVG.)
* Added new configuration to svgWriter
	- `styling` Allow switching style declaration between presentation attributes, style attributes and style classes.
	- `minify` Allow minification of the SVG output. Whitespaces are removed; IDs are shortened.
	- `idType` Allow different types of ID generation.
	- `precision` The number of digits after floating point.
	- `carriageReturn` Add a carriage return at the end of lines.
* Added support for: 
	- global colors
	- global styles
	- patterns
	- masks and clipping path
	- isolation property
* Fixed: Linear gradients with an angle > 180 deg and layer width < layer height displayed incorrectly
* Fixed: Incorrect trimmed viewbox for svg containing images
* Fixed: Alpha channel gets ignored on fill and stroke colors
* Fixed: Defaults for fills and strokes are not applied correctly
* Fixed: In certain situations svgWriter references classes that it didn't define, causing incorrect renderings
* Fixed: svgWriter outputs an invalid stroke-miterlimit value
* Fixed: The gradientSpace attribute set on a gradient doesn't work if the value is objectBoundingBox
* Fixed: `constrainToDocBounds` would never be used if `trimToArtBounds` isn't specified as well
* Fixed: svgWriter should output a responsive svg if width and height are not passed to printSVG.
* Fixed: svgWriter adds incorrect width/height to the SVG element