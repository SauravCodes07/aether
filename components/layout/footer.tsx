import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";

const footerGroups = [
  { title: "Product", links: siteConfig.footer.product },
  { title: "Company", links: siteConfig.footer.company },
  { title: "Legal", links: siteConfig.footer.legal },
];

export function Footer() {
  return (
    <footer className="border-t border-aether-border bg-aether-bg-elevated">
      <Container className="py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-aether-text-muted">
              {siteConfig.description}
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="label-sm mb-4">{group.title}</h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-aether-text-muted transition-colors hover:text-aether-text"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-aether-border pt-8 sm:flex-row">
          <p className="text-xs text-aether-text-subtle">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href={siteConfig.links.github}
              className="text-xs text-aether-text-subtle transition-colors hover:text-aether-text-muted"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href={siteConfig.links.docs}
              className="text-xs text-aether-text-subtle transition-colors hover:text-aether-text-muted"
            >
              Documentation
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
