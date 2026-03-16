// ─── SHARED UI COMPONENTS ───────────────────────────────────────────────────

export const C = {
  bg: '#0f1117', surface: '#1a1d26', surfaceHigh: '#22263a',
  accent: '#f5a623', blue: '#4a9eff', green: '#2ecc71',
  red: '#e74c3c', text: '#e8eaf0', textMuted: '#7a7f9a', border: '#2e3248',
}

export const STATUS_MAP = {
  RICHIESTO:  { label: 'Richiesto',  color: '#7a7f9a', bg: '#1e2133' },
  PIANIFICATO:{ label: 'Pianificato',color: '#4a9eff', bg: '#0d1f3a' },
  CONFERMATO: { label: 'Confermato', color: '#f5a623', bg: '#2a1e00' },
  IN_CORSO:   { label: 'In Corso',   color: '#e67e22', bg: '#2a1500' },
  COMPLETATO: { label: 'Completato', color: '#2ecc71', bg: '#0a2a1a' },
  ANNULLATO:  { label: 'Annullato',  color: '#e74c3c', bg: '#2a0a0a' },
}

export function Badge({ stato }) {
  const s = STATUS_MAP[stato] || STATUS_MAP.RICHIESTO
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.color}44`,
      borderRadius: 6, padding: '2px 10px', fontSize: 11, fontWeight: 700,
      letterSpacing: 0.5, whiteSpace: 'nowrap',
    }}>{s.label}</span>
  )
}

export function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 14, padding: 16, marginBottom: 10,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'border-color 0.2s', ...style,
    }}
      onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = C.accent)}
      onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = C.border)}
    >{children}</div>
  )
}

export function Btn({ children, onClick, color, small, disabled, style = {}, type = 'button' }) {
  const bg = disabled ? '#333' : (color || C.accent)
  const col = disabled ? '#666' : (color === C.red || color === C.blue ? '#fff' : '#000')
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      background: bg, color: col, border: 'none', borderRadius: 8,
      padding: small ? '7px 14px' : '11px 20px',
      fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: small ? 12 : 14, transition: 'opacity 0.15s',
      fontFamily: 'inherit', ...style,
    }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >{children}</button>
  )
}

export function Input({ label, value, onChange, type = 'text', required, options, placeholder, rows }) {
  const inputStyle = {
    width: '100%', background: C.surfaceHigh, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: '9px 12px', color: C.text, fontSize: 14,
    outline: 'none', boxSizing: 'border-box', marginTop: 4, fontFamily: 'inherit',
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>
        {label}{required && <span style={{ color: C.accent }}> *</span>}
      </label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
          <option value="">— Seleziona —</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : rows ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} rows={rows}
          style={{ ...inputStyle, resize: 'vertical' }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} style={inputStyle} />
      )}
    </div>
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000c', zIndex: 200,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: '18px 18px 0 0', padding: '24px 20px 32px',
        width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: C.accent, fontSize: 17 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Row({ label, value, link }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 13 }}>
      <span style={{ color: C.textMuted, minWidth: 120 }}>{label}</span>
      {link
        ? <a href={link} target="_blank" rel="noreferrer" style={{ color: C.blue, textDecoration: 'none' }}>🗺 {value}</a>
        : <span style={{ color: C.text, fontWeight: 600 }}>{value || '—'}</span>}
    </div>
  )
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
      <div style={{
        width: 32, height: 32, border: `3px solid ${C.border}`,
        borderTopColor: C.accent, borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export function Empty({ text }) {
  return <div style={{ color: C.textMuted, textAlign: 'center', padding: 48, fontSize: 14 }}>{text}</div>
}
