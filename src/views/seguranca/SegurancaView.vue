<template>
  <div>
    <PageHeader titulo="Segurança" descricao="Gerencie sua senha de acesso e sessão." />

    <div class="row g-4">
      <!-- Alterar senha -->
      <div class="col-12 col-lg-8">
        <div class="card h-100">
          <div class="card-header fw-semibold">Alterar senha</div>
          <div class="card-body">
            <form novalidate @submit.prevent="trocar">
              <div class="row g-3">
                <div class="col-12">
                  <label for="senhaAtual" class="form-label">Senha atual</label>
                  <div class="input-group">
                    <input
                      id="senhaAtual"
                      v-model="senhaAtual"
                      :type="exibir1 ? 'text' : 'password'"
                      class="form-control"
                      autocomplete="current-password"
                      placeholder="Sua senha atual"
                    />
                    <button class="btn input-toggle" type="button" @click="exibir1 = !exibir1" :aria-label="exibir1 ? 'Ocultar senha' : 'Exibir senha'">
                      <span v-if="!exibir1" v-html="ICONE_OLHO"></span>
                      <span v-else v-html="ICONE_OLHO_OFF"></span>
                    </button>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label for="novaSenha" class="form-label">Nova senha</label>
                  <div class="input-group">
                    <input
                      id="novaSenha"
                      v-model="novaSenha"
                      :type="exibir2 ? 'text' : 'password'"
                      class="form-control"
                      :class="{ 'is-invalid': tentou && erro.senha }"
                      autocomplete="new-password"
                      placeholder="Mínimo 10 caracteres"
                    />
                    <button class="btn input-toggle" type="button" @click="exibir2 = !exibir2" :aria-label="exibir2 ? 'Ocultar senha' : 'Exibir senha'">
                      <span v-if="!exibir2" v-html="ICONE_OLHO"></span>
                      <span v-else v-html="ICONE_OLHO_OFF"></span>
                    </button>
                  </div>
                  <div v-if="tentou && erro.senha" class="invalid-feedback d-block">{{ erro.senha }}</div>
                </div>

                <div class="col-12 col-md-6">
                  <label for="confirmacao" class="form-label">Confirmar nova senha</label>
                  <input
                    id="confirmacao"
                    v-model="confirmacao"
                    :type="exibir2 ? 'text' : 'password'"
                    class="form-control"
                    :class="{ 'is-invalid': tentou && erro.confirmacao }"
                    autocomplete="new-password"
                    placeholder="Repita a nova senha"
                  />
                  <div v-if="tentou && erro.confirmacao" class="invalid-feedback d-block">{{ erro.confirmacao }}</div>
                </div>
              </div>

              <div class="regras mt-4">
                <p class="regras-titulo mb-2">Sua senha deve ter:</p>
                <div class="d-flex flex-wrap gap-2">
                  <span class="regra-chip" :class="{ ok: regras.tamanho }">10+ caracteres</span>
                  <span class="regra-chip" :class="{ ok: regras.letras }">Letras</span>
                  <span class="regra-chip" :class="{ ok: regras.numeros }">Números</span>
                </div>
              </div>

              <div class="mt-4">
                <button type="submit" class="btn btn-primary" :disabled="enviando">
                  <span v-if="enviando" class="spinner-border spinner-border-sm me-2"></span>
                  {{ enviando ? 'Atualizando...' : 'Atualizar senha' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Encerrar sessao -->
      <div class="col-12 col-lg-4">
        <div class="card h-100">
          <div class="card-header fw-semibold">Encerrar sessão</div>
          <div class="card-body d-flex flex-column justify-content-between gap-3">
            <p class="mb-0 text-muted-2" style="font-size: var(--text-sm)">
              Saia da conta neste dispositivo. Você precisará fazer login novamente para acessar sua área.
            </p>
            <button class="btn btn-outline-danger" type="button" @click="sair">Sair da conta</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from '@/components/ui/PageHeader.vue'
import { trocarSenha } from '@/api/auth.service'
import { validarSenha } from '@/utils/validators'
import { mensagemDeErro } from '@/api/http'

const ICONE_OLHO =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
const ICONE_OLHO_OFF =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.6 19.6 0 0 1 4.22-5.39M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.7 19.7 0 0 1-2.16 3.19M1 1l22 22"/><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/></svg>'

export default {
  name: 'SegurancaView',
  components: { PageHeader },
  data() {
    return {
      senhaAtual: '',
      novaSenha: '',
      confirmacao: '',
      exibir1: false,
      exibir2: false,
      enviando: false,
      tentou: false,
      erro: { senha: '', confirmacao: '' },
      ICONE_OLHO,
      ICONE_OLHO_OFF
    }
  },
  computed: {
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
      if (!this.senhaAtual) {
        this.$toast('warning', 'Informe a senha atual', 'Confirme sua senha atual para continuar.')
        return
      }
      if (!this.validar()) return
      this.enviando = true
      try {
        // A API troca a senha a partir do token; a senha atual e apenas uma
        // confirmacao adicional de UX (nao enviada, conforme contrato).
        await trocarSenha(this.novaSenha, this.confirmacao)
        this.$toast('success', 'Senha atualizada', 'Sua senha foi alterada com sucesso.')
        this.senhaAtual = ''
        this.novaSenha = ''
        this.confirmacao = ''
        this.tentou = false
      } catch (erro) {
        const status = erro?.response?.status
        let msg = mensagemDeErro(erro)
        if (status === 400) msg = msg || 'A nova senha não atende aos requisitos.'
        else if (status === 401) msg = 'Sessão expirada. Faça login novamente.'
        this.$toast('error', 'Não foi possível atualizar a senha', msg)
      } finally {
        this.enviando = false
      }
    },
    async sair() {
      const ok = await this.$confirm({
        title: 'Sair da conta?',
        text: 'Você precisará fazer login novamente para acessar sua área.',
        confirmButtonText: 'Sair',
        cancelButtonText: 'Cancelar',
        icon: 'question'
      })
      if (!ok) return
      this.$store.dispatch('auth/logout')
      this.$router.push({ name: 'login' })
    }
  }
}
</script>

<style scoped>
.regras {
  background: var(--surface-hover);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
}
.regras-titulo {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}
.regra-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px var(--space-3);
  border-radius: var(--radius-full);
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.regra-chip::before {
  content: '○';
  color: var(--text-muted);
}
.regra-chip.ok {
  color: var(--status-success);
  border-color: rgba(25, 135, 84, 0.4);
  background: rgba(25, 135, 84, 0.08);
}
.regra-chip.ok::before {
  content: '✓';
  color: var(--status-success);
  font-weight: var(--font-bold);
}
</style>
