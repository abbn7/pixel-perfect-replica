import { SOCIALS } from "@/lib/socials";
import { GithubIcon, LinkedinIcon, WhatsAppIcon } from "./icons";

export function Footer() {
  return (
    <footer className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 border-t border-border/70 px-6 py-8 sm:flex-row">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        © 2026 Abdelhamed Nada
      </p>
      <div className="flex items-center gap-2">
        <a
          href={SOCIALS.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <GithubIcon size={17} />
        </a>
        {SOCIALS.linkedin ? (
          <a
            href={SOCIALS.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LinkedinIcon size={17} />
          </a>
        ) : null}
        <a
          href={SOCIALS.whatsapp}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <WhatsAppIcon size={17} />
        </a>
      </div>
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Built with React · Three.js
      </p>
    </footer>
  );
}
