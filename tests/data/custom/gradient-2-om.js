module.exports = {
    "children": [
        {
            "shape": {
                "height": 100,
                "type": "rect",
                "width": 100,
                "x": 100,
                "y": 100
            },
            "style": {
                "fill": {
                    "gradient": {
                        "cx": 150,
                        "cy": 150,
                        "r": 100,
                        "gradientSpace": "userSpaceOnUse",
                        "ref": "gradient"
                    },
                    "type": "gradient"
                }
            },
            "type": "shape"
        },
        {
            "shape": {
                "height": 100,
                "type": "rect",
                "width": 100,
                "x": 0,
                "y": 0
            },
            "style": {
                "fill": {
                    "gradient": {
                        "cx": 50,
                        "cy": 50,
                        "r": 50,
                        "gradientSpace": "userSpaceOnUse",
                        "ref": "gradient"
                    },
                    "type": "gradient"
                }
            },
            "type": "shape"
        }
    ],
    "global": {
        "bounds": {
            "bottom": 560,
            "left": 0,
            "right": 960,
            "top": 0
        },
        "gradients": {
            "gradient": {
                "name": "gradient",
                "stops": [
                    {
                        "color": {
                            "b": 255,
                            "g": 255,
                            "r": 255
                        },
                        "midpoint": 0.28,
                        "offset": 0
                    },
                    {
                        "color": {
                            "b": 30,
                            "g": 147,
                            "r": 255
                        },
                        "midpoint": 0.5,
                        "offset": 1
                    }
                ],
                "type": "radial"
            }
        },
        "patterns": {}
    },
    "version": "0.1.0"
}