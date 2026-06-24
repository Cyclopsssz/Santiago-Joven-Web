import { supabase } from './api.js';
import { showStatusMessage } from './utils.js';
import { currentUser, currentUserEmail, currentUserId, requireAuth } from './auth.js';

export const initForms = () => {
    // controlador de formulario de encuestas
    const surveyForm = document.getElementById('survey-form');
    const occupationSelect = document.getElementById('survey-occupation');
    const occupationOtherWrapper = document.getElementById('survey-occupation-other-wrapper');

    // visibilidad condicional de ocupacion
    if (occupationSelect) {
        occupationSelect.addEventListener('change', (e) => {
            if (occupationOtherWrapper) {
                occupationOtherWrapper.classList.toggle('hidden', e.target.value !== 'otro');
            }
        });
    }

    // envio de datos de encuesta
    if (surveyForm) {
        surveyForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const statusDiv = document.getElementById('survey-status');
            const edad = document.getElementById('survey-age').value;
            const ocupacion = document.getElementById('survey-occupation').value;
            const ocupacionOtra = document.getElementById('survey-occupation-other') ? document.getElementById('survey-occupation-other').value : '';
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
                const { error } = await supabase.from('encuestas').insert([{
                    rango_edad: edad,
                    ocupacion: ocupacion,
                    ocupacion_otro: ocupacionOtra,
                    intereses: interesesMarcados,
                    calificacion: rating,
                    problematica: problema,
                    sugerencia: sugerencia
                }]);

                if (!error) {
                    showStatusMessage(statusDiv, 'operacion exitosa', true);
                    surveyForm.reset();
                    if (occupationOtherWrapper) occupationOtherWrapper.classList.add('hidden');
                    document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
                } else {
                    showStatusMessage(statusDiv, 'error ' + error.message, false);
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

            const message = document.getElementById('contact-message').value;

            const datosParaEnviar = {
                nombre: currentUser || 'Usuario Logueado',
                email: currentUserEmail || 'correo@ejemplo.com',
                mensaje: message
            };
            const statusDiv = document.getElementById('contact-status');
            showStatusMessage(statusDiv, 'procesando solicitud', true);

            try {
                const { error } = await supabase.from('contacto').insert([datosParaEnviar]);

                if (!error) {
                    showStatusMessage(statusDiv, 'mensaje enviado', true);
                    contactForm.reset();
                } else {
                    showStatusMessage(statusDiv, 'error en el envio: ' + error.message, false);
                }

            } catch (error) {
                console.error(error);
                showStatusMessage(statusDiv, 'error de conexion', false);
            }
        });
    }

    // Modal de inscripción
    const enrollModal = document.getElementById('enroll-modal');
    const authBackdrop = document.getElementById('auth-backdrop');
    const authModalsContainer = document.getElementById('auth-modals');
    const mainContent = document.getElementById('main-content-wrapper');
    const enrollCourseName = document.getElementById('enroll-course-name');
    const confirmEnrollBtn = document.getElementById('confirm-enroll-btn');
    const closeEnrollBtn = document.getElementById('close-enroll-btn');
    const enrollStatus = document.getElementById('enroll-status');
    let currentEnrollTitle = '';
    let currentEnrollId = '';
    let currentEnrollType = 'actividad';

    const openEnrollModal = (title, id, type = 'actividad') => {
        currentEnrollTitle = title;
        currentEnrollId = id;
        currentEnrollType = type;
        if (enrollCourseName) enrollCourseName.textContent = title;
        
        // Hide other modals just in case
        document.getElementById('login-modal')?.classList.add('hidden');
        document.getElementById('register-modal')?.classList.add('hidden');
        document.getElementById('add-event-modal')?.classList.add('hidden');

        if (authBackdrop) authBackdrop.classList.remove('hidden');
        if (authModalsContainer) authModalsContainer.classList.remove('hidden');
        if (enrollModal) enrollModal.classList.remove('hidden');

        setTimeout(() => {
            if (authBackdrop) authBackdrop.classList.remove('opacity-0');
            if (authModalsContainer) authModalsContainer.classList.remove('opacity-0');
            if (enrollModal) enrollModal.classList.remove('scale-95', 'opacity-0');
        }, 10);
        if (mainContent) mainContent.classList.add('blur-lg', 'pointer-events-none');
    };

    const closeEnrollModal = () => {
        if (authBackdrop) authBackdrop.classList.add('opacity-0');
        if (authModalsContainer) authModalsContainer.classList.add('opacity-0');
        if (enrollModal) enrollModal.classList.add('scale-95', 'opacity-0');
        if (mainContent) mainContent.classList.remove('blur-lg', 'pointer-events-none');
        setTimeout(() => {
            if (authBackdrop) authBackdrop.classList.add('hidden');
            if (authModalsContainer) authModalsContainer.classList.add('hidden');
            if (enrollModal) enrollModal.classList.add('hidden');
        }, 300);
    };

    if (closeEnrollBtn) closeEnrollBtn.addEventListener('click', closeEnrollModal);

    // Abrir modal al presionar cualquier botón de inscripción (con delegación)
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.enroll-btn');
        if (btn) {
            const authHandler = requireAuth((evt) => {
                const title = btn.dataset.title;
                const id = btn.dataset.id;
                const type = btn.dataset.type || 'actividad';
                if (title) openEnrollModal(title, id, type);
            });
            authHandler(e);
        }
    });

    if (confirmEnrollBtn) {
        confirmEnrollBtn.addEventListener('click', async () => {
            if (!currentEnrollTitle) return;

            showStatusMessage(enrollStatus, 'Procesando inscripción...', true);
            try {
                let error = null;

                if (currentEnrollType === 'actividad') {
                    // 1. Inscripción a eventos del calendario (actividades)
                    const payload = {
                        user_id: currentUserId,
                        actividad_id: currentEnrollId,
                        estado: 'Inscrito',
                        created_at: new Date().toISOString()
                    };
                    const res = await supabase.from('inscripciones_calendario').insert([payload]);
                    error = res.error;
                } else if (currentEnrollId === 'voluntariado') {
                    // 2. Inscripción a Voluntariado
                    const payload = {
                        user_id: currentUserId,
                        tipo_voluntariado: currentEnrollTitle, // Guarda el título del programa (texto)
                        estado: 'Inscrito',
                        created_at: new Date().toISOString()
                    };
                    const res = await supabase.from('inscripciones_voluntariado').insert([payload]);
                    error = res.error;
                } else {
                    // 3. Inscripción a programas o servicios (Excel, etc)
                    const payload = {
                        user_id: currentUserId,
                        servicio_id: currentEnrollId, // UUID del servicio
                        estado: 'Inscrito',
                        created_at: new Date().toISOString()
                    };
                    const res = await supabase.from('inscripciones_servicios').insert([payload]);
                    error = res.error;
                }

                if (!error) {
                    showStatusMessage(enrollStatus, '¡Inscripción confirmada! Te hemos enviado un correo.', true);
                    
                    setTimeout(() => {
                        closeEnrollModal();
                        if (enrollStatus) enrollStatus.classList.add('hidden');
                    }, 2500);

                } else {
                    showStatusMessage(enrollStatus, 'Error al inscribir: ' + error.message, false);
                }
            } catch (error) {
                console.error(error);
                showStatusMessage(enrollStatus, 'Error de conexión', false);
            }
        });
    }
};
