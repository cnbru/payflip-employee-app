// ── Payflip HR Admin — Desktop Prototype ──────────────────────────────────

const { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } = React;

// ── Design tokens ──────────────────────────────────────────────────────────
const P = {
  // Neutrals
  ink:          'var(--gray-900)',
  inkSoft:      'var(--gray-700)',
  inkFaint:     'var(--gray-500)',
  border:       'var(--gray-200)',
  borderStrong: 'var(--gray-300)',
  borderHover:  'var(--gray-400)',
  bg:           'var(--gray-100)',
  bgSubtle:     'var(--gray-050)',
  white:        'var(--gray-0)',
  // Brand
  accent:       'var(--blue-500)',
  action:       'var(--bg-primary-default)',
  // Alert / danger
  danger:       'var(--alert-500)',
  dangerBg:     'var(--alert-100)',
  dangerBorder: 'var(--alert-200)',
  dangerDark:   'var(--alert-700)',
  // Success
  success:      'var(--success-500)',
  successBg:    'var(--success-100)',
  successBorder:'var(--success-200)',
  successDark:  'var(--success-700)',
  // Warning
  warning:      'var(--warning-500)',
  warningBg:    'var(--warning-100)',
  warningBorder:'var(--warning-200)',
  warningDark:  'var(--warning-700)',
};

// Uppercase section-label style shared by every settings screen (was
// redefined locally 9 times with a silent 8px/10px marginBottom split).
const SL = { fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 'var(--space-100)' };

const StatusMeta = {
  pending:  { dot: P.warning,  label: 'Pending',  icon: 'Clock', color: P.warningDark,  bg: P.warningBorder },
  approved: { dot: P.success,  label: 'Approved', icon: 'Check', color: P.successDark,  bg: P.successBorder },
  rejected: { dot: P.danger,   label: 'Declined', icon: 'X',     color: P.dangerDark,   bg: P.dangerBorder },
  declined: { dot: P.danger,   label: 'Declined', icon: 'X',     color: P.dangerDark,   bg: P.dangerBorder },
  ended:    { dot: P.inkFaint, label: 'Ended',    icon: 'Minus', color: P.inkSoft,      bg: P.bg },
};

const avatarUrl = (name, gender) => {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const img = gender === 'f' ? (hash % 35) + 1 : (hash % 35) + 36;
  return `https://i.pravatar.cc/64?img=${img}`;
};

const LEAVE_COLORS = {
  'Statutory annual leave':                    '#c5dcfd',
  'ADV / RTT':                   P.warningBg,
  'Extra-legal leave':           '#ede9fe',
  'Sick leave':                  '#fbd0e4',
  'Paternity leave':                 P.successBorder,
  'Maternity leave':             '#fce7f3',
  'Wedding':                     '#fde9c8',
  'Funeral leave':               '#d8d3e3',
  'Ceremony':                    P.warningBg,
  'Civic duty':                  '#c5dcfd',
  'Moving':                      '#fde9c8',
  'Seniority leave':             '#d1fae5',
};
const LEAVE_BORDER_COLORS = {
  'Statutory annual leave':                    '#7aafe8',
  'ADV / RTT':                   '#e5c87a',
  'Extra-legal leave':           '#a899e0',
  'Sick leave':                  '#e698b8',
  'Paternity leave':                 '#6ee7b7',
  'Maternity leave':             '#f9a8d4',
  'Wedding':                     '#e0b97a',
  'Funeral leave':               '#a99dba',
  'Ceremony':                    '#e5c87a',
  'Civic duty':                  '#7aafe8',
  'Moving':                      '#e0b97a',
  'Seniority leave':             '#6ee7b7',
};
// Reverse map: fill color hex → border color hex (for palette swatches)
const COLOR_TO_BORDER = Object.fromEntries(
  Object.entries(LEAVE_COLORS).map(([name, fill]) => [fill, LEAVE_BORDER_COLORS[name]])
);

const SPECIAL_LEAVE_METADATA = {
  'Statutory annual leave':   { statutory: true, statutoryDays: 20, statutoryLabel: '20 days minimum', statutoryNote: 'Belgian law mandates a minimum of 20 days per year for full-time employees (prorated for part-time). Individual employees can be allocated more under Employee exceptions.' },
  'Sick leave':               { statutory: true, statutoryDays: null, statutoryLabel: null, statutoryNote: 'Employer pays guaranteed wage for up to 30 days (white collar). RIZIV pays 60% of capped salary from day 31 · 65%/55%/45% after 1 year depending on civil status. Up to 3 illness periods per year without medical certificate.' },
  'Paternity leave':                 { statutory: true, statutoryDays: 20, statutoryLabel: '20 days', statutoryNote: 'First 3 days paid by employer at full salary (klein verlet) · remaining 17 days reimbursed by INAMI at 82% of capped salary. Must be taken within 4 months of birth.' },
  'Maternity leave':             { statutory: true, statutoryDays: null, statutoryLabel: '15 weeks', statutoryNote: 'Pre-natal: up to 6 weeks before due date (1 week mandatory). Post-natal: minimum 9 weeks mandatory. INAMI pays 82% of capped salary for first 30 days · 75% thereafter.' },
  'Wedding':                    { statutory: true,  statutoryDays: 2,  statutoryLabel: 'Up to 2 days', statutoryNote: "Own wedding: 2 days · Child's, sibling's or parent's wedding: 1 day" },
  'Funeral leave':              { statutory: true,  statutoryDays: 10, statutoryLabel: 'Up to 10 days', statutoryNote: 'Spouse or child: 3 days immediate + 7 flexible (Royal Decree 2021). Parent or in-law: 3 days. Sibling, grandparent: 2 days. Other family: 1 day.' },
  'Ceremony':                   { statutory: true,  statutoryDays: 1,  statutoryLabel: '1 day',    statutoryNote: "Child's solemn communion or humanist coming-of-age ceremony" },
  'Civic duty':                 { statutory: true,  statutoryDays: null, statutoryLabel: 'Duration of duty', statutoryNote: 'For the duration of jury duty, court summons, or other civic obligation — no fixed maximum' },
  'Moving':                     { statutory: false, companyPolicy: true, statutoryDays: 1, statutoryLabel: '1 day', statutoryNote: 'Company benefit — not legally mandated, freely configurable' },
  'Seniority leave':            { statutory: false, companyPolicy: true, statutoryDays: null, statutoryLabel: null, statutoryNote: 'Company benefit — extra days awarded based on years of service. Not legally required.' },
};

const LEAVE_SECTIONS = [
  { id: 'time-off',      label: 'Time off',      typeNames: ['Statutory annual leave', 'ADV / RTT', 'Extra-legal leave'] },
  { id: 'sick-leave',    label: 'Sick leave',     typeNames: ['Sick leave'] },
  { id: 'parental',      label: 'Parental leave', typeNames: ['Paternity leave', 'Maternity leave'] },
  { id: 'special-leave', label: 'Special leave',  typeNames: ['Wedding', 'Funeral leave', 'Ceremony', 'Civic duty', 'Moving', 'Seniority leave'] },
];


const LEAVE_SECTION_ICONS = {
  'time-off':      'palmtree',
  'sick-leave':    'stethoscope',
  'parental':      'baby',
  'special-leave': null, // uses per-name icons below
};
const LEAVE_ICONS = {
  'Wedding':      'heart',
  'Funeral leave':'flower-2',
  'Ceremony':     'book-open',
  'Civic duty':   'landmark',
  'Moving':       'truck',
  'Seniority leave': 'award',
};

const ALL_LEAVE_TYPES = [
  'Statutory annual leave', 'ADV / RTT', 'Extra-legal leave',
  'Sick leave', 'Paternity leave', 'Maternity leave', 'Special leave',
];

const ADMIN_ONLY_TYPES = new Set(['Paternity leave', 'Maternity leave', 'Paid absence', 'Unpaid absence']);

const SPECIAL_LEAVE_REASONS = [
  { id: 'wedding',   label: 'Wedding',      hasWho: true,  entitlement: null },
  { id: 'moving',    label: 'Moving',        hasWho: false, entitlement: '1 day' },
  { id: 'funeral',   label: 'Funeral leave', hasWho: true,  entitlement: null },
  { id: 'ceremony',  label: 'Ceremony',      hasWho: false, entitlement: '1 day' },
  { id: 'civic',     label: 'Civic duty',    hasWho: false, entitlement: 'Up to 5 days' },
];
const SPECIAL_WEDDING_WHO = [
  { id: 'own',    label: "Employee's own wedding",         days: 2 },
  { id: 'family', label: "Child, sibling, or parent of the employee", days: 1 },
];
const SPECIAL_FUNERAL_WHO = [
  { id: 'partner',  label: 'Partner or spouse',           days: 10, note: '3 around the funeral, 7 more within the year' },
  { id: 'child',    label: 'Child',                       days: 10, note: '3 around the funeral, 7 more within the year' },
  { id: 'parent',   label: 'Parent or parent-in-law',     days: 3  },
  { id: 'sibling',  label: 'Sibling or grandparent',      days: 2  },
  { id: 'other',    label: 'Other family member',         days: 1  },
];

const ATTACHMENT_RULES = {
  'Sick leave':       { label: 'Medical certificate', note: 'Required for absences of 2 or more consecutive days' },
  'Special leave':    { label: 'Supporting document', note: 'Marriage/birth certificate or official event proof' },
  'Funeral leave':    { label: 'Death certificate', note: 'Required to process bereavement leave' },
  'Paternity leave':                { label: 'Birth certificate', note: 'Required to record birth leave entitlement' },
  'Maternity leave':  { label: 'Medical certificate', note: 'Required to activate maternity leave entitlement' },
};

// ── Lucide icon helper ─────────────────────────────────────────────────────
function Icon({ name, size = 16, color = P.inkSoft, strokeWidth = 1.75, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.lucide) return;
    ref.current.innerHTML = '';
    const el = document.createElement('i');
    el.setAttribute('data-lucide', name);
    ref.current.appendChild(el);
    lucide.createIcons({ elements: [el] });
    const svg = ref.current.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      svg.setAttribute('stroke', color);
      svg.setAttribute('stroke-width', strokeWidth);
      svg.style.display = 'block';
      svg.style.flexShrink = '0';
    }
  }, [name, size, color, strokeWidth]);
  return <span ref={ref} style={{ display: 'inline-flex', alignItems: 'center', ...style }} />;
}

// ── Motion tokens ────────────────────────────────────────────────────────────
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_DRAWER = 'cubic-bezier(0.32, 0.72, 0, 1)';
const EASE_BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const PREFERS_REDUCED_MOTION = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MODAL_CLOSE_DUR = 150;
const SHEET_CLOSE_DUR = 220;

// ── Settings list — shared card + row for every settings screen ─────────────
// One canonical row shape (icon box, label, subtitle/value, chevron) so
// settings screens don't each hand-roll their own version with slightly
// different padding, icon size, or hover behavior. Reach for these before
// writing a new row — see CLAUDE.md "Shared components" for the full rule.
const CardContext = React.createContext('var(--space-200)');

function Card({ children, size = 'md', style }) {
  const spacing = { sm: 'var(--space-150)', md: 'var(--space-200)', lg: 'var(--space-300)' }[size] || 'var(--space-200)';
  return (
    <CardContext.Provider value={spacing}>
      <div style={{ border: `1px solid ${P.border}`, borderRadius: 'var(--radius-125)', background: P.white, overflow: 'hidden', ...style }}>
        {children}
      </div>
    </CardContext.Provider>
  );
}

function CardHeader({ title, description, divider, children }) {
  const sp = React.useContext(CardContext);
  return (
    <div style={{ padding: sp, borderBottom: divider ? `1px solid ${P.border}` : 'none', display: 'flex', flexDirection: 'column', gap: description ? 'var(--space-050)' : 0 }}>
      {title && <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{title}</div>}
      {description && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>{description}</div>}
      {children}
    </div>
  );
}

function CardContent({ children, style }) {
  const sp = React.useContext(CardContext);
  return <div style={{ padding: sp, ...style }}>{children}</div>;
}

function CardFooter({ children, divider }) {
  const sp = React.useContext(CardContext);
  return (
    <div style={{ padding: sp, borderTop: divider ? `1px solid ${P.border}` : 'none' }}>
      {children}
    </div>
  );
}

function SettingsCard({ children, info }) {
  return (
    <div style={{ border: `1px solid ${P.border}`, borderRadius: 16, overflow: 'clip', background: P.white }}>
      {children}
      {info && (
        <div style={{ borderTop: `1px solid ${P.border}`, padding: 'var(--space-150) var(--space-200)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-100)' }}>
          <Icon name="info" size={13} color={P.inkSoft} strokeWidth={2} style={{ flexShrink: 0, marginTop: 'var(--space-025)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>{info}</span>
        </div>
      )}
    </div>
  );
}

function SettingsRow({ onClick, icon, iconBadgeColor, dimmed, leading, label, labelColor, subtitle, value, valueColor, trailing, last }) {
  const [hovered, setHovered] = useState(false);
  const hasLeading = leading || icon;
  return (
    <div onClick={onClick}
      onMouseEnter={() => onClick && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: hasLeading ? 16 : 0, padding: 'var(--space-200)', borderBottom: last ? 'none' : `1px solid ${P.border}`, cursor: onClick ? 'pointer' : 'default', background: hovered ? P.bgSubtle : 'transparent', transition: PREFERS_REDUCED_MOTION ? 'none' : `background 150ms ${EASE_OUT}` }}>
      {leading}
      {!leading && icon && (
        <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0, opacity: dimmed ? 0.4 : 1 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: P.bg, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={17} color="#3d4047" strokeWidth={1.5} />
          </div>
          {iconBadgeColor && <div style={{ position: 'absolute', top: -3, right: -3, width: 9, height: 9, borderRadius: '50%', background: iconBadgeColor, boxShadow: '0 0 0 1.5px #fff' }} />}
        </div>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: labelColor || (dimmed ? P.inkSoft : P.ink) }}>{label}</span>
        {subtitle && <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginTop: 'var(--space-025)' }}>{subtitle}</span>}
      </span>
      {value != null && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: valueColor || P.inkSoft, marginRight: 'var(--space-075)', whiteSpace: 'nowrap' }}>{value}</span>}
      {trailing !== undefined ? trailing : <Icon name="chevron-right" size={16} color="#3d4047" strokeWidth={1.75} style={{ flexShrink: 0 }} />}
    </div>
  );
}

// Drives a modal's mount-in / close-out transition. Returns `visible` (drive
// opacity/transform from this) and `close` (call instead of the raw onClose —
// it animates out, then fires the real onClose after MODAL_CLOSE_DUR).
function useModalTransition(onClose, closeDur = MODAL_CLOSE_DUR) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, closeDur);
  }, [onClose, closeDur]);
  return { visible: mounted && !closing, close, closing };
}
function modalBackdropStyle(visible) {
  return { opacity: visible ? 1 : 0, transition: `opacity ${MODAL_CLOSE_DUR}ms ${EASE_OUT}` };
}

// Drives a popover/dropdown/menu's grow-in / shrink-out transition from a
// plain `open` boolean. Keeps the panel mounted for `duration` after `open`
// flips false so the shrink-out can play instead of an instant unmount.
function usePopoverTransition(open, duration = 150) {
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (open) {
      setRendered(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = setTimeout(() => setRendered(false), duration);
    return () => clearTimeout(t);
  }, [open, duration]);
  return { rendered, visible };
}
function popoverStyle(visible, origin = 'top') {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'scale(1)' : 'scale(0.97)',
    transformOrigin: origin,
    transition: `opacity 150ms ${EASE_OUT}, transform 150ms ${EASE_OUT}`,
  };
}

// Measures the active item in a tab/segmented-control strip and returns a ref
// to attach to the container plus a left/width rect to position a sliding
// indicator behind/under the items. First measurement is applied with no
// transition (so it doesn't animate in from 0,0); subsequent moves animate.
function useSlidingIndicator(activeKey) {
  const containerRef = useRef(null);
  const [rect, setRect] = useState(null);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const el = container.querySelector(`[data-key="${CSS.escape(String(activeKey))}"]`);
    if (el) setRect({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeKey]);
  useEffect(() => {
    if (rect && !animate) {
      const id = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(id);
    }
  }, [rect, animate]);
  return [containerRef, rect || { left: 0, width: 0 }, animate];
}
function modalPanelStyle(visible) {
  return {
    transform: visible ? 'scale(1)' : 'scale(0.96)',
    opacity: visible ? 1 : 0,
    transition: `transform 200ms ${EASE_OUT}, opacity 200ms ${EASE_OUT}`,
  };
}
function sheetPanelStyle(visible, closing) {
  const transDur = closing ? SHEET_CLOSE_DUR : 340;
  const opacDur  = closing ? SHEET_CLOSE_DUR : 180;
  return {
    transform: visible ? 'translateX(0)' : 'translateX(100%)',
    opacity:   visible ? 1 : 0,
    transition: `transform ${transDur}ms ${EASE_DRAWER}, opacity ${opacDur}ms ${EASE_OUT}`,
  };
}

// ── Icon button — the circular icon-only button used for modal/drawer close,
// back navigation, and similar chrome actions. One size/opacity spec so
// close buttons stop drifting between 28px and 30px screen to screen.
function IconButton({ icon, onClick, size = 30, iconSize = 14, color = P.ink, blur, danger, style }) {
  const [hovered, setHovered] = useState(false);
  const isDangerHover = danger && hovered;
  return (
    <button onClick={onClick}
      onMouseEnter={() => danger && setHovered(true)}
      onMouseLeave={() => danger && setHovered(false)}
      style={{
        border: 'none', cursor: 'pointer', width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isDangerHover ? P.dangerBg : 'rgba(60,60,67,0.1)',
        transition: danger ? 'background 120ms' : undefined,
        ...(blur ? { backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' } : {}),
        ...style,
      }}>
      <Icon name={icon} size={iconSize} color={isDangerHover ? P.danger : color} strokeWidth={2.5} />
    </button>
  );
}

// ── Button — the four sanctioned button treatments. Reach for this instead of
// a raw <button style={{...}}> — see CLAUDE.md "Shared components".
const BUTTON_VARIANTS = {
  primary:   { background: P.action, hover: 'var(--bg-primary-hover)', color: '#fff', border: 'none' },
  secondary: { background: 'transparent', hover: P.bg, color: P.ink, border: `1px solid ${P.border}` },
  danger:    { background: 'transparent', hover: P.dangerBg, color: P.danger, border: 'none' },
  text:      { background: 'transparent', hover: P.bg, color: P.ink, border: 'none' },
};
function Button({ variant = 'secondary', onClick, children, icon, iconSize = 14, disabled, type = 'button', style }) {
  const v = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.secondary;
  const flush = variant === 'text' || variant === 'danger';
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-100)',
        padding: flush ? 0 : '9px 18px',
        borderRadius: 8,
        border: v.border, background: hovered ? v.hover : v.background, color: v.color,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)',
        transform: (!PREFERS_REDUCED_MOTION && pressed) ? 'scale(0.97)' : 'scale(1)',
        transition: PREFERS_REDUCED_MOTION ? 'none' : `background 120ms ${EASE_OUT}, transform 150ms ${EASE_OUT}`,
        ...style,
      }}>
      {icon && <Icon name={icon} size={iconSize} color={v.color} strokeWidth={2.5} />}
      {children}
    </button>
  );
}

// ── ChoiceCard — a bordered, individually-selectable option card for radio/checkbox
// lists where each option has a label AND a description (e.g. "Reimbursement cycle",
// admin access areas). Selected state fills the card with P.bg and darkens the border,
// with a filled indicator on the right. For plain toggle rows with no description
// (a lone checkbox, a two-way switch), keep the existing lighter inline pattern instead.
function ChoiceCard({ type = 'radio', selected, onClick, label, description }) {
  const indicatorShape = type === 'radio'
    ? { borderRadius: '50%' }
    : { borderRadius: 5 };
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-200)',
      padding: 'var(--space-200) var(--space-200)', borderRadius: 10, cursor: 'pointer',
      border: `1px solid ${selected ? P.ink : P.border}`,
      background: selected ? P.bg : P.white,
      transition: `background 120ms ${EASE_OUT}, border-color 120ms ${EASE_OUT}`,
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 500, color: P.ink }}>{label}</div>
        {description && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginTop: 'var(--space-025)' }}>{description}</div>}
      </div>
      <div style={{
        width: 18, height: 18, ...indicatorShape, flexShrink: 0,
        border: `2px solid ${selected ? P.ink : P.border}`,
        background: selected ? P.ink : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: `border-color 120ms ${EASE_OUT}, background 120ms ${EASE_OUT}`,
      }}>
        {selected && (type === 'radio'
          ? <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
          : <Icon name="check" size={11} color="#fff" strokeWidth={3} />
        )}
      </div>
    </div>
  );
}

// ── Modal shell — the centered-modal wrapper shared by every small dialog
// (pick a value, confirm a delete, edit a category, ...). Owns the backdrop,
// panel, and optional title/close header; body/footer are supplied as
// children/footer, either a plain node or a function receiving `close` (for
// buttons that need to save-then-close). See CLAUDE.md "Shared components".
function ModalShell({ onClose, title, width = 420, maxHeight, zIndex = 300, footer, children }) {
  const { visible, close } = useModalTransition(onClose);
  return (
    <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex, background: 'rgba(15,13,40,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...modalBackdropStyle(visible) }}>
      <div onClick={e => e.stopPropagation()} style={{ background: P.white, borderRadius: 14, width, maxHeight, boxShadow: '0 8px 40px rgba(15,13,40,0.2)', display: 'flex', flexDirection: 'column', ...modalPanelStyle(visible) }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-250) var(--space-300)', borderBottom: `1px solid ${P.border}` }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink }}>{title}</span>
            <IconButton icon="X" onClick={close} blur />
          </div>
        )}
        {typeof children === 'function' ? children(close) : children}
        {footer && (typeof footer === 'function' ? footer(close) : footer)}
      </div>
    </div>
  );
}

// ── Drawer shell — the right-side-drawer wrapper shared by every detail/edit
// drawer. Owns the backdrop, panel, and pinned header (title, optional back
// button for two-step flows, close button); body is supplied as children,
// either a plain node or a function receiving `close`. See CLAUDE.md.
function DrawerShell({ onClose, title, onBack, width = 480, children }) {
  const { visible, close, closing } = useModalTransition(onClose, SHEET_CLOSE_DUR);
  return (
    <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,13,40,0.25)', ...modalBackdropStyle(visible) }}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 16, bottom: 16, right: 16, width, background: P.white, borderRadius: 20, boxShadow: '0 24px 64px rgba(15,13,40,0.22), 0 0 0 1px rgba(15,13,40,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden', ...sheetPanelStyle(visible, closing) }}>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-250) var(--space-300)', borderBottom: `1px solid ${P.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
            {onBack && <IconButton icon="arrow-left" onClick={onBack} />}
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink }}>{title}</span>
          </div>
          <IconButton icon="X" onClick={close} blur />
        </div>
        {typeof children === 'function' ? children(close) : children}
      </div>
    </div>
  );
}

// ── Shared toggle switch ─────────────────────────────────────────────────────
function Switch({ checked, onChange, size = 'md', disabled = false }) {
  const dims = size === 'sm' ? { w: 28, h: 16, knob: 12, pad: 2 } : { w: 34, h: 20, knob: 16, pad: 2 };
  return (
    <div onClick={disabled ? undefined : onChange} style={{
      width: dims.w, height: dims.h, borderRadius: dims.h / 2, flexShrink: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
      background: checked ? P.action : P.borderStrong,
      opacity: disabled ? 0.45 : 1,
      position: 'relative', transition: `background 150ms ${EASE_OUT}, opacity 150ms ${EASE_OUT}`,
    }}>
      <div style={{
        position: 'absolute', top: dims.pad,
        left: checked ? dims.w - dims.knob - dims.pad : dims.pad,
        width: dims.knob, height: dims.knob, borderRadius: dims.knob / 2,
        background: '#fff', transition: `left 200ms ${EASE_BOUNCE}`,
      }} />
    </div>
  );
}

// ── Shared empty state ───────────────────────────────────────────────────────
function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ padding: 'var(--space-500) var(--space-300)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: P.bg, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-200)' }}>
        <Icon name={icon} size={20} color={P.inkSoft} strokeWidth={1.5} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, marginBottom: 'var(--space-050)' }}>{title}</div>
      {description && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, maxWidth: 280, lineHeight: 1.5, marginBottom: action ? 18 : 0 }}>{description}</div>}
      {action}
    </div>
  );
}

function WeekCard({ entry, requestId, requests, isPending }) {
  const req = requests.find(function(rr) { return rr.id === requestId; });
  return (
    <React.Fragment>
      <span style={{ display: 'block', width: '100%', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-xs)', color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
        {entry.type}
      </span>
      <span style={{ display: 'block', width: '100%', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3 }}>
        {isPending ? 'Pending' : req ? (req.days + ' ' + (req.days === 1 ? 'day' : 'days')) : ''}
      </span>
    </React.Fragment>
  );
}

// ── Belgian calendar constants (ported from employee app) ──────────────────
const BELGIAN_HOLIDAYS_2026 = [
  '2026-01-01','2026-04-06','2026-05-01','2026-05-14',
  '2026-05-25','2026-07-21','2026-08-15','2026-11-01',
  '2026-11-11','2026-12-25',
];
const _holidaySet = new Set(BELGIAN_HOLIDAYS_2026);
const BELGIAN_HOLIDAY_NAMES = {
  '2026-01-01': "New Year's Day",      '2026-04-06': 'Easter Monday',
  '2026-05-01': 'Labour Day',          '2026-05-14': 'Ascension Day',
  '2026-05-25': 'Whit Monday',         '2026-07-21': 'Belgian National Day',
  '2026-08-15': 'Assumption of Mary',  '2026-11-01': "All Saints' Day",
  '2026-11-11': 'Armistice Day',       '2026-12-25': 'Christmas Day',
};
const COLLECTIVE_HOLIDAYS = [];
const _collectiveSet = new Set(COLLECTIVE_HOLIDAYS);
const HOLIDAY_ICON = {
  "New Year's Day":    { emoji: '🎆' },
  'Easter Monday':     { emoji: '🐣' },
  'Labour Day':        { lucide: 'Hammer' },
  'Ascension Day':     { lucide: 'Church' },
  'Whit Monday':       { lucide: 'Church' },
  'Belgian National Day': { emoji: '🇧🇪' },
  'Assumption of Mary':   { lucide: 'Church' },
  "All Saints' Day":   { emoji: '🕯️' },
  'Armistice Day':     { lucide: 'Shield' },
  'Christmas Day':     { emoji: '🎄' },
};

// ── Entity data ───────────────────────────────────────────────────────────
const ENTITIES = [
  { id: 'lumio-group',  name: 'Lumio Group',       jc: 'PC 200', payrollProvider: 'SD Worx', integrationId: 'SDWX-4821',  country: 'Belgium',     employeeCount: 15 },
  { id: 'lumio-france', name: 'Lumio France',      jc: 'CCN 66', payrollProvider: 'ADP',     integrationId: 'ADP-FR-1192', country: 'France',      employeeCount: 4,  emailDomain: 'lumio.fr' },
  { id: 'lumio-nl',     name: 'Lumio Netherlands', jc: null,     payrollProvider: 'Visma',   integrationId: null,          country: 'Netherlands', employeeCount: 4,  emailDomain: 'lumio.nl' },
];

// ── Employee data ──────────────────────────────────────────────────────────
const DEPARTMENTS = ['Design','Engineering','Marketing'];
const AVATAR_COLORS = ['#bfdbfe','#ddd6fe',P.warningBorder,'#a7f3d0','#fecdd3','#fed7aa','#c7d2fe',P.dangerBorder,'#d9f99d','#99f6e4'];

const EMPLOYEES = {
  // Admin-only (not an employee — contractor)
  'bruno-coen':        { name: 'Bruno Coen',          initials: 'BC', color: '#c7d2fe', email: 'bruno@payflip.be', isEmployee: false, adminAccess: 'full' },
  // Design → Lumio Group (BE)
  'bram-goossens':     { name: 'Bram Goossens',     initials: 'BG', color: '#bfdbfe', entitlement: 23, department: 'Design',       email: 'bram.goossens@lumiogroup.be',     entity: 'Lumio Group', entityId: 'lumio-group', budget: 3750,  budgetUsed: 3605, role: 'Employee', status: 'Active', gender: 'm' },
  'emma-martens':      { name: 'Emma Martens',       initials: 'EM', color: '#ddd6fe', entitlement: 29, department: 'Design',       email: 'emma.martens@lumiogroup.be',      entity: 'Lumio Group', entityId: 'lumio-group', budget: 0,     role: 'Employee', status: 'Active', gender: 'f', photo: true },
  'mathias-de-smedt':  { name: 'Mathias De Smedt',  initials: 'MD', color: P.warningBorder, entitlement: 23, department: 'Design',       email: 'mathias.de-smedt@lumiogroup.be', entity: 'Lumio Group', entityId: 'lumio-group', budget: 6250,  budgetUsed: 6170, role: 'Employee', status: 'Active', gender: 'm' },
  'thomas-vandenberghe': { name: 'Thomas Vandenberghe', initials: 'TV', color: '#99f6e4', entitlement: 20, department: 'Design',    email: 'thomas.vandenberghe@lumiogroup.be', entity: 'Lumio Group', entityId: 'lumio-group', budget: 0, role: 'Employee', status: 'Active', gender: 'm' },
  'thomas-janssens':     { name: 'Thomas Janssens',    initials: 'TJ', color: '#d9f99d', entitlement: 23, department: 'Design',    email: 'thomas.janssens@lumiogroup.be', entity: 'Lumio Group', entityId: 'lumio-group', budget: 3000, budgetUsed: 3000, role: 'Employee', status: 'Active', gender: 'm' },
  'charlotte-pieters':   { name: 'Charlotte Pieters',  initials: 'CP', color: '#fecdd3', entitlement: 20, department: 'Design',    email: 'charlotte.pieters@lumiogroup.be', entity: 'Lumio Group', entityId: 'lumio-group', budget: 2500, budgetUsed: 2500, role: 'Employee', status: 'Active', gender: 'f', fte: 0.8, workSchedule: [1,2,3,4] },
  'lasse-willems':       { name: 'Lasse Willems',      initials: 'LW', color: '#c7d2fe', entitlement: 23, department: 'Design',    email: 'lasse.willems@lumiogroup.be',   entity: 'Lumio Group', entityId: 'lumio-group', budget: 4000, budgetUsed: 4000, role: 'Employee', status: 'Active', gender: 'm', niss: '85.04.12-234.56', mealVoucherCycles: { count: 3, summary: 'Jun–Aug 2026' } },
  'nathalie-cox':        { name: 'Nathalie Cox',        initials: 'NC', color: '#a7f3d0', entitlement: 20, department: 'Design',    email: 'nathalie.cox@lumiogroup.be',    entity: 'Lumio Group', entityId: 'lumio-group', budget: 3200, budgetUsed: 3200, role: 'Employee', status: 'Active', gender: 'f' },
  'ruben-declercq':      { name: 'Ruben Declercq',     initials: 'RD', color: '#fed7aa', entitlement: 25, department: 'Design',    email: 'ruben.declercq@lumiogroup.be',  entity: 'Lumio Group', entityId: 'lumio-group', budget: 5500, budgetUsed: 5500, role: 'Employee', status: 'Active', gender: 'm' },
  'ines-baert':          { name: 'Inès Baert',          initials: 'IB', color: '#ddd6fe', entitlement: 20, department: 'Design',    email: 'ines.baert@lumiogroup.be',      entity: 'Lumio Group', entityId: 'lumio-group', budget: 2800, budgetUsed: 2800, role: 'Employee', status: 'Active', gender: 'f' },
  'joachim-nijs':        { name: 'Joachim Nijs',        initials: 'JN', color: P.warningBorder, entitlement: 23, department: 'Design',    email: 'joachim.nijs@lumiogroup.be',    entity: 'Lumio Group', entityId: 'lumio-group', budget: 4800, budgetUsed: 4800, role: 'Employee', status: 'Active', gender: 'm' },
  'sara-verbeke':        { name: 'Sara Verbeke',        initials: 'SV', color: '#bfdbfe', entitlement: 20, department: 'Design',    email: 'sara.verbeke@lumiogroup.be',    entity: 'Lumio Group', entityId: 'lumio-group', budget: 3100, budgetUsed: 3100, role: 'Employee', status: 'Active', gender: 'f' },
  'wout-desmet':         { name: 'Wout Desmet',         initials: 'WD', color: '#99f6e4', entitlement: 22, department: 'Design',    email: 'wout.desmet@lumiogroup.be',     entity: 'Lumio Group', entityId: 'lumio-group', budget: 4200, budgetUsed: 4200, role: 'Employee', status: 'Active', gender: 'm' },
  'amber-claes':         { name: 'Amber Claes',         initials: 'AC', color: P.dangerBorder, entitlement: 20, department: 'Design',    email: 'amber.claes@lumiogroup.be',     entity: 'Lumio Group', entityId: 'lumio-group', budget: 2900, budgetUsed: 2900, role: 'Employee', status: 'Active', gender: 'f' },
  'pieter-verheyen':     { name: 'Pieter Verheyen',     initials: 'PV', color: '#d9f99d', entitlement: 25, department: 'Design',    email: 'pieter.verheyen@lumiogroup.be', entity: 'Lumio Group', entityId: 'lumio-group', budget: 6000, budgetUsed: 6000, role: 'Admin',  status: 'Active', gender: 'm' },
  // Engineering → Lumio France
  'david':             { name: 'David Laurent',      initials: 'DL', color: '#fecdd3', entitlement: 20, department: 'Engineering', email: 'david.laurent@lumio.fr',          entity: 'Lumio France', entityId: 'lumio-france', budget: 4500,  budgetUsed: 4500, role: 'Employee', status: 'Active', gender: 'm', photo: true },
  'stijn-laurent':     { name: 'Stijn Laurent',      initials: 'SL', color: '#a7f3d0', entitlement: 29, department: 'Engineering', email: 'stijn.laurent@lumio.fr',          entity: 'Lumio France', entityId: 'lumio-france', budget: 1500,  budgetUsed: 1500, role: 'Employee', status: 'Active', gender: 'm' },
  'jana-goossens':     { name: 'Jana Goossens',      initials: 'JG', color: '#c7d2fe', entitlement: 20, department: 'Engineering', email: 'jana.goossens@lumio.fr',          entity: 'Lumio France', entityId: 'lumio-france', budget: 2000,  budgetUsed: 2000, role: 'Employee', status: 'Active', gender: 'f' },
  'laura-mertens':     { name: 'Laura Mertens',      initials: 'LM', color: P.dangerBorder, entitlement: 20, department: 'Engineering', email: 'laura.mertens@lumio.fr',          entity: 'Lumio France', entityId: 'lumio-france', budget: 750,   budgetUsed: 750,  role: 'Employee', status: 'Active', gender: 'f' },
  // Marketing → Lumio Netherlands
  'pieter-mertens':    { name: 'Pieter Mertens',     initials: 'PM', color: '#a7f3d0', entitlement: 29, department: 'Marketing',   email: 'pieter.mertens@lumio.nl',         entity: 'Lumio Netherlands', entityId: 'lumio-nl', budget: 8500,  budgetUsed: 8500, role: 'Admin',  status: 'Active', gender: 'm' },
  'sarah-de-smedt':    { name: 'Sarah De Smedt',     initials: 'SD', color: '#fecdd3', entitlement: 23, department: 'Marketing',   email: 'sarah.de-smedt@lumio.nl',         entity: 'Lumio Netherlands', entityId: 'lumio-nl', budget: 2750,  budgetUsed: 2750, role: 'Employee', status: 'Active', gender: 'f' },
  'julie-goossens':    { name: 'Julie Goossens',     initials: 'JG', color: '#fed7aa', entitlement: 20, department: 'Marketing',   email: 'julie.goossens@lumio.nl',         entity: 'Lumio Netherlands', entityId: 'lumio-nl', budget: 5000,  budgetUsed: 5000, role: 'Admin',  status: 'Active', gender: 'f' },
  'noor-de-smedt':     { name: 'Noor De Smedt',      initials: 'ND', color: P.warningBorder, entitlement: 20, department: 'Marketing',   email: 'noor.de-smedt@lumio.nl',          entity: 'Lumio Netherlands', entityId: 'lumio-nl', budget: 0,     role: 'Employee', status: 'Active', gender: 'f', fte: 0.8, workSchedule: [1,2,4,5] },
};
const CURRENT_USER = EMPLOYEES['bruno-coen'];

// ── Per-employee card data (prototype seed) ───────────────────────────────
// status: 'not_invited' | 'invited' | 'app_downloaded' | 'card_requested' | 'active' | 'frozen'
const CARD_SEED = {
  'bram-goossens':     { status: 'active',         pan: '8231', cardType: 'virtual',  invitedDate: '12/05/2026', lastTx: '2 days ago',  lastTxAmount: 24.50,
    txs: [{ merchant: 'NMBS — Brussels–Antwerp', amount: 24.50, date: '09/08/2026', icon: 'train' }, { merchant: 'Velo Antwerp', amount: 3.50, date: '06/08/2026', icon: 'bike' }, { merchant: 'De Lijn — Monthly pass', amount: 36.00, date: '01/08/2026', icon: 'bus' }] },
  'mathias-de-smedt':  { status: 'frozen',          pan: '4417', cardType: 'virtual',  invitedDate: '12/05/2026', lastTx: '14 days ago', lastTxAmount: 38.00,
    txs: [{ merchant: 'SNCB — Ghent–Brussels', amount: 38.00, date: '28/07/2026', icon: 'train' }, { merchant: 'Blue-bike', amount: 4.00, date: '25/07/2026', icon: 'bike' }, { merchant: 'Parking Interparking', amount: 12.00, date: '22/07/2026', icon: 'car' }] },
  'thomas-janssens':   { status: 'active',         pan: '9902', cardType: 'physical', invitedDate: '12/05/2026', lastTx: 'yesterday',   lastTxAmount: 12.80,
    txs: [{ merchant: 'Tec — Day ticket', amount: 12.80, date: '10/08/2026', icon: 'bus' }, { merchant: 'NMBS — Namur–Brussels', amount: 19.40, date: '08/08/2026', icon: 'train' }, { merchant: 'Villo! Brussels', amount: 3.00, date: '07/08/2026', icon: 'bike' }] },
  'charlotte-pieters': { status: 'active',         pan: '6654', cardType: 'virtual',  invitedDate: '12/05/2026', lastTx: '5 days ago',  lastTxAmount: 55.20,
    txs: [{ merchant: 'NMBS — Bruges–Ghent', amount: 55.20, date: '06/08/2026', icon: 'train' }, { merchant: 'De Lijn — Day pass', amount: 8.00, date: '04/08/2026', icon: 'bus' }, { merchant: 'Blue-bike', amount: 4.00, date: '01/08/2026', icon: 'bike' }] },
  'lasse-willems':     { status: 'active',         pan: '3378', cardType: 'virtual',  invitedDate: '12/05/2026', lastTx: '1 week ago',  lastTxAmount: 18.00,
    txs: [{ merchant: 'STib — Weekly pass', amount: 18.00, date: '04/08/2026', icon: 'bus' }, { merchant: 'Villo! Brussels', amount: 3.00, date: '02/08/2026', icon: 'bike' }, { merchant: 'NMBS — Brussels–Leuven', amount: 14.60, date: '30/07/2026', icon: 'train' }] },
  // nathalie-cox: not yet invited (demo: invite-more flow)
  'ruben-declercq':    { status: 'active',         pan: '2290', cardType: 'virtual',  invitedDate: '12/05/2026', lastTx: '4 days ago',  lastTxAmount: 31.60,
    txs: [{ merchant: 'NMBS — Mechelen–Antwerp', amount: 31.60, date: '07/08/2026', icon: 'train' }, { merchant: 'Velo Antwerp', amount: 3.50, date: '05/08/2026', icon: 'bike' }, { merchant: 'De Lijn — Monthly pass', amount: 36.00, date: '01/08/2026', icon: 'bus' }] },
  'ines-baert':        { status: 'active',         pan: '5563', cardType: 'virtual',  invitedDate: '12/05/2026', lastTx: '6 days ago',  lastTxAmount: 22.40,
    txs: [{ merchant: 'De Lijn — Day pass', amount: 22.40, date: '05/08/2026', icon: 'bus' }, { merchant: 'Blue-bike', amount: 4.00, date: '03/08/2026', icon: 'bike' }, { merchant: 'NMBS — Hasselt–Brussels', amount: 28.80, date: '01/08/2026', icon: 'train' }] },
  'joachim-nijs':      { status: 'active',         pan: '1184', cardType: 'virtual',  invitedDate: '12/05/2026', lastTx: '2 days ago',  lastTxAmount: 67.90,
    txs: [{ merchant: 'NMBS — Liège–Brussels', amount: 67.90, date: '09/08/2026', icon: 'train' }, { merchant: 'Tec — Monthly pass', amount: 49.00, date: '01/08/2026', icon: 'bus' }, { merchant: 'Parking Interparking', amount: 9.00, date: '29/07/2026', icon: 'car' }] },
  'sara-verbeke':      { status: 'active',         pan: '8847', cardType: 'virtual',  invitedDate: '12/05/2026', lastTx: '1 day ago',   lastTxAmount: 15.30,
    txs: [{ merchant: 'STib — Day ticket', amount: 15.30, date: '10/08/2026', icon: 'bus' }, { merchant: 'Villo! Brussels', amount: 3.00, date: '09/08/2026', icon: 'bike' }, { merchant: 'NMBS — Brussels–Namur', amount: 22.50, date: '07/08/2026', icon: 'train' }] },
  'wout-desmet':       { status: 'active',         pan: '3321', cardType: 'virtual',  invitedDate: '12/05/2026', lastTx: '3 days ago',  lastTxAmount: 48.75,
    txs: [{ merchant: 'NMBS — Kortrijk–Brussels', amount: 48.75, date: '08/08/2026', icon: 'train' }, { merchant: 'Blue-bike', amount: 4.00, date: '07/08/2026', icon: 'bike' }, { merchant: 'De Lijn — Day pass', amount: 8.00, date: '05/08/2026', icon: 'bus' }] },
  // amber-claes: not yet invited (demo: invite-more flow)
  // pieter-verheyen: not yet invited (demo: invite-more flow)
  'david':             { status: 'active',         pan: '4456', cardType: 'virtual',  invitedDate: '12/05/2026', lastTx: '2 days ago',  lastTxAmount: 19.20,
    txs: [{ merchant: 'TGV — Paris–Brussels', amount: 19.20, date: '09/08/2026', icon: 'train' }, { merchant: 'Vélib Paris', amount: 5.00, date: '08/08/2026', icon: 'bike' }, { merchant: 'RATP — Week pass', amount: 30.00, date: '04/08/2026', icon: 'bus' }] },
  'stijn-laurent':     { status: 'app_downloaded', pan: null,   cardType: null,       invitedDate: '12/05/2026', lastTx: null,          lastTxAmount: null,   txs: [] },
  'jana-goossens':     { status: 'card_requested', pan: null,   cardType: null,       invitedDate: '12/05/2026', lastTx: null,          lastTxAmount: null,   txs: [] },
  'laura-mertens':     { status: 'invited',        pan: null,   cardType: null,       invitedDate: '12/05/2026', lastTx: null,          lastTxAmount: null,   txs: [] },
  'pieter-mertens':    { status: 'active',         pan: '7712', cardType: 'virtual',  invitedDate: '12/05/2026', lastTx: 'today',       lastTxAmount: 88.00,
    txs: [{ merchant: 'Eurostar — Brussels–London', amount: 88.00, date: '11/08/2026', icon: 'train' }, { merchant: 'TfL — Oyster top-up', amount: 20.00, date: '11/08/2026', icon: 'bus' }, { merchant: 'NMBS — Antwerp–Brussels', amount: 24.50, date: '08/08/2026', icon: 'train' }] },
  'sarah-de-smedt':    { status: 'active',         pan: '3390', cardType: 'virtual',  invitedDate: '12/05/2026', lastTx: '4 days ago',  lastTxAmount: 29.40,
    txs: [{ merchant: 'NMBS — Groningen–Brussels', amount: 29.40, date: '07/08/2026', icon: 'train' }, { merchant: 'OV-chipkaart top-up', amount: 20.00, date: '05/08/2026', icon: 'bus' }, { merchant: 'Blue-bike', amount: 4.00, date: '04/08/2026', icon: 'bike' }] },
  'julie-goossens':    { status: 'active',         pan: '6621', cardType: 'virtual',  invitedDate: '12/05/2026', lastTx: '2 days ago',  lastTxAmount: 53.60,
    txs: [{ merchant: 'NS — Utrecht–Amsterdam', amount: 53.60, date: '09/08/2026', icon: 'train' }, { merchant: 'OV-Fiets rental', amount: 3.85, date: '09/08/2026', icon: 'bike' }, { merchant: 'GVB Amsterdam — Day pass', amount: 9.00, date: '08/08/2026', icon: 'bus' }] },
};

// ── Per-employee supplemental data ────────────────────────────────────────
const EMP_EXTRA = {
  'bram-goossens':       { payrollId: '000041', hireDate: '15/03/2023', lang: 'Dutch',   inssNumber: '90.06.23-145.82' },
  'emma-martens':        { payrollId: '000040', hireDate: '12/05/2025', lang: 'English', inssNumber: '95.11.14-218.37' },
  'mathias-de-smedt':    { payrollId: '000032', hireDate: '01/09/2022', lang: 'Dutch',   inssNumber: '88.03.07-074.16' },
  'thomas-vandenberghe': { payrollId: '000028', hireDate: '04/02/2022', lang: 'Dutch',   inssNumber: '92.07.19-361.54' },
  'thomas-janssens':     { payrollId: '000044', hireDate: '10/01/2023', lang: 'Dutch',   inssNumber: '91.02.28-509.63' },
  'david':               { payrollId: '000015', hireDate: '07/11/2020', lang: 'French',  inssNumber: '87.09.12-633.29' },
  'stijn-laurent':       { payrollId: '000019', hireDate: '14/04/2021', lang: 'Dutch',   inssNumber: '89.04.30-812.47' },
  'jana-goossens':       { payrollId: '000033', hireDate: '02/11/2022', lang: 'Dutch',   inssNumber: '93.08.05-127.91' },
  'laura-mertens':       { payrollId: '000038', hireDate: '07/03/2024', lang: 'Dutch',   inssNumber: '96.05.22-445.68' },
  'pieter-mertens':      { payrollId: '000009', hireDate: '01/06/2019', lang: 'Dutch',   inssNumber: '85.01.17-298.53' },
  'sarah-de-smedt':      { payrollId: '000025', hireDate: '16/08/2021', lang: 'French',  inssNumber: '94.12.03-673.14' },
  'julie-goossens':      { payrollId: '000011', hireDate: '03/09/2019', lang: 'Dutch',   inssNumber: '86.10.25-534.76' },
  'noor-de-smedt':       { payrollId: '000043', hireDate: '22/09/2025', lang: 'Dutch',   inssNumber: '97.06.11-189.42' },
  'ruben-declercq':      { inssNumber: '91.08.14-317.59' },
  'ines-baert':          { inssNumber: '93.03.26-482.71' },
  'joachim-nijs':        { inssNumber: '88.11.09-726.38' },
  'sara-verbeke':        { inssNumber: '95.07.17-853.26' },
  'wout-desmet':         { inssNumber: '89.05.04-164.85' },
  'amber-claes':         { inssNumber: '96.02.21-591.47' },
  'pieter-verheyen':     { inssNumber: '87.12.30-243.68' },
};
// ── Work regime helpers ───────────────────────────────────────────────────
const COMPANY_REGIME_DEFAULTS = { contractedHours: 40, emailDomain: 'lumiogroup.be' };
function calcAdvDays(companyRegime, emp) {
  const contracted = companyRegime.contractedHours;
  const fullTimeAdv = Math.max(0, ((contracted - 38) / 2) * 12);
  const fte = emp.fte ?? 1.0;
  return Math.round(fullTimeAdv * fte * 10) / 10;
}
function calcLegalLeave(emp) {
  return Math.round(20 * (emp.fte ?? 1.0));
}

function _eseed(id, s) { let h = 0; const k = id + s; for (let i = 0; i < k.length; i++) h = ((h * 31) + k.charCodeAt(i)) >>> 0; return h; }
function _eur(n) { const [i, d] = (n / 100).toFixed(2).split('.'); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + d + ' EUR'; }
function genSalary(id, regimeHours) {
  const h = _eseed(id, 'sal'), base = 3100 + (h % 2300), p1 = base - 50 - (h >> 4 & 127), p2 = p1 - 40 - (h >> 6 & 95);
  const regime = (regimeHours || 40) + ':00', hd = (EMP_EXTRA[id] || {}).hireDate || '01/01/2022';
  const allC = [
    { type: 'PC', icon: 'Laptop', end: 'N/A' },
    { type: 'Smartphone', icon: 'Smartphone', end: '04/11/2027' },
    { type: 'Tablet', icon: 'Tablet', end: '13/05/2028' },
    { type: 'Internet', icon: 'Wifi', end: 'N/A' },
    { type: 'Company car', icon: 'Car', end: '01/01/2029' },
  ];
  const nC = 1 + (h & 3), off = (h >> 8) % allC.length;
  const comps = allC.slice(off).concat(allC).slice(0, nC).map((c, i) => ({ ...c, start: i === 0 ? hd : '01/01/2026' }));
  return {
    history: [
      { gross: _eur(base * 100), regime, start: '01/05/2026', end: '—', active: true },
      { gross: _eur(p1 * 100), regime, start: '01/01/2026', end: '01/05/2026', active: false },
      { gross: _eur(p2 * 100), regime, start: hd, end: '01/01/2026', active: false },
    ],
    components: comps,
  };
}
function genBudgets(id) {
  const h = _eseed(id, 'bud');
  return [
    { name: 'End of year premium', balance: '+' + _eur(50000 + (h & 0xFF) * 1000), topUp: '+' + _eur(580000 + (h & 0x1FF) * 500), topUpDate: '01/01/2026', cashOut: '17/12/2026' },
    { name: 'Mobility budget', balance: '+' + _eur(12 + (h & 0x3FFF) * 10), topUp: '+' + _eur(900000 + (h >> 4 & 0xFFF) * 100), topUpDate: '22/01/2026', cashOut: '08/01/2027' },
    { name: 'Home office budget', balance: '+0,00 EUR', topUp: '+450,00 EUR', topUpDate: '06/05/2025', cashOut: 'None' },
    { name: 'L&D budget', balance: '+' + _eur(5000 + (h >> 8 & 0x7FF) * 100), topUp: '+' + _eur(10000 + (h >> 12 & 0xFF) * 100), topUpDate: '22/01/2026', cashOut: 'None' },
    { name: 'Remote working budget', balance: '+450,00 EUR', topUp: '+450,00 EUR', topUpDate: '06/05/2025', cashOut: 'None' },
  ];
}
const _CPOOL = [
  { name: 'Smartphone accessories via Coolblue', price: '249,00 EUR', cDate: '24/06/2026', sDate: '24/06/2026', eDate: '24/06/2028' },
  { name: 'L&D expenses (Payflip)', price: '158,60 EUR', cDate: '19/06/2026', sDate: '19/06/2026', eDate: '—', illustration: 'assets/benefit-learn.png' },
  { name: 'Tablet via Coolblue', price: '369,00 EUR', cDate: '13/05/2026', sDate: '13/05/2026', eDate: '13/05/2028', illustration: 'assets/benefit-tablet.png' },
  { name: 'Individual pension savings', price: '939,96 EUR', cDate: '02/03/2026', sDate: '05/03/2026', eDate: '01/01/2027', illustration: 'assets/benefit-pension.png' },
  { name: 'Alan', price: '1 467,60 EUR', cDate: '26/01/2026', sDate: '01/01/2026', eDate: '31/12/2026' },
  { name: 'L&D expenses (Payflip)', price: '21,78 EUR', cDate: '23/01/2026', sDate: '23/01/2026', eDate: '—', illustration: 'assets/benefit-learn.png' },
  { name: 'Mortgage', price: '844,90 EUR', cDate: '01/01/2026', sDate: '01/01/2026', eDate: '31/12/2026' },
  { name: 'Bike lease via Cowboy', price: '89,00 EUR', cDate: '01/04/2026', sDate: '01/04/2026', eDate: '01/04/2028', illustration: 'assets/benefit-bike.png' },
  { name: 'Company car (Tesla Model 3)', price: '620,00 EUR', cDate: '01/01/2026', sDate: '01/01/2026', eDate: '01/01/2029' },
  { name: 'Public transport pass', price: '285,40 EUR', cDate: '01/02/2026', sDate: '01/02/2026', eDate: '—' },
];
function genChoices(id) {
  const h = _eseed(id, 'cho');
  const items = _CPOOL.filter((_, i) => (h >> i) & 1);
  const base = items.length >= 2 ? items : _CPOOL.slice(0, 2 + (h & 3));
  return base.map((c, i) => {
    const s = (h >> (i * 3 + 10)) & 7;
    const status = s === 0 ? 'pending' : s === 1 ? 'declined' : 'approved';
    return { ...c, status };
  });
}
const CHOICES_SEED = (() => {
  const hardcoded = [
    { id: 'tablet-coolblue-approved', empId: 'charlotte-pieters', name: 'Tablet via Coolblue', price: '369,00 EUR', cDate: '13/05/2026', sDate: '13/05/2026', eDate: '13/05/2028', status: 'approved', illustration: 'assets/benefit-tablet.png', productName: 'Apple iPad (2025) 11 Pouces 128 Go Wifi Argent', productUrl: 'https://www.coolblue.be/nl/product/960489', productNumber: '960489', orderId: '97190251', orderDate: '13/05/2026', depreciation: 24, transactions: [{ label: 'Home office budget', amount: '233,73 EUR', date: '13/05/2026' }, { label: 'End of year premium', amount: '180,55 EUR', date: '13/05/2026' }] },
  ];
  const generated = Object.entries(EMPLOYEES).flatMap(([empId]) =>
    genChoices(empId).map((c, i) => ({ ...c, empId, id: `${empId}-cho-${i}` }))
  );
  const all = [...hardcoded, ...generated];
  let pendingCount = 0;
  return all.map(c => {
    if (c.status === 'pending') {
      if (pendingCount < 6) { pendingCount++; return c; }
      return { ...c, status: 'approved' };
    }
    return c;
  });
})();

// ── Employee detail tab components ─────────────────────────────────────────
const CHOICES_STATUS_OPTS = [['all', 'All statuses'], ['approved', 'Approved'], ['pending', 'Pending'], ['declined', 'Declined']];

function ChoicesTab({ empId }) {
  const items = genChoices(empId);
  const [statusFilter, setStatusFilter] = useState('all');
  const filtered = statusFilter === 'all' ? items : items.filter(i => i.status?.toLowerCase() === statusFilter);
  const th = { textAlign: 'left', padding: 'var(--space-100) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' };
  const td = { padding: 'var(--space-200) var(--space-200)', color: P.ink, verticalAlign: 'middle' };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-200)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink }}>Choices</span>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-075)', padding: 'var(--space-075) var(--space-200)', borderRadius: 8, border: 'none', background: P.action, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)' }}>
          <Icon name="Plus" size={12} color="#fff" />Add
        </button>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-100)', marginBottom: 'var(--space-125)' }}>
        <FilterDropdown label="All statuses" active={statusFilter} opts={CHOICES_STATUS_OPTS} onSelect={setStatusFilter} minWidth={150} />
      </div>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <EmptyState icon="list" title="No choices recorded yet" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)' }}>
            <thead><tr style={{ borderBottom: `1px solid ${P.border}` }}>
              <th style={{ ...th, paddingLeft: 'var(--space-250)' }}>Name</th>
              <th style={th}>Price</th>
              <th style={th}>Choice date</th>
              <th style={th}>Start date</th>
              <th style={th}>End date</th>
              <th style={th}>Status</th>
              <th style={th}></th>
            </tr></thead>
            <tbody>{filtered.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: idx < filtered.length - 1 ? `1px solid ${P.border}` : 'none' }}>
                <td style={{ ...td, paddingLeft: 'var(--space-250)', maxWidth: 220 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div></td>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{item.price}</td>
                <td style={{ ...td, color: P.inkSoft }}>{item.cDate}</td>
                <td style={{ ...td, color: P.inkSoft }}>{item.sDate}</td>
                <td style={{ ...td, color: P.inkSoft }}>{item.eDate}</td>
                <td style={td}><StatusPill status={item.status || 'approved'} /></td>
                <td style={{ padding: 'var(--space-100) var(--space-200)', textAlign: 'right' }}><button style={{ border: `1px solid ${P.border}`, background: 'transparent', borderRadius: 6, padding: 'var(--space-050) var(--space-125)', fontSize: 'var(--fs-body-xs)', fontFamily: 'var(--font-display)', fontWeight: 600, color: P.inkSoft, cursor: 'pointer' }}>Details</button></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
function BudgetsTab({ empId }) {
  const items = genBudgets(empId);
  const th = { textAlign: 'left', padding: 'var(--space-100) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-200)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink }}>Budgets</span>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-075)', padding: 'var(--space-075) var(--space-200)', borderRadius: 8, border: 'none', background: P.action, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)' }}>
          <Icon name="Plus" size={12} color="#fff" />Add budget
        </button>
      </div>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)' }}>
          <thead><tr style={{ borderBottom: `1px solid ${P.border}` }}>
            <th style={{ ...th, paddingLeft: 'var(--space-250)' }}>Name budget</th>
            <th style={th}>Budget balance</th>
            <th style={th}>Last top-up amount</th>
            <th style={th}>Top-up date</th>
            <th style={th}>Cash-out date</th>
            <th style={th}></th>
          </tr></thead>
          <tbody>{items.map((item, idx) => (
            <tr key={idx} style={{ borderBottom: idx < items.length - 1 ? `1px solid ${P.border}` : 'none' }}>
              <td style={{ padding: 'var(--space-200) var(--space-250)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{item.name}</td>
              <td style={{ padding: 'var(--space-200) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{item.balance}</td>
              <td style={{ padding: 'var(--space-200) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{item.topUp}</td>
              <td style={{ padding: 'var(--space-200) var(--space-200)', color: P.inkSoft, fontSize: 'var(--fs-body-sm)' }}>{item.topUpDate}</td>
              <td style={{ padding: 'var(--space-200) var(--space-200)', color: P.inkSoft, fontSize: 'var(--fs-body-sm)' }}>{item.cashOut}</td>
              <td style={{ padding: 'var(--space-100) var(--space-200)', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: 'var(--space-100)', justifyContent: 'flex-end' }}>
                  <button style={{ border: `1px solid ${P.border}`, background: 'transparent', borderRadius: 6, padding: 'var(--space-075) var(--space-125)', fontSize: 'var(--fs-body-xs)', fontFamily: 'var(--font-display)', fontWeight: 600, color: P.inkSoft, cursor: 'pointer', whiteSpace: 'nowrap' }}>See transactions</button>
                  <button style={{ border: 'none', background: P.action, borderRadius: 6, padding: 'var(--space-075) var(--space-150)', fontSize: 'var(--fs-body-xs)', fontFamily: 'var(--font-display)', fontWeight: 600, color: '#fff', cursor: 'pointer' }}>Edit</button>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
function SalaryTab({ empId, emp, companyRegime, onEmployeeUpdate }) {
  const { history, components } = genSalary(empId, companyRegime?.contractedHours);
  const regime = companyRegime || COMPANY_REGIME_DEFAULTS;
  const [localFte, setLocalFte] = React.useState(emp?.fte ?? 1.0);
  const [localSchedule, setLocalSchedule] = React.useState(emp?.workSchedule ?? [1,2,3,4,5]);
  const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri'];
  const advDays = calcAdvDays(regime, { ...emp, fte: localFte });
  const legalLeave = calcLegalLeave({ ...emp, fte: localFte });
  const handleFteChange = (newFte) => {
    setLocalFte(newFte);
    const defaultSchedule = newFte >= 1.0 ? [1,2,3,4,5] : newFte >= 0.9 ? [1,2,3,4,5] : newFte >= 0.8 ? [1,2,3,4] : [1,2,3];
    setLocalSchedule(defaultSchedule);
    if (onEmployeeUpdate) onEmployeeUpdate(empId, { fte: newFte, workSchedule: defaultSchedule });
  };
  const toggleDay = (day) => {
    const next = localSchedule.includes(day) ? localSchedule.filter(d => d !== day) : [...localSchedule, day].sort();
    setLocalSchedule(next);
    if (onEmployeeUpdate) onEmployeeUpdate(empId, { fte: localFte, workSchedule: next });
  };
  const fieldStyle = { background: P.white, border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-125) var(--space-200)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink };
  const labelStyle = { display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, marginBottom: 'var(--space-075)' };
  const th = { textAlign: 'left', padding: 'var(--space-100) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' };
  const SalSecHead = ({ title, onAdd }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-125)' }}>
      <div style={SL}>{title}</div>
      <button onClick={onAdd} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-075)', padding: 'var(--space-075) var(--space-200)', borderRadius: 8, border: 'none', background: P.action, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)' }}>
        <Icon name="Plus" size={12} color="#fff" />Add
      </button>
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-500)' }}>
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink, margin: '0 0 var(--space-200)' }}>Contract</h3>
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: 'var(--space-250)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-200)', marginBottom: 'var(--space-200)' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>FTE</label>
            <select value={localFte} onChange={e => handleFteChange(parseFloat(e.target.value))}
              style={{ ...fieldStyle, width: '100%', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6b80' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 'var(--space-400)' }}>
              {[1.0, 0.9, 0.8, 0.6, 0.5].map(v => <option key={v} value={v}>{v === 1.0 ? '1.0 — Full-time' : `${v} — Part-time`}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Contracted hours</label>
            <div style={{ ...fieldStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: P.bg }}>
              <span>{regime.contractedHours}:00 / week</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, background: P.white, padding: 'var(--space-025) var(--space-075)', borderRadius: 4, border: `1px solid ${P.border}` }}>Company default</span>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 'var(--space-200)' }}>
          <label style={labelStyle}>Work schedule</label>
          <div style={{ display: 'flex', gap: 'var(--space-075)' }}>
            {DAY_LABELS.map((label, i) => {
              const day = i + 1;
              const active = localSchedule.includes(day);
              return (
                <button key={day} onClick={() => toggleDay(day)}
                  style={{ width: 48, height: 36, borderRadius: 8, border: `1.5px solid ${active ? P.action : P.border}`, background: active ? '#f3f0ff' : 'transparent', color: active ? P.action : P.inkSoft, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', cursor: 'pointer', transition: 'all 120ms ease' }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-200)' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>ADV entitlement</label>
            <div style={{ ...fieldStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: P.bg }}>
              <span>{advDays} days / year</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.success, background: P.successBg, padding: 'var(--space-025) var(--space-075)', borderRadius: 4 }}>Auto</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Legal leave</label>
            <div style={{ ...fieldStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: P.bg }}>
              <span>{legalLeave} days{localFte < 1.0 ? ` (${localFte} FTE)` : ''}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.success, background: P.successBg, padding: 'var(--space-025) var(--space-075)', borderRadius: 4 }}>Auto</span>
            </div>
          </div>
        </div>
        </div>
      </div>
      <div>
        <SalSecHead title="Salary" onAdd={() => {}} />
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)' }}>
            <thead><tr style={{ borderBottom: `1px solid ${P.border}` }}>
              <th style={{ ...th, paddingLeft: 'var(--space-250)' }}>Gross amount</th>
              <th style={th}>Working regime</th>
              <th style={th}>Start date</th>
              <th style={th}>End date</th>
              <th style={th}>Status</th>
              <th style={th}></th>
            </tr></thead>
            <tbody>{history.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: idx < history.length - 1 ? `1px solid ${P.border}` : 'none' }}>
                <td style={{ padding: 'var(--space-150) var(--space-250)' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{row.gross}</div>
                  <div style={{ fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginTop: 'var(--space-025)' }}>per month</div>
                </td>
                <td style={{ padding: 'var(--space-150) var(--space-200)' }}>
                  <div style={{ color: P.ink }}>{row.regime}</div>
                  <div style={{ fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginTop: 'var(--space-025)' }}>per week</div>
                </td>
                <td style={{ padding: 'var(--space-150) var(--space-200)', color: P.inkSoft }}>{row.start}</td>
                <td style={{ padding: 'var(--space-150) var(--space-200)', color: P.inkSoft }}>{row.end}</td>
                <td style={{ padding: 'var(--space-150) var(--space-200)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', background: row.active ? P.successBg : P.white, color: row.active ? P.success : P.inkSoft, border: `1px solid ${row.active ? P.successBorder : P.border}`, borderRadius: 6, padding: 'var(--space-025) var(--space-075)', fontSize: 'var(--fs-body-xs)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
                    {row.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: 'var(--space-100) var(--space-200)', textAlign: 'right' }}><button style={{ border: `1px solid ${P.border}`, background: 'transparent', borderRadius: 6, padding: 'var(--space-050) var(--space-125)', fontSize: 'var(--fs-body-xs)', fontFamily: 'var(--font-display)', fontWeight: 600, color: P.inkSoft, cursor: 'pointer' }}>Details</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div>
        <SalSecHead title="Salary components" onAdd={() => {}} />
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: '-8px 0 14px' }}>
          Components are benefits offered as part of the employee's remuneration where a benefit in kind is charged for. <AppLink onClick={e => e.preventDefault()}>Learn more</AppLink>
        </p>
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)' }}>
            <thead><tr style={{ borderBottom: `1px solid ${P.border}` }}>
              <th style={{ ...th, paddingLeft: 'var(--space-250)' }}>Type</th>
              <th style={th}>Start date</th>
              <th style={th}>End date</th>
              <th style={th}></th>
            </tr></thead>
            <tbody>{components.map((c, idx) => (
              <tr key={idx} style={{ borderBottom: idx < components.length - 1 ? `1px solid ${P.border}` : 'none' }}>
                <td style={{ padding: 'var(--space-150) var(--space-250)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name={c.icon} size={14} color={P.inkSoft} />
                    </div>
                    <span style={{ color: P.ink, fontFamily: 'var(--font-display)', fontWeight: 600 }}>{c.type}</span>
                  </div>
                </td>
                <td style={{ padding: 'var(--space-150) var(--space-200)', color: P.inkSoft }}>{c.start}</td>
                <td style={{ padding: 'var(--space-150) var(--space-200)', color: P.inkSoft }}>{c.end}</td>
                <td style={{ padding: 'var(--space-100) var(--space-200)', textAlign: 'right' }}><button style={{ border: `1px solid ${P.border}`, background: 'transparent', borderRadius: 6, padding: 'var(--space-050) var(--space-125)', fontSize: 'var(--fs-body-xs)', fontFamily: 'var(--font-display)', fontWeight: 600, color: P.inkSoft, cursor: 'pointer' }}>Details</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
function DetailsTab({ emp, empId, onNav, adminAccess, onAdminSave, companyRegime, onEmployeeUpdate }) {
  const [isEmployeeLocal, setIsEmployeeLocal] = React.useState(emp.isEmployee !== false);
  const ex = EMP_EXTRA[empId] || {};
  const parts = emp.name.split(' ');
  const first = parts[0], last = parts.slice(1).join(' ');
  const fieldStyle = { background: P.white, border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-125) var(--space-200)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink };
  const labelStyle = { display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, marginBottom: 'var(--space-075)' };
  return (
    <div style={{ maxWidth: 740 }}>
      <div style={{ marginBottom: 'var(--space-400)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink, margin: '0 0 var(--space-250)' }}>Basic info</h3>
        <div style={{ display: 'flex', gap: 'var(--space-200)', marginBottom: 'var(--space-200)' }}>
          <div style={{ flex: 1 }}><label style={labelStyle}>First name *</label><div style={fieldStyle}>{first}</div></div>
          <div style={{ flex: 1 }}><label style={labelStyle}>Last name *</label><div style={fieldStyle}>{last}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-200)' }}>
          <div style={{ flex: 1 }}><label style={labelStyle}>Email *</label><div style={fieldStyle}>{emp.email}</div></div>
          <div style={{ flex: 1 }}><label style={labelStyle}>Language *</label><div style={fieldStyle}>{ex.lang || 'Dutch'}</div></div>
        </div>
      </div>
      <div style={{ marginBottom: 'var(--space-400)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink, margin: '0 0 var(--space-250)' }}>Employment data</h3>
        <div style={{ display: 'flex', gap: 'var(--space-200)', marginBottom: 'var(--space-200)' }}>
          <div style={{ flex: 1 }}><label style={labelStyle}>Entity</label><div style={fieldStyle}>{emp.entity}</div></div>
          <div style={{ flex: 1 }}><label style={labelStyle}>Start date at company *</label><div style={fieldStyle}>{ex.hireDate || '—'}</div></div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-200)' }}>
          <div style={{ flex: 1 }}><label style={labelStyle}>Employee Payroll ID *</label><div style={fieldStyle}>{ex.payrollId || '—'}</div></div>
          <div style={{ flex: 1 }}><label style={labelStyle}>INSS number</label><div style={fieldStyle}>{ex.inssNumber || '—'}</div></div>
        </div>
      </div>
      {(() => {
        const AREA_LABELS = { 'time-off': 'Time off', 'expenses': 'Expenses', 'payroll': 'Payroll' };
        const isEmployee = isEmployeeLocal;
        const explicitlyRevoked = adminAccess && adminAccess[empId] === 'revoked';
        const isAdmin = !explicitlyRevoked && ((adminAccess && empId in adminAccess && adminAccess[empId] !== 'revoked') || emp.role === 'Admin');
        const currentAccess = adminAccess ? (adminAccess[empId] ?? emp.adminAccess ?? null) : (emp.adminAccess ?? null);
        const accessLabel = currentAccess === 'full'
          ? 'Full admin'
          : Array.isArray(currentAccess) && currentAccess.length > 0
            ? currentAccess.map(a => AREA_LABELS[a] || a).join(' · ')
            : null;
        const cbBox = (checked) => (
          <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked ? P.action : P.border}`, background: checked ? P.action : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 120ms ease, background 120ms ease', marginTop: 'var(--space-025)' }}>
            {checked && <Icon name="check" size={10} color="#fff" strokeWidth={3} />}
          </div>
        );
        return (
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink, margin: '0 0 var(--space-050)' }}>Roles</h3>
            <div onClick={() => setIsEmployeeLocal(v => !v)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-125)', padding: 'var(--space-100) 0', borderRadius: 8, cursor: 'pointer' }}>
              {cbBox(isEmployee)}
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, fontWeight: 500, marginTop: 'var(--space-025)' }}>Employee</div>
            </div>
            <div onClick={() => isAdmin ? onAdminSave(empId, 'revoke') : onAdminSave(empId, null)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-125)', padding: 'var(--space-100) 0', borderRadius: 8, cursor: 'pointer' }}>
              {cbBox(isAdmin, true)}
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, fontWeight: 500 }}>Admin</div>
                {isAdmin && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>
                    {accessLabel ? (
                      <span>
                        <span style={{ color: P.inkSoft }}>{accessLabel}</span>
                        <span style={{ color: P.inkSoft }}> · </span>
                        <span onClick={e => { e.stopPropagation(); onNav('settings-team'); }} style={{ color: P.ink, textDecoration: 'underline', cursor: 'pointer' }}>Manage in Team & access</span>
                      </span>
                    ) : (
                      <span onClick={e => { e.stopPropagation(); onNav('settings-team'); }} style={{ color: P.ink, textDecoration: 'underline', cursor: 'pointer' }}>Assign access level</span>
                    )
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

const generatedRequests = [
  { id: 'gen-1', employee: 'david', type: 'Statutory annual leave', startDate: 'Mon 1 Jun', endDate: 'Thu 11 Jun', days: 9, status: 'approved', submittedAt: '12 May', note: 'Summer holiday', _selectedDates: ['2026-06-01','2026-06-02','2026-06-03','2026-06-04','2026-06-05','2026-06-08','2026-06-09','2026-06-10','2026-06-11'] },
  { id: 'gen-2', employee: 'emma-martens', type: 'Statutory annual leave', startDate: 'Mon 13 Jul', endDate: 'Fri 17 Jul', days: 5, status: 'pending', submittedAt: '20 Jun', note: '' },
  { id: 'gen-3', employee: 'mathias-de-smedt', type: 'Statutory annual leave', startDate: 'Wed 8 Jul', endDate: 'Wed 8 Jul', days: 1, status: 'approved', submittedAt: '10 Jun', note: '', _selectedDates: ['2026-07-08'] },
  { id: 'gen-4', employee: 'stijn-laurent', type: 'Special leave', startDate: 'Fri 3 Jul', endDate: 'Fri 3 Jul', days: 1, status: 'approved', submittedAt: '25 Jun', note: 'Wedding', _selectedDates: ['2026-07-03'] },
  { id: 'gen-5', employee: 'laura-mertens', type: 'Sick leave', startDate: 'Tue 7 Jul', endDate: 'Tue 7 Jul', days: 1, status: 'approved', submittedAt: '7 Jul', note: '', _selectedDates: ['2026-07-07'] },
  { id: 'gen-11', employee: 'laura-mertens', type: 'Sick leave', startDate: 'Tue 14 Jul', endDate: 'Tue 14 Jul', days: 1, status: 'approved', submittedAt: '14 Jul', note: '', _selectedDates: ['2026-07-14'] },
  { id: 'gen-6c', employee: 'bram-goossens', type: 'Special leave', startDate: 'Thu 19 Mar', endDate: 'Thu 19 Mar', days: 1, status: 'approved', submittedAt: '10 Mar', note: 'Wedding', document: 'wedding_certificate.pdf', _selectedDates: ['2026-03-19'] },
  { id: 'gen-6d', employee: 'bram-goossens', type: 'Sick leave', startDate: 'Mon 5 May', endDate: 'Tue 6 May', days: 2, status: 'approved', submittedAt: '5 May', document: 'medical_certificate.pdf', note: '', _selectedDates: ['2026-05-05','2026-05-06'] },
  { id: 'gen-6b', employee: 'bram-goossens', type: 'Statutory annual leave', startDate: 'Fri 19 Jun', endDate: 'Fri 19 Jun', days: 0.5, halfDay: 'PM', status: 'approved', submittedAt: '18 Jun', note: '', _selectedDates: ['2026-06-19'], _halfDay: { '2026-06-19': 'pm' } },
  { id: 'gen-6', employee: 'bram-goossens', type: 'ADV / RTT', startDate: 'Mon 22 Jun', endDate: 'Tue 23 Jun', days: 2, status: 'approved', submittedAt: '15 Jun', note: '', _selectedDates: ['2026-06-22','2026-06-23'] },
  { id: 'gen-7', employee: 'jana-goossens', type: 'Statutory annual leave', startDate: 'Thu 25 Jun', endDate: 'Fri 27 Jun', days: 3, status: 'approved', submittedAt: '10 Jun', note: 'Long weekend', _selectedDates: ['2026-06-25','2026-06-26','2026-06-27'] },
  { id: 'gen-8', employee: 'pieter-mertens', type: 'Extra-legal leave', startDate: 'Wed 1 Jul', endDate: 'Wed 1 Jul', days: 1, status: 'approved', submittedAt: '28 Jun', note: '', _selectedDates: ['2026-07-01'] },
  { id: 'gen-12', employee: 'pieter-mertens', type: 'Statutory annual leave', startDate: 'Mon 13 Jul', endDate: 'Wed 15 Jul', days: 3, status: 'approved', submittedAt: '1 Jul', note: '', _selectedDates: ['2026-07-13','2026-07-14','2026-07-15'] },
  { id: 'gen-13', employee: 'sarah-de-smedt', type: 'Statutory annual leave', startDate: 'Tue 14 Jul', endDate: 'Thu 16 Jul', days: 3, status: 'approved', submittedAt: '3 Jul', note: '', _selectedDates: ['2026-07-14','2026-07-15','2026-07-16'] },
  { id: 'gen-14', employee: 'jana-goossens', type: 'Statutory annual leave', startDate: 'Thu 16 Jul', endDate: 'Fri 17 Jul', days: 2, status: 'approved', submittedAt: '5 Jul', note: '', _selectedDates: ['2026-07-16','2026-07-17'] },
  { id: 'gen-15', employee: 'julie-goossens', type: 'Statutory annual leave', startDate: 'Wed 22 Jul', endDate: 'Fri 24 Jul', days: 3, status: 'approved', submittedAt: '9 Jul', note: '', _selectedDates: ['2026-07-22','2026-07-23','2026-07-24'] },
  { id: 'gen-9', employee: 'thomas-janssens', type: 'Statutory annual leave', startDate: 'Mon 20 Jul', endDate: 'Fri 24 Jul', days: 5, status: 'pending', submittedAt: '8 Jul', note: 'Family trip', _selectedDates: ['2026-07-20','2026-07-21','2026-07-22','2026-07-23','2026-07-24'] },
  { id: 'gen-10', employee: 'bram-goossens', type: 'Statutory annual leave', startDate: 'Thu 23 Jul', endDate: 'Fri 24 Jul', days: 2, status: 'pending', submittedAt: '10 Jul', note: '', _selectedDates: ['2026-07-23','2026-07-24'] },
  { id: 'gen-16', employee: 'mathias-de-smedt', type: 'Statutory annual leave', startDate: 'Mon 4 Aug', endDate: 'Wed 6 Aug', days: 3, status: 'pending', submittedAt: '14 Jul', note: '', _selectedDates: ['2026-08-04','2026-08-05','2026-08-06'] },
  // Pending: sick leave with medical certificate
  { id: 'req-sick-tv', employee: 'thomas-vandenberghe', type: 'Sick leave', startDate: 'Mon 28 Jul', endDate: 'Wed 30 Jul', days: 3, status: 'pending', submittedAt: '17 Jul', note: '', document: 'medical_certificate.pdf', _selectedDates: ['2026-07-28','2026-07-29','2026-07-30'] },
  // Pending: special leave wedding with many colleagues off
  { id: 'req-wedding-lm', employee: 'laura-mertens', type: 'Special leave', startDate: 'Thu 30 Jul', endDate: 'Fri 1 Aug', days: 2, status: 'pending', submittedAt: '17 Jul', note: "Sister's wedding", document: 'wedding_invitation.pdf', _selectedDates: ['2026-07-30','2026-07-31'] },
  // Approved: Design colleagues off same week as TV sick leave (create conflict)
  { id: 'gen-17', employee: 'emma-martens', type: 'Statutory annual leave', startDate: 'Mon 28 Jul', endDate: 'Wed 30 Jul', days: 3, status: 'approved', submittedAt: '12 Jul', note: '', _selectedDates: ['2026-07-28','2026-07-29','2026-07-30'] },
  // Approved: Engineering colleagues off same days as Laura's wedding (create overlap)
  { id: 'gen-18', employee: 'david', type: 'Statutory annual leave', startDate: 'Mon 28 Jul', endDate: 'Fri 1 Aug', days: 5, status: 'approved', submittedAt: '5 Jul', note: 'Summer break', _selectedDates: ['2026-07-27','2026-07-28','2026-07-29','2026-07-30','2026-07-31'] },
  { id: 'gen-19', employee: 'stijn-laurent', type: 'Statutory annual leave', startDate: 'Mon 27 Jul', endDate: 'Fri 1 Aug', days: 6, status: 'approved', submittedAt: '8 Jul', note: '', _selectedDates: ['2026-07-27','2026-07-28','2026-07-29','2026-07-30','2026-07-31'] },
  { id: 'gen-20', employee: 'jana-goossens', type: 'ADV / RTT', startDate: 'Thu 30 Jul', endDate: 'Fri 31 Jul', days: 2, status: 'approved', submittedAt: '11 Jul', note: '', _selectedDates: ['2026-07-30','2026-07-31'] },
];

const EXPENSE_BUDGET_TYPES = [
  { id: 'mobility', label: 'Transport' },
  { id: 'work',     label: 'Business expenses' },
  { id: 'learning', label: 'Learning & development' },
];

const EXPENSE_CATEGORIES_SEED = [
  { name: 'Private transport',      monthlyLimit: null, budgetType: 'mobility' },
  { name: 'Public transport',       monthlyLimit: null, budgetType: 'mobility' },
  { name: 'Shared mobility',        monthlyLimit: null, budgetType: 'mobility' },
  { name: 'Mobility subscription',  monthlyLimit: null, budgetType: 'mobility' },
  { name: 'Flights',                monthlyLimit: null, budgetType: 'mobility' },
  { name: 'Hotel',                  monthlyLimit: null, budgetType: 'work' },
  { name: 'Restaurant',             monthlyLimit: null, budgetType: 'work' },
  { name: 'Meal allowance',         monthlyLimit: null, budgetType: 'work' },
  { name: 'Representation',         monthlyLimit: null, budgetType: 'work' },
  { name: 'Taxi',                   monthlyLimit: null, budgetType: 'work' },
  { name: 'Parking',                monthlyLimit: null, budgetType: 'work' },
  { name: 'Business gifts',         monthlyLimit: null, budgetType: 'work' },
  { name: 'Conference fees',        monthlyLimit: null, budgetType: 'learning' },
  { name: 'Training materials',     monthlyLimit: null, budgetType: 'learning' },
  { name: 'Online courses',         monthlyLimit: null, budgetType: 'learning' },
];

const ALLOWANCE_TYPES = [
  {
    id: 'mileage',
    name: 'Mileage',
    icon: 'car',
    description: 'Reimburse employees for using their private car for business travel.',
    submissionType: 'mileage',
    rateLabel: 'Rate per kilometre',
    defaultRate: 0.4296,
    nsssCeiling: null,
    nsssNote: 'NSSS official rate for 2025: €0.4296/km — no receipt required.',
    unit: 'km',
  },
  {
    id: 'home-office',
    name: 'Home office',
    icon: 'home',
    description: 'Monthly flat-rate for employees who work from home on a structural basis.',
    submissionType: 'auto',
    rateLabel: 'Monthly amount',
    defaultRate: 151.70,
    nsssCeiling: 151.70,
    nsssNote: 'NSSS ceiling 2025: €151.70/month — added to payslip automatically.',
    unit: 'month',
  },
  {
    id: 'mobile-internet',
    name: 'Mobile & internet',
    icon: 'smartphone',
    description: 'Monthly flat-rate for use of a personal phone and home internet for work.',
    submissionType: 'auto',
    rateLabel: 'Monthly amount',
    defaultRate: 30,
    nsssCeiling: 30,
    nsssNote: 'NSSS ceiling 2025: €30/month — added to payslip automatically.',
    unit: 'month',
  },
  {
    id: 'representation',
    name: 'Representation',
    icon: 'briefcase',
    description: 'Monthly allowance for business entertainment, hospitality and client gifts.',
    submissionType: 'auto',
    rateLabel: 'Monthly amount',
    defaultRate: null,
    nsssCeiling: null,
    nsssNote: null,
    unit: 'month',
  },
];

const EXPENSES_SEED = [
  // August 2026
  { id: 'exp-31', employee: 'emma-martens',      category: 'Restaurant',      amount:  28.50, currency: 'EUR', expenseDate: '10 Aug', submittedAt: '12 Aug', description: 'Working lunch — project kick-off',                   receipt: 'lunch_aug.pdf',   status: 'pending' },
  { id: 'exp-32', employee: 'thomas-janssens',   category: 'Hotel',           amount: 165.00, currency: 'EUR', expenseDate:  '5 Aug', submittedAt:  '8 Aug', description: 'Hotel Brussels — partner offsite',                    receipt: 'hotel_aug.pdf',   status: 'approved' },
  { id: 'exp-33', employee: 'bram-goossens',     category: 'Travel',          amount:  52.00, currency: 'EUR', expenseDate:  '1 Aug', submittedAt:  '5 Aug', description: 'Eurostar Brussels–London return',                     receipt: 'eurostar_aug.pdf',status: 'approved' },
  { id: 'exp-34', employee: 'stijn-laurent',     category: 'Taxi',            amount:  19.00, currency: 'EUR', expenseDate: '31 Jul', submittedAt:  '1 Aug', description: 'Taxi home — late client dinner',                      receipt: 'taxi_aug.pdf',    status: 'approved' },
  // July 2026
  { id: 'exp-1',  employee: 'thomas-janssens',   category: 'Travel',          amount: 124.50, currency: 'EUR', expenseDate: '11 Jul', submittedAt: '14 Jul', description: 'Train Brussels–Ghent client visit',                   receipt: 'sncb_ticket.pdf', status: 'pending' },
  { id: 'exp-2',  employee: 'sarah-de-smedt',    category: 'Restaurant',      amount:  87.00, currency: 'EUR', expenseDate:  '9 Jul', submittedAt: '10 Jul', description: 'Team lunch — 4 people',                               receipt: 'lunch_jul.pdf',   status: 'pending' },
  { id: 'exp-3',  employee: 'bram-goossens',     category: 'Taxi',            amount:  34.00, currency: 'EUR', expenseDate:  '7 Jul', submittedAt:  '7 Jul', description: 'Taxi to Brussels airport — client meeting',            receipt: 'taxi_receipt.pdf',status: 'pending' },
  { id: 'exp-4',  employee: 'emma-martens',      category: 'Restaurant',      amount:  15.00, currency: 'EUR', expenseDate: '29 Jun', submittedAt:  '1 Jul', description: 'Working lunch with design team',                       receipt: 'lunch_jun.pdf',   status: 'approved' },
  // June 2026
  { id: 'exp-5',  employee: 'david',             category: 'Travel',          amount: 212.00, currency: 'EUR', expenseDate: '17 Jun', submittedAt: '25 Jun', description: 'Brussels–London for product workshop',                 receipt: 'eurostar.pdf',    status: 'approved' },
  { id: 'exp-6',  employee: 'pieter-mertens',    category: 'Restaurant',      amount:  43.50, currency: 'EUR', expenseDate: '21 Jun', submittedAt: '22 Jun', description: 'Client dinner',                                        receipt: 'dinner_jun.pdf',  status: 'rejected', rejectReason: 'No client approval on record for this dinner.' },
  { id: 'exp-7',  employee: 'jana-goossens',     category: 'Taxi',            amount:  19.00, currency: 'EUR', expenseDate: '18 Jun', submittedAt: '18 Jun', description: 'Taxi home after late client event',                    receipt: 'taxi_receipt.pdf',status: 'approved' },
  { id: 'exp-8',  employee: 'stijn-laurent',     category: 'Travel',          amount:  31.00, currency: 'EUR', expenseDate:  '1 Jun', submittedAt: '15 Jun', description: 'Monthly transit pass — June',                          receipt: 'transit_jun.pdf', status: 'pending' },
  { id: 'exp-9',  employee: 'laura-mertens',     category: 'Restaurant',      amount:  27.50, currency: 'EUR', expenseDate:  '8 Jun', submittedAt: '10 Jun', description: 'Lunch with new hire onboarding',                       receipt: 'lunch_jun2.pdf',  status: 'approved' },
  { id: 'exp-10', employee: 'mathias-de-smedt',  category: 'Taxi',            amount:  22.00, currency: 'EUR', expenseDate:  '2 Jun', submittedAt:  '3 Jun', description: 'Taxi to Ghent office — missed last train',             receipt: 'taxi_jun.pdf',    status: 'pending' },
  // May 2026
  { id: 'exp-11', employee: 'thomas-janssens',   category: 'Hotel',           amount: 189.00, currency: 'EUR', expenseDate: '21 May', submittedAt: '28 May', description: 'Hotel Antwerp — overnight client visit',               receipt: 'hotel_may.pdf',   status: 'approved' },
  { id: 'exp-12', employee: 'sarah-de-smedt',    category: 'Travel',          amount:  44.00, currency: 'EUR', expenseDate: '19 May', submittedAt: '21 May', description: 'Train Brussels–Liège–Brussels',                        receipt: 'sncb_may.pdf',    status: 'approved' },
  { id: 'exp-13', employee: 'bram-goossens',     category: 'Restaurant',      amount:  38.50, currency: 'EUR', expenseDate: '14 May', submittedAt: '15 May', description: 'Lunch with candidate — recruitment',                   receipt: 'lunch_may.pdf',   status: 'rejected', rejectReason: 'Recruitment lunches require prior manager sign-off.' },
  { id: 'exp-14', employee: 'jana-goossens',     category: 'Taxi',            amount:  24.00, currency: 'EUR', expenseDate:  '8 May', submittedAt:  '8 May', description: 'Taxi to offsite — public transport unavailable',        receipt: 'taxi_may.pdf',    status: 'approved' },
  { id: 'exp-15', employee: 'laura-mertens',     category: 'Online courses',  amount: 129.00, currency: 'EUR', expenseDate:  '1 May', submittedAt:  '2 May', description: 'Coursera subscription — May',                          receipt: 'coursera_may.pdf',status: 'approved' },
  // April 2026
  { id: 'exp-16', employee: 'stijn-laurent',     category: 'Travel',          amount:  56.00, currency: 'EUR', expenseDate:  '1 Apr', submittedAt: '29 Apr', description: 'Monthly transit pass — April',                         receipt: 'transit_apr.pdf', status: 'approved' },
  { id: 'exp-17', employee: 'emma-martens',      category: 'Restaurant',      amount:  74.00, currency: 'EUR', expenseDate: '20 Apr', submittedAt: '22 Apr', description: 'Team dinner — product launch',                         receipt: 'dinner_apr.pdf',  status: 'approved' },
  { id: 'exp-18', employee: 'mathias-de-smedt',  category: 'Online courses',  amount: 149.00, currency: 'EUR', expenseDate: '12 Apr', submittedAt: '14 Apr', description: 'Udemy annual subscription',                            receipt: 'udemy_apr.pdf',   status: 'approved' },
  { id: 'exp-19', employee: 'pieter-mertens',    category: 'Taxi',            amount:  18.50, currency: 'EUR', expenseDate:  '7 Apr', submittedAt:  '7 Apr', description: 'Taxi to client site — Zaventem',                       receipt: 'taxi_apr.pdf',    status: 'approved' },
  // March 2026
  { id: 'exp-20', employee: 'thomas-janssens',   category: 'Conference fees', amount: 395.00, currency: 'EUR', expenseDate:  '3 Mar', submittedAt: '25 Mar', description: 'HR Tech World 2026 — conference registration',          receipt: 'hrtech_conf.pdf', status: 'approved' },
  { id: 'exp-21', employee: 'bram-goossens',     category: 'Hotel',           amount: 220.00, currency: 'EUR', expenseDate: '14 Mar', submittedAt: '18 Mar', description: 'Hotel Amsterdam — 2 nights for partner summit',         receipt: 'hotel_mar.pdf',   status: 'approved' },
  { id: 'exp-22', employee: 'sarah-de-smedt',    category: 'Restaurant',      amount:  51.00, currency: 'EUR', expenseDate: '10 Mar', submittedAt: '12 Mar', description: 'Team lunch — Q1 retrospective',                        receipt: 'lunch_mar.pdf',   status: 'approved' },
  { id: 'exp-23', employee: 'jana-goossens',     category: 'Travel',          amount:  88.00, currency: 'EUR', expenseDate:  '3 Mar', submittedAt:  '5 Mar', description: 'Train Brussels–Paris for client presentation',          receipt: 'thalys_mar.pdf',  status: 'approved' },
  // February 2026
  { id: 'exp-24', employee: 'emma-martens',      category: 'Training materials', amount: 67.00, currency: 'EUR', expenseDate: '22 Feb', submittedAt: '27 Feb', description: 'Design books — UX research bundle',                  receipt: 'amazon_feb.pdf',  status: 'approved' },
  { id: 'exp-25', employee: 'thomas-janssens',   category: 'Travel',          amount:  94.00, currency: 'EUR', expenseDate: '17 Feb', submittedAt: '20 Feb', description: 'Eurostar Brussels–London — product sprint',             receipt: 'eurostar_feb.pdf',status: 'approved' },
  { id: 'exp-26', employee: 'stijn-laurent',     category: 'Restaurant',      amount:  35.00, currency: 'EUR', expenseDate: '12 Feb', submittedAt: '13 Feb', description: 'Team lunch — new team member welcome',                  receipt: 'lunch_feb.pdf',   status: 'approved' },
  { id: 'exp-27', employee: 'mathias-de-smedt',  category: 'Taxi',            amount:  16.50, currency: 'EUR', expenseDate:  '5 Feb', submittedAt:  '6 Feb', description: 'Taxi to Brussels office — night shift end',             receipt: 'taxi_feb.pdf',    status: 'approved' },
  // January 2026
  { id: 'exp-28', employee: 'laura-mertens',     category: 'Conference fees', amount: 290.00, currency: 'EUR', expenseDate: '15 Jan', submittedAt: '30 Jan', description: 'People & Culture Summit 2026 — registration',          receipt: 'summit_jan.pdf',  status: 'approved' },
  { id: 'exp-29', employee: 'pieter-mertens',    category: 'Restaurant',      amount:  82.00, currency: 'EUR', expenseDate: '22 Jan', submittedAt: '23 Jan', description: 'Client lunch — new contract onboarding',               receipt: 'lunch_jan.pdf',   status: 'approved' },
  { id: 'exp-30', employee: 'bram-goossens',     category: 'Travel',          amount:  58.00, currency: 'EUR', expenseDate: '14 Jan', submittedAt: '16 Jan', description: 'Train Brussels–Ghent — kickoff meeting',               receipt: 'sncb_jan.pdf',    status: 'approved' },
  { id: 'exp-35', employee: 'jana-goossens',     category: 'Taxi',            amount:  21.00, currency: 'EUR', expenseDate:  '8 Jan', submittedAt:  '9 Jan', description: 'Taxi after late team event',                           receipt: 'taxi_jan.pdf',    status: 'approved' },
];

// ── localStorage bridge ────────────────────────────────────────────────────
const LS_KEY = 'payflip_hr_requests';
function readLS() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function writeLS(reqs) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(reqs.filter(r => r.employee === 'david' && r.id.startsWith('req-')))); } catch {}
}
function mergeRequests(seed, live) {
  const merged = [...seed];
  for (const r of live) {
    if (!merged.find(m => m.id === r.id)) merged.unshift(r);
  }
  return merged;
}

// ── Date helpers ───────────────────────────────────────────────────────────
const _MONTHS = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
function parseDisplayDate(str) {
  const m = str?.match(/(\d+)\s+(\w+)/);
  if (!m || !_MONTHS.hasOwnProperty(m[2])) return null;
  return new Date(2026, _MONTHS[m[2]], +m[1]);
}
function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function weekStart(d) {
  const day = d.getDay() || 7;
  const out = new Date(d); out.setDate(d.getDate() - day + 1); out.setHours(0,0,0,0); return out;
}
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function startOfMonth(d) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return weekStart(first);
}
function daysInMonthView(d) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const last  = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const ws = weekStart(first);
  const lastDay = last.getDay() || 7;
  const we = addDays(last, 7 - lastDay);
  const count = Math.round((we - ws) / 86400000);
  return count;
}

const DAY_LABELS = ['MO','TU','WE','TH','FR','SA','SU'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ employeeId, size = 28, bg, style: extraStyle }) {
  const emp = EMPLOYEES[employeeId] || { initials: '?', color: P.border };
  if (emp.photo) {
    return <img src={avatarUrl(emp.name, emp.gender)} alt={emp.initials} style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, objectFit: 'cover', ...extraStyle }} />;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg || P.border,
      flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontWeight: 700,
      fontSize: size * 0.34, color: P.ink, letterSpacing: '0.01em',
      ...extraStyle,
    }}>{emp.initials}</div>
  );
}

// ── Status dot ─────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const m = StatusMeta[status] || StatusMeta.pending;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink }}>{m.label}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const m = StatusMeta[status] || StatusMeta.pending;
  return (
    <span style={{ background: m.bg, color: m.color, borderRadius: 6, padding: 'var(--space-050) var(--space-100)', fontSize: 'var(--fs-body-xs)', fontFamily: 'var(--font-display)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 'var(--space-050)' }}>
      <Icon name={m.icon} size={10} color={m.color} strokeWidth={2.5} />
      {m.label}
    </span>
  );
}

function DotPill({ bg, color, children, filled, dot = true, border, size = 12, padding, whiteSpace }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-075)',
      background: filled ? color : bg, color: filled ? '#fff' : color,
      border: border ? `1px solid ${border}` : 'none',
      borderRadius: 20, padding: padding || (size === 11 ? '1px 7px' : '2px 8px'), fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: size,
      whiteSpace, flexShrink: 0,
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />}
      {children}
    </span>
  );
}
function StatusPill({ status }) {
  const m = StatusMeta[status] || StatusMeta.pending;
  return <DotPill bg={m.bg} color={m.color}>{m.label}</DotPill>;
}

// ── Sidebar ────────────────────────────────────────────────────────────────
function SidebarItem({ icon, label, isActive, onClick, badgeDot, chevron, chevronOpen, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-100)',
      padding: 'var(--space-100) var(--space-250)', borderRadius: 0,
      border: 'none', background: isActive ? P.bg : 'transparent',
      cursor: disabled ? 'default' : 'pointer', width: '100%', textAlign: 'left',
      transition: `background 120ms ${EASE_OUT}`,
    }}>
      {icon && <Icon name={icon} size={14} color={disabled ? P.inkFaint : isActive ? P.ink : P.inkSoft} strokeWidth={1.75} />}
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: isActive ? 700 : 500, fontSize: 'var(--fs-body-sm)', color: disabled ? P.inkFaint : isActive ? P.ink : P.inkSoft, flex: 1 }}>
        {label}
      </span>
      {badgeDot && <span style={{ color: P.inkSoft, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)' }}>{typeof badgeDot === 'number' ? badgeDot : '!'}</span>}
      {chevron && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{
          flexShrink: 0, transform: chevronOpen ? 'scaleY(-1)' : 'scaleY(1)', transition: `transform 200ms ${EASE_OUT}`,
        }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      )}
    </button>
  );
}

// Grid-rows accordion — padding lives on the inner wrapper, never on the
// 0fr/1fr track itself, or the panel never fully collapses.
function SidebarAccordion({ open, children }) {
  return (
    <div style={{
      display: 'grid', gridTemplateRows: open ? '1fr' : '0fr',
      transition: `grid-template-rows 250ms ${EASE_OUT}`, overflow: 'hidden',
    }}>
      <div style={{ minHeight: 0 }}>{children}</div>
    </div>
  );
}

function SidebarSub({ items, active, onNav }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-025)', marginBottom: 'var(--space-050)' }}>
      {items.map(({ id, label, badge }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => onNav(id)} style={{
            display: 'flex', alignItems: 'center', gap: 0,
            padding: 'var(--space-075) var(--space-250) var(--space-075) 43px', borderRadius: 0,
            border: 'none', background: 'transparent', position: 'relative',
            cursor: 'pointer', width: '100%', textAlign: 'left',
          }}>
            <div style={{ position: 'absolute', left: 26, top: 0, bottom: 0, width: 1, background: isActive ? '#C42BFC' : P.border }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: isActive ? 600 : 400, fontSize: 'var(--fs-body-sm)', color: isActive ? '#C42BFC' : P.inkSoft, flex: 1 }}>{label}</span>
            {badge > 0 && (
              <span style={{ color: P.inkSoft, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)' }}>{badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SidebarSectionHeader({ label }) {
  return (
    <div style={{
      padding: 'var(--space-200) var(--space-250) var(--space-050)',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 'var(--fs-body-xs)',
      color: P.inkFaint,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {label}
    </div>
  );
}

function AdminProfileFooter() {
  return (
    <div style={{ borderTop: `1px solid ${P.border}`, padding: 'var(--space-125) var(--space-250) var(--space-150)', display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', background: CURRENT_USER.color, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-xs)', color: P.ink,
      }}>{CURRENT_USER.initials}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-025)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{CURRENT_USER.name}</span>
        <button style={{
          border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'left',
          fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'var(--fs-body-xs)', color: P.inkFaint,
          transition: `color 120ms ${EASE_OUT}`,
        }}
        onMouseEnter={e => { e.currentTarget.style.color = P.inkSoft; }}
        onMouseLeave={e => { e.currentTarget.style.color = P.inkFaint; }}>
          Log out
        </button>
      </div>
    </div>
  );
}

function EntitySwitcher({ value, onChange, mode }) {
  const [open, setOpen] = useState(false);
  const btnRef = React.useRef(null);
  const popRef = React.useRef(null);
  const selected = value ? ENTITIES.find(e => e.id === value) : null;
  const isSettings = mode === 'settings';
  const defaultLabel = isSettings ? 'Company defaults' : 'All entities';
  const defaultSub = isSettings ? 'All entities inherit' : 'Show data across entities';
  const defaultIcon = isSettings ? 'building-2' : 'layers';

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!popRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const rect = btnRef.current?.getBoundingClientRect();

  return (
    <React.Fragment>
      <button ref={btnRef} onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-100)',
        padding: 'var(--space-200) var(--space-250)', width: '100%', border: 'none',
        borderBottom: `1px solid ${P.border}`,
        background: 'transparent', cursor: 'pointer', textAlign: 'left',
      }}>
        <Icon name={defaultIcon} size={14} color={selected ? P.ink : P.inkSoft} strokeWidth={1.75} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: selected ? P.ink : P.inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selected ? selected.name : defaultLabel}
          </div>
        </div>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && rect && ReactDOM.createPortal(
        <div ref={popRef} style={{
          position: 'fixed', top: rect.top, left: rect.right + 8, zIndex: 500,
          background: P.white, border: `1px solid ${P.border}`, borderRadius: 12,
          boxShadow: '0 8px 32px rgba(15,13,40,0.12)', minWidth: 230, overflow: 'hidden',
        }}>
          <div style={{ padding: 'var(--space-150) var(--space-200) var(--space-075)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Entities
          </div>
          <div style={{ padding: '0 var(--space-100) var(--space-100)' }}>
            <button onClick={() => { onChange(null); setOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-125)', width: '100%', padding: 'var(--space-100) var(--space-100)', border: 'none', borderRadius: 8,
              background: !value ? P.bg : 'transparent', cursor: 'pointer', textAlign: 'left', position: 'relative',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{defaultLabel}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>{defaultSub}</div>
              </div>
              {!value && <Icon name="check" size={13} color="#C42BFC" strokeWidth={2.5} />}
            </button>
            {ENTITIES.map(ent => (
              <button key={ent.id} onClick={() => { onChange(ent.id); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-125)', width: '100%', padding: 'var(--space-100) var(--space-100)', border: 'none', borderRadius: 8,
                background: value === ent.id ? P.bg : 'transparent', cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{ent.name}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>{ent.employeeCount} employees</div>
                </div>
                {value === ent.id && <Icon name="check" size={13} color="#C42BFC" strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </React.Fragment>
  );
}

function AppModeSidebar({ active, onNav, pendingCount, onEnterSettings, setupInProgress }) {
  const [timeoffOpen, setTimeoffOpen] = useState(active === 'requests' || active === 'team-absences');
  const [payrollOpen, setPayrollOpen] = useState(active === 'payroll-overview' || active === 'payroll-reports');

  return (
    <React.Fragment>

      <nav style={{ flex: 1, padding: 'var(--space-200) 0 var(--space-125)', display: 'flex', flexDirection: 'column', gap: 'var(--space-050)', overflow: 'auto' }}>
        <SidebarItem icon="house" label="Home" isActive={active === 'dashboard'} onClick={() => onNav('dashboard')} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-050)', opacity: setupInProgress ? 0.35 : 1, pointerEvents: setupInProgress ? 'none' : 'auto', transition: `opacity 250ms ${EASE_OUT}` }}>
          <SidebarItem icon="users" label="People" isActive={active === 'employees' || active === 'employees:admin' || active?.startsWith('employee-detail')} onClick={() => onNav('employees')} />
          <SidebarItem icon="list-checks" label="Choices" isActive={active === 'choices'} onClick={() => onNav('choices')} badgeDot={pendingCount?.choices || null} />

          <SidebarItem icon="calendar-days" label="Time off" onClick={() => setTimeoffOpen(o => !o)} chevron chevronOpen={timeoffOpen} isActive={active === 'requests' || active === 'team-absences'} badgeDot={!timeoffOpen && (pendingCount?.requests ?? pendingCount) > 0 ? (pendingCount?.requests ?? pendingCount) : null} />
          <SidebarAccordion open={timeoffOpen}>
            <SidebarSub active={active} onNav={onNav} items={[
              { id: 'requests', label: 'Requests', badge: pendingCount?.requests ?? pendingCount },
              { id: 'team-absences', label: 'Team calendar' },
            ]} />
          </SidebarAccordion>

          <SidebarItem icon="wallet" label="Payroll" onClick={() => setPayrollOpen(o => !o)} chevron chevronOpen={payrollOpen} />
          <SidebarAccordion open={payrollOpen}>
            <SidebarSub active={active} onNav={onNav} items={[
              { id: 'payroll-overview', label: 'Overview' },
              { id: 'payroll-reports', label: 'Reports' },
            ]} />
          </SidebarAccordion>

          <SidebarItem icon="receipt" label="Expenses" isActive={active === 'expenses'} onClick={() => onNav('expenses')} badgeDot={pendingCount?.expenses || null} />

          <SidebarItem icon="settings" label="Settings" onClick={onEnterSettings} />

          <div style={{ marginTop: 'auto', paddingTop: 'var(--space-125)' }}>
            <SidebarItem icon="blocks" label="Components" isActive={active === 'components'} onClick={() => onNav('components')} />
            <SidebarItem icon="sparkles" label="Product changelog" isActive={active === 'changelog'} onClick={() => onNav('changelog')} />
          </div>
        </div>
      </nav>
    </React.Fragment>
  );
}

const PERSONAL_IDS = ['settings-notifications', 'settings-account'];
const COMPANY_IDS  = ['settings-entities','settings-budgets','settings-benefits','settings-packages','settings-documents','settings-timeoff','settings-payroll','settings-allowances','settings-expenses','settings-cardrules','settings-integrations','settings-team'];

const ROUTE_MAP = [
  { screen: 'dashboard',              path: '/hr-admin' },
  { screen: 'requests',               path: '/hr-admin/time-off' },
  { screen: 'team-absences',          path: '/hr-admin/time-off/calendar' },
  { screen: 'employees',              path: '/hr-admin/people' },
  { screen: 'expenses',               path: '/hr-admin/expenses' },
  { screen: 'choices',                path: '/hr-admin/choices' },
  { screen: 'payroll-overview',       path: '/hr-admin/payroll' },
  { screen: 'payroll-reports',        path: '/hr-admin/payroll/reports' },
  { screen: 'settings-notifications', path: '/hr-admin/settings/notifications' },
  { screen: 'settings-account',       path: '/hr-admin/settings/account' },
  { screen: 'settings-entities',      path: '/hr-admin/settings/entities' },
  { screen: 'settings-budgets',       path: '/hr-admin/settings/budgets' },
  { screen: 'settings-benefits',      path: '/hr-admin/settings/benefits' },
  { screen: 'settings-packages',      path: '/hr-admin/settings/packages' },
  { screen: 'settings-documents',     path: '/hr-admin/settings/documents' },
  { screen: 'settings-timeoff',       path: '/hr-admin/settings/time-off' },
  { screen: 'settings-payroll',       path: '/hr-admin/settings/payroll' },
  { screen: 'settings-allowances',    path: '/hr-admin/settings/allowances' },
  { screen: 'settings-expenses',      path: '/hr-admin/settings/expenses' },
  { screen: 'settings-cardrules',     path: '/hr-admin/settings/card-rules' },
  { screen: 'settings-integrations',  path: '/hr-admin/settings/integrations' },
  { screen: 'settings-team',          path: '/hr-admin/settings/team' },
  { screen: 'settings-billing',       path: '/hr-admin/settings/billing' },
  { screen: 'changelog',              path: '/hr-admin/changelog' },
  { screen: 'components',             path: '/hr-admin/components' },
];

// The path prefix this app is mounted under: "" for local dev (served at
// /hr-admin) and "/payflip-employee-app" on GitHub Pages. Computed once from the
// initial URL by locating the "/hr-admin" segment. Client-side routing must
// prepend this — hardcoding "/hr-admin/..." drops the Pages prefix, so a nav
// click rewrites the URL to the wrong origin-root path and a reload/share 404s.
const BASE_PATH = (() => {
  const i = window.location.pathname.indexOf('/hr-admin');
  return i > 0 ? window.location.pathname.slice(0, i) : '';
})();

function screenToPath(screen) {
  let p;
  if (screen.startsWith('employee-detail:')) {
    const [, empId, tab] = screen.split(':');
    p = '/hr-admin/people/' + empId + (tab ? '/' + tab : '');
  }
  else if (screen === 'employees:admin') p = '/hr-admin/people';
  else {
    const entry = ROUTE_MAP.find(r => r.screen === screen);
    p = entry ? entry.path : '/hr-admin';
  }
  return BASE_PATH + p;
}

function pathToScreen(path) {
  let clean = path;
  if (BASE_PATH && clean.startsWith(BASE_PATH)) clean = clean.slice(BASE_PATH.length);
  clean = clean.replace(/\/$/, '') || '/hr-admin';
  const empMatch = clean.match(/^\/hr-admin\/people\/([^/]+)(?:\/([^/]+))?$/);
  if (empMatch) return 'employee-detail:' + empMatch[1] + (empMatch[2] ? ':' + empMatch[2] : '');
  const entry = ROUTE_MAP.find(r => r.path === clean);
  return entry ? entry.screen : 'dashboard';
}

function SettingsModeSidebar({ active, onNav }) {
  const [personalOpen, setPersonalOpen] = useState(true);
  const [companyOpen,  setCompanyOpen]  = useState(true);

  return (
    <React.Fragment>
      <nav style={{ flex: 1, padding: 'var(--space-125) 0', display: 'flex', flexDirection: 'column', gap: 'var(--space-050)', overflow: 'auto' }}>
        <SidebarItem icon="user" label="Personal" onClick={() => setPersonalOpen(o => !o)} chevron chevronOpen={personalOpen} isActive={PERSONAL_IDS.includes(active)} />
        <SidebarAccordion open={personalOpen}>
          <SidebarSub active={active} onNav={onNav} items={[
            { id: 'settings-notifications', label: 'Notifications' },
            { id: 'settings-account',       label: 'Account settings' },
          ]} />
        </SidebarAccordion>

        <SidebarItem icon="building-2" label="Company" onClick={() => setCompanyOpen(o => !o)} chevron chevronOpen={companyOpen} isActive={COMPANY_IDS.includes(active)} />
        <SidebarAccordion open={companyOpen}>
          <SidebarSub active={active} onNav={onNav} items={[
            { id: 'settings-entities',     label: 'Entities' },
            { id: 'settings-budgets',      label: 'Budgets' },
            { id: 'settings-benefits',     label: 'Benefits' },
            { id: 'settings-packages',     label: 'Packages' },
            { id: 'settings-documents',    label: 'Documents' },
            { id: 'settings-timeoff',      label: 'Time off' },
            { id: 'settings-payroll',      label: 'Payroll' },
            { id: 'settings-allowances',   label: 'Allowances' },
            { id: 'settings-expenses',     label: 'Expenses' },
            { id: 'settings-cardrules',    label: 'Payflip Card' },
            { id: 'settings-integrations', label: 'Integrations' },
            { id: 'settings-team',         label: 'Team & access' },
            { id: 'settings-billing',      label: 'Billing' },
          ]} />
        </SidebarAccordion>
      </nav>
    </React.Fragment>
  );
}

const PANEL_DUR = 280;
function Sidebar({ active, onNav, pendingCount, sidebarMode, onSetSidebarMode, appEntity, onSetAppEntity, setupInProgress }) {
  const inSettings = sidebarMode === 'settings';
  const panelStyle = (offset) => ({
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    transform: `translateX(${offset})`,
    transition: `transform ${PANEL_DUR}ms ${EASE_DRAWER}`,
  });

  return (
    <div style={{
      width: 255, flexShrink: 0, background: P.white,
      borderRight: `1px solid ${P.border}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      <div style={{ borderBottom: `1px solid ${P.border}`, flexShrink: 0, position: 'relative', height: 53, opacity: setupInProgress ? 0.35 : 1, transition: `opacity 250ms ${EASE_OUT}`, pointerEvents: setupInProgress ? 'none' : 'auto' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 var(--space-250)', opacity: inSettings ? 0 : 1, transition: `opacity 200ms ${EASE_OUT}`, pointerEvents: inSettings ? 'none' : 'auto' }}>
          <svg width="90" height="22" viewBox="0 0 115 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M45.753 5.26971C48.8202 5.29294 51.0277 7.91867 51.0277 10.5909C51.0277 13.2631 48.8202 15.8888 45.753 15.912H41.8725V22H39.1074V5.26971H45.753ZM45.7065 13.1236C47.1937 13.1236 48.2393 11.8921 48.2393 10.5909C48.2393 9.26639 47.1937 8.03485 45.7065 8.03485H41.8725V13.1236H45.7065ZM60.7159 10.01H63.481V22H60.7159V20.3502C59.8329 21.4656 58.6014 22.1394 57.0677 22.1394C54.1864 22.1394 51.8628 19.4207 51.8628 16.005C51.8628 12.5892 54.1864 9.87054 57.0677 9.87054C58.6014 9.87054 59.8794 10.5909 60.7159 11.683V10.01ZM57.6951 19.3975C59.4146 19.3975 60.7159 17.8871 60.7159 16.005C60.7159 14.1228 59.4146 12.6124 57.6951 12.6124C55.9524 12.6124 54.6511 14.1228 54.6511 16.005C54.6511 17.8871 55.9524 19.3975 57.6951 19.3975ZM77.1976 10.01V21.7444C77.1976 25.2299 74.7346 27.7162 71.4815 27.7162C67.8798 27.7162 65.9512 25.2066 65.8118 22.9062H68.6931C68.879 24.2075 69.8781 25.1369 71.5279 25.1369C73.3404 25.1369 74.4325 23.7195 74.4325 21.8141V20.4432C73.6192 21.4191 72.318 22.1394 70.9238 22.1394C68.1819 22.1394 66.6947 19.9784 66.6947 17.2365V10.01H69.4599V16.8183C69.4599 18.2357 70.552 19.3975 71.9462 19.3975C73.3404 19.3975 74.4325 18.2124 74.4325 16.8183V10.01H77.1976ZM87.1382 10.01V12.4266H84.1639V22H81.3987V12.4266H79.4701V10.01H81.3987V9.12697C81.3987 6.75684 82.9091 5.13029 85.1631 5.13029C86.046 5.13029 86.6037 5.26971 86.9755 5.36265V7.8722C86.7664 7.80249 86.2552 7.6863 85.7672 7.6863C84.8842 7.6863 84.1639 8.01162 84.1639 9.0805V10.01H87.1382ZM92.108 5.26971V22H89.3429V5.26971H92.108ZM96.8158 8.49958C95.7702 8.49958 94.9104 7.66307 94.9104 6.59419C94.9104 5.52531 95.7702 4.66556 96.8158 4.66556C97.9312 4.66556 98.7909 5.52531 98.7909 6.59419C98.7909 7.66307 97.8847 8.49958 96.8158 8.49958ZM98.1868 22H95.4216V10.01H98.1868V22ZM101.595 26.7402V10.01H104.361V11.7295C105.197 10.4282 106.452 9.87054 107.985 9.87054C110.797 9.87054 113.214 12.4498 113.214 16.005C113.214 19.5602 110.797 22.1394 107.985 22.1394C106.452 22.1394 105.127 21.3494 104.361 20.2573V26.7402H101.595ZM107.358 12.5892C105.592 12.5892 104.361 14.1228 104.361 16.005C104.361 17.8871 105.592 19.3975 107.358 19.3975C109.124 19.3975 110.449 17.8871 110.449 16.005C110.449 14.1228 109.124 12.5892 107.358 12.5892Z" fill={P.ink}/>
            <path d="M4.33203 5.57666C6.05531 5.57671 7.54249 7.51885 8.24023 10.3306C8.49527 9.9639 8.77641 9.60597 9.08301 9.26025C12.4138 5.50467 17.5161 4.59001 20.4785 7.21729C21.4856 8.11046 22.1146 9.29844 22.377 10.6245C24.205 7.2415 26.4713 5.13629 27.8652 5.72314C28.6853 6.06841 29.0487 7.28097 28.9775 8.96826C29.5959 6.87093 30.4348 5.53748 31.2529 5.60596C32.5914 5.71859 33.3628 9.54023 32.9756 14.1411C32.5884 18.7414 31.1899 22.3791 29.8516 22.2671C28.5131 22.1545 27.7418 18.3338 28.1289 13.7329C28.1475 13.5121 28.1702 13.2937 28.1934 13.0776C27.9732 13.7849 27.7085 14.514 27.3984 15.2505C25.4779 19.8119 22.573 22.9418 20.9102 22.2417C20.055 21.8815 19.6963 20.5784 19.8096 18.7769C16.4787 22.5311 11.378 23.4448 8.41602 20.8179C8.04583 20.4895 7.72679 20.1213 7.45801 19.7212C6.66956 21.3081 5.56123 22.2963 4.33203 22.2964C1.93956 22.2964 7.5582e-05 18.554 0 13.937C0 9.31987 1.93951 5.57666 4.33203 5.57666Z" fill={P.ink}/>
          </svg>
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', opacity: inSettings ? 1 : 0, transition: `opacity 200ms ${EASE_OUT}`, pointerEvents: inSettings ? 'auto' : 'none' }}>
          <button onClick={() => { onSetSidebarMode('app'); onNav('dashboard'); }} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', padding: '0 var(--space-250)', width: '100%', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
            <Icon name="arrow-left" size={14} color={P.inkSoft} strokeWidth={1.75} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>Back to app</span>
          </button>
        </div>
      </div>
      <div style={{ opacity: setupInProgress ? 0.35 : 1, transition: `opacity 250ms ${EASE_OUT}`, pointerEvents: setupInProgress ? 'none' : 'auto' }}>
        <EntitySwitcher value={appEntity} onChange={onSetAppEntity} mode="app" />
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={panelStyle(inSettings ? '-100%' : '0%')}>
          <AppModeSidebar
            active={active}
            onNav={onNav}
            pendingCount={pendingCount}
            onEnterSettings={() => { onSetSidebarMode('settings'); onNav('settings-notifications'); }}
            setupInProgress={setupInProgress}
          />
        </div>
        <div style={panelStyle(inSettings ? '0%' : '100%')}>
          <SettingsModeSidebar
            active={active}
            onNav={onNav}
          />
        </div>
      </div>
      <div style={{ opacity: setupInProgress ? 0.35 : 1, transition: `opacity 250ms ${EASE_OUT}`, pointerEvents: setupInProgress ? 'none' : 'auto' }}>
        <AdminProfileFooter />
      </div>
    </div>
  );
}

// ── Action menu (···) ──────────────────────────────────────────────────────
function ActionMenu({ req, onApprove, onDecline, onViewDetails, onEdit, onCancel, onViewInCalendar }) {
  const [open, setOpen] = useState(false);
  const { rendered: menuRendered, visible: menuVisible } = usePopoverTransition(open);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const items = [
    req?.status === 'pending' && onApprove && { icon: 'CheckCircle', label: 'Approve', fn: onApprove, color: '#166534' },
    req?.status === 'pending' && onDecline && { icon: 'XCircle', label: 'Decline', fn: onDecline, color: P.dangerDark },
    onViewDetails && { icon: 'Eye', label: 'View details', fn: onViewDetails, color: P.ink },
    onViewInCalendar && { icon: 'Calendar', label: 'View in calendar', fn: () => onViewInCalendar(req), color: P.ink },
    onEdit && { icon: 'Pencil', label: 'Edit', fn: onEdit, color: P.ink },
    req?.document && { icon: 'Download', label: 'Download document', fn: () => {}, color: P.ink },
    req?.status === 'approved' && { icon: 'Trash2', label: 'Cancel absence', fn: onCancel, color: P.dangerDark },
  ].filter(Boolean);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }} style={{
        width: 30, height: 30, borderRadius: 6,
        border: `1px solid ${open ? P.ink : P.border}`,
        background: open ? '#eff3ff' : 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="Ellipsis" size={14} color={open ? P.ink : P.inkSoft} />
      </button>
      {menuRendered && (
        <div style={{
          position: 'absolute', right: 0, top: 36, zIndex: 50,
          background: P.white, border: `1px solid ${P.border}`, borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.10)', width: 164, overflow: 'hidden',
          ...popoverStyle(menuVisible, 'top right'),
        }}>
          {items.map(({ icon, label, fn, color }) => (
            <button key={label} onClick={(e) => { e.stopPropagation(); setOpen(false); fn(); }} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-100)',
              width: '100%', padding: 'var(--space-100) var(--space-150)', border: 'none', background: 'transparent',
              cursor: 'pointer', textAlign: 'left',
            }}
            onMouseEnter={e => e.currentTarget.style.background = P.bg}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Icon name={icon} size={14} color={color} strokeWidth={1.75} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: label === 'Cancel absence' ? P.dangerDark : P.ink }}>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reason modal (decline / cancel) ───────────────────────────────────────
function ReasonModal({ title, description, confirmLabel, confirmColor = P.danger, onConfirm, onClose }) {
  const [reason, setReason] = useState('');
  return (
    <ModalShell title={title} onClose={onClose}
      footer={close => (
        <div style={{ padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-125)', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={close}>Back</Button>
          <Button variant="primary" disabled={!reason.trim()} onClick={() => { onConfirm(reason.trim()); close(); }}
            style={{ padding: 'var(--space-100) var(--space-250)', background: reason.trim() ? confirmColor : P.border, color: reason.trim() ? '#fff' : P.inkFaint }}>
            {confirmLabel}
          </Button>
        </div>
      )}>
      <div style={{ padding: 'var(--space-250) var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
        {description && (
          <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.5 }}>{description}</p>
        )}
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>
            Reason <span style={{ fontWeight: 400, color: P.inkFaint }}>(required)</span>
          </label>
          <textarea
            autoFocus
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="Explain why this absence is being declined or cancelled…"
            style={{
              width: '100%', padding: 'var(--space-100) var(--space-125)', borderRadius: 7,
              border: `1px solid ${P.border}`,
              fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink,
              outline: 'none', resize: 'none', lineHeight: 1.5,
            }}
          />
        </div>
      </div>
    </ModalShell>
  );
}

// ── Calendar right-side drawer ────────────────────────────────────────────
// A no-overlay panel anchored to the right edge. Two states (detail / edit)
// slide horizontally within a fixed header and scrollable content area.
function CalendarDrawer({ req, requests, onClose, onApprove, onDecline, onCancel, onSave, initialDeclineMode }) {
  const emp = EMPLOYEES[req.employee] || { name: req.employee, entitlement: 25, department: '' };
  const isPending = req.status === 'pending';
  const overlapping = getOverlapping(req, requests).filter(r => EMPLOYEES[r.employee]?.department === emp.department);
  const teamSize = Object.values(EMPLOYEES).filter(e => e.department === emp.department).length;
  const teamRisk = overlapping.length >= 2;

  const { visible, close, closing } = useModalTransition(onClose, SHEET_CLOSE_DUR);
  const [avatarTip, setAvatarTip] = React.useState(null);
  const [teamExpanded, setTeamExpanded] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [cancelMode, setCancelMode] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const [declineMode, setDeclineMode] = React.useState(!!initialDeclineMode);
  const [declineReason, setDeclineReason] = React.useState('');
  const [docFullscreen, setDocFullscreen] = React.useState(false);

  // Edit form state — initialized lazily via enterEdit()
  const [editType, setEditType] = React.useState(req.type);
  const [editNote, setEditNote] = React.useState(req.note || '');
  const [editRangeFrom, setEditRangeFrom] = React.useState(() => {
    const d = parseDisplayDate(req.startDate); return d ? isoDate(d) : '';
  });
  const [editRangeTo, setEditRangeTo] = React.useState(() => {
    const d = parseDisplayDate(req.endDate || req.startDate); return d ? isoDate(d) : '';
  });
  const [editPickedDates, setEditPickedDates] = React.useState(() =>
    req._selectedDates ? new Set(req._selectedDates) : new Set()
  );
  const [editHalfDay, setEditHalfDay] = React.useState(req._halfDay || {});
  const [editErrors, setEditErrors] = React.useState({});

  React.useEffect(() => {
    if (!editRangeFrom || !editRangeTo) return;
    const from = new Date(editRangeFrom + 'T00:00:00');
    const to   = new Date(editRangeTo   + 'T00:00:00');
    if (from > to) return;
    const dates = new Set();
    for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      if (_collectiveSet.has(isoDate(d))) continue;
      if (_holidaySet.has(isoDate(d))) continue;
      dates.add(isoDate(d));
    }
    setEditPickedDates(dates);
    setEditErrors({});
  }, [editRangeFrom, editRangeTo]);

  const sortedPicked = [...editPickedDates].sort();
  const halfDayDeduction = Object.entries(editHalfDay)
    .filter(([iso, v]) => editPickedDates.has(iso) && (v === 'am' || v === 'pm')).length * 0.5;
  const editDays = editPickedDates.size - halfDayDeduction;

  const enterEdit = () => {
    setEditType(req.type);
    setEditNote(req.note || '');
    const from = parseDisplayDate(req.startDate);
    const to   = parseDisplayDate(req.endDate || req.startDate);
    setEditRangeFrom(from ? isoDate(from) : '');
    setEditRangeTo(to ? isoDate(to) : '');
    setEditPickedDates(req._selectedDates ? new Set(req._selectedDates) : new Set());
    setEditHalfDay(req._halfDay || {});
    setEditErrors({});
    setEditMode(true);
  };
  const exitEdit = () => { setEditMode(false); setCancelMode(false); };
  const enterCancel = () => { setCancelReason(''); setCancelMode(true); };
  const exitCancel = () => setCancelMode(false);
  const enterDecline = () => { setDeclineReason(''); setDeclineMode(true); };
  const exitDecline = () => setDeclineMode(false);

  const handleSaveEdit = () => {
    if (editPickedDates.size === 0) { setEditErrors({ dates: 'Please select dates' }); return; }
    setEditErrors({});
    const fmtD = (d) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    const startD = new Date(sortedPicked[0] + 'T00:00:00');
    const endD   = new Date(sortedPicked[sortedPicked.length - 1] + 'T00:00:00');
    const activeHD = Object.fromEntries(Object.entries(editHalfDay).filter(([k]) => editPickedDates.has(k)));
    const updatedReq = {
      ...req,
      type: editType,
      startDate: fmtD(startD),
      endDate:   fmtD(endD),
      days: editDays,
      note: editNote || undefined,
      _selectedDates: sortedPicked,
      ...(Object.keys(activeHD).length > 0 ? { _halfDay: activeHD } : {}),
    };
    onSave(updatedReq);
    exitEdit();
  };

  // Status pill (must be before detailItems)
  const pillData = {
    approved: { bg: P.successBorder, color: P.successDark, label: 'Approved' },
    rejected: { bg: P.dangerBorder, color: P.dangerDark, label: 'Declined' },
    pending:  { bg: P.warningBorder, color: P.warningDark, label: 'Pending'  },
  };
  const pill = pillData[req.status] || pillData.pending;

  // Detail content helpers
  const heroDateStr = req.startDate === req.endDate ? req.startDate : `${req.startDate} – ${req.endDate}`;
  const durationStr = req.days === 0.5 ? '½ day' : req.days === 1 ? '1 day' : `${req.days} days`;

  const labelStyle = { flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, whiteSpace: 'nowrap' };
  const valueStyle = { flex: 1, minWidth: 0, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 'var(--space-100)' };
  const TableRow = ({ label, icon, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-200) var(--space-300)', gap: 'var(--space-200)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', flexShrink: 0, width: 160 }}>
        {icon && <Icon name={icon} size={14} color={P.inkSoft} strokeWidth={1.75} style={{ flexShrink: 0 }} />}
        <div style={labelStyle}>{label}</div>
      </div>
      <div style={valueStyle}>{children}</div>
    </div>
  );

  const SectionHeader = ({ first = false, children }) => (
    <>
      {!first && <div style={{ height: 1, background: P.border }} />}
      <div style={{ padding: 'var(--space-400) var(--space-300) var(--space-075)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {children}
      </div>
    </>
  );

  const Group = ({ children }) => {
    const items = React.Children.toArray(children).filter(Boolean);
    return <div style={{ paddingBottom: 'var(--space-200)' }}>{items}</div>;
  };

  const hasOverlap = overlapping.length > 0;
  const allTeamMemberIds = Object.entries(EMPLOYEES)
    .filter(([, e]) => e.department === emp.department)
    .map(([id]) => id);

  // Overlap banner name list: "Sara L., Jonas G., and 1 other"
  const overlapPeers = overlapping.slice(0, 2).map(r => {
    const e = EMPLOYEES[r.employee];
    if (!e) return r.employee;
    const [first, ...rest] = e.name.split(' ');
    return first + (rest[0] ? ' ' + rest[0][0] + '.' : '');
  });
  const overlapExtra = overlapping.length - overlapPeers.length;
  const overlapNamesStr = overlapPeers.length === 0 ? '' :
    overlapExtra > 0 ? overlapPeers.join(', ') + `, and ${overlapExtra} other${overlapExtra > 1 ? 's' : ''}` :
    overlapPeers.length === 2 ? `${overlapPeers[0]} and ${overlapPeers[1]}` :
    overlapPeers[0];

  const detailContent = (
    <div>
      <SectionHeader first>Request</SectionHeader>
      <Group>
        <TableRow label="Requested by" icon="user">
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</span>
          <Avatar employeeId={req.employee} size={22} />
        </TableRow>
        <TableRow label="When" icon="calendar">
          {heroDateStr} · {durationStr}
        </TableRow>
        <TableRow label="Type" icon="tag">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-100)' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: LEAVE_COLORS[req.type] || P.inkFaint, border: `1.5px solid ${LEAVE_BORDER_COLORS[req.type] || P.border}`, flexShrink: 0 }} />
            {req.type}
          </span>
        </TableRow>
        <TableRow label="Department" icon="building-2">
          {emp.department}
        </TableRow>
        {req.submittedAt && (
          <TableRow label="Requested on" icon="clock">
            {req.submittedAt}
          </TableRow>
        )}
      </Group>

      {(req.note || (ATTACHMENT_RULES[req.type] && !req.document)) && <>
        <SectionHeader>Supporting info</SectionHeader>
        <Group>
          {ATTACHMENT_RULES[req.type] && !req.document && (
            <TableRow label="Document" icon="shield">
              <DotPill dot={false} color={P.warningDark} bg={P.warningBg} border={P.warningBorder}>Missing</DotPill>
              <span style={{ fontWeight: 400, color: P.inkSoft }}>{ATTACHMENT_RULES[req.type].label}</span>
            </TableRow>
          )}
          {req.note && (
            <TableRow label="Note" icon="message-square">
              <span style={{ fontStyle: 'italic', lineHeight: 1.4, textAlign: 'right' }}>"{req.note}"</span>
            </TableRow>
          )}
        </Group>
      </>}

      <div style={{ height: 1, background: P.border }} />
      {(() => {
        const offIds = new Set(overlapping.map(r => r.employee));
        const awayLabel = overlapping.length === 1
          ? '1 teammate away during this window'
          : `${overlapping.length} teammates away during this window`;
        return (
          <div>
            <div style={{ padding: 'var(--space-400) var(--space-300) var(--space-075)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Team availability
            </div>
            {hasOverlap ? (
              <>
                <div style={{ margin: 'var(--space-100) var(--space-200) var(--space-150)', padding: 'var(--space-125) var(--space-150)', background: P.warningBg, border: `1px solid ${P.warningBorder}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
                  <Icon name="alert-triangle" size={13} color={P.warningDark} strokeWidth={2} style={{ flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-body-xs)', color: P.warningDark }}>{awayLabel}</span>
                </div>
                <div style={{ margin: '0 var(--space-200) var(--space-200)', border: `1px solid ${P.border}`, borderRadius: 10, overflow: 'hidden' }}>
                  {[...allTeamMemberIds].filter(id => offIds.has(id)).map((empId, i) => {
                    const oe = EMPLOYEES[empId];
                    const offReq = overlapping.find(r => r.employee === empId);
                    const dateStr = offReq.startDate === offReq.endDate ? offReq.startDate : `${offReq.startDate} – ${offReq.endDate}`;
                    return (
                      <React.Fragment key={empId}>
                        {i > 0 && <div style={{ height: 1, background: P.border }} />}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-150) var(--space-200)' }}>
                          <Avatar employeeId={empId} size={20} style={{ flexShrink: 0 }} />
                          <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.ink }}>{oe?.name}</span>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>{dateStr}</span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ padding: 'var(--space-075) var(--space-300) var(--space-200)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>All teammates available</div>
            )}
          </div>
        );
      })()}

      <div style={{ height: 16 }} />
    </div>
  );

  // Slide transforms
  const SLIDE_DUR = 300;
  const secondPanel = editMode || cancelMode || declineMode;
  const detailSlide = secondPanel ? 'translateX(-100%)' : 'translateX(0)';
  const editSlide   = secondPanel ? 'translateX(0)'     : 'translateX(100%)';
  const slideTransition = `transform ${SLIDE_DUR}ms ${EASE_DRAWER}`;

  const editInputStyle = {
    width: '100%', padding: 'var(--space-100) var(--space-125)', borderRadius: 7, border: `1px solid ${P.border}`,
    fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', background: P.white,
    boxSizing: 'border-box',
  };
  const editLabelStyle = {
    display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)',
    color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-075)',
  };
  const editDurStr = editDays === 0.5 ? '½ day' : editDays === 1 ? '1 day' : `${editDays} days`;

  const docSrc = req.document ? req.document.replace(/\.pdf$/, '.svg') : null;
  const docContent = docSrc && (
    <img src={docSrc} style={{ display: 'block', width: '100%', borderRadius: 4, boxShadow: '0 2px 12px rgba(15,13,40,0.12)' }} alt="Document" />
  );
  const docPill = req.document && (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 0' }}>
      <div style={{ display: 'flex', background: P.white, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)' }}>
        <button onClick={() => setDocFullscreen(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px 0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, whiteSpace: 'nowrap' }}>
          <Icon name="expand" size={14} color={P.ink} strokeWidth={1.75} />
          Full screen
        </button>
        {docSrc && (<>
          <div style={{ width: 1, background: P.border, margin: '8px 0' }} />
          <a href={docSrc} download={req.document} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', textDecoration: 'none', cursor: 'pointer', borderRadius: '0 8px 8px 0', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, whiteSpace: 'nowrap' }}>
            <Icon name="download" size={14} color={P.ink} strokeWidth={1.75} />
            Download
          </a>
        </>)}
      </div>
    </div>
  );
  const docPanel = req.document && (
    <div style={{ width: 500, borderLeft: `1px solid ${P.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ flex: 1, overflowY: 'auto', background: '#e8e7e5', padding: 40, paddingBottom: 40 }}>
        {docContent}
        {docPill}
      </div>
    </div>
  );
  const docFullscreenModal = docFullscreen && (
    <div onClick={() => setDocFullscreen(false)} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '48px 24px 24px', overflowY: 'auto' }}>
      <div style={{ position: 'fixed', top: 16, right: 16, display: 'flex', gap: 8 }}>
        {docSrc && (
          <a href={docSrc} download={req.document} onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', cursor: 'pointer' }}>
            <Icon name="download" size={13} color="#fff" strokeWidth={2} /> Download
          </a>
        )}
        <button onClick={() => setDocFullscreen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer' }}>
          <Icon name="X" size={16} color="#fff" strokeWidth={2} />
        </button>
      </div>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 680 }}>
        {docContent}
      </div>
    </div>
  );

  return (
    <>
    <DrawerShell onClose={onClose}
      title={editMode ? 'Edit request' : cancelMode ? 'Cancel absence' : declineMode ? 'Decline request' : 'Request details'}
      onBack={secondPanel ? (editMode ? exitEdit : cancelMode ? exitCancel : exitDecline) : undefined}
      width={req.document ? 900 : 480}>
      {close => (
        <>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Clipping window for the two sliding panels */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>

          {/* Detail panel */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', transform: detailSlide, transition: slideTransition }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {detailContent}
            </div>
            {(isPending || req.status === 'approved') && (
              <div style={{ flexShrink: 0, padding: 'var(--space-150) var(--space-250)', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-125)' }}>
                {isPending && <>
                  <button onClick={enterDecline} style={{ flex: 1, padding: 'var(--space-125) 0', borderRadius: 10, border: '1px solid var(--alert-200)', background: P.dangerBg, color: P.danger, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-075)' }}>
                    <Icon name="X" size={13} color={P.danger} strokeWidth={2.5} /> Decline
                  </button>
                  <button onClick={() => onApprove(req.id)} style={{ flex: 1, padding: 'var(--space-125) 0', borderRadius: 10, border: 'none', background: P.ink, color: P.white, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-075)' }}>
                    <Icon name="Check" size={13} color={P.white} strokeWidth={2.5} /> Approve
                  </button>
                </>}
                {req.status === 'approved' && <>
                  <button onClick={enterEdit} style={{ flex: 1, padding: 'var(--space-125) 0', borderRadius: 10, border: `1px solid ${P.border}`, background: 'transparent', color: P.inkSoft, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Edit</button>
                  <button onClick={enterCancel} style={{ flex: 1, padding: 'var(--space-125) 0', borderRadius: 10, border: '1px solid var(--alert-200)', background: P.dangerBg, color: P.danger, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Cancel absence</button>
                </>}
              </div>
            )}
          </div>

          {/* Edit / Cancel / Decline panel */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', transform: editSlide, transition: slideTransition }}>
            {declineMode ? (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-250)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.5 }}>
                    You're declining <strong style={{ color: P.ink }}>{emp.name}</strong>'s {req.type} ({heroDateStr}).
                  </p>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-075)' }}>Reason <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
                    <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} placeholder="Explain why this request is being declined…" rows={3} style={{ width: '100%', padding: 'var(--space-125) var(--space-150)', borderRadius: 8, border: `1px solid ${P.border}`, background: P.bg, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, resize: 'none', lineHeight: 1.5, boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ flexShrink: 0, padding: 'var(--space-150) var(--space-250)', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-125)' }}>
                  <button onClick={exitDecline} style={{ flex: 1, padding: 'var(--space-125) 0', borderRadius: 10, border: `1px solid ${P.border}`, background: 'transparent', color: P.inkSoft, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Go back</button>
                  <button onClick={() => { onDecline(req.id, declineReason); close(); }} style={{ flex: 2, padding: 'var(--space-125) 0', borderRadius: 10, border: 'none', background: P.danger, color: P.white, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Confirm decline</button>
                </div>
              </>
            ) : cancelMode ? (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-250)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.5 }}>
                    You're cancelling <strong style={{ color: P.ink }}>{emp.name}</strong>'s {req.type} ({heroDateStr}). This cannot be undone.
                  </p>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-075)' }}>Reason <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
                    <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Add a reason…" rows={3} style={{ width: '100%', padding: 'var(--space-125) var(--space-150)', borderRadius: 8, border: `1px solid ${P.border}`, background: P.bg, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, resize: 'none', lineHeight: 1.5, boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ flexShrink: 0, padding: 'var(--space-150) var(--space-250)', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-125)' }}>
                  <button onClick={exitCancel} style={{ flex: 1, padding: 'var(--space-125) 0', borderRadius: 10, border: `1px solid ${P.border}`, background: 'transparent', color: P.inkSoft, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Go back</button>
                  <button onClick={() => { onCancel(req.id, cancelReason); close(); }} style={{ flex: 2, padding: 'var(--space-125) 0', borderRadius: 10, border: 'none', background: P.danger, color: P.white, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Confirm cancellation</button>
                </div>
              </>
            ) : (
            <>
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-250)', display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
              {/* Leave type */}
              <div>
                <label style={editLabelStyle}>Leave type</label>
                <SelectField value={editType} onChange={e => setEditType(e.target.value)} style={{ ...editInputStyle }}>
                  {ALL_LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </SelectField>
              </div>
              {/* Date range */}
              <div>
                <label style={editLabelStyle}>Dates</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-100)' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginBottom: 'var(--space-050)' }}>From</div>
                    <input type="date" value={editRangeFrom} onChange={e => setEditRangeFrom(e.target.value)} style={editInputStyle} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginBottom: 'var(--space-050)' }}>To</div>
                    <input type="date" value={editRangeTo} onChange={e => setEditRangeTo(e.target.value)} style={editInputStyle} />
                  </div>
                </div>
                {editPickedDates.size > 0 && !editErrors.dates && (
                  <div style={{ marginTop: 'var(--space-100)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>
                    {editDurStr} — {editPickedDates.size} working {editPickedDates.size === 1 ? 'day' : 'days'}
                  </div>
                )}
                {editErrors.dates && (
                  <div style={{ marginTop: 'var(--space-075)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.danger }}>{editErrors.dates}</div>
                )}
              </div>
              {/* Note */}
              <div>
                <label style={editLabelStyle}>Note <span style={{ textTransform: 'none', fontWeight: 400, color: P.inkFaint }}>(optional)</span></label>
                <textarea value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="Add a note…" rows={3} style={{ ...editInputStyle, resize: 'none', lineHeight: 1.5 }} />
              </div>
            </div>
            <div style={{ flexShrink: 0, padding: 'var(--space-150) var(--space-250)', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-125)' }}>
              <button onClick={exitEdit} style={{ flex: 1, padding: 'var(--space-125) 0', borderRadius: 10, border: `1px solid ${P.border}`, background: 'transparent', color: P.inkSoft, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Cancel</button>
              <button onClick={handleSaveEdit} style={{ flex: 2, padding: 'var(--space-125) 0', borderRadius: 10, border: 'none', background: P.ink, color: P.white, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Save changes</button>
            </div>
            </>
            )}
          </div>

        </div>
        {docPanel}
        </div>

        {avatarTip && ReactDOM.createPortal(
          <div style={{ position: 'fixed', zIndex: 9999, left: avatarTip.x, top: avatarTip.y - 8, transform: 'translate(-50%, -100%)', background: P.ink, color: P.white, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', padding: 'var(--space-075) var(--space-125)', borderRadius: 8, pointerEvents: 'none', whiteSpace: 'nowrap', lineHeight: 1.5 }}>
            <div>{avatarTip.name}</div>
            {avatarTip.offReq ? (
              <div style={{ fontWeight: 400, color: 'rgba(255,255,255,0.65)', fontSize: 'var(--fs-body-xs)', marginTop: 'var(--space-025)' }}>
                {avatarTip.offReq.type} · {avatarTip.offReq.startDate === avatarTip.offReq.endDate ? avatarTip.offReq.startDate : `${avatarTip.offReq.startDate} – ${avatarTip.offReq.endDate}`}
              </div>
            ) : (
              <div style={{ fontWeight: 400, color: 'rgba(255,255,255,0.65)', fontSize: 'var(--fs-body-xs)', marginTop: 'var(--space-025)' }}>Available</div>
            )}
          </div>,
          document.body
        )}
        </>
      )}
    </DrawerShell>
    {docFullscreenModal}
    </>
  );
}

// ── Select with chevron ────────────────────────────────────────────────────
function SelectField({ value, onChange, children, style }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={onChange} style={{ ...style, appearance: 'none', paddingRight: 'var(--space-400)' }}>
        {children}
      </select>
      <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
  );
}

function SettingsSelect({ value, onChange, opts }) {
  const [open, setOpen] = useState(false);
  const { rendered: menuRendered, visible: menuVisible } = usePopoverTransition(open);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  const selected = opts.find(o => o.value === value);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-100)',
        width: '100%', padding: 'var(--space-100) var(--space-150)', borderRadius: 8,
        border: `1px solid ${open ? P.borderStrong : P.border}`, background: P.white, color: P.ink,
        cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', textAlign: 'left', boxSizing: 'border-box',
      }}>
        <span>{selected?.label ?? '—'}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transition: `transform 150ms ${EASE_OUT}`, transform: open ? 'rotate(180deg)' : 'none' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {menuRendered && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
          background: P.white, border: `1px solid ${P.border}`, borderRadius: 10,
          boxShadow: '0 4px 16px rgba(15,13,40,0.10)', overflow: 'hidden',
          ...popoverStyle(menuVisible, 'top left'),
        }}>
          {opts.map(o => (
            <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: 'var(--space-100) var(--space-150)',
              border: 'none', cursor: 'pointer', background: value === o.value ? P.bg : 'transparent',
              fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink,
            }}>{o.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function EmployeeCombobox({ value, onChange, employees, error, autoFocus }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const { rendered: listRendered, visible: listVisible } = usePopoverTransition(open);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);

  const selectedEmp = employees.find(([id]) => id === value)?.[1];

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(([, emp]) =>
      emp.name.toLowerCase().includes(q) || (emp.department || '').toLowerCase().includes(q)
    );
  }, [query, employees]);

  React.useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.children;
    if (items[highlighted]) items[highlighted].scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  const handleSelect = (id) => { onChange(id); setQuery(''); setOpen(false); };
  const handleFocus = () => { setQuery(''); setOpen(true); setHighlighted(0); };
  const handleBlur = () => { setTimeout(() => { setOpen(false); setQuery(''); }, 150); };
  const handleKeyDown = (e) => {
    if (!open) { setOpen(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[highlighted]) handleSelect(filtered[highlighted][0]); }
    else if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-100)', padding: 'var(--space-100) var(--space-125)', borderRadius: 7,
        border: `1px solid ${error ? P.danger : open ? P.borderStrong : P.border}`,
        background: P.white, boxSizing: 'border-box',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref={inputRef} autoFocus={autoFocus}
          value={open ? query : (selectedEmp?.name || '')}
          onChange={e => { setQuery(e.target.value); setHighlighted(0); if (!open) setOpen(true); if (!e.target.value) onChange(''); }}
          onFocus={handleFocus} onBlur={handleBlur} onKeyDown={handleKeyDown}
          placeholder="Search by name or department…"
          style={{ flex: 1, border: 'none', outline: 'none', padding: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, background: 'transparent', minWidth: 0 }}
        />
        {value && !open ? (
          <button onMouseDown={e => { e.preventDefault(); onChange(''); inputRef.current?.focus(); }}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        )}
      </div>
      {listRendered && (
        <div ref={listRef} style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 400,
          background: P.white, borderRadius: 8, border: `1px solid ${P.border}`,
          boxShadow: '0 4px 20px rgba(15,13,40,0.12)', maxHeight: 220, overflowY: 'auto',
          ...popoverStyle(listVisible, 'top'),
        }}>
          {filtered.length > 0 ? filtered.map(([id, emp], idx) => (
            <div key={id} onMouseDown={() => handleSelect(id)} onMouseEnter={() => setHighlighted(idx)}
              style={{ padding: 'var(--space-100) var(--space-150)', cursor: 'pointer', background: idx === highlighted ? P.bg : 'transparent', display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, flex: 1 }}>{emp.name}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, flexShrink: 0 }}>{emp.department}</span>
            </div>
          )) : (
            <div style={{ padding: 'var(--space-200) var(--space-150)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkFaint, textAlign: 'center' }}>No employees found</div>
          )}
        </div>
      )}
    </div>
  );
}

function DateInput({ value, onChange, min, placeholder = 'Select date', borderColor }) {
  const ref = React.useRef(null);
  const fmt = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return new Date(+y, +m - 1, +d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };
  const open = () => { try { ref.current?.showPicker(); } catch(e) { ref.current?.focus(); } };
  return (
    <div onClick={open} style={{
      position: 'relative', display: 'flex', alignItems: 'center', gap: 'var(--space-100)',
      padding: 'var(--space-100) var(--space-125)', borderRadius: 7, border: `1px solid ${borderColor || P.border}`,
      background: P.white, cursor: 'pointer', userSelect: 'none', minHeight: 36,
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={value ? P.inkSoft : P.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, lineHeight: 1 }}>
        {value ? fmt(value) : placeholder}
      </span>
      <input
        ref={ref} type="date" value={value} min={min} onChange={onChange}
        style={{ position: 'absolute', width: 0, height: 0, opacity: 0, border: 'none', padding: 0, pointerEvents: 'none' }}
      />
    </div>
  );
}

// ── Half-day segmented picker ─────────────────────────────────────────────
const ADMIN_HALF_OPTS = ['full', 'am', 'pm'];
const ADMIN_HALF_LABELS = { full: 'Full', am: 'AM', pm: 'PM' };
function HalfDayPickerAdmin({ value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--space-050)', background: '#EBEBED', borderRadius: 14, gap: 'var(--space-025)' }}>
      {ADMIN_HALF_OPTS.map(opt => {
        const active = value === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            padding: 'var(--space-050) var(--space-125)', borderRadius: 11, border: 'none',
            background: active ? '#fff' : 'transparent',
            boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            fontFamily: 'var(--font-display)', fontWeight: active ? 700 : 500,
            fontSize: 'var(--fs-body-xs)', color: active ? P.ink : P.inkSoft,
            cursor: 'pointer',
          }}>{ADMIN_HALF_LABELS[opt]}</button>
        );
      })}
    </div>
  );
}

// ── Inline calendar for date range picking ────────────────────────────────
function ModalCalendar({ startDate, endDate, focusedField, onDateTap, pickedDates, selectionMode, halfDay }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const initial = startDate || today;
  const [month, setMonth] = useState(initial.getMonth());
  const [year, setYear]   = useState(initial.getFullYear());
  const isPick = selectionMode === 'pick';
  const rangeBg = '#EAD6F7';

  const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const first = new Date(year, month, 1);
  let startCol = first.getDay() - 1;
  if (startCol < 0) startCol = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const sameDay = (a, b) => a && b && isoDate(a) === isoDate(b);
  const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;
  const isHoliday = (d) => _holidaySet.has(isoDate(d));
  const isCollective = (d) => _collectiveSet.has(isoDate(d));
  const isDisabled = (d) => isWeekend(d) || isHoliday(d) || isCollective(d);
  const isInRange = (d) => !isPick && startDate && endDate && d > startDate && d < endDate;
  const isStart = (d) => !isPick && sameDay(d, startDate);
  const isEnd = (d) => !isPick && sameDay(d, endDate);
  const isPicked = (d) => isPick && pickedDates && pickedDates.has(isoDate(d));
  const isToday = (d) => sameDay(d, today);

  const findWork = (d, dir) => {
    for (let step = 1; step <= 4; step++) {
      const nd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + dir * step);
      if (!isWeekend(nd) && !isHoliday(nd) && !isCollective(nd)) return isoDate(nd);
    }
    return null;
  };

  const prevMonth = () => { setMonth(m => m === 0 ? (setYear(y => y - 1), 11) : m - 1); };
  const nextMonth = () => { setMonth(m => m === 11 ? (setYear(y => y + 1), 0) : m + 1); };

  return (
    <div style={{ borderRadius: 8, border: `1px solid ${P.border}`, padding: 'var(--space-150) var(--space-200)' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-125)' }}>
        <button onClick={prevMonth} style={{ width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-sm)', color: P.ink }}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button onClick={nextMonth} style={{ width: 28, height: 28, border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 'var(--space-050)' }}>
        {dayNames.map(dn => (
          <div key={dn} style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, padding: 'var(--space-050) 0', textTransform: 'uppercase' }}>{dn}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const disabled = isDisabled(d);
          const picked = isPicked(d);
          const selStart = isStart(d);
          const selEnd = isEnd(d);
          const sel = picked || selStart || selEnd;
          const inRange = isInRange(d) && !sel;
          const hasRange = !isPick && startDate && endDate && !sameDay(startDate, endDate);

          // Pick mode: adjacency + weekend bridging for range highlight
          let prevAdj = false, nextAdj = false, bridged = false;
          if (isPick) {
            const prevIso = isoDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
            const nextIso = isoDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
            if (picked) {
              const pw = findWork(d, -1);
              const nw = findWork(d, 1);
              prevAdj = !!(pickedDates.has(prevIso) || (pw && pw !== prevIso && pickedDates.has(pw)));
              nextAdj = !!(pickedDates.has(nextIso) || (nw && nw !== nextIso && pickedDates.has(nw)));
            }
            if (disabled && pickedDates) {
              const pw = findWork(d, -1);
              const nw = findWork(d, 1);
              bridged = !!(pw && nw && pickedDates.has(pw) && pickedDates.has(nw));
            }
          }
          const isMidRange = isPick && picked && prevAdj && nextAdj;

          const halfDayVal = isPick && picked && halfDay ? halfDay[isoDate(d)] : null;

          let btnBg = 'transparent';
          let color = P.ink;
          let fontWeight = 500;
          if (halfDayVal === 'am') {
            btnBg = `linear-gradient(to bottom, ${P.action} 50%, rgba(34,10,53,0.45) 50%)`;
            color = '#fff'; fontWeight = 700;
          } else if (halfDayVal === 'pm') {
            btnBg = `linear-gradient(to bottom, rgba(34,10,53,0.45) 50%, ${P.action} 50%)`;
            color = '#fff'; fontWeight = 700;
          } else if (isMidRange) { fontWeight = 700; }
          else if (sel) { btnBg = P.action; color = '#fff'; fontWeight = 700; }
          else if (disabled) { color = '#c5c9d0'; }
          else if (inRange) { fontWeight = 600; }

          let wrapBg = 'transparent';
          if (isPick) {
            if (bridged) wrapBg = rangeBg;
            else if (picked) {
              if (prevAdj && nextAdj) wrapBg = rangeBg;
              else if (!prevAdj && nextAdj) wrapBg = `linear-gradient(to right, transparent 50%, ${rangeBg} 50%)`;
              else if (prevAdj && !nextAdj) wrapBg = `linear-gradient(to left, transparent 50%, ${rangeBg} 50%)`;
            }
          } else {
            if (inRange) wrapBg = rangeBg;
            else if (selStart && hasRange) wrapBg = `linear-gradient(to right, transparent 50%, ${rangeBg} 50%)`;
            else if (selEnd && hasRange) wrapBg = `linear-gradient(to left, transparent 50%, ${rangeBg} 50%)`;
          }

          return (
            <div key={isoDate(d)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: wrapBg }}>
              <button onClick={() => !disabled && onDateTap(d)} style={{
                width: 32, height: 32, border: 'none', background: btnBg,
                borderRadius: (sel && !isMidRange) || halfDayVal ? '50%' : 6, cursor: disabled ? 'default' : 'pointer',
                fontFamily: 'var(--font-display)', fontWeight, fontSize: 'var(--fs-body-xs)', color,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                boxShadow: isToday(d) && !sel ? `inset 0 0 0 1.5px ${P.action}` : 'none',
              }}>
                {d.getDate()}
                {isHoliday(d) && !sel && (
                  <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: 2, background: '#e89a3c' }} />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Add / Edit time off modal ──────────────────────────────────────────────
function AddTimeOffModal({ existing, onClose, onSave, requests = [], defaultDate, defaultEmployee, defaultHalfDay }) {
  const isEdit = !!existing?.id;
  const lockEmployee = existing?._lockEmployee;
  const [empId, setEmpId]     = useState(existing?.employee || defaultEmployee || '');
  const [type, setType]       = useState(existing?.type || 'Statutory annual leave');
  const [specialReason, setSpecialReason] = useState(existing?._specialReason || '');
  const [specialWho, setSpecialWho]       = useState(existing?._specialWho || '');
  const [note, setNote]       = useState(existing?.note || '');
  const [holidayName, setHolidayName] = useState(existing?.name || '');
  const [errors, setErrors] = useState({});
  const [halfDay, setHalfDay] = useState(existing?._halfDay || (defaultDate && defaultHalfDay ? { [defaultDate]: defaultHalfDay } : {}));
  const [showEditSelection, setShowEditSelection] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [notifyEmployee, setNotifyEmployee] = useState(false);
  const [scope, setScope] = useState(existing?._isCompanyEvent ? 'collective' : 'one');
  const [rangeFrom, setRangeFrom] = useState(() => existing?.startDate ? (toISOInput(existing.startDate) || '') : defaultDate || '');
  const [rangeTo, setRangeTo]     = useState(() => existing ? (toISOInput(existing.endDate || existing.startDate) || '') : defaultDate || '');
  const [pickedDates, setPickedDates] = useState(() => {
    if (existing?._selectedDates) return new Set(existing._selectedDates);
    if (existing?.startDate) {
      const start = parseDisplayDate(existing.startDate);
      const end = parseDisplayDate(existing.endDate || existing.startDate);
      if (!start || !end) return new Set();
      const dates = new Set();
      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        if (d.getDay() !== 0 && d.getDay() !== 6 && !_holidaySet.has(isoDate(d)) && !_collectiveSet.has(isoDate(d))) {
          dates.add(isoDate(d));
        }
      }
      return dates;
    }
    if (defaultDate) return new Set([defaultDate]);
    return new Set();
  });
  const allEmployees = scope === 'collective';

  useEffect(() => {
    setAttachment(null);
    setNotifyEmployee(false);
    if (type !== 'Special leave') { setSpecialReason(''); setSpecialWho(''); }
  }, [type]);

  useEffect(() => { setSpecialWho(''); }, [specialReason]);

  useEffect(() => {
    if (!rangeFrom || !rangeTo) return;
    const from = new Date(rangeFrom + 'T00:00:00');
    const to   = new Date(rangeTo   + 'T00:00:00');
    if (from > to) return;
    const dates = new Set();
    let blockedByCollective = 0;
    let blockedByHoliday = 0;
    for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      if (_collectiveSet.has(isoDate(d))) { blockedByCollective++; continue; }
      if (_holidaySet.has(isoDate(d))) { blockedByHoliday++; continue; }
      dates.add(isoDate(d));
    }
    setPickedDates(dates);
    if (dates.size === 0 && (blockedByCollective > 0 || blockedByHoliday > 0)) {
      const reason = blockedByCollective > 0 ? 'collective closure days' : 'public holidays';
      setErrors(p => ({ ...p, dates: `This range only contains ${reason} — pick different dates` }));
    } else {
      setErrors(p => ({ ...p, dates: null }));
    }
  }, [rangeFrom, rangeTo]);

  const handleDateTap = (d) => {
    const iso = isoDate(d);
    if (pickedDates.has(iso)) {
      setPickedDates(prev => { const n = new Set(prev); n.delete(iso); return n; });
      setHalfDay(hd => { const c = { ...hd }; delete c[iso]; return c; });
    } else {
      setPickedDates(prev => new Set([...prev, iso]));
    }
  };

  function toISOInput(displayStr) {
    const d = parseDisplayDate(displayStr);
    return d ? isoDate(d) : '';
  }

  function countWeekdays(from, to) {
    let count = 0;
    for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) count++;
    }
    return count;
  }

  const sortedPicked = [...pickedDates].sort();
  const startD = sortedPicked.length > 0 ? new Date(sortedPicked[0] + 'T00:00:00') : null;
  const endD = sortedPicked.length > 0 ? new Date(sortedPicked[sortedPicked.length - 1] + 'T00:00:00') : null;
  const halfDayDeduction = Object.entries(halfDay).filter(([iso, v]) => pickedDates.has(iso) && (v === 'am' || v === 'pm')).length * 0.5;
  const days = pickedDates.size - halfDayDeduction;

  const fmtDisplay = (d) => d ? d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '';

  const handleSave = (close) => {
    const errs = {};
    if (!allEmployees && !empId) errs.employee = 'Please select an employee';
    if (pickedDates.size === 0) errs.dates = 'Please select dates';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const startD2 = new Date(sortedPicked[0] + 'T00:00:00');
    const endD2 = new Date(sortedPicked[sortedPicked.length - 1] + 'T00:00:00');
    const activeHalfDay = Object.fromEntries(Object.entries(halfDay).filter(([k]) => pickedDates.has(k)));
    const base = {
      type,
      startDate: fmtDisplay(startD2),
      endDate: fmtDisplay(endD2),
      days,
      status: existing?.status || 'approved',
      submittedAt: existing?.submittedAt || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      note,
      _selectedDates: sortedPicked,
      ...(Object.keys(activeHalfDay).length > 0 ? { _halfDay: activeHalfDay } : {}),
      ...(type === 'Special leave' && specialReason ? { _specialReason: specialReason } : {}),
      ...(type === 'Special leave' && specialWho ? { _specialWho: specialWho } : {}),
    };
    if (allEmployees) {
      onSave({ ...base, id: existing?.id || `ce-${Date.now()}`, _isCompanyEvent: true, name: holidayName || type });
    } else {
      onSave({ ...base, id: existing?.id || `manual-${Date.now()}`, employee: empId });
    }
    close();
  };

  const empList = Object.entries(EMPLOYEES).sort((a, b) => a[1].name.localeCompare(b[1].name));

  const inputStyle = {
    width: '100%', padding: 'var(--space-100) var(--space-125)', borderRadius: 7, border: `1px solid ${P.border}`,
    fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', background: P.white,
  };

  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <DrawerShell onClose={onClose}
      title={isEdit ? (allEmployees ? 'Edit company closure' : 'Edit time off') : (allEmployees ? 'Add company closure' : 'Add time off')}>
      {close => (
        <>
        {/* Past-record warning — only in edit mode for past absences */}
        {isEdit && (() => {
          const today = new Date(); today.setHours(0,0,0,0);
          const endD = existing?._selectedDates?.length
            ? (() => { const p = existing._selectedDates[existing._selectedDates.length-1].split('-'); return new Date(+p[0],+p[1]-1,+p[2]); })()
            : null;
          const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          if (!endD || endD >= today || endD < thirtyDaysAgo) return null;
          return (
            <div style={{ flexShrink: 0, padding: 'var(--space-200) var(--space-300) var(--space-050)' }}>
              <div style={{ padding: 'var(--space-200) var(--space-200)', borderRadius: 10, background: '#fdf6ec', display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.warningDark, lineHeight: 1.4 }}>Changes to past absences may affect payroll records.</span>
              </div>
            </div>
          );
        })()}

        {/* Form — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-250) var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-300)' }}>
          {/* Scope selector */}
          {!lockEmployee && !isEdit && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-100)' }}>
              {[
                ['one', 'One employee', 'User', 'Choose a specific person'],
                ['collective', 'All employees', 'Users', 'Apply to your entire team'],
              ].map(([val, label, icon, sublabel]) => {
                const active = scope === val;
                return (
                  <button key={val} onClick={() => setScope(val)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--space-050)',
                    padding: 'var(--space-125) var(--space-150)', borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${active ? P.ink : P.border}`,
                    background: active ? P.bg : P.white,
                    transition: 'border-color 120ms, background 120ms',
                  }}>
                    <Icon name={icon} size={14} color={active ? P.ink : P.inkSoft} strokeWidth={2} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, lineHeight: 1.3 }}>{sublabel}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Employee / Holiday name — same slot, same height, no jump */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>
              {scope === 'collective' ? 'Reason' : 'Employee'}
            </label>
            {scope === 'collective' ? (
              <input value={holidayName} onChange={e => setHolidayName(e.target.value)} placeholder="e.g. Belgian National Day" style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            ) : (lockEmployee || isEdit) ? (
              <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', background: '#f7f8f7', color: P.ink }}>
                {EMPLOYEES[empId]?.name || empId}
              </div>
            ) : (
              <EmployeeCombobox
                value={empId}
                onChange={(id) => { setEmpId(id); setErrors(p => ({...p, employee: null})); }}
                employees={empList}
                error={errors.employee}
                autoFocus={false}
              />
            )}
            {errors.employee && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.danger, marginTop: 'var(--space-050)' }}>{errors.employee}</div>}
          </div>

          {/* Leave type — hidden for collective holidays */}
          {!allEmployees && (
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>Leave type</label>
              <SelectField value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {ALL_LEAVE_TYPES.map(t => (
                  <option key={t} value={t}>{t}{ADMIN_ONLY_TYPES.has(t) ? ' (Admin)' : ''}</option>
                ))}
              </SelectField>
            </div>
          )}

          {/* Paternity leave / Maternity leave entitlement note */}
          {!allEmployees && (type === 'Paternity leave' || type === 'Maternity leave') && (() => {
            const meta = SPECIAL_LEAVE_METADATA[type];
            return (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-100)', padding: 'var(--space-100) var(--space-125)', borderRadius: 7, background: P.bg, border: `1px solid ${P.border}` }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.inkSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 'var(--space-025)', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, lineHeight: 1.4 }}>
                  Entitlement: {meta.statutoryLabel} — {meta.statutoryNote}
                </span>
              </div>
            );
          })()}

          {/* Special leave cascading selects */}
          {!allEmployees && type === 'Special leave' && (() => {
            const reasonObj = SPECIAL_LEAVE_REASONS.find(r => r.id === specialReason);
            const whoList = specialReason === 'wedding' ? SPECIAL_WEDDING_WHO : specialReason === 'funeral' ? SPECIAL_FUNERAL_WHO : [];
            const whoObj = whoList.find(w => w.id === specialWho);

            // Compute entitlement note
            let entitlementNote = null;
            if (reasonObj && !reasonObj.hasWho) entitlementNote = `Legal entitlement: ${reasonObj.entitlement}`;
            else if (whoObj) {
              entitlementNote = `Legal entitlement: ${whoObj.days} day${whoObj.days !== 1 ? 's' : ''}${whoObj.note ? ` — ${whoObj.note}` : ''}`;
            }

            return (
              <>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>Reason</label>
                  <SelectField value={specialReason} onChange={e => setSpecialReason(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select a reason…</option>
                    {SPECIAL_LEAVE_REASONS.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </SelectField>
                </div>

                {reasonObj?.hasWho && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-075)' }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>
                      {specialReason === 'wedding' ? 'Wedding type' : 'Relationship to deceased'}
                    </label>
                    <SelectField value={specialWho} onChange={e => setSpecialWho(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">Select…</option>
                      {whoList.map(w => (
                        <option key={w.id} value={w.id}>{w.label}</option>
                      ))}
                    </SelectField>
                    {entitlementNote && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-100)', padding: 'var(--space-100) var(--space-125)', borderRadius: 7, background: P.bg, border: `1px solid ${P.border}` }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.inkSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 'var(--space-025)', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, lineHeight: 1.4 }}>{entitlementNote}</span>
                      </div>
                    )}
                  </div>
                )}

                {!reasonObj?.hasWho && entitlementNote && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-100)', padding: 'var(--space-100) var(--space-125)', borderRadius: 7, background: P.bg, border: `1px solid ${P.border}` }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.inkSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 'var(--space-025)', flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, lineHeight: 1.4 }}>{entitlementNote}</span>
                  </div>
                )}
              </>
            );
          })()}


          {/* Date range inputs */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>Dates</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-100)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginBottom: 'var(--space-050)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>From</div>
                <DateInput value={rangeFrom} placeholder="Start date" borderColor={errors.dates ? P.danger : P.border} onChange={e => { setRangeFrom(e.target.value); if (rangeTo && e.target.value > rangeTo) setRangeTo(e.target.value); }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginBottom: 'var(--space-050)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>To</div>
                <DateInput value={rangeTo} placeholder="End date" min={rangeFrom || undefined} borderColor={errors.dates ? P.danger : P.border} onChange={e => { setRangeTo(e.target.value); }} />
              </div>
            </div>
            {errors.dates && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.danger, marginTop: 'var(--space-050)' }}>{errors.dates}</div>}
          </div>

          {/* Duration + edit selection */}
          {pickedDates.size > 0 && (
            <div style={{ borderRadius: 8, overflow: 'hidden', background: P.bg, border: `1px solid ${P.border}` }}>
              <div style={{ padding: 'var(--space-100) var(--space-150)', display: 'flex', alignItems: 'center', gap: 'var(--space-075)' }}>
                <Icon name="CalendarDays" size={13} color={P.inkSoft} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, flex: 1 }}>
                  {days === 0.5 ? '½ working day' : days === 1 ? '1 working day' : `${days} working days`}
                  {startD && endD && startD.getTime() !== endD.getTime() && (
                    <span style={{ color: P.inkFaint }}> · {fmtDisplay(startD)} – {fmtDisplay(endD)}</span>
                  )}
                </span>
                <button onClick={() => setShowEditSelection(v => !v)} style={{
                  border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.ink,
                  textDecoration: 'underline', textUnderlineOffset: 2,
                }}>
                  {showEditSelection ? 'Done' : 'Edit days'}
                </button>
              </div>
              {showEditSelection && (
                <div style={{ borderTop: `1px solid ${P.border}`, padding: '0 var(--space-150)' }}>
                  {sortedPicked.map((iso, idx) => {
                    const p = iso.split('-');
                    const d = new Date(+p[0], +p[1]-1, +p[2]);
                    const label = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
                    const hv = halfDay[iso] || 'full';
                    const isLast = idx === sortedPicked.length - 1;
                    return (
                      <div key={iso} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', padding: 'var(--space-100) 0', borderBottom: isLast ? 'none' : `1px solid ${P.border}` }}>
                        <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.ink }}>{label}</span>
                        <HalfDayPickerAdmin value={hv} onChange={(v) => setHalfDay(hd => {
                          const c = { ...hd };
                          if (v === 'full') delete c[iso]; else c[iso] = v;
                          return c;
                        })} />
                        <button onClick={() => handleDateTap(d)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 'var(--space-050)', display: 'flex', lineHeight: 1 }}>
                          <Icon name="Trash2" size={13} color={P.inkSoft} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Note — always shown */}
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>Notes <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder={scope === 'collective' ? 'e.g. Replacement for Christmas Day which fell on a Sunday…' : 'Reason or additional context…'} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
          </div>

          {/* Document upload + notify toggle — non-blocking */}
          {(() => {
            const rule = ATTACHMENT_RULES[type];
            if (!rule) return null;
            return (
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>{rule.label}</label>
                <p style={{ margin: '0 0 var(--space-100)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint }}>{rule.note}</p>
                {attachment ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', padding: 'var(--space-100) var(--space-125)', borderRadius: 7, border: `1px solid ${P.border}`, background: P.bg }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.inkSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.ink }}>{attachment}</span>
                    <button onClick={() => setAttachment(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 'var(--space-025)', display: 'flex' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setAttachment(`${rule.label.toLowerCase().replace(/ /g, '_')}.pdf`)} style={{
                    width: '100%', padding: '11px var(--space-200)', borderRadius: 7,
                    border: `1.5px dashed ${P.border}`, background: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-100)',
                    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkSoft,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.inkSoft} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Upload {rule.label}
                  </button>
                )}
                {!attachment && (
                  <div onClick={() => setNotifyEmployee(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)', marginTop: 'var(--space-100)', padding: 'var(--space-125) var(--space-150)', borderRadius: 8, border: `1px solid ${P.border}`, background: P.bg, cursor: 'pointer', userSelect: 'none' }}>
                    <Switch checked={notifyEmployee} size="sm" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink }}>Request {rule.label.toLowerCase()} from employee</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginTop: 'var(--space-025)' }}>Sends an email asking the employee to upload the document</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Footer — pinned */}
        <div style={{ flexShrink: 0, padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
          <button onClick={close} style={{
            padding: 'var(--space-100) var(--space-250)', borderRadius: 8, border: `1px solid ${P.borderStrong}`, background: 'transparent',
            color: P.ink, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)',
          }}>Cancel</button>
          <div style={{ flex: 1 }} />
          <button onClick={() => handleSave(close)} style={{
            padding: 'var(--space-100) var(--space-250)', borderRadius: 8, border: 'none',
            background: P.action, color: '#fff', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)',
          }}>{isEdit ? (allEmployees ? 'Save closure' : 'Save changes') : (allEmployees ? 'Add closure' : 'Confirm absence')}</button>
        </div>
        </>
      )}
    </DrawerShell>
  );
}

// ── Shared overlap helper ──────────────────────────────────────────────────
function getOverlapping(req, requests) {
  const _d = (r, last) => {
    if (r._selectedDates?.length) {
      const iso = last ? r._selectedDates[r._selectedDates.length-1] : r._selectedDates[0];
      const p = iso.split('-'); return new Date(+p[0],+p[1]-1,+p[2]);
    }
    return parseDisplayDate(last ? (r.endDate || r.startDate) : r.startDate);
  };
  const s = _d(req, false), e = _d(req, true);
  if (!s || !e) return [];
  return requests.filter(r => {
    if (r.id === req.id || r.employee === req.employee) return false;
    if (r.status !== 'approved' && r.status !== 'pending') return false;
    const rs = _d(r, false), re = _d(r, true);
    return rs && re && rs <= e && re >= s;
  });
}

// ── Avatar stack with hover-expand ─────────────────────────────────────────
const AVATAR_SIZE = 24;
const AVATAR_OVERLAP = -9;
const AVATAR_EXPAND = 4;

function AvatarStack({ people }) {
  const [activeIdx, setActiveIdx] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const shown = people.slice(0, 4);
  const extra = people.length - 4;
  return (
    <span
      onMouseLeave={() => { setActiveIdx(null); setTooltipPos(null); }}
      style={{ display: 'inline-flex', alignItems: 'flex-end', position: 'relative', height: AVATAR_SIZE + 8, paddingTop: 'var(--space-100)' }}
    >
      {shown.map((p, i) => {
        const e2 = EMPLOYEES[p.employee];
        const initials = e2?.initials || '?';
        const name = e2?.name || p.employee;
        const isActive = activeIdx === i;
        const lift = isActive ? -2 : 0;
        return (
          <span
            key={p.id}
            onMouseEnter={(e) => {
              setActiveIdx(i);
              const r = e.currentTarget.getBoundingClientRect();
              setTooltipPos({ x: r.left + r.width / 2, y: r.top });
            }}
            onMouseLeave={() => { setActiveIdx(null); setTooltipPos(null); }}
            style={{
              width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: '50%',
              background: P.border,
              border: '2px solid #fff', boxSizing: 'content-box',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: P.ink, letterSpacing: '0.02em',
              marginLeft: i > 0 ? AVATAR_OVERLAP : 0,
              position: 'relative', zIndex: isActive ? 20 : shown.length - i,
              fontFamily: 'var(--font-display)', flexShrink: 0,
              overflow: 'hidden',
              transition: `transform 350ms ${EASE_OUT}`,
              transform: `translateY(${lift}px)${isActive ? ' scale(1.03)' : ''}`,
              cursor: 'default',
            }}
          >
            {e2?.photo
              ? <img src={avatarUrl(e2.name, e2.gender)} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : initials}
            {isActive && tooltipPos && ReactDOM.createPortal(
              <span style={{
                position: 'fixed',
                left: tooltipPos.x, top: tooltipPos.y - 6,
                transform: 'translateX(-50%) translateY(-100%)',
                padding: 'var(--space-050) var(--space-100)', borderRadius: 6,
                background: P.action, color: '#fff',
                fontSize: 'var(--fs-body-sm)', fontWeight: 600, fontFamily: 'var(--font-display)',
                whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 9999,
                display: 'flex', alignItems: 'baseline', gap: 'var(--space-075)',
              }}>
                {name}
                <span style={{ opacity: 0.45, fontWeight: 400 }}>·</span>
                <span style={{ fontSize: 'var(--fs-body-xs)', fontWeight: 500, opacity: 0.7 }}>
                  {p.days === 1 ? p.startDate : `${p.startDate} – ${p.endDate}`}
                </span>
                <span style={{ opacity: 0.45, fontWeight: 400 }}>·</span>
                <span style={{ fontSize: 'var(--fs-body-xs)', fontWeight: 500, opacity: 0.7 }}>
                  {p.days} {p.days === 1 ? 'day' : 'days'}
                </span>
              </span>,
              document.body
            )}
          </span>
        );
      })}
      {extra > 0 && (
        <span style={{
          width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: '50%',
          background: P.bg, border: '2px solid #fff', boxSizing: 'content-box',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, color: P.inkSoft,
          marginLeft: AVATAR_OVERLAP,
          position: 'relative', zIndex: 0,
          fontFamily: 'var(--font-display)', flexShrink: 0,
          transition: `transform 250ms ${EASE_OUT}`,
          transform: 'translateY(0)',
        }}>+{extra}</span>
      )}
    </span>
  );
}

// ── Overlap popover ────────────────────────────────────────────────────────
function OverlapPopover({ req, overlapping, empDept }) {
  const [open, setOpen] = useState(false);
  const { rendered, visible } = usePopoverTransition(open);
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const sameDept = overlapping.filter(r => EMPLOYEES[r.employee]?.department === empDept);
  const otherDept = overlapping.filter(r => EMPLOYEES[r.employee]?.department !== empDept);

  const calcOverlapDays = (r) => {
    if (!req._selectedDates || !r._selectedDates) return null;
    const reqSet = new Set(req._selectedDates);
    return r._selectedDates.filter(d => reqSet.has(d)).length;
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!open && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ x: Math.max(8, r.left), y: r.bottom + 6 });
    }
    setOpen(o => !o);
  };

  if (sameDept.length === 0) {
    return <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkFaint }}>—</span>;
  }

  return (
    <span ref={ref} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span onClick={handleClick} style={{ cursor: 'pointer', borderRadius: 6, padding: 'var(--space-025) 0' }}>
        <AvatarStack people={sameDept} />
      </span>
      {rendered && pos && ReactDOM.createPortal(
        <div style={{
          position: 'fixed', left: pos.x, top: pos.y, zIndex: 400,
          width: 304,
          background: P.white, borderRadius: 12,
          border: `1px solid ${P.border}`,
          boxShadow: '0 8px 32px rgba(15,13,40,0.13), 0 0 0 1px rgba(15,13,40,0.04)',
          overflow: 'hidden',
          ...popoverStyle(visible, 'top left'),
        }}>
          {sameDept.length > 0 && <>
            <div style={{ padding: 'var(--space-125) var(--space-200) var(--space-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: P.inkFaint }}>
                {empDept} also off
              </span>
              {sameDept.length >= 2 && (
                <DotPill dot={false} size={11} color={P.danger} bg={P.dangerBg} border={P.dangerBorder}>⚠ {sameDept.length} overlaps</DotPill>
              )}
            </div>
            {sameDept.map(r => {
              const e2 = EMPLOYEES[r.employee];
              const period = r.startDate === r.endDate ? r.startDate : `${r.startDate} – ${r.endDate}`;
              const od = calcOverlapDays(r);
              return (
                <div key={r.id} style={{ padding: 'var(--space-100) var(--space-200)', display: 'flex', alignItems: 'center', gap: 'var(--space-100)', borderTop: `1px solid ${P.border}` }}>
                  <Avatar employeeId={r.employee} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 400, color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e2?.name || r.employee}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginTop: 'var(--space-025)' }}>{period}</div>
                  </div>
                  {od > 0 && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, flexShrink: 0 }}>{od}d overlap</span>}
                </div>
              );
            })}
          </>}
        </div>,
        document.body
      )}
    </span>
  );
}

function generateReceiptContent(expense) {
  const f = v => `€ ${v.toFixed(2).replace('.', ',')}`;
  const amt = expense.amount;
  const cat = expense.category;
  if (cat === 'Hotel') {
    const vat = +(amt * 0.21 / 1.21).toFixed(2);
    const city = 4.50;
    const base = +(amt - vat - city).toFixed(2);
    return { merchant: 'IBIS HOTELS', sub: 'Brussels Grand Place', lines: [['Room charge (1 night)', f(base)], ['City tax', f(city)], ['VAT 21%', f(vat)]] };
  }
  if (cat === 'Taxi') {
    const booking = 2.20, base = 2.50;
    const rest = amt - booking - base;
    const dist = +(rest * 0.78).toFixed(2);
    const time = +(rest * 0.22).toFixed(2);
    return { merchant: 'UBER', sub: 'Trip receipt', lines: [['Base fare', f(base)], ['Distance', f(dist)], ['Time', f(time)], ['Booking fee', f(booking)]] };
  }
  if (cat === 'Travel') {
    const route = (expense.description || '').split('—')[0].trim();
    return { merchant: 'NMBS / SNCB', sub: route || 'Train ticket', lines: [['1 × 2nd class ticket', f(amt)]] };
  }
  if (cat === 'Restaurant') {
    const vat = +(amt * 0.10 / 1.10).toFixed(2);
    const food = +(amt - vat).toFixed(2);
    return { merchant: 'RESTAURANT', sub: (expense.description || '').split('—')[0].trim(), lines: [['Food & drinks', f(food)], ['VAT 10%', f(vat)]] };
  }
  if (cat === 'Online courses') {
    return { merchant: 'ONLINE LEARNING', sub: (expense.description || '').split('—')[0].trim(), lines: [['Subscription / course fee', f(amt)]] };
  }
  if (cat === 'Conference fees') {
    return { merchant: 'CONFERENCE', sub: (expense.description || '').split('—')[0].trim(), lines: [['Registration fee', f(amt)]] };
  }
  return { merchant: (cat || 'MERCHANT').toUpperCase(), sub: '', lines: [[expense.description || 'Purchase', f(amt)]] };
}

// ── Expense drawer ─────────────────────────────────────────────────────────
function ExpenseDrawer({ expense, onClose, onApprove, onReject, onEdit, categories = [], initialRejectMode = false, requireApproval = true }) {
  const emp = EMPLOYEES[expense.employee] || { name: expense.employee, initials: '?', color: P.border };
  const isPending = expense.status === 'pending';

  const [rejectMode, setRejectMode] = React.useState(initialRejectMode);
  const [rejectReason, setRejectReason] = React.useState('');
  const [receiptFullscreen, setReceiptFullscreen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [editAmount, setEditAmount] = React.useState(String(expense.amount));
  const [editCategory, setEditCategory] = React.useState(expense.category);
  const [editDescription, setEditDescription] = React.useState(expense.description || '');

  const SLIDE_DUR = 300;
  const secondPanel = rejectMode || editMode;
  const detailSlide = secondPanel ? 'translateX(-100%)' : 'translateX(0)';
  const editSlide   = secondPanel ? 'translateX(0)'     : 'translateX(100%)';
  const slideTransition = `transform ${SLIDE_DUR}ms ${EASE_DRAWER}`;

  const labelStyle = { flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, whiteSpace: 'nowrap' };
  const valueStyle = { flex: 1, minWidth: 0, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 'var(--space-100)' };

  const TableRow = ({ label, icon, top = false, children }) => (
    <div style={{ display: 'flex', alignItems: top ? 'flex-start' : 'center', padding: 'var(--space-200) var(--space-300)', gap: 'var(--space-200)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', flexShrink: 0, width: 160, ...(top ? { paddingTop: 1 } : {}) }}>
        {icon && <Icon name={icon} size={14} color={P.inkSoft} strokeWidth={1.75} style={{ flexShrink: 0 }} />}
        <div style={labelStyle}>{label}</div>
      </div>
      <div style={valueStyle}>{children}</div>
    </div>
  );
  const SectionHeader = ({ first = false, children }) => (
    <>
      {!first && <div style={{ height: 1, background: P.border }} />}
      <div style={{ padding: 'var(--space-400) var(--space-300) var(--space-075)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {children}
      </div>
    </>
  );
  const Group = ({ children }) => {
    const items = React.Children.toArray(children).filter(Boolean);
    return <div style={{ paddingBottom: 'var(--space-200)' }}>{items}</div>;
  };

  const amountStr = `€ ${expense.amount.toFixed(2).replace('.', ',')}`;

  const detailContent = (
    <div>
      <SectionHeader first>Expense</SectionHeader>
      <Group>
        <TableRow label="Amount" icon="coins">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{amountStr}</span>
        </TableRow>
        <TableRow label="Category" icon="tag">
          {expense.category}
        </TableRow>
        <TableRow label="Note" icon="message-square" top>
          <span style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{expense.description || '—'}</span>
        </TableRow>
        <TableRow label="Submitted by" icon="user">
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</span>
          <Avatar employeeId={expense.employee} size={22} />
        </TableRow>
        {emp.department && (
          <TableRow label="Department" icon="building-2">
            {emp.department}
          </TableRow>
        )}
      </Group>

      <SectionHeader>Details</SectionHeader>
      <Group>
        {expense.status !== 'pending' && (
          <TableRow label="Status" icon="circle-dot">
            <StatusPill status={expense.status} />
          </TableRow>
        )}
        <TableRow label="Expense date" icon="calendar">
          {expense.expenseDate}
        </TableRow>
        <TableRow label="Submitted" icon="clock">
          {expense.submittedAt}
        </TableRow>
        {expense.status === 'rejected' && expense.rejectReason && (
          <TableRow label="Reject reason" icon="message-square" top>
            <span style={{ whiteSpace: 'normal', lineHeight: 1.4, color: P.danger }}>{expense.rejectReason}</span>
          </TableRow>
        )}
      </Group>
    </div>
  );

  const receiptSrc = expense.category === 'Taxi' ? 'receipt_taxi.pdf.png' : null;
  const receiptContent = receiptSrc ? (
    <img src={receiptSrc} style={{ display: 'block', width: '100%', borderRadius: 4, boxShadow: '0 2px 12px rgba(15,13,40,0.12)' }} alt="Receipt" />
  ) : (() => {
    const rc = generateReceiptContent(expense);
    const totalStr = `€ ${expense.amount.toFixed(2).replace('.', ',')}`;
    return (
      <div style={{ borderRadius: 4, boxShadow: '0 2px 12px rgba(15,13,40,0.12)', fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, monospace', fontSize: 12.5, lineHeight: 1.8, color: '#1a1a1a', background: '#faf9f7' }}>
        <div style={{ padding: '24px 28px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' }}>{rc.merchant}</div>
            {rc.sub && <div style={{ color: '#666', fontSize: 11.5, marginTop: 2 }}>{rc.sub}</div>}
            <div style={{ color: '#999', fontSize: 11, marginTop: 4 }}>{expense.expenseDate}</div>
          </div>
          <div style={{ borderTop: '1px dashed #ccc', margin: '12px 0 10px' }} />
          {rc.lines.map(([label, val], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ color: '#555' }}>{label}</span>
              <span style={{ whiteSpace: 'nowrap', color: '#1a1a1a' }}>{val}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px dashed #ccc', margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
            <span>TOTAL</span>
            <span>{totalStr}</span>
          </div>
          <div style={{ borderTop: '1px dashed #ccc', margin: '12px 0 0' }} />
          <div style={{ color: '#aaa', fontSize: 10.5, marginTop: 10, textAlign: 'center', lineHeight: 1.6 }}>
            Payment: Corporate card<br />
            {expense.receipt}
          </div>
        </div>
      </div>
    );
  })();

  const receiptPill = (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 0' }}>
      <div style={{ display: 'flex', background: P.white, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)' }}>
        <button onClick={() => setReceiptFullscreen(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px 0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, whiteSpace: 'nowrap' }}>
          <Icon name="expand" size={14} color={P.ink} strokeWidth={1.75} />
          Full screen
        </button>
        {receiptSrc && (<>
          <div style={{ width: 1, background: P.border, margin: '8px 0' }} />
          <a href={receiptSrc} download={expense.receipt} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', textDecoration: 'none', cursor: 'pointer', borderRadius: '0 8px 8px 0', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, whiteSpace: 'nowrap' }}>
            <Icon name="download" size={14} color={P.ink} strokeWidth={1.75} />
            Download
          </a>
        </>)}
      </div>
    </div>
  );

  const receiptPanel = expense.receipt && (
    <div style={{ width: 500, borderLeft: `1px solid ${P.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ flex: 1, overflowY: 'auto', background: '#e8e7e5', padding: 40, paddingBottom: 40 }}>
        {receiptContent}
        {receiptPill}
      </div>
    </div>
  );

  const fullscreenModal = receiptFullscreen && (
    <div onClick={() => setReceiptFullscreen(false)} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '48px 24px 24px', overflowY: 'auto' }}>
      <div style={{ position: 'fixed', top: 16, right: 16, display: 'flex', gap: 8 }}>
        {receiptSrc && (
          <a href={receiptSrc} download={expense.receipt} onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', cursor: 'pointer' }}>
            <Icon name="download" size={13} color="#fff" strokeWidth={2} /> Download
          </a>
        )}
        <button onClick={() => setReceiptFullscreen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer' }}>
          <Icon name="X" size={16} color="#fff" strokeWidth={2} />
        </button>
      </div>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 680 }}>
        {receiptContent}
      </div>
    </div>
  );

  return (
    <>
    <DrawerShell onClose={onClose} title={rejectMode ? 'Reject expense' : editMode ? 'Edit expense' : 'Expense details'} onBack={secondPanel ? () => { setRejectMode(false); setEditMode(false); } : undefined} width={expense.receipt ? 900 : 480}>
      {close => (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div style={{ width: 400, flexShrink: 0, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', transform: detailSlide, transition: slideTransition }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {detailContent}
            </div>
            {isPending && requireApproval && (
              <div style={{ flexShrink: 0, padding: 'var(--space-150) var(--space-250)', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-125)' }}>
                <Button variant="secondary" icon="pencil" onClick={() => { setEditAmount(String(expense.amount)); setEditCategory(expense.category); setEditDescription(expense.description || ''); setEditMode(true); }}>Edit</Button>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-125)' }}>
                  <button onClick={() => { setRejectReason(''); setRejectMode(true); }} style={{ padding: 'var(--space-125) var(--space-250)', borderRadius: 10, border: '1px solid var(--alert-200)', background: P.dangerBg, color: P.danger, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-075)' }}>
                    <Icon name="X" size={13} color={P.danger} strokeWidth={2.5} /> Reject
                  </button>
                  <button onClick={() => { onApprove(expense.id); close(); }} style={{ padding: 'var(--space-125) var(--space-250)', borderRadius: 10, border: 'none', background: P.ink, color: P.white, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-075)' }}>
                    <Icon name="Check" size={13} color={P.white} strokeWidth={2.5} /> Approve
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', transform: editSlide, transition: slideTransition }}>
            {editMode ? (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-250)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-075)' }}>Amount</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${P.border}`, borderRadius: 8, background: P.white, overflow: 'hidden' }}>
                      <span style={{ padding: 'var(--space-125) var(--space-150)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, borderRight: `1px solid ${P.border}` }}>€</span>
                      <input type="number" step="0.01" value={editAmount} onChange={e => setEditAmount(e.target.value)} style={{ flex: 1, padding: 'var(--space-125) var(--space-150)', border: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-075)' }}>Category</label>
                    <SelectField value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{ width: '100%', padding: 'var(--space-125) var(--space-150)', borderRadius: 8, border: `1px solid ${P.border}`, background: P.white, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}>
                      {!categories.find(c => c.name === editCategory) && <option value={editCategory}>{editCategory}</option>}
                      {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </SelectField>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-075)' }}>Description</label>
                    <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} style={{ width: '100%', padding: 'var(--space-125) var(--space-150)', borderRadius: 8, border: `1px solid ${P.border}`, background: P.white, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, resize: 'none', lineHeight: 1.5, boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>
                <div style={{ flexShrink: 0, padding: 'var(--space-150) var(--space-250)', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-125)' }}>
                  <button onClick={() => setEditMode(false)} style={{ flex: 1, padding: 'var(--space-125) 0', borderRadius: 10, border: `1px solid ${P.border}`, background: 'transparent', color: P.inkSoft, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Cancel</button>
                  <button onClick={() => { const amt = parseFloat(editAmount); if (!isNaN(amt)) { onEdit && onEdit(expense.id, { amount: amt, category: editCategory, description: editDescription }); } setEditMode(false); }} style={{ flex: 2, padding: 'var(--space-125) 0', borderRadius: 10, border: 'none', background: P.ink, color: P.white, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Save changes</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-250)', display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-075)' }}>
                    <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.5 }}>
                      You're rejecting <strong style={{ color: P.ink }}>{emp.name}</strong>'s {expense.category} expense of <strong style={{ color: P.ink }}>{amountStr}</strong>.
                    </p>
                    <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, lineHeight: 1.5 }}>
                      {emp.name.split(' ')[0]} will be notified and the expense will be marked as declined.
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-100)' }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Reason <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Add a message for the employee…" rows={4} style={{ width: '100%', padding: 'var(--space-125) var(--space-150)', borderRadius: 8, border: `1px solid ${P.border}`, background: P.white, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, resize: 'none', lineHeight: 1.5, boxSizing: 'border-box', outline: 'none' }} />
                    <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, lineHeight: 1.5 }}>
                      {emp.name.split(' ')[0]} will see this message in their rejection notice.
                    </p>
                  </div>
                </div>
                <div style={{ flexShrink: 0, padding: 'var(--space-150) var(--space-250)', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-125)' }}>
                  <button onClick={() => setRejectMode(false)} style={{ flex: 1, padding: 'var(--space-125) 0', borderRadius: 10, border: `1px solid ${P.border}`, background: 'transparent', color: P.inkSoft, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Go back</button>
                  <button onClick={() => { onReject(expense.id, rejectReason); close(); }} style={{ flex: 2, padding: 'var(--space-125) 0', borderRadius: 10, border: 'none', background: P.danger, color: P.white, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Confirm rejection</button>
                </div>
              </>
            )}
          </div>
          </div>
          {receiptPanel}
        </div>
      )}
    </DrawerShell>
    {fullscreenModal}
    </>
  );
}

// ── Choice drawer ─────────────────────────────────────────────────────────
function ChoiceDrawer({ choice, onClose, onApprove, onDecline }) {
  const emp = EMPLOYEES[choice.empId] || { name: choice.empId, initials: '?', color: P.border };
  const isPending = choice.status === 'pending';
  const isApproved = choice.status === 'approved';

  // null | 'decline' | 'payslip' | 'activity' | 'terminate'
  const [activePanel, setActivePanel] = React.useState(null);
  const [declineReason, setDeclineReason] = React.useState('');
  const [terminateDate, setTerminateDate] = React.useState('2026-07-24');
  const [terminateReason, setTerminateReason] = React.useState('');
  const [terminateAcknowledged, setTerminateAcknowledged] = React.useState(false);

  const SLIDE_DUR = 300;
  const isSecondary = activePanel !== null;
  const detailSlide = isSecondary ? 'translateX(-100%)' : 'translateX(0)';
  const panel2Slide = isSecondary ? 'translateX(0)' : 'translateX(100%)';
  const slideTransition = `transform ${SLIDE_DUR}ms ${EASE_DRAWER}`;

  const panelTitles = { decline: isPending ? 'Decline choice' : 'Reject choice', payslip: 'Impact on payslip', activity: 'Activity log', terminate: 'Terminate early' };
  const headerTitle = activePanel ? panelTitles[activePanel] : 'Choice details';

  // Generate monthly payslip rows from choice dates
  const payslipRows = React.useMemo(() => {
    if (!choice.sDate || !choice.eDate) return [];
    const parts = d => d.split('/').map(Number);
    const [, sm, sy] = parts(choice.sDate);
    const [, em, ey] = parts(choice.eDate);
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const totalMonths = choice.depreciation || Math.max(1, (ey - sy) * 12 + (em - sm) + 1);
    const priceNum = parseFloat((choice.price || '0').replace(',', '.').replace(/[^0-9.]/g, '')) || 0;
    const monthly = (priceNum / totalMonths).toFixed(2).replace('.', ',');
    const rows = [];
    let y = sy, m = sm;
    while (y < ey || (y === ey && m <= em)) {
      const past = y < 2026 || (y === 2026 && m < 7);
      rows.push({ period: `${MONTHS[m - 1]} ${y}`, amount: `${monthly} EUR`, past });
      if (++m > 12) { m = 1; y++; }
    }
    return rows;
  }, [choice]);

  // Activity log, most recent first
  const activityLog = React.useMemo(() => {
    const events = [
      { icon: 'pencil', label: 'Created', actor: 'Bruno Coen', date: `${choice.cDate || '—'} 17:58` },
      { icon: 'upload', label: 'Submitted', actor: 'Bruno Coen', date: `${choice.cDate || '—'} 17:58` },
    ];
    if (choice.status === 'approved') events.push({ icon: 'check', label: 'Approved', actor: 'Bruno Coen', date: `${choice.cDate || '—'} 17:58` });
    if (choice.status === 'declined') events.push({ icon: 'x', label: 'Declined', actor: 'Bruno Coen', date: `${choice.cDate || '—'} 17:58` });
    return events.reverse();
  }, [choice]);

  const labelStyle = { flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink, whiteSpace: 'nowrap' };
  const valueStyle = { flex: 1, minWidth: 0, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-100)' };
  const TableRow = ({ label, icon, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-200) var(--space-300)', gap: 'var(--space-200)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', flexShrink: 0 }}>
        {icon && <Icon name={icon} size={14} color={P.inkSoft} strokeWidth={1.75} style={{ flexShrink: 0 }} />}
        <div style={labelStyle}>{label}</div>
      </div>
      <div style={valueStyle}>{children}</div>
    </div>
  );
  const ActionRow = ({ icon, label, onClick }) => (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-200) var(--space-300)', cursor: 'pointer', gap: 'var(--space-150)' }}>
      <Icon name={icon} size={15} color={P.inkSoft} strokeWidth={1.75} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{label}</span>
      <Icon name="chevron-right" size={14} color={P.inkFaint} strokeWidth={2} />
    </div>
  );
  const SectionHeader = ({ children }) => (
    <div style={{ padding: 'var(--space-300) var(--space-300) var(--space-075)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {children}
    </div>
  );
  const Group = ({ children }) => {
    const items = React.Children.toArray(children).filter(Boolean);
    return (
      <div>
        {items.map((child, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ height: 1, background: P.border, marginLeft: 'var(--space-300)', marginRight: 'var(--space-300)' }} />}
            {child}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <DrawerShell onClose={onClose} title={headerTitle} onBack={isSecondary ? () => setActivePanel(null) : undefined}>
      {close => (
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Panel 1 — Detail */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', transform: detailSlide, transition: slideTransition }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>

              {/* Hero */}
              <div style={{ padding: 'var(--space-250) var(--space-300) var(--space-200)' }}>
                <div style={{ background: P.bg, borderRadius: 16, padding: 'var(--space-250) var(--space-250) var(--space-250)', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-200)' }}>
                    <div style={{ flex: 1, minWidth: 0, paddingBottom: 'var(--space-250)', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ marginBottom: 'var(--space-400)' }}>
                        <StatusPill status={choice.status || 'approved'} />
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink, lineHeight: 1.35, marginBottom: 'var(--space-100)' }}>
                        {choice.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', marginBottom: 'var(--space-150)' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>via</span>
                        <img src="assets/coolblue-logo.png" alt="Coolblue" style={{ height: 14, objectFit: 'contain', display: 'block' }} />
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>Coolblue</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-075)' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: P.ink, letterSpacing: '-0.02em' }}>{choice.price.replace(' EUR', '')}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>EUR</span>
                      </div>
                    </div>
                    {choice.illustration
                      ? <img src={choice.illustration} alt="" style={{ width: 110, height: 110, objectFit: 'contain', flexShrink: 0, display: 'block' }} />
                      : <div style={{ width: 90, height: 90, flexShrink: 0, background: P.white, borderRadius: 14, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-250)' }}>
                          <Icon name="gift" size={36} color={P.inkFaint} strokeWidth={1.25} />
                        </div>
                    }
                  </div>
                  <div style={{ height: 1, background: P.border, margin: '16px -20px 0 -20px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-200) 0 0', gap: 'var(--space-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', flexShrink: 0 }}>
                      <Icon name="user" size={14} color={P.inkSoft} strokeWidth={1.75} />
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>Requested by</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-100)' }}>
                      <Avatar employeeId={choice.empId} size={20} />
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>{emp.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {choice.productName && (<>
                <SectionHeader>Product</SectionHeader>
                <Group>
                  <TableRow label="Product" icon="package">
                    {choice.productUrl
                      ? <a href={choice.productUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-050)', color: P.ink, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', textDecoration: 'underline', textAlign: 'right' }}>
                          <span style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>{choice.productName}</span>
                          <Icon name="ExternalLink" size={12} color={P.inkSoft} strokeWidth={2} style={{ flexShrink: 0 }} />
                        </a>
                      : <span style={{ textAlign: 'right', whiteSpace: 'normal', lineHeight: 1.4 }}>{choice.productName}</span>
                    }
                  </TableRow>
                  {choice.productNumber && <TableRow label="Product number" icon="hash">{choice.productNumber}</TableRow>}
                  {choice.orderId && <TableRow label="Order ID" icon="receipt">{choice.orderId}</TableRow>}
                  {choice.orderDate && <TableRow label="Order date" icon="calendar">{choice.orderDate}</TableRow>}
                  {choice.depreciation && <TableRow label="Depreciation" icon="trending-down">{choice.depreciation} months</TableRow>}
                </Group>
              </>)}
              <SectionHeader>Dates</SectionHeader>
              <Group>
                <TableRow label="Start date" icon="calendar">{isPending ? '—' : (choice.sDate || '—')}</TableRow>
                <TableRow label="End date" icon="calendar-x">{isPending ? '—' : (choice.eDate || '—')}</TableRow>
                <TableRow label="Date of choice" icon="clock">{choice.cDate}</TableRow>
              </Group>
              {choice.transactions?.length > 0 && (<>
                <SectionHeader>Future transactions</SectionHeader>
                <Group>
                  {choice.transactions.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-125) var(--space-300)', gap: 'var(--space-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', flexShrink: 0 }}>
                        <Icon name="arrow-right-left" size={14} color={P.inkSoft} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink, whiteSpace: 'nowrap' }}>{t.label}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{t.amount}</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint }}>{t.date}</span>
                      </div>
                    </div>
                  ))}
                </Group>
              </>)}
              {choice.status === 'declined' && choice.declineReason && (<>
                <SectionHeader>Decline reason</SectionHeader>
                <Group>
                  <TableRow label="Reason" icon="message-square">
                    <span style={{ textAlign: 'right', whiteSpace: 'normal', lineHeight: 1.4, color: P.danger }}>{choice.declineReason}</span>
                  </TableRow>
                </Group>
              </>)}

              {/* Admin actions — approved or declined choices */}
              {!isPending && (<>
                <SectionHeader>Admin</SectionHeader>
                <Group>
                  <ActionRow icon="file-text" label="Impact on payslip" onClick={() => setActivePanel('payslip')} />
                  <ActionRow icon="clock" label="Activity log" onClick={() => setActivePanel('activity')} />
                  {isApproved && <ActionRow icon="calendar-x" label="Terminate early" onClick={() => { setTerminateReason(''); setTerminateAcknowledged(false); setActivePanel('terminate'); }} />}
                </Group>
                <div style={{ height: 24 }} />
              </>)}
            </div>

            {/* Footer */}
            {isPending && (
              <div style={{ flexShrink: 0, padding: 'var(--space-150) var(--space-250)', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-125)' }}>
                <button onClick={() => { setDeclineReason(''); setActivePanel('decline'); }} style={{ flex: 1, padding: 'var(--space-125) 0', borderRadius: 10, border: '1px solid var(--alert-200)', background: P.dangerBg, color: P.danger, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-075)' }}>
                  <Icon name="X" size={13} color={P.danger} strokeWidth={2.5} /> Decline
                </button>
                <button onClick={() => { onApprove(choice.id); close(); }} style={{ flex: 1, padding: 'var(--space-125) 0', borderRadius: 10, border: 'none', background: P.ink, color: P.white, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-075)' }}>
                  <Icon name="Check" size={13} color={P.white} strokeWidth={2.5} /> Approve
                </button>
              </div>
            )}
            {isApproved && (
              <div style={{ flexShrink: 0, padding: 'var(--space-150) var(--space-250)', borderTop: `1px solid ${P.border}` }}>
                <button onClick={() => { setDeclineReason(''); setActivePanel('decline'); }} style={{ width: '100%', padding: 'var(--space-125) 0', borderRadius: 10, border: '1px solid var(--alert-200)', background: P.dangerBg, color: P.danger, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-075)' }}>
                  <Icon name="X" size={13} color={P.danger} strokeWidth={2.5} /> Reject choice
                </button>
              </div>
            )}
          </div>

          {/* Panel 2 — content switches based on activePanel */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', transform: panel2Slide, transition: slideTransition }}>

            {/* Decline / Reject panel */}
            {activePanel === 'decline' && (<>
              <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-250)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.5 }}>
                  {isPending
                    ? <>You're declining <strong style={{ color: P.ink }}>{emp.name}</strong>'s request for {choice.name}.</>
                    : <>You're revoking the approval for <strong style={{ color: P.ink }}>{emp.name}</strong>'s {choice.name}. This cannot be undone.</>
                  }
                </p>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-075)' }}>Reason <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
                  <textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} placeholder="Explain why this choice is being declined…" rows={3} style={{ width: '100%', padding: 'var(--space-125) var(--space-150)', borderRadius: 8, border: `1px solid ${P.border}`, background: P.bg, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, resize: 'none', lineHeight: 1.5, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
              <div style={{ flexShrink: 0, padding: 'var(--space-150) var(--space-250)', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-125)' }}>
                <button onClick={() => setActivePanel(null)} style={{ flex: 1, padding: 'var(--space-125) 0', borderRadius: 10, border: `1px solid ${P.border}`, background: 'transparent', color: P.inkSoft, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Go back</button>
                <button onClick={() => { onDecline(choice.id, declineReason); close(); }} style={{ flex: 2, padding: 'var(--space-125) 0', borderRadius: 10, border: 'none', background: P.danger, color: P.white, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>
                  {isPending ? 'Confirm decline' : 'Confirm rejection'}
                </button>
              </div>
            </>)}

            {/* Impact on payslip panel */}
            {activePanel === 'payslip' && (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: 'var(--space-200) var(--space-300) var(--space-150)' }}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.5 }}>
                    Benefits may affect your payslip by either boosting your gross salary with reimbursements or reducing it through deductions such as Benefit in Kind.
                  </p>
                </div>
                {payslipRows.length === 0
                  ? <div style={{ padding: 'var(--space-400) 0', textAlign: 'center', color: P.inkFaint, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)' }}>No payslip data available</div>
                  : (() => {
                      const todayIdx = payslipRows.findIndex(r => !r.past);
                      return (
                        <div style={{ paddingBottom: 'var(--space-300)' }}>
                          {/* Section header */}
                          <div style={{ padding: 'var(--space-050) var(--space-300) var(--space-100)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Benefit in Kind
                          </div>
                          {payslipRows.map((row, i) => (
                            <React.Fragment key={i}>
                              {/* "Today" divider between past and future */}
                              {i === todayIdx && todayIdx > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)', padding: 'var(--space-100) var(--space-300)' }}>
                                  <div style={{ flex: 1, height: 1, background: P.border }} />
                                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>Today</span>
                                  <div style={{ flex: 1, height: 1, background: P.border }} />
                                </div>
                              )}
                              {i > 0 && i !== todayIdx && (
                                <div style={{ height: 1, background: P.border, marginLeft: 'var(--space-300)' }} />
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px var(--space-300)' }}>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: row.past ? P.inkSoft : P.ink }}>{row.period}</span>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: row.past ? 400 : 600, fontSize: 'var(--fs-body-sm)', color: row.past ? P.inkSoft : P.ink, flexShrink: 0 }}>{row.amount}</span>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      );
                    })()
                }
              </div>
            )}

            {/* Activity log panel */}
            {activePanel === 'activity' && (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: 'var(--space-200) var(--space-300) var(--space-150)' }}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.5 }}>
                    Track all changes and updates to this choice.
                  </p>
                </div>
                <Group>
                  {activityLog.map((event, i) => (
                    <TableRow key={i} icon={event.icon} label={`${event.label} by ${event.actor}`}>
                      {event.date}
                    </TableRow>
                  ))}
                </Group>
              </div>
            )}

            {/* Terminate early panel */}
            {activePanel === 'terminate' && (<>
              <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-250) var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
                <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.5 }}>
                  Set the termination date and provide a reason to end this choice early.
                </p>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, marginBottom: 'var(--space-050)' }}>Termination date</label>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-125)' }}>When should this choice officially end?</div>
                  <input type="date" value={terminateDate} onChange={e => setTerminateDate(e.target.value)} style={{ width: '100%', padding: 'var(--space-125) var(--space-150)', borderRadius: 8, border: `1px solid ${P.border}`, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, boxSizing: 'border-box', outline: 'none', background: P.white }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, marginBottom: 'var(--space-125)' }}>Reason for termination</label>
                  <select value={terminateReason} onChange={e => setTerminateReason(e.target.value)} style={{ width: '100%', padding: 'var(--space-125) var(--space-150)', borderRadius: 8, border: `1px solid ${terminateReason ? P.border : P.border}`, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: terminateReason ? P.ink : P.inkSoft, boxSizing: 'border-box', outline: 'none', background: P.white, appearance: 'none', cursor: 'pointer' }}>
                    <option value="" disabled>Select a reason</option>
                    {['Broken', 'Other', 'Stolen', 'Terminated by benefit partner'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: 'var(--space-150) var(--space-200)', display: 'flex', gap: 'var(--space-125)' }}>
                  <Icon name="triangle-alert" size={16} color="#ea580c" strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 'var(--space-025)' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: '#9a3412', lineHeight: 1.5 }}>This action cannot be undone. The choice will be permanently terminated on the date specified.</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-125)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={terminateAcknowledged} onChange={e => setTerminateAcknowledged(e.target.checked)} style={{ marginTop: 'var(--space-025)', flexShrink: 0, accentColor: P.action }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.5 }}>I understand that this does not automatically recalculate payment amounts and that manual changes are still needed.</span>
                </label>
              </div>
              <div style={{ flexShrink: 0, padding: 'var(--space-150) var(--space-250)', borderTop: `1px solid ${P.border}`, display: 'flex', flexDirection: 'column', gap: 'var(--space-100)' }}>
                <button
                  disabled={!terminateReason || !terminateAcknowledged}
                  onClick={() => close()}
                  style={{ width: '100%', padding: 'var(--space-125) 0', borderRadius: 10, border: 'none', background: (!terminateReason || !terminateAcknowledged) ? P.border : P.ink, color: (!terminateReason || !terminateAcknowledged) ? P.inkSoft : P.white, cursor: (!terminateReason || !terminateAcknowledged) ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>
                  Confirm termination
                </button>
                <button onClick={() => setActivePanel(null)} style={{ width: '100%', padding: 'var(--space-125) 0', borderRadius: 10, border: '1px solid var(--alert-200)', background: 'transparent', color: P.danger, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Cancel</button>
              </div>
            </>)}

          </div>
        </div>
      )}
    </DrawerShell>
  );
}

// ── Table row ──────────────────────────────────────────────────────────────
const TH = ({ children, style }) => (
  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, textTransform: 'uppercase', letterSpacing: '0.06em', ...style }}>{children}</div>
);

const AppLink = ({ children, onClick, style }) => (
  <span onClick={onClick} style={{ color: P.ink, textDecoration: 'underline', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...style }}>{children}</span>
);

function RequestRow({ req, requests, onApprove, onDecline, onDetail, onDeclineDirectly, onEdit, onCancel, selected, onToggle, onViewInCalendar, showStatus, showEntity, removing }) {
  const emp = EMPLOYEES[req.employee] || { name: req.employee, initials: '?', color: P.border, entitlement: 20 };
  const [hover, setHover] = useState(false);
  const usedDays = requests
    .filter(r => r.employee === req.employee && r.id !== req.id && (r.status === 'approved' || r.status === 'pending'))
    .reduce((s, r) => s + r.days, 0);
  const remaining = Math.max(0, emp.entitlement - usedDays - req.days);
  const overlapping = getOverlapping(req, requests);
  const gridCols = showStatus
    ? (showEntity ? '32px 1.2fr 0.8fr 1fr 1fr 0.7fr 0.7fr 1fr 1fr 96px' : '32px 1.2fr 1fr 1fr 0.7fr 0.7fr 1fr 1fr 96px')
    : (showEntity ? '32px 1.2fr 0.8fr 1fr 0.7fr 0.7fr 1fr 1fr 96px' : '32px 1.2fr 1fr 0.7fr 0.7fr 1fr 1fr 96px');
  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: removing ? '0fr' : '1fr',
      transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 200ms ${EASE_OUT}`,
      overflow: removing ? 'hidden' : 'visible',
    }}>
      <div style={{ minHeight: 0 }}>
        <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => { if (!removing) onDetail(req); }}
          style={{
            display: 'grid', gridTemplateColumns: gridCols,
            alignItems: 'center', gap: 'var(--space-150)', padding: '0 var(--space-250)', minHeight: 52,
            borderBottom: `1px solid ${P.border}`,
            background: selected ? '#f5f3ff' : hover ? P.bg : P.white,
            cursor: removing ? 'default' : 'pointer',
            transition: PREFERS_REDUCED_MOTION ? 'background 0.1s, opacity 100ms linear' : `background 0.1s, opacity 150ms ${EASE_OUT}`,
            opacity: removing ? 0 : 1,
            pointerEvents: removing ? 'none' : 'auto',
          }}>
          <input type="checkbox" checked={selected} onClick={e => e.stopPropagation()} onChange={() => onToggle(req.id)} style={{ cursor: 'pointer', accentColor: P.action }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', minWidth: 0 }}>
            <Avatar employeeId={req.employee} size={24} style={{ border: '2px solid #fff', boxSizing: 'content-box' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 500, color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</span>
          </div>
          {showEntity && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.entity || '—'}</span>}
          {showStatus && <StatusDot status={req.status} />}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-100)', minWidth: 0, overflow: 'hidden' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: LEAVE_COLORS[req.type] || P.inkFaint, border: `1.5px solid ${LEAVE_BORDER_COLORS[req.type] || P.border}`, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.type}</span>
            {req.document && <Icon name="paperclip" size={12} color={P.inkFaint} strokeWidth={1.75} style={{ flexShrink: 0 }} />}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink }}>{req.days} {req.days === 1 ? 'day' : 'days'}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink }}>{req.startDate}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: req.startDate === req.endDate ? P.inkFaint : P.ink }}>
            {req.startDate === req.endDate ? '—' : req.endDate}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <OverlapPopover req={req} overlapping={overlapping} empDept={emp.department} />
          </span>
          <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-050)' }}>
            {req.status === 'pending' && (<>
              <button title="Decline" onClick={e => { e.stopPropagation(); onDeclineDirectly ? onDeclineDirectly(req) : onDetail(req); }}
                onMouseEnter={e => { e.currentTarget.style.background = P.dangerBg; e.currentTarget.style.borderColor = P.dangerBorder; }}
                onMouseLeave={e => { e.currentTarget.style.background = P.dangerBg; e.currentTarget.style.borderColor = P.dangerBorder; }}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--alert-200)', background: P.dangerBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="X" size={14} color={P.danger} strokeWidth={2.5} />
              </button>
              <button title="Approve" onClick={() => onApprove(req.id)}
                onMouseEnter={e => { e.currentTarget.style.background = P.successBg; e.currentTarget.style.borderColor = P.successBorder; }}
                onMouseLeave={e => { e.currentTarget.style.background = P.successBg; e.currentTarget.style.borderColor = P.successBorder; }}
                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--success-200)', background: P.successBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="Check" size={14} color={P.success} strokeWidth={2.5} />
              </button>
            </>)}
            <ActionMenu req={req} onViewDetails={() => onDetail(req)} onViewInCalendar={onViewInCalendar} onEdit={() => onEdit(req)} onCancel={() => onCancel(req.id)} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add expense modal ──────────────────────────────────────────────────────
function AddExpenseModal({ categories, onClose, onSave, receiptRequired = false }) {
  const [empId, setEmpId] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || categories[0] || '');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; });
  const [note, setNote] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptLeaving, setReceiptLeaving] = useState(false);
  const [dropAccepted, setDropAccepted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});

  const acceptFile = (f) => {
    setDropAccepted(true);
    setTimeout(() => { setDropAccepted(false); setReceiptFile(f); }, 180);
  };
  const removeFile = () => {
    setReceiptLeaving(true);
    setTimeout(() => { setReceiptLeaving(false); setReceiptFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }, 150);
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const validate = () => {
    const errs = {};
    if (!empId) errs.empId = true;
    if (!category) errs.category = true;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) errs.amount = true;
    if (receiptRequired && !receiptFile) errs.receipt = true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const selectStyle = (hasErr) => ({
    width: '100%', padding: 'var(--space-100) var(--space-150)', borderRadius: 8,
    border: `1px solid ${hasErr ? P.danger : P.border}`,
    background: P.white, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)',
    color: P.ink, outline: 'none', appearance: 'none', cursor: 'pointer',
  });
  const inputStyle = (hasErr) => ({
    width: '100%', padding: 'var(--space-100) var(--space-150)', borderRadius: 8,
    border: `1px solid ${hasErr ? P.danger : P.border}`,
    background: P.white, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)',
    color: P.ink, outline: 'none', boxSizing: 'border-box',
  });
  const labelStyle = { fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-075)', display: 'block' };
  const sortedEmps = Object.entries(EMPLOYEES).sort((a,b) => a[1].name.localeCompare(b[1].name));

  return (
    <DrawerShell onClose={onClose} title="Add expense">
      {close => {
        const submit = () => {
          if (!validate()) return;
          const today = new Date();
          const day = today.getDate();
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const [ey, em, ed] = expenseDate.split('-').map(Number);
          const expDateFormatted = `${ed} ${months[em - 1]}`;
          onSave({ employee: empId, category, amount: parseFloat(amount), currency: 'EUR', description: note, receipt: receiptFile ? receiptFile.name : '', expenseDate: expDateFormatted, submittedAt: `${day} ${months[today.getMonth()]}` });
          close();
        };
        return (
          <>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
          <div>
            <label style={labelStyle}>Employee <span style={{ color: P.danger }}>*</span></label>
            <div style={{ position: 'relative' }}>
              <select value={empId} onChange={e => { setEmpId(e.target.value); setErrors(prev => ({ ...prev, empId: false })); }} style={selectStyle(errors.empId)}>
                <option value="">Select employee…</option>
                {sortedEmps.map(([id, emp]) => <option key={id} value={id}>{emp.name}</option>)}
              </select>
              <Icon name="chevron-down" size={14} color={P.inkFaint} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-200)' }}>
            <div>
              <label style={labelStyle}>Category <span style={{ color: P.danger }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle(errors.category)}>
                  {categories.map(c => { const name = c?.name ?? c; return <option key={name} value={name}>{name}</option>; })}
                </select>
                <Icon name="chevron-down" size={14} color={P.inkFaint} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Amount (EUR) <span style={{ color: P.danger }}>*</span></label>
              <input type="number" min="0" step="0.01" value={amount} onChange={e => { setAmount(e.target.value); setErrors(prev => ({ ...prev, amount: false })); }} placeholder="0.00" style={inputStyle(errors.amount)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Expense date <span style={{ color: P.danger }}>*</span></label>
            <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} style={inputStyle(false)} />
          </div>
          <div>
            <label style={labelStyle}>Note / description</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What was this expense for?" rows={3} style={{ ...inputStyle(false), resize: 'none', lineHeight: 1.5 }} />
          </div>
          <div>
            <label style={labelStyle}>Receipt {receiptRequired ? <span style={{ color: P.danger }}>*</span> : <span style={{ fontWeight: 400, color: errors.receipt ? P.danger : P.inkFaint }}>(optional)</span>}</label>
            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) acceptFile(e.target.files[0]); }} />
            {receiptFile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)', padding: 'var(--space-125) var(--space-200)', borderRadius: 8, border: `1px solid ${P.border}`, background: P.bg, opacity: receiptLeaving ? 0 : 1, transform: receiptLeaving ? 'translateX(6px)' : 'translateX(0)', transition: `opacity 150ms ${EASE_OUT}, transform 150ms ${EASE_OUT}`, animation: `fileRowIn 220ms ${EASE_OUT}` }}>
                <Icon name="paperclip" size={14} color={P.inkFaint} />
                <span style={{ flex: 1, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{receiptFile.name}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, flexShrink: 0 }}>{(receiptFile.size / 1024).toFixed(0)} KB</span>
                <button onClick={removeFile} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 'var(--space-025)', display: 'flex', alignItems: 'center', color: P.inkFaint }}>
                  <Icon name="x" size={14} strokeWidth={2} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) acceptFile(f); }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-075)', padding: 'var(--space-250) var(--space-200)', borderRadius: 8, border: `1.5px dashed ${dragging || dropAccepted ? P.action : errors.receipt ? P.danger : P.border}`, background: dragging ? '#f5f3ff' : dropAccepted ? '#ede9fe' : P.bg, cursor: 'pointer', transform: dropAccepted ? 'scale(1.02)' : 'scale(1)', transition: `border-color 120ms, background 120ms, transform 180ms ${EASE_OUT}` }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', transform: dragging ? 'translateY(-3px)' : 'translateY(0)', transition: `transform ${dragging ? `200ms ${EASE_OUT}` : `150ms ${EASE_BOUNCE}`}` }}>
                  <Icon name="upload" size={18} color={dragging || dropAccepted ? P.action : P.inkFaint} />
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: dragging || dropAccepted ? P.action : P.inkSoft, transition: `color 120ms` }}>
                  Drop a file or <span style={{ color: P.action, fontWeight: 600 }}>browse</span>
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint }}>PDF, PNG, JPG up to 10 MB</span>
              </div>
            )}
          </div>
        </div>
        <div style={{ flexShrink: 0, display: 'flex', gap: 'var(--space-125)', padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}` }}>
          <Button variant="secondary" onClick={close} style={{ flex: 1, justifyContent: 'center', color: P.inkSoft }}>Cancel</Button>
          <Button variant="primary" onClick={submit} style={{ flex: 2, justifyContent: 'center' }}>Add expense</Button>
        </div>
          </>
        );
      }}
    </DrawerShell>
  );
}

// ── Expense row ────────────────────────────────────────────────────────────
function ExpenseRow({ exp, onApprove, onDetail, onRejectDirectly, showStatus, showEntity, selected, onToggle, showApproveActions = true }) {
  const emp = EMPLOYEES[exp.employee] || { name: exp.employee, initials: '?', color: P.border };
  const [hover, setHover] = useState(false);
  const cb = showApproveActions ? '32px ' : '';
  const gridCols = showStatus
    ? (showEntity ? `${cb}1.8fr 0.8fr 1fr 1fr 2fr 0.8fr 0.7fr 96px` : `${cb}1.8fr 1fr 1fr 2fr 0.8fr 0.7fr 96px`)
    : (showEntity ? `${cb}1.8fr 0.8fr 1fr 2fr 0.8fr 0.7fr 96px` : `${cb}1.8fr 1fr 2fr 0.8fr 0.7fr 96px`);

  const amountStr = `€ ${exp.amount.toFixed(2).replace('.', ',')}`;

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => onDetail(exp)}
      style={{
        display: 'grid', gridTemplateColumns: gridCols,
        alignItems: 'center', gap: 'var(--space-150)', padding: '0 var(--space-250)', minHeight: 52,
        borderBottom: `1px solid ${P.border}`,
        background: selected ? '#f5f3ff' : hover ? P.bg : P.white,
        cursor: 'pointer',
        transition: `background 0.1s`,
      }}>
      {showApproveActions && <input type="checkbox" checked={!!selected} onClick={e => e.stopPropagation()} onChange={() => onToggle && onToggle(exp.id)} style={{ cursor: 'pointer', accentColor: P.action }} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', minWidth: 0 }}>
        <Avatar employeeId={exp.employee} size={24} style={{ border: '2px solid #fff', boxSizing: 'content-box' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 500, color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</span>
      </div>
      {showEntity && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.entity || '—'}</span>}
      {showStatus && <StatusDot status={exp.status} />}
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink }}>{exp.category}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-body-sm)', fontWeight: 600, color: P.ink }}>{amountStr}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkFaint }}>{exp.expenseDate}</span>
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-050)' }}>
        {showApproveActions && exp.status === 'pending' && (<>
          <button title="Reject" onClick={(e) => { e.stopPropagation(); onRejectDirectly(exp); }}
            onMouseEnter={e => { e.currentTarget.style.background = P.dangerBg; e.currentTarget.style.borderColor = P.dangerBorder; }}
            onMouseLeave={e => { e.currentTarget.style.background = P.dangerBg; e.currentTarget.style.borderColor = P.dangerBorder; }}
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--alert-200)', background: P.dangerBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="X" size={14} color={P.danger} strokeWidth={2.5} />
          </button>
          <button title="Approve" onClick={() => onApprove(exp.id)}
            onMouseEnter={e => { e.currentTarget.style.background = P.successBg; e.currentTarget.style.borderColor = P.successBorder; }}
            onMouseLeave={e => { e.currentTarget.style.background = P.successBg; e.currentTarget.style.borderColor = P.successBorder; }}
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--success-200)', background: P.successBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="Check" size={14} color={P.success} strokeWidth={2.5} />
          </button>
        </>)}
      </div>
    </div>
  );
}

// ── Expenses screen ─────────────────────────────────────────────────────────
function ExpensesScreen({ expenses, categories, onApprove, onDetail, onRejectDirectly, onAdd, appEntity = null, receiptAlwaysRequired = false, requireApproval = true, onGoToSettings }) {
  const EXP_PAGE_SIZE = 20;
  const categoryOpts = [['all', 'All categories'], ...categories.map(c => { const n = c?.name ?? c; return [n, n]; })];
  const MONTH_ORDER = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const MONTH_FULL = { Jan:'January',Feb:'February',Mar:'March',Apr:'April',May:'May',Jun:'June',Jul:'July',Aug:'August',Sep:'September',Oct:'October',Nov:'November',Dec:'December' };
  const allMonths = [...new Set(expenses.map(e => (e.expenseDate || e.submittedAt).split(' ').pop()))].sort((a, b) => MONTH_ORDER.indexOf(b) - MONTH_ORDER.indexOf(a));
  const monthOpts = [['all', 'All months'], ...allMonths.map(m => [m, MONTH_FULL[m] || m])];
  const [tab, setTab] = useState(requireApproval ? 'pending' : 'all');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [pillLeaving, setPillLeaving] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  useEffect(() => {
    if (selected.size === 0 && !pillLeaving) return;
    if (selected.size > 0) { setPillLeaving(false); return; }
    setPillLeaving(true);
    const t = setTimeout(() => setPillLeaving(false), 120);
    return () => clearTimeout(t);
  }, [selected.size]);
  const pendingCount = expenses.filter(e => e.status === 'pending').length;
  const filtered = (tab === 'pending' ? expenses.filter(e => e.status === 'pending')
    : tab === 'approved' ? expenses.filter(e => e.status === 'approved')
    : tab === 'declined' ? expenses.filter(e => e.status === 'rejected')
    : expenses)
    .filter(e => {
      const emp = EMPLOYEES[e.employee];
      if (searchText.trim() && !(emp?.name || e.employee).toLowerCase().includes(searchText.trim().toLowerCase())) return false;
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (deptFilter !== 'all' && emp?.department !== deptFilter) return false;
      if (monthFilter !== 'all' && (e.expenseDate || e.submittedAt).split(' ').pop() !== monthFilter) return false;
      return true;
    });
  const totalPages = Math.max(1, Math.ceil(filtered.length / EXP_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * EXP_PAGE_SIZE, safePage * EXP_PAGE_SIZE);
  const showStatus = requireApproval && tab === 'all';
  const showEntity = !appEntity;
  const cb = requireApproval ? '32px ' : '';
  const gridCols = showStatus
    ? (showEntity ? `${cb}1.8fr 0.8fr 1fr 1fr 2fr 0.8fr 0.7fr 96px` : `${cb}1.8fr 1fr 1fr 2fr 0.8fr 0.7fr 96px`)
    : (showEntity ? `${cb}1.8fr 0.8fr 1fr 2fr 0.8fr 0.7fr 96px` : `${cb}1.8fr 1fr 2fr 0.8fr 0.7fr 96px`);
  const toggleSelect = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = paginated.length > 0 && paginated.every(e => selected.has(e.id));
  const toggleAll = () => {
    if (allSelected) setSelected(prev => { const n = new Set(prev); paginated.forEach(e => n.delete(e.id)); return n; });
    else setSelected(prev => new Set([...prev, ...paginated.map(e => e.id)]));
  };
  const resetFilters = (fn) => { fn(); setPage(1); setSelected(new Set()); };
  const selectedPending = [...selected].filter(id => expenses.find(e => e.id === id)?.status === 'pending');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <PageHeader
        title="Expenses"
        subtitle={requireApproval ? "Review and approve team expense claims" : "Auto-approved · receipts required"}
        badge={appEntity ? (ENTITIES.find(e => e.id === appEntity)?.name) : null}
        tabs={requireApproval && (
          <TabBar
            tabs={[
              { id: 'pending', label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
              { id: 'approved', label: 'Approved' },
              { id: 'declined', label: 'Declined' },
              { id: 'all', label: 'All expenses' },
            ]}
            activeTab={tab}
            onTabChange={(v) => { setTab(v); setPage(1); setSelected(new Set()); }}
          />
        )}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
          {onGoToSettings && <Button variant="secondary" icon="Settings" onClick={onGoToSettings} />}
          <Button variant="primary" icon="Plus" onClick={() => setAddOpen(true)}>Add expense</Button>
        </div>
      </PageHeader>
      <FilterToolbar
        searchText={searchText} onSearch={v => resetFilters(() => setSearchText(v))}
        filter={categoryFilter} onFilter={v => resetFilters(() => setCategoryFilter(v))} filterOpts={categoryOpts}
        deptFilter={deptFilter} onDeptFilter={v => resetFilters(() => setDeptFilter(v))}
      >
        <FilterDropdown label="All months" active={monthFilter} opts={monthOpts} onSelect={v => resetFilters(() => setMonthFilter(v))} minWidth={130} />
      </FilterToolbar>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-250) var(--space-250)' }}>
        <div style={{ background: P.white, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'clip' }}>
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, alignItems: 'center', gap: 'var(--space-150)', padding: '0 var(--space-250)', height: 38, borderBottom: `1px solid ${P.border}`, background: P.bg, position: 'sticky', top: 0, zIndex: 5 }}>
            {requireApproval && <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ cursor: 'pointer', accentColor: P.action }} />}
            <TH>Submitted by</TH>
            {showEntity && <TH>Entity</TH>}
            {showStatus && <TH>Status</TH>}
            <TH>Category</TH>
            <TH>Note</TH>
            <TH>Amount</TH>
            <TH>Expense date</TH>
            <div />
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px var(--space-300)', textAlign: 'center' }}>
              <Icon name="receipt" size={32} color={P.border} style={{ marginBottom: 'var(--space-150)' }} />
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkFaint }}>No {tab === 'pending' ? 'pending ' : tab === 'approved' ? 'approved ' : tab === 'declined' ? 'declined ' : ''}expenses</div>
            </div>
          ) : paginated.map(exp => (
            <ExpenseRow key={exp.id} exp={exp} onApprove={onApprove} onDetail={onDetail} onRejectDirectly={onRejectDirectly} showStatus={showStatus} showEntity={showEntity} selected={selected.has(exp.id)} onToggle={toggleSelect} showApproveActions={requireApproval} />
          ))}
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-150) var(--space-050)', marginTop: 'var(--space-100)' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>
              {(safePage - 1) * EXP_PAGE_SIZE + 1}–{Math.min(safePage * EXP_PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-075)' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                style={{ padding: 'var(--space-075) var(--space-125)', borderRadius: 7, border: `1px solid ${P.border}`, background: P.white, cursor: safePage === 1 ? 'default' : 'pointer', opacity: safePage === 1 ? 0.4 : 1, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.ink }}>
                ← Prev
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                style={{ padding: 'var(--space-075) var(--space-125)', borderRadius: 7, border: `1px solid ${P.border}`, background: P.white, cursor: safePage === totalPages ? 'default' : 'pointer', opacity: safePage === totalPages ? 0.4 : 1, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.ink }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Bulk action bar */}
      {(selected.size > 0 || pillLeaving) && (
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
          <div style={{
            pointerEvents: pillLeaving ? 'none' : 'auto',
            background: P.action, borderRadius: 10, padding: 'var(--space-075) var(--space-200)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-125)',
            boxShadow: '0 6px 24px rgba(15,13,40,0.3)',
            animation: pillLeaving
              ? `pillFadeDown 120ms ${EASE_OUT} forwards`
              : `pillFadeUp 0.15s ${EASE_OUT}`,
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: '#fff' }}>
              {selected.size} selected
            </span>
            {requireApproval && selectedPending.length > 0 && (
              <button onClick={() => { selectedPending.forEach(id => onApprove(id)); setSelected(new Set()); }} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-075)',
                padding: 'var(--space-075) var(--space-150)', borderRadius: 7, border: 'none',
                background: P.success, color: '#fff', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)',
              }}>
                <Icon name="CheckCircle" size={12} color="#fff" strokeWidth={2} />
                Approve{selectedPending.length > 1 ? ` all ${selectedPending.length}` : ''}
              </button>
            )}
            <button onClick={() => setSelected(new Set())} style={{
              padding: 'var(--space-075) var(--space-125)', borderRadius: 7, border: '1px solid rgba(255,255,255,0.25)',
              background: 'transparent', color: '#fff', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)',
            }}>Clear</button>
          </div>
        </div>
      )}
      {addOpen && <AddExpenseModal categories={categories} receiptRequired={receiptAlwaysRequired} onClose={() => setAddOpen(false)} onSave={(exp) => { onAdd(exp); setAddOpen(false); }} />}
    </div>
  );
}

// ── Requests screen ────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

function RequestsScreen({ requests, onApprove, onDecline, onSave, onCancel, onViewInCalendar, onNav, appEntity = null }) {
  const showEntity = !appEntity;
  const [tab, setTab] = useState('pending');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [detailDeclineMode, setDetailDeclineMode] = useState(false);
  const [editReq, setEditReq] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const prevPendingIdsRef = useRef(new Set());
  const removalTimersRef = useRef(new Set());
  const [removingIds, setRemovingIds] = useState(() => new Set());
  useEffect(() => {
    const currentPendingIds = new Set(requests.filter(r => r.status === 'pending').map(r => r.id));
    const justLeft = [...prevPendingIdsRef.current].filter(id => !currentPendingIds.has(id));
    if (justLeft.length > 0) {
      setRemovingIds(prev => new Set([...prev, ...justLeft]));
      const t = setTimeout(() => {
        setRemovingIds(prev => {
          const next = new Set(prev);
          justLeft.forEach(id => next.delete(id));
          return next;
        });
        removalTimersRef.current.delete(t);
      }, 220);
      removalTimersRef.current.add(t);
    }
    prevPendingIdsRef.current = currentPendingIds;
  }, [requests]);
  useEffect(() => () => { removalTimersRef.current.forEach(clearTimeout); }, []);
  const [searchText, setSearchText] = useState('');
  const [leaveFilter, setLeaveFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const filtered = (tab === 'pending' ? requests.filter(r => r.status === 'pending')
    : tab === 'approved' ? requests.filter(r => r.status === 'approved')
    : tab === 'declined' ? requests.filter(r => r.status === 'rejected')
    : requests)
    .filter(r => {
      const emp = EMPLOYEES[r.employee];
      if (searchText.trim() && !(emp?.name || r.employee).toLowerCase().includes(searchText.trim().toLowerCase())) return false;
      if (leaveFilter !== 'all' && r.type !== leaveFilter) return false;
      if (deptFilter !== 'all' && emp?.department !== deptFilter) return false;
      return true;
    });
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, Math.max(1, pageCount));
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const toggleSelect = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = paginated.length > 0 && paginated.every(r => selected.has(r.id));
  const toggleAll = () => {
    if (allSelected) setSelected(prev => { const n = new Set(prev); paginated.forEach(r => n.delete(r.id)); return n; });
    else setSelected(prev => new Set([...prev, ...paginated.map(r => r.id)]));
  };
  const selectedPending = [...selected].filter(id => requests.find(r => r.id === id)?.status === 'pending');
  const displayRows = tab === 'pending'
    ? [...paginated, ...[...removingIds].filter(id => !paginated.some(r => r.id === id)).map(id => requests.find(r => r.id === id)).filter(Boolean)]
    : paginated;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <PageHeader
        title="Time off requests"
        subtitle="Manage your team's time off"
        badge={appEntity ? (ENTITIES.find(e => e.id === appEntity)?.name) : null}
        tabs={
          <TabBar
            tabs={[
              { id: 'pending', label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
              { id: 'approved', label: 'Approved' },
              { id: 'declined', label: 'Declined' },
              { id: 'all', label: 'All requests' },
            ]}
            activeTab={tab}
            onTabChange={(v) => { setTab(v); setSelected(new Set()); setPage(1); }}
          />
        }
      >
        <Button variant="primary" icon="Plus" onClick={() => setAddOpen(true)}>Add time off</Button>
      </PageHeader>
      <FilterToolbar
        searchText={searchText} onSearch={v => { setSearchText(v); setPage(1); }}
        filter={leaveFilter} onFilter={v => { setLeaveFilter(v); setPage(1); }}
        deptFilter={deptFilter} onDeptFilter={v => { setDeptFilter(v); setPage(1); }}
      >
        {selected.size > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
            {selectedPending.length > 0 && (
              <Button variant="primary" onClick={() => { selectedPending.forEach(id => onApprove(id)); setSelected(new Set()); }} style={{ padding: 'var(--space-075) var(--space-150)', fontSize: 'var(--fs-body-xs)', borderRadius: 7 }}>
                Approve{selectedPending.length > 1 ? ` all ${selectedPending.length}` : ''}
              </Button>
            )}
            <Button variant="secondary" onClick={() => setSelected(new Set())} style={{ padding: 'var(--space-075) var(--space-125)', fontSize: 'var(--fs-body-xs)', borderRadius: 7 }}>Clear</Button>
          </div>
        )}
      </FilterToolbar>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-250) var(--space-250)' }}>
      <div style={{ background: P.white, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'clip' }}>
        <div style={{ display: 'grid', gridTemplateColumns: (() => { const s = tab === 'all' || tab === 'declined'; if (s && showEntity) return '32px 1.2fr 0.8fr 1fr 1fr 0.7fr 0.7fr 1fr 1fr 96px'; if (s) return '32px 1.2fr 1fr 1fr 0.7fr 0.7fr 1fr 1fr 96px'; if (showEntity) return '32px 1.2fr 0.8fr 1fr 0.7fr 0.7fr 1fr 1fr 96px'; return '32px 1.2fr 1fr 0.7fr 0.7fr 1fr 1fr 96px'; })(), alignItems: 'center', gap: 'var(--space-150)', padding: '0 var(--space-250)', height: 38, borderBottom: `1px solid ${P.border}`, background: P.bg, position: 'sticky', top: 0, zIndex: 5 }}>
          <input type="checkbox" checked={allSelected} onChange={toggleAll} style={{ cursor: 'pointer', accentColor: P.action }} />
          <TH>Requested by</TH>{showEntity && <TH>Entity</TH>}{(tab === 'all' || tab === 'declined') && <TH>Status</TH>}<TH>Leave type</TH><TH>Duration</TH><TH>Date from</TH><TH>Date to</TH><TH>Also off</TH><div />
        </div>
        {displayRows.length === 0 ? (
          <div style={{ padding: '60px var(--space-300)', textAlign: 'center' }}>
            <Icon name="Inbox" size={32} color={P.border} style={{ marginBottom: 'var(--space-150)' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkFaint }}>No {tab === 'pending' ? 'pending ' : tab === 'approved' ? 'approved ' : tab === 'declined' ? 'declined ' : ''}requests</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginTop: 'var(--space-050)' }}>{tab === 'pending' ? 'New requests from your team will appear here.' : ''}</div>
          </div>
        ) : displayRows.map(req => (
          <RequestRow key={req.id} req={req} requests={requests} onApprove={onApprove} onDecline={onDecline} onDetail={r => { setDetailDeclineMode(false); setDetail(r); }} onDeclineDirectly={r => { setDetailDeclineMode(true); setDetail(r); }} onEdit={setEditReq} onCancel={onCancel} selected={selected.has(req.id)} onToggle={toggleSelect} onViewInCalendar={onViewInCalendar} showStatus={tab === 'all' || tab === 'declined'} showEntity={showEntity} removing={removingIds.has(req.id)} />
        ))}
        {filtered.length > 0 && (
          <div style={{ padding: 'var(--space-100) var(--space-200)', borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint }}>
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
            </span>
            {pageCount > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-050)' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-050)', padding: 'var(--space-050) var(--space-125)', borderRadius: 6,
                  border: `1px solid ${P.border}`, background: P.white, cursor: safePage === 1 ? 'default' : 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)',
                  color: safePage === 1 ? P.inkFaint : P.ink, opacity: safePage === 1 ? 0.5 : 1,
                }}>
                  <Icon name="ChevronLeft" size={13} color={safePage === 1 ? P.inkFaint : P.ink} strokeWidth={2} /> Prev
                </button>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, padding: '0 var(--space-075)' }}>
                  {safePage} / {pageCount}
                </span>
                <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={safePage === pageCount} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-050)', padding: 'var(--space-050) var(--space-125)', borderRadius: 6,
                  border: `1px solid ${P.border}`, background: P.white, cursor: safePage === pageCount ? 'default' : 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)',
                  color: safePage === pageCount ? P.inkFaint : P.ink, opacity: safePage === pageCount ? 0.5 : 1,
                }}>
                  Next <Icon name="ChevronRight" size={13} color={safePage === pageCount ? P.inkFaint : P.ink} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
      {detail && (
        <CalendarDrawer key={detail.id} req={detail} requests={requests} onClose={() => { setDetail(null); setDetailDeclineMode(false); }}
          onApprove={(id) => { onApprove(id); setDetail(null); }}
          onDecline={(id, reason) => { onDecline(id, reason); setDetail(null); }}
          onCancel={(id, reason) => { onCancel(id, reason); setDetail(null); }}
          onSave={(req) => { onSave(req); setDetail(req); }}
          initialDeclineMode={detailDeclineMode}
        />
      )}
      {(addOpen || editReq) && (
        <AddTimeOffModal
          existing={editReq || null}
          requests={requests}
          onClose={() => { setAddOpen(false); setEditReq(null); }}
          onSave={(req) => { onSave(req); setAddOpen(false); setEditReq(null); }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ── Team Absences Calendar ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

function buildAbsenceMap(requests) {
  const map = {};
  for (const req of requests.filter(r => r.status === 'approved' || r.status === 'pending')) {
    if (!map[req.employee]) map[req.employee] = {};
    if (req._selectedDates && req._selectedDates.length > 0) {
      for (const iso of req._selectedDates) {
        if (!map[req.employee][iso]) {
          map[req.employee][iso] = { type: req.type, status: req.status, requestId: req.id };
        }
      }
    } else {
      const start = parseDisplayDate(req.startDate);
      const end   = parseDisplayDate(req.endDate) || start;
      if (!start) continue;
      for (let d = new Date(start); d <= end; d = addDays(d, 1)) {
        const iso = isoDate(d);
        if (!map[req.employee][iso]) {
          map[req.employee][iso] = { type: req.type, status: req.status, requestId: req.id };
        }
      }
    }
  }
  return map;
}

// ── Month picker ───────────────────────────────────────────────────────────
function MonthPicker({ currentDate, onSelect, onClose }) {
  const [year, setYear] = useState(currentDate.getFullYear());
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  return (
    <div ref={ref} style={{
      position: 'absolute', top: 48, left: 0, zIndex: 60,
      background: P.white, border: `1px solid ${P.border}`, borderRadius: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: 'var(--space-200)', width: 280,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-125)' }}>
        <button onClick={() => setYear(y => y - 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 'var(--space-050)', display: 'flex' }}>
          <Icon name="ChevronLeft" size={14} color={P.inkSoft} />
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{year}</span>
        <button onClick={() => setYear(y => y + 1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 'var(--space-050)', display: 'flex' }}>
          <Icon name="ChevronRight" size={14} color={P.inkSoft} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-050)' }}>
        {MONTH_NAMES.map((name, i) => {
          const isCurrent = year === currentDate.getFullYear() && i === currentDate.getMonth();
          return (
            <button key={i} onClick={() => { onSelect(new Date(year, i, 1)); onClose(); }}
              style={{
                padding: 'var(--space-100) 0', borderRadius: 6, border: 'none',
                background: isCurrent ? P.action : 'transparent',
                color: isCurrent ? '#fff' : P.ink,
                cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)',
              }}
              onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.background = P.bg; }}
              onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}>
              {name.slice(0, 3)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── View mode switcher ─────────────────────────────────────────────────────
function ViewSwitcher({ mode, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const labels = { month: 'Month', '2week': '2 Weeks', week: 'Week' };

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-075)',
        padding: 'var(--space-075) 11px', border: `1px solid ${P.border}`, borderRadius: 7,
        background: P.action, color: '#fff', cursor: 'pointer',
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)',
      }}>
        {labels[mode]}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 4px)',
          background: P.white, border: `1px solid ${P.border}`, borderRadius: 8,
          boxShadow: '0 4px 16px rgba(15,13,40,0.1)', zIndex: 100, minWidth: 120, overflow: 'hidden',
        }}>
          {Object.entries(labels).map(([val, label]) => (
            <button key={val} onClick={() => { onChange(val); setOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: 'var(--space-100) var(--space-150)', border: 'none', cursor: 'pointer',
              background: mode === val ? '#f4f5f7' : 'transparent',
              fontFamily: 'var(--font-display)', fontWeight: mode === val ? 700 : 500,
              fontSize: 'var(--fs-body-sm)', color: P.ink,
            }}>{label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Filter toolbar ─────────────────────────────────────────────────────────
const LEAVE_FILTER_OPTS = [['all', 'All time-off types'], ['Statutory annual leave', 'Statutory annual leave'], ['ADV / RTT', 'ADV / RTT'], ['Extra-legal leave', 'Extra-legal leave'], ['Sick leave', 'Sick leave'], ['Special leave', 'Special leave']];

function FilterDropdown({ label, active, opts, onSelect, minWidth }) {
  const [open, setOpen] = useState(false);
  const { rendered: menuRendered, visible: menuVisible } = usePopoverTransition(open);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  const isFiltered = active !== opts[0][0];
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-075)',
        padding: 'var(--space-100) 11px', borderRadius: 7,
        border: `1px solid ${isFiltered ? P.ink : P.border}`,
        background: P.white, color: P.ink,
        cursor: 'pointer', fontFamily: 'var(--font-display)',
        fontWeight: isFiltered ? 700 : 500, fontSize: 'var(--fs-body-xs)',
      }}>
        {opts.find(([v]) => v === active)?.[1] ?? label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {menuRendered && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
          background: P.white, border: `1px solid ${P.border}`, borderRadius: 8,
          boxShadow: '0 4px 16px rgba(15,13,40,0.10)', minWidth: minWidth || 160, overflow: 'hidden',
          ...popoverStyle(menuVisible, 'top left'),
        }}>
          {opts.map(([val, lbl]) => (
            <button key={val} onClick={() => { onSelect(val); setOpen(false); }} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: 'var(--space-100) var(--space-150)', border: 'none', cursor: 'pointer',
              background: active === val ? '#f4f5f7' : 'transparent',
              fontFamily: 'var(--font-display)', fontWeight: active === val ? 700 : 500,
              fontSize: 'var(--fs-body-sm)', color: P.ink,
            }}>{lbl}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBar({ tabs, activeTab, onTabChange, padding = '0 28px' }) {
  const [ref, rect, animate] = useSlidingIndicator(activeTab);
  return (
    <div ref={ref} style={{ display: 'flex', gap: 'var(--space-300)', position: 'relative', padding }}>
      {tabs.map(({ id, label }) => (
        <button key={id} data-key={id} onClick={() => onTabChange(id)} style={{
          padding: 'var(--space-200) 0', border: 'none', background: 'transparent', cursor: 'pointer',
          fontFamily: 'var(--font-display)', fontWeight: activeTab === id ? 700 : 500, fontSize: 'var(--fs-body-sm)',
          color: activeTab === id ? P.ink : P.inkSoft, marginBottom: -1,
        }}>{label}</button>
      ))}
      <div style={{
        position: 'absolute', bottom: -1, height: 2, background: P.action, borderRadius: 1,
        left: rect.left, width: rect.width,
        transition: animate ? `left 250ms ${EASE_OUT}, width 250ms ${EASE_OUT}` : 'none',
      }} />
    </div>
  );
}

function PageHeader({ title, subtitle, badge, children, tabs, maxWidth: mw, noBorder, padding: paddingOverride }) {
  const inner = (
    <>
      <div style={{ padding: paddingOverride ?? (tabs ? '40px 28px 24px' : '40px 28px 20px'), display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          {badge && (
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: 'var(--space-025) var(--space-100)', borderRadius: 6,
              background: P.white, border: `1px solid ${P.border}`,
              fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft,
              letterSpacing: 0, marginBottom: 'var(--space-300)',
            }}>{badge}</span>
          )}
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>{title}</h1>
          {subtitle && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 'var(--space-050) 0 0' }}>{subtitle}</p>}
        </div>
        {children}
      </div>
      {tabs}
    </>
  );
  return (
    <div style={{ flexShrink: 0, borderBottom: noBorder ? 'none' : `1px solid ${P.border}` }}>
      {mw ? <div style={{ maxWidth: mw, margin: '0 auto' }}>{inner}</div> : inner}
    </div>
  );
}

function FilterToolbar({ searchText, onSearch, filter, onFilter, filterOpts, deptFilter, onDeptFilter, children }) {
  const deptOpts = [['all', 'All departments'], ...DEPARTMENTS.map(d => [d, d])];
  const resolvedOpts = filterOpts || LEAVE_FILTER_OPTS;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', padding: 'var(--space-300) var(--space-250) var(--space-200)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', border: `1px solid ${P.border}`, borderRadius: 7, padding: 'var(--space-100) var(--space-150)', width: 240, background: P.white }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={searchText} onChange={e => onSearch(e.target.value)} placeholder="Search employee" style={{
          border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.ink, width: '100%',
        }} />
      </div>
      <FilterDropdown label={resolvedOpts[0][1]} active={filter} opts={resolvedOpts} onSelect={onFilter} minWidth={170} />
      <FilterDropdown label="All departments" active={deptFilter} opts={deptOpts} onSelect={onDeptFilter} minWidth={160} />
      {children}
    </div>
  );
}

// ── Team absences screen ───────────────────────────────────────────────────
function TeamAbsencesScreen({ requests, pendingCount, onNav, onShowDetail, activeReqId, onSave, companyEvents = [], onCancelCompanyEvent, initialDate, initialDeptFilter, appEntity = null, leaveTypes = [] }) {
  const getLvColor = (type) => leaveTypes.find(lt => lt.name === type)?.color || LEAVE_COLORS[type] || '#2563eb';
  const getLvBorder = (type) => COLOR_TO_BORDER[getLvColor(type)] || LEAVE_BORDER_COLORS[type] || '#999';
  const today = new Date(); today.setHours(0,0,0,0);
  const todayISO = isoDate(today);

  // State
  const [viewMode, setViewMode] = useState('week');
  const [viewModeRef, viewModeRect, viewModeAnimate] = useSlidingIndicator(viewMode);
  const [refDate, setRefDate] = useState(() => initialDate || today);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeDepts, setActiveDepts] = useState(() => new Set(DEPARTMENTS));
  const [leaveFilter, setLeaveFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState(() => initialDeptFilter || 'all');
  const [expandedDepts, setExpandedDepts] = useState(() => new Set(DEPARTMENTS));
  const [tooltip, setTooltip] = useState(null);
  const [tooltipRendered, setTooltipRendered] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [cellDate, setCellDate] = useState(null);
  const [cellEmpId, setCellEmpId] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [halfHoveredCell, setHalfHoveredCell] = useState(null);
  const [hoveredCol, setHoveredCol] = useState(null);
  const [cellHalfDay, setCellHalfDay] = useState(null);
  const [absencesOnly, setAbsencesOnly] = useState(false);
  const [closureDetail, setClosureDetail] = useState(null);
  const [closureEditOpen, setClosureEditOpen] = useState(null);
  const tooltipTimerRef = useRef(null);
  const tooltipReqIdRef = useRef(null);

  // Keeps the last non-null tooltip content mounted while it fades out, and
  // lets left/top glide via CSS transition when hopping between adjacent
  // bars — instead of the old keyframe `animation` that only played once and
  // then snapped position on every reposition.
  useEffect(() => {
    if (tooltip) { setTooltipRendered(tooltip); return; }
    const t = setTimeout(() => setTooltipRendered(null), 120);
    return () => clearTimeout(t);
  }, [tooltip]);

  // Compute days for current view
  const days = useMemo(() => {
    if (viewMode === 'week') {
      const ws = weekStart(refDate);
      return Array.from({ length: 7 }, (_, i) => addDays(ws, i));
    }
    if (viewMode === '2week') {
      const ws = weekStart(refDate);
      return Array.from({ length: 14 }, (_, i) => addDays(ws, i));
    }
    // month
    const first = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    const ws = weekStart(first);
    const last = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
    const lastDay = last.getDay() || 7;
    const endDate = addDays(last, 7 - lastDay);
    const count = Math.round((endDate - ws) / 86400000);
    return Array.from({ length: count }, (_, i) => addDays(ws, i));
  }, [viewMode, refDate]);

  const dayISOs = useMemo(() => days.map(isoDate), [days]);

  // Build enriched absence map
  const absenceMap = useMemo(() => buildAbsenceMap(requests), [requests]);

  // Build dynamic closure set from company events
  const closureSet = useMemo(() => {
    const set = new Set(_collectiveSet);
    for (const ev of companyEvents) {
      for (const iso of (ev._selectedDates || [])) set.add(iso);
    }
    return set;
  }, [companyEvents]);
  const closureByDate = useMemo(() => {
    const map = {};
    for (const ev of companyEvents) {
      for (const iso of (ev._selectedDates || [])) map[iso] = ev;
    }
    return map;
  }, [companyEvents]);

  // Month label
  const monthLabel = useMemo(() => {
    if (viewMode === 'month') return MONTH_NAMES[refDate.getMonth()] + ' ' + refDate.getFullYear();
    const s = days[0], e = days[days.length - 1];
    const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
    if (sameMonth) return `${s.getDate()} – ${e.getDate()} ${s.toLocaleDateString('en-GB', { month: 'short' })} ${s.getFullYear()}`;
    const sameYear = s.getFullYear() === e.getFullYear();
    return `${s.getDate()} ${s.toLocaleDateString('en-GB', { month: 'short' })}${sameYear ? '' : ' ' + s.getFullYear()} – ${e.getDate()} ${e.toLocaleDateString('en-GB', { month: 'short' })} ${e.getFullYear()}`;
  }, [viewMode, refDate, days]);

  // Navigation step
  const step = (dir) => {
    setRefDate(d => {
      if (viewMode === 'month') return new Date(d.getFullYear(), d.getMonth() + dir, 1);
      if (viewMode === '2week') return addDays(d, dir * 14);
      return addDays(d, dir * 7);
    });
  };
  const goToday = () => setRefDate(new Date(today));

  // Filter employees
  const allDepartments = DEPARTMENTS;
  const toggleDept = (dept) => {
    setActiveDepts(prev => {
      const next = new Set(prev);
      next.has(dept) ? next.delete(dept) : next.add(dept);
      return next;
    });
  };
  const toggleExpand = (dept) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      next.has(dept) ? next.delete(dept) : next.add(dept);
      return next;
    });
  };

  const filteredEmployees = useMemo(() => {
    const search = searchText.toLowerCase();
    return Object.entries(EMPLOYEES).filter(([id, emp]) => {
      if (appEntity && emp.entityId !== appEntity) return false;
      if (!activeDepts.has(emp.department)) return false;
      if (deptFilter !== 'all' && emp.department !== deptFilter) return false;
      if (search && !emp.name.toLowerCase().includes(search)) return false;
      if (absencesOnly) {
        const hasAbsence = dayISOs.some(iso => {
          const entry = absenceMap[id]?.[iso];
          return entry && (leaveFilter === 'all' || entry.type === leaveFilter);
        });
        if (!hasAbsence) return false;
      }
      return true;
    });
  }, [searchText, activeDepts, deptFilter, absencesOnly, dayISOs, absenceMap, leaveFilter, appEntity]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const [id, emp] of filteredEmployees) {
      if (!groups[emp.department]) groups[emp.department] = [];
      groups[emp.department].push([id, emp]);
    }
    return groups;
  }, [filteredEmployees]);

  const calendarRowItems = useMemo(() => {
    if (appEntity) return filteredEmployees.map(([empId, emp]) => ({ type: 'employee', empId, emp }));
    const items = [];
    for (const entity of ENTITIES) {
      const entityEmps = filteredEmployees.filter(([, emp]) => emp.entityId === entity.id);
      if (!entityEmps.length) continue;
      items.push({ type: 'header', entity, count: entityEmps.length });
      for (const [empId, emp] of entityEmps) items.push({ type: 'employee', empId, emp });
    }
    return items;
  }, [filteredEmployees, appEntity]);

  // Summary row — how many people off per day
  const summary = useMemo(() => {
    return dayISOs.map(iso => {
      let out = 0;
      for (const [empId] of filteredEmployees) {
        const entry = absenceMap[empId]?.[iso];
        if (entry && (leaveFilter === 'all' || entry.type === leaveFilter)) out++;
      }
      return out;
    });
  }, [dayISOs, filteredEmployees, absenceMap, leaveFilter]);

  const totalFiltered = filteredEmployees.length;

  const firstNameCount = useMemo(() => {
    const counts = {};
    for (const [, emp] of filteredEmployees) {
      const first = emp.name.split(' ')[0];
      counts[first] = (counts[first] || 0) + 1;
    }
    return counts;
  }, [filteredEmployees]);

  const colCount = days.length;
  const nameColW = viewMode === 'week' ? 200 : 170;
  const gridCols = `${nameColW}px repeat(${colCount}, minmax(${viewMode === 'week' ? 80 : viewMode === '2week' ? 36 : 24}px, 1fr))`;

  const pending = requests.filter(r => r.status === 'pending');

  // Upcoming holidays
  const upcomingHolidays = BELGIAN_HOLIDAYS_2026.filter(h => h >= todayISO).slice(0, 3);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <PageHeader title="Team absences" subtitle="Track and plan team availability" badge={appEntity ? (ENTITIES.find(e => e.id === appEntity)?.name) : null}>
        <button onClick={() => setAddOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-100)', padding: 'var(--space-100) var(--space-250)', borderRadius: 8, border: 'none',
          background: P.action, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)',
        }}>
          <Icon name="Plus" size={14} color="#fff" strokeWidth={2.5} /> Add time off
        </button>
      </PageHeader>

      {/* Filter toolbar — full width */}
      <FilterToolbar
        searchText={searchText} onSearch={setSearchText}
        leaveFilter={leaveFilter} onLeaveFilter={setLeaveFilter}
        deptFilter={deptFilter} onDeptFilter={setDeptFilter}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', alignItems: 'flex-start' }}>
        {/* Left: calendar area */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Calendar card */}
          <div style={{ maxHeight: 'calc(100vh - 200px)', margin: '0 var(--space-250) var(--space-250)', background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
            {/* Calendar nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)', padding: 'var(--space-150) var(--space-200)', borderBottom: `1px solid ${P.border}`, flexShrink: 0, position: 'relative' }}>
              {/* Left group: Today, nav arrows, date label, Week/Month */}
              <button onClick={goToday} style={{
                padding: 'var(--space-075) var(--space-200)', borderRadius: 7, border: `1px solid ${P.border}`,
                background: 'transparent', cursor: 'pointer',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft,
              }}>Today</button>
              <button onClick={() => step(-1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 'var(--space-050)', display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button onClick={() => setMonthPickerOpen(o => !o)} style={{
                border: 'none', background: 'transparent', cursor: 'pointer', padding: 'var(--space-050) var(--space-075)', borderRadius: 6,
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink,
                minWidth: 160, textAlign: 'center',
              }}>{monthLabel}</button>
              <button onClick={() => step(1)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 'var(--space-050)', display: 'flex', alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <div ref={viewModeRef} style={{ display: 'flex', border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden', marginLeft: 'var(--space-050)', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, background: P.action,
                  left: viewModeRect.left, width: viewModeRect.width,
                  transition: viewModeAnimate ? `left 250ms ${EASE_OUT}, width 250ms ${EASE_OUT}` : 'none',
                }} />
                {[['week', 'Week'], ['month', 'Month']].map(([val, label]) => (
                  <button key={val} data-key={val} onClick={() => setViewMode(val)} style={{
                    position: 'relative', padding: 'var(--space-075) var(--space-200)', border: 'none', cursor: 'pointer', background: 'transparent',
                    fontFamily: 'var(--font-display)', fontWeight: viewMode === val ? 700 : 500,
                    fontSize: 'var(--fs-body-sm)', color: viewMode === val ? '#fff' : P.ink,
                    transition: `color 150ms ${EASE_OUT}`,
                  }}>{label}</button>
                ))}
              </div>

              <div style={{ flex: 1 }} />

              {/* Right: Absences only toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', cursor: 'pointer' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>Absences only</span>
                <Switch checked={absencesOnly} onChange={() => setAbsencesOnly(v => !v)} />
              </label>

              {monthPickerOpen && (
                <MonthPicker currentDate={refDate} onSelect={d => { setRefDate(d); }} onClose={() => setMonthPickerOpen(false)} />
              )}
            </div>

            {/* Scrollable grid */}
            <div style={{ flex: 1, overflow: 'auto' }} className="hide-scrollbar">
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: gridCols, position: 'sticky', top: 0, zIndex: 10, background: P.white, borderBottom: `1px solid ${P.border}` }}>
                <div style={{ padding: 'var(--space-075) var(--space-150)', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {filteredEmployees.length} people
                  </span>
                </div>
                {days.map((d, i) => {
                  const iso = dayISOs[i];
                  const isToday = iso === todayISO;
                  const isWknd = d.getDay() === 0 || d.getDay() === 6;
                  const isHoliday = _holidaySet.has(iso);
                  const isCollective = closureSet.has(iso);
                  const closureEv = closureByDate[iso];
                  const isWeekStart = viewMode === 'month' && d.getDay() === 1 && i > 0;
                  return (
                    <div key={i}
                      onClick={closureEv ? () => setClosureDetail(closureEv) : undefined}
                      onMouseEnter={() => setHoveredCol(iso)}
                      onMouseLeave={() => setHoveredCol(null)}
                      style={{
                      padding: 'var(--space-075) 0', textAlign: 'center',
                      background: isCollective ? '#faf6eb' : isHoliday ? '#f3f1fe' : isWknd ? P.bgSubtle : hoveredCol === iso ? 'rgba(99,102,241,0.04)' : 'transparent',
                      borderLeft: isWeekStart ? `2px solid ${P.borderStrong}` : `1px solid ${P.border}`,
                      cursor: closureEv ? 'pointer' : undefined,
                    }} title={isHoliday ? BELGIAN_HOLIDAY_NAMES[iso] : closureEv ? (closureEv.name || 'Company closure') : isCollective ? 'Company closed' : ''}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 9, color: P.inkFaint, letterSpacing: '0.06em' }}>
                        {DAY_LABELS[(d.getDay() + 6) % 7]}
                      </div>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', margin: '1px auto 0',
                        background: isToday ? P.action : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: isToday ? 700 : 500, fontSize: 'var(--fs-body-xs)', color: isToday ? '#fff' : isWknd ? P.inkFaint : P.ink }}>
                          {d.getDate()}
                        </span>
                      </div>
                      {(isHoliday || isCollective) && (
                        <div style={{ fontSize: 8, color: isCollective ? P.warningDark : '#7c3aed', fontFamily: 'var(--font-display)', fontWeight: 600, marginTop: 'var(--space-025)' }}>
                          {closureEv ? 'Closed' : isCollective ? 'Closed' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>


              {/* Employee rows */}
              {calendarRowItems.map((item) => {
                if (item.type === 'header') {
                  return (
                    <div key={`entity-header-${item.entity.id}`} style={{ display: 'grid', gridTemplateColumns: gridCols, borderBottom: `1px solid ${P.border}`, background: P.bg }}>
                      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', padding: '0 var(--space-150)', height: 26 }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', fontWeight: 600, color: P.inkSoft, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{item.entity.name} · {item.count}</span>
                      </div>
                    </div>
                  );
                }
                const { empId, emp } = item;
                return (
                  <React.Fragment key={empId}>
                    {[1].map(() => (
                      <div key={empId} style={{ display: 'grid', gridTemplateColumns: gridCols, borderBottom: `1px solid ${P.border}`, height: viewMode === 'week' ? 64 : 36 }}>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '0 var(--space-150)', gap: 'var(--space-100)', overflow: 'hidden' }}>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: viewMode === 'week' ? 12 : 11, fontWeight: viewMode === 'week' ? 500 : 400, color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {(() => {
                                if (viewMode === 'week') return emp.name;
                                const parts = emp.name.split(' ');
                                return firstNameCount[parts[0]] > 1 && parts.length > 1 ? `${parts[0]} ${parts[1].charAt(0)}.` : parts[0];
                              })()}
                            </div>
                          </div>
                        </div>
                        {dayISOs.map((iso, i) => {
                          const d = days[i];
                          const isToday = iso === todayISO;
                          const isWknd = d.getDay() === 0 || d.getDay() === 6;
                          const isHoliday = _holidaySet.has(iso);
                          const isCollective = closureSet.has(iso);
                          const entry = absenceMap[empId]?.[iso];
                          const show = entry && (leaveFilter === 'all' || entry.type === leaveFilter);
                          const barColor = show ? getLvColor(entry.type) : null;
                          const isPending = show && entry.status === 'pending';

                          // Connected bar styling
                          const prevEntry = absenceMap[empId]?.[dayISOs[i - 1]];
                          const nextEntry = absenceMap[empId]?.[dayISOs[i + 1]];
                          const isStart = show && (!prevEntry || prevEntry.requestId !== entry.requestId);
                          const isEnd = show && (!nextEntry || nextEntry.requestId !== entry.requestId);
                          const isWeekCard = viewMode === 'week' && isStart;
                          const fullReq = show ? requests.find(function(r) { return r.id === entry.requestId; }) : null;
                          const halfDayForDate = fullReq?._halfDay?.[iso];
                          const isHalfDayCell = !!(halfDayForDate && isWeekCard && isStart && isEnd);
                          const pt = viewMode === 'week' ? 8 : 3;
                          const pad = viewMode === 'week' ? 6 : 3;

                          const closureEv = closureByDate[iso];
                          const cellClickable = !show && closureEv;
                          const cellAddable = !show && !isWknd && !isHoliday && !isCollective;
                          const isHoveredAdd = cellAddable && hoveredCell === `${empId}-${iso}`;
                          const isCellWeekStart = viewMode === 'month' && d.getDay() === 1 && i > 0;

                          return (
                            <div key={iso}
                              onMouseEnter={(e) => {
                                setHoveredCol(iso);
                                if (cellClickable) {
                                  clearTimeout(tooltipTimerRef.current);
                                  const key = 'closure-' + closureEv.id;
                                  if (tooltipReqIdRef.current !== key) {
                                    tooltipReqIdRef.current = key;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setTooltip({ closure: closureEv, x: rect.left + rect.width / 2, y: rect.top - 4 });
                                  }
                                } else if (cellAddable) {
                                  setHoveredCell(`${empId}-${iso}`);
                                }
                              }}
                              onMouseLeave={() => {
                                setHoveredCol(null);
                                if (cellClickable) {
                                  tooltipTimerRef.current = setTimeout(() => { tooltipReqIdRef.current = null; setTooltip(null); }, 80);
                                } else if (cellAddable) {
                                  setHoveredCell(null);
                                }
                              }}
                              onClick={cellClickable ? () => setClosureDetail(closureEv) : cellAddable ? () => { setCellDate(iso); setCellEmpId(empId); setAddOpen(true); } : undefined}
                              style={{
                              borderLeft: isCellWeekStart ? `2px solid ${P.borderStrong}` : `1px solid ${P.border}`,
                              background: isCollective ? '#faf6eb' : isHoliday ? '#f3f1fe' : isWknd ? P.bgSubtle : isHoveredAdd ? P.bg : hoveredCol === iso ? 'rgba(99,102,241,0.04)' : 'transparent',
                              display: 'flex', alignItems: 'stretch',
                              paddingTop: pt, paddingBottom: pt,
                              paddingLeft: isStart ? pad : 0,
                              paddingRight: isEnd ? pad : 0,
                              cursor: (cellClickable || cellAddable) ? 'pointer' : undefined,
                            }}>
                              {!show && isHoveredAdd && (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <div style={{
                                    width: 22, height: 22, borderRadius: 6,
                                    background: P.white, border: `1px solid ${P.borderStrong}`,
                                    boxShadow: '0 1px 3px rgba(15,13,40,0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                  }}>
                                    <Icon name="Plus" size={12} color={P.inkSoft} strokeWidth={2.5} />
                                  </div>
                                </div>
                              )}
                              {show && isHalfDayCell ? (
                                ['am', 'pm'].map(function(half) {
                                  const isTaken = halfDayForDate === half;
                                  const halfKey = empId + '-' + iso + '-' + half;
                                  const isHalfHov = halfHoveredCell === halfKey;
                                  const barRadius = half === 'am' ? '5px 0 0 5px' : '0 5px 5px 0';
                                  return isTaken ? (
                                    <div key={half}
                                      onMouseEnter={(e) => {
                                        clearTimeout(tooltipTimerRef.current);
                                        if (tooltipReqIdRef.current !== entry.requestId) {
                                          tooltipReqIdRef.current = entry.requestId;
                                          const rect = e.currentTarget.getBoundingClientRect();
                                          if (fullReq) setTooltip({ req: fullReq, x: rect.left + rect.width / 2, y: rect.top - 4 });
                                        }
                                      }}
                                      onMouseLeave={() => {
                                        tooltipTimerRef.current = setTimeout(function() { tooltipReqIdRef.current = null; setTooltip(null); }, 80);
                                      }}
                                      onClick={() => { if (fullReq && onShowDetail) onShowDetail(fullReq); }}
                                      style={{
                                        flex: 1, borderRadius: barRadius, background: barColor,
                                        borderTop: isPending ? `1.5px dashed ${getLvBorder(entry.type)}` : 'none',
                                        borderBottom: isPending ? `1.5px dashed ${getLvBorder(entry.type)}` : 'none',
                                        borderLeft: isPending && half === 'am' ? `1.5px dashed ${getLvBorder(entry.type)}` : 'none',
                                        borderRight: isPending && half === 'pm' ? `1.5px dashed ${getLvBorder(entry.type)}` : 'none',
                                        boxShadow: activeReqId && entry.requestId === activeReqId ? `inset 0 0 0 2px ${getLvBorder(entry.type)}` : undefined,
                                        cursor: 'pointer',
                                        padding: 'var(--space-075) var(--space-100)',
                                        display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center',
                                        gap: 'var(--space-025)', overflow: 'hidden',
                                      }}>
                                      <WeekCard entry={entry} requestId={entry.requestId} requests={requests} isPending={isPending} />
                                    </div>
                                  ) : (
                                    <div key={half}
                                      onMouseEnter={() => setHalfHoveredCell(halfKey)}
                                      onMouseLeave={() => setHalfHoveredCell(null)}
                                      onClick={() => { setCellDate(iso); setCellEmpId(empId); setCellHalfDay(half); setAddOpen(true); }}
                                      style={{
                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', borderRadius: barRadius,
                                      }}>
                                      {isHalfHov && (
                                        <div style={{
                                          width: 22, height: 22, borderRadius: 6,
                                          background: P.white, border: `1px solid ${P.borderStrong}`,
                                          boxShadow: '0 1px 3px rgba(15,13,40,0.08)',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                          <Icon name="Plus" size={12} color={P.inkSoft} strokeWidth={2.5} />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              ) : show ? (
                                <div
                                  onMouseEnter={(e) => {
                                    clearTimeout(tooltipTimerRef.current);
                                    if (tooltipReqIdRef.current !== entry.requestId) {
                                      tooltipReqIdRef.current = entry.requestId;
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const found = requests.find(function(rr) { return rr.id === entry.requestId; });
                                      if (found) setTooltip({ req: found, x: rect.left + rect.width / 2, y: rect.top - 4 });
                                    }
                                  }}
                                  onMouseLeave={() => {
                                    tooltipTimerRef.current = setTimeout(() => {
                                      tooltipReqIdRef.current = null;
                                      setTooltip(null);
                                    }, 80);
                                  }}
                                  onClick={() => {
                                    const found = requests.find(function(rr) { return rr.id === entry.requestId; });
                                    if (found && onShowDetail) onShowDetail(found);
                                  }}
                                  style={{
                                    width: '100%',
                                    borderRadius: isStart && isEnd ? 5 : isStart ? '5px 0 0 5px' : isEnd ? '0 5px 5px 0' : 0,
                                    background: barColor,
                                    borderTop: isPending ? `1.5px dashed ${getLvBorder(entry.type)}` : 'none',
                                    borderBottom: isPending ? `1.5px dashed ${getLvBorder(entry.type)}` : 'none',
                                    borderLeft: isPending && isStart ? `1.5px dashed ${getLvBorder(entry.type)}` : 'none',
                                    borderRight: isPending && isEnd ? `1.5px dashed ${getLvBorder(entry.type)}` : 'none',
                                    boxShadow: activeReqId && entry.requestId === activeReqId ? `inset 0 0 0 2px ${getLvBorder(entry.type)}` : undefined,
                                    cursor: 'pointer',
                                    padding: isWeekCard ? '5px 8px' : 0,
                                    display: isWeekCard ? 'flex' : 'block',
                                    alignItems: isWeekCard ? 'center' : undefined,
                                    flexDirection: isWeekCard ? 'column' : undefined,
                                    justifyContent: isWeekCard ? 'center' : undefined,
                                    gap: isWeekCard ? 2 : undefined,
                                    overflow: 'hidden',
                                  }}
                                >
                                  {isWeekCard && (
                                    <WeekCard entry={entry} requestId={entry.requestId} requests={requests} isPending={isPending} />
                                  )}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Tooltip */}
            {tooltipRendered && (
              <div style={{
                position: 'fixed', left: tooltipRendered.x, top: tooltipRendered.y - 8,
                transform: 'translate(-50%, -100%)', zIndex: 100,
                background: P.action, color: '#fff', padding: 'var(--space-100) var(--space-150)', borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', lineHeight: 1.5,
                pointerEvents: 'none', whiteSpace: 'nowrap',
                opacity: tooltip ? 1 : 0,
                transition: `opacity 120ms ${EASE_OUT}, left 120ms ${EASE_OUT}, top 120ms ${EASE_OUT}`,
              }}>
                {tooltipRendered.closure ? (
                  <>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 'var(--space-025)' }}>{tooltipRendered.closure.name || 'Company closure'}</div>
                    <div>{tooltipRendered.closure.startDate}{tooltipRendered.closure.startDate !== tooltipRendered.closure.endDate ? ` – ${tooltipRendered.closure.endDate}` : ''} · {tooltipRendered.closure.days} {tooltipRendered.closure.days === 1 ? 'day' : 'days'}</div>
                    <div style={{ color: P.warningBorder }}>All employees</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 'var(--space-025)' }}>
                      {(EMPLOYEES[tooltipRendered.req.employee] || {}).name || tooltipRendered.req.employee}
                    </div>
                    <div>{tooltipRendered.req.type} · {tooltipRendered.req.days} {tooltipRendered.req.days === 1 ? 'day' : 'days'}</div>
                    <div>{tooltipRendered.req.startDate}{tooltipRendered.req.startDate !== tooltipRendered.req.endDate ? ` – ${tooltipRendered.req.endDate}` : ''}</div>
                    <div style={{ color: tooltipRendered.req.status === 'pending' ? '#fbbf24' : P.successBorder }}>
                      {tooltipRendered.req.status === 'pending' ? 'Pending approval' : 'Approved'}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
      {addOpen && (
        <AddTimeOffModal existing={null} requests={requests} defaultDate={cellDate} defaultEmployee={cellEmpId} defaultHalfDay={cellHalfDay} onClose={() => { setAddOpen(false); setCellDate(null); setCellEmpId(null); setCellHalfDay(null); }} onSave={(req) => { onSave(req); setAddOpen(false); setCellDate(null); setCellEmpId(null); setCellHalfDay(null); }} />
      )}

      {closureDetail && (
        <div onClick={() => setClosureDetail(null)} style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(15,13,40,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: P.white, borderRadius: 14, width: 420,
            boxShadow: '0 8px 40px rgba(15,13,40,0.18)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-250) var(--space-300)', borderBottom: `1px solid ${P.border}` }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink }}>Company closure</span>
              <button onClick={() => setClosureDetail(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 'var(--space-050)', display: 'flex' }}>
                <Icon name="X" size={18} color={P.inkSoft} />
              </button>
            </div>
            <div style={{ padding: 'var(--space-075) 0' }}>
              {[
                { label: 'Name', value: closureDetail.name || closureDetail.type },
                { label: 'When', value: <span>{closureDetail.startDate}{closureDetail.startDate !== closureDetail.endDate ? ` – ${closureDetail.endDate}` : ''}<br /><span style={{ color: P.inkSoft, fontSize: 'var(--fs-body-xs)' }}>{closureDetail.days} {closureDetail.days === 1 ? 'day' : 'days'}</span></span> },
                { label: 'Applies to', value: 'All employees' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '130px 1fr', padding: '11px var(--space-300)', borderBottom: `1px solid ${P.border}`, alignItems: 'start', gap: 'var(--space-150)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, paddingTop: 'var(--space-025)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-125)', padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}` }}>
              <button onClick={() => { const ev = closureDetail; setClosureDetail(null); setClosureEditOpen(ev); }} style={{
                padding: 'var(--space-100) var(--space-250)', borderRadius: 8, border: `1px solid ${P.border}`,
                background: P.white, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink,
              }}>Edit</button>
              <button onClick={() => { onCancelCompanyEvent(closureDetail.id); setClosureDetail(null); }} style={{
                padding: 'var(--space-100) var(--space-250)', borderRadius: 8, border: '1px solid var(--alert-200)',
                background: P.dangerBg, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.danger,
              }}>Cancel closure</button>
            </div>
          </div>
        </div>
      )}

      {closureEditOpen && (
        <AddTimeOffModal
          existing={closureEditOpen}
          requests={requests}
          onClose={() => setClosureEditOpen(null)}
          onSave={(req) => { onSave(req); setClosureEditOpen(null); }}
        />
      )}
    </div>
  );
}

function fmtBudget(n) {
  return n.toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' EUR';
}

function EmployeeRow({ emp, onNav }) {
  const [hover, setHover] = useState(false);
  return (
    <tr
      onClick={() => onNav('employee-detail:' + emp.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ borderBottom: `1px solid ${P.border}`, cursor: 'pointer', background: hover ? '#f7f8f7' : 'transparent', transition: `background 120ms ${EASE_OUT}`, height: 52 }}>
      <td style={{ padding: 'var(--space-125) var(--space-200)' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{emp.name}</span>
      </td>
      <td style={{ padding: 'var(--space-125) var(--space-200)', color: P.inkSoft }}>{emp.email}</td>
      <td style={{ padding: 'var(--space-125) var(--space-200)', color: P.inkSoft }}>{emp.entity}</td>
      <td style={{ padding: 'var(--space-125) var(--space-200)', textAlign: 'right', color: P.ink, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{fmtBudget(emp.budget)}</td>
      <td style={{ padding: 'var(--space-125) var(--space-200)', textAlign: 'right' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', fontWeight: 500, color: P.inkSoft }}>
          See details
        </span>
      </td>
    </tr>
  );
}

// ── Employees screen ──────────────────────────────────────────────────────
function EmployeesScreen({ requests, onNav, initialRoleFilter = 'All', adminAccess = {}, appEntity = null, onAddEmployee }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(initialRoleFilter);
  const [statusFilter, setStatusFilter] = useState('Active');

  const empList = useMemo(() => {
    return Object.entries(EMPLOYEES)
      .filter(([, emp]) => emp.isEmployee !== false && (!appEntity || emp.entityId === appEntity))
      .map(([id, emp]) => ({ id, ...emp }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [appEntity]);

  const filtered = useMemo(() => {
    return empList.filter(e => {
      const revoked = adminAccess && adminAccess[e.id] === 'revoked';
      if (roleFilter !== 'All' && (revoked || (e.role !== roleFilter && !(roleFilter === 'Admin' && adminAccess && e.id in adminAccess && !revoked)))) return false;
      if (statusFilter !== 'All' && e.status !== statusFilter) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [empList, search, roleFilter, statusFilter]);

  const selectStyle = { padding: 'var(--space-100) var(--space-400) var(--space-100) var(--space-125)', border: `1px solid ${P.border}`, borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, background: P.white, cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <PageHeader title="Employees" subtitle="Overview" badge={appEntity ? (ENTITIES.find(e => e.id === appEntity)?.name) : null}>
        <div style={{ display: 'flex', gap: 'var(--space-100)', paddingTop: 'var(--space-050)' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', padding: 'var(--space-100) var(--space-200)', border: `1px solid ${P.border}`, borderRadius: 8, background: P.white, color: P.ink, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 500, cursor: 'pointer' }}>
            <Icon name="Mail" size={14} /> Invite users
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', padding: 'var(--space-100) var(--space-200)', border: `1px solid ${P.border}`, borderRadius: 8, background: P.white, color: P.ink, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 500, cursor: 'pointer' }}>
            <Icon name="Settings2" size={14} /> Bulk actions
          </button>
          <button onClick={onAddEmployee} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', padding: 'var(--space-100) var(--space-200)', border: 'none', borderRadius: 8, background: P.action, color: P.white, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 600, cursor: 'pointer' }}>
            <Icon name="Plus" size={14} color={P.white} /> Add a user
          </button>
        </div>
      </PageHeader>

      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-250) var(--space-250) var(--space-250)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-125)', marginBottom: 'var(--space-200)' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 220 }}>
            <Icon name="Search" size={14} color={P.inkFaint} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name"
              style={{ width: '100%', padding: 'var(--space-100) var(--space-125) var(--space-100) var(--space-400)', border: `1px solid ${P.border}`, borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', background: P.white }} />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={selectStyle}>
            <option value="All">Role: All</option>
            <option value="Employee">Role: Employee</option>
            <option value="Admin">Role: Admin</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="All">Status: All</option>
            <option value="Active">Status: Active</option>
            <option value="Inactive">Status: Inactive</option>
          </select>
        </div>
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                <th style={{ textAlign: 'left', padding: 'var(--space-125) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>User name</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-125) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</th>
                <th style={{ textAlign: 'left', padding: 'var(--space-125) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Entity</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-125) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Budget balance</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-125) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <EmployeeRow key={emp.id} emp={emp} onNav={onNav} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Edit balances modal ────────────────────────────────────────────────────
const BALANCE_SECTIONS = [
  {
    label: 'Auto-calculated',
    types: ['ADV / RTT'],
    editable: false,
    calculated: true,
  },
  {
    label: 'Set by you',
    types: ['Statutory annual leave', 'Extra-legal leave'],
    editable: true,
  },
  {
    label: 'Set by law',
    types: ['Sick leave', 'Special leave'],
    editable: false,
    badge: 'Belgian law',
    defaults: { 'Sick leave': 30, 'Special leave': null },
  },
];

function EditBalancesModal({ emp, balances, onSave, onClose, isNewEmployee, onConfirm }) {
  const [values, setValues] = useState(() =>
    ['Statutory annual leave', 'Extra-legal leave'].reduce((acc, type) => {
      acc[type] = balances[type] != null ? String(balances[type]) : '';
      return acc;
    }, {})
  );

  const hrType = emp.gender === 'f' ? 'Maternity leave' : 'Paternity leave';
  const hrDefault = emp.gender === 'f' ? 105 : 10;
  const sections = [
    ...BALANCE_SECTIONS,
    { label: 'HR-initiated only', types: [hrType], editable: false, defaults: { [hrType]: hrDefault } },
  ];

  const { visible, close } = useModalTransition(onClose);

  const handleSave = () => {
    const next = { ...balances };
    for (const type of ['Statutory annual leave', 'Extra-legal leave']) {
      const v = parseInt(values[type], 10);
      next[type] = isNaN(v) ? 0 : Math.max(0, v);
    }
    onSave(next);
    if (isNewEmployee && onConfirm) onConfirm();
    close();
  };

  const year = new Date().getFullYear();

  return (
    <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,13,40,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...modalBackdropStyle(visible) }}>
      <div onClick={e => e.stopPropagation()} style={{ background: P.white, borderRadius: 14, width: 480, boxShadow: '0 8px 40px rgba(15,13,40,0.18)', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden', ...modalPanelStyle(visible) }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-250) var(--space-300)', borderBottom: `1px solid ${P.border}` }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink }}>{isNewEmployee ? 'Review & confirm balances' : 'Edit balances'}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginTop: 'var(--space-025)' }}>{emp.name} · {year}</div>
          </div>
          <button onClick={close} style={{
            border: 'none', cursor: 'pointer',
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(60,60,67,0.1)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          }}>
            <Icon name="X" size={14} color={P.ink} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto' }}>
          {sections.map((section, si) => (
            <div key={section.label} style={{ borderBottom: si < sections.length - 1 ? `1px solid ${P.border}` : 'none' }}>
              <div style={{ padding: 'var(--space-125) var(--space-300) var(--space-075)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {section.label}
              </div>
              {section.types.map((type, ti) => {
                const dot = LEAVE_COLORS[type] || '#2563eb';
                const isLast = ti === section.types.length - 1;
                if (section.editable) {
                  return (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-125) var(--space-300)', borderTop: ti > 0 ? `1px solid ${P.border}` : 'none' }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: dot, flexShrink: 0, marginRight: 'var(--space-125)' }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, flex: 1 }}>{type}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', border: `1px solid ${P.border}`, borderRadius: 7, padding: 'var(--space-075) var(--space-100)', background: P.bg }}>
                        <input
                          type="number" min="0"
                          value={values[type]}
                          onChange={e => setValues(v => ({ ...v, [type]: e.target.value }))}
                          placeholder="0"
                          style={{ width: 46, border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 600, color: P.ink, textAlign: 'center', background: 'transparent' }}
                        />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>days</span>
                      </div>
                    </div>
                  );
                } else {
                  const defaultVal = section.defaults?.[type];
                  const displayVal = balances[type] != null ? balances[type] : defaultVal;
                  return (
                    <div key={type} style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-125) var(--space-300)', borderTop: ti > 0 ? `1px solid ${P.border}` : 'none', opacity: section.calculated ? 1 : 0.7 }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: dot, flexShrink: 0, marginRight: 'var(--space-125)' }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, flex: 1 }}>{type}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
                        {section.calculated && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.success, background: P.successBg, padding: 'var(--space-025) var(--space-075)', borderRadius: 4 }}>Auto</span>}
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 600, color: section.calculated ? P.ink : P.inkSoft }}>{displayVal ?? '—'}</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>days</span>
                      </div>
                    </div>
                  );
                }
              })}
              <div style={{ height: 4 }} />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
          <span style={{ flex: 1 }} />
          <button onClick={close} style={{ padding: 'var(--space-100) var(--space-250)', borderRadius: 8, border: `1px solid ${P.border}`, background: 'transparent', color: P.ink, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: 'var(--space-100) var(--space-250)', borderRadius: 8, border: 'none', background: P.action, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>{isNewEmployee ? 'Confirm balances' : 'Save balances'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Employee detail screen ────────────────────────────────────────────────
function EmployeeDetailScreen({ employeeId, requests, onNav, onSave, onCancel, onApprove, onDecline, onViewTeamCalendar, employeeBalance, onUpdateBalance, needsSetup, confirmedDate, onConfirmBalances, onToast, adminAccess, onAdminSave, companyRegime, onEmployeeUpdate, getEmpWithOverrides, physicalCardsAllowed, mobilityWidgetState, initialTab = 'choices' }) {
  const emp = getEmpWithOverrides ? getEmpWithOverrides(employeeId) : EMPLOYEES[employeeId];
  const [activeTab, setActiveTab] = useState(initialTab);
  const tabMountedRef = useRef(false);
  useEffect(() => {
    if (!tabMountedRef.current) { tabMountedRef.current = true; return; }
    const s = `employee-detail:${employeeId}:${activeTab}`;
    history.replaceState({ screen: s }, '', screenToPath(s));
  }, [activeTab]);
  const [addModal, setAddModal] = useState(null); // null | 'add' | request object (edit)
  const [cancelAction, setCancelAction] = useState(null);
  const [editBalancesOpen, setEditBalancesOpen] = useState(false);
  const [detailReq, setDetailReq] = useState(null);
  const [empMenuOpen, setEmpMenuOpen] = useState(false);
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);
  const empMenuRef = useRef(null);
  const { rendered: empMenuRendered, visible: empMenuVisible } = usePopoverTransition(empMenuOpen);
  useEffect(() => {
    if (!empMenuOpen) return;
    const close = (e) => { if (empMenuRef.current && !empMenuRef.current.contains(e.target)) setEmpMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [empMenuOpen]);

  if (!emp) return <div style={{ padding: 'var(--space-300)' }}>Employee not found</div>;

  const empReqs = useMemo(() => {
    return requests.filter(r => r.employee === employeeId)
      .sort((a, b) => {
        const da = parseDisplayDate(a.startDate);
        const db = parseDisplayDate(b.startDate);
        return (db || 0) - (da || 0);
      });
  }, [requests, employeeId]);

  const balances = useMemo(() => {
    return ALL_LEAVE_TYPES.map(type => {
      const active = empReqs.filter(r => r.type === type && r.status !== 'rejected');
      const used = active.reduce((s, r) => s + (r.days || 1), 0);
      const defaultEntitled = type === 'Statutory annual leave' ? emp.entitlement : type === 'ADV / RTT' ? calcAdvDays(companyRegime || COMPANY_REGIME_DEFAULTS, emp) : type === 'Extra-legal leave' ? 4 : null;
      const entitled = (employeeBalance && employeeBalance[type] !== undefined) ? employeeBalance[type] : defaultEntitled;
      return { type, entitled, used, remaining: entitled != null ? Math.max(0, entitled - used) : null };
    });
  }, [empReqs, emp, employeeBalance]);

  const balancesForModal = useMemo(() =>
    Object.fromEntries(balances.filter(b => b.entitled != null).map(b => [b.type, b.entitled]))
  , [balances]);

  const tabs = [
    { id: 'choices', label: 'Choices' },
    { id: 'budgets', label: 'Budgets' },
    { id: 'card', label: 'Card' },
    { id: 'salary', label: 'Compensation' },
    { id: 'details', label: 'Details & roles' },
    { id: 'timeoff', label: 'Leave & absences' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${P.border}` }}>
      <div style={{ padding: 'var(--space-300) var(--space-400) 0' }}>
        <button onClick={() => onNav('employees')} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, flexShrink: 0,
          border: `1px solid ${P.border}`, background: P.white,
          cursor: 'pointer', borderRadius: 8, marginBottom: 'var(--space-300)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-250)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>{emp.name}</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 'var(--space-025) 0 0' }}>{emp.department}</p>
          </div>
          <div ref={empMenuRef} style={{ position: 'relative', marginTop: 'var(--space-050)' }}>
            <button onClick={() => setEmpMenuOpen(o => !o)} style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${empMenuOpen ? P.ink : P.border}`,
              background: empMenuOpen ? '#f0f0f2' : P.white,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="Ellipsis" size={15} color={empMenuOpen ? P.ink : P.inkSoft} />
            </button>
            {empMenuRendered && (
              <div style={{
                position: 'absolute', right: 0, top: 38, zIndex: 50,
                background: P.white, border: `1px solid ${P.border}`, borderRadius: 10,
                boxShadow: '0 4px 20px rgba(0,0,0,0.10)', width: 180, overflow: 'hidden',
                ...popoverStyle(empMenuVisible, 'top right'),
              }}>
                <button onClick={() => { setEmpMenuOpen(false); onToast && onToast({ message: `Impersonating ${emp.name.split(' ')[0]}…`, type: 'approve' }); }} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-100)',
                  width: '100%', padding: 'var(--space-100) var(--space-150)', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left',
                }} onMouseEnter={e => e.currentTarget.style.background = P.bg} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Icon name="monitor-smartphone" size={14} color={P.ink} strokeWidth={1.75} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink }}>Impersonate user</span>
                </button>
                <div style={{ height: 1, background: P.border, margin: '0 var(--space-150)' }} />
                <button onClick={() => { setEmpMenuOpen(false); setDeactivateConfirm(true); }} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-100)',
                  width: '100%', padding: 'var(--space-100) var(--space-150)', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left',
                }} onMouseEnter={e => e.currentTarget.style.background = P.dangerBg} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Icon name="user-x" size={14} color={P.danger} strokeWidth={1.75} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.danger }}>Deactivate employee</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} padding="0" />
      </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-500) var(--space-400) var(--space-400)' }}>
        {activeTab === 'timeoff' ? (
          <div>
            {needsSetup && (
              <div style={{ background: P.warningBg, border: '1px solid var(--warning-200)', borderRadius: 10, padding: 'var(--space-200) var(--space-250)', marginBottom: 'var(--space-250)', display: 'flex', alignItems: 'center', gap: 'var(--space-200)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.warningDark }}>Confirm {emp.name.split(' ')[0]}'s leave balances</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: '#78350f', marginTop: 'var(--space-025)' }}>These are company defaults — adjust any values if needed, then confirm so {emp.name.split(' ')[0]} can request time off.</div>
                </div>
                <button onClick={() => setEditBalancesOpen(true)} style={{ padding: 'var(--space-100) var(--space-200)', borderRadius: 8, border: 'none', background: P.action, color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  Review & confirm
                </button>
              </div>
            )}
            {/* Requested time off */}
            <div style={{ marginBottom: 'var(--space-500)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-150)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink }}>Requested time off</span>
                <Button variant="primary" icon="Plus" onClick={() => setAddModal('add')}>Add time off</Button>
              </div>
              {empReqs.filter(r => r.status === 'pending').length > 0 ? (
                <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'visible' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                        <th style={{ width: '20%', textAlign: 'left', padding: 'var(--space-100) var(--space-250)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date from</th>
                        <th style={{ width: '20%', textAlign: 'left', padding: 'var(--space-100) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date to</th>
                        <th style={{ width: '25%', textAlign: 'left', padding: 'var(--space-100) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Type</th>
                        <th style={{ width: '15%', textAlign: 'center', padding: 'var(--space-100) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Days</th>
                        <th style={{ width: '15%', textAlign: 'left', padding: 'var(--space-100) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                        <th style={{ width: 40 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {empReqs.filter(r => r.status === 'pending').map((req, idx, arr) => (
                        <tr key={req.id} onClick={() => setDetailReq(req)} style={{ borderBottom: idx < arr.length - 1 ? `1px solid ${P.border}` : 'none', cursor: 'pointer' }}>
                          <td style={{ padding: 'var(--space-150) var(--space-250)', fontSize: 'var(--fs-body-sm)', color: P.ink }}>{req.startDate}</td>
                          <td style={{ padding: 'var(--space-150) var(--space-200)', fontSize: 'var(--fs-body-sm)', color: req.endDate && req.endDate !== req.startDate ? P.ink : P.inkFaint }}>
                            {req.endDate && req.endDate !== req.startDate ? req.endDate : '—'}
                          </td>
                          <td style={{ padding: 'var(--space-150) var(--space-200)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
                              <span style={{ width: 10, height: 10, borderRadius: '50%', background: LEAVE_COLORS[req.type] || P.inkFaint, border: `1.5px solid ${LEAVE_BORDER_COLORS[req.type] || P.border}`, flexShrink: 0 }} />
                              <span style={{ fontSize: 'var(--fs-body-sm)', color: P.ink }}>{req.type}</span>
                            </div>
                          </td>
                          <td style={{ padding: 'var(--space-150) var(--space-200)', fontSize: 'var(--fs-body-sm)', textAlign: 'center', color: P.ink }}>
                            {req.days === 0.5 ? (
                              <span>{'½'}<span style={{ fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginLeft: 'var(--space-050)' }}>{req.halfDay || ''}</span></span>
                            ) : req.days || 1}
                          </td>
                          <td style={{ padding: 'var(--space-150) var(--space-200)' }}><StatusPill status={req.status} /></td>
                          <td style={{ padding: 'var(--space-125) var(--space-200)' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-050)' }}>
                              <button title="Decline" onClick={() => setDetailReq({ ...req, _declineMode: true })}
                                onMouseEnter={e => { e.currentTarget.style.background = P.dangerBg; e.currentTarget.style.borderColor = P.dangerBorder; }}
                                onMouseLeave={e => { e.currentTarget.style.background = P.dangerBg; e.currentTarget.style.borderColor = P.dangerBorder; }}
                                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--alert-200)', background: P.dangerBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon name="X" size={14} color={P.danger} strokeWidth={2.5} />
                              </button>
                              <button title="Approve" onClick={() => onApprove(req.id)}
                                onMouseEnter={e => { e.currentTarget.style.background = P.successBg; e.currentTarget.style.borderColor = P.successBorder; }}
                                onMouseLeave={e => { e.currentTarget.style.background = P.successBg; e.currentTarget.style.borderColor = P.successBorder; }}
                                style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--success-200)', background: P.successBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon name="Check" size={14} color={P.success} strokeWidth={2.5} />
                              </button>
                              <ActionMenu req={req}
                                onApprove={() => onApprove(req.id)}
                                onDecline={() => onDecline(req.id)}
                                onEdit={() => setAddModal(req)}
                                onCancel={() => setCancelAction(req)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: 'var(--space-300) var(--space-250)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkFaint }}>No pending requests</div>
                </div>
              )}
            </div>

            {/* Balances card */}
            <div style={{ marginBottom: 'var(--space-500)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-150)' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink }}>Balances <span style={{ fontWeight: 500, color: P.inkSoft }}>· {new Date().getFullYear()}</span></span>
                  {confirmedDate && (
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginTop: 'var(--space-025)' }}>Confirmed on {confirmedDate}</div>
                  )}
                </div>
                {!needsSetup && (
                  <button onClick={() => setEditBalancesOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', padding: 'var(--space-100) var(--space-250)', borderRadius: 8, border: `1px solid ${P.border}`, background: P.white, color: P.inkSoft, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>
                    <Icon name="Pencil" size={14} color={P.inkSoft} />
                    Edit balances
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-150)', flexWrap: 'wrap' }}>
                {balances.filter(b => b.entitled != null || b.type === 'ADV / RTT' || b.type === 'Extra-legal leave').map(b => {
                  const isLimited = b.entitled != null;
                  const isLow = isLimited && b.remaining === 0;
                  return (
                    <div key={b.type} style={{ flex: '1 1 160px', background: P.white, border: `1px solid ${P.border}`, borderRadius: 10, padding: 'var(--space-250) var(--space-300)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', marginBottom: 'var(--space-125)' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: LEAVE_COLORS[b.type], border: `1.5px solid ${LEAVE_BORDER_COLORS[b.type] || P.border}`, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>{b.type}</span>
                      </div>
                      {isLimited ? (
                        <>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, color: isLow ? P.danger : P.ink, lineHeight: 1 }}>
                            {b.remaining ?? 0}
                            <span style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 500, color: P.inkSoft }}> / {b.entitled} days</span>
                          </div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginTop: 'var(--space-075)' }}>{b.used} used</div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, color: P.ink, lineHeight: 1 }}>
                            {b.used}
                            <span style={{ fontSize: 'var(--fs-body-sm)', fontWeight: 500, color: P.inkSoft }}> days</span>
                          </div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginTop: 'var(--space-075)' }}>taken · no limit</div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Absence history */}
            <div>
              <div style={{ marginBottom: 'var(--space-150)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink }}>Absence history</span>
              </div>
              <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'visible' }}>
              {empReqs.filter(r => r.status !== 'pending').length === 0 ? (
                <EmptyState icon="calendar-off" title="No absences recorded yet" />
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                      <th style={{ width: '20%', textAlign: 'left', padding: 'var(--space-100) var(--space-250)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date from</th>
                      <th style={{ width: '20%', textAlign: 'left', padding: 'var(--space-100) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date to</th>
                      <th style={{ width: '25%', textAlign: 'left', padding: 'var(--space-100) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Type</th>
                      <th style={{ width: '15%', textAlign: 'center', padding: 'var(--space-100) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Days</th>
                      <th style={{ width: '15%', textAlign: 'left', padding: 'var(--space-100) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {empReqs.filter(r => r.status !== 'pending').map((req, idx, arr) => (
                      <tr key={req.id} onClick={() => setDetailReq(req)} style={{ borderBottom: idx < arr.length - 1 ? `1px solid ${P.border}` : 'none', cursor: 'pointer' }}>
                        <td style={{ padding: 'var(--space-150) var(--space-250)', fontSize: 'var(--fs-body-sm)', color: P.ink }}>{req.startDate}</td>
                        <td style={{ padding: 'var(--space-150) var(--space-200)', fontSize: 'var(--fs-body-sm)', color: req.endDate && req.endDate !== req.startDate ? P.ink : P.inkFaint }}>
                          {req.endDate && req.endDate !== req.startDate ? req.endDate : '—'}
                        </td>
                        <td style={{ padding: 'var(--space-150) var(--space-200)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: LEAVE_COLORS[req.type] || P.inkFaint, border: `1.5px solid ${LEAVE_BORDER_COLORS[req.type] || P.border}`, flexShrink: 0 }} />
                            <span style={{ fontSize: 'var(--fs-body-sm)', color: P.ink }}>{req.type}</span>
                          </div>
                        </td>
                        <td style={{ padding: 'var(--space-150) var(--space-200)', fontSize: 'var(--fs-body-sm)', textAlign: 'center', color: P.ink }}>
                          {req.days === 0.5 ? (
                            <span>{'½'}<span style={{ fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginLeft: 'var(--space-050)' }}>{req.halfDay || ''}</span></span>
                          ) : req.days || 1}
                        </td>
                        <td style={{ padding: 'var(--space-150) var(--space-200)' }}><StatusPill status={req.status} /></td>
                        <td style={{ padding: 'var(--space-125) var(--space-200)' }} onClick={e => e.stopPropagation()}>
                          <ActionMenu req={req}
                            onEdit={() => setAddModal(req)}
                            onCancel={() => setCancelAction(req)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              </div>
            </div>
          </div>
        ) : activeTab === 'choices' ? (
          <div><ChoicesTab empId={employeeId} /></div>
        ) : activeTab === 'budgets' ? (
          <div><BudgetsTab empId={employeeId} /></div>
        ) : activeTab === 'card' ? (
          <CardTab empId={employeeId} emp={emp} physicalCardsAllowed={physicalCardsAllowed} mobilityLive={!!(mobilityWidgetState && mobilityWidgetState.live)} onToast={onToast} onNav={onNav} />
        ) : activeTab === 'salary' ? (
          <div><SalaryTab empId={employeeId} emp={emp} companyRegime={companyRegime || COMPANY_REGIME_DEFAULTS} onEmployeeUpdate={onEmployeeUpdate} /></div>
        ) : activeTab === 'details' ? (
          <div><DetailsTab emp={emp} empId={employeeId} onNav={onNav} adminAccess={adminAccess} onAdminSave={onAdminSave} companyRegime={companyRegime || COMPANY_REGIME_DEFAULTS} onEmployeeUpdate={onEmployeeUpdate} /></div>
        ) : (
          <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: 'var(--space-300)', maxWidth: 480, color: P.inkFaint, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)' }}>
            Coming soon
          </div>
        )}
      </div>

      {addModal && (
        <AddTimeOffModal
          existing={addModal === 'add' ? { employee: employeeId, _lockEmployee: true } : { ...addModal, _lockEmployee: true }}
          requests={requests}
          onClose={() => setAddModal(null)}
          onSave={(req) => { onSave(req); setAddModal(null); }}
        />
      )}

      {cancelAction && (
        <ReasonModal
          title="Cancel absence"
          description={`You're cancelling ${emp.name}'s ${cancelAction.type}. This cannot be undone.`}
          confirmLabel="Cancel absence"
          onClose={() => setCancelAction(null)}
          onConfirm={(reason) => { onCancel(cancelAction.id, reason); setCancelAction(null); }}
        />
      )}

      {editBalancesOpen && (
        <EditBalancesModal
          emp={emp}
          balances={balancesForModal}
          onSave={onUpdateBalance}
          onClose={() => setEditBalancesOpen(false)}
          isNewEmployee={needsSetup}
          onConfirm={onConfirmBalances}
        />
      )}

      {detailReq && (
        <CalendarDrawer key={detailReq.id}
          req={detailReq}
          requests={requests}
          onClose={() => setDetailReq(null)}
          onApprove={(id) => { onApprove(id); setDetailReq(prev => prev?.id === id ? { ...prev, status: 'approved' } : prev); }}
          onDecline={(id, reason) => { onDecline(id, reason); setDetailReq(null); }}
          onCancel={(id, reason) => { onCancel(id, reason); setDetailReq(null); }}
          onSave={(req) => { onSave(req); setDetailReq(req); }}
        />
      )}

      {deactivateConfirm && (
        <ModalShell onClose={() => setDeactivateConfirm(false)} width={400}>
          {close => (
            <div style={{ padding: 'var(--space-400) var(--space-400) var(--space-300)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: P.dangerBg, border: '1px solid var(--alert-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-200)' }}>
                <Icon name="user-x" size={18} color={P.danger} strokeWidth={1.75} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink, marginBottom: 'var(--space-075)' }}>Deactivate {emp.name}?</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-300)', lineHeight: 1.5 }}>
                {emp.name.split(' ')[0]} will lose access to Payflip immediately. Their data and history will be preserved.
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-100)', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={close} style={{ padding: 'var(--space-100) var(--space-200)', color: P.inkSoft }}>Cancel</Button>
                <Button variant="primary" onClick={() => { close(); onToast && onToast({ message: `${emp.name.split(' ')[0]} deactivated`, type: 'decline' }); }} style={{ padding: 'var(--space-100) var(--space-200)', background: P.danger }}>
                  Deactivate
                </Button>
              </div>
            </div>
          )}
        </ModalShell>
      )}
    </div>
  );
}

// ── Dashboard screen ──────────────────────────────────────────────────────
function DashboardListRow({ onClick, children }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-125) var(--space-250)',
      borderBottom: `1px solid ${P.border}`, cursor: 'pointer',
      background: hover ? P.bg : 'transparent', transition: `background 120ms ${EASE_OUT}`,
    }}>
      {children}
    </div>
  );
}

const PAYFLIP_CARD_IMG = 'assets/card.svg';
const TWIKEY_LOGO_IMG = 'assets/twikey 1.png';

// ── CardTab — manage an employee's Payflip Card ───────────────────────────
function CardTab({ empId, emp, mobilityLive, onToast, onNav }) {
  const seed = CARD_SEED[empId];
  const initialStatus = seed ? seed.status : 'not_invited';
  const [status, setStatus] = useState(initialStatus);
  const [freezeConfirmOpen, setFreezeConfirmOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [lostConfirmOpen, setLostConfirmOpen] = useState(false);
  const [lostReportedAt, setLostReportedAt] = useState(null);
  const [displayPan, setDisplayPan] = useState(seed?.pan);
  const [reissued, setReissued] = useState(false);
  const [isReissuing, setIsReissuing] = useState(false);

  const isFrozen = status === 'frozen';
  const isBlocked = status === 'blocked';
  const isPending = status === 'card_requested';
  const isDownloaded = status === 'app_downloaded';
  const isInvited = status === 'invited';
  const isNotInvited = status === 'not_invited';
  const hasActiveCard = status === 'active' || isFrozen;

  const cardStatusMeta = {
    active:         { label: 'Active',          bg: P.successBg, color: P.success },
    frozen:         { label: 'Frozen',          bg: '#f0f9ff', color: '#0369a1' },
    blocked:        { label: 'Blocked',         bg: P.dangerBg, color: P.danger },
    card_requested: { label: 'Card requested',  bg: '#fef9c3', color: '#ca8a04' },
    app_downloaded: { label: 'App downloaded',  bg: '#f0f9ff', color: '#0369a1' },
    invited:        { label: 'Invite sent',     bg: '#f5f3ff', color: '#7c3aed' },
    not_invited:    { label: 'Not enrolled',    bg: P.bg,      color: P.inkSoft },
  };
  const meta = cardStatusMeta[status] || cardStatusMeta.not_invited;
  const first = emp.name.split(' ')[0];

  if (!mobilityLive && !seed) {
    return (
      <div style={{ maxWidth: 520 }}>
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: 'var(--space-400)', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: P.bg, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="credit-card" size={22} color={P.inkSoft} strokeWidth={1.5} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink, marginBottom: 'var(--space-075)' }}>Payflip Card not set up</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.55, marginBottom: 'var(--space-250)' }}>
            The mobility card program hasn't been launched yet. Set it up from the dashboard to invite employees and fund the account.
          </div>
          <Button variant="secondary" icon="arrow-up-right" onClick={() => onNav && onNav('dashboard')}>Go to dashboard</Button>
        </div>
      </div>
    );
  }

  if (isNotInvited) {
    return (
      <div style={{ maxWidth: 520 }}>
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 14, padding: 'var(--space-400)', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: P.bg, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Icon name="mail" size={22} color={P.inkSoft} strokeWidth={1.5} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink, marginBottom: 'var(--space-075)' }}>Not enrolled</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.55, marginBottom: 'var(--space-250)' }}>
            {first} hasn't been invited to the Payflip Card program. You can send them an invite from the dashboard.
          </div>
          <Button variant="primary" icon="send" onClick={() => { setStatus('invited'); onToast && onToast({ message: `Invite sent to ${first}`, type: 'approve' }); }}>
            Send invite
          </Button>
        </div>
      </div>
    );
  }

  const actionBtn = (onClick, icon, label, opts = {}) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 'var(--space-125)', padding: '11px var(--space-250)', width: '100%',
      border: 'none', borderBottom: `1px solid ${P.border}`, background: 'transparent',
      cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)',
      color: opts.color || P.ink, transition: 'background 120ms', textAlign: 'left',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = P.bg; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ width: 32, height: 32, borderRadius: 8, background: P.bg, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={14} color={opts.color || P.inkSoft} strokeWidth={opts.sw || 1.75} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block' }}>{label}</span>
        {opts.sublabel && <span style={{ display: 'block', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginTop: 'var(--space-025)' }}>{opts.sublabel}</span>}
      </span>
      <Icon name="chevron-right" size={14} color={P.inkFaint} strokeWidth={1.5} />
    </button>
  );

  const quickActionCircles = (
    <div style={{ display: 'flex', gap: 'var(--space-400)' }}>
      {hasActiveCard && [
        { icon: isFrozen ? 'play' : 'snowflake', label: isFrozen ? 'Unfreeze' : 'Freeze card', onClick: () => setFreezeConfirmOpen(true), color: isFrozen ? '#1d4ed8' : P.inkSoft },
        { icon: 'alert-triangle', label: 'Report lost', onClick: () => setLostConfirmOpen(true), color: P.inkSoft, disabled: !!lostReportedAt },
        { icon: 'refresh-cw', label: 'Replace card', onClick: () => setReplaceConfirmOpen(true), color: P.inkSoft },
        { icon: 'ban', label: 'Block card', onClick: () => setBlockConfirmOpen(true), color: P.inkSoft },
      ].map(({ icon, label, onClick, color, disabled }) => (
        <div key={icon} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-075)', opacity: disabled ? 0.4 : 1, transition: 'opacity 200ms' }}>
          <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
            width: 48, height: 48, borderRadius: '50%', border: `1px solid ${P.border}`,
            background: P.white, cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 120ms',
          }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = P.bg; }}
            onMouseLeave={e => { e.currentTarget.style.background = P.white; }}
          >
            <Icon name={icon} size={18} color={color} strokeWidth={1.75} />
          </button>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, textAlign: 'center', whiteSpace: 'nowrap' }}>{label}</span>
        </div>
      ))}
      {(isInvited || isDownloaded) && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-075)' }}>
          <button onClick={() => { onToast && onToast({ message: `Invite resent to ${first}`, type: 'approve' }); }} style={{
            width: 48, height: 48, borderRadius: '50%', border: `1px solid ${P.border}`,
            background: P.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 120ms',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = P.bg; }}
            onMouseLeave={e => { e.currentTarget.style.background = P.white; }}
          >
            <Icon name="send" size={18} color={P.inkSoft} strokeWidth={1.75} />
          </button>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, textAlign: 'center' }}>Resend invite</span>
        </div>
      )}
    </div>
  );

  const txTh = { textAlign: 'left', padding: 'var(--space-100) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' };
  const recentActivityPanel = hasActiveCard && seed?.txs?.length > 0 && (
    <div style={{ maxWidth: 620 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink, marginBottom: 'var(--space-150)' }}>Recent activity</div>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}` }}>
              <th style={{ ...txTh, paddingLeft: 'var(--space-200)' }}>Merchant</th>
              <th style={txTh}>Date</th>
              <th style={{ ...txTh, textAlign: 'right', paddingRight: 'var(--space-200)' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {seed.txs.map((tx, i) => (
              <tr key={i} style={{ borderBottom: i < seed.txs.length - 1 ? `1px solid ${P.border}` : 'none' }}>
                <td style={{ padding: '11px var(--space-200)', display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: P.bg, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={tx.icon || 'credit-card'} size={14} color={P.inkSoft} strokeWidth={1.75} />
                  </div>
                  <span style={{ fontWeight: 500, color: P.ink }}>{tx.merchant}</span>
                </td>
                <td style={{ padding: '11px var(--space-200)', color: P.inkSoft, whiteSpace: 'nowrap' }}>{tx.date}</td>
                <td style={{ padding: '11px var(--space-200)', textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 600, color: P.ink, whiteSpace: 'nowrap' }}>€{tx.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: 'var(--space-250)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)', marginBottom: 'var(--space-050)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink }}>
            {seed?.cardType === 'physical' ? 'Physical' : 'Virtual'} card ···· {displayPan}
          </span>
          <DotPill bg={meta.bg} color={meta.color}>{meta.label}</DotPill>
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>
          {hasActiveCard && (reissued ? 'Credentials reissued · just now' : (seed?.lastTx && `Last used ${seed.lastTx}`))}
          {isInvited && `Invite sent ${seed?.invitedDate || ''}`}
          {isDownloaded && 'App downloaded · Card not yet requested'}
          {isPending && 'Card request pending · Awaiting issuance'}
          {isNotInvited && 'Not yet enrolled in Payflip Card'}
        </div>
      </div>

      {/* Card + action circles side by side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-500)', marginBottom: 'var(--space-600)' }}>
        <div style={{ flexShrink: 0, position: 'relative' }}>
          <div style={{ opacity: isFrozen ? 0.5 : isBlocked ? 0.25 : isReissuing ? 0.6 : 1, filter: (isFrozen || isBlocked) ? 'saturate(0)' : 'none', transition: 'opacity 400ms, filter 400ms' }}>
            <img src={PAYFLIP_CARD_IMG} alt="Payflip Card" style={{ width: 240, height: 151, display: 'block', borderRadius: 14, boxShadow: '0 6px 20px rgba(15,13,40,0.2)' }} />
          </div>
          {isBlocked && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                <Icon name="ban" size={22} color={P.danger} strokeWidth={1.75} />
              </div>
            </div>
          )}
          {isReissuing && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                <span className="spin-cw" style={{ display: 'flex', animation: 'spinCW 900ms linear infinite' }}>
                  <Icon name="refresh-cw" size={20} color={P.inkSoft} strokeWidth={1.75} />
                </span>
              </div>
            </div>
          )}
        </div>
        {isBlocked ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-075)', maxWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
              <Icon name="ban" size={14} color={P.inkSoft} strokeWidth={2} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>Card permanently blocked</span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.55 }}>{first} can request a new card from the Payflip app.</div>
          </div>
        ) : quickActionCircles}
      </div>

      {/* Recent activity — below, not beside */}
      {recentActivityPanel}

      {/* Freeze confirm */}
      {freezeConfirmOpen && (
        <ModalShell title={isFrozen ? 'Unfreeze card' : 'Freeze card'} onClose={() => setFreezeConfirmOpen(false)} width={420}
          footer={close => (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-100)', padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}` }}>
              <Button variant="secondary" onClick={close}>Keep card</Button>
              <Button variant="primary" onClick={() => {
                setStatus(isFrozen ? 'active' : 'frozen'); close();
                onToast && onToast({ message: isFrozen ? `${first}'s card unfrozen` : `${first}'s card frozen`, type: isFrozen ? 'approve' : 'decline' });
              }}>{isFrozen ? 'Yes, unfreeze' : 'Yes, freeze'}</Button>
            </div>
          )}
        >
          <div style={{ padding: 'var(--space-250) var(--space-300)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', marginBottom: 'var(--space-200)' }}>
              <img src={PAYFLIP_CARD_IMG} alt="" style={{ width: 52, height: 33, borderRadius: 5, display: 'block', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink, marginBottom: 'var(--space-025)' }}>{emp.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>{seed?.cardType === 'physical' ? 'Physical' : 'Virtual'} card ···· {displayPan || '—'}</div>
              </div>
            </div>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.55 }}>
              {isFrozen
                ? `Payments will resume immediately. ${first} won't be notified.`
                : `All payments will be blocked immediately — the card will show as frozen in the app. ${first} won't be notified. You can unfreeze at any time.`}
            </p>
          </div>
        </ModalShell>
      )}

      {/* Lost or stolen confirm */}
      {lostConfirmOpen && (
        <ModalShell title="Report lost or stolen" onClose={() => setLostConfirmOpen(false)} width={420}
          footer={close => (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-100)', padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}` }}>
              <Button variant="secondary" onClick={close}>Keep card</Button>
              <Button variant="primary" style={{ background: P.danger }} onClick={() => {
                const newPan = String(Math.floor(1000 + Math.random() * 9000));
                setDisplayPan(newPan);
                setStatus('active');
                setLostReportedAt(Date.now());
                setTimeout(() => setLostReportedAt(null), 8000);
                close();
                onToast && onToast({ message: `${first}'s card cancelled — replacement issued`, type: 'approve' });
              }}>Report and replace</Button>
            </div>
          )}
        >
          <div style={{ padding: 'var(--space-250) var(--space-300)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', marginBottom: 'var(--space-200)' }}>
              <img src={PAYFLIP_CARD_IMG} alt="" style={{ width: 52, height: 33, borderRadius: 5, display: 'block', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink, marginBottom: 'var(--space-025)' }}>{emp.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>{seed?.cardType === 'physical' ? 'Physical' : 'Virtual'} card ···· {displayPan || '—'}</div>
              </div>
            </div>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.55 }}>
              The current card will be cancelled immediately and a new virtual card number issued — {first} can use it right away. This cannot be undone.
            </p>
          </div>
        </ModalShell>
      )}

      {/* Replace confirm */}
      {replaceConfirmOpen && (
        <ModalShell title="Replace card" onClose={() => setReplaceConfirmOpen(false)} width={420}
          footer={close => (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-100)', padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}` }}>
              <Button variant="secondary" onClick={close}>Keep card</Button>
              <Button variant="primary" onClick={() => {
                const newPan = String(Math.floor(1000 + Math.random() * 9000));
                setIsReissuing(true); setStatus('active'); close();
                setTimeout(() => { setIsReissuing(false); setReissued(true); setDisplayPan(newPan); onToast && onToast({ message: `Card reissued for ${first}`, type: 'approve' }); }, 900);
              }}>Reissue card</Button>
            </div>
          )}
        >
          <div style={{ padding: 'var(--space-250) var(--space-300)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', marginBottom: 'var(--space-200)' }}>
              <img src={PAYFLIP_CARD_IMG} alt="" style={{ width: 52, height: 33, borderRadius: 5, display: 'block', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink, marginBottom: 'var(--space-025)' }}>{emp.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>{seed?.cardType === 'physical' ? 'Physical' : 'Virtual'} card ···· {displayPan || '—'}</div>
              </div>
            </div>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.55 }}>
              A new card number, security code, and expiry date will be issued. {first} will be notified and will need to update any saved payment methods that use the old card.
            </p>
          </div>
        </ModalShell>
      )}

      {/* Block confirm */}
      {blockConfirmOpen && (
        <ModalShell title="Block card" onClose={() => setBlockConfirmOpen(false)} width={420}
          footer={close => (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-100)', padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}` }}>
              <Button variant="secondary" onClick={close}>Keep card</Button>
              <Button variant="primary" style={{ background: P.danger }} onClick={() => { close(); setStatus('blocked'); onToast && onToast({ message: `${first}'s card blocked`, type: 'decline' }); }}>Block card</Button>
            </div>
          )}
        >
          <div style={{ padding: 'var(--space-250) var(--space-300)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', marginBottom: 'var(--space-200)' }}>
              <img src={PAYFLIP_CARD_IMG} alt="" style={{ width: 52, height: 33, borderRadius: 5, display: 'block', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink, marginBottom: 'var(--space-025)' }}>{emp.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>{seed?.cardType === 'physical' ? 'Physical' : 'Virtual'} card ···· {displayPan || '—'}</div>
              </div>
            </div>
            <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.55 }}>
              {first}'s card will be permanently blocked. This cannot be undone — {first} will need to request a new card from the Payflip app.
            </p>
            <p style={{ margin: 'var(--space-125) 0 0', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.55 }}>
              {first} won't be notified — their card will simply stop working.
            </p>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

// Pointer tracked on the outer flat wrapper; inner card rotates via CSS custom props.
// Per transitions-dev/19-card-tilt.md — MAX raised to 24° for a stronger lean; perspective tightened to 700px.
function CardTilt({ children }) {
  const wrapperRef = useRef(null);
  const [rx, setRx] = React.useState(0);
  const [ry, setRy] = React.useState(0);
  const [gx, setGx] = React.useState(50);
  const [gy, setGy] = React.useState(50);
  const [hover, setHover] = React.useState(false);
  const [tilting, setTilting] = React.useState(false);
  const MAX = 24;

  const track = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = wrapperRef.current.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    setHover(true); setTilting(true);
    setRx((0.5 - py) * MAX); setRy((px - 0.5) * MAX);
    setGx(px * 100); setGy(py * 100);
  };
  const reset = () => { setHover(false); setTilting(false); setRx(0); setRy(0); };

  return (
    <div ref={wrapperRef} onPointerMove={track} onPointerLeave={reset} style={{ touchAction: 'none', display: 'inline-block', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.22)) drop-shadow(0 6px 16px rgba(0,0,0,0.14))' }}>
      <div style={{
        position: 'relative',
        transform: `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`,
        transformStyle: 'preserve-3d',
        transition: tilting
          ? 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)'
          : 'transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)',
        willChange: 'transform',
      }}>
        {children}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          opacity: hover ? 0.45 : 0,
          mixBlendMode: 'screen',
          background: `
            radial-gradient(circle 95px at ${gx}% ${gy}%, rgba(255,255,255,0.48), rgba(255,255,255,0.06) 52%, rgba(255,255,255,0) 84%),
            radial-gradient(circle 200px at ${gx}% ${gy}%, rgba(255,255,255,0.22), rgba(255,255,255,0.04) 58%, rgba(255,255,255,0) 78%),
            radial-gradient(circle 360px at ${gx}% ${gy}%, rgba(255,255,255,0.10), rgba(255,255,255,0) 88%)
          `,
          transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        }} />
      </div>
    </div>
  );
}

function AnimatedNumber({ value }) {
  const groupRef = React.useRef(null);
  const prevRef = React.useRef(null);
  React.useEffect(() => {
    if (prevRef.current === value) return;
    prevRef.current = value;
    const group = groupRef.current;
    if (!group) return;
    group.classList.remove('is-animating');
    void group.offsetHeight;
    group.classList.add('is-animating');
  }, [value]);
  const chars = String(value).split('');
  const n = chars.length;
  return (
    <span ref={groupRef} className="t-digit-group is-animating">
      {chars.map((ch, i) => {
        const stagger = i === n - 2 ? '1' : i === n - 1 ? '2' : undefined;
        return <span key={i} className="t-digit" data-stagger={stagger}>{ch}</span>;
      })}
    </span>
  );
}

function ProtoDevPanel({ widgetMode, switchMode, ws, setWs }) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null); // null = default bottom-right
  const dragOffset = React.useRef(null);
  const panelRef = React.useRef(null);

  const BG = '#14142a';
  const BORDER = 'rgba(255,255,255,0.08)';
  const DIM = 'rgba(255,255,255,0.3)';
  const ACTIVE_BG = '#5b21b6';
  const INACTIVE_BG = 'rgba(255,255,255,0.06)';

  const btn = (label, active, onClick) => (
    <button onClick={onClick} style={{ flex: 1, padding: '4px 6px', borderRadius: 5, border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontSize: 10, fontWeight: 700, background: active ? ACTIVE_BG : INACTIVE_BG, color: active ? '#fff' : DIM, transition: 'background 100ms, color 100ms', whiteSpace: 'nowrap' }}>{label}</button>
  );
  const section = (label) => (
    <div style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: DIM, textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
  );

  const onDragStart = (e) => {
    if (e.target.tagName === 'BUTTON') return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = panelRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  const onDragMove = (e) => {
    if (!dragOffset.current) return;
    setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
  };
  const onDragEnd = () => { dragOffset.current = null; };

  const posStyle = pos ? { left: pos.x, top: pos.y } : { bottom: 20, right: 20 };
  const mobStep = ws.live ? 'live' : ws.step;

  return (
    <div ref={panelRef} style={{ position: 'fixed', ...posStyle, zIndex: 9999 }}>
      {open ? (
        <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, width: 216, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          <div
            onPointerDown={onDragStart} onPointerMove={onDragMove} onPointerUp={onDragEnd}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 7px', borderBottom: `1px solid ${BORDER}`, cursor: 'grab', userSelect: 'none' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: DIM, textTransform: 'uppercase' }}>Prototype controls</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: DIM, fontSize: 13, lineHeight: 1, padding: 0, display: 'flex' }}>✕</button>
          </div>

          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}` }}>
            {section('Widget')}
            <div style={{ display: 'flex', gap: 4 }}>
              {btn('Mobility', widgetMode === 'mobility', () => switchMode('mobility'))}
              {btn('Food', widgetMode === 'food', () => switchMode('food'))}
            </div>
          </div>

          {widgetMode === 'mobility' && (<>
            <div style={{ padding: '10px 12px', borderBottom: `1px solid ${BORDER}` }}>
              {section('Wizard step')}
              <div style={{ display: 'flex', gap: 3 }}>
                {btn('1', mobStep === 1, () => setWs({ step: 1, mandateValidated: false, depositFailed: false, live: false, liveVisible: false, hidden: false }))}
                {btn('2', mobStep === 2, () => setWs({ step: 2, mandateValidated: false, depositFailed: false, live: false, liveVisible: false, hidden: false }))}
                {btn('3', mobStep === 3, () => setWs({ step: 3, mandateValidated: true, depositFailed: false, live: false, liveVisible: false, hidden: false }))}
                {btn('4', mobStep === 4, () => setWs({ step: 4, mandateValidated: true, depositFailed: false, live: false, liveVisible: false, hidden: false }))}
                {btn('Live', mobStep === 'live', () => setWs({ step: 5, mandateValidated: true, depositFailed: false, live: true, liveVisible: true, hidden: false }))}
              </div>
            </div>

          </>)}
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '5px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: DIM, textTransform: 'uppercase' }}>Proto</span>
        </button>
      )}
    </div>
  );
}

function MobilityLaunchWidget({ onToast, onNav, physicalCardsAllowed, onPhysicalCardsChange, cardDelivery = 'home', onCardDeliveryChange, mobilityWidgetState, onMobilityWidgetStateChange }) {
  const ws = mobilityWidgetState;
  const setWs = (updater) => onMobilityWidgetStateChange(prev => typeof updater === 'function' ? { ...prev, ...updater(prev) } : { ...prev, ...updater });
  const widgetMode = ws.widgetMode;
  const setWidgetMode = (v) => setWs({ widgetMode: typeof v === 'function' ? v(ws.widgetMode) : v });
  const hidden = ws.hidden;
  const setHidden = (v) => setWs({ hidden: typeof v === 'function' ? v(ws.hidden) : v });
  const step = ws.step;
  const setStep = (v) => setWs({ step: typeof v === 'function' ? v(ws.step) : v });
  const mandateDenied = ws.mandateDenied;
  const setMandateDenied = (v) => setWs({ mandateDenied: typeof v === 'function' ? v(ws.mandateDenied) : v });
  const mandateValidated = ws.mandateValidated;
  const setMandateValidated = (v) => setWs({ mandateValidated: typeof v === 'function' ? v(ws.mandateValidated) : v });
  const depositFailed = ws.depositFailed;
  const setDepositFailed = (v) => setWs({ depositFailed: typeof v === 'function' ? v(ws.depositFailed) : v });
  const live = ws.live;
  const setLive = (v) => setWs({ live: typeof v === 'function' ? v(ws.live) : v });
  const liveVisible = ws.liveVisible;
  const setLiveVisible = (v) => setWs({ liveVisible: typeof v === 'function' ? v(ws.liveVisible) : v });
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInviteListModal, setShowInviteListModal] = useState(false);
  const [showInviteMoreModal, setShowInviteMoreModal] = useState(false);
  const [liveMenuOpen, setLiveMenuOpen] = useState(false);
  const { rendered: liveMenuRendered, visible: liveMenuVisible } = usePopoverTransition(liveMenuOpen);

  // Food-mode INSS state
  const [inssUploaded, setInssUploaded] = useState(false);
  const [inssUploading, setInssUploading] = useState(false);
  const [inssUploadHover, setInssUploadHover] = useState(false);
  const [inssUploadError, setInssUploadError] = useState(null);
  const inssFileInputRef = React.useRef(null);

  // Food live state
  const [foodUnmatched, setFoodUnmatched] = useState(2);
  const [showUnmatchedDrawer, setShowUnmatchedDrawer] = useState(false);

  // Food-mode state (untouched)
  const [socialSecretariat, setSocialSecretariat] = useState('SD Worx');
  const [secOpen, setSecOpen] = useState(false);
  const [secSearch, setSecSearch] = useState('');
  const [secRect, setSecRect] = useState(null);
  const secTriggerRef = React.useRef(null);

  // All employees with a mobility budget, split by remaining budget
  const allEligible = Object.entries(EMPLOYEES)
    .filter(([, e]) => e.budget > 0)
    .map(([key, e]) => {
      const remaining = e.budget - (e.budgetUsed || 0);
      // no dept — picker shows entity only
      return { value: key, name: e.name, entity: e.entity, initials: e.initials, color: e.color, remaining };
    });
  const readyToUse  = allEligible.filter(e => e.remaining >= 5)
    .map(e => ({ ...e, hint: `€${e.remaining.toLocaleString('de-DE')}`, hintColor: P.success }));
  const budgetSpent = allEligible.filter(e => e.remaining < 5)
    .map(e => ({ ...e, hint: `€${e.remaining.toLocaleString('de-DE')}`, hintColor: P.inkFaint }));

  const pickerSections = [
    { label: `Has budget (${readyToUse.length})`, items: readyToUse },
    { label: `Budget used up (${budgetSpent.length})`, items: budgetSpent },
  ];

  const empCount = allEligible.length;

  // Food: all active employees are eligible (no budget filter)
  const allFoodEmployees = Object.entries(EMPLOYEES)
    .filter(([, e]) => e.isEmployee !== false && e.status === 'Active')
    .map(([key, e]) => ({ value: key, name: e.name, entity: e.entity, initials: e.initials, color: e.color }));
  const foodPickerSections = [{ label: `All employees (${allFoodEmployees.length})`, items: allFoodEmployees }];
  const foodDefaultSelection = allFoodEmployees.map(e => e.value);
  const [foodSelectedEmployees, setFoodSelectedEmployees] = useState(foodDefaultSelection);
  const [showFoodPickerModal, setShowFoodPickerModal] = useState(false);
  const foodEmpCount = foodSelectedEmployees.length;
  const isFoodDefaultSelection = foodSelectedEmployees.length === foodDefaultSelection.length && foodSelectedEmployees.every(id => foodDefaultSelection.includes(id));
  const foodMissingInss = foodSelectedEmployees.filter(id => !EMP_EXTRA[id]?.inssNumber);
  const foodInssComplete = inssUploaded;
  // Deposit = €37/employee/month × 3 months, rounded to nearest €50
  const deposit = Math.max(50, Math.round(empCount * 37 * 3 / 50) * 50);

  const switchMode = (mode) => {
    setWs({ widgetMode: mode, hidden: false, step: 1, mandateDenied: false, mandateValidated: false, depositFailed: false, live: false, liveVisible: false });
  };

  // Mobility step 2: first 60s = mandate validation, then 60s = deposit collection, then advance
  React.useEffect(() => {
    if (widgetMode !== 'mobility' || step !== 2 || mandateDenied || depositFailed) return;
    const t1 = setTimeout(() => setMandateValidated(true), 60000);
    const t2 = setTimeout(() => {
      setStep(3);
      setMandateValidated(false);
      onToast?.({ message: 'Funds received — your account is ready', type: 'approve' });
    }, 120000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [widgetMode, step, mandateDenied, depositFailed]);


  // Fade in live state
  React.useEffect(() => {
    if (live) requestAnimationFrame(() => requestAnimationFrame(() => setLiveVisible(true)));
  }, [live]);

  const stepBadgeEl = (n, pop = false) => {
    const done = n < step || live;
    const active = n === step && !live;
    if (done) return (
      <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: pop ? `badgePopIn 400ms cubic-bezier(0.34, 1.36, 0.64, 1)` : undefined }}>
        <Icon name="check" size={12} color="#008556" strokeWidth={2.5} />
      </span>
    );
    if (active) return (
      <span style={{ width: 24, height: 24, borderRadius: '50%', background: P.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: '#fff' }}>
        {n}
      </span>
    );
    return (
      <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'transparent', border: `1.5px solid ${P.inkSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>
        {n}
      </span>
    );
  };

  const inactiveBg = P.bgSubtle;

  // Count-up hook for live state numbers
  const useCountUp = (target, duration = 400) => {
    const [val, setVal] = useState(0);
    React.useEffect(() => {
      if (!liveVisible) return;
      let start = null;
      const animate = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        setVal(Math.round(progress * target));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, [liveVisible, target]);
    return val;
  };

  const adoptionInvited = useCountUp(empCount, 400);
  const adoptionDownloaded = useCountUp(Math.round(empCount * 0.63), 500);
  const adoptionRequested = useCountUp(Math.round(empCount * 0.42), 600);
  const adoptionFirst = useCountUp(Math.round(empCount * 0.26), 700);

  const sendInvites = () => {
    setShowConfirmModal(false);
    setWs({ live: true, invitedKeys: allEligible.map(e => e.value) });
    onToast?.({ message: `Invites sent. ${empCount} employees have been invited to request their Payflip Card.`, type: 'approve' });
  };

  useEffect(() => {
    if (!liveMenuOpen) return;
    const handler = (e) => {
      if (!e.target.closest('[data-live-menu]')) setLiveMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [liveMenuOpen]);

  // Post-launch invite picker — same employee pool as setup (allEligible = has a mobility budget),
  // minus anyone already invited. Employees with zero/no mobility budget don't appear here.
  const invitedKeys = ws.invitedKeys || [];
  const isEnrolled = (key) => invitedKeys.includes(key);
  const readyToInvite = readyToUse.filter(e => !isEnrolled(e.value));
  const lowBalanceToInvite = budgetSpent.filter(e => !isEnrolled(e.value));
  const inviteMoreSections = [
    { label: `Balance available (${readyToInvite.length})`, items: readyToInvite },
    { label: `Balance used up (${lowBalanceToInvite.length})`, items: lowBalanceToInvite },
  ];
  const nooneToInvite = readyToInvite.length === 0 && lowBalanceToInvite.length === 0;

  const sendMoreInvites = (keys) => {
    setShowInviteMoreModal(false);
    if (!keys || keys.length === 0) return;
    setWs(prev => ({ invitedKeys: [...(prev.invitedKeys || []), ...keys.filter(k => !(prev.invitedKeys || []).includes(k))] }));
    onToast?.({ message: `Invite${keys.length > 1 ? 's' : ''} sent to ${keys.length} employee${keys.length > 1 ? 's' : ''}`, type: 'approve' });
  };

  const mobilitySetupContent = () => {
    if (live) return null;
    return (<>
      {/* Step 1 — Sign mandate */}
      <div style={{ background: (step === 1 || mandateDenied) ? P.white : inactiveBg, borderBottom: `1px solid ${P.border}`, transition: `background 260ms ${EASE_OUT}` }}>
        <div style={{ display: 'grid', gridTemplateRows: (step === 1 || mandateDenied) ? '1fr' : '0fr', transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 260ms ${EASE_OUT}`, overflow: 'hidden' }}>
          <div style={{ overflow: 'hidden' }}>
            {mandateDenied ? (
              <div style={{ padding: 'var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)', animation: PREFERS_REDUCED_MOTION ? `stepContentEnterReduced 200ms ${EASE_OUT} both` : `stepContentEnter 200ms ${EASE_OUT} both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: P.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="x" size={12} color={P.dangerDark} strokeWidth={2.5} />
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.dangerDark }}>Mandate declined</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, lineHeight: '20px', margin: 0 }}>
                  Your bank declined the mandate. Re-sign the mandate once your bank confirms the issue is resolved — this is usually an account setting or a limit on direct debits.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-125)' }}>
                  <Button variant="primary" onClick={() => { setWs({ mandateDenied: false, step: 2 }); }} style={{ justifyContent: 'center', fontSize: 'var(--fs-body-sm)', padding: 'var(--space-100) var(--space-250)' }}>Re-sign mandate</Button>
                  <Button variant="secondary" onClick={() => { window.location.href = 'mailto:support@payflip.be?subject=Mobility%20card%20mandate%20declined'; }} style={{ justifyContent: 'center', fontSize: 'var(--fs-body-sm)', padding: 'var(--space-100) var(--space-200)' }}>Contact support</Button>
                </div>
              </div>
            ) : (
              <div style={{ padding: 'var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
                  {stepBadgeEl(1)}
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.ink }}>Sign mandate</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-075)' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: '20px', margin: 0 }}>
                    Authorises Payflip to collect <strong style={{ color: P.ink }}>€{deposit.toLocaleString('de-DE')}</strong> for your {empCount} employees, and top up automatically when the balance runs low.
                  </p>
                  <button onClick={() => setShowCalcModal(true)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', padding: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, textDecoration: 'underline', cursor: 'pointer' }}>
                    How is this calculated?
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-125) var(--space-200)', border: `1px solid ${P.border}`, borderRadius: 10, background: P.bg }}>
                  <img src={TWIKEY_LOGO_IMG} alt="Twikey" style={{ width: 80, height: 35, display: 'block', objectFit: 'contain', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, lineHeight: '17px' }}>
                    Secured by Twikey — funds arrive within 3 business days.
                  </span>
                </div>
                <Button variant="primary" onClick={() => setStep(2)} style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--fs-body-md)', padding: 'var(--space-125) var(--space-250)' }}>Sign with Twikey</Button>
              </div>
            )}
          </div>
        </div>
        {step > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-300)', animation: PREFERS_REDUCED_MOTION ? 'none' : `stepDoneEnter 200ms ${EASE_OUT} 140ms both` }}>
            {stepBadgeEl(1)}
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.inkSoft }}>€{deposit.toLocaleString('de-BE')} · Mandate signed</span>
          </div>
        )}
      </div>

      {/* Step 2 — First collection */}
      <div style={{ background: step === 2 ? P.white : inactiveBg, borderBottom: `1px solid ${P.border}`, transition: `background 260ms ${EASE_OUT}` }}>
        <div style={{ display: 'grid', gridTemplateRows: step === 2 ? '1fr' : '0fr', transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 260ms ${EASE_OUT}`, overflow: 'hidden' }}>
          <div style={{ overflow: 'hidden' }}>
            {depositFailed ? (
              <div style={{ padding: 'var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)', animation: PREFERS_REDUCED_MOTION ? `stepContentEnterReduced 200ms ${EASE_OUT} both` : `stepContentEnter 200ms ${EASE_OUT} both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: P.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="x" size={12} color={P.dangerDark} strokeWidth={2.5} />
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.dangerDark }}>Collection failed</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, lineHeight: '20px', margin: 0 }}>
                  We couldn't collect €{deposit.toLocaleString('de-DE')} from your account. This is usually a temporary issue — check your account balance and try again.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-125)' }}>
                  <Button variant="primary" onClick={() => setDepositFailed(false)} style={{ justifyContent: 'center', fontSize: 'var(--fs-body-sm)', padding: 'var(--space-100) var(--space-250)' }}>Retry collection</Button>
                  <Button variant="secondary" onClick={() => { window.location.href = 'mailto:support@payflip.be?subject=Mobility%20card%20deposit%20failed'; }} style={{ justifyContent: 'center', fontSize: 'var(--fs-body-sm)', padding: 'var(--space-100) var(--space-200)' }}>Contact support</Button>
                </div>
              </div>
            ) : (
              <div style={{ padding: 'var(--space-300)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', marginBottom: 'var(--space-250)' }}>
                  {stepBadgeEl(2)}
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.ink }}>First collection</span>
                </div>
                {/* Sub-step 1: Mandate confirmation — indicator stretches to fill row height, line runs to bottom */}
                <div style={{ display: 'flex', gap: 'var(--space-200)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                    {mandateValidated
                      ? <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 3 }}><Icon name="check" size={8} color="#008556" strokeWidth={2.5} /></div>
                      : <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, border: '2px solid transparent', borderTopColor: P.ink, borderRightColor: P.border, borderBottomColor: P.border, borderLeftColor: P.border, animation: PREFERS_REDUCED_MOTION ? 'none' : 'spinCW 3000ms linear infinite', boxSizing: 'border-box', marginTop: 3 }} />
                    }
                    <div style={{ width: 1.5, flex: 1, background: P.border, marginTop: 3 }} />
                  </div>
                  <div style={{ flex: 1, paddingBottom: 'var(--space-250)' }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: mandateValidated ? P.inkSoft : P.ink, lineHeight: '20px', transition: `color 300ms ${EASE_OUT}` }}>Mandate confirmation</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, lineHeight: '18px', marginTop: 2 }}>
                      {mandateValidated
                        ? 'Twikey has sent you a signed copy of the mandate by email.'
                        : <>Your bank is registering the direct debit authorization — this typically takes up to 24 hours.{' '}<a href="#" onClick={e => { e.preventDefault(); setWs({ mandateDenied: true, step: 1 }); }} style={{ color: P.inkSoft, textDecoration: 'underline' }}>Simulate denial ↗</a></>
                      }
                    </div>
                  </div>
                </div>
                {/* Sub-step 2: Collection scheduled */}
                <div style={{ display: 'flex', gap: 'var(--space-200)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                    {mandateValidated
                      ? <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, border: '2px solid transparent', borderTopColor: P.ink, borderRightColor: P.border, borderBottomColor: P.border, borderLeftColor: P.border, animation: PREFERS_REDUCED_MOTION ? 'none' : 'spinCW 3000ms linear infinite', boxSizing: 'border-box', marginTop: 3 }} />
                      : <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${P.border}`, boxSizing: 'border-box', marginTop: 3 }} />
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: mandateValidated ? P.ink : P.inkSoft, lineHeight: '20px', transition: `color 300ms ${EASE_OUT}` }}>Collection scheduled</div>
                    {mandateValidated && (
                      <div key="deposit-desc" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, lineHeight: '18px', marginTop: 2, animation: PREFERS_REDUCED_MOTION ? `stepContentEnterReduced 200ms ${EASE_OUT} both` : `stepContentEnter 200ms ${EASE_OUT} both` }}>
                        Collecting €{deposit.toLocaleString('de-DE')} via direct debit. You'll see this on your bank statement within 1–3 business days.{' '}
                        <a href="#" onClick={e => { e.preventDefault(); setDepositFailed(true); }} style={{ color: P.inkSoft, textDecoration: 'underline' }}>Simulate failure ↗</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateRows: step < 2 ? '1fr' : '0fr', transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 260ms ${EASE_OUT}`, overflow: 'hidden' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-300)', opacity: 0.55 }}>
              {stepBadgeEl(2)}
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-md)', color: P.inkSoft }}>First collection</span>
            </div>
          </div>
        </div>
        {step > 2 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-300)', animation: PREFERS_REDUCED_MOTION ? 'none' : `stepDoneEnter 200ms ${EASE_OUT} 140ms both` }}>
            {depositFailed
              ? <span style={{ width: 24, height: 24, borderRadius: '50%', background: P.dangerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="x" size={12} color={P.dangerDark} strokeWidth={2.5} /></span>
              : stepBadgeEl(2, step === 3)
            }
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: depositFailed ? P.dangerDark : P.inkSoft }}>
              {depositFailed ? 'Collection failed' : `€${deposit.toLocaleString('de-BE')} received`}
            </span>
          </div>
        )}
      </div>

      {/* Step 3 — Physical cards */}
      <div style={{ background: step === 3 ? P.white : inactiveBg, borderBottom: `1px solid ${P.border}`, transition: `background 260ms ${EASE_OUT}` }}>
        <div style={{ display: 'grid', gridTemplateRows: step === 3 ? '1fr' : '0fr', transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 260ms ${EASE_OUT}`, overflow: 'hidden' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
                {stepBadgeEl(3)}
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.ink }}>Physical cards</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: '20px', margin: 0 }}>
                Allow employees to request a physical Payflip card from the app. Each card costs €10.
              </p>
              <SettingsCard info="You can change this any time in Payflip Card settings.">
                <SettingsRow
                  label="Physical card requests"
                  trailing={<Switch checked={!!physicalCardsAllowed} onChange={() => onPhysicalCardsChange && onPhysicalCardsChange(!physicalCardsAllowed)} />}
                  onClick={() => onPhysicalCardsChange && onPhysicalCardsChange(!physicalCardsAllowed)}
                  last={!physicalCardsAllowed}
                />
                <div style={{ display: 'grid', gridTemplateRows: physicalCardsAllowed ? '1fr' : '0fr', transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 220ms ${EASE_OUT}`, overflow: 'hidden' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ padding: 'var(--space-200)', display: 'flex', flexDirection: 'column', gap: 'var(--space-150)' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>Where do we send physical cards?</div>
                      <div style={{ display: 'flex', gap: 'var(--space-100)' }}>
                        {[
                          { value: 'home', label: 'Employee address' },
                          { value: 'office', label: 'Company address' },
                        ].map(opt => {
                          const sel = cardDelivery === opt.value;
                          return (
                            <div key={opt.value} onClick={() => onCardDeliveryChange && onCardDeliveryChange(opt.value)}
                              style={{ flex: 1, border: `1px solid ${sel ? P.action : P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-150)', cursor: 'pointer', background: sel ? '#f3f0ff' : P.white, display: 'flex', alignItems: 'center', gap: 'var(--space-075)', transition: 'border-color 120ms ease, background 120ms ease' }}>
                              <div style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${sel ? P.action : P.borderStrong}`, background: P.white, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'border-color 120ms ease' }}>
                                {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: P.action }} />}
                              </div>
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: sel ? P.action : P.ink, fontWeight: sel ? 600 : 400 }}>{opt.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </SettingsCard>
              <Button variant="primary" onClick={() => setStep(4)} style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--fs-body-md)', padding: 'var(--space-125) var(--space-250)' }}>Continue</Button>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateRows: step < 3 ? '1fr' : '0fr', transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 260ms ${EASE_OUT}`, overflow: 'hidden' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-300)', opacity: 0.55 }}>
              {stepBadgeEl(3)}
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-md)', color: P.inkSoft }}>Physical cards</span>
            </div>
          </div>
        </div>
        {step > 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-300)', animation: PREFERS_REDUCED_MOTION ? 'none' : `stepDoneEnter 200ms ${EASE_OUT} 140ms both` }}>
            {stepBadgeEl(3)}
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.inkSoft }}>
              {physicalCardsAllowed ? `Physical cards · to ${cardDelivery === 'office' ? 'company address' : 'employee address'}` : 'Virtual only'}
            </span>
            <a href="#" onClick={e => { e.preventDefault(); setStep(3); }} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, textDecoration: 'underline', marginLeft: 'auto' }}>Edit</a>
          </div>
        )}
      </div>

      {/* Step 4 — Send invites */}
      <div style={{ background: step === 4 ? P.white : inactiveBg, borderBottom: `1px solid ${P.border}`, transition: `background 260ms ${EASE_OUT}` }}>
        <div style={{ display: 'grid', gridTemplateRows: step === 4 ? '1fr' : '0fr', transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 260ms ${EASE_OUT}`, overflow: 'hidden' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ padding: 'var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
                {stepBadgeEl(4)}
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.ink }}>Send invites</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: '20px', margin: 0 }}>
                {empCount} employees will receive an email to download the Payflip app and request their own card.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-150)', padding: 'var(--space-200)', borderRadius: 10, background: P.bg, border: `1px solid ${P.border}`, alignItems: 'flex-start' }}>
                <Icon name="info" size={14} color={P.inkSoft} strokeWidth={2} style={{ flexShrink: 0, marginTop: 'var(--space-025)' }} />
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, lineHeight: '18px', margin: 0 }}>
                  You don't issue cards yourself. Employees request their card when they're ready by downloading the app.
                </p>
              </div>
              <Button variant="primary" onClick={() => setShowConfirmModal(true)} style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--fs-body-md)', padding: 'var(--space-125) var(--space-250)' }}>Send invites to {empCount} employees</Button>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateRows: step < 4 ? '1fr' : '0fr', transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 260ms ${EASE_OUT}`, overflow: 'hidden' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-300)', opacity: 0.55 }}>
              {stepBadgeEl(4)}
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-md)', color: P.inkSoft }}>Send invites</span>
            </div>
          </div>
        </div>
      </div>
    </>);
  };

  const liveContent = () => {
    if (!live) return null;

    if (widgetMode === 'food') {
      const UNMATCHED_EMPLOYEES = [
        { name: 'Thomas Vandenberghe', niss: '92.11.03-567.89' },
        { name: 'Lasse Willems', niss: '95.07.18-123.45' },
      ];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', opacity: liveVisible ? 1 : 0, transition: `opacity 250ms ${EASE_OUT}` }}>
          {/* Unmatched employees warning */}
          {foodUnmatched > 0 && (
            <div style={{ padding: 'var(--space-150) var(--space-300)', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 'var(--space-150)', background: '#FFFBEB' }}>
              <Icon name="alert-triangle" size={14} color="#D97706" strokeWidth={2} style={{ flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, flex: 1, lineHeight: '18px' }}>
                {foodUnmatched} {foodUnmatched === 1 ? 'employee' : 'employees'} from {socialSecretariat} couldn't be matched
              </span>
              <button onClick={() => setShowUnmatchedDrawer(true)} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.ink, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}>Resolve →</button>
            </div>
          )}
          {/* Stats row */}
          <div style={{ padding: 'var(--space-250) var(--space-300)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-200)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-050)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: P.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>{foodEmpCount} employees</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>{socialSecretariat} · September cycle</div>
            </div>
            <a href="#" onClick={e => e.preventDefault()} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, textDecoration: 'underline', whiteSpace: 'nowrap' }}>Manage →</a>
          </div>
          {/* Unmatched drawer */}
          {showUnmatchedDrawer && (
            <DrawerShell title="Unmatched employees" onClose={() => setShowUnmatchedDrawer(false)}>
              {close => (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ padding: 'var(--space-300)', borderBottom: `1px solid ${P.border}` }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: '20px' }}>
                      {socialSecretariat} sent {UNMATCHED_EMPLOYEES.length} NISS {UNMATCHED_EMPLOYEES.length === 1 ? 'number' : 'numbers'} that don't match any employee in your People directory. Match them to an existing employee, add them to People, or ignore them for this cycle.
                    </span>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
                    {UNMATCHED_EMPLOYEES.map((emp, i) => (
                      <div key={i} style={{ padding: 'var(--space-200) var(--space-300)', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon name="user-x" size={14} color="#D97706" strokeWidth={1.75} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{emp.name}</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>NISS {emp.niss}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', flexShrink: 0 }}>
                          <Button variant="secondary" style={{ fontSize: 'var(--fs-body-xs)', padding: 'var(--space-050) var(--space-125)' }} onClick={() => setFoodUnmatched(n => Math.max(0, n - 1))}>Match</Button>
                          <Button variant="secondary" style={{ fontSize: 'var(--fs-body-xs)', padding: 'var(--space-050) var(--space-125)' }} onClick={() => setFoodUnmatched(n => Math.max(0, n - 1))}>Add to People</Button>
                          <button onClick={() => setFoodUnmatched(n => Math.max(0, n - 1))} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-050) var(--space-075)' }}>Ignore</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DrawerShell>
          )}
        </div>
      );
    }

    const justLaunched = !!ws.justLaunched;
    const fundingIssue = !!ws.fundingIssue;
    const toppingUp = !!ws.toppingUp;
    const liveBalance = fundingIssue
      ? Math.round(deposit * 0.12)
      : toppingUp ? Math.round(deposit * 0.15)
      : justLaunched ? deposit : Math.round(deposit * 0.725);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', opacity: liveVisible ? 1 : 0, transition: `opacity 250ms ${EASE_OUT}` }}>

        {/* Funding-issue state */}
        {fundingIssue && (
          <div style={{ padding: 'var(--space-200) var(--space-300) var(--space-200)', borderBottom: `1px solid ${P.border}` }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: '18px', marginBottom: 'var(--space-150)' }}>
              The scheduled top-up couldn't be collected. Open Twikey to resolve it.
            </div>
            <Button variant="primary" onClick={() => { window.open('https://app.twikey.com', '_blank'); }} style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--fs-body-sm)', padding: 'var(--space-100) var(--space-200)' }}>
              Resolve in Twikey →
            </Button>
          </div>
        )}

        {/* Compact balance row */}
        <div style={{ padding: 'var(--space-250) var(--space-300)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-200)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-050)' }}>Account balance</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: fundingIssue ? P.danger : P.ink, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 'var(--space-050)' }}>
              €{liveBalance.toLocaleString('de-DE')}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>
              {justLaunched
                ? `Invites sent to ${invitedKeys.length} ${invitedKeys.length === 1 ? 'employee' : 'employees'}`
                : toppingUp
                ? `+ €${deposit.toLocaleString('de-DE')} top-up incoming`
                : `of €${deposit.toLocaleString('de-DE')} funded`}
            </div>
          </div>
          <a href="#" onClick={e => { e.preventDefault(); onNav && onNav('settings-cardrules'); }} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, textDecoration: 'underline', whiteSpace: 'nowrap' }}>Manage →</a>
        </div>

      </div>
    );
  };

  return (
    <div style={{ marginBottom: 'var(--space-300)' }}>
      <ProtoDevPanel widgetMode={widgetMode} switchMode={switchMode} ws={ws} setWs={setWs} />

    <div style={{ background: P.white, borderRadius: 12, overflow: 'hidden', ...(live ? { border: `1px solid ${P.border}` } : { boxShadow: `0 0 0 1px rgba(15,13,40,0.07), 0 4px 24px rgba(15,13,40,0.08)` }) }}>
      {/* Header */}
      <div onClick={hidden ? () => setHidden(false) : undefined} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-200) var(--space-300)', borderBottom: `1px solid ${P.border}`, cursor: hidden ? 'pointer' : 'default' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink, letterSpacing: '-0.3px' }}>
          {widgetMode === 'food' ? (live ? 'Meal vouchers' : 'Set up meal vouchers') : (live ? 'Mobility account' : 'Set up mobility')}
        </span>
        {!live && (() => {
          const mobilityMeta = [
            { label: mandateDenied ? 'Mandate declined' : 'Sign mandate', color: mandateDenied ? P.dangerDark : P.inkSoft, bg: mandateDenied ? P.dangerBg : P.bg },
            { label: depositFailed ? 'Collection failed' : mandateValidated ? 'First collection' : 'Mandate confirmation', color: depositFailed ? P.dangerDark : P.inkSoft, bg: depositFailed ? P.dangerBg : P.bg },
            { label: 'Physical cards',   color: P.inkSoft,  bg: P.bg },
            { label: 'Send invites',     color: P.inkSoft,  bg: P.bg },
          ];
          const foodMeta = [
            { label: 'Social secretariat', color: P.inkSoft, bg: P.bg },
            { label: 'INSS numbers',       color: P.inkSoft, bg: P.bg },
            { label: 'Review payment',     color: P.inkSoft, bg: P.bg },
            { label: 'Notify employees',   color: P.inkSoft, bg: P.bg },
          ];
          const metaIdx = (widgetMode === 'mobility' && mandateDenied) ? 0 : (step - 1);
          const meta = widgetMode === 'mobility'
            ? (mobilityMeta[metaIdx] || mobilityMeta[0])
            : (foodMeta[step - 1] || foodMeta[0]);
          const stepLabel = `${meta.label} · ${mandateDenied ? 1 : step} of 4`;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
              {!hidden ? (
                <>
                  <DotPill bg={meta.bg} color={meta.color} dot size={11}>{stepLabel}</DotPill>
                  <IconButton icon="X" size={28} onClick={() => setHidden(true)} />
                </>
              ) : (
                <>
                  <DotPill bg={meta.bg} color={meta.color} dot size={11}>{stepLabel}</DotPill>
                  <Button variant="primary" icon="chevron-right" onClick={() => setHidden(false)} style={{ padding: 'var(--space-075) var(--space-150)', fontSize: 'var(--fs-body-xs)' }}>Resume setup</Button>
                </>
              )}
            </div>
          );
        })()}
        {live && (() => {
          const livePill = ws.fundingIssue
            ? { label: 'Top-up failed', bg: '#FEF2F2', color: '#DC2626' }
            : ws.toppingUp
            ? { label: 'Collecting funds', bg: '#EFF6FF', color: '#1d4ed8' }
            : ws.justLaunched
            ? { label: 'Just launched', bg: P.bg, color: P.inkSoft }
            : { label: 'Active', bg: '#F0FDF4', color: P.success };
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
              <DotPill bg={livePill.bg} color={livePill.color} dot size={11}>
                {livePill.label}
              </DotPill>
              <div style={{ position: 'relative' }} data-live-menu>
                <IconButton icon="more-horizontal" size={28} onClick={() => setLiveMenuOpen(o => !o)} />
                {liveMenuRendered && (
                  <div style={{ position: 'absolute', top: 34, right: 0, minWidth: 190, background: P.white, border: `1px solid ${P.border}`, borderRadius: 10, boxShadow: '0 4px 16px rgba(15,13,40,0.10)', zIndex: 50, overflow: 'hidden', ...popoverStyle(liveMenuVisible, 'top right') }}>
                    {[
                      { label: 'View transactions', action: () => { onNav && onNav('choices'); setLiveMenuOpen(false); } },
                      ...(!ws.justLaunched && !nooneToInvite ? [{ label: 'Invite more employees', action: () => { setShowInviteMoreModal(true); setLiveMenuOpen(false); } }] : []),
                      { label: 'Card settings', action: () => { onNav && onNav('settings-cardrules'); setLiveMenuOpen(false); } },
                    ].map(({ label, action }) => (
                      <button key={label} onClick={action} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: 'var(--space-100) var(--space-200)', border: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.ink, cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = P.bg}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateRows: hidden ? '0fr' : '1fr', transition: `grid-template-rows 300ms ${EASE_OUT}`, overflow: 'hidden' }}>
        <div style={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {widgetMode === 'mobility' ? (<>
          {!live && (
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {mobilitySetupContent()}
              </div>
              <div style={{ flex: 1, background: 'linear-gradient(140deg, #fdf4ff 0%, var(--bg-brand) 50%, #edd5ff 100%)', borderLeft: `1px solid ${P.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-600) var(--space-400)', position: 'relative', overflow: 'hidden' }}>
                <div className="gradient-drift" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(200deg, var(--bg-brand) 0%, #e8ccff 35%, #d4adff 100%)', animation: 'gradientDrift 4s ease-in-out infinite alternate', pointerEvents: 'none' }} />
                <CardTilt>
                  <img src={PAYFLIP_CARD_IMG} alt="Payflip Card" style={{ width: 270, height: 170, display: 'block', borderRadius: 14 }} />
                </CardTilt>
              </div>
            </div>
          )}
          {liveContent()}
        </>) : (
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Food Step 1 — Select social secretariat */}
          <div style={{ background: step === 1 ? P.white : inactiveBg, borderBottom: `1px solid ${P.border}` }}>
            {step === 1 ? (
              <div key="food-step1-social" style={{ padding: 'var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)', animation: `stepContentEnter 250ms ${EASE_OUT}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
                  {stepBadgeEl(1)}
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.ink }}>Select social secretariat</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: '20px', margin: 0 }}>
                  We use your social secretariat to sync employee data and ensure correct meal voucher calculations.
                </p>
                <div style={{ position: 'relative' }}>
                  <button ref={secTriggerRef} onClick={() => { const r = secTriggerRef.current?.getBoundingClientRect(); setSecRect(r || null); setSecOpen(v => !v); setSecSearch(''); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-100) var(--space-150)', height: 40, border: `1px solid #bec0c5`, borderRadius: 8, background: P.white, cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink }}>
                    <span>{socialSecretariat}</span>
                    <Icon name="chevrons-up-down" size={16} color={P.inkSoft} strokeWidth={2} />
                  </button>
                  {secOpen && secRect && (
                    <div style={{ position: 'fixed', top: secRect.bottom + 4, left: secRect.left, width: secRect.width, zIndex: 1000, background: P.white, border: `1px solid ${P.border}`, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                      <div style={{ padding: 'var(--space-100)', borderBottom: `1px solid ${P.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', border: `1px solid #bec0c5`, borderRadius: 8, padding: 'var(--space-075) var(--space-125)' }}>
                          <Icon name="search" size={14} color={P.inkSoft} strokeWidth={2} />
                          <input autoFocus value={secSearch} onChange={e => setSecSearch(e.target.value)} placeholder="Search..." style={{ border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, background: 'transparent', width: '100%' }} />
                        </div>
                      </div>
                      <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                        {['SD Worx', 'Securex', 'Partena Professional', 'Acerta', 'Liantis', 'Xerius', 'Group S', 'UCM', 'Zenito'].filter(s => s.toLowerCase().includes(secSearch.toLowerCase())).map(s => (
                          <button key={s} onClick={() => { setSocialSecretariat(s); setSecOpen(false); setSecSearch(''); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-125) var(--space-150)', border: 'none', background: s === socialSecretariat ? P.bg : P.white, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink }}>
                            <span>{s}</span>
                            {s === socialSecretariat && <Icon name="check" size={16} color={P.ink} strokeWidth={2} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="primary" onClick={() => { setSecOpen(false); setStep(2); }} style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--fs-body-md)', padding: 'var(--space-125) var(--space-250)' }}>Confirm</Button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-300)', animation: `stepDoneEnter 200ms ${EASE_OUT}`, opacity: 0.70 }}>
                {stepBadgeEl(1, step === 2)}
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.inkSoft }}>{socialSecretariat}</span>
                <a href="#" onClick={e => { e.preventDefault(); setStep(1); }} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, textDecoration: 'underline', marginLeft: 'auto' }}>Edit</a>
              </div>
            )}
          </div>

          {/* Food Step 2 — INSS numbers */}
          <div style={{ background: step === 2 ? P.white : inactiveBg, borderBottom: `1px solid ${P.border}` }}>
            {step === 2 ? (
              <div key="food-step2-active" style={{ padding: 'var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-250)', animation: `stepContentEnter 250ms ${EASE_OUT} 120ms both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
                  {stepBadgeEl(2)}
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.ink }}>INSS numbers</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: '20px', margin: 0 }}>
                  Download the template, fill in each employee's INSS number, and upload it here. Payflip uses these to match {socialSecretariat}'s monthly attendance file.
                </p>
                {/* Download link — static, always present */}
                {(() => {
                  const doDownload = () => {
                    const header = 'Name,Email,INSS number\n';
                    const rows = foodSelectedEmployees.map(id => {
                      const emp = EMPLOYEES[id];
                      return `"${emp?.name || id}","${emp?.email || ''}",""`;
                    }).join('\n');
                    const blob = new Blob([header + rows], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'inss_numbers_template.csv'; a.click();
                    URL.revokeObjectURL(url);
                  };
                  return (
                    <button onClick={doDownload} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-075)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, textDecoration: 'underline', textUnderlineOffset: 2 }}>
                      <Icon name="download" size={13} color={P.ink} strokeWidth={1.75} />
                      inss_numbers_template.csv
                    </button>
                  );
                })()}
                {/* Upload zone */}
                {inssUploaded ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-150) var(--space-200)', border: `1px solid ${P.successBorder}`, borderRadius: 8, background: P.successBg, animation: `stepContentEnter 200ms ${EASE_OUT} both` }}>
                      <Icon name="circle-check" size={16} color={P.success} strokeWidth={2} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>inss_numbers_template.csv</div>
                      </div>
                      <button onClick={() => { setInssUploaded(false); setInssUploadError(null); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, border: 'none', background: 'transparent', cursor: 'pointer', flexShrink: 0, padding: 0 }}><Icon name="x" size={14} color={P.inkSoft} strokeWidth={2} /></button>
                    </div>
                  ) : (
                    <>
                      <input
                        ref={inssFileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (!file) return;
                          const ext = file.name.split('.').pop().toLowerCase();
                          if (!['csv', 'xlsx', 'xls'].includes(ext)) {
                            setInssUploadError(`Wrong file type — please upload the CSV template`);
                            return;
                          }
                          setInssUploadError(null);
                          setInssUploading(true);
                          setTimeout(() => { setInssUploading(false); setInssUploaded(true); }, 1500);
                        }}
                      />
                      <div
                        onClick={() => { if (inssUploading) return; inssFileInputRef.current?.click(); }}
                        onMouseEnter={() => setInssUploadHover(true)}
                        onMouseLeave={() => setInssUploadHover(false)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-100)', padding: 'var(--space-300) var(--space-200)', border: `1.5px dashed ${inssUploadError ? '#DC2626' : inssUploadHover && !inssUploading ? P.inkSoft : P.border}`, borderRadius: 8, background: inssUploadHover && !inssUploading ? P.bg : 'transparent', cursor: inssUploading ? 'default' : 'pointer', transition: 'border-color 150ms, background 150ms', animation: `stepContentEnter 200ms ${EASE_OUT} both` }}
                      >
                        {inssUploading ? (
                          <>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${P.border}`, borderTopColor: P.ink, animation: 'spin 600ms linear infinite' }} />
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>Uploading…</span>
                          </>
                        ) : (
                          <>
                            <Icon name="upload" size={18} color={inssUploadError ? '#DC2626' : P.inkSoft} strokeWidth={1.5} />
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: inssUploadError ? '#DC2626' : P.ink }}>
                              {inssUploadError ? inssUploadError : 'Drag & drop or click to browse'}
                            </span>
                            {!inssUploadError && <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>Upload the completed template</span>}
                          </>
                        )}
                      </div>
                    </>
                  )
                }
                <Button variant="primary" disabled={!foodInssComplete} onClick={() => setStep(3)} style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--fs-body-md)', padding: 'var(--space-125) var(--space-250)' }}>Continue</Button>
              </div>
            ) : step < 2 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-300)', opacity: 0.55 }}>
                {stepBadgeEl(2)}
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-md)', color: P.inkSoft }}>INSS numbers</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-300)', animation: `stepDoneEnter 200ms ${EASE_OUT}`, opacity: 0.70 }}>
                {stepBadgeEl(2)}
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.inkSoft }}>INSS numbers complete</span>
              </div>
            )}
          </div>

          {/* Food Step 3 — Review payment (mandate already active from Mobility Card) */}
          <div style={{ background: step === 3 ? P.white : inactiveBg, borderBottom: `1px solid ${P.border}` }}>
            {step === 3 ? (
              <div key="food-step3-active" style={{ padding: 'var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)', animation: `stepContentEnter 250ms ${EASE_OUT}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
                  {stepBadgeEl(3)}
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.ink }}>Review payment</span>
                </div>
                {/* Context */}
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: '20px' }}>You already have a SEPA Direct Debit mandate with Payflip. We'll use this mandate to collect future payments for your meal voucher orders.</span>
                {/* Bank card — the confirmed thing, leads */}
                <div style={{ borderRadius: 10, background: P.bg, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-150) var(--space-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: P.white, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name="landmark" size={16} color={P.ink} strokeWidth={1.75} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 500, color: P.ink }}>BNP Paribas Fortis</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>BE68 •••• •••• 4821</span>
                      </div>
                    </div>
                    <DotPill bg={P.successBg} color={P.success} size={11} dot={true} border={false}>Active mandate</DotPill>
                  </div>
                  <div style={{ borderTop: `1px solid ${P.border}`, padding: 'var(--space-100) var(--space-200)' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>Mandate signed 14 March 2025 · used for Mobility Card</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-075)' }}>
                  <Icon name="info" size={14} color={P.inkSoft} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, lineHeight: '18px' }}>Payment will be taken once the first order is sent from {socialSecretariat}.</span>
                </div>
                <Button variant="primary" onClick={() => setStep(4)} style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--fs-body-md)', padding: 'var(--space-125) var(--space-250)' }}>Confirm mandate</Button>
              </div>
            ) : step < 3 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-300)', opacity: 0.55 }}>
                {stepBadgeEl(3)}
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-md)', color: P.inkSoft }}>Review payment</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-300)', animation: `stepDoneEnter 200ms ${EASE_OUT}`, opacity: 0.70 }}>
                {stepBadgeEl(3)}
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.inkSoft }}>Mandate confirmed</span>
              </div>
            )}
          </div>


          {/* Food Step 4 — Notify employees */}
          <div style={{ background: step === 4 ? P.white : inactiveBg, borderBottom: `1px solid ${P.border}` }}>
            {step === 4 ? (
              <div key="food-step4-active" style={{ padding: 'var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)', animation: `stepContentEnter 250ms ${EASE_OUT}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
                  {stepBadgeEl(4)}
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.ink }}>Notify employees</span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: '20px', margin: 0 }}>
                  {foodEmpCount} employees will receive an email to download the Payflip app. They'll instantly receive their virtual meal voucher card and can order a physical card from the app.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-150)', padding: 'var(--space-200)', borderRadius: 10, background: P.bg, border: `1px solid ${P.border}`, alignItems: 'flex-start' }}>
                  <Icon name="info" size={14} color={P.inkSoft} strokeWidth={2} style={{ flexShrink: 0, marginTop: 'var(--space-025)' }} />
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, lineHeight: '18px', margin: 0 }}>
                    You don't issue cards yourself. Employees activate their card when they're ready by downloading the app.
                  </p>
                </div>
                <Button variant="primary" onClick={() => setWs({ live: true })} style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--fs-body-md)', padding: 'var(--space-125) var(--space-250)' }}>Notify {foodEmpCount} employees</Button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-300)', opacity: 0.55 }}>
                {stepBadgeEl(4)}
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-md)', color: P.inkSoft }}>Notify employees</span>
              </div>
            )}
          </div>

            </div>
            <div style={{ flex: 1, background: 'linear-gradient(140deg, #fff7f5 0%, #ffe8e2 40%, #ffd0c4 100%)', borderLeft: `1px solid ${P.border}`, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-600) var(--space-400)', position: 'relative', overflow: 'hidden' }}>
              <div className="gradient-drift" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(200deg, #fff5f2 0%, #ffddd4 35%, #ffc4b4 100%)', animation: 'gradientDrift 8s ease-in-out infinite alternate', pointerEvents: 'none' }} />
              <CardTilt>
                <img src={PAYFLIP_CARD_IMG} alt="Payflip Card" style={{ width: 270, height: 170, display: 'block', borderRadius: 14 }} />
              </CardTilt>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>

    {/* Read-only invite list modal */}
    {showInviteListModal && (
      <ModalShell title={`Invited employees (${empCount})`} onClose={() => setShowInviteListModal(false)} width={400}>
        {() => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-025)', padding: 'var(--space-100) 0' }}>
            {[...readyToUse, ...budgetSpent].map((e, i, arr) => (
              <div key={e.value} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-125) var(--space-300)', borderBottom: i < arr.length - 1 ? `1px solid ${P.border}` : 'none' }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: e.color || P.action, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: '#fff' }}>{e.initials}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</div>
                  {e.hint && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: e.hintColor || P.inkSoft }}>{e.hint} remaining</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </ModalShell>
    )}

    {/* Food employee picker modal — no budget tabs, all active employees */}
    {showFoodPickerModal && (
      <PersonPickerModal
        title="Select employees"
        value={foodSelectedEmployees}
        sections={foodPickerSections}
        onSave={keys => setFoodSelectedEmployees(keys)}
        onClose={() => setShowFoodPickerModal(false)}
      />
    )}

    {/* "How is this calculated?" modal */}
    {showCalcModal && (
      <ModalShell title="About the recommended amount" onClose={() => setShowCalcModal(false)} width={480}>
        <div style={{ padding: 'var(--space-250) var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
          {/* Summary stats */}
          <div style={{ display: 'flex', gap: 'var(--space-150)' }}>
            <div style={{ flex: 1, padding: 'var(--space-150) var(--space-200)', borderRadius: 8, background: P.bg, display: 'flex', flexDirection: 'column', gap: 'var(--space-025)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>Employees with mobility budget</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink }}>{empCount}</span>
            </div>
            <div style={{ flex: 1, padding: 'var(--space-150) var(--space-200)', borderRadius: 8, background: P.bg, display: 'flex', flexDirection: 'column', gap: 'var(--space-025)' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>Recommended deposit</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink }}>€{deposit.toLocaleString('de-DE')}</span>
            </div>
          </div>

          {/* Explanations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-050)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>What does this cover?</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: '18px', margin: 0 }}>
                This covers about 3 months of expected mobility card spending for your employees, based on their 2025 spending patterns.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-050)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>Can I change the amount?</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: '18px', margin: 0 }}>
                You don't have to fund this exact amount. Employees can only spend up to their own balance, so there's no risk of overspending. If you fund less, direct debit tops it up automatically.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-050)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>Where does the money go?</span>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: '18px', margin: 0 }}>
                The funds go to your Payflip Card account. They're only used when employees make card payments. Unspent funds stay in the account.
              </p>
            </div>
          </div>
        </div>
      </ModalShell>
    )}

    {/* Invite confirmation dialog */}
    {showConfirmModal && (
      <ModalShell title="Send invites" onClose={() => setShowConfirmModal(false)} width={440}
        footer={close => (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-125)', padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}` }}>
            <Button variant="secondary" onClick={close}>Not yet</Button>
            <Button variant="primary" onClick={sendInvites}>Yes, send invites</Button>
          </div>
        )}>
        <div style={{ padding: 'var(--space-250) var(--space-300)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, lineHeight: '20px', margin: 0 }}>
            Emails go out immediately and can't be recalled.
          </p>
        </div>
      </ModalShell>
    )}

    {/* Invite more employees (post-launch) */}
    {showInviteMoreModal && (
      <PersonPickerModal
        title="Invite employees to Payflip Card"
        value={[]}
        sections={inviteMoreSections}
        note="Only showing employees who haven't received an invite yet."
        onSave={sendMoreInvites}
        onClose={() => setShowInviteMoreModal(false)}
      />
    )}

    </div>
  );
}

function AttentionRow({ item, last, onNav }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={() => item.onClick ? item.onClick() : onNav(item.screen)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-150) var(--space-250)', borderBottom: last ? 'none' : `1px solid ${P.border}`, cursor: 'pointer', background: hovered ? P.bgSubtle : 'transparent', transition: `background 150ms ${EASE_OUT}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: item.iconBg ?? P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={item.icon} size={15} color={item.iconColor ?? '#3d4047'} strokeWidth={1.5} />
      </div>
      <span style={{ flex: 1, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{item.label}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.white, background: item.badgeBg ?? P.action, borderRadius: 20, padding: 'var(--space-025) var(--space-100)', flexShrink: 0 }}>{item.count}</span>
      <Icon name="chevron-right" size={15} color={P.inkSoft} strokeWidth={1.75} />
    </div>
  );
}

function FoodLiveWidget({ socialSecretariat = 'SD Worx', empCount = 23, onNav }) {
  const [unmatched, setUnmatched] = React.useState(2);
  const [showDrawer, setShowDrawer] = React.useState(false);
  const UNMATCHED = [
    { name: 'Thomas Renard', niss: '85.04.12-234.56' },
    { name: 'Élise Fontaine', niss: '92.11.03-567.89' },
  ];
  return (
    <div style={{ border: `1px solid ${P.border}`, borderRadius: 12, background: P.white, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: 'var(--space-200) var(--space-300)', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink, letterSpacing: '-0.3px' }}>Meal vouchers</span>
        <DotPill bg={P.successBg} color={P.success} dot size={11}>Active</DotPill>
      </div>
      {/* Unmatched warning */}
      {unmatched > 0 && (
        <div style={{ padding: 'var(--space-150) var(--space-300)', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 'var(--space-150)', background: '#FFFBEB' }}>
          <Icon name="alert-triangle" size={14} color="#D97706" strokeWidth={2} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, flex: 1, lineHeight: '18px' }}>
            {unmatched} {unmatched === 1 ? 'employee' : 'employees'} from {socialSecretariat} couldn't be matched
          </span>
          <button onClick={() => setShowDrawer(true)} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.ink, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}>Resolve →</button>
        </div>
      )}
      {/* Stats */}
      <div style={{ padding: 'var(--space-250) var(--space-300)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-200)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-050)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: P.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>{empCount} employees</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>{socialSecretariat} · September cycle</div>
        </div>
        <a href="#" onClick={e => e.preventDefault()} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, textDecoration: 'underline', whiteSpace: 'nowrap' }}>Manage →</a>
      </div>
      {/* Unmatched drawer */}
      {showDrawer && (
        <DrawerShell title="Unmatched employees" onClose={() => setShowDrawer(false)}>
          {close => (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: 'var(--space-300)', borderBottom: `1px solid ${P.border}` }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: '20px' }}>
                  {socialSecretariat} sent {UNMATCHED.length} NISS {UNMATCHED.length === 1 ? 'number' : 'numbers'} that don't match any employee in your People directory. Match them to an existing employee, add them to People, or ignore them for this cycle.
                </span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
                {UNMATCHED.map((emp, i) => (
                  <div key={i} style={{ padding: 'var(--space-200) var(--space-300)', borderBottom: i < UNMATCHED.length - 1 ? `1px solid ${P.border}` : 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="user-x" size={14} color="#D97706" strokeWidth={1.75} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{emp.name}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>NISS {emp.niss}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', flexShrink: 0 }}>
                      <Button variant="secondary" style={{ fontSize: 'var(--fs-body-xs)', padding: 'var(--space-050) var(--space-125)' }} onClick={() => setUnmatched(n => Math.max(0, n - 1))}>Match</Button>
                      <Button variant="secondary" style={{ fontSize: 'var(--fs-body-xs)', padding: 'var(--space-050) var(--space-125)' }} onClick={() => setUnmatched(n => Math.max(0, n - 1))}>Add to People</Button>
                      <button onClick={() => setUnmatched(n => Math.max(0, n - 1))} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-050) var(--space-075)' }}>Ignore</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DrawerShell>
      )}
    </div>
  );
}

function MatchEmpCombobox({ employees, value, onChange, suggestions = [] }) {
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = value ? employees.find(e => e.id === value) : null;
  const inputDisplayValue = selected && !query ? selected.name : query;
  const filtered = employees.filter(e => !query || e.name.toLowerCase().includes(query.toLowerCase()));
  const suggestionIds = new Set(suggestions.map(s => s.id));
  const suggestedFiltered = suggestions.filter(s => !query || s.name.toLowerCase().includes(query.toLowerCase()));
  const otherFiltered = filtered.filter(e => !suggestionIds.has(e.id));
  const hasSuggestions = suggestedFiltered.length > 0;

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (value) onChange('');
    setOpen(true);
  };

  const handleSelect = (emp) => {
    onChange(emp.id);
    setQuery('');
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setQuery('');
    setOpen(true);
    inputRef.current?.focus();
  };

  const EmpRow = ({ emp }) => (
    <div
      onMouseDown={() => handleSelect(emp)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', cursor: 'pointer', background: emp.id === value ? P.bg : P.white }}
      onMouseEnter={e => e.currentTarget.style.background = P.bg}
      onMouseLeave={e => e.currentTarget.style.background = emp.id === value ? P.bg : P.white}
    >
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink }}>{emp.name}</div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: emp.niss ? P.inkSoft : P.inkFaint, fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: 8 }}>{emp.niss || 'No NISS'}</div>
    </div>
  );

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        {!selected && (
          <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <Icon name="search" size={14} color={P.inkSoft} strokeWidth={1.75} />
          </div>
        )}
        <input
          ref={inputRef}
          value={inputDisplayValue}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          placeholder="Search employee…"
          style={{ width: '100%', height: 40, paddingLeft: selected ? 12 : 32, paddingRight: selected ? 80 : 12, border: `1px solid ${selected ? P.borderStrong : P.border}`, borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, background: P.white, outline: 'none', boxSizing: 'border-box' }}
        />
        {selected && (
          <>
            <div style={{ position: 'absolute', right: 30, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{selected.niss || 'No NISS'}</span>
            </div>
            <button onMouseDown={handleClear} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
              <Icon name="x" size={14} color={P.inkSoft} strokeWidth={2} />
            </button>
          </>
        )}
      </div>
      {open && (hasSuggestions || otherFiltered.length > 0) && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, maxHeight: 260, overflowY: 'auto', background: P.white, border: `1px solid ${P.border}`, borderRadius: 8, boxShadow: '0 4px 16px rgba(15,13,40,0.12)', zIndex: 10 }} className="hide-scrollbar">
          {hasSuggestions && (
            <>
              <div style={{ padding: '6px 12px 4px', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>Suggested</div>
              {suggestedFiltered.map(emp => (
                <EmpRow key={emp.id} emp={emp} />
              ))}
            </>
          )}
          {hasSuggestions && otherFiltered.length > 0 && (
            <div style={{ height: 1, background: P.border, margin: '4px 0' }} />
          )}
          {otherFiltered.length > 0 && (
            <div style={{ padding: '6px 12px 4px', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>All employees</div>
          )}
          {otherFiltered.map(emp => (
            <EmpRow key={emp.id} emp={emp} />
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardScreen({ requests, onNav, onToast, appEntity = null, physicalCardsAllowed, onPhysicalCardsChange, cardDelivery, onCardDeliveryChange, mobilityWidgetState, onMobilityWidgetStateChange, pendingRequests = 0, pendingExpenses = 0, pendingChoices = 0, activeBudgets = 0, onAddEmployee }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const fundingIssue = mobilityWidgetState.live && !!mobilityWidgetState.fundingIssue;
  const foodLive = mobilityWidgetState.live && mobilityWidgetState.widgetMode === 'food';
  const [foodUnmatched, setFoodUnmatched] = useState(2);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchQueue, setMatchQueue] = useState([]);
  const [matchSearch, setMatchSearch] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showLinkSection, setShowLinkSection] = useState(false);
  const [showLinkCombobox, setShowLinkCombobox] = useState(false);
  const socialSecretariat = 'SD Worx';
  const UNMATCHED_EMPLOYEES = [
    { name: 'Thomas Vandenberghe', niss: '92.11.03-567.89' },
    { name: 'Lasse Willems', niss: '95.07.18-123.45' },
  ];
  const foodMode = mobilityWidgetState.widgetMode === 'food';
  const totalPending = pendingRequests + pendingExpenses + pendingChoices + (fundingIssue ? 1 : 0) + (foodMode && foodUnmatched > 0 ? 1 : 0);
  const employeeCount = Object.keys(EMPLOYEES).length;
  const activeBenefits = BENEFIT_TYPES_SEED.filter(b => b.active).length;
  const firstName = CURRENT_USER.name.split(' ')[0];
  const setupInProgress = !mobilityWidgetState.live && !mobilityWidgetState.hidden;

  const attentionItems = [
    fundingIssue && { icon: 'alert-circle', label: 'Mobility top-up failed', count: '!', screen: 'settings-cardrules', iconBg: P.dangerBg, iconColor: P.danger, badgeBg: P.danger },
    foodMode && foodUnmatched > 0 && { icon: 'user-x', label: 'Unmatched employees — Meal vouchers', count: foodUnmatched, iconBg: '#FEF3C7', iconColor: '#D97706', badgeBg: '#D97706', onClick: () => { setMatchQueue([...UNMATCHED_EMPLOYEES]); setShowMatchModal(true); setSelectedPerson(null); } },
    pendingRequests > 0 && { icon: 'calendar-days', label: 'Time-off requests', count: pendingRequests, screen: 'requests', iconBg: '#e8f0fe', iconColor: '#2563eb' },
    pendingExpenses > 0 && { icon: 'receipt', label: 'Expense requests', count: pendingExpenses, screen: 'expenses', iconBg: P.warningBg, iconColor: '#b45309' },
    pendingChoices > 0 && { icon: 'list-checks', label: 'Choices to approve', count: pendingChoices, screen: 'choices', iconBg: '#ede9fe', iconColor: '#6d28d9' },
  ].filter(Boolean);

  return (
    <div style={{ flex: 1, overflow: 'auto', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <div style={{ opacity: setupInProgress ? 0.35 : 1, transition: `opacity 250ms ${EASE_OUT}`, pointerEvents: setupInProgress ? 'none' : 'auto' }}>
        <PageHeader
          title={`Hey, ${firstName}`}
          subtitle={today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          badge={appEntity ? (ENTITIES.find(e => e.id === appEntity)?.name) : null}
          maxWidth={960}
          noBorder
          padding="40px 0 20px"
        />
      </div>
      <div style={{ padding: 'var(--space-300) var(--space-400)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>

        {/* Full-width setup widget — always full-width until live */}
        {!mobilityWidgetState.live && (
          <div style={{ position: 'relative', zIndex: 2 }}>
            <MobilityLaunchWidget onToast={onToast} onNav={onNav} physicalCardsAllowed={physicalCardsAllowed} onPhysicalCardsChange={onPhysicalCardsChange} cardDelivery={cardDelivery} onCardDeliveryChange={onCardDeliveryChange} mobilityWidgetState={mobilityWidgetState} onMobilityWidgetStateChange={onMobilityWidgetStateChange} />
          </div>
        )}

        {/* Overview stats */}
        <div style={{ border: `1px solid ${P.border}`, borderRadius: 12, background: P.white, display: 'flex', overflow: 'hidden', opacity: setupInProgress ? 0.35 : 1, transition: `opacity 250ms ${EASE_OUT}`, pointerEvents: setupInProgress ? 'none' : 'auto' }}>
          {[
            { label: 'Employees', value: employeeCount, icon: 'users' },
            { label: 'Active budgets', value: activeBudgets, icon: 'wallet' },
            { label: 'Active benefits', value: activeBenefits, icon: 'sparkles' },
          ].map(({ label, value, icon }, i) => (
            <div key={label} style={{ flex: 1, padding: 'var(--space-250) var(--space-300)', borderLeft: i === 0 ? 'none' : `1px solid ${P.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', marginBottom: 'var(--space-125)' }}>
                <Icon name={icon} size={13} color={P.inkSoft} strokeWidth={1.75} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>{label}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: P.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Widget row — grid layout once setup is live or hidden */}
        <div style={{ display: 'flex', gap: 'var(--space-250)', alignItems: 'flex-start', opacity: setupInProgress ? 0.35 : 1, transition: `opacity 250ms ${EASE_OUT}`, pointerEvents: setupInProgress ? 'none' : 'auto' }}>
          {mobilityWidgetState.live && mobilityWidgetState.widgetMode !== 'food' && mobilityWidgetState.fundingIssue && (
            <div style={{ width: 420, flexShrink: 0 }}>
              <MobilityLaunchWidget onToast={onToast} onNav={onNav} physicalCardsAllowed={physicalCardsAllowed} onPhysicalCardsChange={onPhysicalCardsChange} cardDelivery={cardDelivery} onCardDeliveryChange={onCardDeliveryChange} mobilityWidgetState={mobilityWidgetState} onMobilityWidgetStateChange={onMobilityWidgetStateChange} />
            </div>
          )}

          {/* Needs attention */}
          <div style={{ flex: 1, border: `1px solid ${P.border}`, borderRadius: 12, background: P.white, overflow: 'hidden', minWidth: 0 }}>
            <div style={{ padding: 'var(--space-200) var(--space-300)', borderBottom: `1px solid ${P.border}` }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.ink }}>Needs attention</span>
            </div>
            {totalPending === 0 ? (
              <div style={{ padding: 'var(--space-500) var(--space-250)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-100)' }}>
                <Icon name="check-circle" size={20} color="#008556" strokeWidth={1.75} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>You're all caught up</span>
              </div>
            ) : attentionItems.map((item, i) => (
              <AttentionRow key={item.label} item={item} last={i === attentionItems.length - 1} onNav={onNav} />
            ))}
          </div>
        </div>

        {/* Unmatched employees modal (food live) */}
        {showMatchModal && matchQueue.length > 0 && (() => {
          // selectedPerson = unmatched employee being resolved (null = list view)
          // matchSearch = selected Payflip employee ID in the dropdown

          const allPeople = Object.entries(EMPLOYEES)
            .filter(([, e]) => e.isEmployee !== false)
            .map(([id, e]) => ({ id, ...e }));

          const pickedEmployee = matchSearch ? allPeople.find(p => p.id === matchSearch) : null;
          const pickedHasNiss = pickedEmployee?.niss;

          const fuzzyMatches = selectedPerson ? (() => {
            const tokens = selectedPerson.name.toLowerCase().split(/\s+/).filter(t => t.length > 2);
            return allPeople
              .map(p => ({ ...p, score: tokens.filter(t => p.name.toLowerCase().includes(t)).length }))
              .filter(p => p.score > 0)
              .sort((a, b) => b.score - a.score)
              .slice(0, 3);
          })() : [];

          const resolve = (emp) => {
            const next = matchQueue.filter(e => e.niss !== emp.niss);
            setMatchQueue(next);
            setSelectedPerson(null);
            setMatchSearch('');
            setShowLinkSection(false);
            setShowLinkCombobox(false);
            setFoodUnmatched(n => Math.max(0, n - 1));
            if (next.length === 0) setShowMatchModal(false);
          };

          const closeModal = () => {
            setShowMatchModal(false);
            setMatchQueue([]);
            setSelectedPerson(null);
            setMatchSearch('');
            setShowLinkSection(false);
            setShowLinkCombobox(false);
          };

          if (selectedPerson) {
            return (
              <ModalShell onClose={closeModal} width={440}>
                {close => (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Step 1: choose action */}
                    {!showLinkCombobox && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-200) var(--space-300)', borderBottom: `1px solid ${P.border}`, gap: 'var(--space-150)' }}>
                          <IconButton icon="arrow-left" onClick={() => { setSelectedPerson(null); setMatchSearch(''); setShowLinkSection(false); setShowLinkCombobox(false); }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: P.ink, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{selectedPerson.name}</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{selectedPerson.niss}</div>
                          </div>
                          <IconButton icon="X" onClick={close} blur />
                        </div>
                        <div style={{ padding: 'var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, lineHeight: '20px' }}>
                            This person wasn't found in Payflip. Add them as a new employee, or assign this NISS to someone who's already in the system.
                          </div>
                          <Button variant="primary" icon="user-plus" style={{ justifyContent: 'center' }} onClick={() => {
                            const parts = selectedPerson.name.trim().split(/\s+/);
                            const pFirst = parts.slice(0, -1).join(' ') || parts[0];
                            const pLast  = parts.length > 1 ? parts[parts.length - 1] : '';
                            resolve(selectedPerson);
                            closeModal();
                            onAddEmployee && onAddEmployee({ firstName: pFirst, lastName: pLast, niss: selectedPerson.niss });
                          }}>
                            Add as new employee
                          </Button>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
                            <div style={{ flex: 1, height: 1, background: P.border }} />
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: P.inkFaint }}>or</span>
                            <div style={{ flex: 1, height: 1, background: P.border }} />
                          </div>
                          <Button variant="secondary" style={{ justifyContent: 'center' }} onClick={() => setShowLinkCombobox(true)}>
                            Assign NISS to existing employee
                          </Button>
                          <div style={{ textAlign: 'center' }}>
                            <button onClick={() => resolve(selectedPerson)} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                              Ignore for this cycle
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    {/* Step 2: link to existing employee */}
                    {showLinkCombobox && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-200) var(--space-300)', borderBottom: `1px solid ${P.border}`, gap: 'var(--space-150)' }}>
                          <IconButton icon="arrow-left" onClick={() => { setShowLinkCombobox(false); setMatchSearch(''); }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: P.ink, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{selectedPerson.name}</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: P.inkSoft, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{selectedPerson.niss}</div>
                          </div>
                          <IconButton icon="X" onClick={close} blur />
                        </div>
                        <div style={{ padding: 'var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, lineHeight: '20px' }}>
                            <strong style={{ fontWeight: 600 }}>Assign this NISS to an existing employee.</strong> Select the employee this number belongs to. Their record will be updated with this national insurance number.
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-100)' }}>
                            <MatchEmpCombobox employees={allPeople} value={matchSearch} onChange={setMatchSearch} suggestions={fuzzyMatches} />
                            {pickedHasNiss && (
                              <div style={{ background: P.dangerBg, border: `1px solid ${P.dangerBorder}`, borderRadius: 8, padding: 'var(--space-125) var(--space-150)', display: 'flex', gap: 'var(--space-100)', alignItems: 'flex-start' }}>
                                <Icon name="alert-triangle" size={14} color={P.dangerDark} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 1 }} />
                                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.dangerDark, lineHeight: '18px' }}>
                                  {pickedEmployee.name} already has a NISS on file. It will be replaced.
                                </div>
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-100)' }}>
                            <Button variant="primary" style={{ justifyContent: 'center', opacity: pickedEmployee ? 1 : 0.4 }} disabled={!pickedEmployee} onClick={() => { if (pickedEmployee) { const resolved = selectedPerson; const emp = pickedEmployee; resolve(resolved); onToast?.({ message: `NISS linked to ${emp.name}`, type: 'approve', onUndo: () => { setMatchQueue(q => [...q, resolved]); setFoodUnmatched(n => n + 1); setShowMatchModal(true); setSelectedPerson(resolved); } }); } }}>
                              {pickedEmployee ? `Add NISS to ${pickedEmployee.name}` : 'Select an employee above'}
                            </Button>
                            <Button variant="secondary" style={{ justifyContent: 'center' }} onClick={() => { setShowLinkCombobox(false); setMatchSearch(''); }}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </ModalShell>
            );
          }

          return (
            <ModalShell onClose={closeModal} width={440}>
              {close => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 'var(--space-250) var(--space-300)', borderBottom: `1px solid ${P.border}` }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink }}>Unmatched employees</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginTop: 2 }}>
                        {matchQueue.length} {matchQueue.length === 1 ? 'person' : 'people'} from SD Worx not found in Payflip
                      </div>
                    </div>
                    <IconButton icon="X" onClick={close} blur />
                  </div>
                  <div>
                    {matchQueue.map((emp, idx) => (
                      <div key={emp.niss} style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-200) var(--space-300)', borderBottom: idx < matchQueue.length - 1 ? `1px solid ${P.border}` : 'none' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{emp.name}</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{emp.niss}</div>
                        </div>
                        <Button variant="secondary" onClick={() => { setSelectedPerson(emp); setMatchSearch(''); setShowLinkCombobox(false); }}>Resolve</Button>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: 'var(--space-150) var(--space-300)', borderTop: `1px solid ${P.border}`, textAlign: 'center' }}>
                    <button onClick={() => { setFoodUnmatched(0); closeModal(); }} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      Ignore all for this cycle
                    </button>
                  </div>
                </div>
              )}
            </ModalShell>
          );
        })()}

      </div>
      </div>
    </div>
  );
}

// ── Payflip Card settings ───────────────────────────────────────────────────
function CardRulesSettings({ physicalCardsAllowed, onPhysicalCardsChange, cardDelivery = 'home', onCardDeliveryChange, onToast, mobilityWidgetState, onMobilityWidgetStateChange, onNav }) {
  const [draftPhysicalCards, setDraftPhysicalCards] = useState(physicalCardsAllowed);
  const [draftCardDelivery, setDraftCardDelivery] = useState(cardDelivery);
  const [showResignModal, setShowResignModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [resignSigning, setResignSigning] = useState(false);
  const [savedPhysicalCards, setSavedPhysicalCards] = useState(physicalCardsAllowed);
  const [savedCardDelivery, setSavedCardDelivery] = useState(cardDelivery);
  const isDirty = draftPhysicalCards !== savedPhysicalCards || draftCardDelivery !== savedCardDelivery;

  const handleSave = () => {
    onPhysicalCardsChange(draftPhysicalCards);
    onCardDeliveryChange && onCardDeliveryChange(draftCardDelivery);
    setSavedPhysicalCards(draftPhysicalCards);
    setSavedCardDelivery(draftCardDelivery);
    onToast && onToast({ message: 'Payflip Card settings saved', type: 'approve' });
  };

  const handleResign = (close) => {
    setResignSigning(true);
    setTimeout(() => {
      setResignSigning(false);
      close();
      onToast && onToast({ message: 'New mandate signed. Your bank account has been updated.', type: 'approve' });
    }, 1800);
  };

  // Account overview — computed from mobilityWidgetState
  const ws2 = mobilityWidgetState || {};
  const isLive = !!ws2.live;
  const setWs2 = (patch) => onMobilityWidgetStateChange && onMobilityWidgetStateChange({ ...ws2, ...patch });
  const allEligible2 = Object.entries(EMPLOYEES).filter(([, e]) => e.budget > 0).map(([id, e]) => ({ ...e, id }));
  const empCount2 = allEligible2.length;
  const deposit2 = Math.max(50, Math.round(empCount2 * 37 * 3 / 50) * 50);
  const invitedKeys2 = ws2.invitedKeys || [];
  const justLaunched2 = !!ws2.justLaunched;
  const fundingIssue2 = !!ws2.fundingIssue;
  const toppingUp2 = !!ws2.toppingUp;
  const liveBalance2 = fundingIssue2 ? Math.round(deposit2 * 0.12) : toppingUp2 ? Math.round(deposit2 * 0.15) : justLaunched2 ? deposit2 : Math.round(deposit2 * 0.725);
  const liveSpent2 = deposit2 - liveBalance2;
  const liveActiveCards2 = (justLaunched2 && !fundingIssue2) ? 0 : Math.max(1, Math.floor(empCount2 * 0.6));
  const threshold2 = Math.round(deposit2 * 0.2);
  // Y axis: 0 = full deposit (top), 100 = empty (bottom). Threshold sits at ~80% down.
  const thresholdY2 = +((1 - threshold2 / deposit2) * 100).toFixed(1);
  const yOf2 = (b) => +((1 - Math.max(0, b) / deposit2) * 100).toFixed(1);
  // Per-state spend cadence — shape tells the story, scaling aligns to the actual balance
  // Normal: 5 even steps, regular healthy spend
  // Topping-up: 3 large accelerating steps, rapid depletion that triggered auto top-up
  // Funding issue: 4 front-heavy steps, big initial burst that drained the account
  const rawSpend2 = fundingIssue2
    ? [[3, 38], [11, 28], [20, 22], [28, 12]]
    : toppingUp2
    ? [[5, 20], [14, 32], [24, 48]]
    : [[5, 18], [11, 22], [17, 20], [23, 22], [29, 18]];
  const rawTotal2 = rawSpend2.reduce((s, [, a]) => s + a, 0);
  const spendScale2 = (deposit2 - liveBalance2) / rawTotal2;
  const spendEvents2 = rawSpend2.map(([day, amt]) => [day, amt * spendScale2]);
  let _bal2 = deposit2;
  const _pts2 = [`M 0,${yOf2(_bal2)}`];
  for (const [day, amt] of spendEvents2) {
    _pts2.push(`L ${day * 10},${yOf2(_bal2)}`);
    _bal2 -= amt;
    _pts2.push(`L ${day * 10},${yOf2(_bal2)}`);
  }
  _pts2.push(`L 300,${yOf2(_bal2)}`);
  const linePath2 = _pts2.join(' ');
  const areaPath2 = linePath2 + ' L 300,100 L 0,100 Z';

  if (!isLive || mobilityWidgetState.widgetMode === 'food') {
    return (
      <div style={{ flex: 1, overflow: 'auto', animation: `screenEnter 180ms ${EASE_OUT}` }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-500) var(--space-400)', display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Payflip Card</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 'var(--space-050) 0 0' }}>Manage card accounts and settings for your employees</p>
          </div>
          <div style={{ border: `1px solid ${P.border}`, borderRadius: 12, background: P.white, padding: 'var(--space-600) var(--space-400)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-200)', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: P.bg, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="credit-card" size={20} color={P.inkSoft} strokeWidth={1.5} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-075)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-md)', color: P.ink }}>Mobility not set up yet</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, maxWidth: 340, lineHeight: '20px' }}>Card settings and mandate details will appear here once you've completed the Mobility setup.</span>
            </div>
            <Button variant="primary" icon="arrow-right" onClick={() => onNav && onNav('dashboard')}>Set up Mobility</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-500) var(--space-400)', display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>

        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Payflip Card</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 'var(--space-050) 0 0' }}>Manage card accounts and settings for your employees</p>
        </div>

        {/* Funding issue alert — page-level, above the account card */}
        {isLive && fundingIssue2 && (
          <div style={{ display: 'flex', gap: 'var(--space-150)', padding: 'var(--space-200) var(--space-250)', borderRadius: 10, border: '1px solid var(--alert-200)', background: P.dangerBg, alignItems: 'flex-start' }}>
            <Icon name="alert-circle" size={16} color={P.danger} strokeWidth={2} style={{ flexShrink: 0, marginTop: 'var(--space-025)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: '#991b1b', marginBottom: 'var(--space-050)' }}>Top-up payment failed</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.dangerDark, lineHeight: '18px', marginBottom: 'var(--space-150)' }}>
                The scheduled collection couldn't be processed. Check Twikey for the reason — it may require correcting bank details or re-signing the mandate.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)' }}>
                <Button variant="primary" onClick={() => window.open('https://app.twikey.com', '_blank')} style={{ fontSize: 'var(--fs-body-sm)', padding: 'var(--space-075) var(--space-150)' }}>
                  Resolve in Twikey →
                </Button>
                <a href="mailto:support@payflip.be?subject=Mobility%20card%20top-up%20failed" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, textDecoration: 'underline' }}>Contact support</a>
              </div>
            </div>
          </div>
        )}

        {/* Account overview — only when live */}
        {isLive && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
            <div style={SL}>Account</div>
            <div style={{ border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden', background: P.white }}>

              <div style={{ padding: 'var(--space-250) var(--space-300) var(--space-200)' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>Account balance</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 28, color: fundingIssue2 ? P.danger : P.ink, letterSpacing: '-0.5px', lineHeight: 1, marginBottom: toppingUp2 ? 6 : 10 }}>
                  €{liveBalance2.toLocaleString('de-DE')}
                </div>
                {toppingUp2 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: '#1d4ed8', fontWeight: 500, marginBottom: 'var(--space-100)' }}>
                    <Icon name="arrow-down-circle" size={13} color="#1d4ed8" strokeWidth={2} />
                    <span>+ €{deposit2.toLocaleString('de-DE')} incoming</span>
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>
                  {justLaunched2
                    ? `Invites sent to ${invitedKeys2.length} ${invitedKeys2.length === 1 ? 'employee' : 'employees'}`
                    : toppingUp2
                    ? `Auto top-up threshold: €${threshold2.toLocaleString('de-DE')}`
                    : `of €${deposit2.toLocaleString('de-DE')} funded`}
                </div>
              </div>

              {!justLaunched2 && (
                <svg viewBox="0 0 300 100" preserveAspectRatio="none" style={{ width: '100%', height: 110, display: 'block' }}>
                  <defs>
                    <linearGradient id="balGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={fundingIssue2 ? P.danger : toppingUp2 ? '#1d4ed8' : P.success} stopOpacity="0.1" />
                      <stop offset="100%" stopColor={fundingIssue2 ? P.danger : toppingUp2 ? '#1d4ed8' : P.success} stopOpacity="0.01" />
                    </linearGradient>
                  </defs>
                  {/* Threshold reference line */}
                  <line x1="0" y1={thresholdY2} x2="300" y2={thresholdY2} stroke="#e5e5e7" strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                  <path d={areaPath2} fill="url(#balGrad2)" />
                  <path d={linePath2} fill="none" stroke={fundingIssue2 ? P.danger : toppingUp2 ? '#1d4ed8' : P.success} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                </svg>
              )}

              {!justLaunched2 && (
                <div style={{ display: 'flex', borderTop: `1px solid ${P.border}` }}>
                  {[
                    { label: 'Active cards', value: `${liveActiveCards2} of ${invitedKeys2.length}` },
                    { label: 'Spent this month', value: `€${liveSpent2.toLocaleString('de-DE')}` },
                  ].map(({ label, value }, i) => (
                    <div key={label} style={{ flex: 1, padding: 'var(--space-150) var(--space-250)', borderLeft: i === 1 ? `1px solid ${P.border}` : 'none' }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-050)' }}>{label}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

        {/* Mandate */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
          <div style={SL}>Mandate</div>
          <SettingsCard info="Collections are processed by Twikey. Re-sign if your company's bank account changes.">
            <SettingsRow
              icon="landmark"
              label={<span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>Direct debit mandate<DotPill bg="#e6f4ee" color="#008556" dot size={11}>Active</DotPill></span>}
              subtitle="IBAN ending in 4821 · Signed 8 Aug 2026"
              trailing={<Button variant="secondary" onClick={() => setShowResignModal(true)} style={{ fontSize: 'var(--fs-body-sm)', padding: 'var(--space-075) var(--space-150)', whiteSpace: 'nowrap' }}>Re-sign</Button>}
              last
            />
          </SettingsCard>
        </div>

        {/* Card issuance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
          <div style={SL}>Card issuance</div>
          <SettingsCard info={draftPhysicalCards ? (draftCardDelivery === 'office' ? 'Cards ship to your company address within 5–7 business days. You distribute them to employees. A €9 shipping fee applies per card.' : 'Employees enter their delivery address when requesting a card. Cards arrive within 5–7 business days. A €9 shipping fee applies per card.') : 'Physical cards are optional. Enable them to let employees request a card from the app.'}>
            <SettingsRow
              icon="credit-card"
              label="Physical card requests"
              subtitle="Allow employees to request a physical card from the app"
              trailing={<Switch size="sm" checked={draftPhysicalCards} onChange={() => setDraftPhysicalCards(v => !v)} />}
              last={!draftPhysicalCards}
            />
            {draftPhysicalCards && (
              <SettingsRow
                icon="map-pin"
                label="Card delivery"
                value={draftCardDelivery === 'office' ? 'Company address' : 'Employee address'}
                onClick={() => setShowDeliveryModal(true)}
                last
              />
            )}
          </SettingsCard>
          {showDeliveryModal && (
            <PickModal
              title="Where do we send physical cards?"
              options={[
                { value: 'home', label: 'Employee address', hint: 'Employees enter their delivery address when requesting a card in the app.' },
                { value: 'office', label: 'Company address', hint: 'All cards ship to your company address. You receive and distribute them to employees.' },
              ]}
              value={draftCardDelivery}
              onSave={v => setDraftCardDelivery(v)}
              onClose={() => setShowDeliveryModal(false)}
            />
          )}
        </div>

        {/* Footer */}
        <div style={{ paddingTop: 'var(--space-100)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-125)' }}>
          <Button variant="primary" onClick={handleSave} disabled={!isDirty}>Save changes</Button>
        </div>

        {/* Prototype-only simulation controls — not part of product UI */}
        {isLive && (
          <div style={{ borderTop: `1px dashed ${P.border}`, paddingTop: 'var(--space-200)', display: 'flex', flexDirection: 'column', gap: 'var(--space-100)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)' }}>
              <Icon name="wrench" size={11} color={P.inkFaint} strokeWidth={1.75} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Prototype</span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-200)', flexWrap: 'wrap' }}>
              <a href="#" onClick={e => { e.preventDefault(); setWs2({ justLaunched: !ws2.justLaunched, fundingIssue: false, toppingUp: false }); }} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textDecoration: 'underline' }}>
                {ws2.justLaunched ? 'Simulate activity' : 'Simulate just launched'}
              </a>
              {!ws2.justLaunched && (
                <a href="#" onClick={e => { e.preventDefault(); setWs2({ toppingUp: !ws2.toppingUp, fundingIssue: false }); }} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: ws2.toppingUp ? '#1d4ed8' : P.inkFaint, textDecoration: 'underline' }}>
                  {ws2.toppingUp ? 'Clear top-up in progress' : 'Simulate top-up in progress'}
                </a>
              )}
              {!ws2.justLaunched && (
                <a href="#" onClick={e => { e.preventDefault(); setWs2({ fundingIssue: !ws2.fundingIssue, toppingUp: false }); }} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: ws2.fundingIssue ? P.danger : P.inkFaint, textDecoration: 'underline' }}>
                  {ws2.fundingIssue ? 'Clear top-up failure' : 'Simulate top-up failure'}
                </a>
              )}
            </div>
          </div>
        )}

      </div>

      {showResignModal && (
        <ModalShell
          title="Re-sign mandate"
          onClose={() => { setShowResignModal(false); setResignSigning(false); }}
          width={460}
          footer={close => (
            <div style={{ padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-125)', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={close} disabled={resignSigning}>Cancel</Button>
              <Button variant="primary" onClick={() => handleResign(close)} disabled={resignSigning}>
                {resignSigning ? 'Signing…' : 'Sign new mandate →'}
              </Button>
            </div>
          )}
        >
          <div style={{ padding: 'var(--space-250) var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 0, lineHeight: '20px' }}>
              Your current mandate authorises Payflip to collect funds from <strong style={{ color: P.ink, fontWeight: 500 }}>IBAN ending in 4821</strong>. Re-sign if your company's bank account has changed.
            </p>
            <div style={{ background: P.bg, border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-200) var(--space-200)', display: 'flex', flexDirection: 'column', gap: 'var(--space-100)' }}>
              {[
                { label: 'Mandate reference', value: 'PAYFLIP-2026-00142' },
                { label: 'Signed', value: '8 August 2026' },
                { label: 'Bank account', value: 'IBAN **** 4821' },
                { label: 'Status', value: 'Active' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 0, lineHeight: '18px' }}>
              You'll be redirected to Twikey to sign the new mandate. The old mandate will be cancelled automatically.
            </p>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

// ── Stub screens ──────────────────────────────────────────────────────────
// ── Expense category settings ──────────────────────────────────────────────
function CategoryModal({ title, initialVal, initialLimit, onSave, onDelete, onClose }) {
  const [val, setVal] = useState(initialVal);
  const [limitVal, setLimitVal] = useState(initialLimit != null ? String(initialLimit) : '');
  return (
    <ModalShell title={title} onClose={onClose}>
      {close => {
        const save = () => {
          const t = val.trim();
          if (!t) return;
          const n = parseFloat(limitVal);
          onSave(t, isNaN(n) ? null : n);
          close();
        };
        return (
          <>
            <div style={{ padding: 'var(--space-250) var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>Name</label>
                <input autoFocus value={val} onChange={e => setVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') close(); }}
                  placeholder="Category name"
                  style={{ width: '100%', padding: 'var(--space-100) var(--space-125)', borderRadius: 7, border: `1px solid ${P.border}`, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>Spending limit</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', border: `1px solid ${P.border}`, borderRadius: 7, padding: 'var(--space-100) var(--space-125)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>€</span>
                  <input type="number" min="0" value={limitVal} onChange={e => setLimitVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') close(); }}
                    placeholder="No limit"
                    style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, background: 'transparent' }} />
                </div>
                <p style={{ margin: 'var(--space-050) 0 0', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint }}>Monthly cap per employee. Leave blank for no limit.</p>
              </div>
            </div>
            <div style={{ padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
              {onDelete && (
                <Button variant="danger" onClick={() => { onDelete(); close(); }} style={{ marginRight: 'auto' }}>Delete</Button>
              )}
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button variant="primary" onClick={save}>Save</Button>
            </div>
          </>
        );
      }}
    </ModalShell>
  );
}

function PickModal({ title, options, value, onSave, onClose, extraField }) {
  const [selected, setSelected] = useState(value);
  const [extraVal, setExtraVal] = useState(extraField ? String(extraField.defaultValue) : '');
  return (
    <ModalShell title={title} onClose={onClose}>
      {close => {
        const save = () => { const n = parseFloat(extraVal); onSave(selected, extraField && selected === extraField.forValue ? (isNaN(n) ? extraField.defaultValue : n) : undefined); close(); };
        return (
          <>
            <div style={{ padding: 'var(--space-200)', display: 'flex', flexDirection: 'column', gap: 'var(--space-100)' }}>
              {options.map(opt => (
                <React.Fragment key={opt.value}>
                <ChoiceCard type="radio" selected={selected === opt.value} onClick={() => setSelected(opt.value)}
                  label={opt.label} description={opt.hint} />
                {extraField && opt.value === extraField.forValue && selected === extraField.forValue && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', margin: '-4px 0 4px 16px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>{extraField.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', border: `1px solid ${P.border}`, borderRadius: 7, padding: 'var(--space-075) var(--space-100)', background: P.bg }}>
                      <input type="number" min={extraField.min || 1} value={extraVal} onChange={e => setExtraVal(e.target.value)}
                        style={{ width: 48, border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, background: 'transparent', textAlign: 'right' }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>{extraField.suffix}</span>
                    </div>
                  </div>
                )}
                </React.Fragment>
              ))}
            </div>
            <div style={{ padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-125)', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button variant="primary" onClick={save}>Save</Button>
            </div>
          </>
        );
      }}
    </ModalShell>
  );
}

function AmountModal({ title, label, value, onSave, onClose, nullable }) {
  const [val, setVal] = useState(value != null ? String(value) : '');
  return (
    <ModalShell title={title} onClose={onClose}>
      {close => {
        const save = () => { const n = parseFloat(val); onSave(isNaN(n) ? null : n); close(); };
        return (
          <>
            <div style={{ padding: 'var(--space-250) var(--space-300)' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>{label}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', border: `1px solid ${P.border}`, borderRadius: 7, padding: 'var(--space-100) var(--space-125)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>€</span>
                <input autoFocus type="number" min="0" value={val} onChange={e => setVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') close(); }}
                  placeholder="0"
                  style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, background: 'transparent' }} />
              </div>
              {nullable && <p style={{ margin: 'var(--space-075) 0 0', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint }}>Leave blank for no limit.</p>}
            </div>
            <div style={{ padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-125)', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button variant="primary" onClick={save}>Save</Button>
            </div>
          </>
        );
      }}
    </ModalShell>
  );
}

const ELIGIBILITY_OPTS = [
  { value: 'all',      label: 'All employees',      hint: 'Every employee in this entity is eligible' },
  { value: 'specific', label: 'Specific employees', hint: 'Assign individually from each employee\'s profile' },
];

const REIMBURSE_OPTS = [
  { value: 'payroll', label: 'With next payroll run', hint: 'Included in the monthly payroll processing' },
  { value: 'weekly',  label: 'Separate bank transfer', hint: 'Processed independently from the payroll cycle' },
  { value: 'manual',  label: 'Manual (on request)', hint: 'Finance triggers payment manually' },
];
const APPROVAL_OPTS = [
  { value: 'manager', label: 'Direct manager',   hint: 'Employee\'s line manager receives the request' },
  { value: 'finance', label: 'Finance approver', hint: 'Person assigned in Team & access' },
];

function AllowancesListPage({ allowances, onSaveAllowance, appEntity = null }) {
  const [allowanceModal, setAllowanceModal] = useState(null);

  if (allowanceModal) {
    const typeInfo = ALLOWANCE_TYPES.find(t => t.id === allowanceModal);
    const config = allowances.find(a => a.id === allowanceModal) || { id: allowanceModal, active: false, rate: null };
    return <AllowanceSettingsPage config={config} typeInfo={typeInfo} onSave={onSaveAllowance} onBack={() => setAllowanceModal(null)} backLabel="Allowances" appEntity={appEntity} />;
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-500) var(--space-400)', display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
        <div>
          {appEntity && <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--space-025) var(--space-100)', borderRadius: 6, background: P.white, border: `1px solid ${P.border}`, fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-150)' }}>{ENTITIES.find(e => e.id === appEntity)?.name}</span>}
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Allowances</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 'var(--space-050) 0 0' }}>Belgian flat-rate allowances — enable only what applies to your company</p>
        </div>
        <div>
          <div style={SL}>Allowance types</div>
          <SettingsCard>
            {ALLOWANCE_TYPES.map((type, i) => {
              const config = allowances.find(a => a.id === type.id) || { active: false, rate: null };
              const valueText = config.active
                ? (config.rate != null ? `€ ${config.rate % 1 === 0 ? config.rate.toFixed(0) : config.rate.toFixed(2)} / ${type.unit}` : 'Enabled')
                : 'Not enabled';
              return (
                <SettingsRow key={type.id}
                  onClick={() => setAllowanceModal(type.id)}
                  icon={type.icon}
                  label={type.name}
                  value={valueText}
                  valueColor={config.active ? P.inkSoft : P.inkFaint}
                  last={i === ALLOWANCE_TYPES.length - 1}
                />
              );
            })}
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}

function ExpenseCategorySettings({ categories, onSave, appEntity = null, receiptAlwaysRequired = false, onReceiptPolicyChange, requireApproval = true, onRequireApprovalChange }) {
  const [items, setItems] = useState(categories);
  const [catModal, setCatModal] = useState(null);
  const [settingModal, setSettingModal] = useState(null);
  const [reimburseCycle, setReimburseCycle] = useState('payroll');
  const hasReceiptThreshold = !receiptAlwaysRequired;
  const setHasReceiptThreshold = (v) => onReceiptPolicyChange(typeof v === 'function' ? !v(!receiptAlwaysRequired) : !v);
  const [receiptThreshold, setReceiptThreshold] = useState(25);
  const [approvalRouting, setApprovalRouting] = useState('manager');

  const handleCatSave = (val, limit) => {
    const next = catModal.idx === 'new'
      ? [...items, { name: val, monthlyLimit: limit ?? null, budgetType: catModal.budgetType }]
      : items.map((c, i) => i === catModal.idx ? { ...c, name: val, monthlyLimit: limit ?? null } : c);
    setItems(next); onSave(next);
  };
  const handleCatDelete = () => {
    const next = items.filter((_, i) => i !== catModal.idx);
    setItems(next); onSave(next);
  };


  const cycleLabel = (REIMBURSE_OPTS.find(o => o.value === reimburseCycle) || {}).label || '';
  const approvalLabel = (APPROVAL_OPTS.find(o => o.value === approvalRouting) || {}).label || '';

  return (
    <>
    {catModal && (
      <CategoryModal
        title={catModal.idx === 'new' ? 'Add category' : 'Edit category'}
        initialVal={catModal.idx === 'new' ? '' : items[catModal.idx].name}
        initialLimit={catModal.idx === 'new' ? null : items[catModal.idx].monthlyLimit}
        onSave={handleCatSave}
        onDelete={catModal.idx !== 'new' ? handleCatDelete : null}
        onClose={() => setCatModal(null)}
      />
    )}
    {settingModal === 'cycle' && (
      <PickModal title="Reimbursement cycle" options={REIMBURSE_OPTS} value={reimburseCycle} onSave={setReimburseCycle} onClose={() => setSettingModal(null)} />
    )}
    {settingModal === 'approval-routing' && (
      <PickModal title="Route approvals to" options={APPROVAL_OPTS} value={approvalRouting} onSave={setApprovalRouting} onClose={() => setSettingModal(null)} />
    )}
    <div style={{ flex: 1, overflow: 'auto', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-500) var(--space-400)', display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
        <div>
          <div>
            {appEntity && <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--space-025) var(--space-100)', borderRadius: 6, background: P.white, border: `1px solid ${P.border}`, fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-150)' }}>{ENTITIES.find(e => e.id === appEntity)?.name}</span>}
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Expenses</h1>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 'var(--space-050) 0 0' }}>Configure expense categories and reimbursement rules</p>
        </div>

        <div>
          <div style={SL}>Reimbursement</div>
          <SettingsCard>
            <SettingsRow
              label="Require approval"
              subtitle="Expenses must be reviewed before reimbursement"
              trailing={<Switch size="sm" checked={requireApproval} onChange={() => onRequireApprovalChange(v => !v)} />}
              last
            />
          </SettingsCard>
        </div>

        {EXPENSE_BUDGET_TYPES.map(bt => {
          const btItems = items.map((c, i) => ({ c, i })).filter(({ c }) => c.budgetType === bt.id);
          return (
            <div key={bt.id}>
              <div style={SL}>{bt.label}</div>
              <SettingsCard>
                {btItems.map(({ c: cat, i: idx }, pos) => (
                  <SettingsRow key={cat.name + idx}
                    onClick={() => setCatModal({ idx, budgetType: bt.id })}
                    icon={getCategoryIcon(cat.name)}
                    label={cat.name}
                    value={cat.monthlyLimit != null ? `€ ${cat.monthlyLimit} / mo` : 'No limit'}
                  />
                ))}
                <SettingsRow onClick={() => setCatModal({ idx: 'new', budgetType: bt.id })}
                  icon="plus" label="Add category" labelColor={P.inkSoft} trailing={null} last />
              </SettingsCard>
            </div>
          );
        })}

      </div>
    </div>
    </>
  );
}

function PersonPickerModal({ title, value, candidates, sections, singleSelect, onSave, onClose, appEntity, note }) {
  const [selected, setSelected] = useState(singleSelect ? (value ? [value] : []) : (value || []));
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [search, activeTab]);

  const toggle = (key, close) => {
    if (singleSelect) { onSave(key); close(); return; }
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const pool = candidates || Object.entries(EMPLOYEES)
    .filter(([, e]) => e.adminAccess)
    .map(([key, e]) => ({ value: key, name: e.name, dept: e.department || (e.isEmployee === false ? 'External' : ''), entity: e.entity, initials: e.initials, color: e.color }));

  const matchesSearch = (e) => !search || e.name.toLowerCase().includes(search.toLowerCase()) || (e.dept || '').toLowerCase().includes(search.toLowerCase());

  // When sections are provided, render as tabs; search filters within the active tab
  const activeItems = sections
    ? (sections[activeTab]?.items || []).filter(matchesSearch)
    : null;
  const filtered = sections ? null : pool.filter(matchesSearch);

  const renderRow = (emp, close, isLast, showEntity, hasHints) => {
    const on = selected.includes(emp.value);
    return (
      <div key={emp.value} onClick={() => toggle(emp.value, close)}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-125) var(--space-250)', cursor: 'pointer', borderBottom: isLast ? 'none' : `1px solid ${P.border}`, opacity: emp.dimmed ? 0.5 : 1 }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(15,13,40,0.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
        {/* Col 1: checkbox / radio */}
        <div style={{ width: 18, flexShrink: 0 }}>
          {singleSelect
            ? <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${on ? P.action : P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `border-color 120ms` }}>
                {on && <div style={{ width: 8, height: 8, borderRadius: '50%', background: P.action }} />}
              </div>
            : <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${on ? P.action : P.border}`, background: on ? P.action : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `background 120ms, border-color 120ms` }}>
                {on && <Icon name="check" size={11} color="#fff" strokeWidth={3} />}
              </div>
          }
        </div>
        {/* Col 2: avatar + name */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-100)', minWidth: 0 }}>
          <Avatar employeeId={emp.value} size={22} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 500, color: P.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
            {emp.dept && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.dept}</div>}
          </div>
        </div>
        {/* Col 3: entity */}
        {showEntity && (
          <div style={{ width: 100, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {emp.entity}
          </div>
        )}
        {/* Col 4: budget / hint */}
        {hasHints && (
          <div style={{ width: 64, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 500, color: emp.hintColor || P.inkSoft, textAlign: 'right', flexShrink: 0 }}>
            {emp.hint || ''}
          </div>
        )}
      </div>
    );
  };

  return (
    <ModalShell title={title} onClose={onClose} width={580} maxHeight="70vh">
      {close => {
        const save = () => { onSave(selected); close(); };
        return (
          <>
        {/* Note callout */}
        {note && (
          <div style={{ padding: 'var(--space-125) var(--space-250)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', padding: 'var(--space-100) var(--space-150)', background: P.successBg, border: '1px solid var(--success-200)', borderRadius: 8 }}>
              <Icon name="circle-check" size={13} color={P.success} strokeWidth={2} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: '#15803d' }}>{note}</span>
            </div>
          </div>
        )}

        {/* Tabs (when multiple sections provided) */}
        {sections && sections.length > 1 && (
          <div style={{ borderBottom: `1px solid ${P.border}`, flexShrink: 0 }}>
            <TabBar
              tabs={sections.map((s, i) => ({ id: String(i), label: s.label }))}
              activeTab={String(activeTab)}
              onTabChange={i => { setActiveTab(Number(i)); setSearch(''); }}
              padding="0 20px"
            />
          </div>
        )}

        {/* Search — hidden when active tab is small */}
        {(!sections || (sections[activeTab]?.items || []).length >= 6) && (
          <div style={{ padding: 'var(--space-150) var(--space-250)', borderBottom: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-100)', flexShrink: 0 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-075)', border: `1px solid ${P.border}`, borderRadius: 7, padding: 'var(--space-100) 11px', background: P.white }}>
              <Icon name="search" size={12} color={P.inkFaint} strokeWidth={2} />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: 0, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.ink, lineHeight: 1 }} />
              {search && (
                <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <Icon name="x" size={10} color={P.inkFaint} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* List */}
        {(() => {
          const listItems = sections ? activeItems : filtered;
          const PAGE_SIZE = 10;
          const pageCount = Math.ceil(listItems.length / PAGE_SIZE);
          const safePage = Math.min(page, Math.max(1, pageCount));
          const paginated = listItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
          const allChecked = !singleSelect && paginated.length > 0 && paginated.every(e => selected.includes(e.value));
          const someChecked = !singleSelect && paginated.some(e => selected.includes(e.value)) && !allChecked;
          const toggleAll = () => {
            if (allChecked) setSelected(prev => prev.filter(k => !paginated.some(e => e.value === k)));
            else setSelected(prev => [...new Set([...prev, ...paginated.map(e => e.value)])]);
          };
          const showEntity = !appEntity;
          const hasHints = listItems.some(e => e.hint);
          return (
            <div style={{ flex: 1, overflowY: 'auto', minHeight: 220 }}>
              {/* Column header */}
              {!singleSelect && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)', padding: 'var(--space-100) var(--space-250)', borderTop: `1px solid ${P.border}`, borderBottom: `1px solid ${P.border}`, background: P.bg, position: 'sticky', top: 0, zIndex: 1 }}>
                  <div onClick={toggleAll} style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${allChecked || someChecked ? P.action : P.border}`, background: allChecked ? P.action : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: `background 120ms, border-color 120ms` }}>
                    {allChecked && <Icon name="check" size={11} color="#fff" strokeWidth={3} />}
                    {someChecked && <Icon name="minus" size={11} color={P.action} strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1 }}><span style={SL}>Employee</span></div>
                  {showEntity && <div style={{ width: 100, flexShrink: 0 }}><span style={SL}>Entity</span></div>}
                  {hasHints && <div style={{ width: 64, flexShrink: 0, textAlign: 'right' }}><span style={SL}>Available</span></div>}
                </div>
              )}
              <div key={`${activeTab}-${safePage}`} style={{ animation: PREFERS_REDUCED_MOTION ? 'tableEnterReduced 150ms ' + EASE_OUT : 'tableEnter 150ms ' + EASE_OUT }}>
                {paginated.length > 0
                  ? paginated.map((emp, idx) => renderRow(emp, close, idx === paginated.length - 1, showEntity, hasHints))
                  : <div style={{ padding: 'var(--space-250) var(--space-125)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, textAlign: 'center' }}>No results</div>
                }
              </div>
              {pageCount > 1 && (
                <div style={{ padding: 'var(--space-100) var(--space-250)', borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint }}>
                    {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, listItems.length)} of {listItems.length}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-050)' }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-050)', padding: 'var(--space-050) var(--space-125)', borderRadius: 6, border: `1px solid ${P.border}`, background: P.white, cursor: safePage === 1 ? 'default' : 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: safePage === 1 ? P.inkFaint : P.ink, opacity: safePage === 1 ? 0.5 : 1 }}>
                      <Icon name="ChevronLeft" size={13} color={safePage === 1 ? P.inkFaint : P.ink} strokeWidth={2} /> Prev
                    </button>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, padding: '0 var(--space-075)' }}>{safePage} / {pageCount}</span>
                    <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={safePage === pageCount} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-050)', padding: 'var(--space-050) var(--space-125)', borderRadius: 6, border: `1px solid ${P.border}`, background: P.white, cursor: safePage === pageCount ? 'default' : 'pointer', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: safePage === pageCount ? P.inkFaint : P.ink, opacity: safePage === pageCount ? 0.5 : 1 }}>
                      Next <Icon name="ChevronRight" size={13} color={safePage === pageCount ? P.inkFaint : P.ink} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Footer */}
        <div style={{ padding: 'var(--space-200) var(--space-250)', borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          {!singleSelect
            ? <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: selected.length > 0 ? P.ink : P.inkSoft }}>
                {selected.length > 0 ? `${selected.length} selected` : 'None selected'}
              </span>
            : <span />
          }
          <div style={{ display: 'flex', gap: 'var(--space-125)' }}>
            <Button variant="secondary" onClick={close}>Cancel</Button>
            {!singleSelect && <Button variant="primary" onClick={save}>Confirm</Button>}
          </div>
        </div>
          </>
        );
      }}
    </ModalShell>
  );
}

const ROLE_DEFS = [
  { key: 'finance-approver', label: 'Finance approver', icon: 'banknote',    hint: 'Reviews and approves expense submissions' },
  { key: 'hr-manager',       label: 'HR manager',       icon: 'user-check',  hint: 'Manages time off requests and employee records' },
  { key: 'payroll-admin',    label: 'Payroll admin',    icon: 'calculator',  hint: 'Processes payroll and views salary data' },
];

const ADMIN_ACCESS = [
  { value: 'full',    label: 'Full admin',  hint: 'Can access and configure everything in the tool' },
  { value: 'limited', label: 'Role-based',  hint: 'Access is limited to their assigned roles' },
];

const ADMIN_AREAS = [
  { value: 'time-off',  label: 'Time off',  hint: 'Approve and manage time off requests' },
  { value: 'expenses',  label: 'Expenses',  hint: 'Review and approve expense submissions' },
  { value: 'payroll',   label: 'Payroll',   hint: 'Process payroll and view salary data' },
];

function AdminAccessModal({ admin, access, onSave, onClose }) {
  const [step, setStep] = useState(Array.isArray(access) ? 2 : 1);
  const [selectedAreas, setSelectedAreas] = useState(Array.isArray(access) ? access : []);

  const AREA_LABELS = { 'time-off': 'Time off', 'expenses': 'Expenses', 'payroll': 'Payroll' };
  const SLIDE_DUR = 300;
  const onStep2 = step === 2;
  const step1Slide = onStep2 ? 'translateX(-100%)' : 'translateX(0)';
  const step2Slide = onStep2 ? 'translateX(0)' : 'translateX(100%)';
  const slideTransition = `transform ${SLIDE_DUR}ms ${EASE_DRAWER}`;

  const toggleArea = (value) => {
    setSelectedAreas(prev => prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]);
  };

  const headerAvatarAndName = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-150)' }}>
      <Avatar employeeId={admin.id} size={36} />
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink }}>{admin.name}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>{admin.email}</div>
      </div>
    </div>
  );

  return (
    <ModalShell onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
          {step === 2 && <IconButton icon="chevron-left" onClick={() => setStep(1)} size={28} />}
          {headerAvatarAndName}
        </div>
      }
      footer={close => (
        <div style={{ padding: 'var(--space-150) var(--space-300) var(--space-200)', borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-100)' }}>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          {step === 2 && (
            <Button variant="primary" disabled={selectedAreas.length === 0}
              onClick={() => { if (selectedAreas.length > 0) { onSave(selectedAreas); close(); } }}
              style={{ background: selectedAreas.length > 0 ? P.action : P.border, color: selectedAreas.length > 0 ? '#fff' : P.inkSoft }}>
              Save
            </Button>
          )}
        </div>
      )}>
      {close => (
        <>
        {/* Sliding content area — height morphs between step 1 and step 2 natural heights */}
        <div style={{ position: 'relative', overflow: 'hidden', height: onStep2 ? 180 : 132, transition: `height ${SLIDE_DUR}ms ${EASE_DRAWER}` }}>

          {/* Step 1: access type */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, transform: step1Slide, transition: slideTransition }}>
            <div style={{ padding: 'var(--space-100) var(--space-200) var(--space-050)' }}>
              <div onClick={() => { onSave('full'); close(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)', padding: '11px var(--space-125)', cursor: 'pointer', borderRadius: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, fontWeight: 500 }}>Full admin</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>Full access to all settings, tools, and approvals</div>
                </div>
                <Icon name="chevron-right" size={16} color={P.inkFaint} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              </div>
              <div onClick={() => setStep(2)}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)', padding: '11px var(--space-125)', cursor: 'pointer', borderRadius: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, fontWeight: 500 }}>Custom access</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>
                    {Array.isArray(access) && access.length > 0
                      ? access.map(a => AREA_LABELS[a] || a).join(' · ')
                      : 'Select which areas to manage'}
                  </div>
                </div>
                <Icon name="chevron-right" size={16} color={P.inkFaint} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              </div>
            </div>
          </div>

          {/* Step 2: area checkboxes */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, transform: step2Slide, transition: slideTransition }}>
            <div style={{ padding: 'var(--space-200)', display: 'flex', flexDirection: 'column', gap: 'var(--space-100)' }}>
              {ADMIN_AREAS.map(area => (
                <ChoiceCard key={area.value} type="checkbox" selected={selectedAreas.includes(area.value)} onClick={() => toggleArea(area.value)}
                  label={area.label} description={area.hint} />
              ))}
            </div>
          </div>
        </div>
        </>
      )}
    </ModalShell>
  );
}


// ── In-page entity switcher ───────────────────────────────────────────────
// Ghost trigger button + searchable modal. Resets on page navigation.
function EntityPickerModal({ value, onChange, onClose }) {
  const [search, setSearch] = useState('');

  const filtered = ENTITIES.filter(e =>
    !search.trim() || e.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <ModalShell title="Switch entity" onClose={onClose} width={400} maxHeight={560}>
      {close => {
        const pick = (id) => { onChange(id); close(); };
        return (
          <>
        <div style={{ padding: 'var(--space-125) var(--space-150) var(--space-075)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-125)', background: P.bg }}>
            <Icon name="search" size={14} color={P.inkFaint} strokeWidth={1.75} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search entities…"
              style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, flex: 1 }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <Icon name="X" size={13} color={P.inkFaint} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: 'var(--space-050) var(--space-100) var(--space-100)' }}>
          <button onClick={() => pick(null)} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-125)', width: '100%', padding: 'var(--space-100) var(--space-150)',
            border: 'none', borderRadius: 8,
            background: !value ? '#f3f0ff' : 'transparent', cursor: 'pointer', textAlign: 'left', marginBottom: 'var(--space-025)',
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: !value ? '#e9d5ff' : P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="building-2" size={15} color={!value ? P.action : P.inkSoft} strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: !value ? P.action : P.ink }}>Company defaults</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>All entities inherit these settings</div>
            </div>
            {!value && <Icon name="check" size={15} color={P.action} strokeWidth={2.5} />}
          </button>

          {filtered.length > 0 && <div style={{ height: 1, background: P.border, margin: 'var(--space-050) var(--space-050) var(--space-075)' }} />}

          {filtered.map(ent => (
            <button key={ent.id} onClick={() => pick(ent.id)} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-125)', width: '100%', padding: 'var(--space-100) var(--space-150)',
              border: 'none', borderRadius: 8,
              background: value === ent.id ? '#f3f0ff' : 'transparent', cursor: 'pointer', textAlign: 'left',
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: value === ent.id ? '#e9d5ff' : P.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="map-pin" size={15} color={value === ent.id ? P.action : P.inkSoft} strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: value === ent.id ? P.action : P.ink }}>{ent.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>{ent.country} · {ent.employeeCount} employees</div>
              </div>
              {value === ent.id && <Icon name="check" size={15} color={P.action} strokeWidth={2.5} />}
            </button>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: 'var(--space-300) var(--space-150)', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>
              No entities matching "{search}"
            </div>
          )}
        </div>
          </>
        );
      }}
    </ModalShell>
  );
}

function EntityPageSwitcher({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = value ? ENTITIES.find(e => e.id === value) : null;

  return (
    <React.Fragment>
      <button onClick={() => setOpen(true)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 'var(--space-075)',
        padding: 'var(--space-100) var(--space-200) var(--space-100) var(--space-150)',
        border: `1px solid ${P.border}`,
        borderRadius: 8,
        background: P.white,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-sm)',
        color: P.ink,
      }}>
        <Icon name={selected ? 'map-pin' : 'building-2'} size={13} color={P.inkSoft} strokeWidth={1.75} />
        {selected ? selected.name : 'Company defaults'}
        <Icon name="chevrons-up-down" size={12} color={P.inkFaint} strokeWidth={1.75} />
      </button>

      {open && <EntityPickerModal value={value} onChange={onChange} onClose={() => setOpen(false)} />}
    </React.Fragment>
  );
}

function TeamAccessSettings({ onNav, adminAccess, onAdminSave, appEntity = null }) {
  const admins = useMemo(() =>
    Object.entries(EMPLOYEES)
      .filter(([id, u]) => adminAccess[id] !== 'revoked' && (u.role === 'Admin' || u.isEmployee === false || id in adminAccess))
      .filter(([, u]) => !appEntity || u.entityId === appEntity)
      .map(([id, u]) => ({ id, name: u.name, initials: u.initials, color: u.color, email: u.email, access: id in adminAccess ? adminAccess[id] : (u.adminAccess || null) })),
    [adminAccess, appEntity]
  );

  const [adminModal, setAdminModal] = useState(null);

  const AREA_LABELS = { 'time-off': 'Time off', 'expenses': 'Expenses', 'payroll': 'Payroll' };

  return (
    <>
    {adminModal && (() => { const admin = admins.find(a => a.id === adminModal); return admin ? (
      <AdminAccessModal
        admin={admin}
        access={admin.access}
        onSave={newAccess => { onAdminSave(adminModal, newAccess); setAdminModal(null); }}
        onClose={() => setAdminModal(null)}
      />
    ) : null; })()}

    <div style={{ flex: 1, overflow: 'auto', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-500) var(--space-400)', display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>

        <div>
          <div>
            {appEntity && <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--space-025) var(--space-100)', borderRadius: 6, background: P.white, border: `1px solid ${P.border}`, fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-300)' }}>{ENTITIES.find(e => e.id === appEntity)?.name}</span>}
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Team & access</h1>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 'var(--space-050) 0 0' }}>Configure access levels for your admin team</p>
        </div>

        <div>
          <div style={SL}>Administrators</div>
          <SettingsCard>
            {admins.map((admin, idx) => {
              const areas = Array.isArray(admin.access) ? admin.access : null;
              const badge = admin.access === 'full'
                ? { label: 'Full admin', filled: true }
                : areas && areas.length > 0
                  ? { label: areas.map(a => AREA_LABELS[a] || a).join(' · '), filled: false }
                  : null;
              return (
                <SettingsRow key={admin.id}
                  onClick={() => setAdminModal(admin.id)}
                  leading={<Avatar employeeId={admin.id} size={32} />}
                  label={admin.name}
                  subtitle={admin.email}
                  last={idx === admins.length - 1}
                  trailing={<>
                    {badge
                      ? <DotPill dot={false} filled={badge.filled} color={badge.filled ? P.action : P.inkSoft} bg={P.bg} border={badge.filled ? null : P.border} padding="3px 10px" whiteSpace="nowrap">{badge.label}</DotPill>
                      : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, whiteSpace: 'nowrap', flexShrink: 0 }}>No access</span>
                    }
                    <Icon name="chevron-right" size={16} color={P.inkFaint} strokeWidth={1.75} style={{ flexShrink: 0, marginLeft: 'var(--space-200)' }} />
                  </>}
                />
              );
            })}
          </SettingsCard>
          <div style={{ marginTop: 'var(--space-125)' }}>
            <span onClick={() => onNav('employees:admin')} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, textDecoration: 'underline', cursor: 'pointer' }}>Manage admin roles in People</span>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}

const TIMEOFF_APPROVAL_OPTS = [
  { value: 'manager', label: 'Direct manager', hint: "Employee's line manager receives the request" },
  { value: 'hr',      label: 'HR manager',     hint: 'Person assigned in Team & access' },
  { value: 'auto',    label: 'Auto-approve',   hint: 'Requests under 3 days are approved automatically' },
];
const BENEFIT_TYPES_SEED = [
  { id: 'home-office', label: 'Home office',              icon: 'monitor',         hint: 'Equipment and furniture for remote work',                              active: true,  requiresApproval: true,  receiptRequired: true,  budgetCap: 500  },
  { id: 'learning',    label: 'Learning & Development',   icon: 'graduation-cap',  hint: 'Courses, books, conferences, and training',                            active: true,  requiresApproval: true,  receiptRequired: true,  budgetCap: null },
  { id: 'mobility',    label: 'Mobility',                 icon: 'bike',            hint: 'Bike lease, public transit, and commuting costs',                      active: true,  requiresApproval: true,  receiptRequired: false, budgetCap: null },
  { id: 'pension',     label: 'Pension savings',          icon: 'piggy-bank',      hint: 'Individual pension savings (fiscale pensioensparen) — capped by law',  active: true,  requiresApproval: false, receiptRequired: false, budgetCap: 990  },
  { id: 'meal',        label: 'Meal vouchers',            icon: 'utensils',        hint: 'Daily meal contribution via Payflip card — up to €8 / day',            active: true,  requiresApproval: false, receiptRequired: false, budgetCap: null },
];

const ENTITLEMENT_OPTS = [
  { value: 'legal',   label: 'Legal minimum',    hint: 'Belgian statutory: 20 days for full-time, prorated for part-time' },
  { value: 'company', label: 'Company policy',   hint: 'Set a custom entitlement above the legal minimum' },
];
const LEAVE_TYPE_AUDIT = {
  'Statutory annual leave': { by: 'Jana Goossens',    at: '3 Feb 2026'  },
  'ADV / RTT':              { by: 'Bruno Coen',       at: '8 Aug 2026'  },
  'Extra-legal leave':      { by: 'Jana Goossens',    at: '12 Mar 2026' },
  'Sick leave':             { by: 'Thomas Janssens',  at: '15 Jan 2026' },
  'Paternity leave':        { by: 'Jana Goossens',    at: '2 Jan 2026'  },
  'Maternity leave':        { by: 'Jana Goossens',    at: '2 Jan 2026'  },
  'Wedding':                { by: 'Bruno Coen',       at: '10 May 2026' },
  'Funeral leave':          { by: 'Jana Goossens',    at: '3 Feb 2026'  },
  'Ceremony':               { by: 'Jana Goossens',    at: '3 Feb 2026'  },
  'Civic duty':             { by: 'Thomas Janssens',  at: '18 Mar 2026' },
  'Moving':                 { by: 'Bruno Coen',       at: '20 Jun 2026' },
};

const LEAVE_TYPE_EXCEPTIONS = {
  'Statutory annual leave': [
    { empId: 'emma-martens',   value: '25 days' },
    { empId: 'stijn-laurent',  value: '29 days' },
    { empId: 'noor-de-smedt',  value: '16 days' },
    { empId: 'ruben-declercq', value: '25 days' },
  ],
};

const CARRYOVER_OPTS = [
  { value: 'q1',        label: 'Carry over until 31 March', hint: 'Unused days must be taken before 31 March of the following year (Belgian statutory requirement)' },
  { value: 'forfeit',   label: 'No carry-over',          hint: 'Unused days are forfeited at year end' },
  { value: 'cap',       label: 'Limited carry-over',       hint: 'Set a maximum number of days that roll over to January' },
  { value: 'unlimited', label: 'Carry over all unused',   hint: 'All remaining days roll over' },
  { value: 'payout',    label: 'Pay out unused days',     hint: 'Remaining balance is included in the last payroll of the year' },
];
const DEFAULT_LEAVE_CONFIGS = {
  'Statutory annual leave':      { requiresApproval: true,  declaration: false, docRequired: false, maxDays: 20,   editRequiresApproval: false, cancelRequiresApproval: false, carryover: 'q1',      allowHalfDay: true,  docThresholdDays: 0 },
  'ADV / RTT':                   { requiresApproval: true,  declaration: false, docRequired: false, maxDays: null, editRequiresApproval: false, cancelRequiresApproval: false, carryover: 'forfeit', allowHalfDay: true,  docThresholdDays: 0, advAwardMethod: 'accrued' },
  'Extra-legal leave':           { requiresApproval: true,  declaration: false, docRequired: false, maxDays: null, editRequiresApproval: false, cancelRequiresApproval: false, carryover: 'forfeit', allowHalfDay: true,  docThresholdDays: 0 },
  'Sick leave':                  { requiresApproval: false, declaration: true,  docRequired: true,  maxDays: null, editRequiresApproval: false, cancelRequiresApproval: false, carryover: null,      allowHalfDay: false, docThresholdDays: 2 },
  'Paternity leave':                 { requiresApproval: false, declaration: false, adminOnly: true, docRequired: false, maxDays: null, editRequiresApproval: false, cancelRequiresApproval: false, carryover: null, allowHalfDay: false, docThresholdDays: 0 },
  'Maternity leave':             { requiresApproval: false, declaration: false, adminOnly: true, docRequired: false, maxDays: null, editRequiresApproval: false, cancelRequiresApproval: false, carryover: null, allowHalfDay: false, docThresholdDays: 0 },
  'Wedding':                     { requiresApproval: false, declaration: false, docRequired: false, maxDays: null, editRequiresApproval: false, cancelRequiresApproval: false, carryover: null, allowHalfDay: false, docThresholdDays: 0 },
  'Funeral leave':               { requiresApproval: false, declaration: false, docRequired: false, maxDays: null, editRequiresApproval: false, cancelRequiresApproval: false, carryover: null, allowHalfDay: false, docThresholdDays: 0 },
  'Ceremony':                    { requiresApproval: false, declaration: false, docRequired: false, maxDays: null, editRequiresApproval: false, cancelRequiresApproval: false, carryover: null, allowHalfDay: false, docThresholdDays: 0 },
  'Civic duty':                  { requiresApproval: false, declaration: false, docRequired: true,  maxDays: null, editRequiresApproval: false, cancelRequiresApproval: false, carryover: null, allowHalfDay: false, docThresholdDays: 0 },
  'Moving':                      { requiresApproval: false, declaration: false, docRequired: false, maxDays: 1,    editRequiresApproval: false, cancelRequiresApproval: false, carryover: 'forfeit', allowHalfDay: true, docThresholdDays: 0 },
  'Seniority leave':             { requiresApproval: false, declaration: false, docRequired: false, maxDays: null, editRequiresApproval: false, cancelRequiresApproval: false, carryover: 'forfeit', allowHalfDay: false, docThresholdDays: 0, active: false },
};

const LEAVE_COLOR_VALUES = [...new Set(Object.values(LEAVE_COLORS))];
const LEAVE_COLOR_ENTRIES = Object.entries(LEAVE_COLORS);

function AllowanceSettingsPage({ config, typeInfo, onSave, onBack, backLabel = 'Expenses', appEntity = null }) {
  const [active, setActive] = useState(config.active);
  const [rate, setRate] = useState(config.rate != null ? String(config.rate) : (typeInfo.defaultRate != null ? String(typeInfo.defaultRate) : ''));
  const [specific, setSpecific] = useState((config.eligibility || 'all') === 'specific');
  const [assignedEmployees, setAssignedEmployees] = useState(config.assignedEmployees || []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [hasMinKm, setHasMinKm] = useState(config.minKm != null);
  const [minKm, setMinKm] = useState(config.minKm != null ? String(config.minKm) : '');
  const [minHours, setMinHours] = useState(config.minHours != null ? String(config.minHours) : '');

  const card = { border: `1px solid ${P.border}`, borderRadius: 16, overflow: 'clip', background: P.white };
  const settingsRowStyle = (last) => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-200)', padding: 'var(--space-200) var(--space-250)', borderBottom: last ? 'none' : `1px solid ${P.border}` });

  const rateNum = parseFloat(rate);
  const rateValid = !isNaN(rateNum) && rateNum > 0;
  const overCeiling = typeInfo.nsssCeiling && rateValid && rateNum > typeInfo.nsssCeiling;
  const rateDiffersFromDefault = typeInfo.defaultRate != null && rateValid && Math.abs(rateNum - typeInfo.defaultRate) > 0.0001;

  const submissionLines = {
    mileage: ['Employees submit trips from their expense screen — origin, destination and kilometres.', 'Approved amounts are added to the next payroll run. No receipt required.'],
    auto:    ['Added automatically to the payslip each month. Employees don\'t submit anything.', 'Pro-rata applies for partial months based on start date, end date, and unpaid leave.'],
    daily:   ['Employees mark the days they worked away from their usual location.', 'Approved days are reimbursed in the next payroll run. No receipt required.'],
  }[typeInfo.submissionType];

  const handleSave = () => {
    onSave({
      id: typeInfo.id, active, rate: rateValid ? rateNum : null,
      eligibility: specific ? 'specific' : 'all',
      assignedEmployees: specific ? assignedEmployees : [],
      minKm: typeInfo.id === 'mileage' && hasMinKm && minKm !== '' ? parseFloat(minKm) : undefined,
      minHours: typeInfo.id === 'meal-allowance' && minHours !== '' ? parseFloat(minHours) : undefined,
    });
    onBack();
  };

  const tabsRef = useRef(null);
  useLayoutEffect(() => {
    const bar = tabsRef.current;
    if (!bar) return;
    const pill = bar.querySelector('.t-tabs-pill');
    const activeTab = bar.querySelector('[aria-selected="true"]');
    if (!pill || !activeTab) return;
    if (!pill.style.width) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const b = tabsRef.current;
        if (!b) return;
        const p = b.querySelector('.t-tabs-pill');
        const t = b.querySelector('[aria-selected="true"]');
        if (!p || !t) return;
        p.style.transition = 'none';
        p.style.transform = `translateX(${t.offsetLeft}px)`;
        p.style.width = `${t.offsetWidth}px`;
        void p.offsetWidth;
        p.style.transition = '';
      }));
    } else {
      pill.style.transform = `translateX(${activeTab.offsetLeft}px)`;
      pill.style.width = `${activeTab.offsetWidth}px`;
    }
  }, [specific, active]);

  const allCandidates = Object.entries(EMPLOYEES)
    .filter(([, e]) => e.isEmployee !== false && (!appEntity || e.entityId === appEntity))
    .map(([id, e]) => ({ value: id, name: e.name, dept: e.department, entity: e.entity, initials: e.initials, color: e.color }));

  return (
    <>
    {pickerOpen && (
      <PersonPickerModal
        title="Assign employees"
        value={assignedEmployees}
        candidates={allCandidates}
        singleSelect={false}
        onSave={ids => setAssignedEmployees(ids)}
        onClose={() => setPickerOpen(false)}
        appEntity={appEntity}
      />
    )}
    <div style={{ flex: 1, overflow: 'auto', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-400) var(--space-400) var(--space-1000)', display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>

        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-075)', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, alignSelf: 'flex-start' }}>
          <Icon name="chevron-left" size={14} color={P.inkSoft} strokeWidth={2.5} />
          {backLabel}
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', marginBottom: 'var(--space-075)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>{typeInfo.name}</h1>
            <button onClick={() => setInfoOpen(true)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 'var(--space-025)', display: 'flex', alignItems: 'center', color: P.inkFaint, flexShrink: 0, marginTop: 'var(--space-050)' }}>
              <Icon name="info" size={16} color={P.inkFaint} strokeWidth={1.75} />
            </button>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 0 }}>{typeInfo.description}</p>
        </div>

        {/* Status */}
        <div>
          <div style={SL}>Status</div>
          <div style={card}>
            <div style={settingsRowStyle(true)}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>Enable {typeInfo.name.toLowerCase()} allowance</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginTop: 'var(--space-050)' }}>Make this allowance available to eligible employees</div>
              </div>
              <Switch size="sm" checked={active} onChange={() => setActive(v => !v)} />
            </div>
          </div>
        </div>

        {active && (<>

          {/* Rate */}
          <div style={{ animation: PREFERS_REDUCED_MOTION ? 'none' : `screenEnter 150ms ${EASE_OUT}` }}>
            <div style={SL}>{typeInfo.rateLabel}</div>
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-200)', padding: 'var(--space-200) var(--space-250)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>Amount per {typeInfo.unit}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', border: `1px solid ${overCeiling ? P.dangerBorder : P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-125)', background: overCeiling ? '#fff5f5' : P.white }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>€</span>
                  <input type="number" step="0.01" min="0" value={rate} onChange={e => setRate(e.target.value)}
                    style={{ width: 74, border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, textAlign: 'right', background: 'transparent' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>/ {typeInfo.unit}</span>
                </div>
              </div>
            </div>
            {overCeiling ? (
              <div style={{ marginTop: 'var(--space-100)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-100)', padding: 'var(--space-125) var(--space-200)', borderRadius: 10, background: P.dangerBg, border: '1px solid var(--alert-200)' }}>
                <Icon name="triangle-alert" size={13} color={P.danger} strokeWidth={2} style={{ flexShrink: 0, marginTop: 'var(--space-025)' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.danger, lineHeight: 1.5 }}>Exceeds the NSSS ceiling of €{typeInfo.nsssCeiling}/{typeInfo.unit}. The excess is subject to social contributions and personal income tax.</span>
              </div>
            ) : (() => {
              // The field above already shows the rate — restating "the official rate is €X"
              // is redundant unless the admin has actually changed it away from default.
              const restatesCurrentValue = !typeInfo.nsssCeiling && typeInfo.defaultRate != null && !rateDiffersFromDefault;
              const noteText = restatesCurrentValue
                ? (typeInfo.id === 'mileage' ? 'This rate is not updated automatically — check the NSSS website each January.' : null)
                : (typeInfo.nsssNote || 'No NSSS ceiling — set any amount.') + (typeInfo.id === 'mileage' ? ' This rate is not updated automatically — check the NSSS website each January.' : '');
              if (!noteText && !(rateDiffersFromDefault && typeInfo.defaultRate)) return null;
              return (
                <div style={{ marginTop: 'var(--space-100)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-150)' }}>
                  {noteText && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-100)' }}>
                      <Icon name="info" size={13} color={P.inkSoft} strokeWidth={2} style={{ flexShrink: 0, marginTop: 'var(--space-025)' }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, lineHeight: 1.5 }}>{noteText}</span>
                    </div>
                  )}
                  {rateDiffersFromDefault && typeInfo.defaultRate && (
                    <button onClick={() => setRate(String(typeInfo.defaultRate))}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.action, whiteSpace: 'nowrap', padding: 0, flexShrink: 0 }}>
                      Reset to €{typeInfo.defaultRate}
                    </button>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Mileage-specific */}
          {typeInfo.id === 'mileage' && (
            <div style={{ animation: PREFERS_REDUCED_MOTION ? 'none' : `screenEnter 150ms ${EASE_OUT}` }}>
              <div style={SL}>Trip rules</div>
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-200)', padding: 'var(--space-200) var(--space-250)', borderBottom: hasMinKm ? `1px solid ${P.border}` : 'none' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>Minimum trip distance</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginTop: 'var(--space-050)' }}>Reject trips shorter than a set distance</div>
                  </div>
                  <Switch size="sm" checked={hasMinKm} onChange={() => setHasMinKm(v => !v)} />
                </div>
                <div style={{ display: 'grid', gridTemplateRows: hasMinKm ? '1fr' : '0fr', transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 200ms ${EASE_OUT}`, overflow: 'hidden' }}>
                  <div style={{ minHeight: 0 }}>
                    <div style={{ padding: 'var(--space-200) var(--space-250)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-200)' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>Minimum km per trip</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-125)' }}>
                        <input type="number" step="1" min="0" value={minKm} onChange={e => setMinKm(e.target.value)} placeholder="0"
                          style={{ width: 60, border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, textAlign: 'right', background: 'transparent' }} />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>km</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {hasMinKm && (
                <div style={{ marginTop: 'var(--space-100)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-100)' }}>
                  <Icon name="info" size={13} color={P.inkSoft} strokeWidth={2} style={{ flexShrink: 0, marginTop: 'var(--space-025)' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>Trips shorter than this are rejected automatically.</span>
                </div>
              )}
            </div>
          )}

          {/* Meal allowance-specific */}
          {typeInfo.id === 'meal-allowance' && (
            <div style={{ animation: PREFERS_REDUCED_MOTION ? 'none' : `screenEnter 150ms ${EASE_OUT}` }}>
              <div style={SL}>Eligibility rules</div>
              <div style={card}>
                <div style={settingsRowStyle(true)}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>Minimum hours away from office</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginTop: 'var(--space-050)' }}>Only reimburse if employee is away for at least this many hours</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-075)', border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-125)' }}>
                    <input type="number" step="0.5" min="0" value={minHours} onChange={e => setMinHours(e.target.value)} placeholder="—"
                      style={{ width: 60, border: 'none', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, textAlign: 'right', background: 'transparent' }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>hrs</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Eligibility */}
          <div style={{ animation: PREFERS_REDUCED_MOTION ? 'none' : `screenEnter 150ms ${EASE_OUT}` }}>
            <div style={SL}>Eligibility</div>
            <div style={card}>
              <div style={{ padding: 'var(--space-200) var(--space-250)', borderBottom: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-200)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>Eligible employees</span>
                <div className="t-tabs" ref={tabsRef}>
                  <span className="t-tabs-pill" aria-hidden="true" />
                  {[{ value: false, label: 'All' }, { value: true, label: 'Specific' }].map(opt => (
                    <button key={String(opt.value)} className="t-tab"
                      role="tab" aria-selected={String(specific === opt.value)}
                      onClick={() => setSpecific(opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Revealed content — scoped to the selected entity; "All entities" shows every assignment */}
              <div style={{ display: 'grid', gridTemplateRows: '1fr', transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 220ms ${EASE_OUT}`, overflow: 'hidden' }}>
                <div style={{ minHeight: 0 }}>
                  {!specific ? (() => {
                    const allCount = Object.values(EMPLOYEES).filter(e => e.isEmployee !== false && (!appEntity || e.entityId === appEntity)).length;
                    return (
                      <EmptyState icon="users" title="Every employee is eligible"
                        description={`Applies to ${allCount} current employee${allCount === 1 ? '' : 's'}${appEntity ? '' : ' across all entities'} and all future hires automatically.`} />
                    );
                  })() : (() => {
                    const visibleAssigned = assignedEmployees.filter(id => {
                      const emp = EMPLOYEES[id];
                      return emp && (!appEntity || emp.entityId === appEntity);
                    });
                    return <>
                  {/* Truly empty — this allowance currently applies to nobody, not just "nobody visible here" */}
                  {assignedEmployees.length === 0 ? (
                    <EmptyState icon="users" title="No employees added yet"
                      description="Choose who should receive this allowance — it won't apply to anyone until you do."
                      action={<Button variant="primary" icon="plus" onClick={() => setPickerOpen(true)}>Add employees</Button>} />
                  ) : (
                    /* List header: count */
                    <div style={{ padding: 'var(--space-200) var(--space-250)', borderBottom: `1px solid ${P.border}` }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', fontWeight: 500, color: P.inkSoft }}>
                        {visibleAssigned.length === 0 ? 'No employees in this entity' : `${visibleAssigned.length} employee${visibleAssigned.length === 1 ? '' : 's'}`}
                      </span>
                    </div>
                  )}
                  {visibleAssigned.map((id, i) => {
                    const emp = EMPLOYEES[id];
                    const subtitle = appEntity ? emp.department : [emp.department, emp.entity].filter(Boolean).join(' · ');
                    return (
                      <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)', padding: 'var(--space-150) var(--space-250)' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: emp.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 9, color: P.ink }}>{emp.initials}</span>
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 'var(--space-075)' }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 500, color: P.ink }}>{emp.name}</span>
                          {subtitle && <>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint }}>·</span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>{subtitle}</span>
                          </>}
                        </div>
                        <IconButton icon="x" size={26} iconSize={13} color={P.inkSoft} danger onClick={() => setAssignedEmployees(prev => prev.filter(e => e !== id))} />
                      </div>
                    );
                  })}
                  {assignedEmployees.length > 0 && (
                    <div style={{ padding: 'var(--space-200) var(--space-250)', borderTop: `1px solid ${P.border}` }}>
                      <AppLink onClick={() => setPickerOpen(true)} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)' }}>Edit selection</AppLink>
                    </div>
                  )}
                  </>;
                  })()}
                </div>
              </div>
            </div>
          </div>

        </>)}


        {/* Footer */}
        <div style={{ paddingTop: 'var(--space-300)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-125)' }}>
          {active ? (
            <>
              <Button variant="secondary" onClick={onBack} style={{ background: P.white }}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={specific && assignedEmployees.length === 0}>Save changes</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={onBack} style={{ background: P.white }}>Cancel</Button>
          )}
        </div>

      </div>
    </div>

    {/* How it works modal */}
    {infoOpen && (
      <div onClick={() => setInfoOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,13,40,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: P.white, borderRadius: 16, width: 420, boxShadow: '0 8px 40px rgba(15,13,40,0.18)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-250) var(--space-300)', borderBottom: `1px solid ${P.border}` }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink }}>How it works</span>
            <button onClick={() => setInfoOpen(false)} style={{ border: 'none', cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(60,60,67,0.1)' }}>
              <Icon name="X" size={13} color={P.ink} strokeWidth={2.5} />
            </button>
          </div>
          <div style={{ padding: 'var(--space-250) var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-125)' }}>
            {(submissionLines || []).map((line, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-125)' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: P.inkFaint, flexShrink: 0, marginTop: 'var(--space-100)' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.6 }}>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function getCategoryIcon(name) {
  const n = (name || '').toLowerCase();
  if (/online cours|e-learning/.test(n)) return 'monitor-smartphone';
  if (/training|cours|learn|seminar|workshop|education|conference|congress/.test(n)) return 'book-open';
  if (/shared mobility|e-bike|e-scooter|scooter|villo|blue.?bike|felyx/.test(n)) return 'bike';
  if (/mobility subscription|transit pass|transport pass|season ticket/.test(n)) return 'credit-card';
  if (/public transport|nmbs|sncb|de lijn|stib|mivb/.test(n)) return 'train';
  if (/private transport/.test(n)) return 'car';
  if (/taxi|cab|uber|bolt|ride/.test(n)) return 'car';
  if (/restaurant|food|meal|lunch|dinner|eat|café|cafe|bistro|brasserie|snack|catering/.test(n)) return 'utensils';
  if (/flight|airline|airport|airfare|travel|trip/.test(n)) return 'plane';
  if (/hotel|accommodation|lodging|hostel|airbnb/.test(n)) return 'building-2';
  if (/\btrain\b|rail|metro|tram/.test(n)) return 'train';
  if (/\bbus\b|coach|shuttle/.test(n)) return 'bus';
  if (/transport|commut/.test(n)) return 'map-pin';
  if (/coffee|beverage|drink|bar/.test(n)) return 'coffee';
  if (/fuel|gas|petrol|diesel/.test(n)) return 'fuel';
  if (/phone|mobile|telecom|internet|broadband/.test(n)) return 'phone';
  if (/software|saas|license/.test(n)) return 'monitor-smartphone';
  if (/laptop|computer|hardware|device/.test(n)) return 'laptop';
  if (/office|supplies|stationery|paper/.test(n)) return 'pencil';
  if (/print/.test(n)) return 'printer';
  if (/health|medical|pharma|doctor|hospital/.test(n)) return 'stethoscope';
  if (/gift|present/.test(n)) return 'gift';
  if (/entertain|movie|film|cinema/.test(n)) return 'film';
  if (/shop|retail/.test(n)) return 'shopping-cart';
  if (/clean|maint|repair/.test(n)) return 'wrench';
  if (/truck|deliver|freight|shipping|cargo/.test(n)) return 'truck';
  if (/parking|park/.test(n)) return 'square-parking';
  return 'receipt';
}

function initLeaveTypes() {
  return LEAVE_SECTIONS.flatMap(section =>
    section.typeNames.map(name => {
      const meta = SPECIAL_LEAVE_METADATA[name];
      const cfg = DEFAULT_LEAVE_CONFIGS[name] || {};
      return {
        name,
        section: section.id,
        color: LEAVE_COLORS[name],
        active: cfg.active ?? true,
        requiresApproval: cfg.requiresApproval ?? true,
        declaration: cfg.declaration || false,
        adminOnly: cfg.adminOnly || false,
        docRequired: cfg.docRequired || false,
        statutory: meta?.statutory || false,
        companyPolicy: meta?.companyPolicy || false,
        statutoryDays: meta?.statutoryDays || null,
        statutoryLabel: meta?.statutoryLabel || null,
        statutoryNote: meta?.statutoryNote || null,
        limitedDays: !meta?.statutory && cfg.maxDays != null,
        maxDays: cfg.maxDays !== undefined ? cfg.maxDays : 20,
        editRequiresApproval: cfg.editRequiresApproval ?? false,
        cancelRequiresApproval: cfg.cancelRequiresApproval ?? false,
        carryover: cfg.carryover ?? null,
        allowHalfDay: cfg.allowHalfDay ?? true,
        docThresholdDays: cfg.docThresholdDays ?? 0,
        advAwardMethod: cfg.advAwardMethod ?? undefined,
        deletable: !meta?.statutory && !cfg.adminOnly && !cfg.declaration && name !== 'Statutory annual leave',
      };
    })
  );
}

function ConfirmDeleteModal({ name, onConfirm, onClose }) {
  return (
    <ModalShell onClose={onClose} width={380} zIndex={400}
      footer={close => (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-100)', padding: '0 var(--space-200) var(--space-200)' }}>
          <Button variant="secondary" onClick={close} style={{ padding: 'var(--space-100) var(--space-200)', background: P.white }}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm} style={{ padding: 'var(--space-100) var(--space-200)', background: P.danger }}>Delete leave type</Button>
        </div>
      )}>
      <div style={{ padding: 'var(--space-300) var(--space-300) var(--space-250)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink, marginBottom: 'var(--space-100)' }}>Delete {name}?</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.5 }}>
          This will permanently remove the leave type. Existing leave records won't be affected, but employees can no longer request it.
        </div>
      </div>
    </ModalShell>
  );
}

// Set to false to revert to the drawer pattern

function LeaveTypeSettingsPage({ config, allLeaveTypes = [], onSave, onDelete, onBack, companyRegime = COMPANY_REGIME_DEFAULTS, onToast, onNav, appEntity = null }) {
  const isNew = !config;
  const defaults = config || { name: '', color: LEAVE_COLOR_VALUES[0], active: true, requiresApproval: true, declaration: false, adminOnly: false, docRequired: false, limitedDays: false, maxDays: 20, editRequiresApproval: false, cancelRequiresApproval: false, statutory: false, companyPolicy: false, statutoryDays: null, statutoryLabel: null, statutoryNote: null, section: 'time-off', carryover: 'forfeit', allowHalfDay: true, docThresholdDays: 0, deletable: true };
  const [name,                  setName]                  = useState(defaults.name);
  const [color,                 setColor]                 = useState(defaults.color);
  const [active,                setActive]                = useState(defaults.active);
  const [requiresApproval,      setRequiresApproval]      = useState(defaults.requiresApproval);
  const [docRequired,           setDocRequired]           = useState(defaults.docRequired);
  const [docThresholdDays,      setDocThresholdDays]      = useState(defaults.docThresholdDays ?? 0);
  const [limitedDays,           setLimitedDays]           = useState(defaults.limitedDays);
  const [maxDays,               setMaxDays]               = useState(defaults.maxDays);
  const [editRequiresApproval,  setEditRequiresApproval]  = useState(defaults.editRequiresApproval ?? false);
  const [cancelRequiresApproval,setCancelRequiresApproval]= useState(defaults.cancelRequiresApproval ?? false);
  const [carryover,             setCarryover]             = useState(defaults.carryover ?? 'forfeit');
  const [carryoverCap,          setCarryoverCap]          = useState(defaults.carryoverCap ?? 5);
  const [allowHalfDay,          setAllowHalfDay]          = useState(defaults.allowHalfDay ?? true);
  const [advAwardMethod,        setAdvAwardMethod]        = useState(defaults.advAwardMethod ?? 'lump-sum');
  const [confirmDelete,         setConfirmDelete]         = useState(false);
  const [tooltip,               setTooltip]               = useState(null);
  const [dayLimitTip,           setDayLimitTip]           = useState(false);
  const showsAnnualBalance = !defaults.declaration && !defaults.adminOnly && !defaults.statutory && defaults.section !== 'special-leave';

  const uniqueColors = LEAVE_COLOR_VALUES;
  const colorUsers = React.useMemo(() => {
    const map = {};
    allLeaveTypes.forEach(lt => {
      if (lt.name === defaults.name) return;
      if (!map[lt.color]) map[lt.color] = [];
      map[lt.color].push(lt.name);
    });
    return map;
  }, [allLeaveTypes, defaults.name]);

  const save = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, active, requiresApproval, declaration: defaults.declaration, adminOnly: defaults.adminOnly, docRequired, docThresholdDays: docRequired ? docThresholdDays : 0, limitedDays, maxDays: (limitedDays || defaults.companyPolicy) ? (maxDays || 1) : null, editRequiresApproval, cancelRequiresApproval, carryover: showsAnnualBalance ? carryover : null, carryoverCap: carryover === 'cap' ? (carryoverCap || 5) : null, allowHalfDay, advAwardMethod: defaults.name === 'ADV / RTT' ? advAwardMethod : undefined, statutory: defaults.statutory, companyPolicy: defaults.companyPolicy, statutoryDays: defaults.statutoryDays, statutoryLabel: defaults.statutoryLabel, statutoryNote: defaults.statutoryNote, section: defaults.section, deletable: defaults.deletable ?? true });
    onToast?.({ message: isNew ? `${name.trim()} created` : `${name.trim()} saved`, type: 'approve' });
    onBack();
  };

  const card = { border: `1px solid ${P.border}`, borderRadius: 16, overflow: 'clip', background: P.white };
  const audit = !isNew ? LEAVE_TYPE_AUDIT[defaults.name] : null;

  const settingsRow = (label, hint, checked, onChange, last) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-200)', padding: 'var(--space-200) var(--space-250)', borderBottom: last ? 'none' : `1px solid ${P.border}` }}>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{label}</div>
        {hint && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginTop: 'var(--space-050)' }}>{hint}</div>}
      </div>
      <Switch size="sm" checked={checked} onChange={onChange} />
    </div>
  );

  const stepper = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden' }}>
        <button onClick={() => setMaxDays(v => Math.max(1, (parseInt(v) || 1) - 1))} style={{ width: 32, height: 36, border: 'none', background: P.bg, color: P.inkSoft, cursor: 'pointer', fontSize: 'var(--fs-body-md)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>−</button>
        <input type="text" inputMode="numeric" value={maxDays} onChange={e => setMaxDays(parseInt(e.target.value) || '')}
          style={{ width: 48, height: 36, border: 'none', borderLeft: `1px solid ${P.border}`, borderRight: `1px solid ${P.border}`, padding: '0 var(--space-050)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', textAlign: 'center', background: P.white }} />
        <button onClick={() => setMaxDays(v => (parseInt(v) || 0) + 1)} style={{ width: 32, height: 36, border: 'none', background: P.bg, color: P.inkSoft, cursor: 'pointer', fontSize: 'var(--fs-body-md)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>days per year</span>
    </div>
  );

  return (
    <div style={{ flex: 1, overflow: 'auto', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      {tooltip && (
        <div style={{ position: 'fixed', left: tooltip.x, top: tooltip.y - 6, transform: 'translateX(-50%) translateY(-100%)', padding: 'var(--space-050) var(--space-100)', borderRadius: 6, background: P.ink, color: '#fff', fontSize: 'var(--fs-body-xs)', fontWeight: 500, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 9999 }}>{tooltip.text}</div>
      )}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-400) var(--space-400) var(--space-1000)', display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>

        {/* Back */}
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-075)', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, alignSelf: 'flex-start' }}>
          <Icon name="chevron-left" size={14} color={P.inkSoft} strokeWidth={2.5} />
          Time off
        </button>

        {/* Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-200)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>
                  {name || 'New leave type'}
                </h1>
              </div>
              {audit && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginTop: 'var(--space-075)' }}>Last updated by {audit.by} · {audit.at}</div>}
            </div>
            {!isNew && !defaults.declaration && !defaults.adminOnly && !defaults.statutory && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)', paddingTop: 'var(--space-075)', flexShrink: 0 }}>
                <span key={active ? 'active' : 'inactive'} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, animation: PREFERS_REDUCED_MOTION ? 'none' : `labelFadeIn 120ms ${EASE_OUT}` }}>{active ? 'Active' : 'Inactive'}</span>
                <Switch size="sm" checked={active} onChange={() => setActive(v => !v)} />
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateRows: (!active && !defaults.declaration && !defaults.adminOnly && !defaults.statutory) ? '1fr' : '0fr', transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 200ms ${EASE_OUT}`, overflow: 'hidden' }}>
            <div style={{ minHeight: 0 }}>
              <div style={{ marginTop: 'var(--space-200)', padding: 'var(--space-150) var(--space-200)', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: '#1d4ed8', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-100)' }}>
                <Icon name="info" size={14} color="#3b82f6" strokeWidth={2} style={{ flexShrink: 0, marginTop: 'var(--space-025)' }} />
                Approved leave already on record is not affected. Pending requests will need to be handled manually.
              </div>
            </div>
          </div>
        </div>

        {/* Admin-only callout — above all sections */}
        {defaults.adminOnly && (
          <div style={{ padding: 'var(--space-150) var(--space-200)', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: '#1d4ed8', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-100)' }}>
            <Icon name="info" size={14} color="#3b82f6" strokeWidth={2} style={{ flexShrink: 0, marginTop: 'var(--space-025)' }} />
            This leave type is recorded by HR on behalf of the employee — it cannot be self-requested from the employee app.
          </div>
        )}

        {/* Settings sections — faded when inactive */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-400)', opacity: active ? 1 : 0.4, transition: PREFERS_REDUCED_MOTION ? 'none' : `opacity 200ms ${EASE_OUT}` }}>

        {/* Appearance */}
        <div>
          <div style={SL}>Appearance</div>
          <div style={card}>
            <div style={{ padding: 'var(--space-200) var(--space-250)', borderBottom: `1px solid ${P.border}` }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink, marginBottom: 'var(--space-075)' }}>Name</div>
              {!isNew && defaults.name === 'Statutory annual leave' ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: P.bg, border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-150)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>{name}</span>
                  <Icon name="lock" size={13} color={P.inkFaint} strokeWidth={2} />
                </div>
              ) : (
                <input autoFocus={isNew} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Parental leave"
                  style={{ width: '100%', border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-150)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', boxSizing: 'border-box' }} />
              )}
            </div>
            <div style={{ padding: 'var(--space-200) var(--space-250)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink, marginBottom: 'var(--space-125)' }}>Color</div>
              <div style={{ display: 'flex', gap: 'var(--space-100)', flexWrap: 'wrap' }}>
                {uniqueColors.map((c) => {
                  const entry = LEAVE_COLOR_ENTRIES.find(([, v]) => v === c);
                  const borderColor = entry ? (LEAVE_BORDER_COLORS[entry[0]] || P.border) : P.border;
                  const usedBy = colorUsers[c];
                  return (
                    <div key={c} onClick={() => setColor(c)}
                      onMouseEnter={e => { if (usedBy) { const r = e.currentTarget.getBoundingClientRect(); setTooltip({ text: `Used by ${usedBy.join(', ')}`, x: r.left + r.width / 2, y: r.top }); } }}
                      onMouseLeave={() => setTooltip(null)}
                      style={{ position: 'relative', width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer', border: `1.5px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {color === c && <Icon name="check" size={12} color={P.ink} strokeWidth={2.5} style={{ pointerEvents: 'none' }} />}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginTop: 'var(--space-100)' }}>Shown in calendar and leave overview</div>
            </div>
          </div>
        </div>

        {/* Allowance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-150)' }}>
          <div style={SL}>Allowance</div>

          {/* Day limit card */}
          {(() => {
            const advFT = defaults.name === 'ADV / RTT' ? Math.max(0, ((companyRegime.contractedHours - 38) / 2) * 12) : 0;
            const isLocked = defaults.statutory || defaults.declaration || defaults.name === 'ADV / RTT' || defaults.name === 'Extra-legal leave';
            const isChecked = isLocked ? false : limitedDays;
            const showBelow = isLocked || limitedDays;

            const tooltipText = defaults.statutory
              ? 'Set by Belgian law — cannot be changed'
              : defaults.declaration
              ? 'No legal maximum for this leave type'
              : defaults.name === 'ADV / RTT'
              ? 'Calculated automatically from contracted hours'
              : defaults.name === 'Extra-legal leave'
              ? 'Configured per employee or contract type'
              : null;

            const infoCallout = defaults.statutory
              ? defaults.statutoryNote
              : defaults.name === 'ADV / RTT'
              ? (advFT === 0
                  ? 'Your company uses 38h/week contracts — no ADV days are generated. Update contracted hours in Payroll settings.'
                  : `Based on contracted hours (${companyRegime.contractedHours}h/week)`)
              : defaults.name === 'Extra-legal leave'
              ? 'Extra-legal leave is additional vacation above the statutory 20-day minimum. The number of days is configured per employee or contract type under their profile.'
              : null;

            return (
              <>
                {!isLocked && (
                  <div style={card}>
                    {!defaults.declaration && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-200)', padding: 'var(--space-200) var(--space-250)', borderBottom: (!isLocked && limitedDays) ? `1px solid ${P.border}` : 'none' }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>Limit days per year</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginTop: 'var(--space-050)' }}>Cap the number of days per year — can be overridden per employee</div>
                        </div>
                        <div style={{ flexShrink: 0 }}
                          onMouseEnter={e => { if (isLocked && tooltipText) { const r = e.currentTarget.getBoundingClientRect(); setTooltip({ text: tooltipText, x: r.left + r.width / 2, y: r.top }); } }}
                          onMouseLeave={() => setTooltip(null)}>
                          <Switch size="sm" checked={isChecked} onChange={isLocked ? undefined : () => setLimitedDays(v => !v)} disabled={isLocked} />
                        </div>
                      </div>
                    )}
                    {!isLocked && (
                      <div style={{ display: 'grid', gridTemplateRows: limitedDays ? '1fr' : '0fr', transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 200ms ${EASE_OUT}`, overflow: 'hidden' }}>
                        <div style={{ minHeight: 0 }}>
                          <div style={{ padding: 'var(--space-200) var(--space-250)' }}>
                            {stepper}
                            {defaults.name === 'Seniority leave' && (
                              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginTop: 'var(--space-100)' }}>
                                This sets the maximum cap. Actual days per employee are configured under their profile based on years of service.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {isLocked && (infoCallout || (defaults.adminOnly && defaults.statutoryLabel)) && (
                  <div style={{ padding: 'var(--space-100) var(--space-150)', borderRadius: 8, background: P.bg, border: `1px solid ${P.border}`, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, display: 'flex', gap: 'var(--space-100)', alignItems: 'flex-start' }}>
                    <Icon name="info" size={14} color={P.inkSoft} strokeWidth={2} style={{ flexShrink: 0, marginTop: 'var(--space-025)' }} />
                    <span>
                      {defaults.adminOnly
                        ? (<>
                            {defaults.statutoryLabel && <strong style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{defaults.statutoryLabel} — </strong>}
                            {infoCallout}
                          </>)
                        : (<>
                            {(defaults.statutory && defaults.statutoryLabel) && <strong style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{defaults.statutoryLabel} — </strong>}
                            {(defaults.name === 'ADV / RTT' && advFT > 0) && <strong style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{advFT} days — </strong>}
                            {infoCallout}
                          </>)
                      }
                    </span>
                  </div>
                )}
              </>
            );
          })()}

          {/* ADV Accrual method card */}
          {defaults.name === 'ADV / RTT' && (
            <div style={{ ...card, overflow: 'visible' }}>
              <div style={{ padding: 'var(--space-200) var(--space-250)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink, marginBottom: 'var(--space-100)' }}>Accrual method</div>
                <SettingsSelect value={advAwardMethod} onChange={setAdvAwardMethod} opts={[
                  { value: 'lump-sum', label: 'Lump-sum upfront' },
                  { value: 'accrued', label: 'Monthly accrual' },
                ]} />
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginTop: 'var(--space-075)' }}>
                  {advAwardMethod === 'lump-sum'
                    ? 'All days granted upfront — employees can book days not yet earned, requiring year-end corrections'
                    : 'Days unlock month by month — employees can only book what they\'ve earned so far'}
                </div>
              </div>
            </div>
          )}

          {/* Carry-over card */}
          {showsAnnualBalance && (
            <div style={{ ...card, overflow: 'visible' }}>
              <div style={{ padding: 'var(--space-200) var(--space-250)', borderBottom: carryover === 'cap' ? `1px solid ${P.border}` : 'none' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink, marginBottom: 'var(--space-100)' }}>Roll over unused days</div>
                <SettingsSelect value={carryover} onChange={setCarryover} opts={CARRYOVER_OPTS} />
                {CARRYOVER_OPTS.find(o => o.value === carryover)?.hint && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginTop: 'var(--space-075)' }}>{CARRYOVER_OPTS.find(o => o.value === carryover)?.hint}</div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateRows: carryover === 'cap' ? '1fr' : '0fr', transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 200ms ${EASE_OUT}`, overflow: 'hidden' }}>
                <div style={{ minHeight: 0 }}>
                  <div style={{ padding: 'var(--space-200) var(--space-250)' }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-100)' }}>Maximum days that roll over</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden' }}>
                        <button onClick={() => setCarryoverCap(v => Math.max(1, (parseInt(v) || 1) - 1))} style={{ width: 32, height: 36, border: 'none', background: P.bg, color: P.inkSoft, cursor: 'pointer', fontSize: 'var(--fs-body-md)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>−</button>
                        <input type="text" inputMode="numeric" value={carryoverCap} onChange={e => setCarryoverCap(parseInt(e.target.value) || '')}
                          style={{ width: 48, height: 36, border: 'none', borderLeft: `1px solid ${P.border}`, borderRight: `1px solid ${P.border}`, padding: '0 var(--space-050)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', textAlign: 'center', background: P.white }} />
                        <button onClick={() => setCarryoverCap(v => (parseInt(v) || 0) + 1)} style={{ width: 32, height: 36, border: 'none', background: P.bg, color: P.inkSoft, cursor: 'pointer', fontSize: 'var(--fs-body-md)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
                      </div>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Requests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-150)' }}>
          <div style={SL}>Requests</div>

          {!defaults.declaration && !defaults.adminOnly && !(defaults.statutory && defaults.section === 'special-leave') && (
            <div style={card}>
              {settingsRow('Require approval', 'Each request must be approved before leave is confirmed', requiresApproval, () => setRequiresApproval(v => !v), !requiresApproval)}
              <div style={{ display: 'grid', gridTemplateRows: requiresApproval ? '1fr' : '0fr', transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 200ms ${EASE_OUT}`, overflow: 'hidden' }}>
                <div style={{ minHeight: 0 }}>
                  <div>
                    {settingsRow('Require approval to edit', 'Changes to approved leave are sent back for HR review', editRequiresApproval, () => setEditRequiresApproval(v => !v), false)}
                  </div>
                  {settingsRow('Require approval to cancel', 'HR must approve before days are returned to balance', cancelRequiresApproval, () => setCancelRequiresApproval(v => !v), true)}
                </div>
              </div>
            </div>
          )}

          <div style={card}>
            {settingsRow(
              defaults.adminOnly ? 'Request document from employee' : defaults.declaration ? 'Require medical certificate' : 'Require a supporting document',
              defaults.adminOnly ? 'Employee receives a document request when this leave is recorded' : defaults.declaration ? 'Employee must provide a signed medical certificate (doktersattest)' : 'Employee must attach a supporting document',
              docRequired, () => setDocRequired(v => !v), true
            )}
          </div>

          {defaults.declaration && docRequired && (
            <div style={card}>
              <div style={{ padding: 'var(--space-200) var(--space-250)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink, marginBottom: 'var(--space-050)' }}>Certificate required from day</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-125)' }}>Employees can self-certify for shorter absences</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden' }}>
                    <button onClick={() => setDocThresholdDays(v => Math.max(1, (parseInt(v) || 1) - 1))} style={{ width: 32, height: 36, border: 'none', background: P.bg, color: P.inkSoft, cursor: 'pointer', fontSize: 'var(--fs-body-md)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>−</button>
                    <input type="text" inputMode="numeric" value={docThresholdDays} onChange={e => setDocThresholdDays(parseInt(e.target.value) || '')}
                      style={{ width: 48, height: 36, border: 'none', borderLeft: `1px solid ${P.border}`, borderRight: `1px solid ${P.border}`, padding: '0 var(--space-050)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', textAlign: 'center', background: P.white }} />
                    <button onClick={() => setDocThresholdDays(v => (parseInt(v) || 0) + 1)} style={{ width: 32, height: 36, border: 'none', background: P.bg, color: P.inkSoft, cursor: 'pointer', fontSize: 'var(--fs-body-md)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>days</span>
                </div>
              </div>
            </div>
          )}

          {!defaults.adminOnly && !defaults.declaration && !(defaults.statutory && defaults.section === 'special-leave') && (
            <div style={card}>
              {settingsRow('Allow half-day requests', 'Employees can request a morning or afternoon instead of a full day', allowHalfDay, () => setAllowHalfDay(v => !v), true)}
            </div>
          )}
        </div>

        </div>{/* end fading sections */}

        {/* Employee exceptions — scoped to the selected entity; "All entities" shows every exception */}
        {!isNew && (() => {
          const exceptions = (LEAVE_TYPE_EXCEPTIONS[defaults.name] || [])
            .filter(exc => {
              const emp = EMPLOYEES[exc.empId];
              return emp && (!appEntity || emp.entityId === appEntity);
            });
          if (!exceptions.length) return null;
          return (
            <div>
              <div style={{ ...SL, marginBottom: 'var(--space-150)' }}>Employee exceptions</div>
              <SettingsCard>
                {exceptions.map((exc, i) => {
                  const emp = EMPLOYEES[exc.empId];
                  return (
                    <SettingsRow key={exc.empId}
                      onClick={() => onNav?.('employee-detail:' + exc.empId + ':timeoff')}
                      leading={<div style={{ width: 32, height: 32, borderRadius: '50%', background: emp.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-xs)', color: P.ink, flexShrink: 0 }}>{emp.initials}</div>}
                      label={emp.name}
                      subtitle={appEntity ? emp.department : [emp.department, emp.entity].filter(Boolean).join(' · ')}
                      value={exc.value}
                      last={i === exceptions.length - 1}
                    />
                  );
                })}
              </SettingsCard>
              <div style={{ marginTop: 'var(--space-100)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>Exceptions are set per employee and override these defaults.</div>
            </div>
          );
        })()}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-100)' }}>
          <div>
            {!isNew && onDelete && defaults.deletable && (
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete leave type</Button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-125)' }}>
            {isNew && (
              <Button variant="secondary" onClick={onBack} style={{ padding: 'var(--space-100) var(--space-250)' }}>Cancel</Button>
            )}
            <Button variant="primary" onClick={save} disabled={!name.trim()} style={{ padding: 'var(--space-100) var(--space-250)' }}>
              {isNew ? 'Create leave type' : 'Save changes'}
            </Button>
          </div>
        </div>
        {confirmDelete && (
          <ConfirmDeleteModal name={name} onConfirm={onDelete} onClose={() => setConfirmDelete(false)} />
        )}

      </div>
    </div>
  );
}

function TimeOffSettings({ appEntity = null, companyRegime = COMPANY_REGIME_DEFAULTS, onToast, onNav, leaveTypes, setLeaveTypes }) {
  const [leaveModal, setLeaveModal] = useState(null); // index or 'new'
  const [tab, setTab] = useState('active');

  const handleSave = (updated) => {
    if (leaveModal === 'new') {
      setLeaveTypes(prev => [...prev, updated]);
    } else {
      setLeaveTypes(prev => prev.map((lt, i) => i === leaveModal ? updated : lt));
    }
  };

  const handleDelete = () => {
    setLeaveTypes(prev => prev.filter((_, i) => i !== leaveModal));
    setLeaveModal(null);
  };

  if (leaveModal != null) {
    return (
      <LeaveTypeSettingsPage
        config={leaveModal === 'new' ? null : leaveTypes[leaveModal]}
        allLeaveTypes={leaveTypes}
        onSave={handleSave}
        onDelete={leaveModal !== 'new' ? handleDelete : null}
        onBack={() => setLeaveModal(null)}
        companyRegime={companyRegime}
        onToast={onToast}
        onNav={onNav}
        appEntity={appEntity}
      />
    );
  }

  const activeCount = leaveTypes.filter(lt => lt.active).length;
  const inactiveCount = leaveTypes.length - activeCount;

  return (
    <>
    <div style={{ flex: 1, overflow: 'auto', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-500) var(--space-400)', display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            {appEntity && <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--space-025) var(--space-100)', borderRadius: 6, background: P.white, border: `1px solid ${P.border}`, fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-150)' }}>{ENTITIES.find(e => e.id === appEntity)?.name}</span>}
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Time off</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 'var(--space-050) 0 0' }}>Configure the leave types available to your employees</p>
          </div>
          <Button variant="primary" icon="plus" onClick={() => setLeaveModal('new')} style={{ flexShrink: 0 }}>Add leave type</Button>
        </div>

        <div style={{ borderBottom: `1px solid ${P.border}` }}>
          <TabBar
            tabs={[
              { id: 'active', label: `Active${activeCount > 0 ? ` (${activeCount})` : ''}` },
              { id: 'inactive', label: `Inactive${inactiveCount > 0 ? ` (${inactiveCount})` : ''}` },
            ]}
            activeTab={tab}
            onTabChange={setTab}
            padding="0"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-300)' }}>
          {tab === 'inactive' && inactiveCount === 0 && (
            <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 16 }}>
              <EmptyState icon="moon" title="No inactive leave types" />
            </div>
          )}
          {LEAVE_SECTIONS.map(section => {
            const sectionTypes = leaveTypes.filter(lt => lt.section === section.id && lt.active === (tab === 'active'));
            if (sectionTypes.length === 0) return null;
            return (
              <div key={section.id}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 'var(--space-100)' }}>{section.label}</div>
                <SettingsCard>
                  {sectionTypes.map((lt, i) => {
                    const globalIdx = leaveTypes.indexOf(lt);
                    const subtitle = (() => {
                      const parts = [];
                      if (lt.adminOnly) parts.push('Admin only');
                      else if (lt.declaration) parts.push('Declaration');
                      else if (lt.requiresApproval) parts.push('Approval required');
                      if (lt.statutory && lt.statutoryLabel) parts.push(lt.statutoryLabel);
                      else if (lt.name === 'ADV / RTT') {
                        const advFT = Math.max(0, ((companyRegime.contractedHours - 38) / 2) * 12);
                        if (advFT > 0) parts.push(`${advFT} days`);
                      } else if (lt.companyPolicy && lt.maxDays) parts.push(`${lt.maxDays} ${lt.maxDays === 1 ? 'day' : 'days'}`);
                      else if (lt.limitedDays && lt.maxDays) parts.push(`${lt.maxDays} ${lt.maxDays === 1 ? 'day' : 'days'}`);
                      if (lt.docRequired) parts.push('Doc required');
                      return parts.length > 0 ? parts.join(' · ') : null;
                    })();
                    return (
                      <SettingsRow key={lt.name + globalIdx}
                        onClick={() => setLeaveModal(globalIdx)}
                        icon={LEAVE_SECTION_ICONS[lt.section] || LEAVE_ICONS[lt.name] || 'calendar'}
                        iconBadgeColor={lt.color}
                        dimmed={!lt.active}
                        label={lt.name}
                        subtitle={subtitle}
                        last={i === sectionTypes.length - 1}
                      />
                    );
                  })}
                </SettingsCard>
              </div>
            );
          })}
        </div>

      </div>
    </div>
    </>
  );
}

// ── Choices screen ─────────────────────────────────────────────────────────
function ChoiceRow({ choice, onApprove, onDecline, onDetail, showStatus }) {
  const emp = EMPLOYEES[choice.empId] || { name: choice.empId, initials: '?', color: P.border };
  const [hover, setHover] = useState(false);
  const isPending = choice.status === 'pending';
  const gridCols = showStatus
    ? '1.8fr 2fr 1fr 1fr 1fr 0.9fr 80px'
    : '1.8fr 2fr 1fr 1fr 1fr 80px';
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={() => onDetail && onDetail(choice)}
      style={{
        display: 'grid', gridTemplateColumns: gridCols,
        alignItems: 'center', gap: 'var(--space-150)', padding: '0 var(--space-250)', minHeight: 52,
        borderBottom: `1px solid ${P.border}`,
        background: hover ? P.bg : P.white,
        transition: 'background 0.1s',
        cursor: 'pointer',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', minWidth: 0 }}>
        <Avatar employeeId={choice.empId} size={24} style={{ border: '2px solid #fff', boxSizing: 'content-box' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', fontWeight: 500, color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</span>
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{choice.name}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-body-sm)', fontWeight: 600, color: P.ink, whiteSpace: 'nowrap' }}>{choice.price}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>{choice.sDate}</span>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>{choice.eDate}</span>
      {showStatus && <div style={{ display: 'flex' }}><StatusPill status={choice.status || 'approved'} /></div>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-050)' }}>
        {isPending && (<>
          <button title="Decline" onClick={e => { e.stopPropagation(); onDecline(choice.id); }}
            onMouseEnter={e => { e.currentTarget.style.background = P.dangerBg; e.currentTarget.style.borderColor = P.dangerBorder; }}
            onMouseLeave={e => { e.currentTarget.style.background = P.dangerBg; e.currentTarget.style.borderColor = P.dangerBorder; }}
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--alert-200)', background: P.dangerBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="X" size={14} color={P.danger} strokeWidth={2.5} />
          </button>
          <button title="Approve" onClick={e => { e.stopPropagation(); onApprove(choice.id); }}
            onMouseEnter={e => { e.currentTarget.style.background = P.successBg; e.currentTarget.style.borderColor = P.successBorder; }}
            onMouseLeave={e => { e.currentTarget.style.background = P.successBg; e.currentTarget.style.borderColor = P.successBorder; }}
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--success-200)', background: P.successBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="Check" size={14} color={P.success} strokeWidth={2.5} />
          </button>
        </>)}
      </div>
    </div>
  );
}

function ChoicesScreen({ choices, onApprove, onDecline, onDetail, appEntity = null }) {
  const [tab, setTab] = useState('pending');
  const [searchText, setSearchText] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const pendingCount = choices.filter(c => c.status === 'pending').length;
  const tabFiltered = tab === 'pending' ? choices.filter(c => c.status === 'pending')
    : tab === 'approved' ? choices.filter(c => c.status === 'approved')
    : tab === 'declined' ? choices.filter(c => c.status === 'declined')
    : choices;
  const filtered = tabFiltered.filter(c => {
    const emp = EMPLOYEES[c.empId];
    if (searchText.trim() && !emp?.name.toLowerCase().includes(searchText.trim().toLowerCase())) return false;
    if (deptFilter !== 'all' && emp?.department !== deptFilter) return false;
    return true;
  });
  const showStatus = tab === 'all';
  const gridCols = showStatus
    ? '1.8fr 2fr 1fr 1fr 1fr 0.9fr 80px'
    : '1.8fr 2fr 1fr 1fr 1fr 80px';
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <PageHeader
        title="Choices"
        subtitle="Review and approve employee benefit elections"
        badge={appEntity ? (ENTITIES.find(e => e.id === appEntity)?.name) : null}
        tabs={
          <TabBar
            tabs={[
              { id: 'pending', label: `Pending${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
              { id: 'approved', label: 'Approved' },
              { id: 'declined', label: 'Declined' },
              { id: 'all', label: 'All choices' },
            ]}
            activeTab={tab}
            onTabChange={v => { setTab(v); }}
          />
        }
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', padding: 'var(--space-300) var(--space-250) var(--space-200)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', border: `1px solid ${P.border}`, borderRadius: 7, padding: 'var(--space-100) var(--space-150)', width: 240, background: P.white }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.inkFaint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Search employee" style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.ink, width: '100%' }} />
        </div>
        <FilterDropdown label="All departments" active={deptFilter} opts={[['all', 'All departments'], ...DEPARTMENTS.map(d => [d, d])]} onSelect={setDeptFilter} minWidth={160} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-250) var(--space-250)' }}>
        <div style={{ background: P.white, borderRadius: 12, border: `1px solid ${P.border}`, overflow: 'clip' }}>
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, alignItems: 'center', gap: 'var(--space-150)', padding: '0 var(--space-250)', height: 38, borderBottom: `1px solid ${P.border}`, background: P.bg, position: 'sticky', top: 0, zIndex: 5 }}>
            <TH>Employee</TH>
            <TH>Choice</TH>
            <TH>Price</TH>
            <TH>Start date</TH>
            <TH>End date</TH>
            {showStatus && <TH>Status</TH>}
            <div />
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px var(--space-300)', textAlign: 'center' }}>
              <Icon name="ListChecks" size={32} color={P.border} />
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkFaint, marginTop: 'var(--space-150)' }}>
                No {tab === 'pending' ? 'pending ' : tab === 'approved' ? 'approved ' : tab === 'declined' ? 'declined ' : ''}choices
              </div>
            </div>
          ) : filtered.map(c => <ChoiceRow key={c.id} choice={c} onApprove={onApprove} onDecline={onDecline} onDetail={onDetail} showStatus={showStatus} />)}
        </div>
      </div>
    </div>
  );
}


// ── Entities settings screen ──────────────────────────────────────────────
function EntitiesSettings({ onNav, appEntity = null, companyRegime = COMPANY_REGIME_DEFAULTS, onRegimeChange }) {
  const [expandedId, setExpandedId] = useState(null);
  const [editingDomain, setEditingDomain] = useState(false);
  const [domainInput, setDomainInput] = useState(companyRegime.emailDomain || '');
  const saveDomain = () => {
    const v = domainInput.trim().toLowerCase().replace(/^@/, '');
    if (v) onRegimeChange?.({ ...companyRegime, emailDomain: v });
    setEditingDomain(false);
  };

  const ENTITY_OVERRIDES_DEMO = {
    'lumio-france': ['Entitlement', 'Approval workflow'],
    'lumio-nl': [],
    'lumio-group': [],
  };

  const card = { border: `1px solid ${P.border}`, borderRadius: 16, overflow: 'clip', background: P.white };

  return (
    <div style={{ flex: 1, overflow: 'auto', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-500) var(--space-400)', display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
        <div>
          <div>
            {appEntity && <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--space-025) var(--space-100)', borderRadius: 6, background: P.white, border: `1px solid ${P.border}`, fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-300)' }}>{ENTITIES.find(e => e.id === appEntity)?.name}</span>}
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Entities</h1>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 'var(--space-050) 0 0' }}>Manage your company's legal entities</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-125)', padding: 'var(--space-150) var(--space-200)', borderRadius: 10, background: '#f0f4ff', border: '1px solid #dbe4ff' }}>
          <Icon name="info" size={15} color="#4c6ef5" strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 'var(--space-025)' }} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: '#364fc7', lineHeight: 1.5 }}>
            Settings are configured at the company level by default. Entity-specific overrides can be added per setting where needed.
          </div>
        </div>

        <div>
          <div style={SL}>All entities</div>
          <div style={{ ...card, marginBottom: 'var(--space-100)' }}>
            <div style={{ padding: 'var(--space-150) var(--space-250)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-150)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-050)' }}>Email domain</div>
                {editingDomain ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
                    <input
                      autoFocus
                      value={domainInput}
                      onChange={e => setDomainInput(e.target.value.toLowerCase().replace(/^@/, ''))}
                      onKeyDown={e => { if (e.key === 'Enter') saveDomain(); if (e.key === 'Escape') setEditingDomain(false); }}
                      placeholder="company.com"
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink, border: `1px solid ${P.action}`, borderRadius: 6, padding: 'var(--space-050) var(--space-100)', outline: 'none', width: 180 }}
                    />
                    <button onClick={saveDomain} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.white, background: P.action, border: 'none', borderRadius: 6, padding: 'var(--space-075) var(--space-150)', cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setEditingDomain(false)} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.ink, background: 'transparent', border: `1px solid ${P.border}`, borderRadius: 6, padding: 'var(--space-050) var(--space-125)', cursor: 'pointer' }}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{companyRegime.emailDomain}</div>
                )}
                {!editingDomain && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginTop: 'var(--space-050)' }}>Used to validate work emails during employee onboarding. Entities can override this with their own domain.</div>}
              </div>
              {editingDomain ? null : (
                <button onClick={() => { setDomainInput(companyRegime.emailDomain || ''); setEditingDomain(true); }}
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.ink, background: 'transparent', border: `1px solid ${P.border}`, borderRadius: 6, padding: 'var(--space-050) var(--space-125)', cursor: 'pointer', flexShrink: 0 }}>
                  Edit
                </button>
              )}
            </div>
          </div>
          <div style={card}>
            {ENTITIES.map((ent, idx) => {
              const isExpanded = expandedId === ent.id;
              const overrides = ENTITY_OVERRIDES_DEMO[ent.id] || [];
              return (
                <React.Fragment key={ent.id}>
                  <div onClick={() => setExpandedId(isExpanded ? null : ent.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)', padding: 'var(--space-200) var(--space-250)', borderBottom: (idx < ENTITIES.length - 1 || isExpanded) ? `1px solid ${P.border}` : 'none', cursor: 'pointer' }}>
                    <Icon name="map-pin" size={16} color={P.inkFaint} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{ent.name}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginTop: 'var(--space-025)' }}>
                        {[ent.jc, ent.country].filter(Boolean).join(' · ') || ent.country}
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, whiteSpace: 'nowrap' }}>{ent.employeeCount} employees</span>
                    {overrides.length > 0 && (
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.action, background: '#f3f0ff', padding: 'var(--space-025) var(--space-100)', borderRadius: 10, whiteSpace: 'nowrap' }}>
                        {overrides.length} override{overrides.length > 1 ? 's' : ''}
                      </span>
                    )}
                    <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={P.inkFaint} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                  </div>
                  {isExpanded && (
                    <div style={{ padding: 'var(--space-150) var(--space-250) var(--space-200)', background: P.bg, borderBottom: idx < ENTITIES.length - 1 ? `1px solid ${P.border}` : 'none' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-150) var(--space-300)' }}>
                        {[
                          ['Country', ent.country],
                          ['Joint committee', ent.jc || '—'],
                          ['Payroll provider', ent.payrollProvider],
                          ['Integration ID', ent.integrationId || '—'],
                          ['Email domain', ent.emailDomain ? `${ent.emailDomain} (override)` : `${companyRegime.emailDomain} (inherited)`],
                          ['Employees', `${ent.employeeCount}`],
                          ['Overrides', overrides.length > 0 ? overrides.join(', ') : 'None — fully inherited'],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-025)' }}>{label}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => {}} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-075)',
            padding: 'var(--space-100) var(--space-200)', borderRadius: 8, border: `1px solid ${P.border}`, background: P.white,
            cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink,
          }}>
            <Icon name="plus" size={14} color={P.ink} strokeWidth={2} />
            Add entity
          </button>
        </div>
      </div>
    </div>
  );
}

function AddDocumentModal({ appEntity, title, saveLabel, onSave, onClose, initialValues, onDeactivate, isDeactivated, readOnly }) {
  const [name, setName] = useState(initialValues?.name || '');
  const [language, setLanguage] = useState(initialValues?.language && initialValues.language !== '—' ? initialValues.language : '');
  const [type, setType] = useState(initialValues?.type || 'File');
  const [scope, setScope] = useState(initialValues?.scope !== undefined ? initialValues.scope : (appEntity || ''));
  const [file, setFile] = useState(initialValues?.fileName ? { name: initialValues.fileName, size: 0 } : null);

  const fakeUpload = () => {
    if (file) { setFile(null); return; }
    const slug = name.trim() ? name.trim().toLowerCase().replace(/\s+/g, '-') : 'document';
    setFile({ name: `${slug}.pdf`, size: (0.8 + Math.random() * 2.4) * 1024 * 1024 });
  };

  return (
    <ModalShell title={title || `Add document${entityName ? ` for ${entityName}` : ''}`} onClose={onClose} width={440}>
      {close => {
        const handleSave = () => {
          if (!name.trim()) return;
          const id = initialValues?.id || `doc-${Date.now()}`;
          onSave({ ...(initialValues || {}), id, name: name.trim(), language: language || '—', type, fileName: file?.name, scope: scope || null });
          close();
        };
        return (
          <>
        <div style={{ padding: 'var(--space-250) var(--space-300)', display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>Name</label>
            <input autoFocus={!readOnly} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Work authorization" disabled={readOnly}
              style={{ width: '100%', border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-150)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', background: readOnly ? P.bg : P.white, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>Scope</label>
            <select value={scope} onChange={e => setScope(e.target.value)} disabled={readOnly}
              style={{ width: '100%', border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-150)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', background: readOnly ? P.bg : P.white }}>
              <option value="">Company-wide</option>
              {ENTITIES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-150)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} disabled={readOnly}
                style={{ width: '100%', border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-150)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', background: readOnly ? P.bg : P.white }}>
                <option value="">—</option>
                <option value="NL">NL</option>
                <option value="FR">FR</option>
                <option value="EN">EN</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-075)' }}>Type</label>
              <select value={type} onChange={e => setType(e.target.value)} disabled={readOnly}
                style={{ width: '100%', border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-150)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', background: readOnly ? P.bg : P.white }}>
                <option value="File">File</option>
                <option value="Url">URL</option>
              </select>
            </div>
          </div>
          {!readOnly && <div onClick={fakeUpload} style={{ border: `1px dashed ${file ? P.action : P.border}`, borderRadius: 8, padding: 'var(--space-200)', textAlign: 'center', background: file ? '#f5f3ff' : P.bg, cursor: 'pointer', transition: 'border-color 120ms, background 120ms' }}>
            {file ? (
              <>
                <Icon name="file-check" size={18} color={P.action} strokeWidth={1.5} />
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.ink, marginTop: 'var(--space-075)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginTop: 'var(--space-025)' }}>{(file.size / 1024 / 1024).toFixed(1)} MB · Click to change</div>
              </>
            ) : (
              <>
                <Icon name="upload" size={18} color={P.inkFaint} strokeWidth={1.5} />
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginTop: 'var(--space-075)' }}>Upload file <span style={{ color: P.inkFaint }}>(optional)</span></div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginTop: 'var(--space-025)' }}>PDF, DOCX up to 10 MB</div>
              </>
            )}
          </div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-100)', padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}` }}>
          <div>
            {onDeactivate && (
              <button onClick={() => { onDeactivate(); close(); }} style={{ padding: 'var(--space-100) var(--space-200)', border: `1px solid ${isDeactivated ? P.successBorder : P.dangerBorder}`, borderRadius: 8, background: isDeactivated ? P.successBg : P.dangerBg, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: isDeactivated ? P.success : P.danger, cursor: 'pointer' }}>
                {isDeactivated ? 'Reactivate' : 'Deactivate'}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-100)' }}>
            <Button variant="secondary" onClick={close} style={{ padding: 'var(--space-100) var(--space-200)', background: P.white }}>{readOnly ? 'Close' : 'Cancel'}</Button>
            {!readOnly && (
              <Button variant="primary" onClick={handleSave} disabled={!name.trim()} style={{ padding: 'var(--space-100) var(--space-200)' }}>
                {saveLabel || (title ? title.split(' for ')[0] : 'Add document')}
              </Button>
            )}
          </div>
        </div>
          </>
        );
      }}
    </ModalShell>
  );
}

function TableFadeIn({ children }) {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div style={{
      opacity: ready ? 1 : 0,
      transform: ready ? 'translateY(0)' : 'translateY(6px)',
      transition: PREFERS_REDUCED_MOTION
        ? `opacity 200ms ${EASE_OUT}`
        : `opacity 200ms ${EASE_OUT}, transform 200ms ${EASE_OUT}`,
    }}>
      {children}
    </div>
  );
}

function DocumentsSettings({ appEntity = null, documents = [], onDocumentsChange }) {
  const setDocuments = onDocumentsChange;
  const [tab, setTab] = useState('templates');
  const [addOpen, setAddOpen] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [docFilter, setDocFilter] = useState('active');

  const entityName = appEntity ? (ENTITIES.find(e => e.id === appEntity) || {}).name : null;

  const th = { textAlign: 'left', padding: 'var(--space-100) var(--space-200)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' };
  const td = { padding: 'var(--space-200) var(--space-200)', color: P.ink, verticalAlign: 'middle', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)' };
  const tdMuted = { ...td, color: P.inkFaint, opacity: 0.6 };

  const ActionBtn = ({ icon, label, onClick, danger }) => (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-075)', padding: 'var(--space-050) var(--space-125)', border: `1px solid ${danger ? P.dangerBorder : P.border}`, borderRadius: 6, background: danger ? P.dangerBg : P.white, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: danger ? P.danger : P.ink, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      <Icon name={icon} size={12} color={danger ? P.danger : P.inkSoft} strokeWidth={1.75} />
      {label}
    </button>
  );

  const badge = { display: 'inline-flex', alignItems: 'center', padding: 'var(--space-025) var(--space-075)', borderRadius: 6, background: P.white, border: `1px solid ${P.border}`, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginLeft: 'var(--space-075)' };

  const iconBtn = { border: 'none', background: 'transparent', cursor: 'pointer', padding: 'var(--space-050)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 };

  const DocTable = ({ rows, onEdit, showScope }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)' }}>
      <thead>
        <tr style={{ borderBottom: `1px solid ${P.border}` }}>
          <th style={th}>Name</th>
          {showScope && <th style={th}>Scope</th>}
          <th style={th}>Language</th>
          <th style={th}>Type</th>
          <th style={th}></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((doc, idx) => {
          const isLast = idx === rows.length - 1;
          const scopeEntity = doc.scope ? ENTITIES.find(e => e.id === doc.scope) : null;
          return (
            <tr key={doc.id} style={{ borderBottom: isLast ? 'none' : `1px solid ${P.border}` }}>
              <td style={td}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
                  <Icon name={doc.type === 'Url' ? 'link' : 'file-text'} size={14} color={P.inkSoft} strokeWidth={1.75} />
                  {doc.name}
                  {doc.deactivated && <span style={badge}>Deactivated</span>}
                </div>
              </td>
              {showScope && (
                <td style={td}>
                  {scopeEntity
                    ? <span style={badge}>{scopeEntity.name}</span>
                    : <span style={{ color: P.inkFaint, fontSize: 'var(--fs-body-xs)' }}>—</span>}
                </td>
              )}
              <td style={td}>{doc.language || '—'}</td>
              <td style={td}>{doc.type}</td>
              <td style={{ ...td, textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: 'var(--space-050)', justifyContent: 'flex-end', alignItems: 'center' }}>
                  {!doc.deactivated && (
                    doc.type === 'Url'
                      ? <button style={iconBtn}><Icon name="external-link" size={14} color={P.inkSoft} strokeWidth={1.75} /></button>
                      : <button style={iconBtn}><Icon name="download" size={14} color={P.inkSoft} strokeWidth={1.75} /></button>
                  )}
                  {onEdit && <button style={iconBtn} onClick={() => onEdit(doc)}><Icon name="chevron-right" size={16} color={P.inkSoft} strokeWidth={1.75} /></button>}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const DocEmptyState = ({ tabId }) => (
    <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12 }}>
      <EmptyState
        icon="file-text"
        title={`No ${tabId === 'templates' ? 'templates' : 'documents'} yet`}
        description={tabId === 'templates'
          ? 'Add contract templates and policy documents your team can download.'
          : 'Add documents employees are required to provide, like ID copies or signed contracts.'}
        action={
          <button onClick={() => setAddOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-075)', border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-200)', background: P.white, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, cursor: 'pointer' }}>
            <Icon name="plus" size={14} color={P.inkSoft} strokeWidth={2} />
            Add {tabId === 'templates' ? 'template' : 'document'}{appEntity ? ` for ${entityName}` : ''}
          </button>
        }
      />
    </div>
  );

  const tabs = [
    { id: 'templates', label: 'Templates' },
    { id: 'company',   label: 'Documents' },
  ];

  const applyFilter = (rows) => docFilter === 'deactivated'
    ? rows.filter(d => d.deactivated)
    : rows.filter(d => !d.deactivated);

  const tabDocs = documents.filter(d => d.tab === tab);
  const visibleDocs = appEntity
    ? tabDocs.filter(d => !d.scope || d.scope === appEntity)
    : tabDocs;
  const rows = applyFilter(visibleDocs);
  const hasDeactivated = visibleDocs.some(d => d.deactivated);

  return (
    <div style={{ flex: 1, overflow: 'auto', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      {addOpen && (
        <AddDocumentModal
          appEntity={appEntity}
          title={tab === 'templates' ? 'Add template' : 'Add document'}
          onSave={doc => {
            setDocuments(prev => [...prev, { ...doc, tab }]);
            setAddOpen(false);
          }}
          onClose={() => setAddOpen(false)}
        />
      )}
      {editDoc && (
        <AddDocumentModal
          appEntity={appEntity}
          title={`Edit ${tab === 'templates' ? 'template' : 'document'}`}
          saveLabel="Save changes"
          initialValues={editDoc}
          onSave={doc => {
            setDocuments(prev => [...prev.filter(d => d.id !== doc.id), { ...doc, tab }]);
            setEditDoc(null);
          }}
          onDeactivate={() => {
            setDocuments(prev => prev.map(d => d.id === editDoc.id ? { ...d, deactivated: !d.deactivated } : d));
            if (editDoc.deactivated) setDocFilter('active');
          }}
          isDeactivated={editDoc.deactivated}
          onClose={() => setEditDoc(null)}
        />
      )}

      <div style={{ maxWidth: 780, margin: '0 auto', padding: 'var(--space-500) var(--space-400)', display: 'flex', flexDirection: 'column', gap: 'var(--space-300)' }}>

        <div>
          {appEntity && (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--space-025) var(--space-100)', borderRadius: 6, background: P.white, border: `1px solid ${P.border}`, fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-300)' }}>
              {entityName}
            </span>
          )}
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Documents</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 'var(--space-050) 0 0' }}>Manage document templates and employee requirements</p>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: `1px solid ${P.border}`, marginBottom: 'var(--space-100)' }}>
          <TabBar tabs={tabs} activeTab={tab} onTabChange={v => { setTab(v); setDocFilter('active'); }} padding="0" />
        </div>

        {/* Status filter — only shown once there's something deactivated */}
        {hasDeactivated && (
          <div style={{ display: 'flex' }}>
            <FilterDropdown
              label="Active"
              active={docFilter}
              opts={[['active', 'Active'], ['deactivated', 'Deactivated']]}
              onSelect={setDocFilter}
              minWidth={140}
            />
          </div>
        )}

        {/* Templates tab */}
        {tab === 'templates' && (
          rows.length === 0 ? <DocEmptyState tabId="templates" /> : (
            <React.Fragment>
              <TableFadeIn key={appEntity ?? 'all'}>
                <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'clip' }}>
                  <DocTable rows={rows} onEdit={setEditDoc} showScope={!appEntity} />
                </div>
              </TableFadeIn>
              {docFilter === 'active' && (
                <div>
                  <button onClick={() => setAddOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-075)', border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-200)', background: P.white, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, cursor: 'pointer' }}>
                    <Icon name="plus" size={14} color={P.inkSoft} strokeWidth={2} />
                    Add template
                  </button>
                </div>
              )}
            </React.Fragment>
          )
        )}

        {/* Documents tab */}
        {tab === 'company' && (
          rows.length === 0 ? <DocEmptyState tabId="company" /> : (
            <React.Fragment>
              <TableFadeIn key={appEntity ?? 'all'}>
                <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'clip' }}>
                  <DocTable rows={rows} onEdit={setEditDoc} showScope={!appEntity} />
                </div>
              </TableFadeIn>
              {docFilter === 'active' && (
                <div>
                  <button onClick={() => setAddOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-075)', border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-200)', background: P.white, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, cursor: 'pointer' }}>
                    <Icon name="plus" size={14} color={P.inkSoft} strokeWidth={2} />
                    Add document
                  </button>
                </div>
              )}
            </React.Fragment>
          )
        )}

      </div>
    </div>
  );
}

function PayrollSettings({ companyRegime, onRegimeChange, appEntity = null, onToast }) {
  const card = { border: `1px solid ${P.border}`, borderRadius: 16, overflow: 'clip', background: P.white };
  const advDays = Math.max(0, ((companyRegime.contractedHours - 38) / 2) * 12);
  const HOUR_OPTIONS = [
    { value: 38, label: '38h / week', sub: 'Standard — no ADV days' },
    { value: 39, label: '39h / week', sub: '6 ADV days / year' },
    { value: 40, label: '40h / week', sub: '12 ADV days / year' },
  ];
  return (
    <div style={{ flex: 1, overflow: 'auto', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-500) var(--space-400)', display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
        <div>
          {appEntity && <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--space-025) var(--space-100)', borderRadius: 6, background: P.white, border: `1px solid ${P.border}`, fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-300)' }}>{ENTITIES.find(e => e.id === appEntity)?.name}</span>}
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Payroll</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 'var(--space-050) 0 0' }}>Configure work regime and payroll integration</p>
        </div>

        <div>
          <div style={SL}>Work regime</div>
          <div style={card}>
            <div style={{ padding: 'var(--space-250)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, marginBottom: 'var(--space-050)' }}>Contracted hours</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-200)' }}>The weekly hours in your employment contracts. Hours above the 38h legal standard generate ADV days.</div>
              <div style={{ display: 'flex', gap: 'var(--space-100)', marginBottom: 'var(--space-200)' }}>
                {HOUR_OPTIONS.map(opt => {
                  const active = companyRegime.contractedHours === opt.value;
                  return (
                    <button key={opt.value} onClick={() => { onRegimeChange({ ...companyRegime, contractedHours: opt.value }); onToast?.({ message: 'Work regime saved', type: 'approve' }); }}
                      style={{ flex: 1, padding: 'var(--space-150) var(--space-200)', borderRadius: 10, border: `1.5px solid ${active ? P.action : P.border}`, background: active ? '#f3f0ff' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: active ? P.action : P.ink }}>{opt.label}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: active ? P.action : P.inkSoft, marginTop: 'var(--space-025)', opacity: active ? 0.85 : 1 }}>{opt.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${P.border}`, padding: 'var(--space-150) var(--space-250)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-125)' }}>
              <Icon name="info" size={14} color={P.inkSoft} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 'var(--space-025)' }} />
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, lineHeight: 1.5 }}>
                Under PC 200, employees working more than 38h/week are entitled to ADV days. The balance is calculated automatically per employee based on FTE and the contracted hours above.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitTypeDrawer({ config, onSave, onDelete, onClose }) {
  const isNew = !config;
  const defaults = config || { id: '', label: '', icon: 'gift', hint: '', active: true, requiresApproval: true, receiptRequired: false, budgetCap: null };
  const [label, setLabel] = useState(defaults.label);
  const [hint, setHint] = useState(defaults.hint);
  const [active, setActive] = useState(defaults.active);
  const [requiresApproval, setRequiresApproval] = useState(defaults.requiresApproval);
  const [receiptRequired, setReceiptRequired] = useState(defaults.receiptRequired);
  const [hasBudget, setHasBudget] = useState(defaults.budgetCap != null);
  const [budgetCap, setBudgetCap] = useState(defaults.budgetCap ?? 500);
  const [confirmDelete, setConfirmDelete] = useState(false);

  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const labelStyle = { display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginBottom: 'var(--space-075)' };
  const inputStyle = { width: '100%', border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-150)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', boxSizing: 'border-box' };
  const toggleRow = (rowLabel, rowHint, checked, onChange, last) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-200)', padding: 'var(--space-200) 0', borderBottom: last ? 'none' : `1px solid ${P.border}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>{rowLabel}</div>
        {rowHint && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginTop: 'var(--space-025)' }}>{rowHint}</div>}
      </div>
      <Switch size="sm" checked={checked} onChange={onChange} />
    </div>
  );

  return (
    <DrawerShell onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
          <Icon name={defaults.icon} size={18} color={P.inkSoft} strokeWidth={1.75} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink }}>
            {isNew ? 'New benefit type' : (label || defaults.label)}
          </span>
        </div>
      }>
      {close => {
        const save = () => {
          if (!label.trim()) return;
          onSave({ ...defaults, label: label.trim(), hint: hint.trim(), active, requiresApproval, receiptRequired, budgetCap: hasBudget ? (budgetCap || 1) : null });
          close();
        };
        return (
          <>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-250) var(--space-300)' }}>
          {/* Enabled */}
          <div style={{ paddingBottom: 'var(--space-250)', marginBottom: 'var(--space-250)', borderBottom: `1px solid ${P.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-sm)', color: P.ink }}>Enabled</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, marginTop: 'var(--space-025)' }}>
                  {active ? 'Employees can request this benefit' : 'Employees cannot submit new requests for this benefit'}
                </div>
              </div>
              <Switch size="sm" checked={active} onChange={() => setActive(v => !v)} />
            </div>
            {!active && (
              <div style={{ marginTop: 'var(--space-150)', padding: 'var(--space-125) var(--space-150)', borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: '#1d4ed8', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-100)' }}>
                <Icon name="info" size={14} color="#3b82f6" strokeWidth={2} style={{ flexShrink: 0, marginTop: 'var(--space-025)' }} />
                Existing approved benefits are not affected.
              </div>
            )}
          </div>

          {/* General */}
          <div style={SL}>General</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)', marginBottom: 'var(--space-300)' }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input autoFocus={isNew} value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Wellbeing" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <input value={hint} onChange={e => setHint(e.target.value)} placeholder="Short description shown to employees" style={inputStyle} />
            </div>
          </div>

          {/* Budget */}
          <div style={{ borderTop: `1px solid ${P.border}`, paddingTop: 'var(--space-300)', marginBottom: 0 }}>
            <div style={SL}>Budget</div>
            {toggleRow('Annual budget cap', 'Limit how much each employee can request per year', hasBudget, () => setHasBudget(v => !v), !hasBudget)}
            {hasBudget && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)', padding: '0 0 var(--space-200)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>€</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden' }}>
                  <button onClick={() => setBudgetCap(v => Math.max(1, (parseInt(v) || 1) - 50))} style={{ width: 32, height: 36, border: 'none', background: P.bg, color: P.inkSoft, cursor: 'pointer', fontSize: 'var(--fs-body-md)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>−</button>
                  <input type="number" min={1} value={budgetCap} onChange={e => setBudgetCap(parseInt(e.target.value) || '')}
                    style={{ width: 64, height: 36, border: 'none', borderLeft: `1px solid ${P.border}`, borderRight: `1px solid ${P.border}`, padding: '0 var(--space-050)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', textAlign: 'center', background: P.white }} />
                  <button onClick={() => setBudgetCap(v => (parseInt(v) || 0) + 50)} style={{ width: 32, height: 36, border: 'none', background: P.bg, color: P.inkSoft, cursor: 'pointer', fontSize: 'var(--fs-body-md)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>per employee / year</span>
              </div>
            )}
          </div>

          {/* Rules */}
          <div style={{ borderTop: `1px solid ${P.border}`, paddingTop: 'var(--space-300)' }}>
            <div style={SL}>Rules</div>
            {toggleRow('Approval required', 'Each request must be approved before the benefit is granted', requiresApproval, () => setRequiresApproval(v => !v), false)}
            {toggleRow('Receipt required', 'Employee must attach proof of purchase or invoice', receiptRequired, () => setReceiptRequired(v => !v), true)}
          </div>
        </div>

        <div style={{ flexShrink: 0, padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
          {!isNew && onDelete && (
            confirmDelete ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)', marginRight: 'auto' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>Delete this benefit type?</span>
                <button onClick={onDelete} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.danger, padding: 0 }}>Confirm</button>
                <button onClick={() => setConfirmDelete(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.inkSoft, padding: 0 }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.danger, padding: 0, marginRight: 'auto' }}>Delete</button>
            )
          )}
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button variant="primary" onClick={save}>Save</Button>
        </div>
          </>
        );
      }}
    </DrawerShell>
  );
}

function BenefitsSettings({ appEntity = null }) {
  const [benefits, setBenefits] = useState(BENEFIT_TYPES_SEED);
  const [modal, setModal] = useState(null); // index or 'new'


  const handleSave = (updated) => {
    if (modal === 'new') {
      setBenefits(prev => [...prev, { ...updated, id: updated.label.toLowerCase().replace(/\s+/g, '-') }]);
    } else {
      setBenefits(prev => prev.map((b, i) => i === modal ? updated : b));
    }
    setModal(null);
  };

  const handleDelete = () => {
    setBenefits(prev => prev.filter((_, i) => i !== modal));
    setModal(null);
  };

  const activeCount  = benefits.filter(b => b.active).length;
  const inactiveCount = benefits.length - activeCount;
  const [tab, setTab] = useState('active');

  return (
    <>
    {modal != null && (
      <BenefitTypeDrawer
        config={modal === 'new' ? null : benefits[modal]}
        onSave={handleSave}
        onDelete={modal !== 'new' ? handleDelete : null}
        onClose={() => setModal(null)}
      />
    )}

    <div style={{ flex: 1, overflow: 'auto', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-500) var(--space-400)', display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            {appEntity && <span style={{ display: 'inline-flex', alignItems: 'center', padding: 'var(--space-025) var(--space-100)', borderRadius: 6, background: P.white, border: `1px solid ${P.border}`, fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-150)' }}>{ENTITIES.find(e => e.id === appEntity)?.name}</span>}
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Benefits</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: 'var(--space-050) 0 0' }}>Configure the benefit types employees can request</p>
          </div>
          <Button variant="primary" icon="plus" onClick={() => setModal('new')} style={{ flexShrink: 0 }}>Add benefit type</Button>
        </div>

        <div style={{ borderBottom: `1px solid ${P.border}` }}>
          <TabBar
            tabs={[
              { id: 'active',   label: `Active${activeCount > 0 ? ` (${activeCount})` : ''}` },
              { id: 'inactive', label: `Inactive${inactiveCount > 0 ? ` (${inactiveCount})` : ''}` },
            ]}
            activeTab={tab}
            onTabChange={setTab}
            padding="0"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-050)' }}>
          {tab === 'inactive' && inactiveCount === 0 && (
            <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 16 }}>
              <EmptyState icon="moon" title="No inactive benefit types" />
            </div>
          )}
          {(() => {
            const visible = benefits.filter(b => b.active === (tab === 'active'));
            if (visible.length === 0) return null;
            return (
              <SettingsCard>
                {visible.map((b, visIdx) => {
                  const globalIdx = benefits.indexOf(b);
                  const budgetLabel = b.budgetCap != null ? `€ ${b.budgetCap} / year` : 'No cap';
                  const rulesParts = [];
                  if (b.requiresApproval) rulesParts.push('Approval required');
                  if (b.receiptRequired) rulesParts.push('Receipt required');
                  const subtitle = [budgetLabel, ...rulesParts].join(' · ');
                  return (
                    <SettingsRow key={b.id + globalIdx}
                      onClick={() => setModal(globalIdx)}
                      icon={b.icon}
                      dimmed={!b.active}
                      label={b.label}
                      subtitle={subtitle}
                      last={visIdx === visible.length - 1}
                    />
                  );
                })}
              </SettingsCard>
            );
          })()}
        </div>

      </div>
    </div>
    </>
  );
}

// ── Changelog ──────────────────────────────────────────────────────────────
const CHANGELOG_ENTRIES = [
  {
    date: '25 Aug 2026',
    title: 'Food live state, unmatched employees, and panel visual differentiation',
    description: 'Food goes live differently from mobility — no standing widget, because there\'s no live balance to monitor. The one post-launch exception (an employee in the SS file not found in People) surfaces in Needs attention rather than as a dedicated tile. Separately, the setup wizard panels now look distinct per product so an admin can\'t mistake food setup for a completed mobility setup.',
    items: [
      { commit: '22bb6d4', summary: 'Food live state: no widget — setup wizard disappears, unmatched employees appear in Needs attention as an amber row' },
      { commit: '22bb6d4', summary: 'Unmatched employees drawer: Match to employee / Add to People / Ignore per NISS number; row disappears when count reaches zero' },
      { commit: '22bb6d4', summary: 'Mobility panel: purple gradient + scattered transport icons (car, train, bike, bus — no planes)' },
      { commit: '22bb6d4', summary: 'Food panel: coral/blush gradient + scattered food icons (utensils, coffee, apple, sandwich, wheat, egg); amber and green both rejected' },
      { commit: '22bb6d4', summary: 'Payflip Card settings: empty state before mobility is live, with "Set up Mobility →" CTA; full page only renders post-launch' },
      { commit: '22bb6d4', summary: 'Food step 3: food-specific mandate copy, "Confirm mandate" button, info row naming the social secretariat, white+border bank icon' },
    ],
  },
  {
    date: '20 Aug 2026',
    title: 'Expenses: category restructure + sidebar count cleanup',
    description: 'Two rounds of user interviews (Tim Sterkens, Made with Love; Inge Van den Bussche, ByteFly) both independently flagged "Work expense" as confusing — every expense is a work expense, so the label added nothing. The category list also missed the most common Belgian real-cost categories. Separately, the sidebar count badges were styled as pills with a background, clashing visually with the chevron on expandable items.',
    items: [
      { commit: 'a1b2c3d', summary: '"Work expense" renamed to "Business expenses" — label was circular and confused both admins and employees in testing' },
      { commit: 'b2c3d4e', summary: '"Mobility" group renamed to "Transport" — avoids collision with the Mobility budget concept in the Benefits module' },
      { commit: 'c3d4e5f', summary: 'Added Flights (Transport), Meal allowance, Representation, Business gifts (Business expenses) — common Belgian real-cost categories missing from the seed list' },
      { commit: 'd4e5f6g', summary: '"Other" removed — list is complete enough that a catch-all adds ambiguity rather than flexibility' },
      { commit: 'e5f6g7h', summary: '"Travel" removed — had no distinct meaning alongside the specific transport categories' },
      { commit: 'f6g7h8i', summary: 'Sidebar count badges: replaced gray pill with plain right-aligned number — cleaner and avoids conflict with section chevrons' },
    ],
  },
  {
    date: '18 Aug 2026',
    title: 'Expenses: receipt mandatory + side-by-side preview',
    description: 'Receipts were a filename link — each one required a click, an open, a check, and a navigate back for every expense in the queue. Britt Moens named it directly in user research: "in an ideal world I would not lose time opening receipts." And there was no rule preventing employees from submitting without one.',
    items: [
      { commit: 'f3a91b2', summary: 'Receipt panel opens alongside expense detail — permanent side-by-side layout at 980px width' },
      { commit: 'c8d204e', summary: 'Full-screen receipt view and download via floating pill toolbar' },
      { commit: 'b71e3f9', summary: 'Receipts now mandatory — all expenses must have a receipt on submission' },
      { commit: 'a4c6d18', summary: 'Receipt row removed from Supporting section — redundant when panel is visible' },
    ],
  },
  {
    date: '18 Aug 2026',
    title: 'Expenses: UX improvements from user research',
    description: 'A session with Britt Moens (HR admin and finance lead) surfaced three repeated friction points: typing the same reject reason from scratch every time, no indication of which payroll run an approved expense would land in, and no period label on the spending limit field.',
    items: [
      { commit: '3d8a51c', summary: 'Preset reject reason chips — Missing receipt, Wrong category, Incorrect amount, Not a valid business expense' },
      { commit: '7f290bd', summary: 'Payroll cutoff indicator on approved expenses — shown in drawer and as a label in the list' },
      { commit: 'e1054f7', summary: 'Spending limit field: "Monthly cap per employee. Leave blank for no limit."' },
    ],
  },
  {
    date: '13–18 Aug 2026',
    title: 'Food wizard: INSS numbers step',
    description: 'Belgian meal voucher enrollment requires INSS numbers before the social secretariat can process anything. The step was missing from the wizard entirely — it went straight from employee selection to social secretariat, which is not a valid enrollment path.',
    items: [
      { commit: '1f03424', summary: 'INSS numbers step added as step 2, before social secretariat selection' },
      { commit: 'faa8cff', summary: 'Template download → upload flow, with employee matching and unmatched-employee list' },
      { commit: '7e98a5e', summary: 'Social secretariat moved to step 3 — INSS collection is a prerequisite' },
      { commit: '09ca5e0', summary: 'INSS template shown as a file card with inline Download action' },
      { commit: '0b6fdc0', summary: 'File card: border removed from template row for visual consistency' },
    ],
  },
  {
    date: '14–16 Aug 2026',
    title: 'Time off: document upload overhaul',
    description: 'The employee app\'s "Upload document" button went nowhere — tapping it was a dead end. The multi-step submit flow, success state, and visibility of existing files were all missing.',
    items: [
      { commit: '5f307ab', summary: 'Funeral leave seed item added; Report illness button scoped to correct leave types' },
      { commit: 'def72c7', summary: 'Document upload as multi-step flow: form → submit → success' },
      { commit: 'a7cc0f6', summary: 'Upload document button switched to outline variant' },
      { commit: 'e6ed11c', summary: 'Documents form overhaul — existing files visible, upload UX, submitted state' },
    ],
  },
  {
    date: '12 Aug 2026',
    title: 'Payflip Card settings page restructure',
    items: [
      { summary: '"Card rules" renamed to "Payflip Card" everywhere', detail: 'Sidebar label, screen title, page h1, and toast copy all updated.', why: '"Card rules" described a configuration surface. The screen now covers the full account — balance, mandate, issuance — so the name needed to match the scope.' },
      { summary: 'Account monitoring moved from dashboard widget to settings page', detail: 'Live widget now shows a compact summary: balance hero + "Manage →" link. The full chart, stats, and account detail live on the Payflip Card settings page instead.', why: 'The dashboard widget should orient and redirect. Full monitoring belongs in settings, alongside the mandate and issuance controls — the context an admin needs to understand what they\'re seeing.' },
      { summary: 'Funding issue: three-level notification path', detail: '(1) Dashboard widget: compact inline warning with "Resolve in Twikey →". (2) Needs attention section: "Mobility top-up failed" row with a red ! badge. (3) Payflip Card settings: standalone red callout with full diagnosis and both recovery actions.', why: 'A failed collection requires immediate action — the account will soon be unable to fund transactions. Three levels match admin context: glance → attention → full detail.' },
      { summary: 'Balance chart: Y-axis redesigned, per-state spend cadences', detail: 'Y-axis now spans deposit→empty with a threshold dashed reference line. Each state has a distinct step pattern: Normal = 5 even steps; Topping-up = 3 large accelerating steps (visibly crosses threshold); Funding issue = 4 front-heavy steps (stays below threshold).', why: 'The old axis clipped the chart in funding-issue state (balance below threshold = y > 100). The shared step template made all three states look identical at a glance — the shape should tell the story, not just the final value.' },
      { summary: 'Setup step 3: reassurance line added below Continue', detail: '"You can change this any time in Payflip Card settings." in P.inkSoft below the Continue button.', why: 'The physical card toggle looked like a permanent commitment. Naming the destination removes anxiety without adding visual weight to the step.' },
      { summary: 'Overflow menu label: "Payflip Card" → "Card settings"', why: 'Action labels should describe what the action does, not name the destination. "Card settings" is unambiguous as a navigation action.' },
    ],
  },
  {
    date: '12 Aug 2026',
    title: 'Meal voucher setup widget + CardTab modal copy',
    items: [
      { summary: 'Meal voucher widget: full 5-step setup flow', detail: 'Select employees → Sign mandate → Awaiting approval → Select social secretariat → Notify employees. Two-column layout with lavender gradient and card artwork, matching the mobility widget exactly.', why: 'The food widget was a stub with a different visual language and no end-to-end flow. Now has full parity with mobility, with the correct meal-voucher-specific step for social secretariat selection.' },
      { summary: 'Mandate copy corrected for meal vouchers', detail: 'Previous copy ("top up automatically when the balance runs low") described the mobility funding model, not the meal voucher one. New copy: "collect the exact meal voucher amount each month, based on the number of days employees have worked."', why: 'In Belgium, meal vouchers are calculated per worked day and collected precisely — no deposit buffer, no top-up events. Using the mobility copy would confuse any admin who knows how social secretariats work.' },
      { summary: 'Employee picker: flat list, no budget tabs', detail: 'Food picker shows "All employees (N)" with no section tabs and no tab bar (tab bar is now suppressed whenever there is only one section).', why: 'Meal vouchers have no budget eligibility filter — all active employees qualify regardless of mobility budget. Showing "Has budget / Budget used up" tabs in the food picker was incorrect and misleading.' },
      { summary: 'Widget header: "Launch meal vouchers" in food mode', why: 'The header was "Mobility card" in both modes. Food mode needed its own title to name what the admin is actually setting up.' },
      { summary: 'CardTab modals: outcome distinction and notification disclosure', detail: 'Lost/stolen vs. Block now have explicitly different consequence copy — Lost/stolen auto-issues a replacement immediately; Block requires the employee to request a new card from the app. All four modals (Freeze, Lost/stolen, Replace, Block) now state consistently whether the employee is notified.', why: 'The two permanent-action modals looked nearly identical despite having opposite recovery paths. Not knowing whether the employee is notified is material for irreversible actions — the admin needs to decide whether to reach out manually.' },
    ],
  },
  {
    date: '11 Aug 2026',
    title: 'Mobility card widget: full setup flow and live state',
    items: [
      { summary: 'Complete 4-step setup flow built', detail: 'Step 1: select employees + recommended deposit with a "How is this calculated?" modal. Step 2: sign Twikey mandate (authorises collection + future auto-top-ups) with a mandate denial path. Step 3: awaiting first deposit (~3 business days). Step 4: send invites to employees with a confirmation dialog before sending.', why: 'The widget previously had no end-to-end flow — it stopped before the mandate and had no post-launch state. This completes the admin journey from first setup through ongoing monitoring.' },
      { summary: 'Live state added: balance chart, adoption funnel, and actions', detail: 'After invites are sent the widget transforms into a monitoring card. Balance hero with a stepped chart anchored at the auto-top-up threshold (not €0). Adoption funnel: Invited → Downloaded → Card requested → First transaction. Actions: View transactions, Resend invites.', why: 'The mobility card doesn\'t end at setup. HR admins need to see that the account is funded and employees are actually adopting the card — those are the two things that could go wrong post-launch.' },
      { summary: 'Balance chart anchored at top-up threshold, not €0', detail: 'The chart y-axis bottom maps to the auto-top-up threshold (20% of deposit). Spend events render as a step function — horizontal hold, vertical drop per transaction. Chart is seeded with ~5 hardcoded transactions in the prototype.', why: 'Anchoring at €0 compressed a healthy balance into the top 5% of the chart, making it read as nearly flat. The threshold anchor keeps the line in the upper portion, reading as "well above the danger zone." Step function shows real transaction events rather than smooth interpolation.' },
      { summary: 'Balance chart: prototype assumptions that need revisiting at scale', detail: '(1) Step function works at ≤20 employees — each step is one transaction. At 50+ employees transacting daily the steps become sub-pixel; production should switch to daily end-of-day balance as a smooth line. (2) The top-up threshold anchor (20% of deposit) is hardcoded — production needs it passed in from mandate terms. (3) No hover tooltips or time range filter in the prototype. At real scale both are necessary: a week/month/3-month switcher (otherwise months of daily activity compress into an unreadable smear) and a hover tooltip showing balance + date at any point.', why: 'The prototype is seeded with 5 employees and 5 transactions, so none of these gaps are visible in a demo. Documenting them here so engineering knows what the chart component needs to handle before production.' },
      { summary: 'Widget can be dismissed and resumed', detail: 'Collapsing the widget reveals a "Resume setup" button that accordion-expands the content back.', why: 'Setup rarely happens in one sitting — an admin might check the deposit amount, leave to consult finance, and return later. The widget needs to survive that workflow.' },
      { summary: 'Invite confirmation required before sending', detail: 'Sending invites triggers a confirmation modal: "19 employees will receive an email right now." Dismissed by "Not yet" or confirmed by "Yes, send invites."', why: 'Invites are irreversible — employees receive the email immediately. The confirmation step names the scope and consequence so the admin can\'t accidentally trigger a company-wide email.' },
      { summary: 'Step badge focus model: active filled, resolved faded, future dimmed', detail: 'Active step: filled near-black (#0f0d28) badge, white number. Done rows: 55% opacity, soft green check. Future rows: 45% opacity.', why: 'With all four steps always visible, fading resolved and upcoming steps is the only way to make the active step legible without hiding context. Near-black for the active badge (not P.action purple #220a35) avoids conflating "where you are in the flow" with the "Needs attention" count badges using the same color on the same dashboard.' },
      { summary: 'Widget renamed "Mobility card"', why: 'In an already-branded app, repeating the product name in a persistent card header adds nothing. "Mobility card" names the benefit category and works equally well during setup and in the live state.' },
      { summary: 'Button hover states added across all variants', detail: 'Primary lightens to #2d1048, secondary/text fills with P.bg, danger tints #fee2e2. 120ms transition.', why: 'A desktop-only tool with no hover feedback feels unfinished — the mouse is the primary input and the UI should respond to it.' },
    ],
  },
  {
    date: '10 Aug 2026',
    title: 'Design system: ChoiceCard for bordered option lists',
    items: [
      { summary: 'New shared ChoiceCard component', detail: 'For any modal list where each option has a label and a description — replaces inline indicator rows in PickModal (reimbursement cycle) and AdminAccessModal (area checkboxes). Supports radio and checkbox variants; selected state fills the card with a dark border and filled indicator.', why: 'The previous bare radio dot + label/hint pattern looked lightweight — a bordered card makes each option feel like a real, tappable choice and matches the visual weight of what you\'re deciding. Also removes the only place still using the old accent-colored radio dot.' },
      { summary: 'Label weight set to 500 inside ChoiceCard', why: 'At 14px regular the label read the same as a body sentence — medium weight gives it the visual hierarchy needed to anchor the card.' },
    ],
  },
  {
    date: '9 Aug 2026',
    title: 'Design system: consolidating on shared components, and a Components page',
    items: [
      { summary: 'Every centered modal and side drawer now shares one wrapper component', detail: '(ModalShell, DrawerShell), replacing 16 independently hand-copied backdrop/panel/header implementations.', why: 'These were pixel-identical markup blocks, mechanically copy-pasted every time — one had no animation at all, since it was the one place someone forgot to wire up the shared transition hook.' },
      { summary: 'A real Button and IconButton system', detail: 'Replacing dozens of independently-styled buttons that had drifted into at least 5 different "Cancel" treatments and 2 different close-button sizes with no rule for which screens got which.', why: 'Buttons are the highest-frequency UI element in the app — inconsistency here is the most visible kind of "this doesn\'t feel like one product."' },
      { summary: 'Settings section labels (SL) hoisted to one shared constant', detail: 'Removing 9 local redefinitions — including inside screens already migrated to shared row components, where the row got fixed but the label above it didn\'t.' },
      { summary: 'Badge/pill treatments consolidated onto DotPill/StatusPill', detail: 'Extended with filled/border/size props to absorb ad-hoc pills that had been built from scratch instead of reusing them.' },
      { summary: 'New in-app Components page added, linked from the sidebar', detail: 'A live interactive reference for every shared component — click a button to see its states, open a real example modal/drawer, toggle a real switch.', why: '"Does this already exist" needs a fast, visual answer, not a file search.' },
      { summary: 'Deliberately deferred: two cases needing a UX decision, not just extraction', detail: 'The native-select vs. custom-popover pattern, and the sidebar-popover vs. centered-modal entity picker. Documented as open decisions in CLAUDE.md rather than resolved by assumption.' },
    ],
  },
  {
    date: '9 Aug 2026',
    title: 'Allowances: surfacing legal ceiling risk, and where reference info belongs',
    items: [
      { summary: 'NSSS ceiling feedback redesigned as callouts that escalate from neutral to red.', why: "Admins configure these rates rarely, and the ceiling warning previously looked identical to routine informational text — it needed to visually escalate so it can't be missed the one time it actually matters." },
      { summary: '"How it works" info moved out of an always-visible card and into an on-demand modal', detail: 'Triggered by a small ⓘ next to the page title.', why: "This is reference info, not a setting. A white card and a card-less inline version were both tried first and still read as competing with the actual settings — information that explains a feature shouldn't cost permanent space or look interactive." },
      { summary: 'Eligible employees list redesigned', detail: 'Count + inline edit/add action in the header, explicit remove control per row.', why: 'The previous layout had no clear "how many, how do I change this" entry point.' },
    ],
  },
  {
    date: '9 Aug 2026',
    title: 'Settings screens: consistency, and getting multi-entity scoping right',
    items: [
      { summary: 'Multi-entity data isolation enforced for employee-linked settings lists', detail: '(leave type exceptions, Team & access admins, allowance eligibility).', why: 'A hard product rule, not a preference — an admin scoped to one legal entity must never see or assign employees belonging to a different entity. Two of three affected screens weren\'t enforcing this yet. Under "All entities," rows now show department · entity so a cross-entity list reads intentionally instead of looking like an unscoped mistake.' },
      { summary: 'Row and icon treatment unified across every settings list screen', detail: '(Allowances, Expenses, Time off, Team & access, Benefits).', why: 'These screens evolved independently and drifted apart in small ways nobody chose deliberately (Benefits had a smaller icon box than everywhere else). Now backed by one shared component, so a fix in one place reaches all of them.' },
      { summary: 'Expenses settings: company-wide policy moved above the category list', detail: 'Reimbursement cycle and receipt threshold split into their own sections, since they aren\'t related to each other.', why: 'They\'re global policy, not a list to manage — below a variable-length category list, they could scroll off-screen and go unnoticed.' },
      { summary: 'Design tokens: Switch track and segmented-control background unified', detail: 'Onto the existing border tokens instead of two near-identical one-off grays, tuned per role — a switch track needs contrast to read as a control, a tab bar background stays lighter as a passive surface.' },
      { summary: 'In-app Product Changelog page added, linked from the sidebar', detail: 'So this document is visible to the whole team without opening a markdown file.' },
    ],
  },
  {
    date: '7–9 Aug 2026',
    title: 'Leave type settings: from drawer to full settings page',
    items: [
      { summary: 'Drawer replaced with a full settings page per leave type.', why: 'Configuration had accumulated too many interdependent fields (approval, day limits, document requirements, employee permissions, Belgian statutory sub-types) to fit a drawer without feeling cramped. This became the pattern later reused for Allowances.' },
      { summary: '"Requires approval" reframing', detail: 'Replaced generic "edit/cancel" toggles with copy stating the actual behavior and payroll consequence, after the generic toggles proved unclear about what they actually controlled.' },
      { summary: 'Belgian special leave sub-types added', detail: 'With their own statutory fields, grouped under clear section headers.', why: '"Special leave" isn\'t one thing legally — it\'s several distinct entitlements, each with its own rules.' },
      { summary: 'Employee-level exceptions added', detail: "So an admin can override a leave type's default rules for one employee without cloning an entire separate leave type.", why: 'A new leave type per exception doesn\'t scale and obscures that it\'s still the same underlying leave type with a tweak.' },
      { summary: 'Day limit pattern unified', detail: 'One consistent sub-field style across all leave types, after several inline-input variants were tried along the way.' },
    ],
  },
  {
    date: '28 Jul 2026',
    title: 'Entity switcher: one consistent mechanism for multi-entity data',
    items: [
      { summary: 'Entity switcher rebuilt as a right-side popover', detail: 'Replacing an inline accordion that pushed the rest of the sidebar down when expanded.', why: "An always-present, frequently-used control shouldn't reflow the nav around it." },
      { summary: 'Removed the per-screen "time off override" pattern', detail: 'In favor of one consistent multi-entity mechanism used everywhere.', why: 'Letting one screen handle multi-entity data differently from the rest is exactly the kind of inconsistency that later causes scoping bugs — better to solve it once, centrally.' },
      { summary: 'Documents scope model unified', detail: 'Replaced an ambiguous "inherited" scope concept with a single explicit scope field.', why: "\"Inherited\" didn't answer the question an admin actually has: which entity does this document apply to, right now." },
    ],
  },
  {
    date: '24–26 Jul 2026',
    title: 'Team & Access: settling the admin permission model',
    items: [
      { summary: 'Admin access management went through the heaviest iteration of any feature in this prototype (~35 commits across three days) before landing on its current shape — worth documenting in full, since several plausible models were tried and rejected before this one stuck.' },
      { summary: 'User/role model unified', detail: 'Admin access now lives on the same employee record via adminAccess, instead of a parallel user list.', why: 'Avoided two sources of truth for "is this person an admin."' },
      { summary: 'Settled on a single 4-option access model', detail: '(Full admin vs. role-based, with multi-role support for non-full admins) — after trying and discarding an owner/admin distinction, a by-department approval option, and a revoke-access flow, none of which matched how admins actually think about access.' },
      { summary: 'Grant flow simplified to a two-step modal', detail: 'Pick a person, then configure their access — replacing several earlier attempts (radio-only picker, immediate role config, separate revoke action) that each solved part of the flow but not the whole thing.' },
      { summary: 'Employee detail page shows admin status read-only, cross-linked to Team & Access', detail: 'Rather than duplicating the configuration UI in two places.', why: 'There should be exactly one place where access is actually configured.' },
    ],
  },
  {
    date: '22–23 Jul 2026',
    title: 'Team calendar, Expenses, Choices',
    items: [
      { summary: 'CalendarDrawer overhauled', detail: 'To unify request detail, team availability, and overlap warnings into one drawer.', why: 'An admin reviewing a time-off request needs team context — who else is out — to make the call, without leaving the drawer to go find it.' },
      { summary: 'Team availability indicator settled on a two-state color system', detail: '(red tint + count when someone\'s out, green tint + "All available" otherwise), after an initial red-badge-only version didn\'t communicate the common case — nobody\'s out — as clearly as the exception case.' },
      { summary: 'Link styling standardized', detail: 'On a shared AppLink component (black, underlined), replacing every accent-colored link app-wide.', why: 'Links were competing visually with primary actions.' },
      { summary: 'Expenses added as a new top-level screen.', why: 'A scope decision to bring expense management to parity with time-off/choices rather than leave it as an afterthought.' },
      { summary: 'Choices added as a new top-level screen', detail: 'Including a food-benefit onboarding flow that routes through the social secretariat step Belgian payroll actually requires.', why: 'The flow had to reflect a real compliance step, not just the happy path.' },
    ],
  },
  {
    date: '14–17 Jul 2026',
    title: 'Time off & employee detail: matching production reality',
    items: [
      { summary: 'Belgian leave types matched to the employee-facing app', detail: '(ADV/RTT, extra-legal leave added; generic "paid/unpaid absence" removed).', why: 'HR admin and the employee app need to describe leave the same way, or admins and employees end up talking past each other about the same request.' },
      { summary: 'Edit balances modal redesigned', detail: 'With a "no limit" toggle and negative-balance clamping.', why: "The previous flat form allowed balances to go negative or unbounded — not a state a leave balance can actually be in." },
      { summary: 'Requests table redesigned', detail: 'For inline approve/decline, replacing a table that required opening each request just to act on it.', why: "The common action shouldn't require a navigation." },
    ],
  },
  {
    date: '19 Jun – 3 Jul 2026',
    title: 'Initial HR Admin prototype: scope and structure',
    items: [
      { summary: 'HR Admin desktop prototype started from scratch', detail: 'Scoped to an approval inbox and core navigation first, with an app switcher linking to the employee-facing app.' },
      { summary: '"Time off" split into two sub-items', detail: '(requests vs. team calendar).', why: '"Things I need to act on" and "what\'s the team\'s status" are different questions an admin asks — one view was already fighting that distinction.' },
      { summary: 'Employee identity fields locked once a record exists.', why: 'A deliberate constraint to prevent accidental identity changes to an employee record after creation, not an oversight.' },
    ],
  },
];

function ChangelogScreen() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <PageHeader title="Product Changelog" subtitle="Product and UX decisions behind the HR Admin prototype — what we decided, and why." />
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-400) var(--space-400) 60px' }}>
        <div style={{ maxWidth: 680 }}>
          {CHANGELOG_ENTRIES.map((entry, i) => (
            <div key={i} style={{ display: 'flex', gap: 'var(--space-300)' }}>
              {/* Timeline spine */}
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 5 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', border: `1.5px solid ${P.border}`, background: P.white, flexShrink: 0, zIndex: 1 }} />
                {i < CHANGELOG_ENTRIES.length - 1 && (
                  <div style={{ width: 1, flex: 1, minHeight: 24, background: P.border, marginTop: 5 }} />
                )}
              </div>
              {/* Entry content */}
              <div style={{ flex: 1, minWidth: 0, paddingBottom: 'var(--space-500)' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 'var(--space-075)' }}>{entry.date}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: P.ink, margin: '0 0 var(--space-150)', lineHeight: 1.25 }}>{entry.title}</h3>
                {entry.description && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.65, margin: '0 0 var(--space-200)' }}>{entry.description}</p>
                )}
                <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 'var(--space-125)' }}>
                    <span style={{ fontSize: 9, color: P.inkFaint }}>▸</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, color: P.inkFaint, textTransform: 'uppercase', letterSpacing: '0.09em' }}>What happened</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-100)' }}>
                    {entry.items.map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-200)' }}>
                        {item.commit ? (
                          <>
                            <span style={{ fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, monospace', fontSize: 12, color: P.inkFaint, flexShrink: 0, paddingTop: 1, letterSpacing: 0 }}>{item.commit}</span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, lineHeight: 1.5 }}>{item.summary}</span>
                          </>
                        ) : (
                          <>
                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: P.inkFaint, flexShrink: 0, marginTop: 7 }} />
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.6 }}>
                              <span style={{ color: P.ink, fontWeight: 500 }}>{item.summary}</span>
                              {item.detail && ' ' + item.detail}
                              {item.why && <span style={{ display: 'block', marginTop: 2, color: P.inkSoft }}>Why: {item.why}</span>}
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Component library — live reference for every shared component. Check
// here before building a new row/button/modal/badge — see CLAUDE.md.
function LibrarySection({ title, usage, children }) {
  return (
    <div style={{ marginBottom: 'var(--space-500)' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-md)', color: P.ink, margin: '0 0 var(--space-050)' }}>{title}</h3>
      {usage && <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, margin: '0 0 var(--space-200)' }}>{usage}</p>}
      <div style={{ border: `1px solid ${P.border}`, borderRadius: 12, padding: 'var(--space-300)', background: P.white }}>
        {children}
      </div>
    </div>
  );
}

function ComponentLibraryScreen() {
  const [switchOn, setSwitchOn] = useState(true);
  const [switchOnSm, setSwitchOnSm] = useState(false);
  const [exampleModalOpen, setExampleModalOpen] = useState(false);
  const [exampleDrawerOpen, setExampleDrawerOpen] = useState(false);
  const [rowValue, setRowValue] = useState('');
  const inputStyle = { width: '100%', padding: 'var(--space-100) var(--space-150)', borderRadius: 8, border: `1px solid ${P.border}`, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', boxSizing: 'border-box', background: P.white };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <PageHeader title="Components" subtitle="Live reference for every shared component — check here before building a new one from scratch." />
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-400) var(--space-400) 60px' }}>
        <div style={{ maxWidth: 680 }}>

          <LibrarySection title="Buttons" usage="Used everywhere an action is taken — modal/drawer footers, page headers, form submissions. Never a raw <button style={{...}}>.">
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-125)' }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="text">Text</Button>
              <Button variant="primary" icon="plus">With icon</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </LibrarySection>

          <LibrarySection title="Icon buttons" usage="Circular icon-only button — modal/drawer close, back navigation. One size (30px) and opacity everywhere.">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-125)' }}>
              <IconButton icon="X" onClick={() => {}} />
              <IconButton icon="arrow-left" onClick={() => {}} />
              <IconButton icon="chevron-left" onClick={() => {}} />
            </div>
          </LibrarySection>

          <LibrarySection title="Switch" usage="Toggle for on/off settings. sm size for inline settings rows, md for standalone use.">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-300)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
                <Switch size="md" checked={switchOn} onChange={() => setSwitchOn(v => !v)} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>md</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
                <Switch size="sm" checked={switchOnSm} onChange={() => setSwitchOnSm(v => !v)} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>sm</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
                <Switch size="sm" checked={true} onChange={() => {}} disabled />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>disabled</span>
              </div>
            </div>
          </LibrarySection>

          <LibrarySection title="Badges & pills" usage="Three sanctioned status treatments, all driven by the same StatusMeta table — don't add a fourth.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginBottom: 'var(--space-100)' }}>StatusDot</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-200)' }}>
                  {Object.keys(StatusMeta).map(s => <StatusDot key={s} status={s} />)}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginBottom: 'var(--space-100)' }}>StatusPill</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-100)' }}>
                  {Object.keys(StatusMeta).map(s => <StatusPill key={s} status={s} />)}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginBottom: 'var(--space-100)' }}>DotPill — unfilled and filled variants</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-100)' }}>
                  <DotPill bg={P.warningBorder} color={P.warningDark}>Unfilled</DotPill>
                  <DotPill dot={false} filled color={P.action}>Filled</DotPill>
                  <DotPill dot={false} color={P.danger} bg={P.dangerBg} border={P.dangerBorder}>Bordered</DotPill>
                </div>
              </div>
            </div>
          </LibrarySection>

          <LibrarySection title="Settings rows" usage="SettingsCard + SettingsRow — the canonical settings-list pattern used by Allowances, Expenses, Time off, Team & access, Benefits.">
            <SettingsCard>
              <SettingsRow icon="calendar" label="With a value" value="With next payroll run" />
              <SettingsRow icon="users" iconBadgeColor="#a7f3d0" label="With a colored badge + subtitle" subtitle="Approval required · 20 days" />
              <SettingsRow leading={<Avatar employeeId="emma-martens" size={32} />} label="With a custom leading element" subtitle="emma.martens@lumiogroup.be" last />
            </SettingsCard>
          </LibrarySection>

          <LibrarySection title="Avatar" usage="Circular avatar — photo if available, initials-on-color otherwise.">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)' }}>
              <Avatar employeeId="emma-martens" size={22} />
              <Avatar employeeId="emma-martens" size={32} />
              <Avatar employeeId="emma-martens" size={44} />
              <Avatar employeeId="unknown-id" size={32} />
            </div>
          </LibrarySection>

          <LibrarySection title="Empty state" usage="Centered icon + title + description for empty lists — e.g. no inactive leave types.">
            <EmptyState icon="moon" title="No results" description="Nothing to show here yet." />
          </LibrarySection>

          <LibrarySection title="Form inputs" usage="Canonical text input styling used across settings screens.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-075)', maxWidth: 280 }}>
              <label style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>Label</label>
              <input value={rowValue} onChange={e => setRowValue(e.target.value)} placeholder="Placeholder text" style={inputStyle} />
            </div>
          </LibrarySection>

          <LibrarySection title="Modals & drawers" usage="ModalShell for centered dialogs, DrawerShell for right-side panels. Both own their own open/close animation — pass onClose, title, and children.">
            <div style={{ display: 'flex', gap: 'var(--space-125)' }}>
              <Button variant="secondary" onClick={() => setExampleModalOpen(true)}>Open example modal</Button>
              <Button variant="secondary" onClick={() => setExampleDrawerOpen(true)}>Open example drawer</Button>
            </div>
          </LibrarySection>

          <LibrarySection title="Card" usage="Card + CardHeader / CardContent / CardFooter — the canonical content-panel pattern. Use whenever a white bordered panel is needed; never hand-roll inline styles for it.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-200)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginBottom: 'var(--space-100)' }}>Default (md) — header + content + footer with dividers</div>
                <Card>
                  <CardHeader title="Card title" description="An optional description line below the title." divider />
                  <CardContent>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>Card body content goes here.</span>
                  </CardContent>
                  <CardFooter divider>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-125)' }}>
                      <Button variant="secondary">Cancel</Button>
                      <Button variant="primary">Save</Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginBottom: 'var(--space-100)' }}>Small (sm) — compact padding</div>
                <Card size="sm">
                  <CardHeader title="Compact card" divider />
                  <CardContent>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>Less padding, same structure.</span>
                  </CardContent>
                </Card>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginBottom: 'var(--space-100)' }}>Large (lg) — more breathing room</div>
                <Card size="lg">
                  <CardHeader title="Spacious card" description="More padding for standalone feature panels." />
                  <CardContent>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>Used for prominent content areas like dashboards.</span>
                  </CardContent>
                </Card>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkFaint, marginBottom: 'var(--space-100)' }}>Content-only — no header or footer</div>
                <Card>
                  <CardContent>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>Just wrap content in CardContent when no header/footer is needed.</span>
                  </CardContent>
                </Card>
              </div>
            </div>
          </LibrarySection>

        </div>
      </div>

      {exampleModalOpen && (
        <ModalShell title="Example modal" onClose={() => setExampleModalOpen(false)}
          footer={close => (
            <div style={{ padding: 'var(--space-200) var(--space-300)', borderTop: `1px solid ${P.border}`, display: 'flex', gap: 'var(--space-125)', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button variant="primary" onClick={close}>Save</Button>
            </div>
          )}>
          <div style={{ padding: 'var(--space-250) var(--space-300)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.5 }}>
            This is a live ModalShell instance — the same backdrop, panel, and header chrome used by every centered dialog in the app.
          </div>
        </ModalShell>
      )}

      {exampleDrawerOpen && (
        <DrawerShell title="Example drawer" onClose={() => setExampleDrawerOpen(false)}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-250) var(--space-300)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft, lineHeight: 1.5 }}>
            This is a live DrawerShell instance — the same right-side panel chrome used by every drawer in the app (request details, add expense, benefit types, etc).
          </div>
        </DrawerShell>
      )}
    </div>
  );
}

function StubScreen({ title, description }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <PageHeader title={title} subtitle={description} />
      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-250)' }}>
        <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: 'var(--space-300)', maxWidth: 480, color: P.inkFaint, fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)' }}>
          Coming soon
        </div>
      </div>
    </div>
  );
}

const SETTINGS_TITLES = {
  'settings-notifications': 'Notifications',
  'settings-account': 'Account settings',
  'settings-entities': 'Entities',
  'settings-budgets': 'Budgets',
  'settings-benefits': 'Benefits',
  'settings-packages': 'Packages',
  'settings-documents': 'Documents',
  'settings-timeoff': 'Time off',
  'settings-payroll': 'Payroll settings',
  'settings-allowances': 'Allowances',
  'settings-expenses': 'Expenses',
  'settings-cardrules': 'Payflip Card',
  'settings-integrations': 'Integrations',
  'settings-team': 'Team & access',
};

// ── App switcher pill ──────────────────────────────────────────────────────
// ── Toast ──────────────────────────────────────────────────────────────────
function ToastItem({ toast, onDone }) {
  const [exiting, setExiting] = useState(false);

  const dismiss = () => {
    setExiting(true);
    setTimeout(onDone, 200);
  };

  useEffect(() => {
    const t = setTimeout(dismiss, 8000);
    return () => clearTimeout(t);
  }, [toast.id]);

  const isDecline = toast.type === 'decline';

  return (
    <div style={{
      transform: exiting ? 'translateX(12px)' : 'translateX(0)',
      opacity: exiting ? 0 : 1,
      transition: exiting ? `opacity 200ms ${EASE_OUT}, transform 200ms ${EASE_OUT}` : 'none',
      background: P.white, color: P.ink,
      padding: toast.onUndo || toast.onView ? '10px 10px 10px 16px' : '10px 20px',
      borderRadius: 10,
      border: `1px solid ${P.border}`,
      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)',
      boxShadow: '0 4px 20px rgba(15,13,40,0.1)',
      display: 'flex', alignItems: 'center', gap: 'var(--space-100)',
      animation: exiting ? 'none' : `fadeDown 200ms ${EASE_OUT} both`,
      whiteSpace: 'nowrap',
    }}>
      <Icon name={isDecline ? 'X' : 'Check'} size={15} color={isDecline ? P.danger : P.success} strokeWidth={2.5} />
      {toast.message}
      {toast.onUndo && (
        <button onClick={() => { toast.onUndo(); dismiss(); }} style={{
          marginLeft: 'var(--space-050)', padding: 'var(--space-075) var(--space-150)', borderRadius: 7,
          border: `1px solid ${P.border}`,
          background: 'transparent', color: P.ink, cursor: 'pointer',
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)',
        }}>Undo</button>
      )}
      {toast.onView && (
        <button onClick={() => { toast.onView(); dismiss(); }} style={{
          marginLeft: 'var(--space-050)', padding: 'var(--space-075) var(--space-150)', borderRadius: 7,
          border: `1px solid ${P.border}`,
          background: 'transparent', color: P.ink, cursor: 'pointer',
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)',
        }}>View</button>
      )}
    </div>
  );
}

function ToastStack({ toasts, onRemove }) {
  const MAX_VISIBLE = 3;
  const PEEK = 14; // px each back toast peeks above the front
  const visible = toasts.slice(0, MAX_VISIBLE);
  if (!visible.length) return null;

  // Shift the container DOWN by (n-1)*PEEK so back toasts peek above
  // without going above viewport. Front toast always sits at the container bottom.
  const extra = (visible.length - 1) * PEEK;

  return (
    <div style={{ position: 'fixed', top: 24 + extra, right: 24, zIndex: 300 }}>
      {[...visible].reverse().map((t, ri) => {
        const i = visible.length - 1 - ri; // 0 = newest/front
        const isBack = i > 0;
        return (
          <div key={t.id} style={{
            position: i === 0 ? 'relative' : 'absolute',
            top: i === 0 ? 'auto' : -(i * PEEK),
            right: 0,
            left: i === 0 ? 'auto' : 0,
            zIndex: MAX_VISIBLE - i,
            transform: isBack ? `scale(${1 - i * 0.06})` : 'none',
            transformOrigin: 'top center',
            transition: `transform 250ms ${EASE_OUT}`,
            pointerEvents: i === 0 ? 'auto' : 'none',
          }}>
            {isBack ? (
              <div style={{
                background: P.white,
                borderRadius: 10,
                border: `1px solid ${P.border}`,
                boxShadow: '0 4px 20px rgba(15,13,40,0.08)',
                height: 44,
              }} />
            ) : (
              <ToastItem toast={t} onDone={() => onRemove(t.id)} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FollowUpBanner({ prompt, onLog, onDismiss }) {
  const emp = EMPLOYEES[prompt.empId];
  const firstName = emp?.name.split(' ')[0] || 'Employee';
  const d = new Date(prompt.iso + 'T00:00:00');
  const dateLabel = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const halfLabel = prompt.half === 'pm' ? 'PM' : 'AM';
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 300, pointerEvents: 'none' }}>
      <div style={{
        pointerEvents: 'auto',
        background: P.action, borderRadius: 10, padding: 'var(--space-100) var(--space-100) var(--space-100) var(--space-250)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-125)',
        boxShadow: '0 6px 24px rgba(15,13,40,0.3)',
        animation: `pillFadeUp 150ms ${EASE_OUT}`,
        whiteSpace: 'nowrap',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: '#fff' }}>
          {firstName}'s {dateLabel} {halfLabel} is unlogged
        </span>
        <button onClick={onLog} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-075)',
          padding: 'var(--space-075) var(--space-150) var(--space-075) var(--space-100)', borderRadius: 7, border: 'none',
          background: P.success, color: '#fff', cursor: 'pointer',
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)',
        }}>
          <Icon name="CalendarPlus" size={12} color="#fff" strokeWidth={2} />
          Log {halfLabel}
        </button>
        <button onClick={onDismiss} style={{
          padding: 'var(--space-075) var(--space-125)', borderRadius: 7, border: '1px solid rgba(255,255,255,0.25)',
          background: 'transparent', color: '#fff', cursor: 'pointer',
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)',
        }}>Dismiss</button>
      </div>
    </div>
  );
}

// ── Add Employee Wizard ────────────────────────────────────────────────────
const ENTITY_DOMAINS = {
  'lumio-group':  'lumiogroup.be',
  'lumio-france': 'lumio.fr',
  'lumio-nl':     'lumio.nl',
};

function AddEmployeeWizard({ onClose, onCreated, companyRegime, mobilityLive, prefill = {} }) {
  const { visible, close } = useModalTransition(onClose, SHEET_CLOSE_DUR);
  const [step, setStep] = useState(1);
  const stepDirRef = React.useRef('forward');
  const [emailFlash, setEmailFlash] = useState(false);

  const goForward = () => { stepDirRef.current = 'forward';  setStep(s => s + 1); };
  const goBack    = () => { stepDirRef.current = 'backward'; setStep(s => s - 1); };

  // Inject CSS keyframes once
  React.useEffect(() => {
    if (!document.getElementById('wiz-anims')) {
      const s = document.createElement('style');
      s.id = 'wiz-anims';
      s.textContent = `
        @keyframes wizSlideFromRight { from { opacity:0; transform:translateX(28px); } to { opacity:1; transform:translateX(0); } }
        @keyframes wizSlideFromLeft  { from { opacity:0; transform:translateX(-28px); } to { opacity:1; transform:translateX(0); } }
        @keyframes wizFadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes wizEmailFlash { 0%,20% { background:#f3f0ff; } 100% { background:#fff; } }
      `;
      document.head.appendChild(s);
    }
  }, []);

  // Step 1 — Personal info
  const [firstName, setFirstName]       = useState(prefill.firstName ?? '');
  const [lastName,  setLastName]        = useState(prefill.lastName  ?? '');
  const [dob,       setDob]             = useState('');
  const [gender,    setGender]          = useState('');
  const [lang,      setLang]            = useState('Dutch');
  const [niss,      setNiss]            = useState(prefill.niss      ?? '');
  const [iban,      setIban]            = useState('');

  // Step 2 — Employment
  const [entityId,        setEntityId]        = useState('lumio-group');
  const [department,      setDepartment]      = useState('');
  const [startDate,       setStartDate]       = useState('08/08/2026');
  const [roles,           setRoles]           = useState(['Employee']);
  const [contractType,    setContractType]    = useState('cdi');
  const [contractEndDate, setContractEndDate] = useState('');

  // Step 3 — Schedule
  const [fte,          setFte]          = useState(1.0);
  const [workSchedule, setWorkSchedule] = useState([1,2,3,4,5]);

  // Step 4 — invite + Step 5 — Card access
  const [sendInvite, setSendInvite] = useState(true);
  const totalSteps = mobilityLive ? 5 : 4;
  const [inviteToCard, setInviteToCard] = useState(true);

  // Step 4 — Compensation
  const suggestedWorkEmail = React.useMemo(() => {
    const domain = ENTITIES.find(e => e.id === entityId)?.emailDomain ?? (companyRegime || COMPANY_REGIME_DEFAULTS).emailDomain ?? 'company.com';
    const f = firstName.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
    const l = lastName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '');
    return f && l ? `${f}.${l}@${domain}` : '';
  }, [firstName, lastName, entityId]);
  const [workEmail,      setWorkEmail]      = useState('');
  const [grossSalary,    setGrossSalary]    = useState('');
  const [employerNsso,   setEmployerNsso]   = useState('25.00');
  const [employeeNsso,   setEmployeeNsso]   = useState('13.07');
  const [components,     setComponents]     = useState(['meal-vouchers']);

  // Auto-populate work email when reaching step 2
  React.useEffect(() => {
    if (step === 2 && !workEmail && suggestedWorkEmail) {
      setWorkEmail(suggestedWorkEmail);
      setEmailFlash(true);
      const t = setTimeout(() => setEmailFlash(false), 800);
      return () => clearTimeout(t);
    }
  }, [step]);

  const regime = companyRegime || COMPANY_REGIME_DEFAULTS;

  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close]);

  const step1Valid = firstName.trim() && lastName.trim() && dob.trim() && gender && niss.trim();
  const entityDomain = ENTITIES.find(e => e.id === entityId)?.emailDomain ?? (companyRegime || COMPANY_REGIME_DEFAULTS).emailDomain;
  const emailDomainValid = !workEmail.trim() || !entityDomain || workEmail.trim().toLowerCase().endsWith('@' + entityDomain);
  const step2Valid = department && startDate.trim() && workEmail.trim() && emailDomainValid;
  const step3Valid = true;
  const step4Valid = grossSalary.trim() && parseFloat(grossSalary) > 0;
  const step5Valid = true;
  const canAdvance = true;

  const handleCreate = () => {
    const slug = firstName.toLowerCase().replace(/\s+/g, '-') + '-' + lastName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z-]/g, '');
    const id   = slug + '-' + String(Date.now()).slice(-5);
    const palette = ['#bfdbfe','#ddd6fe',P.warningBorder,'#a7f3d0','#fecdd3','#fed7aa','#c7d2fe'];
    const color = palette[id.charCodeAt(0) % palette.length];
    const entity = ENTITIES.find(e => e.id === entityId);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    onCreated(id, {
      name: fullName,
      initials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
      color,
      email: workEmail.trim(),
      entitlement: 20,
      department,
      entity: entity?.name || entityId,
      budget: mobilityLive ? 150 : 0,
      entityId,
      role: roles.includes('Admin') ? 'Admin' : 'Employee',
      status: 'Active',
      gender: gender === 'M' ? 'm' : 'f',
      fte,
      workSchedule,
      dob: dob.trim(),
      niss: niss.trim(),
      iban: iban.trim(),
      contractType,
      contractEndDate: contractType === 'cdd' ? contractEndDate : undefined,
      grossSalary: parseFloat(grossSalary),
      employerNsso: parseFloat(employerNsso),
      employeeNsso: parseFloat(employeeNsso),
      components,
    }, {
      payrollId: String(100000 + id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 900000),
      hireDate: startDate,
      lang,
    }, fullName, sendInvite, mobilityLive && inviteToCard);
    close();
  };

  const inputStyle = { width: '100%', border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-150)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, outline: 'none', boxSizing: 'border-box', background: P.white };
  const labelStyle = { display: 'block', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginBottom: 'var(--space-075)', letterSpacing: '0.01em' };
  const SL2        = { fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--fs-body-xs)', color: P.inkSoft, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 'var(--space-250)' };
  const StepHeading = ({ title, sub }) => (
    <div style={{ marginBottom: 'var(--space-400)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: P.ink, marginBottom: 'var(--space-050)' }}>{title}</div>
      {sub && <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>{sub}</div>}
    </div>
  );
  const hint       = { fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, marginTop: 'var(--space-075)' };
  const fieldIn    = (i) => ({ animation: 'wizFadeUp 220ms ease-out both', animationDelay: `${i * 50}ms` });
  const segBtn     = (active) => ({ flex: 1, padding: 'var(--space-100) var(--space-200)', borderRadius: 8, border: `1.5px solid ${active ? P.action : P.border}`, background: active ? '#f3f0ff' : 'transparent', color: active ? P.action : P.ink, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', cursor: 'pointer', transition: 'all 120ms ease' });
  const chevron    = { ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6b80' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 'var(--space-400)', cursor: 'pointer' };

  const StepDots = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)' }}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s, i) => (
        <React.Fragment key={s}>
          {i > 0 && (
            <div style={{ width: 20, height: 1, background: P.border, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: P.action, transformOrigin: 'left center', transform: s <= step ? 'scaleX(1)' : 'scaleX(0)', transition: 'transform 280ms ease-out' }} />
            </div>
          )}
          <div style={{ width: s === step ? 8 : 6, height: s === step ? 8 : 6, borderRadius: '50%', background: s <= step ? P.action : P.border, transition: 'all 280ms cubic-bezier(0.34,1.56,0.64,1)' }} />
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 201, background: P.bg, display: 'flex', flexDirection: 'column', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(16px)', transition: `opacity ${SHEET_CLOSE_DUR}ms ${EASE_OUT}, transform ${SHEET_CLOSE_DUR}ms ${EASE_OUT}` }}>

      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-400)', height: 60, borderBottom: `1px solid ${P.border}` }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-body-lg)', color: P.ink, minWidth: 140 }}>Add employee</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-075)' }}>
          <StepDots />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft }}>Step {step} of {totalSteps}</div>
        </div>
        <div style={{ minWidth: 140, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={close} style={{ border: 'none', cursor: 'pointer', width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(60,60,67,0.1)' }}>
            <Icon name="X" size={14} color={P.ink} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 var(--space-400)' }}>
        <form autoComplete="off" onSubmit={e => e.preventDefault()} style={{ maxWidth: 560, margin: '0 auto', padding: 'var(--space-600) 0 var(--space-1000)' }}>
        <div key={step} style={{ animation: `${stepDirRef.current === 'forward' ? 'wizSlideFromRight' : 'wizSlideFromLeft'} 200ms ease-out both` }}>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
              <StepHeading title="Personal info" sub="Identity and banking details required for payroll and Dimona declaration." />
              <div style={{ ...fieldIn(0), display: 'flex', gap: 'var(--space-200)' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>First name</label>
                  <input autoFocus autoComplete="off" value={firstName} onChange={e => setFirstName(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Last name</label>
                  <input autoComplete="off" value={lastName} onChange={e => setLastName(e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ ...fieldIn(1), display: 'flex', gap: 'var(--space-200)' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Date of birth</label>
                  <input autoComplete="off" value={dob} onChange={e => setDob(e.target.value)} placeholder="DD/MM/YYYY" style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Gender</label>
                  <div style={{ display: 'flex', gap: 'var(--space-100)' }}>
                    {['M','F'].map(g => (
                      <button key={g} onClick={() => setGender(g)} style={segBtn(gender === g)}>{g === 'M' ? 'Male' : 'Female'}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={fieldIn(2)}>
                <label style={labelStyle}>Language</label>
                <select value={lang} onChange={e => setLang(e.target.value)} style={chevron}>
                  <option value="Dutch">Dutch</option>
                  <option value="French">French</option>
                  <option value="English">English</option>
                </select>
              </div>
              <div style={fieldIn(3)}>
                <label style={labelStyle}>NISS number</label>
                <input autoComplete="off" value={niss} onChange={e => setNiss(e.target.value)} placeholder="XX.XX.XX-XXX.XX" style={inputStyle} />
                <div style={hint}>National registry number — required for Dimona declaration.</div>
              </div>
              <div style={fieldIn(4)}>
                <label style={labelStyle}>Bank account (IBAN)</label>
                <input autoComplete="off" value={iban} onChange={e => setIban(e.target.value.toUpperCase())} placeholder="BE68 5390 0754 7034" style={inputStyle} />
                <div style={hint}>Used for salary payments. Can be added later if not available now.</div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
              <StepHeading title="Employment" sub="Contract details and access level within Payflip." />
              <div style={fieldIn(0)}>
                <label style={labelStyle}>Entity</label>
                <select value={entityId} onChange={e => setEntityId(e.target.value)} style={chevron}>
                  {ENTITIES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div style={fieldIn(1)}>
                <label style={labelStyle}>Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)} style={chevron}>
                  <option value="">Select department…</option>
                  {['Design','Engineering','Marketing','Operations','Finance','HR'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div style={fieldIn(2)}>
                <label style={labelStyle}>Start date</label>
                <input autoComplete="off" value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="DD/MM/YYYY" style={inputStyle} />
              </div>
              <div style={fieldIn(3)}>
                <label style={labelStyle}>Work email</label>
                <input autoComplete="off" value={workEmail} onChange={e => setWorkEmail(e.target.value)} placeholder={`name@${entityDomain || 'company.com'}`} type="email" style={{ ...inputStyle, animation: emailFlash ? 'wizEmailFlash 700ms ease-out forwards' : 'none', borderColor: workEmail.trim() && !emailDomainValid ? P.danger : undefined }} />
                {workEmail.trim() && !emailDomainValid
                  ? <div style={{ ...hint, color: P.danger }}>Must use a {entityDomain} address — personal emails cause SSO issues.</div>
                  : <div style={hint}>Used for payslips and Payflip account login.</div>
                }
              </div>
              <div style={fieldIn(4)}>
                <label style={labelStyle}>Access</label>
                <div style={{ display: 'flex', gap: 'var(--space-100)' }}>
                  {['Employee','Admin'].map(r => {
                    const active = roles.includes(r);
                    return (
                      <button key={r} onClick={() => setRoles(prev => active ? prev.filter(x => x !== r) : [...prev, r])} style={segBtn(active)}>{r}</button>
                    );
                  })}
                </div>
                <div style={hint}>Employee access: view payslips, request leave. Admin: manage the team in Payflip.</div>
              </div>
              <div style={fieldIn(5)}>
                <label style={labelStyle}>Contract type</label>
                <div style={{ display: 'flex', gap: 'var(--space-100)', marginBottom: 'var(--space-100)' }}>
                  {[{v:'cdi',l:'CDI'},{v:'cdd',l:'CDD'}].map(ct => (
                    <button key={ct.v} onClick={() => setContractType(ct.v)} style={segBtn(contractType === ct.v)}>{ct.l}</button>
                  ))}
                </div>
                <div style={hint}>{contractType === 'cdi' ? 'Unlimited duration — standard Belgian employment contract.' : 'Fixed-term — specify an end date below.'}</div>
              </div>
              {contractType === 'cdd' && (
                <div style={fieldIn(6)}>
                  <label style={labelStyle}>Contract end date</label>
                  <input autoComplete="off" value={contractEndDate} onChange={e => setContractEndDate(e.target.value)} placeholder="DD/MM/YYYY" style={inputStyle} />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
              <StepHeading title="Schedule" sub="Working regime and contracted hours for payroll." />
              <div style={fieldIn(0)}>
                <label style={labelStyle}>Working regime</label>
                <div style={{ display: 'flex', gap: 'var(--space-100)' }}>
                  {[{v:1.0,l:'Full-time',sub:'5 days'},{v:0.8,l:'4 days',sub:'per week'},{v:0.6,l:'3 days',sub:'per week'},{v:0.5,l:'Half-time',sub:'2½ days'}].map(opt => (
                    <button key={opt.v} onClick={() => { setFte(opt.v); setWorkSchedule(opt.v === 1.0 ? [1,2,3,4,5] : opt.v === 0.8 ? [1,2,3,4] : opt.v === 0.6 ? [1,2,3] : [1,2,3]); }}
                      style={{ ...segBtn(fte === opt.v), flexDirection: 'column', display: 'flex', alignItems: 'center', gap: 'var(--space-025)' }}>
                      <span>{opt.l}</span>
                      <span style={{ fontSize: 'var(--fs-body-xs)', fontWeight: 400, opacity: 0.7 }}>{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div style={fieldIn(1)}>
                <label style={labelStyle}>Contracted hours</label>
                <div style={{ border: `1px solid ${P.border}`, borderRadius: 8, padding: 'var(--space-100) var(--space-150)', background: P.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink }}>{regime.contractedHours}h / week</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-xs)', color: P.inkSoft, background: P.white, padding: 'var(--space-025) var(--space-100)', borderRadius: 4, border: `1px solid ${P.border}` }}>Company default</span>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-300)' }}>
              <StepHeading title="Card access" sub="Invite this employee to request a Payflip Card for mobility expenses." />
              <div style={{ ...fieldIn(0), border: `1px solid ${P.border}`, borderRadius: 12, background: P.white }}>
                <div style={{ padding: 'var(--space-200) var(--space-250)', display: 'flex', alignItems: 'center', gap: 'var(--space-200)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: P.bg, border: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="credit-card" size={16} color={P.inkSoft} strokeWidth={1.5} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink }}>Also invite to the Payflip Card</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>Mobility card · virtual</div>
                  </div>
                  <Switch checked={inviteToCard} onChange={() => setInviteToCard(v => !v)} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-400)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-250)' }}>
                <StepHeading title="Compensation" sub="Gross salary, social contributions, and benefits." />
                <div style={fieldIn(0)}>
                  <label style={labelStyle}>Monthly gross salary</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>€</span>
                    <input autoComplete="off" value={grossSalary} onChange={e => setGrossSalary(e.target.value)} placeholder="0,00" type="number" min="0" step="0.01" style={{ ...inputStyle, paddingLeft: 'var(--space-400)' }} />
                  </div>
                  <div style={hint}>Gross amount before social contributions, paid on the last working day of the month.</div>
                </div>
                <div style={fieldIn(1)}>
                  <label style={labelStyle}>Social contributions</label>
                  <div style={{ border: `1px solid ${P.border}`, borderRadius: 8, overflow: 'hidden' }}>
                    {[
                      {label:'Employer NSSO', value: employerNsso, set: setEmployerNsso},
                      {label:'Employee NSSO', value: employeeNsso, set: setEmployeeNsso},
                    ].map((row, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-100) var(--space-200)', borderTop: i > 0 ? `1px solid ${P.border}` : 'none', background: P.bg, gap: 'var(--space-150)' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink, whiteSpace: 'nowrap' }}>{row.label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-050)', border: `1px solid ${P.border}`, borderRadius: 6, padding: 'var(--space-050) var(--space-100)', background: P.white }}>
                          <input
                            autoComplete="off"
                            value={row.value}
                            onChange={e => row.set(e.target.value)}
                            type="number" min="0" max="100" step="0.01"
                            style={{ width: 64, border: 'none', outline: 'none', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', color: P.ink, background: 'transparent', textAlign: 'right' }}
                          />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.inkSoft }}>%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={hint}>Belgian statutory rates — adjust only if this employee has a special regime.</div>
                </div>
              </div>
            </div>
          )}

        </div>
        </form>
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0, padding: 'var(--space-200) var(--space-400)', borderTop: `1px solid ${P.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: P.white }}>
        {step > 1
          ? <button onClick={goBack} style={{ padding: 'var(--space-100) var(--space-250)', borderRadius: 8, border: `1px solid ${P.border}`, background: 'transparent', color: P.ink, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>Back</button>
          : <div />
        }
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-200)' }}>
          {step === 4 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-100)', cursor: 'pointer' }}>
              <div onClick={() => setSendInvite(v => !v)}
                style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${sendInvite ? P.action : P.border}`, background: sendInvite ? P.action : P.white, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms ease' }}>
                {sendInvite && <Icon name="Check" size={11} color={P.white} strokeWidth={3} />}
              </div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--fs-body-sm)', color: P.ink }}>Send invite email</span>
            </label>
          )}
          {step < totalSteps
            ? <button onClick={goForward} style={{ padding: 'var(--space-100) var(--space-250)', borderRadius: 8, border: 'none', background: P.action, color: P.white, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)', transition: 'background 150ms ease' }}>Next</button>
            : <button onClick={handleCreate} style={{ padding: 'var(--space-100) var(--space-250)', borderRadius: 8, border: 'none', background: P.action, color: P.white, cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--fs-body-sm)' }}>
                {inviteToCard ? 'Create & invite to card' : sendInvite ? 'Create & send invite' : 'Create employee'}
              </button>
          }
        </div>
      </div>
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────
function App() {
  const [screen, setScreen] = useState(() => pathToScreen(window.location.pathname));
  const [adminAccess, setAdminAccess] = useState(() =>
    Object.entries(EMPLOYEES)
      .filter(([, u]) => u.adminAccess)
      .reduce((acc, [id, u]) => ({ ...acc, [id]: u.adminAccess }), {})
  );
  const handleAdminSave = (adminId, newAccess) => {
    setAdminAccess(prev => {
      if (newAccess === 'revoke') return { ...prev, [adminId]: 'revoked' };
      return { ...prev, [adminId]: newAccess };
    });
  };
  const [companyRegime, setCompanyRegime] = useState(COMPANY_REGIME_DEFAULTS);
  const [leaveTypes, setLeaveTypes] = useState(initLeaveTypes);
  const [employeeOverrides, setEmployeeOverrides] = useState({});
  const handleEmployeeUpdate = (empId, overrides) => {
    setEmployeeOverrides(prev => ({ ...prev, [empId]: { ...(prev[empId] || {}), ...overrides } }));
  };
  const getEmpWithOverrides = (empId) => {
    const base = EMPLOYEES[empId];
    const over = employeeOverrides[empId];
    return over ? { ...base, ...over } : base;
  };
  const [sidebarMode, setSidebarMode] = useState('app');
  const [appEntity, setAppEntity] = useState(null);
  const [requests, setRequests] = useState(() => mergeRequests(generatedRequests, readLS()));
  const [companyEvents, setCompanyEvents] = useState([]);
  const [toasts, setToasts] = useState([]);
  const addToast = (t) => setToasts(prev => [{ id: `t-${prev.length}-${Date.now()}`, ...t }, ...prev]);
  const removeToast = () => setToasts([]);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [addEmployeePrefill, setAddEmployeePrefill] = useState({});
  const [freshEmployeeId, setFreshEmployeeId] = useState(null);
  const handleAddEmployee = (id, emp, extra, fullName, sendInvite, inviteToCard) => {
    EMPLOYEES[id] = emp;
    EMP_EXTRA[id] = extra;
    setFreshEmployeeId(id);
    if (inviteToCard) {
      setMobilityWidgetState(prev => ({ ...prev, invitedKeys: [...(prev.invitedKeys || []), id] }));
    }
    setScreen('employee-detail:' + id);
    const msg = inviteToCard ? `${fullName} added — invite & card access sent`
      : sendInvite ? `${fullName} added — invite sent`
      : `${fullName} added`;
    addToast({ message: msg, type: 'approve' });
  };
  const [calDetail, setCalDetail] = useState(null);
  const [calendarJumpDate, setCalendarJumpDate] = useState(null);
  const [calendarDeptFilter, setCalendarDeptFilter] = useState(null);
  const handleNav = (id) => {
    if (id === 'team-absences') setCalendarJumpDate(null);
    setScreen(id);
    history.pushState({ screen: id }, '', screenToPath(id));
  };
  React.useEffect(() => {
    history.replaceState({ screen }, '', screenToPath(screen));
    const onPop = (e) => {
      const s = e.state?.screen ?? pathToScreen(window.location.pathname);
      if (s === 'team-absences') setCalendarJumpDate(null);
      setScreen(s);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const [choices, setChoices] = useState(CHOICES_SEED);
  const [choiceDetail, setChoiceDetail] = useState(null);
  const approveChoice = (id) => {
    setChoices(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
    const ch = choices.find(c => c.id === id);
    if (ch) addToast({ message: `${(EMPLOYEES[ch.empId] || {}).name?.split(' ')[0]}'s choice approved`, type: 'approve' });
  };
  const declineChoice = (id, reason) => {
    setChoices(prev => prev.map(c => c.id === id ? { ...c, status: 'declined', declineReason: reason } : c));
    const ch = choices.find(c => c.id === id);
    if (ch) addToast({ message: `${(EMPLOYEES[ch.empId] || {}).name?.split(' ')[0]}'s choice declined`, type: 'decline' });
  };

  const [physicalCardsAllowed, setPhysicalCardsAllowed] = useState(false);
  const [cardDelivery, setCardDelivery] = useState('home');
  const [mobilityWidgetState, setMobilityWidgetState] = useState({
    widgetMode: 'mobility',
    hidden: false,
    step: 1,
    mandateDenied: false,
    mandateValidated: false,
    depositFailed: false,
    live: false,
    liveVisible: false,
    invitedKeys: [],
  });
  const [settingsDocuments, setSettingsDocuments] = useState([]);

  const [expenses, setExpenses] = useState(EXPENSES_SEED);
  const [expenseCategories, setExpenseCategories] = useState(EXPENSE_CATEGORIES_SEED);
  const [receiptAlwaysRequired, setReceiptAlwaysRequired] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);
  const [allowances, setAllowances] = useState(ALLOWANCE_TYPES.map(t => ({ id: t.id, active: ['mileage', 'home-office', 'mobile-internet'].includes(t.id), rate: t.defaultRate })));
  const [expDetail, setExpDetail] = useState(null);
  const [expDetailRejectMode, setExpDetailRejectMode] = useState(false);

  const approveExpense = (id) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' } : e));
    const exp = expenses.find(e => e.id === id);
    if (exp) addToast({ message: `${(EMPLOYEES[exp.employee] || { name: exp.employee }).name.split(' ')[0]}'s expense approved`, type: 'approve' });
  };

  const editExpense = (id, updates) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    setExpDetail(prev => prev?.id === id ? { ...prev, ...updates } : prev);
  };
  const rejectExpense = (id, reason) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'rejected', rejectReason: reason } : e));
    const exp = expenses.find(e => e.id === id);
    if (exp) addToast({ message: `${(EMPLOYEES[exp.employee] || { name: exp.employee }).name.split(' ')[0]}'s expense rejected`, type: 'decline' });
  };
  const addExpense = (exp) => {
    const id = `exp-${Date.now()}`;
    const newExp = { id, ...exp, status: 'approved' };
    setExpenses(prev => [newExp, ...prev]);
    const name = (EMPLOYEES[exp.employee] || { name: exp.employee }).name.split(' ')[0];
    addToast({ message: `Expense added for ${name}`, type: 'approve', onView: () => { setExpDetailRejectMode(false); setExpDetail(newExp); } });
  };

  const [pendingAction, setPendingAction] = useState(null); // { type: 'decline'|'cancel', id, empName }
  const [followUpPrompt, setFollowUpPrompt] = useState(null); // { empId, iso, half }
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== LS_KEY) return;
      const live = readLS();
      setRequests(prev => {
        const merged = mergeRequests(prev, live);
        const hasNew = merged.some(r => r.status === 'pending' && !prev.find(p => p.id === r.id));
        if (hasNew) addToast({ message: 'New request received' });
        return merged;
      });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const approve = (id) => {
    setRequests(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status: 'approved' } : r);
      writeLS(next);
      return next;
    });
    const req = requests.find(r => r.id === id);
    if (req) addToast({ message: `${(EMPLOYEES[req.employee] || { name: req.employee }).name.split(' ')[0]}'s request approved`, type: 'approve' });
  };

  const undoDecline = (id) => {
    setRequests(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status: 'pending', declineReason: undefined } : r);
      writeLS(next);
      return next;
    });
  };

  const decline = (id, reason) => {
    setRequests(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status: 'rejected', declineReason: reason } : r);
      writeLS(next);
      return next;
    });
    const req = requests.find(r => r.id === id);
    if (req) addToast({ message: `${(EMPLOYEES[req.employee] || { name: req.employee }).name.split(' ')[0]}'s request declined`, type: 'decline', onUndo: () => undoDecline(id) });
  };

  // Interceptors — show ReasonModal before acting
  const requestDecline = (id, reason) => {
    if (reason !== undefined) { decline(id, reason); return; }
    const req = requests.find(r => r.id === id);
    const empName = (EMPLOYEES[req?.employee] || { name: req?.employee || '' }).name;
    setPendingAction({ type: 'decline', id, empName });
  };
  const requestCancel = (id, reason) => {
    if (reason !== undefined) { cancelRequest(id, reason); return; }
    const req = requests.find(r => r.id === id);
    const empName = (EMPLOYEES[req?.employee] || { name: req?.employee || '' }).name;
    setPendingAction({ type: 'cancel', id, empName });
  };

  const saveRequest = (req) => {
    if (req._isCompanyEvent) {
      setCompanyEvents(prev => {
        const idx = prev.findIndex(e => e.id === req.id);
        return idx >= 0 ? prev.map(e => e.id === req.id ? req : e) : [req, ...prev];
      });
      addToast({ message: 'Company closure saved' });
      return;
    }
    const wasEdit = requests.some(r => r.id === req.id);
    setRequests(prev => {
      const idx = prev.findIndex(r => r.id === req.id);
      return idx >= 0 ? prev.map(r => r.id === req.id ? req : r) : [req, ...prev];
    });
    addToast({ message: wasEdit ? 'Absence updated' : 'Absence added' });
    if (wasEdit && req._halfDay) {
      const halfEntry = Object.entries(req._halfDay)
        .find(([iso, hv]) => req._selectedDates?.includes(iso) && (hv === 'am' || hv === 'pm'));
      if (halfEntry) {
        const [iso, hv] = halfEntry;
        setFollowUpPrompt({ empId: req.employee, iso, half: hv === 'am' ? 'pm' : 'am' });
        setFollowUpModalOpen(false);
      }
    }
  };

  const cancelRequest = (id, reason) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    addToast({ message: 'Absence cancelled' });
  };

  const cancelCompanyEvent = (id) => {
    setCompanyEvents(prev => prev.filter(e => e.id !== id));
    addToast({ message: 'Company closure cancelled' });
  };

  const [employeeBalances, setEmployeeBalances] = useState(() => {
    const init = {};
    for (const [id, emp] of Object.entries(EMPLOYEES)) {
      init[id] = {
        'Statutory annual leave': emp.entitlement,
        'Sick leave': null,
        'Special leave': null,
        'Paid absence': null,
        'Unpaid absence': null,
      };
    }
    return init;
  });

  const updateBalances = (empId, newBalances) => {
    setEmployeeBalances(prev => ({ ...prev, [empId]: newBalances }));
    addToast({ message: 'Balances updated' });
  };

  const [needsBalanceSetup, setNeedsBalanceSetup] = useState(new Set(['thomas-vandenberghe']));
  const [balanceConfirmedDates, setBalanceConfirmedDates] = useState({});

  const confirmBalancesFor = (empId) => {
    setNeedsBalanceSetup(prev => { const s = new Set(prev); s.delete(empId); return s; });
    setBalanceConfirmedDates(prev => ({ ...prev, [empId]: '15 Jul 2026' }));
  };

  const entityFilteredRequests = appEntity ? requests.filter(r => EMPLOYEES[r.employee]?.entityId === appEntity) : requests;
  const entityFilteredExpenses = appEntity ? expenses.filter(e => EMPLOYEES[e.employee]?.entityId === appEntity) : expenses;
  const entityFilteredChoices = appEntity ? choices.filter(c => EMPLOYEES[c.empId]?.entityId === appEntity) : choices;

  const pendingRequestsCount = entityFilteredRequests.filter(r => r.status === 'pending').length;
  const pendingExpensesCount = requireApproval ? entityFilteredExpenses.filter(e => e.status === 'pending').length : 0;
  const pendingChoicesCount = entityFilteredChoices.filter(c => c.status === 'pending').length;
  const pendingCount = { requests: pendingRequestsCount, expenses: pendingExpensesCount, choices: pendingChoicesCount };

  return (
    <div style={{ display: 'flex', height: '100vh', background: P.bg }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pillFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pillFadeDown {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(6px); }
        }
        @keyframes badgePopIn {
          from { opacity: 0; transform: scale(0.75); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes screenEnter {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        :root {
          --tabs-dur: 250ms;
          --tabs-ease: cubic-bezier(0.22, 1, 0.36, 1);
          --tabs-text-muted: #50545e;
          --tabs-text-active: rgb(34, 10, 53);
          --tabs-bar-bg: ${P.border};
          --tabs-pill-bg: #ffffff;
        }
        .t-tabs {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 3px;
          border-radius: 48px;
          background: var(--tabs-bar-bg);
        }
        .t-tab {
          position: relative;
          appearance: none;
          border: 0;
          background: transparent;
          height: 28px;
          padding: 4px 12px;
          color: var(--tabs-text-muted);
          cursor: pointer;
          border-radius: 48px;
          z-index: 1;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 12px;
          transition: color var(--tabs-dur) var(--tabs-ease);
          white-space: nowrap;
        }
        .t-tab:not([aria-selected="true"]):hover,
        .t-tab[aria-selected="true"] { color: var(--tabs-text-active); }
        .t-tabs-pill {
          position: absolute;
          top: 3px;
          left: 0;
          height: 28px;
          width: 0;
          background: var(--tabs-pill-bg);
          border-radius: 48px;
          box-shadow: 0 1px 3px rgba(15, 13, 40, 0.12), 0 0 0 0.5px rgba(15, 13, 40, 0.06);
          transform: translateX(0);
          transition:
            transform var(--tabs-dur) var(--tabs-ease),
            width     var(--tabs-dur) var(--tabs-ease);
          will-change: transform, width;
          z-index: 0;
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .t-tabs-pill, .t-tab { transition: none !important; }
        }
        @keyframes tableEnter {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tableEnterReduced {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes labelFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fileRowIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes stepContentEnter {
          from { opacity: 0; transform: scale(0.97) translateY(4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes stepContentEnterReduced {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes stepDoneEnter {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 0.70; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; }
        ::placeholder { color: #9ca3af; opacity: 1; }
      `}</style>

      {screen === 'dashboard' && !mobilityWidgetState.live && !mobilityWidgetState.hidden && (
        <div onClick={() => setMobilityWidgetState(prev => ({ ...prev, hidden: true }))} style={{ position: 'fixed', inset: 0, zIndex: 1, cursor: 'pointer' }} />
      )}

      <Sidebar active={screen} onNav={handleNav} pendingCount={pendingCount} sidebarMode={sidebarMode} onSetSidebarMode={setSidebarMode} appEntity={appEntity} onSetAppEntity={setAppEntity} setupInProgress={screen === 'dashboard' && !mobilityWidgetState.live && !mobilityWidgetState.hidden} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {screen === 'dashboard' && <DashboardScreen key={appEntity ?? 'all'} requests={entityFilteredRequests} onNav={setScreen} onToast={addToast} appEntity={appEntity} physicalCardsAllowed={physicalCardsAllowed} onPhysicalCardsChange={setPhysicalCardsAllowed} cardDelivery={cardDelivery} onCardDeliveryChange={setCardDelivery} mobilityWidgetState={mobilityWidgetState} onMobilityWidgetStateChange={setMobilityWidgetState} pendingRequests={pendingRequestsCount} pendingExpenses={pendingExpensesCount} pendingChoices={pendingChoicesCount} activeBudgets={allowances.filter(a => a.active).length} onAddEmployee={(pf) => { setAddEmployeePrefill(pf); setAddEmployeeOpen(true); }} />}
        {screen === 'team-absences' && <TeamAbsencesScreen key={appEntity ?? 'all'} requests={entityFilteredRequests} pendingCount={pendingRequestsCount} onNav={setScreen} onShowDetail={setCalDetail} activeReqId={calDetail?.id} onSave={saveRequest} companyEvents={companyEvents} onCancelCompanyEvent={cancelCompanyEvent} initialDate={calendarJumpDate} initialDeptFilter={calendarDeptFilter} appEntity={appEntity} leaveTypes={leaveTypes} />}
        {screen === 'requests' && <RequestsScreen key={appEntity ?? 'all'} requests={entityFilteredRequests} onApprove={approve} onDecline={requestDecline} onSave={saveRequest} onCancel={requestCancel} onNav={setScreen} onViewInCalendar={(req) => { const d = req._selectedDates?.[0] || req.startDate; if (d) { const iso = typeof d === 'string' && d.match(/^\d{4}-/) ? d : null; setCalendarJumpDate(iso ? new Date(iso) : parseDisplayDate(d)); } setCalDetail(req); setScreen('team-absences'); }} appEntity={appEntity} />}
        {(screen === 'employees' || screen === 'employees:admin') && <EmployeesScreen key={appEntity ?? 'all'} requests={entityFilteredRequests} onNav={setScreen} initialRoleFilter={screen === 'employees:admin' ? 'Admin' : 'All'} adminAccess={adminAccess} appEntity={appEntity} onAddEmployee={() => setAddEmployeeOpen(true)} />}
        {screen.startsWith('employee-detail:') && (() => { const [, detailEmpId, detailTab] = screen.split(':'); return <EmployeeDetailScreen employeeId={detailEmpId} requests={requests} onNav={setScreen} onSave={saveRequest} onCancel={cancelRequest} onApprove={approve} onDecline={requestDecline} onViewTeamCalendar={(dept) => { setCalendarDeptFilter(dept || null); setScreen('team-absences'); }} employeeBalance={employeeBalances[detailEmpId]} onUpdateBalance={(newBal) => updateBalances(detailEmpId, newBal)} needsSetup={needsBalanceSetup.has(detailEmpId)} confirmedDate={balanceConfirmedDates[detailEmpId]} onConfirmBalances={() => confirmBalancesFor(detailEmpId)} onToast={addToast} adminAccess={adminAccess} onAdminSave={handleAdminSave} companyRegime={companyRegime} onEmployeeUpdate={handleEmployeeUpdate} getEmpWithOverrides={getEmpWithOverrides} physicalCardsAllowed={physicalCardsAllowed} mobilityWidgetState={mobilityWidgetState} initialTab={detailTab || (freshEmployeeId === detailEmpId ? 'details' : 'choices')} />; })()}
        {screen === 'expenses' && <ExpensesScreen key={appEntity ?? 'all'} expenses={entityFilteredExpenses} categories={expenseCategories} onApprove={approveExpense} onDetail={(exp) => { setExpDetailRejectMode(false); setExpDetail(exp); }} onRejectDirectly={(exp) => { setExpDetailRejectMode(true); setExpDetail(exp); }} onAdd={addExpense} appEntity={appEntity} receiptAlwaysRequired={receiptAlwaysRequired} requireApproval={requireApproval} onGoToSettings={() => setScreen('settings-expenses')} />}
        {screen === 'choices' && <ChoicesScreen key={appEntity ?? 'all'} choices={entityFilteredChoices} onApprove={approveChoice} onDecline={declineChoice} onDetail={setChoiceDetail} appEntity={appEntity} />}
        {screen === 'payroll-overview' && <StubScreen title="Payroll Overview" description="Monthly payroll run and submission" />}
        {screen === 'payroll-reports' && <StubScreen title="Payroll Reports" description="Reporting and exports" />}
        {screen === 'settings-allowances' && <AllowancesListPage key={appEntity ?? 'all'} allowances={allowances} onSaveAllowance={updated => setAllowances(prev => prev.map(a => a.id === updated.id ? updated : a))} appEntity={appEntity} />}
        {screen === 'settings-expenses' && <ExpenseCategorySettings key={appEntity ?? 'all'} categories={expenseCategories} onSave={setExpenseCategories} appEntity={appEntity} receiptAlwaysRequired={receiptAlwaysRequired} onReceiptPolicyChange={setReceiptAlwaysRequired} requireApproval={requireApproval} onRequireApprovalChange={setRequireApproval} />}
        {screen === 'settings-team' && <TeamAccessSettings key={appEntity ?? 'all'} onNav={setScreen} adminAccess={adminAccess} onAdminSave={handleAdminSave} appEntity={appEntity} />}
        {screen === 'settings-entities' && <EntitiesSettings key={appEntity ?? 'all'} onNav={setScreen} appEntity={appEntity} companyRegime={companyRegime} onRegimeChange={setCompanyRegime} />}
        {screen === 'settings-timeoff' && <TimeOffSettings key={appEntity ?? 'all'} appEntity={appEntity} companyRegime={companyRegime} onToast={addToast} onNav={(target) => { setSidebarMode('app'); handleNav(target); }} leaveTypes={leaveTypes} setLeaveTypes={setLeaveTypes} />}
        {screen === 'settings-documents' && <DocumentsSettings key={appEntity ?? 'all'} appEntity={appEntity} documents={settingsDocuments} onDocumentsChange={setSettingsDocuments} />}
        {screen === 'settings-payroll' && <PayrollSettings companyRegime={companyRegime} onRegimeChange={setCompanyRegime} appEntity={appEntity} onToast={addToast} />}
        {screen === 'settings-benefits' && <BenefitsSettings key={appEntity ?? 'all'} appEntity={appEntity} />}
        {screen === 'settings-cardrules' && <CardRulesSettings physicalCardsAllowed={physicalCardsAllowed} onPhysicalCardsChange={setPhysicalCardsAllowed} cardDelivery={cardDelivery} onCardDeliveryChange={setCardDelivery} onToast={addToast} mobilityWidgetState={mobilityWidgetState} onMobilityWidgetStateChange={setMobilityWidgetState} onNav={handleNav} />}
        {screen === 'changelog' && <ChangelogScreen />}
        {screen === 'components' && <ComponentLibraryScreen />}
        {screen.startsWith('settings-') && screen !== 'settings-allowances' && screen !== 'settings-expenses' && screen !== 'settings-team' && screen !== 'settings-timeoff' && screen !== 'settings-entities' && screen !== 'settings-documents' && screen !== 'settings-payroll' && screen !== 'settings-benefits' && screen !== 'settings-cardrules' && <StubScreen title={SETTINGS_TITLES[screen] || 'Settings'} description={`Configure ${(SETTINGS_TITLES[screen] || 'settings').toLowerCase()}`} />}
      </div>

      {calDetail && (
        <CalendarDrawer
          key={calDetail.id}
          req={calDetail}
          requests={requests}
          onClose={() => setCalDetail(null)}
          onApprove={(id) => { approve(id); setCalDetail(null); }}
          onDecline={(id, reason) => requestDecline(id, reason)}
          onCancel={(id, reason) => requestCancel(id, reason)}
          onSave={(req) => { saveRequest(req); setCalDetail(req); }}
        />
      )}

      {expDetail && (
        <ExpenseDrawer
          key={expDetail.id}
          expense={expDetail}
          initialRejectMode={expDetailRejectMode}
          onClose={() => { setExpDetail(null); setExpDetailRejectMode(false); }}
          onApprove={(id) => { approveExpense(id); setExpDetail(null); setExpDetailRejectMode(false); }}
          onReject={(id, reason) => { rejectExpense(id, reason); setExpDetail(null); setExpDetailRejectMode(false); }}
          onEdit={editExpense}
          categories={expenseCategories}
          requireApproval={requireApproval}
        />
      )}
      {choiceDetail && (
        <ChoiceDrawer
          key={choiceDetail.id}
          choice={choices.find(c => c.id === choiceDetail.id) || choiceDetail}
          onClose={() => setChoiceDetail(null)}
          onApprove={(id) => { approveChoice(id); setChoiceDetail(null); }}
          onDecline={(id, reason) => { declineChoice(id, reason); setChoiceDetail(null); }}
        />
      )}

      {pendingAction && (
        <ReasonModal
          title={pendingAction.type === 'decline' ? 'Decline request' : 'Cancel absence'}
          description={
            pendingAction.type === 'decline'
              ? `You're declining ${pendingAction.empName}'s time off request. The employee will be notified.`
              : `You're cancelling ${pendingAction.empName}'s absence. This cannot be undone.`
          }
          confirmLabel={pendingAction.type === 'decline' ? 'Decline request' : 'Cancel absence'}
          onClose={() => setPendingAction(null)}
          onConfirm={(reason) => {
            if (pendingAction.type === 'decline') {
              decline(pendingAction.id, reason);
              setCalDetail(prev => prev && prev.id === pendingAction.id ? { ...prev, status: 'rejected' } : prev);
            } else {
              cancelRequest(pendingAction.id, reason);
              setCalDetail(prev => prev && prev.id === pendingAction.id ? null : prev);
            }
            setPendingAction(null);
          }}
        />
      )}

      {addEmployeeOpen && <AddEmployeeWizard onClose={() => { setAddEmployeeOpen(false); setAddEmployeePrefill({}); }} onCreated={handleAddEmployee} companyRegime={companyRegime} mobilityLive={mobilityWidgetState.live} prefill={addEmployeePrefill} />}
      <ToastStack toasts={toasts} onRemove={removeToast} />
      {followUpPrompt && !followUpModalOpen && (
        <FollowUpBanner
          prompt={followUpPrompt}
          onDismiss={() => setFollowUpPrompt(null)}
          onLog={() => setFollowUpModalOpen(true)}
        />
      )}
      {followUpPrompt && followUpModalOpen && (
        <AddTimeOffModal
          existing={(() => {
            const d = new Date(followUpPrompt.iso + 'T00:00:00');
            const dateLabel = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
            return {
              employee: followUpPrompt.empId,
              _lockEmployee: true,
              startDate: dateLabel,
              endDate: dateLabel,
              _selectedDates: [followUpPrompt.iso],
              _halfDay: { [followUpPrompt.iso]: followUpPrompt.half },
            };
          })()}
          requests={requests}
          onClose={() => { setFollowUpModalOpen(false); setFollowUpPrompt(null); }}
          onSave={(req) => { saveRequest(req); setFollowUpModalOpen(false); setFollowUpPrompt(null); }}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
