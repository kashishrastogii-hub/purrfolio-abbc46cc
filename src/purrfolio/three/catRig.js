import * as THREE from "three";

const C = {
    fur: 0x9a6b42,
    furDark: 0x6e4a26,
    cream: 0xead9bd,
    pink: 0xe87fa0,
    innerEar: 0xe8a8a0,
    nose: 0xc96a6a,
    eye: 0x1d1410,
};

const std = (color, rough = 0.8) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 });

/* fur never renders pitch black in the moody room: faint warm self-glow */
const furMat = (color, rough = 0.8) => {
    const m = std(color, rough);
    m.emissive = new THREE.Color(color === C.cream ? 0x6e5233 : 0x6e4a26);
    m.emissiveIntensity = color === C.cream ? 0.22 : 0.3;
    return m;
};

/* Soft rounded brown tabby kitten with a pink bow — every part is a separate moving piece. */
export function buildCat() {
    const group = new THREE.Group();
    const P = {};

    P.body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 24), furMat(C.fur));
    P.body.castShadow = true;
    P.body.position.set(0, 0.17, 0);
    P.body.scale.set(1, 0.92, 1.18);
    group.add(P.body);

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 18), furMat(C.cream));
    chest.position.set(0, 0.12, -0.09);
    chest.scale.set(0.92, 1, 0.72);
    P.body.add(chest);

    for (let i = 0; i < 3; i++) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.155, 20, 14), furMat(C.furDark));
        s.scale.set(1.01, 0.16, 0.92);
        s.position.set(0, 0.04 + i * 0.055, 0.03);
        P.body.add(s);
    }

    P.head = new THREE.Group();
    P.head.position.set(0, 0.36, -0.1);
    group.add(P.head);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 24), furMat(C.fur));
    skull.scale.set(1.06, 0.94, 1);
    skull.castShadow = true;
    P.head.add(skull);
    for (let i = 0; i < 3; i++) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.148, 18, 12), furMat(C.furDark));
        s.scale.set(0.11, 0.52, 0.99);
        s.position.set(-0.05 + i * 0.05, 0.05, 0.004);
        P.head.add(s);
    }
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.072, 24, 18), furMat(C.cream));
    muzzle.position.set(0, -0.05, -0.115);
    muzzle.scale.set(1.2, 0.78, 0.85);
    P.head.add(muzzle);
    P.nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 10), std(C.nose, 0.5));
    P.nose.position.set(0, -0.012, -0.183);
    P.nose.scale.set(1.2, 0.8, 0.7);
    P.head.add(P.nose);
    P.jaw = new THREE.Mesh(new THREE.SphereGeometry(0.034, 14, 10), std(0x502c22, 0.7));
    P.jaw.position.set(0, -0.064, -0.148);
    P.jaw.scale.set(1.1, 0.01, 0.6);
    P.head.add(P.jaw);

    const eyeGeo = new THREE.SphereGeometry(0.034, 20, 14);
    const eyeMat = std(C.eye, 0.25);
    P.eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    P.eyeL.position.set(-0.064, 0.012, -0.112);
    P.eyeL.scale.set(0.9, 1, 0.55);
    P.eyeR = P.eyeL.clone();
    P.eyeR.position.x = 0.064;
    P.head.add(P.eyeL, P.eyeR);
    const glintMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.9,
        roughness: 0.3,
    });
    P.glintL = new THREE.Mesh(new THREE.SphereGeometry(0.009, 10, 8), glintMat);
    P.glintL.position.set(-0.056, 0.03, -0.136);
    P.glintR = P.glintL.clone();
    P.glintR.position.x = 0.074;
    P.head.add(P.glintL, P.glintR);

    const mkEar = (side) => {
        const g = new THREE.Group();
        const outer = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.1, 20), furMat(C.fur));
        outer.position.y = 0.028;
        outer.castShadow = true;
        const inner = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.062, 16), std(C.innerEar));
        inner.position.set(0, 0.02, 0.014);
        g.add(outer, inner);
        g.position.set(0.08 * side, 0.115, -0.012);
        g.rotation.z = -0.24 * side;
        P.head.add(g);
        return g;
    };
    P.earL = mkEar(-1);
    P.earR = mkEar(1);

    const wMat = std(0xf0e6d8, 0.5);
    for (let s = -1; s <= 1; s += 2) {
        for (let i = 0; i < 3; i++) {
            const w = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.13, 6), wMat);
            w.position.set(0.085 * s, -0.05 + i * 0.018, -0.09);
            w.rotation.z = (Math.PI / 2) * 0.96;
            w.rotation.y = -0.3 * s;
            w.rotation.x = (i - 1) * 0.16;
            P.head.add(w);
        }
    }

    P.bow = new THREE.Group();
    const bowMat = std(C.pink, 0.55);
    const loop = new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 12), bowMat);
    loop.scale.set(1.25, 0.72, 0.5);
    loop.position.x = -0.034;
    const loop2 = loop.clone();
    loop2.position.x = 0.034;
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 14, 10), bowMat);
    const bowTails = new THREE.Mesh(new THREE.SphereGeometry(0.027, 14, 10), bowMat);
    bowTails.scale.set(0.85, 0.66, 0.5);
    bowTails.position.set(0, -0.038, 0.012);
    P.bow.add(loop, loop2, knot, bowTails);
    P.bow.position.set(0.078, 0.235, -0.085);
    P.bow.rotation.set(-0.35, 0.5, 0.1);
    group.add(P.bow);

    const mkFront = (side) => {
        const leg = new THREE.Group();
        const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.08, 6, 12), furMat(C.fur));
        upper.position.y = -0.045;
        upper.castShadow = true;
        const paw = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 12), furMat(C.fur));
        paw.scale.set(1, 0.72, 1.3);
        paw.position.set(0, -0.095, -0.02);
        leg.add(upper, paw);
        leg.position.set(0.088 * side, 0.19, -0.11);
        group.add(leg);
        return leg;
    };
    P.legFL = mkFront(-1);
    P.legFR = mkFront(1);

    const mkBack = (side) => {
        const g = new THREE.Group();
        const haunch = new THREE.Mesh(new THREE.SphereGeometry(0.078, 18, 14), furMat(C.fur));
        haunch.scale.set(0.78, 0.95, 1.1);
        haunch.castShadow = true;
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 10), furMat(C.fur));
        foot.scale.set(0.9, 0.6, 1.4);
        foot.position.set(0, -0.09, -0.03);
        g.add(haunch, foot);
        g.position.set(0.12 * side, 0.09, 0.07);
        group.add(g);
        return g;
    };
    P.legBL = mkBack(-1);
    P.legBR = mkBack(1);

    P.tailSegs = [];
    for (let i = 0; i < 6; i++) {
        const seg = new THREE.Mesh(
            new THREE.SphereGeometry(0.046 - i * 0.0028, 14, 10),
            std(i % 2 ? C.furDark : C.fur)
        );
        seg.castShadow = true;
        P.tailSegs.push(seg);
        group.add(seg);
    }

    return { group, P };
}

/* Pose targets: everything is damped toward these every frame. */
export const POSES = {
    curled: {
        bodyPos: [0, 0.09, 0.02],
        bodyScale: [1.14, 0.62, 1.08],
        bodyRotX: 0,
        headPos: [0.03, 0.16, -0.15],
        headRotX: 0.6,
        headRotY: -0.25,
        eye: 0.1,
        jaw: 0,
        droop: 1,
        pawY: -0.14,
        pawZ: 0.07,
        pawRotX: 0.9,
        tail: "wrap",
        breath: 0.05,
    },
    stretch: {
        bodyPos: [0, 0.13, 0.04],
        bodyScale: [0.98, 0.85, 1.3],
        bodyRotX: -0.34,
        headPos: [0, 0.3, -0.15],
        headRotX: -0.6,
        headRotY: 0,
        eye: 0.55,
        jaw: 1,
        droop: 0,
        pawY: -0.17,
        pawZ: -0.1,
        pawRotX: 0.35,
        tail: "up",
        breath: 0.02,
    },
    sit: {
        bodyPos: [0, 0.17, 0],
        bodyScale: [1, 0.92, 1.18],
        bodyRotX: 0,
        headPos: [0, 0.36, -0.1],
        headRotX: 0.16,
        headRotY: 0,
        eye: 1,
        jaw: 0,
        droop: 0,
        pawY: 0.13,
        pawZ: -0.19,
        pawRotX: -0.55,
        tail: "down",
        breath: 0.018,
    },
    turn: {
        bodyPos: [0, 0.17, 0],
        bodyScale: [1, 0.92, 1.18],
        bodyRotX: 0,
        headPos: [0, 0.36, -0.1],
        headRotX: 0.02,
        headRotY: 1.0,
        eye: 1.12,
        jaw: 0,
        droop: 0,
        pawY: 0.13,
        pawZ: -0.11,
        pawRotX: -0.55,
        tail: "down",
        breath: 0.02,
    },
    happy: {
        bodyPos: [0, 0.17, 0],
        bodyScale: [1, 0.92, 1.18],
        bodyRotX: 0,
        headPos: [0, 0.36, -0.1],
        headRotX: 0.06,
        headRotY: 1.0,
        eye: 0.12,
        jaw: 0.45,
        droop: 0,
        pawY: 0.13,
        pawZ: -0.11,
        pawRotX: -0.55,
        tail: "down",
        breath: 0.024,
    },
};
