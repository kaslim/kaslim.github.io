/* =====================================
   TS-RaMIA AAAI Slides Controller
   18 slides with layout templates
   ===================================== */

class SlidesController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = slidesData.length;
        this.isFullscreen = false;
        this.notesVisible = false;
        this.tocVisible = false;
        
        this.init();
    }
    
    init() {
        this.loadFromHash();
        this.renderSlides();
        this.setupKeyboardControls();
        this.setupTOC();
        this.updateProgress();
        this.showSlide(this.currentSlide);
        this.showShortcutsHint();
        
        console.log(`TS-RaMIA Slides initialized: ${this.totalSlides} slides`);
    }
    
    loadFromHash() {
        const hash = window.location.hash;
        if (hash) {
            const match = hash.match(/^#s=(\d+)$/);
            if (match) {
                const slideNum = parseInt(match[1]);
                if (slideNum >= 1 && slideNum <= this.totalSlides) {
                    this.currentSlide = slideNum;
                }
            }
        }
    }
    
    updateHash() {
        window.history.replaceState(null, null, `#s=${this.currentSlide}`);
    }
    
    renderSlides() {
        const deck = document.getElementById('slide-deck');
        if (!deck) return;
        
        slidesData.forEach((slide, index) => {
            const slideEl = this.createSlideElement(slide, index + 1);
            deck.querySelector('.slide-container').appendChild(slideEl);
        });
    }
    
    createSlideElement(slideData, slideNum) {
        const slideEl = document.createElement('div');
        const layoutClass = slideData.layout ? `layout-${slideData.layout}` : '';
        const typeClass = slideData.type ? `slide-${slideData.type}` : '';
        slideEl.className = `slide ${layoutClass} ${typeClass}`;
        slideEl.dataset.slideNum = slideNum;
        
        // HUD (top bar with brand and page number)
        const hud = document.createElement('div');
        hud.className = 'slide-hud';
        hud.innerHTML = `
            <div class="hud-brand">TS-RaMIA · EAIM @ AAAI 2026</div>
            <div class="hud-page">${slideNum} / ${this.totalSlides}</div>
        `;
        slideEl.appendChild(hud);
        
        // Content wrapper
        const content = document.createElement('div');
        content.className = 'slide-content';
        
        // Render based on layout
        switch(slideData.layout) {
            case 'split':
                this.renderSplitLayout(content, slideData);
                break;
            case 'split-reverse':
                this.renderSplitReverseLayout(content, slideData);
                break;
            case 'center':
                this.renderCenterLayout(content, slideData);
                break;
            case '2row':
                this.render2RowLayout(content, slideData);
                break;
            default:
                this.renderDefaultLayout(content, slideData);
        }
        
        slideEl.appendChild(content);
        
        // Next hint arrow (optional)
        if (slideNum < this.totalSlides) {
            const nextHint = document.createElement('div');
            nextHint.className = 'next-hint';
            nextHint.textContent = '→';
            slideEl.appendChild(nextHint);
        }
        
        // Store notes
        if (slideData.notes) {
            slideEl.dataset.notes = slideData.notes;
        }
        
        return slideEl;
    }
    
    renderSplitLayout(container, slideData) {
        const left = document.createElement('div');
        left.className = 'content-left';
        left.appendChild(this.createTextContent(slideData));
        
        const right = document.createElement('div');
        right.className = 'content-right';
        right.appendChild(this.createVisualContent(slideData));
        
        container.appendChild(left);
        container.appendChild(right);
    }
    
    renderSplitReverseLayout(container, slideData) {
        const left = document.createElement('div');
        left.className = 'content-left';
        left.appendChild(this.createVisualContent(slideData));
        
        const right = document.createElement('div');
        right.className = 'content-right';
        right.appendChild(this.createTextContent(slideData));
        
        container.appendChild(left);
        container.appendChild(right);
    }
    
    renderCenterLayout(container, slideData) {
        const wrapper = document.createElement('div');
        wrapper.appendChild(this.createTextContent(slideData));
        wrapper.appendChild(this.createVisualContent(slideData));
        container.appendChild(wrapper);
    }
    
    render2RowLayout(container, slideData) {
        const top = document.createElement('div');
        top.className = 'content-top';
        top.appendChild(this.createTextContent(slideData));
        
        const bottom = document.createElement('div');
        bottom.className = 'content-bottom';
        bottom.appendChild(this.createVisualContent(slideData));
        
        container.appendChild(top);
        container.appendChild(bottom);
    }
    
    renderDefaultLayout(container, slideData) {
        container.appendChild(this.createTextContent(slideData));
        container.appendChild(this.createVisualContent(slideData));
    }
    
    createTextContent(slideData) {
        const textWrapper = document.createElement('div');
        
        if (slideData.title) {
            const title = document.createElement('h1');
            title.className = 'slide-title';
            title.textContent = slideData.title;
            textWrapper.appendChild(title);
        }
        
        if (slideData.subtitle) {
            const subtitle = document.createElement('h2');
            subtitle.className = 'slide-subtitle';
            subtitle.textContent = slideData.subtitle;
            textWrapper.appendChild(subtitle);
        }
        
        if (slideData.bullets && slideData.bullets.length > 0) {
            const bullets = document.createElement('ul');
            bullets.className = 'slide-bullets';
            slideData.bullets.forEach(bullet => {
                const li = document.createElement('li');
                li.textContent = bullet;
                bullets.appendChild(li);
            });
            textWrapper.appendChild(bullets);
        }
        
        if (slideData.callouts && slideData.callouts.length > 0) {
            const callouts = document.createElement('div');
            callouts.className = 'slide-callouts';
            slideData.callouts.forEach(callout => {
                const chip = document.createElement('div');
                chip.className = 'callout-chip';
                chip.textContent = callout;
                callouts.appendChild(chip);
            });
            textWrapper.appendChild(callouts);
        }
        
        return textWrapper;
    }
    
    createVisualContent(slideData) {
        const visualWrapper = document.createElement('div');
        
        if (slideData.visual) {
            const visual = document.createElement('div');
            visual.className = 'slide-visual';
            visual.id = `visual-${slideData.id}`;
            visual.dataset.visualConfig = JSON.stringify(slideData.visual);
            visualWrapper.appendChild(visual);
        }
        
        return visualWrapper;
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                    
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevSlide();
                    break;
                    
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                    
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
                    
                case 'Escape':
                    e.preventDefault();
                    if (this.tocVisible) {
                        this.hideTOC();
                    } else if (this.notesVisible) {
                        this.hideNotes();
                    } else {
                        this.showTOC();
                    }
                    break;
                    
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
                    
                case 'n':
                case 'N':
                    e.preventDefault();
                    this.toggleNotes();
                    break;
                    
                default:
                    if (e.key >= '0' && e.key <= '9') {
                        this.handleNumberKey(e.key);
                    }
                    break;
            }
        });
        
        // Swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        this.handleSwipe = () => {
            if (touchEndX < touchStartX - 50) {
                this.nextSlide();
            }
            if (touchEndX > touchStartX + 50) {
                this.prevSlide();
            }
        };
    }
    
    handleNumberKey(key) {
        const num = parseInt(key);
        if (num >= 1 && num <= Math.min(9, this.totalSlides)) {
            this.goToSlide(num);
        }
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }
    
    prevSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }
    
    goToSlide(num) {
        if (num < 1 || num > this.totalSlides || num === this.currentSlide) {
            return;
        }
        
        const oldSlide = this.currentSlide;
        this.currentSlide = num;
        
        this.showSlide(num, oldSlide);
        this.updateProgress();
        this.updateHash();
        this.updateNotes();
        
        if (this.tocVisible) {
            this.hideTOC();
        }
    }
    
    showSlide(num, oldNum = null) {
        const slides = document.querySelectorAll('.slide');
        
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev');
            
            if (index + 1 === num) {
                slide.classList.add('active');
                this.renderSlideVisuals(slide);
            } else if (oldNum && index + 1 === oldNum) {
                slide.classList.add('prev');
            }
        });
    }
    
    renderSlideVisuals(slideEl) {
        const visual = slideEl.querySelector('.slide-visual');
        if (visual && visual.dataset.visualConfig && typeof renderVisual === 'function') {
            try {
                const visualConfig = JSON.parse(visual.dataset.visualConfig);
                renderVisual(visual.id, visualConfig);
            } catch (e) {
                console.error('Error parsing visual config:', e);
            }
        }
    }
    
    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            const progress = (this.currentSlide / this.totalSlides) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }
    
    setupTOC() {
        const tocGrid = document.getElementById('toc-grid');
        if (!tocGrid) return;
        
        slidesData.forEach((slide, index) => {
            const item = document.createElement('div');
            item.className = 'toc-item';
            item.dataset.slideNum = index + 1;
            
            item.innerHTML = `
                <div class="toc-item-number">Slide ${index + 1}</div>
                <div class="toc-item-title">${slide.title}</div>
            `;
            
            item.addEventListener('click', () => {
                this.goToSlide(index + 1);
            });
            
            tocGrid.appendChild(item);
        });
        
        document.getElementById('toc-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'toc-overlay') {
                this.hideTOC();
            }
        });
    }
    
    showTOC() {
        const overlay = document.getElementById('toc-overlay');
        if (overlay) {
            overlay.classList.add('active');
            this.tocVisible = true;
            
            document.querySelectorAll('.toc-item').forEach((item, index) => {
                item.classList.toggle('current', index + 1 === this.currentSlide);
            });
        }
    }
    
    hideTOC() {
        const overlay = document.getElementById('toc-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            this.tocVisible = false;
        }
    }
    
    toggleNotes() {
        if (this.notesVisible) {
            this.hideNotes();
        } else {
            this.showNotes();
        }
    }
    
    showNotes() {
        const panel = document.getElementById('notes-panel');
        if (panel) {
            panel.classList.add('active');
            this.notesVisible = true;
            this.updateNotes();
        }
    }
    
    hideNotes() {
        const panel = document.getElementById('notes-panel');
        if (panel) {
            panel.classList.remove('active');
            this.notesVisible = false;
        }
    }
    
    updateNotes() {
        const currentSlideEl = document.querySelector(`.slide[data-slide-num="${this.currentSlide}"]`);
        const notesContent = document.querySelector('.notes-content');
        
        if (currentSlideEl && notesContent) {
            const notes = currentSlideEl.dataset.notes || 'No speaker notes for this slide.';
            notesContent.textContent = notes;
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                this.isFullscreen = true;
                document.body.classList.add('fullscreen');
            }).catch(err => {
                console.warn('Fullscreen request failed:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    this.isFullscreen = false;
                    document.body.classList.remove('fullscreen');
                });
            }
        }
    }
    
    showShortcutsHint() {
        const hint = document.getElementById('shortcuts-hint');
        if (hint) {
            hint.classList.add('show');
            setTimeout(() => {
                hint.classList.remove('show');
            }, 5000);
        }
    }
}

// Initialize
let slidesController;

document.addEventListener('DOMContentLoaded', () => {
    slidesController = new SlidesController();
});

// Handle browser back/forward
window.addEventListener('popstate', () => {
    if (slidesController) {
        slidesController.loadFromHash();
        slidesController.showSlide(slidesController.currentSlide);
        slidesController.updateProgress();
    }
});
