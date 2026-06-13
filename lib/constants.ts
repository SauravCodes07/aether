import type { Integration } from "@/types";

export const integrations: Integration[] = [
  {
    id: "supabase",
    name: "Supabase",
    description: "Auth, database, and real-time collaboration",
    status: "planned",
  },
  {
    id: "mediapipe",
    name: "MediaPipe",
    description: "Hand and pose tracking for spatial input",
    status: "planned",
  },
  {
    id: "threejs",
    name: "Three.js",
    description: "Real-time 3D rendering and scene graph",
    status: "planned",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Generative AI for content and code",
    status: "planned",
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Multimodal AI for vision and reasoning",
    status: "planned",
  },
];
