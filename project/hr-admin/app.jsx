// ── Payflip HR Admin — Desktop Prototype ──────────────────────────────────

const { useState, useEffect, useRef } = React;

// ── Design tokens ──────────────────────────────────────────────────────────
const P = {
  ink:        '#0f0d28',
  inkSoft:    '#50545e',
  inkFaint:   '#9ca3af',
  border:     '#eaeeeb',
  bg:         '#f7f8f7',
  white:      '#ffffff',
  sidebar:    '#ffffff',
  accent:     '#0f0d28',
};
const Status = {
  pending:  { bg: '#fff8e6', text: '#92400e', dot: '#f59e0b', label: 'Pending' },
  approved: { bg: '#f0fdf4', text: '#166534', dot: '#22c55e', label: 'Approved' },
  rejected: { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444', label: 'Rejected' },
};
const TypeColor = {
  'Time off':     { bg: '#f3f0ff', text: '#5b21b6', icon: 'Palmtree' },
  'Sick leave':   { bg: '#fff7ed', text: '#c2410c', icon: 'Thermometer' },
  'Special leave':{ bg: '#fdf4ff', text: '#86198f', icon: 'Gift' },
  'Funeral leave':{ bg: '#f8fafc', text: '#475569', icon: 'Flower2' },
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
    const svg = el.querySelector('svg') || el;
    if (svg.tagName === 'svg') {
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

// ── Seed data ──────────────────────────────────────────────────────────────
const EMPLOYEES = {
  'sarah':   { name: 'Sarah Dubois',    initials: 'SD', color: '#ddd6fe' },
  'thomas':  { name: 'Thomas Lejeune',  initials: 'TL', color: '#fde68a' },
  'emma':    { name: 'Emma Claes',      initials: 'EC', color: '#a7f3d0' },
  'david':   { name: 'David Laurent',   initials: 'DL', color: '#bfdbfe' },
  'julie':   { name: 'Julie Martens',   initials: 'JM', color: '#fecdd3' },
  'nicolas': { name: 'Nicolas Peeters', initials: 'NP', color: '#fed7aa' },
};

const initialRequests = [];

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ employeeId, size = 32 }) {
  const emp = EMPLOYEES[employeeId];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: emp.color, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 700,
      fontSize: size * 0.35, color: P.ink, letterSpacing: '0.01em',
    }}>{emp.initials}</div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = Status[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 20,
      background: s.bg, fontFamily: 'var(--font-display)', fontWeight: 600,
      fontSize: 11, color: s.text,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const t = TypeColor[type] || TypeColor['Time off'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', borderRadius: 20,
      background: t.bg, fontFamily: 'var(--font-display)', fontWeight: 600,
      fontSize: 11, color: t.text,
    }}>
      <Icon name={t.icon} size={11} color={t.text} strokeWidth={2} />
      {type}
    </span>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, pendingCount }) {
  const items = [
    { id: 'requests', icon: 'Inbox',    label: 'Requests',    badge: pendingCount },
    { id: 'team',     icon: 'Users',    label: 'Team',        badge: null },
    { id: 'settings', icon: 'Settings', label: 'Settings',    badge: null },
  ];
  return (
    <div style={{
      width: 220, flexShrink: 0, background: P.white,
      borderRight: `1px solid ${P.border}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${P.border}` }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: P.ink, letterSpacing: '-0.02em' }}>
          payflip
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: P.inkFaint, marginTop: 2 }}>HR Admin</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 8,
              border: 'none', background: isActive ? P.bg : 'transparent',
              cursor: 'pointer', width: '100%', textAlign: 'left',
              transition: 'background 0.15s',
            }}>
              <Icon name={item.icon} size={16} color={isActive ? P.ink : P.inkSoft} strokeWidth={isActive ? 2.25 : 1.75} />
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: isActive ? 700 : 500,
                fontSize: 13.5, color: isActive ? P.ink : P.inkSoft, flex: 1,
              }}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 9, padding: '0 5px',
                  background: P.ink, color: '#fff',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Manager profile */}
      <div style={{ padding: '12px 14px', borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%', background: '#c7d2fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: P.ink,
        }}>SL</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Sophie Laurent</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: P.inkFaint }}>HR Manager</div>
        </div>
      </div>
    </div>
  );
}

// ── Request row ────────────────────────────────────────────────────────────
function RequestRow({ req, onApprove, onReject, expanded, onToggle }) {
  const emp = EMPLOYEES[req.employee];
  const isPending = req.status === 'pending';

  return (
    <div style={{
      borderBottom: `1px solid ${P.border}`,
      background: expanded ? '#fafafa' : P.white,
      transition: 'background 0.15s',
    }}>
      {/* Main row */}
      <div
        onClick={onToggle}
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.4fr 1fr 1fr 140px',
          alignItems: 'center',
          gap: 16, padding: '14px 24px',
          cursor: 'pointer',
        }}
      >
        {/* Employee */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar employeeId={req.employee} size={34} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13.5, color: P.ink }}>{emp.name}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: P.inkFaint, marginTop: 1 }}>{req.submittedAt}</div>
          </div>
        </div>

        {/* Type */}
        <TypeBadge type={req.type} />

        {/* Dates */}
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: P.inkSoft }}>
          {req.startDate === req.endDate ? req.startDate : `${req.startDate} – ${req.endDate}`}
        </div>

        {/* Days */}
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.ink }}>
          {req.days} {req.days === 1 ? 'day' : 'days'}
        </div>

        {/* Status / Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isPending ? (
            <>
              <button onClick={(e) => { e.stopPropagation(); onApprove(req.id); }} style={{
                padding: '5px 12px', borderRadius: 7, border: 'none',
                background: P.ink, color: '#fff', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
              }}>Approve</button>
              <button onClick={(e) => { e.stopPropagation(); onReject(req.id); }} style={{
                padding: '5px 10px', borderRadius: 7,
                border: `1px solid ${P.border}`, background: 'transparent',
                color: P.inkSoft, cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
              }}>Reject</button>
            </>
          ) : (
            <StatusBadge status={req.status} />
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 24px 16px', display: 'flex', gap: 32, paddingLeft: 68 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Note</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: req.note ? P.inkSoft : P.inkFaint, fontStyle: req.note ? 'normal' : 'italic' }}>
              {req.note || 'No note added'}
            </div>
          </div>
          {isPending && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginLeft: 'auto' }}>
              <button onClick={() => onReject(req.id)} style={{
                padding: '7px 16px', borderRadius: 8,
                border: `1px solid #fca5a5`, background: '#fef2f2',
                color: '#b91c1c', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12.5,
              }}>Reject request</button>
              <button onClick={() => onApprove(req.id)} style={{
                padding: '7px 16px', borderRadius: 8, border: 'none',
                background: P.ink, color: '#fff', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12.5,
              }}>Approve request</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Requests screen ────────────────────────────────────────────────────────
function RequestsScreen({ requests, onApprove, onReject }) {
  const [filter, setFilter] = useState('pending');
  const [expanded, setExpanded] = useState(null);

  const filtered = requests.filter(r => filter === 'all' || r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 0', borderBottom: `1px solid ${P.border}`, background: P.white }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Requests</h1>
            {pendingCount > 0 && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, margin: '4px 0 0' }}>
                {pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'} need your review
              </p>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {[['pending', 'Pending'], ['approved', 'Approved'], ['all', 'All']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{
              padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: filter === val ? 700 : 500,
              fontSize: 13, color: filter === val ? P.ink : P.inkSoft,
              borderBottom: filter === val ? `2px solid ${P.ink}` : '2px solid transparent',
              transition: 'all 0.15s', marginBottom: -1,
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1.4fr 1fr 1fr 140px',
        gap: 16, padding: '10px 24px',
        borderBottom: `1px solid ${P.border}`,
        background: P.bg,
      }}>
        {['Employee', 'Type', 'Dates', 'Duration', 'Status'].map(h => (
          <div key={h} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto', background: P.white }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: P.inkFaint, fontFamily: 'var(--font-body)', fontSize: 13 }}>
            No {filter === 'all' ? '' : filter} requests
          </div>
        ) : filtered.map(req => (
          <RequestRow
            key={req.id}
            req={req}
            onApprove={onApprove}
            onReject={onReject}
            expanded={expanded === req.id}
            onToggle={() => toggle(req.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Team screen (skeleton) ─────────────────────────────────────────────────
function TeamScreen({ requests }) {
  const approved = requests.filter(r => r.status === 'approved');
  return (
    <div style={{ flex: 1, padding: 24 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: P.ink, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Team</h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, margin: '0 0 24px' }}>Upcoming and current absences across your team</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 640 }}>
        {approved.map(req => {
          const emp = EMPLOYEES[req.employee];
          return (
            <div key={req.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 10,
              background: P.white, border: `1px solid ${P.border}`,
            }}>
              <Avatar employeeId={req.employee} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13.5, color: P.ink }}>{emp.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, marginTop: 2 }}>
                  {req.startDate === req.endDate ? req.startDate : `${req.startDate} – ${req.endDate}`} · {req.days} {req.days === 1 ? 'day' : 'days'}
                </div>
              </div>
              <TypeBadge type={req.type} />
            </div>
          );
        })}
        {approved.length === 0 && (
          <div style={{ padding: 24, color: P.inkFaint, fontFamily: 'var(--font-body)', fontSize: 13 }}>No upcoming approved leave</div>
        )}
      </div>
    </div>
  );
}

// ── Settings screen (skeleton) ─────────────────────────────────────────────
function SettingsScreen() {
  return (
    <div style={{ flex: 1, padding: 24 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: P.ink, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Settings</h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, margin: '0 0 24px' }}>Leave policies and company configuration</p>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: 24, maxWidth: 480, color: P.inkFaint, fontFamily: 'var(--font-body)', fontSize: 13 }}>
        Coming soon — collective holidays, leave cascade order, approval rules
      </div>
    </div>
  );
}

// ── App switcher pill ──────────────────────────────────────────────────────
function AppSwitcher() {
  return (
    <a href="/employee-app/" style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 100,
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '8px 14px', borderRadius: 20,
      background: P.ink, color: '#fff', textDecoration: 'none',
      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
      boxShadow: '0 2px 12px rgba(15,13,40,0.2)',
      transition: 'opacity 0.15s',
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
      boxShadow: '0 4px 16px rgba(15,13,40,0.2)', zIndex: 200,
      display: 'flex', alignItems: 'center', gap: 8,
      animation: 'fadeUp 0.2s ease-out',
    }}>
      <Icon name="Check" size={15} color="#fff" strokeWidth={2.5} />
      {message}
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────
// ── localStorage bridge ────────────────────────────────────────────────────
const LS_KEY = 'payflip_hr_requests';
function readLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function writeLS(requests) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(requests)); } catch {}
}
function mergeRequests(seed, live) {
  const merged = [...seed];
  for (const r of live) {
    if (!merged.find(m => m.id === r.id)) merged.unshift(r);
  }
  return merged;
}

function App() {
  const [screen, setScreen] = useState('requests');
  const [requests, setRequests] = useState(() => mergeRequests(initialRequests, readLS()));
  const [toast, setToast] = useState(null);
  const [newBadge, setNewBadge] = useState(false);

  // Live-sync: pick up requests submitted from the employee app in another tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== LS_KEY) return;
      const live = readLS();
      setRequests(prev => {
        const merged = mergeRequests(prev, live);
        // Flash badge if a genuinely new pending request appeared
        if (merged.some(r => r.status === 'pending' && !prev.find(p => p.id === r.id))) {
          setNewBadge(true);
          setTimeout(() => setNewBadge(false), 3000);
        }
        return merged;
      });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const showToast = (msg) => { setToast(msg); };

  const approve = (id) => {
    setRequests(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status: 'approved' } : r);
      writeLS(next.filter(r => r.employee === 'david')); // persist employee-submitted ones
      return next;
    });
    const req = requests.find(r => r.id === id);
    showToast(`${EMPLOYEES[req.employee].name.split(' ')[0]}'s request approved`);
  };

  const reject = (id) => {
    setRequests(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r);
      writeLS(next.filter(r => r.employee === 'david'));
      return next;
    });
    const req = requests.find(r => r.id === id);
    showToast(`${EMPLOYEES[req.employee].name.split(' ')[0]}'s request rejected`);
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ display: 'flex', height: '100vh', background: P.bg }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <Sidebar active={screen} onNav={setScreen} pendingCount={pendingCount} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {screen === 'requests' && <RequestsScreen requests={requests} onApprove={approve} onReject={reject} />}
        {screen === 'team'     && <TeamScreen requests={requests} />}
        {screen === 'settings' && <SettingsScreen />}
      </div>

      <AppSwitcher />
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
