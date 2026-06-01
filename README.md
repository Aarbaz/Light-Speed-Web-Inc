# Contacts App (Interview Task)

Simple full-stack contacts CRUD application.

- Backend: PHP (CodeIgniter-style controllers/models) — serves JSON API and handles image uploads
- Frontend: React + Vite + Tailwind — admin UI for listing, creating, viewing, editing, deleting contacts

## Quick Start

Prerequisites:
- PHP (with Apache/XAMPP)
- MySQL / MariaDB
- Node.js + npm

1. Import database:

```powershell
mysql -u root -p < backend/database.sql
```

2. Backend (Apache/XAMPP):
- Place `backend/` in your web root so the API is available at `http://localhost/Arbaz_Task/backend/`.
- Ensure PHP and MySQL are running.
- Make sure `backend/uploads/` is writable by the web server.

3. Frontend:

```bash
cd frontend
npm install
npm run dev
```

Vite will print a local dev URL (e.g. `http://localhost:3001/`). The frontend is configured to proxy API calls to the backend during development.

## API Endpoints

Base: `http://localhost/Arbaz_Task/backend/`

- GET `/contacts/` — list all contacts
- GET `/contacts/{id}` — get one contact
- POST `/contacts/` — create contact (multipart/form-data; include `image` file)
- PUT `/contacts/{id}` — update contact
- DELETE `/contacts/{id}` — delete contact

Responses use JSON in the format:

```json
{ "success": true, "data": [...] }
```

Image URLs are returned in the `image_url` field (absolute HTTP URLs).

## Key Files

- Backend controller: `backend/application/controllers/ContactController.php`
- Backend model: `backend/application/models/ContactModel.php`
- DB schema: `backend/database.sql`
- Frontend pages: `frontend/src/pages/ContactList.jsx`, `ContactForm.jsx`, `ContactView.jsx`
- Frontend config: `frontend/package.json`, `frontend/vite.config.js`, `frontend/tailwind.config.js`

## Notes / Caveats

- Ensure `backend/uploads/` is writable.
- Backend sends `Content-Type: application/json; charset=utf-8` and uses unescaped slashes for URLs.
- If accessing frontend from a different origin (not using Vite proxy), enable CORS on the backend.
- PHP 8.2 compatibility: avoid dynamic property deprecation if upgrading PHP; current code adjusted where needed.

## Validation & Behavior

- Name: letters and spaces, 2–100 chars
- Email: valid format, unique
- Phone: 10 digits
- DOB: `YYYY-MM-DD`, age 1–120
- Message: 10–1000 chars

## Deliverables for interview

- This repository (backend + frontend)
- Steps above to run locally
- Example API call to list contacts:

```bash
curl http://localhost/Arbaz_Task/backend/contacts/
```
