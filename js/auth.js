import { supabase } from './api.js';
import { showStatusMessage } from './utils.js';

export let currentUser = null;
export let currentUserEmail = null;
export let currentUserId = null;
export let userRole = null;

// Helper global para forzar auth
export const requireAuth = (callback) => {
    return (e) => {
        if (!currentUser) {
            if (e && e.preventDefault) e.preventDefault();
            if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
            openAuthModal();
        } else if (callback) {
            callback(e);
        }
    };
};

let authBackdrop, authModalsContainer, mainContent, loginModal, registerModal, profileModal, enrollmentsModal, notificationsModal;
let authTimeout = null;
let currentModal = null;

export const openAuthModal = () => {
    if (authTimeout) {
        clearTimeout(authTimeout);
        authTimeout = null;
    }
    if (authBackdrop && authModalsContainer && mainContent) {
        // Make interactive immediately
        authBackdrop.classList.remove('pointer-events-none');
        authModalsContainer.classList.remove('pointer-events-none');
        // Fade in
        requestAnimationFrame(() => {
            authBackdrop.classList.remove('opacity-0');
            authModalsContainer.classList.remove('opacity-0');
        });
        mainContent.classList.add('blur-lg', 'pointer-events-none');
    }
};

export const closeAuthModal = () => {
    if (authBackdrop) authBackdrop.classList.add('opacity-0');
    if (authModalsContainer) authModalsContainer.classList.add('opacity-0');
    // Re-enable background immediately
    if (mainContent) mainContent.classList.remove('blur-lg', 'pointer-events-none');

    if (authTimeout) clearTimeout(authTimeout);
    authTimeout = setTimeout(() => {
        // Block interaction after fade-out
        if (authBackdrop) authBackdrop.classList.add('pointer-events-none');
        if (authModalsContainer) authModalsContainer.classList.add('pointer-events-none');
        // Reset all extra modals
        if (registerModal) registerModal.classList.add('hidden', 'opacity-0', 'scale-95');
        if (profileModal) profileModal.classList.add('hidden', 'opacity-0', 'scale-95');
        if (enrollmentsModal) enrollmentsModal.classList.add('hidden', 'opacity-0', 'scale-95');
        if (notificationsModal) notificationsModal.classList.add('hidden', 'opacity-0', 'scale-95');
        const enrollModal = document.getElementById('enroll-modal');
        if (enrollModal) enrollModal.classList.add('hidden', 'opacity-0', 'scale-95');
        // Show login by default
        if (loginModal) loginModal.classList.remove('hidden', 'opacity-0', 'scale-95');
        currentModal = loginModal;
        authTimeout = null;
    }, 300);
};

export const initAuth = () => {
    // referencias a elementos del DOM
    authBackdrop = document.getElementById('auth-backdrop');
    authModalsContainer = document.getElementById('auth-modals');
    mainContent = document.getElementById('main-content-wrapper');
    loginModal = document.getElementById('login-modal');
    registerModal = document.getElementById('register-modal');
    profileModal = document.getElementById('profile-modal');
    enrollmentsModal = document.getElementById('enrollments-modal');
    notificationsModal = document.getElementById('notifications-modal');
    currentModal = loginModal; // initialize tilt target

    const showRegisterBtn = document.getElementById('show-register-btn');
    const showLoginBtn = document.getElementById('show-login-btn');
    const openLoginBtn = document.getElementById('open-login-btn');
    const mobileOpenLoginBtn = document.getElementById('mobile-open-login-btn');

    // DOM Panel de Usuario
    const userMenuContainer = document.getElementById('user-menu-container');
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const userAvatarText = document.getElementById('user-avatar-text');
    const userMenuName = document.getElementById('user-menu-name');
    const userMenuEmail = document.getElementById('user-menu-email');
    const userMenuRole = document.getElementById('user-menu-role');
    const userMenuAdmin = document.getElementById('user-menu-admin');
    const userMenuLogout = document.getElementById('user-menu-logout');

    // Función centralizada para actualizar la UI según estado de autenticación
    const updateAuthUI = (user, email, role, avatarBase64 = null) => {
        // Actualizar UI para usuario logueado (Desktop)
        if (openLoginBtn) openLoginBtn.classList.add('hidden');
        if (userMenuContainer) {
            userMenuContainer.classList.remove('hidden');

            const userAvatarImg = document.getElementById('user-avatar-img');
            if (avatarBase64 && userAvatarImg) {
                userAvatarImg.src = avatarBase64;
                userAvatarImg.classList.remove('hidden');
                userAvatarText.classList.add('hidden');
            } else {
                userAvatarText.textContent = user.substring(0, 2).toUpperCase();
                userAvatarText.classList.remove('hidden');
                if (userAvatarImg) userAvatarImg.classList.add('hidden');
            }

            userMenuName.textContent = user;
            userMenuEmail.textContent = email;

            if (role === 'admin') {
                userMenuRole.textContent = 'Admin';
                userMenuRole.className = 'px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider flex-shrink-0 bg-secondary-50 text-secondary-600 border border-secondary-200';
                userMenuRole.classList.remove('hidden');
                if (userMenuAdmin) userMenuAdmin.classList.remove('hidden');
            } else {
                userMenuRole.classList.add('hidden');
                if (userMenuAdmin) userMenuAdmin.classList.add('hidden');
            }
        }

        // Actualizar UI Mobile
        if (mobileOpenLoginBtn) {
            mobileOpenLoginBtn.textContent = `Salir (${user})`;
        }
        const contactGuestFields = document.getElementById('contact-guest-fields');
        if (contactGuestFields) contactGuestFields.classList.add('hidden');
    };

    supabase.auth.getUser().then(({ data }) => {
        if (data && data.user) {
            currentUser = data.user.user_metadata?.nombre || data.user.email.split('@')[0];
            currentUserEmail = data.user.email;
            currentUserId = data.user.id;
            userRole = data.user.user_metadata?.role === 'admin' ? 'admin' : 'comun';
            const avatarBase64 = data.user.user_metadata?.avatar_base64 || null;
            updateAuthUI(currentUser, currentUserEmail, userRole, avatarBase64);
        }
    });

    // Lógica del menú desplegable
    let isUserMenuOpen = false;
    const toggleUserMenu = (e) => {
        if (e) e.stopPropagation();
        isUserMenuOpen = !isUserMenuOpen;
        if (isUserMenuOpen) {
            userDropdown.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
        } else {
            userDropdown.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        }
    };
    const closeUserMenu = () => {
        if (isUserMenuOpen) {
            isUserMenuOpen = false;
            userDropdown.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        }
    };

    if (userMenuBtn) userMenuBtn.addEventListener('click', toggleUserMenu);
    document.addEventListener('click', (e) => {
        if (userMenuContainer && !userMenuContainer.contains(e.target)) {
            closeUserMenu();
        }
    });

    // calculo de inclinacion 3d
    const handleTiltEffect = (e) => {
        if (!currentModal || authModalsContainer.classList.contains('pointer-events-none')) return;
        const { clientX, clientY } = e;
        const { offsetWidth, offsetHeight } = authModalsContainer;
        const x = (clientX / offsetWidth) - 0.5;
        const y = (clientY / offsetHeight) - 0.5;
        currentModal.style.transform = `perspective(1000px) rotateX(${-y * 15}deg) rotateY(${x * 15}deg) scale(1.05)`;
        currentModal.style.boxShadow = `${x * 15 * 0.8}px ${y * 15 * 0.8}px 30px rgba(0,0,0,0.2)`;
    };

    const resetTiltEffect = () => {
        if (!currentModal) return;
        currentModal.style.transform = '';
        currentModal.style.boxShadow = '';
    };

    if (authModalsContainer) {
        authModalsContainer.addEventListener('mousemove', handleTiltEffect);
        authModalsContainer.addEventListener('mouseleave', resetTiltEffect);
    }

    const closeAuthModalOnBackdrop = (e) => {
        if (e && e.target !== authModalsContainer) return;
        closeAuthModal();
    };

    // Funciones de Login y Logout
    const handleLoginBtnClick = (e) => {
        openAuthModal();
    };

    const handleLogoutBtnClick = async (e) => {
        await supabase.auth.signOut();
        currentUser = null;
        currentUserEmail = null;
        currentUserId = null;
        userRole = null;

        // Restaurar UI Desktop
        if (openLoginBtn) openLoginBtn.classList.remove('hidden');
        if (userMenuContainer) userMenuContainer.classList.add('hidden');
        closeUserMenu();

        // Limpiar formulario de login (contraseña y estado) manteniendo el correo
        const loginPassword = document.getElementById('login-password');
        if (loginPassword) loginPassword.value = '';

        const loginStatus = document.getElementById('login-status');
        if (loginStatus) {
            loginStatus.classList.add('hidden');
            loginStatus.textContent = '';
            loginStatus.className = 'hidden p-3 rounded-lg text-sm'; // Reset classes
        }

        // Restaurar UI Mobile
        if (mobileOpenLoginBtn) {
            mobileOpenLoginBtn.textContent = 'Acceder';
        }

        const contactGuestFields = document.getElementById('contact-guest-fields');
        if (contactGuestFields) contactGuestFields.classList.remove('hidden');
    };

    if (openLoginBtn) openLoginBtn.addEventListener('click', handleLoginBtnClick);

    // El botón mobile sigue actuando como un toggle (Acceder/Salir) por ahora
    if (mobileOpenLoginBtn) {
        mobileOpenLoginBtn.addEventListener('click', (e) => {
            if (currentUser) handleLogoutBtnClick(e);
            else openAuthModal();
        });
    }

    if (userMenuLogout) userMenuLogout.addEventListener('click', handleLogoutBtnClick);
    if (authModalsContainer) authModalsContainer.addEventListener('click', closeAuthModalOnBackdrop);

    // Cerrar modales con botón X
    document.querySelectorAll('.close-auth-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAuthModal();
        });
    });
    // Re-attach para los dinámicos (por si se agrega después)
    if (authModalsContainer) {
        authModalsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.close-auth-modal')) {
                e.stopPropagation();
                closeAuthModal();
            }
        });
    }

    const showRegisterModal = () => {
        currentModal = registerModal;
        if (loginModal) loginModal.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            if (loginModal) loginModal.classList.add('hidden');
            if (registerModal) registerModal.classList.remove('hidden');
            setTimeout(() => {
                if (registerModal) registerModal.classList.remove('scale-95', 'opacity-0');
            }, 50);
        }, 300);
    };

    const showLoginModal = () => {
        currentModal = loginModal;
        if (registerModal) registerModal.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            if (registerModal) registerModal.classList.add('hidden');
            if (loginModal) loginModal.classList.remove('hidden');
            setTimeout(() => {
                if (loginModal) loginModal.classList.remove('scale-95', 'opacity-0');
            }, 50);
        }, 300);
    };

    if (showRegisterBtn) showRegisterBtn.addEventListener('click', showRegisterModal);
    if (showLoginBtn) showLoginBtn.addEventListener('click', showLoginModal);

    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const statusDiv = document.getElementById('login-status');

            showStatusMessage(statusDiv, 'procesando solicitud', true);

            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (!error && data.user) {
                    const nombreUsuario = data.user.user_metadata?.nombre || data.user.email.split('@')[0];
                    showStatusMessage(statusDiv, `acceso concedido usuario ${nombreUsuario}`, true);

                    // Set global state
                    currentUser = nombreUsuario;
                    currentUserEmail = email;
                    currentUserId = data.user.id;

                    // Asignar rol desde la base de datos (user_metadata)
                    userRole = data.user.user_metadata?.role === 'admin' ? 'admin' : 'comun';

                    // Verificación de Sanciones (Fase B)
                    try {
                        const { data: perfilData } = await supabase.from('perfiles').select('estado').eq('id', data.user.id).single();

                        if (perfilData && perfilData.estado === 'Suspendido') {
                            const { data: banData } = await supabase.from('historial_baneos')
                                .select('*')
                                .eq('user_id', data.user.id)
                                .eq('estado_sancion', 'activo')
                                .order('fecha_inicio', { ascending: false })
                                .limit(1)
                                .single();

                            let isStillBanned = true;

                            if (banData && banData.tipo_sancion === 'temporal' && banData.fecha_fin) {
                                const fin = new Date(banData.fecha_fin);
                                if (new Date() > fin) {
                                    isStillBanned = false; // El castigo expiró naturalmente
                                    await supabase.from('historial_baneos').update({ estado_sancion: 'cumplido' }).eq('id', banData.id);
                                    await supabase.from('perfiles').update({ estado: 'Activo' }).eq('id', data.user.id);
                                } else {
                                    document.getElementById('banned-duration').textContent = 'Temporal (Hasta ' + fin.toLocaleDateString() + ' a las ' + fin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')';
                                }
                            } else if (banData && banData.tipo_sancion === 'permanente') {
                                document.getElementById('banned-duration').textContent = 'Permanente';
                            } else {
                                document.getElementById('banned-duration').textContent = 'No especificado';
                            }

                            if (isStillBanned) {
                                document.getElementById('banned-reason').textContent = banData?.categoria_razon || 'Violación de los términos de servicio';

                                const noteContainer = document.getElementById('banned-note-container');
                                const noteText = document.getElementById('banned-note');
                                if (banData?.nota_interna && noteContainer && noteText) {
                                    noteText.textContent = `"${banData.nota_interna}"`;
                                    noteContainer.classList.remove('hidden');
                                } else if (noteContainer) {
                                    noteContainer.classList.add('hidden');
                                }

                                document.getElementById('appeal-email').value = email;
                                document.getElementById('appeal-name').value = nombreUsuario;

                                const bannedOverlay = document.getElementById('banned-overlay');
                                if (bannedOverlay) bannedOverlay.classList.remove('hidden');

                                await supabase.auth.signOut();
                                closeAuthModal();
                                statusDiv.classList.add('hidden');
                                return; // Interceptar el login impidiendo que continue
                            }
                        }
                    } catch (err) {
                        console.error('Error revisando estado de sanción:', err);
                    }

                    // Ocultar campos de invitado de contacto
                    const contactGuestFields = document.getElementById('contact-guest-fields');
                    if (contactGuestFields) contactGuestFields.classList.add('hidden');

                    setTimeout(() => {
                        closeAuthModal();
                        const avatarBase64 = data.user.user_metadata?.avatar_base64 || null;
                        updateAuthUI(currentUser, currentUserEmail, userRole, avatarBase64);
                        window.dispatchEvent(new Event('auth-status-changed'));
                    }, 2000);

                } else {
                    showStatusMessage(statusDiv, error.message || 'Error de credenciales', false);
                }
            } catch (error) {
                console.error(error);
                showStatusMessage(statusDiv, 'error de conexion', false);
            }
        });
    }

    // selector de genero condicional
    const registerGender = document.getElementById('register-gender');
    if (registerGender) {
        registerGender.addEventListener('change', (e) => {
            const wrapper = document.getElementById('other-gender-wrapper');
            if (wrapper) wrapper.classList.toggle('hidden', e.target.value !== 'otro');
        });
    }

    // Register Form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const datos = {
                Rut: document.getElementById('register-rut').value,
                Nombre: document.getElementById('register-name').value,
                Apellido: document.getElementById('register-lastname').value,
                Email: document.getElementById('register-email').value,
                Telefono: document.getElementById('register-phone').value,
                FechaNacimiento: document.getElementById('register-birthdate').value,
                Genero: document.getElementById('register-gender').value,
                GeneroOtro: document.getElementById('register-other-gender').value,
                Password: document.getElementById('register-password').value
            };

            const statusDiv = document.getElementById('register-status');
            showStatusMessage(statusDiv, 'procesando registro', true);

            try {
                const { data, error } = await supabase.auth.signUp({
                    email: datos.Email,
                    password: datos.Password,
                    options: {
                        data: {
                            rut: datos.Rut,
                            nombre: datos.Nombre,
                            apellido: datos.Apellido,
                            telefono: datos.Telefono,
                            fecha_nacimiento: datos.FechaNacimiento,
                            genero: datos.Genero,
                            genero_otro: datos.GeneroOtro,
                            role: 'comun'
                        }
                    }
                });

                if (!error) {
                    // Opcionalmente podemos insertar en una tabla pública 'perfiles' si fuese necesario.
                    // El trigger o el RLS puede manejar el insert inicial. Si el trigger lo insertó, hacemos un update.
                    // Si no hay trigger, haremos un upsert. Por seguridad, hacemos un update si ya existe.
                    await supabase.from('perfiles').update({
                        correo: datos.Email,
                        rol: 'Usuario',
                        estado: 'Activo'
                    }).eq('id', data.user.id);

                    showStatusMessage(statusDiv, 'registro exitoso', true);
                    registerForm.reset();

                    setTimeout(() => {
                        showLoginModal();
                        statusDiv.classList.add('hidden');
                    }, 2000);
                } else {
                    showStatusMessage(statusDiv, 'error: ' + error.message, false);
                }
            } catch (error) {
                console.error(error);
                showStatusMessage(statusDiv, 'error de conexion', false);
            }
        });
    }

    // Lógica para Formulario de Apelaciones
    const btnShowAppeal = document.getElementById('btn-show-appeal');
    const appealModal = document.getElementById('appeal-modal');
    const btnCloseAppeal = document.getElementById('btn-close-appeal');
    const appealForm = document.getElementById('appeal-form');

    if (btnShowAppeal && appealModal) {
        btnShowAppeal.addEventListener('click', () => {
            appealModal.classList.remove('hidden');
        });
    }

    if (btnCloseAppeal && appealModal) {
        btnCloseAppeal.addEventListener('click', () => {
            appealModal.classList.add('hidden');
        });
    }

    if (appealForm) {
        appealForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('appeal-email').value;
            const name = document.getElementById('appeal-name').value;
            const msg = document.getElementById('appeal-message').value;
            const statusDiv = document.getElementById('appeal-status');

            statusDiv.textContent = 'Enviando...';
            statusDiv.classList.remove('hidden', 'text-green-500', 'text-red-500');
            statusDiv.classList.add('text-primary-500', 'block');

            try {
                const { error } = await supabase.from('contacto').insert({
                    nombre: name,
                    email: email,
                    mensaje: msg,
                    tipo: 'Apelación de Baneo'
                });

                if (error) throw error;

                statusDiv.textContent = 'Apelación enviada correctamente. Un moderador la revisará.';
                statusDiv.classList.replace('text-primary-500', 'text-green-500');
                appealForm.reset();
                setTimeout(() => {
                    appealModal.classList.add('hidden');
                    statusDiv.classList.add('hidden');
                    statusDiv.classList.remove('block');
                }, 3000);

            } catch (error) {
                console.error(error);
                statusDiv.textContent = 'Hubo un error al enviar tu apelación.';
                statusDiv.classList.replace('text-primary-500', 'text-red-500');
            }
        });
    }

    // ============================
    // PANEL: MI PERFIL
    // ============================
    const openProfileBtn = document.getElementById('open-profile-btn');
    const profileForm = document.getElementById('profile-form');
    const profilePictureInput = document.getElementById('profile-picture-input');

    // Helper: abrir sub-modal de usuario
    const openUserModal = (targetModal) => {
        closeUserMenu();
        [loginModal, registerModal, profileModal, enrollmentsModal, notificationsModal].forEach(m => {
            if (m) m.classList.add('hidden', 'opacity-0', 'scale-95');
        });
        const enrollModal = document.getElementById('enroll-modal');
        if (enrollModal) enrollModal.classList.add('hidden', 'opacity-0', 'scale-95');
        if (targetModal) {
            targetModal.classList.remove('hidden');
            setTimeout(() => targetModal.classList.remove('opacity-0', 'scale-95'), 20);
            currentModal = targetModal;
        }
        openAuthModal();
    };

    if (openProfileBtn) {
        openProfileBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            // Refrescar sesión para asegurar que tenemos el metadata más actualizado
            await supabase.auth.refreshSession();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            document.getElementById('profile-name').value = user.user_metadata?.nombre || '';
            document.getElementById('profile-lastname').value = user.user_metadata?.apellido || '';
            document.getElementById('profile-rut').value = user.user_metadata?.rut || '';
            document.getElementById('profile-phone').value = user.user_metadata?.telefono || '';
            document.getElementById('profile-email').value = user.email || '';

            const avatarUrl = user.user_metadata?.avatar_base64;
            const profileImg = document.getElementById('profile-picture-img');
            const profileText = document.getElementById('profile-picture-text');
            if (avatarUrl) {
                profileImg.src = avatarUrl;
                profileImg.classList.remove('hidden');
                profileText.classList.add('hidden');
            } else {
                profileImg.classList.add('hidden');
                profileText.classList.remove('hidden');
                profileText.textContent = (user.user_metadata?.nombre || user.email).substring(0, 2).toUpperCase();
            }

            openUserModal(profileModal);
        });
    }

    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX = 200;
                    let w = img.width, h = img.height;
                    if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                    else { w = Math.round(w * MAX / h); h = MAX; }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    const profileImg = document.getElementById('profile-picture-img');
                    const profileText = document.getElementById('profile-picture-text');
                    profileImg.src = dataUrl;
                    profileImg.classList.remove('hidden');
                    profileText.classList.add('hidden');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const status = document.getElementById('profile-status');
            showStatusMessage(status, 'Guardando cambios...', false, true);

            const nombre = document.getElementById('profile-name').value;
            const apellido = document.getElementById('profile-lastname').value;
            const telefono = document.getElementById('profile-phone').value;
            const profileImg = document.getElementById('profile-picture-img');
            const avatarBase64 = profileImg.src.startsWith('data:image') ? profileImg.src : null;

            const updates = { data: { nombre, apellido, telefono } };
            if (avatarBase64) updates.data.avatar_base64 = avatarBase64;

            const { error } = await supabase.auth.updateUser(updates);
            if (error) {
                showStatusMessage(status, 'Error: ' + error.message, false, false);
            } else {
                showStatusMessage(status, '¡Perfil actualizado exitosamente!', true, false);
                currentUser = nombre;
                // Actualizar avatar en navbar
                const userAvatarImg = document.getElementById('user-avatar-img');
                if (avatarBase64 && userAvatarImg) {
                    userAvatarImg.src = avatarBase64;
                    userAvatarImg.classList.remove('hidden');
                    userAvatarText.classList.add('hidden');
                } else {
                    userAvatarText.textContent = nombre.substring(0, 2).toUpperCase();
                    userAvatarText.classList.remove('hidden');
                    if (userAvatarImg) userAvatarImg.classList.add('hidden');
                }
                userMenuName.textContent = nombre;
                setTimeout(() => {
                    closeAuthModal();
                    status.classList.add('hidden');
                }, 1500);
            }
        });
    }

    // ============================
    // PANEL: MIS INSCRIPCIONES
    // ============================
    const openEnrollmentsBtn = document.getElementById('open-enrollments-btn');
    const enrollmentsList = document.getElementById('enrollments-list');

    const loadEnrollments = async () => {
        if (!enrollmentsList) return;
        enrollmentsList.innerHTML = '<div class="text-center py-8 text-gray-500">Cargando inscripciones...</div>';
        
        // Usar siempre el userId de la sesión activa para evitar problemas de timing
        const { data: { user: sessionUser } } = await supabase.auth.getUser();
        const userId = sessionUser?.id || currentUserId;
        if (!userId) {
            enrollmentsList.innerHTML = '<div class="text-center py-8 text-gray-500">Debes iniciar sesión.</div>';
            return;
        }

        try {
            const [calRes, volRes, servRes] = await Promise.all([
                supabase.from('inscripciones_calendario').select('id, actividad_id, created_at').eq('user_id', userId),
                supabase.from('inscripciones_voluntariado').select('id, evento_id, created_at').eq('user_id', userId),
                supabase.from('inscripciones_servicios').select('id, servicio_id, created_at').eq('user_id', userId)
            ]);

            const allEnrollments = [];

            if (calRes.data && calRes.data.length > 0) {
                const actIds = calRes.data.map(i => i.actividad_id).filter(Boolean);
                let actMap = {};
                if (actIds.length > 0) {
                    const { data: actData } = await supabase.from('actividades').select('id, titulo').in('id', actIds);
                    if (actData) actData.forEach(a => actMap[a.id] = a.titulo);
                }
                calRes.data.forEach(item => allEnrollments.push({
                    id: item.id,
                    titulo: actMap[item.actividad_id] || 'Actividad',
                    tipo: 'Calendario',
                    fecha: new Date(item.created_at),
                    tabla: 'inscripciones_calendario'
                }));
            }

            if (volRes.data && volRes.data.length > 0) {
                // Obtener nombres de eventos_voluntariado para los que tienen evento_id
                const evIds = volRes.data.map(i => i.evento_id).filter(Boolean);
                let evMap = {};
                if (evIds.length > 0) {
                    const { data: evData } = await supabase.from('eventos_voluntariado').select('id, titulo').in('id', evIds);
                    if (evData) evData.forEach(ev => evMap[ev.id] = ev.titulo);
                }
                volRes.data.forEach(item => allEnrollments.push({
                    id: item.id,
                    titulo: evMap[item.evento_id] || 'Programa de Voluntariado',
                    tipo: 'Voluntariado',
                    fecha: new Date(item.created_at),
                    tabla: 'inscripciones_voluntariado'
                }));
            }

            if (servRes.data && servRes.data.length > 0) {
                const servIds = servRes.data.map(i => i.servicio_id).filter(Boolean);
                let servMap = {};
                if (servIds.length > 0) {
                    const { data: servData } = await supabase.from('servicios').select('id, titulo').in('id', servIds);
                    if (servData) servData.forEach(s => servMap[s.id] = s.titulo);
                }
                servRes.data.forEach(item => allEnrollments.push({
                    id: item.id,
                    titulo: servMap[item.servicio_id] || 'Servicio',
                    tipo: 'Servicio',
                    fecha: new Date(item.created_at),
                    tabla: 'inscripciones_servicios'
                }));
            }

            allEnrollments.sort((a, b) => b.fecha - a.fecha);

            if (allEnrollments.length === 0) {
                enrollmentsList.innerHTML = '<div class="text-center py-8 text-gray-500">No tienes inscripciones activas.</div>';
                return;
            }

            enrollmentsList.innerHTML = allEnrollments.map(item => `
                <div class="border border-gray-100 bg-gray-50/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:bg-white hover:shadow-md">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                                item.tipo === 'Calendario' ? 'bg-primary-100 text-primary-700' :
                                item.tipo === 'Voluntariado' ? 'bg-secondary-100 text-secondary-700' :
                                'bg-accent-100 text-accent-700'
                            }">${item.tipo}</span>
                            <span class="text-xs text-gray-400 font-medium">${item.fecha.toLocaleDateString()}</span>
                        </div>
                        <h4 class="font-semibold text-gray-800">${item.titulo}</h4>
                    </div>
                    <button class="cancel-enroll-btn text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        data-id="${item.id}" data-table="${item.tabla}">
                        Cancelar
                    </button>
                </div>
            `).join('');

            enrollmentsList.querySelectorAll('.cancel-enroll-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.currentTarget.dataset.id;
                    const tabla = e.currentTarget.dataset.table;
                    if (confirm('¿Cancelar esta inscripción?')) {
                        e.currentTarget.textContent = 'Cancelando...';
                        e.currentTarget.disabled = true;
                        const { error } = await supabase.from(tabla).delete().eq('id', id);
                        if (!error) loadEnrollments();
                        else alert('Error: ' + error.message);
                    }
                });
            });

        } catch (err) {
            console.error('Error cargando inscripciones:', err);
            enrollmentsList.innerHTML = '<div class="text-center py-8 text-red-500">Error al cargar inscripciones.</div>';
        }
    };

    if (openEnrollmentsBtn) {
        openEnrollmentsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openUserModal(enrollmentsModal);
            loadEnrollments();
        });
    }

    // ============================
    // PANEL: NOTIFICACIONES
    // ============================
    const openNotificationsBtn = document.getElementById('open-notifications-btn');
    const notificationsList = document.getElementById('notifications-list');
    const notificationBadge = document.getElementById('notification-badge');

    const checkNotificationBadge = async () => {
        if (!currentUserId || !notificationBadge) return;
        const { count } = await supabase.from('notificaciones')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', currentUserId)
            .eq('leida', false);
        if (count > 0) {
            notificationBadge.textContent = count;
            notificationBadge.classList.remove('hidden');
        } else {
            notificationBadge.classList.add('hidden');
        }
    };

    const loadNotifications = async () => {
        if (!currentUserId || !notificationsList) return;
        notificationsList.innerHTML = '<div class="text-center py-8 text-gray-500">Cargando notificaciones...</div>';
        try {
            const { data, error } = await supabase.from('notificaciones')
                .select('*')
                .eq('user_id', currentUserId)
                .order('created_at', { ascending: false });
            if (error) throw error;

            if (!data || data.length === 0) {
                notificationsList.innerHTML = '<div class="text-center py-8 text-gray-500">No tienes notificaciones.</div>';
                const clearBtn = document.getElementById('clear-notifications-btn');
                if (clearBtn) clearBtn.classList.add('hidden');
                return;
            }

            notificationsList.innerHTML = data.map(n => {
                // Función simple para convertir URLs en enlaces clickeables
                const formatLinks = (text) => {
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    return text.replace(urlRegex, url => `<a href="${url}" target="_blank" class="text-primary-500 hover:text-primary-600 underline">${url}</a>`);
                };
                
                return `
                <div class="p-4 rounded-xl border ${n.leida ? 'bg-white border-gray-100' : 'bg-primary-50 border-primary-100 shadow-sm'} transition-colors relative group">
                    <button class="delete-notification-btn absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" data-id="${n.id}" title="Eliminar notificación">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <div class="flex justify-between items-start mb-1 pr-6">
                        <h4 class="font-semibold ${n.leida ? 'text-gray-700' : 'text-primary-700'}">${n.titulo}</h4>
                        <span class="text-[10px] font-medium text-gray-400 whitespace-nowrap ml-2">${new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="text-sm text-gray-600 pr-4">${formatLinks(n.mensaje)}</p>
                </div>
                `;
            }).join('');

            // Mostrar el botón de vaciar bandeja si hay notificaciones
            const clearBtn = document.getElementById('clear-notifications-btn');
            if (clearBtn) clearBtn.classList.remove('hidden');

            // Añadir eventos a los botones de borrar individuales
            document.querySelectorAll('.delete-notification-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const notifId = e.currentTarget.dataset.id;
                    const el = e.currentTarget.closest('div.p-4');
                    el.style.opacity = '0.5'; // Estado de carga visual
                    try {
                        const { error } = await supabase.from('notificaciones').delete().eq('id', notifId).eq('user_id', currentUserId);
                        if (error) throw error;
                        await loadNotifications(); // Recargar lista
                    } catch (err) {
                        console.error('Error al borrar notificación:', err);
                        el.style.opacity = '1';
                        alert('No se pudo borrar la notificación.');
                    }
                });
            });

            const unreadIds = data.filter(n => !n.leida).map(n => n.id);
            if (unreadIds.length > 0) {
                await supabase.from('notificaciones').update({ leida: true }).in('id', unreadIds);
                if (notificationBadge) notificationBadge.classList.add('hidden');
            }
        } catch (err) {
            console.error('Error cargando notificaciones:', err);
            notificationsList.innerHTML = '<div class="text-center py-8 text-red-500">Error al cargar notificaciones.</div>';
        }
    };

    // Evento para el botón de Vaciar Bandeja
    const clearBtn = document.getElementById('clear-notifications-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', async () => {
            if (!currentUserId) return;
            if (!confirm('¿Estás seguro de que quieres borrar TODAS tus notificaciones?')) return;
            
            clearBtn.disabled = true;
            clearBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Vaciando...';
            try {
                const { error } = await supabase.from('notificaciones').delete().eq('user_id', currentUserId);
                if (error) throw error;
                await loadNotifications();
            } catch (err) {
                console.error('Error al vaciar bandeja:', err);
                alert('No se pudo vaciar la bandeja.');
            } finally {
                clearBtn.disabled = false;
                clearBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Vaciar bandeja';
            }
        });
    }

    if (openNotificationsBtn) {
        openNotificationsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openUserModal(notificationsModal);
            loadNotifications();
        });
    }

    // Revisar badge de notificaciones al cargar si el usuario ya est\u00e1 logeado
    supabase.auth.getUser().then(({ data }) => {
        if (data?.user) checkNotificationBadge();
    });

};
