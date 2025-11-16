# 📝 Template para Cenários Importantes

Use este template para criar testes da **Fase 2 (2-important/)**

---

## 🎯 [Número]-[Nome-do-Grupo].md

**Categoria:** [Functional/Accessibility] - Important  
**Tags:** `important`, `[tag1]`, `[tag2]`  
**Cenários BDD:** [robot-file] [código-inicio] a [código-fim]

---

## 📋 Descrição

[Descrever o que será testado - 2-3 linhas]

Testes incluem:
- [Item 1]
- [Item 2]
- [Item 3]

## 🎬 Passos para Executar com chrome-devtools MCP

### [CÓDIGO-BDD]: [Nome do Cenário]

#### 1. [Passo inicial]
\`\`\`
chrome-devtools-new_page
  url: http://localhost:3000
\`\`\`

#### 2. [Ação/Verificação]
\`\`\`javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Código JavaScript aqui
      return { 
        passes: true,
        data: {}
      };
    }
\`\`\`

#### 3. [Screenshot ou validação]
\`\`\`
chrome-devtools-take_screenshot
  fullPage: false
  format: "png"
  filePath: "tests/mcp-automation/screenshots/[codigo]-[nome].png"
\`\`\`

---

### [PRÓXIMO-CÓDIGO]: [Próximo Cenário]

[Repetir estrutura acima]

---

## ✅ Critérios de Sucesso

**[CÓDIGO-1]:**
- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

**[CÓDIGO-2]:**
- [ ] Critério 1
- [ ] Critério 2

---

## ⏱️ Duração Esperada

- Total: ~[X] minutos
- [CÓDIGO-1]: [X]min
- [CÓDIGO-2]: [X]min

---

## 🐛 Cenários de Falha Comuns

- **Problema 1:** Descrição e solução
- **Problema 2:** Descrição e solução
- **Problema 3:** Descrição e solução

---

## 📊 Resultado Esperado

\`\`\`json
{
  "test": "[NOME-DO-GRUPO]",
  "status": "PASS",
  "duration": "[X]m [Y]s",
  "scenarios": {
    "[CODIGO-1]": "PASS",
    "[CODIGO-2]": "PASS"
  }
}
\`\`\`
