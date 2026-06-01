import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { contactService } from '../services/api'

const inputBase = 'w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition duration-150 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100/70'
const inputError = 'border-red-300 bg-red-50 focus:ring-red-100/80'
const inputSuccess = 'border-emerald-300 bg-emerald-50 focus:ring-emerald-100/80'

function validateField(name, value, imageFile, isEdit) {
  switch (name) {
    case 'name':
      if (!value.trim()) return 'Name is required'
      if (value.trim().length < 2) return 'Name must be at least 2 characters'
      if (value.trim().length > 100) return 'Name must be at most 100 characters'
      if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters and spaces'
      return null
    case 'email':
      if (!value.trim()) return 'Email is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address'
      return null
    case 'phone':
      if (!value.trim()) return 'Phone number is required'
      if (!/^[0-9\s\-\+\(\)]{10,15}$/.test(value)) return 'Phone must be a valid 10-digit number'
      return null
    case 'dob':
      if (!value) return 'Date of birth is required'
      const d = new Date(value)
      const now = new Date()
      if (d > now) return 'Date of birth cannot be in the future'
      const age = Math.floor((now - d) / (365.25 * 24 * 3600 * 1000))
      if (age < 1) return 'Age must be at least 1 year'
      if (age > 120) return 'Invalid date of birth'
      return null
    case 'message':
      if (!value.trim()) return 'Message is required'
      if (value.trim().length < 10) return 'Message must be at least 10 characters'
      if (value.length > 1000) return 'Message cannot exceed 1000 characters'
      return null
    case 'image':
      if (!isEdit && !imageFile) return 'Please upload a profile image'
      if (imageFile) {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if (!allowed.includes(imageFile.type)) return 'Only JPG, PNG, GIF, WEBP allowed'
        if (imageFile.size > 5 * 1024 * 1024) return 'Image must be less than 5MB'
      }
      return null
    default:
      return null
  }
}

function validateAll(values, imageFile, isEdit) {
  const fields = ['name', 'email', 'phone', 'dob', 'message', 'image']
  const errs = {}
  fields.forEach((field) => {
    const err = validateField(field, values[field] || '', imageFile, isEdit)
    if (err) errs[field] = err
  })
  return errs
}

function Field({ label, error, touched, required, hint, children, charCount, maxChars }) {
  const showError = touched && error
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {maxChars && <div className="text-right text-[11px] text-slate-400">{charCount || 0} / {maxChars}</div>}
      {showError && <div className="flex items-center gap-2 text-sm text-red-600">⚠ {error}</div>}
      {hint && !showError && <div className="text-sm text-slate-500">{hint}</div>}
    </div>
  )
}

export default function ContactForm({ mode }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = mode === 'edit'
  const fileRef = useRef()

  const initValues = { name: '', email: '', phone: '', dob: '', message: '' }
  const [values, setValues] = useState(initValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImage, setExistingImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)
  const [serverErrors, setServerErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!isEdit) return
    ;(async () => {
      try {
        const res = await contactService.getById(id)
        const c = res.data.data
        setValues({
          name: c.name,
          email: c.email,
          phone: c.phone,
          dob: c.dob,
          message: c.message,
        })
        if (c.image_url) setExistingImage(c.image_url)
      } catch {
        navigate('/')
      } finally {
        setLoadingData(false)
      }
    })()
  }, [id, isEdit, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    const err = validateField(name, value, imageFile, isEdit)
    setErrors((prev) => ({ ...prev, [name]: err }))
    setServerErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const err = validateField(name, values[name] || '', imageFile, isEdit)
    setErrors((prev) => ({ ...prev, [name]: err }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setTouched((prev) => ({ ...prev, image: true }))
    const reader = new FileReader()
    reader.onload = (event) => setImagePreview(event.target.result)
    reader.readAsDataURL(file)
    const err = validateField('image', '', file, isEdit)
    setErrors((prev) => ({ ...prev, image: err }))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
    setErrors((prev) => ({ ...prev, image: isEdit ? null : 'Please upload a profile image' }))
  }

  const getInputClass = (field) => {
    if (touched[field] && errors[field]) return `${inputBase} ${inputError}`
    if (touched[field] && !errors[field] && values[field]) return `${inputBase} ${inputSuccess}`
    return inputBase
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const allTouched = { name: true, email: true, phone: true, dob: true, message: true, image: true }
    setTouched(allTouched)

    const allErrors = validateAll(values, imageFile, isEdit)
    setErrors(allErrors)

    if (Object.values(allErrors).some(Boolean)) return

    const fd = new FormData()
    Object.entries(values).forEach(([key, value]) => fd.append(key, value))
    if (imageFile) fd.append('image', imageFile)

    try {
      setSubmitting(true)
      setServerErrors({})

      if (isEdit) {
        await contactService.update(id, fd)
        setSuccessMsg('Contact updated successfully!')
      } else {
        await contactService.create(fd)
        setSuccessMsg('Contact created successfully!')
        setValues(initValues)
        setImageFile(null)
        setImagePreview(null)
        setTouched({})
      }

      setTimeout(() => navigate('/'), 1200)
    } catch (err) {
      if (err.response?.status === 422) {
        const serverErrs = err.response.data.errors || {}
        setServerErrors(serverErrs)
        setErrors((prev) => ({ ...prev, ...serverErrs }))
        setTouched((prev) => {
          const next = { ...prev }
          Object.keys(serverErrs).forEach((key) => { next[key] = true })
          return next
        })
      } else {
        setServerErrors({ general: 'An error occurred. Please try again.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-28 text-slate-500 gap-3">
        <div className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" />
        <span>Loading contact…</span>
      </div>
    )
  }

  const displayPreview = imagePreview || existingImage
  const maxDob = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6 max-w-3xl animate-fade">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <button type="button" onClick={() => navigate('/')} className="font-medium text-slate-500 transition hover:text-slate-900">
          Contacts
        </button>
        <span>›</span>
        <span className="text-slate-900 font-semibold">{isEdit ? 'Edit Contact' : 'New Contact'}</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{isEdit ? 'Edit Contact' : 'New Contact'}</h1>
        <p className="text-sm text-slate-500">
          {isEdit ? 'Update the contact information below' : 'Fill in the details to add a new contact'}
        </p>
      </div>

      {successMsg && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          ✓ {successMsg}
        </div>
      )}
      {serverErrors.general && (
        <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          ⚠ {serverErrors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 border-b border-slate-200 pb-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Profile Photo
          </div>

          <Field
            label="Upload Image"
            required
            error={errors.image}
            touched={touched.image}
            hint="Accepted: JPG, PNG, GIF, WEBP — Max 5MB"
          >
            {displayPreview ? (
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative inline-flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-indigo-50 bg-slate-100 shadow-glow">
                  <img src={displayPreview} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg"
                    onClick={removeImage}
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 text-left">
                  <p className="text-sm font-medium text-slate-800">{imageFile ? imageFile.name : 'Current image'}</p>
                  {imageFile && <p className="text-xs text-slate-500">{(imageFile.size / 1024).toFixed(1)} KB</p>}
                  <button
                    type="button"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    onClick={() => fileRef.current?.click()}
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={`group cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition ${
                  touched.image && errors.image ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-slate-100'
                }`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files?.[0]
                  if (file) {
                    setImageFile(file)
                    const reader = new FileReader()
                    reader.onload = (event) => setImagePreview(event.target.result)
                    reader.readAsDataURL(file)
                    setTouched((prev) => ({ ...prev, image: true }))
                    const err = validateField('image', '', file, isEdit)
                    setErrors((prev) => ({ ...prev, image: err }))
                  }
                }}
              >
                <div className="mb-4 text-3xl">📷</div>
                <div className="text-sm font-semibold text-slate-800">Click to upload or drag & drop</div>
                <div className="mt-2 text-xs text-slate-500">JPG, PNG, GIF, WEBP up to 5MB</div>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </Field>

          <div className="my-8 h-px bg-slate-200" />
          <div className="mb-5 border-b border-slate-200 pb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Personal Information
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Full Name" required error={errors.name} touched={touched.name}>
              <input
                className={getInputClass('name')}
                name="name"
                type="text"
                placeholder="e.g. Arbaz Ansari"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Field>

            <Field label="Date of Birth" required error={errors.dob} touched={touched.dob}>
              <input
                className={getInputClass('dob')}
                name="dob"
                type="date"
                value={values.dob}
                onChange={handleChange}
                onBlur={handleBlur}
                max={maxDob}
              />
            </Field>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Field label="Email Address" required error={errors.email} touched={touched.email} hint="Must be a valid email format">
              <input
                className={getInputClass('email')}
                name="email"
                type="email"
                placeholder="e.g. arbaz@example.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Field>

            <Field label="Phone Number" required error={errors.phone} touched={touched.phone} hint="10-digit mobile number">
              <input
                className={getInputClass('phone')}
                name="phone"
                type="tel"
                placeholder="e.g. 9876543210"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Field>
          </div>

          <div className="my-8 h-px bg-slate-200" />
          <div className="mb-5 border-b border-slate-200 pb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Message
          </div>

          <Field
            label="Message"
            required
            error={errors.message}
            touched={touched.message}
            maxChars={1000}
            charCount={values.message.length}
          >
            <textarea
              className={`${inputBase} min-h-[130px] resize-y ${touched.message && errors.message ? inputError : ''} ${touched.message && !errors.message && values.message ? inputSuccess : ''}`}
              name="message"
              placeholder="Enter a message or note about this contact (min. 10 characters)…"
              value={values.message}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={1000}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`rounded-2xl px-6 py-3 text-sm font-semibold text-white transition ${submitting ? 'cursor-not-allowed opacity-70 bg-slate-400' : 'bg-gradient-to-r from-indigo-600 to-fuchsia-500 shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5'}`}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-slate-200 border-t-white animate-spin" />
                {isEdit ? 'Saving…' : 'Creating…'}
              </span>
            ) : (
              isEdit ? '✓ Save Changes' : '＋ Create Contact'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
