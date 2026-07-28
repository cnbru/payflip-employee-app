# 009 — Animate content on entity switch

- **Status**: TODO
- **Commit**: fd8328a
- **Severity**: MEDIUM
- **Category**: Missed opportunity — preventing a jarring change
- **Estimated scope**: 1 file (`project/hr-admin/app.jsx`), ~11 line changes (one `key` prop added per screen component)

## Problem

When the user picks a different entity via `EntitySwitcher` in the sidebar, `appEntity` changes but the currently active screen component **stays mounted** — React re-renders it in-place with new props. All page content (titles, tables, values, badges) swaps instantly with no visual bridge.

Every screen already plays `screenEnter` (opacity 0 → 1, translateY 6px → 0, 180ms) on **navigation** — because navigating away unmounts the component and navigating back mounts a new one. The entity switch bypasses this entirely: same screen, same mount, no animation.

**Affected location — `project/hr-admin/app.jsx` lines 7588–7602:**

```jsx
{screen === 'dashboard' && <DashboardScreen requests={entityFilteredRequests} onNav={setScreen} onToast={setToast} appEntity={appEntity} />}
{screen === 'team-absences' && <TeamAbsencesScreen ... appEntity={appEntity} />}
{screen === 'requests' && <RequestsScreen ... appEntity={appEntity} />}
{(screen === 'employees' || screen === 'employees:admin') && <EmployeesScreen ... appEntity={appEntity} />}
{screen === 'expenses' && <ExpensesScreen ... appEntity={appEntity} />}
{screen === 'choices' && <ChoicesScreen ... appEntity={appEntity} />}
{screen === 'settings-expenses' && <ExpenseCategorySettings ... appEntity={appEntity} />}
{screen === 'settings-team' && <TeamAccessSettings ... appEntity={appEntity} />}
{screen === 'settings-entities' && <EntitiesSettings ... appEntity={appEntity} />}
{screen === 'settings-timeoff' && <TimeOffSettings appEntity={appEntity} />}
{screen === 'settings-documents' && <DocumentsSettings appEntity={appEntity} />}
```

None of these carry a `key` prop, so entity changes never cause a remount.

## Target

Add `key={appEntity ?? 'all'}` to each of the 11 screen components listed above. React will unmount+remount the component on every entity change, which re-triggers the `screenEnter` keyframe that is already defined and already wired to each screen's root div.

No new keyframes. No new constants. No new CSS. The animation infrastructure is already in place — this change is the missing trigger.

**The existing `screenEnter` keyframe** (line 7557):
```css
@keyframes screenEnter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

**The existing animation on every screen root div** (representative example, line 3495):
```jsx
<div style={{ ..., animation: `screenEnter 180ms ${EASE_OUT}` }}>
```

**EASE_OUT constant** (already defined at line 130, do NOT redefine):
```js
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
```

## Repo conventions to follow

- All animation is inline React styles on plain `<div>` elements — no CSS classes, no motion library.
- `key` props on conditional screen renders are the existing pattern for forcing remounts (e.g. `CalendarDrawer` at line 7607 uses `key={calDetail.id}`).
- The `screenEnter` animation is intentionally **not** gated behind `PREFERS_REDUCED_MOTION` elsewhere in this file — follow the same convention; do not add gating here.

## Steps

### Step 1 — DashboardScreen (line 7588)

Find:
```jsx
{screen === 'dashboard' && <DashboardScreen requests={entityFilteredRequests} onNav={setScreen} onToast={setToast} appEntity={appEntity} />}
```

Replace with:
```jsx
{screen === 'dashboard' && <DashboardScreen key={appEntity ?? 'all'} requests={entityFilteredRequests} onNav={setScreen} onToast={setToast} appEntity={appEntity} />}
```

---

### Step 2 — TeamAbsencesScreen (line 7589)

Find:
```jsx
{screen === 'team-absences' && <TeamAbsencesScreen requests={entityFilteredRequests} pendingCount={pendingRequestsCount} onNav={setScreen} onShowDetail={setCalDetail} activeReqId={calDetail?.id} onSave={saveRequest} companyEvents={companyEvents} onCancelCompanyEvent={cancelCompanyEvent} initialDate={calendarJumpDate} initialDeptFilter={calendarDeptFilter} appEntity={appEntity} />}
```

Replace — add `key={appEntity ?? 'all'}` immediately after `<TeamAbsencesScreen`:
```jsx
{screen === 'team-absences' && <TeamAbsencesScreen key={appEntity ?? 'all'} requests={entityFilteredRequests} pendingCount={pendingRequestsCount} onNav={setScreen} onShowDetail={setCalDetail} activeReqId={calDetail?.id} onSave={saveRequest} companyEvents={companyEvents} onCancelCompanyEvent={cancelCompanyEvent} initialDate={calendarJumpDate} initialDeptFilter={calendarDeptFilter} appEntity={appEntity} />}
```

---

### Step 3 — RequestsScreen (line 7590)

Find:
```jsx
{screen === 'requests' && <RequestsScreen requests={entityFilteredRequests} onApprove={approve} onDecline={requestDecline} onSave={saveRequest} onCancel={requestCancel} onNav={setScreen} onViewInCalendar={(req) => { const d = req._selectedDates?.[0] || req.startDate; if (d) { const iso = typeof d === 'string' && d.match(/^\d{4}-/) ? d : null; setCalendarJumpDate(iso ? new Date(iso) : parseDisplayDate(d)); } setCalDetail(req); setScreen('team-absences'); }} appEntity={appEntity} />}
```

Replace — add `key={appEntity ?? 'all'}` immediately after `<RequestsScreen`:
```jsx
{screen === 'requests' && <RequestsScreen key={appEntity ?? 'all'} requests={entityFilteredRequests} onApprove={approve} onDecline={requestDecline} onSave={saveRequest} onCancel={requestCancel} onNav={setScreen} onViewInCalendar={(req) => { const d = req._selectedDates?.[0] || req.startDate; if (d) { const iso = typeof d === 'string' && d.match(/^\d{4}-/) ? d : null; setCalendarJumpDate(iso ? new Date(iso) : parseDisplayDate(d)); } setCalDetail(req); setScreen('team-absences'); }} appEntity={appEntity} />}
```

---

### Step 4 — EmployeesScreen (line 7591)

Find:
```jsx
{(screen === 'employees' || screen === 'employees:admin') && <EmployeesScreen requests={entityFilteredRequests} onNav={setScreen} initialRoleFilter={screen === 'employees:admin' ? 'Admin' : 'All'} adminAccess={adminAccess} appEntity={appEntity} />}
```

Replace — add `key={appEntity ?? 'all'}` immediately after `<EmployeesScreen`:
```jsx
{(screen === 'employees' || screen === 'employees:admin') && <EmployeesScreen key={appEntity ?? 'all'} requests={entityFilteredRequests} onNav={setScreen} initialRoleFilter={screen === 'employees:admin' ? 'Admin' : 'All'} adminAccess={adminAccess} appEntity={appEntity} />}
```

---

### Step 5 — ExpensesScreen (line 7593)

Find:
```jsx
{screen === 'expenses' && <ExpensesScreen expenses={entityFilteredExpenses} categories={expenseCategories} onApprove={approveExpense} onDetail={(exp) => setExpDetail(exp)} onAdd={addExpense} appEntity={appEntity} />}
```

Replace — add `key={appEntity ?? 'all'}`:
```jsx
{screen === 'expenses' && <ExpensesScreen key={appEntity ?? 'all'} expenses={entityFilteredExpenses} categories={expenseCategories} onApprove={approveExpense} onDetail={(exp) => setExpDetail(exp)} onAdd={addExpense} appEntity={appEntity} />}
```

---

### Step 6 — ChoicesScreen (line 7594)

Find:
```jsx
{screen === 'choices' && <ChoicesScreen choices={entityFilteredChoices} onApprove={approveChoice} onDecline={declineChoice} onDetail={setChoiceDetail} appEntity={appEntity} />}
```

Replace — add `key={appEntity ?? 'all'}`:
```jsx
{screen === 'choices' && <ChoicesScreen key={appEntity ?? 'all'} choices={entityFilteredChoices} onApprove={approveChoice} onDecline={declineChoice} onDetail={setChoiceDetail} appEntity={appEntity} />}
```

---

### Step 7 — ExpenseCategorySettings (line 7597)

Find:
```jsx
{screen === 'settings-expenses' && <ExpenseCategorySettings categories={expenseCategories} onSave={setExpenseCategories} appEntity={appEntity} />}
```

Replace — add `key={appEntity ?? 'all'}`:
```jsx
{screen === 'settings-expenses' && <ExpenseCategorySettings key={appEntity ?? 'all'} categories={expenseCategories} onSave={setExpenseCategories} appEntity={appEntity} />}
```

---

### Step 8 — TeamAccessSettings (line 7598)

Find:
```jsx
{screen === 'settings-team' && <TeamAccessSettings onNav={setScreen} adminAccess={adminAccess} onAdminSave={handleAdminSave} appEntity={appEntity} />}
```

Replace — add `key={appEntity ?? 'all'}`:
```jsx
{screen === 'settings-team' && <TeamAccessSettings key={appEntity ?? 'all'} onNav={setScreen} adminAccess={adminAccess} onAdminSave={handleAdminSave} appEntity={appEntity} />}
```

---

### Step 9 — EntitiesSettings (line 7599)

Find:
```jsx
{screen === 'settings-entities' && <EntitiesSettings onNav={setScreen} appEntity={appEntity} />}
```

Replace — add `key={appEntity ?? 'all'}`:
```jsx
{screen === 'settings-entities' && <EntitiesSettings key={appEntity ?? 'all'} onNav={setScreen} appEntity={appEntity} />}
```

---

### Step 10 — TimeOffSettings (line 7600)

Find:
```jsx
{screen === 'settings-timeoff' && <TimeOffSettings appEntity={appEntity} />}
```

Replace — add `key={appEntity ?? 'all'}`:
```jsx
{screen === 'settings-timeoff' && <TimeOffSettings key={appEntity ?? 'all'} appEntity={appEntity} />}
```

---

### Step 11 — DocumentsSettings (line 7601)

Find:
```jsx
{screen === 'settings-documents' && <DocumentsSettings appEntity={appEntity} />}
```

Replace — add `key={appEntity ?? 'all'}`:
```jsx
{screen === 'settings-documents' && <DocumentsSettings key={appEntity ?? 'all'} appEntity={appEntity} />}
```

---

### Step 12 — Bump cache version in `project/hr-admin/index.html`

Find:
```html
<script type="text/babel" src="app.jsx?v=688"></script>
```

Increment the version number by 1 (e.g. `v=689`) to force the browser to reload the updated file.

---

## Boundaries

- Do NOT add `key` to `EmployeeDetailScreen` — its `screen` value already contains the employee ID, so it remounts on navigation naturally. Entity switching while on an employee detail page is an edge case with no clear correct behavior; leave it alone.
- Do NOT add `key` to `StubScreen` components — they receive no `appEntity` prop and show static content.
- Do NOT touch any component definition, any keyframe, any easing constant, or any animation style — this plan adds only `key` props at the call sites.
- Do NOT add `PREFERS_REDUCED_MOTION` gating — the existing `screenEnter` usages in this file do not gate on it; follow that convention.
- If any line number has drifted since commit `fd8328a`, locate the code by searching for the exact string excerpts above — do NOT guess.

## Verification

- **Mechanical**: Open the prototype at `http://localhost:4489/hr-admin/`. No build step — loaded directly via Babel in-browser. Bump the cache version in `project/hr-admin/index.html` (Step 12 above) to force reload.

- **Feel check**:
  1. Navigate to any screen (e.g. Requests). Open the entity switcher in the sidebar and pick "Lumio France". The entire page content should fade+slide in from 4px below — identical in character to navigating between screens. It should feel like confirmation that the context switched, not a page reload.
  2. Switch entity again (e.g. Lumio Netherlands). The animation should replay. It should feel settled and crisp — 180ms is short enough that it never feels like waiting.
  3. Switch back to "All entities". The animation should replay again.
  4. Navigate to a different screen (e.g. Employees) while an entity is active. The nav animation should play exactly as before — confirm the `key` change did not break existing nav transitions.
  5. In DevTools → Animations panel, set playback to 10%. Confirm: `opacity` goes 0 → 1, `translateY` goes 6px → 0, curve is `cubic-bezier(0.22, 1, 0.36, 1)`.

- **Done when**: every entity switch on any screen produces a visible fade+slide-in, the animation replays on every switch (not just the first), and existing navigation transitions are unaffected.
