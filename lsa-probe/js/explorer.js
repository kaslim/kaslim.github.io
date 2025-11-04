/* Interactive Explorer for LSA-Probe */

let distributionChart, rocChart;

function initializeExplorer() {
    console.log('Initializing explorer...');
    
    // Setup timestep slider
    const slider = document.getElementById('timestep-slider');
    const currentValue = document.getElementById('current-t-value');
    
    slider.addEventListener('input', (e) => {
        const tRatio = parseFloat(e.target.value);
        currentValue.textContent = tRatio.toFixed(1);
        window.LSAProbe.currentTimestep = tRatio;
        updateExplorer(tRatio);
    });
    
    // Initialize charts (after a tick to ensure layout)
    requestAnimationFrame(() => {
        createDistributionChart();
        createROCChart();
        updateExplorer(window.LSAProbe.currentTimestep);
    });

    // Re-render on window resize
    window.addEventListener('resize', () => {
        createDistributionChart();
        createROCChart();
        updateExplorer(window.LSAProbe.currentTimestep);
    });
    
    console.log('✓ Explorer initialized');
}

function createDistributionChart() {
    const container = d3.select('#distribution-chart');
    container.selectAll('*').remove();
    
    let width = container.node().getBoundingClientRect().width;
    if (!width || width < 10) {
        width = container.node().parentElement?.getBoundingClientRect().width || 800;
    }
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Store for later updates
    distributionChart = { svg, g, width: innerWidth, height: innerHeight, margin };
}

function updateDistributionChart(tRatio) {
    const costs = getCostsForTimestep(tRatio);
    const { g, width, height } = distributionChart;
    
    g.selectAll('*').remove();
    
    // Prepare histogram data
    const bins = d3.bin()
        .domain([0, 1])
        .thresholds(30);
    
    const memberBins = bins(costs.members);
    const nonMemberBins = bins(costs.non_members);
    
    // Scales
    const x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width]);
    
    const maxCount = Math.max(
        d3.max(memberBins, d => d.length) || 0,
        d3.max(nonMemberBins, d => d.length) || 0
    );
    
    const y = d3.scaleLinear()
        .domain([0, maxCount * 1.1])
        .range([height, 0]);
    
    // Grid
    g.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat('')
        );
    
    // X axis
    g.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10))
        .append('text')
        .attr('x', width / 2)
        .attr('y', 40)
        .attr('fill', '#a0a0a0')
        .attr('text-anchor', 'middle')
        .text('Adversarial Cost');
    
    // Y axis
    g.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .attr('fill', '#a0a0a0')
        .attr('text-anchor', 'middle')
        .text('Count');
    
    // Member bars (blue)
    g.selectAll('.bar-member')
        .data(memberBins)
        .join('rect')
        .attr('class', 'bar-member histogram-bar')
        .attr('x', d => x(d.x0))
        .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr('y', height)
        .attr('height', 0)
        .attr('fill', '#0173B2')
        .attr('opacity', 0.7)
        .transition()
        .duration(500)
        .attr('y', d => y(d.length))
        .attr('height', d => height - y(d.length));
    
    // Non-member bars (orange)
    g.selectAll('.bar-nonmember')
        .data(nonMemberBins)
        .join('rect')
        .attr('class', 'bar-nonmember histogram-bar')
        .attr('x', d => x(d.x0))
        .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr('y', height)
        .attr('height', 0)
        .attr('fill', '#DE8F05')
        .attr('opacity', 0.5)
        .transition()
        .duration(500)
        .attr('y', d => y(d.length))
        .attr('height', d => height - y(d.length));
    
    // Means
    const memberMean = d3.mean(costs.members);
    const nonMemberMean = d3.mean(costs.non_members);
    
    // Member mean line
    g.append('line')
        .attr('x1', x(memberMean))
        .attr('x2', x(memberMean))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#0173B2')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0)
        .transition()
        .duration(500)
        .attr('opacity', 1);
    
    // Non-member mean line
    g.append('line')
        .attr('x1', x(nonMemberMean))
        .attr('x2', x(nonMemberMean))
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#DE8F05')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0)
        .transition()
        .duration(500)
        .attr('opacity', 1);
}

function createROCChart() {
    const container = d3.select('#roc-chart');
    container.selectAll('*').remove();
    
    let width = container.node().getBoundingClientRect().width;
    if (!width || width < 10) {
        width = container.node().parentElement?.getBoundingClientRect().width || 800;
    }
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    rocChart = { svg, g, width: innerWidth, height: innerHeight, margin };
}

function updateROCChart(tRatio) {
    const rocData = getROCForTimestep(tRatio);
    const { g, width, height } = rocChart;
    
    g.selectAll('*').remove();
    
    // Scales
    const x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width]);
    
    const y = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);
    
    // Grid
    g.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat('')
        );
    
    g.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickSize(-height)
            .tickFormat('')
        );
    
    // Axes
    g.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d => (d * 100) + '%'))
        .append('text')
        .attr('x', width / 2)
        .attr('y', 40)
        .attr('fill', '#a0a0a0')
        .attr('text-anchor', 'middle')
        .text('False Positive Rate');
    
    g.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).ticks(10).tickFormat(d => (d * 100) + '%'))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .attr('fill', '#a0a0a0')
        .attr('text-anchor', 'middle')
        .text('True Positive Rate');
    
    // Diagonal reference line (random classifier)
    g.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', height)
        .attr('y2', 0)
        .attr('stroke', '#666')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5')
        .attr('opacity', 0.5);
    
    // ROC curve
    const line = d3.line()
        .x(d => x(d[0]))
        .y(d => y(d[1]))
        .curve(d3.curveMonotoneX);
    
    const rocPoints = rocData.fpr.map((fpr, i) => [fpr, rocData.tpr[i]]);
    
    const path = g.append('path')
        .datum(rocPoints)
        .attr('class', 'roc-line')
        .attr('d', line)
        .attr('stroke', '#0173B2')
        .attr('stroke-width', 3)
        .attr('fill', 'none');
    
    // Animate path
    const pathLength = path.node().getTotalLength();
    path.attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(1000)
        .attr('stroke-dashoffset', 0);
    
    // Fill area under curve
    const area = d3.area()
        .x(d => x(d[0]))
        .y0(height)
        .y1(d => y(d[1]))
        .curve(d3.curveMonotoneX);
    
    g.append('path')
        .datum(rocPoints)
        .attr('d', area)
        .attr('fill', '#0173B2')
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .attr('opacity', 0.2);
    
    // Highlight points at specific FPRs
    const fprTargets = [0.001, 0.01, 0.05];
    fprTargets.forEach(fpr => {
        const idx = rocData.fpr.findIndex(f => f >= fpr);
        if (idx >= 0) {
            g.append('circle')
                .attr('class', 'roc-point')
                .attr('cx', x(rocData.fpr[idx]))
                .attr('cy', y(rocData.tpr[idx]))
                .attr('r', 0)
                .attr('fill', '#029E73')
                .attr('stroke', '#0d0d0d')
                .attr('stroke-width', 2)
                .transition()
                .duration(1000)
                .attr('r', 5);
        }
    });
    
    // Update metrics display
    document.getElementById('current-auc').textContent = rocData.auc.toFixed(3);
    document.getElementById('tpr-01').textContent = formatPercent(rocData.tpr_at_0.1_fpr || 0);
    document.getElementById('tpr-1').textContent = formatPercent(rocData.tpr_at_1_fpr || 0);
    document.getElementById('tpr-5').textContent = formatPercent(rocData.tpr_at_5_fpr || 0);
}

function updateExplorer(tRatio) {
    console.log(`Updating explorer for t_ratio=${tRatio}`);
    updateDistributionChart(tRatio);
    updateROCChart(tRatio);
}

// Export
window.initializeExplorer = initializeExplorer;

