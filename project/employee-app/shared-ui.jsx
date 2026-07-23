// Shared design-system helpers used across screens.
// Atoms + a few molecules. Larger compositions live in each screen file.

// ─────────────────────────────────────────────────────────────
// Colors lifted from the figma. Some aren't in colors_and_type.css
// because they're figma-only; keep them here so screens stay faithful.
// ─────────────────────────────────────────────────────────────
const PFC = {
  ink:         'rgb(15,13,40)',
  inkSoft:     'rgb(80,84,94)',
  inkMuted:    'rgb(59,57,64)',
  inkDeep:     'rgb(34,9,62)',     // big amounts
  inkDarker:   'rgb(34,10,53)',    // dark pill
  textBody:    'rgb(59,57,64)',
  border:      'rgb(234,234,235)', // softer
  borderHard:  'rgb(217,218,221)', // sharper
  bgInactive:  'rgb(247,247,248)',
  purple:      'rgb(196,43,252)',
  purpleDeep:  'rgb(139,55,235)',
  purpleSoft:  'rgb(232,216,240)',
  purpleTile:  'rgb(245,226,254)',
  purpleTileT: 'rgba(245,226,254,0.31)',
  blueLight:   'rgb(184,222,254)',
  pink:        'rgb(212,74,116)',
  pinkDark:    'rgb(165,39,77)',
  warnBg:      'rgb(255,243,229)',
  warnBorder:  'rgb(255,225,190)',
  warnText:    'rgb(166,79,33)',
  successBg:   'rgb(214,243,226)',
  successText: 'rgb(8,99,67)',
  errorBg:     'rgb(255,235,235)',
  errorText:   'rgb(143,20,20)',
  errorBorder: 'rgb(255,214,215)',
};

// Mirror styles for direct edits
const _font = 'var(--font-display)';

// ─────────────────────────────────────────────────────────────
// Reusable typography
// ─────────────────────────────────────────────────────────────
function Heading28({ children, color = PFC.ink, style }) {
  return <h1 style={{
    fontFamily: _font, fontWeight: 700, fontSize: 28, lineHeight: '36px',
    letterSpacing: '-0.007em', color, margin: 0, ...style,
  }}>{children}</h1>;
}
function Heading24({ children, color = PFC.ink, style }) {
  return <h2 style={{
    fontFamily: _font, fontWeight: 700, fontSize: 24, lineHeight: '32px',
    letterSpacing: '-0.005em', color, margin: 0, ...style,
  }}>{children}</h2>;
}
function Heading20({ children, color = PFC.ink, style }) {
  return <h3 style={{
    fontFamily: _font, fontWeight: 700, fontSize: 20, lineHeight: '28px',
    letterSpacing: '-0.003em', color, margin: 0, ...style,
  }}>{children}</h3>;
}
function Body16({ children, color = PFC.ink, weight = 400, style }) {
  return <span style={{
    fontFamily: _font, fontWeight: weight, fontSize: 16, lineHeight: '24px',
    color, ...style,
  }}>{children}</span>;
}
function Body14({ children, color = PFC.inkSoft, weight = 500, style }) {
  return <span style={{
    fontFamily: _font, fontWeight: weight, fontSize: 14, lineHeight: '20px',
    letterSpacing: '0.003em', color, ...style,
  }}>{children}</span>;
}
function Caption({ children, color = PFC.inkSoft, weight = 700, style }) {
  return <span style={{
    fontFamily: _font, fontWeight: weight, fontSize: 12, lineHeight: '16px',
    letterSpacing: '0.005em', color, ...style,
  }}>{children}</span>;
}

// ─────────────────────────────────────────────────────────────
// Buttons
// ─────────────────────────────────────────────────────────────
function Button({
  children, onClick, variant = 'outline', size = 'regular',
  fullWidth = false, leftIcon, style, disabled,
}) {
  const palette = {
    primary:   { bg: 'rgb(15,13,40)', color: '#fff',  border: 'transparent', fw: 600 },
    outline:   { bg: '#fff',           color: PFC.ink, border: PFC.border, fw: 500 },
    ghost:     { bg: 'transparent',    color: PFC.ink, border: 'transparent', fw: 500 },
    purple:    { bg: PFC.purpleTile,   color: PFC.ink, border: 'transparent', fw: 600 },
  }[variant];
  const sz = {
    sm:      { fs: 14, lh: '20px', pad: '6px 12px', radius: 8 },
    regular: { fs: 16, lh: '24px', pad: '8px 16px', radius: 10 },
    large:   { fs: 14, lh: '20px', pad: '10px 20px', radius: 10 },
  }[size === 'large' ? 'large' : size === 'sm' ? 'sm' : 'regular'];
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled}
      className={disabled ? undefined : 'pf-pressable'}
      style={{
      appearance: 'none', border: `1px solid ${palette.border}`,
      background: palette.bg, color: palette.color,
      fontFamily: _font, fontWeight: palette.fw,
      fontSize: sz.fs, lineHeight: sz.lh, padding: sz.pad,
      borderRadius: sz.radius,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      width: fullWidth ? '100%' : 'auto',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...style,
    }}>
      {leftIcon && <LucideIcon name={leftIcon} size={16} color={palette.color} strokeWidth={2} />}
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Icon button — used for back / help / X in headers.
// ─────────────────────────────────────────────────────────────
function IconBtn({ name, onClick, ariaLabel, size = 36, color = 'rgb(103,107,116)', bg = PFC.bgInactive }) {
  return (
    <button onClick={onClick} aria-label={ariaLabel} className="pf-pressable" style={{
      width: size, height: size, borderRadius: 8,
      background: bg, border: 'none', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flex: 'none', padding: 0,
    }}>
      <LucideIcon name={name} size={20} color={color} strokeWidth={2} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 40×40 rounded soft-purple gradient tile with a Lucide icon (or custom child).
// ─────────────────────────────────────────────────────────────
function IconTile({ name, size = 40, iconSize = 24, children }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: `linear-gradient(${PFC.purpleTileT} 0%, ${PFC.purpleTile} 100%)`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flex: 'none',
    }}>
      {children || <LucideIcon name={name} size={iconSize} color={PFC.ink} strokeWidth={1.75} />}
    </div>
  );
}

// "Gift"-style stroked outline icon tile used for budget items (purple stroke).
function GiftTile({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      flex: 'none',
    }}>
      <LucideIcon name="Gift" size={Math.round(size * 0.75)} color={PFC.purple} strokeWidth={1.75} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Status badges (warning / success / alert).
// ─────────────────────────────────────────────────────────────
function StatusBadge({ children, kind = 'warning', icon }) {
  const styles = {
    warning: { bg: PFC.warnBg, border: PFC.warnBorder, color: PFC.warnText, iconC: PFC.warnText },
    success: { bg: PFC.successBg, border: '#bfe6cd', color: PFC.successText, iconC: PFC.successText },
    alert:   { bg: PFC.errorBg, border: PFC.errorBorder, color: PFC.errorText, iconC: PFC.errorText },
  }[kind];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: styles.bg, color: styles.color,
      border: `1px solid ${styles.border}`,
      borderRadius: 8, padding: '2px 8px',
      fontFamily: _font, fontWeight: 500,
      fontSize: 12, lineHeight: '16px', letterSpacing: '0.005em',
      width: 'fit-content',
    }}>
      {icon && <LucideIcon name={icon} size={12} color={styles.iconC} strokeWidth={2} />}
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Generic card wrapper.
// ─────────────────────────────────────────────────────────────
function CardBox({ children, style, padded = true }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: `1px solid ${PFC.borderHard}`,
      padding: padded ? '20px 16px' : 0,
      ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Quickview — two side-by-side value cards (gray bg).
// ─────────────────────────────────────────────────────────────
function ValueCard({ label, value, onClick, withChevron, half = false, large = false, fill = PFC.border, valueColor = PFC.inkDeep, side }) {
  const radius = side === 'left' ? '16px 0 0 16px'
              : side === 'right' ? '0 16px 16px 0'
              : 16;
  const border = side ? '1px solid rgb(234,234,235)' : 'none';
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper onClick={onClick} style={{
      flex: 1,
      background: fill, color: PFC.ink,
      border, borderRadius: radius,
      padding: '20px 16px',
      display: 'flex', flexDirection: 'column', gap: 4,
      cursor: onClick ? 'pointer' : 'default',
      textAlign: 'left', appearance: 'none',
      minHeight: 80,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Body14 color={PFC.inkSoft} weight={700}>{label}</Body14>
        {withChevron && <LucideIcon name="ChevronRight" size={16} color={PFC.ink} strokeWidth={2} />}
      </div>
      <span style={{
        fontFamily: _font, fontWeight: 700,
        fontSize: large ? 28 : 20, lineHeight: large ? '36px' : '28px',
        letterSpacing: large ? '-0.007em' : '-0.003em',
        color: valueColor,
      }}>{value}</span>
    </Wrapper>
  );
}

// Side-by-side Quickview (figma's pattern — two cards sharing a border).
function Quickview({ left, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', borderRadius: 16 }}>
      <ValueCard {...left}  side="left"  />
      <ValueCard {...right} side="right" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section header — label + optional count badge + optional action.
// ─────────────────────────────────────────────────────────────
function SectionHeader({ title, count, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      paddingTop: 4, paddingBottom: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          fontFamily: _font, fontWeight: 600, fontSize: 22, lineHeight: '30px',
          letterSpacing: '-0.003em', color: PFC.ink,
        }}>{title}</span>
        {count != null && (
          <span style={{
            background: 'rgb(7,22,40)', color: '#fff', borderRadius: 999,
            fontFamily: _font, fontWeight: 700, fontSize: 14, lineHeight: '20px',
            minWidth: 24, padding: '0 8px', textAlign: 'center',
          }}>{count}</span>
        )}
      </div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ListRow — generic touchable row used in lists.
// ─────────────────────────────────────────────────────────────
function ListRow({ leading, title, subtitle, trailing, right, onClick, divider = true }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper onClick={onClick} style={{
      width: '100%', appearance: 'none', background: '#fff', border: 'none',
      borderTop: divider ? `1px solid ${PFC.border}` : 'none',
      padding: '16px 0',
      display: 'flex', alignItems: 'center', gap: 12,
      cursor: onClick ? 'pointer' : 'default', textAlign: 'left',
    }}>
      {leading}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Body16 color={PFC.ink}>{title}</Body16>
        {subtitle && <Body14 color={PFC.inkSoft} weight={500}>{subtitle}</Body14>}
      </div>
      {right && <div style={{ marginRight: 8 }}><Body16 color={PFC.ink}>{right}</Body16></div>}
      {trailing === undefined
        ? <LucideIcon name="ChevronRight" size={16} color={PFC.ink} strokeWidth={2} />
        : trailing}
    </Wrapper>
  );
}

// ─────────────────────────────────────────────────────────────
// Field — labeled input with optional validation message.
// ─────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, type = 'text', placeholder,
  suffix, error, helper, readOnly, leftAdornment,
}) {
  const hasErr = !!error;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {label && <Body14 color={PFC.ink} weight={600}>{label}</Body14>}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: hasErr ? PFC.errorBg : '#fff',
        border: `1px solid ${hasErr ? PFC.errorBorder : PFC.borderHard}`,
        borderRadius: 12, padding: '12px 16px', gap: 8,
      }}>
        {leftAdornment}
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: _font, fontWeight: 500, fontSize: 16, lineHeight: '24px',
            color: PFC.ink, minWidth: 0, padding: 0,
          }} />
        {suffix && (
          <span style={{
            fontFamily: _font, fontWeight: 700, fontSize: 14, color: PFC.inkSoft,
            letterSpacing: '0.05em',
          }}>{suffix}</span>
        )}
      </div>
      {(error || helper) && (
        <Body14 color={hasErr ? PFC.errorText : PFC.inkSoft} weight={500}>
          {error || helper}
        </Body14>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ScreenHeader — back button + screen title + optional trailing.
// Used at the top of every detail screen.
// ─────────────────────────────────────────────────────────────
function ScreenHeader({ title, trailing, large = false }) {
  return <NavBar title={large ? title : undefined} trailing={trailing} />;
}

// ─────────────────────────────────────────────────────────────
// Currency formatter — Belgian style (dot for thousands, comma for cents)
// ─────────────────────────────────────────────────────────────
function fmtEUR(n) {
  if (n == null || isNaN(n)) return '€0,00';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  const [int, frac = '00'] = abs.toFixed(2).split('.');
  const intGrouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}€${intGrouped},${frac}`;
}

// Filter pills (used by Transactions screen)
function FilterPill({ label, active, onClick }) {
  const blue = 'rgb(37,99,235)';
  return (
    <button onClick={onClick} className="pf-pressable" style={{
      appearance: 'none',
      background: active ? blue : '#fff',
      color: active ? '#fff' : PFC.ink,
      border: `1px solid ${active ? blue : PFC.borderHard}`,
      borderRadius: 8, padding: '6px 12px',
      fontFamily: _font, fontWeight: 700, fontSize: 14, lineHeight: '20px',
      cursor: 'pointer', flex: 'none',
      transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease',
    }}>{label}</button>
  );
}

// Export to global scope (separate Babel script scopes can't see locals).
Object.assign(window, {
  PFC, Heading28, Heading24, Heading20, Body16, Body14, Caption,
  Button, IconBtn, IconTile, GiftTile,
  StatusBadge, CardBox, ValueCard, Quickview, SectionHeader,
  ListRow, Field, ScreenHeader, fmtEUR, FilterPill,
});
