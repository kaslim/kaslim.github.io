/* Diffusion-MIA Animation Module */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        T_MAX: 100,
        TAU: 0.35, // Threshold
        SPECTROGRAM_WIDTH: 256,
        SPECTROGRAM_HEIGHT: 128,
        MEMBER_DELTA_RANGE: [0.15, 0.30],
        NON_MEMBER_DELTA_RANGE: [0.40, 0.65],
        ANIMATION_FPS: 30,
        ANIMATION_DURATION: 3000 // ms for one cycle
    };
    
    // State
    let state = {
        isPlaying: false,
        currentT: 50,
        isMember: true,
        animationFrame: null,
        startTime: null,
        spectrogramX0: null,
        spectrogramXt: null,
        spectrogramXHat0: null,
        delta: 0.25
    };
    
    // Canvas references
    let canvases = {
        x0: null,
        xt: null,
        xHat0: null
    };
    
    let contexts = {};
    
    // Initialize module
    function init() {
        const section = document.getElementById('mia-diffusion-mia');
        if (!section) {
            console.warn('Diffusion-MIA section not found');
            return;
        }
        
        // Get canvas elements
        canvases.x0 = document.getElementById('mia-canvas-x0');
        canvases.xt = document.getElementById('mia-canvas-xt');
        canvases.xHat0 = document.getElementById('mia-canvas-xhat0');
        
        if (!canvases.x0 || !canvases.xt || !canvases.xHat0) {
            console.error('Canvas elements not found');
            return;
        }
        
        // Setup canvases
        setupCanvases();
        
        // Generate initial spectrogram
        state.spectrogramX0 = generateSpectrogram();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initial render
        updateVisualization();
        
        console.log('✓ Diffusion-MIA animation initialized');
    }
    
    function setupCanvases() {
        Object.keys(canvases).forEach(key => {
            const canvas = canvases[key];
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            
            canvas.width = CONFIG.SPECTROGRAM_WIDTH * dpr;
            canvas.height = CONFIG.SPECTROGRAM_HEIGHT * dpr;
            
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
            
            contexts[key] = ctx;
            
            // Store display dimensions
            canvas.dataset.displayWidth = CONFIG.SPECTROGRAM_WIDTH;
            canvas.dataset.displayHeight = CONFIG.SPECTROGRAM_HEIGHT;
        });
    }
    
    function setupEventListeners() {
        // Play/Pause button
        const playBtn = document.getElementById('mia-play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', togglePlay);
        }
        
        // Timestep slider
        const slider = document.getElementById('mia-timestep-slider');
        if (slider) {
            slider.addEventListener('input', (e) => {
                state.currentT = parseInt(e.target.value);
                updateVisualization();
            });
        }
        
        // Member/Non-member toggle
        const toggle = document.getElementById('mia-case-toggle');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                state.isMember = e.target.checked;
                updateVisualization();
            });
        }
        
        // Window resize
        window.addEventListener('resize', () => {
            setupCanvases();
            updateVisualization();
        });
    }
    
    function togglePlay() {
        state.isPlaying = !state.isPlaying;
        const playBtn = document.getElementById('mia-play-btn');
        
        if (state.isPlaying) {
            playBtn.textContent = '⏸ Pause';
            playBtn.setAttribute('aria-label', 'Pause animation');
            startAnimation();
        } else {
            playBtn.textContent = '▶ Play';
            playBtn.setAttribute('aria-label', 'Play animation');
            stopAnimation();
        }
    }
    
    function startAnimation() {
        state.startTime = performance.now();
        animate();
    }
    
    function stopAnimation() {
        if (state.animationFrame) {
            cancelAnimationFrame(state.animationFrame);
            state.animationFrame = null;
        }
    }
    
    function animate() {
        if (!state.isPlaying) return;
        
        const elapsed = performance.now() - state.startTime;
        const progress = (elapsed % CONFIG.ANIMATION_DURATION) / CONFIG.ANIMATION_DURATION;
        
        // Update t based on animation progress (sine wave for smooth back-and-forth)
        const tProgress = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5; // 0 to 1
        state.currentT = Math.floor(tProgress * CONFIG.T_MAX);
        
        // Update slider
        const slider = document.getElementById('mia-timestep-slider');
        if (slider) {
            slider.value = state.currentT;
        }
        
        // Update visualization
        updateVisualization();
        
        // Continue animation
        state.animationFrame = requestAnimationFrame(animate);
    }
    
    function generateSpectrogram() {
        // Generate a synthetic spectrogram that looks realistic
        const width = CONFIG.SPECTROGRAM_WIDTH;
        const height = CONFIG.SPECTROGRAM_HEIGHT;
        const data = new Array(height).fill(0).map(() => new Array(width).fill(0));
        
        // Seed for reproducibility
        const seed = 1337;
        let rng = seed;
        
        function random() {
            rng = (rng * 9301 + 49297) % 233280;
            return rng / 233280;
        }
        
        // Add horizontal energy bands (like harmonics)
        for (let band = 0; band < 5; band++) {
            const freq = Math.floor(height * (0.2 + band * 0.15));
            const amplitude = 0.6 + random() * 0.4;
            
            for (let x = 0; x < width; x++) {
                const variation = 0.7 + random() * 0.3;
                data[freq][x] = amplitude * variation;
            }
        }
        
        // Add vertical structure (like temporal patterns)
        for (let x = 0; x < width; x += 20) {
            const intensity = 0.3 + random() * 0.4;
            for (let y = 0; y < height; y++) {
                data[y][x] = Math.max(data[y][x], intensity * (0.8 + random() * 0.2));
            }
        }
        
        // Add noise texture
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                data[y][x] += random() * 0.1;
                data[y][x] = Math.min(1, Math.max(0, data[y][x]));
            }
        }
        
        return data;
    }
    
    function applyForwardDiffusion(spectrogram, t) {
        const alpha = t / CONFIG.T_MAX; // 0 to 1
        const width = CONFIG.SPECTROGRAM_WIDTH;
        const height = CONFIG.SPECTROGRAM_HEIGHT;
        const noisy = new Array(height).fill(0).map(() => new Array(width).fill(0));
        
        // Seed for noise
        let rng = (t * 1000) % 233280;
        function random() {
            rng = (rng * 9301 + 49297) % 233280;
            return rng / 233280;
        }
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const signal = spectrogram[y][x];
                const noise = random() * 2 - 1; // -1 to 1
                // Forward diffusion: x_t = sqrt(1-alpha) * x_0 + sqrt(alpha) * noise
                noisy[y][x] = signal * Math.sqrt(1 - alpha) + noise * Math.sqrt(alpha);
                noisy[y][x] = Math.min(1, Math.max(-1, noisy[y][x]));
            }
        }
        
        return noisy;
    }
    
    function applyReverseDenoise(noisySpectrogram, t, isMember) {
        const alpha = t / CONFIG.T_MAX;
        const width = CONFIG.SPECTROGRAM_WIDTH;
        const height = CONFIG.SPECTROGRAM_HEIGHT;
        const reconstructed = new Array(height).fill(0).map(() => new Array(width).fill(0));
        
        // Seed for reconstruction error
        let rng = (t * 2000 + (isMember ? 0 : 10000)) % 233280;
        function random() {
            rng = (rng * 9301 + 49297) % 233280;
            return rng / 233280;
        }
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const noisy = noisySpectrogram[y][x];
                
                // Reverse denoise: approximate x_0 from x_t
                // In real diffusion, this would use the learned model
                // Here we simulate: better reconstruction for members
                
                let reconstruction;
                if (isMember) {
                    // Member: good reconstruction (close to original)
                    const errorScale = 0.05 + alpha * 0.1; // Small error
                    reconstruction = noisy * (1 - alpha) + state.spectrogramX0[y][x] * alpha;
                    reconstruction += (random() - 0.5) * errorScale;
                } else {
                    // Non-member: poor reconstruction (blurred + shifted)
                    const errorScale = 0.15 + alpha * 0.25; // Larger error
                    const blur = 0.3; // Blur effect
                    const shift = Math.sin(x * 0.1) * 0.1; // Structural shift
                    reconstruction = noisy * (1 - alpha - blur) + state.spectrogramX0[y][x] * (alpha + blur) + shift;
                    reconstruction += (random() - 0.5) * errorScale;
                }
                
                reconstructed[y][x] = Math.min(1, Math.max(-1, reconstruction));
            }
        }
        
        return reconstructed;
    }
    
    function calculateDelta(x0, xHat0) {
        // Calculate MSE (Mean Squared Error)
        let sumSquaredError = 0;
        const width = CONFIG.SPECTROGRAM_WIDTH;
        const height = CONFIG.SPECTROGRAM_HEIGHT;
        const total = width * height;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const error = x0[y][x] - xHat0[y][x];
                sumSquaredError += error * error;
            }
        }
        
        return sumSquaredError / total;
    }
    
    function drawSpectrogram(ctx, spectrogram, width, height) {
        ctx.clearRect(0, 0, width, height);
        
        const cellWidth = width / CONFIG.SPECTROGRAM_WIDTH;
        const cellHeight = height / CONFIG.SPECTROGRAM_HEIGHT;
        
        for (let y = 0; y < CONFIG.SPECTROGRAM_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.SPECTROGRAM_WIDTH; x++) {
                const value = spectrogram[y][x];
                
                // Normalize to 0-1 range for visualization
                const normalized = (value + 1) / 2; // -1 to 1 -> 0 to 1
                
                // Color mapping: blue-green gradient (like spectrograms)
                const hue = 200 - normalized * 100; // 200 (blue) to 100 (green)
                const saturation = 70 + normalized * 30;
                const lightness = 20 + normalized * 60;
                
                ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
            }
        }
    }
    
    function updateVisualization() {
        // Update x0 (clean spectrogram)
        if (contexts.x0 && state.spectrogramX0) {
            const width = parseFloat(canvases.x0.dataset.displayWidth) || CONFIG.SPECTROGRAM_WIDTH;
            const height = parseFloat(canvases.x0.dataset.displayHeight) || CONFIG.SPECTROGRAM_HEIGHT;
            drawSpectrogram(contexts.x0, state.spectrogramX0, width, height);
        }
        
        // Update xt (noisy spectrogram)
        state.spectrogramXt = applyForwardDiffusion(state.spectrogramX0, state.currentT);
        if (contexts.xt && state.spectrogramXt) {
            const width = parseFloat(canvases.xt.dataset.displayWidth) || CONFIG.SPECTROGRAM_WIDTH;
            const height = parseFloat(canvases.xt.dataset.displayHeight) || CONFIG.SPECTROGRAM_HEIGHT;
            drawSpectrogram(contexts.xt, state.spectrogramXt, width, height);
        }
        
        // Update xHat0 (reconstructed spectrogram)
        state.spectrogramXHat0 = applyReverseDenoise(state.spectrogramXt, state.currentT, state.isMember);
        if (contexts.xHat0 && state.spectrogramXHat0) {
            const width = parseFloat(canvases.xHat0.dataset.displayWidth) || CONFIG.SPECTROGRAM_WIDTH;
            const height = parseFloat(canvases.xHat0.dataset.displayHeight) || CONFIG.SPECTROGRAM_HEIGHT;
            drawSpectrogram(contexts.xHat0, state.spectrogramXHat0, width, height);
        }
        
        // Calculate delta
        state.delta = calculateDelta(state.spectrogramX0, state.spectrogramXHat0);
        
        // Update UI
        updateUI();
    }
    
    function updateUI() {
        // Update timestep display
        const timestepValue = document.getElementById('mia-timestep-value');
        if (timestepValue) {
            timestepValue.textContent = state.currentT;
        }
        
        // Update delta display
        const deltaValue = document.getElementById('mia-delta-value');
        if (deltaValue) {
            deltaValue.textContent = state.delta.toFixed(3);
            
            // Update class for color
            deltaValue.className = 'distance-value';
            if (state.delta < CONFIG.TAU) {
                deltaValue.classList.add('member');
            } else {
                deltaValue.classList.add('non-member');
            }
        }
        
        // Update delta bar
        const deltaBar = document.getElementById('mia-delta-bar');
        if (deltaBar) {
            const maxDelta = 0.8; // Maximum expected delta for visualization
            const percentage = Math.min(100, (state.delta / maxDelta) * 100);
            deltaBar.style.width = `${percentage}%`;
            
            // Update class
            deltaBar.className = 'distance-bar';
            if (state.delta < CONFIG.TAU) {
                deltaBar.classList.add('member');
            } else {
                deltaBar.classList.add('non-member');
            }
        }
        
        // Update threshold line position
        const thresholdLine = document.getElementById('mia-threshold-line');
        if (thresholdLine) {
            const maxDelta = 0.8;
            const thresholdPercentage = (CONFIG.TAU / maxDelta) * 100;
            thresholdLine.style.left = `${thresholdPercentage}%`;
        }
        
        // Update judgment label
        const judgmentLabel = document.getElementById('mia-judgment-label');
        if (judgmentLabel) {
            const isMemberCase = state.delta < CONFIG.TAU;
            judgmentLabel.className = 'judgment-label';
            if (isMemberCase) {
                judgmentLabel.classList.add('member');
                judgmentLabel.textContent = '✓ Likely Member';
                judgmentLabel.setAttribute('aria-label', 'Likely Member - Delta is below threshold');
            } else {
                judgmentLabel.classList.add('non-member');
                judgmentLabel.textContent = '✓ Likely Non-member';
                judgmentLabel.setAttribute('aria-label', 'Likely Non-member - Delta exceeds threshold');
            }
        }
        
        // Update case toggle label
        const caseLabel = document.getElementById('mia-case-label');
        if (caseLabel) {
            caseLabel.textContent = state.isMember ? 'Member-case' : 'Non-member-case';
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export for debugging
    window.MIADiffusionAnim = {
        getState: () => ({ ...state }),
        setT: (t) => {
            state.currentT = Math.max(0, Math.min(CONFIG.T_MAX, t));
            updateVisualization();
        },
        toggleCase: () => {
            state.isMember = !state.isMember;
            const toggle = document.getElementById('mia-case-toggle');
            if (toggle) toggle.checked = state.isMember;
            updateVisualization();
        }
    };
})();

