import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BillingService } from '../services/billing.service';
import { createResponse } from '../utils/response';
import { validateRequest } from '../utils/validation';
import { CreateBillingRecordRequest, AnalyticsQuery } from '../models/types';
import { generateMockBillingData } from '../utils/mock-data-generator';

const billingService = new BillingService();

export const getBillingData = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const queryParams = event.queryStringParameters || {};
    
    const query: AnalyticsQuery = {
      startDate: queryParams.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: queryParams.endDate || new Date().toISOString().split('T')[0],
      services: queryParams.services ? queryParams.services.split(',') : undefined,
      regions: queryParams.regions ? queryParams.regions.split(',') : undefined,
      limit: queryParams.limit ? parseInt(queryParams.limit, 10) : 1000
    };

    const billingRecords = await billingService.getBillingRecords(query);

    return createResponse(200, {
      success: true,
      data: billingRecords,
      message: `Retrieved ${billingRecords.length} billing records`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching billing data:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve billing data',
      timestamp: new Date().toISOString()
    });
  }
};

export const createBillingRecord = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return createResponse(400, {
        success: false,
        error: 'Request body is required',
        timestamp: new Date().toISOString()
      });
    }

    const requestBody: CreateBillingRecordRequest = JSON.parse(event.body);

    // Validate request
    const validation = validateRequest(requestBody, {
      date: { required: true, type: 'string' },
      service: { required: true, type: 'string' },
      region: { required: true, type: 'string' },
      cost: { required: true, type: 'number', min: 0 },
      usage: { required: true, type: 'number', min: 0 },
      unit: { required: true, type: 'string' },
      resourceId: { required: true, type: 'string' },
      tags: { required: true, type: 'object' }
    });

    if (!validation.isValid) {
      return createResponse(400, {
        success: false,
        error: 'Validation error',
        message: validation.errors.join(', '),
        timestamp: new Date().toISOString()
      });
    }

    const userId = event.requestContext.authorizer?.userId || 'anonymous';
    const billingRecord = await billingService.createBillingRecord(requestBody, userId);

    return createResponse(201, {
      success: true,
      data: billingRecord,
      message: 'Billing record created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating billing record:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'Failed to create billing record',
      timestamp: new Date().toISOString()
    });
  }
};

export const processBillingData = async (): Promise<void> => {
  try {
    console.log('Starting scheduled billing data processing...');

    // In a real implementation, this would:
    // 1. Fetch latest billing data from AWS Cost and Billing API
    // 2. Process and normalize the data
    // 3. Store in DynamoDB
    // 4. Trigger budget monitoring alerts

    // For now, we'll simulate processing
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`Processing billing data from ${startDate} to ${endDate}`);

    // Generate some mock data for demonstration
    const mockRecords = generateMockBillingData(50, startDate, endDate);
    
    if (mockRecords.length > 0) {
      await billingService.batchCreateBillingRecords(mockRecords);
      console.log(`Processed ${mockRecords.length} billing records`);
    }

    console.log('Billing data processing completed successfully');

  } catch (error) {
    console.error('Error processing billing data:', error);
    throw error;
  }
};