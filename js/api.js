// Configuración global y endpoints de la API
export const API_CONFIG = {
    urlBase: 'https://localhost:7173',
    endpoints: {
        login: '/api/usuarios/login',
        register: '/api/usuarios/registrar',
        survey: '/api/encuestas/enviar',
        contact: '/api/contacto/enviar',
        addEvent: '/api/calendario/anadir',
        enroll: '/api/inscripciones'
    }
};
