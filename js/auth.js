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

let authBackdrop, authModalsContainer, mainContent, loginModal, registerModal;

export const openAuthModal = () => {
    if (authBackdrop && authModalsContainer && mainContent) {
        authBackdrop.classList.remove('hidden');
        authModalsContainer.classList.remove('hidden');
        setTimeout(() => {
            authBackdrop.classList.remove('opacity-0');
            authModalsContainer.classList.remove('opacity-0');
        }, 10);
        mainContent.classList.add('blur-lg', 'pointer-events-none');
    }
};

export const initAuth = () => {
    // referencias a elementos del DOM
    authBackdrop = document.getElementById('auth-backdrop');
    authModalsContainer = document.getElementById('auth-modals');
    mainContent = document.getElementById('main-content-wrapper');
    loginModal = document.getElementById('login-modal');
    registerModal = document.getElementById('register-modal');

    const showRegisterBtn = document.getElementById('show-register-btn');
    const showLoginBtn = document.getElementById('show-login-btn');
    const openLoginBtn = document.getElementById('open-login-btn');
    const mobileOpenLoginBtn = document.getElementById('mobile-open-login-btn');

    let currentModal = loginModal;

    // calculo de inclinacion 3d
    const handleTiltEffect = (e) => {
        if (!currentModal || authModalsContainer.classList.contains('hidden')) return;
        const { clientX, clientY } = e;
        const { offsetWidth, offsetHeight } = authModalsContainer;
        const x = (clientX / offsetWidth) - 0.5;
        const y = (clientY / offsetHeight) - 0.5;
        currentModal.style.transform = `rotateX(${-y * 15}deg) rotateY(${x * 15}deg) scale(1.05)`;
        currentModal.style.boxShadow = `${x * 15 * 0.8}px ${y * 15 * 0.8}px 30px rgba(0,0,0,0.2)`;
    };

    const resetTiltEffect = () => {
        if (!currentModal) return;
        currentModal.style.transform = 'rotateX(0) rotateY(0) scale(1)';
        currentModal.style.boxShadow = '';
    };

    if (authModalsContainer) {
        authModalsContainer.addEventListener('mousemove', handleTiltEffect);
        authModalsContainer.addEventListener('mouseleave', resetTiltEffect);
    }

    const closeAuthModal = (e) => {
        if (e && e.target !== authModalsContainer) return;
        if (authBackdrop) authBackdrop.classList.add('opacity-0');
        if (authModalsContainer) authModalsContainer.classList.add('opacity-0');
        if (mainContent) mainContent.classList.remove('blur-lg', 'pointer-events-none');
        setTimeout(() => {
            if (authBackdrop) authBackdrop.classList.add('hidden');
            if (authModalsContainer) authModalsContainer.classList.add('hidden');
            if (registerModal) registerModal.classList.add('hidden');
            if (loginModal) loginModal.classList.remove('hidden', 'scale-95', 'opacity-0');
        }, 300);
    };

    // Funciones de Login y Logout
    const handleLoginBtnClick = async (e) => {
        if (currentUser) {
            // Logout logic
            await supabase.auth.signOut();
            currentUser = null;
            currentUserEmail = null;
            currentUserId = null;
            userRole = null;
            if (openLoginBtn) {
                openLoginBtn.textContent = 'Acceder';
                openLoginBtn.classList.add('bg-primary-500', 'text-white');
                openLoginBtn.classList.remove('text-primary-500', 'font-bold', 'border-2', 'border-primary-500');
            }
            if (mobileOpenLoginBtn) {
                mobileOpenLoginBtn.textContent = 'Acceder';
            }
            // Ocultar botón de dashboard
            const dashboardBtn = document.getElementById('admin-dashboard-btn');
            if (dashboardBtn) dashboardBtn.classList.add('hidden');
        } else {
            openAuthModal();
        }
    };

    if (openLoginBtn) openLoginBtn.addEventListener('click', handleLoginBtnClick);
    if (mobileOpenLoginBtn) mobileOpenLoginBtn.addEventListener('click', handleLoginBtnClick);
    if (authModalsContainer) authModalsContainer.addEventListener('click', closeAuthModal);

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
                                    await supabase.from('historial_baneos').update({estado_sancion: 'cumplido'}).eq('id', banData.id);
                                    await supabase.from('perfiles').update({estado: 'Activo'}).eq('id', data.user.id);
                                } else {
                                    document.getElementById('banned-duration').textContent = 'Temporal (Hasta ' + fin.toLocaleDateString() + ' a las ' + fin.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ')';
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

                    // Mostrar botón de dashboard si corresponde
                    const dashboardBtn = document.getElementById('admin-dashboard-btn');
                    if (userRole === 'admin') {
                        if (dashboardBtn) dashboardBtn.classList.remove('hidden');
                    }

                    setTimeout(() => {
                        closeAuthModal();

                        if (openLoginBtn) {
                            openLoginBtn.textContent = `Salir (${currentUser})`;
                            openLoginBtn.classList.remove('bg-primary-500', 'text-white');
                            openLoginBtn.classList.add('text-primary-500', 'font-bold', 'border-2', 'border-primary-500');
                        }

                        if (mobileOpenLoginBtn) {
                            mobileOpenLoginBtn.textContent = `Salir (${currentUser})`;
                        }

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
};
