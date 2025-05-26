// Tab switching functionality
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    
    // Update active button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load data for the selected tab
    loadTabData(tabName);
}

// Load data for each tab
async function loadTabData(tabName) {
    switch(tabName) {
        case 'dashboard':
            await loadDashboardData();
            break;
        case 'filmes':
            await loadMovies();
            break;
        case 'clientes':
            await loadCustomers();
            break;
        case 'comentarios':
            await loadComments();
            break;
        case 'relatorios':
            await loadReports();
            break;
    }
}

// Dashboard functions
async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        
        // Update KPI cards
        document.getElementById('totalCustomers').textContent = data.totalCustomers;
        document.getElementById('availableMovies').textContent = data.availableMovies;
        document.getElementById('activeRentals').textContent = data.activeRentals;
        document.getElementById('monthlyRevenue').textContent = `R$ ${data.monthlyRevenue.toFixed(2)}`;
        
        // Update percentage changes
        document.querySelectorAll('.change').forEach((element, index) => {
            const changes = [
                data.customersChange,
                data.moviesChange,
                data.rentalsChange,
                data.revenueChange
            ];
            const change = changes[index];
            const arrow = change >= 0 ? '↗' : '↘';
            element.textContent = `${arrow} ${Math.abs(change).toFixed(1)}% vs mês anterior`;
            element.style.color = change >= 0 ? '#4caf50' : '#f44336';
        });
        
        // Update charts
        updateRentalsChart(data.rentalsByCategory);
        updateTopMoviesChart(data.topMovies);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Erro ao carregar dados do dashboard');
    }
}

// Movies functions
async function loadMovies() {
    try {
        const response = await fetch('/api/movies');
        const movies = await response.json();
        displayMovies(movies);
    } catch (error) {
        console.error('Error loading movies:', error);
        showError('Erro ao carregar filmes');
    }
}

async function searchMovies() {
    const searchTerm = document.getElementById('movieSearch').value;
    const genre = document.getElementById('genreFilter').value;
    const availability = document.getElementById('availabilityFilter').value;
    
    try {
        const queryParams = new URLSearchParams({
            search: searchTerm,
            genre,
            available: availability === 'available'
        });
        
        const response = await fetch(`/api/movies?${queryParams}`);
        const movies = await response.json();
        displayMovies(movies);
    } catch (error) {
        console.error('Error searching movies:', error);
        showError('Erro ao buscar filmes');
    }
}

function displayMovies(movies) {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <h3>${movie.titulo}</h3>
            <p>Status: ${movie.disponivel ? 'Disponível' : 'Alugado'}</p>
            <p>Total de Locações: ${movie.total_locacoes}</p>
            <p>Valor Médio: R$ ${movie.valor_medio_locacao.toFixed(2)}</p>
            <button onclick="rentMovie(${movie.id})" ${!movie.disponivel ? 'disabled' : ''}>
                ${movie.disponivel ? 'Alugar' : 'Indisponível'}
            </button>
        </div>
    `).join('');
}

// Customers functions
async function loadCustomers() {
    try {
        const response = await fetch('/api/customers');
        const customers = await response.json();
        displayCustomers(customers);
    } catch (error) {
        console.error('Error loading customers:', error);
        showError('Erro ao carregar clientes');
    }
}

function displayCustomers(customers) {
    const tbody = document.getElementById('customersTable');
    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.nome}</td>
            <td>${customer.email}</td>
            <td>${customer.telefone}</td>
            <td>${customer.status}</td>
            <td>
                <button onclick="editCustomer(${customer.id})">Editar</button>
                <button onclick="viewCustomerHistory(${customer.id})">Histórico</button>
            </td>
        </tr>
    `).join('');
}

// Comments functions
async function loadComments() {
    try {
        const [commentsResponse, moviesResponse] = await Promise.all([
            fetch('/api/comments'),
            fetch('/api/movies')
        ]);
        
        const comments = await commentsResponse.json();
        const movies = await moviesResponse.json();
        
        displayComments(comments);
        populateMovieSelect(movies);
    } catch (error) {
        console.error('Error loading comments:', error);
        showError('Erro ao carregar comentários');
    }
}

function displayComments(comments) {
    const container = document.getElementById('commentsContainer');
    container.innerHTML = comments.map(comment => `
        <div class="comment-card">
            <h4>${comment.movie_title}</h4>
            <div class="rating">${'★'.repeat(comment.rating)}${'☆'.repeat(5-comment.rating)}</div>
            <p>${comment.text}</p>
            <small>Por: ${comment.customer_name} em ${new Date(comment.created_at).toLocaleDateString()}</small>
        </div>
    `).join('');
}

// Reports functions
async function loadReports() {
    const period = document.getElementById('reportPeriod').value;
    const type = document.getElementById('reportType').value;
    
    try {
        const response = await fetch(`/api/analytics/${type}?period=${period}`);
        const data = await response.json();
        
        updateReportChart(data);
        updateReportTable(data);
    } catch (error) {
        console.error('Error loading reports:', error);
        showError('Erro ao carregar relatórios');
    }
}

// Utility functions
function showError(message) {
    // Implement error notification
    alert(message);
}

// Chart initialization
function initCharts() {
    // Initialize Chart.js charts
    const rentalsCtx = document.getElementById('rentalsChart').getContext('2d');
    const topMoviesCtx = document.getElementById('topMoviesChart').getContext('2d');
    const reportCtx = document.getElementById('reportChart').getContext('2d');
    
    // Create chart instances
    window.rentalsChart = new Chart(rentalsCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Locações por Categoria',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.5)'
            }]
        }
    });
    
    window.topMoviesChart = new Chart(topMoviesCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ]
            }]
        }
    });
    
    window.reportChart = new Chart(reportCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Dados do Relatório',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }]
        }
    });
}

// Chart update functions
function updateRentalsChart(data) {
    const chart = window.rentalsChart;
    chart.data.labels = data.map(item => item.category);
    chart.data.datasets[0].data = data.map(item => item.count);
    chart.update();
}

function updateTopMoviesChart(data) {
    const chart = window.topMoviesChart;
    chart.data.labels = data.map(item => item.title);
    chart.data.datasets[0].data = data.map(item => item.rentals);
    chart.update();
}

function updateReportChart(data) {
    const chart = window.reportChart;
    chart.data.labels = data.labels;
    chart.data.datasets[0].data = data.values;
    chart.data.datasets[0].label = data.title;
    chart.update();
}

function updateReportTable(data) {
    const tbody = document.getElementById('reportTableBody');
    tbody.innerHTML = data.rows.map(row => `
        <tr>
            <td>${row.period}</td>
            <td>${row.total_rentals}</td>
            <td>R$ ${row.revenue.toFixed(2)}</td>
            <td>${row.new_customers}</td>
        </tr>
    `).join('');
}

// Customer management functions
async function editCustomer(id) {
    try {
        const response = await fetch(`/api/customers/${id}`);
        const customer = await response.json();
        
        // Implement customer edit modal/form
        // This would typically open a modal with a form
        console.log('Edit customer:', customer);
    } catch (error) {
        console.error('Error loading customer:', error);
        showError('Erro ao carregar dados do cliente');
    }
}

async function viewCustomerHistory(id) {
    try {
        const response = await fetch(`/api/customers/${id}/history`);
        const history = await response.json();
        
        // Implement customer history view
        // This would typically show a modal with rental history
        console.log('Customer history:', history);
    } catch (error) {
        console.error('Error loading customer history:', error);
        showError('Erro ao carregar histórico do cliente');
    }
}

// Movie rental function
async function rentMovie(id) {
    try {
        const response = await fetch(`/api/rentals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                movie_id: id,
                // Add other necessary rental data
            })
        });
        
        if (response.ok) {
            // Refresh the movies list
            await loadMovies();
            showSuccess('Filme alugado com sucesso!');
        } else {
            const error = await response.json();
            showError(error.message || 'Erro ao alugar filme');
        }
    } catch (error) {
        console.error('Error renting movie:', error);
        showError('Erro ao alugar filme');
    }
}

// Success notification
function showSuccess(message) {
    // Implement success notification
    alert(message);
}

// Movie details function
async function showMovieDetails(id) {
    try {
        const response = await fetch(`/api/movies/${id}`);
        const movie = await response.json();
        
        // Create modal content
        const modalContent = `
            <div class="movie-details">
                <img src="${movie.poster}" alt="${movie.title}" class="movie-poster-large">
                <div class="movie-info-detailed">
                    <h2>${movie.title}</h2>
                    <p class="movie-year">${movie.year}</p>
                    <p class="movie-genre">${movie.genre}</p>
                    <p class="movie-description">${movie.description}</p>
                    <div class="movie-stats">
                        <div class="stat">
                            <span class="label">Disponível:</span>
                            <span class="value">${movie.available ? 'Sim' : 'Não'}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Total de Locações:</span>
                            <span class="value">${movie.total_rentals}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Avaliação Média:</span>
                            <span class="value">${movie.average_rating.toFixed(1)}/5.0</span>
                        </div>
                    </div>
                    ${movie.available ? 
                        `<button class="btn btn-primary" onclick="rentMovie(${movie.id})">Alugar</button>` :
                        `<button class="btn btn-secondary" disabled>Indisponível</button>`
                    }
                </div>
            </div>
        `;
        
        // Show modal
        showModal('Detalhes do Filme', modalContent);
    } catch (error) {
        console.error('Error loading movie details:', error);
        showError('Erro ao carregar detalhes do filme');
    }
}

// Modal functions
function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

function closeModal(button) {
    const modal = button.closest('.modal');
    modal.remove();
}

// Customer history modal
async function showCustomerHistoryModal(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}/history`);
        const history = await response.json();
        
        const modalContent = `
            <div class="customer-history">
                <h4>Histórico de Locações</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Filme</th>
                            <th>Status</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${history.rentals.map(rental => `
                            <tr>
                                <td>${new Date(rental.date).toLocaleDateString()}</td>
                                <td>${rental.movie_title}</td>
                                <td>${rental.status}</td>
                                <td>R$ ${rental.value.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="customer-stats">
                    <div class="stat">
                        <span class="label">Total de Locações:</span>
                        <span class="value">${history.total_rentals}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Valor Total Gasto:</span>
                        <span class="value">R$ ${history.total_spent.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
        
        showModal('Histórico do Cliente', modalContent);
    } catch (error) {
        console.error('Error loading customer history:', error);
        showError('Erro ao carregar histórico do cliente');
    }
}

// Customer edit modal
async function showCustomerEditModal(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`);
        const customer = await response.json();
        
        const modalContent = `
            <div class="customer-edit-form">
                <form id="editCustomerForm" onsubmit="updateCustomer(event, ${customerId})">
                    <div class="form-group">
                        <label>Nome:</label>
                        <input type="text" name="name" value="${customer.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" name="email" value="${customer.email}" required>
                    </div>
                    <div class="form-group">
                        <label>Telefone:</label>
                        <input type="tel" name="phone" value="${customer.phone}" required>
                    </div>
                    <div class="form-group">
                        <label>Status:</label>
                        <select name="status">
                            <option value="active" ${customer.status === 'active' ? 'selected' : ''}>Ativo</option>
                            <option value="inactive" ${customer.status === 'inactive' ? 'selected' : ''}>Inativo</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                </form>
            </div>
        `;
        
        showModal('Editar Cliente', modalContent);
    } catch (error) {
        console.error('Error loading customer data:', error);
        showError('Erro ao carregar dados do cliente');
    }
}

// Update customer function
async function updateCustomer(event, customerId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    try {
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });
        
        if (response.ok) {
            closeModal(form.closest('.modal').querySelector('.close-btn'));
            await loadCustomers(); // Refresh customer list
            showSuccess('Cliente atualizado com sucesso!');
        } else {
            const error = await response.json();
            showError(error.message || 'Erro ao atualizar cliente');
        }
    } catch (error) {
        console.error('Error updating customer:', error);
        showError('Erro ao atualizar cliente');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    loadTabData('dashboard');
}); 