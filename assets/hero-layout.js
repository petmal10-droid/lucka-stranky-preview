(() => {
  const header = document.querySelector('.site-header');
  const shell = document.querySelector('.page-shell');
  const hero = document.querySelector('.hero');
  const copy = document.querySelector('.hero-copy');
  if (!header || !shell || !hero || !copy) return;
  const syncHeader = () => shell.style.setProperty('--preview-header-height', `${header.offsetHeight}px`);
  const syncWidth = () => shell.style.setProperty('--preview-viewport-width', `${document.documentElement.clientWidth}px`);
  syncHeader();
  syncWidth();
  new ResizeObserver(syncHeader).observe(header);
  window.addEventListener('resize', syncWidth, { passive: true });
  const style = getComputedStyle(copy);
  hero.style.setProperty('--hero-content-height', `${copy.getBoundingClientRect().height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)}px`);
  new ResizeObserver(([entry]) => {
    hero.style.setProperty('--hero-content-height', `${entry.contentRect.height}px`);
  }).observe(copy);
})();
