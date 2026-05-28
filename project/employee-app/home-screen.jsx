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
      }}>Hi David</h1>
      <button aria-label="Profile" onClick={() => {}} style={{
        width: 32, height: 32, borderRadius: 999,
        background: C.purpleSoft, border: 'none', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: C.inkDarker, padding: 0
      }}>
        <LucideIcon name="User" size={18} color={C.inkDarker} strokeWidth={2} />
      </button>
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
      background: 'linear-gradient(135deg, rgb(235,244,255) 0%, rgb(208,228,255) 60%, rgb(59,141,248) 100%)',
      borderRadius: 16,
      padding: '24px 20px',
      textAlign: 'left',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700, fontSize: 22, lineHeight: '30px',
        letterSpacing: '-0.005em', color: C.ink
      }}>Optimise your End of year premium</div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 500, fontSize: 14, lineHeight: '20px',
        letterSpacing: '0.003em', color: C.inkSoft
      }}>Get up to €230 more value than cashing it out in December.</div>
      <button onClick={onClick} style={{
        appearance: 'none', border: '1px solid transparent', cursor: 'pointer',
        width: '100%', boxSizing: 'border-box',
        background: C.ink, color: '#fff',
        fontFamily: 'var(--font-display)',
        fontWeight: 700, fontSize: 16, lineHeight: '24px',
        padding: '12px 20px',
        borderRadius: 12,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginTop: 8
      }}>
        Unlock budget
      </button>
    </div>);
}

// ─────────────────────────────────────────────────────────────
// Review Card — larger card for items that need user review
// (e.g. bike lease drafts, rejected pension savings).
// ─────────────────────────────────────────────────────────────
function ReviewCard({ icon, title, subtitle, badge, onClick }) {
  return (
    <Card onClick={onClick} style={{
      padding: '16px', cursor: 'pointer',
      display: 'flex', alignItems: 'flex-start', gap: 14
    }}>
      <IconTile name={icon} size={44} iconSize={22} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700, fontSize: 16, lineHeight: '22px',
          letterSpacing: '-0.003em', color: C.ink
        }}>{title}</div>
        {subtitle && <div style={{
          marginTop: 2,
          fontFamily: 'var(--font-display)',
          fontWeight: 500, fontSize: 13, lineHeight: '18px',
          color: C.inkSoft
        }}>{subtitle}</div>}
        {badge && <div style={{ marginTop: 8 }}>{badge}</div>}
      </div>
      <LucideIcon name="ChevronRight" size={20} color={C.inkSoft} strokeWidth={2}
        style={{ marginTop: 2, flex: 'none' }} />
    </Card>);
}

// Red rejection badge for review cards.
function RejectedBadge({ reason }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'rgb(254,236,236)', color: 'rgb(180,35,35)',
      border: '1px solid rgb(252,209,209)',
      borderRadius: 8,
      padding: '3px 8px',
      fontFamily: 'var(--font-display)',
      fontWeight: 500, fontSize: 12, lineHeight: '16px',
      letterSpacing: '0.005em',
      maxWidth: '100%'
    }}>
      <LucideIcon name="X" size={11} color="rgb(180,35,35)" strokeWidth={2.5} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Rejected: "{reason}"</span>
    </span>);
}

// Section header with just a label (no count badge).
function SectionLabel({ title }) {
  return (
    <div style={{
      fontFamily: 'var(--font-display)',
      fontWeight: 700, fontSize: 20, lineHeight: '28px',
      letterSpacing: '-0.003em', color: C.ink
    }}>{title}</div>);
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
// HomeScreen — the full scroll surface.
// ─────────────────────────────────────────────────────────────
function HomeScreen() {
  const nav = window.useNav ? window.useNav() : null;
  const drafts = (window.DRAFTS || []).filter(d => !(window.__deletedDrafts || []).includes(d.id));
  const [dismissed, setDismissed] = React.useState({});
  const dismiss = (key) => setDismissed((d) => ({ ...d, [key]: true }));

  // Bike-lease drafts (filter from DRAFTS for review section)
  const bikeDrafts = drafts.filter(d => d.kind === 'bike' || d.id === 'bike-1');
  const pensionRejected = drafts.find(d => d.id === 'pension-1') && !window.__pensionResubmitted;

  const hasReviewItems = bikeDrafts.length > 0 || pensionRejected;

  return (
    <div style={{
      padding: '8px 16px 24px',
      display: 'flex', flexDirection: 'column', gap: 24
    }}>
      <HomeHeader />

      {/* EoY Optimise Card — prominent gradient card */}
      {!window.__eoyUnlocked &&
        <EoyOptimiseCard onClick={() => nav && nav.push('unlock-eoy')} />
      }

      {/* To review section — bike lease drafts + rejected pension */}
      {hasReviewItems && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectionLabel title="To review" />

          {bikeDrafts.length > 0 && (
            <ReviewCard
              icon="Link"
              title={`${bikeDrafts.length} bike lease in draft`}
              subtitle="Review it to submit"
              onClick={() => nav && window.navigateToItem(nav.push, bikeDrafts[0].id)} />
          )}

          {pensionRejected && (
            <ReviewCard
              icon="HeartPulse"
              title="Pension savings have been rejected"
              badge={<RejectedBadge reason="amount is higher than mortgage on document" />}
              onClick={() => nav && window.navigateToItem(nav.push, 'pension-1')} />
          )}
        </div>
      )}

      {/* Discover section — recommendations, highlights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SectionLabel title="Discover" />

        <AccessoriesHighlight onClick={() => nav && nav.push('benefit-flow-start', { name: 'Laptop accessories via Coolblue' })} />

        {!dismissed.smartphone &&
        <DismissibleHighlight
          badge="Reopens on July 23"
          title="Smartphone"
          body="Get a new, tax-friendly smartphone when your renting period expires."
          score={{ label: 'Excellent', level: 3, pct: 48 }}
          onDismiss={() => dismiss('smartphone')}
          onClick={() => nav && nav.push('benefit-flow-start', { name: 'Smartphone' })} />
        }

        <BikingSeasonHighlight onClick={() => nav && nav.push('benefit-flow-start', { name: 'Bike leasing' })} />

        {!dismissed.pension &&
        <PensionLearnMoreCard
          onDismiss={() => dismiss('pension')}
          onClick={() => nav && nav.push('pension-detail', { id: 'pension-1' })} />
        }

        {!dismissed.warrants &&
        <DismissibleHighlight
          badge="Choose before 8 December"
          title="Warrants"
          body="The most tax-friendly way to get cash from your Flex budgets."
          score={{ label: 'Good', level: 1, pct: 48 }}
          onDismiss={() => dismiss('warrants')}
          onClick={() => nav && nav.push('benefit-flow-start', { name: 'Warrants' })} />
        }
      </div>
    </div>);

}

// Export for app.jsx (different Babel script scopes)
window.HomeScreen = HomeScreen;
window.registerScreen && window.registerScreen('home', HomeScreen);