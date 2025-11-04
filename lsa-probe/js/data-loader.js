/* Data Loader for LSA-Probe */

async function loadAllData() {
    console.log('Loading data files...');
    
    const dataFiles = [
        'data/adversarial_costs.json',
        'data/roc_curves.json',
        'data/budget_ablation.json',
        'data/metric_comparison.json',
        'data/baselines.json',
        'data/main_results.json'
    ];
    
    try {
        // Fetch all files
        const responses = await Promise.all(
            dataFiles.map(async (file) => {
                console.log(`Fetching ${file}...`);
                const response = await fetch(file);
                if (!response.ok) {
                    throw new Error(`Failed to load ${file}: ${response.status} ${response.statusText}`);
                }
                return response;
            })
        );
        
        console.log('All files fetched, parsing JSON...');
        
        // Parse JSON
        const data = await Promise.all(
            responses.map(async (r, i) => {
                try {
                    return await r.json();
                } catch (error) {
                    console.error(`Failed to parse ${dataFiles[i]}:`, error);
                    throw error;
                }
            })
        );
        
        // Store in global state
        window.LSAProbe.data = {
            adversarialCosts: data[0],
            rocCurves: data[1],
            budgetAblation: data[2],
            metricComparison: data[3],
            baselines: data[4],
            mainResults: data[5]
        };
        
        console.log('✓ All data loaded successfully');
        console.log('Data structure:', Object.keys(window.LSAProbe.data));
        return window.LSAProbe.data;
        
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// Get adversarial costs for specific timestep
function getCostsForTimestep(tRatio) {
    const data = window.LSAProbe.data.adversarialCosts;
    const key = String(tRatio);
    
    if (!data || !data.costs || !data.costs[key]) {
        console.warn(`No data for t_ratio=${tRatio}`);
        return { members: [], non_members: [] };
    }
    
    return data.costs[key];
}

// Get ROC curve for specific timestep
function getROCForTimestep(tRatio) {
    const data = window.LSAProbe.data.rocCurves;
    const key = String(tRatio);
    
    if (!data || !data.roc_data || !data.roc_data[key]) {
        console.warn(`No ROC data for t_ratio=${tRatio}`);
        return { fpr: [], tpr: [], auc: 0 };
    }
    
    return data.roc_data[key];
}

// Get all available timesteps
function getAvailableTimesteps() {
    const data = window.LSAProbe.data.adversarialCosts;
    return data?.timesteps || [0.2, 0.4, 0.6, 0.8];
}

// Export functions
window.loadAllData = loadAllData;
window.getCostsForTimestep = getCostsForTimestep;
window.getROCForTimestep = getROCForTimestep;
window.getAvailableTimesteps = getAvailableTimesteps;

