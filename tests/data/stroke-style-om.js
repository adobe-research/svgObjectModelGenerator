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
					"type": "solid",
					"lineCap": "round",
					"lineJoin": "miter",
					"lineWidth": 3,
					"miterLimit": 100,
					"dashArray": [
						0,
						2
					],
					"dashOffset": 0,
					"color": {
						"r": 0,
						"g": 0,
						"b": 0,
						"a": 1
					},
					"opacity": 1
				},
				"fill-rule": "evenodd"
			},
			"children": [],
			"layerName": "Rectangle 1",
			"shape": "path",
			"shapeBounds": {
				"top": 50,
				"left": 50,
				"bottom": 150,
				"right": 250
			},
			"pathData": "M50.000,50.000 C50.000,50.000 250.000,50.000 250.000,50.000 C250.000,50.000 250.000,150.000 250.000,150.000 C250.000,150.000 50.000,150.000 50.000,150.000 C50.000,150.000 50.000,50.000 50.000,50.000 Z"
		},
		{
			"id": "rectangle-2",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "solid",
					"lineCap": "round",
					"lineJoin": "bevel",
					"lineWidth": 10,
					"miterLimit": 100,
					"dashArray": [
						5,
						2,
						2,
						5
					],
					"dashOffset": 0,
					"color": {
						"r": 0,
						"g": 0,
						"b": 0,
						"a": 1
					},
					"opacity": 1
				},
				"fill-rule": "evenodd"
			},
			"children": [],
			"layerName": "Rectangle 2",
			"shape": "path",
			"shapeBounds": {
				"top": 50,
				"left": 300,
				"bottom": 150,
				"right": 500
			},
			"pathData": "M300.000,50.000 C300.000,50.000 500.000,50.000 500.000,50.000 C500.000,50.000 500.000,150.000 500.000,150.000 C500.000,150.000 300.000,150.000 300.000,150.000 C300.000,150.000 300.000,50.000 300.000,50.000 Z"
		},
		{
			"id": "rectangle-3",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "solid",
					"lineCap": "butt",
					"lineJoin": "round",
					"lineWidth": 10,
					"miterLimit": 100,
					"dashArray": [
						4,
						2
					],
					"dashOffset": 0,
					"color": {
						"r": 0,
						"g": 0,
						"b": 0,
						"a": 1
					},
					"opacity": 1
				},
				"fill-rule": "evenodd"
			},
			"children": [],
			"layerName": "Rectangle 3",
			"shape": "path",
			"shapeBounds": {
				"top": 50,
				"left": 550,
				"bottom": 150,
				"right": 750
			},
			"pathData": "M550.000,50.000 C550.000,50.000 750.000,50.000 750.000,50.000 C750.000,50.000 750.000,150.000 750.000,150.000 C750.000,150.000 550.000,150.000 550.000,150.000 C550.000,150.000 550.000,50.000 550.000,50.000 Z"
		},
		{
			"id": "rectangle-4",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "solid",
					"lineCap": "butt",
					"lineJoin": "round",
					"lineWidth": 3,
					"miterLimit": 100,
					"dashArray": [
						{
							"value": 0,
							"units": "pointsUnit"
						},
						4,
						3
					],
					"dashOffset": 0,
					"color": {
						"r": 0,
						"g": 0,
						"b": 0,
						"a": 1
					},
					"opacity": 1
				},
				"fill-rule": "evenodd"
			},
			"children": [],
			"layerName": "Rectangle 4",
			"shape": "path",
			"shapeBounds": {
				"top": 200,
				"left": 50,
				"bottom": 300,
				"right": 250
			},
			"pathData": "M50.000,200.000 C50.000,200.000 250.000,200.000 250.000,200.000 C250.000,200.000 250.000,300.000 250.000,300.000 C250.000,300.000 50.000,300.000 50.000,300.000 C50.000,300.000 50.000,200.000 50.000,200.000 Z"
		},
		{
			"id": "rectangle-5",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "gradient",
					"lineCap": "butt",
					"lineJoin": "round",
					"lineWidth": 10,
					"miterLimit": 100,
					"dashArray": [
						{
							"value": 0,
							"units": "pointsUnit"
						},
						4,
						3
					],
					"dashOffset": 0,
					"color": {
						"red": 0,
						"green": 0,
						"blue": 0
					},
					"opacity": 1,
					"gradient": {
						"stops": [
							{
								"position": 0,
								"color": {
									"r": 9.575876,
									"g": 0.003891,
									"b": 178.000005,
									"a": 1
								}
							},
							{
								"position": 50,
								"color": {
									"r": 255,
									"g": 0.003891,
									"b": 0.027237
								}
							},
							{
								"position": 100,
								"color": {
									"r": 255,
									"g": 251.996109,
									"b": 0.003891,
									"a": 1
								}
							}
						],
						"scale": 1,
						"type": "linear",
						"angle": 35,
						"gradientSpace": "objectBoundingBox"
					}
				},
				"fill-rule": "evenodd"
			},
			"children": [],
			"layerName": "Rectangle 5",
			"shape": "path",
			"shapeBounds": {
				"top": 200,
				"left": 300,
				"bottom": 300,
				"right": 500
			},
			"pathData": "M300.000,200.000 C300.000,200.000 500.000,200.000 500.000,200.000 C500.000,200.000 500.000,300.000 500.000,300.000 C500.000,300.000 300.000,300.000 300.000,300.000 C300.000,300.000 300.000,200.000 300.000,200.000 Z"
		},
		{
			"id": "rectangle-6",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "gradient",
					"lineCap": "butt",
					"lineJoin": "round",
					"lineWidth": 10,
					"miterLimit": 100,
					"dashArray": [
						{
							"value": 0,
							"units": "pointsUnit"
						},
						4,
						3
					],
					"dashOffset": 0,
					"color": {
						"red": 0,
						"green": 0,
						"blue": 0
					},
					"opacity": 1,
					"gradient": {
						"stops": [
							{
								"position": 0,
								"color": {
									"r": 255,
									"g": 0.003891,
									"b": 0.003891,
									"a": 1
								}
							},
							{
								"position": 14.990234375,
								"color": {
									"r": 255,
									"g": 0,
									"b": 255
								}
							},
							{
								"position": 33.0078125,
								"color": {
									"r": 0,
									"g": 0,
									"b": 255
								}
							},
							{
								"position": 48.9990234375,
								"color": {
									"r": 0,
									"g": 255,
									"b": 255
								}
							},
							{
								"position": 66.9921875,
								"color": {
									"r": 0,
									"g": 255,
									"b": 0
								}
							},
							{
								"position": 84.0087890625,
								"color": {
									"r": 255,
									"g": 255,
									"b": 0
								}
							},
							{
								"position": 100,
								"color": {
									"r": 255,
									"g": 0.003891,
									"b": 0.003891,
									"a": 1
								}
							}
						],
						"scale": 1,
						"type": "radial",
						"angle": 90,
						"gradientSpace": "objectBoundingBox"
					}
				},
				"fill": {
					"type": "gradient",
					"gradient": {
						"stops": [
							{
								"position": 0,
								"color": {
									"r": 255,
									"g": 0.003891,
									"b": 0.003891,
									"a": 1
								}
							},
							{
								"position": 14.990234375,
								"color": {
									"r": 255,
									"g": 0,
									"b": 255
								}
							},
							{
								"position": 33.0078125,
								"color": {
									"r": 0,
									"g": 0,
									"b": 255
								}
							},
							{
								"position": 48.9990234375,
								"color": {
									"r": 0,
									"g": 255,
									"b": 255
								}
							},
							{
								"position": 66.9921875,
								"color": {
									"r": 0,
									"g": 255,
									"b": 0
								}
							},
							{
								"position": 84.0087890625,
								"color": {
									"r": 255,
									"g": 255,
									"b": 0
								}
							},
							{
								"position": 100,
								"color": {
									"r": 255,
									"g": 0.003891,
									"b": 0.003891,
									"a": 1
								}
							}
						],
						"scale": 1,
						"type": "radial",
						"angle": 0,
						"gradientSpace": "objectBoundingBox"
					}
				},
				"fill-rule": "evenodd"
			},
			"children": [],
			"layerName": "Rectangle 6",
			"shape": "path",
			"shapeBounds": {
				"top": 200,
				"left": 550,
				"bottom": 300,
				"right": 750
			},
			"pathData": "M550.000,200.000 C550.000,200.000 750.000,200.000 750.000,200.000 C750.000,200.000 750.000,300.000 750.000,300.000 C750.000,300.000 550.000,300.000 550.000,300.000 C550.000,300.000 550.000,200.000 550.000,200.000 Z"
		},
		{
			"id": "rectangle-7",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "gradient",
					"lineCap": "round",
					"lineJoin": "miter",
					"lineWidth": 20,
					"miterLimit": 100,
					"dashArray": [
						0,
						2
					],
					"dashOffset": 0,
					"color": {
						"red": 0,
						"green": 0,
						"blue": 0
					},
					"opacity": 1,
					"gradient": {
						"stops": [
							{
								"position": 0,
								"color": {
									"r": 255,
									"g": 0.003891,
									"b": 0.003891,
									"a": 1
								}
							},
							{
								"position": 7.99560546875,
								"color": {
									"r": 255,
									"g": 255,
									"b": 0
								}
							},
							{
								"position": 16.50390625,
								"color": {
									"r": 0,
									"g": 255,
									"b": 0
								}
							},
							{
								"position": 25.50048828125,
								"color": {
									"r": 0,
									"g": 255,
									"b": 255
								}
							},
							{
								"position": 33.49609375,
								"color": {
									"r": 0,
									"g": 0,
									"b": 255
								}
							},
							{
								"position": 42.5048828125,
								"color": {
									"r": 255,
									"g": 0,
									"b": 255
								}
							},
							{
								"position": 50,
								"color": {
									"r": 255,
									"g": 0.003891,
									"b": 0.003891,
									"a": 1
								}
							},
							{
								"position": 50,
								"color": {
									"r": 255,
									"g": 0.003891,
									"b": 0.003891,
									"a": 1
								}
							},
							{
								"position": 57.4951171875,
								"color": {
									"r": 255,
									"g": 0,
									"b": 255
								}
							},
							{
								"position": 66.50390625,
								"color": {
									"r": 0,
									"g": 0,
									"b": 255
								}
							},
							{
								"position": 74.49951171875,
								"color": {
									"r": 0,
									"g": 255,
									"b": 255
								}
							},
							{
								"position": 83.49609375,
								"color": {
									"r": 0,
									"g": 255,
									"b": 0
								}
							},
							{
								"position": 92.00439453125,
								"color": {
									"r": 255,
									"g": 255,
									"b": 0
								}
							},
							{
								"position": 100,
								"color": {
									"r": 255,
									"g": 0.003891,
									"b": 0.003891,
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
				"fill-rule": "evenodd"
			},
			"children": [],
			"layerName": "Rectangle 7",
			"shape": "path",
			"shapeBounds": {
				"top": 350,
				"left": 50,
				"bottom": 450,
				"right": 250
			},
			"pathData": "M50.000,350.000 C50.000,350.000 250.000,350.000 250.000,350.000 C250.000,350.000 250.000,450.000 250.000,450.000 C250.000,450.000 50.000,450.000 50.000,450.000 C50.000,450.000 50.000,350.000 50.000,350.000 Z"
		},
		{
			"id": "rectangle-8",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "gradient",
					"lineCap": "butt",
					"lineJoin": "miter",
					"lineWidth": 20,
					"miterLimit": 100,
					"dashArray": [],
					"dashOffset": 0,
					"color": {
						"red": 0,
						"green": 0,
						"blue": 0
					},
					"opacity": 1,
					"gradient": {
						"stops": [
							{
								"position": 0,
								"color": {
									"r": 255,
									"g": 0.003891,
									"b": 0.003891,
									"a": 1
								}
							},
							{
								"position": 14.990234375,
								"color": {
									"r": 255,
									"g": 0,
									"b": 255
								}
							},
							{
								"position": 33.0078125,
								"color": {
									"r": 0,
									"g": 0,
									"b": 255
								}
							},
							{
								"position": 48.9990234375,
								"color": {
									"r": 0,
									"g": 255,
									"b": 255
								}
							},
							{
								"position": 66.9921875,
								"color": {
									"r": 0,
									"g": 255,
									"b": 0
								}
							},
							{
								"position": 84.0087890625,
								"color": {
									"r": 255,
									"g": 255,
									"b": 0
								}
							},
							{
								"position": 100,
								"color": {
									"r": 255,
									"g": 0.003891,
									"b": 0.003891,
									"a": 1
								}
							}
						],
						"scale": 1,
						"type": "linear",
						"angle": 35,
						"gradientSpace": "userSpaceOnUse"
					}
				},
				"fill-rule": "evenodd"
			},
			"children": [],
			"layerName": "Rectangle 8",
			"shape": "path",
			"shapeBounds": {
				"top": 350,
				"left": 300,
				"bottom": 450,
				"right": 500
			},
			"pathData": "M300.000,350.000 C300.000,350.000 500.000,350.000 500.000,350.000 C500.000,350.000 500.000,450.000 500.000,450.000 C500.000,450.000 300.000,450.000 300.000,450.000 C300.000,450.000 300.000,350.000 300.000,350.000 Z"
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