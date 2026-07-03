/* =========================================================================
   Mapeamento de status (cobranca/nota/pagamento) -> classe visual de badge
   Padronizado em success / warning / error / neutral (tokens do design-system)
   ========================================================================= */

/**
 * Normaliza um status para chave de comparacao (sem acento, lowercase, sem espacos).
 */
function norm(status) {
  return String(status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Mapeia status de COBRANCA para classe do badge.
 * Tokens: success (pago) | warning (pendente/vencendo) | error (vencido/cancelado) | neutral
 */
export function classeStatusCobranca(status) {
  const s = norm(status)
  if (['pago', 'paga', 'liquidada', 'quitada', 'aprovado'].includes(s)) return 'is-success'
  if (['cancelado', 'cancelada', 'estornada', 'recusado', 'recusada', 'expirado', 'expirada'].includes(s)) {
    return 'is-error'
  }
  if (['vencido', 'vencida', 'atrasado', 'atrasada', 'em_atraso'].includes(s)) return 'is-error'
  if (['pendente', 'aguardando', 'aberto', 'aberta', 'a_vencer', 'em_aberto', 'processando'].includes(s)) {
    return 'is-warning'
  }
  return 'is-neutral'
}

/**
 * Mapeia status de NFS-e para classe do badge.
 */
export function classeStatusNota(status) {
  const s = norm(status)
  if (['autorizada', 'aprovada', 'processada', 'emitida'].includes(s)) return 'is-success'
  if (['cancelada', 'rejeitada', 'invalida'].includes(s)) return 'is-error'
  if (['pendente', 'processando', 'aguardando', 'em_processamento', 'rascunho'].includes(s)) {
    return 'is-warning'
  }
  return 'is-neutral'
}

/**
 * Mapeia status de PAGAMENTO para classe do badge.
 */
export function classeStatusPagamento(status) {
  const s = norm(status)
  if (['aprovado', 'aprovada', 'capturado', 'capturada', 'pago', 'paga', 'sucesso', 'confirmado', 'confirmada'].includes(s)) {
    return 'is-success'
  }
  if (['recusado', 'recusada', 'falhou', 'falha', 'estornado', 'estornada', 'cancelado', 'cancelada', 'chargeback'].includes(s)) {
    return 'is-error'
  }
  if (['pendente', 'processando', 'aguardando', 'em_analise', 'autorizado', 'autorizada'].includes(s)) {
    return 'is-warning'
  }
  return 'is-neutral'
}

/**
 * Mapeia status de ASSINATURA para classe do badge.
 */
export function classeStatusAssinatura(status) {
  const s = norm(status)
  if (['ativo', 'ativa', 'vigente', 'em_aberto', 'confirmada', 'paga'].includes(s)) return 'is-success'
  if (['cancelado', 'cancelada', 'expirado', 'expirada', 'encerrado', 'encerrada'].includes(s)) return 'is-error'
  if (['suspenso', 'suspensa', 'bloqueado', 'bloqueada', 'atraso', 'em_atraso', 'trial', 'em_trial'].includes(s)) {
    return 'is-warning'
  }
  if (['pendente', 'aguardando', 'processando', 'aguardando_pagamento'].includes(s)) return 'is-warning'
  return 'is-neutral'
}

/**
 * Devolve um rotulo amigavel para o status (capitalizado).
 */
export function rotuloStatus(status) {
  if (!status) return '—'
  const s = String(status)
  // Trata casos com underscore: "a_vencer" -> "A vencer"
  return s
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (m) => m.toUpperCase())
}
