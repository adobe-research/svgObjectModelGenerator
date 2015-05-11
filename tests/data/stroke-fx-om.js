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
				"meta": {
					"PS": {
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
					}
				}
			},
			"children": [],
			"name": "Rectangle 1",
			"visualBounds": {
				"top": 88,
				"left": 88,
				"bottom": 212,
				"right": 212
			},
			"shape": {
				"type": "rect",
				"x": 100,
				"y": 100,
				"width": 100,
				"height": 100
			}
		},
		{
			"id": "shape-2",
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
					"gradient": "linear-gradient-1"
				},
				"meta": {
					"PS": {
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
					}
				}
			},
			"children": [],
			"name": "Rectangle 2",
			"visualBounds": {
				"top": 88,
				"left": 288,
				"bottom": 212,
				"right": 412
			},
			"shape": {
				"type": "rect",
				"x": 300,
				"y": 100,
				"width": 100,
				"height": 100
			}
		},
		{
			"id": "shape-3",
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
					"gradient": "linear-gradient-2"
				},
				"meta": {
					"PS": {
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
					}
				}
			},
			"children": [],
			"name": "Rectangle 3",
			"visualBounds": {
				"top": 88,
				"left": 488,
				"bottom": 212,
				"right": 612
			},
			"shape": {
				"type": "rect",
				"x": 500,
				"y": 100,
				"width": 100,
				"height": 100
			}
		},
		{
			"id": "shape-4",
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
					"gradient": "linear-gradient-3"
				},
				"meta": {
					"PS": {
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
					}
				}
			},
			"children": [],
			"name": "Rectangle 4",
			"visualBounds": {
				"top": 288,
				"left": 88,
				"bottom": 412,
				"right": 212
			},
			"shape": {
				"type": "rect",
				"x": 100,
				"y": 300,
				"width": 100,
				"height": 100
			}
		},
		{
			"id": "shape-5",
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
					"gradient": "linear-gradient-4"
				},
				"meta": {
					"PS": {
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
					}
				}
			},
			"children": [],
			"name": "Rectangle 5",
			"visualBounds": {
				"top": 288,
				"left": 288,
				"bottom": 412,
				"right": 412
			},
			"shape": {
				"type": "rect",
				"x": 300,
				"y": 300,
				"width": 100,
				"height": 100
			}
		},
		{
			"id": "shape-6",
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
					"gradient": "radial-gradient-1"
				},
				"meta": {
					"PS": {
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
					}
				}
			},
			"children": [],
			"name": "Rectangle 6",
			"visualBounds": {
				"top": 288,
				"left": 488,
				"bottom": 412,
				"right": 612
			},
			"shape": {
				"type": "rect",
				"x": 500,
				"y": 300,
				"width": 100,
				"height": 100
			}
		}
	],
	"global": {
		"clipPaths": {},
		"filters": {},
		"gradients": {
			"linear-gradient-1": {
				"stops": [
					{
						"offset": 0,
						"color": {
							"r": 9.575876,
							"g": 0.003891,
							"b": 178.000005,
							"a": 1
						}
					},
					{
						"offset": 0.5,
						"color": {
							"r": 255,
							"g": 0.003891,
							"b": 0.027237
						}
					},
					{
						"offset": 1,
						"color": {
							"r": 255,
							"g": 251.996109,
							"b": 0.003891,
							"a": 1
						}
					}
				],
				"type": "linear",
				"gradientSpace": "objectBoundingBox",
				"x1": 300,
				"y1": 150,
				"x2": 400,
				"y2": 150
			},
			"linear-gradient-2": {
				"stops": [
					{
						"offset": 0,
						"color": {
							"r": 255,
							"g": 251.996109,
							"b": 0.003891,
							"a": 1
						}
					},
					{
						"offset": 0.5,
						"color": {
							"r": 255,
							"g": 0.003891,
							"b": 0.027237
						}
					},
					{
						"offset": 1,
						"color": {
							"r": 9.575876,
							"g": 0.003891,
							"b": 178.000005,
							"a": 1
						}
					}
				],
				"type": "linear",
				"gradientSpace": "objectBoundingBox",
				"x1": 500,
				"y1": 150,
				"x2": 600,
				"y2": 150
			},
			"linear-gradient-3": {
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
						"offset": 0.14990234375,
						"color": {
							"r": 255,
							"g": 0,
							"b": 255
						}
					},
					{
						"offset": 0.330078125,
						"color": {
							"r": 0,
							"g": 0,
							"b": 255
						}
					},
					{
						"offset": 0.489990234375,
						"color": {
							"r": 0,
							"g": 255,
							"b": 255
						}
					},
					{
						"offset": 0.669921875,
						"color": {
							"r": 0,
							"g": 255,
							"b": 0
						}
					},
					{
						"offset": 0.840087890625,
						"color": {
							"r": 255,
							"g": 255,
							"b": 0
						}
					},
					{
						"offset": 1,
						"color": {
							"r": 255,
							"g": 0.003891,
							"b": 0.003891,
							"a": 1
						}
					}
				],
				"type": "linear",
				"gradientSpace": "objectBoundingBox",
				"x1": 100,
				"y1": 400,
				"x2": 200,
				"y2": 300
			},
			"linear-gradient-4": {
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
						"offset": 0.14990234375,
						"color": {
							"r": 255,
							"g": 0,
							"b": 255
						}
					},
					{
						"offset": 0.330078125,
						"color": {
							"r": 0,
							"g": 0,
							"b": 255
						}
					},
					{
						"offset": 0.489990234375,
						"color": {
							"r": 0,
							"g": 255,
							"b": 255
						}
					},
					{
						"offset": 0.669921875,
						"color": {
							"r": 0,
							"g": 255,
							"b": 0
						}
					},
					{
						"offset": 0.840087890625,
						"color": {
							"r": 255,
							"g": 255,
							"b": 0
						}
					},
					{
						"offset": 1,
						"color": {
							"r": 255,
							"g": 0.003891,
							"b": 0.003891,
							"a": 1
						}
					}
				],
				"type": "linear",
				"gradientSpace": "userSpaceOnUse",
				"x1": 99.99999999999994,
				"y1": 600,
				"x2": 700,
				"y2": 0
			},
			"radial-gradient-1": {
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
						"offset": 0.14990234375,
						"color": {
							"r": 255,
							"g": 0,
							"b": 255
						}
					},
					{
						"offset": 0.330078125,
						"color": {
							"r": 0,
							"g": 0,
							"b": 255
						}
					},
					{
						"offset": 0.489990234375,
						"color": {
							"r": 0,
							"g": 255,
							"b": 255
						}
					},
					{
						"offset": 0.669921875,
						"color": {
							"r": 0,
							"g": 255,
							"b": 0
						}
					},
					{
						"offset": 0.840087890625,
						"color": {
							"r": 255,
							"g": 255,
							"b": 0
						}
					},
					{
						"offset": 1,
						"color": {
							"r": 255,
							"g": 0.003891,
							"b": 0.003891,
							"a": 1
						}
					}
				],
				"type": "radial",
				"gradientSpace": "userSpaceOnUse",
				"r": 424.2640687119285,
				"cx": 400,
				"cy": 300
			}
		},
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
	"name": "stroke-fx.psd"
}