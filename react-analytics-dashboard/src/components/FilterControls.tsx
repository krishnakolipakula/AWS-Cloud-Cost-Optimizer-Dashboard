import React from 'react';
import { FilterOptions, AWS_SERVICES, AWS_REGIONS } from '../types/BillingTypes';

interface FilterControlsProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  availableServices: string[];
  availableRegions: string[];
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  availableServices,
  availableRegions
}) => {
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const handleServiceToggle = (service: string) => {
    const newServices = filters.services.includes(service)
      ? filters.services.filter(s => s !== service)
      : [...filters.services, service];
    
    onFilterChange({
      ...filters,
      services: newServices
    });
  };

  const handleRegionToggle = (region: string) => {
    const newRegions = filters.regions.includes(region)
      ? filters.regions.filter(r => r !== region)
      : [...filters.regions, region];
    
    onFilterChange({
      ...filters,
      regions: newRegions
    });
  };

  const clearAllFilters = () => {
    onFilterChange({
      ...filters,
      services: [],
      regions: []
    });
  };

  return (
    <div className="filter-controls">
      <h4 className="mb-3">🔍 Filters & Controls</h4>
      
      <div className="row">
        {/* Date Range */}
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Date Range</label>
          <div className="row">
            <div className="col-6">
              <input
                type="date"
                className="form-control"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
              />
              <small className="text-muted">Start Date</small>
            </div>
            <div className="col-6">
              <input
                type="date"
                className="form-control"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
              />
              <small className="text-muted">End Date</small>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Quick Actions</label>
          <div className="d-flex gap-2 flex-wrap">
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => handleDateRangeChange('start', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
            >
              Last 7 Days
            </button>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => handleDateRangeChange('start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
            >
              Last 30 Days
            </button>
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={clearAllFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Services Filter */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">AWS Services ({filters.services.length} selected)</label>
          <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {availableServices.map(service => (
              <div key={service} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`service-${service}`}
                  checked={filters.services.includes(service)}
                  onChange={() => handleServiceToggle(service)}
                />
                <label className="form-check-label" htmlFor={`service-${service}`}>
                  {service}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Regions Filter */}
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">AWS Regions ({filters.regions.length} selected)</label>
          <div className="border rounded p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {availableRegions.map(region => (
              <div key={region} className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`region-${region}`}
                  checked={filters.regions.includes(region)}
                  onChange={() => handleRegionToggle(region)}
                />
                <label className="form-check-label" htmlFor={`region-${region}`}>
                  {region}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.services.length > 0 || filters.regions.length > 0) && (
        <div className="mt-2">
          <small className="text-muted">
            <strong>Active Filters:</strong>{' '}
            {filters.services.length > 0 && `Services: ${filters.services.join(', ')} `}
            {filters.regions.length > 0 && `Regions: ${filters.regions.join(', ')}`}
          </small>
        </div>
      )}
    </div>
  );
};

export default FilterControls;