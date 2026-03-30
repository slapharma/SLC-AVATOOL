import { useState, useEffect, useRef, useCallback } from 'react'

type Props = { text: string }

export function InfoTip({ text }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)

  const reposition = useCallback(() => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    const tooltipW = 260
    let left = r.left
    // Clamp so tooltip doesn't go off-screen right
    if (left + tooltipW > window.innerWidth - 12) {
      left = window.innerWidth - tooltipW - 12
    }
    setPos({ top: r.top - 8, left })
  }, [])

  useEffect(() => {
    if (!open) return
    reposition()
    const close = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', close)
    window.addEventListener('scroll', () => setOpen(false), { passive: true })
    return () => {
      window.removeEventListener('mousedown', close)
      window.removeEventListener('scroll', () => setOpen(false))
    }
  }, [open, reposition])

  return (
    <>
      <button
        ref={btnRef}
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 15, height: 15, marginLeft: 5, verticalAlign: 'middle',
          background: open ? 'var(--gold-dim)' : 'var(--surface-3)',
          border: `1px solid ${open ? 'var(--gold)' : 'var(--border)'}`,
          color: open ? 'var(--gold)' : 'var(--text-dim)',
          fontSize: 9, fontWeight: 800, cursor: 'pointer',
          lineHeight: 1, padding: 0,
          fontFamily: 'Georgia, serif',
          textTransform: 'none', letterSpacing: 0,
        }}
        aria-label="More info"
      >i</button>

      {open && (
        <span style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          transform: 'translateY(-100%) translateY(-6px)',
          zIndex: 9999,
          width: 260,
          background: '#1a1a1a',
          color: '#f0ece4',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
          padding: '12px 14px',
          pointerEvents: 'none',
          // Reset all inherited text styles
          textTransform: 'none',
          letterSpacing: 'normal',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 400,
          lineHeight: 1.6,
          display: 'block',
          whiteSpace: 'normal',
        }}>
          {text}
        </span>
      )}
    </>
  )
}
