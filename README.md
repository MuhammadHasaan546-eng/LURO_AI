# Luro AI Authentication

Luro owns authentication and persists only hashed bearer/session and one-time token values. Passwords use Argon2id. OAuth uses server-side Authorization Code exchange, PKCE for Google, state and nonce challenge records, provider JWKS verification, exact callback URLs, and verified provider email checks. OAuth identities are never merged automatically with an existing email account; users must authenticate to the existing account and link the provider from `/account`.

## Environment

Copy [`.env.example`](.env.example) to `.env` locally (never commit `.env`):

```env
MONGODB_URI="mongodb://127.0.0.1:27017"
MONGODB_DATABASE="luro-ai"
MONGODB_MAX_POOL_SIZE="10"
MONGODB_MIN_POOL_SIZE="0"
MONGODB_SERVER_SELECTION_TIMEOUT_MS="10000"
APP_URL="http://localhost:3000"
AUTH_SECRET="at-least-32-random-characters"
AUTH_EMAIL_PASSWORD_ENABLED="true"
# Optional provider pairs
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
APPLE_CLIENT_ID="..."
APPLE_TEAM_ID="..."
APPLE_KEY_ID="..."
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----"
# Gmail SMTP email delivery. Use a Google App Password, never the account password.
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="muhammadhasaanm546@gmail.com"
SMTP_PASS="your-google-app-password"
EMAIL_FROM="muhammadhasaanm546@gmail.com"
```

Production requires a randomly generated `AUTH_SECRET`, HTTPS `APP_URL`, HTTPS-only cookies, a real email delivery integration, and provider credentials. Missing or partial provider configuration is rejected. Token values are sent only to the configured mailer integration and are not logged or stored in plaintext.

## Gmail SMTP with Nodemailer

Install the package with the exact command:

```bash
npm install nodemailer
```

The credential-free template is in [`.env.example`](.env.example). Copy it to `.env`, then set `SMTP_PASS` to the Google App Password created for `muhammadhasaanm546@gmail.com`. Do not paste the App Password into source code, logs, documentation, or version control. The required ignore rule is:

```gitignore
.env*
!.env.example
```

Gmail supports both SMTP ports. Use port `465` with `SMTP_SECURE="true"` for implicit TLS, as shown above, or port `587` with `SMTP_SECURE="false"` to connect with STARTTLS. Do not set `secure` to `true` on port 587. The server-side transporter, verification call, and complete `sendMail` example are in [`src/lib/mailer.ts`](src/lib/mailer.ts).

Use [`verifyMailConnection()`](src/lib/mailer.ts:55) during a health check or startup check, and [`sendExampleEmail()`](src/lib/mailer.ts:65) only as a test/example. Import this module only from server-side code; it is protected by `server-only`.

### Gmail troubleshooting

- **Authentication failed / `535`:** confirm the Gmail address is the full account address, 2-Step Verification is enabled, `SMTP_PASS` is the generated 16-character App Password (spaces may be removed), and the App Password was not revoked. Never use the normal Gmail password.
- **Connection timeout / `ETIMEDOUT`:** verify outbound SMTP is permitted by the host, DNS resolves `smtp.gmail.com`, and the selected port is not blocked. Try port 587 with STARTTLS if port 465 is filtered.
- **TLS or certificate errors:** use `smtp.gmail.com`, keep TLS certificate validation enabled, and ensure the runtime clock and Node.js installation are current.
- **Gmail policy or rate limits:** check Google Account security alerts, Workspace administrator SMTP restrictions, sending quotas, and account recovery/security settings.

## MongoDB and local workflow

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```

MongoDB collections and Mongoose indexes are created automatically when the application first connects. The connection uses bounded pooling, startup validation, redacted connection failures, cached serverless connections, and graceful process shutdown. Use a replica set or sharded cluster in production because account deletion and OAuth account creation use transactions. Use backups, encrypted transport, and least-privilege credentials.

All backend bodies, route parameters, query values, identifiers, and configuration values are validated with Joi. Unknown body fields are rejected, Mongoose strict query handling and filter sanitization are enabled, and database filters are constructed exclusively from validated scalar values.

## Data migration

No legacy database schema, migration, seed, fixture, source connection configuration, or legacy data file is present in this repository, so there is no source dataset that can be migrated safely from application code. Before deploying over an environment that has data in another system, export and retain an encrypted backup, implement a source-specific one-time importer outside the application runtime, verify per-collection counts and uniqueness constraints in a staging replica set, and only then switch traffic. Do not delete the source backup until the retention and rollback window has elapsed. The application runtime and manifest intentionally contain MongoDB/Mongoose only.

## Provider-console setup

### Google

Create an OAuth web application in Google Cloud Console. Add the exact local origin `http://localhost:3000` and production origin `https://YOUR_DOMAIN` as authorized JavaScript origins. Add the exact redirect URIs:

- `http://localhost:3000/api/auth/oauth/google/callback`
- `https://YOUR_DOMAIN/api/auth/oauth/google/callback`

Put the web client ID and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Enable the OpenID Connect scopes `openid`, `email`, and `profile`. Do not use wildcard redirect URIs.

### Apple

In Apple Developer, create or select an App ID with Sign in with Apple enabled, then create a Services ID for the web client. Configure the Services ID return URLs exactly as:

- `http://localhost:3000/api/auth/oauth/apple/callback` (only where Apple permits local development)
- `https://YOUR_DOMAIN/api/auth/oauth/apple/callback`

Configure verified domains for production, including the domain used by `APP_URL`. Create a Sign in with Apple key and store its Team ID, Key ID, and PEM private key in `APPLE_TEAM_ID`, `APPLE_KEY_ID`, and `APPLE_PRIVATE_KEY`. The server generates a short-lived client-secret JWT and never exposes the PEM key. Rotate the Apple key and deploy the new environment value before expiry. Apple may return private relay addresses; register and monitor Apple’s private-email relay configuration and send mail only from an approved sender/domain.

## Security and verification checklist

- Session and CSRF cookies are HttpOnly where appropriate, SameSite Lax, Secure in production, and bearer values are stored only as SHA-256 hashes.
- Session identifiers rotate after signup, login, OAuth authentication, and password changes. Current/all-session logout revokes database records.
- State-changing API routes require the CSRF token from the non-HttpOnly CSRF cookie in `x-csrf-token`.
- Recovery responses are generic, one-time tokens are hashed and expiring, and password changes revoke other sessions.
- Login, registration, recovery, and OAuth attempts use MongoDB-backed rate limits and security audit events.
- Account deletion cascades identities, sessions, challenges, and tokens; the final usable sign-in method cannot be removed.
- Test successful/failed credentials, duplicate and concurrent registration, OAuth cancellation/state/nonce/JWKS failures, callback collisions, CSRF, session rotation/revocation, verification, recovery expiry, linking/unlinking, protected redirects, rate limits, and deletion before production rollout.
