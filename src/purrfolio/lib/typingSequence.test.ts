import { describe, expect, it } from "vitest";
import { INTRODUCTION, randomLetters, typingDelay } from "./typingSequence";

describe("Requested typing sequence", () => {
    it("types faster after completing the introduction", () => {
        expect(typingDelay(INTRODUCTION.length - 1)).toBe(130);
        expect(typingDelay(INTRODUCTION.length)).toBeLessThan(130);
        expect(typingDelay(INTRODUCTION.length + 20)).toBeLessThan(typingDelay(INTRODUCTION.length));
    });
    it("generates random letters instead of a fixed misspelled sentence", () => {
        expect(randomLetters(() => 0)).toBe("a".repeat(32));
        expect(randomLetters(() => 0.99)).toBe("z".repeat(32));
    });
});