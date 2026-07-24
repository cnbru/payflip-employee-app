// Expense flow V2 — merged single-submission flow
// Screens: expense-type-v2 (type → category → form, all in one logical flow)
// ─────────────────────────────────────────────────────────────
// Flow: Type → Category → Form+Submit
// Both mobility and work expenses share the same 3-step structure.
// Category choice drives budget source + tax display.
// ─────────────────────────────────────────────────────────────

const WORK_CATEGORIES    = ['Hotel', 'Restaurant', 'Taxi / Uber', 'Parking', 'Other'];
const MOB_CATEGORIES_V2  = ['Private transport', 'Public transport', 'Shared mobility', 'Mobility subscription'];

// ─────────────────────────────────────────────────────────────
// Screen 1 of 3 — Type selection
// ─────────────────────────────────────────────────────────────
function ExpenseTypeScreenV2() {
  const { pop, push, navigate } = useNav();

  const rows = [
    {
      label: 'Mobility expense',
      note: null,
      badge: 'Mobility budget',
      onClick: () => push('expense-category-v2', { type: 'mobility' }),
    },
    {
      label: 'Work expense',
      note: 'Reimbursed by employer',
      badge: null,
      onClick: () => push('expense-category-v2', { type: 'work' }),
    },
    {
      label: 'Learning & development',
      note: null,
      badge: 'L&D budget',
      onClick: () => { pop(); navigate('benefits', 'benefit-flow-start', { name: 'Learning and development' }); },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Top bar */}
      <div style={{ padding: '8px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <button onClick={pop} style={{
          width: 36, height: 36, borderRadius: 999,
          border: `1px solid ${PFC.border}`, background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <LucideIcon name="X" size={18} color={PFC.ink} strokeWidth={2} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Heading28>Expense type</Heading28>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(({ label, note, badge, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              style={{
                width: '100%', appearance: 'none', background: '#fff',
                border: `1px solid ${PFC.border}`, borderRadius: 12,
                padding: '16px', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16, color: PFC.ink }}>{label}</span>
                {badge && (
                  <span style={{
                    alignSelf: 'flex-start',
                    background: '#ddebff', color: '#1568cd',
                    borderRadius: 999, padding: '3px 8px',
                    fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 12,
                  }}>{badge}</span>
                )}
                {note && (
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 13, color: PFC.inkSoft }}>
                    {note}
                  </span>
                )}
              </div>
              <div style={{ flexShrink: 0 }}>
                <LucideIcon name="ChevronRight" size={18} color={PFC.inkSoft} strokeWidth={2} />
              </div>
            </button>
          ))}
        </div>

        {/* Prototype toggle — below the cards */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => { window.__pfExpFlow = 'v1'; pop(); push('expense-type'); }}
            style={{
              appearance: 'none', border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 11,
              color: PFC.inkSoft, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
            }}
          >
            <LucideIcon name="Shuffle" size={11} color={PFC.inkSoft} strokeWidth={2} />
            Classic flow
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 2 of 3 — Category selection
// ─────────────────────────────────────────────────────────────
function ExpenseCategoryScreenV2({ type }) {
  const { pop, push } = useNav();

  const categories = type === 'mobility' ? MOB_CATEGORIES_V2 : WORK_CATEGORIES;
  const title = type === 'mobility' ? 'Mobility expense category' : 'Work expense category';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <div style={{ padding: '8px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={pop} style={{
          width: 36, height: 36, borderRadius: 999,
          border: `1px solid ${PFC.border}`, background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <LucideIcon name="ChevronLeft" size={20} color={PFC.ink} strokeWidth={2} />
        </button>
        <button onClick={() => { pop(); pop(); }} style={{
          width: 36, height: 36, borderRadius: 999,
          border: `1px solid ${PFC.border}`, background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <LucideIcon name="X" size={18} color={PFC.ink} strokeWidth={2} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Heading28>{title}</Heading28>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => push('expense-form-v2', { type, category: cat })}
              style={{
                width: '100%', appearance: 'none', background: '#fff',
                border: `1px solid ${PFC.border}`, borderRadius: 12,
                padding: '16px', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16, color: PFC.ink,
              }}
            >
              {cat}
              <LucideIcon name="ChevronRight" size={18} color={PFC.inkSoft} strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 3 of 3 — Details form + submit
// ─────────────────────────────────────────────────────────────
const PAYFLIP_ADV_ICON_V2 = 'https://www.figma.com/api/mcp/asset/6fa2e40e-e8fd-48f9-9d84-a6f9e4656c0a';

function ExpenseFormScreenV2({ type, category }) {
  const { pop } = useNav();
  const isMobility = type === 'mobility';

  const [amount, setAmount]                 = React.useState('');
  const [date, setDate]                     = React.useState('2026-07-24');
  const [uploading, setUploading]           = React.useState(false);
  const [uploaded, setUploaded]             = React.useState(false);
  const [showAdvantageModal, setShowAdvantageModal] = React.useState(false);

  const amtNum = parseFloat((amount || '0').replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
  const hasAmount = amtNum > 0;
  const advantageAmt = hasAmount ? Math.round(amtNum * 0.19) : null;

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setUploaded(true); }, 1800);
  };

  const handleSubmit = () => {
    const newExpense = {
      id: `exp-v2-${Math.floor(Math.random() * 1e9)}`,
      category,
      amount: amtNum,
      date: date ? date.split('-').reverse().join('/') : '24/07/2026',
      status: 'pending',
    };
    window.__submittedExpenses = [newExpense, ...(window.__submittedExpenses || [])];
    window.__pendingToast = { title: 'Expense submitted' };
    window.__lastSubmittedExpense = newExpense;
    // pop 3 levels: form → category → type → home
    pop(); pop(); pop();
  };

  const canSubmit = hasAmount && uploaded;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Top bar */}
      <div style={{ padding: '8px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={pop} style={{
          width: 36, height: 36, borderRadius: 999,
          border: `1px solid ${PFC.border}`, background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <LucideIcon name="ChevronLeft" size={20} color={PFC.ink} strokeWidth={2} />
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: PFC.inkSoft }}>
          {category}
        </span>
        <button onClick={() => { pop(); pop(); pop(); }} style={{
          width: 36, height: 36, borderRadius: 999,
          border: `1px solid ${PFC.border}`, background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <LucideIcon name="X" size={18} color={PFC.ink} strokeWidth={2} />
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Heading28>Details</Heading28>

        {/* Amount */}
        <Field
          label="Amount"
          value={amount}
          onChange={setAmount}
          placeholder="0.00"
          leftAdornment={
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: PFC.inkSoft, marginRight: 2 }}>€</span>
          }
        />

        {/* Date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Body14 color={PFC.ink} weight={600}>Date</Body14>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              border: `1.5px solid ${PFC.borderHard}`, borderRadius: 12,
              padding: '14px 16px', fontFamily: 'var(--font-display)',
              fontSize: 16, color: PFC.ink, background: '#fff',
              outline: 'none', appearance: 'none',
            }}
          />
        </div>

        {/* Attachment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Body14 color={PFC.ink} weight={600}>Attachment</Body14>
          {!uploaded ? (
            uploading ? (
              <div style={{
                background: '#F7F7F8', border: `1.5px dashed ${PFC.border}`,
                borderRadius: 14, padding: '24px 20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              }}>
                <LucideIcon name="UploadCloud" size={26} color={PFC.purple} strokeWidth={1.75} />
                <Body14 color={PFC.inkSoft} weight={500}>Uploading receipt.jpg…</Body14>
                <div style={{ width: '100%', height: 3, background: PFC.border, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: PFC.purple, borderRadius: 2, animation: 'expUploadProgress 1.6s ease-out forwards' }} />
                </div>
              </div>
            ) : (
              <button
                onClick={handleUpload}
                style={{
                  width: '100%', appearance: 'none', cursor: 'pointer',
                  background: '#F7F7F8', border: `1.5px dashed ${PFC.border}`,
                  borderRadius: 14, padding: '28px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                }}
              >
                <LucideIcon name="UploadCloud" size={28} color={PFC.inkSoft} strokeWidth={1.75} />
                <Body14 color={PFC.ink} weight={400}>
                  Take a photo or <strong style={{ fontWeight: 700 }}>choose file</strong>
                </Body14>
              </button>
            )
          ) : (
            <div style={{ border: `1px solid ${PFC.border}`, borderRadius: 14, overflow: 'hidden', animation: 'expUploadSlideIn 0.3s ease-out both' }}>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <LucideIcon name="FileCheck" size={22} color="rgb(34,139,34)" strokeWidth={1.75} />
                <Body14 color={PFC.ink} weight={600} style={{ flex: 1 }}>receipt.jpg</Body14>
              </div>
              <div style={{ borderTop: `1px solid ${PFC.border}` }}>
                <button onClick={() => { setUploaded(false); setUploading(false); }} style={{
                  width: '100%', appearance: 'none', background: 'transparent', border: 'none',
                  padding: '10px', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                  color: PFC.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <LucideIcon name="RefreshCw" size={13} color={PFC.ink} strokeWidth={2} />
                  Change file
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobility only: Fund with */}
        {isMobility && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Body14 color={PFC.ink} weight={600}>Fund with</Body14>
            <div style={{ border: `2px solid #e879f9`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: PFC.ink }}>Mobility budget</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 13, color: PFC.inkSoft, marginTop: 2 }}>
                  {hasAmount ? `€${(555.04 - amtNum).toFixed(2)} remaining after` : '€555.04 remaining'}
                </div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: 999, border: `2px solid #e879f9`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <div style={{ width: 11, height: 11, borderRadius: 999, background: '#e879f9' }} />
              </div>
            </div>
          </div>
        )}

        {/* Work expense note */}
        {!isMobility && (
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 8 }}>
            <LucideIcon name="Info" size={15} color="#0369a1" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 13, color: '#0c4a6e', lineHeight: '18px' }}>
              Work-related expenses are reimbursed by your employer via the next payroll file.
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      {isMobility && hasAmount ? (
        <div style={{ background: '#fff', borderTop: `1px solid ${PFC.border}`, padding: '14px 16px 24px' }}>
          {/* Stats row */}
          <div style={{ display: 'flex', marginBottom: 16 }}>
            <div style={{ flex: 1, paddingRight: 16 }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: PFC.ink }}>Budget impact</span>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: PFC.ink }}>€{amtNum.toFixed(2)}</span>
            </div>
            <div style={{ width: 1, background: PFC.border, flexShrink: 0 }} />
            <div style={{ flex: 1, paddingLeft: 16 }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: PFC.ink }}>Payflip advantage</span>
                <button
                  onClick={() => setShowAdvantageModal(true)}
                  style={{ appearance: 'none', border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <LucideIcon name="Info" size={12} color={PFC.inkSoft} strokeWidth={2} />
                </button>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <img src={PAYFLIP_ADV_ICON_V2} alt="" style={{ width: 11, height: 18, display: 'block', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#c42bfc' }}>€{advantageAmt}</span>
              </div>
            </div>
          </div>
          <Button variant="primary" size="large" fullWidth disabled={!canSubmit} onClick={handleSubmit}>Submit</Button>
        </div>
      ) : (
        <div style={{ padding: '12px 16px 24px', borderTop: `1px solid ${PFC.border}`, background: '#fff' }}>
          <Button variant="primary" size="large" fullWidth disabled={!canSubmit} onClick={handleSubmit}>Submit</Button>
        </div>
      )}

      <style>{`
        @keyframes expUploadProgress { from { width: 0%; } to { width: 100%; } }
        @keyframes expUploadSlideIn  { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      {showAdvantageModal && <PayflipAdvantageModal amtNum={amtNum} onClose={() => setShowAdvantageModal(false)} />}
    </div>
  );
}

registerScreen('expense-type-v2',    ExpenseTypeScreenV2);
registerScreen('expense-category-v2', ExpenseCategoryScreenV2);
registerScreen('expense-form-v2',    ExpenseFormScreenV2);
