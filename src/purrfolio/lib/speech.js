import { useCallback, useEffect, useRef } from "react";

const getSR = () =>
    (typeof window !== "undefined" &&
        (window.SpeechRecognition || window.webkitSpeechRecognition)) ||
    null;

/**
 * Continuous browser speech recognition.
 * onStarted(), onText(finalText, interimText), onError(errorCode)
 */
export function useSpeech({ onStarted, onText, onError }) {
    const recRef = useRef(null);
    const wantRef = useRef(false);
    const cbs = useRef({});
    cbs.current = { onStarted, onText, onError };

    const stop = useCallback(() => {
        wantRef.current = false;
        try {
            recRef.current && recRef.current.stop();
        } catch (e) {
            /* already stopped */
        }
    }, []);

    const start = useCallback(() => {
        const SR = getSR();
        if (!SR) return false;
        if (recRef.current) stop();
        const rec = new SR();
        recRef.current = rec;
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        rec.onstart = () => cbs.current.onStarted && cbs.current.onStarted();
        rec.onresult = (e) => {
            let fin = "";
            let inter = "";
            for (let i = 0; i < e.results.length; i++) {
                const r = e.results[i];
                if (r.isFinal) fin += r[0].transcript;
                else inter += r[0].transcript;
            }
            cbs.current.onText && cbs.current.onText(fin.trim(), inter.trim());
        };
        rec.onerror = (e) => {
            if (["not-allowed", "service-not-allowed", "audio-capture"].includes(e.error)) {
                wantRef.current = false;
                cbs.current.onError && cbs.current.onError(e.error);
            }
        };
        rec.onend = () => {
            if (wantRef.current) {
                setTimeout(() => {
                    try {
                        rec.start();
                    } catch (e) {
                        /* restarting too fast */
                    }
                }, 300);
            }
        };
        wantRef.current = true;
        try {
            rec.start();
            return true;
        } catch (e) {
            return false;
        }
    }, [stop]);

    useEffect(() => stop, [stop]);

    return { supported: !!getSR(), start, stop };
}
