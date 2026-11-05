import { describe, expect, it } from "vitest";
import { POSES } from "./catRig";

describe("Kitten pose behavior", () => {
    it("starts with closed sleeping eyes and gentle breathing", () => {
        expect(POSES.curled.eye).toBe(0);
        expect(POSES.curled.breath).toBeLessThanOrEqual(0.02);
        expect(POSES.curled.tail).toBe("wrap");
    });
    it("places awake paws on the keyboard surface", () => {
        const angle = POSES.sit.pawRotX;
        const paw = {
            y: 0.53 + 1.12 * (0.19 + POSES.sit.pawY - 0.093 * Math.cos(angle) + 0.018 * Math.sin(angle)),
            z: -1.81 + 1.12 * (-0.093 * Math.sin(angle) - 0.018 * Math.cos(angle) - 0.11 + POSES.sit.pawZ),
        };
        expect(paw.y).toBeCloseTo(0.78, 1);
        expect(paw.z).toBeGreaterThan(-2.24);
        expect(paw.z).toBeLessThan(-2.12);
    });
    it("greets hello with a cute head tilt and closed eyes", () => {
        expect(POSES.happy.headRotZ).toBeGreaterThan(0.15);
        expect(POSES.happy.headRotZ).toBeLessThan(0.35);
        expect(POSES.happy.eye).toBe(0);
        expect(POSES.happy.jaw).toBeLessThan(0.3);
    });
    it("keeps every other pose head-tilt free", () => {
        for (const pose of ["curled", "stretch", "sit", "turn"] as const) {
            expect(POSES[pose].headRotZ).toBe(0);
        }
    });
});