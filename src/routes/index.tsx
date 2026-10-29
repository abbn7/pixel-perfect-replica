import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SceneMount } from "@/components/three/SceneMount";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Reveal } from "@/components/site/Reveal";
import { DownloadIcon, GithubIcon, WhatsAppIcon } from "@/components/site/icons";
import { PROFILE, SOCIALS } from "@/lib/socials";
import cvAsset from "@/assets/cv.pdf.asset.json";

const ROTATING_WORDS = ["idea", "store", "agent", "team"];

const STACK = [
  "React",
  "Next.js",
  "TypeScript",
  "Python",
  "Node.js",
  "PostgreSQL",
  "Three.js",
  "WebGL",
  "Stripe",
  "Playwright",
  "Supabase",
  "Tailwind CSS",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Abdelhamed Nada — Full-Stack Developer",
        description:
          "Portfolio of Abdelhamed Nada: full-stack developer building e-commerce SaaS, React interfaces, WebGL experiences and Python automation.",
      },
      {
        property: "og:title",
        content: "Abdelhamed Nada — Full-Stack Developer",
      },
      {
        property: "og:description",
        content:
          "Full-stack developer building e-commerce SaaS, React interfaces, WebGL experiences and Python automation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="relative min-h-screen">
      <SceneMount />

      <Navbar />

      <main className="relative z-10">
        <Hero />
        <StackMarquee />
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

function Hero() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-28 pb-16 text-center">
      <p
        className="rise-in font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground"
        style={{ animationDelay: "0.05s" }}
      >
        {PROFILE.name} · {PROFILE.role}
      </p>

      <h1
        className="rise-in mt-6 max-w-4xl text-[clamp(2.6rem,7.5vw,5.5rem)] leading-[1.04] font-semibold tracking-[-0.03em] text-foreground"
        style={{ animationDelay: "0.15s" }}
      >
        Full-stack code
        <br />
        for every{" "}
        <span className="inline-flex align-baseline overflow-hidden">
          <span
            key={ROTATING_WORDS[wordIndex]}
            className="word-in font-serif italic tracking-normal text-primary"
          >
            {ROTATING_WORDS[wordIndex]}
          </span>
        </span>
      </h1>

      <p
        className="rise-in mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        style={{ animationDelay: "0.25s" }}
      >
        I build e-commerce SaaS, polished React interfaces and Python automation —
        from REST APIs and payment flows to LLM-powered agents.
      </p>

      <div
        className="rise-in mt-9 flex flex-wrap items-center justify-center gap-3"
        style={{ animationDelay: "0.35s" }}
      >
        <Link
          to="/contact"
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.04] active:scale-95"
        >
          Get in touch
        </Link>
        <a
          href={cvAsset.url}
          download="Abdelhamed_Nada_CV.pdf"
          className="glass flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-foreground transition-transform hover:scale-[1.04] active:scale-95"
        >
          <DownloadIcon size={15} />
          Download CV
        </a>
        <a
          href={SOCIALS.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          className="glass flex size-11 items-center justify-center rounded-full text-foreground transition-transform hover:scale-[1.06] active:scale-95"
        >
          <GithubIcon size={17} />
        </a>
        <a
          href={SOCIALS.whatsapp}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
          className="glass flex size-11 items-center justify-center rounded-full text-foreground transition-transform hover:scale-[1.06] active:scale-95"
        >
          <WhatsAppIcon size={17} />
        </a>
      </div>

      <p
        className="rise-in mt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/80"
        style={{ animationDelay: "0.45s" }}
      >
        {PROFILE.location}
      </p>
    </section>
  );
}

function StackMarquee() {
  const items = [...STACK, ...STACK];
  return (
    <section className="relative z-10 pb-24">
      <Reveal>
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Built with
        </p>
        <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="animate-marquee flex w-max gap-3 hover:[animation-play-state:paused]">
            {items.map((tech, i) => (
              <span
                key={i}
                className="glass-card rounded-full px-5 py-2.5 font-mono text-xs tracking-wide text-foreground/80"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
