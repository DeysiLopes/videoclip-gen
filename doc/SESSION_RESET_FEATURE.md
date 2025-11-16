# 🆕 Nova Aba = Novo Projeto (Session Reset)

## 🎯 O Que Mudou

Anteriormente, quando você abria uma nova aba, a aplicação carregava o estado do projeto anterior (via localStorage). Agora, cada nova aba começa do zero!

## 🔧 Como Funciona

### 1. **sessionStorage vs localStorage**

- **localStorage**: Persiste entre abas (compartilhado globalmente)
- **sessionStorage**: Específico de cada aba/janela (isolado)

### 2. **Fluxo de Inicialização**

```
Abrir nova aba
    ↓
App.tsx → initializeApp()
    ↓
Verificar: sessionStorage.getItem('dreamdirector-session-initialized')
    ↓
    ├─ Null (primeira vez)
    │   └─ 🆕 Nova aba detectada!
    │       ├─ dbService.clearProject() → Limpar DB
    │       └─ Começar do zero (AppMode.SETUP)
    │
    └─ 'true' (já inicializado nesta aba)
        └─ ✅ Carregar estado anterior (se existir)
```

### 3. **Código Implementado**

#### App.tsx - Detecção de Nova Aba

```typescript
const isNewSession = !(window as any).sessionStorage.getItem('dreamdirector-session-initialized');

if (isNewSession) {
  (window as any).sessionStorage.setItem('dreamdirector-session-initialized', 'true');
  console.log('[App] 🆕 Nova aba detectada. Começando do zero.');
  await dbService.clearProject();
}
```

#### dbService.ts - Limpeza Completa

```typescript
const clearProject = async (): Promise<void> => {
  // Limpa tudo:
  // - SCENES_STORE (todas as cenas)
  // - BLOBS_STORE (todos os vídeos)
  // - CONFIG_STORE (configuração do projeto)
};
```

## 📊 Comportamento

### Cenário 1: Uma Aba (Normal)

```
Aba 1: Criar projeto → Adicionar cenas → Renderizar
└─ Tudo funciona normalmente, dados persistem na aba
```

### Cenário 2: Múltiplas Abas (Novo Comportamento)

```
Aba 1: Projeto A (cenas + áudio) → sessionStorage['initialized'] = 'true'
Aba 2: Ctrl+T (nova aba)
       sessionStorage vazio → 🆕 clearProject()
       Começa do zero (AppMode.SETUP)
       
Aba 3: Ctrl+N (outra nova aba)
       sessionStorage vazio → 🆕 clearProject()
       Começa do zero (AppMode.SETUP)

Aba 1: Volta para Aba 1
       sessionStorage já estava inicializado → ✅ Continua projeto A
```

## ✅ Vantagens

- ✅ Cada aba é independente
- ✅ Evita conflitos entre múltiplos projetos simultâneos
- ✅ UX limpa: nova aba = novo início
- ✅ Sem perda de dados da aba anterior
- ✅ Fácil testar múltiplos projetos lado-a-lado

## ⚠️ Comportamento de Atualização (Reload)

```
Aba 1: Projeto A
       ↓ F5 (reload)
       sessionStorage['initialized'] continua 'true' (remanescente)
       ✅ Continua projeto A (normal)
```

Se você quiser forçar um reset mesmo na mesma aba:
```bash
# Browser DevTools Console
sessionStorage.clear()
location.reload()
```

## 🧪 Teste

### Teste 1: Nova Aba
1. Abra a app (Aba 1)
2. Crie um projeto (adicione áudio, cenas)
3. Ctrl+T (abre Nova Aba 2)
4. ✅ Esperado: Aba 2 começa do SETUP (tela vazia)
5. Ctrl+1 (volta para Aba 1)
6. ✅ Esperado: Aba 1 continua com seu projeto

### Teste 2: Múltiplas Abas
1. Aba 1: Projeto A (descrição "Nature Documentary")
2. Aba 2: Ctrl+T → Projeto B (descrição "Urban Vlog")
3. Aba 3: Ctrl+T → Projeto C (descrição "Music Video")
4. ✅ Cada aba tem seu próprio projeto independente

### Teste 3: Reload
1. Aba 1: Projeto A (parcialmente preenchido)
2. F5 (reload)
3. ✅ Esperado: Continua mesmo projeto A (dados persistem)

## 📝 Console Logs

Quando uma nova aba é detectada, você verá:

```
[App] 🆕 Nova aba detectada. Começando do zero.
[dbService] 🧹 Projeto limpo completamente
```

## 🔙 Como Voltar ao Comportamento Anterior

Se precisar carregar o último projeto mesmo em nova aba (comportamento anterior):

```typescript
// Em App.tsx, remover a verificação:
// if (isNewSession) {
//   await dbService.clearProject();
// }

// E sempre carregar da DB:
const loadedConfig = await dbService.getProjectConfig();
if (loadedConfig && loadedConfig.technicalSheet) {
  // Carregar projeto...
}
```

---

**Status:** ✅ IMPLEMENTADO  
**Data:** 2025-11-16  
**Tipo:** UX Improvement

