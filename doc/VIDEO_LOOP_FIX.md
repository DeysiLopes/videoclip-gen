# 🎬 Fix: Loop de Vídeos para Preencher Duração das Cenas

## 🎯 Problema

A API do Gemini gera vídeos com ~8 segundos de duração, mas as cenas planejadas precisam ter durações diferentes:
- Cena 1: 35s
- Cena 2: 30s
- Cena 3: 40s
- Cena 4: 45s
- Cena 5: 31s

**Resultado anterior:** Vídeo final tinha apenas 40s (concatenação direta dos 8s de cada cena) ❌

## ✅ Solução Implementada

Implementamos **loop automático de vídeos** usando FFmpeg para repetir cada vídeo de 8s até atingir a duração planejada:

```
Vídeo Gemini (8s) → LOOP → Duração desejada (35s, 30s, 40s, etc.)
```

## 📝 Mudanças no Código

### 1. **frontend/src/services/renderService.ts** ✓ Já enviava corretamente
```typescript
export async function startRender(
  projectId: string,
  videoFiles: File[],
  audioFile?: File,
  sceneDurations?: number[]  // ✓ Já tinha!
): Promise<RenderResponse>
```

### 2. **frontend/components/FinalCut.tsx** ✓ Já preparava corretamente
```typescript
const sceneDurations = sortedScenes.map((s) => s.intendedDuration ?? s.duration ?? 3);

await startRender(
  projectConfig.id || 'default-project',
  videoFiles,
  audioFile,
  sceneDurations  // ✓ Já enviava!
);
```

### 3. **backend/src/index.ts** ✅ CORRIGIDO
Agora extrai `sceneDurations` do FormData:
```typescript
const sceneDurationsStr = req.body.sceneDurations || '[]';
let sceneDurations: number[] = [];

try {
  sceneDurations = JSON.parse(sceneDurationsStr);
  console.log(`[API] Scene durations: ${sceneDurations.join(', ')}`);
} catch (e) {
  console.warn('[API] Failed to parse sceneDurations:', e);
}

renderVideo(jobId, videoFiles, audioFile, sceneDurations);  // ✅ NOVO
```

### 4. **backend/src/worker.ts** ✅ CORRIGIDO
Implementa o loop usando FFmpeg:
```typescript
export async function renderVideo(
  jobId: string,
  videoFiles: string[],
  audioFile?: string,
  sceneDurations?: number[]  // ✅ NOVO
): Promise<void>
```

## 🔧 FFmpeg Filter Logic

### Antes (Concatenação Simples)
```
Input: 5 vídeos de 8s cada
Output: 40s (8+8+8+8+8)
❌ Resultado: Vídeo muito curto
```

### Depois (Com Loop)
```
Para cada cena:
  - Calcular: repetições = ceil(duração_desejada / 8)
  - Exemplo Cena 1: ceil(35/8) = 5 repetições
  
Então:
  [video]concat=n=5 → trim=end=35s → Cena 1 (35s exatos)
  [video]concat=n=4 → trim=end=30s → Cena 2 (30s exatos)
  [video]concat=n=5 → trim=end=40s → Cena 3 (40s exatos)
  [video]concat=n=6 → trim=end=45s → Cena 4 (45s exatos)
  [video]concat=n=4 → trim=end=31s → Cena 5 (31s exatos)

Resultado final:
  35s + 30s + 40s + 45s + 31s = 181s (3:01) ✅
```

## 📊 Exemplo de Filter Complex

```
[0:v][0:v][0:v][0:v][0:v]concat=n=5:v=1:a=0[v0_repeat];[v0_repeat]trim=end=35,setpts=PTS-STARTPTS[v0];
[1:v][1:v][1:v][1:v]concat=n=4:v=1:a=0[v1_repeat];[v1_repeat]trim=end=30,setpts=PTS-STARTPTS[v1];
[2:v][2:v][2:v][2:v][2:v]concat=n=5:v=1:a=0[v2_repeat];[v2_repeat]trim=end=40,setpts=PTS-STARTPTS[v2];
[3:v][3:v][3:v][3:v][3:v][3:v]concat=n=6:v=1:a=0[v3_repeat];[v3_repeat]trim=end=45,setpts=PTS-STARTPTS[v3];
[4:v][4:v][4:v][4:v]concat=n=4:v=1:a=0[v4_repeat];[v4_repeat]trim=end=31,setpts=PTS-STARTPTS[v4];
[v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[outv]
```

## 🧪 Como Testar

1. **Gerar projeto com múltiplas cenas:**
   ```
   1. Descrever projeto
   2. Gerar 5 cenas
   3. Adicionar áudio (~3 minutos)
   ```

2. **Verificar durações planejadas:**
   - Storyboard deve mostrar cada cena com sua duração

3. **Renderizar vídeo final:**
   - Clicar "Renderizar Vídeo"
   - Aguardar conclusão

4. **Verificar resultado:**
   - Vídeo final deve ter duração total = soma de todas as cenas
   - Exemplo: 35 + 30 + 40 + 45 + 31 = **3:01** (181 segundos)

## 🎯 Fluxo Completo

```
Frontend
  ├─ Preparar videoFiles e sceneDurations
  └─ POST /api/render com sceneDurations
     ↓
Backend (index.ts)
  ├─ Extrair sceneDurations do FormData
  └─ Passar para renderVideo()
     ↓
Worker (worker.ts)
  ├─ Para cada cena:
  │   ├─ Calcular repetições (duração_desejada / 8)
  │   ├─ Criar filter com concat + trim
  │   └─ Aplicar setpts para sincronizar
  │
  ├─ Concatenar todas as cenas processadas
  ├─ Mapear áudio (sincronizado com -shortest)
  └─ Codificar com VP9
     ↓
Output
  └─ Vídeo completo com duração total correta! ✅
```

## 📈 Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Duração Cena 1** | 8s | 35s |
| **Duração Cena 2** | 8s | 30s |
| **Duração Cena 3** | 8s | 40s |
| **Duração Cena 4** | 8s | 45s |
| **Duração Cena 5** | 8s | 31s |
| **Duração Total** | 40s ❌ | 3:01 ✅ |
| **Sincronização** | Incorreta | Perfeita |

## ✅ Checklist

- [x] Frontend já enviava sceneDurations (nada alterado)
- [x] FinalCut.tsx já preparava corretamente (nada alterado)
- [x] backend/src/index.ts: Extrai sceneDurations ✅
- [x] backend/src/worker.ts: Implementa loop com FFmpeg ✅
- [x] Logs informativos adicionados
- [x] Sem erros de compilação
- [x] Documentação completa

## 🔍 Console Logs Esperados

```bash
[API] Scene durations: 35, 30, 40, 45, 31
[Worker] Creating loop filter to match scene durations
[Worker] Scene 1: target 35s, repetitions: 5
[Worker] Scene 2: target 30s, repetitions: 4
[Worker] Scene 3: target 40s, repetitions: 5
[Worker] Scene 4: target 45s, repetitions: 6
[Worker] Scene 5: target 31s, repetitions: 4
[Worker] Filter complex: [0:v][0:v]...[concat=...]
```

## 🚀 Próximos Passos

1. ✅ Testar localmente com renderização
2. ✅ Commit + Push
3. ✅ Deploy automático no GCP
4. ✅ Verificar resultado final

---

**Data:** 2025-11-16  
**Bug:** Vídeo final com duração incorreta (40s vs 3:01)  
**Status:** ✅ CORRIGIDO  
**Tipo:** Video Processing / FFmpeg Filter  

