export const FLIGHT_MS = 650;
export const HOLD_MS = 1500;
export const SLIDE_MS = 1800;
export const DROP_MS = FLIGHT_MS + HOLD_MS + SLIDE_MS;
export function throwStage(elapsedMs: number) {
    if (elapsedMs < FLIGHT_MS) return "flight";
    if (elapsedMs < FLIGHT_MS + HOLD_MS) return "hold";
    if (elapsedMs < DROP_MS) return "slide";
    return "gone";
}
export function slideProgress(elapsedMs: number) {
    const p = Math.max(0, Math.min(1, (elapsedMs - FLIGHT_MS - HOLD_MS) / SLIDE_MS));
    return p * p;
}
// Chair-space coordinates keep the plume on the right even as the kitten turns.
export const RIGHT_TAIL = [[0.025, 0.065, 0.12], [0.24, 0.07, 0.10], [0.34, -0.045, 0.075], [0.36, -0.17, 0.04], [0.37, -0.28, 0.025], [0.33, -0.33, 0.025]];