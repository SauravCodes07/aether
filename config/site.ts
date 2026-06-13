export const siteConfig = {
  name: "Aether",
  tagline: "Create Anything From Thin Air",
  description:
    "Aether is an AI-powered spatial computing platform that transforms ideas into immersive 3D experiences — design, build, and deploy in a unified workspace.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  links: {
    github: "https://github.com",
    docs: "/docs",
    workspace: "/workspace",
  },
  nav: [
    { label: "Platform", href: "#platform" },
    { label: "Features", href: "#features" },
    { label: "Integrations", href: "#integrations" },
  ],
  footer: {
    product: [
      { label: "Workspace", href: "/workspace" },
      { label: "Features", href: "#features" },
      { label: "Integrations", href: "#integrations" },
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
    ],
    legal: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
} as const;
