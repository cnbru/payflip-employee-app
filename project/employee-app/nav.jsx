// Simple stack-based navigator. Each tab has its own stack of screens.
// Switching tabs preserves each stack. Back nav pops the active stack.

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

  const current = stacks[activeTab][stacks[activeTab].length - 1];
  const canGoBack = stacks[activeTab].length > 1;

  const value = { activeTab, switchTab, push, pop, reset, current, canGoBack, stacks };
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
  const { current } = useNav();
  const Component = SCREENS[current.name];
  if (!Component) {
    return (
      <div style={{ padding: 40, fontFamily: 'var(--font-display)' }}>
        Unknown screen: {current.name}
      </div>
    );
  }
  return <Component {...(current.params || {})} />;
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
