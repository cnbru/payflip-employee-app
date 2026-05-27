// Budgets flow:
//   budgets             → root overview
//   bonus               → detail
//   end-of-year-premium → detail
//   withdraw-cash       → form (interactive)
//   simulate-cash-out   → form
//   transactions        → list
//   housing-costs       → detail
//   edit-housing-costs  → form (interactive)

// ─────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────
const BUDGETS = [
  { id: 'mobility',   icon: 'Bike',            name: 'Mobility budget',     amount: 1249.34,
    tileFrom: '#DAEEFB', tileTo: '#B8DEFE', iconColor: '#1A5DC8' },
  { id: 'bonus',      icon: 'Sparkles',        name: 'Bonus',               amount: 824.23,
    tileFrom: '#DAEEFB', tileTo: '#B8DEFE', iconColor: '#1A5DC8' },
  { id: 'meal',       icon: 'UtensilsCrossed', name: 'Meal vouchers',       amount: 187,
    tileFrom: '#DAEEFB', tileTo: '#B8DEFE', iconColor: '#1A5DC8' },
  { id: 'end-of-year',icon: 'Gift',            name: 'End of year premium', amount: 824.23, locked: true,
    tileFrom: '#DAEEFB', tileTo: '#B8DEFE', iconColor: '#1A5DC8' },
];

const RECENT_TX = [
  { id: 't1', name: 'Smartphone',     date: '23 jan 2024', amount: 849.00,  budget: 'Bonus',                kind: 'one-time',  route: 'single-transaction' },
  { id: 't2', name: 'Housing cost',   date: '15 jan 2024', amount: 700.00,  budget: 'Mobility budget',      kind: 'recurring', route: 'housing-costs' },
  { id: 't3', name: 'Pension savings',date: '2 jan 2024',  amount: 312.50,  budget: 'End of year premium',  kind: 'recurring', route: 'housing-costs' },
];

const HOUSING_TX = [
  { month: 'June',         label: 'Mobility budget', amount: 700 },
  { month: 'July',         label: 'Mobility budget', amount: 700 },
  { month: 'August',       label: 'Mobility budget', amount: 700 },
  { month: 'December 2026', label: 'Mobility budget', amount: 700 },
];

// ─────────────────────────────────────────────────────────────
// Eligible-benefits catalog (per budget). Used by the
// "View eligible benefits" / mobility-spend scenarios.
// ─────────────────────────────────────────────────────────────
const ELIGIBLE = {
  mobility: {
    label: 'Mobility budget',
    items: [
      { id: 'bike-lease',        name: 'Bike lease',         provider: 'Joule, Cyclis, KBC …', icon: 'Bike',         route: ['bike-lease', { id: 'bike-active' }] },
      { id: 'housing-rent',      name: 'Housing rent',       provider: 'Reimbursement up to €800/mo', icon: 'House', route: ['housing-costs'] },
      { id: 'public-transport',  name: 'Public transport',   provider: 'STIB, NMBS, De Lijn',  icon: 'TrainFront' },
      { id: 'charging-station',  name: 'Charging station',   provider: 'Pluginvest, Evonik',   icon: 'Zap' },
      { id: 'shared-mobility',   name: 'Shared mobility',    provider: 'Cambio, Poppy …',      icon: 'Car' },
      { id: 'mobility-card',     name: 'Mobility payment card', provider: 'Top up your card',   icon: 'CreditCard' },
    ],
  },
  bonus: {
    label: 'Bonus',
    items: [
      { id: 'warrants',         name: 'Warrants',          provider: 'Up to €240 more value', icon: 'ShieldCheck' },
      { id: 'pension-savings',  name: 'Pension savings',   provider: 'AG Insurance',          icon: 'PiggyBank' },
      { id: 'multimedia',       name: 'Multimedia',        provider: 'Coolblue',              icon: 'Smartphone' },
      { id: 'desk-material',    name: 'Desk material',     provider: 'Home office set-up',    icon: 'Armchair' },
      { id: 'alan',             name: 'Health insurance',  provider: 'Alan',                  icon: 'HeartPulse' },
    ],
  },
  'end-of-year': {
    label: 'End of year premium',
    items: [
      { id: 'warrants',         name: 'Warrants',          provider: 'Up to €240 more value', icon: 'ShieldCheck' },
      { id: 'pension-savings',  name: 'Pension savings',   provider: 'AG Insurance',          icon: 'PiggyBank' },
      { id: 'paid-holiday',     name: 'Extra holidays',    provider: 'Add days to your PTO',  icon: 'Sun' },
      { id: 'multimedia',       name: 'Multimedia',        provider: 'Coolblue',              icon: 'Smartphone' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────
// Budgets — root
// ─────────────────────────────────────────────────────────────
function BudgetsScreen() {
  const { push } = useNav();
  const budgets = BUDGETS.map(b => b.id === 'end-of-year' && window.__eoyUnlocked ? { ...b, locked: false } : b);
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const [advantageMode, setAdvantageMode] = React.useState('yearly');
  const advantageValue = advantageMode === 'yearly' ? '€824,23' : '€3.296,92';
  return (
    <div style={{ padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Heading28>Budgets</Heading28>

      {/* Side-by-side: Available budget + Payflip advantage (with yearly/total toggle) */}
      <div style={{
        display: 'flex', alignItems: 'stretch',
        borderRadius: 16, border: `1px solid ${PFC.borderHard}`,
        background: '#F7F7F8', overflow: 'hidden',
      }}>
        {/* Left cell */}
        <div style={{
          flex: 1, padding: '20px 16px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <Body14 color={PFC.inkSoft} weight={700}>Available budget</Body14>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 28, lineHeight: '36px', letterSpacing: '-0.007em',
            color: PFC.inkDeep,
          }}>{fmtEUR(totalBudget)}</span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: PFC.borderHard, alignSelf: 'stretch' }} />

        {/* Right cell */}
        <div style={{
          flex: 1, padding: '20px 16px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <Body14 color={PFC.inkSoft} weight={700}>Payflip advantage</Body14>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 28, lineHeight: '36px', letterSpacing: '-0.007em',
            color: PFC.inkDeep,
          }}>{advantageValue}</span>
          {/* Segmented toggle */}
          <div style={{
            display: 'inline-flex', alignSelf: 'flex-start',
            background: 'rgba(15,13,40,0.08)', borderRadius: 999,
            padding: 2, gap: 0, marginTop: 6,
          }}>
            {[['yearly', 'This year'], ['total', 'All-time']].map(([m, label]) => (
              <button key={m} onClick={() => setAdvantageMode(m)} style={{
                appearance: 'none', cursor: 'pointer', border: 'none',
                background: advantageMode === m ? '#fff' : 'transparent',
                color: advantageMode === m ? PFC.ink : PFC.inkSoft,
                fontFamily: 'var(--font-display)', fontWeight: 600,
                fontSize: 11, letterSpacing: '0.01em',
                padding: '3px 9px', borderRadius: 999,
                boxShadow: advantageMode === m ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 150ms ease-out',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {budgets.map((b, i) => {
          const route = b.id === 'bonus' ? 'bonus' : b.id === 'end-of-year' ? 'end-of-year-premium' : b.id === 'meal' ? 'meal-vouchers' : 'mobility-detail';
          return (
            <button key={b.id} onClick={() => push(route)}
              style={{
                width: '100%', appearance: 'none', background: '#fff',
                border: 'none', borderTop: i === 0 ? 'none' : `1px solid ${PFC.border}`,
                padding: '20px 0',
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', textAlign: 'left',
              }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flex: 'none',
                background: b.locked
                  ? 'linear-gradient(135deg, #FFE5C7 0%, #FFD9A8 100%)'
                  : `linear-gradient(135deg, ${b.tileFrom} 0%, ${b.tileTo} 100%)`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LucideIcon name={b.locked ? 'Lock' : b.icon} size={20} color={b.locked ? '#A04F21' : b.iconColor} strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Body16 color={PFC.ink} weight={700}>{b.name}</Body16>
                  {b.locked && (
                    <span style={{
                      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
                      background: '#FFE5C7', color: '#A04F21',
                      borderRadius: 999, padding: '1px 8px', whiteSpace: 'nowrap',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                      <LucideIcon name="Lock" size={10} color="#A04F21" strokeWidth={2.5} />
                      Locked
                    </span>
                  )}
                </div>
                <Body14 color={PFC.inkSoft} weight={500}>{fmtEUR(b.amount)}</Body14>
              </div>
              <LucideIcon name="ChevronRight" size={20} color={PFC.inkSoft} strokeWidth={2} />
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <SectionHeader title="Recent transactions" style={{ borderBottom: 'none' }} />
        {RECENT_TX.map((t, i) => (
          <button key={t.id} onClick={() => push(t.route, { tx: t })} style={{
            width: '100%', appearance: 'none', background: '#fff',
            border: 'none', borderTop: i === 0 ? 'none' : `1px solid ${PFC.border}`,
            padding: '12px 0',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Body14 color={PFC.ink} weight={600}>{t.name}</Body14><br/>
              <Body14 color={PFC.inkSoft} weight={500}>{t.date} · {t.budget}</Body14>
            </div>
            <Body14 color={PFC.ink} weight={600}>{fmtEUR(t.amount)}</Body14>
            <LucideIcon name="ChevronRight" size={14} color={PFC.inkSoft} strokeWidth={2} style={{ marginLeft: 4 }} />
          </button>
        ))}
        <div style={{ paddingTop: 16 }}>
          <Button variant="outline" size="sm" fullWidth onClick={() => push('transactions')}>See all transactions</Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FAQ accordion — reusable on budget detail pages
// ─────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "What's the difference between benefits and cash?",
    a: "Benefits are tax-exempt, so €1 of budget spent on a benefit is worth more than €1 in cash after taxes. The exact advantage depends on your tax bracket.",
  },
  {
    q: "When is the deadline to make a choice?",
    a: "You must submit your choice before the deadline shown on this page. After that date, the remaining budget is automatically paid out as cash on your next payslip.",
  },
  {
    q: "Can I split my budget between benefits and cash?",
    a: "Yes — you can allocate part of your budget to benefits and withdraw the rest as cash. Just make sure the total doesn't exceed your available balance.",
  },
];

function FaqSection() {
  const [open, setOpen] = React.useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Heading20>FAQ</Heading20>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} style={{
            borderTop: i === 0 ? 'none' : `1px solid ${PFC.border}`,
          }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%', appearance: 'none', background: 'transparent',
                border: 'none', padding: '16px 0', cursor: 'pointer',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                gap: 12, textAlign: 'left',
              }}>
              <Body16 color={PFC.ink} weight={600}>{item.q}</Body16>
              <LucideIcon
                name={open === i ? 'ChevronUp' : 'ChevronDown'}
                size={18} color={PFC.inkSoft} strokeWidth={2}
                style={{ flex: 'none' }}
              />
            </button>
            {open === i && (
              <div style={{ paddingBottom: 16 }}>
                <Body14 color={PFC.inkSoft} weight={500}>{item.a}</Body14>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Budget detail — used by Bonus + End of year premium.
// ─────────────────────────────────────────────────────────────
function BudgetDetailScreen({ title, choiceDeadline, cashOut, simulate, budgetKey, noCash, expiryNote, noDeadlineCards, noSpend, locked }) {
  const { push, switchTab } = useNav();
  const budget = BUDGETS.find(b => b.id === budgetKey);
  const amount = budget ? fmtEUR(budget.amount) : '—';
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Heading24>{title}</Heading24>
          {locked && (
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
              background: '#FFE5C7', color: '#A04F21',
              borderRadius: 999, padding: '1px 8px', whiteSpace: 'nowrap',
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <LucideIcon name="Lock" size={10} color="#A04F21" strokeWidth={2.5} />
              Locked
            </span>
          )}
        </div>

        {/* Single unified card: amount top, deadline/cashout bottom */}
        {!noDeadlineCards && <div style={{
          border: `1px solid ${PFC.border}`, borderRadius: 16, overflow: 'hidden',
          background: '#fff',
        }}>
          {/* Top: total available */}
          <div style={{ padding: '20px 16px', borderBottom: `1px solid ${PFC.border}` }}>
            <Body14 color={PFC.inkSoft} weight={700}>Total available</Body14>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, lineHeight: '36px',
              letterSpacing: '-0.007em', color: PFC.inkDeep, marginTop: 4,
            }}>{amount}</div>
            {expiryNote && (
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 500,
                fontSize: 13, lineHeight: '18px', color: PFC.inkSoft, marginTop: 4, display: 'block',
              }}>{expiryNote}</span>
            )}
          </div>
          {/* Bottom: two meta cells */}
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, padding: '16px', borderRight: `1px solid ${PFC.border}` }}>
              <Body14 color={PFC.inkSoft} weight={500}>Choice deadline</Body14>
              <div style={{ marginTop: 4 }}><Body16 color={PFC.ink} weight={700}>{choiceDeadline}</Body16></div>
            </div>
            <div style={{ flex: 1, padding: '16px' }}>
              <Body14 color={PFC.inkSoft} weight={500}>Cash out</Body14>
              <div style={{ marginTop: 4 }}><Body16 color={PFC.ink} weight={700}>{cashOut}</Body16></div>
            </div>
          </div>
        </div>}

        {/* No deadline cards: just show the amount standalone */}
        {noDeadlineCards && <div style={{
          border: `1px solid ${PFC.border}`, borderRadius: 16,
          background: '#fff', padding: '20px 16px',
        }}>
          <Body14 color={PFC.inkSoft} weight={700}>Total available</Body14>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, lineHeight: '36px',
            letterSpacing: '-0.007em', color: PFC.inkDeep, marginTop: 4,
          }}>{amount}</div>
          {expiryNote && (
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 500,
              fontSize: 13, lineHeight: '18px', color: PFC.inkSoft, marginTop: 4, display: 'block',
            }}>{expiryNote}</span>
          )}
        </div>}

        {(!noSpend || !noCash) && <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Heading20>Use your budget</Heading20>
          <Body16 color={PFC.inkSoft}>Pick how much goes to benefits and how much to cash. You can split.</Body16>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {!noSpend && <button onClick={() => { window.__benefitsFilter = budgetKey; switchTab('benefits'); }} style={{
              appearance: 'none', border: `1px solid ${PFC.border}`, borderRadius: 16,
              background: '#fff', padding: '16px', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #EDE5FF 0%, #D8CCFF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <LucideIcon name="Gift" size={22} color={PFC.purple} strokeWidth={2} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <Body16 color={PFC.ink} weight={700}>Spend on benefits</Body16>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: PFC.purple }}>€823</span>
                </div>
                <Body14 color={PFC.inkSoft} weight={500}>Tax-smart warrants, multimedia and more</Body14>
              </div>
              <LucideIcon name="ChevronRight" size={18} color={PFC.inkSoft} strokeWidth={2} />
            </button>}
            {!noCash && <button onClick={() => simulate ? push('simulate-cash-out') : push('withdraw-cash')} style={{
              appearance: 'none', border: `1px solid ${PFC.border}`, borderRadius: 16,
              background: '#fff', padding: '16px', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, #E5F0FF 0%, #CCDDFF 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <LucideIcon name="Euro" size={22} color="#1A5DC8" strokeWidth={2} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <Body16 color={PFC.ink} weight={700}>{simulate ? 'Simulate cash out' : 'Take as cash'}</Body16>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#1A5DC8' }}>€512</span>
                </div>
                <Body14 color={PFC.inkSoft} weight={500}>{simulate ? 'See what you\'d net if you cash out in December' : 'Withdraw now with your next payslip'}</Body14>
              </div>
              <LucideIcon name="ChevronRight" size={18} color={PFC.inkSoft} strokeWidth={2} />
            </button>}
          </div>
        </div>}

        <div style={{ marginTop: 16 }}><FaqSection /></div>
      </div>
    </div>
  );
}
function BonusScreen() {
  return <BudgetDetailScreen title="Bonus" choiceDeadline="7 dec 2026" cashOut="12 dec 2026" budgetKey="bonus" />;
}
function EndOfYearScreen() {
  if (window.__eoyUnlocked) {
    return <BudgetDetailScreen title="End of year premium" choiceDeadline="7 dec 2026" cashOut="12 dec 2026" simulate budgetKey="end-of-year" />;
  }
  const { push } = useNav();
  const budget = BUDGETS.find(b => b.id === 'end-of-year');
  const amount = budget ? fmtEUR(budget.amount) : '—';
  const goingToCash = fmtEUR(232.15);
  const [faqOpen, setFaqOpen] = React.useState(null);

  const EOY_FAQS = [
    { q: 'How is my End of year premium calculated?', a: 'Your end of year premium is calculated based on your gross annual salary and company policy. The exact amount depends on your contract terms and any applicable collective agreements.' },
    { q: 'What is the 1/2 rule?', a: 'The 1/2 rule means that if you joined the company after July 1st, your end of year premium is halved for that calendar year. This applies to your first year of employment.' },
    { q: 'When and how does this budget pay out?', a: 'If you don\'t spend your budget on benefits before the choice deadline, the remaining amount is automatically paid out as cash on your December payslip.' },
    { q: 'What if I leave the company before December?', a: 'If you leave before December, your end of year premium is prorated based on the months worked. Any already-committed benefits remain active until their end date.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Heading24>End of year premium</Heading24>

        {/* Amount card with locked badge + going to cash */}
        <div style={{
          border: `1px solid ${PFC.border}`, borderRadius: 16, overflow: 'hidden',
          background: '#fff',
        }}>
          {/* Top: total available + locked badge + going to cash */}
          <div style={{ padding: '20px 16px', borderBottom: `1px solid ${PFC.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Body14 color={PFC.inkSoft} weight={700}>Total available</Body14>
                <div style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, lineHeight: '36px',
                  letterSpacing: '-0.007em', color: PFC.inkDeep, marginTop: 4,
                }}>{amount}</div>
              </div>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
                background: '#FFE5C7', color: '#A04F21',
                borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap',
                display: 'inline-flex', alignItems: 'center', gap: 4,
                marginTop: 4,
              }}>
                <LucideIcon name="Lock" size={10} color="#A04F21" strokeWidth={2.5} />
                Locked
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <Body14 color={PFC.inkSoft} weight={500}>Going to cash</Body14>
              <LucideIcon name="CircleHelp" size={14} color={PFC.inkSoft} strokeWidth={2} />
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, lineHeight: '24px',
              color: PFC.inkDeep, marginTop: 2,
            }}>{goingToCash}</div>
          </div>
          {/* Bottom: two meta cells */}
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1, padding: '16px', borderRight: `1px solid ${PFC.border}` }}>
              <Body14 color={PFC.inkSoft} weight={500}>Choice deadline</Body14>
              <div style={{ marginTop: 4 }}><Body16 color={PFC.ink} weight={700}>7 dec 2026</Body16></div>
            </div>
            <div style={{ flex: 1, padding: '16px' }}>
              <Body14 color={PFC.inkSoft} weight={500}>Cash out</Body14>
              <div style={{ marginTop: 4 }}><Body16 color={PFC.ink} weight={700}>12 dec 2026</Body16></div>
            </div>
          </div>
        </div>

        {/* Unlock CTA card — blue gradient */}
        <div style={{
          borderRadius: 16, overflow: 'hidden',
          background: 'linear-gradient(135deg, #EBF4FF 0%, #D0E4FF 60%, #3B8DF8 100%)',
          padding: '24px 20px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
            lineHeight: '30px', letterSpacing: '-0.005em', color: PFC.ink,
          }}>Optimise your End of year premium</span>
          <Body14 color={PFC.inkSoft} weight={500}>
            Get up to €230 more value than cashing it out in December.
          </Body14>
          <Button variant="primary" size="large" fullWidth
            onClick={() => push('unlock-eoy')}
            style={{ marginTop: 8 }}>
            Unlock budget
          </Button>
        </div>

        {/* FAQs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Heading20>FAQs</Heading20>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {EOY_FAQS.map((item, i) => (
              <div key={i} style={{ borderTop: i === 0 ? 'none' : `1px solid ${PFC.border}` }}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{
                  width: '100%', appearance: 'none', background: 'transparent',
                  border: 'none', padding: '16px 0', cursor: 'pointer',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  gap: 12, textAlign: 'left',
                }}>
                  <Body16 color={PFC.ink} weight={600}>{item.q}</Body16>
                  <LucideIcon name={faqOpen === i ? 'ChevronUp' : 'ChevronDown'}
                    size={18} color={PFC.inkSoft} strokeWidth={2} style={{ flex: 'none' }} />
                </button>
                {faqOpen === i && (
                  <div style={{ paddingBottom: 16 }}>
                    <Body14 color={PFC.inkSoft} weight={500}>{item.a}</Body14>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Help centre link */}
        <button style={{
          background: 'transparent', border: 'none', padding: 0,
          cursor: 'pointer', textAlign: 'left',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
          color: PFC.ink, textDecoration: 'underline',
        }}>Visit our help centre</button>
      </div>
    </div>
  );
}
function MobilityDetailScreen() {
  return <BudgetDetailScreen title="Mobility budget" choiceDeadline="7 dec 2026" cashOut="12 dec 2026" budgetKey="mobility" simulate />;
}
// ─── Meal vouchers — two variants, toggle via useMealPhoto ───
function MealVouchersScreenSimple() {
  return <BudgetDetailScreen title="Meal vouchers" budgetKey="meal" noCash noDeadlineCards noSpend expiryNote="of which €20 expires on 30 Jun 2026" />;
}

function MealVouchersScreen() {
  const { pop } = useNav();
  const budget = BUDGETS.find(b => b.id === 'meal');
  const amount = budget ? fmtEUR(budget.amount) : '—';
  const [open, setOpen] = React.useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', minHeight: '100%' }}>

      {/* Hero image with overlaid nav + title */}
      <div style={{ position: 'relative', width: '100%', height: 240, flexShrink: 0, overflow: 'hidden' }}>
        <img src="uploads/burger.jpg" alt="Meal vouchers"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', display: 'block' }} />
        {/* Gradient overlay — dark at top for nav, dark at bottom for title */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)',
        }} />
        {/* Back button */}
        <button onClick={pop} style={{
          position: 'absolute', top: 16, left: 16,
          width: 36, height: 36, borderRadius: 999, border: 'none',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <LucideIcon name="ChevronLeft" size={20} color="#fff" strokeWidth={2.5} />
        </button>
        {/* Page title on image */}
        <div style={{ position: 'absolute', bottom: 20, left: 16, right: 16 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 28, lineHeight: '36px', letterSpacing: '-0.007em',
            color: '#fff',
          }}>Meal vouchers</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 16px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Amount card */}
        <div style={{
          border: `1px solid ${PFC.border}`, borderRadius: 16,
          background: '#fff', padding: '20px 16px',
        }}>
          <Body14 color={PFC.inkSoft} weight={700}>Total available</Body14>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, lineHeight: '36px',
            letterSpacing: '-0.007em', color: PFC.inkDeep, marginTop: 4,
          }}>{amount}</div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 500,
            fontSize: 13, lineHeight: '18px', color: PFC.inkSoft, marginTop: 4, display: 'block',
          }}>of which €20 expires on 30 Jun 2026</span>
        </div>

        {/* FAQ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Heading20>FAQ</Heading20>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} style={{ borderTop: i === 0 ? 'none' : `1px solid ${PFC.border}` }}>
                <button onClick={() => setOpen(open === i ? null : i)} style={{
                  width: '100%', appearance: 'none', background: 'transparent',
                  border: 'none', padding: '16px 0', cursor: 'pointer',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  gap: 12, textAlign: 'left',
                }}>
                  <Body16 color={PFC.ink} weight={600}>{item.q}</Body16>
                  <LucideIcon name={open === i ? 'ChevronUp' : 'ChevronDown'}
                    size={18} color={PFC.inkSoft} strokeWidth={2} style={{ flex: 'none' }} />
                </button>
                {open === i && (
                  <div style={{ paddingBottom: 16 }}>
                    <Body14 color={PFC.inkSoft} weight={500}>{item.a}</Body14>
                  </div>
                )}
              </div>
            ))}
            <div style={{ height: 1, background: PFC.border }} />
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Cash-out form (used for Withdraw + Simulate — different layouts).
// ─────────────────────────────────────────────────────────────
const MAX_WITHDRAW = 824.23;
const LOCKED_GROSS = 520.56;
const LOCKED_NET = 187;
function CashOutForm({ title, simulate }) {
  const { pop } = useNav();
  const [amountStr, setAmountStr] = React.useState(String(MAX_WITHDRAW).replace('.', ','));
  const [understands, setUnderstands] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const amt = parseFloat(amountStr.replace(',', '.'));
  const err =
    submitted && (!amountStr || isNaN(amt)) ? 'Enter an amount' :
    submitted && amt <= 0 ? 'Amount must be greater than 0' :
    submitted && amt > MAX_WITHDRAW ? `Maximum is ${fmtEUR(MAX_WITHDRAW)}` :
    null;
  const cbErr = submitted && !understands ? 'You must confirm this is final' : null;

  const netEstimate = amt > 0 && !isNaN(amt) ? Math.round(amt * 0.665) : 548;
  const cashOutNet = amt > 0 && !isNaN(amt) ? Math.round(amt * 0.36) : 262;
  const totalNet = simulate ? LOCKED_NET + cashOutNet : netEstimate;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', height: '100%', overflow: 'hidden' }}>
      <NavBar onBack={!success ? pop : undefined} />
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Heading24>{title}</Heading24>
        <Body16 color={PFC.ink}>
          {simulate
            ? 'Simulate how much you could get if after cash out date.'
            : 'Take some or all of this as cash with your next payslip.'}
        </Body16>

        {/* Already locked to cash — simulate only */}
        {simulate && <div style={{
          border: `1px solid ${PFC.border}`, borderRadius: 16, background: '#fff',
          padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Body14 color={PFC.inkSoft} weight={700} style={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                ALREADY LOCKED TO CASH
              </Body14>
              <Body14 color={PFC.inkSoft} weight={500} style={{ display: 'block' }}>5 of 12 months elapsed</Body14>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: PFC.ink }}>
                {fmtEUR(LOCKED_GROSS)}
              </div>
              <Body14 color={PFC.inkSoft} weight={500}>= {fmtEUR(LOCKED_NET)} net</Body14>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{
                flex: 1, height: 6, borderRadius: 3,
                background: i < 5 ? PFC.border : PFC.purple,
              }} />
            ))}
          </div>
        </div>}

        {/* Amount input with MAX */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {simulate
            ? <Body16 color={PFC.ink} weight={500}>Of the {fmtEUR(MAX_WITHDRAW)} still in Payflip, cash out</Body16>
            : <Body14 color={PFC.inkSoft} weight={700}>Amount</Body14>}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: err ? PFC.errorBg : '#fff',
            border: `1px solid ${err ? PFC.errorBorder : PFC.borderHard}`,
            borderRadius: 12, padding: '12px 8px 12px 16px', gap: 8,
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: PFC.ink }}>€</span>
            <input
              inputMode="decimal"
              placeholder="0,00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, lineHeight: '28px',
                color: PFC.ink, minWidth: 0, padding: 0,
              }} />
            <button onClick={() => setAmountStr(MAX_WITHDRAW.toFixed(2).replace('.', ','))} style={{
              appearance: 'none', border: 'none',
              background: PFC.purpleTile, color: PFC.inkDarker,
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, lineHeight: '20px',
              padding: '4px 12px', borderRadius: 999, cursor: 'pointer',
              letterSpacing: '0.003em',
            }}>MAX</button>
          </div>
          {err && <Body14 color={PFC.errorText} weight={500}>{err}</Body14>}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4 }}>
            <Body14 color={PFC.inkSoft} weight={500}>{simulate ? 'Max electable' : 'Available to withdraw'}</Body14>
            <Body14 color={PFC.inkSoft} weight={500}>{fmtEUR(MAX_WITHDRAW)}</Body14>
          </div>
        </div>

        <div>
          <Body14 color={PFC.inkSoft} weight={700} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {simulate ? 'EST NET AFTER CASH OUT' : 'EST NET AT CASH-OUT'}
          </Body14>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 36, lineHeight: '44px',
            letterSpacing: '-0.01em', color: PFC.ink, marginTop: 4,
          }}>€{simulate ? totalNet : netEstimate}</div>

          {/* Breakdown — simulate only */}
          {simulate && <div style={{
            border: `1px solid ${PFC.border}`, borderRadius: 12, marginTop: 16, overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px', borderBottom: `1px solid ${PFC.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: PFC.border }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Body14 color={PFC.ink} weight={700}>Locked portion</Body14>
                  <Caption color={PFC.inkSoft}>{fmtEUR(LOCKED_GROSS)} x 36% net</Caption>
                </div>
              </div>
              <Body14 color={PFC.ink} weight={700}>{fmtEUR(LOCKED_NET)}</Body14>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: PFC.purple }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Body14 color={PFC.ink} weight={700}>You cash out</Body14>
                  <Caption color={PFC.inkSoft}>{fmtEUR(amt > 0 && !isNaN(amt) ? amt : MAX_WITHDRAW)} x 36% net</Caption>
                </div>
              </div>
              <Body14 color={PFC.ink} weight={700}>{fmtEUR(cashOutNet)}</Body14>
            </div>
          </div>}

          <button onClick={() => {}} style={{
            background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
            lineHeight: '16px', letterSpacing: '0.005em',
            color: PFC.inkSoft, textDecoration: 'underline', marginTop: 12,
          }}>How is this calculated?</button>
        </div>

        <div style={{ height: 1, background: PFC.borderHard }} />

        {/* Cash benefits suggestion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
          <Heading20>Cash benefits to consider instead</Heading20>
          <Body14 color={PFC.ink} weight={500}>
            Get more net cash value.
          </Body14>
        </div>
        <div className="hide-scrollbar" style={{
          display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -16px', padding: '0 16px',
        }}>
          <div style={{
            background: '#fff', border: `1px solid ${PFC.border}`,
            borderRadius: 16, padding: 20, width: 280, minWidth: 280, flex: '0 0 auto',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <IconTile name="Home" />
              <Body14 color={PFC.purple} weight={700}>Up to €240 more value</Body14>
            </div>
            <div>
              <Heading20>Warrants</Heading20>
              <Body14 color={PFC.ink} weight={500}>Reclaim part of it here more efficiently than any cash payout.</Body14>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
              <TaxScoreRow score={{ level: 2, label: 'Good', pct: 24 }} />
            </div>
          </div>
          <div style={{
            background: '#fff', border: `1px solid ${PFC.border}`,
            borderRadius: 16, padding: 20, width: 280, minWidth: 280, flex: '0 0 auto',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <IconTile name="Home" />
              <Body14 color={PFC.purple} weight={700}>Up to €180 more value</Body14>
            </div>
            <div>
              <Heading20>Pension savings</Heading20>
              <Body14 color={PFC.ink} weight={500}>Set aside a penny for your old day. Get your yearly savings reimbursed via Payflip.</Body14>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
              <TaxScoreRow score={{ level: 2, label: 'Good', pct: 54 }} />
            </div>
          </div>
        </div>
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

        {/* Confirmation checkbox + CTA — sticky bottom */}
      </div>
      </div>
      <div style={{
        flexShrink: 0,
        background: '#fff',
        borderTop: `1px solid ${PFC.border}`,
        padding: '16px 16px 24px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {simulate ? (
          <Button variant="primary" size="large" fullWidth onClick={pop}>
            Close simulation
          </Button>
        ) : (<>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={understands}
              onChange={(e) => setUnderstands(e.target.checked)}
              style={{
                width: 20, height: 20, marginTop: 2,
                accentColor: PFC.inkDarker,
                flex: 'none',
              }} />
            <Body14 color={PFC.ink} weight={500}>
              I understand that cash withdrawals cannot be undone.
            </Body14>
          </label>
          {cbErr && <Body14 color={PFC.errorText} weight={500}>{cbErr}</Body14>}

          <Button variant="primary" size="large" fullWidth disabled={loading || success} onClick={() => {
            setSubmitted(true);
            if (!understands) return;
            const n = parseFloat(amountStr.replace(',', '.'));
            if (isNaN(n) || n <= 0 || n > MAX_WITHDRAW) return;
            setLoading(true);
            setTimeout(() => { setLoading(false); setSuccess(true); }, 1800);
          }}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'cashSpin 0.7s linear infinite',
                }} />
                Processing…
              </span>
            ) : success ? '✓ Submitted' : 'Request cash withdrawal'}
          </Button>
          <style>{`@keyframes cashSpin { to { transform: rotate(360deg); } }`}</style>
        </>)}
      </div>

      {/* ── Success overlay (withdraw only) ── */}
      {success && !simulate && (
        <div style={{
          position: 'absolute', inset: 0, background: '#fff', zIndex: 10,
          display: 'flex', flexDirection: 'column',
          animation: 'fadeSlideIn 0.4s ease-out both',
        }}>
          <div style={{ padding: 16 }}>
            <button onClick={pop} style={{
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
            }}>Withdrawal is on its way!</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 500,
              fontSize: 15, lineHeight: '22px', color: PFC.inkSoft,
              textAlign: 'center', maxWidth: 280,
              animation: 'fadeSlideIn 0.4s ease-out 0.35s both',
            }}>Est.€{netEstimate} will be paid out with your June payslip.</span>
            <div style={{ width: '100%', marginTop: 16, animation: 'fadeSlideIn 0.4s ease-out 0.45s both' }}>
              <Button variant="primary" size="large" fullWidth onClick={pop}>Back to budget</Button>
            </div>
          </div>
        </div>
      )}
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
function WithdrawCashScreen() {
  return <CashOutForm title="Withdraw as cash" />;
}
function SimulateCashOutScreen() {
  return <CashOutForm title="Simulate cash out" simulate />;
}

// ─────────────────────────────────────────────────────────────
// Transactions list
// ─────────────────────────────────────────────────────────────
const ALL_TX = [
  { id: 'tx1', name: 'Smartphone',     date: '23 jan 2024', amount: 1249.34, tag: 'eoy' },
  { id: 'tx2', name: 'Housing cost',   date: '23 jan 2024', amount: 1249.34, tag: 'bonus' },
  { id: 'tx3', name: 'Pension savings',date: '23 jan 2024', amount: 1249.34, tag: 'bonus' },
  { id: 'tx4', name: 'Meal vouchers',  date: '23 jan 2024', amount: 1249.34, tag: 'bonus' },
  { id: 'tx5', name: 'Pension savings',date: '23 jan 2024', amount: 1249.34, tag: 'eoy' },
  { id: 'tx6', name: 'Pension savings',date: '25 jan 2024', amount: 1249.34, tag: 'bonus' },
  { id: 'tx7', name: 'Pension savings',date: '25 jan 2024', amount: 1249.34, tag: 'bonus' },
  { id: 'tx8', name: 'Pension savings',date: '23 jan 2024', amount: 1249.34, tag: 'eoy' },
];
function TransactionsScreen() {
  const { push } = useNav();
  const [filter, setFilter] = React.useState(null);
  const shown = filter ? ALL_TX.filter(t => t.tag === filter) : ALL_TX;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Heading28>Transactions</Heading28>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '0 -16px', padding: '4px 16px' }}>
          <FilterPill label="Bonus" active={filter === 'bonus'} onClick={() => setFilter(f => f === 'bonus' ? null : 'bonus')} />
          <FilterPill label="End of year premium" active={filter === 'eoy'} onClick={() => setFilter(f => f === 'eoy' ? null : 'eoy')} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {shown.map((t, i) => (
            <button key={t.id} onClick={() => push('housing-costs')} style={{
              width: '100%', appearance: 'none', background: '#fff',
              border: 'none', borderTop: i === 0 ? 'none' : `1px solid ${PFC.border}`,
              padding: '16px 0',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', textAlign: 'left',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Body16 color={PFC.ink} weight={400}>{t.name}</Body16><br/>
                <Body14 color={PFC.inkSoft} weight={500}>{t.date}</Body14>
              </div>
              <Body16 color={PFC.ink} weight={500}>{fmtEUR(t.amount)}</Body16>
              <LucideIcon name="ChevronRight" size={16} color={PFC.ink} strokeWidth={2} style={{ marginLeft: 8 }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Housing costs detail
// ─────────────────────────────────────────────────────────────
const HOUSING_TIMELINE = [
  { title: 'Choice submitted',  meta: '01/01/2026' },
  { title: 'Admin approved',    meta: 'HR verified mortgage statement' },
  { title: 'Active',            meta: '€700 reimbursed each month' },
  { title: 'End of agreement',  meta: '31/12/2026' },
];

function HousingCostsScreen() {
  const { push } = useNav();
  const ST = window.StatusTimeline;
  const PA = window.PayflipAdvantageBlock;
  const DR = window.DetailRow;
  const LO = window.LifecycleOption;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <Heading28>Housing costs</Heading28>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Heading20>Status</Heading20>
          {ST && <ST steps={HOUSING_TIMELINE} currentIndex={2} />}
        </div>

        <div style={{ height: 1, background: PFC.border }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Heading20>Details</Heading20>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {DR && <DR label="Property type" value="Mortgage" />}
            {DR && <DR label="Monthly contribution" value="€700" />}
            {DR && <DR label="Start date" value="01/01/2026" />}
            {DR && <DR label="End date" value="31/12/2026" />}
            {DR && <DR label="Budget" value="Mobility budget" />}
          </div>
        </div>

        <div style={{ height: 1, background: PFC.border }} />

        {PA && <PA value="€2.940" />}

        <div style={{ height: 1, background: PFC.border }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Heading20>You can also</Heading20>
          {LO && <LO icon="PencilLine"
            title="Update the amount" body="When your monthly rent or mortgage changes" />}
          {LO && <LO icon="ArrowLeftRight"
            title="Switch reimbursement type" body="Change between mortgage and rent" />}
          {LO && <LO icon="CircleStop"
            title="End reimbursement" body="Stop your monthly payouts" />}
        </div>

        <div style={{ height: 1, background: PFC.border }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Heading20>Transactions</Heading20>
          <div style={{ display: 'flex' }}>
            <div style={{
              width: 12, marginRight: 24,
              background: 'linear-gradient(rgb(234,169,254) 0%, rgba(189,169,254,0.1) 100%)',
              borderRadius: 12,
              alignSelf: 'stretch',
            }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
              {HOUSING_TX.map((t, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Body16 color={PFC.inkSoft} weight={500}>{t.month}</Body16>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Body16 color={PFC.ink} weight={500}>{t.label}</Body16>
                    <Body16 color={PFC.ink} weight={500}>{fmtEUR(t.amount)}</Body16>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: PFC.border }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Heading20>Attachments</Heading20>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button style={{
              width: '100%', appearance: 'none', background: 'transparent', border: 'none',
              padding: 0, cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Body16 color={PFC.purple} weight={500}>Repayment plan</Body16>
              <LucideIcon name="Download" size={20} color={PFC.purple} strokeWidth={2} />
            </button>
            <button style={{
              width: '100%', appearance: 'none', background: 'transparent', border: 'none',
              padding: 0, cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Body16 color={PFC.purple} weight={500}>Contract</Body16>
              <LucideIcon name="Download" size={20} color={PFC.purple} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <button style={{
            background: 'transparent', border: 'none', padding: 8, cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
            color: PFC.errorText,
          }}>Delete choice</button>
        </div>

        <Button variant="outline" size="large" fullWidth onClick={() => push('edit-housing-costs')}>Edit</Button>
      </div>
    </div>
  );
}
function Detail({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Body16 color={PFC.inkSoft} weight={500}>{label}</Body16>
      <Body16 color={PFC.ink} weight={500}>{value}</Body16>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Edit housing costs (interactive form)
// ─────────────────────────────────────────────────────────────
function EditHousingCostsScreen() {
  const { pop } = useNav();
  const [contribution, setContribution] = React.useState('700');
  const [nextDate, setNextDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('31/12/2026');
  const [proof, setProof] = React.useState(null);
  const [submitted, setSubmitted] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const errors = {
    contribution: submitted && (!contribution || isNaN(+contribution) || +contribution <= 0)
      ? 'Enter a positive amount' : null,
    nextDate: submitted && !/^\d{2}\/\d{2}\/\d{4}$/.test(nextDate)
      ? 'Use DD/MM/YYYY' : null,
    endDate: submitted && !/^\d{2}\/\d{2}\/\d{4}$/.test(endDate)
      ? 'Use DD/MM/YYYY' : null,
  };
  const valid = !errors.contribution && !errors.nextDate && !errors.endDate;

  const fileInputRef = React.useRef(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Heading28>Edit housing costs</Heading28>

        <Field
          label="Monthly contribution"
          type="number"
          value={contribution}
          onChange={setContribution}
          leftAdornment={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: PFC.ink }}>€</span>}
          error={errors.contribution}
        />

        <Field
          label="Next transaction date"
          value={nextDate}
          onChange={setNextDate}
          placeholder="DD/MM/YYYY"
          error={errors.nextDate}
          helper={!errors.nextDate ? 'June 2025 is the earliest date the edit can go into effect.' : null}
        />

        <Field
          label="End date"
          value={endDate}
          onChange={setEndDate}
          placeholder="DD/MM/YYYY"
          error={errors.endDate}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Body16 color={PFC.inkSoft} weight={500}>Upload proof</Body16>
          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              appearance: 'none', cursor: 'pointer',
              background: '#fff', border: `1px dashed ${PFC.borderHard}`, borderRadius: 12,
              padding: 16, textAlign: 'left', width: '100%',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
            <LucideIcon name="CloudUpload" size={20} color={PFC.inkSoft} strokeWidth={2} />
            <Body14 color={PFC.inkSoft} weight={500}>
              {proof ? proof : 'Drag and drop file here or choose file to upload'}
            </Body14>
          </button>
          <input
            ref={fileInputRef} type="file" style={{ display: 'none' }}
            onChange={(e) => e.target.files && e.target.files[0] && setProof(e.target.files[0].name)}
          />
        </div>

        <div style={{ flex: 1, minHeight: 8 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button variant="primary" size="large" fullWidth disabled={success}
            onClick={() => {
              setSubmitted(true);
              if (contribution && nextDate && endDate && +contribution > 0 &&
                  /^\d{2}\/\d{2}\/\d{4}$/.test(nextDate) && /^\d{2}\/\d{2}\/\d{4}$/.test(endDate)) {
                setSuccess(true);
                setTimeout(pop, 900);
              }
            }}>
            {success ? '✓ Saved' : 'Save'}
          </Button>
          <Button variant="ghost" size="large" fullWidth onClick={pop}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Unlock End of Year Premium — addendum signing flow
// ─────────────────────────────────────────────────────────────
function UnlockEoyScreen() {
  const { push, pop, switchTab } = useNav();

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Heading28>Unlock your end of year premium</Heading28>
          <Body16 color={PFC.inkSoft} weight={400} style={{ lineHeight: '24px' }}>
            By unlocking your end-of-year premium in Payflip, you already get access to it to spend it on benefits. Everything unused will be taxed and paid out as usual.
          </Body16>
        </div>

        {/* Comparison card */}
        <div style={{
          border: `1px solid ${PFC.border}`, borderRadius: 16, overflow: 'hidden',
          background: '#fff',
        }}>
          {/* If you sign */}
          <div style={{ padding: '20px 16px', borderBottom: `1px solid ${PFC.border}` }}>
            <Body14 color={PFC.inkSoft} weight={700} style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
              IF YOU SIGN
            </Body14>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, lineHeight: '40px',
              letterSpacing: '-0.01em', color: PFC.purple, marginTop: 4,
            }}>€680</div>
            <Body14 color={PFC.inkSoft} weight={500} style={{ marginTop: 4 }}>in net value via benefits</Body14>
          </div>
          {/* If you don't */}
          <div style={{ padding: '20px 16px' }}>
            <Body14 color={PFC.inkSoft} weight={700} style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 }}>
              IF YOU DON&apos;T
            </Body14>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, lineHeight: '40px',
              letterSpacing: '-0.01em', color: PFC.ink, marginTop: 4,
            }}>€450</div>
            <Body14 color={PFC.inkSoft} weight={500} style={{ marginTop: 4 }}>as cash after tax</Body14>
          </div>
        </div>

        {/* What you sign */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Heading20>What you sign</Heading20>
          <Body16 color={PFC.inkSoft} weight={400} style={{ lineHeight: '24px' }}>
            A short addendum to your labor contract. Belgian law requires one whenever salary becomes a flexible budget. It applies only to your end of year premium, other budgets keep their own signing.
          </Body16>
        </div>
      </div>

      {/* Sticky bottom: Sign + Read link */}
      <div style={{
        flexShrink: 0, background: '#fff',
        borderTop: `1px solid ${PFC.border}`,
        padding: '16px 16px 24px',
        display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center',
      }}>
        <Button variant="primary" size="large" fullWidth
          onClick={() => push('sign-addendum')}>
          Sign addendum
        </Button>
        <button style={{
          background: 'transparent', border: 'none', padding: '8px 0',
          cursor: 'pointer',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
          color: PFC.ink, textDecoration: 'underline',
        }}>Read the full addendum (2 pages)</button>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Sign addendum screen — signature pad + checkbox + submit
// ─────────────────────────────────────────────────────────────
function SignAddendumScreen() {
  const { switchTab } = useNav();
  const [signed, setSigned] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  // Fake David signature as an SVG path
  const signatureSvg = (
    <svg viewBox="0 0 260 80" style={{ width: '100%', height: '100%' }}>
      <path d="M20 55 C25 20, 35 15, 40 40 C45 60, 50 62, 52 45 C54 30, 58 28, 60 40 C62 55, 68 58, 72 42 C76 25, 78 20, 80 35 M90 25 C85 25, 82 32, 82 42 C82 55, 88 62, 95 60 C102 58, 105 48, 102 38 C99 28, 92 25, 90 25 M112 20 L112 58 M112 30 C118 22, 128 22, 130 35 C132 48, 125 58, 115 55 M140 20 L148 58 L156 20 M166 25 C160 32, 158 50, 166 58 C174 62, 182 50, 178 38 C174 28, 165 30, 166 40"
        fill="none" stroke={PFC.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ animation: signed ? 'drawSig 1s ease-out both' : 'none' }} />
    </svg>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <NavBar />
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <Heading28>Sign addendum</Heading28>

        {/* Document header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Body14 color={PFC.inkSoft} weight={500}>Addendum to labor contract</Body14>
          <Heading20>End of year premium – flexible benefits</Heading20>
        </div>

        {/* Contract summary card */}
        <div style={{
          background: '#F7F7F8', borderRadius: 16, padding: '20px 16px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 6, lineHeight: '24px', color: PFC.ink }}>●</span>
            <Body16 color={PFC.ink} weight={400} style={{ lineHeight: '24px' }}>
              This addendum modifies your existing employment contract dated 1 January 2023.
            </Body16>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 6, lineHeight: '24px', color: PFC.ink }}>●</span>
            <Body16 color={PFC.ink} weight={400} style={{ lineHeight: '24px' }}>
              <strong style={{ fontWeight: 700 }}>Article 1.</strong> The End of year premium of €1249.34 is converted into a flexible benefits budget effective immediately.
            </Body16>
          </div>
        </div>

        {/* Signature box */}
        <div style={{
          border: `1px solid ${PFC.border}`, borderRadius: 16,
          padding: '16px', display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <Body16 color={PFC.ink} weight={700}>Signature</Body16>
          <button
            onClick={() => !signed && setSigned(true)}
            style={{
              width: '100%', height: 100,
              background: '#F7F7F8', borderRadius: 12,
              border: `1px dashed ${signed ? 'transparent' : PFC.border}`,
              cursor: signed ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: signed ? '8px 16px' : 0,
              appearance: 'none',
            }}>
            {signed ? signatureSvg : (
              <Body14 color={PFC.inkSoft} weight={500}>Tap here to sign</Body14>
            )}
          </button>
        </div>

        {/* Checkbox */}
        <div style={{
          border: `1px solid ${PFC.border}`, borderRadius: 16,
          padding: '16px 16px',
        }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: 20, height: 20, marginTop: 2, accentColor: PFC.inkDarker, flex: 'none' }} />
            <Body14 color={PFC.ink} weight={500}>
              I've read the addendum and understand it modifies my labour contract
            </Body14>
          </label>
        </div>
      </div>

      {/* Sticky bottom CTA */}
      <div style={{
        flexShrink: 0, background: '#fff',
        borderTop: `1px solid ${PFC.border}`,
        padding: '16px 16px 24px',
      }}>
        <Button variant="primary" size="large" fullWidth
          disabled={!signed || !agreed || submitting || success}
          onClick={() => {
            setSubmitting(true);
            setTimeout(() => {
              setSubmitting(false);
              setSuccess(true);
              window.__eoyUnlocked = true;
            }, 1600);
          }}>
          {submitting ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: '50%',
                display: 'inline-block',
                animation: 'signSpin 0.7s linear infinite',
              }} />
              Signing…
            </span>
          ) : success ? '✓ Signed' : 'Sign addendum'}
        </Button>
      </div>

      {/* Success overlay */}
      {success && (
        <div style={{
          position: 'absolute', inset: 0, background: '#fff', zIndex: 10,
          display: 'flex', flexDirection: 'column',
          animation: 'fadeSlideIn 0.4s ease-out both',
        }}>
          <div style={{ padding: 16 }}>
            <button onClick={() => switchTab('home')} style={{
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
            }}>Budget unlocked!</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 500,
              fontSize: 15, lineHeight: '22px', color: PFC.inkSoft,
              textAlign: 'center', maxWidth: 280,
              animation: 'fadeSlideIn 0.4s ease-out 0.35s both',
            }}>Your end of year premium is now available to spend on benefits.</span>
            <div style={{ width: '100%', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, animation: 'fadeSlideIn 0.4s ease-out 0.45s both' }}>
              <Button variant="primary" size="large" fullWidth onClick={() => {
                switchTab('benefits');
              }}>View eligible benefits</Button>
              <Button variant="ghost" size="large" fullWidth onClick={() => switchTab('home')}>Back to home</Button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes signSpin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.5); }
          60%  { transform: scale(1.12); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes drawSig {
          from { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
          to   { stroke-dasharray: 1000; stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}

// Register all screens
registerScreen('sign-addendum', SignAddendumScreen);
registerScreen('unlock-eoy', UnlockEoyScreen);
registerScreen('budgets', BudgetsScreen);
registerScreen('bonus', BonusScreen);
registerScreen('end-of-year-premium', EndOfYearScreen);
registerScreen('mobility-detail', MobilityDetailScreen);
registerScreen('meal-vouchers', MealVouchersScreenSimple);
registerScreen('withdraw-cash', WithdrawCashScreen);
registerScreen('simulate-cash-out', SimulateCashOutScreen);
registerScreen('transactions', TransactionsScreen);
registerScreen('housing-costs', HousingCostsScreen);
registerScreen('edit-housing-costs', EditHousingCostsScreen);
registerScreen('eligible-benefits', EligibleBenefitsScreen);
registerScreen('single-transaction', SingleTransactionScreen);

// ─────────────────────────────────────────────────────────────
// Single (one-time) transaction detail — same layout as housing costs
// ─────────────────────────────────────────────────────────────
function SingleTransactionScreen({ tx }) {
  const { pop } = useNav();
  const ST = window.StatusTimeline;
  const PA = window.PayflipAdvantageBlock;
  const DR = window.DetailRow;
  const LO = window.LifecycleOption;
  const item = tx || { name: 'Smartphone', date: '23 jan 2024', amount: 849.00, budget: 'Bonus' };

  const TIMELINE = [
    { title: 'Order placed',   meta: item.date },
    { title: 'Admin approved', meta: 'HR verified your request' },
    { title: 'Paid',           meta: `${fmtEUR(item.amount)} deducted from your budget` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <NavBar onBack={pop} />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <Heading28>{item.name}</Heading28>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Heading20>Status</Heading20>
          {ST && <ST steps={TIMELINE} currentIndex={2} />}
        </div>

        <div style={{ height: 1, background: PFC.border }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Heading20>Details</Heading20>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {DR && <DR label="Item" value={item.name} />}
            {DR && <DR label="Amount" value={fmtEUR(item.amount)} />}
            {DR && <DR label="Date" value={item.date} />}
            {DR && <DR label="Budget" value={item.budget} />}
            {DR && <DR label="Type" value="One-time purchase" />}
          </div>
        </div>

        <div style={{ height: 1, background: PFC.border }} />

        {PA && <PA value={fmtEUR(item.amount * 0.35)} />}

        <div style={{ height: 1, background: PFC.border }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Heading20>Attachments</Heading20>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button style={{
              width: '100%', appearance: 'none', background: 'transparent', border: 'none',
              padding: 0, cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Body16 color={PFC.purple} weight={500}>Invoice</Body16>
              <LucideIcon name="Download" size={20} color={PFC.purple} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Eligible benefits screen
// ─────────────────────────────────────────────────────────────
function EligibleBenefitsScreen({ budget = 'mobility' }) {
  const { push } = useNav();
  const data = ELIGIBLE[budget] || ELIGIBLE.mobility;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Heading28>Eligible benefits</Heading28>
        <Body16 color={PFC.inkSoft} weight={500}>
          Spend your <b style={{ color: PFC.ink }}>{data.label}</b> on any of these.
        </Body16>
        <CardBox padded={false}>
          <div style={{ padding: '0 16px' }}>
            {data.items.map((it, i) => (
              <ListRow key={it.id}
                divider={i !== 0}
                leading={<IconTile name={it.icon} size={40} iconSize={22} />}
                title={it.name}
                subtitle={it.provider}
                onClick={() => {
                  if (it.route) push(...it.route);
                }}
              />
            ))}
          </div>
        </CardBox>
      </div>
    </div>
  );
}
