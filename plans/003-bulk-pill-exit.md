# 003 — Add exit animation to bulk action pill

- **Status**: TODO
- **Commit**: beebee2
- **Severity**: MEDIUM
- **Category**: Interruptibility
- **Estimated scope**: 1 file, ~25 lines changed
- **Depends on**: 002 (adds `pillFadeUp` keyframe; this plan adds `pillFadeDown`)

## Problem

The bulk action pill at `app.jsx:1742` enters with a 150ms `fadeUp` animation but exits in a single frame — React unmounts it the moment `selected.size === 0`. The asymmetry (animated in, hard-cut out) makes the dismissal feel cheap and abrupt.

```js
// project/hr-admin/app.jsx:1742 — current
{selected.size > 0 && (
  <div style={{ position: 'sticky', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
    <div style={{
      pointerEvents: 'auto',
      background: P.ink, borderRadius: 10, padding: '6px 14px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 6px 24px rgba(15,13,40,0.3)',
      animation: `pillFadeUp 0.15s ${EASE_OUT}`,   // ← after plan 002
    }}>
```

## Target

Hold the pill in the DOM during a short exit animation before unmounting. Use a `leaving` boolean state: when `selected.size` drops to zero, set `leaving = true` and start the exit animation; after it completes, set `leaving = false` and stop rendering.

Exit motion: fade out + translate down 6px (mirror of the 8px entrance, slightly shorter distance since exits should feel faster).

```js
// target keyframe (add alongside pillFadeUp)
@keyframes pillFadeDown {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(6px); }
}
```

Exit duration: 120ms (faster than the 150ms entrance — the system's response to a user action should feel snappy).
Exit easing: `EASE_OUT` (`cubic-bezier(0.22, 1, 0.36, 1)`) — starts fast, decelerates.

## Repo conventions to follow

- Easing tokens are JS constants at line 108: `const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'`
- All keyframes live in the `<style>` block at `app.jsx:3325`.
- State is managed with `useState` — no external libraries. Example in the same component: `const [selected, setSelected] = useState(new Set())`.
- Plan 002 must be applied first (adds `pillFadeUp` keyframe; this plan adds `pillFadeDown` alongside it).

## Steps

### 1. Add `pillFadeDown` keyframe

File: `project/hr-admin/app.jsx`, `<style>` block around line 3325.

After the `pillFadeUp` keyframe added by plan 002, add:

```css
        @keyframes pillFadeDown {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(6px); }
        }
```

### 2. Add `pillLeaving` state to `RequestsScreen`

File: `project/hr-admin/app.jsx`. Find `function RequestsScreen` (search for it — around line 1620 but may have drifted).

Inside `RequestsScreen`, after the existing `useState` calls (e.g. after `const [selected, setSelected] = useState(new Set())`), add:

```js
  const [pillLeaving, setPillLeaving] = useState(false);
```

### 3. Add `useEffect` to trigger the exit animation

Directly after the `pillLeaving` state declaration, add:

```js
  useEffect(() => {
    if (selected.size === 0 && !pillLeaving) return;
    if (selected.size > 0) { setPillLeaving(false); return; }
    setPillLeaving(true);
    const t = setTimeout(() => setPillLeaving(false), 120);
    return () => clearTimeout(t);
  }, [selected.size]);
```

How it works:
- When `selected.size` drops to 0, `leaving` becomes `true` — the pill stays rendered.
- After 120ms the timeout fires, `leaving` becomes `false` — the pill unmounts.
- When rows are re-selected while leaving, the re-check `if (selected.size > 0)` resets `leaving` immediately (pill re-enters without a flash).

### 4. Update the render condition and animation

Find the bulk action bar section (search for `{/* Bulk action bar */}`):

**Current:**
```js
        {selected.size > 0 && (
          <div style={{ position: 'sticky', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{
              pointerEvents: 'auto',
              background: P.ink, borderRadius: 10, padding: '6px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 6px 24px rgba(15,13,40,0.3)',
              animation: `pillFadeUp 0.15s ${EASE_OUT}`,
            }}>
```

**Replace with:**
```js
        {(selected.size > 0 || pillLeaving) && (
          <div style={{ position: 'sticky', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{
              pointerEvents: pillLeaving ? 'none' : 'auto',
              background: P.ink, borderRadius: 10, padding: '6px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
              boxShadow: '0 6px 24px rgba(15,13,40,0.3)',
              animation: pillLeaving
                ? `pillFadeDown 120ms ${EASE_OUT} forwards`
                : `pillFadeUp 0.15s ${EASE_OUT}`,
            }}>
```

Note: the exit animation uses `forwards` fill-mode so it stays at `opacity: 0` rather than flickering back before unmount.

### 5. Bump cache version

File: `project/hr-admin/index.html`

Increment the `?v=` query param on the `<script>` tag by 1.

## Boundaries

- Do NOT change any logic in the `setSelected` calls — only the render guard and animation style change.
- Do NOT add `pointerEvents: 'none'` to buttons during the entering state.
- Do NOT change the entrance animation — that is plan 002's scope.
- Do NOT add new dependencies.
- If `pillFadeUp` keyframe is missing (plan 002 not yet applied), STOP and apply plan 002 first.

## Verification

- **Mechanical**: reload `localhost:8082/hr-admin/`, open DevTools console — zero errors.
- **Feel check**:
  1. Check a row. Pill appears (fadeUp). Uncheck the row. Pill should fade down and disappear over ~120ms — not a hard cut.
  2. Check a row, then rapidly uncheck and recheck before the exit finishes. The pill should stay visible throughout — no flash of invisible state.
  3. In DevTools Animations panel at 10% speed: the exit should fade out while moving down ~6px, then disappear. No flicker or jump at the end.
  4. Click "Clear" on the pill. Same exit animation should play.
- **Done when**: the pill exits gracefully in both the uncheck and Clear paths, and rapid toggle does not glitch.
