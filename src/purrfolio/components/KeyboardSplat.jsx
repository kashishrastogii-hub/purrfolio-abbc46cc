/* Classic full-size layout: Esc/F-row, number row, Tab row, Caps row, Shift row,
   bottom modifier row plus the arrow cluster. Keys never leave the board. */
const U = 29, X0 = 16, GAP = 2;
const ROWS = [
    { y: 8, h: 13, fs: 7, keys: [[1.5, "Esc"], [0.75, "gap"], [1, "F1"], [1, "F2"], [1, "F3"], [1, "F4"], [0.75, "gap"], [1, "F5"], [1, "F6"], [1, "F7"], [1, "F8"], [0.75, "gap"], [1, "F9"], [1, "F10"], [1, "F11"], [1, "F12"]] },
    { y: 27, h: 25, keys: [[1, "`"], [1, "1"], [1, "2"], [1, "3"], [1, "4"], [1, "5"], [1, "6"], [1, "7"], [1, "8"], [1, "9"], [1, "0"], [1, "-"], [1, "="], [2, "Backspace"]] },
    { y: 55, h: 25, keys: [[1.5, "Tab"], [1, "Q"], [1, "W"], [1, "E"], [1, "R"], [1, "T"], [1, "Y"], [1, "U"], [1, "I"], [1, "O"], [1, "P"], [1, "["], [1, "]"], [1.5, "\\"]] },
    { y: 83, h: 25, keys: [[1.75, "Caps"], [1, "A"], [1, "S"], [1, "D"], [1, "F"], [1, "G"], [1, "H"], [1, "J"], [1, "K"], [1, "L"], [1, ";"], [1, "'"], [2.25, "Enter"]] },
    { y: 111, h: 25, keys: [[2.25, "Shift"], [1, "Z"], [1, "X"], [1, "C"], [1, "V"], [1, "B"], [1, "N"], [1, "M"], [1, ","], [1, "."], [1, "/"], [2.75, "Shift"]] },
    { y: 139, h: 25, keys: [[1.25, "Ctrl"], [1.25, "Win"], [1.25, "Alt"], [7.5, "Space"], [1.25, "Alt"], [1.25, "Fn"], [1.25, "Ctrl"]] },
];
const KEYS = [];
for (const row of ROWS) {
    let x = X0;
    for (const [w, label] of row.keys) {
        if (label !== "gap") KEYS.push({ x, y: row.y, w: w * U - GAP, h: row.h, label, fs: row.fs ?? (label.length > 5 ? 7.5 : label.length > 1 ? 9 : 12), mod: label.length > 1 });
        x += w * U;
    }
}
/* navigation cluster and arrow cluster to the right of the main block */
const AX = X0 + 15 * U + 7;
[["Ins", 27], ["Home", 27], ["PgUp", 27], ["Del", 55], ["End", 55], ["PgDn", 55]].forEach(([label, y], i) =>
    KEYS.push({ x: AX + (i % 3) * U, y, w: U - GAP, h: 25, label, fs: 8, mod: false }));
KEYS.push({ x: AX + U, y: 111, w: U - GAP, h: 25, label: "↑", fs: 10, mod: false });
KEYS.push({ x: AX, y: 139, w: U - GAP, h: 25, label: "←", fs: 10, mod: false });
KEYS.push({ x: AX + U, y: 139, w: U - GAP, h: 25, label: "↓", fs: 10, mod: false });
KEYS.push({ x: AX + 2 * U, y: 139, w: U - GAP, h: 25, label: "→", fs: 10, mod: false });

export const SPLAT_KEYS = KEYS;

export default function KeyboardSplat({ stage }) {
    if (stage !== "hold" && stage !== "slide") return null;
    return <div className={`keyboard-splat keyboard-${stage}`} data-testid="keyboard-splat" data-stage={stage} aria-hidden="true">
        <svg className="stuck-keyboard" viewBox="0 0 560 190">
            <rect className="keyboard-edge" x="2" y="5" width="556" height="183" rx="17" />
            <rect className="keyboard-face" x="4" y="2" width="552" height="177" rx="15" />
            {KEYS.map((key, i) => <g key={i} className={key.mod ? "key-mod" : ""}>
                <rect className="keyboard-key" x={key.x} y={key.y} width={key.w} height={key.h} rx="4" />
                <text className="keyboard-letter" x={key.x + key.w / 2} y={key.y + key.h / 2 + key.fs * 0.36} textAnchor="middle" style={{ fontSize: key.fs }}>{key.label}</text>
            </g>)}
        </svg>
    </div>;
}
