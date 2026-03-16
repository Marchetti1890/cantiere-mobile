import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { C, Badge, Card, Btn, Input, Modal, Row, Spinner, Empty } from './ui'

export default function ViewCarpentiere({ utente }) {
  const [trasporti, setTrasporti] = useState([])
  const [cantieri, setCantieri] = useState([])
  const [utenti, setUtenti] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedT, setSelectedT] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    cantiere_id: '', data: '', ora_inizio: '08:00', ore_previste: '',
    materiale: '', quantita: '', note: '',
  })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [t, c, u] = await Promise.all([
      supabase.from('trasporti').select('*').eq('richiesta_da', utente.id).order('data', { ascending: false }),
      supabase.from('cantieri').select('*').eq('attivo', true),
      supabase.from('utenti').select('*'),
    ])
    setTrasporti(t.data || [])
    setCantieri(c.data || [])
    setUtenti(u.data || [])
    if (utente.cantiere_id) setForm(f => ({ ...f, cantiere_id: utente.cantiere_id }))
    setLoading(false)
  }

  function getNome(id, lista) {
    const item = lista.find(i => i.id === id)
    return item ? (item.nome + (item.cognome ? ' ' + item.cognome : '')) : '—'
  }

  async function invia() {
    if (!form.cantiere_id || !form.data || !form.materiale) return alert('Compila i campi obbligatori')
    setSaving(true)
    await supabase.from('trasporti').insert({
      cantiere_id: form.cantiere_id,
      richiesta_da: utente.id,
      data: form.data,
      ora_inizio_prevista: form.ora_inizio,
      ore_previste: Number(form.ore_previste) || null,
      materiale: form.materiale,
      quantita: form.quantita || null,
      note_carpentiere: form.note || null,
      stato: 'RICHIESTO',
    })
    await loadAll()
    setShowForm(false)
    setForm({ cantiere_id: utente.cantiere_id || '', data: '', ora_inizio: '08:00', ore_previste: '', materiale: '', quantita: '', note: '' })
    setSaving(false)
  }

  if (loading) return <Spinner />

  return (
    <div>
      <Btn onClick={() => setShowForm(true)} style={{ width: '100%', marginBottom: 20, padding: '14px 20px', fontSize: 16 }}>
        ➕ Nuova Richiesta Trasporto
      </Btn>

      <h3 style={{ color: C.textMuted, fontSize: 12, marginBottom: 12, fontWeight: 600, letterSpacing: 1 }}>I MIEI TRASPORTI</h3>

      {trasporti.length === 0 ? <Empty text="Nessuna richiesta inviata" /> : trasporti.map(t => (
        <Card key={t.id} onClick={() => setSelectedT(t)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 3 }}>{getNome(t.cantiere_id, cantieri)}</div>
              <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 3 }}>{t.data} · {t.ora_inizio_prevista?.slice(0,5)}</div>
              <div style={{ fontSize: 13 }}>{t.materiale}</div>
              {t.autista_id && (
                <div style={{ fontSize: 12, color: C.blue, marginTop: 4 }}>🚚 {getNome(t.autista_id, utenti)}</div>
              )}
            </div>
            <Badge stato={t.stato} />
          </div>
        </Card>
      ))}

      {showForm && (
        <Modal title="Nuova Richiesta Trasporto" onClose={() => setShowForm(false)}>
          <Input label="Cantiere" value={form.cantiere_id} onChange={v => setForm(f=>({...f,cantiere_id:v}))} required
            options={cantieri.map(c => ({ value: c.id, label: c.nome }))} />
          <Input label="Data" value={form.data} onChange={v => setForm(f=>({...f,data:v}))} type="date" required />
          <Input label="Ora indicativa" value={form.ora_inizio} onChange={v => setForm(f=>({...f,ora_inizio:v}))} type="time" />
          <Input label="Ore previste" value={form.ore_previste} onChange={v => setForm(f=>({...f,ore_previste:v}))} type="number" placeholder="Es. 3" />
          <Input label="Materiale / Carico" value={form.materiale} onChange={v => setForm(f=>({...f,materiale:v}))} required placeholder="Es. Ferro e calcestruzzo" />
          <Input label="Quantità (opzionale)" value={form.quantita} onChange={v => setForm(f=>({...f,quantita:v}))} placeholder="Es. 5 bancali" />
          <Input label="Note per il magazzino" value={form.note} onChange={v => setForm(f=>({...f,note:v}))} rows={3} placeholder="Es. Urgente per gettata..." />
          <Btn onClick={invia} disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Invio...' : '📤 Invia Richiesta'}
          </Btn>
        </Modal>
      )}

      {selectedT && (
        <Modal title="Dettaglio Richiesta" onClose={() => setSelectedT(null)}>
          <Row label="Cantiere" value={getNome(selectedT.cantiere_id, cantieri)} />
          <Row label="Data" value={selectedT.data} />
          <Row label="Ora prevista" value={selectedT.ora_inizio_prevista?.slice(0,5)} />
          <Row label="Ore previste" value={selectedT.ore_previste ? `${selectedT.ore_previste}h` : null} />
          <Row label="Materiale" value={selectedT.materiale} />
          <Row label="Quantità" value={selectedT.quantita} />
          {selectedT.note_carpentiere && <Row label="Note" value={selectedT.note_carpentiere} />}
          <Row label="Mezzo assegnato" value={selectedT.mezzo_id ? '✅ Assegnato' : '⏳ In attesa'} />
          <Row label="Autista" value={selectedT.autista_id ? getNome(selectedT.autista_id, utenti) : 'Non ancora assegnato'} />
          <div style={{ marginTop: 12 }}><Badge stato={selectedT.stato} /></div>
        </Modal>
      )}
    </div>
  )
}
