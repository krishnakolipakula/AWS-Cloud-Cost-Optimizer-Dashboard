import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse } from '../utils/response';

// Helper function to generate mock data
const generateMockServiceCosts = () => {
  const services = ['EC2', 'S3', 'Lambda', 'RDS', 'CloudWatch', 'DynamoDB', 'ECS', 'CloudFront'];
  return services.map(service => ({
    service,
    cost: Math.random() * 500 + 50,
    percentage: Math.random() * 30 + 5
  }));
};

const generateMockRegionCosts = () => {
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'eu-central-1'];
  return regions.map(region => ({
    region,
    cost: Math.random() * 300 + 100,
    services: Math.floor(Math.random() * 5) + 3
  }));
};

const generateMockDailyCosts = (days: number = 30) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      cost: Math.random() * 100 + 20,
      services: {
        EC2: Math.random() * 40 + 10,
        S3: Math.random() * 20 + 5,
        Lambda: Math.random() * 15 + 3,
        RDS: Math.random() * 25 + 8,
        Other: Math.random() * 20 + 5
      }
    });
  }
  
  return data;
};

export const getServiceCosts = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const queryParams = event.queryStringParameters || {};
    const startDate = queryParams['startDate'] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = queryParams['endDate'] || new Date().toISOString().split('T')[0];

    const serviceCosts = generateMockServiceCosts();
    
    const totalCost = serviceCosts.reduce((sum, item) => sum + item.cost, 0);
    
    return createResponse(200, {
      success: true,
      data: {
        serviceCosts: serviceCosts.map(item => ({
          ...item,
          percentage: (item.cost / totalCost) * 100
        })),
        totalCost,
        startDate,
        endDate
      },
      message: `Service costs retrieved for ${startDate} to ${endDate}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching service costs:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve service costs',
      timestamp: new Date().toISOString()
    });
  }
};

export const getRegionCosts = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const queryParams = event.queryStringParameters || {};
    const startDate = queryParams['startDate'] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = queryParams['endDate'] || new Date().toISOString().split('T')[0];

    const regionCosts = generateMockRegionCosts();
    
    const totalCost = regionCosts.reduce((sum, item) => sum + item.cost, 0);
    
    return createResponse(200, {
      success: true,
      data: {
        regionCosts: regionCosts.map(item => ({
          ...item,
          percentage: (item.cost / totalCost) * 100
        })),
        totalCost,
        startDate,
        endDate
      },
      message: `Region costs retrieved for ${startDate} to ${endDate}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching region costs:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve region costs',
      timestamp: new Date().toISOString()
    });
  }
};

export const getDailyCosts = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const queryParams = event.queryStringParameters || {};
    const days = parseInt(queryParams['days'] || '30', 10);
    const startDate = queryParams['startDate'] || new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = queryParams['endDate'] || new Date().toISOString().split('T')[0];

    const dailyCosts = generateMockDailyCosts(Math.min(days, 90));
    
    const totalCost = dailyCosts.reduce((sum, item) => sum + item.cost, 0);
    const averageDailyCost = totalCost / dailyCosts.length;
    
    return createResponse(200, {
      success: true,
      data: {
        dailyCosts,
        totalCost,
        averageDailyCost,
        startDate,
        endDate,
        daysCount: dailyCosts.length
      },
      message: `Daily costs retrieved for ${dailyCosts.length} days`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching daily costs:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve daily costs',
      timestamp: new Date().toISOString()
    });
  }
};

export const getCostTrends = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const queryParams = event.queryStringParameters || {};
    const period = queryParams['period'] || 'monthly';

    const trends = {
      currentPeriod: {
        total: 1245.67,
        average: 41.52,
        highest: 78.34,
        lowest: 23.12
      },
      previousPeriod: {
        total: 1189.45,
        average: 39.65,
        highest: 72.18,
        lowest: 21.87
      },
      change: {
        total: 56.22,
        totalPercentage: 4.73,
        average: 1.87,
        averagePercentage: 4.71
      },
      forecast: {
        nextPeriod: 1298.45,
        confidence: 85
      }
    };

    return createResponse(200, {
      success: true,
      data: trends,
      message: `Cost trends retrieved for ${period} period`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching cost trends:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve cost trends',
      timestamp: new Date().toISOString()
    });
  }
};
