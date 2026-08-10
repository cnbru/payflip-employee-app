// Screens for Payflip onboarding flow — itsme login version
const SCREEN_W = 390;
const SCREEN_H = 844;

// ─────────────────────────────────────────────────────────
// 0. SPLASH — logo+wordmark in the SAME spot as login screen.
// Built as a structural mirror of LoginScreen so the logo
// position is identical; only the SSO buttons slot is empty.
// ─────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  React.useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: '#FFFFFF',
      animation: 'splashFadeOut 0.45s ease 1.05s forwards',
      zIndex: 200, pointerEvents: 'none',
      display: 'flex', flexDirection: 'column'
    }}>
      <StatusBar />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '0 24px', justifyContent: 'center', alignItems: 'center',
        position: 'relative', zIndex: 1
      }}>
        {/* Mirror of login's logo block */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
          opacity: 0,
          animation: 'splashLogoIn 0.6s cubic-bezier(0.2, 0.7, 0.3, 1) 0.05s forwards'
        }}>
          <img src={window.__resources.payflipLogo} alt="Payflip" style={{ width: 80, height: 'auto' }} />
          <span style={{
            fontFamily: '"Studio Feixen Sans", sans-serif', fontWeight: 600, fontSize: 36,
            color: '#220A35', letterSpacing: '-0.02em', lineHeight: 1
          }}>payflip</span>
        </div>
        {/* Reserve same vertical space as login's SSO buttons (4 rows × 50 + 3 × 16 gap + 24 pb = 272) */}
        <div style={{
          width: '100%', height: 272, flexShrink: 0
        }} />
      </div>
    </div>);

}


// ─────────────────────────────────────────────────────────
function LoginScreen({ send, splashing }) {
  return (
    <ScreenShell>
      <StatusBar />
      {/* Soft pink/blue gradient blobs in bg — fade in after splash */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
        opacity: splashing ? 0 : 1,
        transition: 'opacity 0.7s ease'
      }}>
        <div style={{
          position: 'absolute', left: 100, top: -100,
          width: 500, height: 500, opacity: 0.5, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(247,109,182,0.3) 0%, rgba(255,33,117,0) 70%)'
        }} />
        <div style={{
          position: 'absolute', left: 80, top: 250,
          width: 360, height: 360, opacity: 0.5, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(86,198,232,0.35) 0%, rgba(85,108,249,0) 70%)'
        }} />
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '0 24px', justifyContent: 'center', alignItems: 'center',
        position: 'relative', zIndex: 1
      }}>
        {/* Logo (centered, large) — always present, never moves */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12
        }}>
          <img src={window.__resources.payflipLogo} alt="Payflip" style={{
            width: 80, height: 'auto',
            animation: 'splashLogoIn 0.6s ease 0.05s both'
          }} />
          <span style={{
            fontFamily: '"Studio Feixen Sans", sans-serif', fontWeight: 600, fontSize: 36,
            color: '#220A35', letterSpacing: '-0.02em', lineHeight: 1,
            animation: 'splashLogoIn 0.6s ease 0.15s both'
          }}>payflip</span>
        </div>

        {/* SSO + buttons — fade up after splash */}
        <div style={{
          width: '100%', display: 'flex', flexDirection: 'column', gap: 16,
          paddingBottom: 24,
          opacity: splashing ? 0 : 1,
          transform: splashing ? 'translateY(12px)' : 'translateY(0)',
          transition: 'opacity 0.55s ease, transform 0.55s cubic-bezier(0.2, 0.7, 0.3, 1)'
        }}>
          <PrimaryButton onClick={() => send('itsme-loading')}>Continue with itsme</PrimaryButton>

          <SSOButton onClick={() => send('email-signin')} icon={<EmailIcon />} label="Continue with email" />
          <SSOButton onClick={() => send('email-signin')} icon={<MicrosoftIcon />} label="Sign in with Microsoft" />
          <SSOButton onClick={() => send('email-signin')} icon={<GoogleIcon />} label="Sign in with Google" />


        </div>
      </div>
    </ScreenShell>);

}

function PayflipWordmark({ width = 221 }) {
  // Pink/magenta circle "payflip" wordmark
  const h = width * (46 / 221.365);
  return (
    <div style={{ position: 'relative', width, height: h, display: 'flex', alignItems: 'center', gap: width * 0.06 }}>
      {/* Circle p with gradient */}
      <div style={{
        width: h, height: h, borderRadius: '50%', flexShrink: 0,
        background: 'rgb(34,10,53)', position: 'relative', overflow: 'hidden'
      }}>
        {/* Inner pink gradient stripe */}
        <div style={{
          position: 'absolute', left: '30%', top: '17%',
          width: '46%', height: '64%',
          background: 'linear-gradient(180deg, #F9C5E7 0%, #FAB4DB 15%, #FB86BC 44%, #FE3E89 85%, #FF2175 100%)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', left: '34%', top: '32%',
          width: '14%', height: '50%',
          background: 'linear-gradient(180deg, #FF2175 0%, #FE287B 20%, #F95AA6 70%, #F76DB6 100%)'
        }} />
      </div>
      {/* "payflip" text */}
      <span style={{
        fontFamily: FONT, fontWeight: 700, fontSize: h * 0.78,
        color: '#220A35', letterSpacing: '-0.04em',
        lineHeight: 1
      }}>payflip</span>
    </div>);

}

function SSOButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', height: 40, borderRadius: 8,
      border: `1px solid ${C.border}`, background: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '8px 24px', cursor: 'pointer', position: 'relative',
      transition: 'transform 0.08s'
    }}
    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
      <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <span style={{
        fontFamily: FONT, fontWeight: 500, fontSize: 14,
        lineHeight: '20px', letterSpacing: '-0.005em', color: C.ink
      }}>{label}</span>
    </button>);

}

function ItsmeIcon({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.225,
      background: '#FF4612',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>
      <span style={{
        fontFamily: FONT, fontWeight: 700, fontSize: size * 0.42,
        color: '#fff', letterSpacing: -0.5, lineHeight: 1
      }}>its<br />me</span>
    </div>);

}
function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>);

}
function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 23 23">
      <rect x="0" y="0" width="11" height="11" fill="#F25022" />
      <rect x="12" y="0" width="11" height="11" fill="#7FBA00" />
      <rect x="0" y="12" width="11" height="11" fill="#00A4EF" />
      <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
    </svg>);

}
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.5 12.3c0-.85-.08-1.66-.22-2.45H12v4.65h5.9a5.07 5.07 0 0 1-2.18 3.32v2.77h3.52c2.06-1.9 3.26-4.7 3.26-8.29z" fill="#4285F4" />
      <path d="M12 23c2.94 0 5.4-.98 7.2-2.65l-3.52-2.77c-.97.65-2.22 1.04-3.68 1.04-2.83 0-5.23-1.92-6.08-4.5H2.3v2.83A11 11 0 0 0 12 23z" fill="#34A853" />
      <path d="M5.92 14.12A6.6 6.6 0 0 1 5.55 12c0-.74.13-1.46.37-2.12V7.05H2.3A11.01 11.01 0 0 0 1 12c0 1.78.43 3.46 1.3 4.95l3.62-2.83z" fill="#FBBC04" />
      <path d="M12 5.4c1.6 0 3.04.55 4.18 1.62l3.12-3.12C17.4 2.13 14.94 1 12 1A11 11 0 0 0 2.3 7.05l3.62 2.83C6.77 7.32 9.17 5.4 12 5.4z" fill="#EA4335" />
    </svg>);

}

// ─────────────────────────────────────────────────────────
// 1b. EMAIL SIGN IN — email + password, then itsme verification
// ─────────────────────────────────────────────────────────
function EmailSignInScreen({ send }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [emailFocused, setEmailFocused] = React.useState(true);
  const [pwFocused, setPwFocused] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const showKeyboard = emailFocused || pwFocused;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwValid = password.length >= 4;
  const canSubmit = emailValid && pwValid && !submitting;

  const submit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => send('payflip-welcome'), 600);
  };

  return (
    <ScreenShell>
      <StatusBar />
      {/* Back button */}
      <div style={{ padding: '8px 12px', flexShrink: 0 }}>
        <button onClick={() => send('login')} style={{
          width: 40, height: 40, borderRadius: 8, border: 'none',
          background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon name="arrow-left" size={22} color={C.ink} />
        </button>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '0 24px', gap: 32
      }}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{
            fontFamily: FONT, fontWeight: 700, fontSize: 28, lineHeight: '38px',
            letterSpacing: '-0.005em', color: C.inkDeep
          }}>Sign in with email</span>
          <span style={{
            fontFamily: FONT, fontSize: 14, lineHeight: '20px',
            letterSpacing: '-0.005em', color: C.textSecondary
          }}>Use the email address your employer registered for you.</span>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            placeholder="you@company.com"
            focused={emailFocused}
            autoFocus />
          
          <TextField
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPwFocused(true)}
            onBlur={() => setPwFocused(false)}
            placeholder="At least 4 characters"
            focused={pwFocused}
            trailing={
            <button onClick={() => setShowPw((s) => !s)} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: 4, display: 'flex', alignItems: 'center'
            }}>
                <Icon name={showPw ? 'eye-off' : 'eye'} size={18} color={C.textSecondary} />
              </button>
            } />
          
          <a style={{
            fontFamily: FONT, fontWeight: 500, fontSize: 13, lineHeight: '18px',
            letterSpacing: '-0.005em', color: C.link,
            textDecoration: 'none', cursor: 'pointer', alignSelf: 'flex-start'
          }}>Forgot password?</a>
        </div>

        <div style={{ flex: 1 }} />

        {/* Submit */}
        <div style={{ paddingBottom: showKeyboard ? 8 : 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PrimaryButton onClick={submit} disabled={!canSubmit}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </PrimaryButton>
          {!showKeyboard && <span style={{
            fontFamily: FONT, fontSize: 12, lineHeight: '16px',
            letterSpacing: '-0.005em', color: C.textMuted, textAlign: 'center'
          }}>We'll verify your identity with itsme on the next step.</span>}
        </div>
      </div>
      {showKeyboard && <IOSKeyboard />}
    </ScreenShell>);

}

// ─────────────────────────────────────────────────────────
// 2. ITSME LOADING — appears as if iOS opened the itsme app
// ─────────────────────────────────────────────────────────
function ItsmeLoadingScreen({ send }) {
  React.useEffect(() => {
    const t = setTimeout(() => send('itsme-card'), 1300);
    return () => clearTimeout(t);
  }, []);
  return (
    <ScreenShell bg="#fff">
      <StatusBar />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 32
      }}>
        <ItsmeBadge size={108} />
        <Spinner color={C.itsmeOrange} />
      </div>
    </ScreenShell>);

}

function ItsmeBadge({ size = 76 }) {
  return (
    <img src={window.__resources.itsmePng} width={size} height={size} style={{
      display: 'block', objectFit: 'contain', flexShrink: 0
    }} alt="itsme" />);

}

// ─────────────────────────────────────────────────────────
// 3. ITSME LOGIN CARD (action card style — Apple Pay-like sheet)
// ─────────────────────────────────────────────────────────
function ItsmeCardScreen({ send, simulateItsmeFailure }) {
  const [faceIdActive, setFaceIdActive] = React.useState(false);
  const [faceIdDone, setFaceIdDone] = React.useState(false);

  const handleConfirm = () => {
    setFaceIdActive(true);
    setTimeout(() => setFaceIdDone(true), 1800);
    setTimeout(() => send(simulateItsmeFailure ? 'itsme-error' : 'itsme-success'), 2400);
  };

  return (
    <ScreenShell bg="#fff">
      <StatusBar />
      {/* Header section with itsme branding */}
      <div style={{
        background: '#fff', padding: '20px 24px 24px',
        display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <ItsmeBadge size={64} />
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{
            fontFamily: FONT_SF, fontWeight: 600, fontSize: 22, lineHeight: '28px',
            letterSpacing: '-0.5px', color: '#000'
          }}>Log in</span>
          <span style={{
            fontFamily: FONT_SF, fontSize: 15, lineHeight: '20px',
            letterSpacing: '-0.39px', color: 'rgba(60,60,67,0.6)'
          }}>Log in to Payflip app</span>
        </div>
      </div>

      {/* Detail sections */}
      <div style={{ flex: 1, padding: '0 0' }}>
        <DetailRow title="Info" value="Payflip secure login" />
        <DetailRow title="Shared ID data" value={'National Registration Number\nName\nDate of birth'} />
      </div>

      {/* Footer buttons (iOS style horizontal) */}
      <div style={{
        padding: '16px 16px 30px',
        display: 'flex', flexDirection: 'row', gap: 12,
        background: '#fff', borderTop: '1px solid rgba(0,0,0,0.06)'
      }}>
        <button onClick={() => send('login')} style={{
          flex: 1, height: 50, borderRadius: 12,
          background: 'rgba(0,0,0,0.06)', border: 'none',
          fontFamily: FONT_SF, fontWeight: 600, fontSize: 17,
          color: '#000', letterSpacing: -0.4, cursor: 'pointer'
        }}>Refuse</button>
        <button onClick={handleConfirm} style={{
          flex: 1, height: 50, borderRadius: 12,
          background: '#1A8E3F', border: 'none',
          fontFamily: FONT_SF, fontWeight: 700, fontSize: 17,
          color: '#fff', letterSpacing: -0.4, cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(26,142,63,0.3)'
        }}>Confirm</button>
      </div>

      {/* iOS Face ID overlay */}
      {faceIdActive && <IOSFaceIDOverlay done={faceIdDone} />}
    </ScreenShell>);

}
function DetailRow({ title, value }) {
  return (
    <div style={{
      padding: '16px 24px',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column', gap: 6
    }}>
      <span style={{
        fontFamily: FONT_SF, fontWeight: 600, fontSize: 13, lineHeight: '18px',
        letterSpacing: -0.08, color: 'rgba(60,60,67,0.6)',
        textTransform: 'uppercase'
      }}>{title}</span>
      <span style={{
        fontFamily: FONT_SF, fontSize: 16, lineHeight: '22px',
        letterSpacing: -0.4, color: '#000', whiteSpace: 'pre-line'
      }}>{value}</span>
    </div>);

}

// ─────────────────────────────────────────────────────────
// 4. ITSME FACE ID auth — full screen with Face ID prompt
// ─────────────────────────────────────────────────────────
function ItsmeFaceIdScreen({ send }) {
  const [phase, setPhase] = React.useState('scan');
  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase('done'), 1800);
    const t2 = setTimeout(() => send('itsme-success'), 2400);
    return () => {clearTimeout(t1);clearTimeout(t2);};
  }, []);

  return (
    <ScreenShell bg="#fff">
      <StatusBar />
      {/* Dimmed itsme card content behind */}
      <div style={{ opacity: 0.35, pointerEvents: 'none' }}>
        <div style={{
          background: '#fff', padding: '20px 24px 24px',
          display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center'
        }}>
          <ItsmeBadge size={64} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_SF, fontWeight: 600, fontSize: 22, color: '#000' }}>Log in</div>
            <div style={{ fontFamily: FONT_SF, fontSize: 15, color: 'rgba(60,60,67,0.6)' }}>Log in to Payflip app</div>
          </div>
        </div>
      </div>
      {/* iOS system-level Face ID overlay */}
      <IOSFaceIDOverlay done={phase === 'done'} />
    </ScreenShell>);

}

// ─────────────────────────────────────────────────────────
// 5. ITSME SUCCESS — green check, brief
// ─────────────────────────────────────────────────────────
function ItsmeSuccessScreen({ send }) {
  React.useEffect(() => {
    const t = setTimeout(() => send('faceid-prompt'), 1100);
    return () => clearTimeout(t);
  }, []);
  return (
    <ScreenShell bg="#fff">
      <StatusBar />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 24
      }}>
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          background: '#1A8E3F',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          boxShadow: '0 8px 24px rgba(26,142,63,0.3)'
        }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
          stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <span style={{
          fontFamily: FONT_SF, fontWeight: 600, fontSize: 22, color: '#000',
          letterSpacing: -0.4
        }}>Identity verified</span>
      </div>
    </ScreenShell>);

}

// ─────────────────────────────────────────────────────────
// 5b. ITSME ERROR — login failed (back inside Payflip after itsme handoff)
// ─────────────────────────────────────────────────────────
function ItsmeErrorScreen({ send }) {
  return (
    <ScreenShell bg="#fff">
      <StatusBar />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 24px 40px'
      }}>
        <div style={{ flex: 1 }} />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center'
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 36,
            background: '#FDECEC', display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'errorPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both'
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#C4322B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="8" x2="12" y2="13" />
              <circle cx="12" cy="17" r="0.6" fill="#C4322B" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
            <span style={{
              fontFamily: FONT, fontWeight: 700, fontSize: 22, lineHeight: '32px',
              letterSpacing: '-0.005em', color: C.inkDeep
            }}>Couldn't sign you in</span>
            <span style={{
              fontFamily: FONT, fontSize: 14, lineHeight: '20px',
              letterSpacing: '-0.005em', color: C.textSecondary
            }}>Something went wrong while verifying your identity with itsme. Please try again.</span>
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PrimaryButton onClick={() => send('itsme-loading')}>Try again</PrimaryButton>
          <SecondaryButton onClick={() => send('login')}>Back to sign in</SecondaryButton>
        </div>
      </div>
    </ScreenShell>);

}

// ─────────────────────────────────────────────────────────
// 6. PAYFLIP WELCOME — "Let's get your card ready" + stepper
// ─────────────────────────────────────────────────────────
function PayflipWelcomeScreen({ send }) {
  return (
    <ScreenShell>
      <StatusBar />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '40px 24px', alignItems: 'center'
      }}>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          gap: 64, alignItems: 'center', justifyContent: 'center',
          width: '100%'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
              <PayflipMark width={47.355} color="#000" />
              <span style={{
                fontFamily: FONT, fontSize: 14, lineHeight: '20px',
                letterSpacing: '-0.005em', color: C.textSecondary
              }}>WELCOME TO PAYFLIP</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <span style={{
                fontFamily: FONT, fontWeight: 700, fontSize: 36, lineHeight: '54px',
                letterSpacing: '-0.005em', color: C.inkDeep, textAlign: 'center', maxWidth: 320
              }}>Let's get your card ready</span>
              <span style={{
                fontFamily: FONT, fontSize: 16, lineHeight: '24px',
                letterSpacing: '-0.005em', color: C.textSecondary, textAlign: 'center',
                maxWidth: 320
              }}>Three quick steps and your mobility budget is ready to be spent.</span>
            </div>
          </div>

          {/* Stepper — itsme up next */}
          <Stepper step={0} />
        </div>

        <div style={{ width: '100%' }}>
          <PrimaryButton onClick={() => send('itsme-loading')}>Continue with itsme</PrimaryButton>
        </div>
      </div>
    </ScreenShell>);

}

// ─────────────────────────────────────────────────────────
// 7. FACE ID PROMPT
// ─────────────────────────────────────────────────────────
function FaceIdPromptScreen({ send }) {
  const [faceIdActive, setFaceIdActive] = React.useState(false);
  const [faceIdDone, setFaceIdDone] = React.useState(false);

  const handleEnable = () => {
    setFaceIdActive(true);
    setTimeout(() => setFaceIdDone(true), 2200);
    setTimeout(() => send('card-creating'), 3100);
  };

  return (
    <ScreenShell>
      <StatusBar />
      <div style={{
        padding: '24px 24px 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1
      }}>
        <Stepper step={1} />

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          width: '100%', gap: 16, marginTop: 32, padding: '0 16px'
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', textAlign: 'center', maxWidth: 320
          }}>
            <span style={{
              fontFamily: FONT, fontWeight: 700, fontSize: 24, lineHeight: '36px',
              letterSpacing: '-0.005em', color: C.inkDeep
            }}>Set up Face ID</span>
            <span style={{
              fontFamily: FONT, fontSize: 14, lineHeight: '20px',
              letterSpacing: '-0.005em', color: C.textSecondary
            }}>Approve payments quickly with Face ID.</span>
          </div>

          <div style={{
            marginTop: 24, padding: '40px 20px',
            background: '#FFFFFF', borderRadius: 16,
            display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center',
            width: '100%', maxWidth: 342
          }}>
            <img src={window.__resources.faceidSymbol} width={108} height={108} alt="Face ID" style={{ display: 'block' }} />
          </div>
        </div>

        <div style={{ width: '100%', paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PrimaryButton onClick={handleEnable}>Enable Face ID</PrimaryButton>
          <SecondaryButton onClick={() => send('card-creating', { skipFaceid: true })}>I'll do it later</SecondaryButton>
        </div>
      </div>

      {/* iOS Face ID overlay */}
      {faceIdActive && <IOSFaceIDOverlay done={faceIdDone} />}
    </ScreenShell>);

}

// ─────────────────────────────────────────────────────────
// 8. FACE ID SCAN
// ─────────────────────────────────────────────────────────
function FaceIdScanScreen({ send }) {
  const [phase, setPhase] = React.useState('scan');
  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase('success'), 2200);
    const t2 = setTimeout(() => send('card-creating'), 3100);
    return () => {clearTimeout(t1);clearTimeout(t2);};
  }, []);

  return (
    <ScreenShell>
      <StatusBar />
      <div style={{
        padding: '24px 24px 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1
      }}>
        <Stepper step={1} />

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          width: '100%', gap: 24, marginTop: 32
        }}>
          <div style={{
            width: 140, height: 140, borderRadius: 24,
            background: phase === 'success' ? C.successBg : C.surface,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
            transition: 'background 0.4s ease'
          }}>
            <FaceIdSymbol size={66} animated={false} done={phase === 'success'} />
          </div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 300 }}>
            <span style={{
              fontFamily: FONT, fontWeight: 700, fontSize: 22, lineHeight: '32px',
              letterSpacing: '-0.005em', color: C.inkDeep
            }}>{phase === 'success' ? 'Face ID enabled' : 'Look at your phone'}</span>
            <span style={{
              fontFamily: FONT, fontSize: 14, lineHeight: '20px',
              letterSpacing: '-0.005em', color: C.textSecondary
            }}>{phase === 'success' ? 'Biometrics set up successfully.' : 'Hold still while we capture your face.'}</span>
          </div>
        </div>
      </div>

      {/* iOS system-level Face ID overlay */}
      {phase === 'scan' && <IOSFaceIDOverlay />}
    </ScreenShell>);

}

// ─────────────────────────────────────────────────────────
// 9. CARD CREATING
// ─────────────────────────────────────────────────────────
function CardCreatingScreen({ send, faceidEnabled, simulateCardFailure }) {
  const [phase, setPhase] = React.useState('loading'); // 'loading' | 'error'
  const attemptId = React.useRef(0);

  const startAttempt = React.useCallback(() => {
    const id = ++attemptId.current;
    setPhase('loading');
    const t = setTimeout(() => {
      if (attemptId.current !== id) return;
      if (simulateCardFailure) {
        setPhase('error');
      } else {
        send('card-ready');
      }
    }, 5500);
    return () => clearTimeout(t);
  }, [simulateCardFailure, send]);

  React.useEffect(() => {
    const cleanup = startAttempt();
    return cleanup;
  }, [startAttempt]);

  const handleRetry = () => {
    // Retry: this attempt always succeeds (otherwise the user is stuck)
    const id = ++attemptId.current;
    setPhase('loading');
    setTimeout(() => {
      if (attemptId.current !== id) return;
      send('card-ready');
    }, 3500);
  };

  return (
    <ScreenShell>
      <StatusBar />
      <div style={{
        padding: '24px 24px 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1
      }}>
        <Stepper step={2} skipped={faceidEnabled ? [] : [1]} />

        {phase === 'loading' &&
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          width: '100%', gap: 24, marginTop: 32
        }}>
          {/* Animated card placeholder */}
          <div style={{
            width: 180, height: 113, borderRadius: 12,
            background: `linear-gradient(135deg, ${C.cardBg} 0%, #2D1A4E 100%)`,
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(24,11,45,0.3)',
            animation: 'breathe 2s ease-in-out infinite'
          }}>
            {/* Shimmer */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
              animation: 'shimmer 1.6s ease-in-out infinite'
            }} />
            {/* placeholder chip */}
            <div style={{
              position: 'absolute', left: 14, top: 42,
              width: 24, height: 18, borderRadius: 3,
              background: 'linear-gradient(180deg, #D1BF8C 0%, #F2E5BF 50%, #B8A673 100%)',
              opacity: 0.4
            }} />
          </div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 320 }}>
            <span style={{
              fontFamily: FONT, fontWeight: 700, fontSize: 22, lineHeight: '32px',
              letterSpacing: '-0.005em', color: C.inkDeep
            }}>Your virtual card is being created</span>
            <span style={{
              fontFamily: FONT, fontSize: 14, lineHeight: '20px',
              letterSpacing: '-0.005em', color: C.textSecondary
            }}>This can take up to 20 seconds</span>
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {[0, 1, 2].map((i) =>
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: C.accent,
              animation: `bounce 1.2s ease-in-out ${i * 0.18}s infinite`
            }} />
            )}
          </div>
        </div>
        }

        {phase === 'error' &&
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          width: '100%', paddingBottom: 40
        }}>
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 24, textAlign: 'center'
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: 36,
              background: '#FDECEC', display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'errorPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both'
            }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#C4322B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="8" x2="12" y2="13" />
                <circle cx="12" cy="17" r="0.6" fill="#C4322B" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
              <span style={{
                fontFamily: FONT, fontWeight: 700, fontSize: 22, lineHeight: '32px',
                letterSpacing: '-0.005em', color: C.inkDeep
              }}>Something went wrong</span>
              <span style={{
                fontFamily: FONT, fontSize: 14, lineHeight: '20px',
                letterSpacing: '-0.005em', color: C.textSecondary
              }}>We couldn't create your card right now. Please try again.</span>
            </div>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <PrimaryButton onClick={handleRetry}>Try again</PrimaryButton>
            <SecondaryButton onClick={() => send('home')}>Contact support</SecondaryButton>
          </div>
        </div>
        }
      </div>
    </ScreenShell>);

}

// ─────────────────────────────────────────────────────────
// 10. CARD READY
// ─────────────────────────────────────────────────────────
function CardReadyScreen({ send, walletAdded, setWalletAdded }) {
  const [walletSheet, setWalletSheet] = React.useState(false);
  const [phase, setPhase] = React.useState(0);
  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 700);
    return () => {clearTimeout(t1);clearTimeout(t2);};
  }, []);

  return (
    <ScreenShell>
      <StatusBar />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '40px 20px 24px', alignItems: 'center'
      }}>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          width: '100%', gap: "64px"
        }}>
          {/* Tilted card */}
          <div style={{
            width: 240, height: 152,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: phase >= 1 ? 'rotate(-7deg) scale(1)' : 'rotate(0deg) scale(0.85)',
            opacity: phase >= 1 ? 1 : 0,
            transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s'
          }}>
            <PayflipCard width={240} height={151} />
          </div>

          <div style={{
            textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 350,
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.45s cubic-bezier(0.32, 0.72, 0, 1)'
          }}>
            <span style={{
              fontFamily: FONT, fontWeight: 700, fontSize: 26, lineHeight: '36px',
              letterSpacing: '-0.005em', color: C.ink
            }}>Your card is ready</span>
            <span style={{
              fontFamily: FONT, fontSize: 16, lineHeight: '24px',
              letterSpacing: '-0.005em', color: C.textSecondary, padding: '0 8px'
            }}>Start spending your mobility budget anywhere Mastercard is accepted — no special terminals needed.</span>
          </div>
        </div>

        <div style={{
          width: '100%', display: 'flex', flexDirection: 'column', gap: 8,
          opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.5s cubic-bezier(0.32, 0.72, 0, 1) 0.1s'
        }}>
          {!walletAdded && <AppleWalletButton onClick={() => setWalletSheet(true)} />}
          {walletAdded ?
          <PrimaryButton onClick={() => send('home')}>Continue to home</PrimaryButton> :
          <SecondaryButton onClick={() => send('home')}>Continue to home</SecondaryButton>}
        </div>
        <AppleWalletAddSheet
          open={walletSheet}
          onClose={() => setWalletSheet(false)}
          onAdded={() => setWalletAdded(true)} />
        
      </div>
    </ScreenShell>);

}

// ─────────────────────────────────────────────────────────
// 11. HOME
// ─────────────────────────────────────────────────────────
function HomeScreen({ send, faceidEnabled, enableFaceid, walletAdded, setWalletAdded, showTransactions }) {
  const [walletSheet, setWalletSheet] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [frozen, setFrozen] = React.useState(false);
  const [hasPhysicalCard, setHasPhysicalCard] = React.useState(false);
  const [faceidPrompt, setFaceidPrompt] = React.useState(false);
  const [faceidScanning, setFaceidScanning] = React.useState(false);
  const [faceidScanDone, setFaceidScanDone] = React.useState(false);
  const [pinSheet, setPinSheet] = React.useState(false);
  const [cardDetailsSheet, setCardDetailsSheet] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState(null);
  const copyToClipboard = (label, value) => {
    if (navigator.clipboard) navigator.clipboard.writeText(value).catch(() => {});
    setCopiedField(label);
    setTimeout(() => setCopiedField((c) => c === label ? null : c), 1600);
  };
  const [pinPhase, setPinPhase] = React.useState('scan'); // 'scan' | 'reveal'
  const [pinTimer, setPinTimer] = React.useState(30);
  const [orderPhysicalOpen, setOrderPhysicalOpen] = React.useState(false);

  const requireFaceid = (action) => {
    if (!faceidEnabled) {
      setFaceidPrompt(true);
      return;
    }
    if (action === 'details') {
      runFaceidScan(() => setCardDetailsSheet(true));
    }
  };

  // Run the iOS Face ID overlay (pulsing → green check), then call cb
  const runFaceidScan = (cb) => {
    setFaceidScanDone(false);
    setFaceidScanning(true);
    setTimeout(() => setFaceidScanDone(true), 1400);
    setTimeout(() => {
      setFaceidScanning(false);
      setFaceidScanDone(false);
      cb && cb();
    }, 2000);
  };

  const openPinSheet = () => {
    setSheetOpen(false);
    if (!faceidEnabled) {
      setTimeout(() => setFaceidPrompt(true), 400);
      return;
    }
    // Face ID already enabled — show scan, then reveal PIN
    setTimeout(() => {
      runFaceidScan(() => {
        setPinPhase('reveal');
        setPinSheet(true);
        setPinTimer(30);
      });
    }, 400);
  };

  // PIN countdown timer
  React.useEffect(() => {
    if (pinSheet && pinPhase === 'reveal' && pinTimer > 0) {
      const t = setTimeout(() => setPinTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
    if (pinSheet && pinPhase === 'reveal' && pinTimer <= 0) {
      setPinSheet(false);
    }
  }, [pinSheet, pinPhase, pinTimer]);

  const doEnableFaceid = () => {
    setFaceidScanDone(false);
    setFaceidScanning(true);
    setTimeout(() => setFaceidScanDone(true), 1400);
    setTimeout(() => {
      setFaceidScanning(false);
      setFaceidScanDone(false);
      setFaceidPrompt(false);
      enableFaceid();
    }, 2000);
  };

  return (
    <ScreenShell>
      <StatusBar />
      <div style={{
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <PayflipMark width={47.355} color="#000" />
        <button style={{
          width: 36, height: 36, borderRadius: 8,
          border: `1px solid ${C.border}`, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer'
        }}>
          <Icon name="circle-user" size={18} color={C.ink} />
        </button>
      </div>

      <div className="hide-scrollbar" style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Face ID warning banner */}
        {!faceidEnabled &&
        <div onClick={() => setFaceidPrompt(true)} style={{
          margin: '0 16px 0', padding: '14px 16px',
          background: '#FFF8EB', border: '1px solid #F5DFA6',
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer'
        }}>
            <div style={{
            width: 36, height: 36, borderRadius: 8, background: '#FEF0CD',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" /><path d="M12 17h.01" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13, color: '#92600A', lineHeight: '18px' }}>Face ID required for payments</div>
              <div style={{ fontFamily: FONT, fontSize: 12, color: '#B8860B', lineHeight: '16px', marginTop: 2 }}>Tap here to enable Face ID now</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        }
        <div style={{
          background: C.surfaceAlt, padding: '24px 24px 16px',
          display: 'flex', flexDirection: 'column', gap: 16
        }}>
          <div>
            <div style={{
              fontFamily: FONT, fontSize: 14, lineHeight: '20px',
              color: C.textSecondary, letterSpacing: '0.02em'
            }}>MOBILITY BUDGET</div>
            <div style={{
              fontFamily: FONT, fontSize: 40, lineHeight: '60px',
              letterSpacing: '-0.005em', color: C.inkDeep, fontWeight: "600"
            }}>€26<span style={{ fontSize: 28 }}>.30</span></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
            <PayflipCard width={342} height={215} frozen={frozen} physical={hasPhysicalCard} />
          </div>

          <div style={{
            display: 'flex', height: 76, alignItems: 'center',
            border: `1px solid ${C.border}`, borderRadius: 8, background: '#fff'
          }}>
            <button onClick={() => requireFaceid('details')} style={{
              flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '8px 0'
            }}>
              <Icon name="eye" size={16} color={C.ink} />
              <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14, color: C.ink }}>View card details</span>
            </button>
            <div style={{ width: 1, height: 52, background: C.border }} />
            <button onClick={() => setSheetOpen(true)} style={{
              flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '8px 0'
            }}>
              <Icon name="settings" size={16} color={C.ink} />
              <span style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14, color: C.ink }}>Manage card</span>
            </button>
          </div>

            {!walletAdded && <AppleWalletButton onClick={() => setWalletSheet(true)} />}
        </div>

        <div style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontFamily: FONT, fontSize: 16, lineHeight: '24px',
              letterSpacing: '-0.005em', color: C.ink, fontWeight: "500"
            }}>Transactions</span>
            {showTransactions &&
            <button onClick={() => send('all-transactions')} style={{
              background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
              fontFamily: FONT, fontSize: 14, color: C.inkDeep, fontWeight: 600,
              textDecoration: 'underline', textUnderlineOffset: 3
            }}>View all</button>
            }
          </div>
          {showTransactions ?
          <TransactionsList limit={3} showDayHeaders={false} /> :

          <div style={{
            border: `1px solid ${C.border}`, borderRadius: 16, background: '#fff',
            padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'
          }}>
              <div style={{
              width: 38, height: 38, borderRadius: 8, background: '#F5F5F7',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon name="activity" size={16} color={C.ink} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', textAlign: 'center' }}>
                <span style={{
                fontFamily: FONT, fontWeight: 500, fontSize: 14, lineHeight: '20px',
                color: C.inkDeep
              }}>No transactions yet</span>
                <span style={{
                fontFamily: FONT, fontSize: 14, lineHeight: '20px',
                color: C.textMuted, maxWidth: 280
              }}>Use your card for public transport or shared mobility to see activity here.</span>
              </div>
            </div>
          }
        </div>
      </div>

      {/* Card Details Bottom Sheet (Face ID protected) */}
      {cardDetailsSheet &&
      <div style={{
        position: 'absolute', inset: 0, zIndex: 50
      }}>
          <div onClick={() => setCardDetailsSheet(false)} style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          animation: 'fadeIn 0.25s ease'
        }} />
          <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: '#fff', borderRadius: '16px 16px 0 0',
          padding: '0 0 24px',
          animation: 'sheetUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
        }}>
            {/* Drag handle + close */}
            <div style={{ position: 'relative', height: 56 }}>
              <div style={{
              width: 36, height: 5, borderRadius: 3, background: '#CCCCCC',
              position: 'absolute', top: 5, left: '50%', transform: 'translateX(-50%)'
            }} />
              <div onClick={() => setCardDetailsSheet(false)} style={{
              position: 'absolute', top: 16, left: 16,
              width: 44, height: 44, borderRadius: 22,
              background: 'rgba(120,120,128,0.16)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="#727272" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Detail rows */}
            {[
          { label: 'Name on card', value: 'Quentin Meeus' },
          { label: 'Card number', value: '5354 1023 4877 2941', display: '5354  1023  4877  2941' },
          { label: 'Expiry date', value: '08/28' },
          { label: 'CVC', value: '342' }].
          map((row, i) => {
            const isCopied = copiedField === row.label;
            return (
              <div key={row.label} style={{
                padding: '14px 24px',
                display: 'flex', alignItems: 'center', gap: 16,
                borderTop: i === 0 ? 'none' : 'none'
              }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{
                    fontFamily: FONT, fontSize: 13, lineHeight: '18px',
                    color: '#838791', letterSpacing: '-0.005em'
                  }}>{row.label}</div>
                    <div style={{
                    fontFamily: FONT, fontWeight: 500, fontSize: 17, lineHeight: '24px',
                    color: C.inkDeep, letterSpacing: row.label === 'Card number' ? '0.02em' : '-0.005em',
                    fontVariantNumeric: 'tabular-nums'
                  }}>{row.display || row.value}</div>
                  </div>
                  <div onClick={() => copyToClipboard(row.label, row.value)} style={{
                  width: 32, height: 32, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                  background: isCopied ? 'rgba(52,199,89,0.12)' : 'transparent',
                  transition: 'background 0.2s'
                }}>
                    {isCopied ?
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg> :

                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2.667 10.667c-.733 0-1.333-.6-1.333-1.334V2.667c0-.734.6-1.334 1.333-1.334h6.667c.733 0 1.333.6 1.333 1.334M6.667 5.333h6.666c.737 0 1.334.597 1.334 1.334v6.666c0 .737-.597 1.334-1.334 1.334H6.667c-.737 0-1.334-.597-1.334-1.334V6.667c0-.737.597-1.334 1.334-1.334Z"
                    stroke="#0F0D28" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                  }
                  </div>
                </div>);

          })}

            {/* Copy toast */}
            {copiedField &&
          <div style={{
            position: 'absolute', bottom: 16, left: '50%',
            transform: 'translateX(-50%)',
            background: '#0F0D28', color: '#fff',
            padding: '10px 16px', borderRadius: 999,
            fontFamily: FONT, fontWeight: 500, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 8,
            animation: 'fadeIn 0.2s ease',
            boxShadow: '0 6px 20px rgba(15,13,40,0.25)',
            whiteSpace: 'nowrap'
          }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {copiedField} copied
              </div>
          }
          </div>
        </div>
      }

      {/* Manage Card Bottom Sheet */}
      {sheetOpen &&
      <div style={{
        position: 'absolute', inset: 0, zIndex: 50
      }}>
          {/* Backdrop */}
          <div onClick={() => setSheetOpen(false)} style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          animation: 'fadeIn 0.25s ease'
        }} />
          {/* Sheet */}
          <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: '#fff', borderRadius: '20px 20px 0 0',
          padding: '12px 0 34px',
          animation: 'sheetUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
        }}>
            {/* Drag handle */}
            <div style={{
            width: 36, height: 5, borderRadius: 3, background: '#D9DADD',
            margin: '0 auto 16px'
          }} />

            {/* Freeze card */}
            <div style={{
            display: 'flex', alignItems: 'center', padding: '14px 24px', gap: 16,
            cursor: 'pointer'
          }}>
              <div style={{
              width: 40, height: 40, borderRadius: 10, background: C.surface,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink, lineHeight: '20px' }}>Freeze card temporarily</div>
                <div style={{ fontFamily: FONT, fontSize: 13, color: C.textSecondary, lineHeight: '18px' }}>Block all transactions</div>
              </div>
              {/* Toggle */}
              <div onClick={(e) => {e.stopPropagation();setFrozen((f) => !f);}} style={{
              width: 51, height: 31, borderRadius: 16, cursor: 'pointer',
              background: frozen ? '#34C759' : '#E5E5EA',
              transition: 'background 0.2s', position: 'relative', flexShrink: 0
            }}>
                <div style={{
                width: 27, height: 27, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2,
                left: frozen ? 22 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
              }} />
              </div>
            </div>

            {/* View PIN */}
            <div onClick={openPinSheet} style={{
            display: 'flex', alignItems: 'center', padding: '14px 24px', gap: 16,
            cursor: 'pointer'
          }}>
              <div style={{
              width: 40, height: 40, borderRadius: 10, background: C.surface,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
                <Icon name="eye" size={20} color={C.ink} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink, lineHeight: '20px' }}>View PIN</div>
                <div style={{ fontFamily: FONT, fontSize: 13, color: C.textSecondary, lineHeight: '18px' }}>Face ID required</div>
              </div>
            </div>

            {/* Order physical card / Replace card — depends on whether physical card exists */}
            {hasPhysicalCard ?
          <div onClick={() => setSheetOpen(false)} style={{
            display: 'flex', alignItems: 'center', padding: '14px 24px', gap: 16,
            cursor: 'pointer'
          }}>
                <div style={{
              width: 40, height: 40, borderRadius: 10, background: C.surface,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink, lineHeight: '20px' }}>Replace card</div>
                  <div style={{ fontFamily: FONT, fontSize: 13, color: C.textSecondary, lineHeight: '18px' }}>Lost, stolen or damaged</div>
                </div>
              </div> :

          <div onClick={() => {setSheetOpen(false);setTimeout(() => setOrderPhysicalOpen(true), 220);}} style={{
            display: 'flex', alignItems: 'center', padding: '14px 24px', gap: 16,
            cursor: 'pointer'
          }}>
                <div style={{
              width: 40, height: 40, borderRadius: 10, background: C.surface,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
                  {/* Truck / shipping icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                    <path d="M15 18H9" />
                    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                    <circle cx="17" cy="18" r="2" />
                    <circle cx="7" cy="18" r="2" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink, lineHeight: '20px' }}>Order physical card</div>
                  <div style={{ fontFamily: FONT, fontSize: 13, color: C.textSecondary, lineHeight: '18px' }}>Free delivery in 3–5 days</div>
                </div>
              </div>
          }

            {/* Report card fraud */}
            <div onClick={() => setSheetOpen(false)} style={{
            display: 'flex', alignItems: 'center', padding: '14px 24px', gap: 16,
            cursor: 'pointer', background: '#FFF5F5', marginTop: 4
          }}>
              <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#FEE8E8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D44A74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" /><path d="M12 17h.01" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.ink, lineHeight: '20px' }}>Report card fraud</div>
                <div style={{ fontFamily: FONT, fontSize: 13, color: C.textSecondary, lineHeight: '18px' }}>Card details might be compromised</div>
              </div>
            </div>
          </div>
        </div>
      }

      {/* PIN full-screen modal — slides up over Home */}
      {pinSheet &&
      <div style={{
        position: 'absolute', inset: 0, zIndex: 55,
        background: '#fff',
        animation: 'modalUp 0.42s cubic-bezier(0.32, 0.72, 0, 1)',
        display: 'flex', flexDirection: 'column'
      }}>
          <StatusBar />
          {/* Header — close button left, title centered */}
          <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 16px 8px', minHeight: 44, flexShrink: 0
        }}>
            <button onClick={() => setPinSheet(false)} style={{
            width: 32, height: 32, borderRadius: 16,
            background: 'rgba(0,0,0,0.06)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0
          }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2L12 12M12 2L2 12" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <span style={{
            fontFamily: FONT, fontWeight: 600, fontSize: 17, color: C.ink
          }}>Card PIN</span>
            <div style={{ width: 32 }} />
          </div>

          {/* Body */}
          <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', padding: '24px 24px 0'
        }}>
            {/* Lock icon hero */}
            <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: `${C.accent}14`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: 16, marginBottom: 24
          }}>
              <Icon name="lock" size={32} color={C.accent} />
            </div>

            <span style={{
            fontFamily: FONT, fontWeight: 600, fontSize: 22, color: C.inkDeep,
            letterSpacing: '-0.01em', textAlign: 'center'
          }}>Your card PIN</span>
            <span style={{
            fontFamily: FONT, fontSize: 14, color: C.textSecondary, marginTop: 6,
            textAlign: 'center', maxWidth: 300, lineHeight: '20px'
          }}>Use this for in-store purchases. Keep it private — never share it.</span>

            {/* PIN digits */}
            <div style={{
            display: 'flex', gap: 20, justifyContent: 'center',
            marginTop: 40
          }}>
              {['4', '8', '2', '9'].map((d, i) =>
            <div key={i} style={{
              width: 56, height: 72, borderRadius: 12,
              background: C.surface, border: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: `pinDigitIn 0.35s cubic-bezier(0.2, 0.7, 0.3, 1) ${0.1 + i * 0.06}s both`
            }}>
                  <span style={{
                fontFamily: FONT, fontWeight: 700, fontSize: 36, lineHeight: 1,
                letterSpacing: '-0.02em', color: C.inkDeep
              }}>{d}</span>
                </div>
            )}
            </div>

            {/* Countdown */}
            <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginTop: 28
          }}>
              <span style={{
              fontFamily: FONT, fontSize: 14, color: C.textSecondary
            }}>Hides in</span>
              <div style={{
              position: 'relative',
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <svg width="28" height="28" viewBox="0 0 28 28" style={{
                position: 'absolute', inset: 0, transform: 'rotate(-90deg)'
              }}>
                  <circle cx="14" cy="14" r="12" fill="none"
                stroke={C.border} strokeWidth="2" />
                  <circle cx="14" cy="14" r="12" fill="none"
                stroke={C.accent} strokeWidth="2" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 12}
                strokeDashoffset={2 * Math.PI * 12 * (1 - pinTimer / 30)}
                style={{ transition: 'stroke-dashoffset 1s linear' }} />
                
                </svg>
                <span style={{
                fontFamily: FONT, fontWeight: 600, fontSize: 11, color: C.textSecondary,
                position: 'relative', zIndex: 1
              }}>{pinTimer}</span>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div style={{
          padding: '12px 24px 34px', flexShrink: 0
        }}>
            <PrimaryButton onClick={() => setPinSheet(false)}>Hide PIN</PrimaryButton>
          </div>
        </div>
      }

      {/* iOS system-level Face ID overlay — on top of everything */}
      {faceidScanning && <IOSFaceIDOverlay done={faceidScanDone} />}

      {/* Face ID prompt bottom sheet */}
      {faceidPrompt &&
      <div style={{
        position: 'absolute', inset: 0, zIndex: 60
      }}>
          <div onClick={() => {if (!faceidScanning) setFaceidPrompt(false);}} style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          animation: 'fadeIn 0.25s ease'
        }} />
          <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: '#fff', borderRadius: '20px 20px 0 0',
          padding: '12px 0 34px',
          animation: 'sheetUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
        }}>
            <div style={{
            width: 36, height: 5, borderRadius: 3, background: '#D9DADD',
            margin: '0 auto 20px'
          }} />
            {faceidScanning ?
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 16, padding: '16px 24px 8px'
          }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 17, color: C.ink }}>Setting up Face ID…</div>
                  <div style={{ fontFamily: FONT, fontSize: 13, color: C.textSecondary, marginTop: 4 }}>Look at your phone</div>
                </div>
              </div> :

          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 16, padding: '8px 24px 0'
          }}>
                <FaceIdSymbol size={48} color={C.accent} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 18, color: C.ink, lineHeight: '24px' }}>Face ID required</div>
                  <div style={{ fontFamily: FONT, fontSize: 14, color: C.textSecondary, lineHeight: '20px', marginTop: 4, maxWidth: 300 }}>Enable Face ID to view card details, see your PIN, and approve payments.</div>
                </div>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  <PrimaryButton onClick={doEnableFaceid}>Enable Face ID</PrimaryButton>
                  <SecondaryButton onClick={() => setFaceidPrompt(false)}>Not now</SecondaryButton>
                </div>
              </div>
          }
          </div>
        </div>
      }

      {/* Order Physical Card flow */}
      <OrderPhysicalCardModal
        open={orderPhysicalOpen}
        onClose={() => setOrderPhysicalOpen(false)}
        onComplete={() => setHasPhysicalCard(true)} />

      {/* Apple Wallet provisioning sheet */}
      <AppleWalletAddSheet
        open={walletSheet}
        onClose={() => setWalletSheet(false)}
        onAdded={() => setWalletAdded(true)}
        hasWatch={true} />
      
      
    </ScreenShell>);

}

// ─── Order Physical Card multi-step modal ──────────────
function OrderPhysicalCardModal({ open, onClose, onComplete }) {
  // step: 'address' | 'pin1' | 'pin2' | 'review' | 'success'
  const [step, setStep] = React.useState('address');
  const [addr, setAddr] = React.useState({
    street: '', number: '', postal: '', city: '', country: ''
  });
  const [focused, setFocused] = React.useState('street');
  const [pin1, setPin1] = React.useState('');
  const [pin2, setPin2] = React.useState('');
  const [pinError, setPinError] = React.useState(false);
  const [pinWarn, setPinWarn] = React.useState(false);
  const [returnTo, setReturnTo] = React.useState(null); // 'review' when editing address/pin from review
  const [pinRevealed, setPinRevealed] = React.useState(false);
  const streetRef = React.useRef(null);

  // reset when reopened
  React.useEffect(() => {
    if (open) {
      setStep('address');setPin1('');setPin2('');
      setPinError(false);setPinWarn(false);setFocused('street');
      setReturnTo(null);setPinRevealed(false);
      setAddr({ street: '', number: '', postal: '', city: '', country: 'Belgium' });
      // focus street after modal animates in
      setTimeout(() => {if (streetRef.current) streetRef.current.focus();}, 450);
    }
  }, [open]);

  // re-focus street when entering address step from review
  React.useEffect(() => {
    if (step === 'address' && returnTo === 'review') {
      setTimeout(() => {if (streetRef.current) streetRef.current.focus();}, 50);
      setFocused('street');
    }
  }, [step, returnTo]);

  if (!open) return null;

  const addrValid = addr.street && addr.number && addr.postal && addr.city && addr.country;

  // PIN validation: avoid easily-guessable patterns (1234, 0000, sequential, repeated)
  const isWeak = (p) => {
    if (p.length !== 4) return false;
    if (/^(.)\1{3}$/.test(p)) return true; // 0000, 1111
    if (p === '1234' || p === '4321' || p === '0123' || p === '1212' || p === '1010') return true;
    return false;
  };

  const onPinPress = (key) => {
    const setter = step === 'pin1' ? setPin1 : setPin2;
    const cur = step === 'pin1' ? pin1 : pin2;
    if (key === 'del') {
      setter(cur.slice(0, -1));
      if (step === 'pin1') setPinWarn(false);
      if (step === 'pin2') setPinError(false);
      return;
    }
    if (cur.length >= 4) return;
    const next = cur + key;
    setter(next);
    if (step === 'pin1') {
      const weak = isWeak(next);
      setPinWarn(weak);
      // Auto-advance on completion if not weak
      if (next.length === 4 && !weak) {
        setTimeout(() => setStep('pin2'), 250);
      }
    }
    if (step === 'pin2') {
      setPinError(false);
      if (next.length === 4) {
        setTimeout(() => {
          if (next === pin1) {
            setStep('review');
            if (returnTo === 'review') setReturnTo(null);
          } else
          {setPinError(true);}
        }, 250);
      }
    }
  };

  const clearPin = () => {
    if (step === 'pin1') {setPin1('');setPinWarn(false);} else
    if (step === 'pin2') {setPin2('');setPinError(false);}
  };

  const onContinue = () => {
    if (step === 'address') {
      if (returnTo === 'review') {setStep('review');setReturnTo(null);} else
      setStep('pin1');
    } else
    if (step === 'pin1' && pin1.length === 4 && !isWeak(pin1)) setStep('pin2');else
    if (step === 'pin2' && pin2.length === 4) {
      if (pin2 === pin1) {
        setStep('review');
        if (returnTo === 'review') setReturnTo(null);
      } else
      {setPinError(true);}
    }
  };

  const onBack = () => {
    if (step === 'address' && returnTo === 'review') {setStep('review');setReturnTo(null);return;}
    if (step === 'pin1') {
      if (returnTo === 'review') {setStep('review');setReturnTo(null);} else
      setStep('address');
    } else
    if (step === 'pin2') {setStep('pin1');setPin2('');setPinError(false);} else
    if (step === 'review') setStep('pin2');
  };

  const onPlaceOrder = () => setStep('success');

  const fieldStyle = (k) => ({
    width: '100%', height: 44, padding: '0 12px', borderRadius: 8,
    border: `1px solid ${focused === k ? C.accent : C.border}`,
    background: '#fff', outline: 'none',
    fontFamily: FONT, fontSize: 15, color: C.ink,
    boxSizing: 'border-box'
  });
  const labelStyle = { fontFamily: FONT, fontSize: 12, color: C.textSecondary, fontWeight: 500 };

  const PinDots = ({ value, error }) =>
  <div style={{ display: 'flex', gap: 22, justifyContent: 'center' }}>
      {[0, 1, 2, 3].map((i) =>
    <div key={i} style={{
      width: 16, height: 16, borderRadius: 8,
      background: error ? '#E74C6E' : value.length > i ? C.inkDeep : 'transparent',
      border: `1.5px solid ${error ? '#E74C6E' : C.inkDeep}`,
      transition: 'all 0.15s ease',
      animation: error ? 'pinShake 0.4s ease' : value.length > i ? 'pinFill 0.18s ease' : 'none'
    }} />
    )}
    </div>;


  const Keypad = () => <IOSNumPad onPress={onPinPress} />;

  // ── Header (close + optional back)
  const Header = ({ showBack }) =>
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 16px 8px', minHeight: 44, flexShrink: 0
  }}>
      {showBack ?
    <button onClick={onBack} style={{
      width: 32, height: 32, borderRadius: 16, background: 'rgba(0,0,0,0.06)', border: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0
    }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button> :
    <div style={{ width: 32 }} />}
      <button onClick={onClose} style={{
      width: 32, height: 32, borderRadius: 16, background: 'rgba(0,0,0,0.06)', border: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0
    }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 12M12 2L2 12" stroke={C.ink} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>;


  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60,
      background: '#fff',
      animation: 'modalUp 0.42s cubic-bezier(0.32, 0.72, 0, 1)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <StatusBar />

      {step === 'address' &&
      <>
          <Header showBack={returnTo === 'review'} />
          <div style={{ flex: 1, padding: '8px 24px 0', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <span style={{
            fontFamily: FONT, fontWeight: 700, fontSize: 24, lineHeight: '32px',
            color: C.inkDeep, letterSpacing: '-0.005em'
          }}>{returnTo === 'review' ? 'Delivery details' : 'Where should we send your card?'}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28, paddingBottom: 24 }}>
              <TextField label="Street" value={addr.street}
            onChange={(e) => setAddr((a) => ({ ...a, street: e.target.value }))}
            onFocus={() => setFocused('street')} onBlur={() => setFocused(null)}
            focused={focused === 'street'} inputRef={streetRef} />
              <TextField label="Number" value={addr.number}
            onChange={(e) => setAddr((a) => ({ ...a, number: e.target.value }))}
            onFocus={() => setFocused('number')} onBlur={() => setFocused(null)}
            focused={focused === 'number'} />
              <TextField label="Postal code" value={addr.postal}
            onChange={(e) => setAddr((a) => ({ ...a, postal: e.target.value }))}
            onFocus={() => setFocused('postal')} onBlur={() => setFocused(null)}
            focused={focused === 'postal'} />
              <TextField label="City" value={addr.city}
            onChange={(e) => setAddr((a) => ({ ...a, city: e.target.value }))}
            onFocus={() => setFocused('city')} onBlur={() => setFocused(null)}
            focused={focused === 'city'} />
              <TextField label="Country" value="Belgium" onChange={() => {}} disabled />
            </div>
          </div>
          <div style={{ padding: '12px 24px 12px', flexShrink: 0 }}>
            <PrimaryButton onClick={onContinue}>{returnTo === 'review' ? 'Save' : 'Continue'}</PrimaryButton>
          </div>
          <IOSKeyboard />
        </>
      }

      {(step === 'pin1' || step === 'pin2') &&
      <>
          <Header showBack={true} />
          <div style={{ flex: 1, padding: '24px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{
            fontFamily: FONT, fontWeight: 700, fontSize: 22, lineHeight: '30px',
            color: C.inkDeep, letterSpacing: '-0.005em', textAlign: 'center'
          }}>{step === 'pin1' ? 'Set a 4-digit PIN' : 'Repeat your PIN'}</span>
            <span style={{
            marginTop: 8, fontFamily: FONT, fontSize: 14, color: C.textSecondary,
            textAlign: 'center', maxWidth: 280, lineHeight: '20px'
          }}>{step === 'pin1' ? 'You\'ll use this for in-store payments.' : 'Make sure both PINs match.'}</span>

            <div style={{ marginTop: 44 }}>
              <PinDots value={step === 'pin1' ? pin1 : pin2} error={step === 'pin2' && pinError} />
            </div>

            {/* Clear button - shows when there's something to erase */}
            <div style={{ marginTop: 18, height: 24, display: 'flex', alignItems: 'center' }}>
              {step === 'pin1' && pin1.length > 0 || step === 'pin2' && pin2.length > 0 ?
            <button onClick={clearPin} style={{
              background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 10px',
              fontFamily: FONT, fontSize: 13, color: C.accent, fontWeight: 600
            }}>Clear</button> :
            null}
            </div>

            {step === 'pin1' && pinWarn &&
          <div style={{
            marginTop: 8, padding: '12px 14px', borderRadius: 10,
            background: '#FEF7E5', border: '1px solid #F5E0A6',
            display: 'flex', gap: 10, alignItems: 'flex-start', maxWidth: 320
          }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A77A0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" /><path d="M12 17h.01" />
                </svg>
                <span style={{ fontFamily: FONT, fontSize: 13, color: '#7A5709', lineHeight: '18px' }}>
                  Avoid easily-guessable patterns like 1234 or repeated digits.
                </span>
              </div>
          }
            {step === 'pin2' && pinError &&
          <div style={{
            marginTop: 8, padding: '12px 14px', borderRadius: 10,
            background: '#FCEAEF', border: '1px solid #F5C2D0',
            display: 'flex', gap: 10, alignItems: 'flex-start', maxWidth: 320
          }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C7234A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                </svg>
                <span style={{ fontFamily: FONT, fontSize: 13, color: '#8E1A38', lineHeight: '18px' }}>
                  PINs do not match. Try again.
                </span>
              </div>
          }
          </div>

          <Keypad />
        </>
      }

      {step === 'review' &&
      <>
          <Header showBack={true} />
          <div style={{ flex: 1, padding: '8px 24px 0', overflowY: 'auto' }}>
            <span style={{
            fontFamily: FONT, fontWeight: 700, fontSize: 24, lineHeight: '32px',
            color: C.inkDeep, letterSpacing: '-0.005em'
          }}>Confirm your order</span>

            {/* Card visual */}
            <div style={{ marginTop: 20 }}>
              <PayflipCard width={110} height={70} />
            </div>

            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Card details */}
              <div>
                <div style={{ fontFamily: FONT, fontSize: 16, color: C.inkDeep, marginBottom: 10, fontWeight: 500 }}>Card details</div>
                <div style={{ borderTop: `1px solid ${C.border}` }} />
                {/* Name on card row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0' }}>
                  <div style={{
                  width: 36, height: 36, borderRadius: 8, background: C.surface,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontFamily: FONT, fontSize: 13, color: C.textSecondary, lineHeight: '18px' }}>Name on card</span>
                    <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: C.inkDeep, lineHeight: '22px' }}>Bruno Coen</span>
                  </div>
                </div>
                {/* PIN row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '4px 0 6px' }}>
                  <div style={{
                  width: 36, height: 36, borderRadius: 8, background: C.surface,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    {/* 3x3 dot grid icon */}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill={C.ink}>
                      {[0, 1, 2].map((r) => [0, 1, 2].map((c) =>
                    <circle key={`${r}-${c}`} cx={2 + c * 6} cy={2 + r * 6} r="1.4" />
                    ))}
                    </svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontFamily: FONT, fontSize: 13, color: C.textSecondary, lineHeight: '18px' }}>PIN</span>
                    <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: C.inkDeep, letterSpacing: pinRevealed ? 4 : 3, lineHeight: '22px', fontVariantNumeric: 'tabular-nums' }}>
                      {pinRevealed ? pin1 || '••••' : '••••'}
                    </span>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <button onClick={() => setPinRevealed((v) => !v)} style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                    fontFamily: FONT, fontSize: 14, color: C.inkDeep, fontWeight: 600,
                    textDecoration: 'underline', textUnderlineOffset: 3
                  }}>{pinRevealed ? 'Hide PIN' : 'View PIN'}</button>
                  </div>
                </div>
              </div>

              {/* Delivery details */}
              <div>
                <div style={{ fontFamily: FONT, fontSize: 16, color: C.inkDeep, marginBottom: 10, fontWeight: 500 }}>Delivery details</div>
                <div style={{ borderTop: `1px solid ${C.border}` }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0' }}>
                  <div style={{
                  width: 36, height: 36, borderRadius: 8, background: C.surface,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                    <span style={{ fontFamily: FONT, fontSize: 13, color: C.textSecondary, lineHeight: '18px' }}>Deliver to</span>
                    <span style={{ fontFamily: FONT, fontSize: 16, color: C.inkDeep, lineHeight: '22px', fontWeight: 700 }}>{addr.street} {addr.number}</span>
                    <span style={{ fontFamily: FONT, fontSize: 16, color: C.inkDeep, lineHeight: '22px', fontWeight: 700 }}>{addr.postal} {addr.city}</span>
                    <span style={{ fontFamily: FONT, fontSize: 16, color: C.inkDeep, lineHeight: '22px', fontWeight: 700 }}>{addr.country}</span>
                  </div>
                  <button onClick={() => {setReturnTo('review');setStep('address');}} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                  fontFamily: FONT, fontSize: 14, color: C.inkDeep, fontWeight: 600,
                  textDecoration: 'underline', textUnderlineOffset: 3, alignSelf: 'flex-start',
                  marginTop: 18
                }}>Edit</button>
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 24px 34px', flexShrink: 0 }}>
            <PrimaryButton onClick={onPlaceOrder}>Order physical card</PrimaryButton>
          </div>
        </>
      }

      {step === 'success' &&
      <>
          <Header showBack={false} />
          <div style={{ flex: 1, padding: '8px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{
            width: 88, height: 88, borderRadius: 44, position: 'relative',
            background: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'successPop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both'
          }}>
              {/* Pulsing ring */}
              <span style={{
              position: 'absolute', inset: -2, borderRadius: '50%',
              border: '2px solid #1F8A4C',
              animation: 'successRing 0.9s cubic-bezier(0.2, 0.7, 0.3, 1) 0.15s both'
            }} />
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#1F8A4C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                <path d="M20 6L9 17l-5-5"
              style={{
                strokeDasharray: 30, strokeDashoffset: 30,
                animation: 'successCheck 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.25s forwards'
              }} />
              </svg>
            </div>
            <span style={{
            marginTop: 24, fontFamily: FONT, fontWeight: 700, fontSize: 24,
            color: C.inkDeep, letterSpacing: '-0.005em'
          }}>Your card is on its way</span>
            <span style={{
            marginTop: 8, fontFamily: FONT, fontSize: 15, color: C.textSecondary, lineHeight: '22px',
            maxWidth: 300
          }}>It will arrive in 5-7 business days.</span>
          </div>
          <div style={{ padding: '12px 24px 34px' }}>
            <PrimaryButton onClick={() => {onComplete && onComplete();onClose();}}>Done</PrimaryButton>
          </div>
        </>
      }
    </div>);

}
function ScreenShell({ children, bg = '#fff' }) {
  return (
    <div style={{
      width: SCREEN_W, height: SCREEN_H, background: bg,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative'
    }}>{children}</div>);

}
function Spinner({ color = C.ink, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `3px solid ${color}22`, borderTopColor: color,
      animation: 'spin 0.8s linear infinite'
    }} />);

}
function FaceIdSymbol({ size = 54, color = C.accent, animated = false, done = false }) {
  const src = done ? window.__resources.faceidDone : window.__resources.faceidScan;
  return (
    <img src={src} alt="Face ID" style={{
      width: size, height: size, display: 'block', objectFit: 'contain',
      animation: animated ? 'pulse 1.5s ease-in-out infinite' : undefined
    }} />);

}

// ─────────────────────────────────────────────────────────
// 12. ALL TRANSACTIONS — full list with search
// ─────────────────────────────────────────────────────────
function AllTransactionsScreen({ send }) {
  const [query, setQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const q = query.trim().toLowerCase();
  const filtered = !q ? BE_MOBILITY_TX : BE_MOBILITY_TX.filter((tx) => {
    return (
      tx.brand.toLowerCase().includes(q) ||
      tx.category.toLowerCase().includes(q) ||
      tx.label.toLowerCase().includes(q) ||
      (tx.city || '').toLowerCase().includes(q));

  });
  const groups = groupByDay(filtered);

  return (
    <ScreenShell>
      <StatusBar />
      {/* Header with back button + title */}
      <div style={{
        padding: '8px 12px 4px', display: 'flex', alignItems: 'center', gap: 4,
        flexShrink: 0
      }}>
        <button onClick={() => send('home')} style={{
          width: 40, height: 40, borderRadius: 8, border: 'none',
          background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon name="arrow-left" size={22} color={C.ink} />
        </button>
        <span style={{
          fontFamily: FONT, fontWeight: 600, fontSize: 17, lineHeight: '24px',
          letterSpacing: '-0.005em', color: C.inkDeep
        }}>Transactions</span>
      </div>

      {/* Search field */}
      <div style={{ padding: '8px 16px 12px', flexShrink: 0 }}>
        <div style={{
          height: 40, borderRadius: 10,
          background: focused ? '#fff' : '#F1F1F4',
          border: `1px solid ${focused ? C.ink : 'transparent'}`,
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
          transition: 'background 0.15s, border-color 0.15s'
        }}>
          <Icon name="search" size={16} color={C.textMuted} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search merchant, category, city"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: FONT, fontSize: 14, lineHeight: '20px', color: C.inkDeep,
              letterSpacing: '-0.005em'
            }} />
          {query &&
          <button onClick={() => setQuery('')} style={{
            width: 18, height: 18, borderRadius: 9,
            background: 'rgba(60,60,67,0.3)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
          }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          }
        </div>
      </div>

      {/* List */}
      <div className="hide-scrollbar" style={{
        flex: 1, overflow: 'auto',
        padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 12
      }}>
        {filtered.length === 0 ?
        <div style={{
          marginTop: 32,
          border: `1px solid ${C.border}`, borderRadius: 16, background: '#fff',
          padding: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center'
        }}>
            <div style={{
            width: 38, height: 38, borderRadius: 8, background: '#F5F5F7',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
              <Icon name="search" size={16} color={C.ink} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', textAlign: 'center' }}>
              <span style={{
              fontFamily: FONT, fontWeight: 500, fontSize: 14, lineHeight: '20px',
              color: C.inkDeep
            }}>No matches</span>
              <span style={{
              fontFamily: FONT, fontSize: 14, lineHeight: '20px',
              color: C.textMuted, maxWidth: 280
            }}>Try a different merchant, category or city.</span>
            </div>
          </div> :

        groups.map((g) =>
        <div key={g.day} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
            padding: '4px 4px 8px',
            fontFamily: FONT, fontWeight: 600, fontSize: 12,
            color: C.textMuted, letterSpacing: '0.02em', textTransform: 'uppercase'
          }}>{g.day}</div>
              <div style={{
            border: `1px solid ${C.border}`, borderRadius: 16, background: '#fff',
            padding: '0 16px'
          }}>
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
        )
        }
      </div>
    </ScreenShell>);

}

// ─────────────────────────────────────────────────────────
// 13. PURCHASE AUTH — full-screen takeover when a merchant
// requests authentication (e.g. adding card to Uber)
// ─────────────────────────────────────────────────────────
function PurchaseAuthScreen({ onApprove, onCancel, request }) {
  const [secondsLeft, setSecondsLeft] = React.useState(request?.seconds || 288); // 4:48
  const [confirmDecline, setConfirmDecline] = React.useState(false);
  const [faceIdActive, setFaceIdActive] = React.useState(false);
  const [faceIdDone, setFaceIdDone] = React.useState(false);
  const [approving, setApproving] = React.useState(false);

  React.useEffect(() => {
    if (approving) return;
    if (secondsLeft <= 0) {
      onCancel && onCancel({ expired: true });
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, approving]);

  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const handleApprove = () => {
    if (approving) return;
    setApproving(true);
    setFaceIdActive(true);
    setTimeout(() => setFaceIdDone(true), 1600);
    setTimeout(() => onApprove && onApprove(), 2300);
  };

  return (
    <ScreenShell>
      <StatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 24px 24px' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          <span style={{
            fontFamily: FONT, fontWeight: 700, fontSize: 22, lineHeight: '28px',
            color: C.inkDeep, letterSpacing: '-0.005em'
          }}>Purchase authentication</span>
          <span style={{
            fontFamily: FONT, fontSize: 14, lineHeight: '20px',
            color: C.textSecondary, letterSpacing: '-0.005em', maxWidth: 320, alignSelf: 'center'
          }}>Approve in the Payflip app. We sent a confirmation request to your device. Open the app to approve this payment.</span>
        </div>

        {/* Detail card */}
        <div style={{
          background: C.surface, borderRadius: 12, padding: '4px 16px',
          display: 'flex', flexDirection: 'column'
        }}>
          {[
          { k: 'Merchant', v: request?.merchant || 'Colruyt' },
          { k: 'Amount', v: `€ ${(request?.amount ?? 173.98).toFixed(2)}` },
          { k: 'Date', v: request?.date || '13-04-2026 10:37:34' },
          { k: 'Card number', v: request?.cardLast4 ? `**** **** **** ${request.cardLast4}` : '**** **** **** 4343' }].
          map((row, i) =>
          <div key={row.k} style={{
            padding: '14px 0',
            borderTop: i === 0 ? 'none' : '1px solid rgba(0,0,0,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12
          }}>
              <span style={{ fontFamily: FONT, fontSize: 14, color: C.textSecondary }}>{row.k}</span>
              <span style={{
              fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.inkDeep,
              fontVariantNumeric: 'tabular-nums', textAlign: 'right'
            }}>{row.v}</span>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Big countdown */}
        <div style={{
          textAlign: 'center', padding: '24px 0',
          fontFamily: FONT, fontWeight: 700, fontSize: 64, lineHeight: 1,
          color: C.inkDeep, letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums'
        }}>{mm}:{ss}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={handleApprove} disabled={approving} style={{
            width: '100%', height: 52, borderRadius: 12,
            background: '#D6356E', border: 'none', cursor: approving ? 'default' : 'pointer',
            fontFamily: FONT, fontWeight: 600, fontSize: 16, color: '#fff',
            opacity: approving ? 0.7 : 1
          }}>{approving ? 'Approving…' : 'Approve'}</button>
          <button onClick={() => setConfirmDecline(true)} disabled={approving} style={{
            width: '100%', height: 52, borderRadius: 12,
            background: '#fff', border: `1px solid ${C.border}`,
            cursor: approving ? 'default' : 'pointer',
            fontFamily: FONT, fontWeight: 600, fontSize: 16, color: C.inkDeep
          }}>Cancel</button>
        </div>
      </div>

      {/* Decline confirm dialog */}
      {confirmDecline &&
      <div style={{
        position: 'absolute', inset: 0, zIndex: 60,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease', padding: 24
      }}>
          <div style={{
          background: '#fff', borderRadius: 16, padding: 24,
          width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 16,
          animation: 'dialogPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          textAlign: 'center'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 17, color: C.inkDeep }}>Decline payment?</span>
              <span style={{ fontFamily: FONT, fontSize: 13, color: C.textSecondary, lineHeight: '18px' }}>
                The merchant will see this payment as declined.
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={() => onCancel && onCancel({ expired: false })} style={{
              height: 44, borderRadius: 10, border: 'none',
              background: '#D6356E', color: '#fff',
              fontFamily: FONT, fontWeight: 600, fontSize: 15, cursor: 'pointer'
            }}>Yes, decline</button>
              <button onClick={() => setConfirmDecline(false)} style={{
              height: 44, borderRadius: 10, border: `1px solid ${C.border}`,
              background: '#fff', color: C.inkDeep,
              fontFamily: FONT, fontWeight: 600, fontSize: 15, cursor: 'pointer'
            }}>Keep open</button>
            </div>
          </div>
        </div>
      }

      {faceIdActive && <IOSFaceIDOverlay done={faceIdDone} />}
    </ScreenShell>);

}

// ─── Push notification banner (top of screen, taps to open) ──
function PushBanner({ visible, onClick, title, body }) {
  return (
    <div style={{
      position: 'absolute', top: 56, left: 12, right: 12, zIndex: 90,
      pointerEvents: visible ? 'auto' : 'none',
      transform: visible ? 'translateY(0)' : 'translateY(-120%)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease'
    }}>
      <div onClick={onClick} style={{
        background: 'rgba(245,245,247,0.92)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 18, padding: '12px 14px',
        display: 'flex', alignItems: 'flex-start', gap: 12,
        boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
        cursor: 'pointer'
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: '#220A35', display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <img src={window.__resources.payflipLogo} alt="" style={{ width: 22, height: 22, filter: 'brightness(0) invert(1)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontFamily: FONT_SF, fontWeight: 600, fontSize: 14, color: '#000' }}>Payflip</span>
            <span style={{ fontFamily: FONT_SF, fontSize: 12, color: 'rgba(60,60,67,0.6)' }}>now</span>
          </div>
          <div style={{ fontFamily: FONT_SF, fontWeight: 600, fontSize: 14, color: '#000', marginTop: 1 }}>{title}</div>
          <div style={{ fontFamily: FONT_SF, fontSize: 14, color: '#000', lineHeight: '18px', marginTop: 2 }}>{body}</div>
        </div>
      </div>
    </div>);

}

// ─── iOS Face ID system overlay ────────────────────────────
// Matches the iOS pattern: a small rounded-square module
// expands out of the Dynamic Island with a green Face ID glyph.
// Screen content stays clear underneath — no full-screen dim.
function IOSFaceIDOverlay({ done = false }) {
  // Dynamic island sits at top:11, height 37, centered. Module
  // grows downward from it into a rounded square.
  return (
    <div style={{
      position: 'absolute', top: 11, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 250, pointerEvents: 'none',
      animation: 'iosFaceIdIn 0.45s cubic-bezier(0.32, 0.72, 0, 1) forwards'
    }}>
      <div style={{
        width: 124, height: 124, borderRadius: 36,
        background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)'
      }}>
        {done ?
        // Success: green circle + checkmark (matches Figma spec)
        <svg width={72} height={72} viewBox="0 0 80 80" fill="none"
        style={{ animation: 'faceIdSuccessPop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <circle cx="40" cy="40" r="32.75" stroke="#87FA89" strokeWidth="4.5" />
            <path d="M36.78 54.733c-0.861 0-1.599-0.382-2.215-1.148L26.219 42.982c-0.233-0.287-0.404-0.56-0.513-0.82-0.096-0.273-0.144-0.54-0.144-0.8 0-0.642 0.206-1.162 0.616-1.558 0.41-0.397 0.929-0.595 1.558-0.595 0.739 0 1.361 0.328 1.867 0.984l7.095 9.352 13.658-21.8c0.288-0.437 0.575-0.738 0.862-0.902 0.287-0.178 0.649-0.267 1.087-0.267 0.629 0 1.141 0.198 1.538 0.595 0.396 0.383 0.595 0.882 0.595 1.497 0 0.246-0.042 0.499-0.124 0.759-0.082 0.26-0.225 0.54-0.43 0.841l-14.909 23.296c-0.52 0.78-1.251 1.169-2.195 1.169z"
          fill="#87FA89" />
          </svg> :

        // Scanning: pulsing Face ID glyph
        <svg width={68} height={68} viewBox="0 0 24 24" fill="none"
        stroke="#30D158" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ animation: 'pulse 1.6s ease-in-out infinite' }}>
            {/* Frame brackets */}
            <path d="M5 4h-1a1 1 0 0 0 -1 1v3" />
            <path d="M19 4h1a1 1 0 0 1 1 1v3" />
            <path d="M5 20h-1a1 1 0 0 1 -1 -1v-3" />
            <path d="M19 20h1a1 1 0 0 0 1 -1v-3" />
            {/* Eyes */}
            <path d="M9 8v3" />
            <path d="M15 8v3" />
            {/* Nose */}
            <path d="M12 9v4l-1 1" />
            {/* Smile */}
            <path d="M9 16c1 0.6 2 1 3 1s2 -0.4 3 -1" />
          </svg>
        }
      </div>
    </div>);

}

// ─── iOS native-style numeric keyboard ─────────────────────
// Matches the iOS "Number Pad" keyboard (3x4 grid, dark gray
// keys on light gray background, no decoration row).
function IOSNumPad({ onPress }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
  const kh = 46,gap = 6;
  return (
    <div style={{
      background: '#D1D3D9', padding: '8px 3px 28px', flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: gap
    }}>
      {[0, 1, 2, 3].map((row) =>
      <div key={row} style={{ display: 'flex', gap: gap, padding: '0 3px' }}>
          {[0, 1, 2].map((col) => {
          const k = keys[row * 3 + col];
          const isDel = k === 'del';
          const isEmpty = k === '';
          return (
            <div key={col}
            onClick={() => {if (k && !isEmpty) onPress(k);}}
            style={{
              flex: 1, height: kh, borderRadius: 5,
              background: isEmpty ? 'transparent' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isEmpty ? 'none' : '0 1px 0 rgba(0,0,0,0.3)',
              fontFamily: FONT_SF, fontSize: 25, fontWeight: 400, color: '#000',
              cursor: isEmpty ? 'default' : 'pointer', userSelect: 'none'
            }}>
                {isDel ?
              <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
                    <path d="M8.5 2L2 10l6.5 8H22a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8.5Z" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M13 7l6 6M19 7l-6 6" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                  </svg> :
              k}
              </div>);

        })}
        </div>
      )}
    </div>);

}

// ─── iOS Keyboard ─────────────────────────────────────────
function IOSKeyboard() {
  const rows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫']];

  const kw = 35,kh = 42,gap = 6;
  return (
    <div style={{
      background: '#D1D3D9', padding: '8px 3px 28px', flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: gap, alignItems: 'center'
    }}>
      {rows.map((row, ri) =>
      <div key={ri} style={{ display: 'flex', gap: gap, justifyContent: 'center' }}>
          {row.map((k, ki) => {
          const isSpecial = k === '⇧' || k === '⌫';
          const w = isSpecial ? 44 : kw;
          return (
            <div key={ki} style={{
              width: w, height: kh, borderRadius: 5,
              background: isSpecial ? '#ADB0B8' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 0 rgba(0,0,0,0.3)',
              fontFamily: FONT_SF, fontSize: isSpecial ? 16 : 22,
              fontWeight: 400, color: '#000', cursor: 'pointer',
              userSelect: 'none'
            }}>{k}</div>);

        })}
        </div>
      )}
      {/* Bottom row: 123, globe, space, return */}
      <div style={{ display: 'flex', gap: gap, justifyContent: 'center', width: '100%', padding: '0 3px' }}>
        <div style={{
          width: 87, height: kh, borderRadius: 5, background: '#ADB0B8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 0 rgba(0,0,0,0.3)',
          fontFamily: FONT_SF, fontSize: 16, color: '#000'
        }}>123</div>
        <div style={{
          flex: 1, height: kh, borderRadius: 5, background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 0 rgba(0,0,0,0.3)',
          fontFamily: FONT_SF, fontSize: 16, color: '#999', letterSpacing: -0.4
        }}>space</div>
        <div style={{
          width: 87, height: kh, borderRadius: 5, background: '#ADB0B8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 0 rgba(0,0,0,0.3)',
          fontFamily: FONT_SF, fontSize: 16, color: '#000'
        }}>return</div>
      </div>
    </div>);

}

Object.assign(window, {
  SplashScreen,
  LoginScreen, EmailSignInScreen, ItsmeLoadingScreen, ItsmeCardScreen, ItsmeFaceIdScreen, ItsmeSuccessScreen, ItsmeErrorScreen,
  PayflipWelcomeScreen, FaceIdPromptScreen, FaceIdScanScreen,
  CardCreatingScreen, CardReadyScreen, HomeScreen, AllTransactionsScreen,
  PurchaseAuthScreen, PushBanner,
  SCREEN_W, SCREEN_H, ScreenShell, FaceIdSymbol, IOSFaceIDOverlay
});