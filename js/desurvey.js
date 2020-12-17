let v = new THREE.Vector3();
let v_ = new THREE.Vector3();

class Drillhole extends THREE.Curve {
    constructor(
        survey,
        collar = null,
        total_length = null,
        alpha_tolerance = radians(1.0)
    ) {
        super();

        collar = collar ?? new THREE.Vector3();
        this.survey = survey;

        let survey_length = 0;
        let points = [collar];
        let frames = [];
        let [ai, tri, pgi] = survey[0];
        let vi = dcos_line(tri, pgi, new THREE.Vector3());

        let xi;
        for (let i = 0; i < survey.length - 1; i++) {
            const [ai_, tri_, pgi_] = survey[i + 1];
            let vi_ = dcos_line(tri_, pgi_, new THREE.Vector3());
            const alpha = vi.angleTo(vi_);
            if (alpha > alpha_tolerance) {
                const r = (ai_ - ai) / alpha;
                const n = v.crossVectors(vi, vi_).normalize();
                const q = new THREE.Vector3().crossVectors(n, vi);
                const c = points[i].clone().addScaledVector(q, r);
                xi = c
                    .clone()
                    .addScaledVector(q, -r * Math.cos(alpha))
                    .addScaledVector(vi, r * Math.sin(alpha));

                frames.push([ai, r, c, q, vi]);
            } else {
                xi = points[i].clone().addScaledVector(vi, ai_ - ai);
                frames.push([ai, 0, points[i], null, vi]);
            }

            points.push(xi);
            survey_length = ai_;
            [ai, tri, pgi] = [ai_, tri_, pgi_];
            vi = vi_;
        }

        frames.push([ai, 0, points[points.length - 1], null, vi]);

        this.total_length = total_length ?? survey_length;
        this.lengths = frames.map((f) => f[0] / this.total_length);
        this.frames = frames;
    }

    getPoint(t, optionalTarget = new THREE.Vector3(), i=0) {
        const n = this.lengths.length - 1;
        while (t > this.lengths[i + 1] && i < n) {
            i++;
        }

        const [ai, ri, ci, qi, vi] = this.frames[i];
        if (ri > 0) {
            const theta = (t * this.total_length - ai) / ri;
            return optionalTarget
                .copy(ci)
                .addScaledVector(qi, -ri * Math.cos(theta))
                .addScaledVector(vi, ri * Math.sin(theta));
        } else {
            return optionalTarget
                .copy(ci)
                .addScaledVector(vi, t * this.total_length - ai);
        }
    }

    getSegment(from, to){
        return new Segment(this, from, to);
    }
}

class Segment extends THREE.Curve {
    constructor(drillhole, from, to){
        super();
        this.drillhole = drillhole;
        this.from = from;
        this.to = to;
        this.dl = to - from;
        this.f_ = from/drillhole.total_length;
        this.t_ = to/drillhole.total_length;
        this.dl_ = this.dl/drillhole.total_length;

        let i = 0;
        const n = drillhole.lengths.length - 1;
        while (this.f_ > drillhole.lengths[i + 1] && i < n) {
            i++;
        }
        this.i = i;
    }

    getPoint(t, optionalTarget = new THREE.Vector3()){
        return this.drillhole.getPoint(this.f_ + t*this.dl_, optionalTarget, this.i);
    }
}