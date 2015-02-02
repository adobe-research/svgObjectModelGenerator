module.exports = {
	"children": [
		{
			"id": "background",
			"type": "background",
			"visible": true,
			"style": {},
			"children": [],
			"layerName": "Background"
		},
		{
			"id": "rectangle-1",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "none"
				},
				"fill": {
					"type": "gradient",
					"gradient": {
						"stops": [
							{
								"position": 0,
								"color": {
									"r": 225.000002,
									"g": 0,
									"b": 25.003891,
									"a": 1
								}
							},
							{
								"position": 100,
								"color": {
									"r": 0,
									"g": 96.000002,
									"b": 27.003891,
									"a": 1
								}
							}
						],
						"scale": 1,
						"type": "linear",
						"angle": 90,
						"gradientSpace": "objectBoundingBox"
					}
				},
				"fx": {
					"solidFillMulti": [
						{
							"enabled": true,
							"mode": "lighten",
							"opacity": 1,
							"color": {
								"r": 255,
								"g": 0,
								"b": 0,
								"a": 1
							}
						}
					]
				}
			},
			"children": [],
			"layerName": "Rectangle 1",
			"boundsWithFX": {
				"top": 100,
				"left": 100,
				"bottom": 250,
				"right": 450
			},
			"shape": "rect",
			"shapeBounds": {
				"top": 100,
				"left": 100,
				"bottom": 250,
				"right": 450
			}
		}
	],
	"offsetX": 0,
	"offsetY": 0,
	"viewBox": {
		"top": 0,
		"left": 0,
		"bottom": 600,
		"right": 800
	},
	"docBounds": {
		"top": 0,
		"left": 0,
		"bottom": 600,
		"right": 800
	},
	"pxToInchRatio": 72,
	"globalLight": {
		"angle": 120,
		"altitude": 30
	}
}
