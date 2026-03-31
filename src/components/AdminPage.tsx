import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { EDGE_BASE } from '../lib/supabase'

type AppUser = {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string
  last_sign_in_at: string | null
}

function timeAgo(ts: string | null) {
  if (!ts) return 'Never'
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 2) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export function AdminPage() {
  const { session } = useAuth()
  const [users, setUsers]         = useState<AppUser[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newEmail, setNewEmail]   = useState('')
  const [newPass, setNewPass]     = useState('')
  const [creating, setCreating]   = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [deleteId, setDeleteId]   = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    if (!session) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${EDGE_BASE}/admin-users`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error); return }
      setUsers(json.users)
    } catch (e) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch(`${EDGE_BASE}/admin-users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail, password: newPass }),
      })
      const json = await res.json()
      if (!res.ok) { setCreateError(json.error); return }
      setUsers(prev => [...prev, json.user])
      setNewEmail('')
      setNewPass('')
      setShowCreate(false)
    } catch {
      setCreateError('Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!session) return
    setDeleteId(id)
    try {
      const res = await fetch(`${EDGE_BASE}/admin-users?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) setUsers(prev => prev.filter(u => u.id !== id))
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
            User Management
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
            All accounts with access to AVATOOL
          </div>
        </div>
        <button
          className="btn-primary"
          style={{ padding: '10px 20px', fontSize: 13 }}
          onClick={() => { setShowCreate(true); setCreateError(null) }}
        >
          + Add User
        </button>
      </div>

      {/* Create user form */}
      {showCreate && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--gold)',
          padding: '24px',
          marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: 'var(--text)' }}>
            Create New User
          </div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label" style={{ marginBottom: 6 }}>Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: 6 }}>Password</label>
                <input
                  type="text"
                  className="form-input"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Temporary password"
                  required
                  minLength={4}
                />
              </div>
            </div>
            {createError && (
              <div style={{ color: '#b91c1c', fontSize: 13, background: '#fef2f2', border: '1px solid #fecaca', padding: '8px 12px' }}>
                {createError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)} style={{ padding: '8px 18px', fontSize: 13 }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={creating} style={{ padding: '8px 18px', fontSize: 13 }}>
                {creating ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-dim)' }}>Loading users…</div>
      ) : error ? (
        <div style={{ color: '#b91c1c', padding: 24, background: '#fef2f2', border: '1px solid #fecaca' }}>{error}</div>
      ) : (
        <div style={{ border: '1px solid var(--border)' }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 140px 120px 48px',
            padding: '10px 16px',
            background: 'var(--surface-2)',
            borderBottom: '1px solid var(--border)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.6px',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
          }}>
            <div>Email</div>
            <div>Role</div>
            <div>Created</div>
            <div>Last Sign-in</div>
            <div />
          </div>

          {users.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
              No users yet.
            </div>
          )}

          {users.map((u, i) => (
            <div key={u.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 140px 120px 48px',
              padding: '12px 16px',
              alignItems: 'center',
              borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
              background: 'var(--surface)',
            }}>
              <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{u.email}</div>
              <div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 8px',
                  background: u.role === 'admin' ? 'var(--gold-dim)' : 'var(--surface-3)',
                  color: u.role === 'admin' ? 'var(--gold)' : 'var(--text-dim)',
                  border: `1px solid ${u.role === 'admin' ? 'var(--gold)' : 'var(--border)'}`,
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}>
                  {u.role}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                {new Date(u.created_at).toLocaleDateString()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                {timeAgo(u.last_sign_in_at)}
              </div>
              <div>
                {u.role !== 'admin' && (
                  <button
                    onClick={() => handleDelete(u.id)}
                    disabled={deleteId === u.id}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-dim)',
                      fontSize: 16,
                      padding: 4,
                      lineHeight: 1,
                      opacity: deleteId === u.id ? 0.5 : 1,
                    }}
                    title="Remove user"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
