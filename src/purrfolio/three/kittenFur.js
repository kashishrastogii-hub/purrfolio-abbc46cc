import * as THREE from "three";

// Deterministic grooming: painted strands, not image noise or post-processing.
const PALETTE = { coat: "#aa8057", light: "#dec6a0", stripe: "#57402c" };
export function coatTexture(part = "body") {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = PALETTE.coat;
    ctx.fillRect(0, 0, 1024, 1024);
    const belly = ctx.createLinearGradient(0, 0, 0, 1024);
    belly.addColorStop(0, "#8c6744");
    belly.addColorStop(0.48, PALETTE.coat);
    belly.addColorStop(0.77, PALETTE.light);
    belly.addColorStop(1, "#eee0c7");
    ctx.fillStyle = belly;
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.strokeStyle = PALETTE.stripe;
    ctx.lineCap = "round";
    const count = part === "head" ? 9 : 12;
    for (let i = 0; i < count; i++) {
        ctx.lineWidth = part === "head" ? 14 : 23;
        ctx.beginPath();
        const u = (i + 0.5) * 1024 / count;
        ctx.moveTo(u, 12);
        ctx.bezierCurveTo(u + 37, 130, u - 43, 265, u + 19, 490 + (i % 3) * 40);
        ctx.stroke();
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(u + 16, 240);
        ctx.quadraticCurveTo(u + 62, 355, u + 45, 410);
        ctx.stroke();
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < 16000; i++) {
        const u = (i * 137.508) % 1024;
        const v = (i * 79.317) % 1024;
        ctx.strokeStyle = i % 3 ? "rgba(247,228,193,0.14)" : "rgba(74,47,26,0.17)";
        ctx.beginPath();
        ctx.moveTo(u, v);
        ctx.lineTo(u + Math.sin(v * 0.009) * 3, v + 7);
        ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
}

export function furMaterial(texture) {
    return new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff, roughness: 0.98, metalness: 0 });
}

// A single instanced draw makes fine tapered wisps follow the sculpted surface.
export function groom(mesh, count = 1600, length = 0.006) {
    const geometry = new THREE.ConeGeometry(0.00055, 1, 3, 1);
    geometry.translate(0, 0.5, 0);
    const material = new THREE.MeshStandardMaterial({ color: 0xb38e64, roughness: 1, side: THREE.DoubleSide });
    const strands = new THREE.InstancedMesh(geometry, material, count);
    const positions = mesh.geometry.attributes.position;
    const normals = mesh.geometry.attributes.normal;
    const dummy = new THREE.Object3D();
    const normal = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    const tint = new THREE.Color();
    for (let i = 0; i < count; i++) {
        const index = (i * 127 + Math.floor(i / positions.count) * 37) % positions.count;
        dummy.position.fromBufferAttribute(positions, index);
        normal.fromBufferAttribute(normals, index).normalize();
        dummy.quaternion.setFromUnitVectors(up, normal);
        dummy.scale.set(1, length * (0.55 + (i % 11) / 16), 1);
        dummy.updateMatrix();
        strands.setMatrixAt(i, dummy.matrix);
        tint.setHex(dummy.position.y < -0.02 ? 0xdcc5a1 : (i % 4 ? 0xb38e64 : 0x826040));
        strands.setColorAt(i, tint);
    }
    mesh.add(strands);
    return strands;
}

export function sculptedHead() {
    const geo = new THREE.SphereGeometry(0.126, 48, 36);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        const cheek = 1 + 0.13 * Math.exp(-Math.pow((y + 0.03) / 0.045, 2));
        pos.setXYZ(i, x * cheek, y * 0.91, z * (y > 0.02 ? 0.88 : 0.94));
    }
    geo.computeVertexNormals();
    return geo;
}

export function earGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(-0.04, 0);
    shape.quadraticCurveTo(-0.024, 0.055, -0.012, 0.083);
    shape.quadraticCurveTo(-0.004, 0.095, 0.003, 0.083);
    shape.quadraticCurveTo(0.02, 0.035, 0.04, 0);
    shape.quadraticCurveTo(0, -0.015, -0.04, 0);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.007, bevelThickness: 0.005, curveSegments: 10 });
    geo.translate(0, 0, -0.009);
    return geo;
}

export function makeFurryTail(material) {
    const rings = 44, sides = 10;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array((rings + 1) * sides * 3);
    const uv = new Float32Array((rings + 1) * sides * 2);
    const indices = [];
    for (let i = 0; i <= rings; i++) for (let j = 0; j < sides; j++) {
        const k = i * sides + j;
        uv[k * 2] = j / (sides - 1);
        uv[k * 2 + 1] = i / rings;
        if (i < rings) {
            const next = i * sides + (j + 1) % sides;
            indices.push(k, next, k + sides, next, next + sides, k + sides);
        }
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geometry.setIndex(indices);
    const tail = new THREE.Mesh(geometry, material);
    tail.castShadow = true;
    tail.frustumCulled = false;
    const guides = Array.from({ length: 6 }, () => new THREE.Object3D());
    const curve = new THREE.CatmullRomCurve3(guides.map(g => g.position), false, "catmullrom", 0.45);
    const point = new THREE.Vector3(), tangent = new THREE.Vector3(), right = new THREE.Vector3(), normal = new THREE.Vector3();
    const axis = new THREE.Vector3(0, 1, 0);
    const outer = new THREE.Mesh(geometry.clone(), new THREE.MeshStandardMaterial({ color: 0xb99165, transparent: true, opacity: 0.15, roughness: 1, depthWrite: false, side: THREE.BackSide }));
    outer.frustumCulled = false;
    tail.add(outer);
    function update() {
        for (let i = 0; i <= rings; i++) {
            const t = i / rings;
            curve.getPoint(t, point);
            curve.getTangent(t, tangent).normalize();
            right.crossVectors(tangent, axis);
            if (right.lengthSq() < 0.0001) right.set(1, 0, 0);
            right.normalize();
            normal.crossVectors(right, tangent).normalize();
            const radius = 0.027 * (1 - 0.64 * t) * Math.min(1, (1 - t) * 20 + 0.03);
            for (let j = 0; j < sides; j++) {
                const a = j / sides * Math.PI * 2;
                const offset = right.clone().multiplyScalar(Math.cos(a)).addScaledVector(normal, Math.sin(a));
                const k = (i * sides + j) * 3;
                const v = point.clone().addScaledVector(offset, radius);
                positions[k] = v.x; positions[k + 1] = v.y; positions[k + 2] = v.z;
                const edge = point.clone().addScaledVector(offset, radius + 0.0025);
                outer.geometry.attributes.position.setXYZ(i * sides + j, edge.x, edge.y, edge.z);
            }
        }
        geometry.attributes.position.needsUpdate = true;
        outer.geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        outer.geometry.computeVertexNormals();
    }
    return { tail, guides, update };
}