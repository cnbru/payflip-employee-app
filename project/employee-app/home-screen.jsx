// Home screen — Payflip employee app
// Cards: unlock budgets, todos, accessories highlight, smartphone, biking,
// pension, warrants. Imagery uses <image-slot> so the user can drop in art.

// ─────────────────────────────────────────────────────────────
// Color tokens used in this screen (some are figma-only and not
// in the design system stylesheet — kept here so home cards stay
// faithful to the design.)
// ─────────────────────────────────────────────────────────────
const C = {
  ink: 'rgb(15,13,40)', // primary text
  inkSoft: 'rgb(80,84,94)', // secondary text
  inkDarker: 'rgb(34,10,53)', // pill bg (dark purple)
  inkDeep: 'rgb(15,13,40)', // biking card bg
  textBody: 'rgb(59,57,64)', // body color in tax pills
  border: 'rgb(217,218,221)', // card border (gray-300)
  divider: 'rgb(234,234,235)', // softer border
  purple: 'rgb(196,43,252)', // vivid accent (figma)
  purpleDeep: 'rgb(139,55,235)',
  purpleSoft: 'rgb(232,216,240)', // small icon bg
  purpleTile: 'rgb(245,226,254)', // tile bg + accessories card
  purpleTileT: 'rgba(245,226,254,0.31)', // gradient start
  warnBg: 'rgb(255,243,229)',
  warnBorder: 'rgb(255,225,190)',
  warnText: 'rgb(166,79,33)',
  blueLight: 'rgb(184,222,254)', // unlock-budgets pill
  pink: 'rgb(212,74,116)', // pink-600 — primary button
  pinkDark: 'rgb(165,39,77)'
};

// ─────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────

// 40×40 rounded tile with a soft-purple gradient holding a Lucide icon.
// 40×40 rounded tile with a soft-purple gradient holding a Lucide icon.
// Pass `bg` + `iconColor` to override (e.g. for accented to-do cards).
function IconTile({ name, size = 40, iconSize = 24, bg, iconColor = C.ink }) {
  const background = bg || `linear-gradient(${C.purpleTileT} 0%, ${C.purpleTile} 100%)`;
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flex: 'none'
    }}>
      <LucideIcon name={name} size={iconSize} color={iconColor} strokeWidth={1.75} />
    </div>);

}

// Generic outline button (small + regular).
function OutlineButton({ children, size = 'sm', onClick, style }) {
  const isSm = size === 'sm';
  return (
    <button onClick={onClick} style={{
      appearance: 'none',
      border: `1px solid ${C.border}`,
      background: 'white',
      color: C.ink,
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: isSm ? 14 : 16,
      lineHeight: isSm ? '20px' : '24px',
      padding: isSm ? '6px 12px' : '8px 16px',
      borderRadius: isSm ? 8 : 10,
      cursor: 'pointer',
      ...style
    }}>{children}</button>);

}

// Filled pink primary button.
function PrimaryButton({ children, fill = C.pink, color = '#fff', onClick, style }) {
  return (
    <button onClick={onClick} style={{
      appearance: 'none', border: 'none',
      background: fill, color,
      fontFamily: 'var(--font-display)',
      fontWeight: 700, fontSize: 16, lineHeight: '24px',
      padding: '8px 16px',
      borderRadius: 10,
      cursor: 'pointer',
      ...style
    }}>{children}</button>);

}

// 36×36 secondary icon button (used for X close).
function IconButton({ name, onClick, ariaLabel = 'Close' }) {
  return (
    <button onClick={onClick} aria-label={ariaLabel} style={{
      width: 36, height: 36, borderRadius: 8,
      background: 'rgb(247,247,248)',
      border: 'none', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flex: 'none',
      color: 'rgb(103,107,116)'
    }}>
      <LucideIcon name={name} size={20} color="rgb(103,107,116)" />
    </button>);

}

// Warning status badge (orange pill with optional icon).
function WarningBadge({ children, withIcon = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: C.warnBg, color: C.warnText,
      border: `1px solid ${C.warnBorder}`,
      borderRadius: 8,
      padding: '2px 8px',
      fontFamily: 'var(--font-display)',
      fontWeight: 500, fontSize: 12, lineHeight: '16px',
      letterSpacing: '0.005em',
      width: 'fit-content'
    }}>
      {withIcon && <LucideIcon name="TriangleAlert" size={12} color={C.warnText} />}
      {children}
    </span>);

}

// "Good" tax-score pill: white capsule + 3 stylised purple dots + label.
function TaxScoreGood() {
  const dot = {
    width: 4.6, height: 13.3, borderRadius: 999, background: C.purple, flex: 'none'
  };
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'white', borderRadius: 999,
      padding: '4px 8px'
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2 }}>
        <span style={{ ...dot, height: 7 }} />
        <span style={{ ...dot, height: 10 }} />
        <span style={{ ...dot, height: 13 }} />
      </span>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 500, fontSize: 14, lineHeight: '20px',
        letterSpacing: '0.003em', color: C.textBody
      }}>Good</span>
    </div>);

}

// "24% chose this" social-proof pill.
function TaxScoreSocial({ pct = 24 }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'white', borderRadius: 999,
      padding: '4px 10px 4px 8px'
    }}>
      {/* Heart inside speech bubble, two-tone */}
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M2 7.3a5.3 5.3 0 1 1 2.6 4.55L2.5 13l.6-2.6A5.3 5.3 0 0 1 2 7.3Z"
        fill={C.purpleSoft} stroke={C.purpleSoft} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M8 9.7c-.7-.6-2-1.3-2-2.5a1.1 1.1 0 0 1 2-.7 1.1 1.1 0 0 1 2 .7c0 1.2-1.3 1.9-2 2.5Z"
        fill={C.purple} />
      </svg>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 500, fontSize: 14, lineHeight: '20px',
        letterSpacing: '0.003em', color: C.textBody
      }}>{pct}% chose this</span>
    </div>);

}

// Generic card wrapper.
function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'white',
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      ...style
    }}>{children}</div>);

}

// ─────────────────────────────────────────────────────────────
// Page sections
// ─────────────────────────────────────────────────────────────

function HomeHeader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '4px 0'
    }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700, fontSize: 28, lineHeight: '36px',
        letterSpacing: '-0.007em', color: C.ink, margin: 0
      }}>Hi Pauline</h1>
    </div>);

}

function UnlockBudgetsCard({ onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', appearance: 'none', border: 'none', cursor: 'pointer',
      background: C.blueLight,
      borderRadius: 16,
      padding: '20px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      textAlign: 'left'
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 999,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flex: 'none'
      }}>
        <LucideIcon name="LockOpen" size={20} color={C.ink} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700, fontSize: 16, lineHeight: '24px',
          letterSpacing: '-0.003em', color: C.ink
        }}>Unlock your budgets</div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700, fontSize: 14, lineHeight: '20px',
          letterSpacing: '-0.003em', color: C.inkSoft
        }}>3 locked budgets</div>
      </div>
      <LucideIcon name="ChevronRight" size={24} color={C.ink} strokeWidth={2} />
    </button>);

}

// Lightweight to-do row — flat card with title, subtitle, and a chevron.
// `status.text` (if present) shows as a single subtle line under the title.
function TodoCard({ item, onClick }) {
  const kindIcon = item.icon || window.KIND_ICON && window.KIND_ICON[item.kind] || 'House';
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {e.preventDefault();onClick && onClick();}
  };
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={handleKey} style={{
      width: '100%', boxSizing: 'border-box', textAlign: 'left', cursor: 'pointer',
      background: item.bg || 'white',
      border: `1px solid ${item.bg ? item.bg : C.border}`, borderRadius: 16, padding: '14px 12px 14px 16px',
      display: 'flex', alignItems: 'center', gap: 12
    }}>
      <IconTile name={kindIcon} size={36} iconSize={20} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700, fontSize: 16, lineHeight: '22px',
          letterSpacing: '-0.003em', color: C.ink
        }}>{item.name}</div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500, fontSize: 13, lineHeight: '18px',
          letterSpacing: '-0.003em',
          color: '#50545E'
        }}>{item.status && item.status.text || item.provider}</div>
      </div>
      <LucideIcon name="ChevronRight" size={20} color={C.inkSoft} strokeWidth={2} />
    </div>);

}

// "Get your laptop accessories" — baked card art (user-supplied).
function AccessoriesHighlight({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Discover accessories"
      style={{
        display: 'block', width: '100%', padding: 0,
        border: 'none', background: 'transparent', cursor: 'pointer',
        borderRadius: 16, overflow: 'hidden'
      }}>
      <img src="assets/home-accessories.png" alt=""
      style={{ display: 'block', width: '100%', height: 'auto' }} />
    </button>);

}

// Dismissable highlight (smartphone, warrants).
function DismissibleHighlight({ badge, title, body, score, onDismiss, onClick }) {
  return (
    <Card style={{ padding: 20, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 49, height: 49, borderRadius: 16,
          background: `linear-gradient(${C.purpleTileT} 0%, ${C.purpleTile} 100%)`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <LucideIcon name="House" size={24} color={C.ink} />
        </div>
        <IconButton name="X" onClick={(e) => { e.stopPropagation(); onDismiss && onDismiss(); }} ariaLabel={`Dismiss ${title}`} />
      </div>

      <div style={{ marginTop: 20 }}>
        <WarningBadge>{badge}</WarningBadge>
      </div>
      <div style={{
        marginTop: 16,
        fontFamily: 'var(--font-display)',
        fontWeight: 700, fontSize: 20, lineHeight: '28px',
        letterSpacing: '-0.003em', color: C.ink
      }}>{title}</div>
      <div style={{
        marginTop: 4,
        fontFamily: 'var(--font-display)',
        fontWeight: 500, fontSize: 14, lineHeight: '20px',
        color: C.ink
      }}>{body}</div>

      {score &&
      <div style={{ marginTop: 24 }}>
          {window.TaxScoreRow && <window.TaxScoreRow score={score} />}
        </div>
      }
    </Card>);

}

// "Pension savings or warrants?" — same chrome as dismissible but with a CTA.
function PensionLearnMoreCard({ onDismiss, onClick }) {
  return (
    <Card style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 49, height: 49, borderRadius: 16,
          background: `linear-gradient(${C.purpleTileT} 0%, ${C.purpleTile} 100%)`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <LucideIcon name="House" size={24} color={C.ink} />
        </div>
        <IconButton name="X" onClick={(e) => { e.stopPropagation(); onDismiss && onDismiss(); }} ariaLabel="Dismiss pension savings card" />
      </div>

      <div style={{
        marginTop: 16,
        fontFamily: 'var(--font-display)',
        fontWeight: 700, fontSize: 20, lineHeight: '28px',
        letterSpacing: '-0.003em', color: C.ink
      }}>Pension savings or warrants?</div>
      <div style={{
        marginTop: 4,
        fontFamily: 'var(--font-display)',
        fontWeight: 500, fontSize: 14, lineHeight: '20px',
        color: C.ink
      }}>Which one is the better choice for you?</div>

      <button onClick={onClick} style={{
        marginTop: 16, width: '100%',
        appearance: 'none',
        border: `1px solid ${C.border}`,
        background: 'white', color: C.ink,
        fontFamily: 'var(--font-display)',
        fontWeight: 700, fontSize: 16, lineHeight: '24px',
        padding: '8px 16px', borderRadius: 10,
        cursor: 'pointer'
      }}>Learn more</button>
    </Card>);

}

// ─────────────────────────────────────────────────────────────
// EoY Optimise Card — gradient card prompting user to unlock
// their end-of-year premium for better value.
// ─────────────────────────────────────────────────────────────
function EoyOptimiseCard({ onClick }) {
  return (
    <div style={{
      width: '100%', boxSizing: 'border-box',
      background: '#F7ECDA',
      borderRadius: 20,
      padding: '24px 20px',
      textAlign: 'left',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700, fontSize: 20, lineHeight: '28px',
        letterSpacing: '-0.005em', color: C.ink
      }}>Sign the addendum to unlock your budget</div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 500, fontSize: 14, lineHeight: '21px',
        letterSpacing: '0.003em', color: C.inkSoft
      }}>Once signed, you can use this budget to purchase benefits. Your budget unlocks automatically after signing.</div>
      <button onClick={onClick} style={{
        appearance: 'none', border: 'none', cursor: 'pointer',
        width: '100%', boxSizing: 'border-box',
        background: C.inkDeep, color: '#fff',
        fontFamily: 'var(--font-display)',
        fontWeight: 700, fontSize: 17, lineHeight: '24px',
        padding: '14px 20px',
        borderRadius: 14,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 4,
      }}>
        Sign now
      </button>
    </div>);
}

// ─────────────────────────────────────────────────────────────
// Review Card — larger card for items that need user review
// (e.g. bike lease drafts, rejected pension savings).
// ─────────────────────────────────────────────────────────────
function ReviewCard({ icon, title, subtitle, badge, onClick, tileVariant = 'default' }) {
  const tileSx = tileVariant === 'draft'
    ? { background: 'transparent', border: '1.3px dashed #c42bfc' }
    : tileVariant === 'rejected'
    ? { background: '#ffebeb', border: '1.3px dashed #de1c22' }
    : { background: '#ddebff' };

  return (
    <button onClick={onClick} style={{
      width: '100%', appearance: 'none', border: 'none', background: 'transparent',
      cursor: 'pointer', textAlign: 'left',
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 8px 16px 16px',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14, flex: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        ...tileSx,
      }}>
        <LucideIcon name={icon} size={22} color={C.ink} strokeWidth={1.75} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500, fontSize: 16, lineHeight: '24px',
          color: C.ink
        }}>{title}</div>
        {subtitle && <div style={{
          marginTop: 2,
          fontFamily: 'var(--font-display)',
          fontWeight: 400, fontSize: 13, lineHeight: '18px',
          color: C.inkSoft
        }}>{subtitle}</div>}
        {badge && (
          <div style={{
            marginTop: 4,
            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, lineHeight: '18px',
            color: 'rgb(143,20,20)',
          }}>{badge}</div>
        )}
      </div>
      <LucideIcon name="ChevronRight" size={20} color={C.inkSoft} strokeWidth={2} style={{ flex: 'none' }} />
    </button>);
}

// Red rejection badge for review cards.
function RejectedBadge({ reason }) {
  return reason;
}

// Section header with just a label (no count badge).
function SectionLabel({ title, dotColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {dotColor && <div style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0, marginTop: 1 }} />}
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, lineHeight: '22px', color: C.ink }}>{title}</div>
    </div>
  );
}

// Dark "It's biking season" card — baked card art (user-supplied).
function BikingSeasonHighlight({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Discover bikes"
      style={{
        display: 'block', width: '100%', padding: 0,
        border: 'none', background: 'transparent', cursor: 'pointer',
        borderRadius: 16, overflow: 'hidden'
      }}>
      <img src="assets/biking-season.png" alt=""
      style={{ display: 'block', width: '100%', height: 'auto' }} />
    </button>);

}

// ─────────────────────────────────────────────────────────────
// HomeToast — inline version so it stays in this script scope
// ─────────────────────────────────────────────────────────────
function HomeToast({ title, actions = [], onDismiss }) {
  React.useEffect(() => {
    if (!document.getElementById('home-toast-kf')) {
      const el = document.createElement('style');
      el.id = 'home-toast-kf';
      el.textContent = '@keyframes homeToastUp { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }';
      document.head.appendChild(el);
    }
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      zIndex: 500, background: '#16a34a', borderRadius: 999,
      boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
      padding: '10px 10px 10px 14px',
      display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
      animation: 'homeToastUp 0.3s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      <LucideIcon name="Check" size={18} color="#fff" strokeWidth={2.5} />
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, lineHeight: '22px', color: '#fff' }}>{title}</span>
      {actions.map(a => (
        <button key={a.label} onClick={() => { a.onClick(); onDismiss(); }} style={{
          marginLeft: 2, background: 'rgba(255,255,255,0.22)', border: 'none', borderRadius: 8,
          padding: '4px 12px', cursor: 'pointer',
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: '#fff',
        }}>{a.label}</button>
      ))}
    </div>
  );
}

function RecentActivityRow({ item, isLast, onClick }) {
  const statusColors = {
    rejected: { bg: '#FEE2E2', color: '#B91C1C', border: '#FECACA' },
    pending:  { bg: '#FFF8EC', color: '#8C5A00', border: '#F0D490' },
    draft:    { bg: '#F3EEFF', color: '#7C3AED', border: 'rgba(139,55,235,0.2)' },
    active:   { bg: '#E8F8EE', color: '#1D9E75', border: '#BBE9D0' },
    approved: { bg: '#E8F8EE', color: '#1D9E75', border: '#BBE9D0' },
  };
  const s = statusColors[item.statusKind] || { bg: '#F7F7F8', color: C.inkSoft, border: C.border };
  return (
    <button onClick={onClick} style={{
      width: '100%', appearance: 'none', background: 'transparent', border: 'none', textAlign: 'left',
      borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
      padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      cursor: 'pointer',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: '#F2F2F5', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <LucideIcon name={item.icon} size={20} color={C.inkSoft} strokeWidth={1.75} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: C.inkSoft, marginTop: 2 }}>{item.meta}</div>
      </div>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        borderRadius: 999, padding: '2px 9px', whiteSpace: 'nowrap', flexShrink: 0,
      }}>{item.status}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// HomeScreen — the full scroll surface.
// ─────────────────────────────────────────────────────────────
function HomeScreen() {
  const nav = window.useNav ? window.useNav() : null;
  const drafts = (window.DRAFTS || []).filter(d => !(window.__deletedDrafts || []).includes(d.id));
  const [dismissed, setDismissed] = React.useState({});
  const dismiss = (key) => setDismissed((d) => ({ ...d, [key]: true }));

  const [toast, setToast] = React.useState(null);
  const homeStackLen = nav ? (nav.stacks[nav.activeTab] || []).length : 1;

  React.useEffect(() => {
    if (homeStackLen === 1 && window.__pendingToast) {
      const pt = window.__pendingToast;
      const exp = window.__lastSubmittedExpense || null;
      const actions = [];
      if (exp && nav) actions.push({ label: 'View', onClick: () => nav.push('expense-detail', { expense: exp }) });
      setToast({ title: pt.title, actions });
      window.__pendingToast = null;
      window.__lastSubmittedExpense = null;
    }
  }, [homeStackLen]);

  const ACTIVITY_SEEDS = [
    { id: 'act-ben-lap', kind: 'benefit', icon: 'Laptop',          title: 'Laptop',             meta: 'MacBook Air M3',                status: 'Draft',    statusKind: 'draft',    sortTs: 20260729, _screen: 'me-active-benefits' },
    { id: 'act-exp-rej', kind: 'expense', icon: 'UtensilsCrossed', title: 'Restaurant / meals', meta: '€45.00 · 18 Jul',               status: 'Rejected', statusKind: 'rejected', sortTs: 20260718, _expense: { type: 'work', category: 'Restaurant / meals', amount: 45.00, date: '18/07/2026', status: 'rejected', adminNote: 'Receipt is not readable.', hasAttachment: true } },
    { id: 'act-to-req',  kind: 'timeoff', icon: 'Palmtree',        title: 'Summer holiday',     meta: 'Aug 7–15 · 7 days',             status: 'Pending',  statusKind: 'pending',  sortTs: 20260714, _leave: { label: 'Summer holiday', date: 'Aug 7–15', month: 'August', days: 7, status: 'pending' } },
    { id: 'act-exp-tax', kind: 'expense', icon: 'Car',             title: 'Taxi / Uber',        meta: '€28.00 · 5 Jul',                status: 'Pending',  statusKind: 'pending',  sortTs: 20260705, _expense: { type: 'mobility', category: 'Taxi / Uber', amount: 28.00, date: '05/07/2026', status: 'pending' } },
    { id: 'act-ben-pen', kind: 'benefit', icon: 'PiggyBank',       title: 'Pension savings',    meta: 'Choice submitted · €312.50',    status: 'Active',   statusKind: 'active',   sortTs: 20260102, _screen: 'pension-savings-detail' },
    { id: 'act-exp-mob', kind: 'expense', icon: 'TrainFront',      title: 'Public transport',   meta: '€64.80 · 1 Jul',                status: 'Approved', statusKind: 'approved', sortTs: 20260701, _expense: { type: 'mobility', category: 'Public transport', amount: 64.80, date: '01/07/2026', status: 'approved' } },
    { id: 'act-to-sick', kind: 'timeoff', icon: 'Stethoscope',     title: 'Sick leave',         meta: 'Jun 23 · 1 day',                status: 'Approved', statusKind: 'approved', sortTs: 20260623, _leave: { label: 'Sick leave', date: 'Jun 23', month: 'June', days: 1, status: 'approved' } },
  ];
  const dynamicExpenses = (window.__submittedExpenses || []).map((e, idx) => ({
    id: e.id, kind: 'expense',
    icon: e.category === 'Taxi / Uber' ? 'Car' : e.category === 'Hotel' ? 'BedDouble' : e.category === 'Parking' ? 'ParkingCircle' : 'Receipt',
    title: e.category || 'Expense',
    meta: '€' + Number(e.amount).toFixed(2) + (e.date ? ' · ' + e.date.slice(0, 5) : ''),
    status: 'Pending', statusKind: 'pending',
    sortTs: 99999999 - idx,
    _expense: e,
  }));
  const dynamicAbsences = (window.__timeOffItems || [])
    .filter(t => typeof t.id === 'string' && t.id.startsWith('req-'))
    .map((t, idx) => ({
      id: t.id, kind: 'timeoff',
      icon: t._leaveReason === 'sick' ? 'Stethoscope' : 'Palmtree',
      title: t.label || 'Absence',
      meta: (t.date || '') + (t.days ? ' · ' + t.days + (t.days === 1 ? ' day' : ' days') : ''),
      status: t.status === 'approved' ? 'Approved' : t.status === 'denied' ? 'Denied' : 'Pending',
      statusKind: t.status === 'denied' ? 'rejected' : (t.status || 'pending'),
      sortTs: 99999998 - idx,
      _leave: t,
    }));
  const openActivityItem = (item) => {
    if (!nav) return;
    if (item._leave) return nav.push('time-off-detail', { item: item._leave });
    if (item._expense) return nav.push('expense-detail', { expense: item._expense });
    if (item._screen) return nav.push(item._screen);
    if (item.kind === 'expense') nav.push('my-expenses');
    else if (item.kind === 'benefit') nav.push('me-active-benefits');
    else nav.push('time-off-hub');
  };
  const recentActivity = [...dynamicAbsences, ...dynamicExpenses, ...ACTIVITY_SEEDS]
    .filter((item, i, arr) => arr.findIndex(x => x.id === item.id) === i)
    .sort((a, b) => b.sortTs - a.sortTs)
    .slice(0, 3);

  const DRAFT_ICONS = { bike: 'Bike', pension: 'PiggyBank', laptop: 'Laptop', coolblue: 'Smartphone', housing: 'House', tablet: 'Tablet', watch: 'Watch', lnd: 'GraduationCap' };
  const allDraftItems = drafts.filter(d => d.status && d.status.kind === 'warning');
  const pensionRejected = drafts.find(d => d.id === 'pension-1') && !window.__pensionResubmitted;
  const rejectedExpenses = (window.__expensesMockData || []).filter(e => e.status === 'rejected');

  const hasReviewItems = rejectedExpenses.length > 0;

  return (
    <div style={{
      padding: '8px 16px 24px',
      display: 'flex', flexDirection: 'column', gap: 24
    }}>
      <HomeHeader />

      {/* Quick action buttons */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { icon: 'Receipt', label: 'Add expense', onClick: () => window.__openExpenseSheet && window.__openExpenseSheet() },
          { icon: 'CalendarDays', label: 'Add absence', onClick: () => window.__openAbsenceSheet && window.__openAbsenceSheet() },
        ].map(({ icon, label, onClick }) => (
          <button key={label} onClick={onClick} style={{
            flex: 1, appearance: 'none', cursor: 'pointer',
            background: 'white', border: `1px solid ${C.border}`,
            borderRadius: 24, padding: 16,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24,
            textAlign: 'left',
          }}>
            <LucideIcon name={icon} size={24} color={C.ink} strokeWidth={1.75} />
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600, fontSize: 16, lineHeight: '24px',
              letterSpacing: '-0.015625px', color: C.ink,
            }}>{label}</div>
          </button>
        ))}
      </div>

      {/* Action needed — only shown when items exist */}
      {hasReviewItems && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionLabel title="Action needed" />
          <div style={{
            background: 'rgba(255,255,255,0.7)', borderRadius: 40, padding: 8,
            display: 'flex', flexDirection: 'column',
          }}>
            {rejectedExpenses.map(e => (
              <ReviewCard
                key={e.id}
                icon="Receipt"
                title={e.category}
                subtitle="Expense rejected"
                tileVariant="rejected"
                onClick={() => nav && nav.push('expense-detail', { expense: e })} />
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SectionLabel title="Recent activity" />
          <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {recentActivity.map((item, i) => (
              <RecentActivityRow key={item.id} item={item} isLast={false} onClick={() => openActivityItem(item)} />
            ))}
            <button onClick={() => nav && nav.push('activity-log')} style={{
              appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: C.inkSoft,
              padding: '12px 16px', width: '100%', textAlign: 'center',
              borderTop: `1px solid ${C.border}`,
            }}>View all →</button>
          </div>
        </div>
      )}

      {toast && (
        <HomeToast
          title={toast.title}
          actions={toast.actions || []}
          onDismiss={() => setToast(null)}
        />
      )}

    </div>
  );

}

// ─────────────────────────────────────────────────────────────
// Activity Log — full chronological list of all user actions
// ─────────────────────────────────────────────────────────────
function ActivityLogScreen() {
  const nav = window.useNav ? window.useNav() : null;

  const ALL_SEEDS = [
    { id: 'act-ben-lap', kind: 'benefit', icon: 'Laptop',          title: 'Laptop',             meta: 'MacBook Air M3',             status: 'Draft',    statusKind: 'draft',    sortTs: 20260729 },
    { id: 'act-exp-rej', kind: 'expense', icon: 'UtensilsCrossed', title: 'Restaurant / meals', meta: '€45.00 · 18 Jul',            status: 'Rejected', statusKind: 'rejected', sortTs: 20260718 },
    { id: 'act-to-req',  kind: 'timeoff', icon: 'Palmtree',        title: 'Summer holiday',     meta: 'Aug 7–15 · 7 days',          status: 'Pending',  statusKind: 'pending',  sortTs: 20260714 },
    { id: 'act-exp-tax', kind: 'expense', icon: 'Car',             title: 'Taxi / Uber',        meta: '€28.00 · 5 Jul',             status: 'Pending',  statusKind: 'pending',  sortTs: 20260705 },
    { id: 'act-exp-mob', kind: 'expense', icon: 'TrainFront',      title: 'Public transport',   meta: '€64.80 · 1 Jul',             status: 'Approved', statusKind: 'approved', sortTs: 20260701 },
    { id: 'act-to-sick', kind: 'timeoff', icon: 'Stethoscope',     title: 'Sick leave',         meta: 'Jun 23 · 1 day',             status: 'Approved', statusKind: 'approved', sortTs: 20260623 },
    { id: 'act-exp-lnd', kind: 'expense', icon: 'GraduationCap',   title: 'Learning & dev.',    meta: '€450.00 · 15 Jun',           status: 'Approved', statusKind: 'approved', sortTs: 20260615 },
    { id: 'act-ben-bike',kind: 'benefit', icon: 'Bike',            title: 'Bike lease',         meta: 'o2o Lekker Amsterdam+',       status: 'Active',   statusKind: 'active',   sortTs: 20260101 },
    { id: 'act-ben-pen', kind: 'benefit', icon: 'PiggyBank',       title: 'Pension savings',    meta: 'Choice submitted · €312.50', status: 'Active',   statusKind: 'active',   sortTs: 20260102 },
  ];

  const dynamicExpenses = (window.__submittedExpenses || []).map((e, idx) => ({
    id: e.id, kind: 'expense',
    icon: e.category === 'Taxi / Uber' ? 'Car' : e.category === 'Hotel' ? 'BedDouble' : 'Receipt',
    title: e.category || 'Expense',
    meta: '€' + Number(e.amount).toFixed(2) + (e.date ? ' · ' + e.date.slice(0, 5) : ''),
    status: 'Pending', statusKind: 'pending',
    sortTs: 99999999 - idx,
  }));

  const dynamicAbsences = (window.__timeOffItems || [])
    .filter(t => typeof t.id === 'string' && t.id.startsWith('req-'))
    .map((t, idx) => ({
      id: t.id, kind: 'timeoff',
      icon: t._leaveReason === 'sick' ? 'Stethoscope' : 'Palmtree',
      title: t.label || 'Absence',
      meta: (t.date || '') + (t.days ? ' · ' + t.days + (t.days === 1 ? ' day' : ' days') : ''),
      status: t.status === 'approved' ? 'Approved' : t.status === 'denied' ? 'Denied' : 'Pending',
      statusKind: t.status === 'denied' ? 'rejected' : (t.status || 'pending'),
      sortTs: 99999998 - idx,
    }));

  const items = [...dynamicAbsences, ...dynamicExpenses, ...ALL_SEEDS]
    .filter((item, i, arr) => arr.findIndex(x => x.id === item.id) === i)
    .sort((a, b) => b.sortTs - a.sortTs);

  const statusColors = {
    rejected: { bg: '#FEE2E2', color: '#B91C1C', border: '#FECACA' },
    pending:  { bg: '#FFF8EC', color: '#8C5A00', border: '#F0D490' },
    draft:    { bg: '#F3EEFF', color: '#7C3AED', border: 'rgba(139,55,235,0.2)' },
    active:   { bg: '#E8F8EE', color: '#1D9E75', border: '#BBE9D0' },
    approved: { bg: '#E8F8EE', color: '#1D9E75', border: '#BBE9D0' },
  };

  const handleClick = (item) => {
    if (!nav) return;
    if (item.kind === 'expense') nav.push('my-expenses');
    else if (item.kind === 'benefit') nav.push('me-active-benefits');
    else nav.push('time-off-hub');
  };

  const kindLabel = { expense: 'Expense', benefit: 'Benefit', timeoff: 'Absence' };
  const kindColors = {
    expense: { color: '#1568cd', bg: '#ddebff' },
    benefit: { color: '#7C3AED', bg: '#F3EEFF' },
    timeoff: { color: '#1D9E75', bg: '#E8F8EE' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#F2F2F2', minHeight: '100%' }}>
      <div style={{ background: 'white', padding: '8px 16px 0', borderBottom: `1px solid ${C.border}` }}>
        <button onClick={() => nav && nav.pop()} style={{
          appearance: 'none', border: 'none', background: 'none', cursor: 'pointer',
          padding: '8px 0', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <LucideIcon name="ChevronLeft" size={20} color={C.ink} strokeWidth={2} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 500, color: C.ink }}>Home</span>
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: C.ink, letterSpacing: '-0.5px', padding: '6px 0 16px' }}>Activity</div>
      </div>
      <div style={{ padding: '16px 16px 24px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((item) => {
          const s = statusColors[item.statusKind] || { bg: '#F7F7F8', color: C.inkSoft, border: C.border };
          const k = kindColors[item.kind] || kindColors.expense;
          return (
            <button key={item.id} onClick={() => handleClick(item)} style={{
              width: '100%', appearance: 'none', background: 'white', border: 'none', textAlign: 'left',
              borderRadius: 12, marginBottom: 2,
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: '#F2F2F5', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LucideIcon name={item.icon} size={20} color={C.inkSoft} strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: C.inkSoft }}>{item.meta}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: k.color, background: k.bg, borderRadius: 20, padding: '1px 7px' }}>{kindLabel[item.kind]}</span>
                </div>
              </div>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
                background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                borderRadius: 999, padding: '2px 9px', whiteSpace: 'nowrap', flexShrink: 0,
              }}>{item.status}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
window.registerScreen && window.registerScreen('activity-log', ActivityLogScreen);

// Export for app.jsx (different Babel script scopes)
window.HomeScreen = HomeScreen;
window.registerScreen && window.registerScreen('home', HomeScreen);