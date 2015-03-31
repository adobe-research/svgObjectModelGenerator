module.exports = {
	"children": [
		{
			"id": "shape-1",
			"type": "shape",
			"style": {
				"stroke": {
					"type": "none"
				},
				"fill": {
					"type": "gradient",
					"gradient": "radial-gradient-1"
				}
			},
			"children": [],
			"title": "Rectangle 1",
			"visualBounds": {
				"top": 50,
				"left": 50,
				"bottom": 150,
				"right": 250
			},
			"shape": {
				"type": "rect",
				"x": 50,
				"y": 50,
				"width": 200,
				"height": 100
			}
		},
		{
			"id": "shape-2",
			"type": "shape",
			"style": {
				"stroke": {
					"type": "none"
				},
				"fill": {
					"type": "gradient",
					"gradient": "linear-gradient-1"
				}
			},
			"children": [],
			"title": "Rectangle 2",
			"visualBounds": {
				"top": 50,
				"left": 300,
				"bottom": 150,
				"right": 500
			},
			"shape": {
				"type": "rect",
				"x": 300,
				"y": 50,
				"width": 200,
				"height": 100
			}
		}
	],
	"global": {
		"clipPaths": {},
		"filters": {},
		"gradients": {
			"radial-gradient-1": {
				"stops": [
					{
						"offset": 0,
						"color": {
							"r": 0,
							"g": 255,
							"b": 255,
							"a": 1
						}
					},
					{
						"offset": 1,
						"color": {
							"r": 0,
							"g": 0,
							"b": 255,
							"a": 1
						}
					}
				],
				"type": "radial",
				"gradientSpace": "userSpaceOnUse",
				"r": 75,
				"cx": 150,
				"cy": 100,
				"fx": 150,
				"fy": 100,
				"transform": {
					"0": [
						0.707107,
						-0.707107,
						0,
						0
					],
					"1": [
						0.707107,
						0.707107,
						0,
						0
					],
					"2": [
						0,
						0,
						1,
						0
					],
					"3": [
						0,
						0,
						0,
						1
					]
				},
			},
			"linear-gradient-1": {
				"stops": [
					{
						"offset": 0,
						"color": {
							"r": 0,
							"g": 255,
							"b": 255,
							"a": 1
						}
					},
					{
						"offset": 1,
						"color": {
							"r": 0,
							"g": 0,
							"b": 255,
							"a": 1
						}
					}
				],
				"type": "linear",
				"gradientSpace": "userSpaceOnUse",
				"x1": 300,
				"y1": 50,
				"x2": 500,
				"y2": 50,
				"transform": {
					"0": [
						0.707107,
						-0.707107,
						0,
						0
					],
					"1": [
						0.707107,
						0.707107,
						0,
						0
					],
					"2": [
						0,
						0,
						1,
						0
					],
					"3": [
						0,
						0,
						0,
						1
					]
				},
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
	"title": "Test focal points"
}