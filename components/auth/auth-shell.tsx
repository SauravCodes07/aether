import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center pt-24 pb-16">
      <div className="grid-pattern absolute inset-0 opacity-40" aria-hidden="true" />

      <Container className="relative z-10 w-full max-w-lg">
        <div className="glass-strong rounded-aether-2xl p-10 shadow-aether-lg sm:p-12">
          <div className="mb-8 flex flex-col items-center gap-4 text-center">
            <Logo variant="auth" href={null} />
            <div>
              <h1 className="heading-md text-gradient-subtle mb-2">{title}</h1>
              <p className="body-sm">{subtitle}</p>
            </div>
          </div>

          {children}

          {footer && (
            <div className="mt-6 border-t border-aether-border pt-6 text-center text-sm text-aether-text-muted">
              {footer}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
