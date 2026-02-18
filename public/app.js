let allDoxes = [];
let allCreators = [];
let currentLightboxImages = [];
let currentLightboxIndex = 0;
let currentTab = 'doxes';

// ===== SECURITY PROTECTIONS =====
// Disable right-click context menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
});

// Disable F12, F11, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
document.addEventListener('keydown', (e) => {
    // F12 - DevTools
    if (e.key === 'F12') {
        e.preventDefault();
        return false;
    }
    // Ctrl+Shift+I - Inspector
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
    }
    // Ctrl+Shift+J - Console
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
    }
    // Ctrl+Shift+C - Element Picker
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        return false;
    }
    // Ctrl+Shift+K - Web Console
    if (e.ctrlKey && e.shiftKey && e.keyCode === 75) {
        e.preventDefault();
        return false;
    }
    // Ctrl+I - Inspector (alternative)
    if (e.ctrlKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
    }
    // F11 - Fullscreen
    if (e.key === 'F11') {
        e.preventDefault();
        return false;
    }
});

// Disable Ctrl+S (Save)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
    }
});

// Disable developer tools detection
setInterval(() => {
    const start = new Date();
    debugger;
    const end = new Date();
    if (end - start > 100) {
        // DevTools detected
        document.body.innerHTML = '';
        window.location.href = 'about:blank';
    }
}, 1000);

// Disable right-click on images
document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
});

// Disable text selection and copying (optional - can be removed if you want users to select)
document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
});

// Disable copy
document.addEventListener('copy', (e) => {
    e.preventDefault();
    return false;
});

// Disable cut
document.addEventListener('cut', (e) => {
    e.preventDefault();
    return false;
});

// Protect against iframe embedding
if (window.self !== window.top) {
    window.top.location = window.self.location;
}

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    loadDoxes();
    loadCreators();
    setupEventListeners();
    setupTabListeners();
});

function setupEventListeners() {
    // Modal
    const modal = document.getElementById('detailModal');
    const modalClose = document.querySelector('.modal-close');
    const lightbox = document.getElementById('imageLightbox');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });

    lightboxPrev.addEventListener('click', () => {
        currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
        updateLightboxImage('left');
    });

    lightboxNext.addEventListener('click', () => {
        currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxImages.length;
        updateLightboxImage('right');
    });

    // Klawisz Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.classList.remove('active');
            lightbox.classList.remove('active');
        }
    });
}

function loadDoxes() {
    fetch('/api/doxes')
        .then(res => res.json())
        .then(data => {
            allDoxes = data;
            renderDoxes();
        })
        .catch(err => console.error('Błąd przy ładowaniu doxów:', err));
}

function loadCreators() {
    fetch('/api/creators')
        .then(res => res.json())
        .then(data => {
            allCreators = data;
            renderCreators();
        })
        .catch(err => console.error('Błąd przy ładowaniu creators:', err));
}

function renderDoxes() {
    const grid = document.getElementById('doxesGrid');
    grid.innerHTML = '';

    allDoxes.forEach((dox, index) => {
        const card = document.createElement('div');
        card.className = 'dox-card';
        card.innerHTML = `
            <div class="dox-nick">${escapeHtml(dox.nick)}</div>
            <div class="dox-short-desc">${escapeHtml(dox.shortDesc)}</div>
        `;
        card.addEventListener('click', () => {
            openModal(dox);
        });
        grid.appendChild(card);
    });
}

function renderCreators() {
    const grid = document.getElementById('creatorsGrid');
    grid.innerHTML = '';

    if (allCreators.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #aaa; grid-column: 1/-1; padding: 40px;">No creators yet</p>';
        return;
    }

    allCreators.forEach((creator, index) => {
        const card = document.createElement('div');
        card.className = 'creator-card';
        card.innerHTML = `
            <div class="creator-avatar">
                <img src="${escapeHtml(creator.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjM2EzYTNhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjZmZmIiBmb250LXNpemU9IjQwIj4/PC90ZXh0Pjwvc3ZnPg==')}" alt="${escapeHtml(creator.name)}">
            </div>
            <h3 class="creator-name">${escapeHtml(creator.name)}</h3>
            <p class="creator-role">${escapeHtml(creator.role)}</p>
            <p class="creator-desc">${escapeHtml(creator.description)}</p>
        `;
        grid.appendChild(card);
    });
}

function setupTabListeners() {
    const doxesTabBtn = document.getElementById('doxesTabBtn');
    const creatorsTabBtn = document.getElementById('creatorsTabBtn');
    const doxesTab = document.getElementById('doxesTab');
    const creatorsTab = document.getElementById('creatorsTab');

    doxesTabBtn.addEventListener('click', () => {
        currentTab = 'doxes';
        doxesTab.classList.add('active');
        creatorsTab.classList.remove('active');
        doxesTabBtn.classList.remove('inactive-tab');
        creatorsTabBtn.classList.add('inactive-tab');
    });

    creatorsTabBtn.addEventListener('click', () => {
        currentTab = 'creators';
        creatorsTab.classList.add('active');
        doxesTab.classList.remove('active');
        creatorsTabBtn.classList.remove('inactive-tab');
        doxesTabBtn.classList.add('inactive-tab');
    });
}

function openModal(dox) {
    const modal = document.getElementById('detailModal');
    document.getElementById('modalNick').textContent = dox.nick;
    document.getElementById('modalFullDesc').textContent = dox.fullDesc;

    // Tabelki
    const tablesContainer = document.getElementById('modalTables');
    tablesContainer.innerHTML = '';

    if (dox.tables && dox.tables.length > 0) {
        dox.tables.forEach(table => {
            const tableEl = document.createElement('div');
            tableEl.className = 'modal-table';

            let html = `<div class="modal-table-title">${escapeHtml(table.title)}</div>`;

            Object.entries(table.data).forEach(([key, value]) => {
                html += `
                    <div class="modal-table-row">
                        <div class="modal-table-key">${escapeHtml(key)}:</div>
                        <div class="modal-table-value">${linkifyText(String(value))}</div>
                    </div>
                `;
            });

            tableEl.innerHTML = html;
            tablesContainer.appendChild(tableEl);
        });
    }

    // Galeria
    const galleryContainer = document.getElementById('modalGallery');
    galleryContainer.innerHTML = '';

    if (dox.images && dox.images.length > 0) {
        const galleryTitle = document.createElement('div');
        galleryTitle.className = 'gallery-title';
        galleryTitle.textContent = `Gallery (${dox.images.length} images)`;
        galleryContainer.appendChild(galleryTitle);

        const galleryGrid = document.createElement('div');
        galleryGrid.className = 'gallery-grid';

        dox.images.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `<img src="${escapeHtml(img)}" alt="Image ${index + 1}">`;
            item.addEventListener('click', () => {
                openLightbox(dox.images, index);
            });
            galleryGrid.appendChild(item);
        });

        galleryContainer.appendChild(galleryGrid);
    }

    modal.classList.add('active');
}

function openLightbox(images, index) {
    currentLightboxImages = images;
    currentLightboxIndex = index;
    updateLightboxImage();
    document.getElementById('imageLightbox').classList.add('active');
}

function updateLightboxImage(direction = 'none') {
    const img = document.getElementById('lightboxImage');
    img.style.animation = 'none';
    
    // Trigger reflow to restart animation
    void img.offsetWidth;
    
    if (direction === 'left') {
        img.style.animation = 'slideInFromLeft 0.4s ease-out forwards';
    } else if (direction === 'right') {
        img.style.animation = 'slideInFromRight 0.4s ease-out forwards';
    } else {
        img.style.animation = 'fadeInScale 0.4s ease-out forwards';
    }
    
    img.src = currentLightboxImages[currentLightboxIndex];
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function linkifyText(text) {
    // Detect URLs and convert them to clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    return text.replace(urlRegex, (url) => {
        return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="table-link">${escapeHtml(url)}</a>`;
    });
}
