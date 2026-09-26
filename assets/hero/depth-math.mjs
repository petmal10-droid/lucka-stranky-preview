export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export const meshConfig = Object.freeze({ columns: 360, rows: 200, extent: 2.18 });

export const defaultVisibility = 65;

export function visibilityPercent(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return defaultVisibility;
  if (typeof value === 'string' && value.trim() === '') return defaultVisibility;
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(clamp(number, 0, 100)) : defaultVisibility;
}

export function coverScale(viewWidth, viewHeight, imageWidth, imageHeight) {
  const viewAspect = viewWidth / Math.max(1, viewHeight);
  const imageAspect = imageWidth / Math.max(1, imageHeight);
  return viewAspect > imageAspect
    ? [1, imageAspect / viewAspect]
    : [viewAspect / imageAspect, 1];
}

export function frameState({ scroll = 0, height = 800, strength = 0.85, mobile = false, reduced = false, focus = true }) {
  const progress = reduced ? 0 : clamp(scroll / Math.max(height * 0.78, 1));
  const eased = progress * progress * (3 - 2 * progress);
  const amount = clamp(strength) * (mobile ? 0.65 : 1);
  return {
    progress,
    x: eased * 0.022 * amount,
    y: -eased * 0.038 * amount,
    zoom: 1,
    focalDepth: 0.87 - (focus ? eased * 0.18 : 0),
    aperture: focus ? 4.5 : 0,
  };
}

export function mobilePhotoShift({ scroll = 0, height = 800, reduced = false }) {
  const progress = reduced ? 0 : clamp(scroll / Math.max(height, 1));
  return 18 * progress * progress * (3 - 2 * progress);
}

export function combineDepth(macro, detail, amount = 0.25) {
  return clamp(macro + clamp(detail - macro, -0.2, 0.2) * clamp(amount, 0, 0.4));
}
