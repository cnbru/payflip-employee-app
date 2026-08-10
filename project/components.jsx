// Shared UI components for Payflip onboarding
// Pixel-faithful to Figma designs

// ─── Tokens ────────────────────────────────────────────────
const C = {
  white: '#FFFFFF',
  bg: '#FFFFFF',
  surface: '#F7F7F8',
  surfaceAlt: '#FAFAFA',
  border: '#EAEAEB',
  borderStrong: '#D9DADD',
  ink: '#0F0D28',
  inkDeep: '#1E1637',
  inkDarker: '#180B2D',
  text: '#0F0D28',
  textSecondary: '#50545E',
  textMuted: '#92939D',
  accent: '#D44A74',
  accentSoft: '#FCF0F4',
  accentSofter: '#F76DB64D',
  successBg: '#EBF9F1',
  successBgSoft: '#D6F3E2',
  successFg: '#086343',
  cardBg: '#180B2D',
  cardGlowBlue: 'rgba(61,133,232,0.20)',
  cardGlowPurple: 'rgba(212,97,229,0.18)',
  itsmeOrange: '#FF4612',
  itsmeBlue: '#00ABED',
  link: '#5353F6'
};

const FONT = `"Poppins", -apple-system, BlinkMacSystemFont, sans-serif`;
const FONT_INTER = `"Inter", -apple-system, BlinkMacSystemFont, sans-serif`;
const FONT_SF = `"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif`;

// ─── iOS-style status bar (light bg, dark icons) ────────────
function StatusBar({ time = '9:41', dark = false }) {
  const fg = dark ? '#fff' : '#000';
  return (
    <div style={{
      position: 'relative', width: '100%', height: 54, paddingTop: 6,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 32px 0', fontFamily: FONT_SF, fontWeight: 600,
      fontSize: 17, color: fg, flexShrink: 0
    }}>
      <div style={{ minWidth: 64, letterSpacing: -0.4 }}>{time}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* signal */}
        <svg width="18" height="11" viewBox="0 0 18 11" fill={fg}>
          <rect x="0" y="7" width="3" height="4" rx="0.5" />
          <rect x="5" y="5" width="3" height="6" rx="0.5" />
          <rect x="10" y="2.5" width="3" height="8.5" rx="0.5" />
          <rect x="15" y="0" width="3" height="11" rx="0.5" />
        </svg>
        {/* wifi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill={fg}>
          <path d="M8.5 0C5.4 0 2.6 1.1 0.4 2.9c-0.4 0.3-0.4 0.9-0.1 1.3l1 1.1c0.3 0.3 0.8 0.4 1.2 0.1C4.2 4 6.3 3.2 8.5 3.2s4.3 0.8 6 2.2c0.4 0.3 0.9 0.2 1.2-0.1l1-1.1c0.3-0.4 0.3-1-0.1-1.3C14.4 1.1 11.6 0 8.5 0z" opacity="0.4" />
          <path d="M8.5 4.2c-2 0-3.8 0.7-5.2 1.9-0.4 0.3-0.4 0.9-0.1 1.3l1 1.1c0.3 0.3 0.8 0.4 1.2 0.1 0.9-0.7 2-1.1 3.1-1.1s2.2 0.4 3.1 1.1c0.4 0.3 0.9 0.2 1.2-0.1l1-1.1c0.3-0.4 0.3-1-0.1-1.3C12.3 4.9 10.5 4.2 8.5 4.2z" opacity="0.7" />
          <path d="M8.5 8.1c-0.9 0-1.6 0.4-2.1 1-0.3 0.4-0.3 1 0.1 1.3l1.4 1.5c0.3 0.3 0.8 0.3 1.1 0l1.4-1.5c0.4-0.3 0.4-0.9 0.1-1.3C10 8.5 9.4 8.1 8.5 8.1z" />
        </svg>
        {/* battery */}
        <svg width="27" height="12" viewBox="0 0 27 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke={fg} strokeOpacity="0.35" />
          <rect x="2" y="2" width="19" height="8" rx="1.5" fill={fg} />
          <rect x="23.5" y="4" width="1.5" height="4" rx="0.5" fill={fg} opacity="0.4" />
        </svg>
      </div>
    </div>);

}

// ─── Buttons ──────────────────────────────────────────────
function PrimaryButton({ children, onClick, disabled, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', height: 48, borderRadius: 8, border: 'none',
      backgroundColor: disabled ? '#E5E5E8' : C.accent,
      color: disabled ? '#92939D' : '#fff',
      fontFamily: FONT, fontWeight: 500, fontSize: 14,
      letterSpacing: '-0.005em',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 0.15s, transform 0.08s',
      ...style
    }}
    onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.98)')}
    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
      {children}</button>);

}

function SecondaryButton({ children, onClick, style = {} }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', height: 48, borderRadius: 8,
      border: `1px solid ${C.border}`,
      backgroundColor: '#fff', color: C.ink,
      fontFamily: FONT, fontWeight: 500, fontSize: 14,
      letterSpacing: '-0.005em', cursor: 'pointer',
      transition: 'background 0.15s, transform 0.08s',
      ...style
    }}
    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
      {children}</button>);

}

// ─── Lucide-style icons (matching Figma stroke=2, size=20) ─
function Icon({ name, size = 20, color = C.ink, strokeWidth = 2 }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'check':
      return <svg {...props}><polyline points="20 6 9 17 4 12" /></svg>;
    case 'scan-face':
      return <svg {...props}>
        <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" /><path d="M9 9h.01" /><path d="M15 9h.01" />
      </svg>;
    case 'credit-card':
      return <svg {...props}>
        <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
      </svg>;
    case 'eye':
      return <svg {...props}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
      </svg>;
    case 'eye-off':
      return <svg {...props}>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
      </svg>;
    case 'settings':
      return <svg {...props}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>;
    case 'activity':
      return <svg {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>;
    case 'circle-user':
      return <svg {...props}>
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" />
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
      </svg>;
    case 'user-check':
      return <svg {...props}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" />
      </svg>;
    case 'arrow-left':
      return <svg {...props}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>;
    case 'x':
      return <svg {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
    case 'search':
      return <svg {...props}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>;
    case 'chevron-right':
      return <svg {...props}><path d="m9 18 6-6-6-6" /></svg>;
    case 'tram':
      // Lucide "tram-front"
      return <svg {...props}>
        <rect width="16" height="16" x="4" y="3" rx="2" />
        <path d="M4 11h16" />
        <path d="M12 3v8" />
        <path d="m8 19-2 3" />
        <path d="m18 22-2-3" />
        <path d="M8 15h.01" />
        <path d="M16 15h.01" />
      </svg>;
    case 'train':
      // Lucide "train-front"
      return <svg {...props}>
        <path d="M8 3.1V7a4 4 0 0 0 8 0V3.1" />
        <path d="m9 15-1-1" />
        <path d="m15 15 1-1" />
        <path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z" />
        <path d="m8 19-2 3" />
        <path d="m16 19 2 3" />
      </svg>;
    case 'car':
      return <svg {...props}>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>;
    case 'scooter':
      // Lucide-ish e-scooter (use bike base)
      return <svg {...props}>
        <circle cx="6" cy="17" r="3" />
        <circle cx="19" cy="17" r="2" />
        <path d="M9 17h6l-3-9h2" />
        <path d="M14 6h2l1 3" />
      </svg>;
    case 'bike':
      return <svg {...props}>
        <circle cx="18.5" cy="17.5" r="3.5" />
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="15" cy="5" r="1" />
        <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
      </svg>;
    case 'bus':
      return <svg {...props}>
        <path d="M8 6v6" />
        <path d="M16 6v6" />
        <path d="M2 12h20" />
        <path d="M18 18h2a2 2 0 0 0 2-2v-7a5 5 0 0 0-5-5H7a5 5 0 0 0-5 5v7a2 2 0 0 0 2 2h2" />
        <circle cx="7" cy="18" r="2" />
        <path d="M9 18h6" />
        <circle cx="17" cy="18" r="2" />
      </svg>;
    case 'lock':
      return <svg {...props}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
    case 'bell':
      return <svg {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
    case 'shield':
      return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case 'log-out':
      return <svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>;
    case 'message-circle':
      return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
    case 'help-circle':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>;
    case 'file-text':
      return <svg {...props}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>;
    case 'euro':
      return <svg {...props}><path d="M4 10h12" /><path d="M4 14h12" /><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2" /></svg>;
    case 'globe':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg>;
    case 'external-link':
      return <svg {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" x2="21" y1="14" y2="3" /></svg>;
    case 'image':
      return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>;
    case 'camera':
      return <svg {...props}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;
    case 'file':
      return <svg {...props}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>;
    case 'id-card':
      return <svg {...props}><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4M14 14h2"/></svg>;
    case 'map-pin':
      return <svg {...props}><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
    case 'at-sign':
      return <svg {...props}><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>;
    default:
      return null;
  }
}

// ─── Stepper (Itsme → FaceID → Card) ───────────────────────
function Stepper({ step, skipped = [] }) {
  // step: 0=itsme active, 1=faceid active, 2=card active, 3=card done
  // skipped: array of step indices that were skipped — they stay 'pending' even when before the active step
  // states for each pip: 'pending'|'active'|'skipped'|'done'
  const stateFor = (i) => {
    if (skipped.includes(i)) return 'skipped';
    if (step === i) return 'active';
    if (step > i) return 'done';
    return 'pending';
  };
  const states = [stateFor(0), stateFor(1), stateFor(2)];

  const Pip = ({ state, icon, iconSrc, label }) => {
    const prevStateRef = React.useRef(state);
    const [popKey, setPopKey] = React.useState(0);
    const [checkKey, setCheckKey] = React.useState(0);
    React.useEffect(() => {
      const prev = prevStateRef.current;
      if (prev !== state) {
        if (state === 'active') setPopKey((k) => k + 1);
        if (state === 'done') setCheckKey((k) => k + 1);
        prevStateRef.current = state;
      }
    }, [state]);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 51 }}>
        <div
          key={`pip-${popKey}-${checkKey}`}
          style={{
            width: 51, height: 48, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background-color 0.45s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            backgroundColor: state === 'done' ? C.successBg : C.surface,
            animation: state === 'active' ? 'stepperPipPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' :
            state === 'done' ? 'stepperPipDone 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
            transformOrigin: 'center'
          }}>
          {state === 'done' ?
          <span key={`check-${checkKey}`} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'stepperCheckIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <Icon name="check" color={C.successFg} />
          </span> :

          iconSrc ? <img src={iconSrc} width={20} height={20} style={{
            opacity: state === 'active' ? 1 : 0.45,
            display: 'block',
            transition: 'opacity 0.4s ease'
          }} alt="" /> :
          <Icon name={icon} color={state === 'active' ? C.ink : C.textMuted} />}
        </div>
        <span style={{
          fontFamily: FONT, fontWeight: 500, fontSize: 14, lineHeight: '20px',
          letterSpacing: '-0.005em',
          color: state === 'skipped' ? C.textMuted : C.ink,
          textAlign: 'center',
          transition: 'color 0.3s ease'
        }}>{label}{state === 'skipped' && <><br /><span style={{ fontSize: 11, fontWeight: 400, color: C.textMuted }}>Skipped</span></>}</span>
      </div>);
  };

  // Animated connector line: a green fill expands left→right over the gray track
  const Connector = ({ left, right, x, width }) =>
  <div style={{
    position: 'absolute', left: x, top: 22, width, height: 4,
    backgroundColor: C.surface, overflow: 'hidden'
  }}>
      <div style={{
      position: 'absolute', left: 0, top: 0, height: '100%',
      width: left === 'done' ? '100%' : '0%',
      backgroundColor: C.successBg,
      transition: 'width 0.55s cubic-bezier(0.32, 0.72, 0, 1)'
    }} />
    </div>;


  return (
    <div style={{
      position: 'relative', width: 292, height: 80,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
    }}>
      <Connector left={states[0]} right={states[1]} x={51} width={70} />
      <Connector left={states[1]} right={states[2]} x={172} width={69} />
      <Pip state={states[0]} iconSrc="assets/itsme.png" label="Itsme" />
      <Pip state={states[1]} icon="scan-face" label="FaceID" />
      <Pip state={states[2]} icon="credit-card" label="Card" />
    </div>);

}

// ─── Payflip wordmark ──────────────────────────────────────
function PayflipMark({ width = 47.355, color = '#000' }) {
  const ratio = 24 / 47.355;
  return (
    <svg width={width} height={width * ratio} viewBox="0 0 47.355 24" fill="none" style={{ color, display: 'block' }}>
      <path d="M 6.202 0 C 8.669 0 10.8 2.78 11.799 6.806 C 12.164 6.281 12.566 5.769 13.005 5.274 C 17.774 -0.103 25.078 -1.413 29.319 2.349 C 30.761 3.627 31.662 5.328 32.037 7.227 C 34.654 2.383 37.901 -0.63 39.896 0.21 C 41.068 0.704 41.589 2.434 41.489 4.844 C 42.374 1.848 43.576 -0.055 44.746 0.043 C 46.662 0.205 47.766 5.676 47.212 12.263 C 46.658 18.85 44.655 24.06 42.738 23.898 C 40.822 23.737 39.718 18.266 40.272 11.679 C 40.299 11.369 40.328 11.062 40.36 10.759 C 40.046 11.765 39.67 12.802 39.229 13.85 C 36.479 20.381 32.319 24.863 29.938 23.86 C 28.714 23.345 28.2 21.478 28.362 18.898 C 23.593 24.274 16.291 25.582 12.05 21.821 C 11.52 21.351 11.063 20.824 10.678 20.251 C 9.549 22.523 7.962 23.939 6.202 23.939 C 2.777 23.939 0 18.58 0 11.97 C 0 5.359 2.777 0 6.202 0 Z" fill="currentColor" fillRule="nonzero" />
    </svg>);

}

// ─── Itsme logo (rounded square with white waveform) ────────
function ItsmeLogo({ size = 76, rounded = true }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: rounded ? size * 0.225 : 0,
      background: '#FF4612',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>
      <svg width={size * 0.66} height={size * 0.45} viewBox="0 0 50 34" fill="none">
        {/* simplified itsme waveform - dot + sine wave */}
        <circle cx="6" cy="6" r="4.2" fill="#fff" />
        <path d="M2 22 Q8 15 14 22 T26 22 T38 22 T48 22"
        stroke="#fff" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      </svg>
    </div>);

}

// ─── Form text input (matches Figma TypeTextValueStateDefault) ───
function TextField({ label, type = 'text', value, onChange, onFocus, onBlur, placeholder, focused, autoFocus, trailing, inputRef, disabled }) {
  const filled = value && value.length > 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
      <span style={{
        fontFamily: FONT, fontWeight: 500, fontSize: 12, lineHeight: '16px',
        letterSpacing: '-0.005em', color: C.textSecondary
      }}>{label}</span>
      <div style={{
        position: 'relative',
        height: 48, borderRadius: 8,
        backgroundColor: disabled ? '#F3F2F4' : '#fff',
        border: `1px solid ${disabled ? C.border : focused ? C.ink : filled ? C.borderStrong : C.border}`,
        transition: 'border-color 0.15s',
        display: 'flex', alignItems: 'center', padding: '0 16px',
        boxShadow: focused && !disabled ? `0 0 0 3px rgba(15,13,40,0.08)` : 'none',
        opacity: disabled ? 0.85 : 1,
      }}>
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          style={{
            flex: 1, height: '100%', border: 'none', outline: 'none',
            background: 'transparent', fontFamily: FONT, fontWeight: 500,
            fontSize: 14, color: disabled ? C.textSecondary : C.ink, letterSpacing: '-0.005em',
            padding: 0, minWidth: 0,
            cursor: disabled ? 'not-allowed' : 'text',
          }} />
        
        {trailing}
      </div>
    </div>);

}

// ─── Mastercard logo ───────────────────────────────────────
function MastercardLogo({ size = 36, opacity = 0.5 }) {
  return (
    <div style={{ position: 'relative', width: size * 1.6, height: size, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', left: 0, top: 0,
        width: size, height: size, borderRadius: '50%',
        background: `rgba(255,255,255,${opacity})`
      }} />
      <div style={{
        position: 'absolute', left: size * 0.6, top: 0,
        width: size, height: size, borderRadius: '50%',
        background: `rgba(255,255,255,${opacity})`
      }} />
    </div>);

}

// ─── Apple Wallet button (black with logo) ────────────────
function AppleWalletButton({ onClick, scale = 1 }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', height: 43, borderRadius: 8, border: 'none',
      backgroundColor: '#000', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '0 16px'
    }}>
      <img src="assets/applewallet.svg" width={37} height={27} alt="" style={{ display: 'block' }} />
      <span style={{
        fontFamily: FONT, fontWeight: 500, fontSize: 14, color: '#fff',
        letterSpacing: '-0.005em'
      }}>Add to Apple Wallet</span>
    </button>);

}

// ─── Toast (top-of-screen confirmation) ─────────────────────
function Toast({ message, icon, visible }) {
  return (
    <div style={{
      position: 'absolute', top: 64, left: '50%',
      transform: `translate(-50%, ${visible ? '0' : '-120%'})`,
      transition: 'transform 0.42s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s',
      opacity: visible ? 1 : 0,
      background: 'rgba(28,28,30,0.96)',
      color: '#fff',
      padding: '12px 18px',
      borderRadius: 999,
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: FONT, fontWeight: 500, fontSize: 14,
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      zIndex: 200, pointerEvents: 'none', whiteSpace: 'nowrap',
      maxWidth: '88%'
    }}>
      {icon || (
        <span style={{
          width: 20, height: 20, borderRadius: '50%', background: '#34C759',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5,6.5 5,9 9.5,3.5" /></svg>
        </span>
      )}
      <span>{message}</span>
    </div>);
}

// ─── Apple Wallet provisioning sheet (full PassKit flow) ─────
// Mocks what Apple Wallet renders after the PKAddPassButton is tapped:
// device picker → card config sheet → T&Cs → activating → success.
// No issuer-side interstitial — opens straight from the button.
function AppleWalletAddSheet({ open, onClose, onAdded, hasWatch = true, cardholderName = 'Bruno Coen', cardSuffix = '0488', cardDescription = 'Payflip Mobility Card' }) {
  // step: 'device' | 'config' | 'terms' | 'activating' | 'done'
  const [step, setStep] = React.useState('device');
  const [device, setDevice] = React.useState('iphone');
  const [enter, setEnter] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setStep(hasWatch ? 'device' : 'config');
      setDevice('iphone');
      requestAnimationFrame(() => setEnter(true));
    } else {
      setEnter(false);
    }
  }, [open, hasWatch]);

  // auto-advance from activating → done
  React.useEffect(() => {
    if (step !== 'activating') return;
    const t = setTimeout(() => setStep('done'), 1800);
    return () => clearTimeout(t);
  }, [step]);

  React.useEffect(() => {
    if (step !== 'done') return;
    const t = setTimeout(() => { onAdded && onAdded(); close(); }, 1400);
    return () => clearTimeout(t);
  }, [step]);

  const close = () => { setEnter(false); setTimeout(() => onClose && onClose(), 240); };

  if (!open) return null;

  const SF = FONT_SF;
  const sheetBg = '#F2F2F7';

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 50,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      pointerEvents: 'auto'
    }}>
      <div onClick={step === 'device' || step === 'config' || step === 'terms' ? close : undefined} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
        opacity: enter ? 1 : 0, transition: 'opacity 0.3s'
      }} />
      <div style={{
        position: 'relative', background: sheetBg,
        borderTopLeftRadius: 12, borderTopRightRadius: 12,
        transform: enter ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.36s cubic-bezier(0.32, 0.72, 0, 1)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '92%', overflow: 'hidden'
      }}>
        {/* Top bar with "Apple Pay" title — Apple's standard sheet chrome */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px 12px', borderBottom: '0.5px solid rgba(60,60,67,0.18)',
          background: '#F9F9F9'
        }}>
          <button onClick={close} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: SF, fontSize: 17, color: '#007AFF', minWidth: 60, textAlign: 'left'
          }}>Cancel</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Apple logo glyph */}
            <svg width="13" height="16" viewBox="0 0 14 17" fill="#000"><path d="M11.6 9.1c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-3-1.6-1.3-.1-2.5.7-3.1.7-.7 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2.1-1.5 2.5-.4 6.3 1 8.4.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.6.7 2.8.7 1.1 0 1.9-1 2.6-2 .8-1.2 1.1-2.3 1.1-2.4-.1 0-2.1-.8-2.5-3.1zM9.7 3.3c.6-.7 1-1.7.9-2.7-.8 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6.9.1 1.9-.5 2.5-1.2z"/></svg>
            <span style={{ fontFamily: SF, fontWeight: 600, fontSize: 17, color: '#000' }}>Pay</span>
          </div>
          <div style={{ minWidth: 60 }} />
        </div>

        {step === 'device' && <AWDevicePicker SF={SF} device={device} setDevice={setDevice} cardSuffix={cardSuffix} onContinue={() => setStep('config')} />}
        {step === 'config' && <AWCardConfig SF={SF} cardholderName={cardholderName} cardSuffix={cardSuffix} cardDescription={cardDescription} device={hasWatch ? device : 'iphone'} onNext={() => setStep('terms')} onBack={hasWatch ? () => setStep('device') : null} />}
        {step === 'terms' && <AWTerms SF={SF} onAgree={() => setStep('activating')} onDisagree={close} />}
        {step === 'activating' && <AWActivating SF={SF} />}
        {step === 'done' && <AWDone SF={SF} cardSuffix={cardSuffix} />}
      </div>
    </div>);
}

// ─── Step: device picker (iPhone / Apple Watch / Both) ───
function AWDevicePicker({ SF, device, setDevice, cardSuffix, onContinue }) {
  const Row = ({ id, label, sub, icon }) =>
    <button onClick={() => setDevice(id)} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px', background: '#fff', border: 'none', cursor: 'pointer',
      borderBottom: '0.5px solid rgba(60,60,67,0.18)', textAlign: 'left'
    }}>
      <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#007AFF' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: SF, fontSize: 17, color: '#000' }}>{label}</div>
        <div style={{ fontFamily: SF, fontSize: 13, color: 'rgba(60,60,67,0.6)', marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        border: device === id ? 'none' : '1.5px solid rgba(60,60,67,0.3)',
        background: device === id ? '#007AFF' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {device === id && <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="2.5,6.5 5,9 9.5,3.5" /></svg>}
      </div>
    </button>;

  return (
    <>
      <div style={{ padding: '32px 24px 22px', textAlign: 'center' }}>
        <div style={{ fontFamily: SF, fontWeight: 700, fontSize: 22, color: '#000', letterSpacing: '-0.005em' }}>Add Card to</div>
        <div style={{ fontFamily: SF, fontSize: 14, color: 'rgba(60,60,67,0.7)', marginTop: 6 }}>Choose where to add this card.</div>
      </div>
      <div style={{ borderTop: '0.5px solid rgba(60,60,67,0.18)' }}>
        <Row id="iphone" label="iPhone" sub={`Add card ending in ${cardSuffix} to this iPhone.`} icon={<svg width="20" height="28" viewBox="0 0 20 28" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="1" y="1" width="18" height="26" rx="3" /><line x1="8" y1="24" x2="12" y2="24" /></svg>} />
        <Row id="watch" label="Apple Watch" sub={`Add card ending in ${cardSuffix} to your Apple Watch.`} icon={<svg width="20" height="28" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="6" width="14" height="16" rx="3" /><path d="M8 6 L9 2 L15 2 L16 6" /><path d="M8 22 L9 26 L15 26 L16 22" /></svg>} />
        <Row id="both" label="iPhone & Apple Watch" sub="Add to both devices." icon={<svg width="26" height="22" viewBox="0 0 30 22" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="1" y="1" width="14" height="20" rx="2.4" /><rect x="18" y="5" width="11" height="13" rx="2.4" /></svg>} />
      </div>
      <div style={{ padding: '24px 16px 28px', marginTop: 'auto' }}>
        <button onClick={onContinue} style={{
          width: '100%', height: 50, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: '#000', color: '#fff', fontFamily: SF, fontWeight: 500, fontSize: 17
        }}>Continue</button>
      </div>
    </>);
}

// ─── Step: card config (cardholder, last 4, description) ───
function AWCardConfig({ SF, cardholderName, cardSuffix, cardDescription, device, onNext, onBack }) {
  const deviceLabel = device === 'watch' ? 'Apple Watch' : device === 'both' ? 'iPhone & Apple Watch' : 'iPhone';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 480, overflow: 'auto' }}>
      <div style={{ padding: '24px 24px 20px', textAlign: 'center' }}>
        <div style={{ fontFamily: SF, fontWeight: 700, fontSize: 22, color: '#000', letterSpacing: '-0.005em' }}>Add Card</div>
        <div style={{ fontFamily: SF, fontSize: 13, color: 'rgba(60,60,67,0.7)', marginTop: 6, lineHeight: '18px', maxWidth: 280, margin: '6px auto 0' }}>
          Use your camera to enter the card number, or enter card details manually.
        </div>
      </div>

      {/* Mini card preview */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 24px 18px' }}>
        <PayflipCard width={220} height={138} />
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontFamily: SF, fontSize: 13, color: 'rgba(60,60,67,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 4px' }}>Card Details</div>
        <div style={{ background: '#fff', borderRadius: 10, overflow: 'hidden' }}>
          <AWDetailRow SF={SF} label="Name" value={cardholderName} />
          <AWDetailRow SF={SF} label="Card Number" value={`•••• •••• •••• ${cardSuffix}`} />
          <AWDetailRow SF={SF} label="Description" value={cardDescription} last />
        </div>
        <div style={{ fontFamily: SF, fontSize: 13, color: 'rgba(60,60,67,0.7)', padding: '0 4px', lineHeight: '18px' }}>
          Adding to {deviceLabel}.
        </div>
      </div>

      <div style={{ padding: '24px 16px 28px', marginTop: 'auto' }}>
        <button onClick={onNext} style={{
          width: '100%', height: 50, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: '#000', color: '#fff', fontFamily: SF, fontWeight: 500, fontSize: 17
        }}>Next</button>
        {onBack && <button onClick={onBack} style={{
          width: '100%', height: 44, marginTop: 6, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'transparent', color: '#007AFF', fontFamily: SF, fontSize: 17
        }}>Back</button>}
      </div>
    </div>);
}

function AWDetailRow({ SF, label, value, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderBottom: last ? 'none' : '0.5px solid rgba(60,60,67,0.18)',
      gap: 12
    }}>
      <span style={{ fontFamily: SF, fontSize: 17, color: '#000' }}>{label}</span>
      <span style={{ fontFamily: SF, fontSize: 17, color: 'rgba(60,60,67,0.7)', textAlign: 'right' }}>{value}</span>
    </div>);
}

// ─── Step: T&Cs ───
function AWTerms({ SF, onAgree, onDisagree }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 480 }}>
      <div style={{ padding: '20px 24px 12px', textAlign: 'center' }}>
        <div style={{ fontFamily: SF, fontWeight: 700, fontSize: 20, color: '#000' }}>Terms and Conditions</div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 20px 16px' }}>
        <div style={{ background: '#fff', borderRadius: 10, padding: '16px 18px', fontFamily: SF, fontSize: 14, color: 'rgba(60,60,67,0.85)', lineHeight: '20px' }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#000', marginBottom: 8 }}>Payflip Mobility Card — Apple Pay</div>
          <p style={{ margin: '0 0 10px' }}>By adding your Payflip Mobility Card to Apple Wallet, you agree to use it in accordance with the Payflip Cardholder Agreement and the terms below.</p>
          <p style={{ margin: '0 0 10px' }}>Your card details are securely tokenised and stored on this device. Apple does not retain or share transaction details that can be tied back to you.</p>
          <p style={{ margin: '0 0 10px' }}>You are responsible for transactions made with this device. If your device is lost or stolen, contact Payflip immediately to suspend the card.</p>
          <p style={{ margin: 0, color: 'rgba(60,60,67,0.6)' }}>For full terms, visit payflip.com/terms.</p>
        </div>
      </div>
      <div style={{ padding: '12px 16px 28px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={onAgree} style={{
          width: '100%', height: 50, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: '#000', color: '#fff', fontFamily: SF, fontWeight: 500, fontSize: 17
        }}>Agree</button>
        <button onClick={onDisagree} style={{
          width: '100%', height: 44, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'transparent', color: '#007AFF', fontFamily: SF, fontSize: 17
        }}>Disagree</button>
      </div>
    </div>);
}

// ─── Step: activating spinner ───
function AWActivating({ SF }) {
  return (
    <div style={{ minHeight: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '40px 32px' }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '3px solid rgba(60,60,67,0.18)', borderTopColor: '#000',
        animation: 'aw-spin 0.9s linear infinite'
      }} />
      <div style={{ fontFamily: SF, fontWeight: 600, fontSize: 17, color: '#000' }}>Setting up Apple Pay…</div>
      <div style={{ fontFamily: SF, fontSize: 14, color: 'rgba(60,60,67,0.7)', textAlign: 'center', maxWidth: 260, lineHeight: '20px' }}>
        Contacting Payflip to activate this card on your device.
      </div>
      <style>{`@keyframes aw-spin { to { transform: rotate(360deg); } }`}</style>
    </div>);
}

// ─── Step: success ───
function AWDone({ SF, cardSuffix }) {
  return (
    <div style={{ minHeight: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '40px 32px' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', background: '#34C759',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'aw-pop 0.45s cubic-bezier(0.32,1.4,0.5,1)'
      }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="7,17 13,23 25,10" /></svg>
      </div>
      <div style={{ fontFamily: SF, fontWeight: 700, fontSize: 22, color: '#000' }}>Card Added</div>
      <div style={{ fontFamily: SF, fontSize: 14, color: 'rgba(60,60,67,0.7)', textAlign: 'center', maxWidth: 280, lineHeight: '20px' }}>
        Payflip Mobility Card (•••• {cardSuffix}) is ready to use with Apple Pay.
      </div>
      <style>{`@keyframes aw-pop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }`}</style>
    </div>);
}

// ─── Payflip card (the visual centerpiece) ──────────────────
function PayflipCard({ width = 350, height = 220, scale = 1, frozen = false, physical = false }) {
  const s = width / 350;
  return (
    <div style={{
      position: 'relative',
      width, height, overflow: 'hidden',
      borderRadius: 16 * s,
      backgroundColor: C.cardBg,
      boxShadow: `0 ${6 * s}px ${20 * s}px rgba(0,0,0,0.20), 0 ${4 * s}px ${12 * s}px rgba(110,51,199,0.15)`,
      flexShrink: 0
    }}>
      {/* glow circle bottom-left (blue) */}
      <div style={{
        position: 'absolute', left: -50 * s, top: 60 * s,
        width: 220 * s, height: 220 * s, borderRadius: '50%',
        backgroundColor: C.cardGlowBlue
      }} />
      {/* glow circle top-right (purple) */}
      <div style={{
        position: 'absolute', left: 200 * s, top: -60 * s,
        width: 180 * s, height: 180 * s, borderRadius: '50%',
        backgroundColor: C.cardGlowPurple
      }} />
      {/* payflip wordmark (top right) */}
      <div style={{ position: 'absolute', left: 288 * s, top: 16 * s, opacity: 0.6 }}>
        <span style={{
          fontFamily: FONT_INTER, fontWeight: 700, fontSize: 14 * s,
          color: '#F2F0FF', letterSpacing: 0
        }}>payflip</span>
      </div>
      {/* gold chip */}
      <div style={{
        position: 'absolute', left: 24 * s, top: 80 * s,
        width: 32 * s, height: 24 * s, borderRadius: 4 * s,
        background: 'linear-gradient(180deg, #D1BF8C 0%, #F2E5BF 50%, #B8A673 100%)'
      }} />
      {/* sim notch right edge */}
      <div style={{
        position: 'absolute', left: 346 * s, top: 75 * s,
        width: 4 * s, height: 44 * s,
        borderRadius: `${2 * s}px 0 0 ${2 * s}px`,
        backgroundColor: 'rgba(255,255,255,0.08)'
      }} />
      {/* mastercard logo bottom-right */}
      <div style={{ position: 'absolute', left: 270 * s, top: 168 * s, transform: `scale(${s})`, transformOrigin: 'top left' }}>
        <MastercardLogo size={36} />
      </div>
      {/* virtual / active badges */}
      <div style={{
        position: 'absolute', left: 24 * s, top: 173 * s,
        display: 'flex', flexDirection: 'row', gap: 8 * s
      }}>
        <div style={{
          height: 26 * s, borderRadius: 6 * s, backgroundColor: C.surface,
          border: `1px solid ${C.borderStrong}`,
          padding: `${5 * s}px ${8 * s}px`,
          fontFamily: FONT, fontWeight: 500, fontSize: 12 * s, lineHeight: `${16 * s}px`,
          letterSpacing: '-0.005em', color: C.ink, whiteSpace: 'nowrap'
        }}>{physical ? 'Virtual + Physical' : 'Virtual Card'}</div>
        <div style={{
          height: 26 * s, borderRadius: 6 * s, backgroundColor: C.successBg,
          border: `1px solid ${C.successBgSoft}`,
          padding: `${5 * s}px ${6 * s}px`,
          fontFamily: FONT, fontWeight: 500, fontSize: 12 * s, lineHeight: `${16 * s}px`,
          letterSpacing: '-0.005em', color: C.successFg, whiteSpace: 'nowrap'
        }}>{frozen ? 'Frozen' : 'Active'}</div>
      </div>
      {/* Frozen overlay */}
      {frozen &&
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(200,220,240,0.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.3s'
      }}>
          <svg width={48 * s} height={48 * s} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
          </svg>
        </div>
      }
    </div>);

}

// ─── Belgian mobility transactions ─────────────────────────
// Real merchants the user might see in Brussels / Belgium when
// using a mobility-budget card. Curated, plausible amounts.
const BE_MOBILITY_TX = [
{
  brand: 'STIB-MIVB', icon: 'tram',
  category: 'Public transport', label: 'Brussels metro & bus',
  amount: -2.60, when: 'Today, 18:42', city: 'Brussels'
},
{
  brand: 'SNCB-NMBS', icon: 'train',
  category: 'Train', label: 'Brussels → Antwerp',
  amount: -8.40, when: 'Today, 08:14', city: 'Belgium'
},
{
  brand: 'Bolt', icon: 'car',
  category: 'Ride', label: 'Schuman → Sablon',
  amount: -9.20, when: 'Yesterday, 22:08', city: 'Brussels'
},
{
  brand: 'Cambio', icon: 'car',
  category: 'Car-sharing', label: 'Trip — 2h 15m',
  amount: -23.50, when: 'Yesterday, 14:30', city: 'Brussels'
},
{
  brand: 'De Lijn', icon: 'tram',
  category: 'Public transport', label: 'Antwerp tram',
  amount: -2.50, when: 'Mon, 09:02', city: 'Antwerp'
},
{
  brand: 'Lime', icon: 'scooter',
  category: 'E-scooter', label: '12 min ride',
  amount: -4.80, when: 'Mon, 18:55', city: 'Brussels'
},
{
  brand: 'Poppy', icon: 'car',
  category: 'Car-sharing', label: 'Hire — 45m',
  amount: -14.90, when: 'Sun, 11:23', city: 'Brussels'
},
{
  brand: 'Blue-bike', icon: 'bike',
  category: 'Bike rental', label: 'Day rental',
  amount: -3.50, when: 'Sat, 10:12', city: 'Ghent'
},
{
  brand: 'TEC', icon: 'bus',
  category: 'Public transport', label: 'Wallonia bus',
  amount: -2.30, when: 'Fri, 17:48', city: 'Liège'
},
{
  brand: 'Dott', icon: 'bike',
  category: 'E-bike', label: '8 min ride',
  amount: -3.10, when: 'Thu, 19:34', city: 'Brussels'
}];


// Group by day section
function groupByDay(items) {
  const groups = {};
  const order = [];
  items.forEach((t) => {
    const day = (t.when.split(',')[0] || 'Earlier').trim();
    if (!groups[day]) {groups[day] = [];order.push(day);}
    groups[day].push(t);
  });
  return order.map((d) => ({ day: d, items: groups[d] }));
}

function MerchantAvatar({ icon, size = 38 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: C.surface, color: C.ink,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon name={icon || 'activity'} size={size >= 38 ? 18 : 15} color={C.ink} strokeWidth={1.8} />
    </div>);

}

function TransactionRow({ tx, onClick }) {
  const negative = tx.amount < 0;
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '12px 4px',
      background: 'transparent', border: 'none',
      display: 'flex', alignItems: 'center', gap: 12,
      cursor: 'pointer', textAlign: 'left'
    }}>
      <MerchantAvatar icon={tx.icon} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{
          fontFamily: FONT, fontWeight: 600, fontSize: 14, lineHeight: '20px',
          color: C.inkDeep, letterSpacing: '-0.005em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>{tx.brand}</span>
        <span style={{
          fontFamily: FONT, fontSize: 12, lineHeight: '16px', color: C.textMuted,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>{tx.category} · {tx.label}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
        <span style={{
          fontFamily: FONT, fontWeight: 600, fontSize: 14, lineHeight: '20px',
          color: negative ? C.inkDeep : '#1F8A4C', letterSpacing: '-0.005em',
          fontVariantNumeric: 'tabular-nums'
        }}>{negative ? '−' : '+'}€{Math.abs(tx.amount).toFixed(2)}</span>
        <span style={{
          fontFamily: FONT, fontSize: 11, lineHeight: '14px', color: C.textMuted
        }}>{tx.when.split(',')[1]?.trim() || ''}</span>
      </div>
    </button>);

}

function TransactionsList({ transactions = BE_MOBILITY_TX, limit, showDayHeaders = true }) {
  const items = typeof limit === 'number' ? transactions.slice(0, limit) : transactions;
  const groups = groupByDay(items);
  return (
    <div style={{
      border: `1px solid ${C.border}`, borderRadius: 16, background: '#fff',
      padding: '8px 16px', display: 'flex', flexDirection: 'column'
    }}>
      {groups.map((g, gi) =>
      <div key={g.day}>
          {showDayHeaders &&
        <div style={{
          padding: '12px 0 6px',
          fontFamily: FONT, fontWeight: 600, fontSize: 12,
          color: C.textMuted, letterSpacing: '0.02em', textTransform: 'uppercase'
        }}>{g.day}</div>
        }
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {g.items.map((tx, i) =>
          <div key={i}>
                <TransactionRow tx={tx} />
                {i < g.items.length - 1 &&
            <div style={{ height: 1, background: C.border, marginLeft: 50 }} />
            }
              </div>
          )}
          </div>
        </div>
      )}
    </div>);

}

Object.assign(window, {
  C, FONT, FONT_INTER, FONT_SF,
  StatusBar, PrimaryButton, SecondaryButton, Icon,
  Stepper, PayflipMark, ItsmeLogo, TextField,
  MastercardLogo, AppleWalletButton, AppleWalletAddSheet, Toast, PayflipCard,
  TransactionsList, TransactionRow, MerchantAvatar, groupByDay, BE_MOBILITY_TX
});
