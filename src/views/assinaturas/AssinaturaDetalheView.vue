<template>
  <div>
    <div class="d-flex align-items-center gap-2 mb-3">
      <button class="btn btn-ghost btn-sm" type="button" @click="$router.push({ name: 'assinaturas' })">
        <span v-html="ICONE_VOLTAR"></span> Voltar
      </button>
    </div>

    <LoadingState v-if="carregando" texto="Carregando assinatura..." />

    <div v-else-if="!assinatura.id">
      <EmptyState titulo="Assinatura não encontrada" descricao="O identificador informado é inválido ou não pertence à sua conta.">
        <template #action>
          <router-link :to="{ name: 'assinaturas' }" class="btn btn-outline-primary btn-sm">Ver assinaturas</router-link>
        </template>
      </EmptyState>
    </div>

    <template v-else>
      <PageHeader :titulo="assinatura.planoNome || 'Assinatura'" :descricao="assinatura.produtoNome || ''">
        <template #actions>
          <StatusBadge :status="assinatura.status" :classe="classeStatusAssinatura(assinatura.status)" />
          <button
            v-if="podeCancelar"
            class="btn btn-sm btn-outline-danger ms-2"
            type="button"
            @click="abrirModalCancelamento"
          >
            Cancelar assinatura
          </button>
        </template>
      </PageHeader>

      <!-- Abas -->
      <ul class="nav nav-tabs mb-4" role="tablist">
        <li class="nav-item" v-for="aba in abas" :key="aba.id">
          <button
            class="nav-link"
            :class="{ active: abaAtiva === aba.id }"
            type="button"
            @click="selecionarAba(aba.id)"
          >
            {{ aba.label }}
            <span v-if="aba.count !== null" class="aba-count">{{ aba.count }}</span>
          </button>
        </li>
      </ul>

      <!-- Visão geral -->
      <div v-show="abaAtiva === 'visao'" class="row g-4">
        <div class="col-12 col-lg-7">
          <div class="card mb-4">
            <div class="card-header fw-semibold">Detalhes do plano</div>
            <div class="card-body">
              <div class="kv-list">
                <div class="kv-row">
                  <span class="kv-key">Plano</span>
                  <span class="kv-value">{{ assinatura.planoNome || '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-key">Produto</span>
                  <span class="kv-value">{{ assinatura.produtoNome || '—' }}</span>
                </div>
                <div v-if="assinatura.descricao" class="kv-row">
                  <span class="kv-key">Descrição</span>
                  <span class="kv-value">{{ assinatura.descricao }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-key">Valor atual</span>
                  <span class="kv-value">
                    {{ formatarMoeda(assinatura.valorAtual) }}
                    <span class="text-muted-2" style="font-size: var(--text-xs)">/ {{ rotuloPeriodicidade(assinatura) }}</span>
                  </span>
                </div>
                <div class="kv-row">
                  <span class="kv-key">Dia de vencimento</span>
                  <span class="kv-value">{{ assinatura.diaVencimento ? `Dia ${assinatura.diaVencimento}` : '—' }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-key">Forma de pagamento</span>
                  <span class="kv-value">{{ assinatura.formaPagamentoPreferencial || '—' }}</span>
                </div>
                <div v-if="assinatura.nfseModoEmissao" class="kv-row">
                  <span class="kv-key">Modo NFS-e</span>
                  <span class="kv-value">{{ assinatura.nfseModoEmissao }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="componentes.length" class="card">
            <div class="card-header fw-semibold">Componentes</div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table item-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th class="text-end">Qtd.</th>
                      <th class="text-end">Unitário</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="c in componentes" :key="c.id">
                      <td>
                        <div class="fw-semibold" style="color: var(--text-primary)">{{ c.descricao || c.codigo || 'Componente' }}</div>
                        <small v-if="c.tipoComponente" class="text-muted-2">{{ c.tipoComponente }}</small>
                      </td>
                      <td class="text-end">{{ c.quantidade }} {{ c.unidade || '' }}</td>
                      <td class="text-end">{{ formatarMoeda(c.valorUnitario) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="card">
            <div class="card-header fw-semibold">Cronograma e status</div>
            <div class="card-body">
              <div class="kv-list">
                <div class="kv-row">
                  <span class="kv-key">Status</span>
                  <span class="kv-value"><StatusBadge :status="assinatura.status" :classe="classeStatusAssinatura(assinatura.status)" /></span>
                </div>
                <div class="kv-row">
                  <span class="kv-key">Início</span>
                  <span class="kv-value">{{ formatarData(assinatura.dataInicio) }}</span>
                </div>
                <div v-if="assinatura.proximaCobrancaData" class="kv-row">
                  <span class="kv-key">Próxima cobrança</span>
                  <span class="kv-value">{{ formatarData(assinatura.proximaCobrancaData) }}</span>
                </div>
                <div v-if="assinatura.ultimaCobrancaData" class="kv-row">
                  <span class="kv-key">Última cobrança</span>
                  <span class="kv-value">{{ formatarData(assinatura.ultimaCobrancaData) }}</span>
                </div>
                <div v-if="assinatura.dataFim" class="kv-row">
                  <span class="kv-key">Término</span>
                  <span class="kv-value">{{ formatarData(assinatura.dataFim) }}</span>
                </div>
                <div v-if="assinatura.gateway" class="kv-row">
                  <span class="kv-key">Gateway</span>
                  <span class="kv-value">{{ assinatura.gateway }}</span>
                </div>
                <div v-if="assinatura.motivoCancelamento" class="kv-row">
                  <span class="kv-key">Motivo do cancelamento</span>
                  <span class="kv-value">{{ assinatura.motivoCancelamento }}</span>
                </div>
              </div>

              <div v-if="assinatura.proximaCobrancaData && podeCancelar" class="mt-4 p-3 rounded" style="background: rgba(212, 152, 75, 0.1); border: 1px solid rgba(212, 152, 75, 0.3)">
                <p class="mb-0 text-muted-2" style="font-size: var(--text-xs)">
                  <span v-html="ICONE_INFO"></span>
                  Ao cancelar, as cobranças futuras em aberto serão canceladas. As cobranças já pagas e notas emitidas permanecem disponíveis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Aba cobrancas -->
      <div v-show="abaAtiva === 'cobrancas'">
        <TabelaCobrancasAssinatura
          :assinatura-id="assinatura.id"
          ref="tabCobrancas"
          @count="(t) => atualizarCount('cobrancas', t)"
        />
      </div>

      <!-- Aba pagamentos -->
      <div v-show="abaAtiva === 'pagamentos'">
        <TabelaPagamentosAssinatura
          :assinatura-id="assinatura.id"
          ref="tabPagamentos"
          @count="(t) => atualizarCount('pagamentos', t)"
        />
      </div>

      <!-- Aba notas -->
      <div v-show="abaAtiva === 'notas'">
        <TabelaNotasAssinatura
          :assinatura-id="assinatura.id"
          ref="tabNotas"
          @count="(t) => atualizarCount('notas', t)"
        />
      </div>
    </template>

    <!-- Modal de cancelamento -->
    <div v-if="modalCancelamento" class="swal-backdrop" @click.self="fecharModalCancelamento">
      <div class="swal-modal-card">
        <div class="swal-modal-icon swal-modal-icon-error" v-html="ICONE_ALERTA"></div>
        <h3 class="swal-modal-title">Cancelar assinatura?</h3>
        <p class="swal-modal-text">
          Esta ação encerra a recorrência do plano <strong>{{ assinatura.planoNome }}</strong> e cancela cobranças futuras em aberto.
          Não pode ser desfeita.
        </p>
        <div class="mb-3 text-start">
          <label for="motivo" class="form-label">Motivo do cancelamento *</label>
          <textarea
            id="motivo"
            v-model="motivoCancelamento"
            class="form-control"
            :class="{ 'is-invalid': tentouCancelar && !motivoValido }"
            rows="3"
            placeholder="Informe o motivo (mínimo 5 caracteres)"
          ></textarea>
          <div v-if="tentouCancelar && !motivoValido" class="invalid-feedback d-block">
            Informe um motivo com pelo menos 5 caracteres.
          </div>
        </div>
        <div class="d-flex gap-2 justify-content-end">
          <button type="button" class="btn btn-outline-secondary" @click="fecharModalCancelamento" :disabled="cancelando">
            Cancelar
          </button>
          <button type="button" class="btn btn-danger" @click="confirmarCancelamento" :disabled="cancelando">
            <span v-if="cancelando" class="spinner-border spinner-border-sm me-2"></span>
            {{ cancelando ? 'Cancelando...' : 'Confirmar cancelamento' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import TabelaCobrancasAssinatura from '@/views/assinaturas/_TabelaCobrancasAssinatura.vue'
import TabelaPagamentosAssinatura from '@/views/assinaturas/_TabelaPagamentosAssinatura.vue'
import TabelaNotasAssinatura from '@/views/assinaturas/_TabelaNotasAssinatura.vue'
import { obterAssinatura, cancelarAssinatura } from '@/api/assinaturas.service'
import { formatarMoeda, formatarData } from '@/utils/formatters'
import { classeStatusAssinatura } from '@/utils/status-map'
import { mensagemDeErro } from '@/api/http'

const ICONE_VOLTAR =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>'
const ICONE_INFO =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
const ICONE_ALERTA =
  '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'

export default {
  name: 'AssinaturaDetalheView',
  components: {
    PageHeader,
    StatusBadge,
    LoadingState,
    EmptyState,
    TabelaCobrancasAssinatura,
    TabelaPagamentosAssinatura,
    TabelaNotasAssinatura
  },
  props: {
    id: { type: [String, Number], required: true }
  },
  data() {
    return {
      carregando: true,
      assinatura: {},
      abaAtiva: 'visao',
      // modal de cancelamento
      modalCancelamento: false,
      motivoCancelamento: '',
      tentouCancelar: false,
      cancelando: false,
      // contadores das abas (carregados sob demanda)
      counts: { cobrancas: null, pagamentos: null, notas: null },
      ICONE_VOLTAR,
      ICONE_INFO,
      ICONE_ALERTA
    }
  },
  computed: {
    componentes() {
      return this.assinatura.componentes || []
    },
    podeCancelar() {
      const s = String(this.assinatura.status || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      return ['ativo', 'ativa', 'vigente'].includes(s)
    },
    motivoValido() {
      return (this.motivoCancelamento || '').trim().length >= 5
    },
    abas() {
      return [
        { id: 'visao', label: 'Visão geral', count: null },
        { id: 'cobrancas', label: 'Cobranças', count: this.counts.cobrancas },
        { id: 'pagamentos', label: 'Pagamentos', count: this.counts.pagamentos },
        { id: 'notas', label: 'Notas fiscais', count: this.counts.notas }
      ]
    }
  },
  watch: {
    '$route.query.aba': {
      immediate: true,
      handler(v) {
        if (v && ['visao', 'cobrancas', 'pagamentos', 'notas'].includes(v)) {
          this.abaAtiva = v
        }
      }
    }
  },
  mounted() {
    this.carregar()
  },
  methods: {
    formatarMoeda,
    formatarData,
    classeStatusAssinatura,
    rotuloPeriodicidade(a) {
      const nome = (a.periodicidade || '').toLowerCase()
      const intervalo = a.periodicidadeIntervalo
      if (!nome) return 'período'
      const map = {
        mensal: intervalo > 1 ? `${intervalo} meses` : 'mês',
        anual: intervalo > 1 ? `${intervalo} anos` : 'ano',
        semanal: intervalo > 1 ? `${intervalo} semanas` : 'semana',
        diaria: intervalo > 1 ? `${intervalo} dias` : 'dia'
      }
      return map[nome] || nome
    },
    async carregar() {
      this.carregando = true
      try {
        this.assinatura = await obterAssinatura(this.id)
      } catch (erro) {
        const status = erro?.response?.status
        if (status === 404) {
          this.assinatura = {}
        } else {
          this.$toast('error', 'Erro ao carregar assinatura', mensagemDeErro(erro))
          this.assinatura = {}
        }
      } finally {
        this.carregando = false
      }
    },
    selecionarAba(aba) {
      this.abaAtiva = aba
      // carrega a aba sob demanda na primeira vez que e aberta
      this.$nextTick(() => {
        const ref = this.$refs[`tab${aba.charAt(0).toUpperCase() + aba.slice(1)}`]
        if (ref && typeof ref.carregar === 'function' && !ref.carregado) {
          ref.carregar()
        }
      })
    },
    atualizarCount(aba, total) {
      this.counts = { ...this.counts, [aba]: total }
    },
    abrirModalCancelamento() {
      this.modalCancelamento = true
      this.motivoCancelamento = ''
      this.tentouCancelar = false
    },
    fecharModalCancelamento() {
      if (this.cancelando) return
      this.modalCancelamento = false
    },
    async confirmarCancelamento() {
      this.tentouCancelar = true
      if (!this.motivoValido) return
      this.cancelando = true
      try {
        const resultado = await cancelarAssinatura(this.assinatura.id, this.motivoCancelamento.trim())
        this.modalCancelamento = false
        this.assinatura = { ...this.assinatura, status: resultado.status || 'cancelada', dataFim: resultado.dataFim, motivoCancelamento: resultado.motivoCancelamento || this.motivoCancelamento.trim() }

        let msg = 'Sua assinatura foi cancelada.'
        if (resultado.cobrancasCanceladas) {
          msg += ` ${resultado.cobrancasCanceladas} cobrança(s) futura(s) cancelada(s).`
        }
        await this.$alert('success', 'Assinatura cancelada', msg)

        // Recarrega as abas para refletir o novo status
        Object.values(this.$refs).forEach((ref) => {
          if (ref && typeof ref.carregar === 'function') ref.carregar()
        })
      } catch (erro) {
        const status = erro?.response?.status
        let msg = mensagemDeErro(erro)
        if (status === 400) msg = msg || 'Não foi possível cancelar. Verifique o motivo informado.'
        else if (status === 409) msg = 'Esta assinatura não pode ser cancelada (não está ativa).'
        else if (status === 404) msg = 'Assinatura não encontrada.'
        this.$toast('error', 'Falha ao cancelar', msg)
      } finally {
        this.cancelando = false
      }
    }
  }
}
</script>

<style scoped>
.nav-tabs {
  border-bottom-color: var(--border-default);
}
.nav-tabs .nav-link {
  color: var(--text-secondary);
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  padding: var(--space-3) var(--space-4);
  font-weight: var(--font-medium);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.nav-tabs .nav-link:hover {
  color: var(--action-primary);
  border-color: transparent;
}
.nav-tabs .nav-link.active {
  color: var(--action-primary);
  background: transparent;
  border-bottom-color: var(--action-primary);
}
.aba-count {
  display: inline-flex;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--surface-hover);
  color: var(--text-muted);
  font-size: var(--text-xxs);
  font-weight: var(--font-semibold);
}

/* Modal de cancelamento (estilo compativel com SweetAlert) */
.swal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}
.swal-modal-card {
  width: 100%;
  max-width: 480px;
  background: var(--surface-elevated);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--space-8);
  text-align: center;
  animation: swalPop 0.18s ease-out;
}
@keyframes swalPop {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.swal-modal-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-4);
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.swal-modal-icon-error {
  background: rgba(221, 59, 74, 0.12);
  color: var(--status-error);
}
.swal-modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}
.swal-modal-text {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin-bottom: var(--space-4);
}
</style>
