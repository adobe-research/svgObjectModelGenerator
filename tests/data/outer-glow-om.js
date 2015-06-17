{
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
						"r": 0.124514,
						"g": 3,
						"b": 0.023346,
						"a": 1
					}
				},
				"meta": {
					"PS": {
						"fx": {
							"outerGlowMulti": [
								{
									"enabled": true,
									"mode": "normal",
									"gradient": {
										"stops": [
											{
												"offset": 0,
												"color": {
													"r": 249,
													"g": 229.99611,
													"b": 0,
													"a": 1
												}
											},
											{
												"offset": 5.0048828125,
												"color": {
													"r": 249,
													"g": 229.99611,
													"b": 0
												}
											},
											{
												"offset": 35.009765625,
												"color": {
													"r": 111.003892,
													"g": 21.003892,
													"b": 108.000001
												}
											},
											{
												"offset": 64.990234375,
												"color": {
													"r": 253,
													"g": 124,
													"b": 0
												}
											},
											{
												"offset": 94.9951171875,
												"color": {
													"r": 0,
													"g": 40.000001,
													"b": 116.000001
												}
											},
											{
												"offset": 100,
												"color": {
													"r": 0,
													"g": 40.000001,
													"b": 116.000001,
													"a": 1
												}
											}
										]
									},
									"opacity": 1,
									"glowTechnique": "softMatte",
									"chokeMatte": 0,
									"blur": 87,
									"noise": {
										"value": 0,
										"units": "percentUnit"
									},
									"shadingNoise": {
										"value": 0,
										"units": "percentUnit"
									},
									"antiAlias": false,
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
			"name": "Rectangle 1",
			"visualBounds": {
				"top": 104,
				"left": 150,
				"bottom": 391,
				"right": 472
			},
			"shape": {
				"type": "rect",
				"x": 236,
				"y": 190,
				"width": 149,
				"height": 114
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
						"stdDeviation": 29
					},
					{
						"name": "feComposite",
						"result": "composite-1",
						"input": [
							"blur-1",
							"blur-1"
						]
					},
					{
						"name": "feComposite",
						"result": "composite-2",
						"input": [
							"composite-1",
							"composite-1"
						]
					},
					{
						"name": "feComposite",
						"result": "composite-3",
						"input": [
							"composite-2",
							"composite-2"
						],
						"operator": "over"
					},
					{
						"name": "feColorMatrix",
						"result": "color-1",
						"input": [
							"composite-3"
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
								"tableValues": "0.9765 0.9765 0.8863 0.7961 0.7059 0.6157 0.5255 0.4353 0.5281 0.6209 0.7137 0.8065 0.8993 0.9922 0.8268 0.6614 0.4961 0.3307 0.1654 0 0"
							},
							{
								"name": "feFuncG",
								"input": [],
								"type": "table",
								"tableValues": "0.9019 0.9019 0.7653 0.6288 0.4922 0.3556 0.219 0.0824 0.1497 0.217 0.2843 0.3516 0.419 0.4863 0.4314 0.3765 0.3216 0.2667 0.2118 0.1569 0.1569"
							},
							{
								"name": "feFuncB",
								"input": [],
								"type": "table",
								"tableValues": "0 0 0.0706 0.1412 0.2118 0.2824 0.3529 0.4235 0.3529 0.2824 0.2118 0.1412 0.0706 0 0.0758 0.1516 0.2275 0.3033 0.3791 0.4549 0.4549"
							}
						]
					},
					{
						"name": "feBlend",
						"result": "blend-1",
						"input": [
							"comp-1",
							"SourceGraphic"
						],
						"mode": "normal"
					},
					{
						"name": "feBlend",
						"result": "blend-2",
						"input": [
							"SourceGraphic",
							"blend-1"
						]
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
				"angle": 120,
				"altitude": 30
			}
		}
	},
	"version": "0.1.0",
	"name": "outer-glow.psd"
}