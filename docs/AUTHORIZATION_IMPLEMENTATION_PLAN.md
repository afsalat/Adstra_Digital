# Authorization Implementation Plan

## Goal
Make authorization consistent across backend APIs, dashboard navigation, direct frontend routes, and per-action UI controls.

## Permission Model
- Keep `backend/utils/permissions.py` as the single backend catalog for permission codes, labels, and role defaults.
- Use role permissions as baseline access.
- Use `custom_permissions` only for explicit user-level additions.
- Treat `admin`, `super_admin`, and Django superusers as full-access users through `effective_permissions`.

## Implemented Scope
- Split finance permissions into separate modules:
  - `invoices.*` for tax invoices.
  - `proforma_invoices.*` for proforma invoices.
  - `receipts.*` for receipts.
  - `transactions.*` for non-receipt ledger transactions if a transaction type field is added later.
- Enforce split invoice/proforma permissions in `backend/apis/invoice/views.py`.
- Enforce receipt permissions in `backend/apis/transactions/views.py`.
- Show Proforma Invoices and Receipts as separate permission sections in user management.
- Gate dashboard Finance cards with the matching view permissions.
- Gate direct invoice, proforma, receipt list/create/edit pages and their create/update/delete/restore controls.

## Verification
- Backend syntax:
  `venv\Scripts\python.exe -m py_compile backend\utils\permissions.py backend\apis\invoice\views.py backend\apis\transactions\views.py`
- Frontend compile:
  `npm.cmd run build` from `adstra-next`.
- Manual checks:
  - User with only `proforma_invoices.view` can open Proforma Invoices but not Tax Invoices.
  - User with only `receipts.view` can open Receipts but cannot create/delete/restore.
  - User with `receipts.create` can open `/receipts/create/`.
  - User with no finance permissions does not see Finance cards.
