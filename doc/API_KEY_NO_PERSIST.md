# ✅ Mudança: API Key Sempre Solicitada

## 🎯 O Que Mudou

A chave de API do Gemini **não é mais salva** no localStorage. Agora ela é solicitada **sempre que abrir uma página/aba nova**.

## 📝 Mudanças Realizadas

### frontend/src/App.tsx

#### 1. Na Inicialização (useEffect)

**Antes:**
```typescript
const storedKey = (window as any).localStorage.getItem('gemini-api-key');
if (storedKey) {
  setLocalApiKey(storedKey);
} else {
  setShowLocalApiKeyDialog(true);
}
```

**Depois:**
```typescript
// 🆕 SEMPRE solicitar a chave (não salvar no localStorage)
console.log('[App] Solicitando Gemini API Key...');
setShowLocalApiKeyDialog(true);
```

#### 2. Ao Salvar a Chave

**Antes:**
```typescript
const trimmedKey = key.trim();
(window as any).localStorage.setItem('gemini-api-key', trimmedKey);
setLocalApiKey(trimmedKey);
setShowLocalApiKeyDialog(false);
```

**Depois:**
```typescript
const trimmedKey = key.trim();
// 🆕 NÃO salvar no localStorage - sempre solicitar a chave
setLocalApiKey(trimmedKey);
setShowLocalApiKeyDialog(false);
```

## 🔄 Comportamento Anterior vs Novo

### Antes
```
Abrir página
  ├─ Verifica localStorage
  ├─ Se tiver chave salva:
  │   └─ Usa chave automaticamente (sem solicitar)
  └─ Se não tiver:
      └─ Solicita chave

Resultado: Chave persiste entre sessões ❌
```

### Depois
```
Abrir página
  └─ SEMPRE solicita chave
      (não verifica localStorage)
  └─ Usuário insere chave
  └─ App usa para renderização
  └─ Chave NÃO é salva

Resultado: Chave é solicitada a cada nova aba/página ✅
```

## 📊 Comparação de Cenários

### Cenário 1: Mesma Aba, Reload (F5)

**Antes:**
- Recarrega página
- Detecta chave no localStorage
- ✅ Continua sem solicitar (mesmo usuário)

**Depois:**
- Recarrega página
- ❌ Solicita chave novamente
- Usuário precisa inserir de novo

### Cenário 2: Nova Aba (Ctrl+T)

**Antes:**
- Detecta chave no localStorage
- ✅ Continua sem solicitar

**Depois:**
- ✅ Solicita chave (comportamento esperado)

### Cenário 3: Fechar e Reabrir Browser

**Antes:**
- ✅ Continua sem solicitar (localStorage persiste)

**Depois:**
- ✅ Solicita chave (localStorage limpo)

## 🔒 Benefícios de Segurança

1. **Chave não persiste no disco:**
   - localStorage não surviva a limpeza de cache
   - Ideal para computadores compartilhados

2. **Sessão isolada por aba:**
   - Cada aba pede sua própria chave
   - Melhor isolamento de contexto

3. **Usuário tem controle:**
   - Decide quando inserir a chave
   - Não há surpresas de "uso residual"

## ⚠️ Trade-offs

### Desvantagem
- ❌ Mais cliques do usuário (sempre pedir chave)
- ❌ Menos conveniente para uso prolongado na mesma aba

### Vantagem
- ✅ Mais seguro (chave não persiste)
- ✅ Melhor para ambientes compartilhados
- ✅ Cada sessão é independente

## 🧪 Como Testar

### Teste 1: Reload (F5)
1. Abrir app
2. Inserir chave
3. Gerar uma cena
4. Pressionar F5 (reload)
5. ✅ **Esperado:** App solicita chave novamente

### Teste 2: Nova Aba (Ctrl+T)
1. Aba 1: Abrir app + inserir chave
2. Aba 2: Ctrl+T (nova aba)
3. ✅ **Esperado:** Solicita chave (não usa a da Aba 1)

### Teste 3: Fechar Browser
1. Abrir app + inserir chave
2. Fechar browser completamente
3. Reabrir app
4. ✅ **Esperado:** Solicita chave

## 📌 Notas

- **sessionStorage:** Mantém chave apenas durante a sessão da aba (é resetado ao fechar a aba)
- **localStorage:** Não é mais usado para chave de API
- **Estado React:** Chave fica em `localApiKey` state (memória)

## ✅ Checklist

- [x] Removido: `localStorage.getItem('gemini-api-key')`
- [x] Removido: `localStorage.setItem('gemini-api-key', ...)`
- [x] Adicionado: Log de "Solicitando Gemini API Key"
- [x] Sem erros de compilação
- [x] Documentação completa

---

**Data:** 2025-11-16  
**Tipo:** Security / User Experience  
**Status:** ✅ IMPLEMENTADO  
**Impacto:** API Key sempre solicitada ao abrir nova página

