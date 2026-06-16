function myMenuFunction() {
    const menu = document.getElementById('myNavMenu');
    const toggle = document.querySelector('.menu-toggle');

    menu.classList.toggle('responsive');
    const isOpen = menu.classList.contains('responsive');
    toggle.setAttribute('aria-expanded', String(isOpen));
}

const header = document.getElementById('header');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 20);
}

function updateActiveLink() {
    const currentPosition = window.scrollY + 120;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (!link) {
            return;
        }

        link.classList.toggle('active-link', currentPosition >= sectionTop && currentPosition < sectionBottom);
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const menu = document.getElementById('myNavMenu');
        const toggle = document.querySelector('.menu-toggle');

        menu.classList.remove('responsive');
        toggle.setAttribute('aria-expanded', 'false');
    });
});

if (window.Typed) {
    new Typed('.typedText', {
        strings: [
            'prediction pipelines with calibrated probabilities',
            'benchmarking systems for AI model quality',
            'LLM workflows using APIs, tools and RAG',
            'clean datasets from raw, noisy data sources'
        ],
        loop: true,
        typeSpeed: 46,
        backSpeed: 28,
        backDelay: 1900
    });
}

if (window.ScrollReveal) {
    ScrollReveal().reveal('.reveal-up', {
        origin: 'bottom',
        distance: '28px',
        duration: 750,
        interval: 90,
        reset: false
    });
}

window.addEventListener('scroll', () => {
    updateHeader();
    updateActiveLink();
});

updateHeader();
updateActiveLink();