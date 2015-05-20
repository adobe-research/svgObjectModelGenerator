module.exports = {
	"children": [
		{
			"type": "background",
			"visible": true,
			"style": {},
			"children": [],
			"name": "Background"
		},
		{
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "none"
				},
				"fill": {
					"type": "gradient",
					"gradient": {
						"gradientSpace": "objectBoundingBox",
						"x1": 275,
						"y1": 250,
						"x2": 275,
						"y2": 100,
						"id": "linear-gradient-1"
					}
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
				},
				"filter": "filter-1"
			},
			"children": [],
			"name": "Rectangle 1",
			"visualBounds": {
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
		"filters": {
			"filter-1": {
				"filterUnits": "userSpaceOnUse",
				"children": [
					{
						"name": "feFlood",
						"result": "flood-1",
						"input": [],
						"flood-color": {
							"r": 255,
							"g": 0,
							"b": 0,
							"a": 1
						},
						"flood-opacity": 1
					},
					{
						"name": "feComposite",
						"result": "composite-1",
						"input": [
							"flood-1",
							"SourceGraphic"
						],
						"operator": "in"
					},
					{
						"name": "feBlend",
						"result": "blend-1",
						"input": [
							"composite-1",
							"SourceGraphic"
						],
						"mode": "lighten"
					}
				]
			}
		},
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
				"type": "linear"
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
	"name": "svgOverlay.psd"
}