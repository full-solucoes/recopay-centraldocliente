/* =========================================================================
   Resolvedor do checkoutPublicoId da empresa.
   Ordem de precedencia (conforme decisao de arquitetura):
     1. Query param ?empresa=xxx  (maior precedencia - util para testes/links)
     2. Subdominio: primeiro segmento de recopay.com.br, ignorando clientes/www
     3. Variavel VITE_CHECKOUT_PUBLICO_ID (.env - fallback/sobrescrita por deploy)
   ========================================================================= */

const BLACKLIST_SEGMENTS = new Set([
  '',
  'www',
  'clientes',
  'cliente',
  'app',
  'portal',
  'admin',
  'painel',
  'api',
  'checkout'
])

/**
 * Extrai o identificador do subdominio.
 * Ex.: acme.recopay.com.br -> "acme"
 *      acme.app.recopay.com.br -> "acme"
 *      clientes.recopay.com.br -> null (clientes eh blacklistado)
 */
function extrairDoSubdominio(host) {
  if (!host) return null
  // Remove porta
  const hostname = host.split(':')[0].toLowerCase()
  const partes = hostname.split('.')

  // Apenas aplica a regra de subdominio quando ha subdominio relevante.
  // Consideramos dominio base com 2 partes (ex: recopay.com.br) ou 3 com suffixo comum.
  // Procura pelo primeiro segmento nao blacklistado antes do dominio base.
  for (let i = 0; i < partes.length - 2; i++) {
    const seg = partes[i]
    if (!BLACKLIST_SEGMENTS.has(seg)) {
      return seg
    }
  }
  return null
}

/**
 * Resolve o checkoutPublicoId considerando a seguinte precedencia:
 *   1. Query param ?empresa=xxx  (sobrescrita explicita - util para testes/links)
 *   2. Variavel VITE_CHECKOUT_PUBLICO_ID  (configuracao deliberada do deploy)
 *   3. Subdominio (heuristica para setup multi-tenant sem env configurado)
 *
 * A configuracao por env tem prioridade sobre a heuristica de subdominio
 * porque representa uma decisao explicita por deploy. Assim, dominios como
 * `clientes.recopay.com.br` (app da propria marca, sem tenant no subdominio)
 * usam o valor do env em vez de capturar `recopay` como id da empresa.
 *
 * @param {{host?:string, search?:string}} [loc] override de window.location (testes)
 * @returns {string|null}
 */
export function resolverCheckoutPublicoId(loc) {
  const location = loc || (typeof window !== 'undefined' ? window.location : {})
  const search = location.search || ''
  const host = location.host || ''

  // 1) Query param ?empresa=xxx (sobrescrita explicita)
  try {
    const params = new URLSearchParams(search)
    const q = (params.get('empresa') || params.get('checkout') || '').trim()
    if (q) return q
  } catch (_e) {
    /* ignore */
  }

  // 2) Variavel de ambiente (configuracao deliberada do deploy)
  const envVal = (import.meta.env.VITE_CHECKOUT_PUBLICO_ID || '').trim()
  if (envVal) return envVal

  // 3) Subdominio (heuristica para multi-tenant sem env configurado)
  const sub = extrairDoSubdominio(host)
  if (sub) return sub

  return null
}

export const checkoutId = resolverCheckoutPublicoId()
