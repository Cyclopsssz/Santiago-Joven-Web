import { supabase } from './api.js';
import { showStatusMessage } from './utils.js';

export const initCalendar = async () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const eventCardsContainer = document.getElementById('event-list');
    
    // Type Configuration for colors
    const typeConfig = {
      feria: { label: 'Feria', bg: 'bg-blue-100', text: 'text-blue-800' },
      taller: { label: 'Taller', bg: 'bg-yellow-100', text: 'text-yellow-800' },
      curso: { label: 'Curso', bg: 'bg-green-100', text: 'text-green-800' },
      campana: { label: 'Campaña', bg: 'bg-red-100', text: 'text-red-800' },
    };

    // Load Events from Supabase
    const loadEvents = async () => {
        if (!eventCardsContainer) return;

        eventCardsContainer.innerHTML = '<div class="col-span-full text-center py-8"><i class="fas fa-spinner fa-spin text-primary-500 text-3xl"></i></div>';
        
        const today = new Date();
        // Ajuste de zona horaria para asegurar que no se adelante/atrase el día (usar local)
        const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

        const { data, error } = await supabase
            .from('actividades')
            .select('*')
            .gte('fecha', todayStr)
            .order('fecha', { ascending: true });

        if (error) {
            console.error('Error fetching calendar events:', error);
            eventCardsContainer.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">Error al cargar el calendario.</div>';
            return;
        }

        // Only show future events or all events (depending on requirement, we show all for now)
        if (data.length === 0) {
            eventCardsContainer.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">No hay eventos próximos.</div>';
            return;
        }

        eventCardsContainer.innerHTML = data.map(ev => {
            const cfg = typeConfig[ev.tipo] || typeConfig.feria;
            let dateObj = ev.fecha ? new Date(ev.fecha + 'T12:00:00') : new Date();
            if (isNaN(dateObj.getTime())) dateObj = new Date(ev.fecha);
            if (isNaN(dateObj.getTime())) dateObj = new Date();
            const dateStr = dateObj.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });

            return `
            <div class="event-card card relative transition-all duration-300 flex flex-col" data-type="${ev.tipo}">
              <div class="px-3 py-1 ${cfg.bg} ${cfg.text} rounded-full text-sm font-semibold inline-block mb-3 self-start">
                ${cfg.label}
              </div>
              <h4 class="text-xl font-semibold mb-2">${ev.titulo}</h4>
              <p class="text-gray-600 mb-4"><i class="fas fa-calendar-day mr-2"></i>${dateStr}</p>
              <button class="btn btn-outline w-full mt-auto details-btn" data-id="${ev.id}">Ver detalles</button>
            </div>
            `;
        }).join('');

        // Adjuntar eventos a los botones de detalles
        const detailsBtns = eventCardsContainer.querySelectorAll('.details-btn');
        detailsBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const eventId = e.target.dataset.id;
                const ev = data.find(item => item.id === eventId);
                if (!ev) return;

                const modal = document.getElementById('public-event-modal');
                const titleEl = document.getElementById('public-event-title');
                const badgesEl = document.getElementById('public-event-badges');
                const descEl = document.getElementById('public-event-desc');
                
                const cuposContainer = document.getElementById('public-event-cupos-container');
                const liberadoContainer = document.getElementById('public-event-liberado-container');
                const cuposText = document.getElementById('public-event-cupos-text');
                const btnInscribirse = document.getElementById('btn-inscribirse-modal');

                const cfg = typeConfig[ev.tipo] || typeConfig.feria;
                let dateObj = ev.fecha ? new Date(ev.fecha + 'T12:00:00') : new Date();
                if (isNaN(dateObj.getTime())) dateObj = new Date(ev.fecha);
                if (isNaN(dateObj.getTime())) dateObj = new Date();
                const dateStr = dateObj.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });

                titleEl.textContent = ev.titulo;
                badgesEl.innerHTML = `
                    <span class="${cfg.bg} ${cfg.text} text-xs font-semibold px-2.5 py-1 rounded border border-current">${cfg.label}</span>
                    <span class="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded border border-gray-200"><i class="fas fa-calendar-day mr-1"></i> ${dateStr}</span>
                `;
                descEl.textContent = ev.descripcion || 'Sin descripción adicional.';

                // Lógica de cupos
                cuposContainer.classList.add('hidden');
                liberadoContainer.classList.add('hidden');
                
                btnInscribirse.dataset.id = ev.id;
                btnInscribirse.dataset.title = ev.titulo;
                btnInscribirse.disabled = false;
                btnInscribirse.textContent = 'Inscribirse al Evento';
                // Reiniciar las clases al color azul por defecto
                btnInscribirse.classList.remove('bg-gray-400', 'hover:bg-gray-500', 'cursor-not-allowed', 'opacity-50');
                if (!btnInscribirse.classList.contains('bg-primary-500')) {
                    btnInscribirse.classList.add('bg-primary-500', 'hover:bg-primary-600', 'enroll-btn', 'requires-auth');
                }
                
                const btnCancelar = document.getElementById('btn-cancelar-inscripcion');
                if (btnCancelar) btnCancelar.classList.add('hidden');

                const { data: userData } = await supabase.auth.getUser();
                const currentUser = userData?.user;

                if (ev.tiene_cupo) {
                    cuposContainer.classList.remove('hidden');
                    cuposText.textContent = "Calculando cupos...";
                    
                    try {
                        const { data: insc, error } = await supabase
                            .from('inscripciones_calendario')
                            .select('*')
                            .eq('actividad_id', ev.id);
                        
                        if (!error) {
                            const restantes = ev.cupos - (insc ? insc.length : 0);
                            
                            // Check if already inscribed
                            const isAlreadyInscribed = currentUser && insc && insc.some(i => i.user_id === currentUser.id);

                            if (isAlreadyInscribed) {
                                cuposText.textContent = `Quedan ${restantes} cupos disponibles`;
                                cuposText.classList.remove('text-red-600', 'font-bold');
                                btnInscribirse.disabled = true;
                                btnInscribirse.textContent = 'Ya estás inscrito en este evento';
                                btnInscribirse.classList.replace('bg-primary-500', 'bg-gray-400');
                                btnInscribirse.classList.replace('hover:bg-primary-600', 'hover:bg-gray-500');
                                btnInscribirse.classList.add('cursor-not-allowed');
                                btnInscribirse.classList.remove('enroll-btn', 'requires-auth');
                                
                                if (btnCancelar) {
                                    btnCancelar.classList.remove('hidden');
                                    btnCancelar.dataset.id = ev.id;
                                }
                            } else if (restantes <= 0) {
                                cuposText.textContent = "Cupos Agotados";
                                cuposText.classList.add('text-red-600', 'font-bold');
                                btnInscribirse.disabled = true;
                                btnInscribirse.textContent = 'Sin cupos disponibles';
                                btnInscribirse.classList.replace('bg-primary-500', 'bg-gray-400');
                                btnInscribirse.classList.replace('hover:bg-primary-600', 'hover:bg-gray-500');
                                btnInscribirse.classList.add('cursor-not-allowed');
                                btnInscribirse.classList.remove('enroll-btn', 'requires-auth');
                            } else {
                                cuposText.textContent = `Quedan ${restantes} cupos disponibles`;
                                cuposText.classList.remove('text-red-600', 'font-bold');
                            }
                        } else {
                            cuposText.textContent = "Error al calcular cupos";
                        }
                    } catch (err) {
                        cuposText.textContent = "Error de red";
                    }
                } else {
                    liberadoContainer.classList.remove('hidden');
                    
                    // Aún siendo liberado, debemos comprobar si ya está inscrito
                    if (currentUser) {
                        const { data: insc } = await supabase
                            .from('inscripciones_calendario')
                            .select('*')
                            .eq('actividad_id', ev.id)
                            .eq('user_id', currentUser.id);
                            
                        if (insc && insc.length > 0) {
                            btnInscribirse.disabled = true;
                            btnInscribirse.textContent = 'Ya estás inscrito en este evento';
                            btnInscribirse.classList.replace('bg-primary-500', 'bg-gray-400');
                            btnInscribirse.classList.replace('hover:bg-primary-600', 'hover:bg-gray-500');
                            btnInscribirse.classList.add('cursor-not-allowed');
                            btnInscribirse.classList.remove('enroll-btn', 'requires-auth');
                            
                            if (btnCancelar) {
                                btnCancelar.classList.remove('hidden');
                                btnCancelar.dataset.id = ev.id;
                            }
                        }
                    }
                }

                // Mostrar modal
                modal.classList.remove('hidden');
            });
        });

        const closeBtn = document.getElementById('btn-close-public-event');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('public-event-modal').classList.add('hidden');
            });
        }
    };

    await loadEvents();

    // Escuchar el evento de inicio de sesión para actualizar el modal si está abierto
    window.addEventListener('auth-status-changed', () => {
        const modal = document.getElementById('public-event-modal');
        if (modal && !modal.classList.contains('hidden')) {
            const btnInscribirse = document.getElementById('btn-inscribirse-modal');
            const eventId = btnInscribirse.dataset.id;
            const detailsBtn = document.querySelector(`.details-btn[data-id="${eventId}"]`);
            if (detailsBtn) {
                detailsBtn.click(); // Re-ejecutar la lógica para recalcular el estado
            }
        }
    });

    // filtrado de eventos en calendario
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            // Re-query dynamically rendered cards
            const eventCards = document.querySelectorAll('.event-card');
            eventCards.forEach(card => {
                if (filter === 'all' || card.dataset.type === filter) {
                    card.style.display = 'block';
                    setTimeout(() => card.classList.remove('hidden', 'opacity-0', 'scale-95'), 10);
                } else {
                    card.classList.add('hidden', 'opacity-0', 'scale-95');
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        });
    });

    const btnCancelarGlobal = document.getElementById('btn-cancelar-inscripcion');
    if (btnCancelarGlobal) {
        btnCancelarGlobal.addEventListener('click', async () => {
            const eventId = btnCancelarGlobal.dataset.id;
            if (!eventId) return;

            const { data: userData } = await supabase.auth.getUser();
            if (!userData || !userData.user) return;

            // Opccional: mostrar confirmación rápida o loader
            const originalText = btnCancelarGlobal.textContent;
            btnCancelarGlobal.textContent = "Cancelando...";
            btnCancelarGlobal.disabled = true;

            try {
                const { error } = await supabase
                    .from('inscripciones_calendario')
                    .delete()
                    .eq('actividad_id', eventId)
                    .eq('user_id', userData.user.id);

                if (!error) {
                    const detailsBtn = document.querySelector(`.details-btn[data-id="${eventId}"]`);
                    if (detailsBtn) detailsBtn.click(); // Recargar modal
                } else {
                    alert("Hubo un error al cancelar. Inténtalo de nuevo.");
                }
            } catch (err) {
                alert("Error de conexión. Inténtalo de nuevo.");
            } finally {
                btnCancelarGlobal.textContent = originalText;
                btnCancelarGlobal.disabled = false;
            }
        });
    }
};
