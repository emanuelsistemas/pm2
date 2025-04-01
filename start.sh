#!/bin/bash

# Script para iniciar o PM2 Monitor

echo "===== Iniciando PM2 Monitor ====="
echo ""

# Verificar se estamos no diretório correto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
cd "$SCRIPT_DIR"

# Verificar se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não está instalado. Por favor, instale o Python 3."
    exit 1
fi

# Verificar se o PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 não está instalado. Este aplicativo monitora processos PM2, que precisa estar instalado."
    echo "Instale o PM2 com: npm install -g pm2"
    exit 1
fi

# Criar ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "🔨 Criando ambiente virtual Python..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo "🔌 Ativando ambiente virtual..."
source venv/bin/activate

# Instalar dependências
echo "📦 Instalando dependências..."
pip install -r requirements.txt --break-system-packages

# Configurar ambiente de produção
export NODE_ENV="production"
echo "🔧 Ambiente configurado para: produção (porta 4000)"

# Iniciar aplicativo
echo "🚀 Iniciando PM2 Monitor..."
python3 app.py

# Desativar ambiente virtual ao sair
trap 'echo "🔌 Desativando ambiente virtual..."; deactivate' EXIT
