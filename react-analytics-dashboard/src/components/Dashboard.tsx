import React, { useState, useMemo } from 'react';
import { BillingRecord, FilterOptions, DashboardMetrics } from '../types/BillingTypes';
import MetricsCards from './MetricsCards';
import ServiceCostChart from './ServiceCostChart';
import RegionCostChart from './RegionCostChart';
import TimeSeriesChart from './TimeSeriesChart';
import FilterControls from './FilterControls';
import { calculateMetrics, filterBillingData } from '../utils/dataProcessor';

interface DashboardProps {
  billingData: BillingRecord[];
}

const Dashboard: React.FC<DashboardProps> = ({ billingData }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    services: [],
    regions: []
  });

  const filteredData = useMemo(() => {
    return filterBillingData(billingData, filters);
  }, [billingData, filters]);

  const metrics = useMemo(() => {
    return calculateMetrics(filteredData);
  }, [filteredData]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  return (
    <div>
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="container">
          <h1>Cloud Cost Analytics Dashboard</h1>
          <p>Monitor and optimize your AWS spending with real-time insights</p>
        </div>
      </div>

      <div className="container">
        {/* Filter Controls */}
        <FilterControls 
          filters={filters}
          onFilterChange={handleFilterChange}
          availableServices={Array.from(new Set(billingData.map(record => record.service)))}
          availableRegions={Array.from(new Set(billingData.map(record => record.region)))}
        />

        {/* Metrics Cards */}
        <MetricsCards metrics={metrics} />

        {/* Charts Grid */}
        <div className="row">
          {/* Service Cost Distribution */}
          <div className="col-lg-6 mb-4">
            <ServiceCostChart data={filteredData} />
          </div>

          {/* Region Cost Distribution */}
          <div className="col-lg-6 mb-4">
            <RegionCostChart data={filteredData} />
          </div>
        </div>

        {/* Time Series Chart */}
        <div className="row">
          <div className="col-12">
            <TimeSeriesChart data={filteredData} />
          </div>
        </div>

        {/* Data Summary */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="alert alert-info">
              <h5>Data Summary</h5>
              <p className="mb-1">
                <strong>Total Records:</strong> {filteredData.length} billing records
              </p>
              <p className="mb-1">
                <strong>Date Range:</strong> {filters.dateRange.start} to {filters.dateRange.end}
              </p>
              <p className="mb-1">
                <strong>Services Monitored:</strong> {filters.services.length > 0 ? filters.services.join(', ') : 'All services'}
              </p>
              <p className="mb-0">
                <strong>Regions Monitored:</strong> {filters.regions.length > 0 ? filters.regions.join(', ') : 'All regions'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;