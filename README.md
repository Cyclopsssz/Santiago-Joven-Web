# Proyecto Web Santiago Joven - Plataforma "Apoyo Joven"
## 1. Descripción del Proyecto
#### Este proyecto es una plataforma web dinámica e integral desarrollada para la institución externa Santiago Joven, dirigida a jóvenes de la comuna de entre 14 y 29 años. El sitio centraliza información sobre programas de salud mental, asesorías y voluntariados, ofreciendo además un calendario interactivo de actividades. Esta plataforma responde a una necesidad institucional real, dotando a la municipalidad de un sistema de gestión autoadministrable (CMS integrado) y comunicación bidireccional en tiempo real con la juventud.

## 2. Stack Tecnológico
### La arquitectura del software fue construida privilegiando el rendimiento y la facilidad de mantenimiento a largo plazo para el socio comunitario:

* Frontend: HTML5 semántico, JavaScript puro (Vanilla JS) y Tailwind CSS (vía CDN) para un diseño Mobile-First responsivo.
* backend y Base de Datos: Supabase (PostgreSQL), encargado del almacenamiento relacional dinámico en la nube.
* Autenticación: Supabase Auth, para la gestión segura de sesiones, contraseñas encriptadas y roles de seguridad en el servidor (RLS).
* Despliegue y Hosting: Netlify, asegurando integración continua y conexiones cifradas bajo protocolo de seguridad HTTPS.

## 3. Requisitos Previos e Instalación
### Dado que el proyecto utiliza arquitectura nativa (Vanilla JavaScript) y APIs consumidas vía CDN, no requiere la instalación de librerías locales pesadas mediante gestores de paquetes como npm.
## Prerrequisitos:

- Git instalado en el sistema.
- Visual Studio Code (o editor de código equivalente).
- Extensión Live Server instalada en el editor.

### Pasos de Instalación:

* **1.-** Clonar el repositorio en tu máquina local abriendo la terminal y ejecutando:
***git clone*** https://github.com/Cyclopsssz/Santiago-Joven-Web
* **2.-** Abrir la carpeta del proyecto clonado en Visual Studio Code.
* **3.-** Asegurarse de que el archivo /js/api.js contiene las URL y llaves anónimas de Supabase 
(Nota técnica: Las Anon Keys de Supabase están diseñadas intencionalmente para ser leídas por el cliente, la seguridad recae en las políticas RLS del servidor).

## 4. Ejecución del Proyecto
### Para ejecutar el proyecto en un entorno de desarrollo local y evitar errores por políticas de seguridad del navegador (CORS), sigue estos pasos:

* 1.- Dentro de Visual Studio Code, haz clic derecho sobre el archivo principal index.html.
* 2.- Selecciona la opción "Open with Live Server".
* 3.- El proyecto se abrirá automáticamente en tu navegador predeterminado.
(Para visualizar el entorno definitivo en producción, accede al enlace de Netlify: https://willowy-paletas-6d3731.netlify.app/html/index.html)

## 5. Manual de Uso y Gestión Dinámica
El sistema distingue tres tipos de perfiles con niveles de acceso asimétricos:

* 1.- Usuarios Visitantes (No autenticados): Pueden navegar libremente por la plataforma, leer noticias, revisar la ubicación y visualizar el catálogo de programas,
   pero no poseen permisos para interactuar con el sistema de base de datos, solo pueden mandar mensajes pero deben dejar su correo y nombre para recibir una respuesta.
* 2.- Usuarios Registrados (autenticado): Al crear una cuenta, se desbloquea el acceso al panel "Mi Perfil". Tienen la capacidad de actualizar sus datos,
   subir una fotografía de perfil real, enviar mensajes de contacto a la municipalidad, recibir notificaciones y administrar sus inscripciones a los eventos públicos.
* 3.- Cuentas Administrativas (Socio Comunitario): Al iniciar sesión con privilegios elevados, se desbloquea el ecosistema privado de Paneles de Administración (Dashboards).
   Desde allí, la municipalidad puede:
  * Visualizar listados de jóvenes y gestionar baneos.
  * Publicar nuevas Noticias, Programas y Servicios mediante formularios visuales.
  * Crear eventos en el calendario y auditar tablas de asistencia en tiempo real con datos y fotos de los inscritos.
  * Modificar variables globales del sitio (nombre de la página, links de redes sociales, contactos) actuando como un CMS nativo.
   
## 6. Equipo de Trabajo y Metodología
Desarrollado de manera colaborativa bajo la metodología ágil Kanban, dividiendo las responsabilidades técnicas del equipo:

- Guillermo Vargas (Desarrollador Full Stack): Lideró la arquitectura base de la plataforma, el diseño responsivo de la interfaz (UI/UX) y la programación inicial de conexión,
autenticación con Supabase y reparador de la mayoria de bugs visuales
- Brian Leon (Documentador Técnico y QA): Responsable del levantamiento de requerimientos con el socio comunitario, la gestión de tableros de planificación, 
pruebas de aseguramiento de calidad (Quality Assurance) y redacción de la documentación.
- Amaro Vargas (Desarrollador Full Stack): Encargado de la arquitectura relacional avanzada de bases de datos, desarrollo complejo de algunos de los Paneles de Administración (Dashboards), 
sistema de notificaciones y escritura de lógica automatizada SQL (Triggers) en el servidor.
