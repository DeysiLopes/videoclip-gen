# 📝 Template para Cenários Médios

Use este template para criar testes da **Fase 3 (3-medium/)**

---

## 🎯 [Número]-[Nome-do-Grupo].md

**Categoria:** [Functional/Accessibility] - Medium  
**Tags:** `medium`, `[tag1]`, `[tag2]`  
**Cenários BDD:** [robot-file] [código-inicio] a [código-fim]

---

## 📋 Descrição

[Descrever o que será testado]

## 🎬 Passos para Executar com chrome-devtools MCP

### [CÓDIGO-BDD]: [Nome do Cenário]

#### 1. Setup
\`\`\`
chrome-devtools-new_page
  url: http://localhost:3000
\`\`\`

#### 2. [Ação principal]
\`\`\`javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Validação
      return { passes: true };
    }
\`\`\`

---

## ✅ Critérios de Sucesso

- [ ] Critério 1
- [ ] Critério 2

---

## ⏱️ Duração Esperada

- Total: ~[X] minutos

---

## 📊 Resultado Esperado

\`\`\`json
{
  "test": "[NOME]",
  "status": "PASS"
}
\`\`\`
