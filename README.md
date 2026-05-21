Proyecto Web Santiago Joven - Plataforma "Apoyo Joven"

1. Descripción del Proyecto
Este proyecto es una plataforma web desarrollada para la institución externa **Santiago Joven**, dirigida a jóvenes de entre 14 y 29 años.
El sitio busca centralizar información sobre programas, salud mental, asesorías, proyecciones y un calendario de actividades,
respondiendo a una necesidad institucional real.

3. Stack Tecnológico
Para el desarrollo de la plataforma estamos utilizando las siguientes tecnologías:
Frontend: HTML5, CSS3, JavaScript puro (Vanilla) y Tailwind CSS para el diseño ágil y responsive.
Backend y Base de Datos (Propuesta):Se integrará una base de datos relacional/no relacional 
para manejar la autenticacióny el almacenamiento dinámico.

5. Equipo de Trabajo y Roles
El equipo está conformado por 3 integrantes, organizados de la siguiente manera:

| Nombre     | Rol                                                                                                                                                                                    |
|            |                                                                                                                                                                                        |
| Amaro      | Desarrollo Frontend y Arquitectura: Lidera la creación de la interfaz, el diseño responsive respetando la línea gráfica, y la programación lógica de la vista (JavaScript y Tailwind). |
| Guillermo  | Gestión de Backend y Base de Datos: Encargado de estructurar e integrar la base de datos, configurar la API y manejar la lógica detrás del sistema de usuarios y roles.                |
| Brian      | Documentación y Coordinación: Responsable de registrar la metodología (Kanban), ordenar el repositorio, documentar los avances y generar el manual de uso final.                       |

4. Metodología de Trabajo
Estamos utilizando la metodología ágil Kanban. Todo el trabajo se divide en tarjetas visuales para asignar tareas claras a cada integrante,
permitiendo un seguimiento continuo y evitando cuellos de botella en el desarrollo semanal.

5. Gestión Dinámica y Actualización de Contenidos (Propuesta)
Para cumplir con el requerimiento de que Santiago Joven pueda actualizar su propia página sin intervenir el código fuente,
la solución técnica consistirá en un sistema de autenticación con control de privilegios (Roles de Usuario):
* Usuarios Visitantes: Solo podrán navegar por el sitio y ver la información.
* Usuarios Comunes: mismso privilegios que el usuario visitante pero con acceso a participar en encuestas, eventos y contactos.
* Usuarios con Privilegios: Al iniciar sesión en la misma plataforma, la interfaz les habilitará opciones especiales.
  Podrán agregar, editar o eliminar directamente desde la pantalla elementos como eventos del calendario, fotografías o noticias institucionales.

6. Estado Actual (Avance 50%)
* Diseño frontend estructurado y responsive.
* Implementación de Tailwind CSS completada.
* Lógica de modales de autenticación inicial construida.
