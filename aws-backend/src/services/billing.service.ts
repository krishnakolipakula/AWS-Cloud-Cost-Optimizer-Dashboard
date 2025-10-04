import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { BillingRecord, CreateBillingRecordRequest, AnalyticsQuery } from '../models/types';

export class BillingService {
  private dynamoDb: AWS.DynamoDB.DocumentClient;
  private tableName: string;

  constructor() {
    this.dynamoDb = new AWS.DynamoDB.DocumentClient({
      region: process.env.REGION || 'us-east-1'
    });
    this.tableName = process.env.BILLING_TABLE!;
  }

  async createBillingRecord(request: CreateBillingRecordRequest, userId: string = 'system'): Promise<BillingRecord> {
    const now = new Date().toISOString();
    const billingRecord: BillingRecord = {
      id: uuidv4(),
      ...request,
      createdAt: now,
      updatedAt: now
    };

    const params = {
      TableName: this.tableName,
      Item: billingRecord
    };

    await this.dynamoDb.put(params).promise();
    return billingRecord;
  }

  async getBillingRecords(query: AnalyticsQuery): Promise<BillingRecord[]> {
    const { startDate, endDate, services, regions, limit = 1000 } = query;

    const params: AWS.DynamoDB.DocumentClient.QueryInput = {
      TableName: this.tableName,
      IndexName: 'DateIndex',
      KeyConditionExpression: '#date BETWEEN :startDate AND :endDate',
      ExpressionAttributeNames: {
        '#date': 'date'
      },
      ExpressionAttributeValues: {
        ':startDate': startDate,
        ':endDate': endDate
      },
      Limit: limit
    };

    // Add filters for services and regions
    if (services && services.length > 0) {
      params.FilterExpression = (params.FilterExpression ? params.FilterExpression + ' AND ' : '') + 
        '#service IN (' + services.map((_, i) => `:service${i}`).join(', ') + ')';
      params.ExpressionAttributeNames!['#service'] = 'service';
      services.forEach((service, i) => {
        params.ExpressionAttributeValues![`:service${i}`] = service;
      });
    }

    if (regions && regions.length > 0) {
      params.FilterExpression = (params.FilterExpression ? params.FilterExpression + ' AND ' : '') + 
        '#region IN (' + regions.map((_, i) => `:region${i}`).join(', ') + ')';
      params.ExpressionAttributeNames!['#region'] = 'region';
      regions.forEach((region, i) => {
        params.ExpressionAttributeValues![`:region${i}`] = region;
      });
    }

    const result = await this.dynamoDb.query(params).promise();
    return result.Items as BillingRecord[];
  }

  async getBillingRecordById(id: string): Promise<BillingRecord | null> {
    const params = {
      TableName: this.tableName,
      Key: { id }
    };

    const result = await this.dynamoDb.get(params).promise();
    return result.Item as BillingRecord || null;
  }

  async getBillingRecordsByService(service: string, startDate: string, endDate: string): Promise<BillingRecord[]> {
    const params: AWS.DynamoDB.DocumentClient.QueryInput = {
      TableName: this.tableName,
      IndexName: 'ServiceIndex',
      KeyConditionExpression: '#service = :service AND #date BETWEEN :startDate AND :endDate',
      ExpressionAttributeNames: {
        '#service': 'service',
        '#date': 'date'
      },
      ExpressionAttributeValues: {
        ':service': service,
        ':startDate': startDate,
        ':endDate': endDate
      }
    };

    const result = await this.dynamoDb.query(params).promise();
    return result.Items as BillingRecord[];
  }

  async getBillingRecordsByRegion(region: string, startDate: string, endDate: string): Promise<BillingRecord[]> {
    const params: AWS.DynamoDB.DocumentClient.QueryInput = {
      TableName: this.tableName,
      IndexName: 'RegionIndex',
      KeyConditionExpression: '#region = :region AND #date BETWEEN :startDate AND :endDate',
      ExpressionAttributeNames: {
        '#region': 'region',
        '#date': 'date'
      },
      ExpressionAttributeValues: {
        ':region': region,
        ':startDate': startDate,
        ':endDate': endDate
      }
    };

    const result = await this.dynamoDb.query(params).promise();
    return result.Items as BillingRecord[];
  }

  async batchCreateBillingRecords(records: CreateBillingRecordRequest[]): Promise<BillingRecord[]> {
    const now = new Date().toISOString();
    const billingRecords: BillingRecord[] = records.map(record => ({
      id: uuidv4(),
      ...record,
      createdAt: now,
      updatedAt: now
    }));

    // DynamoDB batch write supports up to 25 items at a time
    const batchSize = 25;
    const batches = [];

    for (let i = 0; i < billingRecords.length; i += batchSize) {
      batches.push(billingRecords.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const params: AWS.DynamoDB.DocumentClient.BatchWriteItemInput = {
        RequestItems: {
          [this.tableName]: batch.map(record => ({
            PutRequest: {
              Item: record
            }
          }))
        }
      };

      await this.dynamoDb.batchWrite(params).promise();
    }

    return billingRecords;
  }

  async deleteBillingRecord(id: string): Promise<void> {
    const params = {
      TableName: this.tableName,
      Key: { id }
    };

    await this.dynamoDb.delete(params).promise();
  }

  async getTotalCostBetweenDates(startDate: string, endDate: string, service?: string, region?: string): Promise<number> {
    let records: BillingRecord[];

    if (service) {
      records = await this.getBillingRecordsByService(service, startDate, endDate);
    } else if (region) {
      records = await this.getBillingRecordsByRegion(region, startDate, endDate);
    } else {
      records = await this.getBillingRecords({ startDate, endDate });
    }

    return records.reduce((total, record) => total + record.cost, 0);
  }

  async getServiceCostSummary(startDate: string, endDate: string): Promise<{ [service: string]: number }> {
    const records = await this.getBillingRecords({ startDate, endDate });
    const serviceCosts: { [service: string]: number } = {};

    records.forEach(record => {
      if (!serviceCosts[record.service]) {
        serviceCosts[record.service] = 0;
      }
      serviceCosts[record.service] += record.cost;
    });

    return serviceCosts;
  }

  async getRegionCostSummary(startDate: string, endDate: string): Promise<{ [region: string]: number }> {
    const records = await this.getBillingRecords({ startDate, endDate });
    const regionCosts: { [region: string]: number } = {};

    records.forEach(record => {
      if (!regionCosts[record.region]) {
        regionCosts[record.region] = 0;
      }
      regionCosts[record.region] += record.cost;
    });

    return regionCosts;
  }

  async getDailyCostSummary(startDate: string, endDate: string): Promise<{ [date: string]: number }> {
    const records = await this.getBillingRecords({ startDate, endDate });
    const dailyCosts: { [date: string]: number } = {};

    records.forEach(record => {
      if (!dailyCosts[record.date]) {
        dailyCosts[record.date] = 0;
      }
      dailyCosts[record.date] += record.cost;
    });

    return dailyCosts;
  }
}