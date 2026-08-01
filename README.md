# Luro AI Authentication

Luro owns authentication and persists only hashed bearer/session and one-time token values. Passwords use Argon2id. OAuth uses server-side Authorization Code exchange, PKCE for Google, state and nonce challenge records, provider JWKS verification, exact callback URLs, and verified provider email checks. OAuth identities are never merged automatically with an existing email account; users must authenticate to the existing account and link the provider from `/account`.

## Environment

Create `.env` locally (never commit it):

```env
MONGODB_URI="mongodb://127.0.0.1:27017"
MONGODB_DATABASE="luro-ai"
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
# Optional email delivery webhook used by the token routes
EMAIL_WEBHOOK_URL="https://mailer.example.com/auth-events"
EMAIL_WEBHOOK_SECRET="at-least-16-random-characters"
EMAIL_FROM="security@example.com"
```

Production requires a randomly generated `AUTH_SECRET`, HTTPS `APP_URL`, HTTPS-only cookies, a real email delivery integration, and provider credentials. Missing or partial provider configuration is rejected. Token values are sent only to the configured mailer webhook and are not logged or stored in plaintext.

## MongoDB and local workflow

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```

MongoDB collections and indexes are created automatically when the application first connects. Use a production MongoDB deployment with backups, encrypted transport, and restricted credentials.

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
