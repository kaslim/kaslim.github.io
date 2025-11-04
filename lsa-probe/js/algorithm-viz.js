/* Algorithm Visualization for Two-Loop Procedure */

let canvas, ctx;
let animationFrame = 0;
let isPlaying = false;
let sampleType = 'member';

function initializeAlgorithmViz() {
    console.log('Initializing algorithm visualization...');
    
    canvas = document.getElementById('algorithm-canvas');
    ctx = canvas.getContext('2d');
    
    // Setup controls
    document.getElementById('play-algorithm').addEventListener('click', playAnimation);
    document.getElementById('reset-algorithm').addEventListener('click', resetAnimation);
    document.getElementById('sample-type').addEventListener('change', (e) => {
        sampleType = e.target.value;
        resetAnimation();
    });
    
    // Initial draw
    drawAlgorithm(0);
    
    console.log('✓ Algorithm visualization initialized');
}

function playAnimation() {
    if (isPlaying) return;
    
    isPlaying = true;
    animationFrame = 0;
    
    document.getElementById('play-algorithm').textContent = '⏸ Pause';
    document.getElementById('play-algorithm').disabled = true;
    
    animate();
}

function resetAnimation() {
    isPlaying = false;
    animationFrame = 0;
    document.getElementById('play-algorithm').textContent = '▶ Play';
    document.getElementById('play-algorithm').disabled = false;
    drawAlgorithm(0);
    updateStatus('Ready to start. Click Play to run algorithm.');
}

function animate() {
    if (!isPlaying) return;
    
    animationFrame++;
    drawAlgorithm(animationFrame);
    
    // Animation phases: binary search (0-60), PGD iterations (60-150), completion (150-180)
    if (animationFrame < 180) {
        setTimeout(() => requestAnimationFrame(animate), 50);
    } else {
        isPlaying = false;
        document.getElementById('play-algorithm').textContent = '▶ Replay';
        document.getElementById('play-algorithm').disabled = false;
        updateStatus('Algorithm complete. Final adversarial cost computed.');
    }
}

function drawAlgorithm(frame) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const w = canvas.width;
    const h = canvas.height;
    
    // Background
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, w, h);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Two-Loop Adversarial Probe', w/2, 30);
    
    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(w - 50, 50);
    ctx.stroke();
    
    // Binary search visualization (outer loop)
    drawBinarySearch(frame, 100, 100, sampleType);
    
    // PGD optimization visualization (inner loop)
    drawPGDOptimization(frame, 100, 280, sampleType);
    
    // Final cost display
    drawFinalCost(frame, 350, 450, sampleType);
}

function drawBinarySearch(frame, x, y, type) {
    ctx.font = '14px Inter';
    ctx.fillStyle = '#0173B2';
    ctx.textAlign = 'left';
    ctx.fillText('Outer Loop: Binary Search for Budget η', x, y);
    
    // Binary search tree visualization
    const maxEta = 0.8;
    const minEta = 0.0;
    const searchPhase = Math.min(frame / 60, 1); // 0 to 1
    
    // Current bounds
    const currentMin = minEta;
    const currentMax = maxEta - searchPhase * (maxEta - (type === 'member' ? 0.6 : 0.3));
    const currentEta = (currentMin + currentMax) / 2;
    
    // Draw range bar
    const barY = y + 30;
    const barWidth = 400;
    const barHeight = 20;
    
    // Background bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x, barY, barWidth, barHeight);
    
    // Current range
    ctx.fillStyle = 'rgba(1, 115, 178, 0.3)';
    const rangeStart = (currentMin / maxEta) * barWidth;
    const rangeWidth = ((currentMax - currentMin) / maxEta) * barWidth;
    ctx.fillRect(x + rangeStart, barY, rangeWidth, barHeight);
    
    // Current eta marker
    ctx.fillStyle = '#0173B2';
    const markerX = x + (currentEta / maxEta) * barWidth;
    ctx.beginPath();
    ctx.arc(markerX, barY + barHeight/2, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Labels
    ctx.font = '12px Fira Code';
    ctx.fillStyle = '#a0a0a0';
    ctx.textAlign = 'left';
    ctx.fillText(`η_min: ${currentMin.toFixed(2)}`, x, barY + barHeight + 20);
    ctx.fillText(`η_max: ${currentMax.toFixed(2)}`, x + barWidth - 80, barY + barHeight + 20);
    ctx.fillStyle = '#0173B2';
    ctx.textAlign = 'center';
    ctx.fillText(`η: ${currentEta.toFixed(2)}`, markerX, barY - 10);
    
    // Iteration counter
    const iteration = Math.floor(searchPhase * 5) + 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Inter';
    ctx.textAlign = 'left';
    if (frame > 0) {
        ctx.fillText(`Iteration: ${iteration}/5`, x, barY + barHeight + 40);
    }
    
    // Status message
    updateStatus(`Binary search: Testing η = ${currentEta.toFixed(3)}...`);
}

function drawPGDOptimization(frame, x, y, type) {
    ctx.font = '14px Inter';
    ctx.fillStyle = '#029E73';
    ctx.textAlign = 'left';
    ctx.fillText('Inner Loop: PGD Optimization', x, y);
    
    const pgdPhase = Math.max(0, Math.min((frame - 60) / 90, 1)); // Starts after frame 60
    
    if (pgdPhase === 0 && frame < 60) {
        ctx.fillStyle = '#666';
        ctx.font = '12px Inter';
        ctx.fillText('Waiting for outer loop...', x, y + 30);
        return;
    }
    
    // Draw perturbation space
    const centerX = x + 200;
    const centerY = y + 60;
    const radius = 60;
    
    // Budget constraint circle
    ctx.strokeStyle = 'rgba(2, 158, 115, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Current perturbation (spiraling towards optimal)
    const angle = pgdPhase * Math.PI * 4;
    const dist = radius * (0.3 + 0.6 * pgdPhase);
    const pertX = centerX + Math.cos(angle) * dist;
    const pertY = centerY + Math.sin(angle) * dist;
    
    // Gradient direction arrows
    if (pgdPhase > 0.1) {
        drawArrow(pertX, pertY, pertX + 15, pertY - 10, '#029E73', 2);
    }
    
    // Current perturbation point
    ctx.fillStyle = '#DE8F05';
    ctx.beginPath();
    ctx.arc(pertX, pertY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Labels
    ctx.fillStyle = '#a0a0a0';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Perturbation δ', centerX, centerY - radius - 10);
    ctx.fillText('||δ|| ≤ η', centerX, centerY + radius + 20);
    
    // PGD step counter
    const pgdStep = Math.floor(pgdPhase * 10) + 1;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    if (pgdPhase > 0) {
        ctx.fillText(`PGD Step: ${pgdStep}/10`, x, y + 140);
        
        // Degradation progress
        const degradation = type === 'member' ? pgdPhase * 0.3 : pgdPhase * 0.7;
        ctx.fillText(`Degradation D: ${degradation.toFixed(3)}`, x, y + 160);
    }
}

function drawFinalCost(frame, x, y, type) {
    if (frame < 150) return;
    
    const finalPhase = Math.min((frame - 150) / 30, 1);
    
    // Final cost value
    const finalCost = type === 'member' ? 0.58 : 0.29;
    const displayCost = finalCost * finalPhase;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Adversarial Cost', x, y);
    
    // Cost display box
    ctx.strokeStyle = finalPhase > 0.5 ? (type === 'member' ? '#0173B2' : '#DE8F05') : '#666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 60, y + 10, 120, 50);
    
    ctx.fillStyle = type === 'member' ? '#0173B2' : '#DE8F05';
    ctx.font = 'bold 24px Fira Code';
    ctx.fillText(displayCost.toFixed(3), x, y + 43);
    
    // Interpretation
    ctx.font = '12px Inter';
    ctx.fillStyle = '#a0a0a0';
    const interpretation = type === 'member' 
        ? 'High cost → Stable → Member' 
        : 'Low cost → Unstable → Non-member';
    ctx.fillText(interpretation, x, y + 75);
    
    if (finalPhase >= 1) {
        updateStatus(`Complete: ${interpretation} (C_adv = ${finalCost.toFixed(3)})`);
    }
}

function drawArrow(x1, y1, x2, y2, color, width) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    
    // Line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowSize = 8;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - arrowSize * Math.cos(angle - Math.PI/6),
        y2 - arrowSize * Math.sin(angle - Math.PI/6)
    );
    ctx.lineTo(
        x2 - arrowSize * Math.cos(angle + Math.PI/6),
        y2 - arrowSize * Math.sin(angle + Math.PI/6)
    );
    ctx.closePath();
    ctx.fill();
}

function updateStatus(message) {
    const statusDiv = document.getElementById('algorithm-status');
    if (statusDiv) {
        statusDiv.textContent = message;
    }
}

// Export
window.initializeAlgorithmViz = initializeAlgorithmViz;

