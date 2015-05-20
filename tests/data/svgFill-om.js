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
					"type": "solid",
					"cap": "butt",
					"join": "miter",
					"width": 3,
					"miter-limit": 100,
					"dash": [],
					"dash-offset": 0,
					"color": {
						"r": 0,
						"g": 0,
						"b": 0,
						"a": 1
					},
					"opacity": 1
				},
				"fill": {
					"type": "gradient",
					"gradient": {
						"gradientSpace": "objectBoundingBox",
						"x1": 131.5,
						"y1": 227,
						"x2": 131.5,
						"y2": 62,
						"id": "linear-gradient-1"
					}
				},
				"meta": {
					"PS": {
						"fx": {
							"gradientFillMulti": [
								{
									"enabled": true,
									"mode": "normal",
									"opacity": {
										"value": 73,
										"units": "percentUnit"
									},
									"gradient": {
										"name": "BlueToWhite",
										"gradientForm": "customStops",
										"interfaceIconFrameDimmed": 4096,
										"colors": [
											{
												"color": {
													"red": 0,
													"green": 0,
													"blue": 0
												},
												"type": "userStop",
												"location": 0,
												"midpoint": 50
											},
											{
												"color": {
													"red": 0,
													"green": 0,
													"blue": 0
												},
												"type": "userStop",
												"location": 4096,
												"midpoint": 50
											}
										],
										"transparency": [
											{
												"opacity": {
													"value": 100,
													"units": "percentUnit"
												},
												"location": 0,
												"midpoint": 50
											},
											{
												"opacity": {
													"value": 0,
													"units": "percentUnit"
												},
												"location": 4096,
												"midpoint": 50
											}
										]
									},
									"angle": {
										"value": 90,
										"units": "angleUnit"
									},
									"type": "radial",
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
							],
							"solidFillMulti": [
								{
									"enabled": true,
									"mode": "normal",
									"opacity": 0.5,
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
			"name": "Ellipse.svg",
			"visualBounds": {
				"top": 62,
				"left": 49,
				"bottom": 227,
				"right": 214
			},
			"shape": {
				"type": "circle",
				"cx": 131.5,
				"cy": 144.5,
				"r": 82.5
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
						"name": "feImage",
						"result": "image-1",
						"input": [],
						"x": 49,
						"y": 62,
						"width": 165,
						"height": 165,
						"preserveAspectRatio": "none",
						"xlink:href": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCIgd2lkdGg9IjE2NSIgaGVpZ2h0PSIxNjUiIHZpZXdCb3g9IjAgMCAxNjUgMTY1Ij4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLmNscy0xIHsKICAgICAgICBmaWxsOiB1cmwoI3JhZGlhbC1ncmFkaWVudC0xKTsKICAgICAgICBvcGFjaXR5OiAwLjczOwogICAgICB9CiAgICA8L3N0eWxlPgoKICAgIDxyYWRpYWxHcmFkaWVudCBpZD0icmFkaWFsLWdyYWRpZW50LTEiIGN4PSI4Mi41IiBjeT0iODIuNSIgcj0iODIuNSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiLz4KICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxNjUiIGhlaWdodD0iMTY1IiBjbGFzcz0iY2xzLTEiLz4KPC9zdmc+Cg=="
					},
					{
						"name": "feComposite",
						"result": "composite-1",
						"input": [
							"image-1",
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
						"mode": "normal"
					},
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
						"flood-opacity": 0.5
					},
					{
						"name": "feComposite",
						"result": "composite-2",
						"input": [
							"flood-1",
							"SourceGraphic"
						],
						"operator": "in"
					},
					{
						"name": "feBlend",
						"result": "blend-2",
						"input": [
							"composite-2",
							"blend-1"
						],
						"mode": "normal"
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
							"r": 11.260701,
							"g": 1.44358,
							"b": 184.000004,
							"a": 1
						}
					},
					{
						"offset": 0.10009765625,
						"color": {
							"r": 11.260701,
							"g": 1.44358,
							"b": 184.000004
						}
					},
					{
						"offset": 0.5,
						"color": {
							"r": 253,
							"g": 250.054474,
							"b": 2.976654
						}
					},
					{
						"offset": 0.89990234375,
						"color": {
							"r": 11.035019,
							"g": 2,
							"b": 170.000005
						}
					},
					{
						"offset": 1,
						"color": {
							"r": 11.035019,
							"g": 2,
							"b": 170.000005,
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
			"bottom": 288,
			"right": 288
		},
		"bounds": {
			"top": 0,
			"left": 0,
			"bottom": 288,
			"right": 288
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
	"name": "svgFill.psd"
}