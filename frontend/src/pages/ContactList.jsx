import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { contactService } from '../services/api'
import { CheckCircle, XCircle, Info, Search, User } from 'lucide-react'

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : Info
  const colorClass = type === 'success' ? 'text-emerald-600' : type === 'error' ? 'text-red-600' : 'text-slate-900'

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-3xl border border-slate-200 bg-white/95 px-5 py-4 text-sm shadow-2xl shadow-slate-200/40 backdrop-blur-sm">
      <Icon className={`${colorClass} h-5 w-5`} />
      <span className="text-slate-800">{message}</span>
    </div>
  )
}

export default function ContactList() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteModal, setDeleteModal] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)
  const [hovered, setHovered] = useState(null)

  const handleToastClose = useCallback(() => setToast(null), [setToast])

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await contactService.getAll()
      setContacts(res.data.data || [])
    } catch {
      setToast({ message: 'Failed to load contacts', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const filtered = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(search.toLowerCase()) ||
    contact.email.toLowerCase().includes(search.toLowerCase()) ||
    contact.phone.includes(search)
  )

  const handleDelete = async () => {
    if (!deleteModal) return
    try {
      setDeleting(true)
      await contactService.delete(deleteModal.id)
      setContacts((prev) => prev.filter((contact) => contact.id !== deleteModal.id))
      setToast({ message: 'Contact deleted successfully', type: 'success' })
    } catch {
      setToast({ message: 'Failed to delete contact', type: 'error' })
    } finally {
      setDeleting(false)
      setDeleteModal(null)
    }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="space-y-8 animate-fade">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contacts</h1>
          <p className="mt-2 text-sm text-slate-500">Manage your contact directory</p>
        </div>

        <div className="grid gap-4 sm:auto-cols-min sm:grid-flow-col sm:items-center">
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-center shadow-sm">
            <div className="text-3xl font-semibold tracking-tight text-indigo-600">{contacts.length}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">Total</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search className="h-4 w-4 text-slate-400" /></span>
          <input
            className="w-full rounded-3xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100/70"
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-16 text-slate-500 gap-3">
            <div className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" />
            <span>Loading contacts…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 p-16 text-center text-slate-500">
            <div className="text-5xl">
              {search ? <Search className="h-12 w-12 text-slate-400" /> : <User className="h-12 w-12 text-slate-400" />}
            </div>
            <div className="text-lg font-semibold text-slate-900">{search ? 'No contacts match your search' : 'No contacts yet'}</div>
            {!search && (
              <button
                type="button"
                className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                onClick={() => navigate('/contacts/new')}
              >
                Add your first contact
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Phone</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Date of Birth</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Message</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`border-b border-slate-200 transition-colors ${hovered === contact.id ? 'bg-slate-50' : 'bg-white'}`}
                    onMouseEnter={() => setHovered(contact.id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <td className="px-6 py-5 align-top">
                    <div className="flex items-center gap-4">
                      {contact.image_url ? (
                        <img
                          src={contact.image_url}
                          alt={contact.name}
                          className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-semibold text-white">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-slate-900">{contact.name}</div>
                        <div className="text-xs text-slate-500">{contact.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                      {contact.phone}
                    </span>
                  </td>
                  <td className="px-6 py-5 align-top text-sm text-slate-500">{formatDate(contact.dob)}</td>
                  <td className="px-6 py-5 align-top text-sm text-slate-500">
                    <div className="max-w-[160px] sm:max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{contact.message}</div>
                  </td>
                  <td className="px-6 py-5 align-top" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        onClick={() => navigate(`/contacts/${contact.id}`)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
                        onClick={() => navigate(`/contacts/${contact.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                        onClick={() => setDeleteModal(contact)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="text-xl font-semibold text-slate-900">Delete Contact</div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete <strong className="text-slate-900">{deleteModal.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => setDeleteModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={handleToastClose} />}
    </div>
  )
}
