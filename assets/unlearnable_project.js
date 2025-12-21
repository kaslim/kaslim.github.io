/* Music Unlearnable Interactive Visualization */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        SPECTROGRAM_WIDTH: 256,
        SPECTROGRAM_HEIGHT: 128,
        EMBEDDING_CANVAS_SIZE: 300,
        SEED: 1337, // Fixed seed for reproducibility
        DELTA_MAX: 1.0, // Maximum expected delta for visualization
        RISK_BASE: 0.5 // Base risk value
    };
    
    // State
    let state = {
        perturbationStrength: 30, // 0-100
        isProtected: true,
        spectrogramClean: null,
        spectrogramProtected: null,
        embeddingE: { x: 0.5, y: 0.5 }, // Clean embedding (normalized 0-1)
        embeddingEPrime: { x: 0.5, y: 0.5 }, // Protected embedding
        delta: 0.0,
        risk: 0.5
    };
    
    // Canvas references
    let canvases = {
        clean: null,
        protected: null,
        embedding: null
    };
    
    let contexts = {};
    
    // Initialize
    function init() {
        const vizContainer = document.getElementById('unlearnable-viz');
        if (!vizContainer) {
            console.warn('Unlearnable visualization container not found');
            return;
        }
        
        // Get canvas elements
        canvases.clean = document.getElementById('spectrogram-clean');
        canvases.protected = document.getElementById('spectrogram-protected');
        canvases.embedding = document.getElementById('embedding-canvas');
        
        if (!canvases.clean || !canvases.protected || !canvases.embedding) {
            console.error('Canvas elements not found');
            return;
        }
        
        // Setup canvases
        setupCanvases();
        
        // Generate initial spectrograms
        state.spectrogramClean = generateSpectrogram(CONFIG.SEED);
        
        // Setup event listeners
        setupEventListeners();
        
        // Initial render
        updateVisualization();
        
        console.log('✓ Music Unlearnable visualization initialized');
    }
    
    function setupCanvases() {
        // Spectrogram canvases
        [canvases.clean, canvases.protected].forEach(canvas => {
            const rect = canvas.parentElement.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            
            canvas.width = CONFIG.SPECTROGRAM_WIDTH * dpr;
            canvas.height = CONFIG.SPECTROGRAM_HEIGHT * dpr;
            
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
            
            if (canvas === canvases.clean) {
                contexts.clean = ctx;
            } else {
                contexts.protected = ctx;
            }
        });
        
        // Embedding canvas
        const embeddingRect = canvases.embedding.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvases.embedding.width = CONFIG.EMBEDDING_CANVAS_SIZE * dpr;
        canvases.embedding.height = CONFIG.EMBEDDING_CANVAS_SIZE * dpr;
        
        const ctx = canvases.embedding.getContext('2d');
        ctx.scale(dpr, dpr);
        contexts.embedding = ctx;
    }
    
    function setupEventListeners() {
        // Perturbation slider
        const slider = document.getElementById('perturbation-slider');
        if (slider) {
            slider.addEventListener('input', (e) => {
                state.perturbationStrength = parseInt(e.target.value);
                updateVisualization();
            });
        }
        
        // View toggle
        const toggle = document.getElementById('view-toggle');
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                state.isProtected = e.target.checked;
                updateVisualization();
            });
        }
        
        // Window resize
        window.addEventListener('resize', () => {
            setupCanvases();
            updateVisualization();
        });
    }
    
    function generateSpectrogram(seed) {
        const width = CONFIG.SPECTROGRAM_WIDTH;
        const height = CONFIG.SPECTROGRAM_HEIGHT;
        const data = new Array(height).fill(0).map(() => new Array(width).fill(0));
        
        // Simple RNG with seed
        let rng = seed;
        function random() {
            rng = (rng * 9301 + 49297) % 233280;
            return rng / 233280;
        }
        
        // Add horizontal energy bands (harmonics)
        for (let band = 0; band < 5; band++) {
            const freq = Math.floor(height * (0.15 + band * 0.18));
            const amplitude = 0.5 + random() * 0.4;
            
            for (let x = 0; x < width; x++) {
                const variation = 0.7 + random() * 0.3;
                data[freq][x] = amplitude * variation;
            }
        }
        
        // Add vertical structure (temporal patterns)
        for (let x = 0; x < width; x += 25) {
            const intensity = 0.2 + random() * 0.3;
            for (let y = 0; y < height; y++) {
                data[y][x] = Math.max(data[y][x], intensity * (0.8 + random() * 0.2));
            }
        }
        
        // Add noise texture
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                data[y][x] += random() * 0.15;
                data[y][x] = Math.min(1, Math.max(0, data[y][x]));
            }
        }
        
        return data;
    }
    
    function applyPerturbation(spectrogram, strength) {
        const width = CONFIG.SPECTROGRAM_WIDTH;
        const height = CONFIG.SPECTROGRAM_HEIGHT;
        const perturbed = spectrogram.map(row => [...row]);
        
        // Strength is 0-100, convert to perturbation scale
        const scale = strength / 100 * 0.15; // Max 15% perturbation
        
        // Seed for perturbation noise
        let rng = (CONFIG.SEED + strength * 1000) % 233280;
        function random() {
            rng = (rng * 9301 + 49297) % 233280;
            return rng / 233280;
        }
        
        // Add patterned perturbation (not pure noise, to simulate adversarial pattern)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Pattern: slight frequency shift + amplitude modulation
                const freqShift = Math.sin(x * 0.1) * scale * 0.3;
                const ampMod = (random() - 0.5) * scale;
                perturbed[y][x] = Math.min(1, Math.max(0, 
                    spectrogram[y][x] + freqShift + ampMod
                ));
            }
        }
        
        return perturbed;
    }
    
    function drawSpectrogram(ctx, spectrogram, width, height) {
        ctx.clearRect(0, 0, width, height);
        
        const cellWidth = width / CONFIG.SPECTROGRAM_WIDTH;
        const cellHeight = height / CONFIG.SPECTROGRAM_HEIGHT;
        
        for (let y = 0; y < CONFIG.SPECTROGRAM_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.SPECTROGRAM_WIDTH; x++) {
                const value = spectrogram[y][x];
                
                // Color mapping: purple gradient (matching theme)
                const hue = 270 - value * 60; // 270 (purple) to 210 (blue-purple)
                const saturation = 60 + value * 40;
                const lightness = 20 + value * 50;
                
                ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
            }
        }
    }
    
    function updateEmbeddingPosition() {
        // Calculate embedding shift based on perturbation strength
        const strength = state.perturbationStrength / 100;
        
        // Direction vector (fixed direction for consistency)
        const angle = Math.PI / 4; // 45 degrees
        const distance = strength * 0.4; // Max distance 0.4 in normalized space
        
        // Calculate new position
        state.embeddingEPrime.x = state.embeddingE.x + Math.cos(angle) * distance;
        state.embeddingEPrime.y = state.embeddingE.y + Math.sin(angle) * distance;
        
        // Add small random jitter for natural movement
        const jitter = (Math.random() - 0.5) * 0.02;
        state.embeddingEPrime.x += jitter;
        state.embeddingEPrime.y += jitter;
        
        // Clamp to bounds
        state.embeddingEPrime.x = Math.max(0.1, Math.min(0.9, state.embeddingEPrime.x));
        state.embeddingEPrime.y = Math.max(0.1, Math.min(0.9, state.embeddingEPrime.y));
        
        // Calculate delta
        const dx = state.embeddingEPrime.x - state.embeddingE.x;
        const dy = state.embeddingEPrime.y - state.embeddingE.y;
        state.delta = Math.sqrt(dx * dx + dy * dy);
        
        // Update risk (inverse relationship: higher delta = lower risk)
        state.risk = Math.max(0, Math.min(1, CONFIG.RISK_BASE - state.delta * 0.8));
    }
    
    function drawEmbeddingSpace(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
        
        // Background grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const pos = (width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(pos, 0);
            ctx.lineTo(pos, height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, pos);
            ctx.lineTo(width, pos);
            ctx.stroke();
        }
        
        // Draw connection line
        const x1 = state.embeddingE.x * width;
        const y1 = state.embeddingE.y * height;
        const x2 = state.embeddingEPrime.x * width;
        const y2 = state.embeddingEPrime.y * height;
        
        ctx.strokeStyle = 'rgba(155, 89, 182, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw e (clean) point
        ctx.fillStyle = '#9B59B6';
        ctx.beginPath();
        ctx.arc(x1, y1, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Label for e
        ctx.fillStyle = '#9B59B6';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('e', x1 + 12, y1 - 8);
        
        // Draw e' (protected) point
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(x2, y2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Label for e'
        ctx.fillStyle = '#E74C3C';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'left';
        ctx.fillText("e'", x2 + 12, y2 - 8);
        
        // Animate e' movement smoothly
        requestAnimationFrame(() => {
            if (contexts.embedding) {
                drawEmbeddingSpace(contexts.embedding, width, height);
            }
        });
    }
    
    function updateVisualization() {
        // Update protected spectrogram
        state.spectrogramProtected = applyPerturbation(
            state.spectrogramClean, 
            state.perturbationStrength
        );
        
        // Draw spectrograms
        const cleanWidth = canvases.clean.width / (window.devicePixelRatio || 1);
        const cleanHeight = canvases.clean.height / (window.devicePixelRatio || 1);
        const protectedWidth = canvases.protected.width / (window.devicePixelRatio || 1);
        const protectedHeight = canvases.protected.height / (window.devicePixelRatio || 1);
        
        if (contexts.clean && state.spectrogramClean) {
            drawSpectrogram(contexts.clean, state.spectrogramClean, cleanWidth, cleanHeight);
        }
        
        if (contexts.protected && state.spectrogramProtected) {
            drawSpectrogram(contexts.protected, state.spectrogramProtected, protectedWidth, protectedHeight);
        }
        
        // Update embedding position
        updateEmbeddingPosition();
        
        // Draw embedding space
        const embeddingWidth = canvases.embedding.width / (window.devicePixelRatio || 1);
        const embeddingHeight = canvases.embedding.height / (window.devicePixelRatio || 1);
        if (contexts.embedding) {
            drawEmbeddingSpace(contexts.embedding, embeddingWidth, embeddingHeight);
        }
        
        // Update UI
        updateUI();
    }
    
    function updateUI() {
        // Update perturbation value display
        const perturbationValue = document.getElementById('perturbation-value');
        if (perturbationValue) {
            perturbationValue.textContent = state.perturbationStrength;
        }
        
        // Update budget bar
        const budgetBar = document.getElementById('budget-bar');
        const budgetLabel = document.getElementById('budget-label');
        if (budgetBar && budgetLabel) {
            const budget = state.perturbationStrength / 100;
            budgetBar.style.width = `${budget * 100}%`;
            
            if (budget < 0.3) {
                budgetLabel.textContent = 'Low';
                budgetBar.style.background = 'linear-gradient(90deg, #2ECC71, #27AE60)';
            } else if (budget < 0.6) {
                budgetLabel.textContent = 'Medium';
                budgetBar.style.background = 'linear-gradient(90deg, #F39C12, #E67E22)';
            } else {
                budgetLabel.textContent = 'High';
                budgetBar.style.background = 'linear-gradient(90deg, #E74C3C, #C0392B)';
            }
        }
        
        // Update view label
        const viewLabel = document.getElementById('view-label');
        if (viewLabel) {
            viewLabel.textContent = state.isProtected ? 'Protected' : 'Clean';
        }
        
        // Update delta display
        const deltaValue = document.getElementById('delta-value');
        if (deltaValue) {
            deltaValue.textContent = state.delta.toFixed(3);
        }
        
        // Update condition and output based on view mode
        const conditionValue = document.getElementById('condition-value');
        const outputValue = document.getElementById('output-value');
        const mismatchHint = document.getElementById('mismatch-hint');
        
        if (conditionValue && outputValue && mismatchHint) {
            if (state.isProtected) {
                conditionValue.textContent = "e' (protected)";
                conditionValue.style.color = '#E74C3C';
                outputValue.textContent = "(x', e') association ✗";
                outputValue.style.color = '#E74C3C';
                mismatchHint.classList.add('active');
            } else {
                conditionValue.textContent = 'e (clean)';
                conditionValue.style.color = '#9B59B6';
                outputValue.textContent = '(x, e) association';
                outputValue.style.color = '#9B59B6';
                mismatchHint.classList.remove('active');
            }
        }
        
        // Update risk meter
        const riskMeterFill = document.getElementById('risk-meter-fill');
        const riskValue = document.getElementById('risk-value');
        
        if (riskMeterFill && riskValue) {
            const riskPercentage = state.risk * 100;
            riskMeterFill.style.width = `${riskPercentage}%`;
            
            if (riskPercentage < 30) {
                riskValue.textContent = 'Low Risk';
                riskValue.style.color = '#2ECC71';
                riskMeterFill.style.background = 'linear-gradient(90deg, #2ECC71, #27AE60)';
            } else if (riskPercentage < 60) {
                riskValue.textContent = 'Medium Risk';
                riskValue.style.color = '#F39C12';
                riskMeterFill.style.background = 'linear-gradient(90deg, #F39C12, #E67E22)';
            } else {
                riskValue.textContent = 'High Risk';
                riskValue.style.color = '#E74C3C';
                riskMeterFill.style.background = 'linear-gradient(90deg, #E74C3C, #C0392B)';
            }
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Concept Animation
    function initConceptAnimation() {
        const canvas = document.getElementById('unlearnable-concept-canvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = 400 * dpr;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        let animationState = {
            isPlaying: false,
            frame: 0,
            totalFrames: 300, // 5 seconds at 60fps
            animationId: null
        };
        
        const playBtn = document.getElementById('play-concept-anim');
        const resetBtn = document.getElementById('reset-concept-anim');
        const statusEl = document.getElementById('animation-status');
        
        function drawFrame(ctx, width, height, frame) {
            ctx.clearRect(0, 0, width, height);
            
            const progress = frame / animationState.totalFrames;
            
            // Draw timeline
            const timelineY = height - 50;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(50, timelineY);
            ctx.lineTo(width - 50, timelineY);
            ctx.stroke();
            
            // Timeline markers
            const stages = [
                { label: 'Music x', x: 0.15, icon: '🎵' },
                { label: 'Add δ', x: 0.35, icon: '🛡️' },
                { label: 'Training', x: 0.6, icon: '🤖' },
                { label: 'Result', x: 0.85, icon: '🎨' }
            ];
            
            stages.forEach((stage, i) => {
                const x = 50 + (width - 100) * stage.x;
                const isActive = progress >= stage.x;
                
                // Draw marker
                ctx.fillStyle = isActive ? '#9B59B6' : 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(x, timelineY, isActive ? 8 : 5, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw label
                ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
                ctx.font = 'bold 14px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(stage.icon, x, timelineY - 25);
                ctx.font = '12px Inter';
                ctx.fillText(stage.label, x, timelineY + 25);
            });
            
            // Draw progress indicator
            if (progress > 0) {
                const progressX = 50 + (width - 100) * progress;
                ctx.strokeStyle = '#9B59B6';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(50, timelineY);
                ctx.lineTo(progressX, timelineY);
                ctx.stroke();
                
                // Progress circle
                ctx.fillStyle = '#9B59B6';
                ctx.beginPath();
                ctx.arc(progressX, timelineY, 10, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Draw main visualization
            const centerY = height / 2 - 50;
            const centerX = width / 2;
            
            // Music sample visualization
            if (progress >= 0.1) {
                const musicX = 50 + (width - 100) * 0.15;
                drawMusicWaveform(ctx, musicX, centerY, 80, 60, progress < 0.35);
            }
            
            // Perturbation visualization
            if (progress >= 0.35) {
                const pertX = 50 + (width - 100) * 0.35;
                const pertProgress = (progress - 0.35) / 0.25;
                drawPerturbation(ctx, pertX, centerY, 40, pertProgress);
            }
            
            // Protected sample
            if (progress >= 0.4) {
                const protX = 50 + (width - 100) * 0.5;
                drawMusicWaveform(ctx, protX, centerY, 80, 60, false, true);
            }
            
            // Model training visualization
            if (progress >= 0.6) {
                const modelX = 50 + (width - 100) * 0.6;
                const trainProgress = (progress - 0.6) / 0.25;
                drawModelTraining(ctx, modelX, centerY, trainProgress);
            }
            
            // Result visualization
            if (progress >= 0.85) {
                const resultX = 50 + (width - 100) * 0.85;
                drawResult(ctx, resultX, centerY, 80, 60);
            }
            
            // Draw connecting arrows
            if (progress > 0.15) {
                drawArrow(ctx, 50 + (width - 100) * 0.15 + 40, centerY, 
                         50 + (width - 100) * 0.35 - 20, centerY, progress >= 0.35);
            }
            if (progress > 0.35) {
                drawArrow(ctx, 50 + (width - 100) * 0.5 + 40, centerY,
                         50 + (width - 100) * 0.6 - 30, centerY, progress >= 0.6);
            }
            if (progress > 0.6) {
                drawArrow(ctx, 50 + (width - 100) * 0.6 + 30, centerY,
                         50 + (width - 100) * 0.85 - 40, centerY, progress >= 0.85);
            }
        }
        
        function drawMusicWaveform(ctx, x, y, width, height, isClean, isProtected) {
            ctx.save();
            ctx.translate(x, y);
            
            // Draw waveform bars
            const numBars = 20;
            const barWidth = width / numBars;
            const maxHeight = height / 2;
            
            ctx.fillStyle = isProtected ? '#9B59B6' : '#ffffff';
            for (let i = 0; i < numBars; i++) {
                const barHeight = (Math.sin(i * 0.5) * 0.5 + 0.5) * maxHeight;
                const xPos = (i - numBars / 2) * barWidth;
                ctx.fillRect(xPos, -barHeight / 2, barWidth * 0.8, barHeight);
            }
            
            // Draw label
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(isProtected ? "x'" : 'x', 0, maxHeight + 20);
            
            ctx.restore();
        }
        
        function drawPerturbation(ctx, x, y, size, progress) {
            ctx.save();
            ctx.translate(x, y);
            
            // Draw δ symbol
            ctx.strokeStyle = '#E74C3C';
            ctx.lineWidth = 3;
            ctx.font = 'bold 24px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeText('δ', 0, 0);
            
            // Animated effect
            if (progress < 1) {
                const alpha = 1 - progress;
                ctx.fillStyle = `rgba(231, 76, 60, ${alpha * 0.3})`;
                ctx.beginPath();
                ctx.arc(0, 0, size * (1 + progress), 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
        
        function drawModelTraining(ctx, x, y, progress) {
            ctx.save();
            ctx.translate(x, y);
            
            // Draw model icon (simplified neural network)
            const radius = 25;
            ctx.strokeStyle = '#9B59B6';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw training progress
            ctx.strokeStyle = '#9B59B6';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
            ctx.stroke();
            
            // Draw label
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Training...', 0, radius + 20);
            
            ctx.restore();
        }
        
        function drawResult(ctx, x, y, width, height) {
            ctx.save();
            ctx.translate(x, y);
            
            // Draw cross mark (cannot imitate)
            ctx.strokeStyle = '#2ECC71';
            ctx.lineWidth = 4;
            const size = 30;
            ctx.beginPath();
            ctx.moveTo(-size, -size);
            ctx.lineTo(size, size);
            ctx.moveTo(size, -size);
            ctx.lineTo(-size, size);
            ctx.stroke();
            
            // Draw label
            ctx.fillStyle = '#2ECC71';
            ctx.font = 'bold 12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Protected', 0, size + 20);
            
            ctx.restore();
        }
        
        function drawArrow(ctx, x1, y1, x2, y2, isActive) {
            ctx.save();
            ctx.strokeStyle = isActive ? '#9B59B6' : 'rgba(155, 89, 182, 0.3)';
            ctx.lineWidth = isActive ? 3 : 2;
            ctx.setLineDash(isActive ? [] : [5, 5]);
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            
            // Arrowhead
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const arrowSize = 10;
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2 - arrowSize * Math.cos(angle - Math.PI / 6), 
                      y2 - arrowSize * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(x2 - arrowSize * Math.cos(angle + Math.PI / 6),
                      y2 - arrowSize * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
        
        function animate() {
            if (!animationState.isPlaying) return;
            
            const width = canvas.width / dpr;
            const height = 400;
            
            drawFrame(ctx, width, height, animationState.frame);
            
            animationState.frame++;
            
            if (animationState.frame >= animationState.totalFrames) {
                animationState.isPlaying = false;
                playBtn.textContent = '▶ Play Animation';
                if (statusEl) statusEl.textContent = 'Animation complete! Click "Play Animation" to replay.';
            } else {
                animationState.animationId = requestAnimationFrame(animate);
            }
        }
        
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                if (!animationState.isPlaying) {
                    animationState.isPlaying = true;
                    animationState.frame = 0;
                    playBtn.textContent = '⏸ Pause';
                    if (statusEl) statusEl.textContent = 'Animation playing...';
                    animate();
                } else {
                    animationState.isPlaying = false;
                    playBtn.textContent = '▶ Play Animation';
                    if (statusEl) statusEl.textContent = 'Animation paused.';
                    if (animationState.animationId) {
                        cancelAnimationFrame(animationState.animationId);
                    }
                }
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                animationState.isPlaying = false;
                animationState.frame = 0;
                if (playBtn) playBtn.textContent = '▶ Play Animation';
                if (statusEl) statusEl.textContent = 'Click "Play Animation" to see how unlearnable protection works';
                if (animationState.animationId) {
                    cancelAnimationFrame(animationState.animationId);
                }
                const width = canvas.width / dpr;
                const height = 400;
                drawFrame(ctx, width, height, 0);
            });
        }
        
        // Initial draw
        const width = canvas.width / dpr;
        const height = 400;
        drawFrame(ctx, width, height, 0);
        
        // Handle resize
        window.addEventListener('resize', () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = 400 * dpr;
            ctx.scale(dpr, dpr);
            drawFrame(ctx, rect.width, 400, animationState.frame);
        });
    }
    
    window.MusicUnlearnableViz = {
        getState: () => ({ ...state }),
        setPerturbation: (strength) => {
            state.perturbationStrength = Math.max(0, Math.min(100, strength));
            const slider = document.getElementById('perturbation-slider');
            if (slider) slider.value = state.perturbationStrength;
            updateVisualization();
        },
        toggleView: () => {
            state.isProtected = !state.isProtected;
            const toggle = document.getElementById('view-toggle');
            if (toggle) toggle.checked = state.isProtected;
            updateVisualization();
        }
    };
})();

