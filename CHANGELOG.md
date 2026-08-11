# Product Changelog

A log of product and UX decisions made while building the HR Admin prototype (`project/hr-admin/app.jsx`) — what we decided, why, and what we tried and discarded along the way. This is not a bug tracker or a commit log: mechanical fixes aren't recorded here unless they reflect an actual product or design-system decision.

This file is not part of the prototype itself — it's project documentation to keep the team aligned as the design evolves quickly, especially in areas we're still actively figuring out (multi-entity permissioning, the admin access model, leave-type configuration).

---

## 2026-08-11 — Mobility card widget: full setup flow and live state

The mobility card widget was rebuilt from a rough stub into a complete product flow — covering the admin journey from first setup through post-launch monitoring.

### What the widget now does

**Setup flow (4 steps, Mercury-style stacked):**
- **Step 1 — Select employees.** Shows employee count and recommended deposit (formula: 3 months of expected card spend, rounded to nearest €50). A "How is this calculated?" modal explains the formula across three admin concerns: justifying the amount to finance, deciding whether to adjust, and understanding where the money goes.
- **Step 2 — Sign mandate.** Admin authorises Payflip to collect the deposit via Twikey direct debit and to auto-top-up when the balance runs low. Signing is handled externally by Twikey; the admin returns to Payflip automatically. Includes a mandate denial path — if Twikey rejects the mandate, the admin is prompted to retry.
- **Step 3 — Awaiting deposit.** System-managed. Shows a waiting state while the first deposit clears (~3 business days in production; auto-advances in the prototype).
- **Step 4 — Send invites.** Sends email invites to all selected employees so they can download the app and request their card. Requires confirmation before sending (irreversible action). Mental model callout — "You don't issue cards yourself. Employees request their card when they're ready." — placed deliberately here to reframe the admin's expectations before they click.

**Live state (post-launch):** After invites are sent, the widget transforms from a setup wizard into a persistent monitoring card:
- Account balance hero with a chart showing balance over time. Chart anchors at the auto-top-up threshold (20% of deposit) rather than €0 — so a healthy balance reads as "well above the danger zone" rather than compressing into the top of the frame. The chart uses a step function (horizontal hold → vertical drop per transaction) to show real spend events rather than smooth interpolation.
- Adoption funnel: Invited → Downloaded → Card requested → First transaction.
- Actions: View transactions (deep-link to Choices with card filter), Resend invites.

**Balance chart — prototype assumptions and scale considerations (for engineers and PMs):**

The chart is a static SVG step function seeded with ~5 hardcoded transactions. Three decisions embedded in the prototype that need revisiting before production:

1. **Step function works at small scale only.** Each horizontal-then-vertical step represents one card transaction. At 5–20 employees this makes individual spend events legible. At 50+ employees transacting daily the steps become sub-pixel and the chart degrades into a noisy approximation of a smooth line. At real scale (100+ employees), the right data shape is **daily aggregated end-of-day balance** plotted as a smooth line — same information, readable at any employee count.

2. **Chart anchor needs to come from real data.** The prototype anchors the y-axis at the auto-top-up threshold (20% of deposit). In production, the threshold is a function of the mandate terms and the funded amount — the chart component needs this value passed in so the "danger zone" line stays accurate rather than hardcoded.

3. **Interactivity deferred.** The prototype has no hover tooltips or time range filter. At small scale (prototype) this is fine. At real scale, two interactions become necessary: (a) a time range switcher — "this week / this month / 3 months" — because the default view compresses months of daily activity into an unreadable smear; (b) hover tooltip showing the balance and date at a given point (and at small scale, the triggering transaction). Neither is blocking for the prototype demo but both are table-stakes for the production surface.

### Key product decisions

- **Widget is persistent, not a one-time wizard.** Once launched, it stays on the dashboard as a live monitoring surface. The admin's relationship with the mobility card doesn't end at setup.
- **Twikey mandate replaces manual bank transfer.** No IBAN entry, no manual payment instruction — admin signs once, Payflip handles collection and future top-ups automatically. This is the correct mental model for direct debit.
- **Invite confirmation is required.** Sending invites is irreversible — employees get an email immediately. The confirmation step ("19 employees will receive an email right now") sets the scope and consequence before the admin commits.
- **Collapsed/resume state.** The widget can be dismissed and re-entered via a "Resume setup" button that accordion-expands the content. *Why:* setup rarely happens in one sitting — an admin might check the deposit amount, leave to consult finance, and come back. The widget needs to survive that.
- **Widget renamed "Mobility card".** In an already-branded app, repeating the product name in a card header adds nothing. "Mobility card" names the benefit category and works equally well during setup and in the live state.

### Interface design decisions

- **Active step gets a filled near-black badge; done and future steps fade.** Active: filled #0f0d28 circle, white number. Done: soft green tint, recedes to 55% opacity. Future: 45% opacity. *Why:* The step list always shows all four steps — fading resolved and upcoming work is the only way to make the active step legible without hiding context. The filled black badge for the active step was chosen specifically over the P.action purple (#220a35) used for "Needs attention" count badges on the same dashboard; two badge types using the same color on the same screen would conflate "where you are in the flow" with "something needs your attention" — opposite signals.
- **Step 2 body copy reduced to one sentence.** The original paragraph covered authorization, timing, and auto-top-up. Timing moved to the Twikey trust block where it's contextually relevant. *Why:* by step 2 the admin has already committed to proceeding — three sentences of explanation before a single CTA is friction, not information.
- **All button variants now have hover states** (120ms transition). *Why:* a desktop-only tool with no hover feedback feels unfinished — the mouse is the primary input and the UI should respond to it.

## 2026-08-10 — Dashboard: visual language separation between step indicators and category icons

- **Setup step badges redesigned** from bordered gray squares to open circles with a thin `P.inkSoft` ring. *Why:* the step numbers (1, 2, 3) and the "Needs attention" category icon boxes were using the same visual treatment — same gray fill, same border, same shape — despite serving completely different semantic roles (sequence vs. category). Numbered circles are the established convention for ordinal progress; filled/bordered squares read as badges or icons. The open-circle treatment makes the distinction legible at a glance without requiring any mental parsing.
- **Attention row icon boxes given per-category tinted backgrounds** (blue for time-off, amber for expenses, violet for choices), replacing the neutral gray fill and border. *Why:* neutral gray drained all urgency signal from items that represent pending work. Color encodes category and carries a hint of the action's nature — requests (calendar/blue), financial (receipt/amber), approvals (list/violet) — matching the convention used by Linear, Notion, and other productivity tools.

## 2026-08-10 — Design system: ChoiceCard for bordered option lists

- **New shared `ChoiceCard` component** for any modal list where each option has a label and a description — replaces inline indicator rows in `PickModal` (reimbursement cycle) and `AdminAccessModal` (area checkboxes). Supports both radio and checkbox variants; selected state fills the card with a dark border and filled indicator. *Why:* the previous pattern (bare radio dot + label/hint stacked beside it) looked lightweight and untested — a bordered card makes each option feel like a real, tappable choice and visually matches the weight of what you're deciding. Also removes the only place in the app still using the old accent-colored radio dot.
- **Label weight set to 500 inside `ChoiceCard`**, matching the DS convention for primary option labels. *Why:* at 14px regular, the label read the same as a body sentence — medium weight gives it the visual hierarchy it needs to anchor the card.

## 2026-08-09 — Design system: consolidating on shared components, and a Components page

A recurring pattern this session — the same UI (a settings row, a modal, a button) hand-rolled independently on multiple screens with details quietly drifting apart — kept surfacing as one-off bugs. Rather than fix each instance as it's found, we audited the whole file for this class of duplication and consolidated the highest-value cases onto shared components, plus built a live reference page so the component set is checkable at a glance instead of only living in a markdown description.

- **Every centered modal and side drawer now shares one wrapper component** (`ModalShell`, `DrawerShell`), replacing 16 independently hand-copied backdrop/panel/header implementations. *Why:* these were pixel-identical markup blocks, mechanically copy-pasted every time a new modal or drawer was added — a real risk (one already had no animation at all, since it was the one place someone forgot to wire up the shared transition hook) and pure duplication with zero behavioral variation to justify it.
- **A real `Button` and `IconButton` system**, replacing dozens of independently-styled buttons that had drifted into at least 5 different "Cancel" treatments and 2 different close-button sizes with no rule for which screens got which. *Why:* buttons are the highest-frequency UI element in the app — inconsistency here is the most visible kind of "this doesn't feel like one product."
- **Settings section labels (`SL`) hoisted to one shared constant**, removing 9 local redefinitions — including inside screens already migrated to shared row components, where the row got fixed but the label above it didn't.
- **Badge/pill treatments consolidated onto the existing `DotPill`/`StatusPill` components**, extended with `filled`/`border`/`size` props to absorb the ad-hoc pills that had been built from scratch instead of reusing them.
- **New in-app Components page** (Sidebar → Components), a live interactive reference for every shared component — click a button to see its states, open a real example modal/drawer, toggle a real switch — so "does this already exist" has a fast, visual answer instead of requiring a file search.
- **Deliberately deferred**: two cases where unifying would mean picking a UX direction, not just extracting shared markup — the native-select vs. custom-popover pattern, and the sidebar-popover vs. centered-modal entity picker. Documented as open decisions in `CLAUDE.md` rather than resolved by assumption.

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
