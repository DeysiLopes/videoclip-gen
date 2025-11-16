# 🧪 Guia de Testes de Acessibilidade

## Ferramentas Necessárias

### 1. Screen Readers

#### Windows
- **NVDA** (Gratuito) - https://www.nvaccess.org/download/
- **JAWS** (Pago) - https://www.freedomscientific.com/products/software/jaws/

#### macOS
- **VoiceOver** (Incluído) - Cmd+F5

#### Linux
- **Orca** (Gratuito) - Instalado por padrão em muitas distros

#### Navegadores
- **Narrator** (Windows 10+) - Win + Ctrl + Enter

### 2. Extensões Chrome

```bash
# WAVE
https://chrome.google.com/webstore/detail/wave-evaluation-tool/jbbplnpobllcpibohmpibcpfbkeabdetroit

# axe DevTools
https://chrome.google.com/webstore/detail/axe-devtools-web-accessibility-tester/lhdoppojpmngadmnkpklempisson

# Color Contrast Analyzer
https://chrome.google.com/webstore/detail/wcag-color-contrast-checker/plnahcmalebffmaghciscokebohmbpbo

# Lighthouse
Chrome DevTools → Lighthouse → Accessibility
```

---

## 📋 Testes Manuais

### 1. Teste de Teclado (Keyboard-Only)

**Tempo: 5-10 minutos**

```
1. Desconectar mouse / trackpad
2. Navegar com:
   - TAB: próximo elemento
   - SHIFT+TAB: elemento anterior
   - ENTER: ativar botão/link
   - SPACE: checkboxes/radio buttons
   - ARROW KEYS: menus, sliders, tabs
   - ESCAPE: fechar modals/menus

Verificar:
- [ ] Posso acessar TODOS os elementos interativos
- [ ] Focus é SEMPRE visível
- [ ] Tab order faz sentido (esquerda-direita, topo-fundo)
- [ ] Sem "keyboard traps" (preso em um elemento)
- [ ] Modals podem ser fechados com Escape
```

### 2. Teste de Screen Reader (NVDA)

**Tempo: 15-20 minutos**

```bash
# Windows - Instalar NVDA
https://www.nvaccess.org/download/

# Ativar
NVDA+N → Start
```

**Checklist:**
```
- [ ] Página inteira é lida em ordem lógica
- [ ] Buttons são anunciados como "button"
- [ ] Links são anunciados como "link"
- [ ] Heading hierarchy é correto (h1 → h2 → h3)
- [ ] Imagens têm alt text descritivo
- [ ] Labels estão associados aos inputs
- [ ] Erros são anunciados com role="alert"
- [ ] Dinamic updates têm aria-live
- [ ] Estrutura faz sentido sem CSS
```

### 3. Teste de VoiceOver (macOS)

```bash
# Ativar VoiceOver
Cmd+F5

# Navegação
- VO+Right Arrow: próximo
- VO+Left Arrow: anterior
- VO+Space: ativar
- VO+U: abre web rotor (mostra structure)

# Onde VO = Control+Option
```

### 4. Teste de Zoom

```
1. Chrome → Ctrl++ (aumentar)
2. Aumentar até 200%
3. Verificar:
   - [ ] Texto não fica cortado
   - [ ] Botões permanecem clicáveis
   - [ ] Layout não quebra
   - [ ] Sem scrolls horizontais desnecessários
```

### 5. Teste de Cores

```bash
# Color Oracle (simular daltonismo)
https://colororacle.org/

# Verificar:
- [ ] Interface funciona em preto/branco
- [ ] Não depender APENAS de cor
- [ ] Usar ícones, padrões, texto também
```

---

## 🤖 Testes Automáticos

### 1. Lighthouse (Chrome DevTools)

```
1. Chrome DevTools → F12
2. Lighthouse tab
3. Select: Accessibility
4. Analyze page load
5. Target: 90+
```

**Métricas importantes:**
- Color contrast
- Form labels
- ARIA attributes
- Keyboard navigation

### 2. WAVE Browser Extension

```
1. Instalar extensão WAVE
2. Clicar ícone WAVE
3. Revisar:
   - Errors (vermelho) - corrigir TODOS
   - Contrast (amarelo) - revisar
   - Structure (azul) - verificar
```

### 3. axe DevTools

```
1. Instalar extensão axe DevTools
2. Chrome DevTools → axe DevTools tab
3. Scan THIS PAGE
4. Revisar findings por categoria:
   - Critical: corrigir agora
   - Serious: corrigir em breve
   - Moderate: considerar
```

### 4. ESLint com jsx-a11y

```bash
# Instalar
npm install -D eslint-plugin-jsx-a11y

# Configurar .eslintrc.json (veja arquivo fornecido)

# Rodar
npm run lint

# Vai alertar sobre issues de acessibilidade no código
```

---

## 🧩 Testes por Componente

### Botão

```javascript
// Verificar:
- [ ] Tab + Enter ativa
- [ ] Space ativa
- [ ] Focus é visível
- [ ] aria-label se sem texto
- [ ] aria-disabled quando disabled
```

### Input

```javascript
// Verificar:
- [ ] Label visível
- [ ] aria-required se obrigatório
- [ ] aria-invalid se erro
- [ ] Erro anunciado como alert
- [ ] Helper text disponível
```

### Modal

```javascript
// Verificar:
- [ ] Focus trap (fica dentro do modal)
- [ ] Escape fecha
- [ ] aria-modal="true"
- [ ] aria-labelledby
- [ ] Não pode interagir fundo
```

### Tabelas

```javascript
// Verificar:
- [ ] <table> com <thead>, <tbody>
- [ ] <th> com scope="row" ou scope="col"
- [ ] Caption ou aria-label
- [ ] Não apenas visual
```

---

## 📊 Relatório de Testes

Crie um template para documentar:

```markdown
## Teste de Acessibilidade - [Data]

**Componente Testado:** [Nome]
**Tester:** [Seu Nome]
**Ambiente:** Windows/Mac/Linux

### Teclado
- [ ] Pass / [ ] Fail
- Notas: ...

### Screen Reader
- [ ] Pass / [ ] Fail
- Notas: ...

### Cores/Contraste
- [ ] Pass / [ ] Fail
- Notas: ...

### Lighthouse Score
Score: __/100

### Issues Encontrados
1. [Descrição] - Severidade: Critical/Serious/Moderate
2. ...

### Aprovado?
- [ ] Sim, pronto para produção
- [ ] Não, precisa correções
```

---

## 🚀 CI/CD - Testes Automatizados

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:a11y": "eslint src --ext .tsx --plugin jsx-a11y",
    "test:a11y": "npm run lint:a11y",
    "build:check": "npm run lint && npm run test:a11y && npm run build"
  }
}
```

### GitHub Actions Example

```yaml
name: Accessibility Check

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run lint:a11y
      - run: npm run build
```

---

## 📞 Recursos

| Recurso | Link |
|---------|------|
| WCAG 2.1 Guideline | https://www.w3.org/WAI/WCAG21/quickref/ |
| WAI-ARIA Practices | https://www.w3.org/WAI/ARIA/apg/ |
| WebAIM | https://webaim.org/ |
| A11y Project | https://www.a11yproject.com/ |
| Color Contrast | https://webaim.org/resources/contrastchecker/ |

---

**Frequência de Teste:**
- ✅ A cada novo componente
- ✅ Antes de PR
- ✅ Antes de deploy
- ✅ Semanalmente (teste completo)

**Última atualização:** 2025-11-16

