import { supabase } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) {
        alert('No se especificó un evento válido.');
        window.location.href = 'dashboard-calendario.html';
        return;
    }

    // DOM Elements
    const loadingContainer = document.getElementById('loading-container');
    const contentContainer = document.getElementById('content-container');
    const detailSubtitle = document.getElementById('detail-subtitle');
    
    const eventTitle = document.getElementById('event-title');
    const eventBadges = document.getElementById('event-badges');
    const eventDesc = document.getElementById('event-desc');
    
    const cuposCircle = document.getElementById('cupos-circle');
    const cuposInscritos = document.getElementById('cupos-inscritos');
    const cuposTotal = document.getElementById('cupos-total');
    const cuposStatusText = document.getElementById('cupos-status-text');
    
    const inscritosBadge = document.getElementById('inscritos-badge');
    const tableBody = document.getElementById('inscritos-table-body');

    const typeConfig = {
        feria: { label: 'Feria', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
        taller: { label: 'Taller', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
        curso: { label: 'Curso', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
        campana: { label: 'Campaña', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    };

    try {
        // 1. Cargar el Evento
        const { data: evento, error: errorEvento } = await supabase
            .from('actividades')
            .select('*')
            .eq('id', eventId)
            .single();

        if (errorEvento || !evento) {
            console.error('Error cargando evento:', errorEvento);
            alert('El evento no existe o fue eliminado.');
            window.location.href = 'dashboard-calendario.html';
            return;
        }

        // Renderizar Información del Evento
        detailSubtitle.textContent = `Gestión de asistentes para: ${evento.titulo}`;
        eventTitle.textContent = evento.titulo;
        eventDesc.textContent = evento.descripcion || 'Sin descripción provista.';

        const cfg = typeConfig[evento.tipo] || typeConfig.feria;
        let dateObj = evento.fecha ? new Date(evento.fecha + 'T12:00:00') : new Date();
        if (isNaN(dateObj.getTime())) dateObj = new Date(evento.fecha);
        if (isNaN(dateObj.getTime())) dateObj = new Date();
        
        const dateFormatted = dateObj.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
        
        eventBadges.innerHTML = `
            <span class="${cfg.bg} ${cfg.text} text-xs font-medium px-2.5 py-1 rounded border ${cfg.border}">${cfg.label}</span>
            <span class="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded border border-gray-200"><i class="fas fa-calendar-day mr-1"></i> ${dateFormatted}</span>
        `;

        // 2. Cargar Inscripciones
        const { data: inscripciones, error: errorInsc } = await supabase
            .from('inscripciones_calendario')
            .select('*')
            .eq('actividad_id', eventId);

        if (errorInsc) {
            console.error('Error cargando inscripciones:', errorInsc);
            throw errorInsc;
        }

        const totalInscritos = inscripciones ? inscripciones.length : 0;

        // Renderizar Cupos
        if (evento.tiene_cupo) {
            cuposInscritos.textContent = totalInscritos;
            cuposTotal.textContent = `de ${evento.cupos} inscritos`;
            
            const porcentaje = (totalInscritos / evento.cupos) * 100;
            if (porcentaje >= 100) {
                cuposCircle.className = "w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center mb-2 border-red-500 bg-red-50";
                cuposStatusText.textContent = "Cupos Agotados";
                cuposStatusText.className = "font-bold text-red-600";
            } else if (porcentaje >= 80) {
                cuposCircle.className = "w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center mb-2 border-yellow-500 bg-yellow-50";
                cuposStatusText.textContent = "Casi Lleno";
                cuposStatusText.className = "font-bold text-yellow-600";
            } else {
                cuposCircle.className = "w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center mb-2 border-green-500 bg-green-50";
                cuposStatusText.textContent = "Cupos Disponibles";
                cuposStatusText.className = "font-bold text-green-600";
            }
        } else {
            cuposInscritos.textContent = totalInscritos;
            cuposTotal.textContent = `Inscritos`;
            cuposCircle.className = "w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center mb-2 border-blue-500 bg-blue-50";
            cuposStatusText.textContent = "Acceso Liberado";
            cuposStatusText.className = "font-bold text-blue-600";
        }

        inscritosBadge.textContent = totalInscritos;

        // 3. Cargar Perfiles de los inscritos (Join manual para evitar errores de FK si no están declaradas)
        if (totalInscritos === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">Aún no hay jóvenes inscritos en este evento.</td></tr>`;
        } else {
            const userIds = inscripciones.map(i => i.user_id);
            
            const { data: perfiles, error: errorPerf } = await supabase
                .from('perfiles')
                .select('*')
                .in('id', userIds);

            if (errorPerf) {
                console.error('Error cargando perfiles:', errorPerf);
                throw errorPerf;
            }

            // Mapear rápido para búsqueda
            const perfilesMap = {};
            if (perfiles) {
                perfiles.forEach(p => { perfilesMap[p.id] = p; });
            }

            tableBody.innerHTML = inscripciones.map(ins => {
                const perfil = perfilesMap[ins.user_id] || {};
                const nombreFull = `${perfil.nombre || 'Usuario'} ${perfil.apellido || 'Desconocido'}`;
                const rut = perfil.rut || 'No registra';
                const correo = perfil.correo || 'No registra';
                const estado = ins.estado || 'Confirmado';
                
                const fechaInsc = new Date(ins.created_at).toLocaleDateString('es-CL');

                let estadoClass = "bg-green-100 text-green-700 border-green-200";
                if (estado.toLowerCase() === 'cancelado') estadoClass = "bg-red-100 text-red-700 border-red-200";
                else if (estado.toLowerCase() === 'en_espera' || estado.toLowerCase() === 'en espera') estadoClass = "bg-yellow-100 text-yellow-700 border-yellow-200";

                const avatarHTML = perfil.foto_perfil
                    ? `<img src="${perfil.foto_perfil}" alt="Avatar" class="w-8 h-8 rounded-full object-cover border border-gray-200">`
                    : `<div class="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs uppercase">${nombreFull.charAt(0)}</div>`;

                return `
                <tr class="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 font-medium text-gray-900">
                        <div class="flex items-center gap-3">
                            ${avatarHTML}
                            ${nombreFull}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">${rut}</td>
                    <td class="px-6 py-4 text-gray-500">${correo}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-gray-500"><i class="far fa-clock mr-1"></i> ${fechaInsc}</td>
                    <td class="px-6 py-4">
                        <span class="${estadoClass} text-xs font-medium px-2.5 py-0.5 rounded border capitalize">${estado}</span>
                    </td>
                </tr>
                `;
            }).join('');
        }

        // Mostrar todo
        loadingContainer.classList.add('hidden');
        contentContainer.classList.remove('hidden');

    } catch (err) {
        console.error('Error general cargando detalles:', err);
        loadingContainer.innerHTML = `<div class="text-red-500 flex flex-col items-center"><i class="fas fa-exclamation-triangle text-3xl mb-2"></i><p>Error al cargar los detalles.</p></div>`;
    }
});
