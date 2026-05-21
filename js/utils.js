// Función para actualizar mensajes de estado en la UI
export const showStatusMessage = (element, message, isSuccess) => {
    if (!element) return;
    element.innerHTML = message;
    element.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');
    element.classList.add(isSuccess ? 'bg-green-100' : 'bg-red-100', isSuccess ? 'text-green-700' : 'text-red-700');
    element.classList.remove('hidden');
};
