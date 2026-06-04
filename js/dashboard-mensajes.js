document.addEventListener('DOMContentLoaded', () => {
  // ==================== DATA MOCKUP ====================
  let messages = [
    {
      id: 1,
      nombre: 'María González',
      email: 'maria.gonzalez@ejemplo.cl',
      fecha: '2026-06-03T10:30:00',
      leido: false,
      mensaje: 'Hola, me gustaría saber cuándo abren las inscripciones para el próximo taller de liderazgo. Fui al anterior y me encantó la dinámica. ¡Saludos!'
    },
    {
      id: 2,
      nombre: 'Pedro Soto',
      email: 'psoto22@mail.com',
      fecha: '2026-06-02T15:45:00',
      leido: true,
      mensaje: 'Estimados, tengo un problema con mi cuenta. No puedo actualizar mi número de teléfono en el perfil. ¿Podrían ayudarme con eso por favor? Gracias de antemano.'
    },
    {
      id: 3,
      nombre: 'Ana Rojas',
      email: 'ana.rojas.estudiante@liceo.cl',
      fecha: '2026-06-01T09:15:00',
      leido: false,
      mensaje: 'Hola buenas tardes. Quería sugerir si pueden hacer más actividades deportivas los fines de semana, ya que muchos estudiamos de lunes a viernes y no podemos asistir a los talleres de la tarde.'
    },
    {
      id: 4,
      nombre: 'Carlos Miranda',
      email: 'carlos_m@gmail.com',
      fecha: '2026-05-30T11:20:00',
      leido: true,
      mensaje: 'Quiero felicitar al equipo por la feria vocacional de la semana pasada, estuvo excelente y me ayudó mucho a decidir mi futuro. ¡Sigan así!'
    }
  ];

  // ==================== DOM REFERENCES ====================
  const tableBody = document.getElementById('messages-table-body');
  const messageCount = document.getElementById('message-count');
  const searchInput = document.getElementById('search-messages');
  const statusFilter = document.getElementById('status-filter');

  // Modal References
  const modal = document.getElementById('message-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalAvatar = document.getElementById('modal-avatar');
  const modalName = document.getElementById('modal-name');
  const modalEmail = document.getElementById('modal-email');
  const modalDate = document.getElementById('modal-date');
  const modalStatusBadge = document.getElementById('modal-status-badge');
  const modalBody = document.getElementById('modal-message-body');
  const toggleReadBtn = document.getElementById('toggle-read-btn');
  const replyBtn = document.getElementById('reply-mailto-btn');
  const deleteBtn = document.getElementById('delete-message-btn');

  let currentMessageId = null;

  // ==================== RENDER TABLE ====================
  function renderTable() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterStatus = statusFilter.value;

    const filtered = messages.filter(msg => {
      const matchSearch = msg.nombre.toLowerCase().includes(searchTerm) || msg.email.toLowerCase().includes(searchTerm);
      let matchStatus = true;
      if (filterStatus === 'unread') matchStatus = !msg.leido;
      if (filterStatus === 'read') matchStatus = msg.leido;
      return matchSearch && matchStatus;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-12 text-center">
            <div class="flex flex-col items-center gap-3 text-gray-400">
              <i class="fas fa-inbox text-4xl"></i>
              <p class="text-lg font-medium">Bandeja vacía</p>
              <p class="text-sm">No hay mensajes que coincidan con tu búsqueda.</p>
            </div>
          </td>
        </tr>
      `;
      messageCount.textContent = '0';
      return;
    }

    // Ordenar del más nuevo al más antiguo
    filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    tableBody.innerHTML = filtered.map(msg => {
      const dateObj = new Date(msg.fecha);
      const dateFormatted = dateObj.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      
      const statusClass = msg.leido ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-primary-100 text-primary-700 border-primary-200';
      const statusText = msg.leido ? 'Leído' : 'Nuevo';
      
      const rowClass = msg.leido ? 'bg-white' : 'bg-primary-50/30';
      const fontClass = msg.leido ? 'font-normal' : 'font-semibold text-gray-900';
      
      // Extracto del mensaje
      const extracto = msg.mensaje.length > 50 ? msg.mensaje.substring(0, 50) + '...' : msg.mensaje;

      return `
        <tr class="${rowClass} border-b hover:bg-gray-50 transition-colors cursor-pointer message-row" data-id="${msg.id}">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                ${msg.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p class="${fontClass}">${msg.nombre}</p>
                <p class="text-xs text-gray-500">${msg.email}</p>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 max-w-xs truncate text-gray-600 ${fontClass}">
            ${extracto}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
            ${dateFormatted}
          </td>
          <td class="px-6 py-4">
            <span class="text-xs font-medium px-2.5 py-0.5 rounded border ${statusClass}">${statusText}</span>
          </td>
          <td class="px-6 py-4 text-right">
            <button class="text-primary-500 hover:text-primary-600 transition-colors text-sm font-medium open-msg-btn" data-id="${msg.id}">
              Leer
            </button>
          </td>
        </tr>
      `;
    }).join('');

    messageCount.textContent = filtered.length;
  }

  // ==================== MODAL LOGIC ====================
  function openMessage(id) {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    currentMessageId = id;

    // Poblar modal
    modalAvatar.textContent = msg.nombre.charAt(0).toUpperCase();
    modalName.textContent = msg.nombre;
    modalEmail.textContent = msg.email;
    
    const dateObj = new Date(msg.fecha);
    modalDate.textContent = dateObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    modalBody.textContent = msg.mensaje;

    // Configurar estado visual
    updateModalStatusBadge(msg.leido);
    
    // Configurar link de respuesta para abrir Gmail
    replyBtn.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${msg.email}&su=Respuesta%20desde%20Apoyo%20Joven`;
    replyBtn.target = '_blank';

    // Marcar como leído automáticamente si era nuevo
    if (!msg.leido) {
      msg.leido = true;
      renderTable(); // actualizar tabla de fondo
      updateModalStatusBadge(true);
    }

    modal.classList.remove('hidden');
  }

  function updateModalStatusBadge(isRead) {
    if (isRead) {
      modalStatusBadge.textContent = 'Leído';
      modalStatusBadge.className = 'text-xs font-medium px-2.5 py-0.5 rounded border bg-gray-100 text-gray-600 border-gray-200';
      toggleReadBtn.textContent = 'Marcar como No Leído';
    } else {
      modalStatusBadge.textContent = 'Nuevo';
      modalStatusBadge.className = 'text-xs font-medium px-2.5 py-0.5 rounded border bg-primary-100 text-primary-700 border-primary-200';
      toggleReadBtn.textContent = 'Marcar como Leído';
    }
  }

  function closeModalHandler() {
    modal.classList.add('hidden');
    currentMessageId = null;
  }

  // ==================== EVENT LISTENERS ====================
  
  // Tabla clicks (delegation)
  tableBody.addEventListener('click', (e) => {
    const row = e.target.closest('.message-row');
    if (row) {
      const id = parseInt(row.dataset.id);
      openMessage(id);
    }
  });

  // Modal actions
  closeModalBtn.addEventListener('click', closeModalHandler);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModalHandler();
  });

  toggleReadBtn.addEventListener('click', () => {
    if (currentMessageId) {
      const msg = messages.find(m => m.id === currentMessageId);
      if (msg) {
        msg.leido = !msg.leido;
        updateModalStatusBadge(msg.leido);
        renderTable();
      }
    }
  });

  deleteBtn.addEventListener('click', () => {
    if (currentMessageId && confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      messages = messages.filter(m => m.id !== currentMessageId);
      closeModalHandler();
      renderTable();
    }
  });

  // Filters
  searchInput.addEventListener('input', renderTable);
  statusFilter.addEventListener('change', renderTable);

  // ==================== INIT ====================
  renderTable();
});
