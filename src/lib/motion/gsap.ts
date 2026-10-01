import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Shared GSAP entry point. Registers ScrollTrigger once on the client and
 * re-exports both, so every motion primitive imports from one place. ScrollTrigger
 * is only registered in the browser (it touches `window`), keeping server
 * rendering safe.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
