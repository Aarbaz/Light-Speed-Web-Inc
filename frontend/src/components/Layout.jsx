import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { to: '/', icon: '◈', label: 'All Contacts', exact: true },
  { to: '/contacts/new', icon: '⊕', label: 'Add Contact' },
]

function NavItem({ to, icon, label, exact, onClick }) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
          isActive
            ? 'bg-slate-100 text-indigo-600 border border-indigo-100'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`
      }
    >
      <span className="text-base">{icon}</span>
      {label}
    </NavLink>
  )
}

export default function Layout() {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <aside className="hidden md:flex md:w-72 shrink-0 h-screen sticky top-0 flex-col border-r border-slate-200 bg-white">
        <div className="px-7 py-8 border-b border-slate-200">
          <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xl text-white shadow-glow">
            👥
          </div>
          <div className="text-lg font-semibold tracking-tight text-slate-900">ContactHub</div>
          <div className="mt-1 text-xs text-slate-500">PHP + React CRUD</div>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Navigation</div>
          {navItems.map(item => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        <div className="px-7 py-5 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Backend connected
          </div>
          <div className="mt-1 text-[11px] text-slate-400">localhost</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 md:hidden"
              onClick={() => setShowMobileMenu(true)}
            >
              ☰
            </button>
            <div className="flex flex-col text-sm text-slate-500">
              <span className="font-semibold text-slate-900">ContactHub</span>
              <span className="text-xs text-slate-500 md:hidden">PHP + React CRUD</span>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-transform hover:-translate-y-0.5"
            onClick={() => navigate('/contacts/new')}
          >
            <span>＋</span>
            New Contact
          </button>
        </header>

        <main className="flex-1 overflow-auto py-8 px-4 sm:px-6 md:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {showMobileMenu && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
          <div className="relative z-10 h-full w-4/5 max-w-xs overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="text-lg font-semibold text-slate-900">Menu</div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                onClick={() => setShowMobileMenu(false)}
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-6 space-y-4">
              {navItems.map(item => (
                <NavItem key={item.to} {...item} onClick={() => setShowMobileMenu(false)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
