document.addEventListener('DOMContentLoaded', () => {
  // ==================== DATA (MOCKS SEPARADOS) ====================
  const serviciosDB = [
    {
      id: 3,
      name: 'Preuniversitario Gratuito',
      categoria: 'preuniversitario',
      icon: 'fas fa-graduation-cap',
      color: 'primary',
      description: 'Preparación PAES en Competencia Lectora, Matemáticas (M1) y Ciencias Sociales.',
      enrolled: 156,
      sessions: 240,
      active: true,
      details: 'Programa de preparación gratuita para la PAES. Incluye tres módulos: Competencia Lectora, Matemática M1 y Ciencias Sociales/Historia.'
    },
    {
      id: 4,
      name: 'Curso de Inteligencia Artificial',
      categoria: 'curso',
      icon: 'fas fa-robot',
      color: 'primary',
      description: 'Fundamentos de IA, machine learning y aplicaciones prácticas en la vida cotidiana.',
      enrolled: 38,
      sessions: 12,
      active: true,
      details: 'Curso introductorio de 12 sesiones sobre inteligencia artificial.'
    },
    {
      id: 5,
      name: 'Curso de Excel',
      categoria: 'curso',
      icon: 'fas fa-file-excel',
      color: 'secondary',
      description: 'Dominio de Excel desde nivel básico hasta intermedio. Fórmulas, funciones y tablas dinámicas.',
      enrolled: 64,
      sessions: 18,
      active: false,
      details: 'Capacitación práctica en Microsoft Excel.'
    }
  ];

  // ==================== COLOR CONFIG ====================
  const colorConfig = {
    primary: { bg: 'bg-blue-50', text: 'text-primary-600', icon: 'bg-blue-100 text-primary-600', border: 'border-primary-500' },
    secondary: { bg: 'bg-green-50', text: 'text-secondary-600', icon: 'bg-green-100 text-secondary-600', border: 'border-secondary-500' },
    accent: { bg: 'bg-orange-50', text: 'text-accent-600', icon: 'bg-orange-100 text-accent-600', border: 'border-accent-500' },
  };

  // ==================== DOM ====================
  const servGrid = document.getElementById('servicios-grid');
  const activeCount = document.getElementById('active-count');
  const totalEnrolled = document.getElementById('total-enrolled');
  const totalSessions = document.getElementById('total-sessions');
  const pausedCount = document.getElementById('paused-count');

  // Modal Detalles
  const detailModal = document.getElementById('program-modal'); // Reutilizamos el id para el detalle
  const modalTitle = document.getElementById('program-modal-title');
  const modalBody = document.getElementById('program-modal-body');
  
  // Modal Formulario Servicios
  const formServModal = document.getElementById('form-servicio-modal');
  const addServBtn = document.getElementById('add-servicio-btn');

  // ==================== RENDER ====================
  function updateStats() {
    activeCount.textContent = serviciosDB.filter(p => p.active).length;
    pausedCount.textContent = serviciosDB.filter(p => !p.active).length;
    totalEnrolled.textContent = serviciosDB.reduce((sum, p) => sum + (p.enrolled || 0), 0);
    totalSessions.textContent = serviciosDB.reduce((sum, p) => sum + (p.sessions || 0), 0);
  }

  function createCardHTML(p) {
    const cfg = colorConfig[p.color] || colorConfig.primary;
    const subtext = p.categoria.toUpperCase();
    
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
                <p class="text-xs text-gray-500 line-clamp-1">${subtext}</p>
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
                <p class="text-gray-500 text-xs">Inscritos</p>
                <p class="font-bold text-gray-800">${p.enrolled}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                <i class="fas fa-chalkboard text-xs"></i>
              </div>
              <div>
                <p class="text-gray-500 text-xs">Sesiones</p>
                <p class="font-bold text-gray-800">${p.sessions}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button class="toggle-btn relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${p.active ? 'bg-green-500' : 'bg-gray-300'}" data-id="${p.id}" title="${p.active ? 'Pausar' : 'Activar'}">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${p.active ? 'translate-x-6' : 'translate-x-1'}"></span>
              </button>
            </div>
          </div>
        </div>
        <div class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button class="detail-btn text-sm text-primary-500 font-semibold hover:text-primary-600 transition-colors flex items-center gap-1" data-id="${p.id}">
            Ver detalles <i class="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>
    `;
  }

  function renderUI() {
    servGrid.innerHTML = serviciosDB.map(p => createCardHTML(p)).join('');
    updateStats();
  }

  // ==================== MODALS LOGIC ====================
  function openDetail(id) {
    const p = serviciosDB.find(pr => pr.id === id);
    if (!p) return;
    const cfg = colorConfig[p.color] || colorConfig.primary;
    const subtext = `Categoría: ${p.categoria}`;

    modalTitle.textContent = p.name;
    modalBody.innerHTML = `
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-lg ${cfg.icon} flex items-center justify-center">
          <i class="${p.icon}"></i>
        </div>
        <div>
          <span class="text-xs font-medium px-2 py-0.5 rounded ${p.active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${p.active ? 'Activo' : 'Pausado'}</span>
        </div>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-1">Descripción Larga</h4>
        <p class="text-gray-600 text-sm">${p.details || 'Sin detalles adicionales'}</p>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-1">Categoría</h4>
        <p class="text-gray-600 text-sm">${subtext}</p>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-blue-50 rounded-lg p-3 text-center">
          <p class="text-2xl font-bold text-primary-600">${p.enrolled}</p>
          <p class="text-xs text-gray-500">Inscritos</p>
        </div>
        <div class="bg-purple-50 rounded-lg p-3 text-center">
          <p class="text-2xl font-bold text-purple-600">${p.sessions}</p>
          <p class="text-xs text-gray-500">Sesiones</p>
        </div>
      </div>
    `;
    detailModal.classList.remove('hidden');
  }

  function closeAllModals() {
    detailModal.classList.add('hidden');
    formServModal.classList.add('hidden');
  }

  // Eventos de apertura de modales de creación
  addServBtn.addEventListener('click', () => {
    document.getElementById('form-servicio').reset();
    document.getElementById('form-servicio-title').textContent = 'Añadir Servicio';
    formServModal.classList.remove('hidden');
  });

  // Eventos de cierre en modales
  const closeSelectors = [
    '#close-program-modal', '#close-program-modal-btn',
    '#close-form-servicio', '#cancel-form-servicio-btn'
  ];
  closeSelectors.forEach(selector => {
    const el = document.querySelector(selector);
    if(el) el.addEventListener('click', (e) => {
      e.preventDefault();
      closeAllModals();
    });
  });

  // Cierre por clic fuera del modal
  [detailModal, formServModal].forEach(m => {
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
      const p = serviciosDB.find(pr => pr.id === id);
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
      document.getElementById('form-servicio-title').textContent = 'Editar Servicio';
      formServModal.classList.remove('hidden');
      return;
    }

    // Botón Eliminar
    const delBtn = e.target.closest('.delete-btn');
    if (delBtn) {
      if(confirm('¿Estás seguro que deseas eliminar este servicio? (Simulación visual)')) {
        const id = parseInt(delBtn.dataset.id);
        const idx = serviciosDB.findIndex(x => x.id === id);
        if(idx !== -1) serviciosDB.splice(idx, 1);
        renderUI();
      }
      return;
    }
  });

  // Eventos de guardado (Prevent default para que no recargue)
  document.getElementById('save-form-servicio-btn').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Simulación: Servicio guardado exitosamente.');
    closeAllModals();
  });

  // ==================== INIT ====================
  renderUI();
});
