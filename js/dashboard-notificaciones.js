import { supabase } from './api.js';

async function initGlobalNotifications() {
    const form = document.getElementById('global-notification-form');
    const titleInput = document.getElementById('global-title');
    const messageInput = document.getElementById('global-message');
    const statusEl = document.getElementById('global-status');
    const submitBtn = document.getElementById('global-submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        const message = messageInput.value.trim();

        if (!title || !message) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        statusEl.classList.remove('hidden', 'bg-red-50', 'text-red-700', 'bg-green-50', 'text-green-700');
        
        try {
            // 1. Obtener todos los IDs de usuarios registrados
            const { data: users, error: fetchError } = await supabase
                .from('perfiles')
                .select('id');
            
            if (fetchError) throw fetchError;
            
            if (!users || users.length === 0) {
                throw new Error("No hay usuarios registrados para enviar la notificación.");
            }

            // 2. Preparar el lote de notificaciones
            const notificaciones = users.map(u => ({
                user_id: u.id,
                titulo: title,
                mensaje: message,
                leida: false
            }));

            // 3. Insertar el lote en la base de datos (Batch Insert)
            const { error: insertError } = await supabase
                .from('notificaciones')
                .insert(notificaciones);

            if (insertError) throw insertError;

            // Éxito
            statusEl.classList.add('bg-green-50', 'text-green-700');
            statusEl.textContent = `¡Éxito! Notificación enviada a ${users.length} usuarios.`;
            statusEl.classList.remove('hidden');
            form.reset();

        } catch (error) {
            console.error('Error al enviar notificaciones globales:', error);
            statusEl.classList.add('bg-red-50', 'text-red-700');
            statusEl.textContent = 'Error: ' + error.message;
            statusEl.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar a Todos';
            
            // Ocultar mensaje después de 5 segundos
            setTimeout(() => {
                if(statusEl.classList.contains('bg-green-50')) {
                    statusEl.classList.add('hidden');
                }
            }, 5000);
        }
    });
}

document.addEventListener('DOMContentLoaded', initGlobalNotifications);
