/* =====================================
   TS-RaMIA Slides Charts & Visualizations
   Every slide has a rich visual element
   ===================================== */

// Cache to avoid re-rendering
const renderedVisuals = new Set();

// Track ROC zoom state
let rocZoomState = 'full'; // 'full' or 'lowfpr'

// Main visual rendering dispatcher
function renderVisual(containerId, visualConfig) {
    // Avoid re-rendering (except for interactive ones like ROC)
    if (renderedVisuals.has(containerId) && visualConfig.type !== 'resultsBarsRoc') {
        return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Render based on type
    switch(visualConfig.type) {
        case 'heroParticles':
            renderHeroParticles(container, visualConfig);
            break;
        case 'flowDiagram':
            renderFlowDiagram(container, visualConfig);
            break;
        case 'hypothesisCard':
            renderHypothesisCard(container, visualConfig);
            break;
        case 'tokenSplit':
            renderTokenSplit(container, visualConfig);
            break;
        case 'collapseBars':
            renderCollapseBars(container, visualConfig);
            break;
        case 'ablationMini':
            renderAblationMini(container, visualConfig);
            break;
        case 'pipeline':
            renderPipeline(container, visualConfig);
            break;
        case 'tokenSnippet':
            renderTokenSnippet(container, visualConfig);
            break;
        case 'tailPlot':
            renderTailPlot(container, visualConfig);
            break;
        case 'debiasCards':
            renderDebiasCards(container, visualConfig);
            break;
        case 'resultsBarsRoc':
            renderResultsBarsRoc(container, visualConfig);
            break;
        case 'ablationBars':
            renderAblationBars(container, visualConfig);
            break;
        case 'transferBridge':
            renderTransferBridge(container, visualConfig);
            break;
        case 'takeawaysPanel':
            renderTakeawaysPanel(container, visualConfig);
            break;
        default:
            console.warn('Unknown visual type:', visualConfig.type);
    }
    
    renderedVisuals.add(containerId);
}

// ========== Slide 1: Hero with badges and particles ==========
function renderHeroParticles(container, config) {
    const badges = config.badges || [];
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position: relative; height: 300px; display: flex; align-items: center; justify-content: center;';
    
    // Simple particle background (CSS animation)
    const particles = document.createElement('div');
    particles.style.cssText = 'position: absolute; width: 100%; height: 100%; opacity: 0.15; overflow: hidden;';
    particles.innerHTML = Array.from({length: 20}, (_, i) => 
        `<div style="position: absolute; width: 4px; height: 4px; background: #DE8F05; border-radius: 50%; 
        left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; 
        animation: float ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s;"></div>`
    ).join('');
    
    wrapper.appendChild(particles);
    
    // Badges
    const badgeRow = document.createElement('div');
    badgeRow.style.cssText = 'position: relative; display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center;';
    
    badges.forEach((badge, i) => {
        const colors = ['#0173B2', '#DE8F05', '#029E73'];
        const el = document.createElement('div');
        el.style.cssText = `padding: 1rem 2rem; background: ${colors[i]}; color: white; 
            border-radius: 12px; font-size: 1.3rem; font-weight: 600; 
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            animation: fadeInUp 0.6s ease forwards ${i * 0.15}s; opacity: 0;`;
        el.textContent = badge;
        badgeRow.appendChild(el);
    });
    
    wrapper.appendChild(badgeRow);
    container.appendChild(wrapper);
    
    // Add CSS keyframes
    if (!document.getElementById('particles-keyframes')) {
        const style = document.createElement('style');
        style.id = 'particles-keyframes';
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0) translateX(0); }
                33% { transform: translateY(-20px) translateX(10px); }
                66% { transform: translateY(20px) translateX(-10px); }
            }
            @keyframes fadeInUp {
                to { opacity: 1; transform: translateY(0); }
                from { transform: translateY(20px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== Slide 2: Flow diagram ==========
function renderFlowDiagram(container, config) {
    const flow = config.flow || [];
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', 800)
        .attr('height', 200)
        .attr('viewBox', '0 0 800 200');
    
    const nodeWidth = 180;
    const nodeHeight = 80;
    const gap = 80;
    const startX = (800 - (flow.length * nodeWidth + (flow.length - 1) * gap)) / 2;
    
    flow.forEach((label, i) => {
        const x = startX + i * (nodeWidth + gap);
        const y = 60;
        
        // Node
        svg.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', nodeWidth)
            .attr('height', nodeHeight)
            .attr('fill', i === flow.length - 1 ? '#DE8F05' : '#E8E8E8')
            .attr('stroke', i === flow.length - 1 ? '#DE8F05' : '#0173B2')
            .attr('stroke-width', 3)
            .attr('rx', 12);
        
        svg.append('text')
            .attr('x', x + nodeWidth / 2)
            .attr('y', y + nodeHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', 18)
            .attr('font-weight', 600)
            .attr('fill', i === flow.length - 1 ? 'white' : '#212529')
            .text(label);
        
        // Arrow
        if (i < flow.length - 1) {
            const arrowX = x + nodeWidth + 10;
            svg.append('path')
                .attr('d', `M ${arrowX} ${y + nodeHeight/2} L ${arrowX + gap - 20} ${y + nodeHeight/2}`)
                .attr('stroke', '#6C757D')
                .attr('stroke-width', 3)
                .attr('marker-end', 'url(#arrowhead)');
        }
        
        // Question mark for last node
        if (i === flow.length - 1) {
            svg.append('text')
                .attr('x', x + nodeWidth / 2)
                .attr('y', y - 20)
                .attr('text-anchor', 'middle')
                .attr('font-size', 32)
                .text('?');
        }
    });
    
    // Arrow marker
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

// ========== Slide 3: Hypothesis test card ==========
function renderHypothesisCard(container, config) {
    const card = document.createElement('div');
    card.style.cssText = `
        max-width: 700px; margin: 2rem auto; padding: 3rem;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border: 3px solid #0173B2; border-radius: 16px;
        font-size: 1.5rem; text-align: center;
    `;
    
    card.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <strong style="color: #0173B2;">H₀:</strong> 
            <span style="font-family: 'Courier New', monospace; font-size: 1.6rem;">${config.h0}</span>
        </div>
        <div style="font-size: 2rem; margin: 1.5rem 0; color: #6C757D;">vs</div>
        <div style="margin-bottom: 2rem;">
            <strong style="color: #029E73;">H₁:</strong> 
            <span style="font-family: 'Courier New', monospace; font-size: 1.6rem;">${config.h1}</span>
        </div>
        <div style="margin-top: 2.5rem; padding-top: 2rem; border-top: 2px solid #DEE2E6;">
            <span style="font-weight: 600;">Score:</span> 
            <span style="font-family: 'Courier New', monospace;">s(x) > τ</span> 
            <span style="margin: 0 1rem;">→</span> 
            <span style="color: #029E73; font-weight: 700;">Member</span>
        </div>
    `;
    
    container.appendChild(card);
}

// ========== Slide 4: Token split visualization ==========
function renderTokenSplit(container, config) {
    const structural = config.structural || 60;
    const note = config.note || 40;
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', 700)
        .attr('height', 250)
        .attr('viewBox', '0 0 700 250');
    
    // Pie chart
    const radius = 80;
    const centerX = 150;
    const centerY = 125;
    
    const pie = d3.pie()
        .value(d => d.value)
        .sort(null);
    
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);
    
    const data = [
        { label: 'Structural', value: structural, color: '#DE8F05' },
        { label: 'Notes', value: note, color: '#E8E8E8' }
    ];
    
    const g = svg.append('g')
        .attr('transform', `translate(${centerX}, ${centerY})`);
    
    g.selectAll('path')
        .data(pie(data))
        .join('path')
        .attr('d', arc)
        .attr('fill', d => d.data.color)
        .attr('stroke', 'white')
        .attr('stroke-width', 3);
    
    // Legend
    const legend = svg.append('g')
        .attr('transform', 'translate(300, 70)');
    
    data.forEach((d, i) => {
        const ly = i * 50;
        
        legend.append('rect')
            .attr('y', ly)
            .attr('width', 40)
            .attr('height', 40)
            .attr('fill', d.color)
            .attr('rx', 4);
        
        legend.append('text')
            .attr('x', 55)
            .attr('y', ly + 25)
            .attr('font-size', 20)
            .attr('font-weight', 600)
            .text(`${d.label}: ${d.value}%`);
    });
    
    // Note
    svg.append('text')
        .attr('x', 350)
        .attr('y', 200)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .attr('fill', '#6C757D')
        .text('Structural tokens dominate token counts');
}

// ========== Slide 5: Collapse bars ==========
function renderCollapseBars(container, config) {
    const data = config.data || [];
    
    const width = 700;
    const height = 250;
    const margin = { top: 30, right: 30, bottom: 50, left: 250 };
    
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
        .attr('fill', (d, i) => i === 0 ? '#6C757D' : '#DE8F05')
        .attr('rx', 6);
    
    // Values
    svg.selectAll('.value')
        .data(data)
        .join('text')
        .attr('class', 'value')
        .attr('x', d => x(d.value) + 15)
        .attr('y', d => y(d.label) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('font-size', 24)
        .attr('font-weight', 700)
        .attr('fill', '#212529')
        .text(d => d.value.toFixed(3));
    
    // Labels
    svg.selectAll('.label')
        .data(data)
        .join('text')
        .attr('class', 'label')
        .attr('x', margin.left - 10)
        .attr('y', d => y(d.label) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('font-size', 15)
        .attr('fill', '#212529')
        .text(d => d.label);
    
    // Arrow
    svg.append('path')
        .attr('d', `M ${width - 100} ${height/2 - 30} L ${width - 100} ${height/2 + 30}`)
        .attr('stroke', '#DE8F05')
        .attr('stroke-width', 4)
        .attr('marker-end', 'url(#arrow-down)');
    
    svg.append('text')
        .attr('x', width - 100)
        .attr('y', height/2 - 45)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .attr('font-weight', 600)
        .attr('fill', '#DE8F05')
        .text('After control');
    
    svg.append('defs')
        .append('marker')
        .attr('id', 'arrow-down')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('refX', 5)
        .attr('refY', 9)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 10 0, 5 10')
        .attr('fill', '#DE8F05');
}

// ========== Slide 6: Mini ablation ==========
function renderAblationMini(container, config) {
    const data = config.data || [];
    
    const width = 600;
    const height = 280;
    const margin = { top: 30, right: 30, bottom: 50, left: 180 };
    
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
        .padding(0.25);
    
    svg.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', margin.left)
        .attr('y', d => y(d.label))
        .attr('width', d => x(d.value) - margin.left)
        .attr('height', y.bandwidth())
        .attr('fill', d => d.color)
        .attr('rx', 6);
    
    svg.selectAll('.value')
        .data(data)
        .join('text')
        .attr('x', d => x(d.value) + 12)
        .attr('y', d => y(d.label) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('font-size', 22)
        .attr('font-weight', 700)
        .text(d => d.value.toFixed(3));
    
    svg.selectAll('.label')
        .data(data)
        .join('text')
        .attr('x', margin.left - 10)
        .attr('y', d => y(d.label) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('font-size', 16)
        .text(d => d.label);
}

// ========== Slide 7: Pipeline ==========
function renderPipeline(container, config) {
    const stages = config.stages || [];
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', 1000)
        .attr('height', 180)
        .attr('viewBox', '0 0 1000 180');
    
    const stageWidth = 140;
    const stageHeight = 100;
    const gap = 40;
    const colors = ['#0173B2', '#029E73', '#DE8F05', '#9B59B6', '#D55E00'];
    
    const totalWidth = stages.length * stageWidth + (stages.length - 1) * gap;
    const startX = (1000 - totalWidth) / 2;
    
    stages.forEach((stage, i) => {
        const x = startX + i * (stageWidth + gap);
        const y = 40;
        
        // Box
        svg.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', stageWidth)
            .attr('height', stageHeight)
            .attr('fill', colors[i % colors.length])
            .attr('rx', 12);
        
        // Icon
        svg.append('text')
            .attr('x', x + stageWidth / 2)
            .attr('y', y + 35)
            .attr('text-anchor', 'middle')
            .attr('font-size', 28)
            .text(stage.icon);
        
        // Text
        svg.append('text')
            .attr('x', x + stageWidth / 2)
            .attr('y', y + 75)
            .attr('text-anchor', 'middle')
            .attr('font-size', 13)
            .attr('font-weight', 600)
            .attr('fill', 'white')
            .each(function() {
                const lines = stage.name.split('\n');
                const text = d3.select(this);
                lines.forEach((line, li) => {
                    text.append('tspan')
                        .attr('x', x + stageWidth / 2)
                        .attr('dy', li === 0 ? 0 : 14)
                        .text(line);
                });
            });
        
        // Arrow
        if (i < stages.length - 1) {
            const arrowX = x + stageWidth + 8;
            svg.append('path')
                .attr('d', `M ${arrowX} ${y + stageHeight/2} L ${arrowX + gap - 16} ${y + stageHeight/2}`)
                .attr('stroke', '#6C757D')
                .attr('stroke-width', 4)
                .attr('marker-end', 'url(#pipe-arrow)');
        }
    });
    
    svg.append('defs')
        .append('marker')
        .attr('id', 'pipe-arrow')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('refX', 9)
        .attr('refY', 3)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 10 3, 0 6')
        .attr('fill', '#6C757D');
}

// ========== Slide 8: Token snippet ==========
function renderTokenSnippet(container, config) {
    const tokens = config.tokens || [];
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        max-width: 900px; margin: 2rem auto; padding: 2rem;
        background: #f8f9fa; border-radius: 12px;
        font-family: 'Courier New', monospace; font-size: 1.3rem;
    `;
    
    const tokenRow = document.createElement('div');
    tokenRow.style.cssText = 'display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-bottom: 2rem;';
    
    tokens.forEach(token => {
        const el = document.createElement('span');
        const isStruct = token.type === 'struct';
        el.style.cssText = `
            padding: 8px 14px; border-radius: 6px; font-weight: ${isStruct ? 700 : 400};
            background: ${isStruct ? '#DE8F05' : '#E8E8E8'};
            color: ${isStruct ? 'white' : '#212529'};
        `;
        el.textContent = token.text;
        tokenRow.appendChild(el);
    });
    
    const legend = document.createElement('div');
    legend.style.cssText = 'display: flex; gap: 2rem; justify-content: center; font-size: 1rem;';
    legend.innerHTML = `
        <span><span style="display: inline-block; width: 20px; height: 20px; background: #DE8F05; border-radius: 4px; vertical-align: middle; margin-right: 8px;"></span>Structural tokens</span>
        <span><span style="display: inline-block; width: 20px; height: 20px; background: #E8E8E8; border-radius: 4px; vertical-align: middle; margin-right: 8px;"></span>Note tokens</span>
    `;
    
    wrapper.appendChild(tokenRow);
    wrapper.appendChild(legend);
    container.appendChild(wrapper);
}

// ========== Slide 9: Tail plot ==========
function renderTailPlot(container, config) {
    const numTokens = config.tokens || 40;
    const topK = config.topK || 64;
    
    // Generate mock sorted NLL data
    const data = Array.from({ length: numTokens }, (_, i) => ({
        token: i + 1,
        nll: 0.5 + Math.random() * 2 + (i > numTokens - 10 ? 3 + Math.random() * 2 : 0)
    })).sort((a, b) => a.nll - b.nll);
    
    const width = 800;
    const height = 300;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    
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
        .domain([0, d3.max(data, d => d.nll) * 1.1])
        .nice()
        .range([height - margin.bottom, margin.top]);
    
    const tailThreshold = data.length - 10;
    
    svg.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => x(d.token))
        .attr('y', d => y(d.nll))
        .attr('width', x.bandwidth())
        .attr('height', d => y(0) - y(d.nll))
        .attr('fill', (d, i) => i >= tailThreshold ? '#DE8F05' : '#E8E8E8')
        .attr('rx', 2);
    
    // Highlight region
    svg.append('rect')
        .attr('x', x(data[tailThreshold].token) - 5)
        .attr('y', margin.top)
        .attr('width', width - margin.right - x(data[tailThreshold].token) + 5)
        .attr('height', height - margin.top - margin.bottom)
        .attr('fill', 'rgba(222, 143, 5, 0.15)')
        .attr('stroke', '#DE8F05')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
    
    svg.append('text')
        .attr('x', (x(data[tailThreshold].token) + width - margin.right) / 2)
        .attr('y', margin.top + 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .attr('font-weight', 700)
        .attr('fill', '#DE8F05')
        .text(`Top-${topK} Tail`);
    
    // Axes
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => i % 5 === 0)))
        .attr('font-size', 12);
    
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5))
        .attr('font-size', 12);
    
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .text('Structural tokens (sorted by NLL)');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .text('NLL');
}

// ========== Slide 10: Debias cards ==========
function renderDebiasCards(container, config) {
    const methods = config.methods || [];
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; max-width: 900px; margin: 0 auto;';
    
    methods.forEach((method, i) => {
        const icons = ['🎯', '📊'];
        const colors = ['#0173B2', '#029E73'];
        
        const card = document.createElement('div');
        card.style.cssText = `
            padding: 2.5rem; background: white;
            border: 3px solid ${colors[i]}; border-radius: 16px;
            text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        `;
        
        card.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 1rem;">${icons[i]}</div>
            <div style="font-size: 1.6rem; font-weight: 700; margin-bottom: 1rem; color: ${colors[i]};">${method.name}</div>
            <div style="font-size: 1.1rem; color: #6C757D; line-height: 1.5;">${method.desc}</div>
        `;
        
        wrapper.appendChild(card);
    });
    
    const badge = document.createElement('div');
    badge.style.cssText = `
        grid-column: 1 / -1; text-align: center; margin-top: 1rem;
        padding: 1.5rem; background: #DE8F05; color: white;
        border-radius: 12px; font-size: 1.8rem; font-weight: 700;
    `;
    badge.textContent = 'Primary Metric: TPR @ 1% FPR';
    wrapper.appendChild(badge);
    
    container.appendChild(wrapper);
}

// ========== Slide 11: Results bars + ROC with zoom ==========
function renderResultsBarsRoc(container, config) {
    container.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'max-width: 1100px; margin: 0 auto;';
    
    // Bars section
    const barsDiv = document.createElement('div');
    barsDiv.style.cssText = 'margin-bottom: 2rem;';
    
    const methods = [
        { name: 'Baseline', ...performanceData.baseline, color: '#6C757D' },
        { name: 'StructTail-64', ...performanceData.structtail64, color: '#DE8F05' },
        { name: 'StructTail+Fusion', ...performanceData.fusion, color: '#029E73' }
    ];
    
    const metricsRow = document.createElement('div');
    metricsRow.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem;';
    
    methods.forEach(method => {
        const card = document.createElement('div');
        card.style.cssText = `
            padding: 1.5rem; background: white; border-radius: 12px;
            border-left: 6px solid ${method.color};
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;
        
        card.innerHTML = `
            <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 1rem; color: #212529;">${method.name}</div>
            <div style="font-size: 2.2rem; font-weight: 700; color: ${method.color}; margin-bottom: 0.5rem;">AUC ${method.auc.toFixed(3)}</div>
            <div style="font-size: 0.95rem; color: #6C757D; line-height: 1.6;">
                <div>TPR@1%: <strong>${method.tpr_1fpr.toFixed(1)}%</strong></div>
                <div>TPR@5%: <strong>${method.tpr_5fpr.toFixed(1)}%</strong></div>
            </div>
        `;
        
        metricsRow.appendChild(card);
    });
    
    barsDiv.appendChild(metricsRow);
    wrapper.appendChild(barsDiv);
    
    // ROC section with zoom toggle
    const rocDiv = document.createElement('div');
    rocDiv.id = 'roc-zoom-container';
    
    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 1rem; justify-content: center; margin-bottom: 1rem;';
    
    const btnFull = document.createElement('button');
    btnFull.textContent = 'Full View (0–100%)';
    btnFull.style.cssText = `
        padding: 0.7rem 1.5rem; border: 2px solid #0173B2;
        background: ${rocZoomState === 'full' ? '#0173B2' : 'white'};
        color: ${rocZoomState === 'full' ? 'white' : '#0173B2'};
        border-radius: 8px; font-weight: 600; cursor: pointer;
        transition: all 0.2s;
    `;
    btnFull.onclick = () => {
        rocZoomState = 'full';
        renderResultsBarsRoc(container, config);
    };
    
    const btnZoom = document.createElement('button');
    btnZoom.textContent = 'Zoom Low-FPR (0–5%)';
    btnZoom.style.cssText = `
        padding: 0.7rem 1.5rem; border: 2px solid #DE8F05;
        background: ${rocZoomState === 'lowfpr' ? '#DE8F05' : 'white'};
        color: ${rocZoomState === 'lowfpr' ? 'white' : '#DE8F05'};
        border-radius: 8px; font-weight: 600; cursor: pointer;
        transition: all 0.2s;
    `;
    btnZoom.onclick = () => {
        rocZoomState = 'lowfpr';
        renderResultsBarsRoc(container, config);
    };
    
    controls.appendChild(btnFull);
    controls.appendChild(btnZoom);
    rocDiv.appendChild(controls);
    
    // ROC Chart
    const rocChart = document.createElement('div');
    rocChart.id = 'roc-chart-svg';
    rocDiv.appendChild(rocChart);
    
    renderROCCurve(rocChart, rocZoomState);
    
    wrapper.appendChild(rocDiv);
    container.appendChild(wrapper);
}

function renderROCCurve(container, zoomState) {
    const width = 700;
    const height = 450;
    const margin = { top: 30, right: 150, bottom: 60, left: 60 };
    
    const svg = d3.select(container)
        .html('')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);
    
    const maxFPR = zoomState === 'lowfpr' ? 0.05 : 1.0;
    
    const x = d3.scaleLinear()
        .domain([0, maxFPR])
        .range([margin.left, width - margin.right]);
    
    const y = d3.scaleLinear()
        .domain([0, zoomState === 'lowfpr' ? 0.4 : 1])
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
    
    // Diagonal
    if (zoomState === 'full') {
        svg.append('line')
            .attr('x1', x(0))
            .attr('y1', y(0))
            .attr('x2', x(1))
            .attr('y2', y(1))
            .attr('stroke', '#CCC')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');
    }
    
    // Draw curves
    const methods = [
        { key: 'baseline', color: '#6C757D', label: 'Baseline', width: 2 },
        { key: 'structtail64', color: '#DE8F05', label: 'StructTail-64', width: 3 },
        { key: 'fusion', color: '#029E73', label: 'StructTail+Fusion', width: 4 }
    ];
    
    methods.forEach(method => {
        const data = rocData[method.key].filter(d => d.fpr <= maxFPR);
        
        svg.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', method.color)
            .attr('stroke-width', method.width)
            .attr('d', line);
    });
    
    // Axes
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(zoomState === 'lowfpr' ? 10 : 10).tickFormat(d => `${(d*100).toFixed(0)}%`))
        .attr('font-size', 12);
    
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(8).tickFormat(d => `${(d*100).toFixed(0)}%`))
        .attr('font-size', 12);
    
    // Labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .attr('font-weight', 600)
        .text('False Positive Rate');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 18)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .attr('font-weight', 600)
        .text('True Positive Rate');
    
    // Legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 140}, ${margin.top + 20})`);
    
    methods.forEach((method, i) => {
        const g = legend.append('g')
            .attr('transform', `translate(0, ${i * 30})`);
        
        g.append('line')
            .attr('x1', 0)
            .attr('x2', 30)
            .attr('stroke', method.color)
            .attr('stroke-width', method.width);
        
        g.append('text')
            .attr('x', 35)
            .attr('y', 0)
            .attr('dy', '0.35em')
            .attr('font-size', 11)
            .attr('font-weight', 500)
            .text(method.label);
    });
}

// ========== Slide 12: Ablation bars ==========
function renderAblationBars(container, config) {
    const topKData = ablationData.topK;
    const p95Data = config.showP95 ? ablationData.p95 : null;
    
    const allData = [...topKData.map(d => ({ ...d, label: `Top-${d.k}` }))];
    if (p95Data) {
        allData.push({ ...p95Data, label: '+Windowed p95' });
    }
    
    const width = 750;
    const height = 350;
    const margin = { top: 30, right: 40, bottom: 60, left: 150 };
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);
    
    const x = d3.scaleLinear()
        .domain([0, 1])
        .range([margin.left, width - margin.right]);
    
    const y = d3.scaleBand()
        .domain(allData.map(d => d.label))
        .range([margin.top, height - margin.bottom])
        .padding(0.2);
    
    svg.selectAll('rect')
        .data(allData)
        .join('rect')
        .attr('x', margin.left)
        .attr('y', d => y(d.label))
        .attr('width', d => x(d.auc) - margin.left)
        .attr('height', y.bandwidth())
        .attr('fill', d => d.label.includes('p95') ? '#029E73' : '#0173B2')
        .attr('rx', 6);
    
    svg.selectAll('.value')
        .data(allData)
        .join('text')
        .attr('x', d => x(d.auc) + 12)
        .attr('y', d => y(d.label) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('font-size', 18)
        .attr('font-weight', 700)
        .text(d => `AUC ${d.auc.toFixed(3)}`);
    
    svg.selectAll('.label')
        .data(allData)
        .join('text')
        .attr('x', margin.left - 10)
        .attr('y', d => y(d.label) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('font-size', 15)
        .attr('font-weight', 600)
        .text(d => d.label);
    
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .text('AUC (length-matched)');
}

// ========== Slide 13: Transfer bridge ==========
function renderTransferBridge(container, config) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'max-width: 800px; margin: 0 auto; text-align: center;';
    
    // Bridge diagram
    const svg = d3.select(wrapper)
        .append('svg')
        .attr('width', 700)
        .attr('height', 200)
        .attr('viewBox', '0 0 700 200');
    
    // From box
    svg.append('rect')
        .attr('x', 80)
        .attr('y', 70)
        .attr('width', 180)
        .attr('height', 80)
        .attr('fill', '#0173B2')
        .attr('rx', 12);
    
    svg.append('text')
        .attr('x', 170)
        .attr('y', 110)
        .attr('text-anchor', 'middle')
        .attr('font-size', 24)
        .attr('font-weight', 700)
        .attr('fill', 'white')
        .text(config.from);
    
    // Arrow
    svg.append('path')
        .attr('d', 'M 280 110 L 420 110')
        .attr('stroke', '#DE8F05')
        .attr('stroke-width', 6)
        .attr('marker-end', 'url(#transfer-arrow)');
    
    svg.append('text')
        .attr('x', 350)
        .attr('y', 95)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .attr('font-weight', 600)
        .attr('fill', '#DE8F05')
        .text('Transfer');
    
    // To box
    svg.append('rect')
        .attr('x', 440)
        .attr('y', 70)
        .attr('width', 180)
        .attr('height', 80)
        .attr('fill', '#029E73')
        .attr('rx', 12);
    
    svg.append('text')
        .attr('x', 530)
        .attr('y', 110)
        .attr('text-anchor', 'middle')
        .attr('font-size', 24)
        .attr('font-weight', 700)
        .attr('fill', 'white')
        .text(config.to);
    
    svg.append('defs')
        .append('marker')
        .attr('id', 'transfer-arrow')
        .attr('markerWidth', 12)
        .attr('markerHeight', 12)
        .attr('refX', 11)
        .attr('refY', 3)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 12 3, 0 6')
        .attr('fill', '#DE8F05');
    
    // Metrics card
    const metrics = document.createElement('div');
    metrics.style.cssText = `
        margin-top: 2rem; padding: 2rem; background: white;
        border-radius: 12px; border: 3px solid #029E73;
        display: inline-block;
    `;
    
    metrics.innerHTML = `
        <div style="font-size: 2rem; font-weight: 700; color: #029E73; margin-bottom: 0.5rem;">
            AUC ${config.metrics.auc.toFixed(2)} · TPR@1%FPR ${config.metrics.tpr1.toFixed(1)}%
        </div>
        <div style="font-size: 1rem; color: #6C757D;">ABC with NotaGen (raw view)</div>
    `;
    
    wrapper.appendChild(metrics);
    container.appendChild(wrapper);
}

// ========== Slide 14: Takeaways panel ==========
function renderTakeawaysPanel(container, config) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; max-width: 1100px; margin: 0 auto;';
    
    // Left: Takeaways
    const takeaways = document.createElement('div');
    takeaways.style.cssText = 'padding: 2rem; background: #f8f9fa; border-radius: 12px;';
    takeaways.innerHTML = `
        <h3 style="font-size: 1.6rem; margin-bottom: 1.5rem; color: #0173B2;">✓ Three Key Takeaways</h3>
        <div style="font-size: 2.5rem; text-align: center; color: #029E73; line-height: 1.8;">
            ✓<br>✓<br>✓
        </div>
    `;
    
    // Right: Workflow + Q&A
    const right = document.createElement('div');
    right.style.cssText = 'display: flex; flex-direction: column; gap: 1.5rem;';
    
    const workflow = document.createElement('div');
    workflow.style.cssText = 'padding: 1.5rem; background: white; border-radius: 12px; border: 2px solid #DE8F05;';
    workflow.innerHTML = `
        <h4 style="font-size: 1.3rem; margin-bottom: 1rem; color: #DE8F05;">Auditor Workflow</h4>
        <ol style="font-size: 1.05rem; line-height: 1.8; padding-left: 1.5rem; color: #212529;">
            ${config.workflow.map(step => `<li>${step}</li>`).join('')}
        </ol>
    `;
    
    const qa = document.createElement('div');
    qa.style.cssText = 'padding: 1.5rem; background: white; border-radius: 12px; border: 2px solid #9B59B6;';
    qa.innerHTML = `
        <h4 style="font-size: 1.5rem; margin-bottom: 1rem; color: #9B59B6; text-align: center;">Q&A</h4>
        <ul style="font-size: 0.95rem; line-height: 1.7; list-style: none; padding: 0; color: #6C757D;">
            ${config.questions.map(q => `<li style="margin-bottom: 0.5rem;">• ${q}</li>`).join('')}
        </ul>
    `;
    
    right.appendChild(workflow);
    right.appendChild(qa);
    
    wrapper.appendChild(takeaways);
    wrapper.appendChild(right);
    container.appendChild(wrapper);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderVisual };
}
