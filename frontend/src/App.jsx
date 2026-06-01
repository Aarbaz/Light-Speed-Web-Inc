import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ContactList from './pages/ContactList'
import ContactForm from './pages/ContactForm'
import ContactView from './pages/ContactView'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ContactList />} />
          <Route path="contacts/new" element={<ContactForm mode="create" />} />
          <Route path="contacts/:id/edit" element={<ContactForm mode="edit" />} />
          <Route path="contacts/:id" element={<ContactView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
