/**
 * MAIA Demo - Interactive Demo
 * Sample selection and attack info display
 */

document.addEventListener('DOMContentLoaded', () => {
    const checkDataInterval = setInterval(() => {
        if (window.isDataLoaded && window.isDataLoaded()) {
            clearInterval(checkDataInterval);
            initDemo();
        }
    }, 100);
});

function initDemo() {
    console.log('🎮 Initializing demo...');
    
    populateSampleSelector();
    setupRegionTimeline();
    
    console.log('✅ Demo initialized');
}

/**
 * Populate sample selector dropdown
 */
function populateSampleSelector() {
    const selector = document.getElementById('sample-select');
    if (!selector) return;
    
    selector.innerHTML = '';
    
    window.MAIAState.samples.forEach((sample, index) => {
        const option = document.createElement('option');
        option.value = index;
        
        const status = sample.attack_success ? 'Success' : 'Failed';
        const label = `${sample.genre} #${index + 1} → ${sample.adversarial_prediction} (${status})`;
        
        option.textContent = label;
        selector.appendChild(option);
    });
    
    selector.addEventListener('change', (e) => {
        const sampleIndex = parseInt(e.target.value);
        loadDemoSample(sampleIndex);
    });
    
    // Load first sample
    loadDemoSample(0);
}

/**
 * Load demo sample and update UI
 */
function loadDemoSample(sampleIndex) {
    const sample = window.MAIAState.samples[sampleIndex];
    if (!sample) return;
    
    console.log('Loading demo sample:', sample.id);
    
    // Update global state
    window.MAIAState.currentSampleIndex = sampleIndex;
    
    // Load audio
    if (window.loadSample) {
        window.loadSample(sampleIndex);
    }
    
    // Update attack info panel
    updateAttackInfo(sample);
    
    // Update region timeline
    updateRegionTimeline(sample);
}

/**
 * Update attack info panel
 */
function updateAttackInfo(sample) {
    // Original prediction
    document.getElementById('original-genre').textContent = sample.original_prediction;
    document.getElementById('original-confidence').style.width = `${sample.original_confidence * 100}%`;
    document.getElementById('original-confidence-text').textContent = `${Math.round(sample.original_confidence * 100)}%`;
    
    // Adversarial prediction
    document.getElementById('adversarial-genre').textContent = sample.adversarial_prediction;
    document.getElementById('adversarial-confidence').style.width = `${sample.adversarial_confidence * 100}%`;
    document.getElementById('adversarial-confidence-text').textContent = `${Math.round(sample.adversarial_confidence * 100)}%`;
    
    // Attack status
    const statusContainer = document.getElementById('attack-status');
    const isSuccess = sample.attack_success;
    
    statusContainer.innerHTML = `
        <span class="status-icon ${isSuccess ? 'success' : 'failed'}">${isSuccess ? '✅' : '❌'}</span>
        <span class="status-text">${isSuccess ? 'Success' : 'Failed'}</span>
    `;
    
    // Metrics
    document.getElementById('metric-fad').textContent = sample.metrics.fad;
    document.getElementById('metric-lsd').textContent = sample.metrics.lsd;
    document.getElementById('metric-mos').textContent = `${sample.metrics.mos}/5`;
}

/**
 * Setup region timeline
 */
function setupRegionTimeline() {
    const timeline = document.getElementById('regions-timeline');
    if (!timeline) return;
    
    // Click on region markers to jump to that time
    timeline.addEventListener('click', (e) => {
        const regionMarker = e.target.closest('.region-marker');
        if (!regionMarker) return;
        
        const startTime = parseFloat(regionMarker.dataset.start);
        
        if (window.jumpToTime) {
            window.jumpToTime(startTime);
        }
    });
}

/**
 * Update region timeline for current sample
 */
function updateRegionTimeline(sample) {
    const timelineTrack = document.querySelector('.timeline-track');
    if (!timelineTrack) return;
    
    // Clear existing markers
    timelineTrack.innerHTML = '';
    
    // Assume 30s duration for positioning
    const totalDuration = 30;
    
    // Add region markers
    sample.inpainting_regions.forEach(([start, end]) => {
        const leftPercent = (start / totalDuration) * 100;
        const widthPercent = ((end - start) / totalDuration) * 100;
        
        const marker = document.createElement('div');
        marker.className = 'region-marker';
        marker.dataset.start = start;
        marker.dataset.end = end;
        marker.style.left = `${leftPercent}%`;
        marker.style.width = `${widthPercent}%`;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'region-tooltip';
        tooltip.textContent = `${start.toFixed(1)}-${end.toFixed(1)}s`;
        
        marker.appendChild(tooltip);
        timelineTrack.appendChild(marker);
    });
}

window.loadDemoSample = loadDemoSample;

