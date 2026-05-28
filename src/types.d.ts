/// <reference types="vite/client" />

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
    ajaxurl?: string;
    __uniqueraMetaPixelLoaded?: boolean;
    __uniqueraClarityLoaded?: boolean;
    __loadClarity?: () => void;
    __loadMetaPixel?: () => void;
    __trackMetaPageView?: () => void;
    __uniqueraClickTrackingBound?: boolean;
  }
}

declare module '*.html?raw' {
  const content: string;
  export default content;
}

export {};
