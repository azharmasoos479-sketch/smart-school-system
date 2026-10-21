# 🎓 SmartSchool — School Management System for Pakistan

An all-in-one school management system in the style of modern Pakistani school SaaS platforms: a public marketing website, a full admin dashboard, and a REST API backend — in one repository.

![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20Vanilla%20JS%20%7C%20Node.js-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ What it includes

**Landing website** (`index.html`) — hero, features, 12 modules, how-it-works, PKR pricing (Free Trial / Premium from PKR 2,999/mo / Custom), testimonials and FAQ.

**Admin app** (`app/`) — a complete working system with demo data for a full school:

| Module | What it does |
|---|---|
| 📊 Dashboard | Student/staff counts, today's attendance %, monthly fee collection, ledger position, charts |
| 🎓 Students | Add/edit/delete, search & class filter, CSV export, parent contact details |
| 👩‍🏫 Staff & HR | Staff directory, roles, qualifications, salary bill |
| 🙋 Attendance | One-tap daily register per class/section, present/absent/late, parent alert list for absentees |
| 🧾 Fees & Challans | Monthly challan generation from fee structure, collection (Cash / EasyPaisa / JazzCash / Bank / 1BILL), discounts, printable receipts, defaulters & arrears |
| 📝 Exams & Results | Marks entry per subject, automatic grades (ممتاز / جید جداً / جید / مقبول / راسب), class positions, printable result cards |
| 📚 Accounting | Double-entry style ledger — fee income & salary payments post automatically; income/expense/P&L by category |
| 💰 Payroll | Monthly salary run per staff member, posts to the ledger |
| 📥 Admissions | Enquiry leads with source tracking (Facebook Ad, WhatsApp, Walk-in…), follow-up statuses, one-click enrolment |
| ⭐ Behaviour | Appreciation/concern log with a separate parent-facing message per entry |
| 📣 Announcements | Notices to parents, teachers, staff or everyone |
| 🗓️ Timetable | Weekly timetable per class & section |
| ⚙️ Settings & Data | School profile, class fee structure, subjects, JSON backup/restore, CSV exports, demo reset |

**Backend** (`server/`) — a zero-dependency Node.js server that hosts the site and exposes a REST API (see [docs/API.md](docs/API.md)). No `npm install` needed.

## 🚀 Run it

**Option 1 — just the app (no server):**
Open `index.html` in a browser, or serve the folder with any static host (GitHub Pages, Netlify):

```bash
npx serve .
```

**Option 2 — with the backend API:**

```bash
node server/server.js
# → http://localhost:8080
```

**Demo login:** `admin@school.pk` / `admin123`

The front-end stores data in the browser's `localStorage` so it works fully offline and on static hosting. The same data model is available over the REST API (`/api/db`, `/api/students`, …) for a hosted multi-user deployment.

## 📁 Project structure

```
├── index.html              # Landing website
├── assets/                 # Landing CSS/JS
├── app/                    # Admin dashboard (SPA)
│   ├── index.html
│   ├── app.css
│   └── app.js              # All modules + data layer + demo seed data
├── server/                 # Node.js backend (zero dependencies)
│   ├── server.js
│   └── package.json
└── docs/
    ├── API.md              # REST API reference
    └── FEATURES.md         # Feature list & roadmap
```

## 🛣️ Roadmap

- [ ] Parent & teacher mobile views (PWA)
- [ ] WhatsApp / SMS gateway for absent alerts & fee reminders
- [ ] 1BILL / 1LINK online fee payment integration
- [ ] Multi-branch support with branch-level logins
- [ ] Board-format result cards (FBISE / BISE templates)
- [ ] Role-based users (admin, teacher, accountant)

## ⚠️ Before production use

The demo login and API are intentionally simple. Before hosting real school data, add proper authentication (hashed passwords + sessions/JWT), per-school data isolation and HTTPS.

## 📄 License

MIT — free to use, modify and sell. Built as a portfolio/commercial starter system.
