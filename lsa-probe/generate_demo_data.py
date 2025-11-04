"""
Generate mock data for LSA-Probe (ICASSP) interactive demo
Simulates adversarial cost distributions, ROC curves, and performance metrics
"""

import json
import numpy as np
from pathlib import Path

# Set random seed for reproducibility
np.random.seed(42)

# Configuration
TIMESTEPS = [0.2, 0.4, 0.6, 0.8]
N_SAMPLES = 500  # Number of member/non-member samples per timestep
BUDGETS = [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
METRICS = ['CDPAM', 'MR-STFT', 'log-mel MSE', 'wave MSE']

OUTPUT_DIR = Path(__file__).parent / 'data'
OUTPUT_DIR.mkdir(exist_ok=True)

def generate_adversarial_costs(timestep_ratio):
    """
    Generate adversarial costs for members and non-members at given timestep.
    Members have higher costs (more stable) than non-members.
    """
    # Base parameters - mid-trajectory (t=0.6) has best separability
    separability_factor = 1.0 - abs(timestep_ratio - 0.6) * 0.5
    
    # Member costs: higher mean, moderate variance
    member_mean = 0.45 + 0.15 * separability_factor
    member_std = 0.12
    member_costs = np.random.gamma(
        shape=(member_mean / member_std) ** 2,
        scale=member_std ** 2 / member_mean,
        size=N_SAMPLES
    )
    member_costs = np.clip(member_costs, 0.05, 0.95)
    
    # Non-member costs: lower mean, higher variance
    nonmember_mean = 0.30 + 0.08 * separability_factor
    nonmember_std = 0.15
    nonmember_costs = np.random.gamma(
        shape=(nonmember_mean / nonmember_std) ** 2,
        scale=nonmember_std ** 2 / nonmember_mean,
        size=N_SAMPLES
    )
    nonmember_costs = np.clip(nonmember_costs, 0.02, 0.85)
    
    return {
        'members': member_costs.tolist(),
        'non_members': nonmember_costs.tolist()
    }

def compute_roc_curve(member_costs, nonmember_costs):
    """Compute ROC curve from cost distributions"""
    all_costs = np.concatenate([member_costs, nonmember_costs])
    labels = np.concatenate([
        np.ones(len(member_costs)),
        np.zeros(len(nonmember_costs))
    ])
    
    # Sort by cost (descending - higher cost = more likely member)
    sorted_idx = np.argsort(-all_costs)
    sorted_labels = labels[sorted_idx]
    
    # Compute TPR and FPR
    tpr = np.cumsum(sorted_labels) / len(member_costs)
    fpr = np.cumsum(1 - sorted_labels) / len(nonmember_costs)
    
    # Ensure starts at (0, 0) and ends at (1, 1)
    fpr = np.concatenate([[0], fpr, [1]])
    tpr = np.concatenate([[0], tpr, [1]])
    
    # Compute AUC
    auc = np.trapz(tpr, fpr)
    
    return {
        'fpr': fpr[::10].tolist(),  # Downsample for file size
        'tpr': tpr[::10].tolist(),
        'auc': float(auc)
    }

def compute_tpr_at_fpr(member_costs, nonmember_costs, target_fpr):
    """Compute TPR at specific FPR threshold"""
    all_costs = np.concatenate([member_costs, nonmember_costs])
    labels = np.concatenate([
        np.ones(len(member_costs)),
        np.zeros(len(nonmember_costs))
    ])
    
    sorted_idx = np.argsort(-all_costs)
    sorted_labels = labels[sorted_idx]
    sorted_costs = all_costs[sorted_idx]
    
    # Find threshold where FPR = target_fpr
    n_nonmembers = len(nonmember_costs)
    n_fp_target = int(target_fpr * n_nonmembers)
    
    cumsum_fp = np.cumsum(1 - sorted_labels)
    idx = np.where(cumsum_fp >= n_fp_target)[0]
    
    if len(idx) == 0:
        return 0.0, sorted_costs[-1]
    
    threshold_idx = idx[0]
    tpr = np.sum(sorted_labels[:threshold_idx+1]) / len(member_costs)
    threshold = sorted_costs[threshold_idx]
    
    return float(tpr), float(threshold)

def main():
    print("Generating LSA-Probe demo data...")
    
    # Generate adversarial costs for all timesteps
    adversarial_costs_data = {}
    roc_curves_data = {}
    
    for t_ratio in TIMESTEPS:
        print(f"  Processing t_ratio = {t_ratio}...")
        
        costs = generate_adversarial_costs(t_ratio)
        adversarial_costs_data[str(t_ratio)] = costs
        
        # Compute ROC curve
        member_arr = np.array(costs['members'])
        nonmember_arr = np.array(costs['non_members'])
        roc = compute_roc_curve(member_arr, nonmember_arr)
        
        # Compute TPR at specific FPRs
        tpr_01, thresh_01 = compute_tpr_at_fpr(member_arr, nonmember_arr, 0.001)
        tpr_1, thresh_1 = compute_tpr_at_fpr(member_arr, nonmember_arr, 0.01)
        tpr_5, thresh_5 = compute_tpr_at_fpr(member_arr, nonmember_arr, 0.05)
        
        roc_curves_data[str(t_ratio)] = {
            'fpr': roc['fpr'],
            'tpr': roc['tpr'],
            'auc': roc['auc'],
            'tpr_at_0.1_fpr': tpr_01,
            'tpr_at_1_fpr': tpr_1,
            'tpr_at_5_fpr': tpr_5,
            'threshold_0.1': thresh_01,
            'threshold_1': thresh_1,
            'threshold_5': thresh_5
        }
    
    # Generate budget ablation data (at t_ratio=0.6)
    budget_ablation = []
    for budget in BUDGETS:
        # TPR@1%FPR increases with budget
        base_tpr = 0.08
        max_tpr = 0.20
        tpr = base_tpr + (max_tpr - base_tpr) * (1 - np.exp(-2 * budget))
        tpr += np.random.normal(0, 0.01)
        
        budget_ablation.append({
            'budget': budget,
            'tpr_1': float(np.clip(tpr, 0, 1))
        })
    
    # Generate metric comparison data (at t_ratio=0.6)
    metric_comparison = {
        'CDPAM': {'tpr_1': 0.20, 'auc': 0.67},
        'MR-STFT': {'tpr_1': 0.18, 'auc': 0.65},
        'log-mel MSE': {'tpr_1': 0.13, 'auc': 0.61},
        'wave MSE': {'tpr_1': 0.11, 'auc': 0.59}
    }
    
    # Generate baseline comparison
    baselines = {
        'Loss-based': {'tpr_1': 0.08, 'tpr_01': 0.014, 'auc': 0.585},
        'Trajectory': {'tpr_1': 0.10, 'tpr_01': 0.019, 'auc': 0.600},
        'SecMI': {'tpr_1': 0.12, 'tpr_01': 0.023, 'auc': 0.630},
        'LSA-Probe (Ours)': {'tpr_1': 0.20, 'tpr_01': 0.051, 'auc': 0.670}
    }
    
    # Generate main results table (from paper)
    main_results = {
        'DiffWave_MAESTRO': {
            'best_baseline': {'tpr_1': 0.09, 'auc': 0.59},
            'ours': {'tpr_1': 0.14, 'auc': 0.62},
            'delta_tpr': 0.05,
            'delta_auc': 0.03
        },
        'DiffWave_FMA': {
            'best_baseline': {'tpr_1': 0.07, 'auc': 0.57},
            'ours': {'tpr_1': 0.12, 'auc': 0.60},
            'delta_tpr': 0.05,
            'delta_auc': 0.03
        },
        'MusicLDM_MAESTRO': {
            'best_baseline': {'tpr_1': 0.12, 'auc': 0.63},
            'ours': {'tpr_1': 0.20, 'auc': 0.67},
            'delta_tpr': 0.08,
            'delta_auc': 0.04
        },
        'MusicLDM_FMA': {
            'best_baseline': {'tpr_1': 0.11, 'auc': 0.62},
            'ours': {'tpr_1': 0.18, 'auc': 0.66},
            'delta_tpr': 0.07,
            'delta_auc': 0.04
        }
    }
    
    # Save all data
    print("\nSaving data files...")
    
    with open(OUTPUT_DIR / 'adversarial_costs.json', 'w') as f:
        json.dump({
            'timesteps': TIMESTEPS,
            'costs': adversarial_costs_data,
            'description': 'Adversarial costs for members and non-members at different timesteps'
        }, f, indent=2)
    print("  ✓ adversarial_costs.json")
    
    with open(OUTPUT_DIR / 'roc_curves.json', 'w') as f:
        json.dump({
            'timesteps': TIMESTEPS,
            'roc_data': roc_curves_data,
            'description': 'ROC curves and TPR@FPR metrics for each timestep'
        }, f, indent=2)
    print("  ✓ roc_curves.json")
    
    with open(OUTPUT_DIR / 'budget_ablation.json', 'w') as f:
        json.dump({
            'budgets': BUDGETS,
            'data': budget_ablation,
            'description': 'TPR@1%FPR vs budget (eta) at t_ratio=0.6'
        }, f, indent=2)
    print("  ✓ budget_ablation.json")
    
    with open(OUTPUT_DIR / 'metric_comparison.json', 'w') as f:
        json.dump({
            'metrics': METRICS,
            'data': metric_comparison,
            'description': 'Performance comparison across different distance metrics'
        }, f, indent=2)
    print("  ✓ metric_comparison.json")
    
    with open(OUTPUT_DIR / 'baselines.json', 'w') as f:
        json.dump({
            'methods': list(baselines.keys()),
            'data': baselines,
            'description': 'Comparison with baseline methods'
        }, f, indent=2)
    print("  ✓ baselines.json")
    
    with open(OUTPUT_DIR / 'main_results.json', 'w') as f:
        json.dump({
            'models': list(main_results.keys()),
            'data': main_results,
            'description': 'Main experimental results from paper (Table 1)'
        }, f, indent=2)
    print("  ✓ main_results.json")
    
    print(f"\n✅ All data generated successfully!")
    print(f"📁 Output directory: {OUTPUT_DIR}")
    print(f"📊 Files: 6")
    print(f"💾 Total samples: {N_SAMPLES * 2 * len(TIMESTEPS)}")

if __name__ == '__main__':
    main()

