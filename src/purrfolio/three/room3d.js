import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { buildCat, POSES } from "./catRig";

const CAM_POS = new THREE.Vector3(2.85, 1.75, -1.6);
const CAM_TARGET = new THREE.Vector3(-1.0, 1.15, -2.35);
const DIM = { ambient: 0.95, hemi: 0.3, moon: 1.6, lamp: 0.8, fill: 1.3 };
const LIT = { ambient: 1.7, hemi: 0.75, moon: 1.8, lamp: 16, fill: 2.4 };

function canvasTex(w, h, draw) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

const std = (color, rough = 0.85) =>
    new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 });

const rbox = (w, h, d, r = 0.02) => new RoundedBoxGeometry(w, h, d, 3, r);

function glowSprite(color, scale, opacity = 0.55) {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const x = c.getContext("2d");
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
    const m = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(c),
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const s = new THREE.Sprite(m);
    s.scale.setScalar(scale);
    return s;
}

export class Room3D {
    constructor(container, { onCatTap, anchorEl }) {
        this.container = container;
        this.anchorEl = anchorEl;
        this.onCatTap = onCatTap;
        this.clock = new THREE.Clock();
        this.cur = this._flatPose(POSES.curled);
        this.poseName = "curled";
        this.typing = false;
        this.frantic = false;
        this.earsFlat = false;
        this.talking = false;
        this.lit = false;
        this.monitorOn = false;
        this.screenText = "";
        this.blinkT = 2.4;
        this.blinkK = 1;
        this.shakeT = 0;
        this.push = 0;
        this.throwT = -1;
        this.redrawAcc = 1;
        this.disposed = false;

        this._build();
        this._bind();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    /* ---------- build ---------- */
    _build() {
        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.12;
        this.container.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0d20);
        this.scene.fog = new THREE.FogExp2(0x0a0d20, 0.03);

        this.camera = new THREE.PerspectiveCamera(46, w / h, 0.1, 60);
        this.basePos = CAM_POS.clone();
        this.baseTarget = CAM_TARGET.clone();
        this.camera.position.copy(this.basePos);
        this.camera.lookAt(this.baseTarget);

        this._buildLights();
        this._buildRoom();
        this._buildCity();
        this._buildDesk();
        this._buildChair();
        this._buildLamp();
        this._buildShelf();
        this._buildPlant();
        this._buildDoor();
        this._buildDust();
        this._buildCat();
    }

    _buildLights() {
        this.ambient = new THREE.AmbientLight(0x2e2540, DIM.ambient);
        this.scene.add(this.ambient);
        this.hemi = new THREE.HemisphereLight(0x3a4a6e, 0x241708, DIM.hemi);
        this.scene.add(this.hemi);

        this.moon = new THREE.DirectionalLight(0x8fb0ff, DIM.moon);
        this.moon.position.set(-2.2, 4.2, -7);
        this.moon.target.position.set(0.2, 0.4, -1.4);
        this.moon.castShadow = true;
        this.moon.shadow.mapSize.set(1024, 1024);
        const sc = this.moon.shadow.camera;
        sc.left = -6;
        sc.right = 6;
        sc.top = 6;
        sc.bottom = -4;
        sc.near = 1;
        sc.far = 20;
        this.moon.shadow.bias = -0.0015;
        this.scene.add(this.moon, this.moon.target);

        this.lampLight = new THREE.PointLight(0xff9a3c, DIM.lamp, 9, 1.6);
        this.lampLight.position.set(-0.1, 1.16, -2.48);
        this.scene.add(this.lampLight);

        this.monitorLight = new THREE.PointLight(0xffe9c0, 0, 2.4, 2);
        this.monitorLight.position.set(-0.8, 1.1, -1.85);
        this.scene.add(this.monitorLight);

        this.fill = new THREE.PointLight(0x7a8ec4, DIM.fill, 14, 1);
        this.fill.position.set(2.6, 2.2, 0.2);
        this.scene.add(this.fill);

        this.curTargets = { ...DIM };
    }

    _buildRoom() {
        const floorTex = canvasTex(512, 512, (x) => {
            x.fillStyle = "#6a4a2c";
            x.fillRect(0, 0, 512, 512);
            for (let i = 0; i < 8; i++) {
                x.fillStyle = i % 2 ? "#61432a" : "#705033";
                x.fillRect(0, i * 64, 512, 62);
                x.strokeStyle = "rgba(34,20,9,0.75)";
                x.lineWidth = 3;
                x.beginPath();
                x.moveTo(0, i * 64);
                x.lineTo(512, i * 64);
                x.stroke();
                for (let j = 0; j < 3; j++) {
                    const sx = (i * 197 + j * 163) % 512;
                    x.beginPath();
                    x.moveTo(sx, i * 64);
                    x.lineTo(sx, i * 64 + 62);
                    x.stroke();
                }
            }
        });
        floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
        floorTex.repeat.set(3, 2);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.92, metalness: 0 }));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        const wallMat = std(0x5e4230, 0.95);
        const mkWall = (w2, h2, d2, x, y, z) => {
            const m = new THREE.Mesh(rbox(w2, h2, d2, 0.01), wallMat);
            m.position.set(x, y, z);
            m.castShadow = true;
            m.receiveShadow = true;
            this.scene.add(m);
            return m;
        };
        // back wall (z=-3) built around the window opening (x -2.25..0.05, y 0.8..2.4)
        mkWall(2.4, 3, 0.12, -3.45, 1.5, -3);
        mkWall(3.15, 3, 0.12, 1.65, 1.5, -3);
        mkWall(2.3, 0.8, 0.12, -1.1, 0.4, -3);
        mkWall(2.3, 0.6, 0.12, -1.1, 2.7, -3);
        // right wall (x=3.2)
        mkWall(0.12, 3, 4.6, 3.2, 1.5, -0.7);

        // window frame + glass + mullions
        const frameMat = std(0x6b4a2e, 0.8);
        const fm = (w2, h2, x, y) => {
            const m = new THREE.Mesh(rbox(w2, h2, 0.14, 0.02), frameMat);
            m.position.set(x, y, -3);
            m.castShadow = true;
            this.scene.add(m);
        };
        fm(0.1, 1.72, -2.28, 1.6);
        fm(0.1, 1.72, 0.08, 1.6);
        fm(2.46, 0.1, -1.1, 0.77);
        fm(2.46, 0.1, -1.1, 2.43);
        fm(0.06, 1.6, -1.1, 1.6);
        fm(2.3, 0.06, -1.1, 1.6);
        const glass = new THREE.Mesh(
            new THREE.PlaneGeometry(2.3, 1.6),
            new THREE.MeshStandardMaterial({ color: 0x9fc4ff, transparent: true, opacity: 0.07, roughness: 0.2, metalness: 0.1 })
        );
        glass.position.set(-1.1, 1.6, -3.02);
        this.scene.add(glass);
        const sill = new THREE.Mesh(rbox(2.6, 0.07, 0.2, 0.02), std(0x7a5436, 0.85));
        sill.position.set(-1.1, 0.74, -2.93);
        sill.castShadow = true;
        this.scene.add(sill);

        // rug
        const rugTex = canvasTex(512, 512, (x) => {
            x.fillStyle = "#d96a4b";
            x.fillRect(0, 0, 512, 512);
            x.strokeStyle = "#f2dcb8";
            x.lineWidth = 10;
            x.setLineDash([34, 22]);
            [190, 130].forEach((r) => {
                x.beginPath();
                x.arc(256, 256, r, 0, Math.PI * 2);
                x.stroke();
            });
            x.setLineDash([]);
            x.beginPath();
            x.arc(256, 256, 70, 0, Math.PI * 2);
            x.stroke();
        });
        const rug = new THREE.Mesh(new THREE.CircleGeometry(1.05, 48), new THREE.MeshStandardMaterial({ map: rugTex, roughness: 1 }));
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(0.15, 0.006, -1.5);
        rug.scale.set(1.3, 0.95, 1);
        rug.receiveShadow = true;
        this.scene.add(rug);
    }

    _buildCity() {
        const winTex = (n) =>
            canvasTex(128, 256, (x) => {
                x.fillStyle = "#0a0a14";
                x.fillRect(0, 0, 128, 256);
                for (let r = 0; r < 14; r++)
                    for (let k = 0; k < 6; k++) {
                        const on = (r * 7 + k * 13 + n * 31) % 10 < 3.5;
                        x.fillStyle = on ? "#ffd98e" : "#141c38";
                        x.fillRect(8 + k * 20, 8 + r * 18, 12, 10);
                    }
            });
        const bMats = [0, 1, 2].map((i) => {
            const t = winTex(i);
            return new THREE.MeshStandardMaterial({
                color: 0x0e1530,
                emissive: 0xffd98e,
                emissiveMap: t,
                map: t,
                emissiveIntensity: 1.1,
                roughness: 0.9,
            });
        });
        const spots = [
            [-5.2, 0.9, -6.2], [-4.1, 1.6, -7], [-3.2, 2.6, -6.4], [-2.4, 1.2, -7.6],
            [-1.9, 3.1, -6.6], [-2.9, 2.0, -7.9], [-4.9, 2.7, -7.2], [-3.9, 1.1, -8.3],
            [-5.9, 1.4, -7.7], [-2.6, 2.4, -6.9], [-4.6, 2.1, -8.6], [-6, 2.1, -8.2], [-3.5, 2.9, -8.9],
        ];
        spots.forEach(([bx, bh, bz], i) => {
            const bw = 0.55 + ((i * 37) % 50) / 90;
            const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bw), bMats[i % 3]);
            b.position.set(bx, bh / 2, bz);
            this.scene.add(b);
        });

        const moon = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 24, 18),
            new THREE.MeshStandardMaterial({ color: 0xf4e8c8, emissive: 0xf4e8c8, emissiveIntensity: 1.5, roughness: 0.6 })
        );
        moon.position.set(-5.2, 2.75, -11);
        this.scene.add(moon);
        const mGlow = glowSprite(0xf2e2b4, 2.6, 0.5);
        mGlow.position.copy(moon.position);
        this.scene.add(mGlow);

        const starN = 260;
        const pos = new Float32Array(starN * 3);
        for (let i = 0; i < starN; i++) {
            pos[i * 3] = -9 + Math.random() * 17;
            pos[i * 3 + 1] = 0.8 + Math.random() * 6;
            pos[i * 3 + 2] = -9.5 - Math.random() * 4;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        this.stars = new THREE.Points(
            g,
            new THREE.PointsMaterial({ size: 0.045, map: glowSprite(0xffffff, 1).material.map, color: 0xcfe0ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        this.scene.add(this.stars);

        const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), std(0x070a16, 1));
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(0, -0.01, -8);
        this.scene.add(ground);
    }

    _buildDesk() {
        const g = new THREE.Group();
        const top = new THREE.Mesh(rbox(1.7, 0.06, 0.62, 0.025), std(0xb07a3f, 0.7));
        top.position.y = 0.73;
        top.castShadow = true;
        top.receiveShadow = true;
        g.add(top);
        const legMat = std(0x7a4e2a, 0.85);
        [[-0.78, -0.24], [0.78, -0.24], [-0.78, 0.24], [0.78, 0.24]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.022, 0.7, 12), legMat);
            leg.position.set(lx, 0.35, lz);
            leg.castShadow = true;
            g.add(leg);
        });
        g.position.set(-0.35, 0, -2.32);
        this.scene.add(g);

        /* retro monitor */
        const mon = new THREE.Group();
        const body = new THREE.Mesh(rbox(0.82, 0.62, 0.5, 0.05), std(0xe3d3b3, 0.6));
        body.position.y = 1.14;
        body.castShadow = true;
        mon.add(body);
        const bezel = new THREE.Mesh(rbox(0.74, 0.54, 0.06, 0.03), std(0x2e2c34, 0.5));
        bezel.position.set(0, 1.14, 0.24);
        mon.add(bezel);
        this.screenCanvas = document.createElement("canvas");
        this.screenCanvas.width = 512;
        this.screenCanvas.height = 340;
        this.screenTex = new THREE.CanvasTexture(this.screenCanvas);
        this.screenTex.colorSpace = THREE.SRGBColorSpace;
        this.screenMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(0.66, 0.44),
            new THREE.MeshStandardMaterial({ map: this.screenTex, emissive: 0xffffff, emissiveMap: this.screenTex, emissiveIntensity: 0.55, roughness: 0.35 })
        );
        this.screenMesh.position.set(0, 1.14, 0.272);
        mon.add(this.screenMesh);
        const neck = new THREE.Mesh(rbox(0.16, 0.16, 0.14, 0.02), std(0xcabc9c, 0.7));
        neck.position.set(0, 0.86, 0);
        mon.add(neck);
        const foot = new THREE.Mesh(rbox(0.44, 0.045, 0.3, 0.02), std(0xcabc9c, 0.7));
        foot.position.set(0, 0.785, 0.02);
        mon.add(foot);
        this.led = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 8), new THREE.MeshStandardMaterial({ color: 0x223322, emissive: 0x39d98a, emissiveIntensity: 0, roughness: 0.4 }));
        this.led.position.set(0.33, 0.9, 0.26);
        mon.add(this.led);
        mon.position.set(-0.8, 0, -2.45);
        mon.rotation.y = 0.16;
        this.scene.add(mon);
        this._drawScreen();

        /* keyboard */
        this.kb = new THREE.Group();
        const kbBase = new THREE.Mesh(rbox(0.48, 0.035, 0.18, 0.015), std(0xe3d3b3, 0.6));
        this.kb.add(kbBase);
        const keyMat = std(0xc9b896, 0.65);
        const keyGeo = new THREE.BoxGeometry(0.028, 0.014, 0.028);
        const inst = new THREE.InstancedMesh(keyGeo, keyMat, 36);
        const m4 = new THREE.Matrix4();
        let ki = 0;
        for (let r = 0; r < 3; r++)
            for (let k = 0; k < 12; k++) {
                m4.setPosition(-0.2 + k * 0.036, 0.024, -0.052 + r * 0.052);
                inst.setMatrixAt(ki++, m4);
            }
        this.kb.add(inst);
        this.kb.position.set(0.3, 0.762, -2.08);
        this.kb.rotation.y = -0.08;
        this.scene.add(this.kb);
    }

    _buildChair() {
        const g = new THREE.Group();
        const teal = std(0x2f6f6a, 0.75);
        const seat = new THREE.Mesh(rbox(0.5, 0.06, 0.48, 0.025), teal);
        seat.position.y = 0.44;
        seat.castShadow = true;
        seat.receiveShadow = true;
        g.add(seat);
        const back = new THREE.Mesh(rbox(0.46, 0.36, 0.06, 0.025), teal);
        back.position.set(0, 0.65, 0.22);
        back.castShadow = true;
        g.add(back);
        const legMat = std(0x5d3a26, 0.85);
        [[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.016, 0.42, 10), legMat);
            leg.position.set(lx, 0.21, lz);
            leg.castShadow = true;
            g.add(leg);
        });
        g.position.set(0.32, 0, -1.85);
        this.scene.add(g);
    }

    _buildLamp() {
        const g = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.03, 20), std(0x8a4a26, 0.6));
        base.castShadow = true;
        g.add(base);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.34, 10), std(0x8a4a26, 0.6));
        stem.position.set(0.015, 0.18, 0);
        stem.rotation.z = -0.08;
        g.add(stem);
        const shade = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.13, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xc9552e, emissive: 0xff8a3c, emissiveIntensity: 0, roughness: 0.6, side: THREE.DoubleSide }));
        shade.position.set(0.035, 0.4, 0);
        shade.rotation.z = 0.22;
        g.add(shade);
        this.shade = shade;
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.028, 14, 10), new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffb45e, emissiveIntensity: 0, roughness: 0.4 }));
        bulb.position.set(0.045, 0.36, 0);
        g.add(bulb);
        this.bulb = bulb;
        this.lampGlow = glowSprite(0xff9a3c, 0.9, 0);
        this.lampGlow.position.set(0.045, 0.37, 0);
        g.add(this.lampGlow);
        g.position.set(-0.12, 0.76, -2.5);
        this.scene.add(g);
    }

    _buildShelf() {
        const g = new THREE.Group();
        const wood = std(0x6e4426, 0.85);
        const side = new THREE.Mesh(rbox(0.035, 1.55, 0.26, 0.01), wood);
        side.position.set(-0.44, 0.775, 0);
        g.add(side);
        const side2 = side.clone();
        side2.position.x = 0.44;
        g.add(side2);
        const backP = new THREE.Mesh(rbox(0.92, 1.55, 0.02, 0.005), std(0x5a3820, 0.9));
        backP.position.set(0, 0.775, -0.12);
        g.add(backP);
        const bookCols = [0xa04b3a, 0x3e6b5e, 0xc2913a, 0x5e4a75, 0x8a5a33, 0x4a6b8a];
        [0.28, 0.72, 1.16].forEach((sy, si) => {
            const shelf = new THREE.Mesh(rbox(0.88, 0.03, 0.26, 0.008), wood);
            shelf.position.set(0, sy, 0);
            shelf.castShadow = true;
            g.add(shelf);
            let bx = -0.36;
            let bi = si;
            while (bx < 0.3) {
                const bw = 0.035 + ((bi * 13) % 4) * 0.01;
                const bh = 0.2 + ((bi * 29) % 5) * 0.025;
                const book = new THREE.Mesh(rbox(bw, bh, 0.17, 0.006), std(bookCols[bi % 6], 0.8));
                book.position.set(bx + bw / 2, sy + 0.015 + bh / 2, 0.01);
                book.rotation.z = bi % 5 === 4 ? 0.09 : 0;
                book.castShadow = true;
                g.add(book);
                bx += bw + 0.012;
                bi++;
            }
        });
        g.position.set(0.7, 0, -2.88);
        this.scene.add(g);
    }

    _buildPlant() {
        const g = new THREE.Group();
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.22, 20), std(0xb55a3c, 0.9));
        pot.position.y = 0.11;
        pot.castShadow = true;
        g.add(pot);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 10, 24), std(0xa04b30, 0.9));
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.22;
        g.add(rim);
        const leafCols = [0x4e6e4a, 0x5e7d4f, 0x47603f];
        for (let i = 0; i < 7; i++) {
            const a = (i / 7) * Math.PI * 2;
            const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), std(leafCols[i % 3], 0.85));
            leaf.scale.set(0.32, 1, 0.14);
            leaf.position.set(Math.cos(a) * 0.08, 0.38 + (i % 3) * 0.035, Math.sin(a) * 0.08);
            leaf.rotation.z = Math.cos(a) * 0.5;
            leaf.rotation.x = Math.sin(a) * 0.5;
            leaf.castShadow = true;
            g.add(leaf);
        }
        g.position.set(-2.5, 0, -2.3);
        this.scene.add(g);
    }

    _buildDoor() {
        const g = new THREE.Group();
        const frameMat = std(0x7a4e2a, 0.85);
        const fm = (w2, h2, x, y) => {
            const m = new THREE.Mesh(rbox(w2, h2, 0.16, 0.015), frameMat);
            m.position.set(x, y, 0);
            m.castShadow = true;
            g.add(m);
        };
        fm(0.1, 2.24, -0.48, 1.1);
        fm(0.1, 2.24, 0.48, 1.1);
        fm(1.06, 0.1, 0, 2.17);
        const slab = new THREE.Mesh(rbox(0.88, 2.1, 0.07, 0.02), std(0x8a5a33, 0.8));
        slab.position.set(0, 1.06, 0.01);
        slab.castShadow = true;
        slab.receiveShadow = true;
        g.add(slab);
        [[1.62, 0.42], [0.62, 0.42]].forEach(([py, ph]) => {
            const panel = new THREE.Mesh(rbox(0.6, ph, 0.02, 0.01), std(0x7c4f2c, 0.85));
            panel.position.set(0, py, 0.055);
            g.add(panel);
        });
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshStandardMaterial({ color: 0xe8b64c, metalness: 0.7, roughness: 0.35 }));
        knob.position.set(-0.31, 1.02, 0.07);
        g.add(knob);
        // cat flap at the bottom
        const opening = new THREE.Mesh(rbox(0.4, 0.3, 0.08, 0.05), std(0x241a12, 1));
        opening.position.set(0.02, 0.17, 0.02);
        g.add(opening);
        this.flap = new THREE.Group();
        const plate = new THREE.Mesh(rbox(0.36, 0.26, 0.02, 0.04), std(0xa06a42, 0.75));
        this.flap.add(plate);
        this.flap.position.set(0.02, 0.19, 0.075);
        this.flap.rotation.x = -0.12;
        g.add(this.flap);
        g.position.set(1.72, 0, -2.9);
        this.scene.add(g);
    }

    _buildDust() {
        const n = 110;
        this.dustPos = new Float32Array(n * 3);
        this.dustVel = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
            this.dustPos[i * 3] = -0.65 + Math.random() * 0.75;
            this.dustPos[i * 3 + 1] = 0.5 + Math.random() * 0.85;
            this.dustPos[i * 3 + 2] = -2.65 + Math.random() * 0.7;
            this.dustVel[i * 3] = (Math.random() - 0.5) * 0.01;
            this.dustVel[i * 3 + 1] = 0.008 + Math.random() * 0.014;
            this.dustVel[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(this.dustPos, 3));
        this.dust = new THREE.Points(
            g,
            new THREE.PointsMaterial({ size: 0.012, map: glowSprite(0xffffff, 1).material.map, color: 0xffd9a0, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        this.scene.add(this.dust);
    }

    _buildCat() {
        const rig = buildCat();
        this.cat = rig.P;
        this.catGroup = rig.group;
        this.catGroup.position.set(0.32, 0.53, -1.81);
        this.catGroup.rotation.y = -0.55;
        this.scene.add(this.catGroup);
        this.hit = new THREE.Mesh(
            new THREE.SphereGeometry(0.42, 12, 10),
            new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
        );
        this.hit.position.set(0.32, 0.75, -1.78);
        this.hit.userData.isCat = true;
        this.scene.add(this.hit);
        this._tailCur = this._tailTargets("wrap", 0);
        this._tailPrevMode = "wrap";
    }

    /* ---------- screen canvas ---------- */
    _drawScreen() {
        const x = this.screenCanvas.getContext("2d");
        if (!this.monitorOn) {
            x.fillStyle = "#10141f";
            x.fillRect(0, 0, 512, 340);
            x.fillStyle = "rgba(255,255,255,0.045)";
            x.beginPath();
            x.moveTo(60, 0);
            x.lineTo(220, 0);
            x.lineTo(90, 340);
            x.lineTo(0, 340);
            x.fill();
        } else {
            x.fillStyle = "#fff3da";
            x.fillRect(0, 0, 512, 340);
            x.fillStyle = "#4a3f35";
            x.font = '500 46px "Fira Code", monospace';
            const words = this.screenText.split(" ");
            const lines = [];
            let cur = "";
            for (const wd of words) {
                if ((cur + " " + wd).trim().length > 10 && cur) {
                    lines.push(cur.trim());
                    cur = wd;
                } else cur = (cur ? cur + " " : "") + wd;
            }
            if (cur.trim()) lines.push(cur.trim());
            lines.slice(-4).forEach((l, i) => x.fillText(l, 58, 110 + i * 76));
            const last = lines[lines.length - 1] || "";
            x.fillStyle = "#e2705e";
            x.fillRect(60 + last.length * 27.6, 110 + Math.min(lines.length - 1, 3) * 76 - 36, 24, 44);
        }
        this.screenTex.needsUpdate = true;
    }

    /* ---------- events ---------- */
    _bind() {
        this.ray = new THREE.Raycaster();
        this.ndc = new THREE.Vector2();
        this._onDown = (e) => {
            const r = this.renderer.domElement.getBoundingClientRect();
            this.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
            this.ray.setFromCamera(this.ndc, this.camera);
            if (this.ray.intersectObject(this.hit).length) this.onCatTap && this.onCatTap();
        };
        this._onMove = (e) => {
            if (this._lastHover && performance.now() - this._lastHover < 120) return;
            this._lastHover = performance.now();
            const r = this.renderer.domElement.getBoundingClientRect();
            this.ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
            this.ray.setFromCamera(this.ndc, this.camera);
            this.container.style.cursor = this.ray.intersectObject(this.hit).length && this.poseName === "curled" ? "pointer" : "default";
        };
        this._onResize = () => {
            const w = this.container.clientWidth || window.innerWidth;
            const h = this.container.clientHeight || window.innerHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        };
        this.renderer.domElement.addEventListener("pointerdown", this._onDown);
        this.renderer.domElement.addEventListener("pointermove", this._onMove);
        window.addEventListener("resize", this._onResize);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this._drawScreen());
    }

    /* ---------- public api ---------- */
    setPose(p) {
        this.poseName = p;
    }
    setTyping(v, frantic) {
        this.typing = v;
        this.frantic = !!frantic;
    }
    setFrantic(v) {
        this.frantic = !!v;
    }
    setEarsFlat(v) {
        this.earsFlat = !!v;
    }
    setTalking(v) {
        this.talking = !!v;
    }
    setLit(v) {
        this.lit = !!v;
        this.curTargets = this.lit ? { ...LIT } : { ...DIM };
    }
    setMonitor(v) {
        this.monitorOn = !!v;
        this._drawScreen();
    }
    setScreenText(s) {
        this.screenText = s;
        this._drawScreen();
    }
    throwKeyboard() {
        if (this.throwT >= 0) return;
        this.throwT = 0;
        this.kbStart = this.kb.position.clone();
        const fwd = new THREE.Vector3();
        this.camera.getWorldDirection(fwd);
        this.kbEnd = this.camera.position.clone().add(fwd.multiplyScalar(0.45)).add(new THREE.Vector3(0.1, -0.3, 0));
    }
    shake() {
        this.shakeT = 0.9;
        this.push = Math.min(this.push + 0.2, 0.34);
    }
    dispose() {
        this.disposed = true;
        cancelAnimationFrame(this._raf);
        this.renderer?.domElement.removeEventListener("pointerdown", this._onDown);
        this.renderer?.domElement.removeEventListener("pointermove", this._onMove);
        window.removeEventListener("resize", this._onResize);
        this.renderer?.dispose();
        this.renderer?.domElement?.remove();
    }

    /* ---------- per-frame ---------- */
    _flatPose(p) {
        return {
            bodyPos: [...p.bodyPos],
            bodyScale: [...p.bodyScale],
            bodyRotX: p.bodyRotX,
            headPos: [...p.headPos],
            headRotX: p.headRotX,
            headRotY: p.headRotY,
            eye: p.eye,
            jaw: p.jaw,
            droop: p.droop,
            pawY: p.pawY,
            pawZ: p.pawZ,
            pawRotX: p.pawRotX,
            tail: p.tail,
            breath: p.breath,
        };
    }

    _tailTargets(mode, t) {
        const out = [];
        if (mode === "wrap") {
            for (let i = 0; i < 6; i++) {
                const a = 0.55 - i * 0.5;
                out.push([Math.cos(a) * 0.2, 0.045, Math.sin(a) * 0.19 + 0.02]);
            }
        } else if (mode === "up") {
            for (let i = 0; i < 6; i++)
                out.push([0.02, 0.17 + i * 0.047, 0.21 - i * 0.014 + Math.sin(t * 3 + i * 0.8) * 0.007]);
        } else {
            const f = this.poseName === "happy" ? 6 : 1.6;
            const amp = this.poseName === "happy" ? 0.032 : 0.012;
            for (let i = 0; i < 6; i++)
                out.push([0.12 + Math.sin(t * f + i * 0.65) * amp * (0.4 + i / 4), 0.16 - i * 0.047, 0.3 + i * 0.012]);
        }
        return out;
    }

    loop() {
        if (this.disposed) return;
        this._raf = requestAnimationFrame(this.loop);
        const dt = Math.min(this.clock.getDelta(), 0.05);
        const t = this.clock.elapsedTime;
        const k = 1 - Math.exp(-7 * dt);
        const P = this.cat;
        const target = POSES[this.poseName] || POSES.sit;
        const cur = this.cur;

        for (const key of ["bodyPos", "bodyScale", "headPos"]) {
            for (let i = 0; i < 3; i++) cur[key][i] += (target[key][i] - cur[key][i]) * k;
        }
        for (const key of ["bodyRotX", "headRotX", "headRotY", "eye", "jaw", "droop", "pawY", "pawZ", "pawRotX", "breath"]) {
            cur[key] += (target[key] - cur[key]) * k;
        }
        cur.tail = target.tail;

        const vib = this.frantic ? 0.006 : 0;
        P.body.position.set(
            cur.bodyPos[0] + Math.sin(t * 43) * vib,
            cur.bodyPos[1],
            cur.bodyPos[2] + Math.cos(t * 39) * vib
        );
        const breath = 1 + Math.sin(t * 2.3) * cur.breath;
        P.body.scale.set(cur.bodyScale[0], cur.bodyScale[1] * breath, cur.bodyScale[2]);
        P.body.rotation.x = cur.bodyRotX;

        P.head.position.set(...cur.headPos);
        P.head.rotation.x = cur.headRotX;
        P.head.rotation.y = cur.headRotY;

        this.blinkT -= dt;
        if (this.blinkT <= 0) {
            this.blinkT = 2.6 + Math.random() * 2.6;
            this.blinkK = 0.08;
        }
        this.blinkK += (1 - this.blinkK) * (1 - Math.exp(-14 * dt));
        const eyeOpen = cur.eye > 0.5 ? this.blinkK : 1;
        const eyeY = Math.max(cur.eye * eyeOpen, 0.06);
        P.eyeL.scale.y = eyeY;
        P.eyeR.scale.y = eyeY;
        const gs = eyeY > 0.4 ? 1 : 0.01;
        P.glintL.scale.setScalar(gs);
        P.glintR.scale.setScalar(gs);

        const jawTarget = Math.max(cur.jaw, this.talking ? 0.3 + 0.3 * Math.abs(Math.sin(t * 13)) : 0);
        P.jaw.scale.y = Math.max(jawTarget, 0.01);

        const flat = this.earsFlat ? 1 : 0;
        P.earL.rotation.z += (-0.24 - cur.droop * 0.55 - flat * 1.15 - P.earL.rotation.z) * k;
        P.earR.rotation.z += (0.24 + cur.droop * 0.55 + flat * 1.15 - P.earR.rotation.z) * k;
        P.earL.rotation.x += ((flat ? -0.5 : 0) - P.earL.rotation.x) * k;
        P.earR.rotation.x += ((flat ? -0.5 : 0) - P.earR.rotation.x) * k;

        const bob = this.typing ? Math.abs(Math.sin(t * (this.frantic ? 21 : 8.5))) * (this.frantic ? 0.03 : 0.016) : 0;
        const bobR = this.typing ? Math.abs(Math.sin(t * (this.frantic ? 21 : 8.5) + Math.PI)) * (this.frantic ? 0.03 : 0.016) : 0;
        P.legFL.position.set(-0.088, 0.19 + cur.pawY + bob, -0.11 + cur.pawZ);
        P.legFR.position.set(0.088, 0.19 + cur.pawY + bobR, -0.11 + cur.pawZ);
        P.legFL.rotation.x = cur.pawRotX;
        P.legFR.rotation.x = cur.pawRotX;

        const tt = this._tailTargets(cur.tail, t);
        this._tailCur.forEach((p, i) => {
            if (cur.tail !== this._tailPrevMode) {
                this._tailCur[i] = [...tt[i]];
            } else {
                p[0] += (tt[i][0] - p[0]) * k;
                p[1] += (tt[i][1] - p[1]) * k;
                p[2] += (tt[i][2] - p[2]) * k;
            }
            P.tailSegs[i].position.set(p[0], p[1], p[2]);
        });
        this._tailPrevMode = cur.tail;

        const lk = 1 - Math.exp(-1.8 * dt);
        this.ambient.intensity += (this.curTargets.ambient - this.ambient.intensity) * lk;
        this.hemi.intensity += (this.curTargets.hemi - this.hemi.intensity) * lk;
        this.moon.intensity += (this.curTargets.moon - this.moon.intensity) * lk;
        this.lampLight.intensity += (this.curTargets.lamp - this.lampLight.intensity) * lk;
        this.fill.intensity += (this.curTargets.fill - this.fill.intensity) * lk;
        const lampOn = Math.min(this.lampLight.intensity / 16, 1);
        this.shade.material.emissiveIntensity = lampOn * 1.6;
        this.bulb.material.emissiveIntensity = lampOn * 2.4;
        this.lampGlow.material.opacity = lampOn * 0.6;
        this.monitorLight.intensity += ((this.monitorOn ? 2.2 : 0) - this.monitorLight.intensity) * lk;
        this.screenMesh.material.emissiveIntensity = this.monitorOn ? 0.55 : 0.02;
        this.led.material.emissiveIntensity = this.monitorOn ? 1.2 : 0;

        this.redrawAcc += dt;
        if (this.monitorOn && this.redrawAcc > 0.25) {
            this.redrawAcc = 0;
            this._drawScreen();
        }

        for (let i = 0; i < this.dustVel.length / 3; i++) {
            this.dustPos[i * 3] += this.dustVel[i * 3] * dt * 30;
            this.dustPos[i * 3 + 1] += this.dustVel[i * 3 + 1] * dt * 30;
            this.dustPos[i * 3 + 2] += this.dustVel[i * 3 + 2] * dt * 30;
            if (this.dustPos[i * 3 + 1] > 1.45) this.dustPos[i * 3 + 1] = 0.45;
            if (this.dustPos[i * 3] < -0.75) this.dustPos[i * 3] = 0.2;
            if (this.dustPos[i * 3] > 0.25) this.dustPos[i * 3] = -0.7;
        }
        this.dust.geometry.attributes.position.needsUpdate = true;

        if (this.throwT >= 0 && this.kb.visible) {
            this.throwT += dt / 0.68;
            const e = Math.min(this.throwT, 1);
            const ease = e * e;
            this.kb.position.lerpVectors(this.kbStart, this.kbEnd, ease);
            this.kb.scale.setScalar(1 + ease * 4.8);
            this.kb.rotation.z = ease * 0.5;
            if (e >= 1) this.kb.visible = false;
        }

        this.shakeT = Math.max(0, this.shakeT - dt);
        const sk = this.shakeT > 0 ? Math.pow(this.shakeT / 0.9, 1.4) : 0;
        const dir = new THREE.Vector3().subVectors(this.baseTarget, this.basePos).normalize();
        const sway = new THREE.Vector3(
            Math.sin(t * 0.4) * 0.024 + Math.sin(t * 47) * 0.05 * sk,
            Math.sin(t * 0.55 + 1) * 0.018 + Math.cos(t * 53) * 0.045 * sk,
            Math.sin(t * 0.32 + 2) * 0.02 + Math.sin(t * 61) * 0.04 * sk
        );
        this.camera.position.copy(this.basePos).addScaledVector(dir, this.push).add(sway);
        const tgt = this.baseTarget.clone();
        tgt.x += Math.sin(t * 0.3) * 0.012;
        tgt.y += Math.sin(t * 0.42 + 1) * 0.01;
        this.camera.lookAt(tgt);

        if (this.anchorEl) {
            const v = new THREE.Vector3();
            P.head.getWorldPosition(v);
            v.y += 0.38;
            v.project(this.camera);
            const ax = (v.x * 0.5 + 0.5) * (this.container.clientWidth || window.innerWidth);
            const ay = (-v.y * 0.5 + 0.5) * (this.container.clientHeight || window.innerHeight);
            this.anchorEl.style.transform = `translate3d(${ax.toFixed(1)}px, ${ay.toFixed(1)}px, 0)`;
        }

        this.renderer.render(this.scene, this.camera);
    }
}
