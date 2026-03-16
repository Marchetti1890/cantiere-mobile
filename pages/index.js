import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { C, Spinner } from '../components/ui'
import ViewMagazzino from '../components/ViewMagazzino'
import ViewCarpentiere from '../components/ViewCarpentiere'
import ViewAutista from '../components/ViewAutista'

const RUOLI = {
  ADMIN:       { label: 'Admin',                icon: '⚙️' },
  MAGAZZINO:   { label: 'Resp. Magazzino',      icon: '📦' },
  CARPENTIERE: { label: 'Carpentiere',          icon: '👷' },
  AUTISTA:     { label: 'Autista',              icon: '🚚' },
}

export default function Home({ session }) {
  const router = useRouter()
  const [utente, setUtente] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session === undefined) return  // still loading
    if (!session) { router.push('/login'); return }
    loadUtente(session.user.id)
  }, [session])

  async function loadUtente(id) {
    const { data } = await supabase.from('utenti').select('*').eq('id', id).single()
    setUtente(data)
    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (session === undefined || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </div>
    )
  }

  if (!utente) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ color: C.text, marginBottom: 8 }}>Profilo non trovato nel sistema.</div>
          <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 20 }}>Contatta l'amministratore per creare il tuo profilo.</div>
          <button onClick={logout} style={{ background: C.surfaceHigh, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Logout
          </button>
        </div>
      </div>
    )
  }

  const ruolo = RUOLI[utente.ruolo]

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🏗️</span>
          <span style={{ color: C.accent, fontWeight: 900, fontSize: 15 }}>CantiereMobile</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{ruolo?.icon} {utente.nome}</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>{ruolo?.label}</div>
          </div>
          <button onClick={logout} style={{
            background: C.surfaceHigh, border: `1px solid ${C.border}`,
            color: C.textMuted, borderRadius: 8, padding: '6px 12px',
            cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
          }}>Esci</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '18px 14px 80px' }}>
        {utente.ruolo === 'MAGAZZINO' && <ViewMagazzino utente={utente} />}
        {utente.ruolo === 'ADMIN' && <ViewMagazzino utente={utente} />}
        {utente.ruolo === 'CARPENTIERE' && <ViewCarpentiere utente={utente} />}
        {utente.ruolo === 'AUTISTA' && <ViewAutista utente={utente} />}
      </div>
    </div>
  )
}
