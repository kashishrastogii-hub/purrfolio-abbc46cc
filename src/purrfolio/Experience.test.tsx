import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Experience from "./Experience.jsx";

const captured = vi.hoisted(() => ({ current: {} as Record<string, any> }));
vi.mock("./components/scene3D", () => ({ default: (props: Record<string, any>) => {
    captured.current = props;
    return <button aria-label="Tap cat" onClick={props['onCatTap']} />;
} }));
vi.mock("./lib/speech", () => ({ useSpeech: () => ({ stop: vi.fn(), supported: false }) }));
vi.mock("./lib/audio", () => ({
    unlockAudio: vi.fn(), meow: vi.fn(), keyClick: vi.fn(), annoyedMeow: vi.fn(),
    whoosh: vi.fn(), slamCrash: vi.fn(), happyMrrp: vi.fn(), catSpeak: vi.fn(),
}));

beforeEach(() => vi.useFakeTimers());
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("Cat interaction", () => {
    it("stays curled asleep without typing until tapped", async () => {
        render(<Experience />);
        await act(async () => { vi.advanceTimersByTime(15000); });
        expect(captured.current['catPose']).toBe("curled");
        expect(captured.current['typingPaws']).toBe(false);
        expect(captured.current['monitorOn']).toBe(false);
        fireEvent.click(screen.getByRole("button", { name: "Tap cat" }));
        await act(async () => { vi.advanceTimersByTime(1800); });
        expect(captured.current['catPose']).toBe("sit");
        expect(captured.current['typingPaws']).toBe(true);
    });
    it("reveals one letter at a time then the exact introduction before random typing and banging", async () => {
        render(<Experience />);
        fireEvent.click(screen.getByRole("button", { name: "Tap cat" }));
        await act(async () => { vi.advanceTimersByTime(1860); });
        expect(captured.current['screenText']).toBe("H");
        await act(async () => { vi.advanceTimersByTime(130); });
        expect(captured.current['screenText']).toBe("Hi");
        await act(async () => { vi.advanceTimersByTime(130 * 30); });
        expect(captured.current['screenText']).toBe("Hi I am Kashish. I am working on");
        expect(captured.current['frantic']).toBe(false);
        await act(async () => { vi.advanceTimersByTime(1000); });
        expect(captured.current['frantic']).toBe(true);
        expect(captured.current['screenText']).toMatch(/^Hi I am Kashish\. I am working on [a-z]+$/);
        await act(async () => { vi.advanceTimersByTime(1000); });
        expect(captured.current['banging']).toBe(true);
        expect(captured.current['kbThrown']).toBe(false);
        expect(captured.current['typingPaws']).toBe(false);
        await act(async () => { vi.advanceTimersByTime(1100); });
        expect(captured.current['banging']).toBe(false);
        expect(captured.current['kbThrown']).toBe(true);
    });
});