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

export const generateRandomCost = (service: string): number => {
  const range = SERVICE_COST_RANGES[service as keyof typeof SERVICE_COST_RANGES];
  if (!range) return Math.random() * 100 + 1;
  
  const cost = Math.random() * (range.max - range.min) + range.min;
  return Math.round(cost * 100) / 100; // Round to 2 decimal places
};

export const generateRandomUsage = (service: string): number => {
  const range = SERVICE_USAGE_RANGES[service as keyof typeof SERVICE_USAGE_RANGES];
  if (!range) return Math.random() * 1000 + 1;
  
  const usage = Math.random() * (range.max - range.min) + range.min;
  return Math.round(usage * 100) / 100;
};

export const generateResourceId = (service: string): string => {
  const prefix = RESOURCE_PREFIXES[service as keyof typeof RESOURCE_PREFIXES] || 'res-';
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
    record.tags.AlertType = 'cost-anomaly';
    record.tags.AnomalyMultiplier = multiplier.toString();
    records.push(record);
  }
  
  return records;
};