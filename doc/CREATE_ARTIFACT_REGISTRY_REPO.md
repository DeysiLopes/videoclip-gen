# 📋 Como Criar Repositório no Artifact Registry (Console GCP)

## ✅ Passo-a-Passo (3 minutos)

### 1️⃣ Abrir Artifact Registry

Clique no link:
```
https://console.cloud.google.com/artifacts
```

### 2️⃣ Clicar em "CREATE REPOSITORY"

Botão azul no topo da página

### 3️⃣ Preencher o Formulário

| Campo | Valor |
|-------|-------|
| **Name** | `videoclip-gen` |
| **Format** | `Docker` |
| **Location** | `us-central1` |
| **Description** | `Docker images for videoclip-gen` |

### 4️⃣ Clicar "CREATE"

Aguarde ~30 segundos

### ✅ Pronto!

Repositório criado em:
```
us-central1-docker.pkg.dev/gen-lang-client-0095513148/videoclip-gen
```

---

## 🚀 Próxima Etapa

Depois que criar o repositório, faça git push:

```bash
git push origin main
```

Cloud Build vai detectar e fazer o deploy automaticamente! 🎉

---

## 📸 Screenshots (se precisar)

Se não conseguir encontrar o botão, procure por:
- ☑️ Você estar no projeto correto: `gen-lang-client-0095513148`
- ☑️ Estar em: **Artifact Registry** (não Container Registry)
- ☑️ Região: **us-central1**

---

**É isso! Cria o repo e depois é só fazer git push!** 🚀

