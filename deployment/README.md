# AWS Deployment Configuration

This directory contains all the infrastructure-as-code templates, deployment scripts, and configuration needed to deploy the Cloud Cost Monitoring Solution to AWS with optimal performance and cost-efficiency.

## Architecture Overview

The deployment creates a highly available, scalable, and cost-effective architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                          AWS Cloud                             │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │   CloudFront    │    │   CloudFront    │                    │
│  │  (React App)    │    │  (Angular App)  │                    │
│  │  <200ms latency │    │  <200ms latency │                    │
│  └─────────┬───────┘    └─────────┬───────┘                    │
│            │                      │                            │
│  ┌─────────▼───────┐    ┌─────────▼───────┐                    │
│  │      S3         │    │      S3         │                    │
│  │ (React Build)   │    │ (Angular Build) │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                API Gateway + Lambda                        │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │ │
│  │  │Billing  │  │Budgets  │  │Alerts   │  │Analytics│       │ │
│  │  │Functions│  │Functions│  │Functions│  │Functions│       │ │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   DynamoDB Tables                          │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐                     │ │
│  │  │Billing  │  │Budgets  │  │Alerts   │                     │ │
│  │  │Records  │  │         │  │History  │                     │ │
│  │  └─────────┘  └─────────┘  └─────────┘                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │          CloudWatch + SNS Monitoring                       │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐                     │ │
│  │  │Alarms   │  │Metrics  │  │SNS      │                     │ │
│  │  │         │  │         │  │Alerts   │                     │ │
│  │  └─────────┘  └─────────┘  └─────────┘                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Performance Targets

- **Latency**: <200ms response time globally via CloudFront CDN
- **Availability**: 99.9% uptime with multi-AZ deployment
- **Scalability**: Auto-scaling Lambda functions handle variable loads
- **Cost Optimization**: Pay-per-use serverless architecture

## Directory Structure

```
deployment/
├── infrastructure/
│   ├── main.yaml                 # Main CloudFormation template
│   ├── parameters/               # Environment-specific parameters
│   │   ├── dev.json
│   │   ├── staging.json
│   │   └── prod.json
│   └── outputs/                  # Stack outputs and exports
├── scripts/
│   ├── upload-to-s3.js          # S3 deployment script
│   ├── invalidate-cloudfront.js  # Cache invalidation script
│   ├── setup-domain.js          # Custom domain configuration
│   ├── configure-ssl.js         # SSL certificate setup
│   ├── test-deployment.js       # Deployment testing
│   ├── rollback.js              # Rollback functionality
│   └── cleanup.js               # Resource cleanup
├── environments/
│   ├── .env.dev
│   ├── .env.staging
│   └── .env.prod
└── package.json                 # Deployment tools and scripts
```

## Infrastructure Components

### 1. S3 + CloudFront Setup

**React Analytics Dashboard**
- S3 bucket with static website hosting
- CloudFront distribution with global edge locations
- Origin Access Control (OAC) for security
- Custom error pages for SPA routing
- Cache optimization for static assets

**Angular Budget & Alerts App**
- Separate S3 bucket for application isolation
- Dedicated CloudFront distribution
- Environment-specific configuration
- Progressive Web App (PWA) support

### 2. Domain Configuration

**Custom Domain Support**
- Route53 hosted zone management
- SSL/TLS certificates via AWS Certificate Manager
- Subdomain routing:
  - `dashboard.yourdomain.com` → React Analytics
  - `budget.yourdomain.com` → Angular Budget App
  - `api.yourdomain.com` → API Gateway

### 3. Performance Optimizations

**CloudFront Configuration**
- HTTP/2 support for faster loading
- Gzip compression enabled
- Optimized cache headers:
  - HTML: No cache (max-age=0)
  - JS/CSS: Long-term cache (max-age=31536000, immutable)
  - Images: Long-term cache with validation
- Price Class 100 (North America + Europe) for cost optimization

**S3 Optimization**
- Transfer acceleration for uploads
- Lifecycle policies for cost management
- Cross-region replication for disaster recovery

## Deployment Scripts

### upload-to-s3.js

Handles the deployment of frontend applications to S3:

```javascript
const deployment = require('./scripts/upload-to-s3');

// Upload both applications
await deployment.main();

// Or upload individually
await deployment.uploadDirectory('bucket-name', './build');
```

**Features:**
- Recursive directory upload
- Intelligent content-type detection
- Cache control header optimization
- Progress tracking with spinners
- Error handling and rollback

### invalidate-cloudfront.js

Manages CloudFront cache invalidation:

```javascript
const invalidation = require('./scripts/invalidate-cloudfront');

// Invalidate all distributions
await invalidation.main();

// Create specific invalidation
await invalidation.createInvalidation('distribution-id', ['/*']);
```

**Features:**
- Batch invalidation support
- Progress monitoring
- Automatic retry on failure
- Cost optimization (only necessary paths)

## Environment Configuration

### Development Environment
```bash
# .env.dev
AWS_REGION=us-east-1
ENVIRONMENT=dev
DOMAIN_NAME=dev.cloudmern.com
REACT_BUCKET_NAME=cloudmern-react-dev
ANGULAR_BUCKET_NAME=cloudmern-angular-dev
```

### Production Environment
```bash
# .env.prod
AWS_REGION=us-east-1
ENVIRONMENT=prod
DOMAIN_NAME=cloudmern.com
REACT_BUCKET_NAME=cloudmern-react-prod
ANGULAR_BUCKET_NAME=cloudmern-angular-prod
CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/xxx
```

## Deployment Process

### 1. Prerequisites

Install required tools:
```bash
# AWS CLI
aws --version

# Node.js dependencies
npm install

# Verify AWS credentials
aws sts get-caller-identity
```

### 2. Infrastructure Deployment

Deploy the CloudFormation stack:
```bash
# Deploy to development
npm run deploy:infrastructure -- --parameter-overrides Environment=dev

# Deploy to production
npm run deploy:infrastructure -- --parameter-overrides Environment=prod
```

### 3. Backend Deployment

Deploy the serverless backend:
```bash
# Deploy Lambda functions and API Gateway
npm run deploy:backend
```

### 4. Frontend Deployment

Build and deploy frontend applications:
```bash
# Build both applications
npm run build:react
npm run build:angular

# Upload to S3
npm run upload:s3

# Invalidate CloudFront cache
npm run invalidate:cloudfront
```

### 5. Complete Deployment

Deploy everything with a single command:
```bash
# Deploy all components
npm run deploy
```

## Monitoring and Alerts

### CloudWatch Alarms

**Performance Monitoring:**
- 4xx/5xx error rates
- Cache hit ratios
- Origin response times
- Lambda function errors

**Cost Monitoring:**
- S3 storage costs
- CloudFront bandwidth costs
- Lambda invocation costs
- Data transfer costs

### SNS Notifications

Configure alerts for:
- Deployment failures
- Performance degradation
- Security events
- Cost threshold breaches

## Security Configuration

### S3 Security
- Block public access by default
- Use CloudFront OAC instead of OAI
- Server-side encryption enabled
- Access logging to CloudTrail

### CloudFront Security
- HTTPS redirect enforced
- Security headers added
- Geographic restrictions (optional)
- WAF integration (optional)

### API Security
- CORS configuration
- Rate limiting
- Authentication/authorization
- Input validation

## Cost Optimization

### S3 Cost Optimization
```yaml
LifecycleConfiguration:
  Rules:
    - Status: Enabled
      Transitions:
        - Days: 30
          StorageClass: STANDARD_IA
        - Days: 90
          StorageClass: GLACIER
```

### CloudFront Cost Optimization
- Price Class 100 (cheapest option)
- Optimized cache policies
- Compression enabled
- Regional edge caches

### Lambda Cost Optimization
- Appropriate memory allocation
- Connection reuse
- Provisioned concurrency (if needed)
- Reserved capacity planning

## Disaster Recovery

### Backup Strategy
- S3 cross-region replication
- DynamoDB point-in-time recovery
- CloudFormation template versioning
- Automated snapshots

### Recovery Procedures
```bash
# Restore from backup
aws s3 sync s3://backup-bucket s3://primary-bucket

# Rollback deployment
npm run rollback

# Restore DynamoDB table
aws dynamodb restore-table-from-backup
```

## Testing and Validation

### Deployment Testing
```bash
# Test all endpoints
npm run test:deployment

# Performance testing
npm run test:performance

# Security testing
npm run test:security
```

### Health Checks
- HTTP endpoint monitoring
- Database connectivity
- CDN cache status
- SSL certificate validity

## Troubleshooting

### Common Issues

**CloudFront Caching Issues:**
```bash
# Clear all cache
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"

# Check cache status
aws cloudfront get-invalidation --distribution-id XXX --id YYY
```

**S3 Deployment Issues:**
```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket bucket-name

# Verify CORS configuration
aws s3api get-bucket-cors --bucket bucket-name
```

**Lambda Function Issues:**
```bash
# Check function logs
aws logs tail /aws/lambda/function-name --follow

# Monitor metrics
aws cloudwatch get-metric-statistics
```

### Debug Mode

Enable verbose logging:
```bash
export DEBUG=1
npm run deploy
```

## Maintenance

### Regular Tasks
- Update SSL certificates
- Review CloudWatch logs
- Optimize cache policies
- Update security groups
- Patch Lambda runtimes

### Automated Maintenance
- Scheduled cache invalidations
- Log retention policies
- Backup cleanup
- Cost report generation

## Getting Started

1. **Clone and Install:**
   ```bash
   git clone <repository>
   cd deployment
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp environments/.env.example .env
   # Edit .env with your values
   ```

3. **Deploy Infrastructure:**
   ```bash
   npm run deploy:infrastructure
   ```

4. **Deploy Applications:**
   ```bash
   npm run deploy
   ```

5. **Verify Deployment:**
   ```bash
   npm run test:deployment
   ```

## Support

For deployment issues:
1. Check CloudFormation events
2. Review CloudWatch logs
3. Validate IAM permissions
4. Test network connectivity
5. Consult AWS documentation

## License

This deployment configuration is part of the Cloud Cost Monitoring Solution and is licensed under the MIT License.