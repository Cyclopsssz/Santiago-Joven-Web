document.addEventListener('DOMContentLoaded', () => {
  // ==================== DATA (MOCKS SEPARADOS) ====================
  const eventosDB = [
    {
      id: 1,
      name: 'Reforestación Cerro Santa Lucía',
      icon: 'fas fa-tree',
      color: 'secondary',
      date: '2026-07-15',
      timeStart: '09:00',
      timeEnd: '13:00',
      location: 'Cerro Santa Lucía, Entrada Alameda',
      description: 'Actividad de limpieza y plantación de flora nativa. Se recomienda traer ropa cómoda y agua.',
      enrolled: 45,
      maxCapacity: 50,
      active: true,
    },
    {
      id: 2,
      name: 'Colecta Banco de Alimentos',
      icon: 'fas fa-box-open',
      color: 'accent',
      date: '2026-08-01',
      timeStart: '10:00',
      timeEnd: '18:00',
      location: 'Plaza de Armas',
      description: 'Campaña de recolección de alimentos no perecibles para comedores solidarios de la comuna.',
      enrolled: 120,
      maxCapacity: null, // Sin límite
      active: true,
    },
    {
      id: 3,
      name: 'Pintatón Mural Comunitario',
      icon: 'fas fa-paint-roller',
      color: 'primary',
      date: '2026-06-20',
      timeStart: '15:00',
      timeEnd: '19:00',
      location: 'Barrio Yungay, Esquina Esperanza con Huérfanos',
      description: 'Recuperación de espacios públicos mediante muralismo junto a artistas locales.',
      enrolled: 30,
      maxCapacity: 30,
      active: false,
    }
  ];

  // ==================== COLOR CONFIG ====================
  const colorConfig = {
    primary: { bg: 'bg-blue-50', text: 'text-primary-600', icon: 'bg-blue-100 text-primary-600', border: 'border-primary-500' },
    secondary: { bg: 'bg-green-50', text: 'text-secondary-600', icon: 'bg-green-100 text-secondary-600', border: 'border-secondary-500' },
    accent: { bg: 'bg-orange-50', text: 'text-accent-600', icon: 'bg-orange-100 text-accent-600', border: 'border-accent-500' },
    red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'bg-red-100 text-red-600', border: 'border-red-500' },
  };

  // ==================== DOM ====================
  const eventosGrid = document.getElementById('eventos-grid');
  const activeCount = document.getElementById('active-count');
  const totalEnrolled = document.getElementById('total-enrolled');

  // Modal Detalles
  const detailModal = document.getElementById('evento-modal');
  const modalTitle = document.getElementById('evento-modal-title');
  const modalBody = document.getElementById('evento-modal-body');
  
  // Modal Formulario Eventos
  const formEventoModal = document.getElementById('form-evento-modal');
  const addEventoBtn = document.getElementById('add-evento-btn');

  // Form elements
  const formTitle = document.getElementById('form-evento-title');
  const form = document.getElementById('form-evento');

  // ==================== RENDER ====================
  function updateStats() {
    activeCount.textContent = eventosDB.filter(p => p.active).length;
    totalEnrolled.textContent = eventosDB.reduce((sum, p) => sum + (p.enrolled || 0), 0);
  }

  function createCardHTML(p) {
    const cfg = colorConfig[p.color] || colorConfig.accent;
    const dateFormatted = new Date(p.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
    const capacityText = p.maxCapacity ? `${p.enrolled}/${p.maxCapacity}` : `${p.enrolled} (Sin límite)`;
    
    return `
      <div class="bg-white rounded-xl border border-gray-100 overflow-hidden dashboard-card relative group" data-id="${p.id}">
        <!-- Floating Actions Overlay (Edit/Delete) -->
        <div class="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button class="edit-btn w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors shadow-sm" data-id="${p.id}" title="Editar">
            <i class="fas fa-pen text-xs"></i>
          </button>
          <button class="delete-btn w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors shadow-sm" data-id="${p.id}" title="Eliminar">
            <i class="fas fa-trash text-xs"></i>
          </button>
        </div>

        <div class="p-6">
          <div class="flex items-start justify-between mb-4 pr-20">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg ${cfg.icon} flex items-center justify-center flex-shrink-0">
                <i class="${p.icon} text-xl"></i>
              </div>
              <div>
                <h3 class="font-bold text-gray-800 text-lg line-clamp-1" title="${p.name}">${p.name}</h3>
                <p class="text-xs text-gray-500 line-clamp-1"><i class="fas fa-calendar-alt mr-1"></i> ${dateFormatted} • ${p.timeStart}</p>
              </div>
            </div>
          </div>
          <p class="text-gray-600 text-sm mb-5 h-10 line-clamp-2">${p.description}</p>
          <div class="flex items-center gap-6 text-sm mb-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <i class="fas fa-users text-xs"></i>
              </div>
              <div>
                <p class="text-gray-500 text-xs">Voluntarios</p>
                <p class="font-bold text-gray-800">${capacityText}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                <i class="fas fa-map-marker-alt text-xs"></i>
              </div>
              <div>
                <p class="text-gray-500 text-xs line-clamp-1 max-w-[100px]" title="${p.location}">${p.location}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 ml-auto">
              <button class="toggle-btn relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${p.active ? 'bg-green-500' : 'bg-gray-300'}" data-id="${p.id}" title="${p.active ? 'Pausar Inscripciones' : 'Activar Inscripciones'}">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${p.active ? 'translate-x-6' : 'translate-x-1'}"></span>
              </button>
            </div>
          </div>
        </div>
        <div class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button class="detail-btn text-sm text-accent-500 font-semibold hover:text-accent-600 transition-colors flex items-center gap-1" data-id="${p.id}">
            Ver detalles <i class="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>
    `;
  }

  function renderUI() {
    eventosGrid.innerHTML = eventosDB.map(p => createCardHTML(p)).join('');
    updateStats();
  }

  // ==================== MODALS LOGIC ====================
  function openDetail(id) {
    const p = eventosDB.find(pr => pr.id === id);
    if (!p) return;
    const cfg = colorConfig[p.color] || colorConfig.accent;
    const dateFormatted = new Date(p.date).toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    modalTitle.textContent = p.name;
    modalBody.innerHTML = `
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-lg ${cfg.icon} flex items-center justify-center text-xl">
          <i class="${p.icon}"></i>
        </div>
        <div>
          <span class="text-xs font-medium px-2 py-0.5 rounded ${p.active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${p.active ? 'Inscripciones Abiertas' : 'Inscripciones Cerradas'}</span>
        </div>
      </div>
      
      <div class="space-y-3">
        <div>
          <h4 class="text-sm font-semibold text-gray-700 flex items-center gap-2"><i class="fas fa-clock text-gray-400"></i> Cuándo</h4>
          <p class="text-gray-600 text-sm ml-6">${dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1)}</p>
          <p class="text-gray-600 text-sm ml-6">${p.timeStart} a ${p.timeEnd || 'Término por definir'}</p>
        </div>
        
        <div>
          <h4 class="text-sm font-semibold text-gray-700 flex items-center gap-2"><i class="fas fa-map-pin text-gray-400"></i> Dónde</h4>
          <p class="text-gray-600 text-sm ml-6">${p.location}</p>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-700 flex items-center gap-2"><i class="fas fa-info-circle text-gray-400"></i> Descripción y Requisitos</h4>
          <p class="text-gray-600 text-sm ml-6 whitespace-pre-wrap">${p.description}</p>
        </div>
      </div>

      <div class="mt-6 bg-blue-50 rounded-lg p-4 flex justify-between items-center">
        <div>
          <p class="text-sm font-semibold text-primary-700">Voluntarios Inscritos</p>
          <p class="text-xs text-primary-600">${p.maxCapacity ? `Cupo máximo: ${p.maxCapacity}` : 'Sin límite de cupos'}</p>
        </div>
        <div class="text-2xl font-black text-primary-600">
          ${p.enrolled}
        </div>
      </div>
    `;
    detailModal.classList.remove('hidden');
  }

  function closeAllModals() {
    detailModal.classList.add('hidden');
    formEventoModal.classList.add('hidden');
  }

  // Eventos de apertura de modales de creación
  addEventoBtn.addEventListener('click', () => {
    form.reset();
    formTitle.textContent = 'Añadir Evento';
    formEventoModal.classList.remove('hidden');
  });

  // Eventos de cierre en modales
  const closeSelectors = [
    '#close-evento-modal', '#close-evento-modal-btn',
    '#close-form-evento', '#cancel-form-evento-btn'
  ];
  closeSelectors.forEach(selector => {
    const el = document.querySelector(selector);
    if(el) el.addEventListener('click', (e) => {
      e.preventDefault();
      closeAllModals();
    });
  });

  // Cierre por clic fuera del modal
  [detailModal, formEventoModal].forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) closeAllModals();
    });
  });

  // ==================== DELEGATED EVENTS ====================
  document.addEventListener('click', (e) => {
    // Toggle Activo/Inactivo
    const toggleBtn = e.target.closest('.toggle-btn');
    if (toggleBtn) {
      const id = parseInt(toggleBtn.dataset.id);
      const p = eventosDB.find(pr => pr.id === id);
      if (p) {
        p.active = !p.active;
        renderUI();
      }
      return;
    }

    // Ver Detalles
    const detailBtn = e.target.closest('.detail-btn');
    if (detailBtn) {
      openDetail(parseInt(detailBtn.dataset.id));
      return;
    }

    // Botón Editar
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
      formTitle.textContent = 'Editar Evento';
      formEventoModal.classList.remove('hidden');
      return;
    }

    // Botón Eliminar
    const delBtn = e.target.closest('.delete-btn');
    if (delBtn) {
      if(confirm('¿Estás seguro que deseas eliminar este evento? (Simulación visual)')) {
        const id = parseInt(delBtn.dataset.id);
        const idx = eventosDB.findIndex(x => x.id === id);
        if(idx !== -1) eventosDB.splice(idx, 1);
        renderUI();
      }
      return;
    }
  });

  // Eventos de guardado (Prevent default para que no recargue)
  document.getElementById('save-form-evento-btn').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Simulación: Evento guardado exitosamente.');
    closeAllModals();
  });

  // ==================== INIT ====================
  renderUI();
});
