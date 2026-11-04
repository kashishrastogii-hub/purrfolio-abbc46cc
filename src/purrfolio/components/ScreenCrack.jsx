const MAIN = [
    "M960 470 L880 390 L858 392 L760 300 L748 200",
    "M960 470 L1040 380 L1090 372 L1180 280",
    "M960 470 L1050 520 L1150 540 L1300 610 L1420 610",
    "M960 470 L900 560 L870 660 L900 780 L850 900",
    "M960 470 L820 500 L680 480 L520 540 L380 520",
    "M960 470 L1000 560 L990 690 L1050 820",
    "M960 470 L1060 470 L1220 440 L1380 470 L1560 420",
    "M960 470 L870 430 L800 340",
    "M960 470 L1010 430 L1080 320 L1090 180",
    "M960 470 L860 540 L760 600 L600 640 L460 740",
];

const BRANCH = [
    "M858 392 L830 330",
    "M1040 380 L1060 300",
    "M900 560 L820 580",
    "M1050 520 L1120 490",
    "M820 500 L740 470",
    "M1000 560 L1080 600",
    "M760 600 L770 680",
    "M1220 440 L1260 380",
];

const SHARDS = [
    "960,470 918,432 896,472",
    "960,470 1006,438 1022,486",
    "960,470 908,516 954,528",
    "960,470 996,510 942,522",
];

const ALL = [...MAIN, ...BRANCH];

export default function ScreenCrack({ onTap }) {
    return (
        <svg
            className="crack-svg"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            data-testid="screen-crack"
            aria-hidden="true"
        >
            <defs>
                <radialGradient id="impactOv">
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
                    <stop offset="0.4" stopColor="#ffe9c9" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#ffe9c9" stopOpacity="0" />
                </radialGradient>
                <filter id="softOv" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="5" />
                </filter>
            </defs>
            <g className="crack-on">
                <circle cx="960" cy="470" r="180" fill="url(#impactOv)" opacity="0.55" />
                <g className="crack-glow">
                    <g filter="url(#softOv)" stroke="#ffb45e" strokeWidth="9" fill="none" opacity="0.6" strokeLinecap="round" strokeLinejoin="round">
                        {ALL.map((d, i) => (
                            <path key={`g${i}`} d={d} pathLength="100" className="crackpath" style={{ transitionDelay: `${i * 55}ms` }} />
                        ))}
                    </g>
                    <g stroke="#33261f" strokeWidth="3" fill="none" opacity="0.92" strokeLinecap="round" strokeLinejoin="round">
                        {ALL.map((d, i) => (
                            <path key={i} d={d} pathLength="100" className="crackpath" style={{ transitionDelay: `${i * 55}ms` }} />
                        ))}
                    </g>
                    <g fill="#ffffff" opacity="0.3">
                        {SHARDS.map((p, i) => (
                            <polygon key={i} points={p} />
                        ))}
                    </g>
                </g>
            </g>
            <rect
                width="1920"
                height="1080"
                fill="transparent"
                data-testid="crack-tap"
                role="button"
                aria-label="Tap the crack"
                onClick={onTap}
                style={{ pointerEvents: "auto", cursor: "pointer" }}
            />
        </svg>
    );
}
