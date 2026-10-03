import type { CategorySlug } from "@/lib/catalogue/categories";

/**
 * The canonical English dictionary. Every other locale must match this shape.
 * Only client-facing copy lives here; Pattern Codes, sizes and technical values
 * are never translated.
 */
export type Dictionary = {
  language: { label: string; choose: string };
  nav: {
    home: string;
    aboutUs: string;
    catalogue: string;
    products: string;
    productRanges: string;
    contactUs: string;
    qualityFirst: string;
    gallery: string;
    blogs: string;
    warranty: string;
  };
  common: {
    requestQuotation: string;
    exploreCatalogue: string;
    openCatalogue: string;
    searchCatalogue: string;
    searchPlaceholder: string;
    viewAll: string;
    readMore: string;
    backToHome: string;
    openInGoogleMaps: string;
    email: string;
    phone: string;
    whatsapp: string;
    all: string;
    reset: string;
    apply: string;
  };
  header: {
    primaryNav: string;
    mobileNav: string;
    openMenu: string;
    closeMenu: string;
    searchAria: string;
  };
  footer: {
    ctaTitle: string;
    ctaSubtitle: string;
    products: string;
    company: string;
    contact: string;
    rights: string;
    socialAria: string;
  };
  breadcrumbs: { label: string; catalogue: string };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    tourHeading: string;
    tourDescription: string;
    rangesHeading: string;
    rangesDescription: string;
    catalogueHeading: string;
    catalogueDescription: string;
    qualityHeading: string;
    qualityDescription: string;
    testimonialsHeading: string;
    instagramHeading: string;
    instagramDescription: string;
    inquiryHeading: string;
    inquiryDescription: string;
    mapHeading: string;
    mapDescription: string;
  };
  catalogue: {
    title: string;
    description: string;
    browseTitle: string;
    download: string;
  };
  contact: {
    title: string;
    description: string;
    queryForm: string;
    feedbackForm: string;
    name: string;
    country: string;
    phone: string;
    category: string;
    message: string;
    send: string;
    sending: string;
    preferWhatsapp: string;
    chatWithUs: string;
    chatCta: string;
    openingHours: string;
    corporateOffice: string;
    factory: string;
  };
  qualityFirst: { title: string; description: string };
  gallery: { title: string; description: string };
  blog: {
    title: string;
    description: string;
    readPost: string;
    noPosts: string;
  };
  warranty: { title: string; description: string };
  notFound: { title: string; description: string };
  spec: {
    size: string;
    plyRating: string;
    ttTl: string;
    application: string;
    rimWidth: string;
    tread: string;
    tyreType: string;
  };
  categories: Record<CategorySlug, string>;
  meta: { siteTagline: string; homeTitle: string; homeDescription: string };
};

export const en: Dictionary = {
  language: {
    label: "Language",
    choose: "Choose a language",
  },
  nav: {
    home: "Home",
    aboutUs: "About Us",
    catalogue: "Catalogue",
    products: "Products",
    productRanges: "Product Ranges",
    contactUs: "Contact Us",
    qualityFirst: "Quality First",
    gallery: "Gallery",
    blogs: "Blogs",
    warranty: "Warranty",
  },
  common: {
    requestQuotation: "Request a Quotation",
    exploreCatalogue: "Explore the Catalogue",
    openCatalogue: "Open the Catalogue",
    searchCatalogue: "Search the catalogue",
    searchPlaceholder: "Search by size, pattern code or category",
    viewAll: "View all",
    readMore: "Read more",
    backToHome: "Back to home",
    openInGoogleMaps: "Open in Google Maps",
    email: "Email",
    phone: "Phone",
    whatsapp: "WhatsApp",
    all: "All",
    reset: "Reset",
    apply: "Apply",
  },
  header: {
    primaryNav: "Primary",
    mobileNav: "Mobile",
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
    searchAria: "Search the catalogue",
  },
  footer: {
    ctaTitle: "Sourcing Tyres?",
    ctaSubtitle: "Start the Conversation.",
    products: "Products",
    company: "Company",
    contact: "Contact",
    rights: "All rights reserved.",
    socialAria: "Safeway Tyre on",
  },
  breadcrumbs: {
    label: "Breadcrumb",
    catalogue: "Catalogue",
  },
  home: {
    heroTitle: "Tires That Keep the World Moving",
    heroSubtitle:
      "Safeway Tyre manufactures and exports durable tyres for international markets. Search the catalogue by size, pattern code, name or category.",
    tourHeading: "Take a Tour of Our Industry",
    tourDescription:
      "Step inside our factory online — a short sneak peek at how Safeway Tyre makes its tyres.",
    rangesHeading: "Product Ranges",
    rangesDescription:
      "Six ranges covering transport, agriculture and industry.",
    catalogueHeading: "Explore the Official Catalogue",
    catalogueDescription:
      "Browse the full Safeway Tyre catalogue of patterns and sizes.",
    qualityHeading: "Quality & Certifications",
    qualityDescription:
      "Safeway Tyre products are backed by recognised quality and compliance marks.",
    testimonialsHeading: "Trusted by Importers Worldwide",
    instagramHeading: "Follow Us on Instagram",
    instagramDescription: "A look at the latest from Safeway Tyre.",
    inquiryHeading: "Inquiry Form",
    inquiryDescription:
      "Tell us the sizes and patterns you need and our team will respond with a quotation.",
    mapHeading: "Find Us on the Map",
    mapDescription: "Safeway Tyre's corporate office in Ludhiana, India.",
  },
  catalogue: {
    title: "Catalogue",
    description:
      "The full Safeway Tyre range — patterns and sizes across every category.",
    browseTitle: "Browse the Catalogue",
    download: "Download the Catalogue",
  },
  contact: {
    title: "Contact Us",
    description:
      "Send a product enquiry or feedback, or chat with us directly on WhatsApp.",
    queryForm: "Product Enquiry",
    feedbackForm: "Feedback",
    name: "Name",
    country: "Country",
    phone: "Phone",
    category: "Category",
    message: "Message",
    send: "Send",
    sending: "Sending…",
    preferWhatsapp: "Prefer WhatsApp?",
    chatWithUs: "Chat With Safeway Tyre Directly",
    chatCta: "Chat on WhatsApp",
    openingHours: "Opening hours",
    corporateOffice: "Corporate Office",
    factory: "Factory",
  },
  qualityFirst: {
    title: "Quality First",
    description:
      "Safeway Tyre's testing and quality-control process, from the testing floor to every pattern we make.",
  },
  gallery: {
    title: "Gallery",
    description:
      "A gallery of Safeway Tyre imagery — the ranges we make and the places they run.",
  },
  blog: {
    title: "Blogs",
    description: "News, guides and stories from Safeway Tyre.",
    readPost: "Read post",
    noPosts: "No posts published yet.",
  },
  warranty: {
    title: "Warranty",
    description: "Safeway Tyre's tyre warranty terms.",
  },
  notFound: {
    title: "Page not found",
    description: "The page you are looking for does not exist.",
  },
  spec: {
    size: "Size",
    plyRating: "Ply rating",
    ttTl: "TT/TL",
    application: "Application",
    rimWidth: "Rim width (in)",
    tread: "Tread",
    tyreType: "Tyre type",
  },
  categories: {
    motorcycle: "Motorcycle Tyres",
    "three-wheeler": "Three Wheeler Tyres",
    "truck-bus": "Truck & Bus Tyres",
    agriculture: "Agriculture Tyres",
    otr: "Off-The-Road (OTR) Tyres",
    forklift: "Forklift Tyres",
    tubes: "Tubes",
  },
  meta: {
    siteTagline: "Exporting Durable Tyres Worldwide",
    homeTitle: "Safeway Tyre | Exporting Durable Tyres Worldwide",
    homeDescription:
      "Search Safeway Tyre's catalogue by size, pattern code or category, explore our product ranges, and send an enquiry.",
  },
};
