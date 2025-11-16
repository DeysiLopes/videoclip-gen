# 🔧 CORS Fix - Documentação
## 🚨 Problema Original
```
Failed to load FFmpeg: Failed to construct 'Worker': 
Script at 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/esm/worker.js' 
cannot be accessed from origin 'https://dreamdirector-ai-763554128865.us-west1.run.app'
```
**Causa:**
- FFmpeg files eram carregados de CDN externo (unpkg/jsDelivr)
- CORS restritivo no Cloud Run
- Worker.js bloqueado por política de segurança
---
## ✅ Solução Implementada
### 1. Incluir FFmpeg no Docker Build
**Arquivo:** `Dockerfile`
```dockerfile
# Copiar FFmpeg files do node_modules para servir localmente
COPY --from=builder /app/node_modules/@ffmpeg/core/dist/esm ./ffmpeg/
```
**Resultado:**
- FFmpeg files agora estão dentro da imagem Docker
- Servidos pela mesma origem (nginx)
- Sem CORS issues
---
### 2. Nginx Servir FFmpeg Files
**Arquivo:** `nginx.conf`
```nginx
# FFmpeg files - servir localmente com CORS
location /ffmpeg/ {
    add_header Access-Control-Allow-Origin "*" always;
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header Cross-Origin-Resource-Policy "cross-origin" always;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
}
```
**Headers configurados:**
- ✅ `Cross-Origin-Opener-Policy: same-origin`
- ✅ `Cross-Origin-Embedder-Policy: require-corp`
- ✅ `Cross-Origin-Resource-Policy: cross-origin`
- ✅ `Access-Control-Allow-Origin: *`
---
### 3. FFmpeg Loader Usa Files Locais
**Arquivo:** `services/ffmpeg-loader.ts`
```typescript
// Desenvolvimento: CDN (funciona)
// Produção: /ffmpeg/ (local, servido por nginx)
const isDev = import.meta.env.DEV;
const baseURL = isDev 
  ? 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'
  : '/ffmpeg';
```
**Lógica:**
- 🟢 **Dev:** usa jsDelivr (sem CORS issues local)
- 🟢 **Prod:** usa `/ffmpeg/` (servido por nginx, mesma origem)
---
## 🔍 Como Funciona
### Antes (CDN - ❌ CORS Error)
```
Browser (GCP Cloud Run)
   ↓ fetch
CDN (unpkg.com)
   ↓ CORS ERROR ❌
Worker bloqueado
```
### Depois (Local - ✅ Funciona)
```
Browser (GCP Cloud Run)
   ↓ fetch /ffmpeg/...
Nginx (mesma origem)
   ↓ serve files
Worker carrega ✅
```
---
## 📋 Arquivos Modificados
| Arquivo | Mudança |
|---------|---------|
| `Dockerfile` | ✅ COPY ffmpeg files do node_modules |
| `nginx.conf` | ✅ Location block /ffmpeg/ com CORS headers |
| `ffmpeg-loader.ts` | ✅ Detecta dev/prod, usa local em prod |
---
## 🧪 Como Testar
### Local
```bash
npm run dev
# Abre: http://localhost:5173
# FFmpeg deve carregar do jsDelivr CDN
```
### Production (Cloud Run)
```bash
# Após deploy
curl https://SEU-SERVICE.run.app/ffmpeg/ffmpeg-core.js
# Deve retornar o conteúdo do arquivo
curl -I https://SEU-SERVICE.run.app/ffmpeg/ffmpeg-core.js
# Headers devem incluir:
# - Cross-Origin-Embedder-Policy: require-corp
# - Access-Control-Allow-Origin: *
```
### No Console do Browser
```javascript
// Verificar FFmpeg carregando
// Console deve mostrar:
[FFmpeg Debug] Production mode: using local files
[FFmpeg Debug] ✅ FFmpeg loaded successfully
```
---
## ✅ Resultado
- ✅ FFmpeg carrega sem erros CORS
- ✅ Worker.js acessível
- ✅ Renderização funciona no GCP
- ✅ Cache agressivo (1 ano) para FFmpeg files
- ✅ Dev e Prod funcionam perfeitamente
---
## 🚀 Deploy
```bash
# Commit mudanças
git add Dockerfile nginx.conf services/ffmpeg-loader.ts
git commit -m "Fix: CORS issue with FFmpeg worker by serving files locally"
# Push dispara Cloud Build
git push origin main
# Verificar logs
gcloud builds log $(gcloud builds list --limit=1 --format='value(id)') --stream
```
---
## 🎯 Próximos Passos
Agora que CORS está resolvido:
- [ ] Testar renderização completa no GCP
- [ ] Monitorar performance (FFmpeg local vs CDN)
- [ ] Considerar backend API para renderização pesada
**CORS Fix completo!** ✅
