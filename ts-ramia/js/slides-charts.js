/* =====================================
   TS-RaMIA Slides Charts & Visualizations
   D3.js-based rendering for slides
   ===================================== */

// Cache to avoid re-rendering
const renderedVisuals = new Set();

// Main visual rendering dispatcher
function renderVisual(containerId, visualType) {
    // Avoid re-rendering
    if (renderedVisuals.has(containerId)) {
        return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Render based on type
    switch(visualType) {
        case 'copyright-icon':
            renderCopyrightIcon(container);
            break;
        case 'mia-diagram':
            renderMIADiagram(container);
            break;
        case 'confounding-collapse':
            renderConfoundingCollapse(container);
            break;
        case 'confounder-demo':
            renderConfounderDemo(container);
            break;
        case 'token-importance':
            renderTokenImportance(container);
            break;
        case 'pipeline-flow':
            renderPipelineFlow(container);
            break;
        case 'topk-distribution':
            renderTopKDistribution(container);
            break;
        case 'debiasing-views':
            renderDebiasingSVG(container);
            break;
        case 'roc-main':
            renderROCCurve(container);
            break;
        case 'ablation-bars':
            renderAblationBars(container);
            break;
        case 'transfer-results':
            renderTransferResults(container);
            break;
        case 'takeaway-checklist':
            renderTakeawayChecklist(container);
            break;
        case 'qa-icon':
            renderQAIcon(container);
            break;
        default:
            renderPlaceholder(container, visualType);
    }
    
    renderedVisuals.add(containerId);
}

// Placeholder for visuals not yet implemented
function renderPlaceholder(container, type) {
    const placeholder = document.createElement('div');
    placeholder.className = 'visual-placeholder';
    placeholder.textContent = `Visual: ${type}`;
    container.appendChild(placeholder);
}

// Copyright icon
function renderCopyrightIcon(container) {
    container.innerHTML = `
        <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#DE8F05" stroke-width="4"/>
            <text x="100" y="120" font-size="80" fill="#DE8F05" text-anchor="middle" font-family="Inter">©</text>
        </svg>
    `;
}

// MIA Diagram
function renderMIADiagram(container) {
    const svg = d3.select(container)
        .append('svg')
        .attr('width', 600)
        .attr('height', 250)
        .attr('viewBox', '0 0 600 250');
    
    // Sample box
    svg.append('rect')
        .attr('x', 50)
        .attr('y', 100)
        .attr('width', 120)
        .attr('height', 60)
        .attr('fill', '#E8E8E8')
        .attr('stroke', '#0173B2')
        .attr('stroke-width', 2)
        .attr('rx', 8);
    
    svg.append('text')
        .attr('x', 110)
        .attr('y', 135)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .attr('fill', '#212529')
        .text('Sample');
    
    // Arrow
    svg.append('line')
        .attr('x1', 180)
        .attr('y1', 130)
        .attr('x2', 250)
        .attr('y2', 130)
        .attr('stroke', '#6C757D')
        .attr('stroke-width', 3)
        .attr('marker-end', 'url(#arrowhead)');
    
    // Model box
    svg.append('rect')
        .attr('x', 260)
        .attr('y', 100)
        .attr('width', 120)
        .attr('height', 60)
        .attr('fill', '#0173B2')
        .attr('rx', 8);
    
    svg.append('text')
        .attr('x', 320)
        .attr('y', 135)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .attr('fill', 'white')
        .text('Model');
    
    // Arrow
    svg.append('line')
        .attr('x1', 390)
        .attr('y1', 130)
        .attr('x2', 460)
        .attr('y2', 130)
        .attr('stroke', '#6C757D')
        .attr('stroke-width', 3)
        .attr('marker-end', 'url(#arrowhead)');
    
    // Score box
    svg.append('rect')
        .attr('x', 470)
        .attr('y', 100)
        .attr('width', 100)
        .attr('height', 60)
        .attr('fill', '#029E73')
        .attr('rx', 8);
    
    svg.append('text')
        .attr('x', 520)
        .attr('y', 135)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .attr('fill', 'white')
        .text('Score');
    
    // Arrow marker definition
    svg.append('defs')
        .append('marker')
        .attr('id', 'arrowhead')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('refX', 9)
        .attr('refY', 3)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 10 3, 0 6')
        .attr('fill', '#6C757D');
}

// Confounding collapse visualization
function renderConfoundingCollapse(container) {
    const data = [
        { label: 'Raw AUC', value: 0.679, color: '#6C757D' },
        { label: 'After Length-Match', value: 0.563, color: '#DE8F05' }
    ];
    
    const width = 600;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 40, left: 120 };
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);
    
    const x = d3.scaleLinear()
        .domain([0, 1])
        .range([margin.left, width - margin.right]);
    
    const y = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([margin.top, height - margin.bottom])
        .padding(0.3);
    
    // Bars
    svg.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', margin.left)
        .attr('y', d => y(d.label))
        .attr('width', d => x(d.value) - margin.left)
        .attr('height', y.bandwidth())
        .attr('fill', d => d.color)
        .attr('rx', 4);
    
    // Labels
    svg.selectAll('.bar-label')
        .data(data)
        .join('text')
        .attr('class', 'bar-label')
        .attr('x', d => x(d.value) + 10)
        .attr('y', d => y(d.label) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('font-size', 18)
        .attr('font-weight', 700)
        .attr('fill', '#212529')
        .text(d => d.value.toFixed(3));
    
    // Y-axis labels
    svg.selectAll('.y-label')
        .data(data)
        .join('text')
        .attr('class', 'y-label')
        .attr('x', margin.left - 10)
        .attr('y', d => y(d.label) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('font-size', 14)
        .attr('fill', '#212529')
        .text(d => d.label);
}

// Confounder demo
function renderConfounderDemo(container) {
    container.innerHTML = `
        <div style="text-align: center;">
            <div style="display: inline-block; margin: 1rem 2rem;">
                <div style="font-size: 3rem; color: #0173B2;">📏</div>
                <div style="font-size: 1.2rem; margin-top: 0.5rem;">Structural Length</div>
            </div>
            <div style="display: inline-block; margin: 1rem 2rem;">
                <div style="font-size: 3rem; color: #DE8F05;">🎵</div>
                <div style="font-size: 1.2rem; margin-top: 0.5rem;">Event Density</div>
            </div>
        </div>
    `;
}

// Token importance
function renderTokenImportance(container) {
    container.innerHTML = `
        <div style="font-family: 'Courier New', monospace; font-size: 1.3rem; text-align: center; padding: 2rem;">
            <span style="background: #E8E8E8; padding: 0.3rem 0.6rem; border-radius: 4px; margin: 0 0.2rem;">X:1</span>
            <span style="background: #DE8F05; color: white; padding: 0.3rem 0.6rem; border-radius: 4px; margin: 0 0.2rem; font-weight: 600;">|</span>
            <span style="background: #E8E8E8; padding: 0.3rem 0.6rem; border-radius: 4px; margin: 0 0.2rem;">C</span>
            <span style="background: #E8E8E8; padding: 0.3rem 0.6rem; border-radius: 4px; margin: 0 0.2rem;">E</span>
            <span style="background: #E8E8E8; padding: 0.3rem 0.6rem; border-radius: 4px; margin: 0 0.2rem;">G</span>
            <span style="background: #DE8F05; color: white; padding: 0.3rem 0.6rem; border-radius: 4px; margin: 0 0.2rem; font-weight: 600;">|</span>
            <span style="background: #DE8F05; color: white; padding: 0.3rem 0.6rem; border-radius: 4px; margin: 0 0.2rem; font-weight: 600;">M:4/4</span>
            <span style="background: #DE8F05; color: white; padding: 0.3rem 0.6rem; border-radius: 4px; margin: 0 0.2rem; font-weight: 600;">K:C</span>
        </div>
        <div style="text-align: center; margin-top: 1rem; font-size: 1rem; color: #6C757D;">
            <span style="color: #DE8F05; font-weight: 600;">■</span> Structural tokens (high leakage)
            <span style="margin: 0 1rem;"></span>
            <span style="color: #999; font-weight: 600;">■</span> Note tokens
        </div>
    `;
}

// Pipeline flow
function renderPipelineFlow(container) {
    const stages = [
        { name: 'Mask', color: '#0173B2' },
        { name: 'Token NLL', color: '#029E73' },
        { name: 'Top-64', color: '#DE8F05' },
        { name: 'Debias', color: '#9B59B6' },
        { name: 'Fusion', color: '#D55E00' }
    ];
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', 900)
        .attr('height', 150)
        .attr('viewBox', '0 0 900 150');
    
    const stageWidth = 140;
    const stageHeight = 60;
    const gap = 30;
    
    stages.forEach((stage, i) => {
        const x = 50 + i * (stageWidth + gap);
        const y = 45;
        
        // Box
        svg.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', stageWidth)
            .attr('height', stageHeight)
            .attr('fill', stage.color)
            .attr('rx', 8);
        
        // Text
        svg.append('text')
            .attr('x', x + stageWidth / 2)
            .attr('y', y + stageHeight / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .attr('font-weight', 600)
            .attr('fill', 'white')
            .text(stage.name);
        
        // Arrow
        if (i < stages.length - 1) {
            const arrowX = x + stageWidth + 5;
            svg.append('line')
                .attr('x1', arrowX)
                .attr('y1', y + stageHeight / 2)
                .attr('x2', arrowX + gap - 10)
                .attr('y2', y + stageHeight / 2)
                .attr('stroke', '#6C757D')
                .attr('stroke-width', 3)
                .attr('marker-end', 'url(#arrow)');
        }
    });
    
    // Arrow marker
    svg.append('defs')
        .append('marker')
        .attr('id', 'arrow')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('refX', 9)
        .attr('refY', 3)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 10 3, 0 6')
        .attr('fill', '#6C757D');
}

// Top-k distribution
function renderTopKDistribution(container) {
    const data = Array.from({ length: 20 }, (_, i) => ({
        token: i + 1,
        nll: Math.random() * 3 + (i > 15 ? 5 : 1)
    }));
    
    const width = 700;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);
    
    const x = d3.scaleBand()
        .domain(data.map(d => d.token))
        .range([margin.left, width - margin.right])
        .padding(0.1);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.nll)])
        .nice()
        .range([height - margin.bottom, margin.top]);
    
    // Bars
    svg.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => x(d.token))
        .attr('y', d => y(d.nll))
        .attr('width', x.bandwidth())
        .attr('height', d => y(0) - y(d.nll))
        .attr('fill', d => d.token > 15 ? '#DE8F05' : '#E8E8E8')
        .attr('rx', 2);
    
    // X-axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickValues([1, 5, 10, 15, 20]))
        .attr('font-size', 12);
    
    // Y-axis
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5))
        .attr('font-size', 12);
    
    // Label
    svg.append('text')
        .attr('x', width - 100)
        .attr('y', 40)
        .attr('font-size', 14)
        .attr('fill', '#DE8F05')
        .attr('font-weight', 600)
        .text('Tail (Top-64)');
}

// Debiasing views
function renderDebiasingSVG(container) {
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; text-align: center;">
            <div>
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
                <div style="font-size: 1.3rem; font-weight: 600; margin-bottom: 0.5rem;">Length-Matched</div>
                <div style="font-size: 1rem; color: #6C757D;">Sample by structural count</div>
            </div>
            <div>
                <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                <div style="font-size: 1.3rem; font-weight: 600; margin-bottom: 0.5rem;">Calibrated</div>
                <div style="font-size: 1rem; color: #6C757D;">Isotonic regression per bin</div>
            </div>
        </div>
    `;
}

// ROC Curve (main results slide)
function renderROCCurve(container) {
    const width = 700;
    const height = 500;
    const margin = { top: 40, right: 150, bottom: 60, left: 60 };
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);
    
    const x = d3.scaleLinear()
        .domain([0, 1])
        .range([margin.left, width - margin.right]);
    
    const y = d3.scaleLinear()
        .domain([0, 1])
        .range([height - margin.bottom, margin.top]);
    
    const line = d3.line()
        .x(d => x(d.fpr))
        .y(d => y(d.tpr))
        .curve(d3.curveMonotoneX);
    
    // Grid
    svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(-(height - margin.top - margin.bottom)).tickFormat(''))
        .style('stroke-opacity', 0.1);
    
    svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickSize(-(width - margin.left - margin.right)).tickFormat(''))
        .style('stroke-opacity', 0.1);
    
    // Baseline diagonal
    svg.append('line')
        .attr('x1', x(0))
        .attr('y1', y(0))
        .attr('x2', x(1))
        .attr('y2', y(1))
        .attr('stroke', '#CCC')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
    
    // Draw curves
    const methods = [
        { key: 'baseline', color: '#6C757D', label: 'Baseline', auc: 0.563 },
        { key: 'structtail64', color: '#DE8F05', label: 'StructTail-64', auc: 0.692 },
        { key: 'fusion', color: '#029E73', label: 'StructTail+Fusion', auc: 0.826 }
    ];
    
    methods.forEach(method => {
        svg.append('path')
            .datum(rocData[method.key])
            .attr('fill', 'none')
            .attr('stroke', method.color)
            .attr('stroke-width', 3)
            .attr('d', line);
    });
    
    // Axes
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(10))
        .attr('font-size', 12);
    
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(10))
        .attr('font-size', 12);
    
    // Labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .text('False Positive Rate');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .text('True Positive Rate');
    
    // Legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 140}, ${margin.top})`);
    
    methods.forEach((method, i) => {
        const g = legend.append('g')
            .attr('transform', `translate(0, ${i * 25})`);
        
        g.append('line')
            .attr('x1', 0)
            .attr('x2', 30)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke', method.color)
            .attr('stroke-width', 3);
        
        g.append('text')
            .attr('x', 35)
            .attr('y', 0)
            .attr('dy', '0.35em')
            .attr('font-size', 11)
            .text(`${method.label} (${method.auc.toFixed(3)})`);
    });
}

// Ablation bars
function renderAblationBars(container) {
    const data = [
        { method: 'Note-only', auc: 0.42 },
        { method: 'Struct-only', auc: 0.68 },
        { method: 'Top-32', auc: 0.71 },
        { method: 'Top-64', auc: 0.79 },
        { method: 'Top-128', auc: 0.77 },
        { method: '+Fusion', auc: 0.83 }
    ];
    
    const width = 700;
    const height = 350;
    const margin = { top: 20, right: 20, bottom: 60, left: 120 };
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);
    
    const x = d3.scaleLinear()
        .domain([0, 1])
        .range([margin.left, width - margin.right]);
    
    const y = d3.scaleBand()
        .domain(data.map(d => d.method))
        .range([margin.top, height - margin.bottom])
        .padding(0.2);
    
    svg.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', margin.left)
        .attr('y', d => y(d.method))
        .attr('width', d => x(d.auc) - margin.left)
        .attr('height', y.bandwidth())
        .attr('fill', d => d.method === '+Fusion' ? '#029E73' : '#0173B2')
        .attr('rx', 4);
    
    svg.selectAll('.value-label')
        .data(data)
        .join('text')
        .attr('x', d => x(d.auc) + 10)
        .attr('y', d => y(d.method) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('font-size', 14)
        .attr('font-weight', 600)
        .text(d => d.auc.toFixed(2));
    
    svg.selectAll('.method-label')
        .data(data)
        .join('text')
        .attr('x', margin.left - 10)
        .attr('y', d => y(d.method) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('font-size', 13)
        .text(d => d.method);
}

// Transfer results
function renderTransferResults(container) {
    container.innerHTML = `
        <div class="metrics-row">
            <div class="metric-card-mini primary">
                <div class="metric-value-mini">0.826</div>
                <div class="metric-label-mini">REMI AUC</div>
            </div>
            <div class="metric-card-mini success">
                <div class="metric-value-mini">0.78</div>
                <div class="metric-label-mini">ABC AUC</div>
            </div>
            <div class="metric-card-mini">
                <div class="metric-value-mini">0.61</div>
                <div class="metric-label-mini">NotaGen AUC</div>
            </div>
        </div>
    `;
}

// Takeaway checklist
function renderTakeawayChecklist(container) {
    container.innerHTML = `
        <div style="text-align: center; font-size: 4rem; line-height: 1.5;">
            ✓ ✓ ✓
        </div>
    `;
}

// Q&A icon
function renderQAIcon(container) {
    container.innerHTML = `
        <div style="text-align: center; font-size: 8rem; color: #0173B2;">
            ?
        </div>
    `;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderVisual };
}
