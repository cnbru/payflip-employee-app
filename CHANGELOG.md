# HR Admin Prototype — Changelog

A running log of what changed in the HR Admin prototype (`project/hr-admin/app.jsx`) and why. Written for product team members, not as a commit log — each entry groups related work and explains the reasoning, not just the diff.

This file is not part of the prototype itself; it's project documentation to keep the team aligned as the design evolves quickly.

---

## 2026-08-09 — Allowances: rate ceiling callouts, employee list & picker polish

- **NSSS ceiling feedback redesigned as callouts.** The "amount per month/km" hint below the rate field was plain inline text with no visual weight — easy to miss, and identical in style whether the rate was fine or over the legal ceiling. It's now a bordered callout: neutral white/gray by default, red when the entered rate exceeds the Belgian NSSS ceiling. *Why: admins set these rates rarely and need the ceiling warning to actually stand out, not blend into body copy.*
- **Enable/disable toggle bug fixed.** The switch for turning an allowance on/off could get stuck in the "on" position — the click handler was passing the raw click event into the state setter instead of toggling the boolean. *Why: broke the primary control on every allowance settings page.*
- **"How it works" info moved out of an always-visible card and into an on-demand modal**, triggered by a small ⓘ next to the page title. Went through a white-card version and a card-less inline version first; both still read as competing with the real settings on the page. *Why: this is reference info, not a setting — it shouldn't cost permanent vertical space or look interactive.*
- **Eligible employees list redesigned.** Replaced an orphaned "Edit employees" button + raw name list with a proper header (employee count + inline edit/add action) and gave each row a real remove control (circular button, red hover state) instead of a bare icon.
- **Employee picker modal (`PersonPickerModal`) rows reworked.** Checkbox moved from leading to trailing position to stop crowding the avatar, and rows gained a hover state they were missing entirely.
- **Copy fix:** "Enable home office" → "Enable home office allowance" for clarity when read out of context (e.g. in a settings list).
- **Footer button relabeled.** "Done" on the allowance settings page didn't commit anything — it just closed the screen. Relabeled to "Cancel" to match its actual behavior.

## 2026-08-09 — Settings screens: shared components, entity scoping fixes, and a changelog page

- **In-app Changelog page added**, linked from the sidebar. Renders the same content as this file (`ChangelogScreen` component, `CHANGELOG_ENTRIES` array) so product team members don't need to open a markdown file to see what shipped and why. *Why: a `.md` file at the repo root isn't visible to most of the team.*
- **`SettingsCard` + `SettingsRow` extracted as shared components** and migrated into `AllowancesListPage`, `ExpenseCategorySettings`, `TimeOffSettings`, `TeamAccessSettings`, and `BenefitsSettings`. These five screens had each independently hand-rolled the same clickable-row pattern (icon box, label, value, chevron) with details quietly drifting apart — Benefits, for instance, used a 32px icon box while everywhere else used 36px. *Why: a padding fix applied to one settings screen wasn't reaching the others, because there was no actual shared component to fix.*
- **Entity-scoping bug fixed across three settings screens.** Employee-linked lists (leave type exceptions, Team & access admins, an allowance's eligible-employee picker and assignment list) were showing employees from every entity regardless of which one was selected in the sidebar switcher — in two of the three cases, the screen never even received the selected entity as a prop. Fixed by threading `appEntity` through and filtering with the same `!appEntity || emp.entityId === appEntity` pattern already used for requests/expenses/choices at the top level. When viewing "All entities," rows now show `department · entity` so a cross-entity list is legible at a glance.
- **Expenses settings: policy settings moved above the category list.** "Reimbursement cycle" and "Require receipt above" were sitting below a variable-length list of expense categories, easy to miss if there were enough categories to push them off-screen. Moved to the top, split into their own labeled sections (they aren't related to each other), and dropped the icon boxes so they read as form fields rather than another list of manageable items.
- **Mileage rate hint de-duplicated.** The callout below the rate field was restating a number already visible in the field above it ("official rate: €0.4296/km" directly under an input showing 0.4296). Now it only states the official rate when the admin has actually changed the value away from default — otherwise it's a plain caption with just the one piece of non-obvious information (the rate isn't auto-updated).
- **Design token consistency:** the disabled `Switch` track and the segmented-control (tabs) background were two near-identical one-off grays (`#d1d5db`, `#ebebed`) instead of pulling from the existing `P.borderStrong`/`P.border` tokens. Unified to those tokens, tuned per role — a switch track needs enough contrast to read as a control, a tab bar background is a passive surface and stays lighter.

## 2026-08-09 / 2026-08-07 — Leave type settings: from drawer to full settings page

Leave type configuration was rebuilt from a side drawer into a dedicated settings page over two days of iteration (~40 incremental commits). Net result:

- **Drawer replaced with a full settings page per leave type**, matching the pattern later reused for Allowances. *Why: leave type configuration grew too many interdependent fields (approval, day limits, document requirements, employee permissions, Belgian statutory sub-types) to fit comfortably in a drawer.*
- **Day limit pattern unified** into one consistent sub-field style across all leave types, replacing several ad-hoc inline-input variants tried along the way.
- **Belgian special leave sub-types added** (with their own statutory fields) and grouped under clear section headers, alongside a "Requires approval" reframing that replaced the earlier generic "edit/cancel" toggles with copy that states the actual behavior and payroll consequences.
- **Employee-level exceptions** added, so an admin can override a leave type's default rules for specific employees without creating a whole separate leave type.
- **Delete flow added** with a confirmation modal, and a disabled-state callout so a turned-off leave type still explains what disabling it means instead of just graying out.
- **List view surfaces the type's key properties as a subtitle** (approval required, doc required, day limit) with dot separators, so admins can scan the list without opening each type.

## 2026-07-28 — Entity switcher & sidebar

- **Entity switcher rebuilt as a right-side popover**, replacing an inline accordion that pushed the rest of the sidebar down when expanded.
- **Sidebar widened 216 → 255px** with more breathing room around the entity switcher and nav — the accordion-era spacing felt cramped once the switcher moved out.
- **Screen content animates in on entity switch** instead of instantly refreshing, and the old per-screen "time off override" pattern for multi-entity data was removed in favor of one consistent mechanism.
- **Documents scope model unified** — replaced an "inherited" scope concept with a single explicit scope field, removing a source of ambiguity about which entity a document applied to.

## 2026-07-24 to 2026-07-26 — Team & Access

Admin access management went through the heaviest iteration of any feature in this prototype (~35 commits across three days) before landing on its current shape:

- **User/role model unified**: admin access now lives on the same `EMPLOYEES` record via `adminAccess`, instead of a parallel user list. *Why: avoided two sources of truth for "is this person an admin."*
- **Settled on a single 4-option access model** (Full admin vs. role-based, with multi-role support for non-full admins) after trying and discarding an owner/admin distinction, a by-department approval option, and a revoke-access flow that didn't fit the mental model.
- **Grant flow simplified to a two-step modal**: pick a person, then configure their access — replacing several earlier attempts (radio-only picker, immediate role config, separate revoke action).
- **Employee detail page got a real Team & Access section** — read-only status with grant/configure actions, cross-linked to the full Team & Access settings page instead of duplicating the config UI.

## 2026-07-22 to 2026-07-23 — Team calendar, Expenses, Choices

- **CalendarDrawer overhauled** to replace a separate detail modal: unified request detail, team availability, and overlap warnings into one drawer with clear sectioned rows. *Why: admins reviewing a time-off request needed team context (who else is out) without leaving the drawer.*
- **Team availability indicator redesigned twice**: first as a red badge/pill, ending on a two-state color system (red tint + count when someone's out, green tint + "All available" otherwise) with per-avatar colored border rings instead of background tints.
- **Accessibility fix:** requests table header contrast raised from 2.6:1 to 7.5:1 (`inkFaint` → `inkSoft`) — the original color failed contrast guidelines for body text.
- **Link styling standardized**: extracted a shared `AppLink` component (black, underlined) and replaced every accent-colored link across the app with it, so links stop competing visually with primary actions.
- **Expenses added** as a new top-level screen (list, drawer, filters, search).
- **Choices added** as a new top-level screen with an approve/decline workflow, plus a food-benefit onboarding flow that routes through the social secretariat step Belgian payroll requires.

## 2026-07-14 to 2026-07-17 — Time off & employee detail foundation

- **Employee detail page rebuilt** to match the production layout, with a dedicated "Leave & absences" tab (renamed from "Time off") and per-employee data instead of shared placeholder content.
- **Edit balances modal redesigned** with clear sections, a "no limit" toggle, and negative-balance clamping — replacing an earlier flat form that let balances go negative or unbounded.
- **Belgian leave types matched to the employee-facing app** (ADV/RTT, extra-legal leave added; generic "paid/unpaid absence" removed) so HR admin and employee app describe leave the same way.
- **Requests table redesigned**: conditional status column, inline approve/decline, and avatar overlap with date tooltips — replacing a table that required opening each request to act on it.
- **Sheet/drawer animation tuned**: iOS-style drawer curve with asymmetric open/close timing, after an initial version had a visible cut-off on exit.
- **Avatar tooltip clipping fixed** by rendering via `ReactDOM.createPortal`, since the tooltip was getting clipped by `overflow: hidden` on ancestor containers — a recurring class of bug in nested card layouts.

## 2026-06-19 to 2026-07-03 — Initial HR Admin prototype

- **HR Admin desktop prototype created** from scratch: approval inbox, app switcher (linking to the employee-facing app), and initial navigation.
- **Employee app and HR admin connected via localStorage** so actions in one reflect in the other during the prototype demo, without a real backend.
- **Team absences view added**, splitting "Time off" into two sub-items (requests vs. team calendar) to separate "things I need to act on" from "what's the team's status."
- **Employees section added** with an Edit balances modal, and employee identity fields locked once an employee record exists (to prevent accidental identity changes mid-edit).
- **Half-day support, collective holiday type, and sick-leave document upload** added to the request/absence flow, alongside a broader nav overhaul.
