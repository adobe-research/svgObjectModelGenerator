## 0.6

* Replace OMG with AGC 1.0.0. Support for OMG 0.x removed.
* Added new configuration for svgWriter
	- `fillFilter` Use PS's way to just filter fill area and not stroke layer style.
	- `useViewBox` In combination with `trimToArtbounds` sets the viewBox instead of shifting the content.
	- `documentUnits` with values `mm` | `cm` | `pc` | `in` to specify document units.
	- `callback` Call back function that can be used for progress reports or interrupting svgWriter.
* Fixed: Issues with infinite loops in svgStylesheet.
* Fixed: Improved performance by up to 400%.
* Fixed: Issues with pattern references. And unoptimized patterns.
* Fixed: Issues with trailing/leading white-spaces of attribute values.
* Fixed: xlink tracking in useTrick
* Fixed: Avoid using xlink namespace definition when possible.
* Fixed: Not set isolation, mix-blend-mode, text-orientation as presentation attributes.
* Fixed: Make vertical text work in more browsers.
* Fixed: Remove unnecessary newlines.
* Fixed: Remove root layer groups when they have no purpose.
* Fixed: Remove superfluous groups from resources.
* Fixed: Remove unnecessary symbol shifting.
* Fixed: Issues with incorrectly translated resources.
* Fixed: Allow limiting precision to 2 digits.
* Fixed: Add support for letter-spacing.
* Fixed: Issues with filter dimensions.
* Fixed: Avoid not allowed characters in XML.
* Fixed: If layer name matches PS pattern, don't cretae IDs.
* Fixed: Use name schema of XML 1.0 4th edition instead of 5th edition because of missing browser support.
* Fixed: Fix gradient naming.
* Fixed: Add new parser for restricted SVG path string.

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