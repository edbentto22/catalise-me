/**
 * Bancada de arquivo · Fig. 1 do Manifesto ("Hoje, a inteligência de uma empresa está espalhada").
 *
 * O objeto é a explicação: seis bandejas de fichas em postes de alturas diferentes (o conhecimento
 * espalhado em cabeças, processos, sistemas, planilhas, conversas e documentos), um pórtico com garra
 * (a Catalise.me) que leva cada maço para uma única gaveta de índice (a camada consultável) e um leitor
 * com lente lima (a IA), que só lê o que já está na gaveta.
 *
 * Tudo é derivado de um único modelo, `benchState(p)`: o pórtico, a garra, os maços, o leitor e o texto
 * do leitor leem o mesmo estado. Os números exibidos são contagens do próprio desenho (6 bandejas),
 * nunca métricas inventadas.
 */
import * as k from './iso-kit.ts';
import type { Plan, Point3, Projection } from './iso-kit.ts';

export const WIDTH = 640;
export const HEIGHT = 430;
export const SOURCES = 6;

/* ── Mundo (≈ 1 unidade = 1 px do objeto real) ─────────────────────────── */
export const BASE: Plan = { x: -150, y: -106, w: 300, d: 212, r: 10 };
const BASE_H = 12;
const FOOT_H = 5;

/** Centro em x de cada coluna: bandeja i, seção i da gaveta e parada i do pórtico ficam alinhadas. */
export const COLUMN = Array.from({ length: SOURCES }, (_, i) => -100 + 40 * i);
/** Alturas das bandejas: o conhecimento espalhado não fica nem no mesmo nível. */
export const TRAY_H = [16, 30, 22, 36, 12, 26];
export const TRAY_Y = -54; // centro em y do maço na bandeja

const CARD = { w: 1.4, d: 22, h: 24 };
const CARD_GAP = 5;

export const DRAWER: Plan = { x: -130, y: 20, w: 260, d: 40, r: 3 };
export const DRAWER_FLOOR = 2;
export const DRAWER_RIM = 20;
export const DRAWER_Y = 40; // centro em y do maço na gaveta

export const TRAVEL = 44; // altura da base do maço em trânsito
const HEAD_GAP = 0.5; // folga entre o topo das fichas e a garra
const HEAD_H = 4;
const FINGER_H = 6;
export const ROD_LEN = 64;
export const CARRIAGE_Z = [92, 112] as const;
const BRIDGE_TOP = 100;
const BAR_H = 8;
export const PARK = { bx: 132, cy: -82 };

const READER_Y = 72;
export const READER_REACH = [-120, 120] as const;

export const P: Projection = k.fitProjection(
  [
    ...k.boxCorners(BASE, -BASE_H - FOOT_H, 0),
    [-112, -100, BRIDGE_TOP + BAR_H + 14],
    [-112, 96, BRIDGE_TOP + BAR_H],
    [140, -100, BRIDGE_TOP + BAR_H + 14],
    [140, 96, BRIDGE_TOP + BAR_H],
  ],
  WIDTH,
  HEIGHT,
  { pad: 12, azimuth: 56 },
);

/* ── Modelo ─────────────────────────────────────────────────────────────── */
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const ease = (t: number) => { const x = clamp01(t); return x * x * (3 - 2 * x); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const span = (t: number, a: number, b: number) => ease((t - a) / (b - a));

export interface BenchState {
  bx: number; // x do pórtico
  cy: number; // y do carro (centro da garra)
  pb: number; // z da base do maço sob a garra (ou onde ele estaria)
  held: number; // maço na garra (-1 = nenhum)
  inDrawer: number; // maço descendo dentro da gaveta (-1 = nenhum)
  drawerZ: number; // deslocamento em z do maço que desce na gaveta
  filed: number; // quantos maços já estão assentados na gaveta (0…6)
  rx: number; // x do leitor
  reading: number; // seção que o leitor lê (-1 = nada para ler)
  phase: 'scattered' | 'connecting' | 'filed' | 'queryable';
  active: number; // fonte em movimento (para o texto)
}

const stopOf = (i: number) => COLUMN[i] - 10; // o carro pende do lado +x da travessa

/** Estado da bancada para p ∈ [0, 7]: seis arquivamentos e, no fim, a varredura do leitor. */
export function benchState(raw: number): BenchState {
  const p = Math.max(0, Math.min(SOURCES + 1, raw));
  if (p >= SOURCES) {
    const t = p - SOURCES;
    const out = span(t, 0, 0.3);
    const sweep = span(t, 0.2, 0.95);
    const rx = lerp(COLUMN[SOURCES - 1], COLUMN[0], sweep);
    const reading = COLUMN.reduce((best, c, i) => (Math.abs(c - rx) < Math.abs(COLUMN[best] - rx) ? i : best), 0);
    return {
      bx: lerp(stopOf(SOURCES - 1), PARK.bx, out), cy: lerp(DRAWER_Y, PARK.cy, out), pb: TRAVEL,
      held: -1, inDrawer: -1, drawerZ: 0, filed: SOURCES, rx, reading,
      phase: 'queryable', active: reading,
    };
  }
  const i = Math.floor(p);
  const t = p - i;
  const from = i === 0 ? stopOf(0) : stopOf(i - 1);
  const bx = lerp(from, stopOf(i), span(t, 0, 0.22));
  const startY = i === 0 ? TRAY_Y : DRAWER_Y;
  let cy = lerp(startY, TRAY_Y, span(t, 0, 0.22));
  cy = lerp(cy, DRAWER_Y, span(t, 0.5, 0.72));
  const top = TRAY_H[i];
  let pb = TRAVEL;
  pb = lerp(pb, top, span(t, 0.22, 0.36));
  pb = lerp(pb, TRAVEL, span(t, 0.36, 0.5));
  pb = lerp(pb, DRAWER_FLOOR, span(t, 0.72, 0.88));
  pb = lerp(pb, TRAVEL, span(t, 0.88, 1));
  const lifted = t >= 0.36 && t < 0.88;
  const sinking = t >= 0.72 && t < 0.88 && pb <= DRAWER_RIM + 0.4;
  const held = lifted && !sinking ? i : -1;
  const inDrawer = sinking ? i : -1;
  const filed = i + (t >= 0.88 ? 1 : 0);
  const rx = lerp(COLUMN[Math.max(0, i - 1)], COLUMN[i], span(t, 0.86, 1));
  const reading = filed === 0 ? -1 : Math.min(filed - 1, COLUMN.reduce((best, c, j) => (Math.abs(c - rx) < Math.abs(COLUMN[best] - rx) ? j : best), 0));
  const phase = p < 0.04 ? 'scattered' : t < 0.72 ? 'connecting' : 'filed';
  return { bx, cy, pb, held, inDrawer, drawerZ: sinking ? pb - DRAWER_FLOOR : 0, filed, rx, reading, phase, active: i };
}

/** Texto do leitor: estados do desenho, contados nas próprias bandejas. */
export interface BenchCopy { sources: string[]; scattered: string; connecting: string; filed: string; queryable: string }
export function readoutOf(s: BenchState, copy: BenchCopy) {
  const fill = (text: string) => text.replace('{source}', copy.sources[s.active] || '').replace('{n}', String(s.filed)).replace('{total}', String(SOURCES));
  return fill(copy[s.phase]);
}

/* ── Desenho ────────────────────────────────────────────────────────────── */
const S = (paths: ReturnType<typeof k.slabOf>, style: Parameters<typeof k.solidSvg>[1] = {}) => k.solidSvg(paths, style);
const L = (d: string, style: Parameters<typeof k.lineSvg>[1] = {}) => k.lineSvg(d, style);
const D = (points: Point3[], style: Parameters<typeof k.dotsSvg>[1] = {}) => k.dotsSvg(points.map((point) => k.iso(point, P)), style);
const byDepth = <T extends [number, number]>(points: T[]) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const halo = (plan: Plan, z: number, h: number, blur = 9) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}"${blur !== 9 ? ` style="filter:blur(${blur}px)"` : ''}/>`;

function base() {
  const out = [halo(BASE, -BASE_H - FOOT_H, BASE_H)];
  for (const [x, y] of byDepth(k.corners(BASE, 24))) {
    out.push(S(k.cylinder(x, y, 8, -BASE_H - FOOT_H, 1.6, P, 32), { tone: 'lo' }));
    out.push(S(k.cylinder(x, y, 6.2, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 32), { tone: 'mid' }));
  }
  out.push(S(k.slabOf(BASE, -BASE_H, BASE_H, P, 10, 1.6), { tone: 'mid', inner: L(k.sideSeam(BASE, -BASE_H + 4, P, 10), { tone: 'faint' }) }));
  out.push(L(k.planOutline(k.insetPlan(BASE, 5), 0, P, 10), { tone: 'lo' }));
  // Canaletas gravadas: o caminho de cada fonte até a sua seção da gaveta
  out.push(L(COLUMN.map((c) => k.planOutline({ x: c - 5, y: -34, w: 10, d: 50, r: 5 }, 0, P, 8)).join(''), { tone: 'faint' }));
  out.push(D(COLUMN.flatMap((c) => [[c, -29, 0], [c, 11, 0]] as Point3[]), { size: 0.4, tone: 'lo' }));
  const screws = k.corners(BASE, 11);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 18)).join(''), { tone: 'lo' }));
  out.push(D(screws.map(([x, y]) => [x, y, 0]), { size: 0.5 }));
  // Placa de identificação no corredor entre bandejas e gaveta
  const plate = { x: 102, y: -24, w: 34, d: 16, r: 1.5 };
  out.push(S(k.slabOf(plate, 0, 0.8, P, 4), { tone: 'lo', crease: 'none' }));
  out.push(L(k.planOutline(k.insetPlan(plate, 1.6), 0.8, P, 4), { tone: 'faint' }));
  [[0, 22], [5, 16], [10, 19]].forEach(([dy, len]) => out.push(L(k.lineOnTop([plate.x + 5, plate.y + 4 + dy * 0.8], [plate.x + 5 + len, plate.y + 4 + dy * 0.8], 0.8, P), { tone: 'lo', free: true })));
  out.push(D([[plate.x + 2.2, plate.y + 2.2, 0.8], [plate.x + plate.w - 2.2, plate.y + plate.d - 2.2, 0.8]], { size: 0.42 }));
  return out.join('');
}

function rail(y: number) {
  const out = [];
  for (const x of [-148, 142]) out.push(S(k.slabOf({ x, y: y - 3, w: 6, d: 12, r: 1.4 }, 0, 8, P, 3, 0.5), { tone: 'mid' }));
  const plan = { x: -142, y, w: 284, d: 6, r: 1 };
  out.push(S(k.slabOf(plan, 0, 4, P, 3, 0.4), { tone: 'mid' }));
  out.push(D([-130, -60, 0, 60, 130].map((x) => [x, y + 3, 4] as Point3), { size: 0.4 }));
  return out.join('');
}

/** A perna do pórtico com o seu truque sobre o trilho. Construída em bx = 0. */
function leg(y: number) {
  const out = [];
  const truck = { x: -8, y: y - 2, w: 16, d: 10, r: 2 };
  out.push(S(k.slabOf(truck, 4, 6, P, 4, 0.5), { tone: 'mid', inner: L(k.sideSeam(truck, 7, P, 4), { tone: 'faint' }) }));
  out.push(D([[-5, y + 3, 10], [5, y + 3, 10]], { size: 0.45 }));
  const column = { x: -3.5, y: y - 0.5, w: 7, d: 7, r: 1.2 };
  out.push(S(k.slabOf(column, 10, BRIDGE_TOP - 10, P, 3, 0.4), { tone: 'mid', inner: L([40, 70].map((z) => k.sideSeam(column, z, P, 3)).join(''), { tone: 'faint' }) }));
  return out.join('');
}

function crossbar() {
  const bar = { x: -4, y: -100, w: 8, d: 196, r: 1.5 };
  const out = [S(k.slabOf(bar, BRIDGE_TOP, BAR_H, P, 3, 0.5), { tone: 'mid' })];
  out.push(L(k.lineOnTop([0, -96], [0, 92], BRIDGE_TOP + BAR_H, P), { tone: 'faint' }));
  out.push(D([[0, -97, BRIDGE_TOP + BAR_H], [0, 93, BRIDGE_TOP + BAR_H]], { size: 0.45 }));
  return out.join('');
}

/** Carro que corre pela face +x da travessa. Construído em bx = 0, cy = 0. */
function carriage() {
  const [z0, z1] = CARRIAGE_Z;
  const body = { x: 4, y: -9, w: 12, d: 18, r: 1.5 };
  const out = [S(k.slabOf(body, z0, z1 - z0, P, 4, 0.6), { tone: 'hi', crease: 'lo', inner: L(k.sideSeam(body, z0 + 6, P, 4), { tone: 'faint' }) })];
  out.push(L(k.ring(10, -4, 1.8, z1, P, 16) + k.ring(10, 4, 1.8, z1, P, 16), { tone: 'lo' }));
  out.push(D([[6, -7, z1], [14, -7, z1], [6, 7, z1], [14, 7, z1]], { size: 0.4 }));
  return out.join('');
}

function card(plan: Plan, z: number, tab: number | null) {
  const out = [S(k.slabOf(plan, z, CARD.h, P, 2), { tone: 'hi', crease: 'lo' })];
  if (tab !== null) out.push(S(k.slabOf({ x: plan.x, y: plan.y + tab, w: plan.w, d: 6, r: 0.3 }, z + CARD.h, 3, P, 2), { tone: 'hi', crease: 'lo' }));
  return out.join('');
}

/** Um maço de três fichas com aba própria, em (cx, cyCentre, z). */
function packet(i: number, cx: number, cyC: number, z: number) {
  const tab = 2 + (i % 3) * 6.5;
  return [0, 1, 2]
    .map((j) => card({ x: cx - CARD_GAP + CARD_GAP * j - CARD.w / 2, y: cyC - CARD.d / 2, w: CARD.w, d: CARD.d, r: 0.4 }, z, j === 0 ? tab : null))
    .join('');
}

function tray(i: number) {
  const c = COLUMN[i];
  const h = TRAY_H[i];
  const out = [halo({ x: c - 12, y: TRAY_Y - 12, w: 24, d: 24, r: 8 }, 0, 0.2, 5)];
  out.push(S(k.cylinder(c, TRAY_Y, 6.4, 0, 2, P, 28), { tone: 'lo' }));
  out.push(S(k.cylinder(c, TRAY_Y, 3.4, 2, h - 5, P, 24), { tone: 'mid', crease: 'none' }));
  if (h > 18) out.push(L(k.sideArc(c, TRAY_Y, 3.4, 2 + (h - 5) * 0.55, P, 16), { tone: 'faint' }));
  const plate = { x: c - 14, y: TRAY_Y - 14, w: 28, d: 28, r: 2.5 };
  out.push(S(k.slabOf(plate, h - 3, 3, P, 4, 0.6), { tone: 'mid' }));
  out.push(S(k.slabOf({ x: c - 14, y: TRAY_Y - 14, w: 28, d: 2, r: 0.6 }, h, 10, P, 2, 0.4), { tone: 'mid' }));
  out.push(D([[c - 10, TRAY_Y - 13, h + 10], [c + 10, TRAY_Y - 13, h + 10]], { size: 0.42 }));
  out.push(S(k.slabOf({ x: c - 14, y: TRAY_Y - 12, w: 2, d: 24, r: 0.6 }, h, 4, P, 2), { tone: 'mid' }));
  return out.join('');
}

function trayFront(i: number) {
  const c = COLUMN[i];
  const h = TRAY_H[i];
  return [
    S(k.slabOf({ x: c + 12, y: TRAY_Y - 12, w: 2, d: 24, r: 0.6 }, h, 4, P, 2), { tone: 'mid' }),
    S(k.slabOf({ x: c - 14, y: TRAY_Y + 12, w: 28, d: 2, r: 0.6 }, h, 3, P, 2), { tone: 'mid' }),
  ].join('');
}

function drawerBack() {
  const d = DRAWER;
  const out = [halo(k.insetPlan(d, 2), 0, 0.2, 6)];
  out.push(S(k.slabOf(d, 0, DRAWER_FLOOR, P, 4), { tone: 'lo', crease: 'none' }));
  out.push(S(k.slabOf({ x: d.x, y: d.y, w: d.w, d: 2.5, r: 1 }, DRAWER_FLOOR, DRAWER_RIM - DRAWER_FLOOR, P, 3, 0.4), { tone: 'mid' }));
  out.push(S(k.slabOf({ x: d.x, y: d.y + 2.5, w: 2.5, d: d.d - 5, r: 0.8 }, DRAWER_FLOOR, DRAWER_RIM - DRAWER_FLOOR, P, 2, 0.4), { tone: 'mid' }));
  // Trilho da haste de fichas no fundo
  out.push(L(k.lineOnTop([d.x + 4, DRAWER_Y], [d.x + d.w - 4, DRAWER_Y], DRAWER_FLOOR, P), { tone: 'faint' }));
  return out.join('');
}

function divider(x: number) {
  const plan = { x: x - 0.6, y: DRAWER.y + 3, w: 1.2, d: DRAWER.d - 6, r: 0.3 };
  return S(k.slabOf(plan, DRAWER_FLOOR, 13, P, 2), { tone: 'mid' });
}

function drawerFront() {
  const d = DRAWER;
  const out = [];
  out.push(S(k.slabOf({ x: d.x + d.w - 2.5, y: d.y + 2.5, w: 2.5, d: d.d - 5, r: 0.8 }, DRAWER_FLOOR, DRAWER_RIM - DRAWER_FLOOR, P, 2, 0.4), { tone: 'mid' }));
  const front = { x: d.x, y: d.y + d.d - 2.5, w: d.w, d: 2.5, r: 1 };
  out.push(S(k.slabOf(front, DRAWER_FLOOR, DRAWER_RIM - DRAWER_FLOOR, P, 3, 0.5), { tone: 'mid', inner: L(k.sideSeam(front, 6, P, 3), { tone: 'faint' }) }));
  const face = d.y + d.d;
  // Porta-etiqueta e puxador no centro da frente
  out.push(S(k.slabOf({ x: -15, y: face, w: 30, d: 0.8, r: 0.3 }, 10, 7, P, 2), { tone: 'mid' }));
  out.push(S(k.slabOf({ x: -12.5, y: face + 0.8, w: 25, d: 0.4, r: 0.1 }, 11.2, 4.6, P, 2), { tone: 'hi', crease: 'none' }));
  for (const x of [-11, 8]) out.push(S(k.slabOf({ x, y: face, w: 3, d: 3, r: 0.8 }, 4.5, 3, P, 2), { tone: 'mid' }));
  out.push(S(k.slabOf({ x: -12, y: face + 3, w: 24, d: 2.4, r: 1 }, 4, 4, P, 3, 0.3), { tone: 'mid' }));
  out.push(D([[-13.5, face + 0.8, 13.5], [13.5, face + 0.8, 13.5]], { size: 0.4 }));
  // Marcas das seções na borda da frente
  out.push(D(COLUMN.map((c) => [c, face - 1.25, DRAWER_RIM] as Point3), { size: 0.42, tone: 'lo' }));
  return out.join('');
}

function readerRail() {
  const plan = { x: -136, y: READER_Y - 4, w: 272, d: 8, r: 1.5 };
  const out = [S(k.slabOf(plan, 0, 3, P, 3, 0.4), { tone: 'lo' })];
  const ticks = k.topTicks(-132, 132, 4, 10, READER_Y + 3.6, 3, [1.4, 2.6], P);
  out.push(L(ticks.minor, { tone: 'faint' }), L(ticks.major, { tone: 'lo' }));
  out.push(D(COLUMN.map((c) => [c, READER_Y - 1.5, 3] as Point3), { size: 0.5, tone: 'mid' }));
  return out.join('');
}

/** O leitor (a IA). Construído em x = 0; a lente é a única peça acesa. */
function reader() {
  const out = [halo({ x: -9, y: READER_Y - 6, w: 18, d: 12, r: 3 }, 3, 0.2, 4)];
  const shoe = { x: -9, y: READER_Y - 5, w: 18, d: 10, r: 2 };
  out.push(S(k.slabOf(shoe, 3, 5, P, 4, 0.5), { tone: 'mid', inner: L(k.sideSeam(shoe, 5.5, P, 4), { tone: 'faint' }) }));
  out.push(S(k.cylinder(6, READER_Y + 2, 2.4, 8, 3.4, P, 20), { tone: 'mid' }));
  out.push(L(k.knurl(6, READER_Y + 2, 2.4, 8, 11.4, 16, P), { tone: 'lo' }));
  out.push(S(k.cylinder(-2, READER_Y, 3.6, 8, 2, P, 24), { tone: 'mid' }));
  out.push(S(k.cylinder(-2, READER_Y, 2, 10, 20, P, 20), { tone: 'mid', crease: 'none' }));
  out.push(L(k.sideArc(-2, READER_Y, 2, 21, P, 14), { tone: 'faint' }));
  const head = { x: -8, y: READER_Y - 9, w: 12, d: 13, r: 2.4 };
  out.push(S(k.slabOf(head, 29, 8, P, 4, 0.6), { tone: 'hi', crease: 'lo', inner: L(k.sideSeam(head, 32, P, 4), { tone: 'faint' }) }));
  // A lente: a única peça acesa, voltada para as fichas da gaveta
  out.push(S(k.slabOf({ x: -6.5, y: READER_Y - 11.4, w: 9, d: 2.4, r: 0.8 }, 30.2, 5.6, P, 3, 0.4), { tone: 'hi', lit: true }));
  out.push(D([[-6, READER_Y + 2.5, 37], [2, READER_Y + 2.5, 37]], { size: 0.4 }));
  return out.join('');
}

/** Peças móveis da garra (exceto as hastes, refeitas a cada quadro). Construída em bx = 0, cy = 0, pb = 0. */
function gripperHead() {
  const z = CARD.h + HEAD_GAP;
  const head = { x: 0, y: -12, w: 20, d: 24, r: 2 };
  return {
    // Dentes finos entre as fichas: o maço continua à vista enquanto viaja.
    far: [6.5, 11.5].map((x) => S(k.slabOf({ x, y: -12.6, w: 2, d: 1.4, r: 0.4 }, z - FINGER_H, FINGER_H, P, 2), { tone: 'mid' })).join(''),
    near: [
      ...[6.5, 11.5].map((x) => S(k.slabOf({ x, y: 11.2, w: 2, d: 1.4, r: 0.4 }, z - FINGER_H, FINGER_H, P, 2), { tone: 'mid' })),
      S(k.slabOf(head, z, HEAD_H, P, 4, 0.5), { tone: 'mid', inner: L(k.sideSeam(head, z + 1.6, P, 4), { tone: 'faint' }) }),
      D([[3, -9, z + HEAD_H], [17, -9, z + HEAD_H], [3, 9, z + HEAD_H], [17, 9, z + HEAD_H]], { size: 0.4 }),
    ].join(''),
  };
}

/** As duas hastes da garra num quadro: o trecho sob o carro e o toco acima dele. */
export function rodsOf(s: BenchState, part: 'low' | 'high') {
  const x = s.bx + 10;
  const top = s.pb + CARD.h + HEAD_GAP + HEAD_H;
  const [c0, c1] = CARRIAGE_Z;
  const out: string[] = [];
  for (const dy of [-4, 4]) {
    const y = s.cy + dy;
    if (part === 'low' && c0 - top > 0.1) out.push(S(k.cylinder(x, y, 1.1, top, c0 - top, P, 12), { tone: 'mid', crease: 'none' }));
    if (part === 'high' && top + ROD_LEN - c1 > 0.1) {
      out.push(S(k.cylinder(x, y, 1.1, c1, top + ROD_LEN - c1, P, 12), { tone: 'mid', crease: 'none' }));
      out.push(S(k.cylinder(x, y, 1.6, top + ROD_LEN, 1, P, 12), { tone: 'mid' }));
    }
  }
  return out.join('');
}

export interface BenchFigure { svg: string; start: BenchState }

export function buildBench(label: string, startAt = 0): BenchFigure {
  const s = benchState(startAt);
  const t = (by: Point3) => k.translateAlong(P, by);
  const g = gripperHead();
  const body: string[] = [];

  body.push(base(), rail(-98));
  body.push(`<g data-bench="leg-back" transform="${t([s.bx, 0, 0])}">${leg(-98)}</g>`);

  // Bandejas de trás para a frente; cada maço fica entre a bandeja e as bordas da frente dela.
  const trays = [...COLUMN.keys()].sort((a, b) => k.depthOf([COLUMN[a], TRAY_Y, 0], P) - k.depthOf([COLUMN[b], TRAY_Y, 0], P));
  for (const i of trays) {
    body.push(tray(i));
    body.push(`<g data-bench="tray-packet" data-i="${i}"${s.held === i || s.inDrawer === i || i < s.filed ? ' display="none"' : ''}>${packet(i, COLUMN[i], TRAY_Y, TRAY_H[i])}</g>`);
    body.push(trayFront(i));
  }

  // Gaveta: fundo, depois divisórias e maços por profundidade, depois a frente.
  body.push(drawerBack());
  const inside: Array<{ x: number; svg: string }> = [];
  [-80, -40, 0, 40, 80].forEach((x) => inside.push({ x, svg: divider(x) }));
  COLUMN.forEach((c, i) => inside.push({
    x: c,
    svg: `<g data-bench="drawer-packet" data-i="${i}"${i < s.filed || s.inDrawer === i ? '' : ' display="none"'} transform="${t([0, 0, s.inDrawer === i ? s.drawerZ : 0])}">${packet(i, c, DRAWER_Y, DRAWER_FLOOR)}</g>`,
  }));
  inside.sort((a, b) => a.x - b.x).forEach((item) => body.push(item.svg));
  body.push(drawerFront(), readerRail());

  // Garra: hastes de baixo, dedo de trás, maço levado, dedo da frente e cabeçote.
  const held = COLUMN.map((c, i) => `<g data-bench="held-packet" data-i="${i}"${s.held === i ? '' : ' display="none"'} transform="${t(heldOffset(s, i))}">${packet(i, c, TRAY_Y, TRAY_H[i])}</g>`).join('');
  body.push(`<g data-bench="gripper" transform="${t([s.bx, s.cy, s.pb])}">${g.far}</g>`);
  body.push(`<g data-bench="held">${held}</g>`);
  body.push(`<g data-bench="gripper" transform="${t([s.bx, s.cy, s.pb])}">${g.near}</g>`);
  body.push(`<g data-bench="rods-low">${rodsOf(s, 'low')}</g>`);

  body.push(`<g data-bench="reader" transform="${t([s.rx, 0, 0])}">${reader()}</g>`);
  body.push(rail(90), `<g data-bench="leg-front" transform="${t([s.bx, 0, 0])}">${leg(90)}</g>`);
  body.push(`<g data-bench="crossbar" transform="${t([s.bx, 0, 0])}">${crossbar()}</g>`);
  body.push(`<g data-bench="carriage" transform="${t([s.bx, s.cy, 0])}">${carriage()}</g>`);
  body.push(`<g data-bench="rods-high">${rodsOf(s, 'high')}</g>`);

  return { svg: k.figureSvg({ width: WIDTH, height: HEIGHT, label, body }), start: s };
}

/** Deslocamento do maço levado (construído na bandeja) até a posição atual da garra. */
export function heldOffset(s: BenchState, i: number): Point3 {
  return [0, s.cy - TRAY_Y, s.pb - TRAY_H[i]];
}
