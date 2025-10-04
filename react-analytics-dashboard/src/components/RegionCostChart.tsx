import React from 'react';
import { BillingRecord } from '../types/BillingTypes';
import { getRegionCosts, formatCurrency, formatPercentage } from '../utils/dataProcessor';

interface RegionCostChartProps {
  data: BillingRecord[];
}

const RegionCostChart: React.FC<RegionCostChartProps> = ({ data }) => {
  const regionCosts = getRegionCosts(data);
  const topRegions = regionCosts.slice(0, 10); // Show top 10 regions

  if (topRegions.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Region-wise Cost Distribution</h3>
        <div className="alert alert-info">No data available</div>
      </div>
    );
  }

  const maxCost = Math.max(...topRegions.map(r => r.cost));

  return (
    <div className="chart-container">
      <h3 className="chart-title">Region-wise Cost Distribution</h3>
      <div className="mb-3">
        {topRegions.map((region, index) => (
          <div key={region.region} className="mb-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="fw-bold">{region.region}</span>
              <span className="text-muted">
                {formatCurrency(region.cost)} ({formatPercentage(region.percentage)})
              </span>
            </div>
            <div className="progress" style={{ height: '20px' }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${(region.cost / maxCost) * 100}%`,
                  backgroundColor: region.color || '#28a745'
                }}
                aria-valuenow={region.cost}
                aria-valuemin={0}
                aria-valuemax={maxCost}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      {regionCosts.length > 10 && (
        <div className="alert alert-secondary">
          <small>Showing top 10 regions out of {regionCosts.length} total regions</small>
        </div>
      )}
    </div>
  );
};

export default RegionCostChart;