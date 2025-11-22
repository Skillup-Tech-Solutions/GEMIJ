# Complete API Documentation

> **Base URL**: `/api` (unless otherwise noted)
> 
> **Server**: Running on port 5000 (default)
> 
> **Health Check**: `GET /api/health`

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Submissions](#submissions)
3. [Editor](#editor)
4. [Reviews](#reviews)
5. [Public](#public)
6. [Admin](#admin)
7. [Payments](#payments)
8. [Notifications](#notifications)
9. [Publication](#publication)
10. [Feeds](#feeds)

---

## Authentication

**Base Path**: `/api/auth`

| Method | Endpoint | Description | Auth Required | Request Body |
|--------|----------|-------------|---------------|--------------|
| POST | `/register` | Register a new user with hCaptcha verification | ❌ | `{ email, password, firstName, lastName, affiliation, captchaToken }` |
| POST | `/login` | Login user with hCaptcha verification | ❌ | `{ email, password, captchaToken }` |
| GET | `/profile` | Get current user profile | ✅ | - |
| PUT | `/profile` | Update current user profile | ✅ | `{ firstName, lastName, affiliation, bio, orcid }` |
| POST | `/forgot-password` | Request password reset email | ❌ | `{ email }` |
| POST | `/reset-password` | Reset password with token | ❌ | `{ token, password }` |

---

## Submissions

**Base Path**: `/api/submissions`  
**Authentication**: Required for all endpoints

| Method | Endpoint | Description | Additional Notes |
|--------|----------|-------------|------------------|
| POST | `/` | Create a new submission | Creates draft submission |
| GET | `/` | Get all submissions for the user | Supports pagination & filtering |
| GET | `/:id` | Get a specific submission | Includes files, reviews, revisions |
| PUT | `/:id` | Update a submission | Only for DRAFT status |
| POST | `/:id/submit` | Submit a submission for review | Changes status to SUBMITTED |
| POST | `/:id/withdraw` | Withdraw a submission | Changes status to WITHDRAWN |
| POST | `/:id/revisions` | Create a revision | For REVISION_REQUIRED status |
| POST | `/:id/revisions/:revisionId/files` | Upload revision files | Multipart form data |
| POST | `/:id/proof-approval` | Approve proof | Author approves final proof |
| POST | `/:id/files` | Upload submission files | Multipart form data, uploads to B2 |
| DELETE | `/:id/files/:fileId` | Delete a submission file | Only for DRAFT/REVISION_REQUIRED |
| GET | `/:id/files/:fileId/download` | Download a submission file | Returns authorized B2 URL |

---

## Editor

**Base Path**: `/api/editor`  
**Authentication**: Required (Editor or Admin role)

### Submission Management

| Method | Endpoint | Description | Admin Only |
|--------|----------|-------------|------------|
| GET | `/submissions` | Get submissions assigned to editor | ❌ |
| GET | `/submissions/revised` | Get revised submissions | ❌ |
| GET | `/submissions/:submissionId` | Get submission details for editor | ❌ |
| GET | `/submissions/:submissionId/reviews` | Get reviews for a submission | ❌ |
| GET | `/submissions/:submissionId/available-reviewers` | Get available reviewers | ❌ |
| GET | `/submissions/:submissionId/timeline` | Get submission timeline | ❌ |
| POST | `/submissions/:submissionId/assign-editor` | Assign editor to submission | ✅ |
| POST | `/submissions/:submissionId/screen` | Perform initial screening | ❌ |
| POST | `/submissions/:submissionId/accept-handling` | Accept handling of submission | ❌ |
| POST | `/submissions/:submissionId/decline-handling` | Decline handling of submission | ❌ |
| PUT | `/submissions/:submissionId/status` | Update submission status | ❌ |

### Review Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/submissions/:submissionId/assign-reviewer` | Assign/invite reviewer |
| POST | `/submissions/:submissionId/invite-reviewer` | Invite a reviewer (same as assign) |
| POST | `/reviews/:reviewId/remind` | Send reviewer reminder |
| PUT | `/reviews/:reviewId/extend-deadline` | Extend review deadline |
| DELETE | `/submissions/:submissionId/reviews/:reviewId` | Remove reviewer |

### Decision & Workflow

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/submissions/:submissionId/decision` | Make editorial decision (ACCEPT/REJECT/REVISION) |
| POST | `/submissions/:submissionId/request-revision` | Request revision from author |
| POST | `/submissions/:submissionId/handle-revision` | Handle submitted revision |
| POST | `/submissions/:submissionId/send-decision` | Send decision letter to author |
| POST | `/submissions/:submissionId/send-email` | Send custom email |

### Production & Publishing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/submissions/:submissionId/production` | Move to production |
| POST | `/submissions/:submissionId/assign-doi` | Assign DOI to submission |
| POST | `/submissions/:submissionId/publish` | Publish submission |
| POST | `/submissions/:submissionId/plagiarism-check` | Run plagiarism check |
| POST | `/submissions/:submissionId/quality-check` | Perform quality check |

### Statistics & Lists

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Get editor statistics |
| GET | `/reviews/overdue` | Get overdue reviews |
| GET | `/reviewers` | Get all reviewers |
| GET | `/issues` | Get issues |
| POST | `/issues` | Create an issue (Admin only) |
| POST | `/issues/:issueId/articles` | Add article to issue |

---

## Reviews

**Base Path**: `/api/reviews`  
**Authentication**: Required (Reviewer, Editor, or Admin role)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/` | Get review invitations | - |
| GET | `/invitations` | Get review invitations (same as above) | - |
| GET | `/invitations/pending` | Get pending invitations | - |
| GET | `/pending` | Get pending reviews | - |
| GET | `/completed` | Get completed reviews | - |
| GET | `/stats` | Get review statistics | - |
| GET | `/history` | Get review history | - |
| GET | `/:reviewId` | Get review details | - |
| GET | `/:reviewId/certificate` | Generate review certificate (PDF) | - |
| POST | `/:reviewId/respond` | Respond to invitation | `{ accept: boolean }` |
| POST | `/invitations/:invitationId/accept` | Accept invitation | - |
| POST | `/invitations/:invitationId/decline` | Decline invitation | `{ reason: string }` |
| PUT | `/:reviewId` | Update review | Review data |
| POST | `/:reviewId/submit` | Submit review | `{ recommendation, confidentialComments, authorComments, rating }` |

---

## Public

**Base Path**: `/api/public`  
**Authentication**: Not required

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/current-issue` | Get current issue | - |
| GET | `/archive` | Get archive of all issues | - |
| GET | `/issues/:volume/:number` | Get specific issue | - |
| GET | `/articles/doi/:doi(*)` | Get article by DOI | DOI can contain slashes |
| GET | `/articles/doi/:doi(*)/download` | Download article by DOI | - |
| GET | `/articles/:id` | Get article by ID | - |
| GET | `/articles/:id/download` | Download article by ID | - |
| GET | `/search` | Search articles | `q` (query), `page`, `limit` |
| GET | `/stats` | Get journal statistics | - |
| GET | `/landing-page-config` | Get landing page configuration | - |
| GET | `/settings` | Get public settings | - |
| GET | `/page-content/:slug` | Get page content by slug | Slugs: mission, vision, about, etc. |

---

## Admin

**Base Path**: `/api/admin`  
**Authentication**: Required (Admin role only)

### Dashboard & Statistics

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/stats` | Get admin dashboard statistics | - |
| GET | `/stats/submissions` | Get submission statistics | `period` (MONTHLY/YEARLY) |
| GET | `/stats/users` | Get user activity statistics | - |
| GET | `/stats/financial` | Get financial statistics | `period` (MONTHLY/YEARLY) |
| GET | `/system/health` | Get system health status | - |

### Payment Management

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/payments` | Get all payments | `status`, `page`, `limit` |
| GET | `/payments/:paymentId` | Get payment details | - |
| PUT | `/payments/:paymentId/paid` | Mark payment as paid | - |

### User Management

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/users` | Get all users | Query: `role`, `page`, `limit` |
| PUT | `/users/:id/role` | Update user role | `{ role: 'AUTHOR' \| 'REVIEWER' \| 'EDITOR' \| 'ADMIN' }` |

### Settings Management

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/settings` | Get system settings | - |
| PUT | `/settings` | Update system settings | Settings object |
| POST | `/settings/payment-qr` | Upload payment QR code | Multipart form data |
| PUT | `/landing-page-config` | Update landing page configuration | Config object |

### Issue & Conference Management

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/issues` | Get all issues | - |
| POST | `/issues` | Create issue | `{ volume, number, year, title, description }` |
| PUT | `/issues/:id` | Update issue | Issue data |
| POST | `/issues/:id/set-current` | Set current issue | - |
| DELETE | `/issues/:id` | Delete issue | - |
| GET | `/conferences` | Get conferences | - |
| POST | `/conferences` | Create conference | `{ name, proceedingsNo, category, description, year }` |
| PUT | `/conferences/:id` | Update conference | Conference data |
| DELETE | `/conferences/:id` | Delete conference | - |

### Page Content Management

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/page-content` | Get all page content | - |
| PUT | `/page-content/:slug` | Update page content | `{ content: string }` |

---

## Payments

**Base Path**: `/api/payments`

| Method | Endpoint | Description | Auth Required | Request Body |
|--------|----------|-------------|---------------|--------------|
| POST | `/webhook` | Handle Stripe webhook | ❌ | Raw JSON |
| POST | `/submissions/:submissionId/payment-intent` | Create payment intent | ✅ | - |
| POST | `/submissions/:submissionId/proof` | Upload payment proof | ✅ | Multipart form data |
| POST | `/payments/:paymentId/confirm` | Confirm payment | ✅ | `{ paymentIntentId }` |
| GET | `/submissions/:submissionId/payment-status` | Get payment status | ✅ | - |
| GET | `/:paymentId` | Get payment details | ✅ | - |
| GET | `/history` | Get payment history | ✅ | - |

---

## Notifications

**Base Path**: `/api/notifications`  
**Authentication**: Required

| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/` | Get notifications | `limit`, `unreadOnly` |
| PUT | `/:notificationId/read` | Mark notification as read | - |
| PUT | `/read-all` | Mark all notifications as read | - |
| DELETE | `/:notificationId` | Delete notification | - |

---

## Publication

**Base Path**: `/api/publication`  
**Authentication**: Required (Admin role only)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/ready` | Get submissions ready to publish | - |
| GET | `/destinations` | Get publication destinations (issues/conferences) | - |
| GET | `/preview/:id` | Get publication preview | - |
| POST | `/publish/:id` | Publish article | `{ destinationType, destinationId, doi, pages }` |
| POST | `/unpublish/:id` | Unpublish article (rollback) | - |

---

## Feeds

**Base Path**: `/feeds` (not `/api/feeds`)

| Method | Endpoint | Description | Auth Required | Query Parameters |
|--------|----------|-------------|---------------|------------------|
| GET | `/sitemap.xml` | Get XML sitemap | ❌ | - |
| GET | `/rss` | Get RSS feed | ❌ | `limit` (default: 50) |
| GET | `/oai` | Get OAI-PMH feed | ❌ | `verb`, `identifier`, `metadataPrefix`, `from`, `until`, `set`, `resumptionToken` |
| POST | `/regenerate` | Regenerate all feeds | ✅ (Admin) | - |

---

## Health Check

**Endpoint**: `GET /api/health`  
**Authentication**: Not required

**Response**:
```json
{
  "success": true,
  "message": "Academic Journal API is running",
  "timestamp": "2025-11-22T15:31:51.123Z",
  "version": "1.0.0"
}
```

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained from the `/api/auth/login` or `/api/auth/register` endpoints.

---

## Rate Limiting

- **Window**: 15 minutes (configurable via `RATE_LIMIT_WINDOW_MS`)
- **Max Requests**: 10,000 per window (configurable via `RATE_LIMIT_MAX_REQUESTS`)
- **Disabled in**: Development mode

---

## File Storage

All file uploads are stored in **Backblaze B2** cloud storage. Download endpoints return authorized URLs valid for 1 hour.

---

## Total Endpoints: **130+**
