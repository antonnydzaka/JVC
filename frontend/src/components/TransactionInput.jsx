import { useState, useEffect } from 'react'
import { Plus, Trash2, FileText } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8000/api'

export default function TransactionInput() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    account_type: 'Revenue',
    description: ''
  })

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`)
      if (res.ok) {
        const data = await res.json()
        setTransactions(data)
      }
    } catch (err) {
      console.error('Failed to fetch transactions', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })
      if (res.ok) {
        setFormData({ ...formData, amount: '', description: '' })
        fetchTransactions()
      }
    } catch (err) {
      console.error('Failed to add transaction', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchTransactions()
      }
    } catch (err) {
      console.error('Failed to delete transaction', err)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  }

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}><FileText className="file-drop-icon" size={24} /> Transaction Data Input</h2>
      </div>

      <div className="grid-2">
        {/* Form Section */}
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 600 }}>Add New Transaction</h3>
          <form onSubmit={handleSubmit} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Date</label>
              <input 
                type="date" 
                required 
                className="input-field"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Account Type</label>
              <select 
                className="input-field"
                value={formData.account_type}
                onChange={(e) => setFormData({...formData, account_type: e.target.value})}
              >
                <option value="Asset">Asset</option>
                <option value="Liability">Liability</option>
                <option value="Equity">Equity</option>
                <option value="Revenue">Revenue</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Amount (USD)</label>
              <input 
                type="number" 
                step="0.01"
                required 
                className="input-field"
                placeholder="e.g. 1500.00"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Description</label>
              <input 
                type="text" 
                required 
                className="input-field"
                placeholder="e.g. Office Supplies"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Add Transaction
            </button>
          </form>
        </div>

        {/* List Section */}
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 600 }}>Current Transactions</h3>
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: '0.5rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(4px)' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Description</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>Type</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found.</td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.75rem 1rem' }}>{tx.date}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{tx.description}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.5rem', 
                            borderRadius: '999px', 
                            fontSize: '0.75rem',
                            background: tx.account_type === 'Revenue' || tx.account_type === 'Asset' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: tx.account_type === 'Revenue' || tx.account_type === 'Asset' ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'
                          }}>
                            {tx.account_type}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '500' }}>{formatCurrency(tx.amount)}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDelete(tx.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.25rem' }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
