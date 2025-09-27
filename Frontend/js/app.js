const API_BASE_URL = 'http://localhost:5000/api';

// Estado global de la aplicación
const AppState = {
    user: null,
    token: localStorage.getItem('authToken'),
    currentView: 'auth',
    books: [],
    filteredBooks: [],
    filters: {
        search: '',
        status: '',
        author: ''
    }
};

class ApiClient {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (AppState.token) {
            config.headers.Authorization = `Bearer ${AppState.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            console.log(`API Request: ${endpoint}`, { response: data });
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            console.error('Request details:', { url, config });
            throw error;
        }
    }

    static get(endpoint) {
        return this.request(endpoint);
    }

    static post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    static put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    static patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    }

    static delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

class AuthService {
    static async login(credentials) {
        const response = await ApiClient.post('/auth/login', credentials);
        return response;
    }

    static async register(credentials) {
        const response = await ApiClient.post('/auth/register', credentials);
        return response;
    }

    static logout() {
        AppState.token = null;
        AppState.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        showView('auth');
    }
}

class BookService {
    static async getAllBooks() {
        return await ApiClient.get('/books');
    }

    static async getAvailableBooks() {
        return await ApiClient.get('/books/available');
    }

    static async getReservedBooks() {
        return await ApiClient.get('/books/reserved');
    }

    static async getRecentBooks(limit = 10) {
        return await ApiClient.get(`/books/recent?limit=${limit}`);
    }

    static async getBooksByAuthor(author) {
        return await ApiClient.get(`/books/author/${encodeURIComponent(author)}`);
    }

    static async getBookById(id) {
        return await ApiClient.get(`/books/${id}`);
    }

    static async createBook(bookData) {
        return await ApiClient.post('/books', bookData);
    }

    static async updateBook(id, bookData) {
        return await ApiClient.put(`/books/${id}`, bookData);
    }

    static async deleteBook(id) {
        return await ApiClient.delete(`/books/${id}`);
    }

    static async changeBookState(id, estado) {
        return await ApiClient.patch(`/books/${id}/state`, { estado });
    }
}

class ToastManager {
    static show(message, type = 'info', duration = 5000) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <i class="toast-icon ${icons[type]}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);
        
        // Mostrar toast con animación
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Eliminar automáticamente
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }

    static warning(message) {
        this.show(message, 'warning');
    }

    static info(message) {
        this.show(message, 'info');
    }
}

function showView(viewName) {
    // Ocultar todas las vistas
    const views = document.querySelectorAll('.view-container');
    views.forEach(view => view.style.display = 'none');
    
    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) {
        targetView.style.display = 'block';
        AppState.currentView = viewName;
    }
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.querySelector(`[data-view="${viewName}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    const navbar = document.getElementById('navbar');
    const navUser = document.getElementById('navUser');
    
    if (viewName === 'auth') {
        navbar.style.display = 'none';
    } else {
        navbar.style.display = 'block';
        navUser.style.display = 'flex';
    }
}

function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    showLoading(true);
    
    AuthService.login(credentials)
        .then(response => {
            if (response.success) {
                AppState.token = response.data.token;
                AppState.user = response.data.user;
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                document.getElementById('userName').textContent = response.data.user.username;
                ToastManager.success(`¡Bienvenido, ${response.data.user.username}!`);
                showView('dashboard');
                loadDashboardData();
            }
        })
        .catch(error => {
            ToastManager.error(error.message || 'Error al iniciar sesión');
        })
        .finally(() => {
            showLoading(false);
        });
}

function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const credentials = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password')
    };

    showLoading(true);
    
    AuthService.register(credentials)
        .then(response => {
            if (response.success) {
                ToastManager.success('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
                showLoginForm();
                form.reset();
            }
        })
        .catch(error => {
            ToastManager.error(error.message || 'Error al crear la cuenta');
        })
        .finally(() => {
            showLoading(false);
        });
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

async function loadDashboardData() {
    try {
        showLoading(true);
        
        console.log('Loading dashboard data...');
        
        const allBooksPromise = BookService.getAllBooks();
        const recentBooksPromise = BookService.getRecentBooks(6);
        
        const [allBooksResponse, recentBooksResponse] = await Promise.all([
            allBooksPromise,
            recentBooksPromise
        ]);
        
        console.log('Raw responses:', { allBooksResponse, recentBooksResponse });
        
        const allBooksData = validateApiResponse(allBooksResponse, 'array');
        const recentBooksData = validateApiResponse(recentBooksResponse, 'array');
        
        console.log('Processed data:', { allBooksData, recentBooksData });
        
        AppState.books = allBooksData;
        
        updateStats(AppState.books);
        
        displayRecentBooks(recentBooksData);
        
    } catch (error) {
        ToastManager.error('Error al cargar los datos del dashboard');
        console.error('Dashboard error:', error);
        
        AppState.books = [];
        updateStats([]);
        displayRecentBooks([]);
    } finally {
        showLoading(false);
    }
}

function updateStats(books) {
    const totalBooks = books.length;
    const availableBooks = books.filter(book => book.estado === 'disponible').length;
    const reservedBooks = books.filter(book => book.estado === 'reservado').length;
    
    document.getElementById('totalBooksCount').textContent = totalBooks;
    document.getElementById('availableBooksCount').textContent = availableBooks;
    document.getElementById('reservedBooksCount').textContent = reservedBooks;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentBooks = books.filter(book => {
        const bookDate = new Date(book.createdAt || book.fechaCreacion);
        return bookDate >= thirtyDaysAgo;
    }).length;
    
    document.getElementById('recentBooksCount').textContent = recentBooks;
}

function displayRecentBooks(books) {
    const container = document.getElementById('recentBooksList');
    
    if (!Array.isArray(books) || books.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <h3>No hay libros recientes</h3>
                <p>Los libros agregados recientemente aparecerán aquí</p>
            </div>
        `;
        return;
    }
    
    console.log('libros:', books); 
    
    container.innerHTML = books.map(book => `
        <div class="book-card">
            <div class="book-status ${book.estado || 'disponible'}">${book.estado || 'disponible'}</div>
            <div class="book-info">
                <h3>${escapeHtml(book.titulo || 'Sin título')}</h3>
                <p class="book-author">por ${escapeHtml(book.autor || 'Autor desconocido')}</p>
                <p class="book-year">${book.anoPublicacion || 'Año no especificado'}</p>
            </div>
        </div>
    `).join('');
}

async function loadBooks() {
    try {
        showLoading(true);
        const response = await BookService.getAllBooks();
        
        const booksData = validateApiResponse(response, 'array');
        
        AppState.books = booksData;
        AppState.filteredBooks = [...AppState.books];
        
        displayBooks();
    } catch (error) {
        ToastManager.error('Error al cargar los libros');
        console.error('Load books error:', error);
        
        AppState.books = [];
        AppState.filteredBooks = [];
        displayBooks();
    } finally {
        showLoading(false);
    }
}

function displayBooks() {
    const container = document.getElementById('booksGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!Array.isArray(AppState.filteredBooks) || AppState.filteredBooks.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    
    container.innerHTML = AppState.filteredBooks.map(book => `
        <div class="book-card" data-book-id="${book._id || ''}">
            <div class="book-status ${book.estado || 'disponible'}">${book.estado || 'disponible'}</div>
            <div class="book-info">
                <h3>${escapeHtml(book.titulo || 'Sin título')}</h3>
                <p class="book-author">por ${escapeHtml(book.autor || 'Autor desconocido')}</p>
                <p class="book-year">${book.anoPublicacion || 'Año no especificado'}</p>
            </div>
            <div class="book-actions">
                <button class="btn-icon btn-edit" onclick="editBook('${book._id || ''}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-toggle" onclick="toggleBookStatus('${book._id || ''}')" title="Cambiar estado">
                    <i class="fas fa-exchange-alt"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="confirmDeleteBook('${book._id || ''}')" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function applyFilters() {
    let filtered = [...AppState.books];
    
    if (AppState.filters.search) {
        const searchTerm = AppState.filters.search.toLowerCase();
        filtered = filtered.filter(book => 
            book.titulo.toLowerCase().includes(searchTerm) ||
            book.autor.toLowerCase().includes(searchTerm)
        );
    }
    
    if (AppState.filters.status) {
        filtered = filtered.filter(book => book.estado === AppState.filters.status);
    }
    
    if (AppState.filters.author) {
        const authorTerm = AppState.filters.author.toLowerCase();
        filtered = filtered.filter(book => 
            book.autor.toLowerCase().includes(authorTerm)
        );
    }
    
    AppState.filteredBooks = filtered;
    displayBooks();
}

function clearFilters() {
    AppState.filters = { search: '', status: '', author: '' };
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('authorFilter').value = '';
    applyFilters();
}

function openBookModal(bookId = null) {
    const modal = document.getElementById('bookModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtnText = document.getElementById('submitBtnText');
    const form = document.getElementById('bookForm');
    
    form.reset();
    clearValidationStyles();
    
    if (bookId) {
        const book = AppState.books.find(b => b._id === bookId);
        if (book) {
            modalTitle.textContent = 'Editar Libro';
            submitBtnText.textContent = 'Actualizar Libro';
            
            document.getElementById('bookId').value = book._id;
            document.getElementById('bookTitle').value = book.titulo;
            document.getElementById('bookAuthor').value = book.autor;
            document.getElementById('bookYear').value = book.anoPublicacion;
            document.getElementById('bookStatus').value = book.estado;
        }
    } else {
        modalTitle.textContent = 'Agregar Nuevo Libro';
        submitBtnText.textContent = 'Agregar Libro';
        document.getElementById('bookId').value = '';
        
        const currentYear = new Date().getFullYear();
        document.getElementById('bookYear').placeholder = currentYear.toString();
    }
    
    modal.classList.add('active');
    
    setTimeout(() => {
        document.getElementById('bookTitle').focus();
    }, 300);
}

function closeBookModal() {
    const modal = document.getElementById('bookModal');
    modal.classList.remove('active');
    clearValidationStyles();
}

function clearValidationStyles() {
    const inputs = document.querySelectorAll('#bookForm input');
    inputs.forEach(input => {
        input.classList.remove('valid', 'invalid');
    });
}

function validateField(input) {
    const value = input.value.trim();
    const isRequired = input.hasAttribute('required');
    const maxLength = input.getAttribute('maxlength');
    const minValue = input.getAttribute('min');
    const maxValue = input.getAttribute('max');
    
    let isValid = true;
    
    if (isRequired && !value) {
        isValid = false;
    }
    
    if (maxLength && value.length > parseInt(maxLength)) {
        isValid = false;
    }
    
    if (input.type === 'number') {
        const numValue = parseInt(value);
        if (isNaN(numValue) || 
            (minValue && numValue < parseInt(minValue)) || 
            (maxValue && numValue > parseInt(maxValue))) {
            isValid = false;
        }
    }
    
    if (value && isValid) {
        input.classList.remove('invalid');
        input.classList.add('valid');
    } else if (value && !isValid) {
        input.classList.remove('valid');
        input.classList.add('invalid');
    } else {
        input.classList.remove('valid', 'invalid');
    }
    
    return isValid;
}

function editBook(bookId) {
    openBookModal(bookId);
}

async function handleBookForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const bookId = formData.get('bookId') || document.getElementById('bookId').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    const inputs = form.querySelectorAll('input[required]');
    let allValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            allValid = false;
        }
    });
    
    if (!allValid) {
        ToastManager.error('Por favor, completa todos los campos correctamente');
        return;
    }
    
    const bookData = {
        titulo: formData.get('titulo').trim(),
        autor: formData.get('autor').trim(),
        anoPublicacion: parseInt(formData.get('anoPublicacion')),
        estado: formData.get('estado')
    };

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        showLoading(true);
        
        if (bookId) {
            await BookService.updateBook(bookId, bookData);
            ToastManager.success('Libro actualizado exitosamente');
        } else {
            await BookService.createBook(bookData);
            ToastManager.success('Libro agregado exitosamente');
        }
        
        closeBookModal();
        await loadBooks();
        
        if (AppState.currentView === 'dashboard') {
            updateStats(AppState.books);
        }
        
    } catch (error) {
        ToastManager.error(error.message || 'Error al guardar el libro');
    } finally {
        showLoading(false);
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

async function toggleBookStatus(bookId) {
    const book = AppState.books.find(b => b._id === bookId);
    if (!book) return;
    
    const newStatus = book.estado === 'disponible' ? 'reservado' : 'disponible';
    
    try {
        showLoading(true);
        await BookService.changeBookState(bookId, newStatus);
        ToastManager.success(`Estado cambiado a ${newStatus}`);
        await loadBooks();
        
        if (AppState.currentView === 'dashboard') {
            updateStats(AppState.books);
        }
        
    } catch (error) {
        ToastManager.error('Error al cambiar el estado del libro');
    } finally {
        showLoading(false);
    }
}

function confirmDeleteBook(bookId) {
    const book = AppState.books.find(b => b._id === bookId);
    if (!book) return;
    
    showConfirmModal(
        `¿Estás seguro de que deseas eliminar el libro "${book.titulo}"?`,
        () => deleteBook(bookId)
    );
}

async function deleteBook(bookId) {
    try {
        showLoading(true);
        await BookService.deleteBook(bookId);
        ToastManager.success('Libro eliminado exitosamente');
        await loadBooks();
        
        if (AppState.currentView === 'dashboard') {
            updateStats(AppState.books);
        }
        
    } catch (error) {
        ToastManager.error('Error al eliminar el libro');
    } finally {
        showLoading(false);
    }
}

function showConfirmModal(message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmBtn');
    
    messageEl.textContent = message;
    
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        closeConfirmModal();
        onConfirm();
    });
    
    modal.classList.add('active');
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('active');
}

function showLoading(show) {
    const loadingScreen = document.getElementById('loadingScreen');
    if (show) {
        loadingScreen.style.display = 'flex';
    } else {
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function validateApiResponse(response, expectedDataType = 'array') {
    if (!response) {
        console.warn('API response is null or undefined');
        return expectedDataType === 'array' ? [] : null;
    }
    
    if (!response.success) {
        console.warn('API response indicates failure:', response.message);
        return expectedDataType === 'array' ? [] : null;
    }
    
    let data = response.data;
    
    if (data && typeof data === 'object' && data.books && Array.isArray(data.books)) {
        console.log('Found nested books array, extracting...');
        data = data.books;
    }
    
    if (expectedDataType === 'array' && !Array.isArray(data)) {
        console.warn('Expected array but got:', typeof data, data);
        return [];
    }
    
    return data;
}

document.addEventListener('DOMContentLoaded', function() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
        try {
            AppState.token = savedToken;
            AppState.user = JSON.parse(savedUser);
            document.getElementById('userName').textContent = AppState.user.username;
            showView('dashboard');
            loadDashboardData();
        } catch (error) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            showView('auth');
        }
    } else {
        showView('auth');
    }
    
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
    
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        AuthService.logout();
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.getAttribute('data-view');
            showView(viewName);
            
            if (viewName === 'books') {
                loadBooks();
            } else if (viewName === 'dashboard') {
                loadDashboardData();
            }
        });
    });
    
    document.getElementById('addBookBtn').addEventListener('click', () => openBookModal());
    document.getElementById('bookForm').addEventListener('submit', handleBookForm);
    
    const bookFormInputs = document.querySelectorAll('#bookForm input');
    bookFormInputs.forEach(input => {
        input.addEventListener('blur', (e) => validateField(e.target));
        input.addEventListener('input', (e) => {
            if (e.target.classList.contains('invalid')) {
                e.target.classList.remove('invalid');
            }
        });
    });
    
    document.getElementById('searchInput').addEventListener('input', (e) => {
        AppState.filters.search = e.target.value;
        applyFilters();
    });
    
    document.getElementById('statusFilter').addEventListener('change', (e) => {
        AppState.filters.status = e.target.value;
        applyFilters();
    });
    
    document.getElementById('authorFilter').addEventListener('input', (e) => {
        AppState.filters.author = e.target.value;
        applyFilters();
    });
    
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    document.addEventListener('click', (e) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    setTimeout(() => {
        showLoading(false);
    }, 1000);
});

window.openBookModal = openBookModal;
window.closeBookModal = closeBookModal;
window.editBook = editBook;
window.toggleBookStatus = toggleBookStatus;
window.confirmDeleteBook = confirmDeleteBook;
window.closeConfirmModal = closeConfirmModal;