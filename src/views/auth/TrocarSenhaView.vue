<template>
  <form novalidate @submit.prevent="trocar">
    <div v-if="obrigatoria" class="alert-info-box">
      <span class="alert-info-icon" v-html="ICONE_INFO"></span>
      <div>
        <p class="fw-semibold mb-1" style="color: var(--text-primary)">Troca de senha obrigatória</p>
        <p class="mb-0" style="font-size: var(--text-sm); color: var(--text-secondary)">
          Defina uma senha definitiva para concluir seu acesso.
        </p>
      </div>
    </div>

    <div class="mb-3">
      <label for="novaSenha" class="form-label">Nova senha</label>
      <div class="input-group">
        <input
          id="novaSenha"
          v-model="novaSenha"
          :type="exibir ? 'text' : 'password'"
          class="form-control"
          :class="{ 'is-invalid': tentou && erro.senha }"
          autocomplete="new-password"
          placeholder="Mínimo 10 caracteres, com letras e números"
        />
        <button class="btn input-toggle" type="button" @click="exibir = !exibir" :aria-label="exibir ? 'Ocultar senha' : 'Exibir senha'">
          <span v-if="!exibir" v-html="ICONE_OLHO"></span>
          <span v-else v-html="ICONE_OLHO_OFF"></span>
        </button>
      </div>
      <div v-if="tentou && erro.senha" class="invalid-feedback d-block">{{ erro.senha }}</div>
    </div>

    <div class="mb-3">
      <label for="confirmacao" class="form-label">Confirmar senha</label>
      <input
        id="confirmacao"
        v-model="confirmacao"
        :type="exibir ? 'text' : 'password'"
        class="form-control"
        :class="{ 'is-invalid': tentou && erro.confirmacao }"
        autocomplete="new-password"
        placeholder="Repita a nova senha"
      />
      <div v-if="tentou && erro.confirmacao" class="invalid-feedback d-block">{{ erro.confirmacao }}</div>
    </div>

    <div class="regras">
      <p class="regras-titulo">Sua senha deve ter:</p>
      <ul class="regras-lista">
        <li :class="{ ok: regras.tamanho }">Mínimo de 10 caracteres</li>
        <li :class="{ ok: regras.letras }">Letras</li>
        <li :class="{ ok: regras.numeros }">Números</li>
      </ul>
    </div>

    <button type="submit" class="btn btn-primary w-100 mt-2" :disabled="enviando">
      <span v-if="enviando" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      {{ enviando ? 'Salvando...' : 'Definir nova senha' }}
    </button>
  </form>
</template>

<script>
import { validarSenha } from '@/utils/validators'
import { mensagemDeErro } from '@/api/http'

const ICONE_OLHO =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
const ICONE_OLHO_OFF =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.6 19.6 0 0 1 4.22-5.39M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.7 19.7 0 0 1-2.16 3.19M1 1l22 22"/><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/></svg>'
const ICONE_INFO =
  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'

export default {
  name: 'TrocarSenhaView',
  data() {
    return {
      novaSenha: '',
      confirmacao: '',
      exibir: false,
      enviando: false,
      tentou: false,
      erro: { senha: '', confirmacao: '' },
      ICONE_OLHO,
      ICONE_OLHO_OFF,
      ICONE_INFO
    }
  },
  computed: {
    obrigatoria() {
      return this.$store.getters['auth/precisaTrocarSenha']
    },
    regras() {
      const s = this.novaSenha || ''
      return {
        tamanho: s.length >= 10,
        letras: /[a-zA-Z]/.test(s),
        numeros: /\d/.test(s)
      }
    }
  },
  methods: {
    validar() {
      const r = validarSenha(this.novaSenha)
      this.erro.senha = r.valido ? '' : r.mensagem
      if (!this.confirmacao) {
        this.erro.confirmacao = 'Confirme a nova senha.'
      } else if (this.confirmacao !== this.novaSenha) {
        this.erro.confirmacao = 'As senhas não coincidem.'
      } else {
        this.erro.confirmacao = ''
      }
      return !this.erro.senha && !this.erro.confirmacao
    },
    async trocar() {
      this.tentou = true
      if (!this.validar()) return
      this.enviando = true
      try {
        await this.$store.dispatch('auth/trocarSenha', {
          novaSenha: this.novaSenha,
          confirmacaoSenha: this.confirmacao
        })
        await this.$alert('success', 'Senha atualizada', 'Sua nova senha foi definida com sucesso.')
        this.$router.push({ name: 'login' })
      } catch (erro) {
        const status = erro?.response?.status
        let msg = mensagemDeErro(erro)
        if (status === 400) {
          msg = msg || 'A senha não atende aos requisitos mínimos.'
        } else if (status === 401) {
          msg = 'Sessão expirada. Faça login novamente.'
        }
        this.$toast('error', 'Não foi possível atualizar a senha', msg)
      } finally {
        this.enviando = false
      }
    }
  }
}
</script>

<style scoped>
.alert-info-box {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  background: rgba(123, 31, 162, 0.08);
  border: 1px solid rgba(123, 31, 162, 0.25);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}
.alert-info-icon {
  color: var(--action-primary);
  flex: none;
  margin-top: 2px;
}
.regras {
  background: var(--surface-hover);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
}
.regras-titulo {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
  font-weight: var(--font-medium);
}
.regras-lista {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.regras-lista li {
  position: relative;
  padding-left: var(--space-4);
  margin-bottom: 4px;
}
.regras-lista li::before {
  content: '○';
  position: absolute;
  left: 0;
}
.regras-lista li.ok {
  color: var(--status-success);
}
.regras-lista li.ok::before {
  content: '✓';
  font-weight: var(--font-bold);
}
</style>
