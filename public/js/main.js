// Variáveis globais para armazenar dados
let moviesData = {
    categories: ['Ação', 'Comédia', 'Drama', 'Ficção Científica', 'Romance'],
    monthlyRentals: [120, 150, 90, 110, 130, 140],
    topMovies: [
        { title: 'Interestelar', rentals: 45, rating: 4.8 },
        { title: 'O Poderoso Chefão', rentals: 38, rating: 4.9 },
        { title: 'Matrix', rentals: 35, rating: 4.7 },
        { title: 'Pulp Fiction', rentals: 32, rating: 4.8 }
    ]
};

let charts = {};

// Função para alternar entre abas
function switchTab(tabName) {
    // Ocultar todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover classe active de todos os botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar aba selecionada
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Inicializar gráficos se necessário
    setTimeout(() => {
        if (tabName === 'dashboard') {
            initDashboardCharts();
        } else if (tabName === 'filmes') {
            loadMovies();
        } else if (tabName === 'clientes') {
            loadCustomers();
        } else if (tabName === 'comentarios') {
            loadComments();
        } else if (tabName === 'relatorios') {
            initReportChart();
        }
    }, 100);
}

// Inicializar gráficos do dashboard
function initDashboardCharts() {
    // Gráfico de locações por categoria
    const rentalsCtx = document.getElementById('rentalsChart');
    if (rentalsCtx && !charts.rentalsChart) {
        charts.rentalsChart = new Chart(rentalsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Total de Locações',
                    data: moviesData.monthlyRentals,
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Gráfico de top filmes
    const topMoviesCtx = document.getElementById('topMoviesChart');
    if (topMoviesCtx && !charts.topMoviesChart) {
        charts.topMoviesChart = new Chart(topMoviesCtx, {
            type: 'bar',
            data: {
                labels: moviesData.topMovies.map(movie => movie.title),
                datasets: [{
                    label: 'Locações',
                    data: moviesData.topMovies.map(movie => movie.rentals),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Carregar filmes
function loadMovies() {
    const moviesGrid = document.getElementById('moviesGrid');
    if (!moviesGrid) return;
    
    // Simular dados de filmes
    const movies = [
        {
            title: 'Interestelar',
            genre: 'Ficção Científica',
            poster: 'https://via.placeholder.com/300x450',
            available: true
        },
        {
            title: 'O Poderoso Chefão',
            genre: 'Drama',
            poster: 'https://via.placeholder.com/300x450',
            available: false
        }
    ];
    
    moviesGrid.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <img src="${movie.poster}" alt="${movie.title}" class="movie-poster">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-genre">${movie.genre}</p>
                <div class="movie-actions">
                    <button class="btn" onclick="rentMovie('${movie.title}')" ${!movie.available ? 'disabled' : ''}>
                        ${movie.available ? 'Alugar' : 'Indisponível'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Carregar clientes
function loadCustomers() {
    const customersTable = document.getElementById('customersTable');
    if (!customersTable) return;
    
    // Simular dados de clientes
    const customers = [
        {
            name: 'João Silva',
            email: 'joao@email.com',
            phone: '(11) 99999-9999',
            status: 'Ativo'
        },
        {
            name: 'Maria Santos',
            email: 'maria@email.com',
            phone: '(11) 98888-8888',
            status: 'Ativo'
        }
    ];
    
    customersTable.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.status}</td>
            <td>
                <button class="btn" onclick="editCustomer('${customer.email}')">Editar</button>
                <button class="btn" onclick="viewHistory('${customer.email}')">Histórico</button>
            </td>
        </tr>
    `).join('');
}

// Carregar comentários
function loadComments() {
    const commentsContainer = document.getElementById('commentsContainer');
    if (!commentsContainer) return;
    
    // Simular dados de comentários
    const comments = [
        {
            movie: 'Interestelar',
            user: 'João Silva',
            rating: 5,
            comment: 'Excelente filme!',
            date: '2024-02-20'
        },
        {
            movie: 'O Poderoso Chefão',
            user: 'Maria Santos',
            rating: 4,
            comment: 'Muito bom!',
            date: '2024-02-19'
        }
    ];
    
    commentsContainer.innerHTML = comments.map(comment => `
        <div class="comment-card">
            <div class="comment-header">
                <strong>${comment.movie}</strong>
                <span>${comment.date}</span>
            </div>
            <div class="comment-text">${comment.comment}</div>
            <div class="comment-footer">
                <span>${comment.user}</span>
                <div class="rating-stars">
                    ${'★'.repeat(comment.rating)}${'☆'.repeat(5 - comment.rating)}
                </div>
            </div>
        </div>
    `).join('');
}

// Inicializar gráfico de relatórios
function initReportChart() {
    const reportCtx = document.getElementById('reportChart');
    if (reportCtx && !charts.reportChart) {
        charts.reportChart = new Chart(reportCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'Locações',
                    data: [120, 150, 90, 110, 130, 140],
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Funções de busca
function searchMovies() {
    const searchTerm = document.getElementById('movieSearch').value.toLowerCase();
    const genreFilter = document.getElementById('genreFilter').value;
    const availabilityFilter = document.getElementById('availabilityFilter').value;
    
    // Implementar lógica de busca
    console.log('Buscando filmes:', { searchTerm, genreFilter, availabilityFilter });
    showNotification('Buscando filmes...');
}

function searchCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    // Implementar lógica de busca
    console.log('Buscando clientes:', searchTerm);
    showNotification('Buscando clientes...');
}

// Funções de ação
function rentMovie(movieTitle) {
    console.log('Alugando filme:', movieTitle);
    showNotification(`Filme "${movieTitle}" alugado com sucesso!`);
}

function editCustomer(email) {
    console.log('Editando cliente:', email);
    showNotification('Editando dados do cliente...');
}

function viewHistory(email) {
    console.log('Visualizando histórico:', email);
    showNotification('Carregando histórico...');
}

function submitComment() {
    const movie = document.getElementById('movieSelect').value;
    const comment = document.getElementById('commentText').value;
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    
    if (!movie || !comment || !rating) {
        showNotification('Por favor, preencha todos os campos', 'error');
        return;
    }
    
    console.log('Enviando comentário:', { movie, comment, rating });
    showNotification('Comentário enviado com sucesso!');
}

function generateReport() {
    const period = document.getElementById('reportPeriod').value;
    const type = document.getElementById('reportType').value;
    
    console.log('Gerando relatório:', { period, type });
    showNotification('Gerando relatório...');
}

// Função de notificação
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar gráficos do dashboard
    setTimeout(() => {
        initDashboardCharts();
    }, 500);
    
    // Simular atualização de KPIs em tempo real
    setInterval(() => {
        updateKPIs();
    }, 30000); // Atualizar a cada 30 segundos
});

// Atualizar KPIs dinamicamente
function updateKPIs() {
    const totalCustomers = document.getElementById('totalCustomers');
    const availableMovies = document.getElementById('availableMovies');
    const activeRentals = document.getElementById('activeRentals');
    const monthlyRevenue = document.getElementById('monthlyRevenue');
    
    // Simular pequenas variações nos valores
    const customersVariation = Math.floor((Math.random() - 0.5) * 10);
    const moviesVariation = Math.floor((Math.random() - 0.5) * 5);
    const rentalsVariation = Math.floor((Math.random() - 0.5) * 8);
    const revenueVariation = Math.floor((Math.random() - 0.5) * 1000);
    
    const currentCustomers = 150 + customersVariation;
    const currentMovies = 45 + moviesVariation;
    const currentRentals = 23 + rentalsVariation;
    const currentRevenue = 12450 + revenueVariation;
    
    if (totalCustomers) totalCustomers.textContent = currentCustomers;
    if (availableMovies) availableMovies.textContent = currentMovies;
    if (activeRentals) activeRentals.textContent = currentRentals;
    if (monthlyRevenue) monthlyRevenue.textContent = `R$ ${currentRevenue.toLocaleString('pt-BR')}`;
} 