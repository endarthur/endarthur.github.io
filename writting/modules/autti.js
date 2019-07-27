/*
Copyright (c) 2017 Arthur Endlein

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

//from http://cwestblog.com/2012/11/12/javascript-degree-and-radian-conversion/
// Converts from degrees to radians.
var radians = function (degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
var degrees = function (radians) {
    return radians * 180 / Math.PI;
};

//https://stackoverflow.com/a/17323608/1457481
function mod(n, m) {
    return ((n % m) + m) % m;
}

const sqrt2 = Math.sqrt(2.);
const radians1 = 0.017453292519943295;

class Vector {
    constructor(x) {
        this.x = x;
    }
    dot(other) {
        return this.x[0] * other.x[0] + this.x[1] * other.x[1] + this.x[2] * other.x[2];
    }
    angle_with(other) {
        return Math.acos(this.dot(other) / (this.length * other.norm));
    }
    cross_with(other) {
        var tx = this.x[0];
        var ty = this.x[1];
        var tz = this.x[2];
        var ox = other.x[0];
        var oy = other.x[1];
        var oz = other.x[2];
        return new Vector(
            [
                ty * oz - tz * oy,
                tz * ox - tx * oz,
                tx * oy - ty * ox
            ]
        );
    }
    normalized_cross_with(other) {
        return this.cross_with(other).normalized;
    }
    get length() {
        return Math.sqrt(this.dot(this));
    }
    get normalized() {
        var norm = this.length();
        return this.over(norm);
    }
    get attitude() {
        var x = this.x[0];
        var y = this.x[1];
        var z = this.x[2];
        if (z > 0) {
            x = -x;
            y = -y;
        }
        else {
            z = -z;
        }
        return [
            mod(degrees(Math.atan2(x, y)), 360.),
            degrees(Math.asin(z))
        ];
    }
    plus(other) {
        return new Vector(
            [
                this.x[0] + other.x[0],
                this.x[1] + other.x[1],
                this.x[2] + other.x[2]
            ]
        );
    }
    minus(other) {
        return new Vector(
            [
                this.x[0] - other.x[0],
                this.x[1] - other.x[1],
                this.x[2] - other.x[2]
            ]
        );
    }
    times(a) {
        return new Vector(
            [
                this.x[0] * a,
                this.x[1] * a,
                this.x[2] * a
            ]
        );
    }
    over(a) {
        return this.times(1 / a);
    }
    get direction_vector() {
        if (this.x[2] == 1.) {
            return Vector([1., 0., 0.]);
        }
        else {
            var x = this.x[0];
            var y = this.x[1];
            var direction_norm = Math.sqrt(x * x + y * y);
            return new Vector(
                [y / direction_norm, -x / direction_norm, 0]
            );
        }
    }
    get dip_vector() {
        return this.cross_with(this.direction_vector);
    }
    get_great_circle(n = 180, fullcircle = false) {
        var theta_range = fullcircle ? 2 * Math.PI : Math.PI;
        var result = [];
        dip = this.dip_vector();
        dir = this.direction_vector();
        for (var i = 0; i <= n; i++) {
            theta = theta_range * i / n;
            result.push(
                dir.times(Math.cos(theta)).plus(
                    dip.times(Math.sin(theta))
                )
            );
        }
        return result;
    }
    get_small_circle(alpha, n = 360) {
        let alpha_ = radians(alpha);
        return this.get_great_circle(n, true)
            .map(
                    p => p.times(Math.sin(alpha_)) + this.times(Math.cos(alpha_))
                );

    }
    arc_to(other, step = radians1) {
        let aux = this.cross_with(other).cross_with(this).normalized;
        var result = [];
        for (var t = 0; t <= this.angle_with(other); t += step) {
            result.push(
                this.times(Math.cos(t)).plus(
                    aux.times(Math.sin(t))
                )
            );
        }
        return result;
    }
}

class Plane extends Vector {
    static from_attitude(direction, dip, invert_positive=true){
        var dd = radians(direction);
        var d = radians(dip);
        dcos = [
            -Math.sin(d) * Math.sin(dd),
            -Math.sin(d) * Math.cos(dd),
            -Math.cos(d)
        ];
        if (invert_positive && dcos[2] > 0) {
            dcos[0] = -dcos[0];
            dcos[1] = -dcos[1];
            dcos[2] = -dcos[2];
        }
        return new Plane(dcos);
    }
    static from_euler_angles(yaw, pitch, roll, invert_positive=true){
        yaw = radians(yaw);
        pitch = radians(pitch);
        roll = radians(roll);
        dcos = [
            -Math.sin(roll) * Math.cos(yaw) - Math.cos(roll) * Math.sin(pitch) * Math.sin(yaw),
            -Math.sin(roll) * Math.sin(yaw) + Math.cos(roll) * Math.sin(pitch) * Math.cos(yaw),
            -Math.cos(roll) * Math.cos(pitch)
        ];
        if (invert_positive && dcos[2] > 0) {
            dcos[0] = -dcos[0];
            dcos[1] = -dcos[1];
            dcos[2] = -dcos[2];
        }
        return new Plane(dcos);
    }
    get attitude(){
        var x = this.x[0];
        var y = this.x[1];
        var z = this.x[2];
        if (z < 0) {
            x = -x;
            y = -y;
            z = -z;
        }
        return [
            mod(degrees(Math.atan2(x, y)), 360.),
            degrees(Math.acos(z))
        ];
    }
}

class Line extends Vector{
    static from_attitude(trend, plunge, invert_positive){
        var tr = radians(trend);
        var pl = radians(plunge);
        dcos = [
            Math.cos(pl) * Math.sin(tr),
            Math.cos(pl) * Math.cos(tr),
            -Math.sin(pl)
        ];
        if (invert_positive && dcos[2] > 0) {
            dcos[0] = -dcos[0];
            dcos[1] = -dcos[1];
            dcos[2] = -dcos[2];
        }
        return new Line(dcos);
    }
}

function dcosPlane(attitude, invert_positive) {
    if (typeof (invert_positive) === 'undefined') invert_positive = true;
    var dd = radians(attitude[0]);
    var d = radians(attitude[1]);
    dcos = [
        -Math.sin(d) * Math.sin(dd),
        -Math.sin(d) * Math.cos(dd),
        -Math.cos(d)
    ];
    if (invert_positive && dcos[2] > 0) {
        dcos[0] = -dcos[0];
        dcos[1] = -dcos[1];
        dcos[2] = -dcos[2];
    }
    return new Vector(dcos);
}

//https://math.stackexchange.com/a/1637853/119393
function dcosPlaneEuler(attitude, invert_positive) {
    if (typeof (invert_positive) === 'undefined') invert_positive = true;
    var yaw = radians(attitude[0]);
    var pitch = radians(attitude[1]);
    var roll = radians(attitude[2]);
    dcos = [
        -Math.sin(roll) * Math.cos(yaw) - Math.cos(roll) * Math.sin(pitch) * Math.sin(yaw),
        -Math.sin(roll) * Math.sin(yaw) + Math.cos(roll) * Math.sin(pitch) * Math.cos(yaw),
        -Math.cos(roll) * Math.cos(pitch)
    ];
    if (invert_positive && dcos[2] > 0) {
        dcos[0] = -dcos[0];
        dcos[1] = -dcos[1];
        dcos[2] = -dcos[2];
    }
    return new Vector(dcos);
}

function spherePlane(plane) {
    var x = plane.x[0];
    var y = plane.x[1];
    var z = plane.x[2];
    if (z < 0) {
        x = -x;
        y = -y;
        z = -z;
    }
    return [
        mod(degrees(Math.atan2(x, y)), 360.),
        degrees(Math.acos(z))
    ];
}

function dcosLine(attitude, invert_positive) {
    if (typeof (invert_positive) === 'undefined') invert_positive = true;
    var tr = radians(attitude[0]);
    var pl = radians(attitude[1]);
    dcos = [
        Math.cos(pl) * Math.sin(tr),
        Math.cos(pl) * Math.cos(tr),
        -Math.sin(pl)
    ];
    if (invert_positive && dcos[2] > 0) {
        dcos[0] = -dcos[0];
        dcos[1] = -dcos[1];
        dcos[2] = -dcos[2];
    }
    return new Vector(dcos);
}

function sphereLine(line) {
    var x = line.x[0];
    var y = line.x[1];
    var z = line.x[2];
    if (z > 0) {
        x = -x;
        y = -y;
    }
    else {
        z = -z;
    }
    return [
        mod(degrees(Math.atan2(x, y)), 360.),
        degrees(Math.asin(z))
    ];
}

function projectEqualArea(vector) {
    var x = vector.x[0];
    var y = vector.x[1];
    var z = vector.x[2];
    return [
        x * Math.sqrt(1 / (1 - z)),
        y * Math.sqrt(1 / (1 - z))
    ]
}

function readEqualArea(point) {
    X = point[0] * sqrt2;
    Y = point[0] * sqrt2;
    return [
        Math.sqrt(1 - (X * X + Y * Y) / 4.) * X,
        Math.sqrt(1 - (X * X + Y * Y) / 4.) * Y,
        -1. + (X * X + Y * Y) / 2
    ];
}


export {
    degrees, radians,
    Vector, Line, Plane,
    dcosPlane, dcosPlaneEuler, spherePlane, dcosLine, sphereLine,
    projectEqualArea, readEqualArea
};

