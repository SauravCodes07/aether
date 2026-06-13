import { Container } from "@/components/ui/container";
import Image from "next/image";

const testimonials = [
  {
    quote:
      "Aether completely transformed how our team approaches spatial design. What used to take weeks now takes hours.",
    name: "Sarah Chen",
    role: "VP of Engineering",
    company: "Nexus Labs",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    quote:
      "The AI co-creation features are unlike anything else on the market. It's like having a senior 3D artist on call 24/7.",
    name: "Marcus Rivera",
    role: "Creative Director",
    company: "Void Studio",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    quote:
      "We shipped our first spatial experience in 3 days instead of 3 months. Aether is the future of immersive development.",
    name: "Aiko Tanaka",
    role: "CTO",
    company: "Horizon AI",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    quote:
      "The real-time collaboration is seamless. Our distributed team works on 3D scenes as naturally as Google Docs.",
    name: "James O'Brien",
    role: "Lead Developer",
    company: "CloudForge",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="section-padding border-t border-aether-border bg-aether-bg">
      <Container>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="label-sm mb-4">Testimonials</p>
          <h2 className="heading-lg text-gradient-subtle mb-4">
            Loved by builders worldwide
          </h2>
          <p className="body-md">
            See what industry leaders are saying about building with Aether.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="group relative rounded-2xl border border-aether-border bg-aether-surface/20 p-8 transition-all duration-300 hover:border-aether-accent/30 hover:bg-aether-surface/40 hover:shadow-aether-lg"
            >
              {/* Decorative quote mark */}
              <div className="absolute right-6 top-6 text-4xl font-serif text-aether-accent/10 transition-colors group-hover:text-aether-accent/20">
                &ldquo;
              </div>

              <p className="relative z-10 mb-6 text-sm leading-relaxed text-aether-text-muted italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              <div className="flex items-center gap-4">
                <Image 
                  src={testimonial.imageUrl} 
                  alt={testimonial.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover border border-aether-border bg-aether-surface shadow-sm"
                />
                <div>
                  <p className="text-sm font-semibold text-aether-text">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-aether-text-subtle">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>

              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-aether-accent/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
