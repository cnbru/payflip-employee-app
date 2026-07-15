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
  'Time off':           '#c5dcfd',
  'ADV / RTT':          '#fef3c7',
  'Extra-legal leave':  '#ede9fe',
  'Sick leave':         '#fbd0e4',
  'Special leave':      '#fde9c8',
  'Funeral leave':      '#d8d3e3',
  'Paternity leave':    '#ddd8fb',
  'Maternity leave':    '#ddd8fb',
  'Paid absence':       '#c0eef3',
  'Unpaid absence':     '#e2e8ec',
};
const LEAVE_BORDER_COLORS = {
  'Time off':           '#7aafe8',
  'ADV / RTT':          '#e5c87a',
  'Extra-legal leave':  '#a899e0',
  'Sick leave':         '#e698b8',
  'Special leave':      '#e0b97a',
  'Funeral leave':      '#a99dba',
  'Paternity leave':    '#a9a0e0',
  'Maternity leave':    '#a9a0e0',
  'Paid absence':       '#7ac8d1',
  'Unpaid absence':     '#a8b4be',
};


const ALL_LEAVE_TYPES = [
  'Time off', 'ADV / RTT', 'Extra-legal leave',
  'Sick leave', 'Special leave',
  'Paternity leave', 'Maternity leave',
];

const ADMIN_ONLY_TYPES = new Set(['Paternity leave', 'Maternity leave', 'Paid absence', 'Unpaid absence']);

const SPECIAL_LEAVE_REASONS = [
  { id: 'wedding',   label: 'Wedding',      hasWho: true,  entitlement: null },
  { id: 'moving',    label: 'Moving',        hasWho: false, entitlement: '1 day' },
  { id: 'funeral',   label: 'Funeral leave', hasWho: true,  entitlement: null },
  { id: 'ceremony',  label: 'Ceremony',      hasWho: false, entitlement: '1 day' },
  { id: 'civic',     label: 'Civic duty',    hasWho: false, entitlement: 'Up to 5 days' },
];
const SPECIAL_WEDDING_WHO = [
  { id: 'own',    label: "Employee's own wedding",         days: 2 },
  { id: 'family', label: "Child, sibling, or parent of the employee", days: 1 },
];
const SPECIAL_FUNERAL_WHO = [
  { id: 'partner',  label: 'Partner or spouse',           days: 10, note: '3 around the funeral, 7 more within the year' },
  { id: 'child',    label: 'Child',                       days: 10, note: '3 around the funeral, 7 more within the year' },
  { id: 'parent',   label: 'Parent or parent-in-law',     days: 3  },
  { id: 'sibling',  label: 'Sibling or grandparent',      days: 2  },
  { id: 'other',    label: 'Other family member',         days: 1  },
];

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

// ── Motion tokens ────────────────────────────────────────────────────────────
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const MODAL_CLOSE_DUR = 150;

// Drives a modal's mount-in / close-out transition. Returns `visible` (drive
// opacity/transform from this) and `close` (call instead of the raw onClose —
// it animates out, then fires the real onClose after MODAL_CLOSE_DUR).
function useModalTransition(onClose) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, MODAL_CLOSE_DUR);
  }, [onClose]);
  return { visible: mounted && !closing, close };
}
function modalBackdropStyle(visible) {
  return { opacity: visible ? 1 : 0, transition: `opacity ${MODAL_CLOSE_DUR}ms ${EASE_OUT}` };
}

// Drives a popover/dropdown/menu's grow-in / shrink-out transition from a
// plain `open` boolean. Keeps the panel mounted for `duration` after `open`
// flips false so the shrink-out can play instead of an instant unmount.
function usePopoverTransition(open, duration = 150) {
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (open) {
      setRendered(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = setTimeout(() => setRendered(false), duration);
    return () => clearTimeout(t);
  }, [open, duration]);
  return { rendered, visible };
}
function popoverStyle(visible, origin = 'top') {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'scale(1)' : 'scale(0.97)',
    transformOrigin: origin,
    transition: `opacity 150ms ${EASE_OUT}, transform 150ms ${EASE_OUT}`,
  };
}

// Measures the active item in a tab/segmented-control strip and returns a ref
// to attach to the container plus a left/width rect to position a sliding
// indicator behind/under the items. First measurement is applied with no
// transition (so it doesn't animate in from 0,0); subsequent moves animate.
function useSlidingIndicator(activeKey) {
  const containerRef = useRef(null);
  const [rect, setRect] = useState(null);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const el = container.querySelector(`[data-key="${CSS.escape(String(activeKey))}"]`);
    if (el) setRect({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeKey]);
  useEffect(() => {
    if (rect && !animate) {
      const id = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(id);
    }
  }, [rect, animate]);
  return [containerRef, rect || { left: 0, width: 0 }, animate];
}
function modalPanelStyle(visible) {
  return {
    transform: visible ? 'scale(1)' : 'scale(0.96)',
    opacity: visible ? 1 : 0,
    transition: `transform 200ms ${EASE_OUT}, opacity 200ms ${EASE_OUT}`,
  };
}

// ── Shared toggle switch ─────────────────────────────────────────────────────
function Switch({ checked, onChange, size = 'md' }) {
  const dims = size === 'sm' ? { w: 28, h: 16, knob: 12, pad: 2 } : { w: 34, h: 20, knob: 16, pad: 2 };
  return (
    <div onClick={onChange} style={{
      width: dims.w, height: dims.h, borderRadius: dims.h / 2, flexShrink: 0, cursor: 'pointer',
      background: checked ? P.ink : '#d1d5db',
      position: 'relative', transition: `background 150ms ${EASE_OUT}`,
    }}>
      <div style={{
        position: 'absolute', top: dims.pad,
        left: checked ? dims.w - dims.knob - dims.pad : dims.pad,
        width: dims.knob, height: dims.knob, borderRadius: dims.knob / 2,
        background: '#fff', transition: `left 200ms ${EASE_BOUNCE}`,
      }} />
    </div>
  );
}

function WeekCard({ entry, requestId, requests, isPending }) {
  const req = requests.find(function(rr) { return rr.id === requestId; });
  return (
    <React.Fragment>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
        {entry.type}
      </span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: P.inkSoft, whiteSpace: 'nowrap', lineHeight: 1.3 }}>
        {isPending ? 'Pending' : req ? (req.days + ' ' + (req.days === 1 ? 'day' : 'days')) : ''}
      </span>
    </React.Fragment>
  );
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
const COLLECTIVE_HOLIDAYS = [];
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

// ── Employee data ──────────────────────────────────────────────────────────
const DEPARTMENTS = ['Design','Engineering','Marketing'];
const AVATAR_COLORS = ['#bfdbfe','#ddd6fe','#fde68a','#a7f3d0','#fecdd3','#fed7aa','#c7d2fe','#fca5a5','#d9f99d','#99f6e4'];

const EMPLOYEES = {
  // Design
  'bram-goossens':     { name: 'Bram Goossens',     initials: 'BG', color: '#bfdbfe', entitlement: 23, department: 'Design',       email: 'bram.goossens@edgxspace.be',     entity: 'EDGX SPACE', budget: 3750,  role: 'Employee', status: 'Active', gender: 'm' },
  'emma-martens':      { name: 'Emma Martens',       initials: 'EM', color: '#ddd6fe', entitlement: 29, department: 'Design',       email: 'emma.martens@edgxspace.be',      entity: 'EDGX SPACE', budget: 0,     role: 'Employee', status: 'Active', gender: 'f' },
  'mathias-de-smedt':  { name: 'Mathias De Smedt',  initials: 'MD', color: '#fde68a', entitlement: 23, department: 'Design',       email: 'mathias.de-smedt@edgxspace.be', entity: 'EDGX SPACE', budget: 6250,  role: 'Employee', status: 'Active', gender: 'm' },
  'thomas-vandenberghe': { name: 'Thomas Vandenberghe', initials: 'TV', color: '#99f6e4', entitlement: 20, department: 'Design',    email: 'thomas.vandenberghe@edgxspace.be', entity: 'EDGX SPACE', budget: 0, role: 'Employee', status: 'Active', gender: 'm' },
  // Engineering
  'david':             { name: 'David Laurent',      initials: 'DL', color: '#fecdd3', entitlement: 20, department: 'Engineering', email: 'david.laurent@edgxspace.be',     entity: 'EDGX SPACE', budget: 4500,  role: 'Employee', status: 'Active', gender: 'm' },
  'stijn-laurent':     { name: 'Stijn Laurent',      initials: 'SL', color: '#a7f3d0', entitlement: 29, department: 'Engineering', email: 'stijn.laurent@edgxspace.be',     entity: 'EDGX SPACE', budget: 1500,  role: 'Employee', status: 'Active', gender: 'm' },
  'jana-goossens':     { name: 'Jana Goossens',      initials: 'JG', color: '#c7d2fe', entitlement: 20, department: 'Engineering', email: 'jana.goossens@edgxspace.be',     entity: 'EDGX SPACE', budget: 2000,  role: 'Employee', status: 'Active', gender: 'f' },
  'laura-mertens':     { name: 'Laura Mertens',      initials: 'LM', color: '#fca5a5', entitlement: 20, department: 'Engineering', email: 'laura.mertens@edgxspace.be',     entity: 'EDGX SPACE', budget: 750,   role: 'Employee', status: 'Active', gender: 'f' },
  // Marketing
  'pieter-mertens':    { name: 'Pieter Mertens',     initials: 'PM', color: '#a7f3d0', entitlement: 29, department: 'Marketing',   email: 'pieter.mertens@edgxspace.be',    entity: 'EDGX SPACE', budget: 8500,  role: 'Manager',  status: 'Active', gender: 'm' },
  'sarah-de-smedt':    { name: 'Sarah De Smedt',     initials: 'SD', color: '#fecdd3', entitlement: 23, department: 'Marketing',   email: 'sarah.de-smedt@edgxspace.be',   entity: 'EDGX SPACE', budget: 2750,  role: 'Employee', status: 'Active', gender: 'f' },
  'julie-goossens':    { name: 'Julie Goossens',     initials: 'JG', color: '#fed7aa', entitlement: 20, department: 'Marketing',   email: 'julie.goossens@edgxspace.be',    entity: 'EDGX SPACE', budget: 5000,  role: 'Manager',  status: 'Active', gender: 'f' },
  'noor-de-smedt':     { name: 'Noor De Smedt',      initials: 'ND', color: '#fde68a', entitlement: 20, department: 'Marketing',   email: 'noor.de-smedt@edgxspace.be',    entity: 'EDGX SPACE', budget: 0,     role: 'Employee', status: 'Active', gender: 'f' },
};

const generatedRequests = [
  { id: 'gen-1', employee: 'david', type: 'Time off', startDate: 'Mon 1 Jun', endDate: 'Thu 11 Jun', days: 9, status: 'approved', submittedAt: '12 May', note: 'Summer holiday', _selectedDates: ['2026-06-01','2026-06-02','2026-06-03','2026-06-04','2026-06-05','2026-06-08','2026-06-09','2026-06-10','2026-06-11'] },
  { id: 'gen-2', employee: 'emma-martens', type: 'Time off', startDate: 'Mon 13 Jul', endDate: 'Fri 17 Jul', days: 5, status: 'pending', submittedAt: '20 Jun', note: '' },
  { id: 'gen-3', employee: 'mathias-de-smedt', type: 'Time off', startDate: 'Wed 8 Jul', endDate: 'Wed 8 Jul', days: 1, status: 'approved', submittedAt: '10 Jun', note: '', _selectedDates: ['2026-07-08'] },
  { id: 'gen-4', employee: 'stijn-laurent', type: 'Special leave', startDate: 'Fri 3 Jul', endDate: 'Fri 3 Jul', days: 1, status: 'approved', submittedAt: '25 Jun', note: 'Wedding', _selectedDates: ['2026-07-03'] },
  { id: 'gen-5', employee: 'laura-mertens', type: 'Sick leave', startDate: 'Tue 7 Jul', endDate: 'Tue 7 Jul', days: 1, status: 'approved', submittedAt: '7 Jul', note: '', _selectedDates: ['2026-07-07'] },
  { id: 'gen-6', employee: 'bram-goossens', type: 'ADV / RTT', startDate: 'Mon 22 Jun', endDate: 'Tue 23 Jun', days: 2, status: 'approved', submittedAt: '15 Jun', note: '', _selectedDates: ['2026-06-22','2026-06-23'] },
  { id: 'gen-7', employee: 'jana-goossens', type: 'Time off', startDate: 'Thu 25 Jun', endDate: 'Fri 27 Jun', days: 3, status: 'approved', submittedAt: '10 Jun', note: 'Long weekend', _selectedDates: ['2026-06-25','2026-06-26','2026-06-27'] },
  { id: 'gen-8', employee: 'pieter-mertens', type: 'Extra-legal leave', startDate: 'Wed 1 Jul', endDate: 'Wed 1 Jul', days: 1, status: 'approved', submittedAt: '28 Jun', note: '', _selectedDates: ['2026-07-01'] },
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
function SidebarItem({ label, isActive, onClick, badgeDot, chevron, chevronOpen, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '7px 10px', borderRadius: 7,
      border: 'none', background: isActive ? P.bg : 'transparent',
      cursor: disabled ? 'default' : 'pointer', width: '100%', textAlign: 'left',
    }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: isActive ? 700 : 500, fontSize: 13, color: disabled ? P.inkFaint : isActive ? P.ink : P.inkSoft, flex: 1 }}>
        {label}
      </span>
      {badgeDot && <span style={{ minWidth: 17, height: 17, borderRadius: 9, padding: '0 4px', background: P.ink, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: `badgePopIn 500ms ${EASE_BOUNCE}` }}>{typeof badgeDot === 'number' ? badgeDot : '!'}</span>}
      {chevron && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{
          flexShrink: 0, transform: chevronOpen ? 'scaleY(-1)' : 'scaleY(1)', transition: `transform 200ms ${EASE_OUT}`,
        }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )}
    </button>
  );
}

// Grid-rows accordion — padding lives on the inner wrapper, never on the
// 0fr/1fr track itself, or the panel never fully collapses.
function SidebarAccordion({ open, children }) {
  return (
    <div style={{
      display: 'grid', gridTemplateRows: open ? '1fr' : '0fr',
      transition: `grid-template-rows 250ms ${EASE_OUT}`, overflow: 'hidden',
    }}>
      <div style={{ minHeight: 0 }}>{children}</div>
    </div>
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
              <span style={{ minWidth: 17, height: 17, borderRadius: 9, padding: '0 4px', background: P.ink, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: `badgePopIn 500ms ${EASE_BOUNCE}` }}>{badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Sidebar({ active, onNav, pendingCount }) {
  const [companyOpen, setCompanyOpen] = useState(false);
  const [payrollOpen, setPayrollOpen] = useState(active === 'team-absences' || active === 'payroll-overview' || active === 'payroll-settings' || active === 'payroll-wagecodes');
  const [todoOpen, setTodoOpen] = useState(active === 'requests');

  return (
    <div style={{
      width: 216, flexShrink: 0, background: P.white,
      borderRight: `1px solid ${P.border}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Entity selector */}
      <div style={{ padding: '10px 18px', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: P.inkFaint }}>Entity view for</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#6366f1', letterSpacing: '-0.01em' }}>Payflip</div>
        </div>
        <Icon name="ChevronsUpDown" size={14} color={P.inkFaint} />
      </div>

      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 1, overflow: 'auto' }}>
        <SidebarItem label="Home" isActive={active === 'home'} onClick={() => onNav('home')} />

        <SidebarItem label="To do" onClick={() => setTodoOpen(o => !o)} badgeDot={pendingCount || undefined} chevron chevronOpen={todoOpen} />
        <SidebarAccordion open={todoOpen}>
          <SidebarSub active={active} onNav={onNav} items={[
            { id: 'todo-review', label: 'Review choices' },
            { id: 'todo-relaunch', label: 'Assign relaunch admin' },
            { id: 'requests', label: 'Time off requests', badge: pendingCount },
          ]} />
        </SidebarAccordion>

        <SidebarItem label="Company" onClick={() => setCompanyOpen(o => !o)} chevron chevronOpen={companyOpen} />
        <SidebarAccordion open={companyOpen}>
          <SidebarSub active={active} onNav={onNav} items={[
            { id: 'company-budgets', label: 'Budgets' },
            { id: 'company-benefits', label: 'Benefits' },
            { id: 'company-details', label: 'Company details' },
            { id: 'company-choices', label: 'Choices overview' },
            { id: 'company-integrations', label: 'Integrations' },
            { id: 'company-documents', label: 'Documents' },
            { id: 'company-reporting', label: 'Reporting' },
          ]} />
        </SidebarAccordion>

        <SidebarItem label="Payroll" onClick={() => setPayrollOpen(o => !o)} chevron chevronOpen={payrollOpen} />
        <SidebarAccordion open={payrollOpen}>
          <SidebarSub active={active} onNav={onNav} items={[
            { id: 'payroll-overview', label: 'Overview' },
            { id: 'payroll-settings', label: 'Settings' },
            { id: 'payroll-wagecodes', label: 'Wage codes' },
            { id: 'team-absences', label: 'Team absences' },
          ]} />
        </SidebarAccordion>

        <SidebarItem label="Users" isActive={active === 'employees' || active?.startsWith('employee-detail')} onClick={() => onNav('employees')} />

        <div style={{ height: 1, background: P.border, margin: '6px 0' }} />

        <button disabled style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '7px 10px', borderRadius: 7,
          border: 'none', background: 'transparent',
          cursor: 'default', width: '100%', textAlign: 'left',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: P.inkFaint, flex: 1 }}>Billing</span>
          <Icon name="ExternalLink" size={12} color={P.inkFaint} />
        </button>
      </nav>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${P.border}`, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <SidebarItem label="English" disabled />
        <SidebarItem label="Logout" disabled />
      </div>
    </div>
  );
}

// ── Action menu (···) ──────────────────────────────────────────────────────
function ActionMenu({ req, onApprove, onDecline, onViewDetails, onEdit, onCancel }) {
  const [open, setOpen] = useState(false);
  const { rendered: menuRendered, visible: menuVisible } = usePopoverTransition(open);
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
      {menuRendered && (
        <div style={{
          position: 'absolute', right: 0, top: 36, zIndex: 50,
          background: P.white, border: `1px solid ${P.border}`, borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.10)', width: 164, overflow: 'hidden',
          ...popoverStyle(menuVisible, 'top right'),
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
  const { visible, close } = useModalTransition(onClose);
  return (
    <div onClick={close} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(15,13,40,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...modalBackdropStyle(visible),
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: P.white, borderRadius: 14, width: 420,
        boxShadow: '0 8px 40px rgba(15,13,40,0.2)',
        display: 'flex', flexDirection: 'column',
        ...modalPanelStyle(visible),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${P.border}` }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>{title}</span>
          <button onClick={close} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <Icon name="X" size={18} color={P.inkSoft} />
          </button>
        </div>
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {description && (
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, lineHeight: 1.5 }}>{description}</p>
          )}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.inkSoft, marginBottom: 6 }}>
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
          <button onClick={close} style={{
            padding: '8px 18px', borderRadius: 8, border: `1px solid ${P.border}`, background: 'transparent',
            color: P.ink, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
          }}>Back</button>
          <button
            disabled={!reason.trim()}
            onClick={() => { onConfirm(reason.trim()); close(); }}
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
function DetailModal({ req, requests, onClose, onApprove, onDecline, onCancel, onEdit }) {
  const emp = EMPLOYEES[req.employee] || { name: req.employee, entitlement: 25, department: '' };
  const usedDays = requests
    .filter(r => r.employee === req.employee && r.id !== req.id && (r.status === 'approved' || r.status === 'pending'))
    .reduce((s, r) => s + r.days, 0);
  const remaining = Math.max(0, emp.entitlement - usedDays - req.days);
  const isPending = req.status === 'pending';

  // Determine if absence is in the past (ended before today)
  const today = new Date(); today.setHours(0,0,0,0);
  const endD = req._selectedDates?.length
    ? (() => { const p = req._selectedDates[req._selectedDates.length-1].split('-'); return new Date(+p[0],+p[1]-1,+p[2]); })()
    : parseDisplayDate(req.endDate || req.startDate);
  const isPast = endD && endD < today;
  // Only show warning if ended within the past 30 days
  const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const showPastWarning = isPast && endD >= thirtyDaysAgo;

  const whenLabel = (() => {
    const dateStr = req._selectedDates && req._selectedDates.length > 1
      ? req._selectedDates.map(iso => { const p = iso.split('-'); return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); }).join(', ')
      : req.startDate === req.endDate ? req.startDate : `${req.startDate} – ${req.endDate}`;
    const sub = `${req.days} ${req.days === 1 ? 'day' : 'days'}${isPast ? ' · in the past' : ''}`;
    return <span>{dateStr}<br /><span style={{ color: P.inkSoft, fontSize: 12 }}>{sub}</span></span>;
  })();

  const { visible, close } = useModalTransition(onClose);

  const Row = ({ label, children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', padding: '11px 22px', borderBottom: `1px solid ${P.border}`, alignItems: 'start', gap: 12 }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, paddingTop: 1 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.ink }}>{children}</span>
    </div>
  );

  return (
    <div onClick={close} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(15,13,40,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...modalBackdropStyle(visible),
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: P.white, borderRadius: 14, width: 520,
        boxShadow: '0 8px 40px rgba(15,13,40,0.18)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden',
        ...modalPanelStyle(visible),
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${P.border}` }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>Time off details</span>
          <button onClick={close} style={{ border: `1px solid ${P.border}`, background: P.white, cursor: 'pointer', padding: '6px 8px', borderRadius: 8, display: 'flex' }}>
            <Icon name="X" size={16} color={P.inkSoft} />
          </button>
        </div>

        <div style={{ overflowY: 'auto' }}>
          {/* Status row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', borderBottom: `1px solid ${P.border}` }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: req.status === 'approved' ? '#22c55e' : req.status === 'pending' ? '#f59e0b' : '#9ca3af', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft }}>Status</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: P.ink }}>
              {req.status === 'approved' ? 'Approved' : req.status === 'pending' ? 'Pending' : 'Declined'}
            </span>
          </div>

          {/* Balance summary card */}
          <div style={{ margin: '14px 22px', borderRadius: 10, border: `1px solid ${P.border}`, overflow: 'hidden' }}>
            {[
              { label: 'Annual entitlement', value: `${emp.entitlement} days`, bold: false },
              { label: 'Used & booked', value: `${usedDays} ${usedDays === 1 ? 'day' : 'days'}`, bold: false },
              { label: 'This request', value: `${req.days} ${req.days === 1 ? 'day' : 'days'}`, bold: false },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${P.border}` }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: P.ink }}>Remaining after request</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: remaining < 0 ? '#b91c1c' : P.ink }}>
                {remaining} {Math.abs(remaining) === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>

          {/* Detail rows */}
          <Row label="Type">{req.type}</Row>
          <Row label="When">{whenLabel}</Row>
          <Row label="Requested on">{req.submittedAt}</Row>
          <Row label="Requested by">
            <span>{emp.name}</span>
            {emp.department && <span style={{ color: P.inkFaint, fontSize: 12, marginLeft: 7 }}>{emp.department}</span>}
          </Row>
          <Row label="Notes">
            {req.note
              ? <span>{req.note}</span>
              : <span style={{ color: P.inkFaint, fontStyle: 'italic' }}>None</span>}
          </Row>

          {/* Past warning — only within last 30 days */}
          {showPastWarning && (
            <div style={{ margin: '14px 22px', padding: '11px 14px', borderRadius: 8, background: '#fef9c3', border: '1px solid #fde047', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#92400e', lineHeight: 1.4 }}>
                This absence has already passed. Changes may affect payroll records.
              </span>
            </div>
          )}
          <div style={{ height: 6 }} />
        </div>

        {/* Footer */}
        {(isPending || req.status === 'approved') && (
          <div style={{ padding: '14px 22px', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            {isPending && <>
              <button onClick={() => { onDecline(req.id); close(); }} style={{
                padding: '8px 20px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fef2f2',
                color: '#b91c1c', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
              }}>Decline</button>
              <button onClick={() => { onApprove(req.id); close(); }} style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', background: '#166534', color: '#fff',
                cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
              }}>Approve</button>
            </>}
            {req.status === 'approved' && <>
              <button onClick={() => { onCancel(req.id); close(); }} style={{
                padding: '8px 20px', borderRadius: 8, border: `1px solid ${P.border}`, background: P.white,
                color: P.ink, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
              }}>Withdraw request</button>
              {onEdit && (
                <button onClick={() => { onEdit(req); close(); }} style={{
                  padding: '8px 20px', borderRadius: 8, border: `1px solid ${P.border}`, background: P.white,
                  color: P.ink, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                }}>Edit</button>
              )}
            </>}
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

function EmployeeCombobox({ value, onChange, employees, error, autoFocus }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const { rendered: listRendered, visible: listVisible } = usePopoverTransition(open);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);

  const selectedEmp = employees.find(([id]) => id === value)?.[1];

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(([, emp]) =>
      emp.name.toLowerCase().includes(q) || emp.department.toLowerCase().includes(q)
    );
  }, [query, employees]);

  React.useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.children;
    if (items[highlighted]) items[highlighted].scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  const handleSelect = (id) => { onChange(id); setQuery(''); setOpen(false); };
  const handleFocus = () => { setQuery(''); setOpen(true); setHighlighted(0); };
  const handleBlur = () => { setTimeout(() => { setOpen(false); setQuery(''); }, 150); };
  const handleKeyDown = (e) => {
    if (!open) { setOpen(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[highlighted]) handleSelect(filtered[highlighted][0]); }
    else if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7, padding: '8px 10px', borderRadius: 7,
        border: `1px solid ${error ? '#dc2626' : open ? P.borderStrong : P.border}`,
        background: P.white, boxSizing: 'border-box',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref={inputRef} autoFocus={autoFocus}
          value={open ? query : (selectedEmp?.name || '')}
          onChange={e => { setQuery(e.target.value); setHighlighted(0); if (!open) setOpen(true); if (!e.target.value) onChange(''); }}
          onFocus={handleFocus} onBlur={handleBlur} onKeyDown={handleKeyDown}
          placeholder="Search by name or department…"
          style={{ flex: 1, border: 'none', outline: 'none', padding: 0, fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink, background: 'transparent', minWidth: 0 }}
        />
        {value && !open ? (
          <button onMouseDown={e => { e.preventDefault(); onChange(''); inputRef.current?.focus(); }}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        )}
      </div>
      {listRendered && (
        <div ref={listRef} style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 400,
          background: P.white, borderRadius: 8, border: `1px solid ${P.border}`,
          boxShadow: '0 4px 20px rgba(15,13,40,0.12)', maxHeight: 220, overflowY: 'auto',
          ...popoverStyle(listVisible, 'top'),
        }}>
          {filtered.length > 0 ? filtered.map(([id, emp], idx) => (
            <div key={id} onMouseDown={() => handleSelect(id)} onMouseEnter={() => setHighlighted(idx)}
              style={{ padding: '8px 12px', cursor: 'pointer', background: idx === highlighted ? P.bg : 'transparent', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink, flex: 1 }}>{emp.name}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: P.inkFaint, flexShrink: 0 }}>{emp.department}</span>
            </div>
          )) : (
            <div style={{ padding: '14px 12px', fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkFaint, textAlign: 'center' }}>No employees found</div>
          )}
        </div>
      )}
    </div>
  );
}

function DateInput({ value, onChange, min, placeholder = 'Select date', borderColor }) {
  const ref = React.useRef(null);
  const fmt = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return new Date(+y, +m - 1, +d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };
  const open = () => { try { ref.current?.showPicker(); } catch(e) { ref.current?.focus(); } };
  return (
    <div onClick={open} style={{
      position: 'relative', display: 'flex', alignItems: 'center', gap: 7,
      padding: '8px 10px', borderRadius: 7, border: `1px solid ${borderColor || P.border}`,
      background: P.white, cursor: 'pointer', userSelect: 'none', minHeight: 36,
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={value ? P.inkSoft : P.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink, lineHeight: 1 }}>
        {value ? fmt(value) : placeholder}
      </span>
      <input
        ref={ref} type="date" value={value} min={min} onChange={onChange}
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, border: 'none', padding: 0, pointerEvents: 'none' }}
      />
    </div>
  );
}

// ── Half-day segmented picker ─────────────────────────────────────────────
const ADMIN_HALF_OPTS = ['full', 'am', 'pm'];
const ADMIN_HALF_LABELS = { full: 'Full', am: 'AM', pm: 'PM' };
function HalfDayPickerAdmin({ value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', padding: 3, background: '#EBEBED', borderRadius: 14, gap: 2 }}>
      {ADMIN_HALF_OPTS.map(opt => {
        const active = value === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            padding: '3px 10px', borderRadius: 11, border: 'none',
            background: active ? '#fff' : 'transparent',
            boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            fontFamily: 'var(--font-display)', fontWeight: active ? 700 : 500,
            fontSize: 11, color: active ? P.ink : P.inkSoft,
            cursor: 'pointer',
          }}>{ADMIN_HALF_LABELS[opt]}</button>
        );
      })}
    </div>
  );
}

// ── Inline calendar for date range picking ────────────────────────────────
function ModalCalendar({ startDate, endDate, focusedField, onDateTap, pickedDates, selectionMode, halfDay }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const initial = startDate || today;
  const [month, setMonth] = useState(initial.getMonth());
  const [year, setYear]   = useState(initial.getFullYear());
  const isPick = selectionMode === 'pick';
  const rangeBg = '#EAD6F7';

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
  const isInRange = (d) => !isPick && startDate && endDate && d > startDate && d < endDate;
  const isStart = (d) => !isPick && sameDay(d, startDate);
  const isEnd = (d) => !isPick && sameDay(d, endDate);
  const isPicked = (d) => isPick && pickedDates && pickedDates.has(isoDate(d));
  const isToday = (d) => sameDay(d, today);

  const findWork = (d, dir) => {
    for (let step = 1; step <= 4; step++) {
      const nd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + dir * step);
      if (!isWeekend(nd) && !isHoliday(nd) && !isCollective(nd)) return isoDate(nd);
    }
    return null;
  };

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
          const picked = isPicked(d);
          const selStart = isStart(d);
          const selEnd = isEnd(d);
          const sel = picked || selStart || selEnd;
          const inRange = isInRange(d) && !sel;
          const hasRange = !isPick && startDate && endDate && !sameDay(startDate, endDate);

          // Pick mode: adjacency + weekend bridging for range highlight
          let prevAdj = false, nextAdj = false, bridged = false;
          if (isPick) {
            const prevIso = isoDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
            const nextIso = isoDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
            if (picked) {
              const pw = findWork(d, -1);
              const nw = findWork(d, 1);
              prevAdj = !!(pickedDates.has(prevIso) || (pw && pw !== prevIso && pickedDates.has(pw)));
              nextAdj = !!(pickedDates.has(nextIso) || (nw && nw !== nextIso && pickedDates.has(nw)));
            }
            if (disabled && pickedDates) {
              const pw = findWork(d, -1);
              const nw = findWork(d, 1);
              bridged = !!(pw && nw && pickedDates.has(pw) && pickedDates.has(nw));
            }
          }
          const isMidRange = isPick && picked && prevAdj && nextAdj;

          const halfDayVal = isPick && picked && halfDay ? halfDay[isoDate(d)] : null;

          let btnBg = 'transparent';
          let color = P.ink;
          let fontWeight = 500;
          if (halfDayVal === 'am') {
            btnBg = `linear-gradient(to bottom, ${P.ink} 50%, rgba(15,13,40,0.45) 50%)`;
            color = '#fff'; fontWeight = 700;
          } else if (halfDayVal === 'pm') {
            btnBg = `linear-gradient(to bottom, rgba(15,13,40,0.45) 50%, ${P.ink} 50%)`;
            color = '#fff'; fontWeight = 700;
          } else if (isMidRange) { fontWeight = 700; }
          else if (sel) { btnBg = P.ink; color = '#fff'; fontWeight = 700; }
          else if (disabled) { color = '#c5c9d0'; }
          else if (inRange) { fontWeight = 600; }

          let wrapBg = 'transparent';
          if (isPick) {
            if (bridged) wrapBg = rangeBg;
            else if (picked) {
              if (prevAdj && nextAdj) wrapBg = rangeBg;
              else if (!prevAdj && nextAdj) wrapBg = `linear-gradient(to right, transparent 50%, ${rangeBg} 50%)`;
              else if (prevAdj && !nextAdj) wrapBg = `linear-gradient(to left, transparent 50%, ${rangeBg} 50%)`;
            }
          } else {
            if (inRange) wrapBg = rangeBg;
            else if (selStart && hasRange) wrapBg = `linear-gradient(to right, transparent 50%, ${rangeBg} 50%)`;
            else if (selEnd && hasRange) wrapBg = `linear-gradient(to left, transparent 50%, ${rangeBg} 50%)`;
          }

          return (
            <div key={isoDate(d)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: wrapBg }}>
              <button onClick={() => !disabled && onDateTap(d)} style={{
                width: 32, height: 32, border: 'none', background: btnBg,
                borderRadius: (sel && !isMidRange) || halfDayVal ? '50%' : 6, cursor: disabled ? 'default' : 'pointer',
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
function AddTimeOffModal({ existing, onClose, onSave, requests = [] }) {
  const isEdit = !!existing?.id;
  const lockEmployee = existing?._lockEmployee;
  const [empId, setEmpId]     = useState(existing?.employee || '');
  const [type, setType]       = useState(existing?.type || 'Time off');
  const [specialReason, setSpecialReason] = useState(existing?._specialReason || '');
  const [specialWho, setSpecialWho]       = useState(existing?._specialWho || '');
  const [note, setNote]       = useState(existing?.note || '');
  const [holidayName, setHolidayName] = useState(existing?.name || '');
  const [errors, setErrors] = useState({});
  const [halfDay, setHalfDay] = useState(existing?._halfDay || {});
  const [showEditSelection, setShowEditSelection] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [notifyEmployee, setNotifyEmployee] = useState(false);
  const [scope, setScope] = useState(existing?._isCompanyEvent ? 'collective' : 'one');
  const [rangeFrom, setRangeFrom] = useState(() => existing?.startDate ? (toISOInput(existing.startDate) || '') : '');
  const [rangeTo, setRangeTo]     = useState(() => existing ? (toISOInput(existing.endDate || existing.startDate) || '') : '');
  const [pickedDates, setPickedDates] = useState(() => {
    if (existing?._selectedDates) return new Set(existing._selectedDates);
    if (existing?.startDate) {
      const start = parseDisplayDate(existing.startDate);
      const end = parseDisplayDate(existing.endDate || existing.startDate);
      if (!start || !end) return new Set();
      const dates = new Set();
      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        if (d.getDay() !== 0 && d.getDay() !== 6 && !_holidaySet.has(isoDate(d)) && !_collectiveSet.has(isoDate(d))) {
          dates.add(isoDate(d));
        }
      }
      return dates;
    }
    return new Set();
  });
  const allEmployees = scope === 'collective';

  useEffect(() => {
    setAttachment(null);
    setNotifyEmployee(false);
    if (type !== 'Special leave') { setSpecialReason(''); setSpecialWho(''); }
  }, [type]);

  useEffect(() => { setSpecialWho(''); }, [specialReason]);

  useEffect(() => {
    if (!rangeFrom || !rangeTo) return;
    const from = new Date(rangeFrom + 'T00:00:00');
    const to   = new Date(rangeTo   + 'T00:00:00');
    if (from > to) return;
    const dates = new Set();
    let blockedByCollective = 0;
    let blockedByHoliday = 0;
    for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      if (_collectiveSet.has(isoDate(d))) { blockedByCollective++; continue; }
      if (_holidaySet.has(isoDate(d))) { blockedByHoliday++; continue; }
      dates.add(isoDate(d));
    }
    setPickedDates(dates);
    if (dates.size === 0 && (blockedByCollective > 0 || blockedByHoliday > 0)) {
      const reason = blockedByCollective > 0 ? 'collective closure days' : 'public holidays';
      setErrors(p => ({ ...p, dates: `This range only contains ${reason} — pick different dates` }));
    } else {
      setErrors(p => ({ ...p, dates: null }));
    }
  }, [rangeFrom, rangeTo]);

  const handleDateTap = (d) => {
    const iso = isoDate(d);
    if (pickedDates.has(iso)) {
      setPickedDates(prev => { const n = new Set(prev); n.delete(iso); return n; });
      setHalfDay(hd => { const c = { ...hd }; delete c[iso]; return c; });
    } else {
      setPickedDates(prev => new Set([...prev, iso]));
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

  const sortedPicked = [...pickedDates].sort();
  const startD = sortedPicked.length > 0 ? new Date(sortedPicked[0] + 'T00:00:00') : null;
  const endD = sortedPicked.length > 0 ? new Date(sortedPicked[sortedPicked.length - 1] + 'T00:00:00') : null;
  const halfDayDeduction = Object.entries(halfDay).filter(([iso, v]) => pickedDates.has(iso) && (v === 'am' || v === 'pm')).length * 0.5;
  const days = pickedDates.size - halfDayDeduction;

  const fmtDisplay = (d) => d ? d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '';

  const handleSave = () => {
    const errs = {};
    if (!allEmployees && !empId) errs.employee = 'Please select an employee';
    if (pickedDates.size === 0) errs.dates = 'Please select dates';
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
      ...(sortedPicked.length > 0 ? { _selectedDates: sortedPicked } : {}),
      ...(Object.keys(halfDay).length > 0 ? { _halfDay: halfDay } : {}),
      ...(type === 'Special leave' && specialReason ? { _specialReason: specialReason } : {}),
      ...(type === 'Special leave' && specialWho ? { _specialWho: specialWho } : {}),
    };
    if (allEmployees) {
      onSave({ ...base, id: existing?.id || `ce-${Date.now()}`, _isCompanyEvent: true, name: holidayName || type });
    } else {
      onSave({ ...base, id: existing?.id || `manual-${Date.now()}`, employee: empId });
    }
    close();
  };

  const empList = Object.entries(EMPLOYEES).sort((a, b) => a[1].name.localeCompare(b[1].name));

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 7, border: `1px solid ${P.border}`,
    fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink, outline: 'none', background: P.white,
  };

  const { visible, close } = useModalTransition(onClose);

  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close]);

  return (
    <div onClick={close} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(15,13,40,0.25)',
      ...modalBackdropStyle(visible),
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'absolute', top: 0, right: 0, height: '100%', width: 480,
        background: P.white,
        boxShadow: '-8px 0 40px rgba(15,13,40,0.15)',
        display: 'flex', flexDirection: 'column',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: `transform ${MODAL_CLOSE_DUR}ms ${EASE_OUT}`,
      }}>
        {/* Header */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${P.border}` }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: P.ink }}>
            {isEdit ? (allEmployees ? 'Edit company closure' : 'Edit time off') : (allEmployees ? 'Add company closure' : 'Add time off')}
          </span>
          <button onClick={close} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 6 }}>
            <Icon name="X" size={18} color={P.inkSoft} />
          </button>
        </div>

        {/* Form — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Scope selector */}
          {!lockEmployee && !isEdit && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['one', 'One employee', 'User', 'Choose a specific person'],
                ['collective', 'All employees', 'Users', 'Apply to your entire team'],
              ].map(([val, label, icon, sublabel]) => {
                const active = scope === val;
                return (
                  <button key={val} onClick={() => setScope(val)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${active ? P.ink : P.border}`,
                    background: active ? P.bg : P.white,
                    transition: 'border-color 120ms, background 120ms',
                  }}>
                    <Icon name={icon} size={14} color={active ? P.ink : P.inkSoft} strokeWidth={2} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.ink }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: P.inkSoft, lineHeight: 1.3 }}>{sublabel}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Employee / Holiday name — same slot, same height, no jump */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.inkSoft, marginBottom: 6 }}>
              {scope === 'collective' ? 'Reason' : 'Employee'}
            </label>
            {scope === 'collective' ? (
              <input value={holidayName} onChange={e => setHolidayName(e.target.value)} placeholder="e.g. Belgian National Day" style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            ) : (lockEmployee || isEdit) ? (
              <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', background: '#f7f8f7', color: P.ink }}>
                {EMPLOYEES[empId]?.name || empId}
              </div>
            ) : (
              <EmployeeCombobox
                value={empId}
                onChange={(id) => { setEmpId(id); setErrors(p => ({...p, employee: null})); }}
                employees={empList}
                error={errors.employee}
                autoFocus={false}
              />
            )}
            {errors.employee && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#dc2626', marginTop: 4 }}>{errors.employee}</div>}
          </div>

          {/* Leave type — hidden for collective holidays */}
          {!allEmployees && (
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.inkSoft, marginBottom: 6 }}>Leave type</label>
              <SelectField value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {ALL_LEAVE_TYPES.map(t => (
                  <option key={t} value={t}>{t}{ADMIN_ONLY_TYPES.has(t) ? ' (Admin)' : ''}</option>
                ))}
              </SelectField>
            </div>
          )}

          {/* Special leave cascading selects */}
          {!allEmployees && type === 'Special leave' && (() => {
            const reasonObj = SPECIAL_LEAVE_REASONS.find(r => r.id === specialReason);
            const whoList = specialReason === 'wedding' ? SPECIAL_WEDDING_WHO : specialReason === 'funeral' ? SPECIAL_FUNERAL_WHO : [];
            const whoObj = whoList.find(w => w.id === specialWho);

            // Compute entitlement note
            let entitlementNote = null;
            if (reasonObj && !reasonObj.hasWho) entitlementNote = `Legal entitlement: ${reasonObj.entitlement}`;
            else if (whoObj) {
              entitlementNote = `Legal entitlement: ${whoObj.days} day${whoObj.days !== 1 ? 's' : ''}${whoObj.note ? ` — ${whoObj.note}` : ''}`;
            }

            return (
              <>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.inkSoft, marginBottom: 6 }}>Reason</label>
                  <SelectField value={specialReason} onChange={e => setSpecialReason(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select a reason…</option>
                    {SPECIAL_LEAVE_REASONS.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </SelectField>
                </div>

                {reasonObj?.hasWho && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.inkSoft, marginBottom: 6 }}>
                      {specialReason === 'wedding' ? 'Wedding type' : 'Relationship to deceased'}
                    </label>
                    <SelectField value={specialWho} onChange={e => setSpecialWho(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">Select…</option>
                      {whoList.map(w => (
                        <option key={w.id} value={w.id}>{w.label}</option>
                      ))}
                    </SelectField>
                    {entitlementNote && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '8px 10px', borderRadius: 7, background: P.bg, border: `1px solid ${P.border}` }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.inkSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, lineHeight: 1.4 }}>{entitlementNote}</span>
                      </div>
                    )}
                  </div>
                )}

                {!reasonObj?.hasWho && entitlementNote && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, padding: '8px 10px', borderRadius: 7, background: P.bg, border: `1px solid ${P.border}` }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.inkSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, lineHeight: 1.4 }}>{entitlementNote}</span>
                  </div>
                )}
              </>
            );
          })()}


          {/* Date range inputs */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.inkSoft, marginBottom: 6 }}>Dates</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>From</div>
                <DateInput value={rangeFrom} placeholder="Start date" borderColor={errors.dates ? '#dc2626' : P.border} onChange={e => { setRangeFrom(e.target.value); if (rangeTo && e.target.value > rangeTo) setRangeTo(e.target.value); }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.04em' }}>To</div>
                <DateInput value={rangeTo} placeholder="End date" min={rangeFrom || undefined} borderColor={errors.dates ? '#dc2626' : P.border} onChange={e => { setRangeTo(e.target.value); }} />
              </div>
            </div>
            {errors.dates && <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#dc2626', marginTop: 4 }}>{errors.dates}</div>}
          </div>

          {/* Duration + edit selection */}
          {pickedDates.size > 0 && (
            <div style={{ borderRadius: 8, overflow: 'hidden', background: P.bg, border: `1px solid ${P.border}` }}>
              <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="CalendarDays" size={13} color={P.inkSoft} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, flex: 1 }}>
                  {days === 0.5 ? '½ working day' : days === 1 ? '1 working day' : `${days} working days`}
                  {startD && endD && startD.getTime() !== endD.getTime() && (
                    <span style={{ color: P.inkFaint }}> · {fmtDisplay(startD)} – {fmtDisplay(endD)}</span>
                  )}
                </span>
                <button onClick={() => setShowEditSelection(v => !v)} style={{
                  border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: P.ink,
                  textDecoration: 'underline', textUnderlineOffset: 2,
                }}>
                  {showEditSelection ? 'Done' : 'Edit days'}
                </button>
              </div>
              {showEditSelection && (
                <div style={{ borderTop: `1px solid ${P.border}`, padding: '0 12px' }}>
                  {sortedPicked.map((iso, idx) => {
                    const p = iso.split('-');
                    const d = new Date(+p[0], +p[1]-1, +p[2]);
                    const label = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
                    const hv = halfDay[iso] || 'full';
                    const isLast = idx === sortedPicked.length - 1;
                    return (
                      <div key={iso} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: isLast ? 'none' : `1px solid ${P.border}` }}>
                        <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: P.ink }}>{label}</span>
                        <HalfDayPickerAdmin value={hv} onChange={(v) => setHalfDay(hd => {
                          const c = { ...hd };
                          if (v === 'full') delete c[iso]; else c[iso] = v;
                          return c;
                        })} />
                        <button onClick={() => handleDateTap(d)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', lineHeight: 1 }}>
                          <Icon name="Trash2" size={13} color={P.inkSoft} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Note — always shown */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.inkSoft, marginBottom: 6 }}>Notes <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder={scope === 'collective' ? 'e.g. Replacement for Christmas Day which fell on a Sunday…' : 'Reason or additional context…'} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
          </div>

          {/* Document upload + notify toggle — non-blocking */}
          {(() => {
            const rule = ATTACHMENT_RULES[type];
            if (!rule) return null;
            return (
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.inkSoft, marginBottom: 6 }}>{rule.label}</label>
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
                {!attachment && (
                  <div onClick={() => setNotifyEmployee(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, padding: '10px 12px', borderRadius: 8, border: `1px solid ${P.border}`, background: P.bg, cursor: 'pointer', userSelect: 'none' }}>
                    <Switch checked={notifyEmployee} size="sm" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink }}>Request {rule.label.toLowerCase()} from employee</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: P.inkSoft, marginTop: 2 }}>Sends an email asking the employee to upload the document</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Footer — pinned */}
        <div style={{ flexShrink: 0, padding: '14px 24px', borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={close} style={{
            padding: '8px 18px', borderRadius: 8, border: `1px solid ${P.borderStrong}`, background: 'transparent',
            color: P.ink, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
          }}>Cancel</button>
          <div style={{ flex: 1 }} />
          <button onClick={handleSave} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: P.ink, color: '#fff', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
          }}>{isEdit ? (allEmployees ? 'Save closure' : 'Save changes') : (allEmployees ? 'Add closure' : 'Confirm absence')}</button>
        </div>
      </div>
    </div>
  );
}

// ── Table row ──────────────────────────────────────────────────────────────
const TH = ({ children, style }) => (
  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em', ...style }}>{children}</div>
);

function RequestRow({ req, requests, onApprove, onDecline, onDetail, onEdit, onCancel, selected, onToggle }) {
  const emp = EMPLOYEES[req.employee] || { name: req.employee, initials: '?', color: '#e5e7eb', entitlement: 20 };
  const [hover, setHover] = useState(false);
  const usedDays = requests
    .filter(r => r.employee === req.employee && r.id !== req.id && (r.status === 'approved' || r.status === 'pending'))
    .reduce((s, r) => s + r.days, 0);
  const remaining = Math.max(0, emp.entitlement - usedDays - req.days);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => onDetail(req)}
      style={{
        display: 'grid', gridTemplateColumns: '32px 1.8fr 1fr 0.9fr 0.7fr 0.7fr 1fr 0.7fr 0.9fr 44px',
        alignItems: 'center', gap: 12, padding: '0 20px', height: 52,
        borderBottom: `1px solid ${P.border}`, background: selected ? '#f5f3ff' : hover ? P.bg : P.white,
        cursor: 'pointer', transition: 'background 0.1s',
      }}>
      <input type="checkbox" checked={selected} onClick={e => e.stopPropagation()} onChange={() => onToggle(req.id)} style={{ cursor: 'pointer', accentColor: P.ink }} />
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
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, textAlign: 'center',
        color: remaining < 0 ? '#b91c1c' : remaining <= 3 ? '#f59e0b' : '#166534',
      }}>
        {remaining}d
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
  const [selected, setSelected] = useState(new Set());
  const [searchText, setSearchText] = useState('');
  const [leaveFilter, setLeaveFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const filtered = (tab === 'pending' ? requests.filter(r => r.status === 'pending')
    : tab === 'approved' ? requests.filter(r => r.status === 'approved') : requests)
    .filter(r => {
      const emp = EMPLOYEES[r.employee];
      if (searchText.trim() && !(emp?.name || r.employee).toLowerCase().includes(searchText.trim().toLowerCase())) return false;
      if (leaveFilter !== 'all' && r.type !== leaveFilter) return false;
      if (deptFilter !== 'all' && emp?.department !== deptFilter) return false;
      return true;
    });
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const toggleSelect = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(r => r.id)));
  };
  const selectedPending = [...selected].filter(id => requests.find(r => r.id === id)?.status === 'pending');
  const [tabsRef, tabRect, tabAnimate] = useSlidingIndicator(tab);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: '28px 28px 0', background: P.white, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Time off requests</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, margin: '4px 0 0' }}>Manage your team's time off</p>
          </div>
          <button onClick={() => setAddOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, border: 'none', background: P.ink, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>
            <Icon name="Plus" size={14} color="#fff" strokeWidth={2.5} /> Add time off
          </button>
        </div>
        <div ref={tabsRef} style={{ display: 'flex', gap: 0, position: 'relative' }}>
          {[['pending', 'All pending requests'], ['approved', 'Approved'], ['all', 'All requests']].map(([val, label]) => (
            <button key={val} data-key={val} onClick={() => { setTab(val); setSelected(new Set()); }} style={{
              padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: tab === val ? 700 : 500, fontSize: 13, color: tab === val ? P.ink : P.inkSoft,
              marginBottom: -1,
            }}>{label}{val === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}</button>
          ))}
          <div style={{
            position: 'absolute', bottom: -1, height: 2, background: P.ink, borderRadius: 1,
            left: tabRect.left, width: tabRect.width,
            transition: tabAnimate ? `left 250ms ${EASE_OUT}, width 250ms ${EASE_OUT}` : 'none',
          }} />
        </div>
      </div>
      <div style={{ background: P.white, borderBottom: `1px solid ${P.border}` }}>
        <FilterToolbar
          searchText={searchText} onSearch={setSearchText}
          leaveFilter={leaveFilter} onLeaveFilter={setLeaveFilter}
          deptFilter={deptFilter} onDeptFilter={setDeptFilter}
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', background: P.white, position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '32px 1.8fr 1fr 0.9fr 0.7fr 0.7fr 1fr 0.7fr 0.9fr 44px', alignItems: 'center', gap: 12, padding: '0 20px', height: 38, borderBottom: `1px solid ${P.border}`, background: P.bg, position: 'sticky', top: 0, zIndex: 5 }}>
          <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ cursor: 'pointer', accentColor: P.ink }} />
          <TH>Requested by</TH><TH>Status</TH><TH>Leave type</TH><TH>Duration</TH><TH>Date from</TH><TH>Date to</TH><TH style={{ textAlign: 'center' }}>Balance</TH><TH>Added on</TH><div />
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <Icon name="Inbox" size={32} color={P.border} style={{ marginBottom: 12 }} />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.inkFaint }}>No {tab === 'pending' ? 'pending ' : tab === 'approved' ? 'approved ' : ''}requests</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkFaint, marginTop: 4 }}>{tab === 'pending' ? 'New requests from your team will appear here.' : ''}</div>
          </div>
        ) : filtered.map(req => (
          <RequestRow key={req.id} req={req} requests={requests} onApprove={onApprove} onDecline={onDecline} onDetail={setDetail} onEdit={setEditReq} onCancel={onCancel} selected={selected.has(req.id)} onToggle={toggleSelect} />
        ))}
        {filtered.length > 0 && (
          <div style={{ padding: '10px 20px', fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkFaint }}>{filtered.length} {filtered.length === 1 ? 'record' : 'records'}</div>
        )}
        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div style={{
            position: 'sticky', bottom: 16, left: 0, right: 0,
            margin: '0 20px',
            background: P.ink, borderRadius: 12, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 8px 32px rgba(15,13,40,0.25)',
            animation: 'fadeUp 0.15s ease-out',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: '#fff' }}>
              {selected.size} selected
            </span>
            <div style={{ flex: 1 }} />
            {selectedPending.length > 0 && (
              <button onClick={() => { selectedPending.forEach(id => onApprove(id)); setSelected(new Set()); }} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 8, border: 'none',
                background: '#22c55e', color: '#fff', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
              }}>
                <Icon name="CheckCircle" size={13} color="#fff" strokeWidth={2} />
                Approve {selectedPending.length > 1 ? `all ${selectedPending.length}` : ''}
              </button>
            )}
            <button onClick={() => setSelected(new Set())} style={{
              padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.25)',
              background: 'transparent', color: '#fff', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
            }}>Cancel</button>
          </div>
        )}
      </div>
      {detail && (
        <DetailModal req={detail} requests={requests} onClose={() => setDetail(null)}
          onApprove={(id) => { onApprove(id); setDetail(prev => prev && prev.id === id ? { ...prev, status: 'approved' } : prev); }}
          onDecline={(id) => onDecline(id)}
          onCancel={(id) => { onCancel(id); setDetail(null); }}
          onEdit={(r) => { setDetail(null); setEditReq(r); }}
        />
      )}
      {(addOpen || editReq) && (
        <AddTimeOffModal
          existing={editReq || null}
          requests={requests}
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
    if (!map[req.employee]) map[req.employee] = {};
    if (req._selectedDates && req._selectedDates.length > 0) {
      for (const iso of req._selectedDates) {
        if (!map[req.employee][iso]) {
          map[req.employee][iso] = { type: req.type, status: req.status, requestId: req.id };
        }
      }
    } else {
      const start = parseDisplayDate(req.startDate);
      const end   = parseDisplayDate(req.endDate) || start;
      if (!start) continue;
      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        const iso = isoDate(d);
        if (!map[req.employee][iso]) {
          map[req.employee][iso] = { type: req.type, status: req.status, requestId: req.id };
        }
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
const LEAVE_FILTER_OPTS = [['all', 'All time-off types'], ['Time off', 'Time off'], ['ADV / RTT', 'ADV / RTT'], ['Extra-legal leave', 'Extra-legal leave'], ['Sick leave', 'Sick leave'], ['Special leave', 'Special leave']];

function FilterDropdown({ label, active, opts, onSelect, minWidth }) {
  const [open, setOpen] = useState(false);
  const { rendered: menuRendered, visible: menuVisible } = usePopoverTransition(open);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  const isFiltered = active !== opts[0][0];
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '8px 11px', borderRadius: 7,
        border: `1px solid ${isFiltered ? P.ink : P.border}`,
        background: P.white, color: P.ink,
        cursor: 'pointer', fontFamily: 'var(--font-display)',
        fontWeight: isFiltered ? 700 : 500, fontSize: 12,
      }}>
        {opts.find(([v]) => v === active)?.[1] ?? label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {menuRendered && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
          background: P.white, border: `1px solid ${P.border}`, borderRadius: 8,
          boxShadow: '0 4px 16px rgba(15,13,40,0.10)', minWidth: minWidth || 160, overflow: 'hidden',
          ...popoverStyle(menuVisible, 'top left'),
        }}>
          {opts.map(([val, lbl]) => (
            <button key={val} onClick={() => { onSelect(val); setOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 12px', border: 'none', cursor: 'pointer',
              background: active === val ? '#f4f5f7' : 'transparent',
              fontFamily: 'var(--font-display)', fontWeight: active === val ? 700 : 500,
              fontSize: 13, color: P.ink,
            }}>{lbl}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterToolbar({ searchText, onSearch, leaveFilter, onLeaveFilter, deptFilter, onDeptFilter }) {
  const deptOpts = [['all', 'All departments'], ...DEPARTMENTS.map(d => [d, d])];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px' }}>
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, border: `1px solid ${P.border}`, borderRadius: 7, padding: '8px 12px', width: 240, background: P.white }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={searchText} onChange={e => onSearch(e.target.value)} placeholder="Search employee" style={{
          border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 12, color: P.ink, width: '100%',
        }} />
      </div>
      <FilterDropdown label="All time-off types" active={leaveFilter} opts={LEAVE_FILTER_OPTS} onSelect={onLeaveFilter} minWidth={170} />
      <FilterDropdown label="All departments" active={deptFilter} opts={deptOpts} onSelect={onDeptFilter} minWidth={160} />
    </div>
  );
}

// ── Team absences screen ───────────────────────────────────────────────────
function TeamAbsencesScreen({ requests, pendingCount, onNav, onShowDetail, onSave, companyEvents = [], onCancelCompanyEvent }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const todayISO = isoDate(today);

  // State
  const [viewMode, setViewMode] = useState('week');
  const [viewModeRef, viewModeRect, viewModeAnimate] = useSlidingIndicator(viewMode);
  const [refDate, setRefDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeDepts, setActiveDepts] = useState(() => new Set(DEPARTMENTS));
  const [leaveFilter, setLeaveFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [expandedDepts, setExpandedDepts] = useState(() => new Set(DEPARTMENTS));
  const [tooltip, setTooltip] = useState(null);
  const [tooltipRendered, setTooltipRendered] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [absencesOnly, setAbsencesOnly] = useState(false);
  const [closureDetail, setClosureDetail] = useState(null);
  const [closureEditOpen, setClosureEditOpen] = useState(null);
  const tooltipTimerRef = useRef(null);
  const tooltipReqIdRef = useRef(null);

  // Keeps the last non-null tooltip content mounted while it fades out, and
  // lets left/top glide via CSS transition when hopping between adjacent
  // bars — instead of the old keyframe `animation` that only played once and
  // then snapped position on every reposition.
  useEffect(() => {
    if (tooltip) { setTooltipRendered(tooltip); return; }
    const t = setTimeout(() => setTooltipRendered(null), 120);
    return () => clearTimeout(t);
  }, [tooltip]);

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

  // Build dynamic closure set from company events
  const closureSet = useMemo(() => {
    const set = new Set(_collectiveSet);
    for (const ev of companyEvents) {
      for (const iso of (ev._selectedDates || [])) set.add(iso);
    }
    return set;
  }, [companyEvents]);
  const closureByDate = useMemo(() => {
    const map = {};
    for (const ev of companyEvents) {
      for (const iso of (ev._selectedDates || [])) map[iso] = ev;
    }
    return map;
  }, [companyEvents]);

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
      if (deptFilter !== 'all' && emp.department !== deptFilter) return false;
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
  }, [searchText, activeDepts, deptFilter, absencesOnly, dayISOs, absenceMap, leaveFilter]);

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
      <div style={{ padding: '40px 28px', background: P.white, borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Team absences</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, margin: '4px 0 0' }}>Track and plan team availability</p>
        </div>
        <button onClick={() => setAddOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 8, border: 'none',
          background: P.ink, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
        }}>
          <Icon name="Plus" size={14} color="#fff" strokeWidth={2.5} /> Add time off
        </button>
      </div>

      {/* Filter toolbar — full width */}
      <FilterToolbar
        searchText={searchText} onSearch={setSearchText}
        leaveFilter={leaveFilter} onLeaveFilter={setLeaveFilter}
        deptFilter={deptFilter} onDeptFilter={setDeptFilter}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', alignItems: 'flex-start' }}>
        {/* Left: calendar area */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Calendar card */}
          <div style={{ maxHeight: 'calc(100vh - 200px)', margin: '0 20px 20px', background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
            {/* Calendar nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: `1px solid ${P.border}`, flexShrink: 0, position: 'relative' }}>
              {/* Left group: Today, nav arrows, date label, Week/Month */}
              <button onClick={goToday} style={{
                padding: '6px 14px', borderRadius: 7, border: `1px solid ${P.border}`,
                background: 'transparent', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.inkSoft,
              }}>Today</button>
              <button onClick={() => step(-1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button onClick={() => setMonthPickerOpen(o => !o)} style={{
                border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 6px', borderRadius: 6,
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: P.ink,
                minWidth: 160, textAlign: 'center',
              }}>{monthLabel}</button>
              <button onClick={() => step(1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <div ref={viewModeRef} style={{ display: 'flex', border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden', marginLeft: 4, position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, background: P.ink,
                  left: viewModeRect.left, width: viewModeRect.width,
                  transition: viewModeAnimate ? `left 250ms ${EASE_OUT}, width 250ms ${EASE_OUT}` : 'none',
                }} />
                {[['week', 'Week'], ['month', 'Month']].map(([val, label]) => (
                  <button key={val} data-key={val} onClick={() => setViewMode(val)} style={{
                    position: 'relative', padding: '6px 14px', border: 'none', cursor: 'pointer', background: 'transparent',
                    fontFamily: 'var(--font-display)', fontWeight: viewMode === val ? 700 : 500,
                    fontSize: 13, color: viewMode === val ? '#fff' : P.ink,
                    transition: `color 150ms ${EASE_OUT}`,
                  }}>{label}</button>
                ))}
              </div>

              <div style={{ flex: 1 }} />

              {/* Right: Absences only toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 12, color: P.inkSoft }}>Absences only</span>
                <Switch checked={absencesOnly} onChange={() => setAbsencesOnly(v => !v)} />
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
                  const isCollective = closureSet.has(iso);
                  const closureEv = closureByDate[iso];
                  return (
                    <div key={i} onClick={closureEv ? () => setClosureDetail(closureEv) : undefined} style={{
                      padding: '6px 0', textAlign: 'center',
                      background: isCollective ? '#faf6eb' : isHoliday ? '#f3f1fe' : isWknd ? '#fafafa' : 'transparent',
                      borderLeft: `1px solid ${P.border}`,
                      cursor: closureEv ? 'pointer' : undefined,
                    }} title={isHoliday ? BELGIAN_HOLIDAY_NAMES[iso] : closureEv ? (closureEv.name || 'Company closure') : isCollective ? 'Company closed' : ''}>
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
                          {closureEv ? 'Closed' : isCollective ? 'Closed' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>


              {/* Employee rows */}
              {filteredEmployees.map(([empId, emp], empIdx) => {
                const employees = [[empId, emp]];
                return (
                  <React.Fragment key={empId}>
                    {employees.map(([empId, emp], empIdx) => (
                      <div key={empId} style={{ display: 'grid', gridTemplateColumns: gridCols, borderBottom: `1px solid ${P.border}`, height: viewMode === 'week' ? 64 : 36 }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8, overflow: 'hidden' }}>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: viewMode === 'week' ? 12 : 11, fontWeight: viewMode === 'week' ? 500 : 400, color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {viewMode === 'week' ? emp.name : emp.name.split(' ')[0]}
                            </div>
                          </div>
                        </div>
                        {dayISOs.map((iso, i) => {
                          const d = days[i];
                          const isWknd = d.getDay() === 0 || d.getDay() === 6;
                          const isHoliday = _holidaySet.has(iso);
                          const isCollective = closureSet.has(iso);
                          const entry = absenceMap[empId]?.[iso];
                          const show = entry && (leaveFilter === 'all' || entry.type === leaveFilter);
                          const barColor = show ? (LEAVE_COLORS[entry.type] || '#2563eb') : null;
                          const isPending = show && entry.status === 'pending';

                          // Connected bar styling
                          const prevEntry = absenceMap[empId]?.[dayISOs[i - 1]];
                          const nextEntry = absenceMap[empId]?.[dayISOs[i + 1]];
                          const isStart = show && (!prevEntry || prevEntry.requestId !== entry.requestId);
                          const isEnd = show && (!nextEntry || nextEntry.requestId !== entry.requestId);
                          const isWeekCard = viewMode === 'week' && isStart;
                          const pt = viewMode === 'week' ? 8 : 3;
                          const pad = viewMode === 'week' ? 6 : 3;

                          const closureEv = closureByDate[iso];
                          const cellClickable = !show && closureEv;

                          return (
                            <div key={iso}
                              onMouseEnter={cellClickable ? (e) => {
                                clearTimeout(tooltipTimerRef.current);
                                const key = 'closure-' + closureEv.id;
                                if (tooltipReqIdRef.current !== key) {
                                  tooltipReqIdRef.current = key;
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setTooltip({ closure: closureEv, x: rect.left + rect.width / 2, y: rect.top - 4 });
                                }
                              } : undefined}
                              onMouseLeave={cellClickable ? () => {
                                tooltipTimerRef.current = setTimeout(() => { tooltipReqIdRef.current = null; setTooltip(null); }, 80);
                              } : undefined}
                              onClick={cellClickable ? () => setClosureDetail(closureEv) : undefined}
                              style={{
                              borderLeft: `1px solid ${P.border}`,
                              background: isCollective ? '#faf6eb' : isHoliday ? '#f3f1fe' : isWknd ? '#fafafa' : 'transparent',
                              display: 'flex', alignItems: 'stretch',
                              paddingTop: pt, paddingBottom: pt,
                              paddingLeft: isStart ? pad : 0,
                              paddingRight: isEnd ? pad : 0,
                              cursor: cellClickable ? 'pointer' : undefined,
                            }}>
                              {show && (
                                <div
                                  onMouseEnter={(e) => {
                                    clearTimeout(tooltipTimerRef.current);
                                    if (tooltipReqIdRef.current !== entry.requestId) {
                                      tooltipReqIdRef.current = entry.requestId;
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const found = requests.find(function(rr) { return rr.id === entry.requestId; });
                                      if (found) setTooltip({ req: found, x: rect.left + rect.width / 2, y: rect.top - 4 });
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    tooltipTimerRef.current = setTimeout(() => {
                                      tooltipReqIdRef.current = null;
                                      setTooltip(null);
                                    }, 80);
                                  }}
                                  onClick={() => {
                                    const found = requests.find(function(rr) { return rr.id === entry.requestId; });
                                    if (found && onShowDetail) onShowDetail(found);
                                  }}
                                  style={{
                                    width: '100%',
                                    borderRadius: isStart && isEnd ? 5 : isStart ? '5px 0 0 5px' : isEnd ? '0 5px 5px 0' : 0,
                                    background: barColor,
                                    borderTop: isPending ? `1.5px dashed ${LEAVE_BORDER_COLORS[entry.type] || '#999'}` : 'none',
                                    borderBottom: isPending ? `1.5px dashed ${LEAVE_BORDER_COLORS[entry.type] || '#999'}` : 'none',
                                    borderLeft: isPending && isStart ? `1.5px dashed ${LEAVE_BORDER_COLORS[entry.type] || '#999'}` : 'none',
                                    borderRight: isPending && isEnd ? `1.5px dashed ${LEAVE_BORDER_COLORS[entry.type] || '#999'}` : 'none',
                                    cursor: 'pointer',
                                    padding: isWeekCard ? '5px 8px' : 0,
                                    display: isWeekCard ? 'flex' : 'block',
                                    flexDirection: isWeekCard ? 'column' : undefined,
                                    justifyContent: isWeekCard ? 'center' : undefined,
                                    gap: isWeekCard ? 2 : undefined,
                                    overflow: isWeekCard ? 'hidden' : undefined,
                                  }}
                                >
                                  {isWeekCard && (
                                    <WeekCard entry={entry} requestId={entry.requestId} requests={requests} isPending={isPending} />
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Tooltip */}
            {tooltipRendered && (
              <div style={{
                position: 'fixed', left: tooltipRendered.x, top: tooltipRendered.y - 8,
                transform: 'translate(-50%, -100%)', zIndex: 100,
                background: P.ink, color: '#fff', padding: '8px 12px', borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                fontFamily: 'var(--font-body)', fontSize: 11, lineHeight: 1.5,
                pointerEvents: 'none', whiteSpace: 'nowrap',
                opacity: tooltip ? 1 : 0,
                transition: `opacity 120ms ${EASE_OUT}, left 120ms ${EASE_OUT}, top 120ms ${EASE_OUT}`,
              }}>
                {tooltipRendered.closure ? (
                  <>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 2 }}>{tooltipRendered.closure.name || 'Company closure'}</div>
                    <div>{tooltipRendered.closure.startDate}{tooltipRendered.closure.startDate !== tooltipRendered.closure.endDate ? ` – ${tooltipRendered.closure.endDate}` : ''} · {tooltipRendered.closure.days} {tooltipRendered.closure.days === 1 ? 'day' : 'days'}</div>
                    <div style={{ color: '#fde68a' }}>All employees</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 2 }}>
                      {(EMPLOYEES[tooltipRendered.req.employee] || {}).name || tooltipRendered.req.employee}
                    </div>
                    <div>{tooltipRendered.req.type} · {tooltipRendered.req.days} {tooltipRendered.req.days === 1 ? 'day' : 'days'}</div>
                    <div>{tooltipRendered.req.startDate}{tooltipRendered.req.startDate !== tooltipRendered.req.endDate ? ` – ${tooltipRendered.req.endDate}` : ''}</div>
                    <div style={{ color: tooltipRendered.req.status === 'pending' ? '#fbbf24' : '#86efac' }}>
                      {tooltipRendered.req.status === 'pending' ? 'Pending approval' : 'Approved'}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
      {addOpen && (
        <AddTimeOffModal existing={null} requests={requests} onClose={() => setAddOpen(false)} onSave={(req) => { onSave(req); setAddOpen(false); }} />
      )}

      {closureDetail && (
        <div onClick={() => setClosureDetail(null)} style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(15,13,40,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: P.white, borderRadius: 14, width: 420,
            boxShadow: '0 8px 40px rgba(15,13,40,0.18)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${P.border}` }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>Company closure</span>
              <button onClick={() => setClosureDetail(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}>
                <Icon name="X" size={18} color={P.inkSoft} />
              </button>
            </div>
            <div style={{ padding: '6px 0' }}>
              {[
                { label: 'Name', value: closureDetail.name || closureDetail.type },
                { label: 'When', value: <span>{closureDetail.startDate}{closureDetail.startDate !== closureDetail.endDate ? ` – ${closureDetail.endDate}` : ''}<br /><span style={{ color: P.inkSoft, fontSize: 12 }}>{closureDetail.days} {closureDetail.days === 1 ? 'day' : 'days'}</span></span> },
                { label: 'Applies to', value: 'All employees' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', padding: '11px 22px', borderBottom: `1px solid ${P.border}`, alignItems: 'start', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, paddingTop: 1 }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 22px', borderTop: `1px solid ${P.border}` }}>
              <button onClick={() => { const ev = closureDetail; setClosureDetail(null); setClosureEditOpen(ev); }} style={{
                padding: '8px 20px', borderRadius: 8, border: `1px solid ${P.border}`,
                background: P.white, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.ink,
              }}>Edit</button>
              <button onClick={() => { onCancelCompanyEvent(closureDetail.id); setClosureDetail(null); }} style={{
                padding: '8px 20px', borderRadius: 8, border: '1px solid #fca5a5',
                background: '#fef2f2', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: '#dc2626',
              }}>Cancel closure</button>
            </div>
          </div>
        </div>
      )}

      {closureEditOpen && (
        <AddTimeOffModal
          existing={closureEditOpen}
          requests={requests}
          onClose={() => setClosureEditOpen(null)}
          onSave={(req) => { onSave(req); setClosureEditOpen(null); }}
        />
      )}
    </div>
  );
}

function fmtBudget(n) {
  return n.toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' EUR';
}

function EmployeeRow({ emp, onNav }) {
  const [hover, setHover] = useState(false);
  return (
    <tr
      onClick={() => onNav('employee-detail:' + emp.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ borderBottom: `1px solid ${P.border}`, cursor: 'pointer', background: hover ? '#f7f8f7' : 'transparent', transition: `background 120ms ${EASE_OUT}` }}>
      <td style={{ padding: '10px 16px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.ink }}>{emp.name}</span>
      </td>
      <td style={{ padding: '10px 16px', color: P.inkSoft }}>{emp.email}</td>
      <td style={{ padding: '10px 16px', color: P.inkSoft }}>{emp.entity}</td>
      <td style={{ padding: '10px 16px', textAlign: 'right', color: P.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{fmtBudget(emp.budget)}</td>
      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: P.inkSoft }}>
          See details
        </span>
      </td>
    </tr>
  );
}

// ── Employees screen ──────────────────────────────────────────────────────
function EmployeesScreen({ requests, onNav }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');

  const empList = useMemo(() => {
    return Object.entries(EMPLOYEES).map(([id, emp]) => ({ id, ...emp }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filtered = useMemo(() => {
    return empList.filter(e => {
      if (roleFilter !== 'All' && e.role !== roleFilter) return false;
      if (statusFilter !== 'All' && e.status !== statusFilter) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [empList, search, roleFilter, statusFilter]);

  const selectStyle = { padding: '7px 28px 7px 10px', border: `1px solid ${P.border}`, borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink, background: P.white, cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <div style={{ padding: '28px 28px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Employees</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkFaint, margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Overview</p>
          </div>
          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: `1px solid ${P.border}`, borderRadius: 8, background: P.white, color: P.ink, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <Icon name="Mail" size={14} /> Invite users
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: `1px solid ${P.border}`, borderRadius: 8, background: P.white, color: P.ink, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <Icon name="Settings2" size={14} /> Bulk actions
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: 'none', borderRadius: 8, background: P.ink, color: P.white, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Icon name="Plus" size={14} /> Add a user
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 220 }}>
            <Icon name="Search" size={14} color={P.inkFaint} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name"
              style={{ width: '100%', padding: '7px 10px 7px 32px', border: `1px solid ${P.border}`, borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink, outline: 'none', background: P.white }} />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={selectStyle}>
            <option value="All">Role: All</option>
            <option value="Employee">Role: Employee</option>
            <option value="Manager">Role: Manager</option>
            <option value="Admin">Role: Admin</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="All">Status: All</option>
            <option value="Active">Status: Active</option>
            <option value="Inactive">Status: Inactive</option>
          </select>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 24px 24px' }}>
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>User name</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Entity</th>
                <th style={{ textAlign: 'right', padding: '10px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Budget balance</th>
                <th style={{ textAlign: 'right', padding: '10px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <EmployeeRow key={emp.id} emp={emp} onNav={onNav} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Edit balances modal ────────────────────────────────────────────────────
const BALANCE_SECTIONS = [
  {
    label: 'Set by you',
    types: ['Time off', 'ADV / RTT', 'Extra-legal leave'],
    editable: true,
  },
  {
    label: 'Set by law',
    types: ['Sick leave', 'Special leave'],
    editable: false,
    badge: 'Belgian law',
    defaults: { 'Sick leave': 30, 'Special leave': null },
  },
];

function EditBalancesModal({ emp, balances, onSave, onClose, isNewEmployee, onConfirm }) {
  const [values, setValues] = useState(() =>
    ['Time off', 'ADV / RTT', 'Extra-legal leave'].reduce((acc, type) => {
      acc[type] = balances[type] != null ? String(balances[type]) : '';
      return acc;
    }, {})
  );

  const hrType = emp.gender === 'f' ? 'Maternity leave' : 'Paternity leave';
  const hrDefault = emp.gender === 'f' ? 105 : 10;
  const sections = [
    ...BALANCE_SECTIONS,
    { label: 'HR-initiated only', types: [hrType], editable: false, defaults: { [hrType]: hrDefault } },
  ];

  const { visible, close } = useModalTransition(onClose);

  const handleSave = () => {
    const next = { ...balances };
    for (const type of ['Time off', 'ADV / RTT', 'Extra-legal leave']) {
      const v = parseInt(values[type], 10);
      next[type] = isNaN(v) ? 0 : Math.max(0, v);
    }
    onSave(next);
    if (isNewEmployee && onConfirm) onConfirm();
    close();
  };

  const year = new Date().getFullYear();

  return (
    <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,13,40,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...modalBackdropStyle(visible) }}>
      <div onClick={e => e.stopPropagation()} style={{ background: P.white, borderRadius: 14, width: 480, boxShadow: '0 8px 40px rgba(15,13,40,0.18)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden', ...modalPanelStyle(visible) }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${P.border}` }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>{isNewEmployee ? 'Review & confirm balances' : 'Edit balances'}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, marginTop: 2 }}>{emp.name} · {year}</div>
          </div>
          <button onClick={close} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <Icon name="X" size={18} color={P.inkSoft} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto' }}>
          {sections.map((section, si) => (
            <div key={section.label} style={{ borderBottom: si < sections.length - 1 ? `1px solid ${P.border}` : 'none' }}>
              <div style={{ padding: '10px 22px 6px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 10, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {section.label}
              </div>
              {section.types.map((type, ti) => {
                const dot = LEAVE_COLORS[type] || '#ccc';
                const isLast = ti === section.types.length - 1;
                if (section.editable) {
                  return (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', padding: '10px 22px', borderTop: ti > 0 ? `1px solid ${P.border}` : 'none' }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: dot, flexShrink: 0, marginRight: 10 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.ink, flex: 1 }}>{type}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="number" min="0"
                          value={values[type]}
                          onChange={e => setValues(v => ({ ...v, [type]: e.target.value }))}
                          placeholder="0"
                          style={{ width: 56, padding: '5px 8px', borderRadius: 7, border: `1px solid ${P.border}`, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: P.ink, outline: 'none', textAlign: 'center', background: P.bg }}
                        />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft }}>days</span>
                      </div>
                    </div>
                  );
                } else {
                  const defaultVal = section.defaults?.[type];
                  const displayVal = balances[type] != null ? balances[type] : defaultVal;
                  return (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', padding: '10px 22px', borderTop: ti > 0 ? `1px solid ${P.border}` : 'none', opacity: 0.7 }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: dot, flexShrink: 0, marginRight: 10 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.ink, flex: 1 }}>{type}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: P.inkSoft }}>{displayVal ?? '—'}</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft }}>days</span>
                      </div>
                    </div>
                  );
                }
              })}
              <div style={{ height: 4 }} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ flex: 1 }} />
          <button onClick={close} style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${P.border}`, background: 'transparent', color: P.ink, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: P.ink, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>{isNewEmployee ? 'Confirm balances' : 'Save balances'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Employee detail screen ────────────────────────────────────────────────
function EmployeeDetailScreen({ employeeId, requests, onNav, onSave, onCancel, employeeBalance, onUpdateBalance, needsSetup, confirmedDate, onConfirmBalances }) {
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
      return { type, entitled, used, remaining: entitled != null ? Math.max(0, entitled - used) : null };
    });
  }, [empReqs, emp, employeeBalance]);

  const tabs = [
    { id: 'choices', label: 'Choices' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'salary', label: 'Salary & components' },
    { id: 'details', label: 'Details & roles' },
    { id: 'timeoff', label: 'Leave & absences' },
  ];

  const [tabsRef, tabRect, tabAnimate] = useSlidingIndicator(activeTab);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${P.border}`, background: P.white }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 0 0' }}>
        <button onClick={() => onNav('employees')} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, flexShrink: 0,
          border: `1px solid ${P.border}`, background: P.white,
          cursor: 'pointer', borderRadius: 8, marginBottom: 24,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>{emp.name}</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, margin: '2px 0 0' }}>{emp.department}</p>
          </div>
        </div>

        {/* Tabs */}
        <div ref={tabsRef} style={{ display: 'flex', gap: 0, position: 'relative' }}>
          {tabs.map(tab => {
            const isActive = tab.id === activeTab;
            return (
              <button key={tab.id} data-key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: isActive ? 700 : 500, fontSize: 13,
                color: isActive ? P.ink : P.inkSoft,
                marginBottom: -1,
              }}>{tab.label}</button>
            );
          })}
          <div style={{
            position: 'absolute', bottom: -1, height: 2, background: P.ink, borderRadius: 1,
            left: tabRect.left, width: tabRect.width,
            transition: tabAnimate ? `left 250ms ${EASE_OUT}, width 250ms ${EASE_OUT}` : 'none',
          }} />
        </div>
      </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {activeTab === 'timeoff' ? (
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {needsSetup && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
                <Icon name="AlertTriangle" size={16} color="#d97706" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: '#92400e' }}>Confirm {emp.name.split(' ')[0]}'s leave balances</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#78350f', marginTop: 1 }}>These are company defaults — adjust any values if needed, then confirm so {emp.name.split(' ')[0]} can request time off.</div>
                </div>
                <button onClick={() => setEditBalancesOpen(true)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: P.ink, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  Review & confirm
                </button>
              </div>
            )}
            {/* Balances card */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>Balances</span>
                  {confirmedDate && (
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: P.inkFaint, marginTop: 2 }}>Confirmed on {confirmedDate}</div>
                  )}
                </div>
                {!needsSetup && (
                  <button onClick={() => setEditBalancesOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: `1px solid ${P.border}`, background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: P.ink }}>
                    <Icon name="Pencil" size={12} color={P.inkSoft} />
                    Edit balances
                  </button>
                )}
              </div>
              <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
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
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: b.entitled != null ? P.ink : P.inkFaint, fontStyle: b.entitled == null ? 'italic' : 'normal', fontSize: b.entitled == null ? 11 : 13 }}>{b.entitled != null ? b.entitled : 'No limit'}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', color: b.used > 0 ? P.ink : P.inkFaint }}>{b.used}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: b.remaining != null ? (b.remaining <= 3 ? '#ef4444' : P.ink) : P.inkFaint, fontStyle: b.remaining == null ? 'italic' : 'normal', fontSize: b.remaining == null ? 11 : 13 }}>{b.remaining != null ? b.remaining : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            {/* Absence history */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>Absence history</span>
                <button
                  onClick={() => !needsSetup && setAddModal('add')}
                  title={needsSetup ? 'Confirm leave balances before adding time off' : undefined}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 8,
                    border: 'none', background: P.ink, color: '#fff',
                    cursor: needsSetup ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
                    opacity: needsSetup ? 0.35 : 1,
                  }}
                >
                  <Icon name="Plus" size={13} color="#fff" strokeWidth={2.5} />
                  Add time off
                </button>
              </div>
              <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>

              {empReqs.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                  <Icon name="CalendarOff" size={28} color={P.border} style={{ marginBottom: 8 }} />
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkFaint }}>No absences recorded yet</div>
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
          requests={requests}
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
          isNewEmployee={needsSetup}
          onConfirm={onConfirmBalances}
        />
      )}
    </div>
  );
}

// ── Dashboard screen ──────────────────────────────────────────────────────
function DashboardListRow({ onClick, children }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
      borderBottom: `1px solid ${P.border}`, cursor: 'pointer',
      background: hover ? P.bg : 'transparent', transition: `background 120ms ${EASE_OUT}`,
    }}>
      {children}
    </div>
  );
}

function DashboardScreen({ requests, onNav }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const todayISO = isoDate(today);
  const pending = requests.filter(r => r.status === 'pending');
  const absenceMap = buildAbsenceMap(requests);

  const weekDays = [];
  const ws = weekStart(today);
  for (let i = 0; i < 5; i++) weekDays.push(isoDate(addDays(ws, i)));

  const offThisWeek = new Set();
  for (const [empId, days] of Object.entries(absenceMap)) {
    for (const iso of weekDays) {
      if (days[iso]) { offThisWeek.add(empId); break; }
    }
  }

  const offToday = [];
  for (const [empId, days] of Object.entries(absenceMap)) {
    if (days[todayISO]) offToday.push({ empId, ...days[todayISO] });
  }

  const lowBalance = Object.entries(EMPLOYEES).map(([id, emp]) => {
    const used = requests.filter(r => r.employee === id && r.type === 'Time off' && r.status !== 'rejected').reduce((s, r) => s + r.days, 0);
    return { id, name: emp.name, department: emp.department, remaining: Math.max(0, emp.entitlement - used) };
  }).filter(e => e.remaining <= 5).sort((a, b) => a.remaining - b.remaining).slice(0, 5);

  const statCard = (icon, label, value, color, onClick) => (
    <div onClick={onClick} style={{
      background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: '20px 22px',
      flex: 1, cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow 150ms',
    }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={16} color={color} strokeWidth={2} />
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflow: 'auto' }}>
      <div style={{ padding: '28px 28px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, margin: '4px 0 0' }}>
          {today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div style={{ padding: '20px 28px', display: 'flex', gap: 16 }}>
        {statCard('Clock', 'Pending approvals', pending.length, '#f59e0b', () => onNav('requests'))}
        {statCard('CalendarOff', 'Off today', offToday.length, '#ef4444')}
        {statCard('Users', 'Off this week', offThisWeek.size, '#6366f1')}
      </div>

      <div style={{ padding: '0 28px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Pending requests */}
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: P.ink }}>Pending requests</span>
            {pending.length > 0 && (
              <button onClick={() => onNav('requests')} style={{
                border: 'none', background: 'transparent', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: '#6366f1',
              }}>View all</button>
            )}
          </div>
          {pending.length === 0 ? (
            <div style={{ padding: '28px 20px', textAlign: 'center', color: P.inkFaint, fontFamily: 'var(--font-body)', fontSize: 13 }}>
              All caught up — no pending requests
            </div>
          ) : pending.slice(0, 5).map(req => {
            const emp = EMPLOYEES[req.employee] || { name: req.employee, initials: '?' };
            return (
              <DashboardListRow key={req.id} onClick={() => onNav('requests')}>
                <Avatar employeeId={req.employee} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.ink }}>{emp.name}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft }}>{req.type} · {req.days} {req.days === 1 ? 'day' : 'days'} · {req.startDate}</div>
                </div>
                <Icon name="ChevronRight" size={14} color={P.inkFaint} />
              </DashboardListRow>
            );
          })}
        </div>

        {/* Low balance alerts */}
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${P.border}` }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: P.ink }}>Low balance</span>
          </div>
          {lowBalance.length === 0 ? (
            <div style={{ padding: '28px 20px', textAlign: 'center', color: P.inkFaint, fontFamily: 'var(--font-body)', fontSize: 13 }}>
              No employees with low balance
            </div>
          ) : lowBalance.map(emp => (
            <DashboardListRow key={emp.id} onClick={() => onNav('employee-detail:' + emp.id)}>
              <Avatar employeeId={emp.id} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.ink }}>{emp.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft }}>{emp.department}</div>
              </div>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                color: emp.remaining <= 0 ? '#b91c1c' : emp.remaining <= 3 ? '#f59e0b' : P.ink,
              }}>{emp.remaining}d left</span>
            </DashboardListRow>
          ))}
        </div>
      </div>
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
    <a href="../" style={{
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
  const [screen, setScreen] = useState('home');
  const [requests, setRequests] = useState(() => mergeRequests(generatedRequests, readLS()));
  const [companyEvents, setCompanyEvents] = useState([]);
  const [toast, setToast] = useState(null);
  const [calDetail, setCalDetail] = useState(null);
  const [calEditReq, setCalEditReq] = useState(null);
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
    if (req._isCompanyEvent) {
      setCompanyEvents(prev => {
        const idx = prev.findIndex(e => e.id === req.id);
        return idx >= 0 ? prev.map(e => e.id === req.id ? req : e) : [req, ...prev];
      });
      setToast('Company closure saved');
      return;
    }
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

  const cancelCompanyEvent = (id) => {
    setCompanyEvents(prev => prev.filter(e => e.id !== id));
    setToast('Company closure cancelled');
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

  const updateBalances = (empId, newBalances) => {
    setEmployeeBalances(prev => ({ ...prev, [empId]: newBalances }));
    setToast('Balances updated');
  };

  const [needsBalanceSetup, setNeedsBalanceSetup] = useState(new Set(['bram-goossens', 'thomas-vandenberghe']));
  const [balanceConfirmedDates, setBalanceConfirmedDates] = useState({});

  const confirmBalancesFor = (empId) => {
    setNeedsBalanceSetup(prev => { const s = new Set(prev); s.delete(empId); return s; });
    setBalanceConfirmedDates(prev => ({ ...prev, [empId]: '15 Jul 2026' }));
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ display: 'flex', height: '100vh', background: P.bg }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes badgePopIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        * { box-sizing: border-box; }
        ::placeholder { color: #9ca3af; opacity: 1; }
      `}</style>

      <Sidebar active={screen} onNav={setScreen} pendingCount={pendingCount} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {screen === 'dashboard' && <DashboardScreen requests={requests} onNav={setScreen} />}
        {screen === 'team-absences' && <TeamAbsencesScreen requests={requests} pendingCount={pendingCount} onNav={setScreen} onShowDetail={setCalDetail} onSave={saveRequest} companyEvents={companyEvents} onCancelCompanyEvent={cancelCompanyEvent} />}
        {screen === 'requests' && <RequestsScreen requests={requests} onApprove={approve} onDecline={requestDecline} onSave={saveRequest} onCancel={requestCancel} />}
        {screen === 'employees' && <EmployeesScreen requests={requests} onNav={setScreen} />}
        {screen.startsWith('employee-detail:') && <EmployeeDetailScreen employeeId={screen.split(':')[1]} requests={requests} onNav={setScreen} onSave={saveRequest} onCancel={cancelRequest} employeeBalance={employeeBalances[screen.split(':')[1]]} onUpdateBalance={(newBal) => updateBalances(screen.split(':')[1], newBal)} needsSetup={needsBalanceSetup.has(screen.split(':')[1])} confirmedDate={balanceConfirmedDates[screen.split(':')[1]]} onConfirmBalances={() => confirmBalancesFor(screen.split(':')[1])} />}
        {screen === 'settings' && <SettingsScreen />}
      </div>

      {calDetail && (
        <DetailModal req={calDetail} requests={requests} onClose={() => setCalDetail(null)}
          onApprove={(id) => { approve(id); setCalDetail(prev => prev && prev.id === id ? { ...prev, status: 'approved' } : prev); }}
          onDecline={(id) => requestDecline(id)}
          onCancel={(id) => requestCancel(id)}
          onEdit={(r) => { setCalDetail(null); setCalEditReq(r); }}
        />
      )}

      {calEditReq && (
        <AddTimeOffModal
          existing={calEditReq}
          requests={requests}
          onClose={() => setCalEditReq(null)}
          onSave={(req) => { saveRequest(req); setCalEditReq(null); }}
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
