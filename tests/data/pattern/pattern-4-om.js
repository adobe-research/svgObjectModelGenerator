module.exports = {
    "children": [
        {
            "id": "shape-1",
            "type": "shape",
            "visible": true,
            "style": {
                "stroke": {
                    "type": "pattern",
                    "pattern": {
                        "ref": "pattern2"
                    },
                    "width": 20
                },
                "fill": {
                    "type": "pattern",
                    "pattern": {
                        "ref": "pattern1"
                    }
                }
            },
            "children": [],
            "title": "Rectangle 1",
            "visualBounds": {
                "top": 100,
                "left": 100,
                "bottom": 400,
                "right": 400
            },
            "shape": {
                "type": "rect",
                "x": 100,
                "y": 100,
                "width": 300,
                "height": 300
            }
        },
        {
            "id": "shape-2",
            "type": "shape",
            "visible": true,
            "style": {
                "fill": {
                    "type": "pattern",
                    "pattern": {
                        "ref": "pattern1",
                        "transform": {
                            "0": [
                                0.707107,
                                -0.707107,
                                0,
                                0
                            ],
                            "1": [
                                0.707107,
                                0.707107,
                                0,
                                0
                            ],
                            "2": [
                                0,
                                0,
                                1,
                                0
                            ],
                            "3": [
                                0,
                                0,
                                0,
                                1
                            ]
                        }
                    }
                }
            },
            "children": [],
            "title": "Rectangle 2",
            "visualBounds": {
                "top": 450,
                "left": 450,
                "bottom": 750,
                "right": 750
            },
            "shape": {
                "type": "rect",
                "x": 450,
                "y": 450,
                "width": 300,
                "height": 300
            }
        }
    ],
    "global": {
        "clipPaths": {},
        "patterns": {
            "pattern1": {
                "children": [{
                    "id": "shape-2",
                    "type": "shape",
                    "visible": true,
                    "style": {
                        "stroke": {
                            "type": "none"
                        },
                        "fill": {
                            "type": "solid",
                            "color": {
                                "r": 0,
                                "g": 127,
                                "b": 0,
                                "a": 1
                            }
                        }
                    },
                    "children": [],
                    "title": "Rectangle 2",
                    "visualBounds": {
                        "top": 0,
                        "left": 0,
                        "bottom": 50,
                        "right": 50
                    },
                    "shape": {
                        "type": "rect",
                        "x": 0,
                        "y": 0,
                        "width": 50,
                        "height": 50
                    }
                }],
                "type": "pattern",
                "bounds": {
                    "top": 0,
                    "left": 0,
                    "right": 55,
                    "bottom": 55
                }
            },
            "pattern2": {
                "children": [{
                    "id": "shape-3",
                    "type": "shape",
                    "visible": true,
                    "style": {
                        "stroke": {
                            "type": "none"
                        },
                        "fill": {
                            "type": "solid",
                            "color": {
                                "r": 0,
                                "g": 0,
                                "b": 127,
                                "a": 1
                            }
                        }
                    },
                    "children": [],
                    "title": "Rectangle 2",
                    "visualBounds": {
                        "top": 0,
                        "left": 0,
                        "bottom": 50,
                        "right": 50
                    },
                    "shape": {
                        "type": "rect",
                        "x": 0,
                        "y": 0,
                        "width": 50,
                        "height": 50
                    }
                }],
                "type": "pattern",
                "bounds": {
                    "top": 0,
                    "left": 0,
                    "right": 55,
                    "bottom": 55
                }
            }
        },
        "filters": {},
        "gradients": {},
        "masks": {},
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
