# 001 — Add directional crossfade to sidebar mode switch

- **Status**: TODO
- **Commit**: beebee2
- **Severity**: MEDIUM
- **Category**: Missed opportunities (§8)
- **Estimated scope**: 1 file, ~30 lines changed

## Problem

The sidebar has two modes — app and settings — switched by clicking "Settings" or "Back to app." Currently the switch is an instant content swap with zero transition:

```jsx
/* project/hr-admin/app.jsx:594 — current */
{sidebarMode === 'settings' ? (
  <SettingsModeSidebar ... />
) : (
  <AppModeSidebar ... />
)}
```

The entire nav content teleports: one set of items vanishes and a completely different set appears in the same frame. This is a jarring state change for spatially-connected UI — the user just clicked an item inside the sidebar and the sidebar's contents silently replaced themselves.

## Target

A directional crossfade with subtle horizontal slide, communicating depth:

- **Entering settings** (going deeper): current content fades out + slides left 6px, then settings content fades in from right 6px.
- **Returning to app** (going back): current content fades out + slides right 6px, then app content fades in from left 6px.
- **Out phase**: 120ms, opacity 1 → 0, translateX 0 → ±6px
- **In phase**: 150ms, opacity 0 → 1, translateX ±6px → 0
- **Easing**: existing `EASE_OUT` token (`cubic-bezier(0.22, 1, 0.36, 1)`)
- **Total wall-clock**: 270ms (well under the 500ms modal budget, feels snappy for occasional nav)

The sidebar shell (width, background, border, `AdminProfileFooter`) stays static throughout — only the inner content (entity switcher / back button + nav items) transitions.

```jsx
/* target — Sidebar component wraps mode content in a transition div */
const contentStyle = {
  flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
  opacity: phase === 'leaving' ? 0 : 1,
  transform: phase === 'leaving'
    ? `translateX(${direction === 'forward' ? -6 : 6}px)`
    : phase === 'entering'
      ? `translateX(${direction === 'forward' ? 6 : -6}px)`
      : 'translateX(0)',
  transition: phase === 'entering'
    ? 'none'
    : `opacity ${phase === 'leaving' ? 120 : 150}ms ${EASE_OUT}, transform ${phase === 'leaving' ? 120 : 150}ms ${EASE_OUT}`,
};
```

## Repo conventions to follow

- Easing tokens are JS constants at line 108: `const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';`
- All animation uses inline `style` props — no CSS classes, no animation library.
- The `usePopoverTransition` hook (line 134) is the existing pattern for mount/unmount transitions with a render/visible split. The sidebar mode switch doesn't unmount (both modes are always mountable), so a simpler phase-based approach is appropriate.
- The `SidebarAccordion` (line 388) is the existing sidebar transition exemplar — CSS transition on a single property, using `EASE_OUT`.

## Steps

### 1. Rewrite the `Sidebar` component body to manage transition state

Replace the current `Sidebar` function (starts at line 586) with:

```jsx
function Sidebar({ active, onNav, pendingCount, sidebarMode, onSetSidebarMode }) {
  const [displayMode, setDisplayMode] = useState(sidebarMode);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'leaving' | 'entering'
  const [direction, setDirection] = useState('forward'); // 'forward' (app→settings) | 'back' (settings→app)

  useEffect(() => {
    if (sidebarMode === displayMode) return;
    setDirection(sidebarMode === 'settings' ? 'forward' : 'back');
    setPhase('leaving');
    const t = setTimeout(() => {
      setDisplayMode(sidebarMode);
      setPhase('entering');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase('idle'));
      });
    }, 120);
    return () => clearTimeout(t);
  }, [sidebarMode]);

  const contentStyle = {
    flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    opacity: phase === 'leaving' ? 0 : 1,
    transform: phase === 'leaving'
      ? `translateX(${direction === 'forward' ? -6 : 6}px)`
      : phase === 'entering'
        ? `translateX(${direction === 'forward' ? 6 : -6}px)`
        : 'translateX(0)',
    transition: phase === 'entering'
      ? 'none'
      : `opacity ${phase === 'leaving' ? 120 : 150}ms ${EASE_OUT}, transform ${phase === 'leaving' ? 120 : 150}ms ${EASE_OUT}`,
  };

  return (
    <div style={{
      width: 216, flexShrink: 0, background: P.white,
      borderRight: `1px solid ${P.border}`,
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      <div style={contentStyle}>
        {displayMode === 'settings' ? (
          <SettingsModeSidebar
            active={active}
            onNav={onNav}
            onBack={() => { onSetSidebarMode('app'); onNav('dashboard'); }}
          />
        ) : (
          <AppModeSidebar
            active={active}
            onNav={onNav}
            pendingCount={pendingCount}
            onEnterSettings={() => { onSetSidebarMode('settings'); onNav('settings-notifications'); }}
          />
        )}
      </div>
      <AdminProfileFooter />
    </div>
  );
}
```

**How it works:**
1. `sidebarMode` changes (prop from parent) → `useEffect` fires
2. Sets `direction` for correct slide direction, then `phase = 'leaving'`
3. The leaving phase applies `opacity: 0` + `translateX(±6px)` with a 120ms transition
4. After 120ms timeout, swaps `displayMode` (content changes) and sets `phase = 'entering'`
5. `entering` applies the new start position (`translateX(±6px)`) with `transition: none` so it snaps there without animation
6. Double-rAF sets `phase = 'idle'` which applies `translateX(0) + opacity: 1` with a 150ms transition — the enter animation plays

The double `requestAnimationFrame` is necessary to ensure the browser has painted the `entering` position before the transition to `idle` starts. Single rAF can batch with the state update on some browsers.

## Boundaries

- Do NOT touch `AppModeSidebar`, `SettingsModeSidebar`, or `AdminProfileFooter` — only the `Sidebar` shell changes.
- Do NOT change the existing `sidebarMode` / `onSetSidebarMode` prop contract with `App`.
- Do NOT add new dependencies.
- Keep the sidebar shell (width, background, border-right, sticky positioning) identical.
- If a step doesn't match the code you find (drift since commit beebee2), STOP and report instead of improvising.

## Verification

- **Mechanical**: reload the page at `localhost:8082/hr-admin/`, open DevTools console — no errors.
- **Feel check**:
  1. Click "Settings" in the sidebar. The app-mode nav should fade out sliding left, then settings nav fades in from the right. Total transition should feel quick and directional — not sluggish.
  2. Click "Back to app". The settings nav should fade out sliding right, then app nav fades in from the left. The direction reversal should feel natural.
  3. Rapidly click Settings → Back → Settings → Back. The transition should not get stuck, glitch, or show a blank sidebar. The cleanup function in the `useEffect` prevents stale timeouts.
  4. The `AdminProfileFooter` at the bottom should remain completely static during both transitions.
  5. In DevTools Animations panel, slow to 25% and confirm: the slide distance is subtle (6px), the crossfade is clean with no double-exposed overlap, and the easing starts fast and decelerates (ease-out shape).
- **Done when**: mode switches feel like a smooth directional page turn rather than a teleport, and rapid switching doesn't break state.
