/* =========================================================================
   Validadores (senha, email, CPF/CNPJ)
   ========================================================================= */

/**
 * Regra da senha definitiva do cliente final:
 * - minimo 10 caracteres
 * - deve conter letras e numeros
 */
export function validarSenha(senha) {
  if (!senha || typeof senha !== 'string') {
    return { valido: false, mensagem: 'Informe a senha.' }
  }
  if (senha.length < 10) {
    return { valido: false, mensagem: 'A senha deve ter no minimo 10 caracteres.' }
  }
  if (!/[a-zA-Z]/.test(senha) || !/\d/.test(senha)) {
    return { valido: false, mensagem: 'A senha deve conter letras e numeros.' }
  }
  return { valido: true, mensagem: '' }
}

export function validarEmail(email) {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
}

export function validarCpf(cpf) {
  const d = String(cpf || '').replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(d[i], 10) * (10 - i)
  let dv1 = (soma * 10) % 11
  if (dv1 === 10) dv1 = 0
  if (dv1 !== parseInt(d[9], 10)) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(d[i], 10) * (11 - i)
  let dv2 = (soma * 10) % 11
  if (dv2 === 10) dv2 = 0
  return dv2 === parseInt(d[10], 10)
}

export function validarCnpj(cnpj) {
  const d = String(cnpj || '').replace(/\D/g, '')
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false
  const calc = (base) => {
    let soma = 0
    let pos = base.length - 7
    for (let i = 0; i < base.length; i++) {
      soma += parseInt(base[i], 10) * pos--
      if (pos < 2) pos = 9
    }
    const r = soma % 11
    return r < 2 ? 0 : 11 - r
  }
  const d1 = calc(d.substring(0, 12))
  const d2 = calc(d.substring(0, 12) + d1)
  return d1 === parseInt(d[12], 10) && d2 === parseInt(d[13], 10)
}

export function validarCpfOuCnpj(doc) {
  const d = String(doc || '').replace(/\D/g, '')
  if (d.length === 11) return validarCpf(d)
  if (d.length === 14) return validarCnpj(d)
  return false
}

export function validarCep(cep) {
  return /^\d{8}$/.test(String(cep || '').replace(/\D/g, ''))
}
