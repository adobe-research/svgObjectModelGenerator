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
										"scale": 1
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
				}
			},
			"children": [],
			"title": "Rectangle 1",
			"boundsWithFX": {
				"top": 200,
				"left": 150,
				"bottom": 400,
				"right": 350
			},
			"shapeBounds": {
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
			"id": "rectangle-2",
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
				}
			},
			"children": [],
			"title": "Rectangle 2",
			"boundsWithFX": {
				"top": 200,
				"left": 450,
				"bottom": 400,
				"right": 650
			},
			"shapeBounds": {
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
	"title": "svgFx-inner-glow.psd"
}