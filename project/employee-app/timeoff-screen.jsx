// Time Off screen — Payflip employee app
// Belgium JC 200 leave types: legal holidays, ADV, short leave (klein verlet), sick day

const TO = {
  ink: 'rgb(15,13,40)',
  inkSoft: 'rgb(80,84,94)',
  border: 'rgb(217,218,221)',
  divider: 'rgb(234,234,235)',
  purpleTile: 'rgb(245,226,254)',
  purpleTileT: 'rgba(245,226,254,0.31)',
  purpleDeep: 'rgb(139,55,235)',
  greenBg: 'rgb(236,253,245)',
  greenText: 'rgb(5,122,85)',
  greenBorder: 'rgb(167,243,208)',
  warnBg: 'rgb(255,243,229)',
  warnBorder: 'rgb(255,225,190)',
  warnText: 'rgb(166,79,33)',
  redBg: 'rgb(255,235,235)',
  redText: 'rgb(143,20,20)',
  blueBg: 'rgb(239,246,255)',
  blueText: 'rgb(29,78,216)',
  blueBorder: 'rgb(191,219,254)',
  pink: 'rgb(212,74,116)',
  bg: 'rgb(247,247,248)',
};

// ─────────────────────────────────────────────────────────────
// Leave type definitions
// ─────────────────────────────────────────────────────────────
const LEAVE_TYPES = [
  {
    id: 'legal',
    label: 'Legal holiday',
    labelNL: 'Wettelijke vakantie',
    icon: 'Sun',
    color: TO.purpleTile,
    iconColor: TO.purpleDeep,
    balance: 12,
    total: 20,
    unit: 'days',
    multiDay: true,
    needsReason: false,
    supportsHalfDay: true,
    description: 'Your annual paid vacation days',
  },
  {
    id: 'adv',
    label: 'ADV day',
    labelNL: 'Recuperatiedag',
    icon: 'Clock',
    color: 'rgb(239,246,255)',
    iconColor: 'rgb(29,78,216)',
    balance: 5,
    total: 12,
    unit: 'days',
    multiDay: true,
    needsReason: false,
    supportsHalfDay: true,
    description: 'Recuperation days from overtime hours',
  },
  {
    id: 'klein',
    label: 'Short leave',
    labelNL: 'Klein verlet',
    icon: 'Heart',
    color: 'rgb(255,241,242)',
    iconColor: 'rgb(190,18,60)',
    balance: null,
    total: null,
    unit: 'event',
    multiDay: false,
    needsReason: true,
    supportsHalfDay: false,
    description: 'Paid leave for special personal events',
  },
  {
    id: 'sick',
    label: 'Sick day',
    labelNL: 'Ziekte zonder attest',
    icon: 'Thermometer',
    color: 'rgb(236,253,245)',
    iconColor: 'rgb(5,122,85)',
    balance: 2,
    total: 2,
    unit: 'days',
    multiDay: false,
    needsReason: false,
    supportsHalfDay: false,
    description: 'No doctor\'s certificate needed (max 2×/year)',
  },
];

const KLEIN_VERLET_REASONS = [
  { id: 'marriage_self', label: 'Your own wedding', days: 2 },
  { id: 'marriage_child', label: 'Wedding of a child', days: 1 },
  { id: 'marriage_family', label: 'Wedding of a sibling / parent / in-law', days: 1 },
  { id: 'birth', label: 'Birth of a child', days: 3 },
  { id: 'death_partner', label: 'Death of a partner or child', days: 3 },
  { id: 'death_parent', label: 'Death of a parent / sibling / in-law', days: 3 },
  { id: 'death_family', label: 'Death of another close relative', days: 1 },
  { id: 'communion', label: 'First communion of a child', days: 1 },
  { id: 'civic', label: 'Civic duty (jury, voting)', days: 1 },
];

// Mock history
const MOCK_HISTORY = [
  { id: 'h1', type: 'legal', label: 'Legal holiday', dates: 'Aug 4 – 8, 2025', days: 5, status: 'approved' },
  { id: 'h2', type: 'adv',   label: 'ADV day',       dates: 'Jul 11, 2025',    days: 1, status: 'pending' },
  { id: 'h3', type: 'sick',  label: 'Sick day',       dates: 'Jun 2, 2025',     days: 1, status: 'approved' },
  { id: 'h4', type: 'klein', label: 'Short leave',    dates: 'May 23, 2025',    days: 1, status: 'approved' },
];

// ─────────────────────────────────────────────────────────────
// Shared atoms
// ─────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    approved: { bg: TO.greenBg, color: TO.greenText, border: TO.greenBorder, label: 'Approved' },
    pending:  { bg: TO.warnBg,  color: TO.warnText,  border: TO.warnBorder,  label: 'Pending'  },
    rejected: { bg: TO.redBg,   color: TO.redText,   border: '#fca5a5',      label: 'Rejected' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      borderRadius: 99, padding: '2px 10px',
      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, lineHeight: '18px',
    }}>{s.label}</span>
  );
}

function LeaveIconTile({ type, size = 40 }) {
  const t = LEAVE_TYPES.find(l => l.id === type) || LEAVE_TYPES[0];
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: t.color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flex: 'none',
    }}>
      <LucideIcon name={t.icon} size={size * 0.55} color={t.iconColor} strokeWidth={1.75} />
    </div>
  );
}

function TOPrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', appearance: 'none', border: 'none',
      background: disabled ? 'rgb(217,218,221)' : TO.ink,
      color: disabled ? TO.inkSoft : '#fff',
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, lineHeight: '24px',
      padding: '14px 20px', borderRadius: 12,
      cursor: disabled ? 'default' : 'pointer',
      ...style,
    }}>{children}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// Balance cards row (horizontal scroll)
// ─────────────────────────────────────────────────────────────
function BalanceCards() {
  const typed = LEAVE_TYPES.filter(t => t.balance !== null);
  return (
    <div style={{ overflowX: 'auto', marginLeft: -16, marginRight: -16, paddingLeft: 16 }}>
      <div style={{ display: 'flex', gap: 10, paddingRight: 16, width: 'max-content' }}>
        {typed.map(t => (
          <div key={t.id} style={{
            background: 'white', border: `1px solid ${TO.border}`,
            borderRadius: 14, padding: '14px 16px',
            minWidth: 130,
          }}>
            <LeaveIconTile type={t.id} size={36} />
            <div style={{
              marginTop: 10,
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
              letterSpacing: '-0.02em', color: TO.ink,
            }}>{t.balance}<span style={{ fontSize: 14, fontWeight: 500, color: TO.inkSoft }}> / {t.total}</span></div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 12,
              color: TO.inkSoft, lineHeight: '16px', marginTop: 2,
            }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// History list
// ─────────────────────────────────────────────────────────────
function HistoryRow({ item }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0',
      borderBottom: `1px solid ${TO.divider}`,
    }}>
      <LeaveIconTile type={item.type} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
          color: TO.ink, lineHeight: '20px',
        }}>{item.label}</div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13,
          color: TO.inkSoft, lineHeight: '18px',
        }}>{item.dates} · {item.days === 0.5 ? '½ day' : `${item.days} ${item.days === 1 ? 'day' : 'days'}`}</div>
      </div>
      <StatusPill status={item.status} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TimeOffScreen — main tab root
// ─────────────────────────────────────────────────────────────
function TimeOffScreen() {
  const { push } = useNav();
  const [history, setHistory] = React.useState(() => {
    return (window.__timeOffRequests || []).concat(MOCK_HISTORY);
  });

  // refresh history when returning
  React.useEffect(() => {
    if (window.__timeOffRequests && window.__timeOffRequests.length) {
      setHistory((window.__timeOffRequests || []).concat(MOCK_HISTORY));
    }
  }, []);

  return (
    <div style={{ padding: '8px 16px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28,
          letterSpacing: '-0.007em', color: TO.ink, margin: 0, lineHeight: '36px',
        }}>Time off</h1>
      </div>

      {/* Balance overview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
          letterSpacing: '-0.003em', color: TO.ink,
        }}>Your balance</div>
        <BalanceCards />
      </div>

      {/* CTA */}
      <TOPrimaryButton onClick={() => push('request-time-off')}>
        Request time off
      </TOPrimaryButton>

      {/* History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
          letterSpacing: '-0.003em', color: TO.ink, marginBottom: 4,
        }}>Requests</div>
        {history.length === 0 && (
          <div style={{
            padding: '32px 0', textAlign: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: TO.inkSoft,
          }}>No requests yet</div>
        )}
        {history.map(item => <HistoryRow key={item.id} item={item} />)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Request Time Off wizard
// Steps: 0=type, 1=dates, 2=details, 3=review, 4=success
// ─────────────────────────────────────────────────────────────

// Simple calendar component
function MiniCalendar({ year, month, selected, onSelect, rangeEnd, rangeMode }) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first: shift Sunday (0) to 6
  const startOffset = (firstDay + 6) % 7;
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

  const isSelected = (d) => {
    if (!selected) return false;
    const dt = new Date(year, month, d);
    if (!rangeMode || !rangeEnd) return dt.getTime() === selected.getTime();
    const lo = selected < rangeEnd ? selected : rangeEnd;
    const hi = selected < rangeEnd ? rangeEnd : selected;
    return dt >= lo && dt <= hi;
  };
  const isStart = (d) => selected && new Date(year, month, d).getTime() === selected.getTime();
  const isEnd = (d) => rangeEnd && new Date(year, month, d).getTime() === rangeEnd.getTime();
  const isWeekend = (d) => {
    const day = new Date(year, month, d).getDay();
    return day === 0 || day === 6;
  };

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
        {DAY_LABELS.map(l => (
          <div key={l} style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
            color: TO.inkSoft, paddingBottom: 6,
          }}>{l}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const sel = isSelected(d);
          const start = isStart(d);
          const end = isEnd(d);
          const weekend = isWeekend(d);
          return (
            <button key={d} onClick={() => onSelect(new Date(year, month, d))}
              disabled={weekend}
              style={{
                appearance: 'none', border: 'none',
                background: (start || end) ? TO.ink : sel ? 'rgb(232,216,240)' : 'transparent',
                color: (start || end) ? '#fff' : weekend ? TO.border : TO.ink,
                fontFamily: 'var(--font-display)', fontWeight: sel ? 600 : 400, fontSize: 14,
                borderRadius: 8, padding: '7px 0',
                cursor: weekend ? 'default' : 'pointer',
              }}>{d}</button>
          );
        })}
      </div>
    </div>
  );
}

// ── Half-day segmented control ──
function HalfDayPicker({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 12,
          color: TO.inkSoft, textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>{label}</div>
      )}
      <div style={{
        display: 'flex', gap: 0,
        background: TO.bg, borderRadius: 10, padding: 3,
        border: `1px solid ${TO.border}`,
      }}>
        {options.map(opt => (
          <button key={opt.value} onClick={() => onChange(opt.value)}
            style={{
              flex: 1, appearance: 'none', cursor: 'pointer',
              background: value === opt.value ? '#fff' : 'transparent',
              border: value === opt.value ? `1px solid ${TO.border}` : '1px solid transparent',
              borderRadius: 8, padding: '7px 4px',
              fontFamily: 'var(--font-display)', fontWeight: value === opt.value ? 700 : 500,
              fontSize: 13, color: value === opt.value ? TO.ink : TO.inkSoft,
              boxShadow: value === opt.value ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 120ms ease-out',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
            {opt.icon && <LucideIcon name={opt.icon} size={12} color={value === opt.value ? TO.ink : TO.inkSoft} strokeWidth={2} />}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function RequestTimeOffScreen() {
  const { pop, reset, switchTab } = useNav();
  const [step, setStep] = React.useState(0);
  const [leaveType, setLeaveType] = React.useState(null);
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [datePickMode, setDatePickMode] = React.useState('start'); // 'start' | 'end'
  // Half-day: 'full' | 'morning' | 'afternoon'
  const [startHalf, setStartHalf] = React.useState('full');
  const [endHalf, setEndHalf] = React.useState('full');
  const [reason, setReason] = React.useState(null);
  const [note, setNote] = React.useState('');

  const today = new Date();
  const [calYear, setCalYear] = React.useState(today.getFullYear());
  const [calMonth, setCalMonth] = React.useState(today.getMonth());

  const typeObj = LEAVE_TYPES.find(t => t.id === leaveType);
  const isMultiDay = typeObj && typeObj.multiDay;
  const needsReason = typeObj && typeObj.needsReason;
  const supportsHalfDay = typeObj && typeObj.supportsHalfDay;

  // Reset half-day when dates change
  React.useEffect(() => { setStartHalf('full'); setEndHalf('full'); }, [startDate, endDate]);

  // Count working days between two dates
  function countWorkDays(start, end) {
    if (!start) return 0;
    const s = start < end ? start : end;
    const e = start < end ? end : start;
    let count = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const d = cur.getDay();
      if (d !== 0 && d !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  const isSingleDay = startDate && (!endDate || startDate.getTime() === (endDate || startDate).getTime());

  // Effective days accounting for half-day selections
  function getEffectiveDays() {
    if (!startDate) return 0;
    const base = isMultiDay ? countWorkDays(startDate, endDate || startDate) : 1;
    if (!supportsHalfDay) return base;
    let deduct = 0;
    if (isSingleDay) {
      // single day: morning or afternoon = 0.5
      if (startHalf === 'morning' || startHalf === 'afternoon') deduct = 0.5;
    } else {
      if (startHalf === 'afternoon') deduct += 0.5;
      if (endHalf === 'morning') deduct += 0.5;
    }
    return Math.max(0.5, base - deduct);
  }

  const workDays = getEffectiveDays();

  function fmtDays(d) {
    if (d === 0.5) return '½ day';
    if (d % 1 === 0.5) return `${Math.floor(d)}½ days`;
    return `${d} working day${d !== 1 ? 's' : ''}`;
  }

  function fmtDate(d) {
    if (!d) return '';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function handleDateSelect(d) {
    if (!isMultiDay) {
      setStartDate(d);
      setEndDate(d);
      return;
    }
    if (datePickMode === 'start') {
      setStartDate(d);
      setEndDate(null);
      setDatePickMode('end');
    } else {
      if (d < startDate) {
        setEndDate(startDate);
        setStartDate(d);
      } else {
        setEndDate(d);
      }
      setDatePickMode('start');
    }
  }

  function handleSubmit() {
    const halfLabel = isSingleDay && startHalf !== 'full'
      ? ` (${startHalf})`
      : '';
    const newReq = {
      id: `req-${Date.now()}`,
      type: leaveType,
      label: typeObj.label,
      dates: (isMultiDay && endDate && endDate.getTime() !== startDate.getTime()
        ? `${fmtDate(startDate)} – ${fmtDate(endDate)}`
        : fmtDate(startDate)) + halfLabel,
      days: workDays,
      status: 'pending',
    };
    window.__timeOffRequests = [newReq, ...(window.__timeOffRequests || [])];
    setStep(4);
  }

  const STEP_COUNT = 4; // 0..3 before success

  // ── header ──
  const stepTitles = ['Leave type', 'Choose dates', needsReason ? 'Occasion' : 'Details', 'Review'];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      {/* Nav bar */}
      {step < 4 && (
        <NavBar
          title={stepTitles[step]}
          onBack={step === 0 ? pop : () => setStep(s => s - 1)}
        />
      )}

      {/* Progress dots */}
      {step < 4 && (
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', padding: '0 16px 16px' }}>
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <div key={i} style={{
              height: 4, flex: 1, borderRadius: 99,
              background: i <= step ? TO.ink : TO.border,
              transition: 'background 200ms',
            }} />
          ))}
        </div>
      )}

      {/* ── Step 0: choose type ── */}
      {step === 0 && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14,
            color: TO.inkSoft, margin: '0 0 8px',
          }}>What type of leave do you need?</p>
          {LEAVE_TYPES.map(t => (
            <button key={t.id} onClick={() => { setLeaveType(t.id); setStep(1); }}
              style={{
                appearance: 'none', width: '100%', textAlign: 'left',
                background: leaveType === t.id ? TO.bg : 'white',
                border: `1.5px solid ${leaveType === t.id ? TO.ink : TO.border}`,
                borderRadius: 14, padding: '14px 14px 14px 14px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
              }}>
              <LeaveIconTile type={t.id} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                  color: TO.ink, lineHeight: '20px',
                }}>{t.label}</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13,
                  color: TO.inkSoft, lineHeight: '18px', marginTop: 2,
                }}>{t.description}</div>
                {t.balance !== null && (
                  <div style={{
                    marginTop: 6,
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
                    color: t.balance > 3 ? TO.greenText : TO.warnText,
                  }}>{t.balance} day{t.balance !== 1 ? 's' : ''} remaining</div>
                )}
              </div>
              <LucideIcon name="ChevronRight" size={18} color={TO.inkSoft} strokeWidth={2} />
            </button>
          ))}
        </div>
      )}

      {/* ── Step 1: date picker ── */}
      {step === 1 && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Date range pill selectors */}
            {isMultiDay && (
              <div style={{ display: 'flex', gap: 8 }}>
                {[['start', 'From', startDate], ['end', 'To', endDate]].map(([mode, label, val]) => (
                  <button key={mode} onClick={() => setDatePickMode(mode)}
                    style={{
                      flex: 1, appearance: 'none', cursor: 'pointer',
                      background: datePickMode === mode ? TO.ink : TO.bg,
                      border: `1.5px solid ${datePickMode === mode ? TO.ink : TO.border}`,
                      borderRadius: 10, padding: '10px 12px', textAlign: 'left',
                    }}>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 11,
                      color: datePickMode === mode ? 'rgba(255,255,255,0.6)' : TO.inkSoft,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>{label}</div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                      color: datePickMode === mode ? '#fff' : val ? TO.ink : TO.inkSoft,
                      marginTop: 2,
                    }}>{val ? fmtDate(val) : '—'}</div>
                  </button>
                ))}
              </div>
            )}
            {!isMultiDay && (
              <div style={{
                background: TO.bg, border: `1px solid ${TO.border}`,
                borderRadius: 10, padding: '10px 14px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 11,
                  color: TO.inkSoft, textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>Date</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                  color: startDate ? TO.ink : TO.inkSoft, marginTop: 2,
                }}>{startDate ? fmtDate(startDate) : 'Select a date'}</div>
              </div>
            )}

            {/* Month navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => {
                if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                else setCalMonth(m => m - 1);
              }} style={{ appearance: 'none', border: 'none', background: TO.bg, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LucideIcon name="ChevronLeft" size={18} color={TO.ink} />
              </button>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: TO.ink }}>
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][calMonth]} {calYear}
              </div>
              <button onClick={() => {
                if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                else setCalMonth(m => m + 1);
              }} style={{ appearance: 'none', border: 'none', background: TO.bg, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LucideIcon name="ChevronRight" size={18} color={TO.ink} />
              </button>
            </div>

            <MiniCalendar
              year={calYear}
              month={calMonth}
              selected={startDate}
              rangeEnd={isMultiDay ? endDate : null}
              rangeMode={isMultiDay}
              onSelect={handleDateSelect}
            />

            {/* Half-day pickers — only for supported leave types after date is selected */}
            {supportsHalfDay && startDate && (
              isSingleDay ? (
                <HalfDayPicker
                  label="Duration"
                  value={startHalf}
                  onChange={setStartHalf}
                  options={[
                    { value: 'full',      label: 'Full day',  icon: 'Sun'      },
                    { value: 'morning',   label: 'Morning',   icon: 'Sunrise'  },
                    { value: 'afternoon', label: 'Afternoon', icon: 'Sunset'   },
                  ]}
                />
              ) : endDate && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <HalfDayPicker
                    label="First day starts"
                    value={startHalf}
                    onChange={setStartHalf}
                    options={[
                      { value: 'full',      label: 'Morning (full)' },
                      { value: 'afternoon', label: 'Afternoon only'  },
                    ]}
                  />
                  <HalfDayPicker
                    label="Last day ends"
                    value={endHalf}
                    onChange={setEndHalf}
                    options={[
                      { value: 'full',    label: 'Evening (full)' },
                      { value: 'morning', label: 'Midday only'    },
                    ]}
                  />
                </div>
              )
            )}

            {workDays > 0 && (
              <div style={{
                background: TO.blueBg, border: `1px solid ${TO.blueBorder}`,
                borderRadius: 10, padding: '10px 14px',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                color: TO.blueText,
              }}>
                {fmtDays(workDays)} selected
              </div>
            )}
          </div>

          <div style={{ padding: '16px', flexShrink: 0 }}>
            <TOPrimaryButton
              onClick={() => setStep(2)}
              disabled={!startDate}
            >Continue</TOPrimaryButton>
          </div>
        </div>
      )}

      {/* ── Step 2: details / reason ── */}
      {step === 2 && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {needsReason && (
              <>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: TO.inkSoft, margin: 0 }}>
                  Select the occasion for your short leave
                </p>
                {KLEIN_VERLET_REASONS.map(r => (
                  <button key={r.id} onClick={() => setReason(r.id)}
                    style={{
                      appearance: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
                      background: reason === r.id ? TO.bg : 'white',
                      border: `1.5px solid ${reason === r.id ? TO.ink : TO.border}`,
                      borderRadius: 12, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                        color: TO.ink, lineHeight: '20px',
                      }}>{r.label}</div>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 12,
                        color: TO.inkSoft, marginTop: 2,
                      }}>{r.days} day{r.days !== 1 ? 's' : ''} entitlement</div>
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: 99, border: `2px solid ${reason === r.id ? TO.ink : TO.border}`,
                      background: reason === r.id ? TO.ink : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
                    }}>
                      {reason === r.id && <div style={{ width: 8, height: 8, borderRadius: 99, background: '#fff' }} />}
                    </div>
                  </button>
                ))}
              </>
            )}

            {!needsReason && (
              <>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: TO.inkSoft, margin: 0 }}>
                  Add a note for your manager (optional)
                </p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="E.g. family event, personal reasons…"
                  rows={4}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    fontFamily: 'var(--font-display)', fontSize: 14, color: TO.ink,
                    border: `1.5px solid ${TO.border}`, borderRadius: 12,
                    padding: '12px 14px', resize: 'none',
                    outline: 'none', background: 'white',
                  }}
                />

                {typeObj.id === 'sick' && (
                  <div style={{
                    background: TO.warnBg, border: `1px solid ${TO.warnBorder}`,
                    borderRadius: 10, padding: '12px 14px',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                  }}>
                    <LucideIcon name="Info" size={16} color={TO.warnText} style={{ marginTop: 2, flex: 'none' }} />
                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13,
                      color: TO.warnText, lineHeight: '18px',
                    }}>
                      No doctor's certificate needed for up to 2 days/year. You have {typeObj.balance} remaining this year.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ padding: '16px', flexShrink: 0 }}>
            <TOPrimaryButton
              onClick={() => setStep(3)}
              disabled={needsReason && !reason}
            >Continue</TOPrimaryButton>
          </div>
        </div>
      )}

      {/* ── Step 3: review ── */}
      {step === 3 && (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: TO.inkSoft, margin: 0 }}>
              Review your request before submitting
            </p>

            {/* Summary card */}
            <div style={{
              background: TO.bg, borderRadius: 14, padding: '16px',
              display: 'flex', flexDirection: 'column', gap: 0,
            }}>
              {[
                ['Leave type', typeObj.label],
                ['Date', isMultiDay && endDate && endDate.getTime() !== startDate.getTime()
                  ? `${fmtDate(startDate)} – ${fmtDate(endDate)}`
                  : fmtDate(startDate)],
                ['Duration', fmtDays(workDays)],
                ...(needsReason && reason ? [['Occasion', KLEIN_VERLET_REASONS.find(r => r.id === reason)?.label || '']] : []),
                ...(note ? [['Note', note]] : []),
              ].map(([label, value], i, arr) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < arr.length - 1 ? `1px solid ${TO.divider}` : 'none',
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: TO.inkSoft }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: TO.ink, textAlign: 'right', flex: 1, maxWidth: '60%' }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{
              background: TO.blueBg, border: `1px solid ${TO.blueBorder}`,
              borderRadius: 10, padding: '12px 14px',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <LucideIcon name="Info" size={16} color={TO.blueText} style={{ marginTop: 2, flex: 'none' }} />
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13,
                color: TO.blueText, lineHeight: '18px',
              }}>
                Your manager will be notified and needs to approve this request. You'll get a notification once it's reviewed.
              </div>
            </div>
          </div>

          <div style={{ padding: '16px', flexShrink: 0 }}>
            <TOPrimaryButton onClick={handleSubmit}>Submit request</TOPrimaryButton>
          </div>
        </div>
      )}

      {/* ── Step 4: success ── */}
      {step === 4 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '32px 24px', gap: 20, textAlign: 'center',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 99,
            background: TO.greenBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LucideIcon name="Check" size={36} color={TO.greenText} strokeWidth={2.5} />
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24,
            letterSpacing: '-0.005em', color: TO.ink, lineHeight: '32px',
          }}>Request submitted</div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15,
            color: TO.inkSoft, lineHeight: '22px',
          }}>
            Your {typeObj?.label.toLowerCase()} request has been sent to your manager for approval.
          </div>

          <div style={{ width: '100%', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <TOPrimaryButton onClick={() => { reset('timeoff'); }}>
              Back to Time off
            </TOPrimaryButton>
            <button onClick={() => { reset('timeoff'); switchTab('home'); }}
              style={{
                appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
                color: TO.inkSoft, padding: '10px',
              }}>Back to Home</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────
window.TimeOffScreen = TimeOffScreen;
window.registerScreen && window.registerScreen('timeoff', TimeOffScreen);
window.registerScreen && window.registerScreen('request-time-off', RequestTimeOffScreen);

// Home card helper
window.TimeOffHomeCard = function TimeOffHomeCard({ onPress }) {
  const remaining = LEAVE_TYPES.filter(t => t.balance !== null)
    .reduce((sum, t) => sum + t.balance, 0);
  return (
    <button onClick={onPress} style={{
      width: '100%', appearance: 'none', cursor: 'pointer', textAlign: 'left',
      background: 'white', border: '1px solid rgb(217,218,221)',
      borderRadius: 16, padding: '16px',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'rgb(245,226,254)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
      }}>
        <LucideIcon name="CalendarDays" size={22} color="rgb(139,55,235)" strokeWidth={1.75} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
          letterSpacing: '-0.003em', color: 'rgb(15,13,40)', lineHeight: '22px',
        }}>Time off</div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13,
          color: 'rgb(80,84,94)', lineHeight: '18px',
        }}>{remaining} days remaining · request leave</div>
      </div>
      <LucideIcon name="ChevronRight" size={20} color="rgb(80,84,94)" strokeWidth={2} />
    </button>
  );
};
