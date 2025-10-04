# Angular Budget & Alerts Manager

This is the budget management and alert configuration component of the Cloud Cost Monitoring Solution. It provides comprehensive budget controls, threshold management, and real-time alerting using Angular, TypeScript, and Bootstrap.

## Features

- **Budget Management**: Create, edit, and monitor AWS service budgets
- **Alert Configuration**: Set up threshold-based alerts with multiple notification methods
- **Real-time Notifications**: CloudWatch integration for instant budget threshold alerts
- **Multi-Service Support**: Budget controls for 10+ AWS services
- **Threshold Management**: Flexible percentage and absolute value thresholds
- **Email Notifications**: Automated alerts when budgets are exceeded
- **Responsive Design**: Mobile-first approach with Bootstrap 5

## Technology Stack

- **Angular 15+** with TypeScript
- **Bootstrap 5.2** for responsive UI
- **Font Awesome 6.4** for icons
- **RxJS** for reactive programming
- **Angular Forms** (Reactive Forms)
- **Angular HTTP Client** for API communication
- **Angular Animations** for smooth transitions

## Architecture

```
src/app/
├── components/              # Angular components
│   ├── dashboard/          # Main dashboard with statistics
│   ├── budget-list/        # Budget listing and management
│   ├── budget-form/        # Budget creation/editing form
│   ├── budget-detail/      # Detailed budget view
│   └── alert-list/         # Alert history and configuration
├── models/                 # TypeScript interfaces
│   ├── budget.model.ts     # Budget data structures
│   ├── alert.model.ts      # Alert configurations
│   └── threshold.model.ts  # Threshold definitions
├── services/               # Angular services
│   ├── budget.service.ts   # Budget CRUD operations
│   ├── alert.service.ts    # Alert management
│   └── api.service.ts      # Backend API communication
├── pipes/                  # Custom Angular pipes
│   ├── currency.pipe.ts    # Currency formatting
│   └── date-format.pipe.ts # Date formatting
└── guards/                 # Route guards
    └── auth.guard.ts       # Authentication guard
```

## Key Components

### Dashboard Component
- Overview statistics and key metrics
- Budget status indicators
- Recent alert summaries
- Quick action buttons

### Budget List Component
- Table view of all configured budgets
- Budget status indicators (On Track, Warning, Exceeded)
- Progress bars showing spend vs. budget
- Quick edit and delete actions

### Budget Form Component
- Create new budgets or edit existing ones
- Service selection dropdown
- Budget period configuration (monthly, quarterly, yearly)
- Threshold percentage settings
- Email notification setup

### Alert List Component
- Historical alert data
- Alert severity levels (Info, Warning, Critical)
- Filter and search capabilities
- Alert acknowledgment system

### Budget Detail Component
- Detailed budget breakdown
- Historical spending trends
- Threshold breach history
- Related alerts and notifications

## Budget Types Supported

### Service-Based Budgets
```typescript
interface ServiceBudget {
  id: string;
  name: string;
  service: 'EC2' | 'S3' | 'RDS' | 'Lambda' | 'CloudFront' | ...;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  thresholds: {
    warning: number;    // 80% default
    critical: number;   // 100% default
  };
  notifications: {
    email: string[];
    sns?: string;
  };
}
```

### Region-Based Budgets
```typescript
interface RegionBudget {
  id: string;
  name: string;
  region: 'us-east-1' | 'us-west-2' | 'eu-west-1' | ...;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  services: string[];  // Optional service filter
}
```

### Project-Based Budgets
```typescript
interface ProjectBudget {
  id: string;
  name: string;
  tags: {
    [key: string]: string;
  };
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
}
```

## Alert Configuration

### Threshold Types
- **Percentage-based**: Alert when spend reaches X% of budget
- **Absolute value**: Alert when spend exceeds specific dollar amount
- **Forecast-based**: Alert when projected spend will exceed budget

### Notification Methods
- **Email**: Direct email notifications
- **SMS**: Text message alerts (via SNS)
- **Webhook**: Custom HTTP endpoints
- **Slack**: Integration with Slack channels

## Form Validation

### Budget Form Validation Rules
```typescript
budgetForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(3)]],
  service: ['', Validators.required],
  amount: ['', [Validators.required, Validators.min(1)]],
  period: ['monthly', Validators.required],
  warningThreshold: [80, [Validators.required, Validators.min(1), Validators.max(100)]],
  criticalThreshold: [100, [Validators.required, Validators.min(1), Validators.max(100)]],
  email: ['', [Validators.required, Validators.email]]
});
```

### Custom Validators
- Email format validation
- Budget amount minimum validation
- Threshold percentage validation
- Service availability validation

## API Integration

### Budget Service Methods
```typescript
@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  
  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(`${this.apiUrl}/budgets`);
  }
  
  createBudget(budget: CreateBudgetRequest): Observable<Budget> {
    return this.http.post<Budget>(`${this.apiUrl}/budgets`, budget);
  }
  
  updateBudget(id: string, budget: UpdateBudgetRequest): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/budgets/${id}`, budget);
  }
  
  deleteBudget(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/budgets/${id}`);
  }
  
  getBudgetStatus(id: string): Observable<BudgetStatus> {
    return this.http.get<BudgetStatus>(`${this.apiUrl}/budgets/${id}/status`);
  }
}
```

## Real-time Updates

### WebSocket Integration
```typescript
@Injectable()
export class AlertService {
  private socket = io(environment.wsUrl);
  
  getAlertUpdates(): Observable<Alert> {
    return new Observable(observer => {
      this.socket.on('budget-alert', (alert: Alert) => {
        observer.next(alert);
      });
    });
  }
}
```

### Polling Strategy
```typescript
@Component({...})
export class DashboardComponent implements OnInit, OnDestroy {
  private updateInterval = interval(30000); // 30 seconds
  
  ngOnInit() {
    this.updateSubscription = this.updateInterval
      .pipe(switchMap(() => this.budgetService.getBudgets()))
      .subscribe(budgets => this.budgets = budgets);
  }
}
```

## State Management

### Budget State
```typescript
interface BudgetState {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  selectedBudget: Budget | null;
}
```

### Alert State
```typescript
interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  filters: AlertFilters;
  pagination: PaginationInfo;
}
```

## Installation & Setup

1. **Install Dependencies** (when Node.js and Angular CLI are available):
   ```bash
   npm install
   npm install -g @angular/cli
   ```

2. **Start Development Server**:
   ```bash
   ng serve --port 4201
   ```

3. **Build for Production**:
   ```bash
   ng build --prod
   ```

4. **Run Tests**:
   ```bash
   ng test
   ng e2e
   ```

## Environment Configuration

### Development Environment
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3001',
  awsRegion: 'us-east-1'
};
```

### Production Environment
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.your-domain.com',
  wsUrl: 'wss://ws.your-domain.com',
  awsRegion: 'us-east-1'
};
```

## Testing Strategy

### Unit Tests
- Component testing with Angular Testing Utilities
- Service testing with HTTP mocking
- Pipe testing for data formatting
- Form validation testing

### Integration Tests
- E2E testing with Protractor/Cypress
- API integration testing
- User workflow testing
- Cross-browser compatibility testing

## Performance Optimizations

### OnPush Change Detection
```typescript
@Component({
  selector: 'app-budget-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
```

### Lazy Loading
```typescript
const routes: Routes = [
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule)
  }
];
```

### Virtual Scrolling
```html
<cdk-virtual-scroll-viewport itemSize="50" class="viewport">
  <div *cdkVirtualFor="let budget of budgets">{{budget.name}}</div>
</cdk-virtual-scroll-viewport>
```

## Deployment

### Build for Production
```bash
ng build --prod --output-path=../deployment/angular-dist
```

### AWS S3 Deployment
```bash
aws s3 sync ./dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Contributing

1. Follow Angular style guide
2. Use TypeScript strict mode
3. Write unit tests for all components
4. Follow reactive programming patterns
5. Update documentation for new features

## License

MIT License - Part of the Cloud Cost Monitoring Solution