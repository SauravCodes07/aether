import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Workspace",
  description: "Aether spatial computing workspace",
};

export default function WorkspacePage() {
  return (
    <section className="flex min-h-[80vh] items-center pt-16">
      <Container className="py-20 text-center">
        <p className="label-sm mb-4">Workspace</p>
        <h1 className="heading-lg text-gradient-subtle mb-4">
          Coming Soon
        </h1>
        <p className="body-md mx-auto mb-8 max-w-md">
          The {siteConfig.name} workspace is under construction. Service
          layers for Three.js, MediaPipe, and AI are ready to be wired in.
        </p>
        <Button variant="outline" href="/">
          Back to Home
        </Button>
      </Container>
    </section>
  );
}
