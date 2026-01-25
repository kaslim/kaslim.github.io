/* =====================================
   TS-RaMIA Slides Charts & Visualizations
   18 unique visual renderers
   BIG and CLEAR for in-room viewing
   ===================================== */

// Cache
const renderedVisuals = new Set();
let rocZoomState = 'full';

// Main dispatcher
function renderVisual(containerId, visualConfig) {
    // Allow re-render for interactive ones
    if (renderedVisuals.has(containerId) && visualConfig.type !== 'resultsDashboard') {
        return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const renderers = {
        heroTokenStream: renderHeroTokenStream,
        creatorPipeline: renderCreatorPipeline,
        hypothesisTestCard: renderHypothesisTestCard,
        vennNot: renderVennNot,
        musicModalityContrast: renderMusicModalityContrast,
        accessModel: renderAccessModel,
        tokenHeterogeneity: renderTokenHeterogeneity,
        confounderCollapse: renderConfounderCollapse,
        structuralLeakageIntuition: renderStructuralLeakageIntuition,
        pipeline5: renderPipeline5,
        tokenSnippetHighlight: renderTokenSnippetHighlight,
        tokenNLLBars: renderTokenNLLBars,
        tailExplain: renderTailExplain,
        debiasTwoCards: renderDebiasTwoCards,
        cvComposerDiagram: renderCvComposerDiagram,
        resultsDashboard: renderResultsDashboard,
        ablationBars: renderAblationBars,
        transferAndWorkflow: renderTransferAndWorkflow
    };
    
    const renderer = renderers[visualConfig.type];
    if (renderer) {
        renderer(container, visualConfig);
        renderedVisuals.add(containerId);
    } else {
        console.warn('Unknown visual type:', visualConfig.type);
    }
}

// ========== Slide 1: Hero Token Stream ==========
function renderHeroTokenStream(container, config) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position: relative; width: 100%; height: 350px; display: flex; align-items: center; justify-content: center;';
    
    // Particle background
    const particles = document.createElement('div');
    particles.style.cssText = 'position: absolute; width: 100%; height: 100%; opacity: 0.12; overflow: hidden;';
    particles.innerHTML = Array.from({length: 30}, (_, i) => 
        `<div style="position: absolute; width: 6px; height: 6px; background: #DE8F05; border-radius: 50%; 
        left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; 
        animation: float-particle ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s;"></div>`
    ).join('');
    
    wrapper.appendChild(particles);
    container.appendChild(wrapper);
    
    // Keyframes
    if (!document.getElementById('particle-anim')) {
        const style = document.createElement('style');
        style.id = 'particle-anim';
        style.textContent = `
            @keyframes float-particle {
                0%, 100% { transform: translateY(0) translateX(0); }
                33% { transform: translateY(-25px) translateX(15px); }
                66% { transform: translateY(25px) translateX(-15px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== Slide 2: Creator Pipeline ==========
function renderCreatorPipeline(container, config) {
    const svg = d3.select(container)
        .append('svg')
        .attr('width', 700)
        .attr('height', 300)
        .attr('viewBox', '0 0 700 300');
    
    const stages = [
        { label: 'My piece', icon: '🎼', x: 80, color: '#E8E8E8' },
        { label: 'Music LM', icon: '🤖', x: 300, color: '#0173B2' },
        { label: 'Audit score', icon: '⚖️', x: 520, color: '#DE8F05' }
    ];
    
    stages.forEach((stage, i) => {
        const y = 120;
        const boxWidth = 150;
        const boxHeight = 90;
        
        // Box
        svg.append('rect')
            .attr('x', stage.x)
            .attr('y', y)
            .attr('width', boxWidth)
            .attr('height', boxHeight)
            .attr('fill', stage.color)
            .attr('stroke', i === 0 ? '#6C757D' : stage.color)
            .attr('stroke-width', 3)
            .attr('rx', 12);
        
        // Icon
        svg.append('text')
            .attr('x', stage.x + boxWidth / 2)
            .attr('y', y + 35)
            .attr('text-anchor', 'middle')
            .attr('font-size', 32)
            .text(stage.icon);
        
        // Label
        svg.append('text')
            .attr('x', stage.x + boxWidth / 2)
            .attr('y', y + boxHeight - 20)
            .attr('text-anchor', 'middle')
            .attr('font-size', 16)
            .attr('font-weight', 600)
            .attr('fill', i === 2 ? 'white' : '#212529')
            .text(stage.label);
        
        // Arrow
        if (i < stages.length - 1) {
            const arrowX = stage.x + boxWidth + 10;
            const nextX = stages[i + 1].x - 10;
            svg.append('path')
                .attr('d', `M ${arrowX} ${y + boxHeight/2} L ${nextX} ${y + boxHeight/2}`)
                .attr('stroke', '#6C757D')
                .attr('stroke-width', 4)
                .attr('marker-end', 'url(#arrow-creator)');
        }
    });
    
    // Question mark bubble on last stage
    svg.append('text')
        .attr('x', 595)
        .attr('y', 90)
        .attr('text-anchor', 'middle')
        .attr('font-size', 40)
        .attr('fill', '#DE8F05')
        .text('?');
    
    // Arrow marker
    svg.append('defs')
        .append('marker')
        .attr('id', 'arrow-creator')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('refX', 9)
        .attr('refY', 3)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 10 3, 0 6')
        .attr('fill', '#6C757D');
}

// ========== Slide 3: Hypothesis Test Card ==========
function renderHypothesisTestCard(container, config) {
    const card = document.createElement('div');
    card.style.cssText = `
        max-width: 650px; margin: 0 auto; padding: 3rem;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border: 4px solid #0173B2; border-radius: 20px;
        font-size: 1.8rem; text-align: center;
    `;
    
    card.innerHTML = `
        <div style="margin-bottom: 2.5rem;">
            <strong style="color: #0173B2; font-size: 2rem;">H₀:</strong> 
            <span style="font-family: 'Courier New', monospace; font-size: 1.9rem;">x ∉ D_train</span>
        </div>
        <div style="font-size: 2.5rem; margin: 2rem 0; color: #6C757D;">vs</div>
        <div style="margin-bottom: 2.5rem;">
            <strong style="color: #029E73; font-size: 2rem;">H₁:</strong> 
            <span style="font-family: 'Courier New', monospace; font-size: 1.9rem;">x ∈ D_train</span>
        </div>
        <div style="margin-top: 3rem; padding-top: 2.5rem; border-top: 3px solid #DEE2E6; font-size: 1.6rem;">
            <span style="font-weight: 600;">Score:</span> 
            <span style="font-family: 'Courier New', monospace;">s(x) > τ</span> 
            <span style="margin: 0 1rem;">→</span> 
            <span style="color: #029E73; font-weight: 700;">Member</span>
        </div>
        <div style="margin-top: 2rem; font-size: 1.2rem; color: #6C757D;">
            (ROC curve to set threshold τ at low FPR)
        </div>
    `;
    
    container.appendChild(card);
}

// ========== Slide 4: Venn NOT diagram ==========
function renderVennNot(container, config) {
    const svg = d3.select(container)
        .append('svg')
        .attr('width', 700)
        .attr('height', 350)
        .attr('viewBox', '0 0 700 350');
    
    const circles = [
        { label: 'Plagiarism\nDetection', cx: 150, cy: 140, color: '#E8E8E8' },
        { label: 'Data\nExtraction', cx: 300, cy: 80, color: '#E8E8E8' },
        { label: 'Similarity\nSearch', cx: 450, cy: 140, color: '#E8E8E8' }
    ];
    
    circles.forEach(c => {
        svg.append('circle')
            .attr('cx', c.cx)
            .attr('cy', c.cy)
            .attr('r', 60)
            .attr('fill', c.color)
            .attr('stroke', '#6C757D')
            .attr('stroke-width', 2);
        
        const lines = c.label.split('\n');
        lines.forEach((line, i) => {
            svg.append('text')
                .attr('x', c.cx)
                .attr('y', c.cy + (i - 0.5) * 16 + 5)
                .attr('text-anchor', 'middle')
                .attr('font-size', 14)
                .attr('font-weight', 600)
                .text(line);
        });
    });
    
    // MIA box separate
    svg.append('rect')
        .attr('x', 220)
        .attr('y', 240)
        .attr('width', 260)
        .attr('height', 80)
        .attr('fill', '#0173B2')
        .attr('rx', 12);
    
    svg.append('text')
        .attr('x', 350)
        .attr('y', 270)
        .attr('text-anchor', 'middle')
        .attr('font-size', 20)
        .attr('font-weight', 700)
        .attr('fill', 'white')
        .text('Membership Inference (MIA)');
    
    svg.append('text')
        .attr('x', 350)
        .attr('y', 300)
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
        .attr('fill', 'white')
        .text('= Statistical auditing');
    
    // X marks on circles
    circles.forEach(c => {
        svg.append('text')
            .attr('x', c.cx)
            .attr('y', c.cy - 75)
            .attr('text-anchor', 'middle')
            .attr('font-size', 28)
            .attr('fill', '#D55E00')
            .attr('font-weight', 700)
            .text('✗');
    });
}

// ========== Slide 5: Music Modality Contrast ==========
function renderMusicModalityContrast(container, config) {
    const modalities = [
        { name: 'Text LM', icon: '📝', feature: 'Unstructured tokens', color: '#E8E8E8' },
        { name: 'Image Gen', icon: '🖼️', feature: 'Pixel patches', color: '#E8E8E8' },
        { name: 'Symbolic Music', icon: '🎼', feature: 'Hierarchical structure tokens', color: '#DE8F05' }
    ];
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; max-width: 900px; margin: 0 auto;';
    
    modalities.forEach((mod, i) => {
        const card = document.createElement('div');
        card.style.cssText = `
            padding: 2rem; background: ${mod.color}; border-radius: 16px;
            text-align: center; border: ${i === 2 ? '4px solid ' + mod.color : '3px solid #DEE2E6'};
        `;
        
        card.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 1rem;">${mod.icon}</div>
            <div style="font-size: 1.6rem; font-weight: 700; margin-bottom: 1rem; color: ${i === 2 ? 'white' : '#212529'};">${mod.name}</div>
            <div style="font-size: 1.1rem; color: ${i === 2 ? 'white' : '#6C757D'};">${mod.feature}</div>
        `;
        
        wrapper.appendChild(card);
    });
    
    container.appendChild(wrapper);
}

// ========== Slide 6: Access Model Ladder ==========
function renderAccessModel(container, config) {
    const svg = d3.select(container)
        .append('svg')
        .attr('width', 600)
        .attr('height', 350)
        .attr('viewBox', '0 0 600 350');
    
    const levels = [
        { label: 'Black-box\n(samples only)', y: 270, width: 450, color: '#E8E8E8' },
        { label: 'Gray-box\n(logprobs)', y: 170, width: 380, color: '#0173B2' },
        { label: 'White-box\n(weights)', y: 70, width: 310, color: '#6C757D' }
    ];
    
    levels.forEach((level, i) => {
        const x = (600 - level.width) / 2;
        
        svg.append('rect')
            .attr('x', x)
            .attr('y', level.y)
            .attr('width', level.width)
            .attr('height', 70)
            .attr('fill', level.color)
            .attr('stroke', i === 1 ? '#0173B2' : '#6C757D')
            .attr('stroke-width', i === 1 ? 4 : 2)
            .attr('rx', 8);
        
        const lines = level.label.split('\n');
        lines.forEach((line, li) => {
            svg.append('text')
                .attr('x', 300)
                .attr('y', level.y + 30 + li * 18)
                .attr('text-anchor', 'middle')
                .attr('font-size', 16)
                .attr('font-weight', i === 1 ? 700 : 600)
                .attr('fill', i === 1 ? 'white' : '#212529')
                .text(line);
        });
        
        // Highlight arrow for gray-box
        if (i === 1) {
            svg.append('text')
                .attr('x', x - 30)
                .attr('y', level.y + 40)
                .attr('text-anchor', 'middle')
                .attr('font-size', 36)
                .attr('fill', '#DE8F05')
                .text('←');
            
            svg.append('text')
                .attr('x', x - 90)
                .attr('y', level.y + 40)
                .attr('text-anchor', 'middle')
                .attr('font-size', 14)
                .attr('font-weight', 700)
                .attr('fill', '#DE8F05')
                .text('We assume');
        }
    });
}

// ========== Slide 7: Token Heterogeneity ==========
function renderTokenHeterogeneity(container, config) {
    const svg = d3.select(container)
        .append('svg')
        .attr('width', 650)
        .attr('height', 300)
        .attr('viewBox', '0 0 650 300');
    
    const data = [
        { type: 'Structural', tokens: ['Bar', 'Position', 'Tempo'], count: 60, color: '#DE8F05' },
        { type: 'Note', tokens: ['Pitch', 'Duration', 'Velocity'], count: 40, color: '#E8E8E8' }
    ];
    
    const barWidth = 250;
    const barHeight = 80;
    const startY = 80;
    let currentX = 50;
    
    data.forEach((d, i) => {
        const width = (d.count / 100) * 500;
        
        svg.append('rect')
            .attr('x', currentX)
            .attr('y', startY)
            .attr('width', width)
            .attr('height', barHeight)
            .attr('fill', d.color)
            .attr('rx', 6);
        
        svg.append('text')
            .attr('x', currentX + width / 2)
            .attr('y', startY + 30)
            .attr('text-anchor', 'middle')
            .attr('font-size', 18)
            .attr('font-weight', 700)
            .attr('fill', i === 0 ? 'white' : '#212529')
            .text(`${d.type}: ${d.count}%`);
        
        svg.append('text')
            .attr('x', currentX + width / 2)
            .attr('y', startY + 55)
            .attr('text-anchor', 'middle')
            .attr('font-size', 13)
            .attr('fill', i === 0 ? 'white' : '#6C757D')
            .text(d.tokens.join(' / '));
        
        currentX += width;
    });
    
    // Labels below
    svg.append('text')
        .attr('x', 325)
        .attr('y', 210)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .attr('fill', '#6C757D')
        .text('Token distribution in symbolic music');
}

// ========== Slide 8: Confounder Collapse ==========
function renderConfounderCollapse(container, config) {
    const data = [
        { label: 'Baseline Raw AUC', value: 0.730, color: '#6C757D' },
        { label: 'Length-matched AUC', value: 0.563, color: '#DE8F05' }
    ];
    
    const width = 700;
    const height = 280;
    const margin = { top: 30, right: 40, bottom: 50, left: 280 };
    
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
    
    svg.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', margin.left)
        .attr('y', d => y(d.label))
        .attr('width', d => x(d.value) - margin.left)
        .attr('height', y.bandwidth())
        .attr('fill', d => d.color)
        .attr('rx', 8);
    
    svg.selectAll('.value')
        .data(data)
        .join('text')
        .attr('x', d => x(d.value) + 15)
        .attr('y', d => y(d.label) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('font-size', 28)
        .attr('font-weight', 700)
        .attr('fill', '#212529')
        .text(d => d.value.toFixed(3));
    
    svg.selectAll('.label')
        .data(data)
        .join('text')
        .attr('x', margin.left - 15)
        .attr('y', d => y(d.label) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('font-size', 17)
        .attr('font-weight', 600)
        .text(d => d.label);
    
    // Big arrow
    svg.append('path')
        .attr('d', `M ${width - 110} ${height/2 - 40} L ${width - 110} ${height/2 + 40}`)
        .attr('stroke', '#D55E00')
        .attr('stroke-width', 6)
        .attr('marker-end', 'url(#collapse-arrow)');
    
    svg.append('text')
        .attr('x', width - 110)
        .attr('y', height/2 - 55)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .attr('font-weight', 700)
        .attr('fill', '#D55E00')
        .text('COLLAPSES');
    
    svg.append('defs')
        .append('marker')
        .attr('id', 'collapse-arrow')
        .attr('markerWidth', 12)
        .attr('markerHeight', 12)
        .attr('refX', 6)
        .attr('refY', 11)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 12 0, 6 12')
        .attr('fill', '#D55E00');
}

// ========== Slide 9: Structural Leakage Intuition ==========
function renderStructuralLeakageIntuition(container, config) {
    const svg = d3.select(container)
        .append('svg')
        .attr('width', 650)
        .attr('height', 300)
        .attr('viewBox', '0 0 650 300');
    
    // Draw "skeleton" of bars
    const bars = [
        { x: 50, label: 'Bar 1' },
        { x: 200, label: 'Bar 2' },
        { x: 350, label: 'Bar 3' },
        { x: 500, label: 'Bar 4' }
    ];
    
    bars.forEach(bar => {
        // Bar box
        svg.append('rect')
            .attr('x', bar.x)
            .attr('y', 80)
            .attr('width', 120)
            .attr('height', 140)
            .attr('fill', 'none')
            .attr('stroke', '#DE8F05')
            .attr('stroke-width', 4)
            .attr('stroke-dasharray', '8,4')
            .attr('rx', 6);
        
        // Bar label
        svg.append('text')
            .attr('x', bar.x + 60)
            .attr('y', 100)
            .attr('text-anchor', 'middle')
            .attr('font-size', 14)
            .attr('font-weight', 700)
            .attr('fill', '#DE8F05')
            .text(bar.label);
        
        // Beat position ticks
        for (let i = 0; i < 4; i++) {
            svg.append('line')
                .attr('x1', bar.x + 20 + i * 25)
                .attr('y1', 125)
                .attr('x2', bar.x + 20 + i * 25)
                .attr('y2', 205)
                .attr('stroke', '#6C757D')
                .attr('stroke-width', 2);
        }
    });
    
    // Tempo change marker
    svg.append('polygon')
        .attr('points', '375,50 360,70 390,70')
        .attr('fill', '#9B59B6');
    
    svg.append('text')
        .attr('x', 375)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', 13)
        .attr('font-weight', 600)
        .attr('fill', '#9B59B6')
        .text('Tempo');
    
    // Bottom label
    svg.append('text')
        .attr('x', 325)
        .attr('y', 260)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .attr('fill', '#212529')
        .text('Structure = Phrasing skeleton');
}

// ========== Slide 10: Pipeline 5 stages ==========
function renderPipeline5(container, config) {
    const stages = [
        { name: 'Tokenize', icon: '📝', color: '#0173B2' },
        { name: 'Structural\nMask', icon: '🎯', color: '#029E73' },
        { name: 'Token\nNLL', icon: '📊', color: '#DE8F05' },
        { name: 'Top-k\nTail', icon: '📈', color: '#9B59B6' },
        { name: 'Debias+\nFusion', icon: '⚖️', color: '#D55E00' }
    ];
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', 1000)
        .attr('height', 200)
        .attr('viewBox', '0 0 1000 200');
    
    const stageWidth = 150;
    const stageHeight = 110;
    const gap = 42;
    const totalWidth = stages.length * stageWidth + (stages.length - 1) * gap;
    const startX = (1000 - totalWidth) / 2;
    
    stages.forEach((stage, i) => {
        const x = startX + i * (stageWidth + gap);
        const y = 45;
        
        svg.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', stageWidth)
            .attr('height', stageHeight)
            .attr('fill', stage.color)
            .attr('rx', 12);
        
        svg.append('text')
            .attr('x', x + stageWidth / 2)
            .attr('y', y + 40)
            .attr('text-anchor', 'middle')
            .attr('font-size', 32)
            .text(stage.icon);
        
        const lines = stage.name.split('\n');
        lines.forEach((line, li) => {
            svg.append('text')
                .attr('x', x + stageWidth / 2)
                .attr('y', y + 80 + li * 15)
                .attr('text-anchor', 'middle')
                .attr('font-size', 14)
                .attr('font-weight', 700)
                .attr('fill', 'white')
                .text(line);
        });
        
        if (i < stages.length - 1) {
            const arrowX = x + stageWidth + 8;
            svg.append('path')
                .attr('d', `M ${arrowX} ${y + stageHeight/2} L ${arrowX + gap - 16} ${y + stageHeight/2}`)
                .attr('stroke', '#6C757D')
                .attr('stroke-width', 5)
                .attr('marker-end', 'url(#pipe-arrow-big)');
        }
    });
    
    svg.append('defs')
        .append('marker')
        .attr('id', 'pipe-arrow-big')
        .attr('markerWidth', 12)
        .attr('markerHeight', 12)
        .attr('refX', 11)
        .attr('refY', 3)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 12 3, 0 6')
        .attr('fill', '#6C757D');
}

// ========== Slide 11: Token Snippet Highlight ==========
function renderTokenSnippetHighlight(container, config) {
    const tokens = [
        { text: 'Bar_1', type: 'struct' },
        { text: 'Position_0', type: 'struct' },
        { text: 'Note_C', type: 'note' },
        { text: 'Note_E', type: 'note' },
        { text: 'Note_G', type: 'note' },
        { text: 'Bar_2', type: 'struct' },
        { text: 'Tempo_120', type: 'struct' },
        { text: 'Note_D', type: 'note' },
        { text: '|', type: 'struct' },
        { text: '[', type: 'struct' },
        { text: 'C', type: 'note' },
        { text: 'E', type: 'note' },
        { text: ']', type: 'struct' }
    ];
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
        max-width: 900px; margin: 0 auto; padding: 2.5rem;
        background: #F8F9FA; border-radius: 16px;
        font-family: 'Courier New', monospace; font-size: 1.5rem;
    `;
    
    const tokenRow = document.createElement('div');
    tokenRow.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-bottom: 2rem;';
    
    tokens.forEach(token => {
        const el = document.createElement('span');
        const isStruct = token.type === 'struct';
        el.style.cssText = `
            padding: 10px 16px; border-radius: 8px; font-weight: ${isStruct ? 700 : 400};
            background: ${isStruct ? '#DE8F05' : '#E8E8E8'};
            color: ${isStruct ? 'white' : '#212529'};
            font-size: 1.4rem;
        `;
        el.textContent = token.text;
        tokenRow.appendChild(el);
    });
    
    const legend = document.createElement('div');
    legend.style.cssText = 'display: flex; gap: 3rem; justify-content: center; font-size: 1.2rem;';
    legend.innerHTML = `
        <span><span style="display: inline-block; width: 28px; height: 28px; background: #DE8F05; border-radius: 6px; vertical-align: middle; margin-right: 10px;"></span>Structural</span>
        <span><span style="display: inline-block; width: 28px; height: 28px; background: #E8E8E8; border-radius: 6px; vertical-align: middle; margin-right: 10px;"></span>Note</span>
    `;
    
    wrapper.appendChild(tokenRow);
    wrapper.appendChild(legend);
    container.appendChild(wrapper);
}

// ========== Slide 12: Token NLL Bars ==========
function renderTokenNLLBars(container, config) {
    const numTokens = 50;
    const data = Array.from({ length: numTokens }, (_, i) => ({
        token: i + 1,
        nll: 0.8 + Math.random() * 2.5 + (Math.random() > 0.85 ? 2 : 0)
    }));
    
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
        .padding(0.15);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.nll) * 1.1])
        .nice()
        .range([height - margin.bottom, margin.top]);
    
    svg.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => x(d.token))
        .attr('y', d => y(d.nll))
        .attr('width', x.bandwidth())
        .attr('height', d => y(0) - y(d.nll))
        .attr('fill', d => d.nll > 3.5 ? '#DE8F05' : '#0173B2')
        .attr('rx', 2);
    
    // Chunk boundaries
    [15, 30, 45].forEach(pos => {
        svg.append('line')
            .attr('x1', x(pos))
            .attr('y1', margin.top)
            .attr('x2', x(pos))
            .attr('y2', height - margin.bottom)
            .attr('stroke', '#9B59B6')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,3');
    });
    
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => i % 10 === 0)))
        .attr('font-size', 12);
    
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5))
        .attr('font-size', 12);
    
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', 15)
        .text('Token position');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', 15)
        .text('NLL');
}

// ========== Slide 13: Tail Explain ==========
function renderTailExplain(container, config) {
    const numTokens = 40;
    const topK = 64;
    const data = Array.from({ length: numTokens }, (_, i) => ({
        token: i + 1,
        nll: 0.5 + Math.random() * 2 + (i > numTokens - 12 ? 3 + Math.random() * 2.5 : 0)
    })).sort((a, b) => a.nll - b.nll);
    
    const width = 800;
    const height = 320;
    const margin = { top: 30, right: 40, bottom: 60, left: 60 };
    
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
    
    const tailThreshold = data.length - 12;
    
    svg.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => x(d.token))
        .attr('y', d => y(d.nll))
        .attr('width', x.bandwidth())
        .attr('height', d => y(0) - y(d.nll))
        .attr('fill', (d, i) => i >= tailThreshold ? '#DE8F05' : '#E8E8E8')
        .attr('rx', 2);
    
    // Highlight tail region
    svg.append('rect')
        .attr('x', x(data[tailThreshold].token) - 6)
        .attr('y', margin.top)
        .attr('width', width - margin.right - x(data[tailThreshold].token) + 6)
        .attr('height', height - margin.top - margin.bottom)
        .attr('fill', 'rgba(222, 143, 5, 0.18)')
        .attr('stroke', '#DE8F05')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '8,4');
    
    svg.append('text')
        .attr('x', (x(data[tailThreshold].token) + width - margin.right) / 2)
        .attr('y', margin.top + 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', 18)
        .attr('font-weight', 700)
        .attr('fill', '#DE8F05')
        .text(`Top-${topK} Tail`);
    
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
        .attr('y', height - 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', 15)
        .text('Structural tokens (sorted by NLL)');
    
    // Formula note
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 1)
        .attr('text-anchor', 'middle')
        .attr('font-size', 13)
        .attr('fill', '#6C757D')
        .text('Final score direction unified in fusion');
}

// ========== Slide 14: Debias Two Cards ==========
function renderDebiasTwoCards(container, config) {
    const methods = [
        { name: 'Length-matched', desc: 'Pairing by n_struct', icon: '🎯', color: '#0173B2' },
        { name: 'Calibration', desc: 'Isotonic regression', icon: '📊', color: '#029E73' }
    ];
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; max-width: 900px; margin: 0 auto;';
    
    methods.forEach(method => {
        const card = document.createElement('div');
        card.style.cssText = `
            padding: 3rem; background: white;
            border: 4px solid ${method.color}; border-radius: 18px;
            text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        `;
        
        card.innerHTML = `
            <div style="font-size: 5rem; margin-bottom: 1.5rem;">${method.icon}</div>
            <div style="font-size: 1.9rem; font-weight: 700; margin-bottom: 1.2rem; color: ${method.color};">${method.name}</div>
            <div style="font-size: 1.3rem; color: #6C757D; line-height: 1.6;">${method.desc}</div>
        `;
        
        wrapper.appendChild(card);
    });
    
    container.appendChild(wrapper);
}

// ========== Slide 15: CV Composer Diagram ==========
function renderCvComposerDiagram(container, config) {
    const svg = d3.select(container)
        .append('svg')
        .attr('width', 700)
        .attr('height', 300)
        .attr('viewBox', '0 0 700 300');
    
    const composers = ['Bach', 'Mozart', 'Beethoven', 'Chopin', 'Brahms'];
    const folds = 5;
    
    composers.forEach((comp, i) => {
        const y = 50 + i * 48;
        
        // Label
        svg.append('text')
            .attr('x', 60)
            .attr('y', y + 20)
            .attr('text-anchor', 'end')
            .attr('font-size', 14)
            .attr('font-weight', 600)
            .text(comp);
        
        // Fold boxes
        for (let f = 0; f < folds; f++) {
            const x = 80 + f * 110;
            const isTest = f === i;
            
            svg.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('width', 100)
                .attr('height', 35)
                .attr('fill', isTest ? '#DE8F05' : '#E8E8E8')
                .attr('stroke', isTest ? '#DE8F05' : '#6C757D')
                .attr('stroke-width', 2)
                .attr('rx', 4);
            
            svg.append('text')
                .attr('x', x + 50)
                .attr('y', y + 22)
                .attr('text-anchor', 'middle')
                .attr('font-size', 12)
                .attr('font-weight', isTest ? 700 : 500)
                .attr('fill', isTest ? 'white' : '#212529')
                .text(isTest ? 'Test' : 'Train');
        }
    });
    
    // Legend
    svg.append('text')
        .attr('x', 350)
        .attr('y', 280)
        .attr('text-anchor', 'middle')
        .attr('font-size', 15)
        .attr('fill', '#6C757D')
        .text('Composer-stratified 5-fold CV');
}

// ========== Slide 16: Results Dashboard (with ROC zoom) ==========
function renderResultsDashboard(container, config) {
    container.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'max-width: 1100px; margin: 0 auto;';
    
    // Metrics row
    const metricsRow = document.createElement('div');
    metricsRow.className = 'results-metrics-row';
    
    const methods = [
        { name: 'Baseline', ...performanceData.baseline, color: '#6C757D' },
        { name: 'StructTail-64', ...performanceData.structtail64, color: '#DE8F05' },
        { name: 'StructTail+Fusion', ...performanceData.fusion, color: '#029E73' }
    ];
    
    methods.forEach(method => {
        const card = document.createElement('div');
        card.className = 'results-metric-card';
        card.style.borderLeftColor = method.color;
        
        card.innerHTML = `
            <div class="results-method-name">${method.name}</div>
            <div class="results-auc-big" style="color: ${method.color};">AUC ${method.auc.toFixed(3)}</div>
            <div class="results-tpr-small">
                <div>TPR@1%: <strong>${method.tpr_1fpr.toFixed(1)}%</strong></div>
                <div>TPR@5%: <strong>${method.tpr_5fpr.toFixed(1)}%</strong></div>
                <div>TPR@10%: <strong>${method.tpr_10fpr.toFixed(1)}%</strong></div>
            </div>
        `;
        
        metricsRow.appendChild(card);
    });
    
    wrapper.appendChild(metricsRow);
    
    // ROC section with zoom controls
    const rocSection = document.createElement('div');
    
    const controls = document.createElement('div');
    controls.style.cssText = 'display: flex; gap: 1.2rem; justify-content: center; margin-bottom: 1.5rem;';
    
    const btnFull = document.createElement('button');
    btnFull.textContent = 'Full View (0–100%)';
    btnFull.style.cssText = `
        padding: 0.9rem 2rem; border: 3px solid #0173B2;
        background: ${rocZoomState === 'full' ? '#0173B2' : 'white'};
        color: ${rocZoomState === 'full' ? 'white' : '#0173B2'};
        border-radius: 10px; font-weight: 700; cursor: pointer;
        transition: all 0.2s; font-size: 1.1rem;
    `;
    btnFull.onclick = () => {
        rocZoomState = 'full';
        renderResultsDashboard(container, config);
    };
    
    const btnZoom = document.createElement('button');
    btnZoom.textContent = 'Zoom Low-FPR (0–5%)';
    btnZoom.style.cssText = `
        padding: 0.9rem 2rem; border: 3px solid #DE8F05;
        background: ${rocZoomState === 'lowfpr' ? '#DE8F05' : 'white'};
        color: ${rocZoomState === 'lowfpr' ? 'white' : '#DE8F05'};
        border-radius: 10px; font-weight: 700; cursor: pointer;
        transition: all 0.2s; font-size: 1.1rem;
    `;
    btnZoom.onclick = () => {
        rocZoomState = 'lowfpr';
        renderResultsDashboard(container, config);
    };
    
    controls.appendChild(btnFull);
    controls.appendChild(btnZoom);
    rocSection.appendChild(controls);
    
    const rocChart = document.createElement('div');
    rocChart.id = 'roc-results-chart';
    rocSection.appendChild(rocChart);
    
    renderROCResults(rocChart, rocZoomState);
    
    wrapper.appendChild(rocSection);
    container.appendChild(wrapper);
}

function renderROCResults(container, zoomState) {
    const width = 750;
    const height = 450;
    const margin = { top: 30, right: 180, bottom: 70, left: 70 };
    
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
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickSize(-(height - margin.top - margin.bottom)).tickFormat(''))
        .style('stroke-opacity', 0.1);
    
    svg.append('g')
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
            .attr('stroke-dasharray', '6,4');
    }
    
    // Curves
    const methods = [
        { key: 'baseline', color: '#6C757D', label: 'Baseline', width: 3, auc: 0.563 },
        { key: 'structtail64', color: '#DE8F05', label: 'StructTail-64', width: 4, auc: 0.692 },
        { key: 'fusion', color: '#029E73', label: 'StructTail+Fusion', width: 5, auc: 0.826 }
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
        .attr('font-size', 13);
    
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(8).tickFormat(d => `${(d*100).toFixed(0)}%`))
        .attr('font-size', 13);
    
    // Labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .attr('font-weight', 600)
        .text('False Positive Rate');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 22)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .attr('font-weight', 600)
        .text('True Positive Rate');
    
    // Legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 170}, ${margin.top + 30})`);
    
    methods.forEach((method, i) => {
        const g = legend.append('g')
            .attr('transform', `translate(0, ${i * 35})`);
        
        g.append('line')
            .attr('x1', 0)
            .attr('x2', 35)
            .attr('stroke', method.color)
            .attr('stroke-width', method.width);
        
        g.append('text')
            .attr('x', 42)
            .attr('y', 0)
            .attr('dy', '0.35em')
            .attr('font-size', 13)
            .attr('font-weight', 600)
            .text(method.label);
        
        g.append('text')
            .attr('x', 42)
            .attr('y', 16)
            .attr('font-size', 11)
            .attr('fill', '#6C757D')
            .text(`AUC ${method.auc.toFixed(3)}`);
    });
}

// ========== Slide 17: Ablation Bars ==========
function renderAblationBars(container, config) {
    const topKData = ablationData.topK;
    const p95Data = ablationData.p95;
    
    const allData = [
        ...topKData.map(d => ({ ...d, label: `Top-${d.k}` })),
        { ...p95Data, label: '+Windowed p95' }
    ];
    
    const width = 750;
    const height = 380;
    const margin = { top: 30, right: 50, bottom: 70, left: 170 };
    
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
        .padding(0.25);
    
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
        .attr('x', d => x(d.auc) + 15)
        .attr('y', d => y(d.label) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('font-size', 20)
        .attr('font-weight', 700)
        .text(d => `AUC ${d.auc.toFixed(3)}`);
    
    svg.selectAll('.label')
        .data(allData)
        .join('text')
        .attr('x', margin.left - 12)
        .attr('y', d => y(d.label) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('font-size', 17)
        .attr('font-weight', 600)
        .text(d => d.label);
    
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .text('AUC (length-matched)');
}

// ========== Slide 18: Transfer And Workflow ==========
function renderTransferAndWorkflow(container, config) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; max-width: 1000px; margin: 0 auto;';
    
    // Left: Transfer bridge
    const leftDiv = document.createElement('div');
    
    const svg = d3.select(leftDiv)
        .append('svg')
        .attr('width', 450)
        .attr('height', 200)
        .attr('viewBox', '0 0 450 200');
    
    // From box
    svg.append('rect')
        .attr('x', 40)
        .attr('y', 60)
        .attr('width', 140)
        .attr('height', 70)
        .attr('fill', '#0173B2')
        .attr('rx', 10);
    
    svg.append('text')
        .attr('x', 110)
        .attr('y', 100)
        .attr('text-anchor', 'middle')
        .attr('font-size', 22)
        .attr('font-weight', 700)
        .attr('fill', 'white')
        .text('REMI');
    
    // Arrow
    svg.append('path')
        .attr('d', 'M 195 95 L 265 95')
        .attr('stroke', '#DE8F05')
        .attr('stroke-width', 5)
        .attr('marker-end', 'url(#transfer-arrow-final)');
    
    svg.append('text')
        .attr('x', 230)
        .attr('y', 80)
        .attr('text-anchor', 'middle')
        .attr('font-size', 13)
        .attr('font-weight', 600)
        .attr('fill', '#DE8F05')
        .text('Transfer');
    
    // To box
    svg.append('rect')
        .attr('x', 280)
        .attr('y', 60)
        .attr('width', 140)
        .attr('height', 70)
        .attr('fill', '#029E73')
        .attr('rx', 10);
    
    svg.append('text')
        .attr('x', 350)
        .attr('y', 100)
        .attr('text-anchor', 'middle')
        .attr('font-size', 22)
        .attr('font-weight', 700)
        .attr('fill', 'white')
        .text('ABC');
    
    svg.append('defs')
        .append('marker')
        .attr('id', 'transfer-arrow-final')
        .attr('markerWidth', 12)
        .attr('markerHeight', 12)
        .attr('refX', 11)
        .attr('refY', 3)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 12 3, 0 6')
        .attr('fill', '#DE8F05');
    
    // Metrics card
    const metricsCard = document.createElement('div');
    metricsCard.style.cssText = `
        margin-top: 1rem; padding: 1.5rem; background: white;
        border-radius: 12px; border: 3px solid #029E73; text-align: center;
    `;
    
    metricsCard.innerHTML = `
        <div style="font-size: 1.8rem; font-weight: 700; color: #029E73; margin-bottom: 0.5rem;">
            AUC 0.73 · TPR@1% 8.9%
        </div>
        <div style="font-size: 1rem; color: #6C757D;">NotaGen (raw view)</div>
    `;
    
    leftDiv.appendChild(metricsCard);
    
    // Right: Workflow
    const rightDiv = document.createElement('div');
    rightDiv.style.cssText = 'padding: 2rem; background: #F8F9FA; border-radius: 16px;';
    
    const workflow = document.createElement('div');
    workflow.innerHTML = `
        <h3 style="font-size: 1.8rem; margin-bottom: 1.5rem; color: #0173B2;">Auditor Workflow</h3>
        <ol style="font-size: 1.3rem; line-height: 2; padding-left: 1.8rem; color: #212529;">
            <li>Tokenize piece</li>
            <li>Query logits</li>
            <li>Compute TS-RaMIA score</li>
            <li>Compare to non-member reference</li>
        </ol>
    `;
    
    const qa = document.createElement('div');
    qa.style.cssText = 'margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #DEE2E6;';
    qa.innerHTML = `
        <h3 style="font-size: 2rem; text-align: center; color: #9B59B6; margin-bottom: 1rem;">Q&A</h3>
    `;
    
    rightDiv.appendChild(workflow);
    rightDiv.appendChild(qa);
    
    wrapper.appendChild(leftDiv);
    wrapper.appendChild(rightDiv);
    container.appendChild(wrapper);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { renderVisual };
}
