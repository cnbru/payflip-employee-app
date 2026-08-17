// Expense flow V2 — merged single-submission flow
// Screens: expense-type-v2 (type → category → form → confirm)
// ─────────────────────────────────────────────────────────────
// Flow: Type → Category → Form+Submit → Confirmation
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F2F2F2' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F2F2F2' }}>
      <div style={{ padding: '8px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={pop} style={{
          width: 36, height: 36, borderRadius: 999,
          border: `1px solid ${PFC.border}`, background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <LucideIcon name="ChevronLeft" size={20} color={PFC.ink} strokeWidth={2} />
        </button>
        <div style={{ width: 36 }} />
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

function ExpenseFormScreenV2({ type, category, prefill }) {
  const { pop, push } = useNav();
  const isMobility = type === 'mobility';

  const todayISO = new Date().toISOString().slice(0, 10);
  const prefillDate = React.useMemo(() => {
    if (!prefill || !prefill.date) return todayISO;
    const parts = prefill.date.split('/');
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : todayISO;
  }, []);

  const [amount, setAmount]                 = React.useState(prefill ? String(prefill.amount) : '');
  const [date, setDate]                     = React.useState(prefillDate);
  const [uploading, setUploading]           = React.useState(false);
  const [uploaded, setUploaded]             = React.useState(false);


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
    window.__lastSubmittedExpense = newExpense;
    push('expense-confirm-v2', { type, category, amount: amtNum, advantageAmt, date: newExpense.date });
  };

  const canSubmit = hasAmount && uploaded;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F2F2F2' }}>
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
        <div style={{ width: 36 }} />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Body14 color={PFC.ink} weight={600}>Date</Body14>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            border: `1px solid ${PFC.borderHard}`, borderRadius: 12,
            padding: '12px 16px', background: '#fff', cursor: 'text',
          }}>
            <LucideIcon name="CalendarDays" size={16} color={PFC.inkSoft} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16,
                color: PFC.ink, minWidth: 0, padding: 0, appearance: 'none',
              }}
            />
          </div>
        </div>

        {/* Attachment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Body14 color={PFC.ink} weight={600}>Attachment</Body14>
          {!uploaded ? (
            uploading ? (
              <div style={{
                background: '#fafafa', border: `1.5px dashed ${PFC.border}`,
                borderRadius: 12, padding: '16px 14px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
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
                  background: '#fafafa', border: `1.5px dashed ${PFC.border}`,
                  borderRadius: 12, padding: '16px 14px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                }}
              >
                <LucideIcon name="Upload" size={28} color={PFC.ink} strokeWidth={1.75} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: PFC.ink }}>Choose file to upload</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: PFC.inkSoft }}>Up to 5MB</span>
              </button>
            )
          ) : (
            <div style={{ border: `1px solid ${PFC.border}`, borderRadius: 14, overflow: 'hidden', background: '#fff', animation: 'expUploadSlideIn 0.3s ease-out both' }}>
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
            <div style={{ border: `2px solid #e879f9`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, background: '#fff' }}>
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
        <div style={{ borderTop: `1px solid ${PFC.border}`, padding: '14px 16px 24px' }}>
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
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: '#c42bfc' }}>€{advantageAmt}</span>
              </div>
            </div>
          </div>
          <Button variant="primary" size="large" fullWidth disabled={!canSubmit} onClick={handleSubmit}>Submit</Button>
        </div>
      ) : (
        <div style={{ padding: '12px 16px 24px', borderTop: `1px solid ${PFC.border}` }}>
          <Button variant="primary" size="large" fullWidth disabled={!canSubmit} onClick={handleSubmit}>Submit</Button>
        </div>
      )}

      <style>{`
        @keyframes expUploadProgress { from { width: 0%; } to { width: 100%; } }
        @keyframes expUploadSlideIn  { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 4 of 4 — Confirmation
// ─────────────────────────────────────────────────────────────
function ExpenseConfirmScreenV2({ type, category, amount, advantageAmt, date }) {
  const { switchTab, push } = useNav();
  const isMobility = type === 'mobility';

  const done = () => {
    switchTab('home');
  };

  const goToExpenses = () => {
    push('my-expenses');
  };

  const formattedAmount = (amount || 0).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F2F2F2' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Success icon + heading */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 999,
            background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <LucideIcon name="CheckCircle2" size={34} color="#16a34a" strokeWidth={1.75} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: PFC.ink, textAlign: 'center' }}>
            Expense submitted
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: PFC.inkSoft, textAlign: 'center' }}>
            {category} · {date}
          </div>
        </div>

        {/* Summary card */}
        <div style={{ border: `1px solid ${PFC.border}`, borderRadius: 16, overflow: 'hidden', background: '#fff' }}>
          <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${PFC.border}` }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: PFC.inkSoft }}>Amount</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: PFC.ink }}>€{formattedAmount}</span>
          </div>
          {isMobility && advantageAmt != null && (
            <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${PFC.border}` }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: PFC.inkSoft }}>Payflip advantage</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#c42bfc' }}>€{advantageAmt}</span>
            </div>
          )}
          <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: PFC.inkSoft }}>Status</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fef9c3', color: '#854d0e', padding: '3px 10px', borderRadius: 20, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12 }}>
              <span style={{ fontSize: 7, lineHeight: 1 }}>●</span>Pending approval
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: PFC.ink }}>What happens next</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 22, height: 22, borderRadius: 999, background: '#e8e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: PFC.ink }}>1</span>
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: PFC.inkSoft, lineHeight: '18px' }}>
              Your manager reviews and approves your expense.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 22, height: 22, borderRadius: 999, background: '#e8e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: PFC.ink }}>2</span>
            </div>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: PFC.inkSoft, lineHeight: '18px' }}>
              {isMobility
                ? 'The amount is deducted from your mobility budget immediately.'
                : 'The reimbursement is included in your next payroll file.'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 16px 24px', borderTop: `1px solid ${PFC.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button variant="primary" size="large" fullWidth onClick={done}>Close</Button>
        <Button variant="ghost" size="large" fullWidth onClick={goToExpenses}>View my expenses</Button>
      </div>
    </div>
  );
}

registerScreen('expense-type-v2',    ExpenseTypeScreenV2);
registerScreen('expense-category-v2', ExpenseCategoryScreenV2);
registerScreen('expense-form-v2',    ExpenseFormScreenV2);
registerScreen('expense-confirm-v2', ExpenseConfirmScreenV2);
