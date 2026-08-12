# Adstra Advanced Lead Management — Implementation Plan

## 1. Repository baseline

- Backend: Django 5.2.2, Django REST Framework 3.16.0, SQLite, custom HS256 bearer JWT authentication.
- Frontend: Next.js 15.3.5 App Router, React 19, Axios, Lucide React, component-scoped CSS.
- Authorization: `CustomUser.role` plus JSON `custom_permissions`, resolved by `backend/utils/permissions.py`.
- Canonical customer: `apis.proposal.Client`.
- Canonical proposal/quotation data: `apis.proposal.Proposal`, `ProposalSection`, and `ProposalService`.
- Canonical invoice/proforma data: `apis.invoice.Invoice` (`is_proforma`) with invoice items and charges.
- Canonical payments/receipts: `apis.transactions.Transaction` plus existing Razorpay fields on `Invoice`.
- Canonical audit trail: `apis.settings.AuditLog` through `utils.logging_helper.log_action`.
- Upload configuration: Django `MEDIA_ROOT`/`MEDIA_URL`; there is no reusable secured document model.
- Missing systems: product/service catalogs, projects/orders, notification delivery, background scheduler, payment schedules, and explicit manager-to-team membership.

The repository contains an untracked basic `apis.leads` scaffold and UI. Its `0001_initial` migration is already applied in the working SQLite database. That migration will remain immutable.

## 2. Compatibility decisions

1. Preserve and migrate the existing Lead table with a forward `0002` schema/data migration.
2. Map legacy stages as follows: `new -> NEW`, `contacted -> CONTACT_ATTEMPTED`, `qualified -> QUALIFIED`, `proposal -> PROPOSAL_SENT`, `won -> CONVERTED`, `lost -> LOST`.
3. Convert legacy date-only follow-ups to 09:00 Asia/Kolkata, stored as aware UTC datetimes.
4. Reuse `Client`, `Proposal`, `Invoice`, and `Transaction`; do not introduce duplicate customer, quotation, proforma, invoice, receipt, or payment models.
5. Treat existing `Proposal` as the commercial proposal/quotation record and keep distinct lead workflow stages through lead-to-proposal link fields.
6. Because no catalog models exist, store product/service names as indexed text references. Do not incorrectly reference proposal-owned `ProposalService` line items.
7. Because no project/order models exist, store project and sales-order reference strings on conversion records and isolate creation behind an integration service for future adapters.
8. Use existing department and `is_team_lead` data for team visibility. Managers/admins receive all-lead access through role permissions; other users default to assigned/created records.
9. Generate reminder and overdue events with an idempotent Django management command. Deployment may schedule it externally; no Celery/Redis/cron framework will be added.

## 3. Backend files

### Create

- `backend/apis/leads/choices.py` — domain enums and stage groupings.
- `backend/apis/leads/validators.py` — phone, upload, schedule, and CSV safety validation.
- `backend/apis/leads/selectors.py` — permission-scoped, optimized querysets and dashboard/report aggregations.
- `backend/apis/leads/pagination.py` — bounded lead pagination.
- `backend/apis/leads/services.py` — centralized workflow, assignment, rejection, reopen, conversion, duplicate matching, quotation, import/export, and automation services.
- `backend/apis/leads/root_urls.py` — exact `/api/lead-lists/`, `/api/target-customers/`, `/api/leads/`, import/export/dashboard/report endpoint groups.
- `backend/apis/leads/management/commands/process_lead_reminders.py` — idempotent due/overdue/inactivity event generator.
- `backend/apis/leads/tests/` — model, workflow, permission, API, validation, and integration tests.
- `backend/apis/leads/migrations/0002_*.py` — forward-only schema and legacy data migration.

### Modify

- `backend/apis/leads/models.py` — all 16 requested domain entities, constraints, indexes, validation, and safe lead-number generation.
- `backend/apis/leads/serializers.py` — nested read serializers plus action-specific validation; `current_stage` remains read-only in CRUD.
- `backend/apis/leads/views.py` — CRUD/actions/import/export/dashboard/reports with backend permission enforcement.
- `backend/apis/leads/urls.py` — lead collection/detail and nested action routes.
- `backend/apis/leads/admin.py` — operational admin registration.
- `backend/utils/permissions.py` — requested `lead.*` permissions and role grants.
- `backend/backend/urls.py` — mount exact API groups while preserving the current compatibility path.
- `backend/apis/settings/views.py` — include lead tables in safe backup/export ordering if the existing format supports relational restoration without destructive regressions.

## 4. Domain and workflow implementation

- Add `TargetCustomerList`, `TargetCustomer`, expanded `Lead`, `LeadAssignmentHistory`, `LeadCall`, `LeadFollowUp`, `LeadMeeting`, `ProductDemo`, `ServiceRequirement`, `LeadRequirementItem`, `LeadCostEstimate`, `LeadTask`, `LeadDocument`, `LeadActivity`, `LeadRejection`, and `LeadConversion`.
- Add database indexes for lead number, phone, email, stage, assignee, follow-up, last activity, source, campaign, and created date.
- Put every stage change behind `LeadWorkflowService.transition()`; serializer updates reject `current_stage`.
- Validate lead type, meetings, demos, requirements, feasibility, approved estimate, quotation, permission, hold/resume state, and reopen rules.
- Record every transition and material action in `LeadActivity`; record security-sensitive actions in the existing `AuditLog` as well.
- Wrap assignment, rejection, reopening, conversion, customer matching/creation, and commercial integration in database transactions.
- Make conversion one-to-one/idempotent and return duplicate customer candidates before creating a new `Client`.

## 5. API surface

- `/api/lead-lists/` and `/api/lead-lists/{id}/`
- `/api/target-customers/` and `/api/target-customers/{id}/`
- `/api/leads/` and `/api/leads/{id}/`
- `/api/leads/{id}/assign/`, `reassign/`, `qualify/`, `transition/`, `convert/`, `reject/`, `reopen/`, `timeline/`
- `/api/leads/{id}/calls/`, `follow-ups/`, `meetings/`, `demo/`, `requirements/`, `cost-estimates/`, `tasks/`, `documents/`
- `/api/leads/{id}/quotation/` for the existing Proposal integration
- `/api/lead-import/`, `/api/lead-export/`, `/api/lead-dashboard/`, `/api/lead-reports/`

List endpoints will support bounded pagination, search, ordering, date range, employee, stage, product/service, priority, temperature, source, campaign, lead type, overdue, and do-not-call filters with `select_related`/`prefetch_related` where appropriate.

## 6. Frontend files and pages

### Modify

- `adstra-next/src/components/admin_side/LeadManagement/LeadManagement.jsx`
- `adstra-next/src/components/admin_side/LeadManagement/LeadManagement.css`
- `adstra-next/src/app/leadmanagement/page.js` only if route wiring needs adjustment.
- `adstra-next/src/components/admin_side/AdminDashboard/AdminDashboard.jsx` only to replace the temporary `clients.view` gate with lead permissions.

### Create as needed inside `LeadManagement/`

- API client/hooks and domain constants.
- Shared shell, permission gate, filter bar, status/temperature badges, forms, drawers, data table, empty/error/loading states.
- Dashboard, target lists/import preview, lead table, workflow-validated Kanban, telecalling workspace, tabbed lead detail, meeting calendar, and reports views.
- Pure frontend utility tests using a repository-compatible runner without adding a large test framework solely for this module.

The UI will use the existing Next.js/Axios/Lucide stack and a responsive operations-console visual system. Kanban drag/drop and all stage actions call the backend transition endpoint and surface validation failures.

## 7. Security and validation

- Normalize/validate Indian and international phone input and email addresses.
- Detect potential duplicate phone/email records during target import, lead creation, and conversion.
- Validate future follow-ups, meeting intervals, lead-type-specific demo/requirement actions, do-not-call, rejection details, feasibility prerequisites, estimate approval, quotation presence, and conversion idempotency.
- Sanitize upload names, allow-list extensions/MIME types, cap file size, and serve document metadata/downloads only through permission-scoped endpoints.
- Escape spreadsheet formula prefixes on CSV export and validate CSV headers/row counts/content on import.
- Use existing DRF authentication/throttling and avoid stack trace leakage.

## 8. Verification order

1. Run `manage.py check` and migration consistency checks.
2. Run lead model/workflow tests after models and services.
3. Run lead permission/API/integration tests after endpoints.
4. Run the complete Django test suite.
5. Run frontend utility tests and `npm run build`.
6. Exercise authenticated lead API flows and verify conversion does not duplicate clients.
7. Render the lead workspace at desktop and mobile widths, run the mandatory external design evaluation, apply priority fixes, and capture final screenshots.

## 9. Risks and rollback

- SQLite concurrency makes sequential numbers vulnerable without a uniqueness/retry strategy.
- Existing Client records are not normalized or unique; matching must be advisory and transactional.
- The current team model cannot represent arbitrary reporting hierarchies.
- Product/service catalogs and project/order creation remain adapter boundaries until canonical modules exist.
- Notification delivery and task scheduling remain deployment integration points because the repository has no suitable system and adding one was not authorized.
- Rollback will reverse the newest lead migration only after exporting lead data/documents. Existing `0001` and legacy records will not be rewritten or deleted.
