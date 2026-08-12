# Advanced Lead Management backend

This Django app extends the applied legacy `leads.0001_initial` table without
duplicating Adstra's customer, proposal/quotation, invoice/proforma, or payment
models.

## Canonical integrations

- Customer: `apis.proposal.Client`
- Proposal/quotation: `apis.proposal.Proposal` and `ProposalService`
- Invoice/proforma: `apis.invoice.Invoice` (`is_proforma`)
- Receipt/payment ledger: `apis.transactions.Transaction`
- Security audit: `apis.settings.AuditLog` through `utils.logging_helper.log_action`

Product and service names are indexed text references because no canonical
catalog exists. `LeadConversion.project` and `sales_order` are adapter-ready
reference strings because no project/order models exist.

## Workflow boundary

`Lead.save()` rejects direct changes to an existing lead's `current_stage`, and
new leads may only begin at `TARGETED` or `NEW`. All stage changes must call
`LeadWorkflowService.transition()` or a transactional action service in
`services.py`. Assignment, rejection, reopen, quotation, and conversion actions
record both `LeadActivity` and important entries in the existing audit log.

The workflow validates lead type, meeting/demo state, customization, requirement
capture, technical/feasibility results, approved estimates, quotation presence,
and backend permissions. Conversion is one-to-one and idempotent. Possible
customer matches by phone, email, GSTIN, or company name return HTTP 409 and
must be resolved by selecting the existing customer.

## REST API

- `/api/lead-lists/`, `/api/lead-lists/{id}/`
- `/api/target-customers/`, `/api/target-customers/{id}/`
- `/api/leads/`, `/api/leads/{id}/`
- `/api/leads/{id}/assign/`, `reassign/`, `qualify/`, `transition/`
- `/api/leads/{id}/convert/`, `reject/`, `reopen/`, `timeline/`
- `/api/leads/{id}/calls/`, `follow-ups/`, `meetings/`, `demo/`
- `/api/leads/{id}/requirements/`, `cost-estimates/`, `tasks/`, `documents/`
- `/api/leads/{id}/quotation/`
- `/api/lead-import/`, `/api/lead-export/`
- `/api/lead-dashboard/`, `/api/lead-reports/`

List APIs use bounded page-number pagination (25 default, 100 maximum) and the
lead list supports search, safe ordering, date range, employee, stage,
product/service, priority, temperature, source, campaign, type, and overdue
filters. Querysets enforce own/all visibility before object lookup.

Document metadata never exposes the storage path. Downloads go through the
permission-scoped endpoint. Uploads are capped at 10 MiB and checked by safe
filename, extension, declared MIME type, and file signature. CSV exports escape
formula prefixes; imports are bounded, normalized, duplicate-aware, and atomic
by default.

## Migrations

- `0001_initial` is immutable and was already applied before this module.
- `0002_*` adds the advanced schema, copies legacy data, and only then removes
  legacy columns. Legacy follow-up dates become 09:00 Asia/Kolkata stored in
  UTC; legacy stages use the mapping in the migration.
- `0003_*` adds database check constraints.

Before deployment:

```powershell
python manage.py check
python manage.py makemigrations leads --check --dry-run
python manage.py migrate --plan
python manage.py migrate
```

Back up the database and `MEDIA_ROOT` before migration. SQLite deployments need
an exclusive maintenance window for schema changes.

## Reminder automation

No scheduler dependency is installed. A deployment scheduler may invoke this
repeat-safe command at an appropriate interval:

```powershell
python manage.py process_lead_reminders --inactivity-days 30 --due-window-hours 24
```

Repeated runs do not duplicate the same reminder/overdue/inactivity activity.

## Rollback

1. Stop lead writes and export lead CSVs plus the protected document directory.
2. Reverse to `leads.0001_initial` only if no unsupported advanced stages exist:
   `python manage.py migrate leads 0001`.
3. The reverse data migration intentionally aborts when an advanced stage has
   no conservative legacy equivalent; resolve/export those leads first.
4. Restore the database and media backup if a destructive rollback is needed.

Do not edit migration `0001`, manually alter `db.sqlite3`, or delete converted,
rejected, or financial history as a rollback mechanism.

## Known adapter boundaries

- Notification delivery currently materializes durable lead activities; the
  repository has no notification delivery subsystem.
- The management command must be scheduled by deployment infrastructure.
- Projects, orders, payment schedules, and product/service catalogs require
  future canonical modules before their reference fields can become foreign
  keys.
- Team visibility uses the existing role/department/team-lead information; the
  user model has no explicit reporting hierarchy.

