import { BillingRecord, FilterOptions, DashboardMetrics, ServiceCost, RegionCost, DailyCost } from '../types/BillingTypes';

export const filterBillingData = (data: BillingRecord[], filters: FilterOptions): BillingRecord[] => {
  return data.filter(record => {
    // Date range filter
    const recordDate = new Date(record.date);
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    
    if (recordDate < startDate || recordDate > endDate) {
      return false;
    }

    // Service filter
    if (filters.services.length > 0 && !filters.services.includes(record.service)) {
      return false;
    }

    // Region filter
    if (filters.regions.length > 0 && !filters.regions.includes(record.region)) {
      return false;
    }

    return true;
  });
};

export const calculateMetrics = (data: BillingRecord[]): DashboardMetrics => {
  const totalCost = data.reduce((sum, record) => sum + record.cost, 0);
  
  // Calculate month-to-date cost (current month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthToDateCost = data
    .filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    })
    .reduce((sum, record) => sum + record.cost, 0);

  // Calculate projected monthly cost based on current daily average
  const currentDay = new Date().getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const projectedMonthlyCost = (monthToDateCost / currentDay) * daysInMonth;

  // Find top service by cost
  const serviceCosts = getServiceCosts(data);
  const topService = serviceCosts.length > 0 ? serviceCosts[0].service : 'N/A';

  // Find top region by cost
  const regionCosts = getRegionCosts(data);
  const topRegion = regionCosts.length > 0 ? regionCosts[0].region : 'N/A';

  // Calculate cost trend (compare current week vs previous week)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const currentWeekCost = data
    .filter(record => new Date(record.date) >= oneWeekAgo)
    .reduce((sum, record) => sum + record.cost, 0);

  const previousWeekCost = data
    .filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= twoWeeksAgo && recordDate < oneWeekAgo;
    })
    .reduce((sum, record) => sum + record.cost, 0);

  const percentageChange = previousWeekCost > 0 
    ? ((currentWeekCost - previousWeekCost) / previousWeekCost) * 100
    : 0;

  const costTrend = percentageChange > 5 ? 'up' : percentageChange < -5 ? 'down' : 'stable';

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    monthToDateCost: Math.round(monthToDateCost * 100) / 100,
    projectedMonthlyCost: Math.round(projectedMonthlyCost * 100) / 100,
    topService,
    topRegion,
    costTrend,
    percentageChange: Math.round(percentageChange * 100) / 100
  };
};

export const getServiceCosts = (data: BillingRecord[]): ServiceCost[] => {
  const serviceMap = new Map<string, number>();
  
  data.forEach(record => {
    const currentCost = serviceMap.get(record.service) || 0;
    serviceMap.set(record.service, currentCost + record.cost);
  });

  const totalCost = data.reduce((sum, record) => sum + record.cost, 0);
  
  const serviceCosts: ServiceCost[] = Array.from(serviceMap.entries())
    .map(([service, cost]) => ({
      service,
      cost: Math.round(cost * 100) / 100,
      percentage: Math.round((cost / totalCost) * 10000) / 100,
      color: getServiceColor(service)
    }))
    .sort((a, b) => b.cost - a.cost);

  return serviceCosts;
};

export const getRegionCosts = (data: BillingRecord[]): RegionCost[] => {
  const regionMap = new Map<string, number>();
  
  data.forEach(record => {
    const currentCost = regionMap.get(record.region) || 0;
    regionMap.set(record.region, currentCost + record.cost);
  });

  const totalCost = data.reduce((sum, record) => sum + record.cost, 0);
  
  const regionCosts: RegionCost[] = Array.from(regionMap.entries())
    .map(([region, cost]) => ({
      region,
      cost: Math.round(cost * 100) / 100,
      percentage: Math.round((cost / totalCost) * 10000) / 100,
      color: getRegionColor(region)
    }))
    .sort((a, b) => b.cost - a.cost);

  return regionCosts;
};

export const getDailyCosts = (data: BillingRecord[]): DailyCost[] => {
  const dailyMap = new Map<string, number>();
  
  data.forEach(record => {
    const currentCost = dailyMap.get(record.date) || 0;
    dailyMap.set(record.date, currentCost + record.cost);
  });

  const dailyCosts: DailyCost[] = Array.from(dailyMap.entries())
    .map(([date, cost]) => ({
      date,
      cost: Math.round(cost * 100) / 100
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return dailyCosts;
};

// Color generators for charts
const serviceColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
  '#36A2EB', '#FFCE56'
];

const regionColors = [
  '#FF8A80', '#80D8FF', '#CCFF90', '#FFD180', '#E1BEE7',
  '#F8BBD9', '#D7CCC8', '#FFCDD2', '#C8E6C9', '#DCEDC8'
];

export const getServiceColor = (service: string): string => {
  const index = service.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % serviceColors.length;
  return serviceColors[index];
};

export const getRegionColor = (region: string): string => {
  const index = region.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % regionColors.length;
  return regionColors[index];
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(1)}%`;
};