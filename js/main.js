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

    // Cargar noticias en la sección pública
    cargarNoticias();
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
async function cargarNoticias() {
    const grid = document.getElementById('noticias-grid');
    if (!grid) return;

    try {
        const { data: noticias, error } = await supabase
            .from('noticias')
            .select('*')
            .eq('activo', true)
            .order('fecha', { ascending: false })
            .limit(6);

        if (error) {
            console.error('Error cargando noticias:', error);
            grid.innerHTML = '';
            return;
        }

        if (!noticias || noticias.length === 0) {
            grid.innerHTML = `<p class="col-span-full text-center text-gray-500 py-8 text-lg">No hay noticias publicadas por el momento.</p>`;
            return;
        }

        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        grid.innerHTML = noticias.map(n => {
            const fecha = n.fecha ? new Date(n.fecha + 'T12:00:00') : new Date();
            const fechaStr = `${fecha.getDate()} de ${meses[fecha.getMonth()]}, ${fecha.getFullYear()}`;

            const imagenHTML = n.imagen_url
                ? `<div class="h-48 w-full overflow-hidden">
                     <img src="${n.imagen_url}" alt="${n.titulo}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.parentElement.innerHTML='<div class=\'h-full w-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center\'><i class=\'fas fa-newspaper text-white text-4xl\'></i></div>'">
                   </div>`
                : `<div class="h-48 w-full overflow-hidden">
                     <div class="h-full w-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                       <i class="fas fa-newspaper text-white text-4xl"></i>
                     </div>
                   </div>`;

            const enlaceBtn = n.enlace
                ? `<a href="${n.enlace}" target="_blank" rel="noopener noreferrer" class="btn btn-outline border-accent-500 text-accent-500 hover:bg-accent-500 hover:text-white text-sm mt-auto">Leer más <i class="fas fa-external-link-alt ml-1"></i></a>`
                : '';

            return `
                <div class="card p-0 overflow-hidden group flex flex-col transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl">
                    ${imagenHTML}
                    <div class="p-5 flex flex-col flex-grow">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-xs font-semibold text-accent-500 bg-orange-50 px-2 py-1 rounded-full"><i class="far fa-calendar-alt mr-1"></i>${fechaStr}</span>
                        </div>
                        <h4 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">${n.titulo}</h4>
                        <p class="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">${n.descripcion}</p>
                        ${enlaceBtn}
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error('Excepción al cargar noticias:', e);
        grid.innerHTML = '';
    }
}
