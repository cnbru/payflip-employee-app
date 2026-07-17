# Animation Plans

| # | Title | Severity | Status |
|---|-------|----------|--------|
| 001 | [Sidebar mode crossfade](001-sidebar-mode-crossfade.md) | MEDIUM | DONE |
| 002 | [Bulk pill entrance fix](002-bulk-pill-entrance.md) | HIGH | DONE |
| 003 | [Bulk pill exit animation](003-bulk-pill-exit.md) | MEDIUM | DONE |
| 004 | [Main content fade on mode switch](004-main-content-fade-on-mode-switch.md) | HIGH | DONE |
| 005 | [SidebarItem background transition](005-sidebar-item-background-transition.md) | LOW | DONE |
| 006 | [Screen entrance animation — Team calendar](006-screen-enter-team-calendar.md) | MEDIUM | DONE |
| 007 | [Animate RequestRow exit on approve/decline](007-requestrow-exit-on-approve-decline.md) | MEDIUM | DONE |
| 008 | [Sheet animation overhaul](008-sheet-animation-overhaul.md) | HIGH | TODO |

## Execution order

1. **004** — standalone. Coordinates main content fade with the sidebar's existing crossfade (plan 001).
2. **005** — standalone. No dependencies.
3. **006** — standalone. Proof-of-concept for screen entrance; extend to all screens once feel is validated.
4. **007** — standalone. No dependencies on 001–006; touches `RequestsScreen`/`RequestRow` only.
5. **008** — standalone. Touches `useModalTransition`, `sheetPanelStyle`, `DetailModal`, `AddTimeOffModal` only. No dependencies on earlier plans.
