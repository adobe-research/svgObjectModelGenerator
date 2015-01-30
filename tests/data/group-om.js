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
			"id": "group",
			"type": "group",
			"visible": true,
			"style": {
				"opacity": 0.35,
				"mix-blend-mode": "multiply",
				"stroke": {
					"type": "none"
				},
				"fx": {
					"dropShadowMulti": [
						{
							"enabled": true,
							"mode": "multiply",
							"color": {
								"r": 0,
								"g": 0,
								"b": 0,
								"a": 1
							},
							"opacity": 0.75,
							"useGlobalAngle": false,
							"localLightingAngle": {
								"value": 141,
								"units": "angleUnit"
							},
							"distance": 13,
							"chokeMatte": 0,
							"blur": 27,
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
					]
				}
			},
			"children": [
				{
					"id": "rectangle-1",
					"type": "shape",
					"visible": true,
					"style": {
						"stroke": {
							"type": "solid",
							"lineCap": "butt",
							"lineJoin": "miter",
							"lineWidth": 3,
							"miterLimit": 100,
							"dashArray": [],
							"dashOffset": 0,
							"color": {
								"r": 241.881842,
								"g": 101.179413,
								"b": 33.72992,
								"a": 1
							},
							"opacity": 1
						},
						"fill": {
							"type": "solid",
							"color": {
								"r": 43.785993,
								"g": 207.000003,
								"b": 38.155641,
								"a": 1
							}
						}
					},
					"children": [],
					"layerName": "Rectangle 1",
					"shape": "rect",
					"shapeBounds": {
						"top": 100,
						"left": 100,
						"bottom": 300,
						"right": 300
					}
				},
				{
					"id": "rectangle-2",
					"type": "shape",
					"visible": true,
					"style": {
						"opacity": 0.75,
						"stroke": {
							"type": "solid",
							"lineCap": "butt",
							"lineJoin": "miter",
							"lineWidth": 3,
							"miterLimit": 100,
							"dashArray": [],
							"dashOffset": 0,
							"color": {
								"r": 241.881842,
								"g": 101.179413,
								"b": 33.72992,
								"a": 1
							},
							"opacity": 1
						},
						"fill": {
							"type": "solid",
							"color": {
								"r": 43.785993,
								"g": 207.000003,
								"b": 38.155641,
								"a": 1
							}
						},
						"fx": {
							"innerShadow": {
								"enabled": true,
								"mode": "multiply",
								"color": {
									"r": 0.003891,
									"g": 54.019456,
									"b": 255,
									"a": 1
								},
								"opacity": 0.75,
								"useGlobalAngle": true,
								"localLightingAngle": {
									"value": 120,
									"units": "angleUnit"
								},
								"distance": 15,
								"chokeMatte": 0,
								"blur": 21,
								"noise": {
									"value": 0,
									"units": "percentUnit"
								},
								"antiAlias": false,
								"transferSpec": {
									"name": "Linear"
								}
							}
						}
					},
					"children": [],
					"layerName": "Rectangle 2",
					"boundsWithFX": {
						"top": 200,
						"left": 200,
						"bottom": 400,
						"right": 400
					},
					"shape": "rect",
					"shapeBounds": {
						"top": 200,
						"left": 200,
						"bottom": 400,
						"right": 400
					}
				}
			],
			"layerName": "Group",
			"boundsWithFX": {
				"top": 82,
				"left": 84,
				"bottom": 435,
				"right": 437
			},
			"shapeBounds": {
				"top": 100,
				"left": 100,
				"bottom": 400,
				"right": 400
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