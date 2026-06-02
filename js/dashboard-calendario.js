document.addEventListener('DOMContentLoaded', () => {
  // ==================== DATA ====================
  const events = [
    { id: 1, title: 'Feria Vocacional 2025', type: 'feria', date: '2025-11-10', active: true },
    { id: 2, title: 'Taller de Liderazgo Juvenil', type: 'taller', date: '2025-11-14', active: true },
    { id: 3, title: 'Inicio Curso de IA', type: 'curso', date: '2025-11-20', active: true },
    { id: 4, title: 'Campaña Solidaria Navideña', type: 'campana', date: '2025-11-28', active: true },
    { id: 5, title: 'Taller de Oratoria', type: 'taller', date: '2025-12-02', active: true },
    { id: 6, title: 'Feria de Emprendimiento', type: 'feria', date: '2025-12-05', active: true },
  ];
  let nextId = 7;

  // ==================== DOM REFERENCES ====================
  const tableBody = document.getElementById('events-table-body');
  const eventCount = document.getElementById('event-count');
  const searchInput = document.getElementById('search-events');
  const typeFilter = document.getElementById('type-filter');
  const addEventBtn = document.getElementById('add-event-btn');

  // Modal Add/Edit
  const eventModal = document.getElementById('event-modal');
  const modalTitle = document.getElementById('modal-title');
  const eventForm = document.getElementById('event-form');
  const eventTitleInput = document.getElementById('event-title');
  const eventTypeInput = document.getElementById('event-type');
  const eventDateInput = document.getElementById('event-date');
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

  // ==================== RENDER TABLE ====================
  function renderTable() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterType = typeFilter.value;

    const filtered = events.filter(ev => {
      const matchSearch = ev.title.toLowerCase().includes(searchTerm);
      const matchType = filterType === 'all' || ev.type === filterType;
      return matchSearch && matchType;
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
            <div class="flex items-center">
              <div class="h-2.5 w-2.5 rounded-full ${isPast ? 'bg-gray-400' : 'bg-green-500'} mr-2"></div>
              ${isPast ? 'Finalizado' : 'Próximo'}
            </div>
          </td>
          <td class="px-6 py-4 text-right space-x-2">
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
    formStatus.classList.add('hidden');
    modalTitle.textContent = 'Añadir Evento';
    saveEventBtn.textContent = 'Guardar Evento';
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
  }

  // ==================== EVENT HANDLERS ====================

  // Add
  addEventBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Añadir Evento';
    saveEventBtn.textContent = 'Guardar Evento';
    openModal();
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
  saveEventBtn.addEventListener('click', () => {
    const title = eventTitleInput.value.trim();
    const type = eventTypeInput.value;
    const date = eventDateInput.value;

    if (!title || !type || !date) {
      showFormStatus('Por favor completa todos los campos', false);
      return;
    }

    const editId = parseInt(eventEditId.value);

    if (editId) {
      // Edit existing
      const ev = events.find(e => e.id === editId);
      if (ev) {
        ev.title = title;
        ev.type = type;
        ev.date = date;
      }
      showFormStatus('Evento actualizado exitosamente', true);
    } else {
      // Add new
      events.push({ id: nextId++, title, type, date, active: true });
      showFormStatus('Evento añadido exitosamente', true);
    }

    setTimeout(() => {
      closeModal();
      renderTable();
    }, 1000);
  });

  // Confirm delete
  confirmDeleteBtn.addEventListener('click', () => {
    if (pendingDeleteId !== null) {
      const idx = events.findIndex(e => e.id === pendingDeleteId);
      if (idx !== -1) events.splice(idx, 1);
      closeDeleteModal();
      renderTable();
    }
  });

  // Edit / Delete via table delegation
  tableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');

    if (editBtn) {
      const id = parseInt(editBtn.dataset.id);
      const ev = events.find(e => e.id === id);
      if (!ev) return;

      modalTitle.textContent = 'Editar Evento';
      saveEventBtn.textContent = 'Actualizar Evento';
      eventTitleInput.value = ev.title;
      eventTypeInput.value = ev.type;
      eventDateInput.value = ev.date;
      eventEditId.value = ev.id;
      openModal();
    }

    if (deleteBtn) {
      const id = parseInt(deleteBtn.dataset.id);
      openDeleteModal(id);
    }
  });

  // Filters
  searchInput.addEventListener('input', renderTable);
  typeFilter.addEventListener('change', renderTable);

  // ==================== INIT ====================
  renderTable();
});
