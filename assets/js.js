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
const projectGrid = document.getElementById('projectGrid');

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
    }[character]));
}

function renderProjects(projects) {
    if (!projectGrid) {
        return;
    }

    if (!Array.isArray(projects) || projects.length === 0) {
        projectGrid.innerHTML = '<p class="project-loading">No projects available yet.</p>';
        return;
    }

    projectGrid.innerHTML = projects.map(project => {
        const cardClass = project.featured ? 'project-card featured-project reveal-up' : 'project-card reveal-up';
        const url = escapeHtml(project.url || '#');
        const linkLabel = project.url ? 'View repository' : 'Project details';

        return `
                <article class="${cardClass}">
                    <div class="project-body">
                        <div class="project-topline">
                            <span class="tag">${escapeHtml(project.tag)}</span>
                            <span class="project-year">${escapeHtml(project.year)}</span>
                        </div>
                        <h3>${escapeHtml(project.title)}</h3>
                        <dl class="project-brief">
                            <div><dt>Problem</dt><dd>${escapeHtml(project.problem)}</dd></div>
                            <div><dt>Built</dt><dd>${escapeHtml(project.built)}</dd></div>
                            <div><dt>Impact</dt><dd>${escapeHtml(project.impact)}</dd></div>
                        </dl>
                        <a class="project-link" href="${url}" target="_blank" rel="noopener">${linkLabel} <i class="uil uil-external-link-alt"></i></a>
                    </div>
                </article>`;
    }).join('');

    if (window.ScrollReveal) {
        ScrollReveal().reveal('#projectGrid .reveal-up', {
            origin: 'bottom',
            distance: '28px',
            duration: 750,
            interval: 90,
            reset: false
        });
    }
}

async function loadProjects() {
    if (!projectGrid) {
        return;
    }

    try {
        const response = await fetch('data/projects.json', { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        renderProjects(await response.json());
    } catch (error) {
        projectGrid.innerHTML = '<p class="project-loading">Projects could not be loaded. Please check data/projects.json.</p>';
        console.error('Unable to load projects:', error);
    }
}

loadProjects();
