import { useState, useEffect } from 'react'
import { Plus, Trash2, FileText } from 'lucide-react'

const API_BASE_URL = '/api'

export default function TransactionInput() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadMessage, setUploadMessage] = useState('')
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

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadFile) return

    setLoading(true)
    setUploadMessage('')

    const formData = new FormData()
    formData.append('file', uploadFile)

    try {
      const res = await fetch(`${API_BASE_URL}/transactions/upload`, {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      if (res.ok) {
        setUploadMessage(data.message || 'Upload successful')
        setUploadFile(null)
        fetchTransactions()
      } else {
        setUploadMessage(`Error: ${data.detail || 'Upload failed'}`)
      }
    } catch (err) {
      console.error('Failed to upload file', err)
      setUploadMessage('Error uploading file')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        }),
      })
      
      if (res.ok) {
        setFormData({
          ...formData,
          amount: '',
          description: ''
        })
        fetchTransactions()
      }
    } catch (err) {
      console.error('Failed to save transaction', err)
    } finally {
      setLoading(false)
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
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
  }

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}><FileText className="file-drop-icon" size={24} /> Transaction Data Input</h2>
      </div>

      <div className="grid-2">
        {/* Form Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 600 }}>Manual Input</h3>
            <form onSubmit={handleSubmit} style={{ background: 'var(--bg-inner)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" className="form-input" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Account Type</label>
                  <select className="form-input" value={formData.account_type} onChange={(e) => setFormData({...formData, account_type: e.target.value})}>
                    <option value="Revenue">Revenue</option>
                    <option value="Expense">Expense</option>
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Amount (IDR)</label>
                <input type="number" className="form-input" required min="0" step="0.01" placeholder="Enter amount..." value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <input type="text" className="form-input" required placeholder="What was this for?" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>

              <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {loading ? <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : <><Plus size={18} /> Add Transaction</>}
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 600 }}>Batch Upload (Excel/CSV)</h3>
          <form onSubmit={handleUpload} style={{ background: 'var(--bg-inner)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="file-drop-area" onClick={() => document.getElementById('batch-upload').click()} style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '0.5rem' }}>
              <FileText className="file-drop-icon" size={48} style={{ margin: '0 auto', color: 'var(--text-muted)' }} />
              <p style={{ marginTop: '1rem', color: 'var(--text)' }}>{uploadFile ? uploadFile.name : 'Click to browse or drag and drop your CSV/Excel file here'}</p>
              <input 
                id="batch-upload" 
                type="file" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                style={{ display: 'none' }} 
                onChange={(e) => setUploadFile(e.target.files[0])}
              />
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading || !uploadFile} style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {loading ? <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> : <><Plus size={18} /> Upload Transactions</>}
            </button>
            {uploadMessage && <p style={{ color: 'var(--success)', textAlign: 'center', marginTop: '0.5rem' }}>{uploadMessage}</p>}
          </form>
          </div>
        </div>

        {/* List Section */}
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 600 }}>Current Transactions</h3>
          <div style={{ background: 'var(--bg-inner)', borderRadius: '0.5rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-thead)', backdropFilter: 'blur(4px)' }}>
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
                      <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
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
