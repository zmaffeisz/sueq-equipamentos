## Banco de dados / Supabase

Este projeto usa Supabase Cloud como ambiente principal.

Não assumir que o projeto está usando Supabase local, Docker local ou `supabase start`, salvo se o usuário pedir explicitamente.

A pasta `.supabase`, quando existente, deve ser tratada como artefato legado/local do Supabase CLI ou como repositório de scripts SQL antigos. Ela não representa o ambiente principal de execução.

Fonte da verdade:
- Banco real: Supabase Cloud
- Frontend: arquivos HTML/CSS/JS deste repositório
- Scripts SQL devem ser analisados apenas como referência ou quando o usuário pedir alteração no schema

Ao gerar código, prompts ou relatórios:
- Não sugerir comandos de Supabase local por padrão.
- Não usar URL localhost do Supabase.
- Não assumir banco local.
- Considerar que alterações precisam ser compatíveis com o schema em produção/cloud.


# dashboard-emendas

Sistema de gestão de **emendas parlamentares, licitações, contratos, atas de registro de
preços, execução/entrega de itens e chamados** da Secretaria Municipal da Saúde de
Sorocaba (SUEQ).

É uma aplicação **web estática** (HTML/CSS/JS *vanilla*, sem framework e sem build) com
backend **Supabase** (PostgreSQL na nuvem, Auth, Storage e RLS).

## Fluxo principal

```
Emenda → Licitação → Contrato → Ata → Execução/Entrega
```

O sistema é um **ecossistema integrado** com **fonte única da verdade** no banco:
alterações em uma aba refletem nas demais (a aba **Atas Rp** deriva da matriz de
**Contratos**, por exemplo). Detalhes em [docs/DATA_FLOW.md](docs/DATA_FLOW.md).

## Estrutura do repositório

| Caminho | Descrição |
|---|---|
| `login.html` / `cadastro.html` | Login e auto-cadastro (Supabase Auth). |
| `index.html` | Aplicação principal (SPA com abas por `showTab`). |
| `chamado.html` | Formulário **público** de abertura de chamado. |
| `styles.css` / `dashboard.css` / `chamado.css` | Estilos. |
| `schema*.sql`, `migracao_*.sql`, `supabase-unificar-*.sql` | Dumps e scripts de migração. |
| `supabase/` | `config.toml` (stack local) e `migrations/`. |
| `docs/` | Documentação técnica e funcional. |

> Não há `package.json`, build ou `node_modules`. As bibliotecas (supabase-js, xlsx,
> html2pdf, papaparse) são carregadas por **CDN**.

## Como rodar localmente

```bash
# Na raiz do repositório (servir por HTTP — necessário para o Auth):
python -m http.server 8765
# Abrir: http://localhost:8765/login.html
```

Mais detalhes (incluindo Supabase local opcional) em
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Backend (Supabase)

- Projeto nuvem deste clone de teste: `qpvgpfwuurqcqprnpxua` (`contratos-dag`; credenciais publishable hardcoded no HTML).
- PostgreSQL 17: 37 tabelas, 2 views, funções e RLS.
- Variáveis e boas práticas: [.env.example](.env.example).

## Documentação (`/docs`)

| Documento | Conteúdo |
|---|---|
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Design system: tokens, componentes (botões, badges, KPIs, tabelas, modais, kebab-menu), ícones, responsivo — seguir antes de criar/editar HTML/CSS. |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Visão geral, stack, organização do código. |
| [docs/SCHEMA.md](docs/SCHEMA.md) | Tabelas, colunas, relacionamentos, campos monetários e de status. |
| [docs/DATABASE.md](docs/DATABASE.md) | Migrations, views, funções, triggers, RLS, FKs. |
| [docs/ROUTES.md](docs/ROUTES.md) | Páginas e abas/menu. |
| [docs/MODULES.md](docs/MODULES.md) | Módulos funcionais e interdependências. |
| [docs/DATA_FLOW.md](docs/DATA_FLOW.md) | Fluxo Emenda → Licitação → Contrato → Ata → Execução. |
| [docs/BUSINESS_RULES.md](docs/BUSINESS_RULES.md) | Regras de negócio (inclui modelo anti-duplicidade de NF). |
| [docs/API.md](docs/API.md) | Uso de PostgREST, RPC, Auth e Storage. |
| [docs/SECURITY.md](docs/SECURITY.md) | Autenticação e modelo de permissões. |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Execução e deploy. |
| [docs/TESTING.md](docs/TESTING.md) | Estado dos testes e roteiro manual. |
| [docs/TODO.md](docs/TODO.md) | Pendências, pontos a confirmar e riscos. |

Histórico de mudanças: [CHANGELOG.md](CHANGELOG.md).
Orientações para agentes/IA: [CLAUDE.md](CLAUDE.md).

## Permissões (resumo)

- **admin**: acesso total.
- **usuário comum**: acesso por caixinhas (`user_tab_permissions`, ver/editar por aba).
- Conta nova / sem login: vê apenas a aba **Emendas**.

Detalhes em [docs/SECURITY.md](docs/SECURITY.md).

Relatório
Fiz a varredura em modo somente leitura. Não alterei nenhum arquivo, não rodei migration e não executei escrita no Supabase.
Fontes principais: [AGENTS.md](C:\\Users\\Patrick S Maffei\\sueq-equipamentos\\AGENTS.md), [README.md](C:\\Users\\Patrick S Maffei\\sueq-equipamentos\\README.md), [CHANGELOG.md](C:\\Users\\Patrick S Maffei\\sueq-equipamentos\\CHANGELOG.md), [index.html](C:\\Users\\Patrick S Maffei\\sueq-equipamentos\\index.html), [chamado.html](C:\\Users\\Patrick S Maffei\\sueq-equipamentos\\chamado.html), [schema_local.sql](C:\\Users\\Patrick S Maffei\\sueq-equipamentos\\schema_local.sql) e a migration de status de aquisição.
Regras Mapeadas
Ambiente e fonte da verdade: o site é estático, sem build/framework; o backend válido deste clone é o Supabase qpvgpfwuurqcqprnpxua; o projeto original djtwoesmgeetnrztyvzw não deve receber escrita. O fluxo real está no Supabase + JS; dumps locais e campos legados podem estar defasados.

Permissões: admin vê/edita tudo; usuário comum depende de user_tab_permissions; edição exige can_view e can_edit; conta nova começa vendo só Emendas; usuarios e cadastros são admin-only; RLS via can_access_tab é a regra autoritativa; usuário não pode excluir a própria conta pela tela.

Cadastros mestre: pessoas, parlamentares, seções, unidades e status têm ativo; fornecedores não usam ativo; alguns campos são obrigatórios por entidade; há unicidade para CNPJ, parlamentares, seções, unidades, status por contexto e protocolos. Cadastros criados inline entram em revisão; podem ser aprovados, mesclados com reapontamento de referências ou excluídos com alerta de vínculos.

Emendas: a aba Emendas é painel consolidado, não fonte isolada. Status, CPL, contrato, AF, empenho, NF, patrimônio e entrega são derivados do fluxo real quando existe vínculo. Emendas municipais antigas ficam ocultas por padrão. Nova emenda cria uma emenda global e linhas por item/unidade; valor da linha = valor unitário x quantidade; saldo negativo é permitido só com confirmação. Exclusão de item é bloqueada se já houver recebimento, entrega ou unidade física.

Licitações/processos: processo exige identificador, tipo, natureza, seção e objeto. Os tipos disponíveis no formulário são CPL, SEI e Outro; ao escolher Outro, o tipo é informado em texto livre. A SC (Solicitação de Compra) pode ser registrada separadamente, mas é opcional. SEI aceita só números/separadores; CPL/outros podem ter letras. Para aquisição e ATA, valor estimado é soma automática dos itens. No saldo de Emendas, o valor planejado vem do cadastro da Emenda, o valor estimado entra enquanto o item está na licitação e o valor contratado passa a compor o executado/consumido quando o contrato é gerado. Itens já contratados ou executados saem do controle manual da licitação. Processos 100% contratados ficam ocultos por padrão. Em ATA, o vínculo com Emenda ocorre na execução da ATA, não no cadastro do processo.

Isolamento organizacional: todo registro operacional possui uma seção responsável. Usuário comum vê e edita somente registros de sua seção e apenas nas abas autorizadas. Chefia da divisão alcança todas as seções, mas continua sujeita às caixinhas de visualizar/editar. Administrador mantém autoridade total e escolhe no cabeçalho o contexto operacional de uma seção ou da divisão. Em novos cadastros, a seção vem preenchida e bloqueada para usuário comum; chefia e administrador escolhem a seção quando estiverem na visão da divisão. Chamados e Fiscalização são exclusivos da `SUEQ - EQUIP`.

Acesso público: sem login, o sistema permite consultar Emendas de todas as seções com o histórico consolidado dos itens — processo, contrato/ATA, AF, empenho, nota fiscal, patrimônio, série, recebimento e entrega — além de ler as unidades ativas necessárias ao formulário e abrir chamados com anexos. As políticas anônimas das tabelas operacionais retornam somente linhas realmente vinculadas a `emenda_itens`; processos, contratos, ATAs, fornecedores, itens, entregas, empenhos e notas fiscais sem vínculo com Emenda continuam privados.

Contratos e ATAs: contratos é a matriz de instrumentos; tipo_instrumento só pode ser CONTRATO ou ATA. Atas Rp é item próprio do menu, derivado de contratos, não subaba de Contratos. Valores numéricos devem vir dos campos valor_*_num; textos são legado. Contratos comuns ocultam ENCERRADO e CONCLUIDO por padrão. ATA tem vigência padrão de 12 meses; aquisição nasce como Aguardando emissão da AF.

Itens de contrato/ATA: ao gerar contrato, item parcial é dividido: uma linha contratada e saldo restante na licitação. ATA espelha itens de contrato em atas_itens. Saldo de ATA = quantidade contratada menos execuções. Execução de ATA não pode ultrapassar saldo nem reutilizar item de emenda já vinculado.

AF, empenho e prazos: aquisição contratada fica aguardando AF. AF exige empenho vinculado antes da emissão. ATA herda prazo da ATA/licitação; se não houver prazo, bloqueia emissão. Aquisição pode informar prazo manual. A emissão da primeira AF muda contrato de aquisição para VIGENTE; quando todos os itens de aquisição são 100% recebidos, vira CONCLUIDO.

Empenhos: saldo = valor empenhado - valor anulado - vínculos. Empenho deve se vincular a contrato/itens; ATA usa vínculo por execução/emenda item; aquisição permite múltiplos vínculos. Se vínculo exceder o valor, o sistema alerta/força confirmação. Alterar empenho recalcula saldos e reflete em ATA/Emendas.

NF e recebimento: NF tem valor total uma vez em notas_fiscais.valor_total; rateio fica em nota_fiscal_itens; unidade física referencia NF sem repetir valor. O sistema tenta detectar NF duplicada por chave ou número normalizado. Recebimento não cria empenho novo; herda o empenho da AF. Aquisição permite parcial/total; ATA exige AF antes do recebimento. Em ambos os fluxos, "Possui patrimônio?" é obrigatório: "Sim" grava uma unidade física por patrimônio; "Não" não cria unidades e mantém a quantidade consolidada. A escolha fica bloqueada após o primeiro recebimento do item. Em Atas Rp Vigentes, cada execução expande na própria tabela para listar seus patrimônios e oferecer a ficha completa "Ver tudo" por unidade física.

Exclusão de solicitação de ATA: permitida somente antes da emissão da AF. O botão desaparece quando existe AF ou qualquer etapa posterior; o banco também bloqueia exclusões diretas nesses casos. Uma exclusão ainda permitida remove os vínculos da execução com empenhos e recalcula os respectivos saldos.

Confirmação na unidade e inventário: só entra em Confirmação após recebimento interno com NF. Para confirmar entrega, exige data real, responsável e termo em PDF ou imagem. Termos vão para Storage. Inventário mostra consolidado antes de patrimônio/série; depois mostra uma linha por unidade física.

Chamados: Chamados Antigos vêm de Google Sheets e são leitura. Chamados Novos ficam no Supabase. Chamado público exige unidade, contato, urgência, patrimônio/equipamento, categoria/serviço/problema, descrição e rechamado sim/não; aceita no máximo 2 fotos. RPC gera protocolo SES-0000/MMYYYY e cria controle como Aguardando abertura. Abrir chamado exige contrato CPL; pendente exige motivo; e-mail para empresa só sai se contrato tiver e-mail cadastrado.

Fiscalização: trabalha sobre chamados_controle. Situações: não fiscalizado, pendente, conforme, conforme com ressalva, parcial, não conforme. Mudança de situação gera histórico. SLA é calculado entre abertura e atendimento. Termo de ateste exige OS selecionada, competência e NF; aplica esses dados às OS e registra vínculos com contratos/chamados.

Sanções: item elegível precisa ter CPL e estar atrasado, pendente ou aguardando entrega. Seleção é travada por mesmo CPL/empresa. Geração exige tipo e motivo; “outro motivo” exige descrição; empresa precisa resolver em Contratos. O sistema grava snapshot dos itens e gera documento com base na Lei 14.133/2021. No banco, sanção tem tipos/status permitidos e multa não pode ser negativa.

Pontos de atenção: o README aponta para /docs, mas a pasta docs não existe neste checkout. Há regras importantes apenas no CHANGELOG.md e no JS. Existem campos legados coexistindo com estruturas normalizadas, então algumas regras podem divergir se alguém editar manualmente campos antigos.
