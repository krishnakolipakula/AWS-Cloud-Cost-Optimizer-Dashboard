interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'object' | 'array';
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  enum?: any[];
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateRequest = (data: any, schema: ValidationSchema): ValidationResult => {
  const errors: string[] = [];

  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field];

    // Check if required field is missing
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field '${field}' is required`);
      continue;
    }

    // Skip validation if field is not provided and not required
    if (value === undefined || value === null) {
      continue;
    }

    // Type validation
    if (rule.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rule.type) {
        errors.push(`Field '${field}' must be of type ${rule.type}, got ${actualType}`);
        continue;
      }
    }

    // Number validations
    if (rule.type === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`Field '${field}' must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`Field '${field}' must be at most ${rule.max}`);
      }
    }

    // String validations
    if (rule.type === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push(`Field '${field}' must be at least ${rule.minLength} characters long`);
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push(`Field '${field}' must be at most ${rule.maxLength} characters long`);
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`Field '${field}' does not match the required pattern`);
      }
    }

    // Array validations
    if (rule.type === 'array') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push(`Field '${field}' must contain at least ${rule.minLength} items`);
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push(`Field '${field}' must contain at most ${rule.maxLength} items`);
      }
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`Field '${field}' must be one of: ${rule.enum.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
};

export const validateDate = (date: string): boolean => {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(date)) return false;
  
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
};

export const validateUUID = (uuid: string): boolean => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(uuid);
};

export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
};

export const validateBudgetAmount = (amount: number, minAmount: number = 1): boolean => {
  return typeof amount === 'number' && amount >= minAmount && amount <= 1000000;
};

export const validateThreshold = (threshold: number): boolean => {
  return typeof threshold === 'number' && threshold > 0 && threshold <= 200;
};

export const validateAWSService = (service: string): boolean => {
  const validServices = [
    'EC2', 'S3', 'RDS', 'Lambda', 'CloudFront', 'CloudWatch',
    'ELB', 'VPC', 'Route53', 'DynamoDB', 'ElastiCache', 'ECS'
  ];
  return validServices.includes(service);
};

export const validateAWSRegion = (region: string): boolean => {
  const validRegions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-central-1',
    'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1'
  ];
  return validRegions.includes(region);
};