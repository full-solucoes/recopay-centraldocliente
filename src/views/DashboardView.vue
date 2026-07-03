<template>
  <div>
    <PageHeader
      :titulo="`Olá, ${primeiroNome}`"
      descricao="Resumo das suas cobranças, notas fiscais e pagamentos."
    />

    <LoadingState v-if="carregando" texto="Carregando seu resumo..." />

    <template v-else>
      <!-- Cards de resumo -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-lg-3">
          <StatCard
            label="Em aberto"
            :valor="resumo.totalAberto"
            :hint="`${resumo.qtdAberto} cobrança(s)`"
            :icone="ICONE_COBRANCA"
          />
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <StatCard
            label="Pago no mês"
            :valor="resumo.totalPagoMes"
            :hint="resumo.qtdPagoMes ? `${resumo.qtdPagoMes} pagamento(s)` : '—'"
            :icone="ICONE_PAGO"
          />
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <StatCard
            label="Próximo vencimento"
            :valor="resumo.proximoVencimento"
            :hint="resumo.proximoVencimentoValor"
            :icone="ICONE_CALENDARIO"
          />
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <StatCard
            label="Notas no mês"
            :valor="resumo.qtdNotasMes"
            hint="Documentos autorizados"
            :icone="ICONE_NOTA"
          />
        </div>
      </div>

      <div class="row g-4">
        <!-- Cobrancas em aberto -->
        <div class="col-12 col-lg-7">
          <div class="card h-100">
            <div class="card-header d-flex align-items-center justify-content-between">
              <span class="fw-semibold">Cobranças em aberto</span>
              <router-link :to="{ name: 'cobrancas' }" class="link-ver-tudo">Ver todas</router-link>
            </div>
            <div class="card-body p-0">
              <LoadingState v-if="carregandoCobrancas" texto="Carregando cobranças..." />
              <EmptyState
                v-else-if="!cobrancasAbertas.length"
                titulo="Nenhuma cobrança em aberto"
                descricao="Você está em dia com seus pagamentos."
                :icone="ICONE_CHECK_GRANDE"
              />
              <div v-else>
                <router-link
                  v-for="c in cobrancasAbertas"
                  :key="c.id"
                  :to="{ name: 'cobranca-detalhe', params: { id: c.id } }"
                  class="list-row"
                >
                  <div class="flex-grow-1 min-w-0">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <span class="fw-semibold" style="color: var(--text-primary)">
                        {{ formatarCompetencia(c.competencia) }}
                      </span>
                      <StatusBadge :status="c.status" :classe="classeStatusCobranca(c.status)" />
                    </div>
                    <span class="text-muted-2" style="font-size: var(--text-xs)">
                      Vence em {{ formatarData(c.vencimento) }}
                    </span>
                  </div>
                  <div class="text-end">
                    <div class="fw-semibold" style="color: var(--text-primary)">{{ formatarMoeda(c.valorTotal) }}</div>
                    <span v-if="c.checkoutUrl" class="badge-link">Pagar</span>
                  </div>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Ultimas notas -->
        <div class="col-12 col-lg-5">
          <div class="card h-100">
            <div class="card-header d-flex align-items-center justify-content-between">
              <span class="fw-semibold">Últimas notas fiscais</span>
              <router-link :to="{ name: 'notas' }" class="link-ver-tudo">Ver todas</router-link>
            </div>
            <div class="card-body p-0">
              <LoadingState v-if="carregandoNotas" texto="Carregando notas..." />
              <EmptyState
                v-else-if="!ultimasNotas.length"
                titulo="Nenhuma nota disponível"
                descricao="Suas notas fiscais aparecerão aqui."
                :icone="ICONE_NOTA_GRANDE"
              />
              <div v-else>
                <div
                  v-for="n in ultimasNotas"
                  :key="n.id"
                  class="list-row"
                >
                  <div class="flex-grow-1 min-w-0" style="cursor: pointer" @click="abrirNotas(n)">
                    <div class="d-flex align-items-center gap-2 mb-1">
                      <span class="fw-semibold" style="color: var(--text-primary)">
                        NFS-e {{ n.numeroNfse || '#' + n.id }}
                      </span>
                      <StatusBadge :status="n.status" :classe="classeStatusNota(n.status)" />
                    </div>
                    <span class="text-muted-2" style="font-size: var(--text-xs)">
                      {{ formatarCompetencia(n.dataCompetencia) }} · {{ formatarMoeda(n.valorServico) }}
                    </span>
                  </div>
                  <div class="text-end d-flex align-items-center gap-2">
                    <button
                      v-if="n.pdfDisponivel"
                      type="button"
                      class="btn btn-sm btn-outline-primary"
                      :disabled="baixandoId === `pdf-${n.id}`"
                      @click="baixarPdf(n)"
                    >
                      <span v-if="baixandoId === `pdf-${n.id}`" class="spinner-border spinner-border-sm"></span>
                      PDF
                    </button>
                    <button
                      v-if="n.xmlDisponivel"
                      type="button"
                      class="btn btn-sm btn-outline-secondary"
                      :disabled="baixandoId === `xml-${n.id}`"
                      @click="baixarXml(n)"
                    >
                      <span v-if="baixandoId === `xml-${n.id}`" class="spinner-border spinner-border-sm"></span>
                      XML
                    </button>
                  </div>
                </div>
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
import StatCard from '@/components/ui/StatCard.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { listarCobrancas } from '@/api/cobrancas.service'
import { listarNotas, baixarPdfNota, baixarXmlNota, salvarBlob } from '@/api/notas.service'
import { formatarMoeda, formatarData, formatarCompetencia } from '@/utils/formatters'
import { classeStatusCobranca, classeStatusNota } from '@/utils/status-map'
import { mensagemDeErro } from '@/api/http'

const ICONE_COBRANCA =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>'
const ICONE_PAGO =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
const ICONE_CALENDARIO =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
const ICONE_NOTA =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
const ICONE_CHECK_GRANDE =
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
const ICONE_NOTA_GRANDE =
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'

export default {
  name: 'DashboardView',
  components: { PageHeader, StatCard, StatusBadge, LoadingState, EmptyState },
  data() {
    return {
      carregando: true,
      carregandoCobrancas: true,
      carregandoNotas: true,
      baixandoId: '',
      cobrancasAbertas: [],
      ultimasNotas: [],
      resumo: {
        totalAberto: '—',
        qtdAberto: 0,
        totalPagoMes: '—',
        qtdPagoMes: 0,
        proximoVencimento: '—',
        proximoVencimentoValor: '',
        qtdNotasMes: 0
      },
      ICONE_COBRANCA,
      ICONE_PAGO,
      ICONE_CALENDARIO,
      ICONE_NOTA,
      ICONE_CHECK_GRANDE,
      ICONE_NOTA_GRANDE
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user || {}
    },
    primeiroNome() {
      const nome = this.user.nomeFantasia || this.user.nome || ''
      return nome ? nome.split(' ')[0] : ''
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
    classeStatusNota,
    async carregar() {
      this.carregando = true
      // Garante dados do cliente no topo
      if (!this.user.id) {
        await this.$store.dispatch('auth/carregarUser').catch(() => {})
      }
      await Promise.allSettled([this.carregarCobrancas(), this.carregarNotas()])
      this.carregando = false
    },
    async carregarCobrancas() {
      this.carregandoCobrancas = true
      try {
        const dados = await listarCobrancas({ status: 'pendente', tamanhoPagina: 5 })
        const itens = dados.itens || []
        // Ordena por vencimento ascendente
        this.cobrancasAbertas = [...itens]
          .sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento))
          .slice(0, 5)

        const totalAberto = this.cobrancasAbertas.reduce((acc, c) => acc + Number(c.valorTotal || 0), 0)
        const proxima = this.cobrancasAbertas[0]
        this.resumo.totalAberto = formatarMoeda(totalAberto)
        this.resumo.qtdAberto = dados.total || this.cobrancasAbertas.length
        this.resumo.proximoVencimento = proxima ? formatarData(proxima.vencimento) : '—'
        this.resumo.proximoVencimentoValor = proxima ? formatarMoeda(proxima.valorTotal) : ''
      } catch (_e) {
        this.cobrancasAbertas = []
      } finally {
        this.carregandoCobrancas = false
      }
    },
    async carregarNotas() {
      this.carregandoNotas = true
      try {
        const dados = await listarNotas({ tamanhoPagina: 5 })
        this.ultimasNotas = (dados.itens || []).slice(0, 5)

        const agora = new Date()
        const notasMes = this.ultimasNotas.filter((n) => {
          if (!n.dataEmissao) return false
          const d = new Date(n.dataEmissao)
          return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear()
        })
        this.resumo.qtdNotasMes = notasMes.length
      } catch (_e) {
        this.ultimasNotas = []
      } finally {
        this.carregandoNotas = false
      }
    },
    abrirNotas(nota) {
      this.$router.push({ name: 'notas', hash: nota ? `#nota-${nota.id}` : undefined })
    },
    async baixarPdf(nota) {
      this.baixandoId = `pdf-${nota.id}`
      try {
        const res = await baixarPdfNota(nota.id)
        salvarBlob(res, `nfse-${nota.numeroNfse || nota.id}.pdf`)
      } catch (erro) {
        this.tratarErroDownload(erro, 'PDF')
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
        this.tratarErroDownload(erro, 'XML')
      } finally {
        this.baixandoId = ''
      }
    },
    tratarErroDownload(erro, tipo) {
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

<style scoped>
.link-ver-tudo {
  font-size: var(--text-xs);
  color: var(--action-primary);
  font-weight: var(--font-medium);
}
.badge-link {
  font-size: var(--text-xxs);
  font-weight: var(--font-semibold);
  color: var(--action-primary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
