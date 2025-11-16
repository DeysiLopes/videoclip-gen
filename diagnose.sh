#!/bin/bash

# Script para diagnosticar e reconstreuir containers

set -e

echo "🔍 Diagnosticando problema do frontend..."
echo ""

echo "1️⃣ Parando containers..."
docker compose down -v

echo ""
echo "2️⃣ Limpando..."
docker system prune -f

echo ""
echo "3️⃣ Rebuilding frontend..."
docker compose build --no-cache frontend

echo ""
echo "4️⃣ Rebuilding backend..."
docker compose build --no-cache backend

echo ""
echo "5️⃣ Iniciando containers..."
docker compose up -d

echo ""
echo "6️⃣ Aguardando 40 segundos..."
sleep 40

echo ""
echo "7️⃣ Verificando status..."
docker compose ps

echo ""
echo "8️⃣ Testando endpoints..."
echo ""
echo "Frontend (8080):"
curl -v http://localhost:8080/health || echo "❌ Frontend não respondeu"

echo ""
echo "Backend (3000):"
curl -v http://localhost:3000/health || echo "❌ Backend não respondeu"

echo ""
echo "9️⃣ Logs do Frontend:"
docker compose logs frontend | tail -50

echo ""
echo "🔟 Logs do Backend:"
docker compose logs backend | tail -50

echo ""
echo "✅ Diagnóstico completo!"

