#!/usr/bin/env python3
"""
fix_imports.py - Corrige imports de todos os componentes para a nova estrutura monorepo
Execute: python3 fix_imports.py
"""

import os
import re
from pathlib import Path

# Diretório base
FRONTEND_DIR = Path(__file__).parent

# Mapear padrões de imports antigos para novos
IMPORT_REPLACEMENTS = {
    # Services: ../services/ → ../src/services/
    r"from ['\"]\.\.\/services\/": "from '../src/services/",

    # Types: ../types → ../src/types
    r"from ['\"]\.\.\/types": "from '../src/types",

    # Index: ../index → ../src/index (se houver)
    r"from ['\"]\.\.\/index": "from '../src/index",
}

def fix_imports_in_file(filepath):
    """Corrige imports em um arquivo"""
    if not filepath.suffix in ['.tsx', '.ts']:
        return False

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Aplicar todas as substituições
        for old_pattern, new_pattern in IMPORT_REPLACEMENTS.items():
            content = re.sub(old_pattern, new_pattern, content)

        # Se houve mudanças, escrever de volta
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Corrigido: {filepath.relative_to(FRONTEND_DIR)}")
            return True

        return False
    except Exception as e:
        print(f"❌ Erro ao processar {filepath}: {e}")
        return False

def main():
    """Corrige imports em todos os arquivos .tsx e .ts"""
    print("🔧 Corrigindo imports...")

    fixed_count = 0

    # Pastas a processar
    folders_to_process = [
        'components',
        'src',
        'src/services'
    ]

    for folder in folders_to_process:
        folder_path = FRONTEND_DIR / folder
        if folder_path.exists():
            for filepath in folder_path.rglob('*.tsx'):
                if fix_imports_in_file(filepath):
                    fixed_count += 1
            for filepath in folder_path.rglob('*.ts'):
                if fix_imports_in_file(filepath):
                    fixed_count += 1

    print(f"\n✨ Concluído! {fixed_count} arquivo(s) corrigido(s)")

if __name__ == '__main__':
    main()

