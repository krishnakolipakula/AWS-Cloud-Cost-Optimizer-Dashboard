import { APIGatewayProxyResult } from 'aws-lambda';

export const createResponse = (
  statusCode: number,
  body: any,
  headers?: { [key: string]: string }
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      ...headers
    },
    body: JSON.stringify(body)
  };
};

export const createErrorResponse = (
  statusCode: number,
  message: string,
  error?: string
): APIGatewayProxyResult => {
  return createResponse(statusCode, {
    success: false,
    error: error || message,
    message,
    timestamp: new Date().toISOString()
  });
};

export const createSuccessResponse = (
  data: any,
  message?: string,
  statusCode: number = 200
): APIGatewayProxyResult => {
  return createResponse(statusCode, {
    success: true,
    data,
    message: message || 'Operation completed successfully',
    timestamp: new Date().toISOString()
  });
};