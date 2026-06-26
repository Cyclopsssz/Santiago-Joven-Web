import { supabase } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatosEncuestas();
});

async function cargarDatosEncuestas() {
    try {
        const { data: encuestas, error } = await supabase
            .from('encuestas')
            .select('*');

        if (error) {
            console.error('Error obteniendo encuestas:', error);
            return;
        }

        if (!encuestas || encuestas.length === 0) {
            document.getElementById('encuestas-promedio-text').textContent = '0.0';
            document.getElementById('encuestas-tema-text').textContent = 'Sin datos aún';
            return;
        }

        // 1. Calcular Promedio Histórico (Todas las encuestas)
        const totalEstrellas = encuestas.reduce((acc, curr) => acc + (curr.calificacion || 0), 0);
        const promedio = totalEstrellas / encuestas.length;
        document.getElementById('encuestas-promedio-text').textContent = promedio.toFixed(1);
        
        // Pintar estrellas
        pintarEstrellas('encuestas-stars-container', promedio);

        // 2. Calcular Tema de Mayor Interés (Desde el lunes de esta semana)
        const inicioDeSemana = new Date();
        const diaDeLaSemana = inicioDeSemana.getDay();
        const diasRestar = diaDeLaSemana === 0 ? 6 : diaDeLaSemana - 1; // Ajustar para que el lunes sea el inicio
        inicioDeSemana.setDate(inicioDeSemana.getDate() - diasRestar);
        inicioDeSemana.setHours(0, 0, 0, 0);

        const encuestasSemanales = encuestas.filter(e => new Date(e.created_at) >= inicioDeSemana);

        if (encuestasSemanales.length === 0) {
            document.getElementById('encuestas-tema-text').textContent = 'Sin datos esta semana';
        } else {
            const conteoIntereses = {};
            encuestasSemanales.forEach(e => {
                if (e.intereses && Array.isArray(e.intereses)) {
                    e.intereses.forEach(interes => {
                        conteoIntereses[interes] = (conteoIntereses[interes] || 0) + 1;
                    });
                }
            });

            // Encontrar el mayor
            let interesGanador = 'Sin datos esta semana';
            let maxCount = 0;
            
            for (const [interes, count] of Object.entries(conteoIntereses)) {
                if (count > maxCount) {
                    maxCount = count;
                    interesGanador = interes;
                }
            }

            document.getElementById('encuestas-tema-text').innerHTML = `<i class="fas fa-heart-pulse mr-2"></i>${interesGanador}`;
        }

    } catch (e) {
        console.error('Excepción al cargar datos de encuestas:', e);
    }
}

function pintarEstrellas(containerId, rating) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            container.innerHTML += '<i class="fas fa-star text-yellow-500"></i>';
        } else if (i === fullStars && hasHalfStar) {
            container.innerHTML += '<i class="fas fa-star-half-alt text-yellow-500"></i>';
        } else {
            container.innerHTML += '<i class="far fa-star text-yellow-500"></i>';
        }
    }
}
