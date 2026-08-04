# Luro AI

Luro AI is a full-stack, multi-tenant AI SaaS built with Next.js, React, TypeScript, MongoDB, and Mongoose. It combines secure first-party authentication, AI content tools, PDF retrieval, usage allowances, persisted history, media storage, and Stripe subscriptions in one application.

> **Credential safety:** Never commit `.env` files, provider keys, webhook secrets, SMTP passwords, private keys, database credentials, or copied production logs. Any credential disclosed in chat, an issue, source control, screenshots, or logs must be treated as compromised: revoke or rotate it at the provider, replace the deployed secret, and review provider audit and usage records. Do not reuse the old value.

## Platform features

- **Authentication and account security:** email/password signup and signin, Argon2id password hashes, email verification, password recovery, Google and Apple OAuth, provider linking, session management, password changes, and account deletion.
- **AI chat:** persisted conversations, message history, regeneration, token accounting, and per-user ownership.
- **Content generation:** social posts, generated email drafts, and translation with validated inputs and persisted history.
- **Image generation:** OpenAI-compatible image generation, regeneration, and durable Cloudinary storage.
- **PDF Q&A:** bounded PDF upload, text extraction, chunking, embeddings, similarity retrieval, citations, and persisted question history.
- **Plans and usage:** free/Pro monthly token, image, and PDF-page allowances with usage summaries and AI request rate limiting.
- **Billing:** Stripe Checkout, Billing Portal, subscription state synchronization, and signed webhooks.
- **Product UI:** marketing, pricing, authentication, dashboard, feature workspaces, billing, and account settings pages.

## Architecture

| Layer           | Implementation                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------- |
| Web application | Next.js App Router and React server/client components under `src/app`                                                |
| API             | Next.js route handlers under `src/app/api` with a consistent JSON response/error contract                            |
| Authentication  | First-party signed session cookie plus server-side hashed session, CSRF, OAuth challenge, and one-time token records |
| Persistence     | MongoDB through Mongoose models in `src/models`; every product resource carries a validated owner ID                 |
| AI              | OpenAI SDK against OpenAI or an OpenAI-compatible endpoint; configurable chat, image, and embedding models           |
| PDF retrieval   | Local PDF text extraction, bounded chunking, provider embeddings, and cosine ranking stored in MongoDB               |
| Media           | Cloudinary for generated-image persistence                                                                           |
| Billing         | Stripe Checkout, Portal, subscriptions, and webhook synchronization                                                  |
| Email           | SMTP (including Gmail App Passwords) or an HTTPS delivery webhook                                                    |
| State/UI data   | Redux Toolkit client integration with server API routes                                                              |

The application uses the Node.js runtime for provider, PDF, billing, and database work. MongoDB is the system of record for users, sessions, generated resources, usage, and subscriptions. Generated images are stored by Cloudinary; only their metadata and secure URLs are stored in MongoDB.

## Prerequisites

- Node.js 20 or newer (use the current Node.js LTS release in production)
- npm and the committed `package-lock.json`
- MongoDB 7+ or MongoDB Atlas; production should use a replica set or sharded cluster
- An OpenAI API key, or an OpenAI-compatible provider such as OpenRouter
- Cloudinary credentials for image generation persistence
- Stripe credentials and a recurring Price for Pro billing
- SMTP or an HTTPS email webhook when transactional email is enabled
- Optional Google and/or Apple OAuth application credentials

## Local setup

1. Install the locked dependencies:

   ```bash
   npm ci
   ```

2. Copy the credential-free template and edit only the local copy:

   ```bash
   cp .env.example .env.local
   ```

3. Start MongoDB or set `MONGODB_URI` to a development Atlas database.
4. Configure the providers needed for the features you will exercise. Provider groups must be complete; partial groups are rejected.
5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

Do not commit `.env.local`. The repository intentionally ignores `.env*` while retaining `.env.example`.

## Environment variables

Use `.env.example` as the canonical credential-free inventory. Numeric values are parsed and bounded, boolean values use `true` or `false`, provider credential groups are cross-validated, and production validation must not be bypassed.

### Runtime, application, and MongoDB

| Variable                              | Required       | Purpose                                                                                                  |
| ------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`                            | Set by runtime | `development`, `test`, or `production`                                                                   |
| `APP_URL`                             | Production     | Canonical origin. Production requires HTTPS; no trailing path. Used for redirects and provider metadata. |
| `MONGODB_URI`                         | Production     | MongoDB connection URI. Production must explicitly use a non-loopback deployment.                        |
| `MONGODB_DATABASE`                    | No             | Database name; defaults to `luro-ai`                                                                     |
| `MONGODB_MAX_POOL_SIZE`               | No             | Maximum connection pool size; defaults to 10                                                             |
| `MONGODB_MIN_POOL_SIZE`               | No             | Minimum connection pool size; defaults to 0                                                              |
| `MONGODB_SERVER_SELECTION_TIMEOUT_MS` | No             | Server-selection timeout; defaults to 10000 ms                                                           |

Use a dedicated least-privilege database user, TLS, network restrictions, encrypted backups, restore drills, and monitoring. Account deletion and OAuth account creation use transactions, so production requires a replica set or sharded cluster. Mongoose indexes are declared by the application; verify index creation and conflicts during staging rollout rather than relying on first production traffic.

### Authentication and OAuth

| Variable                      | Required   | Purpose                                                                                                |
| ----------------------------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| `AUTH_SECRET`                 | Production | Random secret of at least 32 characters used to sign sessions. Generate independently per environment. |
| `AUTH_EMAIL_PASSWORD_ENABLED` | No         | Enables email/password authentication; defaults to `true`                                              |
| `GOOGLE_CLIENT_ID`            | As a pair  | Google web OAuth client ID                                                                             |
| `GOOGLE_CLIENT_SECRET`        | As a pair  | Google web OAuth client secret                                                                         |
| `APPLE_CLIENT_ID`             | As a group | Apple Services ID                                                                                      |
| `APPLE_TEAM_ID`               | As a group | Apple developer Team ID                                                                                |
| `APPLE_KEY_ID`                | As a group | Sign in with Apple key ID                                                                              |
| `APPLE_PRIVATE_KEY`           | As a group | PEM private key; preserve line breaks or use escaped `\n` as supported by the host                     |

Google redirect URIs must exactly match:

- Local: `http://localhost:3000/api/auth/oauth/google/callback`
- Production: `https://YOUR_DOMAIN/api/auth/oauth/google/callback`

Enable `openid`, `email`, and `profile`. Do not use wildcard callbacks.

For Apple, enable Sign in with Apple, create a Services ID and key, verify the production domain, and register:

- Local, only where Apple permits it: `http://localhost:3000/api/auth/oauth/apple/callback`
- Production: `https://YOUR_DOMAIN/api/auth/oauth/apple/callback`

Rotate Apple keys before expiry and configure Apple private-email relay with an approved sender/domain. OAuth identities are not automatically merged by matching email; an authenticated user must link a provider from account settings.

### Transactional email

| Variable                           | Required     | Purpose                                                          |
| ---------------------------------- | ------------ | ---------------------------------------------------------------- |
| `AUTH_NOTIFICATION_EMAILS_ENABLED` | No           | Enables signup/login notification delivery; defaults to `false`  |
| `EMAIL_APP_NAME`                   | No           | Product name in messages                                         |
| `EMAIL_FROM`                       | For delivery | Valid sender address                                             |
| `SMTP_HOST`                        | As a group   | SMTP hostname                                                    |
| `SMTP_PORT`                        | As a group   | `465` for implicit TLS or `587` for STARTTLS                     |
| `SMTP_SECURE`                      | As a group   | Must be `true` for 465 and `false` for 587                       |
| `SMTP_USER`                        | As a group   | SMTP username/email                                              |
| `SMTP_PASS`                        | As a group   | SMTP credential or App Password, never a normal mailbox password |
| `EMAIL_WEBHOOK_URL`                | Optional     | HTTPS email delivery endpoint                                    |
| `EMAIL_WEBHOOK_SECRET`             | Optional     | Shared webhook authorization secret, minimum 16 characters       |
| `SOCIAL_X_URL`                     | Optional     | Official HTTPS profile included in email templates               |
| `SOCIAL_LINKEDIN_URL`              | Optional     | Official HTTPS profile included in email templates               |
| `SOCIAL_INSTAGRAM_URL`             | Optional     | Official HTTPS profile included in email templates               |

For Gmail, enable 2-Step Verification and use a Google App Password. Use port 465 with secure TLS or port 587 with STARTTLS. Keep certificate validation enabled. Production hosts may block outbound SMTP; in that case use an approved transactional provider or the HTTPS webhook integration. Authentication remains available if optional notification delivery fails, and secrets/tokens are not logged.

### AI provider and models

| Variable                 | Required        | Purpose                                                             |
| ------------------------ | --------------- | ------------------------------------------------------------------- |
| `OPENAI_API_KEY`         | For AI features | Server-side provider key                                            |
| `OPENAI_BASE_URL`        | No              | OpenAI-compatible API root; defaults to `https://api.openai.com/v1` |
| `OPENAI_CHAT_MODEL`      | No              | Chat/content model; defaults to `gpt-4o-mini`                       |
| `OPENAI_IMAGE_MODEL`     | No              | Image model; defaults to `gpt-image-1`                              |
| `OPENAI_EMBEDDING_MODEL` | No              | Embedding model; defaults to `text-embedding-3-small`               |

For OpenRouter, set `OPENAI_BASE_URL` to its documented OpenAI-compatible `/api/v1` endpoint and use model identifiers available to that account. Confirm that the selected provider supports every endpoint you enable: chat completions, image generation, and embeddings are separate capabilities. The server sends the canonical app URL and product title as provider headers. Keep keys server-side, apply provider spend limits, and monitor usage. Never expose the key through `NEXT_PUBLIC_*` variables.

### Cloudinary

| Variable                | Required   | Purpose    |
| ----------------------- | ---------- | ---------- |
| `CLOUDINARY_CLOUD_NAME` | As a group | Cloud name |
| `CLOUDINARY_API_KEY`    | As a group | API key    |
| `CLOUDINARY_API_SECRET` | As a group | API secret |

All three values are required together. Create a production-specific Cloudinary environment with restricted credentials, quotas, retention/lifecycle policy, and abuse monitoring. Generated images cannot be persisted when Cloudinary is absent, even if the image provider succeeds.

### Stripe

| Variable                | Required   | Purpose                                      |
| ----------------------- | ---------- | -------------------------------------------- |
| `STRIPE_SECRET_KEY`     | As a group | Server-side Stripe secret key                |
| `STRIPE_WEBHOOK_SECRET` | As a group | Signing secret for this endpoint/environment |
| `STRIPE_PRO_PRICE_ID`   | As a group | Recurring Price ID mapped to the Pro plan    |

Use matching test values locally and live values only in production. Never mix test/live keys, Prices, customers, or webhook secrets.

### Allowances and upload limits

| Variable                     |  Default | Purpose                                                   |
| ---------------------------- | -------: | --------------------------------------------------------- |
| `APP_FREE_MONTHLY_TOKENS`    |    50000 | Free monthly generated token allowance                    |
| `APP_FREE_MONTHLY_IMAGES`    |        5 | Free monthly image allowance                              |
| `APP_FREE_MONTHLY_PDF_PAGES` |       50 | Free monthly ingested PDF pages                           |
| `APP_PRO_MONTHLY_TOKENS`     |  1000000 | Pro monthly generated token allowance                     |
| `APP_PRO_MONTHLY_IMAGES`     |      100 | Pro monthly image allowance                               |
| `APP_PRO_MONTHLY_PDF_PAGES`  |     2000 | Pro monthly ingested PDF pages                            |
| `APP_MAX_PDF_BYTES`          | 10000000 | Maximum accepted PDF size, bounded to 50 MB by validation |

Allowances reset by UTC calendar month. Choose limits that account for model pricing and concurrency. Usage enforcement is application-level metering, not a replacement for provider hard spending caps.

## Provider setup

### MongoDB

1. Create separate development, staging, and production databases.
2. Create a least-privilege application user and restrict network access.
3. Require encrypted connections and configure backups, retention, restore tests, alerts, and capacity monitoring.
4. Test transactions and all declared indexes in staging.
5. Before deploying over legacy data, take an encrypted backup and use a source-specific one-time migration outside the application runtime. Verify counts and uniqueness constraints before switching traffic.

### Cloudinary

1. Create or select an isolated environment.
2. Copy the cloud name, API key, and API secret into the deployment secret store.
3. Configure quotas and lifecycle/retention appropriate for user-generated assets.
4. Verify image generation and regeneration in staging without exposing provider responses or secrets.

### Stripe and webhooks

1. Create a recurring Pro Product/Price and set `STRIPE_PRO_PRICE_ID`.
2. Register `https://YOUR_DOMAIN/api/stripe/webhook` as a webhook endpoint.
3. Subscribe to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Set the endpoint-specific signing secret as `STRIPE_WEBHOOK_SECRET`.
5. Test Checkout, cancellation, renewal, failed payment, Portal access, delayed/retried events, and test-to-live configuration separation.

For local webhook testing, use the Stripe CLI without writing secrets into files or shell history where avoidable:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Webhook requests are verified against the raw request body and `stripe-signature`. Return errors are intentionally generic. Monitor repeated failures and Stripe’s retry queue. Subscription updates are designed to be state synchronization, but operators should still reconcile Stripe and MongoDB periodically.

## Commands

| Command             | Purpose                                                                     |
| ------------------- | --------------------------------------------------------------------------- |
| `npm ci`            | Reproducible install from the lockfile                                      |
| `npm run dev`       | Development server                                                          |
| `npm run typecheck` | TypeScript validation without output                                        |
| `npm test`          | Run Vitest tests once                                                       |
| `npm run lint`      | Run ESLint across the repository                                            |
| `npm run build`     | Create an optimized production build and exercise production env validation |
| `npm start`         | Serve the production build                                                  |

Run typecheck, tests, lint, and build in CI for every release. Inject safe CI-only values through the command environment or secret manager; do not generate or commit an `.env` file merely to build.

## API overview

All product endpoints are same-origin server APIs intended for the Luro web client. Protected state-changing endpoints require the authenticated session and CSRF header. Do not expose these routes as a public third-party API without a separate authorization and versioning design.

| Area              | Methods and routes                                                                                                            | Purpose                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Auth              | `POST /api/auth/signup`, `/signin`, `/logout`, `/forgot-password`, `/reset-password`, `/verify-email`, `/resend-verification` | Authentication lifecycle                      |
| OAuth             | `GET/POST /api/auth/oauth/:provider`, `GET /api/auth/oauth/:provider/callback`                                                | Google/Apple signin and linking flows         |
| Account           | `GET/PATCH /api/account`, `POST /api/account/password`, `POST/DELETE /api/account/security`                                   | Profile, password, session security, deletion |
| Account resources | `DELETE /api/account/providers/:id`, `DELETE /api/account/sessions/:id`                                                       | Revoke linked providers or sessions           |
| Chat              | `GET/POST /api/ai/chat`, `POST /api/ai/chat/regenerate`                                                                       | Chat history, generation, regeneration        |
| Social            | `GET/POST /api/ai/social`                                                                                                     | Social content history and generation         |
| Email             | `GET/POST /api/ai/email`                                                                                                      | Draft history and generation                  |
| Translation       | `GET/POST /api/ai/translation`                                                                                                | Translation history and generation            |
| Images            | `GET/POST /api/ai/image`, `POST /api/ai/image/regenerate`                                                                     | Image history and generation                  |
| Documents         | `GET/POST /api/ai/documents`, `GET/POST /api/ai/documents/:id/chat`                                                           | PDF ingestion, history, and cited Q&A         |
| Usage             | `GET /api/usage`                                                                                                              | Current UTC month allowance and usage         |
| Billing           | `POST /api/stripe/checkout`, `POST /api/stripe/portal`, `GET /api/stripe/subscription`                                        | Checkout, Portal, subscription status         |
| Stripe webhook    | `POST /api/stripe/webhook`                                                                                                    | Signed subscription synchronization           |

History list endpoints accept bounded `limit` and ISO `before` cursor values where applicable. JSON request bodies reject unknown properties. PDF upload uses multipart form data with a `file` field.

## Security model

- Passwords use Argon2id. Session, CSRF, OAuth state/nonce, and one-time bearer token values are persisted only as hashes.
- Signed sessions use a production-only secret, fixed issuer/audience and algorithm, database revocation, idle/absolute expiry, and rotation after sensitive authentication events.
- Cookies are HttpOnly where appropriate, SameSite Lax, and Secure in production. State-changing routes require the CSRF token from the non-HttpOnly CSRF cookie in `x-csrf-token`.
- OAuth uses server-side Authorization Code exchange, state, nonce, PKCE for Google, exact callbacks, provider JWKS verification, and verified-email checks.
- Recovery responses are generic; one-time tokens expire, are single use, and are not logged. Password changes revoke other sessions.
- Authentication and AI operations use MongoDB-backed rate limiting. Security-sensitive actions create audit events.
- Joi validates environment values, JSON bodies, query values, route identifiers, and provider groups. Unknown body fields are rejected.
- Mongoose strict query handling and filter sanitization are enabled; ownership filters use validated scalar user/resource IDs.
- Sensitive model fields are excluded from normal selection and JSON transforms. Product records are owner-scoped and indexed for expected access patterns.
- PDF size/type and chunk counts are bounded. Extracted text and generated content remain untrusted data; do not render model output as unsanitized HTML.
- Stripe webhook signatures are verified before processing. Provider errors are normalized rather than returning credentials or raw internal failures.
- Secrets belong in the deployment platform’s encrypted secret store. Use independent values per environment, least privilege, rotation, audit logging, and provider-side spend/usage alerts.

Before launch, exercise successful and failed login, duplicate/concurrent registration, verification and recovery expiry, OAuth cancellation/state/nonce/JWKS/collision handling, provider linking/unlinking, CSRF, session rotation/revocation, rate limits, ownership isolation, quota exhaustion, malformed PDFs, provider outages, webhook retries, cancellation, and account deletion.

## Production deployment checklist

### Before deployment

- [ ] Use an actively supported Node.js LTS release and `npm ci` from the committed lockfile.
- [ ] Run `npm run typecheck`, `npm test`, `npm run lint`, and `npm run build` in CI.
- [ ] Set `NODE_ENV=production`, an HTTPS `APP_URL`, a unique random `AUTH_SECRET`, and an explicit non-loopback `MONGODB_URI`.
- [ ] Store all credentials in encrypted deployment secrets; verify no `.env`, logs, dumps, or credentials are present in the commit/diff or build artifacts.
- [ ] Revoke/rotate any credential ever disclosed outside the approved secret store and inspect provider usage/audit history.
- [ ] Configure MongoDB TLS, transactions, indexes, least privilege, backups, restore testing, alerts, and capacity limits.
- [ ] Register exact production Google/Apple callback URLs and remove obsolete callbacks and keys.
- [ ] Verify email sender authentication/reputation, SMTP/webhook connectivity, bounce handling, quotas, and notification policy.
- [ ] Confirm model availability and compatibility for chat, image, and embeddings; configure provider spend caps and alerts.
- [ ] Configure Cloudinary isolation, quotas, retention, and restricted credentials.
- [ ] Configure the correct Stripe mode, recurring Price, signed webhook endpoint/events, customer Portal, tax/business policy, and retry monitoring.
- [ ] Review free/Pro allowances, PDF upload size, abuse controls, legal terms, privacy policy, retention/deletion policy, and user support process.
- [ ] Test with a staging database and provider test accounts; do not run production build verification against live provider or customer data.

### Platform/runtime configuration

- [ ] Deploy as a Node.js-compatible Next.js runtime; do not force provider/PDF/Mongoose routes to an Edge runtime.
- [ ] Ensure the platform accepts request bodies larger than `APP_MAX_PDF_BYTES` plus multipart overhead, while retaining an upstream hard limit.
- [ ] Keep one canonical HTTPS origin and redirect HTTP to HTTPS. Add HSTS and appropriate security headers at the trusted proxy/platform.
- [ ] Ensure outbound HTTPS access to MongoDB, AI, Cloudinary, Stripe, OAuth JWKS/token endpoints, and the email webhook; permit SMTP only if used.
- [ ] Forward the original host/protocol securely and restrict which proxies can supply client IP headers.
- [ ] Avoid logging cookies, authorization values, request bodies, PDFs, model prompts/output, email addresses, provider payloads, or secrets.

### Release and post-deployment

- [ ] Deploy, verify schema indexes, then perform smoke tests for auth, each enabled AI feature, usage, Checkout/Portal, and signed webhooks.
- [ ] Confirm health through application, database, provider, email, and webhook telemetry without exposing sensitive details in a public health endpoint.
- [ ] Configure alerts for error rate, latency, MongoDB saturation, AI/Cloudinary/Stripe failures, webhook retries, email failures, quota/spend spikes, and suspicious auth activity.
- [ ] Reconcile Stripe subscription state and usage records on an operational schedule.
- [ ] Maintain backup/restore, credential rotation, incident response, rollback, dependency patching, data export/deletion, and disaster recovery runbooks.

## Limitations and operational concerns

- **No background queue:** PDF extraction/embedding and AI provider work occur in request lifecycles. Large PDFs can exceed serverless duration/memory limits. Production scale should move ingestion and long generations to idempotent background jobs with progress and retry state.
- **Local vector search:** document retrieval loads a document’s stored embeddings and ranks them in application memory. This is bounded by chunk limits but is not suitable for very large corpora; use a managed vector index for larger workloads.
- **Calendar-month quotas:** usage periods use UTC `YYYY-MM`. Meter writes and allowance checks are separate operations, so extreme concurrency can overshoot a quota. High-value deployments should add atomic reservations/idempotency and reconciliation.
- **Rate limits:** MongoDB-backed per-minute AI limits are application controls, not a WAF or DDoS service. Add edge/platform rate limiting and abuse detection.
- **Provider variability:** OpenAI-compatible providers differ in supported models, parameters, token accounting, image behavior, limits, and error formats. Validate every configured model in staging.
- **Generated content risk:** model output can be inaccurate, unsafe, biased, or infringing. Add moderation, user reporting, policy controls, and human review appropriate to the product and jurisdiction.
- **PDF risk:** PDFs can contain sensitive or hostile content. Current controls bound type and size but do not provide malware scanning, OCR, encrypted-PDF handling, or durable source-file retention. Add scanning and data-classification controls when required.
- **Media lifecycle:** deleting MongoDB metadata does not by itself prove that every external Cloudinary asset or provider-side artifact has been deleted. Implement and audit lifecycle cleanup according to the retention policy.
- **Webhook/reconciliation:** signed Stripe webhooks can be delayed or retried. Monitor delivery and periodically reconcile subscription state; do not grant entitlements solely from a browser redirect.
- **Email deliverability:** Gmail is useful for development or low volume but has quotas and operational constraints. Production usually needs a transactional provider, domain authentication, bounce/complaint processing, and suppression management.
- **Observability:** avoid sensitive telemetry. Use structured, redacted events with correlation IDs and separate security audit retention.
- **Data residency and privacy:** prompts, documents, embeddings, generated content, and account data can cross provider boundaries. Document subprocessors, retention, consent, residency, export, and deletion behavior before launch.

## Verification and data migration

The repository includes focused Vitest coverage for validation, authentication notification behavior, AI contracts and vector math, sensitive JSON transforms, ownership requirements, and critical integrity/TTL indexes. These tests do not replace integration tests against disposable MongoDB and provider test environments.

No legacy source schema or migration dataset is included. For existing deployments, build a source-specific one-time migration outside the application runtime, retain an encrypted backup, rehearse in staging, verify counts/ownership/uniqueness/indexes, and maintain a tested rollback window before deleting the source backup.
