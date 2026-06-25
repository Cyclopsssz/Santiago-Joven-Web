import { supabase } from './api.js';

function initDashboard() {
  let eventosDB = [];
  let inscripcionesDB = [];
  let currentEditingId = null;

  // ==================== COLOR CONFIG ====================
  const colorConfig = {
    primary: { bg: 'bg-blue-50', text: 'text-primary-600', icon: 'bg-blue-100 text-primary-600', border: 'border-primary-500' },
    secondary: { bg: 'bg-green-50', text: 'text-secondary-600', icon: 'bg-green-100 text-secondary-600', border: 'border-secondary-500' },
    accent: { bg: 'bg-orange-50', text: 'text-accent-600', icon: 'bg-orange-100 text-accent-600', border: 'border-accent-500' },
  };

  const iconsByColor = {
    primary: 'fas fa-hands-helping',
    secondary: 'fas fa-tree',
    accent: 'fas fa-bullhorn'
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
  const btnSave = document.getElementById('save-form-evento-btn');

  // ==================== DATA FETCH ====================
  async function loadData() {
    if (!eventosGrid) return;
    eventosGrid.innerHTML = '<div class="col-span-2 text-center py-10 text-gray-500"><i class="fas fa-spinner fa-spin text-3xl"></i> Cargando eventos...</div>';
    try {
      // 1. Obtener eventos
      const { data: eventos, error: errEventos } = await supabase
        .from('eventos_voluntariado')
        .select('*')
        .order('fecha', { ascending: true });
      if (errEventos) throw errEventos;
      eventosDB = eventos || [];

      // 2. Obtener inscripciones
      const { data: inscripciones, error: errInsc } = await supabase
        .from('inscripciones_voluntariado')
        .select('evento_id');
      if (errInsc) throw errInsc;
      
      inscripcionesDB = inscripciones || [];

      renderUI();
    } catch (err) {
      console.error(err);
      eventosGrid.innerHTML = '<div class="col-span-2 text-center py-10 text-red-500">Error al cargar los datos. Revisa los permisos de Supabase.</div>';
    }
  }

  // ==================== RENDER ====================
  function getEnrolledCount(eventoId) {
    return inscripcionesDB.filter(i => i.evento_id === eventoId).length;
  }

  function updateStats() {
    if (activeCount) activeCount.textContent = eventosDB.filter(p => p.activo).length;
    if (totalEnrolled) totalEnrolled.textContent = inscripcionesDB.length;
  }

  function createCardHTML(p) {
    const cfg = colorConfig[p.color] || colorConfig.accent;
    const iconClass = iconsByColor[p.color] || iconsByColor.accent;
    const dateFormatted = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
    const enrolled = getEnrolledCount(p.id);
    const capacityText = p.cupos ? `${enrolled}/${p.cupos}` : `${enrolled} (Sin límite)`;
    
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
                <i class="${iconClass} text-xl"></i>
              </div>
              <div>
                <h3 class="font-bold text-gray-800 text-lg line-clamp-1" title="${p.titulo}">${p.titulo}</h3>
                <p class="text-xs text-gray-500 line-clamp-1"><i class="fas fa-calendar-alt mr-1"></i> ${dateFormatted} • ${p.hora_inicio.slice(0,5)}</p>
              </div>
            </div>
          </div>
          <p class="text-gray-600 text-sm mb-5 h-10 line-clamp-2">${p.descripcion || 'Sin descripción'}</p>
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
                <p class="text-gray-500 text-xs line-clamp-1 max-w-[100px]" title="${p.lugar}">${p.lugar}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 ml-auto">
              <button class="toggle-btn relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${p.activo ? 'bg-green-500' : 'bg-gray-300'}" data-id="${p.id}" title="${p.activo ? 'Pausar Inscripciones' : 'Activar Inscripciones'}">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${p.activo ? 'translate-x-6' : 'translate-x-1'}"></span>
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
    if (!eventosGrid) return;
    if (eventosDB.length === 0) {
      eventosGrid.innerHTML = '<div class="col-span-2 text-center py-10 text-gray-500">No hay eventos creados. Añade uno nuevo.</div>';
    } else {
      eventosGrid.innerHTML = eventosDB.map(p => createCardHTML(p)).join('');
    }
    updateStats();
  }

  // ==================== MODALS LOGIC ====================
  function openDetail(id) {
    const p = eventosDB.find(pr => pr.id === id);
    if (!p) return;
    const cfg = colorConfig[p.color] || colorConfig.accent;
    const iconClass = iconsByColor[p.color] || iconsByColor.accent;
    const dateFormatted = new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    const enrolled = getEnrolledCount(p.id);

    if (modalTitle) modalTitle.textContent = p.titulo;
    if (modalBody) modalBody.innerHTML = `
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-lg ${cfg.icon} flex items-center justify-center text-xl">
          <i class="${iconClass}"></i>
        </div>
        <div>
          <span class="text-xs font-medium px-2 py-0.5 rounded ${p.activo ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${p.activo ? 'Inscripciones Abiertas' : 'Inscripciones Cerradas'}</span>
        </div>
      </div>
      
      <div class="space-y-3">
        <div>
          <h4 class="text-sm font-semibold text-gray-700 flex items-center gap-2"><i class="fas fa-clock text-gray-400"></i> Cuándo</h4>
          <p class="text-gray-600 text-sm ml-6">${dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1)}</p>
          <p class="text-gray-600 text-sm ml-6">${p.hora_inicio.slice(0,5)} a ${p.hora_fin ? p.hora_fin.slice(0,5) : 'Término por definir'}</p>
        </div>
        
        <div>
          <h4 class="text-sm font-semibold text-gray-700 flex items-center gap-2"><i class="fas fa-map-pin text-gray-400"></i> Dónde</h4>
          <p class="text-gray-600 text-sm ml-6">${p.lugar}</p>
        </div>

        <div>
          <h4 class="text-sm font-semibold text-gray-700 flex items-center gap-2"><i class="fas fa-info-circle text-gray-400"></i> Descripción y Requisitos</h4>
          <p class="text-gray-600 text-sm ml-6 whitespace-pre-wrap">${p.descripcion || 'Sin descripción detallada.'}</p>
        </div>
      </div>

      <div class="mt-6 bg-blue-50 rounded-lg p-4 flex justify-between items-center">
        <div>
          <p class="text-sm font-semibold text-primary-700">Voluntarios Inscritos</p>
          <p class="text-xs text-primary-600">${p.cupos ? 'Cupo máximo: ' + p.cupos : 'Sin límite de cupos'}</p>
        </div>
        <div class="text-2xl font-black text-primary-600">
          ${enrolled}
        </div>
      </div>
    `;
    if (detailModal) detailModal.classList.remove('hidden');
  }

  function closeAllModals() {
    if (detailModal) detailModal.classList.add('hidden');
    if (formEventoModal) formEventoModal.classList.add('hidden');
    currentEditingId = null;
  }

  // Eventos de apertura de modales de creación
  if (addEventoBtn) {
    addEventoBtn.addEventListener('click', () => {
      if (form) form.reset();
      currentEditingId = null;
      if (formTitle) formTitle.textContent = 'Añadir Evento';
      if (formEventoModal) formEventoModal.classList.remove('hidden');
    });
  }

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
    if (m) {
      m.addEventListener('click', (e) => {
        if (e.target === m) closeAllModals();
      });
    }
  });

  // ==================== DELEGATED EVENTS ====================
  document.addEventListener('click', async (e) => {
    // Toggle Activo/Inactivo
    const toggleBtn = e.target.closest('.toggle-btn');
    if (toggleBtn) {
      const id = toggleBtn.dataset.id;
      const p = eventosDB.find(pr => pr.id === id);
      if (p) {
        const newVal = !p.activo;
        try {
            await supabase.from('eventos_voluntariado').update({ activo: newVal }).eq('id', id);
            p.activo = newVal;
            renderUI();
        } catch(err) {
            console.error(err);
        }
      }
      return;
    }

    // Ver Detalles
    const detailBtn = e.target.closest('.detail-btn');
    if (detailBtn) {
      openDetail(detailBtn.dataset.id);
      return;
    }

    // Botón Editar
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
      const id = editBtn.dataset.id;
      const p = eventosDB.find(pr => pr.id === id);
      if(p) {
          if (formTitle) formTitle.textContent = 'Editar Evento';
          currentEditingId = id;
          const setVal = (sel, val) => { const el = document.getElementById(sel); if(el) el.value = val; };
          setVal('ev-titulo', p.titulo);
          setVal('ev-fecha', p.fecha);
          setVal('ev-hora-inicio', p.hora_inicio.slice(0,5));
          setVal('ev-hora-fin', p.hora_fin ? p.hora_fin.slice(0,5) : '');
          setVal('ev-lugar', p.lugar);
          setVal('ev-descripcion', p.descripcion || '');
          setVal('ev-cupos', p.cupos || '');
          setVal('ev-color', p.color || 'accent');
          if (formEventoModal) formEventoModal.classList.remove('hidden');
      }
      return;
    }

    // Botón Eliminar
    const delBtn = e.target.closest('.delete-btn');
    if (delBtn) {
      if(confirm('¿Estás seguro que deseas eliminar este evento? Se borrarán también las inscripciones asociadas.')) {
        const id = delBtn.dataset.id;
        try {
            if (btnSave) btnSave.disabled = true;
            await supabase.from('eventos_voluntariado').delete().eq('id', id);
            await loadData();
        } catch(err) {
            console.error(err);
            alert('Error eliminando');
        } finally {
            if (btnSave) btnSave.disabled = false;
        }
      }
      return;
    }
  });

  // Eventos de guardado
  if (btnSave) {
    btnSave.addEventListener('click', async (e) => {
      e.preventDefault();
      if (form && !form.checkValidity()) {
          form.reportValidity();
          return;
      }

      const getVal = (id) => document.getElementById(id)?.value;
      const payload = {
          titulo: getVal('ev-titulo'),
          fecha: getVal('ev-fecha'),
          hora_inicio: getVal('ev-hora-inicio') + ':00',
          hora_fin: getVal('ev-hora-fin') ? getVal('ev-hora-fin') + ':00' : null,
          lugar: getVal('ev-lugar'),
          descripcion: getVal('ev-descripcion'),
          cupos: getVal('ev-cupos') ? parseInt(getVal('ev-cupos')) : null,
          color: getVal('ev-color') || 'accent'
      };

      btnSave.textContent = 'Guardando...';
      btnSave.disabled = true;

      try {
          if (currentEditingId) {
              await supabase.from('eventos_voluntariado').update(payload).eq('id', currentEditingId);
          } else {
              payload.activo = true;
              await supabase.from('eventos_voluntariado').insert([payload]);
          }
          closeAllModals();
          await loadData();
      } catch(err) {
          console.error(err);
          alert('Hubo un error al guardar.');
      } finally {
          btnSave.textContent = 'Guardar Cambios';
          btnSave.disabled = false;
      }
    });
  }

  // ==================== INIT ====================
  loadData();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
