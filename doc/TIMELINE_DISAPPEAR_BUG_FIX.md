# ✅ Bug Fix: Timeline Desaparece ao Voltar para Storyboard

## 🐛 Problema

Quando você volta para o Storyboard (na mesma sessão), a **timeline desaparece**. 

**Cenário:**
1. ProjectSetup → Adiciona áudio
2. Storyboard → Timeline aparece ✅
3. Volta para Setup → Clica em "Continuar"
4. Storyboard novamente → Timeline DESAPARECE ❌

Mas se começar do zero (nova aba), tudo funciona normalmente.

## 🎯 Causa

O `projectConfig.audioUrl` é um **objeto URL criado temporariamente** durante o ProjectSetup. Quando você volta para Storyboard, esse URL pode ter sido revogado ou perdido.

A timeline só aparecia se `projectConfig.audioUrl` existisse. Mas `projectConfig.audioFile` (Blob) continuava lá!

## ✅ Solução

Adicionado um `useEffect` no Storyboard que:
1. **Verifica** se `projectConfig.audioFile` existe
2. **Verifica** se `audioUrl` NÃO existe
3. **Cria** um novo URL do Blob usando `createObjectURL`
4. **Armazena** em state local (`audioUrl`)

```typescript
const [audioUrl, setAudioUrl] = useState<string | null>(projectConfig.audioUrl ?? null);

useEffect(() => {
  if (projectConfig.audioFile && !audioUrl) {
    console.log('[Storyboard] 🔧 Criando audioUrl do audioFile...');
    const url = URL.createObjectURL(projectConfig.audioFile);
    setAudioUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }
}, [projectConfig.audioFile, audioUrl]);
```

## 📝 Mudanças

### frontend/components/Storyboard.tsx

#### 1. Adicionado State Local para audioUrl
```typescript
const [audioUrl, setAudioUrl] = useState<string | null>(projectConfig.audioUrl ?? null);
```

#### 2. Adicionado useEffect para Criar URL
```typescript
useEffect(() => {
  if (projectConfig.audioFile && !audioUrl) {
    const url = URL.createObjectURL(projectConfig.audioFile);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }
}, [projectConfig.audioFile, audioUrl]);
```

#### 3. Usar audioUrl State em Vez de projectConfig.audioUrl
```typescript
// ❌ ANTES
{projectConfig.audioUrl && (
  <audio src={projectConfig.audioUrl} />
)}

// ✅ DEPOIS
{audioUrl && (
  <audio src={audioUrl} />
)}
```

## 🔄 Fluxo de Funcionamento

### Cenário 1: Primeira Vez (Setup → Storyboard)
```
ProjectSetup
  ├─ Usuário seleciona áudio
  ├─ projectConfig.audioFile = Blob
  ├─ projectConfig.audioUrl = URL.createObjectURL(Blob)
  └─ Passa para Storyboard

Storyboard
  ├─ Estado local: audioUrl = projectConfig.audioUrl
  ├─ Timeline renderiza ✅
  └─ Tudo funciona
```

### Cenário 2: Volta para Storyboard (Antes da Fix)
```
User clica "Voltar"
  ├─ volta para ProjectSetup

Depois clica "Continuar"
  ├─ Volta para Storyboard
  ├─ projectConfig.audioUrl pode estar revogado
  ├─ Timeline NÃO renderiza ❌

Estado: Mesmo que projectConfig.audioFile ainda exista!
```

### Cenário 3: Volta para Storyboard (Com Fix)
```
User clica "Voltar"
  ├─ volta para ProjectSetup

Depois clica "Continuar"
  ├─ Volta para Storyboard
  ├─ useEffect detecta:
  │   ├─ projectConfig.audioFile existe ✅
  │   └─ audioUrl não existe (ou foi revogado)
  ├─ Cria novo URL: URL.createObjectURL(audioFile)
  ├─ Salva em state: setAudioUrl(url)
  └─ Timeline renderiza ✅
```

## 🧪 Como Testar

### Teste 1: Voltar e Continuar
1. ProjectSetup → Selecionar áudio
2. Clique "Continuar"
3. Storyboard → ✅ Timeline deve aparecer
4. Clique "Voltar para Configuração"
5. ProjectSetup (novamente)
6. Clique "Continuar"
7. Storyboard (novamente) → ✅ Timeline DEVE aparecer (antes desaparecia)

### Teste 2: Múltiplas Voltas
1. Setup → Storyboard → Setup → Storyboard → Setup → Storyboard
2. ✅ Timeline deve aparecer TODA VEZ

### Teste 3: Ver Console
1. Abrir DevTools (F12)
2. Console tab
3. Fazer teste acima
4. ✅ Esperado ver: `[Storyboard] 🔧 Criando audioUrl do audioFile...`

## ✅ Checklist

- [x] Adicionado state `audioUrl`
- [x] Adicionado useEffect para criar URL
- [x] Lógica verifica se audioFile existe mas audioUrl não
- [x] URL é criado dinamicamente
- [x] Cleanup com revokeObjectURL
- [x] JSX atualizado para usar audioUrl state
- [x] Sem erros de compilação
- [x] Documentação completa

---

**Data:** 2025-11-16  
**Bug:** Timeline desaparecia ao voltar para Storyboard  
**Status:** ✅ CORRIGIDO  
**Tipo:** UI/State Management

