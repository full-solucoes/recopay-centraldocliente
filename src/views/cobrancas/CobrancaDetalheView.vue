<template>
  <div>
    <div class="d-flex align-items-center gap-2 mb-3">
      <button class="btn btn-ghost btn-sm" type="button" @click="$router.push({ name: 'cobrancas' })">
        <span v-html="ICONE_VOLTAR"></span> Voltar
      </button>
    </div>

    <LoadingState v-if="carregando" texto="Carregando cobrança..." />

    <div v-else-if="!cobranca.id">
      <EmptyState titulo="Cobrança não encontrada" descricao="O identificado informado é inválido ou não pertence à sua conta.">
        <template #action>
          <router-link :to="{ name: 'cobrancas' }" class="btn btn-outline-primary btn-sm">Ver cobranças</router-link>
        </template>
      </EmptyState>
    </div>

    <template v-else>
      <PageHeader :titulo="`Cobrança ${formatarCompetencia(cobranca.competencia)}`" descricao="Detalhes completos da cobrança.">
        <template #actions>
          <StatusBadge :status="cobranca.status" :classe="classeStatusCobranca(cobranca.status)" />
        </template>
      </PageHeader>

      <div class="row g-4">
        <div class="col-12 col-lg-7">
          <div class="card mb-4">
            <div class="card-header fw-semibold">Itens da cobrança</div>
            <div class="card-body p-0">
              <div v-if="!itens.length" class="p-4 text-muted-2" style="font-size: var(--text-sm)">
                Esta cobrança não possui itens detalhados.
              </div>
              <div v-else class="table-responsive">
                <table class="table item-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Descrição</th>
                      <th class="text-end">Qtd.</th>
                      <th class="text-end">Unitário</th>
                      <th class="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in itens" :key="item.id">
                      <td>
                        <div class="fw-semibold" style="color: var(--text-primary)">{{ item.descricao || item.codigo || 'Item' }}</div>
                        <small v-if="item.tipoItem" class="text-muted-2">{{ item.tipoItem }}</small>
                      </td>
                      <td class="text-end">{{ item.quantidade }} {{ item.unidade || '' }}</td>
                      <td class="text-end">{{ formatarMoeda(item.valorUnitario) }}</td>
                      <td class="text-end fw-semibold">{{ formatarMoeda(item.valorTotal) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="card">
            <div class="card-header fw-semibold">Resumo</div>
            <div class="card-body">
              <div class="kv-list">
                <div class="kv-row">
                  <span class="kv-key">Valor original</span>
                  <span class="kv-value">{{ formatarMoeda(cobranca.valorOriginal) }}</span>
                </div>
                <div v-if="Number(cobranca.valorDesconto)" class="kv-row">
                  <span class="kv-key">Desconto</span>
                  <span class="kv-value" style="color: var(--status-success)">- {{ formatarMoeda(cobranca.valorDesconto) }}</span>
                </div>
                <div v-if="Number(cobranca.valorMulta)" class="kv-row">
                  <span class="kv-key">Multa</span>
                  <span class="kv-value">+ {{ formatarMoeda(cobranca.valorMulta) }}</span>
                </div>
                <div v-if="Number(cobranca.valorJuros)" class="kv-row">
                  <span class="kv-key">Juros</span>
                  <span class="kv-value">+ {{ formatarMoeda(cobranca.valorJuros) }}</span>
                </div>
                <div class="kv-row" style="border: none">
                  <span class="kv-key fw-semibold" style="color: var(--text-primary)">Total</span>
                  <span class="kv-value" style="font-size: var(--text-lg)">{{ formatarMoeda(cobranca.valorTotal) }}</span>
                </div>
              </div>

              <hr />

              <div class="kv-list">
                <div v-if="cobranca.planoNome" class="kv-row">
                  <span class="kv-key">Plano</span>
                  <span class="kv-value">{{ cobranca.planoNome }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-key">Vencimento</span>
                  <span class="kv-value">{{ formatarData(cobranca.vencimento) }}</span>
                </div>
                <div class="kv-row">
                  <span class="kv-key">Competência</span>
                  <span class="kv-value">{{ formatarCompetencia(cobranca.competencia) }}</span>
                </div>
                <div v-if="cobranca.formaPagamento" class="kv-row">
                  <span class="kv-key">Forma de pagamento</span>
                  <span class="kv-value">{{ cobranca.formaPagamento }}</span>
                </div>
                <div v-if="cobranca.dataPagamento" class="kv-row">
                  <span class="kv-key">Pago em</span>
                  <span class="kv-value">{{ formatarData(cobranca.dataPagamento) }}</span>
                </div>
              </div>

              <div v-if="cobranca.checkoutUrl && podePagar" class="mt-4">
                <a :href="cobranca.checkoutUrl" target="_blank" rel="noopener noreferrer" class="btn btn-primary w-100">
                  Pagar agora (2ª via)
                </a>
                <p class="text-center text-muted-2 mt-2 mb-0" style="font-size: var(--text-xs)">
                  O pagamento é processado pelo RecoPay em ambiente seguro.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { obterCobranca } from '@/api/cobrancas.service'
import { formatarMoeda, formatarData, formatarCompetencia } from '@/utils/formatters'
import { classeStatusCobranca } from '@/utils/status-map'
import { mensagemDeErro } from '@/api/http'

const ICONE_VOLTAR =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>'

const STATUS_ABERTOS = ['pendente', 'aberto', 'a_vencer', 'em_aberto', 'aguardando', 'processando', 'vencido', 'vencida', 'atrasado', 'atrasada']

export default {
  name: 'CobrancaDetalheView',
  components: { PageHeader, StatusBadge, LoadingState, EmptyState },
  props: {
    id: { type: [String, Number], required: true }
  },
  data() {
    return {
      carregando: true,
      cobranca: {},
      ICONE_VOLTAR
    }
  },
  computed: {
    itens() {
      return this.cobranca.itens || []
    },
    podePagar() {
      const norm = String(this.cobranca.status || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      return STATUS_ABERTOS.includes(norm)
    }
  },
  mounted() {
    this.carregar()
  },
  methods: {
    formatarMoeda,
    formatarData,
    formatarCompetencia,
    classeStatusCobranca,
    async carregar() {
      this.carregando = true
      try {
        this.cobranca = await obterCobranca(this.id)
      } catch (erro) {
        const status = erro?.response?.status
        if (status === 404) {
          this.cobranca = {}
        } else {
          this.$toast('error', 'Erro ao carregar cobrança', mensagemDeErro(erro))
          this.cobranca = {}
        }
      } finally {
        this.carregando = false
      }
    }
  }
}
</script>
