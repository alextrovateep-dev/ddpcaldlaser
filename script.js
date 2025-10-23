// Dados das máquinas de solda (armazenados no localStorage)
let machines = JSON.parse(localStorage.getItem('caldlaser-machines')) || [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeForm();
    renderMachines();
    
    // Define resumo (documento explicativo) como seção ativa por padrão
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.section');
    
    menuItems.forEach(item => item.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));
    
    document.querySelector('a[href="#resumo"]').classList.add('active');
    document.getElementById('resumo').classList.add('active');
});

// Navegação do menu lateral
function initializeNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.section');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active de todos os itens
            menuItems.forEach(mi => mi.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Adiciona active ao item clicado
            this.classList.add('active');
            
            // Mostra a seção correspondente
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Inicialização do formulário de dados das máquinas de solda
function initializeForm() {
    const form = document.getElementById('soldagem-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const machineData = {
            id: Date.now(),
            tipo: formData.get('tipo-solda'),
            marca: formData.get('marca'),
            modelo: formData.get('modelo'),
            numeroSerie: formData.get('numero-serie'),
            consumoParado: parseFloat(formData.get('consumo-parado')) || 0,
            consumoSoldando: parseFloat(formData.get('consumo-soldando')) || 0,
            observacoes: formData.get('observacoes') || '',
            dataCadastro: new Date().toLocaleDateString('pt-BR')
        };
        
        // Validação
        if (!machineData.tipo || !machineData.marca || !machineData.modelo || !machineData.numeroSerie) {
            alert('Por favor, preencha todos os campos obrigatórios para os dados da máquina de solda.');
            return;
        }
        
        // Verifica se número de série já existe
        const serieExists = machines.some(machine => machine.numeroSerie === machineData.numeroSerie);
        if (serieExists) {
            alert('Já existe uma máquina cadastrada com este número de série.');
            return;
        }
        
        // Adiciona a máquina
        machines.push(machineData);
        saveMachines();
        renderMachines();
        
        // Limpa o formulário
        form.reset();
        
        // Mostra mensagem de sucesso
        showNotification('Máquina cadastrada com sucesso!', 'success');
    });
}

// Renderiza a lista de máquinas
function renderMachines() {
    const container = document.getElementById('machines-container');
    
    if (machines.length === 0) {
        container.innerHTML = '<p class="no-data">Nenhuma máquina cadastrada ainda.</p>';
        return;
    }
    
    container.innerHTML = machines.map(machine => `
        <div class="machine-card slide-in">
            <div class="machine-header">
                <div class="machine-title">${machine.marca} ${machine.modelo}</div>
                <div class="machine-type">${machine.tipo}</div>
            </div>
            <div class="machine-details">
                <div class="detail-item">
                    <div class="detail-label">Número de Série</div>
                    <div class="detail-value">${machine.numeroSerie}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Marca</div>
                    <div class="detail-value">${machine.marca}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Modelo</div>
                    <div class="detail-value">${machine.modelo}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Consumo Parado (A)</div>
                    <div class="detail-value">${machine.consumoParado} A</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Consumo Soldando (A)</div>
                    <div class="detail-value">${machine.consumoSoldando} A</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Data Cadastro</div>
                    <div class="detail-value">${machine.dataCadastro}</div>
                </div>
            </div>
            ${machine.observacoes ? `
                <div class="detail-item">
                    <div class="detail-label">Observações</div>
                    <div class="detail-value">${machine.observacoes}</div>
                </div>
            ` : ''}
            <div class="machine-actions">
                <button class="btn btn-danger" onclick="deleteMachine(${machine.id})">
                    Excluir
                </button>
            </div>
        </div>
    `).join('');
}

// Exclui uma máquina
function deleteMachine(id) {
    if (confirm('Tem certeza que deseja excluir esta máquina?')) {
        machines = machines.filter(machine => machine.id !== id);
        saveMachines();
        renderMachines();
        showNotification('Máquina excluída com sucesso!', 'success');
    }
}

// Salva as máquinas no localStorage
function saveMachines() {
    localStorage.setItem('caldlaser-machines', JSON.stringify(machines));
}

// Mostra notificação
function showNotification(message, type = 'info') {
    // Remove notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
        </div>
    `;
    
    // Adiciona estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Adiciona estilos para animação de saída
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-content {
        display: block;
    }
`;
document.head.appendChild(style);

// Função para exportar dados (opcional)
function exportData() {
    if (machines.length === 0) {
        alert('Nenhuma máquina cadastrada para exportar.');
        return;
    }
    
    const data = {
        empresa: 'Caldlaser',
        sistema: 'TeepMES',
        versao: '1.1',
        dataExportacao: new Date().toLocaleString('pt-BR'),
        maquinas: machines
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `caldlaser-maquinas-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Adiciona botões de exportar ao final da seção de soldagem
document.addEventListener('DOMContentLoaded', function() {
    const soldagemSection = document.getElementById('soldagem');
    const machinesList = soldagemSection.querySelector('.machines-list');
    
    const exportButtons = document.createElement('div');
    exportButtons.className = 'export-buttons';
    exportButtons.style.cssText = `
        margin-top: 20px;
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
    `;
    
    exportButtons.innerHTML = `
        <button class="btn btn-primary" onclick="generatePDF()">
            Gerar PDF
        </button>
        <button class="btn btn-primary" onclick="sendEmail()">
            Enviar por Email
        </button>
        <button class="btn btn-secondary" onclick="exportData()">
            Exportar Dados
        </button>
    `;
    
    machinesList.appendChild(exportButtons);
    
    // Inicializa resumo de aprovação
    updateApprovalSummary();
});

// Função para calcular estatísticas
function calculateStats() {
    const stats = {
        total: machines.length,
        tig: machines.filter(m => m.tipo === 'TIG').length,
        mig: machines.filter(m => m.tipo === 'MIG').length,
        totalConsumoParado: machines.reduce((sum, m) => sum + m.consumoParado, 0),
        totalConsumoSoldando: machines.reduce((sum, m) => sum + m.consumoSoldando, 0),
        marcas: [...new Set(machines.map(m => m.marca))].length
    };
    
    return stats;
}

// Adiciona painel de estatísticas
document.addEventListener('DOMContentLoaded', function() {
    const soldagemSection = document.getElementById('soldagem');
    const machinesList = soldagemSection.querySelector('.machines-list');
    
    const statsPanel = document.createElement('div');
    statsPanel.className = 'stats-panel';
    statsPanel.style.cssText = `
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        border-left: 4px solid #3498db;
    `;
    
    function updateStats() {
        const stats = calculateStats();
        statsPanel.innerHTML = `
            <h4>Estatísticas das Máquinas</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 15px;">
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: #507A69;">${stats.total}</div>
                    <div style="color: #7f8c8d;">Total de Máquinas</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: #e74c3c;">${stats.tig}</div>
                    <div style="color: #7f8c8d;">Máquinas TIG</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: #f39c12;">${stats.mig}</div>
                    <div style="color: #7f8c8d;">Máquinas MIG</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: #507A69;">${stats.totalConsumoParado.toFixed(1)}A</div>
                    <div style="color: #7f8c8d;">Consumo Parado</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: #3d5f4e;">${stats.totalConsumoSoldando.toFixed(1)}A</div>
                    <div style="color: #7f8c8d;">Consumo Soldando</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2rem; font-weight: bold; color: #9b59b6;">${stats.marcas}</div>
                    <div style="color: #7f8c8d;">Marcas Diferentes</div>
                </div>
            </div>
        `;
    }
    
    // Atualiza estatísticas quando as máquinas mudam
    const originalRenderMachines = renderMachines;
    renderMachines = function() {
        originalRenderMachines();
        updateStats();
        updateApprovalSummary();
    };
    
    machinesList.insertBefore(statsPanel, machinesList.firstChild);
    updateStats();
});

// Função para gerar PDF
function generatePDF() {
    if (machines.length === 0) {
        alert('Nenhuma máquina cadastrada para gerar PDF.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text('DDP - Caldlaser | TeepMES', 20, 30);
    doc.setFontSize(12);
    doc.text('Definição de Processo e Infraestrutura', 20, 40);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 50);
    
    // Tabela de máquinas
    let y = 70;
    doc.setFontSize(14);
    doc.text('Máquinas de Soldagem Cadastradas', 20, y);
    y += 10;
    
    // Cabeçalho da tabela
    doc.setFontSize(10);
    doc.text('Tipo', 20, y);
    doc.text('Marca', 50, y);
    doc.text('Modelo', 80, y);
    doc.text('Nº Série', 120, y);
    doc.text('Cons. Parado (A)', 150, y);
    doc.text('Cons. Soldando (A)', 180, y);
    y += 5;
    
    // Linha separadora
    doc.line(20, y, 190, y);
    y += 10;
    
    // Dados das máquinas
    machines.forEach(machine => {
        if (y > 250) {
            doc.addPage();
            y = 30;
        }
        
        doc.text(machine.tipo, 20, y);
        doc.text(machine.marca, 50, y);
        doc.text(machine.modelo, 80, y);
        doc.text(machine.numeroSerie, 120, y);
        doc.text(machine.consumoParado.toString(), 150, y);
        doc.text(machine.consumoSoldando.toString(), 180, y);
        y += 8;
    });
    
    // Estatísticas
    const stats = calculateStats();
    y += 10;
    doc.setFontSize(12);
    doc.text('Estatísticas:', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Total de Máquinas: ${stats.total}`, 20, y);
    y += 6;
    doc.text(`Máquinas TIG: ${stats.tig}`, 20, y);
    y += 6;
    doc.text(`Máquinas MIG: ${stats.mig}`, 20, y);
    y += 6;
    doc.text(`Consumo Total Parado: ${stats.totalConsumoParado.toFixed(1)}A`, 20, y);
    y += 6;
    doc.text(`Consumo Total Soldando: ${stats.totalConsumoSoldando.toFixed(1)}A`, 20, y);
    
    // Salva o PDF
    doc.save(`caldlaser-maquinas-${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification('PDF gerado com sucesso!', 'success');
}

// Função para enviar por email
function sendEmail() {
    if (machines.length === 0) {
        alert('Nenhuma máquina cadastrada para enviar por email.');
        return;
    }
    
    const stats = calculateStats();
    const emailData = {
        empresa: 'Caldlaser',
        sistema: 'TeepMES',
        versao: '1.1',
        data: new Date().toLocaleString('pt-BR'),
        totalMaquinas: stats.total,
        maquinasTIG: stats.tig,
        maquinasMIG: stats.mig,
        consumoParado: stats.totalConsumoParado.toFixed(1),
        consumoSoldando: stats.totalConsumoSoldando.toFixed(1),
        marcas: stats.marcas,
        maquinas: machines
    };
    
    // Cria formulário para envio via Formspree
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formspree.io/f/mblybqqb';
    form.target = '_blank';
    
    // Adiciona campos
    const fields = {
        'Empresa': emailData.empresa,
        'Sistema': emailData.sistema,
        'Versão': emailData.versao,
        'Data': emailData.data,
        'Total de Máquinas': emailData.totalMaquinas,
        'Máquinas TIG': emailData.maquinasTIG,
        'Máquinas MIG': emailData.maquinasMIG,
        'Consumo Parado (A)': emailData.consumoParado,
        'Consumo Soldando (A)': emailData.consumoSoldando,
        'Marcas Diferentes': emailData.marcas,
        'Dados das Máquinas': JSON.stringify(emailData.maquinas, null, 2)
    };
    
    Object.keys(fields).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    showNotification('Email enviado com sucesso!', 'success');
}

// Função para atualizar resumo de aprovação
function updateApprovalSummary() {
    const summaryContainer = document.getElementById('approval-summary');
    
    if (machines.length === 0) {
        summaryContainer.innerHTML = '<p class="no-data">Nenhuma máquina cadastrada para aprovação.</p>';
        return;
    }
    
    const stats = calculateStats();
    summaryContainer.innerHTML = `
        <div class="approval-summary">
            <h4>Resumo para Aprovação</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 15px 0;">
                <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #507A69;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #507A69;">${stats.total}</div>
                    <div style="color: #7f8c8d;">Total de Máquinas</div>
                </div>
                <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #e74c3c;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #e74c3c;">${stats.tig}</div>
                    <div style="color: #7f8c8d;">Máquinas TIG</div>
                </div>
                <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #f39c12;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #f39c12;">${stats.mig}</div>
                    <div style="color: #7f8c8d;">Máquinas MIG</div>
                </div>
                <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #507A69;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #507A69;">${stats.totalConsumoParado.toFixed(1)}A</div>
                    <div style="color: #7f8c8d;">Consumo Parado</div>
                </div>
                <div style="text-align: center; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #3d5f4e;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #3d5f4e;">${stats.totalConsumoSoldando.toFixed(1)}A</div>
                    <div style="color: #7f8c8d;">Consumo Soldando</div>
                </div>
            </div>
        </div>
    `;
}

// Função para aprovar processo
function approveProcess() {
    if (machines.length === 0) {
        alert('Nenhuma máquina cadastrada para aprovar.');
        return;
    }
    
    // Abre o modal de aprovação
    document.getElementById('approval-modal').style.display = 'block';
}

// Função para fechar modal de aprovação
function closeApprovalModal() {
    document.getElementById('approval-modal').style.display = 'none';
    // Limpa o formulário
    document.getElementById('approval-form').reset();
}

// Função para confirmar aprovação
function confirmApproval() {
    const form = document.getElementById('approval-form');
    const formData = new FormData(form);
    
    const aprovadorNome = formData.get('aprovador-nome');
    const aprovadorDepartamento = formData.get('aprovador-departamento');
    const aprovadorEmail = formData.get('aprovador-email');
    const observacoes = formData.get('observacoes-aprovacao');
    
    if (!aprovadorNome || !aprovadorDepartamento || !aprovadorEmail) {
        alert('Por favor, preencha todos os campos obrigatórios para os dados da máquina de solda.');
        return;
    }
    
    // Dados de aprovação
    const approvalData = {
        aprovado: true,
        dataAprovacao: new Date().toLocaleString('pt-BR'),
        aprovadoPor: aprovadorNome,
        departamento: aprovadorDepartamento,
        email: aprovadorEmail,
        maquinas: machines.length,
        observacoes: observacoes || 'Processo aprovado pelo cliente'
    };
    
    // Salva dados de aprovação
    localStorage.setItem('caldlaser-approval', JSON.stringify(approvalData));
    
    // Fecha o modal
    closeApprovalModal();
    
    // Envia email com dados de aprovação
    sendApprovalEmail(approvalData);
    
    // Atualiza interface
    updateApprovalInterface(approvalData);
    
    showNotification('Processo aprovado e email enviado com sucesso!', 'success');
}

// Função para enviar email de aprovação
function sendApprovalEmail(approvalData) {
    const stats = calculateStats();
    const emailData = {
        'Assunto': 'DDP Aprovado - Caldlaser | TeepMES',
        'Empresa': 'Caldlaser',
        'Sistema': 'TeepMES',
        'Versão': '1.1',
        'Data Aprovação': approvalData.dataAprovacao,
        'Aprovado por': approvalData.aprovadoPor,
        'Departamento': approvalData.departamento,
        'Email Aprovador': approvalData.email,
        'Total de Máquinas': stats.total,
        'Máquinas TIG': stats.tig,
        'Máquinas MIG': stats.mig,
        'Consumo Parado (A)': stats.totalConsumoParado.toFixed(1),
        'Consumo Soldando (A)': stats.totalConsumoSoldando.toFixed(1),
        'Marcas Diferentes': stats.marcas,
        'Observações': approvalData.observacoes,
        'Dados das Máquinas': JSON.stringify(machines, null, 2)
    };
    
    // Cria formulário para envio via Formspree
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formspree.io/f/mblybqqb';
    form.target = '_blank';
    
    // Adiciona campos
    Object.keys(emailData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = emailData[key];
        form.appendChild(input);
    });
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

// Função para atualizar interface após aprovação
function updateApprovalInterface(approvalData) {
    const approvalSection = document.getElementById('aprovar-processo');
    const approvalCard = approvalSection.querySelector('.card');
    approvalCard.innerHTML = `
        <h3>Processo Aprovado</h3>
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h4 style="color: #155724; margin-bottom: 15px;">✓ Processo Aprovado</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                <p style="color: #155724; margin: 5px 0;"><strong>Data:</strong> ${approvalData.dataAprovacao}</p>
                <p style="color: #155724; margin: 5px 0;"><strong>Aprovado por:</strong> ${approvalData.aprovadoPor}</p>
                <p style="color: #155724; margin: 5px 0;"><strong>Departamento:</strong> ${approvalData.departamento}</p>
                <p style="color: #155724; margin: 5px 0;"><strong>Email:</strong> ${approvalData.email}</p>
                <p style="color: #155724; margin: 5px 0;"><strong>Máquinas:</strong> ${approvalData.maquinas}</p>
            </div>
            ${approvalData.observacoes ? `
                <p style="color: #155724; margin: 10px 0 0 0;"><strong>Observações:</strong> ${approvalData.observacoes}</p>
            ` : ''}
        </div>
        <div class="approval-actions">
            <button class="btn btn-primary" onclick="generatePDF()">
                Gerar PDF Final
            </button>
            <button class="btn btn-primary" onclick="sendEmail()">
                Enviar por Email
            </button>
        </div>
    `;
}

// Fecha modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById('approval-modal');
    if (event.target === modal) {
        closeApprovalModal();
    }
}
