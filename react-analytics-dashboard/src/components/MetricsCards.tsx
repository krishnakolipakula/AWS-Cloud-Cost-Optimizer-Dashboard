import React from 'react';
import { DashboardMetrics } from '../types/BillingTypes';
import { formatCurrency } from '../utils/dataProcessor';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-danger';
      case 'down':
        return 'text-success';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="row mb-4">
      {/* Total Cost */}
      <div className="col-md-6 col-lg-3">
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(metrics.totalCost)}</div>
          <div className="metric-label">Total Cost</div>
        </div>
      </div>

      {/* Month to Date */}
      <div className="col-md-6 col-lg-3">
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(metrics.monthToDateCost)}</div>
          <div className="metric-label">Month to Date</div>
        </div>
      </div>

      {/* Projected Monthly */}
      <div className="col-md-6 col-lg-3">
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(metrics.projectedMonthlyCost)}</div>
          <div className="metric-label">Projected Monthly</div>
        </div>
      </div>

      {/* Cost Trend */}
      <div className="col-md-6 col-lg-3">
        <div className="metric-card">
          <div className={`metric-value ${getTrendColor(metrics.costTrend)}`}>
            {getTrendIcon(metrics.costTrend)} {Math.abs(metrics.percentageChange)}%
          </div>
          <div className="metric-label">Weekly Trend</div>
        </div>
      </div>

      {/* Top Service */}
      <div className="col-md-6">
        <div className="metric-card">
          <div className="metric-value" style={{ fontSize: '1.5rem' }}>{metrics.topService}</div>
          <div className="metric-label">Top Service by Cost</div>
        </div>
      </div>

      {/* Top Region */}
      <div className="col-md-6">
        <div className="metric-card">
          <div className="metric-value" style={{ fontSize: '1.5rem' }}>{metrics.topRegion}</div>
          <div className="metric-label">Top Region by Cost</div>
        </div>
      </div>
    </div>
  );
};

export default MetricsCards;