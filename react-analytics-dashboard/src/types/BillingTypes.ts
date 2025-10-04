export interface BillingRecord {
  id: string;
  date: string;
  service: string;
  region: string;
  cost: number;
  usage: number;
  unit: string;
  resourceId: string;
  tags: {
    [key: string]: string;
  };
}

export interface ServiceCost {
  service: string;
  cost: number;
  percentage: number;
  color?: string;
}

export interface RegionCost {
  region: string;
  cost: number;
  percentage: number;
  color?: string;
}

export interface DailyCost {
  date: string;
  cost: number;
}

export interface MonthlyCost {
  month: string;
  cost: number;
}

export interface BudgetThreshold {
  id: string;
  name: string;
  service?: string;
  region?: string;
  threshold: number;
  currentSpend: number;
  period: 'daily' | 'weekly' | 'monthly';
  alertEmail: string;
  isExceeded: boolean;
}

export interface DashboardMetrics {
  totalCost: number;
  monthToDateCost: number;
  projectedMonthlyCost: number;
  topService: string;
  topRegion: string;
  costTrend: 'up' | 'down' | 'stable';
  percentageChange: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  services: string[];
  regions: string[];
}

// AWS Service list for reference
export const AWS_SERVICES = [
  'EC2',
  'S3',
  'RDS',
  'Lambda',
  'CloudFront',
  'CloudWatch',
  'ELB',
  'VPC',
  'Route53',
  'DynamoDB',
  'ElastiCache',
  'ECS'
] as const;

export const AWS_REGIONS = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-west-2',
  'eu-central-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1'
] as const;

export type AWSService = typeof AWS_SERVICES[number];
export type AWSRegion = typeof AWS_REGIONS[number];