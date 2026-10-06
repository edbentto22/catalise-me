import assert from 'node:assert/strict';
import test from 'node:test';
import { runScene } from '../src/scripts/sceneLifecycle.ts';

function harness() {
  let next = 0;
  const frames = new Map();
  const listeners = new Map();
  const preference = { matches: false, addEventListener: (_, cb) => listeners.set('preference', cb), removeEventListener: () => listeners.delete('preference') };
  const original = new Map();
  let intersection, size, disconnected = 0;
  const globals = {
    matchMedia: () => preference,
    requestAnimationFrame: cb => { frames.set(++next, cb); return next; },
    cancelAnimationFrame: id => frames.delete(id),
    document: { hidden: false, documentElement: { dataset: { motion: 'full' } }, addEventListener: (type, cb) => listeners.set(type, cb), removeEventListener: type => listeners.delete(type) },
    IntersectionObserver: class { constructor(cb) { intersection = cb; } observe() {} disconnect() { disconnected++; } },
    ResizeObserver: class { constructor(cb) { size = cb; } observe() {} disconnect() { disconnected++; } },
  };
  for (const [name, value] of Object.entries(globals)) { original.set(name, Object.getOwnPropertyDescriptor(globalThis, name)); Object.defineProperty(globalThis, name, { configurable: true, writable: true, value }); }
  const renders = [];
  let resizes = 0;
  const stop = runScene({ container: {}, render: (...args) => renders.push(args), resize: () => resizes++ });
  return {
    renders, frames, preference, listeners, stop,
    visible: value => intersection([{ isIntersecting: value }]),
    resize: () => size(),
    resizes: () => resizes,
    hidden: value => { globals.document.hidden = value; listeners.get('visibilitychange')?.(); },
    tick: time => { const batch = [...frames.values()]; frames.clear(); batch.forEach(cb => cb(time)); },
    reduced: value => { preference.matches = value; listeners.get('preference')?.(); },
    restore: () => { stop(); for (const [name, descriptor] of original) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } },
    disconnected: () => disconnected,
  };
}

test('cena respeita orçamento de quadros e pausa fora da tela ou em aba oculta', () => {
  const h = harness();
  try {
    assert.equal(h.frames.size, 0);
    h.visible(true); h.tick(100); h.tick(116); h.tick(134);
    assert.equal(h.renders.length, 2, 'não deve renderizar a 60 fps');
    h.visible(false); assert.equal(h.frames.size, 0);
    h.visible(true); h.hidden(true); assert.equal(h.frames.size, 0);
    h.hidden(false); assert.equal(h.frames.size, 1);
    h.tick(10000); assert.equal(h.renders.at(-1)[1], 0, 'retomada não acumula tempo da aba oculta');
  } finally { h.restore(); }
});

test('movimento reduzido mantém um quadro estático e acompanha mudança de preferência', () => {
  const h = harness();
  try {
    h.reduced(true); h.visible(true);
    assert.equal(h.frames.size, 0);
    assert.deepEqual(h.renders.at(-1), [0, 0, true]);
    h.resize(); assert.equal(h.resizes(), 1); assert.equal(h.frames.size, 0);
    h.reduced(false); assert.equal(h.frames.size, 1);
    h.tick(100); h.reduced(true); assert.equal(h.frames.size, 0);
    assert.deepEqual(h.renders.at(-1), [0, 0, true]);
  } finally { h.restore(); }
});

test('desmontar a cena libera observadores, listeners e RAF pendentes', () => {
  const h = harness();
  try {
    h.visible(true); h.stop();
    assert.equal(h.frames.size, 0); assert.equal(h.listeners.size, 0);
    assert.equal(h.disconnected(), 2);
  } finally { h.restore(); }
});
