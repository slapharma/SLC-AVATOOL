import { useState, useEffect, useRef } from 'react'

type Props = { text: string }

export function InfoTip({ text }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-block', marginLeft: 5, verticalAlign: 'middle' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        style={{
          width: 15, height: 15,
          background: open ? 'var(--gold-dim)' : 'var(--surface-3)',
          border: `1px solid ${open ? 'var(--gold)' : 'var(--border)'}`,
          color: open ? 'var(--gold)' : 'var(--text-dim)',
          fontSize: 9, fontWeight: 800, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1, padding: 0, fontFamily: 'Georgia, serif',
        }}
        aria-label="More info"
      >i</button>
      {open && (
        <span style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
          background: '#111', color: '#f0f0f0',
          fontSize: 12, lineHeight: 1.55, padding: '9px 12px',
          width: 240, zIndex: 999,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
          display: 'block', whiteSpace: 'normal', pointerEvents: 'none',
        }}>
          {text}
        </span>
      )}
    </span>
  )
}
