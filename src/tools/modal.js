// const scriptsData = {

// };
// Modal functionality
const modal = document.getElementById('scriptsModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeBtn = document.querySelector('.close');

// function readYAML(fileName, toolName){
async function readYAML(categoryName){
    console.log("Reading YAML file... categories/"+categoryName+".yaml");
    try{
        const res = await fetch("./categories/"+categoryName+".yaml");
        const text = await res.text();
        const data = jsyaml.load(text);
        return data;
    }
    catch (err) {
        err => console.error("Error reading YAML file:", err);        
        return null;
    };
}

// Open modal function
async function openModal(toolName) {
    const activeCategoryLink = document.querySelector('.category-nav a.active');
    const categoryName = activeCategoryLink ? activeCategoryLink.getAttribute('data-category') : null;
    if (!categoryName) {
        console.error("No active category found.");
        return;
    }

    scriptsData = await readYAML(categoryName);
    // console.log(scriptsData);
    if (!scriptsData) {
        console.error("No data found for category:", categoryName);
        return;
    }

    const scripts = scriptsData[toolName];
    if (!scripts) {
        console.error(`No scripts found for tool: ${toolName}`);
        return;
    }

    modalTitle.textContent = `${toolName.toUpperCase()} Scripts`;
    
    // Show loading
    modalBody.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            Loading scripts...
        </div>
    `;
    
    modal.classList.add('show');

    // Simulate loading delay (remove in production)
    setTimeout(() => {
        renderScripts(scripts);
    }, 800);
}

// Render scripts function
function renderScripts(scripts) {
        modalBody.innerHTML = scripts.map(scriptObj => {
        // Each scriptObj is an object with a single key (e.g., "000"), so get its value
        const scriptKey = Object.keys(scriptObj)[0];
        const script = scriptObj[scriptKey];
        return `
        <div class="script-item">
            <div class="script-header">
                <h3 class="script-title">${script.title}</h3>
                <span class="script-type">${script.type}</span>
            </div>
            <div class="script-description">
                ${script.description}
            </div>
            <div class="script-code">
                <button class="copy-btn" onclick="copyToClipboard(this)">📋 Copy</button>
                <pre><code>${script.code}</code></pre>
            </div>
            <div class="script-actions">
                ${script.github_link ? `<button class="action-btn" onclick="window.open('${script.github_link}', '_blank')">📁 GitHub</button>` : ''}
                ${script.colab_link ? `<button class="action-btn" onclick="window.open('${script.colab_link}', '_blank')">📓 Colab</button>` : ''}
                <button class="action-btn" onclick="downloadScript('${script.title}', \`${script.code.replace(/`/g, '\\`')}\`)">💾 Download</button>
            </div>
        </div>
    `}).join('');
}

// Close modal function
function closeModal() {
    modal.classList.remove('show');
}

// Copy to clipboard function
async function copyToClipboard(button) {
    const codeBlock = button.nextElementSibling.textContent;
    try {
        await navigator.clipboard.writeText(codeBlock);
        button.textContent = '✅ Copied!';
        setTimeout(() => {
            button.innerHTML = '📋 Copy';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
        button.textContent = '❌ Failed';
        setTimeout(() => {
            button.innerHTML = '📋 Copy';
        }, 2000);
    }
}

// Download script function
function downloadScript(title, code) {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Event listeners
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('scripts-link')) {
        e.preventDefault();
        const toolName = e.target.getAttribute('data-tool');
        openModal(toolName);
    }
});

closeBtn.addEventListener('click', closeModal);

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
    }
});