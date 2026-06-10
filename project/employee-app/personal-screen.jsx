// Personal tab — hub screen for employee-centric features.
// Design reference: Figma node 1872-16071

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
      // Upcoming
      { id: 'u1', label: 'Legal holiday', date: 'Aug 3–7',      month: 'August',    days: 5, status: 'approved' },
      { id: 'u4', label: 'ADV day',       date: 'Aug 21',       month: 'August',    days: 1, status: 'approved' },
      // Admin-recorded
      { id: 'pl1', label: 'Parental leave', date: 'Oct 1–Dec 31', month: 'October', days: 65, status: 'approved', _adminRecorded: true },
      // Pending
      { id: 'u2', label: 'ADV day',       date: 'Sep 11',       month: 'September', days: 1, status: 'pending'  },
      { id: 'u5', label: 'Short leave',   date: 'Sep 18',       month: 'September', days: 1, status: 'pending'  },
      // Denied
      { id: 'u3', label: 'Short leave',   date: 'Dec 1',        month: 'December',  days: 1, status: 'denied', _denialReason: 'Team at full capacity on this day.' },
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
  'Legal holiday':    { icon: 'Palmtree',   bg: '#eef4fb', color: '#2563eb' },
  'ADV day':          { icon: 'Coffee',     bg: '#faf6eb', color: '#d97706' },
  'Extra-legal leave':{ icon: 'Sparkles',   bg: '#f3f1fa', color: '#7c3aed' },
  'Short leave':      { icon: 'Shield',     bg: '#f3f4f6', color: '#6b7280' },
  'Sick leave':       { icon: 'Heart',      bg: '#faf0f5', color: '#db2777' },
  'Sick leave (with medical certificate)': { icon: 'Heart', bg: '#faf0f5', color: '#db2777' },
  'Parental leave':   { icon: 'Baby',       bg: '#f9f1f7', color: '#a21caf' },
};
const _getLeaveChip = (label) => LEAVE_TYPE_CHIP[label] || { icon: 'Calendar', bg: '#f3f4f6', color: P.inkSoft };

// ─────────────────────────────────────────────────────────────
// Time Off Hub — balance card + sticky CTA
// ─────────────────────────────────────────────────────────────
function TimeOffHubScreen() {
  const nav = window.useNav ? window.useNav() : null;
  const [, setTick] = React.useState(0);
  const [toast, setToast] = React.useState(null);
  const [showBalanceInfo, setShowBalanceInfo] = React.useState(false);
  const [expandedRows, setExpandedRows] = React.useState({});
  const toggleRow = React.useCallback((key) => {
    setExpandedRows(prev => ({ ...prev, [key]: !prev[key] }));
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'white' }}>

      {/* Back nav */}
      <NavBar />

      {/* Date as title */}
      <div style={{ padding: '0 16px 16px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28,
          letterSpacing: '-0.007em', color: P.ink, lineHeight: '36px',
          margin: 0,
        }}>{dateStr}</h1>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Balance section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
            letterSpacing: '-0.003em', color: P.ink, margin: 0,
          }}>Leave balance</h2>
          {past.length > 0 && (
            <button
              aria-label="View leave history"
              onClick={() => nav && nav.push('time-off-history')}
              style={{
                appearance: 'none', border: 'none', background: 'transparent',
                cursor: 'pointer', padding: 0,
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                color: P.ink, textDecoration: 'underline', textUnderlineOffset: 2,
              }}>Leave history</button>
          )}
        </div>

        {/* Balance card */}
        <div style={{
          background: '#f7f7f8', borderRadius: 16, padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: 16,
          position: 'relative',
        }}>
          {/* Info icon — top right */}
          <button
            aria-label="About leave balance"
            onClick={() => setShowBalanceInfo(true)}
            style={{
              position: 'absolute', top: 16, right: 16,
              appearance: 'none', border: 'none', background: 'transparent',
              cursor: 'pointer', padding: 4,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <LucideIcon name="Info" size={16} color={P.inkSoft} strokeWidth={1.75} />
          </button>

          {/* Available — hero number at top */}
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13,
              color: P.inkSoft, letterSpacing: '0.01em', marginBottom: 0,
            }}>Available</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 52,
              letterSpacing: '-0.05em', color: P.ink, lineHeight: '54px',
            }}>{available}<span style={{
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18,
              letterSpacing: '-0.01em', color: P.inkSoft, marginLeft: 8,
            }}>days</span></div>
          </div>

          {/* Per-type breakdown */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {LEAVE_BALANCES.filter(b => b.remaining > 0).map(b => (
              <div key={b.type} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 8,
                background: b.urgent ? 'rgba(185,28,28,0.08)' : 'rgba(15,13,40,0.06)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                  color: b.urgent ? 'rgb(185,28,28)' : P.ink,
                }}>{b.remaining}</span>
                <span style={{
                  fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12,
                  color: b.urgent ? 'rgb(185,28,28)' : P.inkSoft,
                }}>{b.type === 'Illness carry-over (2024)' ? 'carry-over' : b.type === 'Statutory annual leave' ? 'statutory' : b.type === 'ADV / RTT' ? 'ADV' : 'extra-legal'}</span>
              </div>
            ))}
          </div>

        </div>
        </div>{/* end Leave balance section */}

        {/* Sections: pending requests + upcoming approved */}
        {(() => {
          const ALL = window.__timeOffItems || [];

          const STATUS = {
            approved: { label: 'Approved by Sophie L.',  color: 'rgb(22,163,74)',  iconBg: 'rgb(236,247,239)', icon: 'Palmtree' },
            pending:  { label: 'Pending — Sophie L.',    color: 'rgb(161,98,7)',   iconBg: 'rgb(250,246,235)', icon: 'Clock'    },
            denied:   { label: 'Denied by Sophie L.',    color: 'rgb(185,28,28)',  iconBg: 'rgb(251,241,241)', icon: 'CircleX'  },
          };

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

          const ItemCard = ({ items, hideStatus, showDenialReason }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {toGroups(items).map(({ month, items: groupItems }) => (
                <div key={month} style={{
                  background: 'white', borderRadius: 16,
                  border: `1px solid ${P.border}`, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '12px 16px 10px',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                    color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{month}</div>
                  {groupItems.map((item) => {
                    const _stBase = STATUS[item.status] || STATUS.approved;
                    const _chip = _getLeaveChip(item.label);
                    const st = item._adminRecorded
                      ? { ..._stBase, label: 'Recorded by Sophie L.', icon: _chip.icon, iconBg: _chip.bg, color: _chip.color }
                      : _stBase;
                    return (
                      <div key={item.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`${item.label}, ${item.days === 1 ? '1 day' : item.days + ' days'}, ${item.date}, ${st.label}`}
                        onClick={() => nav && nav.push('time-off-detail', { item })}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nav && nav.push('time-off-detail', { item }); } }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 16px',
                          borderTop: `1px solid ${P.border}`,
                          cursor: 'pointer',
                        }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                          background: st.iconBg,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <LucideIcon name={st.icon} size={20} color={st.color} strokeWidth={1.75} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                            color: P.ink, lineHeight: '20px',
                          }}>{item.date} · {item.days === 1 ? '1 day' : `${item.days} days`}</div>
                          {!hideStatus && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12,
                            color: st.color,
                          }}>
                            <span aria-hidden="true" style={{ fontSize: 10 }}>●</span>
                            {st.label}
                          </div>
                          )}
                          {showDenialReason && item._denialReason && (
                          <div style={{
                            fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12,
                            color: P.inkSoft, marginTop: 2,
                          }}>
                            {item._denialReason}
                          </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{
                            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13,
                            color: P.inkSoft, lineHeight: '20px',
                          }}>{item.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );

          const hasAny = pending.length > 0 || denied.length > 0 || upcoming.length > 0 || past.length > 0;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
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
              {pending.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SectionTitle label="Pending requests" />
                  <ItemCard items={pending} hideStatus />
                </div>
              )}
              {denied.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SectionTitle label="Denied" />
                  <ItemCard items={denied} showDenialReason />
                </div>
              )}
              {upcoming.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SectionTitle label="Upcoming time off" action="View all" actionAriaLabel="View all upcoming time off" />
                  <ItemCard items={upcoming} />
                </div>
              )}
            </div>
          );
        })()}

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

        // Days you actively book — these make up your balance
        const LEAVE_TYPES = [
          {
            name: 'Statutory annual leave',
            remaining: _isFreshUser ? 20 : 2, total: 20,
            rule: 'Expires Dec 31, 2026. Carry-over only if blocked by certified long-term illness.',
          },
          {
            name: 'ADV / RTT',
            remaining: _isFreshUser ? 12 : 5, total: 12,
            rule: 'Expires Dec 31, 2026. No carry-over, no cash payout permitted.',
          },
          {
            name: 'Extra-legal leave',
            remaining: _isFreshUser ? 4 : 3, total: 4,
            rule: 'Up to 2 days carry until Mar 31, 2027. Remaining balance expires Dec 31.',
          },
          {
            name: 'Illness carry-over (2024)',
            remaining: 4, total: 4,
            rule: 'Legal carry-over due to 2024 medical incapacity. Must be used before Dec 31, 2026.',
            urgent: true,
          },
        ];
        // Time off that doesn't touch the balance above

        return ReactDOM.createPortal(
          <div
            style={{ position: 'absolute', inset: 0, zIndex: 400, background: 'rgba(15,13,40,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
            onKeyDown={(e) => { if (e.key === 'Escape') { setShowBalanceInfo(false); setExpandedRows({}); } }}
          >
            <div
              role="dialog" aria-modal="true" aria-labelledby="balance-info-title"
              style={{ background: 'white', borderRadius: '20px 20px 0 0', display: 'flex', flexDirection: 'column', maxHeight: '88%' }}
            >
              {/* Sticky header */}
              <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
                <div aria-hidden="true" style={{ width: 36, height: 4, borderRadius: 2, background: P.border, margin: '0 auto 20px' }} />
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div id="balance-info-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: P.ink }}>
                    Leave breakdown
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: P.ink }}>
                    {available} <span style={{ fontWeight: 500, fontSize: 13, color: P.inkSoft }}>days left</span>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, lineHeight: '19px', marginBottom: 16 }}>
                  Your leave entitlements as of Jan 1, 2026 — each type has its own expiry and carry-over rules.
                </div>
              </div>

              {/* Scrollable body */}
              <div style={{ overflowY: 'auto', flex: 1, padding: '8px 24px 8px' }}>

                {LEAVE_TYPES.map((lt) => {
                  const isOpen = !!expandedRows[lt.name];
                  return (
                    <div key={lt.name} style={{ borderTop: `1px solid ${P.border}` }}>
                      <button
                        onClick={() => toggleRow(lt.name)}
                        aria-expanded={isOpen}
                        style={{
                          width: '100%', appearance: 'none', border: 'none', background: 'transparent',
                          cursor: 'pointer', padding: '12px 0',
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                        <div style={{ flex: 1, textAlign: 'left', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: lt.urgent ? 'rgb(185,28,28)' : P.ink }}>
                          {lt.name}
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', color: lt.urgent ? 'rgb(185,28,28)' : P.ink, flexShrink: 0 }}>
                          {lt.remaining}<span style={{ fontWeight: 400, fontSize: 12, color: P.inkSoft }}>/{lt.total}</span>
                        </span>
                        <LucideIcon
                          name="ChevronDown" size={16} color={P.inkSoft} strokeWidth={2}
                          style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}
                        />
                      </button>
                      {isOpen && (
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: lt.urgent ? 'rgb(220,38,38)' : P.inkSoft, lineHeight: '18px', padding: '0 0 12px', paddingRight: 24 }}>
                          {lt.rule}
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>

              {/* Sticky footer */}
              <div style={{ padding: '16px 24px 40px', borderTop: `1px solid ${P.border}`, flexShrink: 0 }}>
                <Button variant="outline" size="large" fullWidth autoFocus onClick={() => { setShowBalanceInfo(false); setExpandedRows({}); }}>
                  Got it
                </Button>
              </div>
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
  const ALL = window.__timeOffItems || [];

  const STATUS = {
    approved: { label: 'Approved', color: 'rgb(22,163,74)', iconBg: 'rgb(220,252,231)', icon: 'Palmtree' },
  };

  // Determine past items
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
  const past = ALL.filter(i => i.status === 'approved').filter(i => {
    const d = _itemEndDate(i); return !d || d < _today;
  });
  const totalDays = past.reduce((s, i) => s + i.days, 0);

  // Group by month (reverse chronological — most recent first)
  const toGroups = (items) => {
    const map = new Map();
    items.forEach(item => {
      if (!map.has(item.month)) map.set(item.month, []);
      map.get(item.month).push(item);
    });
    const _monthOrder = { January:0, February:1, March:2, April:3, May:4, June:5, July:6, August:7, September:8, October:9, November:10, December:11 };
    return Array.from(map.entries())
      .map(([month, items]) => ({ month, items }))
      .sort((a, b) => (_monthOrder[b.month] || 0) - (_monthOrder[a.month] || 0));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: P.pageBg }}>
      {/* NavBar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 16px', background: 'white',
        borderBottom: `1px solid ${P.border}`,
        flexShrink: 0,
      }}>
        <button
          onClick={() => nav && nav.pop()}
          aria-label="Back"
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
          <LucideIcon name="ArrowLeft" size={22} color={P.ink} strokeWidth={1.75} />
        </button>
        <span style={{
          flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 17, color: P.ink,
        }}>History</span>
        <span style={{
          fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13, color: P.inkSoft,
        }}>{totalDays} {totalDays === 1 ? 'day' : 'days'}</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {past.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '48px 16px', textAlign: 'center', gap: 12,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LucideIcon name="History" size={28} color="#9ca3af" strokeWidth={1.5} />
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: P.ink }}>
              No history yet
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, lineHeight: '20px', maxWidth: 260 }}>
              Your past time off will appear here once those dates have passed.
            </div>
          </div>
        ) : (
          toGroups(past).map(({ month, items }) => (
            <div key={month} style={{
              background: 'white', borderRadius: 16,
              border: `1px solid ${P.border}`, overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 16px 10px',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>{month}</div>
              {items.map((item) => {
                const _stBase = STATUS[item.status] || STATUS.approved;
                const st = item._adminRecorded
                  ? { ..._stBase, label: 'Recorded by Sophie L.' }
                  : _stBase;
                return (
                  <div key={item.id}
                    role="button" tabIndex={0}
                    aria-label={`${item.label}, ${item.days === 1 ? '1 day' : item.days + ' days'}, ${item.date}`}
                    onClick={() => nav && nav.push('time-off-detail', { item })}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nav && nav.push('time-off-detail', { item }); } }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      borderTop: `1px solid ${P.border}`,
                      cursor: 'pointer',
                    }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: st.iconBg,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <LucideIcon name={st.icon} size={20} color={st.color} strokeWidth={1.75} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                        color: P.ink, lineHeight: '20px',
                      }}>{item.label}</div>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12,
                        color: st.color,
                      }}>
                        <span aria-hidden="true" style={{ fontSize: 10 }}>●</span>
                        {st.label}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                        color: P.ink, lineHeight: '20px',
                      }}>{item.date}</div>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 12,
                        color: P.inkSoft,
                      }}>{item.days === 1 ? '1 day' : `${item.days} days`}</div>
                    </div>
                  </div>
                );
              })}
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

function _toISO(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function _isWeekend(d) { const wd = d.getDay(); return wd === 0 || wd === 6; }
function _isHoliday(d) { return _hset.has(_toISO(d)); }

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
    else if (_isNonWorkingDay(cur)) { nonWorkingDays++; }
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
function MiniCalendar({ month, year, onMonthChange, startDate, endDate, onDateTap, onDisabledTap, existingDates, halfDay }) {
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
  const isDisabled = (d) => !d || _isWeekend(d) || _isHoliday(d) || _isNonWorkingDay(d);
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
      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 4 }}>
        <button onClick={prevMonth} aria-label="Previous month" style={{
          width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 8,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LucideIcon name="ChevronLeft" size={20} color={P.ink} strokeWidth={2} />
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: P.ink }}>
          {_monthLabel(month, year)}
        </span>
        <button onClick={nextMonth} aria-label="Next month" style={{
          width: 32, height: 32, border: 'none', background: 'transparent', borderRadius: 8,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LucideIcon name="ChevronRight" size={20} color={P.ink} strokeWidth={2} />
        </button>
        <span style={{ flex: 1 }} />
        <button onClick={() => onMonthChange(today.getMonth(), today.getFullYear())} style={{
          border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 2px',
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: P.ink,
        }}>Today</button>
      </div>

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
          const nonWorking = _isNonWorkingDay(d);
          const hasRange = startDate && endDate && !_sameDay(startDate, endDate);
          const rangeBg = '#FAF0FF';

          const halfDayVal = sel && halfDay ? halfDay[_toISO(d)] : null;

          let btnBg = 'transparent';
          let color = P.ink;
          let fontWeight = 500;

          if (sel && halfDayVal === 'am') {
            btnBg = `linear-gradient(to bottom, ${P.ink} 50%, rgba(15,13,40,0.45) 50%)`;
            color = '#fff'; fontWeight = 700;
          } else if (sel && halfDayVal === 'pm') {
            btnBg = `linear-gradient(to bottom, rgba(15,13,40,0.45) 50%, ${P.ink} 50%)`;
            color = '#fff'; fontWeight = 700;
          } else if (sel) { btnBg = P.ink; color = '#fff'; fontWeight = 700; }
          else if (disabled) { color = '#b0b4bc'; }
          else if (inRange) { fontWeight = 600; }

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
            <div key={_toISO(d)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: wrapBg }}>
              <button
                aria-disabled={disabled || undefined}
                onClick={() => disabled ? (onDisabledTap && onDisabledTap(d)) : onDateTap(d)}
                style={{
                  width: 42, height: 42,
                  border: 'none', background: btnBg,
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
                {hasExisting(d) && !sel && !inRange && (
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
    if (!_isWeekend(cur) && !_isHoliday(cur) && !_isNonWorkingDay(cur)) result.push(new Date(cur));
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
  { id: 'statutory',    label: 'Statutory annual leave' },
  { id: 'adv',          label: 'ADV / RTT days' },
  { id: 'extra-legal',  label: 'Extra-legal leave' },
  { id: 'sick-self',    label: 'Sick leave (self-certified, max 1 day)' },
  { id: 'sick-cert',    label: 'Sick leave (with medical certificate)' },
  { id: 'special',      label: 'Special leave (events/milestones)', hasSubMenu: true },
];
const SPECIAL_LEAVE_OPTIONS = [
  { id: 'special-wedding',  label: 'Wedding (yours or close family)' },
  { id: 'special-moving',   label: 'Moving / change of residence' },
  { id: 'special-funeral',  label: 'Funeral / bereavement' },
  { id: 'special-communion', label: 'Communion or similar ceremony' },
  { id: 'special-civic',    label: 'Civic duties (jury, election, etc.)' },
];

// ── Main Request Screen ──
function RequestTimeOffScreen({ editItem, prefillReason, replaceDeniedItem }) {
  const nav = window.useNav ? window.useNav() : null;

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
      'Legal holiday': 'statutory', 'Statutory annual leave': 'statutory',
      'ADV day': 'adv', 'ADV / RTT days': 'adv',
      'Extra-legal leave': 'extra-legal',
      'Short leave': 'special-civic',
      'Sick leave': 'sick-cert', 'Sick leave (with medical certificate)': 'sick-cert',
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
  const [showReasonSheet, setShowReasonSheet] = React.useState(false);
  const [showSpecialSheet, setShowSpecialSheet] = React.useState(false);
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [focusedField, setFocusedField] = React.useState(editItem ? 'end' : 'start');
  const [attachments, setAttachments] = React.useState(editItem?._attachments || []);
  const [showHoursSheet, setShowHoursSheet] = React.useState(false);
  const [showHalfDayTip, setShowHalfDayTip] = React.useState(!editItem);
  const [errorToast, setErrorToast] = React.useState(null);
  const [calToast, setCalToast] = React.useState(null);

  const handleDisabledTap = (d) => {
    if (!d) return;
    const msg = _isNonWorkingDay(d) ? 'This is your day off (4/5 schedule)'
      : _isHoliday(d) ? 'Public holiday'
      : _isWeekend(d) ? 'Weekend' : null;
    if (msg) { setCalToast(msg); setTimeout(() => setCalToast(null), 2000); }
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

  // Balance check for selected leave type
  const _reasonBalanceMap = {
    'statutory': LEAVE_BALANCES.find(b => b.type === 'Statutory annual leave'),
    'adv': LEAVE_BALANCES.find(b => b.type === 'ADV / RTT'),
    'extra-legal': LEAVE_BALANCES.find(b => b.type === 'Extra-legal leave'),
  };
  const selectedBalance = _reasonBalanceMap[leaveReason] || null;
  const overBalance = selectedBalance && totalDays > selectedBalance.remaining
    ? totalDays - selectedBalance.remaining
    : 0;

  // Check overlap with existing approved/pending non-sick leave
  const sickOverlap = React.useMemo(() => {
    const isSick = leaveReason === 'sick-self' || leaveReason === 'sick-cert';
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
      if (item._leaveReason === 'sick-self' || item._leaveReason === 'sick-cert') continue;
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

  const requiresAttachment = leaveReason === 'sick-cert';

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
        label: (LEAVE_REASONS.find(r => r.id === leaveReason) || SPECIAL_LEAVE_OPTIONS.find(r => r.id === leaveReason) || {}).label || primaryLabel,
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
    const dateLabel = _sameDay(startDate, endDate) ? _fmtShort(startDate) : `${_fmtShort(startDate)} – ${_fmtShort(endDate)}`;

    // Per-leave-type personality
    const successConfig = (() => {
      if (editItem) {
        const wasApproved = editItem.status === 'approved';
        return {
          icon: wasApproved ? 'Clock' : 'Check',
          iconBg: wasApproved ? 'rgb(250,246,235)' : PFC.successBg,
          iconColor: wasApproved ? 'rgb(161,98,7)' : PFC.successText,
          heading: wasApproved ? 'Re-submitted for approval' : 'Request updated!',
          message: wasApproved ? 'Your approved leave was changed — Sophie L. will review the update.' : 'Your changes have been saved.',
        };
      }
      switch (leaveReason) {
        case 'sick-self':
          return { icon: 'Heart', iconBg: '#fce7f3', iconColor: '#db2777', heading: 'Take care of yourself', message: 'Rest up — we hope you feel better soon.' };
        case 'sick-cert':
          return { icon: 'Heart', iconBg: '#fce7f3', iconColor: '#db2777', heading: 'Wishing you a speedy recovery', message: 'Focus on getting better. We\'ve got things covered.' };
        case 'statutory':
          return { icon: 'Palmtree', iconBg: '#dbeafe', iconColor: '#2563eb', heading: 'Holiday time!', message: 'You\'ve earned it — enjoy every moment.' };
        case 'adv':
          return { icon: 'Coffee', iconBg: '#fef3c7', iconColor: '#d97706', heading: 'Enjoy your day off', message: 'A little break goes a long way. Recharge!' };
        case 'extra-legal':
          return { icon: 'Sparkles', iconBg: '#ede9fe', iconColor: '#7c3aed', heading: 'Extra time, well spent', message: 'Make the most of it — you deserve it.' };
        case 'special-wedding':
          return { icon: 'PartyPopper', iconBg: '#fef3c7', iconColor: '#d97706', heading: 'Congratulations!', message: 'What a special day — wishing you all the happiness.' };
        case 'special-moving':
          return { icon: 'Home', iconBg: '#dbeafe', iconColor: '#2563eb', heading: 'New chapter ahead', message: 'Good luck with the move — exciting times!' };
        case 'special-funeral':
          return { icon: 'Heart', iconBg: '#f3f4f6', iconColor: '#6b7280', heading: 'Our thoughts are with you', message: 'Take all the time you need. We\'re here for you.' };
        case 'special-communion':
          return { icon: 'Star', iconBg: '#fef3c7', iconColor: '#d97706', heading: 'Enjoy the celebration', message: 'What a lovely milestone — have a wonderful day.' };
        case 'special-civic':
          return { icon: 'Shield', iconBg: '#dbeafe', iconColor: '#2563eb', heading: 'Civic duty calls', message: 'Thanks for doing your part. See you when you\'re back!' };
        default:
          return { icon: 'Check', iconBg: PFC.successBg, iconColor: PFC.successText, heading: 'Request submitted!', message: 'Pending approval by Sophie L.' };
      }
    })();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: 32, background: 'white', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: successConfig.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, animation: 'popIn 0.5s ease-out' }}>
          <LucideIcon name={successConfig.icon} size={36} color={successConfig.iconColor} strokeWidth={2} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: P.ink, marginBottom: 8, animation: 'fadeSlideIn 0.5s ease-out 0.15s both' }}>
          {successConfig.heading}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkSoft, lineHeight: '20px', marginBottom: 16, maxWidth: 280, animation: 'fadeSlideIn 0.5s ease-out 0.25s both' }}>
          {successConfig.message}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: P.ink, marginBottom: 8, animation: 'fadeSlideIn 0.5s ease-out 0.35s both' }}>
          {dateLabel} · {totalDays === 1 ? '1 day' : `${totalDays} days`}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgb(254,243,199)', borderRadius: 20, padding: '4px 8px', marginBottom: 32, animation: 'fadeSlideIn 0.5s ease-out 0.4s both' }}>
          <LucideIcon name="Clock" size={12} color="rgb(161,98,7)" strokeWidth={2.5} />
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, color: 'rgb(161,98,7)' }}>Pending — Sophie L.</span>
        </div>
        <div style={{ width: '100%', maxWidth: 320, animation: 'fadeSlideIn 0.5s ease-out 0.5s both' }}>
          <Button variant="primary" size="large" fullWidth onClick={handleDone}>
            Back to time off
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 1: Pick dates + reason ──
  if (step === 0) {
    const hasDates = startDate && endDate && totalDays > 0;
    const canSubmit = hasDates && leaveReason && !submitting;
    const selectedReason = LEAVE_REASONS.find(r => r.id === leaveReason) || SPECIAL_LEAVE_OPTIONS.find(r => r.id === leaveReason);
    const appShell = document.querySelector('[data-app-shell]');

    // Short date display: "Mon 15 Jun"
    const fmtDateBtn = (d) => d ? d.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' }) : null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'white' }}>
        {/* Header with X close + centered title */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 8px', gap: 8 }}>
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
          <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: P.ink }}>
            {editItem ? 'Edit request' : 'Request time off'}
          </div>
          <div style={{ width: 36 }} />{/* spacer for centering */}
        </div>

        <style>{`
          @keyframes revealDown {
            from { opacity: 0; transform: translateY(-12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 120px' }}>

          {/* Leave reason selector */}
          <div style={{ marginBottom: 24 }}>
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
                fontFamily: 'var(--font-display)', fontWeight: selectedReason ? 600 : 400,
                fontSize: 15, color: selectedReason ? P.ink : P.inkSoft,
              }}>
                {selectedReason ? selectedReason.label : 'Select leave type…'}
              </span>
              <LucideIcon name="ChevronDown" size={18} color={P.inkSoft} strokeWidth={2} />
            </button>
            {selectedReason && leaveReason?.startsWith('special-') && (
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, marginTop: 8 }}>
                Special leave: {selectedReason.label.toLowerCase()}
              </div>
            )}
          </div>

          {/* Progressive disclosure: rest of form appears after leave type is selected (skip when editing) */}
          {(editItem || leaveReason) && (
          <div key="rest-of-form" style={editItem ? {} : { animation: 'revealDown 0.35s ease-out both' }}>

          {/* Start / End date buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
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

          {/* Inline calendar */}
          <div style={{ marginBottom: 16, position: 'relative' }}>
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
            {calToast && (
              <div style={{
                position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
                background: P.ink, color: '#fff', padding: '6px 14px', borderRadius: 8,
                fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 12,
                whiteSpace: 'nowrap', animation: 'fadeSlideIn 0.2s ease-out',
                zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
            <div style={{ position: 'relative', marginBottom: 16 }}>
              {/* Discovery tooltip — outside overflow:hidden card so it's not clipped */}
              {showHalfDayTip && !halfDay && (
                <div
                  onClick={() => { setShowHoursSheet(true); setShowHalfDayTip(false); }}
                  style={{
                    position: 'absolute', top: -44, right: 12,
                    background: P.ink, color: 'white', borderRadius: 10,
                    padding: '8px 12px',
                    fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
                    lineHeight: '16px',
                    cursor: 'pointer',
                    animation: 'fadeSlideIn 0.4s ease-out 0.6s both',
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
                {/* Over-balance warning banner — always at card bottom */}
                {overBalance > 0 && selectedBalance && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#FFF3E5' }}>
                    <LucideIcon name="AlertTriangle" size={14} color="#92400e" strokeWidth={2} style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500, color: '#92400e', lineHeight: '16px' }}>
                      Exceeds balance by {overBalance === 0.5 ? '½' : overBalance} day{overBalance > 1 ? 's' : ''} — {selectedBalance.remaining} remaining
                    </span>
                  </div>
                )}
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
                ? <span style={{ color: PFC.errorText }}>*</span>
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

        {/* Leave reason bottom sheet */}
        {showReasonSheet && appShell && ReactDOM.createPortal(
          <div
            onClick={() => setShowReasonSheet(false)}
            style={{ position: 'absolute', inset: 0, zIndex: 400, background: 'rgba(15,13,40,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'sheetFadeIn 0.2s ease-out' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'white', borderRadius: '20px 20px 0 0', animation: 'sheetSlideUp 0.25s ease-out' }}
            >
              <div style={{ padding: '24px 24px 16px' }}>
                <div aria-hidden="true" style={{ width: 36, height: 4, borderRadius: 2, background: P.border, margin: '0 auto 16px' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: P.ink }}>
                  Select leave type
                </div>
              </div>
              <div style={{ padding: '0 8px 40px' }}>
                {(() => {
                  const balanceMap = {
                    'statutory': LEAVE_BALANCES.find(b => b.type === 'Statutory annual leave'),
                    'adv': LEAVE_BALANCES.find(b => b.type === 'ADV / RTT'),
                    'extra-legal': LEAVE_BALANCES.find(b => b.type === 'Extra-legal leave'),
                  };
                  return LEAVE_REASONS.map((r, i) => {
                  const isSelected = leaveReason === r.id || (r.hasSubMenu && leaveReason?.startsWith('special-'));
                  const bal = balanceMap[r.id];
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        if (r.hasSubMenu) { setShowReasonSheet(false); setTimeout(() => setShowSpecialSheet(true), 200); }
                        else { setLeaveReason(r.id); setShowReasonSheet(false); }
                      }}
                      style={{
                        width: '100%', appearance: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '16px 16px',
                        borderRadius: 12,
                        background: isSelected ? 'rgba(15,13,40,0.05)' : 'transparent',
                        textAlign: 'left',
                        marginTop: i > 0 ? 2 : 0,
                      }}
                    >
                      {/* Radio circle */}
                      {!r.hasSubMenu && (
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          border: isSelected ? 'none' : `2px solid ${P.border}`,
                          background: isSelected ? P.ink : 'transparent',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isSelected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                        </span>
                      )}
                      {r.hasSubMenu && (
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          border: isSelected ? 'none' : `2px solid ${P.border}`,
                          background: isSelected ? P.ink : 'transparent',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isSelected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                        </span>
                      )}
                      <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: isSelected ? 600 : 500, fontSize: 15, color: P.ink }}>{r.label}</span>
                      {bal && (
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, flexShrink: 0 }}>
                          {bal.remaining}/{bal.total}
                        </span>
                      )}
                      {r.hasSubMenu && <LucideIcon name="ChevronRight" size={16} color={P.inkSoft} strokeWidth={2} />}
                    </button>
                  );
                }); })()}
              </div>
            </div>
          </div>,
          appShell
        )}

        {/* Special leave sub-menu bottom sheet */}
        {showSpecialSheet && appShell && ReactDOM.createPortal(
          <div
            onClick={() => setShowSpecialSheet(false)}
            style={{ position: 'absolute', inset: 0, zIndex: 400, background: 'rgba(15,13,40,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', animation: 'sheetFadeIn 0.2s ease-out' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'white', borderRadius: '20px 20px 0 0', animation: 'sheetSlideUp 0.25s ease-out' }}
            >
              <div style={{ padding: '24px 24px 16px' }}>
                <div aria-hidden="true" style={{ width: 36, height: 4, borderRadius: 2, background: P.border, margin: '0 auto 16px' }} />
                <button
                  onClick={() => { setShowSpecialSheet(false); setTimeout(() => setShowReasonSheet(true), 200); }}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0, marginBottom: 8 }}
                >
                  <LucideIcon name="ChevronLeft" size={16} color={P.inkSoft} strokeWidth={2} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft }}>Back</span>
                </button>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: P.ink }}>
                  Special leave
                </div>
              </div>
              <div style={{ padding: '0 8px 40px' }}>
                {SPECIAL_LEAVE_OPTIONS.map((r, i) => {
                  const isSelected = leaveReason === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => { setLeaveReason(r.id); setShowSpecialSheet(false); }}
                      style={{
                        width: '100%', appearance: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '16px 16px',
                        borderRadius: 12,
                        background: isSelected ? 'rgba(15,13,40,0.05)' : 'transparent',
                        textAlign: 'left',
                        marginTop: i > 0 ? 2 : 0,
                      }}
                    >
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        border: isSelected ? 'none' : `2px solid ${P.border}`,
                        background: isSelected ? P.ink : 'transparent',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                      </span>
                      <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: isSelected ? 600 : 500, fontSize: 15, color: P.ink }}>{r.label}</span>
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
          return ReactDOM.createPortal(
            <div style={{
              position: 'absolute', inset: 0, zIndex: 400,
              background: 'white',
              display: 'flex', flexDirection: 'column',
              animation: 'revealDown 0.25s ease-out both',
            }}>
              {/* Header */}
              <div style={{ padding: '58px 16px 8px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                  <h1 style={{
                    flex: 1, margin: 0,
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
                    color: P.ink, letterSpacing: '-0.007em',
                  }}>Edit hours by day</h1>
                </div>
              </div>

              {/* Summary strip */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 24px', margin: '0 16px',
                background: 'rgba(15,13,40,0.06)', borderRadius: 10,
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: P.inkSoft }}>Selected</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: P.ink }}>
                  {totalDays === 0.5 ? '½ day' : totalDays === 1 ? '1 day' : `${totalDays} days`}
                </span>
              </div>

              {/* Scrollable day list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 120px' }}>
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

              {/* Sticky Done button */}
              <div style={{ position: 'sticky', bottom: 0, padding: '12px 16px 32px', background: 'white', borderTop: `1px solid ${P.border}`, flexShrink: 0 }}>
                <Button variant="primary" size="large" fullWidth onClick={() => setShowHoursSheet(false)}>
                  Done
                </Button>
              </div>
            </div>,
            appShell
          );
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
            padding: '16px 24px 24px',
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
            }}>{item.date}</div>

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
          if (item._leaveReason === 'sick-self' || item._leaveReason === 'sick-cert') return false;
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
                'Legal holiday': 'statutory', 'ADV day': 'adv',
                'Extra-legal leave': 'extra-legal', 'Short leave': 'special-civic',
                'Sick leave': 'sick-cert', 'Sick leave (with medical certificate)': 'sick-cert',
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
          // Pending or approved: Delete + Edit
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
              Delete
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

      {/* Delete confirmation sheet — inline portal, no inner component */}
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
            window.__showTimeOffToast && window.__showTimeOffToast('Request deleted');
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
              aria-labelledby="confirm-delete-title"
              aria-describedby="confirm-delete-desc"
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
              <div id="confirm-delete-title" style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
                color: P.ink, textAlign: 'center', marginBottom: 8,
              }}>Delete this request?</div>
              <div id="confirm-delete-desc" style={{
                fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 14,
                color: P.inkSoft, textAlign: 'center', marginBottom: 16,
                lineHeight: '20px',
              }}>This will permanently remove your time off request. This action cannot be undone.</div>
              <Button
                variant="outline" size="large" fullWidth
                style={{ color: PFC.errorText, borderColor: PFC.errorBorder }}
                onClick={doDelete}>
                Delete
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
          _leaveReason: 'sick-cert',
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
          }}>{sourceItem.date} · {sourceItem.days} day{sourceItem.days > 1 ? 's' : ''}</div>
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
