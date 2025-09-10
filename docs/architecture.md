# AWS Cloud Cost Optimizer Dashboard - Architecture

## Overview

The AWS Cloud Cost Optimizer Dashboard is a multi-framework application designed to provide comprehensive cloud cost visibility and budget management. The architecture follows serverless best practices and demonstrates proficiency in both React and Angular frameworks.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐         ┌─────────────────────────────┐   │
│  │ React Analytics │         │   Angular Budget Manager   │   │
│  │                 │         │                             │   │
│  │ • Chart.js      │         │ • Reactive Forms           │   │
│  │ • Data Filters  │         │ • Budget Creation          │   │
│  │ • Cost Insights │         │ • Alert Management         │   │
│  └─────────────────┘         └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Content Delivery                           │
├─────────────────────────────────────────────────────────────────┤
│           S3 Static Hosting + CloudFront CDN                   │
│                      (<200ms TTFB, 99.9% availability)        │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Gateway                              │
├─────────────────────────────────────────────────────────────────┤
│  • REST API endpoints                                          │
│  • CORS configuration                                          │
│  • Request validation                                          │
│  • Rate limiting                                               │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Lambda Functions                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐         ┌─────────────────────────────┐   │
│  │   get-costs     │         │      set-budget             │   │
│  │                 │         │                             │   │
│  │ • Query costs   │         │ • Create/update budgets     │   │
│  │ • Apply filters │         │ • Manage alerts             │   │
│  │ • Aggregate data│         │ • Threshold monitoring      │   │
│  └─────────────────┘         └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Data Storage                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐         ┌─────────────────────────────┐   │
│  │  DynamoDB       │         │     DynamoDB                │   │
│  │  (costs)        │         │     (budgets)               │   │
│  │                 │         │                             │   │
│  │ PK: COST#date   │         │ PK: BUDGET#user             │   │
│  │ SK: service#reg │         │ SK: PERIOD#month            │   │
│  └─────────────────┘         └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Monitoring & Alerting                       │
├─────────────────────────────────────────────────────────────────┤
│  • CloudWatch Logs                                             │
│  • CloudWatch Metrics                                          │
│  • CloudWatch Alarms                                           │
│  • Budget threshold notifications                              │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Applications

#### React Analytics App (`apps/react-analytics/`)
- **Purpose**: Interactive cost visualization and analytics
- **Technologies**: React 18, Vite, Chart.js, CSS3
- **Features**:
  - Service-wise cost breakdown charts
  - Region-wise spending analysis
  - Time-series cost trends
  - Interactive filters (date range, service, region)
  - Real-time data updates
- **Build Tool**: Vite for fast development and optimized builds

#### Angular Budgets App (`apps/angular-budgets/`)
- **Purpose**: Budget management and alert configuration
- **Technologies**: Angular 20, TypeScript, Reactive Forms
- **Features**:
  - Budget creation and editing forms
  - Alert threshold configuration
  - Budget usage visualization
  - Progress tracking with visual indicators
  - Validation and error handling

### Shared Components (`packages/ui/`)
- **Purpose**: Consistent UI components across frameworks
- **Contents**:
  - React Button component with TypeScript
  - Angular Button component with decorators
  - Shared CSS styles
  - Usage documentation and examples

### Backend Infrastructure

#### Lambda Functions (`lambdas/`)

**get-costs Lambda:**
- **Handler**: `lambdas/get-costs/index.js`
- **Purpose**: Retrieve and filter cost data
- **API Endpoint**: `GET /costs`
- **Parameters**: `from`, `to`, `service`, `region`
- **Features**:
  - Date range filtering
  - Service and region filtering
  - Data aggregation
  - Mock data support for development

**set-budget Lambda:**
- **Handler**: `lambdas/set-budget/index.js`
- **Purpose**: Budget and alert management
- **API Endpoints**: 
  - `POST /budgets` - Create/update budget
  - `GET /budgets` - Retrieve budgets
  - `GET /alerts` - Get alert history
- **Features**:
  - Budget validation
  - Alert threshold management
  - Historical tracking

#### Infrastructure as Code (`infra/`)
- **Template**: AWS SAM (`template.yaml`)
- **Configuration**: `samconfig.toml`
- **Resources**:
  - API Gateway with CORS
  - Lambda functions with appropriate IAM roles
  - DynamoDB tables with proper indexing
  - CloudWatch logs and alarms
  - Environment-based deployments

### Data Model

#### Costs Table (DynamoDB)
```
PK: COST#YYYY-MM-DD
SK: SERVICE#REGION
Attributes:
  - cost: Number
  - createdAt: String (ISO timestamp)
```

#### Budgets Table (DynamoDB)
```
PK: BUDGET#USER_OR_TENANT
SK: PERIOD#YYYY-MM
Attributes:
  - amount: Number
  - alertsEnabled: Boolean
  - alertThreshold: Number (percentage)
  - createdAt: String (ISO timestamp)
  - updatedAt: String (ISO timestamp)
```

## API Design

### Cost Data API
```
GET /costs?from=2025-08-01&to=2025-08-31&service=*&region=*
Response:
{
  "data": [
    {
      "date": "2025-08-01",
      "service": "Amazon EC2",
      "region": "us-east-1",
      "cost": 12.34
    }
  ],
  "total": 85.39,
  "count": 10,
  "filters": { "service": "*", "region": "*" }
}
```

### Budget Management API
```
POST /budgets
Body: {
  "amount": 100,
  "period": "monthly",
  "alertsEnabled": true,
  "alertThreshold": 80
}

GET /budgets
Response: {
  "budgets": [...],
  "count": 2
}

GET /alerts
Response: {
  "alerts": [...],
  "count": 5
}
```

## Deployment Strategy

### Development
- Local development with mock data
- SAM local for API testing
- Hot reload for frontend applications

### Staging/Production
1. **Frontend**: Build → S3 → CloudFront
2. **Backend**: SAM deploy → Lambda + API Gateway
3. **Infrastructure**: CloudFormation stack
4. **Monitoring**: CloudWatch dashboards and alarms

## Performance Targets

- **TTFB**: <200ms via CloudFront edge locations
- **Availability**: 99.9% uptime
- **Scalability**: Serverless auto-scaling
- **Cost Optimization**: Pay-per-use model

## Security Considerations

- CORS configuration for API access
- IAM roles with least privilege
- DynamoDB encryption at rest
- VPC endpoints for enhanced security (future)
- Cognito integration for authentication (roadmap)

## Monitoring and Observability

- **Application Logs**: CloudWatch Logs
- **Metrics**: Custom CloudWatch metrics
- **Alarms**: Budget threshold breaches
- **Tracing**: X-Ray integration (future enhancement)

## Future Enhancements

1. **Cost & Usage Reports (CUR) Integration**
   - S3 → Glue → Athena → Lambda pipeline
   - Real billing data processing

2. **Authentication & Authorization**
   - AWS Cognito integration
   - Per-user budget management

3. **Advanced Analytics**
   - Cost forecasting
   - Anomaly detection
   - Optimization recommendations

4. **Mobile Application**
   - React Native cost monitoring app
   - Push notifications for alerts

## Development Guidelines

### Code Quality
- TypeScript for type safety
- ESLint/Prettier for consistency
- Unit tests for critical components
- Integration tests for API endpoints

### DevOps
- CI/CD pipeline with GitHub Actions
- Automated testing and deployment
- Infrastructure as Code (SAM/CloudFormation)
- Environment promotion strategy

This architecture demonstrates practical cloud cost management while showcasing modern development practices and AWS serverless technologies.