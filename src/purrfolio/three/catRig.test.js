import { describe, expect, it } from "vitest";
import { POSES } from "./catRig";
import { Vector3, Euler } from "three";

describe("Kitten pose behavior", () => {
    it("starts with closed sleeping eyes and gentle breathing", () => {
        expect(POSES.curled.eye).toBe(0);
        expect(POSES.curled.breath).toBeLessThanOrEqual(0.02);
        expect(POSES.curled.tail).toBe("wrap");
    });
    it("places awake paws on the keyboard surface", () => {
        const paw = new Vector3(0, -0.093, -0.018)
            .applyEuler(new Euler(POSES.sit.pawRotX, 0, 0))
            .add(new Vector3(0, 0.53 + 0.19 + POSES.sit.pawY, -1.81 - 0.11 + POSES.sit.pawZ));
        expect(paw.y).toBeCloseTo(0.78, 1);
        expect(paw.z).toBeGreaterThan(-2.17);
        expect(paw.z).toBeLessThan(-1.99);
    });
});