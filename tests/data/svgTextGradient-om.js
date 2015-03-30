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
							"gradientFillMulti": [
								{
									"enabled": true,
									"mode": "normal",
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
										"value": 0,
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
							"value": 31.8176,
							"units": "pointsUnit"
						},
						"fill": {
							"type": "solid",
							"color": {
								"r": 104.998793,
								"g": 104.998793,
								"b": 104.998793,
								"a": 1
							}
						},
						"font-family": "\"Myriad Pro\""
					},
					"children": [],
					"text": "This is a text",
					"visualBounds": {
						"top": 161,
						"left": 303,
						"bottom": 207,
						"right": 623
					},
					"position": {
						"x": 303,
						"y": 0,
						"unitX": "px",
						"unitY": "em"
					}
				}
			],
			"title": "This is a text.svg",
			"visualBounds": {
				"top": 161,
				"left": 303,
				"bottom": 207,
				"right": 623
			},
			"position": {
				"x": 303,
				"y": 206,
				"unitX": "px",
				"unitY": "px"
			},
			"maxTextSize": 64
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
						"x": 303,
						"y": 161,
						"width": 320,
						"height": 46,
						"preserveAspectRatio": "none",
						"xlink:href": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCIgd2lkdGg9IjMyMCIgaGVpZ2h0PSI0NiIgdmlld0JveD0iMCAwIDMyMCA0NiI+CiAgPGRlZnM+CiAgICA8c3R5bGU+CiAgICAgIC5jbHMtMSB7CiAgICAgICAgZmlsbDogdXJsKCNsaW5lYXItZ3JhZGllbnQtMSk7CiAgICAgIH0KICAgIDwvc3R5bGU+CgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJsaW5lYXItZ3JhZGllbnQtMSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHkxPSIyMyIgeDI9IjMyMCIgeTI9IjIzIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmY2ZTAyIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMC41IiBzdG9wLWNvbG9yPSIjZmYwIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2ZmNmQwMCIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjMyMCIgaGVpZ2h0PSI0NiIgY2xhc3M9ImNscy0xIi8+Cjwvc3ZnPgo="
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
				"angle": 120,
				"altitude": 30
			}
		}
	},
	"title": "svgTextGradient.psd"
}
