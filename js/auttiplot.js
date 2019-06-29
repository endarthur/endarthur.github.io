var auttiplot = (function () {

    function projectEqualArea(vector, invert_positive) {
        if (typeof (invert_positive) === 'undefined') invert_positive = true;
        var x = vector.x[0];
        var y = vector.x[1];
        var z = vector.x[2];
        if (invert_positive && z > 0){
            x = -x;
            y = -y;
            z = -z;
        }
        return [
            x * Math.sqrt(1 / (1 - z)),
            y * Math.sqrt(1 / (1 - z))
        ]
    }

    function readEqualArea(point) {
        X = point[0] * sqrt2;
        Y = point[0] * sqrt2;
        return [
            Math.sqrt(1 - (X * X + Y * Y) / 4.0) * X,
            Math.sqrt(1 - (X * X + Y * Y) / 4.0) * Y,
            -1.0 + (X * X + Y * Y) / 2
        ];
    }

    function EqualArea(plotid, draw_primitive) {
        if (typeof (draw_primitive) === 'undefined') draw_primitive = true;
        this.plotid = plotid;
        this.svg = document.getElementById(plotid);
        let w = parseFloat(this.svg.getAttribute("width"));
        let h = parseFloat(this.svg.getAttribute("height"));
        this.w = w;
        this.h = h;

        this.cx = w / 2;
        this.cy = h / 2;

        this.r = Math.min(w, h) / 2 - 2;

        if (draw_primitive){
            let primitive = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "circle"
            );
            primitive.setAttribute("class", "stereo-primitive");
            primitive.setAttribute("cx", this.cx);
            primitive.setAttribute("cy", this.cy);
            primitive.setAttribute("r", this.r);
            this.primitive = primitive;
            this.svg.appendChild(primitive);
        }
    }

    EqualArea.prototype.project = function(vector, invert_positive){
        if (typeof (invert_positive) === 'undefined') invert_positive = true;
        let point = projectEqualArea(vector);
        point[0] = this.cx + this.r*point[0];
        point[1] = this.cy - this.r*point[1];
        return point;
    };

    EqualArea.prototype.as_point = function(vector, invert_positive){
        if (typeof (invert_positive) === 'undefined') invert_positive = true;
        let point = this.project(vector, invert_positive);
        let marker = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );
        marker.setAttribute("cx", point[0]);
        marker.setAttribute("cy", point[1]);
        marker.setAttribute("class", "stereo-point");
        this.svg.appendChild(marker);

        return marker;
    }

    EqualArea.prototype.as_line = function(vectors){
        let line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polyline"
        );
        line.setAttribute("points", []);
        line.setAttribute("class", "stereo-line")
        vectors.forEach(vector => {
            let projected_point = this.project(vector, false);
            let svg_point = this.svg.createSVGPoint();
            svg_point.x = projected_point[0];
            svg_point.y = projected_point[1];
            line.points.appendItem(svg_point);
        });
        this.svg.appendChild(line);

        return line;
    }

    var Module = {};
    Module.projectEqualArea = projectEqualArea;
    Module.readEqualArea = readEqualArea;
    Module.EqualArea = EqualArea;

    return Module;
})();