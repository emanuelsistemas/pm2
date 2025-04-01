from flask import Flask, render_template, jsonify
import subprocess
import json
import os
import time

app = Flask(__name__, 
            static_folder='.',
            static_url_path='',
            template_folder='templates')

# Configurar pasta static para arquivos estáticos adicionais
@app.route('/static/<path:filename>')
def static_files(filename):
    return app.send_static_file(f'static/{filename}')

def get_pm2_processes():
    """Obter lista de processos PM2 ativos no sistema"""
    try:
        # Executar o comando PM2 jlist para obter dados JSON sobre os processos
        result = subprocess.run(['pm2', 'jlist'], capture_output=True, text=True)
        if result.returncode != 0:
            return {"error": "Falha ao executar PM2", "message": result.stderr}
        
        # Processar a saída JSON do PM2
        processes = json.loads(result.stdout)
        
        # Extrair informações de porta de cada processo
        for process in processes:
            # Inicializar portas como desconhecidas
            process['port_info'] = {
                'dev': 'N/A',
                'prod': 'N/A'
            }
            
            # Mapeamento de portas conhecidas por serviço
            known_ports = {
                'supabase-api': {'dev': 8000, 'prod': 8000},
                'pm2-monitor': {'dev': 4001, 'prod': 4000}
            }
            
            # Verificar se é um serviço com portas conhecidas
            name = process.get('name', '')
            if name in known_ports:
                process['port_info'] = known_ports[name]
                continue
            
            # Verificar se temos as variáveis de ambiente
            env = process.get('pm2_env', {})
            env_vars = env.get('env', {})
            
            # Verificar porta na configuração atual
            current_port = env_vars.get('PORT')
            current_env = env_vars.get('NODE_ENV', '').lower()
            
            if current_port:
                if current_env == 'production':
                    process['port_info']['prod'] = current_port
                else:
                    process['port_info']['dev'] = current_port
            
            # Tentar obter o nome base do serviço (removendo -dev ou -prod)
            base_name = name
            if name.endswith('-dev'):
                base_name = name[:-4]
            elif name.endswith('-prod'):
                base_name = name[:-5]
                
            # Buscar outros processos com o mesmo nome base para obter a outra porta
            for other in processes:
                other_name = other.get('name', '')
                other_env = other.get('pm2_env', {}).get('env', {}).get('NODE_ENV', '').lower()
                other_port = other.get('pm2_env', {}).get('env', {}).get('PORT')
                
                # Se é o mesmo processo base mas ambiente diferente
                if other_name != name and (other_name.startswith(base_name) or base_name.startswith(other_name.split('-')[0])):
                    if other_env == 'production' and other_port:
                        process['port_info']['prod'] = other_port
                    elif other_port:
                        process['port_info']['dev'] = other_port
                        
            # Verificar se há um arquivo de script para esse processo que possa conter informações sobre a porta
            if name == 'supabase-api' and (process['port_info']['dev'] == 'N/A' or process['port_info']['prod'] == 'N/A'):
                try:
                    # Tentar extrair porta do script
                    pm_exec_path = env.get('pm_exec_path', '')
                    cwd = env.get('pm_cwd', '')
                    if cwd and os.path.isdir(cwd):
                        api_file = os.path.join(cwd, 'api.py')
                        if os.path.isfile(api_file):
                            with open(api_file, 'r') as f:
                                content = f.read()
                                import re
                                port_match = re.search(r'port=(\d+)', content)
                                if port_match:
                                    port = int(port_match.group(1))
                                    process['port_info']['dev'] = port
                                    process['port_info']['prod'] = port
                except Exception as script_error:
                    print(f"Erro ao analisar script: {str(script_error)}")
                    pass
        
        return processes
    except Exception as e:
        return {"error": f"Erro: {str(e)}"}

@app.route('/')
def index():
    """Página principal do monitor PM2"""
    return render_template('index.html')

@app.route('/api/processes')
def api_processes():
    """API para obter os processos PM2 em formato JSON"""
    processes = get_pm2_processes()
    return jsonify(processes)

@app.route('/api/stats')
def api_stats():
    """API para obter estatísticas gerais do PM2"""
    processes = get_pm2_processes()
    
    # Calcular estatísticas básicas
    stats = {
        "total": len(processes),
        "online": sum(1 for p in processes if p.get("pm2_env", {}).get("status") == "online"),
        "errored": sum(1 for p in processes if p.get("pm2_env", {}).get("status") == "errored"),
        "stopped": sum(1 for p in processes if p.get("pm2_env", {}).get("status") == "stopped"),
        "timestamp": int(time.time())
    }
    
    return jsonify(stats)

if __name__ == '__main__':
    # Porta fixa para desenvolvimento (4001) ou produção (4000)
    env = os.environ.get('NODE_ENV', 'development')
    port = 4000 if env == 'production' else 4001
    debug = env != 'production'
    
    print(f"Iniciando servidor Flask na porta {port} (ambiente: {env})")
    app.run(host='0.0.0.0', port=port, debug=debug)
