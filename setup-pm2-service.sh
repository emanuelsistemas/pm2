#!/bin/bash

# Script para configurar o PM2 Monitor como um serviço PM2
# Ironia: usando PM2 para monitorar o PM2 :)

echo "===== Configurando PM2 Monitor como serviço PM2 ====="
echo ""

# Verificar se estamos no diretório correto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
cd "$SCRIPT_DIR"

# Verificar se o PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 não está instalado"
    echo "Instale o PM2 com: npm install -g pm2"
    exit 1
fi

# Verificar se o script de inicialização existe
if [ ! -f "$SCRIPT_DIR/start.sh" ]; then
    echo "❌ Script de inicialização não encontrado em $SCRIPT_DIR/start.sh"
    exit 1
fi

# Garantir que o script tem permissão de execução
chmod +x "$SCRIPT_DIR/start.sh"

# Configurar ambiente virtual Python (se necessário)
if [ ! -d "$SCRIPT_DIR/venv" ]; then
    echo "🔨 Criando ambiente virtual Python..."
    python3 -m venv "$SCRIPT_DIR/venv"
    
    echo "📦 Instalando dependências..."
    source "$SCRIPT_DIR/venv/bin/activate"
    pip install -r "$SCRIPT_DIR/requirements.txt"
    deactivate
fi

# Criar ecosystem.config.js para o PM2 se não existir
if [ ! -f "$SCRIPT_DIR/ecosystem.config.js" ]; then
    echo "📝 Criando configuração do PM2..."
    cat > "$SCRIPT_DIR/ecosystem.config.js" << EOL
module.exports = {
  apps : [{
    name   : "pm2-monitor",
    script : "./start.sh",
    cwd    : "${SCRIPT_DIR}",
    watch  : false,
    env: {
      "NODE_ENV": "production",
    },
    max_memory_restart: "200M",
    restart_delay: 3000,
    autorestart: true
  }]
}
EOL
    echo "✅ Arquivo de configuração do PM2 criado: $SCRIPT_DIR/ecosystem.config.js"
fi

# Verificar se o serviço já está cadastrado no PM2
if pm2 list | grep -q "pm2-monitor"; then
    echo "🔄 O serviço PM2 Monitor já está registrado no PM2. Reiniciando..."
    pm2 restart pm2-monitor
else
    echo "🚀 Registrando o PM2 Monitor como um serviço no PM2..."
    pm2 start "$SCRIPT_DIR/ecosystem.config.js"
fi

# Salvar configuração do PM2
echo "💾 Salvando configuração do PM2..."
pm2 save

# Obter comando de startup para inicialização do sistema
echo ""
echo "🔄 Para configurar o PM2 para iniciar automaticamente com o sistema, execute:"
echo ""
pm2 startup | grep -v PM2 | grep -v "For init systems like systemd"
echo ""

echo "===== Configuração Concluída ====="
echo ""
echo "✅ PM2 Monitor foi configurado como um serviço PM2"
echo "  - Para ver o status: pm2 status"
echo "  - Para ver logs: pm2 logs pm2-monitor"
echo "  - Para parar: pm2 stop pm2-monitor"
echo "  - Para reiniciar: pm2 restart pm2-monitor"
echo ""
echo "Acesse o PM2 Monitor em: http://localhost:5000"
