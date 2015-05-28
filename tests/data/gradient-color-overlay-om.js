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
						"r": 252.970012,
						"g": 197.757364,
						"b": 137.454736,
						"a": 1
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
										"value": 100,
										"units": "percentUnit"
									},
									"gradient": {
										"name": "$$$/DefaultGradient/VioletOrange=Violet, Orange",
										"gradientForm": "customStops",
										"interfaceIconFrameDimmed": 4096,
										"colors": [
											{
												"color": {
													"red": 41.003892,
													"green": 10,
													"blue": 89.003893
												},
												"type": "userStop",
												"location": 0,
												"midpoint": 50
											},
											{
												"color": {
													"red": 255,
													"green": 124,
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
													"value": 100,
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
							],
							"solidFillMulti": [
								{
									"enabled": true,
									"mode": "normal",
									"opacity": 0.3,
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
			"name": "Rectangle 1.svg",
			"visualBounds": {
				"top": 100,
				"left": 100,
				"bottom": 500,
				"right": 500
			},
			"shape": {
				"type": "rect",
				"x": 100,
				"y": 100,
				"width": 400,
				"height": 400
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
						"r": 252.970012,
						"g": 197.757364,
						"b": 137.454736,
						"a": 1
					}
				},
				"meta": {
					"PS": {
						"fx": {
							"solidFillMulti": [
								{
									"enabled": true,
									"mode": "normal",
									"opacity": 0.3,
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
				"filter": "filter-2"
			},
			"children": [],
			"name": "Rectangle 2.svg",
			"visualBounds": {
				"top": 100,
				"left": 550,
				"bottom": 300,
				"right": 750
			},
			"shape": {
				"type": "rect",
				"x": 550,
				"y": 100,
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
						"name": "feImage",
						"result": "image-1",
						"input": [],
						"x": 100,
						"y": 100,
						"width": 400,
						"height": 400,
						"preserveAspectRatio": "none",
						"xlink:href": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCA0MDAgNDAwIj4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLmNscy0xIHsKICAgICAgICBmaWxsOiB1cmwoI2xpbmVhci1ncmFkaWVudC0xKTsKICAgICAgfQogICAgPC9zdHlsZT4KCiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhci1ncmFkaWVudC0xIiB4MT0iMjAwIiB5MT0iNDAwIiB4Mj0iMjAwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzI5MGE1OSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZjdjMDAiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBjbGFzcz0iY2xzLTEiLz4KPC9zdmc+Cg=="
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
						"flood-opacity": 0.3
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
			},
			"filter-2": {
				"filterUnits": "userSpaceOnUse",
				"children": [
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
						"flood-opacity": 0.3
					},
					{
						"name": "feComposite",
						"result": "composite-1",
						"input": [
							"flood-1",
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
	"name": "gradient-color-overlay.psd"
}