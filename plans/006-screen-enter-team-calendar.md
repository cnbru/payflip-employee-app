# 006 — Screen entrance animation for Team calendar

- **Status**: TODO
- **Commit**: beebee2
- **Severity**: MEDIUM
- **Category**: Missed opportunities (§8)
- **Estimated scope**: 1 file, ~8 lines changed

## Problem

Clicking "Team calendar" in the sidebar hard-cuts to the new screen. `TeamAbsencesScreen` mounts with no entrance animation — the large calendar panel teleports into place. Every other animated transition in the codebase (sidebar crossfade, bulk pill, mode-switch fade) has a motion that communicates what just happened. The screen switch has nothing.

```js
// project/hr-admin/app.jsx:3367 — current (App render)
{screen === 'team-absences' && <TeamAbsencesScreen ... />}

// project/hr-admin/app.jsx:2192 — TeamAbsencesScreen outermost div (current)
<div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
```

This plan scopes to `TeamAbsencesScreen` as a proof-of-concept. Once validated by feel, the same pattern can be applied to every other screen's outermost div.

## Target

Add a `screenEnter` keyframe and apply it to `TeamAbsencesScreen`'s outermost div:

- **Motion**: opacity 0→1 + translateY(6px→0) — "content arriving from just below"
- **Duration**: 180ms — faster than a modal (200–500ms budget), slower than a pill (150ms). Screens are large elements; slightly more time feels physical without feeling slow.
- **Easing**: `EASE_OUT` (`cubic-bezier(0.22, 1, 0.36, 1)`) — consistent with every entrance in the codebase.
- **Travel distance**: 6px, intentionally less than the pill's 8px — the whole viewport shifting 8px would be pronounced; 6px is perceptible but not dramatic.

```css
/* target keyframe */
@keyframes screenEnter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

```js
// target — TeamAbsencesScreen outermost div
<div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', animation: `screenEnter 180ms ${EASE_OUT}` }}>
```

## Repo conventions to follow

- Easing tokens are JS constants at line 108: `const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'`
- All keyframes live in the `<style>` block inside `App`'s return (around line 3342):
  ```js
  <style>{`
    @keyframes fadeUp { ... }
    @keyframes pillFadeUp { ... }
    @keyframes pillFadeDown { ... }
    @keyframes badgePopIn { ... }
  `}</style>
  ```
- Inline `animation` prop pattern already used at line 414: `animation: \`badgePopIn 500ms ${EASE_BOUNCE}\``
- `overflow: hidden` on the outermost div is not a problem — `transform` and `opacity` do not interact with overflow.

## Steps

### 1. Add `screenEnter` keyframe

File: `project/hr-admin/app.jsx`, the `<style>` block around line 3342.

Find:
```js
        @keyframes badgePopIn {
          from { opacity: 0; transform: scale(0.75); }
          to   { opacity: 1; transform: scale(1); }
        }
```

**Replace with:**
```js
        @keyframes badgePopIn {
          from { opacity: 0; transform: scale(0.75); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes screenEnter {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
```

### 2. Apply animation to TeamAbsencesScreen's outermost div

File: `project/hr-admin/app.jsx`

Search for (around line 2192):
```js
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <PageHeader title="Team absences"
```

**Replace the outermost div's style:**
```js
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', animation: `screenEnter 180ms ${EASE_OUT}` }}>
      <PageHeader title="Team absences"
```

### 3. Bump cache version

File: `project/hr-admin/index.html`

Increment the `?v=` query param by 1.

## Boundaries

- Do NOT add `screenEnter` to any other screen — this is a proof-of-concept for Team calendar only. Once the feel is validated, other screens can be added in a follow-up.
- Do NOT change the `overflow: hidden` on the outermost div.
- Do NOT add `fill-mode: forwards` — the animation ends at `opacity: 1, translateY(0)`, which is already the element's natural state, so forwards fill is not needed.
- Do NOT change the `EASE_OUT` constant or its value.
- If the line numbers have drifted, search for `title="Team absences"` and look for the immediately preceding `return (` and its `<div` to find the correct location.

## Verification

- **Mechanical**: reload `localhost:8082/hr-admin/`, open DevTools console — zero errors.
- **Feel check**:
  1. Navigate Home → Time off → Team calendar. The calendar screen should slide up 6px and fade in over 180ms. It should feel like content arriving, not like a page flip or a blur effect.
  2. Navigate away and back. The animation should replay every time Team calendar mounts.
  3. Navigate Home → People → Team calendar (via cross-link if available). Same animation, same feel.
  4. In DevTools Animations panel at 10% speed: confirm translateY starts at 6px and lands at 0, no bounce, strong deceleration (ease-out shape). The total travel is subtle — at full speed it should feel crisp, not floaty.
  5. Compare against navigating to Home or People (no animation). Team calendar should feel noticeably more alive — but not so pronounced that the difference feels inconsistent.
- **Done when**: the Team calendar entrance feels like content loading in, not teleporting, and the motion completes before the user has time to read the page title.

## Extension note

To apply this pattern globally, add `animation: \`screenEnter 180ms ${EASE_OUT}\`` to the outermost div of each screen component:
- `DashboardScreen` (search `function DashboardScreen`)
- `EmployeesScreen`, `EmployeeDetailScreen`
- `RequestsScreen`
- `StubScreen`

Each screen is already conditionally rendered (`{screen === 'foo' && <FooScreen />}`), so the component mounts on every navigation — the animation plays automatically.
