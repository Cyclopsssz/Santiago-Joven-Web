// inicializacion al cargar el documento
document.addEventListener('DOMContentLoaded', () => {
    // referencias a elementos del DOM
    const authBackdrop = document.getElementById('auth-backdrop');
    const authModalsContainer = document.getElementById('auth-modals');
    const mainContent = document.getElementById('main-content-wrapper');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');

    const showRegisterBtn = document.getElementById('show-register-btn');
    const showLoginBtn = document.getElementById('show-login-btn');
    const openLoginBtn = document.getElementById('open-login-btn');
    const mobileOpenLoginBtn = document.getElementById('mobile-open-login-btn');

    // apertura de ventana de autenticacion
    const openAuthModal = () => {
        authBackdrop.classList.remove('hidden');
        authModalsContainer.classList.remove('hidden');
        setTimeout(() => {
            authBackdrop.classList.remove('opacity-0');
            authModalsContainer.classList.remove('opacity-0');
        }, 10);
        mainContent.classList.add('blur-lg', 'pointer-events-none');
        authModalsContainer.addEventListener('mousemove', handleTiltEffect);
        authModalsContainer.addEventListener('mouseleave', resetTiltEffect);
    };

    // cierre de ventana de autenticacion
    const closeAuthModal = (e) => {
        if (e.target === authModalsContainer) {
            authBackdrop.classList.add('opacity-0');
            authModalsContainer.classList.add('opacity-0');
            mainContent.classList.remove('blur-lg', 'pointer-events-none');
            setTimeout(() => {
                authBackdrop.classList.add('hidden');
                authModalsContainer.classList.add('hidden');
                registerModal.classList.add('hidden');
                loginModal.classList.remove('hidden', 'scale-95', 'opacity-0');
            }, 300);
            authModalsContainer.removeEventListener('mousemove', handleTiltEffect);
            authModalsContainer.removeEventListener('mouseleave', resetTiltEffect);
        }
    };

    // eventos de botones de apertura
    if (openLoginBtn) openLoginBtn.addEventListener('click', openAuthModal);
    if (mobileOpenLoginBtn) mobileOpenLoginBtn.addEventListener('click', openAuthModal);
    authModalsContainer.addEventListener('click', closeAuthModal);

    // cambio a vista de registro
    const showRegisterModal = () => {
        loginModal.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            loginModal.classList.add('hidden');
            registerModal.classList.remove('hidden');
            setTimeout(() => registerModal.classList.remove('scale-95', 'opacity-0'), 50);
        }, 300);
    };

    // cambio a vista de login
    const showLoginModal = () => {
        registerModal.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            registerModal.classList.add('hidden');
            loginModal.classList.remove('hidden');
            setTimeout(() => loginModal.classList.remove('scale-95', 'opacity-0'), 50);
        }, 300);
    };

    // eventos de cambio de vista
    if (showRegisterBtn) showRegisterBtn.addEventListener('click', showRegisterModal);
    if (showLoginBtn) showLoginBtn.addEventListener('click', showLoginModal);

    // actualizacion de mensaje de estado
    const showStatusMessage = (element, message, isSuccess) => {
        element.innerHTML = message;
        element.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');
        element.classList.add(isSuccess ? 'bg-green-100' : 'bg-red-100', isSuccess ? 'text-green-700' : 'text-red-700');
        element.classList.remove('hidden');
    };

    // controlador de envio de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // extraccion de credenciales
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const statusDiv = document.getElementById('login-status');

            showStatusMessage(statusDiv, 'procesando solicitud', true);

            try {
                // peticion a la api
                const respuesta = await fetch(`${urlBase}/api/usuarios/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Email: email, Password: password })
                });

                const resultado = await respuesta.json();

                if (respuesta.ok) {
                    showStatusMessage(statusDiv, `acceso concedido usuario ${resultado.usuario}`, true);

                    // cierre automatico de modal
                    setTimeout(() => {
                        const backdrop = document.getElementById('auth-backdrop');
                        const modalsContainer = document.getElementById('auth-modals');
                        const mainContent = document.getElementById('main-content-wrapper');

                        if (backdrop) backdrop.classList.add('opacity-0');
                        if (modalsContainer) modalsContainer.classList.add('opacity-0');
                        if (mainContent) mainContent.classList.remove('blur-lg', 'pointer-events-none');

                        setTimeout(() => {
                            if (backdrop) backdrop.classList.add('hidden');
                            if (modalsContainer) modalsContainer.classList.add('hidden');
                        }, 300);

                        // actualizacion de ui con datos de usuario
                        let btnEscritorio = document.getElementById('open-login-btn');

                        if (!btnEscritorio) {
                            btnEscritorio = document.getElementById('user-profile-btn');
                        }

                        const btnMovil = document.getElementById('mobile-open-login-btn');

                        if (btnEscritorio) {
                            btnEscritorio.textContent = resultado.usuario;
                            btnEscritorio.classList.remove('bg-primary-500', 'text-white');
                            btnEscritorio.classList.add('text-primary-500', 'font-bold', 'border-2', 'border-primary-500');
                            btnEscritorio.id = 'user-profile-btn';
                        }

                        if (btnMovil) {
                            btnMovil.textContent = resultado.usuario;
                            btnMovil.classList.add('text-primary-500', 'font-bold');
                        }

                    }, 3000);

                } else {
                    showStatusMessage(statusDiv, resultado.error, false);
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
            document.getElementById('other-gender-wrapper').classList.toggle('hidden', e.target.value !== 'otro');
        });
    }

    // url base de la api
    const urlBase = 'https://localhost:7173';

    // controlador de registro de usuario
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // recopilacion de datos del formulario
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
                // peticion a la api
                const respuesta = await fetch(`${urlBase}/api/usuarios/registrar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datos)
                });

                const resultado = await respuesta.json();

                if (respuesta.ok) {
                    showStatusMessage(statusDiv, 'registro exitoso', true);
                    registerForm.reset();

                    // redireccion a login
                    setTimeout(() => {
                        document.getElementById('register-modal').classList.add('hidden');
                        document.getElementById('login-modal').classList.remove('hidden', 'scale-95', 'opacity-0');
                        document.getElementById('login-status').classList.add('hidden');
                    }, 2000);
                } else {
                    showStatusMessage(statusDiv, 'error ' + resultado.error, false);
                }
            } catch (error) {
                console.error(error);
                showStatusMessage(statusDiv, 'error de conexion', false);
            }
        });
    }

    // estado de modal actual para efectos
    let currentModal = loginModal;
    if (showRegisterBtn) showRegisterBtn.addEventListener('click', () => currentModal = registerModal);
    if (showLoginBtn) showLoginBtn.addEventListener('click', () => currentModal = loginModal);

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

    // reinicio de inclinacion 3d
    const resetTiltEffect = () => {
        if (!currentModal) return;
        currentModal.style.transform = 'rotateX(0) rotateY(0) scale(1)';
        currentModal.style.boxShadow = '';
    };

    // controles de navegacion movil
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuBtn = document.getElementById('close-menu-btn');

    // alternar estado de menu movil
    const toggleMenu = () => mobileMenu.classList.toggle('-translate-x-full');
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleMenu);
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', toggleMenu);
    document.querySelectorAll('.mobile-nav-link').forEach(l => l.addEventListener('click', toggleMenu));

    // configuracion de observador de interseccion para scrollspy
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('#desktop-nav a, #mobile-menu a');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                const id = entry.target.getAttribute('id');
                let mainId = id.includes('-') ? id.split('-')[0] : id;
                document.querySelectorAll(`a[href*="#${mainId}"]`).forEach(l => l.classList.add('active'));
                if (id === 'inicio') document.querySelector('a[href="#inicio"]')?.classList.add('active');
            }
        });
    }, { threshold: 0.4 });
    sections.forEach(s => observer.observe(s));

    // filtrado de eventos en calendario
    const filterButtons = document.querySelectorAll('.filter-btn');
    const eventCards = document.querySelectorAll('.event-card');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
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

    // controlador de formulario de encuestas
    const surveyForm = document.getElementById('survey-form');
    const occupationSelect = document.getElementById('survey-occupation');
    const occupationOtherWrapper = document.getElementById('survey-occupation-other-wrapper');

    // visibilidad condicional de ocupacion
    if (occupationSelect) {
        occupationSelect.addEventListener('change', (e) => {
            occupationOtherWrapper.classList.toggle('hidden', e.target.value !== 'otro');
        });
    }

    // envio de datos de encuesta
    if (surveyForm) {
        surveyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const statusDiv = document.getElementById('survey-status');
            const edad = document.getElementById('survey-age').value;
            const ocupacion = document.getElementById('survey-occupation').value;
            const ocupacionOtra = document.getElementById('survey-occupation-other').value;
            const problema = document.getElementById('survey-problem').value;
            const sugerencia = document.getElementById('survey-suggestion').value;
            const ratingInput = document.querySelector('input[name="rating"]:checked');
            const rating = ratingInput ? parseInt(ratingInput.value) : 0;

            // recopilacion de array de intereses
            const interesesMarcados = [];
            document.querySelectorAll('input[name="interests"]:checked').forEach((checkbox) => {
                interesesMarcados.push(checkbox.value);
            });

            // validacion basica de campos requeridos
            if (!edad || !ocupacion || rating === 0) {
                showStatusMessage(statusDiv, 'campos requeridos faltantes', false);
                return;
            }

            showStatusMessage(statusDiv, 'procesando solicitud', true);
            const datosEncuesta = {
                RangoEdad: edad,
                Ocupacion: ocupacion,
                OcupacionOtro: ocupacionOtra,
                Intereses: interesesMarcados,
                Calificacion: rating,
                Problematica: problema,
                Sugerencia: sugerencia
            };

            try {
                // peticion a la api
                const respuesta = await fetch(`${urlBase}/api/encuestas/enviar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosEncuesta)
                });

                if (respuesta.ok) {
                    showStatusMessage(statusDiv, 'operacion exitosa', true);
                    surveyForm.reset();
                    if (occupationOtherWrapper) occupationOtherWrapper.classList.add('hidden');
                    document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
                } else {
                    const errorData = await respuesta.json();
                    showStatusMessage(statusDiv, 'error ' + errorData.error, false);
                }
            } catch (error) {
                console.error(error);
                showStatusMessage(statusDiv, 'error de conexion', false);
            }
        });
    }

    // controlador de formulario de contacto
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // recopilacion de datos
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;

            const datosParaEnviar = {
                Name: name,
                Email: email,
                Message: message
            };
            const statusDiv = document.getElementById('contact-status');
            showStatusMessage(statusDiv, 'procesando solicitud', true);

            try {
                // peticion a la api
                const respuesta = await fetch('https://localhost:7173/api/contacto/enviar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(datosParaEnviar)
                });

                if (respuesta.ok) {
                    showStatusMessage(statusDiv, 'mensaje enviado', true);
                    contactForm.reset();
                } else {
                    showStatusMessage(statusDiv, 'error en el envio', false);
                }

            } catch (error) {
                console.error(error);
                showStatusMessage(statusDiv, 'error de conexion', false);
            }
        });
    }
});
