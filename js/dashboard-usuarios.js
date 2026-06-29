import { supabase } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('usuarios-tbody');
    const roleFilter = document.getElementById('role-filter');
    const ageFilter = document.getElementById('age-filter');
    const searchInput = document.querySelector('input[placeholder="Buscar por nombre o correo..."]');
    
    // Elementos del Modal
    const editModal = document.getElementById('edit-user-modal');
    const inputId = document.getElementById('edit-user-id');
    const inputName = document.getElementById('edit-user-name');
    const inputEmail = document.getElementById('edit-user-email');
    const inputBirthdate = document.getElementById('edit-user-birthdate');
    const btnSave = document.getElementById('btn-save-user');
    
    const banModal = document.getElementById('ban-user-modal');
    const unbanModal = document.getElementById('unban-user-modal');
    const banDurationContainer = document.getElementById('ban-duration-container');
    const banCustomDateContainer = document.getElementById('ban-custom-date-container');

    let allUsers = [];

    // Función para calcular la edad
    function calculateAge(birthDate) {
        if (!birthDate) return 'N/A';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }

    // Función global para abrir el modal desde el HTML generado dinámicamente
    window.openEditModal = async (userId) => {
        const user = allUsers.find(u => u.id === userId);
        if (!user) return;
        
        // Llenar el modal con los datos reales
        inputId.value = user.id;
        inputName.value = `${user.nombre || ''} ${user.apellido || ''}`.trim();
        inputEmail.value = user.correo || '';
        inputBirthdate.value = user.fecha_nacimiento || ''; // Formato esperado para input date: YYYY-MM-DD
        
        // Cargar historial de infracciones
        const historyContainer = document.getElementById('user-ban-history');
        if (historyContainer) {
            historyContainer.innerHTML = '<p class="text-gray-500 text-center py-2">Cargando historial...</p>';
            try {
                const { data, error } = await supabase
                    .from('historial_baneos')
                    .select('*')
                    .eq('user_id', userId)
                    .order('fecha_inicio', { ascending: false });
                
                if (error) throw error;
                if (data && data.length > 0) {
                    historyContainer.innerHTML = data.map(b => `
                        <div class="p-3 bg-white border border-gray-200 rounded-lg">
                            <div class="flex justify-between items-start mb-1">
                                <span class="font-semibold ${b.estado_sancion === 'activo' ? 'text-red-600' : 'text-gray-700'}">${b.categoria_razon}</span>
                                <span class="text-xs px-2 py-0.5 rounded ${b.estado_sancion === 'activo' ? 'bg-red-100 text-red-700' : (b.estado_sancion === 'revocado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700')}">${b.estado_sancion.toUpperCase()}</span>
                            </div>
                            <p class="text-xs text-gray-500 mb-1">Tipo: ${b.tipo_sancion} | Fecha: ${new Date(b.fecha_inicio).toLocaleDateString()}</p>
                            ${b.nota_interna ? `<p class="text-gray-700 italic border-l-2 border-gray-300 pl-2 mt-2">${b.nota_interna}</p>` : ''}
                            ${b.motivo_revocacion ? `<p class="text-green-700 italic border-l-2 border-green-300 pl-2 mt-2 text-xs">Revocado: ${b.motivo_revocacion}</p>` : ''}
                        </div>
                    `).join('');
                } else {
                    historyContainer.innerHTML = '<p class="text-gray-500 text-center py-2">El usuario no tiene infracciones previas.</p>';
                }
            } catch (err) {
                console.error(err);
                historyContainer.innerHTML = '<p class="text-red-500 text-center py-2">Error al cargar historial.</p>';
            }
        }

        // Mostrar el modal
        editModal.classList.remove('hidden');
    };

    // Función global para cambiar el rol de un usuario
    window.toggleUserRole = async (userId, currentRole) => {
        const newRole = currentRole === 'Admin' ? 'Usuario' : 'Admin';
        
        // Confirmación rápida
        if (!confirm(`¿Estás seguro de cambiar el rol de este usuario a ${newRole}?`)) return;

        try {
            const { error } = await supabase
                .from('perfiles')
                .update({ rol: newRole })
                .eq('id', userId);

            if (error) throw error;
            
            // Recargar la tabla para ver el cambio de color al instante
            await loadUsers();
        } catch (error) {
            console.error('Error al cambiar rol:', error);
            alert('Hubo un error al actualizar el rol.');
        }
    };

    // Lógica para guardar los cambios a Supabase
    if (btnSave) {
        btnSave.addEventListener('click', async () => {
            const id = inputId.value;
            const nameParts = inputName.value.trim().split(' ');
            const nombre = nameParts[0] || '';
            const apellido = nameParts.slice(1).join(' ') || '';
            const correo = inputEmail.value;
            const fecha_nacimiento = inputBirthdate.value;

            btnSave.textContent = 'Guardando...';
            btnSave.disabled = true;

            try {
                const { error } = await supabase
                    .from('perfiles')
                    .update({ nombre, apellido, correo, fecha_nacimiento })
                    .eq('id', id);

                if (error) throw error;

                // Cerrar modal y recargar datos
                editModal.classList.add('hidden');
                await loadUsers(); // Refresca la tabla
            } catch (error) {
                console.error('Error actualizando usuario:', error);
                alert('Hubo un error al actualizar el usuario. Revisa los permisos.');
            } finally {
                btnSave.textContent = 'Guardar Cambios';
                btnSave.disabled = false;
            }
        });
    }

    // Función para renderizar un usuario
    function renderUserRow(user) {
        const tr = document.createElement('tr');
        const age = calculateAge(user.fecha_nacimiento);
        
        // Determinar edad para filtro
        let ageGroup = 'other';
        if (age !== 'N/A') {
            if (age >= 14 && age <= 17) ageGroup = '14-17';
            else if (age >= 18 && age <= 24) ageGroup = '18-24';
            else if (age >= 25 && age <= 29) ageGroup = '25-29';
        }

        tr.className = 'bg-white border-b hover:bg-gray-50 transition-colors user-row';
        tr.setAttribute('data-role', user.rol ? user.rol.toLowerCase() : 'user');
        tr.setAttribute('data-age', ageGroup);

        const initial = user.nombre ? user.nombre.charAt(0).toUpperCase() : '?';
        const roleColor = user.rol === 'Admin' ? 'purple' : 'blue';
        const statusColor = user.estado === 'Suspendido' ? 'red' : 'green';
        
        const dateObj = new Date(user.created_at);
        const formattedDate = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('es-ES') : 'N/A';
        const fullName = `${user.nombre || ''} ${user.apellido || ''}`.trim();

        const avatarHTML = user.foto_perfil 
            ? `<img src="${user.foto_perfil}" alt="Avatar" class="w-8 h-8 rounded-full object-cover border border-gray-200">`
            : `<div class="w-8 h-8 rounded-full bg-${roleColor}-100 text-${roleColor}-600 flex items-center justify-center font-bold">${initial}</div>`;

        tr.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    ${avatarHTML}
                    <div>
                        <p class="font-semibold text-gray-900 user-name">${fullName}</p>
                        <p class="text-xs text-gray-500 user-email">${user.correo || 'Sin correo'}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">${age}</td>
            <td class="px-6 py-4">
                <span class="bg-${roleColor}-100 text-${roleColor}-800 text-xs font-medium px-2.5 py-0.5 rounded border border-${roleColor}-200">${user.rol || 'Usuario'}</span>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="h-2.5 w-2.5 rounded-full bg-${statusColor}-500 mr-2"></div> ${user.estado || 'Activo'}
                </div>
            </td>
            <td class="px-6 py-4">${formattedDate}</td>
            <td class="px-6 py-4 text-right space-x-2">
                <button class="text-gray-400 hover:text-gray-700 transition-colors" title="Configurar Usuario" onclick="window.openEditModal('${user.id}')">
                    <i class="fas fa-cog"></i>
                </button>
                <button class="text-gray-400 hover:text-primary-500 transition-colors" title="Editar Rol" onclick="window.toggleUserRole('${user.id}', '${user.rol || 'Usuario'}')">
                    <i class="fas fa-user-edit"></i>
                </button>
                <button class="text-${user.estado === 'Suspendido' ? 'red' : 'gray'}-400 hover:text-${user.estado === 'Suspendido' ? 'red' : 'gray'}-700 transition-colors" title="${user.estado === 'Suspendido' ? 'Reactivar' : 'Suspender'}" onclick="window.manageUserStatus('${user.id}', '${user.estado}')">
                    <i class="fas fa-${user.estado === 'Suspendido' ? 'undo' : 'ban'}"></i>
                </button>
            </td>
        `;
        return tr;
    }

    // Filtros
    function applyFilters() {
        const selectedRole = roleFilter ? roleFilter.value : 'all';
        const selectedAge = ageFilter ? ageFilter.value : 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const rows = document.querySelectorAll('.user-row');

        rows.forEach(row => {
            const rowRole = row.getAttribute('data-role');
            const rowAge = row.getAttribute('data-age');
            const nameEl = row.querySelector('.user-name');
            const emailEl = row.querySelector('.user-email');

            const name = nameEl ? nameEl.textContent.toLowerCase() : '';
            const email = emailEl ? emailEl.textContent.toLowerCase() : '';

            const roleMatch = selectedRole === 'all' || rowRole === selectedRole;
            const ageMatch = selectedAge === 'all' || rowAge === selectedAge;
            const searchMatch = searchTerm === '' || name.includes(searchTerm) || email.includes(searchTerm);

            if (roleMatch && ageMatch && searchMatch) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    if (roleFilter) roleFilter.addEventListener('change', applyFilters);
    if (ageFilter) ageFilter.addEventListener('change', applyFilters);
    if (searchInput) searchInput.addEventListener('input', applyFilters);

    async function loadUsers() {
        try {
            if (!tbody) return;
            tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center">Cargando usuarios...</td></tr>';
            
            const { data, error } = await supabase.from('perfiles').select('*').order('created_at', { ascending: false });
            
            if (error) throw error;
            
            tbody.innerHTML = '';
            allUsers = data;

            if (allUsers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center">No hay usuarios registrados.</td></tr>';
                return;
            }

            allUsers.forEach(user => {
                tbody.appendChild(renderUserRow(user));
            });

            // update counter
            const counter = document.querySelector('.dashboard-card span.text-sm.text-gray-500');
            if (counter) {
                counter.textContent = `Mostrando ${allUsers.length} usuarios`;
            }

            // update metrics
            const metricTotal = document.getElementById('metric-total-users');
            const metricAge = document.getElementById('metric-avg-age');
            const metricSuspended = document.getElementById('metric-suspended-users');

            if (metricTotal && metricAge && metricSuspended) {
                metricTotal.textContent = allUsers.length;

                let suspendedCount = 0;
                let validAgesCount = 0;
                let totalAge = 0;

                allUsers.forEach(user => {
                    if (user.estado === 'Suspendido') suspendedCount++;
                    
                    const age = calculateAge(user.fecha_nacimiento);
                    if (age !== 'N/A') {
                        totalAge += age;
                        validAgesCount++;
                    }
                });

                metricSuspended.textContent = suspendedCount;
                metricAge.textContent = validAgesCount > 0 ? Math.round(totalAge / validAgesCount) + ' años' : 'N/A';
            }

        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Error al cargar usuarios. Verifica los permisos de Supabase.</td></tr>';
            }
        }
    }

    // Lógica para Modales de Baneo y Desbaneo
    window.manageUserStatus = (userId, estado) => {
        if (estado === 'Suspendido') {
            document.getElementById('unban-user-id').value = userId;
            document.getElementById('unban-reason').value = '';
            unbanModal.classList.remove('hidden');
        } else {
            document.getElementById('ban-user-id').value = userId;
            document.getElementById('ban-type').value = 'temporal';
            document.getElementById('ban-duration').value = '24h';
            document.getElementById('ban-reason').value = 'Spam';
            document.getElementById('ban-note').value = '';
            document.getElementById('ban-custom-date').value = '';
            banDurationContainer.classList.remove('hidden');
            banCustomDateContainer.classList.add('hidden');
            banModal.classList.remove('hidden');
        }
    };

    const banTypeEl = document.getElementById('ban-type');
    const banDurationEl = document.getElementById('ban-duration');
    if (banTypeEl) {
        banTypeEl.addEventListener('change', (e) => {
            if (e.target.value === 'permanente') {
                banDurationContainer.classList.add('hidden');
                banCustomDateContainer.classList.add('hidden');
            } else {
                banDurationContainer.classList.remove('hidden');
                if (banDurationEl.value === 'custom') {
                    banCustomDateContainer.classList.remove('hidden');
                }
            }
        });
    }

    if (banDurationEl) {
        banDurationEl.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                banCustomDateContainer.classList.remove('hidden');
            } else {
                banCustomDateContainer.classList.add('hidden');
            }
        });
    }

    const btnConfirmBan = document.getElementById('btn-confirm-ban');
    if (btnConfirmBan) {
        btnConfirmBan.addEventListener('click', async () => {
            const userId = document.getElementById('ban-user-id').value;
            const tipoSancion = document.getElementById('ban-type').value;
            const duration = document.getElementById('ban-duration').value;
            const customDate = document.getElementById('ban-custom-date').value;
            const categoria = document.getElementById('ban-reason').value;
            const nota = document.getElementById('ban-note').value;

            // Calcular fecha de fin
            let fechaFin = null;
            if (tipoSancion === 'temporal') {
                const now = new Date();
                if (duration === '24h') now.setDate(now.getDate() + 1);
                else if (duration === '7d') now.setDate(now.getDate() + 7);
                else if (duration === '30d') now.setDate(now.getDate() + 30);
                else if (duration === 'custom') {
                    if (!customDate) return alert('Debes seleccionar una fecha de fin personalizada.');
                    fechaFin = new Date(customDate);
                }
                if (duration !== 'custom') fechaFin = now;
            }

            btnConfirmBan.disabled = true;
            btnConfirmBan.textContent = 'Aplicando...';

            try {
                // Conseguir ID del admin actual (simulado o real desde auth)
                const { data: userData } = await supabase.auth.getUser();
                const adminId = userData?.user?.id || null;

                // 1. Guardar en historial
                const { error: histError } = await supabase.from('historial_baneos').insert({
                    user_id: userId,
                    admin_id: adminId,
                    tipo_sancion: tipoSancion,
                    categoria_razon: categoria,
                    nota_interna: nota,
                    fecha_fin: fechaFin ? fechaFin.toISOString() : null,
                    estado_sancion: 'activo'
                });
                if (histError) throw histError;

                // 2. Actualizar perfil a Suspendido
                const { error: perfError } = await supabase.from('perfiles').update({ estado: 'Suspendido' }).eq('id', userId);
                if (perfError) throw perfError;

                banModal.classList.add('hidden');
                await loadUsers();
            } catch (err) {
                console.error(err);
                alert('Hubo un error al aplicar la sanción.');
            } finally {
                btnConfirmBan.disabled = false;
                btnConfirmBan.textContent = 'Aplicar Sanción';
            }
        });
    }

    const btnConfirmUnban = document.getElementById('btn-confirm-unban');
    if (btnConfirmUnban) {
        btnConfirmUnban.addEventListener('click', async () => {
            const userId = document.getElementById('unban-user-id').value;
            const motivo = document.getElementById('unban-reason').value;

            if (!motivo) return alert('Debes escribir un motivo de revocación.');

            btnConfirmUnban.disabled = true;
            btnConfirmUnban.textContent = 'Revocando...';

            try {
                const { data: userData } = await supabase.auth.getUser();
                const adminId = userData?.user?.id || null;

                // 1. Revocar registros activos en el historial
                const { error: histError } = await supabase.from('historial_baneos')
                    .update({ 
                        estado_sancion: 'revocado',
                        motivo_revocacion: motivo,
                        admin_revocador_id: adminId
                    })
                    .eq('user_id', userId)
                    .eq('estado_sancion', 'activo');
                
                if (histError) throw histError;

                // 2. Cambiar perfil a Activo
                const { error: perfError } = await supabase.from('perfiles').update({ estado: 'Activo' }).eq('id', userId);
                if (perfError) throw perfError;

                unbanModal.classList.add('hidden');
                await loadUsers();
            } catch (err) {
                console.error(err);
                alert('Hubo un error al revocar la sanción.');
            } finally {
                btnConfirmUnban.disabled = false;
                btnConfirmUnban.textContent = 'Revocar y Reactivar';
            }
        });
    }

    loadUsers();
});
