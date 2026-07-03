// Payflip Employee App — main shell.
// Owns: device frame, status bar area, tab bar.
// Screen rendering is delegated to ScreenRenderer (nav.jsx).

// ─────────────────────────────────────────────────────────────
// Lucide icon helper — converts Lucide UMD icon nodes to React.
// ─────────────────────────────────────────────────────────────
const _kebabToCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
function _camelAttrs(attrs) {
  const out = {};
  for (const k in attrs) out[_kebabToCamel(k)] = attrs[k];
  return out;
}
function LucideIcon({ name, size = 24, color = 'currentColor', strokeWidth = 1.75, style }) {
  const node = window.lucide && window.lucide.icons && window.lucide.icons[name];
  if (!node) return null;
  const [, baseAttrs, children = []] = node;
  return (
    <svg {..._camelAttrs(baseAttrs)} width={size} height={size}
      stroke={color} strokeWidth={strokeWidth}
      style={style} aria-hidden="true">
      {children.map(([tag, props], i) =>
        React.createElement(tag, { ..._camelAttrs(props), key: i })
      )}
    </svg>
  );
}
window.LucideIcon = LucideIcon;

// ─────────────────────────────────────────────────────────────
// View mode context — 'mobile' | 'desktop'
// Exposed on window so personal-screen.jsx can consume it.
// ─────────────────────────────────────────────────────────────
const ViewModeContext = React.createContext('mobile');
window.ViewModeContext = ViewModeContext;

// ─────────────────────────────────────────────────────────────
// Tab-bar icons. Home uses the Payflip mark as a CSS mask so it
// inherits currentColor like the Lucide icons.
// ─────────────────────────────────────────────────────────────
const HomeIcon = ({ size = 26 }) => {
  const w = Math.round(size * 1.9);
  const h = Math.round(size * 0.9);
  return (
    <span aria-hidden="true" style={{
      display: 'inline-block', width: w, height: h,
      backgroundColor: 'currentColor',
      WebkitMaskImage: 'url(assets/payflip-logo.png)',
      maskImage: 'url(assets/payflip-logo.png)',
      WebkitMaskSize: 'contain', maskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center', maskPosition: 'center',
    }} />
  );
};
const StoreIcon    = (p) => <LucideIcon name="Store"      {...p} />;
const WalletIcon   = (p) => <LucideIcon name="Wallet"     {...p} />;
const PersonIcon   = (p) => <LucideIcon name="CircleUser" {...p} />;

const TABS = [
  { id: 'home',     label: 'Home',     Icon: HomeIcon   },
  { id: 'benefits', label: 'Benefits', Icon: StoreIcon  },
  { id: 'budgets',  label: 'Budgets',  Icon: WalletIcon },
  { id: 'personal', label: 'Personal', Icon: PersonIcon },
];

// ─────────────────────────────────────────────────────────────
// Bottom tab bar
// ─────────────────────────────────────────────────────────────
function TabBar() {
  const { activeTab, switchTab } = useNav();
  return (
    <div style={{
      borderTop: '1px solid var(--gray-200)',
      background: 'var(--bg-default)',
      paddingTop: 8,
      paddingBottom: 34, // home indicator safe area
      display: 'grid',
      gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
      flexShrink: 0,
    }}>
      {TABS.map((t) => {
        const isActive = activeTab === t.id;
        const color = isActive ? 'rgb(15,13,40)' : 'var(--gray-500)';
        return (
          <button key={t.id} onClick={() => switchTab(t.id)}
            aria-label={t.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              padding: '6px 0 4px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4,
              color,
              transition: 'color 150ms ease-out',
            }}>
            <t.Icon size={26} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 11, fontWeight: isActive ? 600 : 500,
              letterSpacing: '0.01em',
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Desktop shell components
// ─────────────────────────────────────────────────────────────
const DESKTOP_NAV = [
  { id: 'home',     label: 'Home'     },
  { id: 'personal', label: 'Time off' },
  { id: 'budgets',  label: 'Salary'   },
  { id: 'benefits', label: 'Budget'   },
];

function DesktopTopBar() {
  const { activeTab, navigate } = useNav();
  return (
    <div style={{
      height: 56, display: 'flex', alignItems: 'center',
      padding: '0 24px', background: 'white',
      borderBottom: '1px solid #e5e7eb',
      flexShrink: 0, zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 120 }}>
        <HomeIcon size={20} />
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 16, color: 'rgb(15,13,40)',
        }}>Payflip</span>
      </div>

      {/* Center nav */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        {DESKTOP_NAV.map(({ id, label }) => {
          const isActive = activeTab === id;
          return (
            <button key={id}
              onClick={() => id === 'personal' ? navigate('personal', 'time-off-hub') : navigate(id, id)}
              style={{
                border: 'none', background: 'transparent', cursor: 'pointer',
                padding: '6px 14px', borderRadius: 8,
                fontFamily: 'var(--font-display)', fontWeight: isActive ? 700 : 500,
                fontSize: 14, color: isActive ? 'rgb(15,13,40)' : '#6b7280',
                borderBottom: isActive ? '2px solid rgb(15,13,40)' : '2px solid transparent',
                borderRadius: 0,
                transition: 'color 150ms ease-out',
              }}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 120, justifyContent: 'flex-end' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgb(15,13,40)', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12,
        }}>PT</div>
      </div>
    </div>
  );
}

function DesktopSidebar() {
  const { activeTab, switchTab } = useNav();
  return (
    <div style={{
      width: 220, background: 'white', borderRight: '1px solid #e5e7eb',
      display: 'flex', flexDirection: 'column', gap: 2,
      padding: '12px 10px', flexShrink: 0, overflowY: 'auto',
    }}>
      {TABS.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button key={t.id} onClick={() => switchTab(t.id)}
            aria-current={isActive ? 'page' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 10, border: 'none',
              background: isActive ? 'rgb(15,13,40)' : 'transparent',
              color: isActive ? 'white' : '#374151',
              cursor: 'pointer', width: '100%', textAlign: 'left',
              fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 14,
              transition: 'background 150ms ease-out, color 150ms ease-out',
            }}>
            <t.Icon size={20} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

const DESKTOP_HIDE_NAV_SCREENS = ['request-time-off', 'report-illness'];

function DesktopAppShell() {
  const { navigate, current } = useNav();
  const hideNav = DESKTOP_HIDE_NAV_SCREENS.includes(current.name);

  React.useEffect(() => {
    navigate('personal', 'time-off-hub');
  }, []);

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: 'white',
    }}>
      {!hideNav && <DesktopTopBar />}
      {/* Content area — transform: translateZ(0) contains fixed-position overlays */}
      <div
        data-app-shell
        style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative',
          transform: 'translateZ(0)',
          background: '#fbfafd',
        }}>
        <div style={{
          maxWidth: 1088, margin: '0 auto',
          minHeight: '100%',
        }}>
          <ScreenRenderer />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// App shell
// ─────────────────────────────────────────────────────────────
const FULLSCREEN_SCREENS = ['withdraw-cash', 'simulate-cash-out', 'pension-detail', 'edit-active-benefit', 'sign-addendum', 'bike-lease', 'pension-savings-detail', 'pension-savings-choice', 'time-off-hub', 'time-off-detail', 'time-off-history', 'request-time-off', 'report-illness'];

function AppShell() {
  const { activeTab, current } = useNav();
  const isFullscreen = FULLSCREEN_SCREENS.includes(current.name);
  return (
    <div data-screen-label={`${activeTab}/${current.name}`}
      data-app-shell
      style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        background: 'var(--bg-default)',
        position: 'relative',
      }}>
      <div style={{
        flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
        paddingTop: 54, // clear status bar / dynamic island
      }}>
        <ScreenRenderer />
      </div>
      {!isFullscreen && <TabBar />}
    </div>
  );
}

function SplashScreen({ onDone }) {
  const containerRef = React.useRef(null);
  const [fading, setFading] = React.useState(false);

  React.useEffect(() => {
    if (!window.lottie || !containerRef.current) return;
    let timer1, timer2;
    const anim = window.lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: 'assets/splash-v1.json',
    });
    anim.addEventListener('DOMLoaded', () => {
      anim.playSegments([0, 300], true);
      timer1 = setTimeout(() => setFading(true), 5000);
      timer2 = setTimeout(onDone, 5500);
    });
    return () => { anim.destroy(); clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgb(241, 231, 253)',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.45s ease',
      pointerEvents: fading ? 'none' : 'auto',
    }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

function ProtoSwitcher({ viewMode, switchMode }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const ink = 'rgb(15,13,40)';
  const options = [
    { id: 'mobile',  label: 'Mobile',   icon: 'Smartphone' },
    { id: 'desktop', label: 'Desktop',  icon: 'Monitor'    },
  ];

  return (
    <div ref={ref} style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
      {/* Popover menu */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 52, right: 0,
          background: '#fff', borderRadius: 12,
          border: '1px solid #e5e7eb',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          padding: 6, minWidth: 160,
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {options.map(({ id, label, icon }) => {
            const active = viewMode === id;
            return (
              <button key={id} onClick={() => { switchMode(id); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: active ? ink : 'transparent',
                color: active ? '#fff' : ink,
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                textAlign: 'left',
              }}>
                <LucideIcon name={icon} size={14} color={active ? '#fff' : ink} strokeWidth={2} />
                {label}
                {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#6D17CF' }} />}
              </button>
            );
          })}
          <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />
          <a href="hr-admin/" target="_blank" rel="noreferrer" onClick={() => setOpen(false)} style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 12px', borderRadius: 8,
            color: ink, textDecoration: 'none',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
          }}>
            <LucideIcon name="Users" size={14} color={ink} strokeWidth={2} />
            HR Admin
            <LucideIcon name="ExternalLink" size={11} color="#9ca3af" strokeWidth={2} style={{ marginLeft: 'auto' }} />
          </a>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setOpen(o => !o)} style={{
        width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
        background: ink, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(15,13,40,0.35)',
        transition: 'transform 150ms',
      }}>
        <LucideIcon name={open ? 'X' : 'Layers'} size={16} color="#fff" strokeWidth={2} />
      </button>
    </div>
  );
}

function App() {
  const [splashDone, setSplashDone] = React.useState(false);
  const [viewMode, setViewMode] = React.useState(
    () => localStorage.getItem('payflip-view-mode') || 'mobile'
  );
  const switchMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('payflip-view-mode', mode);
  };

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12,
    transition: 'background 150ms ease-out, color 150ms ease-out',
  };

  return (
    <ViewModeContext.Provider value={viewMode}>
      {viewMode === 'mobile' ? (
        <div style={{
          minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--gray-100)', padding: 24,
        }}>
          <IOSDevice width={402} height={874}>
            {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
            <NavProvider>
              <AppShell />
            </NavProvider>
          </IOSDevice>
        </div>
      ) : (
        <NavProvider>
          <DesktopAppShell />
        </NavProvider>
      )}

      {/* Prototype switcher — floating icon button */}
      <ProtoSwitcher viewMode={viewMode} switchMode={switchMode} />
    </ViewModeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
