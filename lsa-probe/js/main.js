/* LSA-Probe Main JavaScript */

// Global state
window.LSAProbe = {
    data: {},
    currentTimestep: 0.6,
    isPlaying: false
};

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Navbar scroll effect
let lastScrollTop = 0;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = 'none';
    }
    
    lastScrollTop = scrollTop;
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing LSA-Probe demo...');
    
    try {
        // Load all data
        await loadAllData();
        
        // Initialize visualizations
        initializeBaselines();
        initializeExplorer();
        initializeAlgorithmViz();
        initializeResults();
        
        console.log('✓ Demo initialized successfully');
    } catch (error) {
        console.error('Error initializing demo:', error);
        showError('Failed to load demo. Please refresh the page.');
    }
});

// Error handler
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #cc0000;
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Utility: Format number
function formatNumber(num, decimals = 2) {
    return Number(num).toFixed(decimals);
}

// Utility: Format percentage
function formatPercent(num, decimals = 1) {
    return (num * 100).toFixed(decimals) + '%';
}

// Export utilities
window.LSAProbe.formatNumber = formatNumber;
window.LSAProbe.formatPercent = formatPercent;

