module.exports = {
	"children": [
		{
			"id": "background",
			"type": "background",
			"visible": true,
			"style": {},
			"children": [],
			"title": "Background"
		},
		{
			"id": "shadow",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "none"
				},
				"fill": {
					"type": "solid",
					"color": {
						"r": 49.63424,
						"g": 226.000002,
						"b": 161.33074,
						"a": 1
					}
				},
				"fill-opacity": 0.78,
				"meta": {
					"PS": {
						"fx": {
							"dropShadowMulti": [
								{
									"enabled": true,
									"mode": "multiply",
									"color": {
										"r": 214.000002,
										"g": 45.319066,
										"b": 45.319066,
										"a": 1
									},
									"opacity": 0.75,
									"useGlobalAngle": false,
									"localLightingAngle": {
										"value": 180,
										"units": "angleUnit"
									},
									"distance": 24,
									"chokeMatte": 0,
									"blur": 21,
									"noise": {
										"value": 0,
										"units": "percentUnit"
									},
									"antiAlias": false,
									"transferSpec": {
										"name": "Linear"
									},
									"layerConceals": true
								}
							],
							"solidFillMulti": [
								{
									"enabled": true,
									"mode": "lighten",
									"opacity": 0.75,
									"color": {
										"r": 255,
										"g": 0,
										"b": 0,
										"a": 1
									}
								}
							],
							"innerShadowMulti": [
								{
									"enabled": true,
									"mode": "multiply",
									"color": {
										"r": 35.295721,
										"g": 97.797663,
										"b": 225.000002,
										"a": 1
									},
									"opacity": 0.75,
									"useGlobalAngle": false,
									"localLightingAngle": {
										"value": 180,
										"units": "angleUnit"
									},
									"distance": 75,
									"chokeMatte": 0,
									"blur": 46,
									"noise": {
										"value": 0,
										"units": "percentUnit"
									},
									"antiAlias": false,
									"transferSpec": {
										"name": "Linear"
									}
								}
							]
						}
					}
				}
			},
			"children": [],
			"title": "shadow",
			"boundsWithFX": {
				"top": 80,
				"left": 100,
				"bottom": 271,
				"right": 445
			},
			"shapeBounds": {
				"top": 100,
				"left": 100,
				"bottom": 250,
				"right": 400
			},
			"shapeRadii": [
				10,
				10,
				10,
				10
			],
			"shape": {
				"type": "rect",
				"x": 100,
				"y": 100,
				"width": 300,
				"height": 150,
				"r": [
					10,
					10,
					10,
					10
				]
			}
		}
	],
	"global": {
		"viewBox": {
			"top": 0,
			"left": 0,
			"bottom": 1024,
			"right": 1024
		},
		"bounds": {
			"top": 0,
			"left": 0,
			"bottom": 1024,
			"right": 1024
		},
		"pxToInchRatio": 144
	},
	"artboards": {},
	"meta": {
		"PS": {
			"globalLight": {
				"angle": -107,
				"altitude": 90
			}
		}
	},
	"title": "svgFx-shadow-overlay.psd"
}