import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, PawPrint, RotateCcw, Lock, RefreshCw, MonitorSmartphone } from "lucide-react";
import Scene3D from "./components/scene3D";
import ScreenCrack from "./components/ScreenCrack";
import KeyboardSplat from "./components/KeyboardSplat";
import { FLIGHT_MS, HOLD_MS, DROP_MS } from "./lib/keyboardSplat";
import { useSpeech } from "./lib/speech";
import { INTRODUCTION, randomLetters, typingDelay, BANG_DURATION_MS } from "./lib/typingSequence";
import {
    unlockAudio,
    meow,
    keyClick,
    annoyedMeow,
    whoosh,
    slamCrash,
    glassSlide,
    keyClatter,
    happyMrrp,
    catSpeak,
} from "./lib/audio";

const BlockedCat = () => (
    <svg viewBox="0 0 120 108" width="92" aria-hidden="true" style={{ display: "block", margin: "0 auto" }}>
        <path d="M30 42 L8 26 L40 22 Z" fill="#eda45f" />
        <path d="M90 42 L112 26 L80 22 Z" fill="#eda45f" />
        <circle cx="60" cy="62" r="34" fill="#eda45f" />
        <ellipse cx="60" cy="76" rx="19" ry="13" fill="#ffe9c9" />
        <ellipse cx="47" cy="55" rx="6" ry="9" fill="#2d1c14" />
        <ellipse cx="73" cy="55" rx="6" ry="9" fill="#2d1c14" />
        <circle cx="49" cy="51" r="2" fill="#fff" />
        <circle cx="75" cy="51" r="2" fill="#fff" />
        <path d="M38 42 q 8 -6 14 -2" stroke="#2d1c14" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M82 42 q -8 -6 -14 -2" stroke="#2d1c14" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M55 70 L65 70 L60 76 Z" fill="#e2705e" />
        <path d="M52 82 q 8 -7 16 0" stroke="#2d1c14" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <g stroke="#7a4a33" strokeWidth="2.6" strokeLinecap="round">
            <path d="M30 62 L12 58" />
            <path d="M30 68 L14 70" />
            <path d="M90 62 L108 58" />
            <path d="M90 68 L106 70" />
        </g>
        <circle cx="36" cy="72" r="6" fill="#f2a98e" opacity="0.75" />
        <circle cx="84" cy="72" r="6" fill="#f2a98e" opacity="0.75" />
    </svg>
);

export default function Experience() {
    const [sceneVersion, setSceneVersion] = useState(0);
    const [phase, setPhase] = useState("sleep");
    const [catPose, setCatPose] = useState("curled");
    const [lit, setLit] = useState(false);
    const [monitorOn, setMonitorOn] = useState(false);
    const [screenText, setScreenText] = useState("");
    const [earsFlat, setEarsFlat] = useState(false);
    const [typingPaws, setTypingPaws] = useState(false);
    const [frantic, setFrantic] = useState(false);
    const [banging, setBanging] = useState(false);
    const [kbThrown, setKbThrown] = useState(false);
    const [splatStage, setSplatStage] = useState(null);
    const [crackOn, setCrackOn] = useState(false);
    const [shake, setShake] = useState(false);
    const [flashKey, setFlashKey] = useState(0);
    const [caption, setCaption] = useState("hint");
    const [bubble, setBubble] = useState(null);
    const [talking, setTalking] = useState(false);
    const [transcript, setTranscript] = useState({ final: "", interim: "" });
    const [micBlocked, setMicBlocked] = useState(null);
    const [leaving, setLeaving] = useState(false);
    const [crackFading, setCrackFading] = useState(false);
    const [faded, setFaded] = useState(false);

    const timers = useRef([]);
    const phaseRef = useRef(phase);
    const helloRef = useRef(false);
    const typeIdx = useRef(0);
    const fullText = useRef(INTRODUCTION);
    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    const later = useCallback((fn, ms) => {
        const id = setTimeout(fn, ms);
        timers.current.push(id);
        return id;
    }, []);
    const clearTimers = useCallback(() => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    }, []);
    useEffect(() => clearTimers, [clearTimers]);

    const say = useCallback(
        (text) => {
            const d = catSpeak(text);
            setTalking(true);
            later(() => setTalking(false), d + 250);
            return d;
        },
        [later]
    );

    const handleExitStage = useCallback(
        (stage) => {
            if (stage === "walk") {
                setBubble("leave");
                setTalking(true);
                later(() => setTalking(false), 2400);
            } else if (stage === "gone") {
                setBubble(null);
                setFaded(true);
            }
        },
        [later]
    );

    const rage = useCallback(() => {
        setEarsFlat(true);
        setFrantic(false);
        setTypingPaws(false);
        setBanging(true);
        annoyedMeow();
        later(() => {
            setBanging(false);
            whoosh();
            setKbThrown(true);
            setCatPose("turn");
            setSplatStage("flight");
            later(() => {
                slamCrash();
                setCrackOn(true);
                setSplatStage("hold");
                setShake(true);
                later(() => setShake(false), 700);
            }, FLIGHT_MS);
            later(() => { setSplatStage("slide"); glassSlide(); }, FLIGHT_MS + HOLD_MS);
            later(() => {
                keyClatter();
                setSplatStage(null);
                setPhase("cracked");
                setCaption("crack");
                later(() => { if (phaseRef.current === "cracked") setCaption("nudge"); }, 10000);
            }, DROP_MS);
        }, BANG_DURATION_MS);
    }, [later]);

    const startTyping = useCallback(() => {
        fullText.current = INTRODUCTION + " " + randomLetters();
        const step = () => {
            if (typeIdx.current >= INTRODUCTION.length) {
                setFrantic(true);
                setEarsFlat(true);
            }
            typeIdx.current += 1;
            keyClick();
            setScreenText(fullText.current.slice(0, typeIdx.current));
            if (typeIdx.current >= fullText.current.length) {
                rage();
                return;
            }
            later(step, typingDelay(typeIdx.current));
        };
        later(step, 60);
    }, [later, rage]);

    const wake = useCallback(() => {
        if (phaseRef.current !== "sleep") return;
        phaseRef.current = "wake";
        unlockAudio();
        meow();
        setPhase("wake");
        setCaption(null);
        setCatPose("stretch");
        later(() => setCatPose("sit"), 850);
        later(() => {
            setLit(true);
            setMonitorOn(true);
        }, 1100);
        later(() => {
            setPhase("typing");
            setTypingPaws(true);
            startTyping();
        }, 1800);
    }, [later, startTyping]);

    const speech = useSpeech({
        onStarted: () => {
            setPhase("listening");
            setCaption(null);
            setCatPose("turn");
            setBubble("sayhello");
            say("Say hello.");
        },
        onText: (fin, inter) => {
            setTranscript({ final: fin, interim: inter });
            if (helloRef.current) return;
            const h = (fin + " " + inter).toLowerCase();
            if (/hel+o|h[ai]l+o|\bhello\b|\bhi\b|\bhey\b|\bhiya\b/.test(h)) {
                helloRef.current = true;
                setBubble("good");
                setCatPose("happy");
                setPhase("happy");
                setEarsFlat(false);
                happyMrrp();
                const spoken = say("Good, I can hear you.");
                // Once the line is out, the crack fades and the cat begins its goodbye walk.
                later(() => {
                    setPhase("leaving");
                    setCaption(null);
                    setBubble(null);
                    setCrackFading(true);
                    setLeaving(true);
                    later(() => setCrackOn(false), 900);
                }, spoken + 550);
            }
        },
        onError: () => {
            setCaption(null);
            setMicBlocked("blocked");
            setPhase("blocked");
        },
    });

    const stopSpeech = useRef(speech.stop);
    stopSpeech.current = speech.stop;
    useEffect(() => {
        if (leaving) stopSpeech.current();
    }, [leaving]);

    const startListening = useCallback(() => {
        if (!speech.supported) {
            setMicBlocked("unsupported");
            setPhase("blocked");
            setCaption(null);
            return;
        }
        setCaption("micwait");
        setPhase("micwait");
        const ok = speech.start();
        if (!ok) {
            setMicBlocked("blocked");
            setPhase("blocked");
            setCaption(null);
        }
    }, [speech]);

    const tryAgain = () => {
        setMicBlocked(null);
        startListening();
    };

    const reset = () => {
        setSceneVersion((v) => v + 1);
        clearTimers();
        speech.stop();
        helloRef.current = false;
        typeIdx.current = 0;
        setPhase("sleep");
        setCatPose("curled");
        setLit(false);
        setMonitorOn(false);
        setScreenText("");
        setEarsFlat(false);
        setTypingPaws(false);
        setFrantic(false);
        setBanging(false);
        setKbThrown(false);
        setSplatStage(null);
        setCrackOn(false);
        setShake(false);
        setFlashKey(0);
        setCaption("hint");
        setBubble(null);
        setTalking(false);
        setTranscript({ final: "", interim: "" });
        setMicBlocked(null);
        setLeaving(false);
        setCrackFading(false);
        setFaded(false);
    };

    const showTranscript = ["micwait", "listening", "happy"].includes(phase);
    const transcriptLine = transcript.final || transcript.interim;

    return (
        <div className={"app-bg" + (shake ? " splat-shake" : "")}>
            <div className="stage3d" data-testid="room-scene">
                <Scene3D
                    key={`scene-${sceneVersion}`}
                    lit={lit}
                    monitorOn={monitorOn}
                    screenText={screenText}
                    catPose={catPose}
                    earsFlat={earsFlat}
                    typingPaws={typingPaws}
                    frantic={frantic}
                    banging={banging}
                    kbThrown={kbThrown}
                    shake={shake}
                    talking={talking}
                    bubble={bubble}
                    leaving={leaving}
                    onExitStage={handleExitStage}
                    onCatTap={wake}
                />
                <div key={`flash-${flashKey}`} className={"flash" + (flashKey ? " flash-on" : "")} />
                {caption === "hint" && (
                    <div className="chip" data-testid="caption-hint">
                        <PawPrint /> Tap the cat to wake it. Sound on.
                    </div>
                )}
                {caption === "crack" && (
                    <div className="chip" data-testid="caption-crack">
                        <MonitorSmartphone /> Typing is broken. Tap the crack so I can hear you.
                    </div>
                )}
                {caption === "nudge" && (
                    <div className="chip" data-testid="caption-nudge">
                        <PawPrint /> Psst… tap the crack.
                    </div>
                )}
                {caption === "micwait" && (
                    <div className="chip" data-testid="caption-micwait">
                        <Mic /> Asking for your microphone…
                    </div>
                )}
            </div>

            {crackOn && <ScreenCrack fading={crackFading} onTap={splatStage || leaving ? undefined : startListening} />}
            <KeyboardSplat stage={splatStage} />
            <div className={"exit-black" + (faded ? " on" : "")} data-testid="exit-black" aria-hidden="true" />

            <div className="wordmark">
                <PawPrint /> kashish.types
            </div>

            {showTranscript && (
                <div className="transcript" data-testid="transcript-bar">
                    <span className="dot" />
                    <b>You:</b>
                    <span className={"txt" + (!transcript.final && transcript.interim ? " interim" : "")} data-testid="transcript-text">
                        {transcriptLine || (phase === "listening" ? "…listening — say something" : "…")}
                    </span>
                </div>
            )}

            {phase === "happy" && (
                <button className="replay" data-testid="replay-btn" onClick={reset}>
                    <RotateCcw /> Replay
                </button>
            )}

            {micBlocked && (
                <div className="overlay" data-testid="mic-blocked">
                    <div className="panel">
                        <BlockedCat />
                        <h2>{micBlocked === "unsupported" ? "My ears need a newer browser" : "I can't hear you yet"}</h2>
                        {micBlocked === "unsupported" ? (
                            <p>
                                This browser doesn't support speech recognition. Open me in Chrome, Edge, or Safari
                                (iOS 14.5+), tap the crack again, and say hello.
                            </p>
                        ) : (
                            <>
                                <p>The microphone is blocked, but it's an easy fix:</p>
                                <div className="steps">
                                    <div className="step">
                                        <span className="n">
                                            <Lock />
                                        </span>
                                        Click the lock or microphone icon in your browser's address bar.
                                    </div>
                                    <div className="step">
                                        <span className="n">
                                            <Mic />
                                        </span>
                                        Set Microphone to <b>Allow</b>.
                                    </div>
                                    <div className="step">
                                        <span className="n">
                                            <RefreshCw />
                                        </span>
                                        Come back, tap the crack, and say hello.
                                    </div>
                                </div>
                                <button className="big-btn" data-testid="mic-try-again-btn" onClick={tryAgain}>
                                    Try again
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
