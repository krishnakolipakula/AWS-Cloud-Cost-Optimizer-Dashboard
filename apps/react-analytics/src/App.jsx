import React from 'react'
import './App.css'
import CostChart from './components/CostChart'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AWS Cloud Cost Analytics</h1>
        <p>Interactive cost visualization and analytics dashboard</p>
      </header>
      
      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <h2>Cost Overview</h2>
          <CostChart />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
          <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Filters</h3>
            <p>Date range, service, and region filters will go here</p>
          </div>
          
          <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Cost Summary</h3>
            <p>Total spend: $85.39</p>
            <p>This month: $85.39</p>
            <p>Trend: ↗️ +12%</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
