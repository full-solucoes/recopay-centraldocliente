<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-3 gap-2 flex-wrap">
      <select v-model="filtroStatus" class="form-select form-select-sm" style="width: auto" @change="recarregar">
        <option value="">Todos os status</option>
        <option value="aprovado">Aprovado</option>
        <option value="pendente">Pendente</option>
        <option value="recusado">Recusado</option>
        <option value="estornado">Estornado</option>
      </select>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <LoadingState v-if="carregando" texto="Carregando pagamentos..." />
        <EmptyState
          v-else-if="!itens.length"
          titulo="Nenhum pagamento nesta assinatura"
          descricao="O histórico de pagamentos do plano aparecerá aqui."
        />
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Competência</th>
                <th>Método</th>
                <th class="text-end">Valor</th>
                <th>Status</th>
                <th class="text-end">Comprovante</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in itens" :key="p.id">
                <td>{{ formatarData(p.dataCaptura || p.dataAutorizacao || p.dataCriacao) }}</td>
                <td>{{ formatarCompetencia(p.competenciaCobranca) }}</td>
                <td>
                  <div class="fw-semibold" style="color: var(--text-primary)">{{ p.metodo || p.gateway || 'Pagamento' }}</div>
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
      <div v-if="!carregando && itens.length" class="card-footer bg-transparent">
        <PaginationBar :pagina="pagina" :tamanho-pagina="tamanhoPagina" :total="total" @mudar="mudarPagina" />
      </div>
    </div>
  </div>
</template>

<script>
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'
import { listarPagamentosPorAssinatura } from '@/api/assinaturas.service'
import { formatarMoeda, formatarData, formatarCompetencia } from '@/utils/formatters'
import { classeStatusPagamento } from '@/utils/status-map'
import { mensagemDeErro } from '@/api/http'

export default {
  name: 'TabelaPagamentosAssinatura',
  components: { StatusBadge, LoadingState, EmptyState, PaginationBar },
  props: {
    assinaturaId: { type: [String, Number], required: true }
  },
  data() {
    return {
      carregando: false,
      carregado: false,
      itens: [],
      pagina: 1,
      tamanhoPagina: 10,
      total: 0,
      filtroStatus: ''
    }
  },
  methods: {
    formatarMoeda,
    formatarData,
    formatarCompetencia,
    classeStatusPagamento,
    async carregar() {
      this.carregando = true
      try {
        const dados = await listarPagamentosPorAssinatura(this.assinaturaId, {
          status: this.filtroStatus || undefined,
          pagina: this.pagina,
          tamanhoPagina: this.tamanhoPagina
        })
        this.itens = dados.itens || []
        this.total = dados.total || 0
        this.pagina = dados.pagina || this.pagina
        this.$emit('count', this.total)
      } catch (erro) {
        this.$toast('error', 'Erro ao carregar pagamentos', mensagemDeErro(erro))
        this.itens = []
      } finally {
        this.carregando = false
        this.carregado = true
      }
    },
    recarregar() {
      this.pagina = 1
      this.carregar()
    },
    mudarPagina(p) {
      if (p < 1 || p === this.pagina) return
      this.pagina = p
      this.carregar()
    }
  }
}
</script>
