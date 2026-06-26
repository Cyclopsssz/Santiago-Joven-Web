import { supabase } from './api.js';

let todasLasEncuestas = [];

document.addEventListener('DOMContentLoaded', async () => {
    await cargarEncuestas();

    document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);
    
    // Auto-filter on change
    document.getElementById('filter-edad').addEventListener('change', renderizarEncuestas);
    document.getElementById('filter-ocupacion').addEventListener('change', renderizarEncuestas);
    document.getElementById('filter-estrellas').addEventListener('change', renderizarEncuestas);
});

async function cargarEncuestas() {
    const loadingEl = document.getElementById('encuestas-loading');
    const gridEl = document.getElementById('encuestas-grid');
    const emptyEl = document.getElementById('encuestas-empty');

    loadingEl.classList.remove('hidden');
    gridEl.classList.add('hidden');
    emptyEl.classList.add('hidden');

    try {
        const { data, error } = await supabase
            .from('encuestas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        todasLasEncuestas = data || [];
        renderizarEncuestas();

    } catch (e) {
        console.error('Error al cargar encuestas:', e);
        loadingEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
        emptyEl.querySelector('p').textContent = 'Ocurrió un error al cargar los datos.';
    }
}

function limpiarFiltros() {
    document.getElementById('filter-edad').value = '';
    document.getElementById('filter-ocupacion').value = '';
    document.getElementById('filter-estrellas').value = '0';
    renderizarEncuestas();
}

function renderizarEncuestas() {
    const loadingEl = document.getElementById('encuestas-loading');
    const gridEl = document.getElementById('encuestas-grid');
    const emptyEl = document.getElementById('encuestas-empty');

    // Obtener valores de filtros
    const edadFiltro = document.getElementById('filter-edad').value;
    const ocupacionFiltro = document.getElementById('filter-ocupacion').value;
    const estrellasFiltro = parseInt(document.getElementById('filter-estrellas').value, 10) || 0;

    // Aplicar filtros
    const filtradas = todasLasEncuestas.filter(enc => {
        let cumpleEdad = edadFiltro === '' || enc.rango_edad === edadFiltro;
        let cumpleOcupacion = false;
        if (ocupacionFiltro === '') {
            cumpleOcupacion = true;
        } else if (ocupacionFiltro === 'otro') {
            cumpleOcupacion = enc.ocupacion === 'otro' || !['estudiante', 'trabajador', 'buscando', 'ambos'].includes(enc.ocupacion);
        } else {
            cumpleOcupacion = enc.ocupacion === ocupacionFiltro;
        }
        let cumpleEstrellas = estrellasFiltro === 0 || (enc.calificacion || 0) === estrellasFiltro;
        return cumpleEdad && cumpleOcupacion && cumpleEstrellas;
    });

    loadingEl.classList.add('hidden');

    if (filtradas.length === 0) {
        gridEl.classList.add('hidden');
        emptyEl.classList.remove('hidden');
        return;
    }

    emptyEl.classList.add('hidden');
    gridEl.classList.remove('hidden');
    gridEl.innerHTML = '';

    filtradas.forEach(enc => {
        const fecha = new Date(enc.created_at).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const interesesHtml = enc.intereses && enc.intereses.length > 0 
            ? enc.intereses.map(i => `<span class="bg-primary-50 text-primary-600 text-xs px-2 py-1 rounded border border-primary-100">${i}</span>`).join(' ')
            : '<span class="text-gray-400 text-xs italic">Ninguno</span>';

        // Estrellas
        let estrellasHtml = '';
        for (let i = 0; i < 5; i++) {
            if (i < (enc.calificacion || 0)) {
                estrellasHtml += '<i class="fas fa-star text-yellow-400 text-sm"></i>';
            } else {
                estrellasHtml += '<i class="far fa-star text-yellow-400 text-sm"></i>';
            }
        }

        const ocupacionLabel = enc.ocupacion_otro ? `Otro (${enc.ocupacion_otro})` : enc.ocupacion;

        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4 relative';
        card.innerHTML = `
            <div class="flex justify-between items-start border-b border-gray-100 pb-3">
                <div>
                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">${fecha}</span>
                </div>
                <div class="flex gap-1">
                    ${estrellasHtml}
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Edad</p>
                    <p class="text-sm font-medium text-gray-800">${enc.rango_edad || 'No especificada'}</p>
                </div>
                <div>
                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Ocupación</p>
                    <p class="text-sm font-medium text-gray-800 capitalize">${ocupacionLabel || 'No especificada'}</p>
                </div>
            </div>

            <div>
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Intereses</p>
                <div class="flex flex-wrap gap-2">
                    ${interesesHtml}
                </div>
            </div>

            ${enc.problematica ? `
            <div class="bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
                <p class="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1"><i class="fas fa-exclamation-circle mr-1"></i> Principal Problema</p>
                <p class="text-sm text-gray-700 italic">"${enc.problematica}"</p>
            </div>
            ` : ''}

            ${enc.sugerencia ? `
            <div class="bg-green-50 p-3 rounded-lg border border-green-100 mt-1">
                <p class="text-xs font-semibold text-green-500 uppercase tracking-wider mb-1"><i class="fas fa-lightbulb mr-1"></i> Sugerencia</p>
                <p class="text-sm text-gray-700 italic">"${enc.sugerencia}"</p>
            </div>
            ` : ''}
        `;
        
        gridEl.appendChild(card);
    });
}
