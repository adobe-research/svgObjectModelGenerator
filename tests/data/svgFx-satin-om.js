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
						"r": 36.198442,
						"g": 218.000002,
						"b": 29.926069,
						"a": 1
					}
				},
				"meta": {
					"PS": {
						"fx": {
							"chromeFXMulti": [
								{
									"enabled": true,
									"mode": "lighten",
									"color": {
										"r": 212.000003,
										"g": 31.595331,
										"b": 31.595331,
										"a": 1
									},
									"antiAlias": false,
									"invert": false,
									"opacity": 0.7,
									"localLightingAngle": {
										"value": 155,
										"units": "angleUnit"
									},
									"distance": 28,
									"blur": 10,
									"mappingShape": {
										"name": "Gaussian"
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
				"top": 225,
				"left": 200,
				"bottom": 375,
				"right": 500
			},
			"shape": {
				"type": "rect",
				"x": 200,
				"y": 225,
				"width": 300,
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
						"name": "feFlood",
						"result": "flood-1",
						"input": [],
						"flood-color": {
							"r": 212.000003,
							"g": 31.595331,
							"b": 31.595331,
							"a": 1
						}
					},
					{
						"name": "feComposite",
						"result": "composite-1",
						"input": [
							"flood-1",
							"SourceAlpha"
						],
						"operator": "in"
					},
					{
						"name": "feOffset",
						"result": "offset-1",
						"input": [
							"composite-1"
						],
						"dx": -13.641,
						"dy": 24.453
					},
					{
						"name": "feOffset",
						"result": "offset-2",
						"input": [
							"composite-1"
						],
						"dx": 13.641,
						"dy": -24.453
					},
					{
						"name": "feComposite",
						"result": "composite-2",
						"input": [
							"offset-1",
							"offset-2"
						],
						"operator": "xor"
					},
					{
						"name": "feComposite",
						"result": "composite-3",
						"input": [
							"composite-2",
							"SourceAlpha"
						],
						"operator": "in"
					},
					{
						"name": "feGaussianBlur",
						"result": "blur-1",
						"input": [
							"composite-3"
						],
						"stdDeviation": 3.162
					},
					{
						"name": "feComponentTransfer",
						"result": "comp-1",
						"input": [
							"blur-1"
						],
						"children": [
							{
								"name": "feFuncA",
								"type": "linear",
								"slope": 0.7
							}
						]
					},
					{
						"name": "feComposite",
						"result": "composite-4",
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
							"composite-4",
							"SourceGraphic"
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
	"name": "svgFx-satin.psd"
}
