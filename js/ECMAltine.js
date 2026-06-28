/* ECMAltine — the JavaScript "Malt" forward geological-modelling kernel.
 * Geology as composable functions: Plane / PlanarSurface / DipVector / PlanarFault /
 * SinusoidalFold / Lith / Model. Used by jsgem (../tools/jsgem.html) as the kernel its
 * gridhopping marching-cubes worker compiles user models against.
 *
 * MIT License — Copyright (c) 2022 Arthur Endlein
 * (Recovered 2026 from an old drive; previously uncommitted.)
 */

Plane = function (dd, d) {
    return new THREE.Vector3().setFromSphericalCoords(
        1.0,
        THREE.MathUtils.degToRad(d),
        THREE.MathUtils.degToRad(180 - dd)
    );
};

function PlanarSurface(plane, point, polarity = 1.0) {
    const surface = new THREE.Plane().setFromNormalAndCoplanarPoint(
        plane,
        point
    );
    return (X) => polarity * surface.distanceToPoint(X);
}

function DipVector(plane) {
    return new THREE.Vector3()
        .crossVectors(up, plane)
        .cross(plane)
        .normalize();
}

function PlanarFault(
    plane,
    point,
    displacement,
    footwall_movement = false
) {
    const faultSurface = PlanarSurface(
        plane,
        point,
        footwall_movement ? -1.0 : 1.0
    );
    return (X, v) => {
        if (faultSurface(X) > 0) {
            X.add(displacement);
        }
        return [X, v];
    };
}

function SinusoidalFold(
    hinge,
    axial_plane_normal,
    point,
    amplitude,
    wavelength
) {
    const axial_trace = new THREE.Vector3()
        .crossVectors(axial_plane_normal, hinge)
        .normalize();
    const axialPlane = PlanarSurface(axial_plane_normal, point);
    return (X, v) => {
        X.addScaledVector(
            axial_trace,
            amplitude * Math.sin(axialPlane(X) / wavelength)
        );
        return [X, v];
    };
}

function Lith(surface, code) {
    return (X, v) => [X, surface(X) > 0 ? code : v];
}

function Model(events) {
    return (X) => {
        let code = 0;
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            [X, code] = event(X, code);
            if (code !== 0) {
                break;
            }
        }
        return code;
    };
}