# INFO 465 Online Summer Course Registration System

Sprint 2 server-backed increment using Node.js, Express, MySQL, server-side sessions, and the existing HTML/CSS interface.

## Implemented Sprint 2 stories

- Story 1: Secure student login
- Story 2: Database-backed combined course search
- Story 6: Persistent student schedule

## Local setup

1. Copy `.env.example` to `.env` and enter local MySQL settings.
2. Run `npm install`.
3. Execute `database/schema.sql` in MySQL Workbench.
4. Run `npm run db:seed`.
5. Run `npm start`.
6. Open `http://localhost:3000`.

## Test accounts

- `V00999999 / student123` — two enrolled classes
- `V00999998 / student123` — zero enrolled classes
- `V00999997 / student123` — one enrolled class

Do not commit `.env` or database credentials.
