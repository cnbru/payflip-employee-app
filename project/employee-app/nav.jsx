// Simple stack-based navigator. Each tab has its own stack of screens.
// Switching tabs preserves each stack. Back nav pops the active stack.

// ── Page slide transition ────────────────────────────────────────────────────
// Exiting page overlays as position:absolute and animates out.
// Entering page renders in normal flow — no height% resolution issues.
(function () {
  if (document.getElementById('t-page-styles')) return;
  const el = document.createElement('style');
  el.id = 't-page-styles';
  el.textContent = `
    :root {
      --page-dur: 260ms;
      --page-ease: cubic-bezier(0.22, 1, 0.36, 1);
      --page-distance: 8px;
      --page-blur: 3px;
    }
    @keyframes t-exit-forward {
      from { opacity: 1; transform: translateX(0);                              filter: blur(0); }
      to   { opacity: 0; transform: translateX(calc(var(--page-distance)*-1));  filter: blur(var(--page-blur)); }
    }
    @keyframes t-exit-back {
      from { opacity: 1; transform: translateX(0);                         filter: blur(0); }
      to   { opacity: 0; transform: translateX(var(--page-distance));       filter: blur(var(--page-blur)); }
    }
    @keyframes t-enter-forward {
      from { opacity: 0; transform: translateX(var(--page-distance));       filter: blur(var(--page-blur)); }
      to   { opacity: 1; transform: translateX(0);                          filter: blur(0); }
    }
    @keyframes t-enter-back {
      from { opacity: 0; transform: translateX(calc(var(--page-distance)*-1)); filter: blur(var(--page-blur)); }
      to   { opacity: 1; transform: translateX(0);                              filter: blur(0); }
    }

    /* Exiting screen: absolutely overlays the entering screen */
    .t-page-exit {
      position: absolute; inset: 0;
      pointer-events: none; z-index: 10;
    }
    .t-page-exit-forward { animation: t-exit-forward var(--page-dur) var(--page-ease) forwards; }
    .t-page-exit-back    { animation: t-exit-back    var(--page-dur) var(--page-ease) forwards; }

    /* Entering screen: in normal flow, animates in underneath the exit */
    .t-page-enter-forward { animation: t-enter-forward var(--page-dur) var(--page-ease) forwards; }
    .t-page-enter-back    { animation: t-enter-back    var(--page-dur) var(--page-ease) forwards; }

    @media (prefers-reduced-motion: reduce) {
      .t-page-exit, .t-page-enter-forward, .t-page-enter-back { animation: none !important; }
    }
  `;
  document.head.appendChild(el);
})();

const NavContext = React.createContext(null);

const TAB_IDS = ['home', 'benefits', 'budgets', 'personal'];

function NavProvider({ children }) {
  // stacks: { home: [...], benefits: [...], budgets: [...], personal: [...] }
  // each entry: { name: string, params?: object }
  // The bottom of every stack is the tab's root screen.
  const [activeTab, setActiveTab] = React.useState('home');
  const [stacks, setStacks] = React.useState({
    home:     [{ name: 'home' }],
    benefits: [{ name: 'benefits' }],
    budgets:  [{ name: 'budgets' }],
    personal: [{ name: 'personal' }],
  });

  const push = React.useCallback((name, params) => {
    setStacks((s) => ({ ...s, [activeTab]: [...s[activeTab], { name, params }] }));
  }, [activeTab]);

  const pop = React.useCallback(() => {
    setStacks((s) => {
      const stack = s[activeTab];
      if (stack.length <= 1) return s;
      return { ...s, [activeTab]: stack.slice(0, -1) };
    });
  }, [activeTab]);

  const reset = React.useCallback((tab) => {
    setStacks((s) => ({ ...s, [tab]: [{ name: tab }] }));
  }, []);

  // When the user taps the *active* tab again, reset its stack to root.
  const switchTab = React.useCallback((tab) => {
    if (tab === activeTab) {
      reset(tab);
    } else {
      setActiveTab(tab);
    }
  }, [activeTab, reset]);

  // Atomically switch tab and push a screen — avoids stale closure from calling switchTab + push separately.
  const navigate = React.useCallback((tab, screen, params) => {
    setActiveTab(tab);
    setStacks(s => ({ ...s, [tab]: [{ name: tab }, { name: screen, params }] }));
  }, []);

  const current = stacks[activeTab][stacks[activeTab].length - 1];
  const canGoBack = stacks[activeTab].length > 1;

  const value = { activeTab, switchTab, push, pop, reset, navigate, current, canGoBack, stacks };
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

function useNav() {
  const ctx = React.useContext(NavContext);
  if (!ctx) throw new Error('useNav must be inside NavProvider');
  return ctx;
}

// Registry of screens. Each screen is keyed by name and renders a component.
// Screens read params via useNav().current.params.
const SCREENS = {}; // populated below by screen files

function registerScreen(name, Component) { SCREENS[name] = Component; }

function ScreenRenderer() {
  const { current, stacks, activeTab } = useNav();
  const viewMode = React.useContext(window.ViewModeContext);
  const isDesktop = viewMode === 'desktop';
  const stackLen = stacks[activeTab].length;

  const [scene, setScene] = React.useState({ from: null, to: current, direction: 'forward' });
  const prevRef = React.useRef({ screen: current, stackLen, tab: activeTab });

  React.useEffect(() => {
    const prev = prevRef.current;

    if (activeTab !== prev.tab) {
      prevRef.current = { screen: current, stackLen, tab: activeTab };
      setScene({ from: null, to: current, direction: 'forward' });
      return;
    }
    if (current.name === prev.screen.name && stackLen === prev.stackLen) {
      prevRef.current = { screen: current, stackLen, tab: activeTab };
      return;
    }

    const isBack = stackLen < prev.stackLen;
    const fromScreen = prev.screen;
    prevRef.current = { screen: current, stackLen, tab: activeTab };

    if (isDesktop) {
      setScene({ from: null, to: current, direction: 'forward' });
      return;
    }

    setScene({ from: fromScreen, to: current, direction: isBack ? 'back' : 'forward' });

    const timer = setTimeout(() => setScene(s => ({ ...s, from: null })), 300);
    return () => clearTimeout(timer);
  }, [current.name, stackLen, activeTab]);

  const FromComp = scene.from ? SCREENS[scene.from.name] : null;
  const ToComp = SCREENS[scene.to.name];

  // Outer wrapper: height:100% resolves against the overflow-y:auto AppShell parent,
  // giving a definite height so sticky footers inside screens work.
  // Exiting screen overlays absolutely and animates out.
  // Entering screen renders in normal flow with minHeight:100% so it fills the viewport.
  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {FromComp && (
        <div
          key={`from-${scene.from.name}-${stackLen}`}
          className={`t-page-exit t-page-exit-${scene.direction}`}
        >
          <FromComp {...(scene.from.params || {})} />
        </div>
      )}
      <div
        key={`to-${scene.to.name}-${stackLen}`}
        style={{ height: '100%' }}
        className={scene.from ? `t-page-enter-${scene.direction}` : ''}
      >
        {ToComp
          ? <ToComp {...(scene.to.params || {})} />
          : <div style={{ padding: 40, fontFamily: 'var(--font-display)' }}>Unknown screen: {scene.to.name}</div>
        }
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared screen chrome: back-arrow nav-bar, title, etc.
// ─────────────────────────────────────────────────────────────
function NavBar({ title, trailing, onBack }) {
  const { pop, canGoBack } = useNav();
  const back = onBack || (canGoBack ? pop : null);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      paddingLeft: 16, paddingRight: 16,
      paddingTop: 4, paddingBottom: title ? 4 : 24,
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        {back && (
          <button
            onClick={back}
            aria-label="Back"
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: '#F7F7F8', border: 'none',
              cursor: 'pointer', padding: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgb(15,13,40)',
            }}>
            <LucideIcon name="ChevronLeft" size={28} color="rgb(15,13,40)" strokeWidth={2} />
          </button>
        )}
        {title && (
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: 28, lineHeight: '36px',
            letterSpacing: '-0.007em', color: 'rgb(15,13,40)',
            margin: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{title}</h1>
        )}
      </div>
      {trailing}
    </div>
  );
}

// Export
window.NavProvider = NavProvider;
window.useNav = useNav;
window.registerScreen = registerScreen;
window.ScreenRenderer = ScreenRenderer;
window.NavBar = NavBar;
window.TAB_IDS = TAB_IDS;
