import { supabase } from './api.js';

// Este script se ejecuta cuando el usuario llega desde el enlace de recuperación de correo.
// Supabase automáticamente procesa el token en la URL y establece una sesión temporal.

const form = document.getElementById('reset-password-form');
const statusDiv = document.getElementById('reset-status');
const submitBtn = document.getElementById('reset-submit-btn');

// Función auxiliar para mostrar mensajes
const showStatus = (message, isSuccess) => {
    if (!statusDiv) return;
    statusDiv.innerHTML = message;
    statusDiv.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');
    statusDiv.classList.add(isSuccess ? 'bg-green-100' : 'bg-red-100', isSuccess ? 'text-green-700' : 'text-red-700');
};

// Verificar que el usuario llegó con un token válido de recuperación
const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        showStatus('El enlace de recuperación ha expirado o es inválido. Solicita uno nuevo desde la página principal.', false);
        if (submitBtn) submitBtn.disabled = true;
    }
};

checkSession();

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Validar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
            showStatus('Las contraseñas no coinciden. Verifica e intenta de nuevo.', false);
            return;
        }

        if (newPassword.length < 6) {
            showStatus('La contraseña debe tener al menos 6 caracteres.', false);
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            showStatus('¡Contraseña actualizada exitosamente! Redirigiendo al inicio...', true);

            // Cerrar sesión temporal y redirigir al inicio
            setTimeout(async () => {
                await supabase.auth.signOut();
                window.location.href = 'index.html';
            }, 3000);

        } catch (err) {
            console.error('Error al actualizar contraseña:', err);
            showStatus('Error: ' + (err.message || 'No se pudo actualizar la contraseña.'), false);
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-key mr-2"></i>Guardar Nueva Contraseña';
        }
    });
}
