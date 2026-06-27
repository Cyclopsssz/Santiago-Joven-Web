import { supabase } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
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
    siteMap: document.getElementById('site-map'),
    socialInstagram: document.getElementById('social-instagram'),
    socialFacebook: document.getElementById('social-facebook'),
    socialTwitter: document.getElementById('social-twitter'),
    socialTwitter: document.getElementById('social-twitter'),
    socialTiktok: document.getElementById('social-tiktok'),
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

  // ==================== LOAD ====================
  async function loadConfig() {
    try {
      const { data, error } = await supabase
        .from('configuracion_sitio')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (error) {
        console.error('Error al cargar config:', error);
        return;
      }
      
      if (data) {
        fields.siteName.value = data.nombre_sitio || '';
        fields.siteEmail.value = data.correo_contacto || '';
        fields.siteDescription.value = data.descripcion || '';
        fields.siteAddress.value = data.direccion || '';
        fields.siteHours.value = data.horario || '';
        fields.siteMap.value = data.url_mapa || '';
        fields.socialInstagram.value = data.url_instagram || '';
        fields.socialFacebook.value = data.url_facebook || '';
        fields.socialTwitter.value = data.url_twitter || '';
        fields.socialTiktok.value = data.url_tiktok || '';
        
        // Actualizar valores originales
        for (const key in fields) {
          if (fields[key]) {
            originalValues[key] = fields[key].value;
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Llamar al cargar
  await loadConfig();

  // ==================== SAVE ====================
  saveBtn.addEventListener('click', async () => {
    // Validaciones basicas
    if (!fields.siteName.value.trim()) {
      showStatus('El nombre del sitio no puede estar vacío', false);
      fields.siteName.focus();
      return;
    }

    // Extraer URL limpia si pegaron el iframe completo
    const inputMap = fields.siteMap.value.trim();
    let finalMapUrl = inputMap;
    if (inputMap.includes('<iframe')) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = inputMap;
      const iframe = tempDiv.querySelector('iframe');
      if (iframe && iframe.src) {
        finalMapUrl = iframe.src;
      }
    }

    // Simular guardado
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Guardando...';

    // Guardar en DB
    try {
      const { error } = await supabase
        .from('configuracion_sitio')
        .update({
          nombre_sitio: fields.siteName.value,
          descripcion: fields.siteDescription.value,
          correo_contacto: fields.siteEmail.value,
          direccion: fields.siteAddress.value,
          horario: fields.siteHours.value,
          url_mapa: finalMapUrl,
          url_instagram: fields.socialInstagram.value,
          url_facebook: fields.socialFacebook.value,
          url_twitter: fields.socialTwitter.value,
          url_tiktok: fields.socialTiktok.value
        })
        .eq('id', 1);

      if (error) {
        throw error;
      }

      showStatus('Configuración guardada exitosamente', true);
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Guardar Cambios';

      // Actualizar valores originales
      for (const key in fields) {
        if (fields[key]) {
          originalValues[key] = fields[key].value;
        }
      }
    } catch (err) {
      console.error('Error al guardar config:', err);
      showStatus('Error al guardar la configuración', false);
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Guardar Cambios';
    }
  });

  // ==================== RESET ====================
  resetBtn.addEventListener('click', () => {
    for (const key in fields) {
      if (fields[key] && originalValues[key] !== undefined) {
        fields[key].value = originalValues[key];
      }
    }
    statusDiv.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
    statusDiv.classList.add('bg-yellow-100', 'text-yellow-700');
    statusDiv.innerHTML = '<i class="fas fa-info-circle"></i><span>Valores restablecidos a la configuración original</span>';
    setTimeout(() => {
      statusDiv.classList.add('hidden');
    }, 3000);
  });
});
