# 008 — Animate table content on entity switch in DocumentsSettings

- **Status**: DONE
- **Commit**: fd8328a
- **Severity**: LOW
- **Category**: Missed opportunity — feedback + preventing a jarring change
- **Estimated scope**: 1 file (`project/hr-admin/app.jsx`), ~10 line changes

## Problem

When the user picks a different entity via `EntityPageSwitcher`, the table content area in `DocumentsSettings` re-renders instantly with no transition. On the **Company documents** tab this is noticeable — inherited rows appear and entity-specific rows change — but on the **Templates** tab the content is *identical* regardless of entity, so there is zero visual confirmation that the switch did anything.

**Affected locations in `project/hr-admin/app.jsx`:**

```jsx
// line 7060–7064 — Templates tab card (content identical for all entities, no re-mount feedback)
{tab === 'templates' && (
  <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'clip' }}>
    <DocTable rows={DOC_TEMPLATES} />
  </div>
)}

// line 7068–7070 — Company documents, entity view (switches between entity branches, no animation)
{tab === 'company' && (
  entity ? (
    <React.Fragment>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'clip' }}>
        ...
      </div>

// line 7133–7136 — Company documents, defaults view (no animation on mount)
    <React.Fragment>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'clip' }}>
        <DocTable rows={DOC_COMPANY} />
      </div>
```

The existing `@keyframes screenEnter` (line 7474) covers full page navigation transitions but is not wired to in-page data switches.

## Target

A new `@keyframes tableEnter` at 150ms / 4px — proportionally smaller than `screenEnter` (180ms / 6px) because this is a filter switch, not a page navigation. Uses the existing `EASE_OUT` constant. Reduced-motion variant keeps the opacity fade but drops the translate.

**New keyframes to add** (near line 7477, after `screenEnter`):
```css
@keyframes tableEnter {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes tableEnterReduced {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

**EASE_OUT constant** (already defined at line 130, do NOT redefine):
```js
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
```

**PREFERS_REDUCED_MOTION constant** (already defined at line 133, do NOT redefine):
```js
const PREFERS_REDUCED_MOTION = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

**Animation value to apply** (inline style):
```js
animation: `${PREFERS_REDUCED_MOTION ? 'tableEnterReduced' : 'tableEnter'} 150ms cubic-bezier(0.22, 1, 0.36, 1)`
// — or using the existing constant:
animation: `${PREFERS_REDUCED_MOTION ? 'tableEnterReduced' : 'tableEnter'} 150ms ${EASE_OUT}`
```

## Repo conventions to follow

- All animation is inline React styles on plain `<div>` elements — no CSS classes, no motion library.
- Keyframes live in a single `<style>` block rendered inside the app (search for `@keyframes screenEnter` at line 7474 to find it).
- `PREFERS_REDUCED_MOTION` (line 133) is the existing pattern for gating motion — use it inline in the style value, not a separate conditional render.
- Exemplar of the same pattern used in this file:
  ```jsx
  // line 3366 — file row entrance in expense upload
  animation: `fileRowIn 220ms ${EASE_OUT}`
  // @keyframes fileRowIn defined at line 7478:
  // from { opacity: 0; transform: translateY(5px); }
  // to   { opacity: 1; transform: translateY(0); }
  ```

## Steps

### Step 1 — Add `tableEnter` keyframes to the global style block

Find the `@keyframes screenEnter` block at **line 7474**:
```css
@keyframes screenEnter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Insert immediately after the closing `}` of `screenEnter` (before `@keyframes fileRowIn`):
```css
@keyframes tableEnter {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes tableEnterReduced {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

---

### Step 2 — Animate the Templates tab card; add `key` to force re-mount on entity change

Find (line 7060):
```jsx
{tab === 'templates' && (
  <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'clip' }}>
    <DocTable rows={DOC_TEMPLATES} />
  </div>
)}
```

Replace with:
```jsx
{tab === 'templates' && (
  <div key={entity ?? 'defaults'} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'clip', animation: `${PREFERS_REDUCED_MOTION ? 'tableEnterReduced' : 'tableEnter'} 150ms ${EASE_OUT}` }}>
    <DocTable rows={DOC_TEMPLATES} />
  </div>
)}
```

**Why `key`?** The Templates content is identical for every entity, so React never unmounts/remounts the `<div>` when `entity` changes — the animation would only play once (on tab mount). Adding `key={entity ?? 'defaults'}` forces a remount on each entity switch, re-triggering the CSS animation.

---

### Step 3 — Animate the Company documents entity view; add `key` to force re-mount on entity change

Find (line 7070):
```jsx
entity ? (
  <React.Fragment>
    <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'clip' }}>
```

The `React.Fragment` has no key, so when `entity` changes from `'lumio-france'` to `'lumio-netherlands'` (both truthy), React re-renders in place rather than remounting. Add `key={entity}` to the `<div>` to force remount:

```jsx
entity ? (
  <React.Fragment>
    <div key={entity} style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'clip', animation: `${PREFERS_REDUCED_MOTION ? 'tableEnterReduced' : 'tableEnter'} 150ms ${EASE_OUT}` }}>
```

---

### Step 4 — Animate the Company documents defaults view

When switching **from** an entity **back** to company defaults (`entity → null`), the conditional branch changes from `entity ? (...)` to `(...)`, so React already unmounts and remounts the `<React.Fragment>`. No `key` needed. Just add the animation:

Find (line ~7133):
```jsx
    <React.Fragment>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'clip' }}>
        <DocTable rows={DOC_COMPANY} />
      </div>
```

Replace the `<div>` opening tag:
```jsx
    <React.Fragment>
      <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'clip', animation: `${PREFERS_REDUCED_MOTION ? 'tableEnterReduced' : 'tableEnter'} 150ms ${EASE_OUT}` }}>
        <DocTable rows={DOC_COMPANY} />
      </div>
```

---

## Boundaries

- Do NOT touch `EntityPageSwitcher`, `EntityPickerModal`, or any modal/drawer component — those are already animated.
- Do NOT animate the "Add document" button or the tabs row.
- Do NOT change the `DOC_TEMPLATES`, `DOC_COMPANY`, or `entityDocs` data.
- Do NOT add or change any easing/duration constants — use existing `EASE_OUT` and `PREFERS_REDUCED_MOTION`.
- If the line numbers have drifted since commit `fd8328a`, locate the code by searching for the exact string excerpts above — do NOT guess or improvise.

## Verification

- **Mechanical**: Open the prototype in a browser at `http://localhost:4489/hr-admin/`. No build step — the file is loaded directly via Babel in-browser. Bump the cache version in `project/hr-admin/index.html` (e.g. `app.jsx?v=649`) to force reload.

- **Feel check**:
  1. Navigate to Settings → Documents. Open the entity switcher and pick "Lumio France". The table card should fade+slide in from 4px below. It should feel lighter than the full page enter — a filter switch, not a navigation.
  2. Switch to "Lumio Netherlands" while staying on the same tab. The table should re-animate. It should not snap or jump.
  3. Switch to the Templates tab. Switch entity again. Even though the rows are identical, the table should re-animate — confirming the switch landed.
  4. Switch back to "Company defaults". The table should re-animate.
  5. In DevTools → Animations panel, set playback to 10%. Confirm: `opacity` goes 0 → 1, `translateY` goes 4px → 0, curve is `cubic-bezier(0.22, 1, 0.36, 1)` (fast start, settles quickly — no overshoot).
  6. In DevTools → Rendering panel, enable "Emulate CSS media feature prefers-reduced-motion: reduce". Repeat steps 1–4. Confirm: the fade still plays, the translate does NOT play.

- **Done when**: entity switches on both tabs produce a visible fade-in with a 4px upward settle, the animation replays on every switch (not just the first), and reduced-motion removes the translate while keeping the opacity feedback.
