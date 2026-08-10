# 004 — Fade main content on Settings/Back mode switch

- **Status**: TODO
- **Commit**: beebee2
- **Severity**: HIGH
- **Category**: Missed opportunities (§8)
- **Estimated scope**: 1 file, ~15 lines changed

## Problem

The sidebar crossfades when switching between app and settings modes (plan 001, DONE), but the main content area hard-cuts in the same frame. `onEnterSettings()` and `onBack()` call both `setSidebarMode` and `setScreen` together, so React batches them — the main content swaps to the new screen at exactly T=0, the same instant the sidebar starts its 120ms leaving animation.

```js
// project/hr-admin/app.jsx:638 — onEnterSettings
onEnterSettings={() => { onSetSidebarMode('settings'); onNav('settings-notifications'); }}

// project/hr-admin/app.jsx:631 — onBack
onBack={() => { onSetSidebarMode('app'); onNav('dashboard'); }}
```

```js
// project/hr-admin/app.jsx:3358 — main content div (no transition)
<div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
  {screen === 'dashboard' && <DashboardScreen ... />}
  ...
  {screen.startsWith('settings-') && <StubScreen ... />}
</div>
```

The sidebar elegantly reveals the new nav items with a directional slide, but the panel beside it simply teleports content. The visual asymmetry undermines the sidebar's transition.

## Target

Coordinate a fade on the main content div that mirrors the sidebar's timing:
- **Out phase**: 120ms, opacity 1 → 0 (matches sidebar leaving duration)
- **In phase**: 150ms, opacity 0 → 1 (matches sidebar entering duration)

Because `screen` already holds the new value when the fade starts, the content swap is invisible during the 120ms out-phase. The 150ms in-phase reveals the correct new content. No separate `displayScreen` state is needed.

```js
// target — additional state in App
const [mainFading, setMainFading] = useState(false);

// target — useEffect in App (after sidebarMode state declaration)
useEffect(() => {
  setMainFading(true);
  const t = setTimeout(() => setMainFading(false), 120);
  return () => clearTimeout(t);
}, [sidebarMode]);

// target — main content div
<div style={{
  flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden',
  opacity: mainFading ? 0 : 1,
  transition: mainFading
    ? `opacity 120ms ${EASE_OUT}`
    : `opacity 150ms ${EASE_OUT}`,
}}>
```

**Why this works:** React batches `setSidebarMode` + `setScreen` into one render, so the content is already showing the new screen when `mainFading` becomes `true`. The out-phase (opacity → 0) hides the already-swapped content; the in-phase (opacity → 1) reveals it. CSS transitions retarget from current state mid-animation — if the user clicks Settings then immediately Back, the opacity transitions smoothly from wherever it is rather than restarting.

## Repo conventions to follow

- Easing tokens are JS constants at line 108: `const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'`
- Phase-based transitions are already the pattern in `Sidebar` (line 588): `useState('idle')` / `useEffect` / `contentStyle` object. This plan uses a simpler boolean variant (no entering phase needed — the CSS transition handles the return automatically).
- `useState` and `useEffect` are used directly — no external libraries.

## Steps

### 1. Add `mainFading` state and `useEffect` to `App`

File: `project/hr-admin/app.jsx`

Find the state block at the top of the `App` function (around line 3217):

```js
  const [screen, setScreen] = useState('dashboard');
  const [sidebarMode, setSidebarMode] = useState('app');
```

**Replace with:**

```js
  const [screen, setScreen] = useState('dashboard');
  const [sidebarMode, setSidebarMode] = useState('app');
  const [mainFading, setMainFading] = useState(false);
  useEffect(() => {
    setMainFading(true);
    const t = setTimeout(() => setMainFading(false), 120);
    return () => clearTimeout(t);
  }, [sidebarMode]);
```

### 2. Apply opacity + transition to the main content div

File: `project/hr-admin/app.jsx`

Find the main content wrapper div (around line 3358):

```js
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
```

**Replace with:**

```js
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', opacity: mainFading ? 0 : 1, transition: mainFading ? `opacity 120ms ${EASE_OUT}` : `opacity 150ms ${EASE_OUT}` }}>
```

### 3. Bump cache version

File: `project/hr-admin/index.html`

Increment the `?v=` query param by 1.

## Boundaries

- Do NOT touch `Sidebar`, `AppModeSidebar`, `SettingsModeSidebar`, or any individual screen component.
- Do NOT add a `prefers-reduced-motion` guard in this plan — that is plan 007's scope if it gets written.
- Do NOT change the sidebar's crossfade timing — this plan only coordinates the main content fade with it.
- Do NOT add a second `useEffect` for `screen` changes — this fade should only trigger on mode switches, not all nav.
- If `sidebarMode` appears in a different location than described, search for `const [sidebarMode, setSidebarMode]` rather than guessing the line number.

## Verification

- **Mechanical**: reload `localhost:8082/hr-admin/`, open DevTools console — zero errors.
- **Feel check**:
  1. Click "Settings" in the sidebar. The sidebar nav items should slide+fade out while the main content simultaneously fades to white/transparent. Then both fade back in together — sidebar showing Settings nav, main showing the Settings screen.
  2. Click "Back to app". Same in reverse — both fade out and in together.
  3. In DevTools Animations panel at 10% speed: main content opacity should go 1→0 over ~120ms, then 0→1 over ~150ms. No content should be visible during the 120ms out-phase.
  4. Rapid test: click Settings then immediately Back. The main content should not flicker or flash white — it should smoothly retarget from wherever the opacity was.
  5. Navigate within app mode (e.g. Home → People). The main content should NOT fade — this effect only fires on `sidebarMode` changes, not `screen` changes.
- **Done when**: clicking Settings and Back feels like one coordinated transition, not "sidebar animates, content teleports."
