import { clamp, coverScale, frameState, meshConfig, mobilePhotoShift } from './depth-math.mjs?v=20260926-parallax';
import { prepareDepthField, sampleField } from './depth-field.mjs';
import { heroSettings } from './settings.mjs';

const hero = document.querySelector('.hero');
const art = document.querySelector('.depth-art');
const canvas = document.querySelector('.depth-canvas');
const fallback = document.querySelector('.depth-fallback');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 600px)');
// Include touch phones in landscape, not only narrow portrait viewports.
const staticHero = matchMedia('(max-width: 900px), (hover: none) and (pointer: coarse)');
const visualQa = new URL(location.href).searchParams.has('qa');
let settings = heroSettings(art.dataset);
let invalidate = () => {};
let started = false;
let photoFrame = null;
let previousPhotoShift = null;

function syncPhotoParallax() {
  const shift = staticHero.matches ? mobilePhotoShift({
    scroll: -hero.getBoundingClientRect().top,
    height: hero.offsetHeight,
    reduced: reducedMotion.matches,
  }) : 0;
  const value = `${shift.toFixed(2)}px`;
  if (value === previousPhotoShift) return;
  art.style.setProperty('--hero-photo-shift', value);
  previousPhotoShift = value;
}

function requestPhotoParallax() {
  if (!staticHero.matches || reducedMotion.matches || document.hidden || photoFrame !== null) return;
  photoFrame = requestAnimationFrame(() => {
    photoFrame = null;
    syncPhotoParallax();
  });
}

function syncSettings() {
  settings = heroSettings(art.dataset);
  art.style.setProperty('--depth-art-opacity', String(settings.visibility / 100));
  syncPhotoParallax();
  invalidate();
}
window.addEventListener('hero-visual-change', syncSettings);
reducedMotion.addEventListener('change', syncSettings);
syncSettings();

const vertexShader = `
  uniform vec2 uCover;
  uniform vec2 uTravel;
  uniform float uRelief;
  attribute float aMacro;
  attribute float aCellRelief;
  varying vec2 vUv;
  varying float vDepth;

  void main() {
    vec2 center = vec2(0.5) + vec2(0.08, 0.0) * (vec2(1.0) - uCover);
    vUv = center + (uv - 0.5) * uCover;
    vDepth = clamp(aMacro + clamp(aCellRelief, -0.2, 0.2) * uRelief, 0.0, 1.0);
    // Project a single connected surface to avoid duplicated silhouettes.
    vec2 projected = position.xy - uTravel * 2.0 * (vDepth - 0.12);
    gl_Position = vec4(projected, -vDepth * 0.65, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uColor;
  uniform sampler2D uMacro;
  uniform sampler2D uDetail;
  uniform vec2 uTexel;
  uniform float uRelief;
  uniform float uFocus;
  uniform float uAperture;
  varying vec2 vUv;
  varying float vDepth;

  float depthAt(vec2 uv) {
    float macro = texture2D(uMacro, uv).r;
    float fine = texture2D(uDetail, uv).r;
    return clamp(macro + clamp(fine - macro, -0.2, 0.2) * uRelief, 0.0, 1.0);
  }

  void main() {
    vec2 uv = clamp(vUv, vec2(0.002), vec2(0.998));
    float depth = vDepth;
    float quietLeft = 1.0 - smoothstep(0.28, 0.62, uv.x);
    float blurRadius = max(0.0, abs(depth - uFocus) - 0.09) * uAperture;
    blurRadius += quietLeft * uAperture * 0.45;
    vec3 color = texture2D(uColor, uv).rgb * 3.0;
    float total = 3.0;
    for (int i = 0; i < 12; i++) {
      float angle = float(i) * 2.39996323;
      float radius = sqrt((float(i) + 0.5) / 12.0);
      vec2 offset = vec2(cos(angle), sin(angle)) * radius * blurRadius * uTexel;
      vec2 sampleUv = clamp(uv + offset, vec2(0.002), vec2(0.998));
      float weight = 1.0 - smoothstep(0.05, 0.23, abs(depthAt(sampleUv) - depth));
      color += texture2D(uColor, sampleUv).rgb * weight;
      total += weight;
    }
    gl_FragColor = vec4(color / total, 1.0);
    #include <colorspace_fragment>
  }
`;

function showFallback(state = 'static-fallback') {
  art.classList.remove('is-ready');
  canvas.dataset.state = state;
}

function syncArtHeight() {
  const ratio = fallback.naturalWidth ? fallback.naturalHeight / fallback.naturalWidth : 0.75;
  const artHeight = Math.max(hero.offsetHeight + (mobile.matches ? 150 : 180), document.documentElement.clientWidth * (ratio + 0.01));
  art.style.setProperty('--depth-art-height', `${artHeight}px`);
  syncPhotoParallax();
}

function syncMode() {
  syncArtHeight();
  if (staticHero.matches) showFallback('static-mobile');
  else if (!started) {
    started = true;
    initialize();
  } else invalidate();
}

async function initialize() {
  let renderer;
  const textures = [];
  try {
    const THREE = await import('./vendor/three.module.js');
    if (staticHero.matches) {
      started = false;
      showFallback('static-mobile');
      return;
    }
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power', preserveDrawingBuffer: visualQa });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    const loader = new THREE.TextureLoader();
    const load = async path => {
      const texture = await loader.loadAsync(new URL(path, import.meta.url).href);
      textures.push(texture);
      return texture;
    };
    const color = await load('./detail.webp');
    const fine = await load('./detail-depth.webp');
    const { width, height } = fine.image;
    if (color.image.width !== width || color.image.height !== height) throw new Error('Depth dimensions differ');

    const buffer = document.createElement('canvas');
    buffer.width = width;
    buffer.height = height;
    const context = buffer.getContext('2d', { willReadFrequently: true });
    context.drawImage(fine.image, 0, 0);
    const pixels = context.getImageData(0, 0, width, height).data;
    const gray = Float32Array.from({ length: width * height }, (_, i) => pixels[i * 4] / 255);
    const smooth = prepareDepthField(gray, gray, width, height).macro;
    const field = prepareDepthField(smooth, gray, width, height);
    const bytes = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const value = Math.round(clamp(smooth[(height - y - 1) * width + x]) * 255);
        const target = (y * width + x) * 4;
        bytes[target] = bytes[target + 1] = bytes[target + 2] = value;
        bytes[target + 3] = 255;
      }
    }
    const macro = new THREE.DataTexture(bytes, width, height, THREE.RGBAFormat);
    textures.push(macro);
    color.colorSpace = THREE.SRGBColorSpace;
    macro.colorSpace = fine.colorSpace = THREE.NoColorSpace;
    textures.forEach(texture => {
      texture.minFilter = texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
    });

    const uniforms = {
      uColor: { value: color }, uMacro: { value: macro }, uDetail: { value: fine },
      uCover: { value: new THREE.Vector2(1, 1) },
      uTexel: { value: new THREE.Vector2(1 / width, 1 / height) },
      uTravel: { value: new THREE.Vector2() },
      uRelief: { value: settings.detail / 250 }, uFocus: { value: 0.87 }, uAperture: { value: 4.5 },
    };
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
    const geometry = new THREE.PlaneGeometry(meshConfig.extent, meshConfig.extent, meshConfig.columns, meshConfig.rows);
    const macroAttribute = new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count), 1);
    const reliefAttribute = new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count), 1);
    geometry.setAttribute('aMacro', macroAttribute);
    geometry.setAttribute('aCellRelief', reliefAttribute);
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, depthTest: true, depthWrite: true, side: THREE.DoubleSide });
    scene.add(new THREE.Mesh(geometry, material));
    let frame = null, previousTime = 0, currentScroll = 0, renderCount = 0;
    let visible = true, disposed = false, failed = false;

    function requestRender() {
      if (staticHero.matches) {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        showFallback('static-mobile');
        return;
      }
      if (frame === null && visible && !document.hidden && !disposed && !failed) frame = requestAnimationFrame(render);
    }
    invalidate = requestRender;
    function render(time) {
      frame = null;
      if (staticHero.matches || !visible || document.hidden || disposed || failed) return;
      const target = reducedMotion.matches ? 0 : clamp(-hero.getBoundingClientRect().top, 0, hero.offsetHeight);
      const dt = Math.min(0.05, (time - previousTime) / 1000 || 0.016);
      previousTime = time;
      currentScroll = reducedMotion.matches ? 0 : currentScroll + (target - currentScroll) * (1 - Math.exp(-dt * 11));
      if (Math.abs(target - currentScroll) < 0.08) currentScroll = target;
      const state = frameState({ scroll: currentScroll, height: hero.offsetHeight, strength: settings.strength / 100, mobile: mobile.matches, reduced: reducedMotion.matches, focus: settings.focus });
      uniforms.uTravel.value.set(state.x, state.y);
      uniforms.uFocus.value = state.focalDepth;
      uniforms.uAperture.value = state.aperture;
      uniforms.uRelief.value = settings.detail / 250;
      renderer.render(scene, camera);
      art.classList.add('is-ready');
      canvas.dataset.state = 'ready';
      canvas.dataset.artwork = 'detail';
      canvas.dataset.progress = state.progress.toFixed(4);
      canvas.dataset.renderCount = String(++renderCount);
      if (visualQa) {
        const gl = renderer.getContext();
        const samples = [[0.2, 0.5], [0.7, 0.5], [0.85, 0.75], [0.6, 0.3], [0.85, 0.3]].map(([x, y]) => {
          const pixel = new Uint8Array(4);
          gl.readPixels(Math.floor(canvas.width * x), Math.floor(canvas.height * y), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
          return Array.from(pixel);
        });
        canvas.dataset.pixelSamples = JSON.stringify(samples);
      }
      if (currentScroll !== target) frame = requestAnimationFrame(render);
    }
    function resize() {
      syncArtHeight();
      if (staticHero.matches) { requestRender(); return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile.matches ? 1.25 : 1.6));
      renderer.setSize(Math.max(1, art.clientWidth), Math.max(1, art.clientHeight), false);
      const scale = coverScale(art.clientWidth, art.clientHeight, width, height);
      uniforms.uCover.value.set(...scale);
      const uvs = geometry.attributes.uv;
      for (let i = 0; i < uvs.count; i++) {
        const u = 0.5 + 0.08 * (1 - scale[0]) + (uvs.getX(i) - 0.5) * scale[0];
        const v = 0.5 + (uvs.getY(i) - 0.5) * scale[1];
        macroAttribute.setX(i, sampleField(field.macro, field.width, field.height, u, v));
        reliefAttribute.setX(i, sampleField(field.relief, field.width, field.height, u, v));
      }
      macroAttribute.needsUpdate = reliefAttribute.needsUpdate = true;
      requestRender();
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(art);
    resizeObserver.observe(hero);
    const intersectionObserver = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) requestRender();
      else if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
    });
    intersectionObserver.observe(hero);
    window.addEventListener('scroll', requestRender, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', requestRender);
    mobile.addEventListener('change', resize);
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      failed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
      showFallback();
    });
    window.addEventListener('pageshow', requestRender);
    window.addEventListener('pagehide', event => {
      if (event.persisted) return;
      disposed = true;
      if (frame !== null) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      textures.forEach(texture => texture.dispose());
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    });
    resize();
  } catch (error) {
    textures.forEach(texture => texture.dispose());
    renderer?.dispose();
    showFallback();
    console.warn('Hero uses its static image fallback.', error);
  }
}
new ResizeObserver(syncArtHeight).observe(hero);
fallback.addEventListener('load', syncArtHeight);
window.addEventListener('resize', syncArtHeight, { passive: true });
window.addEventListener('scroll', requestPhotoParallax, { passive: true });
window.addEventListener('pageshow', requestPhotoParallax);
staticHero.addEventListener('change', syncMode);
syncMode();
