import React from 'react';
import { BillingRecord } from '../types/BillingTypes';
import { getServiceCosts, formatCurrency, formatPercentage } from '../utils/dataProcessor';

interface ServiceCostChartProps {
  data: BillingRecord[];
}

const ServiceCostChart: React.FC<ServiceCostChartProps> = ({ data }) => {
  const serviceCosts = getServiceCosts(data);
  const topServices = serviceCosts.slice(0, 10); // Show top 10 services

  if (topServices.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Service-wise Cost Distribution</h3>
        <div className="alert alert-info">No data available</div>
      </div>
    );
  }

  const maxCost = Math.max(...topServices.map(s => s.cost));

  return (
    <div className="chart-container">
      <h3 className="chart-title">Service-wise Cost Distribution</h3>
      <div className="mb-3">
        {topServices.map((service, index) => (
          <div key={service.service} className="mb-2">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="fw-bold">{service.service}</span>
              <span className="text-muted">
                {formatCurrency(service.cost)} ({formatPercentage(service.percentage)})
              </span>
            </div>
            <div className="progress" style={{ height: '20px' }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${(service.cost / maxCost) * 100}%`,
                  backgroundColor: service.color || '#007bff'
                }}
                aria-valuenow={service.cost}
                aria-valuemin={0}
                aria-valuemax={maxCost}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      {serviceCosts.length > 10 && (
        <div className="alert alert-secondary">
          <small>Showing top 10 services out of {serviceCosts.length} total services</small>
        </div>
      )}
    </div>
  );
};

export default ServiceCostChart;