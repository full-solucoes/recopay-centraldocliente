# Recopay Design System (tokens semânticos) — v1

> Fonte: extraído das telas enviadas. Onde havia divergência entre telas, **padronizei no conjunto mais consistente e profissional** (principalmente para status e estados de foco).

---

## Cores (tokens semânticos)

```css
:root {
  /* Texto */
  --text-primary: #2A2A2A;      /* headings e texto principal */
  --text-secondary: #56595E;    /* labels e descrições */
  --text-muted: #6B7280;        /* microcopy, ajuda, timestamps */
  --text-on-dark: #FFFFFF;      /* texto no sidebar e superfícies escuras */
  --text-disabled: #A1A1AA;

  /* Superfícies */
  --surface-page: #F5F5FA;      /* fundo das páginas */
  --surface-card: #FFFFFF;      /* cards, tabelas, modais */
  --surface-sidebar: #4B0D6B;   /* sidebar (base) */
  --surface-elevated: #FFFFFF;  /* dropdowns/modais sobrepostos */
  --surface-hover: #F9FAFB;     /* hover em tabelas e listas */
  --surface-table-header: #FCFCFD; /* cabeçalho de tabelas */

  /* Ações */
  --action-primary: #7B1FA2;        /* botões primários e CTAs */
  --action-primary-hover: #6F1C92;  /* hover (escurecido ~10%) */
  --action-secondary: #FFFFFF;      /* botões secundários (outline/neutral) */
  --action-neutral-hover: #F3F4F6;  /* hover suave para botões outline */
  --action-disabled: #E9E9EE;

  /* Bordas e Foco */
  --border-default: #E0E0EC;    /* borda padrão de inputs/cards */
  --border-subtle: #ECECF1;     /* separadores suaves / linhas internas */
  --border-focus: #7B1FA2;      /* foco (inputs/controles) */
  --ring-focus: 0 0 0 3px rgba(123, 31, 162, 0.2);

  /* Status */
  --status-success: #198754;    /* sucesso/confirmado/pago */
  --status-warning: #D4984B;    /* atenção/pendência (padronizado) */
  --status-error: #DD3B4A;      /* erro/cancelado/atraso */

  /* Z-Index */
  --z-elevated: 10;
  --z-dropdown: 100;
  --z-header: 200;
  --z-sidebar: 300;
  --z-modal: 2500;       /* acima de sidebar/topbar e abaixo de SweetAlert2 */
}
```

### Notas de padronização
- Nas telas há **dois verdes** (um mais vivo em bordas e outro em botões). Para consistência e “cara de produto maduro”, recomendo padronizar tudo em `--status-success`.
- “Pendente” aparece com fundo amarelado claro em algumas telas. Em vez de criar outro token, use `--status-warning` com **opacidade** (ex.: 20–30%) para fundos de badge.

---

## Tipografia

### Fonte principal (observada/sugerida)
- Visualmente é compatível com **Inter** / **system-ui**. Recomendo padronizar em:
```css
--font-sans: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
```

### Tamanhos (escala prática)
```css
--text-xxs: 11px;
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
```

### Pesos
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## Espaçamentos (grid 8px)

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
```

---

## Bordas e Sombras

### Radius (aprox. pelo visual dos cards/inputs)
```css
--radius-sm: 6px;     /* inputs, badges pequenos */
--radius-md: 10px;    /* botões */
--radius-lg: 12px;    /* cards */
--radius-xl: 16px;    /* modais e containers grandes */
--radius-full: 9999px;/* pills/badges */
```

### Sombras (aproximação fiel ao aspecto “leve” das telas)
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,.06);
--shadow-md: 0 6px 18px rgba(0,0,0,.10);
--shadow-lg: 0 16px 40px rgba(0,0,0,.14);
```

---

## Componentes

## Botões

### Primary
- **Background:** `--action-primary`
- **Texto:** `--text-on-dark`
- **Hover:** `--action-primary-hover`
- **Radius:** `--radius-md`
- **Padding:** `--space-3` vertical / `--space-6` horizontal
- **Fonte:** `--font-medium`, `--text-base`

### Secondary (outline)
- **Background:** `--action-secondary`
- **Texto:** `--action-primary`
- **Borda:** `--border-default` (ou `--action-primary` quando quiser mais “ênfase”)
- **Hover (profissional):** aplicar leve preenchimento com `--action-primary` em baixa opacidade (ex.: 8–12%)

### Ghost
- **Background:** transparente
- **Texto:** `--action-primary`
- **Hover:** fundo sutil com `--action-primary` em baixa opacidade

---

## Cards

- **Background:** `--surface-card`
- **Borda:** `--border-default`
- **Radius:** `--radius-lg`
- **Shadow:** `--shadow-sm` (subir para `--shadow-md` em cards “clicáveis”)
- **Padding padrão:** `--space-6`
- **Títulos:** `--text-primary` + `--font-semibold`

---

## Inputs

- **Background:** `--surface-card`
- **Texto:** `--text-primary`
- **Placeholder:** `--text-muted`
- **Borda:** `--border-default`
- **Focus:** borda `--border-focus` + glow usando `--border-focus` em baixa opacidade
- **Radius:** `--radius-sm`
- **Altura visual:** confortável (coerente com `--space-3` de padding vertical)

---

## Tags / Badges (Status)

- **Radius:** `--radius-full`
- **Padding:** `--space-1` vertical / `--space-2` horizontal
- **Texto:** `--text-primary` (para fundos claros) ou `--text-on-dark` (quando fundo for sólido)
- **Recomendação de uso (sem criar novos tokens):**
  - **Success:** fundo `--status-success` com 20–30% de opacidade; borda opcional com `--status-success`
  - **Warning:** fundo `--status-warning` com 20–30% de opacidade
  - **Error:** fundo `--status-error` com 20–30% de opacidade

---

## Feedback / Confirmacoes

- O padrao oficial para mensagens transientes, alertas modais, confirmacoes e prompts do sistema e **SweetAlert2** com tema RecoPay.
- Nao usar `alert`, `confirm` ou `prompt` nativos do navegador em novas telas.
- Usar sempre os wrappers globais:
  - `recopayToast(tipo, titulo, mensagem)` para sucesso, erro, alerta e informacao nao bloqueante.
  - `await recopayConfirm({ title, text, confirmButtonText, cancelButtonText, icon })` para acoes destrutivas ou irreversiveis.
  - `await recopayAlert(tipo, titulo, mensagem)` para mensagens bloqueantes.
  - `await recopayPrompt({ title, inputLabel, inputPlaceholder })` para entrada simples de dados em popup.
- Confirmacoes devem ter titulo objetivo, texto curto explicando o impacto, botao primario com verbo da acao e botao secundario `Cancelar`.
- Toasters devem aparecer no canto superior direito, com tempo curto, sem exigir interacao do usuario.
- O tema visual deve seguir os tokens: `--surface-elevated`, `--border-default`, `--radius-xl`, `--shadow-lg`, `--action-primary`, `--status-success`, `--status-warning` e `--status-error`.

---

## Navegação (Sidebar)

- **Background:** `--surface-sidebar`
- **Texto/ícones:** `--text-on-dark`
- **Itens:**
  - Espaçamento entre itens: `--space-3`
  - Área clicável confortável (padding mínimo `--space-3`)
- **Estado ativo (melhoria recomendada):**
  - Fundo do item ativo: `--surface-card` com ~8–10% de opacidade
  - Indicador lateral (barra): `--text-on-dark` com 60–80% de opacidade
- **Separadores internos:** `--border-subtle` com baixa opacidade

---

## Melhorias recomendadas para “aspecto maduro e confiável”

1. **Padronizar status**: usar sempre `--status-success / warning / error` (evitar múltiplos tons concorrendo).
2. **Foco acessível**: todo input/select/date picker com borda `--border-focus` + sombra sutil (glow). Hoje o foco não aparece claramente em algumas telas.
3. **Consistência de bordas**: cards, tabelas e filtros usando `--border-default` (mesmo tom), evitando variações perceptíveis.
4. **Hierarquia tipográfica**: títulos (`--font-semibold`) e descrições (`--text-secondary`) bem consistentes; reduzir “texto cinza claro demais” para manter legibilidade.
5. **Sidebar ativo mais claro**: destacar melhor a seção atual (importante em produto financeiro).
6. **Badges com fundo suave**: preferir fundos com opacidade (em vez de sólido forte), mantendo o texto sempre legível.
