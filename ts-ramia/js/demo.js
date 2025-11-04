/**
 * TS-RaMIA Interactive Demo
 * Handles the interactive attack demonstration
 */

// Demo state
const demoState = {
    currentSample: null,
    isRunning: false,
    currentStep: 0
};

// Initialize demo when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initDemo, 600);
});

/**
 * Initialize the interactive demo
 */
function initDemo() {
    if (!window.appState.samples || window.appState.samples.length === 0) {
        setTimeout(initDemo, 500);
        return;
    }
    
    populateSampleSelector();
    setupEventListeners();
}

/**
 * Populate the sample selector dropdown
 */
function populateSampleSelector() {
    const selector = document.getElementById('sample-selector');
    if (!selector) return;
    
    window.appState.samples.forEach((sample, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${sample.name} (${sample.composer})`;
        selector.appendChild(option);
    });
}

/**
 * Setup event listeners for demo controls
 */
function setupEventListeners() {
    const selector = document.getElementById('sample-selector');
    const runButton = document.getElementById('run-attack-btn');
    
    if (selector) {
        selector.addEventListener('change', handleSampleSelection);
    }
    
    if (runButton) {
        runButton.addEventListener('click', runAttack);
    }
}

/**
 * Handle sample selection
 */
function handleSampleSelection(event) {
    const index = event.target.value;
    
    if (index === '') {
        hideElementsByClassName('sample-info');
        document.getElementById('run-attack-btn').disabled = true;
        demoState.currentSample = null;
        return;
    }
    
    demoState.currentSample = window.appState.samples[index];
    displaySampleInfo(demoState.currentSample);
    document.getElementById('run-attack-btn').disabled = false;
    
    // Reset result display
    const resultDisplay = document.getElementById('result-display');
    if (resultDisplay) {
        resultDisplay.innerHTML = '<div class="result-placeholder">Click "Run Attack" to see results</div>';
    }
}

/**
 * Display sample information
 */
function displaySampleInfo(sample) {
    const infoPanel = document.getElementById('sample-info');
    if (!infoPanel) return;
    
    infoPanel.style.display = 'block';
    
    document.getElementById('info-composer').textContent = sample.composer;
    document.getElementById('info-tokens').textContent = sample.n_tokens.toLocaleString();
    document.getElementById('info-struct-tokens').textContent = sample.n_struct_tokens.toLocaleString();
    
    const labelElement = document.getElementById('info-label');
    labelElement.textContent = sample.true_label === 'member' ? 'Training Sample' : 'Non-Training';
    labelElement.style.color = sample.true_label === 'member' ? '#029E73' : '#6C757D';
    labelElement.style.fontWeight = '600';
    
    document.getElementById('abc-snippet').textContent = sample.abc_snippet;
}

/**
 * Run the attack simulation
 */
async function runAttack() {
    if (!demoState.currentSample || demoState.isRunning) return;
    
    demoState.isRunning = true;
    demoState.currentStep = 0;
    
    const button = document.getElementById('run-attack-btn');
    button.disabled = true;
    button.textContent = 'Running Attack...';
    
    // Clear previous results
    clearAttackProgress();
    clearTokenScoresChart();
    
    // Step 1: Analyze tokens
    await animateStep(1, 'Analyzing Tokens...');
    await sleep(800);
    
    // Step 2: Compute scores
    await animateStep(2, 'Computing Scores...');
    drawTokenScoresChart(demoState.currentSample.token_scores);
    await sleep(1000);
    
    // Step 3: Select Top-64
    await animateStep(3, 'Selecting Top-64...');
    highlightTopKTokens(demoState.currentSample.token_scores);
    await sleep(800);
    
    // Step 4: Fuse results
    await animateStep(4, 'Fusing Results...');
    await sleep(800);
    
    // Display final result
    displayAttackResult(demoState.currentSample);
    
    // Reset button
    button.disabled = false;
    button.textContent = 'Run Attack';
    demoState.isRunning = false;
}

/**
 * Animate attack progress step
 */
async function animateStep(stepNumber, message) {
    const steps = document.querySelectorAll('.progress-step');
    if (steps.length === 0) return;
    
    // Deactivate all steps
    steps.forEach(step => step.classList.remove('active'));
    
    // Activate current step
    const currentStep = steps[stepNumber - 1];
    if (currentStep) {
        currentStep.classList.add('active');
        currentStep.querySelector('.step-name').textContent = message;
    }
    
    demoState.currentStep = stepNumber;
}

/**
 * Clear attack progress
 */
function clearAttackProgress() {
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach(step => step.classList.remove('active'));
}

/**
 * Draw token scores chart
 */
function drawTokenScoresChart(scores) {
    const container = d3.select('#token-scores-chart');
    if (container.empty()) return;
    
    container.html('');
    
    // Take first 70 tokens for visualization
    const data = scores.slice(0, 70).map((score, i) => ({
        index: i,
        score: score
    })).sort((a, b) => b.score - a.score);
    
    // Set dimensions
    const margin = {top: 10, right: 10, bottom: 30, left: 40};
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.index))
        .range([0, width])
        .padding(0.1);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.score)])
        .nice()
        .range([height, 0]);
    
    // Add bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.index))
        .attr('y', height)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .attr('fill', '#0173B2')
        .attr('opacity', 0.7)
        .transition()
        .duration(500)
        .delay((d, i) => i * 5)
        .attr('y', d => y(d.score))
        .attr('height', d => height - y(d.score));
    
    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(y).ticks(5));
    
    // Add Y label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 10)
        .attr('x', -height / 2)
        .style('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('fill', '#6C757D')
        .text('NLL Score');
}

/**
 * Highlight Top-k tokens in the chart
 */
function highlightTopKTokens(scores) {
    const container = d3.select('#token-scores-chart');
    if (container.empty()) return;
    
    // Highlight top 64 tokens
    container.selectAll('.bar')
        .transition()
        .duration(600)
        .attr('fill', (d, i) => i < 64 ? '#DE8F05' : '#E8E8E8')
        .attr('opacity', (d, i) => i < 64 ? 1 : 0.3);
}

/**
 * Clear token scores chart
 */
function clearTokenScoresChart() {
    const container = d3.select('#token-scores-chart');
    if (!container.empty()) {
        container.html('');
    }
}

/**
 * Display attack result
 */
function displayAttackResult(sample) {
    const resultDisplay = document.getElementById('result-display');
    if (!resultDisplay) return;
    
    const scores = sample.scores;
    const prediction = scores.fusion > 0.5 ? 'member' : 'non-member';
    const isCorrect = prediction === sample.true_label;
    
    resultDisplay.innerHTML = `
        <div class="attack-result">
            <div class="result-header">
                <h4>Attack Result</h4>
            </div>
            
            <div class="result-scores">
                <div class="score-item">
                    <div class="score-label">Baseline Score</div>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${(scores.baseline / 5) * 100}%; background: #0173B2;"></div>
                    </div>
                    <div class="score-value">${scores.baseline.toFixed(2)}</div>
                </div>
                
                <div class="score-item">
                    <div class="score-label">StructTail-64 Score</div>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${(scores.structtail64 / 6) * 100}%; background: #DE8F05;"></div>
                    </div>
                    <div class="score-value">${scores.structtail64.toFixed(2)}</div>
                </div>
                
                <div class="score-item">
                    <div class="score-label">Fusion Probability</div>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${scores.fusion * 100}%; background: #029E73;"></div>
                    </div>
                    <div class="score-value">${(scores.fusion * 100).toFixed(1)}%</div>
                </div>
            </div>
            
            <div class="result-prediction ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="prediction-icon">${isCorrect ? '✓' : '✗'}</div>
                <div class="prediction-text">
                    <div class="prediction-label">Prediction:</div>
                    <div class="prediction-value">${prediction === 'member' ? 'Training Sample' : 'Non-Training'}</div>
                </div>
            </div>
            
            <div class="result-truth">
                <div class="truth-label">True Label:</div>
                <div class="truth-value">${sample.true_label === 'member' ? 'Training Sample' : 'Non-Training'}</div>
            </div>
            
            <div class="result-status ${isCorrect ? 'success' : 'error'}">
                ${isCorrect ? '🎯 Attack successful!' : '❌ Attack failed'}
            </div>
        </div>
    `;
    
    // Add CSS for result display
    addResultStyles();
}

/**
 * Add styles for result display
 */
function addResultStyles() {
    if (document.getElementById('demo-result-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'demo-result-styles';
    style.textContent = `
        .attack-result {
            padding: var(--spacing-md);
        }
        
        .result-header h4 {
            margin-bottom: var(--spacing-md);
            color: var(--primary);
        }
        
        .result-scores {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md);
            margin-bottom: var(--spacing-lg);
        }
        
        .score-item {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
        }
        
        .score-label {
            min-width: 150px;
            font-size: 0.9rem;
            color: var(--text-light);
            font-weight: 500;
        }
        
        .score-bar {
            flex: 1;
            height: 20px;
            background: var(--background);
            border-radius: var(--radius-sm);
            overflow: hidden;
        }
        
        .score-fill {
            height: 100%;
            transition: width 1s ease-out;
        }
        
        .score-value {
            min-width: 60px;
            text-align: right;
            font-weight: 600;
            color: var(--text-dark);
        }
        
        .result-prediction {
            display: flex;
            align-items: center;
            gap: var(--spacing-md);
            padding: var(--spacing-md);
            background: var(--background);
            border-radius: var(--radius-md);
            margin-bottom: var(--spacing-sm);
        }
        
        .prediction-icon {
            font-size: 2rem;
        }
        
        .result-prediction.correct {
            background: rgba(2, 158, 115, 0.1);
            border: 2px solid #029E73;
        }
        
        .result-prediction.correct .prediction-icon {
            color: #029E73;
        }
        
        .result-prediction.incorrect {
            background: rgba(220, 53, 69, 0.1);
            border: 2px solid #dc3545;
        }
        
        .result-prediction.incorrect .prediction-icon {
            color: #dc3545;
        }
        
        .prediction-label {
            font-size: 0.9rem;
            color: var(--text-light);
        }
        
        .prediction-value {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text-dark);
        }
        
        .result-truth {
            display: flex;
            justify-content: space-between;
            padding: var(--spacing-sm) var(--spacing-md);
            border-top: 1px solid var(--border-color);
            border-bottom: 1px solid var(--border-color);
            margin-bottom: var(--spacing-md);
        }
        
        .truth-label {
            font-weight: 500;
            color: var(--text-light);
        }
        
        .truth-value {
            font-weight: 600;
            color: var(--text-dark);
        }
        
        .result-status {
            text-align: center;
            padding: var(--spacing-sm);
            border-radius: var(--radius-md);
            font-weight: 600;
            font-size: 1.1rem;
        }
        
        .result-status.success {
            background: #029E73;
            color: white;
        }
        
        .result-status.error {
            background: #dc3545;
            color: white;
        }
    `;
    
    document.head.appendChild(style);
}

/**
 * Utility: Sleep function
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Utility: Hide elements by class name
 */
function hideElementsByClassName(className) {
    const elements = document.getElementsByClassName(className);
    Array.from(elements).forEach(el => {
        el.style.display = 'none';
    });
}

// Export functions for global access
window.demoState = demoState;
window.runAttack = runAttack;

