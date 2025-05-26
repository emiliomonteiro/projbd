// Configuração da API
const API_URL = 'http://localhost:3000';

// Funções para comentários
async function carregarComentarios(filmeId) {
    try {
        const response = await fetch(`${API_URL}/comentarios/filme/${filmeId}`);
        const comentarios = await response.json();
        atualizarListaComentarios(comentarios);
    } catch (error) {
        console.error('Erro ao carregar comentários:', error);
    }
}

function atualizarListaComentarios(comentarios) {
    const container = document.querySelector('.comments-container');
    container.innerHTML = comentarios.map(comentario => `
        <div class="comment-card">
            <div class="comment-header">
                <span class="user-name">${comentario.cliente_id}</span>
                <span class="rating">${'★'.repeat(comentario.avaliacao)}${'☆'.repeat(5 - comentario.avaliacao)}</span>
            </div>
            <p class="comment-text">${comentario.comentario}</p>
            <div class="comment-footer">
                <span class="date">${new Date(comentario.data_comentario).toLocaleDateString()}</span>
                ${comentario.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

async function adicionarComentario(filmeId, formData) {
    try {
        const response = await fetch(`${API_URL}/comentarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filmeId,
                ...formData
            })
        });
        
        if (response.ok) {
            carregarComentarios(filmeId);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        return false;
    }
}

// Funções para imagens
async function carregarImagens(filmeId) {
    try {
        const response = await fetch(`${API_URL}/comentarios/filme/${filmeId}/imagens`);
        const imagens = await response.json();
        atualizarGaleriaImagens(imagens);
    } catch (error) {
        console.error('Erro ao carregar imagens:', error);
    }
}

function atualizarGaleriaImagens(imagens) {
    const container = document.querySelector('.movies-grid');
    container.innerHTML = imagens.map(imagem => `
        <div class="movie-card">
            <img src="${imagem.url}" alt="Capa do filme" class="movie-poster">
            <div class="movie-info">
                <h3>${imagem.titulo}</h3>
                <p>${imagem.genero}</p>
                <div class="movie-actions">
                    <button onclick="definirCapaPrincipal('${imagem.produto_id}', '${imagem.url}')">
                        Definir como Capa
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function definirCapaPrincipal(filmeId, url) {
    try {
        const response = await fetch(`${API_URL}/comentarios/filme/${filmeId}/capa`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });
        
        if (response.ok) {
            carregarImagens(filmeId);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erro ao definir capa principal:', error);
        return false;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar comentários e imagens para o filme atual
    const filmeId = new URLSearchParams(window.location.search).get('id');
    if (filmeId) {
        carregarComentarios(filmeId);
        carregarImagens(filmeId);
    }

    // Configurar formulário de comentários
    const comentarioForm = document.getElementById('comentarioForm');
    if (comentarioForm) {
        comentarioForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(comentarioForm);
            const success = await adicionarComentario(filmeId, {
                comentario: formData.get('comentario'),
                avaliacao: parseInt(formData.get('avaliacao')),
                tags: formData.get('tags').split(',').map(tag => tag.trim())
            });
            
            if (success) {
                comentarioForm.reset();
            }
        });
    }
}); 