import {
  CanvasTexture, CapsuleGeometry, Color, ConeGeometry, DirectionalLight, MeshPhysicalMaterial, OctahedronGeometry,
  PMREMGenerator, SphereGeometry, SRGBColorSpace, TorusGeometry, WebGLRenderer,
  type BufferGeometry, type Material, type Object3D, type Scene,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/**
 * Kit de vidro compartilhado pelas cenas 3D (Home e Manifesto): renderizador, estúdio de luz,
 * materiais e o vocabulário de formas. Um só material para o site inteiro falar a mesma língua.
 */

export const LIME = 0x8af334;
export const INK = 0x18181b;

/** Vocabulário de formas: cada uma representa um tipo de trabalho. */
export const SHAPE = { DATA: 0, TASK: 1, DECISION: 2, EXECUTION: 3, ROUTINE: 4, PROCESS: 5 } as const;

export type Disposable = { dispose: () => void };

export function tracker() {
  const list: Disposable[] = [];
  const track = <T extends Disposable>(item: T) => { list.push(item); return item; };
  return { track, disposeAll: () => list.forEach((item) => item.dispose()) };
}

export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/* ─── Tema das cenas ───────────────────────────────────────────
   As cenas foram desenhadas sobre papel branco: linhas e tintas "somem" indo para o branco.
   No modo escuro, os mesmos valores são traduzidos para tinta clara sumindo no grafite do fundo. */
const DARK_BG = 0x0b / 255; // #0b0b0d, o fundo da página no modo escuro
const DARK_INK = 0.86;      // traço mais forte possível no escuro
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toSrgb = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

export const glassTheme = { dark: false };

/** Lê o tema atual do documento; devolve true no modo escuro. */
export function readGlassTheme() {
  glassTheme.dark = document.documentElement.dataset.theme === 'dark';
  return glassTheme.dark;
}

/**
 * Cinza do desenho original (0 = tinta, 1 = papel) no tema atual.
 * `linear` quando o valor vai cru para a GPU (cores de vértice, setRGB sem espaço de cor).
 */
export function gray(value: number, linear = false) {
  if (!glassTheme.dark) return value;
  const s = linear ? toSrgb(clamp01(value)) : clamp01(value);
  const d = DARK_INK + (DARK_BG - DARK_INK) * s;
  return linear ? toLinear(d) : d;
}

/** Puxa um canal de cor em direção ao fundo da página (branco no claro, grafite no escuro). */
export function towardPaper(channel: number, amount: number, linear = false) {
  const paper = glassTheme.dark ? (linear ? toLinear(DARK_BG) : DARK_BG) : 1;
  return channel + (paper - channel) * clamp01(amount);
}

/** Cor hexadecimal do desenho claro traduzida para o tema atual (tons de cinza invertem; o fundo acompanha). */
export function themedHex(hex: number, target = new Color(), darkHex?: number) {
  if (glassTheme.dark && typeof darkHex === 'number') return target.setHex(darkHex);
  const [r, g, b] = hexToRgb(hex);
  return target.setRGB(gray(r), gray(g), gray(b), SRGBColorSpace);
}

/**
 * Marca o material para seguir o tema: a cor clara original fica guardada e é traduzida a cada troca.
 * `darkHex` fixa a cor do escuro quando a tradução automática não serve (tons com matiz, como o lima).
 */
export function themed<T extends Material & { color: Color }>(material: T, lightHex: number, darkHex?: number) {
  material.userData.lightHex = lightHex;
  if (typeof darkHex === 'number') material.userData.darkHex = darkHex;
  themedHex(lightHex, material.color, darkHex);
  return material;
}

/** Reaplica o tema a todos os materiais marcados e às luzes do estúdio de uma cena. */
export function rethemeScene(scene: Scene) {
  readGlassTheme();
  scene.traverse((object) => {
    const light = object as DirectionalLight;
    if (light.isDirectionalLight && typeof light.userData.lightIntensity === 'number') {
      light.intensity = glassTheme.dark ? light.userData.darkIntensity : light.userData.lightIntensity;
    }
    const materials = (object as { material?: Material | Material[] }).material;
    if (!materials) return;
    (Array.isArray(materials) ? materials : [materials]).forEach((material) => {
      const withColor = material as Material & { color?: Color; envMapIntensity?: number };
      if (typeof material.userData.lightHex === 'number' && withColor.color) {
        themedHex(material.userData.lightHex, withColor.color, material.userData.darkHex);
      }
      if (typeof material.userData.lightEnv === 'number' && typeof withColor.envMapIntensity === 'number') {
        withColor.envMapIntensity = material.userData.lightEnv * (glassTheme.dark ? 1.35 : 1);
      }
    });
  });
}
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeInOut = (t: number) => { const x = clamp01(t); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

/** Gerador determinístico: a cena é sempre a mesma entre visitas. */
export function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export function hexToRgb(hex: number): [number, number, number] {
  return [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255];
}

export function srgb(r: number, g: number, b: number, target = new Color()) {
  return target.setRGB(r, g, b, SRGBColorSpace);
}

export function isCoarsePointer() {
  return matchMedia('(pointer: coarse)').matches;
}

export function createGlassRenderer(canvas: HTMLCanvasElement, coarse = isCoarsePointer()) {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch {
    return undefined;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.75 : 2));
  renderer.transmissionResolutionScale = 0.75;
  // Em canvas transparente, o three limpa o buffer de transmissão com branco a 50%: o vidro "vê" papel.
  // No modo escuro ele precisa ver o grafite do fundo, senão fica leitoso.
  const setClearColor = renderer.setClearColor.bind(renderer);
  renderer.setClearColor = ((color: Parameters<WebGLRenderer['setClearColor']>[0], alpha?: number) => {
    const backdrop = glassTheme.dark && color === 0xffffff && alpha === 0.5 ? 0x0b0b0d : color;
    setClearColor(backdrop, alpha);
  }) as WebGLRenderer['setClearColor'];
  readGlassTheme();
  return renderer;
}

/** Estúdio: ambiente com janelas de luz, luz principal e luz de contorno (as facetas cintilam). */
export function createStudio(renderer: WebGLRenderer, scene: Scene, track: <T extends Disposable>(item: T) => T) {
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = track(pmrem.fromScene(room, 0.035).texture);
  room.dispose();
  pmrem.dispose();
  const key = new DirectionalLight(0xffffff, 2.4);
  key.position.set(-3, 4, 6);
  const rim = new DirectionalLight(0xffffff, 1.4);
  rim.position.set(5, -2, 3);
  // No escuro, o contorno ganha força para separar o vidro do fundo.
  key.userData = { lightIntensity: 2.4, darkIntensity: 2.2 };
  rim.userData = { lightIntensity: 1.4, darkIntensity: 2.6 };
  if (glassTheme.dark) { key.intensity = 2.2; rim.intensity = 2.6; }
  scene.add(key, rim);
  return { key, rim };
}

/** Pirâmide de base quadrada com faces planas (facetas nítidas no vidro). */
function makePyramid() {
  const cone = new ConeGeometry(0.62, 0.86, 4, 1);
  const flat = cone.toNonIndexed();
  cone.dispose();
  flat.computeVertexNormals();
  return flat;
}

/** As seis formas, todas com tamanho visual próximo de 1 (escalar pelo tamanho desejado). */
export function createShapeGeometries(track: <T extends Disposable>(item: T) => T): BufferGeometry[] {
  return [
    track(new SphereGeometry(0.5, 28, 20)),
    track(new RoundedBoxGeometry(0.74, 0.74, 0.74, 3, 0.12)),
    track(new OctahedronGeometry(0.62)),
    track(makePyramid()),
    track(new TorusGeometry(0.34, 0.13, 16, 40)),
    track(new CapsuleGeometry(0.2, 0.46, 6, 16)),
  ];
}

/** Vidro claro: transmissão real no desktop; brilho e verniz sem transmissão em telas de toque. */
export function glassMaterial(transmissive: boolean) {
  const material = new MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.035, metalness: 0, envMapIntensity: 1.9, specularIntensity: 1,
    clearcoat: 1, clearcoatRoughness: 0.02,
    iridescence: 0.55, iridescenceIOR: 1.32, iridescenceThicknessRange: [160, 520],
    ...(transmissive
      ? { transmission: 1, thickness: 0.55, ior: 1.6, dispersion: 0.7, attenuationColor: 0xd4d4d8, attenuationDistance: 0.7 }
      : { sheen: 0.4, sheenRoughness: 0.35, sheenColor: 0xffffff }),
  });
  material.userData.lightEnv = 1.9;
  material.envMapIntensity = 1.9 * (glassTheme.dark ? 1.35 : 1);
  return material;
}

/** No escuro, o vidro fumê vira prata fumê: claro o bastante para se destacar, sem virar pérola. */
function smokedSilver(hex: number) {
  const channel = (c: number) => Math.round(Math.max(0, Math.min(1, 0.7 - c * 0.8)) * 255);
  const [r, g, b] = hexToRgb(hex);
  return (channel(r) << 16) | (channel(g) << 8) | channel(b);
}

/** Vidro fumê escuro dos hubs. */
export function obsidianMaterial(hex: number) {
  return themed(new MeshPhysicalMaterial({
    roughness: 0.08, metalness: 0, envMapIntensity: 1.25,
    clearcoat: 1, clearcoatRoughness: 0.04,
    iridescence: 0.55, iridescenceIOR: 1.38, iridescenceThicknessRange: [180, 520],
    sheen: 0.5, sheenRoughness: 0.3, sheenColor: 0xe4e4e7,
  }), hex, smokedSilver(hex));
}

/** Vidro lima do núcleo, com brilho próprio. */
export function limeCoreMaterial() {
  return new MeshPhysicalMaterial({
    color: LIME, emissive: LIME, emissiveIntensity: 0.32, roughness: 0.1, metalness: 0, envMapIntensity: 1.1,
    clearcoat: 1, clearcoatRoughness: 0.03, iridescence: 0.3, iridescenceIOR: 1.3,
  });
}

/** Metal escuro e polido dos anéis orbitais. */
export function inkRingMaterial() {
  return themed(new MeshPhysicalMaterial({ roughness: 0.18, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.2 }), INK, 0x8e8e96);
}

/** Brilho radial desenhado uma vez (núcleo e pulsos). */
export function makeGlowTexture() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,0.38)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Postura de cada forma: pirâmide (execução) e cápsula (processo) apontam para `outward` como fluxo;
 * anel (rotina) inclinado; cubo em vista isométrica; losango de pé. `wave` é o giro sobre o próprio eixo.
 */
export function orientShape(target: Object3D, kind: number, wave: number, outward: number) {
  if (kind === SHAPE.EXECUTION || kind === SHAPE.PROCESS) target.rotation.set(0, wave, outward - Math.PI / 2, 'ZYX');
  else if (kind === SHAPE.ROUTINE) target.rotation.set(0.9, wave * 0.8, 0, 'XYZ');
  else if (kind === SHAPE.TASK) target.rotation.set(0.62, wave, 0, 'XYZ');
  else if (kind === SHAPE.DECISION) target.rotation.set(0.22, wave, 0, 'XYZ');
  else target.rotation.set(0, wave, 0, 'XYZ');
}
