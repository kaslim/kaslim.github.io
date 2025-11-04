/**
 * TS-RaMIA D3.js Visualizations
 * Handles all chart and graph rendering
 */

// Wait for data to load
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for data to load from main.js
    setTimeout(() => {
        initAllVisualizations();
    }, 500);
});

/**
 * Initialize all visualizations
 */
function initAllVisualizations() {
    initTopKChart();
    initTemperatureChart();
    initROCChart();
}

/**
 * Initialize Top-k Scoring Visualization
 */
function initTopKChart() {
    const container = d3.select('#topk-chart');
    if (container.empty()) return;
    
    // Clear any existing content
    container.html('');
    
    // Sample data for demonstration
    const data = Array.from({length: 200}, (_, i) => ({
        token: i,
        score: Math.random() * 5 + 1,
        isTopK: i >= 136 // Top 64 tokens
    })).sort((a, b) => b.score - a.score);
    
    // Set dimensions
    const margin = {top: 20, right: 20, bottom: 40, left: 50};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.token))
        .range([0, width])
        .padding(0.1);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.score)])
        .nice()
        .range([height, 0]);
    
    // Add axes
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickValues([]));
    
    svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(y).ticks(5));
    
    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#6C757D')
        .text('NLL Score');
    
    // Add bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.token))
        .attr('y', height)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', d => d.isTopK ? '#DE8F05' : '#E8E8E8')
        .attr('opacity', 0.8)
        .transition()
        .duration(1000)
        .delay((d, i) => i * 2)
        .attr('y', d => y(d.score))
        .attr('height', d => height - y(d.score));
    
    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 150}, 10)`);
    
    legend.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', '#DE8F05');
    
    legend.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('font-size', '12px')
        .text('Top-64 Tokens');
    
    legend.append('rect')
        .attr('y', 20)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', '#E8E8E8');
    
    legend.append('text')
        .attr('x', 20)
        .attr('y', 32)
        .style('font-size', '12px')
        .text('Other Tokens');
}

/**
 * Initialize Temperature Fusion Visualization
 */
function initTemperatureChart() {
    const container = d3.select('#temperature-chart');
    if (container.empty()) return;
    
    container.html('');
    
    // Sample data
    const temperatures = [0.8, 1.0, 1.2, 1.5];
    const samples = ['Sample 1', 'Sample 2', 'Sample 3', 'Sample 4', 'Sample 5'];
    
    const data = samples.flatMap(sample => 
        temperatures.map(temp => ({
            sample,
            temperature: temp,
            score: Math.random() * 4 + 2
        }))
    );
    
    // Set dimensions
    const margin = {top: 20, right: 80, bottom: 40, left: 60};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleLinear()
        .domain(d3.extent(temperatures))
        .range([0, width]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.score)])
        .nice()
        .range([height, 0]);
    
    const color = d3.scaleOrdinal()
        .domain(samples)
        .range(['#0173B2', '#DE8F05', '#029E73', '#CC78BC', '#CA9161']);
    
    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d => `T=${d}`));
    
    svg.append('g')
        .call(d3.axisLeft(y));
    
    // Add labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 35)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#6C757D')
        .text('Temperature');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .style('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#6C757D')
        .text('Score');
    
    // Group data by sample
    const nested = d3.group(data, d => d.sample);
    
    // Line generator
    const line = d3.line()
        .x(d => x(d.temperature))
        .y(d => y(d.score))
        .curve(d3.curveMonotoneX);
    
    // Draw lines
    nested.forEach((values, key) => {
        const path = svg.append('path')
            .datum(values)
            .attr('fill', 'none')
            .attr('stroke', color(key))
            .attr('stroke-width', 2)
            .attr('d', line);
        
        // Animate line drawing
        const totalLength = path.node().getTotalLength();
        path
            .attr('stroke-dasharray', totalLength + ' ' + totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(2000)
            .attr('stroke-dashoffset', 0);
        
        // Add dots
        svg.selectAll(`.dot-${key.replace(/\s/g, '')}`)
            .data(values)
            .enter()
            .append('circle')
            .attr('class', `dot-${key.replace(/\s/g, '')}`)
            .attr('cx', d => x(d.temperature))
            .attr('cy', d => y(d.score))
            .attr('r', 0)
            .attr('fill', color(key))
            .transition()
            .delay(2000)
            .duration(300)
            .attr('r', 4);
    });
    
    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width + 10}, 0)`);
    
    samples.forEach((sample, i) => {
        const g = legend.append('g')
            .attr('transform', `translate(0, ${i * 20})`);
        
        g.append('line')
            .attr('x1', 0)
            .attr('x2', 15)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke', color(sample))
            .attr('stroke-width', 2);
        
        g.append('text')
            .attr('x', 20)
            .attr('y', 4)
            .style('font-size', '10px')
            .text(sample);
    });
}

/**
 * Initialize ROC Curve Visualization
 */
function initROCChart() {
    const container = d3.select('#roc-chart');
    if (container.empty() || !window.appState.rocData) {
        setTimeout(initROCChart, 500);
        return;
    }
    
    container.html('');
    
    const data = window.appState.rocData;
    
    // Set dimensions
    const margin = {top: 20, right: 120, bottom: 50, left: 60};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    let xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, width]);
    
    let yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);
    
    // Axes
    const xAxis = svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(10));
    
    const yAxis = svg.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale).ticks(10));
    
    // Axis labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 40)
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', '500')
        .text('False Positive Rate');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', '500')
        .text('True Positive Rate');
    
    // Line generator
    const lineGenerator = d3.line()
        .x(d => xScale(d.fpr))
        .y(d => yScale(d.tpr))
        .curve(d3.curveLinear);
    
    // Store paths for toggling
    const paths = {};
    
    // Draw ROC curves
    Object.entries(data).forEach(([key, methodData]) => {
        const path = svg.append('path')
            .datum(methodData.points)
            .attr('class', `roc-line roc-line-${key}`)
            .attr('fill', 'none')
            .attr('stroke', methodData.color)
            .attr('stroke-width', key === 'random' ? 1.5 : 2.5)
            .attr('stroke-dasharray', key === 'random' ? '5,5' : 'none')
            .attr('d', lineGenerator)
            .attr('opacity', 0.9);
        
        paths[key] = path;
        
        // Animate line drawing
        const totalLength = path.node().getTotalLength();
        path
            .attr('stroke-dasharray', totalLength + ' ' + totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(1500)
            .delay(key === 'baseline' ? 0 : key === 'structtail64' ? 200 : key === 'fusion' ? 400 : 600)
            .attr('stroke-dashoffset', 0)
            .attr('stroke-dasharray', key === 'random' ? '5,5' : 'none');
    });
    
    // Add legend
    const legend = svg.append('g')
        .attr('class', 'roc-legend')
        .attr('transform', `translate(${width + 10}, 0)`);
    
    Object.entries(data).forEach(([key, methodData], i) => {
        const g = legend.append('g')
            .attr('transform', `translate(0, ${i * 25})`)
            .attr('class', `legend-item legend-${key}`)
            .style('cursor', 'pointer')
            .on('click', function() {
                toggleROCLine(key, paths[key]);
            });
        
        g.append('line')
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke', methodData.color)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', key === 'random' ? '5,5' : 'none');
        
        g.append('text')
            .attr('x', 25)
            .attr('y', 4)
            .style('font-size', '12px')
            .style('font-weight', '500')
            .text(`${methodData.name} (${methodData.auc.toFixed(3)})`);
    });
    
    // Setup toggle functionality
    d3.select('#toggle-baseline').on('change', function() {
        toggleROCLine('baseline', paths.baseline);
    });
    
    d3.select('#toggle-structtail64').on('change', function() {
        toggleROCLine('structtail64', paths.structtail64);
    });
    
    d3.select('#toggle-fusion').on('change', function() {
        toggleROCLine('fusion', paths.fusion);
    });
    
    // Zoom functionality
    d3.select('#zoom-lowfpr').on('click', function() {
        xScale.domain([0, 0.05]);
        yScale.domain([0, 0.5]);
        
        xAxis.transition().duration(750).call(d3.axisBottom(xScale).ticks(10).tickFormat(d => `${(d * 100).toFixed(1)}%`));
        yAxis.transition().duration(750).call(d3.axisLeft(yScale).ticks(10).tickFormat(d => `${(d * 100).toFixed(1)}%`));
        
        Object.values(paths).forEach(path => {
            path.transition().duration(750).attr('d', lineGenerator);
        });
    });
    
    d3.select('#zoom-reset').on('click', function() {
        xScale.domain([0, 1]);
        yScale.domain([0, 1]);
        
        xAxis.transition().duration(750).call(d3.axisBottom(xScale).ticks(10).tickFormat(d => d));
        yAxis.transition().duration(750).call(d3.axisLeft(yScale).ticks(10).tickFormat(d => d));
        
        Object.values(paths).forEach(path => {
            path.transition().duration(750).attr('d', lineGenerator);
        });
    });
}

/**
 * Toggle ROC line visibility
 */
function toggleROCLine(key, path) {
    const currentOpacity = path.attr('opacity');
    const newOpacity = parseFloat(currentOpacity) > 0 ? 0 : 0.9;
    path.transition().duration(300).attr('opacity', newOpacity);
    
    d3.select(`.legend-${key}`).style('opacity', newOpacity > 0 ? 1 : 0.3);
}

// Make functions available globally if needed
window.initROCChart = initROCChart;
window.initTopKChart = initTopKChart;
window.initTemperatureChart = initTemperatureChart;

