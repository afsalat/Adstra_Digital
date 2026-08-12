# Full-Project Cybersecurity Audit Report

**Audit date:** 2026-08-08  
**Repository:** `Adstra_Digital` (`main`)  
**Live target checked:** `https://adstradigital.com`  
**Verdict:** REQUEST CHANGES — PRODUCTION RELEASE BLOCKED  
**Confidence:** HIGH

## Executive summary

The project is not currently safe for continued production operation without immediate containment. The audit found four critical risk groups:

1. The live API behaves as if Django debug mode is enabled and reflects arbitrary CORS origins while allowing credentials.
2. Any authenticated account can reach blog mutation/upload paths that can produce same-origin stored content; public blog rendering includes unsafe HTML and JSON-LD sinks, while privileged JWTs are stored in `localStorage`.
3. A 1.8 MB operational SQLite database is tracked in Git with 32 historical blobs. The current database contains users, password hashes, employee attendance/location records, client contacts, financial records, leads, and audit IP data.
4. Both runtime dependency sets are substantially behind current security patches. The production npm tree reports 21 advisories (6 critical), while the Python requirements report 75 advisory records across six packages.

The live site does have HTTPS, HSTS, `nosniff`, and a referrer policy. Backend authorization is also much stronger in the remediated lead module than elsewhere. Those controls do not offset the critical findings above.

## Scope and methodology

Reviewed:

- Django settings, URL routing, authentication, permissions, users, attendance, clients, proposals, invoices, transactions, backups, blogs, leads, uploads, logging, migrations, and utility scripts.
- Next.js layouts, internal workspaces, authentication context, blog rendering, rich-text handling, payments, exports, external scripts, and API integration.
- Current Git index and history for sensitive artifacts.
- Production dependency trees and current npm/Python advisory databases.
- Live HTTPS headers, CORS preflight behavior, and non-destructive error-page behavior.

Not performed:

- No credentialed exploitation, destructive penetration testing, malicious upload, payment attempt, password guessing, or data extraction.
- No review of hosting control-panel security, server filesystem ACLs, database backups outside the repository, email/Firebase/Razorpay dashboards, DNS registrar, or employee endpoints.

## Findings

| ID | Priority | Finding | Primary evidence |
|---|---|---|---|
| SEC-01 | P0 | Live API exposes debug diagnostics and accepts arbitrary credentialed CORS origins | `backend/backend/settings.py:7-24,143-147`; live API verification |
| SEC-02 | P0 | Stored-XSS and same-origin upload chain can expose privileged browser JWTs | `backend/apis/blogs/views.py:17-41`; `adstra-next/src/app/blogs/[label]/page.js:258`; `BlogDetails.js:24-96`; `AuthContext.js:26-93` |
| SEC-03 | P0 | Operational database and PII are committed across Git history | `backend/db.sqlite3`; 32 historical database blobs |
| SEC-04 | P0 | Known-vulnerable production runtimes and libraries | `adstra-next/package-lock.json`; `backend/requirements.txt` |
| SEC-05 | P1 | Long-lived JWTs have a weak signing secret and no revocation/logout mechanism | `backend/utils/jwt_helper.py:6-24`; `AuthContext.js:26-100` |
| SEC-06 | P1 | Employees can mass-assign protected attendance/payroll fields on their own records | `attendance/serializers.py:5-11`; `attendance/views.py:76-132` |
| SEC-07 | P1 | Invoice update permission can forge payment state and Razorpay evidence | `invoice/serializers.py:25-36`; `invoice/views.py:53-91`; `utils/permissions.py:83-153` |
| SEC-08 | P1 | Backup import/export exposes sensitive records and enables destructive, unbounded restoration | `settings/views.py:54-199` |
| SEC-09 | P1 | Initial/reset passwords are emailed and deliberately returned as plaintext | `user/views.py:48-87,357-399`; user-management UI callers |
| SEC-10 | P1 | Root “test” scripts mint superuser JWTs and mutate live data when imported | `backend/test_req.py:6-22`; `backend/test_update_blog.py:5-33` |
| SEC-11 | P1 | Uploads, backup input, and several list endpoints lack safe resource limits | blog/backup views; proposal/invoice/transaction list views |
| SEC-12 | P1 | CSP does not restrict script execution despite high-impact third-party and dynamic content | deployed response headers; `adstra-next/src/app/layout.js:97-150` |
| SEC-13 | P2 | Audit IPs trust spoofable forwarding headers | `backend/utils/logging_helper.py:5-10` |
| SEC-14 | P2 | API/server version information is exposed | live `Server` and `X-Powered-By` response headers |
| SEC-15 | P1 | Security regression coverage is absent outside the lead module | empty `tests.py` files in users, invoices, proposals, and transactions |
| SEC-16 | P2 | Public blog APIs return full, unpaginated content collections | `blogs/views.py:12-13`; `blogs/serializers.py:4-7` |

## Detailed findings

### SEC-01 — Live debug exposure and arbitrary credentialed CORS

**Priority:** P0  
**Impact:** Internal route disclosure, possible exception/local-variable exposure, cross-origin access policy failure, and weakened production transport/cookie behavior.

The settings loader calls `load_dotenv(override=True)`, so a deployed `.env` file overrides safer process-level configuration. The local deployment configuration currently enables debug behavior. When debug is enabled, `CORS_ALLOW_ALL_ORIGINS` defaults to true and SSL/cookie protections are disabled.

Live checks on 2026-08-08 confirmed:

- A preflight from `Origin: https://evil.example` received `Access-Control-Allow-Origin: https://evil.example` and `Access-Control-Allow-Credentials: true`.
- A guaranteed nonexistent `/api/` path returned a 4,945-byte Django diagnostic 404 containing debug signatures and URL-pattern information.
- `manage.py check --deploy` reported `DEBUG`, HTTPS redirect, HSTS, secure cookie, CSRF cookie, and secret-key warnings for the active configuration.

The live frontend/API does set HSTS, but application debug/CORS behavior remains unsafe.

**Required remediation:**

1. Remove the production `.env` from the deployed application directory and set `load_dotenv(override=False)` or load dotenv only in explicit development mode.
2. Force `DEBUG=False`, `CORS_ALLOW_ALL_ORIGINS=False`, and an exact production origin allowlist.
3. Keep credentialed CORS disabled unless cookie-based cross-origin access is explicitly required.
4. Rotate Django, JWT, SMTP, payment, and other server secrets after containment; invalidate existing tokens.
5. Add a deployment check that fails startup/build when debug or wildcard CORS is enabled outside development.

### SEC-02 — Stored content can become same-origin script execution

**Priority:** P0  
**Impact:** Administrator token theft, authenticated API actions, public visitor compromise, malicious redirects, and content takeover.

Blog and keyword mutations require only authentication even though dedicated `blogs.*` permissions exist. The upload action also accepts any authenticated user, reads the entire file, preserves an attacker-selected extension, performs no MIME/signature validation, and stores the result under same-origin media.

Two unsafe rendering paths compound this:

- Public blog content is passed through `html-react-parser` without an allowlist sanitizer. Markdown URLs and stored keyword links are inserted into HTML attributes without scheme validation.
- User-controlled blog properties are embedded into a JSON-LD `<script>` through `dangerouslySetInnerHTML` and `JSON.stringify`. JSON encoding alone does not neutralize a `</script>` sequence.

Privileged bearer tokens are persisted in browser `localStorage`, so any same-origin script execution can directly read and exfiltrate them. Running with `DEBUG=True` also mounts Django media URLs directly, bypassing the protected download model used by lead documents.

**Required remediation:**

1. Immediately disable blog mutations/uploads or enforce `blogs.create`, `blogs.update`, `blogs.delete`, and `blogs.keywords` on every action.
2. Accept only explicitly approved raster formats; validate extension, MIME, file signature, dimensions, and size; generate server-side filenames; reject SVG/HTML/XML.
3. Host untrusted media on a cookieless, separate origin with attachment headers where possible.
4. Sanitize stored rich text using a strict server-side allowlist and sanitize again at rendering boundaries.
5. Escape `<` as `\u003c` in JSON-LD serialization or use a safe structured-data component.
6. Restrict links to `https:`, approved relative paths, `mailto:`, and other explicitly supported schemes.
7. Move authentication out of `localStorage` as described in SEC-05.

### SEC-03 — Operational SQLite database committed to Git

**Priority:** P0  
**Impact:** PII disclosure, offline password cracking, financial/privacy exposure, breach-notification obligations, and persistent exposure through cloned history.

`backend/db.sqlite3` is tracked in the index at approximately 1.8 MB. Git history contains 32 distinct blobs for this path. The working database contains operational-scale data, including 19 users, 17 clients, 2,255 attendance rows, 546 audit rows, invoices, transactions, proposals, and leads. User rows include password hashes; related tables contain personal contacts, locations/work reports, financial identifiers, and IP addresses.

An unauthenticated check of the configured GitHub repository returned 404, consistent with a private or unavailable repository. Private visibility reduces public exposure but does not make an operational database appropriate for source control; every historical collaborator, fork, cache, backup, and CI artifact may retain it.

Five historical root `.env` blobs were also found. They contained frontend Firebase/EmailJS identifiers rather than the backend secret names searched, but history should still be reviewed during cleanup.

**Required remediation:**

1. Stop tracking the database and replace it with schema migrations plus synthetic seed fixtures.
2. Rewrite all branches/tags with `git filter-repo`, coordinate a force-push, and require all clones/forks to be replaced.
3. Treat password hashes and operational records as exposed to repository collaborators; force password resets and assess notification obligations.
4. Rotate any credential that was stored in database-backed configuration or may have appeared in historical data.
5. Add secret/PII scanning and a pre-commit rule blocking databases, archives, environment files, and key material.

### SEC-04 — Known-vulnerable dependency baseline

**Priority:** P0  
**Impact:** Exposure to known code execution, prototype pollution, request/response manipulation, denial-of-service, path traversal, and framework security defects.

Current production audit results:

#### Frontend

`npm audit --omit=dev` reported **21 vulnerable packages: 6 critical, 10 high, and 5 moderate**. Critical findings include active/direct dependencies `next`, `html2pdf.js`, `jspdf`, and `jspdf-autotable`, plus transitive `protobufjs` and `websocket-driver`. Direct `axios` is high severity. These libraries are used in authentication/API requests, public rendering, Firebase-backed sections, and invoice/receipt PDF flows.

The audit offered compatible security movement including Next.js `15.5.23`, html2pdf.js `0.14.0`, and jsPDF `4.2.1`; every upgrade still requires compatibility and regression testing.

#### Backend

`pip-audit -r requirements.txt` reported **75 advisory records across six packages**:

| Package | Installed | Advisory records | Highest listed remediation seen |
|---|---:|---:|---:|
| Django | 5.2.2 | 51 | 5.2.16 within the current minor line |
| PyJWT | 2.9.0 | 12 | 2.13.0 |
| cryptography | 45.0.4 | 9 | 50.0.0 |
| djangorestframework-simplejwt | 5.5.0 | 1 | 5.5.1 |
| python-dotenv | 1.1.0 | 1 | 1.2.2 |
| sqlparse | 0.5.3 | 1 | 0.5.4 |

Some advisories are conditional or duplicated across databases, and static-export deployment reduces reachability for some Next.js server findings. The volume and age still make this a release blocker.

**Required remediation:** create isolated upgrade branches, update direct dependencies first, regenerate lockfiles, rerun audits/tests/builds, and verify PDF, Firebase, authentication, payment, import/export, and static-export flows. Add automated dependency scanning to CI and a defined patch SLA.

### SEC-05 — JWT session security and revocation

**Priority:** P1  
**Impact:** Stolen tokens remain usable for up to 24 hours, password reset/logout does not end sessions, and weak-key brute force is more feasible.

JWTs contain only `user_id`, `iat`, and a 24-hour expiry. They have no `jti`, issuer, audience, token type, session version, refresh rotation, or server-side revocation. Logout records attendance checkout but does not revoke the bearer token. Password reset also leaves previously issued tokens valid. The active `JWT_SECRET` is only 13 characters long.

The frontend stores the bearer token in `localStorage` and attaches it globally through Axios. This gives every same-origin script complete access to the session.

**Required remediation:**

- Prefer short-lived access tokens held in memory plus rotating refresh tokens in `HttpOnly`, `Secure`, `SameSite` cookies, or use secure server sessions.
- Add `jti`/session records or a `token_version` checked on every request; increment it on logout, reset, deactivation, role change, and suspected compromise.
- Use a cryptographically random signing key of at least 256 bits, support key rotation, and validate `iss`, `aud`, token type, and allowed algorithm.
- Reduce access-token lifetime to approximately 5–15 minutes.

### SEC-06 — Attendance mass assignment crosses payroll boundaries

**Priority:** P1  
**Impact:** Employees can alter validated attendance, salary deductions, status, timestamps, date, and potentially record ownership.

`AttendanceSerializer` exposes `user`, `date`, `checkin`, `checkout`, `status`, `work_report`, `salary_cut`, and `validation` as writable. The self-update endpoint authorizes based on the record’s current owner and then passes the entire request into that serializer. A normal employee can therefore change fields reserved for validation/payroll, including changing `user` after the authorization check.

**Required remediation:** create separate serializers for self work-report/check-in actions and manager validation/payroll actions. Make ownership, dates, calculated timestamps, salary deduction, validation, and status read-only to self-service users. Add object-level authorization and regression tests for every protected field.

### SEC-07 — Financial and payment state can be forged

**Priority:** P1  
**Impact:** Invoices can be marked paid without payment authority, payment evidence can be overwritten, and accounting attribution can be forged.

The generic invoice serializer accepts `status`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `paid_at`, `is_deleted`, and `created_by`. Both full invoice update and the status endpoint require only `invoices.update`. Managers have that permission but do not have `invoices.payments`, so they can still mark an invoice paid and supply payment-looking fields.

Transaction creation also accepts an arbitrary invoice/client pairing and lacks positive-amount, balance, and ownership consistency validation. Payment verification compares signatures with `!=` rather than `hmac.compare_digest` and does not retrieve/verify order amount/currency/payment state from Razorpay.

**Required remediation:** make gateway fields, paid state, deletion state, computed totals, and actor fields read-only. Route all state changes through transactional payment/accounting services with dedicated permissions and immutable audit events. Validate transaction positivity and invoice/client consistency. Use the vendor verification utility or constant-time comparison, then verify amount, currency, order ownership, captured state, and replay/idempotency.

### SEC-08 — Backup import/export is a high-impact data operation

**Priority:** P1  
**Impact:** Complete sensitive-data export, memory/disk exhaustion, arbitrary installed-model restoration, administrator lockout, and full-database destruction.

Full backup exports serialize `CustomUser` records, including password hashes, with operational and personal data into an unencrypted download. The response is not explicitly `no-store` and has no encryption/signature.

Import performs unbounded `json.load`, clears core tables (including users) before restoration, accepts Django serializer objects without a strict per-object model/schema allowlist, and returns raw exception text. Although permission is restricted to privileged roles, compromise or operator error has catastrophic impact.

**Required remediation:** move backups to an offline, encrypted, authenticated job; require step-up authentication and dual confirmation; cap size/depth/object counts; validate a versioned schema and exact model allowlist; verify signatures; preserve at least one recovery administrator; test restoration in isolation; never return internal exceptions; and log start/result without sensitive payloads.

### SEC-09 — Plaintext password distribution

**Priority:** P1  
**Impact:** Password exposure through email, browser screens, response capture, support recordings, proxies, and logs; no assurance of first-login replacement.

User creation and reset generate a password, email it in plaintext, and optionally return it in JSON. The production UI explicitly requests `?show_password=1` and displays the value. There is no enforced must-change flag or one-time lifecycle.

**Required remediation:** never generate or return a reusable password. Send a short-lived, single-use account-activation/reset link, store only a hash of the reset token, require password selection over HTTPS, expire all sessions, rate-limit attempts, and notify the user of the change.

### SEC-10 — “Tests” execute destructive live operations during import

**Priority:** P1  
**Impact:** Password resets, account deletion, content mutation, unexpected network calls, and use of production-like superuser authority during test discovery.

Root scripts named `test_req.py` and `test_update_blog.py` run at module import. They select a live superuser, mint a valid JWT, and issue HTTP mutations to localhost. Running normal Django test discovery imported one script and changed a live blog title. The exact mutation caused during this audit was immediately and successfully restored.

**Required remediation:** delete or quarantine these scripts outside test discovery; never mint production-database tokens in tests; use `TestCase`/`APIClient`, test databases, mocks, explicit fixtures, and `if __name__ == "__main__"` for one-off tools. CI should deny outbound network during unit tests.

### SEC-11 — Resource exhaustion controls are incomplete

**Priority:** P1

The blog upload calls `file.read()` with no application maximum. Backup import loads the entire JSON document. Public blog list returns every complete blog body, while clients, proposals, invoices, transactions, and trash endpoints serialize complete tables without pagination. This permits memory, disk, database, and response-amplification pressure.

**Required remediation:** configure proxy and Django request limits, stream approved uploads, enforce per-feature limits, paginate every collection, cap search/export windows, queue large exports, and use shared rate limiting/caching suitable for multi-worker production.

### SEC-12 — CSP and browser supply-chain protection are insufficient

**Priority:** P1

The deployed CSP is only `upgrade-insecure-requests`; it does not restrict scripts, frames, connections, objects, or base URLs. The root layout loads Google Analytics, Razorpay, Google Fonts, jsDelivr Bootstrap, and Bootstrap Icons. Bootstrap assets are pinned and main Bootstrap assets use SRI, but analytics/payment scripts cannot be protected by SRI in the same way and the icons stylesheet lacks SRI.

**Required remediation:** deploy a nonce/hash-based CSP with explicit `script-src`, `style-src`, `connect-src`, `img-src`, `font-src`, `frame-src`, `object-src 'none'`, and `base-uri 'self'`; remove inline script dependencies where possible; self-host stable assets; add SRI where supported; and test in report-only mode before enforcement.

### SEC-15 — Security tests do not cover most of the application

**Priority:** P1

All 45 meaningful backend tests belong to the lead module. User, attendance, proposal, invoice, and transaction test files contain no tests. The highest-impact issues in this report—attendance field escalation, payment-state forging, password lifecycle, blog authorization/XSS, backup destruction, and token revocation—therefore have no automated regression protection.

**Required remediation:** add authorization matrices and negative tests for every endpoint, serializer-field mutation tests, upload corpus tests, XSS payload tests, backup failure/rollback tests, payment replay tests, and token invalidation tests. Require these in CI before deployment.

## P2 hardening items

- `log_action` trusts the first `X-Forwarded-For` value without verifying a trusted proxy chain, so audit IPs can be spoofed.
- Live responses disclose Apache and Phusion Passenger versions and override Django’s `X-Frame-Options: DENY` with `SAMEORIGIN`.
- Public blog list responses are unpaginated and include full content rather than summaries.
- The login throttle uses Django’s default local-memory cache unless deployment overrides it; multi-process enforcement is therefore inconsistent. Django admin authentication has no equivalent application lockout/MFA control.
- Internal frontend routes are mostly protected after render/API failure rather than through a centralized route guard. Server authorization prevents direct data access, but this increases accidental exposure and UI inconsistency.
- Company/bank defaults and operational helper scripts are mixed into source; separate environment-specific operational data from application defaults.

## Positive controls observed

- Live HTTPS uses HSTS with subdomains/preload, `X-Content-Type-Options: nosniff`, and a strict-origin referrer policy.
- Django password hashing and standard password validators are enabled.
- The default REST permission requires authentication; sensitive endpoints commonly add named permissions.
- SQL observed in client deletion is static and parameterized; no user-controlled shell execution, unsafe pickle, or raw SQL interpolation was found.
- Lead document upload/download, lead visibility, workflow, email, import, and assignment controls are substantially hardened and covered by 45 passing tests.
- Backend secret environment files are ignored in the current tree; targeted Git-history searches found no committed `SECRET_KEY`, `JWT_SECRET`, SMTP password, Razorpay secret, or OpenAI secret assignment.
- Bandit scanned approximately 9,163 backend lines and reported no medium/high syntactic findings; manual review found the business-logic vulnerabilities above.

## Verification record

| Check | Result |
|---|---|
| Repository inventory | 648 non-dependency files considered |
| `manage.py check --deploy` | 6 production security warnings |
| Backend regression tests | 45 passed; non-lead security coverage absent |
| Bandit | 0 high, 0 medium, 4 low-confidence/low-severity pattern findings |
| npm production audit | 21 vulnerable packages: 6 critical, 10 high, 5 moderate |
| pip-audit | 75 advisory records across 6 packages |
| Live arbitrary-origin CORS | Confirmed, including credentials |
| Live Django debug 404 signature | Confirmed under `/api/` |
| Live HTTPS/HSTS | Present |
| Tracked database | 1,798,144-byte index blob; 32 blobs in history |
| Public GitHub visibility check | Configured repository returned unauthenticated 404 |

## Remediation roadmap

### Emergency containment — 0 to 24 hours

1. Disable debug and wildcard CORS in production; redeploy and verify from an untrusted origin.
2. Rotate JWT/Django/SMTP/payment secrets and expire every existing session.
3. Disable blog writes/uploads until authorization, validation, sanitization, and safe media hosting are deployed.
4. Remove the operational database from the current index, restrict repository access, begin history rewrite, and force password resets.
5. Upgrade or temporarily remove critical vulnerable dependencies; prioritize Django, Next.js, Axios, PyJWT, cryptography, and PDF libraries.
6. Remove/quarantine import-time destructive test scripts.

### High-priority correction — 2 to 7 days

1. Deploy revocable short-lived authentication and one-time password setup/reset.
2. Split attendance and invoice serializers by operation/role; make protected fields server-controlled.
3. Harden payment verification and transaction invariants.
4. Replace in-request backup restore with a signed, bounded, encrypted operational workflow.
5. Add global request limits, feature-specific upload limits, pagination, and shared throttling.
6. Add security regression tests for every P0/P1 path.

### Defense in depth — 2 to 4 weeks

1. Enforce a tested CSP and isolate untrusted media.
2. Add MFA/step-up authentication for administration, backups, permissions, password resets, and payments.
3. Add CI secret scanning, dependency scanning, SAST, lockfile verification, and blocked-network unit tests.
4. Centralize audit events, trusted-proxy IP handling, security alerting, retention, and tamper resistance.
5. Conduct a credentialed external penetration test after remediation, including upload, stored-XSS, authorization, payment replay, backup recovery, and session invalidation scenarios.

## Release recommendation

Do not treat the current deployment as production-safe. Complete all emergency containment items before normal operation continues. A release can move to staging only after the live debug/CORS checks fail closed, browser stored-content paths are sanitized, operational data is removed from Git, critical dependencies are patched, and session invalidation works. Production approval should then require a clean dependency audit or documented reachability exceptions, passing security regression tests, and a focused external retest.
