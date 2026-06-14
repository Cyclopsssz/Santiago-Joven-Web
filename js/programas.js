import { supabase } from './api.js';
import { requireAuth } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Referencias a contenedores
    const serviciosGrid = document.getElementById('servicios-grid');
    const serviciosTabs = document.querySelectorAll('#servicios-tabs button');
    const programasCarousel = document.getElementById('programas-carousel');
    const modalesContainer = document.getElementById('modales-container');
    const prevProgramaBtn = document.getElementById('prev-programa');
    const nextProgramaBtn = document.getElementById('next-programa');

    let todosLosServicios = [];

    try {
        // Fetch Programas
        const { data: programas, error: errProg } = await supabase
            .from('programas')
            .select('*')
            .eq('activo', true)
            .order('created_at', { ascending: false });

        if (!errProg && programas) {
            renderProgramas(programas);
        }

        // Fetch Servicios
        const { data: servicios, error: errServ } = await supabase
            .from('servicios')
            .select('*')
            .eq('activo', true)
            .order('created_at', { ascending: false });

        if (!errServ && servicios) {
            todosLosServicios = servicios;
            // Iniciar por defecto en la pestaña "Destacados"
            renderServicios(todosLosServicios, 'destacado');
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }

    // --- LÓGICA DE SERVICIOS (TABS) ---
    serviciosTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Actualizar UI de pestañas
            serviciosTabs.forEach(t => {
                t.classList.remove('active-tab', 'bg-primary-500', 'text-white', 'shadow-md');
                t.classList.add('bg-white', 'text-gray-600', 'shadow-sm', 'border-gray-200');
            });
            const clickedTab = e.target;
            clickedTab.classList.remove('bg-white', 'text-gray-600', 'shadow-sm', 'border-gray-200');
            clickedTab.classList.add('active-tab', 'bg-primary-500', 'text-white', 'shadow-md');

            // Filtrar y renderizar
            const category = clickedTab.getAttribute('data-tab');
            renderServicios(todosLosServicios, category);
        });
    });

    function renderServicios(servicios, filterCategory) {
        if (!serviciosGrid) return;
        
        // Efecto fade out
        serviciosGrid.style.opacity = 0;
        
        setTimeout(() => {
            serviciosGrid.innerHTML = '';
            
            let filtered = servicios;
            if (filterCategory === 'destacado') {
                filtered = servicios.filter(s => s.destacado === true);
            } else if (filterCategory !== 'all') {
                filtered = servicios.filter(s => s.categoria === filterCategory);
            }

            if (filtered.length === 0) {
                serviciosGrid.innerHTML = `<p class="col-span-full text-center text-gray-500 py-8 text-lg">No hay servicios disponibles en esta categoría por el momento.</p>`;
            } else {
                filtered.forEach(s => {
                    const color = s.color_tema || 'primary';
                    const icon = s.icono_fa || 'fas fa-star';
                    const html = `
                        <div class="card service-card transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl border-t-4 border-${color}-500 flex flex-col">
                            <i class="${icon} text-4xl text-${color}-500 mb-4 bg-${color}-50 p-4 rounded-xl inline-block w-max"></i>
                            <h4 class="text-xl font-bold text-gray-800 mb-2">${s.titulo}</h4>
                            <p class="text-gray-600 mb-6 flex-grow">${s.descripcion}</p>
                            <button class="btn btn-outline border-${color}-500 text-${color}-500 hover:bg-${color}-500 hover:text-white w-full requires-auth enroll-btn" data-title="${s.titulo}">Inscríbete</button>
                        </div>
                    `;
                    serviciosGrid.innerHTML += html;
                });
            }
            
            // Re-bind auth logic for new buttons
            document.querySelectorAll('.enroll-btn').forEach(el => {
                el.addEventListener('click', requireAuth());
            });

            // Efecto fade in
            serviciosGrid.style.transition = 'opacity 0.3s ease';
            serviciosGrid.style.opacity = 1;
        }, 300);
    }

    // --- LÓGICA DE PROGRAMAS (CARRUSEL & MODALES) ---
    function renderProgramas(programas) {
        if (!programasCarousel || !modalesContainer) return;
        
        programasCarousel.innerHTML = '';
        modalesContainer.innerHTML = '';

        if (programas.length === 0) {
            programasCarousel.innerHTML = `<p class="w-full text-center text-gray-500 py-8 text-lg">Pronto tendremos nuevos programas disponibles.</p>`;
            return;
        }

        programas.forEach(p => {
            const color = p.color_tema || 'secondary';
            const icon = p.icono_fa || 'fas fa-handshake-angle';
            
            // Inyectar Tarjeta en el Carrusel (snap-start y width exacto para que no se corten)
            const cardHtml = `
                <div class="card w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start shrink-0 flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group rounded-2xl bg-white">
                    <div class="w-20 h-20 rounded-full bg-${color}-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-${color}-100 transition-all duration-300">
                        <i class="${icon} text-4xl text-${color}-500"></i>
                    </div>
                    <h4 class="text-xl font-bold text-gray-800 mb-3">${p.titulo}</h4>
                    <p class="text-gray-600 mb-8 text-sm flex-grow leading-relaxed">${p.descripcion_corta}</p>
                    <button class="btn bg-${color}-500 text-white px-8 py-2.5 w-full md:w-auto rounded-full font-semibold open-modal-btn shadow-md hover:shadow-lg hover:bg-${color}-600 transform hover:-translate-y-0.5 transition-all" data-modal="modal-${p.id}">
                        Conoce más
                    </button>
                </div>
            `;
            programasCarousel.innerHTML += cardHtml;

            // Inyectar Modal
            const descLargaHTML = p.descripcion_larga ? p.descripcion_larga.replace(/\n/g, '<br>') : 'Sin descripción detallada.';
            const modalHtml = `
                <div id="modal-${p.id}" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-300">
                    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform scale-95 transition-transform duration-300 modal-content">
                        <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-${color}-50 rounded-t-2xl">
                            <h3 class="text-xl font-bold text-${color}-700 flex items-center gap-3">
                                <i class="${icon}"></i> ${p.titulo}
                            </h3>
                            <button class="close-modal-btn text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors bg-white w-8 h-8 rounded-full shadow-sm flex items-center justify-center">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="p-6 md:p-8 overflow-y-auto text-left whitespace-pre-line text-gray-600 leading-relaxed text-lg hide-scrollbar">
                            ${descLargaHTML}
                        </div>
                    </div>
                </div>
            `;
            modalesContainer.innerHTML += modalHtml;
        });

        bindModalEvents();
        setupCarousel();
    }

    // Funciones del Carrusel
    function setupCarousel() {
        if (!programasCarousel) return;
        
        if (prevProgramaBtn) {
            prevProgramaBtn.addEventListener('click', () => {
                const scrollAmount = programasCarousel.clientWidth / 2;
                programasCarousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
        }
        
        if (nextProgramaBtn) {
            nextProgramaBtn.addEventListener('click', () => {
                const scrollAmount = programasCarousel.clientWidth / 2;
                programasCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }
    }

    // Funciones de Modales
    function bindModalEvents() {
        const openButtons = document.querySelectorAll('.open-modal-btn');
        const closeButtons = document.querySelectorAll('.close-modal-btn');
        const modals = document.querySelectorAll('.fixed.inset-0');

        openButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.remove('opacity-0', 'pointer-events-none');
                    const modalContent = modal.querySelector('.modal-content');
                    if (modalContent) {
                        modalContent.classList.remove('scale-95');
                        modalContent.classList.add('scale-100');
                    }
                }
            });
        });

        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.fixed');
                if (modal) closeModal(modal);
            });
        });

        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal(modal);
            });
        });
    }

    function closeModal(modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.classList.remove('scale-100');
            modalContent.classList.add('scale-95');
        }
    }
});
