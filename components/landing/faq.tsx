"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";

const faqs = [
  {
    question: "What is Aether?",
    answer:
      "Aether is an AI-powered spatial computing platform that lets you design, build, and deploy immersive 3D experiences from a single workspace. It combines a real-time 3D editor, AI generation tools, gesture-based input, and cloud deployment.",
  },
  {
    question: "Do I need 3D experience to use Aether?",
    answer:
      "No. Aether is designed to be accessible to everyone. Our AI co-creation tools can generate 3D models, textures, and layouts from natural language prompts. The spatial editor uses intuitive drag-and-drop interactions that anyone can learn in minutes.",
  },
  {
    question: "How does real-time collaboration work?",
    answer:
      "Aether uses Supabase Realtime under the hood to sync changes instantly across all connected clients. Multiple team members can work on the same 3D scene simultaneously, with live cursor tracking, presence indicators, and conflict-free editing.",
  },
  {
    question: "Can I deploy my spatial experiences to the web?",
    answer:
      "Yes. Aether integrates with Vercel for one-click deployment. Your spatial experiences are compiled to optimized WebGL bundles that run in any modern browser — no app installs required for your end users.",
  },
  {
    question: "What AI models does Aether use?",
    answer:
      "Aether supports multiple AI providers including OpenAI and Google Gemini. You can use AI for generating 3D models, textures, spatial layouts, code assistance, and natural language scene descriptions. Enterprise plans support custom model integrations.",
  },
  {
    question: "Is there a free tier?",
    answer:
      "Yes. Our Free plan includes 1 workspace, basic 3D editing, 5 AI generations per day, and 1 GB of storage. It's perfect for exploring the platform and building personal projects. Upgrade to Pro when you need more power.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your data is yours. If you cancel your Pro or Enterprise subscription, your workspaces remain accessible in read-only mode for 90 days. You can export all your assets and scenes at any time, even after cancellation.",
  },
  {
    question: "Does Aether support gesture and hand tracking?",
    answer:
      "Yes. Aether integrates MediaPipe for hand and pose tracking, enabling gesture-based spatial input. You can manipulate 3D objects, navigate scenes, and trigger actions using natural hand movements through your webcam.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="section-padding border-t border-aether-border">
      <Container>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="label-sm mb-4">FAQ</p>
          <h2 className="heading-lg text-gradient-subtle mb-4">
            Frequently asked questions
          </h2>
          <p className="body-md">
            Everything you need to know about Aether. Can&apos;t find what you&apos;re looking for?{" "}
            <a href="#" className="text-aether-text-link hover:text-aether-accent-light transition-colors">
              Contact us
            </a>
            .
          </p>
        </div>

        <div className="mx-auto max-w-3xl divide-y divide-aether-border">
          {faqs.map((faq, idx) => (
            <div key={idx} className="group">
              <button
                className="flex w-full items-center justify-between py-5 text-left transition-colors"
                onClick={() => toggle(idx)}
                aria-expanded={openIndex === idx}
              >
                <span className="pr-4 text-sm font-medium text-aether-text group-hover:text-aether-accent-light transition-colors">
                  {faq.question}
                </span>
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-aether-border transition-all group-hover:border-aether-accent/40">
                  <svg
                    className={`h-3.5 w-3.5 text-aether-text-muted transition-transform duration-200 ${
                      openIndex === idx ? "rotate-45" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" />
                  </svg>
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === idx ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-sm leading-relaxed text-aether-text-muted">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
