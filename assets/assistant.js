const state = {
    projects: [],
    sha: null
};

const fields = {
    message: document.getElementById('assistantMessage'),
    title: document.getElementById('projectTitle'),
    year: document.getElementById('projectYear'),
    tag: document.getElementById('projectTag'),
    url: document.getElementById('projectUrl'),
    problem: document.getElementById('projectProblem'),
    built: document.getElementById('projectBuilt'),
    impact: document.getElementById('projectImpact'),
    featured: document.getElementById('projectFeatured'),
    owner: document.getElementById('repoOwner'),
    repo: document.getElementById('repoName'),
    branch: document.getElementById('repoBranch'),
    token: document.getElementById('githubToken'),
    preview: document.getElementById('jsonPreview'),
    status: document.getElementById('assistantStatus'),
    authStatus: document.getElementById('authStatus')
};

const buttons = {
    draft: document.getElementById('draftProjectBtn'),
    clear: document.getElementById('clearAssistantBtn'),
    add: document.getElementById('addProjectBtn'),
    copy: document.getElementById('copyJsonBtn'),
    publish: document.getElementById('publishBtn'),
    refresh: document.getElementById('refreshProjectsBtn')
};

function setStatus(message, type = 'info') {
    fields.status.textContent = message;
    fields.status.dataset.type = type;
}

function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function matchValue(text, labels) {
    const markers = 'title|titre|project|projet|add project|ajoute un projet|ajoute projet|year|annee|annÃƒÆ’Ã‚Â©e|tag|tools|technologies|tech|stack|problem|probleme|problÃƒÆ’Ã‚Â¨me|need|besoin|built|build|fait|realise|rÃƒÆ’Ã‚Â©alisÃƒÆ’Ã‚Â©|created|impact|result|rÃƒÆ’Ã‚Â©sultat|outcome|url|github';

    for (const label of labels) {
        const pattern = new RegExp(`${label}\\s*[:=-]\\s*([\\s\\S]*?)(?=\\s*[.;,]?\\s+(?:${markers})\\s*[:=-]|$)`, 'i');
        const match = text.match(pattern);
        if (match) {
            return normalizeText(match[1]).replace(/[.;,]$/, '');
        }
    }

    return '';
}

function guessTitle(text) {
    const labeled = text.match(/(?:add project|ajoute un projet|ajoute projet|project|projet|title|titre)\s*[:=-]\s*([^,.;\n]+)/i);

    if (labeled) {
        return normalizeText(labeled[1]).replace(/^[\'"]|[\'"]$/g, '');
    }

    const quoted = text.match(/[\"']([^\"']{3,80})[\"']/);
    if (quoted) {
        return normalizeText(quoted[1]);
    }

    return '';
}

function guessUrl(text) {
    const match = text.match(/https?:\/\/[^\s,;]+/i);
    return match ? match[0].replace(/[).]$/, '') : '';
}

function guessYear(text) {
    const match = text.match(/\b(20\d{2})\b/);
    return match ? match[1] : new Date().getFullYear().toString();
}

function guessTag(text) {
    const direct = matchValue(text, ['tag', 'tools', 'technologies', 'tech', 'stack']);

    if (direct) {
        return direct;
    }

    const known = ['Python', 'FastAPI', 'LLM', 'RAG', 'Chroma', 'Docker', 'JavaScript', 'HTML', 'CSS', 'PHP', 'MySQL', 'Java', 'PyTorch', 'Scikit-learn', 'SQL', 'React'];
    const found = known.filter(item => new RegExp(`\\b${item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text));
    return found.length ? found.join(' - ') : 'AI - Data - Web';
}

function parseMessage() {
    const text = normalizeText(fields.message.value);

    if (!text) {
        setStatus('Write a message first.', 'error');
        return;
    }

    fields.title.value = guessTitle(text);
    fields.year.value = guessYear(text);
    fields.tag.value = guessTag(text);
    fields.url.value = guessUrl(text);
    fields.problem.value = matchValue(text, ['problem', 'probleme', 'problÃƒÆ’Ã‚Â¨me', 'need', 'besoin']) || 'Describe the user or business problem this project solves.';
    fields.built.value = matchValue(text, ['built', 'build', 'fait', 'realise', 'rÃƒÆ’Ã‚Â©alisÃƒÆ’Ã‚Â©', 'created']) || 'Describe the technical approach, tools and architecture.';
    fields.impact.value = matchValue(text, ['impact', 'result', 'rÃƒÆ’Ã‚Â©sultat', 'outcome']) || 'Describe the result, value or measurable outcome.';
    fields.featured.checked = /featured|important|hackathon|championship|award|ranked|winner|gagn/i.test(text);

    setStatus('Draft generated. Review the fields before adding it to JSON.', 'success');
}

function readProjectForm() {
    const project = {
        title: normalizeText(fields.title.value),
        year: normalizeText(fields.year.value),
        tag: normalizeText(fields.tag.value),
        problem: normalizeText(fields.problem.value),
        built: normalizeText(fields.built.value),
        impact: normalizeText(fields.impact.value),
        url: normalizeText(fields.url.value),
        featured: fields.featured.checked
    };

    const missing = ['title', 'year', 'tag', 'problem', 'built', 'impact'].filter(key => !project[key]);
    if (missing.length) {
        throw new Error(`Missing fields: ${missing.join(', ')}`);
    }

    return project;
}

function sortProjects(projects) {
    return [...projects].sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
}

function updatePreview() {
    fields.preview.textContent = JSON.stringify(state.projects, null, 2);
}

function addProject() {
    try {
        const project = readProjectForm();
        const existingIndex = state.projects.findIndex(item => item.title.toLowerCase() === project.title.toLowerCase());

        if (existingIndex >= 0) {
            state.projects[existingIndex] = project;
            setStatus('Existing project replaced in the JSON preview.', 'success');
        } else {
            state.projects.unshift(project);
            setStatus('Project added to the JSON preview.', 'success');
        }

        state.projects = sortProjects(state.projects);
        updatePreview();
    } catch (error) {
        setStatus(error.message, 'error');
    }
}

function base64EncodeUtf8(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}

async function loadLocalProjects() {
    try {
        const response = await fetch('data/projects.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        state.projects = await response.json();
        state.sha = null;
        updatePreview();
        setStatus('Loaded data/projects.json from the site.', 'success');
    } catch (error) {
        setStatus(`Unable to load local JSON: ${error.message}`, 'error');
    }
}

async function fetchGithubFile() {
    const owner = normalizeText(fields.owner.value);
    const repo = normalizeText(fields.repo.value);
    const branch = normalizeText(fields.branch.value);
    const token = normalizeText(fields.token.value);

    if (!owner || !repo || !branch || !token) {
        throw new Error('Repository owner, name, branch and token are required.');
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/data/projects.json?ref=${encodeURIComponent(branch)}`;
    const response = await fetch(url, {
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    if (!response.ok) {
        throw new Error(`GitHub read failed: HTTP ${response.status}`);
    }

    return response.json();
}

async function publishProjects() {
    try {
        buttons.publish.disabled = true;
        setStatus('Checking the current file on GitHub...', 'info');

        const file = await fetchGithubFile();
        const owner = normalizeText(fields.owner.value);
        const repo = normalizeText(fields.repo.value);
        const branch = normalizeText(fields.branch.value);
        const token = normalizeText(fields.token.value);
        const body = {
            message: 'Update portfolio projects from mobile assistant',
            content: base64EncodeUtf8(`${JSON.stringify(state.projects, null, 2)}\n`),
            sha: file.sha,
            branch
        };

        setStatus('Publishing data/projects.json to GitHub...', 'info');
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/projects.json`, {
            method: 'PUT',
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const details = await response.text();
            throw new Error(`GitHub commit failed: HTTP ${response.status} ${details}`);
        }

        setStatus(`Published to ${owner}/${repo} on branch ${branch}.`, 'success');
    } catch (error) {
        setStatus(error.message, 'error');
    } finally {
        buttons.publish.disabled = false;
    }
}

async function copyJson() {
    try {
        await navigator.clipboard.writeText(`${JSON.stringify(state.projects, null, 2)}\n`);
        setStatus('JSON copied to clipboard.', 'success');
    } catch (error) {
        setStatus('Clipboard blocked by the browser. Select the JSON manually if needed.', 'error');
    }
}


function unlockAssistant(token) {
    fields.token.value = token;
    fields.unlockToken.value = token;
    sessionStorage.setItem('portfolioAssistantToken', token);
    document.body.classList.remove('assistant-locked');
    fields.auth.hidden = true;
    fields.workspace.hidden = false;
}

async function validateAndUnlock() {
    const token = normalizeText(fields.unlockToken.value);

    if (!token) {
        setStatus('Enter your GitHub token to unlock the assistant.', 'error');
        return;
    }

    try {
        buttons.unlock.disabled = true;
        setStatus('Checking GitHub access...', 'info');
        fields.token.value = token;
        await fetchGithubFile();
        unlockAssistant(token);
        setStatus('Assistant unlocked. You can now update the portfolio.', 'success');
        await loadLocalProjects();
    } catch (error) {
        setStatus(`Access denied: ${error.message}`, 'error');
    } finally {
        buttons.unlock.disabled = false;
    }
}
function clearForm() {
    fields.message.value = '';
    fields.title.value = '';
    fields.year.value = '';
    fields.tag.value = '';
    fields.url.value = '';
    fields.problem.value = '';
    fields.built.value = '';
    fields.impact.value = '';
    fields.featured.checked = false;
    setStatus('Form cleared.', 'info');
}

buttons.draft.addEventListener('click', parseMessage);
buttons.clear.addEventListener('click', clearForm);
buttons.add.addEventListener('click', addProject);
buttons.copy.addEventListener('click', copyJson);
buttons.publish.addEventListener('click', publishProjects);
buttons.refresh.addEventListener('click', loadLocalProjects);
buttons.unlock.addEventListener('click', validateAndUnlock);

fields.workspace.hidden = true;
const savedToken = sessionStorage.getItem('portfolioAssistantToken');
if (savedToken) {
    fields.unlockToken.value = savedToken;
    fields.token.value = savedToken;
}
fields.preview.textContent = 'Unlock the assistant to load portfolio data.';
setStatus('Assistant locked. GitHub access is required.', 'info');

fields.token.addEventListener('change', () => {
    fields.unlockToken.value = fields.token.value;
    sessionStorage.setItem('portfolioAssistantToken', fields.token.value);
});


