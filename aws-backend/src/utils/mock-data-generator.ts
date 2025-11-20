import { v4 as uuidv4 } from 'uuid';
import { CreateBillingRecordRequest, AWS_SERVICES, AWS_REGIONS } from '../models/types';

// Service cost ranges (realistic AWS pricing)
const SERVICE_COST_RANGES = {
  'EC2': { min: 10, max: 2000, unit: 'hours' },
  'S3': { min: 0.5, max: 500, unit: 'GB' },
  'RDS': { min: 20, max: 3000, unit: 'hours' },
  'Lambda': { min: 0.1, max: 100, unit: 'requests' },
  'CloudFront': { min: 2, max: 800, unit: 'GB' },
  'CloudWatch': { min: 1, max: 200, unit: 'metrics' },
  'ELB': { min: 5, max: 500, unit: 'hours' },
  'VPC': { min: 1, max: 100, unit: 'hours' },
  'Route53': { min: 0.5, max: 50, unit: 'queries' },
  'DynamoDB': { min: 2, max: 1000, unit: 'RCU/WCU' },
  'ElastiCache': { min: 15, max: 1500, unit: 'hours' },
  'ECS': { min: 8, max: 800, unit: 'vCPU-hours' }
};

// Usage ranges for different services
const SERVICE_USAGE_RANGES = {
  'EC2': { min: 24, max: 744 },      // hours per month
  'S3': { min: 1, max: 50000 },     // GB stored
  'RDS': { min: 24, max: 744 },     // hours per month
  'Lambda': { min: 100, max: 10000000 }, // requests
  'CloudFront': { min: 10, max: 100000 }, // GB transferred
  'CloudWatch': { min: 50, max: 50000 }, // custom metrics
  'ELB': { min: 24, max: 744 },     // hours per month
  'VPC': { min: 24, max: 744 },     // hours per month
  'Route53': { min: 1000, max: 10000000 }, // DNS queries
  'DynamoDB': { min: 10, max: 40000 }, // RCU/WCU
  'ElastiCache': { min: 24, max: 744 }, // hours per month
  'ECS': { min: 10, max: 5000 }     // vCPU-hours
};

// Common AWS resource prefixes
const RESOURCE_PREFIXES = {
  'EC2': 'i-',
  'S3': 'bucket-',
  'RDS': 'db-',
  'Lambda': 'function-',
  'CloudFront': 'cf-',
  'CloudWatch': 'cw-',
  'ELB': 'elb-',
  'VPC': 'vpc-',
  'Route53': 'zone-',
  'DynamoDB': 'table-',
  'ElastiCache': 'cache-',
  'ECS': 'cluster-'
};

// Environment and team tags for realistic data
const ENVIRONMENTS = ['prod', 'staging', 'dev', 'test'];
const TEAMS = ['frontend', 'backend', 'data', 'devops', 'ml', 'mobile'];
const PROJECTS = ['web-app', 'mobile-api', 'analytics', 'monitoring', 'backup', 'cdn'];
const COST_CENTERS = ['CC-1001', 'CC-1002', 'CC-1003', 'CC-1004', 'CC-1005'];

export const generateRandomCost = (service: string, seed?: number): number => {
  const range = SERVICE_COST_RANGES[service as keyof typeof SERVICE_COST_RANGES];
  if (!range) return seed ? (seed % 100) + 1 : Math.random() * 100 + 1;
  
  const randomValue = seed ? (seed % 1000) / 1000 : Math.random();
  const cost = randomValue * (range.max - range.min) + range.min;
  return Math.round(cost * 100) / 100; // Round to 2 decimal places
};

export const generateRandomUsage = (service: string, seed?: number): number => {
  const range = SERVICE_USAGE_RANGES[service as keyof typeof SERVICE_USAGE_RANGES];
  if (!range) return seed ? (seed % 1000) + 1 : Math.random() * 1000 + 1;
  
  const randomValue = seed ? (seed % 1000) / 1000 : Math.random();
  const usage = randomValue * (range.max - range.min) + range.min;
  return Math.round(usage * 100) / 100;
};

export const generateResourceId = (service: string, index?: number): string => {
  const prefix = RESOURCE_PREFIXES[service as keyof typeof RESOURCE_PREFIXES] || 'res-';
  if (index !== undefined) {
    // Use deterministic ID for backend data
    return prefix + 'backend' + index.toString().padStart(6, '0');
  }
  const randomId = Math.random().toString(36).substr(2, 10);
  return prefix + randomId;
};

export const generateRandomTags = (): { [key: string]: string } => {
  return {
    Environment: ENVIRONMENTS[Math.floor(Math.random() * ENVIRONMENTS.length)],
    Team: TEAMS[Math.floor(Math.random() * TEAMS.length)],
    Project: PROJECTS[Math.floor(Math.random() * PROJECTS.length)],
    CostCenter: COST_CENTERS[Math.floor(Math.random() * COST_CENTERS.length)],
    Owner: `user${Math.floor(Math.random() * 100) + 1}@company.com`,
    CreatedBy: 'automation'
  };
};

export const generateRandomDate = (startDate?: string, endDate?: string): string => {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
};

export const generateMockBillingRecord = (
  date?: string,
  service?: string,
  region?: string
): CreateBillingRecordRequest => {
  const selectedService = service || AWS_SERVICES[Math.floor(Math.random() * AWS_SERVICES.length)];
  const selectedRegion = region || AWS_REGIONS[Math.floor(Math.random() * AWS_REGIONS.length)];
  const cost = generateRandomCost(selectedService);
  const usage = generateRandomUsage(selectedService);
  
  return {
    date: date || generateRandomDate(),
    service: selectedService,
    region: selectedRegion,
    cost,
    usage,
    unit: SERVICE_COST_RANGES[selectedService as keyof typeof SERVICE_COST_RANGES]?.unit || 'units',
    resourceId: generateResourceId(selectedService),
    tags: generateRandomTags()
  };
};

export const generateMockBillingData = (
  count: number,
  startDate?: string,
  endDate?: string
): CreateBillingRecordRequest[] => {
  const records: CreateBillingRecordRequest[] = [];
  
  for (let i = 0; i < count; i++) {
    records.push(generateMockBillingRecord(
      generateRandomDate(startDate, endDate)
    ));
  }
  
  // Sort by date
  records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return records;
};

// Generate data with service distribution (more realistic)
export const generateDistributedMockData = (
  count: number,
  startDate?: string,
  endDate?: string
): CreateBillingRecordRequest[] => {
  const records: CreateBillingRecordRequest[] = [];
  
  // Define service usage distribution (EC2 and S3 are typically highest)
  const serviceDistribution = {
    'EC2': 0.35,      // 35% of records
    'S3': 0.20,       // 20% of records
    'RDS': 0.15,      // 15% of records
    'Lambda': 0.10,   // 10% of records
    'CloudFront': 0.08, // 8% of records
    'DynamoDB': 0.05,  // 5% of records
    'ELB': 0.03,      // 3% of records
    'CloudWatch': 0.02, // 2% of records
    'VPC': 0.01,      // 1% of records
    'Route53': 0.01   // 1% of records
  };
  
  let recordsGenerated = 0;
  
  for (const [service, percentage] of Object.entries(serviceDistribution)) {
    const serviceRecords = Math.floor(count * percentage);
    
    for (let i = 0; i < serviceRecords && recordsGenerated < count; i++) {
      records.push(generateMockBillingRecord(
        generateRandomDate(startDate, endDate),
        service
      ));
      recordsGenerated++;
    }
  }
  
  // Fill remaining with random services
  while (recordsGenerated < count) {
    records.push(generateMockBillingRecord(
      generateRandomDate(startDate, endDate)
    ));
    recordsGenerated++;
  }
  
  // Sort by date
  records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return records;
};

// Generate data for a specific time period with daily distribution
export const generateTimeSeriesData = (
  startDate: string,
  endDate: string,
  recordsPerDay: number = 20
): CreateBillingRecordRequest[] => {
  const records: CreateBillingRecordRequest[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    
    // Generate random number of records for this day (±50% of target)
    const dailyRecords = Math.floor(recordsPerDay * (0.5 + Math.random()));
    
    for (let i = 0; i < dailyRecords; i++) {
      records.push(generateMockBillingRecord(dateStr));
    }
  }
  
  return records;
};

// Generate high-cost anomaly records (for alert testing)
export const generateAnomalyData = (
  date: string,
  service: string,
  multiplier: number = 5
): CreateBillingRecordRequest[] => {
  const records: CreateBillingRecordRequest[] = [];
  
  // Generate 3-5 high-cost records
  const count = Math.floor(Math.random() * 3) + 3;
  
  for (let i = 0; i < count; i++) {
    const record = generateMockBillingRecord(date, service);
    record.cost = record.cost * multiplier; // Multiply cost to create anomaly
    record.tags['AlertType'] = 'cost-anomaly';
    record.tags['AnomalyMultiplier'] = multiplier.toString();
    records.push(record);
  }
  
  return records;
};

// Generate DETERMINISTIC data for backend API (same data every time)
// This allows users to verify they're actually connected to the backend
export const generateDeterministicBackendData = (
  days: number = 90
): CreateBillingRecordRequest[] => {
  const records: CreateBillingRecordRequest[] = [];
  const today = new Date();
  
  // Fixed services and regions for consistent data
  const backendServices = ['EC2', 'S3', 'RDS', 'Lambda', 'DynamoDB'];
  const backendRegions = ['us-east-1', 'us-west-2', 'eu-west-1'];
  
  let recordIndex = 0;
  
  // Generate data for each day
  for (let day = 0; day < days; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate 3-5 records per day with deterministic values
    backendServices.forEach((service, serviceIdx) => {
      backendRegions.forEach((region, regionIdx) => {
        // Only create records for some combinations to avoid too much data
        if ((day + serviceIdx + regionIdx) % 3 === 0) {
          recordIndex++;
          const seed = day * 100 + serviceIdx * 10 + regionIdx;
          
          records.push({
            date: dateStr,
            service: service,
            region: region,
            cost: generateRandomCost(service, seed),
            usage: generateRandomUsage(service, seed),
            unit: SERVICE_COST_RANGES[service as keyof typeof SERVICE_COST_RANGES]?.unit || 'units',
            resourceId: generateResourceId(service, recordIndex),
            tags: {
              Environment: 'BACKEND-API',
              DataSource: 'AWS-Lambda-Function',
              Team: TEAMS[seed % TEAMS.length] || 'backend',
              Project: PROJECTS[seed % PROJECTS.length] || 'web-app',
              CostCenter: COST_CENTERS[seed % COST_CENTERS.length] || 'CC-1001',
              BackendGenerated: 'true'
            }
          });
        }
      });
    });
  }
  
  // Sort by date descending (newest first)
  records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return records;
};