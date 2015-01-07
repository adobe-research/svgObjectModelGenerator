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
					"type": "solid",
					"color": {
						"r": 0,
						"g": 127,
						"b": 0,
						"a": 1
					}
				},
				"fx": {
					"dropShadow": {
						"enabled": true,
						"mode": "multiply",
						"color": {
							"r": 0,
							"g": 0,
							"b": 0,
							"a": 1
						},
						"opacity": 0.5,
						"useGlobalAngle": true,
						"localLightingAngle": {
							"value": 120,
							"units": "angleUnit"
						},
						"distance": 2,
						"chokeMatte": 0,
						"blur": 2,
						"noise": {
							"value": 0,
							"units": "percentUnit"
						},
						"antiAlias": false,
						"transferSpec": {
							"name": "Linear"
						},
						"layerConceals": true
					},
					"innerShadow": {
						"enabled": true,
						"mode": "overlay",
						"color": {
							"r": 0,
							"g": 0,
							"b": 0,
							"a": 1
						},
						"opacity": 0.75,
						"useGlobalAngle": true,
						"localLightingAngle": {
							"value": 120,
							"units": "angleUnit"
						},
						"distance": 1,
						"chokeMatte": 0,
						"blur": 0,
						"noise": {
							"value": 0,
							"units": "percentUnit"
						},
						"antiAlias": false,
						"transferSpec": {
							"name": "Linear"
						}
					},
					"gradientFill": {
						"enabled": true,
						"mode": "normal",
						"opacity": {
							"value": 19,
							"units": "percentUnit"
						},
						"gradient": {
							"stops": [
								{
									"position": 0,
									"color": {
										"r": 0.124514,
										"g": 3,
										"b": 0.023346,
										"a": 1
									}
								},
								{
									"position": 100,
									"color": {
										"r": 255,
										"g": 255,
										"b": 255,
										"a": 1
									}
								}
							],
							"scale": 1,
							"type": "linear",
							"angle": 90,
							"gradientSpace": "objectBoundingBox"
						},
						"angle": {
							"value": 90,
							"units": "angleUnit"
						},
						"type": "linear",
						"reverse": false,
						"dither": false,
						"align": true,
						"scale": {
							"value": 100,
							"units": "percentUnit"
						},
						"offset": {
							"horizontal": {
								"value": 0,
								"units": "percentUnit"
							},
							"vertical": {
								"value": 0,
								"units": "percentUnit"
							}
						}
					}
				}
			},
			"children": [],
			"layerName": "Rectangle 1",
			"boundsWithFX": {
				"top": 185,
				"left": 262,
				"bottom": 250,
				"right": 458
			},
			"shape": "rect",
			"shapeBounds": {
				"top": 185,
				"left": 263,
				"bottom": 246,
				"right": 456
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
		"angle": 90,
		"altitude": 30
	}
}