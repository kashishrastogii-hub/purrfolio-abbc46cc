import * as THREE from "three";
import { coatTexture, furMaterial, groom, sculptedHead, earGeometry, makeFurryTail } from "./kittenFur";

const C = { fur: 0xb58b5f, cream: 0xe4d0ad, pink: 0xeaa1b0, innerEar: 0xd99798, nose: 0xd58d96, eye: 0x100e0b };
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
    P.body = sphere(0.16, coat, [1, 0.92, 1.18], [0, 0.17, 0], group, 2400);
    const chest = sphere(0.103, pale, [0.8, 1.18, 0.47], [0, 0.01, -0.122], P.body, 550);
    // The chest patch sits against the body, rather than a separate protruding ball.
    chest.rotation.x = -0.15;
    P.head = new THREE.Group();
    P.head.position.set(0, 0.36, -0.1);
    group.add(P.head);
    const skull = new THREE.Mesh(sculptedHead(), faceCoat);
    skull.castShadow = true;
    P.head.add(skull);
    groom(skull, 2000, 0.0055);
    for (const side of [-1, 1]) {
        sphere(0.044, pale, [0.94, 0.72, 0.79], [side * 0.025, -0.037, -0.106], P.head, 150);
    }
    sphere(0.032, pale, [1.2, 0.46, 0.76], [0, -0.065, -0.105], P.head);
    const noseShape = new THREE.Shape();
    noseShape.moveTo(-0.013, 0.003);
    noseShape.quadraticCurveTo(0, 0.012, 0.013, 0.003);
    noseShape.quadraticCurveTo(0.006, -0.006, 0, -0.009);
    noseShape.quadraticCurveTo(-0.007, -0.005, -0.013, 0.003);
    P.nose = new THREE.Mesh(new THREE.ExtrudeGeometry(noseShape, { depth: 0.004, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002, bevelSegments: 2 }), std(C.nose, 0.4));
    P.nose.position.set(0, -0.029, -0.14);
    P.nose.rotation.y = Math.PI;
    P.head.add(P.nose);
    const dark = std(0x574038, 0.8);
    const curveMesh = (points, radius, material, parent) => {
        const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
        const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, radius, 4, false), material);
        parent.add(mesh);
        return mesh;
    };
    curveMesh([[0,-0.038,-0.138],[0,-0.046,-0.14],[-0.012,-0.051,-0.138],[-0.023,-0.045,-0.132]],0.0011,dark,P.head);
    curveMesh([[0,-0.046,-0.14],[0.012,-0.051,-0.138],[0.023,-0.045,-0.132]],0.0011,dark,P.head);
    P.jaw = sphere(0.019, std(0x613b34), [1, 0.01, 0.35], [0,-0.058,-0.132], P.head);
    const eyeMat = new THREE.MeshPhysicalMaterial({ color: C.eye, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05, metalness: 0.05 });
    P.eyeL = sphere(0.032, eyeMat, [1,1,0.56], [-0.053,0.018,-0.099], P.head);
    P.eyeR = sphere(0.032, eyeMat, [1,1,0.56], [0.053,0.018,-0.099], P.head);
    P.eyeL.rotation.y = 0.22;
    P.eyeR.rotation.y = -0.22;
    const glint = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    P.glintL = sphere(0.0042, glint, [1,1,0.55],[-0.06,0.027,-0.118],P.head);
    P.glintR = sphere(0.0042, glint, [1,1,0.55],[0.046,0.027,-0.118],P.head);
    P.closedEyes = new THREE.Group();
    P.head.add(P.closedEyes);
    for (const side of [-1,1]) {
        curveMesh([[side*0.025,0.007,-0.118],[side*0.051,0.003,-0.123],[side*0.077,0.014,-0.109]],0.0016,dark,P.closedEyes);
    }
    const makeEar = side => {
        const ear = new THREE.Group();
        const outer = new THREE.Mesh(earGeometry(), coat);
        outer.castShadow = true;
        ear.add(outer);
        groom(outer,350,0.004);
        const inner = new THREE.Mesh(earGeometry(),std(C.innerEar,0.93));
        inner.scale.set(0.66,0.68,0.12);
        inner.position.set(0,0.008,-0.016);
        ear.add(inner);
        ear.position.set(side*0.078,0.071,-0.008);
        ear.rotation.z = -0.2*side;
        P.head.add(ear);
        return ear;
    };
    P.earL = makeEar(-1); P.earR = makeEar(1);
    const whisker = new THREE.MeshBasicMaterial({ color: 0xf5eddf });
    for (const side of [-1,1]) for (let i=0;i<3;i++) {
        curveMesh([[side*0.029,-0.038+i*0.008,-0.137],[side*0.069,-0.039+i*0.012,-0.135],[side*0.12,-0.051+i*0.023,-0.115]],0.00065,whisker,P.head);
    }
    P.bow = new THREE.Group();
    const bowMat = std(C.pink,0.55);
    const loop = sphere(0.025,bowMat,[1.18,0.65,0.36],[-0.026,0,0],P.bow);
    loop.rotation.z = -0.23;
    const loop2 = loop.clone(); loop2.position.x=0.026; loop2.rotation.z=0.23; P.bow.add(loop2);
    sphere(0.012,bowMat,[1,0.8,0.65],[0,0,-0.004],P.bow);
    for(const side of [-1,1]) {
        const ribbon = new THREE.Mesh(new THREE.PlaneGeometry(0.017,0.031),new THREE.MeshStandardMaterial({ color:C.pink,side:THREE.DoubleSide,roughness:0.7 }));
        ribbon.position.set(side*0.012,-0.024,0.004); ribbon.rotation.z=side*0.25; P.bow.add(ribbon);
    }
    P.bow.position.set(0.062,0.091,-0.055);
    P.bow.rotation.set(-0.25,-0.2,0.15);
    P.head.add(P.bow);
    const makeFront = side => {
        const leg = new THREE.Group();
        const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.026,0.075,8,16),coat);
        upper.position.y=-0.043; upper.castShadow=true; leg.add(upper); groom(upper,380,0.004);
        const paw = sphere(0.035,coat,[0.9,0.68,1.2],[0,-0.093,-0.018],leg,220);
        for(let i=0;i<2;i++) curveMesh([[(i-0.5)*0.013,-0.096,-0.05],[(i-0.5)*0.013,-0.085,-0.051]],0.00065,dark,leg);
        leg.position.set(side*0.088,0.19,-0.11);
        group.add(leg); return leg;
    };
    P.legFL=makeFront(-1); P.legFR=makeFront(1);
    const makeBack = side => {
        const leg = new THREE.Group();
        sphere(0.074,coat,[0.75,0.88,1.1],[0,0,0],leg,550);
        sphere(0.037,coat,[0.82,0.55,1.4],[0,-0.075,-0.034],leg,180);
        leg.position.set(side*0.102,0.075,0.062); group.add(leg); return leg;
    };
    P.legBL=makeBack(-1); P.legBR=makeBack(1);
    const tailCanvas=document.createElement('canvas'); tailCanvas.width=128; tailCanvas.height=512;
    const tx=tailCanvas.getContext('2d'); tx.fillStyle='#ab8159'; tx.fillRect(0,0,128,512);
    for(let i=0;i<9;i++){tx.fillStyle='#5b412c';tx.fillRect(0,i*57+10,128,16);}
    tx.fillStyle='#4c3828';tx.fillRect(0,470,128,42);
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
