import * as AWS from 'aws-sdk';
import { Budget, Alert, CreateAlertRequest } from '../models/types';

export class CloudWatchService {
  private cloudWatch: AWS.CloudWatch;
  private sns: AWS.SNS;
  private region: string;

  constructor() {
    this.region = process.env.REGION || 'us-east-1';
    this.cloudWatch = new AWS.CloudWatch({ region: this.region });
    this.sns = new AWS.SNS({ region: this.region });
  }

  /**
   * Create CloudWatch alarm for budget monitoring
   */
  async createBudgetAlarm(budget: Budget): Promise<string> {
    const alarmName = `BudgetAlert-${budget.name}-${budget.id}`;
    
    const params: AWS.CloudWatch.PutMetricAlarmInput = {
      AlarmName: alarmName,
      AlarmDescription: `Budget alert for ${budget.name} - ${budget.service || 'All Services'}`,
      ActionsEnabled: true,
      AlarmActions: [
        budget.notifications.snsTopicArn || process.env.BUDGET_ALERTS_TOPIC_ARN!
      ],
      MetricName: 'EstimatedCharges',
      Namespace: 'AWS/Billing',
      Statistic: 'Maximum',
      Dimensions: budget.service ? [
        {
          Name: 'ServiceName',
          Value: budget.service
        },
        {
          Name: 'Currency',
          Value: 'USD'
        }
      ] : [
        {
          Name: 'Currency',
          Value: 'USD'
        }
      ],
      Period: 86400, // 24 hours
      EvaluationPeriods: 1,
      Threshold: budget.amount * (budget.thresholds.warning / 100),
      ComparisonOperator: 'GreaterThanThreshold',
      TreatMissingData: 'notBreaching'
    };

    try {
      await this.cloudWatch.putMetricAlarm(params).promise();
      console.log(`Created CloudWatch alarm: ${alarmName}`);
      return alarmName;
    } catch (error) {
      console.error('Error creating CloudWatch alarm:', error);
      throw error;
    }
  }

  /**
   * Update existing budget alarm
   */
  async updateBudgetAlarm(budget: Budget, alarmName: string): Promise<void> {
    const params: AWS.CloudWatch.PutMetricAlarmInput = {
      AlarmName: alarmName,
      AlarmDescription: `Budget alert for ${budget.name} - ${budget.service || 'All Services'}`,
      ActionsEnabled: budget.isActive,
      AlarmActions: [
        budget.notifications.snsTopicArn || process.env.BUDGET_ALERTS_TOPIC_ARN!
      ],
      MetricName: 'EstimatedCharges',
      Namespace: 'AWS/Billing',
      Statistic: 'Maximum',
      Dimensions: budget.service ? [
        {
          Name: 'ServiceName',
          Value: budget.service
        },
        {
          Name: 'Currency',
          Value: 'USD'
        }
      ] : [
        {
          Name: 'Currency',
          Value: 'USD'
        }
      ],
      Period: 86400,
      EvaluationPeriods: 1,
      Threshold: budget.amount * (budget.thresholds.warning / 100),
      ComparisonOperator: 'GreaterThanThreshold',
      TreatMissingData: 'notBreaching'
    };

    try {
      await this.cloudWatch.putMetricAlarm(params).promise();
      console.log(`Updated CloudWatch alarm: ${alarmName}`);
    } catch (error) {
      console.error('Error updating CloudWatch alarm:', error);
      throw error;
    }
  }

  /**
   * Delete budget alarm
   */
  async deleteBudgetAlarm(alarmName: string): Promise<void> {
    const params = {
      AlarmNames: [alarmName]
    };

    try {
      await this.cloudWatch.deleteAlarms(params).promise();
      console.log(`Deleted CloudWatch alarm: ${alarmName}`);
    } catch (error) {
      console.error('Error deleting CloudWatch alarm:', error);
      throw error;
    }
  }

  /**
   * Get alarm history
   */
  async getAlarmHistory(alarmName: string, maxRecords: number = 100): Promise<AWS.CloudWatch.AlarmHistoryItems> {
    const params: AWS.CloudWatch.DescribeAlarmHistoryInput = {
      AlarmName: alarmName,
      MaxRecords: maxRecords,
      HistoryItemType: 'StateUpdate'
    };

    try {
      const result = await this.cloudWatch.describeAlarmHistory(params).promise();
      return result.AlarmHistoryItems || [];
    } catch (error) {
      console.error('Error getting alarm history:', error);
      throw error;
    }
  }

  /**
   * Get current alarm state
   */
  async getAlarmState(alarmName: string): Promise<AWS.CloudWatch.MetricAlarm | null> {
    const params = {
      AlarmNames: [alarmName]
    };

    try {
      const result = await this.cloudWatch.describeAlarms(params).promise();
      return result.MetricAlarms?.[0] || null;
    } catch (error) {
      console.error('Error getting alarm state:', error);
      throw error;
    }
  }

  /**
   * Publish custom metrics to CloudWatch
   */
  async publishBudgetMetrics(budgetId: string, currentSpend: number, budgetAmount: number): Promise<void> {
    const params: AWS.CloudWatch.PutMetricDataInput = {
      Namespace: 'CloudCostMonitoring/Budgets',
      MetricData: [
        {
          MetricName: 'CurrentSpend',
          Value: currentSpend,
          Unit: 'None',
          Dimensions: [
            {
              Name: 'BudgetId',
              Value: budgetId
            }
          ],
          Timestamp: new Date()
        },
        {
          MetricName: 'BudgetUtilization',
          Value: (currentSpend / budgetAmount) * 100,
          Unit: 'Percent',
          Dimensions: [
            {
              Name: 'BudgetId',
              Value: budgetId
            }
          ],
          Timestamp: new Date()
        },
        {
          MetricName: 'RemainingBudget',
          Value: Math.max(0, budgetAmount - currentSpend),
          Unit: 'None',
          Dimensions: [
            {
              Name: 'BudgetId',
              Value: budgetId
            }
          ],
          Timestamp: new Date()
        }
      ]
    };

    try {
      await this.cloudWatch.putMetricData(params).promise();
      console.log(`Published metrics for budget ${budgetId}`);
    } catch (error) {
      console.error('Error publishing metrics:', error);
      throw error;
    }
  }

  /**
   * Create SNS topic for budget alerts
   */
  async createAlertTopic(topicName: string): Promise<string> {
    const params = {
      Name: topicName,
      DisplayName: 'Budget Alerts for Cloud Cost Monitoring'
    };

    try {
      const result = await this.sns.createTopic(params).promise();
      console.log(`Created SNS topic: ${result.TopicArn}`);
      return result.TopicArn!;
    } catch (error) {
      console.error('Error creating SNS topic:', error);
      throw error;
    }
  }

  /**
   * Subscribe email to SNS topic
   */
  async subscribeEmailToTopic(topicArn: string, email: string): Promise<string> {
    const params = {
      TopicArn: topicArn,
      Protocol: 'email',
      Endpoint: email
    };

    try {
      const result = await this.sns.subscribe(params).promise();
      console.log(`Subscribed ${email} to topic ${topicArn}`);
      return result.SubscriptionArn!;
    } catch (error) {
      console.error('Error subscribing email to topic:', error);
      throw error;
    }
  }

  /**
   * Publish alert message to SNS
   */
  async publishAlert(alert: CreateAlertRequest): Promise<void> {
    const topicArn = process.env.BUDGET_ALERTS_TOPIC_ARN!;
    
    const message = {
      alert: {
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        budgetId: alert.budgetId,
        currentSpend: alert.currentSpend,
        budgetAmount: alert.budgetAmount,
        percentageUsed: alert.percentageUsed,
        threshold: alert.threshold,
        service: alert.service,
        region: alert.region,
        timestamp: new Date().toISOString()
      }
    };

    const params = {
      TopicArn: topicArn,
      Subject: `🚨 Budget Alert: ${alert.title}`,
      Message: JSON.stringify(message, null, 2),
      MessageStructure: 'raw'
    };

    try {
      await this.sns.publish(params).promise();
      console.log(`Published alert for budget ${alert.budgetId}`);
    } catch (error) {
      console.error('Error publishing alert:', error);
      throw error;
    }
  }

  /**
   * Get metric statistics for cost analysis
   */
  async getCostMetrics(
    startTime: Date,
    endTime: Date,
    service?: string
  ): Promise<AWS.CloudWatch.Datapoints> {
    const params: AWS.CloudWatch.GetMetricStatisticsInput = {
      Namespace: 'AWS/Billing',
      MetricName: 'EstimatedCharges',
      Dimensions: service ? [
        {
          Name: 'ServiceName',
          Value: service
        },
        {
          Name: 'Currency',
          Value: 'USD'
        }
      ] : [
        {
          Name: 'Currency',
          Value: 'USD'
        }
      ],
      StartTime: startTime,
      EndTime: endTime,
      Period: 86400, // Daily
      Statistics: ['Maximum']
    };

    try {
      const result = await this.cloudWatch.getMetricStatistics(params).promise();
      return result.Datapoints || [];
    } catch (error) {
      console.error('Error getting cost metrics:', error);
      throw error;
    }
  }

  /**
   * Create dashboard for budget monitoring
   */
  async createBudgetDashboard(budgets: Budget[]): Promise<void> {
    const dashboardName = 'CloudCostMonitoring-Budgets';
    
    const widgets = budgets.map((budget, index) => ({
      type: 'metric',
      x: (index % 3) * 8,
      y: Math.floor(index / 3) * 6,
      width: 8,
      height: 6,
      properties: {
        metrics: [
          ['CloudCostMonitoring/Budgets', 'CurrentSpend', 'BudgetId', budget.id],
          ['.', 'BudgetUtilization', '.', '.'],
          ['.', 'RemainingBudget', '.', '.']
        ],
        period: 3600,
        stat: 'Average',
        region: this.region,
        title: `Budget: ${budget.name}`,
        yAxis: {
          left: {
            min: 0
          }
        }
      }
    }));

    const dashboardBody = {
      widgets
    };

    const params = {
      DashboardName: dashboardName,
      DashboardBody: JSON.stringify(dashboardBody)
    };

    try {
      await this.cloudWatch.putDashboard(params).promise();
      console.log(`Created/Updated CloudWatch dashboard: ${dashboardName}`);
    } catch (error) {
      console.error('Error creating dashboard:', error);
      throw error;
    }
  }
}