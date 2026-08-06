// Expense screens — employee app
// Screens: expense-wizard, my-expenses

// ─────────────────────────────────────────────────────────────
// Mock data — seeded once on window so other screens can read it
// ─────────────────────────────────────────────────────────────
window.__expensesMockData = [
  { id: 'exp-1', type: 'work',     category: 'Restaurant / meals', amount: 45.00,  date: '18/07/2026', status: 'rejected',   adminNote: 'Receipt is not readable.', hasAttachment: true },
  { id: 'exp-2', type: 'mobility', category: 'Public transport',   amount: 14.00,  date: '21/07/2026', status: 'approved',   hasAttachment: true, card: true },
  { id: 'exp-3', type: 'mobility', category: 'Public transport',   amount: 14.00,  date: '10/06/2026', status: 'approved', card: true },
  { id: 'exp-4', type: 'work',     category: 'Hotel',              amount: 189.00, date: '22/06/2026', status: 'reimbursed', reimbursementMonth: 'July 2026', hasAttachment: true },
  { id: 'exp-5', type: 'work',     category: 'Restaurant / meals', amount: 34.50,  date: '08/06/2026', status: 'reimbursed', reimbursementMonth: 'July 2026' },
  { id: 'exp-6', type: 'mobility', category: 'Public transport',   amount: 14.00,  date: '10/07/2026', status: 'pending' },
  { id: 'exp-7', type: 'mobility', category: 'Public transport',   amount: 64.80,  date: '01/07/2026', status: 'approved', reimbursementMonth: 'July 2026' },
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
      title: 'Commute & transport',
      subtitle: 'Get reimbursed for your commutes',
      pill: 'Mobility budget',
      onClick: () => push('mobility-expense'),
    },
    {
      img: EXPENSE_TYPE_ICONS.cash,
      title: 'Work expenses',
      subtitle: 'Ask your employer for a reimbursement for hotels, restaurant,..',
      onClick: () => push('expense-wizard'),
    },
    {
      img: EXPENSE_TYPE_ICONS.ld,
      title: 'Learning & development',
      subtitle: 'Get courses, books, and certifications reimbursed.',
      pill: 'L&D budget',
      onClick: () => { pop(); navigate('benefits', 'benefit-flow-start', { name: 'Learning and development' }); },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff' }}>
      {/* Top bar with X + flow toggle */}
      <div style={{ padding: '8px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={pop} style={{
          width: 36, height: 36, borderRadius: 999,
          border: `1px solid ${PFC.border}`, background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <LucideIcon name="X" size={18} color={PFC.ink} strokeWidth={2} />
        </button>
        <button
          onClick={() => { window.__pfExpFlow = 'v2'; pop(); push('expense-type-v2'); }}
          style={{
            appearance: 'none', border: `1px solid ${PFC.border}`, background: '#f7f7f8',
            borderRadius: 999, padding: '4px 10px', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 11,
            color: PFC.inkSoft, display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <LucideIcon name="Shuffle" size={11} color={PFC.inkSoft} strokeWidth={2} />
          New flow
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
// Expense Wizard — frictionless employer expense (2 steps + review)
// Steps: 0=Upload, 1=Details, 2=Review
// ─────────────────────────────────────────────────────────────
function ExpenseWizardScreen() {
  const { pop, push } = useNav();
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
    window.__pendingToast = { title: 'Expense submitted' };
    window.__lastSubmittedExpense = newExpense;
    pop();
    pop();
  };

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
                <button onClick={() => setEditField(editKey)} style={{ appearance: 'none', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: '#a3a1aa', padding: '0 0 0 8px' }}>Edit</button>
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
                    Take a photo or <strong style={{ fontWeight: 700 }}>choose file</strong>
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

            <Field
              label="Amount"
              value={amount}
              onChange={setAmount}
              placeholder="0.00"
              leftAdornment={
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: PFC.inkSoft, marginRight: 2 }}>€</span>
              }
            />

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
const MOBILITY_CATEGORIES_EXP = new Set(['Public transport', 'Taxi / Uber', 'Parking', 'Shared mobility', 'Private transport', 'Mobility subscription']);

function getExpIconStyle(exp) {
  const isMobility = exp.type === 'mobility' || MOBILITY_CATEGORIES_EXP.has(exp.category);
  const icon = isMobility ? 'TrainFront' : exp.type === 'lnd' ? 'BookOpen' : 'Briefcase';
  // Colour reflects status: pending (amber) and rejected (red) stand out; approved/reimbursed are neutral grey
  const s = exp.status === 'pending'  ? { bg: '#FFF8EC', color: '#8C5A00' }
          : exp.status === 'rejected' ? { bg: '#FEE2E2', color: '#B91C1C' }
          :                             { bg: '#EEF2F7', color: '#374151' }; // approved / reimbursed
  return { bg: s.bg, color: s.color, icon };
}

function getExpBudgetPill(exp) {
  const isMobility = exp.type === 'mobility' || MOBILITY_CATEGORIES_EXP.has(exp.category);
  if (isMobility) return { label: 'Mobility', bg: '#ddebff', color: '#1568cd' };
  if (exp.type === 'lnd') return { label: 'L&D', bg: '#F3EEFF', color: '#7C3AED' };
  return null;
}

function ExpenseRow({ exp, onPress, last }) {
  const iconStyle = getExpIconStyle(exp);
  const pill = getExpBudgetPill(exp);
  const isPending = exp.status === 'pending';
  return (
    <button
      onClick={onPress}
      style={{
        width: '100%', appearance: 'none', background: 'transparent', border: 'none',
        borderBottom: last ? 'none' : `1px solid ${PFC.border}`,
        padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: 12,
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: iconStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <LucideIcon name={iconStyle.icon} size={20} color={iconStyle.color} strokeWidth={1.75} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: PFC.ink, lineHeight: '20px' }}>{exp.category}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: PFC.inkSoft }}>{exp.date}</span>
          {pill && (
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: pill.color, background: pill.bg, borderRadius: 20, padding: '1px 7px' }}>{pill.label}</span>
          )}
          {exp.card && <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 500, color: PFC.inkSoft, background: PFC.surface, border: `1px solid ${PFC.border}`, borderRadius: 4, padding: '1px 6px', display: 'inline-flex', alignItems: 'center', gap: 3 }}><LucideIcon name="CreditCard" size={10} color={PFC.inkSoft} strokeWidth={2} />Card</span>}
        </div>
      </div>
      {exp.status === 'pending'
        ? <StatusBadge kind="warning">Pending</StatusBadge>
        : exp.status === 'rejected'
        ? <StatusBadge kind="alert">Rejected</StatusBadge>
        : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: PFC.ink, flexShrink: 0 }}>{fmtEUR(exp.amount)}</span>
      }
      <LucideIcon name="ChevronRight" size={18} color={PFC.inkSoft} strokeWidth={2} style={{ flexShrink: 0 }} />
    </button>
  );
}

function ExpenseGroup({ exps, onPress }) {
  return (
    <div style={{ background: 'white', border: `1px solid ${PFC.border}`, borderRadius: 16, overflow: 'hidden' }}>
      {exps.map((exp, i) => (
        <ExpenseRow key={exp.id} exp={exp} last={i === exps.length - 1} onPress={() => onPress(exp)} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// My Expenses — filter chips + month sections with totals
// ─────────────────────────────────────────────────────────────
function MyExpensesScreen({ filterType: filterTypeProp, filterMonth: filterMonthProp, reimbursedMonth }) {
  const { pop, push } = useNav();

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const formatMonthKey = (key) => { const [y, m] = key.split('-'); return `${MONTH_NAMES[parseInt(m) - 1].toUpperCase()} ${y}`; };
  const toMonthKey = (dateStr) => { const p = dateStr.split('/'); return `${p[2]}-${p[1]}`; };

  // Payslip breakdown mode: show only the expenses that make up a wage line —
  // non-card (card is budget-deducted, not reimbursed), reimbursed/approved,
  // attributed to the payslip by reimbursement month (or incurred that month).
  const _payslipKey = (() => {
    if (!reimbursedMonth) return null;
    const [mName, y] = reimbursedMonth.split(' ');
    const idx = MONTH_NAMES.indexOf(mName);
    return idx >= 0 ? `${y}-${String(idx + 1).padStart(2, '0')}` : null;
  })();

  const [activeType, setActiveType]   = React.useState(filterTypeProp || null);
  const [activeMonth, setActiveMonth] = React.useState(filterMonthProp || null);
  const [showTypeSheet, setShowTypeSheet]   = React.useState(false);
  const [showMonthSheet, setShowMonthSheet] = React.useState(false);

  const allExpensesRaw = [...(window.__submittedExpenses || []), ...(window.__expensesMockData || [])];

  const filtered = allExpensesRaw.filter(e => {
    const isMob = e.type === 'mobility' || MOBILITY_CATEGORIES_EXP.has(e.category);
    if (activeType === 'mobility' && !isMob) return false;
    if (activeType === 'work' && (isMob || e.type === 'lnd')) return false;
    if (activeType === 'lnd' && e.type !== 'lnd') return false;
    if (reimbursedMonth) {
      if (e.card) return false;
      if (e.status !== 'approved' && e.status !== 'reimbursed') return false;
      return e.reimbursementMonth === reimbursedMonth || toMonthKey(e.date) === _payslipKey;
    }
    if (activeMonth && toMonthKey(e.date) !== activeMonth) return false;
    return true;
  });

  const availableMonths = [...new Set(allExpensesRaw.map(e => toMonthKey(e.date)))].sort().reverse();

  const monthKeys = activeMonth
    ? [activeMonth]
    : [...new Set(filtered.map(e => toMonthKey(e.date)))].sort().reverse();

  const groupedByMonth = reimbursedMonth
    ? [{ key: _payslipKey, items: filtered }]
    : monthKeys.map(key => ({
        key,
        items: filtered.filter(e => toMonthKey(e.date) === key),
      }));

  const title = activeType === 'mobility' ? 'Mobility expenses'
    : activeType === 'work' ? 'Work expenses'
    : activeType === 'lnd'  ? 'L&D expenses'
    : 'My expenses';

  const goToDetail = (exp) => push('expense-detail', { expense: exp });

  const typeRows = [
    { label: 'Mobility expense', kind: 'mobility', iconName: 'TrainFront', bg: '#FFF0D4', color: '#B45309' },
    { label: 'Work expense',     kind: 'work',     iconName: 'Briefcase',  bg: '#EEF2F7', color: '#374151' },
    { label: 'L&D',              kind: 'lnd',      iconName: 'BookOpen',   bg: '#F3EEFF', color: '#7C3AED' },
  ];

  const chipStyle = (active) => ({
    appearance: 'none', border: `1px solid ${active ? PFC.ink : PFC.border}`,
    background: active ? PFC.ink : 'white', borderRadius: 999,
    padding: '6px 12px', cursor: 'pointer',
    fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 500,
    color: active ? 'white' : PFC.ink,
    display: 'flex', alignItems: 'center', gap: 5,
  });

  const sheetPanel = { width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', padding: '12px 16px 40px', boxSizing: 'border-box' };
  const handleBar = <div style={{ width: 32, height: 4, background: '#E5E5EA', borderRadius: 2, margin: '0 auto 16px' }} />;
  const backdrop = (onClose) => ({ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F2F2F2' }}>
      <NavBar />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Heading28>{title}</Heading28>

        {/* Filter chips — hidden in payslip breakdown mode */}
        {!reimbursedMonth && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={chipStyle(!!activeType)} onClick={() => activeType ? setActiveType(null) : setShowTypeSheet(true)}>
            {activeType
              ? <>{activeType === 'mobility' ? 'Mobility' : activeType === 'work' ? 'Work' : 'L&D'} <span style={{ opacity: 0.6 }}>✕</span></>
              : <>Type <LucideIcon name="ChevronDown" size={13} color={PFC.inkSoft} strokeWidth={2} /></>
            }
          </button>
          <button style={chipStyle(!!activeMonth)} onClick={() => activeMonth ? setActiveMonth(null) : setShowMonthSheet(true)}>
            {activeMonth
              ? <>{SHORT_MONTHS[parseInt(activeMonth.split('-')[1]) - 1]} {activeMonth.split('-')[0]} <span style={{ opacity: 0.6 }}>✕</span></>
              : <>Month <LucideIcon name="ChevronDown" size={13} color={PFC.inkSoft} strokeWidth={2} /></>
            }
          </button>
        </div>
        )}

        {/* Month sections */}
        {groupedByMonth.map(({ key, items }) => {
          const total = items.reduce((s, e) => s + (e.amount || 0), 0);
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0 8px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: PFC.inkSoft, letterSpacing: '0.06em' }}>{formatMonthKey(key)}</span>
                {items.length > 0 && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 11, color: PFC.inkSoft }}>{fmtEUR(total)}</span>}
              </div>
              {items.length === 0
                ? <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: PFC.inkSoft, padding: '12px 0 4px', textAlign: 'center' }}>No expenses.</div>
                : <ExpenseGroup exps={items} onPress={goToDetail} />
              }
            </div>
          );
        })}

        {allExpensesRaw.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16, padding: '40px 24px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LucideIcon name="Receipt" size={32} color={PFC.purple} strokeWidth={1.5} />
            </div>
            <Heading20>No expenses yet</Heading20>
            <Body14 color={PFC.inkSoft} weight={500}>Submit your first expense to get started.</Body14>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${PFC.border}`, background: '#fff' }}>
        <Button variant="primary" size="large" fullWidth onClick={() => window.__openExpenseSheet && window.__openExpenseSheet()}>Add expense</Button>
      </div>

      {/* Type filter bottom sheet */}
      {showTypeSheet && (
        <div onClick={() => setShowTypeSheet(false)} style={backdrop()}>
          <div onClick={e => e.stopPropagation()} style={sheetPanel}>
            {handleBar}
            {typeRows.map(({ label, kind, iconName, bg, color }, i) => (
              <button key={kind} onClick={() => { setActiveType(kind); setShowTypeSheet(false); }} style={{
                width: '100%', appearance: 'none', background: activeType === kind ? '#F7F7F8' : 'transparent', border: 'none',
                borderTop: i > 0 ? `1px solid ${PFC.border}` : 'none',
                padding: '14px 0', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LucideIcon name={iconName} size={20} color={color} strokeWidth={1.75} />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, color: PFC.ink, flex: 1 }}>{label}</span>
                {activeType === kind && <LucideIcon name="Check" size={18} color={PFC.ink} strokeWidth={2} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Month filter bottom sheet */}
      {showMonthSheet && (
        <div onClick={() => setShowMonthSheet(false)} style={backdrop()}>
          <div onClick={e => e.stopPropagation()} style={sheetPanel}>
            {handleBar}
            {availableMonths.map((key, i) => {
              const [y, m] = key.split('-');
              return (
                <button key={key} onClick={() => { setActiveMonth(key); setShowMonthSheet(false); }} style={{
                  width: '100%', appearance: 'none', background: activeMonth === key ? '#F7F7F8' : 'transparent', border: 'none',
                  borderTop: i > 0 ? `1px solid ${PFC.border}` : 'none',
                  padding: '14px 0', cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 15, color: PFC.ink,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  {MONTH_NAMES[parseInt(m) - 1]} {y}
                  {activeMonth === key && <LucideIcon name="Check" size={18} color={PFC.ink} strokeWidth={2} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Expense Detail — clean field list, status badge, Payflip advantage
// ─────────────────────────────────────────────────────────────
function ExpenseDetailScreen({ expense }) {
  const { pop, push } = useNav();
  const [showAdvModal, setShowAdvModal] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  if (!expense) { pop(); return null; }

  const STATUS_LABEL = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', reimbursed: 'Reimbursed' };
  const STATUS_KIND  = { pending: 'warning', approved: 'success', rejected: 'alert', reimbursed: 'neutral' };

  const isMobility = expense.type === 'mobility' || MOBILITY_CATEGORIES_EXP.has(expense.category);
  const budgetUsed = isMobility ? 'Mobility budget' : expense.type === 'lnd' ? 'L&D budget' : 'Employer reimbursed';
  const canEdit = expense.status === 'pending';
  const showAdvantage = isMobility && expense.status !== 'rejected';

  const fieldRows = [
    { label: 'Amount',        value: fmtEUR(expense.amount) },
    ...(expense.hasAttachment ? [{ label: 'Attachement', value: <span style={{ color: '#1568cd', fontWeight: 600 }}>File.pdf</span> }] : []),
    { label: 'Budget used',   value: budgetUsed },
    ...((expense.status === 'approved' || expense.status === 'reimbursed')
      ? [ expense.card
          // Card expenses are deducted straight from the budget — never reimbursed via payroll
          ? { label: 'Payment', value: 'Deducted from budget' }
          : { label: 'Reimbursement', value: expense.status === 'reimbursed'
              ? <button onClick={() => push('me-payslip')} style={{ appearance: 'none', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: '#1568cd' }}>{expense.reimbursementMonth} payroll<LucideIcon name="ChevronRight" size={14} color="#1568cd" strokeWidth={2} /></button>
              : (expense.reimbursementMonth || 'August 2026') } ]
      : []),
    { label: 'Submitted on',  value: expense.date },
    ...(expense.status === 'approved' || expense.status === 'reimbursed'
      ? [{ label: 'Approved on', value: expense.date }]
      : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#F2F2F2' }}>
      {/* Header: back + centered "Expense details" + Edit, then big title below (matches time-off detail) */}
      <div style={{ padding: '8px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, position: 'relative' }}>
        <button onClick={pop} style={{ width: 36, height: 36, borderRadius: 8, background: '#fff', border: `1px solid ${PFC.border}`, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LucideIcon name="ChevronLeft" size={26} color={PFC.ink} strokeWidth={2} />
        </button>
        <h1 style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: PFC.ink, letterSpacing: '-0.003em', margin: 0, whiteSpace: 'nowrap', pointerEvents: 'none' }}>Expense details</h1>
        {canEdit
          ? <button onClick={() => push('expense-form-v2', { type: expense.type || (isMobility ? 'mobility' : 'work'), category: expense.category, amount: expense.amount, date: expense.date, editId: expense.id, direct: true })} style={{ appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: PFC.ink, padding: 4, minWidth: 36 }}>Edit</button>
          : <div style={{ width: 36 }} />
        }
      </div>
      <div style={{ padding: '6px 16px 12px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: PFC.ink, letterSpacing: '-0.5px', lineHeight: '32px' }}>{expense.category}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Status badge */}
        <StatusBadge kind={STATUS_KIND[expense.status]}>{STATUS_LABEL[expense.status]}</StatusBadge>

        {/* Rejection note */}
        {expense.status === 'rejected' && expense.adminNote && (
          <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 10 }}>
            <LucideIcon name="TriangleAlert" size={18} color="#dc2626" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#dc2626', marginBottom: 2 }}>Expense rejected</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: '#b91c1c', lineHeight: '18px' }}>{expense.adminNote}</div>
            </div>
          </div>
        )}

        {/* Field list */}
        <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${PFC.border}`, padding: '0 16px' }}>
          {fieldRows.map((row, i) => (
            <div key={row.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 0',
              borderBottom: i < fieldRows.length - 1 ? `1px solid ${PFC.border}` : 'none',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: PFC.inkSoft }}>{row.label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: PFC.ink }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Payflip advantage box */}
        {showAdvantage && (
          <div style={{ background: '#F3EEFF', borderRadius: 14, padding: '16px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: PFC.purpleDeep, marginBottom: 8 }}>Payflip advantage</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: PFC.purpleDeep, marginBottom: 4 }}>€104</div>
            <button onClick={() => setShowAdvModal(true)} style={{ appearance: 'none', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: PFC.purpleDeep, textDecoration: 'underline' }}>
              How is this calculated?
            </button>
          </div>
        )}

      </div>

      {/* Pinned action bar */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${PFC.border}`, background: '#fff', display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        {expense.status === 'rejected' && (
          <Button variant="primary" size="large" fullWidth onClick={() => push('expense-form-v2', { type: expense.type || (isMobility ? 'mobility' : 'work'), category: expense.category, amount: expense.amount, date: expense.date, rejectionReason: expense.adminNote, editId: expense.id, direct: true })}>Edit &amp; resubmit</Button>
        )}
        <button onClick={() => setShowDeleteConfirm(true)} style={{ appearance: 'none', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14, color: '#dc2626', padding: '8px 0', textAlign: 'center' }}>
          Delete expense
        </button>
      </div>

      {/* Delete confirm sheet */}
      {showDeleteConfirm && (
        <div onClick={() => setShowDeleteConfirm(false)} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 16px 40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: PFC.ink, marginBottom: 4 }}>Delete expense?</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 15, color: PFC.inkSoft, marginBottom: 8 }}>This action cannot be undone.</span>
            <button onClick={pop} style={{ appearance: 'none', border: 'none', borderRadius: 10, background: '#dc2626', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, padding: '12px 24px', cursor: 'pointer', minHeight: 48 }}>Delete</button>
            <button onClick={() => setShowDeleteConfirm(false)} style={{ appearance: 'none', border: 'none', borderRadius: 10, background: '#f7f7f8', color: PFC.ink, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, padding: '12px 24px', cursor: 'pointer', minHeight: 48 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Payflip advantage modal */}
      {showAdvModal && <PayflipAdvantageModal amtNum={104} onClose={() => setShowAdvModal(false)} />}
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
// Toast — lightweight success notification (auto-dismisses after 4s)
// Driven by window.__pendingToast; read and cleared by the receiving screen.
// ─────────────────────────────────────────────────────────────
function Toast({ title, onDismiss, onAction, actions }) {
  React.useEffect(() => {
    // Keyframes keep translateX(-50%) so the toast stays horizontally centred after animating
    if (!document.getElementById('toast-keyframes-v2')) {
      const el = document.createElement('style');
      el.id = 'toast-keyframes-v2';
      el.textContent = '@keyframes toastSlideUp { from { opacity: 0; transform: translateX(-50%) translateY(16px) scale(0.96); } to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); } }';
      document.head.appendChild(el);
    }
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, []);

  const acts = (actions && actions.length) ? actions : (onAction ? [{ label: 'View', onClick: onAction }] : []);

  return (
    <div style={{
      position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
      zIndex: 500,
      background: '#16a34a', borderRadius: 999,
      boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
      padding: acts.length ? '10px 10px 10px 16px' : '10px 16px',
      display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
      maxWidth: 'calc(100% - 32px)',
      animation: 'toastSlideUp 0.3s cubic-bezier(0.22,1,0.36,1) both',
    }}>
      <LucideIcon name="Check" size={18} color="#fff" strokeWidth={2.5} />
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, lineHeight: '22px', color: '#fff' }}>{title}</span>
      {acts.map((a, i) => (
        <button key={i} onClick={a.onClick} style={{
          marginLeft: i === 0 ? 4 : 0,
          background: 'rgba(255,255,255,0.22)', border: 'none', borderRadius: 8,
          padding: '4px 12px', cursor: 'pointer', whiteSpace: 'nowrap',
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: '#fff',
        }}>{a.label}</button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Payflip Advantage Modal — bottom sheet explaining the tax advantage
// ─────────────────────────────────────────────────────────────
function PayflipAdvantageModal({ amtNum, onClose }) {
  const hasAmount = (amtNum || 0) > 0;
  const payflipNet = hasAmount ? amtNum : 548;
  const advantage = Math.round(payflipNet * 0.19);
  const cashNet = payflipNet - advantage;
  const fmt = (n) => `€${n % 1 === 0 ? n : n.toFixed(2)}`;

  const COL_W = 90;
  const EXEMPT = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#16a34a', fontWeight: 700, fontSize: 13 }}>
      <LucideIcon name="Check" size={13} color="#16a34a" strokeWidth={2.5} />
      Exempt
    </span>
  );

  const rows = [
    { label: 'Employer NSSO', cash: '−8.86%', payflip: '−8.86%', payflipIsExempt: false },
    { label: 'Employee NSSO', cash: '−13.07%', payflip: null, payflipIsExempt: true },
    { label: 'Income tax',    cash: '−53.3%',  payflip: null, payflipIsExempt: true },
  ];

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', maxHeight: 'calc(100% - 60px)', overflowY: 'auto', boxSizing: 'border-box' }}
      >
      <div style={{ padding: '24px 16px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, lineHeight: '28px', color: PFC.ink }}>How is this calculated?</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 14, lineHeight: '20px', color: PFC.inkSoft }}>
            Here's why going through Payflip beats taking the same amount as cash.
          </span>
        </div>

        {/* Amount chip */}
        <div style={{ alignSelf: 'flex-start', background: '#f3e8ff', borderRadius: 999, padding: '6px 14px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#7c3aed' }}>{fmt(payflipNet)}</span>
        </div>

        {/* Comparison table */}
        <div style={{ border: `1px solid ${PFC.border}`, borderRadius: 14, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'flex', background: '#f7f7f8', padding: '10px 16px', borderBottom: `1px solid ${PFC.border}` }}>
            <div style={{ flex: 1 }} />
            <div style={{ width: COL_W, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: PFC.inkSoft, letterSpacing: '0.04em' }}>CASH</div>
            <div style={{ width: COL_W, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, color: '#7c3aed', letterSpacing: '0.04em' }}>PAYFLIP</div>
          </div>

          {/* Deduction rows */}
          {rows.map((row, i) => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${PFC.border}` }}>
              <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: PFC.inkSoft }}>{row.label}</div>
              <div style={{ width: COL_W, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: PFC.ink }}>{row.cash}</div>
              <div style={{ width: COL_W, textAlign: 'center' }}>
                {row.payflipIsExempt ? EXEMPT : (
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: PFC.ink }}>{row.payflip}</span>
                )}
              </div>
            </div>
          ))}

          {/* Net total row */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', background: '#fafafa' }}>
            <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: PFC.ink }}>Net</div>
            <div style={{ width: COL_W, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: PFC.ink }}>{fmt(cashNet)}</div>
            <div style={{ width: COL_W, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#7c3aed' }}>{fmt(payflipNet)}</div>
          </div>
        </div>

        {/* Payflip advantage callout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: PFC.inkSoft, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Estimated Payflip advantage</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src={PAYFLIP_ADV_ICON} alt="" style={{ width: 11, height: 18, display: 'block', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, lineHeight: '36px', letterSpacing: '-0.01em', color: '#c42bfc' }}>{fmt(advantage)}</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 13, color: PFC.inkSoft, lineHeight: '18px' }}>
            That's how much more you keep by claiming this expense through Payflip instead of taking it as extra salary.
          </span>
        </div>

        {/* Info note */}
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 8 }}>
          <LucideIcon name="Info" size={16} color="#0369a1" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 13, color: '#0c4a6e', lineHeight: '18px' }}>
            A 30% government tax reduction can stack on top — ask your employer for details.
          </span>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{ appearance: 'none', border: 'none', borderRadius: 12, background: PFC.ink, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, lineHeight: '24px', padding: '14px 24px', cursor: 'pointer', minHeight: 52 }}
        >
          Close
        </button>
      </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MobilityFooter — Figma-matched footer: stats + action buttons
// ─────────────────────────────────────────────────────────────
const PAYFLIP_ADV_ICON = 'https://www.figma.com/api/mcp/asset/6fa2e40e-e8fd-48f9-9d84-a6f9e4656c0a';

function MobilityFooter({ amtNum, onBack, onContinue, continueLabel = 'Continue', continueDisabled = false, extra, onAdvantageInfo }) {
  const hasAmount = (amtNum || 0) > 0;
  const impact = hasAmount ? `€${amtNum.toFixed(2)}` : '—';
  const advantageAmt = hasAmount ? Math.round(amtNum * 0.19) : null;
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
              <button
                onClick={onAdvantageInfo}
                style={{ appearance: 'none', border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <LucideIcon name="Info" size={12} color={PFC.inkSoft} strokeWidth={2} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <img src={PAYFLIP_ADV_ICON} alt="" style={{ width: 13, height: 22, display: 'block', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, lineHeight: '32px', letterSpacing: '-0.12px', color: '#c42bfc' }}>€{advantageAmt}</span>
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
// Mobility Expense — benefit-style (3 steps + review)
// Steps: 0=Upload, 1=Details, 2=Budget, 3=Review
// ─────────────────────────────────────────────────────────────
const MOB_CATEGORIES = ['Private transport', 'Public transport', 'Shared mobility', 'Mobility subscription'];

function MobilityExpenseScreen() {
  const { pop, push } = useNav();
  const [step, setStep]                     = React.useState(0);
  const [uploading, setUploading]           = React.useState(false);
  const [uploaded, setUploaded]             = React.useState(false);
  const [category, setCategory]             = React.useState('Public transport');
  const [amount, setAmount]                 = React.useState('');
  const [date, setDate]                     = React.useState('2026-07-23');
  const [endDate, setEndDate]               = React.useState('');
  const [editField, setEditField]           = React.useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [showAdvantageModal, setShowAdvantageModal] = React.useState(false);

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
    window.__lastSubmittedExpense = newExpense;
    // Show the success toast immediately from any screen (home OR benefits page)
    if (window.__showToast) window.__showToast('Mobility expense submitted', [
      { label: 'View', onClick: () => push('expense-detail', { expense: newExpense }) },
      { label: 'Add another', onClick: () => window.__openExpenseSheet && window.__openExpenseSheet() },
    ]);
    else window.__pendingToast = { title: 'Mobility expense submitted' };
    pop();
    pop();
  };

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
                <button onClick={() => setEditField(editKey)} style={{ appearance: 'none', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: '#a3a1aa', padding: '0 0 0 8px' }}>Edit</button>
              </div>
            ))}
          </div>
        </div>

        <MobilityFooter
          amtNum={amtNumGlobal}
          onContinue={handleSubmit}
          continueLabel="Submit"
          onAdvantageInfo={() => setShowAdvantageModal(true)}
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
                  <Body14 color={PFC.ink} weight={400}>Take a photo or <strong style={{ fontWeight: 700 }}>choose file</strong></Body14>
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

            <Field
              label="Amount"
              value={amount}
              onChange={setAmount}
              placeholder="0.00"
              leftAdornment={<span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: PFC.inkSoft, marginRight: 2 }}>€</span>}
            />

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
        onAdvantageInfo={() => setShowAdvantageModal(true)}
      />

      <style>{`
        @keyframes expFadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes expUploadProgress { from { width: 0%; } to { width: 100%; } }
        @keyframes expUploadSlideIn { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      {showCancelConfirm && <DiscardConfirmModal onDiscard={pop} onCancel={() => setShowCancelConfirm(false)} />}
      {showAdvantageModal && (
        <PayflipAdvantageModal
          amtNum={amtNumGlobal}
          onClose={() => setShowAdvantageModal(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ExpenseTypeSheet — bottom sheet overlay for add-expense entry
// ─────────────────────────────────────────────────────────────
function ExpenseTypeSheet({ onClose }) {
  const nav = window.useNav ? window.useNav() : null;
  const rows = [
    { label: 'Mobility expense', note: 'Mobility budget',      kind: 'mobility', iconName: 'TrainFront', bg: '#FFF0D4', color: '#B45309',
      onPress: () => { onClose(); nav && nav.push('expense-form-v2', { type: 'mobility', direct: true }); } },
    { label: 'Work expense',     note: 'Employer reimbursed',  kind: 'work',     iconName: 'Briefcase',  bg: '#EEF2F7', color: '#374151',
      onPress: () => { onClose(); nav && nav.push('expense-form-v2', { type: 'work', direct: true }); } },
    { label: 'L&D',              note: 'L&D budget',           kind: 'lnd',      iconName: 'BookOpen',   bg: '#F3EEFF', color: '#7C3AED',
      onPress: () => { onClose(); nav && nav.push('benefit-flow-start', { name: 'Learning and development' }); } },
  ];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', padding: '12px 16px 40px', boxSizing: 'border-box' }}>
        <div style={{ width: 32, height: 4, background: '#E5E5EA', borderRadius: 2, margin: '0 auto 16px' }} />
        {rows.map(({ label, note, kind, iconName, bg, color, onPress }, i) => (
          <button key={kind} onClick={onPress} style={{
            width: '100%', appearance: 'none', background: 'transparent', border: 'none',
            borderTop: i > 0 ? `1px solid ${PFC.border}` : 'none',
            padding: '14px 0', cursor: 'pointer', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LucideIcon name={iconName} size={22} color={color} strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: PFC.ink }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 13, color: PFC.inkSoft, marginTop: 2 }}>{note}</div>
            </div>
            <LucideIcon name="ChevronRight" size={18} color={PFC.inkSoft} strokeWidth={2} />
          </button>
        ))}
      </div>
    </div>
  );
}
window.ExpenseTypeSheet = ExpenseTypeSheet;

registerScreen('expense-type', ExpenseTypeScreen);
registerScreen('expense-wizard', ExpenseWizardScreen);
registerScreen('mobility-expense', MobilityExpenseScreen);
registerScreen('my-expenses', MyExpensesScreen);
registerScreen('expense-detail', ExpenseDetailScreen);
window.Toast = Toast;
