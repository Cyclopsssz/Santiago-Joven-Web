import { supabase } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  let serviciosDB = [];

  const colorConfig = {
    primary: { bg: 'bg-blue-50', text: 'text-primary-600', icon: 'bg-blue-100 text-primary-600', border: 'border-primary-500' },
    secondary: { bg: 'bg-green-50', text: 'text-secondary-600', icon: 'bg-green-100 text-secondary-600', border: 'border-secondary-500' },
    accent: { bg: 'bg-orange-50', text: 'text-accent-600', icon: 'bg-orange-100 text-accent-600', border: 'border-accent-500' },
  };

  const servGrid = document.getElementById('servicios-grid');
  const activeCount = document.getElementById('active-count');
  const totalEnrolled = document.getElementById('total-enrolled');
  const totalSessions = document.getElementById('total-sessions');
  const pausedCount = document.getElementById('paused-count');

  const detailModal = document.getElementById('program-modal');
  const modalTitle = document.getElementById('program-modal-title');
  const modalBody = document.getElementById('program-modal-body');
  
  const formServModal = document.getElementById('form-servicio-modal');
  const addServBtn = document.getElementById('add-servicio-btn');
  const formTitle = document.getElementById('form-servicio-title');

  let currentEditId = null;

  async function fetchServicios() {
    const { data, error } = await supabase.from('servicios').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error cargando servicios:', error);
      return;
    }
    serviciosDB = data;
    renderUI();
  }

  function updateStats() {
    activeCount.textContent = serviciosDB.filter(p => p.activo).length;
    pausedCount.textContent = serviciosDB.filter(p => !p.activo).length;
    // Estos datos no existen en la BD actualmente, mostramos 0
    if(totalEnrolled) totalEnrolled.textContent = 0; 
    if(totalSessions) totalSessions.textContent = 0; 
  }

  function createCardHTML(p) {
    const cfg = colorConfig[p.color_tema] || colorConfig.primary;
    const subtext = (p.categoria || '').toUpperCase();
    
    return `
      <div class="bg-white rounded-xl border border-gray-100 overflow-hidden dashboard-card relative group" data-id="${p.id}">
        <div class="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button class="edit-btn w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors shadow-sm" data-id="${p.id}" title="Editar">
            <i class="fas fa-pen text-xs pointer-events-none"></i>
          </button>
          <button class="delete-btn w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors shadow-sm" data-id="${p.id}" title="Eliminar">
            <i class="fas fa-trash text-xs pointer-events-none"></i>
          </button>
        </div>

        <div class="p-6">
          <div class="flex items-start justify-between mb-4 pr-20">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg ${cfg.icon} flex items-center justify-center flex-shrink-0">
                <i class="${p.icono_fa} text-xl"></i>
              </div>
              <div>
                <h3 class="font-bold text-gray-800 text-lg line-clamp-1" title="${p.titulo}">${p.titulo}</h3>
                <p class="text-xs text-gray-500 line-clamp-1">${subtext}</p>
              </div>
            </div>
          </div>
          <p class="text-gray-600 text-sm mb-5 h-10 line-clamp-2">${p.descripcion || ''}</p>
          <div class="flex items-center gap-6 text-sm mb-4">
            <div class="flex items-center gap-2">
              <button class="toggle-btn relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${p.activo ? 'bg-green-500' : 'bg-gray-300'}" data-id="${p.id}" title="${p.activo ? 'Pausar' : 'Activar'}">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm pointer-events-none ${p.activo ? 'translate-x-6' : 'translate-x-1'}"></span>
              </button>
            </div>
          </div>
        </div>
        <div class="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button class="detail-btn text-sm text-primary-500 font-semibold hover:text-primary-600 transition-colors flex items-center gap-1" data-id="${p.id}">
            Ver detalles <i class="fas fa-arrow-right text-xs pointer-events-none"></i>
          </button>
        </div>
      </div>
    `;
  }

  function renderUI() {
    servGrid.innerHTML = serviciosDB.map(p => createCardHTML(p)).join('');
    updateStats();
  }

  function openDetail(id) {
    const p = serviciosDB.find(pr => pr.id === id);
    if (!p) return;
    const cfg = colorConfig[p.color_tema] || colorConfig.primary;
    const subtext = `Categoría: ${p.categoria || 'N/A'}`;

    modalTitle.textContent = p.titulo;
    modalBody.innerHTML = `
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-lg ${cfg.icon} flex items-center justify-center">
          <i class="${p.icono_fa}"></i>
        </div>
        <div>
          <span class="text-xs font-medium px-2 py-0.5 rounded ${p.activo ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${p.activo ? 'Activo' : 'Pausado'}</span>
        </div>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-1">Descripción</h4>
        <p class="text-gray-600 text-sm">${p.descripcion || 'Sin detalles'}</p>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-1">Categoría</h4>
        <p class="text-gray-600 text-sm">${subtext}</p>
      </div>
    `;
    detailModal.classList.remove('hidden');
  }

  function closeAllModals() {
    detailModal.classList.add('hidden');
    formServModal.classList.add('hidden');
    currentEditId = null;
  }

  addServBtn.addEventListener('click', () => {
    document.getElementById('form-servicio').reset();
    if(formTitle) formTitle.textContent = 'Añadir Servicio';
    currentEditId = null;
    formServModal.classList.remove('hidden');
  });

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

  [detailModal, formServModal].forEach(m => {
    if(m) {
        m.addEventListener('click', (e) => {
          if (e.target === m) closeAllModals();
        });
    }
  });

  document.addEventListener('click', async (e) => {
    const toggleBtn = e.target.closest('.toggle-btn');
    if (toggleBtn) {
      const id = toggleBtn.dataset.id;
      const p = serviciosDB.find(pr => pr.id === id);
      if (p) {
        const newStatus = !p.activo;
        const { error } = await supabase.from('servicios').update({ activo: newStatus }).eq('id', id);
        if (!error) fetchServicios();
      }
      return;
    }

    const detailBtn = e.target.closest('.detail-btn');
    if (detailBtn) {
      openDetail(detailBtn.dataset.id);
      return;
    }

    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
      const id = editBtn.dataset.id;
      const p = serviciosDB.find(pr => pr.id === id);
      if (p) {
        document.getElementById('serv-titulo').value = p.titulo || '';
        document.getElementById('serv-categoria').value = p.categoria || '';
        document.getElementById('serv-color').value = p.color_tema || 'primary';
        document.getElementById('serv-descripcion').value = p.descripcion || '';
        document.getElementById('serv-icono').value = p.icono_fa || '';
        document.getElementById('serv-destacado').checked = p.destacado || false;
        
        if(formTitle) formTitle.textContent = 'Editar Servicio';
        currentEditId = id;
        formServModal.classList.remove('hidden');
      }
      return;
    }

    const delBtn = e.target.closest('.delete-btn');
    if (delBtn) {
      if(confirm('¿Estás seguro que deseas eliminar este servicio?')) {
        const id = delBtn.dataset.id;
        const { error } = await supabase.from('servicios').delete().eq('id', id);
        if (!error) fetchServicios();
        else alert('Error al eliminar');
      }
      return;
    }
  });

  document.getElementById('save-form-servicio-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('serv-titulo').value;
    const categoria = document.getElementById('serv-categoria').value;
    const color_tema = document.getElementById('serv-color').value;
    const descripcion = document.getElementById('serv-descripcion').value;
    const icono_fa = document.getElementById('serv-icono').value || 'fas fa-star';
    const destacado = document.getElementById('serv-destacado').checked;

    if (!titulo) {
      alert('El título es requerido');
      return;
    }

    const payload = {
      titulo,
      categoria,
      color_tema,
      descripcion,
      icono_fa, destacado,
    };

    if (currentEditId) {
      const { error } = await supabase.from('servicios').update(payload).eq('id', currentEditId);
      if (error) alert('Error al actualizar servicio');
      else {
        closeAllModals();
        fetchServicios();
      }
    } else {
      payload.activo = true;
      const { error } = await supabase.from('servicios').insert([payload]);
      if (error) { alert('Error al crear servicio: ' + error.message); console.error(error); }
      else {
        closeAllModals();
        fetchServicios();
      }
    }
  });

  fetchServicios();
});




