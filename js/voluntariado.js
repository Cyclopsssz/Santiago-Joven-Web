import { supabase } from './api.js';

function initVoluntariado() {
    // DOM Elements
    const grid = document.getElementById('voluntariados-grid');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const emptyState = document.getElementById('empty-state');
    const btnLogout = document.getElementById('btn-logout-vol');

    const modal = document.getElementById('evento-modal');
    const modalTitle = document.getElementById('evento-modal-title');
    const modalBody = document.getElementById('evento-modal-body');
    const inscribirmeBtn = document.getElementById('inscribirme-btn');

    let currentUser = null;
    let eventos = [];
    let misInscripciones = [];
    let currentSelectedEvento = null;

    // Color configs
    const colorConfig = {
        primary: { bg: 'bg-blue-50', text: 'text-primary-600', icon: 'bg-blue-100 text-primary-600' },
        secondary: { bg: 'bg-green-50', text: 'text-secondary-600', icon: 'bg-green-100 text-secondary-600' },
        accent: { bg: 'bg-orange-50', text: 'text-accent-600', icon: 'bg-orange-100 text-accent-600' },
    };
    const iconsByColor = {
        primary: 'fas fa-hands-helping',
        secondary: 'fas fa-tree',
        accent: 'fas fa-bullhorn'
    };

    // Main execution flow wrapped in async
    async function start() {
        // 1. Check Auth
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = 'index.html';
                return;
            }
            currentUser = user;
            const profileMenu = document.getElementById('user-profile-menu');
            if (profileMenu) profileMenu.classList.remove('hidden');
        } catch(err) {
            window.location.href = 'index.html';
            return;
        }

        // Logout
        if (btnLogout) {
            btnLogout.addEventListener('click', async () => {
                await supabase.auth.signOut();
                window.location.href = 'index.html';
            });
        }

        loadData();
    }

    // 2. Fetch Data
    async function loadData() {
        if (loadingSpinner) loadingSpinner.classList.remove('hidden');
        if (grid) grid.classList.add('hidden');
        if (errorMessage) errorMessage.classList.add('hidden');
        if (emptyState) emptyState.classList.add('hidden');

        try {
            // Obtener eventos activos
            const { data: evData, error: evError } = await supabase
                .from('eventos_voluntariado')
                .select('*')
                .eq('activo', true)
                .order('fecha', { ascending: true });
            
            if (evError) throw evError;
            eventos = evData || [];

            // Obtener mis inscripciones
            const { data: inscData, error: inscError } = await supabase
                .from('inscripciones_voluntariado')
                .select('evento_id')
                .eq('user_id', currentUser.id);
            
            if (inscError) throw inscError;
            misInscripciones = (inscData || []).map(i => i.evento_id);

            renderGrid();
        } catch(err) {
            console.error(err);
            if (loadingSpinner) loadingSpinner.classList.add('hidden');
            if (errorMessage) errorMessage.classList.remove('hidden');
        }
    }

    // 3. Render
    function renderGrid() {
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        
        if (eventos.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (grid) {
            grid.innerHTML = eventos.map(p => {
                const cfg = colorConfig[p.color] || colorConfig.accent;
                const iconClass = iconsByColor[p.color] || iconsByColor.accent;
                const dateFormatted = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
                const estaInscrito = misInscripciones.includes(p.id);

                return `
                    <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                        <div class="h-2 w-full ${p.color === 'primary' ? 'bg-primary-500' : p.color === 'secondary' ? 'bg-secondary-500' : 'bg-accent-500'}"></div>
                        <div class="p-6 flex-grow">
                            <div class="flex items-center gap-4 mb-4">
                                <div>
                                    <h3 class="font-bold text-gray-800 text-lg line-clamp-2">${p.titulo}</h3>
                                    <p class="text-sm text-gray-500"><i class="fas fa-calendar-alt mr-1"></i> ${dateFormatted} • ${p.hora_inicio.slice(0,5)}</p>
                                </div>
                            </div>
                            <p class="text-gray-600 text-sm mb-4 line-clamp-3">${p.descripcion || 'Sin descripción'}</p>
                            <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <i class="fas fa-map-marker-alt w-4 text-center"></i>
                                <span class="line-clamp-1">${p.lugar}</span>
                            </div>
                        </div>
                        <div class="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            ${estaInscrito ? 
                                `<span class="text-secondary-600 font-semibold text-sm flex items-center gap-1"><i class="fas fa-check-circle"></i> Inscrito</span>` : 
                                `<span class="text-gray-400 text-sm">Cupos disp.</span>`
                            }
                            <button class="open-modal-btn px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors" data-id="${p.id}">
                                Ver más detalles
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            grid.classList.remove('hidden');
        }
    }

    // 4. Modal
    function openModal(id) {
        const p = eventos.find(e => e.id === id);
        if (!p) return;
        currentSelectedEvento = p;
        const estaInscrito = misInscripciones.includes(p.id);
        const cfg = colorConfig[p.color] || colorConfig.accent;
        const iconClass = iconsByColor[p.color] || iconsByColor.accent;
        const dateFormatted = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

        if (modalTitle) modalTitle.textContent = p.titulo;
        if (modalBody) modalBody.innerHTML = `
            <div class="space-y-4">
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 class="text-sm font-bold text-gray-800 flex items-center gap-2 mb-1"><i class="fas fa-calendar-alt text-primary-500"></i> Fecha y Hora</h4>
                    <p class="text-gray-600 text-sm">${dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1)}</p>
                    <p class="text-gray-600 text-sm">${p.hora_inicio.slice(0,5)} a ${p.hora_fin ? p.hora_fin.slice(0,5) : 'Por definir'}</p>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 class="text-sm font-bold text-gray-800 flex items-center gap-2 mb-1"><i class="fas fa-map-pin text-red-500"></i> Lugar</h4>
                    <p class="text-gray-600 text-sm">${p.lugar}</p>
                </div>

                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 class="text-sm font-bold text-gray-800 flex items-center gap-2 mb-1"><i class="fas fa-info-circle text-blue-500"></i> Descripción de la actividad</h4>
                    <p class="text-gray-600 text-sm whitespace-pre-wrap">${p.descripcion || 'Sin descripción adicional.'}</p>
                </div>
            </div>
        `;

        if (inscribirmeBtn) {
            if (estaInscrito) {
                inscribirmeBtn.textContent = 'Cancelar Inscripción';
                inscribirmeBtn.className = 'px-6 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-bold shadow-sm';
            } else {
                inscribirmeBtn.textContent = '¡Inscribirme!';
                inscribirmeBtn.className = 'px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-bold shadow-md';
            }
        }

        if (modal) modal.classList.remove('hidden');
    }

    function closeModal() {
        if (modal) modal.classList.add('hidden');
        currentSelectedEvento = null;
    }

    // Modal Events
    const closeEv = document.getElementById('close-evento-modal');
    if (closeEv) closeEv.addEventListener('click', closeModal);
    const closeEvBtn = document.getElementById('close-evento-modal-btn');
    if (closeEvBtn) closeEvBtn.addEventListener('click', closeModal);
    
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    if (grid) grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.open-modal-btn');
        if (btn) openModal(btn.dataset.id);
    });

    // 5. Enroll / Unenroll Action
    if (inscribirmeBtn) {
        inscribirmeBtn.addEventListener('click', async () => {
            if (!currentSelectedEvento || !currentUser) return;
            const eventoId = currentSelectedEvento.id;
            const estaInscrito = misInscripciones.includes(eventoId);

            inscribirmeBtn.disabled = true;
            inscribirmeBtn.textContent = 'Procesando...';

            try {
                if (estaInscrito) {
                    // Cancelar
                    await supabase
                        .from('inscripciones_voluntariado')
                        .delete()
                        .eq('evento_id', eventoId)
                        .eq('user_id', currentUser.id);
                    
                    misInscripciones = misInscripciones.filter(id => id !== eventoId);
                    alert('Tu inscripción ha sido cancelada.');
                } else {
                    // Inscribir
                    await supabase
                        .from('inscripciones_voluntariado')
                        .insert([{ evento_id: eventoId, user_id: currentUser.id }]);
                    
                    misInscripciones.push(eventoId);
                    
                    // Bonito mensaje de éxito
                    alert('¡Éxito! Te has inscrito correctamente a esta actividad. ¡Gracias por participar!');
                }
                closeModal();
                renderGrid();
            } catch(err) {
                console.error(err);
                alert('Hubo un error al procesar tu solicitud. Intenta nuevamente.');
            } finally {
                inscribirmeBtn.disabled = false;
            }
        });
    }

    start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVoluntariado);
} else {
  initVoluntariado();
}
