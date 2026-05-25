# DialyAbsence - Centre de Dialyse les Chênes

Secure local-network web application for Centre de Dialyse les Chênes in Benslimane to manage patients, dialysis sessions, patient absences, nursing staff, staff leave, reports, users, and audit logs.

The app is intended to run inside the dialysis center only. Do not expose the frontend, backend, or database directly to the public internet.

## Scope

- Login users: Admin, Doctor, Receptionist only.
- Médecin responsable: Dr Mouna Mjabber.
- Ville: Benslimane.
- Nurses are not login users. They are managed in the Personnel Infirmier module.
- Personnel Infirmier: list, add, edit, archive, and view nurse details.
- Conges du personnel: create/edit leave requests, approve/refuse leave, calendar, history, and filters by nurse/date.
- Dashboard: active patients, patient absences today, active nurses, nurses on leave today, pending leave requests, and dialysis sessions today.
- Reports: patient absences, staff leave, attendance, CNSS/AMO, with date, patient, nurse, and organisme filters where applicable.

## Stack

- Backend: Laravel 12 API, Laravel Sanctum, MySQL
- Frontend: React, Vite, TailwindCSS, Recharts
- Roles: Admin, Doctor, Receptionist
- Exports: PDF and Excel from the Reports page

## Folder Structure

```text
DialyAbsence/
|- backend/    Laravel API
`- frontend/   React Vite UI
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

- Admin: `admin@dialyse.ma`
- Doctor: `doctor@dialyse.ma`
- Receptionist: `reception@dialyse.ma`

## Main API Endpoints

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/dashboard/stats`
- `apiResource /api/patients`
- `apiResource /api/seances`
- `apiResource /api/absences`
- `apiResource /api/nurses`
- `apiResource /api/nurse-leaves`
- `POST /api/nurse-leaves/{nurse_leave}/approve`
- `POST /api/nurse-leaves/{nurse_leave}/refuse`
- `GET /api/reports/attendance`
- `GET /api/reports/patient-absences`
- `GET /api/reports/leaves`
- `apiResource /api/users` admin only

## Security Notes

- Passwords are hashed by Laravel's hashed cast.
- API routes are protected with Sanctum bearer tokens.
- Role authorization is enforced with `role` middleware where needed.
- Patient, nurse, leave, and attendance data are only returned from authenticated API routes.
- Important actions are written to `audit_logs`.
- Keep MySQL bound to localhost or the private LAN host only.
- Keep router/firewall access restricted to internal staff devices on the center network.
