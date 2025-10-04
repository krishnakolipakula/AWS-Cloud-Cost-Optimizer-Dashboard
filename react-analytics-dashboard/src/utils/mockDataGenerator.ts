import { BillingRecord, AWS_SERVICES, AWS_REGIONS, AWSService, AWSRegion } from '../types/BillingTypes';

// Generate random costs based on service type
const getServiceBaseCost = (service: AWSService): { min: number; max: number } => {
  const costRanges: { [key in AWSService]: { min: number; max: number } } = {
    'EC2': { min: 50, max: 500 },
    'S3': { min: 5, max: 150 },
    'RDS': { min: 100, max: 800 },
    'Lambda': { min: 1, max: 50 },
    'CloudFront': { min: 10, max: 200 },
    'CloudWatch': { min: 5, max: 100 },
    'ELB': { min: 20, max: 150 },
    'VPC': { min: 5, max: 50 },
    'Route53': { min: 1, max: 30 },
    'DynamoDB': { min: 10, max: 300 },
    'ElastiCache': { min: 30, max: 400 },
    'ECS': { min: 25, max: 250 }
  };
  return costRanges[service];
};

// Generate random date within the last 90 days
const getRandomDate = (): string => {
  const now = new Date();
  const pastDays = Math.floor(Math.random() * 90);
  const randomDate = new Date(now.getTime() - pastDays * 24 * 60 * 60 * 1000);
  return randomDate.toISOString().split('T')[0];
};

// Generate random usage based on service
const getServiceUsage = (service: AWSService): { usage: number; unit: string } => {
  const usageTypes: { [key in AWSService]: { unit: string; min: number; max: number } } = {
    'EC2': { unit: 'hours', min: 100, max: 744 },
    'S3': { unit: 'GB', min: 10, max: 10000 },
    'RDS': { unit: 'hours', min: 100, max: 744 },
    'Lambda': { unit: 'requests', min: 1000, max: 1000000 },
    'CloudFront': { unit: 'GB', min: 50, max: 5000 },
    'CloudWatch': { unit: 'metrics', min: 100, max: 10000 },
    'ELB': { unit: 'hours', min: 100, max: 744 },
    'VPC': { unit: 'hours', min: 100, max: 744 },
    'Route53': { unit: 'queries', min: 10000, max: 1000000 },
    'DynamoDB': { unit: 'RCU/WCU', min: 100, max: 10000 },
    'ElastiCache': { unit: 'hours', min: 100, max: 744 },
    'ECS': { unit: 'vCPU-hours', min: 50, max: 2000 }
  };
  
  const usageType = usageTypes[service];
  const usage = Math.random() * (usageType.max - usageType.min) + usageType.min;
  return {
    usage: Math.round(usage * 100) / 100,
    unit: usageType.unit
  };
};

// Generate realistic tags
const generateTags = (): { [key: string]: string } => {
  const environments = ['prod', 'staging', 'dev', 'test'];
  const teams = ['frontend', 'backend', 'data', 'devops', 'ml'];
  const projects = ['web-app', 'mobile-api', 'analytics', 'monitoring', 'backup'];
  
  return {
    Environment: environments[Math.floor(Math.random() * environments.length)],
    Team: teams[Math.floor(Math.random() * teams.length)],
    Project: projects[Math.floor(Math.random() * projects.length)],
    CostCenter: `CC-${Math.floor(Math.random() * 9000) + 1000}`
  };
};

// Generate a single mock billing record
const generateMockRecord = (id: string): BillingRecord => {
  const service = AWS_SERVICES[Math.floor(Math.random() * AWS_SERVICES.length)];
  const region = AWS_REGIONS[Math.floor(Math.random() * AWS_REGIONS.length)];
  const costRange = getServiceBaseCost(service);
  const cost = Math.random() * (costRange.max - costRange.min) + costRange.min;
  const { usage, unit } = getServiceUsage(service);
  
  return {
    id,
    date: getRandomDate(),
    service,
    region,
    cost: Math.round(cost * 100) / 100,
    usage,
    unit,
    resourceId: `${service.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`,
    tags: generateTags()
  };
};

// Generate multiple mock billing records
export const generateMockData = (count: number = 1000): BillingRecord[] => {
  const records: BillingRecord[] = [];
  
  for (let i = 0; i < count; i++) {
    records.push(generateMockRecord(`record-${i + 1}`));
  }
  
  // Sort by date (newest first)
  records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return records;
};

// Helper function to simulate API delay
export const simulateApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};