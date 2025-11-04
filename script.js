// Gestión de enlaces personalizado tipo Linktree
class LinkTreeManager {
    constructor() {
        this.version = '1.1'; // Versión para controlar actualizaciones de datos
        this.links = [];
        this.socialLinks = {};
        this.analytics = {};
        this.adminPassword = 'MauroDemo2025!'; // Cambiar por tu password
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.checkVersion();
        this.loadData();
        this.renderLinks();
        this.setupEventListeners();
        this.loadSampleData();
        this.setupClickTracking();
        this.checkAuthStatus();
    }

    // Verificar la versión y limpiar datos si es necesario
    checkVersion() {
        const storedVersion = localStorage.getItem('linktree_version');
        if (storedVersion !== this.version) {
            localStorage.removeItem('linktree_links');
            localStorage.removeItem('linktree_social');
            localStorage.removeItem('linktree_analytics');
            localStorage.setItem('linktree_version', this.version);
        }
    }

    // Cargar datos del localStorage
    loadData() {
        const savedLinks = localStorage.getItem('linktree_links');
        const savedSocial = localStorage.getItem('linktree_social');
        const savedAnalytics = localStorage.getItem('linktree_analytics');

        if (savedLinks) {
            this.links = JSON.parse(savedLinks);
        }

        if (savedSocial) {
            this.socialLinks = JSON.parse(savedSocial);
            this.updateSocialDisplay();
        }

        if (savedAnalytics) {
            this.analytics = JSON.parse(savedAnalytics);
        }
    }

    // Guardar datos en localStorage
    saveData() {
        localStorage.setItem('linktree_links', JSON.stringify(this.links));
        localStorage.setItem('linktree_social', JSON.stringify(this.socialLinks));
        localStorage.setItem('linktree_analytics', JSON.stringify(this.analytics));
    }

    // Cargar datos de ejemplo si no hay enlaces guardados
    loadSampleData() {
        if (this.links.length === 0) {
            this.links = [
                {
                    id: Date.now() + 1,
                    title: "🚀 Digitaliza",
                    url: "https://linkangri.vercel.app",
                    icon: "🚀",
                    description: "Digitaliza tu empresa con un agregador de enlaces"
                },
                {
                    id: Date.now() + 2,
                    title: "🎓 Entra en nuestros grupos/comunidades Digitaliza",
                    url: "https://cal.com/founderjourney/workshops-tech-sin-barreras",
                    icon: "🎓",
                    description: "Educación tech accesible en cada ciudad que visito"
                },
                {
                    id: Date.now() + 3,
                    title: "💰 Sliding Scale Pricing - Consultoría",
                    url: "https://cal.com/founderjourney/sliding-scale",
                    icon: "💰",
                    description: "Pagas según tu realidad - IA & Web democratizada"
                },
                {
                    id: Date.now() + 4,
                    title: "💼 Proyectos y Portfolio",
                    url: "https://github.com/founderjourney?tab=repositories",
                    icon: "💼",
                    description: "Open source components y recursos descargables"
                },
                {
                    id: Date.now() + 5,
                    title: "📍 Nómada con Impacto",
                    url: "https://calendar.google.com/calendar/u/2?cid=Z2xvYmFscGF0aGZpbmRlcmxsY0BnbWFpbC5jb20",
                    icon: "📍",
                    description: "Próximos destinos + meetups locales"
                }
            ];

            this.socialLinks = {
                email: "mauro@webcraftai.com",
                linkedin: "https://linkedin.com/in/maurotechbuilder",
                twitter: "https://twitter.com/mauronomadatech",
                youtube: "https://youtube.com/@maurotechbuilder",
                website: "https://mauronomadatech.com"
            };

            this.saveData();
            this.renderLinks();
            this.updateSocialDisplay();
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Prevenir envío de formularios por defecto
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                e.preventDefault();
                if (e.target.closest('.admin-panel')) {
                    this.addLink();
                }
            }
        });
    }

    // Renderizar enlaces en la página principal
    renderLinks() {
        const container = document.getElementById('linksContainer');

        if (this.links.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin: 2rem 0;">No hay enlaces configurados. Usa el panel de administración para agregar enlaces.</p>';
            return;
        }

        container.innerHTML = this.links.map(link => {
            if (link.isMultiLink) {
                return `
                    <div class="link-item multi-link-item" data-link-id="${link.id}">
                        <div class="link-content">
                            <div class="link-icon">${link.icon}</div>
                            <div class="link-text">
                                <div class="link-title">${link.title}</div>
                                ${link.description ? `<div class="link-description">${link.description}</div>` : ''}
                                <div class="sub-links">
                                    ${link.subLinks.map(subLink => `
                                        <a href="${subLink.url}" class="sub-link-btn" target="_blank" rel="noopener noreferrer">
                                            ${subLink.title}
                                        </a>
                                    `).join('')}
                                </div>
                                ${this.isAuthenticated && this.analytics[link.id] ? `<div class="link-stats">👆 ${this.analytics[link.id].clicks || 0} clicks</div>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <a href="${link.url}" class="link-item" target="_blank" rel="noopener noreferrer" data-link-id="${link.id}">
                        <div class="link-content">
                            <div class="link-icon">${link.icon}</div>
                            <div class="link-text">
                                <div class="link-title">${link.title}</div>
                                ${link.description ? `<div class="link-description">${link.description}</div>` : ''}
                                ${this.isAuthenticated && this.analytics[link.id] ? `<div class="link-stats">👆 ${this.analytics[link.id].clicks || 0} clicks</div>` : ''}
                            </div>
                            <div class="link-arrow">→</div>
                        </div>
                    </a>
                `;
            }
        }).join('');

        // Agregar animación escalonada
        const linkItems = container.querySelectorAll('.link-item');
        linkItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Renderizar enlaces en el panel de administración
    renderAdminLinks() {
        const container = document.getElementById('adminLinksList');

        if (this.links.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No hay enlaces configurados</p>';
            return;
        }

        container.innerHTML = this.links.map(link => `
            <div class="admin-link-item">
                <div class="admin-link-info">
                    <div class="admin-link-title">${link.icon} ${link.title}</div>
                    <div class="admin-link-url">${link.url}</div>
                </div>
                <button class="delete-btn" onclick="linkTreeManager.deleteLink(${link.id})">
                    Eliminar
                </button>
            </div>
        `).join('');
    }

    // Agregar nuevo enlace
    addLink() {
        const title = document.getElementById('linkTitle').value.trim();
        const url = document.getElementById('linkUrl').value.trim();
        const icon = document.getElementById('linkIcon').value.trim() || '🔗';
        const description = document.getElementById('linkDescription').value.trim();

        if (!title || !url) {
            this.showNotification('Por favor completa título y URL', 'error');
            return;
        }

        // Validar URL
        try {
            new URL(url);
        } catch {
            this.showNotification('Por favor ingresa una URL válida', 'error');
            return;
        }

        const newLink = {
            id: Date.now(),
            title,
            url,
            icon,
            description
        };

        this.links.push(newLink);
        this.saveData();
        this.renderLinks();
        this.renderAdminLinks();

        // Limpiar formulario
        document.getElementById('linkTitle').value = '';
        document.getElementById('linkUrl').value = '';
        document.getElementById('linkIcon').value = '';
        document.getElementById('linkDescription').value = '';

        this.showNotification('Enlace agregado exitosamente', 'success');
    }

    // Eliminar enlace
    deleteLink(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este enlace?')) {
            this.links = this.links.filter(link => link.id !== id);
            this.saveData();
            this.renderLinks();
            this.renderAdminLinks();
            this.showNotification('Enlace eliminado', 'success');
        }
    }

    // Limpiar todos los enlaces
    clearAllLinks() {
        if (confirm('¿Estás seguro de que quieres eliminar TODOS los enlaces? Esta acción no se puede deshacer.')) {
            this.links = [];
            this.saveData();
            this.renderLinks();
            this.renderAdminLinks();
            this.showNotification('Todos los enlaces han sido eliminados', 'success');
        }
    }

    // Actualizar enlaces sociales
    updateSocialLinks() {
        this.socialLinks = {
            email: document.getElementById('emailConfig').value.trim(),
            linkedin: document.getElementById('linkedinConfig').value.trim(),
            twitter: document.getElementById('twitterConfig').value.trim(),
            youtube: document.getElementById('youtubeConfig').value.trim(),
            website: document.getElementById('websiteConfig').value.trim()
        };

        this.saveData();
        this.updateSocialDisplay();
        this.showNotification('Redes sociales actualizadas', 'success');
    }

    // Actualizar display de redes sociales
    updateSocialDisplay() {
        // Actualizar enlaces sociales
        if (this.socialLinks.email) {
            document.getElementById('email-link').href = `mailto:${this.socialLinks.email}`;
            document.getElementById('email-link').style.display = 'flex';
        } else {
            document.getElementById('email-link').style.display = 'none';
        }

        if (this.socialLinks.linkedin) {
            document.getElementById('linkedin-link').href = this.socialLinks.linkedin;
            document.getElementById('linkedin-link').style.display = 'flex';
        } else {
            document.getElementById('linkedin-link').style.display = 'none';
        }

        if (this.socialLinks.twitter) {
            document.getElementById('twitter-link').href = this.socialLinks.twitter;
            document.getElementById('twitter-link').style.display = 'flex';
        } else {
            document.getElementById('twitter-link').style.display = 'none';
        }

        if (this.socialLinks.youtube) {
            document.getElementById('youtube-link').href = this.socialLinks.youtube;
            document.getElementById('youtube-link').style.display = 'flex';
        } else {
            document.getElementById('youtube-link').style.display = 'none';
        }

        if (this.socialLinks.website) {
            document.getElementById('website-link').href = this.socialLinks.website;
            document.getElementById('website-link').style.display = 'flex';
        } else {
            document.getElementById('website-link').style.display = 'none';
        }

        // Llenar formulario de configuración social
        document.getElementById('emailConfig').value = this.socialLinks.email || '';
        document.getElementById('linkedinConfig').value = this.socialLinks.linkedin || '';
        document.getElementById('twitterConfig').value = this.socialLinks.twitter || '';
        document.getElementById('youtubeConfig').value = this.socialLinks.youtube || '';
        document.getElementById('websiteConfig').value = this.socialLinks.website || '';
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;

        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Funciones globales para el panel de administración
function toggleAdminPanel() {
    if (!linkTreeManager.isAuthenticated) {
        if (!linkTreeManager.authenticateAdmin()) {
            return;
        }
    }

    const panel = document.getElementById('adminPanel');
    panel.classList.toggle('active');

    if (panel.classList.contains('active')) {
        linkTreeManager.renderAdminLinks();
        // Enfocar el primer input
        setTimeout(() => {
            document.getElementById('linkTitle').focus();
        }, 300);
    }
}

function addLink() {
    linkTreeManager.addLink();
}

function clearAllLinks() {
    linkTreeManager.clearAllLinks();
}

function updateSocialLinks() {
    linkTreeManager.updateSocialLinks();
}

// Agregar estilos para animaciones de notificación
const notificationStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Inicializar cuando el DOM esté listo
let linkTreeManager;

document.addEventListener('DOMContentLoaded', () => {
    linkTreeManager = new LinkTreeManager();
});

// Cerrar panel de administración con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const panel = document.getElementById('adminPanel');
        if (panel.classList.contains('active')) {
            toggleAdminPanel();
        }
    }
});

// Cerrar panel al hacer click fuera
document.addEventListener('click', (e) => {
    const panel = document.getElementById('adminPanel');
    const adminBtn = document.querySelector('.admin-btn');

    if (panel.classList.contains('active') &&
        !panel.contains(e.target) &&
        !adminBtn.contains(e.target)) {
        toggleAdminPanel();
    }
});

// Funciones de utilidad adicionales
function exportData() {
    const data = {
        links: linkTreeManager.links,
        socialLinks: linkTreeManager.socialLinks,
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'linktree-backup.json';
    link.click();

    URL.revokeObjectURL(url);
    linkTreeManager.showNotification('Datos exportados exitosamente', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (data.links && Array.isArray(data.links)) {
                    linkTreeManager.links = data.links;
                }

                if (data.socialLinks && typeof data.socialLinks === 'object') {
                    linkTreeManager.socialLinks = data.socialLinks;
                }

                linkTreeManager.saveData();
                linkTreeManager.renderLinks();
                linkTreeManager.renderAdminLinks();
                linkTreeManager.updateSocialDisplay();

                linkTreeManager.showNotification('Datos importados exitosamente', 'success');
            } catch (error) {
                linkTreeManager.showNotification('Error al importar datos', 'error');
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// Nuevas funciones agregadas para mejorar el Linktree

// Autenticación del administrador
LinkTreeManager.prototype.checkAuthStatus = function() {
    const authStatus = sessionStorage.getItem('linktree_admin_auth');
    this.isAuthenticated = authStatus === 'true';
};

LinkTreeManager.prototype.authenticateAdmin = function() {
    const password = prompt('Ingrese la contraseña de administrador:');
    if (password === this.adminPassword) {
        this.isAuthenticated = true;
        sessionStorage.setItem('linktree_admin_auth', 'true');
        this.showNotification('Autenticación exitosa', 'success');
        return true;
    } else {
        this.showNotification('Contraseña incorrecta', 'error');
        return false;
    }
};

// Tracking de clicks
LinkTreeManager.prototype.setupClickTracking = function() {
    document.addEventListener('click', (e) => {
        // Track clicks en sub-links
        if (e.target.classList.contains('sub-link-btn')) {
            const linkItem = e.target.closest('.link-item');
            if (linkItem && linkItem.dataset.linkId) {
                this.trackClick(linkItem.dataset.linkId);
            }
        }
        // Track clicks en enlaces normales
        else {
            const linkItem = e.target.closest('.link-item');
            if (linkItem && linkItem.dataset.linkId && !linkItem.classList.contains('multi-link-item')) {
                this.trackClick(linkItem.dataset.linkId);
            }
        }
    });
};

LinkTreeManager.prototype.trackClick = function(linkId) {
    if (!this.analytics[linkId]) {
        this.analytics[linkId] = { clicks: 0, lastClicked: null };
    }

    this.analytics[linkId].clicks++;
    this.analytics[linkId].lastClicked = new Date().toISOString();
    this.saveData();
};

// Generar QR Code para el sitio
LinkTreeManager.prototype.generateQRCode = function() {
    const url = window.location.href;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: var(--surface); padding: 2rem; border-radius: 16px; text-align: center; max-width: 400px;">
                <h3 style="color: var(--text-primary); margin-bottom: 1rem;">Código QR</h3>
                <img src="${qrUrl}" alt="QR Code" style="border-radius: 8px; margin-bottom: 1rem;">
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">Escanea para acceder a tus enlaces</p>
                <button onclick="this.closest('div').parentNode.remove()" style="background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">Cerrar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
};

// Modo oscuro/claro
LinkTreeManager.prototype.toggleTheme = function() {
    const currentTheme = document.body.dataset.theme || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.body.dataset.theme = newTheme;
    localStorage.setItem('linktree_theme', newTheme);

    this.showNotification(`Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'success');
};

// Mostrar estadísticas
LinkTreeManager.prototype.showAnalytics = function() {
    if (!this.isAuthenticated) {
        this.showNotification('Debes estar autenticado para ver estadísticas', 'error');
        return;
    }

    const totalClicks = Object.values(this.analytics).reduce((sum, data) => sum + (data.clicks || 0), 0);
    const mostClicked = this.links.find(link => {
        const maxClicks = Math.max(...Object.entries(this.analytics).map(([id, data]) => data.clicks || 0));
        return this.analytics[link.id]?.clicks === maxClicks;
    });

    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: var(--surface); padding: 2rem; border-radius: 16px; max-width: 500px; max-height: 80vh; overflow-y: auto;">
                <h3 style="color: var(--text-primary); margin-bottom: 1rem;">📊 Estadísticas</h3>
                <div style="color: var(--text-secondary); margin-bottom: 1rem;">
                    <p><strong>Total de clicks:</strong> ${totalClicks}</p>
                    <p><strong>Enlace más popular:</strong> ${mostClicked ? mostClicked.title : 'N/A'}</p>
                    <p><strong>Enlaces totales:</strong> ${this.links.length}</p>
                </div>
                <div style="margin-bottom: 1rem;">
                    <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Clicks por enlace:</h4>
                    ${this.links.map(link => `
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
                            <span style="color: var(--text-secondary);">${link.icon} ${link.title}</span>
                            <span style="color: var(--primary-color); font-weight: bold;">${this.analytics[link.id]?.clicks || 0}</span>
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.closest('div').parentNode.remove()" style="background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; width: 100%;">Cerrar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
};
