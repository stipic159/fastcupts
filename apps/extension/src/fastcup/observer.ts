export function observeFastcupPage(onRelevantChange: () => void, delayMs = 200): MutationObserver {
  let timer: number | undefined;
  const observer = new MutationObserver(() => {
    if (timer !== undefined) clearTimeout(timer);
    timer = window.setTimeout(onRelevantChange, delayMs);
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}
