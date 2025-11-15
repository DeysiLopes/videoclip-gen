#!/bin/bash

# gcp-setup.sh
# Script para configurar tudo no GCP para CI/CD do videoclip-gen

set -e

echo "🚀 Setup GCP para videoclip-gen"
echo "=================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar se gcloud está instalado
echo -e "${BLUE}1️⃣ Verificando gcloud...${NC}"
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud não está instalado!${NC}"
    echo "   Instale em: https://cloud.google.com/sdk/docs/install"
    exit 1
fi
echo -e "${GREEN}✅ gcloud encontrado${NC}"

# 2. Get project ID
echo ""
echo -e "${BLUE}2️⃣ Obtendo PROJECT_ID...${NC}"
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Nenhum projeto GCP configurado!${NC}"
    echo "   Execute: gcloud config set project PROJECT_ID"
    exit 1
fi
echo -e "${GREEN}✅ Projeto: $PROJECT_ID${NC}"

# 3. Criar Artifact Registry repository
echo ""
echo -e "${BLUE}3️⃣ Criando Artifact Registry repository...${NC}"
REPO_NAME="videoclip-gen-repo"
REGION="us-central1"

if gcloud artifacts repositories describe $REPO_NAME --location=$REGION &> /dev/null; then
    echo -e "${YELLOW}⚠️  Repositório já existe${NC}"
else
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="Docker images for videoclip-gen"
    echo -e "${GREEN}✅ Repositório criado: $REPO_NAME${NC}"
fi

# 4. Configurar permissões Cloud Build
echo ""
echo -e "${BLUE}4️⃣ Configurando permissões IAM...${NC}"

# Get project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SERVICE_ACCOUNT="$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"

echo "   Service Account: $SERVICE_ACCOUNT"

# Cloud Run Admin
echo "   Adicionando Cloud Run Admin..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$SERVICE_ACCOUNT \
    --role=roles/run.admin \
    --quiet 2>/dev/null || true

# Service Account User
echo "   Adicionando Service Account User..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$SERVICE_ACCOUNT \
    --role=roles/iam.serviceAccountUser \
    --quiet 2>/dev/null || true

# Artifact Registry Writer
echo "   Adicionando Artifact Registry Writer..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$SERVICE_ACCOUNT \
    --role=roles/artifactregistry.writer \
    --quiet 2>/dev/null || true

echo -e "${GREEN}✅ Permissões configuradas${NC}"

# 5. Criar Cloud Run service (placeholder)
echo ""
echo -e "${BLUE}5️⃣ Criando Cloud Run service...${NC}"
SERVICE_NAME="videoclip-gen"
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$SERVICE_NAME:latest"

if gcloud run services describe $SERVICE_NAME --region=$REGION &> /dev/null; then
    echo -e "${YELLOW}⚠️  Service já existe${NC}"
else
    # Criar uma imagem placeholder para o primeiro deploy
    echo "   Criando serviço (pode levar alguns minutos)..."
    gcloud run deploy $SERVICE_NAME \
        --region=$REGION \
        --platform=managed \
        --allow-unauthenticated \
        --memory=2Gi \
        --cpu=2 \
        --timeout=3600 \
        --max-instances=100 \
        --min-instances=1 \
        --image=gcr.io/cloudrun/hello \
        --quiet 2>/dev/null || true

    echo -e "${GREEN}✅ Cloud Run service criado${NC}"
fi

# 6. Criar Cloud Build Trigger
echo ""
echo -e "${BLUE}6️⃣ Instruções para criar Cloud Build Trigger...${NC}"
echo ""
echo "⚠️  Trigger deve ser criado MANUALMENTE no console:"
echo ""
echo "   1. Ir para: https://console.cloud.google.com/cloud-build/triggers"
echo "   2. Clicar em 'Create Trigger'"
echo "   3. Preencher:"
echo "      - Name: videoclip-gen-main-deploy"
echo "      - Repository: DeysiLopes/videoclip-gen (GitHub)"
echo "      - Branch: ^main$"
echo "      - Build configuration: Cloud Build configuration file"
echo "      - Configuration file location: cloudbuild.yaml"
echo ""

# 7. Atualizar cloudbuild.yaml com valores corretos
echo -e "${BLUE}7️⃣ Verificando cloudbuild.yaml...${NC}"

# Atualizar cloudbuild.yaml com o repository correto
CLOUDBUILD_FILE="cloudbuild.yaml"

if [ -f "$CLOUDBUILD_FILE" ]; then
    # Verificar se já tem o repo correto
    if grep -q "dreamdirector-repo" "$CLOUDBUILD_FILE"; then
        echo "   ⚠️  cloudbuild.yaml ainda menciona 'dreamdirector-repo'"
        echo "   Atualizando para '$REPO_NAME'..."

        # Fazer backup
        cp "$CLOUDBUILD_FILE" "$CLOUDBUILD_FILE.bak"

        # Substituir
        sed -i "s/dreamdirector-repo/$REPO_NAME/g" "$CLOUDBUILD_FILE"

        echo -e "${GREEN}✅ cloudbuild.yaml atualizado${NC}"
        echo "   Backup em: $CLOUDBUILD_FILE.bak"
    else
        echo -e "${GREEN}✅ cloudbuild.yaml já está correto${NC}"
    fi
fi

# 8. Resumo
echo ""
echo "════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Setup GCP Completo!${NC}"
echo "════════════════════════════════════════════════════"
echo ""
echo "📊 Resumo:"
echo "   Project ID: $PROJECT_ID"
echo "   Repository: $REPO_NAME (us-central1)"
echo "   Cloud Run: $SERVICE_NAME"
echo ""
echo "🚀 Próximos passos:"
echo ""
echo "   1. Criar Cloud Build Trigger (manual no console)"
echo "      https://console.cloud.google.com/cloud-build/triggers"
echo ""
echo "   2. Commit cloudbuild.yaml atualizado:"
echo "      git add cloudbuild.yaml"
echo "      git commit -m 'Update artifact registry repo'"
echo "      git push origin main"
echo ""
echo "   3. Monitorar builds:"
echo "      gcloud builds list --limit=10"
echo "      gcloud builds log BUILD_ID --stream"
echo ""
echo "💡 URLs úteis:"
echo "   - Artifact Registry: https://console.cloud.google.com/artifacts"
echo "   - Cloud Build: https://console.cloud.google.com/cloud-build"
echo "   - Cloud Run: https://console.cloud.google.com/run"
echo ""

