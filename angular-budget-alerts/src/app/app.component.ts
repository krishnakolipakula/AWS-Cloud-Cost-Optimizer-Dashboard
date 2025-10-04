import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app">
      <!-- Header -->
      <header class="app-header">
        <div class="container">
          <h1>
            <i class="fas fa-chart-line me-2"></i>
            Cloud Budget & Alerts Manager
          </h1>
          <p class="subtitle">
            Monitor, manage, and control your AWS spending with intelligent budget controls and real-time alerts
          </p>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="container mt-4">
        <ul class="nav nav-tabs" id="mainTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="dashboard-tab" data-bs-toggle="tab" 
                    data-bs-target="#dashboard" type="button" role="tab">
              <i class="fas fa-tachometer-alt me-2"></i>Dashboard
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="budgets-tab" data-bs-toggle="tab" 
                    data-bs-target="#budgets" type="button" role="tab">
              <i class="fas fa-wallet me-2"></i>Budgets
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="alerts-tab" data-bs-toggle="tab" 
                    data-bs-target="#alerts" type="button" role="tab">
              <i class="fas fa-bell me-2"></i>Alerts
            </button>
          </li>
        </ul>
      </nav>

      <!-- Tab Content -->
      <div class="container mt-4">
        <div class="tab-content" id="mainTabsContent">
          <!-- Dashboard Tab -->
          <div class="tab-pane fade show active" id="dashboard" role="tabpanel">
            <app-dashboard></app-dashboard>
          </div>

          <!-- Budgets Tab -->
          <div class="tab-pane fade" id="budgets" role="tabpanel">
            <div class="row">
              <div class="col-md-8">
                <app-budget-list></app-budget-list>
              </div>
              <div class="col-md-4">
                <app-budget-form></app-budget-form>
              </div>
            </div>
          </div>

          <!-- Alerts Tab -->
          <div class="tab-pane fade" id="alerts" role="tabpanel">
            <app-alert-list></app-alert-list>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="container mt-5 pt-4 border-top text-center text-muted">
        <p>&copy; 2025 Cloud Cost Monitoring Solution. Built for Amazon Web Services optimization.</p>
        <small>🚀 Serverless • ⚡ Real-time • 📊 Analytics • 💰 Cost-effective</small>
      </footer>
    </div>
  `,
  styles: [`
    .app {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .container {
      flex: 1;
    }
    
    footer {
      margin-top: auto;
      padding: 2rem 0;
    }
  `]
})
export class AppComponent {
  title = 'Cloud Budget & Alerts Manager';
}