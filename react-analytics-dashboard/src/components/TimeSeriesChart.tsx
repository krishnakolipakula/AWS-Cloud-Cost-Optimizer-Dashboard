import React from 'react';
import { BillingRecord } from '../types/BillingTypes';
import { getDailyCosts, formatCurrency } from '../utils/dataProcessor';

interface TimeSeriesChartProps {
  data: BillingRecord[];
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data }) => {
  const dailyCosts = getDailyCosts(data);
  const recentDays = dailyCosts.slice(-30); // Show last 30 days

  if (recentDays.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Daily Cost Trend</h3>
        <div className="alert alert-info">No data available</div>
      </div>
    );
  }

  const maxCost = Math.max(...recentDays.map(d => d.cost));
  const avgCost = recentDays.reduce((sum, d) => sum + d.cost, 0) / recentDays.length;

  return (
    <div className="chart-container">
      <h3 className="chart-title">Daily Cost Trend (Last 30 Days)</h3>
      
      {/* Summary Statistics */}
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="text-center p-2 bg-light rounded">
            <strong>Max Daily Cost:</strong><br />
            {formatCurrency(maxCost)}
          </div>
        </div>
        <div className="col-md-4">
          <div className="text-center p-2 bg-light rounded">
            <strong>Avg Daily Cost:</strong><br />
            {formatCurrency(avgCost)}
          </div>
        </div>
        <div className="col-md-4">
          <div className="text-center p-2 bg-light rounded">
            <strong>Total Period:</strong><br />
            {formatCurrency(recentDays.reduce((sum, d) => sum + d.cost, 0))}
          </div>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="mb-3">
        <div className="d-flex align-items-end" style={{ height: '200px', gap: '2px' }}>
          {recentDays.map((day, index) => {
            const heightPercent = (day.cost / maxCost) * 100;
            return (
              <div
                key={day.date}
                className="d-flex flex-column justify-content-end"
                style={{ 
                  flex: 1,
                  height: '100%',
                  minWidth: '8px'
                }}
                title={`${day.date}: ${formatCurrency(day.cost)}`}
              >
                <div
                  style={{
                    backgroundColor: day.cost > avgCost ? '#dc3545' : '#007bff',
                    height: `${heightPercent}%`,
                    borderRadius: '2px 2px 0 0',
                    minHeight: '2px'
                  }}
                ></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Labels (Show every 5th date to avoid clutter) */}
      <div className="d-flex justify-content-between text-small text-muted">
        {recentDays.map((day, index) => 
          index % 5 === 0 ? (
            <span key={day.date} style={{ fontSize: '0.8rem' }}>
              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          ) : null
        )}
      </div>

      <div className="mt-3">
        <small className="text-muted">
          📊 Blue bars represent below-average costs, red bars represent above-average costs.
          Hover over bars to see exact values.
        </small>
      </div>
    </div>
  );
};

export default TimeSeriesChart;