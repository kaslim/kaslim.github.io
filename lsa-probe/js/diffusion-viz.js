/* Diffusion Process Visualization */

function initializeDiffusionViz() {
    console.log('Initializing diffusion visualization...');
    
    try {
        // Initialize three flow canvases
        const canvases = ['forward', 'reverse', 'attacked'];
        canvases.forEach(type => {
            const canvas = document.getElementById(`flow-canvas-${type}`);
            if (canvas) {
                drawFlowDiagram(canvas, type);
                animateFlowDiagram(canvas, type);
            } else {
                console.warn(`Canvas flow-canvas-${type} not found`);
            }
        });
        
        console.log('✓ Diffusion visualization initialized');
    } catch (error) {
        console.error('Error initializing diffusion visualization:', error);
    }
}

function drawFlowDiagram(canvas, type) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, width, height);
    
    // Draw based on type
    switch(type) {
        case 'forward':
            drawForwardProcess(ctx, width, height);
            break;
        case 'reverse':
            drawReverseProcess(ctx, width, height, false);
            break;
        case 'attacked':
            drawReverseProcess(ctx, width, height, true);
            break;
    }
}

function drawForwardProcess(ctx, width, height) {
    const centerY = height / 2;
    const leftX = 80;
    const rightX = width - 80;
    
    // Draw x0 (clean waveform)
    drawWaveform(ctx, leftX, centerY, 60, 40, 0);
    drawLabel(ctx, leftX, centerY + 60, 'x₀', '#029E73');
    drawLabel(ctx, leftX, centerY + 80, 'Clean', '#666', 12);
    
    // Draw arrow with noise
    drawFlowArrow(ctx, leftX + 70, centerY, rightX - 70, centerY, '#029E73');
    drawLabel(ctx, (leftX + rightX) / 2, centerY - 30, '+ ε ~ N(0,I)', '#029E73', 14);
    drawLabel(ctx, (leftX + rightX) / 2, centerY - 15, 'Forward Diffusion', '#666', 11);
    
    // Draw xt (noisy waveform)
    drawWaveform(ctx, rightX, centerY, 60, 40, 0.8);
    drawLabel(ctx, rightX, centerY + 60, 'xₜ', '#029E73');
    drawLabel(ctx, rightX, centerY + 80, 'Noisy', '#666', 12);
}

function drawReverseProcess(ctx, width, height, attacked) {
    const centerY = height / 2;
    const leftX = 80;
    const rightX = width - 80;
    
    // Draw xt (with or without perturbation)
    drawWaveform(ctx, leftX, centerY, 60, 40, 0.8);
    if (attacked) {
        // Draw perturbation indicator
        ctx.strokeStyle = '#DE8F05';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(leftX - 35, centerY - 25, 70, 50);
        ctx.setLineDash([]);
        drawLabel(ctx, leftX, centerY - 40, 'xₜ + δₜ', '#DE8F05');
    } else {
        drawLabel(ctx, leftX, centerY + 60, 'xₜ', '#0173B2');
    }
    
    // Draw arrow with Rₜ
    const arrowColor = attacked ? '#DE8F05' : '#0173B2';
    drawFlowArrow(ctx, leftX + 70, centerY, rightX - 70, centerY, arrowColor);
    drawLabel(ctx, (leftX + rightX) / 2, centerY - 30, 'Rₜ(·; θ)', arrowColor, 14);
    drawLabel(ctx, (leftX + rightX) / 2, centerY - 15, 'Reverse Denoising', '#666', 11);
    
    // Draw x0_hat (reconstructed)
    drawWaveform(ctx, rightX, centerY, 60, 40, attacked ? 0.2 : 0);
    if (attacked) {
        drawLabel(ctx, rightX, centerY + 60, 'x̂₀^δ', '#DE8F05');
        drawLabel(ctx, rightX, centerY + 80, 'Degraded', '#666', 12);
    } else {
        drawLabel(ctx, rightX, centerY + 60, 'x̂₀', '#0173B2');
        drawLabel(ctx, rightX, centerY + 80, 'Clean', '#666', 12);
    }
}

function drawWaveform(ctx, x, y, width, height, noiseLevel) {
    ctx.save();
    ctx.translate(x - width/2, y);
    
    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = noiseLevel > 0.5 ? '#666' : '#0173B2';
    ctx.lineWidth = 2;
    
    const points = 50;
    for (let i = 0; i < points; i++) {
        const xPos = (i / points) * width;
        let yPos = Math.sin((i / points) * Math.PI * 4) * height * 0.3;
        
        // Add noise
        if (noiseLevel > 0) {
            yPos += (Math.random() - 0.5) * height * noiseLevel;
        }
        
        if (i === 0) {
            ctx.moveTo(xPos, yPos);
        } else {
            ctx.lineTo(xPos, yPos);
        }
    }
    
    ctx.stroke();
    
    // Draw border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, -height/2, width, height);
    
    ctx.restore();
}

function drawFlowArrow(ctx, x1, y1, x2, y2, color) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw arrowhead
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowSize = 10;
    
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

function drawLabel(ctx, x, y, text, color, size = 14) {
    ctx.fillStyle = color;
    ctx.font = `${size}px 'Fira Code', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}

function animateFlowDiagram(canvas, type) {
    let frame = 0;
    
    function animate() {
        frame++;
        
        // Subtle pulsing animation
        if (frame % 60 < 30) {
            const ctx = canvas.getContext('2d');
            ctx.save();
            ctx.globalAlpha = 0.1;
            drawFlowDiagram(canvas, type);
            ctx.restore();
        }
        
        if (frame < 600) { // 10 seconds
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Draw stability comparison chart
function drawStabilityComparison() {
    try {
        const canvas = document.getElementById('stability-canvas');
        if (!canvas) {
            console.warn('Stability canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, width, height);
    
    // Margins
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    
    // Scales
    const maxEta = 0.8;
    const maxD = 1.0;
    const tau = 0.65; // Threshold
    
    const scaleX = (eta) => margin.left + (eta / maxEta) * plotWidth;
    const scaleY = (d) => margin.top + (1 - d / maxD) * plotHeight;
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    
    // X axis
    ctx.beginPath();
    ctx.moveTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();
    
    // Y axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.stroke();
    
    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i <= 4; i++) {
        const x = margin.left + (i / 4) * plotWidth;
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, height - margin.bottom);
        ctx.stroke();
        
        const y = margin.top + (i / 4) * plotHeight;
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(width - margin.right, y);
        ctx.stroke();
    }
    
    // Tau threshold line
    ctx.strokeStyle = '#029E73';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(margin.left, scaleY(tau));
    ctx.lineTo(width - margin.right, scaleY(tau));
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Tau label
    ctx.fillStyle = '#029E73';
    ctx.font = '12px Fira Code';
    ctx.textAlign = 'right';
    ctx.fillText('τ (threshold)', margin.left - 10, scaleY(tau) + 5);
    
    // Member curve (slower rise)
    const memberEtas = [];
    const memberDs = [];
    for (let eta = 0; eta <= maxEta; eta += 0.01) {
        memberEtas.push(eta);
        // Slower degradation for members
        memberDs.push(Math.min(1.0, 0.3 + 0.8 * Math.pow(eta / maxEta, 1.5)));
    }
    
    ctx.strokeStyle = '#0173B2';
    ctx.lineWidth = 3;
    ctx.beginPath();
    memberEtas.forEach((eta, i) => {
        const x = scaleX(eta);
        const y = scaleY(memberDs[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Non-member curve (faster rise)
    const nonmemberEtas = [];
    const nonmemberDs = [];
    for (let eta = 0; eta <= maxEta; eta += 0.01) {
        nonmemberEtas.push(eta);
        // Faster degradation for non-members
        nonmemberDs.push(Math.min(1.0, 0.3 + 1.2 * Math.pow(eta / maxEta, 0.8)));
    }
    
    ctx.strokeStyle = '#DE8F05';
    ctx.lineWidth = 3;
    ctx.beginPath();
    nonmemberEtas.forEach((eta, i) => {
        const x = scaleX(eta);
        const y = scaleY(nonmemberDs[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Find C_adv for member and non-member
    const memberIdx = memberDs.findIndex(d => d >= tau);
    const nonmemberIdx = nonmemberDs.findIndex(d => d >= tau);
    const memberCadv = memberIdx >= 0 ? memberEtas[memberIdx] : maxEta;
    const nonmemberCadv = nonmemberIdx >= 0 ? nonmemberEtas[nonmemberIdx] : maxEta;
    
    // Draw C_adv lines
    // Member
    ctx.strokeStyle = '#0173B2';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(scaleX(memberCadv), scaleY(tau));
    ctx.lineTo(scaleX(memberCadv), height - margin.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Non-member
    ctx.strokeStyle = '#DE8F05';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(scaleX(nonmemberCadv), scaleY(tau));
    ctx.lineTo(scaleX(nonmemberCadv), height - margin.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Labels
    ctx.fillStyle = '#a0a0a0';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    
    // X axis label
    ctx.fillText('Budget η', width / 2, height - 20);
    
    // Y axis label
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Degradation D(x̂₀, x̂₀^δ)', 0, 0);
    ctx.restore();
    
    // C_adv annotations
    ctx.fillStyle = '#0173B2';
    ctx.font = '11px Fira Code';
    ctx.textAlign = 'center';
    ctx.fillText(`C_adv = ${memberCadv.toFixed(2)}`, scaleX(memberCadv), height - margin.bottom + 20);
    
    ctx.fillStyle = '#DE8F05';
    ctx.fillText(`C_adv = ${nonmemberCadv.toFixed(2)}`, scaleX(nonmemberCadv), height - margin.bottom + 35);
    
    // Tick labels
    ctx.fillStyle = '#a0a0a0';
    ctx.font = '11px Inter';
    for (let i = 0; i <= 4; i++) {
        const eta = (i / 4) * maxEta;
        const x = scaleX(eta);
        ctx.textAlign = 'center';
        ctx.fillText(eta.toFixed(1), x, height - margin.bottom + 15);
        
        const d = (i / 4) * maxD;
        const y = scaleY(d);
        ctx.textAlign = 'right';
        ctx.fillText(d.toFixed(1), margin.left - 10, y + 4);
    }
    } catch (error) {
        console.error('Error drawing stability comparison:', error);
    }
}

// Export
window.initializeDiffusionViz = initializeDiffusionViz;
window.drawStabilityComparison = drawStabilityComparison;

