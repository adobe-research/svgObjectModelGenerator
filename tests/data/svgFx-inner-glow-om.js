module.exports = {
	"children": [
		{
			"id": "background-1",
			"type": "background",
			"visible": true,
			"style": {},
			"children": [],
			"name": "Background"
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
					"type": "solid",
					"color": {
						"r": 252.970012,
						"g": 197.757364,
						"b": 137.454736,
						"a": 1
					}
				},
				"meta": {
					"PS": {
						"fx": {
							"innerGlowMulti": [
								{
									"enabled": true,
									"mode": "lighten",
									"gradient": {
										"stops": [
											{
												"offset": 0,
												"color": {
													"r": 255,
													"g": 0.003891,
													"b": 0.003891,
													"a": 1
												}
											},
											{
												"offset": 15.9912109375,
												"color": {
													"r": 255,
													"g": 255,
													"b": 0
												}
											},
											{
												"offset": 33.0078125,
												"color": {
													"r": 0,
													"g": 255,
													"b": 0
												}
											},
											{
												"offset": 51.0009765625,
												"color": {
													"r": 0,
													"g": 255,
													"b": 255
												}
											},
											{
												"offset": 66.9921875,
												"color": {
													"r": 0,
													"g": 0,
													"b": 255
												}
											},
											{
												"offset": 85.009765625,
												"color": {
													"r": 255,
													"g": 0,
													"b": 255
												}
											},
											{
												"offset": 100,
												"color": {
													"r": 255,
													"g": 0.003891,
													"b": 0.003891,
													"a": 1
												}
											}
										]
									},
									"opacity": 0.75,
									"glowTechnique": "softMatte",
									"chokeMatte": 0,
									"blur": 38,
									"shadingNoise": {
										"value": 0,
										"units": "percentUnit"
									},
									"noise": {
										"value": 0,
										"units": "percentUnit"
									},
									"antiAlias": false,
									"innerGlowSource": "edgeGlow",
									"transferSpec": {
										"name": "Half Round"
									},
									"inputRange": {
										"value": 50,
										"units": "percentUnit"
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
				"top": 200,
				"left": 150,
				"bottom": 400,
				"right": 350
			},
			"shape": {
				"type": "rect",
				"x": 150,
				"y": 200,
				"width": 200,
				"height": 200
			}
		},
		{
			"id": "shape-2",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "none"
				},
				"fill": {
					"type": "solid",
					"color": {
						"r": 252.970012,
						"g": 197.757364,
						"b": 137.454736,
						"a": 1
					}
				},
				"meta": {
					"PS": {
						"fx": {
							"innerGlowMulti": [
								{
									"enabled": true,
									"mode": "darken",
									"color": {
										"r": 189.996113,
										"g": 200.708164,
										"b": 255,
										"a": 1
									},
									"opacity": 0.75,
									"glowTechnique": "softMatte",
									"chokeMatte": 0,
									"blur": 65,
									"shadingNoise": {
										"value": 0,
										"units": "percentUnit"
									},
									"noise": {
										"value": 0,
										"units": "percentUnit"
									},
									"antiAlias": false,
									"innerGlowSource": "edgeGlow",
									"transferSpec": {
										"name": "Linear"
									},
									"inputRange": {
										"value": 50,
										"units": "percentUnit"
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
				"left": 450,
				"bottom": 400,
				"right": 650
			},
			"shape": {
				"type": "rect",
				"x": 450,
				"y": 200,
				"width": 200,
				"height": 200
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
						"stdDeviation": 12.667
					},
					{
						"name": "feColorMatrix",
						"result": "color-1",
						"input": [
							"blur-1"
						],
						"type": "matrix",
						"values": [
							-1,
							0,
							0,
							0,
							1,
							0,
							-1,
							0,
							0,
							1,
							0,
							0,
							-1,
							0,
							1,
							0,
							0,
							0,
							1,
							0
						]
					},
					{
						"name": "feColorMatrix",
						"result": "color-2",
						"input": [
							"color-1"
						],
						"type": "matrix",
						"values": [
							0,
							0,
							0,
							1,
							0,
							0,
							0,
							0,
							1,
							0,
							0,
							0,
							0,
							1,
							0,
							0,
							0,
							0,
							1,
							0
						]
					},
					{
						"name": "feColorMatrix",
						"result": "color-3",
						"input": [
							"color-2"
						],
						"type": "matrix",
						"values": [
							-1,
							0,
							0,
							0,
							1,
							0,
							-1,
							0,
							0,
							1,
							0,
							0,
							-1,
							0,
							1,
							0,
							0,
							0,
							1,
							0
						]
					},
					{
						"name": "feComponentTransfer",
						"result": "comp-1",
						"input": [
							"color-3"
						],
						"color-interpolation-filters": "sRGB",
						"children": [
							{
								"name": "feFuncR",
								"input": [],
								"type": "table",
								"tableValues": "1 1 1 1 1 1 0.8333 0.6667 0.5 0.3333 0.1667 0 0 0 0 0 0 0 0 0 0 0 0 0.1667 0.3333 0.5 0.6667 0.8333 1 1 1 1 1 1"
							},
							{
								"name": "feFuncG",
								"input": [],
								"type": "table",
								"tableValues": "0 0.2 0.4 0.6 0.8 1 1 1 1 1 1 1 1 1 1 1 1 1 0.8 0.6 0.4 0.2 0 0 0 0 0 0 0 0 0 0 0 0"
							},
							{
								"name": "feFuncB",
								"input": [],
								"type": "table",
								"tableValues": "0 0 0 0 0 0 0 0 0 0 0 0 0.1667 0.3333 0.5 0.6667 0.8333 1 1 1 1 1 1 1 1 1 1 1 1 0.8 0.6 0.4 0.2 0"
							}
						]
					},
					{
						"name": "feComposite",
						"result": "composite-1",
						"input": [
							"comp-1",
							"SourceAlpha"
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
						"stdDeviation": 21.667
					},
					{
						"name": "feFlood",
						"result": "flood-1",
						"input": [],
						"flood-color": {
							"r": 189.996113,
							"g": 200.708164,
							"b": 255,
							"a": 1
						},
						"flood-opacity": 0.75
					},
					{
						"name": "feComposite",
						"result": "composite-2",
						"input": [
							"flood-1",
							"blur-1"
						],
						"operator": "out"
					},
					{
						"name": "feComposite",
						"result": "composite-1",
						"input": [
							"composite-2",
							"SourceAlpha"
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
						"mode": "darken"
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
	"name": "svgFx-inner-glow.psd"
}