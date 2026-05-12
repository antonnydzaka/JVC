import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Activity, Download, FileText, MonitorPlay, Maximize, X } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const API_BASE_URL = '/api'

export default function FinancialReport() {
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [error, setError] = useState(null)
  const [presentationMode, setPresentationMode] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/financial-report`)
      if (!response.ok) throw new Error('Failed to fetch report')
      const data = await response.json()
      setReportData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadCSV = () => {
    if (!reportData) return
    let csvContent = "data:text/csv;charset=utf-8,"
    csvContent += "Category,Item,Amount\n"
    
    const flatten = (obj, prefix = '') => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          flatten(obj[key], `${prefix}${key} > `)
        } else {
          csvContent += `${prefix.slice(0, -3)},${key},${obj[key]}\n`
        }
      }
    }
    flatten(reportData)

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "financial_report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading && !reportData) {
    return (
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>AI is analyzing transactions and generating reports...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-panel">
        <h2 className="section-title" style={{ color: 'var(--danger)' }}>Error generating report</h2>
        <p>{error}</p>
        <button className="btn-primary" style={{ marginTop: '1rem', width: 'auto' }} onClick={fetchReport}>Retry</button>
      </div>
    )
  }

  if (!reportData) return null

  // Chart Setup for Profit & Loss
  const plData = reportData['Profit and Loss Statement'] || reportData['profit_and_loss_statement'] || reportData['profit_and_loss'] || {}
  const bsData = reportData['Balance Sheet'] || reportData['balance_sheet'] || {}
  const cfData = reportData['Cash Flow Statement'] || reportData['cash_flow_statement'] || reportData['cash_flow'] || {}

  const chartData = {
    labels: ['Revenue', 'Expenses', 'Net Profit'],
    datasets: [
      {
        label: 'Amount (IDR)',
        data: [
          plData.Total_Pendapatan || plData.Pendapatan || plData.revenue?.total_revenue || 0, 
          plData.Total_Beban || plData.Beban || plData.expenses?.total_expenses || 0, 
          plData.Laba_Bersih || plData.net_income || 0
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(99, 102, 241, 0.6)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
          'rgb(99, 102, 241)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value || 0);
  }

  return (
    <div className={`glass-panel ${presentationMode ? 'presentation-active' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {presentationMode && (
        <button className="btn-primary no-print" onClick={() => setPresentationMode(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', width: 'auto', zIndex: 1000 }}>
          <X size={18} /> Exit Presentation
        </button>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}><Activity className="file-drop-icon" size={24} /> Financial Statements</h2>
        <div className="no-print" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleDownloadCSV} title="Download as CSV (Google Sheets)">
            <Download size={18} /> CSV
          </button>
          <button className="btn-secondary" onClick={handlePrint} title="Save as PDF">
            <FileText size={18} /> PDF
          </button>
          {!presentationMode && (
             <button className="btn-secondary" onClick={() => setPresentationMode(true)} title="Presentation Mode">
               <MonitorPlay size={18} /> Present
             </button>
          )}
          <button className="btn-primary" onClick={fetchReport} disabled={loading}>
            {loading ? <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : 'Refresh Report'}
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* Profit & Loss Chart */}
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 600 }}>Profit & Loss Overview</h3>
          <div style={{ background: 'var(--bg-inner)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        
        {/* Balance Sheet Summary */}
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 600 }}>Balance Sheet</h3>
          <div style={{ background: 'var(--bg-inner)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Assets</span>
              <span style={{ fontWeight: 'bold', color: 'rgb(16, 185, 129)' }}>{formatCurrency(bsData.Total_Aset || bsData.assets?.total_assets)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Liabilities</span>
              <span style={{ fontWeight: 'bold', color: 'rgb(239, 68, 68)' }}>{formatCurrency(bsData.Total_Kewajiban || bsData.liabilities?.total_liabilities)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Equity</span>
              <span style={{ fontWeight: 'bold', color: 'rgb(99, 102, 241)' }}>{formatCurrency(bsData.Total_Ekuitas || bsData.equity?.total_equity)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Cash Flow Statement Summary */}
        <div>
           <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 600 }}>Cash Flow Statement</h3>
           <div style={{ background: 'var(--bg-inner)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Operating Activities</span>
              <span style={{ fontWeight: 'bold' }}>{formatCurrency(cfData.Arus_Kas_Operasional?.Net_Arus_Kas || cfData.operating_activities?.net_cash_from_operating_activities)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Investing Activities</span>
              <span style={{ fontWeight: 'bold' }}>{formatCurrency(cfData.Arus_Kas_Investasi?.Net_Arus_Kas || cfData.investing_activities?.net_cash_from_investing_activities)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Financing Activities</span>
              <span style={{ fontWeight: 'bold' }}>{formatCurrency(cfData.Arus_Kas_Pendanaan?.Net_Arus_Kas || cfData.financing_activities?.net_cash_from_financing_activities)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>Ending Cash Balance</span>
              <span style={{ fontWeight: 'bold', color: 'rgb(16, 185, 129)', fontSize: '1.1rem' }}>{formatCurrency(cfData.Saldo_Kas_Akhir || cfData.ending_cash_balance)}</span>
            </div>
          </div>
        </div>

        {/* Raw JSON fallback */}
        <div>
           <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 600 }}>Raw Output Data</h3>
           <pre style={{ background: 'var(--bg-inner)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', overflowX: 'auto', maxHeight: '250px', fontSize: '0.875rem' }}>
             {JSON.stringify(reportData, null, 2)}
           </pre>
        </div>
      </div>
    </div>
  )
}
