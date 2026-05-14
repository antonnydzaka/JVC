import { useState } from 'react'
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react'

const API_BASE_URL = '/api'

export default function InvoiceValidation() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!files || files.length === 0) return

    setLoading(true)
    setError(null)
    setResults(null)

    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    try {
      const response = await fetch(`${API_BASE_URL}/invoice/validate`, {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Failed to validate invoices')
      
      setResults(data)
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
          <label>Invoice Images</label>
          <div className="file-drop-area" onClick={() => document.getElementById('file-upload').click()}>
            <UploadCloud className="file-drop-icon" size={48} />
            <p>{files.length > 0 ? `${files.length} file(s) selected` : 'Click to browse or drag and drop your images here'}</p>
            <input 
              id="file-upload" 
              type="file" 
              accept="image/*" 
              multiple
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading || files.length === 0}>
          {loading ? (
            <><div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> Validating Batch...</>
          ) : 'Validate Invoices'}
        </button>
      </form>

      {error && (
        <div className="result-card" style={{ borderColor: 'var(--danger)' }}>
          <p style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} /> {error}
          </p>
        </div>
      )}

      {results && Array.isArray(results) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
          {results.map((res, index) => (
            <div key={index} className="result-card" style={{ borderColor: res.status_validasi === 'Sesuai' ? 'var(--success)' : (res.status_validasi === 'Tidak Ditemukan' ? 'var(--warning)' : 'var(--danger)') }}>
              <h3 style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: res.status_validasi === 'Sesuai' ? 'var(--success)' : (res.status_validasi === 'Tidak Ditemukan' ? 'var(--warning)' : 'var(--danger)'),
                marginBottom: '1rem'
              }}>
                {res.status_validasi === 'Sesuai' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                {res.filename_or_index || `Image ${index + 1}`} - Status: {res.status_validasi}
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>Matched Transaction ID:</strong> {res.matched_transaction_id || 'None'}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Reason:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{res.alasan}</p>
              </div>

              <div>
                <strong>Extracted Data:</strong>
                <pre style={{ background: 'rgba(0,0,0,0.05)', padding: '1rem', borderRadius: '0.5rem', marginTop: '0.5rem', fontSize: '0.875rem', overflowX: 'auto' }}>
                  {JSON.stringify(res.data_terbaca_dari_foto || res, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
