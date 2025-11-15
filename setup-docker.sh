#!/bin/bash

# setup-docker.sh
# Script para preparar o projeto para Docker build no GCP

set -e

echo "🚀 Setup Docker para DreamDirector AI"
echo "======================================"

# 1. Verificar package-lock.json
echo ""
echo "1️⃣ Verificando package-lock.json..."
if [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json existe"
else
    echo "⚠️ package-lock.json não encontrado, gerando..."
    npm install
    echo "✅ package-lock.json gerado"
fi

# 2. Verificar .gitignore
echo ""
echo "2️⃣ Verificando .gitignore..."
if grep -q "package-lock.json" .gitignore; then
    echo "❌ ERRO: .gitignore bloqueia package-lock.json!"
    echo "   Remova a linha 'package-lock.json' do .gitignore"
    exit 1
else
    echo "✅ .gitignore não bloqueia package-lock.json"
fi

# 3. Testar build local
echo ""
echo "3️⃣ Testando Docker build local..."
docker build -t dreamdirector-ai:test . --progress=plain 2>&1 | tail -20

if [ $? -eq 0 ]; then
    echo "✅ Docker build bem-sucedido!"

    # 4. Testar Nginx config
    echo ""
    echo "4️⃣ Testando configuração Nginx..."
    docker run --rm dreamdirector-ai:test nginx -t
    echo "✅ Nginx config OK"
else
    echo "❌ Docker build falhou!"
    exit 1
fi

# 5. Commit package-lock.json
echo ""
echo "5️⃣ Commitando package-lock.json..."
if [ -z "$(git status --porcelain package-lock.json)" ]; then
    echo "✅ package-lock.json já está commitado"
else
    git add package-lock.json
    git commit -m "Add package-lock.json for reproducible builds"
    echo "✅ package-lock.json commitado"
fi

# 6. Push para trigger Cloud Build
echo ""
echo "6️⃣ Pronto para push!"
echo "   Execute: git push origin main"
echo ""
echo "✅ Setup completo!"
echo ""
echo "Próximos passos:"
echo "  1. git push origin main"
echo "  2. Monitorar em: Cloud Build → History"
echo "  3. Verificar logs: gcloud builds log BUILD_ID --stream"

