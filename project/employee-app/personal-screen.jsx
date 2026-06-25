// Personal tab — hub screen for employee-centric features.
// Design reference: Figma node 1872-16071

// ── Success check (transitions.dev #10) ──────────────────────────────────────
(function () {
  if (document.getElementById('t-success-styles')) return;
  const el = document.createElement('style');
  el.id = 't-success-styles';
  el.textContent = `
    :root {
      --check-opacity-dur: 500ms;
      --check-rotate-dur: 500ms;
      --check-rotate-from: 80deg;
      --check-bob-dur: 500ms;
      --check-y-amount: 40px;
      --check-blur-dur: 500ms;
      --check-blur-from: 10px;
      --check-path-dur: 500ms;
      --check-path-delay: 80ms;
      --check-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
      --check-ease-opacity: cubic-bezier(0.22, 1, 0.36, 1);
      --check-ease-rotate: cubic-bezier(0.22, 1, 0.36, 1);
      --check-ease-bob: cubic-bezier(0.34, 1.35, 0.64, 1);
      --check-ease-path: cubic-bezier(0.22, 1, 0.36, 1);
    }
    .t-success-check {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transform-origin: center;
      opacity: 0;
      will-change: transform, opacity, filter;
    }
    .t-success-check svg { display: block; overflow: visible; }
    .t-success-check svg path {
      stroke-dasharray: 20;
      stroke-dashoffset: 20;
    }
    .t-success-check[data-state="in"] {
      animation:
        t-check-fade   var(--check-opacity-dur) var(--check-ease-opacity) forwards,
        t-check-rotate var(--check-rotate-dur)  var(--check-ease-rotate)  forwards,
        t-check-blur   var(--check-blur-dur)    var(--check-ease-out)     forwards,
        t-check-bob    var(--check-bob-dur)     var(--check-ease-bob)     forwards;
    }
    .t-success-check[data-state="in"] svg path {
      animation: t-check-draw var(--check-path-dur) var(--check-ease-path) var(--check-path-delay, 0ms) forwards;
    }
    @keyframes t-check-fade   { from { opacity: 0; } to { opacity: 1; } }
    @keyframes t-check-rotate { from { transform: rotate(var(--check-rotate-from)); } to { transform: rotate(0deg); } }
    @keyframes t-check-blur   { from { filter: blur(var(--check-blur-from)); } to { filter: blur(0); } }
    @keyframes t-check-bob    { from { translate: 0 var(--check-y-amount); } to { translate: 0 0; } }
    @keyframes t-check-draw   { to { stroke-dashoffset: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .t-success-check { animation: none !important; opacity: 1; }
      .t-success-check svg path { animation: none !important; stroke-dashoffset: 0 !important; }
    }
  `;
  document.head.appendChild(el);
})();

function SuccessCheck({ iconName, iconColor, iconBg }) {
  const ref = React.useRef(null);
  const [state, setState] = React.useState('out');

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Measure each path and set its own stroke-dasharray / offset
    el.querySelectorAll('svg path').forEach(p => {
      const len = Math.ceil(p.getTotalLength()) + 1;
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });
    void el.offsetHeight; // force reflow before adding data-state="in"
    setState('in');
  }, []);

  return (
    <span
      ref={ref}
      className="t-success-check"
      data-state={state}
      style={{ width: 72, height: 72, borderRadius: '50%', background: iconBg, marginBottom: 24 }}
    >
      <LucideIcon name={iconName} size={36} color={iconColor} strokeWidth={2} />
    </span>
  );
}

// ── Number pop-in (transitions.dev #02) ──────────────────────────────────────
(function () {
  if (document.getElementById('t-digit-styles')) return;
  const el = document.createElement('style');
  el.id = 't-digit-styles';
  el.textContent = `
    :root {
      --digit-dur: 500ms;
      --digit-distance: 8px;
      --digit-stagger: 70ms;
      --digit-blur: 2px;
      --digit-ease: cubic-bezier(0.34, 1.45, 0.64, 1);
      --digit-dir-x: 0;
      --digit-dir-y: 1;
    }
    @keyframes t-digit-pop-in {
      0%   { transform: translate(calc(var(--digit-distance) * var(--digit-dir-x)), calc(var(--digit-distance) * var(--digit-dir-y))); opacity: 0; filter: blur(var(--digit-blur)); }
      100% { transform: translate(0, 0); opacity: 1; filter: blur(0); }
    }
    .t-digit-group { display: inline-flex; align-items: baseline; }
    .t-digit { display: inline-block; will-change: transform, opacity, filter; }
    .t-digit-group.is-animating .t-digit { animation: t-digit-pop-in var(--digit-dur) var(--digit-ease) both; }
    .t-digit-group.is-animating .t-digit[data-stagger="1"] { animation-delay: var(--digit-stagger); }
    .t-digit-group.is-animating .t-digit[data-stagger="2"] { animation-delay: calc(var(--digit-stagger) * 2); }
    @media (prefers-reduced-motion: reduce) { .t-digit-group .t-digit { animation: none !important; } }
  `;
  document.head.appendChild(el);
})();

// ── Tooltip badge pop-in (transitions.dev #03 badge pop, adapted) ─────────────
(function () {
  if (document.getElementById('t-tooltip-styles')) return;
  const el = document.createElement('style');
  el.id = 't-tooltip-styles';
  el.textContent = `
    @keyframes t-tooltip-pop-in {
      0%   { transform: scale(0.6) translateY(6px); opacity: 0; filter: blur(2px); }
      100% { transform: scale(1)   translateY(0);   opacity: 1; filter: blur(0);  }
    }
    .t-tooltip-pop {
      animation: t-tooltip-pop-in 500ms cubic-bezier(0.34, 1.36, 0.64, 1) both;
      transform-origin: bottom right;
      will-change: transform, opacity, filter;
    }
    @media (prefers-reduced-motion: reduce) {
      .t-tooltip-pop { animation: none !important; }
    }
  `;
  document.head.appendChild(el);
})();

function DigitPopIn({ value, style }) {
  const str = String(value);
  const [animating, setAnimating] = React.useState(false);
  const prevRef = React.useRef(null);

  React.useEffect(() => {
    if (prevRef.current === str) return;
    prevRef.current = str;
    setAnimating(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimating(true)));
  }, [str]);

  const chars = str.split('');
  return (
    <span className={'t-digit-group' + (animating ? ' is-animating' : '')} style={style}>
      {chars.map((ch, i) => {
        const stagger = i === chars.length - 2 ? '1' : i === chars.length - 1 ? '2' : undefined;
        return <span key={i} className="t-digit" data-stagger={stagger}>{ch}</span>;
      })}
    </span>
  );
}

// ── Prototype state: ?state=fresh for new user, default for returning user ──
const _protoState = new URLSearchParams(window.location.search).get('state');

if (!window.__timeOffItems || window.__protoStateApplied !== _protoState) {
  window.__protoStateApplied = _protoState;
  if (_protoState === 'fresh') {
    // Fresh user: full balance, no requests yet
    window.__timeOffItems = [];
    window.__timeOffTaken = 0;
  } else {
    // Returning user: past history + upcoming + pending
    window.__timeOffItems = [
      // Past (before today June 8 2026)
      { id: 'p0', label: 'Sick leave',     date: 'Feb 3–7',      month: 'February',  days: 5, status: 'approved' },
      { id: 'p1', label: 'Legal holiday', date: 'Mar 30–Apr 3', month: 'March',     days: 5, status: 'approved' },
      { id: 'p2', label: 'ADV day',       date: 'Apr 24',       month: 'April',     days: 1, status: 'approved' },
      { id: 'p3', label: 'Legal holiday', date: 'May 18–22',    month: 'May',       days: 5, status: 'approved' },
      { id: 'p4', label: 'Extra-legal leave', date: 'Jun 2',    month: 'June',      days: 1, status: 'approved' },
      // Pending
      { id: 'q1', label: 'Legal holiday', date: 'Jul 14',       month: 'July',      days: 1, status: 'pending'  },
      // Upcoming
      { id: 'u1', label: 'Legal holiday', date: 'Aug 3–7',      month: 'August',    days: 5, status: 'approved' },
      { id: 'u4', label: 'ADV day',       date: 'Aug 21',       month: 'August',    days: 1, status: 'approved' },
      // Admin-recorded
      { id: 'pl1', label: 'Parental leave', date: 'Oct 1–Dec 31', month: 'October', days: 65, status: 'approved', _adminRecorded: true },
    ];
    window.__timeOffTaken = 6; // extra taken days not in items (total 40 − 6 − 18 approved − 2 pending = 14 available)
  }
}

const P = {
  ink:        '#0f0d28',
  inkSoft:    '#50545e',
  border:     '#eaeaeb',
  surface:    '#f7f7f8',
  nameDark:   '#1e1637',
};

const NAV_ITEMS = [
  {
    id:       'my-profile',
    icon:     'CircleUser',
    label:    'My profile',
    subtitle: 'Name, email & address',
    external: false,
  },
  {
    id:       'documents',
    icon:     'FileText',
    label:    'Documents',
    subtitle: 'Annexes, policies & resources',
    external: false,
  },
  {
    id:       'time-off',
    icon:     'CalendarDays',
    label:    'Time off',
    subtitle: 'Balance, requests & history',
    external: false,
  },
];

function PersonalNavRow({ item, onClick }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      style={{
        display: 'flex', alignItems: 'center', gap: 24,
        padding: '16px 0',
        cursor: 'pointer',
      }}>
      <LucideIcon name={item.icon} size={24} color={P.ink} strokeWidth={1.75} />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16,
          color: P.ink, lineHeight: '24px', letterSpacing: '-0.08px',
        }}>{item.label}</div>
        <div style={{
          fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 14,
          color: P.inkSoft, lineHeight: '20px', letterSpacing: '-0.07px',
        }}>{item.subtitle}</div>
      </div>

      <LucideIcon
        name={item.external ? 'ExternalLink' : 'ChevronRight'}
        size={24} color={P.inkSoft} strokeWidth={1.75}
      />
    </div>
  );
}

function PersonalScreen() {
  const nav = window.useNav ? window.useNav() : null;

  const handlePress = (id) => {
    if (!nav) return;
    if (id === 'time-off') nav.push('time-off-hub');
    // other items: placeholders
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      minHeight: '100%', background: 'white',
    }}>
      {/* Scrollable content */}
      <div style={{ flex: 1, padding: '0 0 32px' }}>

        {/* User header */}
        <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24,
              color: P.nameDark, lineHeight: '36px', letterSpacing: '-0.12px',
            }}>David Laurent</div>
            <div style={{
              fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12,
              color: P.inkSoft, lineHeight: '16px', letterSpacing: '-0.06px',
            }}>david@payflip.be</div>
          </div>
          <button aria-label="Help" style={{
            appearance: 'none', border: 'none', background: P.surface,
            cursor: 'pointer', borderRadius: 40, padding: 8,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LucideIcon name="CircleHelp" size={20} color={P.inkSoft} strokeWidth={1.75} />
          </button>
        </div>

        {/* Nav list */}
        <div style={{ padding: '24px 24px 0' }}>
          {NAV_ITEMS.map((item, i) => (
            <div key={item.id}>
              <PersonalNavRow item={item} onClick={() => handlePress(item.id)} />
              {i < NAV_ITEMS.length - 1 && (
                <div style={{ height: 1, background: P.border }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Logout button — pinned to bottom of content */}
      <div style={{ padding: '0 24px 24px' }}>
        <button style={{
          width: '100%', appearance: 'none', border: 'none', cursor: 'pointer',
          background: P.surface, borderRadius: 10,
          padding: '12px 16px', minHeight: 40,
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
          color: P.ink, lineHeight: '24px',
        }}>Logout</button>
      </div>

      {/* Prototype persona switcher */}
      {(() => {
        const current = new URLSearchParams(window.location.search).get('state');
        const isFresh = current === 'fresh';
        const switchTo = (state) => {
          const url = new URL(window.location);
          if (state) { url.searchParams.set('state', state); } else { url.searchParams.delete('state'); }
          window.location.href = url.toString();
        };
        return (
          <div style={{ padding: '0 24px 24px' }}>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
              color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em',
              marginBottom: 8, textAlign: 'center',
            }}>Prototype persona</div>
            <div style={{
              display: 'flex', background: P.surface, borderRadius: 10, padding: 4,
            }}>
              <button onClick={() => switchTo(null)} style={{
                flex: 1, appearance: 'none', border: 'none', cursor: 'pointer',
                borderRadius: 8, padding: '8px 0',
                background: !isFresh ? 'white' : 'transparent',
                boxShadow: !isFresh ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                color: !isFresh ? P.ink : P.inkSoft,
              }}>Returning user</button>
              <button onClick={() => switchTo('fresh')} style={{
                flex: 1, appearance: 'none', border: 'none', cursor: 'pointer',
                borderRadius: 8, padding: '8px 0',
                background: isFresh ? 'white' : 'transparent',
                boxShadow: isFresh ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                color: isFresh ? P.ink : P.inkSoft,
              }}>New user</button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

window.registerScreen('personal', PersonalScreen);

// Leave type → icon/colour chip (used in hub list + detail screen)
const LEAVE_TYPE_CHIP = {
  'Legal holiday':    { icon: 'Palmtree',   bg: '#f0f4f8', color: '#4b6a8a' },
  'ADV day':          { icon: 'Coffee',     bg: '#faf6eb', color: '#d97706' },
  'Extra-legal leave':{ icon: 'Sparkles',   bg: '#f3f1fa', color: '#7c3aed' },
  'Short leave':      { icon: 'Shield',     bg: '#f3f4f6', color: '#6b7280' },
  'Sick leave':       { icon: 'Stethoscope', bg: '#faf0f5', color: '#db2777' },
  'Sick leave (with medical certificate)': { icon: 'Stethoscope', bg: '#faf0f5', color: '#db2777' },
  'Parental leave':   { icon: 'Baby',       bg: '#f9f1f7', color: '#a21caf' },
};
const _getLeaveChip = (label) => LEAVE_TYPE_CHIP[label] || { icon: 'Calendar', bg: '#f3f4f6', color: P.inkSoft };
const TIME_OFF_LABELS = new Set(['Legal holiday', 'ADV day', 'Extra-legal leave', 'Short leave', 'Statutory annual leave', 'ADV / RTT days', 'Time off']);
const _displayLabel = (label) => TIME_OFF_LABELS.has(label) ? 'Time off' : label;
const _displayIcon = (label) => TIME_OFF_LABELS.has(label) ? 'Palmtree' : (_getLeaveChip(label).icon);

// ─────────────────────────────────────────────────────────────
// Desktop Time Off Hub — calendar + request list
// ─────────────────────────────────────────────────────────────
function DesktopTimeOffHub() {
  const nav = window.useNav ? window.useNav() : null;
  const [, setTick] = React.useState(0);
  const [toast, setToast] = React.useState(null);
  const [selectedItemId, setSelectedItemId] = React.useState(null);
  const [menuOpenId, setMenuOpenId] = React.useState(null);
  const [showConfirmId, setShowConfirmId] = React.useState(null);
  const [detailItem, setDetailItem] = React.useState(null);
  const [breakdownOpen, setBreakdownOpen] = React.useState(false);
  const today = new Date(); today.setHours(0,0,0,0);
  const [calMonth, setCalMonth] = React.useState(today.getMonth());
  const [calYear, setCalYear] = React.useState(today.getFullYear());

  React.useEffect(() => {
    window.__refreshTimeOff = () => setTick(t => t + 1);
    window.__showTimeOffToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
    return () => { delete window.__refreshTimeOff; delete window.__showTimeOffToast; };
  }, []);

  // Close menu on outside click / Escape
  React.useEffect(() => {
    if (!menuOpenId) return;
    const close = (e) => {
      if (e.type === 'keydown' && e.key !== 'Escape') return;
      setMenuOpenId(null);
    };
    document.addEventListener('click', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', close); };
  }, [menuOpenId]);

  const _mMap = { January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11 };
  const _moAbbr = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
  const _dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const _moNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const items = window.__timeOffItems || [];
  const total = 40;
  const taken = window.__timeOffTaken || 0;
  const approved = items.filter(i => i.status === 'approved' && !i._adminRecorded).reduce((s, i) => s + i.days, 0);
  const requested = items.filter(i => i.status === 'pending' && !i._adminRecorded).reduce((s, i) => s + i.days, 0);
  const available = total - taken - approved - requested;

  // Parse item date ranges into arrays of ISO date strings
  const _itemDates = (item) => {
    const mo = _mMap[item.month]; if (mo == null) return [];
    const cm = item.date.match(/([A-Z][a-z]{2})\s*(\d+)\s*[–-]\s*([A-Z][a-z]{2})\s*(\d+)/);
    const sm = item.date.match(/(\d+)\s*[–-]\s*(\d+)/);
    let startDay, endDay, startMo, endMo;
    if (cm) {
      startMo = _moAbbr[cm[1]] ?? mo; endMo = _moAbbr[cm[3]] ?? mo;
      startDay = parseInt(cm[2]); endDay = parseInt(cm[4]);
    } else if (sm) {
      startMo = mo; endMo = mo;
      startDay = parseInt(sm[1]); endDay = parseInt(sm[2]);
    } else {
      const dm = item.date.match(/(\d+)/);
      if (!dm) return [];
      return [_toISO(new Date(2026, mo, parseInt(dm[1])))];
    }
    const dates = [];
    const d = new Date(2026, startMo, startDay);
    const end = new Date(2026, endMo, endDay);
    while (d <= end) { dates.push(_toISO(new Date(d))); d.setDate(d.getDate() + 1); }
    return dates;
  };

  // Build statusMap: isoDate → 'pending' | 'approved' | 'admin'
  const statusMap = React.useMemo(() => {
    const map = new Map();
    items.forEach(item => {
      const st = item._adminRecorded ? 'admin' : (item.status === 'pending' ? 'pending' : item.status === 'approved' ? 'approved' : null);
      if (!st) return;
      _itemDates(item).forEach(iso => map.set(iso, st));
    });
    return map;
  }, [items]);

  // Build highlightRange for selected item
  const highlightRange = React.useMemo(() => {
    if (!selectedItemId) return null;
    const item = items.find(i => i.id === selectedItemId);
    if (!item) return null;
    return new Set(_itemDates(item));
  }, [selectedItemId, items]);

  // Item end date for filtering
  const _itemEndDate = (item) => {
    const mo = _mMap[item.month]; if (mo == null) return null;
    const cm = item.date.match(/([A-Z][a-z]{2})\s*(\d+)\s*[–-]\s*([A-Z][a-z]{2})\s*(\d+)/);
    const sm = item.date.match(/(\d+)(?:\s*[–-]\s*(\d+))?/);
    if (cm) return new Date(2026, _moAbbr[cm[3]] ?? mo, parseInt(cm[4]));
    if (sm) return new Date(2026, mo, sm[2] ? parseInt(sm[2]) : parseInt(sm[1]));
    return null;
  };
  const _itemStartDate = (item) => {
    const mo = _mMap[item.month]; if (mo == null) return null;
    const cm = item.date.match(/([A-Z][a-z]{2})\s*(\d+)\s*[–-]\s*([A-Z][a-z]{2})\s*(\d+)/);
    const sm = item.date.match(/(\d+)/);
    if (cm) return new Date(2026, _moAbbr[cm[1]] ?? mo, parseInt(cm[2]));
    if (sm) return new Date(2026, mo, parseInt(sm[1]));
    return null;
  };

  const pending = items.filter(i => i.status === 'pending');
  const needsAttention = pending.filter(i => !i._adminRecorded);
  const approvedItems = items.filter(i => i.status === 'approved');
  const upcoming = approvedItems.filter(i => { const d = _itemEndDate(i); return d && d >= today; });
  const past = approvedItems.filter(i => { const d = _itemEndDate(i); return !d || d < today; });

  // Group by month
  const toGroups = (arr) => {
    const map = new Map();
    arr.forEach(item => { if (!map.has(item.month)) map.set(item.month, []); map.get(item.month).push(item); });
    return Array.from(map.entries()).map(([month, items]) => ({ month, items }));
  };

  const _fmtDate = (item) => {
    const mo = _mMap[item.month]; if (mo == null) return item.date;
    const cm = item.date.match(/([A-Z][a-z]{2})\s*(\d+)\s*[–-]\s*([A-Z][a-z]{2})\s*(\d+)/);
    const sm = item.date.match(/(\d+)\s*[–-]\s*(\d+)/);
    const fmt = (d, m) => `${_dayNames[new Date(2026, m, d).getDay()]} ${d} ${_moNames[m]}`;
    if (cm) {
      const sMo = _moAbbr[cm[1]] ?? mo, eMo = _moAbbr[cm[3]] ?? mo;
      return <>{fmt(parseInt(cm[2]), sMo)} <LucideIcon name="MoveRight" size={13} color="currentColor" strokeWidth={2} style={{display:'inline',verticalAlign:'middle',position:'relative',top:-1}} /> {fmt(parseInt(cm[4]), eMo)}</>;
    } else if (sm) {
      return <>{fmt(parseInt(sm[1]), mo)} <LucideIcon name="MoveRight" size={13} color="currentColor" strokeWidth={2} style={{display:'inline',verticalAlign:'middle',position:'relative',top:-1}} /> {fmt(parseInt(sm[2]), mo)}</>;
    } else {
      const dm = item.date.match(/(\d+)/); if (!dm) return item.date;
      return fmt(parseInt(dm[1]), mo);
    }
  };

  const handleSelectItem = (item) => {
    setDetailItem(item);
    setSelectedItemId(item.id);
    const sd = _itemStartDate(item);
    if (sd) { setCalMonth(sd.getMonth()); setCalYear(sd.getFullYear()); }
  };

  const handleCancel = (item) => {
    if (window.__timeOffItems) {
      window.__timeOffItems = window.__timeOffItems.filter(i => i.id !== item.id);
    }
    setShowConfirmId(null); setMenuOpenId(null); setSelectedItemId(null);
    setTick(t => t + 1);
    setToast('Request cancelled');
    setTimeout(() => setToast(null), 3000);
  };

  const ItemRow = ({ item }) => {
    const _icon = _displayIcon(item.label);
    const _label = _displayLabel(item.label);
    const isSelected = selectedItemId === item.id;
    return (
      <div
        onClick={() => handleSelectItem(item)}
        style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '10px 0', cursor: 'pointer',
          background: 'transparent',
          transition: 'background 120ms ease-out',
          position: 'relative',
        }}>
        <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: '#eeeff0',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LucideIcon name={_icon} size={22} color={P.inkSoft} strokeWidth={1.75} />
          </div>
          {item.status === 'approved' && (
            <div style={{
              position: 'absolute', top: -6, right: -6,
              width: 18, height: 18, borderRadius: '50%',
              background: '#dcfce7', border: '2px solid #f7f7f8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LucideIcon name="Check" size={11} color="#16a34a" strokeWidth={2.5} />
            </div>
          )}
          {item.status === 'pending' && (
            <div style={{
              position: 'absolute', top: -6, right: -6,
              width: 18, height: 18, borderRadius: '50%',
              background: '#fef3c7', border: '2px solid #f7f7f8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LucideIcon name="Clock" size={10} color="#d97706" strokeWidth={2.5} />
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: P.ink }}>{_label}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, marginTop: 2 }}>
            {_fmtDate(item)} · {item.days === 1 ? '1 day' : `${item.days} days`}
          </div>
        </div>
        <LucideIcon name="ChevronRight" size={18} color="#9ca3af" strokeWidth={2} />
      </div>
    );
  };

  return (
    <div style={{ padding: '32px 0', minHeight: '100%', background: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28,
          letterSpacing: '-0.04em', color: P.ink, margin: 0,
        }}>Time off</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {past.length > 0 && (
            <button onClick={() => nav && nav.push('time-off-history')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 10,
              border: `1px solid ${P.border}`, background: 'white', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: P.ink,
            }}>Leave history</button>
          )}
          <button onClick={() => nav && nav.push('request-time-off')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            border: 'none', background: P.ink, cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'white',
          }}>
            <LucideIcon name="Plus" size={15} color="white" strokeWidth={2.5} /> Request time off
          </button>
        </div>
      </div>

      {/* Balance card + request list side by side */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        {/* Left — Balance card (4 of 10 cols @ 80px + 32px gutter) */}
        <div style={{
          background: '#F7F7F8', borderRadius: 16, padding: 24,
          display: 'flex', flexDirection: 'column', gap: 12,
          width: 416, flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, letterSpacing: '-0.04em', color: P.ink, lineHeight: '40px' }}>
              {available} days
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: P.inkSoft, marginTop: 8 }}>
              available to book · {total} entitled
            </div>
          </div>
          <button
            onClick={() => setBreakdownOpen(true)}
            style={{
              appearance: 'none', cursor: 'pointer',
              border: 'none', background: 'transparent', padding: 0,
              marginTop: 4,
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: P.inkSoft,
              display: 'inline-flex', alignItems: 'center', gap: 2,
              textDecoration: 'underline', textUnderlineOffset: 3,
            }}>
            View full breakdown
            <LucideIcon name="ChevronRight" size={14} color={P.inkSoft} strokeWidth={2} />
          </button>
        </div>

        {/* Right — Request lists stacked */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {needsAttention.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: P.ink, margin: '0 0 12px' }}>Waiting for approval</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {needsAttention.map(item => <ItemRow key={item.id} item={item} />)}
              </div>
            </div>
          )}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: P.ink, margin: '0 0 12px' }}>Approved time off</h2>
            {upcoming.length > 0 ? (
              <div>
                {toGroups(upcoming).map(({ month, items: groupItems }, gi) => (
                  <div key={month} style={{ marginTop: gi > 0 ? 20 : 0 }}>
                    {upcoming.length > 2 && (
                      <div style={{
                        padding: '4px 0 6px',
                        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
                        color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>{month}</div>
                    )}
                    {groupItems.map(item => <ItemRow key={item.id} item={item} />)}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '32px 20px', textAlign: 'center', borderRadius: 12, border: `1px solid ${P.border}` }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft }}>No approved time off</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
          background: P.ink, color: '#fff', padding: '10px 20px', borderRadius: 12,
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
          zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <LucideIcon name="Check" size={16} color="#fff" strokeWidth={2.5} />
          {toast}
        </div>
      )}

      {/* Detail modal */}
      {detailItem && (() => {
        const item = detailItem;
        const st = item._adminRecorded
          ? { ...DETAIL_STATUS[item.status] || DETAIL_STATUS.approved, label: 'Recorded by Sophie L.' }
          : (DETAIL_STATUS[item.status] || DETAIL_STATUS.approved);
        const _dN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const _mN2 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const _mA2 = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
        const mo = _mMap[item.month];
        const fmt = (d, m) => `${_dN[new Date(2026, m, d).getDay()]} ${d} ${_mN2[m]}`;
        const dateDisplay = (() => {
          const cm = item.date.match(/([A-Z][a-z]{2})\s*(\d+)\s*[–-]\s*([A-Z][a-z]{2})\s*(\d+)/);
          const sm = item.date.match(/(\d+)\s*[–-]\s*(\d+)/);
          if (cm) {
            const sMo = _mA2[cm[1]] ?? mo, eMo = _mA2[cm[3]] ?? mo;
            return <>{fmt(parseInt(cm[2]), sMo)} <LucideIcon name="MoveRight" size={13} color="currentColor" strokeWidth={2} style={{display:'inline',verticalAlign:'middle',position:'relative',top:-1}} /> {fmt(parseInt(cm[4]), eMo)}</>;
          } else if (sm) {
            return <>{fmt(parseInt(sm[1]), mo)} <LucideIcon name="MoveRight" size={13} color="currentColor" strokeWidth={2} style={{display:'inline',verticalAlign:'middle',position:'relative',top:-1}} /> {fmt(parseInt(sm[2]), mo)}</>;
          } else {
            const dm = item.date.match(/(\d+)/); if (!dm) return item.date;
            return fmt(parseInt(dm[1]), mo);
          }
        })();
        const _payInfoMap = {
          'Legal holiday':    { simple: 'Full pay' },
          'ADV day':          { simple: 'Full pay' },
          'Extra-legal leave':{ simple: 'Full pay' },
          'Short leave':      { simple: 'Full pay' },
          'Sick leave': { phases: [
            { period: 'Month 1',  amount: 'Full pay', payer: 'Employer' },
            { period: 'Month 2+', amount: '~65%',     payer: 'Mutuelle · INAMI' },
          ]},
          'Sick leave (with medical certificate)': { phases: [
            { period: 'Month 1',  amount: 'Full pay', payer: 'Employer' },
            { period: 'Month 2+', amount: '~65%',     payer: 'Mutuelle · INAMI' },
          ]},
          'Parental leave': { phases: [
            { period: 'Full period', amount: '~82%', payer: 'Mutuelle · INAMI' },
          ]},
        };
        const payInfo = _payInfoMap[item.label];
        const DetailRow = ({ label, value, children }) => (
          <div style={{ padding: '12px 0' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, marginBottom: 2 }}>{label}</div>
            {value && <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: P.ink }}>{value}</div>}
            {children}
          </div>
        );
        return (
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => { setDetailItem(null); setSelectedItemId(null); }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{
              background: 'white', borderRadius: 20, maxWidth: 480, width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'auto', maxHeight: '90vh',
            }}>
              {/* Header */}
              <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, letterSpacing: '-0.04em', color: P.ink, lineHeight: '40px' }}>
                    {item.days === 1 ? '1 day' : `${item.days} days`}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16, color: P.ink, marginTop: 6 }}>
                    {dateDisplay}
                  </div>
                </div>
                <button
                  onClick={() => { setDetailItem(null); setSelectedItemId(null); }}
                  style={{ width: 36, height: 36, borderRadius: 8, background: P.surface, border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <LucideIcon name="X" size={20} color={P.ink} strokeWidth={2} />
                </button>
              </div>

              {/* Details section */}
              <div style={{ marginTop: 20, borderTop: `1px solid ${P.border}` }}>
                <div style={{ padding: '12px 24px', background: '#f7f7f8', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: P.ink }}>Details</div>
              </div>
              <div style={{ padding: '0 24px' }}>
                <DetailRow label="Leave type" value={item.label} />
                <DetailRow
                  label={item._adminRecorded ? 'Recorded by' : item.status === 'approved' ? 'Approved by' : item.status === 'pending' ? 'Pending review' : 'Denied by'}
                  value={item._adminRecorded ? 'Sophie L. · HR admin' : item.status === 'pending' ? 'Waiting for Sophie L.' : 'Sophie L.'}
                />
                {payInfo && (
                  <DetailRow label="Pay" value={payInfo.simple || null}>
                    {payInfo.phases && (
                      <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {payInfo.phases.map((ph, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 12, color: P.inkSoft, minWidth: 72 }}>{ph.period}</span>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: P.ink }}>{ph.amount}</span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft }}>via {ph.payer}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </DetailRow>
                )}
                {item._notes && <DetailRow label="Notes" value={item._notes} />}
                {item._halfDay && Object.keys(item._halfDay).length > 0 && (
                  <DetailRow label="Half days" value={
                    Object.entries(item._halfDay).map(([iso, val]) => {
                      const p = iso.split('-');
                      const d = new Date(+p[0], +p[1]-1, +p[2]);
                      return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ' — ' + (val === 'am' ? 'Morning' : 'Afternoon');
                    }).join(', ')
                  } />
                )}
              </div>

              {/* Timeline */}
              <div style={{ borderTop: `1px solid ${P.border}` }}>
                <div style={{ padding: '12px 24px', background: '#f7f7f8', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: P.ink }}>Timeline</div>
              </div>
              <div style={{ padding: '16px 24px 4px' }}>
                <div style={{ display: 'none' }}></div>
                {item.status === 'approved' && (
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: 'rgb(22,163,74)', paddingTop: 3, lineHeight: 1 }}>●</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.ink }}>{item._adminRecorded ? 'Recorded by Sophie L.' : 'Approved by Sophie L.'}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Nov 16, 2025</div>
                    </div>
                  </div>
                )}
                {!item._adminRecorded && (
                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: P.inkSoft, paddingTop: 3, lineHeight: 1 }}>●</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.ink }}>Requested</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Nov 16, 2025</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {!item._adminRecorded && (
                <div style={{ display: 'flex', gap: 12, padding: '20px 24px 24px' }}>
                  <button onClick={() => { setDetailItem(null); setShowConfirmId(item.id); }} style={{
                    flex: 1, padding: '12px 0', borderRadius: 10,
                    border: `1px solid #fecaca`, background: 'white', cursor: 'pointer',
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: '#dc2626',
                  }}>Cancel request</button>
                  <button onClick={() => { setDetailItem(null); nav && nav.push('request-time-off', { editItem: item }); }} style={{
                    flex: 1, padding: '12px 0', borderRadius: 10,
                    border: 'none', background: P.ink, cursor: 'pointer',
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'white',
                  }}>Edit</button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Cancel confirmation */}
      {showConfirmId && (() => {
        const item = items.find(i => i.id === showConfirmId);
        if (!item) return null;
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} onClick={() => setShowConfirmId(null)}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: 'white', borderRadius: 16, padding: 24, maxWidth: 400, width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: P.ink, margin: '0 0 8px' }}>Cancel this request?</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, margin: '0 0 20px', lineHeight: '20px' }}>
                This will cancel your {item.days === 1 ? '1 day' : `${item.days} days`} of {_displayLabel(item.label).toLowerCase()} and notify your manager.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowConfirmId(null)} style={{
                  flex: 1, padding: '12px 0', borderRadius: 10,
                  border: `1px solid ${P.border}`, background: 'white', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.ink,
                }}>Keep request</button>
                <button onClick={() => handleCancel(item)} style={{
                  flex: 1, padding: '12px 0', borderRadius: 10,
                  border: 'none', background: '#dc2626', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'white',
                }}>Cancel request</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Balance breakdown modal */}
      {breakdownOpen && (() => {
        const PLANNABLE_TYPES = [
          { name: 'Statutory annual leave', remaining: 2, total: 20, expires: 'Unused days carry over until Apr 30, 2027' },
          { name: 'ADV / RTT', remaining: 5, total: 12, expires: null },
          { name: 'Extra-legal leave', remaining: 3, total: 4, expires: null },
        ];
        const OTHER_TYPES = [
          { name: 'Illness carry-over (2024)', remaining: 4, total: 4, expires: 'Must use before Dec 31, 2026', urgent: true },
        ];
        const allTypes = [...PLANNABLE_TYPES, ...OTHER_TYPES];
        const renderRow = (lt, i) => {
          const pct = lt.total > 0 ? lt.remaining / lt.total : 0;
          const countColor = pct <= 0.2 ? '#dc2626' : pct <= 0.35 ? '#b45309' : P.ink;
          return (
            <div key={lt.name} style={{ padding: '11px 0', borderBottom: i < allTypes.length - 1 ? `1px solid ${P.border}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: P.ink }}>{lt.name}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, flexShrink: 0 }}>
                  <span style={{ fontWeight: 600, color: countColor }}>{lt.remaining}</span>
                  <span style={{ color: P.inkSoft, fontWeight: 400 }}> of {lt.total}</span>
                </div>
              </div>
              {lt.expires && (
                <div style={{ marginTop: 2, fontFamily: 'var(--font-body)', fontSize: 12, color: lt.urgent ? '#b45309' : P.inkSoft }}>{lt.expires}</div>
              )}
            </div>
          );
        };
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} onClick={() => setBreakdownOpen(false)}>
            <div onClick={(e) => e.stopPropagation()} style={{
              background: 'white', borderRadius: 16, padding: 0, maxWidth: 480, width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
            }}>
              <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: P.ink }}>Your leave balance 2026</div>
                <button onClick={() => setBreakdownOpen(false)} aria-label="Close" style={{
                  width: 36, height: 36, borderRadius: 10, border: 'none', background: 'transparent',
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: -8, marginTop: -4, flexShrink: 0,
                }}>
                  <LucideIcon name="X" size={22} color={P.ink} strokeWidth={1.75} />
                </button>
              </div>
              <div style={{ padding: '8px 24px 24px' }}>
                {allTypes.map((lt, i) => renderRow(lt, i))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Time Off Hub — balance card + sticky CTA
// ─────────────────────────────────────────────────────────────
function TimeOffHubScreen() {
  const nav = window.useNav ? window.useNav() : null;
  const isDesktop = window.ViewModeContext ? React.useContext(window.ViewModeContext) === 'desktop' : false;
  const [, setTick] = React.useState(0);
  const [toast, setToast] = React.useState(null);
  const [showBalanceInfo, setShowBalanceInfo] = React.useState(false);
  const [balanceSheetOpen, setBalanceSheetOpen] = React.useState(false);
  const [balanceSheetAnimating, setBalanceSheetAnimating] = React.useState(false);
  const [expandedRows, setExpandedRows] = React.useState({});
  const [balanceDetailOpen, setBalanceDetailOpen] = React.useState(false);
  const toggleRow = React.useCallback((key) => {
    setExpandedRows(prev => ({ [key]: !prev[key] }));
  }, []);

  React.useEffect(() => {
    // Register callbacks so the detail screen can trigger updates
    window.__refreshTimeOff = () => setTick(t => t + 1);
    window.__showTimeOffToast = (msg) => {
      setToast(msg);
      setTimeout(() => setToast(null), 3000);
    };
    return () => {
      delete window.__refreshTimeOff;
      delete window.__showTimeOffToast;
    };
  }, []);

  // Today's date
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // Balance — derived from live items list
  const items    = window.__timeOffItems || [];
  const total    = 40;
  const taken    = window.__timeOffTaken || 0;
  const approved  = items.filter(i => i.status === 'approved' && !i._adminRecorded).reduce((sum, i) => sum + i.days, 0);
  const requested = items.filter(i => i.status === 'pending'  && !i._adminRecorded).reduce((sum, i) => sum + i.days, 0);
  const available = total - taken - approved - requested;
  // Past approved items (used for "View history" link visibility)
  const _hubMMap = { January:0, February:1, March:2, April:3, May:4, June:5, July:6, August:7, September:8, October:9, November:10, December:11 };
  const _hubToday = new Date(); _hubToday.setHours(0,0,0,0);
  const past = items.filter(i => i.status === 'approved').filter(i => {
    const mo = _hubMMap[i.month];
    if (mo == null) return false;
    const dm = i.date.match(/(\d+)(?:\s*[–-]\s*(\d+))?/);
    if (!dm) return false;
    const eDay = dm[2] ? parseInt(dm[2]) : parseInt(dm[1]);
    return new Date(2026, mo, eDay) < _hubToday;
  });

  if (isDesktop) return <DesktopTimeOffHub />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'white' }}>

      {/* Back nav */}
      <NavBar />

      {/* Scrollable content */}
      <div style={{ flex: 1, padding: isDesktop ? '0 32px 32px' : '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Balance section */}
        {(() => {
          const _bToday = new Date(); _bToday.setHours(0,0,0,0);
          const _bMMap = { January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11 };
          const _bEndDate = (item) => {
            const mo = _bMMap[item.month]; if (mo == null) return null;
            const dm = item.date.match(/(\d+)(?:\s*[–-]\s*(\d+))?/); if (!dm) return null;
            const eDay = dm[2] ? parseInt(dm[2]) : parseInt(dm[1]);
            const eMo = item.date.match(/([A-Z][a-z]+)\s*\d+\s*$/) ? _bMMap[item.date.match(/([A-Z][a-z]+)\s*\d+\s*$/)[1]] : mo;
            return new Date(2026, eMo ?? mo, eDay);
          };
          const nonAdmin = items.filter(i => !i._adminRecorded);
          const takenDays = taken + nonAdmin.filter(i => i.status === 'approved' && (() => { const d = _bEndDate(i); return !d || d < _bToday; })()).reduce((s, i) => s + i.days, 0);
          const approvedDays = nonAdmin.filter(i => i.status === 'approved' && (() => { const d = _bEndDate(i); return d && d >= _bToday; })()).reduce((s, i) => s + i.days, 0);
          const requestedDays = requested;
          const availableDays = total - takenDays - approvedDays - requestedDays;

          const openSheet = () => { setShowBalanceInfo(true); setBalanceSheetAnimating(true); requestAnimationFrame(() => requestAnimationFrame(() => { setBalanceSheetOpen(true); setTimeout(() => setBalanceSheetAnimating(false), 340); })); };

          const rows = [
            { label: 'Taken',    days: takenDays,     dot: '#94a3b8' },
            { label: 'Approved', days: approvedDays,  dot: '#22c55e' },
            { label: 'Requested',days: requestedDays, dot: '#f59e0b' },
          ];

          return (
            <div
              style={{
                background: '#F7F7F8', borderRadius: 16,
                padding: 24,
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, letterSpacing: '-0.04em', color: P.ink, lineHeight: '40px' }}>
                  <DigitPopIn value={availableDays} /> days
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: P.inkSoft, marginTop: 2 }}>
                  available to book · {total} entitled
                </div>
              </div>
              <button
                onClick={openSheet}
                style={{
                  appearance: 'none', cursor: 'pointer',
                  border: 'none', background: 'transparent', padding: 0,
                  marginTop: 16,
                  fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: P.inkSoft,
                  display: 'inline-flex', alignItems: 'center', gap: 2,
                  textDecoration: 'underline', textUnderlineOffset: 3,
                }}>
                View full breakdown
                <LucideIcon name="ChevronRight" size={14} color={P.inkSoft} strokeWidth={2} />
              </button>
            </div>
          );
        })()}
        {/* end Leave balance section */}

        {/* Sections: pending requests + upcoming approved */}
        {(() => {
          const ALL = window.__timeOffItems || [];

          const pending  = ALL.filter(i => i.status === 'pending');
          const denied   = ALL.filter(i => i.status === 'denied');

          // Split approved into upcoming (future) vs past
          const _mMap = { January:0, February:1, March:2, April:3, May:4, June:5, July:6, August:7, September:8, October:9, November:10, December:11 };
          const _today = new Date(); _today.setHours(0,0,0,0);
          const _itemEndDate = (item) => {
            const mo = _mMap[item.month];
            if (mo == null) return null;
            const dm = item.date.match(/(\d+)(?:\s*[–-]\s*(\d+))?/);
            if (!dm) return null;
            const eDay = dm[2] ? parseInt(dm[2]) : parseInt(dm[1]);
            return new Date(2026, mo, eDay);
          };
          const _dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
          const _moNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const _moAbbr = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
          const _formatDate = (item) => {
            const mo = _mMap[item.month];
            if (mo == null) return item.date;
            // Parse cross-month ranges like "Mar 30–Apr 3" or simple "Aug 3–7" or "Aug 21"
            const cm = item.date.match(/([A-Z][a-z]{2})\s*(\d+)\s*[–-]\s*([A-Z][a-z]{2})\s*(\d+)/);
            const sm = item.date.match(/(\d+)\s*[–-]\s*(\d+)/);
            const sdow = (d, m) => _dayNames[new Date(2026, m, d).getDay()];
            const fmt = (d, m) => `${sdow(d, m)} ${d} ${_moNames[m]}`;
            if (cm) {
              const startMo = _moAbbr[cm[1]] ?? mo;
              const endMo   = _moAbbr[cm[3]] ?? mo;
              const startDay = parseInt(cm[2]), endDay = parseInt(cm[4]);
              return <>{fmt(startDay, startMo)} <LucideIcon name="MoveRight" size={13} color="currentColor" strokeWidth={2} style={{display:'inline',verticalAlign:'middle',position:'relative',top:-1}} /> {fmt(endDay, endMo)}</>;
            } else if (sm) {
              const startDay = parseInt(sm[1]), endDay = parseInt(sm[2]);
              return <>{fmt(startDay, mo)} <LucideIcon name="MoveRight" size={13} color="currentColor" strokeWidth={2} style={{display:'inline',verticalAlign:'middle',position:'relative',top:-1}} /> {fmt(endDay, mo)}</>;
            } else {
              const dm = item.date.match(/(\d+)/);
              if (!dm) return item.date;
              return <>{fmt(parseInt(dm[1]), mo)}</>;
            }
          };
          const allApproved = ALL.filter(i => i.status === 'approved');
          const upcoming = allApproved.filter(i => { const d = _itemEndDate(i); return d && d >= _today; });
          const past     = allApproved.filter(i => { const d = _itemEndDate(i); return !d || d < _today; });

          // Group items by month into cards — robust regardless of sort order
          const toGroups = (items) => {
            const map = new Map();
            items.forEach(item => {
              if (!map.has(item.month)) map.set(item.month, []);
              map.get(item.month).push(item);
            });
            return Array.from(map.entries()).map(([month, items]) => ({ month, items }));
          };

          const SectionTitle = ({ label, action, actionAriaLabel }) => (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
                letterSpacing: '-0.003em', color: P.ink, margin: 0,
              }}>{label}</h2>
              {action && (
                <button
                  aria-label={actionAriaLabel || action}
                  style={{
                    appearance: 'none', border: 'none', background: 'transparent',
                    cursor: 'pointer', padding: 0,
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                    color: P.ink, textDecoration: 'underline', textUnderlineOffset: 2,
                  }}>{action}</button>
              )}
            </div>
          );

          const ItemCard = ({ items }) => {
            const showMonthHeaders = items.length > 2;
            const vPad = '10px 0';
            const iconSize = 40;
            const iconRadius = 12;
            const iconInner = 20;
            return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {toGroups(items).map(({ month, items: groupItems }, groupIdx, arr) => (
                <div key={month}>
                  {showMonthHeaders && (
                  <div style={{
                    padding: '4px 0 6px',
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
                    color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{month}</div>
                  )}
                  {groupItems.map((item, itemIdx) => {
                    const _icon = _displayIcon(item.label);
                    const _label = _displayLabel(item.label);
                    return (
                      <div key={item.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`${_label}, ${item.days === 1 ? '1 day' : item.days + ' days'}, ${item.date}`}
                        onClick={() => nav && nav.push('time-off-detail', { item })}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nav && nav.push('time-off-detail', { item }); } }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: vPad,
                          borderBottom: 'none',
                          cursor: 'pointer',
                        }}>
                        <div style={{ position: 'relative', width: iconSize, height: iconSize, flexShrink: 0 }}>
                          <div style={{
                            width: iconSize, height: iconSize, borderRadius: iconRadius,
                            background: '#f3f4f6',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <LucideIcon name={_icon} size={iconInner} color={P.inkSoft} strokeWidth={1.75} />
                          </div>
                          {item.status === 'approved' && (
                            <div style={{
                              position: 'absolute', top: -7, right: -7,
                              width: 16, height: 16, borderRadius: '50%',
                              background: '#dcfce7', border: '2px solid white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <LucideIcon name="Check" size={10} color="#16a34a" strokeWidth={2.5} />
                            </div>
                          )}
                          {item.status === 'pending' && (
                            <div style={{
                              position: 'absolute', top: -7, right: -7,
                              width: 16, height: 16, borderRadius: '50%',
                              background: '#fef3c7', border: '2px solid white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <LucideIcon name="Clock" size={9} color="#b45309" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.ink, lineHeight: '20px' }}>
                            {_label}
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, lineHeight: '18px' }}>
                            <span style={{ fontWeight: 500, color: P.inkSoft }}>{_formatDate(item)}</span>
                            <span style={{ fontWeight: 400, color: P.inkSoft }}>{' · '}{item.days === 1 ? '1 day' : `${item.days} days`}</span>
                          </div>
                        </div>
                        <LucideIcon name="ChevronRight" size={18} color={P.inkSoft} strokeWidth={2} />
                      </div>
                    );
                  })}
                  {groupIdx < arr.length - 1 && (
                    <div style={{ height: showMonthHeaders ? 12 : 8 }} />
                  )}
                </div>
              ))}
            </div>
            );
          };

          const hasAny = pending.length > 0 || denied.length > 0 || upcoming.length > 0 || past.length > 0;

          const needsAttention = [...pending, ...denied];
          const needsAttentionGap = needsAttention.length <= 2 ? 6 : 12;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {!hasAny && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '32px 16px', textAlign: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', background: '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <LucideIcon name="CalendarDays" size={28} color="#9ca3af" strokeWidth={1.5} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: P.ink }}>
                    No time off yet
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, lineHeight: '20px', maxWidth: 260 }}>
                    You have {available} days available. Tap below to request your first day off.
                  </div>
                </div>
              )}
              {needsAttention.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: needsAttentionGap }}>
                  <SectionTitle label="Waiting for approval" />
                  <ItemCard items={needsAttention} />
                </div>
              )}
              {upcoming.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <SectionTitle label="Approved time off" />
                  <ItemCard items={upcoming} />
                </div>
              )}
            </div>
          );
        })()}

        {/* Leave history link */}
        {past.length > 0 && (
          <button
            aria-label="View leave history"
            onClick={() => nav && nav.push('time-off-history')}
            style={{
              appearance: 'none', border: 'none', background: 'transparent',
              cursor: 'pointer', padding: 0, alignSelf: 'flex-start',
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14,
              color: P.inkSoft, textDecoration: 'underline', textUnderlineOffset: 3,
            }}>Leave history</button>
        )}

      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'sticky', bottom: 0,
        padding: '12px 16px 32px',
        background: 'white',
        borderTop: `1px solid ${P.border}`,
      }}>
        <Button
          variant="primary" size="large" fullWidth
          onClick={() => nav && nav.push('request-time-off')}>
          Request time off
        </Button>
      </div>

      {/* Balance info bottom sheet */}
      {showBalanceInfo && (() => {
        const appShell = document.querySelector('[data-app-shell]');
        if (!appShell) return null;

        const PLANNABLE_TYPES = [
          {
            name: 'Statutory annual leave',
            remaining: _isFreshUser ? 20 : 2, total: 20,
            expires: 'Unused days carry over until Apr 30, 2027',
            rule: 'Carry-over only if blocked by certified long-term illness.',
            icon: 'Palmtree', iconBg: '#eef4fb', iconColor: '#2563eb',
          },
          {
            name: 'ADV / RTT',
            remaining: _isFreshUser ? 12 : 5, total: 12,
            expires: null,
            rule: 'No carry-over, no cash payout permitted.',
            icon: 'Coffee', iconBg: '#faf6eb', iconColor: '#d97706',
          },
          {
            name: 'Extra-legal leave',
            remaining: _isFreshUser ? 4 : 3, total: 4,
            expires: null,
            rule: 'Up to 2 days may carry until Mar 31, 2027.',
            icon: 'Sparkles', iconBg: '#f3f1fa', iconColor: '#7c3aed',
          },
        ];
        const OTHER_TYPES = [
          {
            name: 'Illness carry-over (2024)',
            remaining: 4, total: 4,
            expires: 'Must use before Dec 31, 2026',
            rule: 'Legal carry-over due to 2024 medical incapacity. Not counted in your plannable balance — HR applies it automatically.',
            urgent: true,
            icon: 'AlertCircle', iconBg: 'rgb(254,243,199)', iconColor: 'rgb(161,98,7)',
          },
        ];
        // Time off that doesn't touch the balance above

        return ReactDOM.createPortal(
          <div
            style={{ position: 'absolute', inset: 0, zIndex: 400, background: 'rgba(15,13,40,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              opacity: balanceSheetOpen ? 1 : 0, transition: 'opacity 300ms ease' }}
            onClick={(e) => { if (e.target === e.currentTarget) { setBalanceSheetAnimating(true); setBalanceSheetOpen(false); setTimeout(() => { setShowBalanceInfo(false); setExpandedRows({}); setBalanceSheetAnimating(false); }, 340); } }}
            onKeyDown={(e) => { if (e.key === 'Escape') { setBalanceSheetAnimating(true); setBalanceSheetOpen(false); setTimeout(() => { setShowBalanceInfo(false); setExpandedRows({}); setBalanceSheetAnimating(false); }, 340); } }}
          >
            <div
              role="dialog" aria-modal="true" aria-labelledby="balance-info-title"
              style={{ background: 'white', borderRadius: '20px 20px 0 0', display: 'flex', flexDirection: 'column', maxHeight: '88%',
                overflow: 'hidden',
                transform: balanceSheetOpen ? 'translateY(0)' : 'translateY(100%)', transition: 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)',
                willChange: 'transform', backfaceVisibility: 'hidden' }}
            >
              {/* Sticky header */}
              <div style={{ padding: '20px 20px 0', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 0 }}>
                  <div id="balance-info-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: P.ink }}>
                    Your leave balance 2026
                  </div>
                  <button
                    onClick={() => { setBalanceSheetAnimating(true); setBalanceSheetOpen(false); setTimeout(() => { setShowBalanceInfo(false); setExpandedRows({}); setBalanceSheetAnimating(false); }, 340); }}
                    aria-label="Close"
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      border: 'none', background: 'transparent', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      marginRight: -8, marginTop: -4, flexShrink: 0,
                    }}>
                    <LucideIcon name="X" size={22} color={P.ink} strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="hide-scrollbar" style={{ overflowY: 'auto', flex: 1, padding: '8px 20px 8px' }}>

                {(() => {
                  const allTypes = [...PLANNABLE_TYPES, ...OTHER_TYPES];

                  const renderRow = (lt, i, arr) => {
                    const isLast = i === arr.length - 1;
                    const pct = lt.total > 0 ? lt.remaining / lt.total : 0;
                    const countColor = pct <= 0.2 ? '#dc2626' : pct <= 0.35 ? '#b45309' : P.ink;
                    return (
                      <div key={lt.name} style={{ padding: '11px 0', borderBottom: isLast ? 'none' : `1px solid ${P.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: P.ink }}>
                            {lt.name}
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, flexShrink: 0, whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: 600, color: countColor }}>{lt.remaining}</span>
                            <span style={{ color: P.inkSoft, fontWeight: 400 }}> of {lt.total}</span>
                          </div>
                        </div>
                        {lt.expires && (
                          <div style={{ marginTop: 2, fontFamily: 'var(--font-body)', fontSize: 12, color: lt.urgent ? '#b45309' : P.inkSoft }}>
                            {lt.expires}
                          </div>
                        )}
                      </div>
                    );
                  };

                  return allTypes.map(renderRow);
                })()}

              </div>

              <div style={{ height: 32, flexShrink: 0 }} />
            </div>
          </div>,
          appShell
        );
      })()}

      {/* Toast */}
      {toast && (() => {
        const appShell = document.querySelector('[data-app-shell]');
        if (!appShell) return null;
        return ReactDOM.createPortal(
          <div
            role="status" aria-live="polite" aria-atomic="true"
            style={{
              position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
              zIndex: 300, whiteSpace: 'nowrap',
              background: 'rgb(22,163,74)', color: 'white',
              borderRadius: 12, padding: '10px 18px',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
            <LucideIcon name="CircleCheck" size={16} color="white" strokeWidth={2} />
            {toast}
          </div>,
          appShell
        );
      })()}

    </div>
  );
}

window.registerScreen('time-off-hub', TimeOffHubScreen);

// ─────────────────────────────────────────────────────────────
// Time Off History — past approved items grouped by month
// ─────────────────────────────────────────────────────────────

function TimeOffHistoryScreen() {
  const nav = window.useNav ? window.useNav() : null;
  const isDesktop = window.ViewModeContext ? React.useContext(window.ViewModeContext) === 'desktop' : false;
  const ALL = window.__timeOffItems || [];

  const _mMap = { January:0, February:1, March:2, April:3, May:4, June:5, July:6, August:7, September:8, October:9, November:10, December:11 };
  const _dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const _moNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const _moAbbr = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
  const _today = new Date(); _today.setHours(0,0,0,0);
  const _currentYear = _today.getFullYear();

  const [selectedYear, setSelectedYear] = React.useState(_currentYear);
  const [yearPickerOpen, setYearPickerOpen] = React.useState(false);

  const _itemEndDate = (item) => {
    const mo = _mMap[item.month];
    if (mo == null) return null;
    const dm = item.date.match(/(\d+)(?:\s*[–-]\s*(\d+))?/);
    if (!dm) return null;
    const eDay = dm[2] ? parseInt(dm[2]) : parseInt(dm[1]);
    return new Date(2026, mo, eDay);
  };

  const _formatDate = (item) => {
    const mo = _mMap[item.month];
    if (mo == null) return item.date;
    const cm = item.date.match(/([A-Z][a-z]{2})\s*(\d+)\s*[–-]\s*([A-Z][a-z]{2})\s*(\d+)/);
    const sm = item.date.match(/(\d+)\s*[–-]\s*(\d+)/);
    const sdow = (d, m) => _dayNames[new Date(2026, m, d).getDay()];
    const fmt = (d, m) => `${sdow(d, m)} ${d} ${_moNames[m]}`;
    if (cm) {
      const startMo = _moAbbr[cm[1]] ?? mo;
      const endMo   = _moAbbr[cm[3]] ?? mo;
      const startDay = parseInt(cm[2]), endDay = parseInt(cm[4]);
      return <>{fmt(startDay, startMo)} <LucideIcon name="MoveRight" size={13} color="currentColor" strokeWidth={2} style={{display:'inline',verticalAlign:'middle',position:'relative',top:-1}} /> {fmt(endDay, endMo)}</>;
    } else if (sm) {
      const startDay = parseInt(sm[1]), endDay = parseInt(sm[2]);
      return <>{fmt(startDay, mo)} <LucideIcon name="MoveRight" size={13} color="currentColor" strokeWidth={2} style={{display:'inline',verticalAlign:'middle',position:'relative',top:-1}} /> {fmt(endDay, mo)}</>;
    } else {
      const dm = item.date.match(/(\d+)/);
      if (!dm) return item.date;
      return <>{fmt(parseInt(dm[1]), mo)}</>;
    }
  };

  const past = ALL.filter(i => i.status === 'approved').filter(i => {
    const d = _itemEndDate(i); return !d || d < _today;
  });

  // All years that appear in past items (prototype uses 2026 for everything)
  const availableYears = [...new Set(past.map(() => 2026))].sort((a, b) => b - a);
  if (!availableYears.includes(_currentYear)) availableYears.unshift(_currentYear);

  const filtered = past; // in real app: filter by selectedYear
  const totalDays = filtered.reduce((s, i) => s + i.days, 0);

  const toGroups = (items) => {
    const map = new Map();
    items.forEach(item => {
      if (!map.has(item.month)) map.set(item.month, []);
      map.get(item.month).push(item);
    });
    return Array.from(map.entries())
      .map(([month, items]) => ({ month, items }))
      .sort((a, b) => (_mMap[b.month] || 0) - (_mMap[a.month] || 0));
  };

  const groups = toGroups(filtered);

  const ItemRow = ({ item }) => {
    const _icon = _displayIcon(item.label);
    const _label = _displayLabel(item.label);
    return (
      <div key={item.id}
        role="button" tabIndex={0}
        aria-label={`${_label}, ${item.days === 1 ? '1 day' : item.days + ' days'}, ${item.date}`}
        onClick={() => nav && nav.push('time-off-detail', { item })}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nav && nav.push('time-off-detail', { item }); } }}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', cursor: 'pointer' }}>
        <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f3f4f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <LucideIcon name={_icon} size={20} color={P.inkSoft} strokeWidth={1.75} />
          </div>
          <div style={{ position: 'absolute', top: -7, right: -7, width: 16, height: 16, borderRadius: '50%', background: '#dcfce7', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LucideIcon name="Check" size={10} color="#16a34a" strokeWidth={2.5} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.ink, lineHeight: '20px' }}>{_label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, lineHeight: '18px' }}>
            <span style={{ fontWeight: 500, color: P.inkSoft }}>{_formatDate(item)}</span>
            <span style={{ fontWeight: 400, color: P.inkSoft }}>{' · '}{item.days === 1 ? '1 day' : `${item.days} days`}</span>
          </div>
        </div>
        <LucideIcon name="ChevronRight" size={18} color={P.inkSoft} strokeWidth={2} />
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white' }}>
      {/* Nav bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'white', borderBottom: `1px solid ${P.border}`, flexShrink: 0 }}>
        <button onClick={() => nav && nav.pop()} aria-label="Back"
          style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <LucideIcon name="ArrowLeft" size={22} color={P.ink} strokeWidth={1.75} />
        </button>
        <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: P.ink }}>Leave history</span>
        {/* Year picker */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setYearPickerOpen(o => !o)}
            style={{
              appearance: 'none', cursor: 'pointer',
              border: `1px solid ${P.border}`, borderRadius: 8,
              background: 'white', padding: '5px 10px',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.ink,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
            {selectedYear}
            <LucideIcon name="ChevronDown" size={13} color={P.inkSoft} strokeWidth={2} />
          </button>
          {yearPickerOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              background: 'white', border: `1px solid ${P.border}`, borderRadius: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 100, minWidth: 100, overflow: 'hidden',
            }}>
              {[2026, 2025, 2024].map((yr, i, arr) => (
                <button key={yr}
                  onClick={() => { setSelectedYear(yr); setYearPickerOpen(false); }}
                  style={{
                    width: '100%', appearance: 'none', border: 'none', cursor: 'pointer',
                    background: yr === selectedYear ? '#f3f4f6' : 'white',
                    padding: '11px 16px',
                    borderBottom: i < arr.length - 1 ? `1px solid ${P.border}` : 'none',
                    fontFamily: 'var(--font-display)', fontWeight: yr === selectedYear ? 600 : 400,
                    fontSize: 14, color: P.ink, textAlign: 'left',
                  }}>
                  {yr}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Days taken summary */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${P.border}`, flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft }}>{totalDays} {totalDays === 1 ? 'day' : 'days'} taken in {selectedYear}</span>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflow: 'auto', padding: isDesktop ? '24px 32px 32px' : '16px 16px 24px', display: 'flex', flexDirection: 'column' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 16px', textAlign: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LucideIcon name="History" size={28} color="#9ca3af" strokeWidth={1.5} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: P.ink }}>No history for {selectedYear}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, lineHeight: '20px', maxWidth: 260 }}>Your approved time off will appear here.</div>
          </div>
        ) : (
          groups.map(({ month, items }) => (
            <div key={month}>
              <div style={{ padding: '4px 0 6px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{month}</div>
              {items.map(item => <ItemRow key={item.id} item={item} />)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
window.registerScreen('time-off-history', TimeOffHistoryScreen);

// ─────────────────────────────────────────────────────────────
// Request Time Off — 2-step flow: Pick Dates → Review + Submit
// ─────────────────────────────────────────────────────────────

const BELGIAN_HOLIDAYS_2026 = [
  '2026-01-01', '2026-04-06', '2026-05-01', '2026-05-14',
  '2026-05-25', '2026-07-21', '2026-08-15', '2026-11-01',
  '2026-11-11', '2026-12-25',
];
const _hset = new Set(BELGIAN_HOLIDAYS_2026);

// Collective holidays — company-wide closure (3 weeks summer)
const COLLECTIVE_HOLIDAYS = [
  '2026-07-20','2026-07-22','2026-07-23','2026-07-24',
  '2026-07-27','2026-07-28','2026-07-29','2026-07-30','2026-07-31',
  '2026-08-03','2026-08-04','2026-08-05','2026-08-06','2026-08-07',
];
const _cset = new Set(COLLECTIVE_HOLIDAYS);

function _toISO(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function _isWeekend(d) { const wd = d.getDay(); return wd === 0 || wd === 6; }
function _isHoliday(d) { return _hset.has(_toISO(d)); }
function _isCollectiveHoliday(d) { return _cset.has(_toISO(d)); }
function _collectiveHolidayRange() {
  const sorted = [...COLLECTIVE_HOLIDAYS].sort();
  const start = new Date(sorted[0] + 'T00:00:00');
  const end   = new Date(sorted[sorted.length - 1] + 'T00:00:00');
  const fmt = (dt) => dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `Company closed · ${fmt(start)} – ${fmt(end)}`;
}

// Work schedule — employee's contracted work pattern (4/5: Wednesday off)
const WORK_SCHEDULE = {
  1: 'full',  // Monday
  2: 'full',  // Tuesday
  3: 'off',   // Wednesday
  4: 'full',  // Thursday
  5: 'full',  // Friday
};
function _getWorkSchedule(d) { return WORK_SCHEDULE[d.getDay()] || 'off'; }
function _isNonWorkingDay(d) { return !_isWeekend(d) && _getWorkSchedule(d) === 'off'; }
function _sameDay(a, b) { return a && b && _toISO(a) === _toISO(b); }
function _fmtShort(d) { return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); }
function _monthLabel(m, y) { return new Date(y, m).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }); }

function computeWorkingDays(start, end, existingDates) {
  if (!start || !end) return { days: 0, holidays: 0, existingOverlaps: 0, nonWorkingDays: 0 };
  let days = 0, holidays = 0, existingOverlaps = 0, nonWorkingDays = 0;
  const cur = new Date(start); cur.setHours(0,0,0,0);
  const last = new Date(end); last.setHours(0,0,0,0);
  while (cur <= last) {
    if (_isWeekend(cur)) { /* skip */ }
    else if (_isHoliday(cur)) { holidays++; }
    else if (_isNonWorkingDay(cur) || _isCollectiveHoliday(cur)) { nonWorkingDays++; }
    else if (existingDates && existingDates.has(_toISO(cur))) { existingOverlaps++; }
    else { days++; }
    cur.setDate(cur.getDate() + 1);
  }
  return { days, holidays, existingOverlaps, nonWorkingDays };
}

// Leave balances — shared with the balance info sheet
const _isFreshUser = _protoState === 'fresh';
const LEAVE_BALANCES = [
  { type: 'Illness carry-over (2024)', remaining: _isFreshUser ? 4 : 4,  total: 4,  priority: 0, urgent: true,  label: 'Carry-over' },
  { type: 'ADV / RTT',                 remaining: _isFreshUser ? 12 : 5, total: 12, priority: 1, urgent: false, label: 'ADV day' },
  { type: 'Extra-legal leave',          remaining: _isFreshUser ? 4 : 3,  total: 4,  priority: 2, urgent: false, label: 'Extra-legal' },
  { type: 'Statutory annual leave',     remaining: _isFreshUser ? 20 : 2, total: 20, priority: 3, urgent: false, label: 'Legal holiday' },
];

function allocateLeave(days) {
  const sorted = [...LEAVE_BALANCES].sort((a, b) => a.priority - b.priority);
  const result = [];
  let rem = days;
  for (const b of sorted) {
    if (rem <= 0) break;
    const use = Math.min(rem, b.remaining);
    if (use > 0) {
      result.push({ type: b.type, days: use, before: b.remaining, after: b.remaining - use, urgent: b.urgent, label: b.label });
      rem -= use;
    }
  }
  return { allocation: result, shortage: rem > 0 ? rem : 0, primaryLabel: result[0]?.label || 'Leave' };
}

// ── Existing request dates helper ──
function getExistingRequestDates(excludeId) {
  const items = window.__timeOffItems || [];
  const dates = new Set();
  const monthMap = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11,
  };
  for (const item of items) {
    if (item.status === 'denied') continue;
    if (excludeId && item.id === excludeId) continue;
    const m = monthMap[item.month];
    if (m == null) continue;
    const match = item.date.match(/(\d+)(?:\s*[–-]\s*(\d+))?/);
    if (!match) continue;
    const startDay = parseInt(match[1]);
    const endDay = match[2] ? parseInt(match[2]) : startDay;
    for (let d = startDay; d <= endDay; d++) {
      const dt = new Date(2026, m, d);
      if (!_isWeekend(dt)) dates.add(_toISO(dt));
    }
  }
  return dates;
}

// ── Mini Calendar ──
function MiniCalendar({ month, year, onMonthChange, startDate, endDate, onDateTap, onDisabledTap, existingDates, halfDay, statusMap, highlightRange, cellSize: _cellSize, hidePrev, hideNext, hideHeader }) {
  const cellSize = _cellSize || 42;
  const today = new Date(); today.setHours(0,0,0,0);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Build grid
  const firstOfMonth = new Date(year, month, 1);
  let startCol = firstOfMonth.getDay() - 1; // Mon=0
  if (startCol < 0) startCol = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const isInRange = (d) => {
    if (!startDate || !endDate || !d) return false;
    return d >= startDate && d <= endDate;
  };
  const isStart = (d) => d && startDate && _sameDay(d, startDate);
  const isEnd = (d) => d && endDate && _sameDay(d, endDate);
  const isToday = (d) => d && _sameDay(d, today);
  const isDisabled = (d) => !d || _isWeekend(d) || _isHoliday(d) || _isNonWorkingDay(d) || _isCollectiveHoliday(d);
  const hasExisting = (d) => d && existingDates && existingDates.has(_toISO(d));

  const prevMonth = () => {
    const nm = month === 0 ? 11 : month - 1;
    const ny = month === 0 ? year - 1 : year;
    onMonthChange(nm, ny);
  };
  const nextMonth = () => {
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    onMonthChange(nm, ny);
  };

  return (
    <div>
      {/* Month navigation — hidden when parent renders a shared header */}
      {!hideHeader && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 4 }}>
          {hidePrev ? <span style={{ width: 32, height: 32 }} /> : (
            <button onClick={prevMonth} aria-label="Previous month" style={{
              width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 8,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LucideIcon name="ChevronLeft" size={20} color={P.ink} strokeWidth={2} />
            </button>
          )}
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>
            {_monthLabel(month, year)}
          </span>
          {hideNext ? <span style={{ width: 32, height: 32 }} /> : (
            <button onClick={nextMonth} aria-label="Next month" style={{
              width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 8,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LucideIcon name="ChevronRight" size={20} color={P.ink} strokeWidth={2} />
            </button>
          )}
          <span style={{ flex: 1 }} />
          <button onClick={() => onMonthChange(today.getMonth(), today.getFullYear())} style={{
            border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 2px',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.ink,
          }}>Today</button>
        </div>
      )}

      {/* Day name headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
        {dayNames.map(dn => (
          <div key={dn} style={{
            textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: 11, color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em',
            padding: '4px 0',
          }}>{dn}</div>
        ))}
      </div>

      {/* Date cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const disabled = isDisabled(d);
          const selStart = isStart(d);
          const selEnd = isEnd(d);
          const sel = selStart || selEnd;
          const inRange = isInRange(d) && !sel;
          const todayMark = isToday(d) && !sel;
          const weekend = _isWeekend(d);
          const holiday = _isHoliday(d);
          const collective = _isCollectiveHoliday(d);
          const nonWorking = _isNonWorkingDay(d);
          const hasRange = startDate && endDate && !_sameDay(startDate, endDate);
          const rangeBg = '#FAF0FF';

          const halfDayVal = sel && halfDay ? halfDay[_toISO(d)] : null;

          // Status-based coloring (desktop calendar)
          const _statusColors = { pending: '#f5e6d3', approved: '#dcfce7', admin: '#ede9fe' };
          const iso = _toISO(d);
          const dateStatus = statusMap && statusMap.get(iso);
          const isHighlighted = highlightRange && highlightRange.has(iso);

          let btnBg = 'transparent';
          let color = P.ink;
          let fontWeight = 500;
          let border = 'none';

          if (sel && halfDayVal === 'am') {
            btnBg = `linear-gradient(to bottom, ${P.ink} 50%, rgba(15,13,40,0.45) 50%)`;
            color = '#fff'; fontWeight = 700;
          } else if (sel && halfDayVal === 'pm') {
            btnBg = `linear-gradient(to bottom, rgba(15,13,40,0.45) 50%, ${P.ink} 50%)`;
            color = '#fff'; fontWeight = 700;
          } else if (sel) { btnBg = P.ink; color = '#fff'; fontWeight = 700; }
          else if (disabled) { color = '#b0b4bc'; }
          else if (dateStatus) { btnBg = _statusColors[dateStatus] || 'transparent'; fontWeight = 600; }
          else if (inRange) { fontWeight = 600; }

          if (isHighlighted && !sel) { border = `2px solid ${P.ink}`; }

          // Wrapper background for continuous range fill
          let wrapBg = 'transparent';
          if (inRange) {
            wrapBg = rangeBg;
          } else if (selStart && hasRange) {
            wrapBg = `linear-gradient(to right, transparent 50%, ${rangeBg} 50%)`;
          } else if (selEnd && hasRange) {
            wrapBg = `linear-gradient(to left, transparent 50%, ${rangeBg} 50%)`;
          }

          return (
            <div key={iso} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: wrapBg }}>
              <button
                aria-disabled={disabled || undefined}
                onClick={() => disabled ? (onDisabledTap && onDisabledTap(d)) : (onDateTap && onDateTap(d))}
                style={{
                  width: cellSize, height: cellSize,
                  border, background: btnBg,
                  borderRadius: sel ? '50%' : 8,
                  cursor: disabled ? 'default' : 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight, fontSize: 14, color,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  boxShadow: todayMark ? `inset 0 0 0 1.5px ${P.ink}` : 'none',
                }}
              >
                {d.getDate()}
                {(holiday && !sel && !disabled) && (
                  <span style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: 2, background: PFC.warnText }} />
                )}
                {hasExisting(d) && !sel && !inRange && !dateStatus && (
                  <span style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: '50%', background: P.ink }} />
                )}
                {collective && !sel && (
                  <span style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 5, height: 5, borderRadius: '50%', background: P.ink }} />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Half-day selector ──
function HalfDayPicker({ startDate, endDate, halfDay, onChange }) {
  const isSingle = _sameDay(startDate, endDate);
  const Pill = ({ label, active, onTap }) => (
    <button onClick={onTap} style={{
      padding: '8px 16px', borderRadius: 20,
      border: `1px solid ${active ? P.ink : P.border}`,
      background: active ? 'rgba(15,13,40,0.07)' : '#fff',
      fontFamily: 'var(--font-display)', fontWeight: active ? 700 : 500, fontSize: 13,
      color: active ? P.ink : P.inkSoft,
      cursor: 'pointer', whiteSpace: 'nowrap',
    }}>{label}</button>
  );

  if (isSingle) {
    const val = halfDay?.single || 'full';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.inkSoft }}>Duration</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Pill label="Full day" active={val === 'full'} onTap={() => onChange({ single: 'full' })} />
          <Pill label="Morning" active={val === 'am'} onTap={() => onChange({ single: 'am' })} />
          <Pill label="Afternoon" active={val === 'pm'} onTap={() => onChange({ single: 'pm' })} />
        </div>
      </div>
    );
  }

  const first = halfDay?.first || 'full';
  const last = halfDay?.last || 'full';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.inkSoft, marginBottom: 8 }}>First day ({_fmtShort(startDate)})</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Pill label="Full day" active={first === 'full'} onTap={() => onChange({ ...halfDay, first: 'full', last })} />
          <Pill label="Afternoon only" active={first === 'pm'} onTap={() => onChange({ ...halfDay, first: 'pm', last })} />
        </div>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.inkSoft, marginBottom: 8 }}>Last day ({_fmtShort(endDate)})</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Pill label="Full day" active={last === 'full'} onTap={() => onChange({ first, ...halfDay, last: 'full' })} />
          <Pill label="Morning only" active={last === 'am'} onTap={() => onChange({ first, ...halfDay, last: 'am' })} />
        </div>
      </div>
    </div>
  );
}

// Returns array of working-day Date objects in [start, end]
function getWorkingDaysInRange(start, end) {
  if (!start || !end) return [];
  const result = [];
  const cur = new Date(start); cur.setHours(0,0,0,0);
  const last = new Date(end); last.setHours(0,0,0,0);
  while (cur <= last) {
    if (!_isWeekend(cur) && !_isHoliday(cur) && !_isNonWorkingDay(cur) && !_isCollectiveHoliday(cur)) result.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

// halfDay is a map: { '2026-06-15': 'am', '2026-06-17': 'pm' }
// Only non-'full' entries are stored. Missing key = full day.
function getHalfDayDeduction(halfDay) {
  if (!halfDay) return 0;
  let ded = 0;
  for (const iso in halfDay) {
    if (halfDay[iso] === 'am' || halfDay[iso] === 'pm') ded += 0.5;
  }
  return ded;
}

// ── Leave reason options for PC200 Belgium ──
const LEAVE_REASONS = [
  { id: 'timeoff',      label: 'Time off' },
  { id: 'sick',         label: 'Sick leave' },
  { id: 'special',      label: 'Special leave (events/milestones)', hasSubMenu: true },
];
const SPECIAL_LEAVE_OPTIONS = [
  { id: 'special-wedding',   label: 'Wedding',        sub: 'Yours or close family', icon: 'Heart',    entitlement: '1–2 days', entitlementType: 'variable' },
  { id: 'special-moving',    label: 'Moving',          sub: 'Change of residence',   icon: 'Truck',    entitlement: '1 day',    entitlementType: 'company-policy', entitledDays: 1 },
  { id: 'special-funeral',   label: 'Funeral leave',   sub: 'Death of a family member', icon: 'Flower2',  entitlement: '1–10 days', entitlementType: 'variable', hasBereavementFlow: true },
  { id: 'special-communion', label: 'Ceremony',        sub: 'Communion or similar',  icon: 'BookOpen', entitlement: '1 day',    entitlementType: 'fixed', entitledDays: 1 },
  { id: 'special-civic',     label: 'Civic duty',      sub: 'Jury, election, etc.',  icon: 'Scale',    entitlement: 'Up to 5 days', entitlementType: 'variable' },
];

const BEREAVEMENT_OPTIONS = [
  { id: 'special-funeral-partner', label: 'Partner or spouse',    entitledDays: 10, note: '3 around the funeral, and 7 more to use within the year' },
  { id: 'special-funeral-child',   label: 'Child',                entitledDays: 10, note: '3 around the funeral, and 7 more to use within the year' },
  { id: 'special-funeral-parent',  label: 'Parent or parent-in-law', entitledDays: 3, note: '3 days around the funeral' },
  { id: 'special-funeral-sibling', label: 'Sibling or grandparent', entitledDays: 2, note: '2 days if co-residing, 1 day otherwise — mention it in the note below' },
  { id: 'special-funeral-other',   label: 'Other family member',  entitledDays: 1 },
];

const WEDDING_OPTIONS = [
  { id: 'special-wedding-own',    label: 'Your own wedding',        entitledDays: 2 },
  { id: 'special-wedding-family', label: 'Child, sibling, or parent', entitledDays: 1 },
];

// ── localStorage bridge → HR Admin ────────────────────────────────────────
const _HR_KEY = 'payflip_hr_requests';
function _hrType(reason) {
  if (!reason || reason === 'timeoff') return 'Time off';
  if (reason === 'sick') return 'Sick leave';
  if (reason?.startsWith('special-funeral')) return 'Funeral leave';
  return 'Special leave';
}
function _pushToHR(item) {
  try {
    const stored = JSON.parse(localStorage.getItem(_HR_KEY) || '[]');
    const idx = stored.findIndex(r => r.id === item.id);
    if (idx >= 0) stored[idx] = item; else stored.push(item);
    localStorage.setItem(_HR_KEY, JSON.stringify(stored));
  } catch (e) {}
}

// ── Main Request Screen ──
function RequestTimeOffScreen({ editItem, prefillReason, replaceDeniedItem }) {
  const nav = window.useNav ? window.useNav() : null;
  const isDesktop = window.ViewModeContext ? React.useContext(window.ViewModeContext) === 'desktop' : false;
  const modalRef = React.useRef(null);

  // Parse edit data — supports both enriched (_startISO etc.) and legacy (date/month/label) items
  const _editParsed = React.useMemo(() => {
    if (!editItem) return { start: null, end: null, reason: null };
    // Try enriched fields first
    if (editItem._startISO) {
      const ps = editItem._startISO.split('-');
      const pe = editItem._endISO ? editItem._endISO.split('-') : ps;
      return {
        start: new Date(+ps[0], +ps[1]-1, +ps[2]),
        end: new Date(+pe[0], +pe[1]-1, +pe[2]),
        reason: editItem._leaveReason || null,
      };
    }
    // Fallback: parse from legacy date + month
    const mMap = { January:0, February:1, March:2, April:3, May:4, June:5, July:6, August:7, September:8, October:9, November:10, December:11 };
    const mo = mMap[editItem.month];
    if (mo == null) return { start: null, end: null, reason: null };
    const dm = editItem.date.match(/(\d+)(?:\s*[–-]\s*(\d+))?/);
    if (!dm) return { start: null, end: null, reason: null };
    const sDay = parseInt(dm[1]);
    const eDay = dm[2] ? parseInt(dm[2]) : sDay;
    // Infer leave reason from label
    const labelMap = {
      'Legal holiday': 'timeoff', 'Statutory annual leave': 'timeoff',
      'ADV day': 'timeoff', 'ADV / RTT days': 'timeoff',
      'Extra-legal leave': 'timeoff', 'Time off': 'timeoff',
      'Short leave': 'special-civic',
      'Sick leave': 'sick',
    };
    return {
      start: new Date(2026, mo, sDay),
      end: new Date(2026, mo, eDay),
      reason: editItem._leaveReason || labelMap[editItem.label] || null,
    };
  }, []);

  const [step, setStep] = React.useState(0);
  const [startDate, setStartDate] = React.useState(_editParsed.start);
  const [endDate, setEndDate] = React.useState(_editParsed.end);
  const [halfDay, setHalfDay] = React.useState(editItem?._halfDay || null);
  const [notes, setNotes] = React.useState(editItem?._notes || '');
  const [leaveReason, setLeaveReason] = React.useState(prefillReason || _editParsed.reason);
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [focusedField, setFocusedField] = React.useState(editItem ? 'end' : 'start');
  const [attachments, setAttachments] = React.useState(editItem?._attachments || []);
  const [showHoursSheet, setShowHoursSheet] = React.useState(false);
  const [showReasonSheet, setShowReasonSheet] = React.useState(false);
  const [showSpecialSheet, setShowSpecialSheet] = React.useState(false);
  const [showSubSheet, setShowSubSheet] = React.useState(false);
  const [showHalfDayTip, setShowHalfDayTip] = React.useState(!editItem);
  const [errorToast, setErrorToast] = React.useState(null);
  const [calToast, setCalToast] = React.useState(null);

  // On desktop, wrap content in a centered full-page view
  const wrapDesktop = (content) => {
    if (!isDesktop) return content;
    return (
      <div
        ref={modalRef}
        style={{
          width: '100%', maxWidth: 864, margin: '0 auto',
          minHeight: '100%',
        }}
      >
        {content}
      </div>
    );
  };

  const handleDisabledTap = (d) => {
    if (!d) return;
    const msg = _isCollectiveHoliday(d) ? _collectiveHolidayRange()
      : _isNonWorkingDay(d) ? 'This is your day off (4/5 schedule)'
      : _isHoliday(d) ? 'Public holiday'
      : _isWeekend(d) ? 'Weekend' : null;
    if (msg) {
      setShowHalfDayTip(false);
      setCalToast(msg);
      setTimeout(() => setCalToast(null), 2000);
    }
  };

  const now = new Date();
  const [calMonth, setCalMonth] = React.useState(_editParsed.start ? _editParsed.start.getMonth() : now.getMonth());
  const [calYear, setCalYear] = React.useState(_editParsed.start ? _editParsed.start.getFullYear() : now.getFullYear());

  // Existing request dates for calendar dots
  const existingDates = React.useMemo(() => getExistingRequestDates(editItem?.id), []);

  // Prune half-day entries to only keep dates within the new [start, end] range
  const _pruneHalfDay = (hd, newStart, newEnd) => {
    if (!hd || !newStart || !newEnd) return null;
    const pruned = {};
    for (const iso in hd) {
      const p = iso.split('-');
      const dt = new Date(+p[0], +p[1]-1, +p[2]);
      if (dt >= newStart && dt <= newEnd) pruned[iso] = hd[iso];
    }
    return Object.keys(pruned).length > 0 ? pruned : null;
  };

  // Calendar date tap — driven by focusedField
  const handleDateTap = (d) => {
    setError('');
    if (focusedField === 'start') {
      setStartDate(d);
      const newEnd = (endDate && d > endDate) ? d : endDate;
      if (endDate && d > endDate) setEndDate(d);
      setHalfDay(prev => _pruneHalfDay(prev, d, newEnd));
      setFocusedField('end');
      setCalMonth(d.getMonth());
      setCalYear(d.getFullYear());
    } else {
      if (!startDate) {
        setStartDate(d); setEndDate(d);
        setHalfDay(prev => _pruneHalfDay(prev, d, d));
        setFocusedField('end');
      } else if (d < startDate) {
        setStartDate(d);
        setHalfDay(prev => _pruneHalfDay(prev, d, endDate));
      } else {
        setEndDate(d);
        setHalfDay(prev => _pruneHalfDay(prev, startDate, d));
      }
      setCalMonth(d.getMonth());
      setCalYear(d.getFullYear());
    }
  };

  // Computed values
  const { days: rawDays, holidays, existingOverlaps, nonWorkingDays } = computeWorkingDays(startDate, endDate, existingDates);
  const halfDed = getHalfDayDeduction(halfDay);
  const totalDays = Math.max(0, rawDays - halfDed);

  const totalAvailable = LEAVE_BALANCES.reduce((s, b) => s + b.remaining, 0);
  const { allocation, shortage, primaryLabel } = allocateLeave(totalDays);

  // Balance check — cascade mode for timeoff, entitlement check for special
  const plannableTotal = LEAVE_BALANCES.filter(b => !b.urgent || b.remaining > 0).reduce((s, b) => s + b.remaining, 0);
  const overBalance = leaveReason === 'timeoff' && totalDays > plannableTotal
    ? totalDays - plannableTotal
    : 0;

  // Special leave entitlement limit
  const _bereaveMatch = BEREAVEMENT_OPTIONS.find(o => o.id === leaveReason);
  const _weddingMatch = WEDDING_OPTIONS.find(o => o.id === leaveReason);
  const _specialOpt = SPECIAL_LEAVE_OPTIONS.find(o => o.id === leaveReason || leaveReason?.startsWith(o.id + '-'));
  const entitledDaysLimit = _bereaveMatch?.entitledDays || _weddingMatch?.entitledDays || _specialOpt?.entitledDays || null;
  const overEntitlement = entitledDaysLimit && totalDays > entitledDaysLimit ? totalDays - entitledDaysLimit : 0;

  // Check overlap with existing approved/pending non-sick leave
  const sickOverlap = React.useMemo(() => {
    const isSick = leaveReason === 'sick';
    if (!isSick || !startDate || !endDate) return null;

    const reqDays = getWorkingDaysInRange(startDate, endDate).map(d => _toISO(d));
    if (reqDays.length === 0) return null;

    const items = window.__timeOffItems || [];
    const monthMap = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11,
    };

    const overlaps = [];
    for (const item of items) {
      if (item.status === 'denied') continue;
      // Skip other sick leave
      if (item._leaveReason === 'sick') continue;
      if (editItem && item.id === editItem.id) continue;

      // Parse dates from the item
      const m = monthMap[item.month];
      if (m == null) continue;
      const match = item.date.match(/(\d+)(?:\s*[–-]\s*(\d+))?/);
      if (!match) continue;
      const sDay = parseInt(match[1]);
      const eDay = match[2] ? parseInt(match[2]) : sDay;

      const itemDates = new Set();
      for (let d = sDay; d <= eDay; d++) {
        const dt = new Date(2026, m, d);
        if (!_isWeekend(dt) && !_isHoliday(dt)) itemDates.add(_toISO(dt));
      }

      const sharedDays = reqDays.filter(iso => itemDates.has(iso));
      if (sharedDays.length > 0) {
        overlaps.push({ item, days: sharedDays.length });
      }
    }
    return overlaps.length > 0 ? overlaps : null;
  }, [leaveReason, startDate, endDate, editItem]);

  const requiresAttachment = leaveReason === 'sick' && totalDays > 1;

  const handleSubmit = () => {
    if (!startDate || totalDays === 0) {
      setError('No working days selected — weekends and public holidays are excluded.');
      return;
    }
    if (totalDays > totalAvailable) {
      setError(`You have ${totalAvailable} days available, but this request needs ${totalDays} days.`);
      return;
    }
    if (requiresAttachment && attachments.length === 0) {
      // Show error toast and scroll to attachments section
      setErrorToast('Please upload a medical certificate');
      setTimeout(() => setErrorToast(null), 3500);
      const el = document.getElementById('attachments-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      // Build the item
      const startStr = startDate.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
      const endStr = _sameDay(startDate, endDate) ? '' : '–' + endDate.toLocaleDateString('en-GB', { day: 'numeric' });
      const monthStr = startDate.toLocaleDateString('en-GB', { month: 'long' });

      const newItem = {
        id: editItem ? editItem.id : 'req-' + Date.now(),
        label: (LEAVE_REASONS.find(r => r.id === leaveReason) || SPECIAL_LEAVE_OPTIONS.find(r => r.id === leaveReason) || BEREAVEMENT_OPTIONS.find(r => r.id === leaveReason) || WEDDING_OPTIONS.find(r => r.id === leaveReason) || {}).label || primaryLabel,
        date: startStr + endStr,
        month: monthStr,
        days: totalDays,
        status: 'pending',
        // Persist full form data for editing
        _startISO: _toISO(startDate),
        _endISO: _toISO(endDate),
        _leaveReason: leaveReason,
        _notes: notes,
        _attachments: attachments,
        _halfDay: halfDay,
      };

      if (editItem) {
        // Update existing item
        window.__timeOffItems = (window.__timeOffItems || []).map(i => i.id === editItem.id ? newItem : i);
      } else {
        // Remove the denied item we're replacing (if any) only on successful submit
        let items = window.__timeOffItems || [];
        if (replaceDeniedItem) {
          items = items.filter(i => i.id !== replaceDeniedItem.id);
        }
        window.__timeOffItems = [...items, newItem];
      }
      // Sync to HR Admin via localStorage
      const _fmt = d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      _pushToHR({
        id: newItem.id, employee: 'david', type: _hrType(leaveReason),
        startDate: _fmt(startDate), endDate: _fmt(endDate),
        days: totalDays, status: 'pending', submittedAt: 'Just now', note: notes || '',
      });
      setSubmitting(false);
      setStep(1);
    }, 1200);
  };

  const handleDone = () => {
    // Refresh data first, then pop back to hub
    if (window.__refreshTimeOff) window.__refreshTimeOff();
    if (nav) nav.pop();
    setTimeout(() => {
      if (window.__showTimeOffToast) window.__showTimeOffToast(editItem ? 'Request updated' : 'Request submitted');
    }, 200);
  };

  // ── Success overlay ──
  if (step === 1) {
    const dateLabel = _sameDay(startDate, endDate) ? _fmtShort(startDate) : <>{_fmtShort(startDate)} <LucideIcon name="MoveRight" size={13} color="currentColor" strokeWidth={2} style={{display:'inline',verticalAlign:'middle',position:'relative',top:-1}} /> {_fmtShort(endDate)}</>;

    // Per-leave-type personality (personalized note shown below the main confirmation)
    const personalNote = (() => {
      if (editItem) return null;
      switch (leaveReason) {
        case 'sick':           return 'Rest up — we hope you feel better soon.';
        case 'timeoff':        return 'You\'ve earned it — enjoy every moment.';
        case 'special-wedding':
        case 'special-wedding-own':
        case 'special-wedding-family': return 'What a special day — wishing you all the happiness.';
        case 'special-moving':   return 'Good luck with the move — exciting times!';
        case 'special-funeral':
        case 'special-funeral-partner':
        case 'special-funeral-child':
        case 'special-funeral-parent':
        case 'special-funeral-sibling':
        case 'special-funeral-other': return 'Take all the time you need. We\'re here for you.';
        case 'special-communion': return 'What a lovely milestone — have a wonderful day.';
        case 'special-civic':    return 'Thanks for doing your part. See you when you\'re back!';
        default: return null;
      }
    })();

    const isEdit = !!editItem;
    const wasApproved = isEdit && editItem.status === 'approved';
    const iconBg = wasApproved ? 'rgb(250,246,235)' : PFC.successBg;
    const iconColor = wasApproved ? 'rgb(161,98,7)' : PFC.successText;
    const iconName = wasApproved ? 'Clock' : 'CircleCheck';
    const heading = isEdit
      ? (wasApproved ? 'Re-submitted for approval' : 'Request updated!')
      : 'Your request was submitted';
    const subtext = isEdit
      ? (wasApproved ? 'Your approved leave was changed — Sophie L. will review the update.' : 'Your changes have been saved.')
      : 'Your request has been sent to Sophie L. for approval. You\'ll hear back soon.';

    return wrapDesktop(
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: isDesktop ? 400 : '100%', padding: 32, background: 'white', textAlign: 'center', borderRadius: isDesktop ? 20 : 0 }}>
        <SuccessCheck iconName={iconName} iconColor={iconColor} iconBg={iconBg} />
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: P.ink, marginBottom: 8, animation: 'fadeSlideIn 0.5s ease-out 0.15s both' }}>
          {heading}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, lineHeight: '20px', marginBottom: personalNote ? 8 : 20, maxWidth: 280, animation: 'fadeSlideIn 0.5s ease-out 0.25s both' }}>
          {subtext}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: P.ink, marginBottom: 32, animation: 'fadeSlideIn 0.5s ease-out 0.35s both' }}>
          {dateLabel} · {totalDays === 1 ? '1 day' : `${totalDays} days`}
        </div>
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeSlideIn 0.5s ease-out 0.45s both' }}>
          <Button variant="primary" size="large" fullWidth onClick={handleDone}>
            Back to time off
          </Button>
          <button
            onClick={() => setStep(0)}
            style={{ width: '100%', appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: P.inkSoft, padding: '8px 0' }}
          >
            Edit request
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: Pick dates + reason ──
  if (step === 0) {
    const hasDates = startDate && endDate && totalDays > 0;
    const canSubmit = hasDates && leaveReason && !submitting && !overEntitlement;
    const selectedReason = LEAVE_REASONS.find(r => r.id === leaveReason) || SPECIAL_LEAVE_OPTIONS.find(r => r.id === leaveReason) || BEREAVEMENT_OPTIONS.find(r => r.id === leaveReason) || WEDDING_OPTIONS.find(r => r.id === leaveReason);
    const isBereavementSub = leaveReason?.startsWith('special-funeral-');
    const isWeddingSub = leaveReason?.startsWith('special-wedding-');
    const appShell = isDesktop ? modalRef.current : document.querySelector('[data-app-shell]');

    // Short date display: "Mon 15 Jun"
    const fmtDateBtn = (d) => d ? d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }) : null;

    return wrapDesktop(
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: isDesktop ? 0 : '100%', height: isDesktop ? 'auto' : undefined, background: 'white', borderRadius: isDesktop ? 20 : 0 }}>
        {/* Header with X close + centered title */}
        <div style={{ display: 'flex', alignItems: 'center', padding: isDesktop ? '16px 20px 8px' : '4px 16px 8px', gap: 8 }}>
          <div style={{ width: 36 }} />
          <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: P.ink }}>
            {editItem ? 'Edit request' : 'Request time off'}
          </div>
          <button
            onClick={() => nav && nav.pop()}
            aria-label="Close"
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: P.surface, border: 'none',
              cursor: 'pointer', padding: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <LucideIcon name="X" size={22} color={P.ink} strokeWidth={2} />
          </button>
        </div>

        <style>{`
          @keyframes revealDown {
            from { opacity: 0; transform: translateY(-12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes sheetFadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes sheetSlideUp {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
          * { scrollbar-width: none; }
          *::-webkit-scrollbar { display: none; }
        `}</style>

        <div style={{ flex: 1, overflowY: isDesktop ? 'visible' : 'auto', padding: '8px 16px 24px' }}>

          {/* Leave reason selector */}
          <div style={{ marginBottom: 24, position: 'relative' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.inkSoft, marginBottom: 8 }}>
              Time off type <span style={{ color: PFC.errorText }}>*</span>
            </div>
            <button
              onClick={() => setShowReasonSheet(true)}
              style={{
                width: '100%', appearance: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 16px', borderRadius: 12,
                border: `1px solid ${PFC.borderHard}`, background: '#fff',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: (selectedReason || leaveReason === 'special-') ? 600 : 400,
                fontSize: 15, color: (selectedReason || leaveReason === 'special-') ? P.ink : P.inkSoft,
              }}>
                {leaveReason?.startsWith('special-') ? 'Special leave'
                  : (selectedReason ? selectedReason.label : 'Select leave type…')}
              </span>
              <LucideIcon name="ChevronDown" size={18} color={P.inkSoft} strokeWidth={2} />
            </button>

            {/* Desktop inline dropdown for leave type */}
            {isDesktop && showReasonSheet && (() => {
              const _plannableTotal = LEAVE_BALANCES.filter(b => !b.urgent || b.remaining > 0).reduce((s, b) => s + b.remaining, 0);
              const isAnySpecial = leaveReason?.startsWith('special-');
              const specialSelected = isAnySpecial ? SPECIAL_LEAVE_OPTIONS.find(o => o.id === leaveReason) || BEREAVEMENT_OPTIONS.find(o => o.id === leaveReason) || WEDDING_OPTIONS.find(o => o.id === leaveReason) : null;
              const DropRow = ({ id, label, icon, sub, onClick: onClickOverride }) => (
                <button
                  onClick={onClickOverride || (() => { setLeaveReason(id); setShowReasonSheet(false); })}
                  style={{
                    width: '100%', appearance: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', background: 'transparent', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: '#f3f4f6',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <LucideIcon name={icon} size={16} color={P.inkSoft} strokeWidth={1.75} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, color: P.ink, lineHeight: '20px' }}>{label}</div>
                    {sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, marginTop: 1 }}>{sub}</div>}
                  </div>
                  <LucideIcon name="ChevronRight" size={18} color={P.inkSoft} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                </button>
              );
              return (
                <>
                <div onClick={() => setShowReasonSheet(false)} style={{ position: 'fixed', inset: 0, zIndex: 499 }} />
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500,
                  marginTop: 4, background: 'white', borderRadius: 12,
                  border: `1px solid ${P.border}`,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  padding: '8px 0',
                }}>
                  <DropRow id="timeoff" label="Time off" icon="Palmtree" sub={`${_plannableTotal} days available`} />
                  <DropRow id="sick" label="Sick leave" icon="Stethoscope" sub="1 day without certificate, 2+ days requires one" />
                  <DropRow
                    id="_special" label="Special leave" icon="Gift"
                    sub={specialSelected ? specialSelected.label : 'Wedding, funeral, moving…'}
                    onClick={isDesktop
                      ? () => { setLeaveReason('special-'); setShowReasonSheet(false); }
                      : () => { setShowReasonSheet(false); setTimeout(() => setShowSpecialSheet(true), 80); }}
                  />
                </div>
                </>
              );
            })()}


            {/* Desktop inline dropdown for sub-selection (wedding/bereavement) */}
            {isDesktop && showSubSheet && (<>
              <div onClick={() => setShowSubSheet(false)} style={{ position: 'fixed', inset: 0, zIndex: 499 }} />
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 500,
                marginTop: 4, background: 'white', borderRadius: 12,
                border: `1px solid ${P.border}`,
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                padding: '8px 0',
              }}>
                <div style={{ padding: '8px 16px 4px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: P.ink }}>
                    {(leaveReason === 'special-wedding' || isWeddingSub) ? 'Whose wedding?' : 'What is your relationship to the person?'}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, marginTop: 2, lineHeight: '16px' }}>
                    The number of days you're entitled to depends on your answer.
                  </div>
                </div>
                {((leaveReason === 'special-wedding' || isWeddingSub) ? WEDDING_OPTIONS : BEREAVEMENT_OPTIONS).map((o, i, arr) => (
                  <button
                    key={o.id}
                    onClick={() => { setLeaveReason(o.id); setShowSubSheet(false); }}
                    style={{
                      width: '100%', appearance: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', background: 'transparent', textAlign: 'left',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, color: P.ink, lineHeight: '20px' }}>{o.label}</div>
                      {o.note && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, marginTop: 2, lineHeight: '16px' }}>{o.note}</div>}
                    </div>
                    <LucideIcon name="ChevronRight" size={16} color={P.inkSoft} strokeWidth={2} style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </>)}
          </div>

          {/* Desktop: special leave type dropdown (shown below first dropdown when special is selected) */}
          {isDesktop && leaveReason?.startsWith('special-') && (() => {
            const selectedSpecial = SPECIAL_LEAVE_OPTIONS.find(o => o.id === leaveReason || leaveReason?.startsWith(o.id + '-'));
            return (
              <div style={{ marginBottom: 24, position: 'relative', animation: 'revealDown 0.25s ease-out both' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.inkSoft, marginBottom: 8 }}>
                  Type of special leave <span style={{ color: PFC.errorText }}>*</span>
                </div>
                <button
                  onClick={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setShowSpecialSheet(s => s ? false : { top: r.bottom + 4, left: r.left, width: r.width });
                  }}
                  style={{
                    width: '100%', appearance: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 16px', borderRadius: 12,
                    border: `1px solid ${PFC.borderHard}`, background: '#fff',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: selectedSpecial ? 600 : 400,
                    fontSize: 15, color: selectedSpecial ? P.ink : P.inkSoft,
                  }}>
                    {selectedSpecial ? selectedSpecial.label : 'Select type…'}
                  </span>
                  <LucideIcon name="ChevronDown" size={18} color={P.inkSoft} strokeWidth={2} />
                </button>
                {showSpecialSheet && (() => {
                  const pos = typeof showSpecialSheet === 'object' ? showSpecialSheet : { top: 0, left: 0, width: 480 };
                  return ReactDOM.createPortal(<>
                  <div onClick={() => setShowSpecialSheet(false)} style={{ position: 'fixed', inset: 0, zIndex: 499 }} />
                  <div style={{
                    position: 'fixed', zIndex: 500,
                    top: pos.top, left: pos.left, width: pos.width,
                    background: 'white', borderRadius: 12,
                    border: `1px solid ${P.border}`,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    padding: '8px 0',
                  }}
                  >
                    {SPECIAL_LEAVE_OPTIONS.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => { setLeaveReason(o.id); setShowSpecialSheet(false); }}
                        style={{
                          width: '100%', appearance: 'none', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 16px', background: 'transparent', textAlign: 'left',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{
                          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                          background: '#f3f4f6',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <LucideIcon name={o.icon} size={16} color={P.inkSoft} strokeWidth={1.75} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, color: P.ink, lineHeight: '20px' }}>{o.label}</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, marginTop: 1 }}>
                            {o.sub} · {o.entitlementType === 'company-policy' ? `${o.entitlement} (company policy)` : o.entitlement}
                          </div>
                        </div>
                        {(leaveReason === o.id || leaveReason?.startsWith(o.id + '-')) && (
                          <LucideIcon name="Check" size={16} color={P.ink} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                        )}
                      </button>
                    ))}
                  </div>
                </>, document.body)
                })()}
              </div>
            );
          })()}

          {/* Sub-selector dropdown for wedding / bereavement */}
          {(leaveReason === 'special-wedding' || isWeddingSub || leaveReason === 'special-funeral' || isBereavementSub) && (
          <div style={{ marginBottom: 8, animation: 'revealDown 0.25s ease-out both' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.inkSoft, marginBottom: 8 }}>
              {(leaveReason === 'special-wedding' || isWeddingSub) ? 'Whose wedding?' : 'What is your relationship to the person?'}
              {' '}<span style={{ color: PFC.errorText }}>*</span>
            </div>
            <button
              onClick={() => setShowSubSheet(true)}
              style={{
                width: '100%', appearance: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 16px', borderRadius: 12,
                border: `1px solid ${PFC.borderHard}`, background: '#fff',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: (isWeddingSub || isBereavementSub) ? 600 : 400,
                fontSize: 15, color: (isWeddingSub || isBereavementSub) ? P.ink : P.inkSoft,
              }}>
                {isWeddingSub ? selectedReason.label : isBereavementSub ? selectedReason.label : 'Select…'}
              </span>
              <LucideIcon name="ChevronDown" size={18} color={P.inkSoft} strokeWidth={2} />
            </button>
          </div>
          )}

          {/* Entitlement info banner */}
          {(() => {
            const specialOpt = SPECIAL_LEAVE_OPTIONS.find(o => o.id === leaveReason || leaveReason?.startsWith(o.id + '-'));
            if (!specialOpt) return null;
            const bereaveMatch = BEREAVEMENT_OPTIONS.find(o => o.id === leaveReason);
            const weddingMatch = WEDDING_OPTIONS.find(o => o.id === leaveReason);
            const entitled = bereaveMatch?.entitledDays || weddingMatch?.entitledDays || specialOpt.entitledDays;
            if (!entitled) return null;
            const isCompanyPolicy = specialOpt.entitlementType === 'company-policy';
            const noteText = bereaveMatch?.note;
            const bannerText = bereaveMatch
              ? `You have ${entitled} days of paid leave${noteText ? ` — ${noteText}` : ''}.`
              : `You're entitled to ${entitled} day${entitled > 1 ? 's' : ''} for this event${isCompanyPolicy ? ' (company policy)' : ''}.`;
            return (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 24, background: '#f3f4f6', borderRadius: 10, padding: '10px 12px' }}>
                <LucideIcon name="Info" size={14} color={P.inkSoft} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: P.inkSoft, lineHeight: '17px' }}>
                  {bannerText}
                </span>
              </div>
            );
          })()}

          {/* Progressive disclosure: rest of form appears after leave type is fully resolved (skip when editing) */}
          {(editItem || (leaveReason && leaveReason !== 'special-wedding' && leaveReason !== 'special-funeral' && leaveReason !== 'special-')) && (
          <div key="rest-of-form" style={editItem ? {} : { animation: 'revealDown 0.35s ease-out both' }}>

          {/* Start / End date buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isDesktop ? 48 : 12, marginBottom: isDesktop ? 24 : 16 }}>
            <button
              onClick={() => setFocusedField('start')}
              style={{
                width: '100%', padding: '8px 16px', textAlign: 'left', cursor: 'pointer',
                border: `${focusedField === 'start' ? '2px' : '1px'} solid ${focusedField === 'start' ? P.ink : PFC.borderHard}`,
                borderRadius: 12, background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 12, color: P.inkSoft, marginBottom: 0 }}>Start date</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: startDate ? 600 : 400, fontSize: 14, color: startDate ? P.ink : P.inkSoft }}>
                  {fmtDateBtn(startDate) || 'Select'}
                </div>
              </div>
              <LucideIcon name="Calendar" size={18} color={focusedField === 'start' ? P.ink : P.inkSoft} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setFocusedField('end')}
              style={{
                width: '100%', padding: '8px 16px', textAlign: 'left', cursor: 'pointer',
                border: `${focusedField === 'end' ? '2px' : '1px'} solid ${focusedField === 'end' ? P.ink : PFC.borderHard}`,
                borderRadius: 12, background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 12, color: P.inkSoft, marginBottom: 0 }}>End date</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: endDate ? 600 : 400, fontSize: 14, color: endDate ? P.ink : P.inkSoft }}>
                  {fmtDateBtn(endDate) || 'Select'}
                </div>
              </div>
              <LucideIcon name="Calendar" size={18} color={focusedField === 'end' ? P.ink : P.inkSoft} strokeWidth={1.75} />
            </button>
          </div>

          {/* Inline calendar — 2 months on desktop, 1 on mobile */}
          <div style={{ marginBottom: 16, position: 'relative' }}>
            {isDesktop ? (() => {
              const _moFull = ['January','February','March','April','May','June','July','August','September','October','November','December'];
              const nm = (calMonth + 1) % 12;
              const ny = calMonth === 11 ? calYear + 1 : calYear;
              const calShared = { startDate, endDate, onDateTap: handleDateTap, onDisabledTap: handleDisabledTap, existingDates, halfDay, cellSize: 38 };
              return (
                <div style={{ display: 'flex', gap: 48 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', color: P.ink, textTransform: 'uppercase' }}>
                        {_moFull[calMonth]} {calYear}
                      </span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => { const pm = calMonth === 0 ? 11 : calMonth - 1; const py = calMonth === 0 ? calYear - 1 : calYear; setCalMonth(pm); setCalYear(py); }} aria-label="Previous month" style={{ width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LucideIcon name="ArrowLeft" size={16} color={P.ink} strokeWidth={2} />
                        </button>
                        <button onClick={() => { const nxm = calMonth === 11 ? 0 : calMonth + 1; const nxy = calMonth === 11 ? calYear + 1 : calYear; setCalMonth(nxm); setCalYear(nxy); }} aria-label="Next month" style={{ width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LucideIcon name="ArrowRight" size={16} color={P.ink} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                    <MiniCalendar month={calMonth} year={calYear}
                      onMonthChange={(m, y) => { setCalMonth(m); setCalYear(y); }}
                      {...calShared} hideHeader />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', color: P.ink, textTransform: 'uppercase' }}>
                        {_moFull[nm]} {ny}
                      </span>
                    </div>
                    <MiniCalendar month={nm} year={ny}
                      onMonthChange={(m, y) => { const pm2 = m === 0 ? 11 : m - 1; const py2 = m === 0 ? y - 1 : y; setCalMonth(pm2); setCalYear(py2); }}
                      {...calShared} hideHeader />
                  </div>
                </div>
              );
            })() : (
              <MiniCalendar
                month={calMonth}
                year={calYear}
                onMonthChange={(m, y) => { setCalMonth(m); setCalYear(y); }}
                startDate={startDate}
                endDate={endDate}
                onDateTap={handleDateTap}
                onDisabledTap={handleDisabledTap}
                existingDates={existingDates}
                halfDay={halfDay}
              />
            )}
            {calToast && (
              <div style={{
                position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                background: P.ink, color: '#fff', padding: '6px 14px', borderRadius: 8,
                fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 12,
                whiteSpace: 'nowrap', animation: 'fadeSlideIn 0.2s ease-out',
                zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                pointerEvents: 'none',
              }}>{calToast}</div>
            )}
          </div>

          {/* Half-day legend */}
          {halfDay && Object.values(halfDay).some(v => v === 'am' || v === 'pm') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: `linear-gradient(to bottom, ${P.ink} 50%, rgba(15,13,40,0.45) 50%)` }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: P.inkSoft }}>Morning</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: `linear-gradient(to bottom, rgba(15,13,40,0.45) 50%, ${P.ink} 50%)` }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: P.inkSoft }}>Afternoon</span>
              </div>
            </div>
          )}

          {/* Working days summary + Edit hours */}
          {startDate && endDate && totalDays > 0 && (
            <div style={{ position: 'relative', marginBottom: 32 }}>
              {/* Discovery tooltip — outside overflow:hidden card so it's not clipped */}
              {showHalfDayTip && !halfDay && (
                <div
                  onClick={() => { setShowHoursSheet(true); setShowHalfDayTip(false); }}
                  className="t-tooltip-pop"
                  style={{
                    position: 'absolute', top: -21, right: 12,
                    background: P.ink, color: 'white', borderRadius: 10,
                    padding: '8px 12px',
                    fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
                    lineHeight: '16px',
                    cursor: 'pointer',
                    animationDelay: '0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    whiteSpace: 'nowrap',
                    zIndex: 2,
                  }}>
                  Need half a day? Tap to adjust
                  {/* Arrow */}
                  <div style={{
                    position: 'absolute', bottom: -6, right: 24,
                    width: 12, height: 12,
                    background: P.ink,
                    transform: 'rotate(45deg)',
                    borderRadius: 2,
                  }} />
                </div>
              )}
              {/* Grey card */}
              <div style={{ borderRadius: 10, overflow: 'hidden', background: 'rgba(15,13,40,0.06)' }}>
                <div style={{ padding: 16 }}>
                  {/* Edit hours row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {(() => {
                      const excluded = holidays + existingOverlaps + nonWorkingDays;
                      return (
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.ink }}>
                          {totalDays === 0.5 ? '½ working day' : totalDays === 1 ? '1 working day' : `${totalDays} working days`}
                          {excluded > 0 && (
                            <span style={{ fontWeight: 500, color: P.inkSoft, marginLeft: 8 }}>
                              ({excluded} day{excluded > 1 ? 's' : ''} excluded)
                            </span>
                          )}
                        </div>
                      );
                    })()}
                    <button
                      onClick={() => { setShowHoursSheet(true); setShowHalfDayTip(false); }}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.ink, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                        Edit hours
                      </span>
                    </button>
                  </div>
                  {/* Balance remaining after request — shown inside the card like the over-balance warning */}
                  {/* Half-day annotations */}
                  {halfDay && (() => {
                    const parts = [];
                    const workDays = getWorkingDaysInRange(startDate, endDate);
                    for (const d of workDays) {
                      const iso = _toISO(d);
                      const val = halfDay[iso];
                      if (val === 'am') parts.push(`${_fmtShort(d)}: morning`);
                      if (val === 'pm') parts.push(`${_fmtShort(d)}: afternoon`);
                    }
                    return parts.length > 0 ? (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, marginTop: 4 }}>
                        {parts.join(' · ')}
                      </div>
                    ) : null;
                  })()}
                </div>
                {/* Over-balance warning banner */}
                {overBalance > 0 && leaveReason === 'timeoff' && (<React.Fragment>
                  <div style={{ height: 1, background: P.border }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#FFF3E5' }}>
                    <LucideIcon name="AlertTriangle" size={14} color="#92400e" strokeWidth={2} style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: '#92400e', lineHeight: '16px' }}>
                      Exceeds your balance by {overBalance === 0.5 ? '½' : overBalance} day{overBalance > 1 ? 's' : ''} — {plannableTotal} days available
                    </span>
                  </div>
                </React.Fragment>)}
                {/* Over-entitlement error banner */}
                {overEntitlement > 0 && (<React.Fragment>
                  <div style={{ height: 1, background: P.border }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#fef2f2' }}>
                    <LucideIcon name="AlertCircle" size={14} color="#b91c1c" strokeWidth={2} style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: '#b91c1c', lineHeight: '16px' }}>
                      Maximum {entitledDaysLimit} day{entitledDaysLimit > 1 ? 's' : ''} for this leave type — reduce your selection by {overEntitlement} day{overEntitlement > 1 ? 's' : ''}
                    </span>
                  </div>
                </React.Fragment>)}
                {/* Cascade allocation breakdown + remaining */}
                {leaveReason === 'timeoff' && totalDays > 0 && overBalance === 0 && (<React.Fragment>
                  <div style={{ height: 1, background: P.border }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#f3f4f6' }}>
                    <LucideIcon name="Info" size={14} color={P.inkSoft} strokeWidth={2} style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: P.inkSoft, lineHeight: '16px' }}>
                      {allocation.length > 1
                        ? `Using ${allocation.map(a => `${a.days === 0.5 ? '½' : a.days} ${a.label}`).join(' + ')} · ${Math.max(0, plannableTotal - totalDays)} days left`
                        : `${Math.max(0, plannableTotal - totalDays)} of ${plannableTotal} days remaining after this`
                      }
                    </span>
                  </div>
                </React.Fragment>)}
              </div>
            </div>
          )}

          {/* Overlap info banner for sick leave during existing time off */}
          {hasDates && sickOverlap && (
          <div key="sick-overlap-banner" style={{
            animation: 'revealDown 0.35s ease-out both',
            margin: '0 0 16px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 12,
            padding: '16px 16px',
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <LucideIcon name="Info" size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                color: '#1e40af', marginBottom: 8,
              }}>Sick leave during existing time off</div>
              <div style={{
                fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 13,
                color: '#1e40af', lineHeight: '18px', opacity: 0.85,
              }}>
                {sickOverlap.map((o, i) => (
                  <div key={i} style={{ marginBottom: i < sickOverlap.length - 1 ? 4 : 0 }}>
                    {o.days} day{o.days > 1 ? 's' : ''} overlap with your {o.item.status} <strong>{o.item.label.toLowerCase()}</strong> ({o.item.date}).
                  </div>
                ))}
                <div style={{ marginTop: 8, fontSize: 12, lineHeight: '17px' }}>
                  Under Belgian law, sick days during vacation are converted back to annual leave. HR will adjust your balance after approval.
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Progressive disclosure: Note & Attachments appear once dates are selected (skip when editing) */}
          {(editItem || hasDates) && (
          <div key="note-attach" style={editItem ? {} : { animation: 'revealDown 0.35s ease-out both' }}>

          {/* Note */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: P.inkSoft, marginBottom: 8 }}>
              Note <span style={{ fontWeight: 400 }}>(optional)</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note for your manager"
              rows={3}
              style={{
                width: '100%', resize: 'vertical',
                border: `1px solid ${PFC.borderHard}`, borderRadius: 12,
                padding: '16px 16px', background: '#fff',
                fontFamily: 'var(--font-body)', fontSize: 15, color: P.ink,
                outline: 'none', boxSizing: 'border-box',
                lineHeight: '22px',
              }}
              onFocus={(e) => { e.target.style.borderColor = P.ink; }}
              onBlur={(e) => { e.target.style.borderColor = PFC.borderHard; }}
            />
          </div>

          {/* Attachments */}
          <div id="attachments-section" style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: errorToast && requiresAttachment ? PFC.errorText : P.inkSoft, marginBottom: 8, transition: 'color 0.3s' }}>
              Attachments {requiresAttachment
                ? <span style={{ color: PFC.errorText }}>* <span style={{ fontWeight: 400, fontSize: 12 }}>Medical certificate required for {totalDays}+ days</span></span>
                : <span style={{ fontWeight: 400 }}>(optional)</span>}
            </div>

            {/* Uploaded files list */}
            {attachments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                {attachments.map((file, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px', borderRadius: 10,
                    background: P.surface, border: `1px solid ${P.border}`,
                  }}>
                    <LucideIcon name="FileText" size={18} color={P.inkSoft} strokeWidth={1.75} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: P.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft }}>{file.size}</div>
                    </div>
                    <button
                      onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                      aria-label="Remove file"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, display: 'inline-flex' }}
                    >
                      <LucideIcon name="X" size={16} color={P.inkSoft} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <button
              onClick={() => {
                // Prototype: simulate file upload
                const fakeFiles = [
                  { name: 'medical_certificate.pdf', size: '245 KB' },
                  { name: 'wedding_invitation.pdf', size: '1.2 MB' },
                  { name: 'jury_summons.pdf', size: '128 KB' },
                ];
                const next = fakeFiles[attachments.length % fakeFiles.length];
                setAttachments(prev => [...prev, next]);
              }}
              style={{
                width: '100%', padding: '14px',
                border: `1.5px dashed ${errorToast && requiresAttachment && attachments.length === 0 ? PFC.errorText : P.border}`, borderRadius: 12,
                background: errorToast && requiresAttachment && attachments.length === 0 ? PFC.errorBg : 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'border-color 0.3s, background 0.3s',
              }}
            >
              <LucideIcon name="Upload" size={18} color={errorToast && requiresAttachment && attachments.length === 0 ? PFC.errorText : P.inkSoft} strokeWidth={1.75} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: errorToast && requiresAttachment && attachments.length === 0 ? PFC.errorText : P.inkSoft }}>
                Upload document
              </span>
            </button>
          </div>

          </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: 4, padding: '16px 16px', background: PFC.errorBg, borderRadius: 10, border: `1px solid ${PFC.errorBorder}` }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: PFC.errorText, lineHeight: '18px' }}>{error}</div>
            </div>
          )}

          </div>
          )}
        </div>

        {/* Sticky CTA — only visible once leave type is chosen (skip when editing) */}
        {(editItem || leaveReason) && (
        <div style={{ position: 'sticky', bottom: 0, padding: '12px 16px 32px', background: 'white', borderTop: `1px solid ${P.border}`, ...(editItem ? {} : { animation: 'revealDown 0.35s ease-out 0.1s both' }) }}>
          <Button variant="primary" size="large" fullWidth disabled={!canSubmit} onClick={handleSubmit}>
            {submitting ? (editItem ? 'Updating…' : 'Submitting…') : (editItem ? 'Update request' : 'Submit request')}
          </Button>
        </div>
        )}

        {/* Error toast */}
        {errorToast && appShell && ReactDOM.createPortal(
          <div
            role="alert" aria-live="assertive"
            style={{
              position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)',
              zIndex: 500, whiteSpace: 'nowrap',
              background: PFC.errorText, color: 'white',
              borderRadius: 12, padding: '10px 18px',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
              boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              animation: 'fadeSlideIn 0.3s ease-out both',
            }}>
            <LucideIcon name="AlertCircle" size={16} color="white" strokeWidth={2} />
            {errorToast}
          </div>,
          appShell
        )}


        {/* Leave reason bottom sheet (mobile only) */}
        {!isDesktop && showReasonSheet && appShell && ReactDOM.createPortal(
          <div
            onClick={() => setShowReasonSheet(false)}
            style={{ position: 'absolute', inset: 0, zIndex: 400, background: 'rgba(15,13,40,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'sheetFadeIn 0.2s ease-out' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'white', borderRadius: '20px 20px 0 0', animation: 'sheetSlideUp 0.25s ease-out' }}
            >
              <div style={{ padding: '20px 24px 12px' }}>
                <div aria-hidden="true" style={{ width: 36, height: 4, borderRadius: 2, background: P.border, margin: '0 auto 16px' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: P.ink }}>
                  What type of leave?
                </div>
              </div>
              <div style={{ overflowY: 'auto', maxHeight: '70vh', padding: '0 24px 40px' }}>
                {(() => {
                  const _plannableTotal = LEAVE_BALANCES.filter(b => !b.urgent || b.remaining > 0).reduce((s, b) => s + b.remaining, 0);
                  const Row = ({ id, label, icon, sub, isLast, onClick: onClickOverride }) => {
                    const isSelected = leaveReason === 'timeoff' ? id === 'timeoff'
                      : leaveReason?.startsWith('special-funeral') ? id === 'special-funeral'
                      : leaveReason === id;
                    return (
                      <button
                        onClick={onClickOverride || (() => { setLeaveReason(id); setShowReasonSheet(false); })}
                        style={{
                          width: '100%', appearance: 'none', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '14px 0',
                          background: 'transparent', textAlign: 'left',
                        }}
                      >
                        <span style={{
                          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                          background: '#f3f4f6',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <LucideIcon name={icon} size={16} color={P.inkSoft} strokeWidth={1.75} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: isSelected ? 600 : 500, fontSize: 15, color: P.ink, lineHeight: '20px' }}>{label}</div>
                          {sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, marginTop: 1 }}>{sub}</div>}
                        </div>
                        <LucideIcon name="ChevronRight" size={18} color={P.inkSoft} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      </button>
                    );
                  };
                  const isAnySpecial = leaveReason?.startsWith('special-');
                  const specialSelected = isAnySpecial ? SPECIAL_LEAVE_OPTIONS.find(o => o.id === leaveReason) || BEREAVEMENT_OPTIONS.find(o => o.id === leaveReason) || WEDDING_OPTIONS.find(o => o.id === leaveReason) : null;
                  return (
                    <div>
                      <Row id="timeoff" label="Time off" icon="Palmtree" sub={`${_plannableTotal} days available`} />
                      <Row id="sick" label="Sick leave" icon="Stethoscope" sub="1 day without certificate, 2+ days requires one" />
                      <Row
                        id="_special" label="Special leave" icon="Gift"
                        sub={specialSelected ? specialSelected.label : 'Wedding, funeral, moving…'}
                        isLast
                        onClick={() => { setShowReasonSheet(false); setTimeout(() => setShowSpecialSheet(true), 180); }}
                      />
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>,
          appShell
        )}

        {/* Special leave bottom sheet (mobile only) */}
        {!isDesktop && showSpecialSheet && appShell && ReactDOM.createPortal(
          <div
            onClick={() => setShowSpecialSheet(false)}
            style={{ position: 'absolute', inset: 0, zIndex: 400, background: 'rgba(15,13,40,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'sheetFadeIn 0.2s ease-out' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'white', borderRadius: '20px 20px 0 0', animation: 'sheetSlideUp 0.25s ease-out' }}
            >
              <div style={{ padding: '20px 24px 12px' }}>
                <div aria-hidden="true" style={{ width: 36, height: 4, borderRadius: 2, background: P.border, margin: '0 auto 16px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => { setShowSpecialSheet(false); setTimeout(() => setShowReasonSheet(true), 180); }}
                    aria-label="Back"
                    style={{ width: 28, height: 28, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <LucideIcon name="ChevronLeft" size={20} color={P.ink} strokeWidth={2.5} />
                  </button>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: P.ink }}>Special leave</div>
                </div>
              </div>
              <div style={{ padding: '0 24px 40px' }}>
                {SPECIAL_LEAVE_OPTIONS.map((o, i) => {
                  const isSelected = leaveReason?.startsWith('special-funeral') ? o.id === 'special-funeral'
                    : leaveReason?.startsWith('special-wedding') ? o.id === 'special-wedding'
                    : leaveReason === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => { setLeaveReason(o.id); setShowSpecialSheet(false); }}
                      style={{
                        width: '100%', appearance: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 0',
                        background: 'transparent', textAlign: 'left',
                      }}
                    >
                      <span style={{
                        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                        background: '#f3f4f6',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <LucideIcon name={o.icon} size={16} color={P.inkSoft} strokeWidth={1.75} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: isSelected ? 600 : 500, fontSize: 15, color: P.ink, lineHeight: '20px' }}>{o.label}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, marginTop: 1 }}>
                          {o.sub} · {o.entitlementType === 'company-policy' ? `${o.entitlement} (company policy)` : o.entitlement}
                        </div>
                      </div>
                      <LucideIcon name="ChevronRight" size={18} color={P.inkSoft} strokeWidth={2.5} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          appShell
        )}

        {/* Sub-selection sheet (mobile only) */}
        {!isDesktop && showSubSheet && appShell && ReactDOM.createPortal(
          <div
            onClick={() => setShowSubSheet(false)}
            style={{ position: 'absolute', inset: 0, zIndex: 400, background: 'rgba(15,13,40,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'sheetFadeIn 0.2s ease-out' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'white', borderRadius: '20px 20px 0 0', animation: 'sheetSlideUp 0.25s ease-out' }}
            >
              <div style={{ padding: '20px 24px 12px' }}>
                <div aria-hidden="true" style={{ width: 36, height: 4, borderRadius: 2, background: P.border, margin: '0 auto 16px' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: P.ink }}>
                  {(leaveReason === 'special-wedding' || isWeddingSub) ? 'Whose wedding?' : 'What is your relationship to the person?'}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, marginTop: 4, lineHeight: '18px' }}>
                  The number of days you're entitled to depends on your answer.
                </div>
              </div>
              <div style={{ padding: '0 24px 40px' }}>
                {((leaveReason === 'special-wedding' || isWeddingSub) ? WEDDING_OPTIONS : BEREAVEMENT_OPTIONS).map((o, i, arr) => {
                  const isSelected = leaveReason === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => { setLeaveReason(o.id); setShowSubSheet(false); }}
                      style={{
                        width: '100%', appearance: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '14px 0',
                        borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${P.border}`,
                        background: 'transparent', textAlign: 'left',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: isSelected ? 600 : 500, fontSize: 15, color: P.ink, lineHeight: '20px' }}>{o.label}</div>
                        {o.note && <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkSoft, marginTop: 2, lineHeight: '16px' }}>{o.note}</div>}
                      </div>
                      <LucideIcon name="ChevronRight" size={16} color={P.inkSoft} strokeWidth={2} style={{ flexShrink: 0 }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          appShell
        )}

        {/* Edit hours — full-page overlay */}
        {showHoursSheet && appShell && startDate && (() => {
          const workDays = getWorkingDaysInRange(startDate, endDate || startDate);
          const DayPill = ({ label, active, onTap }) => (
            <button onClick={onTap} style={{
              padding: '8px 16px', borderRadius: 18,
              border: active ? `2px solid ${P.ink}` : `1px solid ${P.border}`,
              background: active ? 'rgba(15,13,40,0.06)' : '#fff',
              fontFamily: 'var(--font-display)', fontWeight: active ? 700 : 500, fontSize: 13,
              color: active ? P.ink : P.inkSoft,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}>{label}</button>
          );
          const setDayVal = (iso, val) => {
            setHalfDay(prev => {
              const next = { ...(prev || {}) };
              if (val === 'full') { delete next[iso]; }
              else { next[iso] = val; }
              return Object.keys(next).length === 0 ? null : next;
            });
          };
          const hoursContent = (
            <div style={{
              ...(isDesktop
                ? { maxHeight: '80vh', display: 'flex', flexDirection: 'column' }
                : { position: 'absolute', inset: 0, zIndex: 400, background: 'white', display: 'flex', flexDirection: 'column', animation: 'revealDown 0.25s ease-out both' }
              ),
            }}>
              {/* Header */}
              <div style={{ padding: isDesktop ? '24px 24px 8px' : '58px 16px 8px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {!isDesktop && (
                    <button
                      onClick={() => setShowHoursSheet(false)}
                      aria-label="Back"
                      style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: P.surface, border: 'none',
                        cursor: 'pointer', padding: 0,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <LucideIcon name="ChevronLeft" size={28} color={P.ink} strokeWidth={2} />
                    </button>
                  )}
                  <h1 style={{
                    flex: 1, margin: 0,
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: isDesktop ? 18 : 22,
                    color: P.ink, letterSpacing: '-0.007em',
                  }}>Edit hours by day</h1>
                  {isDesktop && (
                    <button
                      onClick={() => setShowHoursSheet(false)}
                      aria-label="Close"
                      style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: P.surface, border: 'none',
                        cursor: 'pointer', padding: 0,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                      <LucideIcon name="X" size={20} color={P.ink} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>

              {/* Summary strip */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 24px', margin: isDesktop ? '0 24px' : '0 16px',
                background: 'rgba(15,13,40,0.06)', borderRadius: 10,
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: P.inkSoft }}>Selected</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: P.ink }}>
                  {totalDays === 0.5 ? '½ day' : totalDays === 1 ? '1 day' : `${totalDays} days`}
                </span>
              </div>

              {/* Scrollable day list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: isDesktop ? '8px 24px 24px' : '8px 20px 120px' }}>
                {workDays.map((d, i) => {
                  const iso = _toISO(d);
                  const val = (halfDay && halfDay[iso]) || 'full';
                  return (
                    <div key={iso} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '16px 0',
                      borderTop: i > 0 ? `1px solid ${P.border}` : 'none',
                    }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: P.ink }}>
                        {d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <DayPill label="Full" active={val === 'full'} onTap={() => setDayVal(iso, 'full')} />
                        <DayPill label="AM" active={val === 'am'} onTap={() => setDayVal(iso, 'am')} />
                        <DayPill label="PM" active={val === 'pm'} onTap={() => setDayVal(iso, 'pm')} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Done button */}
              <div style={{ padding: isDesktop ? '16px 24px 24px' : '12px 16px 32px', background: 'white', borderTop: `1px solid ${P.border}`, flexShrink: 0, ...(isDesktop ? {} : { position: 'sticky', bottom: 0 }) }}>
                <Button variant="primary" size="large" fullWidth onClick={() => setShowHoursSheet(false)}>
                  Done
                </Button>
              </div>
            </div>
          );

          if (isDesktop) {
            return (
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setShowHoursSheet(false)}
              >
                <div onClick={(e) => e.stopPropagation()} style={{
                  background: 'white', borderRadius: 20, maxWidth: 520, width: '90%',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
                }}>
                  {hoursContent}
                </div>
              </div>
            );
          }

          return ReactDOM.createPortal(hoursContent, appShell);
        })()}
      </div>
    );
  }

}

window.registerScreen('request-time-off', RequestTimeOffScreen);

// ─────────────────────────────────────────────────────────────
// Time Off Detail — full-page view with details + timeline
// ─────────────────────────────────────────────────────────────
const DETAIL_STATUS = {
  approved: { label: 'Approved by Sophie L.',  color: 'rgb(22,163,74)',  bg: 'rgb(220,252,231)', icon: 'CircleCheck' },
  pending:  { label: 'Pending — Sophie L.',    color: 'rgb(161,98,7)',   bg: 'rgb(254,243,199)', icon: 'Clock'       },
  denied:   { label: 'Denied by Sophie L.',    color: 'rgb(185,28,28)',  bg: 'rgb(255,235,235)', icon: 'CircleX'     },
};


function TimeOffDetailScreen({ item }) {
  const nav = window.useNav ? window.useNav() : null;
  const isDesktop = window.ViewModeContext ? React.useContext(window.ViewModeContext) === 'desktop' : false;
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [detailToast, setDetailToast] = React.useState(null);
  if (!item) return <div style={{ padding: 40 }}>No item selected.</div>;

  const _stBase = DETAIL_STATUS[item.status] || DETAIL_STATUS.approved;
  const st = item._adminRecorded
    ? { ..._stBase, label: 'Recorded by Sophie L.' }
    : _stBase;

  const SectionHeader = ({ label }) => (
    <div style={{
      padding: '16px 24px',
      background: '#f7f7f8',
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
      color: P.ink,
    }}>{label}</div>
  );

  const DetailRow = ({ label, value, children }) => (
    <div style={{
      padding: '12px 24px',
      borderBottom: `1px solid ${P.border}`,
    }}>
      <div style={{
        fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12,
        color: P.inkSoft, lineHeight: '16px', marginBottom: 2,
      }}>{label}</div>
      {value && (
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
          color: P.ink, lineHeight: '22px',
        }}>{value}</div>
      )}
      {children}
    </div>
  );

  // Pay breakdown per leave type.
  // `phases` = multi-period pay (renders as a small phase list).
  // `simple` = single-line value.
  const _payInfoMap = {
    'Legal holiday':    { simple: 'Full pay' },
    'ADV day':          { simple: 'Full pay' },
    'Extra-legal leave':{ simple: 'Full pay' },
    'Short leave':      { simple: 'Full pay' },
    'Sick leave': { phases: [
      { period: 'Month 1',   amount: 'Full pay',  payer: 'Employer' },
      { period: 'Month 2+',  amount: '~65%',       payer: 'Mutuelle · INAMI' },
    ]},
    'Sick leave (with medical certificate)': { phases: [
      { period: 'Month 1',   amount: 'Full pay',  payer: 'Employer' },
      { period: 'Month 2+',  amount: '~65%',       payer: 'Mutuelle · INAMI' },
    ]},
    'Parental leave': { phases: [
      { period: 'Full period', amount: '~82%', payer: 'Mutuelle · INAMI' },
    ]},
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'white' }}>

      {/* Centered nav bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 16px 8px', position: 'relative',
      }}>
        <IconBtn name="ChevronLeft" onClick={() => nav && nav.pop()} ariaLabel="Back" size={36} color={P.ink} />
        <h1 style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
          color: P.ink, letterSpacing: '-0.003em', pointerEvents: 'none',
          margin: 0, whiteSpace: 'nowrap',
        }}>Time off details</h1>
        <IconBtn name="CircleHelp" ariaLabel="Help" size={36} />
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* Hero header */}
        {(() => {
          const chip = _getLeaveChip(item.label);
          return (
          <div style={{
            padding: isDesktop ? '24px 32px 32px' : '16px 24px 24px',
            borderBottom: `8px solid #f7f7f8`,
          }}>
            {/* Big title */}
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40,
              letterSpacing: '-0.04em', color: P.ink, lineHeight: '46px', marginBottom: 8,
            }}>{item.days === 1 ? '1 day' : `${item.days} days`}</div>

            {/* Date */}
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16,
              color: P.ink, marginBottom: 24,
            }}>{(() => {
              const _dN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
              const _mN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              const _mA = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
              const _mm = { January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11 };
              const mo = _mm[item.month];
              if (mo == null) return item.date;
              const fmt = (d, m) => `${_dN[new Date(2026, m, d).getDay()]} ${d} ${_mN[m]}`;
              const cm = item.date.match(/([A-Z][a-z]{2})\s*(\d+)\s*[–-]\s*([A-Z][a-z]{2})\s*(\d+)/);
              const sm = item.date.match(/(\d+)\s*[–-]\s*(\d+)/);
              if (cm) {
                const s = parseInt(cm[2]), e = parseInt(cm[4]);
                const sm2 = _mA[cm[1]] ?? mo, em = _mA[cm[3]] ?? mo;
                return <>{fmt(s, sm2)} <LucideIcon name="MoveRight" size={13} color="currentColor" strokeWidth={2} style={{display:'inline',verticalAlign:'middle',position:'relative',top:-1}} /> {fmt(e, em)}</>;
              } else if (sm) {
                const s = parseInt(sm[1]), e = parseInt(sm[2]);
                return <>{fmt(s, mo)} <LucideIcon name="MoveRight" size={13} color="currentColor" strokeWidth={2} style={{display:'inline',verticalAlign:'middle',position:'relative',top:-1}} /> {fmt(e, mo)}</>;
              } else {
                const dm = item.date.match(/(\d+)/);
                if (!dm) return item.date;
                return fmt(parseInt(dm[1]), mo);
              }
            })()}</div>

            {/* Add to calendar — only for approved requests */}
            {item.status === 'approved' && (
              <Button variant="outline" size="large" fullWidth leftIcon="CalendarPlus" onClick={() => {
                setDetailToast('Added to calendar');
                setTimeout(() => setDetailToast(null), 2500);
              }}>
                Add to calendar
              </Button>
            )}
          </div>
          );
        })()}

        {/* Details section — always shown */}
        {(() => {
          const chip = _getLeaveChip(item.label);
          const hasNotes = !!item._notes;
          const hasAttachments = item._attachments && item._attachments.length > 0;
          const hasHalfDay = item._halfDay && Object.keys(item._halfDay).length > 0;
          const payInfo = _payInfoMap[item.label];
          return (
            <>
              <SectionHeader label="Details" />

              {/* Leave type */}
              <DetailRow label="Leave type" value={item.label} />

              {/* Status */}
              <DetailRow
                label={item._adminRecorded ? 'Recorded by' : item.status === 'approved' ? 'Approved by' : item.status === 'pending' ? 'Pending review' : 'Denied by'}
                value={item._adminRecorded ? 'Sophie L. · HR admin' : item.status === 'pending' ? 'Waiting for Sophie L.' : 'Sophie L.'}
              />

              {/* Denial reason — only for denied items */}
              {item.status === 'denied' && (
                <DetailRow
                  label="Reason"
                  value={item._denialReason || 'No reason provided'}
                />
              )}

              {/* Pay */}
              {payInfo && (
                <DetailRow label="Pay" value={payInfo.simple || null}>
                  {payInfo.phases && (
                    <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {payInfo.phases.map((ph, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{
                            fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 12,
                            color: P.inkSoft, minWidth: 72, flexShrink: 0,
                          }}>{ph.period}</span>
                          <span style={{
                            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                            color: P.ink,
                          }}>{ph.amount}</span>
                          <span style={{
                            fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12,
                            color: P.inkSoft,
                          }}>via {ph.payer}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </DetailRow>
              )}

              {/* Notes */}
              {hasNotes && (
                <DetailRow label="Notes" value={item._notes} />
              )}

              {/* Half days */}
              {hasHalfDay && (
                <DetailRow label="Half days" value={
                  Object.entries(item._halfDay).map(([iso, val]) => {
                    const p = iso.split('-');
                    const d = new Date(+p[0], +p[1]-1, +p[2]);
                    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ' — ' + (val === 'am' ? 'Morning' : 'Afternoon');
                  }).join(', ')
                } />
              )}

              {/* Attachments */}
              {hasAttachments && (
                <DetailRow label="Attachments" value={item._attachments.length + ' file' + (item._attachments.length > 1 ? 's' : '')} />
              )}
            </>
          );
        })()}

        {/* Timeline section */}
        <SectionHeader label="Timeline" />
        <div style={{ padding: '16px 24px 24px' }}>
          {item.status === 'approved' && (
            <div style={{ display: 'flex', gap: 16, marginBottom: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
                <span aria-hidden="true" style={{ fontSize: 11, color: 'rgb(22,163,74)', lineHeight: 1 }}>●</span>
                <div style={{ width: 1, flex: 1, background: P.border, marginTop: 4 }} />
              </div>
              <div style={{ paddingBottom: 16, flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: P.ink,
                }}>{item._adminRecorded ? 'Recorded by Sophie L.' : 'Approved by Sophie L.'}</div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12,
                  color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2,
                }}>Nov 16, 2025</div>
              </div>
            </div>
          )}
          {!item._adminRecorded && (
            <div style={{ display: 'flex', gap: 16 }}>
              <div aria-hidden="true" style={{ paddingTop: 3 }}>
                <span style={{ fontSize: 11, color: P.inkSoft, lineHeight: 1 }}>●</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: P.ink,
                }}>Requested</div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12,
                  color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2,
                }}>Nov 16, 2025</div>
              </div>
            </div>
          )}
        </div>

        {/* Report illness banner — only for approved non-sick requests where some days are in the past */}
        {(() => {
          if (item.status !== 'approved') return false;
          if (item._leaveReason === 'sick') return false;
          const mMap = { January:0, February:1, March:2, April:3, May:4, June:5, July:6, August:7, September:8, October:9, November:10, December:11 };
          const mo = mMap[item.month];
          if (mo == null) return false;
          const dm = item.date.match(/(\d+)/);
          if (!dm) return false;
          const leaveStart = new Date(2026, mo, parseInt(dm[1]));
          leaveStart.setHours(0,0,0,0);
          const today = new Date(); today.setHours(0,0,0,0);
          return leaveStart <= today;
        })() && (
          <div style={{
            margin: '16px 24px',
            background: '#fce7f3',
            border: '1px solid #fbcfe8',
            borderRadius: 14,
            padding: '16px 16px',
            display: 'flex', gap: 12, alignItems: 'center',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <LucideIcon name="Heart" size={18} color="#db2777" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: '#9d174d',
              }}>Got sick during this leave?</div>
              <div style={{
                fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12,
                color: '#9d174d', opacity: 0.8, lineHeight: '16px', marginTop: 2,
              }}>Report illness to recover your vacation days.</div>
            </div>
            <button
              onClick={() => nav && nav.push('report-illness', { sourceItem: item })}
              style={{
                background: '#db2777', color: 'white', border: 'none',
                borderRadius: 10, padding: '8px 16px',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
              }}>
              Report
            </button>
          </div>
        )}

      </div>

      {/* Bottom CTAs — hidden for admin-recorded items */}
      {!item._adminRecorded && (
        item.status === 'denied' ? (
          // Denied: single "Request again" — clears the denied item and opens fresh form with same leave type
          <div style={{
            padding: '16px 24px 40px',
            borderTop: `1px solid ${P.border}`,
            background: 'white',
          }}>
            {(() => {
              const _labelToReason = {
                'Legal holiday': 'timeoff', 'ADV day': 'timeoff',
                'Extra-legal leave': 'timeoff', 'Time off': 'timeoff',
                'Short leave': 'special-civic',
                'Sick leave': 'sick',
              };
              return (
                <Button variant="primary" size="large" fullWidth onClick={() => {
                  nav && nav.pop();
                  setTimeout(() => {
                    nav && nav.push('request-time-off', { prefillReason: _labelToReason[item.label] || null, replaceDeniedItem: item });
                  }, 50);
                }}>
                  Request again
                </Button>
              );
            })()}
          </div>
        ) : (
          // Pending or approved: Cancel + Edit
          <div style={{
            display: 'flex', gap: 12,
            padding: '16px 24px 40px',
            borderTop: `1px solid ${P.border}`,
            background: 'white',
          }}>
            <Button
              variant="outline" size="large"
              style={{ flex: 1, color: PFC.errorText, borderColor: PFC.errorBorder }}
              onClick={() => setShowConfirm(true)}>
              Cancel request
            </Button>
            <Button
              variant="primary" size="large"
              style={{ flex: 1 }}
              onClick={() => nav && nav.push('request-time-off', { editItem: item })}>
              Edit
            </Button>
          </div>
        )
      )}

      {/* Detail toast */}
      {detailToast && (
        <div style={{
          position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
          background: P.ink, color: '#fff', padding: '10px 20px', borderRadius: 12,
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
          zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'fadeSlideIn 0.25s ease-out',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <LucideIcon name="Check" size={16} color="#fff" strokeWidth={2.5} />
          {detailToast}
        </div>
      )}

      {/* Cancel confirmation sheet — inline portal, no inner component */}
      {showConfirm && (() => {
        const appShell = document.querySelector('[data-app-shell]');
        if (!appShell) return null;
        const doDelete = () => {
          if (window.__timeOffItems) {
            window.__timeOffItems = window.__timeOffItems.filter(i => i.id !== item.id);
          }
          nav && nav.pop();
          setTimeout(() => {
            window.__refreshTimeOff && window.__refreshTimeOff();
            window.__showTimeOffToast && window.__showTimeOffToast('Request cancelled');
          }, 50);
        };
        return ReactDOM.createPortal(
          <div
            style={{
              position: 'absolute', inset: 0, zIndex: 400,
              background: 'rgba(15,13,40,0.45)',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            }}
            onKeyDown={(e) => { if (e.key === 'Escape') setShowConfirm(false); }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-cancel-title"
              aria-describedby="confirm-cancel-desc"
              style={{
                background: 'white',
                borderRadius: '20px 20px 0 0',
                padding: '24px 20px 40px',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
              <div aria-hidden="true" style={{
                width: 36, height: 4, borderRadius: 2,
                background: P.border, margin: '0 auto 16px',
              }} />
              <div id="confirm-cancel-title" style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
                color: P.ink, textAlign: 'center', marginBottom: 8,
              }}>Cancel this request?</div>
              <div id="confirm-cancel-desc" style={{
                fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 14,
                color: P.inkSoft, textAlign: 'center', marginBottom: 16,
                lineHeight: '20px',
              }}>Your time off request will be withdrawn. You can always submit a new one.</div>
              <Button
                variant="outline" size="large" fullWidth
                style={{ color: PFC.errorText, borderColor: PFC.errorBorder }}
                onClick={doDelete}>
                Cancel request
              </Button>
              <Button
                variant="ghost" size="large" fullWidth
                autoFocus
                onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
            </div>
          </div>,
          appShell
        );
      })()}

    </div>
  );
}

window.registerScreen('time-off-detail', TimeOffDetailScreen);

// ════════════════════════════════════════════════════════════════
// Report Illness Screen — Report sick days within an approved leave
// ════════════════════════════════════════════════════════════════
function ReportIllnessScreen({ sourceItem }) {
  const nav = window.useNav ? window.useNav() : null;

  if (!sourceItem) return <div style={{ padding: 40 }}>No item selected.</div>;

  // Parse the date range from the source item
  const monthMap = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11,
  };
  const m = monthMap[sourceItem.month];
  const match = sourceItem.date.match(/(\d+)(?:\s*[–-]\s*(\d+))?/);
  const sDay = match ? parseInt(match[1]) : 1;
  const eDay = match && match[2] ? parseInt(match[2]) : sDay;
  const leaveDays = [];
  for (let d = sDay; d <= eDay; d++) {
    const dt = new Date(2026, m, d);
    if (!_isWeekend(dt) && !_isHoliday(dt)) leaveDays.push(dt);
  }

  // Only past days (≤ today) are selectable
  const today = new Date(); today.setHours(0,0,0,0);
  const pastDays = leaveDays.filter(dt => dt <= today);
  const futureDays = leaveDays.filter(dt => dt > today);

  const [selectedDays, setSelectedDays] = React.useState(new Set());
  const [attachments, setAttachments] = React.useState([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [step, setStep] = React.useState(0); // 0 = form, 1 = success
  const [errorToast, setErrorToast] = React.useState(null);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const toggleDay = (iso) => {
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(iso)) next.delete(iso); else next.add(iso);
      return next;
    });
  };

  const handleSubmit = () => {
    if (selectedDays.size === 0) {
      setErrorToast('Please select at least one sick day');
      setTimeout(() => setErrorToast(null), 3500);
      return;
    }
    if (attachments.length === 0) {
      setErrorToast('Please upload a medical certificate');
      setTimeout(() => setErrorToast(null), 3500);
      const el = document.getElementById('ri-attachments');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      // Update the original item's days (reduce by sick days)
      const sickCount = selectedDays.size;
      const remainingDays = sourceItem.days - sickCount;
      if (window.__timeOffItems) {
        // Create a new sick leave entry
        const sickItem = {
          id: 'sick-' + Date.now(),
          label: 'Sick leave',
          date: sickCount === 1
            ? [...selectedDays].map(iso => { const p = iso.split('-'); return +p[2]; })[0] + ' ' + monthNames[m]
            : [...selectedDays].map(iso => { const p = iso.split('-'); return +p[2]; }).sort((a,b) => a-b).join(', ') + ' ' + monthNames[m],
          month: sourceItem.month,
          days: sickCount,
          status: 'pending',
          _leaveReason: 'sick',
          _attachments: attachments,
          _notes: 'Reported illness during ' + sourceItem.label.toLowerCase() + ' (' + sourceItem.date + ')',
        };
        // Update original — reduce days
        window.__timeOffItems = window.__timeOffItems.map(i => {
          if (i.id === sourceItem.id) {
            if (remainingDays <= 0) {
              // Entire leave was sick — convert status
              return { ...i, days: i.days, _sickConverted: sickCount };
            }
            return { ...i, days: remainingDays, _sickConverted: sickCount };
          }
          return i;
        });
        window.__timeOffItems.push(sickItem);
        // Sync to HR Admin via localStorage
        const _sortedISO = [...selectedDays].sort();
        const _sStart = new Date(_sortedISO[0] + 'T00:00:00');
        const _sEnd   = new Date(_sortedISO[_sortedISO.length - 1] + 'T00:00:00');
        const _sfmt = d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
        _pushToHR({
          id: sickItem.id, employee: 'david', type: 'Sick leave',
          startDate: _sfmt(_sStart), endDate: _sfmt(_sEnd),
          days: sickItem.days, status: 'pending', submittedAt: 'Just now', note: sickItem._notes || '',
        });
      }
      setSubmitting(false);
      setStep(1);
    }, 1200);
  };

  const appShell = document.querySelector('[data-app-shell]');

  // ── Success screen ──
  if (step === 1) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100%', padding: '40px 32px', textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#fce7f3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
          animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          <LucideIcon name="Heart" size={32} color="#db2777" />
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
          color: P.ink, marginBottom: 8,
        }}>Wishing you a speedy recovery</div>
        <div style={{
          fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 15,
          color: P.inkSoft, lineHeight: '22px', marginBottom: 8,
        }}>
          {selectedDays.size} sick day{selectedDays.size > 1 ? 's' : ''} reported. {selectedDays.size > 1 ? 'Those days' : 'That day'} will be converted back to vacation after HR approval.
        </div>
        <div style={{
          fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 13,
          color: P.inkSoft, opacity: 0.7, marginBottom: 32, lineHeight: '18px',
        }}>Your manager has been notified.</div>
        <Button variant="primary" size="large" fullWidth onClick={() => {
          nav && nav.pop();
          nav && nav.pop(); // pop back to hub from detail
          setTimeout(() => {
            window.__refreshTimeOff && window.__refreshTimeOff();
            window.__showTimeOffToast && window.__showTimeOffToast('Illness reported');
          }, 50);
        }}>
          Back to time off
        </Button>
      </div>
    );
  }

  // ── Form ──
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'white',
    }}>
      {/* Header */}
      <NavBar title="Report illness" />

      {/* Scrollable content */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 20px 20px',
      }}>
        {/* Context card */}
        <div style={{
          background: '#f7f7f8', borderRadius: 12, padding: '16px 16px',
          marginBottom: 24,
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.ink,
          }}>{sourceItem.label}</div>
          <div style={{
            fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 13, color: P.inkSoft, marginTop: 2,
          }}>{(() => {
            const _dN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            const _mN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const _mA = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
            const _mm = { January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11 };
            const mo = _mm[sourceItem.month];
            if (mo == null) return sourceItem.date;
            const fmt = (d, m) => `${_dN[new Date(2026, m, d).getDay()]} ${d} ${_mN[m]}`;
            const cm = sourceItem.date.match(/([A-Z][a-z]{2})\s*(\d+)\s*[–-]\s*([A-Z][a-z]{2})\s*(\d+)/);
            const sm = sourceItem.date.match(/(\d+)\s*[–-]\s*(\d+)/);
            if (cm) {
              const s = parseInt(cm[2]), e = parseInt(cm[4]);
              const sm2 = _mA[cm[1]] ?? mo, em = _mA[cm[3]] ?? mo;
              return <>{fmt(s, sm2)} <LucideIcon name="MoveRight" size={13} color="currentColor" strokeWidth={2} style={{display:'inline',verticalAlign:'middle',position:'relative',top:-1}} /> {fmt(e, em)} · {sourceItem.days} day{sourceItem.days > 1 ? 's' : ''}</>;
            } else if (sm) {
              const s = parseInt(sm[1]), e = parseInt(sm[2]);
              return <>{fmt(s, mo)} <LucideIcon name="MoveRight" size={13} color="currentColor" strokeWidth={2} style={{display:'inline',verticalAlign:'middle',position:'relative',top:-1}} /> {fmt(e, mo)} · {sourceItem.days} day{sourceItem.days > 1 ? 's' : ''}</>;
            } else {
              const dm = sourceItem.date.match(/(\d+)/);
              if (!dm) return <>{sourceItem.date} · {sourceItem.days} day{sourceItem.days > 1 ? 's' : ''}</>;
              return <>{fmt(parseInt(dm[1]), mo)} · {sourceItem.days} day{sourceItem.days > 1 ? 's' : ''}</>;
            }
          })()}</div>
        </div>

        {/* Day picker */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
            color: P.inkSoft, marginBottom: 8,
          }}>Which days were you sick?</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pastDays.map(dt => {
              const iso = _toISO(dt);
              const isOn = selectedDays.has(iso);
              return (
                <button
                  key={iso}
                  onClick={() => toggleDay(iso)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '16px 16px',
                    border: `1.5px solid ${isOn ? '#db2777' : P.border}`,
                    borderRadius: 12,
                    background: isOn ? '#fdf2f8' : 'white',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    border: `2px solid ${isOn ? '#db2777' : '#d1d5db'}`,
                    background: isOn ? '#db2777' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 150ms ease',
                  }}>
                    {isOn && <LucideIcon name="Check" size={14} color="white" strokeWidth={3} />}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, color: P.ink,
                  }}>
                    {dayNames[dt.getDay()]} {dt.getDate()} {monthNames[dt.getMonth()]}
                  </div>
                </button>
              );
            })}
            {futureDays.length > 0 && (
              <>
                <div style={{
                  fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 11,
                  color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.06em',
                  marginTop: 8, marginBottom: 0,
                }}>Upcoming (not yet selectable)</div>
                {futureDays.map(dt => {
                  const iso = _toISO(dt);
                  return (
                    <div
                      key={iso}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '16px 16px',
                        border: `1.5px solid ${P.border}`,
                        borderRadius: 12,
                        background: '#f9fafb',
                        opacity: 0.5,
                      }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        border: '2px solid #e5e7eb', background: '#f3f4f6',
                        flexShrink: 0,
                      }} />
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, color: P.inkSoft,
                      }}>
                        {dayNames[dt.getDay()]} {dt.getDate()} {monthNames[dt.getMonth()]}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {selectedDays.size > 0 && (
            <div style={{
              marginTop: 8, padding: '8px 16px', background: '#fdf2f8', borderRadius: 8,
              fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13, color: '#db2777',
              textAlign: 'center',
            }}>
              {selectedDays.size} sick day{selectedDays.size > 1 ? 's' : ''} selected → {selectedDays.size} vacation day{selectedDays.size > 1 ? 's' : ''} returned
            </div>
          )}
        </div>

        {/* Attachments — medical certificate required */}
        <div id="ri-attachments" style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
            color: errorToast ? PFC.errorText : P.inkSoft, marginBottom: 8,
            transition: 'color 200ms',
          }}>
            Medical certificate <span style={{ fontWeight: 500, color: PFC.errorText }}>*</span>
          </div>

          {attachments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
              {attachments.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', background: '#f7f7f8', borderRadius: 10,
                }}>
                  <LucideIcon name="FileText" size={16} color={P.inkSoft} />
                  <span style={{
                    flex: 1, fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 14,
                    color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{a}</span>
                  <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  }}>
                    <LucideIcon name="X" size={14} color={P.inkSoft} />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <button
            onClick={() => setAttachments(prev => [...prev, 'medical-certificate-' + (prev.length + 1) + '.pdf'])}
            style={{
              width: '100%', padding: '16px 16px',
              border: `1.5px dashed ${errorToast ? PFC.errorText : P.border}`,
              borderRadius: 12,
              background: errorToast ? '#fff5f5' : '#fafafa',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14,
              color: errorToast ? PFC.errorText : P.inkSoft,
              transition: 'all 200ms',
            }}>
            <LucideIcon name="Upload" size={16} color={errorToast ? PFC.errorText : P.inkSoft} />
            Upload certificate
          </button>
        </div>

        {/* Info note */}
        <div style={{
          background: '#eff6ff', borderRadius: 10, padding: '16px 16px',
          display: 'flex', gap: 8, alignItems: 'flex-start',
        }}>
          <LucideIcon name="Info" size={15} color="#2563eb" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{
            fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12,
            color: '#1e40af', lineHeight: '17px',
          }}>
            Under Belgian law (2024), sick days during planned vacation are converted back to annual leave. Your vacation balance will be restored after HR approval.
          </div>
        </div>
      </div>

      {/* Sticky submit */}
      <div style={{
        padding: '16px 24px 40px',
        borderTop: `1px solid ${P.border}`,
        background: 'white',
      }}>
        <Button variant="primary" size="large" fullWidth
          onClick={handleSubmit}
          disabled={submitting}>
          {submitting ? 'Submitting…' : `Report ${selectedDays.size || ''} sick day${selectedDays.size !== 1 ? 's' : ''}`}
        </Button>
      </div>

      {/* Error toast */}
      {errorToast && appShell && ReactDOM.createPortal(
        <div role="alert" style={{
          position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)',
          zIndex: 500, background: PFC.errorText, color: 'white', borderRadius: 12,
          padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', whiteSpace: 'nowrap',
          animation: 'popIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        }}>
          <LucideIcon name="AlertCircle" size={16} color="white" />
          {errorToast}
        </div>,
        appShell
      )}
    </div>
  );
}

window.registerScreen('report-illness', ReportIllnessScreen);
