// Projects data management and rendering
let projectsData = [];

// Load projects from YAML file
async function loadProjects() {
    try {
        const response = await fetch('projects.yaml');
        const yamlText = await response.text();
        const data = jsyaml.load(yamlText);
        projectsData = data.projects || [];
        renderProjects(projectsData);
    } catch (error) {
        console.error('Error loading projects:', error);
        showEmptyState('Unable to load projects. Please try again later.');
    }
}

// Render projects to the grid
function renderProjects(projects) {
    const grid = document.getElementById('projectsGrid');
    
    if (!projects || projects.length === 0) {
        showEmptyState('No projects found.');
        return;
    }
    
    grid.innerHTML = projects.map(project => createProjectCard(project)).join('');
    
    // Add click listeners to project cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't navigate if clicking on a link
            if (e.target.tagName === 'A') {
                return;
            }
            const projectId = card.dataset.projectId;
            // navigateToProject(projectId);
        });
    });
}

// Create project card HTML
function createProjectCard(project) {
    const imageHtml = project.image 
        ? `<img src="${project.image}" alt="${project.title}">`
        : `<div class="project-image">${project.title.charAt(0)}</div>`;
    
    const technologiesHtml = project.technologies
        ? project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')
        : '';
    
    const linksHtml = project.links
        ? Object.entries(project.links)
            .map(([key, url]) => `<a href="${url}" class="project-link" onclick="event.stopPropagation()" target="_blank" rel="noopener noreferrer">${capitalizeFirst(key)}</a>`)
            .join('')
        : '';
    
    return `
        <div class="project-card" data-project-id="${project.id || slugify(project.title)}">
            <div class="project-image">
                ${imageHtml}
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                ${technologiesHtml ? `<div class="project-technologies">${technologiesHtml}</div>` : ''}
                ${linksHtml ? `<div class="project-links">${linksHtml}</div>` : ''}
            </div>
        </div>
    `;
}

// // Navigate to project detail page
// function navigateToProject(projectId) {
//     window.location.href = `project-detail.html?id=${projectId}`;
// }

// Show empty state
function showEmptyState(message) {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = `
        <div class="empty-state">
            <h3>No Projects Found</h3>
            <p>${message}</p>
        </div>
    `;
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        if (!searchTerm) {
            renderProjects(projectsData);
            return;
        }
        
        const filteredProjects = projectsData.filter(project => {
            const searchableText = [
                project.title,
                project.description,
                ...(project.technologies || [])
            ].join(' ').toLowerCase();
            
            return searchableText.includes(searchTerm);
        });
        
        renderProjects(filteredProjects);
    });
}

// Utility functions
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    setupSearch();
});