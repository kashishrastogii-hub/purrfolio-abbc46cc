const KEYS = Array.from({ length: 48 }, (_, i) => ({ x: 25 + (i % 12) * 42, y: 23 + Math.floor(i / 12) * 34, label: "QWERTYUIOPASDFGHJKLZXCVBNM"[i % 26] }));
export default function KeyboardSplat({ stage }) {
    if (stage !== "hold" && stage !== "slide") return null;
    return <div className={`keyboard-splat keyboard-${stage}`} data-testid="keyboard-splat" data-stage={stage} aria-hidden="true">
        <svg className="stuck-keyboard" viewBox="0 0 560 190">
            <rect className="keyboard-edge" x="2" y="5" width="556" height="183" rx="17" />
            <rect className="keyboard-face" x="4" y="2" width="552" height="177" rx="15" />
            {KEYS.map((key, i) => <g key={i} className={[5, 17, 30, 43].includes(i) ? "key-empty" : ""}>
                <rect className="keyboard-key" x={key.x} y={key.y} width="34" height="26" rx="4" />
                <text className="keyboard-letter" x={key.x + 17} y={key.y + 18} textAnchor="middle">{key.label}</text>
            </g>)}
            <rect className="keyboard-key" x="185" y="157" width="185" height="14" rx="4" />
        </svg>
        {["R", "A", "K", "!"].map((key, i) => <span key={key} className={`loose-key loose-key-${i}`}>{key}</span>)}
    </div>;
}