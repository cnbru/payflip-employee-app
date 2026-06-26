// ── Payflip HR Admin — Desktop Prototype ──────────────────────────────────

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ── Design tokens ──────────────────────────────────────────────────────────
const P = {
  ink:         '#0f0d28',
  inkSoft:     '#50545e',
  inkFaint:    '#9ca3af',
  border:      '#eaeaeb',
  borderStrong:'#d9dadd',
  bg:          '#f7f7f8',
  white:       '#ffffff',
};

const StatusMeta = {
  pending:  { dot: '#f59e0b', label: 'Requested' },
  approved: { dot: '#22c55e', label: 'Approved'  },
  rejected: { dot: '#ef4444', label: 'Declined'  },
};

const LEAVE_COLORS = {
  'Time off':        '#7eb5fa',
  'Sick leave':      '#f4a0c5',
  'Special leave':   '#a8b4c0',
  'Funeral leave':   '#a8b4c0',
  'Paternity leave': '#bbaef5',
  'Maternity leave': '#bbaef5',
  'Paid absence':    '#6dd5e0',
  'Unpaid absence':  '#c5cfd8',
};

const ALL_LEAVE_TYPES = [
  'Time off', 'Sick leave', 'Special leave',
  'Paternity leave', 'Maternity leave', 'Paid absence', 'Unpaid absence',
];

const ADMIN_ONLY_TYPES = new Set(['Paternity leave', 'Maternity leave', 'Paid absence', 'Unpaid absence']);

const ATTACHMENT_RULES = {
  'Sick leave':      { label: 'Medical certificate', note: 'Required for absences of 2 or more consecutive days' },
  'Special leave':   { label: 'Supporting document', note: 'Marriage/birth certificate or official event proof' },
  'Funeral leave':   { label: 'Death certificate', note: 'Required to process bereavement leave' },
  'Paternity leave': { label: 'Birth certificate', note: 'Required to activate paternity leave entitlement' },
  'Maternity leave': { label: 'Medical certificate', note: 'Required to activate maternity leave entitlement' },
};

// ── Lucide icon helper ─────────────────────────────────────────────────────
function Icon({ name, size = 16, color = P.inkSoft, strokeWidth = 1.75, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.lucide) return;
    ref.current.innerHTML = '';
    const el = document.createElement('i');
    el.setAttribute('data-lucide', name);
    ref.current.appendChild(el);
    lucide.createIcons({ elements: [el] });
    const svg = ref.current.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.setAttribute('stroke', color);
      svg.setAttribute('stroke-width', strokeWidth);
      svg.style.display = 'block';
      svg.style.flexShrink = '0';
    }
  }, [name, size, color, strokeWidth]);
  return <span ref={ref} style={{ display: 'inline-flex', alignItems: 'center', ...style }} />;
}

// ── Belgian calendar constants (ported from employee app) ──────────────────
const BELGIAN_HOLIDAYS_2026 = [
  '2026-01-01','2026-04-06','2026-05-01','2026-05-14',
  '2026-05-25','2026-07-21','2026-08-15','2026-11-01',
  '2026-11-11','2026-12-25',
];
const _holidaySet = new Set(BELGIAN_HOLIDAYS_2026);
const BELGIAN_HOLIDAY_NAMES = {
  '2026-01-01': "New Year's Day",      '2026-04-06': 'Easter Monday',
  '2026-05-01': 'Labour Day',          '2026-05-14': 'Ascension Day',
  '2026-05-25': 'Whit Monday',         '2026-07-21': 'Belgian National Day',
  '2026-08-15': 'Assumption of Mary',  '2026-11-01': "All Saints' Day",
  '2026-11-11': 'Armistice Day',       '2026-12-25': 'Christmas Day',
};
const COLLECTIVE_HOLIDAYS = [
  '2026-07-20','2026-07-22','2026-07-23','2026-07-24',
  '2026-07-27','2026-07-28','2026-07-29','2026-07-30','2026-07-31',
  '2026-08-03','2026-08-04','2026-08-05','2026-08-06','2026-08-07',
];
const _collectiveSet = new Set(COLLECTIVE_HOLIDAYS);
const HOLIDAY_ICON = {
  "New Year's Day":    { emoji: '🎆' },
  'Easter Monday':     { emoji: '🐣' },
  'Labour Day':        { lucide: 'Hammer' },
  'Ascension Day':     { lucide: 'Church' },
  'Whit Monday':       { lucide: 'Church' },
  'Belgian National Day': { emoji: '🇧🇪' },
  'Assumption of Mary':   { lucide: 'Church' },
  "All Saints' Day":   { emoji: '🕯️' },
  'Armistice Day':     { lucide: 'Shield' },
  'Christmas Day':     { emoji: '🎄' },
};

// ── Employee data generation ───────────────────────────────────────────────
const FIRST_NAMES = ['David','Sarah','Thomas','Emma','Julie','Nicolas','Lotte','Pieter','Elise','Bram','Marie','Jonas','Laura','Wout','Charlotte','Stijn','Noor','Kevin','Ines','Thibault','Sofie','Mathias','Leen','Dieter','Jana','Ruben','Hanne','Joris','Fien','Sander'];
const LAST_NAMES = ['Laurent','Dubois','Lejeune','Claes','Martens','Peeters','Janssens','Wouters','De Smedt','Verhoeven','Maes','Willems','Goossens','De Backer','Van Damme','Hendrickx','Mertens','Stevens','Lambert','Van den Berg'];
const DEPARTMENTS = ['Engineering','Marketing','Sales','Design','Finance','Operations'];
const AVATAR_COLORS = ['#bfdbfe','#ddd6fe','#fde68a','#a7f3d0','#fecdd3','#fed7aa','#c7d2fe','#fca5a5','#d9f99d','#99f6e4'];

function generateEmployees() {
  const emps = {};
  const used = new Set();
  for (let i = 0; i < 25; i++) {
    let fn, ln, full;
    do {
      fn = FIRST_NAMES[i % FIRST_NAMES.length];
      ln = LAST_NAMES[(i * 7 + i) % LAST_NAMES.length];
      full = fn + ' ' + ln;
    } while (used.has(full) && (ln = LAST_NAMES[(i * 3 + 5) % LAST_NAMES.length], full = fn + ' ' + ln, false));
    used.add(full);
    const id = (fn + '-' + ln).toLowerCase().replace(/\s+/g, '-');
    emps[id] = {
      name: full,
      initials: fn[0] + ln[0],
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      entitlement: 20 + (i % 4) * 3,
      department: DEPARTMENTS[i % DEPARTMENTS.length],
    };
  }
  // Ensure 'david' key exists for localStorage bridge
  if (!emps['david']) {
    emps['david'] = emps[Object.keys(emps)[0]];
    delete emps[Object.keys(emps)[0]];
    emps['david'].name = 'David Laurent';
    emps['david'].initials = 'DL';
  }
  return emps;
}

const EMPLOYEES = generateEmployees();

const generatedRequests = [
  { id: 'gen-1', employee: 'david', type: 'Time off', startDate: 'Mon 3 Aug', endDate: 'Fri 7 Aug', days: 5, status: 'pending', submittedAt: '18 Jun', note: 'Summer holiday' },
  { id: 'gen-2', employee: 'emma-martens', type: 'Time off', startDate: 'Mon 14 Jul', endDate: 'Fri 18 Jul', days: 5, status: 'pending', submittedAt: '20 Jun', note: '' },
  { id: 'gen-3', employee: 'lotte-de-smedt', type: 'Sick leave', startDate: 'Thu 26 Jun', endDate: 'Thu 26 Jun', days: 1, status: 'pending', submittedAt: '26 Jun', note: '' },
  { id: 'gen-4', employee: 'mathias-de-smedt', type: 'Time off', startDate: 'Mon 21 Jul', endDate: 'Mon 21 Jul', days: 1, status: 'approved', submittedAt: '10 Jun', note: '' },
  { id: 'gen-5', employee: 'stijn-laurent', type: 'Special leave', startDate: 'Fri 4 Jul', endDate: 'Fri 4 Jul', days: 1, status: 'approved', submittedAt: '25 Jun', note: 'Wedding' },
];

// ── localStorage bridge ────────────────────────────────────────────────────
const LS_KEY = 'payflip_hr_requests';
function readLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function writeLS(reqs) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(reqs.filter(r => r.employee === 'david' && r.id.startsWith('req-')))); } catch {}
}
function mergeRequests(seed, live) {
  const merged = [...seed];
  for (const r of live) {
    if (!merged.find(m => m.id === r.id)) merged.unshift(r);
  }
  return merged;
}

// ── Date helpers ───────────────────────────────────────────────────────────
const _MONTHS = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
function parseDisplayDate(str) {
  const m = str?.match(/(\d+)\s+(\w+)/);
  if (!m || !_MONTHS.hasOwnProperty(m[2])) return null;
  return new Date(2026, _MONTHS[m[2]], +m[1]);
}
function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function weekStart(d) {
  const day = d.getDay() || 7;
  const out = new Date(d); out.setDate(d.getDate() - day + 1); out.setHours(0,0,0,0); return out;
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function startOfMonth(d) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return weekStart(first);
}
function daysInMonthView(d) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const last  = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const ws = weekStart(first);
  const lastDay = last.getDay() || 7;
  const we = addDays(last, 7 - lastDay);
  const count = Math.round((we - ws) / 86400000);
  return count;
}

const DAY_LABELS = ['MO','TU','WE','TH','FR','SA','SU'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ employeeId, size = 28 }) {
  const emp = EMPLOYEES[employeeId] || { initials: '?', color: '#e5e7eb' };
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: emp.color,
      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 700,
      fontSize: size * 0.34, color: P.ink, letterSpacing: '0.01em',
    }}>{emp.initials}</div>
  );
}

// ── Status dot ─────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const m = StatusMeta[status] || StatusMeta.pending;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.ink }}>{m.label}</span>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function SidebarItem({ label, isActive, onClick, badgeDot, chevron, chevronOpen }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '7px 10px', borderRadius: 7,
      border: 'none', background: isActive ? P.bg : 'transparent',
      cursor: 'pointer', width: '100%', textAlign: 'left',
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: isActive ? 700 : 500, fontSize: 13, color: isActive ? P.ink : P.inkSoft, flex: 1 }}>
        {label}
      </span>
      {badgeDot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e84d8a', flexShrink: 0 }} />}
      {chevron && <Icon name={chevronOpen ? 'ChevronUp' : 'ChevronDown'} size={12} color={P.inkFaint} />}
    </button>
  );
}

function SidebarSub({ items, active, onNav }) {
  return (
    <div style={{ paddingLeft: 10, display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 4 }}>
      {items.map(({ id, label, badge }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => onNav(id)} style={{
            display: 'flex', alignItems: 'center', gap: 0,
            padding: '6px 10px', borderRadius: 6,
            border: 'none', background: isActive ? P.bg : 'transparent',
            cursor: 'pointer', width: '100%', textAlign: 'left',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: isActive ? 700 : 400, fontSize: 13, color: isActive ? P.ink : P.inkSoft, flex: 1 }}>{label}</span>
            {badge > 0 && (
              <span style={{ minWidth: 17, height: 17, borderRadius: 9, padding: '0 4px', background: P.ink, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Sidebar({ active, onNav, pendingCount }) {
  const [companyOpen, setCompanyOpen] = useState(false);
  const [payrollOpen, setPayrollOpen] = useState(false);
  const teamMgmtOpen = active === 'team-absences' || active === 'requests' || active === 'employees' || active.startsWith('employee-detail:');

  return (
    <div style={{
      width: 216, flexShrink: 0, background: P.white,
      borderRight: `1px solid ${P.border}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Entity header */}
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: P.inkFaint }}>Entity view for</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#6366f1', letterSpacing: '-0.01em' }}>Payflip</div>
        </div>
        <Icon name="ChevronsUpDown" size={14} color={P.inkFaint} />
      </div>

      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 1, overflow: 'auto' }}>
        <SidebarItem label="Home" onClick={() => onNav('home')} />
        <SidebarItem label="To do" onClick={() => {}} badgeDot chevron />

        <SidebarItem label="Company" isActive={companyOpen} onClick={() => setCompanyOpen(o => !o)} chevron chevronOpen={companyOpen} />
        {companyOpen && <SidebarSub active={active} onNav={onNav} items={[
          { id: 'company-budgets', label: 'Budgets' },
          { id: 'company-benefits', label: 'Benefits' },
          { id: 'company-details', label: 'Company details' },
          { id: 'company-choices', label: 'Choices overview' },
          { id: 'company-integrations', label: 'Integrations' },
          { id: 'company-documents', label: 'Documents' },
          { id: 'company-reporting', label: 'Reporting' },
        ]} />}

        <SidebarItem label="Payroll" isActive={payrollOpen} onClick={() => setPayrollOpen(o => !o)} chevron chevronOpen={payrollOpen} />
        {payrollOpen && <SidebarSub active={active} onNav={onNav} items={[
          { id: 'payroll-overview', label: 'Overview' },
          { id: 'payroll-settings', label: 'Settings' },
          { id: 'payroll-wagecodes', label: 'Wage codes' },
        ]} />}

        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '12px 10px 4px' }}>Team management</div>
        <SidebarSub active={active} onNav={onNav} items={[
          { id: 'employees', label: 'Employees' },
          { id: 'team-absences', label: 'Team absences' },
          { id: 'requests', label: 'Time off requests', badge: pendingCount },
        ]} />

        <div style={{ height: 1, background: P.border, margin: '6px 0' }} />

        <SidebarItem label="Billing" onClick={() => {}} />
      </nav>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${P.border}`, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <SidebarItem label="English" chevron onClick={() => {}} />
        <SidebarItem label="Logout" onClick={() => {}} />
      </div>
    </div>
  );
}

// ── Action menu (···) ──────────────────────────────────────────────────────
function ActionMenu({ req, onApprove, onDecline, onViewDetails, onEdit, onCancel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const items = [
    req?.status === 'pending' && { icon: 'CheckCircle', label: 'Approve', fn: onApprove, color: '#166534' },
    req?.status === 'pending' && { icon: 'XCircle', label: 'Decline', fn: onDecline, color: '#b91c1c' },
    onViewDetails && { icon: 'Eye', label: 'View details', fn: onViewDetails, color: P.ink },
    onEdit && { icon: 'Pencil', label: 'Edit', fn: onEdit, color: P.ink },
    req?.status === 'approved' && { icon: 'Trash2', label: 'Cancel absence', fn: onCancel, color: '#b91c1c' },
  ].filter(Boolean);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }} style={{
        width: 30, height: 30, borderRadius: 6,
        border: `1px solid ${open ? P.ink : P.border}`,
        background: open ? '#eff3ff' : 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="Ellipsis" size={14} color={open ? P.ink : P.inkSoft} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 36, zIndex: 50,
          background: P.white, border: `1px solid ${P.border}`, borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.10)', width: 164, overflow: 'hidden',
        }}>
          {items.map(({ icon, label, fn, color }) => (
            <button key={label} onClick={(e) => { e.stopPropagation(); setOpen(false); fn(); }} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              width: '100%', padding: '9px 12px', border: 'none', background: 'transparent',
              cursor: 'pointer', textAlign: 'left',
            }}
            onMouseEnter={e => e.currentTarget.style.background = P.bg}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Icon name={icon} size={14} color={color} strokeWidth={1.75} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: label === 'Cancel absence' ? '#b91c1c' : P.ink }}>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reason modal (decline / cancel) ───────────────────────────────────────
function ReasonModal({ title, description, confirmLabel, confirmColor = '#b91c1c', onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(15,13,40,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: P.white, borderRadius: 14, width: 420,
        boxShadow: '0 8px 40px rgba(15,13,40,0.2)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${P.border}` }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>{title}</span>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <Icon name="X" size={18} color={P.inkSoft} />
          </button>
        </div>
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {description && (
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, lineHeight: 1.5 }}>{description}</p>
          )}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: P.inkSoft, marginBottom: 5 }}>
              Reason <span style={{ fontWeight: 400, color: P.inkFaint }}>(required)</span>
            </label>
            <textarea
              autoFocus
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Explain why this absence is being declined or cancelled…"
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 7,
                border: `1px solid ${reason.trim() ? P.border : P.border}`,
                fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink,
                outline: 'none', resize: 'none', lineHeight: 1.5,
              }}
            />
          </div>
        </div>
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 18px', borderRadius: 8, border: `1px solid ${P.border}`, background: 'transparent',
            color: P.ink, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
          }}>Back</button>
          <button
            disabled={!reason.trim()}
            onClick={() => { onConfirm(reason.trim()); onClose(); }}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: reason.trim() ? confirmColor : P.border,
              color: reason.trim() ? '#fff' : P.inkFaint,
              cursor: reason.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
            }}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Detail modal ───────────────────────────────────────────────────────────
function DetailModal({ req, requests, onClose, onApprove, onDecline, onCancel }) {
  const emp = EMPLOYEES[req.employee] || { name: req.employee, entitlement: 25, department: '' };
  const usedDays = requests
    .filter(r => r.employee === req.employee && r.id !== req.id && (r.status === 'approved' || r.status === 'pending'))
    .reduce((s, r) => s + r.days, 0);
  const remaining = emp.entitlement - usedDays - req.days;
  const isPending = req.status === 'pending';
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(15,13,40,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: P.white, borderRadius: 14, width: 520,
        boxShadow: '0 8px 40px rgba(15,13,40,0.18)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${P.border}` }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>Time off details</span>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <Icon name="X" size={18} color={P.inkSoft} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '6px 0' }}>
          {[
            { label: 'Status', value: <StatusDot status={req.status} /> },
            { label: 'Type', value: req.type },
            { label: 'When', value: <span>{req.startDate === req.endDate ? req.startDate : `${req.startDate} – ${req.endDate}`}<br /><span style={{ color: P.inkSoft, fontSize: 12 }}>Total of {req.days} {req.days === 1 ? 'day' : 'days'}</span></span> },
            { label: 'Notes', value: req.note || '—' },
            { label: 'Requested on', value: req.submittedAt },
            { label: 'Requested by', value: <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>{emp.name}</span><span style={{ color: P.inkFaint, fontSize: 12 }}>{emp.department}</span></div> },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', padding: '11px 22px', borderBottom: `1px solid ${P.border}`, alignItems: 'start', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, paddingTop: 1 }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink }}>{value}</span>
            </div>
          ))}
          <div style={{ margin: '14px 22px', background: P.bg, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: P.ink, marginBottom: 10 }}>Balance summary</div>
            {[
              { label: 'Annual entitlement', value: `${emp.entitlement} days` },
              { label: 'Used & booked', value: `${usedDays} ${usedDays === 1 ? 'day' : 'days'}` },
              { label: 'Requesting', value: `${req.days} ${req.days === 1 ? 'day' : 'days'}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${P.border}` }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0 0' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: P.ink }}>Remaining after request</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: remaining < 0 ? '#b91c1c' : '#166534' }}>
                {remaining} {Math.abs(remaining) === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>
        </div>
        {(isPending || req.status === 'approved') && (
          <div style={{ padding: '14px 22px', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            {isPending && <>
              <button onClick={() => { onDecline(req.id); onClose(); }} style={{
                padding: '8px 20px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fef2f2',
                color: '#b91c1c', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
              }}>Decline</button>
              <button onClick={() => { onApprove(req.id); onClose(); }} style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', background: P.ink, color: '#fff',
                cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
              }}>Approve</button>
            </>}
            {req.status === 'approved' && (
              <button onClick={() => { onCancel(req.id); onClose(); }} style={{
                padding: '8px 20px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fef2f2',
                color: '#b91c1c', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
              }}>Cancel absence</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Select with chevron ────────────────────────────────────────────────────
function SelectField({ value, onChange, children, style }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={onChange} style={{ ...style, appearance: 'none', paddingRight: 30 }}>
        {children}
      </select>
      <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  );
}

// ── Inline calendar for date range picking ────────────────────────────────
function ModalCalendar({ startDate, endDate, focusedField, onDateTap }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const initial = startDate || today;
  const [month, setMonth] = useState(initial.getMonth());
  const [year, setYear]   = useState(initial.getFullYear());

  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const first = new Date(year, month, 1);
  let startCol = first.getDay() - 1;
  if (startCol < 0) startCol = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const sameDay = (a, b) => a && b && isoDate(a) === isoDate(b);
  const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;
  const isHoliday = (d) => _holidaySet.has(isoDate(d));
  const isCollective = (d) => _collectiveSet.has(isoDate(d));
  const isDisabled = (d) => isWeekend(d) || isHoliday(d) || isCollective(d);
  const isInRange = (d) => startDate && endDate && d > startDate && d < endDate;
  const isStart = (d) => sameDay(d, startDate);
  const isEnd = (d) => sameDay(d, endDate);
  const isToday = (d) => sameDay(d, today);

  const prevMonth = () => { setMonth(m => m === 0 ? (setYear(y => y - 1), 11) : m - 1); };
  const nextMonth = () => { setMonth(m => m === 11 ? (setYear(y => y + 1), 0) : m + 1); };

  return (
    <div style={{ borderRadius: 8, border: `1px solid ${P.border}`, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <button onClick={prevMonth} style={{ width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: P.ink }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button onClick={nextMonth} style={{ width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {dayNames.map(dn => (
          <div key={dn} style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10, color: P.inkFaint, padding: '3px 0', textTransform: 'uppercase' }}>{dn}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const disabled = isDisabled(d);
          const selStart = isStart(d);
          const selEnd = isEnd(d);
          const sel = selStart || selEnd;
          const inRange = isInRange(d) && !sel;
          const hasRange = startDate && endDate && !sameDay(startDate, endDate);
          const rangeBg = '#eef1fb';

          let btnBg = 'transparent';
          let color = P.ink;
          let fontWeight = 500;
          if (sel) { btnBg = P.ink; color = '#fff'; fontWeight = 700; }
          else if (disabled) { color = '#c5c9d0'; }
          else if (inRange) { fontWeight = 600; }

          let wrapBg = 'transparent';
          if (inRange) wrapBg = rangeBg;
          else if (selStart && hasRange) wrapBg = `linear-gradient(to right, transparent 50%, ${rangeBg} 50%)`;
          else if (selEnd && hasRange) wrapBg = `linear-gradient(to left, transparent 50%, ${rangeBg} 50%)`;

          return (
            <div key={isoDate(d)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: wrapBg }}>
              <button onClick={() => !disabled && onDateTap(d)} style={{
                width: 32, height: 32, border: 'none', background: btnBg,
                borderRadius: sel ? '50%' : 6, cursor: disabled ? 'default' : 'pointer',
                fontFamily: 'var(--font-display)', fontWeight, fontSize: 12, color,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                boxShadow: isToday(d) && !sel ? `inset 0 0 0 1.5px ${P.ink}` : 'none',
              }}>
                {d.getDate()}
                {isHoliday(d) && !sel && (
                  <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: 2, background: '#e89a3c' }} />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Add / Edit time off modal ──────────────────────────────────────────────
function AddTimeOffModal({ existing, onClose, onSave }) {
  const isEdit = !!existing?.id;
  const lockEmployee = existing?._lockEmployee;
  const [empId, setEmpId]     = useState(existing?.employee || '');
  const [type, setType]       = useState(existing?.type || 'Time off');
  const [startDate, setStart] = useState(existing ? toISOInput(existing.startDate) : '');
  const [endDate, setEnd]     = useState(existing ? toISOInput(existing.endDate || existing.startDate) : '');
  const [note, setNote]       = useState(existing?.note || '');
  const [holidayName, setHolidayName] = useState('');
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('start');
  const [attachment, setAttachment] = useState(null);
  const [notifyEmployee, setNotifyEmployee] = useState(false);
  const [scope, setScope] = useState(lockEmployee ? 'one' : 'one'); // 'one' | 'collective'
  const allEmployees = scope === 'collective';

  useEffect(() => { setAttachment(null); setNotifyEmployee(false); }, [type]);

  const handleDateTap = (d) => {
    const iso = isoDate(d);
    if (focusedField === 'start') {
      setStart(iso);
      if (!endDate || iso > endDate) setEnd(iso);
      setFocusedField('end');
    } else {
      if (iso < startDate) {
        setStart(iso);
        setEnd(startDate);
      } else {
        setEnd(iso);
      }
      setFocusedField('start');
    }
  };

  function toISOInput(displayStr) {
    const d = parseDisplayDate(displayStr);
    return d ? isoDate(d) : '';
  }

  function countWeekdays(from, to) {
    let count = 0;
    for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) count++;
    }
    return count;
  }

  const startD = startDate ? new Date(startDate + 'T00:00:00') : null;
  const endD   = endDate   ? new Date(endDate   + 'T00:00:00') : startD;
  const days   = startD && endD && endD >= startD ? countWeekdays(startD, endD) : 0;

  const fmtDisplay = (d) => d ? d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '';

  const handleSave = () => {
    const errs = {};
    if (!allEmployees && !empId) errs.employee = 'Please select an employee';
    if (!startDate || days === 0) errs.dates = 'Please select a date range';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const base = {
      type,
      startDate: fmtDisplay(startD),
      endDate: fmtDisplay(endD),
      days,
      status: existing?.status || 'approved',
      submittedAt: existing?.submittedAt || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      note,
    };
    if (allEmployees) {
      Object.keys(EMPLOYEES).forEach((eid, i) => {
        onSave({ ...base, id: `manual-${Date.now()}-${i}`, employee: eid });
      });
    } else {
      onSave({ ...base, id: existing?.id || `manual-${Date.now()}`, employee: empId });
    }
    onClose();
  };

  const empList = Object.entries(EMPLOYEES).sort((a, b) => a[1].name.localeCompare(b[1].name));

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 7, border: `1px solid ${P.border}`,
    fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink, outline: 'none', background: P.white,
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(15,13,40,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: P.white, borderRadius: 14, width: 480,
        boxShadow: '0 8px 40px rgba(15,13,40,0.18)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${P.border}` }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>
            {isEdit ? 'Edit time off' : 'Add time off'}
          </span>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <Icon name="X" size={18} color={P.inkSoft} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Scope selector */}
          {!lockEmployee && !isEdit && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['one', 'One employee', 'User'], ['collective', 'Collective holiday', 'Users']].map(([val, label, icon]) => {
                const active = scope === val;
                return (
                  <button key={val} onClick={() => setScope(val)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${active ? '#6D17CF' : P.border}`,
                    background: active ? '#F1E7FD' : P.white,
                    transition: 'border-color 120ms, background 120ms',
                    position: 'relative',
                  }}>
                    {/* Radio dot */}
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      width: 14, height: 14, borderRadius: '50%',
                      border: `1.5px solid ${active ? '#6D17CF' : P.border}`,
                      background: active ? '#fff' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6D17CF' }} />}
                    </div>
                    <Icon name={icon} size={14} color={active ? '#6D17CF' : P.inkSoft} strokeWidth={2} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: P.ink }}>{label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Employee / Holiday name — same slot, same height, no jump */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: P.inkSoft, marginBottom: 5 }}>
              {scope === 'collective' ? 'Reason' : 'Employee'}
            </label>
            {scope === 'collective' ? (
              <input value={holidayName} onChange={e => setHolidayName(e.target.value)} placeholder="e.g. Belgian National Day" style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            ) : (lockEmployee || isEdit) ? (
              <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', background: '#f7f8f7', color: P.ink }}>
                {EMPLOYEES[empId]?.name || empId}
              </div>
            ) : (
              <SelectField value={empId} onChange={e => { setEmpId(e.target.value); setErrors(p => ({...p, employee: null})); }} style={{ ...inputStyle, borderColor: errors.employee ? '#dc2626' : P.border }}>
                <option value="">Select employee…</option>
                {empList.map(([id, emp]) => (
                  <option key={id} value={id}>{emp.name} — {emp.department}</option>
                ))}
              </SelectField>
            )}
            {errors.employee && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#dc2626', marginTop: 4 }}>{errors.employee}</div>}
          </div>

          {/* Leave type */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: P.inkSoft, marginBottom: 5 }}>Leave type</label>
            <SelectField value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {ALL_LEAVE_TYPES.map(t => (
                <option key={t} value={t}>{t}{ADMIN_ONLY_TYPES.has(t) ? ' (Admin)' : ''}</option>
              ))}
              {scope === 'collective' && <option value="Replacement">Replacement</option>}
            </SelectField>
          </div>

          {/* Date range pills */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={() => setFocusedField('start')} style={{
              ...inputStyle, cursor: 'pointer', textAlign: 'left',
              borderColor: focusedField === 'start' ? P.ink : P.border,
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={focusedField === 'start' ? P.ink : P.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10, color: P.inkFaint, marginBottom: 1 }}>From</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: startD ? P.ink : P.inkFaint }}>{startD ? fmtDisplay(startD) : 'Select date'}</div>
              </div>
            </button>
            <button onClick={() => setFocusedField('end')} style={{
              ...inputStyle, cursor: 'pointer', textAlign: 'left',
              borderColor: focusedField === 'end' ? P.ink : P.border,
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={focusedField === 'end' ? P.ink : P.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10, color: P.inkFaint, marginBottom: 1 }}>To</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: endD ? P.ink : P.inkFaint }}>{endD ? fmtDisplay(endD) : 'Select date'}</div>
              </div>
            </button>
          </div>

          {/* Inline calendar */}
          <ModalCalendar startDate={startD} endDate={endD} focusedField={focusedField} onDateTap={(d) => { handleDateTap(d); setErrors(p => ({...p, dates: null})); }} />
          {errors.dates && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#dc2626', marginTop: -8 }}>{errors.dates}</div>}

          {/* Duration preview */}
          {days > 0 && (
            <div style={{ background: P.bg, borderRadius: 7, padding: '8px 12px', fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="CalendarDays" size={13} color={P.inkSoft} />
              <span>{days} working {days === 1 ? 'day' : 'days'}</span>
              {startD && endD && startD.getTime() !== endD.getTime() && (
                <span style={{ color: P.inkFaint }}>· {fmtDisplay(startD)} – {fmtDisplay(endD)}</span>
              )}
            </div>
          )}

          {/* Note — always shown */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: P.inkSoft, marginBottom: 5 }}>Notes <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder={scope === 'collective' ? 'e.g. Replacement for Christmas Day which fell on a Sunday…' : 'Reason or additional context…'} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
          </div>

          {/* Document upload + notify toggle — non-blocking */}
          {(() => {
            const rule = ATTACHMENT_RULES[type];
            if (!rule) return null;
            if (type === 'Sick leave' && days <= 1) return null;
            return (
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: P.inkSoft, marginBottom: 3 }}>{rule.label}</label>
                <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-body)', fontSize: 11, color: P.inkFaint }}>{rule.note}</p>
                {attachment ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 7, border: `1px solid ${P.border}`, background: P.bg }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.inkSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 12, color: P.ink }}>{attachment}</span>
                    <button onClick={() => setAttachment(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 2, display: 'flex' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setAttachment(`${rule.label.toLowerCase().replace(/ /g, '_')}.pdf`)} style={{
                    width: '100%', padding: '11px 16px', borderRadius: 7,
                    border: `1.5px dashed ${P.border}`, background: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: P.inkSoft,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.inkSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Upload {rule.label}
                  </button>
                )}
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onClose} style={{
            padding: '8px 18px', borderRadius: 8, border: `1px solid ${P.border}`, background: 'transparent',
            color: P.ink, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
          }}>Cancel</button>
          <div style={{ flex: 1 }} />
          {(() => {
            const rule = ATTACHMENT_RULES[type];
            const show = rule && !(type === 'Sick leave' && days <= 1) && !attachment;
            if (!show) return null;
            return (
              <div onClick={() => setNotifyEmployee(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ width: 28, height: 16, borderRadius: 8, flexShrink: 0, background: notifyEmployee ? P.ink : '#d1d5db', position: 'relative', transition: 'background 150ms' }}>
                  <div style={{ position: 'absolute', top: 2, left: notifyEmployee ? 14 : 2, width: 12, height: 12, borderRadius: 6, background: '#fff', transition: 'left 150ms' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, whiteSpace: 'nowrap' }}>Request {rule.label.toLowerCase()}</span>
              </div>
            );
          })()}
          <button onClick={handleSave} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: P.ink, color: '#fff', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
          }}>{isEdit ? 'Save changes' : 'Add time off'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Table row ──────────────────────────────────────────────────────────────
const TH = ({ children, style }) => (
  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em', ...style }}>{children}</div>
);

function RequestRow({ req, requests, onApprove, onDecline, onDetail, onEdit, onCancel }) {
  const emp = EMPLOYEES[req.employee] || { name: req.employee, initials: '?', color: '#e5e7eb' };
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => onDetail(req)}
      style={{
        display: 'grid', gridTemplateColumns: '32px 1.8fr 1fr 0.9fr 1fr 1fr 0.7fr 0.9fr 44px',
        alignItems: 'center', gap: 12, padding: '0 20px', height: 52,
        borderBottom: `1px solid ${P.border}`, background: hover ? P.bg : P.white,
        cursor: 'pointer', transition: 'background 0.1s',
      }}>
      <input type="checkbox" onClick={e => e.stopPropagation()} style={{ cursor: 'pointer', accentColor: P.ink }} />
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</span>
      </div>
      <StatusDot status={req.status} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.ink }}>{req.type}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.ink }}>{req.days} {req.days === 1 ? 'day' : 'days'}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.ink }}>{req.startDate}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: req.startDate === req.endDate ? P.inkFaint : P.ink }}>
        {req.startDate === req.endDate ? '—' : req.endDate}
      </span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft }}>{req.submittedAt}</span>
      <div onClick={e => e.stopPropagation()}>
        <ActionMenu req={req} onApprove={() => onApprove(req.id)} onDecline={() => onDecline(req.id)} onViewDetails={() => onDetail(req)} onEdit={() => onEdit(req)} onCancel={() => onCancel(req.id)} />
      </div>
    </div>
  );
}

// ── Requests screen ────────────────────────────────────────────────────────
function RequestsScreen({ requests, onApprove, onDecline, onSave, onCancel }) {
  const [tab, setTab] = useState('pending');
  const [detail, setDetail] = useState(null);
  const [editReq, setEditReq] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const filtered = tab === 'pending' ? requests.filter(r => r.status === 'pending')
    : tab === 'approved' ? requests.filter(r => r.status === 'approved') : requests;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: '28px 28px 0', background: P.white, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Time off requests</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, margin: '4px 0 0' }}>Manage your team's time off</p>
          </div>
          <button onClick={() => setAddOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 20, border: 'none', background: P.ink, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>
            <Icon name="Plus" size={14} color="#fff" strokeWidth={2.5} /> Add time off
          </button>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {[['pending', 'All pending requests'], ['approved', 'Approved'], ['all', 'All requests']].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)} style={{
              padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: tab === val ? 700 : 500, fontSize: 13, color: tab === val ? P.ink : P.inkSoft,
              borderBottom: tab === val ? `2px solid ${P.ink}` : '2px solid transparent', marginBottom: -1,
            }}>{label}{val === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 24px', background: P.white, borderBottom: `1px solid ${P.border}`, display: 'flex', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${P.border}`, borderRadius: 20, padding: '6px 14px', background: P.white, width: 200 }}>
          <Icon name="Search" size={13} color={P.inkFaint} />
          <input placeholder="Search" style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink, width: '100%' }} />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 20, border: `1px solid ${P.border}`, background: P.white, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink }}>
          <Icon name="SlidersHorizontal" size={13} color={P.inkSoft} /> Filter
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', background: P.white }}>
        <div style={{ display: 'grid', gridTemplateColumns: '32px 1.8fr 1fr 0.9fr 1fr 1fr 0.7fr 0.9fr 44px', alignItems: 'center', gap: 12, padding: '0 20px', height: 38, borderBottom: `1px solid ${P.border}`, background: P.bg, position: 'sticky', top: 0 }}>
          <input type="checkbox" style={{ cursor: 'pointer', accentColor: P.ink }} />
          <TH>Requested by</TH><TH>Status</TH><TH>Leave type</TH><TH>Duration</TH><TH>Date from</TH><TH>Date to</TH><TH>Added on</TH><div />
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <Icon name="Inbox" size={32} color={P.border} style={{ marginBottom: 12 }} />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.inkFaint }}>No {tab === 'pending' ? 'pending ' : tab === 'approved' ? 'approved ' : ''}requests</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkFaint, marginTop: 4 }}>{tab === 'pending' ? 'New requests from your team will appear here.' : ''}</div>
          </div>
        ) : filtered.map(req => (
          <RequestRow key={req.id} req={req} requests={requests} onApprove={onApprove} onDecline={onDecline} onDetail={setDetail} onEdit={setEditReq} onCancel={onCancel} />
        ))}
        {filtered.length > 0 && (
          <div style={{ padding: '10px 20px', fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkFaint }}>{filtered.length} {filtered.length === 1 ? 'record' : 'records'}</div>
        )}
      </div>
      {detail && (
        <DetailModal req={detail} requests={requests} onClose={() => setDetail(null)}
          onApprove={(id) => { onApprove(id); setDetail(prev => prev && prev.id === id ? { ...prev, status: 'approved' } : prev); }}
          onDecline={(id) => onDecline(id)}
          onCancel={(id) => { onCancel(id); setDetail(null); }}
        />
      )}
      {(addOpen || editReq) && (
        <AddTimeOffModal
          existing={editReq || null}
          onClose={() => { setAddOpen(false); setEditReq(null); }}
          onSave={(req) => { onSave(req); setAddOpen(false); setEditReq(null); }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ── Team Absences Calendar ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function buildAbsenceMap(requests) {
  const map = {};
  for (const req of requests.filter(r => r.status === 'approved' || r.status === 'pending')) {
    const start = parseDisplayDate(req.startDate);
    const end   = parseDisplayDate(req.endDate) || start;
    if (!start) continue;
    if (!map[req.employee]) map[req.employee] = {};
    for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
      const iso = isoDate(d);
      if (!map[req.employee][iso]) {
        map[req.employee][iso] = { type: req.type, status: req.status, requestId: req.id };
      }
    }
  }
  return map;
}

// ── Month picker ───────────────────────────────────────────────────────────
function MonthPicker({ currentDate, onSelect, onClose }) {
  const [year, setYear] = useState(currentDate.getFullYear());
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return (
    <div ref={ref} style={{
      position: 'absolute', top: 48, left: 0, zIndex: 60,
      background: P.white, border: `1px solid ${P.border}`, borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '14px', width: 280,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => setYear(y => y - 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <Icon name="ChevronLeft" size={14} color={P.inkSoft} />
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: P.ink }}>{year}</span>
        <button onClick={() => setYear(y => y + 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <Icon name="ChevronRight" size={14} color={P.inkSoft} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
        {MONTH_NAMES.map((name, i) => {
          const isCurrent = year === currentDate.getFullYear() && i === currentDate.getMonth();
          return (
            <button key={i} onClick={() => { onSelect(new Date(year, i, 1)); onClose(); }}
              style={{
                padding: '7px 0', borderRadius: 6, border: 'none',
                background: isCurrent ? P.ink : 'transparent',
                color: isCurrent ? '#fff' : P.ink,
                cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 12,
              }}
              onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = P.bg; }}
              onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}>
              {name.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── View mode switcher ─────────────────────────────────────────────────────
function ViewSwitcher({ mode, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const labels = { month: 'Month', '2week': '2 Weeks', week: 'Week' };

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '5px 11px', border: `1px solid ${P.border}`, borderRadius: 7,
        background: P.ink, color: '#fff', cursor: 'pointer',
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
      }}>
        {labels[mode]}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 4px)',
          background: P.white, border: `1px solid ${P.border}`, borderRadius: 8,
          boxShadow: '0 4px 16px rgba(15,13,40,0.1)', zIndex: 100, minWidth: 120, overflow: 'hidden',
        }}>
          {Object.entries(labels).map(([val, label]) => (
            <button key={val} onClick={() => { onChange(val); setOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 12px', border: 'none', cursor: 'pointer',
              background: mode === val ? '#f4f5f7' : 'transparent',
              fontFamily: 'var(--font-display)', fontWeight: mode === val ? 700 : 500,
              fontSize: 13, color: P.ink,
            }}>{label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Filter toolbar ─────────────────────────────────────────────────────────
const LEAVE_FILTER_OPTS = [['all', 'All types'], ['Time off', 'Time off'], ['Sick leave', 'Sick leave'], ['Special leave', 'Special leave']];

function FilterToolbar({ searchText, onSearch, leaveFilter, onLeaveFilter }) {
  const [leaveOpen, setLeaveOpen] = useState(false);
  const leaveRef = useRef(null);
  useEffect(() => {
    if (!leaveOpen) return;
    const close = (e) => { if (leaveRef.current && !leaveRef.current.contains(e.target)) setLeaveOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [leaveOpen]);

  const activeLabel = LEAVE_FILTER_OPTS.find(([v]) => v === leaveFilter)?.[1] ?? 'All types';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: P.white, borderBottom: `1px solid ${P.border}` }}>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, border: `1px solid ${P.border}`, borderRadius: 7, padding: '5px 12px', width: 240 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={searchText} onChange={e => onSearch(e.target.value)} placeholder="Search employee" style={{
          border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 12, color: P.ink, width: '100%',
        }} />
      </div>

      {/* Leave type dropdown */}
      <div ref={leaveRef} style={{ position: 'relative' }}>
        <button onClick={() => setLeaveOpen(o => !o)} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 11px', borderRadius: 7, border: `1px solid ${P.border}`,
          background: P.ink, color: '#fff', cursor: 'pointer',
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
        }}>
          {activeLabel}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        {leaveOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
            background: P.white, border: `1px solid ${P.border}`, borderRadius: 8,
            boxShadow: '0 4px 16px rgba(15,13,40,0.10)', minWidth: 140, overflow: 'hidden',
          }}>
            {LEAVE_FILTER_OPTS.map(([val, label]) => (
              <button key={val} onClick={() => { onLeaveFilter(val); setLeaveOpen(false); }} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px', border: 'none', cursor: 'pointer',
                background: leaveFilter === val ? '#f4f5f7' : 'transparent',
                fontFamily: 'var(--font-display)', fontWeight: leaveFilter === val ? 700 : 500,
                fontSize: 13, color: P.ink,
              }}>{label}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Team absences screen ───────────────────────────────────────────────────
function TeamAbsencesScreen({ requests, pendingCount, onNav, onShowDetail, onSave }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const todayISO = isoDate(today);

  // State
  const [viewMode, setViewMode] = useState('month');
  const [refDate, setRefDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeDepts, setActiveDepts] = useState(() => new Set(DEPARTMENTS));
  const [leaveFilter, setLeaveFilter] = useState('all');
  const [expandedDepts, setExpandedDepts] = useState(() => new Set(DEPARTMENTS));
  const [tooltip, setTooltip] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [absencesOnly, setAbsencesOnly] = useState(false);
  const tooltipTimerRef = useRef(null);
  const tooltipReqIdRef = useRef(null);

  // Compute days for current view
  const days = useMemo(() => {
    if (viewMode === 'week') {
      const ws = weekStart(refDate);
      return Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    }
    if (viewMode === '2week') {
      const ws = weekStart(refDate);
      return Array.from({ length: 14 }, (_, i) => addDays(ws, i));
    }
    // month
    const first = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    const ws = weekStart(first);
    const last = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
    const lastDay = last.getDay() || 7;
    const endDate = addDays(last, 7 - lastDay);
    const count = Math.round((endDate - ws) / 86400000);
    return Array.from({ length: count }, (_, i) => addDays(ws, i));
  }, [viewMode, refDate]);

  const dayISOs = useMemo(() => days.map(isoDate), [days]);

  // Build enriched absence map
  const absenceMap = useMemo(() => buildAbsenceMap(requests), [requests]);

  // Month label
  const monthLabel = useMemo(() => {
    if (viewMode === 'month') return MONTH_NAMES[refDate.getMonth()] + ' ' + refDate.getFullYear();
    const s = days[0], e = days[days.length - 1];
    const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
    if (sameMonth) return `${s.getDate()} – ${e.getDate()} ${s.toLocaleDateString('en-GB', { month: 'short' })} ${s.getFullYear()}`;
    const sameYear = s.getFullYear() === e.getFullYear();
    return `${s.getDate()} ${s.toLocaleDateString('en-GB', { month: 'short' })}${sameYear ? '' : ' ' + s.getFullYear()} – ${e.getDate()} ${e.toLocaleDateString('en-GB', { month: 'short' })} ${e.getFullYear()}`;
  }, [viewMode, refDate, days]);

  // Navigation step
  const step = (dir) => {
    setRefDate(d => {
      if (viewMode === 'month') return new Date(d.getFullYear(), d.getMonth() + dir, 1);
      if (viewMode === '2week') return addDays(d, dir * 14);
      return addDays(d, dir * 7);
    });
  };
  const goToday = () => setRefDate(new Date(today.getFullYear(), today.getMonth(), 1));

  // Filter employees
  const allDepartments = DEPARTMENTS;
  const toggleDept = (dept) => {
    setActiveDepts(prev => {
      const next = new Set(prev);
      next.has(dept) ? next.delete(dept) : next.add(dept);
      return next;
    });
  };
  const toggleExpand = (dept) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      next.has(dept) ? next.delete(dept) : next.add(dept);
      return next;
    });
  };

  const filteredEmployees = useMemo(() => {
    const search = searchText.toLowerCase();
    return Object.entries(EMPLOYEES).filter(([id, emp]) => {
      if (!activeDepts.has(emp.department)) return false;
      if (search && !emp.name.toLowerCase().includes(search)) return false;
      if (absencesOnly) {
        const hasAbsence = dayISOs.some(iso => {
          const entry = absenceMap[id]?.[iso];
          return entry && (leaveFilter === 'all' || entry.type === leaveFilter);
        });
        if (!hasAbsence) return false;
      }
      return true;
    });
  }, [searchText, activeDepts, absencesOnly, dayISOs, absenceMap, leaveFilter]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const [id, emp] of filteredEmployees) {
      if (!groups[emp.department]) groups[emp.department] = [];
      groups[emp.department].push([id, emp]);
    }
    return groups;
  }, [filteredEmployees]);

  // Summary row — how many people off per day
  const summary = useMemo(() => {
    return dayISOs.map(iso => {
      let out = 0;
      for (const [empId] of filteredEmployees) {
        const entry = absenceMap[empId]?.[iso];
        if (entry && (leaveFilter === 'all' || entry.type === leaveFilter)) out++;
      }
      return out;
    });
  }, [dayISOs, filteredEmployees, absenceMap, leaveFilter]);

  const totalFiltered = filteredEmployees.length;

  const colCount = days.length;
  const nameColW = viewMode === 'week' ? 200 : 170;
  const gridCols = `${nameColW}px repeat(${colCount}, minmax(${viewMode === 'week' ? 80 : viewMode === '2week' ? 36 : 24}px, 1fr))`;

  const pending = requests.filter(r => r.status === 'pending');

  // Upcoming holidays
  const upcomingHolidays = BELGIAN_HOLIDAYS_2026.filter(h => h >= todayISO).slice(0, 3);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      {/* Page header */}
      <div style={{ padding: '28px 28px 18px', background: P.white, borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Team absences</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, margin: '4px 0 0' }}>Track and plan team availability</p>
        </div>
        <button onClick={() => setAddOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 20, border: 'none',
          background: P.ink, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
        }}>
          <Icon name="Plus" size={14} color="#fff" strokeWidth={2.5} /> Add time off
        </button>
      </div>

      {/* Filter toolbar — full width */}
      <FilterToolbar
        searchText={searchText} onSearch={setSearchText}
        leaveFilter={leaveFilter} onLeaveFilter={setLeaveFilter}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: calendar area */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Calendar card */}
          <div style={{ flex: 1, margin: '16px 20px 20px', background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
            {/* Calendar nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: `1px solid ${P.border}`, flexShrink: 0, position: 'relative' }}>
              {/* Left group: Today, nav arrows, date label, Week/Month */}
              <button onClick={goToday} style={{
                padding: '6px 14px', borderRadius: 7, border: `1px solid ${P.border}`,
                background: 'transparent', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.inkSoft,
              }}>Today</button>
              <button onClick={() => step(-1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: P.ink }}>{monthLabel}</span>
              <button onClick={() => step(1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <div style={{ display: 'flex', border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden', marginLeft: 4 }}>
                {[['week', 'Week'], ['month', 'Month']].map(([val, label]) => (
                  <button key={val} onClick={() => setViewMode(val)} style={{
                    padding: '6px 14px', border: 'none', cursor: 'pointer',
                    background: viewMode === val ? '#e8eaed' : 'transparent',
                    fontFamily: 'var(--font-display)', fontWeight: viewMode === val ? 700 : 500,
                    fontSize: 13, color: P.ink,
                  }}>{label}</button>
                ))}
              </div>

              <div style={{ flex: 1 }} />

              {/* Right: Absences only toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 12, color: P.inkSoft }}>Absences only</span>
                <div onClick={() => setAbsencesOnly(v => !v)} style={{
                  width: 34, height: 20, borderRadius: 10, padding: 2,
                  background: absencesOnly ? P.ink : '#d1d5db',
                  cursor: 'pointer', transition: 'background 150ms ease',
                  display: 'flex', alignItems: 'center',
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    transform: absencesOnly ? 'translateX(14px)' : 'translateX(0)',
                    transition: 'transform 150ms ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                  }} />
                </div>
              </label>

              {monthPickerOpen && (
                <MonthPicker currentDate={refDate} onSelect={d => { setRefDate(d); }} onClose={() => setMonthPickerOpen(false)} />
              )}
            </div>

            {/* Scrollable grid */}
            <div style={{ flex: 1, overflow: 'auto' }} className="hide-scrollbar">
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: gridCols, position: 'sticky', top: 0, zIndex: 10, background: P.white, borderBottom: `1px solid ${P.border}` }}>
                <div style={{ padding: '6px 12px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {filteredEmployees.length} people
                  </span>
                </div>
                {days.map((d, i) => {
                  const iso = dayISOs[i];
                  const isToday = iso === todayISO;
                  const isWknd = d.getDay() === 0 || d.getDay() === 6;
                  const isHoliday = _holidaySet.has(iso);
                  const isCollective = _collectiveSet.has(iso);
                  return (
                    <div key={i} style={{
                      padding: '6px 0', textAlign: 'center',
                      background: isCollective ? '#faf6eb' : isHoliday ? '#f3f1fe' : isWknd ? '#fafafa' : 'transparent',
                      borderLeft: `1px solid ${P.border}`,
                    }} title={isHoliday ? BELGIAN_HOLIDAY_NAMES[iso] : isCollective ? 'Company closed' : ''}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 9, color: P.inkFaint, letterSpacing: '0.06em' }}>
                        {DAY_LABELS[(d.getDay() + 6) % 7]}
                      </div>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', margin: '1px auto 0',
                        background: isToday ? P.ink : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: isToday ? 700 : 500, fontSize: 11, color: isToday ? '#fff' : isWknd ? P.inkFaint : P.ink }}>
                          {d.getDate()}
                        </span>
                      </div>
                      {(isHoliday || isCollective) && (
                        <div style={{ fontSize: 8, color: isCollective ? '#92400e' : '#7c3aed', fontFamily: 'var(--font-display)', fontWeight: 600, marginTop: 1 }}>
                          {isCollective ? 'Closed' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>


              {/* Department groups */}
              {Object.keys(grouped).sort().map(dept => {
                const employees = grouped[dept];
                const isExpanded = expandedDepts.has(dept);
                const deptOff = dayISOs.map(iso => {
                  let c = 0;
                  for (const [empId] of employees) {
                    if (absenceMap[empId]?.[iso]) c++;
                  }
                  return c;
                });
                const todayOff = deptOff[dayISOs.indexOf(todayISO)] || 0;

                return (
                  <div key={dept}>
                    {/* Department header */}
                    <div onClick={() => toggleExpand(dept)} style={{
                      display: 'grid', gridTemplateColumns: gridCols, cursor: 'pointer',
                      borderBottom: `1px solid ${P.border}`, background: '#fafbfa',
                    }}>
                      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size={12} color={P.inkSoft} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: P.ink }}>{dept}</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: P.inkFaint }}>{employees.length}</span>
                        {todayOff > 0 && (
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#f59e0b', marginLeft: 'auto' }}>{todayOff} off today</span>
                        )}
                      </div>
                      {dayISOs.map((iso, i) => {
                        const d = days[i];
                        const isWknd = d.getDay() === 0 || d.getDay() === 6;
                        const isHoliday = _holidaySet.has(iso);
                        const isCollective = _collectiveSet.has(iso);
                        return (
                          <div key={i} style={{
                            borderLeft: `1px solid ${P.border}`,
                            background: isCollective ? '#faf6eb' : isHoliday ? '#f3f1fe' : isWknd ? '#fafafa' : 'transparent',
                          }} />
                        );
                      })}
                    </div>

                    {/* Employee rows */}
                    {isExpanded && employees.map(([empId, emp]) => (
                      <div key={empId} style={{ display: 'grid', gridTemplateColumns: gridCols, borderBottom: `1px solid ${P.border}`, height: 36 }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {viewMode === 'week' ? emp.name : emp.name.split(' ')[0]}
                          </span>
                        </div>
                        {dayISOs.map((iso, i) => {
                          const d = days[i];
                          const isWknd = d.getDay() === 0 || d.getDay() === 6;
                          const isHoliday = _holidaySet.has(iso);
                          const isCollective = _collectiveSet.has(iso);
                          const entry = absenceMap[empId]?.[iso];
                          const show = entry && (leaveFilter === 'all' || entry.type === leaveFilter);
                          const barColor = show ? (LEAVE_COLORS[entry.type] || '#2563eb') : null;
                          const isPending = show && entry.status === 'pending';

                          // Connected bar styling
                          const prevEntry = absenceMap[empId]?.[dayISOs[i - 1]];
                          const nextEntry = absenceMap[empId]?.[dayISOs[i + 1]];
                          const isStart = show && (!prevEntry || prevEntry.requestId !== entry.requestId);
                          const isEnd = show && (!nextEntry || nextEntry.requestId !== entry.requestId);

                          return (
                            <div key={iso} style={{
                              borderLeft: `1px solid ${P.border}`,
                              background: isCollective ? '#faf6eb' : isHoliday ? '#f3f1fe' : isWknd ? '#fafafa' : 'transparent',
                              display: 'flex', alignItems: 'stretch',
                              paddingTop: 3, paddingBottom: 3,
                              paddingLeft: isStart ? 3 : 0,
                              paddingRight: isEnd ? 3 : 0,
                            }}>
                              {show && (
                                <div
                                  onMouseEnter={(e) => {
                                    clearTimeout(tooltipTimerRef.current);
                                    if (tooltipReqIdRef.current !== entry.requestId) {
                                      tooltipReqIdRef.current = entry.requestId;
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const req = requests.find(r => r.id === entry.requestId);
                                      if (req) setTooltip({ req, x: rect.left + rect.width / 2, y: rect.top - 4 });
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    tooltipTimerRef.current = setTimeout(() => {
                                      tooltipReqIdRef.current = null;
                                      setTooltip(null);
                                    }, 80);
                                  }}
                                  onClick={() => {
                                    const req = requests.find(r => r.id === entry.requestId);
                                    if (req && onShowDetail) onShowDetail(req);
                                  }}
                                  style={{
                                    width: '100%',
                                    borderRadius: isStart && isEnd ? 3 : isStart ? '3px 0 0 3px' : isEnd ? '0 3px 3px 0' : 0,
                                    background: isPending
                                      ? `repeating-linear-gradient(45deg, ${barColor}, ${barColor} 3px, ${barColor}55 3px, ${barColor}55 6px)`
                                      : barColor,
                                    cursor: 'pointer',
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Tooltip */}
            {tooltip && (
              <div style={{
                position: 'fixed', left: tooltip.x, top: tooltip.y - 8,
                transform: 'translate(-50%, -100%)', zIndex: 100,
                background: P.ink, color: '#fff', padding: '8px 12px', borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                fontFamily: 'var(--font-body)', fontSize: 11, lineHeight: 1.5,
                pointerEvents: 'none', whiteSpace: 'nowrap',
                animation: 'tooltipIn 0.1s ease-out',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 2 }}>
                  {(EMPLOYEES[tooltip.req.employee] || {}).name || tooltip.req.employee}
                </div>
                <div>{tooltip.req.type} · {tooltip.req.days} {tooltip.req.days === 1 ? 'day' : 'days'}</div>
                <div>{tooltip.req.startDate}{tooltip.req.startDate !== tooltip.req.endDate ? ` – ${tooltip.req.endDate}` : ''}</div>
                <div style={{ color: tooltip.req.status === 'pending' ? '#fbbf24' : '#86efac' }}>
                  {tooltip.req.status === 'pending' ? 'Pending approval' : 'Approved'}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
      {addOpen && (
        <AddTimeOffModal existing={null} onClose={() => setAddOpen(false)} onSave={(req) => { onSave(req); setAddOpen(false); }} />
      )}
    </div>
  );
}

// ── Employees screen ──────────────────────────────────────────────────────
function EmployeesScreen({ requests, onNav }) {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const empList = useMemo(() => {
    return Object.entries(EMPLOYEES).map(([id, emp]) => {
      const empReqs = requests.filter(r => r.employee === id && r.status !== 'rejected');
      const usedPTO = empReqs.filter(r => r.type === 'Time off').reduce((s, r) => s + (r.days || 1), 0);
      return { id, ...emp, usedPTO, remaining: emp.entitlement - usedPTO };
    }).sort((a, b) => a.department.localeCompare(b.department) || a.name.localeCompare(b.name));
  }, [requests]);

  const departments = useMemo(() => ['All', ...new Set(empList.map(e => e.department))], [empList]);

  const filtered = useMemo(() => {
    return empList.filter(e => {
      if (deptFilter !== 'All' && e.department !== deptFilter) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [empList, search, deptFilter]);

  const grouped = useMemo(() => {
    const g = {};
    for (const e of filtered) {
      if (!g[e.department]) g[e.department] = [];
      g[e.department].push(e);
    }
    return g;
  }, [filtered]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <div style={{ padding: '28px 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Employees</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, margin: '4px 0 0' }}>{empList.length} employees across {departments.length - 1} departments</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
            <Icon name="Search" size={14} color={P.inkFaint} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee…"
              style={{ width: '100%', padding: '8px 10px 8px 32px', border: `1px solid ${P.border}`, borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink, outline: 'none', background: P.white }} />
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            style={{ padding: '8px 28px 8px 10px', border: `1px solid ${P.border}`, borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink, background: P.white, cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
            {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All departments' : d}</option>)}
          </select>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 24px' }}>
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Employee</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Department</th>
                <th style={{ textAlign: 'center', padding: '10px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Entitled</th>
                <th style={{ textAlign: 'center', padding: '10px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Used</th>
                <th style={{ textAlign: 'center', padding: '10px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Remaining</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([dept, emps]) => (
                <React.Fragment key={dept}>
                  <tr>
                    <td colSpan={6} style={{ padding: '10px 16px 6px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em', background: '#fafbfa' }}>
                      {dept} <span style={{ fontWeight: 400, color: P.inkFaint }}>· {emps.length}</span>
                    </td>
                  </tr>
                  {emps.map(emp => (
                    <tr key={emp.id} onClick={() => onNav('employee-detail:' + emp.id)}
                      style={{ borderBottom: `1px solid ${P.border}`, cursor: 'pointer', transition: 'background 80ms' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f7f8f7'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.ink }}>{emp.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px', color: P.inkSoft }}>{emp.department}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: P.ink, fontWeight: 600 }}>{emp.entitlement}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: P.inkSoft }}>{emp.usedPTO}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: emp.remaining <= 3 ? '#ef4444' : P.ink }}>{emp.remaining}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <Icon name="ChevronRight" size={14} color={P.inkFaint} />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Edit balances modal ────────────────────────────────────────────────────
function EditBalancesModal({ emp, balances, onSave, onClose }) {
  const [values, setValues] = useState(() =>
    ALL_LEAVE_TYPES.reduce((acc, type) => {
      acc[type] = balances[type] != null ? String(balances[type]) : '';
      return acc;
    }, {})
  );

  const handleSave = () => {
    const next = {};
    for (const type of ALL_LEAVE_TYPES) {
      const v = parseInt(values[type], 10);
      next[type] = isNaN(v) || values[type] === '' ? null : v;
    }
    onSave(next);
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,13,40,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: P.white, borderRadius: 14, width: 440, boxShadow: '0 8px 40px rgba(15,13,40,0.18)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${P.border}` }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>Edit balances</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, marginTop: 2 }}>{emp.name}</div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <Icon name="X" size={18} color={P.inkSoft} />
          </button>
        </div>
        <div style={{ overflowY: 'auto' }}>
          <p style={{ margin: '12px 22px 4px', fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft }}>
            Set the entitled days per leave type. Leave blank for unlimited / not tracked.
          </p>
          {ALL_LEAVE_TYPES.map(type => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 22px', borderBottom: `1px solid ${P.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: LEAVE_COLORS[type], flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.ink }}>{type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <input
                  type="number" min="0"
                  value={values[type]}
                  onChange={e => setValues(v => ({ ...v, [type]: e.target.value }))}
                  placeholder="—"
                  style={{ width: 72, padding: '6px 10px', borderRadius: 7, border: `1px solid ${P.border}`, fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink, outline: 'none', textAlign: 'center' }}
                />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkFaint, width: 28 }}>days</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${P.border}`, background: 'transparent', color: P.ink, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: P.ink, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Save balances</button>
        </div>
      </div>
    </div>
  );
}

// ── Employee detail screen ────────────────────────────────────────────────
function EmployeeDetailScreen({ employeeId, requests, onNav, onSave, onCancel, employeeBalance, onUpdateBalance }) {
  const emp = EMPLOYEES[employeeId];
  const [activeTab, setActiveTab] = useState('timeoff');
  const [addModal, setAddModal] = useState(null); // null | 'add' | request object (edit)
  const [cancelAction, setCancelAction] = useState(null);
  const [editBalancesOpen, setEditBalancesOpen] = useState(false);

  if (!emp) return <div style={{ padding: 24 }}>Employee not found</div>;

  const empReqs = useMemo(() => {
    return requests.filter(r => r.employee === employeeId)
      .sort((a, b) => {
        const da = parseDisplayDate(a.startDate);
        const db = parseDisplayDate(b.startDate);
        return (db || 0) - (da || 0);
      });
  }, [requests, employeeId]);

  const balances = useMemo(() => {
    return ALL_LEAVE_TYPES.map(type => {
      const active = empReqs.filter(r => r.type === type && r.status !== 'rejected');
      const used = active.reduce((s, r) => s + (r.days || 1), 0);
      const defaultEntitled = type === 'Time off' ? emp.entitlement : (type === 'Paternity leave' ? 10 : type === 'Maternity leave' ? 105 : null);
      const entitled = (employeeBalance && employeeBalance[type] !== undefined) ? employeeBalance[type] : defaultEntitled;
      return { type, entitled, used, remaining: entitled != null ? entitled - used : null };
    });
  }, [empReqs, emp, employeeBalance]);

  const tabs = [
    { id: 'choices', label: 'Choices' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'salary', label: 'Salary & components' },
    { id: 'details', label: 'Details & roles' },
    { id: 'timeoff', label: 'Time off' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '24px 28px 0', borderBottom: `1px solid ${P.border}`, background: P.white }}>
        <button onClick={() => onNav('employees')} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', background: 'none',
          cursor: 'pointer', padding: 0, marginBottom: 14,
          fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft,
        }}>
          <Icon name="ArrowLeft" size={14} color={P.inkSoft} strokeWidth={2} />
          Employees
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>{emp.name}</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, margin: '2px 0 0' }}>{emp.department}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {tabs.map(tab => {
            const isActive = tab.id === activeTab;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: isActive ? 700 : 500, fontSize: 13,
                color: isActive ? P.ink : P.inkSoft,
                borderBottom: isActive ? `2px solid ${P.ink}` : '2px solid transparent',
                marginBottom: -1,
              }}>{tab.label}</button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {activeTab === 'timeoff' ? (
          <div style={{ maxWidth: 900 }}>
            {/* Balances card */}
            <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>Balances</span>
                <button onClick={() => setEditBalancesOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: `1px solid ${P.border}`, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: P.ink }}>
                  <Icon name="Pencil" size={12} color={P.inkSoft} />
                  Edit balances
                </button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                    <th style={{ textAlign: 'left', padding: '9px 20px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Leave type</th>
                    <th style={{ textAlign: 'center', padding: '9px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Entitled</th>
                    <th style={{ textAlign: 'center', padding: '9px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Used</th>
                    <th style={{ textAlign: 'center', padding: '9px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map(b => (
                    <tr key={b.type} style={{ borderBottom: `1px solid ${P.border}` }}>
                      <td style={{ padding: '10px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: LEAVE_COLORS[b.type], flexShrink: 0 }} />
                          <span style={{ color: P.ink }}>{b.type}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: b.entitled != null ? P.ink : P.inkFaint }}>{b.entitled != null ? b.entitled : '—'}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: b.used > 0 ? P.ink : P.inkFaint }}>{b.used || '—'}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: b.remaining != null ? (b.remaining <= 3 ? '#ef4444' : P.ink) : P.inkFaint }}>{b.remaining != null ? b.remaining : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Absence history */}
            <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>Absence history</span>
                <button onClick={() => setAddModal('add')} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 8,
                  border: 'none', background: P.ink, color: '#fff', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
                }}>
                  <Icon name="Plus" size={13} color="#fff" strokeWidth={2.5} />
                  Register absence
                </button>
              </div>

              {empReqs.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: P.inkFaint, fontFamily: 'var(--font-body)', fontSize: 13 }}>
                  No absences recorded
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                      <th style={{ textAlign: 'left', padding: '9px 20px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Period</th>
                      <th style={{ textAlign: 'left', padding: '9px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Type</th>
                      <th style={{ textAlign: 'center', padding: '9px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Days</th>
                      <th style={{ textAlign: 'left', padding: '9px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {empReqs.map(req => (
                      <tr key={req.id} style={{ borderBottom: `1px solid ${P.border}` }}>
                        <td style={{ padding: '10px 20px', color: P.ink }}>
                          {req.startDate}{req.endDate && req.endDate !== req.startDate ? ` → ${req.endDate}` : ''}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: LEAVE_COLORS[req.type] || P.inkFaint, flexShrink: 0 }} />
                            <span style={{ color: P.ink }}>{req.type}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'center', color: P.inkSoft }}>{req.days || 1}</td>
                        <td style={{ padding: '10px 16px' }}><StatusDot status={req.status} /></td>
                        <td style={{ padding: '10px 16px' }}>
                          <ActionMenu req={req}
                            onEdit={() => setAddModal(req)}
                            onCancel={() => setCancelAction(req)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: 24, maxWidth: 480, color: P.inkFaint, fontFamily: 'var(--font-body)', fontSize: 13 }}>
            Coming soon
          </div>
        )}
      </div>

      {addModal && (
        <AddTimeOffModal
          existing={addModal === 'add' ? { employee: employeeId, _lockEmployee: true } : { ...addModal, _lockEmployee: true }}
          onClose={() => setAddModal(null)}
          onSave={(req) => { onSave(req); setAddModal(null); }}
        />
      )}

      {cancelAction && (
        <ReasonModal
          title="Cancel absence"
          description={`You're cancelling ${emp.name}'s ${cancelAction.type}. This cannot be undone.`}
          confirmLabel="Cancel absence"
          onClose={() => setCancelAction(null)}
          onConfirm={(reason) => { onCancel(cancelAction.id, reason); setCancelAction(null); }}
        />
      )}

      {editBalancesOpen && (
        <EditBalancesModal
          emp={emp}
          balances={employeeBalance || {}}
          onSave={onUpdateBalance}
          onClose={() => setEditBalancesOpen(false)}
        />
      )}
    </div>
  );
}

// ── Settings screen ────────────────────────────────────────────────────────
function SettingsScreen() {
  return (
    <div style={{ flex: 1, padding: 24 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Settings</h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, margin: '0 0 20px' }}>Leave policies and company configuration</p>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: 24, maxWidth: 480, color: P.inkFaint, fontFamily: 'var(--font-body)', fontSize: 13 }}>
        Coming soon — collective holidays, leave cascade order, approval rules
      </div>
    </div>
  );
}

// ── App switcher pill ──────────────────────────────────────────────────────
function AppSwitcher() {
  return (
    <a href="/" style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 100,
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '8px 14px', borderRadius: 20,
      background: P.ink, color: '#fff', textDecoration: 'none',
      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
      boxShadow: '0 2px 12px rgba(15,13,40,0.2)',
    }}>
      <Icon name="Smartphone" size={13} color="#fff" strokeWidth={2} />
      Employee App
    </a>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [message]);
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: P.ink, color: '#fff', padding: '10px 20px', borderRadius: 10,
      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
      boxShadow: '0 4px 16px rgba(15,13,40,0.2)', zIndex: 300,
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'fadeUp 0.2s ease-out',
    }}>
      <Icon name="Check" size={15} color="#fff" strokeWidth={2.5} />
      {message}
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────
function App() {
  const [screen, setScreen] = useState('team-absences');
  const [requests, setRequests] = useState(() => mergeRequests(generatedRequests, readLS()));
  const [toast, setToast] = useState(null);
  const [calDetail, setCalDetail] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'decline'|'cancel', id, empName }

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== LS_KEY) return;
      const live = readLS();
      setRequests(prev => {
        const merged = mergeRequests(prev, live);
        const hasNew = merged.some(r => r.status === 'pending' && !prev.find(p => p.id === r.id));
        if (hasNew) setToast('New request received');
        return merged;
      });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const approve = (id) => {
    setRequests(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status: 'approved' } : r);
      writeLS(next);
      return next;
    });
    const req = requests.find(r => r.id === id);
    if (req) setToast(`${(EMPLOYEES[req.employee] || { name: req.employee }).name.split(' ')[0]}'s request approved`);
  };

  const decline = (id, reason) => {
    setRequests(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status: 'rejected', declineReason: reason } : r);
      writeLS(next);
      return next;
    });
    const req = requests.find(r => r.id === id);
    if (req) setToast(`${(EMPLOYEES[req.employee] || { name: req.employee }).name.split(' ')[0]}'s request declined`);
  };

  // Interceptors — show ReasonModal before acting
  const requestDecline = (id) => {
    const req = requests.find(r => r.id === id);
    const empName = (EMPLOYEES[req?.employee] || { name: req?.employee || '' }).name;
    setPendingAction({ type: 'decline', id, empName });
  };
  const requestCancel = (id) => {
    const req = requests.find(r => r.id === id);
    const empName = (EMPLOYEES[req?.employee] || { name: req?.employee || '' }).name;
    setPendingAction({ type: 'cancel', id, empName });
  };

  const saveRequest = (req) => {
    setRequests(prev => {
      const existing = prev.findIndex(r => r.id === req.id);
      const next = existing >= 0
        ? prev.map(r => r.id === req.id ? req : r)
        : [req, ...prev];
      return next;
    });
    setToast(req.id.startsWith('manual-') ? 'Absence added' : 'Absence updated');
  };

  const cancelRequest = (id, reason) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    setToast('Absence cancelled');
  };

  const [employeeBalances, setEmployeeBalances] = useState(() => {
    const init = {};
    for (const [id, emp] of Object.entries(EMPLOYEES)) {
      init[id] = {
        'Time off': emp.entitlement,
        'Sick leave': null,
        'Special leave': null,
        'Paternity leave': 10,
        'Maternity leave': 105,
        'Paid absence': null,
        'Unpaid absence': null,
      };
    }
    return init;
  });

  const updateBalances = (empId, newBalances) =>
    setEmployeeBalances(prev => ({ ...prev, [empId]: newBalances }));

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ display: 'flex', height: '100vh', background: P.bg }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes tooltipIn {
          from { opacity: 0; transform: translate(-50%, -94%); }
          to   { opacity: 1; transform: translate(-50%, -100%); }
        }
        * { box-sizing: border-box; }
      `}</style>

      <Sidebar active={screen} onNav={setScreen} pendingCount={pendingCount} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {screen === 'team-absences' && <TeamAbsencesScreen requests={requests} pendingCount={pendingCount} onNav={setScreen} onShowDetail={setCalDetail} onSave={saveRequest} />}
        {screen === 'requests' && <RequestsScreen requests={requests} onApprove={approve} onDecline={requestDecline} onSave={saveRequest} onCancel={requestCancel} />}
        {screen === 'employees' && <EmployeesScreen requests={requests} onNav={setScreen} />}
        {screen.startsWith('employee-detail:') && <EmployeeDetailScreen employeeId={screen.split(':')[1]} requests={requests} onNav={setScreen} onSave={saveRequest} onCancel={cancelRequest} employeeBalance={employeeBalances[screen.split(':')[1]]} onUpdateBalance={(newBal) => updateBalances(screen.split(':')[1], newBal)} />}
        {screen === 'settings' && <SettingsScreen />}
      </div>

      {calDetail && (
        <DetailModal req={calDetail} requests={requests} onClose={() => setCalDetail(null)}
          onApprove={(id) => { approve(id); setCalDetail(prev => prev && prev.id === id ? { ...prev, status: 'approved' } : prev); }}
          onDecline={(id) => requestDecline(id)}
          onCancel={(id) => requestCancel(id)}
        />
      )}

      {pendingAction && (
        <ReasonModal
          title={pendingAction.type === 'decline' ? 'Decline request' : 'Cancel absence'}
          description={
            pendingAction.type === 'decline'
              ? `You're declining ${pendingAction.empName}'s time off request. The employee will be notified.`
              : `You're cancelling ${pendingAction.empName}'s absence. This cannot be undone.`
          }
          confirmLabel={pendingAction.type === 'decline' ? 'Decline request' : 'Cancel absence'}
          onClose={() => setPendingAction(null)}
          onConfirm={(reason) => {
            if (pendingAction.type === 'decline') {
              decline(pendingAction.id, reason);
              setCalDetail(prev => prev && prev.id === pendingAction.id ? { ...prev, status: 'rejected' } : prev);
            } else {
              cancelRequest(pendingAction.id, reason);
              setCalDetail(prev => prev && prev.id === pendingAction.id ? null : prev);
            }
            setPendingAction(null);
          }}
        />
      )}

      <AppSwitcher />
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
