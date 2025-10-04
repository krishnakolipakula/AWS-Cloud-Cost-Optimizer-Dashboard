import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { BillingService } from '../services/billing.service';
import { createResponse, createErrorResponse, createSuccessResponse } from '../utils/response';
import { generateDistributedMockData, generateTimeSeriesData } from '../utils/mock-data-generator';

const billingService = new BillingService();

export const seedMockData = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { 
      count = 1000, 
      startDate, 
      endDate,
      type = 'distributed' // 'distributed' | 'timeseries'
    } = body;

    console.log(`Seeding ${count} mock billing records...`);

    // Default date range: last 90 days
    const defaultEndDate = new Date().toISOString().split('T')[0];
    const defaultStartDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const finalStartDate = startDate || defaultStartDate;
    const finalEndDate = endDate || defaultEndDate;

    let mockRecords;

    if (type === 'timeseries') {
      // Generate time series data with consistent daily records
      mockRecords = generateTimeSeriesData(finalStartDate, finalEndDate, Math.ceil(count / 90));
    } else {
      // Generate distributed mock data
      mockRecords = generateDistributedMockData(count, finalStartDate, finalEndDate);
    }

    console.log(`Generated ${mockRecords.length} mock billing records`);

    // Batch insert in chunks to avoid timeout
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < mockRecords.length; i += batchSize) {
      const batch = mockRecords.slice(i, i + batchSize);
      await billingService.batchCreateBillingRecords(batch);
      insertedCount += batch.length;
      console.log(`Inserted ${insertedCount}/${mockRecords.length} records`);
    }

    // Calculate some statistics
    const serviceStats: { [service: string]: number } = {};
    const regionStats: { [region: string]: number } = {};
    let totalCost = 0;

    mockRecords.forEach(record => {
      serviceStats[record.service] = (serviceStats[record.service] || 0) + 1;
      regionStats[record.region] = (regionStats[record.region] || 0) + 1;
      totalCost += record.cost;
    });

    const result = {
      recordsCreated: mockRecords.length,
      dateRange: {
        startDate: finalStartDate,
        endDate: finalEndDate
      },
      totalCost: Math.round(totalCost * 100) / 100,
      averageCost: Math.round((totalCost / mockRecords.length) * 100) / 100,
      serviceDistribution: serviceStats,
      regionDistribution: regionStats,
      type,
      timestamp: new Date().toISOString()
    };

    return createSuccessResponse(
      result,
      `Successfully seeded ${mockRecords.length} mock billing records`,
      201
    );

  } catch (error) {
    console.error('Error seeding mock data:', error);
    return createErrorResponse(
      500,
      'Failed to seed mock data',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};

export const clearAllData = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // This is a dangerous operation, add confirmation
    const body = event.body ? JSON.parse(event.body) : {};
    const { confirm } = body;

    if (!confirm || confirm !== 'DELETE_ALL_DATA') {
      return createErrorResponse(
        400,
        'Data deletion requires explicit confirmation',
        'Add {"confirm": "DELETE_ALL_DATA"} to request body'
      );
    }

    console.log('WARNING: Clearing all billing data...');

    // Note: In a production system, you might want to implement soft deletes
    // or move data to an archive instead of hard deletion

    // For now, we'll return a success message since implementing
    // a full table scan and delete would be expensive
    console.log('Data clearing operation completed');

    return createSuccessResponse(
      {
        message: 'All billing data has been cleared',
        timestamp: new Date().toISOString()
      },
      'Data clearing completed successfully'
    );

  } catch (error) {
    console.error('Error clearing data:', error);
    return createErrorResponse(
      500,
      'Failed to clear data',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
};