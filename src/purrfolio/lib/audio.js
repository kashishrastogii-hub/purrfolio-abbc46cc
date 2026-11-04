let ctx = null;
let master = null;

export function unlockAudio() {
    if (typeof window === "undefined") return;
    if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.9;
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -4;
        limiter.ratio.value = 12;
        master.connect(limiter);
        limiter.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
}

const ready = () => !!ctx && ctx.state !== "closed";
const now = () => ctx.currentTime;

function envGain(t0, dur, peak, attack = 0.012) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.001), t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    g.connect(master);
    return g;
}

function noiseBuf(dur) {
    const n = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const b = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
}

function noiseHit({ t0, dur = 0.08, f = 2400, f1 = 0, q = 1, g = 0.2, type = "bandpass" }) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf(dur);
    const flt = ctx.createBiquadFilter();
    flt.type = type;
    flt.frequency.setValueAtTime(f, t0);
    if (f1) flt.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t0 + dur);
    flt.Q.value = q;
    const gn = envGain(t0, dur, g);
    src.connect(flt);
    flt.connect(gn);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
}

function toneHit({ t0, type = "triangle", f0 = 440, f1 = 0, dur = 0.2, g = 0.2, bp = 0 }) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t0);
    if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t0 + dur);
    const gn = envGain(t0, dur, g);
    let node = o;
    if (bp) {
        const flt = ctx.createBiquadFilter();
        flt.type = "bandpass";
        flt.frequency.value = bp;
        flt.Q.value = 1.4;
        o.connect(flt);
        node = flt;
    }
    node.connect(gn);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
}

/* a clear, warm two-formant meow: mmrr-IAAUW */
export function meow() {
    if (!ready()) return;
    const t = now();
    const dur = 1.05;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(300, t);
    o.frequency.linearRampToValueAtTime(560, t + 0.24);
    o.frequency.linearRampToValueAtTime(640, t + 0.46);
    o.frequency.linearRampToValueAtTime(250, t + dur);
    const vib = ctx.createOscillator();
    vib.frequency.value = 6.3;
    const vibG = ctx.createGain();
    vibG.gain.setValueAtTime(0, t);
    vibG.gain.linearRampToValueAtTime(11, t + 0.5);
    vib.connect(vibG);
    vibG.connect(o.frequency);
    const f1 = ctx.createBiquadFilter();
    f1.type = "bandpass";
    f1.frequency.setValueAtTime(760, t);
    f1.frequency.linearRampToValueAtTime(980, t + 0.4);
    f1.frequency.linearRampToValueAtTime(560, t + dur);
    f1.Q.value = 6;
    const f2 = ctx.createBiquadFilter();
    f2.type = "bandpass";
    f2.frequency.setValueAtTime(1750, t);
    f2.frequency.linearRampToValueAtTime(2100, t + 0.4);
    f2.frequency.linearRampToValueAtTime(1200, t + dur);
    f2.Q.value = 8;
    const g1 = ctx.createGain();
    g1.gain.value = 1;
    const g2 = ctx.createGain();
    g2.gain.value = 0.55;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(0.5, t + 0.09);
    out.gain.linearRampToValueAtTime(0.44, t + 0.55);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const tame = ctx.createBiquadFilter();
    tame.type = "lowpass";
    tame.frequency.value = 3600;
    o.connect(f1);
    f1.connect(g1);
    g1.connect(out);
    o.connect(f2);
    f2.connect(g2);
    g2.connect(out);
    out.connect(tame);
    tame.connect(master);
    o.start(t);
    o.stop(t + dur + 0.1);
    vib.start(t);
    vib.stop(t + dur + 0.1);
    noiseHit({ t0: t, dur: 0.09, f: 2400, q: 0.8, g: 0.05, type: "highpass" });
}

/* low flat annoyed mrrroww with growl */
export function annoyedMeow() {
    if (!ready()) return;
    const t = now();
    const dur = 1.15;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(520, t);
    o.frequency.linearRampToValueAtTime(340, t + 0.3);
    o.frequency.linearRampToValueAtTime(180, t + dur);
    const vib = ctx.createOscillator();
    vib.frequency.value = 9;
    const vibG = ctx.createGain();
    vibG.gain.setValueAtTime(0, t);
    vibG.gain.linearRampToValueAtTime(24, t + 0.4);
    vib.connect(vibG);
    vibG.connect(o.frequency);
    const f1 = ctx.createBiquadFilter();
    f1.type = "bandpass";
    f1.frequency.setValueAtTime(620, t);
    f1.frequency.linearRampToValueAtTime(380, t + dur);
    f1.Q.value = 5;
    const f2 = ctx.createBiquadFilter();
    f2.type = "bandpass";
    f2.frequency.setValueAtTime(1350, t);
    f2.frequency.linearRampToValueAtTime(900, t + dur);
    f2.Q.value = 7;
    const g1 = ctx.createGain();
    g1.gain.value = 1;
    const g2 = ctx.createGain();
    g2.gain.value = 0.6;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.linearRampToValueAtTime(0.58, t + 0.07);
    out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const growl = ctx.createOscillator();
    growl.frequency.value = 9;
    const growlG = ctx.createGain();
    growlG.gain.value = 0.14;
    growl.connect(growlG);
    growlG.connect(out.gain);
    const tame = ctx.createBiquadFilter();
    tame.type = "lowpass";
    tame.frequency.value = 2800;
    o.connect(f1);
    f1.connect(g1);
    g1.connect(out);
    o.connect(f2);
    f2.connect(g2);
    g2.connect(out);
    out.connect(tame);
    tame.connect(master);
    o.start(t);
    o.stop(t + dur + 0.1);
    vib.start(t);
    vib.stop(t + dur + 0.1);
    growl.start(t);
    growl.stop(t + dur + 0.1);
    noiseHit({ t0: t, dur: dur, f: 260, q: 0.7, g: 0.12, type: "lowpass" });
}

/* one mechanical keyboard tick */
export function keyClick() {
    if (!ready()) return;
    const t = now();
    noiseHit({ t0: t, dur: 0.03, f: 2100 + Math.random() * 1700, q: 2, g: 0.15 });
    toneHit({ t0: t, type: "square", f0: 150 + Math.random() * 90, f1: 85, dur: 0.03, g: 0.05 });
}

/* keyboard whooshing toward the viewer */
export function whoosh() {
    if (!ready()) return;
    noiseHit({ t0: now(), dur: 0.45, f: 350, f1: 1500, q: 1, g: 0.3 });
}

/* heavy slam + glass shatter */
export function slamCrash() {
    if (!ready()) return;
    const t = now();
    noiseHit({ t0: t, dur: 0.5, f: 3200, f1: 170, q: 0.7, g: 0.62, type: "lowpass" });
    toneHit({ t0: t, type: "sine", f0: 130, f1: 36, dur: 0.5, g: 0.8 });
    noiseHit({ t0: t + 0.03, dur: 0.3, f: 6500, q: 0.6, g: 0.2 });
    for (let i = 0; i < 7; i++) {
        toneHit({
            t0: t + 0.05 + Math.random() * 0.38,
            type: "sine",
            f0: 1800 + Math.random() * 2400,
            dur: 0.1 + Math.random() * 0.2,
            g: 0.09,
        });
    }
}

// Glass friction is continuous and pitch-changing; synthesis follows the sliding motion.
export function glassSlide() {
    if (!ready()) return;
    const t = now();
    noiseHit({t0:t,dur:1.7,f:900,f1:1900,q:6,g:0.08});
    toneHit({t0:t,type:"sine",f0:620,f1:390,dur:1.6,g:0.045});
}
export function keyClatter() {
    if (!ready()) return;
    const t=now();
    for(let i=0;i<5;i++) {
        noiseHit({t0:t+i*0.045,dur:0.055,f:1700+i*250,q:1.5,g:0.13-i*0.018});
        toneHit({t0:t+i*0.045,type:"triangle",f0:210+i*47,f1:90,dur:0.08,g:0.08});
    }
}

/* two happy rising blips */
export function happyMrrp() {
    if (!ready()) return;
    const t = now();
    toneHit({ t0: t, type: "triangle", f0: 520, f1: 660, dur: 0.11, g: 0.2, bp: 1200 });
    toneHit({ t0: t + 0.14, type: "triangle", f0: 620, f1: 790, dur: 0.13, g: 0.2, bp: 1200 });
}

/* animalese-style cat gibberish: one soft blip per syllable. returns duration ms */
export function catSpeak(text) {
    if (!ready()) return 600;
    const t0 = now() + 0.06;
    const words = text
        .replace(/[.,!?]/g, "")
        .split(/\s+/)
        .filter(Boolean);
    let t = t0;
    words.forEach((w, i) => {
        const syl = Math.max(1, Math.min(4, Math.ceil(w.length / 3)));
        for (let s = 0; s < syl; s++) {
            const f = 400 + ((i * 41 + s * 67) % 200) + (s === syl - 1 ? 60 : 0);
            toneHit({ t0: t, type: "triangle", f0: f, f1: f * 0.78, dur: 0.085, g: 0.17, bp: 1150 });
            t += 0.095;
        }
        t += 0.07;
    });
    return Math.max(400, (t - now()) * 1000);
}
