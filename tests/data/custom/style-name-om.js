module.exports = {
    "version": "0.1.0",
    "global": {
        "bounds": {
            "top": 0,
            "left": 0,
            "bottom": 200,
            "right": 200
        }
    },
    "children": [
        {
            "type": "shape",
            "shape": {
                "type": "circle",
                "cx": 100,
                "cy": 100,
                "r": 100
            },
            "style": {
                "name": "Shouldn't show up",
                "stroke": {
                    "width": 10,
                    "type": "solid",
                    "color": {
                        "r": 0,
                        "g": 127,
                        "b": 0
                    }
                }
            },
        }
    ]
}
