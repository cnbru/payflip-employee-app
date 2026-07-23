// Benefits flow:
//   benefits          → root overview (ValueCards + list of benefits)
//   benefits-in-draft → list of draft benefits
//   my-active-benefits → list of active benefits
//   bike-lease         → bike-lease detail
//   pension-detail     → pension savings detail
//   coolblue-order     → Coolblue order detail
//   edit-active-benefit → edit screen

// ─────────────────────────────────────────────────────────────
// Mock data
// `kind` drives icons + which detail screen handles the item.
// ─────────────────────────────────────────────────────────────
const DRAFTS = [
  {
    id: 'pension-1', kind: 'pension',
    provider: 'Pension savings · via AG Insurance',
    name: 'Pension savings 2026',
    meta: '€120/mo · Until retirement',
    status: { kind: 'alert', text: 'Rejected · Amount is higher than mortgage on document' },
  },
  {
    id: 'bike-1', kind: 'bike',
    provider: 'Bike lease · via Joule',
    name: 'Specialized Vado SL 4.0',
    meta: 'E-bike · High step · 38 months',
    status: { kind: 'warning', text: 'Draft · Finalize your order' },
  },
];

const ACTIVE_BENEFITS = [
  {
    id: 'bike-active', kind: 'bike',
    provider: 'Bike lease · via Joule',
    name: 'Specialized Vado SL 4.0',
    meta: 'Until Jan 2027',
    status: { kind: 'warning', text: 'Reopens in 2 months' },
  },
  {
    id: 'coolblue-smartphone', kind: 'coolblue',
    provider: 'Multimedia · via Coolblue',
    name: 'iPhone 15 · 128GB Pink',
    meta: 'Delivered · 12 nov 2025',
    status: null,
    orderId: 'CB-2025-11-0042',
    orderDate: '12 nov 2025',
    orderStatus: { kind: 'success', text: 'Delivered' },
  },
  {
    id: 'housing-active', kind: 'housing',
    provider: 'Reimbursement',
    name: 'Housing cost',
    meta: '€800/mo · Until Jan 2027',
    status: null,
  },
];

// Icon used per kind on the icon tile (Lucide name).
const KIND_ICON = {
  bike: 'Bike',
  pension: 'House',
  coolblue: 'Smartphone',
  housing: 'House',
  unlock: 'LockOpen',
};

// ─────────────────────────────────────────────────────────────
// Discover catalog — benefits the user has NOT chosen yet. Shown on
// the Benefits root under the "Discover" section.
// ─────────────────────────────────────────────────────────────
const CATALOG = [
  {
    id: 'cat-pension', kind: 'pension', icon: 'House',
    name: 'Pension savings',
    description: 'Individual pension saving is a tax-friendly way of setting aside a penny for your old day. Get your yearly savings reimbursed via Payflip!',
    score: { label: 'Good',      level: 1, pct: 54 },
    budgets: ['end-of-year'],
    route: ['pension-savings-detail'],
  },
  {
    id: 'cat-bike', kind: 'bike', icon: 'Bike',
    name: 'Bike leasing via o2o',
    description: 'Lease a bike for up to 36 months and ride to work tax-free.',
    score: { label: 'Excellent', level: 3, pct: 38 },
    budgets: ['mobility'],
    route: ['benefit-flow-start', { name: 'Bike leasing via o2o' }],
  },
  {
    id: 'cat-multimedia', kind: 'coolblue', icon: 'Monitor',
    name: 'Multimedia via Coolblue',
    description: 'Smartphones, tablets, PCs, accessories and more — all tax-friendly via Coolblue.',
    score: { label: 'Good', level: 1, pct: 65 },
    budgets: ['bonus', 'end-of-year'],
    route: ['multimedia-coolblue'],
  },
  {
    id: 'cat-alan', kind: 'health', icon: 'HeartPulse',
    name: 'Alan health insurance',
    description: 'Upgrade your health insurance and cover your family members via Alan.',
    score: { label: 'Excellent', level: 3, pct: 34 },
    budgets: ['bonus', 'end-of-year'],
    route: ['benefit-flow-start', { name: 'Alan health insurance' }],
  },
  {
    id: 'cat-warrants', kind: 'warrants', icon: 'TrendingUp',
    name: 'Warrants',
    description: 'The most tax-friendly way to get cash from your Flex budgets.',
    score: { label: 'Good',      level: 1, pct: 48 },
    budgets: ['bonus', 'end-of-year'],
    route: ['benefit-flow-start', { name: 'Warrants' }],
  },
  {
    id: 'cat-holidays', kind: 'holidays', icon: 'Palmtree',
    name: 'Extra holidays',
    description: 'Buy extra vacation days with your budget — more time off.',
    score: { label: 'Neutral',   level: 0, pct: 30 },
    budgets: ['bonus', 'end-of-year'],
    route: ['benefit-flow-start', { name: 'Extra holidays' }],
  },
  {
    id: 'cat-mobility', kind: 'housing', icon: 'Home',
    name: 'Housing costs',
    description: 'Reimburse commuting, parking, public transport or housing costs.',
    score: { label: 'Great',     level: 2, pct: 33 },
    budgets: ['mobility'],
    route: ['benefit-flow-start', { name: 'Housing costs' }],
  },
];

// Personalised recommendations — derived from what the user already
// has active. e.g. an active smartphone unlocks the accessories.
const RECOMMENDED = [
  {
    id: 'rec-smartphone-accessories', kind: 'coolblue', icon: 'Smartphone',
    name: 'Smartphone accessories',
    description: 'Earpods, chargers and cases for your iPhone 15 — paid with tax advantage.',
    score: { label: 'Good', level: 1, pct: 62 },
    becauseOf: 'iPhone 15',
    route: ['benefit-flow-start', { name: 'Smartphone accessories' }],
  },
];

// Route an item id → screen name + params.
function routeForItem(id) {
  const item = DRAFTS.find(b => b.id === id) || ACTIVE_BENEFITS.find(b => b.id === id);
  if (!item) return { name: 'bike-lease', params: { id } };
  if (item.kind === 'pension')  return { name: 'pension-detail', params: { id } };
  if (item.kind === 'coolblue') return { name: 'coolblue-order',  params: { id } };
  if (item.kind === 'housing')  return { name: 'housing-costs',    params: {} };
  return { name: 'bike-lease', params: { id } };
}
function navigateToItem(push, id) {
  const r = routeForItem(id);
  push(r.name, r.params);
}

// ─────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────

// Compact gray-pill row used for ACTIVE benefits (per design).
// Also used for drafts — pass `showStatus` to display rejection/draft badges.
function ActivePillRow({ item, onClick }) {
  const iconName = KIND_ICON[item.kind] || 'House';
  const hasStatus = item.status && item.status.text;
  return (
    <button onClick={onClick} style={{
      width: '100%', appearance: 'none', textAlign: 'left', cursor: 'pointer',
      background: '#F4F4F6', border: 'none',
      borderRadius: 16, padding: 0, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
        <LucideIcon name={iconName} size={28} color={PFC.purple} strokeWidth={1.75} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Body14 color={PFC.inkSoft} weight={500}>{item.provider}</Body14>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 16, lineHeight: '24px', letterSpacing: '-0.003em',
            color: PFC.ink,
          }}>{item.name}</span>
          <Body14 color={PFC.inkSoft} weight={500}>{item.meta}</Body14>
        </div>
      </div>
      {hasStatus && (
        <div style={{
          borderTop: `1px solid ${item.status.kind === 'alert' ? 'rgba(143,20,20,0.12)' : PFC.border}`,
          padding: '10px 20px',
          display: 'flex', alignItems: 'center',
          background: item.status.kind === 'alert' ? 'rgba(255,235,235,0.6)' : 'transparent',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, lineHeight: '18px',
            color: item.status.kind === 'alert' ? 'rgb(143,20,20)' : PFC.inkSoft,
          }}>{item.status.text}</span>
        </div>
      )}
    </button>
  );
}

// Tax-score pills (3 ascending dots + label, heart bubble + percent).
function TaxScoreDots({ level = 1 }) {
  // level 0=Neutral, 1=Good, 2=Great, 3=Excellent — bigger / fuller dots as it grows.
  const base = [{ h: 7 }, { h: 10 }, { h: 13 }];
  const scale = 1;
  const opacities = level === 3 ? [1, 1, 1] : level === 2 ? [0.55, 0.85, 1] : level === 1 ? [0.35, 0.65, 1] : [0.2, 0.2, 0.2];
  const dotColor = level === 0 ? PFC.inkSoft : PFC.purple;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 2 }}>
      {base.map((d, i) => (
        <span key={i} style={{
          width: 4.6, height: d.h * scale, borderRadius: 999,
          background: dotColor, opacity: opacities[i], flex: 'none',
        }} />
      ))}
    </span>
  );
}
function TaxScoreRow({ score }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <TaxScoreDots level={score.level} />
        <Body14 color={PFC.textBody} weight={500}>{score.label}</Body14>
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 7.3a5.3 5.3 0 1 1 2.6 4.55L2.5 13l.6-2.6A5.3 5.3 0 0 1 2 7.3Z"
            fill={PFC.purpleSoft} stroke={PFC.purpleSoft} strokeWidth="1.2" strokeLinejoin="round"/>
          <path d="M8 9.7c-.7-.6-2-1.3-2-2.5a1.1 1.1 0 0 1 2-.7 1.1 1.1 0 0 1 2 .7c0 1.2-1.3 1.9-2 2.5Z"
            fill={PFC.purple}/>
        </svg>
        <Body14 color={PFC.textBody} weight={500}>{score.pct}% chose this</Body14>
      </span>
    </div>
  );
}

// Big white "Discover" card for a catalog benefit.
function DiscoverHighlightCard({ item, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', appearance: 'none', textAlign: 'left', cursor: 'pointer',
      background: '#fff', border: `1px solid ${PFC.border}`,
      borderRadius: 16, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
        <IconTile name={item.icon} size={49} iconSize={24} />
        {badge && (
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
            lineHeight: '16px', letterSpacing: '0.005em',
            background: badge === 'Draft' ? PFC.warnBg : badge === 'In review' ? '#F7F7F8' : PFC.purpleTile,
            color: badge === 'Draft' ? PFC.warnText : badge === 'In review' ? PFC.inkSoft : PFC.inkDarker,
            border: `1px solid ${badge === 'Draft' ? PFC.warnBorder : badge === 'In review' ? PFC.border : 'rgba(139,55,235,0.2)'}`,
            borderRadius: 999, padding: '2px 10px', whiteSpace: 'nowrap',
          }}>{badge}</span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 20, lineHeight: '28px', letterSpacing: '-0.003em',
          color: PFC.ink,
        }}>{item.name}</span>
        <Body14 color={PFC.ink} weight={500} style={{ letterSpacing: 0 }}>
          {item.description}
        </Body14>
        {item.becauseOf && (
          <span style={{
            marginTop: 4, fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 12, lineHeight: '16px', letterSpacing: '0.005em',
            color: PFC.purple, textTransform: 'uppercase',
          }}>
            Because you have {item.becauseOf}
          </span>
        )}
      </div>
      {item.score && <TaxScoreRow score={item.score} />}
    </button>
  );
}

// Top-of-page stat card — matches the home to-do card pattern
// (IconTile + title + subtitle + count pill / chevron).
function BenefitStatCard({ title, count, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, appearance: 'none', textAlign: 'left', cursor: 'pointer',
      background: '#F7F7F8', border: 'none',
      borderRadius: 16, padding: '16px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 600,
          fontSize: 14, lineHeight: '20px',
          color: PFC.inkSoft,
        }}>{title}</span>
        <LucideIcon name="ChevronRight" size={18} color={PFC.inkSoft} strokeWidth={2} />
      </div>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 32, lineHeight: '40px', letterSpacing: '-0.01em',
        color: PFC.inkDeep,
      }}>{count}</span>
    </button>
  );
}

// Card used for DRAFT benefits — same as before.
function BenefitListCard({ item, onClick }) {
  const iconName = KIND_ICON[item.kind] || 'House';
  return (
    <button onClick={onClick} style={{
      width: '100%', appearance: 'none', textAlign: 'left',
      background: '#fff', border: `1px solid ${PFC.border}`,
      borderRadius: 16, padding: '20px 16px',
      cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <Body14 color={PFC.inkSoft} weight={500}>{item.provider}</Body14>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <IconTile name={iconName} size={40} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Body16 color={PFC.ink} weight={500}>{item.name}</Body16>
          <Body14 color={PFC.inkSoft} weight={500}>{item.meta}</Body14>
        </div>
      </div>
      {item.status && (
        <StatusBadge kind={item.status.kind} icon={item.status.kind === 'alert' ? 'TriangleAlert' : 'Hourglass'}>
          {item.status.text}
        </StatusBadge>
      )}
    </button>
  );
}

// Helper: determine badge for a catalog item based on drafts/active benefits.
function getBenefitBadge(catalogItem) {
  const isDraft = DRAFTS.some(d => d.kind === catalogItem.kind);
  const isActive = ACTIVE_BENEFITS.some(a => a.kind === catalogItem.kind);
  if (catalogItem.kind === 'coolblue') return null;
  if (catalogItem.kind === 'pension' && window.__pensionNewSubmitted) return 'In review';
  if (isDraft) return 'Draft';
  if (isActive) return 'Already chosen';
  return null;
}

// ─────────────────────────────────────────────────────────────
// Benefits root
// ─────────────────────────────────────────────────────────────
function BenefitsScreen() {
  const { push } = useNav();
  const [filter, setFilter] = React.useState(() => {
    const f = window.__benefitsFilter || null;
    window.__benefitsFilter = null;
    return f;
  });
  const discoverItems = filter
    ? CATALOG.filter(c => c.budgets && c.budgets.includes(filter))
    : CATALOG;
  return (
    <div style={{
      padding: '8px 16px 24px',
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      <Heading28>Benefits</Heading28>

      {/* Two stat cards side by side */}
      <div style={{ display: 'flex', gap: 8 }}>
        <BenefitStatCard
          title="Benefits in draft"
          count={DRAFTS.filter(d => !(window.__deletedDrafts || []).includes(d.id)).length}
          onClick={() => push('benefits-in-draft')}
        />
        <BenefitStatCard
          title="My benefits"
          count={ACTIVE_BENEFITS.length}
          onClick={() => push('my-active-benefits')}
        />
      </div>

      {/* Discover — full white cards with tax score */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SectionHeader title="Discover" />
        <div style={{ position: 'sticky', top: 0, zIndex: 5, background: '#fff', margin: '0 -16px', padding: '8px 16px 8px' }}>
          <div className="discover-filters" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <style>{`.discover-filters::-webkit-scrollbar { display: none; }`}</style>
          {[
            { key: 'end-of-year', label: 'End of year premium' },
            { key: 'bonus', label: 'Bonus' },
            { key: 'mobility', label: 'Mobility' },
          ].map(f => {
            const count = CATALOG.filter(c => c.budgets && c.budgets.includes(f.key)).length;
            return (
              <FilterPill key={f.key} label={`${f.label} (${count})`} active={filter === f.key}
                onClick={() => setFilter(fl => fl === f.key ? null : f.key)} />
            );
          })}
          </div>
        </div>

        {(!filter || filter === 'mobility') && <button
          onClick={() => push('bike-lease', { id: 'bike-active' })}
          aria-label="Discover bikes"
          style={{
            display: 'block', width: '100%', padding: 0,
            border: 'none', background: 'transparent', cursor: 'pointer',
            borderRadius: 16, overflow: 'hidden',
          }}>
          <img src="assets/biking-season.png" alt=""
            style={{ display: 'block', width: '100%', height: 'auto' }} />
        </button>}
        {discoverItems.length === 0
          ? (
            <div style={{
              padding: '24px 16px', textAlign: 'center',
              background: PFC.bgInactive, borderRadius: 16,
            }}>
              <Body14 color={PFC.inkSoft} weight={500}>
                No benefits available for this budget.
              </Body14>
            </div>
          )
          : discoverItems.map(c => (
            <DiscoverHighlightCard key={c.id} item={c}
              badge={getBenefitBadge(c)}
              onClick={() => c.route && push(...c.route)} />
          ))
        }
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Benefits in draft (list)
// ─────────────────────────────────────────────────────────────
function BenefitsInDraftScreen() {
  const { push, switchTab } = useNav();
  const visibleDrafts = DRAFTS.filter(d => !(window.__deletedDrafts || []).includes(d.id));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <NavBar />
      <div style={{ flex: 1, padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Heading28>Benefits in draft</Heading28>
        {visibleDrafts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {visibleDrafts.map(b => (
              <ActivePillRow key={b.id} item={b} onClick={() => navigateToItem(push, b.id)} />
            ))}
          </div>
        ) : (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', gap: 16, padding: '40px 24px',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LucideIcon name="CheckCircle" size={32} color={PFC.purple} strokeWidth={1.5} />
            </div>
            <Heading20>All caught up</Heading20>
            <Body14 color={PFC.inkSoft}>You have no benefits in draft. Browse the catalog to discover new benefits.</Body14>
            <div style={{ marginTop: 8 }}>
              <Button variant="primary" size="large" onClick={() => switchTab('benefits')}>Discover benefits</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// My active benefits (list)
// ─────────────────────────────────────────────────────────────
function MyActiveBenefitsScreen() {
  const { push } = useNav();
  const [filter, setFilter] = React.useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Heading28>My active benefits</Heading28>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -16px', padding: '4px 16px' }}>
          <FilterPill label="Bonus" active={filter === 'bonus'} onClick={() => setFilter(f => f === 'bonus' ? null : 'bonus')} />
          <FilterPill label="End of year premium" active={filter === 'eoy'} onClick={() => setFilter(f => f === 'eoy' ? null : 'eoy')} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {ACTIVE_BENEFITS.map(b => (
            <ActivePillRow key={b.id} item={b} onClick={() => navigateToItem(push, b.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Status timeline — vertical pink gradient bar + steps. Used on every
// ACTIVE benefit detail so the user sees where in the lifecycle they are.
// ─────────────────────────────────────────────────────────────
function StatusTimeline({ steps, currentIndex = 0 }) {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{
        width: 12, marginRight: 24,
        background: 'linear-gradient(rgb(234,169,254) 0%, rgba(189,169,254,0.1) 100%)',
        borderRadius: 12,
        alignSelf: 'stretch',
        position: 'relative',
      }}>
        {/* current-step indicator dot — only shown when an active step exists */}
        {currentIndex >= 0 && (
          <span style={{
            position: 'absolute', left: 2,
            top: `calc(${(currentIndex + 0.5) * (100 / steps.length)}% - 6px)`,
            width: 8, height: 8, borderRadius: 999,
            background: '#fff',
            boxShadow: `0 0 0 2px ${PFC.purple}`,
          }} />
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 28 }}>
        {steps.map((s, i) => {
          const isCurrent = currentIndex >= 0 && i === currentIndex;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: isCurrent ? 700 : 500, fontSize: 16, lineHeight: '24px',
                color: isCurrent ? PFC.ink : PFC.inkSoft,
              }}>{s.title}</span>
              <Body14 color={PFC.inkSoft} weight={500}>{s.meta}</Body14>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Payflip-advantage block (big purple number).
function PayflipAdvantageBlock({ value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Body14 color={PFC.inkSoft} weight={700}
        style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        EST. PAYFLIP ADVANTAGE
      </Body14>
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 40, lineHeight: '48px', letterSpacing: '-0.01em',
        color: PFC.purple,
      }}>{value}</span>
      <button style={{
        background: 'transparent', border: 'none', padding: 0,
        cursor: 'pointer', textAlign: 'left',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
        color: PFC.inkSoft, textDecoration: 'underline', marginTop: 4,
      }}>How is this calculated?</button>
    </div>
  );
}

// One key/value row in the Details section.
function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Body14 color={PFC.inkSoft} weight={500}>{label}</Body14>
      <Body16 color={PFC.ink} weight={700}>{value}</Body16>
    </div>
  );
}

// Lifecycle option ("After 36 months you can…")
function LifecycleOption({ icon, title, body }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <LucideIcon name={icon} size={22} color={PFC.ink} strokeWidth={1.75} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Body16 color={PFC.ink} weight={700}>{title}</Body16>
        <Body14 color={PFC.inkSoft} weight={500}>{body}</Body14>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Bike lease detail (matches the figma reference)
// ─────────────────────────────────────────────────────────────
const BIKE_TIMELINE = [
  { title: 'Choice submitted',  meta: '12/03' },
  { title: 'Admin reviews',     meta: 'Approves or rejects' },
  { title: 'Sign lease contract', meta: 'After employer approval' },
  { title: 'Bike ordered',      meta: 'After contract signing' },
  { title: 'Pick up your bike!',meta: 'Your dealer will contact you' },
];

function BikeLeaseScreen({ id }) {
  const { pop } = useNav();
  const draft = DRAFTS.find(b => b.id === id);
  const active = ACTIVE_BENEFITS.find(b => b.id === id);
  const item = draft || active || ACTIVE_BENEFITS[0];
  const isDraft = !!draft;
  const [agreed, setAgreed] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const WHAT_HAPPENS = [
    { title: 'Choice submitted',    meta: 'After this step' },
    { title: 'Admin reviews',       meta: 'Approves or rejects' },
    { title: 'Sign lease contract', meta: 'After employer approval' },
    { title: 'Bike ordered',        meta: 'After contract signing' },
    { title: 'Pick up your bike!',  meta: 'Your dealer will contact you' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', height: '100%', overflow: showDeleteConfirm ? 'hidden' : undefined }}>
      <NavBar trailing={isDraft ? (
        <button style={{
          background: 'transparent', border: 'none', padding: '6px 0',
          cursor: 'pointer', whiteSpace: 'nowrap',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
          color: PFC.errorText,
        }} onClick={() => setShowDeleteConfirm(true)}>Delete choice</button>
      ) : undefined} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 32, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Heading28>Bike lease</Heading28>

        {isDraft ? (
          /* ── DRAFT LAYOUT ── */
          <>
            {/* Review section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Heading20>Review</Heading20>

              {/* Bike row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Body14 color={PFC.inkSoft} weight={500}>Bike</Body14>
                <Body16 color={PFC.ink} weight={700}>{item.name}</Body16>
                <Body14 color={PFC.inkSoft} weight={500}>E-bike · High step · 36 months</Body14>
              </div>

              <div style={{ height: 1, background: PFC.border }} />

              {/* Budget row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Body14 color={PFC.inkSoft} weight={500}>Budget</Body14>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Body16 color={PFC.ink} weight={700}>End of year premium</Body16>
                  <Body16 color={PFC.ink} weight={700}>€1.956,96/year</Body16>
                </div>
                <Body14 color={PFC.inkSoft} weight={500}>First year pro rata based on bike delivery date.</Body14>
              </div>

              <div style={{ height: 1, background: PFC.border }} />

              {/* Total budget impact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Body16 color={PFC.ink} weight={700}>Total budget impact</Body16>
                  <Body16 color={PFC.ink} weight={700}>€5.870,88</Body16>
                </div>
                <Body14 color={PFC.inkSoft} weight={500}>36 months</Body14>
              </div>

              {/* Edit button */}
              <Button variant="outline" fullWidth>Edit</Button>

              {/* View quote link */}
              <button style={{
                background: 'transparent', border: 'none', padding: 0,
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
                color: PFC.ink, textDecoration: 'underline',
                display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
              }}>
                View quote in Joule
                <LucideIcon name="ArrowUpRight" size={16} color={PFC.ink} strokeWidth={2} />
              </button>
            </div>

            <div style={{ height: 1, background: PFC.border }} />

            {/* Payflip advantage */}
            <PayflipAdvantageBlock value="€548" />

            <div style={{ height: 1, background: PFC.border }} />

            {/* Lifecycle options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Heading20>After 36 months, you can</Heading20>
              <LifecycleOption icon="ShoppingCart" title="Buy at residual value" body="~16% of original price" />
              <LifecycleOption icon="Undo2" title="Return the bike" body="Hand it back at no extra cost" />
              <LifecycleOption icon="Bike" title="Start a new lease" body="Pick a new bike and begin a fresh 36-month lease" />
            </div>

            <div style={{ height: 1, background: PFC.border }} />

            {/* What happens after you confirm */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Heading20>What happens after you confirm?</Heading20>
              <Body14 color={PFC.inkSoft} weight={500} style={{ lineHeight: '22px' }}>
                After confirmation, your admin will review it. After approval, you'll be asked to sign the lease contract. That's the moment your bike will be ordered. Your bike dealer will contact you for delivery when your bike is ready.
              </Body14>
            </div>

            <div style={{ height: 1, background: PFC.border }} />

          </>
        ) : (
          /* ── ACTIVE LAYOUT ── */
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Heading20>Status</Heading20>
              <StatusTimeline steps={BIKE_TIMELINE} currentIndex={3} />
            </div>

            <div style={{ height: 1, background: PFC.border }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Heading20>Details</Heading20>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <DetailRow label="Bike" value={item.name} />
                <DetailRow label="Annual deduction" value="€1.956,96, first year pro rata" />
                <DetailRow label="Budget" value="End of year premium" />
                <DetailRow label="Total over 36 months" value="€5.870,88" />
              </div>
              <button style={{
                background: 'transparent', border: 'none', padding: 0,
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
                color: PFC.ink, textDecoration: 'underline',
                display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
              }}>
                View quote in Joule
                <LucideIcon name="ArrowUpRight" size={16} color={PFC.ink} strokeWidth={2} />
              </button>
            </div>

            <div style={{ height: 1, background: PFC.border }} />

            <PayflipAdvantageBlock value="€4.248" />

            <div style={{ height: 1, background: PFC.border }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Heading20>After 36 months, you can</Heading20>
              <LifecycleOption icon="ShoppingCart" title="Buy at residual value" body="~16% of original price" />
              <LifecycleOption icon="Undo2" title="Return the bike" body="Hand it back at no extra cost" />
              <LifecycleOption icon="Bike" title="Start a new lease" body="Pick a new bike and begin a fresh 36-month lease" />
            </div>
          </>
        )}
      </div>

      {/* Fixed footer — T&C + Submit */}
      {isDraft && (
        <div style={{
          flexShrink: 0,
          background: '#fff',
          borderTop: `1px solid ${PFC.border}`,
          padding: '12px 16px 24px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: 20, height: 20, marginTop: 2, accentColor: PFC.inkDarker, flex: 'none' }} />
            <Body14 color={PFC.ink} weight={500}>
              I agree to the <a href="#" onClick={(e) => e.preventDefault()} style={{ color: PFC.ink, textDecoration: 'underline' }}>Terms &amp; Conditions</a>
            </Body14>
          </label>
          <Button variant="primary" size="large" fullWidth
            disabled={!agreed || submitted}
            onClick={() => { setSubmitted(true); window.__deletedDrafts = (window.__deletedDrafts || []); window.__deletedDrafts.push(id); setTimeout(pop, 800); }}>
            {submitted ? '✓ Submitted' : 'Submit'}
          </Button>
        </div>
      )}

      {showDeleteConfirm && <div style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24,
      }} onClick={() => setShowDeleteConfirm(false)}>
        <div onClick={e => e.stopPropagation()} style={{
          background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 320,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <Heading20>Delete this choice?</Heading20>
          <Body14 color={PFC.inkSoft}>This will remove your draft and free up the budget. You can always start a new choice later.</Body14>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <Button variant="primary" size="large" fullWidth onClick={() => { window.__deletedDrafts = (window.__deletedDrafts || []); window.__deletedDrafts.push(id); pop(); }}
              style={{ background: PFC.errorText, borderColor: PFC.errorText }}>Delete</Button>
            <Button variant="ghost" size="large" fullWidth onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          </div>
        </div>
      </div>}
    </div>
  );
}
// Empty placeholder for unchosen benefits — will become a multi-step flow.
function BenefitFlowStartScreen({ name = 'Benefit' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Heading28>{name}</Heading28>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pension savings — review / rejected detail (matches bike lease draft layout)
// ─────────────────────────────────────────────────────────────
function PensionDetailScreen({ id }) {
  const { push, pop, switchTab } = useNav();
  const item = DRAFTS.find(b => b.id === id) || ACTIVE_BENEFITS.find(b => b.id === id);
  const isRejected = item && item.status && item.status.kind === 'alert';
  const [agreed, setAgreed] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: showDeleteConfirm ? 'hidden' : undefined }}>
      <NavBar trailing={
        <button style={{
          background: 'transparent', border: 'none', padding: '6px 0',
          cursor: 'pointer', whiteSpace: 'nowrap',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
          color: PFC.errorText,
        }} onClick={() => setShowDeleteConfirm(true)}>Delete choice</button>
      } />
      <div style={{ flex: 1, minHeight: 0, overflowY: showDeleteConfirm ? 'hidden' : 'auto', padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <Heading28>Pension savings</Heading28>

        {/* Rejection banner */}
        {isRejected && (
          <div style={{
            background: '#FFF0F0', border: '1px solid #F8B4B4',
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <LucideIcon name="MessageSquareWarning" size={18} color="#9F1B1F" strokeWidth={2} style={{ flex: 'none', marginTop: 2 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Body14 color="#9F1B1F" weight={700}>Rejection reason</Body14>
              <Body14 color="#9F1B1F" weight={500}>Amount is higher than mortgage on document</Body14>
            </div>
          </div>
        )}

        {/* Review section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Heading20>Review</Heading20>

          {/* Provider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Body14 color={PFC.inkSoft} weight={500}>Provider</Body14>
            <Body16 color={PFC.ink} weight={700}>AG Insurance</Body16>
            <Body14 color={PFC.inkSoft} weight={500}>Individual pension savings · Reimbursement</Body14>
          </div>

          <div style={{ height: 1, background: PFC.border }} />

          {/* Budget row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Body14 color={PFC.inkSoft} weight={500}>Budget</Body14>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Body16 color={PFC.ink} weight={700}>End of year premium</Body16>
              <Body16 color={PFC.ink} weight={700}>€3.500/year</Body16>
            </div>
            <Body14 color={PFC.inkSoft} weight={500}>Based on your fiscal attest 281.60.</Body14>
          </div>

          <div style={{ height: 1, background: PFC.border }} />

          {/* Total budget impact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Body16 color={PFC.ink} weight={700}>Total budget impact</Body16>
              <Body16 color={PFC.ink} weight={700}>€980</Body16>
            </div>
            <Body14 color={PFC.inkSoft} weight={500}>Once a year</Body14>
          </div>

          {/* Edit button */}
          <Button variant="outline" fullWidth
            onClick={() => push('edit-active-benefit', { id: item ? item.id : 'pension-1' })}>
            Edit
          </Button>

          {/* View document link */}
          <button style={{
            background: 'transparent', border: 'none', padding: 0,
            cursor: 'pointer', textAlign: 'left',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
            color: PFC.ink, textDecoration: 'underline',
            display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
          }}>
            View fiscal attest
            <LucideIcon name="ArrowUpRight" size={16} color={PFC.ink} strokeWidth={2} />
          </button>
        </div>

        <div style={{ height: 1, background: PFC.border }} />

        {/* Payflip advantage */}
        <PayflipAdvantageBlock value="€548" />

        <div style={{ height: 1, background: PFC.border }} />

        {/* What happens after you confirm */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Heading20>What happens after you confirm?</Heading20>
          <Body14 color={PFC.inkSoft} weight={500} style={{ lineHeight: '22px' }}>
            After confirmation, your admin will review your request. Once approved, AG Insurance validates your fiscal attest. The reimbursement is then processed on your next payslip.
          </Body14>
        </div>

      </div>

      {/* Sticky bottom: T&C + Submit */}
      <div style={{
        flexShrink: 0, background: '#fff',
        borderTop: `1px solid ${PFC.border}`,
        padding: '12px 16px 24px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
            style={{ width: 20, height: 20, marginTop: 2, accentColor: PFC.inkDarker, flex: 'none' }} />
          <Body14 color={PFC.ink} weight={500}>
            I agree to the <a href="#" onClick={(e) => e.preventDefault()} style={{ color: PFC.ink, textDecoration: 'underline' }}>Terms &amp; Conditions</a>
          </Body14>
        </label>
        <Button variant="primary" size="large" fullWidth
          disabled={!agreed || submitted}
          onClick={() => {
            setSubmitted(true);
            window.__pensionResubmitted = true;
            setTimeout(() => switchTab('home'), 800);
          }}>
          {submitted ? '✓ Submitted' : 'Submit'}
        </Button>
      </div>

      {showDeleteConfirm && <div style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24,
      }} onClick={() => setShowDeleteConfirm(false)}>
        <div onClick={e => e.stopPropagation()} style={{
          background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 320,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <Heading20>Delete this choice?</Heading20>
          <Body14 color={PFC.inkSoft}>This will remove your draft and free up the budget. You can always start a new choice later.</Body14>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            <Button variant="primary" size="large" fullWidth onClick={() => { window.__deletedDrafts = (window.__deletedDrafts || []); window.__deletedDrafts.push(id); pop(); }}
              style={{ background: PFC.errorText, borderColor: PFC.errorText }}>Delete</Button>
            <Button variant="ghost" size="large" fullWidth onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          </div>
        </div>
      </div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Coolblue / iPhone detail — matches the bike-lease template.
// ─────────────────────────────────────────────────────────────
const PHONE_TIMELINE = [
  { title: 'Order placed',  meta: '12/11' },
  { title: 'Confirmed',     meta: 'Coolblue confirmed your order' },
  { title: 'Shipped',       meta: 'Out for delivery 13/11' },
  { title: 'Delivered',     meta: 'Delivered on 12/11' },
  { title: 'Renew or trade-in', meta: '24 months from delivery' },
];

function CoolblueOrderScreen({ id }) {
  const item = ACTIVE_BENEFITS.find(b => b.id === id) || ACTIVE_BENEFITS.find(b => b.kind === 'coolblue');
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <Heading28>Multimedia</Heading28>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Heading20>Status</Heading20>
          <StatusTimeline steps={PHONE_TIMELINE} currentIndex={3} />
        </div>

        <div style={{ height: 1, background: PFC.border }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Heading20>Details</Heading20>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <DetailRow label="Product" value={item.name} />
            <DetailRow label="Order ID" value={item.orderId} />
            <DetailRow label="Order date" value={item.orderDate} />
            <DetailRow label="Delivered to" value="Rue de la Loi 16, 1000 Brussels" />
            <DetailRow label="Total cost" value="€890,00" />
            <DetailRow label="Budget" value="Multimedia" />
          </div>
          <button style={{
            background: 'transparent', border: 'none', padding: 0,
            cursor: 'pointer', textAlign: 'left',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
            color: PFC.ink, textDecoration: 'underline',
            display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
          }}>
            View order on Coolblue
            <LucideIcon name="ArrowUpRight" size={16} color={PFC.ink} strokeWidth={2} />
          </button>
        </div>

        <div style={{ height: 1, background: PFC.border }} />

        <PayflipAdvantageBlock value="€312" />

        <div style={{ height: 1, background: PFC.border }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Heading20>After 24 months, you can</Heading20>
          <LifecycleOption icon="Smartphone"
            title="Keep the device" body="You own it — no extra cost" />
          <LifecycleOption icon="RefreshCw"
            title="Trade in for a new device" body="Get credit toward your next Multimedia order" />
          <LifecycleOption icon="Undo2"
            title="Return the device" body="Hand it back to Coolblue" />
        </div>

        <div style={{ height: 1, background: PFC.border }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button variant="outline" size="large" fullWidth leftIcon="ExternalLink">
            Contact Coolblue support
          </Button>
          <Button variant="ghost" size="large" fullWidth leftIcon="Undo2">
            Start a return
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Edit active benefit — wizard for rejected pension, simple form for others
// ─────────────────────────────────────────────────────────────
function EditActiveBenefitScreen({ id, isNew = false }) {
  const { pop, switchTab, reset } = useNav();
  const item = ACTIVE_BENEFITS.find(b => b.id === id) || DRAFTS.find(b => b.id === id) || CATALOG.find(b => b.id === id);
  const isPension = item && item.kind === 'pension';

  // Step indices differ between flows:
  // isNew (from discover): 0=upload, 1=verify, 2=budget, 3=review, 4=success
  // !isNew (rejection edit): 0=verify, 1=budget, 2=review, 3=success
  const S = isNew
    ? { upload: 0, verify: 1, budget: 2, review: 3, success: 4 }
    : { upload: -1, verify: 0, budget: 1, review: 2, success: 3 };

  const [step, setStep] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const [uploaded, setUploaded] = React.useState(false);

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setUploaded(true); }, 1800);
  };
  const [amount, setAmount] = React.useState(isNew ? '1050' : '900');
  const [budget, setBudget] = React.useState('eoy');
  const [agreed, setAgreed] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Non-pension: simple form
  const [duration, setDuration] = React.useState('38');
  const [end, setEnd] = React.useState('01/2027');
  const [simpleSubmitted, setSimpleSubmitted] = React.useState(false);
  const simpleErrors = {
    duration: simpleSubmitted && (!duration || isNaN(+duration) || +duration < 12) ? 'Pick at least 12 months' : null,
    end: simpleSubmitted && !/^\d{2}\/\d{4}$/.test(end) ? 'Use MM/YYYY' : null,
  };
  const simpleValid = !Object.values(simpleErrors).some(Boolean);

  if (!isPension) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <NavBar />
        <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Heading28>Edit benefit</Heading28>
          <Body14 color={PFC.inkSoft} weight={500}>{item ? item.name : 'Benefit'}</Body14>
          <Field label="Lease duration (months)" type="number" value={duration} onChange={setDuration}
            suffix="MONTHS" error={simpleErrors.duration} />
          <Field label="Until" value={end} onChange={setEnd}
            placeholder="MM/YYYY" error={simpleErrors.end} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button variant="primary" size="large" fullWidth
              onClick={() => { setSimpleSubmitted(true); if (simpleValid) pop(); }}>
              Save
            </Button>
            <Button variant="ghost" size="large" fullWidth onClick={pop}>Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Pension wizard ──
  if (step === S.success) {
    // Success screen
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        background: '#fff',
        animation: 'fadeSlideIn 0.4s ease-out both',
      }}>
        <div style={{ padding: 16 }}>
          <button onClick={() => { reset('benefits'); switchTab('home'); }} style={{
            width: 36, height: 36, borderRadius: 999, border: `1px solid ${PFC.border}`,
            background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <LucideIcon name="X" size={18} color={PFC.ink} strokeWidth={2} />
          </button>
        </div>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 32px 80px', gap: 16,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 999,
            border: `2px solid ${PFC.successText}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'popIn 0.5s ease-out 0.15s both',
          }}>
            <LucideIcon name="Check" size={24} color={PFC.successText} strokeWidth={2.5} />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 22, lineHeight: '30px', letterSpacing: '-0.005em',
            color: PFC.inkDeep, textAlign: 'center',
            animation: 'fadeSlideIn 0.4s ease-out 0.25s both',
          }}>{isNew ? 'Choice submitted!' : 'Choice resubmitted!'}</span>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 500,
            fontSize: 15, lineHeight: '22px', color: PFC.inkSoft,
            textAlign: 'center', maxWidth: 280,
            animation: 'fadeSlideIn 0.4s ease-out 0.35s both',
          }}>{isNew ? 'Your pension savings choice is being reviewed. We\'ll notify you once it\'s approved.' : 'Your pension savings choice is being reviewed again. We\'ll notify you once it\'s approved.'}</span>
          <div style={{ width: '100%', marginTop: 16, animation: 'fadeSlideIn 0.4s ease-out 0.45s both' }}>
            <Button variant="primary" size="large" fullWidth onClick={() => { reset('benefits'); switchTab('home'); }}>Back to home</Button>
          </div>
        </div>
        <style>{`
          @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes popIn {
            0%   { opacity: 0; transform: scale(0.5); }
            60%  { transform: scale(1.12); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  const wizSteps = isNew
    ? [
        { label: 'Upload', n: 1, total: 4 },
        { label: 'Verify', n: 2, total: 4 },
        { label: 'Budget', n: 3, total: 4 },
        { label: 'Review', n: 4, total: 4 },
      ]
    : [
        { label: 'Verify', n: 2, total: 4 },
        { label: 'Budget', n: 3, total: 4 },
        { label: 'Review', n: 4, total: 4 },
      ];
  const cur = wizSteps[step];
  const progressPct = (cur.n / cur.total) * 100;
  const budgetImpact = +amount > 0 && !isNaN(+amount) ? Math.round(+amount * 1.0886) : 0;
  const advantage = +amount > 0 && !isNaN(+amount) ? Math.round(+amount * 0.128) : 0;
  const employerCost = Math.round(+amount * 0.0886);
  const totalFund = +amount + employerCost;
  const netPayslip = Math.round(+amount * 0.67);

  const BUDGET_OPTIONS = [
    { id: 'eoy', name: 'End of year premium', available: 3500, recommended: true },
    { id: 'bonus', name: 'Bonus', available: 322.34 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <NavBar onBack={step === 0 ? pop : () => setStep(step - 1)} />

      {/* Step indicator + progress */}
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Body14 color={PFC.ink} weight={600}>Step {cur.n} of {cur.total} · {cur.label}</Body14>
        <div style={{ height: 3, background: PFC.border, borderRadius: 2 }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: PFC.purple,
            width: `${progressPct}%`,
            transition: 'width 300ms ease-out',
          }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>

        {/* Step: Upload fiscal attest (isNew only) */}
        {step === S.upload && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Heading28>Upload 281.60 fiscal attest</Heading28>
            <Body16 color={PFC.inkSoft} weight={400} style={{ lineHeight: '24px' }}>
              Your insurer issues attest 281.61 each APRIL. We'll read your contribution amount from it automatically.
            </Body16>
            <button style={{
              background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
              color: PFC.ink, textDecoration: 'underline', textAlign: 'left',
            }}>How do I find my fiscal attest?</button>
            {!uploaded ? (
              uploading ? (
                <div style={{
                  background: '#F7F7F8', border: `1.5px dashed ${PFC.border}`,
                  borderRadius: 16, padding: '28px 20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                }}>
                  <LucideIcon name="UploadCloud" size={28} color={PFC.purple} strokeWidth={1.75} />
                  <Body14 color={PFC.inkSoft} weight={500}>Uploading fiscal-attest-281.60.pdf…</Body14>
                  <div style={{ width: '100%', height: 4, background: PFC.border, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', background: PFC.purple, borderRadius: 2,
                      animation: 'uploadProgress 1.6s ease-out forwards',
                    }} />
                  </div>
                </div>
              ) : (
              <button
                onClick={handleUpload}
                style={{
                  width: '100%', appearance: 'none', cursor: 'pointer',
                  background: '#F7F7F8',
                  border: `1.5px dashed ${PFC.border}`,
                  borderRadius: 16, padding: '32px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                }}>
                <LucideIcon name="UploadCloud" size={28} color={PFC.inkSoft} strokeWidth={1.75} />
                <Body14 color={PFC.ink} weight={400}>
                  Drag and drop file here or <strong style={{ fontWeight: 700 }}>choose file</strong> to upload
                </Body14>
              </button>)
            ) : (
              <div style={{
                border: `1px solid ${PFC.border}`, borderRadius: 16, overflow: 'hidden',
                animation: 'uploadSlideIn 0.3s ease-out both',
              }}>
                <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ animation: 'popIn 0.4s ease-out 0.1s both' }}>
                    <LucideIcon name="FileCheck" size={24} color="rgb(34,139,34)" strokeWidth={1.75} />
                  </div>
                  <Body14 color={PFC.ink} weight={600} style={{ flex: 1 }}>fiscal-attest-281.60.pdf</Body14>
                </div>
                <div style={{ borderTop: `1px solid ${PFC.border}` }}>
                  <button onClick={() => { setUploaded(false); setUploading(false); }} style={{
                    width: '100%', appearance: 'none', background: 'transparent', border: 'none',
                    padding: '12px', cursor: 'pointer',
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                    color: PFC.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <LucideIcon name="RefreshCw" size={14} color={PFC.ink} strokeWidth={2} />
                    Change file
                  </button>
                </div>
              </div>
            )}
            <style>{`
              @keyframes uploadSlideIn {
                from { opacity: 0; transform: translateY(8px) scale(0.98); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes uploadProgress {
                from { width: 0%; }
                to   { width: 100%; }
              }
            `}</style>
          </div>
        )}

        {/* Step: Verify amount */}
        {step === S.verify && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Heading28>Verify amount</Heading28>
            <Body16 color={PFC.inkSoft} weight={500}>
              We read this amount from your document. Change it if you'd like to claim less.
            </Body16>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              border: `1px solid ${PFC.border}`, borderRadius: 12,
              padding: '12px 16px',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: PFC.ink,
              }}>€</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18, color: PFC.ink,
                }} />
            </div>
          </div>
        )}

        {/* Step: Choose budget */}
        {step === S.budget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Heading28>Choose budget</Heading28>
            <Body16 color={PFC.inkSoft} weight={500}>How would you like to fund this benefit?</Body16>

<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Body16 color={PFC.ink} weight={700}>Fund €{totalFund.toLocaleString('nl-BE')} from your budgets</Body16>
              <Body14 color={PFC.inkSoft} weight={500}>€{(+amount).toLocaleString('nl-BE')} contribution + €{employerCost} employer cost (8.86%)</Body14>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {BUDGET_OPTIONS.map(b => {
                const selected = budget === b.id;
                return (
                  <button key={b.id} onClick={() => setBudget(b.id)} style={{
                    width: '100%', appearance: 'none', textAlign: 'left', cursor: 'pointer',
                    background: selected ? '#FFF0F3' : '#fff',
                    border: `1.5px solid ${selected ? '#D6245E' : PFC.border}`,
                    borderRadius: 12, padding: '16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 999, flex: 'none',
                      border: `2px solid ${selected ? '#D6245E' : PFC.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {selected && <div style={{ width: 10, height: 10, borderRadius: 999, background: '#D6245E' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Body16 color={PFC.ink} weight={600}>{b.name}</Body16>
                        {b.recommended && (
                          <span style={{
                            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
                            color: PFC.successText, background: PFC.successBg,
                            borderRadius: 6, padding: '1px 8px',
                          }}>Recommended</span>
                        )}
                      </div>
                      <Body14 color={PFC.inkSoft} weight={500}>€ {b.available.toLocaleString('nl-BE')} available</Body14>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === S.review && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Heading28>Review</Heading28>
              <Body16 color={PFC.inkSoft} weight={500}>Review your choices before submitting.</Body16>
            </div>

            {/* Editable cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Fiscal attest — only for rejection edit flow */}
              {/* Fiscal attest — only for flows with upload step */}
              {isNew && <div style={{
                border: `1px solid ${PFC.border}`, borderRadius: 12, padding: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <Body14 color={PFC.inkSoft} weight={500}>Fiscal attest</Body14>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <LucideIcon name="FileText" size={14} color={PFC.ink} strokeWidth={2} />
                    <Body16 color={PFC.ink} weight={500}>fiscal-attest.pdf</Body16>
                  </div>
                </div>
                <button onClick={() => setStep(S.upload)} style={{
                  appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: PFC.ink,
                }}>Edit</button>
              </div>}

              {/* Amount */}
              <div style={{
                border: `1px solid ${PFC.border}`, borderRadius: 12, padding: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <Body14 color={PFC.inkSoft} weight={500}>Amount</Body14>
                  <div style={{ marginTop: 4 }}><Body16 color={PFC.ink} weight={700}>€{(+amount).toLocaleString('nl-BE')}</Body16></div>
                </div>
                <button onClick={() => setStep(S.verify)} style={{
                  appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: PFC.ink,
                }}>Edit</button>
              </div>

              {/* Budget */}
              <div style={{
                border: `1px solid ${PFC.border}`, borderRadius: 12, padding: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Body14 color={PFC.inkSoft} weight={500}>Budget · Funded from</Body14>
                  <Body16 color={PFC.ink} weight={700}>{budget === 'eoy' ? 'End of year premium' : 'Bonus'}</Body16>
                  <Body14 color={PFC.inkSoft} weight={500}>€{budgetImpact.toLocaleString('nl-BE')} used · €{Math.max(0, (budget === 'eoy' ? 3500 - budgetImpact : 322 - budgetImpact)).toLocaleString('nl-BE')} remaining</Body14>
                </div>
                <button onClick={() => setStep(S.budget)} style={{
                  appearance: 'none', background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: PFC.ink,
                }}>Edit</button>
              </div>
            </div>

            <div style={{ height: 1, background: PFC.border }} />

            {/* Payflip advantage */}
            <div style={{
              border: `1px solid ${PFC.border}`, borderRadius: 16, padding: '20px 16px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <Body14 color={PFC.purple} weight={700} style={{ textTransform: 'uppercase', letterSpacing: '0.03em', fontSize: 11 }}>
                ESTIMATED PAYFLIP ADVANTAGE
              </Body14>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, lineHeight: '36px',
                color: PFC.purple,
              }}>€{(advantage * 8).toLocaleString('nl-BE')}</div>
              <Body14 color={PFC.inkSoft} weight={500}>more in your pocket vs. taking this as a cash bonus</Body14>
              <button style={{
                appearance: 'none', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: PFC.ink,
                textDecoration: 'underline', alignSelf: 'flex-start', marginTop: 4,
              }}>See full calculation</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Body14 color={PFC.ink} weight={500}>Est net on payslip</Body14>
              <Body14 color={PFC.ink} weight={600}>~€{netPayslip.toLocaleString('nl-BE')}</Body14>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Body14 color={PFC.ink} weight={500}>Budget impact</Body14>
                <Body14 color={PFC.inkSoft} weight={500}>incl. 8.86% employer contribution</Body14>
              </div>
              <Body14 color={PFC.ink} weight={600}>~€{budgetImpact.toLocaleString('nl-BE')}</Body14>
            </div>

            <div style={{ height: 1, background: PFC.border }} />

            {/* What happens after */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Heading20>What happens after you confirm</Heading20>
              <StatusTimeline steps={[
                { title: 'Step completed', meta: 'Just now' },
                { title: 'Admin reviews tax certificate', meta: '' },
                { title: '~€' + netPayslip + ' added to your next salary', meta: 'On approval' },
              ]} currentIndex={0} />
            </div>

            <div style={{ height: 1, background: PFC.border }} />

            {/* T&C */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                style={{ width: 20, height: 20, marginTop: 2, accentColor: PFC.inkDarker, flex: 'none' }} />
              <Body14 color={PFC.ink} weight={500}>
                I agree to the <a href="#" onClick={(e) => e.preventDefault()} style={{ color: PFC.ink, textDecoration: 'underline' }}>Terms &amp; Conditions</a>
              </Body14>
            </label>

            <Button variant="primary" size="large" fullWidth
              disabled={!agreed || submitting || submitted}
              onClick={() => {
                setSubmitting(true);
                setTimeout(() => {
                  setSubmitting(false);
                  setSubmitted(true);
                  if (isNew) {
                    window.__pensionNewSubmitted = true;
                    window.__pensionNewChoice = {
                      amount: +amount,
                      budgetImpact,
                      budget: budget === 'eoy' ? 'End of year premium' : 'Bonus',
                      netPayslip,
                      advantage,
                      submittedOn: new Date().toLocaleDateString('en-GB').replace(/\//g, '/'),
                    };
                  } else window.__pensionResubmitted = true;
                  setStep(S.success);
                }, 1500);
              }}>
              {submitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block',
                    animation: 'cashSpin 0.7s linear infinite',
                  }} />
                  Submitting…
                </span>
              ) : submitted ? '✓ Done' : 'Submit'}
            </Button>
          </div>
        )}
      </div>

      {/* Sticky bottom — upload, verify, budget steps */}
      {step < S.review && (
        <div style={{
          flexShrink: 0, background: '#fff',
          borderTop: `1px solid ${PFC.border}`,
          padding: '12px 16px 24px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {step !== S.upload && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Body14 color={PFC.inkSoft} weight={500}>Budget impact</Body14>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: PFC.inkDeep }}>€{budgetImpact.toLocaleString('nl-BE')}</div>
                <Body14 color={PFC.purple} weight={600}>+ €{advantage} Payflip advantage</Body14>
              </div>
            </div>
          )}
          <Button variant="primary" size="large" fullWidth
            disabled={
              step === S.upload ? (!uploaded || uploading) :
              step === S.verify ? (!amount || +amount <= 0) :
              !budget
            }
            onClick={() => setStep(step + 1)}>
            Continue
          </Button>
          {step === S.upload && !uploaded && (
            <Body14 color={PFC.inkSoft} weight={500} style={{ textAlign: 'center' }}>Upload file to get started</Body14>
          )}
        </div>
      )}
    </div>
  );
}

// Register
// ─────────────────────────────────────────────────────────────
// Multimedia via Coolblue — sub-catalog of Coolblue benefits
// ─────────────────────────────────────────────────────────────
const COOLBLUE_ITEMS = [
  { id: 'cb-smartphone', icon: 'Smartphone', name: 'Smartphone', desc: 'Get a tax-friendly smartphone of your choice.', matchKind: 'coolblue' },
  { id: 'cb-smartphone-acc', icon: 'Headphones', name: 'Smartphone accessories', desc: 'Cases, chargers, earbuds and more for your phone.' },
  { id: 'cb-tablet', icon: 'Tablet', name: 'Tablet', desc: 'Choose a tablet and get it tax-free.' },
  { id: 'cb-tablet-acc', icon: 'Headphones', name: 'Tablet accessories', desc: 'Covers, keyboards, styluses and more.' },
  { id: 'cb-pc', icon: 'Monitor', name: 'PC / Laptop', desc: 'A tax-friendly PC or laptop for personal use.' },
  { id: 'cb-pc-acc', icon: 'Mouse', name: 'PC accessories', desc: 'Monitors, printers, headsets, mice and more.' },
  { id: 'cb-desk', icon: 'SquareStack', name: 'Desk', desc: 'A standing desk or regular desk for your home office.' },
  { id: 'cb-desk-chair', icon: 'Armchair', name: 'Desk chair', desc: 'An ergonomic desk chair for comfortable working.' },
  { id: 'cb-smartwatch', icon: 'Watch', name: 'Smartwatch', desc: 'Apple Watch, Garmin, Samsung and more.' },
];

function MultimediaCoolblueScreen() {
  const { push } = useNav();
  // Check which items are already active
  const activeNames = ACTIVE_BENEFITS.map(b => b.name.toLowerCase());
  const isChosen = (item) => {
    if (item.matchKind) return ACTIVE_BENEFITS.some(b => b.kind === item.matchKind);
    const n = item.name.toLowerCase();
    return activeNames.some(a => a.includes(n) || n.includes(a.split(' ')[0]));
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Heading28>Multimedia via Coolblue</Heading28>
          <Body14 color={PFC.inkSoft} weight={500}>Choose from a wide range of tech products — all tax-friendly via Coolblue.</Body14>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {COOLBLUE_ITEMS.map((item, i) => (
            <button key={item.id}
              onClick={() => push('benefit-flow-start', { name: item.name + ' via Coolblue' })}
              style={{
                width: '100%', appearance: 'none', background: '#fff',
                border: 'none', borderTop: i === 0 ? 'none' : `1px solid ${PFC.border}`,
                padding: '16px 0',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', textAlign: 'left',
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flex: 'none',
                background: '#F0F0F0',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LucideIcon name={item.icon} size={18} color={PFC.ink} strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Body16 color={PFC.ink} weight={700}>{item.name}</Body16>
                  {isChosen(item) && (
                    <span style={{
                      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
                      lineHeight: '16px', letterSpacing: '0.005em',
                      background: PFC.purpleTile, color: PFC.inkDarker,
                      border: '1px solid rgba(139,55,235,0.2)',
                      borderRadius: 999, padding: '2px 10px', whiteSpace: 'nowrap',
                    }}>Already chosen</span>
                  )}
                </div>
                <Body14 color={PFC.inkSoft} weight={500}>{item.desc}</Body14>
              </div>
              <LucideIcon name="ChevronRight" size={18} color={PFC.inkSoft} strokeWidth={2} style={{ flex: 'none' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pension savings intro/detail screen (from discover catalog)
// ─────────────────────────────────────────────────────────────
function PensionSavingsDetailScreen() {
  const { push, pop } = useNav();
  const [openFaq, setOpenFaq] = React.useState(0);
  const [showCalcSheet, setShowCalcSheet] = React.useState(false);

  const faqs = [
    {
      q: "I don't have pension savings yet. How do I start?",
      a: "Pension savings is a personal investment you set up directly with your bank or insurer (e.g. KBC, BNP Paribas Fortis, AG Insurance). You contribute up to €1,350/year. Once you've done that for at least one tax year, you'll receive a fiscal attest 281.60 and can claim this benefit here.",
    },
    { q: 'What about the 30% tax reduction from the government?', a: null },
    { q: 'Can I claim this more than once a year?', a: null },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <NavBar onBack={pop} />

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <IconTile name="House" size={56} iconSize={28} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Heading28>Pension savings</Heading28>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Body14 color={PFC.inkSoft} weight={600}>Reimbursement</Body14>
                <Body14 color={PFC.inkSoft} weight={500}>·</Body14>
                <Body14 color={PFC.inkSoft} weight={600}>Once a year</Body14>
              </div>
            </div>
            <Body16 color={PFC.ink} weight={400} style={{ lineHeight: '24px' }}>
              If you contributed to a pension savings plan last year through your bank or insurer, you can reclaim part of it here more efficiently than any cash payout.
            </Body16>
          </div>

          {/* Budget pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'End of year premium', value: '€3.500' },
              { label: 'Bonus', value: '€322,34' },
            ].map(pill => (
              <span key={pill.label} style={{
                border: `1px solid ${PFC.border}`, borderRadius: 999,
                padding: '5px 12px', display: 'inline-flex', gap: 5, alignItems: 'center',
                fontFamily: 'var(--font-display)', fontSize: 12, lineHeight: '16px',
              }}>
                <span style={{ fontWeight: 600, color: PFC.ink }}>{pill.label}</span>
                <span style={{ color: PFC.inkSoft }}>·</span>
                <span style={{ fontWeight: 600, color: PFC.ink }}>{pill.value}</span>
              </span>
            ))}
          </div>

          {/* Value card */}
          <div style={{ border: `1px solid ${PFC.border}`, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'flex' }}>
              {/* Est net */}
              <div style={{
                flex: 1, padding: '20px 16px', borderRight: `1px solid ${PFC.border}`,
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <Body14 color={PFC.inkSoft} weight={600} style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>Est. net on payslip</Body14>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, lineHeight: '32px', color: PFC.ink }}>~€548</div>
                <Caption color={PFC.inkSoft}>from €1,050 invested · optimal 30% gov. tax tier</Caption>
              </div>
              {/* Advantage */}
              <div style={{
                flex: 1, padding: '20px 16px',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}>
                <Body14 color={PFC.purple} weight={600} style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>Estimated Payflip advantage</Body14>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, lineHeight: '40px', color: PFC.ink }}>+€168</div>
                <Caption color={PFC.inkSoft}>vs cash pay out</Caption>
              </div>
            </div>
            <div style={{ padding: '12px 16px', borderTop: `1px solid ${PFC.border}` }}>
              <button onClick={() => setShowCalcSheet(true)} style={{
                background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                color: PFC.inkSoft, textDecoration: 'underline',
              }}>How is this calculated?</button>
            </div>
          </div>

          <div style={{ height: 1, background: PFC.border }} />

          {/* How it works */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Heading20>How it works</Heading20>
            {[
              { n: 1, title: 'Last year, you invested with your bank or insurer', desc: 'You contributed up to €1,350 to your pension savings through your bank or insurer.' },
              { n: 2, title: 'Upload your 281.60 fiscal attest', desc: "Drop in the fiscal attest 281.60 from your insurer. We'll validate the amount automatically." },
              { n: 3, title: 'Get reimbursed via your next payslip', desc: 'The net amount lands on your next payslip.' },
            ].map(step => (
              <div key={step.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 999, flexShrink: 0,
                  background: PFC.purpleTile,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: PFC.purple }}>{step.n}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16, lineHeight: '24px', color: PFC.ink }}>{step.title}</span>
                  <Body14 color={PFC.inkSoft} weight={400}>{step.desc}</Body14>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: PFC.border }} />

          {/* FAQs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Heading20>FAQs</Heading20>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ borderBottom: `1px solid ${PFC.border}` }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{
                    width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    padding: '14px 0', textAlign: 'left',
                  }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16, lineHeight: '24px', color: PFC.ink, flex: 1 }}>{faq.q}</span>
                    <LucideIcon name={openFaq === i ? 'ChevronUp' : 'ChevronDown'} size={16} color={PFC.inkSoft} strokeWidth={2} style={{ flexShrink: 0 }} />
                  </button>
                  {openFaq === i && faq.a && (
                    <Body14 color={PFC.inkSoft} weight={400} style={{ paddingBottom: 14, lineHeight: '22px' }}>{faq.a}</Body14>
                  )}
                </div>
              ))}
            </div>
            <button style={{
              background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
              color: PFC.purple, textDecoration: 'underline', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              Visit our help centre
              <LucideIcon name="ArrowRight" size={14} color={PFC.purple} strokeWidth={2} />
            </button>
          </div>

          <div style={{ height: 1, background: PFC.border }} />

          {/* Is this for me */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Body14 color={PFC.inkSoft} weight={700} style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>Is this for me?</Body14>
            {[
              'You invested in pension savings through your bank or insurer last year',
              'You have a fiscal attest 281.60 from your bank or insurer (or can get one)',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <LucideIcon name="CircleCheck" size={16} color="rgb(34,139,34)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <Body14 color={PFC.ink} weight={400}>{item}</Body14>
              </div>
            ))}
          </div>

          <button style={{
            background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14,
            color: PFC.inkSoft, textDecoration: 'underline', textAlign: 'left',
          }}>Terms and conditions</button>

        </div>
      </div>

      {/* Sticky footer */}
      <div style={{
        flexShrink: 0,
        background: '#fff', borderTop: `1px solid ${PFC.border}`,
        padding: '16px 16px 24px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {window.__pensionNewSubmitted ? (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            background: '#F7F7F8', borderRadius: 12, padding: '14px 16px',
          }}>
            <LucideIcon name="Clock" size={20} color={PFC.inkSoft} strokeWidth={1.75} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Body14 color={PFC.ink} weight={700}>In review</Body14>
              <Body14 color={PFC.inkSoft} weight={500}>Your admin is reviewing your pension savings choice.</Body14>
              <button onClick={() => push('pension-savings-choice')} style={{
                background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                color: PFC.ink, textDecoration: 'underline', textAlign: 'left',
              }}>View choice details</button>
            </div>
          </div>
        ) : (
          <>
            <Button variant="primary" size="large" fullWidth
              onClick={() => push('edit-active-benefit', { id: 'cat-pension', isNew: true })}>
              Choose this benefit
            </Button>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <TaxScoreRow score={{ level: 1, label: 'Good', pct: 54 }} />
            </div>
            <Body14 color={PFC.inkSoft} weight={500} style={{ fontSize: 12, textAlign: 'center' }}>3 steps · about 2 minutes</Body14>
          </>
        )}
      </div>

      {/* Advantage breakdown bottom sheet */}
      {showCalcSheet && ReactDOM.createPortal(
        <>
          <div onClick={() => setShowCalcSheet(false)} style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 20,
            animation: 'sheetFadeIn 0.2s ease-out both',
          }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 21,
            background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '20px 20px 34px',
            display: 'flex', flexDirection: 'column', gap: 20,
            animation: 'sheetSlideUp 0.3s ease-out both',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
          }}>
            {/* Handle + header */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: PFC.border }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Heading20>Payflip vs cash payout</Heading20>
              <button onClick={() => setShowCalcSheet(false)} style={{
                background: '#F7F7F8', border: 'none', borderRadius: 999, width: 32, height: 32,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LucideIcon name="X" size={16} color={PFC.ink} strokeWidth={2} />
              </button>
            </div>
            <Body14 color={PFC.inkSoft} weight={500} style={{ lineHeight: '20px' }}>
              Here's why going through Payflip beats taking the same amount as cash.
            </Body14>

            {/* Comparison table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {/* Header row */}
              <div style={{ display: 'flex', paddingBottom: 10, borderBottom: `1px solid ${PFC.border}` }}>
                <div style={{ flex: 2 }} />
                <Body14 color={PFC.inkSoft} weight={700} style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11, textAlign: 'center' }}>Cash</Body14>
                <Body14 color={PFC.inkSoft} weight={700} style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11, textAlign: 'center' }}>Payflip</Body14>
              </div>
              {/* Data rows */}
              {[
                { label: 'Employer NSSO', cash: '−27,73%', payflip: '−8,86%', payflipColor: PFC.ink },
                { label: 'Employee NSSO', cash: '−13,07%', payflip: '✓ Exempt', payflipColor: PFC.successText },
                { label: 'Income tax', cash: '−', payflip: '−', payflipColor: PFC.ink },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${PFC.border}` }}>
                  <Body14 color={PFC.inkSoft} weight={500} style={{ flex: 2 }}>{row.label}</Body14>
                  <Body14 color="rgb(180,35,35)" weight={500} style={{ flex: 1, textAlign: 'center' }}>{row.cash}</Body14>
                  <Body14 color={row.payflipColor} weight={500} style={{ flex: 1, textAlign: 'center' }}>{row.payflip}</Body14>
                </div>
              ))}
              {/* Total row */}
              <div style={{ display: 'flex', alignItems: 'center', paddingTop: 12 }}>
                <div style={{ flex: 2 }} />
                <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 18, color: PFC.inkSoft }}>€380</span>
                <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: PFC.ink }}>€548</span>
              </div>
            </div>

            {/* Payflip advantage */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Body14 color={PFC.inkSoft} weight={500}>Estimated Payflip advantage</Body14>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M2 7.3a5.3 5.3 0 1 1 2.6 4.55L2.5 13l.6-2.6A5.3 5.3 0 0 1 2 7.3Z" fill="rgb(232,216,240)" stroke="rgb(232,216,240)" strokeWidth="1.2" strokeLinejoin="round"/>
                  <path d="M8 9.7c-.7-.6-2-1.3-2-2.5a1.1 1.1 0 0 1 2-.7 1.1 1.1 0 0 1 2 .7c0 1.2-1.3 1.9-2 2.5Z" fill="rgb(196,43,252)"/>
                </svg>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: PFC.purple }}>€104</span>
              </div>
              <Body14 color={PFC.inkSoft} weight={400} style={{ lineHeight: '20px' }}>
                The extra you keep by routing through Payflip. Pensions savings is exempt from NSSO contributions. Estimation based on your current salary
              </Body14>
            </div>

            {/* Info callout */}
            <div style={{
              background: '#EEF3FF', borderRadius: 10, padding: '12px 14px',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <LucideIcon name="Info" size={14} color="rgb(59,100,248)" strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
              <Body14 color="rgb(30,60,180)" weight={400} style={{ lineHeight: '20px', fontSize: 13 }}>
                On top of this: the government also gives a separate 30% tax reduction at year-end filing. That stacks on top of the Payflip advantage shown here.
              </Body14>
            </div>

            <Button variant="primary" size="large" fullWidth onClick={() => setShowCalcSheet(false)}>
              Close
            </Button>
          </div>
          <style>{`
            @keyframes sheetFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes sheetSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
          `}</style>
        </>,
        document.querySelector('[data-app-shell]')
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pension savings choice detail — shown when in review
// ─────────────────────────────────────────────────────────────
function PensionSavingsChoiceScreen() {
  const { pop } = useNav();
  const c = window.__pensionNewChoice || {
    amount: 1050, budgetImpact: 1143, budget: 'End of year premium',
    netPayslip: 705, advantage: 134, submittedOn: '12/10/2026',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <NavBar onBack={pop} />
      <div style={{ padding: '0 16px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Heading28>Pension savings</Heading28>

        {/* Status banner */}
        <div style={{
          background: '#F7F7F8', borderRadius: 12, padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <Body14 color={PFC.ink} weight={700}>Awaiting admin review</Body14>
          <Body14 color={PFC.inkSoft} weight={500}>
            {fmtEUR(c.netPayslip)} will be reimbursed through your next payslip upon approval
          </Body14>
        </div>

        {/* Est net on payslip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Body14 color={PFC.inkSoft} weight={500}>Estimated net on payslip</Body14>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 36, lineHeight: '44px', letterSpacing: '-0.01em', color: PFC.ink }}>
            {fmtEUR(c.netPayslip)}
          </div>
          <button style={{
            background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
            color: PFC.inkSoft, textDecoration: 'underline', textAlign: 'left',
          }}>How is this calculated?</button>
        </div>

        <div style={{ height: 1, background: PFC.border }} />

        {/* Payflip advantage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Body14 color={PFC.inkSoft} weight={500}>Estimated Payflip advantage</Body14>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 7.3a5.3 5.3 0 1 1 2.6 4.55L2.5 13l.6-2.6A5.3 5.3 0 0 1 2 7.3Z" fill="rgb(232,216,240)" stroke="rgb(232,216,240)" strokeWidth="1.2" strokeLinejoin="round"/>
              <path d="M8 9.7c-.7-.6-2-1.3-2-2.5a1.1 1.1 0 0 1 2-.7 1.1 1.1 0 0 1 2 .7c0 1.2-1.3 1.9-2 2.5Z" fill="rgb(196,43,252)"/>
            </svg>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 36, lineHeight: '44px', letterSpacing: '-0.01em', color: PFC.purple }}>
              +{fmtEUR(c.advantage * 8)}
            </div>
          </div>
          <button style={{
            background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
            color: PFC.inkSoft, textDecoration: 'underline', textAlign: 'left',
          }}>How is this calculated?</button>
        </div>

        <div style={{ height: 1, background: PFC.border }} />

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Heading20>Details</Heading20>
          {[
            { label: 'Amount', value: fmtEUR(c.amount) },
            { label: 'Budget impact', value: fmtEUR(c.budgetImpact) },
            { label: 'Budget used', value: c.budget },
            { label: 'Est net on payslip', value: fmtEUR(c.netPayslip) },
            { label: 'Submitted on', value: c.submittedOn },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Body14 color={PFC.inkSoft} weight={500}>{row.label}</Body14>
              <Body16 color={PFC.ink} weight={500}>{row.value}</Body16>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Body14 color={PFC.inkSoft} weight={500}>Fiscal attest</Body14>
            <button style={{
              background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, textAlign: 'left',
            }}>
              <LucideIcon name="FileText" size={14} color={PFC.ink} strokeWidth={2} />
              <Body16 color={PFC.ink} weight={500} style={{ textDecoration: 'underline' }}>fiscal-attest.pdf</Body16>
            </button>
          </div>
        </div>

        <div style={{ height: 1, background: PFC.border }} />

        {/* Cancel */}
        <button onClick={() => {
          window.__pensionNewSubmitted = false;
          window.__pensionNewChoice = null;
          pop(); pop();
        }} style={{
          background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
          color: 'rgb(180,35,35)', textAlign: 'left',
        }}>Cancel choice</button>

      </div>
    </div>
  );
}

registerScreen('pension-savings-choice', PensionSavingsChoiceScreen);
registerScreen('pension-savings-detail', PensionSavingsDetailScreen);
registerScreen('multimedia-coolblue', MultimediaCoolblueScreen);
registerScreen('benefits', BenefitsScreen);
registerScreen('benefits-in-draft', BenefitsInDraftScreen);
registerScreen('my-active-benefits', MyActiveBenefitsScreen);
registerScreen('bike-lease', BikeLeaseScreen);
registerScreen('pension-detail', PensionDetailScreen);
registerScreen('coolblue-order', CoolblueOrderScreen);
registerScreen('edit-active-benefit', EditActiveBenefitScreen);
registerScreen('benefit-flow-start', BenefitFlowStartScreen);

// Share helpers across screen files (budgets-screen.jsx uses these too).
Object.assign(window, { StatusTimeline, PayflipAdvantageBlock, DetailRow, LifecycleOption, TaxScoreRow });

// Share data with home-screen.jsx (separate Babel scope)
window.DRAFTS = DRAFTS;
window.ACTIVE_BENEFITS = ACTIVE_BENEFITS;
window.navigateToItem = navigateToItem;
window.KIND_ICON = KIND_ICON;
