import { http, extrairDados } from './http'

/**
 * Lista NFS-e do cliente autenticado.
 * GET /clientes/notas?status=&pagina=&tamanhoPagina=
 */
export function listarNotas(params = {}) {
  return http
    .get('/clientes/notas', {
      params: {
        status: params.status || undefined,
        pagina: params.pagina ?? 1,
        tamanhoPagina: params.tamanhoPagina ?? 20
      }
    })
    .then((res) => extrairDados(res, { itens: [], total: 0, pagina: 1, tamanhoPagina: 20 }))
}

/**
 * Monta a URL publica para baixar o PDF da NFS-e.
 * O backend responde 302 redirecionando para o PDF do RecoPayApp.
 * Inclui o token via header (preservado pelo http), por isso passamos pela API.
 * Como o download precisa de um redirect autenticado, abrimos via fetch.
 *
 * GET /clientes/notas/{id}/pdf
 */
export async function baixarPdfNota(id) {
  const res = await http.get(`/clientes/notas/${id}/pdf`, {
    // O endpoint retorna 302; o axios segue o redirect.
    responseType: 'blob',
    validateStatus: (s) => s < 400
  })
  return res
}

/**
 * Baixa o XML da NFS-e.
 * GET /clientes/notas/{id}/xml (200 conteudo OU 302 redirect)
 */
export async function baixarXmlNota(id) {
  const res = await http.get(`/clientes/notas/${id}/xml`, {
    responseType: 'blob',
    validateStatus: (s) => s < 400
  })
  return res
}

/**
 * Baixa um blob como arquivo no navegador.
 */
export function salvarBlob(response, nomeSugerido) {
  const disposition = response.headers?.['content-disposition'] || ''
  let nome = nomeSugerido
  const m = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)/i)
  if (m && m[1]) {
    nome = decodeURIComponent(m[1])
  }
  const tipo = response.headers?.['content-type'] || 'application/octet-stream'
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome || 'documento'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
