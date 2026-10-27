import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SceneMount } from "@/components/three/SceneMount";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Reveal } from "@/components/site/Reveal";
import {
  ArrowUpRightIcon,
  GithubIcon,
  GlobeIcon,
  LinkedinIcon,
  MailIcon,
  WhatsAppIcon,
} from "@/components/site/icons";
import { CONTACT_FORM_ENDPOINT, PROFILE, SOCIALS } from "@/lib/socials";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      {
        title: "Contact — Abdelhamed Nada",
        description:
          "Get in touch with Abdelhamed Nada: email, WhatsApp, GitHub or the contact form. Open to remote work.",
      },
      { property: "og:title", content: "Contact — Abdelhamed Nada" },
      {
        property: "og:description",
        content:
          "Get in touch with Abdelhamed Nada: email, WhatsApp, GitHub or the contact form. Open to remote work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="relative min-h-screen">
      <SceneMount />

      <Navbar />

      <main className="relative z-10 px-6 pt-36 pb-16">
        <div className="mx-auto w-full max-w-4xl">
          <Reveal>
            <p className="text-center font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Contact
            </p>
            <h1 className="mt-5 text-center text-[clamp(2.2rem,6vw,4rem)] leading-[1.06] font-semibold tracking-[-0.03em]">
              Let&apos;s build something{" "}
              <span className="font-serif italic tracking-normal text-primary">together</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-center text-base leading-relaxed text-muted-foreground">
              {PROFILE.location}. Pick a channel below — or leave a message and I&apos;ll
              get back to you.
            </p>
          </Reveal>

          <ChannelGrid />

          <Reveal delay={120} className="mt-6">
            <ContactForm />
          </Reveal>
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

interface Channel {
  label: string;
  value: string;
  href: string | null;
  Icon: typeof MailIcon;
  accentClass?: string;
}

function ChannelGrid() {
  const channels: Channel[] = [
    {
      label: "Email",
      value: PROFILE.email,
      href: `mailto:${PROFILE.email}`,
      Icon: MailIcon,
    },
    {
      label: "WhatsApp",
      value: PROFILE.phoneDisplay,
      href: SOCIALS.whatsapp,
      Icon: WhatsAppIcon,
    },
    {
      label: "GitHub",
      value: "github.com/abbn7",
      href: SOCIALS.github,
      Icon: GithubIcon,
    },
    SOCIALS.linkedin
      ? {
          label: "LinkedIn",
          value: "LinkedIn profile",
          href: SOCIALS.linkedin,
          Icon: LinkedinIcon,
        }
      : {
          label: "LinkedIn",
          value: "Coming soon",
          href: null,
          Icon: LinkedinIcon,
        },
    {
      label: "Website",
      value: "abdelhamed-nada.vercel.app",
      href: SOCIALS.website,
      Icon: GlobeIcon,
    },
  ];

  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {channels.map((c, i) => {
        const inner = (
          <>
            <span className="glass flex size-11 items-center justify-center rounded-2xl text-foreground">
              <c.Icon size={19} />
            </span>
            <span className="mt-4 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {c.label}
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-sm font-medium tracking-tight text-foreground">
              {c.value}
              {c.href ? (
                <ArrowUpRightIcon size={13} className="text-muted-foreground" />
              ) : null}
            </span>
          </>
        );
        const base =
          "glass-card block rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]";
        return (
          <Reveal key={c.label} delay={i * 70}>
            {c.href ? (
              <a
                href={c.href}
                target={c.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer"
                className={base}
              >
                {inner}
              </a>
            ) : (
              <div className={`${base} opacity-70`} aria-disabled>
                {inner}
              </div>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

type FormStatus = "idle" | "sending" | "sent" | "error";

function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    if (CONTACT_FORM_ENDPOINT) {
      setStatus("sending");
      try {
        const res = await fetch(CONTACT_FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        setStatus("sent");
        form.reset();
      } catch {
        setStatus("error");
      }
      return;
    }

    // No external endpoint yet — fall back to the visitor's email client.
    const name = String(data["name"] ?? "");
    const email = String(data["email"] ?? "");
    const message = String(data["message"] ?? "");
    const subject = encodeURIComponent(`Portfolio contact — ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;
    setStatus("sent");
  }

  const inputClass =
    "w-full rounded-2xl border border-input bg-card/70 px-4 py-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/60";

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-[28px] p-7 sm:p-9">
      <h2 className="text-xl font-semibold tracking-tight">Send a message</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Usually replies within a day.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Name
          </span>
          <input name="name" required placeholder="Your name" className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className={inputClass}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell me about your project…"
          className={`${inputClass} resize-none`}
        />
      </label>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.04] active:scale-95 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        {status === "sent" ? (
          <p className="text-sm font-medium text-foreground">Message on its way — thank you!</p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm font-medium text-destructive">
            Something went wrong. Please try again or email me directly.
          </p>
        ) : null}
      </div>

      <p className="mt-6 border-t border-border/60 pt-4 font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground/80">
        {CONTACT_FORM_ENDPOINT
          ? "Delivered through the connected form service."
          : "Form service not connected yet — submissions open your email client. Add a Formspree / Web3Forms endpoint to deliver messages automatically."}
      </p>
    </form>
  );
}
