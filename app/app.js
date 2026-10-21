'use strict';
/* ============================================================
   SmartSchool — School Management System (single-page app)
   Data layer: localStorage (works fully offline / on GitHub Pages).
   A REST API version of the same data model lives in /server.
   ============================================================ */
const DB_KEY = 'smartschool_db_v1';
const SESSION_KEY = 'smartschool_session';
let DB = null;

/* ---------- utils ---------- */
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = n => 'PKR ' + Number(n || 0).toLocaleString('en-PK');
const uid = p => p + Math.random().toString(36).slice(2, 9);
const todayStr = (d) => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const monthStr = (d) => { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLabel = m => { const [y, mo] = m.split('-'); return MONTHS[+mo - 1] + ' ' + y; };
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden'); setTimeout(() => t.classList.add('hidden'), 2400); }
function save() { localStorage.setItem(DB_KEY, JSON.stringify(DB)); }
function load() { try { DB = JSON.parse(localStorage.getItem(DB_KEY)); } catch (e) { DB = null; } if (!DB || !DB.students) { DB = seed(); save(); } if (DB && !DB.users) { DB.users = defaultUsers(); save(); } }

/* deterministic pseudo-random for stable demo data */
function rng(seedNum) { let s = seedNum; return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; }

/* ---------- seed demo data ---------- */
function seed() {
  const rand = rng(42);
  const pick = a => a[Math.floor(rand() * a.length)];
  const classes = [
    { id: 'c_nur', name: 'Nursery', fee: 2500 }, { id: 'c_kg', name: 'KG', fee: 2500 },
    { id: 'c1', name: 'Class 1', fee: 3000 }, { id: 'c2', name: 'Class 2', fee: 3000 },
    { id: 'c3', name: 'Class 3', fee: 3200 }, { id: 'c4', name: 'Class 4', fee: 3200 },
    { id: 'c5', name: 'Class 5', fee: 3500 }, { id: 'c6', name: 'Class 6', fee: 4000 },
    { id: 'c7', name: 'Class 7', fee: 4000 }, { id: 'c8', name: 'Class 8', fee: 4500 },
    { id: 'c9', name: 'Class 9', fee: 5500 }, { id: 'c10', name: 'Class 10', fee: 5500 }
  ];
  const subjects = ['English', 'Urdu', 'Mathematics', 'Science', 'Islamiyat', 'Computer'];
  const boys = ['Ahmed', 'Ali', 'Usman', 'Bilal', 'Hamza', 'Hassan', 'Omar', 'Taha', 'Zain', 'Abdullah', 'Ibrahim', 'Yusuf', 'Haroon', 'Danish', 'Shahzaib'];
  const girls = ['Fatima', 'Ayesha', 'Maryam', 'Zainab', 'Hira', 'Mahnoor', 'Iqra', 'Sana', 'Laiba', 'Noor', 'Areeba', 'Kinza'];
  const fathers = ['Muhammad Akram', 'Abdul Rehman', 'Muhammad Iqbal', 'Ghulam Abbas', 'Muhammad Aslam', 'Khalid Mehmood', 'Tariq Aziz', 'Muhammad Ramzan', 'Allah Ditta', 'Muhammad Sharif'];
  const students = [];
  let roll = 1000;
  classes.forEach((c, ci) => {
    const n = ci < 2 ? 3 : 4;
    for (let i = 0; i < n; i++) {
      const g = rand() > 0.45 ? 'Male' : 'Female';
      students.push({
        id: uid('st'), roll: ++roll, name: pick(g === 'Male' ? boys : girls) + ' ' + pick(['Khan', 'Ahmad', 'Ali', 'Raza', 'Hussain', 'Malik', '']),
        father: pick(fathers), classId: c.id, section: pick(['A', 'A', 'B']),
        gender: g, dob: (2012 + Math.floor(rand() * 8)) + '-0' + (1 + Math.floor(rand() * 9)) + '-15',
        phone: '03' + (21 + Math.floor(rand() * 29)) + ' ' + (1000000 + Math.floor(rand() * 8999999)),
        address: 'Kohat, Khyber Pakhtunkhwa', status: 'Active', admitted: '2025-04-01'
      });
    }
  });
  const staff = [
    { id: uid('sf'), name: 'Mrs. Shazia Bibi', role: 'Principal', phone: '0333 9001122', email: 'principal@school.pk', salary: 120000, qual: 'M.Phil Education' },
    { id: uid('sf'), name: 'Mr. Naveed Ahmad', role: 'Vice Principal', phone: '0333 9002233', email: 'vp@school.pk', salary: 85000, qual: 'M.A, B.Ed' },
    { id: uid('sf'), name: 'Miss Amina Tariq', role: 'Teacher — English', phone: '0345 1112233', email: 'amina@school.pk', salary: 55000, qual: 'M.A English' },
    { id: uid('sf'), name: 'Mr. Bilal Hussain', role: 'Teacher — Mathematics', phone: '0345 2223344', email: 'bilal@school.pk', salary: 58000, qual: 'M.Sc Mathematics' },
    { id: uid('sf'), name: 'Miss Rabia Noor', role: 'Teacher — Science', phone: '0345 3334455', email: 'rabia@school.pk', salary: 55000, qual: 'M.Sc Biology' },
    { id: uid('sf'), name: 'Mr. Imran Khattak', role: 'Teacher — Urdu', phone: '0345 4445566', email: 'imran@school.pk', salary: 52000, qual: 'M.A Urdu' },
    { id: uid('sf'), name: 'Mr. Faisal Mehmood', role: 'Accountant', phone: '0345 5556677', email: 'accounts@school.pk', salary: 60000, qual: 'M.Com' },
    { id: uid('sf'), name: 'Mrs. Saima Gul', role: 'Teacher — Islamiyat', phone: '0345 6667788', email: 'saima@school.pk', salary: 50000, qual: 'M.A Islamiyat' },
    { id: uid('sf'), name: 'Mr. Adnan Shah', role: 'Teacher — Computer', phone: '0345 7778899', email: 'adnan@school.pk', salary: 56000, qual: 'BS Computer Science' },
    { id: uid('sf'), name: 'Mr. Gul Zaman', role: 'Office Assistant', phone: '0345 8889900', email: 'office@school.pk', salary: 35000, qual: 'B.A' }
  ];
  /* attendance history % for the dashboard chart (last 7 school days) */
  const attHistory = [];
  for (let i = 6; i >= 1; i--) { const d = new Date(); d.setDate(d.getDate() - i); attHistory.push({ date: todayStr(d), pct: 88 + Math.floor(rand() * 10) }); }
  /* fees: challans for last 3 months */
  const challans = [];
  const cur = new Date();
  for (let back = 2; back >= 0; back--) {
    const d = new Date(cur.getFullYear(), cur.getMonth() - back, 1);
    const m = monthStr(d);
    students.forEach(st => {
      const fee = classes.find(c => c.id === st.classId).fee;
      const paid = back === 0 ? rand() > 0.45 : rand() > 0.12;
      challans.push({
        id: uid('ch'), no: 'CH-' + (1000 + challans.length + 1), studentId: st.id, month: m,
        amount: fee, discount: 0, status: paid ? 'Paid' : 'Unpaid',
        paidDate: paid ? m + '-' + String(3 + Math.floor(rand() * 20)).padStart(2, '0') : '',
        method: paid ? pick(['Cash', 'EasyPaisa', 'JazzCash', 'Bank Transfer']) : ''
      });
    });
  }
  /* one seeded exam with marks (out of 60 per subject) */
  const exam = { id: uid('ex'), name: 'Monthly Test', term: 'October 2026', maxPerSubject: 60 };
  const marks = {};
  students.forEach(st => { marks[st.id] = {}; subjects.forEach(s => { marks[st.id][s] = 25 + Math.floor(rand() * 35); }); });
  const ledger = [];
  challans.filter(c => c.status === 'Paid').slice(0, 40).forEach(c => ledger.push({ id: uid('lg'), date: c.paidDate, type: 'Income', cat: 'Fee Collection', desc: 'Challan ' + c.no, amount: c.amount }));
  [['Expense', 'Utility Bills', 'Electricity bill', 48500], ['Expense', 'Rent', 'Campus rent', 150000], ['Expense', 'Stationery', 'Printing & stationery', 22500], ['Income', 'Admission Fees', 'New admissions', 45000]].forEach(e =>
    ledger.push({ id: uid('lg'), date: todayStr(), type: e[0], cat: e[1], desc: e[2], amount: e[3] }));
  return {
    school: { name: 'The City Grammar School', city: 'Kohat', phone: '0922 510000', email: 'info@school.pk', address: 'Main Road, Kohat, Khyber Pakhtunkhwa' },
    classes, subjects, students, staff,
    attendance: {}, attHistory, challans, exams: [exam], marks: { [exam.id]: marks },
    ledger, payroll: [],
    leads: [
      { id: uid('ld'), child: 'Hadia Shahid', parent: 'Shahid Mehmood', phone: '0346 2469006', classApplied: 'c1', source: 'Facebook Ad', status: 'New', date: todayStr(), notes: 'Asked about fee concession for two siblings.' },
      { id: uid('ld'), child: 'Moosa Tariq', parent: 'Tariq Aziz', phone: '0333 7654321', classApplied: 'c_nur', source: 'Walk-in', status: 'Contacted', date: todayStr(), notes: 'Visited campus on Saturday.' },
      { id: uid('ld'), child: 'Eshal Rana', parent: 'Rana Imtiaz', phone: '0321 1122334', classApplied: 'c5', source: 'WhatsApp', status: 'New', date: todayStr(), notes: '' }
    ],
    behaviour: [
      { id: uid('bh'), studentId: students[3].id, date: todayStr(), type: 'Appreciation', note: 'Helped classmates with the science project.', parentMsg: 'Proud moment: your child helped classmates with the science project today.', shared: true },
      { id: uid('bh'), studentId: students[10].id, date: todayStr(), type: 'Concern', note: 'Homework incomplete three days in a row.', parentMsg: 'Please note: homework has been incomplete for three days. Kindly check the diary.', shared: true }
    ],
    announcements: [
      { id: uid('an'), date: todayStr(), title: 'Parent–Teacher Meeting', body: 'PTM for all classes will be held on Saturday, 10:00 AM to 1:00 PM. Parents are requested to attend.', target: 'Parents' },
      { id: uid('an'), date: todayStr(), title: 'Monthly Test Schedule', body: 'Monthly tests begin next Monday. Date sheet has been shared with all classes.', target: 'All' }
    ],
    users: defaultUsers(),
    timetable: {
      'c8_A': { Mon: ['English', 'Math', 'Science', 'Urdu', 'Islamiyat', 'Computer'], Tue: ['Math', 'English', 'Urdu', 'Science', 'Computer', 'Islamiyat'], Wed: ['Science', 'Urdu', 'Math', 'English', 'Islamiyat', 'Computer'], Thu: ['Urdu', 'Science', 'English', 'Math', 'Computer', 'Islamiyat'], Fri: ['Math', 'Islamiyat', 'English', 'Urdu', 'Science', '—'] }
    },
    events: [
      { date: todayStr(), label: 'PTM — all classes (Saturday)' },
      { date: todayStr(), label: 'Fee due date: 10th of the month' },
      { date: todayStr(), label: 'Monthly tests begin next Monday' }
    ]
  };
}


/* ---------- users & roles ---------- */
function defaultUsers() {
  return [
    { id: 'u_admin', name: 'Administrator', email: 'admin@school.pk', pass: 'admin123', role: 'Admin' },
    { id: 'u_teacher', name: 'Demo Teacher', email: 'teacher@school.pk', pass: 'teacher123', role: 'Teacher' },
    { id: 'u_accounts', name: 'Demo Accountant', email: 'accounts@school.pk', pass: 'accounts123', role: 'Accountant' }
  ];
}
function currentUser() {
  const em = localStorage.getItem(SESSION_KEY);
  return (DB.users || []).find(u => u.email === em) || (DB.users || [])[0] || null;
}

/* ---------- lookups ---------- */
const clsName = id => { const c = DB.classes.find(x => x.id === id); return c ? c.name : '—'; };
const clsFee = id => { const c = DB.classes.find(x => x.id === id); return c ? c.fee : 0; };
const stuById = id => DB.students.find(x => x.id === id);
const staffById = id => DB.staff.find(x => x.id === id);
const activeStudents = () => DB.students.filter(s => s.status === 'Active');

/* grading scale (percentage) — ممتاز / جید جداً / جید / مقبول / راسب */
function gradeFor(pct) {
  if (pct >= 80) return { en: 'Excellent', ur: 'ممتاز', cls: 'green' };
  if (pct >= 70) return { en: 'Very Good', ur: 'جید جداً', cls: 'green' };
  if (pct >= 60) return { en: 'Good', ur: 'جید', cls: 'blue' };
  if (pct >= 50) return { en: 'Satisfactory', ur: 'مقبول', cls: 'amber' };
  return { en: 'Fail', ur: 'راسب', cls: 'red' };
}

/* ---------- auth ---------- */
function doLogin() {
  const e = $('#loginEmail').value.trim().toLowerCase(), p = $('#loginPass').value;
  const u = (DB.users || []).find(x => x.email.toLowerCase() === e && x.pass === p);
  if (u) { localStorage.setItem(SESSION_KEY, u.email); showApp(); }
  else { $('#loginErr').textContent = 'Invalid email or password. Use a demo login shown below.'; }
}
function doLogout() { localStorage.removeItem(SESSION_KEY); location.reload(); }
function showApp() {
  $('#loginView').classList.add('hidden');
  $('#appView').classList.remove('hidden');
  const cu = currentUser(); $('#sideSchool').textContent = DB.school.name + ' — ' + DB.school.city + (cu ? ' · ' + cu.name + ' (' + cu.role + ')' : ''); const av = document.querySelector('.avatar'); if (av && cu) av.textContent = cu.name.trim().charAt(0).toUpperCase();
  $('#todayLabel').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  buildNav(); go('dashboard');
}

/* ---------- navigation ---------- */
const PAGES = [
  ['dashboard', '📊', 'Dashboard'], ['students', '🎓', 'Students'], ['staff', '👩‍🏫', 'Staff & HR'],
  ['attendance', '🙋', 'Attendance'], ['fees', '🧾', 'Fees & Challans'], ['results', '📝', 'Exams & Results'],
  ['accounts', '📚', 'Accounting'], ['payroll', '💰', 'Payroll'], ['admissions', '📥', 'Admissions'],
  ['behaviour', '⭐', 'Behaviour'], ['announce', '📣', 'Announcements'], ['timetable', '🗓️', 'Timetable'],
  ['settings', '⚙️', 'Settings & Data']
];
let currentPage = 'dashboard';
function buildNav() { $('#sideNav').innerHTML = PAGES.map(p => `<a data-page="${p[0]}" onclick="go('${p[0]}')">${p[1]} ${p[2]}</a>`).join(''); }
function go(page) {
  currentPage = page;
  $$('#sideNav a').forEach(a => a.classList.toggle('active', a.dataset.page === page));
  $('#pageTitle').textContent = (PAGES.find(p => p[0] === page) || [])[2] || page;
  document.body.classList.remove('nav-open');
  ({ dashboard: renderDashboard, students: renderStudents, staff: renderStaff, attendance: renderAttendance, fees: renderFees, results: renderResults, accounts: renderAccounts, payroll: renderPayroll, admissions: renderAdmissions, behaviour: renderBehaviour, announce: renderAnnounce, timetable: renderTimetable, settings: renderSettings })[page]();
  window.scrollTo(0, 0);
}

/* ---------- modal & forms ---------- */
function openModal(title, html) { $('#modalTitle').textContent = title; $('#modalBody').innerHTML = html; $('#modalWrap').classList.remove('hidden'); }
function closeModal() { $('#modalWrap').classList.add('hidden'); }
$('#modalWrap') && $('#modalWrap').addEventListener('click', e => { if (e.target.id === 'modalWrap') closeModal(); });
function field(label, inner) { return `<div><label>${label}</label>${inner}</div>`; }
function formActions(saveLabel) { return `<div class="form-actions"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="document.getElementById('modalForm').requestSubmit()">${saveLabel || 'Save'}</button></div>`; }
function confirmBox(msg, action) { openModal('Please confirm', `<p style="margin:8px 0 4px">${esc(msg)}</p><div class="form-actions"><button class="btn" onclick="closeModal()">No</button><button class="btn btn-danger" onclick="closeModal();(${action})()">Yes, continue</button></div>`); }

/* ---------- dashboard ---------- */
function renderDashboard() {
  const sts = activeStudents();
  const thisMonth = monthStr();
  const collected = DB.challans.filter(c => c.month === thisMonth && c.status === 'Paid').reduce((a, c) => a + c.amount - (c.discount || 0), 0);
  const outstanding = DB.challans.filter(c => c.status === 'Unpaid').reduce((a, c) => a + c.amount, 0);
  const attToday = DB.attendance[todayStr()] || {};
  const marked = Object.keys(attToday).length;
  const present = Object.values(attToday).filter(v => v === 'P').length;
  const attPct = marked ? Math.round(present / marked * 100) : null;
  const income = DB.ledger.filter(l => l.type === 'Income').reduce((a, l) => a + l.amount, 0);
  const expense = DB.ledger.filter(l => l.type === 'Expense').reduce((a, l) => a + l.amount, 0);
  $('#page').innerHTML = `
    <div class="cards">
      <div class="stat"><small>Total Students</small><b>${sts.length}</b><span>${DB.staff.length} staff members</span></div>
      <div class="stat"><small>Attendance Today</small><b>${attPct === null ? '—' : attPct + '%'}</b><span>${marked ? marked + ' students marked' : 'Not marked yet today'}</span></div>
      <div class="stat"><small>Fees Collected (${monthLabel(thisMonth)})</small><b>${fmt(collected)}</b><span>${fmt(outstanding)} outstanding</span></div>
      <div class="stat"><small>Net Position (Ledger)</small><b>${fmt(income - expense)}</b><span>Income ${fmt(income)} · Expense ${fmt(expense)}</span></div>
    </div>
    <div class="grid2">
      <div class="panel"><h3>📈 Fee collection — last 6 months</h3><canvas class="chart" id="feeChart"></canvas></div>
      <div class="panel"><h3>🙋 Attendance — last 7 school days</h3><canvas class="chart" id="attChart"></canvas></div>
    </div>
    <div class="grid2">
      <div class="panel"><h3>⚡ Quick actions</h3>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-primary" onclick="go('attendance')">Mark Attendance</button>
          <button class="btn" onclick="go('fees')">Generate Challans</button>
          <button class="btn" onclick="go('students')">Add Student</button>
          <button class="btn" onclick="go('announce')">New Announcement</button>
          <button class="btn" onclick="go('admissions')">Admission Leads (${DB.leads.filter(l => l.status === 'New').length} new)</button>
        </div>
        <h3 style="margin-top:22px">📌 Upcoming</h3>
        ${DB.events.map(e => `<p style="padding:5px 0;border-bottom:1px dashed var(--line)">• ${esc(e.label)}</p>`).join('')}
      </div>
      <div class="panel"><h3>🧾 Latest fee payments</h3>
        <table><tr><th>Challan</th><th>Student</th><th>Method</th><th class="right">Amount</th></tr>
        ${DB.challans.filter(c => c.status === 'Paid').slice(-6).reverse().map(c => { const s = stuById(c.studentId); return `<tr><td>${c.no}</td><td>${esc(s ? s.name : '')}</td><td>${esc(c.method)}</td><td class="right">${fmt(c.amount)}</td></tr>`; }).join('') || '<tr><td colspan="4" class="empty">No payments yet</td></tr>'}
        </table>
      </div>
    </div>`;
  drawBars('feeChart', last6Months().map(m => ({ label: monthLabel(m).split(' ')[0], value: DB.challans.filter(c => c.month === m && c.status === 'Paid').reduce((a, c) => a + c.amount, 0) })), '#1565d8');
  const hist = DB.attHistory.concat(marked ? [{ date: todayStr(), pct: attPct }] : []);
  drawBars('attChart', hist.slice(-7).map(h => ({ label: h.date.slice(5), value: h.pct })), '#0e9f8a', '%');
}
function last6Months() { const out = []; const d = new Date(); for (let i = 5; i >= 0; i--) out.push(monthStr(new Date(d.getFullYear(), d.getMonth() - i, 1))); return out; }
function drawBars(id, data, color, suffix) {
  const cv = document.getElementById(id); if (!cv) return;
  const dpr = window.devicePixelRatio || 1;
  const W = cv.clientWidth || 520, H = 210;
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
  const max = Math.max(...data.map(d => d.value), 1);
  const bw = Math.min(64, (W - 40) / data.length - 14);
  const gap = (W - 30) / data.length;
  ctx.font = '11px Segoe UI'; ctx.textAlign = 'center';
  data.forEach((d, i) => {
    const x = 18 + i * gap + (gap - bw) / 2, h = (d.value / max) * (H - 58), y = H - 34 - h;
    ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, bw, h, 5); ctx.fill();
    ctx.fillStyle = '#16233a'; ctx.fillText(suffix === '%' ? d.value + '%' : (d.value >= 1000 ? Math.round(d.value / 1000) + 'k' : d.value), x + bw / 2, y - 6);
    ctx.fillStyle = '#5b6b82'; ctx.fillText(d.label, x + bw / 2, H - 16);
  });
}

/* ---------- students ---------- */
let stuFilter = { q: '', classId: '' };
function renderStudents() {
  let list = DB.students.slice().sort((a, b) => a.roll - b.roll);
  if (stuFilter.classId) list = list.filter(s => s.classId === stuFilter.classId);
  if (stuFilter.q) { const q = stuFilter.q.toLowerCase(); list = list.filter(s => (s.name + ' ' + s.father + ' ' + s.roll + ' ' + s.phone).toLowerCase().includes(q)); }
  $('#page').innerHTML = `
    <div class="toolbar">
      <input placeholder="🔍 Search name, roll, father, phone…" value="${esc(stuFilter.q)}" oninput="stuFilter.q=this.value;renderStudents()">
      <select onchange="stuFilter.classId=this.value;renderStudents()"><option value="">All Classes</option>${DB.classes.map(c => `<option value="${c.id}" ${stuFilter.classId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
      <span class="sp"></span>
      <button class="btn" onclick="exportCSV('students')">⬇ Export CSV</button>
      <button class="btn btn-primary" onclick="studentForm()">＋ Add Student</button>
    </div>
    <div class="panel"><table>
      <tr><th>Roll</th><th>Student</th><th>Father</th><th>Class</th><th>Gender</th><th>Parent Phone</th><th>Status</th><th></th></tr>
      ${list.map(s => `<tr><td>${s.roll}</td><td><b>${esc(s.name)}</b></td><td>${esc(s.father)}</td><td>${clsName(s.classId)}-${esc(s.section)}</td><td>${s.gender}</td><td>${esc(s.phone)}</td><td><span class="pill ${s.status === 'Active' ? 'green' : 'grey'}">${s.status}</span></td>
      <td class="right"><button class="btn btn-sm" onclick="studentForm('${s.id}')">Edit</button> <button class="btn btn-sm btn-danger" onclick="confirmBox('Remove student ${esc(s.name)}? Their records stay in old reports.',()=>delStudent('${s.id}'))">Delete</button></td></tr>`).join('') || '<tr><td colspan="8" class="empty">No students found</td></tr>'}
    </table><p class="small mut" style="margin-top:10px">Showing ${list.length} of ${DB.students.length} students</p></div>`;
}
function studentForm(id) {
  const s = id ? stuById(id) : { name: '', father: '', classId: DB.classes[2].id, section: 'A', gender: 'Male', dob: '2016-01-01', phone: '', address: '', status: 'Active' };
  openModal(id ? 'Edit Student' : 'Add Student', `
    <form id="modalForm" onsubmit="saveStudent(event,'${id || ''}')">
    <div class="form-grid">
      ${field('Student Name *', `<input name="name" required value="${esc(s.name)}">`)}
      ${field('Father Name *', `<input name="father" required value="${esc(s.father)}">`)}
      ${field('Class *', `<select name="classId">${DB.classes.map(c => `<option value="${c.id}" ${s.classId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select>`)}
      ${field('Section', `<select name="section">${['A', 'B', 'C'].map(x => `<option ${s.section === x ? 'selected' : ''}>${x}</option>`).join('')}</select>`)}
      ${field('Gender', `<select name="gender">${['Male', 'Female'].map(x => `<option ${s.gender === x ? 'selected' : ''}>${x}</option>`).join('')}</select>`)}
      ${field('Date of Birth', `<input type="date" name="dob" value="${s.dob}">`)}
      ${field('Parent Phone (WhatsApp)', `<input name="phone" value="${esc(s.phone)}" placeholder="03XX XXXXXXX">`)}
      ${field('Status', `<select name="status">${['Active', 'Left', 'Graduated'].map(x => `<option ${s.status === x ? 'selected' : ''}>${x}</option>`).join('')}</select>`)}
    </div>
    ${field('Home Address', `<input name="address" value="${esc(s.address)}">`)}
    ${formActions(id ? 'Save Changes' : 'Add Student')}</form>`);
}
function saveStudent(e, id) {
  e.preventDefault();
  const f = new FormData(e.target), v = k => f.get(k);
  if (id) { Object.assign(stuById(id), { name: v('name'), father: v('father'), classId: v('classId'), section: v('section'), gender: v('gender'), dob: v('dob'), phone: v('phone'), address: v('address'), status: v('status') }); }
  else { DB.students.push({ id: uid('st'), roll: Math.max(1000, ...DB.students.map(s => s.roll)) + 1, name: v('name'), father: v('father'), classId: v('classId'), section: v('section'), gender: v('gender'), dob: v('dob'), phone: v('phone'), address: v('address'), status: v('status'), admitted: todayStr() }); }
  save(); closeModal(); renderStudents(); toast(id ? 'Student updated' : 'Student added');
}
function delStudent(id) { DB.students = DB.students.filter(s => s.id !== id); save(); renderStudents(); toast('Student deleted'); }

/* ---------- staff ---------- */
function renderStaff() {
  const totalSal = DB.staff.reduce((a, s) => a + s.salary, 0);
  $('#page').innerHTML = `
    <div class="toolbar"><span class="mut">${DB.staff.length} staff · Monthly salary bill <b>${fmt(totalSal)}</b></span><span class="sp"></span>
    <button class="btn" onclick="exportCSV('staff')">⬇ Export CSV</button><button class="btn btn-primary" onclick="staffForm()">＋ Add Staff</button></div>
    <div class="panel"><table>
      <tr><th>Name</th><th>Role</th><th>Qualification</th><th>Phone</th><th>Email</th><th class="right">Salary</th><th></th></tr>
      ${DB.staff.map(s => `<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.role)}</td><td>${esc(s.qual)}</td><td>${esc(s.phone)}</td><td>${esc(s.email)}</td><td class="right">${fmt(s.salary)}</td>
      <td class="right"><button class="btn btn-sm" onclick="staffForm('${s.id}')">Edit</button> <button class="btn btn-sm btn-danger" onclick="confirmBox('Remove ${esc(s.name)} from staff?',()=>delStaff('${s.id}'))">Delete</button></td></tr>`).join('')}
    </table></div>`;
}
function staffForm(id) {
  const s = id ? staffById(id) : { name: '', role: 'Teacher', phone: '', email: '', salary: 50000, qual: '' };
  openModal(id ? 'Edit Staff Member' : 'Add Staff Member', `
    <form id="modalForm" onsubmit="saveStaff(event,'${id || ''}')">
    <div class="form-grid">
      ${field('Full Name *', `<input name="name" required value="${esc(s.name)}">`)}
      ${field('Role *', `<input name="role" required value="${esc(s.role)}" placeholder="Teacher — Mathematics">`)}
      ${field('Phone', `<input name="phone" value="${esc(s.phone)}">`)}
      ${field('Email', `<input type="email" name="email" value="${esc(s.email)}">`)}
      ${field('Monthly Salary (PKR) *', `<input type="number" name="salary" required min="0" value="${s.salary}">`)}
      ${field('Qualification', `<input name="qual" value="${esc(s.qual)}">`)}
    </div>${formActions(id ? 'Save Changes' : 'Add Staff')}</form>`);
}
function saveStaff(e, id) {
  e.preventDefault(); const f = new FormData(e.target), v = k => f.get(k);
  const data = { name: v('name'), role: v('role'), phone: v('phone'), email: v('email'), salary: +v('salary'), qual: v('qual') };
  if (id) Object.assign(staffById(id), data); else DB.staff.push({ id: uid('sf'), ...data });
  save(); closeModal(); renderStaff(); toast('Staff saved');
}
function delStaff(id) { DB.staff = DB.staff.filter(s => s.id !== id); save(); renderStaff(); toast('Staff member removed'); }

/* ---------- attendance ---------- */
let attSel = { date: todayStr(), classId: null, section: 'A' };
function renderAttendance() {
  if (!attSel.classId) attSel.classId = DB.classes[5].id;
  const list = activeStudents().filter(s => s.classId === attSel.classId && s.section === attSel.section).sort((a, b) => a.roll - b.roll);
  const day = DB.attendance[attSel.date] || {};
  const counts = { P: 0, A: 0, L: 0 };
  list.forEach(s => { if (day[s.id]) counts[day[s.id]]++; });
  const absent = list.filter(s => day[s.id] === 'A');
  $('#page').innerHTML = `
    <div class="toolbar">
      <input type="date" value="${attSel.date}" onchange="attSel.date=this.value;renderAttendance()">
      <select onchange="attSel.classId=this.value;renderAttendance()">${DB.classes.map(c => `<option value="${c.id}" ${attSel.classId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
      <select onchange="attSel.section=this.value;renderAttendance()">${['A', 'B', 'C'].map(x => `<option ${attSel.section === x ? 'selected' : ''}>Section ${x}</option>`).join('')}</select>
      <span class="sp"></span>
      <span class="pill green">Present ${counts.P}</span> <span class="pill red">Absent ${counts.A}</span> <span class="pill amber">Late ${counts.L}</span>
      <button class="btn" onclick="markAll('P')">Mark all Present</button>
      <button class="btn btn-primary" onclick="saveAttendance()">Save Register</button>
    </div>
    <div class="panel"><table>
      <tr><th>Roll</th><th>Student</th><th>Father</th><th>Status</th></tr>
      ${list.map(s => `<tr><td>${s.roll}</td><td><b>${esc(s.name)}</b></td><td>${esc(s.father)}</td>
        <td><div class="att-btns">${['P', 'A', 'L'].map(v => `<button class="${day[s.id] === v ? 'on-' + v : ''}" onclick="setAtt('${s.id}','${v}')">${v === 'P' ? 'Present' : v === 'A' ? 'Absent' : 'Late'}</button>`).join('')}</div></td></tr>`).join('') || '<tr><td colspan="4" class="empty">No students in this class/section</td></tr>'}
    </table></div>
    ${absent.length ? `<div class="panel"><h3>📲 Absent today — parent alert list</h3>${absent.map(s => `<p style="padding:5px 0;border-bottom:1px dashed var(--line)">${esc(s.name)} (${clsName(s.classId)}-${s.section}) — Father: ${esc(s.father)} — <b>${esc(s.phone)}</b></p>`).join('')}<p class="small mut" style="margin-top:8px">In the full version these parents receive an automatic WhatsApp/SMS alert.</p></div>` : ''}`;
}
function setAtt(sid, v) { DB.attendance[attSel.date] = DB.attendance[attSel.date] || {}; DB.attendance[attSel.date][sid] = v; renderAttendance(); }
function markAll(v) { DB.attendance[attSel.date] = DB.attendance[attSel.date] || {}; activeStudents().filter(s => s.classId === attSel.classId && s.section === attSel.section).forEach(s => DB.attendance[attSel.date][s.id] = v); renderAttendance(); }
function saveAttendance() {
  save();
  const day = DB.attendance[attSel.date] || {};
  const list = activeStudents().filter(s => s.classId === attSel.classId && s.section === attSel.section);
  const p = list.filter(s => day[s.id] === 'P').length;
  toast(`Register saved — ${p}/${list.length} present`);
}

/* ---------- fees ---------- */
let feeSel = { month: monthStr(), classId: '' };
function renderFees() {
  let list = DB.challans.filter(c => c.month === feeSel.month);
  if (feeSel.classId) list = list.filter(c => { const s = stuById(c.studentId); return s && s.classId === feeSel.classId; });
  list = list.slice().sort((a, b) => a.no.localeCompare(b.no));
  const paidSum = list.filter(c => c.status === 'Paid').reduce((a, c) => a + c.amount - (c.discount || 0), 0);
  const dueSum = list.filter(c => c.status === 'Unpaid').reduce((a, c) => a + c.amount, 0);
  const defaulters = DB.challans.filter(c => c.status === 'Unpaid');
  $('#page').innerHTML = `
    <div class="cards">
      <div class="stat"><small>Collected (${monthLabel(feeSel.month)})</small><b>${fmt(paidSum)}</b><span>${list.filter(c => c.status === 'Paid').length} challans paid</span></div>
      <div class="stat"><small>Outstanding (this month)</small><b>${fmt(dueSum)}</b><span>${list.filter(c => c.status === 'Unpaid').length} challans unpaid</span></div>
      <div class="stat"><small>Total Defaulters (all months)</small><b>${new Set(defaulters.map(c => c.studentId)).size}</b><span>${fmt(defaulters.reduce((a, c) => a + c.amount, 0))} in arrears</span></div>
      <div class="stat"><small>Students</small><b>${activeStudents().length}</b><span>Fee from ${fmt(Math.min(...DB.classes.map(c => c.fee)))} – ${fmt(Math.max(...DB.classes.map(c => c.fee)))}/mo</span></div>
    </div>
    <div class="toolbar">
      <input type="month" value="${feeSel.month}" onchange="feeSel.month=this.value;renderFees()">
      <select onchange="feeSel.classId=this.value;renderFees()"><option value="">All Classes</option>${DB.classes.map(c => `<option value="${c.id}" ${feeSel.classId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
      <span class="sp"></span>
      <button class="btn" onclick="exportCSV('challans')">⬇ Export CSV</button>
      <button class="btn btn-primary" onclick="generateChallans()">🧾 Generate Challans for ${monthLabel(feeSel.month)}</button>
    </div>
    <div class="panel"><table>
      <tr><th>Challan</th><th>Student</th><th>Class</th><th class="right">Amount</th><th>Status</th><th>Paid via</th><th></th></tr>
      ${list.map(c => { const s = stuById(c.studentId); return `<tr><td>${c.no}</td><td><b>${esc(s ? s.name : '—')}</b></td><td>${s ? clsName(s.classId) + '-' + s.section : ''}</td><td class="right">${fmt(c.amount - (c.discount || 0))}</td>
      <td><span class="pill ${c.status === 'Paid' ? 'green' : 'red'}">${c.status}</span></td><td>${esc(c.method || '—')}${c.paidDate ? ' · ' + c.paidDate : ''}</td>
      <td class="right">${c.status === 'Unpaid' ? `<button class="btn btn-sm btn-teal" onclick="collectFee('${c.id}')">Collect</button>` : `<button class="btn btn-sm" onclick="printReceipt('${c.id}')">🖨 Receipt</button>`}</td></tr>`; }).join('') || '<tr><td colspan="7" class="empty">No challans for this month yet — click "Generate Challans".</td></tr>'}
    </table></div>`;
}
function generateChallans() {
  const m = feeSel.month;
  const existing = new Set(DB.challans.filter(c => c.month === m).map(c => c.studentId));
  let n = 0;
  activeStudents().forEach(s => {
    if (existing.has(s.id)) return;
    const arrears = DB.challans.filter(c => c.studentId === s.id && c.status === 'Unpaid').reduce((a, c) => a + c.amount, 0);
    DB.challans.push({ id: uid('ch'), no: 'CH-' + (1000 + DB.challans.length + 1), studentId: s.id, month: m, amount: clsFee(s.classId) + (arrears ? 0 : 0), discount: 0, status: 'Unpaid', paidDate: '', method: '' });
    n++;
  });
  save(); renderFees(); toast(n ? n + ' challans generated for ' + monthLabel(m) : 'Challans already exist for this month');
}
function collectFee(id) {
  const c = DB.challans.find(x => x.id === id); const s = stuById(c.studentId);
  openModal('Collect Fee — ' + c.no, `
    <p class="mut" style="margin-bottom:6px">${esc(s ? s.name : '')} · ${s ? clsName(s.classId) : ''} · ${monthLabel(c.month)}</p>
    <form id="modalForm" onsubmit="saveCollect(event,'${id}')">
    <div class="form-grid">
      ${field('Amount (PKR)', `<input type="number" name="amount" value="${c.amount}" min="0" required>`)}
      ${field('Discount / Concession (PKR)', `<input type="number" name="discount" value="0" min="0">`)}
      ${field('Payment Method', `<select name="method">${['Cash', 'EasyPaisa', 'JazzCash', 'Bank Transfer', '1BILL Challan'].map(m => `<option>${m}</option>`).join('')}</select>`)}
      ${field('Date', `<input type="date" name="date" value="${todayStr()}">`)}
    </div>${formActions('Collect & Issue Receipt')}</form>`);
}
function saveCollect(e, id) {
  e.preventDefault(); const f = new FormData(e.target);
  const c = DB.challans.find(x => x.id === id);
  c.amount = +f.get('amount'); c.discount = +f.get('discount'); c.method = f.get('method'); c.paidDate = f.get('date'); c.status = 'Paid';
  DB.ledger.push({ id: uid('lg'), date: c.paidDate, type: 'Income', cat: 'Fee Collection', desc: 'Challan ' + c.no + ' — ' + (stuById(c.studentId) || {}).name, amount: c.amount - c.discount });
  save(); closeModal(); renderFees(); toast('Fee collected — receipt ready');
  printReceipt(id);
}
function printReceipt(id) {
  const c = DB.challans.find(x => x.id === id); const s = stuById(c.studentId);
  $('#printArea').innerHTML = `
    <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:8px"><h2>${esc(DB.school.name)}</h2><p>${esc(DB.school.address)} · ${esc(DB.school.phone)}</p><h3 style="margin-top:6px">FEE RECEIPT</h3></div>
    <table style="margin-top:14px">
      <tr><td><b>Challan No</b></td><td>${c.no}</td><td><b>Month</b></td><td>${monthLabel(c.month)}</td></tr>
      <tr><td><b>Student</b></td><td>${esc(s ? s.name : '')} (Roll ${s ? s.roll : ''})</td><td><b>Class</b></td><td>${s ? clsName(s.classId) + '-' + s.section : ''}</td></tr>
      <tr><td><b>Received via</b></td><td>${esc(c.method)}</td><td><b>Date</b></td><td>${c.paidDate}</td></tr>
      <tr><td><b>Fee</b></td><td>${fmt(c.amount)}</td><td><b>Discount</b></td><td>${fmt(c.discount || 0)}</td></tr>
      <tr><td colspan="2"><b>Total Received</b></td><td colspan="2"><b>${fmt(c.amount - (c.discount || 0))}</b></td></tr>
    </table>
    <p style="margin-top:20px">Received by: ______________________ &nbsp;&nbsp; Signature: ______________________</p>
    <p style="font-size:12px;margin-top:8px">This is a computer-generated receipt from SmartSchool.</p>`;
  window.print();
}

/* ---------- exams & results ---------- */
let resSel = { examId: null, classId: null };
function renderResults() {
  if (!resSel.examId && DB.exams.length) resSel.examId = DB.exams[0].id;
  if (!resSel.classId) resSel.classId = DB.classes[7].id;
  const exam = DB.exams.find(e => e.id === resSel.examId);
  const marks = exam ? (DB.marks[exam.id] || {}) : {};
  const list = activeStudents().filter(s => s.classId === resSel.classId).sort((a, b) => a.roll - b.roll);
  const maxTotal = exam ? exam.maxPerSubject * DB.subjects.length : 0;
  const rows = list.map(s => {
    const m = marks[s.id] || {};
    const total = DB.subjects.reduce((a, sub) => a + (m[sub] || 0), 0);
    const pct = maxTotal ? Math.round(total / maxTotal * 1000) / 10 : 0;
    return { s, m, total, pct };
  }).sort((a, b) => b.total - a.total);
  rows.forEach((r, i) => r.pos = i + 1);
  rows.sort((a, b) => a.s.roll - b.s.roll);
  $('#page').innerHTML = `
    <div class="toolbar">
      <select onchange="resSel.examId=this.value;renderResults()">${DB.exams.map(e => `<option value="${e.id}" ${resSel.examId === e.id ? 'selected' : ''}>${esc(e.name)} — ${esc(e.term)}</option>`).join('')}</select>
      <select onchange="resSel.classId=this.value;renderResults()">${DB.classes.map(c => `<option value="${c.id}" ${resSel.classId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
      <span class="sp"></span>
      <button class="btn" onclick="examForm()">＋ New Exam</button>
      <button class="btn btn-primary" onclick="saveMarks()">Save Marks</button>
    </div>
    ${exam ? `<div class="panel"><p class="small mut" style="margin-bottom:12px">Enter marks per subject (max ${exam.maxPerSubject} each). Grades: 80%+ ممتاز Excellent · 70%+ جید جداً Very Good · 60%+ جید Good · 50%+ مقبول Satisfactory · below 50% راسب Fail. Click 🖨 for a printable result card.</p>
    <table><tr><th>Roll</th><th>Student</th>${DB.subjects.map(s => `<th>${s}</th>`).join('')}<th>Total</th><th>%</th><th>Grade</th><th>Pos</th><th></th></tr>
    ${rows.map(r => { const g = gradeFor(r.pct); return `<tr><td>${r.s.roll}</td><td><b>${esc(r.s.name)}</b></td>
      ${DB.subjects.map(sub => `<td><input style="width:64px;padding:5px 7px" type="number" min="0" max="${exam.maxPerSubject}" value="${r.m[sub] != null ? r.m[sub] : ''}" data-mark="${r.s.id}|${sub}"></td>`).join('')}
      <td><b>${r.total}</b>/${maxTotal}</td><td>${r.pct}%</td><td><span class="pill ${g.cls}">${g.ur} ${g.en}</span></td><td>${r.pos}</td>
      <td><button class="btn btn-sm" onclick="printResultCard('${r.s.id}')">🖨 Card</button></td></tr>`; }).join('') || '<tr><td colspan="12" class="empty">No students in this class</td></tr>'}
    </table></div>` : '<div class="panel empty">Create an exam to start entering marks.</div>'}`;
}
function examForm() {
  openModal('New Exam', `<form id="modalForm" onsubmit="saveExam(event)">
    ${field('Exam Name *', `<input name="name" required placeholder="e.g. Final Term Exam">`)}
    ${field('Term / Session *', `<input name="term" required placeholder="e.g. March 2027">`)}
    ${field('Max Marks per Subject', `<input type="number" name="max" value="60" min="1" required>`)}
    ${formActions('Create Exam')}</form>`);
}
function saveExam(e) {
  e.preventDefault(); const f = new FormData(e.target);
  const ex = { id: uid('ex'), name: f.get('name'), term: f.get('term'), maxPerSubject: +f.get('max') };
  DB.exams.push(ex); DB.marks[ex.id] = {}; resSel.examId = ex.id;
  save(); closeModal(); renderResults(); toast('Exam created');
}
function saveMarks() {
  const exam = DB.exams.find(e => e.id === resSel.examId); if (!exam) return;
  DB.marks[exam.id] = DB.marks[exam.id] || {};
  $$('#page [data-mark]').forEach(inp => {
    const [sid, sub] = inp.dataset.mark.split('|');
    DB.marks[exam.id][sid] = DB.marks[exam.id][sid] || {};
    DB.marks[exam.id][sid][sub] = inp.value === '' ? 0 : Math.max(0, Math.min(exam.maxPerSubject, +inp.value));
  });
  save(); renderResults(); toast('Marks saved — positions & grades updated');
}
function printResultCard(sid) {
  const exam = DB.exams.find(e => e.id === resSel.examId);
  const s = stuById(sid); const m = (DB.marks[exam.id] || {})[sid] || {};
  const maxTotal = exam.maxPerSubject * DB.subjects.length;
  const total = DB.subjects.reduce((a, sub) => a + (m[sub] || 0), 0);
  const pct = Math.round(total / maxTotal * 1000) / 10;
  const g = gradeFor(pct);
  const classmates = activeStudents().filter(x => x.classId === s.classId).map(x => DB.subjects.reduce((a, sub) => a + (((DB.marks[exam.id] || {})[x.id] || {})[sub] || 0), 0)).sort((a, b) => b - a);
  const pos = classmates.indexOf(total) + 1;
  $('#printArea').innerHTML = `
    <div style="text-align:center;border:3px double #000;padding:18px">
      <h2>${esc(DB.school.name)}</h2><p>${esc(DB.school.address)} · ${esc(DB.school.phone)}</p>
      <h3 style="margin:8px 0">RESULT CARD — ${esc(exam.name)} (${esc(exam.term)})</h3>
      <table style="margin-top:10px;text-align:left">
        <tr><td><b>Student</b></td><td>${esc(s.name)}</td><td><b>Roll No</b></td><td>${s.roll}</td></tr>
        <tr><td><b>Father</b></td><td>${esc(s.father)}</td><td><b>Class</b></td><td>${clsName(s.classId)}-${s.section}</td></tr>
      </table>
      <table style="margin-top:12px"><tr><th>Subject</th><th>Max Marks</th><th>Obtained</th></tr>
        ${DB.subjects.map(sub => `<tr><td>${sub}</td><td>${exam.maxPerSubject}</td><td>${m[sub] != null ? m[sub] : '—'}</td></tr>`).join('')}
        <tr><td><b>Total</b></td><td><b>${maxTotal}</b></td><td><b>${total}</b></td></tr>
      </table>
      <table style="margin-top:12px;text-align:left">
        <tr><td><b>Percentage</b></td><td>${pct}%</td><td><b>Grade</b></td><td>${g.ur} (${g.en})</td><td><b>Position in Class</b></td><td>${pos} of ${classmates.length}</td></tr>
      </table>
      <p style="margin-top:22px;text-align:left">Class Teacher: ______________________ &nbsp;&nbsp;&nbsp; Principal: ______________________</p>
      <p style="font-size:12px;margin-top:8px">Generated by SmartSchool — ${esc(DB.school.name)}</p>
    </div>`;
  window.print();
}

/* ---------- accounting ---------- */
function renderAccounts() {
  const income = DB.ledger.filter(l => l.type === 'Income').reduce((a, l) => a + l.amount, 0);
  const expense = DB.ledger.filter(l => l.type === 'Expense').reduce((a, l) => a + l.amount, 0);
  const cats = {};
  DB.ledger.forEach(l => { cats[l.cat] = cats[l.cat] || { in: 0, out: 0 }; if (l.type === 'Income') cats[l.cat].in += l.amount; else cats[l.cat].out += l.amount; });
  $('#page').innerHTML = `
    <div class="cards">
      <div class="stat"><small>Total Income</small><b>${fmt(income)}</b><span>all ledger entries</span></div>
      <div class="stat"><small>Total Expenses</small><b>${fmt(expense)}</b><span>all ledger entries</span></div>
      <div class="stat"><small>Net Profit / (Loss)</small><b style="color:${income - expense >= 0 ? 'var(--teal)' : 'var(--red)'}">${fmt(income - expense)}</b><span>income − expenses</span></div>
      <div class="stat"><small>Salary Bill (monthly)</small><b>${fmt(DB.staff.reduce((a, s) => a + s.salary, 0))}</b><span>${Math.round(DB.staff.reduce((a, s) => a + s.salary, 0) / Math.max(1, income) * 100)}% of income</span></div>
    </div>
    <div class="toolbar"><span class="mut">Every fee collection and salary payment posts here automatically.</span><span class="sp"></span>
      <button class="btn" onclick="exportCSV('ledger')">⬇ Export CSV</button><button class="btn btn-primary" onclick="ledgerForm()">＋ Add Entry</button></div>
    <div class="grid2">
      <div class="panel"><h3>📒 Ledger</h3><table><tr><th>Date</th><th>Description</th><th>Category</th><th class="right">Amount</th><th></th></tr>
        ${DB.ledger.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30).map(l => `<tr><td>${l.date}</td><td>${esc(l.desc)}</td><td><span class="pill ${l.type === 'Income' ? 'green' : 'red'}">${l.cat}</span></td><td class="right" style="color:${l.type === 'Income' ? 'var(--teal)' : 'var(--red)'}">${l.type === 'Income' ? '+' : '−'} ${fmt(l.amount)}</td><td><button class="btn btn-sm btn-danger" onclick="confirmBox('Delete this ledger entry?',()=>delLedger('${l.id}'))">✕</button></td></tr>`).join('') || '<tr><td colspan="5" class="empty">No entries</td></tr>'}
      </table></div>
      <div class="panel"><h3>📊 By category</h3><table><tr><th>Category</th><th class="right">In</th><th class="right">Out</th></tr>
        ${Object.entries(cats).map(([k, v]) => `<tr><td>${esc(k)}</td><td class="right">${fmt(v.in)}</td><td class="right">${fmt(v.out)}</td></tr>`).join('')}
      </table></div>
    </div>`;
}
function ledgerForm() {
  openModal('Add Ledger Entry', `<form id="modalForm" onsubmit="saveLedger(event)">
    <div class="form-grid">
      ${field('Type', `<select name="type"><option>Income</option><option>Expense</option></select>`)}
      ${field('Date', `<input type="date" name="date" value="${todayStr()}" required>`)}
      ${field('Category', `<input name="cat" required placeholder="e.g. Utility Bills, Donations">`)}
      ${field('Amount (PKR)', `<input type="number" name="amount" min="1" required>`)}
    </div>
    ${field('Description', `<input name="desc" required placeholder="What is this entry for?">`)}
    ${formActions('Add Entry')}</form>`);
}
function saveLedger(e) { e.preventDefault(); const f = new FormData(e.target); DB.ledger.push({ id: uid('lg'), date: f.get('date'), type: f.get('type'), cat: f.get('cat'), desc: f.get('desc'), amount: +f.get('amount') }); save(); closeModal(); renderAccounts(); toast('Entry added'); }
function delLedger(id) { DB.ledger = DB.ledger.filter(l => l.id !== id); save(); renderAccounts(); }

/* ---------- payroll ---------- */
let paySel = { month: monthStr() };
function renderPayroll() {
  const m = paySel.month;
  const total = DB.staff.reduce((a, s) => a + s.salary, 0);
  const paid = DB.payroll.filter(p => p.month === m);
  const paidSum = paid.reduce((a, p) => a + p.amount, 0);
  $('#page').innerHTML = `
    <div class="toolbar"><input type="month" value="${m}" onchange="paySel.month=this.value;renderPayroll()">
      <span class="mut">Paid <b>${fmt(paidSum)}</b> of <b>${fmt(total)}</b> for ${monthLabel(m)}</span><span class="sp"></span>
      <button class="btn btn-primary" onclick="payAll()">Pay All Remaining</button></div>
    <div class="panel"><table><tr><th>Staff</th><th>Role</th><th class="right">Salary</th><th>Status</th><th></th></tr>
      ${DB.staff.map(s => { const p = paid.find(x => x.staffId === s.id); return `<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.role)}</td><td class="right">${fmt(s.salary)}</td>
      <td>${p ? `<span class="pill green">Paid · ${p.date}</span>` : '<span class="pill red">Unpaid</span>'}</td>
      <td class="right">${p ? '' : `<button class="btn btn-sm btn-teal" onclick="paySalary('${s.id}')">Pay Salary</button>`}</td></tr>`; }).join('')}
    </table></div>`;
}
function paySalary(sid) {
  const s = staffById(sid);
  DB.payroll.push({ id: uid('pr'), staffId: sid, month: paySel.month, amount: s.salary, date: todayStr() });
  DB.ledger.push({ id: uid('lg'), date: todayStr(), type: 'Expense', cat: 'Salaries', desc: 'Salary ' + monthLabel(paySel.month) + ' — ' + s.name, amount: s.salary });
  save(); renderPayroll(); toast('Salary paid to ' + s.name);
}
function payAll() { DB.staff.forEach(s => { if (!DB.payroll.find(p => p.month === paySel.month && p.staffId === s.id)) { DB.payroll.push({ id: uid('pr'), staffId: s.id, month: paySel.month, amount: s.salary, date: todayStr() }); DB.ledger.push({ id: uid('lg'), date: todayStr(), type: 'Expense', cat: 'Salaries', desc: 'Salary ' + monthLabel(paySel.month) + ' — ' + s.name, amount: s.salary }); } }); save(); renderPayroll(); toast('All salaries paid for ' + monthLabel(paySel.month)); }

/* ---------- admissions ---------- */
function renderAdmissions() {
  const counts = {}; DB.leads.forEach(l => counts[l.status] = (counts[l.status] || 0) + 1);
  $('#page').innerHTML = `
    <div class="toolbar"><span class="mut">${DB.leads.length} enquiries · ${counts['New'] || 0} new · ${counts['Enrolled'] || 0} enrolled</span><span class="sp"></span>
    <button class="btn btn-primary" onclick="leadForm()">＋ Add Enquiry</button></div>
    <div class="panel"><table><tr><th>Date</th><th>Child</th><th>Parent</th><th>Phone</th><th>Class Applied</th><th>Source</th><th>Status</th><th></th></tr>
    ${DB.leads.map(l => `<tr><td>${l.date}</td><td><b>${esc(l.child)}</b></td><td>${esc(l.parent)}</td><td>${esc(l.phone)}</td><td>${clsName(l.classApplied)}</td><td><span class="pill blue">${esc(l.source)}</span></td>
      <td><select style="width:auto;padding:4px 8px" onchange="setLeadStatus('${l.id}',this.value)">${['New', 'Contacted', 'Visit Scheduled', 'Enrolled', 'Not Interested'].map(x => `<option ${l.status === x ? 'selected' : ''}>${x}</option>`).join('')}</select></td>
      <td class="right">${l.status !== 'Enrolled' ? `<button class="btn btn-sm btn-teal" onclick="enrolLead('${l.id}')">Enrol →</button>` : ''} <button class="btn btn-sm btn-danger" onclick="confirmBox('Delete this enquiry?',()=>delLead('${l.id}'))">✕</button></td></tr>`).join('') || '<tr><td colspan="8" class="empty">No enquiries yet</td></tr>'}
    </table><p class="small mut" style="margin-top:10px">Tip: use a separate source name for each Facebook ad, WhatsApp broadcast or banner so you can see which advert brings admissions.</p></div>`;
}
function leadForm() {
  openModal('Add Admission Enquiry', `<form id="modalForm" onsubmit="saveLead(event)">
    <div class="form-grid">
      ${field('Child Name *', `<input name="child" required>`)}
      ${field('Parent Name *', `<input name="parent" required>`)}
      ${field('Phone (WhatsApp) *', `<input name="phone" required placeholder="03XX XXXXXXX">`)}
      ${field('Class Applied For', `<select name="classApplied">${DB.classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>`)}
      ${field('Source', `<select name="source">${['Walk-in', 'Facebook Ad', 'WhatsApp', 'Banner / Flyer', 'Referral', 'Website'].map(x => `<option>${x}</option>`).join('')}</select>`)}
      ${field('Date', `<input type="date" name="date" value="${todayStr()}">`)}
    </div>
    ${field('Notes', `<input name="notes" placeholder="Anything to remember about this family">`)}
    ${formActions('Add Enquiry')}</form>`);
}
function saveLead(e) { e.preventDefault(); const f = new FormData(e.target); DB.leads.push({ id: uid('ld'), child: f.get('child'), parent: f.get('parent'), phone: f.get('phone'), classApplied: f.get('classApplied'), source: f.get('source'), status: 'New', date: f.get('date'), notes: f.get('notes') }); save(); closeModal(); renderAdmissions(); toast('Enquiry added'); }
function setLeadStatus(id, v) { DB.leads.find(l => l.id === id).status = v; save(); renderAdmissions(); }
function delLead(id) { DB.leads = DB.leads.filter(l => l.id !== id); save(); renderAdmissions(); }
function enrolLead(id) {
  const l = DB.leads.find(x => x.id === id);
  DB.students.push({ id: uid('st'), roll: Math.max(1000, ...DB.students.map(s => s.roll)) + 1, name: l.child, father: l.parent, classId: l.classApplied, section: 'A', gender: 'Male', dob: '2017-01-01', phone: l.phone, address: '', status: 'Active', admitted: todayStr() });
  l.status = 'Enrolled'; save(); renderAdmissions(); toast(l.child + ' enrolled as a student');
}

/* ---------- behaviour ---------- */
function renderBehaviour() {
  $('#page').innerHTML = `
    <div class="toolbar"><span class="mut">Log appreciation and concerns. Only the parent message is shared with the family — the staff note stays inside the school.</span><span class="sp"></span>
    <button class="btn btn-primary" onclick="behaviourForm()">＋ Add Entry</button></div>
    <div class="panel"><table><tr><th>Date</th><th>Student</th><th>Type</th><th>Staff Note</th><th>Message to Parents</th><th>Shared</th><th></th></tr>
    ${DB.behaviour.slice().reverse().map(b => { const s = stuById(b.studentId); return `<tr><td>${b.date}</td><td><b>${esc(s ? s.name : '—')}</b><br><span class="small mut">${s ? clsName(s.classId) + '-' + s.section : ''}</span></td>
      <td><span class="pill ${b.type === 'Appreciation' ? 'green' : 'amber'}">${b.type === 'Appreciation' ? '⭐ Appreciation' : '⚠ Concern'}</span></td>
      <td>${esc(b.note)}${b.by ? '<br><span class="small mut">by ' + esc(b.by) + '</span>' : ''}</td><td>${esc(b.parentMsg)}</td><td>${b.shared ? '<span class="pill green">Yes</span>' : '<span class="pill grey">No</span>'}</td>
      <td><button class="btn btn-sm btn-danger" onclick="confirmBox('Delete this behaviour entry?',()=>delBehaviour('${b.id}'))">✕</button></td></tr>`; }).join('') || '<tr><td colspan="7" class="empty">No entries yet</td></tr>'}
    </table></div>`;
}
function behaviourForm() {
  openModal('Add Behaviour Entry', `<form id="modalForm" onsubmit="saveBehaviour(event)">
    ${field('Student *', `<select name="studentId">${activeStudents().slice().sort((a, b) => a.roll - b.roll).map(s => `<option value="${s.id}">${s.roll} — ${esc(s.name)} (${clsName(s.classId)}-${s.section})</option>`).join('')}</select>`)}
    <div class="form-grid">
      ${field('Type', `<select name="type"><option>Appreciation</option><option>Concern</option></select>`)}
      ${field('Date', `<input type="date" name="date" value="${todayStr()}">`)}
    </div>
    ${field('Staff Note (internal)', `<input name="note" required placeholder="What happened?">`)}
    ${field('Message to Parents', `<input name="parentMsg" placeholder="The version the family will see">`)}
    <label style="display:flex;gap:8px;align-items:center;margin-top:14px"><input type="checkbox" name="shared" checked style="width:auto"> Share with parents</label>
    ${formActions('Save Entry')}</form>`);
}
function saveBehaviour(e) { e.preventDefault(); const f = new FormData(e.target); DB.behaviour.push({ id: uid('bh'), studentId: f.get('studentId'), date: f.get('date'), type: f.get('type'), note: f.get('note'), parentMsg: f.get('parentMsg'), shared: !!f.get('shared'), by: (currentUser() || {}).name || '' }); save(); closeModal(); renderBehaviour(); toast('Behaviour entry saved'); }
function delBehaviour(id) { DB.behaviour = DB.behaviour.filter(b => b.id !== id); save(); renderBehaviour(); }

/* ---------- announcements ---------- */
function renderAnnounce() {
  $('#page').innerHTML = `
    <div class="toolbar"><span class="mut">Announcements reach parents and staff in the app (WhatsApp/SMS in the full version).</span><span class="sp"></span>
    <button class="btn btn-primary" onclick="announceForm()">＋ New Announcement</button></div>
    ${DB.announcements.slice().reverse().map(a => `<div class="panel"><div style="display:flex;gap:10px;align-items:center"><h3 style="margin:0">📣 ${esc(a.title)}</h3><span class="pill blue">${esc(a.target)}</span><span class="sp" style="flex:1"></span><span class="small mut">${a.date}${a.by ? ' · by ' + esc(a.by) : ''}</span><button class="btn btn-sm btn-danger" onclick="confirmBox('Delete this announcement?',()=>delAnnounce('${a.id}'))">✕</button></div><p style="margin-top:8px">${esc(a.body)}</p></div>`).join('') || '<div class="panel empty">No announcements yet</div>'}`;
}
function announceForm() {
  openModal('New Announcement', `<form id="modalForm" onsubmit="saveAnnounce(event)">
    ${field('Title *', `<input name="title" required placeholder="e.g. School closed on Friday">`)}
    ${field('Message *', `<textarea name="body" rows="4" required></textarea>`)}
    ${field('Send To', `<select name="target"><option>All</option><option>Parents</option><option>Teachers</option><option>Staff</option></select>`)}
    ${formActions('Send Announcement')}</form>`);
}
function saveAnnounce(e) { e.preventDefault(); const f = new FormData(e.target); DB.announcements.push({ id: uid('an'), date: todayStr(), title: f.get('title'), body: f.get('body'), target: f.get('target'), by: (currentUser() || {}).name || '' }); save(); closeModal(); renderAnnounce(); toast('Announcement sent'); }
function delAnnounce(id) { DB.announcements = DB.announcements.filter(a => a.id !== id); save(); renderAnnounce(); }

/* ---------- timetable ---------- */
let ttSel = { classKey: null };
function renderTimetable() {
  if (!ttSel.classKey) ttSel.classKey = DB.classes[7].id + '_A';
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const tt = DB.timetable[ttSel.classKey] || {};
  const periods = Math.max(6, ...days.map(d => (tt[d] || []).length));
  $('#page').innerHTML = `
    <div class="toolbar">
      <select onchange="ttSel.classKey=this.value;renderTimetable()">${DB.classes.flatMap(c => ['A', 'B'].map(sec => `<option value="${c.id}_${sec}" ${ttSel.classKey === c.id + '_' + sec ? 'selected' : ''}>${c.name} — Section ${sec}</option>`)).join('')}</select>
      <span class="sp"></span><span class="small mut">Click Edit, type subjects separated by commas per day.</span>
      <button class="btn btn-primary" onclick="ttForm()">Edit Timetable</button></div>
    <div class="panel"><table><tr><th>Day</th>${Array.from({ length: periods }, (_, i) => `<th>Period ${i + 1}</th>`).join('')}</tr>
    ${days.map(d => `<tr><td><b>${{ Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday' }[d]}</b></td>${Array.from({ length: periods }, (_, i) => `<td>${esc((tt[d] || [])[i] || '—')}</td>`).join('')}</tr>`).join('')}
    </table></div>`;
}
function ttForm() {
  const tt = DB.timetable[ttSel.classKey] || {};
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  openModal('Edit Timetable — ' + ttSel.classKey.replace('_', ' '), `<form id="modalForm" onsubmit="saveTT(event)">
    ${days.map(d => field(d, `<input name="${d}" value="${esc((tt[d] || []).join(', '))}" placeholder="English, Math, Science, Urdu, Islamiyat, Computer">`)).join('')}
    ${formActions('Save Timetable')}</form>`);
}
function saveTT(e) {
  e.preventDefault(); const f = new FormData(e.target);
  DB.timetable[ttSel.classKey] = {};
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].forEach(d => DB.timetable[ttSel.classKey][d] = String(f.get(d) || '').split(',').map(x => x.trim()).filter(Boolean));
  save(); closeModal(); renderTimetable(); toast('Timetable saved');
}

/* ---------- settings & data ---------- */
function renderSettings() {
  $('#page').innerHTML = `
    <div class="grid2">
      <div class="panel"><h3>🏫 School Profile</h3>
        <form onsubmit="saveSchool(event)">
          ${field('School Name', `<input id="sc_name" value="${esc(DB.school.name)}">`)}
          ${field('City', `<input id="sc_city" value="${esc(DB.school.city)}">`)}
          ${field('Phone', `<input id="sc_phone" value="${esc(DB.school.phone)}">`)}
          ${field('Email', `<input id="sc_email" value="${esc(DB.school.email)}">`)}
          ${field('Address', `<input id="sc_addr" value="${esc(DB.school.address)}">`)}
          <div class="form-actions"><button class="btn btn-primary" type="submit">Save Profile</button></div>
        </form></div>
      <div class="panel"><h3>🎓 Classes & Monthly Fees</h3>
        <table><tr><th>Class</th><th class="right">Monthly Fee</th><th>Students</th></tr>
        ${DB.classes.map(c => `<tr><td>${c.name}</td><td class="right"><input style="width:110px;padding:5px 7px" type="number" min="0" value="${c.fee}" onchange="setFee('${c.id}',this.value)"></td><td>${DB.students.filter(s => s.classId === c.id).length}</td></tr>`).join('')}
        </table>
        <h3 style="margin-top:22px">📚 Subjects</h3>
        <p>${DB.subjects.map(s => `<span class="pill blue" style="margin:2px">${s}</span>`).join('')}</p>
        <form onsubmit="addSubject(event)" style="display:flex;gap:8px;margin-top:10px"><input id="newSubject" placeholder="Add subject (e.g. Pakistan Studies)" required><button class="btn btn-primary">Add</button></form>
      </div>
    </div>
    <div class="panel"><h3>💾 Data — Backup, Restore, Export</h3>
      <p class="mut" style="margin-bottom:14px">All data is stored in this browser. Download a backup regularly. CSV exports work in Excel.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn" onclick="downloadBackup()">⬇ Download Backup (JSON)</button>
        <label class="btn" style="cursor:pointer">⬆ Restore Backup <input type="file" accept=".json" style="display:none" onchange="restoreBackup(this)"></label>
        <button class="btn" onclick="exportCSV('students')">Students CSV</button>
        <button class="btn" onclick="exportCSV('challans')">Fees CSV</button>
        <button class="btn" onclick="exportCSV('ledger')">Ledger CSV</button>
        <button class="btn btn-danger" onclick="confirmBox('Reset ALL data back to the original demo school? This cannot be undone.',()=>{localStorage.removeItem(DB_KEY);location.reload();})">Reset Demo Data</button>
      </div></div>
    ${usersPanelHTML()}`;
}
function saveSchool(e) { e.preventDefault(); DB.school = { name: $('#sc_name').value, city: $('#sc_city').value, phone: $('#sc_phone').value, email: $('#sc_email').value, address: $('#sc_addr').value }; save(); const cu = currentUser(); $('#sideSchool').textContent = DB.school.name + ' — ' + DB.school.city + (cu ? ' · ' + cu.name + ' (' + cu.role + ')' : ''); const av = document.querySelector('.avatar'); if (av && cu) av.textContent = cu.name.trim().charAt(0).toUpperCase(); toast('School profile saved'); }
function setFee(id, v) { DB.classes.find(c => c.id === id).fee = Math.max(0, +v || 0); save(); toast('Fee updated'); }
function addSubject(e) { e.preventDefault(); const v = $('#newSubject').value.trim(); if (v && !DB.subjects.includes(v)) { DB.subjects.push(v); save(); renderSettings(); toast('Subject added'); } }
function downloadBackup() { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' })); a.download = 'smartschool-backup-' + todayStr() + '.json'; a.click(); }
function restoreBackup(input) {
  const file = input.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = () => { try { const data = JSON.parse(r.result); if (!data.students || !data.classes) throw new Error('bad'); DB = data; save(); toast('Backup restored'); go('dashboard'); } catch (e) { toast('That file is not a valid SmartSchool backup'); } };
  r.readAsText(file);
}


/* ---------- users & roles (settings) ---------- */
function usersPanelHTML() {
  const cu = currentUser();
  return `<div class="panel"><h3>👥 Users & Roles — everyone has their own login and their own records</h3>
    <p class="mut" style="margin-bottom:12px">Each user signs in with their own email & password. Entries they create (announcements, behaviour, fee collections, ledger) are recorded under their name. Admin manages accounts here.</p>
    <table><tr><th>Name</th><th>Email (login)</th><th>Role</th><th></th></tr>
    ${DB.users.map(u => `<tr><td><b>${esc(u.name)}</b>${cu && u.id === cu.id ? ' <span class="pill green">You</span>' : ''}</td><td>${esc(u.email)}</td><td><span class="pill blue">${esc(u.role)}</span></td>
    <td class="right">${cu && u.id === cu.id ? '' : `<button class="btn btn-sm btn-danger" onclick="confirmBox('Delete user ${esc(u.name)}?',()=>delUser('${u.id}'))">Delete</button>`}</td></tr>`).join('')}
    </table>
    <form onsubmit="addUser(event)" style="margin-top:16px">
      <div class="form-grid">
        ${field('Full Name', `<input id="nu_name" required placeholder="e.g. Muhammad Ilyas">`)}
        ${field('Email (login)', `<input id="nu_email" type="email" required placeholder="name@school.pk">`)}
        ${field('Password', `<input id="nu_pass" required placeholder="Set a password">`)}
        ${field('Role', `<select id="nu_role"><option>Admin</option><option>Teacher</option><option>Accountant</option><option>Staff</option></select>`)}
      </div>
      <div class="form-actions"><button class="btn btn-primary" type="submit">＋ Add User</button></div>
    </form></div>`;
}
function addUser(e) {
  e.preventDefault();
  const email = $('#nu_email').value.trim().toLowerCase();
  if (DB.users.some(u => u.email.toLowerCase() === email)) { toast('A user with this email already exists'); return; }
  DB.users.push({ id: uid('u'), name: $('#nu_name').value.trim(), email, pass: $('#nu_pass').value, role: $('#nu_role').value });
  save(); renderSettings(); toast('User added — they can now sign in with their own login');
}
function delUser(id) { DB.users = DB.users.filter(u => u.id !== id); save(); renderSettings(); toast('User deleted'); }

/* ---------- CSV export ---------- */
function exportCSV(kind) {
  let rows = [];
  if (kind === 'students') { rows = [['Roll', 'Name', 'Father', 'Class', 'Section', 'Gender', 'DOB', 'Parent Phone', 'Status']].concat(DB.students.map(s => [s.roll, s.name, s.father, clsName(s.classId), s.section, s.gender, s.dob, s.phone, s.status])); }
  if (kind === 'staff') { rows = [['Name', 'Role', 'Qualification', 'Phone', 'Email', 'Salary']].concat(DB.staff.map(s => [s.name, s.role, s.qual, s.phone, s.email, s.salary])); }
  if (kind === 'challans') { rows = [['Challan', 'Month', 'Student', 'Class', 'Amount', 'Discount', 'Status', 'Method', 'Paid Date']].concat(DB.challans.map(c => { const s = stuById(c.studentId); return [c.no, c.month, s ? s.name : '', s ? clsName(s.classId) : '', c.amount, c.discount || 0, c.status, c.method, c.paidDate]; })); }
  if (kind === 'ledger') { rows = [['Date', 'Type', 'Category', 'Description', 'Amount']].concat(DB.ledger.map(l => [l.date, l.type, l.cat, l.desc, l.amount])); }
  const csv = rows.map(r => r.map(x => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' }));
  a.download = 'smartschool-' + kind + '-' + todayStr() + '.csv'; a.click();
  toast('CSV downloaded');
}

/* ---------- init ---------- */
load();
if (localStorage.getItem(SESSION_KEY)) showApp();
