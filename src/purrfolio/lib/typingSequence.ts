export const INTRODUCTION = "Hi I am Kashish. I am working on";
export const RANDOM_LETTER_COUNT = 32;
export const DESK_CENTER_X = -0.35;
export const BANG_DURATION_MS = 1050;

export function randomLetters(random = Math.random): string {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    return Array.from({ length: RANDOM_LETTER_COUNT }, () =>
        alphabet[Math.min(25, Math.max(0, Math.floor(random() * 26)))]
    ).join("");
}

export function typingDelay(index: number): number {
    if (index < INTRODUCTION.length) return 130;
    return Math.max(18, 48 - (index - INTRODUCTION.length));
}