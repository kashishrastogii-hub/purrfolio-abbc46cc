import { useEffect, useRef } from "react";
import { Room3D } from "../three/room3d";

export default function Scene3D({
    catPose,
    earsFlat,
    typingPaws,
    frantic,
    banging,
    talking,
    lit,
    monitorOn,
    screenText,
    kbThrown,
    shake,
    onCatTap,
    bubble,
    leaving,
    onExitStage,
}) {
    const hostRef = useRef(null);
    const anchorRef = useRef(null);
    const modRef = useRef(null);
    const cbRef = useRef(onCatTap);
    cbRef.current = onCatTap;
    const exitCbRef = useRef(onExitStage);
    exitCbRef.current = onExitStage;

    useEffect(() => {
        const mod = new Room3D(hostRef.current, {
            onCatTap: () => cbRef.current && cbRef.current(),
            onExitStage: (stage) => exitCbRef.current && exitCbRef.current(stage),
            anchorEl: anchorRef.current,
        });
        modRef.current = mod;
        if (import.meta.env.DEV) {
            window.__game = {
                get state() {
                    return { pose: mod.poseName, typing: mod.typing, frantic: mod.frantic, banging: mod.banging, text: mod.screenText, monitor: mod.monitorOn, throwT: mod.throwT, headYaw: mod.cat.head.rotation.y };
                },
                catPoint: () => {
                    const v = mod.hit.position.clone().project(mod.camera);
                    return [(v.x * 0.5 + 0.5) * mod.container.clientWidth, (-v.y * 0.5 + 0.5) * mod.container.clientHeight];
                },
                sim: (seconds) => {
                    for (let t = 0; t < seconds; t += 1 / 60) mod.advance(1 / 60, t);
                },
                renderPose: (pose, seconds = 1) => { mod.setPose(pose); for(let t=0;t<seconds;t+=1/60) mod.advance(1/60,t); },
                tap: () => mod.onCatTap && mod.onCatTap(),
                exit: () => mod.startExit(),
                exitState: () => ({ stage: mod.exitStage, t: mod.exitT, flap: mod.flapAngle, cat: mod.catGroup.position.toArray(), visible: mod.catGroup.visible }),
            };
        }
        return () => {
            if (import.meta.env.DEV) delete window.__game;
            modRef.current = null;
            mod.dispose();
        };
    }, []);

    useEffect(() => {
        modRef.current && modRef.current.setPose(catPose);
    }, [catPose]);
    useEffect(() => {
        modRef.current && modRef.current.setEarsFlat(earsFlat);
    }, [earsFlat]);
    useEffect(() => {
        modRef.current && modRef.current.setTyping(typingPaws, frantic);
    }, [typingPaws, frantic]);
    useEffect(() => {
        modRef.current && modRef.current.setFrantic(frantic);
    }, [frantic]);
    useEffect(() => {
        modRef.current && modRef.current.setBanging(banging);
    }, [banging]);
    useEffect(() => {
        modRef.current && modRef.current.setTalking(talking);
    }, [talking]);
    useEffect(() => {
        modRef.current && modRef.current.setLit(lit);
    }, [lit]);
    useEffect(() => {
        modRef.current && modRef.current.setMonitor(monitorOn);
    }, [monitorOn]);
    useEffect(() => {
        modRef.current && modRef.current.setScreenText(screenText);
    }, [screenText]);
    useEffect(() => {
        if (kbThrown && modRef.current) modRef.current.throwKeyboard();
    }, [kbThrown]);
    useEffect(() => {
        if (shake && modRef.current) modRef.current.shake();
    }, [shake]);
    useEffect(() => {
        if (leaving && modRef.current) modRef.current.startExit();
    }, [leaving]);

    return (
        <div className="canvas-host" data-testid="scene-canvas" ref={hostRef}>
            <div className="anchor" ref={anchorRef}>
                {catPose === "curled" && (
                    <div className="zs" data-testid="zzz">
                        <span className="z1">z</span>
                        <span className="z2">z</span>
                        <span className="z3">Z</span>
                    </div>
                )}
                {bubble && (
                    <div className={bubble === "sayhello" ? "bubble3d" : "bubble3d wide"} data-testid="cat-bubble">
                        {bubble === "sayhello"
                            ? "Say hello."
                            : bubble === "leave"
                              ? "You can talk to me, no keyboard needed."
                              : "Good, I can hear you."}
                    </div>
                )}
            </div>
            <div className="vignette" />
        </div>
    );
}
