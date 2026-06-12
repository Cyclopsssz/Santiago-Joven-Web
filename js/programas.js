document.addEventListener('DOMContentLoaded', () => {
  const openButtons = document.querySelectorAll('.open-modal-btn');
  const closeButtons = document.querySelectorAll('.close-modal-btn');

  // Abrir modales
  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
          modalContent.classList.remove('scale-95');
          modalContent.classList.add('scale-100');
        }
      }
    });
  });

  // Cerrar modales con el botón (X)
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.fixed'); // Encuentra el contenedor principal del modal
      if (modal) {
        closeModal(modal);
      }
    });
  });

  // Cerrar modales al hacer clic fuera del contenido
  const modals = document.querySelectorAll('.fixed.inset-0');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  function closeModal(modal) {
    modal.classList.add('opacity-0', 'pointer-events-none');
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.classList.remove('scale-100');
      modalContent.classList.add('scale-95');
    }
  }
});
