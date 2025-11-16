#!/bin/bash

# Script para limpar diretórios tmp e renders do backend
# Uso: ./cleanup.sh

set -e

echo "🧹 Limpando diretórios temporários..."
echo ""

# Função para limpar e relatar
cleanup_dir() {
    local dir="$1"
    local dir_name="$2"

    if [ -d "$dir" ]; then
        local size_before=$(du -sh "$dir" 2>/dev/null | cut -f1 || echo "0")

        # Contar arquivos
        local file_count=$(find "$dir" -type f 2>/dev/null | wc -l || echo "0")

        if [ "$file_count" -gt 0 ]; then
            echo "📂 $dir_name"
            echo "   📊 Arquivos: $file_count"
            echo "   💾 Tamanho: $size_before"

            # Limpar
            rm -rf "$dir"/*
            mkdir -p "$dir"

            echo "   ✅ Limpeza concluída"
        else
            echo "📂 $dir_name - Já está vazio"
        fi
    else
        echo "⚠️  $dir_name não existe"
        mkdir -p "$dir"
    fi

    echo ""
}

# Limpar diretórios
cleanup_dir "/home/deysi/workspace/videoclip-gen/backend/tmp" "Backend - Temporários (tmp)"
cleanup_dir "/home/deysi/workspace/videoclip-gen/backend/renders" "Backend - Vídeos Renderizados (renders)"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              🎉 Limpeza Concluída com Sucesso!             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📌 Informações:"
echo "   • Diretórios tmp/ e renders/ foram limpos"
echo "   • Espaço em disco liberado"
echo "   • Próxima limpeza automática: 6 horas após iniciar backend"
echo ""
echo "📋 Próximos passos:"
echo "   1. Reiniciar backend: ./start.sh"
echo "   2. Backend limpará automaticamente a cada 6h"
echo ""

