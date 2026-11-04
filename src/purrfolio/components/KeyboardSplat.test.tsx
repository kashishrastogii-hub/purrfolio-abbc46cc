import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import KeyboardSplat from "./KeyboardSplat";

describe("Splat keyboard", () => {
    it("is a full classic keyboard with every key staying on the board", () => {
        render(<KeyboardSplat stage="hold" />);
        for (const label of ["Esc", "F1", "F12", "Backspace", "Tab", "Caps", "Enter", "Shift", "Ctrl", "Alt", "Space", "Fn", "Home", "PgUp", "Del"]) {
            expect(screen.getAllByText(label).length, label).toBeGreaterThan(0);
        }
        expect(screen.getByText("Q")).toBeTruthy();
        expect(screen.getByText("Z")).toBeTruthy();
        expect(document.querySelectorAll(".loose-key").length).toBe(0);
    });
});
