export const PROFILE = {
  name: "Abdelhamed Nada",
  firstName: "Abdelhamed",
  role: "Full-Stack Developer",
  location: "Egypt · Open to remote work",
  email: "dior53634@gmail.com",
  phoneDisplay: "+20 109 614 4345",
  phoneRaw: "+201096143445",
  website: "https://abdelhamed-nada.vercel.app",
};

export const SOCIALS = {
  github: "https://github.com/abbn7",
  whatsapp: `https://wa.me/${PROFILE.phoneRaw.replace("+", "")}`,
  /** Paste the LinkedIn profile URL here when ready. Empty = icon hidden. */
  linkedin: "",
  website: PROFILE.website,
};

/**
 * Paste an external form endpoint here (Formspree / Web3Forms / Getform …).
 * Example: "https://formspree.io/f/xxxxxxx"
 * While it is empty, the contact form falls back to opening the visitor's
 * email client with the message pre-filled.
 */
export const CONTACT_FORM_ENDPOINT = "";
