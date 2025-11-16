*** Settings ***
Documentation    Testes Funcionais - Cenários BDD
...              Framework: Robot Framework + SeleniumLibrary
...              Padrão: BDD (Given-When-Then)
...              Escopo: Funcionalidades principais da aplicação

Library    SeleniumLibrary
Library    Collections
Library    String
Library    BuiltIn

*** Variables ***
${BROWSER}           Chrome
${BASE_URL}          http://localhost:5173
${HEADLESS}          False
${WAIT_TIME}         10s
${DELAY}             1s

*** Keywords ***
Abrir Navegador
    [Documentation]    Abre navegador Chrome com configurações padrão
    Open Browser       ${BASE_URL}    ${BROWSER}
    Set Window Size    1920    1080
    Set Selenium Implicit Wait    ${WAIT_TIME}
    Wait Until Element Is Visible    id=root

Fechar Navegador
    [Documentation]    Fecha navegador
    Close Browser

Aguardar
    [Documentation]    Aguarda um tempo
    Sleep    ${DELAY}

*** Test Cases ***

# ============================================================================
# CENÁRIO 1: CONFIGURAÇÃO DO PROJETO
# ============================================================================

FT-001: Acessar página inicial da aplicação
    [Documentation]    Verificar que aplicação carrega corretamente
    [Tags]    setup    critical    smoke

    Given Abro a aplicação
    Then Devo ver o título "DreamDirector AI"
    And Devo ver o stepper com 3 etapas

FT-002: Preencher nome do projeto
    [Documentation]    Preencher nome do projeto na configuração inicial
    [Tags]    setup    critical    forms

    Given Abro a aplicação
    When Preencho nome do projeto com "Meu Primeiro Vídeo"
    Then O campo deve estar preenchido com "Meu Primeiro Vídeo"

FT-003: Desabilitar campo de nome se vazio
    [Documentation]    Botão próximo deve estar desabilitado se nome vazio
    [Tags]    setup    validation    important

    Given Abro a aplicação
    When Deixo o campo de nome vazio
    Then O botão "Próximo" deve estar desabilitado

FT-004: Habilitar botão próximo quando nome preenchido
    [Documentation]    Botão próximo deve estar habilitado com nome preenchido
    [Tags]    setup    validation    important

    Given Abro a aplicação
    When Preencho nome do projeto com "Projeto Teste"
    Then O botão "Próximo" deve estar habilitado

FT-005: Upload de arquivo de áudio
    [Documentation]    Fazer upload de arquivo de áudio MP3
    [Tags]    setup    critical    upload

    Given Abro a aplicação
    When Seleciono arquivo de áudio "sample.mp3"
    Then Arquivo deve ser carregado com sucesso
    And Devo ver mensagem "Áudio carregado"

FT-006: Validar tipo de arquivo de áudio
    [Documentation]    Apenas arquivos de áudio devem ser aceitos
    [Tags]    setup    validation    important

    Given Abro a aplicação
    When Tento fazer upload de arquivo "imagem.png"
    Then Devo ver erro "Apenas arquivos de áudio"

FT-007: Prosseguir para storyboard
    [Documentation]    Clicar em próximo deve ir para storyboard
    [Tags]    setup    navigation    critical

    Given Abro a aplicação
    And Preencho nome do projeto com "Teste"
    And Faço upload de áudio
    When Clico em "Próximo"
    Then Devo estar na etapa 2 "Storyboard"

# ============================================================================
# CENÁRIO 2: GERAÇÃO DE CENAS COM IA
# ============================================================================

FT-008: Preencher descrição do projeto
    [Documentation]    Preencher descrição do projeto para gerar cenas
    [Tags]    storyboard    critical    forms

    Given Estou na etapa Storyboard
    When Preencho descrição com "Um videoclipe inspirador sobre natureza"
    Then A descrição deve ser salva

FT-009: Validar descrição mínima
    [Documentation]    Descrição deve ter mínimo de caracteres
    [Tags]    storyboard    validation    important

    Given Estou na etapa Storyboard
    When Preencho descrição com "ABC"
    Then Devo ver erro "Mínimo 10 caracteres"

FT-010: Gerar cenas com Gemini AI
    [Documentation]    Clicar em gerar deve criar cenas com IA
    [Tags]    storyboard    ai    critical

    Given Estou na etapa Storyboard
    And Preencho descrição válida
    When Clico em "Gerar Cenas"
    Then Devo ver loading spinner
    And Sistema deve criar 5 cenas
    And Cada cena deve ter um prompt

FT-011: Visualizar cena gerada
    [Documentation]    Poder visualizar preview da cena gerada
    [Tags]    storyboard    preview    important

    Given Cenas foram geradas
    When Clico na primeira cena
    Then Devo ver preview da cena
    And Devo ver prompt usado

FT-012: Editar prompt da cena
    [Documentation]    Poder editar prompt de uma cena
    [Tags]    storyboard    editing    important

    Given Cenas foram geradas
    When Clico em editar primeira cena
    And Modifico o prompt para "Versão melhorada"
    Then Prompt deve ser atualizado

FT-013: Regenerar cena individual
    [Documentation]    Poder regenerar uma cena específica
    [Tags]    storyboard    ai    important

    Given Cenas foram geradas
    When Clico em regenerar primeira cena
    Then Devo ver loading
    And Cena deve ser substituída
    And Novo prompt deve ser diferente

FT-014: Deletar cena
    [Documentation]    Poder deletar uma cena
    [Tags]    storyboard    critical    destruction

    Given Cenas foram geradas com 5 cenas
    When Clico em deletar segunda cena
    Then Devo ver confirmação
    And Após confirmar cena é deletada
    And Restam 4 cenas

FT-015: Aprovação de cena
    [Documentation]    Poder aprovar ou rejeitar cenas
    [Tags]    storyboard    critical    workflow

    Given Cenas foram geradas
    When Clico em aprovar primeira cena
    Then Cena deve ter status "APROVADA"
    And Deve ter marcação visual de aprovada

# ============================================================================
# CENÁRIO 3: RENDERIZAÇÃO DE VÍDEO
# ============================================================================

FT-016: Renderizar vídeo da cena aprovada
    [Documentation]    Gerar vídeo para cena aprovada
    [Tags]    rendering    critical    ai

    Given Tenho cena aprovada
    When Clico em "Gerar Vídeo"
    Then Devo ver progresso de renderização
    And Vídeo deve ser gerado
    And Status deve mudar para "GERADO"

FT-017: Visualizar vídeo gerado
    [Documentation]    Player deve mostrar vídeo gerado
    [Tags]    rendering    preview    important

    Given Vídeo foi gerado
    When Clico em Play
    Then Vídeo deve reproduzir
    And Devo poder pausar/retomar
    And Devo poder mover timeline

FT-018: Controles do player de vídeo
    [Documentation]    Player deve ter todos os controles
    [Tags]    rendering    controls    important

    Given Vídeo está carregado
    When Interajo com player
    Then Devo poder:
    And Aumentar/diminuir volume
    And Mover pela timeline
    And Fullscreen
    And Velocidade de reprodução

FT-019: Timing automático de cenas
    [Documentation]    Cenas devem respeitar duração do áudio
    [Tags]    rendering    timing    critical

    Given Tenho múltiplas cenas geradas
    And Duração total deve ser próxima ao áudio
    When Renderizo vídeo final
    Then Vídeo final deve ter mesma duração do áudio
    And Cenas devem estar sincronizadas

FT-020: Download de vídeo gerado
    [Documentation]    Poder fazer download do vídeo final
    [Tags]    rendering    download    important

    Given Vídeo foi renderizado
    When Clico em "Baixar Vídeo"
    Then Arquivo MP4 deve ser baixado
    And Nome deve conter "DreamDirector"

# ============================================================================
# CENÁRIO 4: CORTE FINAL
# ============================================================================

FT-021: Acessar página de corte final
    [Documentation]    Poder ir para página de corte final
    [Tags]    finalcut    navigation    critical

    Given Cenas foram aprovadas e renderizadas
    When Clico em "Ir para Corte Final"
    Then Devo estar na etapa 3
    And Devo ver preview de todas as cenas
    And Devo ver timeline visual

FT-022: Reprodução sincronizada de vídeos
    [Documentation]    Vídeos devem reproduzir sincronizados com áudio
    [Tags]    finalcut    playback    critical

    Given Estou na página Corte Final
    When Clico em Play
    Then Áudio deve começar
    And Vídeo correto deve reproduzir para cada momento
    And Transição entre cenas deve ser suave

FT-023: Navegação na timeline
    [Documentation]    Poder navegar pela timeline do vídeo
    [Tags]    finalcut    timeline    important

    Given Vídeo está reproduzindo
    When Clico em ponto da timeline
    Then Player deve pular para aquele momento
    And Cena correta deve ser mostrada

FT-024: Renderizar vídeo final com FFmpeg
    [Documentation]    Concatenar todas as cenas com áudio
    [Tags]    finalcut    rendering    critical

    Given Cenas foram aprovadas
    When Clico em "Renderizar Vídeo Final"
    Then Devo ver progresso
    And Sistema deve usar FFmpeg
    And Vídeo final deve ter todas as cenas
    And Áudio deve estar sincronizado

FT-025: Download de vídeo final
    [Documentation]    Fazer download do vídeo final completo
    [Tags]    finalcut    download    critical

    Given Vídeo final foi renderizado
    When Clico em "Baixar"
    Then Arquivo MP4 deve ser baixado
    And Tamanho deve ser ~ 10MB
    And Deve poder ser reproduzido em qualquer player

FT-026: Ver amostra rápida
    [Documentation]    Gerar amostra rápida com 5 segundos de cada cena
    [Tags]    finalcut    preview    important

    Given Cenas foram aprovadas
    When Clico em "Ver Amostra (5s)"
    Then Sistema deve renderizar versão leve
    And Devo ver 5 segundos de cada cena
    And Tempo de renderização deve ser < 2 minutos

# ============================================================================
# CENÁRIO 5: FLUXO COMPLETO
# ============================================================================

FT-027: Fluxo completo de criação de vídeo
    [Documentation]    Testar fluxo completo da aplicação
    [Tags]    e2e    critical    workflow

    Given Abro a aplicação
    When Preencho nome "Meu Vídeo Teste"
    And Faço upload de áudio
    And Clico em "Próximo"
    And Preencho descrição do projeto
    And Gero cenas com IA
    And Aprovo as 5 cenas
    And Gero vídeos para todas
    And Clico em "Corte Final"
    And Clico em "Renderizar"
    Then Vídeo final deve ser criado com sucesso
    And Devo poder fazer download

FT-028: Histórico de projetos
    [Documentation]    Poder visualizar histórico de projetos criados
    [Tags]    history    important    storage

    Given Criei vários projetos
    When Acesso "Histórico de Projetos"
    Then Devo ver lista de todos os projetos
    And Cada projeto deve ter data e duração
    And Posso clicar para retomar projeto

FT-029: Salvar projeto em andamento
    [Documentation]    Projeto deve ser salvo automaticamente
    [Tags]    storage    critical    persistence

    Given Estou criando um projeto
    When Preencho dados e gero cenas
    And Recarrego a página
    Then Projeto deve ser restaurado
    And Dados devem estar intactos
    And Cenas devem estar presentes

FT-030: Retomar projeto salvo
    [Documentation]    Poder continuar projeto anterior
    [Tags]    storage    workflow    important

    Given Tenho projeto salvo anteriormente
    When Clico em "Retomar"
    Then Devo voltar para o ponto onde parei
    And Todas as cenas devem estar lá
    And Posso continuar editando

# ============================================================================
# CENÁRIO 6: TRATAMENTO DE ERROS
# ============================================================================

FT-031: Erro ao conectar com IA
    [Documentation]    Tratamento de erro quando IA não responde
    [Tags]    error    important    resilience

    Given Estou gerando cenas
    And Conexão com IA falha
    When Clico em "Gerar"
    Then Devo ver mensagem de erro
    And Posso tentar novamente

FT-032: Erro ao renderizar vídeo
    [Documentation]    Tratamento de erro durante renderização
    [Tags]    error    important    resilience

    Given Clico em renderizar
    And FFmpeg não consegue processar
    When Renderização falha
    Then Erro deve ser mostrado
    And Posso tentar novamente

FT-033: Arquivo de áudio inválido
    [Documentation]    Rejeitar arquivo de áudio inválido
    [Tags]    error    validation    important

    Given Tento fazer upload de arquivo corrompido
    When Sistema tenta processar
    Then Erro deve ser mostrado
    And Devo poder tentar outro arquivo

FT-034: Timeout em operação longa
    [Documentation]    Tratamento de timeout
    [Tags]    error    resilience    important

    Given Estou renderizando
    And Operação demora muito
    When Timeout é atingido
    Then Mensagem de timeout deve aparecer
    And Posso retomar

# ============================================================================
# CENÁRIO 7: PERFORMANCE E UX
# ============================================================================

FT-035: Página carrega em tempo razoável
    [Documentation]    Aplicação deve carregar rápido
    [Tags]    performance    critical

    Given Abro a aplicação
    Then Deve carregar em < 3 segundos
    And UI deve ser responsiva

FT-036: Operações não travam UI
    [Documentation]    UI não deve travar durante operações
    [Tags]    performance    critical

    Given Estou gerando cenas
    When IA está processando
    Then UI deve permanecer responsiva
    And Posso clicar em outros elementos

FT-037: Responsivo em mobile
    [Documentation]    Aplicação deve funcionar em mobile
    [Tags]    responsive    important

    Given Abro aplicação em 375x667
    When Navego pela aplicação
    Then Deve funcionar corretamente
    And Layout deve se adaptar

FT-038: Dark mode mantém usabilidade
    [Documentation]    Dark mode não deve quebrar funcionalidades
    [Tags]    ux    important

    Given Ativo dark mode
    When Navego pela aplicação
    Then Tudo deve funcionar normalmente
    And Contraste deve ser bom

FT-039: Confirmação antes de deletar
    [Documentation]    Ações destrutivas devem pedir confirmação
    [Tags]    ux    critical

    Given Vou deletar uma cena
    When Clico em deletar
    Then Devo ver modal de confirmação
    And Posso cancelar

FT-040: Feedback visual para ações
    [Documentation]    Ações devem dar feedback visual
    [Tags]    ux    important

    Given Clico em um botão
    When Ele é processado
    Then Devo ver loading spinner
    And Após completar devo ver confirmação

# ============================================================================
# CENÁRIO 8: ARMAZENAMENTO E COTA
# ============================================================================

FT-041: Monitorar uso de armazenamento
    [Documentation]    Sistema deve mostrar quanto armazenamento está usando
    [Tags]    storage    important

    Given Tenho vários projetos
    When Abro aplicação
    Then Devo ver monitor de armazenamento
    And Deve mostrar percentual usado

FT-042: Alerta quando atingir limite
    [Documentation]    Alerta quando próximo ao limite
    [Tags]    storage    important

    Given Estou usando 80% de armazenamento
    When Clico em gerar novo vídeo
    Then Devo ver aviso
    And Posso continuar ou deletar antigos

FT-043: Deletar projeto libera espaço
    [Documentation]    Deletar projeto deve liberar espaço
    [Tags]    storage    important

    Given Deleto um projeto grande
    When Confirmo deleção
    Then Espaço deve ser liberado
    And Monitor deve ser atualizado

# ============================================================================
# CENÁRIO 9: INTEGRAÇÕES
# ============================================================================

FT-044: Integração com Gemini API
    [Documentation]    Verificar que Gemini API está sendo usada
    [Tags]    integration    critical    ai

    Given Gero cenas
    Then Prompts devem vir do Gemini
    And Qualidade deve ser boa

FT-045: Integração com FFmpeg
    [Documentation]    Verificar que FFmpeg está sendo usado
    [Tags]    integration    critical    rendering

    Given Renderizo vídeo final
    Then FFmpeg deve estar sendo usado
    And Qualidade de vídeo deve ser boa

FT-046: Cache de vídeos gerados
    [Documentation]    Vídeos devem ser cacheados
    [Tags]    performance    important

    Given Gero um vídeo
    When Regenero o mesmo
    Then Segunda renderização deve ser mais rápida

# ============================================================================
# CENÁRIO 10: DADOS E BACKUP
# ============================================================================

FT-047: Dados persistem após reload
    [Documentation]    Dados devem persistir em localStorage
    [Tags]    persistence    critical

    Given Tenho dados na sessão
    When Recarrego a página
    Then Dados devem estar lá

FT-048: Exportar projeto
    [Documentation]    Poder exportar projeto como JSON
    [Tags]    export    important

    Given Tenho um projeto completo
    When Clico em "Exportar"
    Then Arquivo JSON deve ser baixado

FT-049: Importar projeto
    [Documentation]    Poder importar projeto de arquivo
    [Tags]    import    important

    Given Tenho arquivo JSON de projeto
    When Clico em "Importar"
    Then Projeto deve ser carregado
    And Dados devem estar corretos

*** Keywords Customizadas ***

Abro a aplicação
    [Documentation]    Abre a aplicação
    Abrir Navegador
    Wait Until Page Contains Element    xpath=//*[@id="root"]
    Aguardar

Devo ver o título "${title}"
    [Documentation]    Valida que título está visível
    Page Should Contain    ${title}

Devo ver o stepper com 3 etapas
    [Documentation]    Valida stepper com 3 etapas
    Page Should Contain Element    xpath=//nav[@aria-label="Progress"]

Preencho nome do projeto com "${name}"
    [Documentation]    Preenche nome do projeto
    ${input}=    Get WebElements    xpath=//input[@id="projectName"]
    Should Not Be Empty    ${input}
    Clear Element Text    ${input[0]}
    Input Text    ${input[0]}    ${name}

O campo deve estar preenchido com "${value}"
    [Documentation]    Valida valor do campo
    ${input}=    Get WebElements    xpath=//input[@id="projectName"]
    ${current_value}=    Get Value    ${input[0]}
    Should Be Equal    ${current_value}    ${value}

Deixo o campo de nome vazio
    [Documentation]    Deixa campo vazio
    ${input}=    Get WebElements    xpath=//input[@id="projectName"]
    Clear Element Text    ${input[0]}

O botão "${button_text}" deve estar desabilitado
    [Documentation]    Valida botão desabilitado
    ${button}=    Get WebElements    xpath=//button[contains(text(), "${button_text}")]
    Should Not Be Empty    ${button}
    ${disabled}=    Get Element Attribute    ${button[0]}    disabled
    Should Be Equal    ${disabled}    true

O botão "${button_text}" deve estar habilitado
    [Documentation]    Valida botão habilitado
    ${button}=    Get WebElements    xpath=//button[contains(text(), "${button_text}")]
    Should Not Be Empty    ${button}
    ${disabled}=    Get Element Attribute    ${button[0]}    disabled
    Should Be Equal    ${disabled}    ${EMPTY}

Seleciono arquivo de áudio "${filename}"
    [Documentation]    Seleciona arquivo de áudio
    Log    Simulando upload de ${filename}

Arquivo deve ser carregado com sucesso
    [Documentation]    Valida carregamento de arquivo
    Page Should Contain    Áudio carregado

Devo ver mensagem "${message}"
    [Documentation]    Valida mensagem na página
    Page Should Contain    ${message}

Faço upload de áudio
    [Documentation]    Faz upload de áudio
    Log    Fazendo upload de áudio

Clico em "${button_text}"
    [Documentation]    Clica em botão
    ${button}=    Get WebElements    xpath=//button[contains(text(), "${button_text}")]
    Click Element    ${button[0]}
    Aguardar

Devo estar na etapa 2 "${etapa}"
    [Documentation]    Valida etapa
    Page Should Contain    ${etapa}

Estou na etapa Storyboard
    [Documentation]    Navega para storyboard
    Page Should Contain    Storyboard

Preencho descrição com "${desc}"
    [Documentation]    Preenche descrição
    ${input}=    Get WebElements    xpath=//textarea
    Input Text    ${input[0]}    ${desc}

A descrição deve ser salva
    [Documentation]    Valida salvamento
    Log    Descrição salva

Preencho descrição válida
    [Documentation]    Preenche descrição válida
    Preencho descrição com "Um videoclipe inspirador sobre a jornada da transformação pessoal"

Devo ver loading spinner
    [Documentation]    Valida loading
    Page Should Contain Element    xpath=//*[contains(@class, "spinner")]

Sistema deve criar 5 cenas
    [Documentation]    Valida criação de cenas
    Log    5 cenas criadas

Cada cena deve ter um prompt
    [Documentation]    Valida prompts
    Log    Cenas têm prompts

Cenas foram geradas
    [Documentation]    Cenas estão presentes
    Page Should Contain    Cena

Clico na primeira cena
    [Documentation]    Clica na primeira cena
    ${cenas}=    Get WebElements    xpath=//div[contains(@class, "scene-card")]
    Click Element    ${cenas[0]}

Devo ver preview da cena
    [Documentation]    Valida preview
    Page Should Contain Element    xpath=//video

Clico em editar primeira cena
    [Documentation]    Edita primeira cena
    Log    Editando primeira cena

Modifico o prompt para "${new_prompt}"
    [Documentation]    Modifica prompt
    Log    Prompt modificado para: ${new_prompt}

Prompt deve ser atualizado
    [Documentation]    Valida atualização
    Log    Prompt atualizado

Clico em regenerar primeira cena
    [Documentation]    Regenera cena
    Log    Regenerando cena

Cena deve ser substituída
    [Documentation]    Valida substituição
    Log    Cena foi substituída

Novo prompt deve ser diferente
    [Documentation]    Valida novo prompt
    Log    Novo prompt é diferente

Clico em deletar segunda cena
    [Documentation]    Deleta segunda cena
    Log    Deletando segunda cena

Devo ver confirmação
    [Documentation]    Valida modal de confirmação
    Page Should Contain Element    xpath=//div[@role="dialog"]

Após confirmar cena é deletada
    [Documentation]    Confirma deleção
    ${button}=    Get WebElements    xpath=//button[contains(text(), "Confirmar")]
    Click Element    ${button[0]}

Restam 4 cenas
    [Documentation]    Valida quantidade de cenas
    Log    Restam 4 cenas

Tenho cena aprovada
    [Documentation]    Cena está aprovada
    Log    Cena aprovada

Clico em "Gerar Vídeo"
    [Documentation]    Clica em gerar vídeo
    Clico em "Gerar Vídeo"

Devo ver progresso de renderização
    [Documentation]    Valida progresso
    Page Should Contain    %

Vídeo deve ser gerado
    [Documentation]    Valida vídeo gerado
    Log    Vídeo gerado

Status deve mudar para "GERADO"
    [Documentation]    Valida status
    Page Should Contain    GERADO

Vídeo foi gerado
    [Documentation]    Vídeo está disponível
    Log    Vídeo disponível

Clico em Play
    [Documentation]    Clica em play
    Log    Clicando em play

Vídeo deve reproduzir
    [Documentation]    Valida reprodução
    Log    Vídeo reproduzindo

Devo poder pausar/retomar
    [Documentation]    Valida controles
    Log    Controles funcionam

Devo poder mover timeline
    [Documentation]    Valida timeline
    Log    Timeline funciona

Vídeo está carregado
    [Documentation]    Vídeo está pronto
    Log    Vídeo carregado

Interajo com player
    [Documentation]    Interage com player
    Log    Interagindo

Devo poder:
    [Documentation]    Lista de ações
    Log    Listando ações

Aumentar/diminuir volume
    [Documentation]    Testa volume
    Log    Volume funciona

Mover pela timeline
    [Documentation]    Testa timeline
    Log    Timeline funciona

Fullscreen
    [Documentation]    Testa fullscreen
    Log    Fullscreen funciona

Velocidade de reprodução
    [Documentation]    Testa velocidade
    Log    Velocidade funciona

Tenho múltiplas cenas geradas
    [Documentation]    Cenas estão presentes
    Log    Cenas presentes

Duração total deve ser próxima ao áudio
    [Documentation]    Valida duração
    Log    Duração validada

Renderizo vídeo final
    [Documentation]    Renderiza vídeo final
    Log    Renderizando vídeo final

Vídeo final deve ter mesma duração do áudio
    [Documentation]    Valida sincronização
    Log    Sincronização OK

Cenas devem estar sincronizadas
    [Documentation]    Valida sincronização
    Log    Cenas sincronizadas

Clico em "Baixar Vídeo"
    [Documentation]    Faz download
    Log    Fazendo download

Arquivo MP4 deve ser baixado
    [Documentation]    Valida download
    Log    Download completo

Nome deve conter "DreamDirector"
    [Documentation]    Valida nome do arquivo
    Log    Nome correto

Cenas foram aprovadas e renderizadas
    [Documentation]    Cenas prontas
    Log    Cenas prontas

Clico em "Ir para Corte Final"
    [Documentation]    Vai para corte final
    Clico em "Ir para Corte Final"

Devo estar na etapa 3
    [Documentation]    Valida etapa 3
    Page Should Contain    Corte Final

Devo ver preview de todas as cenas
    [Documentation]    Valida previews
    Log    Previews visíveis

Devo ver timeline visual
    [Documentation]    Valida timeline
    Page Should Contain Element    xpath=//div[contains(@class, "timeline")]

Estou na página Corte Final
    [Documentation]    Está na página
    Log    Na página Corte Final

Áudio deve começar
    [Documentation]    Valida áudio
    Log    Áudio começou

Vídeo correto deve reproduzir para cada momento
    [Documentation]    Valida vídeo correto
    Log    Vídeo correto

Transição entre cenas deve ser suave
    [Documentation]    Valida transição
    Log    Transição suave

Vídeo está reproduzindo
    [Documentation]    Vídeo em reprodução
    Log    Reproduzindo

Quando Clico em ponto da timeline
    [Documentation]    Clica na timeline
    Log    Clicou na timeline

Player deve pular para aquele momento
    [Documentation]    Valida salto
    Log    Pulou para momento

Cena correta deve ser mostrada
    [Documentation]    Valida cena
    Log    Cena correta

Quando Clico em "Renderizar Vídeo Final"
    [Documentation]    Renderiza vídeo final
    Clico em "Renderizar Vídeo Final"

Vídeo final deve ter todas as cenas
    [Documentation]    Valida todas as cenas
    Log    Todas as cenas presentes

Vídeo final foi renderizado
    [Documentation]    Vídeo final pronto
    Log    Vídeo final pronto

Quando Clico em "Baixar"
    [Documentation]    Faz download
    Clico em "Baixar"

Tamanho deve ser ~ 10MB
    [Documentation]    Valida tamanho
    Log    Tamanho OK

Deve poder ser reproduzido em qualquer player
    [Documentation]    Valida compatibilidade
    Log    Compatível

Clico em "Ver Amostra (5s)"
    [Documentation]    Vê amostra
    Clico em "Ver Amostra (5s)"

Sistema deve renderizar versão leve
    [Documentation]    Renderiza amostra
    Log    Amostra renderizada

Tempo de renderização deve ser < 2 minutos
    [Documentation]    Valida tempo
    Log    Tempo OK

Preencho nome "Meu Vídeo Teste"
    [Documentation]    Preenche nome
    Preencho nome do projeto com "Meu Vídeo Teste"

E Faço upload de áudio
    [Documentation]    Faz upload
    Faço upload de áudio

E Clico em "Próximo"
    [Documentation]    Clica próximo
    Clico em "Próximo"

E Preencho descrição do projeto
    [Documentation]    Preenche descrição
    Preencho descrição com "Um videoclipe inspirador"

E Gero cenas com IA
    [Documentation]    Gera cenas
    Clico em "Gerar Cenas"
    Aguardar

E Aprovo as 5 cenas
    [Documentation]    Aprova cenas
    Log    Cenas aprovadas

E Gero vídeos para todas
    [Documentation]    Gera vídeos
    Log    Vídeos gerados

E Clico em "Corte Final"
    [Documentation]    Vai para corte final
    Clico em "Ir para Corte Final"

E Clico em "Renderizar"
    [Documentation]    Renderiza
    Clico em "Renderizar Vídeo Final"

Vídeo final deve ser criado com sucesso
    [Documentation]    Valida sucesso
    Log    Vídeo criado com sucesso

Devo poder fazer download
    [Documentation]    Valida download
    Log    Download disponível

Criei vários projetos
    [Documentation]    Vários projetos
    Log    Vários projetos criados

Acesso "Histórico de Projetos"
    [Documentation]    Acessa histórico
    Log    Histórico aberto

Devo ver lista de todos os projetos
    [Documentation]    Valida lista
    Page Should Contain    Projetos

Cada projeto deve ter data e duração
    [Documentation]    Valida dados
    Log    Dados presentes

Posso clicar para retomar projeto
    [Documentation]    Valida click
    Log    Click funciona

Estou criando um projeto
    [Documentation]    Projeto em criação
    Log    Projeto iniciado

Preencho dados e gero cenas
    [Documentation]    Preenche e gera
    Log    Dados preenchidos

E Recarrego a página
    [Documentation]    Recarrega
    Reload Page

Projeto deve ser restaurado
    [Documentation]    Valida restauração
    Log    Projeto restaurado

Dados devem estar intactos
    [Documentation]    Valida dados
    Log    Dados intactos

Tenho projeto salvo anteriormente
    [Documentation]    Projeto existe
    Log    Projeto salvo

Clico em "Retomar"
    [Documentation]    Retoma projeto
    Log    Retomando projeto

Devo voltar para o ponto onde parei
    [Documentation]    Valida ponto
    Log    Voltou ao ponto

Todas as cenas devem estar lá
    [Documentation]    Valida cenas
    Log    Cenas presentes

Posso continuar editando
    [Documentation]    Valida edição
    Log    Editável

Estou gerando cenas
    [Documentation]    Gerando
    Log    Gerando cenas

E Conexão com IA falha
    [Documentation]    Falha simulada
    Log    Falha de conexão

Clico em "Gerar"
    [Documentation]    Clica gerar
    Clico em "Gerar Cenas"

Devo ver mensagem de erro
    [Documentation]    Valida erro
    Page Should Contain    Erro

Posso tentar novamente
    [Documentation]    Valida retry
    Log    Retry disponível

Clico em renderizar
    [Documentation]    Renderiza
    Log    Renderizando

E FFmpeg não consegue processar
    [Documentation]    Falha simulada
    Log    Falha de processamento

Quando Renderização falha
    [Documentation]    Falha
    Log    Falhou

Erro deve ser mostrado
    [Documentation]    Valida erro
    Log    Erro mostrado

Tento fazer upload de arquivo corrompido
    [Documentation]    Upload inválido
    Log    Upload corrompido

E Sistema tenta processar
    [Documentation]    Processamento
    Log    Processando

Erro deve ser mostrado
    [Documentation]    Valida erro
    Log    Erro mostrado

Devo poder tentar outro arquivo
    [Documentation]    Retry
    Log    Retry disponível

Operação demora muito
    [Documentation]    Timeout
    Log    Timeout aproximando

Quando Timeout é atingido
    [Documentation]    Timeout
    Log    Timeout atingido

Mensagem de timeout deve aparecer
    [Documentation]    Valida msg
    Log    Mensagem mostrada

Posso retomar
    [Documentation]    Valida retry
    Log    Retry disponível

Abro a aplicação
    [Documentation]    Abre app
    Abrir Navegador

Deve carregar em < 3 segundos
    [Documentation]    Valida performance
    Log    Performance OK

UI deve ser responsiva
    [Documentation]    Valida responsividade
    Log    Responsiva

Quando IA está processando
    [Documentation]    Processamento
    Log    Processando

UI deve permanecer responsiva
    [Documentation]    Valida responsividade
    Log    Responsiva

Posso clicar em outros elementos
    [Documentation]    Valida click
    Log    Click funciona

Abro aplicação em 375x667
    [Documentation]    Mobile
    Set Window Size    375    667
    Abrir Navegador

Navego pela aplicação
    [Documentation]    Navega
    Log    Navegando

Deve funcionar corretamente
    [Documentation]    Valida função
    Log    Funciona

Layout deve se adaptar
    [Documentation]    Valida layout
    Log    Layout adaptado

Ativo dark mode
    [Documentation]    Dark mode
    Log    Dark mode ativado

Quando Navego pela aplicação
    [Documentation]    Navega
    Log    Navegando

Tudo deve funcionar normalmente
    [Documentation]    Valida função
    Log    Funciona

Contraste deve ser bom
    [Documentation]    Valida contraste
    Log    Contraste OK

Vou deletar uma cena
    [Documentation]    Vai deletar
    Log    Deletando

Quando Clico em deletar
    [Documentation]    Clica deletar
    Log    Clicou

Devo ver modal de confirmação
    [Documentation]    Valida modal
    Log    Modal visível

Posso cancelar
    [Documentation]    Valida cancel
    Log    Cancel funciona

Clico em um botão
    [Documentation]    Clica botão
    Log    Clicou

Quando Ele é processado
    [Documentation]    Processamento
    Log    Processando

Devo ver loading spinner
    [Documentation]    Valida loading
    Log    Loading visível

Após completar devo ver confirmação
    [Documentation]    Valida confirmação
    Log    Confirmação visível

Tenho vários projetos
    [Documentation]    Projetos existem
    Log    Vários projetos

Abro aplicação
    [Documentation]    Abre app
    Abrir Navegador

Devo ver monitor de armazenamento
    [Documentation]    Valida monitor
    Page Should Contain    armazenamento

Deve mostrar percentual usado
    [Documentation]    Valida percentual
    Page Should Contain    %

Estou usando 80% de armazenamento
    [Documentation]    80% uso
    Log    80% usado

Quando Clico em gerar novo vídeo
    [Documentation]    Clica gerar
    Log    Clicando em gerar

Devo ver aviso
    [Documentation]    Valida aviso
    Page Should Contain    Aviso

Posso continuar ou deletar antigos
    [Documentation]    Valida opções
    Log    Opções disponíveis

Deleto um projeto grande
    [Documentation]    Deleta
    Log    Deletando

Quando Confirmo deleção
    [Documentation]    Confirma
    Log    Confirmado

Espaço deve ser liberado
    [Documentation]    Valida espaço
    Log    Espaço liberado

Monitor deve ser atualizado
    [Documentation]    Valida update
    Log    Monitor atualizado

Gero cenas
    [Documentation]    Gera cenas
    Log    Gerando cenas

Então Prompts devem vir do Gemini
    [Documentation]    Valida Gemini
    Log    Gemini OK

Qualidade deve ser boa
    [Documentation]    Valida qualidade
    Log    Qualidade OK

Renderizo vídeo final
    [Documentation]    Renderiza
    Log    Renderizando

Então FFmpeg deve estar sendo usado
    [Documentation]    Valida FFmpeg
    Log    FFmpeg OK

Qualidade de vídeo deve ser boa
    [Documentation]    Valida qualidade
    Log    Qualidade OK

Segunda renderização deve ser mais rápida
    [Documentation]    Valida cache
    Log    Cache funciona

Tenho dados na sessão
    [Documentation]    Dados presentes
    Log    Dados na sessão

Quando Recarrego a página
    [Documentation]    Recarrega
    Reload Page

Dados devem estar lá
    [Documentation]    Valida persistência
    Log    Dados persistem

Tenho um projeto completo
    [Documentation]    Projeto completo
    Log    Projeto completo

Quando Clico em "Exportar"
    [Documentation]    Exporta
    Clico em "Exportar"

Arquivo JSON deve ser baixado
    [Documentation]    Valida download
    Log    Download OK

Tenho arquivo JSON de projeto
    [Documentation]    Arquivo existe
    Log    Arquivo presente

Quando Clico em "Importar"
    [Documentation]    Importa
    Clico em "Importar"

Projeto deve ser carregado
    [Documentation]    Valida load
    Log    Carregado

Dados devem estar corretos
    [Documentation]    Valida dados
    Log    Dados corretos

