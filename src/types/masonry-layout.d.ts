/**
 * Minimal ambient types for the official Masonry library (`masonry-layout`),
 * which ships no bundled types. The package's UMD entry references `window` at
 * import time, so it is loaded via a dynamic import inside a client effect.
 */
declare module "masonry-layout" {
  interface MasonryOptions {
    itemSelector?: string;
    columnWidth?: string | Element | number;
    percentPosition?: boolean;
    gutter?: string | Element | number;
    transitionDuration?: number | string;
    resize?: boolean;
    initLayout?: boolean;
    horizontalOrder?: boolean;
    fitWidth?: boolean;
  }

  class Masonry {
    constructor(element: Element | string, options?: MasonryOptions);
    layout(): void;
    reloadItems(): void;
    destroy(): void;
  }

  export = Masonry;
}
