import { APIGatewayProxyEvent, APIGatewayProxyResult, ScheduledEvent } from 'aws-lambda';
import { createResponse } from '../utils/response';

export const getAlerts = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Mock alerts data for local testing
    const alerts = [
      {
        id: 'alert-1',
        type: 'budget_threshold',
        severity: 'warning',
        budgetId: 'budget-1',
        budgetName: 'Monthly AWS Budget',
        message: 'Budget has reached 75% of allocated amount',
        threshold: 80,
        currentUsage: 75,
        triggered: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        acknowledged: false
      },
      {
        id: 'alert-2',
        type: 'anomaly_detection',
        severity: 'critical',
        service: 'EC2',
        message: 'Unusual spike in EC2 costs detected',
        expectedCost: 150,
        actualCost: 350,
        triggered: true,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        acknowledged: false
      },
      {
        id: 'alert-3',
        type: 'budget_threshold',
        severity: 'info',
        budgetId: 'budget-2',
        budgetName: 'Development Budget',
        message: 'Budget has reached 50% of allocated amount',
        threshold: 50,
        currentUsage: 64,
        triggered: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        acknowledged: true
      }
    ];

    // Filter based on query parameters
    const queryParams = event.queryStringParameters || {};
    let filteredAlerts = alerts;

    if (queryParams.severity) {
      filteredAlerts = filteredAlerts.filter(a => a.severity === queryParams.severity);
    }

    if (queryParams.triggered !== undefined) {
      const isTriggered = queryParams.triggered === 'true';
      filteredAlerts = filteredAlerts.filter(a => a.triggered === isTriggered);
    }

    if (queryParams.acknowledged !== undefined) {
      const isAcknowledged = queryParams.acknowledged === 'true';
      filteredAlerts = filteredAlerts.filter(a => a.acknowledged === isAcknowledged);
    }

    return createResponse(200, {
      success: true,
      data: filteredAlerts,
      message: `Retrieved ${filteredAlerts.length} alerts`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching alerts:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve alerts',
      timestamp: new Date().toISOString()
    });
  }
};

export const createAlert = async (
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

    const alertData = JSON.parse(event.body);
    
    const newAlert = {
      id: `alert-${Date.now()}`,
      ...alertData,
      triggered: false,
      acknowledged: false,
      createdAt: new Date().toISOString()
    };

    return createResponse(201, {
      success: true,
      data: newAlert,
      message: 'Alert created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating alert:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'Failed to create alert',
      timestamp: new Date().toISOString()
    });
  }
};

export const budgetMonitor = async (
  event: ScheduledEvent
): Promise<void> => {
  try {
    console.log('Budget monitor started at:', new Date().toISOString());
    console.log('Event:', JSON.stringify(event, null, 2));

    // Mock budget monitoring logic
    const budgets = [
      { id: 'budget-1', amount: 1000, spent: 750, threshold: 80 },
      { id: 'budget-2', amount: 500, spent: 320, threshold: 75 }
    ];

    for (const budget of budgets) {
      const percentageUsed = (budget.spent / budget.amount) * 100;
      
      if (percentageUsed >= budget.threshold) {
        console.log(`Alert triggered for budget ${budget.id}: ${percentageUsed.toFixed(2)}% used`);
        
        // In production, this would:
        // 1. Create an alert record in DynamoDB
        // 2. Send notification via SNS/SES
        // 3. Update CloudWatch metrics
      } else {
        console.log(`Budget ${budget.id} is within threshold: ${percentageUsed.toFixed(2)}% used`);
      }
    }

    console.log('Budget monitor completed successfully');

  } catch (error) {
    console.error('Error in budget monitor:', error);
    throw error;
  }
};

export const acknowledgeAlert = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const alertId = event.pathParameters?.id;
    
    if (!alertId) {
      return createResponse(400, {
        success: false,
        error: 'Alert ID is required',
        timestamp: new Date().toISOString()
      });
    }

    const acknowledgedAlert = {
      id: alertId,
      acknowledged: true,
      acknowledgedAt: new Date().toISOString(),
      acknowledgedBy: event.requestContext.authorizer?.userId || 'anonymous'
    };

    return createResponse(200, {
      success: true,
      data: acknowledgedAlert,
      message: 'Alert acknowledged successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error acknowledging alert:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'Failed to acknowledge alert',
      timestamp: new Date().toISOString()
    });
  }
};
