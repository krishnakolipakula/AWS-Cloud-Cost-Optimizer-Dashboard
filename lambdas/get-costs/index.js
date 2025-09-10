const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 * Lambda handler for GET /costs
 * Query parameters: from, to, service, region
 * Returns cost data from DynamoDB
 */
exports.handler = async (event, context) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Extract query parameters
        const { from, to, service, region } = event.queryStringParameters || {};
        
        // Validate required parameters
        if (!from || !to) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
                },
                body: JSON.stringify({
                    error: 'Missing required parameters: from and to dates'
                })
            };
        }
        
        // Build DynamoDB query parameters
        const params = {
            TableName: process.env.COSTS_TABLE_NAME || 'cloud_costs',
            KeyConditionExpression: 'PK BETWEEN :fromDate AND :toDate',
            ExpressionAttributeValues: {
                ':fromDate': `COST#${from}`,
                ':toDate': `COST#${to}`
            }
        };
        
        // Add filters for service and region if provided
        if (service && service !== '*') {
            params.FilterExpression = 'contains(SK, :service)';
            params.ExpressionAttributeValues[':service'] = service;
        }
        
        if (region && region !== '*') {
            if (params.FilterExpression) {
                params.FilterExpression += ' AND contains(SK, :region)';
            } else {
                params.FilterExpression = 'contains(SK, :region)';
            }
            params.ExpressionAttributeValues[':region'] = region;
        }
        
        // For demo purposes, return mock data if DynamoDB is not available
        if (process.env.USE_MOCK_DATA === 'true') {
            const mockData = [
                { date: "2025-08-01", service: "Amazon EC2", region: "us-east-1", cost: 12.34 },
                { date: "2025-08-01", service: "Amazon S3", region: "us-east-1", cost: 3.21 },
                { date: "2025-08-02", service: "AWS Lambda", region: "us-west-2", cost: 1.15 },
                { date: "2025-08-02", service: "Amazon EC2", region: "us-east-1", cost: 15.67 },
                { date: "2025-08-02", service: "Amazon S3", region: "us-west-2", cost: 2.89 },
                { date: "2025-08-03", service: "AWS Lambda", region: "us-east-1", cost: 0.95 },
                { date: "2025-08-03", service: "Amazon EC2", region: "us-west-2", cost: 18.23 },
                { date: "2025-08-03", service: "Amazon RDS", region: "us-east-1", cost: 25.50 },
                { date: "2025-08-04", service: "Amazon S3", region: "us-east-1", cost: 4.12 },
                { date: "2025-08-04", service: "AWS Lambda", region: "us-west-2", cost: 1.33 }
            ];
            
            // Apply filters to mock data
            let filteredData = mockData.filter(item => {
                const itemDate = item.date;
                return itemDate >= from && itemDate <= to;
            });
            
            if (service && service !== '*') {
                filteredData = filteredData.filter(item => item.service === service);
            }
            
            if (region && region !== '*') {
                filteredData = filteredData.filter(item => item.region === region);
            }
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
                },
                body: JSON.stringify({
                    data: filteredData,
                    total: filteredData.reduce((sum, item) => sum + item.cost, 0),
                    count: filteredData.length,
                    mock: true
                })
            };
        }
        
        // Query DynamoDB
        const result = await dynamodb.query(params).promise();
        
        // Transform DynamoDB items to response format
        const costs = result.Items.map(item => {
            const [, date] = item.PK.split('#');
            const [service, region] = item.SK.split('#');
            return {
                date,
                service,
                region,
                cost: item.cost,
                createdAt: item.createdAt
            };
        });
        
        const total = costs.reduce((sum, item) => sum + item.cost, 0);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                data: costs,
                total: total,
                count: costs.length,
                from: from,
                to: to,
                filters: { service, region }
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};