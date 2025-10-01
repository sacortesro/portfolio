// Category navigation functionality
console.log('Script loaded: tools.js');

const categoryLinks = document.querySelectorAll('.category-nav a');
const toolCategories = document.querySelectorAll('.tool-category');

window.addEventListener('DOMContentLoaded', function() {
    // Load default category (first one, or "sequence-analysis")
    const defaultCategory = categoryLinks[0].getAttribute('data-category');
    fetch(`categories/${defaultCategory}.html`)
        .then(res => res.text())
        .then(html => {
            document.getElementById('toolsContent').innerHTML = html;
        });
});

categoryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();

        // Remove active class from all links and categories
        categoryLinks.forEach(l => l.classList.remove('active'));
        toolCategories.forEach(cat => cat.classList.remove('active'));

        // Add active class to clicked link
        this.classList.add('active');        
        
        // Show corresponding category (dynamic loading)
        const categoryId = this.getAttribute('data-category');
        const toolsContent = document.getElementById('toolsContent');
        console.log(`Loading category: ${categoryId}`);
        fetch(`categories/${categoryId}.html`)
        .then(res => res.text())
        .then(html => {
            toolsContent.innerHTML = html;
            toolsContent.querySelectorAll('.tool-category').forEach(cat => {
                if (cat.id === categoryId) {
                    cat.classList.add('active');
                } else {
                    cat.classList.remove('active');
                }
            });
        });

        // Scroll to top of content
        document.querySelector('.tools-content').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// Search functionality
const searchInput = document.getElementById('searchInput');
const toolCards = document.querySelectorAll('.tool-card');

searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    
    toolCards.forEach(card => {
        const toolName = card.querySelector('.tool-name').textContent.toLowerCase();
        const toolDescription = card.querySelector('.tool-description').textContent.toLowerCase();
        const toolFeatures = card.querySelector('.features-list').textContent.toLowerCase();
        const codeContent = card.querySelector('.code-example') ? 
            card.querySelector('.code-example').textContent.toLowerCase() : '';
        
        const isMatch = toolName.includes(searchTerm) || 
                        toolDescription.includes(searchTerm) || 
                        toolFeatures.includes(searchTerm) ||
                        codeContent.includes(searchTerm);
        
        if (isMatch || searchTerm === '') {
            card.style.display = 'block';
            card.style.opacity = '1';
        } else {
            card.style.display = 'none';
        }
    });

    // Show search results count
    const visibleCards = Array.from(toolCards).filter(card => 
        card.style.display !== 'none'
    ).length;
    
    // Update search placeholder
    if (searchTerm) {
        searchInput.placeholder = `Found ${visibleCards} tools matching "${searchTerm}"`;
    } else {
        searchInput.placeholder = 'Search tools, techniques, or code examples...';
    }
});

// Code example expand/collapse functionality
document.querySelectorAll('.tool-card').forEach(card => {
    const codeExample = card.querySelector('.code-example');
    if (codeExample) {
        const fullCode = codeExample.textContent;
        const previewLength = 300;
        
        if (fullCode.length > previewLength) {
            const preview = fullCode.substring(0, previewLength) + '...';
            codeExample.textContent = preview;
            
            const expandBtn = document.createElement('button');
            expandBtn.className = 'expand-btn';
            expandBtn.textContent = 'Show More';
            expandBtn.style.display = 'block';
            
            let isExpanded = false;
            
            expandBtn.addEventListener('click', function() {
                if (isExpanded) {
                    codeExample.textContent = preview;
                    expandBtn.textContent = 'Show More';
                    isExpanded = false;
                } else {
                    codeExample.textContent = fullCode;
                    expandBtn.textContent = 'Show Less';
                    isExpanded = true;
                }
            });
            
            card.appendChild(expandBtn);
        }
    }
});

// Smooth scroll animation observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe tool cards for animation
toolCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Copy code to clipboard functionality
document.querySelectorAll('.code-example').forEach(codeBlock => {
    codeBlock.style.position = 'relative';
    
    const copyBtn = document.createElement('button');
    copyBtn.innerHTML = '📋';
    copyBtn.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    copyBtn.addEventListener('click', async function() {
        try {
            await navigator.clipboard.writeText(codeBlock.textContent);
            copyBtn.innerHTML = '✅';
            setTimeout(() => {
                copyBtn.innerHTML = '📋';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy code: ', err);
            copyBtn.innerHTML = '❌';
            setTimeout(() => {
                copyBtn.innerHTML = '📋';
            }, 2000);
        }
    });
    
    codeBlock.appendChild(copyBtn);
    
    // Show copy button on hover
    codeBlock.addEventListener('mouseenter', () => {
        copyBtn.style.opacity = '1';
    });
    
    codeBlock.addEventListener('mouseleave', () => {
        copyBtn.style.opacity = '0';
    });
});

// Tool card hover effects
toolCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
        this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + F to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Escape to clear search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.blur();
    }
});

// Progress indicator for long code examples
document.querySelectorAll('.code-example').forEach(codeBlock => {
    if (codeBlock.textContent.length > 500) {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 2px;
            background: #667eea;
            width: 0%;
            transition: width 0.3s ease;
        `;
        
        codeBlock.style.position = 'relative';
        codeBlock.appendChild(progressBar);
        
        codeBlock.addEventListener('scroll', function() {
            const scrollPercent = (this.scrollTop / (this.scrollHeight - this.clientHeight)) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    }
});

// Auto-save search preferences
searchInput.addEventListener('input', function() {
    localStorage.setItem('biotools_search', this.value);
});

// Load saved search on page load
window.addEventListener('load', function() {
    const savedSearch = localStorage.getItem('biotools_search');
    if (savedSearch) {
        searchInput.value = savedSearch;
        searchInput.dispatchEvent(new Event('input'));
    }
});

// Category quick access with keyboard
document.addEventListener('keydown', function(e) {
    if (e.altKey && e.key >= '1' && e.key <= '8') {
        e.preventDefault();
        const categoryIndex = parseInt(e.key) - 1;
        const categoryLink = categoryLinks[categoryIndex];
        if (categoryLink) {
            categoryLink.click();
        }
    }
});

// Add category tooltips
categoryLinks.forEach((link, index) => {
    link.title = `Press Alt+${index + 1} for quick access`;
});