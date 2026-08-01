-- CreateTable
CREATE TABLE "ProviderIdentity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "providerSubject" TEXT NOT NULL,
    "providerEmail" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "displayName" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProviderIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OAuthChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stateHash" TEXT NOT NULL,
    "nonceHash" TEXT NOT NULL,
    "codeVerifier" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "returnTo" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OAuthChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" DATETIME NOT NULL,
    "blockedUntil" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "event" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "ipAddressHash" TEXT,
    "userAgent" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "csrfTokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "idleExpiresAt" DATETIME NOT NULL,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authenticatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME,
    "userAgent" TEXT,
    "ipAddressHash" TEXT,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- Existing sessions cannot safely acquire CSRF and idle-expiry secrets; force reauthentication.
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_revokedAt_idx" ON "Session"("userId", "revokedAt");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
CREATE INDEX "Session_idleExpiresAt_idx" ON "Session"("idleExpiresAt");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL DEFAULT '',
    "lastName" TEXT NOT NULL DEFAULT '',
    "emailVerifiedAt" DATETIME,
    "passwordHash" TEXT,
    "passwordChangedAt" DATETIME,
    "lastAuthenticatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "firstName", "id", "lastName", "passwordHash", "updatedAt") SELECT "createdAt", "email", "firstName", "id", "lastName", "passwordHash", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ProviderIdentity_userId_idx" ON "ProviderIdentity"("userId");

-- CreateIndex
CREATE INDEX "ProviderIdentity_provider_providerEmail_idx" ON "ProviderIdentity"("provider", "providerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderIdentity_provider_providerSubject_key" ON "ProviderIdentity"("provider", "providerSubject");

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_tokenHash_key" ON "AuthToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AuthToken_userId_purpose_idx" ON "AuthToken"("userId", "purpose");

-- CreateIndex
CREATE INDEX "AuthToken_expiresAt_idx" ON "AuthToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthChallenge_stateHash_key" ON "OAuthChallenge"("stateHash");

-- CreateIndex
CREATE INDEX "OAuthChallenge_expiresAt_idx" ON "OAuthChallenge"("expiresAt");

-- CreateIndex
CREATE INDEX "OAuthChallenge_userId_idx" ON "OAuthChallenge"("userId");

-- CreateIndex
CREATE INDEX "RateLimitBucket_windowStart_idx" ON "RateLimitBucket"("windowStart");

-- CreateIndex
CREATE INDEX "RateLimitBucket_blockedUntil_idx" ON "RateLimitBucket"("blockedUntil");

-- CreateIndex
CREATE INDEX "AuditEvent_userId_createdAt_idx" ON "AuditEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_event_createdAt_idx" ON "AuditEvent"("event", "createdAt");

