import { supabase } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  let noticiasDB = [];

  const noticiasGrid = document.getElementById('noticias-grid');
  const activeCount = document.getElementById('active-count');
  const hiddenCount = document.getElementById('hidden-count');

  const detailModal = document.getElementById('noticia-modal');
  const modalTitle = document.getElementById('noticia-modal-title');
  const modalBody = document.getElementById('noticia-modal-body');

  const formNoticiaModal = document.getElementById('form-noticia-modal');
  const addNoticiaBtn = document.getElementById('add-noticia-btn');
  const formTitle = document.getElementById('form-noticia-title');

  let currentEditId = null;

  // --- FETCH ---
  async function fetchNoticias() {
    const { data, error } = await supabase.from('noticias').select('*').order('fecha', { ascending: false });
    if (error) {
      console.error('Error cargando noticias:', error);
      return;
    }
    noticiasDB = data;
    renderUI();
  }

  // --- STATS ---
  function updateStats() {
    activeCount.textContent = noticiasDB.filter(n => n.activo).length;
    hiddenCount.textContent = noticiasDB.filter(n => !n.activo).length;
  }

  // --- RENDER CARDS ---
  function formatFecha(fechaStr) {
    if (!fechaStr) return 'Sin fecha';
    const fecha = new Date(fechaStr + 'T12:00:00');
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${fecha.getDate()} ${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }

  function createCardHTML(n) {
    const imagenPreview = n.imagen_url
      ? `<div class="h-40 w-full overflow-hidden rounded-t-xl">
           <img src="${n.imagen_url}" alt="${n.titulo}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<div class=\\'h-full w-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center\\'><i class=\\'fas fa-newspaper text-white text-4xl\\'></i></div>'">
         </div>`
      : `<div class="h-40 w-full overflow-hidden rounded-t-xl">
           <div class="h-full w-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
             <i class="fas fa-newspaper text-white text-4xl"></i>
           </div>
         </div>`;

    return `
      <div class="bg-white rounded-xl border border-gray-100 overflow-hidden dashboard-card relative group" data-id="${n.id}">
        <div class="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button class="edit-btn w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors shadow-sm" data-id="${n.id}" title="Editar">
            <i class="fas fa-pen text-xs pointer-events-none"></i>
          </button>
          <button class="delete-btn w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors shadow-sm" data-id="${n.id}" title="Eliminar">
            <i class="fas fa-trash text-xs pointer-events-none"></i>
          </button>
        </div>

        ${imagenPreview}

        <div class="p-5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold text-gray-500"><i class="far fa-calendar-alt mr-1"></i>${formatFecha(n.fecha)}</span>
            <button class="toggle-btn relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${n.activo ? 'bg-green-500' : 'bg-gray-300'}" data-id="${n.id}" title="${n.activo ? 'Ocultar' : 'Publicar'}">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm pointer-events-none ${n.activo ? 'translate-x-6' : 'translate-x-1'}"></span>
            </button>
          </div>
          <h3 class="font-bold text-gray-800 text-lg line-clamp-2 mb-2" title="${n.titulo}">${n.titulo}</h3>
          <p class="text-gray-600 text-sm mb-4 line-clamp-2">${n.descripcion || ''}</p>
          ${n.enlace ? `<a href="${n.enlace}" target="_blank" class="text-xs text-primary-500 hover:underline"><i class="fas fa-external-link-alt mr-1"></i>Enlace externo</a>` : ''}
        </div>
        <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button class="detail-btn text-sm text-primary-500 font-semibold hover:text-primary-600 transition-colors flex items-center gap-1" data-id="${n.id}">
            Ver detalles <i class="fas fa-arrow-right text-xs pointer-events-none"></i>
          </button>
        </div>
      </div>
    `;
  }

  function renderUI() {
    if (noticiasDB.length === 0) {
      noticiasGrid.innerHTML = `
        <div class="col-span-full text-center py-16">
          <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-newspaper text-3xl text-gray-400"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-1">No hay noticias aún</h3>
          <p class="text-gray-500 text-sm">Haz clic en "Nueva Noticia" para crear la primera.</p>
        </div>
      `;
    } else {
      noticiasGrid.innerHTML = noticiasDB.map(n => createCardHTML(n)).join('');
    }
    updateStats();
  }

  // --- DETAIL MODAL ---
  function openDetail(id) {
    const n = noticiasDB.find(item => item.id === id);
    if (!n) return;

    modalTitle.textContent = n.titulo;
    modalBody.innerHTML = `
      ${n.imagen_url ? `<img src="${n.imagen_url}" alt="${n.titulo}" class="w-full h-48 object-cover rounded-lg mb-4" onerror="this.style.display='none'">` : ''}
      <div class="flex items-center gap-3 mb-3">
        <span class="text-sm font-medium text-gray-500"><i class="far fa-calendar-alt mr-1"></i>${formatFecha(n.fecha)}</span>
        <span class="text-xs font-medium px-2 py-0.5 rounded ${n.activo ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${n.activo ? 'Publicada' : 'Oculta'}</span>
      </div>
      <div>
        <h4 class="text-sm font-semibold text-gray-700 mb-1">Descripción</h4>
        <p class="text-gray-600 text-sm whitespace-pre-line">${n.descripcion || 'Sin descripción'}</p>
      </div>
      ${n.enlace ? `<div class="mt-3"><h4 class="text-sm font-semibold text-gray-700 mb-1">Enlace</h4><a href="${n.enlace}" target="_blank" class="text-sm text-primary-500 hover:underline break-all">${n.enlace}</a></div>` : ''}
    `;
    detailModal.classList.remove('hidden');
  }

  // --- CLOSE MODALS ---
  function closeAllModals() {
    detailModal.classList.add('hidden');
    formNoticiaModal.classList.add('hidden');
    currentEditId = null;
  }

  // --- ADD BUTTON ---
  addNoticiaBtn.addEventListener('click', () => {
    document.getElementById('form-noticia').reset();
    // Set default date to today
    document.getElementById('noticia-fecha').value = new Date().toISOString().split('T')[0];
    if (formTitle) formTitle.textContent = 'Añadir Noticia';
    currentEditId = null;
    formNoticiaModal.classList.remove('hidden');
  });

  // --- CLOSE BUTTONS ---
  const closeSelectors = [
    '#close-noticia-modal', '#close-noticia-modal-btn',
    '#close-form-noticia', '#cancel-form-noticia-btn'
  ];
  closeSelectors.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) el.addEventListener('click', (e) => {
      e.preventDefault();
      closeAllModals();
    });
  });

  [detailModal, formNoticiaModal].forEach(m => {
    if (m) {
      m.addEventListener('click', (e) => {
        if (e.target === m) closeAllModals();
      });
    }
  });

  // --- DELEGATED CLICK EVENTS ---
  document.addEventListener('click', async (e) => {
    // Toggle activo
    const toggleBtn = e.target.closest('.toggle-btn');
    if (toggleBtn) {
      const id = toggleBtn.dataset.id;
      const n = noticiasDB.find(item => item.id === id);
      if (n) {
        const newStatus = !n.activo;
        const { error } = await supabase.from('noticias').update({ activo: newStatus }).eq('id', id);
        if (!error) fetchNoticias();
      }
      return;
    }

    // Detail
    const detailBtn = e.target.closest('.detail-btn');
    if (detailBtn) {
      openDetail(detailBtn.dataset.id);
      return;
    }

    // Edit
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
      const id = editBtn.dataset.id;
      const n = noticiasDB.find(item => item.id === id);
      if (n) {
        document.getElementById('noticia-titulo').value = n.titulo || '';
        document.getElementById('noticia-descripcion').value = n.descripcion || '';
        document.getElementById('noticia-fecha').value = n.fecha || '';
        document.getElementById('noticia-imagen').value = n.imagen_url || '';
        document.getElementById('noticia-enlace').value = n.enlace || '';

        if (formTitle) formTitle.textContent = 'Editar Noticia';
        currentEditId = id;
        formNoticiaModal.classList.remove('hidden');
      }
      return;
    }

    // Delete
    const delBtn = e.target.closest('.delete-btn');
    if (delBtn) {
      if (confirm('¿Estás seguro que deseas eliminar esta noticia?')) {
        const id = delBtn.dataset.id;
        const { error } = await supabase.from('noticias').delete().eq('id', id);
        if (!error) fetchNoticias();
        else alert('Error al eliminar');
      }
      return;
    }
  });

  // --- SAVE ---
  document.getElementById('save-form-noticia-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    const titulo = document.getElementById('noticia-titulo').value.trim();
    const descripcion = document.getElementById('noticia-descripcion').value.trim();
    const fecha = document.getElementById('noticia-fecha').value;
    const imagen_url = document.getElementById('noticia-imagen').value.trim() || null;
    const enlace = document.getElementById('noticia-enlace').value.trim() || null;

    if (!titulo || !descripcion || !fecha) {
      alert('El titular, descripción y fecha son requeridos');
      return;
    }

    const payload = {
      titulo,
      descripcion,
      fecha,
      imagen_url,
      enlace,
    };

    if (currentEditId) {
      const { error } = await supabase.from('noticias').update(payload).eq('id', currentEditId);
      if (error) alert('Error al actualizar noticia');
      else {
        closeAllModals();
        fetchNoticias();
      }
    } else {
      payload.activo = true;
      const { error } = await supabase.from('noticias').insert([payload]);
      if (error) { alert('Error al crear noticia: ' + error.message); console.error(error); }
      else {
        closeAllModals();
        fetchNoticias();
      }
    }
  });

  // --- INIT ---
  fetchNoticias();
});
