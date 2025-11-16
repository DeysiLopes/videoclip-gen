#!/bin/bash

# Script para commitar e fazer push das mudanças

echo "📝 Preparando commit..."
echo ""

# Status atual
git status --short

echo ""
echo "➕ Adicionando arquivos..."

# Adicionar arquivos modificados
git add .

echo ""
echo "✍️  Criando commit..."

# Commit com mensagem descritiva
git commit -m "fix: Docker setup corrections and automation scripts

- Fixed backend Dockerfile heredoc syntax error
- Removed obsolete docker-compose version field
- Resolved internal port conflicts (frontend:8080, backend:3000)
- Added start.sh and stop.sh automation scripts
- Added QUICKSTART.sh interactive guide
- Updated README.md with Docker instructions
- Added comprehensive documentation in doc/DOCKER_SETUP_FIX.md

Changes:
- backend/Dockerfile: Replace heredoc with echo chain
- docker-compose.yml: Remove version, fix ports mapping
- start.sh: New automation script for starting containers
- stop.sh: New automation script for stopping containers
- QUICKSTART.sh: Interactive guide for developers
- README.md: Added Docker Compose section with scripts
- doc/DOCKER_SETUP_FIX.md: Complete fix documentation"

echo ""
echo "🚀 Fazendo push para o repositório remoto..."

# Push para main
git push origin main

echo ""
echo "✅ Commit e push realizados com sucesso!"
echo ""
echo "📌 Próximos passos:"
echo "   1. Verifique o Cloud Build no GCP"
echo "   2. Aguarde o deploy completar (~10 min)"
echo "   3. Teste a aplicação em produção"
echo ""

