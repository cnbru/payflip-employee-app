# 008 — Sheet animation overhaul

- **Status**: TODO
- **Commit**: 3f51a15
- **Severity**: HIGH
- **Category**: Easing & duration / Interruptibility / Physicality
- **Estimated scope**: 1 file (`project/hr-admin/app.jsx`), ~20 lines

## Problem

The sheet (drawer) feels clunky for three compounding reasons:

### 1. Exit animation cut short — PRIMARY cause

`project/hr-admin/app.jsx:111`
```js
const MODAL_CLOSE_DUR = 150;
```

`project/hr-admin/app.jsx:189–194`
```js
function sheetPanelStyle(visible) {
  return {
    transform: visible ? 'translateX(0)' : 'translateX(100%)',
    transition: `transform 320ms ${EASE_OUT}`,
  };
}
```

`useModalTransition` fires `onClose` (unmounting the component) after 150ms, but the sheet's `transform` transition is 320ms. The component is destroyed at 47% of the exit slide — the sheet snaps away rather than completing its slide-out.

### 2. Generic ease-out, not a drawer curve

`project/hr-admin/app.jsx:108`
```js
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
```

This is the app's general-purpose ease-out. A physical drawer requires a steeper initial velocity — `cubic-bezier(0.32, 0.72, 0, 1)` (the iOS drawer curve from AUDIT.md). The current curve starts too gradually, making the sheet feel like it floats in rather than being pulled.

### 3. Symmetric timing, no opacity

Enter and exit both use `320ms`. Per AUDIT.md, deliberate actions animate normally; system responses snap. A dismissed sheet should exit faster (~220ms). There is also no opacity transition — the sheet slides in fully opaque, making the entrance feel mechanical and heavy.

## Target

```js
// app.jsx ~line 108 — add alongside EASE_OUT
const EASE_DRAWER = 'cubic-bezier(0.32, 0.72, 0, 1)'; // iOS physical drawer curve

// app.jsx ~line 111 — sheet-specific close duration
const SHEET_CLOSE_DUR = 220;  // matches exit transition; MODAL_CLOSE_DUR stays 150 for centered modals
```

`useModalTransition` — expose `closing` so the caller can apply asymmetric timing:
```js
// app.jsx:116 — add closeDur param, expose closing
function useModalTransition(onClose, closeDur = MODAL_CLOSE_DUR) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, closeDur);
  }, [onClose, closeDur]);
  return { visible: mounted && !closing, close, closing };
}
```

`sheetPanelStyle` — drawer curve, asymmetric durations, opacity:
```js
// app.jsx:189 — replace sheetPanelStyle
function sheetPanelStyle(visible, closing) {
  const transDur = closing ? SHEET_CLOSE_DUR : 340;
  const opacDur  = closing ? SHEET_CLOSE_DUR : 180;
  return {
    transform: visible ? 'translateX(0)' : 'translateX(100%)',
    opacity:   visible ? 1 : 0,
    transition: `transform ${transDur}ms ${EASE_DRAWER}, opacity ${opacDur}ms ${EASE_OUT}`,
  };
}
```

Both sheet usages — pass `SHEET_CLOSE_DUR` and forward `closing`:

**DetailModal** (`app.jsx:1073`):
```js
// before:
const { visible, close } = useModalTransition(onClose);
// after:
const { visible, close, closing } = useModalTransition(onClose, SHEET_CLOSE_DUR);
```

```jsx
// before: ...sheetPanelStyle(visible),
// after:  ...sheetPanelStyle(visible, closing),
```

**AddTimeOffModal** (`app.jsx:1622`):
```js
// before:
const { visible, close } = useModalTransition(onClose);
// after:
const { visible, close, closing } = useModalTransition(onClose, SHEET_CLOSE_DUR);
```

```jsx
// before: ...sheetPanelStyle(visible),
// after:  ...sheetPanelStyle(visible, closing),
```

## Repo conventions to follow

- Module-level constants in all-caps live at the top of `app.jsx` (line 108 area). Append `EASE_DRAWER` and `SHEET_CLOSE_DUR` there, adjacent to `EASE_OUT` and `MODAL_CLOSE_DUR`.
- Existing exemplar for asymmetric timing pattern: `Toast` component uses `duration` to vary close delay by toast type — same concept applied here to the sheet.
- Do NOT rename or remove `EASE_OUT`, `MODAL_CLOSE_DUR`, or the old `sheetPanelStyle` signature without updating every caller.

## Steps

1. **Add constants** — In `project/hr-admin/app.jsx`, after line 108 (`const EASE_OUT = …`), add:
   ```js
   const EASE_DRAWER = 'cubic-bezier(0.32, 0.72, 0, 1)';
   ```
   After line 111 (`const MODAL_CLOSE_DUR = 150;`), add:
   ```js
   const SHEET_CLOSE_DUR = 220;
   ```

2. **Extend `useModalTransition`** — At line 116, change the function signature from:
   ```js
   function useModalTransition(onClose) {
   ```
   to:
   ```js
   function useModalTransition(onClose, closeDur = MODAL_CLOSE_DUR) {
   ```
   At line 125, change:
   ```js
   setTimeout(onClose, MODAL_CLOSE_DUR);
   ```
   to:
   ```js
   setTimeout(onClose, closeDur);
   ```
   At line 127, change the return:
   ```js
   return { visible: mounted && !closing, close };
   ```
   to:
   ```js
   return { visible: mounted && !closing, close, closing };
   ```
   Add `closeDur` to the `useCallback` dependency array (line 126):
   ```js
   }, [onClose, closeDur]);
   ```

3. **Replace `sheetPanelStyle`** — Lines 189–194, replace the entire function:
   ```js
   // before:
   function sheetPanelStyle(visible) {
     return {
       transform: visible ? 'translateX(0)' : 'translateX(100%)',
       transition: `transform 320ms ${EASE_OUT}`,
     };
   }
   // after:
   function sheetPanelStyle(visible, closing) {
     const transDur = closing ? SHEET_CLOSE_DUR : 340;
     const opacDur  = closing ? SHEET_CLOSE_DUR : 180;
     return {
       transform: visible ? 'translateX(0)' : 'translateX(100%)',
       opacity:   visible ? 1 : 0,
       transition: `transform ${transDur}ms ${EASE_DRAWER}, opacity ${opacDur}ms ${EASE_OUT}`,
     };
   }
   ```

4. **Update DetailModal** — Find `const { visible, close } = useModalTransition(onClose);` at approximately line 1073 inside `DetailModal`. Change to:
   ```js
   const { visible, close, closing } = useModalTransition(onClose, SHEET_CLOSE_DUR);
   ```
   Then find `...sheetPanelStyle(visible),` inside `DetailModal`'s panel div and change to:
   ```js
   ...sheetPanelStyle(visible, closing),
   ```

5. **Update AddTimeOffModal** — Find `const { visible, close } = useModalTransition(onClose);` at approximately line 1622 inside `AddTimeOffModal`. Change to:
   ```js
   const { visible, close, closing } = useModalTransition(onClose, SHEET_CLOSE_DUR);
   ```
   Then find `...sheetPanelStyle(visible),` inside `AddTimeOffModal`'s panel div and change to:
   ```js
   ...sheetPanelStyle(visible, closing),
   ```

6. **Bump cache version** — In `project/hr-admin/index.html`, increment the `?v=N` param on the `app.jsx` script tag.

## Boundaries

- Do NOT touch `ReasonModal`, `EditBalancesModal`, or any component that uses `modalPanelStyle` — this plan is sheet-only.
- Do NOT change `MODAL_CLOSE_DUR` — centered modals use it and their 200ms transition is close enough to the 150ms timer.
- Do NOT change the backdrop (`modalBackdropStyle`) — it already fades in 150ms which is correct.
- Do NOT add new dependencies.
- If the code at the cited lines does not match these excerpts exactly (drift since commit `3f51a15`), STOP and report rather than improvising.

## Verification

- **Mechanical**: open `project/hr-admin/index.html` in a browser (via the project's local server). No console errors in the JS panel.
- **Feel check**:
  1. Open a Detail sheet (Requests → 3-dot menu → View details). Watch the enter: the sheet should sweep in with a crisp, physical pull — noticeable initial velocity, smooth deceleration. It should arrive in ~340ms.
  2. Click the X or the backdrop. The sheet should complete its full slide-out before disappearing (~220ms). There must be NO snap/jump mid-slide.
  3. In DevTools Animations panel, set playback to 10%. On open: the sheet slides in with a steep-start, long-tail curve. On close: shorter, snappier slide-out at approximately 2/3 the enter duration.
  4. Rapidly open and close (click backdrop quickly after opening). The transition should retarget from current position — no jumping to translateX(100%) from a half-in position.
  5. Toggle `prefers-reduced-motion` (DevTools → Rendering). With it on, `PREFERS_REDUCED_MOTION` is checked at module load — no behavioral change unless re-evaluated, which is acceptable for this prototype.
- **Done when**: enter and exit both complete their full animation without cut-off, and the enter curve reads as distinctly more physical than the current generic ease-out.
