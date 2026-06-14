import { supabase } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  let programasDB = [];

  const colorConfig = {
    primary: { bg: 'bg-blue-50', text: 'text-primary-600', icon: 'bg-blue-100 text-primary-600', border: 'border-primary-500' },
    secondary: { bg: 'bg-green-50', text: 'text-secondary-600', icon: 'bg-green-100 text-secondary-600', border: 'border-secondary-500' },
    accent: { bg: 'bg-orange-50', text: 'text-accent-600', icon: 'bg-orange-100 text-accent-600', border: 'border-accent-500' },
  };

  const progGrid = document.getElementById('programas-grid');
  const activeCount = document.getElementById('active-count');
  const totalEnrolled = document.getElementById('total-enrolled');
  const totalSessions = document.getElementById('total-sessions');
  const pausedCount = document.getElementById('paused-count');

  const detailModal = document.getElementById('program-modal');
  const modalTitle = document.getElementById('program-modal-title');
  const modalBody = document.getElementById('program-modal-body');
  
  const formProgModal = document.getElementById('form-programa-modal');
  const addProgBtn = document.getElementById('add-programa-btn');
  const formTitle = document.getElementById('form-programa-title');

  let currentEditId = null;

  async function fetchProgramas() {
    const { data, error } = await supabase.from('programas').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error cargando programas:', error);
      return;
    }
    programasDB = data;
    renderUI();
  }

  function updateStats() {
    activeCount.textContent = programasDB.filter(p => p.activo).length;
    pausedCount.textContent = programasDB.filter(p => !p.activo).length;
    if(totalEnrolled) totalEnrolled.textContent = 0; 
    if(totalSessions) totalSessions.textContent = 0; 
  }

  function createCardHTML(p) {
    const cfg = colorConfig[p.color_tema] || colorConfig.primary;
    
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
              </div>
            </div>
          </div>
          <p class="text-gray-600 text-sm mb-5 h-10 line-clamp-2">${p.descripcion_corta || ''}</p>
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
    progGrid.innerHTML = programasDB.map(p => createCardHTML(p)).join('');
    updateStats();
  }

  function openDetail(id) {
    const p = programasDB.find(pr => pr.id === id);
    if (!p) return;
    const cfg = colorConfig[p.color_tema] || colorConfig.primary;

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
        <h4 class="text-sm font-semibold text-gray-700 mb-1">Descripción Corta</h4>
        <p class="text-gray-600 text-sm mb-2">${p.descripcion_corta || 'Sin resumen'}</p>
        <h4 class="text-sm font-semibold text-gray-700 mb-1">Descripción Larga</h4>
        <p class="text-gray-600 text-sm">${p.descripcion_larga || 'Sin detalles adicionales'}</p>
      </div>
    `;
    detailModal.classList.remove('hidden');
  }

  function closeAllModals() {
    detailModal.classList.add('hidden');
    formProgModal.classList.add('hidden');
    currentEditId = null;
  }

  addProgBtn.addEventListener('click', () => {
    document.getElementById('form-programa').reset();
    if(formTitle) formTitle.textContent = 'Añadir Programa';
    currentEditId = null;
    formProgModal.classList.remove('hidden');
  });

  const closeSelectors = [
    '#close-program-modal', '#close-program-modal-btn',
    '#close-form-programa', '#cancel-form-programa-btn'
  ];
  closeSelectors.forEach(selector => {
    const el = document.querySelector(selector);
    if(el) el.addEventListener('click', (e) => {
      e.preventDefault();
      closeAllModals();
    });
  });

  [detailModal, formProgModal].forEach(m => {
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
      const p = programasDB.find(pr => pr.id === id);
      if (p) {
        const newStatus = !p.activo;
        const { error } = await supabase.from('programas').update({ activo: newStatus }).eq('id', id);
        if (!error) fetchProgramas();
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
      const p = programasDB.find(pr => pr.id === id);
      if (p) {
        document.getElementById('prog-titulo').value = p.titulo || '';
        document.getElementById('prog-desc-corta').value = p.descripcion_corta || '';
        document.getElementById('prog-desc-larga').value = p.descripcion_larga || '';
        document.getElementById('prog-icono').value = p.icono_fa || '';
        document.getElementById('prog-color').value = p.color_tema || 'primary';
        
        if(formTitle) formTitle.textContent = 'Editar Programa';
        currentEditId = id;
        formProgModal.classList.remove('hidden');
      }
      return;
    }

    const delBtn = e.target.closest('.delete-btn');
    if (delBtn) {
      if(confirm('¿Estás seguro que deseas eliminar este programa?')) {
        const id = delBtn.dataset.id;
        const { error } = await supabase.from('programas').delete().eq('id', id);
        if (!error) fetchProgramas();
        else alert('Error al eliminar');
      }
      return;
    }
  });

  document.getElementById('save-form-programa-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('prog-titulo').value;
    const descripcion_corta = document.getElementById('prog-desc-corta').value;
    const descripcion_larga = document.getElementById('prog-desc-larga').value;
    const icono_fa = document.getElementById('prog-icono').value || 'fas fa-star';
    const color_tema = document.getElementById('prog-color').value;

    if (!titulo || !descripcion_corta) {
      alert('El título y descripción corta son requeridos');
      return;
    }

    const payload = {
      titulo,
      descripcion_corta,
      descripcion_larga,
      icono_fa,
      color_tema,
    };

    if (currentEditId) {
      const { error } = await supabase.from('programas').update(payload).eq('id', currentEditId);
      if (error) alert('Error al actualizar programa');
      else {
        closeAllModals();
        fetchProgramas();
      }
    } else {
      payload.activo = true;
      const { error } = await supabase.from('programas').insert([payload]);
      if (error) { alert('Error al crear programa: ' + error.message); console.error(error); }
      else {
        closeAllModals();
        fetchProgramas();
      }
    }
  });

  fetchProgramas();
});

