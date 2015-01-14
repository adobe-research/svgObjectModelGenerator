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
					"lineWidth": 10,
					"color": {
						"r": 0,
						"g": 0,
						"b": 0,
						"a": 1
					},
					"opacity": 0.5,
					"lineCap": "butt",
					"lineJoin": "round",
					"miterLimit": 100,
					"sourceStyle": "outsetFrame"
				},
				"fx": {
					"frameFX": {
						"enabled": true,
						"style": "outsetFrame",
						"paintType": "solidColor",
						"mode": "normal",
						"opacity": {
							"value": 50,
							"units": "percentUnit"
						},
						"size": 10,
						"color": {
							"red": 0,
							"green": 0,
							"blue": 0
						}
					}
				}
			},
			"children": [],
			"layerName": "Rectangle 1",
			"boundsWithFX": {
				"top": 88,
				"left": 88,
				"bottom": 212,
				"right": 212
			},
			"shape": "rect",
			"shapeBounds": {
				"top": 100,
				"left": 100,
				"bottom": 200,
				"right": 200
			}
		},
		{
			"id": "rectangle-2",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "gradient",
					"lineWidth": 10,
					"color": {
						"r": 0,
						"g": 0,
						"b": 0,
						"a": 1
					},
					"opacity": 0.8,
					"lineCap": "butt",
					"lineJoin": "round",
					"miterLimit": 100,
					"sourceStyle": "outsetFrame",
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
						"angle": 0,
						"gradientSpace": "objectBoundingBox"
					}
				},
				"fx": {
					"frameFX": {
						"enabled": true,
						"style": "outsetFrame",
						"paintType": "gradientFill",
						"mode": "normal",
						"opacity": {
							"value": 80,
							"units": "percentUnit"
						},
						"size": 10,
						"color": {
							"red": 0,
							"green": 0,
							"blue": 0
						},
						"gradient": {
							"name": "$$$/DefaultGradient/BlueRedYellow=Blue, Red, Yellow",
							"gradientForm": "customStops",
							"interfaceIconFrameDimmed": 4096,
							"colors": [
								{
									"color": {
										"red": 9.575876,
										"green": 0.003891,
										"blue": 178.000005
									},
									"type": "userStop",
									"location": 0,
									"midpoint": 50
								},
								{
									"color": {
										"red": 255,
										"green": 0.003891,
										"blue": 0.027237
									},
									"type": "userStop",
									"location": 2048,
									"midpoint": 50
								},
								{
									"color": {
										"red": 255,
										"green": 251.996109,
										"blue": 0.003891
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
							"value": 0,
							"units": "angleUnit"
						},
						"type": "linear",
						"reverse": false,
						"dither": false,
						"scale": {
							"value": 100,
							"units": "percentUnit"
						},
						"align": true,
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
				}
			},
			"children": [],
			"layerName": "Rectangle 2",
			"boundsWithFX": {
				"top": 88,
				"left": 288,
				"bottom": 212,
				"right": 412
			},
			"shape": "rect",
			"shapeBounds": {
				"top": 100,
				"left": 300,
				"bottom": 200,
				"right": 400
			}
		},
		{
			"id": "rectangle-3",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "gradient",
					"lineWidth": 10,
					"color": {
						"r": 0,
						"g": 0,
						"b": 0,
						"a": 1
					},
					"opacity": 0.1,
					"lineCap": "butt",
					"lineJoin": "round",
					"miterLimit": 100,
					"sourceStyle": "outsetFrame",
					"gradient": {
						"stops": [
							{
								"position": 0,
								"color": {
									"r": 255,
									"g": 251.996109,
									"b": 0.003891,
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
									"r": 9.575876,
									"g": 0.003891,
									"b": 178.000005,
									"a": 1
								}
							}
						],
						"scale": 1,
						"type": "linear",
						"angle": 0,
						"gradientSpace": "objectBoundingBox"
					}
				},
				"fx": {
					"frameFX": {
						"enabled": true,
						"style": "outsetFrame",
						"paintType": "gradientFill",
						"mode": "normal",
						"opacity": {
							"value": 10,
							"units": "percentUnit"
						},
						"size": 10,
						"color": {
							"red": 0,
							"green": 0,
							"blue": 0
						},
						"gradient": {
							"name": "$$$/DefaultGradient/BlueRedYellow=Blue, Red, Yellow",
							"gradientForm": "customStops",
							"interfaceIconFrameDimmed": 4096,
							"colors": [
								{
									"color": {
										"red": 9.575876,
										"green": 0.003891,
										"blue": 178.000005
									},
									"type": "userStop",
									"location": 0,
									"midpoint": 50
								},
								{
									"color": {
										"red": 255,
										"green": 0.003891,
										"blue": 0.027237
									},
									"type": "userStop",
									"location": 2048,
									"midpoint": 50
								},
								{
									"color": {
										"red": 255,
										"green": 251.996109,
										"blue": 0.003891
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
							"value": 0,
							"units": "angleUnit"
						},
						"type": "linear",
						"reverse": true,
						"dither": false,
						"scale": {
							"value": 100,
							"units": "percentUnit"
						},
						"align": true,
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
				}
			},
			"children": [],
			"layerName": "Rectangle 3",
			"boundsWithFX": {
				"top": 88,
				"left": 488,
				"bottom": 212,
				"right": 612
			},
			"shape": "rect",
			"shapeBounds": {
				"top": 100,
				"left": 500,
				"bottom": 200,
				"right": 600
			}
		},
		{
			"id": "rectangle-4",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "gradient",
					"lineWidth": 10,
					"color": {
						"r": 0,
						"g": 0,
						"b": 0,
						"a": 1
					},
					"opacity": 1,
					"lineCap": "butt",
					"lineJoin": "round",
					"miterLimit": 100,
					"sourceStyle": "outsetFrame",
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
						"angle": 45,
						"gradientSpace": "objectBoundingBox"
					}
				},
				"fx": {
					"frameFX": {
						"enabled": true,
						"style": "outsetFrame",
						"paintType": "gradientFill",
						"mode": "normal",
						"opacity": {
							"value": 100,
							"units": "percentUnit"
						},
						"size": 10,
						"color": {
							"red": 0,
							"green": 0,
							"blue": 0
						},
						"gradient": {
							"name": "$$$/DefaultGradient/Spectrum=Spectrum",
							"gradientForm": "customStops",
							"interfaceIconFrameDimmed": 4096,
							"colors": [
								{
									"color": {
										"red": 255,
										"green": 0.003891,
										"blue": 0.003891
									},
									"type": "userStop",
									"location": 0,
									"midpoint": 50
								},
								{
									"color": {
										"red": 255,
										"green": 0,
										"blue": 255
									},
									"type": "userStop",
									"location": 614,
									"midpoint": 50
								},
								{
									"color": {
										"red": 0,
										"green": 0,
										"blue": 255
									},
									"type": "userStop",
									"location": 1352,
									"midpoint": 50
								},
								{
									"color": {
										"red": 0,
										"green": 255,
										"blue": 255
									},
									"type": "userStop",
									"location": 2007,
									"midpoint": 50
								},
								{
									"color": {
										"red": 0,
										"green": 255,
										"blue": 0
									},
									"type": "userStop",
									"location": 2744,
									"midpoint": 50
								},
								{
									"color": {
										"red": 255,
										"green": 255,
										"blue": 0
									},
									"type": "userStop",
									"location": 3441,
									"midpoint": 50
								},
								{
									"color": {
										"red": 255,
										"green": 0.003891,
										"blue": 0.003891
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
							"value": 45,
							"units": "angleUnit"
						},
						"type": "linear",
						"reverse": false,
						"dither": false,
						"scale": {
							"value": 100,
							"units": "percentUnit"
						},
						"align": true,
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
				}
			},
			"children": [],
			"layerName": "Rectangle 4",
			"boundsWithFX": {
				"top": 288,
				"left": 88,
				"bottom": 412,
				"right": 212
			},
			"shape": "rect",
			"shapeBounds": {
				"top": 300,
				"left": 100,
				"bottom": 400,
				"right": 200
			}
		},
		{
			"id": "rectangle-5",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "gradient",
					"lineWidth": 10,
					"color": {
						"r": 0,
						"g": 0,
						"b": 0,
						"a": 1
					},
					"opacity": 1,
					"lineCap": "butt",
					"lineJoin": "round",
					"miterLimit": 100,
					"sourceStyle": "outsetFrame",
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
						"angle": 45,
						"gradientSpace": "userSpaceOnUse"
					}
				},
				"fx": {
					"frameFX": {
						"enabled": true,
						"style": "outsetFrame",
						"paintType": "gradientFill",
						"mode": "normal",
						"opacity": {
							"value": 100,
							"units": "percentUnit"
						},
						"size": 10,
						"color": {
							"red": 0,
							"green": 0,
							"blue": 0
						},
						"gradient": {
							"name": "$$$/DefaultGradient/Spectrum=Spectrum",
							"gradientForm": "customStops",
							"interfaceIconFrameDimmed": 4096,
							"colors": [
								{
									"color": {
										"red": 255,
										"green": 0.003891,
										"blue": 0.003891
									},
									"type": "userStop",
									"location": 0,
									"midpoint": 50
								},
								{
									"color": {
										"red": 255,
										"green": 0,
										"blue": 255
									},
									"type": "userStop",
									"location": 614,
									"midpoint": 50
								},
								{
									"color": {
										"red": 0,
										"green": 0,
										"blue": 255
									},
									"type": "userStop",
									"location": 1352,
									"midpoint": 50
								},
								{
									"color": {
										"red": 0,
										"green": 255,
										"blue": 255
									},
									"type": "userStop",
									"location": 2007,
									"midpoint": 50
								},
								{
									"color": {
										"red": 0,
										"green": 255,
										"blue": 0
									},
									"type": "userStop",
									"location": 2744,
									"midpoint": 50
								},
								{
									"color": {
										"red": 255,
										"green": 255,
										"blue": 0
									},
									"type": "userStop",
									"location": 3441,
									"midpoint": 50
								},
								{
									"color": {
										"red": 255,
										"green": 0.003891,
										"blue": 0.003891
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
							"value": 45,
							"units": "angleUnit"
						},
						"type": "linear",
						"reverse": false,
						"dither": false,
						"scale": {
							"value": 100,
							"units": "percentUnit"
						},
						"align": false,
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
				}
			},
			"children": [],
			"layerName": "Rectangle 5",
			"boundsWithFX": {
				"top": 288,
				"left": 288,
				"bottom": 412,
				"right": 412
			},
			"shape": "rect",
			"shapeBounds": {
				"top": 300,
				"left": 300,
				"bottom": 400,
				"right": 400
			}
		},
		{
			"id": "rectangle-6",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"type": "gradient",
					"lineWidth": 10,
					"color": {
						"r": 0,
						"g": 0,
						"b": 0,
						"a": 1
					},
					"opacity": 1,
					"lineCap": "butt",
					"lineJoin": "round",
					"miterLimit": 100,
					"sourceStyle": "outsetFrame",
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
						"angle": 45,
						"gradientSpace": "userSpaceOnUse"
					}
				},
				"fx": {
					"frameFX": {
						"enabled": true,
						"style": "outsetFrame",
						"paintType": "gradientFill",
						"mode": "normal",
						"opacity": {
							"value": 100,
							"units": "percentUnit"
						},
						"size": 10,
						"color": {
							"red": 0,
							"green": 0,
							"blue": 0
						},
						"gradient": {
							"name": "$$$/DefaultGradient/Spectrum=Spectrum",
							"gradientForm": "customStops",
							"interfaceIconFrameDimmed": 4096,
							"colors": [
								{
									"color": {
										"red": 255,
										"green": 0.003891,
										"blue": 0.003891
									},
									"type": "userStop",
									"location": 0,
									"midpoint": 50
								},
								{
									"color": {
										"red": 255,
										"green": 0,
										"blue": 255
									},
									"type": "userStop",
									"location": 614,
									"midpoint": 50
								},
								{
									"color": {
										"red": 0,
										"green": 0,
										"blue": 255
									},
									"type": "userStop",
									"location": 1352,
									"midpoint": 50
								},
								{
									"color": {
										"red": 0,
										"green": 255,
										"blue": 255
									},
									"type": "userStop",
									"location": 2007,
									"midpoint": 50
								},
								{
									"color": {
										"red": 0,
										"green": 255,
										"blue": 0
									},
									"type": "userStop",
									"location": 2744,
									"midpoint": 50
								},
								{
									"color": {
										"red": 255,
										"green": 255,
										"blue": 0
									},
									"type": "userStop",
									"location": 3441,
									"midpoint": 50
								},
								{
									"color": {
										"red": 255,
										"green": 0.003891,
										"blue": 0.003891
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
							"value": 45,
							"units": "angleUnit"
						},
						"type": "radial",
						"reverse": false,
						"dither": false,
						"scale": {
							"value": 100,
							"units": "percentUnit"
						},
						"align": false,
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
				}
			},
			"children": [],
			"layerName": "Rectangle 6",
			"boundsWithFX": {
				"top": 288,
				"left": 488,
				"bottom": 412,
				"right": 612
			},
			"shape": "rect",
			"shapeBounds": {
				"top": 300,
				"left": 500,
				"bottom": 400,
				"right": 600
			}
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