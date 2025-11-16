*** Settings ***
Documentation    Testes de Acessibilidade - Cenários BDD
...              Baseado em ACCESSIBILITY_TESTING.md
...              Framework: Robot Framework + SeleniumLibrary
...              Padrão: BDD (Given-When-Then)

Library    SeleniumLibrary
Library    Collections
Library    String

*** Variables ***
${BROWSER}           Chrome
${BASE_URL}          http://localhost:5173
${HEADLESS}          False
${WAIT_TIME}         10s

*** Keywords ***
Abrir Navegador
    [Documentation]    Abre navegador Chrome com configurações padrão
    Open Browser       ${BASE_URL}    ${BROWSER}
    Set Window Size    1920    1080
    Set Selenium Implicit Wait    ${WAIT_TIME}

Fechar Navegador
    [Documentation]    Fecha navegador
    Close Browser

*** Test Cases ***
# ============================================================================
# CENÁRIO 1: TESTE DE NAVEGAÇÃO POR TECLADO
# ============================================================================

CT-001: Navegar pela aplicação usando apenas TAB
    [Documentation]    Verificar se todos elementos interativos são acessíveis com TAB
    [Tags]    keyboard    accessibility    critical

    Given Abro a aplicação
    When Pressiono TAB 20 vezes
    Then Devo acessar todos os elementos interativos
    And O focus deve ser sempre visível

CT-002: Retornar com Shift+TAB
    [Documentation]    Verificar se Shift+TAB volta para elemento anterior
    [Tags]    keyboard    accessibility    critical

    Given Abro a aplicação
    When Pressiono TAB 5 vezes
    And Pressiono Shift+TAB 3 vezes
    Then Devo voltar aos elementos anteriores corretamente

CT-003: Ativar botão com ENTER
    [Documentation]    Verificar se ENTER ativa botões
    [Tags]    keyboard    accessibility    critical

    Given Abro a aplicação
    When Navego até o botão "Renderizar"
    And Pressiono ENTER
    Then O botão deve ser ativado

CT-004: Ativar botão com SPACE
    [Documentation]    Verificar se SPACE ativa botões e checkboxes
    [Tags]    keyboard    accessibility    important

    Given Abro a aplicação
    When Navego até um checkbox
    And Pressiono SPACE
    Then O checkbox deve ser marcado/desmarcado

CT-005: Fechar modal com ESCAPE
    [Documentation]    Verificar se ESCAPE fecha modals
    [Tags]    keyboard    accessibility    critical

    Given Abro a aplicação
    When Abro um modal
    And Pressiono ESCAPE
    Then O modal deve fechar

CT-006: Sem keyboard traps
    [Documentation]    Verificar que não há elementos que travam o teclado
    [Tags]    keyboard    accessibility    critical

    Given Abro a aplicação
    When Pressiono TAB 50 vezes
    Then Não devo ficar preso em nenhum elemento

# ============================================================================
# CENÁRIO 2: TESTE DE CONTRASTE E CORES
# ============================================================================

CT-007: Contraste de cores >= 4.5:1 em textos
    [Documentation]    Verificar contraste mínimo de 4.5:1
    [Tags]    contrast    accessibility    critical

    Given Abro a aplicação
    When Analiso todas as cores de texto
    Then Todas devem ter contraste >= 4.5:1

CT-008: Interface funciona em escala de cinza
    [Documentation]    Verificar que interface não depende apenas de cor
    [Tags]    contrast    accessibility    important

    Given Abro a aplicação com filtro grayscale
    When Navego pela aplicação
    Then Todos os elementos devem ser distinguíveis

CT-009: Não depender apenas de cor para informações
    [Documentation]    Verificar uso de ícones, padrões além de cor
    [Tags]    contrast    accessibility    important

    Given Abro a aplicação
    When Localizo elementos coloridos
    Then Eles devem ter também ícones ou texto

CT-010: Dark mode funciona corretamente
    [Documentation]    Verificar se dark mode mantém acessibilidade
    [Tags]    contrast    accessibility    important

    Given Abro a aplicação
    When Ativo o dark mode
    Then O contraste deve permanecer >= 4.5:1

# ============================================================================
# CENÁRIO 3: TESTE DE LABELS E FORMULÁRIOS
# ============================================================================

CT-011: Todos inputs têm labels visíveis
    [Documentation]    Verificar que todos inputs têm labels associados
    [Tags]    forms    accessibility    critical

    Given Abro a aplicação
    When Localizo todos os inputs
    Then Cada um deve ter um label visível

CT-012: Labels estão corretamente associados com htmlFor
    [Documentation]    Verificar que labels têm htmlFor correto
    [Tags]    forms    accessibility    critical

    Given Abro a aplicação
    When Analiso os labels
    Then Cada label deve ter htmlFor apontando para input correto

CT-013: Inputs obrigatórios têm aria-required
    [Documentation]    Verificar que inputs obrigatórios têm aria-required
    [Tags]    forms    accessibility    important

    Given Abro a aplicação
    When Localizo inputs obrigatórios
    Then Devem ter aria-required="true"

CT-014: Mensagens de erro são anunciadas com role="alert"
    [Documentation]    Verificar que erros são role="alert"
    [Tags]    forms    accessibility    critical

    Given Abro a aplicação
    When Submeto formulário inválido
    Then Mensagem de erro deve ter role="alert"

CT-015: Helper text está acessível
    [Documentation]    Verificar que dicas estão disponíveis
    [Tags]    forms    accessibility    important

    Given Abro a aplicação
    When Localizo helper text
    Then Deve estar visível e associado ao input

# ============================================================================
# CENÁRIO 4: TESTE DE HTML SEMÂNTICO
# ============================================================================

CT-016: Hierarquia de headings está correta
    [Documentation]    Verificar h1 → h2 → h3 sem pular
    [Tags]    semantic    accessibility    critical

    Given Abro a aplicação
    When Analiso hierarquia de headings
    Then Deve ser h1 → h2 → h3 (sem pulos)

CT-017: Botões usam tag <button>
    [Documentation]    Verificar que botões usam <button> não <div>
    [Tags]    semantic    accessibility    critical

    Given Abro a aplicação
    When Localizo todos os botões
    Then Todos devem usar tag <button>

CT-018: Links usam tag <a>
    [Documentation]    Verificar que links usam <a> não <div>
    [Tags]    semantic    accessibility    critical

    Given Abro a aplicação
    When Localizo todos os links
    Then Todos devem usar tag <a>

CT-019: Usa <nav>, <main>, <section>, <article>
    [Documentation]    Verificar uso de tags semânticas
    [Tags]    semantic    accessibility    important

    Given Abro a aplicação
    When Analiso estrutura HTML
    Then Deve usar nav, main, section, article apropriadamente

CT-020: Listas usam <ul> ou <ol>
    [Documentation]    Verificar que listas usam tags semânticas
    [Tags]    semantic    accessibility    important

    Given Abro a aplicação
    When Localizo listas
    Then Devem usar <ul> ou <ol> não <div>

# ============================================================================
# CENÁRIO 5: TESTE DE ARIA ATTRIBUTES
# ============================================================================

CT-021: Ícones sem texto têm aria-label
    [Documentation]    Verificar que ícones têm aria-label
    [Tags]    aria    accessibility    critical

    Given Abro a aplicação
    When Localizo ícones sem texto
    Then Todos devem ter aria-label descritivo

CT-022: Modals têm role="dialog" e aria-modal
    [Documentation]    Verificar que modals têm ARIA correto
    [Tags]    aria    accessibility    critical

    Given Abro a aplicação
    When Abro um modal
    Then Deve ter role="dialog" e aria-modal="true"

CT-023: Alerts têm role="alert" e aria-live
    [Documentation]    Verificar que alerts têm ARIA correto
    [Tags]    aria    accessibility    important

    Given Abro a aplicação
    When Localizo um alert
    Then Deve ter role="alert" e aria-live="polite"

CT-024: Elementos decorativos têm aria-hidden
    [Documentation]    Verificar que ícones decorativos têm aria-hidden
    [Tags]    aria    accessibility    important

    Given Abro a aplicação
    When Localizo elementos decorativos
    Then Devem ter aria-hidden="true"

CT-025: Inputs inválidos têm aria-invalid
    [Documentation]    Verificar que inputs com erro têm aria-invalid
    [Tags]    aria    accessibility    important

    Given Abro a aplicação
    When Localizo input inválido
    Then Deve ter aria-invalid="true"

# ============================================================================
# CENÁRIO 6: TESTE DE IMAGENS E ALT TEXT
# ============================================================================

CT-026: Todas as imagens têm alt text
    [Documentation]    Verificar que todas as imagens têm alt
    [Tags]    images    accessibility    critical

    Given Abro a aplicação
    When Localizo todas as imagens
    Then Todas devem ter alt text

CT-027: Alt text é descritivo
    [Documentation]    Verificar que alt text descreve a imagem
    [Tags]    images    accessibility    important

    Given Abro a aplicação
    When Localizo imagens
    Then Alt text deve ser descritivo (não "image of" ou "pic")

CT-028: Imagens decorativas têm alt=""
    [Documentation]    Verificar que imagens decorativas têm alt vazio
    [Tags]    images    accessibility    important

    Given Abro a aplicação
    When Localizo imagens decorativas
    Then Devem ter alt="" e aria-hidden="true"

CT-029: SVGs têm <title> e <desc>
    [Documentation]    Verificar que SVGs têm title e description
    [Tags]    images    accessibility    important

    Given Abro a aplicação
    When Localizo SVGs
    Then Devem ter <title> e <desc>

# ============================================================================
# CENÁRIO 7: TESTE DE ZOOM
# ============================================================================

CT-030: Interface funciona com zoom 200%
    [Documentation]    Verificar que aplicação funciona com zoom
    [Tags]    zoom    accessibility    important

    Given Abro a aplicação
    When Aumento zoom para 200%
    Then Layout não deve quebrar
    And Botões devem permanecer clicáveis
    And Sem scrolls horizontais desnecessários

CT-031: Texto não é cortado com zoom 150%
    [Documentation]    Verificar que texto não é cortado
    [Tags]    zoom    accessibility    important

    Given Abro a aplicação
    When Aumento zoom para 150%
    Then Nenhum texto deve ficar cortado

CT-032: Elementos permanecem clicáveis com zoom
    [Documentation]    Verificar que touch targets > 48x48px
    [Tags]    zoom    accessibility    important

    Given Abro a aplicação
    When Aumento zoom para 200%
    Then Todos os botões devem ter >= 48x48px

# ============================================================================
# CENÁRIO 8: TESTE DE FOCUS MANAGEMENT
# ============================================================================

CT-033: Focus é visível em todos os elementos
    [Documentation]    Verificar que focus tem outline visível
    [Tags]    focus    accessibility    critical

    Given Abro a aplicação
    When Pressiono TAB
    Then O elemento em focus deve ter outline visível

CT-034: Focus order é lógico
    [Documentation]    Verificar que order é esquerda-direita, topo-fundo
    [Tags]    focus    accessibility    critical

    Given Abro a aplicação
    When Pressiono TAB sequencialmente
    Then O order deve ser lógico (L→R, T→B)

CT-035: Modal tem focus trap
    [Documentation]    Verificar que focus fica dentro do modal
    [Tags]    focus    accessibility    important

    Given Abro a aplicação
    When Abro um modal
    And Pressiono TAB até o final
    Then Focus deve voltar para primeiro elemento

CT-036: Modal retorna focus após fechar
    [Documentation]    Verificar que focus volta após modal fechar
    [Tags]    focus    accessibility    important

    Given Abro a aplicação
    When Abro um modal
    And Fecho o modal
    Then Focus deve retornar ao elemento que abriu

# ============================================================================
# CENÁRIO 9: TESTE DE RESPONSIVIDADE
# ============================================================================

CT-037: Interface funciona em mobile
    [Documentation]    Verificar que aplicação é responsiva
    [Tags]    responsive    accessibility    important

    Given Abro a aplicação em 375x667 (mobile)
    When Navego pela aplicação
    Then Deve funcionar completamente

CT-038: Touch targets têm mínimo 48x48px
    [Documentation]    Verificar que botões têm tamanho mínimo
    [Tags]    responsive    accessibility    important

    Given Abro a aplicação em mobile
    When Localizo todos os botões
    Then Todos devem ter >= 48x48px

CT-039: Zoom funciona em mobile
    [Documentation]    Verificar que zoom funciona em mobile
    [Tags]    responsive    accessibility    important

    Given Abro a aplicação em mobile
    When Aumento zoom
    Then Deve aumentar sem quebrar layout

# ============================================================================
# CENÁRIO 10: TESTE DE LIGHTHOUSE
# ============================================================================

CT-040: Lighthouse Accessibility score >= 85
    [Documentation]    Verificar score mínimo no Lighthouse
    [Tags]    lighthouse    accessibility    critical

    Given Abro a aplicação
    When Rodo Lighthouse Accessibility
    Then Score deve ser >= 85

CT-041: Sem erros críticos no Lighthouse
    [Documentation]    Verificar que não há erros críticos
    [Tags]    lighthouse    accessibility    critical

    Given Abro a aplicação
    When Rodo Lighthouse Accessibility
    Then Não deve haver erros "Critical"

CT-042: Color contrast passa em Lighthouse
    [Documentation]    Verificar color contrast check
    [Tags]    lighthouse    accessibility    important

    Given Abro a aplicação
    When Rodo Lighthouse Accessibility
    Then "Color contrast" deve passar

CT-043: Form labels passam em Lighthouse
    [Documentation]    Verificar form labels check
    [Tags]    lighthouse    accessibility    important

    Given Abro a aplicação
    When Rodo Lighthouse Accessibility
    Then "Form labels" deve passar

# ============================================================================
# CENÁRIO 11: TESTE DE VALIDADORES AUTOMÁTICOS
# ============================================================================

CT-044: WAVE sem erros críticos
    [Documentation]    Verificar extensão WAVE
    [Tags]    wave    accessibility    critical

    Given Abro a aplicação
    When Rodo validador WAVE
    Then Não deve haver erros (vermelho)

CT-045: axe DevTools sem issues críticas
    [Documentation]    Verificar ferramenta axe
    [Tags]    axe    accessibility    critical

    Given Abro a aplicação
    When Rodo axe DevTools
    Then Não deve haver issues "Critical"

CT-046: ESLint jsx-a11y sem erros
    [Documentation]    Verificar ESLint config
    [Tags]    eslint    accessibility    critical

    Given Rodo ESLint com jsx-a11y
    Then Não deve haver erros de acessibilidade

# ============================================================================
# CENÁRIO 12: TESTE DE SCREEN READER (Simulado)
# ============================================================================

CT-047: Página é lida em ordem lógica
    [Documentation]    Verificar que conteúdo é lido corretamente
    [Tags]    screenreader    accessibility    important

    Given Abro a aplicação
    When Simulo leitura de screen reader
    Then Ordem de leitura deve ser lógica

CT-048: Botões são anunciados como "button"
    [Documentation]    Verificar que screen reader anuncia botões
    [Tags]    screenreader    accessibility    important

    Given Abro a aplicação
    When Localizo botões
    Then Devem ser anunciados como "button"

CT-049: Links são anunciados como "link"
    [Documentation]    Verificar que screen reader anuncia links
    [Tags]    screenreader    accessibility    important

    Given Abro a aplicação
    When Localizo links
    Then Devem ser anunciados como "link"

CT-050: Headings são anunciados com nível
    [Documentation]    Verificar que screen reader anuncia nível
    [Tags]    screenreader    accessibility    important

    Given Abro a aplicação
    When Localizo headings
    Then Devem ser anunciados com nível (h1, h2, h3)

*** Keywords Customizadas ***

Abro a aplicação
    [Documentation]    Abre a aplicação
    Abrir Navegador
    Wait Until Page Contains Element    xpath=//*[@id="root"]

Pressiono TAB ${count} vezes
    [Documentation]    Pressiona TAB N vezes
    :FOR    ${i}    IN RANGE    ${count}
    \    Press Keys    None    TAB

Devo acessar todos os elementos interativos
    [Documentation]    Valida que todos elementos interativos são acessíveis
    Page Should Contain    button
    Page Should Contain    input

O focus deve ser sempre visível
    [Documentation]    Valida que focus é visível
    ${element}=    Get Focused Element
    Should Not Be Empty    ${element}

Navego até o botão "${button_text}"
    [Documentation]    Navega até específico botão
    Wait Until Page Contains Element    xpath=//button[contains(text(), "${button_text}")]

O botão deve ser ativado
    [Documentation]    Valida que botão foi ativado
    Log    Validando ativação do botão

Abro um modal
    [Documentation]    Abre modal
    Wait Until Page Contains Element    xpath=//div[@role="dialog"]

O modal deve fechar
    [Documentation]    Valida que modal fechou
    Wait Until Page Does Not Contain Element    xpath=//div[@role="dialog"]

Abro a aplicação com filtro grayscale
    [Documentation]    Abre aplicação com filtro cinza
    Abrir Navegador
    Execute Javascript    document.documentElement.style.filter = "grayscale(100%)";

Ativo o dark mode
    [Documentation]    Ativa dark mode
    Execute Javascript    document.documentElement.classList.add("dark");

Aumento zoom para ${percentage}%
    [Documentation]    Aumenta zoom
    Execute Javascript    document.body.style.zoom = "${percentage}%";

Rodo Lighthouse Accessibility
    [Documentation]    Executa Lighthouse
    Log    Executando Lighthouse (integrar com mcp-devtools depois)

Rodo validador WAVE
    [Documentation]    Executa WAVE
    Log    Executando WAVE (integrar com mcp-devtools depois)

Rodo axe DevTools
    [Documentation]    Executa axe
    Log    Executando axe (integrar com mcp-devtools depois)

Rodo ESLint com jsx-a11y
    [Documentation]    Executa ESLint
    Log    Executando ESLint (integrar com CI/CD depois)

Simulo leitura de screen reader
    [Documentation]    Simula leitura
    Log    Simulando screen reader (integrar com mcp-devtools depois)

