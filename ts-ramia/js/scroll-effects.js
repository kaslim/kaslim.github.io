/**
 * TS-RaMIA Scroll Effects
 * Handles scroll-triggered animations and effects
 */

// Scroll state
const scrollState = {
    observers: [],
    isScrolling: false,
    scrollTimer: null
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initScrollEffects();
});

/**
 * Initialize all scroll effects
 */
function initScrollEffects() {
    setupRevealAnimations();
    setupProgressIndicator();
    setupSectionHighlighting();
    setupParallaxEffect();
}

/**
 * Setup reveal animations on scroll
 */
function setupRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal, .method-step, .metric-card, .app-card');
    
    if (revealElements.length === 0) return;
    
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active', 'animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    revealElements.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
    
    scrollState.observers.push(observer);
}

/**
 * Setup scroll progress indicator
 */
function setupProgressIndicator() {
    // Create progress bar element
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #0173B2, #DE8F05, #029E73);
        z-index: 10000;
        transition: width 0.1s ease-out;
    `;
    document.body.appendChild(progressBar);
    
    // Update progress on scroll
    const updateProgress = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.pageYOffset;
        const progress = (scrolled / documentHeight) * 100;
        
        progressBar.style.width = `${Math.min(progress, 100)}%`;
    };
    
    window.addEventListener('scroll', throttle(updateProgress, 50));
    updateProgress();
}

/**
 * Setup section highlighting in navigation
 */
function setupSectionHighlighting() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '-100px 0px -66% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                
                // Update active nav link
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
    scrollState.observers.push(observer);
}

/**
 * Setup parallax scrolling effect
 */
function setupParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.hero-content');
    
    if (parallaxElements.length === 0) return;
    
    const handleParallax = () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(el => {
            const speed = 0.5;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    };
    
    window.addEventListener('scroll', throttle(handleParallax, 16)); // ~60fps
}

/**
 * Setup stagger animation for lists
 */
function setupStaggerAnimation(containerSelector, itemSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    const items = container.querySelectorAll(itemSelector);
    
    const observerOptions = {
        threshold: 0.2
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const items = entry.target.querySelectorAll(itemSelector);
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('show', 'animate-slide-left');
                    }, index * 100);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    observer.observe(container);
    scrollState.observers.push(observer);
}

/**
 * Smooth scroll to element
 */
function smoothScrollTo(elementId, offset = 80) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

/**
 * Check if element is in viewport
 */
function isInViewport(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= -offset &&
        rect.left >= -offset &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
}

/**
 * Setup scroll spy for navigation
 */
function setupScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', throttle(() => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, 100));
}

/**
 * Add fade-in effect to elements on scroll
 */
function addScrollFadeIn(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    
    const defaultOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        ...options
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, defaultOptions);
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
    
    scrollState.observers.push(observer);
}

/**
 * Add slide-in effect from side
 */
function addScrollSlideIn(selector, direction = 'left', options = {}) {
    const elements = document.querySelectorAll(selector);
    
    const defaultOptions = {
        threshold: 0.1,
        rootMargin: '0px',
        ...options
    };
    
    const translateDirection = direction === 'left' ? 'translateX(-50px)' : 'translateX(50px)';
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
                observer.unobserve(entry.target);
            }
        });
    }, defaultOptions);
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = translateDirection;
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
    
    scrollState.observers.push(observer);
}

/**
 * Setup number counter animation on scroll
 */
function setupNumberCounters() {
    const counters = document.querySelectorAll('[data-count-to]');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
    scrollState.observers.push(observer);
}

/**
 * Animate number counting
 */
function animateNumber(element) {
    const target = parseInt(element.getAttribute('data-count-to'));
    const duration = parseInt(element.getAttribute('data-duration') || 2000);
    const start = parseInt(element.textContent) || 0;
    
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(progress * (target - start) + start);
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target.toLocaleString();
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * Add scale effect on scroll
 */
function addScrollScale(selector, options = {}) {
    const elements = document.querySelectorAll(selector);
    
    const defaultOptions = {
        threshold: 0.2,
        ...options
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'scale(1)';
                observer.unobserve(entry.target);
            }
        });
    }, defaultOptions);
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'scale(0.9)';
        el.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        observer.observe(el);
    });
    
    scrollState.observers.push(observer);
}

/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Cleanup function for observers
 */
function cleanupScrollEffects() {
    scrollState.observers.forEach(observer => {
        if (observer && typeof observer.disconnect === 'function') {
            observer.disconnect();
        }
    });
    scrollState.observers = [];
}

// Export functions for global access
window.smoothScrollTo = smoothScrollTo;
window.isInViewport = isInViewport;
window.addScrollFadeIn = addScrollFadeIn;
window.addScrollSlideIn = addScrollSlideIn;
window.setupNumberCounters = setupNumberCounters;
window.cleanupScrollEffects = cleanupScrollEffects;

