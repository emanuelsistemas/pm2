# PM2 Monitor 🖥️

Uma interface web moderna para monitorar seus processos PM2 em tempo real. Esta aplicação oferece uma visualização elegante e intuitiva dos seus serviços gerenciados pelo PM2, com um tema escuro moderno e interface responsiva.

![PM2 Monitor](https://via.placeholder.com/800x450.png?text=PM2+Monitor+Dashboard)

## ✨ Funcionalidades

- **Interface moderna e escura**: Design elegante e confortável para uso prolongado
- **Cards de serviços**: Visualização dos processos em cards organizados
- **Estatísticas em tempo real**: CPU, memória, estado e tempo de atividade
- **Atualização automática**: Dados atualizados a cada 15 segundos
- **Responsivo**: Funciona em dispositivos desktop e mobile
- **Zero dependência externa**: Funciona completamente local

## 🚀 Tecnologias

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Design**: Bootstrap 5 (via CDN)
- **Ícones**: Font Awesome (via CDN)
- **Dados**: PM2 CLI integrado

## 📋 Pré-requisitos

- Python 3.8+
- PM2 instalado globalmente (`npm install -g pm2`)
- Processos PM2 em execução para monitorar

## 🔧 Instalação

### Método Manual

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd PM2
```

2. Crie um ambiente virtual Python:
```bash
python3 -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Inicie a aplicação:
```bash
python app.py
```

5. Acesse a interface web:
```
http://localhost:5000
```

### Usando o Script de Inicialização

Simplesmente execute:
```bash
./start.sh
```

### Configurando como Serviço PM2

Para configurar o monitor para iniciar automaticamente com o sistema:

```bash
./setup-pm2-service.sh
```

Isso irá:
1. Configurar o ambiente Python
2. Criar a configuração do PM2
3. Registrar o serviço no PM2
4. Fornecer instruções para configurar o PM2 para iniciar automaticamente

## 🎛️ Uso

Após iniciar o serviço, acesse `http://localhost:5000` em seu navegador.

- **Visualização de Processo**: Cards de cada processo PM2 em execução
- **Estatísticas Gerais**: Contagem de processos por status (online, erro, parado)
- **Atualização Manual**: Clique no botão "Atualizar" para buscar dados atualizados
- **Atualização Automática**: Os dados são atualizados automaticamente a cada 15 segundos

## 📌 Notas

- Esta é uma aplicação de monitoramento local, não expõe seus dados para a internet
- Ironia: estamos usando o PM2 para monitorar... o PM2! 😄
- O monitoramento funciona apenas para processos gerenciados pelo PM2

## 🔍 Solução de Problemas

- **Erro de Porta**: Se a porta 5000 já estiver em uso, edite a linha `app.run(host='0.0.0.0', port=5000)` no arquivo `app.py`
- **PM2 não encontrado**: Certifique-se de que o PM2 está instalado globalmente
- **Processos não aparecem**: Verifique se você tem processos PM2 em execução com `pm2 list`

## 📄 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.
