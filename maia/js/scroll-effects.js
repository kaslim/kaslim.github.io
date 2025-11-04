/**
 * MAIA Demo - Scroll Effects
 * Scroll-based animations and parallax effects
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollEffects();
});

/**
 * Initialize scroll effects
 */
function initScrollEffects() {
    console.log('✨ Initializing scroll effects...');
    
    initParallax();
    initRevealAnimations();
    initScrollProgress();
    
    console.log('✅ Scroll effects initialized');
}

/**
 * Parallax scrolling effect for hero section
 */
function initParallax() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;
    
    window.addEventListener('scroll', window.throttle(() => {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.5;
        
        // Move background slower than scroll
        heroSection.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        
        // Fade out hero content
        const opacity = 1 - (scrolled / window.innerHeight);
        if (opacity >= 0) {
            heroSection.style.opacity = opacity;
        }
    }, 10));
}

/**
 * Reveal animations on scroll
 */
function initRevealAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                
                // Apply stagger effect to children
                const children = entry.target.querySelectorAll('[data-aos]');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('aos-animate');
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
    
    // Observe sections for special effects
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

/**
 * Scroll progress indicator
 */
function initScrollProgress() {
    // Create progress bar if it doesn't exist
    let progressBar = document.querySelector('.scroll-progress');
    
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0;
            height: 3px;
            background: linear-gradient(90deg, #0173B2, #029E73);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);
    }
    
    window.addEventListener('scroll', window.throttle(() => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = `${scrolled}%`;
    }, 50));
}

/**
 * Smooth scroll to top button
 */
function initScrollToTop() {
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-to-top';
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: #0173B2;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(1, 115, 178, 0.3);
    `;
    
    document.body.appendChild(scrollTopBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.transform = 'scale(1)';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.transform = 'scale(0.5)';
        }
    });
    
    // Scroll to top on click
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effect
    scrollTopBtn.addEventListener('mouseenter', () => {
        scrollTopBtn.style.background = '#029E73';
        scrollTopBtn.style.transform = 'scale(1.1)';
    });
    
    scrollTopBtn.addEventListener('mouseleave', () => {
        scrollTopBtn.style.background = '#0173B2';
        scrollTopBtn.style.transform = 'scale(1)';
    });
}

/**
 * Section-specific animations
 */
function initSectionAnimations() {
    const sections = document.querySelectorAll('section');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                
                // Trigger section-specific animations
                switch(sectionId) {
                    case 'motivation':
                        animateStatBoxes();
                        break;
                    case 'method':
                        animateMethodSteps();
                        break;
                    case 'results':
                        animatePerformanceCards();
                        break;
                }
            }
        });
    }, {
        threshold: 0.3
    });
    
    sections.forEach(section => sectionObserver.observe(section));
}

/**
 * Animate stat boxes with counter effect
 */
function animateStatBoxes() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(number => {
        if (number.dataset.animated) return;
        
        const text = number.textContent;
        const value = parseFloat(text.replace('%', ''));
        
        if (isNaN(value)) return;
        
        let current = 0;
        const increment = value / 30;
        const isPercent = text.includes('%');
        
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= value) {
                current = value;
                clearInterval(timer);
            }
            
            number.textContent = isPercent ? 
                `${Math.round(current)}%` : 
                current.toFixed(1);
        }, 30);
        
        number.dataset.animated = 'true';
    });
}

/**
 * Animate method steps sequentially
 */
function animateMethodSteps() {
    const steps = document.querySelectorAll('.method-step');
    
    steps.forEach((step, index) => {
        if (step.dataset.animated) return;
        
        setTimeout(() => {
            step.style.opacity = '0';
            step.style.transform = 'translateY(30px)';
            step.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                step.style.opacity = '1';
                step.style.transform = 'translateY(0)';
            }, 50);
        }, index * 200);
        
        step.dataset.animated = 'true';
    });
}

/**
 * Animate performance cards
 */
function animatePerformanceCards() {
    const cards = document.querySelectorAll('.perf-card');
    
    cards.forEach((card, index) => {
        if (card.dataset.animated) return;
        
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            card.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, 50);
        }, index * 150);
        
        card.dataset.animated = 'true';
    });
}

// Initialize section animations
initSectionAnimations();
initScrollToTop();

window.initScrollEffects = initScrollEffects;

