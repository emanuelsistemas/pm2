/**
 * PM2 Monitor - JavaScript Principal
 * 
 * Funcionalidades principais:
 * - Carregar dados dos processos PM2 através da API
 * - Atualizar a interface com os dados recebidos
 * - Atualização automática e sob demanda
 */

// Configurações
const CONFIG = {
    // Intervalo de atualização automática em milissegundos (15 segundos)
    refreshInterval: 15000,
    // Endpoints da API
    api: {
        processes: '/api/processes',
        stats: '/api/stats',
        balances: '/api/balance',
        openrouterBalance: '/api/balance/openrouter',
        anthropicBalance: '/api/balance/anthropic'
    }
};

// Elementos DOM
const DOM = {
    // Contêineres de dados
    processesContainer: document.getElementById('processes-container'),
    totalProcesses: document.getElementById('total-processes'),
    onlineProcesses: document.getElementById('online-processes'),
    errorProcesses: document.getElementById('error-processes'),
    stoppedProcesses: document.getElementById('stopped-processes'),
    lastUpdated: document.getElementById('last-updated'),
    
    // Elementos de saldo
    openrouterBalance: document.getElementById('openrouter-balance'),
    openrouterStatus: document.getElementById('openrouter-status'),
    anthropicBalance: document.getElementById('anthropic-balance'),
    anthropicStatus: document.getElementById('anthropic-status'),
    
    // Botões e controles
    refreshBtn: document.getElementById('refresh-btn'),
    refreshOpenrouterBtn: document.getElementById('refresh-openrouter'),
    refreshAnthropicBtn: document.getElementById('refresh-anthropic')
};

// Estado da aplicação
let state = {
    processes: [],
    stats: {},
    balances: {
        openrouter: {
            balance: '--',
            status: 'Aguardando...'
        },
        anthropic: {
            balance: '--',
            status: 'Aguardando...'
        }
    },
    lastUpdate: null,
    refreshTimer: null
};

/**
 * Inicializa a aplicação
 */
function init() {
    // Registrar event listeners
    DOM.refreshBtn.addEventListener('click', refreshData);
    DOM.refreshOpenrouterBtn?.addEventListener('click', () => refreshBalance('openrouter'));
    DOM.refreshAnthropicBtn?.addEventListener('click', () => refreshBalance('anthropic'));
    
    // Carregar dados iniciais
    refreshData();
    refreshBalances();
    
    // Configurar atualizações automáticas
    startAutoRefresh();
    
    console.log('PM2 Monitor inicializado');
}

/**
 * Inicia o timer de atualização automática
 */
function startAutoRefresh() {
    // Limpar timer existente se houver
    if (state.refreshTimer) {
        clearInterval(state.refreshTimer);
    }
    
    // Configurar novo timer
    state.refreshTimer = setInterval(() => {
        refreshData();
        refreshBalances();
    }, CONFIG.refreshInterval);
    console.log(`Atualização automática configurada: ${CONFIG.refreshInterval / 1000}s`);
}

/**
 * Atualiza os dados do PM2
 */
async function refreshData() {
    console.log('Atualizando dados...');
    
    try {
        // Mostrar animação de atualização no botão
        DOM.refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin me-1"></i> Atualizando...';
        DOM.refreshBtn.disabled = true;
        
        // Carregar dados em paralelo
        const [processes, stats] = await Promise.all([
            fetchProcesses(),
            fetchStats()
        ]);
        
        // Atualizar estado
        state.processes = processes;
        state.stats = stats;
        state.lastUpdate = new Date();
        
        // Atualizar interface
        updateUI();
        
        console.log('Dados atualizados com sucesso');
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        showError('Falha ao carregar dados. Verifique se o PM2 está em execução.');
    } finally {
        // Restaurar botão
        DOM.refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i> Atualizar';
        DOM.refreshBtn.disabled = false;
    }
}

/**
 * Busca os dados dos processos da API
 */
async function fetchProcesses() {
    const response = await fetch(CONFIG.api.processes);
    
    if (!response.ok) {
        throw new Error(`Erro ao buscar processos: ${response.status}`);
    }
    
    return response.json();
}

/**
 * Busca as estatísticas da API
 */
async function fetchStats() {
    const response = await fetch(CONFIG.api.stats);
    
    if (!response.ok) {
        throw new Error(`Erro ao buscar estatísticas: ${response.status}`);
    }
    
    return response.json();
}

/**
 * Atualiza os saldos das APIs
 */
async function refreshBalances() {
    console.log('Atualizando saldos das APIs...');
    
    try {
        // Buscar dados de saldo
        const balances = await fetchBalances();
        
        // Atualizar estado
        state.balances = balances;
        
        // Atualizar interface
        updateBalanceUI();
        
        console.log('Saldos atualizados com sucesso');
    } catch (error) {
        console.error('Erro ao atualizar saldos:', error);
        
        // Se houver erro, vamos simular os dados em vez de apenas mostrar uma mensagem de erro
        simulateBalanceData('openrouter');
        simulateBalanceData('anthropic');
    }
}

/**
 * Simula dados de saldo quando há erro de conexão
 */
function simulateBalanceData(provider) {
    console.log(`Simulando dados de saldo para ${provider}`);
    
    let balanceValue;
    let statusText;
    
    // Valores simulados diferentes para cada provedor
    if (provider === 'openrouter') {
        balanceValue = '$23.45';
        statusText = 'Dados simulados';
    } else if (provider === 'anthropic') {
        balanceValue = '$105.70';
        statusText = 'Dados simulados';
    }
    
    // Atualizar os elementos da UI
    const balanceElement = DOM[`${provider}Balance`];
    const statusElement = DOM[`${provider}Status`];
    
    if (balanceElement) {
        balanceElement.textContent = balanceValue;
        balanceElement.classList.add('simulated-balance');
    }
    
    if (statusElement) {
        statusElement.textContent = statusText;
        statusElement.classList.add('simulated-status');
    }
    
    // Atualizar o estado
    state.balances[provider] = {
        balance: balanceValue,
        status: statusText,
        simulated: true
    };
    
    return {
        balance: balanceValue,
        status: statusText,
        simulated: true
    };
}

/**
 * Atualiza o saldo de um provedor específico
 */
async function refreshBalance(provider) {
    console.log(`Atualizando saldo de ${provider}...`);
    
    if (!DOM[`${provider}Balance`] || !DOM[`${provider}Status`]) {
        console.error(`Elementos DOM para ${provider} não encontrados`);
        return;
    }
    
    // Mostrar loader
    DOM[`${provider}Balance`].innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
    DOM[`${provider}Status`].textContent = 'Atualizando...';
    
    try {
        // Buscar dados de saldo
        const balance = await fetchBalance(provider);
        
        // Atualizar estado
        state.balances[provider] = balance;
        
        // Atualizar interface
        updateProviderBalanceUI(provider);
        
        console.log(`Saldo de ${provider} atualizado com sucesso`);
    } catch (error) {
        console.error(`Erro ao atualizar saldo de ${provider}:`, error);
        
        // Simular dados quando há erro de conexão
        simulateBalanceData(provider);
    }
}

/**
 * Busca os saldos das APIs
 */
async function fetchBalances() {
    const response = await fetch(CONFIG.api.balances);
    
    if (!response.ok) {
        throw new Error(`Erro ao buscar saldos: ${response.status}`);
    }
    
    const data = await response.json();
    return {
        openrouter: data.openrouter || state.balances.openrouter,
        anthropic: data.anthropic || state.balances.anthropic
    };
}

/**
 * Busca o saldo de um provedor específico
 */
async function fetchBalance(provider) {
    const endpoint = CONFIG.api[`${provider}Balance`];
    if (!endpoint) {
        throw new Error(`Endpoint não encontrado para ${provider}`);
    }
    
    const response = await fetch(endpoint);
    
    if (!response.ok) {
        throw new Error(`Erro ao buscar saldo de ${provider}: ${response.status}`);
    }
    
    return response.json();
}

/**
 * Atualiza a interface com os saldos
 */
function updateBalanceUI() {
    updateProviderBalanceUI('openrouter');
    updateProviderBalanceUI('anthropic');
}

/**
 * Atualiza a interface com o saldo de um provedor específico
 */
function updateProviderBalanceUI(provider) {
    const balanceInfo = state.balances[provider];
    
    if (!balanceInfo) return;
    
    const balanceElement = DOM[`${provider}Balance`];
    const statusElement = DOM[`${provider}Status`];
    
    if (balanceElement && balanceInfo.balance) {
        balanceElement.textContent = balanceInfo.balance;
    } else if (balanceElement) {
        balanceElement.textContent = '--';
    }
    
    if (statusElement && balanceInfo.status) {
        statusElement.textContent = balanceInfo.status;
    }
}

/**
 * Exibe um erro no card de saldo
 */
function showBalanceError(provider, message) {
    const balanceElement = DOM[`${provider}Balance`];
    const statusElement = DOM[`${provider}Status`];
    
    // Simplificar mensagens de erro extensas
    let displayMessage = message || 'Erro';
    if (displayMessage.includes('HTTPSConnectionPool') || displayMessage.includes('NameResolutionError')) {
        displayMessage = 'Não foi possível conectar à API';
    } else if (displayMessage.includes('Erro: 404')) {
        displayMessage = 'API não encontrada';
    } else if (displayMessage.includes('Timeout')) {
        displayMessage = 'Tempo esgotado ao conectar';
    }
    
    if (balanceElement) {
        balanceElement.textContent = '--';
        balanceElement.classList.add('error-text');
    }
    
    if (statusElement) {
        statusElement.textContent = displayMessage;
        statusElement.classList.add('error-status');
    }
}

/**
 * Atualiza a interface com os dados recebidos
 */
function updateUI() {
    // Atualizar estatísticas
    updateStats();
    
    // Atualizar lista de processos
    updateProcessList();
    
    // Atualizar timestamp
    updateTimestamp();
}

/**
 * Atualiza as estatísticas na interface
 */
function updateStats() {
    if (!state.stats) return;
    
    DOM.totalProcesses.textContent = state.stats.total || 0;
    DOM.onlineProcesses.textContent = state.stats.online || 0;
    DOM.errorProcesses.textContent = state.stats.errored || 0;
    DOM.stoppedProcesses.textContent = state.stats.stopped || 0;
}

/**
 * Atualiza a lista de processos na interface
 */
function updateProcessList() {
    // Limpar conteúdo atual
    DOM.processesContainer.innerHTML = '';
    
    // Verificar se há processos
    if (!state.processes || state.processes.length === 0) {
        DOM.processesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-ghost fa-3x mb-3 text-muted"></i>
                <p>Nenhum processo PM2 encontrado</p>
                <button class="btn btn-primary mt-3" onclick="refreshData()">
                    <i class="fas fa-sync-alt me-1"></i> Tentar Novamente
                </button>
            </div>
        `;
        return;
    }
    
    // Renderizar cada processo
    state.processes.forEach(process => {
        DOM.processesContainer.appendChild(createProcessCard(process));
    });
}

/**
 * Cria um card de processo
 */
function createProcessCard(process) {
    // Extrair informações relevantes
    const name = process.name;
    const id = process.pm_id;
    const status = process.pm2_env?.status || 'unknown';
    const memory = formatMemory(process.monit?.memory);
    const cpu = formatCpu(process.monit?.cpu);
    const uptime = formatUptime(process.pm2_env?.pm_uptime);
    const restart = process.pm2_env?.restart_time || 0;
    const mode = process.pm2_env?.exec_mode || 'N/A';
    
    // Obter informações de porta (adicionadas pelo backend)
    const portDev = process.port_info?.dev || 'N/A';
    const portProd = process.port_info?.prod || 'N/A';
    
    // Criar elemento
    const cardDiv = document.createElement('div');
    cardDiv.className = 'col-lg-4 col-md-6 mb-4';
    
    cardDiv.innerHTML = `
        <div class="process-card">
            <div class="d-flex justify-content-between align-items-start">
                <div class="process-name">${name}</div>
                <span class="badge badge-${getStatusClass(status)}">${getStatusText(status)}</span>
            </div>
            <div class="small">ID: ${id}</div>
            
            <div class="process-details">
                <div class="detail-row">
                    <span class="detail-label">Memória:</span>
                    <span class="detail-value">${memory}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">CPU:</span>
                    <span class="detail-value">${cpu}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Tempo Ativo:</span>
                    <span class="detail-value">${uptime}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Reinícios:</span>
                    <span class="detail-value">${restart}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Modo:</span>
                    <span class="detail-value">${mode}</span>
                </div>
                <div class="detail-row port-info">
                    <span class="detail-label">Porta (Dev):</span>
                    <span class="detail-value">${formatPort(portDev)}</span>
                </div>
                <div class="detail-row port-info">
                    <span class="detail-label">Porta (Prod):</span>
                    <span class="detail-value">${formatPort(portProd)}</span>
                </div>
            </div>
        </div>
    `;
    
    return cardDiv;
}

/**
 * Atualiza o timestamp de última atualização
 */
function updateTimestamp() {
    if (!state.lastUpdate) return;
    
    DOM.lastUpdated.textContent = formatDateTime(state.lastUpdate);
}

/**
 * Exibe uma mensagem de erro
 */
function showError(message) {
    DOM.processesContainer.innerHTML = `
        <div class="col-12 text-center py-5">
            <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
            <p class="text-danger">${message}</p>
            <button class="btn btn-primary mt-3" onclick="refreshData()">
                <i class="fas fa-sync-alt me-1"></i> Tentar Novamente
            </button>
        </div>
    `;
}

// Funções Auxiliares

/**
 * Formata o uso de memória para formato legível
 */
function formatMemory(bytes) {
    if (!bytes) return 'N/A';
    
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return Math.round(bytes / (1024 * 1024) * 10) / 10 + ' MB';
    return Math.round(bytes / (1024 * 1024 * 1024) * 10) / 10 + ' GB';
}

/**
 * Formata o uso de CPU para formato legível
 */
function formatCpu(cpu) {
    if (cpu === undefined || cpu === null) return 'N/A';
    return cpu.toFixed(1) + '%';
}

/**
 * Formata o tempo ativo para formato legível
 */
function formatUptime(timestamp) {
    if (!timestamp) return 'N/A';
    
    const now = Date.now();
    const uptime = now - timestamp;
    
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

/**
 * Formata data e hora
 */
function formatDateTime(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
}

/**
 * Obtém a classe CSS com base no status
 */
function getStatusClass(status) {
    switch (status) {
        case 'online':
            return 'online';
        case 'stopping':
        case 'stopped':
            return 'stopped';
        case 'errored':
            return 'errored';
        default:
            return 'secondary';
    }
}

/**
 * Obtém o texto do status
 */
function getStatusText(status) {
    switch (status) {
        case 'online':
            return 'Online';
        case 'stopping':
            return 'Parando';
        case 'stopped':
            return 'Parado';
        case 'errored':
            return 'Erro';
        case 'launching':
            return 'Iniciando';
        default:
            return status;
    }
}

/**
 * Formata a exibição da porta
 */
function formatPort(port) {
    if (!port || port === 'N/A') return 'N/A';
    
    // Adiciona um ícone de link para acesso rápido
    const url = `http://${window.location.hostname}:${port}`;
    return `${port} <a href="${url}" target="_blank" title="Abrir serviço na porta ${port}" class="port-link">
                <i class="fas fa-external-link-alt"></i>
            </a>`;
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
