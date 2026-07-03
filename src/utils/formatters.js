/* =========================================================================
   Formatadores compartilhados (moeda, datas, documentos)
   ========================================================================= */

/**
 * Formata valor numerico como moeda brasileira.
 * @param {number|null|undefined} valor
 * @param {string} [moeda='BRL']
 */
export function formatarMoeda(valor, moeda = 'BRL') {
  if (valor === null || valor === undefined || valor === '' || Number.isNaN(Number(valor))) {
    return '—'
  }
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: moeda || 'BRL'
    }).format(Number(valor))
  } catch (_e) {
    return `${Number(valor).toFixed(2)}`
  }
}

/**
 * Formata uma data ISO em dd/mm/aaaa.
 * @param {string|null|undefined} dataIso
 */
export function formatarData(dataIso) {
  if (!dataIso) return '—'
  const d = new Date(dataIso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR')
}

/**
 * Formata uma data ISO em dd/mm/aaaa hh:mm.
 */
export function formatarDataHora(dataIso) {
  if (!dataIso) return '—'
  const d = new Date(dataIso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formata competencia (yyyy-mm ou data ISO) como mm/yyyy ou 07/2026.
 */
export function formatarCompetencia(valor) {
  if (!valor) return '—'
  const str = String(valor)
  // Formato yyyy-mm
  const ym = str.match(/^(\d{4})-(\d{2})/)
  if (ym) return `${ym[2]}/${ym[1]}`
  // Caso seja data ISO completa
  const d = new Date(str)
  if (!Number.isNaN(d.getTime())) {
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  }
  return str
}

/**
 * Formata CPF/CNPJ conforme tamanho do documento.
 */
export function formatarDocumento(doc) {
  if (!doc) return '—'
  const digits = String(doc).replace(/\D/g, '')
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  if (digits.length === 14) {
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }
  return doc
}

/**
 * Formata telefone (fixo ou celular) brasileiro.
 */
export function formatarTelefone(tel) {
  if (!tel) return '—'
  const d = String(tel).replace(/\D/g, '')
  if (d.length === 11) {
    return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (d.length === 10) {
    return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return tel
}

/**
 * Aplica mascara visual de chave de acesso (blocos de 4).
 */
export function formatarChaveAcesso(chave) {
  if (!chave) return '—'
  const d = String(chave).replace(/\D/g, '').slice(0, 44)
  return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

/**
 * Mascara de CEP.
 */
export function formatarCep(cep) {
  if (!cep) return '—'
  const d = String(cep).replace(/\D/g, '').slice(0, 8)
  return d.replace(/(\d{5})(\d{0,3})/, (_, p1, p2) => (p2 ? `${p1}-${p2}` : p1))
}
