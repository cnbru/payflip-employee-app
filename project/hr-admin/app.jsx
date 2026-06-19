// ── Payflip HR Admin — Desktop Prototype ──────────────────────────────────

const { useState, useEffect, useRef, useCallback } = React;

// ── Design tokens ──────────────────────────────────────────────────────────
const P = {
  ink:      '#0f0d28',
  inkSoft:  '#50545e',
  inkFaint: '#9ca3af',
  border:   '#eaeeeb',
  bg:       '#f7f8f7',
  white:    '#ffffff',
};

const StatusMeta = {
  pending:  { dot: '#f59e0b', label: 'Requested' },
  approved: { dot: '#22c55e', label: 'Approved'  },
  rejected: { dot: '#ef4444', label: 'Declined'  },
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

// ── Employees ──────────────────────────────────────────────────────────────
const EMPLOYEES = {
  david:   { name: 'David Laurent',   initials: 'DL', color: '#bfdbfe', entitlement: 30, department: 'Engineering' },
  sarah:   { name: 'Sarah Dubois',    initials: 'SD', color: '#ddd6fe', entitlement: 25, department: 'Marketing'   },
  thomas:  { name: 'Thomas Lejeune',  initials: 'TL', color: '#fde68a', entitlement: 25, department: 'Sales'       },
  emma:    { name: 'Emma Claes',      initials: 'EC', color: '#a7f3d0', entitlement: 25, department: 'Design'      },
  julie:   { name: 'Julie Martens',   initials: 'JM', color: '#fecdd3', entitlement: 25, department: 'Finance'     },
  nicolas: { name: 'Nicolas Peeters', initials: 'NP', color: '#fed7aa', entitlement: 25, department: 'Engineering' },
};

const initialRequests = [];

// ── localStorage bridge ────────────────────────────────────────────────────
const LS_KEY = 'payflip_hr_requests';
function readLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function writeLS(reqs) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(reqs.filter(r => r.employee === 'david'))); } catch {}
}
function mergeRequests(seed, live) {
  const merged = [...seed];
  for (const r of live) {
    if (!merged.find(m => m.id === r.id)) merged.unshift(r);
  }
  return merged;
}

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
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink }}>{m.label}</span>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({ active, onNav, pendingCount }) {
  const items = [
    { id: 'requests', icon: 'Clock',    label: 'Time off'  },
    { id: 'team',     icon: 'Users',    label: 'Team'      },
    { id: 'settings', icon: 'Settings', label: 'Settings'  },
  ];
  return (
    <div style={{
      width: 216, flexShrink: 0, background: P.white,
      borderRight: `1px solid ${P.border}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${P.border}` }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: P.ink, letterSpacing: '-0.02em' }}>payflip</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: P.inkFaint, marginTop: 2 }}>HR Admin</div>
      </div>
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '7px 10px', borderRadius: 7,
              border: 'none', background: isActive ? P.bg : 'transparent',
              cursor: 'pointer', width: '100%', textAlign: 'left',
            }}>
              <Icon name={item.icon} size={15} color={isActive ? P.ink : P.inkSoft} strokeWidth={isActive ? 2.25 : 1.75} />
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: isActive ? 700 : 500,
                fontSize: 13, color: isActive ? P.ink : P.inkSoft, flex: 1,
              }}>{item.label}</span>
              {item.id === 'requests' && pendingCount > 0 && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 9, padding: '0 5px',
                  background: P.ink, color: '#fff',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{pendingCount}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: '10px 12px', borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', background: '#c7d2fe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, color: P.ink,
        }}>SL</div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: P.ink }}>Sophie Laurent</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: P.inkFaint }}>HR Manager</div>
        </div>
      </div>
    </div>
  );
}

// ── Action menu (···) ──────────────────────────────────────────────────────
function ActionMenu({ onApprove, onDecline, onViewDetails }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

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
          boxShadow: '0 4px 20px rgba(0,0,0,0.10)', width: 152, overflow: 'hidden',
        }}>
          {[
            { icon: 'CheckCircle', label: 'Approve',      fn: onApprove,     color: '#166534' },
            { icon: 'XCircle',     label: 'Decline',      fn: onDecline,     color: '#b91c1c' },
            { icon: 'Eye',         label: 'View details', fn: onViewDetails, color: P.ink     },
          ].map(({ icon, label, fn, color }) => (
            <button key={label} onClick={(e) => { e.stopPropagation(); setOpen(false); fn(); }} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              width: '100%', padding: '9px 12px', border: 'none', background: 'transparent',
              cursor: 'pointer', textAlign: 'left',
            }}
            onMouseEnter={e => e.currentTarget.style.background = P.bg}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Icon name={icon} size={14} color={color} strokeWidth={1.75} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink }}>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Detail modal ───────────────────────────────────────────────────────────
function DetailModal({ req, requests, onClose, onApprove, onDecline }) {
  const emp = EMPLOYEES[req.employee] || { name: req.employee, entitlement: 25 };

  // Balance summary — days already used/booked by this employee (approved + other pending)
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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${P.border}` }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>Time off details</span>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <Icon name="X" size={18} color={P.inkSoft} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '6px 0' }}>
          {[
            { label: 'Status',       value: <StatusDot status={req.status} /> },
            { label: 'Type',         value: req.type },
            { label: 'When',         value: <span>{req.startDate === req.endDate ? req.startDate : `${req.startDate} – ${req.endDate}`}<br /><span style={{ color: P.inkSoft, fontSize: 12 }}>Total of {req.days} {req.days === 1 ? 'day' : 'days'}</span></span> },
            { label: 'Notes',        value: req.note || '—' },
            { label: 'Requested on', value: req.submittedAt },
            { label: 'Requested by', value: <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar employeeId={req.employee} size={22} /><span>{emp.name}</span><span style={{ color: P.inkFaint, fontSize: 12 }}>{emp.department}</span></div> },
          ].map(({ label, value }) => (
            <div key={label} style={{
              display: 'grid', gridTemplateColumns: '130px 1fr',
              padding: '11px 22px', borderBottom: `1px solid ${P.border}`,
              alignItems: 'start', gap: 12,
            }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, paddingTop: 1 }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink }}>{value}</span>
            </div>
          ))}

          {/* Balance summary */}
          <div style={{ margin: '14px 22px', background: P.bg, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: P.ink, marginBottom: 10 }}>Balance summary</div>
            {[
              { label: 'Annual entitlement', value: `${emp.entitlement} days`, red: false },
              { label: 'Used & booked',       value: `${usedDays} ${usedDays === 1 ? 'day' : 'days'}`, red: false },
              { label: 'Requesting',           value: `${req.days} ${req.days === 1 ? 'day' : 'days'}`, red: false },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${P.border}` }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0 0' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: P.ink }}>Remaining after request</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: remaining < 0 ? '#b91c1c' : '#166534' }}>
                {remaining < 0 ? '' : ''}{remaining} {Math.abs(remaining) === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        {isPending && (
          <div style={{ padding: '14px 22px', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => { onDecline(req.id); onClose(); }} style={{
              padding: '8px 20px', borderRadius: 8,
              border: `1px solid #fca5a5`, background: '#fef2f2',
              color: '#b91c1c', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
            }}>Decline</button>
            <button onClick={() => { onApprove(req.id); onClose(); }} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: P.ink, color: '#fff', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
            }}>Approve</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Table row ──────────────────────────────────────────────────────────────
const TH = ({ children, style }) => (
  <div style={{
    fontFamily: 'var(--font-display)', fontWeight: 600,
    fontSize: 11, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em',
    ...style,
  }}>{children}</div>
);

function RequestRow({ req, requests, onApprove, onDecline, onDetail }) {
  const emp = EMPLOYEES[req.employee] || { name: req.employee, initials: '?', color: '#e5e7eb' };
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onDetail(req)}
      style={{
        display: 'grid',
        gridTemplateColumns: '32px 1.8fr 1fr 0.9fr 1fr 1fr 0.7fr 0.9fr 44px',
        alignItems: 'center', gap: 12,
        padding: '0 20px',
        height: 52,
        borderBottom: `1px solid ${P.border}`,
        background: hover ? P.bg : P.white,
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
    >
      {/* Checkbox */}
      <input type="checkbox" onClick={e => e.stopPropagation()} style={{ cursor: 'pointer', accentColor: P.ink }} />

      {/* Requested by */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
        <Avatar employeeId={req.employee} size={28} />
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{emp.name}</span>
      </div>

      {/* Status */}
      <StatusDot status={req.status} />

      {/* Leave type */}
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink }}>{req.type}</span>

      {/* Duration */}
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink }}>
        {req.days} {req.days === 1 ? 'day' : 'days'}
      </span>

      {/* Date from */}
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink }}>{req.startDate}</span>

      {/* Date to */}
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: req.startDate === req.endDate ? P.inkFaint : P.ink }}>
        {req.startDate === req.endDate ? '—' : req.endDate}
      </span>

      {/* Added on */}
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft }}>{req.submittedAt}</span>

      {/* Actions */}
      <div onClick={e => e.stopPropagation()}>
        <ActionMenu
          onApprove={() => onApprove(req.id)}
          onDecline={() => onDecline(req.id)}
          onViewDetails={() => onDetail(req)}
        />
      </div>
    </div>
  );
}

// ── Requests screen ────────────────────────────────────────────────────────
function RequestsScreen({ requests, onApprove, onDecline }) {
  const [tab, setTab]         = useState('pending');
  const [detail, setDetail]   = useState(null);

  const filtered = tab === 'pending' ? requests.filter(r => r.status === 'pending')
    : tab === 'approved' ? requests.filter(r => r.status === 'approved')
    : requests;

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Page header */}
      <div style={{ padding: '22px 24px 0', background: P.white, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>
              Time off requests
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, margin: '3px 0 0' }}>
              Manage your team's time off
            </p>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 20, border: 'none',
            background: P.ink, color: '#fff', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
          }}>
            <Icon name="Plus" size={14} color="#fff" strokeWidth={2.5} />
            Add time off
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {[['pending', 'All pending requests'], ['approved', 'Approved'], ['all', 'All requests']].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)} style={{
              padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: tab === val ? 700 : 500,
              fontSize: 13, color: tab === val ? P.ink : P.inkSoft,
              borderBottom: tab === val ? `2px solid ${P.ink}` : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s',
            }}>
              {label}{val === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Search + filter bar */}
      <div style={{ padding: '12px 24px', background: P.white, borderBottom: `1px solid ${P.border}`, display: 'flex', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          border: `1px solid ${P.border}`, borderRadius: 20, padding: '6px 14px',
          background: P.white, width: 200,
        }}>
          <Icon name="Search" size={13} color={P.inkFaint} />
          <input placeholder="Search" style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink, width: '100%',
          }} />
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '6px 14px', borderRadius: 20,
          border: `1px solid ${P.border}`, background: P.white,
          cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, color: P.ink,
        }}>
          <Icon name="SlidersHorizontal" size={13} color={P.inkSoft} />
          Filter
        </button>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto', background: P.white }}>
        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '32px 1.8fr 1fr 0.9fr 1fr 1fr 0.7fr 0.9fr 44px',
          alignItems: 'center', gap: 12,
          padding: '0 20px', height: 38,
          borderBottom: `1px solid ${P.border}`,
          background: P.bg, position: 'sticky', top: 0,
        }}>
          <input type="checkbox" style={{ cursor: 'pointer', accentColor: P.ink }} />
          <TH>Requested by</TH>
          <TH>Status</TH>
          <TH>Leave type</TH>
          <TH>Duration</TH>
          <TH>Date from</TH>
          <TH>Date to</TH>
          <TH>Added on</TH>
          <div />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <Icon name="Inbox" size={32} color={P.border} style={{ marginBottom: 12 }} />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.inkFaint }}>
              No {tab === 'pending' ? 'pending ' : tab === 'approved' ? 'approved ' : ''}requests
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkFaint, marginTop: 4 }}>
              {tab === 'pending' ? 'New requests from your team will appear here.' : ''}
            </div>
          </div>
        ) : filtered.map(req => (
          <RequestRow
            key={req.id}
            req={req}
            requests={requests}
            onApprove={onApprove}
            onDecline={onDecline}
            onDetail={setDetail}
          />
        ))}

        {filtered.length > 0 && (
          <div style={{ padding: '10px 20px', fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkFaint }}>
            {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
          </div>
        )}
      </div>

      {detail && (
        <DetailModal
          req={detail}
          requests={requests}
          onClose={() => setDetail(null)}
          onApprove={(id) => { onApprove(id); setDetail(prev => prev && prev.id === id ? { ...prev, status: 'approved' } : prev); }}
          onDecline={(id) => { onDecline(id); setDetail(prev => prev && prev.id === id ? { ...prev, status: 'rejected' } : prev); }}
        />
      )}
    </div>
  );
}

// ── Team screen ────────────────────────────────────────────────────────────
function TeamScreen({ requests }) {
  const approved = requests.filter(r => r.status === 'approved');
  return (
    <div style={{ flex: 1, padding: 24 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: P.ink, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Team</h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, margin: '0 0 20px' }}>Upcoming and current absences</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 600 }}>
        {approved.length === 0 ? (
          <div style={{ color: P.inkFaint, fontFamily: 'var(--font-body)', fontSize: 13 }}>No upcoming approved leave</div>
        ) : approved.map(req => {
          const emp = EMPLOYEES[req.employee] || { name: req.employee, initials: '?', color: '#e5e7eb' };
          return (
            <div key={req.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 10,
              background: P.white, border: `1px solid ${P.border}`,
            }}>
              <Avatar employeeId={req.employee} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.ink }}>{emp.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, marginTop: 2 }}>
                  {req.startDate === req.endDate ? req.startDate : `${req.startDate} – ${req.endDate}`} · {req.days} {req.days === 1 ? 'day' : 'days'}
                </div>
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft }}>{req.type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Settings screen ────────────────────────────────────────────────────────
function SettingsScreen() {
  return (
    <div style={{ flex: 1, padding: 24 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: P.ink, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Settings</h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, margin: '0 0 20px' }}>Leave policies and company configuration</p>
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
  const [screen, setScreen]   = useState('requests');
  const [requests, setRequests] = useState(() => mergeRequests(initialRequests, readLS()));
  const [toast, setToast]     = useState(null);

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

  const decline = (id) => {
    setRequests(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r);
      writeLS(next);
      return next;
    });
    const req = requests.find(r => r.id === id);
    if (req) setToast(`${(EMPLOYEES[req.employee] || { name: req.employee }).name.split(' ')[0]}'s request declined`);
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div style={{ display: 'flex', height: '100vh', background: P.bg }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        * { box-sizing: border-box; }
      `}</style>

      <Sidebar active={screen} onNav={setScreen} pendingCount={pendingCount} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {screen === 'requests' && <RequestsScreen requests={requests} onApprove={approve} onDecline={decline} />}
        {screen === 'team'     && <TeamScreen requests={requests} />}
        {screen === 'settings' && <SettingsScreen />}
      </div>

      <AppSwitcher />
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
