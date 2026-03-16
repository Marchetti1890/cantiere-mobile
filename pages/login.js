import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { C, Btn } from '../components/ui'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function login(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: C.surfaceHigh, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: '12px 14px', color: C.text, fontSize: 15,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginTop: 6,
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🏗️</div>
          <h1 style={{ color: C.accent, fontSize: 26, fontWeight: 900, margin: 0 }}>CantiereMobile</h1>
          <p style={{ color: C.textMuted, marginTop: 8, fontSize: 13 }}>Gestione trasporti di cantiere</p>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
          <form onSubmit={login}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nome@cantiere.it" required style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
            </div>
            {error && (
              <div style={{ background: '#2a0a0a', border: '1px solid #e74c3c44', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#e74c3c', marginBottom: 16 }}>
                ⚠️ {error}
              </div>
            )}
            <Btn type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Accesso in corso...' : 'Entra →'}
            </Btn>
          </form>
        </div>
        <p style={{ textAlign: 'center', color: C.textMuted, fontSize: 12, marginTop: 20 }}>Account creati dall'amministratore</p>
      </div>
    </div>
  )
}
