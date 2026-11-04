const MAIN = [
    "M960 470 L880 390 L858 392 L760 300 L748 200 L610 0",
    "M960 470 L1040 380 L1090 372 L1180 280 L1430 210 L1740 0",
    "M960 470 L1050 520 L1150 540 L1300 610 L1420 610 L1620 720 L1920 800",
    "M960 470 L900 560 L870 660 L900 780 L850 900 L780 1080",
    "M960 470 L820 500 L680 480 L520 540 L380 520 L190 560 L0 510",
    "M960 470 L1000 560 L990 690 L1050 820 L1190 980 L1250 1080",
    "M960 470 L1060 470 L1220 440 L1380 470 L1560 420 L1920 360",
    "M960 470 L870 430 L800 340 L530 250 L0 180",
    "M960 470 L1010 430 L1080 320 L1090 180 L1050 0",
    "M960 470 L860 540 L760 600 L600 640 L460 740 L260 920 L0 1080",
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
            preserveAspectRatio="none"
            data-testid="screen-crack"
            aria-hidden="true"
        >
            <g className="crack-on">
                <g>
                    <g className="glass-fracture-shadow" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        {ALL.map((d, i) => (
                            <path key={`g${i}`} d={d} pathLength="100" className="crackpath" />
                        ))}
                    </g>
                    <g className="glass-fracture-edge" fill="none" transform="translate(1.3 -0.8)" strokeLinecap="round" strokeLinejoin="round">
                        {ALL.map((d, i) => (
                            <path key={i} d={d} pathLength="100" className="crackpath" />
                        ))}
                    </g>
                    <g className="glass-shards">
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
