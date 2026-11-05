export interface CatPose {
    bodyPos: [number, number, number];
    bodyScale: [number, number, number];
    bodyRotX: number;
    headPos: [number, number, number];
    headRotX: number;
    headRotY: number;
    headRotZ: number;
    eye: number;
    jaw: number;
    droop: number;
    pawY: number;
    pawZ: number;
    pawRotX: number;
    tail: "wrap" | "up" | "down";
    breath: number;
}

export const POSES: Record<
    "curled" | "stretch" | "sit" | "turn" | "happy" | "hop" | "stretchFloor" | "walk" | "crouch",
    CatPose
>;