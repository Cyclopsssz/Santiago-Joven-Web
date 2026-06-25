import { supabase } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  let messages = [];

  // ==================== DOM REFERENCES ====================
  const tableBody = document.getElementById('messages-table-body');
  const messageCount = document.getElementById('message-count');
  const searchInput = document.getElementById('search-messages');
  const statusFilter = document.getElementById('status-filter');
  const typeFilter = document.getElementById('type-filter');

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
  const unbanBtn = document.getElementById('unban-user-btn');
  const appealActionsContainer = document.getElementById('appeal-actions-container');
  const unbanReasonInput = document.getElementById('unban-reason-input');

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
    const filterType = typeFilter ? typeFilter.value : 'all';

    const filtered = messages.filter(msg => {
      const nombre = msg.nombre || '';
      const email = msg.email || '';
      const matchSearch = nombre.toLowerCase().includes(searchTerm) || email.toLowerCase().includes(searchTerm);
      
      let matchStatus = true;
      if (filterStatus === 'unread') matchStatus = !msg.leido;
      if (filterStatus === 'read') matchStatus = msg.leido;
      
      let matchType = true;
      if (filterType !== 'all') {
         const msgType = msg.tipo || 'General';
         matchType = msgType === filterType;
      }
      
      return matchSearch && matchStatus && matchType;
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
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="text-xs font-medium px-2.5 py-0.5 rounded ${msg.tipo === 'Apelación de Baneo' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}">${msg.tipo || 'General'}</span>
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
    
    if (appealActionsContainer && unbanReasonInput) {
      if (msg.tipo === 'Apelación de Baneo') {
        appealActionsContainer.classList.remove('hidden');
        unbanReasonInput.value = ''; // Limpiar textarea al abrir
      } else {
        appealActionsContainer.classList.add('hidden');
      }
    }
    
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
  if (typeFilter) typeFilter.addEventListener('change', renderTable);

  if (unbanBtn) {
    unbanBtn.addEventListener('click', async () => {
      if (!currentMessageId) return;
      const msg = messages.find(m => m.id === currentMessageId);
      if (!msg) return;

      const motivoRevocacion = unbanReasonInput ? unbanReasonInput.value.trim() : 'Apelación aprobada desde panel de mensajes';
      
      if (!motivoRevocacion) {
          alert('Por favor, ingresa el motivo de la revocación.');
          return;
      }

      if (!confirm(`¿Estás seguro de revocar el baneo de ${msg.email}?`)) return;
      
      const originalText = unbanBtn.innerHTML;
      unbanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Revocando...';
      unbanBtn.disabled = true;
      
      try {
          // 1. Encontrar el user_id usando el email
          const { data: perfiles, error: perfError } = await supabase.from('perfiles').select('id, estado').eq('correo', msg.email).limit(1);
          if (perfError || !perfiles || perfiles.length === 0) throw new Error('Usuario no encontrado en la base de datos');
          
          const userId = perfiles[0].id;
          
          if (perfiles[0].estado !== 'Suspendido') {
              alert('Este usuario no está suspendido actualmente.');
          } else {
              // 2. Revocar en el historial
              const { data: userData } = await supabase.auth.getUser();
              const adminId = userData?.user?.id || null;
              
              const { error: histError } = await supabase.from('historial_baneos')
                  .update({ 
                      estado_sancion: 'revocado',
                      motivo_revocacion: motivoRevocacion,
                      admin_revocador_id: adminId
                  })
                  .eq('user_id', userId)
                  .eq('estado_sancion', 'activo');
              
              if (histError) throw histError;

              // 3. Reactivar perfil
              const { error: updError } = await supabase.from('perfiles').update({ estado: 'Activo' }).eq('id', userId);
              if (updError) throw updError;
              
              alert('El baneo ha sido revocado exitosamente.');
          }
          
          // 4. Marcar mensaje como leido
          if (!msg.leido) {
              msg.leido = true;
              updateModalStatusBadge(true);
              await supabase.from('contacto').update({ leido: true }).eq('id', msg.id);
          }
          
          closeModalHandler();
          renderTable();
          
      } catch(err) {
          console.error(err);
          alert('Hubo un error al revocar el baneo: ' + err.message);
      } finally {
          unbanBtn.innerHTML = originalText;
          unbanBtn.disabled = false;
      }
    });
  }

  // ==================== INIT ====================
  await fetchMessages();
});
