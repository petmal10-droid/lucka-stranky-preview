import { clamp } from './depth-math.mjs';

function blur(input, width, height, radius, passes) {
  let source = input;
  const span = 2 * radius + 1;
  for (let pass = 0; pass < passes; pass++) {
    const horizontal = new Float32Array(source.length);
    const vertical = new Float32Array(source.length);
    for (let y = 0; y < height; y++) {
      let sum = 0;
      for (let dx = -radius; dx <= radius; dx++) sum += source[y * width + clamp(dx, 0, width - 1)];
      for (let x = 0; x < width; x++) {
        horizontal[y * width + x] = sum / span;
        sum += source[y * width + clamp(x + radius + 1, 0, width - 1)] - source[y * width + clamp(x - radius, 0, width - 1)];
      }
    }
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let dy = -radius; dy <= radius; dy++) sum += horizontal[clamp(dy, 0, height - 1) * width + x];
      for (let y = 0; y < height; y++) {
        vertical[y * width + x] = sum / span;
        sum += horizontal[clamp(y + radius + 1, 0, height - 1) * width + x] - horizontal[clamp(y - radius, 0, height - 1) * width + x];
      }
    }
    source = vertical;
  }
  return source;
}

export function prepareDepthField(macro, detail, width, height) {
  const residual = Float32Array.from(detail, (value, index) => value - macro[index]);
  return {
    width,
    height,
    macro: blur(macro, width, height, 28, 3),
    relief: blur(residual, width, height, 8, 2),
  };
}

export function sampleField(data, width, height, u, v) {
  const x = clamp(u * width - 0.5, 0, width - 1);
  const y = clamp((1 - v) * height - 0.5, 0, height - 1);
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, width - 1), y1 = Math.min(y0 + 1, height - 1);
  const upper = data[y0 * width + x0] * (1 - x + x0) + data[y0 * width + x1] * (x - x0);
  const lower = data[y1 * width + x0] * (1 - x + x0) + data[y1 * width + x1] * (x - x0);
  return upper * (1 - y + y0) + lower * (y - y0);
}
