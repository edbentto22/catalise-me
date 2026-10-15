import type { APIRoute } from 'astro';
import { buildBench } from '../../figures/knowledgeBench.ts';

/**
 * A bancada de arquivo do Manifesto como arquivo SVG próprio (≈300 KB de caminhos).
 * Fora do HTML, a página chega leve; a figura é buscada quando a seção se aproxima e injetada
 * inline para ganhar vida. O desenho é o mesmo nos três idiomas (o texto acessível fica no container).
 */
export const GET: APIRoute = () => new Response(buildBench('', 0).svg, {
  headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
});
