<template>
  <div>
    <PageHeader titulo="Meu cadastro" descricao="Mantenha seus dados de contato atualizados." />

    <LoadingState v-if="carregando" texto="Carregando seus dados..." />

    <template v-else-if="cliente.id">
      <!-- Dados fiscais (nao editaveis) -->
      <div class="card mb-4">
        <div class="card-header fw-semibold">Dados cadastrais</div>
        <div class="card-body">
          <div class="kv-list">
            <div class="kv-row">
              <span class="kv-key">{{ cliente.tipoPessoa === 'JURIDICA' ? 'Razão social' : 'Nome' }}</span>
              <span class="kv-value">{{ cliente.nome || '—' }}</span>
            </div>
            <div v-if="cliente.nomeFantasia" class="kv-row">
              <span class="kv-key">Nome fantasia</span>
              <span class="kv-value">{{ cliente.nomeFantasia }}</span>
            </div>
            <div class="kv-row">
              <span class="kv-key">{{ cliente.tipoPessoa === 'JURIDICA' ? 'CNPJ' : 'CPF' }}</span>
              <span class="kv-value">{{ formatarDocumento(cliente.documento) }}</span>
            </div>
            <div class="kv-row">
              <span class="kv-key">E-mail de login</span>
              <span class="kv-value">{{ cliente.email || '—' }}</span>
            </div>
            <div v-if="cliente.inscricaoMunicipal" class="kv-row">
              <span class="kv-key">Inscrição municipal</span>
              <span class="kv-value">{{ cliente.inscricaoMunicipal }}</span>
            </div>
          </div>
          <p class="text-muted-2 mt-3 mb-0" style="font-size: var(--text-xs)">
            <span v-html="ICONE_CADEADO"></span>
            Dados fiscais e de login são protegidos. Para alterá-los, entre em contato com o suporte.
          </p>
        </div>
      </div>

      <!-- Dados editaveis -->
      <form novalidate @submit.prevent="salvar">
        <div class="card mb-4">
          <div class="card-header fw-semibold">Contato</div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <label for="telefone" class="form-label">Telefone</label>
                <input
                  id="telefone"
                  v-model="form.telefone"
                  type="tel"
                  class="form-control"
                  :class="{ 'is-invalid': tentou && erros.telefone }"
                  placeholder="(00) 00000-0000"
                />
                <div v-if="tentou && erros.telefone" class="invalid-feedback">{{ erros.telefone }}</div>
              </div>
              <div class="col-12 col-md-6">
                <label for="emailFiscal" class="form-label">E-mail fiscal</label>
                <input
                  id="emailFiscal"
                  v-model.trim="form.emailFiscal"
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': tentou && erros.emailFiscal }"
                  placeholder="contato@suaempresa.com.br"
                />
                <div v-if="tentou && erros.emailFiscal" class="invalid-feedback">{{ erros.emailFiscal }}</div>
                <div class="form-text">E-mail usado para receber as notas fiscais.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-header fw-semibold">Endereço</div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-12 col-md-4">
                <label for="cep" class="form-label">CEP</label>
                <input id="cep" v-model="form.endereco.cep" type="text" class="form-control" placeholder="00000-000" />
              </div>
              <div class="col-12 col-md-6">
                <label for="logradouro" class="form-label">Logradouro</label>
                <input id="logradouro" v-model="form.endereco.logradouro" type="text" class="form-control" placeholder="Rua, avenida..." />
              </div>
              <div class="col-12 col-md-2">
                <label for="numero" class="form-label">Número</label>
                <input id="numero" v-model="form.endereco.numero" type="text" class="form-control" />
              </div>
              <div class="col-12 col-md-6">
                <label for="complemento" class="form-label">Complemento</label>
                <input id="complemento" v-model="form.endereco.complemento" type="text" class="form-control" />
              </div>
              <div class="col-12 col-md-6">
                <label for="bairro" class="form-label">Bairro</label>
                <input id="bairro" v-model="form.endereco.bairro" type="text" class="form-control" />
              </div>
              <div class="col-12 col-md-8">
                <label for="municipio" class="form-label">Município</label>
                <input id="municipio" v-model="form.endereco.municipio" type="text" class="form-control" />
              </div>
              <div class="col-12 col-md-4">
                <label for="uf" class="form-label">UF</label>
                <input id="uf" v-model="form.endereco.uf" type="text" maxlength="2" class="form-control" placeholder="SP" />
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-outline-secondary" @click="resetar">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="salvando">
            <span v-if="salvando" class="spinner-border spinner-border-sm me-2"></span>
            {{ salvando ? 'Salvando...' : 'Salvar alterações' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script>
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { obterMe, atualizarMe } from '@/api/cliente.service'
import { formatarDocumento } from '@/utils/formatters'
import { validarEmail, validarCep } from '@/utils/validators'
import { mensagemDeErro } from '@/api/http'

const ICONE_CADEADO =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'

export default {
  name: 'MeuCadastroView',
  components: { PageHeader, LoadingState },
  data() {
    return {
      carregando: true,
      salvando: false,
      tentou: false,
      cliente: {},
      form: this.formVazio(),
      erros: { telefone: '', emailFiscal: '' },
      ICONE_CADEADO
    }
  },
  mounted() {
    this.carregar()
  },
  methods: {
    formatarDocumento,
    formVazio() {
      return {
        telefone: '',
        emailFiscal: '',
        endereco: {
          cep: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          municipio: '',
          uf: '',
          codigoMunicipioIbge: ''
        }
      }
    },
    preencherForm(cliente) {
      const e = cliente.endereco || {}
      this.form = {
        telefone: cliente.telefone || '',
        emailFiscal: cliente.emailFiscal || '',
        endereco: {
          cep: e.cep || '',
          logradouro: e.logradouro || '',
          numero: e.numero || '',
          complemento: e.complemento || '',
          bairro: e.bairro || '',
          municipio: e.municipio || '',
          uf: e.uf || '',
          codigoMunicipioIbge: e.codigoMunicipioIbge || ''
        }
      }
    },
    async carregar() {
      this.carregando = true
      try {
        this.cliente = await obterMe()
        this.$store.commit('auth/SET_USER', this.cliente)
        this.preencherForm(this.cliente)
      } catch (erro) {
        this.$toast('error', 'Erro ao carregar cadastro', mensagemDeErro(erro))
      } finally {
        this.carregando = false
      }
    },
    validar() {
      this.erros = { telefone: '', emailFiscal: '' }
      let ok = true
      if (this.form.emailFiscal && !validarEmail(this.form.emailFiscal)) {
        this.erros.emailFiscal = 'Informe um e-mail fiscal válido.'
        ok = false
      }
      if (this.form.endereco.cep && !validarCep(this.form.endereco.cep)) {
        // Aviso, mas nao bloqueia (campo opcional)
        this.form.endereco.cep = this.form.endereco.cep.replace(/\D/g, '')
      }
      return ok
    },
    async salvar() {
      this.tentou = true
      if (!this.validar()) return

      // Monta payload apenas com campos editaveis (conforme contrato)
      const payload = {
        telefone: this.form.telefone || null,
        emailFiscal: this.form.emailFiscal || null,
        endereco: { ...this.form.endereco }
      }

      this.salvando = true
      try {
        const atualizado = await atualizarMe(payload)
        this.cliente = { ...this.cliente, ...atualizado }
        this.$store.commit('auth/SET_USER', this.cliente)
        this.preencherForm(this.cliente)
        this.$toast('success', 'Dados atualizados', 'Suas informações foram salvas com sucesso.')
      } catch (erro) {
        const status = erro?.response?.status
        let msg = mensagemDeErro(erro)
        if (status === 400) msg = msg || 'Verifique os dados informados.'
        this.$toast('error', 'Não foi possível salvar', msg)
      } finally {
        this.salvando = false
      }
    },
    resetar() {
      this.preencherForm(this.cliente)
      this.tentou = false
      this.erros = { telefone: '', emailFiscal: '' }
    }
  }
}
</script>
