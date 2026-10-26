import { Link } from "@tanstack/react-router";
import { PROFILE, SOCIALS } from "@/lib/socials";
import { GithubIcon, LinkedinIcon, WhatsAppIcon } from "./icons";

export function Navbar() {
  const socialLinks = [
    { href: SOCIALS.github, label: "GitHub", Icon: GithubIcon },
    ...(SOCIALS.linkedin ? [{ href: SOCIALS.linkedin, label: "LinkedIn", Icon: LinkedinIcon }] : []),
    { href: SOCIALS.whatsapp, label: "WhatsApp", Icon: WhatsAppIcon },
  ];

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="glass flex w-full max-w-3xl items-center gap-1 rounded-full py-2 pr-2 pl-3">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-[10px] bg-primary font-mono text-[11px] font-medium tracking-wide text-primary-foreground">
            AN
          </span>
          <span className="hidden text-sm font-semibold tracking-tight sm:block">
            {PROFILE.name}
          </span>
        </Link>

        <div className="mx-auto flex items-center gap-1">
          <Link
            to="/"
            className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-secondary [&.active]:text-foreground"
            activeProps={{ className: "active" }}
          >
            Home
          </Link>
          <Link
            to="/contact"
            className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-secondary [&.active]:text-foreground"
            activeProps={{ className: "active" }}
          >
            Contact
          </Link>
        </div>

        <div className="hidden items-center gap-0.5 sm:flex">
          {socialLinks.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Icon size={16} />
            </a>
          ))}
        </div>

        <Link
          to="/contact"
          className="ml-1 shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.04] active:scale-95"
        >
          Let&apos;s talk
        </Link>
      </nav>
    </header>
  );
}
