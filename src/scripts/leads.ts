/** Envio de leads (formulário de contato e modal) para a automação da base Lark. */
const LEAD_ENDPOINT = 'https://triviumlabs.sg.larksuite.com/base/automation/webhook/event/THgIaGzH4wWd2lhVeDtlC4D5gAh';

export async function submitLead(data: Record<string, unknown>, timeoutMs = 15000): Promise<void> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    // no-cors: o webhook não expõe CORS; a resposta é opaca e só falhas de rede são detectáveis.
    await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/** Máscara de telefone brasileiro, (00) 90000-0000. Só é aplicada na versão em português. */
export function maskBrazilPhone(input: HTMLInputElement) {
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    input.value = v;
  });
}
