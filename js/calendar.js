import { API_CONFIG } from './api.js';
import { showStatusMessage } from './utils.js';

export const initCalendar = () => {
    // filtrado de eventos en calendario
    const filterButtons = document.querySelectorAll('.filter-btn');
    const eventCardsContainer = document.getElementById('event-list');
    let eventCards = document.querySelectorAll('.event-card');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            // Re-query in case new ones were added
            eventCards = document.querySelectorAll('.event-card');
            eventCards.forEach(card => {
                if (filter === 'all' || card.dataset.type === filter) {
                    card.style.display = 'block';
                    setTimeout(() => card.classList.remove('hidden'), 10);
                } else {
                    card.classList.add('hidden');
                    setTimeout(() => card.style.display = 'none', 300);
                }
            });
        });
    });


};
