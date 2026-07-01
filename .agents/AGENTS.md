# 🤖 Project Agent Rules & Quality Constraints

## 🔍 RULE: Interactive Onboarding & Guided Tour Quality Constraints

### 1. The Constraint
When building, auditing, or refactoring guided tours, onboarding steps, or walkthrough components, you must verify coordinate-level occlusion and interactive state traps to ensure the tour works perfectly for human operators under any default layout state.

### 2. The Protocol
* **Occlusion & Placement Auditing:**
  - Verify that floating cards, bubbles, and spotlight overlays never physically overlap or block the target element they highlight.
  - If target elements are in the right-hand side panels (RHS) or bottom-right quadrant of the viewport, position the tour card at the bottom-left/left-hand side (LHS) of the viewport.
* **Dropdown Selection & Default-State Traps:**
  - When targeting dropdowns (`<select>`), never rely solely on a standard `change` event listener if the targeted option could already be selected as the default state.
  - Always provide an alternate path (such as a labeled "Proceed with Default" or "Next Step" tour button) so the user can advance the tour without having to select an incorrect option just to trigger a change event.
* **Programmatic vs Coordinate Click Validation:**
  - When reviewing screenshots during automated E2E runs, manually review the positioning box of the spotlight overlay and the card bubble to visually confirm the target is fully exposed, visible, and clickable by a human operator.
