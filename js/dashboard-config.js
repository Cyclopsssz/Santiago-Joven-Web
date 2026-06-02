document.addEventListener('DOMContentLoaded', () => {
  // ==================== DOM ====================
  const saveBtn = document.getElementById('save-btn');
  const resetBtn = document.getElementById('reset-btn');
  const statusDiv = document.getElementById('config-status');

  // Campos de configuracion
  const fields = {
    siteName: document.getElementById('site-name'),
    siteEmail: document.getElementById('site-email'),
    siteDescription: document.getElementById('site-description'),
    siteAddress: document.getElementById('site-address'),
    siteHours: document.getElementById('site-hours'),
    socialInstagram: document.getElementById('social-instagram'),
    socialFacebook: document.getElementById('social-facebook'),
    socialTwitter: document.getElementById('social-twitter'),
    socialTiktok: document.getElementById('social-tiktok'),
    adminName: document.getElementById('admin-name'),
    adminEmail: document.getElementById('admin-email'),
    currentPassword: document.getElementById('current-password'),
    newPassword: document.getElementById('new-password'),
    confirmPassword: document.getElementById('confirm-password'),
  };

  // Guardar valores originales para restablecer
  const originalValues = {};
  for (const key in fields) {
    if (fields[key]) {
      originalValues[key] = fields[key].value;
    }
  }

  // ==================== HELPERS ====================
  function showStatus(message, success) {
    statusDiv.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700', 'bg-yellow-100', 'text-yellow-700');
    const icon = success ? 'fa-check-circle' : 'fa-exclamation-triangle';
    const bgClass = success ? 'bg-green-100' : 'bg-red-100';
    const textClass = success ? 'text-green-700' : 'text-red-700';
    statusDiv.classList.add(bgClass, textClass);
    statusDiv.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    statusDiv.classList.remove('hidden');

    // Scroll al top para ver el mensaje
    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Ocultar despues de 4 segundos
    setTimeout(() => {
      statusDiv.classList.add('hidden');
    }, 4000);
  }

  // ==================== SAVE ====================
  saveBtn.addEventListener('click', () => {
    // Validaciones basicas
    if (!fields.siteName.value.trim()) {
      showStatus('El nombre del sitio no puede estar vacío', false);
      fields.siteName.focus();
      return;
    }

    if (!fields.siteEmail.value.trim()) {
      showStatus('El correo de contacto no puede estar vacío', false);
      fields.siteEmail.focus();
      return;
    }

    // Validar contraseña si se intenta cambiar
    const currentPw = fields.currentPassword.value;
    const newPw = fields.newPassword.value;
    const confirmPw = fields.confirmPassword.value;

    if (newPw || confirmPw || currentPw) {
      if (!currentPw) {
        showStatus('Debes ingresar tu contraseña actual para cambiarla', false);
        fields.currentPassword.focus();
        return;
      }
      if (!newPw) {
        showStatus('Debes ingresar la nueva contraseña', false);
        fields.newPassword.focus();
        return;
      }
      if (newPw.length < 6) {
        showStatus('La nueva contraseña debe tener al menos 6 caracteres', false);
        fields.newPassword.focus();
        return;
      }
      if (newPw !== confirmPw) {
        showStatus('Las contraseñas no coinciden', false);
        fields.confirmPassword.focus();
        return;
      }
    }

    // Simular guardado
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';

    setTimeout(() => {
      showStatus('Configuración guardada exitosamente', true);
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Guardar Cambios';

      // Limpiar campos de contraseña
      fields.currentPassword.value = '';
      fields.newPassword.value = '';
      fields.confirmPassword.value = '';

      // Actualizar valores originales
      for (const key in fields) {
        if (fields[key]) {
          originalValues[key] = fields[key].value;
        }
      }
    }, 1200);
  });

  // ==================== RESET ====================
  resetBtn.addEventListener('click', () => {
    for (const key in fields) {
      if (fields[key] && originalValues[key] !== undefined) {
        fields[key].value = originalValues[key];
      }
    }
    // Limpiar contraseñas
    fields.currentPassword.value = '';
    fields.newPassword.value = '';
    fields.confirmPassword.value = '';

    statusDiv.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
    statusDiv.classList.add('bg-yellow-100', 'text-yellow-700');
    statusDiv.innerHTML = '<i class="fas fa-info-circle"></i><span>Valores restablecidos a la configuración original</span>';
    setTimeout(() => {
      statusDiv.classList.add('hidden');
    }, 3000);
  });
});
