import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { C, Badge, Card, Btn, Input, Modal, Row, Spinner, Empty } from './ui'

export default function ViewAutista({ utente }) {
  const [trasporti, setTrasporti] = useState([])
  const [cantieri, setCantieri] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedT, setSelectedT] = useState(null)
  const [noteInput, setNoteInput] = useState('')
  const [oreInput, setOreInput] = useState('')
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [t, c] = await Promise.all([
      supabase.from('trasporti').select('*')
        .eq('autista_id', utente.id)
        .eq('data', today)
        .in('stato', ['CONFERMATO','PIANIFICATO','IN_CORSO','COMPLETATO'])
        .order('ora_inizio_prevista'),
      supabase.from('cantieri').select('*'),
    ])
    setTrasporti(t.data || [])
    setCantieri(c.data || [])
    setLoading(false)
  }

  function getNow() {
    const n = new Date()
    return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`
  }

  function nextStato(stato) {
    return { CONFERMATO: 'IN_CORSO', PIANIFICATO: 'IN_CORSO', IN_CORSO: 'COMPLETATO' }[stato] || null
  }

  function nextLabel(stato) {
    return { CONFERMATO: '🚀 Inizia Trasporto', PIANIFICATO: '🚀 Inizia Trasporto', IN_CORSO: '✅ Segna Completato' }[stato] || null
  }

  async function aggiornaStato() {
    if (!selectedT) return
    const ns = nextStato(selectedT.stato)
    if (!ns) return
    setSaving(true)
    const now = getNow()
    const updates = {
      stato: ns,
      note_autista: noteInput || selectedT.note_autista,
      ...(ns === 'IN_CORSO' && { ora_partenza_reale: now }),
      ...(ns === 'COMPLETATO' && {
        ora_rientro_reale: now,
        ore_effettive: oreInput ? Number(oreInput) : selectedT.ore_previste,
      }),
    }
    await supabase.from('trasporti').update(updates).eq('id', selectedT.id)
    await loadAll()
    setSelectedT(null)
    setSaving(false)
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div style={{
        marginBottom: 20, padding: 14,
        background: `${C.accent}15`, border: `1px solid ${C.accent}44`, borderRadius: 12,
      }}>
        <div style={{ color: C.accent, fontWeight: 900, fontSize: 12, letterSpacing: 1 }}>AGENDA DI OGGI</div>
        <div style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>
          {today} · {trasporti.filter(t => t.stato !== 'COMPLETATO').length} trasporti da fare
        </div>
      </div>

      {trasporti.length === 0 ? <Empty text="Nessun trasporto assegnato oggi" /> : trasporti.map(t => {
        const cantiere = cantieri.find(c => c.id === t.cantiere_id)
        const ns = nextStato(t.stato)
        return (
          <Card key={t.id} style={{ borderColor: t.stato === 'IN_CORSO' ? C.accent : undefined }}>
            {t.stato === 'IN_CORSO' && (
              <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>● IN CORSO</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{cantiere?.nome}</div>
                <div style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{cantiere?.indirizzo}</div>
              </div>
              <Badge stato={t.stato} />
            </div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 12, fontSize: 13, color: C.textMuted, flexWrap: 'wrap' }}>
              <span>⏰ {t.ora_inizio_prevista?.slice(0,5)}</span>
              <span>📦 {t.materiale}</span>
              <span>⌛ {t.ore_previste}h</span>
            </div>
            {t.stato === 'COMPLETATO' && t.ore_effettive && (
              <div style={{ fontSize: 12, color: C.green, marginBottom: 10 }}>
                ✅ Completato · {t.ore_effettive}h effettive
                {t.note_autista && ` · "${t.note_autista}"`}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href={`https://maps.google.com?q=${encodeURIComponent(cantiere?.indirizzo || '')}`}
                target="_blank" rel="noreferrer"
                style={{
                  background: C.surfaceHigh, color: C.text,
                  border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: '7px 14px', fontSize: 12, fontWeight: 700,
                  textDecoration: 'none', display: 'inline-block',
                }}>🗺 Maps</a>
              {ns && (
                <Btn small color={t.stato === 'IN_CORSO' ? C.green : C.accent}
                  onClick={() => { setNoteInput(t.note_autista || ''); setOreInput(t.ore_previste || ''); setSelectedT(t) }}>
                  {nextLabel(t.stato)}
                </Btn>
              )}
            </div>
          </Card>
        )
      })}

      {selectedT && (
        <Modal title="Aggiorna Stato" onClose={() => setSelectedT(null)}>
          <div style={{ marginBottom: 16, padding: 12, background: C.surfaceHigh, borderRadius: 8 }}>
            <div style={{ fontWeight: 700 }}>{cantieri.find(c=>c.id===selectedT.cantiere_id)?.nome}</div>
            <div style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>{selectedT.materiale}</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>NOTE AUTISTA (opzionale)</label>
            <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)}
              rows={3} placeholder="Es. Attesa gru 30 min, blocco traffico..."
              style={{
                width: '100%', background: C.surfaceHigh, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 14,
                marginTop: 6, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
              }} />
          </div>
          {nextStato(selectedT.stato) === 'COMPLETATO' && (
            <Input label="Ore effettive" value={oreInput} onChange={setOreInput} type="number"
              placeholder={`Previste: ${selectedT.ore_previste}`} />
          )}
          <Btn onClick={aggiornaStato} disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Salvataggio...' : nextLabel(selectedT.stato)}
          </Btn>
        </Modal>
      )}
    </div>
  )
}
