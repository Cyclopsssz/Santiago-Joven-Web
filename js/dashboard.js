import { supabase } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    await cargarDatosEncuestas();
    await cargarProximasActividades();
    await cargarMetricasUsuarios();
    await cargarDemografia();
});

const typeConfig = {
    feria: { label: 'Feria', bg: 'bg-blue-100', text: 'text-blue-600', icon: 'fa-store' },
    taller: { label: 'Taller', bg: 'bg-yellow-100', text: 'text-yellow-600', icon: 'fa-chalkboard-teacher' },
    curso: { label: 'Curso', bg: 'bg-green-100', text: 'text-green-600', icon: 'fa-laptop-code' },
    campana: { label: 'Campaña', bg: 'bg-red-100', text: 'text-red-600', icon: 'fa-bullhorn' },
};

async function cargarProximasActividades() {
    try {
        const today = new Date();
        const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        const { data: eventos, error } = await supabase
            .from('actividades')
            .select('*')
            .gte('fecha', todayStr)
            .order('fecha', { ascending: true })
            .limit(3);

        if (error) {
            console.error('Error obteniendo actividades:', error);
            return;
        }

        const container = document.getElementById('proximas-actividades-list');
        if (!container) return;

        if (!eventos || eventos.length === 0) {
            container.innerHTML = `<div class="text-center text-gray-500 py-4">No hay actividades próximas agendadas.</div>`;
            return;
        }

        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        container.innerHTML = eventos.map(ev => {
            let fechaObj = ev.fecha ? new Date(ev.fecha + 'T12:00:00') : new Date();
            if (isNaN(fechaObj.getTime())) fechaObj = new Date(ev.fecha);
            if (isNaN(fechaObj.getTime())) fechaObj = new Date();
            
            const mesStr = meses[fechaObj.getMonth()] || 'Mes';
            const diaStr = fechaObj.getDate() || '00';
            
            // Calcular días faltantes
            const hoy = new Date();
            hoy.setHours(0,0,0,0);
            const fechaEvento = new Date(fechaObj);
            fechaEvento.setHours(0,0,0,0);
            
            const diffTime = fechaEvento - hoy;
            // Evitar -0 o bugs con zonas horarias
            const diffDays = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
            
            let diasFaltantesText = `Faltan ${diffDays} días`;
            if (diffDays === 0) diasFaltantesText = '¡Es hoy!';
            else if (diffDays === 1) diasFaltantesText = 'Mañana';

            const cfg = typeConfig[ev.tipo] || typeConfig.feria;

            return `
            <div class="flex items-center gap-4 p-3 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors">
              <div class="w-14 h-14 rounded-lg ${cfg.bg} ${cfg.text} flex flex-col items-center justify-center flex-shrink-0">
                <span class="text-xs font-bold uppercase">${mesStr}</span>
                <span class="text-xl font-bold">${diaStr}</span>
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-800 line-clamp-1">${ev.titulo}</h4>
                <p class="text-sm text-gray-500"><i class="fas ${cfg.icon} mr-1"></i>${cfg.label}</p>
              </div>
              <div class="hidden sm:block">
                <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">${diasFaltantesText}</span>
              </div>
            </div>
            `;
        }).join('');

    } catch (e) {
        console.error('Excepción al cargar próximas actividades:', e);
    }
}

async function cargarMetricasUsuarios() {
    const totalUsersEl = document.getElementById('metric-total-users');
    const growthUsersEl = document.getElementById('metric-growth-users');
    const timeFilter = document.getElementById('metric-time-filter');

    if (!totalUsersEl || !growthUsersEl || !timeFilter) return;

    const fetchMetrics = async () => {
        try {
            totalUsersEl.innerHTML = '<i class="fas fa-spinner fa-spin text-xl"></i>';
            growthUsersEl.innerHTML = '<i class="fas fa-spinner fa-spin text-xl"></i>';
            
            const now = new Date();
            let startDate = new Date();
            const filterVal = timeFilter.value;
            
            if (filterVal === 'mes') {
                startDate.setMonth(now.getMonth() - 1);
            } else if (filterVal === 'semana') {
                startDate.setDate(now.getDate() - 7);
            } else if (filterVal === 'dia') {
                startDate.setDate(now.getDate() - 1);
            }
            
            const startStr = startDate.toISOString();

            // Llamada al RPC creado en Supabase
            const { data, error } = await supabase.rpc('get_user_metrics', { start_date: startStr });
            
            if (error) {
                // Fallback temporal si la función RPC no existe todavía en Supabase
                console.warn('Función RPC no encontrada o error:', error);
                const { count: totalCount } = await supabase.from('perfiles').select('*', { count: 'exact', head: true });
                const { count: recentCount } = await supabase.from('perfiles').select('*', { count: 'exact', head: true }).gte('created_at', startStr);
                
                totalUsersEl.textContent = (totalCount || 0).toLocaleString();
                growthUsersEl.textContent = '+' + (recentCount || 0).toLocaleString();
                return;
            }
            
            totalUsersEl.textContent = (data.total || 0).toLocaleString();
            growthUsersEl.textContent = '+' + (data.recent || 0).toLocaleString();
            
        } catch (error) {
            console.error('Error fetching user metrics:', error);
            totalUsersEl.textContent = '-';
            growthUsersEl.textContent = '-';
        }
    };

    timeFilter.addEventListener('change', fetchMetrics);
    await fetchMetrics();
}


async function cargarDemografia() {
    const bar1 = document.getElementById('demo-bar-1');
    const pct1 = document.getElementById('demo-pct-1');
    const bar2 = document.getElementById('demo-bar-2');
    const pct2 = document.getElementById('demo-pct-2');
    const bar3 = document.getElementById('demo-bar-3');
    const pct3 = document.getElementById('demo-pct-3');

    if (!bar1 || !pct1 || !bar2 || !pct2 || !bar3 || !pct3) return;

    try {
        const { data, error } = await supabase.rpc('get_user_demographics');
        
        if (error || !data) {
            console.warn('Función RPC de demografía no encontrada o error:', error);
            return;
        }

        console.log('📊 Datos crudos de demografía desde Supabase:', data);

        const total = data.total > 0 ? data.total : 1;
        const p1 = Math.round((data.group_14_17 / total) * 100) || 0;
        const p2 = Math.round((data.group_18_24 / total) * 100) || 0;
        const p3 = Math.round((data.group_25_plus / total) * 100) || 0;

        // Pequeño timeout para que se active la transición CSS de altura
        setTimeout(() => {
            bar1.style.height = `${Math.max(p1, 5)}%`; // 5% minimo para que se vea la barrita
            pct1.textContent = `${p1}%`;

            bar2.style.height = `${Math.max(p2, 5)}%`;
            pct2.textContent = `${p2}%`;

            bar3.style.height = `${Math.max(p3, 5)}%`;
            pct3.textContent = `${p3}%`;
        }, 300);

    } catch (err) {
        console.error('Error fetching demographics:', err);
    }
}

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
