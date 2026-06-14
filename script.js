const fs = require('fs');

let html = fs.readFileSync('html/index.html', 'utf8');

// 1. Extraer la sección "accion"
const accionStart = html.indexOf('<!-- ==================== SECCIÓN: ACCIÓN JOVEN ==================== -->');
const programasStart = html.indexOf('<!-- ==================== SECCIÓN: PROGRAMAS ==================== -->');

// Si no encuentra el comentario, busca el tag
let accionText = '';
if (accionStart !== -1) {
    accionText = html.substring(accionStart, programasStart);
} else {
    // Buscar la sección manualmente
    const acc = html.indexOf('<section id="accion"');
    const prog = html.indexOf('<section id="programas"');
    accionText = html.substring(acc, prog);
}

// 2. Crear las nuevas secciones dinámicas
const nuevoApoyo = `
      <!-- ==================== SECCIÓN: APOYO JOVEN ==================== -->
      <section id="apoyo" class="py-20 px-6 bg-light-bg">
        <div class="container mx-auto max-w-7xl">
          <i class="fas fa-layer-group text-4xl text-primary-500 text-center w-full block mb-4"></i>
          <h2 class="section-title">Apoyo Joven</h2>
          <p class="section-subtitle">Explora todos nuestros programas de asesoría, cursos y preuniversitario en un solo lugar.</p>
          
          <!-- Filtros de Pestañas -->
          <div class="flex flex-wrap justify-center gap-4 mb-12" id="servicios-tabs">
            <button class="px-6 py-2 rounded-full font-semibold transition-all active-tab bg-primary-500 text-white shadow-md" data-tab="Curso">Destacados</button>
            <button class="px-6 py-2 rounded-full font-semibold transition-all bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-200" data-tab="Asesoría">Asesorías</button>
            <button class="px-6 py-2 rounded-full font-semibold transition-all bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-200" data-tab="Preuniversitario">Preuniversitarios</button>
            <button class="px-6 py-2 rounded-full font-semibold transition-all bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-200" data-tab="all">Todos</button>
          </div>

          <!-- Contenedor Dinámico -->
          <div id="servicios-grid" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Las tarjetas se inyectarán aquí por JS -->
          </div>
        </div>
      </section>
`;

const nuevosProgramas = `
      <!-- ==================== SECCIÓN: PROGRAMAS ==================== -->
      <section id="programas" class="py-20 px-6 bg-white overflow-hidden">
        <div class="container mx-auto max-w-7xl relative">
          <i class="fas fa-handshake-angle text-4xl text-primary-500 text-center w-full block mb-4"></i>
          <h2 class="section-title">Nuestros Programas</h2>
          <p class="section-subtitle">Conoce los programas insertos en la Oficina de la Juventud para apoyarte.</p>

          <!-- Contenedor del Carrusel -->
          <div class="relative mt-12">
            <!-- Botones de Navegación del Carrusel -->
            <button id="prev-programa" class="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 md:-ml-8 z-10 bg-white shadow-lg text-primary-500 rounded-full w-12 h-12 flex items-center justify-center hover:bg-primary-50 hover:scale-110 transition-all focus:outline-none hidden md:flex">
              <i class="fas fa-chevron-left text-xl"></i>
            </button>

            <!-- Scroll Container -->
            <!-- snap-start y w-full md:w-[calc(50%-12px)] para que encajen perfectos sin verse cortados -->
            <div id="programas-carousel" class="flex overflow-x-auto gap-6 snap-x snap-mandatory pb-8 pt-4 px-4 scroll-smooth hide-scrollbar" style="scrollbar-width: none; -ms-overflow-style: none;">
              <!-- Las tarjetas de programas se inyectarán aquí -->
            </div>

            <button id="next-programa" class="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 md:-mr-8 z-10 bg-white shadow-lg text-primary-500 rounded-full w-12 h-12 flex items-center justify-center hover:bg-primary-50 hover:scale-110 transition-all focus:outline-none hidden md:flex">
              <i class="fas fa-chevron-right text-xl"></i>
            </button>
          </div>
        </div>
      </section>
`;

// Encontrar inicio de apoyo y fin de programas
const inicioApoyo = html.indexOf('<!-- ==================== SECCIÓN: APOYO JOVEN ==================== -->');
const indexApoyoBack = html.indexOf('<section id="apoyo"');
const inicioApoyoReal = inicioApoyo !== -1 ? inicioApoyo : indexApoyoBack;

const inicioSaludMental = html.indexOf('<!-- ==================== SECCIÓN: SALUD MENTAL ==================== -->');
const indexSaludMentalBack = html.indexOf('<section id="salud-mental"');
const inicioSaludMentalReal = inicioSaludMental !== -1 ? inicioSaludMental : indexSaludMentalBack;

// Cortar la primera parte (antes de apoyo) y la ultima parte (desde salud mental)
const headPart = html.substring(0, inicioApoyoReal);
const tailPart = html.substring(inicioSaludMentalReal);

// Ensamblar el nuevo body central: Apoyo -> Programas -> Accion
let newHtml = headPart + nuevoApoyo + nuevosProgramas + "\n" + (accionStart !== -1 ? html.substring(accionStart, programasStart) : accionText) + tailPart;

// 3. Reemplazar Modales
const inicioModales = newHtml.indexOf('<!-- Modales de Programas -->');
const finModales = newHtml.indexOf('<!-- Scripts -->');

if (inicioModales !== -1 && finModales !== -1) {
    const modalesContainer = `  <!-- Contenedor Dinámico para Modales -->
  <div id="modales-container"></div>\n\n`;
    newHtml = newHtml.substring(0, Math.max(0, inicioModales)) + modalesContainer + newHtml.substring(finModales);
}

// 4. Cambiar type="module" en programas.js
newHtml = newHtml.replace('<script src="../js/programas.js"></script>', '<script type="module" src="../js/programas.js"></script>');

fs.writeFileSync('html/index.html', newHtml, 'utf8');
console.log('index.html updated successfully via Node.js');
