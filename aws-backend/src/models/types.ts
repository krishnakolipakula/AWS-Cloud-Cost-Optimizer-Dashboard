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
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  description?: string;
  service?: string;
  region?: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  thresholds: {
    warning: number;  // percentage
    critical: number; // percentage
  };
  notifications: {
    email: string[];
    sms?: string[];
    webhook?: string;
    snsTopicArn?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  budgetId: string;
  type: 'budget_warning' | 'budget_critical' | 'budget_exceeded' | 'usage_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  currentSpend: number;
  budgetAmount: number;
  percentageUsed: number;
  threshold: number;
  service?: string;
  region?: string;
  timestamp: number;
  isRead: boolean;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  metadata: {
    [key: string]: any;
  };
}

export interface BudgetStatus {
  budgetId: string;
  currentSpend: number;
  budgetAmount: number;
  percentageUsed: number;
  remainingAmount: number;
  projectedSpend: number;
  status: 'on_track' | 'warning' | 'critical' | 'exceeded';
  daysRemaining: number;
  averageDailySpend: number;
  lastUpdated: string;
}

export interface ServiceCostSummary {
  service: string;
  totalCost: number;
  percentage: number;
  recordCount: number;
  averageCost: number;
  regions: {
    [region: string]: number;
  };
}

export interface RegionCostSummary {
  region: string;
  totalCost: number;
  percentage: number;
  recordCount: number;
  averageCost: number;
  services: {
    [service: string]: number;
  };
}

export interface DailyCostSummary {
  date: string;
  totalCost: number;
  recordCount: number;
  services: {
    [service: string]: number;
  };
  regions: {
    [region: string]: number;
  };
}

export interface AnalyticsQuery {
  startDate: string;
  endDate: string;
  services?: string[];
  regions?: string[];
  groupBy?: 'service' | 'region' | 'day' | 'month';
  limit?: number;
}

export interface CreateBillingRecordRequest {
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

export interface CreateBudgetRequest {
  name: string;
  description?: string;
  service?: string;
  region?: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  thresholds: {
    warning: number;
    critical: number;
  };
  notifications: {
    email: string[];
    sms?: string[];
    webhook?: string;
  };
}

export interface UpdateBudgetRequest {
  name?: string;
  description?: string;
  amount?: number;
  thresholds?: {
    warning?: number;
    critical?: number;
  };
  notifications?: {
    email?: string[];
    sms?: string[];
    webhook?: string;
  };
  isActive?: boolean;
}

export interface CreateAlertRequest {
  budgetId: string;
  type: 'budget_warning' | 'budget_critical' | 'budget_exceeded' | 'usage_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  currentSpend: number;
  budgetAmount: number;
  percentageUsed: number;
  threshold: number;
  service?: string;
  region?: string;
  metadata?: {
    [key: string]: any;
  };
}

// AWS Service constants
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

// Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface QueryParams {
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: {
    [key: string]: any;
  };
}