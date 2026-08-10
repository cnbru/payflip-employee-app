// App shell: state machine + screen transitions
const SCREENS = {
  'login': LoginScreen,
  'email-signin': EmailSignInScreen,
  'itsme-loading': ItsmeLoadingScreen,
  'itsme-card': ItsmeCardScreen,
  'itsme-faceid': ItsmeFaceIdScreen,
  'itsme-success': ItsmeSuccessScreen,
  'itsme-error': ItsmeErrorScreen,
  'payflip-welcome': PayflipWelcomeScreen,
  'faceid-prompt': FaceIdPromptScreen,
  'faceid-scan': FaceIdScanScreen,
  'card-creating': CardCreatingScreen,
  'card-ready': CardReadyScreen,
  'home': HomeScreen,
  'all-transactions': AllTransactionsScreen,
  'profile': ProfileScreen,
};

const ORDER = [
  'login', 'email-signin', 'payflip-welcome',
  'itsme-loading', 'itsme-card', 'itsme-faceid', 'itsme-success', 'itsme-error',
  'faceid-prompt', 'faceid-scan',
  'card-creating', 'card-ready', 'home', 'all-transactions', 'profile',
];

const DARK_BG_SCREENS = new Set([]);

function App() {
  const _urlSkip = /[#&?]skip\b/.test(window.location.href);
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "skipOnboarding": _urlSkip,
    "simulateItsmeFailure": false,
    "simulateCardFailure": false,
    "showTransactions": false,
    "simulatePurchaseAuth": false
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [screen, setScreen] = React.useState(tweaks.skipOnboarding ? 'home' : 'login');
  const [splashing, setSplashing] = React.useState(!tweaks.skipOnboarding);
  const [transitioning, setTransitioning] = React.useState(false);
  const [prevScreen, setPrevScreen] = React.useState(null);
  const [direction, setDirection] = React.useState('forward');
  const [faceidEnabled, setFaceidEnabled] = React.useState(!!tweaks.skipOnboarding);
  const [walletAdded, setWalletAdded] = React.useState(false);
  const [toast, setToast] = React.useState(null); // {msg, key} or null

  // Purchase-auth simulation: 'idle' | 'banner' | 'screen'
  const [authState, setAuthState] = React.useState('idle');
  const authReq = React.useRef({
    merchant: 'Colruyt', amount: 173.98,
    date: '13-04-2026 10:37:34', cardLast4: '4343', seconds: 288
  });

  const showToast = React.useCallback((msg) => {
    const key = Date.now();
    setToast({ msg, key });
    setTimeout(() => setToast((cur) => (cur && cur.key === key ? null : cur)), 2600);
  }, []);

  // Show toast whenever the card becomes added (rising-edge)
  const prevWalletAdded = React.useRef(false);
  React.useEffect(() => {
    if (walletAdded && !prevWalletAdded.current) {
      showToast('Added to Apple Wallet');
      prevWalletAdded.current = true;
      return;
    }
    prevWalletAdded.current = walletAdded;
  }, [walletAdded, showToast]);

  // Purchase-auth tweak: when toggled on, fire banner ~2s later.
  // When toggled off, clear any in-flight state.
  React.useEffect(() => {
    if (!tweaks.simulatePurchaseAuth) {
      setAuthState('idle');
      return;
    }
    if (authState !== 'idle') return;
    const t = setTimeout(() => setAuthState('banner'), 2000);
    return () => clearTimeout(t);
  }, [tweaks.simulatePurchaseAuth]);

  // Auto-dismiss the banner after 6s if user didn't tap
  React.useEffect(() => {
    if (authState !== 'banner') return;
    const t = setTimeout(() => setAuthState((s) => s === 'banner' ? 'idle' : s), 6000);
    return () => clearTimeout(t);
  }, [authState]);

  // Hold splash for ~1s, then reveal SSO/blobs
  React.useEffect(() => {
    if (tweaks.skipOnboarding) return;
    const t = setTimeout(() => setSplashing(false), 1100);
    return () => clearTimeout(t);
  }, []);

  // React to skipOnboarding tweak changes at runtime
  React.useEffect(() => {
    if (tweaks.skipOnboarding) {
      setScreen('home');
      setSplashing(false);
      setFaceidEnabled(true);
      setPrevScreen(null);
      setTransitioning(false);
    } else {
      setScreen('login');
      setSplashing(true);
      setFaceidEnabled(false);
      setWalletAdded(false);
      setPrevScreen(null);
      setTransitioning(false);
      const t = setTimeout(() => setSplashing(false), 1100);
      return () => clearTimeout(t);
    }
  }, [tweaks.skipOnboarding]);

  const send = (next, opts) => {
    if (next === screen) return;
    // Track Face ID enablement: scan completed OR enabled from prompt (without skip)
    if (next === 'card-creating' && (screen === 'faceid-scan' || screen === 'faceid-prompt') && !(opts && opts.skipFaceid)) {
      setFaceidEnabled(true);
    }
    // "I'll do it later" — skip Face ID, go to card creation
    if (opts && opts.skipFaceid) {
      setFaceidEnabled(false);
    }
    const fwd = ORDER.indexOf(next) > ORDER.indexOf(screen);
    setDirection(fwd ? 'forward' : 'back');
    setPrevScreen(screen);
    setTransitioning(true);
    setScreen(next);
    setTimeout(() => {
      setTransitioning(false);
      setPrevScreen(null);
    }, 360);
  };

  // Enable Face ID from home (after skipping during onboarding)
  const enableFaceid = () => {
    setFaceidEnabled(true);
  };

  const Current = SCREENS[screen];
  const Prev = prevScreen ? SCREENS[prevScreen] : null;
  const fwd = direction === 'forward';

  return (
    <div style={{
      width: SCREEN_W, height: SCREEN_H, position: 'relative',
      overflow: 'hidden', background: '#fff',
    }}>
      {Prev && transitioning && (
        <div key={`prev-${prevScreen}`} style={{
          position: 'absolute', inset: 0,
          animation: `${fwd ? 'slideOutLeft' : 'slideOutRight'} 0.36s cubic-bezier(0.32, 0.72, 0, 1) forwards`,
        }}>
          <Prev send={() => {}} faceidEnabled={faceidEnabled} enableFaceid={enableFaceid} walletAdded={walletAdded} setWalletAdded={setWalletAdded}/>
        </div>
      )}
      <div key={`cur-${screen}`} style={{
        position: 'absolute', inset: 0,
        animation: transitioning ? `${fwd ? 'slideInRight' : 'slideInLeft'} 0.36s cubic-bezier(0.32, 0.72, 0, 1) forwards` : 'none',
      }}>
        <Current send={send} faceidEnabled={faceidEnabled} enableFaceid={enableFaceid} walletAdded={walletAdded} setWalletAdded={setWalletAdded} splashing={splashing} simulateCardFailure={tweaks.simulateCardFailure} simulateItsmeFailure={tweaks.simulateItsmeFailure} showTransactions={tweaks.showTransactions}/>
      </div>

      {/* Push notification banner — Payflip purchase auth */}
      <PushBanner
        visible={authState === 'banner'}
        onClick={() => setAuthState('screen')}
        title="Approve purchase"
        body={`${authReq.current.merchant} · €${authReq.current.amount.toFixed(2)} — tap to review`} />

      {/* Purchase auth full-screen takeover */}
      {authState === 'screen' &&
        <div style={{
          position: 'absolute', inset: 0, zIndex: 80,
          animation: 'sheetUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)'
        }}>
          <PurchaseAuthScreen
            request={authReq.current}
            onApprove={() => {
              setAuthState('idle');
              setTweak('simulatePurchaseAuth', false);
              showToast('Payment approved');
            }}
            onCancel={(opts) => {
              setAuthState('idle');
              setTweak('simulatePurchaseAuth', false);
              if (opts && opts.expired) showToast('Request expired');
              else showToast('Payment declined');
            }} />
        </div>
      }

      {/* Toast (Apple Wallet add confirmation, etc.) */}
      <Toast message={toast?.msg || ''} visible={!!toast} />

      {/* Dynamic island */}
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 124, height: 37, borderRadius: 19, background: '#000',
        zIndex: 100, pointerEvents: 'none',
      }}/>

      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        width: 134, height: 5, borderRadius: 3,
        background: DARK_BG_SCREENS.has(screen) ? '#fff' : '#000',
        zIndex: 100, pointerEvents: 'none',
      }}/>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Flow" />
        <TweakToggle label="Skip login & onboarding" value={tweaks.skipOnboarding}
          onChange={(v) => setTweak('skipOnboarding', v)} />
        <TweakSection label="Home" />
        <TweakToggle label="Show transactions" value={tweaks.showTransactions}
          onChange={(v) => setTweak('showTransactions', v)} />
        <TweakSection label="Payments" />
        <TweakToggle label="Simulate purchase auth" value={tweaks.simulatePurchaseAuth}
          onChange={(v) => setTweak('simulatePurchaseAuth', v)} />
        <TweakSection label="Failure simulation" />
        <TweakToggle label="itsme login fails" value={tweaks.simulateItsmeFailure}
          onChange={(v) => setTweak('simulateItsmeFailure', v)} />
        <TweakToggle label="Card creation fails" value={tweaks.simulateCardFailure}
          onChange={(v) => setTweak('simulateCardFailure', v)} />
      </TweaksPanel>
    </div>
  );
}

function Phone() {
  return (
    <div style={{
      width: SCREEN_W + 24, height: SCREEN_H + 24,
      borderRadius: 56, background: '#0a0a0a',
      padding: 12, boxSizing: 'border-box',
      boxShadow: '0 30px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06) inset',
    }}>
      <div style={{
        width: SCREEN_W, height: SCREEN_H,
        borderRadius: 44, overflow: 'hidden', background: '#fff',
        position: 'relative',
      }}>
        <App/>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Phone/>);
