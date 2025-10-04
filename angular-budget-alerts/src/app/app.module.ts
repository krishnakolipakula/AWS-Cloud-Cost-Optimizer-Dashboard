import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BudgetListComponent } from './components/budget-list/budget-list.component';
import { BudgetFormComponent } from './components/budget-form/budget-form.component';
import { AlertListComponent } from './components/alert-list/alert-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BudgetDetailComponent } from './components/budget-detail/budget-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    BudgetListComponent,
    BudgetFormComponent,
    AlertListComponent,
    DashboardComponent,
    BudgetDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }