import { SOCIALS } from "@/lib/socials";
import { WhatsAppIcon } from "./icons";

/** Small floating WhatsApp badge, bottom-right of the screen. */
export function WhatsAppFloat() {
  return (
    <a
      href={SOCIALS.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex size-13 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg shadow-whatsapp/30 transition-transform hover:scale-110 active:scale-95"
    >
      <span
        aria-hidden
        className="pulse-ring absolute inset-0 rounded-full bg-whatsapp"
      />
      <WhatsAppIcon size={26} className="relative" />
    </a>
  );
}
