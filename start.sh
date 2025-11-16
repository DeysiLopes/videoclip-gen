#!/bin/bash

# Script para iniciar os containers Docker
# Autor: DreamDirector AI Team
# Descrição: Sobe frontend e backend com Docker Compose

set -e

echo "🚀 Iniciando DreamDirector AI..."
echo ""

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker compose down -v

echo ""
echo "🔨 Construindo e iniciando containers..."
docker compose up --build -d

echo ""
echo "⏳ Aguardando containers ficarem prontos..."
sleep 10

echo ""
echo "✅ Verificando status dos containers..."
docker compose ps

echo ""
echo "🎉 DreamDirector AI iniciado com sucesso!"
echo ""
echo "📌 Acessos:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8080/health"
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs:           docker compose logs -f"
echo "   Ver logs frontend:  docker compose logs -f frontend"
echo "   Ver logs backend:   docker compose logs -f backend"
echo "   Parar:              docker compose down"
echo "   Parar e limpar:     docker compose down -v"
echo ""

