# ReactJS Analytics Dashboard

This is the analytics dashboard component of the Cloud Cost Monitoring Solution. It provides interactive visualizations for AWS cost data using React, TypeScript, and Bootstrap.

## Features

- **Interactive Cost Charts**: Service-wise, region-wise, and time-series visualizations
- **Real-time Data Processing**: Process 1000+ billing records efficiently
- **Responsive Design**: Bootstrap-powered UI that works on all devices
- **Advanced Filtering**: Filter by date range, services, and regions
- **Performance Metrics**: Key metrics cards showing total cost, trends, and projections

## Technology Stack

- **React 18.2+** with TypeScript
- **Bootstrap 5.2** for responsive UI
- **Chart.js** integration ready (can be added)
- **Date-fns** for date manipulation
- **Axios** for API calls

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard container
│   ├── MetricsCards.tsx # Key metrics display
│   ├── ServiceCostChart.tsx   # Service cost visualization
│   ├── RegionCostChart.tsx    # Region cost visualization
│   ├── TimeSeriesChart.tsx    # Daily cost trends
│   └── FilterControls.tsx     # Filter interface
├── types/              # TypeScript type definitions
│   └── BillingTypes.ts # Billing data types
├── utils/              # Utility functions
│   ├── mockDataGenerator.ts  # Generate test data
│   └── dataProcessor.ts      # Data processing utilities
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.css           # Global styles
```

## Mock Data Generation

The application includes a comprehensive mock data generator that creates realistic AWS billing records:

- **1000+ Records**: Generates billing data for testing
- **10+ AWS Services**: EC2, S3, RDS, Lambda, CloudFront, etc.
- **Multiple Regions**: us-east-1, us-west-2, eu-west-1, etc.
- **Realistic Costs**: Service-specific cost ranges
- **Time Distribution**: Data spread across the last 90 days
- **Resource Tags**: Environment, team, project, cost center tags

## Key Components

### Dashboard
Main container that orchestrates all components and manages state.

### MetricsCards
Displays key performance indicators:
- Total cost across filtered data
- Month-to-date spending
- Projected monthly cost
- Weekly cost trend with percentage change
- Top service and region by cost

### ServiceCostChart
Visualizes cost distribution across AWS services:
- Top 10 services by cost
- Percentage and absolute cost values
- Color-coded progress bars
- Service-specific cost ranges

### RegionCostChart
Shows cost distribution across AWS regions:
- Regional spending breakdown
- Geographic cost optimization insights
- Region-specific usage patterns

### TimeSeriesChart
Daily cost trends visualization:
- Last 30 days of spending data
- Above/below average cost indicators
- Interactive hover tooltips
- Summary statistics

### FilterControls
Advanced filtering interface:
- Date range selection
- Service and region filters
- Quick filter presets (last 7/30 days)
- Active filter summary

## Installation & Setup

1. **Install Dependencies** (when Node.js is available):
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Data Processing Features

- **Real-time Filtering**: Filter 1000+ records instantly
- **Aggregation Engine**: Calculate service/region costs efficiently
- **Trend Analysis**: Compare current vs previous periods
- **Cost Projections**: Predict monthly costs based on current usage
- **Currency Formatting**: Professional financial display

## Performance Optimizations

- **React Hooks**: useMemo for expensive calculations
- **Efficient Filtering**: Optimized data processing algorithms
- **Responsive Design**: Mobile-first approach
- **Lazy Loading**: Components load data as needed

## Integration with Backend

The dashboard is designed to integrate with the AWS Lambda backend:

```typescript
// API integration points
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Fetch billing data
const fetchBillingData = async (filters: FilterOptions) => {
  const response = await axios.get(`${API_BASE_URL}/billing-data`, {
    params: filters
  });
  return response.data;
};
```

## Chart.js Integration

To add Chart.js for more advanced visualizations:

```bash
npm install chart.js react-chartjs-2
```

Example implementation:
```typescript
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);
```

## Deployment

This React application is designed to be deployed on AWS S3 + CloudFront:

1. **Build the application**: `npm run build`
2. **Upload to S3**: Upload `build/` folder contents
3. **Configure CloudFront**: Point distribution to S3 bucket
4. **Enable HTTPS**: SSL certificate for secure access

## Environment Variables

Create a `.env` file for configuration:

```
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
```

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

1. Follow TypeScript best practices
2. Maintain responsive design principles
3. Add unit tests for new components
4. Update documentation for new features

## License

MIT License - Part of the Cloud Cost Monitoring Solution