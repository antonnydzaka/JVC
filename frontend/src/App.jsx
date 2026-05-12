import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import FinancialReport from './components/FinancialReport'
import InvoiceValidation from './components/InvoiceValidation'
import TransactionInput from './components/TransactionInput'

function App() {
  const [activeTab, setActiveTab] = useState('data-input')

  // Load saved theme preference, default to 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nexfinance-theme') || 'light'
  })

  // Apply theme to <html> element and save preference
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('nexfinance-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="app-container">
      <header>
        <h1>NexFinance Dashboard</h1>
        <p>AI-Powered Financial Analytics &amp; Automated Auditing</p>

        <button
          className="theme-toggle no-print"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
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
