# Lead Management REST API

This document describes the API implemented by `apis.leads` as of the advanced lead-management migrations. The canonical base paths are under `/api`. The same lead routes are also mounted under `/leads/` for the original scaffold; new clients should use `/api/leads/`.

## Authentication, authorization, and formats

Every endpoint requires the project's JWT authentication header:

```http
Authorization: Bearer <token>
```

JSON is used unless an endpoint explicitly returns CSV or a file. Send timezone-aware ISO-8601 values for datetimes. The backend stores datetimes in UTC. Decimal amounts should be JSON strings when exact decimal preservation matters.

Authorization is the intersection of an endpoint permission and the caller's visibility scope:

- `lead.view_all` sees all leads, lists, and targets.
- `lead.view_own` sees leads assigned to or created by the caller. A team lead with a department also sees records assigned to or created by users in that department.
- Administrators, super administrators, managers, and explicit `lead.view_all` holders have all-lead visibility.
- An object outside the caller's scoped queryset returns `404`, not a disclosure-producing `403`.
- A direct permission failure returns `403` with `{"error":"Permission denied.","required_permission":"lead.<code>"}`.

Authenticated requests are subject to the configured DRF user throttle, currently `1000/day` unless overridden by `DRF_USER_THROTTLE_RATE`.

## Collection behavior

Paginated endpoints return:

```json
{
  "count": 125,
  "next": "https://example/api/leads/?page=2",
  "previous": null,
  "results": []
}
```

The default page size is 25. `page_size` may be set up to 100.

The lead list, export, dashboard, and report endpoints accept the same filters:

| Parameter | Behavior |
| --- | --- |
| `search` | Matches lead number, customer/company/contact name, phone, WhatsApp, email, product, service, source, or campaign. |
| `stage` or `current_stage` | One or more uppercase stages; repeat the parameter or use comma-separated values. |
| `lead_type` | `PRODUCT` or `SERVICE`; repeatable/comma-separated. |
| `priority` | `LOW`, `MEDIUM`, `HIGH`, or `URGENT`; repeatable/comma-separated. |
| `temperature` | `HOT`, `WARM`, `COLD`, or `UNQUALIFIED`; repeatable/comma-separated. |
| `source`, `campaign`, `product`, `service` | Exact, case-insensitive values; repeatable/comma-separated. |
| `employee` or `assigned_to` | User ID, multiple IDs, or `unassigned`/`none`/`null`. |
| `do_not_call` | Boolean (`true/false`, `1/0`, `yes/no`, `on/off`). |
| `overdue` | `true` selects active leads with a past follow-up; `false` selects null or non-past follow-ups. |
| `date_field` | `created_at` (default), `updated_at`, `next_follow_up_at`, or `last_activity_at`. |
| `date_from`, `created_from`, `start_date` | Inclusive ISO date or datetime lower bound. |
| `date_to`, `created_to`, `end_date` | Exclusive datetime upper bound; a date includes that full local date. |
| `ordering` or `sort` | Up to three fields, comma-separated; prefix `-` for descending. Allowed fields: `lead_number`, `customer_name`, `company_name`, `lead_type`, `stage`, `current_stage`, `priority`, `temperature`, `lead_score`, `estimated_value`, `conversion_probability`, `next_follow_up_at`, `last_activity_at`, `created_at`, `updated_at`. |

Unknown or malformed filters are ignored defensively. Default ordering is `-updated_at,-id`.

## Endpoint index

All permissions below are backend-enforced. A nested `GET` also requires the lead to be in the caller's visibility scope.

| Method and path | Permission | Success | Purpose |
| --- | --- | --- | --- |
| `GET /api/leads/` | `lead.view_own` or `lead.view_all` | `200`, paginated | Filtered lead list. |
| `POST /api/leads/` | `lead.create` | `201` | Create a lead and a `CREATED` activity. |
| `GET /api/leads/{id}/` | visible lead | `200` | Lead detail, including `allowed_transitions`. |
| `PATCH/PUT /api/leads/{id}/` | `lead.edit` | `200` | Update lead data. `current_stage` is rejected. |
| `DELETE /api/leads/{id}/` | `lead.delete` | `204` | Delete a non-converted lead. Converted leads return `409`. |
| `POST /api/leads/{id}/assign/` | `lead.assign`, or `lead.reassign` if already assigned | `200` | Assign and, from `NEW`, advance to `ASSIGNED`. |
| `POST /api/leads/{id}/reassign/` | `lead.reassign` | `200` | Reassign an assigned lead. An unassigned lead returns `400`. |
| `POST /api/leads/{id}/qualify/` | `lead.edit` plus workflow checks | `200` | Shortcut transition to `QUALIFIED`. |
| `POST /api/leads/{id}/transition/` | target-dependent; see below | `200` | Central workflow transition, hold, or resume. |
| `POST /api/leads/{id}/reject/` | `lead.reject` | `201` | Create rejection history and transition to `REJECTED`. |
| `POST /api/leads/{id}/reopen/` | `lead.reopen` | `200` | Reopen `REJECTED` or `LOST` to `NEW`. |
| `POST /api/leads/{id}/convert/` | `lead.convert` | `201` | Idempotent conversion; may return duplicate candidates with `409`. |
| `GET /api/leads/{id}/timeline/` | visible lead | `200`, paginated | Activity timeline. |
| `GET/POST /api/leads/{id}/calls/` | visible lead / `lead.call` | `200` / `201` | List or record calls. |
| `GET/POST /api/leads/{id}/follow-ups/` | visible lead / `lead.follow_up` | `200` / `201` | List or schedule follow-ups. |
| `GET/POST /api/leads/{id}/meetings/` | visible lead / `lead.schedule_meeting` | `200` / `201` | List or schedule meetings. |
| `GET/POST /api/leads/{id}/demo/` | visible lead / `lead.complete_demo` | `200` / `201` or `200` update | List, create, or update product demos. |
| `GET/POST /api/leads/{id}/requirements/` | visible lead / `lead.capture_requirement` | `200` / `201` | Requirement records and line items. |
| `GET/POST /api/leads/{id}/cost-estimates/` | visible lead / `lead.create_cost_estimate`; approval also needs `lead.approve_cost_estimate` | `200` / `201` | List or create estimates. |
| `GET/POST /api/leads/{id}/tasks/` | visible lead / `lead.edit` | `200` / `201` | List or create lead tasks. |
| `GET/POST /api/leads/{id}/documents/` | visible lead / `lead.edit` | `200` / `201` | List metadata or upload a protected document. |
| `GET /api/leads/{id}/documents/{document_id}/download/` | visible lead | `200` file | Permission-scoped download. |
| `GET/POST /api/leads/{id}/quotation/` | visible lead / `lead.create_quotation` | `200` / `201` | Read or idempotently create the canonical `Proposal`. |
| `GET/POST /api/lead-lists/` | view scope / `lead.create` | `200` / `201` | Target-customer lists. |
| `GET/PATCH/PUT/DELETE /api/lead-lists/{id}/` | view scope / `lead.edit` / `lead.delete` | `200` / `204` | Target-list detail and maintenance. |
| `GET/POST /api/target-customers/` | view scope / `lead.create` | `200` / `201` | Target-customer list and create. |
| `GET/PATCH/PUT/DELETE /api/target-customers/{id}/` | view scope / `lead.edit` / `lead.delete` | `200` / `204` | Target-customer detail and maintenance. |
| `POST /api/lead-import/` | `lead.import` | `201` | Atomic target or lead CSV import. |
| `GET /api/lead-export/` | `lead.export` | `200` CSV | Scoped lead or target export. |
| `GET /api/lead-dashboard/` | `lead.view_reports` | `200` | Cards and chart series. |
| `GET /api/lead-reports/` | `lead.view_reports` | `200` | Aggregated lead reports. |

Compatibility routes `/api/leads/create/`, `/api/leads/update/{id}/`, and `/api/leads/delete/{id}/` remain mounted, as do their `/leads/` equivalents. They map to the canonical collection/detail handlers and should not be used by new clients.

## Core CRUD payloads

### Target-customer list

`POST /api/lead-lists/` requires `name`. Writable fields are `name`, `description`, `campaign`, `source`, `assigned_team`, and `status`. `status` defaults to `ACTIVE` and accepts `DRAFT`, `ACTIVE`, `PAUSED`, `COMPLETED`, or `ARCHIVED`. `id`, `created_by`, `created_at`, and `updated_at` are server-managed. Responses also include `created_by_name` and `customer_count`.

### Target customer

`POST /api/target-customers/` requires `customer_list` and, collectively, at least one name (`customer_name`, `company_name`, or `contact_person`) and one contact (`phone`, `whatsapp_number`, or `email`). Writable fields are:

```text
customer_list, customer_name, company_name, contact_person,
phone, whatsapp_number, email, website, address, city, state,
industry, business_category, customer_type, interested_product,
interested_service, source, priority, tags, assigned_to, notes,
do_not_call
```

`priority` defaults to `MEDIUM`, `tags` to `[]`, and `do_not_call` to `false`. `imported_at`, timestamps, and `id` are server-managed for direct CRUD. Phone values are normalized and email is trimmed/lowercased. Another target with the same phone/WhatsApp or case-insensitive email produces a `duplicate` validation error.

Target list query parameters are `search`, `customer_list`, `assigned_to`, `priority`, `source`, `do_not_call`, `page`, and `page_size`.

### Lead

The writable lead fields are:

```text
target_customer, customer, quotation, lead_type,
customer_name, company_name, contact_person,
phone, whatsapp_number, email, address,
source, campaign, product, service, requirement_summary,
assigned_to, priority, temperature, lead_score, estimated_value,
conversion_probability, next_follow_up_at
```

Creation requires at least one name and one contact. `PRODUCT` requires `product`; `SERVICE` requires `service`. Defaults are `lead_type=SERVICE`, `priority=MEDIUM`, `temperature=COLD`, `lead_score=0`, and `conversion_probability=0`. Scores/probability are 0–100 and amounts are non-negative.

The server manages `lead_number`, `current_stage`, `stage_before_hold`, `assigned_by`, `last_activity_at`, `created_by`, and timestamps. Any CRUD payload containing `current_stage` returns `400`; use the transition/rejection/conversion endpoints. Responses add user names, a compact `customer_record`, `quotation_number`, effective `do_not_call`, and `allowed_transitions`.

Phone and WhatsApp values are normalized; email is trimmed/lowercased. A lead matching another lead's phone, WhatsApp, or case-insensitive email is rejected. A matching target customer is also rejected unless it is the lead's explicitly selected `target_customer`.

## Workflow action payloads

### Assignment, qualification, and transition

```json
POST /api/leads/42/assign/
{"assigned_to": 17, "reason": "South territory"}
```

`assigned_to` must be an active user. `reason` is optional (maximum 1000 characters).

```json
POST /api/leads/42/qualify/
{"reason": "Budget and decision maker confirmed"}
```

The qualification endpoint reads optional `reason` directly; it otherwise uses `Lead qualified`.

```json
POST /api/leads/42/transition/
{"target_stage": "CONNECTED", "reason": "Reached customer"}
```

`target_stage` is required and must be a known uppercase stage. The required permission is target-sensitive:

| Target | Permission |
| --- | --- |
| `DEMO_SCHEDULED` | `lead.schedule_meeting` |
| `DEMO_COMPLETED`, `CUSTOMIZATION_REQUIRED` | `lead.complete_demo` |
| `REQUIREMENT_MEETING_SCHEDULED` | `lead.schedule_meeting` |
| `REQUIREMENT_COLLECTED` | `lead.capture_requirement` |
| `TECHNICAL_REVIEW`, `FEASIBILITY_REVIEW` | `lead.technical_review` |
| `COST_ESTIMATION` | `lead.create_cost_estimate` |
| `PROPOSAL_PREPARATION`, `PROPOSAL_SENT` | `lead.create_proposal` |
| `QUOTATION_SENT` | `lead.create_quotation` |
| `CONVERTED` | `lead.convert` and the conversion action |
| `REJECTED` | `lead.reject` and the rejection action |
| All other targets, including hold/resume | `lead.edit` |

See [WORKFLOW.md](./WORKFLOW.md) for permitted transitions and prerequisites.

### Rejection and reopen

```json
POST /api/leads/42/reject/
{
  "reason": "NOT_INTERESTED",
  "detailed_notes": "Customer confirmed there is no current requirement.",
  "competitor": "",
  "recontact_allowed": true,
  "recontact_at": "2026-10-01T09:00:00+05:30"
}
```

`reason` and nonblank `detailed_notes` are required. Reasons are `NOT_INTERESTED`, `INVALID_CONTACT`, `NO_REQUIREMENT`, `BUDGET_ISSUE`, `PRICE_TOO_HIGH`, `COMPETITOR_SELECTED`, `REQUIREMENT_POSTPONED`, `UNABLE_TO_CONTACT`, `OUTSIDE_SERVICE_AREA`, `PRODUCT_UNAVAILABLE`, `SERVICE_UNAVAILABLE`, `DUPLICATE`, `CUSTOMER_CANCELLED`, `NOT_FEASIBLE`, and `OTHER`. If supplied, `recontact_at` must be future and `recontact_allowed` must be true.

```json
POST /api/leads/42/reopen/
{"reason": "Customer requested a new discussion"}
```

Only `REJECTED` and `LOST` can reopen, always to `NEW`.

### Conversion

```json
POST /api/leads/42/convert/
{
  "conversion_type": "SERVICE_ORDER",
  "customer_id": 9,
  "final_value": "125000.00",
  "discount": "5000.00",
  "payment_terms": "50% advance, balance on delivery",
  "create_invoice": true,
  "project": "PRJ-2026-001",
  "sales_order": "",
  "gstin": "",
  "lut": "",
  "notes": "Approved by customer"
}
```

All fields are optional at serializer level, but the service requires the lead to be `DECISION_PENDING` and linked to a quotation. `conversion_type` defaults from lead type (`PRODUCT_ORDER` or `SERVICE_ORDER`); it may also be `PROJECT`. `final_value` falls back in order to quotation total, approved estimate final amount, estimated value, then zero. `discount` defaults to zero. `create_invoice=true` reuses an existing non-deleted invoice for the proposal or creates one with the existing invoice integration.

If `customer_id` is supplied, that canonical `Client` is reused. Otherwise the service reuses `lead.customer`, or checks phone, email, company name, and optional `gstin` for possible clients. A possible match returns:

```json
{
  "error": "Possible duplicate customers found. Select one or confirm creation.",
  "possible_duplicates": [
    {"id": 9, "name": "Acme", "matched_on": ["phone", "email"]}
  ]
}
```

with `409`. Resubmit with the selected `customer_id`. `confirm_create_customer` is accepted by the current input serializer for compatibility, but the current service does not use it to bypass duplicate candidates. Repeating conversion after success returns the existing one-to-one conversion instead of creating another.

## Operational child-resource payloads

Fields named `lead`, actor fields, IDs, calculated totals/durations, and creation timestamps are server-managed unless noted.

| Endpoint | POST fields and important validation |
| --- | --- |
| `calls/` | Required: `started_at`, `outcome`. Optional: `direction` (`OUTBOUND` default or `INBOUND`), `ended_at`, `customer_response`, `discussion_summary`, `next_action`, `follow_up_required`, `follow_up_at`, `meeting_required`. End cannot precede start; a required follow-up needs a future time; outbound calls are blocked for do-not-call targets. Duration is calculated. |
| `follow-ups/` | Required: `follow_up_type`, `scheduled_at`, `purpose`. Optional: `assigned_to`, `notes`, `status`, `result`, `completed_at`, `next_follow_up_at`, `reminder_at`. A scheduled follow-up and any next follow-up must be future. `PHONE` is blocked for do-not-call targets. Assignee falls back to lead assignee, then caller. |
| `meetings/` | Required: `title`, `meeting_type`, `meeting_mode`, `scheduled_start`, `scheduled_end`. Optional: `location`, `meeting_link`, `assigned_to`, `attendees`, `agenda`, `notes`, `status`, `outcome`, `reminder_at`. End must be after start; new scheduled/confirmed meetings must be future. Lead-type and customization rules apply. |
| `demo/` | Required for create: `product`. Optional: `id` (raw request selector for partial update), `meeting`, `product_version`, `customer_attendees`, `requested_features`, `customer_pain_points`, `feedback`, `interest_level`, trial fields, `customization_required`, `quotation_required`, `outcome`, `next_action`, `completed_at`. Product leads only; meeting must be this lead's `PRODUCT_DEMO`; trial dates must be ordered. Supplying `completed_at` runs demo completion automation. |
| `requirements/` | Without `kind=item`, required: `business_objective`, `current_problem`, `required_solution`; fields also include `meeting`, `service`, requirement details, dates/budget, `site_visit_required`, `technical_review_required`, `feasibility_status`, `requirement_status`. With `kind=item`, required: `title`, `description`; optional: `requirement`, `category`, `priority`, `feasibility`, `estimated_hours`, `estimated_cost`, `notes`. Cross-lead relationships are rejected. |
| `cost-estimates/` | Cost fields: `development_cost`, `product_cost`, `infrastructure_cost`, `implementation_cost`, `support_cost`, `tax`, `discount`, `internal_margin`, `final_amount`, `approval_status`, `notes`. Amounts must be non-negative. `total_cost` is calculated as components plus tax minus discount, floored at zero; zero/omitted `final_amount` becomes total. `approval_status=APPROVED` also requires `lead.approve_cost_estimate` and records the caller as approver. |
| `tasks/` | Required: `title`. Optional: `task_type`, `description`, `assigned_to`, `priority`, `start_at`, `due_at`, `reminder_at`, `status`, `completed_at`, `completion_notes`. Due cannot precede start. Assignee falls back to lead assignee, then caller. |
| `documents/` | Multipart fields: required `title`, `file`; optional `document_type` and `description`. The response intentionally omits `file` and returns only metadata plus `download_url`. |

Call outcomes: `CONNECTED`, `NO_ANSWER`, `BUSY`, `SWITCHED_OFF`, `INVALID_NUMBER`, `CALLBACK_REQUESTED`, `INTERESTED`, `NOT_INTERESTED`, `DEMO_REQUESTED`, `MEETING_REQUESTED`, `FOLLOW_UP_REQUIRED`.

Follow-up types: `PHONE`, `WHATSAPP`, `EMAIL`, `MEETING`, `DEMO`, `REQUIREMENT_DISCUSSION`, `SITE_VISIT`, `PROPOSAL`, `QUOTATION`, `PAYMENT`.

Meeting types: `PRODUCT_DEMO`, `PRODUCT_DISCUSSION`, `CUSTOMIZATION_REQUIREMENT`, `SERVICE_REQUIREMENT`, `TECHNICAL_DISCUSSION`, `SITE_VISIT`, `PROPOSAL_DISCUSSION`, `NEGOTIATION`, `FOLLOW_UP`. Modes: `ONLINE`, `OFFICE`, `CUSTOMER_LOCATION`, `PHONE`.

## Quotation payload

`POST /api/leads/{id}/quotation/` uses the canonical proposal models. Accepted keys are `total_amount`, `purpose`, `total_in_words`, `notes`, `status`, and `services`. Each service accepts `description`, `quantity`, `rate`, `amount`, and `gst`.

```json
{
  "total_amount": "125000.00",
  "purpose": "CRM implementation",
  "status": "draft",
  "services": [
    {"description": "Implementation", "quantity": 1, "rate": "125000.00", "amount": "125000.00", "gst": "18.00"}
  ]
}
```

The service generates proposal number `AD/<year>/LEAD-<lead-id>`, reference, company, creator, and defaults from the lead. If a quotation is already linked, POST returns it unchanged. `GET` without one returns `404` and `{"detail":"No quotation has been created."}`.

## Import and export

Use multipart form data for the supported import path:

```text
POST /api/lead-import/
mode=targets | leads
file=<UTF-8 CSV>
customer_list=<id>    # required only for mode=targets
```

The API serializer also accepts a `rows` JSON key, but the current import engine is CSV-based; production clients should upload a CSV file. Imports are atomic, limited to 5,000 nonblank rows, 10 MiB total, and 20,000 characters per cell. A header must include a name column (`customer_name`, `company_name`, or `contact_person`) and a contact column (`phone`, `whatsapp_number`, `email`, or, for leads, `target_customer_id`). Unknown, blank, or duplicate-mapped headers are rejected. `current_stage`/`stage` is not importable.

Target CSV fields are the target-customer writable fields except `customer_list`; common aliases such as `name`, `company`, `contact`, `mobile`, `whatsapp`, `e_mail`, `assignee`, `product`, `service`, and `dnc` are normalized. Lead CSV fields are the writable lead contact/offering/scoring fields plus `target_customer_id`; common aliases include `type`, `target_id`, `requirement`, and `next_followup`.

The `201` result is:

```json
{
  "created_count": 12,
  "duplicate_count": 2,
  "error_count": 0,
  "created_ids": [101, 102],
  "duplicates": [{"row": 4, "reason": "existing", "matches": []}],
  "errors": [],
  "do_not_call_preserved": 1,
  "atomic": true
}
```

With atomic import, any row error produces zero creates. Existing and within-file duplicates are reported and skipped. Target imports may turn an existing duplicate's do-not-call flag on, but never clear it.

`GET /api/lead-export/?type=leads` (default) exports the caller's filtered lead scope. `type=targets` exports visible target customers. The response is UTF-8 CSV with `Content-Disposition`; spreadsheet formula prefixes are escaped.

## Dashboard and reports

`GET /api/lead-dashboard/` returns `cards` and `charts` plus the card keys at the top level for compatibility. Card keys cover total/new/converted/rejected leads, follow-ups and calls due, overdue follow-ups, today's meetings/demos/requirement meetings, proposal/quotation pending counts, pipeline value, and converted revenue. Chart keys are `leads_by_stage`, `leads_by_source`, `leads_by_type`, and `pipeline_value_by_stage`.

`GET /api/lead-reports/` returns `lead_source`, `campaign`, `employee`, `telecaller`, `product`, `service`, `meeting`, `conversion`, `monthly_conversion_trend`, `rejection`, `lead_ageing`, `pipeline`, and `expected_revenue`.

## Errors and status codes

| Status | Shape and meaning |
| --- | --- |
| `400` | DRF validation uses `{field:[messages]}`. Service validation uses `{"errors":{...}}` or `{"errors":[...]}`. Workflow/prerequisite failures use the service form. |
| `403` | Missing endpoint permission: `{"error":"Permission denied.","required_permission":"lead.x"}`. Service permission failures return `{"error":"Permission 'lead.x' is required."}`. |
| `404` | Missing resource or a resource outside visibility scope. |
| `409` | Converted-lead deletion, or conversion duplicate candidates. |
| `429` | DRF request throttle exceeded. |

Sensitive document storage paths are never serialized. Downloads include `X-Content-Type-Options: nosniff` and `Cache-Control: private, no-store`.
