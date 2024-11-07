// Add this at the very beginning of your script, outside the DOMContentLoaded handler
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', function() {
    window.scrollTo(0, 0);
    
    // Initialize tooltips with additional configuration
    var tooltipList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    tooltipList.forEach(function(tooltipTriggerEl) {
        var tooltip = new bootstrap.Tooltip(tooltipTriggerEl, {
            trigger: 'hover' // Only show on hover, not on click
        });
        
        // Hide tooltip when link is clicked
        tooltipTriggerEl.addEventListener('click', function() {
            tooltip.hide();
        });
    });

    // Password protection functionality
    const projectPasswords = {
        'arcoscan': '1up',
        'promontory': '1up'
    };

    // Check if password has been previously validated
    const checkStoredAccess = (projectName) => {
        return sessionStorage.getItem(`access_${projectName}`) === 'granted';
    };

    // Grant access to project
    const grantAccess = (projectName) => {
        sessionStorage.setItem(`access_${projectName}`, 'granted');
        const projectElement = document.querySelector(`[data-project="${projectName}"]`).closest('.tab-pane');
        projectElement.querySelector('.password-overlay').style.display = 'none';
        projectElement.querySelector('.project-content').style.display = 'block';
    };

    // Handle password submission
    document.querySelectorAll('.password-submit').forEach(button => {
        button.addEventListener('click', function() {
            const overlay = this.closest('.password-overlay');
            const projectName = overlay.dataset.project;
            const input = overlay.querySelector('.password-input');
            const errorMsg = overlay.querySelector('.password-error');
            
            if (input.value === projectPasswords[projectName]) {
                grantAccess(projectName);
            } else {
                errorMsg.style.display = 'block';
                input.value = '';
            }
        });
    });

    // Handle enter key in password input
    document.querySelectorAll('.password-input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                this.nextElementSibling.click();
            }
        });

        // Hide error message when typing
        input.addEventListener('input', function() {
            const errorMsg = this.closest('.password-overlay').querySelector('.password-error');
            errorMsg.style.display = 'none';
        });
    });

    // Check for stored access when tabs are shown
    const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabElements.forEach(tab => {
        // Handle tab changes
        tab.addEventListener('shown.bs.tab', handleTabChange);
        
        // Handle clicks on current tab
        tab.addEventListener('click', function(event) {
            const isCurrentTab = this.classList.contains('active');
            if (isCurrentTab) {
                // Scroll to the top of the projects section
                const projectsSection = document.getElementById('projects');
                projectsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Separate the tab change handler for cleaner code
    function handleTabChange(event) {
        // Scroll to the top of the projects section
        const projectsSection = document.getElementById('projects');
        projectsSection.scrollIntoView({ behavior: 'smooth' });

        const targetPane = document.querySelector(event.target.getAttribute('data-bs-target'));
        const overlay = targetPane.querySelector('.password-overlay');
        if (overlay) {
            const projectName = overlay.dataset.project;
            if (checkStoredAccess(projectName)) {
                grantAccess(projectName);
            }
        }

        // Add loading state
        targetPane.classList.add('loading');
        
        // Remove loading state once all images are loaded
        Promise.all(
            Array.from(targetPane.querySelectorAll('img'))
                .filter(img => !img.complete)
                .map(img => new Promise(resolve => {
                    img.onload = img.onerror = resolve;
                }))
        ).then(() => {
            targetPane.classList.remove('loading');
        });
    }

    // Update headshot click handler
    const headshot = document.querySelector('.hero-headshot');
    const heroImageArea = document.querySelector('.hero-image-area');
    const nameContainer = document.querySelector('.name-container');

    if (headshot && heroImageArea) {
        // Preload full-size image
        const fullSizeImg = new Image();
        fullSizeImg.src = headshot.src;

        // Use requestAnimationFrame for smoother transitions
        headshot.addEventListener('click', function(e) {
            e.stopPropagation();
            
            requestAnimationFrame(() => {
                if (this.classList.contains('expanded')) {
                    this.classList.remove('expanded');
                    nameContainer.appendChild(this);
                } else {
                    this.classList.add('expanded');
                    heroImageArea.appendChild(this);
                }
            });
        });

        // Optimize click handler for closing
        document.addEventListener('click', function(e) {
            if (e.target !== headshot && headshot.classList.contains('expanded')) {
                requestAnimationFrame(() => {
                    headshot.classList.remove('expanded');
                    nameContainer.appendChild(headshot);
                });
            }
        });
    }

    // Add shadow when scrolling
    const stickyContainer = document.querySelector('.sticky-tabs-container');
    if (stickyContainer) {
        let ticking = false;
        const updateSticky = () => {
            const scrollPosition = window.scrollY;
            const containerOffset = stickyContainer.offsetTop;
            
            // Add some buffer for when to trigger the sticky state
            if (scrollPosition > containerOffset - 10) { // Added small buffer
                stickyContainer.classList.add('is-sticky');
            } else {
                stickyContainer.classList.remove('is-sticky');
            }
            ticking = false;
        };

        // Initial check
        updateSticky();

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateSticky);
                ticking = true;
            }
        });
    }

    // View Toggle functionality
    document.querySelectorAll('.view-toggle-input').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const projectContent = this.closest('.project-content');
            const summaryView = projectContent.querySelector('.summary-view');
            const caseStudyView = projectContent.querySelector('.case-study-view');
            
            if (this.checked) {
                summaryView.style.display = 'none';
                caseStudyView.style.display = 'block';
            } else {
                summaryView.style.display = 'block';
                caseStudyView.style.display = 'none';
            }
        });
    });

    // Image Modal functionality
    const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
    const modalImage = document.querySelector('#imageModal .modal-body img');

    document.querySelectorAll('.project-images img').forEach(img => {
        img.addEventListener('click', function() {
            modalImage.src = this.src;
            modalImage.alt = this.alt;
            imageModal.show();
        });
    });

    // Optional: Close modal on background click
    document.querySelector('#imageModal').addEventListener('click', function(e) {
        if (e.target === this) {
            imageModal.hide();
        }
    });

    // Optional: Handle keyboard events
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && imageModal._isShown) {
            imageModal.hide();
        }
    });

    // Add lazy loading to all images
    document.querySelectorAll('img').forEach(img => {
        img.loading = 'lazy';
        img.decoding = 'async';
    });

    // Add this after your existing tab event listeners
    tabElements.forEach(tab => {
        tab.addEventListener('mouseenter', function() {
            const targetId = this.getAttribute('data-bs-target');
            const targetPane = document.querySelector(targetId);
            
            // Preload images in the target pane
            targetPane.querySelectorAll('img').forEach(img => {
                const src = img.getAttribute('src');
                if (src) {
                    const preloadLink = document.createElement('link');
                    preloadLink.href = src;
                    preloadLink.rel = 'preload';
                    preloadLink.as = 'image';
                    document.head.appendChild(preloadLink);
                }
            });
        });
    });
});
