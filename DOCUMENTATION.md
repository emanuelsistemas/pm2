# Documentação do PM2 Monitor

## Visão Geral

O PM2 Monitor é uma aplicação web desenvolvida em Python/Flask que fornece um painel visual para monitorar processos PM2 em execução no servidor. Esta aplicação permite visualizar o status de todos os processos gerenciados pelo PM2, incluindo métricas de uso de CPU, memória e outros dados relevantes.

## Configurações de Portas

### Definição de Ambientes

O sistema opera em dois ambientes distintos, cada um com sua própria porta dedicada:

| Ambiente     | Porta | Descrição                                      |
|--------------|-------|------------------------------------------------|
| Produção     | 4000  | Ambiente estável para uso em produção          |
| Desenvolvimento | 4001 | Ambiente para testes e desenvolvimento        |

### Lógica de Seleção de Porta

A seleção da porta é determinada automaticamente com base na variável de ambiente `NODE_ENV`:

- Se `NODE_ENV=production`: Usa a porta 4000
- Caso contrário: Usa a porta 4001 (modo desenvolvimento)

Esta lógica está implementada no arquivo `app.py`:

```python
env = os.environ.get('NODE_ENV', 'development')
port = 4000 if env == 'production' else 4001
debug = env != 'production'
```

## Configuração de Arquivos

### app.py

Este é o arquivo principal da aplicação Flask. Pontos importantes:

- Porta de execução baseada no ambiente (4000 para produção, 4001 para desenvolvimento)
- Modo debug ativado apenas em ambiente de desenvolvimento 
- Endpoints REST para obter informações dos processos PM2

### start.sh

Script de inicialização que:

- Configura o ambiente virtual Python
- Define explicitamente o ambiente como produção (`NODE_ENV="production"`)
- Instala dependências necessárias
- Inicia a aplicação Flask

### ecosystem.config.js

Configuração do próprio PM2 Monitor para ser gerenciado pelo PM2:

```javascript
module.exports = {
  apps : [{
    name   : "pm2-monitor",
    script : "./start.sh",
    cwd    : "/root/ema-software/PM2",
    watch  : false,
    env: {
      "NODE_ENV": "production",
    },
    max_memory_restart: "200M",
    restart_delay: 3000,
    autorestart: true
  }]
}
```

## Configuração NGINX

O NGINX está configurado para expor o serviço em produção usando o domínio `pm2.emasoftware.io`.

### Detalhes da Configuração

Arquivo: `/etc/nginx/sites-available/pm2.conf`

```nginx
server {
    listen 80;
    server_name pm2.emasoftware.io;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Configurações para arquivos estáticos
    location /static/ {
        alias /var/www/html/pm2/static/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    location /css/ {
        alias /var/www/html/pm2/css/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    location /js/ {
        alias /var/www/html/pm2/js/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Configurações de segurança
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Frame-Options SAMEORIGIN;
}
```

### Pontos Importantes

- O NGINX está configurado para fazer proxy da porta 80 para a porta local 4000 (produção)
- Arquivos estáticos são servidos diretamente do diretório `/var/www/html/pm2/`
- Cabeçalhos de segurança estão configurados para proteger a aplicação

## Diretórios de Build

Os arquivos estáticos para produção estão localizados em:

- Diretório principal: `/var/www/html/pm2/`
- Subdiretórios:
  - `/var/www/html/pm2/static/` - Arquivos estáticos gerais
  - `/var/www/html/pm2/css/` - Arquivos CSS
  - `/var/www/html/pm2/js/` - Arquivos JavaScript

## Gerenciamento com PM2

### Iniciar o Serviço

```bash
pm2 start ecosystem.config.js
```

### Reiniciar o Serviço

```bash
pm2 restart pm2-monitor
```

### Verificar Status

```bash
pm2 status
```

### Visualizar Logs

```bash
pm2 logs pm2-monitor
```

## Resolução de Problemas

### Verificar Porta em Uso

Para verificar qual processo está usando uma porta específica:

```bash
netstat -tulpn | grep PORTA
```

### Reiniciar NGINX

Após alterações na configuração do NGINX:

```bash
sudo systemctl reload nginx
```

### Testar Acesso Local

```bash
curl -I http://localhost:4000
```

## Resumo de Portas

- **Porta 4000**: Usada exclusivamente para ambiente de produção
- **Porta 4001**: Usada exclusivamente para ambiente de desenvolvimento
- **Porta 80**: Porta HTTP padrão usada pelo NGINX para receber solicitações externas

Esta segregação de portas garante que os ambientes de desenvolvimento e produção não entrem em conflito, permitindo testes seguros sem afetar o sistema em produção.