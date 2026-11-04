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
}) {
    const hostRef = useRef(null);
    const anchorRef = useRef(null);
    const modRef = useRef(null);
    const cbRef = useRef(onCatTap);
    cbRef.current = onCatTap;

    useEffect(() => {
        const mod = new Room3D(hostRef.current, {
            onCatTap: () => cbRef.current && cbRef.current(),
            anchorEl: anchorRef.current,
        });
        modRef.current = mod;
        return () => {
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
                        {bubble === "sayhello" ? "Say hello." : "Good, I can hear you."}
                    </div>
                )}
            </div>
            <div className="vignette" />
        </div>
    );
}
