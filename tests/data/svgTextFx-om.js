module.exports = {
	"children": [
		{
			"id": "background-1",
			"type": "background",
			"visible": true,
			"style": {},
			"children": [],
			"title": "Background"
		},
		{
			"id": "text-1",
			"type": "text",
			"visible": true,
			"style": {
				"font-size": {
					"units": "pointsUnit",
					"value": 31.8176
				},
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
									"useGlobalAngle": true,
									"localLightingAngle": {
										"value": 120,
										"units": "angleUnit"
									},
									"distance": 8,
									"chokeMatte": 0,
									"blur": 18,
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
							"gradientFillMulti": [
								{
									"enabled": true,
									"mode": "lighten",
									"opacity": {
										"value": 100,
										"units": "percentUnit"
									},
									"gradient": {
										"name": "$$$/DefaultGradient/OrangeYellowOrange=Orange, Yellow, Orange",
										"gradientForm": "customStops",
										"interfaceIconFrameDimmed": 4096,
										"colors": [
											{
												"color": {
													"red": 255,
													"green": 110.268479,
													"blue": 2.003891
												},
												"type": "userStop",
												"location": 0,
												"midpoint": 50
											},
											{
												"color": {
													"red": 255,
													"green": 254.984436,
													"blue": 0.003891
												},
												"type": "userStop",
												"location": 2048,
												"midpoint": 50
											},
											{
												"color": {
													"red": 255,
													"green": 109.124513,
													"blue": 0.003891
												},
												"type": "userStop",
												"location": 4096,
												"midpoint": 47
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
													"value": 100,
													"units": "percentUnit"
												},
												"location": 4096,
												"midpoint": 50
											}
										]
									},
									"angle": {
										"value": 35,
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
							]
						}
					}
				},
				"filter": "filter-1"
			},
			"children": [
				{
					"id": "tspan-1",
					"type": "tspan",
					"visible": true,
					"style": {
						"font-size": {
							"units": "pointsUnit",
							"value": 31.8176
						}
					},
					"children": [
						{
							"id": "tspan-2",
							"type": "tspan",
							"visible": true,
							"style": {
								"fill": {
									"type": "solid",
									"color": {
										"r": 2.9988,
										"g": 2.9988,
										"b": 2.9988,
										"a": 1
									}
								},
								"font-family": "\"Minion Pro\"",
								"font-size": {
									"value": 31.8176,
									"units": "pointsUnit"
								}
							},
							"children": [],
							"text": "This is a ",
							"textBounds": {
								"top": 131,
								"left": 246,
								"bottom": 154,
								"right": 403
							}
						},
						{
							"id": "tspan-3",
							"type": "tspan",
							"visible": true,
							"style": {
								"fill": {
									"type": "solid",
									"color": {
										"r": 2.0043,
										"g": 65.251953,
										"b": 255,
										"a": 1
									}
								},
								"font-family": "\"Minion Pro\"",
								"font-size": {
									"value": 31.8176,
									"units": "pointsUnit"
								}
							},
							"children": [],
							"text": "text",
							"textBounds": {
								"top": 131,
								"left": 246,
								"bottom": 154,
								"right": 403
							}
						}
					],
					"position": {
						"x": 245,
						"y": 154,
						"unitX": "px",
						"unitY": "px"
					},
					"textBounds": {
						"top": 131,
						"left": 246,
						"bottom": 154,
						"right": 403
					}
				}
			],
			"title": "This is a text",
			"boundsWithFX": {
				"top": 114,
				"left": 221,
				"bottom": 172,
				"right": 413
			},
			"shapeBounds": {
				"top": 131,
				"left": 246,
				"bottom": 154,
				"right": 403
			},
			"textBounds": {
				"top": 131,
				"left": 246,
				"bottom": 154,
				"right": 403
			},
			"position": {
				"x": 245,
				"y": 154,
				"unitX": "px",
				"unitY": "px"
			},
			"maxTextSize": 32
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
						"stdDeviation": 4.243
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
						"dx": 4,
						"dy": 6.928
					},
					{
						"name": "feBlend",
						"result": "blend-1",
						"input": [
							"SourceGraphic",
							"offset-1"
						]
					},
					{
						"name": "feImage",
						"result": "image-1",
						"input": [],
						"x": 246,
						"y": 131,
						"width": 157,
						"height": 23,
						"preserveAspectRatio": "none",
						"xlink:href": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCIgd2lkdGg9IjE1NyIgaGVpZ2h0PSIyMyIgdmlld0JveD0iMCAwIDE1NyAyMyI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogdXJsKCNsaW5lYXItZ3JhZGllbnQtMSk7CiAgICAgICAgb3BhY2l0eTogMTsKICAgICAgfQogICAgPC9zdHlsZT4KCiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhci1ncmFkaWVudC0xIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjYyLjA3NiIgeTE9IjIzIiB4Mj0iOTQuOTI0Ij4KICAgICAgPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmY2ZTAyIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMC41IiBzdG9wLWNvbG9yPSIjZmYwIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2ZmNmQwMCIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjE1NyIgaGVpZ2h0PSIyMyIgY2xhc3M9ImNscy0xIi8+Cjwvc3ZnPgo="
					},
					{
						"name": "feComposite",
						"result": "composite-2",
						"input": [
							"image-1",
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
						"mode": "lighten"
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
	"title": "svgTextFx.psd"
}