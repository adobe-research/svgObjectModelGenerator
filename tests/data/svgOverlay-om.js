module.exports = {
	"children": [
		{
			"id": "background-1",
			"type": "background",
			"visible": true,
			"style": {},
			"children": [],
			"title": "Background"
		},
		{
			"id": "shape-1",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "none"
				},
				"fill": {
					"type": "gradient",
					"gradient": "linear-gradient-1"
				},
				"meta": {
					"PS": {
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
					}
				}
			},
			"children": [],
			"title": "Rectangle 1",
			"boundsWithFX": {
				"top": 100,
				"left": 100,
				"bottom": 250,
				"right": 450
			},
			"shapeBounds": {
				"top": 100,
				"left": 100,
				"bottom": 250,
				"right": 450
			},
			"shape": {
				"type": "rect",
				"x": 100,
				"y": 100,
				"width": 350,
				"height": 150
			}
		}
	],
	"global": {
		"clipPaths": {},
		"filters": {},
		"gradients": {
			"linear-gradient-1": {
				"stops": [
					{
						"offset": 0,
						"color": {
							"r": 225.000002,
							"g": 0,
							"b": 25.003891,
							"a": 1
						}
					},
					{
						"offset": 1,
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
				"gradientSpace": "objectBoundingBox",
				"x1": 275,
				"y1": 250,
				"x2": 275,
				"y2": 100
			}
		},
		"masks": {},
		"patterns": {},
		"viewBox": {
			"top": 0,
			"left": 0,
			"bottom": 600,
			"right": 800
		},
		"bounds": {
			"top": 0,
			"left": 0,
			"bottom": 600,
			"right": 800
		},
		"pxToInchRatio": 72
	},
	"artboards": {},
	"meta": {
		"PS": {
			"globalLight": {
				"angle": 120,
				"altitude": 30
			}
		}
	},
	"title": "svgOverlay.psd"
}