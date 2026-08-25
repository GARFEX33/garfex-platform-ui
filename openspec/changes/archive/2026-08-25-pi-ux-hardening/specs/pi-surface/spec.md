# Pi Surface Hardening Specification

## Purpose

Harden the existing GARFEX Pi Surface so opening failures remain diagnosable but safe for users, interaction guidance remains accurate and textual, and established state, navigation, availability, and architecture guarantees receive focused regression evidence without expanding the product surface.

## Requirements

### Requirement: Safe and diagnosable opening failure

When an unexpected Surface-opening failure occurs, the system MUST present exactly one safe, actionable Spanish recovery message in the primary user experience. The primary user experience MUST NOT expose the thrown detail, stack trace, or internal technical jargon. The same failure MUST retain maintainable technical diagnostic information through a maintainer-facing Pi-host boundary, and the failed attempt MUST NOT prevent a later command invocation from opening a fresh Surface.

#### Scenario: Unexpected failure is safe for the user and useful to maintainers

- GIVEN opening the GARFEX Pi Surface throws an unexpected failure containing distinctive technical detail
- WHEN the command handles the failed opening attempt
- THEN the user sees exactly one safe, actionable Spanish recovery message
- AND the primary user experience contains none of the distinctive thrown detail, stack trace, or internal jargon
- AND the maintainer-facing diagnostic boundary retains technical information that identifies the failure

#### Scenario: A failed opening does not poison a later invocation

- GIVEN one command invocation failed while opening the Surface
- WHEN the command is invoked again and opening can succeed
- THEN a fresh Surface opens normally
- AND the earlier failure does not add another recovery message or stale failure state to the successful invocation

### Requirement: Configuration-aware textual navigation guidance

Displayed navigation and selection help MUST derive its binding labels from the active Pi 0.84.2 keybinding configuration wherever Pi supports keybinding-derived labels. The guidance MUST remain understandable as Spanish text when bindings are remapped and MUST degrade safely at narrow widths without asserting an inactive default binding.

#### Scenario: Remapped bindings are reflected in help

- GIVEN an active Pi keybinding configuration remaps a supported navigation or selection action from its default binding
- WHEN the Surface displays help for that action
- THEN the displayed label identifies the active remapped binding
- AND the associated Spanish text still explains the action
- AND the help does not present the inactive default binding as operational

#### Scenario: Guidance remains understandable at narrow width

- GIVEN configuration-aware navigation help is displayed
- WHEN the terminal width becomes narrow enough that the full preferred presentation cannot fit
- THEN the rendered guidance remains within the representable width
- AND the remaining textual information does not contradict the active binding or navigation behavior

### Requirement: Textual active-state cue

The Surface MUST identify the active selection or focus with concise Spanish textual information in addition to native glyph, color, theme, or positional signals. This additive cue MUST preserve native Pi `SelectList` and `Input` interaction rather than replacing either component.

#### Scenario: Active list selection has an additive textual cue

- GIVEN a native Pi `SelectList` contains multiple choices
- WHEN one choice is active
- THEN concise Spanish text identifies the active state
- AND the native list remains the component that owns selection interaction

#### Scenario: Search focus is understandable without color or position alone

- GIVEN the native Pi `Input` is the active Search control
- WHEN the Search view is rendered
- THEN concise Spanish text communicates the active or focused state without requiring color, glyph position, or theme styling to be understood
- AND input remains owned by the native Pi `Input`

### Requirement: Exact Search draft interaction lifecycle

The Search draft MUST remain Interaction State only for the lifetime of its Surface. Navigating away from and reopening Search MUST preserve the draft exactly, together with its cursor position and focus. This guarantee MUST include representative combining Unicode, long content, and exact whitespace or paste-equivalent content. Cancellation MUST navigate according to the established hierarchy without executing, clearing, validating, or reporting an error for the draft.

#### Scenario: Combining Unicode survives navigation and reopen

- GIVEN the Search draft contains a representative combining Unicode sequence and the cursor has a known position
- WHEN the user navigates away from Search and reopens it within the same Surface
- THEN the exact original code-point sequence is present
- AND the cursor position and input focus are retained

#### Scenario: Long draft survives horizontal presentation and reopen

- GIVEN the Search draft is longer than the available input width and has a known cursor position
- WHEN the Surface presents the draft at a constrained width, navigates away, and reopens Search
- THEN the full exact draft remains available
- AND the cursor position and input focus are retained
- AND presentation does not convert the draft into domain, remote, or persisted business state

#### Scenario: Whitespace and paste-equivalent content remain exact

- GIVEN the Search draft contains leading whitespace, trailing whitespace, internal line-safe whitespace, or a paste-equivalent input sequence
- WHEN the user leaves and reopens Search within the same Surface
- THEN the draft is retained exactly without invented trimming or empty-value semantics
- AND no search or other business operation is executed

#### Scenario: Cancellation never acts on the draft

- GIVEN Search contains any draft, including whitespace-only content
- WHEN the user cancels with an established back or cancel action
- THEN navigation follows the existing hierarchy
- AND the draft is not executed, cleared, or reported as an error

### Requirement: Safe degradation during resize and repeated navigation

The Surface MUST remain stable through resize and repeated navigation sequences. Every rendered line MUST stay within the representable terminal width, and back or cancel behavior MUST remain usable whenever the terminal dimensions can represent an interaction cue. When dimensions cannot represent all preferred content, optional presentation detail MUST degrade before navigation safety or truthful status.

#### Scenario: Repeated resize and navigation remain stable

- GIVEN an open Surface is repeatedly navigated among GARFEX, Resources, and Search
- WHEN terminal width changes across representative normal, narrow, and minimum-width values during the sequence
- THEN rendering stays within each representable width
- AND no interaction failure or stale view prevents continued navigation
- AND back or cancel remains usable wherever an interaction cue can be represented

#### Scenario: Minimum dimensions preserve truthful behavior

- GIVEN the terminal can represent only a subset of preferred help and state text
- WHEN the current view is rendered
- THEN omitted or shortened presentation does not claim unavailable behavior
- AND the user can still recover by back or cancel whenever those controls can be represented

### Requirement: Honest capability availability

Capability availability MUST remain a UI/integration projection only. The Surface MUST NOT present Search execution, results, detail, creation, authentication, remote operations, or any other absent capability as operational, and hardening cues MUST NOT invent business semantics for drafts or unavailable actions.

#### Scenario: Search remains explicitly unavailable

- GIVEN the user opens the existing Search view
- WHEN availability and guidance are displayed
- THEN Spanish text communicates the currently unavailable operation honestly
- AND no affordance claims that Search can execute or return results

#### Scenario: Hardening does not create product behavior

- GIVEN diagnostic, keybinding, active-state, or resize behavior is exercised
- WHEN the user interacts with the Surface
- THEN no absent capability, remote state, permission, data contract, or business rule is introduced or presented as operational

### Requirement: Architecture and scope invariants

The system MUST retain one native, custom, non-overlay Pi Surface; native Pi `SelectList`, `Input`, layout, focus, keyboard, and width behavior; and the established dependency direction from Pi entry/composition to Pi presentation to reusable Surface feature state. Reusable Resources state MUST remain limited to interaction state, availability projection, semantic intents, and the existing return-home effect. The change MUST NOT add another host, a generic UI or host port, a parallel visual framework, frontend business state, backend or network dependencies, invented contracts or data, broad architecture infrastructure, or a speculative architecture decision.

#### Scenario: Native Surface foundation remains intact

- GIVEN the hardened Surface is opened
- WHEN its structure and interactions are inspected at GARFEX-owned boundaries
- THEN it remains one native custom non-overlay Pi Surface
- AND native Pi components continue to own list selection and text input
- AND no parallel component or visual framework is present

#### Scenario: Dependency and feature boundaries remain intact

- GIVEN the completed hardening change
- WHEN repository architecture boundaries are evaluated
- THEN dependency direction remains Pi entry/composition to Pi presentation to reusable Surface feature
- AND feature state contains no Pi rendering detail, remote state, business entity, client contract, authentication, or permission model
- AND no excluded host, abstraction, dependency, infrastructure, or product capability has been added

### Requirement: Focused GARFEX-owned regression evidence

The change MUST provide representative regression evidence at GARFEX-owned command recovery, Pi composition/presentation, and Interaction State boundaries for the behaviors in this specification. Evidence SHOULD use one or a small representative set per risk and MUST NOT require exhaustive conformance testing of Pi-owned grapheme, width, input, keybinding, or list internals.

#### Scenario: Recovery boundary evidence is proportional

- GIVEN a representative thrown opening failure and a later successful opening
- WHEN repository-level recovery evidence is evaluated
- THEN it demonstrates safe single-message recovery, retained technical diagnostics, non-leakage, and successful retry
- AND it does not attempt to exhaustively test Pi runtime internals

#### Scenario: Interaction boundary evidence is proportional

- GIVEN representative remapping, active-state, combining Unicode, long-draft, exact-whitespace, cancellation, resize, and repeated-navigation cases
- WHEN repository-level interaction evidence is evaluated
- THEN it demonstrates the GARFEX-owned outcomes specified above
- AND it does not duplicate exhaustive tests of native Pi primitive behavior

## Acceptance Criteria

- [ ] Unexpected opening failure yields one safe Spanish recovery message, retains technical diagnostics outside primary UX, and permits a later successful invocation.
- [ ] Displayed help follows supported active Pi 0.84.2 bindings and remains truthful and textual under remapping and narrow width.
- [ ] Active selection or focus includes concise textual information while native `SelectList` and `Input` remain in place.
- [ ] Search draft, cursor, and focus survive navigation and reopen exactly for representative combining Unicode, long, whitespace, and paste-equivalent content; cancellation has no draft side effect.
- [ ] Resize and repeated navigation degrade safely while preserving representable back or cancel behavior.
- [ ] Availability remains UI/integration-only and no absent capability appears operational.
- [ ] Existing Surface architecture, dependency direction, feature ownership, and all stated scope exclusions remain invariant.
- [ ] Regression evidence is representative at GARFEX-owned boundaries and does not become a Pi internals conformance suite.
