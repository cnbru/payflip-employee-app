# HR Admin design decisions

## Relaunch guidance on People — decided from `/proto/guidance-float`

- **Direction:** A dark help card pinned to the bottom-right, over the employee table. The table does not reflow when the card opens or closes.
- **Layout:** Title and deadline, walkthrough, one line of instruction, the two things to compare, then the confirmation and “Mark as complete.” Close collapses it to a labeled pill in the same corner.
- **Content:** The steps name the two fields to compare, and the notes say what admins actually miss: a new start date after a raise or a regime change, and unplanned absences that never sync. The confirmation points back at those two fields — “I checked both and corrected any mismatches.” — rather than restating the task. The deadline stays in the header.
- **Behavior:** The card opens when the salary-dates task is in progress. Closing it does not complete the task. “Mark as complete” stays disabled until the confirmation is checked. Completing the task removes the card.
- **Rejected:** The full-width inline panel stretched the steps across the page and pushed the table down. Reserving space beside the table (the first float) hid columns. A permanent right rail did the same.

## Relaunch guidance on People — decided from `/proto/relaunch-guidance` (superseded)

- **Direction:** Embed the active relaunch task above the People table so instructions and employee data remain usable in the same workspace.
- **Layout:** Keep a two-column body: rationale and numbered steps on the left; video and quiet help links on the right. Keep confirmation and “Mark as complete” together in one full-width footer.
- **Content:** Explain the task as preventing inaccurate budgets and overspending. Show the selected entity and EYP cash-out timing once in the header, and place the integration exception beneath the relevant comparison step.
- **Behavior:** Open the guidance when the task starts, allow the admin to collapse it, and keep the collapsed header available for recovery. Completing the task removes the panel.
- **Rejected:** The modal drawer blocked the employee table and forced admins to work from memory. The docked side panel preserved interaction but compressed the table and hid columns at common laptop widths.

## Relaunch task guidance — 17 September 2026

- **Direction:** Treat relaunch task content as procedural guidance rather than self-reported granular progress.
- **Treatment:** Present the procedure as numbered steps, followed by one explicit confirmation that the admin reviewed all relevant records and fixed any mismatches.
- **Behavior:** “Mark as complete” remains disabled until the final confirmation is checked. The confirmation persists if contextual guidance is collapsed or closed.
- **Hub summary:** Starting a task changes its state to “In progress” and its action from “Start task” to “Continue.” Do not show artificial step counts when the application cannot verify those steps.

## Relaunch hub task structure — 17 September 2026

- **Direction:** Collapsible phase cards with the current phase open by default.
- **Treatment:** Keep the existing compact overall progress indicator; show each phase’s completion count and state in its card header; show task deadlines exclusively as right-aligned badges.
- **Behavior:** Any phase can be expanded for planning, while tasks remain unavailable until the preceding phase is complete. When progress unlocks a new phase, that phase opens automatically.
- **Rejected:** The highlighted “Next task / Continue task” panel added unnecessary emphasis above the checklist. The roadmap/detail split was denser and less direct for a sequential administrative workflow. The original fully expanded list made future work dominate the page.

## Relaunch guidance entry — 16 September 2026 (superseded)

- **Previous direction:** Full-width contextual notice above the page header.
- **Treatment:** Brand-tint background with neutral black foreground tokens, rocket icon, task title, short contextual explanation, and a “View instructions” action. On arrival, the banner settles down 6px over 220ms and the rocket travels 3px diagonally over 240ms; reduced-motion users receive a 120ms fade with no movement.
- **Behavior:** The notice stays hidden while the relaunch drawer is open, animates in when the drawer closes, reopens the drawer, and disappears when the task is completed.
- **Superseded by:** The inline task workspace chosen from `/proto/relaunch-guidance`, which keeps the instructions and working surface visible together.
