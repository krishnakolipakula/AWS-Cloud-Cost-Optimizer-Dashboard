const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 * Lambda handler for budget operations
 * POST /budgets - Create/update budget
 * GET /budgets - Get current budgets
 * GET /alerts - Get budget alert history
 */
exports.handler = async (event, context) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        const httpMethod = event.httpMethod;
        const path = event.path;
        
        // Handle CORS preflight
        if (httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
                },
                body: ''
            };
        }
        
        // Route requests
        if (path.includes('/budgets') && httpMethod === 'POST') {
            return await createOrUpdateBudget(event);
        } else if (path.includes('/budgets') && httpMethod === 'GET') {
            return await getBudgets(event);
        } else if (path.includes('/alerts') && httpMethod === 'GET') {
            return await getAlerts(event);
        } else {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Not found' })
            };
        }
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};

async function createOrUpdateBudget(event) {
    const body = JSON.parse(event.body);
    const { amount, period, alertsEnabled, alertThreshold } = body;
    
    // Validate input
    if (!amount || !period) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Missing required fields: amount and period'
            })
        };
    }
    
    // For demo purposes, use mock data
    if (process.env.USE_MOCK_DATA === 'true') {
        const budget = {
            id: Date.now().toString(),
            amount: parseFloat(amount),
            period: period,
            alertsEnabled: alertsEnabled || false,
            alertThreshold: alertThreshold || 80,
            createdAt: new Date().toISOString(),
            currentSpend: 0
        };
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                message: 'Budget created successfully',
                budget: budget,
                mock: true
            })
        };
    }
    
    // Build current period key (YYYY-MM for monthly)
    const now = new Date();
    const periodKey = period === 'monthly' 
        ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        : `${now.getFullYear()}`;
    
    const budgetItem = {
        PK: `BUDGET#${event.requestContext?.identity?.userAgent || 'default'}`,
        SK: `PERIOD#${periodKey}`,
        amount: parseFloat(amount),
        period: period,
        alertsEnabled: alertsEnabled || false,
        alertThreshold: alertThreshold || 80,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    const params = {
        TableName: process.env.BUDGETS_TABLE_NAME || 'budgets',
        Item: budgetItem
    };
    
    await dynamodb.put(params).promise();
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: 'Budget created/updated successfully',
            budget: budgetItem
        })
    };
}

async function getBudgets(event) {
    // For demo purposes, return mock data
    if (process.env.USE_MOCK_DATA === 'true') {
        const mockBudgets = [
            {
                id: 1,
                amount: 150,
                period: 'monthly',
                alertsEnabled: true,
                alertThreshold: 80,
                currentSpend: 45.50,
                createdAt: '2025-08-01T00:00:00Z'
            },
            {
                id: 2,
                amount: 500,
                period: 'monthly',
                alertsEnabled: false,
                alertThreshold: 90,
                currentSpend: 320.75,
                createdAt: '2025-08-01T00:00:00Z'
            }
        ];
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                budgets: mockBudgets,
                count: mockBudgets.length,
                mock: true
            })
        };
    }
    
    const params = {
        TableName: process.env.BUDGETS_TABLE_NAME || 'budgets',
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
            ':pk': `BUDGET#${event.requestContext?.identity?.userAgent || 'default'}`
        }
    };
    
    const result = await dynamodb.query(params).promise();
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            budgets: result.Items,
            count: result.Count
        })
    };
}

async function getAlerts(event) {
    // Mock alert data for demo
    const mockAlerts = [
        {
            id: 1,
            budgetId: 1,
            message: 'Budget threshold (80%) exceeded',
            alertType: 'warning',
            triggeredAt: '2025-08-03T10:30:00Z',
            currentSpend: 125.50,
            budgetAmount: 150
        },
        {
            id: 2,
            budgetId: 2,
            message: 'Budget 90% reached',
            alertType: 'info',
            triggeredAt: '2025-08-02T15:45:00Z',
            currentSpend: 450.00,
            budgetAmount: 500
        }
    ];
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            alerts: mockAlerts,
            count: mockAlerts.length,
            mock: true
        })
    };
}