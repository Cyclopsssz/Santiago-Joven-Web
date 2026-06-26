import { supabase } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  // ==================== DATA ====================
  let events = [];

  // ==================== DOM REFERENCES ====================
  const tableBody = document.getElementById('events-table-body');
  const eventCount = document.getElementById('event-count');
  const searchInput = document.getElementById('search-events');
  const typeFilter = document.getElementById('type-filter');
  const dateFilter = document.getElementById('date-filter');
  const statusFilter = document.getElementById('status-filter');
  const addEventBtn = document.getElementById('add-event-btn');

  // Modal Add/Edit
  const eventModal = document.getElementById('event-modal');
  const modalTitle = document.getElementById('modal-title');
  const eventForm = document.getElementById('event-form');
  const eventTitleInput = document.getElementById('event-title');
  const eventTypeInput = document.getElementById('event-type');
  const eventDateInput = document.getElementById('event-date');
  const eventDescripcionInput = document.getElementById('event-descripcion');
  const eventHasCupos = document.getElementById('event-has-cupos');
  const eventCupos = document.getElementById('event-cupos');
  const cuposContainer = document.getElementById('cupos-container');
  const eventEditId = document.getElementById('event-edit-id');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelModalBtn = document.getElementById('cancel-modal-btn');
  const saveEventBtn = document.getElementById('save-event-btn');
  const formStatus = document.getElementById('event-form-status');

  // Modal Delete
  const deleteModal = document.getElementById('delete-modal');
  const deleteEventName = document.getElementById('delete-event-name');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  let pendingDeleteId = null;

  // ==================== TYPE CONFIG ====================
  const typeConfig = {
    feria: { label: 'Feria', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    taller: { label: 'Taller', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    curso: { label: 'Curso', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    campana: { label: 'Campaña', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  };

  // ==================== FETCH DATA ====================
  async function fetchEvents() {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8"><i class="fas fa-spinner fa-spin text-primary-500 text-3xl"></i></td></tr>`;
    
    const { data, error } = await supabase
      .from('actividades')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">Error al cargar los eventos.</td></tr>`;
      return;
    }

    // Normalizar datos para la UI
    events = data.map(ev => ({
      id: ev.id,
      title: ev.titulo || 'Sin título',
      type: ev.tipo || 'feria',
      date: ev.fecha ? ev.fecha.split('T')[0] : '', // YYYY-MM-DD
      descripcion: ev.descripcion || '',
      hasCupos: !!ev.tiene_cupo,
      cupos: ev.cupos
    }));

    renderTable();
  }

  // ==================== RENDER TABLE ====================
  function renderTable() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterType = typeFilter.value;
    const filterDate = dateFilter.value;
    const filterStatus = statusFilter.value;

    const filtered = events.filter(ev => {
      const matchSearch = ev.title.toLowerCase().includes(searchTerm);
      const matchType = filterType === 'all' || ev.type === filterType;
      const matchDate = !filterDate || ev.date === filterDate;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(ev.date + 'T00:00:00');
      const isPast = eventDate < today;
      const isToday = eventDate.getTime() === today.getTime();
      
      let evStatus = 'proximo';
      if (isPast) evStatus = 'finalizado';
      else if (isToday) evStatus = 'hoy';
      
      const matchStatus = filterStatus === 'all' || evStatus === filterStatus;

      return matchSearch && matchType && matchDate && matchStatus;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-12 text-center">
            <div class="flex flex-col items-center gap-3 text-gray-400">
              <i class="fas fa-calendar-times text-4xl"></i>
              <p class="text-lg font-medium">No se encontraron eventos</p>
              <p class="text-sm">Intenta con otro filtro o agrega un nuevo evento.</p>
            </div>
          </td>
        </tr>
      `;
      eventCount.textContent = '0';
      return;
    }

    // Ordenar por fecha
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

    tableBody.innerHTML = filtered.map(ev => {
      const cfg = typeConfig[ev.type] || typeConfig.feria;
      const dateObj = new Date(ev.date + 'T12:00:00');
      const dateFormatted = dateObj.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(ev.date + 'T00:00:00');
      const isPast = eventDate < today;
      const isToday = eventDate.getTime() === today.getTime();

      return `
        <tr class="bg-white border-b hover:bg-gray-50 transition-colors" data-id="${ev.id}">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg ${cfg.bg} ${cfg.text} flex items-center justify-center flex-shrink-0">
                <i class="fas fa-calendar-day"></i>
              </div>
              <p class="font-semibold text-gray-900">${ev.title}</p>
            </div>
          </td>
          <td class="px-6 py-4">
            <span class="${cfg.bg} ${cfg.text} text-xs font-medium px-2.5 py-0.5 rounded border ${cfg.border}">${cfg.label}</span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <i class="fas fa-calendar-day mr-1 text-gray-400"></i>${dateFormatted}
          </td>
          <td class="px-6 py-4">
            ${ev.hasCupos ? `<span class="font-medium text-gray-800">${ev.cupos}</span>` : `<span class="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200">Liberado</span>`}
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center">
              <div class="h-2.5 w-2.5 rounded-full ${isPast ? 'bg-gray-400' : (isToday ? 'bg-yellow-500' : 'bg-green-500')} mr-2"></div>
              ${isPast ? 'Finalizado' : (isToday ? 'Es Hoy' : 'Próximo')}
            </div>
          </td>
          <td class="px-6 py-4 text-right space-x-2">
            <button class="details-btn text-gray-400 hover:text-blue-500 transition-colors" title="Ver Detalles" data-id="${ev.id}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="edit-btn text-gray-400 hover:text-primary-500 transition-colors" title="Editar" data-id="${ev.id}">
              <i class="fas fa-pen"></i>
            </button>
            <button class="delete-btn text-gray-400 hover:text-red-500 transition-colors" title="Eliminar" data-id="${ev.id}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    eventCount.textContent = filtered.length;
  }

  // ==================== MODAL HELPERS ====================
  function openModal() {
    eventModal.classList.remove('hidden');
  }

  function closeModal() {
    eventModal.classList.add('hidden');
    eventForm.reset();
    eventEditId.value = '';
    cuposContainer.classList.add('hidden');
    formStatus.classList.add('hidden');
    modalTitle.textContent = 'Añadir Evento';
    saveEventBtn.textContent = 'Guardar Evento';
    saveEventBtn.disabled = false;
  }

  function showFormStatus(msg, success) {
    formStatus.textContent = msg;
    formStatus.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
    formStatus.classList.add(success ? 'bg-green-100' : 'bg-red-100', success ? 'text-green-700' : 'text-red-700');
  }

  function openDeleteModal(id) {
    const ev = events.find(e => e.id === id);
    if (!ev) return;
    pendingDeleteId = id;
    deleteEventName.textContent = ev.title;
    deleteModal.classList.remove('hidden');
  }

  function closeDeleteModal() {
    deleteModal.classList.add('hidden');
    pendingDeleteId = null;
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = 'Eliminar Evento';
  }

  // ==================== EVENT HANDLERS ====================

  // Add
  addEventBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Añadir Evento';
    saveEventBtn.textContent = 'Guardar Evento';
    cuposContainer.classList.add('hidden');
    openModal();
  });

  // Toggle cupos visibility
  eventHasCupos.addEventListener('change', (e) => {
    if (e.target.checked) {
      cuposContainer.classList.remove('hidden');
      eventCupos.required = true;
    } else {
      cuposContainer.classList.add('hidden');
      eventCupos.required = false;
    }
  });

  // Close modals
  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);

  // Close on backdrop
  eventModal.addEventListener('click', (e) => {
    if (e.target === eventModal) closeModal();
  });
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  // Save (Add or Edit)
  saveEventBtn.addEventListener('click', async () => {
    const title = eventTitleInput.value.trim();
    const type = eventTypeInput.value;
    const date = eventDateInput.value;
    const descripcion = eventDescripcionInput.value.trim();
    const hasCupos = eventHasCupos.checked;
    const cupos = hasCupos ? parseInt(eventCupos.value) : null;

    if (!title || !type || !date || !descripcion || (hasCupos && !cupos)) {
      showFormStatus('Por favor completa todos los campos requeridos', false);
      return;
    }

    const editId = eventEditId.value; // puede ser UUID
    saveEventBtn.disabled = true;
    saveEventBtn.textContent = 'Guardando...';

    const payload = {
      titulo: title,
      tipo: type,
      fecha: date,
      descripcion: descripcion,
      tiene_cupo: hasCupos,
      cupos: cupos,
      created_at: new Date().toISOString()
    };

    if (editId) {
      // Edit existing
      const { error } = await supabase.from('actividades').update(payload).eq('id', editId);
      if (error) {
        showFormStatus('Error al actualizar: ' + error.message, false);
        saveEventBtn.disabled = false;
        saveEventBtn.textContent = 'Actualizar Evento';
        return;
      }
      showFormStatus('Evento actualizado exitosamente', true);
    } else {
      // Add new
      const { error } = await supabase.from('actividades').insert([payload]);
      if (error) {
        showFormStatus('Error al crear: ' + error.message, false);
        saveEventBtn.disabled = false;
        saveEventBtn.textContent = 'Guardar Evento';
        return;
      }
      showFormStatus('Evento añadido exitosamente', true);
    }

    await fetchEvents();
    setTimeout(() => {
      closeModal();
    }, 1000);
  });

  // Confirm delete
  confirmDeleteBtn.addEventListener('click', async () => {
    if (pendingDeleteId !== null) {
      confirmDeleteBtn.disabled = true;
      confirmDeleteBtn.textContent = 'Eliminando...';
      
      const { error } = await supabase.from('actividades').delete().eq('id', pendingDeleteId);
      if (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el evento');
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Eliminar Evento';
        return;
      }

      await fetchEvents();
      closeDeleteModal();
    }
  });

  // Edit / Delete via table delegation
  tableBody.addEventListener('click', (e) => {
    const detailsBtn = e.target.closest('.details-btn');
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    if (detailsBtn) {
      const id = detailsBtn.dataset.id;
      window.location.href = `dashboard-calendario-detalles.html?id=${id}`;
    }

    if (editBtn) {
      const id = editBtn.dataset.id;
      const ev = events.find(e => e.id === id);
      if (!ev) return;

      modalTitle.textContent = 'Editar Evento';
      saveEventBtn.textContent = 'Actualizar Evento';
      eventTitleInput.value = ev.title;
      eventTypeInput.value = ev.type;
      eventDateInput.value = ev.date;
      eventDescripcionInput.value = ev.descripcion;
      eventEditId.value = ev.id;
      
      eventHasCupos.checked = !!ev.hasCupos;
      if (ev.hasCupos) {
        cuposContainer.classList.remove('hidden');
        eventCupos.value = ev.cupos;
        eventCupos.required = true;
      } else {
        cuposContainer.classList.add('hidden');
        eventCupos.value = '';
        eventCupos.required = false;
      }
      
      openModal();
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      openDeleteModal(id);
    }
  });

  // Filters
  searchInput.addEventListener('input', renderTable);
  typeFilter.addEventListener('change', renderTable);
  dateFilter.addEventListener('change', renderTable);
  statusFilter.addEventListener('change', renderTable);

  // ==================== INIT ====================
  await fetchEvents();
});
