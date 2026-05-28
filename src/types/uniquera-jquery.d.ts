export {};

declare global {
  interface JQueryWithPlugin {
    fn?: {
      onlineForm?: () => void;
      onlineFormShort?: () => void;
    };
  }

  interface Window {
    jQuery?: JQueryWithPlugin & ((selector: string) => {
      onlineForm?: () => void;
      onlineFormShort?: () => void;
    });
    uniqueraFormShort?: {
      ajaxUrl: string;
      submitError: string;
      homeUrl?: string;
      thankYouUrl?: string;
      trackingDefaults: {
        utm_source: string;
        utm_campaign: string;
        utm_audience: string;
      };
    };
    uniqueraForm?: Window['uniqueraFormShort'];
    language?: string;
    tedaviler?: unknown[];
    __uniqueraScriptPromises?: Record<string, Promise<void>>;
  }
}
