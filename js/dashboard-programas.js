document.addEventListener('DOMContentLoaded', () => {
  // ==================== DATA ====================
  const programs = [
    {
      id: 1,
      name: 'Programa Lazos',
      icon: 'fas fa-hands-holding-child',
      color: 'secondary',
      description: 'Prevención de la delincuencia y conductas de riesgo en jóvenes mediante Terapia Multisistémica (MST).',
      target: 'NNA de 10 a 17 años con factores de riesgo',
      enrolled: 45,
      sessions: 128,
      active: true,
      details: 'Estrategia de intervención y prevención social de la Subsecretaría de Prevención del Delito (SPD). Trabaja con familias, entorno escolar y barrial para entregar herramientas de crianza y establecer límites.'
    },
    {
      id: 2,
      name: 'Programa Senda',
      icon: 'fas fa-shield-heart',
      color: 'accent',
      description: 'Prevención del consumo de alcohol y drogas. Promoción de estilos de vida saludables.',
      target: 'NNA y jóvenes de la comuna de Santiago',
      enrolled: 72,
      sessions: 96,
      active: true,
      details: 'Programa del Servicio Nacional para la Prevención y Rehabilitación del Consumo de Drogas y Alcohol. Enfoque territorial y comunitario con prevención en colegios, coordinación de redes locales y orientación de casos.'
    },
    {
      id: 3,
      name: 'Preuniversitario Gratuito',
      icon: 'fas fa-graduation-cap',
      color: 'primary',
      description: 'Preparación PAES en Competencia Lectora, Matemáticas (M1) y Ciencias Sociales.',
      target: 'Jóvenes de 16 a 20 años',
      enrolled: 156,
      sessions: 240,
      active: true,
      details: 'Programa de preparación gratuita para la PAES. Incluye tres módulos: Competencia Lectora, Matemática M1 y Ciencias Sociales/Historia. Clases presenciales en el Centro Comunitario.'
    },
    {
      id: 4,
      name: 'Curso de Inteligencia Artificial',
      icon: 'fas fa-robot',
      color: 'primary',
      description: 'Fundamentos de IA, machine learning y aplicaciones prácticas en la vida cotidiana.',
      target: 'Jóvenes de 18 a 29 años',
      enrolled: 38,
      sessions: 12,
      active: true,
      details: 'Curso introductorio de 12 sesiones sobre inteligencia artificial. Cubre conceptos básicos de machine learning, redes neuronales y herramientas de IA generativa aplicadas al trabajo y estudio.'
    },
    {
      id: 5,
      name: 'Curso de Excel',
      icon: 'fas fa-file-excel',
      color: 'secondary',
      description: 'Dominio de Excel desde nivel básico hasta intermedio. Fórmulas, funciones y tablas dinámicas.',
      target: 'Jóvenes de 16 a 29 años',
      enrolled: 64,
      sessions: 18,
      active: false,
      details: 'Capacitación práctica en Microsoft Excel. Abarca desde fórmulas básicas (SUMA, PROMEDIO, SI) hasta tablas dinámicas, gráficos y formato condicional. Orientado a mejorar la empleabilidad.'
    },
    {
      id: 6,
      name: 'Voluntariado Juvenil',
      icon: 'fas fa-hand-holding-heart',
      color: 'accent',
      description: 'Campañas de reforestación, visitas a hogares de ancianos, colectas de alimentos y más.',
      target: 'Jóvenes de 14 a 29 años',
      enrolled: 89,
      sessions: 34,
      active: true,
      details: 'Programa de acción social y comunitaria. Los jóvenes participan en actividades de voluntariado como limpieza de espacios públicos, reforestación urbana, visitas a hogares de adultos mayores y campañas solidarias.'
    }
  ];

  // ==================== COLOR CONFIG ====================
  const colorConfig = {
    primary: { bg: 'bg-blue-50', text: 'text-primary-600', icon: 'bg-blue-100 text-primary-600', border: 'border-primary-500' },
    secondary: { bg: 'bg-green-50', text: 'text-secondary-600', icon: 'bg-green-100 text-secondary-600', border: 'border-secondary-500' },
    accent: { bg: 'bg-orange-50', text: 'text-accent-600', icon: 'bg-orange-100 text-accent-600', border: 'border-accent-500' },
  };

  // ==================== DOM ====================
  const grid = document.getElementById('programs-grid');
  const activeCount = document.getElementById('active-count');
  const totalEnrolled = document.getElementById('total-enrolled');
  const totalSessions = document.getElementById('total-sessions');
  const pausedCount = document.getElementById('paused-count');

  const modal = document.getElementById('program-modal');
  const modalTitle = document.getElementById('program-modal-title');
  const modalBody = document.getElementById('program-modal-body');
  const closeModalBtn = document.getElementById('close-program-modal');
  const closeModalBtn2 = document.getElementById('close-program-modal-btn');

  // ==================== RENDER ====================
  function updateStats() {
    activeCount.textContent = programs.filter(p => p.active).length;
    pausedCount.textContent = programs.filter(p => !p.active).length;
    totalEnrolled.textContent = programs.reduce((sum, p) => sum + p.enrolled, 0);
    totalSessions.textContent = programs.reduce((sum, p) => sum + p.sessions, 0);
  }

  function renderPrograms() {
    grid.innerHTML = programs.map(p => {
      const cfg = colorConfig[p.color] || colorConfig.primary;
      return `
        <div class="bg-white rounded-xl border border-gray-100 overflow-hidden dashboard-card" data-id="${p.id}">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg ${cfg.icon} flex items-center justify-center flex-shrink-0">
                  <i class="${p.icon} text-xl"></i>
                </div>
                <div>
                  <h3 class="font-bold text-gray-800 text-lg">${p.name}</h3>
                  <p class="text-xs text-gray-500">${p.target}</p>
                </div>
              </div>
              <button class="toggle-btn relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${p.active ? 'bg-green-500' : 'bg-gray-300'}" data-id="${p.id}" title="${p.active ? 'Pausar programa' : 'Activar programa'}">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${p.active ? 'translate-x-6' : 'translate-x-1'}"></span>
              </button>
            </div>
            <p class="text-gray-600 text-sm mb-5">${p.description}</p>
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
                <div class="w-8 h-8 rounded-full ${p.active ? 'bg-green-50 text-green-500' : 'bg-yellow-50 text-yellow-500'} flex items-center justify-center">
                  <i class="fas ${p.active ? 'fa-circle-check' : 'fa-pause-circle'} text-xs"></i>
                </div>
                <div>
                  <p class="text-gray-500 text-xs">Estado</p>
                  <p class="font-bold ${p.active ? 'text-green-600' : 'text-yellow-600'}">${p.active ? 'Activo' : 'Pausado'}</p>
                </div>
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
    }).join('');

    updateStats();
  }

  // ==================== MODAL ====================
  function openDetail(id) {
    const p = programs.find(pr => pr.id === id);
    if (!p) return;
    const cfg = colorConfig[p.color] || colorConfig.primary;

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
        <h4 class="text-sm font-semibold text-gray-700 mb-1">Descripción</h4>
        <p class="text-gray-600 text-sm">${p.details}</p>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-1">Población Objetivo</h4>
        <p class="text-gray-600 text-sm">${p.target}</p>
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
    modal.classList.remove('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  // ==================== EVENTS ====================
  closeModalBtn.addEventListener('click', closeModal);
  closeModalBtn2.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  grid.addEventListener('click', (e) => {
    // Toggle
    const toggleBtn = e.target.closest('.toggle-btn');
    if (toggleBtn) {
      const id = parseInt(toggleBtn.dataset.id);
      const p = programs.find(pr => pr.id === id);
      if (p) {
        p.active = !p.active;
        renderPrograms();
      }
      return;
    }

    // Detail
    const detailBtn = e.target.closest('.detail-btn');
    if (detailBtn) {
      const id = parseInt(detailBtn.dataset.id);
      openDetail(id);
    }
  });

  // ==================== INIT ====================
  renderPrograms();
});
