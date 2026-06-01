import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { contactService } from '../services/api'
import { Phone, ChevronLeft, Edit3, Trash2 } from 'lucide-react'

export default function ContactView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await contactService.getById(id)
        setContact(res.data.data)
      } catch {
        navigate('/')
      } finally {
        setLoading(false)
      }
    })()
  }, [id, navigate])

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await contactService.delete(id)
      navigate('/')
    } catch {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const formatDate = (dob) => {
    if (!dob) return '—'
    return new Date(dob).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getAge = (dob) => {
    if (!dob) return ''
    const birth = new Date(dob)
    const now = new Date()
    const age = Math.floor((now - birth) / (365.25 * 24 * 3600 * 1000))
    return ` (${age} years old)`
  }

  if (loading) {
    return (
        <div className="flex min-h-[280px] items-center justify-center gap-3 rounded-[28px] border border-slate-200 bg-white p-10 text-slate-500 shadow-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
        <span>Loading contact…</span>
      </div>
    )
  }

  if (!contact) return null

  return (
    <div className="space-y-6 max-w-3xl animate-fade">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <button
          type="button"
          className="rounded-full px-3 py-1 text-slate-600 transition hover:text-slate-900"
          onClick={() => navigate('/')}
        >
          Contacts
        </button>
        <span>›</span>
        <span className="font-semibold text-slate-900">{contact.name}</span>
      </div>

      <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-indigo-100/80 via-transparent to-pink-100/60" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          {contact.image_url ? (
            <img
              src={contact.image_url}
              alt={contact.name}
              className="h-24 w-24 rounded-full border-4 border-indigo-100 object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-4xl font-semibold text-white shadow-lg">
              {contact.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{contact.name}</h1>
            <p className="text-sm text-slate-500">{contact.email}</p>
            <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600">
              <Phone className="mr-2 h-4 w-4 text-indigo-600" /> {contact.phone}
            </span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        {[
          { label: 'Full Name', value: contact.name },
          { label: 'Email', value: contact.email },
          { label: 'Phone', value: contact.phone },
          { label: 'Date of Birth', value: `${formatDate(contact.dob)}${getAge(contact.dob)}` },
        ].map((row, index) => (
          <div
            key={row.label}
            className={`flex flex-col gap-3 px-8 py-5 ${index !== 3 ? 'border-b border-slate-200' : ''} md:flex-row md:items-start`}
          >
            <div className="min-w-[140px] text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              {row.label}
            </div>
            <div className="text-sm text-slate-900">{row.value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Message</div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">{contact.message}</div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">
          Created: {new Date(contact.created_at).toLocaleString('en-IN')}
        </div>
        <div className="text-sm text-slate-500">
          Updated: {new Date(contact.updated_at).toLocaleString('en-IN')}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
          type="button"
          className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="-ml-1 mr-2 inline h-4 w-4" /> Back
        </button>
        <button
          type="button"
          className="rounded-3xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
          onClick={() => navigate(`/contacts/${id}/edit`)}
        >
          <Edit3 className="-ml-1 mr-2 inline h-4 w-4" /> Edit Contact
        </button>
        <button
          type="button"
          className="rounded-3xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700"
          onClick={() => setShowDeleteModal(true)}
        >
          <Trash2 className="-ml-1 mr-2 inline h-4 w-4" /> Delete
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-900">Delete Contact</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{contact.name}</span>? This action is permanent.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
