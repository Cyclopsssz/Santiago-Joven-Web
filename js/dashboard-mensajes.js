import { supabase } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  let messages = [];

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

  // ==================== FETCH DATA ====================
  async function fetchMessages() {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8"><i class="fas fa-spinner fa-spin text-primary-500 text-3xl"></i></td></tr>`;
    
    const { data, error } = await supabase
      .from('contacto')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-500">Error al cargar los mensajes.</td></tr>`;
      return;
    }

    messages = data.map(msg => ({
      ...msg,
      leido: !!msg.leido,
      fecha: msg.created_at
    }));

    renderTable();
  }

  // ==================== RENDER TABLE ====================
  function renderTable() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterStatus = statusFilter.value;

    const filtered = messages.filter(msg => {
      const nombre = msg.nombre || '';
      const email = msg.email || '';
      const matchSearch = nombre.toLowerCase().includes(searchTerm) || email.toLowerCase().includes(searchTerm);
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

    tableBody.innerHTML = filtered.map(msg => {
      const dateObj = new Date(msg.fecha);
      const dateFormatted = dateObj.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      
      const statusClass = msg.leido ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-primary-100 text-primary-700 border-primary-200';
      const statusText = msg.leido ? 'Leído' : 'Nuevo';
      
      const rowClass = msg.leido ? 'bg-white' : 'bg-primary-50/30';
      const fontClass = msg.leido ? 'font-normal' : 'font-semibold text-gray-900';
      
      const extracto = msg.mensaje && msg.mensaje.length > 50 ? msg.mensaje.substring(0, 50) + '...' : (msg.mensaje || '');

      return `
        <tr class="${rowClass} border-b hover:bg-gray-50 transition-colors cursor-pointer message-row" data-id="${msg.id}">
          <td class="px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                ${msg.nombre ? msg.nombre.charAt(0).toUpperCase() : '?'}
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
  async function openMessage(id) {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    currentMessageId = id;

    modalAvatar.textContent = msg.nombre ? msg.nombre.charAt(0).toUpperCase() : '?';
    modalName.textContent = msg.nombre;
    modalEmail.textContent = msg.email;
    
    const dateObj = new Date(msg.fecha);
    modalDate.textContent = dateObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    modalBody.textContent = msg.mensaje;

    updateModalStatusBadge(msg.leido);
    
    replyBtn.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${msg.email}&su=Respuesta%20desde%20Apoyo%20Joven`;
    replyBtn.target = '_blank';

    if (!msg.leido) {
      msg.leido = true;
      updateModalStatusBadge(true);
      renderTable();
      await supabase.from('contacto').update({ leido: true }).eq('id', id);
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
  
  tableBody.addEventListener('click', (e) => {
    const row = e.target.closest('.message-row');
    if (row) {
      const id = row.dataset.id;
      openMessage(id);
    }
  });

  closeModalBtn.addEventListener('click', closeModalHandler);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModalHandler();
  });

  toggleReadBtn.addEventListener('click', async () => {
    if (currentMessageId) {
      const msg = messages.find(m => m.id === currentMessageId);
      if (msg) {
        msg.leido = !msg.leido;
        updateModalStatusBadge(msg.leido);
        renderTable();
        
        const originalText = toggleReadBtn.textContent;
        toggleReadBtn.textContent = 'Actualizando...';
        await supabase.from('contacto').update({ leido: msg.leido }).eq('id', msg.id);
        toggleReadBtn.textContent = originalText;
      }
    }
  });

  deleteBtn.addEventListener('click', async () => {
    if (currentMessageId && confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      const idToDelete = currentMessageId;
      messages = messages.filter(m => m.id !== idToDelete);
      closeModalHandler();
      renderTable();
      
      await supabase.from('contacto').delete().eq('id', idToDelete);
    }
  });

  searchInput.addEventListener('input', renderTable);
  statusFilter.addEventListener('change', renderTable);

  // ==================== INIT ====================
  await fetchMessages();
});
