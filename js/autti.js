//from http://cwestblog.com/2012/11/12/javascript-degree-and-radian-conversion/
// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

var sqrt2 = Math.sqrt(2.);

function Vector(x) {
    this.x = x;
}

Vector.prototype.dot = function (other) {
    return this.x[0] * other.x[0] + this.x[1] * other.x[1] + this.x[2] * other.x[2];
}

Vector.prototype.angle = function (other) {
    return Math.acos(this.dot(other)/(this.norm*other.norm));
}

Vector.prototype.cross = function (other) {
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

Vector.prototype.norm = function () {
    return Math.sqrt(this.dot(this));
}

Vector.prototype.normalized = function () {
    var norm = this.norm();
    return this.over(norm);
}

Vector.prototype.plus = function (other) {
        return new Vector(
        [
            this.x[0] + other.x[0],
            this.x[1] + other.x[1],
            this.x[2] + other.x[2]
        ]
    );
}

Vector.prototype.minus = function (other) {
        return new Vector(
        [
            this.x[0] - other.x[0],
            this.x[1] - other.x[1],
            this.x[2] - other.x[2]
        ]
    );
}

Vector.prototype.times = function (a) {
        return new Vector(
        [
            this.x[0] * a,
            this.x[1] * a,
            this.x[2] * a
        ]
    );
}

Vector.prototype.over = function (a) {
    return this.times(1/a);
}

function dcosPlane (attitude) {
    var dd = Math.radians(attitude[0]);
    var d = Math.radians(attitude[1]);
    return new Vector([
        -Math.sin(d)*Math.sin(dd),
        -Math.sin(d)*Math.cos(dd),
        -Math.cos(d)
    ]);
}

function spherePlane (plane) {
    var x = plane.x[0];
    var y = plane.x[1];
    var z = plane.z[2];
    if (z < 0){
        x = -x;
        y = -y;
        z = -z;
    }
    return [
        Math.degrees(Math.atan2(x, y)) % 360.,
        Math.degrees(Math.acos(z))
    ];
}

function dcosLine (attitude) {
    var tr = Math.radians(attitude[0]);
    var pl = math.radians(attitude[1]);
    return new Vector([
        Math.cos(pl)*Math.sin(tr),
        Math.cos(pl)*Math.cos(tr),
        -Math.sin(pl)
    ]);
}

function sphereLine (line) {
    var x = line.x[0];
    var y = line.x[1];
    var z = line.z[2];
    if (z > 0){
        x = -x;
        y = -y;
    }
    else {
        z = -z;
    }
    return [
        Math.degrees(Math.atan2(x, y)) % 360.,
        Math.degrees(Math.acos(z))
    ];
}

function projectEqualArea (vector) {
    var x = vector.x[0];
    var y = vector.x[1];
    var z = vector.x[2];
    return [
        x*Math.sqrt(1/(1 - z)),
        y*Math.sqrt(1/(1 - z))
    ]
}

function readEqualArea (point) {
    X = point[0]*sqrt2;
    Y = point[0]*sqrt2;
    return [
            Math.sqrt(1 - (X*X + Y*Y)/4.)*X,
            Math.sqrt(1 - (X*X + Y*Y)/4.)*Y,
            -1. + (X*X + Y*Y)/2
    ];
}