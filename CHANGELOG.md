# Product Changelog

A log of product and UX decisions made while building the HR Admin prototype (`project/hr-admin/app.jsx`) — what we decided, why, and what we tried and discarded along the way. This is not a bug tracker or a commit log: mechanical fixes aren't recorded here unless they reflect an actual product or design-system decision.

This file is not part of the prototype itself — it's project documentation to keep the team aligned as the design evolves quickly, especially in areas we're still actively figuring out (multi-entity permissioning, the admin access model, leave-type configuration).

---

## 2026-08-09 — Allowances: surfacing legal ceiling risk, and where reference info belongs

- **NSSS ceiling feedback redesigned as callouts that escalate from neutral to red.** *Why:* admins configure these rates rarely, and the "you're over the legal ceiling" warning previously looked identical to routine informational text — it needed to visually escalate so it can't be missed the one time it actually matters.
- **"How it works" info moved out of an always-visible card and into an on-demand modal**, triggered by a small ⓘ next to the page title. *Why:* this is reference info, not a setting. A white card and a card-less inline version were both tried first and still read as competing with the actual settings on the page — information that explains a feature shouldn't cost permanent space or look interactive.
- **Eligible employees list redesigned** with a count + inline edit/add action in the header and an explicit remove control per row. *Why:* the previous layout had no clear "how many, how do I change this" entry point.

## 2026-08-09 — Settings screens: consistency, and getting multi-entity scoping right

- **Multi-entity data isolation enforced for employee-linked settings lists** (leave type exceptions, Team & access admins, allowance eligibility). *Why:* this is a hard product rule, not a preference — an admin scoped to one legal entity must never see or assign employees belonging to a different entity. Two of three affected screens weren't enforcing this yet. When viewing "All entities," rows now show `department · entity` so a cross-entity list reads intentionally instead of looking like an unscoped mistake.
- **Row and icon treatment unified across every settings list screen** (Allowances, Expenses, Time off, Team & access, Benefits). *Why:* these screens evolved independently and drifted apart in small ways nobody chose deliberately (Benefits had ended up with a smaller icon box than everywhere else). Now backed by one shared component, so a fix in one place reaches all of them instead of needing to be repeated five times.
- **Expenses settings: company-wide policy (reimbursement cycle, receipt threshold) moved above the category list**, and split into two separate sections since they aren't related to each other. *Why:* they're global policy, not a list to manage — placed below a variable-length category list, they could scroll off-screen and go unnoticed.
- **Design tokens: `Switch` track and segmented-control background unified** onto the existing border tokens instead of two near-identical one-off grays, tuned per role — a switch track needs contrast to read as a control, a tab bar background stays lighter as a passive surface.
- **In-app Product Changelog page added**, linked from the sidebar, so this document is visible to the whole team without opening a markdown file.

## 2026-08-07 to 08-09 — Leave type settings: from drawer to full settings page

Leave type configuration outgrew a side drawer and was rebuilt as a dedicated settings page — a decision that reshaped several sub-decisions underneath it:

- **Drawer replaced with a full settings page per leave type.** *Why:* configuration had accumulated too many interdependent fields (approval, day limits, document requirements, employee permissions, Belgian statutory sub-types) to fit a drawer without feeling cramped. This became the pattern later reused for Allowances.
- **"Requires approval" reframing** replaced generic "edit/cancel" toggles with copy stating the actual behavior and payroll consequence, after the generic toggles proved unclear about what they actually controlled.
- **Belgian special leave sub-types added** with their own statutory fields, grouped under clear section headers. *Why:* "special leave" isn't one thing legally — it's several distinct entitlements, each with its own rules.
- **Employee-level exceptions added**, so an admin can override a leave type's default rules for one employee without cloning an entire separate leave type. *Why:* a new leave type per exception doesn't scale and obscures that it's still the same underlying leave type with a tweak.
- **Day limit pattern unified** into one consistent sub-field style across all leave types, after several inline-input variants were tried along the way.

## 2026-07-28 — Entity switcher: one consistent mechanism for multi-entity data

- **Entity switcher rebuilt as a right-side popover**, replacing an inline accordion that pushed the rest of the sidebar down when expanded. *Why:* an always-present, frequently-used control shouldn't reflow the nav around it.
- **Removed the per-screen "time off override" pattern** in favor of one consistent multi-entity mechanism used everywhere. *Why:* letting one screen handle multi-entity data differently from the rest is exactly the kind of inconsistency that later causes scoping bugs — better to solve it once, centrally.
- **Documents scope model unified** — replaced an ambiguous "inherited" scope concept with a single explicit scope field. *Why:* "inherited" didn't answer the question an admin actually has: which entity does this document apply to, right now.

## 2026-07-24 to 07-26 — Team & Access: settling the admin permission model

Admin access management went through the heaviest iteration of any feature in this prototype (~35 commits across three days) before landing on its current shape — worth documenting in full, since several plausible models were tried and rejected before this one stuck:

- **User/role model unified**: admin access now lives on the same employee record via `adminAccess`, instead of a parallel user list. *Why:* avoided two sources of truth for "is this person an admin."
- **Settled on a single 4-option access model** (Full admin vs. role-based, with multi-role support for non-full admins) — after trying and discarding an owner/admin distinction, a by-department approval option, and a revoke-access flow, none of which matched how admins actually think about access.
- **Grant flow simplified to a two-step modal**: pick a person, then configure their access — replacing several earlier attempts (radio-only picker, immediate role config, separate revoke action) that each solved part of the flow but not the whole thing.
- **Employee detail page shows admin status read-only, cross-linked to Team & Access**, rather than duplicating the configuration UI in two places. *Why:* there should be exactly one place where access is actually configured.

## 2026-07-22 to 07-23 — Team calendar, Expenses, Choices

- **CalendarDrawer overhauled** to unify request detail, team availability, and overlap warnings into one drawer. *Why:* an admin reviewing a time-off request needs team context — who else is out — to make the call, without leaving the drawer to go find it.
- **Team availability indicator settled on a two-state color system** (red tint + count when someone's out, green tint + "All available" otherwise), after an initial red-badge-only version didn't communicate the common case — nobody's out — as clearly as the exception case.
- **Link styling standardized** on a shared `AppLink` component (black, underlined), replacing every accent-colored link app-wide. *Why:* links were competing visually with primary actions.
- **Expenses added as a new top-level screen.** *Why:* a scope decision to bring expense management to parity with time-off/choices rather than leave it as an afterthought.
- **Choices added as a new top-level screen**, including a food-benefit onboarding flow that routes through the social secretariat step Belgian payroll actually requires. *Why:* the flow had to reflect a real compliance step, not just the happy path.

## 2026-07-14 to 07-17 — Time off & employee detail: matching production reality

- **Belgian leave types matched to the employee-facing app** (ADV/RTT, extra-legal leave added; generic "paid/unpaid absence" removed). *Why:* HR admin and the employee app need to describe leave the same way, or admins and employees end up talking past each other about the same request.
- **Edit balances modal redesigned** with a "no limit" toggle and negative-balance clamping. *Why:* the previous flat form allowed balances to go negative or unbounded — not a state a leave balance can actually be in.
- **Requests table redesigned** for inline approve/decline, replacing a table that required opening each request just to act on it. *Why:* the common action shouldn't require a navigation.

## 2026-06-19 to 07-03 — Initial HR Admin prototype: scope and structure

- **HR Admin desktop prototype started from scratch**, scoped to an approval inbox and core navigation first, with an app switcher linking to the employee-facing app.
- **"Time off" split into two sub-items** (requests vs. team calendar). *Why:* "things I need to act on" and "what's the team's status" are different questions an admin asks — one view was already fighting that distinction.
- **Employee identity fields locked once a record exists.** *Why:* a deliberate constraint to prevent accidental identity changes to an employee record after creation, not an oversight.
