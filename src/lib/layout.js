// Shared footprint of the floating bottom tab bar, so TabBar's own
// position, RestTimer's position (it floats just above the bar), and
// LogScreen's scroll-clearance padding (so the last card never sits under
// either) all agree with the design spec's numbers instead of duplicating
// magic constants.
export const TAB_BAR_HEIGHT = 60;
export const TAB_BAR_GAP = 14; // offset from the viewport edge
export const TAB_BAR_CLEARANCE = "calc(88px + env(safe-area-inset-bottom))"; // bar + gap + 14px breathing room
export const REST_TIMER_BOTTOM = `calc(${TAB_BAR_HEIGHT + TAB_BAR_GAP}px + env(safe-area-inset-bottom))`;
