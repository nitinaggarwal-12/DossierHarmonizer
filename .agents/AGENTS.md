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

---

## 📋 RULE: Pre-Project Research & Planning Protocol

### 1. The Constraint
Before initiating any new coding project, feature addition, or architectural modification, you **must** perform background research, identify technology constraints, map out workarounds, and align on a structured plan with the user. You must never modify code files before this plan is approved.

### 2. The Protocol
1. **Real-time Grounding Search:** Run a web search or repository review to query the latest guidelines and schemas for the target technology.
2. **Gotchas Audit:** Search for deprecation warnings, breaking changes, or common integration bugs reported on the targeted frameworks.
3. **Alternative Workaround Mapping:** Map a clear design mitigation for each identified gotcha.
4. **Approval Request:** Propose this plan to the user in a clear table/summary. Wait for explicit user confirmation before writing or modifying any implementation code.
