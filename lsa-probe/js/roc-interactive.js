/* Results Visualization and Initialization */

function initializeBaselines() {
    const data = window.LSAProbe.data.baselines;
    if (!data) {
        console.warn('Baselines data not loaded');
        return;
    }
    
    createBaselineComparisonChart(data);
}

function createBaselineComparisonChart(data) {
    const container = d3.select('#baseline-comparison-chart');
    container.selectAll('*').remove();
    
    const width = container.node().getBoundingClientRect().width;
    const height = 300;
    const margin = { top: 20, right: 120, bottom: 50, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Data preparation
    const methods = Object.keys(data.data);
    const values = methods.map(m => data.data[m].tpr_1);
    
    // Scales
    const x = d3.scaleBand()
        .domain(methods)
        .range([0, innerWidth])
        .padding(0.3);
    
    const y = d3.scaleLinear()
        .domain([0, Math.max(...values) * 1.2])
        .range([innerHeight, 0]);
    
    // Grid
    g.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(y)
            .tickSize(-innerWidth)
            .tickFormat('')
        );
    
    // Axes
    g.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-15)')
        .style('text-anchor', 'end')
        .style('fill', '#a0a0a0');
    
    g.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).tickFormat(d => (d * 100).toFixed(0) + '%'))
        .selectAll('text')
        .style('fill', '#a0a0a0');
    
    // Y-axis label
    g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -60)
        .attr('text-anchor', 'middle')
        .attr('fill', '#a0a0a0')
        .text('TPR @ 1% FPR');
    
    // Bars
    g.selectAll('.bar')
        .data(methods)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d))
        .attr('width', x.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('fill', (d, i) => i === methods.length - 1 ? '#0173B2' : '#666')
        .attr('opacity', 0.8)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr('y', d => y(data.data[d].tpr_1))
        .attr('height', d => innerHeight - y(data.data[d].tpr_1));
    
    // Value labels
    g.selectAll('.label')
        .data(methods)
        .join('text')
        .attr('class', 'label')
        .attr('x', d => x(d) + x.bandwidth() / 2)
        .attr('y', d => y(data.data[d].tpr_1) - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('opacity', 0)
        .text(d => (data.data[d].tpr_1 * 100).toFixed(1) + '%')
        .transition()
        .duration(800)
        .delay((d, i) => i * 100 + 400)
        .attr('opacity', 1);
}

function initializeResults() {
    createMainResultsTable();
    createBudgetAblationChart();
    createMetricComparisonChart();
}

function createMainResultsTable() {
    const data = window.LSAProbe.data.mainResults;
    if (!data) {
        console.warn('Main results data not loaded');
        return;
    }
    
    const container = d3.select('#main-results-table');
    container.selectAll('*').remove();
    
    // Create HTML table
    const table = container.append('table')
        .style('width', '100%')
        .style('border-collapse', 'collapse')
        .style('color', '#ffffff');
    
    // Header
    const thead = table.append('thead');
    const headerRow = thead.append('tr');
    ['Model-Dataset', 'Best Baseline (TPR@1%)', 'LSA-Probe (TPR@1%)', 'Improvement', 'AUC (Ours)']
        .forEach(h => {
            headerRow.append('th')
                .style('padding', '1rem')
                .style('border-bottom', '2px solid #0173B2')
                .style('text-align', 'left')
                .style('color', '#a0a0a0')
                .text(h);
        });
    
    // Body
    const tbody = table.append('tbody');
    Object.keys(data.data).forEach((model, i) => {
        const row = tbody.append('tr')
            .style('opacity', 0)
            .style('border-bottom', '1px solid rgba(255, 255, 255, 0.1)');
        
        const d = data.data[model];
        
        row.append('td')
            .style('padding', '1rem')
            .style('font-weight', 'bold')
            .text(model.replace('_', ' '));
        
        row.append('td')
            .style('padding', '1rem')
            .text(formatPercent(d.best_baseline.tpr_1));
        
        row.append('td')
            .style('padding', '1rem')
            .style('color', '#0173B2')
            .style('font-weight', 'bold')
            .text(formatPercent(d.ours.tpr_1));
        
        row.append('td')
            .style('padding', '1rem')
            .style('color', '#029E73')
            .style('font-weight', 'bold')
            .text('+' + formatPercent(d.delta_tpr));
        
        row.append('td')
            .style('padding', '1rem')
            .text(d.ours.auc.toFixed(3));
        
        // Animate row
        row.transition()
            .duration(500)
            .delay(i * 100)
            .style('opacity', 1);
    });
}

function createBudgetAblationChart() {
    const data = window.LSAProbe.data.budgetAblation;
    if (!data) {
        console.warn('Budget ablation data not loaded');
        return;
    }
    
    const container = d3.select('#budget-ablation-chart');
    container.selectAll('*').remove();
    
    const width = container.node().getBoundingClientRect().width;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleLinear()
        .domain([0, Math.max(...data.data.map(d => d.budget))])
        .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
        .domain([0, Math.max(...data.data.map(d => d.tpr_1)) * 1.1])
        .range([innerHeight, 0]);
    
    // Grid
    g.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(y)
            .tickSize(-innerWidth)
            .tickFormat('')
        );
    
    // Axes
    g.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(8))
        .selectAll('text')
        .style('fill', '#a0a0a0');
    
    g.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).tickFormat(d => (d * 100).toFixed(0) + '%'))
        .selectAll('text')
        .style('fill', '#a0a0a0');
    
    // Labels
    g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 40)
        .attr('text-anchor', 'middle')
        .attr('fill', '#a0a0a0')
        .text('Budget η_max');
    
    g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .attr('fill', '#a0a0a0')
        .text('TPR @ 1% FPR');
    
    // Line
    const line = d3.line()
        .x(d => x(d.budget))
        .y(d => y(d.tpr_1))
        .curve(d3.curveMonotoneX);
    
    const path = g.append('path')
        .datum(data.data)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', '#0173B2')
        .attr('stroke-width', 3);
    
    // Animate
    const pathLength = path.node().getTotalLength();
    path.attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(1500)
        .attr('stroke-dashoffset', 0);
    
    // Points
    g.selectAll('.point')
        .data(data.data)
        .join('circle')
        .attr('class', 'point')
        .attr('cx', d => x(d.budget))
        .attr('cy', d => y(d.tpr_1))
        .attr('r', 0)
        .attr('fill', '#029E73')
        .attr('stroke', '#0d0d0d')
        .attr('stroke-width', 2)
        .transition()
        .duration(500)
        .delay((d, i) => 1500 + i * 50)
        .attr('r', 5);
}

function createMetricComparisonChart() {
    const data = window.LSAProbe.data.metricComparison;
    if (!data) {
        console.warn('Metric comparison data not loaded');
        return;
    }
    
    const container = d3.select('#metric-comparison-chart');
    container.selectAll('*').remove();
    
    const width = container.node().getBoundingClientRect().width;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Data
    const metrics = Object.keys(data.data);
    const values = metrics.map(m => data.data[m].tpr_1);
    
    // Scales
    const x = d3.scaleBand()
        .domain(metrics)
        .range([0, innerWidth])
        .padding(0.3);
    
    const y = d3.scaleLinear()
        .domain([0, Math.max(...values) * 1.2])
        .range([innerHeight, 0]);
    
    // Grid
    g.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(d3.axisLeft(y)
            .tickSize(-innerWidth)
            .tickFormat('')
        );
    
    // Axes
    g.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-30)')
        .style('text-anchor', 'end')
        .style('fill', '#a0a0a0');
    
    g.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).tickFormat(d => (d * 100).toFixed(0) + '%'))
        .selectAll('text')
        .style('fill', '#a0a0a0');
    
    // Y-axis label
    g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .attr('fill', '#a0a0a0')
        .text('TPR @ 1% FPR');
    
    // Bars
    g.selectAll('.bar')
        .data(metrics)
        .join('rect')
        .attr('x', d => x(d))
        .attr('width', x.bandwidth())
        .attr('y', innerHeight)
        .attr('height', 0)
        .attr('fill', (d, i) => i === 0 ? '#0173B2' : '#666')
        .attr('opacity', 0.8)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .attr('y', d => y(data.data[d].tpr_1))
        .attr('height', d => innerHeight - y(data.data[d].tpr_1));
    
    // Labels
    g.selectAll('.label')
        .data(metrics)
        .join('text')
        .attr('x', d => x(d) + x.bandwidth() / 2)
        .attr('y', d => y(data.data[d].tpr_1) - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('opacity', 0)
        .text(d => (data.data[d].tpr_1 * 100).toFixed(1) + '%')
        .transition()
        .duration(800)
        .delay((d, i) => i * 100 + 400)
        .attr('opacity', 1);
}

// Export
window.initializeBaselines = initializeBaselines;
window.initializeResults = initializeResults;

