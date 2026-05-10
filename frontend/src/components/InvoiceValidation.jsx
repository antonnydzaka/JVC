import { useState } from 'react'
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8000/api'

export default function InvoiceValidation() {
  const [file, setFile] = useState(null)
  const [invoiceId, setInvoiceId] = useState('1')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file || !invoiceId) return

    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('invoice_id', invoiceId)

    try {
      const response = await fetch(`${API_BASE_URL}/invoice/validate`, {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Failed to validate invoice')
      
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="section-title"><UploadCloud className="file-drop-icon" size={24} /> AI Invoice Validation</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Upload a receipt or invoice photo. The AI will extract data and cross-check it against our database records.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Invoice ID (Database)</label>
          <input 
            type="number" 
            className="form-input" 
            value={invoiceId} 
            onChange={(e) => setInvoiceId(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Invoice Image</label>
          <div className="file-drop-area" onClick={() => document.getElementById('file-upload').click()}>
            <UploadCloud className="file-drop-icon" size={48} />
            <p>{file ? file.name : 'Click to browse or drag and drop your image here'}</p>
            <input 
              id="file-upload" 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading || !file}>
          {loading ? (
            <><div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> Validating with Gemini...</>
          ) : 'Validate Invoice'}
        </button>
      </form>

      {error && (
        <div className="result-card" style={{ borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} /> {error}
          </p>
        </div>
      )}

      {result && (
        <div className="result-card" style={{ borderColor: result.status_validasi === 'Sesuai' ? 'var(--success)' : 'var(--danger)' }}>
          <h3 style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            color: result.status_validasi === 'Sesuai' ? 'var(--success)' : 'var(--danger)',
            marginBottom: '1rem'
          }}>
            {result.status_validasi === 'Sesuai' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            Status: {result.status_validasi}
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <strong>Reason:</strong>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{result.alasan}</p>
          </div>

          <div>
            <strong>Extracted Data:</strong>
            <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.5rem', fontSize: '0.875rem', overflowX: 'auto' }}>
              {JSON.stringify(result.data_terbaca_dari_foto || result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
