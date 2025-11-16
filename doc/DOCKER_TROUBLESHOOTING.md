# 🐛 Docker Build Troubleshooting - DreamDirector AI

## 🚨 Erro: `npm ci` falha com "package-lock.json not found"

### ❌ O Problema

O Docker builder tentava usar `npm ci` que REQUER `package-lock.json`, mas este arquivo pode:
- Não estar commitado no git
- Estar no `.gitignore`
- Não existir localmente

### ✅ A Solução

**Dockerfile agora usa `npm install`** que funciona mesmo sem `package-lock.json`.

---

## 📋 Checklist Antes de Deployar

### 1. Commit do package-lock.json ✅

Garantir que existe localmente:
```bash
ls -la package-lock.json
```

Se não existir, gerar:
```bash
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push origin main
```

### 2. Verificar .gitignore

Deve conter `node_modules` e `dist`, MAS NÃO `package-lock.json`:

```bash
# ✅ Correto
node_modules/    # ignorar
dist/            # ignorar
# package-lock.json NÃO está aqui

# ❌ Errado
package-lock.json  # isso bloquearia!
```

### 3. Dockerfile otimizado

```dockerfile
# ✅ Usa npm install (trabalha sem package-lock.json)
RUN npm install

# ❌ Evita npm ci (requer package-lock.json)
# RUN npm ci --only=production
```

---

## 🚀 Deploy Steps

### 1. Local
```bash
# Build local para testar
docker build -t dreamdirector-ai:test .

# Verificar se buildou sem erro
docker run --rm dreamdirector-ai:test nginx -t
```

### 2. Push para GCP

```bash
# Commit package-lock.json
git add package-lock.json
git commit -m "Add package-lock.json for Docker builds"

# Push trigger
git push origin main

# Cloud Build dispara automaticamente
# Ver logs em: Cloud Build Console
```

### 3. Logs do Build

```bash
# Ver histórico de builds
gcloud builds list

# Ver logs de um build específico
gcloud builds log BUILD_ID

# Follow em tempo real
gcloud builds log BUILD_ID --stream
```

---

## 🔍 Verificar Build

### No console GCP

```
Cloud Build → History → clique no build → Logs
```

### Via CLI

```bash
# Status do build
gcloud builds describe BUILD_ID

# Logs completos
gcloud builds log BUILD_ID

# Se falhou, ver o erro específico
gcloud builds log BUILD_ID | grep -i error
```

---

## 💡 Dicas de Performance

### Melhorar cache Docker

```dockerfile
# ✅ Bom: dependências mudam raramente
COPY package*.json ./
RUN npm install

# Depois copiar código que muda frequentemente
COPY . .
RUN npm run build
```

### Reduzir tamanho de build

```dockerfile
# Use alpine (pequeno)
FROM node:18-alpine AS builder
FROM nginx:alpine

# Resultado: imagem < 500MB
```

### Parallelizar steps no cloudbuild.yaml

```yaml
steps:
  - name: Build
    args: [...]
    id: build1

  # Esperar build1 completar antes de push
  - name: Push
    args: [...]
    waitFor: ['build1']
```

---

## 🎯 Próxima Tentativa

1. **Garantir package-lock.json localmente:**
   ```bash
   npm install
   git add package-lock.json
   git commit -m "Add lock file"
   git push origin main
   ```

2. **Monitorar build no GCP:**
   ```bash
   gcloud builds log $(gcloud builds list --limit=1 --format='value(id)') --stream
   ```

3. **Se falhar, checkar:**
   - ✅ package-lock.json existe no repo
   - ✅ .gitignore não bloqueia package-lock.json
   - ✅ Dockerfile usa `npm install` (não `npm ci`)

---

**Pronto!** 🚀

