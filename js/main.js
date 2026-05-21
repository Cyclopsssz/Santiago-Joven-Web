import { initAuth, requireAuth } from './auth.js';
import { initNavigation } from './navigation.js';
import { initCalendar } from './calendar.js';
import { initForms } from './forms.js';

// Inicializacion al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initNavigation();
    initCalendar();
    initForms();

    // Proteger botones que requieren autenticación
    document.querySelectorAll('.requires-auth').forEach(el => {
        el.addEventListener('click', requireAuth());
    });
});
