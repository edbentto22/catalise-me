/**
 * Detecta WebGL renderizado por software (SwiftShader, llvmpipe etc.).
 * Nesses casos cada quadro 3D roda na CPU e trava a página: preferimos não iniciar a cena.
 */
let cached: boolean | null = null;

export function hasHardwareWebGL(): boolean {
  if (cached !== null) return cached;
  // Atalho de revisão: ?force3d liga as cenas mesmo sem GPU.
  if (new URLSearchParams(location.search).has('force3d')) return (cached = true);
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return (cached = false);
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    cached = !/swiftshader|llvmpipe|software|softpipe|microsoft basic render/i.test(renderer);
  } catch {
    cached = false;
  }
  return cached;
}
