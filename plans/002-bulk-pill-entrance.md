# 002 — Fix bulk action pill entrance animation

- **Status**: TODO
- **Commit**: beebee2
- **Severity**: HIGH + MEDIUM + LOW
- **Category**: Physicality / Easing / Cohesion
- **Estimated scope**: 1 file, ~8 lines changed

## Problem

### Finding 1 (HIGH) — `translateX(-50%)` causes a jump at animation end

The `@keyframes fadeUp` keyframe was written for the toast component, which is positioned with `position: fixed; left: 50%; transform: translateX(-50%)`. The bulk action pill uses a flex wrapper for centering — it has no static `transform` of its own. Because the animation shorthand does not set `fill-mode: forwards`, the default `fill-mode: none` applies: when the animation ends, all transforms are discarded and the element snaps back to its natural position.

During the 150ms animation the pill sits at `translateX(-50%)` (shifted left by half its own width). When the animation ends it jumps rightward to `translateX(0)`. The jump is visible and jarring.

```js
// project/hr-admin/app.jsx:3326 — current (shared between pill AND toast)
@keyframes fadeUp {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
```

```js
// project/hr-admin/app.jsx:1749 — pill usage
animation: 'fadeUp 0.15s ease-out',
```

```js
// project/hr-admin/app.jsx:3197 — toast usage (translateX(-50%) is CORRECT here)
animation: 'fadeUp 0.2s ease-out',
```

### Finding 2 (MEDIUM) — Weak `ease-out` instead of codebase's `EASE_OUT` token

The animation uses the CSS built-in `ease-out` string which resolves to `cubic-bezier(0, 0, 0.58, 1)` — weak, front-loaded deceleration. Every other transition in the file uses `EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'`.

```js
// project/hr-admin/app.jsx:108 — easing token
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
```

### Finding 3 (LOW) — `badgePopIn` starts at `scale(0.5)`

Nothing in the real world appears from half its size. The AUDIT rule: target `scale(0.9–0.97)` for entrances. `scale(0.5)` reads as a cartoon pop, not a crisp dashboard.

```js
// project/hr-admin/app.jsx:3330 — current
@keyframes badgePopIn {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}
```

## Target

Add a `pillFadeUp` keyframe with `translateY` only (no `translateX`). Keep `fadeUp` unchanged for the toast. Update the pill to use `pillFadeUp` + `EASE_OUT`. Tighten `badgePopIn` to start at `scale(0.75)`.

```js
// target — new keyframe (add alongside existing fadeUp)
@keyframes pillFadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

// target — updated badgePopIn
@keyframes badgePopIn {
  from { opacity: 0; transform: scale(0.75); }
  to   { opacity: 1; transform: scale(1); }
}
```

```js
// target — pill usage (app.jsx:1749)
animation: `pillFadeUp 0.15s ${EASE_OUT}`,
```

The toast at line 3197 stays as `animation: 'fadeUp 0.2s ease-out'` — do NOT change it.

## Repo conventions to follow

- Easing tokens are JS constants at line 108: `const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'`
- `EASE_BOUNCE = 'cubic-bezier(0.34, 1.56, 0.64, 1)'` is used for the badge — keep using it.
- All keyframes live in the `<style>` block injected at `app.jsx:3325`: `<style>{\`...\`}</style>`
- Exemplar of `EASE_OUT` in inline animation: `animation: \`badgePopIn 500ms ${EASE_BOUNCE}\`` at line 374.

## Steps

### 1. Add `pillFadeUp` keyframe and update `badgePopIn`

File: `project/hr-admin/app.jsx`, line 3325 `<style>` block.

**Find:**
```js
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes badgePopIn {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
```

**Replace with:**
```js
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes pillFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePopIn {
          from { opacity: 0; transform: scale(0.75); }
          to   { opacity: 1; transform: scale(1); }
        }
```

### 2. Update the pill's animation reference

File: `project/hr-admin/app.jsx`, line 1749.

**Find:**
```js
              animation: 'fadeUp 0.15s ease-out',
```

**Replace with:**
```js
              animation: `pillFadeUp 0.15s ${EASE_OUT}`,
```

Note: this line is inside a JSX template literal context — the backtick syntax is valid here. Do NOT touch the toast at line 3197.

### 3. Bump cache version

File: `project/hr-admin/index.html`

Increment the `?v=` query param on the `<script>` tag by 1 (e.g. `?v=156` → `?v=157`).

## Boundaries

- Do NOT change the `fadeUp` keyframe — it is correct for the toast.
- Do NOT touch the toast's animation at line 3197.
- Do NOT add new dependencies.
- Do NOT change any other animation or transition in the file.
- If the line numbers don't match what you find (drift since commit beebee2), search for the exact string instead of guessing.

## Verification

- **Mechanical**: reload `localhost:8082/hr-admin/`, open DevTools console — zero errors.
- **Feel check**:
  1. Navigate to Time off → Requests. Check a row. The pill should slide up from ~8px below its resting position and fade in cleanly, **ending exactly where it started** with no rightward jump.
  2. In DevTools Animations panel, slow to 10% and confirm: the pill travels straight up (no horizontal drift), the easing decelerates sharply (starts fast, slows at the end).
  3. Hover over the badge ("3" pill in the sidebar). Click Time off to collapse and reopen — badge should pop in from a small size (~75% of final), not half-size.
- **Done when**: no horizontal jump at animation end, pill feels snappy (strong deceleration), badge pop is subtle not cartoonish.
