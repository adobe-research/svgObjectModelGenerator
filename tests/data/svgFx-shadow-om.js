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
			"id": "shadow",
			"type": "shape",
			"visible": true,
			"style": {
				"stroke": {
					"strokeEnabled": false
				},
				"fill": {
					"style": "solid",
					"color": {
						"r": 49.63424,
						"g": 226.000002,
						"b": 161.33074,
						"a": 1
					}
				},
				"fill-opacity": 0.78,
				"fx": {
					"dropShadow": {
						"enabled": true,
						"mode": "multiply",
						"color": {
							"r": 214.000002,
							"g": 45.319066,
							"b": 45.319066,
							"a": 1
						},
						"opacity": 0.75,
						"useGlobalAngle": false,
						"localLightingAngle": {
							"value": 180,
							"units": "angleUnit"
						},
						"distance": 24,
						"chokeMatte": 0,
						"blur": 21,
						"noise": {
							"value": 0,
							"units": "percentUnit"
						},
						"antiAlias": false,
						"transferSpec": {
							"name": "Linear"
						},
						"layerConceals": true
					},
					"innerShadow": {
						"enabled": true,
						"mode": "multiply",
						"color": {
							"r": 35.295721,
							"g": 97.797663,
							"b": 225.000002,
							"a": 1
						},
						"opacity": 0.75,
						"useGlobalAngle": false,
						"localLightingAngle": {
							"value": 180,
							"units": "angleUnit"
						},
						"distance": 75,
						"chokeMatte": 0,
						"blur": 46,
						"noise": {
							"value": 0,
							"units": "percentUnit"
						},
						"antiAlias": false,
						"transferSpec": {
							"name": "Linear"
						}
					}
				}
			},
			"children": [],
			"layerName": "shadow",
			"boundsWithFX": {
				"top": 80,
				"left": 100,
				"bottom": 271,
				"right": 445
			},
			"shape": "rect",
			"shapeBounds": {
				"top": 100,
				"left": 100,
				"bottom": 250,
				"right": 400
			},
			"shapeRadii": [
				10,
				10,
				10,
				10
			]
		}
	],
	"offsetX": 0,
	"offsetY": 0,
	"viewBox": {
		"top": 0,
		"left": 0,
		"bottom": 1024,
		"right": 1024
	},
	"docBounds": {
		"top": 0,
		"left": 0,
		"bottom": 1024,
		"right": 1024
	},
	"pxToInchRatio": 144,
	"globalLight": {
		"angle": -107,
		"altitude": 90
	}
}