/**
 * MAIA Demo - Visualizations
 * D3.js-based charts and visualizations
 */

document.addEventListener('DOMContentLoaded', () => {
    const checkDataInterval = setInterval(() => {
        if (window.isDataLoaded && window.isDataLoaded()) {
            clearInterval(checkDataInterval);
            initVisualizations();
        }
    }, 100);
});

function initVisualizations() {
    console.log('📊 Initializing visualizations...');
    createASRChart();
    createQualityChart();
    console.log('✅ Visualizations initialized');
}

/**
 * Create Attack Success Rate comparison chart
 */
function createASRChart() {
    const container = document.getElementById('chart-asr');
    if (!container) return;
    
    const metrics = window.MAIAState.metrics;
    const width = container.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    
    const data = [
        { method: 'PGD', asr: metrics.csi_whitebox.asr[0], type: 'White-box' },
        { method: 'C&W', asr: metrics.csi_whitebox.asr[1], type: 'White-box' },
        { method: 'MAIA-WB', asr: metrics.csi_whitebox.asr[2], type: 'White-box' },
        { method: 'NES', asr: metrics.csi_blackbox.asr[0], type: 'Black-box' },
        { method: 'ZOO', asr: metrics.csi_blackbox.asr[1], type: 'Black-box' },
        { method: 'MAIA-BB', asr: metrics.csi_blackbox.asr[2], type: 'Black-box' }
    ];
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const x = d3.scaleBand()
        .domain(data.map(d => d.method))
        .range([margin.left, width - margin.right])
        .padding(0.2);
    
    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.bottom, margin.top]);
    
    const color = d3.scaleOrdinal()
        .domain(['White-box', 'Black-box'])
        .range(['#0173B2', '#029E73']);
    
    svg.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => x(d.method))
        .attr('y', height - margin.bottom)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', d => d.method.includes('MAIA') ? color(d.type) : '#DE8F05')
        .attr('rx', 4)
        .transition()
        .duration(800)
        .attr('y', d => y(d.asr))
        .attr('height', d => height - margin.bottom - y(d.asr));
    
    svg.selectAll('text.value')
        .data(data)
        .join('text')
        .attr('class', 'value')
        .attr('x', d => x(d.method) + x.bandwidth() / 2)
        .attr('y', d => y(d.asr) - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#212529')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(d => `${d.asr}%`);
    
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-15)')
        .style('text-anchor', 'end');
    
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));
    
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('Method');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('Attack Success Rate (%)');
}

/**
 * Create Perceptual Quality vs Attack Success scatter plot
 */
function createQualityChart() {
    const container = document.getElementById('chart-quality');
    if (!container) return;
    
    const metrics = window.MAIAState.metrics;
    const width = container.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    
    const data = [
        { method: 'PGD', asr: metrics.csi_whitebox.asr[0], mos: metrics.csi_whitebox.mos[0], type: 'White-box' },
        { method: 'C&W', asr: metrics.csi_whitebox.asr[1], mos: metrics.csi_whitebox.mos[1], type: 'White-box' },
        { method: 'MAIA-WB', asr: metrics.csi_whitebox.asr[2], mos: metrics.csi_whitebox.mos[2], type: 'White-box' },
        { method: 'NES', asr: metrics.csi_blackbox.asr[0], mos: metrics.csi_blackbox.mos[0], type: 'Black-box' },
        { method: 'ZOO', asr: metrics.csi_blackbox.asr[1], mos: metrics.csi_blackbox.mos[1], type: 'Black-box' },
        { method: 'MAIA-BB', asr: metrics.csi_blackbox.asr[2], mos: metrics.csi_blackbox.mos[2], type: 'Black-box' }
    ];
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    const x = d3.scaleLinear()
        .domain([0, 100])
        .range([margin.left, width - margin.right]);
    
    const y = d3.scaleLinear()
        .domain([0, 5])
        .range([height - margin.bottom, margin.top]);
    
    const color = d3.scaleOrdinal()
        .domain(['White-box', 'Black-box'])
        .range(['#0173B2', '#029E73']);
    
    svg.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => x(d.asr))
        .attr('cy', d => y(d.mos))
        .attr('r', 0)
        .attr('fill', d => d.method.includes('MAIA') ? color(d.type) : '#DE8F05')
        .attr('opacity', 0.8)
        .transition()
        .duration(800)
        .attr('r', 8);
    
    svg.selectAll('text.label')
        .data(data)
        .join('text')
        .attr('class', 'label')
        .attr('x', d => x(d.asr))
        .attr('y', d => y(d.mos) - 12)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#212529')
        .text(d => d.method);
    
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`));
    
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5));
    
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('Attack Success Rate (%)');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('Perceptual Quality (MOS)');
}

window.initVisualizations = initVisualizations;

