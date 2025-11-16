#!/bin/bash

# Script para parar os containers Docker
# Autor: DreamDirector AI Team
# Descrição: Para e remove containers, volumes e redes

set -e

echo "🛑 Parando DreamDirector AI..."
echo ""

# Parar e remover containers, volumes e redes
docker compose down -v

echo ""
echo "✅ DreamDirector AI parado com sucesso!"
echo ""
echo "📋 Para iniciar novamente:"
echo "   ./start.sh"
echo ""

