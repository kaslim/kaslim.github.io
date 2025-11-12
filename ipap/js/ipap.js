/* IPAP Interactive Features */

document.addEventListener('DOMContentLoaded', () => {
    // Animate flowchart nodes on scroll
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate phase nodes
    document.querySelectorAll('.phase-node').forEach((node, index) => {
        node.style.opacity = '0';
        node.style.transform = 'translateY(20px)';
        node.style.transition = `all 0.6s ease ${index * 0.2}s`;
        animateOnScroll.observe(node);
    });

    // Animate arrows with dash effect
    document.querySelectorAll('.flow-arrow line').forEach(line => {
        const length = line.getTotalLength();
        line.style.strokeDasharray = `${length}`;
        line.style.strokeDashoffset = `${length}`;
        
        const animateArrow = () => {
            line.style.transition = 'stroke-dashoffset 2s ease-in-out';
            line.style.strokeDashoffset = '0';
        };
        
        const arrowObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateArrow();
                }
            });
        }, observerOptions);
        
        arrowObserver.observe(line);
    });

    // Animate paper cards on scroll
    document.querySelectorAll('.paper-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        animateOnScroll.observe(card);
    });

    // Animate connection items
    document.querySelectorAll('.connection-item').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `all 0.6s ease ${index * 0.2}s`;
        animateOnScroll.observe(item);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add hover effects to SVG nodes
    document.querySelectorAll('.phase-node.clickable').forEach(node => {
        node.addEventListener('mouseenter', () => {
            node.style.transition = 'all 0.3s ease';
        });
    });

    // Log successful initialization
    console.log('✓ IPAP page initialized successfully');
});

