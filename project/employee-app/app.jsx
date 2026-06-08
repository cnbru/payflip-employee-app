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
// App shell
// ─────────────────────────────────────────────────────────────
const FULLSCREEN_SCREENS = ['withdraw-cash', 'simulate-cash-out', 'pension-detail', 'edit-active-benefit', 'sign-addendum', 'bike-lease', 'pension-savings-detail', 'pension-savings-choice', 'time-off-hub', 'time-off-detail', 'request-time-off', 'report-illness'];

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

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--gray-100)',
      padding: 24,
    }}>
      <IOSDevice width={402} height={874}>
        <NavProvider>
          <AppShell />
        </NavProvider>
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
