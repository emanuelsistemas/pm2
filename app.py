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
    # Iniciar o servidor Flask
    app.run(host='0.0.0.0', port=5000, debug=True)
