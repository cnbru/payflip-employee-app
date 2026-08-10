# 007 — Animate RequestRow exit on approve/decline

- **Status**: DONE
- **Commit**: fb0b373
- **Severity**: MEDIUM
- **Category**: Missed opportunity / Purpose & frequency (preventing a jarring change)
- **Estimated scope**: 1 file (`project/hr-admin/app.jsx`), 2 components touched (`RequestRow`, `RequestsScreen`)

## Problem

On the **Pending** tab of the Time off requests screen, clicking the inline Approve (✓) or Decline (✗) button on a `RequestRow` mutates the underlying request's `status` immediately. Because the row is only rendered while `status === 'pending'`, it disappears from the list on the very next render — no transition, no bridge. The row is there, then it's gone.

Current render site, `project/hr-admin/app.jsx:2143-2145`:

```jsx
) : paginated.map(req => (
  <RequestRow key={req.id} req={req} requests={requests} onApprove={onApprove} onDecline={onDecline} onDetail={setDetail} onEdit={setEditReq} onCancel={onCancel} selected={selected.has(req.id)} onToggle={toggleSelect} onViewInCalendar={onViewInCalendar} showStatus={tab === 'all'} />
))}
```

`paginated` is derived from `filtered`, which is derived from `requests.filter(r => r.status === 'pending')` when `tab === 'pending'` (`app.jsx:2085-2093`). The moment `approve(id)` or the decline flow flips `r.status`, that request drops out of `filtered` and `RequestRow` unmounts with no exit state.

The inline buttons that trigger this, `project/hr-admin/app.jsx:2044-2057`:

```jsx
<div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
  {req.status === 'pending' && (<>
    <button title="Decline" onClick={() => onDecline(req.id)}
      onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon name="X" size={14} color="#dc2626" strokeWidth={2.5} />
    </button>
    <button title="Approve" onClick={() => onApprove(req.id)}
      onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.borderColor = '#86efac'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#bbf7d0'; }}
      style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #bbf7d0', background: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon name="Check" size={14} color="#16a34a" strokeWidth={2.5} />
    </button>
  </>)}
  <ActionMenu req={req} onViewDetails={() => onDetail(req)} onViewInCalendar={onViewInCalendar} onEdit={() => onEdit(req)} onCancel={() => onCancel(req.id)} />
</div>
```

**Important asymmetry to preserve**: `onApprove` (`app.jsx:2051`) calls `approve(id)` directly — an instant status mutation (`app.jsx:3726-3734`). `onDecline` (`app.jsx:2045`) calls `requestDecline(id)` (`app.jsx:3747-3751`), which does **not** mutate anything itself — it opens a `ReasonModal` via `setPendingAction({ type: 'decline', id, empName })`, and only the modal's confirm button actually flips the status (`decline(id, reason)`, `app.jsx:3736-3744`). So the row-exit trigger cannot live inside the button's `onClick` alone — for decline, the actual status flip happens later, asynchronously, from a completely different component (`ReasonModal`, mounted at `app.jsx:3883` in `App`). The only reliable signal that a row has left the pending set, for both paths, is watching `req.status` change from `'pending'` to something else across renders of `requests`.

Frequency: occasional (a handful of approvals/declines per admin session, not a high-traffic action) — eligible for standard animation. Purpose: preventing a jarring/teleporting change. Budget: exits stay under ~250ms total.

## Target

When a request's status flips away from `'pending'` while the Pending tab is showing it, the row should collapse (height → 0) and fade out over 200ms using this repo's `EASE_OUT` token, instead of vanishing on the next render. The row stays in the DOM, non-interactive, for the duration of the exit, then is dropped.

```jsx
/* target — RequestRow, wrapping the existing row content */
function RequestRow({ req, requests, onApprove, onDecline, onDetail, onEdit, onCancel, selected, onToggle, onViewInCalendar, showStatus, removing }) {
  // ...unchanged setup (emp, hover, usedDays, remaining, overlapping, gridCols)...
  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: removing ? '0fr' : '1fr',
      transition: `grid-template-rows 200ms ${EASE_OUT}`,
      overflow: 'hidden',
    }}>
      <div style={{ minHeight: 0 }}>
        <div
          onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
          onClick={() => { if (!removing) onDetail(req); }}
          style={{
            display: 'grid', gridTemplateColumns: gridCols,
            alignItems: 'center', gap: 12, padding: '0 20px', minHeight: 52,
            borderBottom: `1px solid ${P.border}`,
            background: selected ? '#f5f3ff' : hover ? P.bg : P.white,
            cursor: removing ? 'default' : 'pointer',
            transition: `background 0.1s, opacity 150ms ${EASE_OUT}`,
            opacity: removing ? 0 : 1,
            pointerEvents: removing ? 'none' : 'auto',
          }}>
          {/* ...unchanged row content (checkbox, name, type, days, dates, avatar stack, action buttons)... */}
        </div>
      </div>
    </div>
  );
}
```

```jsx
/* target — RequestsScreen, tracking which rows are mid-exit */
const prevPendingIdsRef = useRef(new Set());
const removalTimersRef = useRef(new Set());
const [removingIds, setRemovingIds] = useState(() => new Set());

useEffect(() => {
  const currentPendingIds = new Set(requests.filter(r => r.status === 'pending').map(r => r.id));
  const justLeft = [...prevPendingIdsRef.current].filter(id => !currentPendingIds.has(id));
  if (justLeft.length > 0) {
    setRemovingIds(prev => new Set([...prev, ...justLeft]));
    const t = setTimeout(() => {
      setRemovingIds(prev => {
        const next = new Set(prev);
        justLeft.forEach(id => next.delete(id));
        return next;
      });
      removalTimersRef.current.delete(t);
    }, 220);
    removalTimersRef.current.add(t);
  }
  prevPendingIdsRef.current = currentPendingIds;
}, [requests]);

useEffect(() => () => { removalTimersRef.current.forEach(clearTimeout); }, []);
```

```jsx
/* target — render list for the Pending tab includes rows still mid-exit */
const displayRows = tab === 'pending'
  ? [...paginated, ...[...removingIds].filter(id => !paginated.some(r => r.id === id)).map(id => requests.find(r => r.id === id)).filter(Boolean)]
  : paginated;

// ...

) : displayRows.map(req => (
  <RequestRow key={req.id} req={req} requests={requests} onApprove={onApprove} onDecline={onDecline} onDetail={setDetail} onEdit={setEditReq} onCancel={onCancel} selected={selected.has(req.id)} onToggle={toggleSelect} onViewInCalendar={onViewInCalendar} showStatus={tab === 'all'} removing={removingIds.has(req.id)} />
))}
```

220ms timer vs. 200ms CSS transition: the 20ms buffer avoids a visible snap if the timer fires a frame before the transition's `transitionend` would — the row is removed from React state slightly after the visual collapse finishes, not before.

## Repo conventions to follow

- **Height-collapse pattern**: this codebase already collapses elements via a `display: grid; gridTemplateRows: open ? '1fr' : '0fr'` wrapper with `overflow: hidden`, exactly the technique used here. Exemplar: `SidebarAccordion`, `app.jsx:678-687`:
  ```js
  function SidebarAccordion({ open, children }) {
    return (
      <div style={{
        display: 'grid', gridTemplateRows: open ? '1fr' : '0fr',
        transition: `grid-template-rows 250ms ${EASE_OUT}`, overflow: 'hidden',
      }}>
        <div style={{ minHeight: 0 }}>{children}</div>
      </div>
    );
  }
  ```
  Reuse this shape verbatim (only the duration differs: 200ms here vs. 250ms there — both are within the sidebar/list-collapse budget).
- **Delayed-unmount-via-timer pattern**: this codebase already keeps a just-emptied UI element alive briefly to let its exit transition finish, using a boolean leaving-flag + `setTimeout`. Exemplar: the bulk-selection pill in `RequestsScreen`, `app.jsx:2074-2081`:
  ```js
  const [pillLeaving, setPillLeaving] = useState(false);
  useEffect(() => {
    if (selected.size === 0 && !pillLeaving) return;
    if (selected.size > 0) { setPillLeaving(false); return; }
    setPillLeaving(true);
    const t = setTimeout(() => setPillLeaving(false), 120);
    return () => clearTimeout(t);
  }, [selected.size]);
  ```
  This plan's `removingIds` is the same pattern generalized to a *set of ids* instead of one boolean, because multiple rows can be exiting at once (e.g. bulk-approve in a future feature) and each needs its own timer.
- **Easing token**: `EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'`, defined at `app.jsx:108`. Use this exact constant (already in scope in this file — do not redefine or approximate it).
- **Duration**: 200ms sits inside the "modals, drawers" / list-collapse budget this repo already uses for `SidebarAccordion` (250ms) and is appropriately snappier for a smaller, denser table row.

## Steps

1. **`RequestsScreen` — add exit-tracking state**, right after the existing `pillLeaving` effect block (`app.jsx:2074-2081`, insert immediately below it, before `const [searchText, setSearchText] = useState('');` at `app.jsx:2082`):
   ```jsx
   const prevPendingIdsRef = useRef(new Set());
   const removalTimersRef = useRef(new Set());
   const [removingIds, setRemovingIds] = useState(() => new Set());
   useEffect(() => {
     const currentPendingIds = new Set(requests.filter(r => r.status === 'pending').map(r => r.id));
     const justLeft = [...prevPendingIdsRef.current].filter(id => !currentPendingIds.has(id));
     if (justLeft.length > 0) {
       setRemovingIds(prev => new Set([...prev, ...justLeft]));
       const t = setTimeout(() => {
         setRemovingIds(prev => {
           const next = new Set(prev);
           justLeft.forEach(id => next.delete(id));
           return next;
         });
         removalTimersRef.current.delete(t);
       }, 220);
       removalTimersRef.current.add(t);
     }
     prevPendingIdsRef.current = currentPendingIds;
   }, [requests]);
   useEffect(() => () => { removalTimersRef.current.forEach(clearTimeout); }, []);
   ```
   `useRef` and `useEffect` are already imported/used throughout this file (React is loaded globally per the file's existing `useState`/`useEffect`/`useMemo` usage) — confirm `useRef` is available the same way (`React.useRef` or a destructured `useRef`, matching however `useState`/`useEffect` are referenced elsewhere in this component). If the file destructures hooks at the top (check the import/usage style already present for `useState`/`useEffect` in this same function), use the identical style for `useRef`.

2. **`RequestsScreen` — build `displayRows`**, immediately before the `filtered.length === 0 ? (...)` ternary at `app.jsx:2137`, insert:
   ```jsx
   const displayRows = tab === 'pending'
     ? [...paginated, ...[...removingIds].filter(id => !paginated.some(r => r.id === id)).map(id => requests.find(r => r.id === id)).filter(Boolean)]
     : paginated;
   ```
   Then change the render call at `app.jsx:2143-2145` from:
   ```jsx
   ) : paginated.map(req => (
     <RequestRow key={req.id} req={req} requests={requests} onApprove={onApprove} onDecline={onDecline} onDetail={setDetail} onEdit={setEditReq} onCancel={onCancel} selected={selected.has(req.id)} onToggle={toggleSelect} onViewInCalendar={onViewInCalendar} showStatus={tab === 'all'} />
   ))}
   ```
   to:
   ```jsx
   ) : displayRows.map(req => (
     <RequestRow key={req.id} req={req} requests={requests} onApprove={onApprove} onDecline={onDecline} onDetail={setDetail} onEdit={setEditReq} onCancel={onCancel} selected={selected.has(req.id)} onToggle={toggleSelect} onViewInCalendar={onViewInCalendar} showStatus={tab === 'all'} removing={removingIds.has(req.id)} />
   ))}
   ```
   Also update the `filtered.length === 0` empty-state check right above it to `displayRows.length === 0` so a row mid-exit doesn't briefly flash the empty state on the last item leaving the page. Change `{filtered.length === 0 ? (` at `app.jsx:2137` to `{displayRows.length === 0 ? (`. Leave the pagination footer's `filtered.length` references (`app.jsx:2146-2149`) as-is — pagination counts should reflect settled data, not mid-exit rows.

3. **`RequestRow` — accept the new `removing` prop** and restructure the return to wrap the existing row `<div>` in a height-collapse container. Change the function signature at `app.jsx:2007`:
   ```jsx
   function RequestRow({ req, requests, onApprove, onDecline, onDetail, onEdit, onCancel, selected, onToggle, onViewInCalendar, showStatus, removing }) {
   ```
   Then wrap the existing returned `<div>` (currently `app.jsx:2016-2060`, from `<div onMouseEnter={...}` through its closing `</div>`) in the collapse container, and add opacity/pointer-events to the existing row div's style object. The full replacement for `app.jsx:2016-2061` (the `return (...)` block through its closing `);`):
   ```jsx
   return (
     <div style={{
       display: 'grid',
       gridTemplateRows: removing ? '0fr' : '1fr',
       transition: `grid-template-rows 200ms ${EASE_OUT}`,
       overflow: 'hidden',
     }}>
       <div style={{ minHeight: 0 }}>
         <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => { if (!removing) onDetail(req); }}
           style={{
             display: 'grid', gridTemplateColumns: gridCols,
             alignItems: 'center', gap: 12, padding: '0 20px', minHeight: 52,
             borderBottom: `1px solid ${P.border}`,
             background: selected ? '#f5f3ff' : hover ? P.bg : P.white,
             cursor: removing ? 'default' : 'pointer',
             transition: `background 0.1s, opacity 150ms ${EASE_OUT}`,
             opacity: removing ? 0 : 1,
             pointerEvents: removing ? 'none' : 'auto',
           }}>
           <input type="checkbox" checked={selected} onClick={e => e.stopPropagation()} onChange={() => onToggle(req.id)} style={{ cursor: 'pointer', accentColor: P.ink }} />
           <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
             <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</span>
           </div>
           {showStatus && <StatusDot status={req.status} />}
           <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.ink }}>{req.type}</span>
           <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.ink }}>{req.days} {req.days === 1 ? 'day' : 'days'}</span>
           <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.ink }}>{req.startDate}</span>
           <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: req.startDate === req.endDate ? P.inkFaint : P.ink }}>
             {req.startDate === req.endDate ? '—' : req.endDate}
           </span>
           <span style={{ display: 'inline-flex', alignItems: 'center' }}>
             {overlapping.length === 0 ? (
               <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: P.inkFaint }}>—</span>
             ) : (
               <AvatarStack people={overlapping} />
             )}
           </span>
           <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
             {req.status === 'pending' && (<>
               <button title="Decline" onClick={() => onDecline(req.id)}
                 onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                 onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
                 style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                 <Icon name="X" size={14} color="#dc2626" strokeWidth={2.5} />
               </button>
               <button title="Approve" onClick={() => onApprove(req.id)}
                 onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.borderColor = '#86efac'; }}
                 onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#bbf7d0'; }}
                 style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #bbf7d0', background: '#f0fdf4', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                 <Icon name="Check" size={14} color="#16a34a" strokeWidth={2.5} />
               </button>
             </>)}
             <ActionMenu req={req} onViewDetails={() => onDetail(req)} onViewInCalendar={onViewInCalendar} onEdit={() => onEdit(req)} onCancel={() => onCancel(req.id)} />
           </div>
         </div>
       </div>
     </div>
   );
   ```
   Everything inside the innermost `<div>` is unchanged from the current file except the two edits already called out (`onClick` guard, `cursor`/`transition`/`opacity`/`pointerEvents` additions on that div's `style`). Do not alter the checkbox, avatar stack, button colors, or `ActionMenu` props.

4. **Accessibility — respect `prefers-reduced-motion`.** This file has no existing reduced-motion handling (verified: no `prefers-reduced-motion` occurrences anywhere in `app.jsx`), so this is new ground, not an override of a prior decision. Add a small helper near the top of the file, next to the other shared constants (e.g. right after `const EASE_BOUNCE = ...` at `app.jsx:109`):
   ```js
   const PREFERS_REDUCED_MOTION = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   ```
   Then in the `RequestRow` collapse-wrapper style from Step 3, make the height collapse conditional on it:
   ```jsx
   <div style={{
     display: 'grid',
     gridTemplateRows: removing ? '0fr' : '1fr',
     transition: PREFERS_REDUCED_MOTION ? 'none' : `grid-template-rows 200ms ${EASE_OUT}`,
     overflow: 'hidden',
   }}>
   ```
   and keep the opacity fade on the inner row div in all cases (opacity/color changes are allowed under reduced motion; only the height/transform movement is dropped) — shorten it to a near-instant fade when reduced motion is on:
   ```jsx
   transition: PREFERS_REDUCED_MOTION ? 'background 0.1s, opacity 100ms linear' : `background 0.1s, opacity 150ms ${EASE_OUT}`,
   ```
   This constant is computed once at module load (matching this file's existing style of module-level constants like `EASE_OUT`/`EASE_BOUNCE`), not re-evaluated per render — acceptable for a prototype; a real app would listen for changes via `matchMedia(...).addEventListener('change', ...)`, but that is out of scope here.

## Boundaries

- Do NOT touch `ReasonModal` (`app.jsx:967+`), `DetailModal` (`app.jsx:1034+`), `ActionMenu` (`app.jsx:910+`), or the `approve`/`decline`/`requestDecline` functions in `App` (`app.jsx:3726-3751`). This plan only changes what happens visually in the list after those functions already run — not when or how they're called.
- Do NOT change the bulk-selection pill (`pillLeaving`, `app.jsx:2074-2081`) — it is a separate, already-correct animation. Do not merge its timer with the new `removingIds` timers.
- Do NOT add a new easing token or duration constant — reuse `EASE_OUT` (`app.jsx:108`) exactly as defined.
- Do NOT change pagination math (`pageCount`, `safePage`, the `1–10 of N records` label) to account for mid-exit rows — those must keep reflecting settled data per Step 2.
- Do NOT apply this exit animation to the `EmployeeDetailScreen`'s absence history rows (`app.jsx:3448` area) or `DetailModal`'s inline approve/decline (`app.jsx:1161`) — scope is strictly `RequestRow` inside `RequestsScreen`'s Pending tab.
- Do NOT add any new npm dependency. Plain CSS-in-JS transitions only, matching the rest of the file.
- If the exact line numbers cited above have drifted from what you find in the file (this plan is stamped at commit `fb0b373`), stop and report the mismatch rather than guessing at the intended insertion point.

## Verification

- **Mechanical**: this is a single-file static prototype with no build step (Babel-in-browser via `<script type="text/babel" src="app.jsx?v=N">` in `project/hr-admin/index.html`). There is no typecheck/lint/build command to run. Instead:
  - Bump the cache-busting version query param in `project/hr-admin/index.html` (e.g. `app.jsx?v=243` → `app.jsx?v=244`) so the browser picks up the change.
  - Open the page in a browser and check the DevTools console for zero errors on load and on interacting with the Requests screen.
- **Feel check**: navigate to Time off → Requests → Pending tab (needs at least one pending request; the seed data in this file includes several).
  - Click the green Approve (✓) button on a row. Confirm the row's background fades to transparent while its height collapses to 0 over ~200ms, then it's gone — no instant pop, no layout jump in the rows below it.
  - Click the red Decline (✗) button, fill in a reason in the `ReasonModal`, and confirm. Confirm the same collapse animation plays for that row *after* the modal closes and the decline is confirmed — not while the modal is still open.
  - Rapidly approve two different pending rows one after another (before the first has finished collapsing). Confirm both animate independently and neither snaps or skips its transition (this is why `removingIds` is a `Set`, not a single boolean).
  - In DevTools' Rendering panel, enable "Emulate CSS media feature `prefers-reduced-motion`" → `reduce`, then approve a row again. Confirm the row now disappears via a fast opacity fade with no height-collapse motion.
  - In DevTools' Animations panel, set playback to 10% and step through one approve action. Confirm the collapse and the fade run concurrently (not sequentially) and both finish within the same ~200ms window, with no flash of unstyled/blank row.
  - Confirm clicking anywhere on a row mid-exit does nothing (the `pointerEvents: 'none'` guard) — it should not open `DetailModal`.
- **Done when**: approving or declining a pending request always shows a collapse+fade exit before the row leaves the list, both actions (instant approve, and modal-gated decline) animate correctly, multiple simultaneous exits don't interfere with each other, reduced-motion users get an instant-ish fade instead of the height collapse, and no existing behavior (pagination counts, empty state, bulk-select pill, `ActionMenu`) regresses.
