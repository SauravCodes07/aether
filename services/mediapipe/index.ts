/**
 * MediaPipe service placeholder for hand/pose tracking in spatial UI.
 * Install: npm install @mediapipe/tasks-vision
 */

export type MediaPipeConfig = {
  wasmPath: string;
  modelAssetPath: string;
};

export const defaultMediaPipeConfig: MediaPipeConfig = {
  wasmPath: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
  modelAssetPath: "",
};

export async function initMediaPipe(
  config: MediaPipeConfig = defaultMediaPipeConfig,
): Promise<null> {
  void config;
  // const vision = await import("@mediapipe/tasks-vision");
  // Initialize HandLandmarker or PoseLandmarker here

  return null;
}
