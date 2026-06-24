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
        
        const { data, error } = await supabase
            .from('actividades')
            .select('*')
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
            const dateObj = ev.fecha ? new Date(ev.fecha + 'T12:00:00') : new Date();
            const dateStr = dateObj.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });

            return `
            <div class="event-card card relative transition-all duration-300" data-type="${ev.tipo}">
              <div class="px-3 py-1 ${cfg.bg} ${cfg.text} rounded-full text-sm font-semibold inline-block mb-3">
                ${cfg.label}
              </div>
              <h4 class="text-xl font-semibold mb-2">${ev.titulo}</h4>
              <p class="text-gray-600 mb-4"><i class="fas fa-calendar-day mr-2"></i>${dateStr}</p>
              ${ev.tiene_cupo ? 
                `<button class="btn btn-outline w-full mt-auto enroll-btn" data-title="${ev.titulo}" data-id="${ev.id}">Inscribirse</button>` 
                : `<p class="text-sm text-gray-500 italic mt-auto">Entrada Liberada</p>`}
            </div>
            `;
        }).join('');
    };

    await loadEvents();

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
};
