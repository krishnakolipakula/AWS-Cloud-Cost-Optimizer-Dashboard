import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import { BillingRecord } from './types/BillingTypes';
import { billingApi } from './services/apiService';
import { generateMockData } from './utils/mockDataGenerator';

function App() {
  const [billingData, setBillingData] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useBackend, setUseBackend] = useState(true);
  const [actualDataSource, setActualDataSource] = useState<'backend' | 'mock'>('backend');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (useBackend) {
          // Try to fetch from backend API
          try {
            const response = await billingApi.getAll({
              startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0],
              limit: 1000
            });
            setBillingData(response);
            setActualDataSource('backend');
            console.log('✅ Successfully loaded data from backend API');
            console.log(`📊 Loaded ${response.length} billing records from backend`);
          } catch (apiError) {
            console.warn('⚠️ Backend API not available, falling back to mock data:', apiError);
            setError('Backend API unavailable. Using mock data instead. Start backend with: .\\start-backend.bat');
            // Fallback to mock data if backend is not available
            const mockData = generateMockData(1000);
            setBillingData(mockData);
            setActualDataSource('mock');
            console.log('📊 Using mock data (1000 records)');
          }
        } else {
          // Use mock data directly when toggle is off
          const mockData = generateMockData(1000);
          setBillingData(mockData);
          setActualDataSource('mock');
          console.log('📊 Using mock data by user choice (1000 records)');
        }
      } catch (error) {
        console.error('Error loading billing data:', error);
        setError('Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [useBackend]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading billing data...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {error && (
        <div className="alert alert-warning alert-dismissible fade show m-3" role="alert">
          <strong>Notice:</strong> {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      {/* Data Source Toggle */}
      <div className="container mt-2">
        <div className="d-flex justify-content-end align-items-center gap-3">
          <div className={`badge ${actualDataSource === 'backend' ? 'bg-success' : 'bg-secondary'}`}>
            {actualDataSource === 'backend' ? '✓ Connected to Backend' : '⚠ Using Mock Data'}
          </div>
          <div className="form-check form-switch">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="dataSourceToggle"
              checked={useBackend}
              onChange={(e) => setUseBackend(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="dataSourceToggle">
              {useBackend ? '🌐 Try Backend API' : '📊 Use Mock Data Only'}
            </label>
          </div>
        </div>
      </div>

      <Dashboard billingData={billingData} />
    </div>
  );
}

export default App;