// O2O Bike Lease flow — integrated into the Payflip employee app prototype.
// Single registered screen 'bike-lease-o2o' manages all 5 steps internally.

// ── Constants ─────────────────────────────────────────────────────────────────
const O2O_NSSO_RATE             = 0.1307;
const O2O_INCOME_TAX_RATE       = 0.40;
const O2O_COMPANY_CONTRIB       = 20;
const O2O_AVAILABLE_BUDGET      = 3200;

const O2O_BUDGETS = [
  { id: 'eoy',   label: 'End-of-year premium', amount: 2400 },
  { id: 'bonus', label: 'Bonus',                amount: 800  },
];

const O2O_QUOTES = [
  {
    id: 'q1',
    bike:           'Canyon Roadlite:ON 7',
    cataloguePrice: 3200,
    restPrice:      800,
    leasePeriod:    48,
    dealer:         'Fietsen De Waele, Gent',
    quoteRef:       'O2O-2026-4821',
  },
  {
    id: 'q2',
    bike:           'Specialized Turbo Vado SL 4.0',
    cataloguePrice: 4100,
    restPrice:      1025,
    leasePeriod:    60,
    dealer:         'Cyclo Mechelen',
    quoteRef:       'O2O-2026-4836',
  },
];

const O2O_EXAMPLE_QUOTE = { cataloguePrice: 3000, restPrice: 900, leasePeriod: 48 };

const O2O_TIMELINE = [
  { title: 'After you click Submit choice', desc: 'Your choice is submitted for admin review.' },
  { title: 'Admin approves',               desc: 'Your employer confirms the bike lease request.' },
  { title: 'O2O processes the order',      desc: 'O2O coordinates the order with your dealer.' },
  { title: 'Bike delivered',               desc: 'Typically 2 to 4 weeks after approval.' },
  { title: 'Lease active',                 desc: 'Monthly salary sacrifice starts from your chosen budget.' },
];

const O2O_FAQS = [
  { q: 'What bikes can I choose?',             a: 'You can lease any bike available via the O2O portal, including e-bikes, road bikes, city bikes, and cargo bikes. Choose a bike from a participating local dealer, or browse the O2O online catalogue.' },
  { q: 'What happens at the end of the lease?', a: 'At the end of your lease period, you have the option to buy the bike at the buyout price confirmed in your O2O quote. You can also choose to return it.' },
  { q: 'Can I cancel before it starts?',        a: 'Yes — you can cancel your choice in Payflip as long as admin has not yet approved it. Once approved and the bike order is placed, cancellation is no longer possible.' },
  { q: 'What if my bike gets stolen or damaged?', a: 'O2O requires you to take out insurance for your leased bike. Insurance options are available via the O2O portal when you request your quote.' },
];

function o2oCalcQuote(q) {
  const net           = q.cataloguePrice - q.restPrice;
  const monthly       = Math.round(net / q.leasePeriod);
  const empMonth      = monthly - O2O_COMPANY_CONTRIB;
  const cashNet       = Math.round(net * (1 - O2O_NSSO_RATE - O2O_INCOME_TAX_RATE));
  const advantage     = net - cashNet;
  const now           = new Date();
  const remainingMonths = 12 - (now.getMonth() + 1);
  const yearOneTotal  = empMonth * remainingMonths;
  const fullYearTotal = empMonth * 12;
  const nextYear      = now.getFullYear() + 1;
  const currentYear   = now.getFullYear();
  return { net, monthly, empMonth, cashNet, advantage, yearOneTotal, remainingMonths, fullYearTotal, nextYear, currentYear };
}

const o2oFmt = n => Number(n).toLocaleString('de-BE');

// ── Shared atoms ──────────────────────────────────────────────────────────────

const BLHr = ({ my = 10 }) => (
  <div style={{ height: 1, background: PFC.border, margin: `${my}px 0` }} />
);

const BLSecLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: PFC.purple, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'var(--font-display)' }}>
    ✦ {children}
  </div>
);

const BLTag = ({ children }) => (
  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: '#f3f4f6', fontSize: 12, color: PFC.inkSoft, fontWeight: 500, lineHeight: 1.5, fontFamily: 'var(--font-display)' }}>
    {children}
  </span>
);

const BLHandle = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 6px' }}>
    <div style={{ width: 36, height: 4, borderRadius: 2, background: PFC.border }} />
  </div>
);

const BLRadioDot = ({ on }) => (
  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${on ? PFC.inkDarker : PFC.borderHard}`, background: on ? PFC.inkDarker : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    {on && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />}
  </div>
);

const BLTickIcon = () => (
  <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
    <path d="M1 4.5l3.5 3.5 5.5-7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BLSparkIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1l1.4 4.1L13 7l-4.6 1.9L7 13l-1.4-4.1L1 7l4.6-1.9L7 1z" fill={color || PFC.purple}/>
  </svg>
);

const BLBikeIcon = () => (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
    <circle cx="6" cy="18" r="4.5" stroke={PFC.purple} strokeWidth="2"/>
    <circle cx="20" cy="18" r="4.5" stroke={PFC.purple} strokeWidth="2"/>
    <path d="M6 18l5-9h3L20 18M11 9h4" stroke={PFC.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="13" cy="7.5" r="1.5" fill={PFC.purple}/>
  </svg>
);

// ── Stepper ───────────────────────────────────────────────────────────────────
const BLStepper = ({ step, total }) => (
  <div style={{ padding: '0 20px', marginBottom: 16 }}>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, marginBottom: 6, fontWeight: 500 }}>Step {step} of {total}</div>
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? PFC.inkDarker : PFC.border }} />
      ))}
    </div>
  </div>
);

// ── Budget header ─────────────────────────────────────────────────────────────
const BLBudgetHdr = () => (
  <div style={{ padding: '0 20px', marginBottom: 14 }}>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: PFC.inkSoft, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      YOU HAVE €{o2oFmt(O2O_AVAILABLE_BUDGET)} AVAILABLE
    </div>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, marginTop: 2 }}>
      across your End-of-year premium and Bonus
    </div>
  </div>
);

// ── FAQ accordion ─────────────────────────────────────────────────────────────
function BLFaqAccordion() {
  const [open, setOpen] = React.useState(null);
  return (
    <div style={{ background: '#fbfbfb', borderRadius: 20, padding: 24 }}>
      <BLSecLabel>Frequently asked questions</BLSecLabel>
      {O2O_FAQS.map((item, i) => (
        <div key={i} style={{ borderBottom: i < O2O_FAQS.length - 1 ? `1px solid ${PFC.border}` : 'none' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', textAlign: 'left', gap: 12, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: PFC.ink, lineHeight: 1.4 }}>{item.q}</div>
            <div style={{ fontSize: 18, color: PFC.inkSoft, flexShrink: 0, transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.15s', lineHeight: 1 }}>+</div>
          </button>
          {open === i && (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: PFC.inkSoft, lineHeight: 1.6, paddingBottom: 14 }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Advantage modal ───────────────────────────────────────────────────────────
function BLAdvModal({ quote, onClose, isExample }) {
  const src       = isExample ? O2O_EXAMPLE_QUOTE : quote;
  const net       = src.cataloguePrice - src.restPrice;
  const nsso      = Math.round(net * O2O_NSSO_RATE);
  const tax       = Math.round(net * O2O_INCOME_TAX_RATE);
  const cashNet   = Math.round(net * (1 - O2O_NSSO_RATE - O2O_INCOME_TAX_RATE));
  const advantage = net - cashNet;

  return (
    <div style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxHeight: '88vh', overflowY: 'auto' }}>
      <BLHandle />
      <div style={{ padding: '4px 20px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: PFC.ink }}>How it's calculated</div>
          <button onClick={onClose} style={{ color: PFC.inkSoft, padding: 6, borderRadius: 8, background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <LucideIcon name="X" size={18} color={PFC.inkSoft} strokeWidth={2} />
          </button>
        </div>

        {isExample && (
          <div style={{ background: '#fef9c3', borderRadius: 16, padding: '14px 16px', marginBottom: 16, border: '1px solid #fde68a' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Illustrative example</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
              You haven't selected a quote yet. The numbers below are based on a typical bike to show how the calculation works.
            </div>
          </div>
        )}

        <div style={{ background: isExample ? '#f9fafb' : PFC.purpleTile, borderRadius: 16, padding: 16, marginBottom: 16, border: isExample ? `1px solid ${PFC.border}` : 'none' }}>
          <BLSecLabel>{isExample ? 'Example bike' : 'From your O2O quote'}</BLSecLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, marginBottom: 3 }}>Catalogue price</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: PFC.ink, fontVariantNumeric: 'tabular-nums' }}>€{o2oFmt(src.cataloguePrice)}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: PFC.inkSoft, marginTop: 2, lineHeight: 1.4 }}>Dealer offer + services</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, marginBottom: 3 }}>Buyout at lease end</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: PFC.ink, fontVariantNumeric: 'tabular-nums' }}>€{o2oFmt(src.restPrice)}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: PFC.inkSoft, marginTop: 2, lineHeight: 1.4 }}>Your purchase option</div>
            </div>
          </div>
          <BLHr my={8} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: PFC.inkDarker }}>Net lease value</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft }}>Catalogue minus Buyout</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: PFC.inkDarker, fontVariantNumeric: 'tabular-nums' }}>€{o2oFmt(net)}</div>
          </div>
        </div>

        <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${PFC.border}`, marginBottom: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr' }}>
            <div style={{ padding: '10px 14px', background: '#f9fafb' }} />
            <div style={{ padding: '10px 8px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: PFC.inkSoft, textAlign: 'center', background: '#f9fafb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cash</div>
            <div style={{ padding: '10px 8px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: PFC.inkDarker, textAlign: 'center', background: PFC.purpleTile, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payflip</div>
          </div>
          {[
            { label: 'Gross value',        cash: `€${o2oFmt(net)}`,   pay: `€${o2oFmt(net)}`, pc: PFC.ink },
            { label: 'NSSO (13.07%)',       cash: `-€${o2oFmt(nsso)}`, pay: 'Exempt',          pc: PFC.successText },
            { label: 'Income tax (~40%)',   cash: `-€${o2oFmt(tax)}`,  pay: 'Exempt',          pc: PFC.successText },
          ].map((r, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr', borderTop: `1px solid ${PFC.border}` }}>
              <div style={{ padding: '10px 14px', fontFamily: 'var(--font-display)', fontSize: 13, color: PFC.inkSoft, lineHeight: 1.3 }}>{r.label}</div>
              <div style={{ padding: '10px 8px', fontFamily: 'var(--font-display)', fontSize: 13, color: r.cash.includes('-') ? '#ef4444' : PFC.inkSoft, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{r.cash}</div>
              <div style={{ padding: '10px 8px', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 500, color: r.pc, textAlign: 'center', background: '#fdf8ff' }}>{r.pay}</div>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr', borderTop: `2px solid ${PFC.border}` }}>
            <div style={{ padding: '12px 14px', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: PFC.ink, background: '#f9fafb' }}>Net value</div>
            <div style={{ padding: '12px 8px', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: PFC.ink, textAlign: 'center', background: '#f9fafb', fontVariantNumeric: 'tabular-nums' }}>€{o2oFmt(cashNet)}</div>
            <div style={{ padding: '12px 8px', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: PFC.inkDarker, textAlign: 'center', background: PFC.purpleTile, fontVariantNumeric: 'tabular-nums' }}>€{o2oFmt(net)}</div>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, lineHeight: 1.5, marginBottom: 14, padding: '0 2px' }}>
          NSSO rate of 13.07% is fixed. Income tax is estimated at ~40% based on a typical Belgian salary. Your actual advantage depends on your personal tax bracket.
        </div>

        <div style={{ background: PFC.inkDarker, borderRadius: 16, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BLSparkIcon color={PFC.purple} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{isExample ? 'Example advantage' : 'Estimated advantage'}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                {isExample ? 'Based on example numbers above' : 'Based on your O2O quote + typical tax rates'}
              </div>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: PFC.purple, fontVariantNumeric: 'tabular-nums' }}>+€{o2oFmt(advantage)}</div>
        </div>
      </div>
    </div>
  );
}

// ── Edit budget modal ─────────────────────────────────────────────────────────
function BLEditModal({ current, onSave, onClose }) {
  const [val, setVal] = React.useState(current);
  return (
    <div style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', padding: '0 20px 32px' }}>
      <BLHandle />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 4 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: PFC.ink }}>Change budget</div>
        <button onClick={onClose} style={{ padding: 6, borderRadius: 8, background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex' }}>
          <LucideIcon name="X" size={18} color={PFC.inkSoft} strokeWidth={2} />
        </button>
      </div>
      {O2O_BUDGETS.map(b => (
        <button key={b.id} onClick={() => setVal(b.id)} style={{
          width: '100%', marginBottom: 10, padding: '15px 16px', borderRadius: 16, textAlign: 'left',
          border: val === b.id ? `2px solid ${PFC.inkDarker}` : `1.5px solid ${PFC.border}`,
          background: val === b.id ? PFC.purpleTile : 'white',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: PFC.ink }}>{b.label}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: PFC.inkSoft, fontVariantNumeric: 'tabular-nums' }}>€{o2oFmt(b.amount)} available</div>
            {val === b.id && (
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: PFC.inkDarker, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BLTickIcon />
              </div>
            )}
          </div>
        </button>
      ))}
      <button onClick={() => onSave(val)} style={{ width: '100%', marginTop: 6, padding: '14px', borderRadius: 12, background: PFC.inkDarker, color: 'white', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer' }}>
        Save
      </button>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
function BikeLeaseO2OScreen() {
  const { pop } = useNav();
  const [step,   setStep]   = React.useState(0);
  const [quote,  setQuote]  = React.useState(null);
  const [budget, setBudget] = React.useState('eoy');
  const [modal,  setModal]  = React.useState(null);
  const [tcs,    setTcs]    = React.useState(false);
  const [tcsErr, setTcsErr] = React.useState(false);

  const goTo = (s) => { setStep(s); };
  const back = () => setStep(s => Math.max(0, s - 1));

  const activeQuote = quote || O2O_QUOTES[0];
  const activeBudget = O2O_BUDGETS.find(x => x.id === budget);
  const c = o2oCalcQuote(activeQuote);

  // ── Moderator nav ──────────────────────────────────────────
  const modBar = (
    <div style={{ display: 'flex', gap: 4, padding: '5px 12px 5px', borderBottom: `1px solid ${PFC.border}`, background: '#f7f7f8', flexShrink: 0 }}>
      {['Intro', 'Select', 'Budget', 'Review', 'Done'].map((label, i) => {
        const active = step === i;
        return (
          <button key={i} onClick={() => goTo(i)} style={{
            flex: 1, padding: '3px 0', borderRadius: 6,
            border: `1px solid ${active ? PFC.inkDarker : PFC.border}`,
            background: active ? PFC.inkDarker : 'transparent',
            color: active ? 'white' : PFC.inkSoft,
            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 9, cursor: 'pointer',
          }}>{label}</button>
        );
      })}
    </div>
  );

  // ── Top bar helpers ────────────────────────────────────────
  const btnStyle = { width: 36, height: 36, borderRadius: 999, border: `1px solid ${PFC.border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };

  const topBarXOnly = (
    <div style={{ padding: '8px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexShrink: 0 }}>
      <button onClick={pop} style={btnStyle}><LucideIcon name="X" size={18} color={PFC.ink} strokeWidth={2} /></button>
    </div>
  );

  const topBarBackX = (title) => (
    <div style={{ padding: '8px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
      <button onClick={back} style={btnStyle}><LucideIcon name="ChevronLeft" size={20} color={PFC.ink} strokeWidth={2} /></button>
      {title && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: PFC.inkSoft }}>{title}</span>}
      <button onClick={pop} style={btnStyle}><LucideIcon name="X" size={18} color={PFC.ink} strokeWidth={2} /></button>
    </div>
  );

  // ── Sticky footer helper ───────────────────────────────────
  const stickyFooter = (children, extraPad) => (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderTop: `1px solid ${PFC.border}`, padding: extraPad || '12px 20px 28px' }}>
      {children}
    </div>
  );

  const primaryBtn = (label, onClick, icon) => (
    <button onClick={onClick} style={{ width: '100%', padding: '14px', borderRadius: 12, background: PFC.inkDarker, color: 'white', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      {label}{icon && <LucideIcon name={icon} size={16} color="white" strokeWidth={2.5} />}
    </button>
  );

  // ── Step 0: Intro ──────────────────────────────────────────
  const repAdv = o2oCalcQuote(O2O_QUOTES[0]).advantage;

  const introScreen = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f2f2f2', position: 'relative' }}>
      {modBar}
      {topBarXOnly}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 8px 100px', display: 'flex', flexDirection: 'column', gap: 8 }}>

        <div style={{ background: '#fbfbfb', borderRadius: 20, padding: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: PFC.purpleTile, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>🚴</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            <BLTag>External provider</BLTag>
            <BLTag>Once a year</BLTag>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: PFC.ink, marginBottom: 8, lineHeight: 1.2 }}>Bike lease</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: PFC.inkSoft, lineHeight: 1.7 }}>
            Lease a bike tax-free through O2O and pay for it with your gross End-of-year premium or Bonus.
          </div>
        </div>

        <div style={{ background: '#fbfbfb', borderRadius: 20, padding: '16px 20px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: PFC.inkSoft, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Funded by</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['End-of-year premium', 'Bonus'].map(label => (
              <span key={label} style={{ padding: '6px 14px', borderRadius: 20, background: '#ddebff', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 500, color: '#1568cd' }}>{label}</span>
            ))}
          </div>
        </div>

        <div style={{ background: '#fbfbfb', borderRadius: 20, padding: 24 }}>
          <BLSecLabel>Why this works</BLSecLabel>
          {[
            ['🛡️', 'Exempt from NSSO and income tax'],
            ['🚲', 'Any bike via the O2O portal and your local dealer'],
            ['💰', `Your employer contributes €${O2O_COMPANY_CONTRIB}/month toward your lease`],
            ['📋', 'Lease period is confirmed in O2O'],
          ].map(([icon, text], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < 3 ? 12 : 0 }}>
              <div style={{ fontSize: 18, width: 26, textAlign: 'center', flexShrink: 0, marginTop: 1 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: PFC.inkSoft, lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}
        </div>

        <div style={{ background: PFC.inkDarker, borderRadius: 20, padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: PFC.purple, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>✦ What you gain</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>
              Payflip tax advantage<br/>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Illustrative — based on a typical bike</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: PFC.purple, fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: 12 }}>+€{o2oFmt(repAdv)}</div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 14, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>
              🎁 Employer contribution<br/>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>€{O2O_COMPANY_CONTRIB}/month — €{o2oFmt(O2O_COMPANY_CONTRIB * 12)}/year</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: 12 }}>+€{o2oFmt(O2O_COMPANY_CONTRIB * 12)}</div>
          </div>
          <button onClick={() => setModal('adv')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(196,43,252,0.15)', border: '1px solid rgba(196,43,252,0.35)', borderRadius: 10, color: PFC.purple, fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <LucideIcon name="Info" size={14} color={PFC.purple} strokeWidth={1.5} /> How is this calculated?
          </button>
        </div>

        <BLFaqAccordion />

        <div style={{ background: '#fbfbfb', borderRadius: 20, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, color: PFC.inkDarker, fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
            <LucideIcon name="ExternalLink" size={13} color={PFC.inkDarker} strokeWidth={1.5} /> More about bike leasing
          </button>
          <BLHr my={0} />
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, color: PFC.inkSoft, fontFamily: 'var(--font-display)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>
            <LucideIcon name="ExternalLink" size={13} color={PFC.inkSoft} strokeWidth={1.5} /> Terms and conditions
          </button>
        </div>
      </div>
      {stickyFooter(primaryBtn('Choose this benefit', () => goTo(1)))}
    </div>
  );

  // ── Step 1: Select quote ───────────────────────────────────
  const selectScreen = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f2f2f2', position: 'relative' }}>
      {modBar}
      {topBarBackX('Configure')}
      <div style={{ padding: '12px 0 0', flexShrink: 0 }}><BLStepper step={1} total={2} /></div>
      <BLBudgetHdr />
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 100px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ padding: '0 12px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: PFC.ink, marginBottom: 6 }}>Select your bike</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: PFC.inkSoft, lineHeight: 1.6, marginBottom: 4 }}>
            Your O2O quotes are shown below. Select the one you want to lease.
          </div>
        </div>

        {O2O_QUOTES.map(q => {
          const qc = o2oCalcQuote(q);
          const isSel = quote?.id === q.id;
          return (
            <button key={q.id} onClick={() => setQuote(isSel ? null : q)} style={{ width: '100%', textAlign: 'left', borderRadius: 20, border: isSel ? `2px solid ${PFC.inkDarker}` : `1.5px solid ${PFC.border}`, background: isSel ? PFC.purpleTile : '#fbfbfb', padding: 0, overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ padding: '20px 20px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: isSel ? 'white' : PFC.purpleTile, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BLBikeIcon />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: PFC.ink, lineHeight: 1.3 }}>{q.bike}</div>
                    <BLRadioDot on={isSel} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, marginTop: 3 }}>{q.dealer}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: PFC.inkSoft, marginTop: 1, opacity: 0.7 }}>Ref: {q.quoteRef}</div>
                </div>
              </div>
              <div style={{ margin: '0 20px', borderTop: `1px solid ${isSel ? 'rgba(34,10,53,0.12)' : PFC.border}`, paddingTop: 16, paddingBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: PFC.inkSoft, marginBottom: 4, opacity: 0.7 }}>Payflip advantage</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: PFC.purple, fontVariantNumeric: 'tabular-nums' }}>+€{o2oFmt(qc.advantage)}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: PFC.inkSoft, marginTop: 2, opacity: 0.7 }}>vs taking as cash</div>
                  </div>
                  <div style={{ borderLeft: `1px solid ${isSel ? 'rgba(34,10,53,0.1)' : PFC.border}`, paddingLeft: 12 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: PFC.inkSoft, marginBottom: 4, opacity: 0.7 }}>Year 1 budget impact</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: PFC.inkDarker, fontVariantNumeric: 'tabular-nums' }}>~€{o2oFmt(qc.yearOneTotal)}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: PFC.inkSoft, marginTop: 2, opacity: 0.7 }}>€{o2oFmt(qc.empMonth)}/month · {qc.remainingMonths} months</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: isSel ? 'rgba(124,58,237,0.08)' : '#f5f3ff', borderRadius: 10, padding: '7px 12px' }}>
                  <span style={{ fontSize: 15 }}>🎁</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#5b21b6', fontWeight: 500 }}>
                    Your employer contributes €{O2O_COMPANY_CONTRIB}/month — already factored in above
                  </span>
                </div>
              </div>
            </button>
          );
        })}

        <div style={{ background: '#fbfbfb', borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: PFC.purpleTile, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BLBikeIcon />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: PFC.ink }}>Don't see your quote?</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: PFC.inkSoft }}>o2obike.be</div>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: PFC.inkSoft, lineHeight: 1.7, marginBottom: 14 }}>
            Create a quote on the O2O portal and it will appear here automatically.
          </div>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: PFC.inkDarker, color: 'white', borderRadius: 10, fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            Open O2O portal <LucideIcon name="ExternalLink" size={13} color="white" strokeWidth={2} />
          </button>
        </div>
      </div>
      {quote && stickyFooter(primaryBtn('Continue', () => goTo(2), 'ChevronRight'))}
    </div>
  );

  // ── Step 2: Budget ─────────────────────────────────────────
  const budgetScreen = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f2f2f2', position: 'relative' }}>
      {modBar}
      {topBarBackX('Configure')}
      <div style={{ padding: '12px 0 0', flexShrink: 0 }}><BLStepper step={2} total={2} /></div>
      <BLBudgetHdr />
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 130px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ background: '#fbfbfb', borderRadius: 20, padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: PFC.ink, marginBottom: 6 }}>Which budget covers this?</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: PFC.inkSoft, lineHeight: 1.6, marginBottom: 16 }}>
            The annual amount is what gets deducted from your budget each year of the lease.
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f5e2fe 0%, #fdf8ff 100%)', borderRadius: 16, padding: '16px 18px', marginBottom: 16, border: '1px solid rgba(196,43,252,0.15)' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>🎁</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: PFC.inkDarker, marginBottom: 4 }}>
              Your employer contributes €{O2O_COMPANY_CONTRIB}/month
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: PFC.inkSoft, lineHeight: 1.6 }}>
              That's €{o2oFmt(O2O_COMPANY_CONTRIB * 12)} per year — your company's way of keeping you fit and healthy on two wheels.
            </div>
          </div>
          {O2O_BUDGETS.map(bdg => (
            <button key={bdg.id} onClick={() => setBudget(bdg.id)} style={{ width: '100%', marginBottom: 10, padding: '15px 16px', borderRadius: 16, textAlign: 'left', border: budget === bdg.id ? `2px solid ${PFC.inkDarker}` : `1.5px solid ${PFC.border}`, background: budget === bdg.id ? PFC.purpleTile : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: PFC.ink }}>{bdg.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: PFC.inkSoft, marginTop: 2 }}>€{o2oFmt(bdg.amount)} available · €{o2oFmt(c.fullYearTotal)}/yr from {c.nextYear}</div>
              </div>
              {budget === bdg.id && (
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: PFC.inkDarker, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BLTickIcon />
                </div>
              )}
            </button>
          ))}
          <div style={{ background: '#f8f8f8', borderRadius: 14, padding: '14px 16px', marginTop: 4 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: PFC.inkSoft, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Annual budget impact</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: PFC.ink }}>From {c.nextYear} onwards</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: PFC.inkDarker, fontVariantNumeric: 'tabular-nums' }}>€{o2oFmt(c.fullYearTotal)}/yr</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, marginBottom: 10 }}>12 months · ongoing annual commitment</div>
            <div style={{ background: 'white', borderRadius: 10, padding: '9px 12px', marginBottom: 12, border: `1px solid ${PFC.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft }}>{c.currentYear} only (pro rata)</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: PFC.inkSoft, fontVariantNumeric: 'tabular-nums' }}>~€{o2oFmt(c.yearOneTotal)}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: PFC.inkSoft, marginTop: 2, opacity: 0.7 }}>Only {c.remainingMonths} months remaining this year</div>
            </div>
            <BLHr my={0} />
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Monthly lease payment', val: `€${o2oFmt(c.monthly)}/month`, color: PFC.inkSoft, bold: false },
                { label: 'Employer contribution', val: `-€${O2O_COMPANY_CONTRIB}/month`, color: '#7c3aed', bold: false },
                { label: 'You pay', val: `€${o2oFmt(c.empMonth)}/month`, color: PFC.ink, bold: true },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: row.color, fontWeight: row.bold ? 600 : 400 }}>{row.label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: row.color, fontWeight: row.bold ? 700 : 400, fontVariantNumeric: 'tabular-nums' }}>{row.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {stickyFooter(
        <React.Fragment>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, fontWeight: 500 }}>{activeBudget?.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, marginTop: 2 }}>€{o2oFmt(c.empMonth)}/month · from {c.nextYear}: €{o2oFmt(c.fullYearTotal)}/yr</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: PFC.inkSoft }}>From {c.nextYear} onwards</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: PFC.inkDarker, fontVariantNumeric: 'tabular-nums' }}>€{o2oFmt(c.fullYearTotal)}/yr</div>
            </div>
          </div>
          {primaryBtn('Continue', () => goTo(3), 'ChevronRight')}
        </React.Fragment>,
        '12px 20px 28px'
      )}
    </div>
  );

  // ── Step 3: Review ─────────────────────────────────────────
  const reviewScreen = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f2f2f2', position: 'relative' }}>
      {modBar}
      {topBarBackX('Review your choice')}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 8px 140px', display: 'flex', flexDirection: 'column', gap: 8 }}>

        <div style={{ background: '#fbfbfb', borderRadius: 20, padding: 24 }}>
          <div style={{ paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${PFC.border}` }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Bike</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: PFC.ink }}>{activeQuote.bike}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: PFC.inkSoft, marginTop: 2 }}>{activeQuote.dealer} · {activeQuote.quoteRef}</div>
          </div>
          <div style={{ paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${PFC.border}` }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Lease period</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: PFC.ink }}>{activeQuote.leasePeriod} months</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, marginTop: 2 }}>Confirmed in O2O</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Paid from</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: PFC.ink }}>{activeBudget?.label}</div>
            </div>
            <button onClick={() => setModal('budget')} style={{ border: `1px solid ${PFC.border}`, borderRadius: 8, padding: '6px 14px', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 500, color: PFC.inkSoft, background: 'white', cursor: 'pointer' }}>
              Edit
            </button>
          </div>
        </div>

        <div style={{ background: '#fbfbfb', borderRadius: 20, padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: PFC.inkSoft, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Financial summary</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: PFC.ink }}>From {c.nextYear} onwards</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: PFC.inkDarker, fontVariantNumeric: 'tabular-nums' }}>€{o2oFmt(c.fullYearTotal)}/yr</div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, marginBottom: 8 }}>12 months per year · from {activeBudget?.label}</div>
          <div style={{ background: '#f8f8f8', borderRadius: 10, padding: '9px 12px', marginBottom: 14, border: `1px solid ${PFC.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft }}>{c.currentYear} only (pro rata)</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: PFC.inkSoft, fontVariantNumeric: 'tabular-nums' }}>~€{o2oFmt(c.yearOneTotal)}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: PFC.inkSoft, marginTop: 2, opacity: 0.7 }}>Only {c.remainingMonths} months remaining this year</div>
          </div>
          <BLHr my={0} />
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
            {[
              { label: 'Monthly lease payment', val: `€${o2oFmt(c.monthly)}/month`, color: PFC.inkSoft, bold: false },
              { label: 'Employer contribution 🎁', val: `-€${O2O_COMPANY_CONTRIB}/month`, color: '#7c3aed', bold: false },
              { label: 'You pay', val: `€${o2oFmt(c.empMonth)}/month`, color: PFC.ink, bold: true },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: row.color, fontWeight: row.bold ? 600 : 400 }}>{row.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: row.color, fontWeight: row.bold ? 700 : 400, fontVariantNumeric: 'tabular-nums' }}>{row.val}</div>
              </div>
            ))}
          </div>
          <BLHr />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                <BLSparkIcon /><span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: PFC.purple }}>Payflip advantage</span>
              </div>
              <button onClick={() => setModal('adv')} style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkDarker, fontWeight: 500, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
                How is this calculated?
              </button>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: PFC.purple, fontVariantNumeric: 'tabular-nums' }}>+€{o2oFmt(c.advantage)}</div>
          </div>
        </div>

        <div style={{ background: '#fbfbfb', borderRadius: 20, padding: '18px 20px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <button
              onClick={() => { setTcs(!tcs); setTcsErr(false); }}
              style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1, background: tcs ? PFC.inkDarker : 'white', border: tcs ? `2px solid ${PFC.inkDarker}` : tcsErr ? '2px solid #ef4444' : `2px solid ${PFC.borderHard}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {tcs && <BLTickIcon />}
            </button>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: PFC.inkSoft, lineHeight: 1.6 }}>
              I agree to the{' '}
              <span style={{ color: PFC.inkDarker, fontWeight: 500, textDecoration: 'underline' }}>terms and conditions</span>
              {' '}of the O2O bike lease.
            </div>
          </div>
          {tcsErr && <div style={{ marginTop: 8, marginLeft: 34, fontFamily: 'var(--font-display)', fontSize: 13, color: '#ef4444' }}>Please agree to the terms to continue.</div>}
        </div>
      </div>
      {stickyFooter(
        <React.Fragment>
          <div style={{ fontFamily: 'var(--font-display)', textAlign: 'center', fontSize: 13, color: PFC.inkSoft, marginBottom: 10 }}>
            €{o2oFmt(c.empMonth)}/month salary-sacrificed from your {activeBudget?.label} upon confirmation
          </div>
          <button
            onClick={() => { if (!tcs) { setTcsErr(true); return; } goTo(4); }}
            style={{ width: '100%', padding: '14px', borderRadius: 12, background: PFC.inkDarker, color: 'white', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer' }}
          >
            Submit choice
          </button>
        </React.Fragment>
      )}
    </div>
  );

  // ── Step 4: Success ────────────────────────────────────────
  const successScreen = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f2f2f2', position: 'relative' }}>
      {modBar}
      {topBarXOnly}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 140px' }}>
        <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: 20 }}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#22c55e" opacity="0.1"/>
              <circle cx="32" cy="32" r="22" fill="#22c55e" opacity="0.18"/>
              <circle cx="32" cy="32" r="14" fill="#22c55e"/>
              <path d="M24 32l6 6 10-12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: PFC.ink, textAlign: 'center', marginBottom: 8, lineHeight: 1.2 }}>Bike lease submitted!</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: PFC.inkSoft, textAlign: 'center', lineHeight: 1.7, marginBottom: 28, fontVariantNumeric: 'tabular-nums' }}>
            {activeQuote.bike} · €{o2oFmt(c.empMonth)}/month from {activeBudget?.label} · {activeQuote.leasePeriod} months · awaiting admin approval
          </div>
        </div>
        <div style={{ background: '#fbfbfb', borderRadius: 20, padding: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: PFC.ink, marginBottom: 18 }}>What happens next</div>
          {O2O_TIMELINE.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', marginTop: 3, flexShrink: 0, background: i === 0 ? PFC.successText : '#d1d5db', border: i === 0 ? 'none' : `1.5px solid ${PFC.borderHard}` }} />
                {i < O2O_TIMELINE.length - 1 && <div style={{ width: 1, background: PFC.border, flex: 1, marginTop: 4, marginBottom: 4, minHeight: 20 }} />}
              </div>
              <div style={{ paddingBottom: i < O2O_TIMELINE.length - 1 ? 14 : 0, flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: i === 0 ? PFC.successText : PFC.ink, marginBottom: 2 }}>{i === 0 ? 'Just now' : item.title}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: PFC.inkSoft, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {stickyFooter(
        <React.Fragment>
          <button style={{ width: '100%', marginBottom: 8, padding: '14px', borderRadius: 12, background: PFC.inkDarker, color: 'white', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer' }}>
            View your bike lease
          </button>
          <button onClick={pop} style={{ width: '100%', padding: '12px', borderRadius: 12, fontFamily: 'var(--font-display)', color: PFC.inkSoft, fontWeight: 500, fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>
            Back to benefits
          </button>
        </React.Fragment>
      )}
    </div>
  );

  // ── Modal overlay ──────────────────────────────────────────
  const modalContent =
    modal === 'adv'    ? <BLAdvModal quote={activeQuote} isExample={!quote} onClose={() => setModal(null)} /> :
    modal === 'budget' ? <BLEditModal current={budget} onSave={v => { setBudget(v); setModal(null); }} onClose={() => setModal(null)} /> :
    null;

  const screens = [introScreen, selectScreen, budgetScreen, reviewScreen, successScreen];

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {screens[Math.min(step, 4)]}
      {modalContent && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'flex-end' }} onClick={() => setModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%' }}>
            {modalContent}
          </div>
        </div>
      )}
    </div>
  );
}

registerScreen('bike-lease-o2o', BikeLeaseO2OScreen);
