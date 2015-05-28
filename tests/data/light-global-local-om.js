module.exports = {
	"children": [
		{
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "none"
				},
				"fill": {
					"type": "solid",
					"color": {
						"r": 3,
						"g": 3,
						"b": 3,
						"a": 1
					}
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
									"useGlobalAngle": true,
									"localLightingAngle": {
										"value": 120,
										"units": "angleUnit"
									},
									"distance": 20,
									"chokeMatte": 0,
									"blur": 20,
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
			"name": "Rectangle 1",
			"visualBounds": {
				"top": 64,
				"left": 11,
				"bottom": 253,
				"right": 300
			},
			"shape": {
				"type": "rect",
				"x": 50,
				"y": 83,
				"width": 250,
				"height": 150
			}
		},
		{
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "none"
				},
				"fill": {
					"type": "solid",
					"color": {
						"r": 3,
						"g": 3,
						"b": 3,
						"a": 1
					}
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
										"value": -35,
										"units": "angleUnit"
									},
									"distance": 20,
									"chokeMatte": 0,
									"blur": 20,
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
				"filter": "filter-2"
			},
			"name": "Rectangle 2",
			"visualBounds": {
				"top": 50,
				"left": 415,
				"bottom": 239,
				"right": 704
			},
			"shape": {
				"type": "rect",
				"x": 450,
				"y": 80,
				"width": 250,
				"height": 150
			}
		},
		{
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "none"
				},
				"fill": {
					"type": "solid",
					"color": {
						"r": 255,
						"g": 255,
						"b": 255,
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
									"distance": 20,
									"chokeMatte": 0,
									"blur": 20,
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
				"filter": "filter-3"
			},
			"name": "Rectangle 3",
			"visualBounds": {
				"top": 350,
				"left": 50,
				"bottom": 500,
				"right": 300
			},
			"shape": {
				"type": "rect",
				"x": 50,
				"y": 350,
				"width": 250,
				"height": 150
			}
		},
		{
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "none"
				},
				"fill": {
					"type": "solid",
					"color": {
						"r": 255,
						"g": 255,
						"b": 255,
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
										"r": 0,
										"g": 0,
										"b": 0,
										"a": 1
									},
									"opacity": 0.75,
									"useGlobalAngle": false,
									"localLightingAngle": {
										"value": -35,
										"units": "angleUnit"
									},
									"distance": 20,
									"chokeMatte": 0,
									"blur": 20,
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
				"filter": "filter-4"
			},
			"name": "Rectangle 4",
			"visualBounds": {
				"top": 350,
				"left": 450,
				"bottom": 500,
				"right": 700
			},
			"shape": {
				"type": "rect",
				"x": 450,
				"y": 350,
				"width": 250,
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
						"name": "feGaussianBlur",
						"result": "blur-1",
						"input": [
							"SourceAlpha"
						],
						"stdDeviation": 4.472
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
						"dx": 14.142,
						"dy": 14.142
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
						"stdDeviation": 4.472
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
						"dx": -16.383,
						"dy": -11.472
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
			"filter-3": {
				"filterUnits": "userSpaceOnUse",
				"children": [
					{
						"name": "feGaussianBlur",
						"result": "blur-1",
						"input": [
							"SourceAlpha"
						],
						"stdDeviation": 4.472
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
						"operator": "out"
					},
					{
						"name": "feOffset",
						"result": "offset-1",
						"input": [
							"composite-1"
						],
						"dx": 14.142,
						"dy": 14.142
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
			},
			"filter-4": {
				"filterUnits": "userSpaceOnUse",
				"children": [
					{
						"name": "feGaussianBlur",
						"result": "blur-1",
						"input": [
							"SourceAlpha"
						],
						"stdDeviation": 4.472
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
						"operator": "out"
					},
					{
						"name": "feOffset",
						"result": "offset-1",
						"input": [
							"composite-1"
						],
						"dx": -16.383,
						"dy": -11.472
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
				"angle": 135,
				"altitude": 30
			}
		}
	},
	"version": "0.1.0",
	"name": "light-global-local.psd"
}