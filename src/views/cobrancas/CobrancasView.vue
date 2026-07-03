<template>
  <div>
    <PageHeader titulo="Cobranças" descricao="Consulte e pague suas cobranças.">
      <template #actions>
        <select v-model="filtroStatus" class="form-select form-select-sm" style="width: auto" @change="mudarFiltro">
          <option value="">Todos os status</option>
          <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </template>
    </PageHeader>

    <div class="card">
      <div class="card-body p-0">
        <LoadingState v-if="carregando" texto="Carregando cobranças..." />
        <EmptyState
          v-else-if="!cobrancas.length"
          titulo="Nenhuma cobrança encontrada"
          :descricao="filtroStatus ? 'Não há cobranças com este filtro.' : 'Você ainda não possui cobranças.'"
        />
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Competência</th>
                <th>Plano</th>
                <th>Vencimento</th>
                <th class="text-end">Valor</th>
                <th>Status</th>
                <th class="text-end">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="c in cobrancas"
                :key="c.id"
                style="cursor: pointer"
                @click="abrirDetalhe(c.id)"
              >
                <td class="fw-semibold">{{ formatarCompetencia(c.competencia) }}</td>
                <td>{{ c.planoNome || '—' }}</td>
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
      <div v-if="!carregando && cobrancas.length" class="card-footer bg-transparent">
        <PaginationBar
          :pagina="pagina"
          :tamanho-pagina="tamanhoPagina"
          :total="total"
          @mudar="mudarPagina"
        />
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
import { listarCobrancas } from '@/api/cobrancas.service'
import { formatarMoeda, formatarData, formatarCompetencia } from '@/utils/formatters'
import { classeStatusCobranca } from '@/utils/status-map'
import { mensagemDeErro } from '@/api/http'

const STATUS_ABERTOS = ['pendente', 'aberto', 'a_vencer', 'em_aberto', 'aguardando', 'processando', 'vencido', 'vencida', 'atrasado', 'atrasada']

export default {
  name: 'CobrancasView',
  components: { PageHeader, StatusBadge, LoadingState, EmptyState, PaginationBar },
  data() {
    return {
      carregando: true,
      cobrancas: [],
      pagina: 1,
      tamanhoPagina: 20,
      total: 0,
      filtroStatus: '',
      statusOptions: [
        { value: 'pendente', label: 'Pendente' },
        { value: 'pago', label: 'Pago' },
        { value: 'vencido', label: 'Vencido' },
        { value: 'cancelado', label: 'Cancelado' }
      ]
    }
  },
  watch: {
    '$route.query.status': {
      immediate: true,
      handler(v) {
        this.filtroStatus = v || ''
      }
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
    podePagar(status) {
      const norm = String(status || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return STATUS_ABERTOS.includes(norm)
    },
    async carregar() {
      this.carregando = true
      try {
        const dados = await listarCobrancas({
          status: this.filtroStatus || undefined,
          pagina: this.pagina,
          tamanhoPagina: this.tamanhoPagina
        })
        this.cobrancas = dados.itens || []
        this.total = dados.total || 0
        this.pagina = dados.pagina || this.pagina
        this.tamanhoPagina = dados.tamanhoPagina || this.tamanhoPagina
      } catch (erro) {
        this.$toast('error', 'Erro ao carregar cobranças', mensagemDeErro(erro))
        this.cobrancas = []
      } finally {
        this.carregando = false
      }
    },
    abrirDetalhe(id) {
      this.$router.push({ name: 'cobranca-detalhe', params: { id } })
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
