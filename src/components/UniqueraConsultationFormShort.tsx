import {useEffect, useMemo, useRef} from 'react';
import {absoluteLandingUrl, thankYouPageUrl} from '../routeUtils';
import {hideEmbeddedThankYouScreens} from '../utils/uniqueraFormThankYou';
import formHtmlRaw from '../../uniquera-consultation-form-short/templates/form-fragment.html?raw';

function loadScript(src: string): Promise<void> {
  window.__uniqueraScriptPromises = window.__uniqueraScriptPromises || {};
  if (window.__uniqueraScriptPromises[src]) {
    return window.__uniqueraScriptPromises[src];
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-uniquera-src="${src}"]`);
    if (existing?.dataset.uniqueraLoaded === 'true') {
      resolve();
      return;
    }
    if (existing) {
      existing.addEventListener('load', () => resolve(), {once: true});
      existing.addEventListener('error', () => reject(new Error(`Failed loading ${src}`)), {once: true});
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.uniqueraSrc = src;
    script.onload = () => {
      script.dataset.uniqueraLoaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed loading ${src}`));
    document.body.appendChild(script);
  });

  window.__uniqueraScriptPromises[src] = promise;
  return promise;
}

async function waitFor(check: () => boolean, retries = 20, delayMs = 150): Promise<boolean> {
  for (let i = 0; i < retries; i += 1) {
    if (check()) {
      return true;
    }
    await new Promise((resolve) => window.setTimeout(resolve, delayMs));
  }
  return false;
}

export default function UniqueraConsultationFormShort() {
  const rootRef = useRef<HTMLDivElement>(null);
  const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  const sharedAssetBase = `${basePath}/uniquera-consultation-form/assets`;
  const shortAssetBase = `${basePath}/uniquera-consultation-form-short/assets`;
  const submitUrl = `${basePath}/api/uniquera-form-submit.php`;
  const scriptSources = useMemo(
    () => [
      `${sharedAssetBase}/js/jquery-3.6.0.min.js`,
      `${sharedAssetBase}/js/nouislider.min.js`,
      `${sharedAssetBase}/js/intlTelInput.min.js`,
      `${sharedAssetBase}/js/utils.js`,
      `${shortAssetBase}/js/uniquera-main.js`,
    ],
    [sharedAssetBase, shortAssetBase],
  );

  const formHtml = useMemo(() => {
    return formHtmlRaw
      .replaceAll('../assets/form/images/', `${sharedAssetBase}/images/`)
      .replaceAll('https://uniqueraclinic.com/', `${basePath}/`);
  }, [sharedAssetBase, basePath]);

  useEffect(() => {
    hideEmbeddedThankYouScreens(rootRef.current);
  }, [formHtml]);

  useEffect(() => {
    document.body.classList.add('uniquera-consultation-form-active');
    return () => {
      document.body.classList.remove('uniquera-consultation-form-active');
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      window.language = 'en';
      window.tedaviler = [];
      window.uniqueraFormShort = {
        ajaxUrl: submitUrl,
        submitError: 'Could not submit your form. Please try again.',
        homeUrl: absoluteLandingUrl(basePath),
        thankYouUrl: thankYouPageUrl(basePath),
        trackingDefaults: {
          utm_source: window.location.hostname,
          utm_campaign: 'uniquera_consultation_form_short',
          utm_audience: '',
        },
      };
      window.uniqueraForm = window.uniqueraFormShort;

      for (const src of scriptSources) {
        if (cancelled) {
          return;
        }
        await loadScript(src);
      }

      if (cancelled || !rootRef.current) {
        return;
      }

      const ready = await waitFor(() => {
        const jq = window.jQuery;
        if (!jq || !jq.fn?.onlineFormShort || !rootRef.current) {
          return false;
        }
        const wrap = rootRef.current;
        return wrap.querySelector('.questions') != null && wrap.querySelector('#footer .steps') != null;
      });
      if (!ready) {
        throw new Error('Uniquera short form scripts loaded but onlineFormShort plugin was not ready');
      }
      const jq = window.jQuery;

      const selector = `#${rootRef.current.id} .questions`;
      const hasBootedUi = () => {
        if (!rootRef.current) return false;
        return rootRef.current.querySelectorAll('#footer .steps .step').length > 0;
      };

      jq(selector)?.onlineFormShort?.();
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      if (!hasBootedUi()) {
        throw new Error('Uniquera short form initialization incomplete: steps were not mounted');
      }
    };

    boot().catch((error) => {
      console.error('Uniquera short form boot failed', error);
    });

    return () => {
      cancelled = true;
    };
  }, [scriptSources, submitUrl]);

  return (
    <section id="consultation-form-short" aria-label="Short consultation form" className="bg-primary-bg">
      <div className="w-full bg-primary-bg overflow-x-hidden overflow-y-visible shadow-2xl border-white/10 py-6">
        <div
          id="uniquera-react-form-short-root"
          ref={rootRef}
          className="uniquera-form-wrap uniquera-form-wrap--short"
          data-uniquera-form="1"
          data-thank-you-url={thankYouPageUrl(basePath)}
          dangerouslySetInnerHTML={{__html: formHtml}}
        />
      </div>
    </section>
  );
}
