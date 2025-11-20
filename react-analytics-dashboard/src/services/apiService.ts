// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Billing Data Types
export interface BillingRecord {
  id: string;
  date: string;
  service: string;
  region: string;
  cost: number;
  usage: number;
  unit: string;
  resourceId: string;
  tags: Record<string, string>;
}

// Budget Types
export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: string;
  alertThreshold: number;
  services: string[];
  createdAt: string;
}

// Alert Types
export interface Alert {
  id: string;
  type: string;
  severity: string;
  budgetId?: string;
  budgetName?: string;
  service?: string;
  message: string;
  triggered: boolean;
  createdAt: string;
  acknowledged: boolean;
  threshold?: number;
  currentUsage?: number;
  expectedCost?: number;
  actualCost?: number;
}

// Analytics Types
export interface ServiceCostData {
  service: string;
  cost: number;
  percentage: number;
}

export interface RegionCostData {
  region: string;
  cost: number;
  services: number;
  percentage: number;
}

export interface DailyCostData {
  date: string;
  cost: number;
  services: Record<string, number>;
}

// API Client Class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || result.message || 'API request failed');
      }

      return result.data as T;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Billing Data APIs
  async getBillingData(params?: {
    startDate?: string;
    endDate?: string;
    services?: string[];
    regions?: string[];
    limit?: number;
  }): Promise<BillingRecord[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.services && params.services.length > 0) {
      queryParams.append('services', params.services.join(','));
    }
    if (params?.regions && params.regions.length > 0) {
      queryParams.append('regions', params.regions.join(','));
    }
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.fetch<BillingRecord[]>(`/api/billing-data${query ? `?${query}` : ''}`);
  }

  async createBillingRecord(record: Omit<BillingRecord, 'id'>): Promise<BillingRecord> {
    return this.fetch<BillingRecord>('/api/billing-data', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  // Budget APIs
  async getBudgets(): Promise<Budget[]> {
    return this.fetch<Budget[]>('/api/budgets');
  }

  async createBudget(budget: Omit<Budget, 'id' | 'spent' | 'createdAt'>): Promise<Budget> {
    return this.fetch<Budget>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    });
  }

  async updateBudget(id: string, budget: Partial<Budget>): Promise<Budget> {
    return this.fetch<Budget>(`/api/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budget),
    });
  }

  async deleteBudget(id: string): Promise<void> {
    return this.fetch<void>(`/api/budgets/${id}`, {
      method: 'DELETE',
    });
  }

  async getBudgetStatus(id: string): Promise<any> {
    return this.fetch<any>(`/api/budgets/${id}/status`);
  }

  // Alert APIs
  async getAlerts(params?: {
    severity?: string;
    triggered?: boolean;
    acknowledged?: boolean;
  }): Promise<Alert[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.triggered !== undefined) {
      queryParams.append('triggered', params.triggered.toString());
    }
    if (params?.acknowledged !== undefined) {
      queryParams.append('acknowledged', params.acknowledged.toString());
    }

    const query = queryParams.toString();
    return this.fetch<Alert[]>(`/api/alerts${query ? `?${query}` : ''}`);
  }

  async createAlert(alert: Partial<Alert>): Promise<Alert> {
    return this.fetch<Alert>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  }

  // Analytics APIs
  async getServiceCosts(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    serviceCosts: ServiceCostData[];
    totalCost: number;
    startDate: string;
    endDate: string;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.fetch(`/api/analytics/service-costs${query ? `?${query}` : ''}`);
  }

  async getRegionCosts(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    regionCosts: RegionCostData[];
    totalCost: number;
    startDate: string;
    endDate: string;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.fetch(`/api/analytics/region-costs${query ? `?${query}` : ''}`);
  }

  async getDailyCosts(params?: {
    days?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    dailyCosts: DailyCostData[];
    totalCost: number;
    averageDailyCost: number;
    startDate: string;
    endDate: string;
    daysCount: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.days) queryParams.append('days', params.days.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.fetch(`/api/analytics/daily-costs${query ? `?${query}` : ''}`);
  }

  // Utility APIs
  async seedMockData(): Promise<any> {
    return this.fetch('/api/seed-data', {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export helper functions for common operations
export const billingApi = {
  getAll: (params?: Parameters<typeof apiClient.getBillingData>[0]) => 
    apiClient.getBillingData(params),
  create: (record: Parameters<typeof apiClient.createBillingRecord>[0]) => 
    apiClient.createBillingRecord(record),
};

export const budgetApi = {
  getAll: () => apiClient.getBudgets(),
  create: (budget: Parameters<typeof apiClient.createBudget>[0]) => 
    apiClient.createBudget(budget),
  update: (id: string, budget: Parameters<typeof apiClient.updateBudget>[1]) => 
    apiClient.updateBudget(id, budget),
  delete: (id: string) => apiClient.deleteBudget(id),
  getStatus: (id: string) => apiClient.getBudgetStatus(id),
};

export const alertApi = {
  getAll: (params?: Parameters<typeof apiClient.getAlerts>[0]) => 
    apiClient.getAlerts(params),
  create: (alert: Parameters<typeof apiClient.createAlert>[0]) => 
    apiClient.createAlert(alert),
};

export const analyticsApi = {
  serviceCosts: (params?: Parameters<typeof apiClient.getServiceCosts>[0]) => 
    apiClient.getServiceCosts(params),
  regionCosts: (params?: Parameters<typeof apiClient.getRegionCosts>[0]) => 
    apiClient.getRegionCosts(params),
  dailyCosts: (params?: Parameters<typeof apiClient.getDailyCosts>[0]) => 
    apiClient.getDailyCosts(params),
};

export default apiClient;
