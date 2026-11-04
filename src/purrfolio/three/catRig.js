import * as THREE from "three";
import { coatTexture, furMaterial, groom, sculptedHead, earGeometry, makeFurryTail } from "./kittenFur";

const C = { fur: 0xd9823f, cream: 0xf6e7c8, pink: 0xf2a8b2, innerEar: 0xefb0b6, nose: 0xe08e96, eye: 0x2f9e4f, pupil: 0x0d120d, bell: 0xf5c451, collar: 0x3fb3c9, mouth: 0x6b4630 };
const std = (color, rough = 0.8) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 });

export function buildCat() {
    const group = new THREE.Group();
    const P = {};
    const coat = furMaterial(coatTexture("body"));
    const faceCoat = furMaterial(coatTexture("head"));
    const pale = std(C.cream, 0.98);
    const sphere = (radius, material, scale, position, parent, fibers = 0) => {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 36, 24), material);
        mesh.scale.set(...scale);
        mesh.position.set(...position);
        mesh.castShadow = true;
        parent.add(mesh);
        if (fibers) groom(mesh, fibers);
        return mesh;
    };
    P.body = sphere(0.16, coat, [1, 0.92, 1.18], [0, 0.17, 0], group, 4200);
    const chest = sphere(0.103, pale, [0.8, 1.18, 0.47], [0, 0.01, -0.122], P.body, 550);
    // The chest patch sits against the body, rather than a separate protruding ball.
    chest.rotation.x = -0.15;
    P.head = new THREE.Group();
    P.head.position.set(0, 0.36, -0.1);
    group.add(P.head);
    const skull = new THREE.Mesh(sculptedHead(), faceCoat);
    skull.castShadow = true;
    P.head.add(skull);
    groom(skull, 3200, 0.008);
    for (const side of [-1, 1]) {
        sphere(0.048, pale, [0.94, 0.78, 0.82], [side * 0.027, -0.04, -0.104], P.head, 150);
    }
    sphere(0.034, pale, [1.2, 0.5, 0.8], [0, -0.068, -0.103], P.head);
    const noseShape = new THREE.Shape();
    noseShape.moveTo(-0.013, 0.003);
    noseShape.quadraticCurveTo(0, 0.012, 0.013, 0.003);
    noseShape.quadraticCurveTo(0.006, -0.006, 0, -0.009);
    noseShape.quadraticCurveTo(-0.007, -0.005, -0.013, 0.003);
    P.nose = new THREE.Mesh(new THREE.ExtrudeGeometry(noseShape, { depth: 0.004, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002, bevelSegments: 2 }), std(C.nose, 0.4));
    P.nose.position.set(0, -0.029, -0.14);
    P.nose.rotation.y = Math.PI;
    P.head.add(P.nose);
    const dark = std(0x6b4630, 0.8);
    const curveMesh = (points, radius, material, parent) => {
        const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
        const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, radius, 4, false), material);
        parent.add(mesh);
        return mesh;
    };
    const mouthMat = std(C.mouth, 0.7);
    // Small "w" mouth under the nose, like the reference kitten.
    curveMesh([[0,-0.044,-0.139],[-0.006,-0.053,-0.138],[-0.014,-0.046,-0.136]],0.001,mouthMat,P.head);
    curveMesh([[0,-0.044,-0.139],[0.006,-0.053,-0.138],[0.014,-0.046,-0.136]],0.001,mouthMat,P.head);
    P.jaw = sphere(0.019, std(0x613b34), [1, 0.01, 0.35], [0,-0.058,-0.132], P.head);
    const eyeMat = new THREE.MeshPhysicalMaterial({ color: C.eye, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, metalness: 0 });
    P.eyeL = sphere(0.034, eyeMat, [1,1,0.66], [-0.043,0.01,-0.103], P.head);
    P.eyeR = sphere(0.034, eyeMat, [1,1,0.66], [0.043,0.01,-0.103], P.head);
    P.eyeL.rotation.y = 0.2;
    P.eyeR.rotation.y = -0.2;
    const pupilMat = new THREE.MeshPhysicalMaterial({ color: C.pupil, roughness: 0.18, clearcoat: 1 });
    P.pupilL = sphere(0.018, pupilMat, [1,1,0.8], [-0.041,0.008,-0.122], P.head);
    P.pupilR = sphere(0.018, pupilMat, [1,1,0.8], [0.041,0.008,-0.122], P.head);
    const glint = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    P.glintL = sphere(0.005, glint, [1,1,0.55],[-0.05,0.032,-0.119],P.head);
    P.glintR = sphere(0.005, glint, [1,1,0.55],[0.036,0.032,-0.119],P.head);
    P.closedEyes = new THREE.Group();
    P.head.add(P.closedEyes);
    for (const side of [-1,1]) {
        curveMesh([[side*0.028,0.004,-0.121],[side*0.056,0.0,-0.126],[side*0.084,0.012,-0.112]],0.0018,dark,P.closedEyes);
    }
    const makeEar = side => {
        const ear = new THREE.Group();
        const outer = new THREE.Mesh(earGeometry(), coat);
        outer.castShadow = true;
        ear.add(outer);
        groom(outer,350,0.004);
        const inner = new THREE.Mesh(earGeometry(),std(C.innerEar,0.93));
        inner.scale.set(0.62,0.66,0.12);
        inner.position.set(0,0.008,-0.015);
        ear.add(inner);
        ear.position.set(side*0.079,0.075,-0.006);
        ear.rotation.z = -0.18*side;
        P.head.add(ear);
        return ear;
    };
    P.earL = makeEar(-1); P.earR = makeEar(1);
    const whisker = new THREE.MeshBasicMaterial({ color: 0xf5eddf });
    for (const side of [-1,1]) for (let i=0;i<3;i++) {
        curveMesh([[side*0.029,-0.038+i*0.008,-0.137],[side*0.085,-0.039+i*0.014,-0.135],[side*0.17,-0.055+i*0.03,-0.11]],0.0013,whisker,P.head);
    }
    // Teal collar with a small gold bell, riding just under the chin.
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.079, 0.011, 8, 28), std(C.collar, 0.55));
    collar.position.set(0, -0.085, 0.012);
    collar.rotation.x = 1.3;
    P.head.add(collar);
    const bellMat = new THREE.MeshStandardMaterial({ color: C.bell, roughness: 0.35, metalness: 0.5 });
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 12), bellMat);
    bell.position.set(0, -0.114, -0.052);
    P.head.add(bell);
    const slit = new THREE.Mesh(new THREE.BoxGeometry(0.019, 0.0022, 0.0022), std(0x8a6420, 0.5));
    slit.position.set(0, -0.109, -0.064);
    slit.rotation.x = -0.5;
    P.head.add(slit);
    const makeFront = side => {
        const leg = new THREE.Group();
        const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.033,0.075,8,16),coat);
        upper.position.y=-0.043; upper.castShadow=true; leg.add(upper); groom(upper,380,0.004);
        const paw = sphere(0.039,pale,[0.95,0.74,1.2],[0,-0.093,-0.018],leg,300);
        const connector = new THREE.Mesh(new THREE.CapsuleGeometry(0.031,1,6,16),coat);
        connector.castShadow = true;
        group.add(connector);
        groom(connector,500,0.005);
        P[side < 0 ? "armL" : "armR"] = connector;
        for(let i=0;i<2;i++) curveMesh([[(i-0.5)*0.013,-0.096,-0.05],[(i-0.5)*0.013,-0.085,-0.051]],0.00065,dark,leg);
        leg.position.set(side*0.088,0.19,-0.11);
        group.add(leg); return leg;
    };
    P.legFL=makeFront(-1); P.legFR=makeFront(1);
    const shoulder = new THREE.Vector3(), wrist = new THREE.Vector3(), direction = new THREE.Vector3();
    const up = new THREE.Vector3(0,1,0);
    P.updateArms = () => {
        for (const side of [-1,1]) {
            const leg = side < 0 ? P.legFL : P.legFR;
            const arm = side < 0 ? P.armL : P.armR;
            shoulder.set(side*0.085,0.04,-0.07).applyMatrix4(P.body.matrix);
            wrist.set(0,-0.045,0).applyEuler(leg.rotation).add(leg.position);
            direction.subVectors(wrist,shoulder);
            arm.position.copy(shoulder).add(wrist).multiplyScalar(0.5);
            arm.quaternion.setFromUnitVectors(up,direction.clone().normalize());
            arm.scale.set(1,Math.max(0.02,direction.length())/1.062,1);
        }
    };
    const makeBack = side => {
        const leg = new THREE.Group();
        sphere(0.074,coat,[0.75,0.88,1.1],[0,0,0],leg,550);
        sphere(0.037,pale,[0.82,0.55,1.4],[0,-0.075,-0.034],leg,180);
        leg.position.set(side*0.102,0.075,0.062); group.add(leg); return leg;
    };
    P.legBL=makeBack(-1); P.legBR=makeBack(1);
    const tailCanvas=document.createElement('canvas'); tailCanvas.width=128; tailCanvas.height=512;
    const tx=tailCanvas.getContext('2d'); tx.fillStyle='#e0863f'; tx.fillRect(0,0,128,512);
    for(let i=0;i<9;i++){tx.fillStyle='#b25a1e';tx.fillRect(0,i*57+10,128,16);}
    tx.fillStyle='#f6e7c8';tx.fillRect(0,466,128,46);
    const tailTex=new THREE.CanvasTexture(tailCanvas);tailTex.colorSpace=THREE.SRGBColorSpace;
    const furryTail=makeFurryTail(furMaterial(tailTex));
    group.add(furryTail.tail); P.tailSegs=furryTail.guides; P.updateTail=furryTail.update;
    // Lighting layers isolate kitten lighting from all room surfaces.
    group.traverse(node=>node.layers.set(1));
    return {group,P};
}
/* Pose targets: everything is damped toward these every frame. */
export const POSES = {
    curled: {
        bodyPos: [0, 0.09, 0.02],
        bodyScale: [1.08, 0.62, 1.08],
        bodyRotX: 0,
        headPos: [0.027, 0.091, -0.122],
        headRotX: 0.25,
        headRotY: -0.35,
        eye: 0,
        jaw: 0,
        droop: 1,
        pawY: -0.075,
        pawZ: 0.002,
        pawRotX: 1.2,
        tail: "wrap",
        breath: 0.018,
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
        pawZ: -0.26,
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
