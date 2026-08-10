# 005 — Add transition to SidebarItem active background

- **Status**: TODO
- **Commit**: beebee2
- **Severity**: LOW
- **Category**: Cohesion (§7)
- **Estimated scope**: 1 file, 1 line changed

## Problem

`SidebarItem`'s background flips instantly between `transparent` (inactive) and `P.bg` (`#f7f7f8`, active) when `isActive` changes — no CSS transition. When you click a nav item or when the sidebar mode crossfade draws attention to the sidebar, the active highlight teleports to the new item.

```js
// project/hr-admin/app.jsx:364-368 — current
<button onClick={disabled ? undefined : onClick} style={{
  display: 'flex', alignItems: 'center', gap: 9,
  padding: '7px 20px', borderRadius: 0,
  border: 'none', background: isActive ? P.bg : 'transparent',
  cursor: disabled ? 'default' : 'pointer', width: '100%', textAlign: 'left',
}}>
```

Every other interactive element in the file that changes background uses a transition (e.g. `Switch` at line 196: `transition: \`background 150ms ${EASE_OUT}\``). `SidebarItem` is the exception.

## Target

Add a 120ms `EASE_OUT` background transition. 120ms matches the sidebar's leaving phase so the active state settles just as the crossfade completes.

```js
// target
<button onClick={disabled ? undefined : onClick} style={{
  display: 'flex', alignItems: 'center', gap: 9,
  padding: '7px 20px', borderRadius: 0,
  border: 'none', background: isActive ? P.bg : 'transparent',
  cursor: disabled ? 'default' : 'pointer', width: '100%', textAlign: 'left',
  transition: `background 120ms ${EASE_OUT}`,
}}>
```

## Repo conventions to follow

- Easing tokens are JS constants at line 108: `const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'`
- Inline style props only — no CSS classes, no stylesheets. Exemplar: `Switch` at line 196 uses `transition: \`background 150ms ${EASE_OUT}\`` in exactly this pattern.

## Steps

### 1. Add `transition` to `SidebarItem` button style

File: `project/hr-admin/app.jsx`

Find (around line 364):

```js
  border: 'none', background: isActive ? P.bg : 'transparent',
  cursor: disabled ? 'default' : 'pointer', width: '100%', textAlign: 'left',
```

**Replace with:**

```js
  border: 'none', background: isActive ? P.bg : 'transparent',
  cursor: disabled ? 'default' : 'pointer', width: '100%', textAlign: 'left',
  transition: `background 120ms ${EASE_OUT}`,
```

### 2. Bump cache version

File: `project/hr-admin/index.html`

Increment the `?v=` query param by 1.

## Boundaries

- Do NOT change `SidebarSub` buttons — their background is always `transparent` and they use the left-border indicator instead.
- Do NOT add hover state logic — that is a separate concern requiring `useState`.
- Do NOT touch any other property in `SidebarItem`.
- This change applies to ALL `SidebarItem` instances (app mode and settings mode sidebar) — that is intentional.

## Verification

- **Mechanical**: reload `localhost:8082/hr-admin/`, open DevTools console — zero errors.
- **Feel check**:
  1. Click any nav item (e.g. Home → People). The active background highlight on the previously-active item should fade out, and the new item should fade in, over ~120ms. It should feel like a soft "handoff" rather than a cut.
  2. In DevTools Animations panel at 10% speed: background should transition smoothly from `transparent` to `#f7f7f8` (or reverse) over 120ms with a strong deceleration curve.
  3. The disabled "Billing" item in settings mode should not flicker — it has no `isActive` changes and the transition only fires when `background` actually changes.
- **Done when**: clicking nav items shows a smooth background handoff with no teleport.
