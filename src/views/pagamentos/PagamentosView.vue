<template>
  <div>
    <PageHeader titulo="Pagamentos" descricao="Histórico dos seus pagamentos.">
      <template #actions>
        <select v-model="filtroStatus" class="form-select form-select-sm" style="width: auto" @change="mudarFiltro">
          <option value="">Todos os status</option>
          <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </template>
    </PageHeader>

    <div class="card">
      <div class="card-body p-0">
        <LoadingState v-if="carregando" texto="Carregando pagamentos..." />
        <EmptyState
          v-else-if="!pagamentos.length"
          titulo="Nenhum pagamento encontrado"
          descricao="Seu histórico de pagamentos aparecerá aqui."
        />
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Competência</th>
                <th>Plano</th>
                <th>Método</th>
                <th class="text-end">Valor</th>
                <th>Status</th>
                <th class="text-end">Comprovante</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in pagamentos" :key="p.id">
                <td>{{ formatarData(p.dataCaptura || p.dataAutorizacao || p.dataCriacao) }}</td>
                <td>{{ formatarCompetencia(p.competenciaCobranca) }}</td>
                <td>{{ p.planoNome || '—' }}</td>
                <td>
                  <div class="fw-semibold" style="color: var(--text-primary)">{{ metodoLabel(p) }}</div>
                  <small v-if="p.cartaoBandeira" class="text-muted-2">
                    {{ p.cartaoBandeira }}{{ p.cartaoUltimosDigitos ? ` ••${p.cartaoUltimosDigitos}` : '' }}
                  </small>
                </td>
                <td class="text-end fw-semibold">{{ formatarMoeda(p.valor) }}</td>
                <td><StatusBadge :status="p.status" :classe="classeStatusPagamento(p.status)" /></td>
                <td class="text-end">
                  <a
                    v-if="p.checkoutUrl"
                    :href="p.checkoutUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-sm btn-outline-primary"
                  >
                    Abrir
                  </a>
                  <span v-else class="text-muted-2" style="font-size: var(--text-xs)">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="!carregando && pagamentos.length" class="card-footer bg-transparent">
        <PaginationBar :pagina="pagina" :tamanho-pagina="tamanhoPagina" :total="total" @mudar="mudarPagina" />
      </div>
    </div>
  </div>
</template>

<script>
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'
import { listarPagamentos } from '@/api/pagamentos.service'
import { formatarMoeda, formatarData, formatarCompetencia } from '@/utils/formatters'
import { classeStatusPagamento } from '@/utils/status-map'
import { mensagemDeErro } from '@/api/http'

export default {
  name: 'PagamentosView',
  components: { PageHeader, StatusBadge, LoadingState, EmptyState, PaginationBar },
  data() {
    return {
      carregando: true,
      pagamentos: [],
      pagina: 1,
      tamanhoPagina: 20,
      total: 0,
      filtroStatus: '',
      statusOptions: [
        { value: 'aprovado', label: 'Aprovado' },
        { value: 'pendente', label: 'Pendente' },
        { value: 'recusado', label: 'Recusado' },
        { value: 'estornado', label: 'Estornado' }
      ]
    }
  },
  mounted() {
    this.carregar()
  },
  methods: {
    formatarMoeda,
    formatarData,
    formatarCompetencia,
    classeStatusPagamento,
    metodoLabel(p) {
      if (p.metodo) return p.metodo
      if (p.gateway) return p.gateway
      return 'Pagamento'
    },
    async carregar() {
      this.carregando = true
      try {
        const dados = await listarPagamentos({
          status: this.filtroStatus || undefined,
          pagina: this.pagina,
          tamanhoPagina: this.tamanhoPagina
        })
        this.pagamentos = dados.itens || []
        this.total = dados.total || 0
        this.pagina = dados.pagina || this.pagina
        this.tamanhoPagina = dados.tamanhoPagina || this.tamanhoPagina
      } catch (erro) {
        this.$toast('error', 'Erro ao carregar pagamentos', mensagemDeErro(erro))
        this.pagamentos = []
      } finally {
        this.carregando = false
      }
    },
    mudarPagina(p) {
      if (p < 1 || p === this.pagina) return
      this.pagina = p
      this.carregar()
    },
    mudarFiltro() {
      this.pagina = 1
      this.carregar()
    }
  }
}
</script>
