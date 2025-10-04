import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import { BillingRecord } from './types/BillingTypes';
import { generateMockData } from './utils/mockDataGenerator';

function App() {
  const [billingData, setBillingData] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to load billing data
    const loadData = async () => {
      try {
        setLoading(true);
        // In a real application, this would be an API call
        const mockData = generateMockData(1000); // Generate 1000+ mock records
        setBillingData(mockData);
      } catch (error) {
        console.error('Error loading billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Dashboard billingData={billingData} />
    </div>
  );
}

export default App;