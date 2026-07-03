<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-3 gap-2 flex-wrap">
      <select v-model="filtroStatus" class="form-select form-select-sm" style="width: auto" @change="recarregar">
        <option value="">Todos os status</option>
        <option value="autorizada">Autorizada</option>
        <option value="pendente">Pendente</option>
        <option value="cancelada">Cancelada</option>
      </select>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <LoadingState v-if="carregando" texto="Carregando notas..." />
        <EmptyState
          v-else-if="!itens.length"
          titulo="Nenhuma nota nesta assinatura"
          descricao="As notas fiscais geradas pelo plano aparecerão aqui."
        />
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>NFS-e</th>
                <th>Competência</th>
                <th>Emissão</th>
                <th class="text-end">Valor</th>
                <th>Status</th>
                <th class="text-end">Documentos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="n in itens" :key="n.id">
                <td class="fw-semibold">{{ n.numeroNfse || '#' + n.id }}</td>
                <td>{{ formatarCompetencia(n.dataCompetencia) }}</td>
                <td>{{ formatarData(n.dataEmissao) }}</td>
                <td class="text-end fw-semibold">{{ formatarMoeda(n.valorServico) }}</td>
                <td><StatusBadge :status="n.status" :classe="classeStatusNota(n.status)" /></td>
                <td class="text-end">
                  <div class="d-inline-flex gap-2">
                    <button
                      v-if="n.pdfDisponivel"
                      class="btn btn-sm btn-outline-primary"
                      type="button"
                      :disabled="baixandoId === `pdf-${n.id}`"
                      @click="baixarPdf(n)"
                    >
                      <span v-if="baixandoId === `pdf-${n.id}`" class="spinner-border spinner-border-sm"></span>
                      PDF
                    </button>
                    <button
                      v-if="n.xmlDisponivel"
                      class="btn btn-sm btn-outline-secondary"
                      type="button"
                      :disabled="baixandoId === `xml-${n.id}`"
                      @click="baixarXml(n)"
                    >
                      <span v-if="baixandoId === `xml-${n.id}`" class="spinner-border spinner-border-sm"></span>
                      XML
                    </button>
                  </div>
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
import { listarNotasPorAssinatura } from '@/api/assinaturas.service'
import { baixarPdfNota, baixarXmlNota, salvarBlob } from '@/api/notas.service'
import { formatarMoeda, formatarData, formatarCompetencia } from '@/utils/formatters'
import { classeStatusNota } from '@/utils/status-map'
import { mensagemDeErro } from '@/api/http'

export default {
  name: 'TabelaNotasAssinatura',
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
      filtroStatus: '',
      baixandoId: ''
    }
  },
  methods: {
    formatarMoeda,
    formatarData,
    formatarCompetencia,
    classeStatusNota,
    async carregar() {
      this.carregando = true
      try {
        const dados = await listarNotasPorAssinatura(this.assinaturaId, {
          status: this.filtroStatus || undefined,
          pagina: this.pagina,
          tamanhoPagina: this.tamanhoPagina
        })
        this.itens = dados.itens || []
        this.total = dados.total || 0
        this.pagina = dados.pagina || this.pagina
        this.$emit('count', this.total)
      } catch (erro) {
        this.$toast('error', 'Erro ao carregar notas', mensagemDeErro(erro))
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
    async baixarPdf(nota) {
      this.baixandoId = `pdf-${nota.id}`
      try {
        const res = await baixarPdfNota(nota.id)
        salvarBlob(res, `nfse-${nota.numeroNfse || nota.id}.pdf`)
      } catch (erro) {
        this.tratarErro(erro, 'PDF')
      } finally {
        this.baixandoId = ''
      }
    },
    async baixarXml(nota) {
      this.baixandoId = `xml-${nota.id}`
      try {
        const res = await baixarXmlNota(nota.id)
        salvarBlob(res, `nfse-${nota.numeroNfse || nota.id}.xml`)
      } catch (erro) {
        this.tratarErro(erro, 'XML')
      } finally {
        this.baixandoId = ''
      }
    },
    tratarErro(erro, tipo) {
      const status = erro?.response?.status
      if (status === 404) {
        this.$toast('error', `${tipo} indisponível`, 'O documento ainda não foi gerado.')
      } else {
        this.$toast('error', `Erro ao baixar ${tipo}`, mensagemDeErro(erro))
      }
    }
  }
}
</script>
