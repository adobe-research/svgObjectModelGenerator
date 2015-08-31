// Copyright (c) 2014, 2015 Adobe Systems Incorporated. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function () {
    "use strict";

    var Utils = require("./utils.js"),
        asin = Math.asin,
        sin = Math.sin,
        cos = Math.cos,
        tan = Math.tan,
        atan2 = Math.atan2,
        deg2Rad = Math.PI / 180,
        rad2Deg = 180 / Math.PI,
        round2 = Utils.round2,
        roundP = Utils.roundP,

        MatrixClass = function () {

            function innerProd(a, b) {
                var sum = 0,
                    len = a.length,
                    i;
                for (i = 0; i < len; i += 1) {
                    sum += a[i] * b[i];
                }
                return sum;
            }

            function vector3Length(x, y, z) {
                return Math.sqrt(x * x + y * y + z * z);
            }

            function vectorNorm(v) {
                var sum = 0,
                    len = v.length,
                    i;
                for (i = 0; i < len; i += 1) {
                    sum += v[i] * v[i];
                }
                return Math.sqrt(sum);
            }

            function vectorNormalize(v) {
                var len = v.length,
                    norm = vectorNorm(v),
                    w = [],
                    i;
                w.length = len;
                if (norm === 0) {
                    norm = 1;
                }
                for (i = 0; i < len; i += 1) {
                    w[i] = v[i] / norm;
                }
                return w;
            }

            function combine(a, b, ascl, bscl) {
                // see the CSS 2d Transform spec
                var result = new Array(3);
                result[0] = ascl * a[0] + bscl * b[0];
                result[1] = ascl * a[1] + bscl * b[1];
                result[2] = ascl * a[2] + bscl * b[2];
                return result;
            }

            function vector3Cross(a, b) {
                // For 1-based, the formula is :
                //(a2b3 - a3b2, a3b1 - a1b3, a1b2 - a2b1)
                var result = new Array(3);
                if (a.length !== 3 || b.length !== 3) {
                    return null;
                }

                result[0] = a[1] * b[2] - a[2] * b[1];
                result[1] = a[2] * b[0] - a[0] * b[2];
                result[2] = a[0] * b[1] - a[1] * b[0];
                return result;
            }

            function Matrix4x4(other) {
                var i, j;

                this.identity = function () {
                    var i,
                        j;
                    for (i = 0; i < 4; i += 1) {
                        this[i] = new Array(4);
                        for (j = 0; j < 4; j += 1) {
                            this[i][j] = 0;
                        }
                        this[i][i] = 1;
                    }
                    return this;
                };

                if (other) {
                    if (typeof other == "object" &&
                        typeof other.a == "number" &&
                        typeof other.b == "number" &&
                        typeof other.c == "number" &&
                        typeof other.d == "number" &&
                        typeof other.tx == "number" &&
                        typeof other.ty == "number") {
                        this.identity();
                        this[0][0] = other.a;
                        this[0][1] = other.b;
                        this[1][0] = other.c;
                        this[1][1] = other.d;
                        this[3][0] = other.tx || 0;
                        this[3][1] = other.ty || 0;
                    } else {
                        // FIXME: We do not check if `other` is
                        // a 4x4 matrix yet.
                        for (i = 0; i < 4; i += 1) {
                            this[i] = new Array(4);
                            for (j = 0; j < 4; j += 1) {
                                this[i][j] = other[i][j];
                            }
                        }
                    }
                } else {
                    this.identity();
                }

                this.isIdentity = function () {
                    return this[0][0] == 1 &&
                            !this[0][1] &&
                            !this[0][2] &&
                            !this[0][3] &&
                            !this[1][0] &&
                            this[1][1] == 1 &&
                            !this[1][2] &&
                            !this[1][3] &&
                            !this[2][0] &&
                            !this[2][1] &&
                            this[2][2] == 1 &&
                            !this[2][3] &&
                            !this[3][0] &&
                            !this[3][1] &&
                            !this[3][2] &&
                            this[3][3] == 1;
                };

                this.determinant = function () {
                    // This could be faster - we need to factor out some of the
                    // multiplies we do multiple times
                    var m00 = this[0][0],
                        m01 = this[0][1],
                        m02 = this[0][2],
                        m03 = this[0][3],
                        m10 = this[1][0],
                        m11 = this[1][1],
                        m12 = this[1][2],
                        m13 = this[1][3],
                        m20 = this[2][0],
                        m21 = this[2][1],
                        m22 = this[2][2],
                        m23 = this[2][3],
                        m30 = this[3][0],
                        m31 = this[3][1],
                        m32 = this[3][2],
                        m33 = this[3][3],
                        det = m03 * m12 * m21 * m30 - m02 * m13 * m21 * m30 -
                            m03 * m11 * m22 * m30 + m01 * m13 * m22 * m30 +
                            m02 * m11 * m23 * m30 - m01 * m12 * m23 * m30 -
                            m03 * m12 * m20 * m31 + m02 * m13 * m20 * m31 +
                            m03 * m10 * m22 * m31 - m00 * m13 * m22 * m31 -
                            m02 * m10 * m23 * m31 + m00 * m12 * m23 * m31 +
                            m03 * m11 * m20 * m32 - m01 * m13 * m20 * m32 -
                            m03 * m10 * m21 * m32 + m00 * m13 * m21 * m32 +
                            m01 * m10 * m23 * m32 - m00 * m11 * m23 * m32 -
                            m02 * m11 * m20 * m33 + m01 * m12 * m20 * m33 +
                            m02 * m10 * m21 * m33 - m00 * m12 * m21 * m33 -
                            m01 * m10 * m22 * m33 + m00 * m11 * m22 * m33;
                    return det;
                };

                // Normalize in place
                this.normalizeTransform = function () {
                    // Normalize the matrix.
                    if (this[3][3] === 0) {
                        return false;
                    }

                    var i,
                        j;
                    for (i = 0; i < 4; i += 1) {
                        for (j = 0; j < 4; j += 1) {
                            this[i][j] /= this[3][3];
                        }
                    }
                    return true;
                };

                this.transpose = function () {
                    var m = new Matrix4x4(),
                        i,
                        j;
                    for (i = 0; i < 4; i += 1) {
                        for (j = 0; j < 4; j += 1) {
                            m[i][j] = this[j][i];
                        }
                    }
                    return m;
                };

                this.rightMultiply = function (rowVector) {
                    // This does a pure matrix multiply, Not a transform with perspective
                    var v = new Array(4);

                    for (var i = 0; i < 4; i++) {
                        v[i] = 0;
                        for (var j = 0; j < 4; j++) {
                            v[i] += rowVector[j] * this[j][i];
                        }
                    }
                    return v;
                };

                this.transformPoint = function (inPt) {
                    var p0 = inPt[0],
                        p1 = inPt[1];

                    inPt = [];
                    inPt[0] = this[0][0] * p0 + this[1][0] * p1 + this[3][0];
                    inPt[1] = this[0][1] * p0 + this[1][1] * p1 + this[3][1];

                    return inPt;
                };

                this.transformPoints = function (aPoints) {
                    var i;
                    for (i = 0; i < aPoints.length; i++) {
                        aPoints[i] = this.transformPoint(aPoints[i]);
                    }
                    return aPoints;
                };

                this.inverse = function () {
                    var m00 = this[0][0],
                        m01 = this[0][1],
                        m02 = this[0][2],
                        m03 = this[0][3],
                        m10 = this[1][0],
                        m11 = this[1][1],
                        m12 = this[1][2],
                        m13 = this[1][3],
                        m20 = this[2][0],
                        m21 = this[2][1],
                        m22 = this[2][2],
                        m23 = this[2][3],
                        m30 = this[3][0],
                        m31 = this[3][1],
                        m32 = this[3][2],
                        m33 = this[3][3],
                    // Generate all the 2x2 determinants we need
                        d10_21_11_20 = m10 * m21 - m11 * m20,
                        d10_22_12_20 = m10 * m22 - m12 * m20,
                        d10_23_13_20 = m10 * m23 - m13 * m20,
                        d10_31_11_30 = m10 * m31 - m11 * m30,
                        d10_32_12_30 = m10 * m32 - m12 * m30,
                        d10_33_13_20 = m10 * m33 - m13 * m20,
                        d10_33_13_30 = m10 * m33 - m13 * m30,
                        d11_22_12_21 = m11 * m22 - m12 * m21,
                        d11_32_12_31 = m11 * m32 - m12 * m31,
                        d11_32_13_21 = m11 * m32 - m13 * m21,
                        d11_33_13_21 = m11 * m33 - m13 * m21,
                        d11_33_13_31 = m11 * m33 - m13 * m31,
                        d12_23_13_22 = m12 * m23 - m13 * m22,
                        d12_32_13_22 = m12 * m32 - m13 * m22,
                        d12_33_13_32 = m12 * m33 - m13 * m32,
                        d20_31_21_30 = m20 * m31 - m21 * m30,
                        d20_32_22_30 = m20 * m32 - m22 * m30,
                        d20_33_23_30 = m20 * m33 - m23 * m30,
                        d21_32_22_31 = m21 * m32 - m22 * m31,
                        d21_33_23_31 = m21 * m33 - m23 * m31,
                        d22_33_23_32 = m22 * m33 - m23 * m32,
                    // Build the cofactor matrix
                        c00 = m11 * d22_33_23_32 - m12 * d21_33_23_31 + m13 * d21_32_22_31,
                        c01 = m10 * d22_33_23_32 - m12 * d20_33_23_30 + m13 * d20_32_22_30,
                        c02 = m10 * d21_33_23_31 - m11 * d20_33_23_30 + m13 * d20_31_21_30,
                        c03 = m10 * d21_32_22_31 - m11 * d20_32_22_30 + m12 * d20_31_21_30,
                        c10 = m01 * d22_33_23_32 - m02 * d21_33_23_31 + m03 * d21_32_22_31,
                        c11 = m00 * d22_33_23_32 - m02 * d20_33_23_30 + m03 * d20_32_22_30,
                        c12 = m00 * d21_33_23_31 - m01 * d20_33_23_30 + m03 * d20_31_21_30,
                        c13 = m00 * d21_32_22_31 - m01 * d20_32_22_30 + m02 * d20_31_21_30,
                        c20 = m01 * d12_33_13_32 - m02 * d11_33_13_31 + m03 * d11_32_12_31,
                        c21 = m00 * d12_33_13_32 - m02 * d10_33_13_30 + m03 * d10_32_12_30,
                        c22 = m00 * d11_33_13_31 - m01 * d10_33_13_30 + m03 * d10_31_11_30,
                        c23 = m00 * d11_33_13_31 - m01 * d10_33_13_30 + m03 * d10_31_11_30,
                        c30 = m01 * d12_32_13_22 - m02 * d11_32_13_21 + m03 * d11_22_12_21,
                        c31 = m00 * d12_23_13_22 - m02 * d10_23_13_20 + m03 * d10_22_12_20,
                        c32 = m00 * d11_33_13_21 - m01 * d10_33_13_20 + m03 * d10_21_11_20,
                        c33 = m00 * d11_22_12_21 - m01 * d10_22_12_20 + m02 * d10_21_11_20;
                    c01 = -c01;
                    c03 = -c03;
                    c10 = -c10;
                    c12 = -c12;
                    c21 = -c21;
                    c23 = -c23;
                    c30 = -c30;
                    c32 = -c32;

                    var det = m00 * c00 + m01 * c01 + m02 * c02 + m03 * c03; // cofactor already has -1 builtin so just add
                    if (det === 0) {
                        return;
                    }

                    var m = new Matrix4x4(),
                        invDet = 1 / det;

                    m[0][0] = c00 * invDet;
                    m[0][1] = c10 * invDet;
                    m[0][2] = c20 * invDet;
                    m[0][3] = c30 * invDet;
                    m[1][0] = c01 * invDet;
                    m[1][1] = c11 * invDet;
                    m[1][2] = c21 * invDet;
                    m[1][3] = c31 * invDet;
                    m[2][0] = c02 * invDet;
                    m[2][1] = c12 * invDet;
                    m[2][2] = c22 * invDet;
                    m[2][3] = c32 * invDet;
                    m[3][0] = c03 * invDet;
                    m[3][1] = c13 * invDet;
                    m[3][2] = c23 * invDet;
                    m[3][3] = c33 * invDet;

                    return m;
                };

                this.rotate3d = function (x, y, z, angle, angleIsRadians) {
                    var rotate = new Matrix4x4(),
                        s,
                        c,
                        len;
                    if (!angleIsRadians) {
                        angle *= deg2Rad;
                    }

                    if (angle) {

                        len = vector3Length(x, y, z);
                        if (len !== 0) {
                            x = x / len;
                            y = y / len;
                            z = z / len;

                            s = sin(angle);
                            c = cos(angle);
                            /* From the CSS3 spec:
                             This function is equivalent to
                             matrix3d(
                             1 + (1-cos(angle))*(x*x-1), -z*sin(angle)+(1-cos(angle))*x*y, y*sin(angle)+(1-cos(angle))*x*z, 0,
                             z*sin(angle)+(1-cos(angle))*x*y, 1 + (1-cos(angle))*(y*y-1), -x*sin(angle)+(1-cos(angle))*y*z, 0,
                             -y*sin(angle)+(1-cos(angle))*x*z, x*sin(angle)+(1-cos(angle))*y*z, 1 + (1-cos(angle))*(z*z-1), 0,
                             0, 0, 0, 1) (this is in column-major order )
                             */

                            rotate[0][0] = 1 + (1 - c) * (x * x - 1);
                            rotate[1][0] = -z * s + (1 - c) * x * y;
                            rotate[2][0] = y * s + (1 - c) * x * z;
                            rotate[3][0] = 0;
                            rotate[0][1] = z * s + (1 - c) * x * y;
                            rotate[1][1] = 1 + (1 - c) * (y * y - 1);
                            rotate[2][1] = -x * s + (1 - c) * y * z;
                            rotate[3][1] = 0;
                            rotate[0][2] = -y * s + (1 - c) * x * z;
                            rotate[1][2] = x * s + (1 - c) * y * z;
                            rotate[2][2] = 1 + (1 - c) * (z * z - 1);
                            rotate[3][2] = 0;
                            rotate[0][3] = 0;
                            rotate[1][3] = 0;
                            rotate[2][3] = 0;
                            rotate[3][3] = 1;
                        }
                    }

                    return this.preMultiplyBy(rotate);
                };

                this.rotateX = function (degreesF) {
                    return this.rotate3d(1, 0, 0, degreesF);
                };

                this.rotateY = function (degreesF) {
                    return this.rotate3d(0, 1, 0, degreesF);
                };

                this.rotateZ = function (degreesF) {
                    return this.rotate3d(0, 0, 1, degreesF);
                };

                this.translate3d = function (x, y, z) {
                    var translate = new Matrix4x4();

                    translate[3][0] += x;
                    translate[3][1] += y;
                    translate[3][2] += z;

                    return this.preMultiplyBy(translate);
                };
                /*
                 --! scale the the matrix by a specified amount  Note that this
                 --! operation is additive
                 --! @param scaleX (number) the horizontal scale
                 --! @param scaleY (number) the vertical scale
                 --! @return (table) self
                 */

                this.scale = function (scaleX, scaleY, scaleZ) {
                    if (scaleX != 1 || scaleY != 1 || scaleZ != 1) {
                        var scale = new Matrix4x4();

                        scale[0][0] = scaleX;
                        scale[1][1] = scaleY;
                        scale[2][2] = scaleZ;

                        return this.preMultiplyBy(scale);
                    }
                    return this;
                };

                this.skew = function (angleX, angleY, angleIsRadians) {
                    var skewX,
                        skewY;
                    if (!angleIsRadians) {
                        angleX *= deg2Rad;
                        angleY *= deg2Rad;
                    }
                    if (angleX !== 0) {
                        skewX = new Matrix4x4();
                        skewX[1][0] = tan(angleX);
                        this.preMultiplyBy(skewX);
                    }
                    if (angleY !== 0) {
                        skewY = new Matrix4x4();
                        skewY[0][1] = tan(angleY);
                        this.preMultiplyBy(skewY);
                    }
                    return this;
                };

                this.preMultiplyBy = function (other) {
                    // We do it inline with locals to save loops and lookups
                    // Tedious but faster execution
                    // We should benchmark this against a simple loop and see if the speedup is worth the extra bulk
                    var a00 = other[0][0],
                        a01 = other[0][1],
                        a02 = other[0][2],
                        a03 = other[0][3],
                        a10 = other[1][0],
                        a11 = other[1][1],
                        a12 = other[1][2],
                        a13 = other[1][3],
                        a20 = other[2][0],
                        a21 = other[2][1],
                        a22 = other[2][2],
                        a23 = other[2][3],
                        a30 = other[3][0],
                        a31 = other[3][1],
                        a32 = other[3][2],
                        a33 = other[3][3],

                        b00 = this[0][0],
                        b01 = this[0][1],
                        b02 = this[0][2],
                        b03 = this[0][3],
                        b10 = this[1][0],
                        b11 = this[1][1],
                        b12 = this[1][2],
                        b13 = this[1][3],
                        b20 = this[2][0],
                        b21 = this[2][1],
                        b22 = this[2][2],
                        b23 = this[2][3],
                        b30 = this[3][0],
                        b31 = this[3][1],
                        b32 = this[3][2],
                        b33 = this[3][3];

                    this[0][0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
                    this[0][1] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
                    this[0][2] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
                    this[0][3] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;

                    this[1][0] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
                    this[1][1] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
                    this[1][2] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
                    this[1][3] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;

                    this[2][0] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
                    this[2][1] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
                    this[2][2] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
                    this[2][3] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;

                    this[3][0] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
                    this[3][1] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
                    this[3][2] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
                    this[3][3] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

                    return this;
                };
            }


            // - where rectA is the bounding box and rectB is the set of transformed points
            this.matrixFromPoints = function (rectA, rectB) {
                var widthA,
                    heightA,
                    widthB,
                    heightB,
                    scaleX,
                    scaleY,
                    rotA,
                    rotB,
                    rotation,
                    mtrx,
                    boundsRet;

                function lenV(ptA, ptB) {
                    var dX = ptA[0] - ptB[0],
                        dY = ptA[1] - ptB[1];
                    return Math.sqrt(dX * dX + dY * dY);
                }

                function angle(ptA, ptB) {
                    var dX = ptB[0] - ptA[0],
                        dY = ptB[1] - ptA[1];
                    if (dY === 0) {
                        return 0;
                    } else {
                        return round2(rad2Deg * Math.atan(dY / dX));
                    }
                }

                widthA = lenV(rectA[0], rectA[1]);
                heightA = lenV(rectA[0], rectA[3]);
                widthB = lenV(rectB[0], rectB[1]);
                heightB = lenV(rectB[0], rectB[3]);

                //scale
                scaleX = widthB / widthA;
                scaleY = heightB / heightA;


                //rotation
                rotA = angle(rectA[0], rectA[1]);
                rotB = angle(rectB[0], rectB[1]);

                rotation = rotB - rotA;

                mtrx = new Matrix4x4();
                mtrx = mtrx.rotateZ(rotation);


                var newW = widthA * scaleX,
                    newH = heightA * scaleY,
                    offsetX = (widthA - widthB) / 2.0,
                    offsetY = (heightA - heightB) / 2.0,
                    newX = rectA[0][0] + offsetX,
                    newY = rectA[0][1] + offsetY;

                //capture scale by fixing the rect bounds
                boundsRet = [[newX, newY],
                             [newX + newW, newY],
                             [newX + newW, newY + newH],
                             [newX, newY + newH]];

                return { matrix: mtrx, bounds: boundsRet };
            };


            //Caution: currently only functional for 2D
            this.containsOnlyTranslate = function (inMatrix) {
                if (inMatrix[0][0] === 1 && inMatrix[0][1] === 0 && inMatrix[1][0] === 0 && inMatrix[1][1] === 1) {
                    return true;
                } else {
                    return false;
                }
            };

            this.createMatrix = function (inMatrix) {
                return new Matrix4x4(inMatrix);
            };

            this.decomposeTransform = function (matrix) {
                // fields will be : translation, rotation, scale, skew, perspective
                var returnValue,
                    mtrx = new Matrix4x4(matrix),
                    perspectiveMatrix,
                    i,
                    rightHandSide,
                    perspective,
                    inversePerspectiveMatrix,
                    transposedInversePerspectiveMatrix,
                    translation,
                    row,
                    j,
                    scale,
                    skew,
                    pdum3,
                    k,
                    rotation;

                // perspectiveMatrix is used to solve for perspective, but it also provides
                // an easy way to test for singularity of the upper 3x3 component.
                perspectiveMatrix = new Matrix4x4(matrix);

                if (!mtrx.normalizeTransform()) {
                    return null;
                }

                for (i = 0; i < 3; i += 1) {
                    perspectiveMatrix[i][3] = 0;
                }
                perspectiveMatrix[3][3] = 1;

                if (perspectiveMatrix.determinant(perspectiveMatrix) === 0) {
                    return null;
                }

                // First, isolate perspective.
                rightHandSide = new Array(4);
                perspective = new Array(4);
                // rightHandSide is the right hand side of the equation.
                if (mtrx[0][3] !== 0 || mtrx[1][3] !== 0 || mtrx[2][3] !== 0) {
                    rightHandSide[0] = mtrx[0][3];
                    rightHandSide[1] = mtrx[1][3];
                    rightHandSide[2] = mtrx[2][3];
                    rightHandSide[3] = mtrx[3][3];

                    // Solve the equation by inverting perspectiveMatrix and multiplying
                    // rightHandSide by the inverse.
                    inversePerspectiveMatrix = perspectiveMatrix.inverse();
                    if (!inversePerspectiveMatrix) {
                        return false;
                    } // shouldn't happen because we already checked determinant

                    transposedInversePerspectiveMatrix = inversePerspectiveMatrix.transpose();
                    perspective = transposedInversePerspectiveMatrix.rightMultiply(rightHandSide);

                    // Clear the perspective partition
                    mtrx[0][3] = mtrx[1][3] = mtrx[2][3] = 0;
                    mtrx[3][3] = 1;
                } else {
                    // No perspective.
                    perspective[0] = perspective[1] = perspective[2] = 0;
                    perspective[3] = 1;
                }

                // Next take care of translation
                translation = new Array(3);
                translation[0] = mtrx[3][0];
                mtrx[3][0] = 0;
                translation[1] = mtrx[3][1];
                mtrx[3][1] = 0;
                translation[2] = mtrx[3][2];
                mtrx[3][2] = 0;

                // Now get scale and shear. 'row' is a 3 element array of 3 component vectors
                row = new Array(3);
                row[0] = new Array(3);
                row[1] = new Array(3);
                row[2] = new Array(3);

                for (j = 0; j < 3; j += 1) {
                    row[j][0] = mtrx[j][0];
                    row[j][1] = mtrx[j][1];
                    row[j][2] = mtrx[j][2];
                }

                // Compute X scale factor and normalize first row.
                scale = new Array(3);
                scale[0] = vectorNorm(row[0]);
                row[0] = vectorNormalize(row[0]);


                // Compute XY shear factor and make 2nd row orthogonal to 1st.
                skew = new Array(3);
                skew[0] = innerProd(row[0], row[1]);
                row[1] = combine(row[1], row[0], 1.0, -skew[0]);

                // Now, compute Y scale and normalize 2nd row.
                scale[1] = vectorNorm(row[1]);
                row[1] = vectorNormalize(row[1]);
                if (scale[1] !== 0) {
                    skew[0] /= scale[1];
                }


                // Compute XZ and YZ shears, orthogonalize 3rd row
                skew[1] = innerProd(row[0], row[2]);
                row[2] = combine(row[2], row[0], 1.0, -skew[1]);
                skew[2] = innerProd(row[1], row[2]);
                row[2] = combine(row[2], row[1], 1.0, -skew[2]);

                // Next][ get Z scale and normalize 3rd row.
                scale[2] = vectorNorm(row[2]);
                if (scale[2] !== 0) {
                    row[2] = vectorNormalize(row[2]);
                }
                if (scale[2] !== 0) {
                    skew[1] /= scale[2];
                    skew[2] /= scale[2];
                }

                // At this point][ the matrix [in rows] is orthonormal.
                // Check for a coordinate system flip.  If the determinant
                // is -1][ then negate the matrix and the scaling factors.
                pdum3 = vector3Cross(row[1], row[2]);
                if (innerProd(row[0], pdum3) < 0) {

                    for (k = 0; k < 3; k += 1) {
                        scale[k] *= -1; // THIS IS WRONG IN THE SPEC! See the original gem for their correct version
                        // http://tog.acm.org/resources/GraphicsGems/gemsii/unmatrix.c
                        row[k][0] *= -1;
                        row[k][1] *= -1;
                        row[k][2] *= -1;
                    }
                }
                // Now, get the rotations ou
                rotation = new Array(3);
                rotation[1] = asin(-row[0][2]);
                if (cos(rotation[1]) !== 0) {
                    rotation[0] = atan2(row[1][2], row[2][2]);
                    rotation[2] = atan2(row[0][1], row[0][0]);
                } else {
                    rotation[0] = atan2(-row[2][0], row[1][1]);
                    rotation[2] = 0;
                }

                returnValue = {translation: translation, rotation: rotation, scale: scale, skew: skew, perspective: perspective};
                return returnValue;
            };


            this.writeTransform = function (txfm4x4, tX, tY, precision) {
                var decomposed = this.decomposeTransform(txfm4x4);

                if (decomposed.translation[2] ||
                    decomposed.rotation[0] || decomposed.rotation[1] ||
                    decomposed.skew[0] || decomposed.skew[1] ||
                    round2(decomposed.scale[2]) !== 1) {

                    return this.writeRawMatrix(txfm4x4, tX, tY, precision);
                } else {

                    decomposed.translation[0] += tX;
                    decomposed.translation[1] += tY;

                    return this.writeDecomposedTransform(decomposed, precision);
                }
            };

            this.writeRawMatrix = function (txfm4x4, tX, tY, precision) {
                precision = isFinite(precision) ? Math.max(2, precision) : 2;

                // FIXME: We will need to add an is2D flag and a real 2D mode.
                if (typeof txfm4x4.a == "number") {
                    return "matrix(" +
                        roundP(txfm4x4.a, precision) + ", " +
                        roundP(txfm4x4.b, precision) + ", " +
                        roundP(txfm4x4.c, precision) + ", " +
                        roundP(txfm4x4.d, precision) + ", " +
                        roundP(txfm4x4.tx + tX, precision) + ", " +
                        roundP(txfm4x4.ty + tY, precision) + ")";
                }

                return "matrix(" +
                    roundP(txfm4x4[0][0], precision) + ", " +
                    roundP(txfm4x4[0][1], precision) + ", " +
                    roundP(txfm4x4[1][0], precision) + ", " +
                    roundP(txfm4x4[1][1], precision) + ", " +
                    roundP(txfm4x4[3][0] + tX, precision) + ", " +
                    roundP(txfm4x4[3][1] + tY, precision) + ")";
            };

            this.writeDecomposedTransform = function (txfm, precision) {
                var txfmOut = [],
                    sep = "";

                precision = isFinite(precision) ? precision : 2;

                //translate
                if (txfm.translation[0] || txfm.translation[1]) {
                    if (txfm.translation[1]) {
                        txfmOut.push(sep + "translate(" + roundP(txfm.translation[0], precision) + " " + roundP(txfm.translation[1], precision) + ")");
                    } else {
                        txfmOut.push(sep + "translate(" + roundP(txfm.translation[0], precision) + ")");
                    }
                    sep = " ";
                }

                //rotate
                if (round2(rad2Deg * txfm.rotation[2])) {
                    txfmOut.push(sep + "rotate(" + roundP(rad2Deg * txfm.rotation[2], precision) + ")");
                    sep = " ";
                }

                //skew
                if (round2(rad2Deg * txfm.skew[0])) {
                    txfmOut.push(sep + "skewX(" + roundP(rad2Deg * txfm.skew[0], precision) + ")");
                    sep = " ";
                }
                if (round2(rad2Deg * txfm.skew[1])) {
                    txfmOut.push(sep + "skewY(" + roundP(rad2Deg * txfm.skew[1], precision) + ")");
                    sep = " ";
                }

                //scale
                if (round2(txfm.scale[0]) !== 1 || round2(txfm.scale[1]) !== 1) {
                    precision = Math.max(2, precision);
                    if (txfm.scale[0] !== txfm.scale[1]) {
                        txfmOut.push(sep + "scale(" + roundP(txfm.scale[0], precision) + " " + roundP(txfm.scale[1], precision) + ")");
                    } else {
                        txfmOut.push(sep + "scale(" + roundP(txfm.scale[0], precision) + ")");
                    }
                    sep = " ";
                }

                return txfmOut.join("");
            };
        };

    module.exports = new MatrixClass();
}());
