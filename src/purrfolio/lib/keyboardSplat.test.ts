import { describe, expect, it } from "vitest";
import { FLIGHT_MS, HOLD_MS, DROP_MS, throwStage, slideProgress, RIGHT_TAIL } from "./keyboardSplat";
describe("Keyboard splat rules", () => {
    it("hits the viewer in under one second", () => {
        expect(FLIGHT_MS).toBe(650);
        expect(throwStage(649)).toBe("flight");
        expect(throwStage(650)).toBe("hold");
    });
    it("sticks to the glass for one and a half seconds", () => {
        expect(HOLD_MS).toBe(1500);
        expect(throwStage(2149)).toBe("hold");
        expect(throwStage(2150)).toBe("slide");
    });
    it("slides slowly at first and accelerates off screen", () => {
        expect(slideProgress(2600)).toBe(0.0625);
        expect(slideProgress(3050)).toBe(0.25);
        expect(slideProgress(3500)).toBe(0.5625);
        expect(throwStage(DROP_MS)).toBe("gone");
    });
    it("drapes the tail over the right chair edge", () => {
        expect(RIGHT_TAIL.slice(2).every(p => (p[0] ?? 0) > 0.25)).toBe(true);
        expect(RIGHT_TAIL[5]?.[1]).toBe(-0.33);
    });
});