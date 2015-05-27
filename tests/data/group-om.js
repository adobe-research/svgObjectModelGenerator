module.exports = {
	"children": [
		{
			"type": "group",
			"visible": true,
			"style": {
				"opacity": 0.35,
				"blend-mode": "multiply",
				"stroke": {
					"type": "none"
				},
				"meta": {
					"PS": {
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
					}
				},
				"filter": "filter-1"
			},
			"children": [
				{
					"type": "shape",
					"visible": true,
					"style": {
						"stroke": {
							"type": "solid",
							"cap": "butt",
							"join": "miter",
							"width": 3,
							"miter-limit": 100,
							"dash": [],
							"dash-offset": 0,
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
					"name": "Rectangle 1",
					"visualBounds": {
						"top": 100,
						"left": 100,
						"bottom": 300,
						"right": 300
					},
					"shape": {
						"type": "rect",
						"x": 100,
						"y": 100,
						"width": 200,
						"height": 200
					}
				},
				{
					"type": "shape",
					"visible": true,
					"style": {
						"opacity": 0.75,
						"stroke": {
							"type": "solid",
							"cap": "butt",
							"join": "miter",
							"width": 3,
							"miter-limit": 100,
							"dash": [],
							"dash-offset": 0,
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
						"meta": {
							"PS": {
								"fx": {
									"innerShadowMulti": [
										{
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
									]
								}
							}
						},
						"filter": "filter-2"
					},
					"children": [],
					"name": "Rectangle 2",
					"visualBounds": {
						"top": 200,
						"left": 200,
						"bottom": 400,
						"right": 400
					},
					"shape": {
						"type": "rect",
						"x": 200,
						"y": 200,
						"width": 200,
						"height": 200
					}
				}
			],
			"name": "Group"
		}
	],
	"global": {
		"clipPaths": {},
		"filters": {
			"filter-1": {
				"filterUnits": "userSpaceOnUse",
				"children": [
					{
						"name": "feGaussianBlur",
						"result": "blur-1",
						"input": [
							"SourceAlpha"
						],
						"stdDeviation": 5.196
					},
					{
						"name": "feFlood",
						"result": "flood-1",
						"input": [],
						"flood-color": {
							"r": 0,
							"g": 0,
							"b": 0,
							"a": 1
						},
						"flood-opacity": 0.75
					},
					{
						"name": "feComposite",
						"result": "composite-1",
						"input": [
							"flood-1",
							"blur-1"
						],
						"operator": "in"
					},
					{
						"name": "feOffset",
						"result": "offset-1",
						"input": [
							"composite-1"
						],
						"dx": 10.103,
						"dy": 8.181
					},
					{
						"name": "feBlend",
						"result": "blend-1",
						"input": [
							"SourceGraphic",
							"offset-1"
						]
					}
				]
			},
			"filter-2": {
				"filterUnits": "userSpaceOnUse",
				"children": [
					{
						"name": "feGaussianBlur",
						"result": "blur-1",
						"input": [
							"SourceAlpha"
						],
						"stdDeviation": 4.583
					},
					{
						"name": "feFlood",
						"result": "flood-1",
						"input": [],
						"flood-color": {
							"r": 0.003891,
							"g": 54.019456,
							"b": 255,
							"a": 1
						},
						"flood-opacity": 0.75
					},
					{
						"name": "feComposite",
						"result": "composite-1",
						"input": [
							"flood-1",
							"blur-1"
						],
						"operator": "out"
					},
					{
						"name": "feOffset",
						"result": "offset-1",
						"input": [
							"composite-1"
						],
						"dx": 7.5,
						"dy": 12.99
					},
					{
						"name": "feComposite",
						"result": "composite-2",
						"input": [
							"offset-1",
							"SourceAlpha"
						],
						"operator": "in"
					},
					{
						"name": "feBlend",
						"result": "blend-1",
						"input": [
							"composite-2",
							"SourceGraphic"
						],
						"mode": "multiply"
					}
				]
			}
		},
		"gradients": {},
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
	"version": "0.1.0",
	"name": "group.psd"
}