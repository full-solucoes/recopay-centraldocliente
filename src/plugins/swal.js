import Swal from 'sweetalert2'

/**
 * Plugins de feedback do RecoPay.
 * Padrao oficial: SweetAlert2 com tema RecoPay. Nao usar alert/confirm/prompt nativos.
 * Wrappers expostos globalmente (window.recopay*) e como export nomeado.
 */

const TIMER_TOAST = 4000

const TOAST = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: TIMER_TOAST,
  timerProgressBar: true,
  didOpen: (el) => {
    el.addEventListener('mouseenter', Swal.stopTimer)
    el.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

const CONFIRM = Swal.mixin({
  showCancelButton: true,
  reverseButtons: true,
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
  confirmButtonColor: '#7B1FA2',
  cancelButtonColor: '#FFFFFF',
  focusCancel: true
})

const ALERT = Swal.mixin({
  confirmButtonText: 'Entendi',
  confirmButtonColor: '#7B1FA2'
})

/**
 * Toast nao bloqueante no canto superior direito.
 * @param {'success'|'error'|'warning'|'info'} tipo
 * @param {string} titulo
 * @param {string} [mensagem]
 */
export function recopayToast(tipo, titulo, mensagem) {
  const icon = ['success', 'error', 'warning', 'info'].includes(tipo) ? tipo : 'info'
  return TOAST.fire({
    icon,
    title: titulo,
    text: mensagem || undefined,
    html: undefined
  })
}

/**
 * Confirmacao para acoes destrutivas/irreversiveis.
 * @param {{title:string,text?:string,confirmButtonText?:string,cancelButtonText?:string,icon?:'warning'|'error'|'question'}} opts
 * @returns {Promise<boolean>} true se confirmado
 */
export async function recopayConfirm(opts = {}) {
  const result = await CONFIRM.fire({
    title: opts.title,
    text: opts.text,
    html: opts.html,
    icon: opts.icon || 'warning',
    confirmButtonText: opts.confirmButtonText || 'Confirmar',
    cancelButtonText: opts.cancelButtonText || 'Cancelar'
  })
  return result.isConfirmed
}

/**
 * Mensagem bloqueante.
 * @param {'success'|'error'|'warning'|'info'} tipo
 * @param {string} titulo
 * @param {string} [mensagem]
 */
export function recopayAlert(tipo, titulo, mensagem) {
  const icon = ['success', 'error', 'warning', 'info'].includes(tipo) ? tipo : 'info'
  return ALERT.fire({
    icon,
    title: titulo,
    text: mensagem || undefined
  })
}

/**
 * Entrada simples de dados em popup.
 * @param {{title:string,inputLabel?:string,inputPlaceholder?:string,inputType?:string}} opts
 * @returns {Promise<string|null>} valor digitado ou null se cancelado
 */
export async function recopayPrompt(opts = {}) {
  const result = await Swal.fire({
    title: opts.title,
    input: opts.inputType || 'text',
    inputLabel: opts.inputLabel,
    inputPlaceholder: opts.inputPlaceholder,
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#7B1FA2',
    cancelButtonColor: '#FFFFFF'
  })
  return result.isConfirmed ? result.value : null
}

export default {
  install(app) {
    // Disponibiliza wrappers globalmente para uso direto (conforme design-system).
    app.config.globalProperties.$toast = recopayToast
    app.config.globalProperties.$confirm = recopayConfirm
    app.config.globalProperties.$alert = recopayAlert
    app.config.globalProperties.$prompt = recopayPrompt

    // Globais no window (para uso em servicos fora do contexto Vue).
    if (typeof window !== 'undefined') {
      window.recopayToast = recopayToast
      window.recopayConfirm = recopayConfirm
      window.recopayAlert = recopayAlert
      window.recopayPrompt = recopayPrompt
    }
  }
}
