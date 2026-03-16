import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { C, Badge, Card, Btn, Input, Modal, Row, Spinner, Empty } from '../../components/ui'

export default function ViewMagazzino() {
  const [tab, setTab] = useState('calendario')
  const [trasporti, setTrasporti] = useState([])
  const [cantieri, setCantieri] = useState([])
  const [mezzi, setMezzi] = useState([])
  const [autisti, setAutisti] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedT, setSelectedT] = useState(null)
  const [assigning, setAssigning] = useState(null)
  const [form, setForm] = useState({ mezzo_id: '', autista_id: '', ora_inizio: '', ore_previste: '' })
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [t, c, m, u] = await Promise.all([
      supabase.from('trasporti').select('*').order('data').order('ora_inizio_prevista'),
      supabase.from('cantieri').select('*').eq('attivo', true),
      supabase.from('mezzi').select('*').eq('attivo', true),
      supabase.from('utenti').select('*').eq('ruolo', 'AUTISTA'),
    ])
    setTrasporti(t.data || [])
    setCantieri(c.data || [])
    setMezzi(m.data || [])
    setAutisti(u.data || [])
    setLoading(false)
  }

  function getNome(id, lista) {
    const item = lista.find(i => i.id === id)
    return item ? (item.nome + (item.cognome ? ' ' + item.cognome : '')) : '—'
  }

  function getGiorni() {
    const days = []
    const base = new Date()
    base.setDate(base.getDate() - 1)
    for (let i = 0; i < 7; i++) {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      days.push(d.toISOString().split('T')[0])
    }
    return days
  }

  const giorni = getGiorni()
  const dayNames = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab']

  const trasportiGiorno = trasporti.filter(t => t.data === viewDate)
  const richiesti = trasporti.filter(t => t.stato === 'RICHIESTO')
  const completati = trasporti.filter(t => t.stato === 'COMPLETATO')

  async function assegna() {
    if (!form.mezzo_id || !form.autista_id) return alert('Seleziona mezzo e autista')
    const conflict = trasporti.find(t =>
      t.id !== assigning.id && t.data === assigning.data &&
      (t.mezzo_id === form.mezzo_id || t.autista_id === form.autista_id) &&
      ['PIANIFICATO','CONFERMATO','IN_CORSO'].includes(t.stato)
    )
    if (conflict && !window.confirm('⚠️ Mezzo o autista già impegnato in questa data. Continuare?')) return
    setSaving(true)
    const updates = {
      mezzo_id: form.mezzo_id,
      autista_id: form.autista_id,
      stato: 'CONFERMATO',
      ...(form.ora_inizio && { ora_inizio_prevista: form.ora_inizio }),
      ...(form.ore_previste && { ore_previste: Number(form.ore_previste) }),
    }
    await supabase.from('trasporti').update(updates).eq('id', assigning.id)
    await loadAll()
    setAssigning(null)
    setSaving(false)
  }

  async function annulla(id) {
    if (!window.confirm('Annullare questo trasporto?')) return
    await supabase.from('trasporti').update({ stato: 'ANNULLATO' }).eq('id', id)
    await loadAll()
    setSelectedT(null)
  }

  if (loading) return <Spinner />

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, overflowX: 'auto' }}>
        {[['calendario', '📅 Calendario'], [`richieste`, `📋 Da assegnare (${richiesti.length})`], ['report', '📊 Report']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            background: tab === k ? C.accent : C.surfaceHigh,
            color: tab === k ? '#000' : C.text, border: 'none', borderRadius: 8,
            padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 12,
            whiteSpace: 'nowrap', fontFamily: 'inherit',
          }}>{l}</button>
        ))}
      </div>

      {/* CALENDARIO */}
      {tab === 'calendario' && <>
        <div style={{ display: 'flex', gap: 5, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {giorni.map(d => {
            const date = new Date(d + 'T00:00:00')
            const dayName = dayNames[date.getDay()]
            const dayNum = date.getDate()
            const hasTrasporti = trasporti.filter(t => t.data === d).length
            return (
              <button key={d} onClick={() => setViewDate(d)} style={{
                minWidth: 52, background: viewDate === d ? C.accent : C.surfaceHigh,
                color: viewDate === d ? '#000' : C.text, border: 'none', borderRadius: 10,
                padding: '8px 6px', cursor: 'pointer', fontWeight: 700, textAlign: 'center',
                fontFamily: 'inherit', position: 'relative',
              }}>
                <div style={{ fontSize: 10 }}>{dayName}</div>
                <div style={{ fontSize: 18 }}>{dayNum}</div>
                {hasTrasporti > 0 && (
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    background: viewDate === d ? '#000' : C.accent,
                    color: viewDate === d ? C.accent : '#000',
                    borderRadius: '50%', width: 16, height: 16,
                    fontSize: 9, fontWeight: 900,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{hasTrasporti}</div>
                )}
              </button>
            )
          })}
        </div>
        <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 12 }}>
          {trasportiGiorno.length} trasporti · {viewDate}
        </div>
        {trasportiGiorno.length === 0 ? <Empty text="Nessun trasporto per questo giorno" /> : trasportiGiorno.map(t => (
          <Card key={t.id} onClick={() => setSelectedT(t)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 3 }}>{getNome(t.cantiere_id, cantieri)}</div>
                <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 5 }}>
                  {t.ora_inizio_prevista?.slice(0,5)} · {t.materiale}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted }}>
                  🚚 {t.mezzo_id ? getNome(t.mezzo_id, mezzi) : '—'} &nbsp;
                  👤 {t.autista_id ? getNome(t.autista_id, autisti) : '—'}
                </div>
              </div>
              <Badge stato={t.stato} />
            </div>
          </Card>
        ))}
      </>}

      {/* DA ASSEGNARE */}
      {tab === 'richieste' && <>
        {richiesti.length === 0 ? <Empty text="Nessuna richiesta in attesa 🎉" /> : richiesti.map(t => (
          <Card key={t.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{getNome(t.cantiere_id, cantieri)}</div>
                <div style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
                  {t.data} · {t.ora_inizio_prevista?.slice(0,5)} · {t.ore_previste}h
                </div>
                <div style={{ fontSize: 13, marginTop: 4 }}>{t.materiale}</div>
                {t.note_carpentiere && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>📝 {t.note_carpentiere}</div>}
              </div>
              <Badge stato={t.stato} />
            </div>
            <Btn small onClick={() => { setAssigning(t); setForm({ mezzo_id: '', autista_id: '', ora_inizio: t.ora_inizio_prevista?.slice(0,5) || '', ore_previste: t.ore_previste || '' }) }}>
              Assegna →
            </Btn>
          </Card>
        ))}
      </>}

      {/* REPORT */}
      {tab === 'report' && <>
        <h3 style={{ color: C.accent, fontSize: 14, marginBottom: 14 }}>ORE PER CANTIERE</h3>
        {cantieri.map(c => {
          const ct = completati.filter(t => t.cantiere_id === c.id)
          if (!ct.length) return null
          const prev = ct.reduce((s, t) => s + (t.ore_previste || 0), 0)
          const eff = ct.reduce((s, t) => s + (t.ore_effettive || 0), 0)
          return (
            <Card key={c.id}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>{c.nome}</div>
              <div style={{ display: 'flex', gap: 20 }}>
                <div>
                  <div style={{ color: C.textMuted, fontSize: 11 }}>Previste</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: C.blue }}>{prev}h</div>
                </div>
                <div>
                  <div style={{ color: C.textMuted, fontSize: 11 }}>Effettive</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: eff > prev ? C.red : C.green }}>{eff}h</div>
                </div>
                <div>
                  <div style={{ color: C.textMuted, fontSize: 11 }}>Scarto</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: (eff-prev) > 0 ? C.red : C.green }}>
                    {eff-prev > 0 ? '+' : ''}{(eff-prev).toFixed(1)}h
                  </div>
                </div>
              </div>
            </Card>
          )
        })}

        <h3 style={{ color: C.accent, fontSize: 14, marginBottom: 14, marginTop: 24 }}>ORE PER AUTISTA</h3>
        {autisti.map(a => {
          const at = completati.filter(t => t.autista_id === a.id)
          const eff = at.reduce((s, t) => s + (t.ore_effettive || 0), 0)
          return (
            <Card key={a.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{a.nome} {a.cognome}</div>
                  <div style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{at.length} trasporti completati</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: C.accent }}>{eff}h</div>
              </div>
            </Card>
          )
        })}
      </>}

      {/* DETAIL MODAL */}
      {selectedT && (
        <Modal title="Dettaglio Trasporto" onClose={() => setSelectedT(null)}>
          <Row label="Cantiere" value={getNome(selectedT.cantiere_id, cantieri)} />
          <Row label="Indirizzo" value={cantieri.find(c=>c.id===selectedT.cantiere_id)?.indirizzo}
            link={`https://maps.google.com?q=${encodeURIComponent(cantieri.find(c=>c.id===selectedT.cantiere_id)?.indirizzo||'')}`} />
          <Row label="Data" value={selectedT.data} />
          <Row label="Orario previsto" value={`${selectedT.ora_inizio_prevista?.slice(0,5)} – ${selectedT.ora_fine_prevista?.slice(0,5)||'?'}`} />
          <Row label="Ore previste" value={`${selectedT.ore_previste}h`} />
          {selectedT.ore_effettive && <Row label="Ore effettive" value={`${selectedT.ore_effettive}h`} />}
          <Row label="Materiale" value={selectedT.materiale} />
          <Row label="Quantità" value={selectedT.quantita} />
          <Row label="Mezzo" value={selectedT.mezzo_id ? getNome(selectedT.mezzo_id, mezzi) : 'Non assegnato'} />
          <Row label="Autista" value={selectedT.autista_id ? getNome(selectedT.autista_id, autisti) : 'Non assegnato'} />
          {selectedT.note_carpentiere && <Row label="Note cantiere" value={selectedT.note_carpentiere} />}
          {selectedT.note_autista && <Row label="Note autista" value={selectedT.note_autista} />}
          {selectedT.ora_partenza_reale && <Row label="Partenza reale" value={selectedT.ora_partenza_reale?.slice(0,5)} />}
          {selectedT.ora_arrivo_reale && <Row label="Arrivo cantiere" value={selectedT.ora_arrivo_reale?.slice(0,5)} />}
          {selectedT.ora_rientro_reale && <Row label="Rientro" value={selectedT.ora_rientro_reale?.slice(0,5)} />}
          <div style={{ marginTop: 12, marginBottom: 16 }}><Badge stato={selectedT.stato} /></div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn small color={C.blue} onClick={() => {
              setAssigning(selectedT)
              setForm({ mezzo_id: selectedT.mezzo_id||'', autista_id: selectedT.autista_id||'', ora_inizio: selectedT.ora_inizio_prevista?.slice(0,5)||'', ore_previste: selectedT.ore_previste||'' })
              setSelectedT(null)
            }}>✏️ Modifica</Btn>
            {selectedT.stato !== 'ANNULLATO' && selectedT.stato !== 'COMPLETATO' && (
              <Btn small color={C.red} onClick={() => annulla(selectedT.id)}>Annulla</Btn>
            )}
          </div>
        </Modal>
      )}

      {/* ASSIGN MODAL */}
      {assigning && (
        <Modal title="Pianifica Trasporto" onClose={() => setAssigning(null)}>
          <div style={{ marginBottom: 16, padding: 12, background: C.surfaceHigh, borderRadius: 8 }}>
            <div style={{ fontWeight: 700 }}>{getNome(assigning.cantiere_id, cantieri)}</div>
            <div style={{ color: C.textMuted, fontSize: 13, marginTop: 2 }}>{assigning.data} · {assigning.materiale}</div>
            {assigning.note_carpentiere && <div style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>📝 {assigning.note_carpentiere}</div>}
          </div>
          <Input label="Mezzo" value={form.mezzo_id} onChange={v => setForm(f=>({...f,mezzo_id:v}))} required
            options={mezzi.map(m => ({ value: m.id, label: `${m.nome} (${m.targa})` }))} />
          <Input label="Autista" value={form.autista_id} onChange={v => setForm(f=>({...f,autista_id:v}))} required
            options={autisti.map(a => ({ value: a.id, label: `${a.nome} ${a.cognome||''}` }))} />
          <Input label="Ora partenza" value={form.ora_inizio} onChange={v => setForm(f=>({...f,ora_inizio:v}))} type="time" />
          <Input label="Ore previste" value={form.ore_previste} onChange={v => setForm(f=>({...f,ore_previste:v}))} type="number" placeholder="Es. 3" />
          <Btn onClick={assegna} disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Salvataggio...' : '✓ Conferma Pianificazione'}
          </Btn>
        </Modal>
      )}
    </div>
  )
}
