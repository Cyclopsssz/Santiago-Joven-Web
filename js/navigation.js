export const initNavigation = () => {
    // controles de navegacion movil
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuBtn = document.getElementById('close-menu-btn');

    // alternar estado de menu movil
    const toggleMenu = () => {
        if (mobileMenu) {
            mobileMenu.classList.toggle('-translate-x-full');
        }
    };

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
                if (!id) return;
                
                let mainId = id.includes('-') ? id.split('-')[0] : id;
                document.querySelectorAll(`a[href*="#${mainId}"]`).forEach(l => l.classList.add('active'));
                if (id === 'inicio') {
                    const inicioLink = document.querySelector('a[href="#inicio"]');
                    if (inicioLink) inicioLink.classList.add('active');
                }
            }
        });
    }, { threshold: 0.4 });
    
    sections.forEach(s => observer.observe(s));
};
