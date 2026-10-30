// The client websites on /web-design. Captures in /public/web: the full desktop page (it
// scrolls inside the browser frame) and the first screen on a phone.
export type Site = {
  name: string;
  url: string;
  sector: string;
  summary: string;
  pages: string[];
  sections: string[];
  desktop: string;
  phone: string;
};

export const SITES: Site[] = [
  {
    name: "Diag Immo Invest",
    url: "https://diagimmoinvest.com/",
    sector: "Real-estate investment advisory · Morocco",
    summary:
      "A site for an advisory firm that guides investors through buying property in Morocco. It sets the tone with a full-bleed hero and the firm's key figures, walks through its services, from property audit to due diligence, backs them with client testimonials, answers the usual buyer questions, and closes on a contact form.",
    pages: ["Accueil", "Services", "À propos"],
    sections: ["Hero & key figures", "Services", "Six areas of expertise", "Vision & mission", "Testimonials", "FAQ", "Contact form"],
    desktop: "/web/diag-immo-invest-desktop.jpg",
    phone: "/web/diag-immo-invest-phone.jpg",
  },
];
