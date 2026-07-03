# CLAUDE.md — orientações para agentes/IA

Guia para assistentes de IA (Claude Code e afins) que trabalham neste repositório.
Documentação humana completa em [`/docs`](docs/) e [README.md](README.md).

## O que é o projeto

`dashboard-emendas`: app **web estático** (HTML/CSS/JS *vanilla*, **sem framework, sem
build, sem `package.json`**) + **Supabase** (PostgreSQL na nuvem, Auth, Storage, RLS).
Gestão de emendas parlamentares → licitações → contratos → atas → execução/entrega →
chamados, da Secretaria da Saúde de Sorocaba.

## Mapa rápido

- `index.html` — **SPA principal** (~818 KB, ~12k linhas; HTML+CSS+JS no mesmo arquivo).
  Abas via `showTab('<name>')`; painéis `#panel-<name>`; cliente Supabase global `sb`.
- `login.html`, `cadastro.html` — auth. `chamado.html` — formulário público (RPC).
- `supabase/migrations/` — migrations. `schema*.sql` — dumps.
- Banco nuvem deste clone de teste: projeto **`qpvgpfwuurqcqprnpxua`** (`contratos-dag`). O projeto original **`djtwoesmgeetnrztyvzw`** (`zmaffeisz's Project`) NÃO deve ser alterado.

## Trava obrigatória de ambiente Supabase

Este checkout é um **clone de teste**. Qualquer operação executável no Supabase deve mirar
**somente** o projeto de teste:

- **permitido para execução/escrita:** `qpvgpfwuurqcqprnpxua` (`contratos-dag`);
- **proibido executar/escrever:** `djtwoesmgeetnrztyvzw` (`zmaffeisz's Project`, banco
  original do usuário).

Antes de rodar SQL, migrations, seeds, RPCs, Edge Functions, Storage, Auth Admin,
alterações de RLS, DDL ou DML, confirme que o `project_id`/URL é
`qpvgpfwuurqcqprnpxua` / `https://qpvgpfwuurqcqprnpxua.supabase.co`.

Não use dumps, comentários antigos, `.supabase/config.toml`, histórico de migrations ou
valores hardcoded antigos para trocar o alvo para o projeto original. Se for necessário
comparar/copiar algo do banco original, faça somente leitura e apenas quando o usuário pedir
explicitamente; qualquer escrita continua restrita ao `contratos-dag`.

## Convenções e fatos que orientam mudanças

- **Fonte única da verdade no banco.** Abas são views; alterações refletem por
  recarregamento e espelhamento. A aba **Atas Rp** é item próprio do menu (seção
  "Contratos"), **derivada da matriz `contratos`** — **não** é subaba de Contratos. Ela
  recarrega sempre (`loadAtas`).
- **Contratos** (`contratos`) é a **matriz** de todo instrumento (`tipo_instrumento` =
  `CONTRATO`|`ATA`).
- **Valores monetários:** usar os campos numéricos `valor_*_num` em `contratos` (os `valor_*`
  texto são legado).
- **Notas Fiscais (anti-duplicidade):** valor total em `notas_fiscais.valor_total` (1x);
  rateio em `nota_fiscal_itens`; `itens_entregas_unidades` referencia a NF **sem** valor.
  Nunca modele de forma que o valor da NF seja somado por unidade.
- **Solicitação parcial de ATA com origem em Emenda:** nunca reduzir a linha inteira da
  emenda para a quantidade solicitada. Dividir `emenda_itens`: a fração solicitada fica
  vinculada à `atas_execucao` e o saldo restante vira nova linha livre para solicitação.
- **Patrimônio/série por unidade física:** enquanto não houver patrimônio/série
  preenchido, Emendas e Inventário podem mostrar o item consolidado. Depois do
  recebimento com patrimônio/série, mostrar uma linha por unidade física. Aquisições usam
  `itens_entregas_unidades`; ATAs usam `atas_execucao_unidades`.
- **Permissões:** `admin` (total) vs. usuário comum (caixinhas em `user_tab_permissions`).
  RLS no banco é autoritativa (`can_access_tab`); o cliente apenas espelha
  (`userCanView/userCanEdit`). `usuarios`/`cadastros` são admin-only.
- **Chamados:** "Chamados Antigos" (Google Sheets) é **somente leitura**; chamado órfão sem
  controle = "não aberto" (não criar controle automático).

## Como rodar

```bash
python -m http.server 8765   # na raiz; abrir http://localhost:8765/login.html
```

## Regras de trabalho

- **Não** introduzir build/framework sem pedido explícito; manter o padrão estático.
- **Editar `index.html` com cuidado** (arquivo gigante): localize por `id`/nome de função
  (ex.: `showTab`, `loadAtas`, `abrirModalNovoContrato`) antes de alterar.
- **Banco:** seguir a trava obrigatória de ambiente Supabase acima. Nenhuma escrita/execução
  no projeto original; migrations devem ser idempotentes e fixar `search_path` em funções.
- Rodar `get_advisors` (segurança/performance) após mudanças de schema.
- Atualizar [CHANGELOG.md](CHANGELOG.md) e os docs relevantes ao mudar comportamento.
- Confirmar itens marcados como **"A confirmar"** em [docs/TODO.md](docs/TODO.md) antes de
  tratá-los como regra fixa.

## Documentação de referência

Arquitetura, schema, fluxo, regras, segurança e deploy: ver índice em
[README.md](README.md#documentação-docs).
