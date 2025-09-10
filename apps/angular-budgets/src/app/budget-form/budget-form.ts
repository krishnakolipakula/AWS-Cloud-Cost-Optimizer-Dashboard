import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budget-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './budget-form.html',
  styleUrl: './budget-form.css'
})
export class BudgetForm {
  budget = {
    amount: 100,
    period: 'monthly',
    alertsEnabled: true,
    alertThreshold: 80
  };

  budgets: any[] = [
    { id: 1, amount: 150, period: 'monthly', alertsEnabled: true, alertThreshold: 80, currentSpend: 45.50 },
    { id: 2, amount: 500, period: 'monthly', alertsEnabled: false, alertThreshold: 90, currentSpend: 320.75 }
  ];

  onSubmit() {
    console.log('Budget submitted:', this.budget);
    // In real app, this would call the API
    this.budgets.push({
      id: this.budgets.length + 1,
      ...this.budget,
      currentSpend: 0
    });
    
    // Reset form
    this.budget = {
      amount: 100,
      period: 'monthly',
      alertsEnabled: true,
      alertThreshold: 80
    };
  }

  deleteBudget(id: number) {
    this.budgets = this.budgets.filter(b => b.id !== id);
  }
}
