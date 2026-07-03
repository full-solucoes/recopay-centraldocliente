<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-3 gap-2 flex-wrap">
      <select v-model="filtroStatus" class="form-select form-select-sm" style="width: auto" @change="recarregar">
        <option value="">Todos os status</option>
        <option value="pendente">Pendente</option>
        <option value="pago">Pago</option>
        <option value="vencido">Vencido</option>
        <option value="cancelado">Cancelado</option>
      </select>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <LoadingState v-if="carregando" texto="Carregando cobranças..." />
        <EmptyState
          v-else-if="!itens.length"
          titulo="Nenhuma cobrança nesta assinatura"
          descricao="As cobranças geradas pelo plano aparecerão aqui."
        />
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Competência</th>
                <th>Vencimento</th>
                <th class="text-end">Valor</th>
                <th>Status</th>
                <th class="text-end">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="c in itens"
                :key="c.id"
                style="cursor: pointer"
                @click="abrirDetalhe(c.id)"
              >
                <td class="fw-semibold">{{ formatarCompetencia(c.competencia) }}</td>
                <td>{{ formatarData(c.vencimento) }}</td>
                <td class="text-end fw-semibold">{{ formatarMoeda(c.valorTotal) }}</td>
                <td><StatusBadge :status="c.status" :classe="classeStatusCobranca(c.status)" /></td>
                <td class="text-end" @click.stop>
                  <a
                    v-if="c.checkoutUrl && podePagar(c.status)"
                    :href="c.checkoutUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-sm btn-outline-primary"
                  >
                    Pagar
                  </a>
                  <button class="btn btn-sm btn-ghost" type="button" @click="abrirDetalhe(c.id)">Ver</button>
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
import { listarCobrancasPorAssinatura } from '@/api/assinaturas.service'
import { formatarMoeda, formatarData, formatarCompetencia } from '@/utils/formatters'
import { classeStatusCobranca } from '@/utils/status-map'
import { mensagemDeErro } from '@/api/http'

const STATUS_ABERTOS = ['pendente', 'aberto', 'a_vencer', 'em_aberto', 'aguardando', 'processando', 'vencido', 'vencida', 'atrasado', 'atrasada']

export default {
  name: 'TabelaCobrancasAssinatura',
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
    classeStatusCobranca,
    podePagar(status) {
      const norm = String(status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return STATUS_ABERTOS.includes(norm)
    },
    async carregar() {
      this.carregando = true
      try {
        const dados = await listarCobrancasPorAssinatura(this.assinaturaId, {
          status: this.filtroStatus || undefined,
          pagina: this.pagina,
          tamanhoPagina: this.tamanhoPagina
        })
        this.itens = dados.itens || []
        this.total = dados.total || 0
        this.pagina = dados.pagina || this.pagina
        this.$emit('count', this.total)
      } catch (erro) {
        this.$toast('error', 'Erro ao carregar cobranças', mensagemDeErro(erro))
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
    },
    abrirDetalhe(id) {
      this.$router.push({ name: 'cobranca-detalhe', params: { id } })
    }
  }
}
</script>
