import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createResponse } from '../utils/response';

export const getBudgets = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Mock budget data for local testing
    const budgets = [
      {
        id: 'budget-1',
        name: 'Monthly AWS Budget',
        amount: 1000,
        spent: 750,
        period: 'monthly',
        alertThreshold: 80,
        services: ['EC2', 'S3', 'Lambda'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'budget-2',
        name: 'Development Budget',
        amount: 500,
        spent: 320,
        period: 'monthly',
        alertThreshold: 75,
        services: ['RDS', 'CloudWatch'],
        createdAt: new Date().toISOString()
      }
    ];

    return createResponse(200, {
      success: true,
      data: budgets,
      message: `Retrieved ${budgets.length} budgets`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching budgets:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve budgets',
      timestamp: new Date().toISOString()
    });
  }
};

export const createBudget = async (
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

    const budgetData = JSON.parse(event.body);
    
    const newBudget = {
      id: `budget-${Date.now()}`,
      ...budgetData,
      spent: 0,
      createdAt: new Date().toISOString()
    };

    return createResponse(201, {
      success: true,
      data: newBudget,
      message: 'Budget created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error creating budget:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'Failed to create budget',
      timestamp: new Date().toISOString()
    });
  }
};

export const updateBudget = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const budgetId = event.pathParameters?.id;
    
    if (!budgetId) {
      return createResponse(400, {
        success: false,
        error: 'Budget ID is required',
        timestamp: new Date().toISOString()
      });
    }

    if (!event.body) {
      return createResponse(400, {
        success: false,
        error: 'Request body is required',
        timestamp: new Date().toISOString()
      });
    }

    const updateData = JSON.parse(event.body);
    
    const updatedBudget = {
      id: budgetId,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return createResponse(200, {
      success: true,
      data: updatedBudget,
      message: 'Budget updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating budget:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'Failed to update budget',
      timestamp: new Date().toISOString()
    });
  }
};

export const deleteBudget = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const budgetId = event.pathParameters?.id;
    
    if (!budgetId) {
      return createResponse(400, {
        success: false,
        error: 'Budget ID is required',
        timestamp: new Date().toISOString()
      });
    }

    return createResponse(200, {
      success: true,
      message: `Budget ${budgetId} deleted successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error deleting budget:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete budget',
      timestamp: new Date().toISOString()
    });
  }
};

export const getBudgetStatus = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const budgetId = event.pathParameters?.id;
    
    if (!budgetId) {
      return createResponse(400, {
        success: false,
        error: 'Budget ID is required',
        timestamp: new Date().toISOString()
      });
    }

    const budgetStatus = {
      id: budgetId,
      amount: 1000,
      spent: 750,
      remaining: 250,
      percentageUsed: 75,
      status: 'warning',
      daysRemaining: 10,
      projectedSpend: 1050,
      timestamp: new Date().toISOString()
    };

    return createResponse(200, {
      success: true,
      data: budgetStatus,
      message: 'Budget status retrieved successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching budget status:', error);
    return createResponse(500, {
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve budget status',
      timestamp: new Date().toISOString()
    });
  }
};
