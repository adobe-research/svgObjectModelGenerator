{
    "children": [
        {
            "id": "shape-1",
            "type": "shape",
            "visible": true,
            "style": {
                "fill": {
                    "type": "solid",
                    "color": {
                        "r": 0,
                        "g": 127,
                        "b": 0,
                        "a": 1
                    }
                },
                "clip-path": "clipPath1"
            },
            "children": [],
            "title": "Rectangle 1",
            "shapeBounds": {
                "top": 0,
                "left": 0,
                "bottom": 300,
                "right": 300
            },
            "shape": {
                "type": "rect",
                "x": 0,
                "y": 0,
                "width": 300,
                "height": 300
            }
        }
    ],
    "global": {
        "clipPaths": {
            "clipPath1": {
                "children": [{
                    "id": "shape-2",
                    "type": "shape",
                    "visible": true,
                    "children": [],
                    "title": "Rectangle 1",
                    "shapeBounds": {
                        "top": 50,
                        "left": 50,
                        "bottom": 250,
                        "right": 250
                    },
                    "style": {
                        "clip-path": "clipPath2"
                    },
                    "shape": {
                        "type": "path",
                        "path": "M50,50 L250,50 L250,250 L50,250z",
                        "winding": "evenodd"
                    }
                }],
                "type": "clipPath"
            },
            "clipPath2": {
                "children": [{
                    "id": "shape-3",
                    "type": "shape",
                    "visible": true,
                    "children": [],
                    "title": "Rectangle 1",
                    "shapeBounds": {
                        "top": 100,
                        "left": 100,
                        "bottom": 200,
                        "right": 200
                    },
                    "shape": {
                        "type": "path",
                        "path": "M100,100 L200,100 L200,200 L100,200z",
                        "winding": "evenodd"
                    }
                }],
                "type": "clipPath"
            }
        },
        "filters": {},
        "gradients": {},
        "masks": {},
        "patterns": {},
        "viewBox": {
            "top": 0,
            "left": 0,
            "bottom": 768,
            "right": 1024
        },
        "bounds": {
            "top": 0,
            "left": 0,
            "bottom": 768,
            "right": 1024
        },
        "pxToInchRatio": 72
    },
    "artboards": {},
    "meta": {},
    "title": "ClipPath test"
}
