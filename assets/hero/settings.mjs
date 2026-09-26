export const heroDefaults = Object.freeze({ visibility: 71, strength: 100, detail: 100, focus: true });

export function heroSettings(values = {}) {
  const percent = key => {
    const input = values[key];
    if (input === '' || input == null || typeof input === 'boolean') return heroDefaults[key];
    const value = Number(input);
    return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : heroDefaults[key];
  };
  return {
    visibility: percent('visibility'),
    strength: percent('strength'),
    detail: percent('detail'),
    focus: values.focus === false || values.focus === 'false' ? false : true,
  };
}
