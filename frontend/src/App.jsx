import { useState } from 'react'
import FinancialReport from './components/FinancialReport'
import InvoiceValidation from './components/InvoiceValidation'
import TransactionInput from './components/TransactionInput'

function App() {
  const [activeTab, setActiveTab] = useState('data-input')

  return (
    <div className="app-container">
      <header>
        <h1>NexFinance Dashboard</h1>
        <p>AI-Powered Financial Analytics & Automated Auditing</p>
      </header>

      <div className="tabs no-print">
        <button 
          className={`tab-btn ${activeTab === 'data-input' ? 'active' : ''}`}
          onClick={() => setActiveTab('data-input')}
        >
          Transaction Data
        </button>
        <button 
          className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          Financial Reports
        </button>
        <button 
          className={`tab-btn ${activeTab === 'invoice' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoice')}
        >
          Invoice Validation
        </button>
      </div>

      <main>
        {activeTab === 'data-input' && <TransactionInput />}
        {activeTab === 'report' && <FinancialReport />}
        {activeTab === 'invoice' && <InvoiceValidation />}
      </main>
    </div>
  )
}

export default App
