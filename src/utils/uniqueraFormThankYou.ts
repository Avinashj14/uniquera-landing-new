/** Keep embedded thank-you panels hidden until the form script opens them after submit. */
export function hideEmbeddedThankYouScreens(root: HTMLElement | null): void {
  if (!root) {
    return;
  }
  root.querySelectorAll<HTMLElement>('.uniquera-thankyou-screen').forEach((el) => {
    el.setAttribute('hidden', '');
    el.setAttribute('aria-hidden', 'true');
    el.classList.remove('uniquera-thankyou-screen--open');
  });
}
