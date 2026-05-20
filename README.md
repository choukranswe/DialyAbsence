# DialyAbsence

Secure local web application for a dialysis center to manage patient attendance, absences, delays, daily sessions, reports, users, and activity logs.

The app is intended for a private dialysis center network. Do not expose the backend or database directly to the public internet.

## Stack

- Backend: Laravel 12 API, Laravel Sanctum, MySQL
- Frontend: React, Vite, TailwindCSS, Recharts
- Roles: Admin, Doctor, Receptionist
- Exports: PDF, Excel, browser print from the Reports page

## Folder Structure

```text
DialyAbsence/
├── backend/    Laravel API
└── frontend/   React Vite UI
```

## Backend Setup

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

Create a local MySQL database:

```sql
CREATE DATABASE dialyabsence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update `backend/.env` if your MySQL user or password is different:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dialyabsence
DB_USERNAME=root
DB_PASSWORD=
FRONTEND_URLS=http://localhost:5173,http://127.0.0.1:5173,http://192.168.8.109:5173
```

Run migrations and seed demo data:

```bash
php artisan migrate:fresh --seed
php artisan serve --host=0.0.0.0 --port=8000
```

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev -- --host 0.0.0.0
```

Default frontend URL:

```text
http://127.0.0.1:5173
```

For another computer on the same local network, open:

```text
http://192.168.8.109:5173
```

## Demo Accounts

All demo accounts use the password:

```text
password
```

- Admin: `admin@dialyabsence.local`
- Doctor: `doctor@dialyabsence.local`
- Receptionist: `reception@dialyabsence.local`

## Main API Endpoints

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `apiResource /api/patients`
- `apiResource /api/sessions`
- `POST /api/sessions/{session}/attendance`
- `apiResource /api/absences`
- `GET /api/reports/attendance`
- `apiResource /api/users` admin only
- `GET /api/activity-logs` admin only

## Security Notes

- Passwords are hashed by Laravel's hashed cast.
- API routes are protected with Sanctum bearer tokens.
- Role authorization is enforced with `role` middleware and request policies.
- Patient and attendance data are only returned from authenticated API routes.
- Important actions are written to `activity_logs`.
- Keep MySQL bound to localhost or the private LAN host only.
