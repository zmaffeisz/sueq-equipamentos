# Changelog

Todas as mudanças relevantes deste projeto. Formato baseado em
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

> Nota: este projeto não usa versionamento semântico formal nem tags de release. As
> entradas abaixo reconstroem o histórico a partir das **migrations aplicadas** e da
> documentação existente. Datas em formato ISO (AAAA-MM-DD).

## [Não versionado]

### Alterado
- **Refatoração estrutural incremental do frontend**: `index.html` foi reduzido para a
  estrutura da SPA e carregamento de arquivos externos. O JavaScript monolítico foi
  extraído e dividido em scripts clássicos menores em `js/legacy/`, preservando ordem de
  execução e handlers inline. Estilos de documentos de impressão foram extraídos para
  `css/print-*.css`. Criada a base de módulos nativos em `js/modules/`, `js/state/` e
  `js/components/` para as próximas extrações sem alterar regra de negócio.

### Corrigido
- **Gerar contrato para serviço mensal fixo não herdava/calculava corretamente os dados da
  licitação**: no modal "Gerar contrato", a vigência e o vencimento agora ficam
  somente leitura para serviço mensal valor fixo, usando os meses cadastrados na licitação
  e recalculando o vencimento pela data de início. Valor mensal e valor global também
  passam a ser calculados automaticamente pelos itens marcados no contrato.
- **Atas Rp Vigentes "perdia" atas encerradas e suas execuções**: `loadAtas` descartava
  contratos/itens/execuções com `status=ENCERRADO` já na busca dos dados (não só na
  exibição), e o filtro de Status do topo só listava valores presentes nesses dados — como
  encerrados nunca chegavam a existir em memória, "ENCERRADO" nunca aparecia como opção e a
  ata ficava inacessível pela UI (dado seguia intacto no banco, só inalcançável). Corrigido:
  `loadAtas` agora mantém tudo em memória (igual `loadContratos` já fazia), e a lógica de
  "esconder encerrado por padrão, mostrar ao selecionar o filtro" que já existia em
  `filtrarAtas` passa a funcionar de verdade. A tabela de Execuções/Solicitações (que não
  tinha filtro de status próprio) ganhou a mesma regra, para não misturar execuções de atas
  encerradas com as vigentes.
- **Item de ATA continuava mostrando "VIGENTE" mesmo com o contrato já ENCERRADO**: o status
  exibido priorizava `atas_itens.status_contrato`, um campo legado nunca sincronizado (sempre
  gravado como `'VIGENTE'` na criação do item e nunca atualizado ao encerrar/reabrir o
  contrato) sobre `contratos.status`, que é a fonte real da verdade e é corretamente
  atualizado pelo botão "Encerrar". Corrigido em `loadAtas` (index.html) e no cache de
  fallback usado por Controle de Entregas — `contratos.status` agora sempre prevalece.
- **Controle de Entregas / Prazos não mostrava itens de aquisição contratados aguardando
  AF**: o filtro comparava `itens.status` com a string `'aguardando'`, que nunca é gravada
  (o valor real após vincular item a contrato é `'contratado'`). Corrigido em
  `loadItensEntregas` — aquisições contratadas voltam a aparecer para emissão de AF.
- **Status do contrato de aquisição ficava travado em "Aguardando emissão da AF" para
  sempre**: nada atualizava `contratos.status` após a emissão da AF ou o recebimento dos
  itens, apesar do texto da UI prometer a transição automática. Agora `contratos.status`
  transiciona automaticamente: `Aguardando emissão da AF` → `VIGENTE` (assim que a 1ª AF é
  emitida, `_ctMarcarVigente`) → `CONCLUIDO` (quando todos os itens do contrato atingem
  100% da quantidade contratada recebida em Controle de Entregas/Prazos,
  `_ctVerificarConclusao`). Contratos `CONCLUIDO` ganham badge próprio e ficam ocultos por
  padrão em Contratos em Execução (igual `ENCERRADO`), com opção manual em "Editar
  contrato" para casos excepcionais.

### Adicionado
- **Tipo de serviço em Licitações/processos**: ao selecionar Natureza = `SERVIÇO`, o modal
  de processo exibe o campo obrigatório "Tipo do serviço" com as opções iniciais de
  contrato de serviço. O valor é salvo em `processos.tipo_servico` e aparece no resumo da
  licitação para preparar as próximas regras específicas por subtipo.
- **Serviço mensal valor fixo**: o subtipo ganhou uma lista obrigatória de itens no cadastro
  da licitação, permitindo vários itens por contrato. Cada item tem descrição, quantidade e
  valor unitário; a quantidade de meses fica no contrato, e os valores mensal/global são
  calculados automaticamente. O global alimenta `processos.valor_estimado`.
- **Itens de serviço mensal na licitação e geração de contrato**: a aba Licitações agora
  conta e exibe os itens salvos em `processos.servico_mensal_itens`. Ao gerar contrato, os
  itens mensais aparecem para marcação e viram registros em `itens` vinculados ao contrato.
- **Filtro "Mostrar municipais antigas"** na aba de Saldo de Emendas: emendas `MUNICIPAL`
  de exercícios anteriores a 2026 (histórico importado das atas encerradas) ficam **ocultas
  por padrão** e só aparecem ao marcar a caixinha, evitando confusão com as municipais
  atuais (`_saldoRowsVisiveis`, `panel-saldo-emendas`).

### Migração de dados (2026-07-02) — correção de processos + cadastro de atas
- **Licitações:** corrigido o `objeto` (nome) de 12 processos SEI 2026 que estavam poluídos
  com a lista de itens; criados 5 processos novos que faltavam (planilha "processos dados
  atualizados"). Números (identificador) já estavam corretos — sem cascata para Emendas.
- **Atas encerradas:** importadas da planilha "CONTROLE DE ATAS ENCERRADAS" (95 blocos de
  item, ~800 execuções). Contratos correspondentes convertidos para `tipo_instrumento=ATA`
  / `status=ENCERRADO` (ou criados quando inexistentes); populadas `atas_itens` e
  `atas_execucao` com todo o histórico e vínculo de emenda. AC (contrato 272) e CPL 445/2023
  preservados (este último sobrepõe atas vigentes — revisar manualmente).
- **Emendas:** criadas 59 emendas MUNICIPAIS históricas (ano deduzido pelo empenho) + itens.
  Federais/estaduais foram **casadas às existentes por código normalizado e apenas
  complementadas** (nunca duplicadas/sobrescritas). Entregas históricas marcadas como
  confirmadas na unidade → refletem no **Inventário** e saem das filas de Controle/Confirmação
  de entrega. Backup completo em schema `bkp_20260702`.

### Adicionado (anterior)
- Documentação técnica e funcional completa em `/docs` (ARCHITECTURE, SCHEMA, DATABASE,
  ROUTES, MODULES, DATA_FLOW, BUSINESS_RULES, API, SECURITY, DEPLOYMENT, TESTING, TODO).
- `README.md`, `CHANGELOG.md`, `.env.example` e `CLAUDE.md` na raiz.
- **Emitir AF para itens de ATA** (Controle de Entregas): modal dedicado `#modal-ata-af`
  (`abrirModalAtaAF`/`salvarAtaAF`) que gera nº de AF + data + previsão de entrega,
  espelhando o fluxo de AF da aquisição. Requer a coluna `atas_execucao.af_numero`
  (migration `20260628141120_atas_execucao_af_numero`).
- **Nova emenda com itens inline**: o modal "Nova emenda" passou a cadastrar a emenda e
  seus itens no mesmo modal (item + valor unitário + status + unidades/qtde por item),
  com cálculo do valor por unidade = unitário × qtde e resumo de comprometido/saldo
  (`neInitItens`, `neAddItem`, `neAddUnidade`, `neRecalc`).

### Corrigido
- **Puxar itens de emenda em licitacoes/aquisicoes**: itens de emenda ja vinculados a
  `atas_execucao` agora ficam bloqueados como "ja vinculado", evitando selecionar de novo
  a parte ja executada por ATA; apenas o saldo dividido/restante continua disponivel.
- **Patrimonio/serie por unidade fisica**: recebimentos de aquisicoes e ATAs agora sao
  refletidos na aba **Emendas** e no **Inventario** como uma linha por patrimonio quando
  patrimonio/serie forem preenchidos. Enquanto nao houver patrimonio/serie, o item continua
  consolidado. Criada `atas_execucao_unidades`, alinhada `itens_entregas_unidades` com
  `unidade_seq`/recebimento e migrado o recebimento ja lancado da ATA para 25 linhas
  individuais.
- **Marca/modelo no recebimento de ATA**: o modal de recebimento passa a puxar
  `atas_itens.marca_modelo`, evitando campo vazio/bugado ao receber item gerado por ATA.
- **Solicitacao parcial de ATA com origem em Emenda**: o salvamento agora usa RPC
  transacional que divide `emenda_itens` quando a quantidade solicitada e menor que o saldo,
  mantendo a parte restante livre para nova solicitacao. Reparado o caso da emenda 2616
  (`AR CONDICIONADO`, ANGELICA): 25 unidades seguem vinculadas a solicitacao e 25 voltaram
  como saldo disponivel.
- **Solicitacao/execucao de ATA no banco de teste**: alinhado o schema de
  `atas_execucao` no `contratos-dag`, incluindo `origem_recurso` e campos de confirmacao
  de entrega, evitando erro de schema cache ao salvar nova solicitacao.
- **Numero da ATA/contrato**: a validacao passou a bloquear apenas letras e espacos,
  permitindo separadores como barra, ponto e hifen.
- **RLS da aba Emendas no banco de teste**: adicionadas as politicas de escrita para
  `emendas` e `emenda_itens`, usando `can_access_tab('dashboard','edit')`, para permitir
  que usuarios admin/aprovados salvem novas emendas sem erro de row-level security.
- **AF de ATA com prazo herdado**: o modal de emissão agora busca o vínculo `ata_item_id`,
  herda o prazo da ATA/licitação, calcula `prev_entrega` automaticamente e bloqueia a
  emissão quando a origem não possui prazo cadastrado. Ao salvar, o avanço também é refletido
  na aba **Emendas** via `atas_execucao`/`emenda_itens`.
- **Fluxo de AF no Controle de Entregas/Prazos**: o botão **Emitir AF** não remove mais
  o item da subaba; o item permanece com os botões **Receber** e **Prazo** até que o
  recebimento interno seja confirmado. O item só aparece em **Confirmação de Entrega na
  Unidade** após o recebimento (`qtde_recebida > 0` ou `data_recebimento` preenchida).
- **Nomenclatura padronizada**: todos os botões, mensagens e textos da interface agora
  usam **Emitir AF** (antes havia mistura com "Emitir Ordem de Entrega").
- **Filtro de visibilidade robusto**: o filtro de itens em Controle de Entregas/Prazos
  agora verifica explicitamente `recebido === true` antes de ocultar o item, evitando
  que itens recém-emitidos desapareçam por inconsistência no `saldo_af`.
- **Confirmação pós-recebimento**: `salvarRecebimento` agora recarrega a subaba de
  Confirmação de Entrega automaticamente após o recebimento interno.
- **Salvaguarda anti-desaparecimento**: adicionado quarto caminho em `loadItensEntregas`
  que captura registros de `itens_entregas` com AF emitida que não foram incluídos por
  nenhum dos três caminhos principais (ex.: falha de join no select aninhado do
  Supabase). Item com `af_numero` preenchido nunca mais fica invisível.

### Alterado
- **Gerar contrato a partir de licitacao**: o campo **Processo / CPL** agora vem travado
  com o processo clicado, em vez de abrir um select para escolher novamente.
- **Aba Emendas como painel consolidado do ciclo do item**: agora o dashboard deriva status,
  AF, empenho, NF, patrimônio e data de entrega a partir de `itens`, `itens_entregas`,
  `itens_entregas_unidades`, `empenho_itens` e `nota_fiscal_itens`, em vez de depender
  somente dos campos manuais de `emenda_itens`.
- **Planilha de Emendas**: adicionada a coluna **Vl. unit. exec.** e renomeada a coluna
  total executada para **Vl. total exec.**, separando melhor planejado vs. executado.
- **Fluxo AF de aquisição no Controle de Entregas**: item com AF emitida deixa
  **Controle de Entregas / Prazos** e passa para **Confirmação de Entrega na Unidade**;
  itens sem AF continuam como "aguardando AF".
- **Status dos modais de emenda/item** agora vêm da mesma fonte da aba *Licitações em
  andamento* (`status_opcoes` com `contexto='licitacao'`, opções manuais) via
  `popularStatusLicitacao()`, em vez de lista fixa no HTML.
- **Modelo de cadastro de nova emenda**: passou a criar **1 linha em `emendas`**
  (valor cedido global) em vez de 1 linha por unidade com o valor dividido igualmente.
  A distribuição por unidade vive nos `emenda_itens`. Emendas antigas (multi-linha)
  permanecem válidas.

### Corrigido
- **Emendas não refletia avanço real do item**: itens com AF/confirmacão na unidade podiam
  continuar mostrando status antigo de licitação ("Em andamento") e campos vazios. O status
  derivado do fluxo agora prevalece quando há AF, recebimento ou confirmação.
- **Empenho vazio em confirmação/Emendas**: quando `itens_entregas.empenho` estava vazio,
  o sistema passa a herdar o empenho vinculado via `empenho_itens`/`empenhos`.
- **"Emitir AF" da ATA não abria** no Controle de Entregas: o modal `#modal-edit-exec`
  estava aninhado em `#panel-atas` (invisível em outras abas) e dependia do array
  `atasExec` não carregado fora da aba Atas. Agora o modal é reparentado ao `body` ao
  abrir e a execução é buscada do banco quando necessário.
- **Lista de status cortada em Licitações em andamento**: o dropdown do select com busca
  (`enhanceSelect`) era `position:absolute` e era recortado pelo `overflow:hidden` do
  bloco da licitação. Passou a usar `position:fixed`, escapando de qualquer ancestral
  com `overflow`.

## Histórico de banco (migrations) — 2026-06

> Reconstruído de `list_migrations` (produção). Ver
> [docs/DATABASE.md](docs/DATABASE.md#migrations-aplicadas-em-produção).

### 2026-06-26
- `recebimento_por_unidade` / `recebimento_por_unidade_search_path`: tabela
  `itens_entregas_unidades` (recebimento por unidade física; NF referenciada sem valor,
  evitando duplicidade) + trigger de agregação `_sync_entrega_agregado`.
- `fase5_drop_inventario_ac_contrato_morto`: limpeza de coluna morta no inventário.
- `fase4_data_entrega_date_e_contratos_valores_num`: datas como `date` e valores de
  contrato numéricos (`valor_*_num`).
- `fase2_emenda_itens_status_id`: `emenda_itens.status_id` (FK para `status_opcoes`).
- `fase1_parlamentar_id_e_unidade_chamados`: normalização de parlamentar e unidade.
- `fase0_mover_backups_para_schema_backup`: backups movidos para schema `backup`.
- `fase8_numero_despesa`, `prod_revisao_cadastros`,
  `prod_hardening_revoke_anon_ciclo_itens` (hardening RLS/anon).
- `prod_fase7_bucket_termos_entrega` (Storage de termos), `prod_fase7_12_atas_execucao_cols`,
  `prod_fase5_6_9_itens_entregas_cols`, `prod_fase9_itens_marca_modelo`,
  `prod_fase6_empenhos_notas_fiscais` (empenhos + notas fiscais).

### 2026-06-25
- `fase3_gera_mais_contratos`: geração de contratos a partir de processos/itens.

### 2026-06-24
- `fase0_itens_e_itens_entregas`: tabelas `itens` e `itens_entregas` (ciclo de vida do item).
- `add_natureza_e_status_processo` + `recreate_vw_processos_resumo_com_natureza`:
  `natureza`/`status` em processos e recriação da view `vw_processos_resumo`.

---

> Mantenha este arquivo atualizado a cada migration ou mudança funcional relevante.
