// Expense screens — employee app
// Screens: expense-wizard, my-expenses

// ─────────────────────────────────────────────────────────────
// Mock data — seeded once on window so other screens can read it
// ─────────────────────────────────────────────────────────────
window.__expensesMockData = [
  { id: 'exp-1', category: 'Restaurant / meals', amount: 45.00, date: '18/07/2026', status: 'rejected', adminNote: 'Receipt is not readable.' },
  { id: 'exp-2', category: 'Taxi / Uber',         amount: 12.50, date: '10/07/2026', status: 'approved' },
  { id: 'exp-3', category: 'Taxi / Uber',         amount: 28.00, date: '05/07/2026', status: 'pending' },
  { id: 'exp-4', category: 'Hotel',               amount: 189.00, date: '22/06/2026', status: 'reimbursed', reimbursementMonth: 'July 2026' },
  { id: 'exp-5', category: 'Restaurant / meals', amount: 34.50, date: '08/06/2026', status: 'reimbursed', reimbursementMonth: 'July 2026' },
  { id: 'exp-6', category: 'Parking',             amount: 8.00,  date: '03/06/2026', status: 'reimbursed', reimbursementMonth: 'June 2026' },
];

const EXPENSE_CATEGORIES = [
  'Restaurant / meals',
  'Taxi / Uber',
  'Hotel',
  'Parking',
  'Other',
];

// ─────────────────────────────────────────────────────────────
// Expense Type — full-page screen for choosing expense type
// ─────────────────────────────────────────────────────────────
const EXPENSE_TYPE_ICONS = {
  mobility: 'https://www.figma.com/api/mcp/asset/61f09e4a-e8a7-4282-adb8-b7b54cea3f42',
  cash:     'https://www.figma.com/api/mcp/asset/e4d2ef18-b637-40f3-8363-1ce8d9a7e805',
  ld:       'https://www.figma.com/api/mcp/asset/a9b341c4-0427-4fa7-8442-f64548852dd3',
};

function ExpenseTypeScreen() {
  const { pop, push, navigate } = useNav();

  const BudgetPill = ({ label }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start',
      background: '#ddebff', color: '#1568cd',
      borderRadius: 999, padding: '4px 8px',
      fontFamily: 'var(--font-display)', fontWeight: 500,
      fontSize: 14, lineHeight: '20px', letterSpacing: '0.025px',
    }}>{label}</span>
  );

  const rows = [
    {
      img: EXPENSE_TYPE_ICONS.mobility,
      title: 'Mobility expenses',
      subtitle: 'Get reimbursed for your commutes',
      pill: 'Mobility budget',
      onClick: () => push('mobility-expense'),
    },
    {
      img: EXPENSE_TYPE_ICONS.cash,
      title: 'Expenses',
      subtitle: 'Ask your employer for a reimbursement for hotels, restaurant,..',
      onClick: () => push('expense-wizard'),
    },
    {
      img: EXPENSE_TYPE_ICONS.ld,
      title: 'Learning and development',
      subtitle: 'Get courses, books, and certifications reimbursed.',
      pill: 'L&D budget',
      onClick: () => { pop(); navigate('benefits', 'benefit-flow-start', { name: 'Learning and development' }); },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Top bar with X */}
      <div style={{ padding: '8px 16px 0' }}>
        <button onClick={pop} style={{
          width: 36, height: 36, borderRadius: 999,
          border: `1px solid ${PFC.border}`, background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <LucideIcon name="X" size={18} color={PFC.ink} strokeWidth={2} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Heading */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Heading28>Submit expense</Heading28>
          <Body16 color={'#3b3940'} weight={400}>Choose which expense you want to submit.</Body16>
        </div>

        {/* Rows */}
        <div>
          {rows.map(({ img, title, subtitle, pill, onClick }) => (
            <button key={title} onClick={onClick} style={{
              width: '100%', appearance: 'none', background: 'transparent',
              border: 'none', borderBottom: `1px solid #e3e2e7`,
              padding: '16px 0', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              {/* 3D icon with 4px padding wrapper */}
              <div style={{ padding: 4, borderRadius: 16, flexShrink: 0 }}>
                <img src={img} alt="" style={{ width: 48, height: 48, display: 'block' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 500,
                    fontSize: 18, lineHeight: '28px', color: '#071628',
                    display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{title}</span>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontWeight: 400,
                    fontSize: 14, lineHeight: '20px', color: '#3b3940',
                    display: 'block',
                  }}>{subtitle}</span>
                </div>
                {pill && <BudgetPill label={pill} />}
              </div>
              <LucideIcon name="ChevronRight" size={20} color={PFC.inkSoft} strokeWidth={2} style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Expense Wizard — frictionless employer expense (2 steps + review + success)
// Steps: 0=Upload, 1=Details, 2=Review → 3=Success
// ─────────────────────────────────────────────────────────────
function ExpenseWizardScreen() {
  const { pop, push, reset, switchTab } = useNav();
  const [step, setStep] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const [uploaded, setUploaded] = React.useState(false);
  const [category, setCategory] = React.useState('Restaurant / meals');
  const [amount, setAmount] = React.useState('');
  const [date, setDate] = React.useState('2026-07-23');
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [editField, setEditField] = React.useState(null);

  const STEPS = [
    { label: 'Upload',  n: 1, total: 2 },
    { label: 'Details', n: 2, total: 2 },
  ];

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setUploaded(true); }, 1800);
  };

  const handleSubmit = () => {
    const newExpense = {
      id: `exp-new-${Math.floor(Math.random() * 1e9)}`,
      category,
      amount: parseFloat((amount || '0').replace(/[^0-9.,]/g, '').replace(',', '.')),
      date: date ? date.split('-').reverse().join('/') : '23/07/2026',
      description,
      status: 'pending',
    };
    window.__submittedExpenses = [newExpense, ...(window.__submittedExpenses || [])];
    setStep(3);
  };

  // ── Success ──
  if (step === 3) {
    const amtNum = parseFloat((amount || '0').replace(/[^0-9.,]/g, '').replace(',', '.'));
    const displayAmt = amtNum > 0 ? `€${amtNum.toFixed(2)}` : '€110.25';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', animation: 'expFadeSlideIn 0.35s ease-out both' }}>
        <div style={{ padding: 16 }}>
          <button onClick={() => { reset('home'); switchTab('home'); }} style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${PFC.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <LucideIcon name="X" size={18} color={PFC.ink} strokeWidth={2} />
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px 80px', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 999, border: `2px solid ${PFC.successText}`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'expPopIn 0.5s ease-out 0.1s both' }}>
            <LucideIcon name="Check" size={26} color={PFC.successText} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, lineHeight: '30px', letterSpacing: '-0.005em', color: PFC.inkDeep, textAlign: 'center', animation: 'expFadeSlideIn 0.4s ease-out 0.2s both' }}>Expense submitted</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, lineHeight: '22px', color: PFC.inkSoft, textAlign: 'center', maxWidth: 260, animation: 'expFadeSlideIn 0.4s ease-out 0.3s both' }}>{displayAmt} under review</span>
          <div style={{ width: '100%', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8, animation: 'expFadeSlideIn 0.4s ease-out 0.4s both' }}>
            <Button variant="primary" size="large" fullWidth onClick={() => push('my-expenses')}>View expenses</Button>
            <Button variant="outline" size="large" fullWidth onClick={() => { reset('home'); switchTab('home'); }}>Back to home</Button>
          </div>
        </div>
        <style>{`
          @keyframes expFadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes expPopIn { 0% { opacity: 0; transform: scale(0.5); } 60% { transform: scale(1.12); } 100% { opacity: 1; transform: scale(1); } }
          @keyframes expUploadProgress { from { width: 0%; } to { width: 100%; } }
          @keyframes expUploadSlideIn { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        `}</style>
      </div>
    );
  }

  const cancelTrailing = (
    <button onClick={() => setShowCancelConfirm(true)} style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${PFC.border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <LucideIcon name="X" size={18} color={PFC.ink} strokeWidth={2} />
    </button>
  );

  // ── Review (step 2) ──
  if (step === 2) {
    const amtNum = parseFloat((amount || '0').replace(/[^0-9.,]/g, '').replace(',', '.'));
    const amtDisplay = amtNum > 0 ? `€${amtNum.toFixed(2)}` : '—';
    const dateDisplay = date ? date.split('-').reverse().join('/') : '—';
    const EDIT_TITLES = { proof: 'Receipt', category: 'Category', amount: 'Price', date: 'Date', description: 'Description' };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
        <NavBar hideBack trailing={cancelTrailing} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Heading24>Review</Heading24>
          <div style={{ background: '#fff', border: `1px solid ${PFC.border}`, borderRadius: 16, overflow: 'hidden' }}>
            {[
              { label: 'Proof',       value: 'receipt.jpg',     editKey: 'proof' },
              { label: 'Category',    value: category,           editKey: 'category' },
              { label: 'Price',       value: amtDisplay,         editKey: 'amount' },
              { label: 'Date',        value: dateDisplay,        editKey: 'date' },
              { label: 'Description', value: description || '—', editKey: 'description' },
            ].map(({ label, value, editKey }, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderTop: i > 0 ? `1px solid ${PFC.border}` : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: PFC.inkSoft, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: PFC.ink }}>{value}</div>
                </div>
                <button onClick={() => setEditField(editKey)} style={{ appearance: 'none', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: PFC.purple, padding: '0 0 0 8px' }}>Edit</button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '12px 16px 24px', borderTop: `1px solid ${PFC.border}`, background: '#fff' }}>
          <Button variant="primary" size="large" fullWidth onClick={handleSubmit}>Submit</Button>
        </div>

        {editField && (
          <div onClick={() => setEditField(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 16px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading24>{EDIT_TITLES[editField]}</Heading24>
                <button onClick={() => setEditField(null)} style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${PFC.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <LucideIcon name="X" size={16} color={PFC.ink} strokeWidth={2} />
                </button>
              </div>

              {editField === 'category' && (
                <div style={{ border: `1px solid ${PFC.borderHard}`, borderRadius: 12, overflow: 'hidden' }}>
                  {EXPENSE_CATEGORIES.map((cat, i) => (
                    <button key={cat} onClick={() => setCategory(cat)} style={{ width: '100%', appearance: 'none', border: 'none', background: 'transparent', borderTop: i > 0 ? `1px solid ${PFC.border}` : 'none', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 999, flex: 'none', border: `2px solid ${category === cat ? '#e879f9' : PFC.borderHard}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {category === cat && <div style={{ width: 10, height: 10, borderRadius: 999, background: '#e879f9' }} />}
                      </div>
                      <Body16 color={PFC.ink}>{cat}</Body16>
                    </button>
                  ))}
                </div>
              )}

              {editField === 'amount' && (
                <Field label="Amount" value={amount} onChange={setAmount} placeholder="0.00" leftAdornment={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: PFC.inkSoft, marginRight: 2 }}>€</span>} />
              )}

              {editField === 'date' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Body14 color={PFC.ink} weight={600}>Date of expense</Body14>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', border: `1.5px solid ${PFC.borderHard}`, borderRadius: 12, padding: '14px 16px', fontFamily: 'var(--font-display)', fontSize: 16, color: PFC.ink, background: '#fff', outline: 'none', appearance: 'none' }} />
                </div>
              )}

              {editField === 'description' && (
                <Field label="Description" value={description} onChange={setDescription} placeholder="e.g. Client dinner, team lunch…" />
              )}

              {editField === 'proof' && (
                !uploaded ? (
                  <button onClick={handleUpload} style={{ width: '100%', appearance: 'none', cursor: 'pointer', background: '#F7F7F8', border: `1.5px dashed ${PFC.border}`, borderRadius: 16, padding: '28px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <LucideIcon name="UploadCloud" size={28} color={PFC.inkSoft} strokeWidth={1.75} />
                    <Body14 color={PFC.ink} weight={400}>Tap to replace receipt</Body14>
                  </button>
                ) : (
                  <div style={{ border: `1px solid ${PFC.border}`, borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <LucideIcon name="FileCheck" size={24} color="rgb(34,139,34)" strokeWidth={1.75} />
                    <Body14 color={PFC.ink} weight={600} style={{ flex: 1 }}>receipt.jpg</Body14>
                  </div>
                )
              )}

              <Button variant="primary" size="large" fullWidth onClick={() => setEditField(null)}>Save</Button>
            </div>
          </div>
        )}
        {showCancelConfirm && <DiscardConfirmModal onDiscard={pop} onCancel={() => setShowCancelConfirm(false)} />}
      </div>
    );
  }

  const cur = STEPS[step];
  const progressPct = (cur.n / cur.total) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <NavBar hideBack trailing={cancelTrailing} />

      {/* Step indicator + progress bar */}
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Body14 color={PFC.ink} weight={600}>Step {cur.n} of {cur.total} · {cur.label}</Body14>
        <div style={{ height: 3, background: PFC.border, borderRadius: 2 }}>
          <div style={{
            height: '100%', borderRadius: 2, background: PFC.ink,
            width: `${progressPct}%`, transition: 'width 300ms ease-out',
          }} />
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>

        {/* ── Step 0: Upload ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Heading24>Upload file</Heading24>
            <Body16 color={PFC.inkSoft} weight={400} style={{ lineHeight: '24px' }}>
              Upload a photo or file of your receipt.
            </Body16>

            {!uploaded ? (
              uploading ? (
                <div style={{
                  background: '#F7F7F8', border: `1.5px dashed ${PFC.border}`,
                  borderRadius: 16, padding: '28px 20px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
                }}>
                  <LucideIcon name="UploadCloud" size={28} color={PFC.purple} strokeWidth={1.75} />
                  <Body14 color={PFC.inkSoft} weight={500}>Uploading receipt.jpg…</Body14>
                  <div style={{ width: '100%', height: 4, background: PFC.border, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: PFC.purple, borderRadius: 2, animation: 'expUploadProgress 1.6s ease-out forwards' }} />
                  </div>
                </div>
              ) : (
                <button onClick={handleUpload} style={{
                  width: '100%', appearance: 'none', cursor: 'pointer',
                  background: '#F7F7F8', border: `1.5px dashed ${PFC.border}`,
                  borderRadius: 16, padding: '32px 16px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                }}>
                  <LucideIcon name="UploadCloud" size={32} color={PFC.inkSoft} strokeWidth={1.75} />
                  <Body14 color={PFC.ink} weight={400}>
                    Drag and drop or <strong style={{ fontWeight: 700 }}>choose file</strong> to upload
                  </Body14>
                </button>
              )
            ) : (
              <div style={{
                border: `1px solid ${PFC.border}`, borderRadius: 16, overflow: 'hidden',
                animation: 'expUploadSlideIn 0.3s ease-out both',
              }}>
                <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <LucideIcon name="FileCheck" size={24} color="rgb(34,139,34)" strokeWidth={1.75} />
                  <Body14 color={PFC.ink} weight={600} style={{ flex: 1 }}>receipt.jpg</Body14>
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
          </div>
        )}

        {/* ── Step 1: Add expense details ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Heading24>Add expense details</Heading24>
            <Body16 color={PFC.inkSoft} weight={400} style={{ lineHeight: '24px' }}>
              Fill in the details for your expense.
            </Body16>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Body14 color={PFC.ink} weight={600}>Category</Body14>
              <div style={{ border: `1px solid ${PFC.borderHard}`, borderRadius: 12, overflow: 'hidden' }}>
                {EXPENSE_CATEGORIES.map((cat, i) => (
                  <button key={cat} onClick={() => setCategory(cat)} style={{
                    width: '100%', appearance: 'none', border: 'none', background: 'transparent',
                    borderTop: i > 0 ? `1px solid ${PFC.border}` : 'none',
                    padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 999, flex: 'none',
                      border: `2px solid ${category === cat ? '#e879f9' : PFC.borderHard}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'border-color 120ms ease',
                    }}>
                      {category === cat && (
                        <div style={{ width: 10, height: 10, borderRadius: 999, background: '#e879f9' }} />
                      )}
                    </div>
                    <Body16 color={PFC.ink}>{cat}</Body16>
                  </button>
                ))}
              </div>
            </div>

            <Field
              label="Amount"
              value={amount}
              onChange={setAmount}
              placeholder="0.00"
              leftAdornment={
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: PFC.inkSoft, marginRight: 2 }}>€</span>
              }
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Body14 color={PFC.ink} weight={600}>Date of expense</Body14>
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

            <Field
              label="Description"
              value={description}
              onChange={setDescription}
              placeholder="e.g. Client dinner, team lunch…"
            />
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div style={{ padding: '12px 16px 24px', borderTop: `1px solid ${PFC.border}`, background: '#fff' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={step === 0 ? pop : () => setStep(step - 1)} style={{ flex: 1, appearance: 'none', cursor: 'pointer', background: '#f7f7f8', border: 'none', borderRadius: 10, padding: '12px 24px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, lineHeight: '24px', color: PFC.ink, minHeight: 48 }}>
            Back
          </button>
          {step === 0 && (
            <Button variant="primary" size="large" style={{ flex: 1 }} disabled={!uploaded} onClick={() => setStep(1)}>Continue</Button>
          )}
          {step === 1 && (
            <Button variant="primary" size="large" style={{ flex: 1 }} disabled={!amount} onClick={() => setStep(2)}>Continue</Button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes expFadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes expUploadProgress { from { width: 0%; } to { width: 100%; } }
        @keyframes expUploadSlideIn { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      {showCancelConfirm && <DiscardConfirmModal onDiscard={pop} onCancel={() => setShowCancelConfirm(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared expense row renderer (used in list + history)
// ─────────────────────────────────────────────────────────────
function ExpenseRow({ exp, onPress, last }) {
  return (
    <div style={{ padding: '0 16px', borderBottom: last ? 'none' : '1px solid #EAEAEB' }}>
      <div role="button" tabIndex={0}
        onClick={onPress}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPress(); } }}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', cursor: 'pointer' }}>
        <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LucideIcon name="Receipt" size={20} color={PFC.inkSoft} strokeWidth={1.75} />
          </div>
          {(exp.status === 'approved' || exp.status === 'reimbursed') && (
            <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#dcfce7', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LucideIcon name="Check" size={10} color="#16a34a" strokeWidth={2.5} />
            </div>
          )}
          {exp.status === 'pending' && (
            <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#fef3c7', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LucideIcon name="Clock" size={9} color="#b45309" strokeWidth={2.5} />
            </div>
          )}
          {exp.status === 'rejected' && (
            <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#fee2e2', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LucideIcon name="X" size={9} color="#dc2626" strokeWidth={2.5} />
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, lineHeight: '20px' }}>
            <span style={{ fontWeight: 600, color: PFC.ink }}>{exp.category}</span>
            <span style={{ fontWeight: 400, color: PFC.inkSoft }}>{' · '}{fmtEUR(exp.amount)}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: PFC.inkSoft, lineHeight: '18px' }}>{exp.date}</div>
          {exp.adminNote && exp.status === 'rejected' && (
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 12, color: PFC.errorText, lineHeight: '16px', marginTop: 2 }}>{exp.adminNote}</div>
          )}
        </div>
        <LucideIcon name="ChevronRight" size={18} color={PFC.inkSoft} strokeWidth={2} />
      </div>
    </div>
  );
}

function ExpenseGroup({ exps, onPress }) {
  return (
    <div style={{ background: 'white', border: '1px solid #EAEAEB', borderRadius: 16, overflow: 'hidden' }}>
      {exps.map((exp, i) => (
        <ExpenseRow key={exp.id} exp={exp} last={i === exps.length - 1} onPress={() => onPress(exp)} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// My Expenses — sections by month; current month expanded, others collapsed
// ─────────────────────────────────────────────────────────────
function MyExpensesScreen() {
  const { pop, push } = useNav();

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const formatMonthKey = (key) => {
    const [y, m] = key.split('-');
    return `${MONTH_NAMES[parseInt(m) - 1].toUpperCase()} ${y}`;
  };
  const toMonthKey = (dateStr) => { const p = dateStr.split('/'); return `${p[2]}-${p[1]}`; };

  const allExpenses = [
    ...(window.__submittedExpenses || []),
    ...(window.__expensesMockData || []),
  ];

  const monthGroups = React.useMemo(() => {
    const g = {};
    allExpenses.forEach(e => { const k = toMonthKey(e.date); if (!g[k]) g[k] = []; g[k].push(e); });
    return Object.keys(g).sort().reverse().map(key => ({ key, items: g[key] }));
  }, [allExpenses.length]);

  const [expanded, setExpanded] = React.useState(() => new Set([currentMonthKey]));

  const toggle = (key) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const goToDetail = (exp) => push('expense-detail', { expense: exp });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <NavBar />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Heading28>My expenses</Heading28>

        {allExpenses.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16, padding: '40px 24px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LucideIcon name="Receipt" size={32} color={PFC.purple} strokeWidth={1.5} />
            </div>
            <Heading20>No expenses yet</Heading20>
            <Body14 color={PFC.inkSoft} weight={500}>Submit your first expense to get started.</Body14>
          </div>
        )}

        {monthGroups.map(({ key, items }) => {
          const isOpen = expanded.has(key);
          const isCurrent = key === currentMonthKey;
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => toggle(key)}
                style={{
                  appearance: 'none', border: 'none', background: 'none', cursor: 'pointer',
                  padding: '2px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11,
                  color: PFC.inkSoft, letterSpacing: '0.06em',
                }}>
                  {formatMonthKey(key)}
                </span>
                <LucideIcon
                  name={isOpen ? 'ChevronUp' : 'ChevronDown'}
                  size={16} color={PFC.inkSoft} strokeWidth={2}
                />
              </button>
              {isOpen && <ExpenseGroup exps={items} onPress={goToDetail} />}
            </div>
          );
        })}
      </div>

      {/* Sticky footer */}
      <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${PFC.border}`, background: '#fff' }}>
        <Button variant="primary" size="large" fullWidth onClick={() => push('expense-wizard')}>
          Submit expense
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Expense Detail — shows full info for a single expense
// ─────────────────────────────────────────────────────────────
function ExpenseDetailScreen({ expense }) {
  const { pop, push } = useNav();

  if (!expense) { pop(); return null; }

  const STATUS_LABEL = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', reimbursed: 'Reimbursed' };
  const STATUS_KIND  = { pending: 'warning', approved: 'success', rejected: 'alert', reimbursed: 'success' };

  const statusDot = {
    approved:   { bg: '#dcfce7', icon: 'Check', iconColor: '#16a34a' },
    reimbursed: { bg: '#dcfce7', icon: 'Check', iconColor: '#16a34a' },
    pending:    { bg: '#fef3c7', icon: 'Clock', iconColor: '#b45309' },
    rejected:   { bg: '#fee2e2', icon: 'X',     iconColor: '#dc2626' },
  }[expense.status];

  const detailRows = [
    { label: 'Amount',   value: fmtEUR(expense.amount) },
    { label: 'Date',     value: expense.date },
    { label: 'Category', value: expense.category },
    { label: 'Status',   value: <StatusBadge kind={STATUS_KIND[expense.status]}>{STATUS_LABEL[expense.status]}</StatusBadge> },
    ...(expense.status === 'approved'   ? [{ label: 'Reimbursement', value: 'Next payroll file' }] : []),
    ...(expense.status === 'reimbursed' ? [{ label: 'Reimbursed in', value: expense.reimbursementMonth }] : []),
  ];

  const canEdit = expense.status === 'pending' || expense.status === 'rejected';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <NavBar onBack={pop} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Hero — left aligned */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: '4px 0' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LucideIcon name="Receipt" size={32} color={PFC.inkSoft} strokeWidth={1.5} />
            </div>
            {statusDot && (
              <div style={{ position: 'absolute', top: -5, right: -5, width: 20, height: 20, borderRadius: '50%', background: statusDot.bg, border: '2.5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LucideIcon name={statusDot.icon} size={11} color={statusDot.iconColor} strokeWidth={2.5} />
              </div>
            )}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, lineHeight: '30px', letterSpacing: '-0.005em', color: PFC.ink }}>
              {expense.category}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, color: PFC.inkSoft, marginTop: 2 }}>
              {expense.date}
            </div>
          </div>
        </div>

        {/* Rejection note — before details */}
        {expense.status === 'rejected' && expense.adminNote && (
          <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 10 }}>
            <LucideIcon name="TriangleAlert" size={18} color="#dc2626" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#dc2626', marginBottom: 2 }}>Expense rejected</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: '#b91c1c', lineHeight: '18px' }}>{expense.adminNote}</div>
            </div>
          </div>
        )}

        {/* Pending note — before details */}
        {expense.status === 'pending' && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 10 }}>
            <LucideIcon name="Clock" size={18} color="#b45309" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: '#92400e', lineHeight: '18px' }}>
              Your expense is awaiting review. You'll be notified once it's processed.
            </div>
          </div>
        )}

        {/* Detail rows */}
        <div style={{ background: 'white', border: '1px solid #EAEAEB', borderRadius: 16, overflow: 'hidden' }}>
          {detailRows.map((row, i) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderTop: i > 0 ? '1px solid #EAEAEB' : 'none' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: PFC.inkSoft }}>{row.label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: PFC.ink }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Actions for pending and rejected */}
        {canEdit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button variant="outline" size="large" fullWidth onClick={() => push('expense-wizard')}>
              Edit expense
            </Button>
            <button onClick={pop} style={{ appearance: 'none', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: '#dc2626', padding: '10px 0', textAlign: 'center' }}>
              Delete expense
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DiscardConfirmModal — bottom sheet confirmation for X close
// ─────────────────────────────────────────────────────────────
function DiscardConfirmModal({ onDiscard, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 16px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: PFC.ink, marginBottom: 4 }}>Discard expense?</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 15, lineHeight: '22px', color: PFC.inkSoft, marginBottom: 8 }}>Your progress will be lost.</span>
        <button onClick={onDiscard} style={{ appearance: 'none', border: 'none', borderRadius: 10, background: '#dc2626', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, lineHeight: '24px', padding: '12px 24px', cursor: 'pointer', minHeight: 48 }}>Discard</button>
        <button onClick={onCancel} style={{ appearance: 'none', border: 'none', borderRadius: 10, background: '#f7f7f8', color: PFC.ink, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, lineHeight: '24px', padding: '12px 24px', cursor: 'pointer', minHeight: 48 }}>Keep editing</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MobilityFooter — Figma-matched footer: stats + action buttons
// ─────────────────────────────────────────────────────────────
const PAYFLIP_ADV_ICON = 'https://www.figma.com/api/mcp/asset/6fa2e40e-e8fd-48f9-9d84-a6f9e4656c0a';

function MobilityFooter({ amtNum, onBack, onContinue, continueLabel = 'Continue', continueDisabled = false, extra }) {
  const hasAmount = (amtNum || 0) > 0;
  const impact = hasAmount ? `€${amtNum.toFixed(2)}` : '—';
  return (
    <div style={{ background: '#fff', borderTop: `1px solid ${PFC.border}`, padding: '16px 16px 24px' }}>
      {/* Two-column stats — only shown when amount is known */}
      {hasAmount && (
        <div style={{ display: 'flex', marginBottom: 20 }}>
          {/* Budget impact */}
          <div style={{ flex: 1, paddingRight: 16 }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '0.025px', color: PFC.ink }}>Budget impact</span>
              <LucideIcon name="Info" size={12} color={PFC.inkSoft} strokeWidth={2} />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, lineHeight: '32px', letterSpacing: '-0.12px', color: PFC.ink }}>{impact}</span>
          </div>

          {/* Vertical divider */}
          <div style={{ width: 1, background: PFC.border, flexShrink: 0 }} />

          {/* Payflip advantage */}
          <div style={{ flex: 1, paddingLeft: 16 }}>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '0.025px', color: PFC.ink }}>Payflip advantage</span>
              <LucideIcon name="Info" size={12} color={PFC.inkSoft} strokeWidth={2} />
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <img src={PAYFLIP_ADV_ICON} alt="" style={{ width: 13, height: 22, display: 'block', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, lineHeight: '32px', letterSpacing: '-0.12px', color: '#c42bfc' }}>€104</span>
            </div>
          </div>
        </div>
      )}

      {extra}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {onBack && (
          <button onClick={onBack} style={{ flex: 1, appearance: 'none', cursor: 'pointer', background: '#f7f7f8', border: 'none', borderRadius: 10, padding: '12px 24px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, lineHeight: '24px', color: PFC.ink, minHeight: 48 }}>
            Back
          </button>
        )}
        <Button variant="primary" size="large" style={{ flex: 1 }} disabled={continueDisabled} onClick={onContinue}>
          {continueLabel}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobility Expense — benefit-style (3 steps + review + success)
// Steps: 0=Upload, 1=Details, 2=Budget, 3=Review → 4=Success
// ─────────────────────────────────────────────────────────────
const MOB_CATEGORIES = ['Private transport', 'Public transport', 'Shared mobility', 'Mobility subscription'];

function MobilityExpenseScreen() {
  const { pop, push, reset, switchTab } = useNav();
  const [step, setStep]                     = React.useState(0);
  const [uploading, setUploading]           = React.useState(false);
  const [uploaded, setUploaded]             = React.useState(false);
  const [category, setCategory]             = React.useState('Public transport');
  const [amount, setAmount]                 = React.useState('');
  const [date, setDate]                     = React.useState('2026-07-23');
  const [endDate, setEndDate]               = React.useState('');
  const [editField, setEditField]           = React.useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);

  const MOB_STEPS = [
    { label: 'Upload',  n: 1, total: 3 },
    { label: 'Details', n: 2, total: 3 },
    { label: 'Budget',  n: 3, total: 3 },
  ];

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setUploaded(true); }, 1800);
  };

  const handleSubmit = () => {
    const newExpense = {
      id: `mob-new-${Math.floor(Math.random() * 1e9)}`,
      category,
      amount: parseFloat((amount || '0').replace(/[^0-9.,]/g, '').replace(',', '.')),
      date: '23/07/2026',
      status: 'pending',
    };
    window.__submittedExpenses = [newExpense, ...(window.__submittedExpenses || [])];
    setStep(4);
  };

  // ── Success ──
  if (step === 4) {
    const amtNum = parseFloat((amount || '0').replace(/[^0-9.,]/g, '').replace(',', '.'));
    const displayAmt = amtNum > 0 ? `€${amtNum.toFixed(2)}` : '€110.25';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', animation: 'expFadeSlideIn 0.35s ease-out both' }}>
        <div style={{ padding: 16 }}>
          <button onClick={() => { reset('home'); switchTab('home'); }} style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${PFC.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <LucideIcon name="X" size={18} color={PFC.ink} strokeWidth={2} />
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px 80px', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 999, border: `2px solid ${PFC.successText}`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'expPopIn 0.5s ease-out 0.1s both' }}>
            <LucideIcon name="Check" size={26} color={PFC.successText} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, lineHeight: '30px', letterSpacing: '-0.005em', color: PFC.inkDeep, textAlign: 'center', animation: 'expFadeSlideIn 0.4s ease-out 0.2s both' }}>Mobility expense submitted</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, lineHeight: '22px', color: PFC.inkSoft, textAlign: 'center', maxWidth: 260, animation: 'expFadeSlideIn 0.4s ease-out 0.3s both' }}>{displayAmt} under review</span>
          <div style={{ width: '100%', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8, animation: 'expFadeSlideIn 0.4s ease-out 0.4s both' }}>
            <Button variant="primary" size="large" fullWidth onClick={() => push('my-expenses')}>View choice</Button>
            <Button variant="outline" size="large" fullWidth onClick={() => { reset('home'); switchTab('home'); }}>Back to home</Button>
          </div>
        </div>
        <style>{`
          @keyframes expFadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes expPopIn { 0% { opacity: 0; transform: scale(0.5); } 60% { transform: scale(1.12); } 100% { opacity: 1; transform: scale(1); } }
          @keyframes expUploadProgress { from { width: 0%; } to { width: 100%; } }
          @keyframes expUploadSlideIn { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        `}</style>
      </div>
    );
  }

  const mobCancelTrailing = (
    <button onClick={() => setShowCancelConfirm(true)} style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${PFC.border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <LucideIcon name="X" size={18} color={PFC.ink} strokeWidth={2} />
    </button>
  );

  const amtNumGlobal = parseFloat((amount || '0').replace(/[^0-9.,]/g, '').replace(',', '.'));

  // ── Review (step 3) ──
  if (step === 3) {
    const amtNum = amtNumGlobal;
    const amtDisplay = amtNum > 0 ? `€${amtNum.toFixed(2)}` : '—';
    const dateDisplay = date ? date.split('-').reverse().join('/') : '—';
    const endDateDisplay = endDate ? endDate.split('-').reverse().join('/') : '—';
    const isSub = category === 'Mobility subscription';
    const MOB_EDIT_TITLES = { proof: 'Receipt', category: 'Category', amount: 'Price', date: 'Date', endDate: 'End date', budget: 'Budget' };
    const reviewRows = [
      { label: 'Proof',    value: 'receipt.jpg',    sub: null,                            editKey: 'proof' },
      { label: 'Category', value: category,          sub: null,                            editKey: 'category' },
      { label: 'Price',    value: amtDisplay,        sub: null,                            editKey: 'amount' },
      { label: 'Date',     value: dateDisplay,       sub: null,                            editKey: 'date' },
      ...(isSub ? [{ label: 'End date', value: endDateDisplay, sub: null, editKey: 'endDate' }] : []),
      { label: 'Budget',   value: 'Mobility budget', sub: '€555.04 → €0 remaining after', editKey: 'budget' },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
        <NavBar hideBack trailing={mobCancelTrailing} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Heading24>Review</Heading24>
          <div style={{ background: '#fff', border: `1px solid ${PFC.border}`, borderRadius: 16, overflow: 'hidden' }}>
            {reviewRows.map(({ label, value, sub, editKey }, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderTop: i > 0 ? `1px solid ${PFC.border}` : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: PFC.inkSoft, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: PFC.ink }}>{value}</div>
                  {sub && <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 12, color: PFC.inkSoft, marginTop: 2 }}>{sub}</div>}
                </div>
                <button onClick={() => setEditField(editKey)} style={{ appearance: 'none', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: PFC.purple, padding: '0 0 0 8px' }}>Edit</button>
              </div>
            ))}
          </div>
        </div>

        <MobilityFooter
          amtNum={amtNumGlobal}
          onContinue={handleSubmit}
          continueLabel="Submit"
        />

        {editField && (
          <div onClick={() => setEditField(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', padding: '20px 16px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Heading24>{MOB_EDIT_TITLES[editField]}</Heading24>
                <button onClick={() => setEditField(null)} style={{ width: 36, height: 36, borderRadius: 999, border: `1px solid ${PFC.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <LucideIcon name="X" size={16} color={PFC.ink} strokeWidth={2} />
                </button>
              </div>

              {editField === 'category' && (
                <div style={{ border: `1px solid ${PFC.borderHard}`, borderRadius: 12, overflow: 'hidden' }}>
                  {MOB_CATEGORIES.map((cat, i) => (
                    <button key={cat} onClick={() => setCategory(cat)} style={{ width: '100%', appearance: 'none', border: 'none', background: 'transparent', borderTop: i > 0 ? `1px solid ${PFC.border}` : 'none', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 999, flex: 'none', border: `2px solid ${category === cat ? '#e879f9' : PFC.borderHard}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {category === cat && <div style={{ width: 10, height: 10, borderRadius: 999, background: '#e879f9' }} />}
                      </div>
                      <Body16 color={PFC.ink}>{cat}</Body16>
                    </button>
                  ))}
                </div>
              )}

              {editField === 'amount' && (
                <Field label="Amount" value={amount} onChange={setAmount} placeholder="0.00" leftAdornment={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: PFC.inkSoft, marginRight: 2 }}>€</span>} />
              )}

              {editField === 'date' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Body14 color={PFC.ink} weight={600}>Date of expense</Body14>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', border: `1.5px solid ${PFC.borderHard}`, borderRadius: 12, padding: '14px 16px', fontFamily: 'var(--font-display)', fontSize: 16, color: PFC.ink, background: '#fff', outline: 'none', appearance: 'none' }} />
                </div>
              )}

              {editField === 'endDate' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Body14 color={PFC.ink} weight={600}>End date of subscription</Body14>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', border: `1.5px solid ${PFC.borderHard}`, borderRadius: 12, padding: '14px 16px', fontFamily: 'var(--font-display)', fontSize: 16, color: PFC.ink, background: '#fff', outline: 'none', appearance: 'none' }} />
                </div>
              )}

              {editField === 'budget' && (
                <div style={{ border: `2px solid #e879f9`, borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: PFC.ink }}>Mobility budget</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 13, color: PFC.inkSoft, marginTop: 2 }}>€555.04 → €0 remaining after</div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: 999, border: `2px solid #e879f9`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                    <div style={{ width: 11, height: 11, borderRadius: 999, background: '#e879f9' }} />
                  </div>
                </div>
              )}

              {editField === 'proof' && (
                !uploaded ? (
                  <button onClick={handleUpload} style={{ width: '100%', appearance: 'none', cursor: 'pointer', background: '#F7F7F8', border: `1.5px dashed ${PFC.border}`, borderRadius: 16, padding: '28px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <LucideIcon name="UploadCloud" size={28} color={PFC.inkSoft} strokeWidth={1.75} />
                    <Body14 color={PFC.ink} weight={400}>Tap to replace receipt</Body14>
                  </button>
                ) : (
                  <div style={{ border: `1px solid ${PFC.border}`, borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <LucideIcon name="FileCheck" size={24} color="rgb(34,139,34)" strokeWidth={1.75} />
                    <Body14 color={PFC.ink} weight={600} style={{ flex: 1 }}>receipt.jpg</Body14>
                  </div>
                )
              )}

              <Button variant="primary" size="large" fullWidth onClick={() => setEditField(null)}>Save</Button>
            </div>
          </div>
        )}
        {showCancelConfirm && <DiscardConfirmModal onDiscard={pop} onCancel={() => setShowCancelConfirm(false)} />}
      </div>
    );
  }

  const cur = MOB_STEPS[step];
  const progressPct = (cur.n / cur.total) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      <NavBar hideBack trailing={mobCancelTrailing} />

      {/* Step indicator */}
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Body14 color={PFC.ink} weight={600}>Step {cur.n} of {cur.total} · {cur.label}</Body14>
        <div style={{ height: 3, background: PFC.border, borderRadius: 2 }}>
          <div style={{ height: '100%', borderRadius: 2, background: PFC.ink, width: `${progressPct}%`, transition: 'width 300ms ease-out' }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Step 0: Upload */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Heading24>Upload file</Heading24>
            <Body16 color={PFC.inkSoft} weight={400} style={{ lineHeight: '24px' }}>Upload a photo or file of your proof of expense.</Body16>

            {!uploaded ? (
              uploading ? (
                <div style={{ background: '#F7F7F8', border: `1.5px dashed ${PFC.border}`, borderRadius: 16, padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <LucideIcon name="UploadCloud" size={28} color={PFC.purple} strokeWidth={1.75} />
                  <Body14 color={PFC.inkSoft} weight={500}>Uploading receipt.jpg…</Body14>
                  <div style={{ width: '100%', height: 4, background: PFC.border, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: PFC.purple, borderRadius: 2, animation: 'expUploadProgress 1.6s ease-out forwards' }} />
                  </div>
                </div>
              ) : (
                <button onClick={handleUpload} style={{ width: '100%', appearance: 'none', cursor: 'pointer', background: '#F7F7F8', border: `1.5px dashed ${PFC.border}`, borderRadius: 16, padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <LucideIcon name="UploadCloud" size={32} color={PFC.inkSoft} strokeWidth={1.75} />
                  <Body14 color={PFC.ink} weight={400}>Drag and drop or <strong style={{ fontWeight: 700 }}>choose file</strong> to upload</Body14>
                </button>
              )
            ) : (
              <div style={{ border: `1px solid ${PFC.border}`, borderRadius: 16, overflow: 'hidden', animation: 'expUploadSlideIn 0.3s ease-out both' }}>
                <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <LucideIcon name="FileCheck" size={24} color="rgb(34,139,34)" strokeWidth={1.75} />
                  <Body14 color={PFC.ink} weight={600} style={{ flex: 1 }}>receipt.jpg</Body14>
                </div>
                <div style={{ borderTop: `1px solid ${PFC.border}` }}>
                  <button onClick={() => { setUploaded(false); setUploading(false); }} style={{ width: '100%', appearance: 'none', background: 'transparent', border: 'none', padding: '12px', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: PFC.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <LucideIcon name="RefreshCw" size={14} color={PFC.ink} strokeWidth={2} />
                    Change file
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Heading24>Add expense details</Heading24>
            <Body16 color={PFC.inkSoft} weight={400} style={{ lineHeight: '24px' }}>Fill in the details for your mobility expense.</Body16>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Body14 color={PFC.ink} weight={600}>Category</Body14>
              <div style={{ border: `1px solid ${PFC.borderHard}`, borderRadius: 12, overflow: 'hidden' }}>
                {MOB_CATEGORIES.map((cat, i) => (
                  <button key={cat} onClick={() => setCategory(cat)} style={{ width: '100%', appearance: 'none', border: 'none', background: 'transparent', borderTop: i > 0 ? `1px solid ${PFC.border}` : 'none', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 999, flex: 'none', border: `2px solid ${category === cat ? '#e879f9' : PFC.borderHard}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 120ms ease' }}>
                      {category === cat && <div style={{ width: 10, height: 10, borderRadius: 999, background: '#e879f9' }} />}
                    </div>
                    <Body16 color={PFC.ink}>{cat}</Body16>
                  </button>
                ))}
              </div>
            </div>

            <Field
              label="Amount"
              value={amount}
              onChange={setAmount}
              placeholder="0.00"
              leftAdornment={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: PFC.inkSoft, marginRight: 2 }}>€</span>}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Body14 color={PFC.ink} weight={600}>Date of expense</Body14>
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

            {category === 'Mobility subscription' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Body14 color={PFC.ink} weight={600}>End date of subscription</Body14>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    border: `1.5px solid ${PFC.borderHard}`, borderRadius: 12,
                    padding: '14px 16px', fontFamily: 'var(--font-display)',
                    fontSize: 16, color: PFC.ink, background: '#fff',
                    outline: 'none', appearance: 'none',
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Choose budget */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Heading24>Choose budget</Heading24>
              <Body16 color={PFC.inkSoft} weight={400} style={{ lineHeight: '24px' }}>How would you like to fund this benefit?</Body16>
            </div>

            {/* Budget label + card */}
            <Body14 color={PFC.ink} weight={600}>
              Fund {amount ? `€${parseFloat(amount.replace(/[^0-9.,]/g,'').replace(',','.')).toFixed(2)}` : '€0.00'} from...
            </Body14>
            <div style={{
              border: `2px solid #e879f9`,
              borderRadius: 16, padding: '16px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: PFC.ink }}>Mobility budget</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 13, color: PFC.inkSoft, marginTop: 2 }}>€555.04 → €0 remaining after</div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: 999, border: `2px solid #e879f9`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
                <div style={{ width: 11, height: 11, borderRadius: 999, background: '#e879f9' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <MobilityFooter
        amtNum={amtNumGlobal}
        onBack={step === 0 ? pop : () => setStep(step - 1)}
        onContinue={step === 0 ? () => setStep(1) : step === 1 ? () => setStep(2) : () => setStep(3)}
        continueDisabled={step === 0 ? !uploaded : step === 1 ? !amount : false}
      />

      <style>{`
        @keyframes expFadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes expUploadProgress { from { width: 0%; } to { width: 100%; } }
        @keyframes expUploadSlideIn { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      {showCancelConfirm && <DiscardConfirmModal onDiscard={pop} onCancel={() => setShowCancelConfirm(false)} />}
    </div>
  );
}

registerScreen('expense-type', ExpenseTypeScreen);
registerScreen('expense-wizard', ExpenseWizardScreen);
registerScreen('mobility-expense', MobilityExpenseScreen);
registerScreen('my-expenses', MyExpensesScreen);
registerScreen('expense-detail', ExpenseDetailScreen);
