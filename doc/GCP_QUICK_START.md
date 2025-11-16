# 🚀 Setup GCP - Quick Start Guide

## O Problema

```
name unknown: Repository "dreamdirector-repo" not found
```

**Causa:** O Artifact Registry repository não foi criado no GCP

---

## ✅ A Solução

### Passo 1: Executar script de setup (1 min)

```bash
chmod +x gcp-setup.sh
./gcp-setup.sh
```

**O script vai:**
- ✅ Verificar autenticação GCP
- ✅ Criar Artifact Registry repository `videoclip-gen-repo`
- ✅ Configurar permissões IAM
- ✅ Criar Cloud Run service
- ✅ Atualizar cloudbuild.yaml

### Passo 2: Criar Cloud Build Trigger (manual - 2 min)

O script vai instruir você a ir para:
```
https://console.cloud.google.com/cloud-build/triggers
```

**Clicar em "Create Trigger" e preencher:**

| Campo | Valor |
|-------|-------|
| **Name** | `videoclip-gen-main-deploy` |
| **Repository** | `DeysiLopes/videoclip-gen` (GitHub) |
| **Branch** | `^main$` |
| **Build config** | `Cloud Build configuration file` |
| **Configuration file** | `cloudbuild.yaml` |

### Passo 3: Commit e push (1 min)

```bash
git add cloudbuild.yaml
git commit -m "Update artifact registry repo to videoclip-gen-repo"
git push origin main
```

---

## 🔍 Monitorar Build

### Ver builds
```bash
gcloud builds list --limit=10
```

### Ver logs em tempo real
```bash
gcloud builds log $(gcloud builds list --limit=1 --format='value(id)') --stream
```

### Ver status do serviço
```bash
gcloud run services describe videoclip-gen --region us-central1
```

---

## 📊 O que foi atualizado

### Arquivo: cloudbuild.yaml
```yaml
# ❌ Antes
dreamdirector-repo/dreamdirector-ai

# ✅ Depois
videoclip-gen-repo/videoclip-gen
```

### Arquivo: gcp-setup.sh (novo)
- Script automático para criar tudo no GCP
- Cria repository, configura permissões, etc

---

## 🎯 Fluxo Completo

```
1. ./gcp-setup.sh
   ↓
2. Criar Trigger manualmente no console
   ↓
3. git push origin main
   ↓
4. Cloud Build detecta push
   ↓
5. Build → Push → Deploy → Health Check
   ↓
6. ✅ App em produção!
```

---

## ✨ URL da App

Após o primeiro deploy bem-sucedido:

```
https://videoclip-gen-RANDOM.run.app
```

---

## 🎬 Comece Agora

```bash
./gcp-setup.sh
```

**Então siga as instruções!** 🚀

