# Proposal Module Canva-Inspired UI Redesign - Detailed Implementation Plan

## 1. Objective

Redesign the proposal builder as a Canva-inspired, full-screen editing workspace while preserving the existing proposal, lead, client, service, request, permission, print, PDF, and invoice workflows.

The goal is to reproduce Canva's interaction model - persistent top command bar, vertical tool rail, contextual panels, centered document canvas, zoom controls, page thumbnails, templates, and autosave feedback - without attempting to build an unrestricted graphic-design application.

## 2. Recommended product scope

### First release

- Full-screen proposal workspace optimized for desktop.
- Top command bar with back, proposal title/status, undo/redo, lead context, save state, preview, PDF, print, and finalization actions.
- Left tool rail with Details, Client, Services, Content, Templates, Brand, and Proposals tools.
- Expandable left panel containing the form for the selected tool.
- Center canvas with a neutral/dark pasteboard and a centered A4 proposal.
- Contextual inspector for the selected structured block.
- Bottom page navigator with thumbnails, current page, zoom, fit, and fullscreen controls.
- Structured editing of proposal metadata, client data, services, and content sections.
- Constrained templates and brand tokens.
- Undo/redo, dirty tracking, debounced autosave, explicit save, and conflict feedback.
- One renderer shared by on-screen canvas, print, and PDF export.
- Existing lead selection, client creation/autofill, proposal requests, recent proposals, and deep links.

### Deliberate non-goals for the first release

- Arbitrary free-position drag/drop of every element.
- Rotation, freeform resizing, layers, grouping, or per-pixel graphic editing.
- Stock media, audio, video, animations, AI generation, or an asset marketplace.
- Real-time multi-user collaboration or comments.
- User-authored CSS, scripts, or unrestricted HTML.
- Multiple competing proposals per lead; `Lead.quotation` remains the canonical relationship.

These can be reconsidered only after the structured editor, pagination, export parity, and revision model are stable.

## 3. Current implementation assessment

### Frontend

- `adstra-next/src/app/proposal/page.js` dynamically loads the client-only builder and should keep the route stable.
- `adstra-next/src/components/ProposalBuilder/ProposalBuilder.js:21-553` currently owns proposal data, URL initialization, lead/client orchestration, API calls, modals, calculations, save behavior, and the entire layout.
- The current editor is a Bootstrap two-column form and preview at `ProposalBuilder.js:490-533`; the toolbar is inline-styled at `ProposalBuilder.js:435-488`.
- Header, service, and section editors pass raw state setters back to the parent at `ProposalBuilder.js:496-510`.
- `ProposalPreview.js:10-484` mixes settings loading, calculations, rich-content parsing, page layout, and rendering.
- `ExportButton.js:3-21` exports a live DOM node. Canvas zoom or pan must never affect export output.
- There are no proposal-focused frontend tests or a frontend `test` script.

### Backend

- `backend/apis/proposal/models.py:16-36` stores normalized commercial proposal fields but has no editor schema, template, revision, or updated timestamp.
- `backend/apis/proposal/models.py:69-82` stores sections and services without explicit ordering or stable editor IDs.
- `backend/apis/proposal/serializers.py:86-106` replaces every service and section during update, which is too destructive for frequent autosave.
- `backend/apis/proposal/views.py:39-54` already supplies the correct proposal visibility scope and must protect every new editor endpoint.
- `backend/apis/proposal/views.py:65-130` and `:176-221` already provide authoritative lead snapshot and lead-to-client creation/autofill behavior.
- `backend/apis/leads/services.py:469-560` currently combines proposal creation with request completion and activity logging. Draft initialization must not be treated as final proposal submission.
- `backend/apis/proposal/views.py:133-150` previews the next proposal number without reserving it, creating a concurrency risk when autosaved drafts are introduced.
- `backend/apis/invoice/models.py:119-136` depends on normalized client/service data, so business data cannot be replaced with opaque canvas JSON.

## 4. Target user experience

### Workspace layout

| Region | Recommended behavior |
| --- | --- |
| Top command bar | 56px fixed bar. Back and File menu on the left; editable proposal name, status, and save state in the center; preview, download, print, and submit/send on the right. |
| Tool rail | 72px fixed left rail with icons and labels. Exactly one tool is active. |
| Tool panel | 320-360px resizable/collapsible panel for the active tool. Search and long lists scroll inside the panel, not the full page. |
| Canvas stage | Flexible central pasteboard with centered A4 pages, consistent gaps, pan/scroll, fit-to-screen, and selectable structured blocks. |
| Inspector | 280-320px contextual right panel on wide screens; collapsible drawer on narrower screens. Shows only valid options for the current selection. |
| Page strip | 72-96px bottom strip with thumbnails, page count, add/navigate controls, zoom slider, fit, and fullscreen. |

### Tool rail and panels

1. **Details** - proposal number, date, reference, purpose, place, notes, and status.
2. **Client** - selected lead, company/client record, contact, address, GSTIN, LUT, email, and phone. Lead selection continues to create/reuse a client and fully autofill these fields.
3. **Services** - searchable service catalogue, selected line items, quantity/rate/GST, totals, reorder, and validation.
4. **Content** - structured proposal sections, rich text, ordering, visibility, duplicate, and delete.
5. **Templates** - Classic (the existing renderer), Modern, and Minimal template thumbnails.
6. **Brand** - constrained logo, primary/accent colors, typography preset, and company settings.
7. **Proposals** - searchable recent proposals and proposal requests, replacing the large modal as the primary browsing experience.

### Selection and inspector behavior

- Clicking a structured document block selects it and outlines it on the canvas.
- Selecting client, services, heading, body, terms, bank, or signature blocks opens only the controls allowed for that block type.
- The first release supports structured reordering and visibility, not free-position transforms.
- Clicking the canvas background opens document/page settings.
- Escape clears the selection; Tab moves through controls; focus must remain visible.

### Save and lifecycle feedback

- Save states: `Unsaved`, `Saving...`, `Saved at HH:MM`, `Offline - changes queued`, `Save failed`, and `Conflict detected`.
- Autosave is debounced after document changes; navigation or finalization flushes pending changes.
- Explicit Save remains available as a reliable user action.
- `Submit/Send` is distinct from saving a draft. Only finalization completes a proposal request and records the final quotation activity.
- View-only mode removes editing affordances and disables keyboard mutations, rather than merely hiding the Save button.

## 5. Frontend architecture

Create a feature-oriented workspace while keeping `/proposal?lead=<id>` and `/proposal?proposal=<id>` stable.

```text
adstra-next/src/components/ProposalWorkspace/
  ProposalWorkspace.js
  ProposalWorkspace.module.css
  TopCommandBar.js
  ToolRail.js
  ToolPanel.js
  InspectorPanel.js
  PageStrip.js
  workspaceTokens.js
  panels/
    ProposalDetailsPanel.js
    LeadClientPanel.js
    ServicesPanel.js
    ContentPanel.js
    TemplatesPanel.js
    BrandPanel.js
    ProposalsPanel.js
  canvas/
    CanvasStage.js
    CanvasViewportControls.js
    ProposalPage.js
    SelectionOverlay.js
  document/
    ProposalDocumentRenderer.js
    ProposalBlockRenderer.js
    templates/
      ClassicProposalTemplate.js
      ModernProposalTemplate.js
      MinimalProposalTemplate.js
  hooks/
    useProposalDocument.js
    useProposalPersistence.js
    useProposalHistory.js
    useCanvasViewport.js
    useKeyboardShortcuts.js
  state/
    proposalReducer.js
    proposalActions.js
    proposalDefaults.js
    proposalMappers.js
    proposalCalculations.js
    editorState.js
```

### Component responsibilities

- `ProposalWorkspace` composes the interface only. It must not contain payload mapping or commercial calculations.
- `useProposalDocument` owns one normalized proposal document and exposes semantic actions.
- `proposalReducer` handles immutable actions such as `CLIENT_SET`, `SERVICE_UPDATE`, `SECTION_REORDER`, `TEMPLATE_APPLY`, and `STYLE_TOKEN_SET`.
- `useProposalPersistence` owns new/load/autosave/save/finalize/deep-link logic and lead draft initialization.
- `useProposalHistory` records document mutations only. Panel, modal, zoom, selection, and loading state do not enter undo history.
- `proposalMappers` is the single API-to-editor and editor-to-API translation layer. It removes the repeated defaults currently in `ProposalBuilder.js`.
- `proposalCalculations` is the sole source for line amount, GST, subtotal, total, and amount-in-words calculations.
- `ProposalDocumentRenderer` is a pure, scale-independent renderer. It receives already-loaded company settings and proposal data and performs no fetches.
- `CanvasStage` applies zoom/pan outside the document renderer. Export and print render the untransformed document.

### Proposed client state

```js
document = {
  identity: { id, proposalNo, status, revision, sourceLead },
  client: { id, companyName, contactName, address, email, phone, gstin, lut },
  metadata: { date, reference, purpose, place, notes },
  services: [{ clientId, serverId, position, category, description, quantity, rate, gst }],
  sections: [{ clientId, serverId, position, title, type, alignment, content, visible }],
  design: {
    schemaVersion: 1,
    templateKey: "classic",
    brandTokens: { primaryColor, accentColor, fontFamily, logo },
    page: { size: "A4", orientation: "portrait", margins: "normal" }
  }
}

editor = {
  mode: "edit",
  activeTool: "details",
  selectedNode: null,
  viewport: { zoom: 1, fitMode: "page", panX: 0, panY: 0 },
  history: { past: [], future: [] },
  persistence: { dirty: false, state: "idle", lastSavedAt: null, error: null },
  dialogs: { leadPicker: false, conflict: false }
}
```

Do not duplicate authoritative client, service price, tax, or total values inside visual layout JSON.

## 6. Backend and API design

### Hybrid persistence model

Update `backend/apis/proposal/models.py` and add a new migration after `0012_proposalrequest.py`:

- Add `updated_at = DateTimeField(auto_now=True)`.
- Add `revision = PositiveIntegerField(default=1)` for optimistic concurrency.
- Add `template_key = CharField(max_length=50, default="classic")`.
- Add `editor_schema_version = PositiveSmallIntegerField(default=1)`.
- Add `editor_state = JSONField(default=dict, blank=True)` for presentation-only state.
- Change proposal date from `auto_now_add=True` to a writable date default if the displayed date is intended to be editable.
- Add `position` and a stable UUID/public ID to `ProposalService` and `ProposalSection`.
- Prefer `PROTECT` or `SET_NULL` for historical client/user references instead of deleting proposals by cascade; confirm this business rule before migration.

The `editor_state` validator must whitelist page settings, templates, block visibility/order, and brand tokens; enforce maximum size, depth, page count, and block count; and reject arbitrary CSS, scripts, unsupported URLs, or unknown block types.

### Serializer separation

Refactor `backend/apis/proposal/serializers.py` to use explicit fields:

- `ProposalSummarySerializer` for recent/My Proposals lists.
- `ProposalEditorSerializer` for complete editor load.
- `ProposalDraftSerializer` for draft initialization.
- `ProposalAutosaveSerializer` for partial saves plus expected revision.
- `ProposalFinalizeSerializer` for validated submit/send transitions.
- ID-aware service and section serializers that upsert existing rows and preserve stable IDs/order.

Client choice must be validated against the authenticated user's accessible scope rather than the current global `Client.objects.all()` write queryset.

### Recommended endpoints

Implement these in `backend/apis/proposal/views.py` and `backend/apis/proposal/urls.py`, reusing `proposal_queryset_for(user)` for object access:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/proposal/drafts/` | Idempotently create or resume a draft, optionally from a lead/request; create/reuse the client and set the request to `in_progress`. |
| `GET /api/proposal/<id>/editor/` | Load business data, source lead, design state, schema version, and revision. |
| `PATCH /api/proposal/<id>/autosave/` | Save partial document changes with `expected_revision`; return 409 on stale revision. |
| `POST /api/proposal/<id>/finalize/` | Full validation, server-side totals, proposal number allocation, status transition, request completion, activity, and audit. |
| `GET /api/proposal/summaries/` | Paginated/searchable proposal summaries for the Proposals panel. |
| `PATCH /api/proposal/requests/<id>/` | Explicit, authorized request status transitions. |

Keep the current create/detail/update/list endpoints during migration, but route new UI behavior through the editor endpoints. Remove compatibility paths only after all consumers move.

### Draft versus final proposal lifecycle

Refactor `backend/apis/leads/services.py` so lifecycle steps are explicit:

1. `initialize_draft`: lock lead; create/reuse full client from lead data; create or resume proposal; link `Lead.quotation`; set request to `in_progress`; do not create final activity.
2. `autosave_draft`: update editor/business data with revision protection; do not change workflow stage.
3. `finalize_proposal`: validate required client/services; recalculate totals server-side; reserve proposal number; mark sent/final state as requested; complete request; record activity and audit exactly once.

### Numbering and conflicts

- Allocate proposal numbers using a transaction-safe counter/reservation or defer allocation until finalization.
- Autosave must lock the proposal row, compare `expected_revision`, increment revision, and return the new revision.
- A 409 response should include the server revision and enough metadata to offer `Reload server version` or `Save a copy` later. Automatic silent overwrites are not allowed.

## 7. Migration of existing proposals

1. Add new fields with backward-compatible defaults.
2. Backfill all existing proposals to `template_key="classic"`, schema version 1, and a valid default editor state.
3. Populate service/section positions from existing primary-key order.
4. Preserve all current proposal IDs and deep links.
5. Render legacy records through `ClassicProposalTemplate` and compare them with the current preview before enabling new templates.
6. Keep invoice conversion reading normalized client/service fields; add regression tests proving identical results before and after migration.

## 8. Detailed implementation phases

### Phase 0 - UX contract and technical baseline

- Approve desktop workspace wireframe, responsive behavior, keyboard map, block selection rules, template constraints, and status terminology.
- Capture representative proposals: empty, lead-autofilled, multi-service, long content, legacy rich text, GST/LUT, and view-only.
- Define A4 dimensions, margins, page-break rules, and visual snapshot baselines.
- Decide whether proposal numbers are assigned at draft creation or finalization; finalization is recommended.
- Decide which roles can initialize, autosave, finalize, and delete drafts.

Exit criteria: signed-off interaction spec, document schema v1, endpoint contract, and migration rules.

### Phase 1 - Safe frontend extraction with no visual change

- Add `proposalDefaults.js`, `proposalMappers.js`, and `proposalCalculations.js`.
- Consolidate duplicated header defaults and proposal-number initialization.
- Move API/deep-link/lead orchestration into `useProposalPersistence`.
- Replace three independent raw states with a reducer-backed document state.
- Fix loaded client field loss, row-specific GST inconsistency, missing service unselect handling, and stale Saved state.
- Add an API helper so authentication/error parsing is not duplicated across builder components.

Exit criteria: existing UI behaves identically, current deep links work, and focused reducer/mapper/calculation tests pass.

### Phase 2 - Pure renderer and export parity

- Split `ProposalPreview.js` into renderer, template, content normalization, and calculation-free presentation components.
- Make the current layout `ClassicProposalTemplate`.
- Load company/brand settings once in the workspace and inject them into renderer inputs.
- Add explicit A4 page dimensions and deterministic page-break handling.
- Point print and PDF export at an off-screen/untransformed renderer, not the zoomed canvas DOM.
- Sanitize legacy HTML immediately; plan migration to a constrained rich-text JSON format.

Exit criteria: canvas at any zoom exports the same PDF; legacy proposal screenshots and calculated totals match approved baselines.

### Phase 3 - Canva-inspired workspace shell

- Add the command bar, tool rail, collapsible panel, central canvas, inspector shell, and bottom page strip.
- Move HeaderEditor functions into Details and Client panels.
- Move ServiceTable functions into ServicesPanel.
- Move SectionEditor functions into ContentPanel.
- Adapt LeadSelector and RecentProposalsModal logic into panels while retaining dialogs where confirmation is useful.
- Implement loading, empty, error, read-only, and permission-denied states.
- Use CSS modules and workspace design tokens instead of large inline style blocks.

Exit criteria: every current proposal operation is available in the new workspace and works at 1280x720, 1440x900, and 1920x1080.

### Phase 4 - Editor interactions

- Add structured block selection and contextual inspector controls.
- Add zoom presets, fit page, fit width, pan/scroll, fullscreen, and page navigation.
- Add immutable undo/redo with a bounded history and coalesced typing operations.
- Add keyboard shortcuts and an unsaved-navigation guard.
- Add structured reordering for services and sections with keyboard alternatives.
- Start page thumbnails as navigation-only views; allow add/duplicate/reorder only when persisted multi-page semantics are complete.

Exit criteria: selection, history, keyboard control, and zoom are reliable and do not mutate exported layout.

### Phase 5 - Draft API, autosave, and lifecycle

- Add database fields/migration and backfill.
- Implement editor serializers and draft/editor/autosave/finalize/summary endpoints.
- Separate request `in_progress` from `completed` and final activity logging.
- Add 800-1200ms debounced autosave, request cancellation, retry state, explicit Save, and 409 conflict UI.
- Recalculate commercial totals server-side during finalization.
- Make number allocation concurrency safe.

Exit criteria: reload restores all business/design state; two stale sessions cannot silently overwrite each other; draft autosave does not complete the proposal request.

### Phase 6 - Templates, brand controls, and hardening

- Ship Classic, Modern, and Minimal templates using the same normalized document.
- Add constrained typography and color presets, logo selection, and page settings.
- Verify WCAG focus, contrast, labels, keyboard order, screen-reader status announcements, and reduced-motion behavior.
- Profile large proposals; memoize page/block renderers, lazy-load panels/templates, and virtualize large recent lists if needed.
- Add logging for save failures, 409 conflicts, finalization errors, PDF failures, and editor schema validation failures.

Exit criteria: template switching never changes commercial data; accessibility and performance targets pass; rollout can be enabled by feature flag.

## 9. Existing files to change

### Frontend

- `adstra-next/src/app/proposal/page.js` - load the new workspace while preserving query parameters and client-only behavior.
- `adstra-next/src/app/proposal/layout.js` - apply proposal workspace metadata/layout behavior if needed.
- `adstra-next/src/components/ProposalBuilder/ProposalBuilder.js` - become a compatibility adapter, then remove after cutover.
- `adstra-next/src/components/ProposalBuilder/LeadSelector.js` - reuse fetching/selection logic in `LeadClientPanel`.
- `adstra-next/src/components/ProposalBuilder/RecentProposalsModal.js` - reuse data/actions in `ProposalsPanel`.
- `adstra-next/src/components/HeaderEditor/HeaderEditor.js` - split into Details/Client panels and shared client hook.
- `adstra-next/src/components/ServiceTable/ServiceTable.js` - refactor into services catalogue and line-item components.
- `adstra-next/src/components/SectionEditor/SectionEditor.js` - refactor into structured content controls.
- `adstra-next/src/components/SectionEditor/RichTextEditor.js` - replace deprecated `execCommand` and unsafe HTML path.
- `adstra-next/src/components/ProposalPreview/ProposalPreview.js` - replace with the pure renderer/template structure.
- `adstra-next/src/components/ExportButton/ExportButton.js` - export the untransformed renderer.
- `adstra-next/src/app/globals.css` - only minimal print/reset rules; keep workspace styles local.

### Backend

- `backend/apis/proposal/models.py` - revision, editor state, timestamps, template, and ordering fields.
- `backend/apis/proposal/serializers.py` - explicit summary/editor/draft/autosave/finalize serializers.
- `backend/apis/proposal/views.py` - lifecycle endpoints, scoping, conflicts, and pagination.
- `backend/apis/proposal/urls.py` - editor lifecycle routes.
- `backend/apis/proposal/tests.py` - expanded proposal editor/API coverage.
- `backend/apis/leads/services.py` - separate draft initialization from finalization.
- `backend/apis/leads/models.py` - keep `Lead.quotation` canonical; change only if an audit timestamp/status is required.
- `backend/utils/permissions.py` - confirm role permissions for continuing/autosaving drafts.
- New `backend/apis/proposal/migrations/0013_*.py` - backward-compatible editor schema migration.

## 10. Test and verification plan

### Frontend unit tests

- API/editor mappers preserve every client and proposal field.
- Calculations use per-row GST and produce identical save/preview totals.
- Reducer actions are immutable and undoable.
- History coalesces typing and excludes zoom/panel/loading changes.
- Template changes preserve client/services/totals.
- Sanitizer rejects unsafe elements, attributes, and URLs.

Add a proposal test runner (Vitest/Jest plus React Testing Library) before relying on frontend regression tests.

### Frontend integration/E2E tests

- Open `/proposal?lead=<id>`, create/reuse the client, and verify full autofill.
- Create from a proposal request, autosave, reload, finalize, and verify request status transitions.
- Open `/proposal?proposal=<id>` and restore all data, template, order, and visual tokens.
- Exercise recent proposal search, view-only behavior, permissions, offline/save-error, and 409 conflict states.
- Verify undo/redo, zoom, fit, keyboard shortcuts, reordering, and unsaved navigation.
- Compare print/PDF output at 50%, 100%, and 150% canvas zoom.
- Run visual snapshots for all templates with short, long, and multi-page content.

### Backend tests

- Draft initialization is idempotent and does not complete a request.
- Starting work changes a request to `in_progress`; finalization completes it and logs activity once.
- Revision conflicts return 409 and preserve the newer server version.
- Concurrent proposal number allocation cannot duplicate numbers.
- Section/service/page order survives save and reload.
- Unsupported editor blocks/styles and oversized/deep JSON are rejected.
- Totals are recalculated server-side and manipulated totals do not pass finalization.
- Summary/editor/autosave/finalize endpoints enforce object-level visibility.
- Unauthorized clients cannot be linked.
- Legacy proposals backfill and render as Classic.
- Invoice creation from redesigned proposals remains unchanged.

### Manual acceptance matrix

- Browsers: current Chrome and Edge; Firefox if supported by the application.
- Viewports: 1280x720, 1440x900, 1920x1080; tablet receives a simplified layout or read-only mode.
- Data: empty draft, fully autofilled lead, client with/without GSTIN/LUT, 1/20/100 services, long content, legacy rich HTML, and multiple pages.
- Roles: sales owner, manager, admin, view-only user, and unauthorized user.

## 11. Acceptance criteria

The redesign is complete when:

- The proposal route opens a Canva-inspired workspace rather than a two-column form.
- Lead selection still creates/reuses the client and fully autofills proposal data.
- All proposal requests visible to the user can be opened from the workspace, and draft/final states are correct.
- Users can edit details, client, services, and sections through dedicated panels while seeing immediate canvas updates.
- Undo/redo, zoom, fit, page navigation, dirty state, explicit save, and autosave operate predictably.
- Reload restores the complete document, design state, stable ordering, and template.
- Stale sessions cannot silently overwrite newer work.
- View-only users cannot mutate data through the UI or API.
- PDF and print output are independent of canvas zoom/pan and visually match the approved renderer.
- Template or brand changes never alter normalized client, service, tax, total, lead, or invoice data.
- Existing proposals open successfully as the Classic template with no data loss.

## 12. Rollout strategy

1. Ship extraction and renderer changes behind the existing UI.
2. Add the backend schema and lifecycle endpoints with compatibility routes retained.
3. Enable the new workspace for administrators/internal testers through a feature flag.
4. Migrate and visually compare representative legacy proposals.
5. Expand to proposal managers, then sales users.
6. Monitor save failures, conflict rate, finalization failures, request-status mismatches, PDF failures, and client-link errors.
7. Keep the old builder adapter available for one release as a rollback path, then remove it after parity metrics and user acceptance pass.

## 13. Recommended delivery order

The safest build sequence is:

1. State/mappers/calculations extraction.
2. Pure Classic renderer and export parity.
3. Canva-inspired workspace shell using the current API.
4. Structured selection, inspector, zoom, pages, and history.
5. Draft/autosave/revision backend and request lifecycle split.
6. Templates, brand controls, accessibility, performance, and staged rollout.

This sequence delivers the visible redesign early while isolating higher-risk persistence and lifecycle changes behind well-tested boundaries.
