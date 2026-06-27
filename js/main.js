import { initAuth, requireAuth } from './auth.js';
import { initNavigation } from './navigation.js';
import { initCalendar } from './calendar.js';
import { initForms } from './forms.js';
import { supabase } from './api.js';

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

    // Cargar configuracion global (redes y nombre)
    cargarConfiguracionSitio();
});

async function cargarConfiguracionSitio() {
    try {
        const { data, error } = await supabase
            .from('configuracion_sitio')
            .select('*')
            .eq('id', 1)
            .single();

        if (error || !data) return;

        // --- 1. Actualizar Nombre del Sitio ---
        if (data.nombre_sitio) {
            document.title = `${data.nombre_sitio}: Crece, participa y aprende`;
            
            const navbarLogo = document.getElementById('site-logo-text');
            if (navbarLogo) navbarLogo.textContent = data.nombre_sitio;
            
            const footerLogo = document.getElementById('footer-logo-text');
            if (footerLogo) footerLogo.textContent = data.nombre_sitio;
        }

        // --- 2. Actualizar Descripción del Sitio ---
        if (data.descripcion) {
            const heroDescription = document.getElementById('site-hero-description');
            if (heroDescription) heroDescription.textContent = data.descripcion;
        }

        // --- 3. Cargar Información de Contacto ---
        if (data.direccion) {
            const address = document.getElementById('site-address-text');
            if (address) address.textContent = data.direccion;
        }
        if (data.horario) {
            const hours = document.getElementById('site-hours-text');
            if (hours) hours.textContent = data.horario;
        }
        if (data.correo_contacto) {
            const email = document.getElementById('site-email-text');
            if (email) email.textContent = data.correo_contacto;
        }
        if (data.url_mapa) {
            const mapFrame = document.getElementById('site-map-iframe');
            if (mapFrame) mapFrame.src = data.url_mapa;
        }

        // --- 4. Cargar Redes Sociales ---
        const container = document.getElementById('social-links-container');
        if (!container) return;

        let html = '';

        if (data.url_instagram) {
            html += `<a href="${data.url_instagram}" target="_blank" rel="noopener noreferrer" class="hover:text-accent-500 transition-colors"><i class="fab fa-instagram"></i></a>`;
        }
        if (data.url_facebook) {
            html += `<a href="${data.url_facebook}" target="_blank" rel="noopener noreferrer" class="hover:text-accent-500 transition-colors"><i class="fab fa-facebook"></i></a>`;
        }
        if (data.url_twitter) {
            html += `<a href="${data.url_twitter}" target="_blank" rel="noopener noreferrer" class="hover:text-accent-500 transition-colors"><i class="fab fa-x-twitter"></i></a>`;
        }
        if (data.url_tiktok) {
            html += `<a href="${data.url_tiktok}" target="_blank" rel="noopener noreferrer" class="hover:text-accent-500 transition-colors"><i class="fab fa-tiktok"></i></a>`;
        }

        container.innerHTML = html;
    } catch (e) {
        console.error('Error cargando la configuración del sitio:', e);
    }
}
