import { API_CONFIG } from './api.js';
import { showStatusMessage } from './utils.js';

export const initCalendar = () => {
    // filtrado de eventos en calendario
    const filterButtons = document.querySelectorAll('.filter-btn');
    const eventCardsContainer = document.getElementById('event-list');
    let eventCards = document.querySelectorAll('.event-card');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            // Re-query in case new ones were added
            eventCards = document.querySelectorAll('.event-card');
            eventCards.forEach(card => {
                if (filter === 'all' || card.dataset.type === filter) {
                    card.style.display = 'block';
                    setTimeout(() => card.classList.remove('hidden'), 10);
                } else {
                    card.classList.add('hidden');
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        });
    });

    // Lógica para modal de Administrador "Añadir Evento"
    const addEventBtn = document.getElementById('admin-add-event-btn');
    const addEventModal = document.getElementById('add-event-modal');
    const closeAddEventBtn = document.getElementById('close-add-event-btn');
    const authModalsContainer = document.getElementById('auth-modals');
    const authBackdrop = document.getElementById('auth-backdrop');
    const addEventForm = document.getElementById('add-event-form');
    const mainContent = document.getElementById('main-content-wrapper');

    const openAddModal = () => {
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        if (loginModal) loginModal.classList.add('hidden');
        if (registerModal) registerModal.classList.add('hidden');

        authBackdrop.classList.remove('hidden');
        authModalsContainer.classList.remove('hidden');
        addEventModal.classList.remove('hidden');
        setTimeout(() => {
            authBackdrop.classList.remove('opacity-0');
            authModalsContainer.classList.remove('opacity-0');
            addEventModal.classList.remove('scale-95', 'opacity-0');
        }, 10);
        mainContent.classList.add('blur-lg', 'pointer-events-none');
    };

    const closeAddModal = () => {
        authBackdrop.classList.add('opacity-0');
        authModalsContainer.classList.add('opacity-0');
        addEventModal.classList.add('scale-95', 'opacity-0');
        mainContent.classList.remove('blur-lg', 'pointer-events-none');
        setTimeout(() => {
            authBackdrop.classList.add('hidden');
            authModalsContainer.classList.add('hidden');
            addEventModal.classList.add('hidden');
        }, 300);
    };

    if (addEventBtn) addEventBtn.addEventListener('click', openAddModal);
    if (closeAddEventBtn) closeAddEventBtn.addEventListener('click', closeAddModal);

    if (addEventForm) {
        addEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titulo = document.getElementById('event-title').value;
            const tipo = document.getElementById('event-type').value;
            const fechaVal = document.getElementById('event-date').value;
            const statusDiv = document.getElementById('add-event-status');

            if (!titulo || !tipo || !fechaVal) {
                showStatusMessage(statusDiv, 'Por favor completa todos los campos', false);
                return;
            }

            const fechaObj = new Date(fechaVal);
            // Formatear fecha simple (ej. 15 de Noviembre)
            const opcionesFecha = { day: 'numeric', month: 'long', timeZone: 'UTC' };
            const fechaFormateada = fechaObj.toLocaleDateString('es-ES', opcionesFecha);

            showStatusMessage(statusDiv, 'Añadiendo actividad...', true);

            const nuevoEvento = { Titulo: titulo, Tipo: tipo, Fecha: fechaVal };

            try {
                // Mock local para que siempre sea exitoso (sin Error de conexión)
                const respuestaOk = true; 
                
                if (respuestaOk) {
                    showStatusMessage(statusDiv, 'Actividad añadida exitosamente', true);
                    
                    // Colores por tipo
                    const typeColors = {
                        feria: 'bg-blue-100 text-blue-800',
                        taller: 'bg-yellow-100 text-yellow-800',
                        curso: 'bg-green-100 text-green-800',
                        campana: 'bg-red-100 text-red-800'
                    };

                    const typeLabel = tipo.charAt(0).toUpperCase() + tipo.slice(1);

                    // Insertar en el DOM visualmente, incluyendo el botón de borrar visible para admin
                    const cardHTML = `
                        <div class="event-card card relative" data-type="${tipo}">
                            <button class="admin-delete-btn absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md">
                                <i class="fas fa-trash"></i>
                            </button>
                            <div class="px-3 py-1 ${typeColors[tipo] || 'bg-gray-100 text-gray-800'} rounded-full text-sm font-semibold inline-block mb-3">
                                ${typeLabel}
                            </div>
                            <h4 class="text-xl font-semibold mb-2">${titulo}</h4>
                            <p class="text-gray-600"><i class="fas fa-calendar-day mr-2"></i>${fechaFormateada}</p>
                        </div>
                    `;
                    
                    eventCardsContainer.insertAdjacentHTML('afterbegin', cardHTML);

                    setTimeout(() => {
                        closeAddModal();
                        addEventForm.reset();
                        statusDiv.classList.add('hidden');
                        
                        // Forzar click en el botón "Todos" para refrescar la grilla
                        const btnTodos = document.querySelector('.filter-btn[data-filter="all"]');
                        if (btnTodos) btnTodos.click();

                    }, 1500);

                } else {
                    showStatusMessage(statusDiv, 'Error al guardar en el servidor', false);
                }
            } catch (error) {
                console.error(error);
                showStatusMessage(statusDiv, 'Error de conexión', false);
            }
        });
    }

    // Event delegation para borrar tarjetas
    if (eventCardsContainer) {
        eventCardsContainer.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.admin-delete-btn');
            if (deleteBtn) {
                const card = deleteBtn.closest('.event-card');
                if (card) {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    card.style.transition = 'all 0.3s ease-out';
                    setTimeout(() => card.remove(), 300);
                }
            }
        });
    }
};
