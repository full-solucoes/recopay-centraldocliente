<template>
  <div>
    <PageHeader titulo="Assinaturas" descricao="Seus planos e recorrências.">
      <template #actions>
        <select v-model="filtroStatus" class="form-select form-select-sm" style="width: auto" @change="mudarFiltro">
          <option value="">Todos os status</option>
          <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </template>
    </PageHeader>

    <div class="card">
      <div class="card-body p-0">
        <LoadingState v-if="carregando" texto="Carregando assinaturas..." />
        <EmptyState
          v-else-if="!assinaturas.length"
          titulo="Nenhuma assinatura encontrada"
          :descricao="filtroStatus ? 'Não há assinaturas com este filtro.' : 'Você ainda não possui assinaturas.'"
        />
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Plano</th>
                <th>Produto</th>
                <th class="text-end">Valor</th>
                <th>Vencimento</th>
                <th>Próxima cobrança</th>
                <th>Status</th>
                <th class="text-end">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="a in assinaturas"
                :key="a.id"
                style="cursor: pointer"
                @click="abrirDetalhe(a.id)"
              >
                <td class="fw-semibold">{{ a.planoNome || '—' }}</td>
                <td class="text-muted-2">{{ a.produtoNome || '—' }}</td>
                <td class="text-end fw-semibold">
                  {{ formatarMoeda(a.valorAtual) }}
                  <div v-if="a.periodicidade" class="text-muted-2" style="font-size: var(--text-xxs); font-weight: 400">
                    {{ rotuloPeriodicidade(a) }}
                  </div>
                </td>
                <td>{{ a.diaVencimento ? `Dia ${a.diaVencimento}` : '—' }}</td>
                <td>{{ formatarData(a.proximaCobrancaData) }}</td>
                <td><StatusBadge :status="a.status" :classe="classeStatusAssinatura(a.status)" /></td>
                <td class="text-end">
                  <button class="btn btn-sm btn-ghost" type="button" @click.stop="abrirDetalhe(a.id)">Ver</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="!carregando && assinaturas.length" class="card-footer bg-transparent">
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
import { listarAssinaturas } from '@/api/assinaturas.service'
import { formatarMoeda, formatarData } from '@/utils/formatters'
import { classeStatusAssinatura } from '@/utils/status-map'
import { mensagemDeErro } from '@/api/http'

export default {
  name: 'AssinaturasView',
  components: { PageHeader, StatusBadge, LoadingState, EmptyState, PaginationBar },
  data() {
    return {
      carregando: true,
      assinaturas: [],
      pagina: 1,
      tamanhoPagina: 20,
      total: 0,
      filtroStatus: '',
      statusOptions: [
        { value: 'ativo', label: 'Ativa' },
        { value: 'cancelada', label: 'Cancelada' },
        { value: 'suspensa', label: 'Suspensa' },
        { value: 'expirada', label: 'Expirada' }
      ]
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
      if (!nome) return ''
      const map = {
        mensal: intervalo > 1 ? `a cada ${intervalo} meses` : 'mensal',
        anual: intervalo > 1 ? `a cada ${intervalo} anos` : 'anual',
        semanal: intervalo > 1 ? `a cada ${intervalo} semanas` : 'semanal',
        diaria: intervalo > 1 ? `a cada ${intervalo} dias` : 'diária'
      }
      return map[nome] || nome
    },
    async carregar() {
      this.carregando = true
      try {
        const dados = await listarAssinaturas({
          status: this.filtroStatus || undefined,
          pagina: this.pagina,
          tamanhoPagina: this.tamanhoPagina
        })
        this.assinaturas = dados.itens || []
        this.total = dados.total || 0
        this.pagina = dados.pagina || this.pagina
        this.tamanhoPagina = dados.tamanhoPagina || this.tamanhoPagina
      } catch (erro) {
        this.$toast('error', 'Erro ao carregar assinaturas', mensagemDeErro(erro))
        this.assinaturas = []
      } finally {
        this.carregando = false
      }
    },
    abrirDetalhe(id) {
      this.$router.push({ name: 'assinatura-detalhe', params: { id } })
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
