# Proposal–Lead Integration Implementation Plan

## Goal and assumptions

Add a **My Proposals** tab to the existing Lead Management > My Profile workspace and connect the standalone Proposal Builder to Lead Management with a searchable, single-lead selector.

This plan assumes one active proposal/quotation per lead, matching the existing `Lead.quotation` relationship and `LeadQuotationService`. Manual proposals that are not created from a lead remain supported.

## Current state

- The My Profile tabs are defined and rendered in `adstra-next/src/components/admin_side/LeadManagement/LeadManagement.jsx`.
- `Lead.quotation` already points to `proposal.Proposal`; this remains the canonical relationship. No duplicate `Proposal.lead` database field is needed.
- `LeadQuotationService.create` already creates and links a proposal atomically, but the Proposal Builder does not call it and it does not yet accept the builder's full section payload.
- Generic proposal creation does not set `created_by`, and proposal list/update/delete queries are not owner-scoped.
- The Proposal Builder currently requires a `Client` and has no lead selector.

## Recommended implementation

### 1. Secure and formalize proposal ownership

Files:

- `backend/utils/permissions.py`
- `backend/apis/proposal/views.py`
- `backend/apis/proposal/serializers.py`
- `backend/apis/proposal/urls.py`

Work:

1. Make `created_by` read-only in `ProposalSerializer` and always set it from `request.user` during creation.
2. Add a shared `proposal_queryset_for(user)` selector:
   - administrators/managers or users with a new `proposals.view_all` permission can access all proposals;
   - other users can access proposals they created or proposals linked to leads in their permitted lead scope;
   - use `select_related("client", "created_by")`, prefetch services/sections/source leads, and `distinct()`.
3. Apply the scoped queryset to list, retrieve/update, and delete operations to prevent IDOR access by primary key.
4. Add `GET /proposal/mine/` for the My Proposals tab. Return only the authenticated user's proposals, with pagination, search, status filtering, and compact counts for `all`, `draft`, `sent`, and `approved`.
5. Extend proposal responses with a read-only `source_lead` summary: id, lead number, company/customer/contact name, product/service, stage, assigned user, and quotation number. Derive it through the existing `Proposal.source_leads` reverse relation.
6. Add `proposals.view_all` to permission definitions and appropriate management roles. Update the sales My Profile permission preset with the minimum needed permissions (`proposals.view`, `proposals.create`, `proposals.update`, `lead.create_proposal`); do not grant delete by default.

### 2. Add a purpose-built eligible-leads API

Files:

- `backend/apis/proposal/views.py`
- `backend/apis/proposal/urls.py`
- `backend/apis/leads/selectors.py` (reuse or expose the existing user-scoped selector)

Work:

1. Add `GET /proposal/eligible-leads/` for users who can create proposals.
2. Scope results through the existing lead-access rules, never through a client-supplied user id.
3. Support `search`, `page`, and `page_size`. Search lead number, customer/company/contact, phone, email, product, and service.
4. Return the fields required for selection and prefill: lead identity, contact details, address, requirement summary, product/service, estimated value, stage, `customer_record`, and existing `quotation` summary.
5. Prefer leads in commercial stages such as cost estimation/proposal preparation, but do not hide other accessible active leads unless the product owner makes that a hard business rule. Mark already-linked leads as unavailable and return their existing proposal id so the UI can offer **Open existing proposal**.

### 3. Create proposals from leads atomically

Files:

- `backend/apis/leads/services.py`
- `backend/apis/leads/views.py`
- `backend/apis/proposal/views.py`
- `backend/apis/proposal/serializers.py`

Work:

1. Accept an optional write-only `lead_id` in the proposal creation flow. Manual client-only creation remains unchanged.
2. When `lead_id` is present, validate the lead through the authenticated user's scoped queryset and require both proposal creation and lead proposal permissions.
3. Extend/refactor `LeadQuotationService` so the Proposal Builder can submit the complete payload: proposal number, reference, purpose, notes, status, client choice, services, and sections.
4. Use one `transaction.atomic()` block and `select_for_update()` on the lead. Create the proposal and nested rows, set `created_by`, then assign `Lead.quotation`. A failure at any step must roll back everything.
5. If another proposal is already linked, return HTTP 409 with a stable error code and existing proposal summary. Do not silently create or overwrite a second proposal.
6. Client resolution order:
   - use the lead's existing `customer` when present;
   - otherwise use a submitted `client_id` after validation;
   - otherwise check the existing duplicate-customer matching service;
   - if matches exist, return a conflict containing candidates for user selection;
   - if there is no match, create a Client from the lead after explicit confirmation, then assign it to both the lead and proposal.
7. Copy sensible defaults from the lead: lead number to reference, requirement/product/service to purpose and first service row, estimated/approved cost to rate, and contact/company/address to the client draft.
8. Record the existing lead activity and audit event after successful linkage. Do not automatically advance the lead stage; stage transitions must continue to use the workflow service and its prerequisites.
9. Keep `GET/POST /leads/<id>/quotation/` backward compatible by routing it through the same refactored service.

### 4. Add the lead selector to Proposal Builder

Files:

- `adstra-next/src/components/ProposalBuilder/ProposalBuilder.js`
- `adstra-next/src/components/HeaderEditor/HeaderEditor.js`
- new `adstra-next/src/components/ProposalBuilder/LeadSelector.js` (recommended to keep the builder manageable)
- relevant Proposal Builder CSS file(s)

Work:

1. Add a **Create from lead** control near New Proposal/Recent Proposals. Open a searchable, paginated single-select modal or combobox backed by `/proposal/eligible-leads/`.
2. Show lead number, company/contact, product/service, stage, owner, and existing-proposal state. Disable already-linked leads and expose **Open existing**.
3. Store `selectedLead` separately from `billTo`; selecting a lead prefills reference, purpose, client/contact fields, service description, and estimated rate without erasing subsequent user edits.
4. If the lead already has a Client, select it in `HeaderEditor`. Otherwise show the prefilled client draft and resolve/create the Client during save according to the backend conflict flow.
5. Relax the current “client id required” validation only when a lead is selected and the lead-client resolution payload is present.
6. Include `lead_id` in new proposal payloads. Once created, retain the returned proposal id and source-lead summary for later updates.
7. Parse optional query parameters:
   - `/proposal?lead=<id>` preselects an eligible lead;
   - `/proposal?proposal=<id>` opens an accessible existing proposal.
   Invalid or unauthorized ids must show a clear error and leave the builder usable.
8. When loading an existing proposal, restore its linked-lead context. Do not allow changing the source lead during normal edits.
9. Update Recent Proposals to use scoped results and include/search by lead number as well as proposal/client.

### 5. Add My Proposals to Lead Management > My Profile

Files:

- `adstra-next/src/components/admin_side/LeadManagement/LeadManagement.jsx`
- `adstra-next/src/components/admin_side/LeadManagement/LeadManagement.css`
- `adstra-next/src/utils/permissionUtils.js` only if a new helper is needed

Work:

1. Add `{ id: "proposals", label: "My Proposals", icon: FileText }` to the nested My Profile tab array shown in the supplied screenshot, gated by `proposals.view`.
2. Lazy-load `/proposal/mine/` only when the tab is opened so the existing large profile request does not grow.
3. Build a responsive personal proposals panel with:
   - status summary cards;
   - search and status filters;
   - columns/cards for proposal number, linked lead, client, purpose, amount, date, and status;
   - **View/Edit**, **Open lead**, and **Create proposal** actions according to permissions;
   - loading, empty, error, and pagination states.
4. Route **Create proposal** to `/proposal?lead=<lead-id>` and edit/view actions to `/proposal?proposal=<proposal-id>`.
5. Refresh the tab after returning from the builder or provide an explicit refresh control. Counts should come from the server response, not the current page length.

### 6. Tests and verification

Backend files:

- replace/extend `backend/apis/proposal/tests.py` (or split into a `tests/` package)
- extend `backend/apis/leads/tests/test_my_profile.py`
- extend `backend/apis/leads/tests/test_workflow.py`
- extend `backend/apis/leads/tests/test_permissions_filters.py`

Automated cases:

1. Creation always records `created_by` and nests services/sections correctly.
2. Users see only their allowed proposals; update/delete/retrieve reject another user's proposal.
3. Eligible leads are restricted to the authenticated user's lead scope.
4. Creating from a lead links both records atomically and records activity/audit data.
5. Duplicate submission or concurrent creation returns the existing-proposal conflict and never creates two linked proposals.
6. Client resolution covers existing lead customer, selected match, confirmed new client, and ambiguous duplicate conflict.
7. Manual proposal creation remains backward compatible.
8. Workflow prerequisites remain intact and proposal creation does not bypass stage transition rules.
9. My Proposals pagination, search, filters, status counts, and legacy proposals with missing `created_by` behave as documented. Legacy unowned/unlinked proposals should be visible only to all-proposals roles until backfilled.

Verification commands and manual flow:

1. Run Django proposal and lead tests, then the full backend test suite.
2. Run `npm run build` in `adstra-next` because the project has no configured frontend unit-test runner.
3. Log in as a sales user and verify My Proposals contains only personal records.
4. Select an unlinked lead in Proposal Builder, confirm prefill, save, and verify the same proposal appears in My Proposals and on the lead.
5. Test a lead with an existing Client, a lead needing a new Client, an ambiguous duplicate match, and a lead already linked to a proposal.
6. Verify unauthorized proposal ids and lead ids cannot be opened by changing URLs manually.
7. Verify admin/all-proposals users retain the intended global view.

## Migration and rollout

- No lead–proposal relationship migration is required; retain `Lead.quotation` as the single source of truth.
- A permission definition/code rollout is required for `proposals.view_all`; update role defaults and the frontend user-management preset together.
- Before enabling the tab, audit existing proposals with `created_by IS NULL`. Backfill ownership only where it can be derived safely from linked leads or audit data; otherwise leave them admin-only.
- Deploy backend/API and permission changes before the frontend so old clients remain compatible and the new UI never depends on unavailable endpoints.

